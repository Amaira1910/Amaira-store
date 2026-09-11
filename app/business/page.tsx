import type { Metadata } from "next";
import Crumbs from "@/components/Crumbs";
import SectionHead from "@/components/SectionHead";
import ContactForm from "@/components/ContactForm";
import { IconCard, IconShield, IconTools, IconTruck } from "@/components/Icons";
import { STORE } from "@/data/store";

export const metadata: Metadata = {
  title: "Amaira for Business",
  description:
    "Bulk Apple hardware, GST invoicing, deployment and on-site support for Bengaluru businesses. Talk to Amaira, Apple Premium Reseller in Sanjaynagar.",
  alternates: { canonical: "/business" },
};

export default function BusinessPage() {
  return (
    <>
      <div className="page">
        <Crumbs trail={[{ name: "Home", href: "/" }, { name: "Business", href: "/business" }]} />
        <header style={{ paddingBlock: "var(--s-5) var(--s-7)", maxWidth: "62ch" }}>
          <p className="t-body-sm amber" style={{ fontWeight: 600, marginBottom: 8 }}>For organisations</p>
          <h1 className="t-display balance">Kitting out a team, not just a desk.</h1>
          <p className="t-body-lg muted pretty" style={{ marginTop: "var(--s-4)" }}>
            Whether it is five MacBooks for a new studio or a hundred iPhones for a field team, we
            quote properly, invoice properly, and stay around afterwards.
          </p>
        </header>
      </div>

      <section style={{ paddingBottom: "var(--s-8)" }}>
        <div className="page">
          <div className="grid grid-2">
            {[
              { icon: <IconCard size={24} />, title: "GST invoicing and input credit", copy: "Every order is invoiced to your company with your GSTIN, so you can claim input tax credit in full. We can raise a proforma for your finance team first.", id: "gst" },
              { icon: <IconTruck size={24} />, title: "Bulk pricing and staged delivery", copy: "Volume pricing on orders of five units and up, with delivery staged across locations or dates to match your onboarding.", id: "bulk" },
              { icon: <IconTools size={24} />, title: "Deployment and setup", copy: "Devices arrive updated, enrolled and labelled. We can pre-configure Apple Business Manager, MDM enrolment, and your standard app set." },
              { icon: <IconShield size={24} />, title: "Support that answers", copy: "A named person, a direct number, and swap units for critical roles so nobody sits idle waiting on a repair." },
            ].map((t) => (
              <div className="card card-bordered" key={t.title} id={t.id} style={{ padding: "var(--s-6)" }}>
                <span style={{ color: "var(--blue)", display: "block", marginBottom: 12 }}>{t.icon}</span>
                <h2 className="t-headline">{t.title}</h2>
                <p className="t-body-sm muted pretty" style={{ marginTop: 10 }}>{t.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-mist">
        <div className="page reveal" style={{ maxWidth: 720 }}>
          <SectionHead
            title="Tell us what you need"
            sub="Send the shape of it and we will come back with a written quote, usually the same working day."
          />
          <ContactForm
            kind="business"
            phone={STORE.phone}
            phoneHref={STORE.phoneHref}
            email={STORE.email}
          />
        </div>
      </section>
    </>
  );
}
