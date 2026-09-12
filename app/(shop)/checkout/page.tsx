import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "Check out",
  description: "Secure checkout with UPI, cards, net banking and no-cost EMI.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="page" style={{ paddingBlock: "var(--s-6) var(--s-9)" }}>
      <CheckoutForm storePhone={STORE.phone} storeAddress={`${STORE.address.line1}, ${STORE.address.line2}`} />
    </div>
  );
}
