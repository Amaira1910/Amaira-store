# Amaira — Apple Premium Reseller storefront

The website for **Amaira**, an Apple Premium Reseller at
52, Rishabh Arcade, Sanjaynagar Main Road, Ashwathnagar, Bengaluru 560094 · +91 99003 30022.

A full storefront: browsable catalogue, configurable products, a bag that survives a
refresh, a Razorpay checkout that prices every order on the server, plus store, service,
trade-in, finance, business, education, support and legal pages.

---

## Running it

```bash
npm install
cp .env.example .env.local     # then fill in the Razorpay keys — see below
npm run dev                    # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript, no emit |
| `npm run icons` | Re-rasterises `public/icon.svg` into the PNG icon sizes |
| `npm run linkcheck` | Crawls every internal link; reports 404s, missing `<h1>`s, unlabelled controls |
| `npm run shots` | Renders pages to `./screenshots` for a visual review |
| `npm run mock:razorpay` | A stand-in payment gateway, for testing checkout without live keys |

The last three need `playwright` (a dev dependency) and a Chromium. Set `CHROMIUM_PATH`
if yours is not where Playwright installs it.

---

## Payments

Checkout uses **Razorpay** — UPI, cards, net banking, wallets and EMI, which is what
customers in India actually reach for.

### Switching it on

1. Create an account at [dashboard.razorpay.com](https://dashboard.razorpay.com) and
   complete KYC.
2. **Settings → API Keys** — generate a key pair. Test keys start `rzp_test_`, live keys
   `rzp_live_`.
3. Put them in `.env.local` (and in your host's environment for production):

   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   RAZORPAY_WEBHOOK_SECRET=whatever-you-set-below
   ```

4. **Settings → Webhooks** — add `https://your-domain/api/razorpay/webhook`, set a secret,
   and subscribe to `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`.

Until the keys are set, checkout tells the customer to phone the shop rather than failing
silently.

### How the money path is secured

- **The server prices every order from the catalogue.** Prices in the request body are
  read and thrown away. A tampered bag claiming an iPhone costs ₹1 is charged the real
  ₹1,49,900 — `lib/pricing.ts` recomputes from `data/`, and rejects unknown products,
  invalid options, silly quantities and made-to-order items.
- **AppleCare+ is never a client-supplied number** — it is taken from the catalogue or
  treated as zero.
- **Signatures are verified twice**: the Checkout response (`/api/razorpay/verify`) and
  the webhook (`/api/razorpay/webhook`), both with constant-time comparison.
- **Card details never touch this server.** They are entered inside Razorpay's window.

### Testing checkout without live keys

```bash
npm run mock:razorpay &                     # stands in for api.razorpay.com
RAZORPAY_KEY_ID=rzp_test_FAKE \
RAZORPAY_KEY_SECRET=fakesecret \
RAZORPAY_WEBHOOK_SECRET=hooksecret \
RAZORPAY_API_BASE=http://127.0.0.1:4545/v1 \
npm start
```

`RAZORPAY_API_BASE` exists only for this. Leave it unset everywhere real.

---

## ⚠️ Before you take real money

Three things are deliberately unfinished, because each needs a decision only you can make.

### 1. Orders are stored in memory and will be lost

`lib/orders.ts` keeps orders in a `Map`. That is fine in development and on a single
always-on server; it loses every order on restart, and on a serverless host it loses them
between requests. **Replace those four functions with a database** — Postgres, Supabase,
Firestore, anything durable — before launch. Nothing else needs to change; every call site
goes through that one interface.

### 2. Nothing is emailed

`app/api/enquiry/route.ts` validates contact-form submissions and writes them to the
server log. No one at the shop will see them until you wire a transport (Resend, SES,
Postmark, or a webhook into whatever you already use). The same applies to order
confirmations in the webhook route.

### 3. Catalogue prices and specs need checking against your price list

Every product file in `data/products/` carries a `VERIFY` note at the top. The models,
prices, storage tiers and specifications were set from the line-up current at build time
and **must be reconciled with your live APR price list** before go-live. They are all in
one place so this is an afternoon's work, not an archaeology project.

Also worth a look:

- `data/store.ts` — hours, phone, email and the map pin. The coordinates are approximate;
  replace them with the exact pin from your Google Business Profile.
- `data/tradein.ts` — trade-in values. Indicative, and they move fast. Review monthly.
- `.env.example` → `STORE_GSTIN` — your GSTIN, for invoices.

---

## Product imagery

Every product picture on this site is **drawn in code**, not photographed —
`components/DeviceArt.tsx` renders each device as an SVG from its finish colour. That
means one file to restyle, perfect sharpness at any size, a few KB instead of a few
hundred, and no dependency on imagery we are not licensed to use.

If you later get official product photography through the Apple Premium Reseller channel,
swap the `<DeviceArt>` call sites for `<Image>`. The props already carry everything a
filename would need. The footer and Terms of Sale both state plainly that the images are
illustrations.

---

## Layout

```
app/
  page.tsx                     Home
  shop/[category]/             Category listing (filters, sort)
  shop/[category]/[slug]/      Product detail — configure, EMI, add to bag
  bag/  checkout/  order/[receiptId]/
  store/ services/ trade-in/ finance/ business/ education/ support/ contact/ about/
  legal/{privacy,terms,returns,shipping,warranty}/
  api/razorpay/{order,verify,webhook}/    Payment endpoints
  api/enquiry/                            Contact-form intake
  sitemap.ts  robots.ts  manifest.ts

components/
  DeviceArt.tsx                Parametric SVG product renders
  SiteHeader.tsx               Nav, mega menu, search, mobile drawer
  ProductDetail.tsx            Buy box — colour, storage, AppleCare+, EMI
  CategoryListing.tsx          Client-side filtering and sort
  CheckoutForm.tsx             Checkout + Razorpay handoff

data/
  products/*.ts                The catalogue — edit prices here
  categories.ts  palettes.ts  store.ts  tradein.ts

lib/
  pricing.ts                   Server-side repricing. The security boundary.
  razorpay.ts                  Gateway calls and signature verification
  orders.ts                    Order store (see the warning above)
  cart.tsx  money.ts  seo.ts  nav.ts  format.ts  color.ts  types.ts

styles/
  tokens.css                   Colour, type, spacing, motion
  base.css  ui.css  layout.css  pages.css
```

### Design system

`styles/tokens.css` is the single source of truth. Change a token there and it propagates
everywhere: the palette is near-black text on paper-white and mist-grey, with one
saturated blue for action and nothing else competing for attention. Type tightens its
tracking as it grows, the way Apple's does. Real SF Pro is used on Apple hardware; Inter
carries everything else.

---

## Deploying

Works on any host that runs Next.js. Vercel is the least effort:

1. Push this repository and import it at [vercel.com/new](https://vercel.com/new).
2. Add the environment variables from `.env.example` in the project settings.
3. Set `NEXT_PUBLIC_SITE_URL` to your real domain — canonical URLs, the sitemap and
   Open Graph tags all read it.
4. Point your domain at it, then add the live webhook URL in Razorpay.

Remember the in-memory order store: on Vercel, wire a database **before** going live.

---

## Legal note

Amaira is an independent business. Apple, iPhone, iPad, Mac, MacBook, Apple Watch,
AirPods, HomePod, AppleCare and the Apple logo are trademarks of Apple Inc., registered in
the U.S. and other countries. This store is not operated by Apple Inc. The site says so in
the footer and on the About page.
