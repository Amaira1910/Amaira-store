/* ==========================================================================
   The database handle.

   SQLite, via better-sqlite3. For a single retail store this is the right
   choice, not a compromise: one file, real ACID transactions, no network hop
   on every page render, and a backup is a file copy.

   It does assume ONE server process with a persistent disk — a VPS, a
   container with a volume, Railway, Fly. It will NOT work on a serverless
   platform with an ephemeral filesystem (Vercel's default). To deploy there,
   point DATABASE_URL at Turso (libSQL, SQLite-compatible) and swap the driver
   here; nothing above this file changes.
   ========================================================================== */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { MIGRATIONS } from "./schema";

let db: Database.Database | null = null;

function resolveDbPath(): string {
  const configured = process.env.DATABASE_PATH;
  if (configured) return configured;
  // Default to ./data-store/amaira.db, outside the source tree and git-ignored.
  return path.join(process.cwd(), "data-store", "amaira.db");
}

function migrate(conn: Database.Database): void {
  conn.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  const applied = new Set(
    conn.prepare("SELECT id FROM _migrations").all().map((r) => (r as { id: number }).id),
  );

  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    // Each migration is one transaction: it lands completely or not at all.
    const run = conn.transaction(() => {
      conn.exec(m.sql);
      conn.prepare("INSERT INTO _migrations (id, name) VALUES (?, ?)").run(m.id, m.name);
    });
    run();
    console.info(`[db] applied migration ${m.id} — ${m.name}`);
  }
}

export function getDb(): Database.Database {
  if (db) return db;

  const file = resolveDbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });

  db = new Database(file);

  // WAL lets readers carry on while a write is in flight — important when a
  // customer is checking out while someone is doing a stock-take.
  db.pragma("journal_mode = WAL");
  // Durable enough for retail, and far faster than FULL on spinning disks.
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  // Wait rather than throw if another write holds the lock.
  db.pragma("busy_timeout = 5000");

  migrate(db);
  return db;
}

/** Runs `fn` inside a transaction, rolling back if it throws. */
export function tx<T>(fn: (conn: Database.Database) => T): T {
  const conn = getDb();
  return conn.transaction(fn)(conn);
}

/** Closes the handle. Only needed by scripts and tests. */
export function closeDb(): void {
  db?.close();
  db = null;
}
