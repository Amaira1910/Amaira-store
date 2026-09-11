"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconAlert, IconCheck } from "@/components/Icons";
import { CONDITIONS, TRADE_IN, estimate } from "@/data/tradein";
import { inr } from "@/lib/money";

export default function TradeInEstimator({ phoneHref, phone }: { phoneHref: string; phone: string }) {
  const [familyId, setFamilyId] = useState(TRADE_IN[0].id);
  const [modelId, setModelId] = useState(TRADE_IN[0].models[0].id);
  const [conditionId, setConditionId] = useState(CONDITIONS[0].id);
  const [powersOn, setPowersOn] = useState(true);

  const family = TRADE_IN.find((f) => f.id === familyId)!;
  const model = family.models.find((m) => m.id === modelId) ?? family.models[0];
  const condition = CONDITIONS.find((c) => c.id === conditionId)!;

  const value = useMemo(
    () => estimate(model.top, condition.factor, powersOn),
    [model.top, condition.factor, powersOn],
  );

  function pickFamily(id: string) {
    setFamilyId(id);
    const f = TRADE_IN.find((x) => x.id === id)!;
    setModelId(f.models[0].id);
  }

  return (
    <div className="grid grid-2" style={{ gap: "var(--s-7)", alignItems: "start" }}>
      <div>
        <div className="buybox-section" style={{ marginTop: 0 }}>
          <p className="buybox-section-title">What are you trading in?</p>
          <div className="pill-tabs" role="group" aria-label="Device type">
            {TRADE_IN.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip"
                aria-pressed={f.id === familyId}
                onClick={() => pickFamily(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="buybox-section">
          <label className="field field-select">
            <select className="field-input" value={modelId} onChange={(e) => setModelId(e.target.value)}>
              {family.models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <span className="field-label" style={{ transform: "translateY(-9px) scale(0.75)" }}>Model</span>
          </label>
        </div>

        <div className="buybox-section">
          <p className="buybox-section-title">What condition is it in?</p>
          <p className="buybox-section-hint">Be honest — we check it in front of you anyway.</p>
          <div className="opt-grid" role="group" aria-label="Condition">
            {CONDITIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                className="opt"
                aria-pressed={c.id === conditionId}
                onClick={() => setConditionId(c.id)}
              >
                <span className="opt-label">{c.label}</span>
                <span className="opt-note">{c.note}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="buybox-section">
          <label className="checkbox">
            <input type="checkbox" checked={powersOn} onChange={(e) => setPowersOn(e.target.checked)} />
            <span>
              It switches on and the screen works
              <span className="t-caption muted" style={{ display: "block" }}>
                A device that will not power on is still worth something for recycling.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div>
        <div className="estimate-out">
          <p className="t-body-sm muted">Estimated trade-in value</p>
          <p className="estimate-value tnum" style={{ marginTop: 6 }} aria-live="polite">{inr(value)}</p>
          <p className="t-body-sm muted pretty" style={{ marginTop: "var(--s-3)" }}>
            for a {model.label} in {condition.label.toLowerCase()} condition
            {powersOn ? "" : " that does not power on"}
          </p>
          <a href={phoneHref} className="btn btn-block" style={{ marginTop: "var(--s-5)" }}>
            Call {phone} to confirm
          </a>
          <Link href="/store" className="btn btn-quiet btn-block" style={{ marginTop: "var(--s-3)" }}>
            Bring it to the store
          </Link>
        </div>

        <div className="notice notice-amber" style={{ marginTop: "var(--s-4)" }}>
          <IconAlert size={18} />
          <span>
            <strong>This is an estimate, not an offer.</strong> The final value is set in store after
            we check the device, its storage, its battery health and that Find My is switched off.
          </span>
        </div>

        <ul className="stack-sm" style={{ marginTop: "var(--s-5)" }}>
          {[
            "The value comes straight off the price of your new device.",
            "Bring a photo ID and the original bill if you still have it.",
            "Switch off Find My and sign out of iCloud before you come in.",
            "We wipe every device we take, in front of you.",
          ].map((t) => (
            <li key={t} className="row" style={{ alignItems: "flex-start" }}>
              <IconCheck size={17} style={{ color: "var(--green)", flex: "none", marginTop: 2 }} />
              <span className="t-body-sm muted">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
