import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "Warranty",
  description: "What the Apple limited warranty covers, what AppleCare+ adds, and how to claim at Amaira.",
  alternates: { canonical: "/legal/warranty" },
};

export default function Warranty() {
  return (
    <LegalPage
      title="Warranty"
      href="/legal/warranty"
      updated="September 2026"
      lead="What is covered, what is not, and how to get it fixed without an argument."
    >
      <h2>1. What you get as standard</h2>
      <p>
        Every new Apple product sold here carries Apple&rsquo;s one-year limited warranty against
        manufacturing defects, plus 90 days of complimentary technical support. This is Apple&rsquo;s
        warranty, honoured anywhere Apple operates — not a shop-specific promise.
      </p>
      <p>Accessories in the box are covered for one year on the same terms.</p>

      <h2>2. What the warranty covers</h2>
      <ul>
        <li>Manufacturing defects in materials or workmanship.</li>
        <li>A battery that holds less than 80% of its original capacity within the warranty period, under normal use.</li>
        <li>Hardware that fails without being dropped, crushed or soaked.</li>
      </ul>

      <h2>3. What it does not cover</h2>
      <ul>
        <li>Accidental damage — cracked screens, bent frames, liquid ingress.</li>
        <li>Normal cosmetic wear.</li>
        <li>Damage from a non-genuine part, or a repair done elsewhere.</li>
        <li>Consumables, and damage from misuse or modification.</li>
        <li>Loss or theft.</li>
      </ul>
      <p>
        <Link href="/services#applecare">AppleCare+</Link> covers most of the first item, and that is
        largely why it exists.
      </p>

      <h2>4. Claiming</h2>
      <ol>
        <li>Back up your device if you possibly can.</li>
        <li>Turn off Find My — we cannot accept a device for service with it enabled.</li>
        <li>Bring the device and your invoice to {STORE.address.line1}, {STORE.address.line2}.</li>
        <li>We diagnose it free and tell you whether it is a warranty claim.</li>
      </ol>
      <p>
        No appointment needed. Call <a href={STORE.phoneHref}>{STORE.phone}</a> first if you want to
        be sure a technician is free.
      </p>

      <h2>5. How long a repair takes</h2>
      <table>
        <thead><tr><th>Type</th><th>Usually</th></tr></thead>
        <tbody>
          <tr><td>Diagnostics</td><td>About 30 minutes, free</td></tr>
          <tr><td>Battery replacement</td><td>Same day</td></tr>
          <tr><td>Screen replacement</td><td>Same day to 2 days</td></tr>
          <tr><td>Logic board or sent to Apple</td><td>5–10 working days</td></tr>
        </tbody>
      </table>

      <h2>6. Your statutory rights</h2>
      <p>
        The Apple limited warranty is in addition to, and does not replace, your rights under the
        Consumer Protection Act, 2019. A product must be of satisfactory quality and fit for
        purpose. Where it is not, you have rights against us as the seller regardless of what any
        manufacturer warranty says.
      </p>

      <h2>7. Products not bought here</h2>
      <p>
        We will look at any Apple product, whoever sold it. Warranty claims on a device bought
        elsewhere are still valid — Apple&rsquo;s warranty travels with the device — and we will
        process it for you.
      </p>

      <h2>8. Grey imports</h2>
      <p>
        We do not sell imported units, and we cannot service them under Indian warranty. If you bring
        one in, we will tell you honestly what can and cannot be done with it.
      </p>
    </LegalPage>
  );
}
