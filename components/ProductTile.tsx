import Link from "next/link";
import DeviceArt from "@/components/DeviceArt";
import type { Product } from "@/lib/types";
import { fromPrice } from "@/data/catalog";
import { inr, noCostEmi, savings } from "@/lib/money";

export default function ProductTile({ product, emi = true }: { product: Product; emi?: boolean }) {
  const price = fromPrice(product);
  const saved = savings(product.basePrice, product.mrp);
  const colors = product.colors.slice(0, 5);
  const href = `/shop/${product.category}/${product.slug}`;

  return (
    <article className="tile">
      <div className="tile-media">
        <DeviceArt
          kind={product.art}
          hex={product.colors[0].hex}
          accent={product.colors[0].accent}
          screen={product.colors[0].screen}
          label={`${product.name} in ${product.colors[0].name}`}
        />
      </div>

      <p className="tile-eyebrow">{product.eyebrow ?? (saved ? `Save ${inr(saved)}` : "")}</p>
      <h3 className="tile-name">
        <Link href={href}>{product.name}</Link>
      </h3>
      <p className="tile-tagline">{product.tagline}</p>

      {colors.length > 1 && (
        <div className="tile-swatches" aria-label={`${colors.length} finishes available`}>
          {colors.map((c) => (
            <span key={c.id} className="swatch" style={{ background: c.hex }} title={c.name} />
          ))}
        </div>
      )}

      <div className="tile-foot">
        <p className="tile-price">
          From <strong>{inr(price)}</strong>
          {product.mrp && product.mrp > product.basePrice && (
            <span className="buybox-mrp">{inr(product.mrp)}</span>
          )}
        </p>
        {emi && price >= 6000 && (
          <p className="t-caption muted" style={{ marginTop: 4 }}>
            or {inr(noCostEmi(price, 12))}/mo. for 12 mo. at no cost
          </p>
        )}
      </div>
    </article>
  );
}
