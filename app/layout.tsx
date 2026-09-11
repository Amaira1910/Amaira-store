import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/ui.css";
import "@/styles/layout.css";
import "@/styles/pages.css";
import "@/styles/foldable.css";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ToastHost from "@/components/ToastHost";
import Reveal from "@/components/Reveal";
import DevicePosture from "@/components/DevicePosture";
import ServiceWorker from "@/components/ServiceWorker";
import { CartProvider } from "@/lib/cart";
import { buildMenu, buildSearchIndex } from "@/lib/nav";
import { STORE } from "@/data/store";
import { SITE_URL, jsonLdScript, localBusinessJsonLd } from "@/lib/seo";

/* SF Pro is not licensable for the web, so Inter carries non-Apple devices.
   The token stack still puts real SF first on Apple hardware. */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${STORE.name} — ${STORE.descriptor} in Sanjaynagar, Bengaluru`,
    template: `%s — ${STORE.name}`,
  },
  description:
    "Buy iPhone, Mac, iPad, Apple Watch, AirPods and accessories at Amaira, an Apple Premium Reseller in Sanjaynagar, Bengaluru. No-cost EMI, trade-in, free delivery and in-store setup.",
  keywords: [
    "Apple Premium Reseller Bangalore", "iPhone Sanjaynagar", "Mac store Bengaluru",
    "Apple store Ashwathnagar", "buy iPhone Bangalore", "Amaira Apple",
  ],
  applicationName: STORE.name,
  authors: [{ name: STORE.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: STORE.name,
    locale: "en_IN",
    url: SITE_URL,
    title: `${STORE.name} — ${STORE.descriptor}, Bengaluru`,
    description:
      "The Apple line-up, and people who know it. Sanjaynagar Main Road, Bengaluru. No-cost EMI, trade-in and same-day setup.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${STORE.name} — ${STORE.descriptor}`,
    description: "iPhone, Mac, iPad, Watch and AirPods in Sanjaynagar, Bengaluru.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: true, address: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* Stamps .js on <html> before first paint so CSS can hide scroll-reveal
   sections only when there is JavaScript around to bring them back. */
const JS_FLAG = `document.documentElement.classList.add("js")`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const menu = buildMenu();
  const index = buildSearchIndex();

  return (
    <html lang="en-IN" className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(localBusinessJsonLd())}
        />
      </head>
      <body>
        <CartProvider>
          <a className="skip-link" href="#main">Skip to content</a>

          <p className="promo-bar">
            Free delivery across Bengaluru, and no-cost EMI from 3 to 12 months.{" "}
            <Link href="/finance">See the plans ›</Link>
          </p>

          <SiteHeader menu={menu} index={index} />

          <main id="main">{children}</main>

          <SiteFooter />
          <ToastHost />
          <Reveal />
          <DevicePosture />
          <ServiceWorker />
        </CartProvider>
      </body>
    </html>
  );
}
