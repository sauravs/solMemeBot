import type { PriceSource } from "./types";

// Jupiter price adapter. The pure `mapJupiterPrice` is unit-tested; the fetch is
// thin and behind the PriceSource seam, so callers/tests never need Jupiter up.

const JUPITER_PRICE_URL = "https://api.jup.ag/price/v2";

/** Extract a mint's USD price from a Jupiter price-v2 response. Pure. */
export function mapJupiterPrice(json: unknown, mint: string): number | null {
  const data = (json as { data?: Record<string, { price?: unknown }> })?.data;
  const raw = data?.[mint]?.price;
  if (raw === undefined || raw === null) return null;
  const price = typeof raw === "string" ? Number(raw) : (raw as number);
  return Number.isFinite(price) && price > 0 ? price : null;
}

export const jupiterPriceSource: PriceSource = {
  // Jupiter has no historical endpoint here, so `atMs` is ignored — we record the
  // current price when the cron runs (≈ the horizon moment).
  getPrice: async (mint) => {
    try {
      const res = await fetch(`${JUPITER_PRICE_URL}?ids=${mint}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      return mapJupiterPrice(await res.json(), mint);
    } catch {
      return null;
    }
  },
};
