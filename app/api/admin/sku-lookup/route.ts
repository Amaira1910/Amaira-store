/* GET /api/admin/sku-lookup?code=…

   Resolves a scanned barcode, or a typed SKU code, to a stock row. Used by the
   stock-take screen in the native app. Session-protected: this exposes cost
   prices and stock positions. */
import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin-session";
import { getSkuByBarcode, getSkuByCode } from "@/lib/db/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await currentAdmin();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const code = new URL(request.url).searchParams.get("code")?.trim() ?? "";
  if (code.length < 3) return NextResponse.json({ ok: false, error: "Scan or type a code." }, { status: 400 });

  // A scan gives a barcode; a typed entry is usually our own SKU code.
  const sku = getSkuByBarcode(code) ?? getSkuByCode(code.toUpperCase());
  if (!sku) {
    return NextResponse.json(
      { ok: false, error: `Nothing matches “${code}”. Set the barcode against a SKU in Inventory first.` },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    sku: {
      id: sku.id,
      skuCode: sku.sku_code,
      productName: sku.product_name,
      variant: [sku.color_name, sku.storage_label, sku.size_label].filter(Boolean).join(" · "),
      price: sku.price,
      onHand: sku.stock_on_hand,
      reserved: sku.stock_reserved,
      available: sku.stock_on_hand - sku.stock_reserved,
      barcode: sku.barcode,
    },
  });
}
