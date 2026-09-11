/* ==========================================================================
   Admin authentication.

   Deliberately small: scrypt password hashing from node:crypto, opaque random
   session tokens stored hashed, HttpOnly cookies. No JWT, no auth library, no
   third-party dependency holding the keys to the shop's stock and takings.

   Properties worth stating explicitly:
   · Passwords are never stored, only scrypt hashes with a per-user salt.
   · Session tokens are stored as SHA-256 digests, so a leaked database still
     does not let anyone sign in.
   · Comparisons are timing-safe.
   · Failed logins are throttled per email and per IP.
   ========================================================================== */
import crypto from "node:crypto";
import { getDb } from "./client";

const SCRYPT_N = 16384;
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const KEY_LEN = 64;

export const SESSION_COOKIE = "amaira_admin";
const SESSION_DAYS = 7;
const MAX_FAILED = 8;
const LOCKOUT_MINUTES = 15;

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "owner" | "manager" | "staff";
  active: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p });
  return ["scrypt", SCRYPT_N, SCRYPT_r, SCRYPT_p, salt.toString("base64"), key.toString("base64")].join("$");
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, n, r, p, saltB64, keyB64] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(keyB64, "base64");
    const actual = crypto.scryptSync(password, salt, expected.length, {
      N: Number(n), r: Number(r), p: Number(p),
    });
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function sha256(v: string): string {
  return crypto.createHash("sha256").update(v).digest("hex");
}

/* --- users --------------------------------------------------------------- */

export function createAdminUser(input: {
  email: string;
  password: string;
  name: string;
  role?: AdminUser["role"];
}): AdminUser {
  const db = getDb();
  const info = db
    .prepare(`INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`)
    .run(input.email.toLowerCase().trim(), hashPassword(input.password), input.name, input.role ?? "staff");
  return db.prepare(`SELECT id, email, name, role, active FROM admin_users WHERE id = ?`)
    .get(Number(info.lastInsertRowid)) as AdminUser;
}

export function adminUserCount(): number {
  return (getDb().prepare(`SELECT COUNT(*) AS n FROM admin_users`).get() as { n: number }).n;
}

export function listAdminUsers(): AdminUser[] {
  return getDb()
    .prepare(`SELECT id, email, name, role, active FROM admin_users ORDER BY id`)
    .all() as AdminUser[];
}

export function setAdminPassword(userId: number, password: string): void {
  getDb().prepare(`UPDATE admin_users SET password_hash = ? WHERE id = ?`).run(hashPassword(password), userId);
}

/* --- throttling ---------------------------------------------------------- */

function recentFailures(identifier: string): number {
  const r = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM login_attempts
       WHERE identifier = ? AND created_at > datetime('now', ?)`,
    )
    .get(identifier, `-${LOCKOUT_MINUTES} minutes`) as { n: number };
  return r.n;
}

function recordFailure(identifier: string): void {
  const db = getDb();
  db.prepare(`INSERT INTO login_attempts (identifier) VALUES (?)`).run(identifier);
  // Keep the table from growing without bound.
  db.prepare(`DELETE FROM login_attempts WHERE created_at < datetime('now', '-1 day')`).run();
}

export function isLockedOut(email: string, ip: string): boolean {
  return recentFailures(email.toLowerCase()) >= MAX_FAILED || recentFailures(`ip:${ip}`) >= MAX_FAILED * 2;
}

/* --- sessions ------------------------------------------------------------ */

export interface LoginResult {
  ok: boolean;
  token?: string;
  user?: AdminUser;
  error?: string;
}

export function login(email: string, password: string, meta: { ip: string; userAgent: string }): LoginResult {
  const db = getDb();
  const normalised = email.toLowerCase().trim();

  if (isLockedOut(normalised, meta.ip)) {
    return { ok: false, error: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.` };
  }

  const row = db
    .prepare(`SELECT id, email, name, role, active, password_hash FROM admin_users WHERE email = ?`)
    .get(normalised) as (AdminUser & { password_hash: string }) | undefined;

  // Hash anyway when the user does not exist, so response time does not
  // reveal which emails are registered.
  const hash = row?.password_hash ?? hashPassword("no-such-user-placeholder");
  const passwordOk = verifyPassword(password, hash);

  if (!row || !passwordOk || !row.active) {
    recordFailure(normalised);
    recordFailure(`ip:${meta.ip}`);
    return { ok: false, error: "That email and password do not match." };
  }

  const token = crypto.randomBytes(32).toString("base64url");
  db.prepare(
    `INSERT INTO admin_sessions (token_hash, user_id, expires_at, ip, user_agent)
     VALUES (?, ?, datetime('now', ?), ?, ?)`,
  ).run(sha256(token), row.id, `+${SESSION_DAYS} days`, meta.ip, meta.userAgent.slice(0, 300));

  db.prepare(`UPDATE admin_users SET last_login_at = datetime('now') WHERE id = ?`).run(row.id);
  db.prepare(`DELETE FROM login_attempts WHERE identifier = ?`).run(normalised);
  db.prepare(`DELETE FROM admin_sessions WHERE expires_at < datetime('now')`).run();

  const { password_hash: _drop, ...user } = row;
  return { ok: true, token, user };
}

export function userForToken(token: string | undefined): AdminUser | null {
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.active
       FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.active = 1`,
    )
    .get(sha256(token)) as AdminUser | undefined;
  return row ?? null;
}

export function logout(token: string | undefined): void {
  if (!token) return;
  getDb().prepare(`DELETE FROM admin_sessions WHERE token_hash = ?`).run(sha256(token));
}

export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;
