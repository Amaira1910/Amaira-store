/* ==========================================================================
   HSN codes and GST rates.

   ⚠️  VERIFY WITH YOUR CHARTERED ACCOUNTANT before issuing real invoices.
   HSN classification is the seller's legal responsibility, and getting it
   wrong on a GST invoice is a compliance problem, not a cosmetic one. These
   are the codes commonly used for this category of goods in India.
   ========================================================================== */
import type { CategorySlug } from "@/lib/types";

export interface HsnEntry {
  hsn: string;
  gstRate: number;
  description: string;
}

/** Per-product overrides, checked before the category default. */
export const HSN_BY_SLUG: Record<string, HsnEntry> = {
  "studio-display": { hsn: "85285200", gstRate: 18, description: "Monitors capable of connecting to an ADP machine" },
  "apple-tv-4k": { hsn: "85287100", gstRate: 18, description: "Reception apparatus for television" },
  "homepod-2": { hsn: "85182200", gstRate: 18, description: "Multiple loudspeakers, single enclosure" },
  "homepod-mini": { hsn: "85182200", gstRate: 18, description: "Multiple loudspeakers, single enclosure" },
  "airpods-max-2": { hsn: "85183000", gstRate: 18, description: "Headphones and earphones" },
  "magic-keyboard-mac": { hsn: "84716060", gstRate: 18, description: "Input units for ADP machines" },
  "magic-keyboard-ipad-pro": { hsn: "84716060", gstRate: 18, description: "Input units for ADP machines" },
  "magic-mouse": { hsn: "84716060", gstRate: 18, description: "Input units for ADP machines" },
  "magic-trackpad": { hsn: "84716060", gstRate: 18, description: "Input units for ADP machines" },
  "apple-pencil-pro": { hsn: "84716060", gstRate: 18, description: "Input units for ADP machines" },
  "apple-pencil-usb-c": { hsn: "84716060", gstRate: 18, description: "Input units for ADP machines" },
  "usb-c-power-adapter": { hsn: "85044030", gstRate: 18, description: "Static converters, adaptors" },
  "usb-c-charge-cable": { hsn: "85444299", gstRate: 18, description: "Insulated cable fitted with connectors" },
  "magsafe-charger": { hsn: "85044030", gstRate: 18, description: "Static converters, adaptors" },
  "iphone-silicone-case-magsafe": { hsn: "39269099", gstRate: 18, description: "Other articles of plastics" },
  "iphone-clear-case-magsafe": { hsn: "39269099", gstRate: 18, description: "Other articles of plastics" },
  "apple-watch-band": { hsn: "91139000", gstRate: 18, description: "Watch straps and bands" },
  "airtag": { hsn: "85176290", gstRate: 18, description: "Apparatus for transmission or reception" },
  "airpods-pro-ear-tips": { hsn: "85189000", gstRate: 18, description: "Parts of headphones" },
};

/** Fallback per category. */
export const HSN_BY_CATEGORY: Record<CategorySlug, HsnEntry> = {
  iphone: { hsn: "85171300", gstRate: 18, description: "Smartphones" },
  mac: { hsn: "84713010", gstRate: 18, description: "Personal computers, portable ADP machines" },
  ipad: { hsn: "84713090", gstRate: 18, description: "Portable ADP machines, tablets" },
  watch: { hsn: "85176290", gstRate: 18, description: "Wearable communication apparatus" },
  audio: { hsn: "85183000", gstRate: 18, description: "Headphones and earphones" },
  "tv-home": { hsn: "85182200", gstRate: 18, description: "Loudspeakers" },
  accessories: { hsn: "85177090", gstRate: 18, description: "Parts and accessories" },
};

export function hsnFor(slug: string, category: CategorySlug): HsnEntry {
  return HSN_BY_SLUG[slug] ?? HSN_BY_CATEGORY[category];
}
