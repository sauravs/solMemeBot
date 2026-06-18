# AGENTS.md — working agreement

Read this first. It tells any agent (or human) how to work in this repo without losing context.

## Orient (read in this order)

1. `docs/PROGRESS.md` — **the resume point**: what's done, what's next, blockers.
2. `CONTEXT.md` — domain glossary. Use these exact terms in code, tests, commits, issues.
3. `docs/PRD.md` — what we're building and why; user stories.
4. `docs/ARCHITECTURE.md` — the deep-module **seams** and data model.
5. `docs/adr/` — decisions already made. **Do not re-litigate** an ADR; if you must, write a new
   superseding ADR with reasons.

## Non-negotiable working rules

- **TDD, vertical slices.** One test → one implementation → repeat. Never write all tests then all
  code (no horizontal slicing). Each slice cuts schema → logic/seam → API → UI → tests and is
  independently demoable.
- **Test behavior through public interfaces** (the seams), not implementation details. A test that
  breaks on an internal rename was testing the wrong thing.
- **Respect the seams.** External providers (Helius, RugCheck, price, Telegram) live behind their
  adapter under `lib/<seam>/`, with a fake for tests. Don't call providers directly from domain
  logic or pages. Accept dependencies; don't `new` them.
- **Per-slice definition of done** (also in `docs/PROGRESS.md`):
  - [ ] `pnpm test` (unit) and `pnpm test:e2e` (Playwright) green locally
  - [ ] CI green against the Neon PR branch
  - [ ] **Open Chrome DevTools, confirm zero console errors**
  - [ ] `docs/PROGRESS.md` updated (status + log entry); ADR added if a load-bearing call was made
  - [ ] Issue → branch → PR → CI green → squash-merge

## Git / GitHub flow (DevOps)

- `main` is protected — no direct pushes. One GitHub **issue per slice**, then:
  `git switch -c slice-N-short-name` → commit (conventional commits) → open PR → CI green →
  squash-merge → delete branch.
- Hit a blocker mid-slice? **Open a GitHub issue** describing it, fix on a branch, PR, merge.
- Keep PRs scoped to one slice. Reference the issue (`Closes #N`).
- Commit message footer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Conventions

- Use **context7** (MCP is configured in `.mcp.json`) to pull current docs for Next.js, Prisma,
  Helius, RugCheck, NextAuth, Telegram, Playwright before using their APIs — don't code from memory.
- Money is integer/decimal, never float. Times are UTC.
- Update `CONTEXT.md` the moment you coin or sharpen a domain term (don't batch).
- Secrets only via env (`.env` is gitignored; `.env.example` documents them). Never commit keys.

## Useful commands

```bash
pnpm dev            # run locally
pnpm test           # unit (Vitest)
pnpm test:e2e       # Playwright
pnpm lint typecheck # quality gates
pnpm prisma migrate dev
```
