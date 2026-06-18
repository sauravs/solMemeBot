// Forward horizons at which we snapshot a signaled token's price to compute
// Hypothetical PnL. Pure and dependency-free.

export interface Horizon {
  key: string;
  ms: number;
}

const HOUR = 3_600_000;

export const HORIZONS: Horizon[] = [
  { key: "1h", ms: HOUR },
  { key: "24h", ms: 24 * HOUR },
  { key: "7d", ms: 7 * 24 * HOUR },
];

/**
 * Which horizons are due for a signal — elapsed since `observedAtMs` by `nowMs`
 * and not already captured. Ordered oldest→newest.
 */
export function dueHorizons(
  observedAtMs: number,
  nowMs: number,
  captured: Set<string>,
): string[] {
  return HORIZONS.filter(
    (h) => nowMs >= observedAtMs + h.ms && !captured.has(h.key),
  ).map((h) => h.key);
}
