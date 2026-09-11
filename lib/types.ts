/* ==========================================================================
   Amaira — domain types
   Money is always a whole number of rupees (INR). Convert to paise only at
   the Razorpay boundary (see lib/money.ts) so no fractional rupees can leak
   into a cart total.
   ========================================================================== */

export type CategorySlug =
  | "iphone"
  | "mac"
  | "ipad"
  | "watch"
  | "audio"
  | "tv-home"
  | "accessories";

/** Which parametric SVG render to draw for this product. See components/DeviceArt.tsx. */
export type ArtKind =
  | "phone"
  | "phone-pro"
  | "laptop"
  | "tablet"
  | "watch"
  | "watch-rugged"
  | "buds"
  | "headphones"
  | "speaker"
  | "speaker-mini"
  | "imac"
  | "mac-mini"
  | "mac-studio"
  | "display"
  | "tv-box"
  | "pencil"
  | "keyboard"
  | "mouse"
  | "trackpad"
  | "airtag"
  | "adapter"
  | "magsafe"
  | "case"
  | "band"
  | "cable";

export interface ColorOption {
  /** url-safe id, unique within the product */
  id: string;
  name: string;
  /** Primary body colour of the render. */
  hex: string;
  /** Optional secondary — camera plateau, band, accent. Defaults to a shade of hex. */
  accent?: string;
  /** Optional on-screen wallpaper tint for devices with displays. */
  screen?: string;
}

export interface VariantOption {
  id: string;
  label: string;
  /** Added to the product's base price, in rupees. 0 for the entry option. */
  priceDelta: number;
  /** Sub-label, e.g. "up to 22 hours video playback". */
  note?: string;
  /** false = shown but not orderable. */
  available?: boolean;
}

export interface SpecGroup {
  group: string;
  rows: { k: string; v: string }[];
}

export interface Highlight {
  title: string;
  copy: string;
}

export type StockState = "in" | "low" | "order";

export interface Product {
  slug: string;
  name: string;
  /** Marketing family used for filtering and the local nav, e.g. "iPhone 17 Pro". */
  family: string;
  category: CategorySlug;
  tagline: string;
  /** Small coloured line above the name on tiles, e.g. "New". */
  eyebrow?: string;
  /** Entry price in rupees, for the lowest-priced combination of options. */
  basePrice: number;
  /** Optional struck-through MRP, for genuine markdowns only. */
  mrp?: number;
  art: ArtKind;
  colors: ColorOption[];
  /** Storage / capacity ladder. Omit for products without one. */
  storage?: VariantOption[];
  /** Heading for that ladder. Defaults to "Storage" — override with "Model",
      "Capacity", "Size", "Connectivity" and so on. */
  storageTitle?: string;
  /** Case size, band size, adapter wattage — a second axis where relevant. */
  sizes?: { title: string; options: VariantOption[] };
  highlights: Highlight[];
  specs: SpecGroup[];
  inBox: string[];
  stock: StockState;
  /** Higher sorts first in "Featured". */
  rank: number;
  /** Free-text search and filter keywords. */
  tags: string[];
  /** Shown on the PDP delivery block. */
  leadTimeDays?: number;
  /** Apple Care+ annual price in rupees, when offered for this product. */
  careAnnual?: number;
  /** Eligible for the trade-in programme. */
  tradeIn?: boolean;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Nav label, sometimes shorter than name. */
  short: string;
  tagline: string;
  /** Hero copy for the category landing page. */
  heroTitle: string;
  heroSub: string;
  art: ArtKind;
}

/* --- Cart ---------------------------------------------------------------- */

export interface CartLine {
  /** Stable composite key: slug + selected option ids. */
  key: string;
  slug: string;
  /** Category slug, stored so the bag can link back without guessing. */
  category: string;
  name: string;
  art: ArtKind;
  colorId: string;
  colorName: string;
  colorHex: string;
  colorAccent?: string;
  colorScreen?: string;
  storageId?: string;
  storageLabel?: string;
  sizeId?: string;
  sizeLabel?: string;
  /** Unit price in rupees, with all option deltas already applied. */
  unitPrice: number;
  qty: number;
  /** AppleCare+ added alongside this line, in rupees (annual). */
  care?: number;
  engraving?: string;
}

export type Fulfilment = "delivery" | "pickup";

export interface CheckoutContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CheckoutAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderDraft {
  lines: CartLine[];
  contact: CheckoutContact;
  fulfilment: Fulfilment;
  address?: CheckoutAddress;
  gstin?: string;
  /** Totals in rupees. */
  subtotal: number;
  shipping: number;
  total: number;
}
