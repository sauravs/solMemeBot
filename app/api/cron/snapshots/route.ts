import { NextResponse } from "next/server";
import { snapshotDueSignals } from "@/lib/paper-tracking/snapshot";

// Vercel Cron hits this on a schedule (see vercel.json). Vercel attaches
// `Authorization: Bearer ${CRON_SECRET}`; we reject anything else.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Test-only clock override (never enabled in production) so e2e can simulate
  // "24h later" without waiting.
  let nowMs = Date.now();
  if (process.env.CRON_TIME_OVERRIDE === "1") {
    const at = new URL(req.url).searchParams.get("now");
    if (at) {
      const parsed = Date.parse(at);
      if (!Number.isNaN(parsed)) nowMs = parsed;
    }
  }

  const created = await snapshotDueSignals(nowMs);
  return NextResponse.json({ ok: true, created });
}
