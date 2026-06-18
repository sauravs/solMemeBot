import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listSignalPnlRows } from "@/lib/repos/performance";
import { aggregateWalletPnl } from "@/lib/paper-tracking/pnl";
import { HORIZONS } from "@/lib/paper-tracking/horizons";

function short(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;
}

function fmtPct(v: number | undefined) {
  if (v === undefined) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

export default async function PerformancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await listSignalPnlRows(user.id);

  // avg PnL per wallet per horizon
  const byHorizon = new Map(
    HORIZONS.map((h) => [
      h.key,
      new Map(aggregateWalletPnl(rows, h.key).map((w) => [w.walletId, w.avgPnlPct])),
    ]),
  );

  // wallets in first-seen order, with metadata + signal counts
  const wallets: { id: string; label: string | null; address: string; count: number }[] = [];
  const seen = new Map<string, number>();
  for (const r of rows) {
    if (!seen.has(r.walletId)) {
      seen.set(r.walletId, wallets.length);
      wallets.push({ id: r.walletId, label: r.walletLabel, address: r.walletAddress, count: 0 });
    }
    wallets[seen.get(r.walletId)!].count += 1;
  }

  return (
    <main>
      <div className="page-header">
        <h1>Wallet performance</h1>
        <p className="page-subtitle">
          Hypothetical &quot;if you&apos;d followed&quot; PnL per tracked wallet.
        </p>
      </div>

      <div className="panel">
        {wallets.length === 0 ? (
          <p className="empty" data-testid="performance-empty">
            No signals yet. Once tracked wallets buy and prices are snapshotted, PnL appears here.
          </p>
        ) : (
          <table data-testid="performance-table" className="table">
            <thead>
              <tr>
                <th>Wallet</th>
                {HORIZONS.map((h) => (
                  <th key={h.key}>{h.key}</th>
                ))}
                <th>Signals</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((w) => (
                <tr key={w.id} data-testid="performance-row" data-wallet={w.id}>
                  <td>{w.label ?? short(w.address)}</td>
                  {HORIZONS.map((h) => {
                    const v = byHorizon.get(h.key)!.get(w.id);
                    const cls = v === undefined ? "muted" : v >= 0 ? "pnl-pos" : "pnl-neg";
                    return (
                      <td key={h.key} className={cls} data-testid={`pnl-${h.key}`}>
                        {fmtPct(v)}
                      </td>
                    );
                  })}
                  <td className="muted">{w.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
