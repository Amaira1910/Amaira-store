import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/admin/ActionForm";
import { setFulfilmentAction } from "@/app/admin/actions";
import { getOrderByReceipt } from "@/lib/db/orders";
import { getInvoiceForOrder } from "@/lib/db/invoices";
import { inr } from "@/lib/money";

export const dynamic = "force-dynamic";

const STATUSES = ["awaiting", "packed", "dispatched", "delivered", "collected"] as const;

export default async function AdminOrderPage({ params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params;
  const order = getOrderByReceipt(receiptId);
  if (!order) notFound();
  const invoice = getInvoiceForOrder(order.id);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="mono">{order.receipt_id}</h1>
          <p>
            Placed {order.created_at}
            {order.paid_at ? ` · paid ${order.paid_at}` : ""}
          </p>
        </div>
        <div className="row-wrap">
          <Link href="/admin/orders" className="btn btn-sm btn-quiet">← All orders</Link>
          {invoice && (
            <Link href={`/order/${order.receipt_id}/invoice`} className="btn btn-sm btn-secondary">
              Tax invoice {invoice.invoice_no}
            </Link>
          )}
        </div>
      </div>

      <dl className="adm-stats">
        <div className="adm-stat">
          <dt>Payment</dt>
          <dd style={{ fontSize: 19 }}>
            <span className={`pill pill-${order.status === "paid" ? "paid" : order.status === "pending" ? "pending" : "failed"}`}>
              {order.status}
            </span>
          </dd>
          <p className="sub mono">{order.razorpay_payment_id ?? "no payment id"}</p>
        </div>
        <div className="adm-stat">
          <dt>Total</dt>
          <dd>{inr(order.total)}</dd>
          <p className="sub">{order.fulfilment} · place of supply {order.place_of_supply}</p>
        </div>
        <div className="adm-stat">
          <dt>Fulfilment</dt>
          <dd style={{ fontSize: 19 }}><span className="pill pill-neutral">{order.fulfilment_status}</span></dd>
          <p className="sub">{order.items.length} item(s)</p>
        </div>
      </dl>

      <div className="adm-card">
        <p className="adm-card-title">Move it along</p>
        <div className="row-wrap">
          {STATUSES.map((s) => (
            <ActionForm
              key={s}
              action={setFulfilmentAction}
              submitLabel={s}
              submitClass={`chip${order.fulfilment_status === s ? " is-on" : ""}`}
              quiet
            >
              <input type="hidden" name="receiptId" value={order.receipt_id} />
              <input type="hidden" name="status" value={s} />
            </ActionForm>
          ))}
        </div>
        {order.status !== "paid" && (
          <p className="notice notice-amber" style={{ marginTop: "var(--s-4)" }}>
            <span>
              This order is <strong>{order.status}</strong>. Nothing has been taken off stock, and no
              invoice exists. Do not dispatch it.
            </span>
          </p>
        )}
      </div>

      <div className="adm-card">
        <p className="adm-card-title">Items</p>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Product</th><th>SKU</th><th>HSN</th><th className="num">Qty</th><th className="num">Unit</th><th className="num">Line</th></tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td>
                    {i.name}
                    <span className="adm-sub">{i.variant_label}</span>
                    {i.engraving && <span className="adm-sub">Engrave: “{i.engraving}”</span>}
                    {i.care_price > 0 && <span className="adm-sub">AppleCare+ {inr(i.care_price)}</span>}
                  </td>
                  <td className="mono tight">{i.sku_code}</td>
                  <td className="tight">{i.hsn}</td>
                  <td className="num">{i.qty}</td>
                  <td className="num">{inr(i.unit_price + i.care_price)}</td>
                  <td className="num">{inr(i.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: "var(--s-4)" }}>
        <div className="adm-card" style={{ marginTop: 0 }}>
          <p className="adm-card-title">Customer</p>
          <p className="t-body-sm">
            <strong>{order.contact_first_name} {order.contact_last_name ?? ""}</strong><br />
            <a href={`tel:${order.contact_phone}`}>{order.contact_phone}</a><br />
            <a href={`mailto:${order.contact_email}`}>{order.contact_email}</a>
            {order.gstin && <><br />GSTIN {order.gstin}</>}
          </p>
        </div>
        <div className="adm-card" style={{ marginTop: 0 }}>
          <p className="adm-card-title">{order.fulfilment === "pickup" ? "Collecting in store" : "Deliver to"}</p>
          <p className="t-body-sm muted">
            {order.fulfilment === "pickup" ? (
              "Customer is collecting from Sanjaynagar. Text them when it is ready."
            ) : (
              <>
                {order.address_line1}<br />
                {order.address_line2 && <>{order.address_line2}<br /></>}
                {order.city}, {order.state} {order.pincode}
              </>
            )}
          </p>
          {order.failure_reason && (
            <p className="t-caption" style={{ color: "var(--red)", marginTop: 10 }}>
              Failure: {order.failure_reason}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
