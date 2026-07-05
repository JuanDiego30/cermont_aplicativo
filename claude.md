# CLAUDE.md — Cermont S.A.S. Agent Configuration

> **Project:** Cermont S.A.S. — Plataforma Operativa Multiservicio
> **Architecture:** Monorepo npm workspaces (backend/ + frontend/ + packages/*)
> **Last updated:** 2026-07-05
>
> This file configures AI agent behavior for this repository. It is the canonical
> entry point — read this before reading any code or making any change.

---

## 1. Project Identity

Cermont S.A.S. is a document-driven operational platform for multi-service
contractor workflows in Colombia (construction, CCTV, lifelines, structural
anchors, industrial safety, electrical, refrigeration, civil works).

The system digitizes the full 14-step business flow:
Work Request → Site Visit → Proposal → Purchase Order → Planning → Execution →
Evidence → Technical Report → Delivery Record → Client Signature → SES/Ariba →
Invoice → Invoice Approval → Payment.

**The system is NOT:** a generic dashboard, a petroleum-only tool, a CMMS, or an ERP.

---

## 2. Repository Structure

```
backend/          Express 5.2.1 + Mongoose 9.x API
frontend/         Next.js 16 App Router + React 19
packages/
  shared-types/   Zod 4.x schemas — single source of truth for all contracts
  domain/         RBAC roles, permissions, route access helpers
  config/         Shared env validation utilities
tooling/          Quality scripts
docs/             Canonical documentation
.agents/          Agent rules, workflows, checklists, skills
```

**Workspaces:** `["backend", "frontend", "packages/*"]`

---

## 3. Non-Negotiable Stack

| Layer | Technology | Version | Prohibited Alternatives |
|-------|-----------|---------|------------------------|
| Package manager | npm | 10.9.4 | pnpm, yarn |
| Runtime | Node.js | ≥ 22.20.0 | — |
| Backend framework | Express | 5.2.1 | NestJS, Fastify |
| ORM | Mongoose | 9.5.0 | Prisma, Sequelize |
| Database | MongoDB | 7.0 | PostgreSQL, MySQL |
| Validation | Zod | 4.3.6 | Joi, Yup |
| Frontend | Next.js | 16.2.4 | Remix, SvelteKit |
| UI Library | React | 19.2.5 | Vue, Angular, Svelte |
| Server state | TanStack Query | v5 | useEffect, SWR |
| Client state | Zustand | 5.0.12 | Context API, Redux |
| Styling | Tailwind CSS | 4.2.4 | styled-components, CSS Modules |
| Icons | Lucide React | 1.7.0 | Font Awesome, Material Icons |
| Charts | Recharts | 3.8.1 | Chart.js, D3 (raw) |
| Forms | react-hook-form | 7.72.0 | Formik |
| Auth | JWT + Zustand | — | NextAuth, Auth.js, Passport |
| Security perimeter | proxy.ts | — | middleware.ts |
| Lint/Format | Biome | 2.4.12 | ESLint, Prettier |
| Testing (unit) | Vitest | 4.1.5 | Jest |
| Testing (E2E) | Playwright | 1.59.1 | Cypress |
| PWA | Serwist | 9.5.7 | workbox |

---

## 4. TypeScript Rules (Zero Tolerance)

- ❌ No `any` — use Zod inference or proper types
- ❌ No `unknown` except with approved refinement
- ❌ No `null` — use status objects (e.g., `{ status: "not_created" }`)
- ❌ No `undefined` — same rule as `null`
- ❌ No `@ts-ignore` or `@ts-expect-error`
- ❌ No `as` casts that bypass type safety

---

## 5. Architecture Rules

### Contract-First Development
Always work in this order:
1. Zod schema in `packages/shared-types/src/schemas/`
2. Type inferred from Zod
3. Mongoose model aligned
4. Backend service
5. Thin controller
6. Route with validation middleware
7. API service in frontend
8. Query keys
9. TanStack Query hook
10. UI component
11. Tests

### Layer Rules
- **Routes:** Only wiring (authenticate → authorize → validate → controller)
- **Controllers:** Thin HTTP layer — never call Mongoose directly, never use try/catch
- **Services:** All business logic — never import req/res/next
- **No duplicate modules, schemas, roles, routes, or logic**

### Single Source of Truth
- Schemas → `@cermont/shared-types`
- Roles/Permissions → `@cermont/domain`
- Route definitions → `packages/domain`
- Query keys → centralized per module

---

## 6. API Standards

### Response Format
```json
{ "success": true, "data": {} }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

### Route Middleware Order
```
authenticate → authorize → validateBody/validateQuery/validateParams → controller
```

### Backend Module Structure
```
backend/src/modules/<feature>/
├── <feature>.routes.ts        → Endpoints + middleware binding
├── <feature>.controller.ts    → Thin HTTP layer
└── <feature>.service.ts       → Business logic (no req/res)
```

---

## 7. Frontend Rules

- Default to Server Components — add `"use client"` only when needed
- Never `useEffect` for data fetching → TanStack Query
- Never `fetch()` directly → `apiRequest()` from `@/lib/http/api-client`
- Never Context API for global state → Zustand
- Never hardcoded roles → `@cermont/domain`
- Never `middleware.ts` → `proxy.ts` is the security perimeter
- Every page: loading, error, empty, offline, and forbidden states
- Mobile-first responsive design
- Semantic HTML: one `<h1>`, proper `<label>`, `<button>` for actions
- Tokens for all colors (never inline hex values)
- Forms: react-hook-form + zodResolver

---

## 8. MongoDB Rules

```typescript
// Always use 127.0.0.1 (never localhost — IPv6 issue on Node 22+)
await mongoose.connect('mongodb://127.0.0.1:27017/cermont', {
  family: 4,  // Force IPv4
  serverSelectionTimeoutMS: 5000,
});
```

- Single connection file: `backend/src/config/db.ts`
- Soft delete for documents/evidence: `lifecycleStatus: "deleted"`
- Immutable states: `paid`, `archived`, `cancelled`
- Evidence must belong to declared ServiceCase, WorkOrder, ExecutionSession

---

## 9. Security Rules

- JWT access tokens: memory only (Zustand store)
- Refresh tokens: HttpOnly + Secure + SameSite=Strict cookies
- RBAC: 8 roles validated in `proxy.ts` and backend
- Rate limiting: 20 req/15min on auth, 100 req/min global
- Zod validation before all mutations (frontend AND backend)
- Helmet headers (CSP + HSTS + X-Frame-Options)
- CORS restricted to frontend origin
- NoSQL sanitization via express-mongo-sanitize
- Structured logs — never log secrets, tokens, or passwords
- Uploads: sharp processing + allowlist validation

### RBAC Roles (8, case-sensitive)
`gerente`, `residente`, `HES`, `supervisor`, `operador`, `tecnico`, `administrativo`, `cliente`

---

## 10. Offline-First / PWA

- Field modules must work with intermittent connectivity
- IndexedDB for offline storage
- Sync queue with retry logic
- Visual sync status banner
- Never show as "synced" what is still pending
- Conflict resolution via `/offline-sync` (never silent overwrites)

---

## 11. Design System

Reference: `DESIGN.md` (CERMONT UI System 3.0)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--cermont-navy` | `#0F2C59` | Active nav, technical headers |
| `--cermont-blue` | `#2154A6` | Primary actions, focus, links |
| `--cermont-blue-light` | `#3A78D8` | Info tags, hover states |
| `--cermont-green` | `#4CAF50` | Success, approved, synced |
| `--cermont-lime` | `#7CD966` | Soft accents, highlights |

### Typography
- **Inter** — all UI text
- **Geist Mono** — codes, IDs, technical labels

### Components Required
`KpiCard`, `KpiGrid`, `DashboardHero`, `SectionHeader`, `FlowStepCard`,
`StatusBadge`, `EmptyStateCard`, `ChartCard`, `FilterToolbar`, `MetricDelta`

### Anti-patterns
- No colored backgrounds on KPI cards
- No inline styles
- No duplicated Button, Card, FormField, Dialog, Table, Badge
- No generic AI aesthetics (purple gradients, Inter everywhere, cookie-cutter layouts)

---

## 12. Quality Gates (Run Before Commit)

```bash
npm run typecheck          # 0 TypeScript errors
npm run lint               # 0 Biome errors
npm run test               # All Vitest tests pass
npm run build              # Successful build
npm run verify             # typecheck + build
npx react-doctor@latest    # No regressions
```

Individual workspace:
```bash
npm run typecheck -w backend
npm run typecheck -w frontend
npm run lint -w backend
npm run lint -w frontend
npm run test -w backend
npm run test -w frontend
```

---

## 13. Key Prohibitions (Quick Reference)

| ❌ Forbidden | ✅ Required |
|-------------|------------|
| NestJS | Express 5.2.1 |
| Prisma / PostgreSQL | Mongoose 9.x + MongoDB |
| NextAuth / Auth.js | JWT + Zustand auth store |
| pnpm / yarn | npm 10.9.4 |
| Joi | Zod 4.x |
| middleware.ts | proxy.ts |
| Axios | apiClient wrapper |
| `any` / `unknown` | Proper types from Zod inference |
| `null` / `undefined` | Status objects |
| `console.log` in prod | Structured logger |
| Duplicate schemas/types | Import from `@cermont/shared-types` |
| Hardcoded roles | `@cermont/domain` |
| Direct fetch in components | TanStack Query + apiClient |
| `useEffect` for data fetching | TanStack Query |
| Context API for global state | Zustand |
| Silent catches | Typed AppError |
| Business logic in UI | Extract to services/hooks |

---

## 14. Before Implementing ANYTHING

1. Read `.agents/rules/01-stack.md` — verify no forbidden dependency
2. Read applicable rule file for target workspace
3. Check `DESIGN.md` if touching UI
4. Check `docs/architecture/API_ENDPOINT_MATRIX.md` if adding endpoints
5. Check `docs/architecture/FRONTEND_ROUTE_MAP.md` if adding routes
6. Follow contract-first development (§5 above)
7. Use existing components — never duplicate Button, Card, FormField, etc.

---

## 15. Documentation Map

| Document | Purpose |
|----------|---------|
| `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` | Product vision |
| `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` | 14-step flow, entities, RBAC |
| `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` | Technical architecture |
| `docs/architecture/FRONTEND_ROUTE_MAP.md` | All routes + status |
| `docs/architecture/API_ENDPOINT_MATRIX.md` | All endpoints + schemas |
| `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` | Full implementation rules |
| `docs/REGLAS_DESARROLLO_CERMONT.md` | Mandatory dev rules (español) |
| `DESIGN.md` | CERMONT UI System 3.0 |
| `docs/adr/` | Architecture Decision Records |
