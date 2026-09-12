/* AirPods & audio — reconciled against apple.com/in on 12 September 2026.
   Apple India's AirPods line-up is now AirPods 5, AirPods Pro 3 and
   AirPods Max 2. AirPods 4 (both variants) were replaced by AirPods 5 on
   9 Sept 2026. Prices are Apple India retail MRP, inclusive of all taxes. */
import type { Product } from "@/lib/types";
import { AUDIO_WHITE } from "../palettes";

export const AUDIO: Product[] = [
  {
    slug: "airpods-pro-3",
    name: "AirPods Pro 3",
    family: "AirPods Pro",
    category: "audio",
    tagline: "The world's best in-ear Active Noise Cancellation, with a heart rate sensor.",
    eyebrow: "New",
    basePrice: 27900,
    art: "buds",
    colors: AUDIO_WHITE,
    highlights: [
      { title: "Twice the noise cancellation", copy: "Up to 2x more ANC than AirPods Pro 2, with foam-infused tips for a better seal." },
      { title: "Heart rate sensing", copy: "Track workouts from your ears, with over 50 supported workout types." },
      { title: "Live Translation", copy: "Hear a translation of what someone is saying, in the moment." },
      { title: "8 hours of listening", copy: "Up to 8 hours with ANC on, and IP57 sweat and water resistance." },
    ],
    specs: [
      { group: "Audio", rows: [
        { k: "Noise control", v: "Active Noise Cancellation, Adaptive Audio, Transparency" },
        { k: "Spatial Audio", v: "Personalised Spatial Audio with dynamic head tracking" },
        { k: "Chip", v: "Apple H2" },
        { k: "Hearing", v: "Hearing Test, Hearing Aid and Hearing Protection features" },
      ]},
      { group: "Battery", rows: [
        { k: "Listening", v: "Up to 8 hours with ANC (10 hours in Transparency)" },
        { k: "With case", v: "Up to 24 hours total" },
        { k: "Charging", v: "USB-C, MagSafe, Qi wireless, Apple Watch charger" },
      ]},
      { group: "Fit & durability", rows: [
        { k: "Ear tips", v: "Five sizes, foam-infused (XXS, XS, S, M, L)" },
        { k: "Resistance", v: "IP57 dust, sweat and water resistant (buds and case)" },
      ]},
    ],
    inBox: ["AirPods Pro 3", "MagSafe Charging Case (USB-C)", "Ear tips in five sizes", "USB-C Charge Cable"],
    stock: "in",
    rank: 93,
    tags: ["anc", "in-ear", "workout", "heart rate", "popular"],
    leadTimeDays: 1,
    careAnnual: 2900,
    tradeIn: false,
  },
  {
    slug: "airpods-5",
    name: "AirPods 5",
    family: "AirPods",
    category: "audio",
    tagline: "Active Noise Cancellation in Apple's open-ear design, with Live Translation built in.",
    eyebrow: "New",
    basePrice: 14900,
    art: "buds",
    colors: AUDIO_WHITE,
    storageTitle: "Charging case",
    storage: [
      { id: "standard", label: "Charging Case", priceDelta: 0 },
      {
        id: "wireless",
        label: "Wireless Charging Case",
        priceDelta: 3000,
        note: "Adds a force sensor with volume swipe, and longer battery life",
      },
    ],
    highlights: [
      { title: "ANC in an open fit", copy: "Noise cancellation without an in-ear seal — now 50% stronger than the generation before." },
      { title: "Redesigned acoustics", copy: "A new acoustic architecture, shaped from thousands of ear scans, that simply stays put." },
      { title: "Live Translation", copy: "Hear a translation of what someone is saying, in the moment, hands free." },
      { title: "Hands-free Siri", copy: "Apple Intelligence features you can use without reaching for your iPhone." },
    ],
    specs: [
      { group: "Audio", rows: [
        { k: "Noise control", v: "Active Noise Cancellation, Adaptive Audio, Transparency" },
        { k: "Fit", v: "Open ear, no tips" },
        { k: "Spatial Audio", v: "Personalised with head tracking" },
      ]},
      { group: "Features", rows: [
        { k: "Live Translation", v: "Supported, with Apple Intelligence" },
        { k: "Siri", v: "Hands-free interactions" },
        { k: "Find My", v: "Case with speaker and Precision Finding" },
      ]},
      { group: "Charging", rows: [
        { k: "Standard case", v: "USB-C" },
        { k: "Wireless Charging Case", v: "USB-C and wireless, with a force sensor for volume swipe" },
      ]},
    ],
    inBox: ["AirPods 5", "Charging Case (USB-C)", "USB-C Charge Cable"],
    stock: "in",
    rank: 77,
    tags: ["open fit", "anc", "new", "live translation", "gift"],
    leadTimeDays: 1,
    careAnnual: 2400,
    tradeIn: false,
  },
  {
    slug: "airpods-max-2",
    name: "AirPods Max 2",
    family: "AirPods Max",
    category: "audio",
    tagline: "Over-ear. Uncompromising. Now with USB-C and lossless audio.",
    basePrice: 74900,
    art: "headphones",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#3a3b40", accent: "#2a2b2f", screen: "#3a3b40" },
      { id: "starlight", name: "Starlight", hex: "#e9e2d6", accent: "#cdc6ba", screen: "#e9e2d6" },
      { id: "blue", name: "Blue", hex: "#8fa4c4", accent: "#7489a8", screen: "#8fa4c4" },
      { id: "purple", name: "Purple", hex: "#a89ec4", accent: "#8d83a8", screen: "#a89ec4" },
      { id: "orange", name: "Orange", hex: "#d98a5e", accent: "#bd7048", screen: "#d98a5e" },
    ],
    highlights: [
      { title: "Lossless and ultra-low latency", copy: "Over USB-C, with 24-bit / 48kHz lossless audio." },
      { title: "Computational audio", copy: "An H1 chip in each cup, running Adaptive EQ in real time." },
      { title: "Memory foam and mesh", copy: "A canopy that spreads the weight, for hours at a time." },
      { title: "Up to 20 hours", copy: "With ANC and Spatial Audio switched on." },
    ],
    specs: [
      { group: "Audio", rows: [
        { k: "Driver", v: "Apple-designed 40 mm dynamic driver" },
        { k: "Chip", v: "Apple H1 in each ear cup" },
        { k: "Noise control", v: "Active Noise Cancellation and Transparency mode" },
        { k: "Lossless", v: "24-bit / 48 kHz over USB-C" },
      ]},
      { group: "Build", rows: [
        { k: "Frame", v: "Stainless steel, breathable knit mesh canopy" },
        { k: "Controls", v: "Digital Crown and noise control button" },
        { k: "Weight", v: "384.8 g" },
      ]},
      { group: "Battery", rows: [{ k: "Listening", v: "Up to 20 hours" }, { k: "Charging", v: "USB-C" }] },
    ],
    inBox: ["AirPods Max 2", "Smart Case", "USB-C Charge Cable (1 m)"],
    stock: "low",
    rank: 68,
    tags: ["over ear", "audiophile", "lossless", "premium"],
    leadTimeDays: 4,
    careAnnual: 5900,
    tradeIn: false,
  },
];
