import type { SafetyReporter } from "./types";
import { fakeSafetyReporter } from "./fake";
import { rugcheckSafetyReporter } from "./rugcheck";

export type { SafetyReport, SafetyFlag, SafetyReporter, Verdict, Severity } from "./types";
export { deriveVerdict } from "./verdict";

/**
 * Select the active SafetyReporter adapter. Dev/CI/e2e use the deterministic
 * fake (SAFETY_PROVIDER=fake); production uses RugCheck. One swappable seam.
 */
export function getSafetyReporter(): SafetyReporter {
  if (process.env.SAFETY_PROVIDER === "fake") return fakeSafetyReporter;
  return rugcheckSafetyReporter;
}
