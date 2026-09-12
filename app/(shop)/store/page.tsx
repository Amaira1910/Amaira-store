import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/Crumbs";
import SectionHead from "@/components/SectionHead";
import { IconChat, IconClock, IconPhone, IconPin, IconTools, IconTruck } from "@/components/Icons";
import { STORE } from "@/data/store";
import { istWeekday, openState } from "@/lib/format";

export const metadata: Metadata = {
  title: "Visit our Sanjaynagar store",
  description: `${STORE.name}, Apple Premium Reseller at ${STORE.addressLine}. Open Monday to Saturday 10am–9pm, Sunday 11am–8pm. Call ${STORE.phone}.`,
  alternates: { canonical: "/store" },
  openGraph: { title: `Visit ${STORE.name} — ${STORE.address.line2}`, description: STORE.tagline },
};

/* Rendered fresh so "open now" is never a stale cached answer. */
export const dynamic = "force-dynamic";

export default function StorePage() {
  const status = openState();
  const today = istWeekday();

  return (
    <>
      <section className="store-hero">
        <div>
          <p className="t-body-sm" style={{ opacity: 0.75, marginBottom: 10 }}>{STORE.descriptor}</p>
          <h1 className="t-hero balance">Come and see it in person.</h1>
          <p className="t-body-lg pretty" style={{ marginTop: "var(--s-4)", opacity: 0.85, maxWidth: "52ch", marginInline: "auto" }}>
            {STORE.address.line1}, {STORE.address.line2}, {STORE.address.city} {STORE.address.pincode}
          </p>
          <p className={`t-body ${status.open ? "" : ""}`} style={{ marginTop: "var(--s-4)", fontWeight: 500, color: status.open ? "#5ed17c" : "#ffb85c" }}>
            {status.label}
          </p>
          <div className="hero-cta" style={{ marginTop: "var(--s-5)" }}>
            <a href={STORE.mapsLink} className="btn btn-on-dark" target="_blank" rel="noopener noreferrer">Get directions</a>
            <a href={STORE.phoneHref} className="btn btn-secondary" style={{ borderColor: "#fff", color: "#fff" }}>{STORE.phone}</a>
          </div>
        </div>
      </section>

      <div className="page">
        <Crumbs trail={[{ name: "Home", href: "/" }, { name: "Store", href: "/store" }]} />
      </div>

      <section className="section-tight">
        <div className="page">
          <div className="store-grid">
            <div>
              <h2 className="t-title balance">Finding us</h2>
              <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
                We are on Sanjaynagar Main Road in Ashwathnagar, in Rishabh Arcade. There is parking
                right outside, and the Ashwathnagar bus stop is a two-minute walk.
              </p>

              <div className="stack" style={{ marginTop: "var(--s-6)" }}>
                <div className="contact-card">
                  <span className="contact-card-icon"><IconPin size={20} /></span>
                  <div>
                    <p className="t-body" style={{ fontWeight: 600 }}>Address</p>
                    <p className="t-body-sm muted">
                      {STORE.address.line1}<br />
                      {STORE.address.line2}<br />
                      {STORE.address.city}, {STORE.address.state} {STORE.address.pincode}
                    </p>
                    <a href={STORE.mapsLink} className="link-cta t-body-sm" target="_blank" rel="noopener noreferrer" style={{ marginTop: 8 }}>
                      Open in Maps ›
                    </a>
                  </div>
                </div>

                <div className="contact-card">
                  <span className="contact-card-icon"><IconPhone size={20} /></span>
                  <div>
                    <p className="t-body" style={{ fontWeight: 600 }}>Call or message</p>
                    <p className="t-body-sm muted">
                      <a href={STORE.phoneHref}>{STORE.phone}</a> — we answer during shop hours.
                    </p>
                    <p className="t-body-sm muted" style={{ marginTop: 4 }}>
                      <a href={STORE.whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp us</a> for stock checks and quotes.
                    </p>
                  </div>
                </div>

                <div className="contact-card">
                  <span className="contact-card-icon"><IconClock size={20} /></span>
                  <div style={{ width: "100%" }}>
                    <p className="t-body" style={{ fontWeight: 600, marginBottom: 8 }}>Opening hours</p>
                    {STORE.hours.map((h, i) => (
                      <div className={`hours-row${i === today ? " is-today" : ""}`} key={h.day}>
                        <span>{h.day}{i === today ? " (today)" : ""}</span>
                        <span className="tnum">{fmt(h.open)} – {fmt(h.close)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
              <p className="t-caption muted" style={{ marginTop: "var(--s-3)" }}>
                Free customer parking on Sanjaynagar Main Road, in front of the arcade.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-mist">
        <div className="page reveal">
          <SectionHead
            title="What you can do here that you cannot do online"
            sub="This is the whole point of a shop."
            align="center"
          />
          <div className="trust-grid" style={{ marginTop: "var(--s-6)" }}>
            {[
              { icon: <IconChat size={24} />, title: "Ask a real question", copy: "Which MacBook for design school? Is the Pro worth it for you? We will tell you honestly, even when the answer is the cheaper one." },
              { icon: <IconTools size={24} />, title: "Set-up while you wait", copy: "Data transfer from any phone, Apple ID, email, UPI apps and eSIM activation. Free, every time." },
              { icon: <IconClock size={24} />, title: "Watch sizing and band wall", copy: "Try every band on your own wrist before you commit to one." },
              { icon: <IconTruck size={24} />, title: "Buy online, collect here", copy: "Order from this site and pick it up in about two hours." },
            ].map((t) => (
              <div className="trust-item" key={t.title}>
                <span className="trust-icon">{t.icon}</span>
                <p className="trust-title">{t.title}</p>
                <p className="trust-copy pretty">{t.copy}</p>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: "var(--s-7)" }}>
            <Link href="/services" className="btn">Book a service visit</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function fmt(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}
