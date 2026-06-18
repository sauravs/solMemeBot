// Pure realized-PnL math for the manual trade journal. Net of fees.

export interface TradeInputs {
  quantity: number;
  entry: number;
  exit: number;
  fees?: number;
}

/** Realized PnL for a closed trade, net of fees. */
export function realizedPnl({ quantity, entry, exit, fees = 0 }: TradeInputs): number {
  return (exit - entry) * quantity - fees;
}

/** Sum realized PnL across trades; nulls (open positions) are excluded. */
export function sumRealizedPnl(values: (number | null)[]): number {
  return values.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}
