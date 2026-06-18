# Architecture — solMemeBot v1

Built on the **deep-module** design vocabulary: a deep module is *a lot of behavior behind a small
interface, placed at a clean seam, testable through that interface*. Every external provider sits
behind an **adapter** at a **seam**, so tests use fakes and providers stay swappable. We prefer the
**fewest seams** possible and the **highest** seam (test through the interface callers use).

Vocabulary note: we say **module / interface / seam / adapter / depth**, not
"component/service/API/boundary". See `CONTEXT.md` for the *domain* language.

## Runtime shape

All-Next.js on Vercel. No separate worker service in v1.

```
                        ┌────────────────────────── Vercel (Next.js, App Router) ──────────────────────────┐
   Helius webhook  ─POST▶  /api/webhooks/helius ──▶ ChainEvents ──▶ Signal repo ──▶ Notifier (in-app+TG)    │
   Vercel Cron ────tick──▶  /api/cron/snapshots ──▶ PriceSource ──▶ PriceSnapshot repo ─▶ paper-PnL module  │
   Browser  ──────────────▶  Dashboard pages (auth-gated) ──▶ repositories ──▶ ──────────────────────────┐ │
                        └──────────────────────────────────────────────────────────────────────────────┘ │
                                                  │                                                        │
                                          ┌───────▼────────┐                                               │
                                          │  Neon Postgres │◀──────── Prisma repositories ─────────────────┘
                                          └────────────────┘
   External providers (each behind an adapter): Helius (events/DAS), RugCheck (safety),
   Birdeye/Jupiter (price), Telegram (alerts).
```

## Seams (deep modules)

Each is a small interface with a deep implementation; the **interface is the test surface**.

| Seam | Interface (intent) | v1 adapter | Faked in tests by |
|---|---|---|---|
| `ChainEvents` | source of tracked-wallet **buys** (`onWebhook(payload) -> Signal[]`, `fetchRecentBuys(wallet)`) | Helius webhook receiver + REST poll; verifies, parses swaps, dedups by tx sig | POSTing sample Helius payloads |
| `PriceSource` | `getPrice(mint, at?) -> UsdPrice` | Birdeye / Jupiter price API | in-memory fake returning seeded prices + controlled clock |
| `SafetyReporter` | `getSafetyReport(mint) -> SafetyReport` | composes RugCheck (+ Helius DAS holder concentration) → flags + verdict | fake returning canned reports |
| `Notifier` | `notify(alert) -> void` | in-app (DB feed) **and** Telegram bot | fake recording dispatched alerts |
| paper-tracking | pure: `computeHypotheticalPnl(signal, snapshots) -> Pnl` | n/a (domain logic) | called directly with fixtures |
| persistence | one Prisma repository per aggregate | Prisma over Neon | Neon PR-branch DB (integration) |

**Design rules followed:**
- *Accept dependencies, don't create them* — domain logic takes `PriceSource`/`SafetyReporter`,
  never `new`s a client.
- *Return results, don't mutate* — paper-tracking is pure; persistence happens at the edges.
- *One adapter = hypothetical seam, two = real* — we only introduce a seam where something varies
  (e.g. in-app vs Telegram justifies the `Notifier` seam).

## Data model (Prisma sketch)

> Indicative shapes; the authoritative schema lives in `prisma/schema.prisma`. Money as
> integer/decimal, not float.

- `User(id, email, passwordHash, createdAt)` — single owner in v1; every owned row references it.
- `TrackedWallet(id, ownerId, address @unique-per-owner, label, isActive, createdAt)`
- `Token(mint @id, symbol, name, firstSeenAt)`
- `Signal(id, walletId, tokenMint, txSig @unique, side='buy', signalPriceUsd, observedAt)`
- `PriceSnapshot(id, signalId, horizon, priceUsd, capturedAt)` — `@@unique([signalId, horizon])`
- `SafetyReport(id, tokenMint, verdict, flags Json, fetchedAt)`
- `JournalEntry(id, ownerId, tokenMint, side, size, entryPriceUsd, exitPriceUsd?, feesUsd, realizedPnlUsd?, openedAt, closedAt?)`
- `Alert(id, ownerId, type, payload Json, channel, sentAt, readAt?)`

Indexes on `Signal(walletId, observedAt)`, `Signal(tokenMint)`, `Alert(ownerId, sentAt)`.

## Directory layout (target)

```
app/                      # Next.js App Router (pages, auth-gated dashboard)
  api/
    webhooks/helius/      # ChainEvents receiver
    cron/snapshots/       # price snapshotting + paper PnL
    health/               # /health
  (dashboard)/            # wallets, feed, signals, journal, alerts
lib/
  chain-events/           # ChainEvents interface + helius adapter + fake
  price/                  # PriceSource interface + adapter + fake
  safety/                 # SafetyReporter interface + rugcheck adapter + fake
  notify/                 # Notifier interface + in-app + telegram + fake
  paper-tracking/         # pure hypothetical-PnL domain logic
  repos/                  # Prisma repositories
  auth/                   # NextAuth config (single-user)
prisma/schema.prisma
tests/
  unit/                   # Vitest
  e2e/                    # Playwright
```

## Why this is testable & AI-navigable

- One concept = one folder under `lib/`, each owning an interface + adapter(s) + fake. An agent
  finds the seam, reads the interface, writes a test against it.
- The deletion test passes for each seam: delete the `SafetyReporter` interface and the safety
  logic would smear across every caller — it concentrates real complexity, so it earns its keep.
- External flakiness (rate limits, network) is quarantined inside adapters; domain logic is pure
  and deterministic.
