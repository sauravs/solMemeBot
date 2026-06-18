import { describe, it, expect } from "vitest";
import { validateCredentials } from "@/lib/auth/validate";

const USER = "trader@solmemebot.local";
const PASS = "dev-password";

describe("validateCredentials (single-user gate)", () => {
  it("accepts the configured owner credentials", () => {
    expect(validateCredentials(USER, PASS, USER, PASS)).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(validateCredentials(USER, "nope", USER, PASS)).toBe(false);
  });

  it("rejects a wrong email", () => {
    expect(validateCredentials("intruder@x.com", PASS, USER, PASS)).toBe(false);
  });

  it("rejects when any value is missing", () => {
    expect(validateCredentials(undefined, PASS, USER, PASS)).toBe(false);
    expect(validateCredentials(USER, undefined, USER, PASS)).toBe(false);
    expect(validateCredentials(USER, PASS, undefined, PASS)).toBe(false);
    expect(validateCredentials(USER, PASS, USER, undefined)).toBe(false);
  });
});
