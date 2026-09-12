import Link from "next/link";
import { STORE } from "@/data/store";

export const metadata = {
  title: "You are offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="page" style={{ paddingBlock: "var(--s-10)", maxWidth: 560, textAlign: "center" }}>
      <h1 className="t-title balance">No connection.</h1>
      <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
        This page needs the network and cannot reach it. Anything you have already
        looked at will still open, and your bag is saved on this device.
      </p>

      <div className="row-wrap" style={{ justifyContent: "center", marginTop: "var(--s-6)" }}>
        <Link href="/" className="btn">Try the home page</Link>
        <a href={STORE.phoneHref} className="btn btn-secondary">Call {STORE.phone}</a>
      </div>

      <div className="notice" style={{ marginTop: "var(--s-7)", textAlign: "left" }}>
        <span>
          <strong>Checkout needs a connection.</strong> Your bag is safe — come back to it when you
          have signal, or call the shop and we will take the order over the phone.
        </span>
      </div>

      <p className="t-body-sm muted" style={{ marginTop: "var(--s-6)" }}>
        {STORE.addressLine}
      </p>
    </div>
  );
}
