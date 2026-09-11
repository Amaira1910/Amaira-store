/* ==========================================================================
   iPhone
   ⚠️  VERIFY BEFORE GO-LIVE: model names, prices and specs below are set from
   the line-up and Indian MRPs current at the time of build. Reconcile every
   figure against your live Apple Premium Reseller price list — this file is
   the single place to edit them.
   ========================================================================== */
import type { Product } from "@/lib/types";
import { TITANIUM, ALUMINIUM_BRIGHT } from "../palettes";

export const IPHONES: Product[] = [
  {
    slug: "iphone-17-pro-max",
    name: "iPhone 17 Pro Max",
    family: "iPhone 17 Pro",
    category: "iphone",
    tagline: "The biggest Pro display and the longest battery life ever in an iPhone.",
    eyebrow: "New",
    basePrice: 149900,
    art: "phone-pro",
    colors: TITANIUM,
    storage: [
      { id: "256gb", label: "256GB", priceDelta: 0 },
      { id: "512gb", label: "512GB", priceDelta: 20000 },
      { id: "1tb", label: "1TB", priceDelta: 40000 },
      { id: "2tb", label: "2TB", priceDelta: 60000 },
    ],
    highlights: [
      { title: "6.9-inch Super Retina XDR", copy: "ProMotion up to 120Hz with an always-on display, and 2000 nits of peak outdoor brightness." },
      { title: "Pro camera system", copy: "48MP Fusion main, 48MP Ultra Wide and a 48MP telephoto with 4x optical-quality zoom." },
      { title: "A19 Pro chip", copy: "A 6-core GPU with hardware ray tracing, built for console-class games and on-device intelligence." },
      { title: "All-day and then some", copy: "The longest battery life of any iPhone, with fast charge to 50% in around 20 minutes." },
    ],
    specs: [
      {
        group: "Display",
        rows: [
          { k: "Size", v: "6.9-inch (diagonal) all-screen OLED" },
          { k: "Resolution", v: "2868 × 1320 at 460 ppi" },
          { k: "Technology", v: "Super Retina XDR with ProMotion and always-on" },
          { k: "Brightness", v: "1000 nits typical, 2000 nits peak outdoors, 1 nit minimum" },
          { k: "Protection", v: "Ceramic Shield 2 front" },
        ],
      },
      {
        group: "Chip & capacity",
        rows: [
          { k: "Chip", v: "A19 Pro with 6-core CPU and 6-core GPU" },
          { k: "Neural Engine", v: "16-core" },
          { k: "Capacity", v: "256GB, 512GB, 1TB, 2TB" },
        ],
      },
      {
        group: "Camera",
        rows: [
          { k: "Main", v: "48MP Fusion, ƒ/1.78, second-generation sensor-shift OIS" },
          { k: "Ultra Wide", v: "48MP, ƒ/2.2, 120° field of view, macro" },
          { k: "Telephoto", v: "48MP, ƒ/2.8, 4x optical zoom, up to 8x optical-quality" },
          { k: "Front", v: "18MP Center Stage camera, ƒ/1.9, autofocus" },
          { k: "Video", v: "4K Dolby Vision up to 120 fps, ProRes RAW, Action mode" },
        ],
      },
      {
        group: "Power & connections",
        rows: [
          { k: "Video playback", v: "Up to 39 hours" },
          { k: "Charging", v: "USB-C, MagSafe up to 25W, Qi2" },
          { k: "Cellular", v: "5G (sub-6 GHz), dual eSIM" },
          { k: "Wireless", v: "Wi-Fi 7, Bluetooth 6, Thread, second-gen Ultra Wideband" },
          { k: "Water resistance", v: "IP68 to 6 metres for up to 30 minutes" },
        ],
      },
      {
        group: "In the box & build",
        rows: [
          { k: "Material", v: "Grade 5 titanium with a unibody aluminium frame" },
          { k: "Dimensions", v: "163.4 × 78.0 × 8.75 mm" },
          { k: "Weight", v: "233 g" },
          { k: "Warranty", v: "1 year Apple limited warranty, serviceable at Amaira" },
        ],
      },
    ],
    inBox: ["iPhone 17 Pro Max", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "in",
    rank: 100,
    tags: ["pro", "flagship", "titanium", "120hz", "best camera", "large screen"],
    leadTimeDays: 1,
    careAnnual: 12900,
    tradeIn: true,
  },
  {
    slug: "iphone-17-pro",
    name: "iPhone 17 Pro",
    family: "iPhone 17 Pro",
    category: "iphone",
    tagline: "All the Pro capability, in the size that disappears into a pocket.",
    eyebrow: "New",
    basePrice: 134900,
    art: "phone-pro",
    colors: TITANIUM,
    storage: [
      { id: "256gb", label: "256GB", priceDelta: 0 },
      { id: "512gb", label: "512GB", priceDelta: 20000 },
      { id: "1tb", label: "1TB", priceDelta: 40000 },
    ],
    highlights: [
      { title: "6.3-inch Super Retina XDR", copy: "ProMotion up to 120Hz with an always-on display in a body you can use one-handed." },
      { title: "Pro camera system", copy: "Three 48MP cameras with 4x optical-quality telephoto and ProRes RAW capture." },
      { title: "A19 Pro chip", copy: "Desktop-class performance per watt, with hardware-accelerated ray tracing." },
      { title: "Titanium build", copy: "Grade 5 titanium — light in the hand, hard to mark." },
    ],
    specs: [
      {
        group: "Display",
        rows: [
          { k: "Size", v: "6.3-inch (diagonal) all-screen OLED" },
          { k: "Resolution", v: "2622 × 1206 at 460 ppi" },
          { k: "Technology", v: "Super Retina XDR with ProMotion and always-on" },
          { k: "Brightness", v: "1000 nits typical, 2000 nits peak outdoors" },
        ],
      },
      {
        group: "Chip & capacity",
        rows: [
          { k: "Chip", v: "A19 Pro with 6-core CPU and 6-core GPU" },
          { k: "Capacity", v: "256GB, 512GB, 1TB" },
        ],
      },
      {
        group: "Camera",
        rows: [
          { k: "Main", v: "48MP Fusion, ƒ/1.78, sensor-shift OIS" },
          { k: "Ultra Wide", v: "48MP, ƒ/2.2, macro" },
          { k: "Telephoto", v: "48MP, ƒ/2.8, 4x optical zoom" },
          { k: "Front", v: "18MP Center Stage camera" },
        ],
      },
      {
        group: "Power & connections",
        rows: [
          { k: "Video playback", v: "Up to 31 hours" },
          { k: "Charging", v: "USB-C, MagSafe up to 25W, Qi2" },
          { k: "Wireless", v: "Wi-Fi 7, Bluetooth 6, Thread" },
          { k: "Water resistance", v: "IP68 to 6 metres for up to 30 minutes" },
        ],
      },
      {
        group: "Build",
        rows: [
          { k: "Material", v: "Grade 5 titanium" },
          { k: "Dimensions", v: "149.6 × 71.5 × 8.75 mm" },
          { k: "Weight", v: "204 g" },
        ],
      },
    ],
    inBox: ["iPhone 17 Pro", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "in",
    rank: 98,
    tags: ["pro", "titanium", "120hz", "compact", "best camera"],
    leadTimeDays: 1,
    careAnnual: 11900,
    tradeIn: true,
  },
  {
    slug: "iphone-air",
    name: "iPhone Air",
    family: "iPhone Air",
    category: "iphone",
    tagline: "The thinnest iPhone ever made. You feel it the moment you pick it up.",
    eyebrow: "New",
    basePrice: 119900,
    art: "phone",
    colors: [
      { id: "sky-blue", name: "Sky Blue", hex: "#b9c9d9", accent: "#98adc1", screen: "#161b22" },
      { id: "light-gold", name: "Light Gold", hex: "#e4d4bb", accent: "#c9b79b", screen: "#161b22" },
      { id: "cloud-white", name: "Cloud White", hex: "#f1f0ec", accent: "#d5d3cd", screen: "#161b22" },
      { id: "space-black", name: "Space Black", hex: "#33333a", accent: "#212128", screen: "#0c0c0f" },
    ],
    storage: [
      { id: "256gb", label: "256GB", priceDelta: 0 },
      { id: "512gb", label: "512GB", priceDelta: 20000 },
      { id: "1tb", label: "1TB", priceDelta: 40000 },
    ],
    highlights: [
      { title: "5.6 mm thin", copy: "A titanium frame engineered to be astonishingly thin without giving up rigidity." },
      { title: "6.5-inch ProMotion display", copy: "Super Retina XDR with always-on, up to 120Hz." },
      { title: "A19 Pro chip", copy: "Flagship silicon in the lightest body Apple has shipped." },
      { title: "48MP Fusion camera", copy: "One camera that covers 1x and 2x at full quality." },
    ],
    specs: [
      {
        group: "Display",
        rows: [
          { k: "Size", v: "6.5-inch (diagonal) all-screen OLED" },
          { k: "Technology", v: "Super Retina XDR with ProMotion and always-on" },
          { k: "Brightness", v: "Up to 2000 nits peak outdoors" },
        ],
      },
      {
        group: "Chip & capacity",
        rows: [
          { k: "Chip", v: "A19 Pro" },
          { k: "Capacity", v: "256GB, 512GB, 1TB" },
        ],
      },
      {
        group: "Camera",
        rows: [
          { k: "Rear", v: "48MP Fusion, ƒ/1.6, 2x optical-quality telephoto" },
          { k: "Front", v: "18MP Center Stage camera" },
        ],
      },
      {
        group: "Build & power",
        rows: [
          { k: "Thickness", v: "5.6 mm" },
          { k: "Weight", v: "165 g" },
          { k: "Material", v: "Grade 5 titanium" },
          { k: "Video playback", v: "Up to 27 hours" },
          { k: "Connectivity", v: "USB-C, MagSafe, eSIM only" },
        ],
      },
    ],
    inBox: ["iPhone Air", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "low",
    rank: 96,
    tags: ["thin", "light", "titanium", "esim", "new"],
    leadTimeDays: 3,
    careAnnual: 11900,
    tradeIn: true,
  },
  {
    slug: "iphone-17",
    name: "iPhone 17",
    family: "iPhone 17",
    category: "iphone",
    tagline: "ProMotion, a bigger display and a 48MP Dual Fusion camera. Now standard.",
    eyebrow: "New",
    basePrice: 82900,
    art: "phone",
    colors: [
      { id: "lavender", name: "Lavender", hex: "#cfc4e4", accent: "#b3a5cd", screen: "#1e1b2b" },
      { id: "mist-blue", name: "Mist Blue", hex: "#b8cbd8", accent: "#9ab0c0", screen: "#141b22" },
      { id: "sage", name: "Sage", hex: "#c3cfba", accent: "#a5b39b", screen: "#171d15" },
      { id: "white", name: "White", hex: "#f2f1ee", accent: "#d6d4cf", screen: "#2c2c2e" },
      { id: "black", name: "Black", hex: "#34333a", accent: "#222128", screen: "#0d0d10" },
    ],
    storage: [
      { id: "256gb", label: "256GB", priceDelta: 0 },
      { id: "512gb", label: "512GB", priceDelta: 20000 },
    ],
    highlights: [
      { title: "6.3-inch ProMotion display", copy: "120Hz and always-on come to the standard iPhone for the first time." },
      { title: "Dual Fusion camera", copy: "48MP main and 48MP Ultra Wide, with a 2x optical-quality zoom." },
      { title: "A19 chip", copy: "Fast, efficient, and ready for everything on-device intelligence asks of it." },
      { title: "Ceramic Shield 2", copy: "Three times better scratch resistance on the front." },
    ],
    specs: [
      {
        group: "Display",
        rows: [
          { k: "Size", v: "6.3-inch (diagonal) all-screen OLED" },
          { k: "Technology", v: "Super Retina XDR with ProMotion and always-on" },
          { k: "Brightness", v: "Up to 3000 nits peak outdoors" },
        ],
      },
      {
        group: "Chip & capacity",
        rows: [
          { k: "Chip", v: "A19" },
          { k: "Capacity", v: "256GB, 512GB" },
        ],
      },
      {
        group: "Camera",
        rows: [
          { k: "Main", v: "48MP Fusion, ƒ/1.6" },
          { k: "Ultra Wide", v: "48MP, ƒ/2.2, macro" },
          { k: "Front", v: "18MP Center Stage camera" },
        ],
      },
      {
        group: "Power & build",
        rows: [
          { k: "Video playback", v: "Up to 30 hours" },
          { k: "Charging", v: "USB-C, MagSafe, Qi2" },
          { k: "Water resistance", v: "IP68" },
          { k: "Weight", v: "177 g" },
        ],
      },
    ],
    inBox: ["iPhone 17", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "in",
    rank: 94,
    tags: ["mainstream", "120hz", "value", "new"],
    leadTimeDays: 1,
    careAnnual: 9900,
    tradeIn: true,
  },
  {
    slug: "iphone-16",
    name: "iPhone 16",
    family: "iPhone 16",
    category: "iphone",
    tagline: "Camera Control, the A18 chip and a great price. Still a brilliant buy.",
    basePrice: 69900,
    mrp: 79900,
    art: "phone",
    colors: ALUMINIUM_BRIGHT,
    storage: [
      { id: "128gb", label: "128GB", priceDelta: 0 },
      { id: "256gb", label: "256GB", priceDelta: 10000 },
      { id: "512gb", label: "512GB", priceDelta: 30000 },
    ],
    highlights: [
      { title: "Camera Control", copy: "A dedicated control for framing, zoom and depth — press, slide, shoot." },
      { title: "A18 chip", copy: "Built for Apple Intelligence, with a 5-core GPU." },
      { title: "48MP Fusion camera", copy: "Plus a 2x optical-quality telephoto and a macro-capable Ultra Wide." },
      { title: "Action button", copy: "Map it to the camera, torch, a shortcut, or silent mode." },
    ],
    specs: [
      {
        group: "Display",
        rows: [
          { k: "Size", v: "6.1-inch (diagonal) all-screen OLED" },
          { k: "Technology", v: "Super Retina XDR" },
          { k: "Brightness", v: "Up to 2000 nits peak outdoors" },
        ],
      },
      { group: "Chip & capacity", rows: [{ k: "Chip", v: "A18" }, { k: "Capacity", v: "128GB, 256GB, 512GB" }] },
      {
        group: "Camera",
        rows: [
          { k: "Main", v: "48MP Fusion, ƒ/1.6" },
          { k: "Ultra Wide", v: "12MP, ƒ/2.2, macro" },
          { k: "Front", v: "12MP TrueDepth" },
        ],
      },
      { group: "Power", rows: [{ k: "Video playback", v: "Up to 22 hours" }, { k: "Charging", v: "USB-C, MagSafe, Qi2" }] },
    ],
    inBox: ["iPhone 16", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "in",
    rank: 88,
    tags: ["value", "camera control", "a18", "offer"],
    leadTimeDays: 1,
    careAnnual: 9900,
    tradeIn: true,
  },
  {
    slug: "iphone-16e",
    name: "iPhone 16e",
    family: "iPhone 16e",
    category: "iphone",
    tagline: "The most affordable way into Apple Intelligence.",
    basePrice: 59900,
    art: "phone",
    colors: [
      { id: "white", name: "White", hex: "#f3f2ef", accent: "#d8d6d1", screen: "#2c2c2e" },
      { id: "black", name: "Black", hex: "#2f2f33", accent: "#1f1f23", screen: "#0c0c0e" },
    ],
    storage: [
      { id: "128gb", label: "128GB", priceDelta: 0 },
      { id: "256gb", label: "256GB", priceDelta: 8000 },
      { id: "512gb", label: "512GB", priceDelta: 28000 },
    ],
    highlights: [
      { title: "A18 chip", copy: "The same generation of silicon as iPhone 16, built for Apple Intelligence." },
      { title: "2-in-1 camera", copy: "A 48MP Fusion camera with a built-in 2x telephoto." },
      { title: "Best-in-class battery", copy: "Up to 26 hours of video playback." },
      { title: "Apple C1 modem", copy: "Apple's first in-house cellular modem, tuned for efficiency." },
    ],
    specs: [
      { group: "Display", rows: [{ k: "Size", v: "6.1-inch Super Retina XDR" }, { k: "Brightness", v: "Up to 1200 nits peak (HDR)" }] },
      { group: "Chip & capacity", rows: [{ k: "Chip", v: "A18 with 4-core GPU" }, { k: "Capacity", v: "128GB, 256GB, 512GB" }] },
      { group: "Camera", rows: [{ k: "Rear", v: "48MP Fusion, ƒ/1.6, 2x telephoto" }, { k: "Front", v: "12MP TrueDepth" }] },
      { group: "Power", rows: [{ k: "Video playback", v: "Up to 26 hours" }, { k: "Charging", v: "USB-C, Qi2 wireless" }] },
    ],
    inBox: ["iPhone 16e", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "in",
    rank: 80,
    tags: ["affordable", "entry", "a18", "battery"],
    leadTimeDays: 1,
    careAnnual: 7900,
    tradeIn: true,
  },
];
