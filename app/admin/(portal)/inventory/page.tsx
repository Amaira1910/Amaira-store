import Link from "next/link";
import ActionForm from "@/components/admin/ActionForm";
import { receiveStockAction, stocktakeAction, updateSkuAction } from "@/app/admin/actions";
import { CATEGORIES } from "@/data/categories";
import { listSkus } from "@/lib/db/inventory";
import { inr } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = { title: "Inventory" };

type Search = { q?: string; category?: string; low?: string };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { q, category, low } = await searchParams;
  const rows = listSkus({ search: q, category, lowOnly: low === "1", limit: 400 });

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Inventory</h1>
          <p>
            {rows.length} SKU{rows.length === 1 ? "" : "s"} shown. Available is on-hand minus
            whatever is reserved for a checkout in progress.
          </p>
        </div>
      </div>

      <form className="adm-toolbar" method="get">
        <div className="adm-search">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search product, SKU code or barcode…"
            aria-label="Search inventory"
          />
        </div>
        <div className="sort-wrap">
          <label className="sr-only" htmlFor="cat">Category</label>
          <select id="cat" name="category" defaultValue={category ?? ""} className="sort-select">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <label className="checkbox" style={{ fontSize: "var(--t-body-sm)" }}>
          <input type="checkbox" name="low" value="1" defaultChecked={low === "1"} />
          Low stock only
        </label>
        <button type="submit" className="btn btn-sm">Apply</button>
        {(q || category || low) && <Link href="/admin/inventory" className="t-caption" style={{ color: "var(--link)" }}>Clear</Link>}
      </form>

      {rows.length === 0 ? (
        <div className="adm-card adm-empty">
          <p>Nothing matches that filter.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th className="num">Price</th>
                <th className="num">Cost</th>
                <th className="num">On hand</th>
                <th className="num">Reserved</th>
                <th className="num">Available</th>
                <th>Receive / adjust</th>
                <th>Count</th>
                <th>Price · cost · barcode</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const variant = [s.color_name, s.storage_label, s.size_label].filter(Boolean).join(" · ");
                const isOut = s.available <= 0;
                const isLow = !isOut && s.available <= s.low_stock_threshold;
                return (
                  <tr key={s.id}>
                    <td style={{ minWidth: 190 }}>
                      <Link href={`/shop/${s.category}/${s.product_slug}`}>{s.product_name}</Link>
                      <span className="adm-sub">{variant}</span>
                    </td>
                    <td className="mono tight">
                      {s.sku_code}
                      {s.barcode && <span className="adm-sub mono">bar {s.barcode}</span>}
                      <span className="adm-sub">HSN {s.hsn}</span>
                    </td>
                    <td className="num">{inr(s.price)}</td>
                    <td className="num">{s.cost_price ? inr(s.cost_price) : <span className="faint">—</span>}</td>
                    <td className="num">{s.stock_on_hand}</td>
                    <td className="num">{s.stock_reserved || <span className="faint">0</span>}</td>
                    <td className="num">
                      {s.available}
                      {isOut ? <span className="pill pill-out" style={{ marginLeft: 6 }}>out</span>
                        : isLow ? <span className="pill pill-low" style={{ marginLeft: 6 }}>low</span> : null}
                    </td>

                    <td>
                      <ActionForm action={receiveStockAction} className="stock-form" submitLabel="Apply" quiet>
                        <input type="hidden" name="skuId" value={s.id} />
                        <input type="number" name="qty" step="1" placeholder="+/-" aria-label={`Change stock for ${s.sku_code}`} />
                      </ActionForm>
                    </td>

                    <td>
                      <ActionForm action={stocktakeAction} className="stock-form" submitLabel="Set" quiet>
                        <input type="hidden" name="skuId" value={s.id} />
                        <input type="number" name="count" min={0} step="1" placeholder={String(s.stock_on_hand)} aria-label={`Counted quantity for ${s.sku_code}`} />
                      </ActionForm>
                    </td>

                    <td>
                      <ActionForm action={updateSkuAction} className="stock-form" submitLabel="Save" quiet>
                        <input type="hidden" name="skuId" value={s.id} />
                        <input type="number" name="price" step="1" placeholder={String(s.price)} aria-label={`Price for ${s.sku_code}`} />
                        <input type="number" name="cost_price" step="1" placeholder={s.cost_price ? String(s.cost_price) : "cost"} aria-label={`Cost for ${s.sku_code}`} />
                        <input type="text" name="barcode" defaultValue={s.barcode ?? ""} placeholder="barcode" style={{ width: 108, textAlign: "left" }} aria-label={`Barcode for ${s.sku_code}`} />
                      </ActionForm>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm-card" style={{ marginTop: "var(--s-5)" }}>
        <p className="adm-card-title">How stock works here</p>
        <ul className="stack-sm t-body-sm muted">
          <li>· <strong>Receive / adjust</strong> adds or removes units and writes a ledger row. Use a negative number for damage or a write-off.</li>
          <li>· <strong>Count</strong> sets an absolute figure, as a stock-take does. The difference is recorded automatically.</li>
          <li>· <strong>Reserved</strong> is stock held for a checkout in progress. It releases itself after 20 minutes if the payment is abandoned.</li>
          <li>· You cannot take on-hand below the reserved figure — somebody is mid-payment for those units.</li>
          <li>· Barcodes are optional. Fill them in from the box and the scanner in the iOS app will find the SKU instantly.</li>
        </ul>
      </div>
    </>
  );
}
