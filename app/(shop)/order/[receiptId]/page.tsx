import type { Metadata } from "next";
import Link from "next/link";
import DeviceArt from "@/components/DeviceArt";
import { IconCheck, IconPin, IconTruck } from "@/components/Icons";
import { getProduct } from "@/data/catalog";
import { STORE } from "@/data/store";
import { getOrderByReceipt } from "@/lib/db/orders";
import { getInvoiceForOrder } from "@/lib/db/invoices";
import { gstBreakdown, inr } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ receiptId: string }> };

export default async function OrderPage({ params }: Params) {
  const { receiptId } = await params;
  const order = getOrderByReceipt(receiptId);
  const invoice = order ? getInvoiceForOrder(order.id) : undefined;

  /* An order can be missing if the server restarted — the in-memory store in
     lib/orders.ts is not durable. Say something useful rather than 404. */
  if (!order) {
    return (
      <div className="page" style={{ paddingBlock: "var(--s-9)", maxWidth: 620, textAlign: "center" }}>
        <h1 className="t-title balance">Thank you — your order reference is {receiptId}.</h1>
        <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
          We cannot show the full details on this screen right now. Your payment receipt has been
          emailed to you by Razorpay. Quote this reference and we will pull it up instantly.
        </p>
        <div className="row-wrap" style={{ justifyContent: "center", marginTop: "var(--s-6)" }}>
          <a href={STORE.phoneHref} className="btn">Call {STORE.phone}</a>
          <Link href="/shop" className="btn btn-secondary">Continue shopping</Link>
        </div>
      </div>
    );
  }

  const gst = gstBreakdown(order.total);
  const paid = order.status === "paid";

  return (
    <div className="page" style={{ paddingBlock: "var(--s-7) var(--s-9)", maxWidth: 760 }}>
      <div className="center">
        <span className="confirm-mark"><IconCheck size={32} /></span>
        <h1 className="t-title balance">
          {paid ? `Thank you, ${order.contact_first_name}.` : "We have your order."}
        </h1>
        <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-3)" }}>
          {paid
            ? "Your payment went through and your order is confirmed."
            : "Your payment is still being confirmed. We will email you the moment it clears."}
        </p>
        <p className="t-body-sm muted" style={{ marginTop: "var(--s-4)" }}>
          Order reference <strong className="tnum">{order.receipt_id}</strong>
          {order.razorpay_payment_id && <> · Payment <span className="tnum">{order.razorpay_payment_id}</span></>}
        </p>
      </div>

      <div className="notice" style={{ marginTop: "var(--s-7)" }}>
        {order.fulfilment === "pickup" ? <IconPin size={18} /> : <IconTruck size={18} />}
        <span>
          {order.fulfilment === "pickup" ? (
            <>
              <strong>Collect from {STORE.address.line1}</strong>, {STORE.address.line2}. We will text{" "}
              {order.contact_phone} when it is ready — usually within two hours. Bring this reference
              and a photo ID.
            </>
          ) : (
            <>
              <strong>Delivering to</strong> {order.address_line1}
              {order.address_line2 ? `, ${order.address_line2}` : ""}, {order.city}{" "}
              {order.pincode}. We will text {order.contact_phone} with tracking.
            </>
          )}
        </span>
      </div>

      <section style={{ marginTop: "var(--s-7)" }}>
        <h2 className="t-headline" style={{ marginBottom: "var(--s-4)" }}>What you ordered</h2>
        {order.items.map((l, i) => {
          const product = getProduct(l.product_slug);
          const color = product?.colors.find((c) => l.variant_label?.startsWith(c.name)) ?? product?.colors[0];
          return (
            <div className="order-mini" key={`${l.sku_code}-${i}`}>
              <span className="order-mini-art">
                {product && color && (
                  <DeviceArt kind={product.art} hex={color.hex} accent={color.accent} screen={color.screen} label="" />
                )}
              </span>
              <span className="grow">
                <span className="t-body-sm" style={{ fontWeight: 500, display: "block" }}>{l.name}</span>
                <span className="t-caption muted">
                  {l.variant_label} · Qty {l.qty}
                  {l.care_price ? ` · AppleCare+ ${inr(l.care_price)}/yr` : ""}
                  {l.engraving ? ` · Engraved “${l.engraving}”` : ""}
                </span>
              </span>
              <span className="t-body-sm tnum nowrap">{inr(l.line_total)}</span>
            </div>
          );
        })}

        <div style={{ marginTop: "var(--s-5)", paddingTop: "var(--s-4)", borderTop: "1px solid var(--hairline)" }}>
          <div className="summary-row"><span className="muted">Taxable value</span><span className="tnum">{inr(invoice?.taxable_value ?? gst.taxableValue)}</span></div>
          {invoice && invoice.igst > 0 ? (
            <div className="summary-row"><span className="muted">IGST (18%)</span><span className="tnum">{inr(invoice.igst)}</span></div>
          ) : (
            <>
              <div className="summary-row"><span className="muted">CGST (9%)</span><span className="tnum">{inr(invoice?.cgst ?? gst.cgst)}</span></div>
              <div className="summary-row"><span className="muted">SGST (9%)</span><span className="tnum">{inr(invoice?.sgst ?? gst.sgst)}</span></div>
            </>
          )}
          <div className="summary-row"><span className="muted">Delivery</span><span className="green">Free</span></div>
          <div className="summary-total"><span>Paid</span><span className="tnum">{inr(order.total)}</span></div>

          {invoice && (
            <div className="row-wrap" style={{ marginTop: "var(--s-4)", justifyContent: "space-between" }}>
              <p className="t-caption muted">
                Tax invoice <strong className="tnum">{invoice.invoice_no}</strong>
                {order.gstin ? ` · GSTIN ${order.gstin}` : ""}
              </p>
              <Link href={`/order/${order.receipt_id}/invoice`} className="btn btn-secondary btn-sm">
                View tax invoice
              </Link>
            </div>
          )}
        </div>
      </section>

      <section style={{ marginTop: "var(--s-8)" }}>
        <h2 className="t-headline" style={{ marginBottom: "var(--s-3)" }}>What happens next</h2>
        <ol className="stack" style={{ counterReset: "step" }}>
          <li className="t-body-sm muted">
            <strong style={{ color: "var(--ink)" }}>1.</strong> A confirmation is on its way to {order.contact_email}.
          </li>
          <li className="t-body-sm muted">
            <strong style={{ color: "var(--ink)" }}>2.</strong> We check the serial, update the device and
            charge it before it leaves the shop.
          </li>
          <li className="t-body-sm muted">
            <strong style={{ color: "var(--ink)" }}>3.</strong>{" "}
            {order.fulfilment === "pickup"
              ? "You get a text when it is ready. Set-up and data transfer are free while you wait."
              : "You get a tracking text. Want help setting it up? Call us and we will walk you through it."}
          </li>
        </ol>
      </section>

      <div className="row-wrap" style={{ justifyContent: "center", marginTop: "var(--s-8)" }}>
        <Link href="/shop" className="btn">Continue shopping</Link>
        <a href={STORE.phoneHref} className="btn btn-secondary">Call {STORE.phone}</a>
      </div>
    </div>
  );
}
