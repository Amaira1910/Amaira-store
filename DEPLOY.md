# Deploying Amaira

## The one thing that matters

The catalog lives in Git. **Prices, stock, orders and invoices live in a SQLite
file.** That file must sit on a disk that survives a restart, or every deploy
wipes your shop.

That rules out Vercel's default runtime — its filesystem is ephemeral and
per-invocation. It rules *in* Railway, Fly, Render, or any VPS.

---

## Railway (recommended)

Railway is a good fit: it gives you a persistent volume, a private network and
a domain, and the whole thing costs a few dollars a month at this scale.

### 1. Create the service

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

Railway reads `railway.json` and builds from the `Dockerfile`.

### 2. Attach a volume — do this before the first real order

Railway dashboard → your service → **Variables → Volumes → New Volume**

| Setting | Value |
|---|---|
| Mount path | `/data` |
| Size | 1 GB is plenty (the database is measured in megabytes) |

The Dockerfile already sets `DATABASE_PATH=/data/amaira.db` to match.

**Without this volume the database is recreated empty on every deploy.** The
app will look like it works — the catalog reseeds — and you will silently lose
every order.

### 3. Set the variables

```
NEXT_PUBLIC_SITE_URL=https://your-domain.in
DATABASE_PATH=/data/amaira.db

RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxx

ADMIN_EMAIL=you@amairastore.in
ADMIN_PASSWORD=a-long-passphrase-you-change-immediately
ADMIN_NAME=Ravi

SEED_OPENING_STOCK=0
STORE_GSTIN=29XXXXXXXXXXXZX
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are read **once**, on a database with no
users. Delete them after the first boot and change the password in the portal.

### 4. Point Razorpay's webhook at it

Razorpay dashboard → Settings → Webhooks → Add:

- URL: `https://your-domain.in/api/razorpay/webhook`
- Secret: the same string as `RAZORPAY_WEBHOOK_SECRET`
- Events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`

This is not optional. If a customer closes the tab mid-payment, the browser
never calls `/api/razorpay/verify` and **the webhook is the only way you find
out the money arrived.** Without it that order sits as `pending` forever and
the stock stays reserved.

### 5. Check it came up

```bash
curl https://your-domain.in/api/health
# {"ok":true,"skus":408,"payments":"configured", …}
```

`"payments":"not configured"` means the Razorpay variables have not landed.

---

## First run, in order

1. Deploy. The database is created and the catalog seeded (408 SKUs, zero stock).
2. Sign in at `/admin` and change your password.
3. `/admin/settings` — enter your GSTIN. **Invoices are not valid without it.**
4. `/admin/inventory` — receive your actual stock. Zero-stock products show as
   out of stock on the shop, which is correct until you do this.
5. Check prices against your live APR price list. The seeded figures need
   verifying — see the warnings at the top of `data/products/*.ts`.
6. Place one real order with a live key, on the cheapest accessory, and confirm:
   stock drops by one, the invoice number is issued, and the movement ledger
   shows the sale. Then refund it.

---

## Backups

The database is a single file. Back it up like one.

```bash
# On the host, or via `railway ssh`
sqlite3 /data/amaira.db ".backup /data/backup-$(date +%F).db"
```

Use `.backup`, not `cp` — the app runs in WAL mode and a plain copy of a live
database can be inconsistent.

Worth a daily cron. Losing this file means losing your order history and your
invoice series, and the invoice series is a statutory record.

---

## Other platforms

| Platform | Works? | Note |
|---|---|---|
| Railway | Yes | Volume at `/data` |
| Fly.io | Yes | `fly volumes create amaira_data --size 1`, mount at `/data` |
| Render | Yes | Persistent Disk at `/data` |
| VPS + Docker | Yes | `-v /srv/amaira:/data` |
| Vercel | **No, not as-is** | Ephemeral filesystem. Swap the driver in `lib/db/client.ts` for Turso (libSQL — SQLite-compatible, so the queries are unchanged) and it works. |

---

## Moving off SQLite later

Only `lib/db/client.ts` knows what the database is. Everything above it uses
the repository functions in `lib/db/`.

- **Turso / libSQL** — nearly a drop-in. Same SQL dialect.
- **Postgres** — the SQL is standard except `datetime('now', ...)` and
  `INTEGER PRIMARY KEY AUTOINCREMENT`. A day's work.

You will not need to for a long time. A single store writes a few dozen rows a
day, and SQLite handles that several orders of magnitude over.
