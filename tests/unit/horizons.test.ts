import { describe, it, expect } from "vitest";
import { dueHorizons, HORIZONS } from "@/lib/paper-tracking/horizons";

const observed = Date.parse("2026-06-01T00:00:00Z");
const HOUR = 3_600_000;

describe("dueHorizons", () => {
  it("returns nothing right after the signal (no horizon elapsed)", () => {
    expect(dueHorizons(observed, observed + 1_000, new Set())).toEqual([]);
  });

  it("returns 1h once an hour has passed", () => {
    expect(dueHorizons(observed, observed + HOUR, new Set())).toEqual(["1h"]);
  });

  it("returns 1h and 24h after a day, newest horizon last", () => {
    expect(dueHorizons(observed, observed + 24 * HOUR, new Set())).toEqual(["1h", "24h"]);
  });

  it("returns all three after a week", () => {
    expect(dueHorizons(observed, observed + 7 * 24 * HOUR, new Set())).toEqual(["1h", "24h", "7d"]);
  });

  it("skips horizons already captured", () => {
    expect(dueHorizons(observed, observed + 24 * HOUR, new Set(["1h"]))).toEqual(["24h"]);
  });

  it("exposes the three horizons with increasing offsets", () => {
    expect(HORIZONS.map((h) => h.key)).toEqual(["1h", "24h", "7d"]);
    expect(HORIZONS[0].ms).toBeLessThan(HORIZONS[1].ms);
    expect(HORIZONS[1].ms).toBeLessThan(HORIZONS[2].ms);
  });
});
