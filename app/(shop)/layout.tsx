import Link from "next/link";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ToastHost from "@/components/ToastHost";
import Reveal from "@/components/Reveal";
import DevicePosture from "@/components/DevicePosture";
import ServiceWorker from "@/components/ServiceWorker";
import { CartProvider } from "@/lib/cart";
import { buildMenu, buildSearchIndex } from "@/lib/nav";

/**
 * The storefront's chrome. Scoped to this route group so the admin portal —
 * which is a different application with a different audience — does not
 * inherit the shop's navigation, promo bar, footer or cart provider.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const menu = buildMenu();
  const index = buildSearchIndex();

  return (
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
  );
}
