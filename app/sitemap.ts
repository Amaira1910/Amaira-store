import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/categories";
import { PRODUCTS } from "@/data/catalog";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const statics: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "daily" },
    { path: "/shop", priority: 0.9, freq: "daily" },
    { path: "/store", priority: 0.9, freq: "monthly" },
    { path: "/services", priority: 0.8, freq: "monthly" },
    { path: "/trade-in", priority: 0.8, freq: "weekly" },
    { path: "/finance", priority: 0.7, freq: "monthly" },
    { path: "/business", priority: 0.6, freq: "monthly" },
    { path: "/education", priority: 0.6, freq: "monthly" },
    { path: "/support", priority: 0.6, freq: "monthly" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
    { path: "/about", priority: 0.5, freq: "yearly" },
    { path: "/legal/privacy", priority: 0.3, freq: "yearly" },
    { path: "/legal/terms", priority: 0.3, freq: "yearly" },
    { path: "/legal/returns", priority: 0.4, freq: "yearly" },
    { path: "/legal/shipping", priority: 0.4, freq: "yearly" },
    { path: "/legal/warranty", priority: 0.4, freq: "yearly" },
  ];

  return [
    ...statics.map((s) => ({
      url: `${SITE_URL}${s.path}`,
      lastModified: now,
      changeFrequency: s.freq,
      priority: s.priority,
    })),
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/shop/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...PRODUCTS.map((p) => ({
      url: `${SITE_URL}/shop/${p.category}/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p.rank >= 85 ? 0.9 : 0.7,
    })),
  ];
}
