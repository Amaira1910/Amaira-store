import type { Metadata } from "next";
import Link from "next/link";

import DeviceArt from "@/components/DeviceArt";
import HeroCarousel, { type Slide } from "@/components/HeroCarousel";
import ProductTile from "@/components/ProductTile";
import SectionHead from "@/components/SectionHead";
import {
  IconCard, IconChevronRight, IconPin, IconRefresh, IconShield, IconTools, IconTruck,
} from "@/components/Icons";

import { CATEGORIES } from "@/data/categories";
import { getProduct, productsIn } from "@/data/catalog";
import { STORE } from "@/data/store";
import { fromPrice } from "@/data/catalog";
import { inr, noCostEmi } from "@/lib/money";
import { openState } from "@/lib/format";

/* Stock figures are live, so this page renders per request. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${STORE.name} — Apple Premium Reseller in Sanjaynagar, Bengaluru`,
  description:
    "iPhone, Mac, iPad, Apple Watch and AirPods in stock at Sanjaynagar Main Road, Bengaluru. No-cost EMI, trade-in, free city delivery and free setup with every device.",
  alternates: { canonical: "/" },
};

function slideFor(slug: string, over: Partial<Slide>): Slide {
  const p = getProduct(slug)!;
  const c = p.colors[0];
  return {
    key: slug,
    title: p.name,
    sub: p.tagline,
    priceLine: `From ${inr(fromPrice(p))} or ${inr(noCostEmi(fromPrice(p), 12))}/mo. for 12 mo.`,
    primary: { label: "Buy", href: `/shop/${p.category}/${p.slug}` },
    secondary: { label: "Learn more", href: `/shop/${p.category}/${p.slug}` },
    art: { kind: p.art, hex: c.hex, accent: c.accent, screen: c.screen },
    theme: "mist",
    ...over,
  };
}

export default function HomePage() {
  const status = openState();

  const slides: Slide[] = [
    slideFor("iphone-17-pro", {
      eyebrow: "New",
      theme: "dark",
      glow: ["rgba(95,107,125,0.55)", "rgba(30,40,60,0.35)"],
    }),
    slideFor("macbook-air-13-m4", { eyebrow: "Apple silicon", theme: "mist" }),
    slideFor("airpods-pro-3", { eyebrow: "New", theme: "paper" }),
    {
      key: "store",
      eyebrow: "Sanjaynagar Main Road",
      title: "Come and try everything.",
      sub: "Every model on the table, set up and ready. We will transfer your data, fit your Watch band and check your AirPods seal — free, while you wait.",
      primary: { label: "Get directions", href: "/store" },
      secondary: { label: `Call ${STORE.phone}`, href: STORE.phoneHref },
      art: { kind: "imac", hex: "#6d8fc4", accent: "#c9d8ec", screen: "#101114" },
      theme: "mist",
    },
  ];

  const inStock = [
    "iphone-17-pro-max", "macbook-air-13-m4", "apple-watch-series-11",
    "airpods-pro-3", "ipad-air-11-m3", "mac-mini-m4",
  ]
    .map((s) => getProduct(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const iphonePro = getProduct("iphone-17-pro-max")!;
  const watch = getProduct("apple-watch-series-11")!;
  const air = getProduct("macbook-air-13-m4")!;
  const ipad = getProduct("ipad-pro-13-m4")!;

  return (
    <>
      {/* The page's single h1. Visually the hero carousel carries the message,
          but a rotating panel cannot be the document heading. */}
      <h1 className="sr-only">
        {STORE.name} — {STORE.descriptor} in {STORE.address.line2}, {STORE.address.city}
      </h1>

      <HeroCarousel slides={slides} />

      {/* ---------------------------------------------------- category rail */}
      <section className="section-tight">
        <div className="page">
          <h2 className="t-headline" style={{ marginBottom: "var(--s-4)" }}>
            Store. <span className="muted">The best way to buy Apple in Bengaluru.</span>
          </h2>
          <div className="rail">
            {CATEGORIES.map((c) => {
              const first = productsIn(c.slug)[0];
              return (
                <Link key={c.slug} href={`/shop/${c.slug}`} className="puck">
                  <span className="puck-art">
                    <DeviceArt
                      kind={c.art}
                      hex={first?.colors[0].hex ?? "#c8c2ba"}
                      accent={first?.colors[0].accent}
                      screen={first?.colors[0].screen}
                      label=""
                    />
                  </span>
                  <span className="puck-label">{c.short}</span>
                </Link>
              );
            })}
            <Link href="/trade-in" className="puck">
              <span className="puck-art"><IconRefresh size={40} /></span>
              <span className="puck-label">Trade in</span>
            </Link>
            <Link href="/services" className="puck">
              <span className="puck-art"><IconTools size={40} /></span>
              <span className="puck-label">Service</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ bento grid */}
      <section className="section-tight">
        <div className="page reveal">
          <div className="feature-grid">
            <article className="feature feature-dark feature-span feature-tall">
              <p className="feature-eyebrow">New</p>
              <h3 className="feature-title balance">{iphonePro.name}</h3>
              <p className="feature-sub pretty">{iphonePro.tagline}</p>
              <div className="feature-cta">
                <Link href={`/shop/iphone/${iphonePro.slug}`} className="btn btn-on-dark btn-sm">Buy</Link>
                <Link href="/shop/iphone" className="link-cta" style={{ color: "#2997ff" }}>
                  Compare all iPhone <IconChevronRight size={15} className="chev" />
                </Link>
              </div>
              <div className="feature-art">
                <DeviceArt kind="phone-pro" hex={iphonePro.colors[0].hex} accent={iphonePro.colors[0].accent} screen={iphonePro.colors[0].screen} label="" />
              </div>
            </article>

            <article className="feature">
              <p className="feature-eyebrow amber">Fitted in store, free</p>
              <h3 className="feature-title balance">{watch.name}</h3>
              <p className="feature-sub pretty">{watch.tagline}</p>
              <div className="feature-cta">
                <Link href={`/shop/watch/${watch.slug}`} className="btn btn-sm">Buy</Link>
              </div>
              <div className="feature-art">
                <DeviceArt kind="watch" hex={watch.colors[0].hex} accent={watch.colors[0].accent} screen={watch.colors[0].screen} label="" />
              </div>
            </article>

            <article className="feature">
              <p className="feature-eyebrow">Most popular</p>
              <h3 className="feature-title balance">{air.name}</h3>
              <p className="feature-sub pretty">{air.tagline}</p>
              <div className="feature-cta">
                <Link href={`/shop/mac/${air.slug}`} className="btn btn-sm">Buy</Link>
                <Link href="/education" className="link-cta">Student pricing ›</Link>
              </div>
              <div className="feature-art">
                <DeviceArt kind="laptop" hex={air.colors[1].hex} accent={air.colors[1].accent} screen={air.colors[1].screen} label="" />
              </div>
            </article>

            <article className="feature">
              <p className="feature-eyebrow">Ultra Retina XDR</p>
              <h3 className="feature-title balance">{ipad.name}</h3>
              <p className="feature-sub pretty">{ipad.tagline}</p>
              <div className="feature-cta">
                <Link href={`/shop/ipad/${ipad.slug}`} className="btn btn-sm">Buy</Link>
              </div>
              <div className="feature-art">
                <DeviceArt kind="tablet" hex={ipad.colors[0].hex} accent={ipad.colors[0].accent} screen={ipad.colors[0].screen} label="" />
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- in stock today */}
      <section className="section section-mist">
        <div className="page reveal">
          <SectionHead
            title="In stock today at Sanjaynagar"
            sub="Reserve online and collect in about two hours, or have it delivered free anywhere in Bengaluru."
            href="/shop/iphone"
            linkText="Shop everything"
          />
          <div className="grid grid-3">
            {inStock.map((p) => (
              <ProductTile key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- why Amaira */}
      <section className="section">
        <div className="page reveal">
          <SectionHead
            title="Why people buy here and not online"
            sub="Same products. Same Apple warranty. A shop full of people who will set it up with you."
            align="center"
          />
          <div className="trust-grid" style={{ marginTop: "var(--s-6)" }}>
            {[
              { icon: <IconTruck size={24} />, title: "Free delivery in Bengaluru", copy: `Order before ${STORE.delivery.citySameDayCutoff} and most items arrive the same day.` },
              { icon: <IconCard size={24} />, title: "No-cost EMI", copy: "3 to 12 months across 10 banks, with instant approval at checkout." },
              { icon: <IconRefresh size={24} />, title: "Trade in, on the spot", copy: "Bring your old device. We value it in the store and take it off the bill." },
              { icon: <IconTools size={24} />, title: "Setup while you wait", copy: "Data transfer, Apple ID, Watch sizing and AirPods fit test — all free." },
              { icon: <IconShield size={24} />, title: "Genuine and warranted", copy: "Full Apple India warranty, AppleCare+ available, GST invoice on every order." },
              { icon: <IconPin size={24} />, title: "A real shop, nearby", copy: `${STORE.address.line2}. ${status.label}.` },
            ].map((t) => (
              <div className="trust-item" key={t.title}>
                <span className="trust-icon">{t.icon}</span>
                <p className="trust-title">{t.title}</p>
                <p className="trust-copy pretty">{t.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- trade-in / finance */}
      <section className="section section-ink">
        <div className="page reveal">
          <div className="grid grid-2" style={{ gap: "var(--s-8)" }}>
            <div>
              <p className="t-caption amber" style={{ marginBottom: 8 }}>Trade in</p>
              <h2 className="t-title balance">Your old iPhone is worth something. Probably more than you think.</h2>
              <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
                Get an instant estimate online, then bring it in. We check it in front of you, confirm
                the value, and take it straight off the price of the new one.
              </p>
              <div className="row-wrap" style={{ marginTop: "var(--s-5)" }}>
                <Link href="/trade-in" className="btn btn-on-dark">Get an estimate</Link>
                <Link href="/trade-in#how" className="link-cta">How it works ›</Link>
              </div>
            </div>
            <div>
              <p className="t-caption amber" style={{ marginBottom: 8 }}>Finance</p>
              <h2 className="t-title balance">Pay over 12 months. Pay nothing extra.</h2>
              <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
                No-cost EMI on credit cards from {STORE.emiBanks.length} banks, plus debit-card EMI and
                cardless options. Approval takes under a minute at checkout.
              </p>
              <div className="row-wrap" style={{ marginTop: "var(--s-5)" }}>
                <Link href="/finance" className="btn btn-on-dark">See EMI plans</Link>
                <Link href="/business" className="link-cta">Business and bulk ›</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- visit us */}
      <section className="section">
        <div className="page reveal">
          <div className="store-grid">
            <div>
              <p className="t-caption muted" style={{ marginBottom: 8 }}>Visit</p>
              <h2 className="t-title balance">{STORE.address.line1}</h2>
              <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-3)" }}>
                {STORE.address.line2}
                <br />
                {STORE.address.city} {STORE.address.pincode}
              </p>
              <p className={`t-body ${status.open ? "green" : "amber"}`} style={{ marginTop: "var(--s-4)", fontWeight: 500 }}>
                {status.label}
              </p>
              <div className="row-wrap" style={{ marginTop: "var(--s-5)" }}>
                <a href={STORE.mapsLink} className="btn" target="_blank" rel="noopener noreferrer">Get directions</a>
                <a href={STORE.phoneHref} className="btn btn-secondary">{STORE.phone}</a>
              </div>
              <p className="t-body-sm muted" style={{ marginTop: "var(--s-5)" }}>
                Free parking on Sanjaynagar Main Road. Two minutes from Ashwathnagar bus stop.
              </p>
            </div>
            <div>
              <iframe
                className="map-frame"
                src={STORE.mapsEmbed}
                title={`Map to ${STORE.name}, ${STORE.addressLine}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
