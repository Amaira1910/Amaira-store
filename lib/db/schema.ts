/* ==========================================================================
   Database schema, as an ordered list of migrations.

   Kept as TypeScript rather than .sql files so Next's server bundler always
   traces it — a stray .sql read from disk breaks the moment the app is
   deployed as a standalone build.

   Migrations are append-only. Never edit one that has shipped; add another.
   ========================================================================== */

export interface Migration {
  id: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    id: 1,
    name: "initial_schema",
    sql: /* sql */ `
    -- ---------------------------------------------------------------- catalog
    -- Mirrors the editorial catalog in data/ so the database can join and
    -- report on it. Content stays in Git; price and stock live here.
    CREATE TABLE products (
      slug          TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      category      TEXT NOT NULL,
      family        TEXT NOT NULL,
      art           TEXT NOT NULL,
      hsn           TEXT NOT NULL,
      gst_rate      REAL NOT NULL DEFAULT 18,
      active        INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_products_category ON products(category);

    -- One row per buyable combination of finish / capacity / size.
    CREATE TABLE skus (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      sku_code            TEXT NOT NULL UNIQUE,
      product_slug        TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
      color_id            TEXT NOT NULL,
      color_name          TEXT NOT NULL,
      storage_id          TEXT,
      storage_label       TEXT,
      size_id             TEXT,
      size_label          TEXT,
      price               INTEGER NOT NULL,          -- rupees, GST inclusive
      mrp                 INTEGER,
      cost_price          INTEGER,                   -- what Amaira paid; margin reporting
      stock_on_hand       INTEGER NOT NULL DEFAULT 0,
      stock_reserved      INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 2,
      barcode             TEXT,
      active              INTEGER NOT NULL DEFAULT 1,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
      -- Stock can never go negative, and we can never reserve what we do not have.
      CHECK (stock_on_hand >= 0),
      CHECK (stock_reserved >= 0),
      CHECK (stock_reserved <= stock_on_hand)
    );
    CREATE INDEX idx_skus_product ON skus(product_slug);
    CREATE INDEX idx_skus_active ON skus(active);
    CREATE INDEX idx_skus_barcode ON skus(barcode);

    -- Append-only ledger. Every change to stock_on_hand writes a row here, so
    -- "why is the count wrong?" is always answerable.
    CREATE TABLE stock_movements (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      sku_id        INTEGER NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
      delta         INTEGER NOT NULL,                -- + inward, - outward
      balance_after INTEGER NOT NULL,
      reason        TEXT NOT NULL,                   -- purchase|sale|return|adjustment|damage|stocktake
      ref_type      TEXT,                            -- order|invoice|manual
      ref_id        TEXT,
      note          TEXT,
      actor         TEXT,                            -- admin user email
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_movements_sku ON stock_movements(sku_id, created_at);
    CREATE INDEX idx_movements_created ON stock_movements(created_at);

    -- --------------------------------------------------------------- people
    CREATE TABLE customers (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT NOT NULL UNIQUE,
      phone       TEXT,
      first_name  TEXT,
      last_name   TEXT,
      gstin       TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_customers_phone ON customers(phone);

    -- --------------------------------------------------------------- orders
    CREATE TABLE orders (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id         TEXT NOT NULL UNIQUE,
      customer_id        INTEGER REFERENCES customers(id),
      status             TEXT NOT NULL DEFAULT 'pending',  -- pending|paid|failed|refunded|cancelled
      fulfilment         TEXT NOT NULL,                    -- delivery|pickup
      fulfilment_status  TEXT NOT NULL DEFAULT 'awaiting',  -- awaiting|packed|dispatched|delivered|collected
      channel            TEXT NOT NULL DEFAULT 'online',   -- online|counter
      subtotal           INTEGER NOT NULL,
      shipping           INTEGER NOT NULL DEFAULT 0,
      discount           INTEGER NOT NULL DEFAULT 0,
      total              INTEGER NOT NULL,
      razorpay_order_id  TEXT,
      razorpay_payment_id TEXT,
      contact_first_name TEXT NOT NULL,
      contact_last_name  TEXT,
      contact_email      TEXT NOT NULL,
      contact_phone      TEXT NOT NULL,
      address_line1      TEXT,
      address_line2      TEXT,
      city               TEXT,
      state              TEXT,
      pincode            TEXT,
      gstin              TEXT,
      place_of_supply    TEXT NOT NULL DEFAULT 'Karnataka',
      failure_reason     TEXT,
      notes              TEXT,
      created_at         TEXT NOT NULL DEFAULT (datetime('now')),
      paid_at            TEXT,
      updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_orders_status ON orders(status, created_at);
    CREATE INDEX idx_orders_razorpay ON orders(razorpay_order_id);
    CREATE INDEX idx_orders_created ON orders(created_at);
    CREATE INDEX idx_orders_phone ON orders(contact_phone);

    CREATE TABLE order_items (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      sku_id        INTEGER REFERENCES skus(id),
      sku_code      TEXT NOT NULL,
      product_slug  TEXT NOT NULL,
      name          TEXT NOT NULL,
      variant_label TEXT,
      unit_price    INTEGER NOT NULL,
      care_price    INTEGER NOT NULL DEFAULT 0,
      qty           INTEGER NOT NULL,
      line_total    INTEGER NOT NULL,
      hsn           TEXT NOT NULL,
      gst_rate      REAL NOT NULL,
      engraving     TEXT
    );
    CREATE INDEX idx_items_order ON order_items(order_id);

    -- Stock held for an unpaid order. Expires so an abandoned checkout does
    -- not lock a unit out of the shop forever.
    CREATE TABLE reservations (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      sku_id        INTEGER NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
      receipt_id    TEXT NOT NULL,
      qty           INTEGER NOT NULL,
      state         TEXT NOT NULL DEFAULT 'held',   -- held|committed|released
      expires_at    TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_reservations_receipt ON reservations(receipt_id);
    CREATE INDEX idx_reservations_state ON reservations(state, expires_at);

    -- ------------------------------------------------------------- invoices
    CREATE TABLE invoices (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no     TEXT NOT NULL UNIQUE,
      order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      financial_year TEXT NOT NULL,     -- e.g. 2026-27
      seq            INTEGER NOT NULL,
      issued_at      TEXT NOT NULL DEFAULT (datetime('now')),
      taxable_value  INTEGER NOT NULL,
      cgst           INTEGER NOT NULL DEFAULT 0,
      sgst           INTEGER NOT NULL DEFAULT 0,
      igst           INTEGER NOT NULL DEFAULT 0,
      total          INTEGER NOT NULL,
      place_of_supply TEXT NOT NULL,
      buyer_gstin    TEXT,
      status         TEXT NOT NULL DEFAULT 'issued',  -- issued|cancelled
      UNIQUE (financial_year, seq)
    );
    CREATE INDEX idx_invoices_order ON invoices(order_id);

    -- ----------------------------------------------------------------- auth
    CREATE TABLE admin_users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'staff',   -- owner|manager|staff
      active        INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );

    CREATE TABLE admin_sessions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash  TEXT NOT NULL UNIQUE,
      user_id     INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      expires_at  TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      ip          TEXT,
      user_agent  TEXT
    );
    CREATE INDEX idx_sessions_expiry ON admin_sessions(expires_at);

    -- Failed login attempts, for throttling.
    CREATE TABLE login_attempts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier  TEXT NOT NULL,     -- email or ip
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_attempts ON login_attempts(identifier, created_at);

    -- ------------------------------------------------------------- settings
    CREATE TABLE settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Enquiries from the contact and business forms.
    CREATE TABLE enquiries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      kind        TEXT NOT NULL,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      phone       TEXT NOT NULL,
      company     TEXT,
      subject     TEXT,
      message     TEXT NOT NULL,
      handled     INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_enquiries_handled ON enquiries(handled, created_at);
    `,
  },
  {
    id: 2,
    name: "email_log",
    sql: /* sql */ `
    -- One row per email we have sent, so nothing goes out twice.
    --
    -- This matters because markPaid() is reached from BOTH the browser's
    -- verify call and Razorpay's webhook, and they race. Without this the
    -- customer gets two confirmations for one order.
    CREATE TABLE email_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      kind        TEXT NOT NULL,     -- order_confirmation|enquiry_alert|low_stock
      dedupe_key  TEXT NOT NULL,     -- kind + the thing it is about
      recipient   TEXT NOT NULL,
      subject     TEXT NOT NULL,
      status      TEXT NOT NULL,     -- sent|failed|skipped
      provider_id TEXT,
      error       TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (dedupe_key)
    );
    CREATE INDEX idx_email_log_kind ON email_log(kind, created_at);
    `,
  },
];
