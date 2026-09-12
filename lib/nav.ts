/* ==========================================================================
   Navigation and search data, built on the server and handed to the client
   header as plain props. This keeps the full catalog — specs, highlights, the
   lot — out of the browser bundle; the header only ever needs a name, a price
   and one colour per product.
   ========================================================================== */
import { CATEGORIES } from "@/data/categories";
import { PRODUCTS, fromPrice, productsIn } from "@/data/catalog";
import type { ArtKind, CategorySlug } from "@/lib/types";

export interface SearchEntry {
  slug: string;
  name: string;
  family: string;
  category: CategorySlug;
  categoryName: string;
  price: number;
  art: ArtKind;
  hex: string;
  accent?: string;
  screen?: string;
  /** Pre-lowercased haystack, so the client never re-derives it per keystroke. */
  hay: string;
  rank: number;
}

export interface MenuLink {
  label: string;
  href: string;
}

export interface MenuGroup {
  title: string;
  links: MenuLink[];
  compact?: boolean;
}

export interface MenuSection {
  key: string;
  label: string;
  href: string;
  groups: MenuGroup[];
}

export function buildSearchIndex(): SearchEntry[] {
  return PRODUCTS.map((p) => {
    const c = CATEGORIES.find((x) => x.slug === p.category)!;
    const color = p.colors[0];
    return {
      slug: p.slug,
      name: p.name,
      family: p.family,
      category: p.category,
      categoryName: c.name,
      price: fromPrice(p),
      art: p.art,
      hex: color.hex,
      accent: color.accent,
      screen: color.screen,
      hay: [p.name, p.family, c.name, p.tagline, ...p.tags].join(" ").toLowerCase(),
      rank: p.rank,
    };
  });
}

/** Ranked substring search over the slim index. Runs on every keystroke. */
export function searchIndex(index: SearchEntry[], query: string, limit = 6): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const terms = q.split(/\s+/);

  return index
    .map((e) => {
      let score = 0;
      const name = e.name.toLowerCase();
      for (const t of terms) {
        if (!e.hay.includes(t)) return { e, score: 0 };
        if (name.startsWith(t)) score += 12;
        else if (name.includes(t)) score += 7;
        else score += 2;
      }
      return { e, score: score + e.rank / 100 };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.e);
}

const SERVICE_GROUP: MenuGroup = {
  title: "At Amaira",
  compact: true,
  links: [
    { label: "Visit the store", href: "/store" },
    { label: "Book a service repair", href: "/services" },
    { label: "Trade in your device", href: "/trade-in" },
    { label: "EMI and finance", href: "/finance" },
    { label: "Amaira for Business", href: "/business" },
  ],
};

export function buildMenu(): MenuSection[] {
  const sections: MenuSection[] = CATEGORIES.map((c) => {
    const products = productsIn(c.slug);
    const families: string[] = [];
    for (const p of products) if (!families.includes(p.family)) families.push(p.family);

    return {
      key: c.slug,
      label: c.short,
      href: `/shop/${c.slug}`,
      groups: [
        {
          title: `Explore ${c.name}`,
          links: products.slice(0, 6).map((p) => ({ label: p.name, href: `/shop/${c.slug}/${p.slug}` })),
        },
        {
          title: "Shop",
          compact: true,
          links: [
            { label: `All ${c.name}`, href: `/shop/${c.slug}` },
            ...families.slice(0, 4).map((f) => ({
              label: f,
              href: `/shop/${c.slug}?family=${encodeURIComponent(f)}`,
            })),
            { label: "Accessories", href: "/shop/accessories" },
          ],
        },
        SERVICE_GROUP,
      ],
    };
  });

  sections.push({
    key: "support",
    label: "Support",
    href: "/support",
    groups: [
      {
        title: "Get help",
        links: [
          { label: "Service and repair", href: "/services" },
          { label: "Set-up and data transfer", href: "/services#setup" },
          { label: "Track an order", href: "/support#orders" },
          { label: "Contact us", href: "/contact" },
        ],
      },
      {
        title: "Ways to save",
        compact: true,
        links: [
          { label: "Trade in", href: "/trade-in" },
          { label: "No-cost EMI", href: "/finance" },
          { label: "Education pricing", href: "/education" },
          { label: "Business pricing", href: "/business" },
        ],
      },
      SERVICE_GROUP,
    ],
  });

  return sections;
}
