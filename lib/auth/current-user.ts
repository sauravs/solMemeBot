import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

/** Resolve the signed-in owner from the session, or null if unauthenticated. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}
