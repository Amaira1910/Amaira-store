/* Rasterises public/icon.svg into the PNG sizes browsers and iOS want.
   Run with: node scripts/make-icons.mjs   (needs the dev dependency playwright) */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const svg = readFileSync(new URL("../public/icon.svg", import.meta.url), "utf8");
const SIZES = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

for (const { file, size } of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: size, height: size } });
  const page = await ctx.newPage();
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  const buf = await page.screenshot({ omitBackground: true });
  writeFileSync(new URL(`../public/${file}`, import.meta.url), buf);
  console.log(`wrote public/${file} (${size}×${size})`);
  await ctx.close();
}

await browser.close();
