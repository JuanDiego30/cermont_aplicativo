# AGENT IMPLEMENTATION PLAYBOOK

**Date:** 2026-05-13  
**Version:** 1.0 — Canonical  
**Status:** CURRENT_SOURCE_OF_TRUTH  
**Replaces:** DOC-11, AGENTS.md (root), .github/copilot-instructions.md, .cursorrules (partial)

---

## ⚠️ READ THIS FIRST — FOR ALL AI AGENTS

This is the mandatory playbook for any agent (Codex, Gemini, Claude, Windsurf, Copilot) before touching code in this repository. Violating these rules causes wasted work, broken builds, duplicated logic, and regression to beta/legacy state.

---

## 1. Mandatory Reading Order

Before implementing ANYTHING:

1. `docs/README.md` — Master index, what is/isn't this app
2. `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` — Product vision
3. `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — 14-step flow, entities, states, RBAC
4. `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` — Technical architecture
5. `docs/architecture/FRONTEND_ROUTE_MAP.md` — What routes exist/are needed
6. `docs/architecture/API_ENDPOINT_MATRIX.md` — What endpoints exist/are needed
7. `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` — This file
8. `docs/REGLAS_DESARROLLO_CERMONT.md` — Development rules

---

## 2. Pre-Implementation Checklist

Before writing a single line of code, verify:

- [ ] **Entity documented?** Check `CERMONT_BUSINESS_FLOW_MAP.md` — does the entity exist?
- [ ] **Contract exists?** Check `packages/shared-types/src/schemas/` — does the Zod schema exist?
- [ ] **Endpoint defined?** Check `API_ENDPOINT_MATRIX.md` — is the endpoint listed?
- [ ] **Page defined?** Check `FRONTEND_ROUTE_MAP.md` — is the route listed?
- [ ] **Query hook exists?** Check `frontend/src/modules/{module}/hooks/` — does a TanStack Query hook exist?
- [ ] **Test exists?** Check for unit/integration/E2E tests for the feature.
- [ ] **States covered?** Loading, error, empty, offline, forbidden — all required.
- [ ] **RBAC valid?** Roles from `@cermont/domain`, not hardcoded.
- [ ] **Audit required?** Critical mutations need audit events.
- [ ] **Duplicates checked?** Search: does similar logic already exist elsewhere?
- [ ] **Canonical docs up to date?** If behavior changes, update the canonical doc.

---

## 3. How to Verify Documentation is NOT Stale

Before trusting any document:

1. **Check for `apps/backend` or `apps/frontend`** — if present, the document is outdated. Real paths: `backend/`, `frontend/`.
2. **Check for petroleum-only framing** — Cermont is multi-service. If doc says "sector petrolero" or "Caño Limón" as the only scope, it's outdated or historical.
3. **Check for `NEXTAUTH_URL`** — Cermont does NOT use NextAuth. If doc references it, it's wrong.
4. **Check the date** — documents from March 2026 or earlier likely have the `apps/` path issue.
5. **Cross-reference with canonical docs** — if a DOC file contradicts a canonical doc, the canonical doc wins.

---

## 4. Contract-First Development

Every feature must follow this exact order:

```
1. Zod schema in packages/shared-types/src/schemas/
2. Inferred type from Zod
3. Mongoose model aligned with schema
4. Backend service (business logic)
5. Thin controller (req → service → res)
6. Route file with validation middleware
7. Frontend API client function
8. Stable query keys
9. TanStack Query hook
10. UI component
11. Tests (unit + E2E)
```

**Never:** Skip steps. Never: Start with UI. Never: Duplicate schemas.

---

## 5. Vertical Slice Development

When implementing a feature, build it as a complete vertical slice:

```
Backend:   schema → model → service → controller → route
Frontend:  api client → query keys → hook → UI → test
```

Don't build "all backend then all frontend." Build one feature end-to-end.

---

## 6. How to Avoid Duplication

Before creating anything new, search the codebase:

- **Zod schemas:** `grep` for similar schema names in `packages/shared-types/`
- **Mongoose models:** Check `backend/src/models/` for existing models
- **Services:** Check `backend/src/services/` for existing business logic
- **API clients:** Check `frontend/src/modules/{module}/api/` for existing functions
- **Hooks:** Check `frontend/src/modules/{module}/hooks/` for existing TanStack Query hooks
- **Components:** Check `frontend/src/components/common/` before creating new ones
- **Query keys:** Check if query key factories already exist

---

## 7. What You Must NEVER Do

### Stack Violations (instant rejection)
- ❌ Introduce NestJS — Express 5.2.1 only
- ❌ Introduce Prisma — Mongoose 9.x only
- ❌ Introduce PostgreSQL — MongoDB only
- ❌ Introduce NextAuth/Auth.js — JWT + Zustand auth store
- ❌ Introduce pnpm or yarn — npm only
- ❌ Create or modify `middleware.ts` — proxy.ts is the security perimeter
- ❌ Introduce Joi — Zod 4.x only
- ❌ Introduce Axios — api-client.ts wrapper

### Code Quality Violations
- ❌ Use `any` — TypeScript strict
- ❌ Use `null` for absence — use status objects
- ❌ Use `undefined` for absence — use status objects
- ❌ Use `unknown` without safe refinement
- ❌ Add `try/catch` to controllers — let Express 5 handle async errors
- ❌ Call Mongoose from routes or controllers — use services
- ❌ Use raw `fetch` in components — use TanStack Query
- ❌ Use `useEffect` for data fetching — use TanStack Query
- ❌ Hardcode roles — use `@cermont/domain`
- ❌ Hardcode routes — use centralized route config
- ❌ Add `console.log` — use proper logging
- ❌ Add `debugger` or `alert` statements
- ❌ Silent catch blocks — always handle errors
- ❌ Swallow errors — add context, log, or re-throw as typed error

### Implementation Violations
- ❌ Create `apps/` directories — workspaces are `backend/`, `frontend/`, `packages/`
- ❌ Create `apps/backend` or `apps/frontend`
- ❌ Import from `dist/` in source code
- ❌ Add barrel imports in performance-critical paths
- ❌ Create giant monolithic files
- ❌ Mass-reformat unrelated files
- ❌ Remove existing functionality without replacement
- ❌ Create mock data in production code
- ❌ Commit secrets or .env files

---

## 8. Tech Stack Reference

### Backend (workspace: `backend`)
```
Express 5.2.1 | Mongoose 9.x | MongoDB 7.0 | Zod 4.3.6 | jsonwebtoken 9.0.3
bcryptjs 3.0.3 | helmet 8.1.0 | cors 2.8.6 | express-rate-limit 8.3.1
multer 2.1.1 | sharp 0.34.5 | pdf-lib 1.17.1 | cookie-parser 1.4.7
```

### Frontend (workspace: `frontend`)
```
Next.js 16.2.1 | React 19.2.4 | TypeScript 5.x | Tailwind CSS 4.2.2
TanStack Query 5.95.2 | Zustand 5.0.12 | react-hook-form 7.72.0 | Radix UI
Framer Motion 12.38.0 | Recharts 3.8.1 | lucide-react 1.7.0 | sonner 2.0.7
```

### Shared (workspace: `packages/*`)
```
@cermont/shared-types — Zod schemas, API contracts
@cermont/domain — RBAC roles, permissions
@cermont/config — Env validation
```

### Testing
```
Vitest 4.x | Playwright 1.58 | Biome 2.4
```

---

## 9. Build / Test Commands

```bash
# Root
npm run dev           # Backend + Frontend (Turborepo)
npm run build         # shared-types → backend → frontend
npm run typecheck     # TypeScript all workspaces
npm run lint          # Biome all workspaces
npm run test          # Vitest all workspaces
npm run verify        # typecheck + lint + build

# Per workspace
npm run dev -w backend
npm run dev -w frontend
npm run test -w backend
npm run test -w frontend
npm run test:e2e -w frontend

# Single test
npm run test -w backend -- src/services/report.service.test.ts
npm run test -w frontend -- -t "renders dashboard"
npm run test:e2e -w frontend -- tests/e2e/login.spec.ts
npm run test:e2e -w frontend -- --grep "login"
```

---

## 10. Pre-Commit Checklist

```bash
npm run typecheck && npm run lint && npm run build && npm run test
```

And verify:
- [ ] No functionality removed
- [ ] No schemas duplicated
- [ ] No roles duplicated
- [ ] No routes duplicated
- [ ] No `any` introduced
- [ ] No `null`/`undefined` introduced
- [ ] No `console.log` in production code
- [ ] No typecheck errors
- [ ] No lint errors
- [ ] Build successful
- [ ] Tests pass
- [ ] Loading/error/empty/offline states covered
- [ ] RBAC validated
- [ ] Documentation updated if behavior changed
- [ ] No new Qodana issues (if Qodana exists)
- [ ] No `apps/` paths in new docs

---

## 11. When in Doubt

1. Read the nearest existing module first — match local conventions.
2. If behavior touches contracts or security, verify against canonical docs.
3. If behavior touches frontend routing, verify against `FRONTEND_ROUTE_MAP.md`.
4. If behavior touches API, verify against `API_ENDPOINT_MATRIX.md`.
5. If the change is large, plan first, then implement.
6. Run the narrowest verification that proves the fix.
7. End with root verification (`npm run verify`) when the task is complete.
