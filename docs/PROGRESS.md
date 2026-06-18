# PROGRESS — living log

> **This is the resume point for any agent.** Update it at the start and end of every work
> session and every slice. Newest entries at the top of the log. Status legend:
> ⬜ todo · 🟦 in progress · ✅ done · ⛔ blocked.

## Slice checklist (Phase 0)

| # | Slice | Status | Issue | PR |
|---|---|---|---|---|
| — | Repo + context/planning docs scaffold | ✅ | — | (bootstrap) |
| 0 | Walking skeleton (Next.js+Prisma+Neon+auth+CI+deploy) | ✅ (deploy pending) | [#1](https://github.com/sauravs/solMemeBot/issues/1) | [#8](https://github.com/sauravs/solMemeBot/pull/8) |
| 1 | Manage tracked wallets | ✅ | [#2](https://github.com/sauravs/solMemeBot/issues/2) | [#9](https://github.com/sauravs/solMemeBot/pull/9) |
| 2 | Ingest buys → activity feed | ✅ | [#3](https://github.com/sauravs/solMemeBot/issues/3) | [#11](https://github.com/sauravs/solMemeBot/pull/11) |
| 3 | Token safety on signals | ✅ | [#4](https://github.com/sauravs/solMemeBot/issues/4) | [#12](https://github.com/sauravs/solMemeBot/pull/12) |
| 4 | Paper-tracking / hypothetical PnL | 🟦 in PR | [#5](https://github.com/sauravs/solMemeBot/issues/5) | — |
| 5 | Manual trade journal | ⬜ | [#6](https://github.com/sauravs/solMemeBot/issues/6) | — |
| 6 | Telegram alerts | ⬜ | [#7](https://github.com/sauravs/solMemeBot/issues/7) | — |

A slice is **done** only when: unit + Playwright green locally and in CI, Chrome DevTools console
clean, issue → PR → CI green → squash-merged.

## Definition of done (per slice)

- [ ] Vertical: cuts through schema → logic/seam → API → UI → tests
- [ ] Tests written test-first, behavior through public interface, one test → one impl
- [ ] `pnpm test` + `pnpm test:e2e` green locally
- [ ] CI green against a Neon PR branch
- [ ] Chrome DevTools open, **zero console errors**
- [ ] `PROGRESS.md` updated; ADR added if a load-bearing decision was made
- [ ] Issue closed via squash-merged PR

## Open decisions / parking lot

- Price provider for `PriceSource` (Birdeye vs Jupiter price API) — decide at Slice 4.
- **DEPLOYMENT IS INTENTIONALLY DEFERRED (decided 2026-06-18).** The owner will connect Vercel +
  Neon and set production env vars **once all slices are complete** — not per-slice. This is **not
  a blocker** for any slice: local dev runs against Docker Postgres (`docker compose up -d`, port
  5433) and CI runs against a Postgres service container, so auth, DB reads, unit, e2e, lint, and
  build are all fully exercised without a deployment. **Future agents: do NOT block on Vercel/Neon
  and do NOT mark a slice incomplete for lacking a live deploy.** The Slice 0 "deploys to Vercel"
  checkbox is the single deferred item; treat it as a release task for the end. When that time
  comes: connect the repo to Vercel, provision a Neon prod DB, set `DATABASE_URL`/`DIRECT_URL`,
  `AUTH_SECRET`, `APP_USER`, `APP_PASSWORD`, `CRON_SECRET`, and provider keys.
- Telegram bot token + chat id needed before Slice 6 can be verified live (also deferrable —
  use the fake `Notifier` for tests).
- Repo is **public** — decided OK by the owner (2026-06-18). No action needed.
- `auth.ts` imports Prisma and is also used by `middleware.ts`; works today (JWT session, no DB hit
  at the edge), but if middleware ever needs DB-free evaluation, split into an `auth.config.ts`.

## Log

### 2026-06-18
- Analyzed source conversation; ran `/grilling` to lock the 8 architecture decisions (see
  `docs/PRD.md` table and the ADRs).
- Created repo scaffold: `README`, `CONTEXT.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`,
  `docs/ROADMAP.md`, this file, ADRs 0001–0004, `AGENTS.md`/`CLAUDE.md`, `.github/` CI + templates,
  `.env.example`, `.gitignore`. git initialized, remote set to `sauravs/solMemeBot`. Bootstrapped
  `main`, enabled branch protection (PRs required), created labels + 7 slice issues (#1–#7).
- **Slice 0 (in PR):** Next.js 15 (App Router) + Prisma 6 + Auth.js v5 single-user credentials
  gate + dashboard reading the owner row from Postgres + `/api/health`. Local Docker Postgres
  (`docker-compose.yml`, 5433). Tests: Vitest unit (credential validation, 4) + Playwright e2e
  (redirect, bad creds, sign-in reads DB, 3) with a console-error gate. CI workflow present.
  All green locally: unit ✓ e2e ✓ lint ✓ typecheck ✓ build ✓. Only the Vercel deploy item is
  pending (needs user to connect Vercel + Neon).
- **Slice 0 merged** via PR #8 (CI green, squash-merged).
- **Slice 1 (in PR):** TrackedWallet aggregate + migration; dependency-free Solana address
  validation (`lib/solana/address.ts`, base58 decode → 32 bytes); owner-scoped repository
  (`lib/repos/tracked-wallets.ts`); server actions (add/remove) with invalid + duplicate handling;
  `/dashboard/wallets` UI (add form, list, remove) linked from the dashboard. Tests: Vitest unit
  (5 address cases) + Playwright e2e (nav, add→persist-across-reload→remove, invalid rejected,
  duplicate rejected) with the console-error gate. All green locally: unit (9) ✓ e2e (7) ✓ lint ✓
  typecheck ✓ build ✓.
- **Slice 1 merged** via PR #9.
- **Decision recorded (PR #10):** deployment (Vercel + Neon) deferred to the end; not a blocker.
  Repo stays public (owner-approved).
- **Slice 2 (in PR):** `ChainEvents` seam. `Token` + `Signal` aggregates (+ migration), idempotent
  ingestion via `@@unique([walletId, txSig, tokenMint])`. Pure Helius enhanced-webhook parser
  (`lib/chain-events/parse.ts`, SOL/USDC→memecoin buy detection, sell/quote/malformed handling),
  ingestion orchestration (`lib/chain-events/ingest.ts`, tracked-wallets only, P2002-safe), signals
  repo, webhook route (`/api/webhooks/helius`, shared-secret auth), and `/dashboard/feed`. Tests:
  Vitest unit (6 parser cases) + Playwright e2e (auth 401, tracked buy→feed, untracked ignored,
  replay idempotent). e2e made serial (`workers: 1`) since the single-user app shares one DB.
  Green locally: unit (15), e2e (11), lint, typecheck, build.
- **Slice 2 merged** via PR #11 (CI caught a missing `HELIUS_WEBHOOK_SECRET` env — fixed).
- **Slice 3 (in PR):** `SafetyReporter` seam. `SafetyReport` aggregate (one per token) + migration.
  Pure `deriveVerdict` (critical-fail → danger, any-fail → caution, else safe). Two adapters behind
  the seam: deterministic `fake` (checksum-of-mint → flags; used in dev/CI/e2e via
  `SAFETY_PROVIDER=fake`) and real `rugcheck` (pure `mapRugcheckReport` + graceful-degrade fetch).
  `ensureSafetyReport` fetches+stores on first sighting during ingestion (failure-swallowing so it
  never blocks signals). Feed shows a verdict badge; new `/dashboard/token/[mint]` lists each check
  with pass/🚩. Tests: Vitest unit (verdict 5, rugcheck-map 4, fake 3) + Playwright e2e (feed badge
  matches fake contract; token page lists all checks and flags risks). Green locally: unit (27),
  e2e (13), lint, typecheck, build.
- **Slice 3 merged** via PR #12.
- **Slice 4 (in PR):** `PriceSource` seam + Vercel Cron paper-tracking. `PriceSnapshot` aggregate
  (one per signal+horizon) + migration; `signalPriceUsd` switched Decimal→Float for simpler domain
  math. Pure modules: `dueHorizons` (which of 1h/24h/7d are due, clock-injected), `pnlPct` +
  `aggregateWalletPnl` (per-wallet averages). Two PriceSource adapters: deterministic time-varying
  `fake` (PRICE_PROVIDER=fake) and real `jupiter` (pure `mapJupiterPrice` + graceful fetch). Entry
  price captured at ingestion; `/api/cron/snapshots` (CRON_SECRET bearer auth; test-only `?now=`
  override behind `CRON_TIME_OVERRIDE`) records due snapshots idempotently. `/dashboard/performance`
  shows per-wallet hypothetical PnL at each horizon. `vercel.json` schedules the cron hourly. Tests:
  Vitest unit (horizons 6, pnl 7, price 5) + Playwright e2e (cron 401; ingest→cron@+25h→table shows
  PnL matching the fake; cron idempotent). Green locally: unit (45), e2e (15), lint, typecheck, build.
- **Next:** Slice 5 — manual trade journal (#6). Pausing after Slice 4 (resume from this file).
