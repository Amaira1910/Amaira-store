/* ==========================================================================
   Runs once when the server boots, before the first request is served.

   Migrations run here rather than in a deploy step, so the database is always
   at the right version no matter how the app was started — `npm run dev`, a
   container, or a fresh VPS.
   ========================================================================== */

export async function register() {
  // Only the Node.js runtime can reach SQLite; the Edge runtime must skip this.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getDb } = await import("@/lib/db/client");
  const { seedCatalog, seedSettings } = await import("@/lib/db/seed");
  const { adminUserCount, createAdminUser } = await import("@/lib/db/auth");

  const db = getDb(); // opening the handle applies any pending migrations
  seedSettings();

  // Seed the catalog on a fresh database so the shop is never empty.
  const existing = db.prepare("SELECT COUNT(*) AS n FROM skus").get() as { n: number };
  if (existing.n === 0) {
    const opening = Number(process.env.SEED_OPENING_STOCK ?? 0);
    const result = seedCatalog({ openingStock: Number.isFinite(opening) ? opening : 0 });
    console.info(
      `[seed] ${result.productsInserted} products, ${result.skusInserted} SKUs created` +
        (opening ? ` with ${opening} units opening stock each` : " (zero stock — receive it in the admin portal)"),
    );
  }

  // Create the first admin from the environment, so a fresh deploy is usable.
  if (adminUserCount() === 0) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (email && password && password.length >= 10) {
      createAdminUser({ email, password, name: process.env.ADMIN_NAME ?? "Owner", role: "owner" });
      console.info(`[auth] created the first admin user: ${email}`);
    } else {
      console.warn(
        "[auth] No admin user exists. Set ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters) and restart to create one.",
      );
    }
  }
}
