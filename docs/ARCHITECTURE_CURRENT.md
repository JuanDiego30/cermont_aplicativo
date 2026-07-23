# Architecture — Current (Cermont S.A.S.)

## Monorepo Structure

- **6 packages**: root, `backend/`, `frontend/`, `packages/domain`, `packages/shared-types`, `packages/config`
- **Build system**: Turborepo (`turbo.json`) with caching
- **Package manager**: npm workspaces (npm 10.9.4)

## Backend Architecture

| Aspect | Detail |
|---|---|
| Runtime | Node.js 22+, TypeScript |
| Framework | Express 5.2.1 |
| Database | Mongoose 9.x + MongoDB 7.0 |
| Modules | 59 modules, 71 route files |
| Models | 44 Mongoose models |
| Testing | Vitest + mongodb-memory-server + supertest |

### Layers
```
routes/ → controllers/ → services/ → models/
```

### Middleware Chain (order)
```
requestId → cors → helmet → rateLimiter → cookieParser → json → sanitize → compression
```

### Authentication
- JWT (short-lived access token) + HttpOnly cookie (refresh token, 7d)
- WebAuthn passkeys (`@simplewebauthn/server`)
- Incremental `tokenVersion` for session invalidation

### FSM Engine
- Centralized state machine at `backend/src/common/fsm/fsm-engine.ts`
- 14-step workflow with state transition validation
- Workflow variants registry (`cermont-14step`, `fssm-standard`, `gmao-maintenance`)

### Offline Support
- Idempotency middleware (SHA-256 key hashing)
- Sync endpoints + Dead Letter Queue (DlqEntry model)
- `clientMutationId` for duplicate detection

### Jobs
- BullMQ (Redis) for reminder workers
- MongoDB fallback when Redis unavailable

## Frontend Architecture

| Aspect | Detail |
|---|---|
| Framework | Next.js 16 App Router + React 19 |
| Styling | Tailwind CSS 4 + CSS variables |
| Architecture | Feature-Sliced Design (`src/modules/` — 46 modules) |
| Server state | TanStack Query 5 |
| Client state | Zustand 5 |
| Forms | react-hook-form + Zod 4 |
| Offline DB | Dexie (IndexedDB) |
| PWA | Serwist 9 with Service Worker caching |
| Charts | Recharts |
| Icons | Lucide React |
| Animation | GSAP 3 + Framer Motion 12 |
| Maps | Leaflet |
| Proxy | `proxy.ts` middleware for auth + RBAC |

## Shared Packages

### `@cermont/domain` (pure TS + Zod)
- Roles, permissions, RBAC matrices
- Business rules (billing, costs, closure, planning, fleet, etc.)
- 15 roles: gerente, residente, coord_administrativo, supervisor, hes, auxiliar_contable, supervisor_electricista, tecnico_electricista, operador, tecnico, auxiliar_hes, oficial_construccion, administrativo, pasante, cliente

### `@cermont/shared-types`
- 112 Zod schema files, ~400+ inferred types
- API contracts (envelope, pagination, error codes)
- Exportable types for frontend consumption

### `@cermont/config`
- Shared env validation schemas

## Data Flow

```
Client
  → proxy.ts (auth cookie parse, RBAC check)
  → Next.js API route (/api/backend/*)
  → Backend proxy (express-http-proxy)
  → Express route
  → authenticate middleware (JWT verify)
  → authorize middleware (role check)
  → validate middleware (Zod)
  → controller
  → service
  → model
  → MongoDB
```

## API Conventions

**Base URL**: `http://127.0.0.1:4000/api`

**Response Envelopes**:
```typescript
// Success
{ success: true, data: T, message?: string }

// Error
{ success: false, error: { code: string; message: string } }

// Paginated
{ success: true, data: T[], pagination: { page, limit, total, totalPages } }
```

## Key Middleware

| Middleware | File | Purpose |
|---|---|---|
| `authenticate` | `middlewares/auth.middleware.ts` | JWT verification, token blacklist check |
| `authorize` | `middlewares/authorize.middleware.ts` | Role-based access (single role, minimum role, owner check) |
| `validate` | `middlewares/validate.ts` | Zod body/query/params validation |
| `idempotency` | `middlewares/idempotency.middleware.ts` | Idempotency key deduplication |
| `rate-limiter` | `middlewares/rate-limiter.ts` | Per-IP rate limiting (5 auth/min, 30 refresh/min) |
| `sanitize` | `middlewares/sanitize.middleware.ts` | express-mongo-sanitize |
| `audit-log` | `middlewares/audit-log.middleware.ts` | Automatic audit log generation |
