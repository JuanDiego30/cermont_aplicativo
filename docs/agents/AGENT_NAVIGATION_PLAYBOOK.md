# AGENT NAVIGATION PLAYBOOK — Cermont S.A.S.

> **Date:** 2026-06-29  
> **Version:** 1.0 — Navigation Supplement  
> **Status:** ACTIVE  
> **Complements:** `AGENT_IMPLEMENTATION_PLAYBOOK.md`

---

## Pre-Change Impact Map (OBLIGATORIO antes de cada cambio)

Todo agente debe responder antes de modificar código:

| Campo | Respuesta |
|-------|-----------|
| Cambio propuesto | |
| Módulo(s) afectados | |
| Schemas Zod afectados | |
| Backend (routes/controllers/services) | |
| Frontend (routes/hooks/UI) | |
| Tests afectados | |
| RBAC afectado | |
| PWA/offline afectado | |
| Deploy afectado | |
| Riesgo (Alto/Medio/Bajo) | |
| Plan de rollback | |

**Regla:** Si no puedes llenar esta tabla, no tienes suficiente contexto para modificar el código. Lee más, pregunta, o detente.

---

## Documentation Freshness Check

Before implementing any feature, verify:

- [ ] **CODEBASE_MAP.md** reflects current module structure
- [ ] **FRONTEND_BACKEND_MATRIX.md** has the endpoints being modified
- [ ] **API_ENDPOINT_MATRIX.md** has the routes being changed
- [ ] **FRONTEND_ROUTE_MAP.md** has the pages being modified
- [ ] No stale references to removed modules/routes
- [ ] ADRs are up to date for architectural changes

**Stale document indicators:**
- References to `apps/backend` or `apps/frontend` → outdated
- References to `localhost` instead of `127.0.0.1` → outdated
- References to NextAuth/Auth.js → outdated
- References to NestJS/Prisma/PostgreSQL → outdated
- Dates before June 2026 → likely outdated

---

## Source of Truth Hierarchy

When in doubt, follow this priority order:

1. **CODEBASE_MAP.md** — Module locations and structure
2. **FRONTEND_BACKEND_MATRIX.md** — Route-to-endpoint mapping
3. **API_ENDPOINT_MATRIX.md** — Backend endpoint contracts
4. **FRONTEND_ROUTE_MAP.md** — Frontend route definitions
5. **packages/shared-types/src/schemas/** — Zod schemas (SSOT)
6. **packages/domain/src/** — RBAC roles and permissions (SSOT)
7. **AGENT_IMPLEMENTATION_PLAYBOOK.md** — Implementation rules

---

## Module Quick Reference

### Backend Modules (57 total)
| Module | Path | Primary Concern |
|--------|------|-----------------|
| auth | backend/src/modules/auth/ | JWT, WebAuthn, refresh tokens |
| user | backend/src/modules/user/ | User CRUD, profiles |
| order | backend/src/modules/order/ | Work orders, state machine |
| evidence | backend/src/modules/evidence/ | File upload, variants, audit |
| proposal | backend/src/modules/proposal/ | Proposals, PO attachment |
| planning-packet | backend/src/modules/planning-packet/ | Planning, approval |
| execution-session | backend/src/modules/execution-session/ | Field execution |
| service-entry-sheet | backend/src/modules/service-entry-sheet/ | SES, Ariba |
| invoice | backend/src/modules/invoice/ | Invoicing |
| payment | backend/src/modules/payment/ | Payments |
| documents | backend/src/modules/documents/ | Document management |
| fleet | backend/src/modules/fleet/ | Vehicles |
| maintenance | backend/src/modules/maintenance/ | Maintenance plans |
| audit | backend/src/modules/audit/ | Audit logging |
| ... | ... | ... |

### Frontend Modules (42 total)
| Module | Path | Primary Concern |
|--------|------|-----------------|
| auth | frontend/src/modules/auth/ | Login, register, passkeys |
| orders | frontend/src/modules/orders/ | Order list, detail, kanban |
| evidences | frontend/src/modules/evidences/ | Upload, gallery, verify |
| proposals | frontend/src/modules/proposals/ | Proposal forms, list |
| planning | frontend/src/modules/planning/ | Planning calendar |
| execution | frontend/src/modules/execution/ | Execution tracker |
| documents | frontend/src/modules/documents/ | Document upload, list |
| costs | frontend/src/modules/costs/ | Cost tracking |
| reports | frontend/src/modules/reports/ | Report generation |
| ... | ... | ... |

---

## Common Patterns

### Backend Route Pattern
```typescript
router.get('/',
  authenticate,
  authorize('gerente', 'residente'),
  validateQuery(listSchema),
  controller.list
);
```

### Frontend Query Pattern
```typescript
export const orderKeys = {
  list: (filters) => ['orders', filters],
  detail: (id) => ['orders', id],
};

export function useOrders(filters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => api.orders.list(filters),
  });
}
```

### Schema Location
- **NEW:** `packages/shared-types/src/schemas/{module}.schema.ts`
- **LEGACY:** `packages/shared-types/src/zod/{module}.ts` (avoid)

---

## Anti-Patterns to Avoid

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Hardcoded roles | `import { ROLES } from '@cermont/domain'` |
| Direct fetch in components | `useQuery` / `useMutation` |
| Business logic in UI | Move to backend service |
| Duplicate schemas | Import from `@cermont/shared-types` |
| `middleware.ts` | Use `proxy.ts` |
| `localhost` in MongoDB | Use `127.0.0.1` |
| `any` types | Proper TypeScript types |
| `null`/`undefined` for absence | Status objects |

---

## Escalation Path

When stuck:
1. Re-read `AGENT_IMPLEMENTATION_PLAYBOOK.md` sections 1-11
2. Check `CODEBASE_MAP.md` for module structure
3. Check `FRONTEND_BACKEND_MATRIX.md` for endpoint mapping
4. Search for similar patterns in existing code
5. If still stuck: document the blocker and move to next task
