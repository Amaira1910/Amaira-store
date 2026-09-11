import type { Metadata } from "next";
import Link from "next/link";
import DeviceArt from "@/components/DeviceArt";
import ProductTile from "@/components/ProductTile";
import SectionHead from "@/components/SectionHead";
import Crumbs from "@/components/Crumbs";
import { CATEGORIES } from "@/data/categories";
import { featured, productsIn } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Store — every Apple product we carry",
  description:
    "Browse iPhone, Mac, iPad, Apple Watch, AirPods, TV & Home and accessories at Amaira, Apple Premium Reseller in Sanjaynagar, Bengaluru.",
  alternates: { canonical: "/shop" },
};

export default function ShopIndex() {
  return (
    <div className="page" style={{ paddingBottom: "var(--s-9)" }}>
      <Crumbs trail={[{ name: "Home", href: "/" }, { name: "Store", href: "/shop" }]} />

      <header style={{ paddingBlock: "var(--s-5) var(--s-7)", maxWidth: "62ch" }}>
        <h1 className="t-display balance">Store.</h1>
        <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
          The best way to buy Apple in Bengaluru. Everything here is in our Sanjaynagar shop, or a
          day away.
        </p>
      </header>

      <section style={{ marginBottom: "var(--s-9)" }}>
        <div className="grid grid-3">
          {CATEGORIES.map((c) => {
            const first = productsIn(c.slug)[0];
            return (
              <Link key={c.slug} href={`/shop/${c.slug}`} className="tile" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="tile-media">
                  <DeviceArt
                    kind={c.art}
                    hex={first?.colors[0].hex ?? "#c8c2ba"}
                    accent={first?.colors[0].accent}
                    screen={first?.colors[0].screen}
                    label=""
                  />
                </div>
                <h2 className="tile-name">{c.name}</h2>
                <p className="tile-tagline">{c.tagline}</p>
                <div className="tile-foot">
                  <span className="link-cta t-body-sm">Shop {c.short} ›</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHead title="Most wanted this month" sub="What is actually walking out of the shop." />
        <div className="grid grid-3">
          {featured(8).map((p) => (
            <ProductTile key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
