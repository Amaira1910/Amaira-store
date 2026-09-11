/* ==========================================================================
   Inventory.

   The one rule that matters: `available = stock_on_hand - stock_reserved`.

   Stock moves in two steps, never one. When a customer starts paying we
   RESERVE (so two people cannot buy the last unit simultaneously). Only when
   the payment is confirmed do we COMMIT — decrementing stock_on_hand and
   writing a ledger row. An abandoned checkout releases its reservation on
   expiry, so nothing is locked away forever.
   ========================================================================== */
import { getDb, tx } from "./client";
import { skuCodeFor } from "@/lib/sku";

export { skuCodeFor };

export interface SkuRow {
  id: number;
  sku_code: string;
  product_slug: string;
  color_id: string;
  color_name: string;
  storage_id: string | null;
  storage_label: string | null;
  size_id: string | null;
  size_label: string | null;
  price: number;
  mrp: number | null;
  cost_price: number | null;
  stock_on_hand: number;
  stock_reserved: number;
  low_stock_threshold: number;
  barcode: string | null;
  active: number;
}

export interface SkuWithProduct extends SkuRow {
  product_name: string;
  category: string;
  family: string;
  hsn: string;
  gst_rate: number;
}

export function getSkuByCode(code: string): SkuWithProduct | undefined {
  return getDb()
    .prepare(
      `SELECT s.*, p.name AS product_name, p.category, p.family, p.hsn, p.gst_rate
       FROM skus s JOIN products p ON p.slug = s.product_slug
       WHERE s.sku_code = ?`,
    )
    .get(code) as SkuWithProduct | undefined;
}

export function getSkuByBarcode(barcode: string): SkuWithProduct | undefined {
  return getDb()
    .prepare(
      `SELECT s.*, p.name AS product_name, p.category, p.family, p.hsn, p.gst_rate
       FROM skus s JOIN products p ON p.slug = s.product_slug
       WHERE s.barcode = ?`,
    )
    .get(barcode) as SkuWithProduct | undefined;
}

/** Available-to-sell for every SKU of one product, keyed by sku_code. */
export function availabilityForProduct(slug: string): Record<string, number> {
  const rows = getDb()
    .prepare(
      `SELECT sku_code, stock_on_hand - stock_reserved AS available, active
       FROM skus WHERE product_slug = ?`,
    )
    .all(slug) as { sku_code: string; available: number; active: number }[];

  const out: Record<string, number> = {};
  for (const r of rows) out[r.sku_code] = r.active ? Math.max(0, r.available) : 0;
  return out;
}

/** Total available units across every SKU of a product — drives the stock badge. */
export function totalAvailable(slug: string): number {
  const row = getDb()
    .prepare(
      `SELECT COALESCE(SUM(MAX(stock_on_hand - stock_reserved, 0)), 0) AS n
       FROM skus WHERE product_slug = ? AND active = 1`,
    )
    .get(slug) as { n: number };
  return row.n;
}

/** Availability for every product at once, for category and home grids. */
export function availabilityByProduct(): Record<string, number> {
  const rows = getDb()
    .prepare(
      `SELECT product_slug, COALESCE(SUM(MAX(stock_on_hand - stock_reserved, 0)), 0) AS n
       FROM skus WHERE active = 1 GROUP BY product_slug`,
    )
    .all() as { product_slug: string; n: number }[];
  const out: Record<string, number> = {};
  for (const r of rows) out[r.product_slug] = r.n;
  return out;
}

export interface ReserveLine {
  skuCode: string;
  qty: number;
}

export class StockError extends Error {
  constructor(message: string, readonly skuCode: string, readonly available: number) {
    super(message);
    this.name = "StockError";
  }
}

const RESERVATION_MINUTES = 20;

/**
 * Holds stock for a pending order. All-or-nothing: if any line is short, the
 * whole transaction rolls back and nothing is reserved.
 */
export function reserveStock(receiptId: string, lines: ReserveLine[], holdMinutes = RESERVATION_MINUTES): void {
  tx((conn) => {
    // Clear anything expired first so a stale hold never blocks a real sale.
    releaseExpiredWithin(conn);

    for (const line of lines) {
      const sku = conn
        .prepare(`SELECT id, sku_code, stock_on_hand, stock_reserved, active FROM skus WHERE sku_code = ?`)
        .get(line.skuCode) as
        | { id: number; sku_code: string; stock_on_hand: number; stock_reserved: number; active: number }
        | undefined;

      if (!sku) throw new StockError(`We no longer stock ${line.skuCode}.`, line.skuCode, 0);
      if (!sku.active) throw new StockError(`That configuration is no longer available.`, line.skuCode, 0);

      const available = sku.stock_on_hand - sku.stock_reserved;
      if (available < line.qty) {
        throw new StockError(
          available <= 0
            ? `That one has just sold out. Call the store and we will tell you when the next lands.`
            : `Only ${available} left of that configuration.`,
          line.skuCode,
          available,
        );
      }

      conn.prepare(`UPDATE skus SET stock_reserved = stock_reserved + ?, updated_at = datetime('now') WHERE id = ?`)
        .run(line.qty, sku.id);

      conn.prepare(
        `INSERT INTO reservations (sku_id, receipt_id, qty, state, expires_at)
         VALUES (?, ?, ?, 'held', datetime('now', ?))`,
      ).run(sku.id, receiptId, line.qty, `+${holdMinutes} minutes`);
    }
  });
}

/**
 * Payment confirmed: turn held stock into a real outward movement.
 * Idempotent — a Razorpay webhook that arrives twice must not double-count.
 */
export function commitReservation(receiptId: string, actor = "system"): void {
  tx((conn) => {
    const held = conn
      .prepare(`SELECT id, sku_id, qty FROM reservations WHERE receipt_id = ? AND state = 'held'`)
      .all(receiptId) as { id: number; sku_id: number; qty: number }[];

    for (const r of held) {
      const sku = conn.prepare(`SELECT stock_on_hand FROM skus WHERE id = ?`).get(r.sku_id) as
        | { stock_on_hand: number }
        | undefined;
      if (!sku) continue;

      const balanceAfter = sku.stock_on_hand - r.qty;
      conn.prepare(
        `UPDATE skus SET stock_on_hand = stock_on_hand - ?, stock_reserved = stock_reserved - ?,
         updated_at = datetime('now') WHERE id = ?`,
      ).run(r.qty, r.qty, r.sku_id);

      conn.prepare(
        `INSERT INTO stock_movements (sku_id, delta, balance_after, reason, ref_type, ref_id, actor)
         VALUES (?, ?, ?, 'sale', 'order', ?, ?)`,
      ).run(r.sku_id, -r.qty, balanceAfter, receiptId, actor);

      conn.prepare(`UPDATE reservations SET state = 'committed' WHERE id = ?`).run(r.id);
    }
  });
}

/** Payment failed or abandoned: give the stock back. Idempotent. */
export function releaseReservation(receiptId: string): void {
  tx((conn) => {
    const held = conn
      .prepare(`SELECT id, sku_id, qty FROM reservations WHERE receipt_id = ? AND state = 'held'`)
      .all(receiptId) as { id: number; sku_id: number; qty: number }[];

    for (const r of held) {
      conn.prepare(
        `UPDATE skus SET stock_reserved = MAX(0, stock_reserved - ?), updated_at = datetime('now') WHERE id = ?`,
      ).run(r.qty, r.sku_id);
      conn.prepare(`UPDATE reservations SET state = 'released' WHERE id = ?`).run(r.id);
    }
  });
}

function releaseExpiredWithin(conn: ReturnType<typeof getDb>): number {
  const stale = conn
    .prepare(`SELECT id, sku_id, qty FROM reservations WHERE state = 'held' AND expires_at < datetime('now')`)
    .all() as { id: number; sku_id: number; qty: number }[];

  for (const r of stale) {
    conn.prepare(`UPDATE skus SET stock_reserved = MAX(0, stock_reserved - ?) WHERE id = ?`).run(r.qty, r.sku_id);
    conn.prepare(`UPDATE reservations SET state = 'released' WHERE id = ?`).run(r.id);
  }
  return stale.length;
}

/** Sweeps abandoned checkouts. Safe to call on any request. */
export function releaseExpiredReservations(): number {
  return tx((conn) => releaseExpiredWithin(conn));
}

/**
 * A manual stock change: goods received, a return, damage, or a stock-take
 * correction. Always writes a ledger row so the number can be explained later.
 */
export function adjustStock(input: {
  skuId: number;
  delta: number;
  reason: "purchase" | "return" | "adjustment" | "damage" | "stocktake";
  actor: string;
  note?: string;
  refType?: string;
  refId?: string;
}): { balanceAfter: number } {
  return tx((conn) => {
    const sku = conn.prepare(`SELECT stock_on_hand, stock_reserved FROM skus WHERE id = ?`).get(input.skuId) as
      | { stock_on_hand: number; stock_reserved: number }
      | undefined;
    if (!sku) throw new Error("No such SKU.");

    const balanceAfter = sku.stock_on_hand + input.delta;
    if (balanceAfter < 0) throw new Error(`That would take stock below zero (currently ${sku.stock_on_hand}).`);
    if (balanceAfter < sku.stock_reserved) {
      throw new Error(
        `${sku.stock_reserved} unit(s) are reserved for orders being paid for right now. You cannot go below that.`,
      );
    }

    conn.prepare(`UPDATE skus SET stock_on_hand = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(balanceAfter, input.skuId);
    conn.prepare(
      `INSERT INTO stock_movements (sku_id, delta, balance_after, reason, ref_type, ref_id, note, actor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      input.skuId, input.delta, balanceAfter, input.reason,
      input.refType ?? "manual", input.refId ?? null, input.note ?? null, input.actor,
    );

    return { balanceAfter };
  });
}

/** Set an absolute count, as a stock-take does. Records the difference. */
export function setStock(input: { skuId: number; count: number; actor: string; note?: string }) {
  const sku = getDb().prepare(`SELECT stock_on_hand FROM skus WHERE id = ?`).get(input.skuId) as
    | { stock_on_hand: number }
    | undefined;
  if (!sku) throw new Error("No such SKU.");
  return adjustStock({
    skuId: input.skuId,
    delta: input.count - sku.stock_on_hand,
    reason: "stocktake",
    actor: input.actor,
    note: input.note ?? `Counted ${input.count}, system had ${sku.stock_on_hand}`,
  });
}

export function updateSku(
  id: number,
  patch: Partial<Pick<SkuRow, "price" | "mrp" | "cost_price" | "low_stock_threshold" | "barcode" | "active">>,
): void {
  const fields = Object.keys(patch) as (keyof typeof patch)[];
  if (!fields.length) return;
  const sets = fields.map((f) => `${f} = ?`).join(", ");
  getDb()
    .prepare(`UPDATE skus SET ${sets}, updated_at = datetime('now') WHERE id = ?`)
    .run(...fields.map((f) => patch[f] as number | string | null), id);
}

export function listSkus(opts: { search?: string; category?: string; lowOnly?: boolean; limit?: number } = {}) {
  const where: string[] = ["1=1"];
  const args: (string | number)[] = [];
  if (opts.search) {
    where.push("(s.sku_code LIKE ? OR p.name LIKE ? OR s.barcode LIKE ?)");
    const q = `%${opts.search}%`;
    args.push(q, q, q);
  }
  if (opts.category) { where.push("p.category = ?"); args.push(opts.category); }
  if (opts.lowOnly) where.push("(s.stock_on_hand - s.stock_reserved) <= s.low_stock_threshold");

  return getDb()
    .prepare(
      `SELECT s.*, p.name AS product_name, p.category, p.family, p.hsn, p.gst_rate,
              (s.stock_on_hand - s.stock_reserved) AS available
       FROM skus s JOIN products p ON p.slug = s.product_slug
       WHERE ${where.join(" AND ")}
       ORDER BY p.category, p.name, s.sku_code
       LIMIT ?`,
    )
    .all(...args, opts.limit ?? 500) as (SkuWithProduct & { available: number })[];
}

export function lowStockCount(): number {
  const r = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM skus
       WHERE active = 1 AND (stock_on_hand - stock_reserved) <= low_stock_threshold`,
    )
    .get() as { n: number };
  return r.n;
}

export function movementsForSku(skuId: number, limit = 50) {
  return getDb()
    .prepare(`SELECT * FROM stock_movements WHERE sku_id = ? ORDER BY id DESC LIMIT ?`)
    .all(skuId, limit) as {
      id: number; delta: number; balance_after: number; reason: string;
      ref_type: string | null; ref_id: string | null; note: string | null;
      actor: string | null; created_at: string;
    }[];
}

export function recentMovements(limit = 60) {
  return getDb()
    .prepare(
      `SELECT m.*, s.sku_code, p.name AS product_name
       FROM stock_movements m
       JOIN skus s ON s.id = m.sku_id
       JOIN products p ON p.slug = s.product_slug
       ORDER BY m.id DESC LIMIT ?`,
    )
    .all(limit) as {
      id: number; delta: number; balance_after: number; reason: string;
      ref_type: string | null; ref_id: string | null; note: string | null;
      actor: string | null; created_at: string; sku_code: string; product_name: string;
    }[];
}

/** Stock value at cost and at retail, for the dashboard. */
export function inventoryValue(): { units: number; atCost: number; atRetail: number } {
  const r = getDb()
    .prepare(
      `SELECT COALESCE(SUM(stock_on_hand), 0) AS units,
              COALESCE(SUM(stock_on_hand * COALESCE(cost_price, 0)), 0) AS at_cost,
              COALESCE(SUM(stock_on_hand * price), 0) AS at_retail
       FROM skus WHERE active = 1`,
    )
    .get() as { units: number; at_cost: number; at_retail: number };
  return { units: r.units, atCost: r.at_cost, atRetail: r.at_retail };
}
