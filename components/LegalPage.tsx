import Crumbs from "@/components/Crumbs";
import { STORE } from "@/data/store";

export default function LegalPage({
  title,
  href,
  updated,
  lead,
  children,
}: {
  title: string;
  href: string;
  updated: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page" style={{ paddingBottom: "var(--s-9)" }}>
      <Crumbs trail={[{ name: "Home", href: "/" }, { name: title, href }]} />
      <header style={{ paddingBlock: "var(--s-5) var(--s-6)", maxWidth: "62ch" }}>
        <h1 className="t-title balance">{title}</h1>
        <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-3)" }}>{lead}</p>
        <p className="t-caption muted" style={{ marginTop: "var(--s-4)" }}>Last updated {updated}</p>
      </header>
      <div className="prose">
        {children}
        <hr className="hairline" style={{ marginBlock: "var(--s-7)" }} />
        <p className="t-body-sm muted">
          Questions about this page? Call <a href={STORE.phoneHref}>{STORE.phone}</a> or email{" "}
          <a href={`mailto:${STORE.email}`}>{STORE.email}</a>. You can also write to us at{" "}
          {STORE.addressLine}.
        </p>
      </div>
    </div>
  );
}
