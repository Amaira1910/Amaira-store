/* GET /api/health — liveness probe for the container platform.

   Touches the database as well as the process, because a running Node with an
   unreachable database is not actually healthy. */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const row = getDb().prepare("SELECT COUNT(*) AS n FROM skus").get() as { n: number };
    return NextResponse.json({
      ok: true,
      skus: row.n,
      payments: process.env.RAZORPAY_KEY_ID ? "configured" : "not configured",
      time: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[health] database unreachable", err);
    return NextResponse.json({ ok: false, error: "database unreachable" }, { status: 503 });
  }
}
