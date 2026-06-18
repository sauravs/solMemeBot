// PriceSource seam. `atMs` is an optional point in time: the real adapter
// returns the current price (it can't time-travel), while the deterministic fake
// uses it so prices move predictably for tests.
export interface PriceSource {
  getPrice(mint: string, atMs?: number): Promise<number | null>;
}
