import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureSafetyReport } from "@/lib/safety/ensure";
import { getPriceSource } from "@/lib/price";
import type { ParsedBuy } from "@/lib/chain-events/parse";

/**
 * Persist parsed buys as Signals, but only for wallets the system tracks.
 * Idempotent: the Signal @@unique([walletId, txSig, tokenMint]) means replaying
 * the same webhook (Helius retries) creates no duplicates. Returns how many new
 * signals were created.
 */
export async function ingestBuys(buys: ParsedBuy[]): Promise<number> {
  let created = 0;

  for (const buy of buys) {
    const wallets = await prisma.trackedWallet.findMany({
      where: { address: buy.walletAddress, isActive: true },
    });
    if (wallets.length === 0) continue;

    await prisma.token.upsert({
      where: { mint: buy.tokenMint },
      update: {},
      create: { mint: buy.tokenMint },
    });

    // Assess the token's safety the first time we see it bought.
    await ensureSafetyReport(buy.tokenMint);

    // Capture the entry price at signal time (CONTEXT.md: a Signal records the
    // token's price when observed). Null-tolerant so ingestion never breaks.
    const entryPrice = await getPriceSource().getPrice(
      buy.tokenMint,
      buy.observedAt.getTime(),
    );

    for (const wallet of wallets) {
      try {
        await prisma.signal.create({
          data: {
            walletId: wallet.id,
            tokenMint: buy.tokenMint,
            txSig: buy.txSig,
            side: "buy",
            signalPriceUsd: entryPrice,
            observedAt: buy.observedAt,
          },
        });
        created += 1;
      } catch (e) {
        // Already ingested (webhook retry / replay) — idempotent no-op.
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          continue;
        }
        throw e;
      }
    }
  }

  return created;
}
