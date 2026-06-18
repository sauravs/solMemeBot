import { describe, it, expect } from "vitest";
import { isValidSolanaAddress } from "@/lib/solana/address";

describe("isValidSolanaAddress", () => {
  it("accepts a real base58 Solana address (32-byte pubkey)", () => {
    // BONK mint — a well-known valid Solana address.
    expect(isValidSolanaAddress("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263")).toBe(true);
    // System program address.
    expect(isValidSolanaAddress("11111111111111111111111111111111")).toBe(true);
  });

  it("rejects an empty or whitespace string", () => {
    expect(isValidSolanaAddress("")).toBe(false);
    expect(isValidSolanaAddress("   ")).toBe(false);
  });

  it("rejects strings with non-base58 characters", () => {
    // Contains 0, O, I, l — none are in the base58 alphabet.
    expect(isValidSolanaAddress("0OIl0OIl0OIl0OIl0OIl0OIl0OIl0OIl")).toBe(false);
  });

  it("rejects a string that decodes to the wrong byte length", () => {
    // Too short to be a 32-byte key.
    expect(isValidSolanaAddress("abc")).toBe(false);
    // 'z' repeated decodes to far more than 32 bytes.
    expect(isValidSolanaAddress("z".repeat(50))).toBe(false);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isValidSolanaAddress("  11111111111111111111111111111111  ")).toBe(true);
  });
});
