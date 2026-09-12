/* Apple Watch — reconciled against apple.com/in on 12 September 2026.
   Current line-up: Series 12, Ultra 4, SE 3. Series 11 and Ultra 3 were
   superseded on 9 Sept 2026 and are no longer sold new.
   Prices are Apple India retail MRP (inclusive of all taxes).
   ⚠️ The Cellular upgrade deltas below are derived, not read off a per-SKU
   page — check them against your APR price list before go-live. */
import type { Product } from "@/lib/types";
import { WATCH_ALUMINIUM_12 } from "../palettes";

export const WATCHES: Product[] = [
  {
    slug: "apple-watch-series-12",
    name: "Apple Watch Series 12",
    family: "Apple Watch Series",
    category: "watch",
    tagline: "A new health sensing system, with hypertension notifications and a sleep score.",
    eyebrow: "New",
    basePrice: 56900,
    art: "watch",
    /* Aluminium finishes only. Apple also sells Series 12 in titanium and
       ceramic at materially higher prices (ceramic from ₹1,24,900); this
       schema prices one axis, so stock those as separate products if Amaira
       carries them. */
    colors: WATCH_ALUMINIUM_12,
    sizes: {
      title: "Case size",
      options: [
        { id: "42mm", label: "42 mm", priceDelta: 0, note: "Fits 130–200 mm wrists" },
        { id: "46mm", label: "46 mm", priceDelta: 6000, note: "Fits 140–220 mm wrists" },
      ],
    },
    storageTitle: "Connectivity",
    storage: [
      { id: "gps", label: "GPS", priceDelta: 0, note: "Pairs with your iPhone" },
      { id: "cellular", label: "GPS + Cellular", priceDelta: 13000, note: "Calls and data without your phone" },
    ],
    highlights: [
      { title: "Hypertension notifications", copy: "Watch can notify you of consistent signs of high blood pressure over 30 days." },
      { title: "Sleep score", copy: "A single number each morning, built from duration, consistency and interruptions." },
      { title: "24-hour battery", copy: "A full day and a night of sleep tracking, with fast charge in the morning." },
      { title: "5G and Ion-X", copy: "Faster cellular, and the most scratch-resistant front crystal on an aluminium Watch." },
    ],
    specs: [
      { group: "Display", rows: [
        { k: "Type", v: "Always-On Retina LTPO3 OLED" },
        { k: "Brightness", v: "Up to 2000 nits, 1 nit minimum" },
        { k: "Sizes", v: "42 mm and 46 mm cases" },
      ]},
      { group: "Health sensors", rows: [
        { k: "Heart", v: "Third-generation optical heart sensor, ECG, irregular rhythm notifications" },
        { k: "Blood oxygen", v: "Blood Oxygen app" },
        { k: "Temperature", v: "Wrist temperature sensing" },
        { k: "Safety", v: "Crash Detection, Fall Detection, Emergency SOS" },
      ]},
      { group: "Power & build", rows: [
        { k: "Battery", v: "Up to 24 hours normal use, up to 38 hours in Low Power Mode" },
        { k: "Charging", v: "0 to 80% in about 30 minutes" },
        { k: "Water resistance", v: "50 m, swimproof" },
        { k: "Case", v: "100% recycled aluminium" },
      ]},
    ],
    inBox: ["Apple Watch Series 12", "Band (size of your choice)", "Magnetic Fast Charger to USB-C Cable"],
    stock: "in",
    rank: 91,
    tags: ["fitness", "health", "new", "everyday"],
    leadTimeDays: 1,
    careAnnual: 6900,
    tradeIn: true,
  },
  {
    slug: "apple-watch-ultra-4",
    name: "Apple Watch Ultra 4",
    family: "Apple Watch Ultra",
    category: "watch",
    tagline: "Satellite messaging, the biggest display, and the longest battery life of any Apple Watch.",
    eyebrow: "New",
    basePrice: 109900,
    art: "watch-rugged",
    colors: [
      { id: "natural", name: "Natural Titanium", hex: "#c9c3ba", accent: "#3a3a3c", screen: "#08080a" },
      { id: "black", name: "Black Titanium", hex: "#3c3b39", accent: "#1f1f21", screen: "#08080a" },
    ],
    sizes: { title: "Case size", options: [{ id: "49mm", label: "49 mm", priceDelta: 0, note: "Titanium case" }] },
    storageTitle: "Connectivity",
    storage: [{ id: "cellular", label: "GPS + Cellular", priceDelta: 0, note: "Included on every Ultra" }],
    highlights: [
      { title: "Satellite messaging", copy: "Send a message when you are far outside cellular coverage." },
      { title: "Multi-day battery", copy: "Enough for a whole weekend, and longer again in Low Power Mode." },
      { title: "Brightest, biggest display", copy: "3000 nits, wide-angle OLED, readable in direct sun." },
      { title: "Built for depth and altitude", copy: "100 m water resistance, EN13319 dive certification, and a depth gauge." },
    ],
    specs: [
      { group: "Display", rows: [
        { k: "Type", v: "Always-On Retina LTPO3 OLED, wide-angle" },
        { k: "Brightness", v: "Up to 3000 nits" },
        { k: "Crystal", v: "Flat sapphire" },
      ]},
      { group: "Durability", rows: [
        { k: "Case", v: "49 mm aerospace-grade titanium" },
        { k: "Water resistance", v: "100 m, WR100, EN13319" },
        { k: "Dust", v: "IP6X" },
        { k: "Operating range", v: "-20°C to 55°C" },
      ]},
      { group: "Power & connectivity", rows: [
        { k: "Battery", v: "Up to 42 hours, up to 72 hours in Low Power Mode" },
        { k: "Cellular", v: "5G, plus satellite for messages and Find My" },
        { k: "Navigation", v: "Precision dual-frequency GPS" },
        { k: "Extras", v: "86 dB siren, Action button, depth gauge, water temperature sensor" },
      ]},
    ],
    inBox: ["Apple Watch Ultra 4", "Band (size of your choice)", "Magnetic Fast Charger to USB-C Cable"],
    stock: "low",
    rank: 83,
    tags: ["adventure", "diving", "titanium", "battery", "satellite"],
    leadTimeDays: 4,
    careAnnual: 11900,
    tradeIn: true,
  },
  {
    slug: "apple-watch-se-3",
    name: "Apple Watch SE 3",
    family: "Apple Watch SE",
    category: "watch",
    tagline: "The essentials done properly, at the friendliest price.",
    basePrice: 29900,
    art: "watch",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#2f343c", accent: "#454b55", screen: "#08080a" },
      { id: "starlight", name: "Starlight", hex: "#e5ddd0", accent: "#cbc2b4", screen: "#08080a" },
    ],
    sizes: {
      title: "Case size",
      options: [
        { id: "40mm", label: "40 mm", priceDelta: 0 },
        { id: "44mm", label: "44 mm", priceDelta: 4000 },
      ],
    },
    storageTitle: "Connectivity",
    storage: [
      { id: "gps", label: "GPS", priceDelta: 0 },
      { id: "cellular", label: "GPS + Cellular", priceDelta: 8000 },
    ],
    highlights: [
      { title: "Always-On display", copy: "A first for Apple Watch SE — glance without lifting your wrist." },
      { title: "Crash and Fall Detection", copy: "The safety features that matter, included." },
      { title: "Sleep score and wrist temperature", copy: "Real health tracking, not a step counter." },
      { title: "Fast charging", copy: "0 to 80% in about 45 minutes." },
    ],
    specs: [
      { group: "Display", rows: [{ k: "Type", v: "Always-On Retina LTPO OLED" }, { k: "Sizes", v: "40 mm and 44 mm" }] },
      { group: "Health", rows: [
        { k: "Heart", v: "Optical heart sensor, high and low heart rate notifications" },
        { k: "Safety", v: "Crash Detection, Fall Detection, Emergency SOS" },
      ]},
      { group: "Power", rows: [{ k: "Battery", v: "Up to 18 hours" }, { k: "Water resistance", v: "50 m" }] },
    ],
    inBox: ["Apple Watch SE 3", "Band (size of your choice)", "Magnetic Fast Charger to USB-C Cable"],
    stock: "in",
    rank: 75,
    tags: ["affordable", "first watch", "kids", "family setup"],
    leadTimeDays: 1,
    careAnnual: 3900,
    tradeIn: true,
  },
];
