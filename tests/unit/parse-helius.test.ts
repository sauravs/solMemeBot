import { describe, it, expect } from "vitest";
import { parseHeliusBuys } from "@/lib/chain-events/parse";

const WALLET = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
const MEME_MINT = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9A";
const WSOL = "So11111111111111111111111111111111111111112";
const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// A wallet buying a memecoin with SOL: receives the meme token, sends SOL.
function solBuyTx(over: Record<string, unknown> = {}) {
  return {
    signature: "sigSolBuy1",
    timestamp: 1_750_000_000,
    tokenTransfers: [
      { fromUserAccount: "poolAcct", toUserAccount: WALLET, mint: MEME_MINT, tokenAmount: 1000 },
    ],
    nativeTransfers: [{ fromUserAccount: WALLET, toUserAccount: "poolAcct", amount: 500_000_000 }],
    ...over,
  };
}

describe("parseHeliusBuys", () => {
  it("detects a SOL→memecoin buy and extracts wallet, mint, sig, time", () => {
    const buys = parseHeliusBuys([solBuyTx()]);
    expect(buys).toHaveLength(1);
    expect(buys[0]).toMatchObject({
      walletAddress: WALLET,
      tokenMint: MEME_MINT,
      txSig: "sigSolBuy1",
    });
    expect(buys[0].observedAt.toISOString()).toBe(new Date(1_750_000_000 * 1000).toISOString());
  });

  it("detects a USDC→memecoin buy (quote token spent)", () => {
    const tx = {
      signature: "sigUsdcBuy",
      timestamp: 1_750_000_100,
      tokenTransfers: [
        { fromUserAccount: "poolAcct", toUserAccount: WALLET, mint: MEME_MINT, tokenAmount: 42 },
        { fromUserAccount: WALLET, toUserAccount: "poolAcct", mint: USDC, tokenAmount: 10 },
      ],
      nativeTransfers: [],
    };
    expect(parseHeliusBuys([tx])).toHaveLength(1);
  });

  it("never attributes a buy to a wallet that is selling (sends meme, receives SOL)", () => {
    const sell = {
      signature: "sigSell",
      timestamp: 1_750_000_200,
      tokenTransfers: [
        { fromUserAccount: WALLET, toUserAccount: "poolAcct", mint: MEME_MINT, tokenAmount: 1000 },
      ],
      nativeTransfers: [{ fromUserAccount: "poolAcct", toUserAccount: WALLET, amount: 500_000_000 }],
    };
    // The counterparty (pool) may look like a buyer, but the selling wallet must
    // never be — and only tracked wallets are ever persisted downstream.
    const buys = parseHeliusBuys([sell]);
    expect(buys.find((b) => b.walletAddress === WALLET)).toBeUndefined();
  });

  it("ignores receiving a quote token (SOL/USDC) — not a memecoin buy", () => {
    const tx = {
      signature: "sigWsol",
      timestamp: 1_750_000_300,
      tokenTransfers: [
        { fromUserAccount: "x", toUserAccount: WALLET, mint: WSOL, tokenAmount: 1 },
      ],
      nativeTransfers: [{ fromUserAccount: WALLET, toUserAccount: "x", amount: 1 }],
    };
    expect(parseHeliusBuys([tx])).toHaveLength(0);
  });

  it("does not double-count the same buy within one transaction", () => {
    const tx = solBuyTx({
      tokenTransfers: [
        { fromUserAccount: "poolA", toUserAccount: WALLET, mint: MEME_MINT, tokenAmount: 600 },
        { fromUserAccount: "poolB", toUserAccount: WALLET, mint: MEME_MINT, tokenAmount: 400 },
      ],
    });
    expect(parseHeliusBuys([tx])).toHaveLength(1);
  });

  it("is robust to malformed input", () => {
    expect(parseHeliusBuys(null)).toEqual([]);
    expect(parseHeliusBuys({})).toEqual([]);
    expect(parseHeliusBuys([{}, { tokenTransfers: "nope" }])).toEqual([]);
    expect(parseHeliusBuys([{ tokenTransfers: [{ toUserAccount: WALLET, mint: MEME_MINT }] }])).toEqual([]);
  });
});
