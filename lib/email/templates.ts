/* ==========================================================================
   Email templates.

   Built with tables and inline styles on purpose. Outlook still uses Word's
   rendering engine, Gmail strips <style> blocks from some clients, and flexbox
   and grid are unreliable across the estate. This is not 2012 nostalgia — it
   is what actually arrives looking right.

   Every template returns both HTML and a plain-text alternative. Text-only is
   not a courtesy: a message without it scores worse with spam filters and is
   what screen readers and watch notifications often read.
   ========================================================================== */
import { STORE } from "@/data/store";
import { inr } from "@/lib/money";
import type { OrderItemRow, OrderRow } from "@/lib/db/orders";
import type { InvoiceRow } from "@/lib/db/invoices";

const INK = "#1d1d1f";
const MUTED = "#6e6e73";
const RULE = "#d2d2d7";
const BLUE = "#0071e3";

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Shell shared by every message: centred 600px table, safe fallbacks. */
function shell(title: string, bodyRows: string, preheader: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;">
<!-- Preheader: the grey line shown after the subject in most inboxes. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f7;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
             style="width:600px;max-width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:26px 28px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <div style="font-size:20px;font-weight:600;letter-spacing:-0.02em;color:${INK};">${STORE.name}</div>
            <div style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};margin-top:2px;">
              ${STORE.descriptor}
            </div>
          </td>
        </tr>
        ${bodyRows}
        <tr>
          <td style="padding:0 28px 26px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <hr style="border:0;border-top:1px solid ${RULE};margin:22px 0 16px;">
            <p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED};">
              ${escapeHtml(STORE.addressLine)}<br>
              <a href="tel:${STORE.phone.replace(/\s/g, "")}" style="color:${BLUE};text-decoration:none;">${escapeHtml(STORE.phone)}</a>
              &nbsp;·&nbsp;
              <a href="mailto:${STORE.email}" style="color:${BLUE};text-decoration:none;">${escapeHtml(STORE.email)}</a>
            </p>
            <p style="margin:12px 0 0;font-size:11px;line-height:1.5;color:#86868b;">
              ${STORE.name} is an independent Apple Premium Reseller. Apple, iPhone, iPad, Mac, Apple Watch
              and AirPods are trademarks of Apple Inc. This store is not operated by Apple Inc.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function row(inner: string): string {
  return `<tr><td style="padding:0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${inner}</td></tr>`;
}

/* --- order confirmation -------------------------------------------------- */

export interface OrderEmailInput {
  order: OrderRow & { items: OrderItemRow[] };
  invoice?: InvoiceRow;
  siteUrl: string;
}

export function orderConfirmation({ order, invoice, siteUrl }: OrderEmailInput) {
  const name = order.contact_first_name;
  const isPickup = order.fulfilment === "pickup";

  const itemRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid #e8e8ed;font-size:14px;color:${INK};">
          <strong style="font-weight:600;">${escapeHtml(i.name)}</strong><br>
          <span style="font-size:12px;color:${MUTED};">
            ${escapeHtml(i.variant_label ?? "")}${i.qty > 1 ? ` &nbsp;·&nbsp; Qty ${i.qty}` : ""}
            ${i.care_price ? ` &nbsp;·&nbsp; AppleCare+ ${escapeHtml(inr(i.care_price))}` : ""}
            ${i.engraving ? ` &nbsp;·&nbsp; Engraved “${escapeHtml(i.engraving)}”` : ""}
          </span>
        </td>
        <td align="right" style="padding:11px 0;border-bottom:1px solid #e8e8ed;font-size:14px;color:${INK};white-space:nowrap;">
          ${escapeHtml(inr(i.line_total))}
        </td>
      </tr>`,
    )
    .join("");

  const fulfilmentBlock = isPickup
    ? `<p style="margin:0;font-size:14px;line-height:1.55;color:${INK};">
         <strong>Collect from ${escapeHtml(STORE.address.line1)}</strong><br>
         <span style="color:${MUTED};">
           ${escapeHtml(STORE.address.line2)}, ${escapeHtml(STORE.address.city)} ${escapeHtml(STORE.address.pincode)}<br>
           We will text ${escapeHtml(order.contact_phone)} when it is ready — usually within about two hours.
           Bring this reference and a photo ID.
         </span>
       </p>`
    : `<p style="margin:0;font-size:14px;line-height:1.55;color:${INK};">
         <strong>Delivering to</strong><br>
         <span style="color:${MUTED};">
           ${escapeHtml(order.address_line1 ?? "")}${order.address_line2 ? `, ${escapeHtml(order.address_line2)}` : ""}<br>
           ${escapeHtml(order.city ?? "")}, ${escapeHtml(order.state ?? "")} ${escapeHtml(order.pincode ?? "")}<br>
           We will text ${escapeHtml(order.contact_phone)} with tracking.
         </span>
       </p>`;

  const taxLines = invoice
    ? invoice.igst > 0
      ? `<tr><td style="font-size:13px;color:${MUTED};padding:3px 0;">IGST (18%)</td>
         <td align="right" style="font-size:13px;color:${MUTED};padding:3px 0;">${escapeHtml(inr(invoice.igst))}</td></tr>`
      : `<tr><td style="font-size:13px;color:${MUTED};padding:3px 0;">CGST (9%)</td>
         <td align="right" style="font-size:13px;color:${MUTED};padding:3px 0;">${escapeHtml(inr(invoice.cgst))}</td></tr>
         <tr><td style="font-size:13px;color:${MUTED};padding:3px 0;">SGST (9%)</td>
         <td align="right" style="font-size:13px;color:${MUTED};padding:3px 0;">${escapeHtml(inr(invoice.sgst))}</td></tr>`
    : "";

  const body =
    row(`
      <h1 style="margin:20px 0 6px;font-size:24px;font-weight:600;letter-spacing:-0.02em;color:${INK};">
        Thank you, ${escapeHtml(name)}.
      </h1>
      <p style="margin:0;font-size:15px;line-height:1.5;color:${MUTED};">
        Your payment went through and your order is confirmed.
      </p>
      <p style="margin:14px 0 0;font-size:13px;color:${MUTED};">
        Order <strong style="color:${INK};">${escapeHtml(order.receipt_id)}</strong>
        ${invoice ? `&nbsp;·&nbsp; Tax invoice <strong style="color:${INK};">${escapeHtml(invoice.invoice_no)}</strong>` : ""}
      </p>
    `) +
    row(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
        <tr><td colspan="2" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};padding-bottom:6px;">
          What you ordered
        </td></tr>
        ${itemRows}
        ${taxLines
          ? `<tr><td colspan="2" style="height:10px;"></td></tr>
             <tr><td style="font-size:13px;color:${MUTED};padding:3px 0;">Taxable value</td>
                 <td align="right" style="font-size:13px;color:${MUTED};padding:3px 0;">${escapeHtml(inr(invoice!.taxable_value))}</td></tr>
             ${taxLines}`
          : ""}
        <tr><td style="font-size:13px;color:${MUTED};padding:3px 0;">Delivery</td>
            <td align="right" style="font-size:13px;color:#008009;padding:3px 0;">Free</td></tr>
        <tr>
          <td style="font-size:16px;font-weight:600;color:${INK};padding:12px 0 0;border-top:1px solid ${RULE};">Paid</td>
          <td align="right" style="font-size:16px;font-weight:600;color:${INK};padding:12px 0 0;border-top:1px solid ${RULE};">
            ${escapeHtml(inr(order.total))}
          </td>
        </tr>
      </table>
    `) +
    row(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="margin-top:22px;background:#f5f5f7;border-radius:10px;">
        <tr><td style="padding:16px 18px;">${fulfilmentBlock}</td></tr>
      </table>
    `) +
    row(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
        <tr>
          <td style="background:${BLUE};border-radius:980px;">
            <a href="${siteUrl}/order/${encodeURIComponent(order.receipt_id)}"
               style="display:inline-block;padding:12px 26px;font-size:15px;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              View your order
            </a>
          </td>
        </tr>
      </table>
      ${invoice
        ? `<p style="margin:14px 0 0;font-size:13px;color:${MUTED};">
             <a href="${siteUrl}/order/${encodeURIComponent(order.receipt_id)}/invoice" style="color:${BLUE};">View your GST tax invoice</a>
             — ${escapeHtml(invoice.invoice_no)}.
             ${order.gstin ? `Raised against GSTIN ${escapeHtml(order.gstin)}.` : ""}
           </p>`
        : ""}
      <p style="margin:14px 0 0;font-size:13px;line-height:1.55;color:${MUTED};">
        Setting it up is free and we are happy to do it with you — just bring it in, or call and
        we will walk you through it.
      </p>
    `);

  /* `null` means "leave this line out"; "" means "an actual blank line".
     Filtering on "" instead would collapse the whole message into one block. */
  const text = ([
    `Thank you, ${name}.`,
    ``,
    `Your payment went through and your order is confirmed.`,
    ``,
    `Order: ${order.receipt_id}`,
    invoice ? `Tax invoice: ${invoice.invoice_no}` : null,
    ``,
    `WHAT YOU ORDERED`,
    ...order.items.map(
      (i) =>
        `- ${i.name}${i.variant_label ? ` (${i.variant_label})` : ""}` +
        `${i.qty > 1 ? ` x${i.qty}` : ""} — ${inr(i.line_total)}`,
    ),
    ``,
    invoice ? `Taxable value: ${inr(invoice.taxable_value)}` : null,
    invoice && invoice.igst > 0 ? `IGST (18%): ${inr(invoice.igst)}` : null,
    invoice && invoice.igst === 0 ? `CGST (9%): ${inr(invoice.cgst)}` : null,
    invoice && invoice.igst === 0 ? `SGST (9%): ${inr(invoice.sgst)}` : null,
    `Delivery: Free`,
    `PAID: ${inr(order.total)}`,
    ``,
    isPickup
      ? `COLLECT FROM\n${STORE.addressLine}\nWe will text ${order.contact_phone} when it is ready, usually within about two hours. Bring this reference and a photo ID.`
      : `DELIVERING TO\n${order.address_line1 ?? ""}${order.address_line2 ? `, ${order.address_line2}` : ""}\n${order.city ?? ""}, ${order.state ?? ""} ${order.pincode ?? ""}\nWe will text ${order.contact_phone} with tracking.`,
    ``,
    `View your order: ${siteUrl}/order/${order.receipt_id}`,
    ``,
    `${STORE.name} — ${STORE.descriptor}`,
    STORE.addressLine,
    `${STORE.phone} · ${STORE.email}`,
  ] as (string | null)[])
    .filter((l): l is string => l !== null)
    .join("\n");

  return {
    subject: `Your ${STORE.name} order ${order.receipt_id} is confirmed`,
    preheader: `${inr(order.total)} paid · ${isPickup ? "ready to collect soon" : "on its way"}`,
    html: shell(`Order ${order.receipt_id} confirmed`, body, `${inr(order.total)} paid`),
    text,
  };
}

/* --- enquiry alert, to the shop ------------------------------------------ */

export interface EnquiryEmailInput {
  id: number;
  kind: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject?: string;
  message: string;
  siteUrl: string;
}

export function enquiryAlert(e: EnquiryEmailInput) {
  const body =
    row(`
      <h1 style="margin:20px 0 6px;font-size:20px;font-weight:600;letter-spacing:-0.02em;color:${INK};">
        New ${escapeHtml(e.kind)} enquiry
      </h1>
      <p style="margin:0;font-size:14px;color:${MUTED};">${escapeHtml(e.subject ?? "No subject")}</p>
    `) +
    row(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="margin-top:18px;background:#f5f5f7;border-radius:10px;">
        <tr><td style="padding:16px 18px;font-size:14px;line-height:1.6;color:${INK};">
          <strong>${escapeHtml(e.name)}</strong>${e.company ? ` — ${escapeHtml(e.company)}` : ""}<br>
          <a href="tel:${escapeHtml(e.phone)}" style="color:${BLUE};text-decoration:none;">${escapeHtml(e.phone)}</a>
          &nbsp;·&nbsp;
          <a href="mailto:${escapeHtml(e.email)}" style="color:${BLUE};text-decoration:none;">${escapeHtml(e.email)}</a>
        </td></tr>
      </table>
      <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:${INK};white-space:pre-wrap;">${escapeHtml(e.message)}</p>
      <p style="margin:18px 0 0;font-size:13px;color:${MUTED};">
        Reply straight to this email to answer ${escapeHtml(e.name)} directly, or
        <a href="${e.siteUrl}/admin/enquiries" style="color:${BLUE};">open it in the portal</a>.
      </p>
    `);

  const text = [
    `New ${e.kind} enquiry — ${e.subject ?? "no subject"}`,
    ``,
    `${e.name}${e.company ? ` (${e.company})` : ""}`,
    `${e.phone} · ${e.email}`,
    ``,
    e.message,
    ``,
    `Reply to this email to answer them directly.`,
    `Portal: ${e.siteUrl}/admin/enquiries`,
  ].join("\n");

  return {
    subject: `${e.name}: ${e.subject ?? "enquiry"}`,
    preheader: `${e.phone} — ${e.message.slice(0, 90)}`,
    html: shell("New enquiry", body, e.message.slice(0, 90)),
    text,
  };
}
