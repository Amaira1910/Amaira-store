import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Amaira collects, why, who we share it with, and how to get it deleted.",
  alternates: { canonical: "/legal/privacy" },
};

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      href="/legal/privacy"
      updated="September 2026"
      lead="What we collect, why we collect it, and how to make us delete it."
    >
      <h2>The short version</h2>
      <ul>
        <li>We collect your name, contact details and address so we can sell and deliver to you. Nothing else.</li>
        <li><strong>We never see your card details.</strong> Payments go straight to Razorpay.</li>
        <li>We do not sell your data, and we do not add you to a mailing list you did not ask for.</li>
        <li>Email us and we will delete what we hold.</li>
      </ul>

      <h2>1. Who we are</h2>
      <p>
        {STORE.legalName}, {STORE.addressLine}. For anything on this page, contact{" "}
        <a href={`mailto:${STORE.email}`}>{STORE.email}</a> or call{" "}
        <a href={STORE.phoneHref}>{STORE.phone}</a>.
      </p>

      <h2>2. What we collect</h2>
      <table>
        <thead><tr><th>What</th><th>Why</th><th>How long</th></tr></thead>
        <tbody>
          <tr><td>Name, email, mobile number</td><td>To process your order and reach you about it</td><td>8 years (tax records)</td></tr>
          <tr><td>Delivery address</td><td>To deliver</td><td>8 years (tax records)</td></tr>
          <tr><td>GSTIN, if you give one</td><td>To raise a business invoice</td><td>8 years (tax records)</td></tr>
          <tr><td>Order and payment reference</td><td>To support, refund and account for the sale</td><td>8 years</td></tr>
          <tr><td>Device serial numbers</td><td>For warranty and service history</td><td>5 years</td></tr>
          <tr><td>Enquiry messages</td><td>To answer you</td><td>2 years</td></tr>
        </tbody>
      </table>

      <h2>3. What we deliberately do not collect</h2>
      <ul>
        <li><strong>Card numbers, CVVs, UPI PINs, bank credentials.</strong> These are entered inside Razorpay&rsquo;s window and never touch our server.</li>
        <li>Anything from a device you bring in for service, beyond what the repair requires.</li>
        <li>Advertising or cross-site tracking identifiers. There are no third-party ad pixels on this site.</li>
      </ul>

      <h2>4. Cookies and local storage</h2>
      <p>
        This site uses your browser&rsquo;s local storage to remember your bag between visits. That
        data stays on your device and is never sent to us until you check out. There are no
        advertising cookies. If you clear your browser storage, your bag empties — nothing else is
        affected.
      </p>

      <h2>5. Who else sees your data</h2>
      <ul>
        <li><strong>Razorpay</strong> — payment processing. They are PCI-DSS Level 1 certified and have their own privacy policy.</li>
        <li><strong>Our courier</strong> — your name, address and phone, for delivery only.</li>
        <li><strong>Apple</strong> — device serial and warranty registration, where a service claim requires it.</li>
        <li><strong>Our accountant and the tax authorities</strong> — invoices, as the law requires.</li>
      </ul>
      <p>That is the complete list. Nobody else, and no data broker, ever.</p>

      <h2>6. Your rights</h2>
      <p>Under the Digital Personal Data Protection Act, 2023, you can ask us to:</p>
      <ul>
        <li>tell you what we hold about you;</li>
        <li>correct anything that is wrong;</li>
        <li>delete what we hold, except records we must keep for tax; and</li>
        <li>stop contacting you.</li>
      </ul>
      <p>
        Email <a href={`mailto:${STORE.email}`}>{STORE.email}</a> and we will respond within 30 days.
        We will ask you to confirm who you are first, so that nobody else can make the request on
        your behalf.
      </p>

      <h2>7. Security</h2>
      <p>
        The site is served over HTTPS. Order data is held on servers with restricted access, and
        only the people who need it can see it. If a breach ever affects you, we will tell you and
        the Data Protection Board, promptly and plainly.
      </p>

      <h2>8. Children</h2>
      <p>
        This site is not aimed at children under 18, and we do not knowingly collect their data. A
        parent or guardian should place the order.
      </p>

      <h2>9. Changes</h2>
      <p>
        If this policy changes materially, we will say so at the top of this page and update the date.
      </p>
    </LegalPage>
  );
}
