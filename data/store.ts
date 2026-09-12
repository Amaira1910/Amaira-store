/* ==========================================================================
   Store facts. Everything the site says about Amaira comes from here, so a
   change of hours or phone number is a one-line edit.
   ========================================================================== */

export const STORE = {
  name: "Amaira",
  legalName: "Amaira",
  descriptor: "Apple Premium Reseller",
  tagline: "The Apple line-up, and people who know it. In Sanjaynagar.",

  address: {
    line1: "52, Rishabh Arcade",
    line2: "Sanjaynagar Main Road, Ashwathnagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560094",
    country: "India",
  },

  /** Single-line form, for schema.org and the footer. */
  addressLine: "52, Rishabh Arcade, Sanjaynagar Main Road, Ashwathnagar, Bengaluru, Karnataka 560094",

  phone: "+91 99003 30022",
  phoneHref: "tel:+919900330022",
  whatsappHref: "https://wa.me/919900330022",
  email: "care@amairastore.in",

  /** Approximate coordinates for Sanjaynagar, Bengaluru.
      ⚠️ Replace with the exact pin from your Google Business Profile. */
  geo: { lat: 13.0358, lng: 77.5701 },

  mapsEmbed:
    "https://www.google.com/maps?q=Rishabh+Arcade,+Sanjaynagar+Main+Road,+Ashwathnagar,+Bengaluru,+Karnataka+560094&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Rishabh+Arcade+Sanjaynagar+Main+Road+Ashwathnagar+Bengaluru+560094",

  /** 0 = Sunday, matching Date.getDay(). */
  hours: [
    { day: "Sunday", open: "11:00", close: "20:00" },
    { day: "Monday", open: "10:00", close: "21:00" },
    { day: "Tuesday", open: "10:00", close: "21:00" },
    { day: "Wednesday", open: "10:00", close: "21:00" },
    { day: "Thursday", open: "10:00", close: "21:00" },
    { day: "Friday", open: "10:00", close: "21:00" },
    { day: "Saturday", open: "10:00", close: "21:00" },
  ],

  /** schema.org openingHours strings. */
  openingHoursSpec: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "10:00", closes: "21:00" },
    { days: ["Sunday"], opens: "11:00", closes: "20:00" },
  ],

  social: {
    instagram: "https://instagram.com/amairastore",
    facebook: "https://facebook.com/amairastore",
    youtube: "https://youtube.com/@amairastore",
  },

  /** Delivery promise shown on PDPs and in the bag. */
  delivery: {
    freeAbove: 0, // free on everything
    cityName: "Bengaluru",
    citySameDayCutoff: "16:00",
    pickupReadyHours: 2,
  },

  /** EMI partners, for the finance block. Update as your tie-ups change. */
  emiBanks: [
    "HDFC Bank", "ICICI Bank", "Axis Bank", "SBI Card", "Kotak", "IDFC FIRST",
    "Yes Bank", "Federal Bank", "Bank of Baroda", "RBL Bank",
  ],
} as const;

export type StoreHours = (typeof STORE.hours)[number];
