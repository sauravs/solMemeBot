# PROGRESS — living log

> **This is the resume point for any agent.** Update it at the start and end of every work
> session and every slice. Newest entries at the top of the log. Status legend:
> ⬜ todo · 🟦 in progress · ✅ done · ⛔ blocked.

## Slice checklist (Phase 0)

| # | Slice | Status | Issue | PR |
|---|---|---|---|---|
| — | Repo + context/planning docs scaffold | ✅ | — | (bootstrap) |
| 0 | Walking skeleton (Next.js+Prisma+Neon+auth+CI+deploy) | ✅ (deploy pending) | [#1](https://github.com/sauravs/solMemeBot/issues/1) | [#8](https://github.com/sauravs/solMemeBot/pull/8) |
| 1 | Manage tracked wallets | 🟦 in PR | [#2](https://github.com/sauravs/solMemeBot/issues/2) | — |
| 2 | Ingest buys → activity feed | ⬜ | [#3](https://github.com/sauravs/solMemeBot/issues/3) | — |
| 3 | Token safety on signals | ⬜ | [#4](https://github.com/sauravs/solMemeBot/issues/4) | — |
| 4 | Paper-tracking / hypothetical PnL | ⬜ | [#5](https://github.com/sauravs/solMemeBot/issues/5) | — |
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
- **Next:** Slice 2 — ingest buys → activity feed (#3). Per user instruction, pausing after
  Slice 1 this session.
