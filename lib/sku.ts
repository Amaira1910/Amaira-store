/* ==========================================================================
   SKU codes.

   Kept in its own module with no database import, because both the server
   (pricing, inventory) and the browser (choosing a variant on a product page)
   need to derive the same code from the same choices.
   ========================================================================== */

/** Deterministic, human-readable SKU code. Same inputs always give same code. */
export function skuCodeFor(
  slug: string,
  colorId: string,
  storageId?: string | null,
  sizeId?: string | null,
): string {
  const part = (v?: string | null) =>
    v ? v.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "") : null;
  return ["AMR", part(slug), part(colorId), part(storageId), part(sizeId)]
    .filter(Boolean)
    .join("-");
}
