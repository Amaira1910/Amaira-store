import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "Terms of Sale",
  description: "The terms on which Amaira sells to you.",
  alternates: { canonical: "/legal/terms" },
};

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Sale"
      href="/legal/terms"
      updated="September 2026"
      lead="The terms you accept when you buy from us. Written to be read, not to be skipped."
    >
      <h2>1. Who you are buying from</h2>
      <p>
        {STORE.legalName}, an independent Apple Premium Reseller at {STORE.addressLine}. We are not
        Apple Inc., and Apple is not a party to your contract with us.
      </p>

      <h2>2. When a contract exists</h2>
      <p>
        Placing an order is an offer to buy. A contract forms when we confirm the order by email
        after payment clears. Until then we can decline an order — for example if the price was
        wrong, if a product is genuinely unavailable, or if we suspect fraud. If we decline after
        taking payment, we refund in full.
      </p>

      <h2>3. Prices</h2>
      <ul>
        <li>All prices are in Indian Rupees and include GST at the applicable rate.</li>
        <li>Prices can change without notice, but never after we have confirmed your order.</li>
        <li>
          If an obvious pricing error appears on the site — a figure off by an order of magnitude, say
          — we will contact you rather than fulfil it, and refund you in full if you do not want to
          proceed at the correct price.
        </li>
      </ul>

      <h2>4. Payment</h2>
      <p>
        Payments are handled by Razorpay Software Private Limited. We do not receive, store or have
        access to your card, UPI or banking credentials. EMI terms, eligibility and any processing
        fee are set by your bank, not by us — see <Link href="/finance">EMI and finance</Link>.
      </p>

      <h2>5. Delivery and collection</h2>
      <p>
        Set out in the <Link href="/legal/shipping">Shipping Policy</Link>. Delivery estimates are
        estimates. Where a delay is our fault and material, you may cancel for a full refund.
      </p>

      <h2>6. Returns</h2>
      <p>
        Set out in <Link href="/legal/returns">Returns and Refunds</Link>. In summary: unopened and
        unused within 7 days, full refund; opened and faulty, replaced or repaired; opened and not
        faulty, we cannot take it back.
      </p>

      <h2>7. Warranty</h2>
      <p>
        Products carry the Apple limited warranty described in{" "}
        <Link href="/legal/warranty">Warranty</Link>. Nothing in these terms reduces your rights
        under the Consumer Protection Act, 2019, or the Sale of Goods Act, 1930.
      </p>

      <h2>8. Product information</h2>
      <p>
        We take care to describe products accurately, but specifications change and mistakes happen.
        The product images on this site are original illustrations, not photographs of the retail
        item — colours are indicative. Where a description is wrong in a way that matters, you may
        return the product under clause 6 even if opened.
      </p>

      <h2>9. Engraving</h2>
      <p>
        Engraved products cannot be returned unless the engraving is our error. We will not engrave
        anything unlawful, obscene, or infringing on someone else&rsquo;s rights, and we will refund
        rather than engrave in those cases.
      </p>

      <h2>10. Our liability</h2>
      <p>
        We are liable for losses that are a foreseeable result of our breaking this contract or
        failing to use reasonable care. We are not liable for business losses, loss of profit, or
        loss of data — please keep your own backups. Nothing here limits our liability for death or
        personal injury caused by negligence, for fraud, or for anything else that cannot lawfully
        be limited.
      </p>

      <h2>11. If something goes wrong</h2>
      <p>
        Tell us first — call <a href={STORE.phoneHref}>{STORE.phone}</a> or email{" "}
        <a href={`mailto:${STORE.email}`}>{STORE.email}</a>. Most things are sorted out in one
        conversation. If not, you retain every right you have under consumer law, including
        approaching the appropriate consumer forum.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These terms are governed by the laws of India. The courts at Bengaluru, Karnataka have
        jurisdiction, without prejudice to your right to bring a consumer complaint where you live.
      </p>
    </LegalPage>
  );
}
