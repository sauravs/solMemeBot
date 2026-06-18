// Dependency-free Solana address validation. A valid address is a base58-encoded
// Ed25519 public key that decodes to exactly 32 bytes. We decode rather than just
// regex-checking length so we reject strings that look right but aren't 32 bytes.

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_MAP: Record<string, number> = Object.fromEntries(
  [...BASE58_ALPHABET].map((c, i) => [c, i]),
);

/** Decode a base58 string to bytes, or return null if it contains invalid characters. */
export function base58Decode(input: string): Uint8Array | null {
  if (input.length === 0) return null;

  // Count leading '1's — each maps to one leading 0x00 byte in the output.
  let leadingZeros = 0;
  while (leadingZeros < input.length && input[leadingZeros] === "1") leadingZeros++;

  // Accumulate the big-endian number as little-endian bytes (no seed byte, so an
  // all-zero key produces no spurious high byte).
  const bytes: number[] = [];
  for (const char of input) {
    const value = BASE58_MAP[char];
    if (value === undefined) return null;

    let carry = value;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (let k = 0; k < leadingZeros; k++) bytes.push(0);

  return Uint8Array.from(bytes.reverse());
}

/** True when `value` is a valid 32-byte base58 Solana address. */
export function isValidSolanaAddress(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 32 || trimmed.length > 44) return false;
  const decoded = base58Decode(trimmed);
  return decoded !== null && decoded.length === 32;
}
