/* ==========================================================================
   Razorpay, over the REST API with `fetch`.

   Deliberately no SDK: the three calls this store makes (create order, verify
   a payment signature, verify a webhook signature) are a few lines each, and
   skipping the dependency keeps the server bundle small and the supply chain
   short.

   Docs: https://razorpay.com/docs/api/orders/
   ========================================================================== */
import crypto from "node:crypto";

/* Overridable so the order flow can be exercised against a mock gateway in
   tests. Leave unset in every real environment. */
const API = process.env.RAZORPAY_API_BASE ?? "https://api.razorpay.com/v1";

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

/** Returns null when the gateway has not been configured yet. */
export function getConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret, webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET };
}

export function isLiveMode(cfg: RazorpayConfig): boolean {
  return cfg.keyId.startsWith("rzp_live_");
}

function authHeader(cfg: RazorpayConfig): string {
  return "Basic " + Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString("base64");
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export async function createOrder(
  cfg: RazorpayConfig,
  input: { amountPaise: number; receipt: string; notes?: Record<string, string> },
): Promise<RazorpayOrder> {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader(cfg) },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes ?? {},
      payment_capture: 1,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${body.slice(0, 400)}`);
  }
  return (await res.json()) as RazorpayOrder;
}

/**
 * Checkout hands back order_id, payment_id and a signature. The signature is
 * HMAC-SHA256 of "order_id|payment_id" keyed with the API secret — so only a
 * response that really came from Razorpay can pass.
 */
export function verifyPaymentSignature(
  cfg: RazorpayConfig,
  input: { orderId: string; paymentId: string; signature: string },
): boolean {
  const expected = crypto
    .createHmac("sha256", cfg.keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, input.signature);
}

/** Webhooks are signed with the webhook secret over the exact raw body. */
export function verifyWebhookSignature(secret: string, rawBody: string, signature: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signature);
}

/** Constant-time compare, so a wrong signature leaks nothing through timing. */
function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** AMR-2026-000123 — human-readable, sortable, and unique enough for a receipt. */
export function newReceiptId(): string {
  const year = new Date().getFullYear();
  const n = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  return `AMR-${year}-${n}`;
}
