import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/Crumbs";
import EmiCalculator from "@/components/EmiCalculator";
import SectionHead from "@/components/SectionHead";
import { IconCard, IconCheck, IconLock, IconRefresh } from "@/components/Icons";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "EMI and finance",
  description: `No-cost EMI from 3 to 12 months on credit cards from ${STORE.emiBanks.length} banks, plus debit-card EMI and cardless options. Work out your monthly payment at Amaira, Bengaluru.`,
  alternates: { canonical: "/finance" },
};

export default function FinancePage() {
  return (
    <>
      <div className="page">
        <Crumbs trail={[{ name: "Home", href: "/" }, { name: "EMI and finance", href: "/finance" }]} />
        <header style={{ paddingBlock: "var(--s-5) var(--s-7)", maxWidth: "62ch" }}>
          <p className="t-body-sm amber" style={{ fontWeight: 600, marginBottom: 8 }}>Finance</p>
          <h1 className="t-display balance">Pay monthly. Pay nothing extra.</h1>
          <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
            No-cost EMI means exactly that: the price divided by the number of months, with the
            interest absorbed as a discount. Work out your payment below.
          </p>
        </header>
      </div>

      <section style={{ paddingBottom: "var(--s-9)" }}>
        <div className="page">
          <EmiCalculator banks={STORE.emiBanks} />
        </div>
      </section>

      <section className="section section-mist">
        <div className="page reveal">
          <SectionHead title="Ways to pay" align="center" />
          <div className="grid grid-3" style={{ marginTop: "var(--s-6)" }}>
            {[
              { icon: <IconCard size={24} />, title: "Credit card EMI", copy: `3, 6, 9 and 12 months at no cost on cards from ${STORE.emiBanks.slice(0, 4).join(", ")} and six more banks. 18 and 24 months at your bank's standard rate.` },
              { icon: <IconCard size={24} />, title: "Debit card EMI", copy: "Pre-approved customers of selected banks can pay monthly from a savings account, with no credit card at all." },
              { icon: <IconRefresh size={24} />, title: "Cardless EMI", copy: "Through Razorpay's lending partners. Approval is instant and happens inside the payment window." },
              { icon: <IconLock size={24} />, title: "UPI and net banking", copy: "Pay in full from any UPI app or bank account. Nothing is stored on our side." },
              { icon: <IconCheck size={24} />, title: "Trade-in first", copy: "Reduce the amount you finance by trading in your old device. Fewer months, or a smaller payment." },
              { icon: <IconCard size={24} />, title: "Pay in store", copy: "Cards, UPI and cash at the counter, with the same EMI plans available on the terminal." },
            ].map((t) => (
              <div className="highlight" key={t.title} style={{ background: "var(--ground)" }}>
                <span style={{ color: "var(--blue)", display: "block", marginBottom: 10 }}>{t.icon}</span>
                <p className="highlight-title">{t.title}</p>
                <p className="highlight-copy pretty">{t.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page reveal" style={{ maxWidth: 760 }}>
          <SectionHead title="The fine print, in plain words" />
          {[
            { q: "Is no-cost EMI really free?", a: "For you, yes — you pay the price divided by the months, and nothing more. Your bank still charges interest; we absorb it as an upfront discount so the totals match. Some banks show that interest on your statement alongside a matching discount line. The amount leaving your account is the price." },
            { q: "Will my bank charge processing fees?", a: "Some banks charge a one-time processing fee of ₹99 to ₹299 on EMI conversions. That fee is the bank's, not ours, and we cannot waive it. It will appear on your card statement." },
            { q: "What if I foreclose early?", a: "Most banks allow it and charge a foreclosure fee, typically 3% of the outstanding. If you foreclose a no-cost EMI, banks usually claw back the discount. Speak to your bank before you do." },
            { q: "Can I use EMI on a trade-in purchase?", a: "Yes. We deduct the trade-in value first, then finance whatever is left." },
            { q: "Does EMI work on accessories?", a: "On orders of ₹6,000 and above, yes — including accessory-only orders." },
            { q: "Who approves it?", a: "Your bank, inside the Razorpay payment window. We never see your card number, your limit or the decision reason." },
          ].map((f) => (
            <details className="acc" key={f.q}>
              <summary className="acc-trigger">{f.q}<span className="acc-icon" aria-hidden="true" /></summary>
              <div className="acc-body"><p>{f.a}</p></div>
            </details>
          ))}
          <p className="t-body-sm muted" style={{ marginTop: "var(--s-6)" }}>
            Something not covered here? <Link href="/contact">Ask us</Link> or call <a href={STORE.phoneHref}>{STORE.phone}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
