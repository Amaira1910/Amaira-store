import type { Category } from "@/lib/types";

export const CATEGORIES: Category[] = [
  {
    slug: "iphone",
    name: "iPhone",
    short: "iPhone",
    tagline: "Designed to be loved.",
    heroTitle: "iPhone",
    heroSub: "The line-up, in stock at Sanjaynagar. Set up with us, walk out ready.",
    art: "phone-pro",
  },
  {
    slug: "mac",
    name: "Mac",
    short: "Mac",
    tagline: "Supercharged by Apple silicon.",
    heroTitle: "Mac",
    heroSub: "Try every model on the table before you choose. Student pricing available.",
    art: "laptop",
  },
  {
    slug: "ipad",
    name: "iPad",
    short: "iPad",
    tagline: "Touch, draw, type. Anything.",
    heroTitle: "iPad",
    heroSub: "Pencil and Magic Keyboard demos in store, every day.",
    art: "tablet",
  },
  {
    slug: "watch",
    name: "Apple Watch",
    short: "Watch",
    tagline: "A healthy leap ahead.",
    heroTitle: "Apple Watch",
    heroSub: "Get sized properly. We keep the full band wall in store.",
    art: "watch",
  },
  {
    slug: "audio",
    name: "Audio",
    short: "AirPods",
    tagline: "Sound that surrounds you.",
    heroTitle: "AirPods & Audio",
    heroSub: "Listen before you buy at our demo bar.",
    art: "buds",
  },
  {
    slug: "tv-home",
    name: "TV & Home",
    short: "TV & Home",
    tagline: "Your home, in tune.",
    heroTitle: "TV & Home",
    heroSub: "See a full HomeKit set-up running in store.",
    art: "speaker",
  },
  {
    slug: "accessories",
    name: "Accessories",
    short: "Accessories",
    tagline: "Made to go together.",
    heroTitle: "Accessories",
    heroSub: "Genuine Apple accessories, plus the cases and cables we actually recommend.",
    art: "magsafe",
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<Category["slug"], Category>;
