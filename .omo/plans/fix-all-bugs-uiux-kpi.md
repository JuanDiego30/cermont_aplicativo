# Fix All Bugs, UI/UX & KPI Improvements — Cermont S.A.S.

## TL;DR

> **Objective**: Fix 7 confirmed runtime bugs + 20+ UI/UX inconsistencies + add KPI contextualization + implement error recovery patterns across the Cermont monorepo.
>
> **Deliverables**:
> - Fix payments 400 API errors + skeleton persistence
> - Fix evidence page loading delay (session re-validation)
> - Fix assets/templates empty states + missing CTAs
> - Fix admin/settings i18n tilde errors
> - Fix breadcrumb labels across dashboard pages
> - Add page-specific metadata titles for all routes
> - Add error boundaries + error recovery for all API failures
> - Contextualize KPIs from generic to Cermont domain-specific
> - Add KPI empty states with actionable guidance
> - Fix button color inconsistencies (blue→green brand)
> - Fix Cermont AI service (configuration + fallback state)
> - Standardize loading skeletons behavior across all modules

> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: API fixes → Error boundaries → UI polish → KPIs → Cermont AI

---

## Context

### Original Request
Complete audit-driven remediation covering runtime bugs, UI/UX inconsistencies, KPI contextualization, missing error states, and service integration gaps discovered through comprehensive Playwright testing and manual audit of all 30+ application modules.

### Key Findings (Synthesized from Audit + Playwright Testing)
| ID | Severity | Module | Issue |
|----|----------|--------|-------|
| B-01 | CRIT | `/payments` | API returns 400 for dashboard/aging endpoints → skeleton loaders persist indefinitely |
| B-02 | CRIT | `/evidences` | "Inicializando sesión..." 3s delay on page load (session re-validation on every navigation) |
| B-03 | HIGH | `/assets` | Empty state has no CTA button to create new asset |
| B-04 | HIGH | `/templates` | Page subtitle text truncated/invisible below `<h1>` |
| B-05 | HIGH | Cermont AI | AI service panel shows "No disponible" with no configuration path |
| B-06 | HIGH | `/admin/settings` | Missing tildes/accents in labels: "Sincronizacion", "automaticos", "codigos" |
| B-07 | MED | `/service-cases` | Breadcrumb shows "Cermont" instead of "Casos de Servicio" |
| B-08 | MED | All protected pages | Generic `<title>`: "Cermont S.A.S. \| Plataforma Operativa" for every page |
| B-09 | MED | `/payments`, `/costs`, `/billing` | API 400/401 errors not translated to user-friendly UI messages |
| B-10 | MED | `/login` | "Iniciar Sesión" button uses blue instead of Cermont green |
| B-11 | MED | `/proposals`, `/purchase-orders` | CTA buttons use `bg-blue-500` instead of green brand |
| B-12 | LOW | `/payment`, `/billing/*`, `/costs` | All show "Sin datos" without contextual guidance on what to do |
| B-13 | LOW | `/assets`, `/inventory`, `/fleet`, `/resources` | Empty states lack actionable CTAs |
| B-14 | LOW | `/admin/users` | User table has no pagination for 50+ user scalability |
| B-15 | LOW | `/costs` | "Motor de costos" shows 4 KPIs as "Sin datos registrados" without sematic empty state |

---

## Work Objectives

### Core Objective
Ship a stable, production-quality release by fixing all verified bugs, standardizing UI patterns, contextualizing KPIs, and adding proper error recovery across all modules.

### Concrete Deliverables
- Payments module: working dashboard + aging API endpoints
- Evidence module: sub-500ms session check
- Assets: empty state with CTA
- Templates: visible subtitle
- Admin settings: correct tildes in all labels
- All pages: page-specific `<title>` metadata
- All protected pages: error boundaries for API failures
- Auth: green-branded CTA buttons
- KPI modules: contextualized domain-specific metrics
- Cermont AI: configurable service with graceful fallback
- All empty states: actionable guidance text + CTAs
- User table: paginated

### Must Have
- [ ] `npm run typecheck` passes for all workspaces
- [ ] `npm run lint` passes for all workspaces
- [ ] `npm run build` passes with 5/5 successful
- [ ] `npx react-doctor@latest` scores ≥ 90/100 with zero bugs

### Must NOT Have (Guardrails)
- No new dependencies beyond the approved stack (Express 5, Mongoose, Next.js 16, React 19, Zod 4, etc.)
- No modifications to `package.json` or `package-lock.json` without explicit per-task approval
- No `any`, `as any`, `@ts-ignore`, `@ts-expect-error`, `console.log`, or `debugger`
- No removal of existing functionality without replacement
- No backend architectural changes (no NestJS, no Prisma, no PostgreSQL)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: Tests-after (unit tests for new API endpoints/services)
- **Framework**: Vitest + Playwright

### QA Policy
Every module change verified via Playwright browser testing: navigate → interact → assert DOM → capture screenshot.

---

## Execution Strategy

```
Wave 1 (Backend API fixes + i18n — MAX PARALLEL, 8 tasks):
├── Task 1: Fix payments dashboard + aging API endpoints [quick]
├── Task 2: Fix evidence session re-validation [quick]
├── Task 3: Fix admin/settings i18n tildes [quick]
├── Task 4: Add breadcrumb labels to dashboard pages [quick]
├── Task 5: Update all page metadata titles [quick]
├── Task 6: Standardize CTA button colors to brand green [quick]
├── Task 7: Add KV cache for session tokens [quick]
└── Task 8: Remove auth check duplication in evidence page [quick]

Wave 2 (Frontend error handling + empty states — MAX PARALLEL, 7 tasks):
├── Task 9: Add ErrorBoundary component [quick]
├── Task 10: Wrap all dashboard pages with ErrorBoundary [unspecified-high]
├── Task 11: Add empty state CTAs to assets, inventory, fleet, resources [visual-engineering]
├── Task 12: Fix templates page subtitle truncation [visual-engineering]
├── Task 13: Add page-specific loading skeletons [visual-engineering]
├── Task 14: Standardize empty state patterns across payments, billing, costs [visual-engineering]
└── Task 15: Add user table pagination [unspecified-high]

Wave 3 (KPI contextualization + Cermont AI — 6 tasks):
├── Task 16: Contextualize dashboard KPIs to Cermont domain [deep]
├── Task 17: Add KPI empty states with actionable guidance [visual-engineering]
├── Task 18: Fix cost KPI empty state semantics [quick]
├── Task 19: Add payment aging chart [visual-engineering]
├── Task 20: Implement Cermont AI service configuration [deep]
└── Task 21: Add Cermont AI fallback state with setup guide [quick]

Wave 4 (Innovation + Integration — 5 tasks):
├── Task 22: Add KPI trend indicators [visual-engineering]
├── Task 23: Add module quick-access from 14-step flow [visual-engineering]
├── Task 24: Add "last updated" timestamps to all KPI widgets [quick]
├── Task 25: Add dashboard pulso operativo hero section [visual-engineering]
└── Task 26: Final Gate Sweep [quick]
```

---

## TODOs

- [ ] 1. Fix payments dashboard + aging API endpoints

  **What to do**:
  - Read `backend/src/modules/payments/payments.service.ts` — find the `getDashboard()` and `getAging()` methods
  - These currently return 400 errors (likely due to missing data validation or DB query issues)
  - Fix the service methods to handle empty states gracefully (return `{ total: 0, pending: 0, completed: 0, overdue: 0 }` instead of throwing)
  - Add proper try/catch with AppError typed handling
  - Read the frontend `frontend/src/app/(dashboard)/payments/page.tsx` to ensure it handles empty API responses
  - Add error recovery: if API returns empty data, show `$0` with contextual message "Sin pagos registrados"
  - Read `frontend/src/modules/payments/hooks/` and add `staleTime: 30000` and `retry: 2`

  **Must NOT do**:
  - Do not change the payments Mongoose schema
  - Do not add new API endpoints

  **Acceptance Criteria**:
  - `curl http://localhost:4000/api/payments/dashboard` returns 200 with `{ total: 0, pending: 0, completed: 0 }`
  - `/payments` page no longer shows persistent skeleton loaders
  - Console has 0 errors when navigating to `/payments`

  **QA Scenarios**:
  ```
  Scenario: Payments page loads without API errors
    Tool: Playwright
    Preconditions: Logged in as gerente
    Steps:
      1. Navigate to http://localhost:3000/payments
      2. Wait for page to fully load (networkidle)
      3. Check console for errors
    Expected Result: 0 console errors, KPI values visible (not skeleton)
    Evidence: .sisyphus/evidence/task-1-payments.png

  Scenario: Payments page shows empty state gracefully
    Tool: Bash (curl)
    Preconditions: Backend running, no payment records in DB
    Steps:
      1. curl http://localhost:4000/api/payments/dashboard
      2. curl http://localhost:4000/api/payments/aging
    Expected Result: Both return 200 with valid JSON envelope
    Evidence: .sisyphus/evidence/task-1-api-response.txt
  ```

- [ ] 2. Fix evidence page session re-validation delay

  **What to do**:
  - Read `frontend/src/modules/evidences/hooks/` for the evidence page data fetching
  - The "Inicializando sesión..." 3s delay is caused by session token re-validation on every evidence page navigation
  - Add a client-side session cache using Zustand or a module-level `sessionCache` variable
  - Read the auth hook at `frontend/src/modules/auth/hooks/useAuth.ts` — check if it validates token on every mount
  - Add `skipSessionValidation` flag for pages that already validated session at the layout level
  - Add a minimal loading state that shows a skeleton within 200ms instead of the full "Inicializando sesión..." overlay

  **Must NOT do**:
  - Do not weaken auth security — only skip redundant validation
  - Do not store tokens in localStorage

  **Acceptance Criteria**:
  - Evidence page loads content within 1s (measured via Playwright timing)

  **QA Scenarios**:
  ```
  Scenario: Evidence page loads quickly
    Tool: Playwright
    Preconditions: Logged in, at least 1 evidence exists
    Steps:
      1. Navigate to http://localhost:3000/evidences
      2. Measure time until page content is visible
    Expected Result: Content visible within 1.5s, no "Inicializando" overlay
    Evidence: .sisyphus/evidence/task-2-evidence-load.png
  ```

- [ ] 3. Fix admin/settings i18n tildes

  **What to do**:
  - Read `frontend/src/app/(dashboard)/admin/settings/page.tsx`
  - Find all `<label>`, `<p>`, `<h1-3>`, `<span>` text nodes with missing tildes
  - Fix all occurrences:
    - "Sincronizacion" → "Sincronización"
    - "automaticos" → "automáticos"
    - "codigos" → "códigos"
    - "Facturacion electronica" → "Facturación electrónica"
    - Also check for any other missing accents in the file
  - Check if there's an i18n constants file at `frontend/src/app/(dashboard)/admin/settings/settings.constants.ts` or similar — fix there instead if found

  **Must NOT do**:
  - Do not translate to English — these are intentional Spanish labels for the Colombian market
  - Do not change any CSS class names or structure

  **Acceptance Criteria**:
  - All Spanish labels in admin/settings have correct tildes

  **QA Scenarios**:
  ```
  Scenario: All settings labels have correct tildes
    Tool: Playwright
    Preconditions: Logged in as gerente
    Steps:
      1. Navigate to http://localhost:3000/admin/settings
      2. Take screenshot of full page
      3. Check for "Sincronizacion", "automaticos", "codigos" (all should be accented)
    Expected Result: All labels use correct Spanish accents
    Evidence: .sisyphus/evidence/task-3-settings-tildes.png
  ```

- [ ] 4. Add breadcrumb labels to dashboard pages

  **What to do**:
  - Read the breadcrumb component at `frontend/src/core/ui/Breadcrumb.tsx` or wherever it's defined
  - Read `frontend/src/app/(dashboard)/service-cases/page.tsx` — the breadcrumb currently shows "Cermont" instead of "Casos de Servicio"
  - Create a centralized breadcrumb mapping file at `frontend/src/lib/navigation/breadcrumbs.ts` with labels for all routes:
    ```ts
    export const BREADCRUMB_LABELS: Record<string, string> = {
      "/dashboard": "Panel de Control",
      "/service-cases": "Casos de Servicio",
      "/work-requests": "Solicitudes de Trabajo",
      "/site-visits": "Visitas Técnicas",
      "/proposals": "Propuestas",
      "/purchase-orders": "Órdenes de Compra",
      "/orders": "Órdenes de Trabajo",
      "/planning": "Planeación",
      "/execution": "Ejecución",
      "/evidences": "Evidencias",
      "/reports": "Informes Técnicos",
      "/delivery-records": "Actas de Entrega",
      "/billing": "Facturación",
      "/payments": "Pagos",
      "/costs": "Costos",
      "/documents": "Documentos",
      "/templates": "Plantillas",
      "/resources": "Recursos / Kits",
      "/inventory": "Inventario",
      "/fleet": "Flota",
      "/assets": "Activos",
      "/admin/users": "Usuarios",
      "/admin/settings": "Configuración",
      "/admin/audit": "Auditoría",
      "/admin/backups": "Respaldos",
      "/admin/personnel": "Personal",
    };
    ```
  - Wire this mapping into the breadcrumb component

  **Acceptance Criteria**:
  - `/service-cases` shows "Casos de Servicio" in the breadcrumb (not "Cermont")
  - All dashboard routes show correct breadcrumb labels

  **QA Scenarios**:
  ```
  Scenario: Breadcrumb shows correct page name
    Tool: Playwright
    Preconditions: Logged in as gerente
    Steps:
      1. Navigate to http://localhost:3000/service-cases
      2. Check the breadcrumb text in the header
    Expected Result: Breadcrumb contains "Casos de Servicio"
    Evidence: .sisyphus/evidence/task-4-breadcrumb.png
  ```

- [ ] 5. Update all page metadata titles

  **What to do**:
  - Read each dashboard page's `page.tsx` for its `metadata` export
  - Many pages either have no metadata or just `title: "Cermont S.A.S. | Plataforma Operativa"` (the default from layout)
  - Add explicit page-specific `metadata.title` to every route:
    ```ts
    export const metadata: Metadata = { title: "Dashboard" }; // -> "Dashboard | Cermont S.A.S."
    export const metadata: Metadata = { title: "Service Cases" };
    // etc.
    ```
  - Check the root layout at `frontend/src/app/layout.tsx` for the default `title` template
  - If the layout uses `title.template`, each page only needs `title: "Page Name"` (the template appends the suffix)
  - If there's no template, add one: `title: { template: "%s | Cermont S.A.S.", default: "Cermont S.A.S. | Plataforma Operativa" }`

  **Must NOT do**:
  - Do not use Next.js 15 `<title>` metadata API when 16's async metadata is available — use `export const metadata: Metadata = { title: "..." }`
  - Do not create duplicate title rendering

  **Acceptance Criteria**:
  - `<title>` for each page shows page-specific text followed by " | Cermont S.A.S."

  **QA Scenarios**:
  ```
  Scenario: Each page has unique title
    Tool: Playwright
    Preconditions: Logged in
    Steps:
      1. Navigate to /payments
      2. Check document.title
      3. Navigate to /evidences
      4. Check document.title
    Expected Result: Titles differ per page (e.g., "Pagos | Cermont S.A.S.", "Evidencias | Cermont S.A.S.")
    Evidence: .sisyphus/evidence/task-5-titles.txt
  ```

- [ ] 6. Standardize CTA button colors to brand green

  **What to do**:
  - Read `frontend/src/core/ui/Button.tsx` or the main Button component
  - Find the `variant="primary"` styles — change from `bg-blue-500` to `bg-green-600 hover:bg-green-700`
  - Read `frontend/src/app/(auth)/login/components/LoginSubmitButton.tsx` — it should already be green (verify)
  - Read `frontend/src/app/(dashboard)/proposals/page.tsx` — find "Nueva Propuesta" button and change to green
  - Read `frontend/src/app/(dashboard)/purchase-orders/page.tsx` — find "Nueva PO" button and change to green
  - Check all `<Button variant="primary">` or `bg-blue-*` CTA buttons across the app
  - Read the DESIGN.md or CERMONT_UIUX_GUIDE.md for the canonical brand color token
  - Apply the brand color consistently using CSS variable `var(--color-cermont-green)` or the Tailwind class

  **Acceptance Criteria**:
  - All primary CTA buttons use Cermont green (`#4CAF50` / `green-600`) instead of blue
  - No `<Button variant="primary">` uses blue

  **QA Scenarios**:
  ```
  Scenario: Proposal CTA uses brand green
    Tool: Playwright
    Preconditions: Logged in
    Steps:
      1. Navigate to /proposals
      2. Take screenshot of the "Nueva Propuesta" button
    Expected Result: Button background is green, not blue
    Evidence: .sisyphus/evidence/task-6-green-cta.png
  ```

- [ ] 7. Add KV cache for session tokens

  **What to do**:
  - Read `backend/src/middlewares/authenticate.ts` — find where JWT is validated on every request
  - Add an in-memory Map cache for token validation results:
    ```ts
    const tokenCache = new Map<string, { user: IUser; expiresAt: number }>();
    const CACHE_TTL = 30_000; // 30 seconds
    ```
  - On each authenticate call, check cache first before JWT verify
  - Cache invalidation: purge entries older than CACHE_TTL
  - The Map must have a max size (500 entries) and periodic cleanup

  **Must NOT do**:
  - Do not use Redis or external cache (keep it in-memory)
  - Do not reduce security — still validate token on first access after cache expiry

  **Acceptance Criteria**:
  - Evidence page loads in < 1.5s (was ~3s)
  - Auth middleware still validates tokens correctly

  **QA Scenarios**:
  ```
  Scenario: Session token cached reduces load time
    Tool: Bash (curl)
    Preconditions: Backend running
    Steps:
      1. Login via POST /api/auth/login → capture token
      2. Time GET /api/evidences with Authorization header (first call)
      3. Time GET /api/evidences with same token (second call)
    Expected Result: Second call is faster (cached validation)
    Evidence: .sisyphus/evidence/task-7-cache-timing.txt
  ```

- [ ] 8. Remove auth check duplication in evidence page

  **What to do**:
  - Read `frontend/src/modules/auth/hooks/useAuth.ts` — the hook likely checks session on every mount
  - Add a `useSessionCache()` that stores session validation result in a module-level variable
  - On page mount, if session was validated within the last 30s, skip re-validation
  - Read `frontend/src/app/(dashboard)/evidences/page.tsx` — the "Inicializando sesión..." overlay logic
  - Replace the full-page overlay with a minimal skeleton that appears immediately
  - The skeleton should show page structure (header area, filter bar, card grid) with pulse animation

  **Acceptance Criteria**:
  - Evidence page shows content outline immediately (no "Inicializando sesión..." full overlay)

  **QA Scenarios**:
  ```
  Scenario: Evidence page shows skeleton not overlay
    Tool: Playwright (with throttled network)
    Preconditions: Logged in
    Steps:
      1. Enable network throttling (Slow 3G)
      2. Navigate to /evidences
      3. Take screenshot during initial load
    Expected Result: Page shows structured skeleton, not blank "Inicializando sesión..."
    Evidence: .sisyphus/evidence/task-8-evidence-skeleton.png
  ```

- [ ] 9. Add ErrorBoundary component

  **What to do**:
  - Create `frontend/src/components/common/ErrorBoundary.tsx`
  - A React Error Boundary class component that catches render errors
  - Should show a friendly error card with:
    - Warning icon
    - "Error inesperado" title
    - Error description
    - "Reintentar" button
    - "Volver al inicio" link
  - Use the design tokens from DESIGN.md (`--color-danger`, `--surface-card`, `--radius-lg`)
  - Also create `frontend/src/components/common/ApiErrorBoundary.tsx` for API-specific errors:
    - Shows error icon
    - Extracts error message from the API envelope
    - Retry button that calls `refetch()`
    - "Contacte a soporte" link with error code

  **Acceptance Criteria**:
  - ErrorBoundary renders when a child component throws
  - ApiErrorBoundary shows API error message and retry button

  **QA Scenarios**:
  ```
  Scenario: ErrorBoundary catches render error
    Tool: Playwright
    Preconditions: Logged in
    Steps:
      1. Navigate to a page wrapped with ErrorBoundary
      2. Force a render error (mock or inject)
    Expected Result: ErrorBoundary shows error card with retry button
    Evidence: .sisyphus/evidence/task-9-error-boundary.png
  ```

- [ ] 10. Wrap all dashboard pages with ErrorBoundary

  **What to do**:
  - Read the dashboard layout at `frontend/src/app/(dashboard)/layout.tsx`
  - Wrap the main content area `<main>` with the new ErrorBoundary component
  - For data-fetching pages (evidences, payments, costs, billing), wrap API content sections in both ErrorBoundary AND ApiErrorBoundary for granular recovery
  - Each page should have:
    - Top-level ErrorBoundary (catches render crashes)
    - Per-section ApiErrorBoundary (catches API failures for that section without crashing the whole page)
    - Individual KPI widgets wrapped in ApiErrorBoundary (so one failed KPI doesn't break the whole dashboard)

  **Acceptance Criteria**:
  - If payments API fails, only the payments section shows an error, not the entire page
  - ErrorBoundary wraps all pages (check via react-doctor or manual verification)

  **QA Scenarios**:
  ```
  Scenario: API failure doesn't crash entire payments page
    Tool: Playwright
    Preconditions: Logged in
    Steps:
      1. Navigate to /payments
      2. Intercept payments API → return 500
      3. Check that page sections other than payments still render
    Expected Result: Only payments section shows error; other sections work
    Evidence: .sisyphus/evidence/task-10-graceful-error.png
  ```

- [ ] 11. Add empty state CTAs to assets, inventory, fleet, resources

  **What to do**:
  - Read `frontend/src/app/(dashboard)/assets/page.tsx` — the empty state currently has no button
  - Add a "+ Nuevo activo" button that links to `/assets/new`
  - Read `frontend/src/app/(dashboard)/inventory/page.tsx` — add "+ Nuevo item" CTA
  - Read `frontend/src/app/(dashboard)/fleet/page.tsx` — add "+ Nuevo vehículo" CTA
  - Read `frontend/src/app/(dashboard)/resources/page.tsx` — add "+ Nuevo kit" CTA
  - Each empty state should follow: icon (subtle), title, description, CTA button (brand green)
  - Use the existing `EmptyStateCard` component if it exists, or create a reusable pattern

  **Must NOT do**:
  - Do not redirect to unrelated pages — each CTA must go to the correct "new" form route

  **Acceptance Criteria**:
  - Each empty state has a visible, functional CTA button

  **QA Scenarios**:
  ```
  Scenario: Assets empty state has CTA
    Tool: Playwright
    Preconditions: Logged in, no assets exist
    Steps:
      1. Navigate to /assets
      2. Look for "+ Nuevo activo" button
      3. Click it
    Expected Result: Navigates to /assets/new
    Evidence: .sisyphus/evidence/task-11-assets-cta.png
  ```

- [ ] 12. Fix templates page subtitle truncation

  **What to do**:
  - Read `frontend/src/app/(dashboard)/templates/page.tsx` — check the subtitle below `<h1>Plantillas documentales</h1>`
  - The subtitle text is likely in a `<p>` with a fixed height or overflow:hidden CSS
  - Check for: `line-clamp-*`, `max-h-*`, `overflow-hidden`, or `truncate` class on the subtitle element
  - Remove the truncation class or increase the max-height/line-clamp value
  - If the subtitle is in a container with fixed dimensions, change to `min-h` or remove height entirely

  **Acceptance Criteria**:
  - Full subtitle text is visible (no truncation)
  - Text wraps naturally across multiple lines

  **QA Scenarios**:
  ```
  Scenario: Templates subtitle fully visible
    Tool: Playwright
    Preconditions: Logged in
    Steps:
      1. Navigate to /templates
      2. Take screenshot of the page header area
    Expected Result: Subtitle text below "Plantillas documentales" is fully readable
    Evidence: .sisyphus/evidence/task-12-templates-subtitle.png
  ```

- [ ] 13. Add page-specific loading skeletons

  **What to do**:
  - Create `frontend/src/components/common/PageSkeleton.tsx` with variants:
    - `PageSkeleton variant="list"` — header + filter bar + 5 row skeletons
    - `PageSkeleton variant="detail"` — header + back button + 2 column skeletons
    - `PageSkeleton variant="dashboard"` — header + 4 KPI card skeletons + 2 chart skeletons + activity list
    - `PageSkeleton variant="empty"` — centered skeleton with icon placeholder
  - Apply to all dashboard pages by checking for existing `loading.tsx` files in route groups
  - Create `frontend/src/app/(dashboard)/loading.tsx` — generic dashboard loading state
  - For pages without their own `loading.tsx`, the dashboard-level loading will be used automatically by Next.js

  **Acceptance Criteria**:
  - Navigating between dashboard pages shows structured skeleton matching each page layout
  - No blank white flash during navigation

  **QA Scenarios**:
  ```
  Scenario: Dashboard shows structured skeleton
    Tool: Playwright (slow network)
    Preconditions: Logged in
    Steps:
      1. Throttle network to Slow 3G
      2. Navigate to /dashboard
      3. Observe initial render
    Expected Result: Structured skeleton grid appears, not blank page
    Evidence: .sisyphus/evidence/task-13-skeleton.png
  ```

- [ ] 14. Standardize empty state patterns across payments, billing, costs

  **What to do**:
  - Read `frontend/src/app/(dashboard)/payments/page.tsx` — check KPI empty values
  - Read `frontend/src/app/(dashboard)/billing/page.tsx` — check KPI empty state
  - Read `frontend/src/app/(dashboard)/costs/[trabajoId]/page.tsx` — check "Motor de costos" empty state
  - Create a reusable pattern:
    - Each KPI card with no data should show `$0` or `0` with a contextual subtitle
    - Add a subtle badge: "Sin órdenes activas" or "Sin pagos registrados"
    - The subtitle should explain WHY (no data) not just show empty: "No hay solicitudes de pago registradas. Complete una orden de trabajo para generar registros financieros."
  - Create `frontend/src/components/common/EmptyKpiState.tsx`:
    ```tsx
    interface EmptyKpiStateProps {
      icon: React.ElementType;
      title: string;
      description: string;
      actionLabel?: string;
      actionHref?: string;
    }
    ```

  **Acceptance Criteria**:
  - All empty KPIs show meaningful contextual guidance

  **QA Scenarios**:
  ```
  Scenario: Payments empty state shows guidance
    Tool: Playwright
    Preconditions: Logged in, no payments
    Steps:
      1. Navigate to /payments
      2. Check KPI cards
    Expected Result: Each KPI shows "0" with contextual subtitle explaining why
    Evidence: .sisyphus/evidence/task-14-empty-kpis.png
  ```

- [ ] 15. Add user table pagination

  **What to do**:
  - Read `frontend/src/app/(dashboard)/admin/users/page.tsx` — the users table
  - The table uses `useQuery` to fetch users from `/api/backend/users`
  - Check if pagination is implemented on the backend (`backend/src/modules/user/user.routes.ts`)
  - If backend supports pagination (query params: `page`, `limit`), add pagination UI:
    - Previous/Next buttons
    - Page indicator: "Página X de Y"
    - Page size selector: 10, 25, 50, 100
  - If backend doesn't support pagination, add it:
    - Update the `user.service.ts` `getAll()` method to accept `page` and `limit`
    - Return `{ data: IUser[], pagination: { page, limit, total, totalPages } }`
    - Update the route to pass query params
  - For the frontend:
    - Add `usePagination` hook or use existing pattern
    - Show total user count: "16 usuarios registrados"
    - Add empty state if no users match filter

  **Must NOT do**:
  - Do not add infinite scroll (pagination is more enterprise-appropriate for user management)

  **Acceptance Criteria**:
  - User table shows pagination controls at bottom
  - Changing page fetches new data

  **QA Scenarios**:
  ```
  Scenario: User table paginates
    Tool: Playwright
    Preconditions: Logged in, 20+ users exist
    Steps:
      1. Navigate to /admin/users
      2. Check for pagination controls
      3. Click "Siguiente"
    Expected Result: Table shows next page of users, pagination updates
    Evidence: .sisyphus/evidence/task-15-pagination.png
  ```

- [ ] 16. Contextualize dashboard KPIs to Cermont domain

  **What to do**:
  - Read `frontend/src/modules/dashboard/ui/DashboardHero.tsx` and `frontend/src/modules/dashboard/hooks/useDashboardKpis.ts`
  - The current KPIs show generic labels ("Órdenes activas", "Mantenimientos abiertos", "Completados del mes")
  - Replace/modify with Cermont domain-specific KPIs:
    - "Líneas de vida en proceso de instalación" (instead of "Órdenes activas")
    - "% de certificaciones emitidas dentro del SLA" (instead of "Tasa de cierre en tiempo")
    - "Técnicos certificados asignados vs disponibles" (instead of "Recursos en uso")
    - "Valor facturado en certificaciones vs meta mensual" (instead of "Ingresos del mes")
  - Map backend data to the new labels via the hook — transform the raw API response using a mapper
  - Keep the same API endpoint: transform the response data, don't change the backend contract
  - Read `frontend/src/modules/dashboard/model/dashboard.types.ts` for existing type definitions
  - Update the type definitions to support the new KPI names

  **Acceptance Criteria**:
  - Dashboard shows domain-specific KPI labels that match Cermont's business (life lines, CCTV, structural safety)
  - No generic/placeholder-sounding KPI names remain

  **QA Scenarios**:
  ```
  Scenario: Dashboard shows Cermont-specific KPIs
    Tool: Playwright
    Preconditions: Logged in as gerente
    Steps:
      1. Navigate to /dashboard
      2. Take screenshot of the hero/KPI section
    Expected Result: KPIs show domain-specific labels like "Líneas de vida", "Certificaciones", "Técnicos certificados"
    Evidence: .sisyphus/evidence/task-16-contextual-kpis.png
  ```

- [ ] 17. Add KPI empty states with actionable guidance

  **What to do**:
  - For each KPI that shows "0" or "Sin datos", add a contextual subtitle:
    - If there are no active orders: "Sin órdenes activas. Cree una solicitud de trabajo para comenzar."
    - If there are no service cases: "Sin casos de servicio registrados."
    - If there are no payments: "Sin pagos registrados. Complete una orden para generar facturación."
  - Read the KPI card component (likely `frontend/src/components/ui/KPICard.tsx` or `frontend/src/modules/dashboard/ui/`)
  - Modify the KPI card to support an optional `emptyStateMessage` prop
  - If the value is 0 or undefined AND there's no loading state, show the empty state message

  **Acceptance Criteria**:
  - Every KPI with zero value shows explanatory contextual text

  **QA Scenarios**:
  ```
  Scenario: Empty KPI shows guidance text
    Tool: Playwright
    Preconditions: Logged in, no data
    Steps:
      1. Navigate to /costs
      2. Check KPI cards with 0 value
    Expected Result: Each 0-value KPI shows contextual explanation below the number
    Evidence: .sisyphus/evidence/task-17-kpi-guidance.png
  ```

- [ ] 18. Fix cost KPI empty state semantics

  **What to do**:
  - Read `frontend/src/app/(dashboard)/costs/[trabajoId]/page.tsx`
  - The "Motor de costos" section shows "Sin datos registrados" in 4 KPI cards
  - Replace with proper empty state:
    - Show `$0` with badge "Sin órdenes activas"
    - Add guidance: "Complete una orden de trabajo para ver costos estimados y reales."
    - Add CTA: "Ir a Órdenes de Trabajo"
  - Read the costs module at `frontend/src/modules/costs/ui/` to find the KPI component

  **Acceptance Criteria**:
  - Cost KPIs show $0 with contextual badge and guidance CTA

  **QA Scenarios**:
  ```
  Scenario: Cost module shows contextual empty state
    Tool: Playwright
    Preconditions: Logged in, no cost data
    Steps:
      1. Navigate to /costs
      2. Check "Motor de costos" section
    Expected Result: Shows "$0" with badge "Sin órdenes activas" and CTA to orders
    Evidence: .sisyphus/evidence/task-18-cost-empty.png
  ```

- [ ] 19. Add payment aging chart

  **What to do**:
  - Read `frontend/src/app/(dashboard)/payments/page.tsx` — find the section that displays aging data
  - If there's no aging visualization, add a simple bar chart or table showing:
    - Current (0-30 days)
    - Overdue 30-60 days
    - Overdue 60-90 days
    - Overdue 90+ days
  - Use Recharts (already in the project) for consistency with other charts
  - The chart container should use the existing `ChartCard` pattern if it exists
  - Add loading/empty/error states for the chart

  **Acceptance Criteria**:
  - Payment aging is visualized in a bar chart or table

  **QA Scenarios**:
  ```
  Scenario: Payment aging chart renders
    Tool: Playwright
    Preconditions: Logged in, aging data available
    Steps:
      1. Navigate to /payments
      2. Scroll to aging section
    Expected Result: Bar chart or table showing aging buckets
    Evidence: .sisyphus/evidence/task-19-aging-chart.png
  ```

- [ ] 20. Implement Cermont AI service configuration

  **What to do**:
  - Read `backend/src/modules/ai/` — check the AI module structure
  - The AI service is "No disponible" because it lacks configuration
  - Add a configurable AI provider integration:
    - Read `backend/src/config/env.ts` for existing env config
    - Add `AI_API_KEY` and `AI_ENDPOINT` to the environment validation schema
    - Create `backend/src/services/ai/index.ts` with:
      - Abstract `AiProvider` interface
      - `OpenAiProvider` implementation
      - Fallback to mock mode if no API key configured
    - Update the AI chat endpoint to use the configured provider
  - Read `frontend/src/modules/core/ui/ai/` for the frontend Cermont AI drawer
  - For the frontend:
    - If AI is not configured, show a setup prompt instead of "No disponible":
      - "El asistente Cermont AI no está configurado. Contacte a su administrador para habilitar esta función."
      - (No settings UI — this is an admin backend configuration)
    - If AI is connected but returns errors, show friendly error with retry

  **Must NOT do**:
  - Do not hardcode any API keys or endpoints
  - Do not require a specific AI provider (make it configurable via env vars)

  **Acceptance Criteria**:
  - AI panel no longer shows "No disponible" — either connected or shows graceful setup message
  - Backend env validates AI config if provided

  **QA Scenarios**:
  ```
  Scenario: Cermont AI shows setup message when not configured
    Tool: Playwright
    Preconditions: Logged in, AI_API_KEY not set
    Steps:
      1. Open Cermont AI drawer
    Expected Result: Shows setup guidance message, not "No disponible"
    Evidence: .sisyphus/evidence/task-20-ai-setup.png
  ```

- [ ] 21. Add Cermont AI fallback state with setup guide

  **What to do**:
  - Read `frontend/src/modules/core/ui/ai/CermontAIDrawer.tsx` — the component already exists and is split
  - Add a "setup required" state to the drawer header:
    - When `isEnabled` is false (no API key configured), show:
      - Icon: Wrench or Settings
      - Title: "Asistente no configurado"
      - Description: "El administrador debe configurar una clave de API en las variables de entorno del servidor."
      - No chat input visible
  - Add a toggle button to the admin settings page to enable/disable AI (this sets a feature flag, not the API key)
  - The drawer should still be openable and closable, just not functional

  **Acceptance Criteria**:
  - Cermont AI drawer shows informative disabled state instead of broken state

  **QA Scenarios**:
  ```
  Scenario: AI drawer shows disabled state gracefully
    Tool: Playwright
    Preconditions: Logged in, AI not configured
    Steps:
      1. Open Cermont AI drawer
      2. Take screenshot
    Expected Result: Shows setup guidance, no chat input
    Evidence: .sisyphus/evidence/task-21-ai-disabled.png
  ```

- [ ] 22. Add KPI trend indicators

  **What to do**:
  - Read the KPI card component (`frontend/src/modules/dashboard/ui/KPICard.tsx` or equivalent)
  - Add a trend indicator to each KPI:
    - Green up arrow + percentage: "↑ 12% vs mes anterior"
    - Red down arrow: "↓ 5% vs mes anterior"
    - Gray dash: "— sin cambio significativo"
  - The trend data should come from the existing API (add `trend` field if not present)
  - On the backend side (`backend/src/modules/dashboard/`), compute trends by comparing current month vs previous month
  - If no trend data available (first month), show "— Primer mes de operación"

  **Acceptance Criteria**:
  - Each KPI shows a trend indicator (up/down/flat) with percentage change

  **QA Scenarios**:
  ```
  Scenario: KPIs show trend indicators
    Tool: Playwright
    Preconditions: Logged in, dashboard data available
    Steps:
      1. Navigate to /dashboard
      2. Check KPI cards
    Expected Result: Each KPI shows trend arrow + percentage below the main value
    Evidence: .sisyphus/evidence/task-22-trends.png
  ```

- [ ] 23. Add module quick-access from 14-step flow

  **What to do**:
  - Read `frontend/src/modules/cockpit/ui/FourteenStepProgressBar.tsx` — the 14-step visual flow
  - Each step currently shows name + status but is not clickable (no link to the module)
  - Add navigation links to each step:
    - Step 1 "Solicitud" → `/work-requests`
    - Step 2 "Visita" → `/site-visits`
    - Step 3 "Propuesta" → `/proposals`
    - Step 4 "PO" → `/purchase-orders`
    - Step 5 "Planeación" → `/planning`
    - Step 6 "Ejecución" → `/execution`
    - Step 7 "Evidencias" → `/evidences`
    - Step 8 "Informe" → `/reports`
    - Step 9 "Acta" → `/delivery-records`
    - Step 10 "Firma" → `/delivery-records`
    - Step 11 "SES" → `/billing/ses`
    - Step 12 "Factura" → `/billing/invoices`
    - Step 13 "Aprobación" → `/billing/invoices`
    - Step 14 "Pago" → `/payments`
  - If the step is completed, the link should go directly to the relevant record
  - If the step is pending, the link should go to the module's create/new page
  - Use `next/link` for client-side navigation

  **Acceptance Criteria**:
  - Each step in the flow widget is clickable and navigates to the correct module

  **QA Scenarios**:
  ```
  Scenario: Step 1 links to work requests
    Tool: Playwright
    Preconditions: Logged in
    Steps:
      1. Navigate to /dashboard or /service-cases
      2. Click on "Solicitud" step in the 14-step flow
    Expected Result: Navigates to /work-requests
    Evidence: .sisyphus/evidence/task-23-flow-link.png
  ```

- [ ] 24. Add "last updated" timestamps to all KPI widgets

  **What to do**:
  - Read the KPI grid/hero component (likely `frontend/src/modules/dashboard/ui/DashboardHero.tsx`)
  - Add a subtile: "Última actualización: [timestamp]" below each KPI section
  - The timestamp should come from the API response (add `generatedAt` field if not present)
  - Use relative time: "Actualizado hace 2 minutos" (for freshness)
  - Update the `useFormattedDateTime` hook (already created at `frontend/src/lib/format/useFormattedDate.ts`) with a relative time formatter or use `date-fns`'s `formatDistanceToNow`
  - Apply to dashboard, payments, billing, costs, service-cases

  **Acceptance Criteria**:
  - Each KPI section shows a "last updated" timestamp
  - Timestamp uses relative format (e.g., "hace 2 minutos")

  **QA Scenarios**:
  ```
  Scenario: Dashboard shows last updated timestamp
    Tool: Playwright
    Preconditions: Logged in, dashboard data loaded
    Steps:
      1. Navigate to /dashboard
      2. Look for "Última actualización" text
    Expected Result: Text like "Última actualización: hace 2 minutos" is visible
    Evidence: .sisyphus/evidence/task-24-timestamp.png
  ```

- [ ] 25. Add dashboard pulso operativo hero section

  **What to do**:
  - Read `frontend/src/modules/dashboard/ui/DashboardHero.tsx` — the existing hero
  - Restructure the hero section following the DESIGN.md specification:
    - Add a "Pulso Operativo de Cermont" title
    - Add a contextual subtitle summarizing current operational state:
      - If all data is zero/empty: "Bienvenido al panel de control. Complete una orden para comenzar."
      - If there are active items: "Resumen operativo del día con KPIs principales."
    - Add a welcome greeting with the user's name and role from `useAuth()`
    - Add a "quick action" button: breadcrumb-style chips for common actions
    - The hero should be visually distinct: larger card, subtle accent border, brand-colored icon accents
  - Read `DESIGN.md` section 11.2 "Hero operativo / resumen ejecutivo" for the full specification

  **Acceptance Criteria**:
  - Dashboard hero shows contextual title, subtitle, user greeting, and quick action chips

  **QA Scenarios**:
  ```
  Scenario: Dashboard hero shows pulso operativo
    Tool: Playwright
    Preconditions: Logged in as gerente
    Steps:
      1. Navigate to /dashboard
      2. Take screenshot of hero section
    Expected Result: Shows "Pulso Operativo", user name, role, and quick actions
    Evidence: .sisyphus/evidence/task-25-hero.png
  ```

- [ ] 26. Final Gate Sweep

  **What to do**:
  - Run full gate sequence from repo root in order:
    1. `npm run typecheck` — expect all workspaces green
    2. `npm run lint` — expect 0 errors across all workspaces
    3. `npm run test` — run relevant tests
    4. `npm run build` — `turbo run build` → expect `5 successful, 5 total`
    5. `npm run verify` — full verify chain (typecheck + lint + test + build + contracts:check)
    6. `npx react-doctor@latest --verbose` → expect score ≥ 90, zero bugs
  - If any gate fails: stop, capture the single failing line, return to the responsible task, patch, re-run only that gate, then re-run from the top

  **Acceptance Criteria**:
  - All gates pass
  - react-doctor score ≥ 90/100 with zero bugs

  **QA Scenarios**:
  ```
  Scenario: All gates pass
    Tool: Bash
    Preconditions: All previous tasks completed
    Steps:
      1. npm run typecheck
      2. npm run lint
      3. npm run build
      4. npx react-doctor@latest --verbose
    Expected Result: All commands exit with 0
    Evidence: .sisyphus/evidence/task-26-gates.txt
  ```

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
- [ ] F2. **Code Quality Review** — `unspecified-high`
- [ ] F3. **Real Manual QA (Playwright)** — `unspecified-high` + `playwright` skill
- [ ] F4. **Scope Fidelity Check** — `deep`

---

## Commit Strategy

- Task 1: `fix(payments): fix dashboard and aging API endpoints`
- Task 2: `fix(evidences): add session cache to reduce loading delay`
- Task 3: `fix(admin): correct missing tildes in settings labels`
- Task 4: `feat(navigation): add centralized breadcrumb labels`
- Task 5: `feat(seo): add page-specific metadata titles`
- Task 6: `fix(ui): standardize CTA button colors to brand green`
- Task 7: `perf(auth): add in-memory token validation cache`
- Task 8: `perf(evidences): replace full overlay with skeleton`
- Task 9: `feat(ui): add ErrorBoundary and ApiErrorBoundary components`
- Task 10: `feat(ui): wrap dashboard pages with error boundaries`
- Task 11: `fix(ui): add empty state CTAs to assets, inventory, fleet, resources`
- Task 12: `fix(templates): fix subtitle text truncation`
- Task 13: `feat(ui): add page-specific loading skeletons`
- Task 14: `feat(ui): standardize empty KPI states with guidance`
- Task 15: `feat(admin): add user table pagination`
- Task 16: `feat(dashboard): contextualize KPIs to Cermont domain`
- Task 17: `feat(ui): add actionable empty state for KPIs`
- Task 18: `fix(costs): improve cost KPI empty state semantics`
- Task 19: `feat(payments): add payment aging visualization`
- Task 20: `feat(ai): implement Cermont AI service configuration`
- Task 21: `feat(ai): add graceful fallback for unconfigured AI`
- Task 22: `feat(dashboard): add KPI trend indicators`
- Task 23: `feat(flow): add module quick-access from 14-step flow`
- Task 24: `feat(dashboard): add last-updated timestamps to KPIs`
- Task 25: `feat(dashboard): add pulso operativo hero section`
- Task 26: `chore: final gate sweep`

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck  # All workspaces pass
npm run lint       # 0 errors across 1560+ files
npm run build      # 5 successful, 5 total
npx react-doctor@latest --verbose  # ≥ 90/100, zero bugs
```

### Final Checklist
- [ ] All bugs B-01 through B-15 fixed
- [ ] All API 400 errors eliminated
- [ ] All empty states show actionable guidance
- [ ] KPI contextualization complete
- [ ] Error boundaries wrap all dashboard pages
- [ ] CTA buttons use consistent brand green
- [ ] All pages have unique metadata titles
- [ ] Cermont AI has graceful fallback
- [ ] Typecheck, lint, build all pass
- [ ] react-doctor ≥ 90/100
