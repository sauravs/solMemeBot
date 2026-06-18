import { NextResponse } from "next/server";
import { parseHeliusBuys } from "@/lib/chain-events/parse";
import { ingestBuys } from "@/lib/chain-events/ingest";

// Helius enhanced webhook receiver (ChainEvents seam). Configure the webhook's
// Authorization header to HELIUS_WEBHOOK_SECRET; we reject anything else.
export async function POST(req: Request) {
  const secret = process.env.HELIUS_WEBHOOK_SECRET;
  const provided = req.headers.get("authorization");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const buys = parseHeliusBuys(payload);
  const created = await ingestBuys(buys);

  return NextResponse.json({ ok: true, parsed: buys.length, created });
}
