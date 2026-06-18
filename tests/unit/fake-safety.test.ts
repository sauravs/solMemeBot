import { describe, it, expect } from "vitest";
import { fakeReportForMint } from "@/lib/safety/fake";
import { deriveVerdict } from "@/lib/safety/verdict";

describe("fakeReportForMint", () => {
  it("is deterministic — same mint, same report", () => {
    const mint = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9A";
    expect(fakeReportForMint(mint)).toEqual(fakeReportForMint(mint));
  });

  it("always returns the four known checks", () => {
    const report = fakeReportForMint("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");
    expect(report.flags.map((f) => f.code).sort()).toEqual([
      "holder_concentration",
      "honeypot",
      "liquidity_locked",
      "mint_authority",
    ]);
  });

  it("derives the verdict from its own flags", () => {
    const report = fakeReportForMint("So11111111111111111111111111111111111111112");
    expect(report.verdict).toBe(deriveVerdict(report.flags));
  });
});
