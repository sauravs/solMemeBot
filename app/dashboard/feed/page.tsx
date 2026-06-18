import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listRecentSignals } from "@/lib/repos/signals";
import type { Verdict } from "@/lib/safety";

function short(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;
}

function SafetyBadge({ verdict }: { verdict: Verdict | null }) {
  const label = verdict ?? "pending";
  return (
    <span className={`badge badge-${label}`} data-testid="safety-badge" data-verdict={label}>
      {label}
    </span>
  );
}

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const signals = await listRecentSignals(user.id);

  return (
    <main>
      <div className="page-header">
        <h1>Activity feed</h1>
        <p className="page-subtitle">Buys by your tracked wallets, newest first.</p>
      </div>

      <div className="panel">
        {signals.length === 0 ? (
          <p className="empty" data-testid="feed-empty">
            No signals yet. When a tracked wallet buys a token, it shows up here.
          </p>
        ) : (
          <ul data-testid="signal-list" className="list">
            {signals.map((s) => (
              <li key={s.id} data-testid="signal-row" className="list-row">
                <span className="row-main">
                  <strong data-testid="signal-wallet">
                    {s.wallet.label ?? short(s.wallet.address)}
                  </strong>{" "}
                  <span className="muted">bought</span>{" "}
                  <Link
                    href={`/dashboard/token/${s.token.mint}`}
                    data-testid="signal-token"
                    style={{ wordBreak: "break-all" }}
                  >
                    {s.token.symbol ?? short(s.token.mint)}
                  </Link>
                </span>
                <span className="row-meta">
                  <SafetyBadge verdict={(s.token.safetyReport?.verdict as Verdict) ?? null} />
                  <time
                    className="muted row-time"
                    dateTime={s.observedAt.toISOString()}
                  >
                    {s.observedAt.toISOString().replace("T", " ").slice(0, 16)} UTC
                  </time>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
