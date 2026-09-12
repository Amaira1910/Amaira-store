/* ==========================================================================
   Authoritative pricing.

   The browser sends a bag; the server ignores every price in it and recomputes
   from the catalog and the SKU table. A tampered payload therefore cannot buy
   an iPhone for ₹1 — it fails validation and the order is refused.

   Prices come from the DATABASE when a SKU row exists (so the shop can change
   a price without a deploy) and fall back to the catalog otherwise.
   ========================================================================== */
import { getProduct } from "@/data/catalog";
import { hsnFor } from "@/data/hsn";
import { getSkuByCode } from "@/lib/db/inventory";
import { skuCodeFor } from "@/lib/sku";
import type { CartLine } from "@/lib/types";

export interface PricedLine {
  slug: string;
  skuCode: string;
  skuId: number | null;
  name: string;
  colorName: string;
  storageLabel?: string;
  sizeLabel?: string;
  variantLabel: string;
  engraving?: string;
  qty: number;
  unitPrice: number;
  care: number;
  lineTotal: number;
  hsn: string;
  gstRate: number;
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

    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      return { ...empty, error: `Please choose a quantity between 1 and ${MAX_QTY_PER_LINE} for ${product.name}.` };
    }

    const color = product.colors.find((c) => c.id === raw.colorId);
    if (!color) return { ...empty, error: `Choose a finish for ${product.name}.` };

    let catalogPrice = product.basePrice;
    let storageLabel: string | undefined;
    let sizeLabel: string | undefined;

    if (product.storage?.length) {
      const option = product.storage.find((s) => s.id === raw.storageId);
      if (!option) return { ...empty, error: `Choose an option for ${product.name}.` };
      if (option.available === false) {
        return { ...empty, error: `${product.name} ${option.label} is not available right now.` };
      }
      catalogPrice += option.priceDelta;
      storageLabel = option.label;
    }

    if (product.sizes?.options.length) {
      const option = product.sizes.options.find((s) => s.id === raw.sizeId);
      if (!option) return { ...empty, error: `Choose ${product.sizes.title.toLowerCase()} for ${product.name}.` };
      catalogPrice += option.priceDelta;
      sizeLabel = option.label;
    }

    const skuCode = skuCodeFor(
      slug,
      color.id,
      typeof raw.storageId === "string" ? raw.storageId : null,
      typeof raw.sizeId === "string" ? raw.sizeId : null,
    );

    // The SKU row is the source of truth for price and for whether it is sellable.
    const sku = getSkuByCode(skuCode);
    if (sku && !sku.active) {
      return { ...empty, error: `${product.name} in ${color.name} is not available right now.` };
    }
    const unitPrice = sku?.price ?? catalogPrice;

    /* AppleCare+ is either the catalog price or nothing. A client cannot invent a figure. */
    const wantsCare = Number(raw.care) > 0;
    const care = wantsCare && product.careAnnual ? product.careAnnual : 0;

    const engraving =
      typeof raw.engraving === "string" && raw.engraving.trim()
        ? raw.engraving.trim().slice(0, 20)
        : undefined;

    const { hsn, gstRate } = hsnFor(slug, product.category);

    lines.push({
      slug,
      skuCode,
      skuId: sku?.id ?? null,
      name: product.name,
      colorName: color.name,
      storageLabel,
      sizeLabel,
      variantLabel: [color.name, storageLabel, sizeLabel].filter(Boolean).join(" · "),
      engraving,
      qty,
      unitPrice,
      care,
      lineTotal: (unitPrice + care) * qty,
      hsn,
      gstRate,
    });
  }

  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
  const shipping = 0; // free everywhere, by policy — see data/store.ts
  return { ok: true, lines, subtotal, shipping, total: subtotal + shipping };
}
