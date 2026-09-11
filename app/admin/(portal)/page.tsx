import Link from "next/link";
import { inventoryValue, lowStockCount, recentMovements } from "@/lib/db/inventory";
import { listOrders, revenueByDay, salesSummary, topSellers } from "@/lib/db/orders";
import { inr } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const sales = salesSummary();
  const stock = inventoryValue();
  const low = lowStockCount();
  const days = revenueByDay(14);
  const top = topSellers(5);
  const recent = listOrders({ limit: 8 });
  const movements = recentMovements(8);

  const peak = Math.max(1, ...days.map((d) => d.revenue));

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Today</h1>
          <p>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}</p>
        </div>
        <Link href="/admin/inventory?low=1" className="btn btn-sm btn-secondary">
          Receive stock
        </Link>
      </div>

      <dl className="adm-stats">
        <div className="adm-stat">
          <dt>Revenue today</dt>
          <dd>{inr(sales.today.revenue)}</dd>
          <p className="sub">{sales.today.orders} paid {sales.today.orders === 1 ? "order" : "orders"}</p>
        </div>
        <div className="adm-stat">
          <dt>This month</dt>
          <dd>{inr(sales.month.revenue)}</dd>
          <p className="sub">{sales.month.orders} paid {sales.month.orders === 1 ? "order" : "orders"}</p>
        </div>
        <div className={`adm-stat${sales.toFulfil > 0 ? " is-warn" : ""}`}>
          <dt>To fulfil</dt>
          <dd>{sales.toFulfil}</dd>
          <p className="sub">{sales.pending} awaiting payment</p>
        </div>
        <div className={`adm-stat${low > 0 ? " is-warn" : ""}`}>
          <dt>Low stock</dt>
          <dd>{low}</dd>
          <p className="sub">SKUs at or below threshold</p>
        </div>
        <div className="adm-stat">
          <dt>Stock on hand</dt>
          <dd>{stock.units}</dd>
          <p className="sub">{inr(stock.atRetail)} at retail</p>
        </div>
      </dl>

      <div className="adm-card">
        <p className="adm-card-title">Revenue, last 14 days</p>
        {days.length === 0 ? (
          <p className="t-body-sm muted">No paid orders yet. Revenue will chart here as sales come in.</p>
        ) : (
          <>
            <div className="spark" role="img" aria-label={`Daily revenue for the last ${days.length} days`}>
              {days.map((d) => (
                <div
                  key={d.day}
                  className="spark-bar"
                  style={{ height: `${Math.max(3, (d.revenue / peak) * 100)}%` }}
                  title={`${d.day}: ${inr(d.revenue)} across ${d.orders} order(s)`}
                />
              ))}
            </div>
            <div className="spark-axis">
              <span>{days[0]?.day}</span>
              <span>{inr(peak)} peak</span>
              <span>{days[days.length - 1]?.day}</span>
            </div>
          </>
        )}
      </div>

      <div className="adm-card">
        <p className="adm-card-title">Recent orders</p>
        {recent.length === 0 ? (
          <p className="t-body-sm muted">No orders yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Fulfilment</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td className="tight">
                      <Link href={`/admin/orders/${o.receipt_id}`} className="mono">{o.receipt_id}</Link>
                      <span className="adm-sub">{o.item_count} item(s)</span>
                    </td>
                    <td>
                      {o.contact_first_name} {o.contact_last_name ?? ""}
                      <span className="adm-sub">{o.contact_phone}</span>
                    </td>
                    <td>
                      <span className={`pill pill-${o.status === "paid" ? "paid" : o.status === "pending" ? "pending" : "failed"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td><span className="pill pill-neutral">{o.fulfilment_status}</span></td>
                    <td className="num">{inr(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="adm-card">
        <p className="adm-card-title">Best sellers</p>
        {top.length === 0 ? (
          <p className="t-body-sm muted">Nothing sold yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Product</th><th className="num">Units</th><th className="num">Revenue</th></tr>
              </thead>
              <tbody>
                {top.map((t) => (
                  <tr key={t.name}>
                    <td>{t.name}</td>
                    <td className="num">{t.units}</td>
                    <td className="num">{inr(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="adm-card">
        <p className="adm-card-title">Latest stock movements</p>
        {movements.length === 0 ? (
          <p className="t-body-sm muted">No movements recorded.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>When</th><th>Product</th><th>Reason</th><th className="num">Change</th><th className="num">Balance</th></tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="tight">{m.created_at}</td>
                    <td>
                      {m.product_name}
                      <span className="adm-sub mono">{m.sku_code}</span>
                    </td>
                    <td><span className="pill pill-neutral">{m.reason}</span></td>
                    <td className="num" style={{ color: m.delta > 0 ? "var(--green)" : "var(--red)" }}>
                      {m.delta > 0 ? "+" : ""}{m.delta}
                    </td>
                    <td className="num">{m.balance_after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
