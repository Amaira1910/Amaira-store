import { listCustomers } from "@/lib/db/orders";
import { inr } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const rows = listCustomers(200);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Customers</h1>
          <p>{rows.length} on record, ranked by what they have spent</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="adm-card adm-empty"><p>No customers yet.</p></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th><th>Contact</th><th>GSTIN</th>
                <th className="num">Orders</th><th className="num">Lifetime value</th><th>Last order</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{[c.first_name, c.last_name].filter(Boolean).join(" ") || <span className="faint">—</span>}</td>
                  <td>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                    {c.phone && <span className="adm-sub"><a href={`tel:${c.phone}`}>{c.phone}</a></span>}
                  </td>
                  <td className="mono tight">{c.gstin ?? <span className="faint">—</span>}</td>
                  <td className="num">{c.order_count}</td>
                  <td className="num">{inr(c.lifetime_value)}</td>
                  <td className="tight">{c.last_order_at ?? <span className="faint">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm-card" style={{ marginTop: "var(--s-5)" }}>
        <p className="adm-card-title">A note on privacy</p>
        <p className="t-body-sm muted">
          These records exist to fulfil orders and raise invoices. Under the Digital Personal Data
          Protection Act, 2023, a customer can ask you to delete what you hold — except records you
          are required to keep for tax. The published privacy policy commits you to answering within
          30 days.
        </p>
      </div>
    </>
  );
}
