import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Returns and Refunds",
  description: "How returns, cancellations, exchanges and refunds work at Amaira.",
  alternates: { canonical: "/legal/returns" },
};

export default function Returns() {
  return (
    <LegalPage
      title="Returns and Refunds"
      href="/legal/returns"
      updated="September 2026"
      lead="What you can send back, by when, and how quickly the money comes home."
    >
      <h2>The short version</h2>
      <ul>
        <li><strong>Unopened, unused, within 7 days:</strong> full refund, no questions.</li>
        <li><strong>Opened but faulty:</strong> we replace or repair under warranty, whatever suits you better.</li>
        <li><strong>Opened and not faulty:</strong> we cannot take it back — Apple activation ties the device to you. We will still help you sell or trade it.</li>
        <li><strong>Refunds:</strong> back to the original payment method within 5 to 7 working days of us receiving the item.</li>
      </ul>

      <h2>1. Cancelling before dispatch</h2>
      <p>
        Call us on the number at the bottom of this page, or reply to your order confirmation, and we
        will cancel and refund in full. If the order has already left the shop, treat it as a return.
      </p>

      <h2>2. Returning an unopened product</h2>
      <p>
        You have 7 days from delivery or collection. The product must be unopened, with the seal
        intact and all packaging present. Bring it to the store, or call and we will collect it from
        anywhere in Bengaluru at no charge.
      </p>
      <p>
        Once we have the item and confirm it is unopened, we raise the refund the same day. Banks
        typically take 5 to 7 working days to show it.
      </p>

      <h2>3. Opened products</h2>
      <p>
        An Apple device is registered to you on first activation, which is why an opened,
        non-faulty product cannot be returned for a refund. This is Apple&rsquo;s policy and applies
        at every authorised reseller, including Apple&rsquo;s own stores.
      </p>
      <p>
        If you have changed your mind about an opened device, talk to us anyway. We will usually be
        able to trade it in against something more suitable, which gets you most of the way there.
      </p>

      <h2>4. Faulty products</h2>
      <p>
        A product that is faulty out of the box is a different matter entirely. Bring it in within 7
        days and we will replace it. Beyond 7 days, it is handled under the Apple limited warranty —
        see <Link href="/legal/warranty">Warranty</Link>.
      </p>
      <p>
        Nothing on this page limits your rights under the Consumer Protection Act, 2019, or any other
        law that applies to you.
      </p>

      <h2>5. What we cannot take back</h2>
      <ul>
        <li>Engraved products, unless the engraving is our error.</li>
        <li>Opened software, gift cards and digital content.</li>
        <li>AirPods ear tips and other hygiene items, once opened.</li>
        <li>Products damaged after delivery, or with a missing serial label.</li>
      </ul>

      <h2>6. Exchanges</h2>
      <p>
        Wrong colour or wrong capacity, unopened, within 7 days? Bring it in and we will swap it.
        You pay or receive the difference in price. Only one exchange per order.
      </p>

      <h2>7. How refunds are paid</h2>
      <table>
        <thead><tr><th>Paid by</th><th>Refunded to</th><th>Typical time</th></tr></thead>
        <tbody>
          <tr><td>UPI</td><td>Same UPI ID</td><td>1–3 working days</td></tr>
          <tr><td>Credit or debit card</td><td>Same card</td><td>5–7 working days</td></tr>
          <tr><td>Net banking</td><td>Same account</td><td>5–7 working days</td></tr>
          <tr><td>EMI</td><td>Same card; the bank cancels remaining instalments</td><td>7–10 working days</td></tr>
          <tr><td>Cash in store</td><td>Bank transfer or cash</td><td>Same day</td></tr>
        </tbody>
      </table>
      <p>
        On a cancelled no-cost EMI, banks usually reverse the discount they gave and may retain a
        processing fee. That fee is the bank&rsquo;s and we cannot refund it.
      </p>

      <h2>8. Trade-ins</h2>
      <p>
        If you traded a device in and then return the new one, we return your old device if we still
        have it, or refund the agreed trade-in value if we do not.
      </p>
    </LegalPage>
  );
}
