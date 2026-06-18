import type { SafetyFlag, SafetyReport, SafetyReporter } from "./types";
import { deriveVerdict } from "./verdict";

// Deterministic fake used in dev/CI/e2e (SAFETY_PROVIDER=fake) so the safety
// pipeline can be exercised without hitting RugCheck. The same mint always
// yields the same report — tests rely on that. Pure; safe to import anywhere.

const CHECKS: { code: string; label: string; severity: SafetyFlag["severity"] }[] = [
  { code: "honeypot", label: "Not a honeypot", severity: "critical" },
  { code: "mint_authority", label: "Mint authority renounced", severity: "critical" },
  { code: "liquidity_locked", label: "Liquidity locked", severity: "high" },
  { code: "holder_concentration", label: "Healthy holder distribution", severity: "medium" },
];

function checksum(mint: string): number {
  let sum = 0;
  for (let i = 0; i < mint.length; i++) sum = (sum + mint.charCodeAt(i) * (i + 1)) % 1024;
  return sum;
}

/** Deterministic safety report for a mint — the fake's contract. */
export function fakeReportForMint(mint: string): SafetyReport {
  const cs = checksum(mint);
  const flags: SafetyFlag[] = CHECKS.map((check, i) => ({
    ...check,
    // Bit `i` of the checksum decides whether this check fails for this mint.
    passed: ((cs >> i) & 1) === 0,
  }));
  return { verdict: deriveVerdict(flags), flags };
}

export const fakeSafetyReporter: SafetyReporter = {
  getSafetyReport: async (mint) => fakeReportForMint(mint),
};
