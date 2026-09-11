/* ==========================================================================
   Authoritative pricing.

   The browser sends a bag; the server ignores every price in it and recomputes
   from the catalog. A tampered payload therefore cannot buy an iPhone for ₹1 —
   it fails validation and the order is refused.
   ========================================================================== */
import { getProduct } from "@/data/catalog";
import type { CartLine } from "@/lib/types";

export interface PricedLine {
  slug: string;
  name: string;
  colorName: string;
  storageLabel?: string;
  sizeLabel?: string;
  engraving?: string;
  qty: number;
  unitPrice: number;
  care: number;
  lineTotal: number;
}

export interface PricingResult {
  ok: boolean;
  error?: string;
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
}

const MAX_QTY_PER_LINE = 10;
const MAX_LINES = 20;

/** Anything a client could have sent. Validated field by field. */
type Incoming = Partial<CartLine> & Record<string, unknown>;

export function priceBag(incoming: unknown): PricingResult {
  const empty: PricingResult = { ok: false, lines: [], subtotal: 0, shipping: 0, total: 0 };

  if (!Array.isArray(incoming) || incoming.length === 0) {
    return { ...empty, error: "Your bag is empty." };
  }
  if (incoming.length > MAX_LINES) {
    return { ...empty, error: `An order can hold at most ${MAX_LINES} different items. Please split it, or call us.` };
  }

  const lines: PricedLine[] = [];

  for (const raw of incoming as Incoming[]) {
    const slug = typeof raw.slug === "string" ? raw.slug : null;
    if (!slug) return { ...empty, error: "That bag contains an item we cannot identify." };

    const product = getProduct(slug);
    if (!product) return { ...empty, error: `We no longer carry one of the items in your bag (${slug}).` };
    if (product.stock === "order") {
      return { ...empty, error: `${product.name} is made to order and cannot be bought online yet. Please call the store.` };
    }

    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      return { ...empty, error: `Please choose a quantity between 1 and ${MAX_QTY_PER_LINE} for ${product.name}.` };
    }

    const color = product.colors.find((c) => c.id === raw.colorId);
    if (!color) return { ...empty, error: `Choose a finish for ${product.name}.` };

    let unitPrice = product.basePrice;

    if (product.storage?.length) {
      const option = product.storage.find((s) => s.id === raw.storageId);
      if (!option) return { ...empty, error: `Choose an option for ${product.name}.` };
      if (option.available === false) {
        return { ...empty, error: `${product.name} ${option.label} is not available right now.` };
      }
      unitPrice += option.priceDelta;
    }

    if (product.sizes?.options.length) {
      const option = product.sizes.options.find((s) => s.id === raw.sizeId);
      if (!option) return { ...empty, error: `Choose ${product.sizes.title.toLowerCase()} for ${product.name}.` };
      unitPrice += option.priceDelta;
    }

    /* AppleCare+ is either the catalog price or nothing. A client cannot invent a figure. */
    const wantsCare = Number(raw.care) > 0;
    const care = wantsCare && product.careAnnual ? product.careAnnual : 0;

    const engraving =
      typeof raw.engraving === "string" && raw.engraving.trim()
        ? raw.engraving.trim().slice(0, 20)
        : undefined;

    lines.push({
      slug,
      name: product.name,
      colorName: color.name,
      storageLabel: product.storage?.find((s) => s.id === raw.storageId)?.label,
      sizeLabel: product.sizes?.options.find((s) => s.id === raw.sizeId)?.label,
      engraving,
      qty,
      unitPrice,
      care,
      lineTotal: (unitPrice + care) * qty,
    });
  }

  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
  const shipping = 0; // free everywhere, by policy — see data/store.ts
  return { ok: true, lines, subtotal, shipping, total: subtotal + shipping };
}
