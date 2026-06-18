import { prisma } from "@/lib/db";
import type { TrackedWallet } from "@prisma/client";

// Repository for the TrackedWallet aggregate. All reads/writes are scoped to an
// owner so multi-tenant isolation is correct by construction (see CONTEXT.md).

export function listTrackedWallets(ownerId: string): Promise<TrackedWallet[]> {
  return prisma.trackedWallet.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
}

export function addTrackedWallet(
  ownerId: string,
  address: string,
  label: string | null,
): Promise<TrackedWallet> {
  return prisma.trackedWallet.create({
    data: { ownerId, address, label },
  });
}

/** Remove a wallet, scoped to its owner so one user can't delete another's row. */
export async function removeTrackedWallet(ownerId: string, id: string): Promise<void> {
  await prisma.trackedWallet.deleteMany({ where: { id, ownerId } });
}
