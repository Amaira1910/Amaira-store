/* ==========================================================================
   Trade-in values.

   ⚠️  INDICATIVE ONLY — these are the numbers the on-site estimator quotes,
   and they must match what you are actually willing to pay. Review them
   monthly; second-hand values move fast. The site is careful to call every
   figure an estimate, and to say the final price is set in store.
   ========================================================================== */

export interface TradeInModel {
  id: string;
  label: string;
  /** Best-case value, in rupees, for a flawless unit with full storage. */
  top: number;
}

export interface TradeInFamily {
  id: string;
  label: string;
  models: TradeInModel[];
}

export const TRADE_IN: TradeInFamily[] = [
  {
    id: "iphone",
    label: "iPhone",
    models: [
      { id: "16-pro-max", label: "iPhone 16 Pro Max", top: 82000 },
      { id: "16-pro", label: "iPhone 16 Pro", top: 70000 },
      { id: "16", label: "iPhone 16", top: 46000 },
      { id: "15-pro-max", label: "iPhone 15 Pro Max", top: 62000 },
      { id: "15-pro", label: "iPhone 15 Pro", top: 52000 },
      { id: "15", label: "iPhone 15", top: 36000 },
      { id: "14-pro", label: "iPhone 14 Pro", top: 38000 },
      { id: "14", label: "iPhone 14", top: 26000 },
      { id: "13", label: "iPhone 13", top: 19000 },
      { id: "12", label: "iPhone 12", top: 13000 },
      { id: "11", label: "iPhone 11", top: 8500 },
      { id: "older-iphone", label: "iPhone X or older", top: 5000 },
    ],
  },
  {
    id: "ipad",
    label: "iPad",
    models: [
      { id: "ipad-pro-m4", label: "iPad Pro (M4)", top: 62000 },
      { id: "ipad-pro-m2", label: "iPad Pro (M2)", top: 44000 },
      { id: "ipad-air-m2", label: "iPad Air (M2)", top: 32000 },
      { id: "ipad-10", label: "iPad (10th gen)", top: 18000 },
      { id: "ipad-mini-6", label: "iPad mini (6th gen)", top: 21000 },
    ],
  },
  {
    id: "mac",
    label: "Mac",
    models: [
      { id: "mbp-16-m3-max", label: 'MacBook Pro 16" (M3 Max)', top: 165000 },
      { id: "mbp-14-m3", label: 'MacBook Pro 14" (M3)', top: 98000 },
      { id: "mba-15-m3", label: 'MacBook Air 15" (M3)', top: 72000 },
      { id: "mba-13-m2", label: 'MacBook Air 13" (M2)', top: 52000 },
      { id: "mba-13-m1", label: 'MacBook Air 13" (M1)', top: 34000 },
      { id: "mac-mini-m2", label: "Mac mini (M2)", top: 32000 },
      { id: "imac-m1", label: 'iMac 24" (M1)', top: 58000 },
    ],
  },
  {
    id: "watch",
    label: "Apple Watch",
    models: [
      { id: "ultra-2", label: "Apple Watch Ultra 2", top: 48000 },
      { id: "s10", label: "Apple Watch Series 10", top: 24000 },
      { id: "s9", label: "Apple Watch Series 9", top: 18000 },
      { id: "se2", label: "Apple Watch SE (2nd gen)", top: 11000 },
    ],
  },
];

export interface Condition {
  id: string;
  label: string;
  note: string;
  /** Multiplier applied to the model's top value. */
  factor: number;
}

export const CONDITIONS: Condition[] = [
  { id: "flawless", label: "Flawless", note: "No marks at all. Screen and body look new.", factor: 1 },
  { id: "good", label: "Good", note: "Light scuffs on the frame. Screen is unmarked.", factor: 0.82 },
  { id: "fair", label: "Fair", note: "Visible scratches, or a small dent. Everything still works.", factor: 0.6 },
  { id: "damaged", label: "Damaged", note: "Cracked screen or back, or a failing battery.", factor: 0.3 },
];

export function estimate(topValue: number, factor: number, powersOn: boolean): number {
  if (!powersOn) return Math.round((topValue * 0.12) / 100) * 100;
  return Math.round((topValue * factor) / 100) * 100;
}
