# REMEDIATION_BACKLOG.md

Items that must be resolved before Phase 01 (Auth/Password Recovery) can be marked verified.

## P0 — Must fix before Auth

| # | Item | Status | Details |
|---|------|--------|---------|
| 1 | Gateway returns success on log-only delivery | `open` | `sendResetPasswordEmail()` must distinguish between "sent to SMTP" and "logged only" |
| 2 | EMAIL_ENABLED=false simulates send silently | `open` | Should return `success: false` when email is disabled |
| 3 | Missing provider triggers silent fallback | `open` | Exception in Nodemailer setup returns fake success |
| 4 | Controller ignores sendResetPasswordEmail() result | `open` | Controller calls function but never checks return value |
| 5 | No SMTP/sandbox delivery evidence | `open` | Need documented smoke test with actual received email |

## P1 — Should fix

| # | Item | Status | Details |
|---|------|--------|---------|
| 6 | E2E not executed for password recovery | `open` | `tests/e2e/auth-full.spec.ts` exists but needs execution |
| 7 | No CI check for snapshot | `open` | GitHub Actions not configured for rescue branch |
| 8 | 11 backend tests failing | `open` | Timeout and response format issues |
| 9 | 21 frontend tests failing | `open` | Component/contract drift |

## P2 — Nice to have

| # | Item | Status | Details |
|---|------|--------|---------|
| 10 | Verify script not executed | `open` | `npm run verify` not run |
| 11 | Skills/ directory duplication | `resolved` | Excluded from import |
| 12 | DEF-001 status correction | `resolved` | Changed from `verified` to `partial` |
