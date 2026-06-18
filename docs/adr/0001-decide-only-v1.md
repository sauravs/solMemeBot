# ADR-0001: v1 is decide-only (no execution, no key custody)

- **Status:** Accepted
- **Date:** 2026-06-18

## Context

solMemeBot's long-term vision includes execution ("analytics + execution"). But execution means
handling private keys and funds. The moment we sign trades — even for ourselves — we take on key
custody, and doing it for others makes us a honeypot and potentially a regulated money transmitter.
Sniping-grade speed (the reason bots custody keys) is also a race we can't win on a small account.

## Decision

v1 is **decide-only**. The tool ingests data, scores/flags it, paper-tracks signals, and journals
trades the user executes manually elsewhere (Axiom/Photon/Jupiter). No private keys, no Jupiter
swap integration, no transaction signing in v1.

## Consequences

- **+** No custody liability, no MEV/latency arms race, far smaller security and test surface,
  faster to ship the data-generating loop that actually creates the product's value.
- **+** Cleaner legal posture for the future commercial phase.
- **−** The signal → trade loop has a manual hop (acceptable for a swing rhythm checked 2–3×/day).
- Execution returns in Phase 1 (custodial-for-self via Jupiter, manual confirm) and Phase 2
  (non-custodial). Revisit then — this ADR does not forbid execution forever, only in v1.
