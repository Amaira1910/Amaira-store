# Amaira — Apple Premium Reseller

The storefront and back office for **Amaira**, an Apple Premium Reseller at
52 Rishabh Arcade, Sanjaynagar Main Road, Ashwathnagar, Bengaluru 560094.
Phone **+91 99003 30022**.

A customer-facing shop in Apple's design language, plus the operational half a
real shop needs: stock that cannot be oversold, GST invoices that add up, and a
portal to run both from.

---

## What is here

**Storefront**
- 44 products across iPhone, Mac, iPad, Watch, Audio, TV & Home and
  Accessories — 408 buyable SKUs once finish, capacity and size are combined.
- Product pages with live stock: sold-out finishes are struck through, short
  configurations say how many are left, and the buy button reflects reality.
- Bag that survives a reload, filtered category pages, search, no-cost EMI
  calculator, trade-in estimator.
- Store, service, finance, business, education, support and contact pages, plus
  five legal pages written to be read rather than skipped.

**Checkout**
- Razorpay — UPI, cards, net banking, wallets and EMI.
- **Prices are recomputed on the server.** A tampered bag claiming an iPhone
  costs ₹1 is charged the real ₹1,89,900.
- Stock is reserved before the payment window opens, so two customers cannot
  buy the same last unit. The second gets a clear message, not a failed order.
- GST tax invoice issued automatically on payment, printable to A4.

**Admin portal** (`/admin`)
- Dashboard: revenue, orders to fulfil, low stock, 14-day chart, best sellers.
- Inventory: receive stock, run a stock-take, edit price, cost and barcode.
- Stock-take by camera in the iOS app — point at the box, adjust in two taps.
- Orders, invoices, customers, enquiries, settings.
- Every change to stock is written to an append-only ledger, attributed and
  timestamped.

**Platforms**
- Phone, tablet and desktop.
- **Foldable / dual-screen**: columns align to the physical screens using CSS
  viewport segments, so nothing is ever split by the hinge.
- Installable PWA with an offline catalog.
- Capacitor configured for an iOS build — see [APP_STORE.md](./APP_STORE.md).

---

## Running it

```bash
npm install
cp .env.example .env.local     # then fill in the values
npm run db:seed -- --stock 5   # catalog + 5 units of everything, to look around
npm run db:admin -- you@example.com "a long passphrase" "Your Name" owner
npm run dev
```

Then `http://localhost:3000`, and `http://localhost:3000/admin`.

Without Razorpay keys the shop browses normally and checkout says payment is
not switched on yet, rather than breaking.

| Script | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:seed` | Create schema, seed catalog. `-- --stock N` for opening stock |
| `npm run db:admin` | Create an admin user |
| `npm run db:stock` | Receive stock against a SKU from the CLI |
| `npm run icons` | Rasterise `public/icon.svg` into PNG app icons |

---

## How it is put together

Next.js 15 App Router · TypeScript · SQLite · hand-written CSS · Razorpay.

```
app/                  routes — storefront, /admin, /api
  admin/(portal)/     the back office, behind a session
  api/razorpay/       order · verify · webhook
components/           UI, including DeviceArt (all product imagery)
data/                 the catalog — editorial, in Git
  products/*.ts       one file per family
lib/
  db/                 schema, migrations, repositories
  pricing.ts          server-side repricing — the security boundary
  native.ts           camera, push, haptics, share; degrades on the web
styles/               tokens → base → ui → layout → pages → foldable
```

### Two deliberate decisions worth knowing

**1. Product imagery is drawn, not photographed.**
`components/DeviceArt.tsx` renders every product as a parametric SVG from its
finish colour. One file to restyle, crisp at any size, a few KB instead of a
few hundred, and no dependency on Apple's copyrighted press photography. If you
license official assets through the APR channel, swap the call sites for
`<Image>` — the props already carry what a filename would.

**2. Editorial content is in Git; operational data is in the database.**
Names, specs, taglines and finishes live in `data/` and change through a
reviewed commit. Price, cost, stock and barcode live in SQLite and change in
the portal, live, because a shop should not need a deploy to mark six iPhones
as received.

### Why SQLite

One store, a few dozen writes a day. SQLite gives real transactions with no
network hop per page render, and a backup is a file copy. It needs a persistent
disk, which rules out Vercel's default runtime — see [DEPLOY.md](./DEPLOY.md).
Only `lib/db/client.ts` knows what the database is, so Turso or Postgres drops
in without touching anything above it.

### How stock cannot be oversold

`available = on_hand − reserved`, enforced by CHECK constraints.

Stock moves in two steps, never one. Starting a payment **reserves**; only a
confirmed payment **commits**, decrementing on-hand and writing a ledger row.
An abandoned checkout releases its hold after 20 minutes. Both confirmation
paths — the browser's verify call and Razorpay's webhook — are idempotent,
because they race each other and both run.

---

## Verified

- Server-side repricing: a client claiming ₹1 is charged ₹1,89,900.
- Reservation blocks a second buyer of the last unit with a 409 and a
  plain-words message.
- Payment commits stock, writes one ledger row and issues one invoice.
- Replaying verify **and** webhook changes nothing — no double decrement.
- GST: intra-state splits CGST/SGST, Maharashtra gets IGST, and the tax lines
  always add back to the amount charged.
- Expired reservations return their stock.
- Forged payment and webhook signatures are rejected; genuine ones accepted.
- 80 internal URLs crawled: no broken links, no JS errors, one `<h1>` per page.
- Foldable: columns measured at exactly 430px / 430px with the 24px hinge left
  empty. (Verified by measurement — headless screenshots reset Chromium's
  display-feature emulation and cannot capture it.)

---

## Before you take real money

Four things, in order. All are flagged in the code.

1. **Verify every price and spec** against your live APR price list. The seeded
   figures are realistic, not authoritative — see the warnings at the top of
   each `data/products/*.ts`.
2. **Enter your GSTIN** at `/admin/settings`. Invoices are not valid without it.
3. **Have your CA check `data/hsn.ts`.** HSN classification is the seller's
   legal responsibility.
4. **Set up the Razorpay webhook.** If a customer closes the tab mid-payment
   it is the only way you learn the money arrived. See [DEPLOY.md](./DEPLOY.md).

Also outstanding, and honest about it:
- Enquiries are stored and shown in the portal, but **no email is sent**. Wire a
  transport in `app/api/enquiry/route.ts` if you want them pushed.
- Order confirmation emails are not implemented. Razorpay emails its own
  payment receipt; a branded confirmation is not sent.
- Push notifications are wired client-side only; sending needs an APNs key and
  a server-side dispatcher.
- The iOS project has **not** been generated or compiled — that needs macOS and
  Xcode. See [APP_STORE.md](./APP_STORE.md).

---

## Documentation

- **[DEPLOY.md](./DEPLOY.md)** — Railway, the volume you must attach, the
  webhook, backups, first-run order.
- **[APP_STORE.md](./APP_STORE.md)** — why a wrapped website is rejected, what
  clears Guideline 4.2, why Razorpay is *required* for physical goods, the
  privacy questionnaire, and the submission checklist.

---

## Legal

Amaira is an independent business. Apple, iPhone, iPad, Mac, MacBook, Apple
Watch, AirPods, HomePod, AppleCare and the Apple logo are trademarks of Apple
Inc., registered in the U.S. and other countries. This store is not operated by
Apple Inc. Use of Apple's marks is governed by your Apple Premium Reseller
agreement — read it before changing any branding.
