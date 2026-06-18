# ADR-0004: Vercel + Neon Postgres + Prisma

- **Status:** Accepted
- **Date:** 2026-06-18

## Context

v1 needs: Next.js hosting, public HTTPS webhook endpoints, scheduled polling, a relational store
for Prisma, a tight budget, and — for the TDD requirement — preview deploys plus an isolated test
database per CI run.

## Decision

- **Vercel** hosts Next.js natively: webhook routes + **Vercel Cron** for polling (no separate
  worker), preview deploy per PR, production deploy on merge.
- **Neon** serverless Postgres with **database branching**: a throwaway branch per PR/CI run gives
  real integration tests against real Postgres in isolation. Generous free tier, first-class Prisma
  support.
- **Prisma** as ORM/migrations; **GitHub Actions** for CI.

## Consequences

- **+** Cheapest path that still scales toward the SaaS phase; minimal ops; real-Postgres
  integration tests without shared-state flakiness.
- **+** Cron-as-a-service and webhook hosting come free with the platform.
- **−** Vercel function timeouts constrain long-running work — fine for v1 (webhook handling and
  short cron jobs); a heavier ingestion worker (if ever needed) would live elsewhere.
- **−** Two managed vendors (Vercel + Neon) instead of one all-in-one (e.g. Railway); accepted for
  the per-PR DB branching and native cron benefits.
