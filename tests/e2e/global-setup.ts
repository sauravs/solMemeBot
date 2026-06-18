import { execSync } from "node:child_process";

// Ensure the schema is applied before e2e runs. The owner User row is created
// lazily on first successful sign-in (auth.ts upsert), so no seed is required.
export default function globalSetup() {
  execSync("pnpm prisma migrate deploy", { stdio: "inherit" });
}
