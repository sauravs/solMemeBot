// ChainEvents seam — pure parsing of Helius enhanced-webhook payloads into buys.
// No I/O, no DB: deterministic and unit-testable with sample payloads. The
// webhook route applies this, then filters to tracked wallets and persists.

/** Quote assets a wallet *spends* to buy a memecoin — never the thing being bought. */
const QUOTE_MINTS = new Set([
  "So11111111111111111111111111111111111111112", // wrapped SOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
]);

export interface ParsedBuy {
  walletAddress: string;
  tokenMint: string;
  txSig: string;
  observedAt: Date;
}

interface TokenTransfer {
  fromUserAccount?: unknown;
  toUserAccount?: unknown;
  mint?: unknown;
}
interface NativeTransfer {
  fromUserAccount?: unknown;
  amount?: unknown;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Extract memecoin buys from a Helius enhanced-webhook payload (an array of
 * transactions). A buy = a wallet receives a non-quote token in the same tx in
 * which it spent SOL (native) or a quote token (USDC/USDT).
 */
export function parseHeliusBuys(payload: unknown): ParsedBuy[] {
  const buys: ParsedBuy[] = [];

  for (const txRaw of asArray(payload)) {
    const tx = txRaw as Record<string, unknown>;
    const txSig = typeof tx.signature === "string" ? tx.signature : null;
    if (!txSig) continue;

    const observedAt =
      typeof tx.timestamp === "number" ? new Date(tx.timestamp * 1000) : new Date();

    const tokenTransfers = asArray(tx.tokenTransfers) as TokenTransfer[];
    const nativeTransfers = asArray(tx.nativeTransfers) as NativeTransfer[];

    const seen = new Set<string>();
    for (const tt of tokenTransfers) {
      const to = typeof tt.toUserAccount === "string" ? tt.toUserAccount : null;
      const mint = typeof tt.mint === "string" ? tt.mint : null;
      if (!to || !mint || QUOTE_MINTS.has(mint)) continue;

      const spentSol = nativeTransfers.some(
        (nt) => nt.fromUserAccount === to && typeof nt.amount === "number" && nt.amount > 0,
      );
      const spentQuote = tokenTransfers.some(
        (q) =>
          q.fromUserAccount === to &&
          typeof q.mint === "string" &&
          QUOTE_MINTS.has(q.mint),
      );
      if (!spentSol && !spentQuote) continue;

      const key = `${to}:${mint}`;
      if (seen.has(key)) continue;
      seen.add(key);

      buys.push({ walletAddress: to, tokenMint: mint, txSig, observedAt });
    }
  }

  return buys;
}
