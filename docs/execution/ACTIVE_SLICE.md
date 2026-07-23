# ACTIVE_SLICE.md

Phase: 01
Module: Authentication / Password Recovery
Status: in_progress
Next allowed phase: TBD (after Auth verified)

## Scope

- Complete password recovery flow (backend service + controller + frontend)
- Email delivery adapter (SMTP, Mailpit, Log)
- Token lifecycle (CSPRNG, hash storage, expiry, single use, session revocation)
- Tests: 17 service + 10 controller tests
- Gates: typecheck, lint, test

## Out of scope (remaining for verification)

- E2E with Mailpit sandbox (requires running backend + frontend)
- Sandbox delivery screenshot
- Production smoke test

## Branch

- Worktree: `../cermont-integration`
- Branch: `fix/auth-password-recovery`
- Base: `origin/integration/documentation-baseline`
