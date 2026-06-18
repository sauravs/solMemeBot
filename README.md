# solMemeBot

A private, single-user **Solana memecoin analytics dashboard** for swing + smart-money-following
traders. It tracks hand-picked "smart money" wallets, captures their buys as **signals**, runs
**token safety checks**, auto **paper-tracks** hypothetical "if I'd followed" PnL, lets you
**journal** your real trades, and pushes **Telegram + in-app alerts**.

> **v1 is decide-only.** It does NOT custody keys, sign transactions, or place trades. You execute
> manually in your existing tool (Axiom/Photon/Jupiter), then journal the trade here. Execution is
> deliberately deferred — see [`docs/ROADMAP.md`](docs/ROADMAP.md) and
> [`docs/adr/0001-decide-only-v1.md`](docs/adr/0001-decide-only-v1.md).

## Why this exists

The trading itself (on $100–500) is R&D, not the path to wealth. Every tracked signal generates
labeled data — "wallet X bought token Y, here's what happened" — which is the dataset behind the
real commercial wedge: **wallet-quality scoring that filters fake/farmed/wash PnL**. See
[`docs/PRD.md`](docs/PRD.md).

## Status

Phase 0 (private MVP). Live progress and the slice checklist: [`docs/PROGRESS.md`](docs/PROGRESS.md).

## Tech stack

- **Next.js** (App Router) on **Vercel** — UI, API routes, webhook receiver, cron-driven polling.
- **Postgres (Neon)** + **Prisma** — indexed store; per-PR DB branching for isolated CI.
- **Helius** webhooks + REST — tracked-wallet buy events (`ChainEvents` seam).
- **RugCheck** (+ Helius DAS) — token safety (`SafetyReporter` seam).
- **Birdeye/Jupiter price API** — forward price snapshots (`PriceSource` seam).
- **Telegram Bot** + in-app feed — alerts (`Notifier` seam).
- **NextAuth** (credentials) — single-user gate, modular for future multi-tenant.
- **Playwright** — integration/e2e; **Vitest** — unit.

Architecture and the deep-module seams: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
Domain glossary: [`CONTEXT.md`](CONTEXT.md).

## Getting started

```bash
pnpm install
cp .env.example .env        # fill in secrets (see below)
pnpm prisma migrate dev     # apply schema to your Neon dev DB
pnpm dev                    # http://localhost:3000
```

### Environment variables

See [`.env.example`](.env.example). At minimum: `DATABASE_URL` (Neon), `AUTH_SECRET`,
`APP_USER` / `APP_PASSWORD` (single-user login), `HELIUS_API_KEY`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`. `RUGCHECK_*` is optional (public API; auth raises rate limits).

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Run the app locally |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | Playwright integration/e2e |
| `pnpm lint` / `pnpm typecheck` | Lint / TS check |
| `pnpm prisma migrate dev` | Apply migrations locally |

## How we work (for humans and agents)

- **TDD, vertical slices.** One test → one implementation → repeat. Each slice cuts through
  schema → logic → API → UI → tests and is independently demoable.
- **Every slice:** unit + Playwright green, **open Chrome DevTools, confirm zero console errors**,
  then GitHub issue → branch → PR → CI green → squash-merge.
- Full working agreement: [`AGENTS.md`](AGENTS.md).

## License

Private / unlicensed (personal project).
