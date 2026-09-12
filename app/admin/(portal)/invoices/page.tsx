import Link from "next/link";
import { financialYear, listInvoices } from "@/lib/db/invoices";
import { inr } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const rows = listInvoices(200);
  const fy = financialYear();
  const thisYear = rows.filter((r) => r.financial_year === fy);
  const totals = thisYear.reduce(
    (a, r) => ({
      taxable: a.taxable + r.taxable_value,
      tax: a.tax + r.cgst + r.sgst + r.igst,
      total: a.total + r.total,
    }),
    { taxable: 0, tax: 0, total: 0 },
  );

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Invoices</h1>
          <p>Financial year {fy} · {thisYear.length} issued</p>
        </div>
      </div>

      <dl className="adm-stats">
        <div className="adm-stat"><dt>Taxable value, FY {fy}</dt><dd>{inr(totals.taxable)}</dd></div>
        <div className="adm-stat"><dt>GST collected</dt><dd>{inr(totals.tax)}</dd></div>
        <div className="adm-stat"><dt>Invoiced total</dt><dd>{inr(totals.total)}</dd></div>
      </dl>

      {rows.length === 0 ? (
        <div className="adm-card adm-empty">
          <p>No invoices yet. One is raised automatically the moment a payment is confirmed.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Invoice</th><th>Issued</th><th>Customer</th><th>Place of supply</th>
                <th className="num">Taxable</th><th className="num">CGST</th><th className="num">SGST</th>
                <th className="num">IGST</th><th className="num">Total</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="mono tight">
                    {r.invoice_no}
                    <span className="adm-sub mono">{r.receipt_id}</span>
                  </td>
                  <td className="tight">{r.issued_at}</td>
                  <td>
                    {r.contact_first_name} {r.contact_last_name ?? ""}
                    {r.buyer_gstin && <span className="adm-sub">GSTIN {r.buyer_gstin}</span>}
                  </td>
                  <td className="tight">{r.place_of_supply}</td>
                  <td className="num">{inr(r.taxable_value)}</td>
                  <td className="num">{r.cgst ? inr(r.cgst) : <span className="faint">—</span>}</td>
                  <td className="num">{r.sgst ? inr(r.sgst) : <span className="faint">—</span>}</td>
                  <td className="num">{r.igst ? inr(r.igst) : <span className="faint">—</span>}</td>
                  <td className="num">{inr(r.total)}</td>
                  <td className="tight">
                    <Link href={`/order/${r.receipt_id}/invoice`} className="btn btn-sm btn-quiet">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm-card" style={{ marginTop: "var(--s-5)" }}>
        <p className="adm-card-title">For your accountant</p>
        <ul className="stack-sm t-body-sm muted">
          <li>· Invoice numbers are consecutive within each financial year and reset every April, as GST requires.</li>
          <li>· Supplies inside {"Karnataka"} are split CGST + SGST; any other state is charged IGST. Pickup orders are always intra-state.</li>
          <li>· Apple&rsquo;s Indian MRP is tax-inclusive, so tax is extracted from the price rather than added to it.</li>
          <li>· Set your GSTIN in <Link href="/admin/settings">Settings</Link> before issuing real invoices.</li>
        </ul>
      </div>
    </>
  );
}
