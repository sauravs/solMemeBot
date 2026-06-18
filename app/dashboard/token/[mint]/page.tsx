import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTokenWithSafety } from "@/lib/repos/tokens";
import type { SafetyFlag, Verdict } from "@/lib/safety";

export default async function TokenPage({
  params,
}: {
  params: Promise<{ mint: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { mint } = await params;
  const token = await getTokenWithSafety(mint);
  const report = token?.safetyReport;
  const verdict = (report?.verdict as Verdict | undefined) ?? "pending";
  const flags = (report?.flags as unknown as SafetyFlag[] | undefined) ?? [];

  return (
    <main>
      <h1>Token safety</h1>
      <p className="muted">
        <Link href="/dashboard/feed">← Feed</Link>
      </p>

      <div className="panel">
        <p className="muted">Mint</p>
        <code data-testid="token-mint" style={{ wordBreak: "break-all" }}>
          {mint}
        </code>
        <p style={{ marginTop: "1rem" }}>
          Verdict:{" "}
          <span className={`badge badge-${verdict}`} data-testid="token-verdict" data-verdict={verdict}>
            {verdict}
          </span>
        </p>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>Checks</h2>
        {flags.length === 0 ? (
          <p className="muted" data-testid="no-flags">
            No safety report yet for this token.
          </p>
        ) : (
          <ul data-testid="flag-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {flags.map((f) => (
              <li
                key={f.code}
                data-testid="safety-flag"
                data-passed={f.passed ? "true" : "false"}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span>
                  {f.passed ? "✅" : "🚩"} {f.label}
                </span>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  {f.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
