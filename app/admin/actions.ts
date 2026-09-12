"use server";

/* ==========================================================================
   Admin server actions.

   Every one of these re-checks the session itself. A server action is a public
   HTTP endpoint — the fact that the button lives on a protected page proves
   nothing about who called it.
   ========================================================================== */
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { currentAdmin, requireAdmin, requireOwner } from "@/lib/admin-session";
import { SESSION_COOKIE, SESSION_MAX_AGE, login as doLogin, logout as doLogout, setAdminPassword } from "@/lib/db/auth";
import { adjustStock, setStock, updateSku } from "@/lib/db/inventory";
import { setFulfilmentStatus, type FulfilmentStatus } from "@/lib/db/orders";
import { setSetting } from "@/lib/db/seed";
import { getDb } from "@/lib/db/client";
import { headers } from "next/headers";

async function clientMeta() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip") ?? "unknown",
    userAgent: h.get("user-agent") ?? "unknown",
  };
}

/* --- session ------------------------------------------------------------- */

export async function loginAction(_prev: unknown, form: FormData) {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");

  if (!email || !password) return { error: "Enter your email and password." };

  const meta = await clientMeta();
  const result = doLogin(email, password, meta);
  if (!result.ok || !result.token) return { error: result.error ?? "Could not sign you in." };

  const jar = await cookies();
  jar.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Only allow relative redirects, so a crafted ?next= cannot bounce a signed-in
  // staff member to an external site.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  doLogout(jar.get(SESSION_COOKIE)?.value);
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: unknown, form: FormData) {
  const user = await currentAdmin();
  if (!user) return { error: "Your session has expired. Sign in again." };

  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < 10) return { error: "Use at least 10 characters." };
  if (password !== confirm) return { error: "Those two passwords do not match." };

  setAdminPassword(user.id, password);
  return { ok: "Password changed." };
}

/* --- inventory ----------------------------------------------------------- */

export async function receiveStockAction(_prev: unknown, form: FormData) {
  const user = await requireAdmin("/admin/inventory");
  const skuId = Number(form.get("skuId"));
  const qty = Number(form.get("qty"));
  const note = String(form.get("note") ?? "").slice(0, 200) || undefined;

  if (!Number.isInteger(skuId)) return { error: "Which SKU?" };
  if (!Number.isInteger(qty) || qty === 0) return { error: "Enter a whole number, positive or negative." };

  try {
    const { balanceAfter } = adjustStock({
      skuId,
      delta: qty,
      reason: qty > 0 ? "purchase" : "adjustment",
      actor: user.email,
      note,
    });
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    return { ok: `${qty > 0 ? "+" : ""}${qty} — now ${balanceAfter} on hand.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not change that count." };
  }
}

export async function stocktakeAction(_prev: unknown, form: FormData) {
  const user = await requireAdmin("/admin/inventory");
  const skuId = Number(form.get("skuId"));
  const count = Number(form.get("count"));
  if (!Number.isInteger(skuId) || !Number.isInteger(count) || count < 0) {
    return { error: "Enter the counted quantity as a whole number." };
  }
  try {
    const { balanceAfter } = setStock({ skuId, count, actor: user.email });
    revalidatePath("/admin/inventory");
    return { ok: `Counted — now ${balanceAfter} on hand.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not set that count." };
  }
}

export async function updateSkuAction(_prev: unknown, form: FormData) {
  await requireAdmin("/admin/inventory");
  const skuId = Number(form.get("skuId"));
  if (!Number.isInteger(skuId)) return { error: "Which SKU?" };

  const patch: Record<string, number | string | null> = {};
  const price = form.get("price");
  const cost = form.get("cost_price");
  const threshold = form.get("low_stock_threshold");
  const barcode = form.get("barcode");

  if (price !== null && String(price).trim() !== "") {
    const n = Number(price);
    if (!Number.isFinite(n) || n < 0) return { error: "Price must be a positive number." };
    patch.price = Math.round(n);
  }
  if (cost !== null && String(cost).trim() !== "") {
    const n = Number(cost);
    if (!Number.isFinite(n) || n < 0) return { error: "Cost must be a positive number." };
    patch.cost_price = Math.round(n);
  }
  if (threshold !== null && String(threshold).trim() !== "") {
    const n = Number(threshold);
    if (!Number.isInteger(n) || n < 0) return { error: "Low-stock threshold must be a whole number." };
    patch.low_stock_threshold = n;
  }
  if (barcode !== null) patch.barcode = String(barcode).trim().slice(0, 40) || null;

  if (Object.keys(patch).length === 0) return { error: "Nothing to change." };

  updateSku(skuId, patch);
  revalidatePath("/admin/inventory");
  return { ok: "Saved." };
}

/* --- orders -------------------------------------------------------------- */

const FULFILMENT: FulfilmentStatus[] = ["awaiting", "packed", "dispatched", "delivered", "collected"];

export async function setFulfilmentAction(_prev: unknown, form: FormData) {
  await requireAdmin("/admin/orders");
  const receiptId = String(form.get("receiptId") ?? "");
  const status = String(form.get("status") ?? "") as FulfilmentStatus;
  if (!receiptId || !FULFILMENT.includes(status)) return { error: "Unknown status." };

  setFulfilmentStatus(receiptId, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${receiptId}`);
  return { ok: `Marked ${status}.` };
}

/* --- enquiries ----------------------------------------------------------- */

export async function markEnquiryHandledAction(_prev: unknown, form: FormData) {
  await requireAdmin("/admin/enquiries");
  const id = Number(form.get("id"));
  if (!Number.isInteger(id)) return { error: "Which enquiry?" };
  getDb().prepare(`UPDATE enquiries SET handled = 1 WHERE id = ?`).run(id);
  revalidatePath("/admin/enquiries");
  return { ok: "Marked as handled." };
}

/* --- settings ------------------------------------------------------------ */

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]Z[A-Z\d]$/;

export async function saveSettingsAction(_prev: unknown, form: FormData) {
  await requireOwner("/admin/settings");

  const gstin = String(form.get("seller_gstin") ?? "").trim().toUpperCase();
  if (gstin && !GSTIN.test(gstin)) return { error: "That GSTIN is not a valid 15-character number." };

  const prefix = String(form.get("invoice_prefix") ?? "").trim().toUpperCase().slice(0, 6);
  if (prefix && !/^[A-Z0-9]+$/.test(prefix)) return { error: "Invoice prefix must be letters and digits only." };

  setSetting("seller_gstin", gstin);
  if (prefix) setSetting("invoice_prefix", prefix);
  setSetting("seller_state", String(form.get("seller_state") ?? "Karnataka").trim());
  setSetting("seller_state_code", String(form.get("seller_state_code") ?? "29").trim().slice(0, 2));

  revalidatePath("/admin/settings");
  return { ok: "Settings saved." };
}
