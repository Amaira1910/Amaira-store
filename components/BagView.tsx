"use client";

import Link from "next/link";
import DeviceArt from "@/components/DeviceArt";
import { IconGift, IconMinus, IconPin, IconPlus, IconShield, IconTruck } from "@/components/Icons";
import { useCart } from "@/lib/cart";
import { inr, noCostEmi } from "@/lib/money";

export default function BagView() {
  const { lines, ready, subtotal, setQty, remove, count } = useCart();

  if (!ready) {
    return (
      <div className="empty-state">
        {/* Keeps exactly one h1 on the page in every state, including the
            server-rendered one before the stored bag has loaded. */}
        <h1 className="sr-only">Your bag</h1>
        <span className="spinner" style={{ margin: "0 auto", color: "var(--ink-3)" }} />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="empty-state">
        <h1 className="t-title" style={{ marginBottom: "var(--s-3)" }}>Your bag is empty.</h1>
        <p className="t-body-lg muted pretty" style={{ maxWidth: "44ch", margin: "0 auto" }}>
          Nothing in here yet. Have a look at what is in stock at Sanjaynagar today.
        </p>
        <div className="row-wrap" style={{ justifyContent: "center", marginTop: "var(--s-6)" }}>
          <Link href="/shop/iphone" className="btn">Shop iPhone</Link>
          <Link href="/shop" className="btn btn-secondary">Browse everything</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header style={{ paddingBlock: "var(--s-4) var(--s-7)" }}>
        <h1 className="t-display balance">
          Your bag total is {inr(subtotal)}.
        </h1>
        <p className="t-body-lg muted" style={{ marginTop: "var(--s-3)" }}>
          Free delivery across Bengaluru, and free returns within 7 days.
        </p>
      </header>

      <div className="bag-layout">
        <section aria-label={`${count} item${count === 1 ? "" : "s"} in your bag`}>
          {lines.map((l) => (
            <article className="bag-line" key={l.key}>
              <div className="bag-line-art">
                <DeviceArt
                  kind={l.art}
                  hex={l.colorHex}
                  accent={l.colorAccent}
                  screen={l.colorScreen}
                  label={`${l.name} in ${l.colorName}`}
                />
              </div>

              <div>
                <div className="spread" style={{ alignItems: "flex-start" }}>
                  <div className="grow">
                    <h2 className="bag-line-name">
                      <Link href={`/shop/${l.category ?? "accessories"}/${l.slug}`}>{l.name}</Link>
                    </h2>
                    <p className="bag-line-meta">
                      {[l.colorName, l.storageLabel, l.sizeLabel].filter(Boolean).join(" · ")}
                    </p>
                    {l.care ? (
                      <p className="bag-line-meta">
                        <IconShield size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> AppleCare+ · {inr(l.care)}/year
                      </p>
                    ) : null}
                    {l.engraving ? (
                      <p className="bag-line-meta">
                        <IconGift size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Engraving: “{l.engraving}”
                      </p>
                    ) : null}
                  </div>
                  <strong className="tnum nowrap">{inr((l.unitPrice + (l.care ?? 0)) * l.qty)}</strong>
                </div>

                <div className="bag-line-foot">
                  <div className="stepper">
                    <button
                      type="button"
                      aria-label={`Reduce quantity of ${l.name}`}
                      onClick={() => setQty(l.key, l.qty - 1)}
                    >
                      <IconMinus size={15} />
                    </button>
                    <span aria-live="polite">{l.qty}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${l.name}`}
                      disabled={l.qty >= 10}
                      onClick={() => setQty(l.key, l.qty + 1)}
                    >
                      <IconPlus size={15} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="t-body-sm"
                    style={{ color: "var(--link)" }}
                    onClick={() => remove(l.key)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}

          <div className="stack-sm" style={{ marginTop: "var(--s-6)" }}>
            <div className="notice">
              <IconTruck size={18} />
              <span><strong>Free delivery in Bengaluru.</strong> Most orders arrive the same or next day.</span>
            </div>
            <div className="notice">
              <IconPin size={18} />
              <span><strong>Or collect in store</strong> at Sanjaynagar Main Road, usually within two hours.</span>
            </div>
          </div>
        </section>

        <aside>
          <div className="summary">
            <h2 className="t-headline" style={{ marginBottom: "var(--s-4)" }}>Summary</h2>
            <div className="summary-row">
              <span className="muted">Subtotal</span>
              <span className="tnum">{inr(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span className="muted">Delivery</span>
              <span className="green">Free</span>
            </div>
            <div className="summary-row">
              <span className="muted">GST</span>
              <span className="muted t-caption">Included</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span className="tnum">{inr(subtotal)}</span>
            </div>

            {subtotal >= 6000 && (
              <p className="t-caption muted" style={{ marginTop: "var(--s-3)" }}>
                Or {inr(noCostEmi(subtotal, 12))}/month for 12 months at no cost.{" "}
                <Link href="/finance">How EMI works ›</Link>
              </p>
            )}

            <Link href="/checkout" className="btn btn-block btn-lg" style={{ marginTop: "var(--s-5)" }}>
              Check Out
            </Link>
            <Link href="/shop" className="btn btn-quiet btn-block" style={{ marginTop: "var(--s-3)" }}>
              Continue shopping
            </Link>

            <p className="t-caption muted center" style={{ marginTop: "var(--s-4)" }}>
              Prefer to pay in store? Bring this bag to Sanjaynagar and we will match it exactly.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
