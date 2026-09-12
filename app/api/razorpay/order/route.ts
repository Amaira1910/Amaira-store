/* POST /api/razorpay/order

   Prices the bag on the server, reserves the stock, opens a Razorpay order for
   exactly that amount, and records it. Stock is held from this moment so two
   customers cannot buy the same last unit; the hold expires if the payment is
   abandoned. */
import { NextResponse } from "next/server";
import { priceBag } from "@/lib/pricing";
import { createOrder } from "@/lib/db/orders";
import {
  StockError, releaseExpiredReservations, releaseReservation, reserveStock,
} from "@/lib/db/inventory";
import { createOrder as createRazorpayOrder, getConfig, newReceiptId } from "@/lib/razorpay";
import { toPaise } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[6-9]\d{9}$/;
const PINCODE = /^[1-9]\d{5}$/;
const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]Z[A-Z\d]$/;

function bad(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

function str(v: unknown, max = 120): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const cfg = getConfig();
  if (!cfg) {
    return bad(
      "Online payment is not switched on yet. Please call the store on +91 99003 30022 and we will take the order over the phone.",
      503,
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad("We could not read that request.");
  }

  /* --- contact ---------------------------------------------------------- */
  const contactIn = (payload.contact ?? {}) as Record<string, unknown>;
  const contact = {
    firstName: str(contactIn.firstName, 60),
    lastName: str(contactIn.lastName, 60),
    email: str(contactIn.email, 160).toLowerCase(),
    phone: str(contactIn.phone, 20).replace(/\D/g, "").slice(-10),
  };
  if (!contact.firstName) return bad("Please tell us your first name.");
  if (!EMAIL.test(contact.email)) return bad("That email address does not look right.");
  if (!PHONE.test(contact.phone)) return bad("Please enter a 10-digit Indian mobile number.");

  /* --- fulfilment ------------------------------------------------------- */
  const fulfilment = payload.fulfilment === "pickup" ? "pickup" : "delivery";
  let address: { line1: string; line2: string; city: string; state: string; pincode: string } | undefined;

  if (fulfilment === "delivery") {
    const a = (payload.address ?? {}) as Record<string, unknown>;
    address = {
      line1: str(a.line1, 120),
      line2: str(a.line2, 120),
      city: str(a.city, 60),
      state: str(a.state, 60),
      pincode: str(a.pincode, 6),
    };
    if (!address.line1) return bad("Please enter a delivery address.");
    if (!address.city) return bad("Please enter a city.");
    if (!address.state) return bad("Please choose a state.");
    if (!PINCODE.test(address.pincode)) return bad("Please enter a valid 6-digit PIN code.");
  }

  const gstin = str(payload.gstin, 15).toUpperCase();
  if (gstin && !GSTIN.test(gstin)) {
    return bad("That GSTIN does not look valid. Leave it blank if you do not need a business invoice.");
  }

  /* --- money: recomputed here, never taken from the client -------------- */
  const priced = priceBag(payload.lines);
  if (!priced.ok) return bad(priced.error ?? "We could not price that bag.");
  if (priced.total <= 0) return bad("That order comes to nothing payable.");

  const receiptId = newReceiptId();

  /* --- stock: held before we ever ask for money ------------------------- */
  releaseExpiredReservations();
  try {
    reserveStock(receiptId, priced.lines.map((l) => ({ skuCode: l.skuCode, qty: l.qty })));
  } catch (err) {
    if (err instanceof StockError) {
      return bad(err.message, 409, { skuCode: err.skuCode, available: err.available });
    }
    console.error("[order] reservation failed", err);
    return bad("We could not confirm stock for that order. Please try again, or call the store.", 500);
  }

  /* --- gateway ---------------------------------------------------------- */
  try {
    const rzp = await createRazorpayOrder(cfg, {
      amountPaise: toPaise(priced.total),
      receipt: receiptId,
      notes: {
        receiptId,
        customer: `${contact.firstName} ${contact.lastName}`.trim(),
        phone: contact.phone,
        fulfilment,
        items: priced.lines.map((l) => `${l.qty}× ${l.name}`).join(", ").slice(0, 480),
      },
    });

    createOrder({
      receiptId,
      razorpayOrderId: rzp.id,
      contact,
      fulfilment,
      address,
      gstin: gstin || undefined,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
      items: priced.lines.map((l) => ({
        skuCode: l.skuCode,
        skuId: l.skuId,
        productSlug: l.slug,
        name: l.name,
        variantLabel: l.variantLabel,
        unitPrice: l.unitPrice,
        carePrice: l.care,
        qty: l.qty,
        lineTotal: l.lineTotal,
        hsn: l.hsn,
        gstRate: l.gstRate,
        engraving: l.engraving,
      })),
    });

    return NextResponse.json({
      ok: true,
      receiptId,
      orderId: rzp.id,
      amount: rzp.amount,
      currency: rzp.currency,
      keyId: cfg.keyId,
      lines: priced.lines,
      total: priced.total,
    });
  } catch (err) {
    // The gateway never opened, so give the stock straight back.
    releaseReservation(receiptId);
    console.error("[razorpay] order creation failed", err);
    return bad("We could not reach the payment gateway. Please try again, or call the store.", 502);
  }
}
