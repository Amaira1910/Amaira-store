import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { STORE } from "@/data/store";

export default function NotFound() {
  return (
    <div className="page" style={{ paddingBlock: "var(--s-10)", textAlign: "center", maxWidth: 620 }}>
      <p className="t-body-sm muted" style={{ marginBottom: 10 }}>404</p>
      <h1 className="t-title balance">That page has moved on.</h1>
      <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
        The link may be old, or we may have reorganised something. Here is where most people were
        heading.
      </p>
      <div className="row-wrap" style={{ justifyContent: "center", marginTop: "var(--s-6)" }}>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/shop/${c.slug}`} className="chip">{c.short}</Link>
        ))}
      </div>
      <div className="row-wrap" style={{ justifyContent: "center", marginTop: "var(--s-6)" }}>
        <Link href="/" className="btn">Back to the home page</Link>
        <a href={STORE.phoneHref} className="btn btn-secondary">Call {STORE.phone}</a>
      </div>
    </div>
  );
}
