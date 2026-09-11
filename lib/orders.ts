/* ==========================================================================
   Order store.

   ⚠️  THIS IS AN IN-MEMORY STORE. It is correct for local development and for
   a single always-on server, and it LOSES EVERY ORDER on restart or on a
   serverless cold start.

   Before taking real money, replace the three functions below with a database
   (Postgres via Prisma, Supabase, PlanetScale, Firestore — anything durable).
   Nothing else in the app needs to change: every call site goes through this
   interface. The webhook route is the one that must be durable, because it is
   the only notification you get if the customer closes the tab mid-payment.
   ========================================================================== */
import type { PricedLine } from "@/lib/pricing";

export type OrderStatus = "created" | "paid" | "failed" | "refunded";

export interface StoredOrder {
  receiptId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: OrderStatus;
  amount: number; // rupees
  lines: PricedLine[];
  contact: { firstName: string; lastName: string; email: string; phone: string };
  fulfilment: "delivery" | "pickup";
  address?: { line1: string; line2: string; city: string; state: string; pincode: string };
  gstin?: string;
  createdAt: string;
  paidAt?: string;
  failureReason?: string;
}

const orders = new Map<string, StoredOrder>();
/** Secondary index, because webhooks arrive keyed by Razorpay's id, not ours. */
const byRazorpayId = new Map<string, string>();

export async function saveOrder(order: StoredOrder): Promise<void> {
  orders.set(order.receiptId, order);
  byRazorpayId.set(order.razorpayOrderId, order.receiptId);
}

export async function getOrder(receiptId: string): Promise<StoredOrder | undefined> {
  return orders.get(receiptId);
}

export async function getOrderByRazorpayId(razorpayOrderId: string): Promise<StoredOrder | undefined> {
  const receiptId = byRazorpayId.get(razorpayOrderId);
  return receiptId ? orders.get(receiptId) : undefined;
}

export async function updateOrder(
  receiptId: string,
  patch: Partial<StoredOrder>,
): Promise<StoredOrder | undefined> {
  const existing = orders.get(receiptId);
  if (!existing) return undefined;
  const next = { ...existing, ...patch };
  orders.set(receiptId, next);
  return next;
}
