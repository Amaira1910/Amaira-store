import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/Crumbs";
import ProductTile from "@/components/ProductTile";
import SectionHead from "@/components/SectionHead";
import { getProduct } from "@/data/catalog";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "Education pricing",
  description:
    "Special pricing on Mac and iPad for students, parents and teachers at Amaira, Apple Premium Reseller in Sanjaynagar, Bengaluru.",
  alternates: { canonical: "/education" },
};

export default function EducationPage() {
  const picks = ["macbook-air-13-m4", "ipad-air-11-m3", "macbook-pro-14-m4-pro", "apple-pencil-pro"]
    .map((s) => getProduct(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <div className="page">
        <Crumbs trail={[{ name: "Home", href: "/" }, { name: "Education", href: "/education" }]} />
        <header style={{ paddingBlock: "var(--s-5) var(--s-7)", maxWidth: "62ch" }}>
          <p className="t-body-sm amber" style={{ fontWeight: 600, marginBottom: 8 }}>Education</p>
          <h1 className="t-display balance">Student pricing, without the runaround.</h1>
          <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
            Bring a valid student or staff ID to the store and we will apply education pricing on Mac
            and iPad on the spot. Parents buying for a student qualify too.
          </p>
        </header>
      </div>

      <section style={{ paddingBottom: "var(--s-8)" }}>
        <div className="page">
          <div className="notice notice-blue" style={{ marginBottom: "var(--s-6)" }}>
            <span>
              <strong>Education pricing is applied in store, not online.</strong> It needs an ID check,
              so the prices on this site are the standard ones. Come in, or call{" "}
              <a href={STORE.phoneHref}>{STORE.phone}</a> and we will quote you.
            </span>
          </div>

          <SectionHead title="What students actually buy" sub="Ranked by what walks out of our shop each August." />
          <div className="grid grid-3">
            {picks.map((p) => <ProductTile key={p.slug} product={p} />)}
          </div>
        </div>
      </section>

      <section className="section section-mist">
        <div className="page reveal" style={{ maxWidth: 760 }}>
          <SectionHead title="Who qualifies" />
          <ul className="stack-sm">
            {[
              "Students enrolled at, or accepted into, any college or university",
              "Parents buying on behalf of an enrolled student",
              "Teachers and staff at any educational institution",
              "Students of schools, with a parent present",
            ].map((t) => <li key={t} className="t-body muted">· {t}</li>)}
          </ul>
          <p className="t-body-sm muted" style={{ marginTop: "var(--s-5)" }}>
            Bring a student ID card, an admission letter or a staff ID. One device per student per
            academic year, in line with Apple&rsquo;s programme terms.
          </p>
          <p className="t-body-sm muted" style={{ marginTop: "var(--s-4)" }}>
            Buying for a whole department? <Link href="/business">Talk to us about institutional orders ›</Link>
          </p>
        </div>
      </section>
    </>
  );
}
