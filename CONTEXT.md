# CONTEXT — Domain Glossary

> This file is a **glossary only** — the project's ubiquitous language. It contains **no**
> implementation details, schemas, or file paths (those live in `docs/ARCHITECTURE.md`). Keep
> test names and interface vocabulary aligned to these terms. Update it the moment a term is
> coined or sharpened.

## Core terms

**Tracked Wallet** — a Solana wallet address the user has chosen to follow as candidate "smart
money." Tracked wallets are hand-seeded by the user (no auto-discovery in v1). A tracked wallet
is owned by a User.

**Signal** — the unit we evaluate: an event in which a Tracked Wallet **buys** a Token. A signal
records *which* wallet, *which* token, *when*, and the token's price at signal time. Sells and
transfers are not signals in v1.

**Token** — a Solana SPL token (a memecoin) referenced by its mint address. Carries light
metadata (symbol, name) and is the subject of Safety Reports and Price Snapshots.

**Safety Report** — the risk assessment for a Token: a set of **flags** (e.g. mint authority
active, liquidity unlocked, honeypot, high holder concentration, bundled/insider launch) plus a
derived **verdict** (a roll-up like `safe` / `caution` / `danger`). Used to avoid losses, which
is where most traders die.

**Price Snapshot** — a recorded price of a Token at a point in time, taken forward from a Signal
at fixed **horizons** (e.g. 1h, 24h, 7d). The raw material for Hypothetical PnL.

**Hypothetical PnL** — the paper "if I had followed this Signal" return, computed from the
Signal's price and its forward Price Snapshots. Aggregated per Tracked Wallet, it answers "would
blindly copying wallet X have made money?" — the cheap validation step before any scoring model.

**Journal Entry** — a real trade the user manually logged: token, side, size, entry price, exit
price, fees. Its realized PnL is computed **net of fees**. This is the user's actual track record,
distinct from Hypothetical PnL.

**Alert** — a notification emitted for a high-signal event (a Tracked Wallet buy, or a tripped
Safety flag). Delivered to an in-app activity feed and/or Telegram.

**User** — the single owner of the system in v1. Modeled explicitly so ownership can be threaded
through for a future multi-tenant SaaS, but there is exactly one in Phase 0.

## Terms deliberately avoided / clarified

- **"Smart money"** is informal; the precise, ownable concept is a Tracked Wallet plus its
  Hypothetical-PnL track record. We do not claim a wallet is "smart" — we measure it.
- **"Trade"** is ambiguous: prefer **Signal** (a tracked wallet's on-chain buy) vs **Journal
  Entry** (the user's own logged trade). They are different things.
- **"Score"** (wallet-quality score) is **Phase 1**. v1 only collects the data and computes
  deterministic aggregates (Hypothetical PnL), not a trained score.
