import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/Crumbs";
import ProductTile from "@/components/ProductTile";
import { CATEGORIES } from "@/data/categories";
import { searchProducts } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Amaira catalogue.",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? searchProducts(query, 24) : [];

  return (
    <div className="page" style={{ paddingBottom: "var(--s-9)" }}>
      <Crumbs trail={[{ name: "Home", href: "/" }, { name: "Search", href: "/search" }]} />

      <header style={{ paddingBlock: "var(--s-5) var(--s-7)" }}>
        <h1 className="t-display balance">
          {query ? `Results for “${query}”` : "Search"}
        </h1>
        {query && (
          <p className="t-body-lg muted" style={{ marginTop: "var(--s-3)" }}>
            {results.length} {results.length === 1 ? "product" : "products"} found.
          </p>
        )}
      </header>

      {results.length > 0 ? (
        <div className="grid grid-3">
          {results.map((p) => <ProductTile key={p.slug} product={p} />)}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{query ? `Nothing matched “${query}”.` : "What are you looking for?"}</h2>
          <p className="muted pretty" style={{ maxWidth: "46ch", margin: "10px auto 0" }}>
            {query
              ? "Try a shorter search, like “iPhone”, “MacBook” or “case”. Or browse by category below."
              : "Use the search icon in the menu bar, or start with a category."}
          </p>
          <div className="row-wrap" style={{ justifyContent: "center", marginTop: "var(--s-6)" }}>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/shop/${c.slug}`} className="chip">{c.short}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
