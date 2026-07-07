# CODEX DO NOT TOUCH

## Purpose

This file defines files, directories, and operations that Codex (or any AI agent) must NEVER modify, delete, or create without explicit user approval. Violating these rules causes broken builds, lost configuration, and unapproved dependency changes.

---

## Never Modify (Without Explicit Approval)

```txt
package.json
package-lock.json
docker-compose.yml
docker-compose.dev.yml
docker/
ecosystem.config.js
.github/
.env
.env.local
.env.example
.env.docker.example
biome.json
turbo.json
tsconfig.base.json
tsconfig.json
```

---

## Never Delete

```txt
packages/config/
packages/domain/
packages/shared-types/
backend/src/config/db.ts
frontend/proxy.ts
docs/
DESIGN.md
```

---

## Never Create

```txt
apps/
apps/backend
apps/frontend
middleware.ts
```

---

## Never Run (Without Explicit User Request)

```bash
git reset --hard
git checkout .
git clean -fd
npm install
npm update
npm audit fix
npm audit fix --force
rm -rf node_modules
```

---

## Dependency Rules

- **Never** add a new npm dependency without user approval
- **Never** remove a dependency without user approval
- **Never** run `npm install` (it modifies `package-lock.json`)
- **Never** change a version number in `package.json`

If a task requires a new dependency, **stop and ask**.

---

## Stack Prohibitions (Hard Block)

The following technologies are FORBIDDEN in this repository. Never introduce them, never suggest them:

| Forbidden | Because |
|-----------|---------|
| NestJS | Backend is Express 5.2.1 only |
| Prisma | Database access is Mongoose 9.x only |
| PostgreSQL / MySQL | Database is MongoDB only |
| Auth.js / NextAuth | Auth is JWT + Zustand only |
| pnpm / yarn | Package manager is npm only |
| Joi | Validation is Zod 4.x only |
| Axios | HTTP client is custom apiClient wrapper |
| `middleware.ts` (frontend) | Security perimeter is `proxy.ts` |
| `express-async-handler` | Express 5 supports async natively |
| Redis | Not part of the stack |
| Vercel | Deployment is VPS only |

---

## File Pattern Rules

- **Never** use `@ts-ignore` or `@ts-expect-error` to suppress type errors
- **Never** use `biome-ignore` to suppress lint warnings
- **Never** use `any` as a type escape hatch
- **Never** use `unknown` without a documented safe refinement policy
- **Never** use `null` or `undefined` to represent absence — use status objects
- **Never** add `console.log`, `debugger`, or `alert` to production code
- **Never** create empty `catch` blocks
- **Never** create mock data files in production source directories

---

## Workspace Boundaries

When working in a workspace, never touch files outside its boundary:

| If working in | Never touch |
|---------------|-------------|
| `backend/` | `frontend/`, `packages/` (except imports) |
| `frontend/` | `backend/`, `packages/` (except imports) |
| `packages/` | `backend/`, `frontend/` |

Cross-workspace changes require explicit approval and a documented reason.
