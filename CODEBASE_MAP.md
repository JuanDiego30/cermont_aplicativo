# Cermont — Codebase Map

> **Single source of truth for agent orientation.**
> Read this file FIRST before touching any code.
> Last updated: 2026-06-29

---

## Project Identity

**Cermont S.A.S.** — Field Service Management (FSM) for a petroleum contractor in Arauca, Colombia.
Digitizes the 14-step work-order lifecycle: work request → site visit → proposal → purchase order → planning → execution → evidence → technical report → delivery record → client signature → SES/Ariba → invoice → invoice approval → payment.

**Architecture:** Offline-first PWA · Monorepo npm workspaces · Turborepo

---

## Active Branch & State

```
Branch:   refactor/spec-007-memory-innovation
Tests:    231 passing (54 frontend files + backend)
Last WIP: 09cf9f0 — spec-007 fileasset partial (fleet photo upload)
```

---

## Stack (Fixed — Do Not Change)

| Layer | Tech | Version |
|-------|------|---------|
| Package manager | npm | 10.9.4 |
| Node.js | Node.js | ≥ 22.20.0 |
| Backend | Express | 5.2.1 |
| ORM | Mongoose | 9.5.0 |
| Database | MongoDB | 7.0 (IPv4: `127.0.0.1:27017`) |
| Validation | Zod | 4.3.6 |
| Frontend | Next.js | 16.2.4 |
| UI | React | 19.2.5 |
| Server state | TanStack Query | v5 |
| Client state | Zustand | 5.0.12 |
| Styling | Tailwind CSS | 4.2.4 |
| PWA | Serwist | 9.5.7 |
| Lint + Format | Biome | 2.4.12 |
| Testing unit | Vitest | 4.1.5 |
| Testing E2E | Playwright | 1.59.1 |

**Forbidden:** pnpm, yarn, NestJS, Prisma, PostgreSQL, NextAuth, middleware.ts, localStorage for tokens, try/catch in controllers, ESLint/Prettier, Vercel/Netlify/Railway.

---

## Repository Structure

```
backend/src/
  modules/       54 modules (all mounted in index.ts — see table below)
  common/        errors, middleware, utils, docs
  config/        db.ts, env.ts
  middlewares/   rate-limiter, etc.
  models/        shared Mongoose sub-schemas
  index.ts       Express app factory — ALL routes mounted here
  server.ts      HTTP server bootstrap

frontend/src/
  app/           Next.js App Router
    (auth)/      Login, Register, Forgot-password
    (dashboard)/ All protected dashboard pages (34 routes)
    (portal)/    Client-facing portal
    (legal)/     Legal pages
    api/         Next.js API routes (proxy to backend)
  modules/       44 feature modules (FSD pattern)
  lib/           apiClient, auth, offline, http utils
  store/         Zustand stores (auth.store.ts, etc.)
  components/    Shared UI components

packages/
  shared-types/  Zod schemas — SINGLE SOURCE OF TRUTH for contracts
  domain/        RBAC roles, route constants, business constants
  config/        Shared config (env validation, etc.)
```

---

## Backend — All Mounted Routes

| Prefix | Module | Notes |
|--------|--------|-------|
| `/api/auth` | auth | JWT + refresh token |
| `/api/orders` | order, order-closure, order-execution-session, order-administrative-workflow | Core 14-step flow |
| `/api/users` | user | RBAC management |
| `/api/evidences` | evidence | File upload |
| `/api/evidence-collections` | evidence | Collections |
| `/api/execution-sessions` | execution-session, execution-technical-report | |
| `/api/files` | files | FileAsset SSOT |
| `/api/fleet` | fleet | Vehicle management |
| `/api/media` | media | **WIP** — fleet photo upload (spec-007) |
| `/api/form-submissions` | form-submissions | |
| `/api/checklists` | checklist | |
| `/api/clients` | client | |
| `/api/signatures` | client-signature | |
| `/api/costs` | cost | |
| `/api/custom-fields` | custom-fields | |
| `/api/kits` | kit | |
| `/api/maintenance` | maintenance | |
| `/api/documents` | documents (3 sub-routers) | |
| `/api/document-templates` | template-draft | |
| `/api/template-drafts` | template-draft | |
| `/api/template-responses` | template-response | |
| `/api/proposals` | proposal | |
| `/api/purchase-orders` | purchase-order | |
| `/api/resources` | resource | |
| `/api/reports` | report | |
| `/api/technical-reports` | technical-report | |
| `/api/tools` | tool | |
| `/api/delivery-records` | delivery-record (2 sub-routers) | |
| `/api/service-entry-sheets` | service-entry-sheet (2 sub-routers) | |
| `/api/invoices` | invoice, invoice-payment | |
| `/api/payments` | payment | |
| `/api/audit` | audit | AuditLog, GER only |
| `/api/analytics` | analytics, analytics-report | |
| `/api/inspections` | inspection | |
| `/api/inventory` | inventory | |
| `/api/sync` | sync | Offline queue |
| `/api/ai` | ai | |
| `/api/work-requests` | work-requests | Step 1 of 14 |
| `/api/asts` | safety-analysis | HSE |
| `/api/assets` | asset | Equipment assets |
| `/api/planning-packets` | planning-packet | |
| `/api/site-visits` | site-visit | |
| `/api/observability` | observability | |
| `/api/notifications` | notifications | |
| `/api/service-cases` | service-cases | |
| `/api/dashboard` | dashboard | |
| `/api/metrics` | metrics | |
| `/api/portal` | portal | Client-facing |
| `/api/dian` | dian | Invoice compliance |
| `/api/sla` | sla | SLA tracking |
| `/api/dispatch` | dispatch | |
| `/api/system-config` | system-config | GER only |
| `/api/admin/backups` | admin-backup | GER only |
| `/api/privacy-requests` | privacy-requests | GDPR/habeas data |
| `/api/business-documents` | business-document | |
| `/api/erp-connectors` | erp-connector | Ariba, SAP |

---

## RBAC Roles

| Role | Code | Level |
|------|------|-------|
| Gerente | GER | Omnipotent |
| Residente | RES | Operational Senior |
| Salud y Seguridad | HES | Audit |
| Supervisor | SUP | Coordination |
| Administrativo | ADM | Financial custody |
| Operador | OPE | Limited transactions |
| Técnico | TEC | Read + sequential state |
| Cliente | CLI | Read own only |

Source of truth: `packages/domain/src/roles.ts`
Security perimeter: `frontend/proxy.ts` (NOT middleware.ts — deprecated in Next.js 16)

---

## Quality Gates (Run Before Every Commit)

```bash
npm run typecheck          # 0 TS errors (strict)
npm run lint               # 0 Biome errors
npm run test               # all Vitest tests pass
npm run quality:strict     # 9 quality scripts (weak-tokens, language, semantics, routes, dtos, zero, lint-residue, service-size, env)
npm run verify             # all above + build
```

Individual workspace:
```bash
npm run typecheck -w backend
npm run typecheck -w frontend
npm run lint -w backend
npm run lint -w frontend
```

---

## Critical Patterns

### Backend (Express 5)
- **NO try/catch in controllers** — Express 5 propagates async errors automatically
- Flow: `Route → Controller (Zod validate) → Service (pure logic) → Model`
- Response: `{ success: boolean, data: T | null, error: string | null, message: string }`
- Error: `throw new AppError("message", statusCode)` — handled by `errorHandler`

### Frontend (Next.js 16)
- **NO middleware.ts** — use `proxy.ts` for RBAC
- **NO fetch() in components** — use TanStack Query hooks
- **NO useEffect for data** — use `useQuery` / `useMutation`
- **NO localStorage for tokens** — HttpOnly cookies only
- API calls: `apiRequest()` from `@/lib/http/api-client`

### Shared Types
- All Zod schemas live in `packages/shared-types/src/schemas/`
- Import: `import { OrderSchema } from "@cermont/shared-types"`
- Never duplicate types between backend and frontend

---

## Pending Work (Next Up)

| Priority | Task | Status |
|----------|------|--------|
| 🔴 HIGH | FileAsset SSOT — complete fleet photo upload | WIP `09cf9f0` |
| 🟡 MED | Multi-ERP maturity plan | Not started |
| 🟡 MED | Expand E2E Playwright coverage | Partial |
| 🟢 LOW | Performance optimizations | Backlog |

---

## Historical Plans
See `docs/history/HISTORY_PLANS.md` for a summary of all 17 past plan specs.
Full plan files are preserved in `docs/history/*.md`.

---

## Deployment

- **Target:** VPS Contabo (own server — NO Vercel/Netlify/Railway)
- **Process manager:** PM2 (`npm run deploy:pm2:start`)
- **Config:** `ecosystem.config.cjs`
- **MongoDB:** local on VPS at `mongodb://127.0.0.1:27017/cermont`
- **Reverse proxy:** Nginx (ports 3000/4000 → 80/443)
