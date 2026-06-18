import { describe, it, expect } from "vitest";
import { deriveVerdict } from "@/lib/safety/verdict";
import type { SafetyFlag } from "@/lib/safety/types";

const flag = (severity: SafetyFlag["severity"], passed: boolean): SafetyFlag => ({
  code: "x",
  label: "x",
  severity,
  passed,
});

describe("deriveVerdict", () => {
  it("is safe when every flag passes", () => {
    expect(deriveVerdict([flag("critical", true), flag("high", true)])).toBe("safe");
  });

  it("is safe for an empty flag set (nothing known against it)", () => {
    expect(deriveVerdict([])).toBe("safe");
  });

  it("is danger when any critical flag fails", () => {
    expect(deriveVerdict([flag("critical", false), flag("high", true)])).toBe("danger");
  });

  it("is caution when a non-critical flag fails but no critical does", () => {
    expect(deriveVerdict([flag("high", false), flag("critical", true)])).toBe("caution");
    expect(deriveVerdict([flag("medium", false)])).toBe("caution");
  });

  it("prioritises danger over caution when both kinds fail", () => {
    expect(deriveVerdict([flag("medium", false), flag("critical", false)])).toBe("danger");
  });
});
