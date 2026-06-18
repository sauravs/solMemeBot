import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listTrackedWallets } from "@/lib/repos/tracked-wallets";
import { addWallet, removeWallet } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "That doesn't look like a valid Solana wallet address.",
  duplicate: "You're already tracking that wallet.",
};

export default async function WalletsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;
  const wallets = await listTrackedWallets(user.id);

  return (
    <main>
      <h1>Tracked wallets</h1>
      <p className="muted">
        Hand-pick the &quot;smart money&quot; wallets to follow.{" "}
        <Link href="/dashboard">← Dashboard</Link>
      </p>

      <form action={addWallet} className="panel">
        <label htmlFor="address">Wallet address</label>
        <input
          id="address"
          name="address"
          placeholder="e.g. DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
          autoComplete="off"
          required
        />
        <label htmlFor="label">Label (optional)</label>
        <input id="label" name="label" placeholder="e.g. KOL whale #1" autoComplete="off" />
        {error ? (
          <p className="error" data-testid="add-error">
            {ERROR_MESSAGES[error] ?? "Something went wrong."}
          </p>
        ) : null}
        <button type="submit">Add wallet</button>
      </form>

      <div className="panel">
        {wallets.length === 0 ? (
          <p className="muted" data-testid="empty-state">
            No wallets tracked yet. Add one above.
          </p>
        ) : (
          <ul data-testid="wallet-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {wallets.map((w) => (
              <li
                key={w.id}
                data-testid="wallet-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.6rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ minWidth: 0 }}>
                  {w.label ? (
                    <strong data-testid="wallet-label">{w.label}</strong>
                  ) : null}
                  <br />
                  <code
                    data-testid="wallet-address"
                    className="muted"
                    style={{ wordBreak: "break-all", fontSize: "0.85rem" }}
                  >
                    {w.address}
                  </code>
                </span>
                <form action={removeWallet}>
                  <input type="hidden" name="id" value={w.id} />
                  <button
                    type="submit"
                    data-testid="remove-wallet"
                    style={{ background: "transparent", border: "1px solid var(--border)" }}
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
