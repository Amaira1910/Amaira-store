import ActionForm from "@/components/admin/ActionForm";
import { changePasswordAction, saveSettingsAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-session";
import { listAdminUsers } from "@/lib/db/auth";
import { getSetting } from "@/lib/db/seed";
import { financialYear } from "@/lib/db/invoices";
import { INDIAN_STATES } from "@/lib/format";
import { STORE } from "@/data/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireAdmin("/admin/settings");
  const isOwner = user.role === "owner";
  const users = listAdminUsers();

  const gstin = getSetting("seller_gstin");
  const prefix = getSetting("invoice_prefix", "AMR");
  const state = getSetting("seller_state", "Karnataka");
  const stateCode = getSetting("seller_state_code", "29");

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Settings</h1>
          <p>Signed in as {user.email} ({user.role})</p>
        </div>
      </div>

      <div className="adm-card">
        <p className="adm-card-title">Invoicing</p>
        {!gstin && (
          <p className="notice notice-amber" style={{ marginBottom: "var(--s-4)" }}>
            <span>
              <strong>No GSTIN set.</strong> Invoices will print without one, which is not valid for a
              registered business. Add it before you take real orders.
            </span>
          </p>
        )}

        {isOwner ? (
          <ActionForm action={saveSettingsAction} submitLabel="Save settings">
            <label className="field">
              <input className="field-input" name="seller_gstin" defaultValue={gstin} placeholder=" " maxLength={15} />
              <span className="field-label">Your GSTIN (15 characters)</span>
            </label>

            <div className="fieldset-grid fieldset-grid-2">
              <label className="field">
                <input className="field-input" name="invoice_prefix" defaultValue={prefix} placeholder=" " maxLength={6} />
                <span className="field-label">Invoice prefix</span>
              </label>
              <label className="field">
                <input className="field-input" name="seller_state_code" defaultValue={stateCode} placeholder=" " maxLength={2} />
                <span className="field-label">State code</span>
              </label>
            </div>

            <label className="field field-select">
              <select className="field-input" name="seller_state" defaultValue={state}>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="field-label" style={{ transform: "translateY(-9px) scale(0.75)" }}>
                Your registered state
              </span>
            </label>

            <p className="t-caption muted" style={{ marginTop: 10 }}>
              Supplies inside this state are taxed CGST + SGST; anywhere else is IGST. Next invoice
              number will be <strong>{prefix}/{financialYear().replace("-", "")}/00001</strong> onwards.
            </p>
          </ActionForm>
        ) : (
          <p className="t-body-sm muted">
            Only the owner can change invoicing settings. Current GSTIN: {gstin || "not set"}.
          </p>
        )}
      </div>

      <div className="adm-card">
        <p className="adm-card-title">Your password</p>
        <ActionForm action={changePasswordAction} submitLabel="Change password">
          <label className="field">
            <input className="field-input" type="password" name="password" placeholder=" " minLength={10} autoComplete="new-password" required />
            <span className="field-label">New password (10+ characters)</span>
          </label>
          <label className="field">
            <input className="field-input" type="password" name="confirm" placeholder=" " minLength={10} autoComplete="new-password" required />
            <span className="field-label">Confirm it</span>
          </label>
        </ActionForm>
      </div>

      <div className="adm-card">
        <p className="adm-card-title">Staff accounts</p>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="pill pill-neutral">{u.role}</span></td>
                  <td>{u.active ? <span className="pill pill-paid">yes</span> : <span className="pill pill-failed">no</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="t-caption muted" style={{ marginTop: "var(--s-3)" }}>
          Add staff from the command line:{" "}
          <code>npm run db:admin -- name@amairastore.in &quot;a long passphrase&quot; &quot;Their Name&quot; staff</code>
        </p>
      </div>

      <div className="adm-card">
        <p className="adm-card-title">Store details</p>
        <p className="t-body-sm muted">
          The address, phone number, opening hours and EMI bank list are held in{" "}
          <code>data/store.ts</code> so they are version-controlled and reviewable. Edit that file and
          deploy to change them. Prices and stock are in the database and change here, live.
        </p>
        <p className="t-body-sm muted" style={{ marginTop: 10 }}>
          {STORE.addressLine} · {STORE.phone}
        </p>
      </div>
    </>
  );
}
