import Link from "next/link";
import { listOrders, type OrderStatus } from "@/lib/db/orders";
import { inr } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

const TABS: { label: string; status?: OrderStatus }[] = [
  { label: "All" },
  { label: "Paid", status: "paid" },
  { label: "Pending", status: "pending" },
  { label: "Failed", status: "failed" },
  { label: "Refunded", status: "refunded" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const valid = TABS.find((t) => t.status === status)?.status;
  const rows = listOrders({ status: valid, search: q, limit: 200 });

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Orders</h1>
          <p>{rows.length} shown</p>
        </div>
      </div>

      <div className="adm-toolbar">
        {TABS.map((t) => (
          <Link
            key={t.label}
            href={t.status ? `/admin/orders?status=${t.status}` : "/admin/orders"}
            className="chip"
            aria-pressed={valid === t.status}
          >
            {t.label}
          </Link>
        ))}
        <form className="adm-search" method="get">
          {valid && <input type="hidden" name="status" value={valid} />}
          <input type="search" name="q" defaultValue={q ?? ""} placeholder="Order ref, name, email or phone…" aria-label="Search orders" />
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="adm-card adm-empty"><p>No orders match that.</p></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th><th>Placed</th><th>Customer</th><th>Type</th>
                <th>Payment</th><th>Fulfilment</th><th>Invoice</th><th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td className="tight">
                    <Link href={`/admin/orders/${o.receipt_id}`} className="mono">{o.receipt_id}</Link>
                    <span className="adm-sub">{o.item_count} item(s)</span>
                  </td>
                  <td className="tight">{o.created_at}</td>
                  <td>
                    {o.contact_first_name} {o.contact_last_name ?? ""}
                    <span className="adm-sub">{o.contact_phone}</span>
                  </td>
                  <td>
                    <span className="pill pill-neutral">{o.fulfilment}</span>
                    {o.gstin && <span className="adm-sub">GST {o.gstin}</span>}
                  </td>
                  <td>
                    <span className={`pill pill-${o.status === "paid" ? "paid" : o.status === "pending" ? "pending" : "failed"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td><span className="pill pill-neutral">{o.fulfilment_status}</span></td>
                  <td className="mono tight">
                    {o.invoice_no ? (
                      <Link href={`/order/${o.receipt_id}/invoice`}>{o.invoice_no}</Link>
                    ) : (
                      <span className="faint">—</span>
                    )}
                  </td>
                  <td className="num">{inr(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
