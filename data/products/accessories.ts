/* ==========================================================================
   Accessories — Magic Mouse (₹8,900), Magic Trackpad (₹12,500), Magic
   Keyboard with Touch ID (₹14,500), the iPad Pro Magic Keyboards (₹29,900
   / ₹33,900), Apple Pencil Pro (₹11,900), Apple Pencil USB-C (₹7,900) and
   the AirTag 4-pack (₹12,900) were reconciled against apple.com/in on
   12 September 2026. ⚠️ The remaining lines (MagSafe Charger, power
   adapters, cables, cases, bands, Studio Display, ear tips) were NOT
   re-confirmed — check them against your APR price list before go-live.
   Accessories carry lighter data than the hero products, so they are built
   through a small helper rather than written out longhand.
   ========================================================================== */
import type { ArtKind, ColorOption, Highlight, Product, SpecGroup, StockState, VariantOption } from "@/lib/types";

interface AccInput {
  slug: string;
  name: string;
  family: string;
  tagline: string;
  price: number;
  art: ArtKind;
  colors?: ColorOption[];
  variants?: VariantOption[];
  variantTitle?: string;
  highlights: Highlight[];
  specs: { k: string; v: string }[];
  inBox?: string[];
  stock?: StockState;
  rank?: number;
  tags: string[];
  eyebrow?: string;
}

const GREY: ColorOption[] = [{ id: "white", name: "White", hex: "#f2f2f0", accent: "#d8d8d5", screen: "#f2f2f0" }];

function acc(a: AccInput): Product {
  const specs: SpecGroup[] = [{ group: "Details", rows: a.specs }];
  return {
    slug: a.slug,
    name: a.name,
    family: a.family,
    category: "accessories",
    tagline: a.tagline,
    eyebrow: a.eyebrow,
    basePrice: a.price,
    art: a.art,
    colors: a.colors ?? GREY,
    storage: a.variants,
    storageTitle: a.variantTitle ?? "Choose an option",
    highlights: a.highlights,
    specs,
    inBox: a.inBox ?? [a.name],
    stock: a.stock ?? "in",
    rank: a.rank ?? 40,
    tags: a.tags,
    leadTimeDays: 1,
    tradeIn: false,
  };
}

const CASE_COLORS: ColorOption[] = [
  { id: "black", name: "Black", hex: "#2c2c2f", accent: "#1d1d20", screen: "#2c2c2f" },
  { id: "stone", name: "Stone", hex: "#cfc7ba", accent: "#b5ada1", screen: "#cfc7ba" },
  { id: "indigo", name: "Indigo", hex: "#4a5680", accent: "#3a4467", screen: "#4a5680" },
  { id: "sage", name: "Sage", hex: "#a8b79e", accent: "#8d9c85", screen: "#a8b79e" },
  { id: "rose", name: "Rose", hex: "#d9a3ab", accent: "#bf8a92", screen: "#d9a3ab" },
];

const BAND_COLORS: ColorOption[] = [
  { id: "black", name: "Black", hex: "#2b2b2e", accent: "#1c1c1f", screen: "#2b2b2e" },
  { id: "denim", name: "Denim", hex: "#5a6b8c", accent: "#475473", screen: "#5a6b8c" },
  { id: "clay", name: "Clay", hex: "#c08b6e", accent: "#a5735a", screen: "#c08b6e" },
  { id: "lake-green", name: "Lake Green", hex: "#7fa08c", accent: "#678774", screen: "#7fa08c" },
  { id: "light-blush", name: "Light Blush", hex: "#e7cfcb", accent: "#cdb4b0", screen: "#e7cfcb" },
];

export const ACCESSORIES: Product[] = [
  acc({
    slug: "apple-pencil-pro",
    name: "Apple Pencil Pro",
    family: "Apple Pencil",
    tagline: "Squeeze, roll and feel it respond. The best stylus anyone has made.",
    price: 11900,
    art: "pencil",
    eyebrow: "For iPad Pro and iPad Air",
    highlights: [
      { title: "Squeeze", copy: "Bring up a tool palette without leaving the canvas." },
      { title: "Barrel roll", copy: "A gyroscope tracks rotation, so a flat brush behaves like a flat brush." },
      { title: "Haptic feedback", copy: "A small, precise tap confirms every action." },
      { title: "Find My", copy: "The first Apple Pencil you can locate if it rolls under the sofa." },
    ],
    specs: [
      { k: "Compatibility", v: "iPad Pro (M4), iPad Air (M2 and later), iPad mini (A17 Pro)" },
      { k: "Sensors", v: "Pressure, tilt, squeeze, gyroscope, haptic engine" },
      { k: "Pairing & charging", v: "Magnetically attaches and charges on the side of your iPad" },
      { k: "Latency", v: "Low latency with Apple Pencil hover" },
    ],
    rank: 60,
    tags: ["ipad", "drawing", "notes", "stylus"],
  }),
  acc({
    slug: "apple-pencil-usb-c",
    name: "Apple Pencil (USB-C)",
    family: "Apple Pencil",
    tagline: "Precise, tilt-sensitive and pocketable. The everyday note-taker.",
    price: 7900,
    art: "pencil",
    highlights: [
      { title: "Pixel-perfect precision", copy: "Write and mark up documents exactly where you mean to." },
      { title: "Magnetic attach", copy: "Snaps to the side of your iPad, and stays there." },
      { title: "Charges over USB-C", copy: "The same cable as your iPad." },
      { title: "Hover on iPad Pro", copy: "Preview your mark before it lands." },
    ],
    specs: [
      { k: "Compatibility", v: "All iPad models with a USB-C port" },
      { k: "Sensors", v: "Tilt sensitivity" },
      { k: "Charging", v: "USB-C (cable not included)" },
    ],
    rank: 55,
    tags: ["ipad", "notes", "stylus", "affordable"],
  }),
  acc({
    slug: "magic-keyboard-ipad-pro",
    name: "Magic Keyboard for iPad Pro",
    family: "Magic Keyboard",
    tagline: "Turns iPad into a laptop, and back, in a second.",
    price: 29900,
    art: "keyboard",
    colors: [
      { id: "black", name: "Black", hex: "#2e2e31", accent: "#1e1e21", screen: "#0f0f11" },
      { id: "white", name: "White", hex: "#eeedeb", accent: "#d5d4d1", screen: "#0f0f11" },
    ],
    variantTitle: "Size",
    variants: [
      { id: "11", label: 'For 11-inch iPad Pro', priceDelta: 0 },
      { id: "13", label: 'For 13-inch iPad Pro', priceDelta: 4000 },
    ],
    highlights: [
      { title: "Function row", copy: "Brightness, volume and Escape, where your fingers expect them." },
      { title: "Larger trackpad", copy: "With haptic feedback and full multi-touch gestures." },
      { title: "Floating cantilever", copy: "Adjust the viewing angle without wobble." },
      { title: "Pass-through charging", copy: "A USB-C port on the hinge keeps the iPad port free." },
    ],
    specs: [
      { k: "Compatibility", v: "iPad Pro (M4) 11-inch and 13-inch" },
      { k: "Trackpad", v: "Haptic, full-size, multi-touch" },
      { k: "Connection", v: "Smart Connector — no pairing, no charging" },
      { k: "Layout", v: "Backlit keys, function row" },
    ],
    rank: 58,
    tags: ["ipad", "keyboard", "productivity", "trackpad"],
  }),
  acc({
    slug: "magic-keyboard-mac",
    name: "Magic Keyboard with Touch ID",
    family: "Magic Keyboard",
    tagline: "Unlock, authenticate and pay with a fingerprint.",
    price: 14500,
    art: "keyboard",
    colors: [
      { id: "white", name: "White and Silver", hex: "#ecebe9", accent: "#cfcecb", screen: "#0f0f11" },
      { id: "black", name: "Black and Space Grey", hex: "#37373a", accent: "#252528", screen: "#0f0f11" },
    ],
    variantTitle: "Layout",
    variants: [
      { id: "compact", label: "Compact layout", priceDelta: 0 },
      { id: "numeric", label: "With numeric keypad", priceDelta: 5000 },
    ],
    highlights: [
      { title: "Touch ID", copy: "Works with any Mac with Apple silicon." },
      { title: "Scissor mechanism", copy: "1 mm of travel and a low profile that stays quiet." },
      { title: "Rechargeable", copy: "About a month per charge, over USB-C." },
      { title: "Pairs instantly", copy: "Plug it in once and it is set up." },
    ],
    specs: [
      { k: "Compatibility", v: "Mac with Apple silicon (Touch ID); any Mac or iPad for typing" },
      { k: "Connection", v: "Bluetooth, USB-C for charging and pairing" },
      { k: "Battery", v: "About one month between charges" },
    ],
    rank: 52,
    tags: ["mac", "keyboard", "touch id"],
  }),
  acc({
    slug: "magic-mouse",
    name: "Magic Mouse",
    family: "Magic Mouse",
    tagline: "A single smooth surface that understands gestures.",
    price: 8900,
    art: "mouse",
    colors: [
      { id: "white", name: "White", hex: "#eeedeb", accent: "#d3d2cf", screen: "#eeedeb" },
      { id: "black", name: "Black", hex: "#36363a", accent: "#242428", screen: "#36363a" },
    ],
    highlights: [
      { title: "Multi-Touch surface", copy: "Swipe between pages and full-screen apps with one finger." },
      { title: "Optimised foot design", copy: "Glides with almost no resistance." },
      { title: "Rechargeable", copy: "About a month per charge, over USB-C." },
      { title: "Just works", copy: "Pairs automatically with your Mac." },
    ],
    specs: [
      { k: "Connection", v: "Bluetooth, USB-C" },
      { k: "Battery", v: "About one month between charges" },
      { k: "Compatibility", v: "Mac with macOS 13 or later, iPad with iPadOS 16.1 or later" },
    ],
    rank: 50,
    tags: ["mac", "mouse", "gestures"],
  }),
  acc({
    slug: "magic-trackpad",
    name: "Magic Trackpad",
    family: "Magic Trackpad",
    tagline: "A large glass surface with Force Touch, for every macOS gesture.",
    price: 12500,
    art: "trackpad",
    colors: [
      { id: "white", name: "White", hex: "#efeeec", accent: "#d4d3d0", screen: "#efeeec" },
      { id: "black", name: "Black", hex: "#36363a", accent: "#242428", screen: "#36363a" },
    ],
    highlights: [
      { title: "Force Touch", copy: "Click anywhere, then press deeper for a second layer of controls." },
      { title: "A lot of room", copy: "The largest gesture surface Apple makes." },
      { title: "Rechargeable", copy: "About a month per charge." },
      { title: "Edge-to-edge glass", copy: "Consistent click feel across the whole surface." },
    ],
    specs: [
      { k: "Connection", v: "Bluetooth, USB-C" },
      { k: "Surface", v: "Edge-to-edge glass with Force Touch" },
      { k: "Compatibility", v: "Mac with macOS 13 or later" },
    ],
    rank: 48,
    tags: ["mac", "trackpad", "gestures"],
  }),
  acc({
    slug: "airtag",
    name: "AirTag",
    family: "AirTag",
    tagline: "Keys, bag, scooter. Find it with a ping and an arrow.",
    price: 3490,
    art: "airtag",
    variantTitle: "Pack",
    variants: [
      { id: "1", label: "1 pack", priceDelta: 0 },
      { id: "4", label: "4 pack", priceDelta: 9410, note: "Better value per tag" },
    ],
    highlights: [
      { title: "Precision Finding", copy: "On iPhone 11 and later, an on-screen arrow walks you to it." },
      { title: "Play a sound", copy: "The built-in speaker makes it findable in a drawer." },
      { title: "Find My network", copy: "Hundreds of millions of Apple devices help, anonymously." },
      { title: "A year of battery", copy: "A standard CR2032 you can replace yourself." },
    ],
    specs: [
      { k: "Battery", v: "User-replaceable CR2032, about one year" },
      { k: "Resistance", v: "IP67 splash, water and dust resistant" },
      { k: "Connectivity", v: "Bluetooth, Ultra Wideband, NFC tap" },
      { k: "Engraving", v: "Free engraving available in store" },
    ],
    rank: 56,
    tags: ["find my", "tracker", "gift", "travel"],
  }),
  acc({
    slug: "magsafe-charger",
    name: "MagSafe Charger",
    family: "Charging",
    tagline: "Snaps on perfectly. Charges fast. Never misaligned.",
    price: 4900,
    art: "magsafe",
    variantTitle: "Cable length",
    variants: [
      { id: "1m", label: "1 m cable", priceDelta: 0 },
      { id: "2m", label: "2 m cable", priceDelta: 1500 },
    ],
    highlights: [
      { title: "Up to 25W", copy: "With a 30W or higher adapter on iPhone 16 and later." },
      { title: "Perfect alignment", copy: "Magnets do the aiming, every time." },
      { title: "Works through cases", copy: "Any MagSafe case, and most thin cases." },
      { title: "Also charges AirPods", copy: "Any Qi-compatible AirPods case." },
    ],
    specs: [
      { k: "Output", v: "Up to 25W with a 30W USB-C adapter" },
      { k: "Cable", v: "Woven USB-C, 1 m or 2 m" },
      { k: "Compatibility", v: "iPhone 12 and later, AirPods with wireless case" },
      { k: "Note", v: "Power adapter sold separately" },
    ],
    rank: 57,
    tags: ["charging", "magsafe", "iphone"],
  }),
  acc({
    slug: "usb-c-power-adapter",
    name: "USB-C Power Adapter",
    family: "Charging",
    tagline: "The right wattage for the device you actually own.",
    price: 1900,
    art: "adapter",
    variantTitle: "Wattage",
    variants: [
      { id: "20w", label: "20W", priceDelta: 0, note: "iPhone, iPad, AirPods" },
      { id: "30w", label: "30W", priceDelta: 1000, note: "Fast charge iPhone, MacBook Air" },
      { id: "35w-dual", label: "35W Dual USB-C", priceDelta: 2000, note: "Two devices at once" },
      { id: "70w", label: "70W", priceDelta: 3600, note: "MacBook Pro 14-inch" },
      { id: "140w", label: "140W", priceDelta: 6000, note: "MacBook Pro 16-inch fast charge" },
    ],
    highlights: [
      { title: "Fast charge", copy: "A 30W adapter takes iPhone to 50% in around 20 minutes." },
      { title: "Compact", copy: "The folding-pin design travels well." },
      { title: "Safe by design", copy: "Genuine Apple power management, not a guess." },
      { title: "Universal USB-C", copy: "One adapter for iPhone, iPad, Watch and Mac." },
    ],
    specs: [
      { k: "Connector", v: "USB-C" },
      { k: "Cable", v: "Sold separately" },
      { k: "Warranty", v: "1 year Apple limited warranty" },
    ],
    rank: 46,
    tags: ["charging", "adapter", "travel"],
  }),
  acc({
    slug: "usb-c-charge-cable",
    name: "USB-C Charge Cable",
    family: "Cables",
    tagline: "Woven, durable and rated for the speeds you paid for.",
    price: 1900,
    art: "cable",
    variantTitle: "Length",
    variants: [
      { id: "1m", label: "1 m", priceDelta: 0 },
      { id: "2m", label: "2 m", priceDelta: 900 },
      { id: "tb5-1m", label: "Thunderbolt 5 · 1 m", priceDelta: 5000, note: "Up to 120Gb/s" },
    ],
    highlights: [
      { title: "Woven construction", copy: "Holds up to being coiled into a bag every day." },
      { title: "Fast charging", copy: "Supports up to 240W with a matching adapter." },
      { title: "Data too", copy: "Thunderbolt 5 option for external SSDs and displays." },
      { title: "Genuine Apple", copy: "No handshake errors, no 'accessory not supported'." },
    ],
    specs: [
      { k: "Connector", v: "USB-C to USB-C" },
      { k: "Charging", v: "Up to 240W" },
      { k: "Data", v: "USB 2 (480Mb/s) on standard cables; 120Gb/s on Thunderbolt 5" },
    ],
    rank: 44,
    tags: ["cable", "charging", "usb-c"],
  }),
  acc({
    slug: "iphone-silicone-case-magsafe",
    name: "iPhone Silicone Case with MagSafe",
    family: "iPhone cases",
    tagline: "Soft-touch silicone with a microfibre lining, and magnets that click.",
    price: 4900,
    art: "case",
    colors: CASE_COLORS,
    variantTitle: "Model",
    variants: [
      { id: "18-pro", label: "For iPhone 18 Pro", priceDelta: 0 },
      { id: "18-pro-max", label: "For iPhone 18 Pro Max", priceDelta: 0 },
      { id: "air", label: "For iPhone Air", priceDelta: 0 },
      { id: "17", label: "For iPhone 17", priceDelta: 0 },
      { id: "17e", label: "For iPhone 17e", priceDelta: 0 },
    ],
    highlights: [
      { title: "MagSafe magnets", copy: "Charges and attaches without taking the case off." },
      { title: "Microfibre lining", copy: "Protects the finish underneath." },
      { title: "Raised edges", copy: "Keeps the camera glass off the table." },
      { title: "Colour-matched buttons", copy: "Machined aluminium, not painted plastic." },
    ],
    specs: [
      { k: "Material", v: "Silicone exterior, microfibre interior" },
      { k: "MagSafe", v: "Yes — charging and accessory attach" },
      { k: "Fit", v: "Model-specific; choose above" },
    ],
    rank: 54,
    tags: ["case", "iphone", "magsafe", "protection"],
  }),
  acc({
    slug: "iphone-clear-case-magsafe",
    name: "iPhone Clear Case with MagSafe",
    family: "iPhone cases",
    tagline: "Show the colour you chose. Keep it protected anyway.",
    price: 4900,
    art: "case",
    colors: [{ id: "clear", name: "Clear", hex: "#e9edf1", accent: "#c9d2da", screen: "#e9edf1" }],
    variantTitle: "Model",
    variants: [
      { id: "18-pro", label: "For iPhone 18 Pro", priceDelta: 0 },
      { id: "18-pro-max", label: "For iPhone 18 Pro Max", priceDelta: 0 },
      { id: "air", label: "For iPhone Air", priceDelta: 0 },
      { id: "17", label: "For iPhone 17", priceDelta: 0 },
      { id: "17e", label: "For iPhone 17e", priceDelta: 0 },
    ],
    highlights: [
      { title: "Stays clear", copy: "An optical coating on both sides resists yellowing." },
      { title: "Visible magnet ring", copy: "So you can see the MagSafe alignment." },
      { title: "Scratch resistant", copy: "Polycarbonate back with a flexible frame." },
      { title: "Slim", copy: "Adds almost nothing to the pocket." },
    ],
    specs: [
      { k: "Material", v: "Polycarbonate and TPU" },
      { k: "MagSafe", v: "Yes" },
      { k: "Fit", v: "Model-specific; choose above" },
    ],
    rank: 45,
    tags: ["case", "iphone", "clear", "magsafe"],
  }),
  acc({
    slug: "apple-watch-band",
    name: "Apple Watch Band",
    family: "Watch bands",
    tagline: "One watch, a different mood every day.",
    price: 4900,
    art: "band",
    colors: BAND_COLORS,
    variantTitle: "Band style",
    variants: [
      { id: "sport-sm", label: "Sport Band · S/M", priceDelta: 0 },
      { id: "sport-ml", label: "Sport Band · M/L", priceDelta: 0 },
      { id: "sport-loop", label: "Sport Loop", priceDelta: 0, note: "Soft, breathable, adjustable" },
      { id: "braided", label: "Braided Solo Loop", priceDelta: 4000, note: "Stretches on, no clasp" },
      { id: "milanese", label: "Milanese Loop", priceDelta: 8000, note: "Stainless steel mesh" },
    ],
    highlights: [
      { title: "Swap in seconds", copy: "Press, slide, done. No tools." },
      { title: "Sized in store", copy: "Come in and we will measure your wrist properly." },
      { title: "Fits every size", copy: "Bands are compatible across matching case sizes." },
      { title: "Built to sweat in", copy: "Sport Bands and Loops are made for the gym and the pool." },
    ],
    specs: [
      { k: "Compatibility", v: "Apple Watch 38/40/41/42 mm and 42/44/45/46/49 mm cases" },
      { k: "Materials", v: "Fluoroelastomer, woven nylon, recycled yarn or stainless steel" },
      { k: "Sizing", v: "Free in-store sizing at Amaira" },
    ],
    rank: 53,
    tags: ["watch", "band", "gift", "style"],
  }),
  acc({
    slug: "studio-display",
    name: "Studio Display",
    family: "Displays",
    tagline: "A 27-inch 5K Retina display with a camera and speakers worth using.",
    price: 159900,
    art: "display",
    colors: [{ id: "silver", name: "Silver", hex: "#d8d9dc", accent: "#b8b9bc", screen: "#0e0e10" }],
    variantTitle: "Glass and stand",
    variants: [
      { id: "standard-tilt", label: "Standard glass · Tilt stand", priceDelta: 0 },
      { id: "nano-tilt", label: "Nano-texture glass · Tilt stand", priceDelta: 25000, note: "For bright rooms" },
      { id: "standard-tilt-height", label: "Standard glass · Tilt and height stand", priceDelta: 40000 },
      { id: "vesa", label: "Standard glass · VESA mount adapter", priceDelta: 0 },
    ],
    highlights: [
      { title: "5K Retina", copy: "14.7 million pixels, 600 nits, P3 wide colour and True Tone." },
      { title: "12MP Center Stage camera", copy: "Keeps you centred as you move." },
      { title: "Six-speaker system", copy: "The best speakers ever in a Mac display, with Spatial Audio." },
      { title: "One cable", copy: "Thunderbolt carries video and 96W of charge to your MacBook." },
    ],
    specs: [
      { k: "Display", v: "27-inch 5K Retina, 5120 × 2880 at 218 ppi" },
      { k: "Brightness", v: "600 nits, P3 wide colour, True Tone" },
      { k: "Ports", v: "One Thunderbolt 3 (up to 96W charging), three USB-C" },
      { k: "Audio", v: "Six speakers with Spatial Audio, three-mic array" },
    ],
    stock: "order",
    rank: 65,
    tags: ["display", "monitor", "5k", "mac", "pro"],
  }),
  acc({
    slug: "airpods-pro-ear-tips",
    name: "AirPods Pro Ear Tips",
    family: "AirPods accessories",
    tagline: "A replacement set, in the size that actually seals.",
    price: 800,
    art: "buds",
    variantTitle: "Tip size",
    variants: [
      { id: "xxs", label: "XXS", priceDelta: 0 },
      { id: "xs", label: "XS", priceDelta: 0 },
      { id: "s", label: "Small", priceDelta: 0 },
      { id: "m", label: "Medium", priceDelta: 0 },
      { id: "l", label: "Large", priceDelta: 0 },
    ],
    highlights: [
      { title: "Better seal, better bass", copy: "Noise cancellation depends almost entirely on the fit." },
      { title: "Foam-infused", copy: "Comfortable for long listening." },
      { title: "Run the fit test", copy: "We will check your seal in store, free." },
      { title: "Two per pack", copy: "A left and a right." },
    ],
    specs: [
      { k: "Compatibility", v: "AirPods Pro (all generations)" },
      { k: "Pack", v: "One pair" },
    ],
    rank: 30,
    tags: ["airpods", "tips", "spare"],
  }),
];
