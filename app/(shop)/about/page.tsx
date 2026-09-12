import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/Crumbs";
import SectionHead from "@/components/SectionHead";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "About Amaira",
  description:
    "Amaira is an Apple Premium Reseller on Sanjaynagar Main Road, Bengaluru. Here is how we work, and what we will and will not do.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <div className="page">
        <Crumbs trail={[{ name: "Home", href: "/" }, { name: "About", href: "/about" }]} />
        <header style={{ paddingBlock: "var(--s-5) var(--s-7)", maxWidth: "62ch" }}>
          <p className="t-body-sm amber" style={{ fontWeight: 600, marginBottom: 8 }}>{STORE.descriptor}</p>
          <h1 className="t-display balance">A shop, not a warehouse.</h1>
          <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
            {STORE.name} sits on Sanjaynagar Main Road in Ashwathnagar. We sell the full Apple
            line-up, we set it up with you before you leave, and we are still here when something
            goes wrong eighteen months later.
          </p>
        </header>
      </div>

      <section className="section-tight">
        <div className="page prose">
          <h2>What we are</h2>
          <p>
            An Apple Premium Reseller is an independent shop authorised by Apple to sell and service
            Apple products. The hardware is identical to Apple&rsquo;s own, the warranty is identical,
            and the prices are Apple&rsquo;s. What differs is who you deal with — and whether they
            remember you the second time.
          </p>

          <h2>How we work</h2>
          <p><strong>We tell you the cheaper answer when it is the right one.</strong> If the Air does everything you need, we will say so rather than sell you the Pro. It costs us margin today and earns the next three purchases.</p>
          <p><strong>Nothing leaves the shop unset-up.</strong> Data transferred, Apple ID working, eSIM live, apps on. However long it takes, at no charge.</p>
          <p><strong>We quote before we open anything.</strong> Diagnostics are free. You hear the number before we start, and we do not start until you agree.</p>
          <p><strong>Genuine parts only.</strong> There is a cheaper way to fix a screen. We do not do it.</p>

          <h2>What we will not do</h2>
          <ul>
            <li>Sell you a grey-market or imported unit and call it warranted.</li>
            <li>Bundle a case and a screen guard into the price without telling you.</li>
            <li>Quote one trade-in value online and a lower one at the counter without showing you exactly what changed.</li>
            <li>Pass your phone number to anybody.</li>
          </ul>

          <h2>Where to find us</h2>
          <p>
            {STORE.addressLine}. Open Monday to Saturday 10am to 9pm, and Sunday 11am to 8pm. Call{" "}
            <a href={STORE.phoneHref}>{STORE.phone}</a> or{" "}
            <Link href="/store">get directions</Link>.
          </p>

          <h2>The legal bit</h2>
          <p>
            Amaira is an independent business. Apple, iPhone, iPad, Mac, MacBook, Apple Watch,
            AirPods, HomePod, AppleCare and the Apple logo are trademarks of Apple Inc., registered
            in the U.S. and other countries. This store is not operated by Apple Inc.
          </p>
        </div>
      </section>

      <section className="section section-mist">
        <div className="page reveal center">
          <SectionHead title="Come and see for yourself" align="center" />
          <div className="row-wrap" style={{ justifyContent: "center", marginTop: "var(--s-5)" }}>
            <Link href="/store" className="btn">Find the store</Link>
            <Link href="/shop" className="btn btn-secondary">Browse the line-up</Link>
          </div>
        </div>
      </section>
    </>
  );
}
