import { describe, it, expect } from "vitest";
import { pnlPct, aggregateWalletPnl } from "@/lib/paper-tracking/pnl";
import type { SignalPnlRow } from "@/lib/paper-tracking/pnl";

describe("pnlPct", () => {
  it("is 0 when the price hasn't moved", () => {
    expect(pnlPct(100, 100)).toBe(0);
  });

  it("is +100% on a double", () => {
    expect(pnlPct(100, 200)).toBe(100);
  });

  it("is -50% on a halving", () => {
    expect(pnlPct(100, 50)).toBe(-50);
  });

  it("returns null when the entry price is missing or zero", () => {
    expect(pnlPct(null, 200)).toBeNull();
    expect(pnlPct(0, 200)).toBeNull();
  });
});

describe("aggregateWalletPnl", () => {
  it("averages hypothetical PnL per wallet at a given horizon", () => {
    const rows: SignalPnlRow[] = [
      { walletId: "w1", entry: 100, snapshots: { "24h": 200 } }, // +100%
      { walletId: "w1", entry: 100, snapshots: { "24h": 150 } }, // +50%
      { walletId: "w2", entry: 100, snapshots: { "24h": 50 } }, // -50%
    ];
    const result = aggregateWalletPnl(rows, "24h");
    expect(result).toEqual([
      { walletId: "w1", avgPnlPct: 75, sampleSize: 2 },
      { walletId: "w2", avgPnlPct: -50, sampleSize: 1 },
    ]);
  });

  it("ignores signals lacking a snapshot at that horizon", () => {
    const rows: SignalPnlRow[] = [
      { walletId: "w1", entry: 100, snapshots: { "1h": 110 } }, // no 24h
      { walletId: "w1", entry: 100, snapshots: { "24h": 120 } }, // +20%
    ];
    expect(aggregateWalletPnl(rows, "24h")).toEqual([
      { walletId: "w1", avgPnlPct: 20, sampleSize: 1 },
    ]);
  });

  it("omits wallets with no qualifying signals", () => {
    const rows = [{ walletId: "w1", entry: null, snapshots: { "24h": 120 } }];
    expect(aggregateWalletPnl(rows, "24h")).toEqual([]);
  });
});
