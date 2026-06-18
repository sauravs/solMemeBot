import { describe, it, expect } from "vitest";
import { mapRugcheckReport } from "@/lib/safety/rugcheck";

describe("mapRugcheckReport", () => {
  it("treats a token with no listed risks as safe", () => {
    expect(mapRugcheckReport({ risks: [] }).verdict).toBe("safe");
    expect(mapRugcheckReport({}).verdict).toBe("safe");
  });

  it("maps a 'danger' risk to a failed critical flag and a danger verdict", () => {
    const report = mapRugcheckReport({
      risks: [{ name: "Mint authority still enabled", level: "danger" }],
    });
    expect(report.verdict).toBe("danger");
    expect(report.flags).toHaveLength(1);
    expect(report.flags[0]).toMatchObject({
      label: "Mint authority still enabled",
      severity: "critical",
      passed: false,
    });
    expect(report.flags[0].code).toBe("mint_authority_still_enabled");
  });

  it("maps a 'warn' risk to a high-severity flag and a caution verdict", () => {
    const report = mapRugcheckReport({
      risks: [{ name: "Low liquidity", level: "warn" }],
    });
    expect(report.verdict).toBe("caution");
    expect(report.flags[0].severity).toBe("high");
  });

  it("is robust to a malformed payload", () => {
    expect(mapRugcheckReport(null).verdict).toBe("safe");
    expect(mapRugcheckReport({ risks: "nope" }).verdict).toBe("safe");
  });
});
