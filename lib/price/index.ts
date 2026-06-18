import type { PriceSource } from "./types";
import { fakePriceSource } from "./fake";
import { jupiterPriceSource } from "./jupiter";

export type { PriceSource } from "./types";

/**
 * Select the active PriceSource. Dev/CI/e2e use the deterministic fake
 * (PRICE_PROVIDER=fake); production uses Jupiter. One swappable seam.
 */
export function getPriceSource(): PriceSource {
  if (process.env.PRICE_PROVIDER === "fake") return fakePriceSource;
  return jupiterPriceSource;
}
