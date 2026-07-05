# Pre-Commit Checklist

> Run before `git commit`. All items must be ✅ before committing.

---

## TypeScript

- [ ] `npm run typecheck -w backend` — 0 errors
- [ ] `npm run typecheck -w frontend` — 0 errors
- [ ] `npm run typecheck -w @cermont/shared-types` — 0 errors (if touched)
- [ ] No `@ts-ignore` or `@ts-nocheck` added.
- [ ] No `any` type introduced.

## Lint & Format

- [ ] `npm run lint -w backend` — 0 Biome errors
- [ ] `npm run lint -w frontend` — 0 Biome errors
- [ ] No `console.log` left in source code.
- [ ] No `debugger` statements left.
- [ ] No `alert()` or `confirm()` in frontend.
- [ ] No commented-out code blocks.

## Quality

- [ ] `npm run quality:weak-tokens` — passes (no `any`/`unknown`/`null` patterns)
- [ ] `npm run quality:language` — passes (no Spanglish identifiers)
- [ ] `npm run quality:semantics` — passes (no div soup)
- [ ] No hardcoded role strings (use constants from `@cermont/domain`).
- [ ] No hardcoded route strings.

## Tests

- [ ] `npm run test -w backend` — all pass (or new tests added for new code)
- [ ] `npm run test -w frontend` — all pass
- [ ] No test was deleted to make CI green.
- [ ] New features have at least one Vitest test.

## Security

- [ ] No secrets hardcoded in source code.
- [ ] No token in localStorage — using HttpOnly cookie (refresh) + Zustand memory (access).
- [ ] RBAC `authorize()` middleware present on all new protected routes.
- [ ] No new route added to `proxy.ts` public exemptions without justification.

## Architecture

- [ ] No `try/catch` added to controllers.
- [ ] No Mongoose call in controllers or routes.
- [ ] No `req`/`res`/`next` imported in services.
- [ ] No type duplicated — using `@cermont/shared-types`.
- [ ] `middleware.ts` not created or modified in frontend.

## Commit Message

- [ ] Commit message follows Conventional Commits: `type(scope): description`
- [ ] Examples: `feat(backend): add order export endpoint`, `fix(frontend): replace useEffect with useQuery`
- [ ] No `WIP`, `temp`, `test commit`, or similar placeholder messages.
