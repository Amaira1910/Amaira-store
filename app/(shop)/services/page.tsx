import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/Crumbs";
import SectionHead from "@/components/SectionHead";
import { IconChat, IconClock, IconRefresh, IconShield, IconTools, IconUser } from "@/components/Icons";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "Service, repair and setup",
  description: `Screen and battery replacement, diagnostics, data transfer and setup at Amaira, ${STORE.address.line2}, Bengaluru. Call ${STORE.phone}.`,
  alternates: { canonical: "/services" },
};

const SERVICES = [
  { icon: <IconTools size={24} />, title: "Diagnostics", copy: "Bring it in and we will tell you what is actually wrong, and whether it is worth fixing. Free, and no obligation.", meta: "Free · about 30 minutes" },
  { icon: <IconShield size={24} />, title: "Battery replacement", copy: "Below 80% health, a new battery makes a two-year-old phone feel new again. Genuine parts only.", meta: "From ₹2,900 · same day" },
  { icon: <IconTools size={24} />, title: "Screen replacement", copy: "For iPhone, iPad and Mac. We quote before we start, and we do not start until you say yes.", meta: "Quoted on inspection" },
  { icon: <IconRefresh size={24} />, title: "Data recovery and transfer", copy: "From an old iPhone, an Android, or a Mac that will not boot. We will try before you give up on it.", meta: "Free with a purchase" },
  { icon: <IconUser size={24} />, title: "Setup and handover", copy: "Apple ID, iCloud, email, UPI apps, eSIM activation and a walk-through of anything new to you.", meta: "Free, always" },
  { icon: <IconChat size={24} />, title: "One-to-one help", copy: "Book half an hour with someone patient. Especially good for a first iPhone, or a first Mac.", meta: "Free · book by phone" },
];

export default function ServicesPage() {
  return (
    <>
      <div className="page">
        <Crumbs trail={[{ name: "Home", href: "/" }, { name: "Service", href: "/services" }]} />
        <header style={{ paddingBlock: "var(--s-5) var(--s-7)", maxWidth: "62ch" }}>
          <p className="t-body-sm amber" style={{ fontWeight: 600, marginBottom: 8 }}>Service</p>
          <h1 className="t-display balance">We look after what we sell.</h1>
          <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
            Walk in with a problem and walk out knowing what it is. Diagnostics are free, quotes come
            before any work starts, and nothing gets opened without your say-so.
          </p>
          <div className="row-wrap" style={{ marginTop: "var(--s-5)" }}>
            <a href={STORE.phoneHref} className="btn">Call {STORE.phone}</a>
            <a href={STORE.whatsappHref} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">WhatsApp us</a>
          </div>
        </header>
      </div>

      <section style={{ paddingBottom: "var(--s-8)" }}>
        <div className="page">
          <div className="grid grid-3">
            {SERVICES.map((s) => (
              <div className="tile" key={s.title}>
                <span style={{ color: "var(--blue)", marginBottom: "var(--s-3)" }}>{s.icon}</span>
                <h2 className="tile-name" style={{ fontSize: "var(--t-body-lg)" }}>{s.title}</h2>
                <p className="tile-tagline pretty">{s.copy}</p>
                <div className="tile-foot">
                  <span className="badge">{s.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-mist" id="setup">
        <div className="page reveal">
          <div className="grid grid-2" style={{ gap: "var(--s-8)", alignItems: "center" }}>
            <div>
              <h2 className="t-title balance">Free setup, every single time.</h2>
              <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
                Buy a device here and we will set it up with you before you leave — however long it
                takes, and whatever you are coming from.
              </p>
              <ul className="stack-sm" style={{ marginTop: "var(--s-5)" }}>
                {[
                  "Move everything across from an old iPhone or an Android phone",
                  "Apple ID, iCloud and Family Sharing set up properly",
                  "eSIM activated with your operator, on the spot",
                  "UPI, banking and work email configured and tested",
                  "Watch band sized and paired, AirPods fit-tested",
                  "A plain-words tour of anything you have not used before",
                ].map((t) => (
                  <li key={t} className="row" style={{ alignItems: "flex-start" }}>
                    <IconClock size={17} style={{ color: "var(--blue)", flex: "none", marginTop: 3 }} />
                    <span className="t-body-sm">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card card-bordered" style={{ background: "var(--ground)", padding: "var(--s-6)" }}>
              <h3 className="t-headline" id="applecare">AppleCare+</h3>
              <p className="t-body-sm muted pretty" style={{ marginTop: "var(--s-3)" }}>
                Extends your cover and adds accidental damage protection. Add it when you buy, or
                within 60 days of buying — we will check eligibility for you.
              </p>
              <ul className="stack-sm" style={{ marginTop: "var(--s-4)" }}>
                {[
                  "Unlimited incidents of accidental damage, each with a service fee",
                  "Battery service when capacity falls below 80%",
                  "Priority access to Apple experts",
                  "Cover follows the device if you sell it",
                ].map((t) => (
                  <li key={t} className="t-body-sm muted">· {t}</li>
                ))}
              </ul>
              <p className="t-caption muted" style={{ marginTop: "var(--s-4)" }}>
                Prices vary by product and are shown on each product page.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page reveal" style={{ maxWidth: 760 }}>
          <SectionHead title="Before you bring it in" />
          {[
            { q: "Should I back up first?", a: "Yes, always — to iCloud or to a computer. We take care, but any repair carries a risk to data, and a backup removes the worry entirely. If you cannot back up because the device is dead, tell us and we will try to recover it first." },
            { q: "Do I need an appointment?", a: `No, walk in any time we are open. If you want to be sure someone is free, call ${STORE.phone} and we will keep a slot.` },
            { q: "How long will it take?", a: "Battery and most screen work is same-day. Anything needing a part we do not stock is usually two to four working days — we will tell you the day you come in." },
            { q: "Will a repair void my warranty?", a: "Repairs carried out here using genuine parts do not affect your Apple warranty. If your device is still in warranty and the fault is covered, we will tell you so rather than charge you." },
            { q: "What about a device I did not buy here?", a: "Bring it anyway. We look at anything Apple, whoever sold it." },
            { q: "Do you keep my data?", a: "No. We access only what is needed for the repair, and we do not copy anything off your device." },
          ].map((f) => (
            <details className="acc" key={f.q}>
              <summary className="acc-trigger">{f.q}<span className="acc-icon" aria-hidden="true" /></summary>
              <div className="acc-body"><p>{f.a}</p></div>
            </details>
          ))}
          <p className="t-body-sm muted" style={{ marginTop: "var(--s-6)" }}>
            <Link href="/store">Find the store ›</Link>
          </p>
        </div>
      </section>
    </>
  );
}
