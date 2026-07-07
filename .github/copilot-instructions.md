# Cermont S.A.S. — Copilot Instructions

## Read this first
- Use these docs as the source of truth before architecture/security/contract changes:
  - `docs/Intrucciones_para_crear_app_web/DOC-11 — Plan de Ejecución y Reglas del Agente Programador.md`
  - `docs/Intrucciones_para_crear_app_web/DOC-09 — Diccionario de Datos  Esquemas Zod + Modelos Mongoose.md`
  - `docs/Intrucciones_para_crear_app_web/DOC-10 — Contratos de API REST  Endpoints, Roles y Payloads.md`
  - `docs/AUDIT-00-Prompt-Maestro-Opus-V2.md` and `docs/AUDIT-08-Issues-Documentacion-Orquestacion.md` when the work is audit/remediation focused
- This repository uses **npm workspaces** (`packageManager: npm@10.9.4` in root `package.json`).

## Stack constraints (non-negotiable)
- **Use:** Express 5.2.1, Mongoose 9.x, Zod 4.x, Next.js 16, React 19, TanStack Query v5, Zustand 5, Tailwind 4, Radix UI
- **Never use:** Prisma, PostgreSQL, Sequelize, Joi, NestJS, NextAuth/Auth.js, pnpm/yarn, Axios, `express-async-handler`

## Build, lint, and test commands

### Root workspace commands
- `npm run dev` — run backend + frontend concurrently
- `npm run build` — build shared packages first, then backend, then frontend
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run verify` — typecheck + build
- `npm run ci:quality` — typecheck + lint + frontend CI tests

### Package-scoped commands
- `npm run dev -w backend`
- `npm run dev -w frontend`
- `npm run build -w backend`
- `npm run build -w frontend`
- `npm run build -w @cermont/shared-types`
- `npm run typecheck -w backend`
- `npm run typecheck -w frontend`
- `npm run lint -w backend`
- `npm run lint -w frontend`
- `npm run test -w backend`
- `npm run test -w frontend`
- `npm run test:e2e -w frontend`

### Running a single test
- Backend Vitest file:
  - `npm run test -w backend -- tests/services/order.service.test.ts`
- Frontend Vitest file:
  - `npm run test -w frontend -- tests/lib/env-validator.test.ts`
- Frontend test by name:
  - `npm run test -w frontend -- -t "validates NEXT_PUBLIC_API_URL"`
- Frontend Playwright spec:
  - `npm run test:e2e -w frontend -- tests/e2e/login.spec.ts`
- Frontend Playwright by title:
  - `npm run test:e2e -w frontend -- --grep "login"`

## High-level architecture (big picture)

### Monorepo structure
- `backend/` — Express 5 + Mongoose API
- `frontend/` — Next.js 16 App Router UI (React 19)
- `packages/shared-types` — shared Zod schemas and API contracts
- `packages/domain` — RBAC roles, permissions, route access helpers
- `packages/config` — shared env validation utilities

### Backend flow
1. `backend/src/server.ts` bootstraps in strict order: `validateEnv()` → `connectDB()` → `app.listen()`.
2. `backend/src/index.ts` composes security middleware (`requestId`, `helmet`, rate limits, CORS, cookies, JSON parsers), then registers API routes, then registers global `errorHandler` last.
3. Route files in `backend/src/routes/*.routes.ts` wire middlewares in order: `authenticate` → `authorize` (when needed) → `validateBody/validateQuery` → controller.
4. Controllers stay HTTP-focused and delegate business rules to services.
5. Services enforce domain logic, throw `AppError` subclasses, and interact with Mongoose models.

### Frontend flow
1. `frontend/src/app/layout.tsx` validates frontend env and mounts providers.
2. `frontend/src/app/providers.tsx` mounts:
   - `ServiceWorkerRegistration` (registers SW in production only),
   - `AuthInitializer` (hydrates session and coordinates offline queue sync).
3. Feature modules live under `frontend/src/modules/*`; server state uses TanStack Query hooks in `queries.ts` files.
4. All feature HTTP calls go through `frontend/src/lib/http/api-client.ts`.
5. In development, API calls route through Next rewrites (`/api/backend/*`) configured in `frontend/next.config.ts` to backend `http://127.0.0.1:4000/api/*`.

### Shared contracts and RBAC
- `@cermont/shared-types` is the contract SSOT. Prefer exports from `src/schemas` via package entrypoint.
- `packages/shared-types/src/zod/*` is legacy/deprecated; avoid for new code.
- `@cermont/domain` is the SSOT for role strings, path RBAC helpers, and permission checks.

## Key repository conventions
- Use **npm only**. Do not introduce pnpm/yarn lockfiles.
- Do not add Prisma/PostgreSQL/Sequelize/Joi/NextAuth/Auth.js/Axios.
- Backend controllers should not add broad `try/catch`; let Express 5 + global error handler process thrown errors.
- Keep route files for routing/middleware only; keep business logic in services.
- Validate API input with shared Zod schemas (`validateBody`, `validateQuery`, `validateParams`) before controllers execute.
- API responses follow a consistent envelope (`success`, `data`/`error`), with `AppError` driving structured failures.
- Frontend shared auth state is in `frontend/src/store/auth.store.ts` (Zustand). `accessToken` is memory-only; refresh token is an HttpOnly cookie.
- Frontend auth perimeter is `frontend/proxy.ts`; do not create `middleware.ts`.
- Role values are lowercase (`gerente`, `residente`, `hes`, `supervisor`, `operador`, `tecnico`, `administrativo`, `cliente`). Normalize/check roles via `@cermont/domain`.
- Offline-first behavior is implemented via:
  - `frontend/public/service-worker.js` (network-only for `/api/*`),
  - `frontend/src/lib/pwa/offline-queue.ts` (IndexedDB queue + retry logic),
  - `frontend/src/store/queueStore.ts` (UI queue state).
- MongoDB connection enforces IPv4 (`family: 4` in `backend/src/config/db.ts`); prefer `127.0.0.1` for local backend URLs.

## Backend rules
- Controllers: thin HTTP layer only (req → service → res). Never call Mongoose directly.
- Services: all business logic. Never import `req`, `res`, `next`.
- No `try/catch` in controllers — Express 5 propagates async errors automatically.
- Use `AppError` for expected business failures.

## Frontend rules
- Default to Server Components; add `"use client"` only when needed.
- Use TanStack Query for server state — never `useEffect` for data fetching.
- Use Zustand for shared client state — never Context API for global state.
- Use React Hook Form + `zodResolver` for forms.
- Semantic HTML: one `<h1>` per page, `<button>` for actions, proper `<label>` for inputs.

## Order state machine
```
open → assigned → in_progress → on_hold → completed → closed
Cancellation allowed from: open, assigned, on_hold
```
