import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/Crumbs";
import SectionHead from "@/components/SectionHead";
import { IconCard, IconRefresh, IconShield, IconTools, IconTruck, IconUser } from "@/components/Icons";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "Support",
  description: `Track an order, book a repair, understand EMI or arrange a return. Amaira support, Sanjaynagar, Bengaluru. Call ${STORE.phone}.`,
  alternates: { canonical: "/support" },
};

const TOPICS = [
  { icon: <IconTruck size={22} />, title: "Orders and delivery", copy: "Where is it, when will it arrive, and what to do if it has not.", href: "/legal/shipping", id: "orders" },
  { icon: <IconRefresh size={22} />, title: "Returns and refunds", copy: "What can go back, by when, and how fast the money comes home.", href: "/legal/returns" },
  { icon: <IconTools size={22} />, title: "Repairs and service", copy: "Free diagnostics, genuine parts, quotes before any work.", href: "/services" },
  { icon: <IconShield size={22} />, title: "Warranty and AppleCare+", copy: "What is covered, what is not, and how to claim.", href: "/legal/warranty" },
  { icon: <IconCard size={22} />, title: "EMI and payment", copy: "How no-cost EMI actually works, and which banks qualify.", href: "/finance" },
  { icon: <IconUser size={22} />, title: "Setup help", copy: "Data transfer, Apple ID, eSIM — free with any device bought here.", href: "/services#setup" },
];

const FAQS = [
  { q: "How do I track my order?", a: `You get an SMS and email with a tracking link as soon as it leaves the shop. Cannot find it? Call ${STORE.phone} with your order reference — it starts with AMR — and we will tell you exactly where it is.` },
  { q: "Can I change my delivery address after ordering?", a: "Yes, if it has not shipped. Call us straight away. Once it is with the courier we can usually still redirect within Bengaluru, but not always." },
  { q: "My order says delivered but I do not have it.", a: "Call us the same day. We hold courier proof-of-delivery including the signature, and we will chase it. You are not left carrying that risk." },
  { q: "Do you price match?", a: "Apple sets the MRP, so authorised sellers are at the same price. Where we differ is what comes with it — free setup, free delivery, free diagnostics, and someone who picks up the phone. If you have seen a genuinely lower price from an authorised seller, tell us and we will look at it." },
  { q: "Is the product the same as buying from Apple directly?", a: "Identical. Same units, same Indian warranty, same serial registration. We are an authorised Apple Premium Reseller." },
  { q: "Can I buy online and collect in store?", a: `Yes — choose collection at checkout. Usually ready within ${STORE.delivery.pickupReadyHours} hours at ${STORE.address.line2}.` },
  { q: "Do you give GST invoices?", a: "On every order. Tick the box at checkout and enter your GSTIN, and we will raise it in your company's name so you can claim input credit." },
  { q: "What if I need help after I have bought something?", a: "Come back in. Setup help, questions, a settings problem, an app that will not behave — bring it to the counter. There is no charge and no time limit." },
];

export default function SupportPage() {
  return (
    <>
      <div className="page">
        <Crumbs trail={[{ name: "Home", href: "/" }, { name: "Support", href: "/support" }]} />
        <header style={{ paddingBlock: "var(--s-5) var(--s-7)", maxWidth: "62ch" }}>
          <h1 className="t-display balance">How can we help?</h1>
          <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
            Most things are quickest by phone — <a href={STORE.phoneHref}>{STORE.phone}</a>. Here is
            everything else.
          </p>
        </header>
      </div>

      <section style={{ paddingBottom: "var(--s-8)" }}>
        <div className="page">
          <div className="grid grid-3">
            {TOPICS.map((t) => (
              <Link key={t.title} href={t.href} id={t.id} className="tile" style={{ color: "inherit", textDecoration: "none" }}>
                <span style={{ color: "var(--blue)", marginBottom: "var(--s-3)" }}>{t.icon}</span>
                <h2 className="tile-name" style={{ fontSize: "var(--t-body-lg)" }}>{t.title}</h2>
                <p className="tile-tagline pretty">{t.copy}</p>
                <div className="tile-foot"><span className="link-cta t-body-sm">Read more ›</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-mist">
        <div className="page reveal" style={{ maxWidth: 760 }}>
          <SectionHead title="Frequently asked" />
          {FAQS.map((f) => (
            <details className="acc" key={f.q}>
              <summary className="acc-trigger">{f.q}<span className="acc-icon" aria-hidden="true" /></summary>
              <div className="acc-body"><p>{f.a}</p></div>
            </details>
          ))}
          <div className="row-wrap" style={{ marginTop: "var(--s-6)" }}>
            <a href={STORE.phoneHref} className="btn">Call {STORE.phone}</a>
            <Link href="/contact" className="btn btn-secondary">Send a message</Link>
          </div>
        </div>
      </section>
    </>
  );
}
