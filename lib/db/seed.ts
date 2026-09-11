/* ==========================================================================
   Seeding.

   The split this codebase deliberately makes:

     · EDITORIAL data — names, taglines, specs, highlights, finishes — lives in
       data/products/*.ts, in Git, reviewed like any other change.
     · OPERATIONAL data — price, cost, stock, barcode — lives in the database,
       because the shop changes it daily and nobody should need a deploy to
       mark six iPhones as received.

   Seeding walks the catalog and creates one SKU row per buyable combination.
   It is idempotent: re-running after adding a product inserts only what is
   new, and never touches a price or stock figure the shop has since edited.
   ========================================================================== */
import { getDb, tx } from "./client";
import { skuCodeFor } from "@/lib/sku";
import { PRODUCTS } from "@/data/catalog";
import { hsnFor } from "@/data/hsn";
import type { Product } from "@/lib/types";

export interface SeedResult {
  productsInserted: number;
  productsUpdated: number;
  skusInserted: number;
  skusExisting: number;
}

/** Every buyable combination of a product's option axes. */
export function variantsOf(p: Product) {
  const storages = p.storage?.length ? p.storage : [null];
  const sizes = p.sizes?.options.length ? p.sizes.options : [null];
  const out: {
    colorId: string; colorName: string;
    storageId: string | null; storageLabel: string | null;
    sizeId: string | null; sizeLabel: string | null;
    price: number;
  }[] = [];

  for (const color of p.colors) {
    for (const storage of storages) {
      for (const size of sizes) {
        out.push({
          colorId: color.id,
          colorName: color.name,
          storageId: storage?.id ?? null,
          storageLabel: storage?.label ?? null,
          sizeId: size?.id ?? null,
          sizeLabel: size?.label ?? null,
          price: p.basePrice + (storage?.priceDelta ?? 0) + (size?.priceDelta ?? 0),
        });
      }
    }
  }
  return out;
}

/**
 * `openingStock` seeds a starting count for brand-new SKUs only. Existing rows
 * keep whatever the shop has set. Pass 0 in production and receive stock
 * properly through the admin portal so it lands in the ledger.
 */
export function seedCatalog(opts: { openingStock?: number } = {}): SeedResult {
  const opening = opts.openingStock ?? 0;
  const result: SeedResult = { productsInserted: 0, productsUpdated: 0, skusInserted: 0, skusExisting: 0 };

  tx((conn) => {
    const findProduct = conn.prepare(`SELECT slug FROM products WHERE slug = ?`);
    const insertProduct = conn.prepare(
      `INSERT INTO products (slug, name, category, family, art, hsn, gst_rate)
       VALUES (@slug, @name, @category, @family, @art, @hsn, @gst_rate)`,
    );
    const updateProduct = conn.prepare(
      `UPDATE products SET name = @name, category = @category, family = @family,
       art = @art, hsn = @hsn, gst_rate = @gst_rate, updated_at = datetime('now')
       WHERE slug = @slug`,
    );
    const findSku = conn.prepare(`SELECT id FROM skus WHERE sku_code = ?`);
    const insertSku = conn.prepare(
      `INSERT INTO skus (sku_code, product_slug, color_id, color_name, storage_id, storage_label,
                         size_id, size_label, price, mrp, stock_on_hand, low_stock_threshold)
       VALUES (@sku_code, @product_slug, @color_id, @color_name, @storage_id, @storage_label,
               @size_id, @size_label, @price, @mrp, @stock_on_hand, @low_stock_threshold)`,
    );
    const insertMovement = conn.prepare(
      `INSERT INTO stock_movements (sku_id, delta, balance_after, reason, ref_type, note, actor)
       VALUES (?, ?, ?, 'purchase', 'seed', 'Opening stock from catalog seed', 'system')`,
    );

    for (const p of PRODUCTS) {
      const { hsn, gstRate } = hsnFor(p.slug, p.category);
      const row = {
        slug: p.slug, name: p.name, category: p.category, family: p.family,
        art: p.art, hsn, gst_rate: gstRate,
      };

      if (findProduct.get(p.slug)) {
        updateProduct.run(row);
        result.productsUpdated += 1;
      } else {
        insertProduct.run(row);
        result.productsInserted += 1;
      }

      for (const v of variantsOf(p)) {
        const code = skuCodeFor(p.slug, v.colorId, v.storageId, v.sizeId);
        if (findSku.get(code)) {
          result.skusExisting += 1;
          continue;
        }
        // A made-to-order product starts at zero however generous the opening
        // figure is — it is not on the shelf by definition.
        const startStock = p.stock === "order" ? 0 : p.stock === "low" ? Math.min(opening, 2) : opening;
        const info = insertSku.run({
          sku_code: code,
          product_slug: p.slug,
          color_id: v.colorId,
          color_name: v.colorName,
          storage_id: v.storageId,
          storage_label: v.storageLabel,
          size_id: v.sizeId,
          size_label: v.sizeLabel,
          price: v.price,
          mrp: p.mrp ? p.mrp + (v.price - p.basePrice) : null,
          stock_on_hand: startStock,
          low_stock_threshold: p.category === "accessories" ? 5 : 2,
        });
        if (startStock > 0) insertMovement.run(Number(info.lastInsertRowid), startStock, startStock);
        result.skusInserted += 1;
      }
    }
  });

  return result;
}

/** Default store settings, written once. */
export function seedSettings(): void {
  const db = getDb();
  const defaults: Record<string, string> = {
    invoice_prefix: "AMR",
    invoice_series_start: "1",
    seller_gstin: process.env.STORE_GSTIN ?? "",
    seller_state: "Karnataka",
    seller_state_code: "29",
    low_stock_email: "",
  };
  const stmt = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
  for (const [k, v] of Object.entries(defaults)) stmt.run(k, v);
}

export function getSetting(key: string, fallback = ""): string {
  const row = getDb().prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    )
    .run(key, value);
}
