/* Render pages at a given size for a visual review.
 *
 *   BASE_URL=http://localhost:3000 node scripts/screenshot.mjs \
 *     "/|home|1440|1000|0" "/shop/iphone|cat|414|896|1"
 *
 * Each argument is  path|name|width|height|fullPage(0|1).
 * Off-origin requests are stubbed so an embedded map cannot stall the load. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = process.env.SHOT_DIR ?? "./screenshots";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const targets = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

for (const spec of targets) {
  const [path, name, w = "1440", h = "1000", full = "0"] = spec.split("|");
  const ctx = await browser.newContext({
    viewport: { width: Number(w), height: Number(h) },
    deviceScaleFactor: 2,
  });
  // The Maps embed never goes idle in a sandbox; stub every off-origin request.
  await ctx.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith(base)) return route.continue();
    return route.fulfill({ status: 204, body: "" });
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto(base + path, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(1200);
  if (full === "1") {
    // Force every scroll-reveal section in before a full-page capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 130));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(700);
  }
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full === "1" });
  console.log(errs.length ? `[${name}] ERRORS: ${errs.slice(0, 4).join(" | ")}` : `[${name}] ok`);
  await ctx.close();
}
await browser.close();
