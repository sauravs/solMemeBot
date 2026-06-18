// Pure Hypothetical-PnL math. The heart of "would following this wallet have
// paid?" — no I/O, fully unit-tested.

/** Percentage return from entry to a later price, or null if entry is unusable. */
export function pnlPct(entry: number | null, price: number): number | null {
  if (entry === null || entry === 0) return null;
  return ((price - entry) / entry) * 100;
}

export interface SignalPnlRow {
  walletId: string;
  entry: number | null;
  snapshots: Record<string, number>;
}

export interface WalletPnl {
  walletId: string;
  avgPnlPct: number;
  sampleSize: number;
}

/**
 * Average hypothetical PnL per wallet at one horizon. A signal contributes only
 * if it has a usable entry price and a snapshot at that horizon. Wallets with no
 * qualifying signals are omitted. Order follows first appearance.
 */
export function aggregateWalletPnl(
  rows: SignalPnlRow[],
  horizon: string,
): WalletPnl[] {
  const order: string[] = [];
  const acc = new Map<string, { sum: number; n: number }>();

  for (const row of rows) {
    const price = row.snapshots[horizon];
    if (price === undefined) continue;
    const pnl = pnlPct(row.entry, price);
    if (pnl === null) continue;

    if (!acc.has(row.walletId)) {
      acc.set(row.walletId, { sum: 0, n: 0 });
      order.push(row.walletId);
    }
    const bucket = acc.get(row.walletId)!;
    bucket.sum += pnl;
    bucket.n += 1;
  }

  return order.map((walletId) => {
    const { sum, n } = acc.get(walletId)!;
    return { walletId, avgPnlPct: sum / n, sampleSize: n };
  });
}
