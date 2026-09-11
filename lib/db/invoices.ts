/* ==========================================================================
   GST invoicing.

   India-specific rules this implements:

   · Invoice numbers must be a consecutive series, unique within a financial
     year, and not exceed 16 characters. The Indian FY runs April–March, so
     the series resets each April.
   · Apple's Indian MRP is GST-INCLUSIVE, so tax is extracted from the price
     rather than added to it: taxable = total ÷ (1 + rate).
   · Place of supply decides the tax split. Supplying within Karnataka (where
     the shop is) is an intra-state supply: CGST + SGST, half each. Supplying
     to any other state is inter-state: a single IGST at the full rate.

   ⚠️  Have your CA review this before you issue real invoices. The logic here
   is standard, but your registration details and HSN classifications are
   yours to confirm.
   ========================================================================== */
import { getDb, tx } from "./client";
import { getSetting } from "./seed";

/** "2026-27" for any date between 1 April 2026 and 31 March 2027. */
export function financialYear(d = new Date()): string {
  const y = d.getFullYear();
  const startYear = d.getMonth() >= 3 ? y : y - 1; // month 3 = April
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export interface TaxSplit {
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  intraState: boolean;
}

/**
 * Extracts tax from a GST-inclusive total.
 *
 * Rounding is done once on the total tax and then split, so CGST + SGST always
 * add back to exactly the tax charged — halving first and rounding twice can
 * leave the invoice a rupee short.
 */
export function splitTax(inclusiveTotal: number, ratePercent: number, placeOfSupply: string): TaxSplit {
  const sellerState = getSetting("seller_state", "Karnataka");
  const intraState = placeOfSupply.trim().toLowerCase() === sellerState.trim().toLowerCase();

  const taxable = Math.round(inclusiveTotal / (1 + ratePercent / 100));
  const tax = inclusiveTotal - taxable;

  if (intraState) {
    const cgst = Math.round(tax / 2);
    return { taxableValue: taxable, cgst, sgst: tax - cgst, igst: 0, total: inclusiveTotal, intraState };
  }
  return { taxableValue: taxable, cgst: 0, sgst: 0, igst: tax, total: inclusiveTotal, intraState };
}

/** Per-HSN tax lines, as a GST invoice must show them. */
export interface HsnSummaryRow {
  hsn: string;
  gstRate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export function summariseByHsn(
  items: { hsn: string; gst_rate: number; line_total: number }[],
  placeOfSupply: string,
): HsnSummaryRow[] {
  const buckets = new Map<string, { hsn: string; rate: number; total: number }>();
  for (const i of items) {
    const key = `${i.hsn}|${i.gst_rate}`;
    const b = buckets.get(key) ?? { hsn: i.hsn, rate: i.gst_rate, total: 0 };
    b.total += i.line_total;
    buckets.set(key, b);
  }

  return [...buckets.values()].map((b) => {
    const t = splitTax(b.total, b.rate, placeOfSupply);
    return {
      hsn: b.hsn, gstRate: b.rate,
      taxableValue: t.taxableValue, cgst: t.cgst, sgst: t.sgst, igst: t.igst, total: b.total,
    };
  });
}

export interface InvoiceRow {
  id: number;
  invoice_no: string;
  order_id: number;
  financial_year: string;
  seq: number;
  issued_at: string;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  place_of_supply: string;
  buyer_gstin: string | null;
  status: string;
}

/**
 * Issues the tax invoice for a paid order. Idempotent — an order already
 * invoiced returns the existing invoice rather than burning a second number.
 */
export function issueInvoiceForOrder(orderId: number): InvoiceRow {
  return tx((conn) => {
    const existing = conn.prepare(`SELECT * FROM invoices WHERE order_id = ?`).get(orderId) as InvoiceRow | undefined;
    if (existing) return existing;

    const order = conn.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as
      | { id: number; total: number; place_of_supply: string; gstin: string | null }
      | undefined;
    if (!order) throw new Error(`No order ${orderId}.`);

    const items = conn
      .prepare(`SELECT hsn, gst_rate, line_total FROM order_items WHERE order_id = ?`)
      .all(orderId) as { hsn: string; gst_rate: number; line_total: number }[];

    const rows = summariseByHsn(items, order.place_of_supply);
    const totals = rows.reduce(
      (a, r) => ({
        taxable: a.taxable + r.taxableValue,
        cgst: a.cgst + r.cgst,
        sgst: a.sgst + r.sgst,
        igst: a.igst + r.igst,
      }),
      { taxable: 0, cgst: 0, sgst: 0, igst: 0 },
    );

    const fy = financialYear();
    // MAX(seq) inside the same transaction, so two simultaneous payments
    // cannot be handed the same invoice number.
    const last = conn
      .prepare(`SELECT COALESCE(MAX(seq), 0) AS n FROM invoices WHERE financial_year = ?`)
      .get(fy) as { n: number };
    const seq = last.n + 1;
    const prefix = getSetting("invoice_prefix", "AMR");
    // Kept under the 16-character legal limit: AMR/2627/00001 is 14.
    const invoiceNo = `${prefix}/${fy.replace("-", "")}/${String(seq).padStart(5, "0")}`;

    const info = conn
      .prepare(
        `INSERT INTO invoices (invoice_no, order_id, financial_year, seq, taxable_value,
                               cgst, sgst, igst, total, place_of_supply, buyer_gstin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        invoiceNo, orderId, fy, seq, totals.taxable,
        totals.cgst, totals.sgst, totals.igst, order.total,
        order.place_of_supply, order.gstin ?? null,
      );

    return conn.prepare(`SELECT * FROM invoices WHERE id = ?`).get(Number(info.lastInsertRowid)) as InvoiceRow;
  });
}

export function getInvoiceByNumber(invoiceNo: string): InvoiceRow | undefined {
  return getDb().prepare(`SELECT * FROM invoices WHERE invoice_no = ?`).get(invoiceNo) as InvoiceRow | undefined;
}

export function getInvoiceForOrder(orderId: number): InvoiceRow | undefined {
  return getDb().prepare(`SELECT * FROM invoices WHERE order_id = ?`).get(orderId) as InvoiceRow | undefined;
}

export function listInvoices(limit = 100) {
  return getDb()
    .prepare(
      `SELECT i.*, o.receipt_id, o.contact_first_name, o.contact_last_name
       FROM invoices i JOIN orders o ON o.id = i.order_id
       ORDER BY i.id DESC LIMIT ?`,
    )
    .all(limit) as (InvoiceRow & { receipt_id: string; contact_first_name: string; contact_last_name: string })[];
}

/** Amount in words, as Indian tax invoices conventionally show. */
export function rupeesInWords(amount: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const two = (n: number): string =>
    n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? " " + ones[n % 10] : ""}`;

  const chunk = (n: number): string => {
    if (n === 0) return "";
    if (n < 100) return two(n);
    return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? " " + two(n % 100) : ""}`;
  };

  let n = Math.round(Math.abs(amount));
  if (n === 0) return "Rupees Zero Only";

  const parts: string[] = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000);   n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;

  if (crore) parts.push(`${chunk(crore)} Crore`);
  if (lakh) parts.push(`${chunk(lakh)} Lakh`);
  if (thousand) parts.push(`${chunk(thousand)} Thousand`);
  if (n) parts.push(chunk(n));

  return `Rupees ${parts.join(" ")} Only`;
}
