import { describe, it, expect } from "vitest";
import { realizedPnl, sumRealizedPnl } from "@/lib/journal/pnl";

describe("realizedPnl", () => {
  it("is profit minus fees on a winning trade", () => {
    // 100 tokens, 1.00 -> 2.00, $5 fees => 100*1 - 5 = 95
    expect(realizedPnl({ quantity: 100, entry: 1, exit: 2, fees: 5 })).toBe(95);
  });

  it("is a loss including fees on a losing trade", () => {
    // 50 tokens, 2.00 -> 1.00, $3 fees => 50*-1 - 3 = -53
    expect(realizedPnl({ quantity: 50, entry: 2, exit: 1, fees: 3 })).toBe(-53);
  });

  it("defaults fees to zero", () => {
    expect(realizedPnl({ quantity: 10, entry: 1, exit: 1.5 })).toBeCloseTo(5, 9);
  });
});

describe("sumRealizedPnl", () => {
  it("sums only closed trades (null = still open)", () => {
    expect(sumRealizedPnl([95, -53, null, 10])).toBe(52);
  });

  it("is zero for an empty or all-open set", () => {
    expect(sumRealizedPnl([])).toBe(0);
    expect(sumRealizedPnl([null, null])).toBe(0);
  });
});
