import type { SafetyFlag, Verdict } from "./types";

/**
 * Roll a set of flags up into a single verdict. A failing critical flag (e.g.
 * honeypot, active mint authority) is disqualifying; any other failure is a
 * caution; all-clear is safe. Pure and total — the heart of the safety layer.
 */
export function deriveVerdict(flags: SafetyFlag[]): Verdict {
  const failed = flags.filter((f) => !f.passed);
  if (failed.some((f) => f.severity === "critical")) return "danger";
  if (failed.length > 0) return "caution";
  return "safe";
}
