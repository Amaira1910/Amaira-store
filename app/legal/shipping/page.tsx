import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Delivery times, charges and coverage for orders from Amaira, Bengaluru.",
  alternates: { canonical: "/legal/shipping" },
};

export default function Shipping() {
  return (
    <LegalPage
      title="Shipping and Delivery"
      href="/legal/shipping"
      updated="September 2026"
      lead="Where we deliver, how long it takes, and what it costs. Which is nothing."
    >
      <h2>1. Delivery is free</h2>
      <p>
        On every order, to every serviceable PIN code in India, with no minimum value. There is no
        express upgrade to sell you — everything goes by the fastest route we have.
      </p>

      <h2>2. How long it takes</h2>
      <table>
        <thead><tr><th>Where</th><th>When</th></tr></thead>
        <tbody>
          <tr><td>Bengaluru, ordered before {STORE.delivery.citySameDayCutoff}</td><td>Same day</td></tr>
          <tr><td>Bengaluru, ordered after {STORE.delivery.citySameDayCutoff}</td><td>Next working day</td></tr>
          <tr><td>Karnataka, outside Bengaluru</td><td>1–3 working days</td></tr>
          <tr><td>Rest of India (metro)</td><td>2–4 working days</td></tr>
          <tr><td>Rest of India (other)</td><td>3–7 working days</td></tr>
        </tbody>
      </table>
      <p>
        Made-to-order configurations take longer — the product page tells you before you buy. Times
        are working days and exclude Sundays and public holidays.
      </p>

      <h2>3. Collecting in store</h2>
      <p>
        Choose collection at checkout and we will have it ready at {STORE.address.line1},{" "}
        {STORE.address.line2}, usually within {STORE.delivery.pickupReadyHours} hours. We text you
        when it is ready. Bring the order reference and a photo ID. Somebody else collecting on your
        behalf needs both, plus a note from you.
      </p>
      <p>We hold collection orders for 7 days, then call you before doing anything else.</p>

      <h2>4. On the day</h2>
      <ul>
        <li>You get a tracking link by SMS and email.</li>
        <li>Someone over 18 must be present to sign.</li>
        <li>Photo ID is required for orders above ₹50,000.</li>
        <li>Please check the box is sealed and undamaged before signing.</li>
      </ul>

      <h2>5. If something is wrong on arrival</h2>
      <p>
        Refuse the delivery if the packaging is open or damaged, and tell us the same day. If you
        only spot it after opening, photograph everything and call us within 48 hours. We will sort
        it out — that is what the courier insurance is for.
      </p>

      <h2>6. Where we do not deliver</h2>
      <p>
        A small number of PIN codes are not serviceable for high-value electronics. If yours is one,
        checkout will tell you, and we will suggest the nearest address we can reach.
      </p>

      <h2>7. Risk and title</h2>
      <p>
        Risk passes to you on delivery, or on collection from the store. Title passes when we receive
        payment in full.
      </p>
    </LegalPage>
  );
}
