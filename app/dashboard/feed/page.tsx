import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listRecentSignals } from "@/lib/repos/signals";

function short(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;
}

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const signals = await listRecentSignals(user.id);

  return (
    <main>
      <h1>Activity feed</h1>
      <p className="muted">
        Buys by your tracked wallets, newest first.{" "}
        <Link href="/dashboard">← Dashboard</Link>
      </p>

      <div className="panel">
        {signals.length === 0 ? (
          <p className="muted" data-testid="feed-empty">
            No signals yet. When a tracked wallet buys a token, it shows up here.
          </p>
        ) : (
          <ul data-testid="signal-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {signals.map((s) => (
              <li
                key={s.id}
                data-testid="signal-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "0.7rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <strong data-testid="signal-wallet">
                    {s.wallet.label ?? short(s.wallet.address)}
                  </strong>{" "}
                  <span className="muted">bought</span>{" "}
                  <code data-testid="signal-token" style={{ wordBreak: "break-all" }}>
                    {s.token.symbol ?? short(s.token.mint)}
                  </code>
                </span>
                <time
                  className="muted"
                  data-testid="signal-time"
                  dateTime={s.observedAt.toISOString()}
                  style={{ whiteSpace: "nowrap", fontSize: "0.85rem" }}
                >
                  {s.observedAt.toISOString().replace("T", " ").slice(0, 16)} UTC
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
