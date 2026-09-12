/* POST /api/razorpay/verify — confirm the signature Checkout handed back.

   This is what lets the browser show a confirmation; the webhook is what makes
   the record durable. Both run, both are idempotent, and neither trusts the
   other. */
import { NextResponse } from "next/server";
import { getOrderByReceipt, markFailed, markPaid } from "@/lib/db/orders";
import { getConfig, verifyPaymentSignature } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cfg = getConfig();
  if (!cfg) return NextResponse.json({ ok: false, error: "Payments are not configured." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");
  const receiptId = String(body.receiptId ?? "");

  if (!orderId || !paymentId || !signature || !receiptId) {
    return NextResponse.json({ ok: false, error: "Missing payment details." }, { status: 400 });
  }

  if (!verifyPaymentSignature(cfg, { orderId, paymentId, signature })) {
    console.warn("[razorpay] signature mismatch", { orderId, paymentId, receiptId });
    markFailed(receiptId, "signature_mismatch");
    return NextResponse.json(
      { ok: false, error: "We could not verify that payment. If money has left your account, call us and we will sort it out." },
      { status: 400 },
    );
  }

  const order = getOrderByReceipt(receiptId);
  if (!order || order.razorpay_order_id !== orderId) {
    return NextResponse.json({ ok: false, error: "We cannot find that order." }, { status: 404 });
  }

  // Commits the reserved stock and issues the GST invoice.
  const result = markPaid(receiptId, paymentId, "checkout");

  return NextResponse.json({ ok: true, receiptId, status: "paid", invoiceNo: result?.invoiceNo ?? null });
}
