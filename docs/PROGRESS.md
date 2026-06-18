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
| 4 | Paper-tracking / hypothetical PnL | ✅ | [#5](https://github.com/sauravs/solMemeBot/issues/5) | [#13](https://github.com/sauravs/solMemeBot/pull/13) |
| 5 | Manual trade journal | ✅ | [#6](https://github.com/sauravs/solMemeBot/issues/6) | [#14](https://github.com/sauravs/solMemeBot/pull/14) |
| 6 | Telegram alerts | 🟦 in PR | [#7](https://github.com/sauravs/solMemeBot/issues/7) | — |

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

### 2026-06-18 — UI/UX presentation pass (post Phase 0)
- Presentation-only redesign begun (no logic/data-model/seam changes). Decisions locked with owner:
  **hand-rolled CSS** (extend `globals.css`, no Tailwind/component-kit, zero new deps) and a
  **persistent left sidebar**. Slice plan: 1) shell + tokens + components; then one slice per page.
- **UI Slice 1 (in PR, #16):** Design tokens + reusable component classes in `app/globals.css`
  (spacing/radius/typography vars, `.btn`/`.btn-ghost`/`.btn-danger`, `.card`/`.card-grid`,
  `.field`, `.empty`, app-shell/sidebar; kept `.panel`/`.badge`/`.pnl-*`/`.error`/`.muted`).
  New `app/dashboard/layout.tsx` renders the sidebar chrome (brand, section nav carrying the
  `nav-*` testids, sign-out); the hub page (`/dashboard`) is now an overview (header + account
  panel + section cards) with the nav list + sign-out moved into the sidebar.
  - **Gotcha (recorded):** a `usePathname` **client** sidebar component tripped the console-error
    gate — Next 15.1.4 **dev** mode throws `__webpack_require__.n is not a function` on the *first*
    cold-compile of the app's first client component (independent of which Next module is imported),
    and CI runs `pnpm dev`. Resolved by making the sidebar a pure **server component** (plain `<a>`
    links). Tradeoff: no active-link highlighting this slice — revisit later via a middleware-set
    pathname header (touches non-UI code, discuss first).
  - Gates green locally: unit 54 ✓, e2e 21 ✓, typecheck ✓, lint ✓, DevTools console clean
    (enforced by the e2e console gate). All `data-testid`/labels/button names preserved.
- **UI Slice 2 (in PR, #18):** login restyle (`app/login/page.tsx`) — standalone centered auth
  card (`.auth-shell`/`.auth-card`/`.auth-brand`) using the Slice 1 system: `.field` groups,
  focus rings, full-width Sign in. Preserved heading **solMemeBot**, labels **Email**/**Password**,
  button **Sign in**, `data-testid="login-error"`, and the server-action/redirect behavior.
  Gates green: unit 54 ✓, e2e 21 ✓, typecheck ✓, lint ✓, console clean.
- **UI Slice 3 (in PR, #20):** tracked-wallets restyle (`app/dashboard/wallets/page.tsx`) —
  `.page-header` (dropped the redundant "← Dashboard" link), `.field` form groups, new reusable
  `.list`/`.list-row` pattern (for later feed/alerts slices), monospace address, `.btn-danger`
  Remove, `.empty` empty state. Preserved heading **Tracked wallets**, labels **Wallet address**/
  **Label (optional)**, button **Add wallet**, and testids `wallet-list`/`wallet-row`/`wallet-label`/
  `wallet-address`/`remove-wallet`/`empty-state`/`add-error`. Gates green: unit 54 ✓, e2e 21 ✓,
  typecheck ✓, lint ✓, console clean.
- **UI Slice 4 (in PR, #22):** feed + token-detail restyle. Feed (`feed/page.tsx`): `.page-header`,
  `.list-row` rows, `.row-main`/`.row-meta`/`.row-time` helpers, kept `SafetyBadge`, dropped
  back-link. Token (`token/[mint]/page.tsx`): `.page-header` with contextual "← Activity feed",
  verdict badge, checks via `.list-row`, `.empty` no-flags. Preserved feed testids `signal-list`/
  `signal-row`/`signal-wallet`/`signal-token`/`feed-empty` + `safety-badge[data-verdict]`, and token
  testids `token-mint`/`token-verdict[data-verdict]`/`flag-list`/`safety-flag[data-passed]`/`no-flags`.
  Gates green: unit 54 ✓, e2e 21 ✓, typecheck ✓, lint ✓, console clean.
- **UI Slice 5 (in PR, #24):** wallet-performance restyle (`performance/page.tsx`) — `.page-header`
  (dropped back-link), new reusable `.table` class (uppercase muted headers, row borders), `.empty`
  empty state; kept `pnl-pos`/`pnl-neg` coloring + `fmtPct`. Preserved heading **Wallet performance**
  and testids `performance-table`/`performance-row[data-wallet]`/`pnl-1h|24h|7d`/`performance-empty`
  and the exact PnL text format. Gates green: unit 54 ✓, e2e 21 ✓, typecheck ✓, lint ✓, console clean.

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
- **Slice 4 merged** via PR #13.
- **Slice 5 (in PR):** `JournalEntry` aggregate + migration. Pure `realizedPnl` ((exit−entry)×qty−fees)
  and `sumRealizedPnl` (nulls = open, excluded). Owner-scoped repo; server actions (add/remove) with
  validation (positive qty/entry, optional valid exit). `/dashboard/journal` — form, entries table
  (open shows "—"), and a net-of-fees totals row (closed/logged counts). Tests: Vitest unit
  (realizedPnl, sumRealizedPnl) + Playwright e2e (closed trade PnL+totals, open excluded, multi-trade
  sum, invalid rejected). Green locally: unit (50), e2e (19), lint, typecheck, build.
- **Slice 5 merged** via PR #14.
- **Slice 6 (in PR) — FINAL SLICE:** `Notifier` seam. `Alert` aggregate + migration. Three adapters:
  `inAppNotifier` (persists Alert rows), `telegramNotifier` (pure `buildTelegramText` + no-op when
  unconfigured), and `compositeNotifier` (fans out, error-contained). Ingestion emits an alert per
  new signal — `safety_danger` when the token's verdict is danger, else `wallet_buy` — in-app +
  Telegram. `/dashboard/alerts` lists them. Tests: Vitest unit (composite dispatch incl.
  one-channel-throws, Telegram text) + Playwright e2e (healthy buy → wallet_buy alert; danger buy →
  safety_danger alert). Green locally: unit (54), e2e (21), lint, typecheck, build.

## 🎉 Phase 0 feature-complete (pending merge of #7)

All 7 slices done. v1 delivers: single-user auth → manage tracked wallets → ingest their buys
(Helius) → token safety (RugCheck/fake) → forward price snapshots + per-wallet hypothetical PnL
(cron) → manual trade journal → in-app + Telegram alerts. Six clean seams (`ChainEvents`,
`SafetyReporter`, `PriceSource`, `Notifier`, paper-tracking, persistence), each faked in tests.

**Remaining before real use (the only deferred items):** connect Vercel + Neon and set production
env (`DATABASE_URL`, `AUTH_SECRET`, `APP_USER`/`APP_PASSWORD`, `CRON_SECRET`, `HELIUS_*`,
`TELEGRAM_*`; leave `SAFETY_PROVIDER`/`PRICE_PROVIDER` unset for the real adapters; do NOT set
`CRON_TIME_OVERRIDE`); register the Helius webhook → `/api/webhooks/helius`; seed real smart-money
wallets. Then Phase 1 (wallet-quality score, programmatic execution) per `docs/ROADMAP.md`.
