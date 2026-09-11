"use client";

import { useState } from "react";
import { IconAlert, IconCheck, IconMinus, IconPlus } from "@/components/Icons";
import { receiveStockAction, stocktakeAction } from "@/app/admin/actions";
import { isNativeApp, scanBarcode, tapFeedback } from "@/lib/native";
import { inr } from "@/lib/money";

interface Sku {
  id: number;
  skuCode: string;
  productName: string;
  variant: string;
  price: number;
  onHand: number;
  reserved: number;
  available: number;
  barcode: string | null;
}

/**
 * Stock-taking, built around the camera.
 *
 * In the native app: point at the box, the SKU appears, tap a number, done.
 * In a browser: the scan button explains itself and the code is typed instead.
 * Same screen, same flow, one capability short.
 */
export default function StockTake() {
  const [sku, setSku] = useState<Sku | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const native = isNativeApp();

  async function lookup(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setError("Scan or type at least three characters.");
      return;
    }
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch(`/api/admin/sku-lookup?code=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!data.ok) {
        setSku(null);
        setError(data.error);
      } else {
        setSku(data.sku);
        void tapFeedback("medium");
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function scan() {
    setError(null);
    setDone(null);
    const result = await scanBarcode();
    if (!result.ok) {
      setError(result.error ?? "Could not scan.");
      return;
    }
    setCode(result.value ?? "");
    await lookup(result.value ?? "");
  }

  async function apply(delta: number) {
    if (!sku) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set("skuId", String(sku.id));
    form.set("qty", String(delta));
    form.set("note", "Stock-take from the app");
    const result = await receiveStockAction(null, form);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDone(result?.ok ?? "Saved.");
    void tapFeedback("light");
    await lookup(sku.barcode ?? sku.skuCode);
  }

  async function setCount(count: number) {
    if (!sku) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set("skuId", String(sku.id));
    form.set("count", String(count));
    const result = await stocktakeAction(null, form);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDone(result?.ok ?? "Counted.");
    await lookup(sku.barcode ?? sku.skuCode);
  }

  return (
    <>
      <div className="adm-card">
        <p className="adm-card-title">Find the item</p>

        <div className="row-wrap" style={{ marginBottom: "var(--s-4)" }}>
          <button type="button" className="btn" onClick={scan} disabled={busy}>
            Scan a barcode
          </button>
          {!native && (
            <span className="t-caption muted">
              Scanning needs the Amaira iOS app. Type the code below instead.
            </span>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void lookup(code);
          }}
        >
          <label className="field">
            <input
              className="field-input mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder=" "
              autoCapitalize="characters"
              autoComplete="off"
              inputMode="text"
            />
            <span className="field-label">Barcode or SKU code</span>
          </label>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ marginTop: "var(--s-3)" }} disabled={busy}>
            {busy ? "…" : "Look up"}
          </button>
        </form>

        {error && (
          <p className="notice notice-red" style={{ marginTop: "var(--s-4)" }}>
            <IconAlert size={16} /> <span>{error}</span>
          </p>
        )}
        {done && (
          <p className="notice" style={{ marginTop: "var(--s-4)", background: "rgba(0,128,9,0.08)", color: "#0a5c12" }}>
            <IconCheck size={16} /> <span>{done}</span>
          </p>
        )}
      </div>

      {sku && (
        <div className="adm-card">
          <p className="t-headline">{sku.productName}</p>
          <p className="t-body-sm muted">{sku.variant}</p>
          <p className="t-caption muted mono" style={{ marginTop: 4 }}>
            {sku.skuCode}
            {sku.barcode ? ` · barcode ${sku.barcode}` : " · no barcode set"}
          </p>

          <dl className="adm-stats" style={{ marginTop: "var(--s-5)" }}>
            <div className="adm-stat"><dt>On hand</dt><dd>{sku.onHand}</dd></div>
            <div className="adm-stat"><dt>Reserved</dt><dd>{sku.reserved}</dd></div>
            <div className="adm-stat"><dt>Available</dt><dd>{sku.available}</dd></div>
            <div className="adm-stat"><dt>Price</dt><dd style={{ fontSize: 20 }}>{inr(sku.price)}</dd></div>
          </dl>

          <p className="adm-card-title" style={{ marginTop: "var(--s-5)" }}>Received more</p>
          <div className="row-wrap">
            {[1, 2, 5, 10].map((n) => (
              <button key={n} type="button" className="chip" onClick={() => apply(n)} disabled={busy}>
                <IconPlus size={14} /> {n}
              </button>
            ))}
          </div>

          <p className="adm-card-title" style={{ marginTop: "var(--s-5)" }}>Remove</p>
          <div className="row-wrap">
            {[1, 2, 5].map((n) => (
              <button key={n} type="button" className="chip" onClick={() => apply(-n)} disabled={busy}>
                <IconMinus size={14} /> {n}
              </button>
            ))}
          </div>

          <p className="adm-card-title" style={{ marginTop: "var(--s-5)" }}>Counted exactly</p>
          <form
            className="stock-form"
            onSubmit={(e) => {
              e.preventDefault();
              const value = Number(new FormData(e.currentTarget).get("count"));
              if (Number.isInteger(value) && value >= 0) void setCount(value);
            }}
          >
            <input type="number" name="count" min={0} step={1} placeholder={String(sku.onHand)} aria-label="Counted quantity" />
            <button type="submit" disabled={busy}>Set count</button>
          </form>
        </div>
      )}
    </>
  );
}
