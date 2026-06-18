import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listAlerts } from "@/lib/repos/alerts";

function short(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;
}

interface AlertPayload {
  wallet: string;
  tokenMint: string;
  verdict: string | null;
}

export default async function AlertsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const alerts = await listAlerts(user.id);

  return (
    <main>
      <h1>Alerts</h1>
      <p className="muted">
        Tracked-wallet buys and safety warnings.{" "}
        <Link href="/dashboard">← Dashboard</Link>
      </p>

      <div className="panel">
        {alerts.length === 0 ? (
          <p className="muted" data-testid="alerts-empty">
            No alerts yet.
          </p>
        ) : (
          <ul data-testid="alert-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {alerts.map((a) => {
              const p = a.payload as unknown as AlertPayload;
              const danger = a.type === "safety_danger";
              return (
                <li
                  key={a.id}
                  data-testid="alert-row"
                  data-type={a.type}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.7rem 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span className={`badge badge-${danger ? "danger" : "safe"}`} data-testid="alert-type">
                      {danger ? "danger" : "buy"}
                    </span>{" "}
                    <strong>{p.wallet}</strong> <span className="muted">bought</span>{" "}
                    <Link href={`/dashboard/token/${p.tokenMint}`} style={{ wordBreak: "break-all" }}>
                      {short(p.tokenMint)}
                    </Link>
                  </span>
                  <time
                    className="muted"
                    dateTime={a.sentAt.toISOString()}
                    style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}
                  >
                    {a.sentAt.toISOString().replace("T", " ").slice(0, 16)} UTC
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
