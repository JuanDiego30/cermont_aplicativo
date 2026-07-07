# 02 — Architecture Rules

> Canonical source for structural patterns: SSOT, Contract-First, Feature-Sliced Design, API envelope, RBAC topology.

---

## Architectural Principles

### SSOT — Single Source of Truth

| Data | SSOT Location |
|------|--------------|
| Zod schemas + TypeScript types | `packages/shared-types/src/schemas/` |
| RBAC roles + route-access helpers | `packages/shared-types/src/rbac/` (or `packages/domain`) |
| Environment variable validation | `packages/shared-types/src/config/` |
| API contracts (endpoints, payloads) | DOC-10 + `packages/shared-types` |

**Rule:** If the same type appears in more than one package, it is a SSOT violation. Delete the duplicate and import from `@cermont/shared-types`.

### Contract-First Development

Always define the contract before writing code:

1. Add Zod schema to `packages/shared-types`.
2. Build + typecheck shared-types: `npm run build -w @cermont/shared-types`.
3. Implement backend service + controller using the schema.
4. Implement frontend query + form using the same schema.

Never infer the contract from implementation. The schema drives both sides.

### One Module, One Responsibility

Each directory owns exactly one slice of the domain. No cross-cutting concerns without abstraction.

```
modules/
  orders/          ← owns everything about work orders
  dashboard/       ← owns dashboard aggregation views
  costs/           ← owns cost tracking
  proposals/       ← owns proposal management
```

---

## Feature-Sliced Design (Frontend)

```
frontend/src/modules/<feature>/
  components/      ← UI components for this feature
  hooks/           ← custom hooks (queries, mutations, state)
  queries.ts       ← TanStack Query definitions (queryKey + queryFn)
  store.ts         ← Zustand slice (if feature needs local state)
  types.ts         ← feature-local types (not shared; use shared-types for API types)
  index.ts         ← public API of the module (barrel export)
```

**Rule:** Feature modules must not import from each other's internal files. Cross-module dependencies go through `packages/shared-types` or a shared util.

---

## Backend MVC Flow

```
Request
  → Route (authenticate → authorize → validateBody/validateQuery → controller)
  → Controller (thin HTTP: parse req → call service → res.json)
  → Service (pure business logic → throw AppError on failure)
  → Repository / Model (Mongoose queries)
  → Response
```

- Routes: middleware wiring only.
- Controllers: HTTP boundary only — never call Mongoose directly.
- Services: business logic only — never import `req`, `res`, `next`.
- No `try/catch` in controllers — Express 5 propagates async errors to the global error handler.

---

## API Response Envelope

All backend responses use this consistent shape:

```typescript
// Success
{ success: true,  data: T,    error: null,   message: string }

// Failure
{ success: false, data: null, error: { code: string, message: string }, message: string }
```

`AppError` drives structured failures:

```typescript
throw new AppError('ORDER_NOT_FOUND', 404, 'Order not found');
```

---

## RBAC Architecture

**Rule:** RBAC is enforced at two independent layers:
1. **Backend:** `authorize(role)` middleware on every protected route — server-side enforcement.
2. **Frontend:** `proxy.ts` — intercepts navigation before the page renders.

Never rely on frontend-only RBAC. The backend is the authoritative security boundary.

### RBAC Roles (Exact Strings — Lowercase)

```
gerente | residente | hes | supervisor | operador | tecnico | administrativo | cliente
```

Always use role constants from `@cermont/domain` (or `@cermont/shared-types/src/rbac/`).  
Never hardcode role strings in business logic.

### Route Protection in Depth

```
proxy.ts (frontend perimeter)
  → Backend route middleware (authenticate → authorize)
  → Service layer (checks ownership / additional business rules)
```

---

## Order State Machine

```
open → assigned → in_progress → on_hold → completed → closed
Cancellation allowed from: open, assigned, on_hold

Transitions:
  open:        → [assigned, cancelled]
  assigned:    → [in_progress, on_hold, cancelled]
  in_progress: → [on_hold, completed]
  on_hold:     → [in_progress, cancelled]
  completed:   → [closed]
  closed:      → []
  cancelled:   → []
```

This FSM is the canonical business rule. Never allow state transitions outside this table.

---

## Low Coupling, High Cohesion

- Modules communicate through well-defined contracts (Zod schemas, API endpoints).
- No cross-module imports of internal implementation files.
- Shared utilities live in `packages/shared-types` or dedicated `tooling/` scripts.

---

## No Business Logic in UI

The frontend:
- Fetches data via `apiRequest()` → TanStack Query.
- Renders data; does not compute business outcomes.
- Submits mutations; does not validate business rules (only UX validation with Zod).

The backend:
- Enforces all business rules in services.
- Returns computed results — the frontend does not recalculate them.

---

## Folder Structure Reference

```
backend/src/
  controllers/     ← HTTP boundary
  services/        ← business logic
  models/          ← Mongoose schemas
  middlewares/     ← authenticate, authorize, validateBody, upload
  routes/          ← endpoint wiring
  common/
    errors/        ← AppError, error-handler
    middlewares/   ← requestId, response interceptor
  config/          ← db.ts, validate-env.ts, rate-limit.config.ts

frontend/
  app/             ← Next.js 16 App Router
    (auth)/        ← login, register, forgot-password
    (dashboard)/   ← protected application routes
  src/
    lib/http/      ← api-client.ts, proxy.ts (security perimeter)
    modules/       ← Feature-Sliced Design slices
    store/         ← auth.store.ts (Zustand)

packages/shared-types/src/
  schemas/         ← Zod 4 schemas (SSOT)
  rbac/            ← role constants, permission helpers
  config/          ← env validation helpers
```
