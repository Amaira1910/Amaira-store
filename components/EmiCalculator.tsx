"use client";

import { useMemo, useState } from "react";
import { emi, inr, noCostEmi } from "@/lib/money";

const TENURES = [3, 6, 9, 12, 18, 24];
/** Tenures the no-cost scheme covers. Beyond that, interest is real. */
const NO_COST_MAX = 12;
const STANDARD_RATE = 14; // % p.a., typical Indian credit-card EMI

export default function EmiCalculator({ banks }: { banks: readonly string[] }) {
  const [amount, setAmount] = useState(134900);
  const [tenure, setTenure] = useState(12);

  const noCost = tenure <= NO_COST_MAX;
  const monthly = useMemo(
    () => (noCost ? noCostEmi(amount, tenure) : emi(amount, tenure, STANDARD_RATE)),
    [amount, tenure, noCost],
  );
  const totalPaid = monthly * tenure;
  const interest = Math.max(0, totalPaid - amount);

  return (
    <div className="grid grid-2" style={{ gap: "var(--s-7)", alignItems: "start" }}>
      <div>
        <div className="buybox-section" style={{ marginTop: 0 }}>
          <label className="buybox-section-title" htmlFor="emi-amount">Purchase amount</label>
          <p className="buybox-section-hint">Drag, or type the price of what you are buying.</p>
          <input
            id="emi-amount"
            type="range"
            min={6000}
            max={400000}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--blue)" }}
          />
          <label className="field" style={{ marginTop: "var(--s-3)" }}>
            <input
              className="field-input tnum"
              type="number"
              min={6000}
              max={400000}
              value={amount}
              onChange={(e) => setAmount(Math.min(400000, Math.max(6000, Number(e.target.value) || 0)))}
              placeholder=" "
            />
            <span className="field-label" style={{ transform: "translateY(-9px) scale(0.75)" }}>Amount in ₹</span>
          </label>
        </div>

        <div className="buybox-section">
          <p className="buybox-section-title">Over how long?</p>
          <div className="pill-tabs" role="group" aria-label="EMI tenure in months">
            {TENURES.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={t === tenure} onClick={() => setTenure(t)}>
                {t} months
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="estimate-out">
          <p className="t-body-sm muted">You pay each month</p>
          <p className="estimate-value tnum" style={{ marginTop: 6 }} aria-live="polite">{inr(monthly)}</p>
          <p className="t-body-sm muted" style={{ marginTop: "var(--s-3)" }}>
            for {tenure} months
          </p>

          <div style={{ marginTop: "var(--s-5)", textAlign: "left" }}>
            <div className="emi-row"><span className="muted">Purchase amount</span><span className="tnum">{inr(amount)}</span></div>
            <div className="emi-row"><span className="muted">Total you pay</span><span className="tnum">{inr(totalPaid)}</span></div>
            <div className="emi-row">
              <span className="muted">Interest</span>
              {noCost ? <span className="green">Nothing</span> : <span className="tnum amber">{inr(interest)}</span>}
            </div>
          </div>
        </div>

        <div className={`notice ${noCost ? "notice-blue" : "notice-amber"}`} style={{ marginTop: "var(--s-4)" }}>
          <span>
            {noCost ? (
              <>
                <strong>No-cost EMI.</strong> The interest your bank charges is absorbed as a discount,
                so {inr(monthly)} × {tenure} comes to exactly the purchase price.
              </>
            ) : (
              <>
                <strong>Standard EMI.</strong> Beyond 12 months the no-cost scheme does not apply, so
                interest is charged — shown here at an indicative {STANDARD_RATE}% p.a. Your bank sets
                the real rate.
              </>
            )}
          </span>
        </div>

        <p className="t-caption muted" style={{ marginTop: "var(--s-4)" }}>
          Available on credit cards from {banks.join(", ")}, plus debit-card EMI on selected banks and
          cardless options. Approval and rate are decided by your bank, not by us.
        </p>
      </div>
    </div>
  );
}
