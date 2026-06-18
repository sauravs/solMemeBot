import { prisma } from "@/lib/db";
import type { SignalPnlRow } from "@/lib/paper-tracking/pnl";

export interface PnlRowWithMeta extends SignalPnlRow {
  walletLabel: string | null;
  walletAddress: string;
}

/** All of the owner's signals as PnL rows (entry + snapshots by horizon). */
export async function listSignalPnlRows(ownerId: string): Promise<PnlRowWithMeta[]> {
  const signals = await prisma.signal.findMany({
    where: { wallet: { ownerId } },
    include: { wallet: true, snapshots: true },
  });

  return signals.map((s) => {
    const snapshots: Record<string, number> = {};
    for (const snap of s.snapshots) snapshots[snap.horizon] = snap.priceUsd;
    return {
      walletId: s.walletId,
      walletLabel: s.wallet.label,
      walletAddress: s.wallet.address,
      entry: s.signalPriceUsd,
      snapshots,
    };
  });
}
