import type { Metadata } from "next";
import Crumbs from "@/components/Crumbs";
import ContactForm from "@/components/ContactForm";
import { IconChat, IconClock, IconPhone, IconPin } from "@/components/Icons";
import { STORE } from "@/data/store";
import { openState } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Call ${STORE.phone}, WhatsApp us, or visit ${STORE.addressLine}. We answer during shop hours.`,
  alternates: { canonical: "/contact" },
};

export const dynamic = "force-dynamic";

export default function ContactPage() {
  const status = openState();

  return (
    <div className="page" style={{ paddingBottom: "var(--s-9)" }}>
      <Crumbs trail={[{ name: "Home", href: "/" }, { name: "Contact", href: "/contact" }]} />

      <header style={{ paddingBlock: "var(--s-5) var(--s-7)", maxWidth: "62ch" }}>
        <h1 className="t-display balance">Talk to us.</h1>
        <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
          A real shop with real people in it. Phone is fastest, WhatsApp is easiest, and the form
          below reaches us within a working day.
        </p>
      </header>

      <div className="grid grid-2" style={{ gap: "var(--s-8)", alignItems: "start" }}>
        <div className="stack">
          <div className="contact-card">
            <span className="contact-card-icon"><IconPhone size={20} /></span>
            <div>
              <p className="t-body" style={{ fontWeight: 600 }}>Call the shop</p>
              <p className="t-headline"><a href={STORE.phoneHref}>{STORE.phone}</a></p>
              <p className="t-caption muted" style={{ marginTop: 4 }}>{status.label}</p>
            </div>
          </div>

          <div className="contact-card">
            <span className="contact-card-icon"><IconChat size={20} /></span>
            <div>
              <p className="t-body" style={{ fontWeight: 600 }}>WhatsApp</p>
              <p className="t-body-sm muted">
                Best for stock checks, quotes and sending a photo of a cracked screen.
              </p>
              <a href={STORE.whatsappHref} className="link-cta t-body-sm" target="_blank" rel="noopener noreferrer" style={{ marginTop: 6 }}>
                Open WhatsApp ›
              </a>
            </div>
          </div>

          <div className="contact-card">
            <span className="contact-card-icon"><IconPin size={20} /></span>
            <div>
              <p className="t-body" style={{ fontWeight: 600 }}>Visit</p>
              <p className="t-body-sm muted">
                {STORE.address.line1}<br />{STORE.address.line2}<br />
                {STORE.address.city}, {STORE.address.state} {STORE.address.pincode}
              </p>
              <a href={STORE.mapsLink} className="link-cta t-body-sm" target="_blank" rel="noopener noreferrer" style={{ marginTop: 6 }}>
                Get directions ›
              </a>
            </div>
          </div>

          <div className="contact-card">
            <span className="contact-card-icon"><IconClock size={20} /></span>
            <div>
              <p className="t-body" style={{ fontWeight: 600 }}>Hours</p>
              <p className="t-body-sm muted">
                Monday to Saturday, 10am – 9pm<br />
                Sunday, 11am – 8pm
              </p>
              <p className="t-caption muted" style={{ marginTop: 6 }}>
                Email: <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="t-headline" style={{ marginBottom: "var(--s-4)" }}>Send a message</h2>
          <ContactForm
            phone={STORE.phone}
            phoneHref={STORE.phoneHref}
            email={STORE.email}
            whatsappHref={STORE.whatsappHref}
          />
        </div>
      </div>
    </div>
  );
}
