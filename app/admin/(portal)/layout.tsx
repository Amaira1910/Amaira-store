import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { lowStockCount } from "@/lib/db/inventory";
import { getDb } from "@/lib/db/client";
import { logoutAction } from "@/app/admin/actions";
import { STORE } from "@/data/store";

import "@/styles/admin.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders", badge: "orders" as const },
  { href: "/admin/inventory", label: "Inventory", badge: "low" as const },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/enquiries", label: "Enquiries", badge: "enquiries" as const },
  { href: "/admin/settings", label: "Settings" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const db = getDb();

  const counts = {
    low: lowStockCount(),
    orders: (db.prepare(
      `SELECT COUNT(*) AS n FROM orders WHERE status = 'paid' AND fulfilment_status IN ('awaiting','packed')`,
    ).get() as { n: number }).n,
    enquiries: (db.prepare(`SELECT COUNT(*) AS n FROM enquiries WHERE handled = 0`).get() as { n: number }).n,
  };

  return (
    <div className="adm">
      <nav className="adm-side" aria-label="Admin sections">
        <Link href="/admin" className="adm-brand">
          <b>{STORE.name}</b>
          <span>Admin</span>
        </Link>

        <div className="adm-nav">
          {LINKS.map((l) => {
            const n = l.badge ? counts[l.badge] : 0;
            return (
              <Link key={l.href} href={l.href}>
                {l.label}
                {n > 0 && <span className="count">{n}</span>}
              </Link>
            );
          })}
        </div>

        <div className="adm-side-foot">
          <p style={{ marginBottom: 6 }}>
            {user.name}
            <br />
            <span style={{ fontSize: 11 }}>{user.email} · {user.role}</span>
          </p>
          <form action={logoutAction}>
            <button type="submit" style={{ color: "#b9b9c0", fontSize: "var(--t-caption)", textDecoration: "underline" }}>
              Sign out
            </button>
          </form>
          <p style={{ marginTop: 10 }}>
            <Link href="/">View the shop ›</Link>
          </p>
        </div>
      </nav>

      <main className="adm-main">{children}</main>
    </div>
  );
}
