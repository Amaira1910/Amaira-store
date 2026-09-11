import Link from "next/link";
import { STORE } from "@/data/store";
import { CATEGORIES } from "@/data/categories";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      ...CATEGORIES.map((c) => ({ label: c.name, href: `/shop/${c.slug}` })),
      { label: "Gift ideas", href: "/shop/accessories" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Service and repair", href: "/services" },
      { label: "Set-up and data transfer", href: "/services#setup" },
      { label: "Trade in", href: "/trade-in" },
      { label: "EMI and finance", href: "/finance" },
      { label: "AppleCare+", href: "/services#applecare" },
    ],
  },
  {
    title: "For organisations",
    links: [
      { label: "Amaira for Business", href: "/business" },
      { label: "Education pricing", href: "/education" },
      { label: "Bulk and corporate orders", href: "/business#bulk" },
      { label: "GST invoicing", href: "/business#gst" },
    ],
  },
  {
    title: "The store",
    links: [
      { label: "Visit Sanjaynagar", href: "/store" },
      { label: "About Amaira", href: "/about" },
      { label: "Contact us", href: "/contact" },
      { label: "Support", href: "/support" },
    ],
  },
];

const LEGAL = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Sale", href: "/legal/terms" },
  { label: "Returns and Refunds", href: "/legal/returns" },
  { label: "Shipping Policy", href: "/legal/shipping" },
  { label: "Warranty", href: "/legal/warranty" },
];

const PAYMENTS = ["UPI", "Visa", "Mastercard", "RuPay", "Amex", "Net Banking", "EMI", "Wallets"];

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-legal-top">
          <p>
            <strong>Amaira</strong> is an independent Apple Premium Reseller. Apple, iPhone, iPad, Mac,
            MacBook, Apple Watch, AirPods, HomePod, AppleCare and the Apple logo are trademarks of
            Apple Inc., registered in the U.S. and other countries. This store is not operated by
            Apple Inc.
          </p>
          <p>
            All prices are in Indian Rupees and include GST. Product availability, specifications and
            prices are subject to change. Images shown are original illustrations, not photographs of
            the retail product.
          </p>
        </div>

        <div className="footer-cols">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="footer-col-title">{col.title}</p>
              <ul className="footer-col">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="footer-col-title">Visit us</p>
            <ul className="footer-col">
              <li>{STORE.address.line1}</li>
              <li>{STORE.address.line2}</li>
              <li>
                {STORE.address.city} {STORE.address.pincode}
              </li>
              <li>
                <a href={STORE.phoneHref}>{STORE.phone}</a>
              </li>
              <li>
                <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {STORE.legalName}. All rights reserved.
          </p>
          <ul className="footer-bottom-links">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="footer-pay" aria-label="Accepted payment methods">
            {PAYMENTS.map((p) => (
              <span className="footer-pay-chip" key={p}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
