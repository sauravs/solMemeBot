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
      <div className="page-header">
        <h1>Tracked wallets</h1>
        <p className="page-subtitle">Hand-pick the &quot;smart money&quot; wallets to follow.</p>
      </div>

      <form action={addWallet} className="panel">
        <div className="field">
          <label htmlFor="address">Wallet address</label>
          <input
            id="address"
            name="address"
            placeholder="e.g. DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
            autoComplete="off"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="label">Label (optional)</label>
          <input id="label" name="label" placeholder="e.g. KOL whale #1" autoComplete="off" />
        </div>
        {error ? (
          <p className="error" data-testid="add-error">
            {ERROR_MESSAGES[error] ?? "Something went wrong."}
          </p>
        ) : null}
        <button type="submit">Add wallet</button>
      </form>

      <div className="panel">
        {wallets.length === 0 ? (
          <p className="empty" data-testid="empty-state">
            No wallets tracked yet. Add one above.
          </p>
        ) : (
          <ul data-testid="wallet-list" className="list">
            {wallets.map((w) => (
              <li key={w.id} data-testid="wallet-row" className="list-row">
                <span style={{ minWidth: 0 }}>
                  {w.label ? (
                    <strong data-testid="wallet-label">{w.label}</strong>
                  ) : null}
                  <br />
                  <code data-testid="wallet-address" className="muted">
                    {w.address}
                  </code>
                </span>
                <form action={removeWallet}>
                  <input type="hidden" name="id" value={w.id} />
                  <button type="submit" data-testid="remove-wallet" className="btn-danger">
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
