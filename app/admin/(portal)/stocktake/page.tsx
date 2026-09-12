import StockTake from "@/components/admin/StockTake";
import { requireAdmin } from "@/lib/admin-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stock-take" };

export default async function StockTakePage() {
  await requireAdmin("/admin/stocktake");

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Stock-take</h1>
          <p>Point the camera at a box. Adjust what is on the shelf in a couple of taps.</p>
        </div>
      </div>

      <StockTake />

      <div className="adm-card">
        <p className="adm-card-title">Getting the most from this</p>
        <ul className="stack-sm t-body-sm muted">
          <li>· Set each SKU&rsquo;s barcode once, from the box, in <strong>Inventory</strong>. After that the scanner finds it instantly.</li>
          <li>· <strong>Received more</strong> adds units and records them as a purchase.</li>
          <li>· <strong>Counted exactly</strong> overwrites the figure and records the difference, which is what you want at the end of a shift.</li>
          <li>· Every change is attributed to you and timestamped in the movement ledger.</li>
        </ul>
      </div>
    </>
  );
}
