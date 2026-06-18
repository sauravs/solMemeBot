# PRD — solMemeBot v1 (Phase 0)

## Problem Statement

I want to trade Solana memecoins profitably with a swing + smart-money-following style on a small
account ($100–500), giving 2–3 hours a day. The honest data says this is a brutal minority game:
on Pump.fun only ~0.05% of wallets cleared $100k and the median hold time is ~100 seconds — bots
and insiders dominate the fast game. I can't win on speed. My realistic edge is patience,
discipline, and **knowing which "smart money" wallets are actually smart vs. lucky or wash-trading
themselves**. No existing tool cleanly separates genuine alpha from farmed PnL, and execution
terminals make me custody keys and race infra I can't beat. I need a decision-support tool, not
another sniping bot.

## Solution

A private, single-user analytics dashboard (**decide-only**) that:

1. Lets me hand-pick and manage a watchlist of candidate "smart money" wallets.
2. Captures each tracked wallet's **buys as signals** in real time (Helius webhooks).
3. Runs **token safety checks** on what they buy so I avoid obvious rugs/honeypots.
4. **Auto paper-tracks** each signal forward (1h/24h/7d) to compute the hypothetical "if I'd
   followed" PnL per wallet — telling me which wallets are worth copying *before* I risk money.
5. Lets me **journal my real trades** and see true net-of-fees PnL.
6. **Alerts** me (in-app + Telegram) so I catch moves during my 2–3h window.

I execute trades manually elsewhere; this tool's job is to **decide**, not transact. The data it
accumulates becomes the foundation for the commercial wedge (wallet-quality scoring) and a future
SaaS.

## User Stories

1. As the owner, I want to log in behind a private gate, so that my dashboard isn't publicly
   accessible.
2. As a trader, I want to add a Solana wallet address to my watchlist with a label, so that I can
   track a candidate smart-money wallet.
3. As a trader, I want invalid wallet addresses rejected, so that I don't pollute my watchlist.
4. As a trader, I want to remove a tracked wallet, so that my list stays curated.
5. As a trader, I want to see all my tracked wallets in one place, so that I know what I'm
   following.
6. As a trader, I want a tracked wallet's buys to appear automatically as signals, so that I don't
   have to watch the chain manually.
7. As a trader, I want each signal to show the token, the wallet, and the time, so that I have
   context at a glance.
8. As a trader, I want a live activity feed of recent signals, so that my morning/evening review
   is fast.
9. As a trader, I want a token safety report on each signaled token (mint authority, liquidity
   lock, honeypot, holder concentration), so that I can avoid obvious traps.
10. As a trader, I want a single roll-up verdict (safe/caution/danger) per token, so that I can
    triage quickly.
11. As a trader, I want each signal paper-tracked forward at 1h/24h/7d, so that I learn whether
    following it would have paid.
12. As a trader, I want hypothetical PnL aggregated per wallet, so that I can rank which wallets
    are actually worth copying.
13. As a trader, I want to log a real trade (token, side, size, entry, exit, fees), so that I keep
    an honest record.
14. As a trader, I want realized PnL computed net of fees, so that my track record isn't
    flattering me.
15. As a trader, I want totals across my journal, so that I know if I'm actually making money.
16. As a trader, I want a Telegram alert when a tracked wallet buys, so that I catch moves while
    away from the screen.
17. As a trader, I want a Telegram/in-app alert when a safety flag trips on something I'm watching,
    so that I don't walk into a rug.
18. As a trader, I want alerts also persisted in-app, so that I can review what I missed.
19. As the owner, I want the data model to carry ownership, so that turning this into a
    multi-user product later doesn't require a rewrite.

## Implementation Decisions

- **Decide-only v1.** No private keys, no Jupiter swaps, no transaction signing. Removes custody
  liability and the latency arms race. (ADR-0001)
- **Ingestion = Helius webhooks + Vercel Cron poll.** No always-on gRPC worker; stays serverless
  and Vercel-native. A webhook can watch up to 100k addresses across 80+ parsed tx types, modified
  via API. (ADR-0002)
- **Tracked wallets are hand-seeded** via an admin form; no leaderboard scraping in v1.
- **Safety behind one `SafetyReporter` interface**, implemented by composing RugCheck (public
  API; 10 req/min unauth, 60 auth) + Helius DAS for holder concentration. One swappable adapter.
  (ADR-0003)
- **Signals + paper-tracking:** each tracked-wallet buy → a `Signal`; a cron snapshots the token's
  forward price at fixed horizons → deterministic Hypothetical PnL aggregated per wallet.
- **Manual journal** stores real trades and computes net-of-fees realized PnL.
- **Alerts via one `Notifier` interface**, two adapters: in-app (DB feed, always recorded and
  fully testable) + Telegram.
- **Single-user auth** (NextAuth credentials backed by env account). Data model carries a `User`
  owner so multi-tenant is additive later.
- **Hosting:** Vercel + Neon Postgres + Prisma; Vercel Cron via `vercel.json`; GitHub Actions CI
  against a per-PR Neon branch. (ADR-0004)
- **Deep modules / seams:** `ChainEvents`, `PriceSource`, `SafetyReporter`, `Notifier`, the
  paper-tracking domain module, and Prisma repositories. Each presents a small interface with a
  deep implementation, faked at the seam in tests. See `docs/ARCHITECTURE.md`.

## Testing Decisions

- **Good test = external behavior through a public interface**, not implementation detail. Tests
  cross the same seams callers do and survive internal refactors. No testing of private functions
  or asserting on internal structure.
- **Unit (Vitest):** hypothetical-PnL math, safety-verdict derivation, Solana-address validation,
  webhook payload parsing — exercised with fake adapters.
- **Integration/e2e (Playwright):** real browser through the real app against a real Neon Postgres
  branch; external providers stubbed at their seams (sample Helius webhook payloads; fake
  price/safety/notifier). Each user story above maps to at least one e2e assertion.
- **Console gate:** every slice, open Chrome DevTools and confirm zero console errors before
  marking done.
- **Per-slice CI:** migrations + unit + e2e against an isolated Neon branch; merge blocked on red.

## Out of Scope (v1)

Programmatic/custodial execution and Jupiter swaps; real-time gRPC sniping; the trained
wallet-quality ML score (v1 collects data + deterministic aggregates only); leaderboard
auto-discovery; multi-tenant accounts, billing, and the SaaS surface; mobile app. All tracked in
`docs/ROADMAP.md`.

## Further Notes

- Treat the $100–500 as the R&D budget for the product, not a path to wealth. The durable money in
  this space is in tooling/fees, not directional trades — v1 is built to "sell shovels" later.
- Cheap-validation principle: before building any scoring engine, just measure whether blindly
  following each tracked wallet would have paid (that's exactly what Hypothetical PnL does). If it
  doesn't work even on paper, we learned that for ~$0.
