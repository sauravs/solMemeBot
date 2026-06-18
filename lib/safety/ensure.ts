import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSafetyReporter } from "@/lib/safety";
import type { SafetyReporter } from "@/lib/safety";

/**
 * Make sure a Token has a current SafetyReport, fetching one via the seam if
 * absent. Idempotent (one report per token). The reporter is injectable so this
 * can be driven with a fake in tests. Failures are swallowed so a flaky safety
 * provider never blocks signal ingestion — the report just fills in later.
 * Returns the token's current verdict, or null if none could be determined.
 */
export async function ensureSafetyReport(
  tokenMint: string,
  reporter: SafetyReporter = getSafetyReporter(),
): Promise<string | null> {
  const existing = await prisma.safetyReport.findUnique({ where: { tokenMint } });
  if (existing) return existing.verdict;

  try {
    const report = await reporter.getSafetyReport(tokenMint);
    const flags = report.flags as unknown as Prisma.InputJsonValue;
    await prisma.safetyReport.upsert({
      where: { tokenMint },
      create: { tokenMint, verdict: report.verdict, flags },
      update: { verdict: report.verdict, flags, fetchedAt: new Date() },
    });
    return report.verdict;
  } catch {
    // Leave it unreported; a later signal or a manual refresh can retry.
    return null;
  }
}
