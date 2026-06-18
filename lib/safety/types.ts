// Safety domain types. Used across the SafetyReporter seam (fake + RugCheck
// adapters) and the UI. See CONTEXT.md ("Safety Report") and ADR-0003.

export type Verdict = "safe" | "caution" | "danger";

/** How damaging a failed check is. Critical failures force a `danger` verdict. */
export type Severity = "critical" | "high" | "medium";

export interface SafetyFlag {
  code: string;
  label: string;
  severity: Severity;
  /** true = check passed (good); false = the risk is present (a red flag). */
  passed: boolean;
}

export interface SafetyReport {
  verdict: Verdict;
  flags: SafetyFlag[];
}

/** The seam: anything that can assess a token's safety by its mint address. */
export interface SafetyReporter {
  getSafetyReport(mint: string): Promise<SafetyReport>;
}
