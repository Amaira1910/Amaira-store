/* ==========================================================================
   Email.

   One transport (Resend, over its HTTP API with fetch — no SDK), one
   idempotency table, and a hard rule: sending an email must NEVER break the
   thing that triggered it. A payment that succeeded is not allowed to look
   like a failure because an email provider had a bad minute.

   Unconfigured behaviour is deliberate, not a stub: with no RESEND_API_KEY
   the message is logged and recorded as 'skipped'. The shop keeps working,
   and `/admin` still shows every order and enquiry, so nothing is lost —
   it just is not pushed to an inbox yet.
   ========================================================================== */
import { getDb } from "@/lib/db/client";

const API = process.env.RESEND_API_BASE ?? "https://api.resend.com";

export interface SendInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Where replies go. Defaults to the store's address. */
  replyTo?: string;
  /** kind + the id of the thing this is about. Guarantees one send only. */
  dedupeKey: string;
  kind: "order_confirmation" | "enquiry_alert" | "low_stock";
}

export interface SendResult {
  ok: boolean;
  status: "sent" | "failed" | "skipped" | "duplicate";
  providerId?: string;
  error?: string;
}

function config() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

/* --- claiming ------------------------------------------------------------
   Dedupe has to be a claim, not a check.

   The obvious version — "have we sent this? no? then send" — is a race. Both
   the browser's verify call and Razorpay's webhook reach markPaid at the same
   moment, both see no row, and the customer gets two confirmations. Writing
   the log row afterwards does not help: the unique index rejects the second
   row but both emails have already gone.

   So the row is inserted FIRST, as status 'sending'. The unique index on
   dedupe_key is the lock: exactly one caller's INSERT reports a change, and
   that caller owns the send. Everyone else is a duplicate and does nothing.
   ------------------------------------------------------------------------ */

/** How long a 'sending' row may sit before another attempt may take it over.
    Covers a process killed mid-send, which would otherwise block the message
    forever. */
const STUCK_MINUTES = 5;

type Claim = "claimed" | "duplicate";

function claimSend(input: SendInput): Claim {
  try {
    const db = getDb();

    const inserted = db
      .prepare(
        `INSERT OR IGNORE INTO email_log (kind, dedupe_key, recipient, subject, status)
         VALUES (?, ?, ?, ?, 'sending')`,
      )
      .run(input.kind, input.dedupeKey, input.to, input.subject);

    if (inserted.changes > 0) return "claimed";

    /* A row already exists. Take it over only if the previous attempt did not
       succeed — a failed or skipped send is worth retrying, and a 'sending'
       row left behind by a crash should not block the message for ever.
       This is one statement with the guard in its WHERE clause, so two
       concurrent retries cannot both win it. */
    const takeover = db
      .prepare(
        `UPDATE email_log
            SET status = 'sending', error = NULL, created_at = datetime('now')
          WHERE dedupe_key = ?
            AND (status IN ('failed', 'skipped')
                 OR (status = 'sending' AND created_at < datetime('now', ?)))`,
      )
      .run(input.dedupeKey, `-${STUCK_MINUTES} minutes`);

    return takeover.changes > 0 ? "claimed" : "duplicate";
  } catch (err) {
    /* If the claim itself fails we cannot prove the message is unsent, and
       sending twice is worse than not sending: the log is the record. */
    console.error("[email] could not claim a send; skipping to avoid a duplicate", err);
    return "duplicate";
  }
}

/** Records the outcome against a row this caller already owns. */
function settle(input: SendInput, result: SendResult): void {
  try {
    getDb()
      .prepare(
        `UPDATE email_log SET status = ?, provider_id = ?, error = ? WHERE dedupe_key = ?`,
      )
      .run(result.status === "duplicate" ? "sent" : result.status, result.providerId ?? null, result.error ?? null, input.dedupeKey);
  } catch (err) {
    console.error("[email] could not update email_log", err);
  }
}

/**
 * Sends one email. Never throws — every failure path returns a result and is
 * logged, because every caller is on a path where the user's actual goal has
 * already succeeded.
 */
export async function sendEmail(input: SendInput): Promise<SendResult> {
  // Claim before doing anything: whoever wins the INSERT owns this message.
  if (claimSend(input) === "duplicate") {
    return { ok: true, status: "duplicate" };
  }

  const cfg = config();
  if (!cfg) {
    console.info(
      `[email] not configured — would have sent "${input.subject}" to ${input.to}. ` +
        `Set RESEND_API_KEY and EMAIL_FROM to switch this on.`,
    );
    const result: SendResult = { ok: false, status: "skipped", error: "transport not configured" };
    settle(input, result);
    return result;
  }

  try {
    const res = await fetch(`${API}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        from: cfg.from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      cache: "no-store",
      // A slow provider must not hold a checkout response open.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const result: SendResult = {
        ok: false,
        status: "failed",
        error: `${res.status} ${body.slice(0, 300)}`,
      };
      console.error("[email] provider rejected the message", result.error);
      settle(input, result);
      return result;
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    const result: SendResult = { ok: true, status: "sent", providerId: data.id };
    settle(input, result);
    return result;
  } catch (err) {
    const result: SendResult = {
      ok: false,
      status: "failed",
      error: err instanceof Error ? err.message : "unknown transport error",
    };
    console.error("[email] transport error", result.error);
    settle(input, result);
    return result;
  }
}

/**
 * Fire-and-forget wrapper for paths that must not wait on, or be affected by,
 * the send — chiefly payment confirmation.
 */
export function sendEmailDetached(input: SendInput): void {
  void sendEmail(input).catch((err) => {
    console.error("[email] detached send threw, which should be impossible", err);
  });
}

export function recentEmails(limit = 50) {
  return getDb()
    .prepare(`SELECT * FROM email_log ORDER BY id DESC LIMIT ?`)
    .all(limit) as {
      id: number; kind: string; recipient: string; subject: string;
      status: string; error: string | null; created_at: string;
    }[];
}
