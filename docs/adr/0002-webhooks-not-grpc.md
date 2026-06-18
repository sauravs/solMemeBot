# ADR-0002: Ingest via Helius webhooks + cron poll, not gRPC LaserStream

- **Status:** Accepted
- **Date:** 2026-06-18

## Context

The source research suggested Helius LaserStream (gRPC) as the lowest-latency ingestion path. But
gRPC needs a persistent, always-on consumer — a long-running worker, not serverless — which forces
a heavier deployment (Railway/Fly) and is harder to test. v1 is a swing tool checked 2–3×/day
tracking ~15–20 wallets, where millisecond latency provides no real edge.

## Decision

Ingest via **Helius webhooks** (push to a Next.js API route) for tracked-wallet activity, plus
**Vercel Cron** polling Helius/price REST for enrichment and forward price snapshots. No always-on
gRPC worker in v1.

## Consequences

- **+** Stays serverless and Vercel-native; no separate service to operate; cheap (fits the
  100k-call free tier); easy to test by POSTing sample payloads at the `ChainEvents` seam.
- **+** One Helius webhook can watch up to 100k addresses across 80+ parsed tx types and be
  modified via API — far more than v1 needs.
- **−** Not real-time to the millisecond. Acceptable for swing; explicitly unsuitable for sniping.
- If sniping is ever pursued (not planned — see ROADMAP), gRPC + a worker is a separate, deliberate
  decision behind the same `ChainEvents` interface, so callers and tests are unaffected.
