"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DeviceArt from "@/components/DeviceArt";
import { IconCheck, IconGift, IconPin, IconShield, IconTruck } from "@/components/Icons";
import { lineKey, useCart } from "@/lib/cart";
import { inr, noCostEmi, savings } from "@/lib/money";
import type { ArtKind, ColorOption, StockState, VariantOption } from "@/lib/types";

export interface ProductDetailProps {
  slug: string;
  category: string;
  name: string;
  tagline: string;
  eyebrow?: string;
  basePrice: number;
  mrp?: number;
  art: ArtKind;
  colors: ColorOption[];
  storage?: VariantOption[];
  storageTitle?: string;
  sizes?: { title: string; options: VariantOption[] };
  stock: StockState;
  careAnnual?: number;
  deliveryLine: string;
  pickupLine: string;
  engravable: boolean;
}

const EMI_TENURES = [3, 6, 9, 12];

export default function ProductDetail(p: ProductDetailProps) {
  const { add, notify } = useCart();

  const [colorId, setColorId] = useState(p.colors[0].id);
  const [storageId, setStorageId] = useState(p.storage?.[0]?.id);
  const [sizeId, setSizeId] = useState(p.sizes?.options[0]?.id);
  const [care, setCare] = useState(false);
  const [engraving, setEngraving] = useState("");
  const [tenure, setTenure] = useState(12);
  const [added, setAdded] = useState(false);

  const color = p.colors.find((c) => c.id === colorId) ?? p.colors[0];
  const storage = p.storage?.find((s) => s.id === storageId);
  const size = p.sizes?.options.find((s) => s.id === sizeId);

  const unitPrice = p.basePrice + (storage?.priceDelta ?? 0) + (size?.priceDelta ?? 0);
  const saved = savings(p.basePrice, p.mrp);
  const careCost = care ? p.careAnnual ?? 0 : 0;
  const total = unitPrice + careCost;

  const emiOptions = useMemo(
    () => EMI_TENURES.map((m) => ({ months: m, amount: noCostEmi(total, m) })),
    [total],
  );

  const orderable = p.stock !== "order";

  function addToBag() {
    add({
      key: lineKey(p.slug, color.id, storage?.id, size?.id),
      slug: p.slug,
      category: p.category,
      name: p.name,
      art: p.art,
      colorId: color.id,
      colorName: color.name,
      colorHex: color.hex,
      colorAccent: color.accent,
      colorScreen: color.screen,
      storageId: storage?.id,
      storageLabel: storage?.label,
      sizeId: size?.id,
      sizeLabel: size?.label,
      unitPrice,
      care: careCost || undefined,
      engraving: engraving.trim() || undefined,
      qty: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
    notify(`${p.name} added to your bag`, { href: "/bag", linkText: "View bag" });
  }

  return (
    <div className="pdp">
      {/* ------------------------------------------------------------ gallery */}
      <div className="gallery">
        <div className="gallery-stage">
          <DeviceArt
            kind={p.art}
            hex={color.hex}
            accent={color.accent}
            screen={color.screen}
            label={`${p.name} in ${color.name}`}
          />
        </div>
        {p.colors.length > 1 && (
          <div className="gallery-thumbs">
            {p.colors.map((c) => (
              <button
                key={c.id}
                type="button"
                className="gallery-thumb"
                aria-pressed={c.id === colorId}
                aria-label={`Show ${p.name} in ${c.name}`}
                onClick={() => setColorId(c.id)}
              >
                <DeviceArt kind={p.art} hex={c.hex} accent={c.accent} screen={c.screen} label="" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- buybox */}
      <div>
        {p.eyebrow && <p className="t-body-sm amber" style={{ fontWeight: 600, marginBottom: 6 }}>{p.eyebrow}</p>}
        <h1 className="buybox-title balance">{p.name}</h1>
        <p className="buybox-tagline pretty">{p.tagline}</p>

        <p className="buybox-price" style={{ marginTop: "var(--s-5)" }}>
          {inr(unitPrice)}
          {p.mrp && p.mrp > p.basePrice && <span className="buybox-mrp">{inr(p.mrp + (storage?.priceDelta ?? 0) + (size?.priceDelta ?? 0))}</span>}
        </p>
        {saved && <p className="t-body-sm amber" style={{ marginTop: 4 }}>You save {inr(saved)}</p>}
        <p className="t-caption muted" style={{ marginTop: 6 }}>
          Inclusive of all taxes. GST invoice available.
        </p>

        {/* colour */}
        {p.colors.length > 1 && (
          <div className="buybox-section">
            <p className="buybox-section-title">Finish — {color.name}</p>
            <p className="buybox-section-hint">Pick the one you will look at every day.</p>
            <div className="row-wrap" role="group" aria-label="Choose a finish">
              {p.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="swatch-btn"
                  aria-pressed={c.id === colorId}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setColorId(c.id)}
                >
                  <span className="swatch" style={{ background: c.hex }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* storage / variant ladder */}
        {p.storage && p.storage.length > 1 && (
          <div className="buybox-section">
            <p className="buybox-section-title">{p.storageTitle ?? "Storage"}</p>
            <p className="buybox-section-hint">How much do you need?</p>
            <div className="opt-grid opt-grid-2" role="group" aria-label={p.storageTitle ?? "Storage"}>
              {p.storage.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="opt"
                  aria-pressed={s.id === storageId}
                  disabled={s.available === false}
                  onClick={() => setStorageId(s.id)}
                >
                  <span className="opt-label">{s.label}</span>
                  <span className="opt-note">
                    {s.note ? `${s.note} · ` : ""}
                    {inr(p.basePrice + s.priceDelta + (size?.priceDelta ?? 0))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* second axis */}
        {p.sizes && p.sizes.options.length > 1 && (
          <div className="buybox-section">
            <p className="buybox-section-title">{p.sizes.title}</p>
            <div className="opt-grid opt-grid-2" role="group" aria-label={p.sizes.title}>
              {p.sizes.options.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="opt"
                  aria-pressed={s.id === sizeId}
                  onClick={() => setSizeId(s.id)}
                >
                  <span className="opt-label">{s.label}</span>
                  <span className="opt-note">
                    {s.note ? `${s.note} · ` : ""}
                    {inr(p.basePrice + (storage?.priceDelta ?? 0) + s.priceDelta)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* engraving */}
        {p.engravable && (
          <div className="buybox-section">
            <p className="buybox-section-title">
              <IconGift size={17} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} />
              Free engraving
            </p>
            <p className="buybox-section-hint">
              We engrave in store while you wait. Emoji, names, numbers — up to 20 characters.
            </p>
            <label className="field">
              <input
                className="field-input"
                value={engraving}
                maxLength={20}
                placeholder=" "
                onChange={(e) => setEngraving(e.target.value)}
              />
              <span className="field-label">Engraving (optional)</span>
            </label>
          </div>
        )}

        {/* AppleCare+ */}
        {p.careAnnual && (
          <div className="buybox-section">
            <p className="buybox-section-title">Add AppleCare+</p>
            <p className="buybox-section-hint">
              Accidental damage cover and Apple-certified repairs, serviced through us.
            </p>
            <label className={`radio-card${care ? " is-on" : ""}`}>
              <input type="checkbox" checked={care} onChange={(e) => setCare(e.target.checked)} />
              <span>
                <span className="radio-card-title">AppleCare+ — {inr(p.careAnnual)}/year</span>
                <span className="radio-card-note">
                  Unlimited incidents of accidental damage, each subject to a service fee. Cancel any time.
                </span>
              </span>
            </label>
          </div>
        )}

        {/* EMI */}
        {total >= 6000 && (
          <div className="buybox-section">
            <p className="buybox-section-title">No-cost EMI</p>
            <div className="pill-tabs" role="group" aria-label="EMI tenure">
              {emiOptions.map((o) => (
                <button
                  key={o.months}
                  type="button"
                  className="chip"
                  aria-pressed={tenure === o.months}
                  onClick={() => setTenure(o.months)}
                >
                  {o.months} mo.
                </button>
              ))}
            </div>
            <div className="emi-box">
              <div className="emi-row">
                <span className="muted">Monthly payment</span>
                <strong className="tnum">{inr(noCostEmi(total, tenure))}</strong>
              </div>
              <div className="emi-row">
                <span className="muted">Total over {tenure} months</span>
                <span className="tnum">{inr(total)}</span>
              </div>
              <div className="emi-row">
                <span className="muted">Interest you pay</span>
                <span className="green">Nothing</span>
              </div>
            </div>
            <p className="t-caption muted" style={{ marginTop: 10 }}>
              Subject to your bank&rsquo;s approval. <Link href="/finance">See eligible cards and terms ›</Link>
            </p>
          </div>
        )}

        {/* fulfilment */}
        <div className="buybox-section stack-sm">
          <div className="notice">
            <IconTruck size={18} />
            <span><strong>{p.deliveryLine}.</strong> Free on every order, no minimum.</span>
          </div>
          <div className="notice">
            <IconPin size={18} />
            <span><strong>{p.pickupLine}</strong> at Sanjaynagar Main Road.</span>
          </div>
          <div className="notice">
            <IconShield size={18} />
            <span>Full Apple India warranty. Set-up and data transfer free in store.</span>
          </div>
        </div>

        {/* buy */}
        <div className="buybox-sticky">
          <div className="spread" style={{ marginBottom: "var(--s-3)" }}>
            <span className="t-body-sm muted">Total</span>
            <strong className="t-headline tnum">{inr(total)}</strong>
          </div>
          <button
            type="button"
            className="btn btn-block btn-lg"
            onClick={addToBag}
            disabled={!orderable}
          >
            {added ? (<><IconCheck size={18} /> Added to bag</>) : orderable ? "Add to Bag" : "Notify me"}
          </button>
          {!orderable && (
            <p className="t-caption muted center" style={{ marginTop: 10 }}>
              This one is made to order. <Link href="/contact">Tell us and we will call you when it lands ›</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
