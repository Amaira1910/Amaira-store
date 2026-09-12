/* Crawls every internal link reachable from the home page and reports any
 * non-200, plus per-page accessibility and metadata basics.
 *
 *   npm run build && npm start &
 *   BASE_URL=http://localhost:3000 node scripts/linkcheck.mjs
 */
import { chromium } from "playwright";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route("**/*", (r) => r.request().url().startsWith(base) ? r.continue() : r.fulfill({ status: 204, body: "" }));
const page = await ctx.newPage();

const seen = new Set(["/"]);
const queue = ["/"];
const bad = [];
const a11y = [];
const jsErrors = [];
page.on("pageerror", (e) => jsErrors.push(String(e)));

while (queue.length) {
  const path = queue.shift();
  let res;
  try {
    res = await page.goto(base + path, { waitUntil: "domcontentloaded", timeout: 25000 });
  } catch (e) {
    bad.push(`${path} -> navigation failed: ${e.message.slice(0, 60)}`);
    continue;
  }
  const status = res?.status() ?? 0;
  if (status !== 200) { bad.push(`${path} -> ${status}`); continue; }

  const checks = await page.evaluate(() => {
    const h1s = document.querySelectorAll("h1").length;
    const imgsNoAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length;
    const svgNoLabel = [...document.querySelectorAll('svg[role="img"]')].filter((s) => !s.getAttribute("aria-label")).length;
    const btnNoName = [...document.querySelectorAll("button")].filter(
      (b) => !b.textContent.trim() && !b.getAttribute("aria-label") && !b.getAttribute("title"),
    ).length;
    const links = [...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => h && h.startsWith("/") && !h.startsWith("//"));
    const title = document.title;
    const desc = document.querySelector('meta[name="description"]')?.content ?? "";
    return { h1s, imgsNoAlt, svgNoLabel, btnNoName, links, title, desc };
  });

  if (checks.h1s !== 1) a11y.push(`${path}: ${checks.h1s} <h1>`);
  if (checks.imgsNoAlt) a11y.push(`${path}: ${checks.imgsNoAlt} img without alt`);
  if (checks.svgNoLabel) a11y.push(`${path}: ${checks.svgNoLabel} role=img svg without label`);
  if (checks.btnNoName) a11y.push(`${path}: ${checks.btnNoName} button without accessible name`);
  if (!checks.title) a11y.push(`${path}: no <title>`);
  if (!checks.desc) a11y.push(`${path}: no meta description`);

  for (const href of checks.links) {
    const clean = href.split("#")[0];
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    queue.push(clean);
  }
}

console.log(`Crawled ${seen.size} internal URLs.`);
console.log(bad.length ? `\nBROKEN (${bad.length}):\n` + bad.join("\n") : "\nNo broken links.");
console.log(a11y.length ? `\nA11Y / SEO NOTES (${a11y.length}):\n` + a11y.slice(0, 30).join("\n") : "\nNo accessibility or metadata gaps found.");
console.log(jsErrors.length ? `\nJS ERRORS:\n` + [...new Set(jsErrors)].slice(0, 5).join("\n") : "\nNo JS errors.");
await browser.close();
