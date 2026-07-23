# packages/AGENTS.md — Shared Packages Rules

## Scope

This workspace contains shared packages consumed by both `backend/` and `frontend/`:

```txt
packages/shared-types/   → @cermont/shared-types — Zod schemas, API contracts, inferred types
packages/domain/         → @cermont/domain — RBAC roles, permissions, route access helpers
packages/config/         → @cermont/config — Env validation, shared configuration
```

---

## Do Not Modify

```txt
backend/
frontend/
package.json (root)
package-lock.json (root)
```

---

## SSOT Rules

These packages are the **Single Source of Truth** for their respective domains. Nothing defined here may be duplicated in `backend/` or `frontend/`.

| Package | SSOT For |
|---------|----------|
| `@cermont/shared-types` | Zod schemas, API request/response types, DTOs |
| `@cermont/domain` | RBAC role strings, permission helpers, `canAccessModule()`, route access maps |
| `@cermont/config` | Shared env var validation, config constants |

---

## shared-types (`packages/shared-types/`)

### Schema Location Rules
- **NEW schemas:** `packages/shared-types/src/schemas/` — this is the canonical location
- **LEGACY schemas:** `packages/shared-types/src/zod/` — DO NOT add new code here
- Backend and frontend must import from this package, never define separate contract shapes

### Correct Usage
```typescript
// ✅ Import from shared-types
import type { IWorkOrder, CreateOrderDto } from '@cermont/shared-types';
import { createOrderSchema } from '@cermont/shared-types';

// ❌ Never duplicate
// apps/backend/src/types/order.ts  ← DELETE
// apps/frontend/src/types/order.ts ← DELETE
```

### Contract Change Protocol
1. Update Zod schema in `packages/shared-types/src/schemas/`
2. Regenerate inferred types if needed
3. Update backend Mongoose model to match
4. Update backend service/controller that consumes it
5. Update frontend API client and forms
6. Run `npm run contracts:check`
7. Document the migration reason

---

## domain (`packages/domain/`)

### RBAC SSOT
The 15 valid role strings live ONLY here:
```
gerente | residente | coord_administrativo | supervisor | hes | auxiliar_contable | supervisor_electricista | tecnico_electricista | operador | tecnico | auxiliar_hes | oficial_construccion | administrativo | pasante | cliente
```

### Correct Usage
```typescript
// ✅ Use domain helpers
import { canAccessRoute, ROLES } from '@cermont/domain';
if (!canAccessRoute(user.role, '/orders')) { return forbidden(); }

// ❌ Never hardcode
if (user.role === 'gerente' || user.role === 'residente') { ... }
```

---

## config (`packages/config/`)

### Purpose
Shared environment variable validation and configuration constants. Used by both backend and frontend for consistent validation.

### Rules
- Do not put business logic here — config only
- Do not put secrets here — only validation schemas for env vars
- Do not import from `backend/` or `frontend/` — this package is consumed BY them

---

## Required Validation

```bash
npm run typecheck -w @cermont/shared-types
npm run build -w @cermont/shared-types
npm run typecheck -w @cermont/domain
npm run build -w @cermont/domain
npm run typecheck -w @cermont/config
npm run build -w @cermont/config
npm run contracts:check
```
