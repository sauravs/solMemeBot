# CLAUDE.md

This project's working agreement for AI agents lives in **[`AGENTS.md`](AGENTS.md)** — read it
first, then `docs/PROGRESS.md` for the current resume point.

Quick reminders:
- TDD, **vertical slices**, one test → one implementation. Test behavior through the seams.
- External providers stay behind their adapter in `lib/<seam>/` with a fake for tests.
- Every slice: unit + Playwright green, **Chrome DevTools console clean**, issue → PR → squash-merge.
- Use **context7** for up-to-date library docs (Next.js, Prisma, Helius, RugCheck, NextAuth,
  Telegram, Playwright). Don't re-litigate `docs/adr/`.
- Domain language is in `CONTEXT.md` — use those terms exactly.
