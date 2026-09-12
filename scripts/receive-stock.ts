/* Receives stock against a SKU from the command line, for bulk goods-inward.
   Usage:  npm run db:stock -- AMR-IPHONE-17-PRO-MAX-NATURAL-256GB 6 "GRN 4471" */
import { getDb, closeDb } from "../lib/db/client";
import { adjustStock, getSkuByCode } from "../lib/db/inventory";

const [code, qtyArg, note] = process.argv.slice(2);
if (!code || !qtyArg) {
  console.error('Usage: npm run db:stock -- <SKU-CODE> <qty> ["note"]');
  process.exit(1);
}

getDb();
const sku = getSkuByCode(code);
if (!sku) {
  console.error(`No SKU with code ${code}.`);
  process.exit(1);
}

const qty = Number(qtyArg);
const { balanceAfter } = adjustStock({
  skuId: sku.id,
  delta: qty,
  reason: qty > 0 ? "purchase" : "adjustment",
  actor: "cli",
  note,
});

console.log(`${sku.product_name} — ${sku.color_name}${sku.storage_label ? " " + sku.storage_label : ""}`);
console.log(`${qty > 0 ? "+" : ""}${qty} → ${balanceAfter} on hand`);
closeDb();
