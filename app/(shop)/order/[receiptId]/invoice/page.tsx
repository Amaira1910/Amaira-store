import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { STORE } from "@/data/store";
import { getOrderByReceipt } from "@/lib/db/orders";
import { getInvoiceForOrder, rupeesInWords, splitTax, summariseByHsn } from "@/lib/db/invoices";
import { getSetting } from "@/lib/db/seed";
import { inr } from "@/lib/money";

import "@/styles/invoice.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tax invoice",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ receiptId: string }> };

function fmtDate(iso: string): string {
  const d = new Date(iso.replace(" ", "T") + (iso.includes("Z") ? "" : "Z"));
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

export default async function InvoicePage({ params }: Params) {
  const { receiptId } = await params;
  const order = getOrderByReceipt(receiptId);
  if (!order) notFound();

  const invoice = getInvoiceForOrder(order.id);
  if (!invoice) {
    return (
      <div className="page" style={{ paddingBlock: "var(--s-9)", maxWidth: 620, textAlign: "center" }}>
        <h1 className="t-title balance">No invoice yet</h1>
        <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
          A tax invoice is raised once payment is confirmed. This order is still{" "}
          {order.status === "pending" ? "awaiting payment" : order.status}.
        </p>
      </div>
    );
  }

  const hsnRows = summariseByHsn(
    order.items.map((i) => ({ hsn: i.hsn, gst_rate: i.gst_rate, line_total: i.line_total })),
    order.place_of_supply,
  );
  const sellerGstin = getSetting("seller_gstin") || "— not configured —";
  const sellerStateCode = getSetting("seller_state_code", "29");
  const intraState = invoice.igst === 0;

  return (
    <>
      <div className="inv-shell">
        <div className="inv-actions">
          <PrintButton />
        </div>

        <article className="inv">
          <header className="inv-head">
            <div>
              <p className="inv-brand">
                {STORE.legalName}
                <span>{STORE.descriptor}</span>
              </p>
              <p style={{ marginTop: 10, color: "#444", fontSize: 12 }}>
                {STORE.address.line1}
                <br />
                {STORE.address.line2}
                <br />
                {STORE.address.city}, {STORE.address.state} {STORE.address.pincode}
                <br />
                {STORE.phone} · {STORE.email}
              </p>
              <p style={{ marginTop: 8, fontSize: 12 }}>
                <strong>GSTIN:</strong> {sellerGstin}
                <br />
                <strong>State:</strong> {STORE.address.state} ({sellerStateCode})
              </p>
            </div>

            <div className="inv-title">
              <h1>Tax Invoice</h1>
              <p>
                <strong>{invoice.invoice_no}</strong>
                <br />
                Dated {fmtDate(invoice.issued_at)}
                <br />
                Order {order.receipt_id}
              </p>
            </div>
          </header>

          <hr className="inv-rule" />

          <div className="inv-parties">
            <div className="inv-party">
              <h2>Billed to</h2>
              <p>
                <strong>
                  {order.contact_first_name} {order.contact_last_name ?? ""}
                </strong>
                <br />
                {order.contact_phone}
                <br />
                {order.contact_email}
                {order.gstin && (
                  <>
                    <br />
                    GSTIN: {order.gstin}
                  </>
                )}
              </p>
            </div>

            <div className="inv-party">
              <h2>{order.fulfilment === "pickup" ? "Collected from" : "Shipped to"}</h2>
              <p>
                {order.fulfilment === "pickup" ? (
                  <>
                    {STORE.address.line1}
                    <br />
                    {STORE.address.line2}
                    <br />
                    {STORE.address.city} {STORE.address.pincode}
                  </>
                ) : (
                  <>
                    {order.address_line1}
                    {order.address_line2 && (
                      <>
                        <br />
                        {order.address_line2}
                      </>
                    )}
                    <br />
                    {order.city}, {order.state} {order.pincode}
                  </>
                )}
              </p>
            </div>

            <div className="inv-party">
              <h2>Supply details</h2>
              <p>
                Place of supply: <strong>{order.place_of_supply}</strong>
                <br />
                Type: {intraState ? "Intra-state" : "Inter-state"}
                <br />
                Reverse charge: No
                <br />
                Payment: {order.razorpay_payment_id ?? "—"}
              </p>
            </div>
          </div>

          <hr className="inv-rule-light" />

          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: "34px" }}>#</th>
                <th>Description</th>
                <th>HSN</th>
                <th className="num">Qty</th>
                <th className="num">Rate</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, n) => (
                <tr key={item.id}>
                  <td>{n + 1}</td>
                  <td>
                    <strong>{item.name}</strong>
                    <span className="meta">
                      {item.variant_label}
                      {item.sku_code ? ` · ${item.sku_code}` : ""}
                      {item.engraving ? ` · Engraved “${item.engraving}”` : ""}
                      {item.care_price ? ` · includes AppleCare+ ${inr(item.care_price)}` : ""}
                    </span>
                  </td>
                  <td>{item.hsn}</td>
                  <td className="num">{item.qty}</td>
                  <td className="num">{inr(item.unit_price + item.care_price)}</td>
                  <td className="num">{inr(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inv-totals">
            <div className="inv-total-row">
              <span>Taxable value</span>
              <span>{inr(invoice.taxable_value)}</span>
            </div>
            {intraState ? (
              <>
                <div className="inv-total-row">
                  <span>CGST @ 9%</span>
                  <span>{inr(invoice.cgst)}</span>
                </div>
                <div className="inv-total-row">
                  <span>SGST @ 9%</span>
                  <span>{inr(invoice.sgst)}</span>
                </div>
              </>
            ) : (
              <div className="inv-total-row">
                <span>IGST @ 18%</span>
                <span>{inr(invoice.igst)}</span>
              </div>
            )}
            <div className="inv-total-row">
              <span>Delivery</span>
              <span>Nil</span>
            </div>
            <div className="inv-total-row grand">
              <span>Total</span>
              <span>{inr(invoice.total)}</span>
            </div>
          </div>

          <p className="inv-words">
            <span>Amount in words: </span>
            <strong>{rupeesInWords(invoice.total)}</strong>
          </p>

          <hr className="inv-rule-light" />

          <h2 style={{ fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", color: "#666", marginBottom: 6 }}>
            HSN summary
          </h2>
          <table className="inv-table">
            <thead>
              <tr>
                <th>HSN</th>
                <th className="num">Taxable</th>
                {intraState ? (
                  <>
                    <th className="num">CGST</th>
                    <th className="num">SGST</th>
                  </>
                ) : (
                  <th className="num">IGST</th>
                )}
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {hsnRows.map((r) => (
                <tr key={`${r.hsn}-${r.gstRate}`}>
                  <td>
                    {r.hsn}
                    <span className="meta">{r.gstRate}%</span>
                  </td>
                  <td className="num">{inr(r.taxableValue)}</td>
                  {intraState ? (
                    <>
                      <td className="num">{inr(r.cgst)}</td>
                      <td className="num">{inr(r.sgst)}</td>
                    </>
                  ) : (
                    <td className="num">{inr(r.igst)}</td>
                  )}
                  <td className="num">{inr(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inv-foot">
            <ul className="inv-terms">
              <li>Goods once sold are covered by the Apple limited warranty and our published returns policy.</li>
              <li>All prices are inclusive of GST at the rate shown against each HSN.</li>
              <li>This is a computer-generated invoice and is valid without a physical signature.</li>
              <li>Subject to Bengaluru jurisdiction.</li>
            </ul>
            <div className="inv-sign">
              For <strong>{STORE.legalName}</strong>
              <div className="line">Authorised signatory</div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
