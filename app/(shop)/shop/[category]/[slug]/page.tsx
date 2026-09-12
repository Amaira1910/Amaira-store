import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Crumbs from "@/components/Crumbs";
import LocalNav from "@/components/LocalNav";
import ProductDetail from "@/components/ProductDetail";
import ProductTile from "@/components/ProductTile";
import SectionHead from "@/components/SectionHead";
import { CATEGORY_BY_SLUG } from "@/data/categories";
import { familiesIn, fromPrice, getProduct, related } from "@/data/catalog";
import { STORE } from "@/data/store";
import { deliveryPromise, pickupPromise } from "@/lib/format";
import { availabilityForProduct, totalAvailable } from "@/lib/db/inventory";
import { inr } from "@/lib/money";
import { absolute, jsonLdScript } from "@/lib/seo";
import type { CategorySlug } from "@/lib/types";

/* Rendered per request: the stock figures and the buy button have to be
   current. SQLite reads are local and sub-millisecond, so this costs little. */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const price = fromPrice(p);
  return {
    title: `${p.name} — from ${inr(price)}`,
    description: `${p.tagline} Buy ${p.name} at Amaira, Apple Premium Reseller in Sanjaynagar, Bengaluru. From ${inr(price)} with no-cost EMI, trade-in and free delivery.`,
    alternates: { canonical: `/shop/${p.category}/${p.slug}` },
    openGraph: {
      type: "website",
      title: `${p.name} at Amaira — from ${inr(price)}`,
      description: p.tagline,
      url: absolute(`/shop/${p.category}/${p.slug}`),
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { category, slug } = await params;
  const p = getProduct(slug);
  if (!p || p.category !== category) notFound();

  const c = CATEGORY_BY_SLUG[p.category as CategorySlug];
  const availability = availabilityForProduct(p.slug);
  const available = totalAvailable(p.slug);
  const stock =
    available > 5
      ? { text: "In stock at Sanjaynagar", className: "badge badge-stock" }
      : available > 0
        ? { text: `Only ${available} left at Sanjaynagar`, className: "badge badge-new" }
        : { text: "Out of stock — call to be notified", className: "badge badge-out" };
  const cross = related(p, 4);
  const families = familiesIn(p.category);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.tagline,
    category: c.name,
    brand: { "@type": "Brand", name: "Apple" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: fromPrice(p),
      highPrice: p.basePrice + (p.storage?.at(-1)?.priceDelta ?? 0) + (p.sizes?.options.at(-1)?.priceDelta ?? 0),
      offerCount: (p.storage?.length ?? 1) * (p.sizes?.options.length ?? 1),
      availability:
        available > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: STORE.name, "@id": absolute("/#store") },
      url: absolute(`/shop/${p.category}/${p.slug}`),
    },
  };

  return (
    <>
      <LocalNav
        title={c.name}
        href={`/shop/${c.slug}`}
        links={[
          { label: "All", href: `/shop/${c.slug}` },
          ...families.slice(0, 4).map((f) => ({
            label: f,
            href: `/shop/${c.slug}?family=${encodeURIComponent(f)}`,
            current: f === p.family,
          })),
        ]}
      />

      <div className="page">
        <Crumbs
          trail={[
            { name: "Home", href: "/" },
            { name: c.name, href: `/shop/${c.slug}` },
            { name: p.name, href: `/shop/${c.slug}/${p.slug}` },
          ]}
        />

        <p style={{ marginBottom: "var(--s-5)" }}>
          <span className={stock.className}>{stock.text}</span>
        </p>

        <ProductDetail
          slug={p.slug}
          category={p.category}
          name={p.name}
          tagline={p.tagline}
          eyebrow={p.eyebrow}
          basePrice={p.basePrice}
          mrp={p.mrp}
          art={p.art}
          colors={p.colors}
          storage={p.storage}
          storageTitle={p.storageTitle}
          sizes={p.sizes}
          stock={p.stock}
          availability={availability}
          careAnnual={p.careAnnual}
          deliveryLine={deliveryPromise(p)}
          pickupLine={pickupPromise(p)}
          engravable={["airtag", "ipad", "audio"].includes(p.category) || p.slug.startsWith("airtag")}
        />
      </div>

      {/* ------------------------------------------------------- highlights */}
      <section className="section section-mist" style={{ marginTop: "var(--s-9)" }}>
        <div className="page reveal">
          <SectionHead title={`Why ${p.name}`} />
          <div className="highlight-grid">
            {p.highlights.map((h) => (
              <div className="highlight" key={h.title} style={{ background: "var(--ground)" }}>
                <p className="highlight-title">{h.title}</p>
                <p className="highlight-copy pretty">{h.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ specs */}
      <section className="section">
        <div className="page reveal" style={{ maxWidth: 920 }}>
          <SectionHead title="Tech specs" />
          {p.specs.map((group) => (
            <div key={group.group} style={{ marginBottom: "var(--s-6)" }}>
              <h3 className="t-headline" style={{ marginBottom: "var(--s-2)" }}>{group.group}</h3>
              {group.rows.map((row) => (
                <div className="spec-row" key={row.k}>
                  <div className="spec-key">{row.k}</div>
                  <div className="spec-val">{row.v}</div>
                </div>
              ))}
            </div>
          ))}

          <div style={{ marginTop: "var(--s-7)" }}>
            <h3 className="t-headline" style={{ marginBottom: "var(--s-3)" }}>In the box</h3>
            <ul className="stack-sm">
              {p.inBox.map((item) => (
                <li key={item} className="t-body-sm muted">· {item}</li>
              ))}
            </ul>
          </div>

          <details className="acc" style={{ marginTop: "var(--s-7)" }}>
            <summary className="acc-trigger">
              Warranty, returns and service
              <span className="acc-icon" aria-hidden="true" />
            </summary>
            <div className="acc-body stack">
              <p>
                Every product carries the full Apple India limited warranty of one year, plus your
                statutory rights. {p.careAnnual ? "AppleCare+ can be added at purchase or within 60 days." : ""}
              </p>
              <p>
                Changed your mind? Return an unopened, unused product within 7 days for a full refund.
                See <Link href="/legal/returns">Returns and Refunds</Link> for the details.
              </p>
              <p>
                We service what we sell. <Link href="/services">Book a repair ›</Link>
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* ------------------------------------------------------- cross-sell */}
      {cross.length > 0 && (
        <section className="section section-mist">
          <div className="page reveal">
            <SectionHead
              title="Goes well with this"
              sub="The accessories people actually come back for."
              href={`/shop/${c.slug}`}
              linkText={`All ${c.name}`}
            />
            <div className="grid grid-3">
              {cross.map((x) => (
                <ProductTile key={x.slug} product={x} emi={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(productJsonLd)} />
    </>
  );
}
