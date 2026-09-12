/* TV & Home — reconciled against apple.com/in on 12 September 2026.
   Prices are Apple India retail MRP, inclusive of all taxes. */
import type { Product } from "@/lib/types";

export const HOME: Product[] = [
  {
    slug: "homepod-2",
    name: "HomePod",
    family: "HomePod",
    category: "tv-home",
    tagline: "Room-filling sound that knows the shape of your room.",
    basePrice: 44900,
    art: "speaker",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#2f3036", accent: "#1f2025", screen: "#2f3036" },
      { id: "white", name: "White", hex: "#eeeeec", accent: "#d4d4d1", screen: "#eeeeec" },
    ],
    highlights: [
      { title: "Room sensing", copy: "It listens to the reflections around it and re-tunes itself in seconds." },
      { title: "Spatial Audio", copy: "A high-excursion woofer and five tweeters, with beamforming." },
      { title: "Stereo pair", copy: "Two HomePods become a proper left and right, or Apple TV's rear channels." },
      { title: "Home hub", copy: "Temperature and humidity sensing, Matter, and Sound Recognition." },
    ],
    specs: [
      { group: "Audio", rows: [
        { k: "Drivers", v: "20 mm high-excursion woofer, five beamforming tweeters" },
        { k: "Microphones", v: "Four-microphone far-field array" },
        { k: "Processing", v: "Apple S7 chip with room sensing" },
      ]},
      { group: "Smart home", rows: [
        { k: "Sensors", v: "Temperature and humidity" },
        { k: "Standards", v: "Matter, Thread border router" },
        { k: "Assistant", v: "Siri, hands-free" },
      ]},
      { group: "Build", rows: [{ k: "Height", v: "16.8 cm" }, { k: "Weight", v: "2.3 kg" }] },
    ],
    inBox: ["HomePod", "Power cable (attached)"],
    stock: "in",
    rank: 66,
    tags: ["speaker", "siri", "home hub", "stereo"],
    leadTimeDays: 2,
    careAnnual: 2900,
    tradeIn: false,
  },
  {
    slug: "homepod-mini",
    name: "HomePod mini",
    family: "HomePod mini",
    category: "tv-home",
    tagline: "Big sound, small footprint, five colours.",
    basePrice: 15900,
    art: "speaker-mini",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#33343a", accent: "#232429", screen: "#33343a" },
      { id: "white", name: "White", hex: "#eeeeec", accent: "#d4d4d1", screen: "#eeeeec" },
      { id: "yellow", name: "Yellow", hex: "#e2c976", accent: "#c9b063", screen: "#e2c976" },
      { id: "orange", name: "Orange", hex: "#dd8b63", accent: "#c27351", screen: "#dd8b63" },
      { id: "blue", name: "Blue", hex: "#7b9ec4", accent: "#6585a8", screen: "#7b9ec4" },
    ],
    highlights: [
      { title: "360-degree sound", copy: "An acoustic waveguide sends sound out in every direction." },
      { title: "Intercom", copy: "Send a message to every room, or one." },
      { title: "Thread border router", copy: "Makes the rest of your smart home more reliable." },
      { title: "Pair them up", copy: "Two minis in one room make a convincing stereo pair." },
    ],
    specs: [
      { group: "Audio", rows: [
        { k: "Drivers", v: "Full-range driver with dual passive radiators" },
        { k: "Processing", v: "Apple S5 chip, computational audio" },
      ]},
      { group: "Smart home", rows: [
        { k: "Sensors", v: "Temperature and humidity" },
        { k: "Standards", v: "Matter, Thread border router" },
      ]},
      { group: "Build", rows: [{ k: "Height", v: "8.43 cm" }, { k: "Weight", v: "345 g" }] },
    ],
    inBox: ["HomePod mini", "20W USB-C Power Adapter", "USB-C cable (attached)"],
    stock: "in",
    rank: 64,
    tags: ["speaker", "affordable", "gift", "intercom"],
    leadTimeDays: 1,
    careAnnual: 1400,
    tradeIn: false,
  },
  {
    slug: "apple-tv-4k",
    name: "Apple TV 4K",
    family: "Apple TV",
    category: "tv-home",
    tagline: "The fastest way to make any TV feel new again.",
    basePrice: 25900,
    art: "tv-box",
    colors: [{ id: "black", name: "Black", hex: "#2b2b2f", accent: "#1c1c1f", screen: "#2b2b2f" }],
    storageTitle: "Model",
    storage: [
      { id: "64gb", label: "64GB · Wi-Fi", priceDelta: 0 },
      { id: "128gb", label: "128GB · Wi-Fi + Ethernet", priceDelta: 6000, note: "Adds Gigabit Ethernet and Thread" },
    ],
    highlights: [
      { title: "A15 Bionic", copy: "Instant, fluid, and ready for Apple Arcade." },
      { title: "Dolby Vision and Atmos", copy: "With colour balance that uses your iPhone to calibrate the TV." },
      { title: "Siri Remote", copy: "A USB-C rechargeable remote with a clickpad and Find My support." },
      { title: "Home hub", copy: "Runs your HomeKit accessories and automations, quietly." },
    ],
    specs: [
      { group: "Video & audio", rows: [
        { k: "Video", v: "4K HDR, Dolby Vision, HDR10+" },
        { k: "Audio", v: "Dolby Atmos, Dolby Digital 7.1" },
        { k: "Calibration", v: "Colour balance with iPhone" },
      ]},
      { group: "Connectivity", rows: [
        { k: "Ports", v: "HDMI 2.1, Gigabit Ethernet (128GB model)" },
        { k: "Wireless", v: "Wi-Fi 6, Bluetooth 5.0, Thread (128GB model)" },
      ]},
    ],
    inBox: ["Apple TV 4K", "Siri Remote", "Power cord", "USB-C cable"],
    stock: "in",
    rank: 62,
    tags: ["streaming", "home hub", "gaming", "gift"],
    leadTimeDays: 1,
    careAnnual: 1400,
    tradeIn: false,
  },
];
