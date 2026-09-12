/* Pushes catalog prices (data/products/*.ts) into the database.

   Usage:
     npm run db:reprice            # show what would change, write nothing
     npm run db:reprice -- --apply # actually write it

   db:seed never overwrites a price the shop has set, which is right day to
   day but wrong the day Apple reprices the line-up. This is the explicit way
   to push a catalog price change through. Run the dry run first and read it. */
import { getDb, closeDb } from "../lib/db/client";
import { repriceFromCatalog } from "../lib/db/seed";
import { inr } from "../lib/money";

const apply = process.argv.includes("--apply");

getDb();
const r = repriceFromCatalog({ dryRun: !apply });

if (r.changed.length === 0) {
  console.log("Nothing to reprice — every SKU already matches the catalog.");
} else {
  console.log(`${apply ? "Repriced" : "Would reprice"} ${r.changed.length} SKU(s):\n`);
  for (const c of r.changed) {
    const dir = c.to > c.from ? "↑" : "↓";
    console.log(`  ${dir} ${c.productSlug.padEnd(24)} ${c.variant.padEnd(40)} ${inr(c.from)} → ${inr(c.to)}`);
  }
  console.log("");
}
console.log(`Unchanged : ${r.unchanged}`);
if (r.orphaned.length > 0) {
  console.log(`Orphaned  : ${r.orphaned.length} SKU(s) the catalog no longer lists.`);
  console.log(`            They stay in the database for order history and simply`);
  console.log(`            drop off the storefront. Nothing to do.`);
}
if (!apply && r.changed.length > 0) console.log("\nRe-run with -- --apply to write these.");
closeDb();
