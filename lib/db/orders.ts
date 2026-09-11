/* ==========================================================================
   Orders — durable, replacing the in-memory store this app started with.

   The payment lifecycle:
     create  → stock reserved, order 'pending'
     paid    → reservation committed to a real stock movement, invoice issued
     failed  → reservation released, stock back on the shelf
   Every transition is idempotent, because Razorpay's webhook can fire twice
   and the browser's verify call can race it.
   ========================================================================== */
import { getDb, tx } from "./client";
import { commitReservation, releaseReservation } from "./inventory";
import { issueInvoiceForOrder } from "./invoices";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";
export type FulfilmentStatus = "awaiting" | "packed" | "dispatched" | "delivered" | "collected";

export interface OrderItemRow {
  id: number;
  order_id: number;
  sku_id: number | null;
  sku_code: string;
  product_slug: string;
  name: string;
  variant_label: string | null;
  unit_price: number;
  care_price: number;
  qty: number;
  line_total: number;
  hsn: string;
  gst_rate: number;
  engraving: string | null;
}

export interface OrderRow {
  id: number;
  receipt_id: string;
  customer_id: number | null;
  status: OrderStatus;
  fulfilment: "delivery" | "pickup";
  fulfilment_status: FulfilmentStatus;
  channel: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  contact_first_name: string;
  contact_last_name: string | null;
  contact_email: string;
  contact_phone: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstin: string | null;
  place_of_supply: string;
  failure_reason: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface CreateOrderInput {
  receiptId: string;
  razorpayOrderId: string | null;
  channel?: "online" | "counter";
  contact: { firstName: string; lastName: string; email: string; phone: string };
  fulfilment: "delivery" | "pickup";
  address?: { line1: string; line2: string; city: string; state: string; pincode: string };
  gstin?: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: {
    skuCode: string;
    skuId: number | null;
    productSlug: string;
    name: string;
    variantLabel: string | null;
    unitPrice: number;
    carePrice: number;
    qty: number;
    lineTotal: number;
    hsn: string;
    gstRate: number;
    engraving?: string;
  }[];
}

export function createOrder(input: CreateOrderInput): OrderRow {
  return tx((conn) => {
    // Upsert the customer so repeat buyers build a history.
    let customerId: number | null = null;
    if (input.contact.email) {
      const existing = conn.prepare(`SELECT id FROM customers WHERE email = ?`).get(input.contact.email) as
        | { id: number }
        | undefined;
      if (existing) {
        customerId = existing.id;
        conn.prepare(
          `UPDATE customers SET phone = ?, first_name = ?, last_name = ?, gstin = COALESCE(?, gstin),
           updated_at = datetime('now') WHERE id = ?`,
        ).run(input.contact.phone, input.contact.firstName, input.contact.lastName, input.gstin ?? null, existing.id);
      } else {
        const info = conn
          .prepare(`INSERT INTO customers (email, phone, first_name, last_name, gstin) VALUES (?, ?, ?, ?, ?)`)
          .run(input.contact.email, input.contact.phone, input.contact.firstName, input.contact.lastName, input.gstin ?? null);
        customerId = Number(info.lastInsertRowid);
      }
    }

    // Pickup is always supplied in Karnataka; delivery follows the address.
    const placeOfSupply =
      input.fulfilment === "pickup" ? "Karnataka" : input.address?.state ?? "Karnataka";

    const info = conn
      .prepare(
        `INSERT INTO orders (
           receipt_id, customer_id, status, fulfilment, channel, subtotal, shipping, total,
           razorpay_order_id, contact_first_name, contact_last_name, contact_email, contact_phone,
           address_line1, address_line2, city, state, pincode, gstin, place_of_supply
         ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.receiptId, customerId, input.fulfilment, input.channel ?? "online",
        input.subtotal, input.shipping, input.total, input.razorpayOrderId,
        input.contact.firstName, input.contact.lastName, input.contact.email, input.contact.phone,
        input.address?.line1 ?? null, input.address?.line2 ?? null, input.address?.city ?? null,
        input.address?.state ?? null, input.address?.pincode ?? null,
        input.gstin ?? null, placeOfSupply,
      );

    const orderId = Number(info.lastInsertRowid);
    const insertItem = conn.prepare(
      `INSERT INTO order_items (order_id, sku_id, sku_code, product_slug, name, variant_label,
                                unit_price, care_price, qty, line_total, hsn, gst_rate, engraving)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const it of input.items) {
      insertItem.run(
        orderId, it.skuId, it.skuCode, it.productSlug, it.name, it.variantLabel,
        it.unitPrice, it.carePrice, it.qty, it.lineTotal, it.hsn, it.gstRate, it.engraving ?? null,
      );
    }

    return conn.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as OrderRow;
  });
}

export function getOrderByReceipt(receiptId: string): (OrderRow & { items: OrderItemRow[] }) | undefined {
  const db = getDb();
  const order = db.prepare(`SELECT * FROM orders WHERE receipt_id = ?`).get(receiptId) as OrderRow | undefined;
  if (!order) return undefined;
  const items = db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).all(order.id) as OrderItemRow[];
  return { ...order, items };
}

export function getOrderById(id: number): (OrderRow & { items: OrderItemRow[] }) | undefined {
  const db = getDb();
  const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id) as OrderRow | undefined;
  if (!order) return undefined;
  const items = db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).all(order.id) as OrderItemRow[];
  return { ...order, items };
}

export function getOrderByRazorpayId(razorpayOrderId: string): OrderRow | undefined {
  return getDb().prepare(`SELECT * FROM orders WHERE razorpay_order_id = ?`).get(razorpayOrderId) as
    | OrderRow
    | undefined;
}

/**
 * Confirms payment: commits the held stock and issues the tax invoice.
 * Returns the invoice number. Calling twice is harmless.
 */
export function markPaid(receiptId: string, paymentId: string, actor = "system"): { invoiceNo: string } | null {
  const db = getDb();
  const order = db.prepare(`SELECT * FROM orders WHERE receipt_id = ?`).get(receiptId) as OrderRow | undefined;
  if (!order) return null;

  if (order.status !== "paid") {
    db.prepare(
      `UPDATE orders SET status = 'paid', razorpay_payment_id = ?, paid_at = datetime('now'),
       updated_at = datetime('now') WHERE id = ?`,
    ).run(paymentId, order.id);
    commitReservation(receiptId, actor);
  }

  const invoice = issueInvoiceForOrder(order.id);
  return { invoiceNo: invoice.invoice_no };
}

export function markFailed(receiptId: string, reason: string): void {
  const db = getDb();
  const order = db.prepare(`SELECT id, status FROM orders WHERE receipt_id = ?`).get(receiptId) as
    | { id: number; status: OrderStatus }
    | undefined;
  if (!order || order.status === "paid") return; // never unwind a paid order here

  db.prepare(
    `UPDATE orders SET status = 'failed', failure_reason = ?, updated_at = datetime('now') WHERE id = ?`,
  ).run(reason.slice(0, 300), order.id);
  releaseReservation(receiptId);
}

export function markRefunded(receiptId: string): void {
  getDb()
    .prepare(`UPDATE orders SET status = 'refunded', updated_at = datetime('now') WHERE receipt_id = ?`)
    .run(receiptId);
}

export function setFulfilmentStatus(receiptId: string, status: FulfilmentStatus): void {
  getDb()
    .prepare(`UPDATE orders SET fulfilment_status = ?, updated_at = datetime('now') WHERE receipt_id = ?`)
    .run(status, receiptId);
}

export function listOrders(opts: { status?: OrderStatus; search?: string; limit?: number } = {}) {
  const where: string[] = ["1=1"];
  const args: (string | number)[] = [];
  if (opts.status) { where.push("o.status = ?"); args.push(opts.status); }
  if (opts.search) {
    where.push("(o.receipt_id LIKE ? OR o.contact_email LIKE ? OR o.contact_phone LIKE ? OR o.contact_first_name LIKE ?)");
    const q = `%${opts.search}%`;
    args.push(q, q, q, q);
  }
  return getDb()
    .prepare(
      `SELECT o.*, i.invoice_no,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
       FROM orders o LEFT JOIN invoices i ON i.order_id = o.id
       WHERE ${where.join(" AND ")}
       ORDER BY o.id DESC LIMIT ?`,
    )
    .all(...args, opts.limit ?? 100) as (OrderRow & { invoice_no: string | null; item_count: number })[];
}

/** Headline numbers for the admin dashboard. */
export function salesSummary() {
  const db = getDb();
  const today = db
    .prepare(
      `SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
       FROM orders WHERE status = 'paid' AND date(paid_at) = date('now')`,
    )
    .get() as { orders: number; revenue: number };
  const month = db
    .prepare(
      `SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
       FROM orders WHERE status = 'paid' AND strftime('%Y-%m', paid_at) = strftime('%Y-%m', 'now')`,
    )
    .get() as { orders: number; revenue: number };
  const pending = db.prepare(`SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'`).get() as { n: number };
  const toFulfil = db
    .prepare(`SELECT COUNT(*) AS n FROM orders WHERE status = 'paid' AND fulfilment_status IN ('awaiting','packed')`)
    .get() as { n: number };
  return { today, month, pending: pending.n, toFulfil: toFulfil.n };
}

/** Best sellers by units, for the dashboard. */
export function topSellers(limit = 5) {
  return getDb()
    .prepare(
      `SELECT oi.name, SUM(oi.qty) AS units, SUM(oi.line_total) AS revenue
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE o.status = 'paid'
       GROUP BY oi.name ORDER BY units DESC LIMIT ?`,
    )
    .all(limit) as { name: string; units: number; revenue: number }[];
}

/** Daily paid revenue for the last N days, oldest first — dashboard sparkline. */
export function revenueByDay(days = 14) {
  return getDb()
    .prepare(
      `SELECT date(paid_at) AS day, COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
       FROM orders
       WHERE status = 'paid' AND paid_at >= date('now', ?)
       GROUP BY day ORDER BY day ASC`,
    )
    .all(`-${days} days`) as { day: string; revenue: number; orders: number }[];
}

export function listCustomers(limit = 200) {
  return getDb()
    .prepare(
      `SELECT c.*,
              COUNT(o.id) AS order_count,
              COALESCE(SUM(CASE WHEN o.status = 'paid' THEN o.total ELSE 0 END), 0) AS lifetime_value,
              MAX(o.created_at) AS last_order_at
       FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id ORDER BY lifetime_value DESC LIMIT ?`,
    )
    .all(limit) as {
      id: number; email: string; phone: string | null; first_name: string | null; last_name: string | null;
      gstin: string | null; order_count: number; lifetime_value: number; last_order_at: string | null;
    }[];
}
