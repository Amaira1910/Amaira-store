import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/Crumbs";
import SectionHead from "@/components/SectionHead";
import TradeInEstimator from "@/components/TradeInEstimator";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "Trade in your old device",
  description:
    "Get an instant estimate for your old iPhone, iPad, Mac or Apple Watch, then bring it to Amaira in Sanjaynagar. The value comes straight off your new device.",
  alternates: { canonical: "/trade-in" },
};

const STEPS = [
  { n: 1, title: "Estimate it here", copy: "Pick your model and be honest about the condition. Takes about twenty seconds." },
  { n: 2, title: "Bring it in", copy: "Come to Sanjaynagar with the device, a photo ID and the charger if you have it." },
  { n: 3, title: "We check it together", copy: "Battery health, screen, body, storage and that Find My is off. No back-room inspection." },
  { n: 4, title: "It comes off the bill", copy: "We confirm the value and deduct it from your new device on the spot." },
];

export default function TradeInPage() {
  return (
    <>
      <div className="page">
        <Crumbs trail={[{ name: "Home", href: "/" }, { name: "Trade in", href: "/trade-in" }]} />
        <header style={{ paddingBlock: "var(--s-5) var(--s-7)", maxWidth: "62ch" }}>
          <p className="t-body-sm amber" style={{ fontWeight: 600, marginBottom: 8 }}>Trade in</p>
          <h1 className="t-display balance">Your old one is worth something.</h1>
          <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
            Estimate it in twenty seconds, then bring it to Sanjaynagar. We check it in front of you,
            agree a number, and take it straight off the new device.
          </p>
        </header>
      </div>

      <section style={{ paddingBottom: "var(--s-9)" }}>
        <div className="page">
          <TradeInEstimator phone={STORE.phone} phoneHref={STORE.phoneHref} />
        </div>
      </section>

      <section className="section section-mist" id="how">
        <div className="page reveal">
          <SectionHead title="How it works" sub="Four steps, and none of them involve posting your phone to a stranger." />
          <div className="grid grid-4">
            {STEPS.map((s) => (
              <div key={s.n} className="highlight" style={{ background: "var(--ground)" }}>
                <p className="t-headline" style={{ color: "var(--ink-3)", marginBottom: 8 }}>{s.n}</p>
                <p className="highlight-title">{s.title}</p>
                <p className="highlight-copy pretty">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page reveal" style={{ maxWidth: 760 }}>
          <SectionHead title="Questions people actually ask" />
          {[
            {
              q: "Do I have to buy something to trade in?",
              a: "Yes. Trade-in value is applied against a new purchase — it is not a cash buy-back. If you just want to sell, tell us and we will point you somewhere fair.",
            },
            {
              q: "What if the estimate and the in-store value differ?",
              a: "It happens, usually because of battery health or a screen mark that photographs badly. We show you exactly what changed. You are free to walk away — nothing is binding until you accept.",
            },
            {
              q: "What happens to my data?",
              a: "We wipe the device in front of you before it leaves the counter. Sign out of iCloud and turn off Find My first, or we cannot accept it at all.",
            },
            {
              q: "Do you take Android phones?",
              a: "Yes, for most recent Samsung, OnePlus and Pixel models. The estimator above does not cover them — call us on " + STORE.phone + " and we will quote over the phone.",
            },
            {
              q: "Is there GST on a trade-in?",
              a: "The new device is invoiced at full value with GST, and the trade-in is settled separately as a purchase from you. Your invoice will show both lines clearly.",
            },
          ].map((f) => (
            <details className="acc" key={f.q}>
              <summary className="acc-trigger">{f.q}<span className="acc-icon" aria-hidden="true" /></summary>
              <div className="acc-body"><p>{f.a}</p></div>
            </details>
          ))}
          <p className="t-body-sm muted" style={{ marginTop: "var(--s-6)" }}>
            Still unsure? <Link href="/contact">Ask us ›</Link>
          </p>
        </div>
      </section>
    </>
  );
}
