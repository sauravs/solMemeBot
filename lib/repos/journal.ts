import { prisma } from "@/lib/db";
import type { JournalEntry } from "@prisma/client";

export function listJournalEntries(ownerId: string): Promise<JournalEntry[]> {
  return prisma.journalEntry.findMany({
    where: { ownerId },
    orderBy: { openedAt: "desc" },
  });
}

export interface NewTrade {
  token: string;
  side: string;
  quantity: number;
  entryPriceUsd: number;
  exitPriceUsd: number | null;
  feesUsd: number;
  realizedPnlUsd: number | null;
  closedAt: Date | null;
}

export function addJournalEntry(ownerId: string, trade: NewTrade): Promise<JournalEntry> {
  return prisma.journalEntry.create({ data: { ownerId, ...trade } });
}

export async function removeJournalEntry(ownerId: string, id: string): Promise<void> {
  await prisma.journalEntry.deleteMany({ where: { id, ownerId } });
}
