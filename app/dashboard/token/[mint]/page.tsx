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
      <div className="page-header">
        <p className="page-subtitle">
          <Link href="/dashboard/feed">← Activity feed</Link>
        </p>
        <h1>Token safety</h1>
      </div>

      <div className="panel">
        <p className="muted" style={{ margin: 0 }}>Mint</p>
        <code data-testid="token-mint" style={{ wordBreak: "break-all" }}>
          {mint}
        </code>
        <p style={{ marginTop: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span className="muted">Verdict</span>
          <span className={`badge badge-${verdict}`} data-testid="token-verdict" data-verdict={verdict}>
            {verdict}
          </span>
        </p>
      </div>

      <div className="panel">
        <h2>Checks</h2>
        {flags.length === 0 ? (
          <p className="empty" data-testid="no-flags">
            No safety report yet for this token.
          </p>
        ) : (
          <ul data-testid="flag-list" className="list">
            {flags.map((f) => (
              <li
                key={f.code}
                data-testid="safety-flag"
                data-passed={f.passed ? "true" : "false"}
                className="list-row"
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
