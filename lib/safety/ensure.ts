import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSafetyReporter } from "@/lib/safety";
import type { SafetyReporter } from "@/lib/safety";

/**
 * Make sure a Token has a current SafetyReport, fetching one via the seam if
 * absent. Idempotent (one report per token). The reporter is injectable so this
 * can be driven with a fake in tests. Failures are swallowed so a flaky safety
 * provider never blocks signal ingestion — the report just fills in later.
 */
export async function ensureSafetyReport(
  tokenMint: string,
  reporter: SafetyReporter = getSafetyReporter(),
): Promise<void> {
  const existing = await prisma.safetyReport.findUnique({ where: { tokenMint } });
  if (existing) return;

  try {
    const report = await reporter.getSafetyReport(tokenMint);
    const flags = report.flags as unknown as Prisma.InputJsonValue;
    await prisma.safetyReport.upsert({
      where: { tokenMint },
      create: { tokenMint, verdict: report.verdict, flags },
      update: { verdict: report.verdict, flags, fetchedAt: new Date() },
    });
  } catch {
    // Leave it unreported; a later signal or a manual refresh can retry.
  }
}
