import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type SignalWithRelations = Prisma.SignalGetPayload<{
  include: { wallet: true; token: true };
}>;

/** Recent signals for the owner's tracked wallets, newest first, for the feed. */
export function listRecentSignals(
  ownerId: string,
  limit = 50,
): Promise<SignalWithRelations[]> {
  return prisma.signal.findMany({
    where: { wallet: { ownerId } },
    include: { wallet: true, token: true },
    orderBy: { observedAt: "desc" },
    take: limit,
  });
}
