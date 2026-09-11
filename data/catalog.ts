/* ==========================================================================
   The catalog — one flat list, plus the lookups every page needs.
   Every product lives in data/products/*.ts. Add a file, import it here.
   ========================================================================== */
import type { CategorySlug, Product } from "@/lib/types";
import { IPHONES } from "./products/iphone";
import { MACS } from "./products/mac";
import { IPADS } from "./products/ipad";
import { WATCHES } from "./products/watch";
import { AUDIO } from "./products/audio";
import { HOME } from "./products/home";
import { ACCESSORIES } from "./products/accessories";

export const PRODUCTS: Product[] = [
  ...IPHONES,
  ...MACS,
  ...IPADS,
  ...WATCHES,
  ...AUDIO,
  ...HOME,
  ...ACCESSORIES,
];

const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return BY_SLUG.get(slug);
}

export function productsIn(category: CategorySlug): Product[] {
  return PRODUCTS.filter((p) => p.category === category).sort((a, b) => b.rank - a.rank);
}

export function featured(limit = 8): Product[] {
  return [...PRODUCTS].sort((a, b) => b.rank - a.rank).slice(0, limit);
}

/** Families within a category, in display order, for filter chips and local nav. */
export function familiesIn(category: CategorySlug): string[] {
  const seen: string[] = [];
  for (const p of productsIn(category)) if (!seen.includes(p.family)) seen.push(p.family);
  return seen;
}

/** The lowest price a product can be bought at, including option deltas. */
export function fromPrice(p: Product): number {
  const storageMin = p.storage?.length ? Math.min(...p.storage.map((s) => s.priceDelta)) : 0;
  const sizeMin = p.sizes?.options.length ? Math.min(...p.sizes.options.map((s) => s.priceDelta)) : 0;
  return p.basePrice + storageMin + sizeMin;
}

/** The highest price, used for range filters and "from X to Y" copy. */
export function toPrice(p: Product): number {
  const storageMax = p.storage?.length ? Math.max(...p.storage.map((s) => s.priceDelta)) : 0;
  const sizeMax = p.sizes?.options.length ? Math.max(...p.sizes.options.map((s) => s.priceDelta)) : 0;
  return p.basePrice + storageMax + sizeMax;
}

/**
 * Substring search over name, family, tagline and tags. Deliberately simple —
 * the catalog is small enough that ranking by field weight beats an index.
 */
export function searchProducts(query: string, limit = 8): Product[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const terms = q.split(/\s+/);

  const scored = PRODUCTS.map((p) => {
    const name = p.name.toLowerCase();
    const family = p.family.toLowerCase();
    const tagline = p.tagline.toLowerCase();
    const tags = p.tags.join(" ").toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (name.startsWith(t)) score += 12;
      else if (name.includes(t)) score += 8;
      if (family.toLowerCase().includes(t)) score += 4;
      if (tags.includes(t)) score += 3;
      if (tagline.includes(t)) score += 1;
    }
    // Every term must land somewhere, or it is not a match.
    const all = terms.every(
      (t) => name.includes(t) || family.includes(t) || tags.includes(t) || tagline.includes(t),
    );
    return { p, score: all ? score + p.rank / 100 : 0 };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((r) => r.p);
}

/** Cross-sell: same category first, then anything highly ranked. */
export function related(product: Product, limit = 4): Product[] {
  const sameCat = PRODUCTS.filter((p) => p.slug !== product.slug && p.category === product.category);
  const accessories = PRODUCTS.filter(
    (p) => p.category === "accessories" && p.tags.some((t) => product.category.includes(t) || t === product.category),
  );
  const pool = [...accessories, ...sameCat];
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of pool) {
    if (p.slug === product.slug || seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}
