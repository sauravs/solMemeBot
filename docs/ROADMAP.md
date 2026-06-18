# ROADMAP

Long-horizon context so no agent loses the thread. v1 is intentionally narrow; the value
compounds across phases.

## Phase 0 — Private analytics MVP (current)

Decide-only. Track hand-seeded smart-money wallets, capture buys as signals, run token safety,
auto paper-track hypothetical PnL, manual journal, in-app + Telegram alerts. Single user.
Goal: a working signal → decision → (manual) trade → PnL loop that **generates labeled data**.
Slices 0–6 in `docs/PROGRESS.md`.

## Phase 1 — Edge + proof

- **Wallet-quality score**: turn accumulated signals/snapshots into a real score — realized vs.
  unrealized PnL, win rate across many tokens, hold-time distribution, **funding-source analysis to
  flag self-funded / wash-trading wallets**, consistency over time. This is the defensible wedge:
  separating genuine alpha from luck/farmed PnL.
- **Backtest** copy/swing strategies against the indexed history before risking size.
- **Programmatic execution** (optional, custodial-for-self): Jupiter swap API against the owner's
  own wallet with a manual-confirm step. Revisits ADR-0001 deliberately, for self only.
- Auto wallet discovery from GMGN/Cielo leaderboards (replacing manual seeding), once endpoints
  prove stable.

## Phase 2 — Commercialize

- Flip the analytics layer into a **subscription SaaS** — the reliably profitable part (platforms
  and tools make money while most traders don't).
- Multi-tenant accounts, billing, per-user watchlists (the `User` ownership already threaded in v1
  makes this additive).
- **Execution goes non-custodial**: wallet-adapter signing + Jupiter routing, or integrate an
  existing bot rather than rebuilding sniping-grade speed. Avoids the custody/regulatory trap.

## Explicitly NOT planned

- Sniping / sub-second execution arms race (can't beat Axiom/Photon/pro bots on a small team).
- Holding customer funds / custodial keys for other users (honeypot + money-transmitter risk).

## Guiding principles

- Sell shovels, not lottery tickets — durable money is in tooling, not directional trades.
- Keep execution **modular and decoupled** so the analytics layer can always stand alone.
- Every phase must keep the test surface at the seams; no phase earns the right to skip TDD.
