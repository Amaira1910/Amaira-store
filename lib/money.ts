/* ==========================================================================
   Money. Rupees everywhere in the app; paise only at the payment boundary.
   ========================================================================== */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INR_PLAIN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹1,49,900 — Indian digit grouping, no decimals. */
export function inr(rupees: number): string {
  return INR.format(Math.round(rupees));
}

/** 1,49,900 — without the symbol, for places that supply their own. */
export function inrPlain(rupees: number): string {
  return INR_PLAIN.format(Math.round(rupees));
}

/** Razorpay works in the smallest currency unit. */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function fromPaise(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * A no-cost-EMI monthly figure: the price split evenly across the tenure,
 * which is exactly what "no cost EMI" means to the customer — the interest is
 * absorbed by the merchant discount, so the buyer pays price / months.
 */
export function noCostEmi(rupees: number, months: number): number {
  return Math.ceil(rupees / months);
}

/**
 * A standard reducing-balance EMI, for tenures where interest is actually
 * charged. `annualRate` is a percentage, e.g. 14 for 14% p.a.
 */
export function emi(principal: number, months: number, annualRate: number): number {
  if (annualRate <= 0) return noCostEmi(principal, months);
  const r = annualRate / 12 / 100;
  const factor = Math.pow(1 + r, months);
  return Math.ceil((principal * r * factor) / (factor - 1));
}

/** GST is included in Apple's Indian MRPs. This splits it out for the invoice. */
export function gstBreakdown(inclusiveTotal: number, ratePercent = 18) {
  const base = inclusiveTotal / (1 + ratePercent / 100);
  const tax = inclusiveTotal - base;
  return {
    taxableValue: Math.round(base),
    cgst: Math.round(tax / 2),
    sgst: Math.round(tax - tax / 2),
    total: Math.round(inclusiveTotal),
    ratePercent,
  };
}

/** "Save ₹10,000" — returns null when there is nothing genuine to claim. */
export function savings(price: number, mrp?: number): number | null {
  if (!mrp || mrp <= price) return null;
  return mrp - price;
}
