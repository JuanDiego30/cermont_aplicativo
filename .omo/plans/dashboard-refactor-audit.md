# Plan: Auditoría y Refactorización del Dashboard — Cermont S.A.S.

## TL;DR

> **Quick Summary**: Auditar, estandarizar y escalar el dashboard de Cermont S.A.S. (`/dashboard`) corrigiendo inconsistencias visuales, unificando el design system existente en Tailwind CSS puro, implementando KPIs faltantes por rol y creando componentes faltantes (CostComparisonChart, KPIGrid, DashboardSkeleton, DashboardEmpty, DashboardForbidden).
>
> **Deliverables**:
> - Design tokens KPI añadidos a `globals.css`
> - Frontend API layer (query-keys, hooks, api service) para dashboard
> - Componentes faltantes: `CostComparisonChart`, `KPIGrid`, `DashboardSkeleton`, `DashboardEmpty`, `DashboardForbidden`
> - Refactor de `page.tsx` con roles RBAC y render condicional
> - Backend endpoints dedicados: `/dashboard/kpis`, `/dashboard/charts/cost-comparison`
> - Unificación de iconografía lucide-react + reemplazo de colores hardcodeados
> - Quality gates: typecheck + lint + build
>
> **Estimated Effort**: Large (20-25 tasks, ~4 waves)
> **Parallel Execution**: YES — 3-6 tasks per wave
> **Critical Path**: Design tokens → Contracts → Backend endpoints → Hooks → Components → Integration

---

## Context

### Current Dashboard State (Audited)

The dashboard at `frontend/src/app/(dashboard)/dashboard/page.tsx` is **functional but has accumulated technical debt**:

**What exists (already implemented):**
| Layer | Files | Status |
|-------|-------|--------|
| Zod schemas | `dashboard-summary.schema.ts`, `kpi-dashboard.schema.ts` | ✅ Complete |
| Backend service | `dashboard.service.ts` (16 parallel aggregations) | ✅ Complete |
| Backend routes | 6 endpoints (`/summary`, `/sla-risk`, `/blockers`, etc.) | ✅ Complete |
| Frontend hook | `useDashboardSummary.ts` (TanStack Query) | ✅ Complete |
| UI components | 14 components (`DashboardHero`, `ChartCard`, `OrdersByStatusChart`, `MonthlyTrendChart`, `DashboardCommandCenter`, etc.) | ✅ Mostly complete |
| Design system | `globals.css` (Tailwind 4 + @theme inline, full light/dark) | ✅ Complete |
| Page states | Loading (inline), Error (inline), Offline (inline) | ⚠️ Inline, not reusable |
| Recharts | Installed and used in 2 chart components | ✅ |

**What's missing or needs fixing:**
| Gap | Impact | Priority |
|-----|--------|----------|
| No KPI-specific color tokens (`--color-kpi-success`, etc.) | Colors mixed across components | 🔴 High |
| No `CostComparisonChart.tsx` (bar chart: proposed vs actual) | Gerente can't see budget variance | 🔴 High |
| No RBAC filtering by role | All roles get same dashboard | 🔴 High |
| No `DashboardSkeleton.tsx` reusable component | Loading state is inline, duplicated | 🟡 Medium |
| No `DashboardEmpty.tsx` reusable component | Empty state inline, without CTA | 🟡 Medium |
| No `DashboardForbidden.tsx` component | Missing RBAC forbidden state | 🟡 Medium |
| No dedicated `api/dashboard.service.ts` | Service logic inside hook file | 🟡 Medium |
| No `query-keys/dashboard.keys.ts` | Keys defined inline in hook | 🟡 Medium |
| Color hardcoding: `var(--color-brand-blue)`, `style={{ color }}` | Breaks design system SSOT | 🔴 High |
| Icon inconsistency: `Package2` for kits, `TrendingUp` for all metrics | Wrong semantics | 🟡 Medium |
| No backend `/dashboard/kpis?role=` endpoint | Frontend can't filter by role | 🔴 High |
| No `/dashboard/charts/cost-comparison` endpoint | Cost variance chart has no API | 🔴 High |

**Findings from code audit:**
- **Tailwind 4**: Project already uses `@theme inline` in `globals.css` — NO separate `tailwind.config.ts` needed
- **CSS variables**: Comprehensive, but missing KPI-specific semantic tokens
- **Icons**: All from `lucide-react` ✅ (no heroicons/react-icons contamination)
- **Colors**: 14+ files reference `var(--color-brand-blue)` or `var(--surface-primary)` via inline CSS instead of Tailwind utilities (`text-cermont-blue`, `bg-surface-primary`, etc.)
- **Business logic in UI**: `page.tsx` contains `buildDashboardKpiSnapshot`, `buildStatusSummaryItems`, `buildOrdersByStatus` — should be in domain helpers
- **RBAC**: `@cermont/domain` exports `canAccessModule()` — dashboard doesn't use it

### Research Summary

**Confirmed stack**:
- Tailwind CSS 4.2.2 (uses `@theme inline`, NOT separate `tailwind.config.ts`)
- Recharts 3.8.1 already installed
- `lucide-react` 1.7.0 is the single icon provider
- `@cermont/domain` has `canAccessModule(userRole, 'dashboard')` — available but unused
- Existing `DashboardSummarySchema` already has `charts.ordersByStatus`, `charts.ordersByMonth`, `charts.costByCategory`

---

## Work Objectives

### Core Objective
Refactorizar el dashboard de Cermont: estandarizar colores, unificar iconografía, agregar KPIs faltantes por rol, crear componentes reutilizables faltantes, y conectar backend endpoints dedicados.

### Concrete Deliverables
1. `globals.css` — KPI color tokens (`--color-kpi-success/warning/danger/info`)
2. `packages/shared-types/src/schemas/` — DashboardKPIResponse schema with `?role` filter
3. `backend/src/modules/dashboard/` — New endpoints `/kpis` and `/charts/cost-comparison`
4. `frontend/src/modules/dashboard/api/dashboard.service.ts` — API client calls
5. `frontend/src/modules/dashboard/query-keys/dashboard.keys.ts` — Stable TanStack Query keys
6. `frontend/src/modules/dashboard/hooks/useDashboardKPIs.ts` — Role-filtered KPI hook
7. `frontend/src/modules/dashboard/hooks/useDashboardCharts.ts` — Chart data hooks
8. `frontend/src/modules/dashboard/components/KPICard.tsx` — Enhanced atomic KPI card
9. `frontend/src/modules/dashboard/components/KPIGrid.tsx` — Responsive grid 2-col → 4-col
10. `frontend/src/modules/dashboard/components/CostComparisonChart.tsx` — Budget vs actual bar chart
11. `frontend/src/modules/dashboard/components/DashboardSkeleton.tsx` — Loading skeleton
12. `frontend/src/modules/dashboard/components/DashboardEmpty.tsx` — Empty state with CTA
13. `frontend/src/modules/dashboard/components/DashboardForbidden.tsx` — Forbidden state
14. `frontend/src/app/(dashboard)/dashboard/page.tsx` — Refactored with RBAC filtering
15. Refactored UI components: color vars → Tailwind utilities, icon fixes

### Definition of Done
- [ ] `npm run typecheck -w frontend` → PASS
- [ ] `npm run lint -w frontend` → PASS
- [ ] `npm run typecheck -w backend` → PASS
- [ ] `npm run build -w frontend` → PASS
- [ ] No `var(--...)` inline references in dashboard components (use Tailwind utilities)
- [ ] No `heroicons` or `react-icons` imports in dashboard
- [ ] No business logic in UI components
- [ ] All 5 states exist: Loading, Error, Empty, Offline, Forbidden

### Must Have
- Color hardcoding replaced with Tailwind utility classes (via `globals.css` @theme)
- KPIs filterable by `role` query param on backend
- All states: loading, error, empty, offline, forbidden
- Mobile-first responsive grid (2-col mobile, 4-col desktop)
- Recharts CostComparisonChart for gerente role
- Single icon provider: `lucide-react`

### Must NOT Have (Guardrails)
- ❌ No new npm packages (Recharts, lucide-react already installed)
- ❌ No deleting existing dashboard components without replacement
- ❌ No mock data in production code
- ❌ No breaking existing API contracts (add new endpoints, don't change existing ones)
- ❌ No modifying `package.json` or `package-lock.json`
- ❌ No AI-generated placeholder icons or colors
- ❌ No new CSS files (work inside existing `globals.css`)
- ❌ No changing backend Mongoose models (only add new service/controller/routes)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: Tests-after (add test tasks after implementation)
- **Framework**: Vitest (frontend), Playwright (E2E)
- **QA Policy**: Agent-executed scenarios for every task

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — 5 tasks, independent):
├── Task 1: KPI color tokens in globals.css + @theme inline
├── Task 2: DashboardKPIResponse Zod schema in shared-types
├── Task 3: query-keys/dashboard.keys.ts
├── Task 4: api/dashboard.service.ts (API client calls)
├── Task 5: Backend /dashboard/kpis endpoint + controller + service
└── Task 6: Backend /dashboard/charts/cost-comparison endpoint

Wave 2 (Core Components — 5 tasks, parallel):
├── Task 7: KPIGrid.tsx (responsive 2-col → 4-col grid)
├── Task 8: CostComparisonChart.tsx (Recharts BarChart)
├── Task 9: DashboardSkeleton.tsx (loading state)
├── Task 10: DashboardEmpty.tsx + DashboardForbidden.tsx (empty/forbidden states)
└── Task 11: Hooks: useDashboardKPIs.ts + useDashboardCharts.ts

Wave 3 (Refactor — 4 tasks, parallel):
├── Task 12: Refactor page.tsx — RBAC filtering + roles integrados
├── Task 13: Refactor existing UI components — color hardcodes → Tailwind utilities
├── Task 14: Icon audit + replacement (Package2→Tool, etc.)
└── Task 15: Extract business logic from page.tsx to domain helpers

Wave 4 (Integration + Tests — 3 tasks):
├── Task 16: Integration test: dashboard loads with role filter
├── Task 17: Component tests for new components (Vitest)
├── Task 18: Quality gates: typecheck + lint + build

Wave FINAL:
├── F1: Plan compliance audit
├── F2: Code quality review
└── F3: Scope fidelity check
```

### Dependency Matrix
- **1-6**: Independent (Wave 1 parallel)
- **7**: 1 (needs KPI tokens)
- **8**: 2 (needs cost comparison schema)
- **9-10**: 1 (needs tokens)
- **11**: 2-6 (needs backend + schema)
- **12**: 7-11 (needs all components + hooks)
- **13**: 12 (refactor after integration)
- **14**: 12 (refactor after integration)
- **15**: 12 (refactor after integration)
- **16-18**: 12-15 (after all refactors)

---

## TODOs

- [ ] 1. KPI color tokens in globals.css

  **What to do**:
  - Add to `:root` in `frontend/src/app/globals.css`:
    ```css
    --color-kpi-success: #4caf50;
    --color-kpi-warning: #d97706;
    --color-kpi-danger: #dc2626;
    --color-kpi-info: #3a78d8;
    --color-kpi-neutral: var(--color-slate);
    ```
  - Add corresponding `--color-kpi-*` aliases in dark mode
  - Add to `@theme inline {}` block:
    ```css
    --color-kpi-success: var(--color-kpi-success);
    --color-kpi-warning: var(--color-kpi-warning);
    --color-kpi-danger: var(--color-kpi-danger);
    --color-kpi-info: var(--color-kpi-info);
    ```
  - Add to `@layer utilities { }`:
    ```css
    .kpi-value-success { color: var(--color-kpi-success); }
    .kpi-value-warning { color: var(--color-kpi-warning); }
    .kpi-value-danger { color: var(--color-kpi-danger); }
    .kpi-value-info { color: var(--color-kpi-info); }
    .kpi-card-success { border-color: var(--color-kpi-success); }
    .kpi-card-warning { border-color: var(--color-kpi-warning); }
    .kpi-card-danger { border-color: var(--color-kpi-danger); }
    .kpi-card-info { border-color: var(--color-kpi-info); }
    ```

  **Must NOT do**:
  - Do not create new CSS files — modify existing `globals.css`
  - Do not change existing token values

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: [`tailwind-css-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Tasks 7, 9, 10, 13
  - **Blocked By**: None

  **References**:
  - `frontend/src/app/globals.css:22-233` — Existing design tokens structure (light mode)
  - `frontend/src/app/globals.css:239-418` — Existing dark mode tokens
  - `frontend/src/app/globals.css:425-566` — @theme inline block (add new tokens here)
  - `frontend/src/app/globals.css:669-751` — Existing KPI utility classes (`.card-kpi-*`, `.status-pill-*`)

  **Acceptance Criteria**:
  - [ ] `grep -c "--color-kpi-success" frontend/src/app/globals.css` → 3 (root, dark, @theme)
  - [ ] `grep -c "kpi-value-" frontend/src/app/globals.css` → ≥4 (success/warning/danger/info)

  **QA Scenarios**:

  ```
  Scenario: KPI tokens are registered in @theme
    Tool: Bash (grep)
    Steps:
      1. grep -n "--color-kpi-" frontend/src/app/globals.css
    Expected Result: 4 lines found (success, warning, danger, info) inside @theme inline block
    Evidence: .sisyphus/evidence/task-01-kpi-tokens.txt

  Scenario: Utility classes exist
    Tool: Bash (grep)
    Steps:
      1. grep -c ".kpi-value-" frontend/src/app/globals.css
    Expected Result: count >= 4
    Evidence: .sisyphus/evidence/task-01-kpi-utilities.txt
  ```

  **Commit**: YES
  - Message: `feat(design): add KPI color tokens to globals.css`
  - Files: `frontend/src/app/globals.css`
  - Pre-commit: `npm run typecheck -w frontend`

---

- [ ] 2. DashboardKPIResponse Zod schema in shared-types

  **What to do**:
  - Create `packages/shared-types/src/schemas/dashboard-kpi-role.schema.ts`
  - Define:
    ```typescript
    export const DashboardRoleKPIQuerySchema = z.object({
      role: z.enum(["gerente", "residente", "HES", "supervisor", "operador", "tecnico", "administrativo", "cliente"]).optional(),
    });

    export const DashboardKPIResponseSchema = z.object({
      activeOrders: z.number().int().nonnegative(),
      completedThisMonth: z.number().int().nonnegative(),
      completedLastMonth: z.number().int().nonnegative(),
      completionChangePct: z.number(),  // variation vs last month
      totalBilled: z.number().nonnegative(),
      totalProposed: z.number().nonnegative(),
      budgetUtilizationPct: z.number().min(0).max(100),
      avgClosureDays: z.number().nonnegative(),
      blockedOrders: z.number().int().nonnegative(),
      docCompletionRate: z.number().min(0).max(100),
    });
    ```
  - Export types from schema file
  - Update `packages/shared-types/src/index.ts` to export the new schema

  **Must NOT do**:
  - Do not modify existing schemas (dashboard-summary.schema.ts, kpi-dashboard.schema.ts)
  - Do not put schemas in `packages/shared-types/src/zod/` (legacy location)

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: [`zod`, `typescript-advanced-types`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Tasks 5, 6, 8, 11
  - **Blocked By**: None

  **References**:
  - `packages/shared-types/src/schemas/dashboard-summary.schema.ts` — Existing schema patterns (DashboardPipelineSummarySchema, etc.)
  - `packages/shared-types/src/index.ts` — Export pattern
  - `packages/AGENTS.md` — Schema location rules (new schemas go in `schemas/`)

  **Acceptance Criteria**:
  - [ ] File `packages/shared-types/src/schemas/dashboard-kpi-role.schema.ts` exists
  - [ ] `npm run typecheck -w packages/shared-types` → PASS
  - [ ] Schema exports all required types

  **QA Scenarios**:

  ```
  Scenario: Schema compiles and infers types
    Tool: Bash
    Steps:
      1. cd packages/shared-types && npm run typecheck
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/task-02-schema-typecheck.txt

  Scenario: Schema exports correct structure
    Tool: Bash (node -e to test)
    Steps:
      1. Run node -e to parse schema and validate shape
    Expected Result: Schema parses valid data, rejects invalid
    Evidence: .sisyphus/evidence/task-02-schema-validation.txt
  ```

  **Commit**: YES
  - Message: `feat(shared-types): add DashboardKPIResponse schema with role filter`
  - Files: `packages/shared-types/src/schemas/dashboard-kpi-role.schema.ts`, `packages/shared-types/src/index.ts`
  - Pre-commit: `npm run typecheck -w @cermont/shared-types && npm run contracts:check`

---

- [ ] 3. Query keys for dashboard

  **What to do**:
  - Create `frontend/src/modules/dashboard/query-keys/dashboard.keys.ts`
  - Define stable keys:
    ```typescript
    export const dashboardKeys = {
      all: ["dashboard"] as const,
      kpis: (role?: string) => [...dashboardKeys.all, "kpis", role] as const,
      charts: {
        all: [...dashboardKeys.all, "charts"] as const,
        orderStatus: [...dashboardKeys.all, "charts", "order-status"] as const,
        monthlyTrend: (months?: number) => [...dashboardKeys.all, "charts", "monthly-trend", months] as const,
        costComparison: [...dashboardKeys.all, "charts", "cost-comparison"] as const,
      },
      sla: [...dashboardKeys.all, "sla"] as const,
    };
    ```

  **Must NOT do**:
  - Do not use `Math.random()` or unstable keys in queryKey definitions
  - Do not import from backend

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: [] (standard TypeScript)

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Task 11
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/dashboard/hooks/useDashboardSummary.ts:31-33` — Current inline key definition (`DASHBOARD_KEYS`)
  - Existing query key patterns in `frontend/src/modules/orders/queries/`

  **Acceptance Criteria**:
  - [ ] File `frontend/src/modules/dashboard/query-keys/dashboard.keys.ts` exists
  - [ ] Exports `dashboardKeys` object with `all`, `kpis`, `charts` namespaces
  - [ ] `npm run typecheck -w frontend` → PASS

  **QA Scenarios**:

  ```
  Scenario: Keys are immutable
    Tool: Bash (node -e)
    Steps:
      1. Import and verify keys are readonly tuples
    Expected Result: TypeScript compiles, keys are correct shape
    Evidence: .sisyphus/evidence/task-03-keys.txt

  Scenario: Typecheck passes
    Tool: Bash
    Steps:
      1. cd frontend && npm run typecheck
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/task-03-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add stable query keys`
  - Files: `frontend/src/modules/dashboard/query-keys/dashboard.keys.ts`
  - Pre-commit: `npm run typecheck -w frontend`

---

- [ ] 4. Dashboard API client service

  **What to do**:
  - Create `frontend/src/modules/dashboard/api/dashboard.service.ts`
  - Implement:
    ```typescript
    import { apiClient } from "@/lib/http/api-client";
    import type { DashboardKPIResponse } from "@cermont/shared-types";

    export interface ApiResponse<T> {
      success: boolean;
      data: T;
    }

    export const dashboardApi = {
      getKPIs: (role?: string) =>
        apiClient.get<ApiResponse<DashboardKPIResponse>>(`/dashboard/kpis${role ? `?role=${role}` : ""}`),

      getCostComparison: () =>
        apiClient.get<ApiResponse<Array<{ label: string; proposed: number; actual: number }>>>(`/dashboard/charts/cost-comparison`),

      getSummary: () =>
        apiClient.get<ApiResponse<DashboardSummary>>(`/dashboard/summary`),
    };
    ```

  **Must NOT do**:
  - Do not use `fetch` directly — use `apiClient`
  - Do not add business logic here

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: [] (standard TypeScript)

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Task 11
  - **Blocked By**: Task 2

  **References**:
  - `frontend/src/lib/http/api-client.ts` — Centralized HTTP client
  - `frontend/src/modules/orders/api/` — Existing pattern for feature API services

  **Acceptance Criteria**:
  - [ ] File `frontend/src/modules/dashboard/api/dashboard.service.ts` exists
  - [ ] All methods use `apiClient`
  - [ ] `npm run typecheck -w frontend` → PASS

  **QA Scenarios**:

  ```
  Scenario: Service imports and typechecks
    Tool: Bash
    Steps:
      1. cd frontend && npm run typecheck
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/task-04-service-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(dashboard): add api client service`
  - Files: `frontend/src/modules/dashboard/api/dashboard.service.ts`
  - Pre-commit: `npm run typecheck -w frontend`

---

- [ ] 5. Backend `/dashboard/kpis` endpoint

  **What to do**:
  - In `backend/src/modules/dashboard/`:
    - Add to `dashboard.controller.ts`: `getRoleKPIs(req, res)` — reads `req.query.role`, calls service
    - Add to `dashboard.service.ts`: `getRoleBaseKPIs(role?: string)` — aggregates:
      - Active orders count (by status filter based on role)
      - Completed this month / last month (with variation %)
      - Total billed vs proposed amounts
      - Average closure days
      - Blocked orders count
      - Document completion rate
    - Add route in `dashboard.routes.ts`:
      ```typescript
      router.get("/kpis", authorize(...ALL_AUTHENTICATED_ROLES), validateQuery(DashboardRoleKPIQuerySchema), getRoleKPIs);
      ```
  - Import `DashboardRoleKPIQuerySchema` and `DashboardKPIResponseSchema` from `@cermont/shared-types`
  - Return filtered data based on role param

  **Must NOT do**:
  - Do not modify existing routes (summary, operational-kpis, sla-risk, etc.)
  - Do not add try/catch to controller (Express 5 propagates errors)

  **Recommended Agent Profile**:
  - Category: `deep`
  - Skills: [`nodejs-express-server`, `zod`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Task 11
  - **Blocked By**: Task 2

  **References**:
  - `backend/src/modules/dashboard/dashboard.service.ts:62-164` — Existing aggregation pattern
  - `backend/src/modules/dashboard/dashboard.controller.ts` — Controller pattern
  - `backend/src/modules/dashboard/dashboard.routes.ts` — Route wiring pattern
  - `packages/shared-types/src/schemas/dashboard-kpi-role.schema.ts` — New schema (Task 2)

  **Acceptance Criteria**:
  - [ ] GET `/api/dashboard/kpis` returns valid `DashboardKPIResponse`
  - [ ] GET `/api/dashboard/kpis?role=gerente` returns role-filtered data
  - [ ] `npm run typecheck -w backend` → PASS

  **QA Scenarios**:

  ```
  Scenario: KPIs endpoint returns valid data
    Tool: Bash (curl)
    Steps:
      1. Start backend: cd backend && npm run dev &
      2. Wait for ready
      3. curl -s http://127.0.0.1:4000/api/dashboard/kpis -H "Authorization: Bearer <token>"
    Expected Result: JSON with success: true and data matching DashboardKPIResponseSchema
    Evidence: .sisyphus/evidence/task-05-kpis-endpoint.json

  Scenario: Role-filtered KPIs
    Tool: Bash (curl)
    Steps:
      1. curl -s "http://127.0.0.1:4000/api/dashboard/kpis?role=gerente" -H "Authorization: Bearer <token>"
    Expected Result: 200 status, valid response
    Evidence: .sisyphus/evidence/task-05-kpis-role.json
  ```

  **Commit**: YES
  - Message: `feat(backend): add /dashboard/kpis endpoint with role filter`
  - Files: `backend/src/modules/dashboard/dashboard.routes.ts`, `backend/src/modules/dashboard/dashboard.controller.ts`, `backend/src/modules/dashboard/dashboard.service.ts`
  - Pre-commit: `npm run typecheck -w backend && npm run test -w backend`

---

- [ ] 6. Backend `/dashboard/charts/cost-comparison` endpoint

  **What to do**:
  - In `backend/src/modules/dashboard/`:
    - Add to `dashboard.controller.ts`: `getCostComparisonChart(req, res)`
    - Add to `dashboard.service.ts`: `buildCostComparisonChart()` — aggregates cost by service category:
      ```typescript
      async function buildCostComparisonChart() {
        const data = await Cost.aggregate([
          { $group: { _id: "$serviceType", proposed: { $sum: "$estimatedAmount" }, actual: { $sum: "$actualAmount" } } },
          { $sort: { actual: -1 } },
        ]);
        return data.map(entry => ({ label: entry._id, proposed: entry.proposed, actual: entry.actual }));
      }
      ```
    - Add route: `router.get("/charts/cost-comparison", authorize(...ALL_AUTHENTICATED_ROLES), getCostComparisonChart);`

  **Must NOT do**:
  - Do not break the existing `/summary` endpoint which also has cost data

  **Recommended Agent Profile**:
  - Category: `deep`
  - Skills: [`nodejs-express-server`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Tasks 8, 11
  - **Blocked By**: Task 2

  **References**:
  - `backend/src/modules/dashboard/dashboard.service.ts:396-413` — Existing `getCostByCategory` pattern
  - `backend/src/modules/dashboard/dashboard.service.ts:367-371` — Existing aggregation pattern

  **Acceptance Criteria**:
  - [ ] GET `/api/dashboard/charts/cost-comparison` returns `{label, proposed, actual}[]`
  - [ ] `npm run typecheck -w backend` → PASS

  **QA Scenarios**:

  ```
  Scenario: Cost comparison endpoint returns data
    Tool: Bash (curl)
    Steps:
      1. curl -s http://127.0.0.1:4000/api/dashboard/charts/cost-comparison -H "Authorization: Bearer <token>"
    Expected Result: Array of {label, proposed, actual} objects
    Evidence: .sisyphus/evidence/task-06-cost-comparison.json
  ```

  **Commit**: YES
  - Message: `feat(backend): add /dashboard/charts/cost-comparison endpoint`
  - Files: `backend/src/modules/dashboard/dashboard.routes.ts`, `backend/src/modules/dashboard/dashboard.controller.ts`, `backend/src/modules/dashboard/dashboard.service.ts`
  - Pre-commit: `npm run typecheck -w backend && npm run test -w backend`

---

- [ ] 7. KPIGrid responsive component

  **What to do**:
  - Create `frontend/src/modules/dashboard/components/KPIGrid.tsx`
  - Responsive grid: 1-col mobile, 2-col tablet, 4-col desktop
  - Props: `children: ReactNode`
  - Layout:
    ```tsx
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
    ```
  - Use existing `KPICard` from `@/core/ui/KPICard` for individual cards
  - Then update `page.tsx` `DashboardKpiGrid` to use this new component

  **Must NOT do**:
  - Do not create a new KPICard — reuse existing `@/core/ui/KPICard`
  - Do not add business logic

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`tailwind-css-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: Task 12
  - **Blocked By**: Task 1

  **References**:
  - `frontend/src/app/(dashboard)/dashboard/page.tsx:497-539` — Current inline `DashboardKpiGrid` function
  - `frontend/src/core/ui/KPICard.tsx` — Existing reusable KPI card component
  - `frontend/src/app/globals.css:643-648` — `.card-dashboard` utility class

  **Acceptance Criteria**:
  - [ ] File exists and exports `KPIGrid` component
  - [ ] Grid is 1-col on mobile, 2-col on `sm:`, 4-col on `xl:`
  - [ ] `npm run typecheck -w frontend` → PASS

  **QA Scenarios**:

  ```
  Scenario: KPIGrid renders 4 child cards
    Tool: Bash (test via existing test runner)
    Steps:
      1. Create minimal render test
    Expected Result: Grid renders with correct class structure
    Evidence: .sisyphus/evidence/task-07-kpi-grid.txt
  ```

  **Commit**: YES (groups with 12)
  - Message: `feat(dashboard): add KPIGrid component`
  - Files: `frontend/src/modules/dashboard/components/KPIGrid.tsx`
  - Pre-commit: `npm run typecheck -w frontend`

---

- [ ] 8. CostComparisonChart component

  **What to do**:
  - Create `frontend/src/modules/dashboard/components/CostComparisonChart.tsx`
  - Recharts BarChart with:
    - X-axis: service type labels
    - Y-axis: COP amounts
    - Two bars per category: "Presupuestado" (estimated/proposed) and "Real" (actual)
    - Legend, Tooltip, CartesianGrid
  - Props: `data: Array<{ label: string; proposed: number; actual: number }>`, `loading?: boolean`
  - Empty state inline when no data
  - Wrap in existing `ChartCard` component
  - Dynamic imports for Recharts components (no SSR)

  **Must NOT do**:
  - Do not install new npm packages (Recharts already installed)
  - Do not hardcode colors — use CSS variables (--color-brand-blue for proposed, --color-success for actual)

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`tailwind-css-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 1, 6

  **References**:
  - `frontend/src/modules/dashboard/ui/MonthlyTrendChart.tsx` — Existing Recharts pattern (BarChart, ResponsiveContainer, Tooltip pattern)
  - `frontend/src/modules/dashboard/ui/OrdersByStatusChart.tsx` — Existing dynamic import pattern
  - `frontend/src/modules/dashboard/ui/ChartCard.tsx` — Existing wrapper component

  **Acceptance Criteria**:
  - [ ] File exists with Recharts BarChart
  - [ ] Two bars per category (proposed vs actual)
  - [ ] Handles empty data state
  - [ ] `npm run typecheck -w frontend` → PASS

  **QA Scenarios**:

  ```
  Scenario: CostComparisonChart renders with data
    Tool: bash (render check)
    Steps:
      1. Pass sample data [{label: "Lifeline", proposed: 10000000, actual: 8500000}]
    Expected Result: Component renders BarChart with 2 bars
    Evidence: .sisyphus/evidence/task-08-chart-render.txt

  Scenario: Empty state renders
    Tool: bash
    Steps:
      1. Pass empty array
    Expected Result: "Sin datos disponibles" message shown
    Evidence: .sisyphus/evidence/task-08-chart-empty.txt
  ```

  **Commit**: YES (groups with 12)
  - Message: `feat(dashboard): add CostComparisonChart component`
  - Files: `frontend/src/modules/dashboard/components/CostComparisonChart.tsx`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 9. DashboardSkeleton component

  **What to do**:
  - Create `frontend/src/modules/dashboard/components/DashboardSkeleton.tsx`
  - Skeleton layout matching the actual dashboard layout:
    - Header skeleton (h1 + subtitle)
    - 4 KPI card skeletons (grid 1-col → 4-col)
    - 1 chart row skeleton (two columns)
    - Bottom row skeletons (3 columns)
  - Use existing `@/core/ui/Skeleton` component
  - Export as default

  **Must NOT do**:
  - Do not create another Skeleton component — reuse existing

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: [`tailwind-css-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: Task 12
  - **Blocked By**: Task 1

  **References**:
  - `frontend/src/app/(dashboard)/dashboard/page.tsx:459-470` — Current inline `DashboardLoadingState`
  - `frontend/src/core/ui/Skeleton.tsx` — Existing Skeleton component

  **Acceptance Criteria**:
  - [ ] File exists, matches dashboard layout structure
  - [ ] Uses `@/core/ui/Skeleton` internally
  - [ ] `npm run typecheck -w frontend` → PASS

  **QA Scenarios**:

  ```
  Scenario: Skeleton renders without errors
    Tool: Bash (render test)
    Steps:
      1. Import and render DashboardSkeleton
    Expected Result: Renders without errors, skeleton elements present
    Evidence: .sisyphus/evidence/task-09-skeleton.txt
  ```

  **Commit**: YES (groups with 10)
  - Message: `feat(dashboard): add DashboardSkeleton component`
  - Files: `frontend/src/modules/dashboard/components/DashboardSkeleton.tsx`
  - Pre-commit: `npm run typecheck -w frontend`

---

- [ ] 10. DashboardEmpty + DashboardForbidden components

  **What to do**:
  - Create `frontend/src/modules/dashboard/components/DashboardEmpty.tsx`
    - Illustration area (using lucide-icon `BarChart3` or `LayoutDashboard`)
    - Title: "No hay datos disponibles"
    - Description: "Aún no se han registrado órdenes o actividades en el período seleccionado."
    - CTA button: "Ir a crear una orden" → link to `/orders`
  - Create `frontend/src/modules/dashboard/components/DashboardForbidden.tsx`
    - Icon: `ShieldAlert` from lucide-react
    - Title: "Acceso restringido"
    - Description: "No tienes permisos para ver esta sección del dashboard."
    - CTA: "Volver al inicio" → link to `/`

  **Must NOT do**:
  - Do not add business logic
  - Do not hardcode colors — use Tailwind utilities

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: [`tailwind-css-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2, same group as Task 9)
  - **Blocks**: Task 12
  - **Blocked By**: Task 1

  **References**:
  - `frontend/src/app/(dashboard)/dashboard/page.tsx:486-495` — Current inline `DashboardOfflineState`
  - `frontend/src/components/common/PageStates.tsx` — Existing `BackendUnavailableState` pattern

  **Acceptance Criteria**:
  - [ ] Both files exist
  - [ ] DashboardEmpty has illustration + title + description + CTA link
  - [ ] DashboardForbidden has icon + title + description + CTA link
  - [ ] `npm run typecheck -w frontend` → PASS

  **QA Scenarios**:

  ```
  Scenario: Empty state renders with CTA
    Tool: bash
    Steps:
      1. Render DashboardEmpty
    Expected Result: Shows message + "Ir a crear una orden" link
    Evidence: .sisyphus/evidence/task-10-empty.txt

  Scenario: Forbidden state renders
    Tool: bash
    Steps:
      1. Render DashboardForbidden
    Expected Result: Shows "Acceso restringido" + "Volver al inicio" link
    Evidence: .sisyphus/evidence/task-10-forbidden.txt
  ```

  **Commit**: YES (groups with 9)
  - Message: `feat(dashboard): add DashboardEmpty and DashboardForbidden components`
  - Files: `frontend/src/modules/dashboard/components/DashboardEmpty.tsx`, `frontend/src/modules/dashboard/components/DashboardForbidden.tsx`
  - Pre-commit: `npm run typecheck -w frontend`

---

- [ ] 11. Dashboard hooks: useDashboardKPIs + useDashboardCharts

  **What to do**:
  - Create `frontend/src/modules/dashboard/hooks/useDashboardKPIs.ts`:
    ```typescript
    import { useQuery } from "@tanstack/react-query";
    import { dashboardKeys } from "../query-keys/dashboard.keys";
    import { dashboardApi } from "../api/dashboard.service";

    export function useDashboardKPIs(role?: string) {
      return useQuery({
        queryKey: dashboardKeys.kpis(role),
        queryFn: async () => {
          const res = await dashboardApi.getKPIs(role);
          return res.data;
        },
        staleTime: 15_000,
      });
    }
    ```
  - Create `frontend/src/modules/dashboard/hooks/useDashboardCharts.ts`:
    - `useCostComparison()` — fetches cost comparison chart data
    - Use `dashboardKeys.charts.costComparison` as queryKey

  **Must NOT do**:
  - Do not put API call logic directly in component — use these hooks
  - Do not use `useEffect` for data fetching

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: [] (standard TypeScript)

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 3, 4, 5, 6

  **References**:
  - `frontend/src/modules/dashboard/hooks/useDashboardSummary.ts` — Existing hook pattern
  - `frontend/src/modules/dashboard/query-keys/dashboard.keys.ts` — Keys (Task 3)

  **Acceptance Criteria**:
  - [ ] `useDashboardKPIs` uses `dashboardKeys.kpis()` and `dashboardApi.getKPIs()`
  - [ ] `useDashboardCharts` exports `useCostComparison`
  - [ ] `npm run typecheck -w frontend` → PASS

  **QA Scenarios**:

  ```
  Scenario: Hooks typecheck
    Tool: Bash
    Steps:
      1. cd frontend && npm run typecheck
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/task-11-hooks-typecheck.txt
  ```

  **Commit**: YES (groups with 12)
  - Message: `feat(dashboard): add useDashboardKPIs and useDashboardCharts hooks`
  - Files: `frontend/src/modules/dashboard/hooks/useDashboardKPIs.ts`, `frontend/src/modules/dashboard/hooks/useDashboardCharts.ts`
  - Pre-commit: `npm run typecheck -w frontend`

---

- [ ] 12. Refactor page.tsx with RBAC + new components

  **What to do**:
  - Refactor `frontend/src/app/(dashboard)/dashboard/page.tsx`:
    1. **Import new components**: `DashboardSkeleton`, `DashboardEmpty`, `DashboardForbidden`, `KPIGrid`, `CostComparisonChart`
    2. **Add RBAC**: Import `canAccessModule` from `@cermont/domain`; wrap sections in role checks:
       ```typescript
       import { canAccessModule, ROLES } from "@cermont/domain";
       
       // Show admin pipeline/financial charts only to gerente + administrativo
       {canAccessModule(user?.role ?? "", "financial") && (
         <CostComparisonChart data={costData} />
       )}
       ```
    3. **Replace inline `DashboardLoadingState`** with imported `DashboardSkeleton`
    4. **Replace inline `DashboardKpiGrid`** with imported `KPIGrid` component
    5. **Add DashboardEmpty** for empty data state
    6. **Add DashboardForbidden** check at top if user lacks dashboard access
    7. **Keep** existing: `DashboardHero`, `FleetAlertsBanner`, `StepTimeline`, `ServiceCaseDashboardPanel`, charts row, bottom row
    8. **Connect new hooks**: `useDashboardKPIs(user?.role)` for role-based KPIs

  **Must NOT do**:
  - Do not delete existing functionality or components — add new imports alongside
  - Do not move existing components to new paths (avoid breaking references)

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: [`vercel-composition-patterns`, `vercel-react-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on all Wave 2 tasks)
  - **Blocks**: Tasks 13, 14, 15
  - **Blocked By**: Tasks 7, 8, 9, 10, 11

  **References**:
  - `frontend/src/app/(dashboard)/dashboard/page.tsx` — Full file (540 lines), all sections
  - `@cermont/domain` — `canAccessModule` helper for RBAC
  - `frontend/proxy.ts` — Existing RBAC proxy pattern
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` — Route access per role

  **Acceptance Criteria**:
  - [ ] page.tsx uses imported `DashboardSkeleton` instead of inline loading
  - [ ] page.tsx uses imported `KPIGrid` instead of inline `DashboardKpiGrid`
  - [ ] Role-based sections render conditionally via `canAccessModule`
  - [ ] `DashboardEmpty` rendered when no data
  - [ ] `DashboardForbidden` rendered for unauthorized roles
  - [ ] `npm run typecheck -w frontend` → PASS
  - [ ] `npm run build -w frontend` → PASS

  **QA Scenarios**:

  ```
  Scenario: Dashboard renders with full data for gerente
    Tool: Playwright
    Preconditions: Auth as gerente, backend has data
    Steps:
      1. Navigate to /dashboard
      2. Wait for skeleton to disappear
      3. Assert KPI cards visible (4 cards)
      4. Assert CostComparisonChart visible
      5. Assert StepTimeline visible
    Expected Result: Full dashboard renders
    Evidence: .sisyphus/evidence/task-12-dashboard-gerente.png

  Scenario: Forbidden state for unauthorized role
    Tool: Playwright
    Preconditions: Auth as cliente (no dashboard access)
    Steps:
      1. Navigate to /dashboard
      2. Wait for render
    Expected Result: DashboardForbidden component shown, not data
    Evidence: .sisyphus/evidence/task-12-forbidden.png
  ```

  **Commit**: YES
  - Message: `refactor(dashboard): integrate RBAC, KPIGrid, and state components`
  - Files: `frontend/src/app/(dashboard)/dashboard/page.tsx`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build -w frontend`

---

- [ ] 13. Refactor existing dashboard components — replace color hardcodes with Tailwind utilities

  **What to do**:
  For each existing UI component in `frontend/src/modules/dashboard/ui/`, replace `var(--...)` inline references with Tailwind utility classes:

  | File | Current | Target |
  |------|---------|--------|
  | `DashboardHero.tsx` | `bg-[var(--surface-secondary)]`, `text-[var(--color-brand-blue)]`, `text-[var(--text-secondary)]` | `bg-surface`, `text-brand-green`, `text-charcoal` |
  | `DashboardCommandCenter.tsx` | `bg-[var(--surface-primary)]`, `text-[var(--color-brand-blue)]`, `border-[var(--border-subtle)]`, `bg-[var(--surface-secondary)]` | `bg-canvas`, `text-brand-green`, `border-hairline`, `bg-surface` |
  | `ChartCard.tsx` | `bg-[var(--surface-primary)]`, `border-[var(--border-subtle)]`, `text-[var(--text-primary)]` | `bg-canvas`, `border-hairline`, `text-ink` |
  | `SlaRiskOrdersTable.tsx` | `bg-[var(--color-danger-bg)]/40`, `text-[var(--color-danger)]` | `bg-danger-bg/40`, `text-danger` |
  | `ServiceCaseDashboardPanel.tsx` | `text-[var(--color-brand-blue)]`, `bg-[var(--color-brand-blue-bg)]`, `border-[var(--border-subtle)]` | `text-brand-green`, `bg-cermont-blue-bg`, `border-hairline` |
  | `FleetAlertsBanner.tsx` | `border-[var(--color-danger-bg)]`, `bg-[var(--color-danger-bg)]/30`, `text-[var(--color-danger)]` | `border-danger-bg`, `bg-danger-bg/30`, `text-danger` |
  | `ActivityTimeline.tsx` | `bg-[var(--surface-primary)]`, `border-[var(--border-subtle)]` | `bg-canvas`, `border-hairline` |

  **Must NOT do**:
  - Do not change component structure or behavior — only styling
  - Do not use irrelevant Tailwind classes that change visual appearance
  - Do not modify `globals.css` (tokens already defined there)

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`tailwind-css-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, same as Task 14)
  - **Blocked By**: Task 12

  **References**:
  - `frontend/src/app/globals.css` — All available Tailwind utility classes via @theme inline
  - `frontend/AGENTS.md` — "Quick palette" section shows correct Tailwind equivalents

  **Acceptance Criteria**:
  - [ ] grep -c "var(--" `frontend/src/modules/dashboard/ui/*.tsx` — reduced count (some CSS vars in Recharts are acceptable)
  - [ ] grep -c "style={{" `frontend/src/modules/dashboard/ui/*.tsx` — 0 (unless justified for Recharts)
  - [ ] `npm run typecheck -w frontend` → PASS
  - [ ] Visual diff check: no visual regression

  **QA Scenarios**:

  ```
  Scenario: No hardcoded CSS variable references in components
    Tool: Bash (grep)
    Steps:
      1. grep -rn "var(--" frontend/src/modules/dashboard/ui/ --include="*.tsx"
    Expected Result: Only acceptable CSS var references (Recharts tooltip contentStyle, ChartCard inline legend colors)
    Evidence: .sisyphus/evidence/task-13-color-vars.txt

  Scenario: No inline style objects
    Tool: Bash (grep)
    Steps:
      1. grep -rn "style={{" frontend/src/modules/dashboard/ui/ --include="*.tsx"
    Expected Result: 0 matches (or only Recharts tooltip contentStyle)
    Evidence: .sisyphus/evidence/task-13-inline-styles.txt
  ```

  **Commit**: YES (groups with 14, 15)
  - Message: `refactor(dashboard): replace hardcoded CSS vars with Tailwind utilities`
  - Files: Multiple `frontend/src/modules/dashboard/ui/*.tsx`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 14. Icon audit + semantic replacement

  **What to do**:
  Audit all icons in `frontend/src/modules/dashboard/` and `frontend/src/app/(dashboard)/dashboard/` for semantic correctness. Replace incorrect icons:

  | Location | Current Icon | Issue | Replacement |
  |----------|-------------|-------|-------------|
  | `page.tsx:145` | `Package2` for "Kits activos" | Wrong semantic | `Backpack` |
  | `DashboardHero.tsx:119` | `TrendingUp` for ALL 3 metrics | Not descriptive per metric | `ClipboardList` for orders, `Wrench` for maintenance, `CheckCircle2` for completed |
  | `DashboardCommandCenter.tsx:102` | `FileClock` for "Expedientes por cerrar" | Acceptable but better options | `FolderArchive` |
  | `SlaRiskOrdersTable.tsx:4` | `TriangleAlert` | Acceptable | Keep |
  | `ServiceCaseDashboardPanel.tsx:2` | `ClipboardCheck` for "Listos para facturar" | Acceptable | Keep (or `Receipt`) |

  - Verify ALL icons come from `lucide-react` only
  - grep for `from 'heroicons'` and `from 'react-icons'` — must be 0
  - Fix any mismatches

  **Must NOT do**:
  - Do not import icons from multiple packages
  - Do not replace icons unnecessarily (only fix semantic mismatches)

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: [] (standard audit + edit)

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, same as Task 13)
  - **Blocked By**: Task 12

  **References**:
  - `lucide-react` icons reference: https://lucide.dev/icons/
  - `frontend/AGENTS.md` — "Use lucide-react for icons"

  **Acceptance Criteria**:
  - [ ] `grep -r "from 'heroicons'" frontend/src/modules/dashboard/` → empty
  - [ ] `grep -r "from 'react-icons'" frontend/src/modules/dashboard/` → empty
  - [ ] DashboardHero metrics use different icons per metric type
  - [ ] `npm run typecheck -w frontend` → PASS

  **QA Scenarios**:

  ```
  Scenario: No icon package contamination
    Tool: Bash
    Steps:
      1. grep -rn "from ['\"]heroicons" frontend/src/modules/dashboard/
      2. grep -rn "from ['\"]react-icons" frontend/src/modules/dashboard/
    Expected Result: Both return empty
    Evidence: .sisyphus/evidence/task-14-icon-contamination.txt

  Scenario: DashboardHero uses differentiated icons
    Tool: Bash (grep)
    Steps:
      1. grep -n "icon=" frontend/src/modules/dashboard/ui/DashboardHero.tsx
    Expected Result: Different icon names for different metrics
    Evidence: .sisyphus/evidence/task-14-hero-icons.txt
  ```

  **Commit**: YES (groups with 13, 15)
  - Message: `fix(dashboard): audit and fix icon semantics across dashboard`
  - Files: Multiple in `frontend/src/modules/dashboard/`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 15. Extract business logic from page.tsx to domain helpers

  **What to do**:
  - Create `frontend/src/modules/dashboard/model/dashboard-helpers.ts`:
    ```typescript
    import type { DashboardCharts } from "@cermont/shared-types";

    export function buildDashboardKpiSnapshot(dashboardSummary, serviceCaseSummary, activeKitCount) {
      // Move from page.tsx
    }

    export function buildOrdersByStatus(charts?: DashboardCharts | null) {
      // Move from page.tsx
    }

    export function buildMonthlyTrendData(charts, orders) {
      // Move from page.tsx
    }

    export function emptyDashboardKpis() {
      // Move from page.tsx
    }

    export function buildStatusSummaryItems(kpis, activeKitCount) {
      // Move from page.tsx
    }
    ```
  - Import and use in page.tsx instead of inline function definitions
  - Ensure all types are properly imported from `@cermont/shared-types`

  **Must NOT do**:
  - Do not change the logic — only relocate it
  - Do not introduce `any` or `unknown`

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: [] (standard refactor)

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocked By**: Task 12

  **References**:
  - `frontend/src/app/(dashboard)/dashboard/page.tsx:78-166` — Functions to extract
  - `frontend/src/modules/dashboard/hooks/` — Adjacent hooks for reference

  **Acceptance Criteria**:
  - [ ] `dashboard-helpers.ts` exists with extracted functions
  - [ ] page.tsx imports from `dashboard-helpers.ts`
  - [ ] `npm run typecheck -w frontend` → PASS
  - [ ] No `any` or `unknown` in new file

  **QA Scenarios**:

  ```
  Scenario: Helpers typecheck
    Tool: Bash
    Steps:
      1. cd frontend && npm run typecheck
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/task-15-helpers-typecheck.txt

  Scenario: No business logic in page.tsx (helper functions only imported)
    Tool: Bash (grep)
    Steps:
      1. grep -c "function build" frontend/src/app/(dashboard)/dashboard/page.tsx
    Expected Result: 0 (all extracted to helpers)
    Evidence: .sisyphus/evidence/task-15-no-inline-logic.txt
  ```

  **Commit**: YES (groups with 13, 14)
  - Message: `refactor(dashboard): extract business logic to model helpers`
  - Files: `frontend/src/modules/dashboard/model/dashboard-helpers.ts`, `frontend/src/app/(dashboard)/dashboard/page.tsx`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

- [ ] 16. Integration test: dashboard loads with role filter

  **What to do**:
  - Add test file: `frontend/tests/modules/dashboard/dashboard-role-kpis.test.tsx`
  - Test scenarios:
    1. Gerente sees all KPI sections
    2. Administrativo sees financial pipeline but not field readiness
    3. Tecnico sees limited dashboard (no cost charts)
  - Use `@testing-library/react` + Vitest
  - Mock `useAuth` and `@tanstack/react-query`

  **Must NOT do**:
  - Do not test backend endpoints (those are separate)
  - Do not mock at the API layer in integration tests

  **Recommended Agent Profile**:
  - Category: `unspecified-low`
  - Skills: [`vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocked By**: Tasks 12-15

  **References**:
  - `frontend/tests/modules/dashboard/dashboard-visuals.test.tsx` — Existing dashboard test
  - `frontend/tests/modules/dashboard/DashboardCommandCenter.test.tsx` — Existing test

  **Acceptance Criteria**:
  - [ ] Test file exists with ≥3 test cases
  - [ ] `npm run test -w frontend` → PASS
  - [ ] Tests cover gerente, administrativo, tecnico roles

  **QA Scenarios**:

  ```
  Scenario: All tests pass
    Tool: Bash
    Steps:
      1. cd frontend && npm run test -- --run
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-16-tests.txt
  ```

  **Commit**: YES
  - Message: `test(dashboard): add role-based KPI tests`
  - Files: `frontend/tests/modules/dashboard/dashboard-role-kpis.test.tsx`
  - Pre-commit: `npm run test -w frontend`

---

- [ ] 17. Component tests for new components

  **What to do**:
  - Add test file: `frontend/tests/modules/dashboard/dashboard-new-components.test.tsx`
  - Test scenarios:
    1. KPIGrid renders with correct responsive classes
    2. DashboardSkeleton renders all expected skeleton elements
    3. DashboardEmpty renders with CTA link
    4. DashboardForbidden renders with CTA link
    5. CostComparisonChart renders with data
    6. CostComparisonChart renders empty state

  **Must NOT do**:
  - Do not test implementation details (class names) — test behavior

  **Recommended Agent Profile**:
  - Category: `unspecified-low`
  - Skills: [`vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, with Task 16)
  - **Blocked By**: Tasks 7-10

  **References**:
  - `frontend/tests/modules/dashboard/dashboard-visuals.test.tsx` — Existing test patterns

  **Acceptance Criteria**:
  - [ ] Test file exists with ≥6 test cases
  - [ ] `npm run test -w frontend` → PASS

  **QA Scenarios**:

  ```
  Scenario: All component tests pass
    Tool: Bash
    Steps:
      1. cd frontend && npm run test -- --run
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-17-component-tests.txt
  ```

  **Commit**: YES
  - Message: `test(dashboard): add tests for new components`
  - Files: `frontend/tests/modules/dashboard/dashboard-new-components.test.tsx`
  - Pre-commit: `npm run test -w frontend`

---

- [ ] 18. Quality gates

  **What to do**:
  - Run all quality gates sequentially:
    ```bash
    npm run typecheck -w frontend
    npm run lint -w frontend
    npm run typecheck -w backend
    npm run build -w frontend
    npm run contracts:check
    npx react-doctor@latest
    ```
  - Fix any issues found
  - Verify:
    - No `var(--` references in dashboard UI components (except Recharts tooltip)
    - No `style={{` in dashboard components (except Recharts)
    - No heroicons/react-icons imports
    - No business logic in UI components

  **Must NOT do**:
  - Do not skip any gate
  - Do not claim completion if any gate fails

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: [] (standard verification)

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential gates)
  - **Blocked By**: All implementation tasks

  **References**:
  - `frontend/AGENTS.md` — Required validation section
  - `docs/REGLAS_DESARROLLO_CERMONT.md` — Section 16: checklist

  **Acceptance Criteria**:
  - [ ] `npm run typecheck -w frontend` → exit 0
  - [ ] `npm run lint -w frontend` → exit 0
  - [ ] `npm run typecheck -w backend` → exit 0
  - [ ] `npm run build -w frontend` → exit 0
  - [ ] `npm run contracts:check` → exit 0
  - [ ] No hardcoded colors in dashboard components

  **QA Scenarios**:

  ```
  Scenario: All quality gates pass
    Tool: Bash
    Steps:
      1. npm run typecheck -w frontend
      2. npm run lint -w frontend
      3. npm run typecheck -w backend
      4. npm run build -w frontend
      5. npm run contracts:check
      6. npx react-doctor@latest
    Expected Result: All pass (exit 0)
    Evidence: .sisyphus/evidence/task-18-gates.txt
  ```

  **Commit**: YES
  - Message: `chore: run quality gates — all pass`
  - Files: Various (fixes only)
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck -w frontend`, `npm run lint -w frontend`, `npm run test -w frontend`. Review all changed files for: `any`/`null`/`undefined`, empty catches, business logic in UI, hardcoded colors.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec was built.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

| Commit | Message | Scope |
|--------|---------|-------|
| Task 1 | `feat(design): add KPI color tokens to globals.css` | Design |
| Task 2 | `feat(shared-types): add DashboardKPIResponse schema with role filter` | Contracts |
| Tasks 3-4 | `feat(dashboard): add query keys and api client service` | Frontend data layer |
| Tasks 5-6 | `feat(backend): add /dashboard/kpis and /charts/cost-comparison endpoints` | Backend API |
| Tasks 7-10 | `feat(dashboard): add KPIGrid, CostComparisonChart, and state components` | Frontend components |
| Task 11 | `feat(dashboard): add useDashboardKPIs and useDashboardCharts hooks` | Frontend hooks |
| Task 12 | `refactor(dashboard): integrate RBAC, KPIGrid, and state components` | Page integration |
| Tasks 13-15 | `refactor(dashboard): fix color hardcodes, icons, and extract helpers` | Refactoring |
| Task 16 | `test(dashboard): add role-based KPI tests` | Tests |
| Task 17 | `test(dashboard): add tests for new components` | Tests |
| Task 18 | `chore: run quality gates — all pass` | Quality |

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck -w frontend  # Expected: exit 0
npm run lint -w frontend       # Expected: exit 0
npm run typecheck -w backend   # Expected: exit 0
npm run build -w frontend      # Expected: exit 0
npm run contracts:check        # Expected: exit 0
npx react-doctor@latest        # Expected: clean
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent (no hardcoded colors, single icon provider, no business logic in UI)
- [ ] All quality gates pass
- [ ] Evidence files in `.sisyphus/evidence/`
- [ ] Original functionality preserved — nothing removed
