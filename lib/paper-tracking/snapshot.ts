import { prisma } from "@/lib/db";
import { getPriceSource, type PriceSource } from "@/lib/price";
import { dueHorizons, HORIZONS } from "./horizons";

const HORIZON_MS = new Map(HORIZONS.map((h) => [h.key, h.ms]));

/**
 * Record forward price snapshots for every signal whose horizons have come due
 * by `nowMs`. Idempotent (one snapshot per signal+horizon). The price source is
 * injectable for tests. Returns how many snapshots were created.
 */
export async function snapshotDueSignals(
  nowMs: number,
  priceSource: PriceSource = getPriceSource(),
): Promise<number> {
  // Only signals with a known entry price can yield meaningful PnL.
  const signals = await prisma.signal.findMany({
    where: { signalPriceUsd: { not: null } },
    include: { snapshots: { select: { horizon: true } } },
  });

  let created = 0;

  for (const signal of signals) {
    const captured = new Set(signal.snapshots.map((s) => s.horizon));
    const observedAtMs = signal.observedAt.getTime();
    const due = dueHorizons(observedAtMs, nowMs, captured);

    for (const horizon of due) {
      const horizonMs = observedAtMs + (HORIZON_MS.get(horizon) ?? 0);
      const price = await priceSource.getPrice(signal.tokenMint, horizonMs);
      if (price === null) continue;

      await prisma.priceSnapshot.create({
        data: { signalId: signal.id, horizon, priceUsd: price },
      });
      created += 1;
    }
  }

  return created;
}
