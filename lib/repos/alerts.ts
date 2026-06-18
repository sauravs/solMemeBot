import { prisma } from "@/lib/db";
import type { Alert } from "@prisma/client";

/** Recent alerts for the owner, newest first. */
export function listAlerts(ownerId: string, limit = 50): Promise<Alert[]> {
  return prisma.alert.findMany({
    where: { ownerId },
    orderBy: { sentAt: "desc" },
    take: limit,
  });
}
