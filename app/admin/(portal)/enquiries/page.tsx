import ActionForm from "@/components/admin/ActionForm";
import { markEnquiryHandledAction } from "@/app/admin/actions";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries" };

interface Enquiry {
  id: number; kind: string; name: string; email: string; phone: string;
  company: string | null; subject: string | null; message: string;
  handled: number; created_at: string;
}

export default async function EnquiriesPage() {
  const rows = getDb()
    .prepare(`SELECT * FROM enquiries ORDER BY handled ASC, id DESC LIMIT 200`)
    .all() as Enquiry[];
  const open = rows.filter((r) => !r.handled).length;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Enquiries</h1>
          <p>{open} awaiting a reply, {rows.length} total</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="adm-card adm-empty">
          <p>Nothing yet. Messages from the contact and business forms land here.</p>
        </div>
      ) : (
        rows.map((e) => (
          <div className="adm-card" key={e.id} style={{ opacity: e.handled ? 0.62 : 1 }}>
            <div className="spread" style={{ alignItems: "flex-start", marginBottom: "var(--s-3)" }}>
              <div>
                <p className="t-body" style={{ fontWeight: 600 }}>
                  {e.name}
                  {e.company ? ` · ${e.company}` : ""}
                  <span className="pill pill-neutral" style={{ marginLeft: 8 }}>{e.kind}</span>
                  {e.handled ? <span className="pill pill-paid" style={{ marginLeft: 6 }}>handled</span> : null}
                </p>
                <p className="t-caption muted" style={{ marginTop: 3 }}>
                  <a href={`mailto:${e.email}`}>{e.email}</a> · <a href={`tel:${e.phone}`}>{e.phone}</a> · {e.created_at}
                </p>
              </div>
              {!e.handled && (
                <ActionForm action={markEnquiryHandledAction} submitLabel="Mark handled" submitClass="btn btn-sm btn-quiet" quiet>
                  <input type="hidden" name="id" value={e.id} />
                </ActionForm>
              )}
            </div>
            {e.subject && <p className="t-body-sm" style={{ fontWeight: 500 }}>{e.subject}</p>}
            <p className="t-body-sm muted pretty" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{e.message}</p>
          </div>
        ))
      )}
    </>
  );
}
