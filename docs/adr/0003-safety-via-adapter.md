# ADR-0003: Token safety behind one SafetyReporter adapter (integrate, don't build)

- **Status:** Accepted
- **Date:** 2026-06-18

## Context

The safety layer (honeypot / unlocked-liquidity / mint-authority / holder-concentration / bundle
checks) is core to "avoid losses," which is where most memecoin traders die. Building these checks
from raw RPC/chain data is slow and easy to get subtly wrong — and a *wrong* safety check is the
dangerous kind of bug (it greenlights a rug). Established providers (RugCheck, GoPlus, Birdeye)
already do this well; RugCheck offers a free public API (10 req/min unauth, 60 auth).

## Decision

Define a single **`SafetyReporter`** interface (`getSafetyReport(mint) -> SafetyReport`) and
implement it by **composing external providers** — RugCheck for the hard checks plus Helius DAS for
holder concentration — behind that one adapter.

## Consequences

- **+** Fast, accurate, and testable: callers depend on the interface; tests use a fake returning
  canned reports. Providers can be added/swapped without touching callers (one adapter today; a
  second would make the seam "real").
- **+** Avoids a large, dangerous, build-from-scratch test surface.
- **−** Runtime dependency on third-party availability/rate limits — quarantined inside the adapter
  (caching, fallback, and graceful degradation live there, not in domain logic).
