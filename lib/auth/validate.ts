/**
 * Pure single-user credential check. Kept dependency-free so it can be unit
 * tested directly (accept expected values, don't read globals). The Auth.js
 * `authorize` callback calls this with the env-configured account.
 */
export function validateCredentials(
  email: string | undefined,
  password: string | undefined,
  expectedEmail: string | undefined,
  expectedPassword: string | undefined,
): boolean {
  if (!email || !password || !expectedEmail || !expectedPassword) return false;
  return email === expectedEmail && password === expectedPassword;
}
