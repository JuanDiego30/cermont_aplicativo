# Pull Request Checklist

> Complete before opening or requesting review on any PR.

---

## Scope & Purpose

- [ ] PR title follows Conventional Commits format: `type(scope): description`
- [ ] PR description explains: what changed, why, and how to test it.
- [ ] PR is scoped to a single logical change (not a multi-feature dump).
- [ ] All pre-commit checklist items are satisfied.

## Quality Gates

- [ ] `npm run verify` passes locally (typecheck + lint + test + build + quality:strict).
- [ ] CI pipeline is green (GitHub Actions).
- [ ] Coverage is not degraded below threshold (≥80% backend, ≥40% frontend).
- [ ] No new Qodana issues introduced.

## Architecture

- [ ] No forbidden stack introduced (check `.agents/rules/01-stack.md`).
- [ ] No new middleware.ts created.
- [ ] No business logic in route files or controllers.
- [ ] No type duplicated — SSOT respected.
- [ ] Shared-types built and typechecked if schemas were changed.

## Security

- [ ] New routes have `authenticate` + `authorize()` middleware.
- [ ] No secrets in source code or environment variable comments.
- [ ] RBAC roles match the permitted matrix in `.agents/rules/05-security.md`.
- [ ] Rate limiting applied to new auth-adjacent endpoints.

## Testing

- [ ] New behavior has test coverage.
- [ ] Bug fixes have a regression test.
- [ ] E2E tests pass for affected user flows.
- [ ] No test was modified to make it pass instead of fixing the code.

## Documentation

- [ ] If an API contract changed, DOC-10 is updated (or a follow-up issue is created).
- [ ] If a schema changed, DOC-09 is updated (or a follow-up issue is created).
- [ ] If behavior changed, the relevant docs/agents workspace file is updated.

## Review Ready

- [ ] PR is not a draft.
- [ ] At least one reviewer is assigned.
- [ ] All TODO/FIXME comments reference a GitHub issue number.
