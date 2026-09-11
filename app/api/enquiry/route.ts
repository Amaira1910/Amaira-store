/* POST /api/enquiry — contact and business enquiry intake.

   Enquiries are stored in the database and shown in the admin portal, so
   nothing is lost. Email delivery is still a TODO: wire a transport (Resend,
   SES, Postmark) if you want them pushed rather than pulled. */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[6-9]\d{9}$/;

const hits = new Map<string, { n: number; since: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function throttled(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.since > WINDOW_MS) {
    hits.set(ip, { n: 1, since: now });
    return false;
  }
  rec.n += 1;
  return rec.n > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (throttled(ip)) {
    return NextResponse.json(
      { ok: false, error: "That is a lot of messages in a short time. Please call the store instead." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "We could not read that." }, { status: 400 });
  }

  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const enquiry = {
    kind: s(body.kind, 20) || "general",
    name: s(body.name, 80),
    email: s(body.email, 160).toLowerCase(),
    phone: s(body.phone, 20).replace(/\D/g, "").slice(-10),
    company: s(body.company, 120),
    subject: s(body.subject, 120),
    message: s(body.message, 4000),
  };

  if (!enquiry.name) return NextResponse.json({ ok: false, error: "Please include your name." }, { status: 400 });
  if (!EMAIL.test(enquiry.email)) return NextResponse.json({ ok: false, error: "That email does not look right." }, { status: 400 });
  if (!PHONE.test(enquiry.phone)) return NextResponse.json({ ok: false, error: "Please give a 10-digit Indian mobile number." }, { status: 400 });
  if (enquiry.message.length < 10) return NextResponse.json({ ok: false, error: "Please add a little more detail." }, { status: 400 });

  getDb()
    .prepare(
      `INSERT INTO enquiries (kind, name, email, phone, company, subject, message)
       VALUES (@kind, @name, @email, @phone, @company, @subject, @message)`,
    )
    .run(enquiry);

  return NextResponse.json({ ok: true });
}
