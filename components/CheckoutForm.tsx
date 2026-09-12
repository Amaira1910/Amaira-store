"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useMemo, useRef, useState } from "react";
import DeviceArt from "@/components/DeviceArt";
import { IconAlert, IconLock, IconPin, IconTruck } from "@/components/Icons";
import { useCart } from "@/lib/cart";
import { inr, noCostEmi } from "@/lib/money";
import { INDIAN_STATES } from "@/lib/format";
import type { Fulfilment } from "@/lib/types";

/* The global Razorpay Checkout injects. Typed loosely — only what we call. */
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

type Errors = Partial<Record<string, string>>;

export default function CheckoutForm({ storePhone, storeAddress }: { storePhone: string; storeAddress: string }) {
  const { lines, ready, subtotal, clear } = useCart();
  const router = useRouter();

  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    line1: "", line2: "", city: "Bengaluru", state: "Karnataka", pincode: "",
    gstin: "",
  });
  const [wantsGst, setWantsGst] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);
  const scriptLoaded = useRef(false);

  /* Editing a field clears its error. Leaving a corrected value marked red
     while the user types is the fastest way to make a form feel broken. */
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const emiMonthly = useMemo(() => noCostEmi(subtotal, 12), [subtotal]);

  function validate(): boolean {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "Please enter your first name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) e.phone = "Enter a 10-digit Indian mobile number.";
    if (fulfilment === "delivery") {
      if (!form.line1.trim()) e.line1 = "Enter your address.";
      if (!form.city.trim()) e.city = "Enter your city.";
      if (!/^[1-9]\d{5}$/.test(form.pincode.trim())) e.pincode = "Enter a valid 6-digit PIN code.";
    }
    if (wantsGst && !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]Z[A-Z\d]$/.test(form.gstin.trim().toUpperCase())) {
      e.gstin = "Enter a valid 15-character GSTIN, or untick the box.";
    }
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>(".has-error input, .has-error select")?.focus();
      return false;
    }
    return true;
  }

  async function pay() {
    setFatal(null);
    if (!validate()) return;
    if (!window.Razorpay) {
      setFatal("The payment window could not load. Check your connection and try again, or call the store.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          fulfilment,
          contact: {
            firstName: form.firstName, lastName: form.lastName,
            email: form.email, phone: form.phone,
          },
          address: fulfilment === "delivery"
            ? { line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode }
            : undefined,
          gstin: wantsGst ? form.gstin : "",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFatal(data.error ?? "We could not start that payment. Please try again.");
        setBusy(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Amaira",
        description: `Order ${data.receiptId}`,
        order_id: data.orderId,
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          contact: form.phone,
        },
        notes: { receiptId: data.receiptId },
        theme: { color: "#0071e3" },
        modal: {
          ondismiss: () => setBusy(false),
        },
        handler: async (response: Record<string, string>) => {
          try {
            const verify = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, receiptId: data.receiptId }),
            });
            const vr = await verify.json();
            if (vr.ok) {
              clear();
              router.push(`/order/${data.receiptId}`);
            } else {
              setBusy(false);
              setFatal(vr.error ?? "We could not confirm that payment. Please call the store before trying again.");
            }
          } catch {
            setBusy(false);
            setFatal("Your payment went through but we could not confirm it here. Please call the store with your payment reference.");
          }
        },
      });

      rzp.on("payment.failed", (resp: unknown) => {
        setBusy(false);
        const r = resp as { error?: { description?: string } };
        setFatal(r.error?.description ?? "That payment did not go through. No money has been taken.");
      });

      rzp.open();
    } catch {
      setBusy(false);
      setFatal("Something went wrong on our side. Please try again, or call the store.");
    }
  }

  if (!ready) {
    return <div className="empty-state"><span className="spinner" style={{ margin: "0 auto", color: "var(--ink-3)" }} /></div>;
  }

  if (lines.length === 0) {
    return (
      <div className="empty-state">
        <h1 className="t-title" style={{ marginBottom: "var(--s-3)" }}>There is nothing to check out.</h1>
        <p className="muted">Your bag is empty.</p>
        <Link href="/shop" className="btn" style={{ marginTop: "var(--s-5)" }}>Start shopping</Link>
      </div>
    );
  }

  const field = (
    name: keyof typeof form,
    label: string,
    type = "text",
    autoComplete?: string,
    inputMode?: "text" | "tel" | "email" | "numeric",
  ) => (
    <label className={`field${errors[name] ? " has-error" : ""}`}>
      <input
        className="field-input"
        type={type}
        value={form[name]}
        onChange={set(name)}
        placeholder=" "
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `err-${name}` : undefined}
      />
      <span className="field-label">{label}</span>
      {errors[name] && (
        <span className="field-error" id={`err-${name}`}>
          <IconAlert size={14} /> {errors[name]}
        </span>
      )}
    </label>
  );

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => { scriptLoaded.current = true; }}
      />

      <header style={{ paddingBlock: "var(--s-4) var(--s-7)" }}>
        <h1 className="t-display balance">Check out</h1>
        <p className="t-body-lg muted" style={{ marginTop: "var(--s-3)" }}>
          Paying {inr(subtotal)}. Secured by Razorpay — we never see your card details.
        </p>
      </header>

      <div className="checkout-layout">
        <div>
          {/* 1 — fulfilment */}
          <section className="checkout-step">
            <h2 className="checkout-step-title"><span className="checkout-step-num">1</span> How would you like it?</h2>
            <label className={`radio-card${fulfilment === "delivery" ? " is-on" : ""}`}>
              <input type="radio" name="fulfilment" checked={fulfilment === "delivery"} onChange={() => setFulfilment("delivery")} />
              <span>
                <span className="radio-card-title"><IconTruck size={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} />Deliver to me — free</span>
                <span className="radio-card-note">Same or next day across Bengaluru. 2–5 working days elsewhere in India.</span>
              </span>
            </label>
            <label className={`radio-card${fulfilment === "pickup" ? " is-on" : ""}`}>
              <input type="radio" name="fulfilment" checked={fulfilment === "pickup"} onChange={() => setFulfilment("pickup")} />
              <span>
                <span className="radio-card-title"><IconPin size={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} />Collect from the store</span>
                <span className="radio-card-note">{storeAddress}. Usually ready in about two hours — we will text you.</span>
              </span>
            </label>
          </section>

          {/* 2 — contact */}
          <section className="checkout-step">
            <h2 className="checkout-step-title"><span className="checkout-step-num">2</span> Who is it for?</h2>
            <div className="fieldset-grid fieldset-grid-2">
              {field("firstName", "First name", "text", "given-name")}
              {field("lastName", "Last name", "text", "family-name")}
            </div>
            {field("email", "Email — for your invoice", "email", "email", "email")}
            {field("phone", "Mobile number", "tel", "tel", "tel")}
            <p className="t-caption muted" style={{ marginTop: 10 }}>
              We use your number only for delivery updates and to reach you about this order.
            </p>
          </section>

          {/* 3 — address */}
          {fulfilment === "delivery" && (
            <section className="checkout-step">
              <h2 className="checkout-step-title"><span className="checkout-step-num">3</span> Where should it go?</h2>
              {field("line1", "Flat, house, building", "text", "address-line1")}
              {field("line2", "Area, street, landmark (optional)", "text", "address-line2")}
              <div className="fieldset-grid fieldset-grid-2">
                {field("city", "City", "text", "address-level2")}
                <label className={`field field-select${errors.state ? " has-error" : ""}`}>
                  <select className="field-input" value={form.state} onChange={set("state")} autoComplete="address-level1">
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="field-label" style={{ transform: "translateY(-9px) scale(0.75)" }}>State</span>
                </label>
              </div>
              {field("pincode", "PIN code", "text", "postal-code", "numeric")}
            </section>
          )}

          {/* 4 — GST */}
          <section className="checkout-step">
            <h2 className="checkout-step-title">
              <span className="checkout-step-num">{fulfilment === "delivery" ? 4 : 3}</span> Invoice
            </h2>
            <label className="checkbox" style={{ marginBottom: "var(--s-3)" }}>
              <input type="checkbox" checked={wantsGst} onChange={(e) => setWantsGst(e.target.checked)} />
              <span>
                I need a GST invoice for a business
                <span className="t-caption muted" style={{ display: "block" }}>
                  Claim input credit. We will raise the invoice in your company&rsquo;s name.
                </span>
              </span>
            </label>
            {wantsGst && field("gstin", "GSTIN", "text", "off")}
          </section>

          {fatal && (
            <div className="notice notice-red" style={{ marginTop: "var(--s-5)" }}>
              <IconAlert size={18} />
              <span>{fatal} If anything looks wrong, call us on <a href={`tel:${storePhone.replace(/\s/g, "")}`}>{storePhone}</a>.</span>
            </div>
          )}
        </div>

        {/* summary */}
        <aside>
          <div className="summary">
            <h2 className="t-headline" style={{ marginBottom: "var(--s-3)" }}>Your order</h2>

            {lines.map((l) => (
              <div className="order-mini" key={l.key}>
                <span className="order-mini-art">
                  <DeviceArt kind={l.art} hex={l.colorHex} accent={l.colorAccent} screen={l.colorScreen} label="" />
                </span>
                <span className="grow">
                  <span className="t-body-sm" style={{ fontWeight: 500, display: "block" }}>{l.name}</span>
                  <span className="t-caption muted">
                    {[l.colorName, l.storageLabel, l.sizeLabel].filter(Boolean).join(" · ")} · Qty {l.qty}
                  </span>
                </span>
                <span className="t-body-sm tnum nowrap">{inr((l.unitPrice + (l.care ?? 0)) * l.qty)}</span>
              </div>
            ))}

            <div style={{ marginTop: "var(--s-4)", paddingTop: "var(--s-4)", borderTop: "1px solid var(--hairline)" }}>
              <div className="summary-row"><span className="muted">Subtotal</span><span className="tnum">{inr(subtotal)}</span></div>
              <div className="summary-row"><span className="muted">Delivery</span><span className="green">Free</span></div>
              <div className="summary-row"><span className="muted">GST</span><span className="muted t-caption">Included</span></div>
              <div className="summary-total"><span>Total</span><span className="tnum">{inr(subtotal)}</span></div>
            </div>

            {subtotal >= 6000 && (
              <p className="t-caption muted" style={{ marginTop: "var(--s-3)" }}>
                Choose No-cost EMI in the payment window for {inr(emiMonthly)}/month over 12 months.
              </p>
            )}

            <button type="button" className="btn btn-block btn-lg" style={{ marginTop: "var(--s-5)" }} onClick={pay} disabled={busy}>
              {busy ? (<><span className="spinner" /> Opening payment…</>) : (<><IconLock size={17} /> Pay {inr(subtotal)}</>)}
            </button>

            <p className="t-caption muted center" style={{ marginTop: "var(--s-4)" }}>
              UPI, cards, net banking, wallets and EMI. By paying you accept our{" "}
              <Link href="/legal/terms">Terms of Sale</Link>.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
