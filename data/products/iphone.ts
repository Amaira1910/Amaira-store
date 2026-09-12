/* ==========================================================================
   iPhone — reconciled against apple.com/in on 12 September 2026.

   Line-up as Apple India lists it today: iPhone Duo, iPhone 18 Pro Max,
   iPhone 18 Pro, iPhone Air, iPhone 17, iPhone 17e, iPhone 16.

   iPhone 17 Pro and iPhone 17 Pro Max were withdrawn when the 18 Pro models
   launched (9 Sept 2026) and are gone from Apple's store — they are not in
   this file. iPhone 16e was replaced by iPhone 17e.

   Every basePrice below is the Apple India retail MRP (inclusive of all
   taxes) read off apple.com/in/shop/buy-iphone. The storage priceDeltas are
   derived from Apple's own per-SKU MRPs, so basePrice + delta equals the
   listed price for that capacity.

   ⚠️  Apple India repriced the whole carried-over line-up on 9–10 Sept 2026
   (iPhone 17 ₹82,900 → ₹99,900, iPhone Air ₹1,19,900 → ₹1,49,900, iPhone 16
   ₹69,900 → ₹89,900). Reconcile against your own APR price list before
   go-live — reseller landed cost can differ from Apple retail MRP, and this
   file is the single place to edit it. Note that seedCatalog() never
   overwrites a price that is already in the database: change live prices in
   /admin/inventory, not here.
   ========================================================================== */
import type { Product } from "@/lib/types";
import { PRO_18_FINISHES, DUO_FINISHES, E_FINISHES, ALUMINIUM_BRIGHT } from "../palettes";

export const IPHONES: Product[] = [
  {
    slug: "iphone-duo",
    name: "iPhone Duo",
    family: "iPhone Duo",
    category: "iphone",
    tagline: "It opens. A 5.4-inch iPhone becomes a 7.6-inch one, and nothing about it feels like a compromise.",
    eyebrow: "New",
    basePrice: 299900,
    art: "phone-fold",
    colors: DUO_FINISHES,
    storage: [
      { id: "256gb", label: "256GB", priceDelta: 0 },
      { id: "512gb", label: "512GB", priceDelta: 25000 },
      { id: "1tb", label: "1TB", priceDelta: 75000 },
      { id: "2tb", label: "2TB", priceDelta: 150000 },
    ],
    highlights: [
      { title: "Two displays, one iPhone", copy: "A 5.4-inch cover display for one-handed everything, and a 7.6-inch inner display when you want the room." },
      { title: "5.2 mm unfolded", copy: "The thinnest iPhone Apple has made — thinner open than iPhone Air is closed." },
      { title: "A20 Pro on 2 nm", copy: "The first 2-nanometre chip in an iPhone, with headroom for two full-size apps side by side." },
      { title: "Dual-battery system", copy: "One cell in each half, charged and managed as one, so a folding phone lasts a folding-phone day." },
    ],
    specs: [
      {
        group: "Displays",
        rows: [
          { k: "Inner", v: "7.6-inch (diagonal) foldable Super Retina XDR OLED" },
          { k: "Cover", v: "5.4-inch (diagonal) Super Retina XDR OLED" },
          { k: "Technology", v: "ProMotion up to 120Hz and always-on, both displays" },
          { k: "Brightness", v: "Up to 3000 nits peak outdoors" },
          { k: "Protection", v: "Ceramic Shield 2 on the cover display" },
        ],
      },
      {
        group: "Chip & capacity",
        rows: [
          { k: "Chip", v: "A20 Pro, built on a 2 nm process" },
          { k: "Capacity", v: "256GB, 512GB, 1TB, 2TB" },
        ],
      },
      {
        group: "Camera",
        rows: [
          { k: "Main", v: "48MP Dual Fusion, sensor-shift OIS" },
          { k: "Ultra Wide", v: "48MP, 120° field of view, macro" },
          { k: "Front", v: "Under-display camera on the inner display, plus a cover-display camera" },
          { k: "Selfie", v: "Shoot with the rear camera using the cover display as a viewfinder" },
        ],
      },
      {
        group: "Build & power",
        rows: [
          { k: "Thickness", v: "5.2 mm unfolded" },
          { k: "Hinge", v: "Precision-machined, tested to Apple's fold-cycle standard" },
          { k: "Charging", v: "USB-C, MagSafe, Qi2" },
          { k: "Cellular", v: "5G, eSIM only" },
          { k: "Warranty", v: "1 year Apple limited warranty, serviceable at Amaira" },
        ],
      },
    ],
    inBox: ["iPhone Duo", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "order",
    rank: 110,
    tags: ["foldable", "fold", "duo", "flagship", "new", "two screens", "a20 pro"],
    leadTimeDays: 14,
    careAnnual: 24900,
    tradeIn: true,
  },
  {
    slug: "iphone-18-pro-max",
    name: "iPhone 18 Pro Max",
    family: "iPhone 18 Pro",
    category: "iphone",
    tagline: "The biggest Pro display, a variable-aperture camera, and the longest battery life ever in an iPhone.",
    eyebrow: "New",
    basePrice: 179900,
    art: "phone-pro",
    colors: PRO_18_FINISHES,
    storage: [
      { id: "256gb", label: "256GB", priceDelta: 0 },
      { id: "512gb", label: "512GB", priceDelta: 25000 },
      { id: "1tb", label: "1TB", priceDelta: 75000 },
      { id: "2tb", label: "2TB", priceDelta: 150000 },
    ],
    highlights: [
      { title: "6.9-inch Super Retina XDR", copy: "ProMotion up to 120Hz with an always-on display, and peak outdoor brightness you can read in Bengaluru sun." },
      { title: "Variable aperture", copy: "The 48MP main camera opens and closes its aperture — real depth-of-field control, not a simulation." },
      { title: "A20 Pro on 2 nm", copy: "Apple's first 2-nanometre chip, with a neural accelerator in every GPU core." },
      { title: "Up to 45 hours of video", copy: "A next-generation vapour chamber keeps it fast for longer, and the battery outlasts any iPhone before it." },
    ],
    specs: [
      {
        group: "Display",
        rows: [
          { k: "Size", v: "6.9-inch (diagonal) all-screen OLED" },
          { k: "Technology", v: "Super Retina XDR with ProMotion and always-on" },
          { k: "Brightness", v: "Up to 3000 nits peak outdoors, 1 nit minimum" },
          { k: "Protection", v: "Ceramic Shield 2 front" },
        ],
      },
      {
        group: "Chip & capacity",
        rows: [
          { k: "Chip", v: "A20 Pro, built on a 2 nm process" },
          { k: "Capacity", v: "256GB, 512GB, 1TB, 2TB" },
        ],
      },
      {
        group: "Camera",
        rows: [
          { k: "Main", v: "48MP Fusion with variable aperture, sensor-shift OIS" },
          { k: "Ultra Wide", v: "48MP, 120° field of view, macro" },
          { k: "Telephoto", v: "48MP with optical-quality zoom" },
          { k: "Front", v: "Centre Stage camera with autofocus" },
          { k: "Video", v: "4K Dolby Vision, ProRes RAW, Action mode" },
        ],
      },
      {
        group: "Build & power",
        rows: [
          { k: "Cooling", v: "Next-generation vapour chamber" },
          { k: "Video playback", v: "Up to 45 hours" },
          { k: "Charging", v: "USB-C, MagSafe, Qi2" },
          { k: "Water resistance", v: "IP68" },
          { k: "Warranty", v: "1 year Apple limited warranty, serviceable at Amaira" },
        ],
      },
    ],
    inBox: ["iPhone 18 Pro Max", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "in",
    rank: 100,
    tags: ["pro", "flagship", "120hz", "best camera", "large screen", "variable aperture", "a20 pro"],
    leadTimeDays: 1,
    careAnnual: 15900,
    tradeIn: true,
  },
  {
    slug: "iphone-18-pro",
    name: "iPhone 18 Pro",
    family: "iPhone 18 Pro",
    category: "iphone",
    tagline: "All the Pro capability, in the size that disappears into a pocket.",
    eyebrow: "New",
    basePrice: 164900,
    art: "phone-pro",
    colors: PRO_18_FINISHES,
    storage: [
      { id: "256gb", label: "256GB", priceDelta: 0 },
      { id: "512gb", label: "512GB", priceDelta: 25000 },
      { id: "1tb", label: "1TB", priceDelta: 75000 },
      { id: "2tb", label: "2TB", priceDelta: 150000 },
    ],
    highlights: [
      { title: "6.3-inch Super Retina XDR", copy: "The same ProMotion and always-on display, in a body you can use one-handed." },
      { title: "Variable aperture", copy: "A 48MP main camera that physically stops down, for control over depth of field." },
      { title: "A20 Pro on 2 nm", copy: "Identical silicon to the Pro Max — no compromise for choosing the smaller one." },
      { title: "Big leap in battery", copy: "A next-generation vapour chamber and up to 24 hours of video playback." },
    ],
    specs: [
      {
        group: "Display",
        rows: [
          { k: "Size", v: "6.3-inch (diagonal) all-screen OLED" },
          { k: "Resolution", v: "2622 × 1206 at 460 ppi" },
          { k: "Technology", v: "Super Retina XDR with ProMotion and always-on" },
          { k: "Protection", v: "Ceramic Shield 2 front" },
        ],
      },
      {
        group: "Chip & capacity",
        rows: [
          { k: "Chip", v: "A20 Pro, built on a 2 nm process" },
          { k: "Capacity", v: "256GB, 512GB, 1TB, 2TB" },
        ],
      },
      {
        group: "Camera",
        rows: [
          { k: "Main", v: "48MP Fusion with variable aperture, sensor-shift OIS" },
          { k: "Ultra Wide", v: "48MP, 120° field of view, macro" },
          { k: "Telephoto", v: "48MP with optical-quality zoom" },
          { k: "Front", v: "Centre Stage camera with autofocus" },
        ],
      },
      {
        group: "Build & power",
        rows: [
          { k: "Cooling", v: "Next-generation vapour chamber" },
          { k: "Video playback", v: "Up to 24 hours" },
          { k: "Charging", v: "USB-C, MagSafe, Qi2" },
          { k: "Water resistance", v: "IP68" },
          { k: "Warranty", v: "1 year Apple limited warranty, serviceable at Amaira" },
        ],
      },
    ],
    inBox: ["iPhone 18 Pro", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "in",
    rank: 98,
    tags: ["pro", "flagship", "120hz", "compact", "variable aperture", "a20 pro"],
    leadTimeDays: 1,
    careAnnual: 14900,
    tradeIn: true,
  },
  {
    slug: "iphone-air",
    name: "iPhone Air",
    family: "iPhone Air",
    category: "iphone",
    tagline: "The thinnest iPhone ever made. You feel it the moment you pick it up.",
    basePrice: 149900,
    art: "phone",
    colors: [
      { id: "sky-blue", name: "Sky Blue", hex: "#b9c9d9", accent: "#98adc1", screen: "#161b22" },
      { id: "light-gold", name: "Light Gold", hex: "#e4d4bb", accent: "#c9b79b", screen: "#161b22" },
      { id: "cloud-white", name: "Cloud White", hex: "#f1f0ec", accent: "#d5d3cd", screen: "#161b22" },
      { id: "space-black", name: "Space Black", hex: "#33333a", accent: "#212128", screen: "#0c0c0f" },
    ],
    storage: [
      { id: "256gb", label: "256GB", priceDelta: 0 },
      { id: "512gb", label: "512GB", priceDelta: 25000 },
      { id: "1tb", label: "1TB", priceDelta: 75000 },
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
          { k: "Front", v: "18MP Centre Stage camera" },
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
    stock: "in",
    rank: 92,
    tags: ["thin", "light", "titanium", "esim", "120hz"],
    leadTimeDays: 1,
    careAnnual: 12900,
    tradeIn: true,
  },
  {
    slug: "iphone-17",
    name: "iPhone 17",
    family: "iPhone 17",
    category: "iphone",
    tagline: "ProMotion, a 48MP dual-camera system, and a screen that finally never sleeps.",
    basePrice: 99900,
    art: "phone",
    colors: ALUMINIUM_BRIGHT,
    storage: [
      { id: "256gb", label: "256GB", priceDelta: 0 },
      { id: "512gb", label: "512GB", priceDelta: 25000 },
    ],
    highlights: [
      { title: "120Hz ProMotion", copy: "The smooth, always-on display, now on the standard iPhone." },
      { title: "Dual 48MP cameras", copy: "48MP Fusion main and 48MP Ultra Wide, with a 2x optical-quality zoom." },
      { title: "A19 chip", copy: "Fast, efficient, and built for Apple Intelligence." },
      { title: "256GB to start", copy: "Twice the storage of the iPhone it replaces, at the entry tier." },
    ],
    specs: [
      {
        group: "Display",
        rows: [
          { k: "Size", v: "6.3-inch (diagonal) all-screen OLED" },
          { k: "Technology", v: "Super Retina XDR with ProMotion and always-on" },
          { k: "Protection", v: "Ceramic Shield 2 front" },
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
          { k: "Main", v: "48MP Fusion, ƒ/1.6, 2x optical-quality telephoto" },
          { k: "Ultra Wide", v: "48MP, 120° field of view, macro" },
          { k: "Front", v: "18MP Centre Stage camera" },
        ],
      },
      {
        group: "Power",
        rows: [
          { k: "Video playback", v: "Up to 30 hours" },
          { k: "Charging", v: "USB-C, MagSafe, Qi2" },
          { k: "Water resistance", v: "IP68" },
        ],
      },
    ],
    inBox: ["iPhone 17", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "in",
    rank: 90,
    tags: ["popular", "120hz", "dual camera", "everyday"],
    leadTimeDays: 1,
    careAnnual: 9900,
    tradeIn: true,
  },
  {
    slug: "iphone-17e",
    name: "iPhone 17e",
    family: "iPhone 17e",
    category: "iphone",
    tagline: "The most affordable way into Apple Intelligence — now starting at 256GB.",
    basePrice: 79900,
    art: "phone",
    colors: E_FINISHES,
    storage: [
      { id: "256gb", label: "256GB", priceDelta: 0 },
      { id: "512gb", label: "512GB", priceDelta: 25000 },
    ],
    highlights: [
      { title: "A19 chip", copy: "The same generation of silicon as iPhone 17, built for Apple Intelligence." },
      { title: "48MP 2-in-1 camera", copy: "A 48MP Fusion camera with a built-in 2x telephoto." },
      { title: "256GB to start", copy: "Twice the entry storage of the iPhone 16e it replaces." },
      { title: "Ceramic Shield 2", copy: "The tougher front cover glass, on the entry iPhone." },
    ],
    specs: [
      {
        group: "Display",
        rows: [
          { k: "Size", v: "6.1-inch Super Retina XDR" },
          { k: "Protection", v: "Ceramic Shield 2 front" },
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
          { k: "Rear", v: "48MP Fusion, 2x optical-quality telephoto" },
          { k: "Front", v: "Centre Stage camera" },
        ],
      },
      {
        group: "Power",
        rows: [
          { k: "Charging", v: "USB-C, Qi2 wireless" },
          { k: "Cellular", v: "5G with Apple's own modem" },
        ],
      },
    ],
    inBox: ["iPhone 17e", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "in",
    rank: 82,
    tags: ["affordable", "entry", "a19", "apple intelligence"],
    leadTimeDays: 1,
    careAnnual: 7900,
    tradeIn: true,
  },
  {
    slug: "iphone-16",
    name: "iPhone 16",
    family: "iPhone 16",
    category: "iphone",
    tagline: "Still a brilliant iPhone, still on sale, still with Camera Control.",
    basePrice: 89900,
    art: "phone",
    colors: ALUMINIUM_BRIGHT,
    /* Apple India now lists iPhone 16 as a single 128GB configuration
       ("Comes with 128GB storage"). If your APR allocation includes the
       256GB SKU, add it here with the delta from your price list. */
    storage: [{ id: "128gb", label: "128GB", priceDelta: 0 }],
    highlights: [
      { title: "Camera Control", copy: "A capacitive button on the side that opens the camera and scrubs through its controls." },
      { title: "A18 chip", copy: "Built for Apple Intelligence, with a 5-core GPU." },
      { title: "48MP Fusion camera", copy: "With a 2x telephoto and a 12MP Ultra Wide for macro." },
      { title: "Action button", copy: "Assign it to the torch, Focus, Shortcuts — whatever you actually use." },
    ],
    specs: [
      {
        group: "Display",
        rows: [
          { k: "Size", v: "6.1-inch Super Retina XDR" },
          { k: "Brightness", v: "Up to 2000 nits peak outdoors" },
        ],
      },
      {
        group: "Chip & capacity",
        rows: [
          { k: "Chip", v: "A18 with 5-core GPU" },
          { k: "Capacity", v: "128GB" },
        ],
      },
      {
        group: "Camera",
        rows: [
          { k: "Main", v: "48MP Fusion, ƒ/1.6, 2x telephoto" },
          { k: "Ultra Wide", v: "12MP, macro" },
          { k: "Front", v: "12MP TrueDepth" },
        ],
      },
      {
        group: "Power",
        rows: [
          { k: "Video playback", v: "Up to 22 hours" },
          { k: "Charging", v: "USB-C, MagSafe, Qi2" },
        ],
      },
    ],
    inBox: ["iPhone 16", "USB-C Charge Cable (1 m)", "Documentation"],
    stock: "in",
    rank: 78,
    tags: ["a18", "camera control", "action button", "value"],
    leadTimeDays: 1,
    careAnnual: 8900,
    tradeIn: true,
  },
];
