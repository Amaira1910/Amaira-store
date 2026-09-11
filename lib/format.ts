/* Small shared formatters and helpers. */
import type { Product, StockState } from "@/lib/types";
import { STORE } from "@/data/store";

export function stockLabel(stock: StockState): { text: string; className: string } {
  switch (stock) {
    case "in":
      return { text: "In stock at Sanjaynagar", className: "badge badge-stock" };
    case "low":
      return { text: "Low stock — call to hold one", className: "badge badge-new" };
    case "order":
      return { text: "Available to order", className: "badge badge-out" };
  }
}

/** A plain-words delivery promise, computed from the product's lead time. */
export function deliveryPromise(p: Product): string {
  const days = p.leadTimeDays ?? 2;
  if (days <= 1) return `Free delivery in ${STORE.delivery.cityName} tomorrow`;
  if (days <= 3) return `Free delivery in ${days} working days`;
  return `Usually ships in ${days} working days`;
}

export function pickupPromise(p: Product): string {
  if (p.stock === "in") return `Ready for pickup in about ${STORE.delivery.pickupReadyHours} hours`;
  if (p.stock === "low") return "Call ahead and we will hold one for you";
  return "We will call you the moment it lands";
}

/** Which weekday is it in India, regardless of where the server sits. */
export function istWeekday(now = new Date()): number {
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return ist.getDay();
}

export function istMinutes(now = new Date()): number {
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return ist.getHours() * 60 + ist.getMinutes();
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Open right now? Used for the "Open until 9 pm" line on the store page. */
export function openState(now = new Date()): { open: boolean; label: string } {
  const day = istWeekday(now);
  const today = STORE.hours[day];
  const mins = istMinutes(now);
  const open = mins >= toMinutes(today.open) && mins < toMinutes(today.close);
  const pretty = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    const ampm = h >= 12 ? "pm" : "am";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  return open
    ? { open: true, label: `Open now until ${pretty(today.close)}` }
    : { open: false, label: `Closed — opens ${pretty(today.open)}` };
}

/** Title-cases a slug for breadcrumbs when no better label exists. */
export function titleFromSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
