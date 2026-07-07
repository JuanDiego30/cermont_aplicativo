# 09 — Prohibitions

> Complete list of what is NEVER allowed in this codebase.  
> Each violation blocks the commit and must be fixed before merging.

---

## Zero-Tolerance Type Violations

| Prohibited | Why | Alternative |
|-----------|-----|------------|
| `any` | Disables TypeScript safety | Infer from Zod / Mongoose; use `unknown` + type guard if truly needed |
| `unknown` without type guard | Unsafe consumption | Use `z.parse()` or `instanceof` before accessing properties |
| `null` as return type | Unpredictable consumer behavior | Throw `AppError` on not-found; use `undefined` for optional |
| Unsafe type assertion `as X` | Bypasses type checking | Use Zod `.parse()` for runtime validation |

These are enforced by `npm run quality:zero`.

---

## Forbidden Stack Choices

| Forbidden | Use Instead |
|-----------|------------|
| `pnpm` | `npm 10.9.4` |
| `yarn` | `npm 10.9.4` |
| `NestJS` | Express 5.2.1 |
| `Prisma` | Mongoose 9.x |
| `PostgreSQL` / `MySQL` | MongoDB 7.0 |
| `Sequelize` / `TypeORM` | Mongoose 9.x |
| `Joi` | Zod 4.x |
| `NextAuth` / `Auth.js` | JWT direct + `auth.store.ts` |
| `ESLint` | Biome 2.x |
| `Prettier` | Biome 2.x |
| `Axios` | `apiRequest()` wrapper (native fetch) |
| `express-async-handler` | Express 5 handles async natively |
| `Vercel` / `Netlify` / `Railway` | VPS + PM2 only |

---

## Forbidden Patterns — Backend

| Prohibited | Why | Alternative |
|-----------|-----|------------|
| `try/catch` in controllers | Express 5 propagates async errors | Remove it; let errors bubble |
| Calling Mongoose directly in controllers | Violates SRP / MVC | Move to service or repository |
| Importing `req`/`res`/`next` in services | Couples business logic to HTTP | Extract to controller |
| Hardcoded role strings (e.g., `'admin'`) | Brittle; roles can change | Use constants from `@cermont/domain` |
| Hardcoded route strings | Brittle | Use route constants or enums |
| Business logic in route files | Violates SRP | Move to service |
| Circular imports | Runtime errors | Restructure module boundaries |
| Unused exports | Dead code | Remove with `quality:strict` |

---

## Forbidden Patterns — Frontend

| Prohibited | Why | Alternative |
|-----------|-----|------------|
| `useEffect` for data fetching | Race conditions, no caching | `useQuery` from TanStack Query |
| Raw `fetch()` in components | Bypasses API client, no error handling | `apiRequest()` from `api-client.ts` |
| `Context API` for global state | Performance issues, prop drilling | Zustand |
| `localStorage` for tokens | XSS attack surface | HttpOnly cookies (refresh) + Zustand memory (access) |
| `middleware.ts` in frontend | Deprecated/forbidden in Next.js 16 | `proxy.ts` |
| Duplicating Zod schemas locally | Violates DRY / SSOT | Import from `@cermont/shared-types` |
| God Components > 200 lines | Violates SRP | Split into sub-components |
| `class extends React.Component` | No class inheritance in React | Functional components + hooks |
| Mock data in production code | Security risk; false data | Use real API; seed script for dev |

---

## Forbidden Code Artifacts

| Prohibited | Why |
|-----------|-----|
| `console.log` in source code | Use structured logger; CI enforces this |
| `debugger` statements | Remove before commit |
| `alert()` / `confirm()` | Use modal dialogs instead |
| Commented-out code blocks | Delete dead code; use git history |
| TODO/FIXME without issue reference | Link to a GitHub issue |
| `@ts-ignore` / `@ts-nocheck` | Fix the type error instead |
| `eslint-disable` comments | Biome is the linter; these have no effect |

---

## Forbidden Infrastructure Choices

| Prohibited | Reason |
|-----------|--------|
| Committing `.env` files | Exposes secrets |
| Secrets in Docker images | Use environment variables at runtime |
| `git push --force` to `main` | Always create a revert commit instead |
| `npm install` in CI | Use `npm ci --frozen-lockfile` |
| Skipping `npm run verify` before PR | CI will catch it anyway; fail fast locally |
| `localhost` for MongoDB connection | Use `127.0.0.1` to enforce IPv4 |

---

## Enforcement

The following scripts run automatically:

```bash
npm run quality:weak-tokens    # detects any/unknown/null patterns
npm run quality:language       # detects Spanglish identifiers
npm run quality:semantics      # detects div soup and missing semantic HTML
npm run quality:routes         # detects hardcoded route strings
npm run quality:dtos           # detects duplicated DTOs across workspaces
npm run quality:zero           # zero-tolerance checks
npm run quality:lint-residue   # detects ESLint/Prettier config leftovers
npm run quality:service-size   # detects services > 300 lines
```

`lint-staged` runs `biome check --write` on all staged files before every commit.
