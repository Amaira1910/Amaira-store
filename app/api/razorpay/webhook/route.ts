/* POST /api/razorpay/webhook — Razorpay's own account of what happened.

   Configure at Razorpay Dashboard → Settings → Webhooks:
     URL     https://<your-domain>/api/razorpay/webhook
     Events  payment.captured, payment.failed, order.paid, refund.processed

   This is the durable path. If the customer closes the tab mid-payment, the
   browser never calls /verify and this is the only notification you get — so
   it must commit stock and issue the invoice exactly as /verify does.

   The signature is computed over the RAW body, so this route reads text() and
   must not let anything re-serialise the JSON first. */
import { NextResponse } from "next/server";
import { getOrderByRazorpayId, markFailed, markPaid, markRefunded } from "@/lib/db/orders";
import { getConfig, verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cfg = getConfig();
  if (!cfg?.webhookSecret) {
    console.warn("[razorpay] webhook received but RAZORPAY_WEBHOOK_SECRET is unset");
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!signature || !verifyWebhookSignature(cfg.webhookSecret, raw, signature)) {
    console.warn("[razorpay] webhook signature rejected");
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: Record<string, unknown> }; order?: { entity?: Record<string, unknown> } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = String(payment?.order_id ?? event.payload?.order?.entity?.id ?? "");
  if (!razorpayOrderId) return NextResponse.json({ ok: true, note: "no order id in event" });

  const order = getOrderByRazorpayId(razorpayOrderId);
  if (!order) {
    // Not ours. Acknowledge so Razorpay stops retrying.
    console.warn("[razorpay] webhook for unknown order", razorpayOrderId, event.event);
    return NextResponse.json({ ok: true, note: "unknown order" });
  }

  switch (event.event) {
    case "payment.captured":
    case "order.paid":
      markPaid(order.receipt_id, String(payment?.id ?? order.razorpay_payment_id ?? ""), "webhook");
      break;
    case "payment.failed":
      markFailed(order.receipt_id, String(payment?.error_description ?? "payment_failed"));
      break;
    case "refund.processed":
      markRefunded(order.receipt_id);
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
