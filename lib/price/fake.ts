import type { PriceSource } from "./types";

// Deterministic, time-varying fake price (PRICE_PROVIDER=fake). Same (mint, time)
// always yields the same price, and the price moves hour-to-hour so forward
// snapshots differ from entry — letting tests assert non-trivial PnL. Pure.

const HOUR = 3_600_000;

function seed(mint: string): number {
  let s = 0;
  for (let i = 0; i < mint.length; i++) s = (s + mint.charCodeAt(i) * (i + 1)) % 997;
  return s;
}

/** Deterministic USD price for a mint at a point in time. */
export function fakePriceAt(mint: string, atMs: number): number {
  const s = seed(mint);
  const base = 1e-6 * (1 + (s % 1000)); // a small, mint-specific base price
  const hour = Math.floor(atMs / HOUR);
  // Factor in [0.5, 1.5], stepping deterministically by the hour.
  const factor = 1 + 0.05 * (((hour + s) % 21) - 10);
  return base * factor;
}

export const fakePriceSource: PriceSource = {
  getPrice: async (mint, atMs = Date.now()) => fakePriceAt(mint, atMs),
};
