import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import CategoryListing, { type ListingItem } from "@/components/CategoryListing";
import Crumbs from "@/components/Crumbs";
import LocalNav from "@/components/LocalNav";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/data/categories";
import { familiesIn, fromPrice, productsIn } from "@/data/catalog";
import { availabilityByProduct } from "@/lib/db/inventory";
import type { CategorySlug } from "@/lib/types";

/* Live stock badges, so this renders per request rather than at build time. */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const c = CATEGORY_BY_SLUG[category as CategorySlug];
  if (!c) return {};
  return {
    title: `${c.name} — buy in Bengaluru`,
    description: `${c.heroSub} ${c.name} at Amaira, Apple Premium Reseller, Sanjaynagar Main Road, Bengaluru. No-cost EMI and free city delivery.`,
    alternates: { canonical: `/shop/${c.slug}` },
    openGraph: { title: `${c.name} at Amaira`, description: c.heroSub },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const c = CATEGORY_BY_SLUG[category as CategorySlug];
  if (!c) notFound();

  const products = productsIn(c.slug);
  const stockByProduct = availabilityByProduct();
  const items: ListingItem[] = products.map((p) => ({
    slug: p.slug,
    category: p.category,
    name: p.name,
    family: p.family,
    tagline: p.tagline,
    eyebrow: p.eyebrow,
    price: fromPrice(p),
    mrp: p.mrp,
    art: p.art,
    stock: p.stock,
    available: stockByProduct[p.slug] ?? 0,
    colors: p.colors.map((x) => ({ id: x.id, name: x.name, hex: x.hex, accent: x.accent, screen: x.screen })),
  }));

  const families = familiesIn(c.slug);

  return (
    <>
      <LocalNav
        title={c.name}
        href={`/shop/${c.slug}`}
        links={[
          { label: "All", href: `/shop/${c.slug}`, current: true },
          ...families.slice(0, 5).map((f) => ({
            label: f,
            href: `/shop/${c.slug}?family=${encodeURIComponent(f)}`,
          })),
        ]}
        cta={{ label: "Visit the store", href: "/store" }}
      />

      <div className="page">
        <Crumbs
          trail={[
            { name: "Home", href: "/" },
            { name: c.name, href: `/shop/${c.slug}` },
          ]}
        />

        <header style={{ paddingBlock: "var(--s-5) var(--s-7)", maxWidth: "62ch" }}>
          <h1 className="t-display balance">{c.heroTitle}</h1>
          <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>{c.heroSub}</p>
        </header>
      </div>

      <div className="page" style={{ paddingBottom: "var(--s-9)" }}>
        <Suspense fallback={<p className="muted">Loading products…</p>}>
          <CategoryListing items={items} />
        </Suspense>
      </div>
    </>
  );
}
