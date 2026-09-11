/* Shared SEO helpers: canonical base URL and the structured data that tells
   Google this is a real shop at a real address. */
import { STORE } from "@/data/store";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function absolute(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "@id": `${SITE_URL}/#store`,
    name: STORE.name,
    description: `${STORE.descriptor} in Sanjaynagar, Bengaluru. iPhone, Mac, iPad, Apple Watch, AirPods and accessories with in-store setup, service and no-cost EMI.`,
    url: SITE_URL,
    telephone: STORE.phone,
    email: STORE.email,
    priceRange: "₹₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, EMI, Cash",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${STORE.address.line1}, ${STORE.address.line2}`,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.pincode,
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: STORE.geo.lat, longitude: STORE.geo.lng },
    openingHoursSpecification: STORE.openingHoursSpec.map((s) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: s.days,
      opens: s.opens,
      closes: s.closes,
    })),
    sameAs: [STORE.social.instagram, STORE.social.facebook, STORE.social.youtube],
  };
}

export function breadcrumbJsonLd(trail: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absolute(t.href),
    })),
  };
}

/** Serialises JSON-LD safely for inline injection. */
export function jsonLdScript(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
