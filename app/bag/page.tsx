import type { Metadata } from "next";
import BagView from "@/components/BagView";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review your bag and check out. Free delivery across Bengaluru, no-cost EMI and free in-store setup.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/bag" },
};

export default function BagPage() {
  return (
    <div className="page" style={{ paddingBlock: "var(--s-6) var(--s-9)" }}>
      <BagView />
    </div>
  );
}
