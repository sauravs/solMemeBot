# PROGRESS — living log

> **This is the resume point for any agent.** Update it at the start and end of every work
> session and every slice. Newest entries at the top of the log. Status legend:
> ⬜ todo · 🟦 in progress · ✅ done · ⛔ blocked.

## Slice checklist (Phase 0)

| # | Slice | Status | Issue | PR |
|---|---|---|---|---|
| — | Repo + context/planning docs scaffold | 🟦 | — | — |
| 0 | Walking skeleton (Next.js+Prisma+Neon+auth+CI+deploy) | ⬜ | — | — |
| 1 | Manage tracked wallets | ⬜ | — | — |
| 2 | Ingest buys → activity feed | ⬜ | — | — |
| 3 | Token safety on signals | ⬜ | — | — |
| 4 | Paper-tracking / hypothetical PnL | ⬜ | — | — |
| 5 | Manual trade journal | ⬜ | — | — |
| 6 | Telegram alerts | ⬜ | — | — |

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
- Confirm Neon project + Vercel project are provisioned (needs user credentials/login).
- Telegram bot token + chat id needed before Slice 6 can be verified live.

## Log

### 2026-06-18
- Analyzed source conversation; ran `/grilling` to lock the 8 architecture decisions (see
  `docs/PRD.md` table and the ADRs).
- Created repo scaffold: `README`, `CONTEXT.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`,
  `docs/ROADMAP.md`, this file, ADRs 0001–0004, `AGENTS.md`/`CLAUDE.md`, `.github/` CI + templates,
  `.env.example`, `.gitignore`. git initialized, remote set to `sauravs/solMemeBot`.
- **Next:** Slice 0 — walking skeleton.
