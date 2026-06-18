import { describe, it, expect } from "vitest";
import { fakePriceAt } from "@/lib/price/fake";
import { mapJupiterPrice } from "@/lib/price/jupiter";

const MINT = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9A";

describe("fakePriceAt", () => {
  it("is deterministic for the same mint and time", () => {
    const t = Date.parse("2026-06-01T00:00:00Z");
    expect(fakePriceAt(MINT, t)).toBe(fakePriceAt(MINT, t));
  });

  it("moves over time so forward snapshots differ from entry", () => {
    const t0 = Date.parse("2026-06-01T00:00:00Z");
    const t1 = t0 + 24 * 3_600_000;
    expect(fakePriceAt(MINT, t0)).not.toBe(fakePriceAt(MINT, t1));
  });

  it("returns positive prices", () => {
    expect(fakePriceAt(MINT, Date.now())).toBeGreaterThan(0);
  });
});

describe("mapJupiterPrice", () => {
  it("extracts a mint's price from a Jupiter v2 response", () => {
    const json = { data: { [MINT]: { id: MINT, price: "0.00001234" } } };
    expect(mapJupiterPrice(json, MINT)).toBeCloseTo(0.00001234, 12);
  });

  it("returns null when the mint is absent or malformed", () => {
    expect(mapJupiterPrice({ data: {} }, MINT)).toBeNull();
    expect(mapJupiterPrice(null, MINT)).toBeNull();
    expect(mapJupiterPrice({ data: { [MINT]: { price: "0" } } }, MINT)).toBeNull();
  });
});
