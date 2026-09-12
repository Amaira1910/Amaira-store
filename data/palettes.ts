/* Shared finish palettes. Keeping them in one place means a colour correction
   propagates to every render and swatch that uses it. */
import type { ColorOption } from "@/lib/types";

export const TITANIUM: ColorOption[] = [
  { id: "natural", name: "Natural Titanium", hex: "#c8c2ba", accent: "#a9a29a", screen: "#2b2926" },
  { id: "blue", name: "Blue Titanium", hex: "#5f6b7d", accent: "#47525f", screen: "#1b2230" },
  { id: "white", name: "White Titanium", hex: "#ecebe8", accent: "#cfcdc8", screen: "#3a3a3c" },
  { id: "black", name: "Black Titanium", hex: "#3b3a38", accent: "#2a2927", screen: "#121214" },
];

export const ALUMINIUM_BRIGHT: ColorOption[] = [
  { id: "ultramarine", name: "Ultramarine", hex: "#4b5fbe", accent: "#3a4c9e", screen: "#1a1f3d" },
  { id: "teal", name: "Teal", hex: "#8fc0bd", accent: "#6ea6a2", screen: "#12302e" },
  { id: "pink", name: "Pink", hex: "#e5b7c0", accent: "#cf98a4", screen: "#3a2128" },
  { id: "white", name: "White", hex: "#f2f1ee", accent: "#d7d5d0", screen: "#3a3a3c" },
  { id: "black", name: "Black", hex: "#35343a", accent: "#232228", screen: "#111113" },
];

export const MAC_FINISHES: ColorOption[] = [
  { id: "midnight", name: "Midnight", hex: "#2e3641", accent: "#1f252d", screen: "#0d1117" },
  { id: "starlight", name: "Starlight", hex: "#efe7db", accent: "#d6cbbb", screen: "#111113" },
  { id: "silver", name: "Silver", hex: "#e3e4e6", accent: "#c5c7ca", screen: "#111113" },
  { id: "sky-blue", name: "Sky Blue", hex: "#b9c7d8", accent: "#98a9bd", screen: "#111113" },
];

export const PRO_FINISHES: ColorOption[] = [
  { id: "space-black", name: "Space Black", hex: "#3a3a3e", accent: "#26262a", screen: "#0b0b0d" },
  { id: "silver", name: "Silver", hex: "#e3e4e6", accent: "#c2c4c7", screen: "#0b0b0d" },
];

export const IPAD_FINISHES: ColorOption[] = [
  { id: "space-black", name: "Space Black", hex: "#3a3a3e", accent: "#26262a", screen: "#0e0e10" },
  { id: "silver", name: "Silver", hex: "#e1e2e4", accent: "#c2c4c7", screen: "#0e0e10" },
];

export const WATCH_ALUMINIUM: ColorOption[] = [
  { id: "jet-black", name: "Jet Black", hex: "#2a2a2e", accent: "#3c3c42", screen: "#08080a" },
  { id: "rose-gold", name: "Rose Gold", hex: "#dcb5a8", accent: "#c49a8c", screen: "#08080a" },
  { id: "silver", name: "Silver", hex: "#dedfe1", accent: "#bfc1c4", screen: "#08080a" },
];

export const AUDIO_WHITE: ColorOption[] = [
  { id: "white", name: "White", hex: "#f4f4f2", accent: "#d9d9d6", screen: "#e9e9e6" },
];

/* iPhone 18 Pro / Pro Max — the 2026 Pro finishes replace the titanium four. */
export const PRO_18_FINISHES: ColorOption[] = [
  { id: "burgundy", name: "Burgundy", hex: "#6d2b33", accent: "#522026", screen: "#1a1012" },
  { id: "glacier", name: "Glacier", hex: "#dce6ea", accent: "#bccbd2", screen: "#2b2f31" },
  { id: "silver", name: "Silver", hex: "#e6e7e9", accent: "#c7c9cc", screen: "#2b2b2d" },
  { id: "black", name: "Black", hex: "#2f2f33", accent: "#1f1f23", screen: "#0f0f11" },
];

/* iPhone Duo — Apple's first foldable ships in exactly two finishes. */
export const DUO_FINISHES: ColorOption[] = [
  { id: "star-white", name: "Star White", hex: "#f0eee9", accent: "#d3d0c9", screen: "#141416" },
  { id: "night-sky", name: "Night Sky", hex: "#242a36", accent: "#161a23", screen: "#0a0b0e" },
];

/* iPhone 17e — the aluminium e-series three. */
export const E_FINISHES: ColorOption[] = [
  { id: "black", name: "Black", hex: "#33333a", accent: "#212128", screen: "#111113" },
  { id: "white", name: "White", hex: "#f2f1ee", accent: "#d7d5d0", screen: "#3a3a3c" },
  { id: "soft-pink", name: "Soft Pink", hex: "#e9c9cd", accent: "#cfabb0", screen: "#3a2a2c" },
];

/* Apple Watch Series 12 aluminium — Dark Bronze and Light Gold are new for 2026. */
export const WATCH_ALUMINIUM_12: ColorOption[] = [
  { id: "dark-bronze", name: "Dark Bronze", hex: "#6a4f42", accent: "#4e3830", screen: "#08080a" },
  { id: "light-gold", name: "Light Gold", hex: "#e3d3b6", accent: "#c6b498", screen: "#08080a" },
  { id: "black", name: "Black", hex: "#2a2a2e", accent: "#3c3c42", screen: "#08080a" },
  { id: "space-grey", name: "Space Grey", hex: "#6b6d72", accent: "#54565a", screen: "#08080a" },
];
