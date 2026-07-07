# 01 — Stack Reference

> Canonical source for exact versions, package manager rules, workspace commands, and forbidden alternatives.  
> If `package.json` and this file conflict, **`package.json` wins** — update this file.

---

## Package Manager (Non-Negotiable)

**Use `npm` exclusively.**  
`packageManager` field in root `package.json`: `npm@10.9.4`

```bash
# ✅ Correct
npm install
npm run dev -w backend
npm ci

# ❌ Forbidden — will invalidate the work
pnpm install
yarn install
```

---

## Node.js

- Minimum version: `>=22.20.0`
- Managed via `.nvmrc` / `engines` field in `package.json`.

---

## Exact Version Table

| Technology | Version | Notes |
|-----------|---------|-------|
| npm | 10.9.4 | locked via `packageManager` field |
| Node.js | ≥ 22.20.0 | engines constraint |
| TypeScript | 6.0.3 | strict mode, no `any` |
| **Backend** | | |
| Express | 5.2.1 | async errors propagate without try/catch |
| Mongoose | 9.5.0 | MongoDB ODM |
| MongoDB | 7.0 | local via Docker; IPv4 `127.0.0.1` |
| Zod | 4.3.6 | validation on both frontend and backend |
| bcryptjs | 3.0.3 | password hashing |
| Helmet | 8.1.0 | HTTP security headers |
| express-rate-limit | 8.3.2 | rate limiting |
| pdf-lib | 1.17.1 | PDF generation |
| jsonwebtoken | 9.x | JWT signing/verification |
| **Frontend** | | |
| Next.js | 16.2.4 | App Router only |
| React | 19.2.5 | — |
| React DOM | 19.2.5 | — |
| TanStack Query | 5.99.2 | server state management |
| Zustand | 5.0.12 | client UI state |
| Tailwind CSS | 4.2.4 | utility-first CSS |
| Radix UI | latest compatible | accessible primitives |
| React Hook Form | 7.73.1 | form management |
| Serwist | 9.5.7 | PWA / Service Worker |
| Framer Motion | 12.x | animations |
| GSAP | 3.15.0 | complex animations |
| Lucide React | 1.8.0 | icons |
| Recharts | 3.8.1 | charts |
| Sonner | 2.x | toast notifications |
| **Dev / Tooling** | | |
| Biome | 2.4.12 | lint + format (replaces ESLint + Prettier) |
| Turborepo | 2.9.6 | monorepo task runner |
| Vitest | 4.1.5 | unit + integration testing |
| Playwright | 1.59.1 | E2E testing |
| Husky | 9.1.7 | git hooks |
| lint-staged | 16.4.0 | staged file checks |
| tsx | 4.21.0 | TypeScript execution |

---

## Workspaces

```json
"workspaces": ["backend", "frontend", "packages/shared-types"]
```

| Workspace | Name | Purpose |
|-----------|------|---------|
| `backend/` | `@cermont/backend` | Express 5 API |
| `frontend/` | `@cermont/frontend` | Next.js 16 App |
| `packages/shared-types/` | `@cermont/shared-types` | Zod schemas + types |

Note: `packages/domain` and `packages/config` may be referenced in docs but verify presence in current `package.json`.

---

## Root Commands

```bash
npm run dev           # backend + frontend concurrently (Turborepo)
npm run build         # full production build
npm run typecheck     # TypeScript check in all workspaces
npm run lint          # Biome lint in all workspaces
npm run test          # Vitest in all workspaces
npm run verify        # contracts:check + typecheck + lint + test + build + quality:strict
npm run quality:strict # all custom quality checks
npm run clean         # delete build artifacts + node_modules cache
```

## Workspace-Scoped Commands

```bash
# Backend
npm run dev -w backend
npm run build -w backend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend

# Frontend
npm run dev -w frontend
npm run build -w frontend
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run test:ci -w frontend
npm run test:e2e -w frontend

# Shared types
npm run build -w @cermont/shared-types
npm run typecheck -w @cermont/shared-types
```

## Single Test Examples

```bash
# One Vitest file — backend
npm run test -w backend -- tests/services/order.service.test.ts

# One Vitest file — frontend
npm run test -w frontend -- tests/lib/sync-queue.test.ts

# One test by name
npm run test -w frontend -- -t "deduplicates entries in volatile fallback storage"

# All Playwright E2E
npm run test:e2e -w frontend

# Playwright by title
npm run test:e2e -w frontend -- --grep "login"
```

---

## Forbidden Alternatives (Zero Exceptions)

| Forbidden | Reason | Use Instead |
|-----------|--------|------------|
| `pnpm` / `yarn` | project uses npm workspaces | `npm` |
| `NestJS` | wrong framework | Express 5.2.1 |
| `Prisma` / `PostgreSQL` / `Sequelize` | wrong database layer | Mongoose 9.x + MongoDB |
| `Joi` | wrong validator | Zod 4.x |
| `NextAuth` / `Auth.js` | wrong auth approach | JWT direct + Zustand auth store |
| `ESLint` + `Prettier` | replaced by Biome | Biome 2.x |
| `Axios` | not needed | `apiRequest()` wrapper with native fetch |
| `express-async-handler` | Express 5 handles async natively | no wrapper needed |
| `Context API` for global state | wrong state manager | Zustand |
| `middleware.ts` in frontend | deprecated/forbidden in Next.js 16 | `proxy.ts` |
| `localStorage` for tokens | security violation | HttpOnly cookies |
| Vercel / Netlify / Railway / Render | deployment policy | VPS only + PM2 |
| `localhost` for MongoDB | IPv4 resolution issues on Windows | `127.0.0.1` |

---

## Linting & Formatting

Tool: **Biome 2.x** (replaces both ESLint and Prettier)

```bash
biome lint .                   # lint only
biome format . --write         # format only
biome check --write .          # lint + format + fix
```

`lint-staged` config (root `package.json`) runs `biome check --write` on all staged `.ts`, `.tsx`, `.json` files before commit.
