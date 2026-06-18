import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listJournalEntries } from "@/lib/repos/journal";
import { sumRealizedPnl } from "@/lib/journal/pnl";
import { addTrade, removeTrade } from "./actions";

function usd(v: number) {
  return `${v >= 0 ? "+" : "-"}$${Math.abs(v).toFixed(2)}`;
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;
  const entries = await listJournalEntries(user.id);
  const total = sumRealizedPnl(entries.map((e) => e.realizedPnlUsd));
  const closedCount = entries.filter((e) => e.realizedPnlUsd !== null).length;

  return (
    <main>
      <h1>Trade journal</h1>
      <p className="muted">
        Your real trades — net-of-fees PnL.{" "}
        <Link href="/dashboard">← Dashboard</Link>
      </p>

      <form action={addTrade} className="panel">
        <label htmlFor="token">Token (mint or symbol)</label>
        <input id="token" name="token" autoComplete="off" required />
        <label htmlFor="quantity">Quantity (tokens)</label>
        <input id="quantity" name="quantity" type="number" step="any" min="0" required />
        <label htmlFor="entry">Entry price (USD)</label>
        <input id="entry" name="entry" type="number" step="any" min="0" required />
        <label htmlFor="exit">Exit price (USD) — leave blank if still open</label>
        <input id="exit" name="exit" type="number" step="any" min="0" />
        <label htmlFor="fees">Fees (USD)</label>
        <input id="fees" name="fees" type="number" step="any" min="0" defaultValue="0" />
        {error ? (
          <p className="error" data-testid="journal-error">
            Enter a token, and positive quantity / entry (and a valid exit if closing).
          </p>
        ) : null}
        <button type="submit">Log trade</button>
      </form>

      <div className="panel">
        <p data-testid="journal-total">
          Total realized PnL:{" "}
          <strong className={total >= 0 ? "pnl-pos" : "pnl-neg"}>{usd(total)}</strong>{" "}
          <span className="muted">({closedCount} closed / {entries.length} logged)</span>
        </p>
      </div>

      <div className="panel">
        {entries.length === 0 ? (
          <p className="muted" data-testid="journal-empty">
            No trades logged yet.
          </p>
        ) : (
          <table data-testid="journal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: "0.85rem" }}>
                <th style={{ padding: "0.5rem 0" }}>Token</th>
                <th>Qty</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Fees</th>
                <th>PnL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} data-testid="journal-row" style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem 0", wordBreak: "break-all" }}>{e.token}</td>
                  <td>{e.quantity}</td>
                  <td>${e.entryPriceUsd}</td>
                  <td>{e.exitPriceUsd === null ? <span className="muted">open</span> : `$${e.exitPriceUsd}`}</td>
                  <td>${e.feesUsd}</td>
                  <td
                    data-testid="journal-pnl"
                    className={
                      e.realizedPnlUsd === null ? "muted" : e.realizedPnlUsd >= 0 ? "pnl-pos" : "pnl-neg"
                    }
                  >
                    {e.realizedPnlUsd === null ? "—" : usd(e.realizedPnlUsd)}
                  </td>
                  <td>
                    <form action={removeTrade}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        data-testid="remove-trade"
                        style={{ background: "transparent", border: "1px solid var(--border)", marginTop: 0 }}
                      >
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
