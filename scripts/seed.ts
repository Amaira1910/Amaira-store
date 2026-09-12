/* Creates the schema and fills it from the catalog.
   Usage:  npm run db:seed  [-- --stock 5]
   Safe to re-run: existing prices and stock are never overwritten. */
import { getDb, closeDb } from "../lib/db/client";
import { seedCatalog, seedSettings } from "../lib/db/seed";

const stockArg = process.argv.indexOf("--stock");
const openingStock = stockArg > -1 ? Number(process.argv[stockArg + 1]) : 0;

getDb();
seedSettings();
const r = seedCatalog({ openingStock: Number.isFinite(openingStock) ? openingStock : 0 });

console.log(`Products : ${r.productsInserted} new, ${r.productsUpdated} refreshed`);
console.log(`SKUs     : ${r.skusInserted} new, ${r.skusExisting} already present`);
if (openingStock > 0) console.log(`Stock    : ${openingStock} units seeded onto each new SKU`);
else console.log(`Stock    : new SKUs start at zero — receive stock in the admin portal`);
closeDb();
