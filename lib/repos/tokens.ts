import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type TokenWithSafety = Prisma.TokenGetPayload<{
  include: { safetyReport: true };
}>;

export function getTokenWithSafety(mint: string): Promise<TokenWithSafety | null> {
  return prisma.token.findUnique({
    where: { mint },
    include: { safetyReport: true },
  });
}
