"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { IconChevronDown } from "@/components/Icons";
import DeviceArt from "@/components/DeviceArt";
import { inr, noCostEmi } from "@/lib/money";
import type { ArtKind, StockState } from "@/lib/types";

/** The slim shape the listing needs — the full Product never reaches the client. */
export interface ListingItem {
  slug: string;
  category: string;
  name: string;
  family: string;
  tagline: string;
  eyebrow?: string;
  price: number;
  mrp?: number;
  art: ArtKind;
  stock: StockState;
  colors: { id: string; name: string; hex: string; accent?: string; screen?: string }[];
}

type Sort = "featured" | "price-asc" | "price-desc" | "name";

const BANDS: { id: string; label: string; min: number; max: number }[] = [
  { id: "u15", label: "Under ₹15,000", min: 0, max: 15000 },
  { id: "15-50", label: "₹15,000 – ₹50,000", min: 15000, max: 50000 },
  { id: "50-100", label: "₹50,000 – ₹1,00,000", min: 50000, max: 100000 },
  { id: "100+", label: "Above ₹1,00,000", min: 100000, max: Infinity },
];

export default function CategoryListing({ items }: { items: ListingItem[] }) {
  const params = useSearchParams();
  const initialFamily = params.get("family");

  const [families, setFamilies] = useState<string[]>(initialFamily ? [initialFamily] : []);
  const [bands, setBands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allFamilies = useMemo(() => {
    const seen: string[] = [];
    for (const i of items) if (!seen.includes(i.family)) seen.push(i.family);
    return seen;
  }, [items]);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const shown = useMemo(() => {
    let out = items.filter((i) => {
      if (families.length && !families.includes(i.family)) return false;
      if (inStockOnly && i.stock === "order") return false;
      if (bands.length) {
        const ok = bands.some((b) => {
          const band = BANDS.find((x) => x.id === b)!;
          return i.price >= band.min && i.price < band.max;
        });
        if (!ok) return false;
      }
      return true;
    });

    out = [...out];
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    else if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [items, families, bands, inStockOnly, sort]);


  const activeCount = families.length + bands.length + (inStockOnly ? 1 : 0);

  return (
    <div className="listing">
      <aside className={`filters${filtersOpen ? " is-open" : ""}`} aria-label="Filter products">
        <button
          type="button"
          className="filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="filter-body"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <span>Filter{activeCount > 0 ? ` (${activeCount})` : ""}</span>
          <IconChevronDown size={16} className="chev" />
        </button>

        <div className="filters-body" id="filter-body">
        <div className="spread filters-head" style={{ marginBottom: "var(--s-4)" }}>
          <h2 className="t-body" style={{ fontWeight: 600 }}>Filter</h2>
          {activeCount > 0 && (
            <button
              type="button"
              className="t-caption"
              style={{ color: "var(--link)" }}
              onClick={() => { setFamilies([]); setBands([]); setInStockOnly(false); }}
            >
              Clear ({activeCount})
            </button>
          )}
        </div>

        {allFamilies.length > 1 && (
          <div className="filter-group">
            <p className="filter-title">Model</p>
            {allFamilies.map((f) => (
              <label className="filter-opt" key={f}>
                <input
                  type="checkbox"
                  checked={families.includes(f)}
                  onChange={() => toggle(families, setFamilies, f)}
                />
                {f}
              </label>
            ))}
          </div>
        )}

        <div className="filter-group">
          <p className="filter-title">Price</p>
          {BANDS.map((b) => (
            <label className="filter-opt" key={b.id}>
              <input type="checkbox" checked={bands.includes(b.id)} onChange={() => toggle(bands, setBands, b.id)} />
              {b.label}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <p className="filter-title">Availability</p>
          <label className="filter-opt">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            In stock at Sanjaynagar
          </label>
        </div>
        </div>
      </aside>

      <div>
        <div className="listing-bar">
          <p className="t-body-sm muted" role="status" aria-live="polite">
            {shown.length} {shown.length === 1 ? "product" : "products"}
          </p>
          <div className="sort-wrap">
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select
              id="sort"
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="empty-state">
            <h2>Nothing matches those filters</h2>
            <p className="muted">Try widening the price range, or clear the filters to see everything.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: "var(--s-4)" }}
              onClick={() => { setFamilies([]); setBands([]); setInStockOnly(false); }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-3">
            {shown.map((i) => (
              <article className="tile" key={i.slug}>
                <div className="tile-media">
                  <DeviceArt
                    kind={i.art}
                    hex={i.colors[0].hex}
                    accent={i.colors[0].accent}
                    screen={i.colors[0].screen}
                    label={`${i.name} in ${i.colors[0].name}`}
                  />
                </div>
                <p className="tile-eyebrow">
                  {i.eyebrow ?? (i.stock === "low" ? "Low stock" : i.stock === "order" ? "To order" : "")}
                </p>
                <h3 className="tile-name">
                  <Link href={`/shop/${i.category}/${i.slug}`}>{i.name}</Link>
                </h3>
                <p className="tile-tagline">{i.tagline}</p>
                {i.colors.length > 1 && (
                  <div className="tile-swatches" aria-label={`${i.colors.length} finishes`}>
                    {i.colors.slice(0, 5).map((c) => (
                      <span key={c.id} className="swatch" style={{ background: c.hex }} title={c.name} />
                    ))}
                  </div>
                )}
                <div className="tile-foot">
                  <p className="tile-price">
                    From <strong>{inr(i.price)}</strong>
                    {i.mrp && i.mrp > i.price && <span className="buybox-mrp">{inr(i.mrp)}</span>}
                  </p>
                  {i.price >= 6000 && (
                    <p className="t-caption muted" style={{ marginTop: 4 }}>
                      or {inr(noCostEmi(i.price, 12))}/mo. for 12 mo.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
