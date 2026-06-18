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
      <div className="page-header">
        <h1>Alerts</h1>
        <p className="page-subtitle">Tracked-wallet buys and safety warnings.</p>
      </div>

      <div className="panel">
        {alerts.length === 0 ? (
          <p className="empty" data-testid="alerts-empty">
            No alerts yet.
          </p>
        ) : (
          <ul data-testid="alert-list" className="list">
            {alerts.map((a) => {
              const p = a.payload as unknown as AlertPayload;
              const danger = a.type === "safety_danger";
              return (
                <li key={a.id} data-testid="alert-row" data-type={a.type} className="list-row">
                  <span className="row-main">
                    <span className={`badge badge-${danger ? "danger" : "safe"}`} data-testid="alert-type">
                      {danger ? "danger" : "buy"}
                    </span>{" "}
                    <strong>{p.wallet}</strong> <span className="muted">bought</span>{" "}
                    <Link href={`/dashboard/token/${p.tokenMint}`} style={{ wordBreak: "break-all" }}>
                      {short(p.tokenMint)}
                    </Link>
                  </span>
                  <time
                    className="muted row-time"
                    dateTime={a.sentAt.toISOString()}
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
