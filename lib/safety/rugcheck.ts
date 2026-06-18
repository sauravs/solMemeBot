import type { SafetyFlag, SafetyReport, SafetyReporter } from "./types";
import { deriveVerdict } from "./verdict";

// RugCheck adapter. The pure `mapRugcheckReport` is unit-tested with a sample
// payload; the network fetch is thin and lives behind the SafetyReporter seam,
// so callers and tests never depend on RugCheck being reachable. See ADR-0003.

const RUGCHECK_BASE = "https://api.rugcheck.xyz/v1";

interface RugcheckRisk {
  name?: unknown;
  level?: unknown; // "danger" | "warn"
}

/** Map a RugCheck report response into our SafetyReport shape. Pure. */
export function mapRugcheckReport(json: unknown): SafetyReport {
  const data = (json ?? {}) as Record<string, unknown>;
  const risks = Array.isArray(data.risks) ? (data.risks as RugcheckRisk[]) : [];

  // RugCheck lists *risks* (problems). Each becomes a failed flag; its level
  // maps to our severity. A token with no listed risks is treated as clear.
  const flags: SafetyFlag[] = risks.map((r) => {
    const label = typeof r.name === "string" ? r.name : "Unknown risk";
    const level = typeof r.level === "string" ? r.level : "warn";
    return {
      code: label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
      label,
      severity: level === "danger" ? "critical" : "high",
      passed: false,
    };
  });

  return { verdict: deriveVerdict(flags), flags };
}

export const rugcheckSafetyReporter: SafetyReporter = {
  getSafetyReport: async (mint) => {
    const res = await fetch(`${RUGCHECK_BASE}/tokens/${mint}/report`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      // Degrade gracefully: unknown safety = a caution, not a crash.
      return {
        verdict: "caution",
        flags: [
          {
            code: "report_unavailable",
            label: "Safety report unavailable",
            severity: "medium",
            passed: false,
          },
        ],
      };
    }
    return mapRugcheckReport(await res.json());
  },
};
