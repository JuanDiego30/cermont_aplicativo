# Observability Plan

Status: technical draft for Spec 003 Slice 6.

## Current Signals

| Signal | Current source | Gap |
|---|---|---|
| Liveness | `/api/health/live` | Add uptime and build metadata |
| Readiness | `/api/health/ready` | Add dependency latency buckets |
| Metrics | `/api/metrics` and analytics routes | Define retention and dashboard owner |
| Audit | `/api/audit` plus new file/privacy events | Add alert rules for sensitive downloads |
| Frontend errors | optional Sentry wrapper | Confirm runtime provider and DSN policy |

## Required Gates

1. Keep health endpoints unauthenticated but non-sensitive.
2. Add release metadata to server logs and `/about`.
3. Add alerting for authentication rate limits, file downloads, privacy requests, and failed readiness.
4. Review log retention with legal/privacy counsel before production rollout.
5. Document incident response ownership before claiming operational maturity.

## Open Risks

- No legal claim is made about retention compliance.
- No production alert destination is configured in this slice.
- Sentry remains optional and must be enabled by environment policy.
