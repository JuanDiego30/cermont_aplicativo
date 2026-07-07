# 02 — Stack Best Practices and Anti-Patterns Audit

## Executive Summary

This document audits 18 technologies in the CERMONT stack against current best practices (2026), identifies anti-patterns present in the real codebase via grep/search evidence, and provides prioritized remediation recommendations.

**Total anti-patterns found in codebase**: 7 confirmed via grep
**Technologies analyzed**: 18
**Overall codebase maturity**: Medium-High — follows modern practices with some legacy artifacts and scattered hygiene issues

---

## Technology Table (Summary)

| # | Technology | Version | Best Practices | Anti-Patterns Found | Codebase Risk |
|---|-----------|---------|---------------|---------------------|---------------|
| 1 | Next.js App Router | ^16.2.6 | ✅ RSC, async components, layouts | ⚠️ Direct fetch in route handlers | LOW |
| 2 | React 19 | ^19.2.6 | ✅ Server Components, Actions API | ⚠️ 30+ useEffect usages | LOW-MEDIUM |
| 3 | TanStack Query | ^5.100.14 | ✅ Centralized hooks, modular queries | ⚠️ Some direct fetch bypassing TQ | LOW |
| 4 | Zod 4.x | ^4.4.3 | ✅ Shared schemas in packages | ⚠️ `null`/`nullable()` in schemas | MEDIUM |
| 5 | React Hook Form | ^7.76.1 | ✅ RHF with Zod resolver | ✅ Clean usage | LOW |
| 6 | Express 5 | 5.2.1 | ✅ Error middleware, security headers | ⚠️ `catch {}` silent swallows | MEDIUM |
| 7 | Mongoose 9.x | ^9.6.2 | ✅ Lean queries, indexed fields | ✅ Proper model isolation | LOW |
| 8 | MongoDB | N/A | ✅ Document model fits domain | ✅ Works well with Mongoose | LOW |
| 9 | Vitest | ✅ Present | ✅ Backend + frontend both configured | ⚠️ `as unknown as` casting in test files | LOW |
| 10 | Supertest | ^7.2.2 | ✅ Present | ✅ Proper usage | LOW |
| 11 | Playwright | ✅ Present | ✅ E2E tests, fixtures | ✅ Clean POM structure | LOW |
| 12 | Biome | 2.4.x+ | ✅ Fast linter + formatter | ⚠️ `useNamingConvention` disabled in overrides | LOW |
| 13 | Turborepo | ^2.9.14 | ✅ Modern pipeline config | ⚠️ Missing `env` declarations for cache safety | LOW |
| 14 | IndexedDB | ✅ Implemented | ✅ Query cache persist | ⚠️ `console.warn` in production code | MEDIUM |
| 15 | Service Worker | ⚠️ Partial | ✅ SW registration component exists | ⚠️ No `sw.js` in public/, no Workbox | HIGH |
| 16 | React Doctor | ⚠️ Not run | ❌ Should be final verification gate | ❌ Not yet evaluated | MEDIUM |
| 17 | OWASP Compliance | ✅ Good | ✅ Helmet, Zod, CORS, rate-limit | ⚠️ 2 past IDOR vulnerabilities (fixed) | LOW |
| 18 | Workbox | ❌ Not used | ❌ Missing PWA build integration | ❌ No Workbox in dependencies | HIGH |

---

## Detailed Technology Analysis

### 1. Next.js 16 App Router (^16.2.6)

**Best Practices 2026**:
- ✅ Use Server Components by default, Client Components only when needed
- ✅ Async component pattern for data fetching in RSC
- ✅ Route Groups for layout organization `(dashboard)`, `(auth)`
- ✅ Loading/Error/NotFound patterns per route segment
- ✅ `use cache` directive for Cache Components (Next.js 16)
- ✅ PPR (Partial Prerendering) for mixed static/dynamic pages
- ✅ App Router over Pages Router (CERMONT uses App Router)
- ✅ Route handlers for API routes with typed responses

**Anti-patterns to avoid**:
- ❌ `"use client"` on every page — only when interactivity is needed
- ❌ Data fetching in Client Components when Server Components would work
- ❌ Using `getServerSideProps` / `getStaticProps` (Pages Router API)
- ❌ Direct DOM manipulation bypassing React

**What to check in CERMONT**:
- ✅ App Router structure with `(dashboard)` and `(auth)` route groups
- ✅ Error boundaries at route segment level
- ⚠️ Some pages may overuse `"use client"` directive
- ⚠️ Direct `fetch()` in Next.js API route handlers at `frontend/src/app/api/`

**Probable files**: `frontend/src/app/**`, `frontend/src/modules/**`
**Risk**: LOW — mostly follows best practices

---

### 2. React 19 (^19.2.6)

**Best Practices 2026**:
- ✅ Server Components as default (RSC)
- ✅ `useActionState` for form actions (replaces `useFormState`)
- ✅ `use()` hook for reading promises in render
- ✅ Actions API with progressive enhancement
- ✅ Concurrent features (Suspense, Transitions)
- ✅ Automatic batching for all state updates

**Anti-patterns to avoid**:
- ❌ `useEffect` for data fetching — use TanStack Query or RSC
- ❌ Props drilling beyond 3 levels — use composition
- ❌ Heavy computation without `useMemo`/`useCallback`
- ❌ Mutating state directly

**What to check in CERMONT**:
- ⚠️ 30+ files use `useEffect()` — mostly for non-data-fetching purposes (themes, offline sync, timers) which is acceptable, but some should be verified
- ✅ No direct DOM manipulation
- ✅ Proper error boundaries at page level

**Probable files**: `frontend/src/modules/**/*.tsx`
**Risk**: LOW-MEDIUM — mostly correct usage

---

### 3. TanStack Query v5 (^5.100.14)

**Best Practices 2026**:
- ✅ Centralized query hooks in `modules/*/queries.ts`
- ✅ Proper query key naming conventions
- ✅ `useMutation` with `onSuccess` invalidation
- ✅ Error handling via `error` state from query
- ✅ `staleTime` and `gcTime` configuration
- ✅ Separation: query hooks vs. UI components

**Anti-patterns to avoid**:
- ❌ No `useEffect` for data fetching — use Queries
- ❌ Direct `fetch` in components — use apiClient
- ❌ Mutations without error handling
- ❌ Query keys without structured naming
- ❌ `enabled: false` without cleanup

**What to check in CERMONT**:
- ✅ 30+ files use `useQuery()`/`useMutation()`
- ⚠️ `frontend/src/modules/reports/queries.ts:281` uses direct `fetch()` instead of `apiClient`
- ⚠️ `frontend/src/lib/offline/sync-manager.ts:135` uses direct `fetch()` instead of `apiClient`

**Probable files**: `frontend/src/modules/*/queries.ts`
**Risk**: LOW — mainly correct TanStack Query usage

---

### 4. Zod 4.x (^4.4.3)

**Best Practices 2026**:
- ✅ Shared schemas in `packages/shared-types/src/schemas/`
- ✅ `safeParse` over `parse` for runtime safety
- ✅ `.pipe()` for multi-step transformations (Zod 4 feature)
- ✅ `.overwrite()` for type-preserving transforms (Zod 4)
- ✅ Schema composition via `z.object()` nesting
- ✅ Type inference via `z.infer`
- ✅ Zod 4 is 6-7x faster than Zod 3 for parsing

**Anti-patterns to avoid**:
- ❌ `z.any()` — defeats type safety
- ❌ `z.unknown()` as escape hatch
- ❌ Throwing on validation in non-critical paths
- ❌ Duplicating schema definitions across packages
- ❌ Not using `.nullable()` when optional fields are truly optional

**What to check in CERMONT**:
- ✅ Shared schemas prevent duplication
- ✅ `.min(1)` used for required strings
- ⚠️ `z.null()` and `z.string().nullable()` used in schemas (`common.schema.ts:33`, `dynamic-form-response.schema.ts:9`, `xlsx-import.schema.ts:64`) — violates project's "no null" policy
- ⚠️ `Nullable<T>` utility type in `packages/shared-types/src/utils/types.ts:223` enables null/undefined patterns

**Probable files**: `packages/shared-types/src/schemas/*`, `packages/shared-types/src/utils/types.ts`
**Risk**: MEDIUM — null usage violates project rules

---

### 5. React Hook Form (^7.76.1)

**Best Practices 2026**:
- ✅ Use with `zodResolver` for schema validation
- ✅ `mode: 'onBlur'` or `onChange` for UX
- ✅ `useForm` with typed form values
- ✅ Avoid `watch` for expensive computations
- ✅ `Controller` for custom UI components
- ✅ `useFieldArray` for dynamic field lists

**Anti-patterns to avoid**:
- ❌ Using RHF without a resolver
- ❌ Manual `setValue` when `register` would work
- ❌ Over-subscribing with `watch` causing re-renders
- ❌ Mixing controlled/uncontrolled components

**What to check in CERMONT**:
- ✅ Used consistently with Zod resolver
- ✅ Typed forms with `z.infer`
- ✅ Proper field registration pattern

**Probable files**: `frontend/src/modules/*/ui/*Form*.tsx`
**Risk**: LOW — consistent pattern

---

### 6. Express 5 (5.2.1)

**Best Practices 2026**:
- ✅ Native async error propagation (Express 5)
- ✅ Centralized error handling middleware
- ✅ Security headers (Helmet)
- ✅ CORS configuration
- ✅ Rate limiting by route
- ✅ Layer separation: routes → controllers → services → models
- ✅ Request validation middleware before controllers

**Anti-patterns to avoid**:
- ❌ `try/catch` in controllers (Express 5 handles async errors)
- ❌ Business logic in routes or controllers
- ❌ Swallowing errors with empty `catch {}`
- ❌ Returning stack traces in production
- ❌ Not handling 404 at the end of middleware chain

**What to check in CERMONT**:
- ⚠️ **5 files** use bare `catch {}` that silently swallows errors:
  - `backend/src/index.ts:269`
  - `backend/src/modules/audit/audit.service.ts:83`
  - `backend/src/common/storage/local-storage.ts:92`
  - `backend/src/modules/evidence/evidence.controller.ts:49`
  - `backend/src/modules/docments/document.service.ts:508`
- ✅ No `try/catch` in controllers (good Express 5 usage)
- ✅ Middleware chain order is correct
- ⚠️ `backend/src/middlewares/uploadMiddleware.ts:380-394` uses `res.status().json()` directly for errors — should delegate to error middleware

**Probable files**: `backend/src/index.ts`, `backend/src/modules/`, `backend/src/middlewares/uploadMiddleware.ts`
**Risk**: MEDIUM — error swallowing is a bug source

---

### 7. Mongoose 9.x (^9.6.2)

**Best Practices 2026**:
- ✅ Schema definition with proper types
- ✅ Indexes for frequently queried fields
- ✅ Lean queries for read-only operations (`.lean()`)
- ✅ Population for references (`.populate()`)
- ✅ Middleware for lifecycle hooks (pre-save, pre-remove)
- ✅ Validation at schema level
- ✅ `Model.init()` for index building to avoid race conditions

**Anti-patterns to avoid**:
- ❌ N+1 queries — batch with `$in` or aggregation
- ❌ Missing indexes on query fields
- ❌ Not using lean for read-only queries
- ❌ Heavy population chains without projection
- ❌ `unique: true` without waiting for index build
- ❌ Schema changes without migration strategy

**What to check in CERMONT**:
- ✅ Models isolated in `backend/src/models/`
- ✅ Lean queries used in services
- ⚠️ Need to verify index coverage on all query paths
- ✅ Proper schema validation

**Probable files**: `backend/src/models/*`, `backend/src/services/*`
**Risk**: LOW — well-structured

---

### 8. MongoDB

**Best Practices 2026**:
- ✅ Document model fits domain entities
- ✅ Aggregation pipeline for complex queries
- ✅ Proper indexing strategy
- ✅ Replica sets for production
- ✅ Connection pooling via Mongoose

**Anti-patterns to avoid**:
- ❌ Over-normalization (RDBMS thinking)
- ❌ Massive unbounded arrays in documents
- ❌ Missing indexes on sort/query fields
- ❌ Unbounded `$lookup` operations

**What to check in CERMONT**:
- ✅ Document model aligns with 14-step business flow
- ✅ Proper MongoDB connection management in `backend/src/config/db.ts`

**Probable files**: `backend/src/config/db.ts`, `backend/src/models/*`
**Risk**: LOW

---

### 9. Vitest

**Best Practices 2026**:
- ✅ Fast Vite-native testing
- ✅ Compatible with Jest API
- ✅ Mock isolation with `vi.mock`, `vi.spyOn`
- ✅ Coverage reporting
- ✅ MSW for API mocking
- ✅ `restoreMocks: true` for clean state

**Anti-patterns to avoid**:
- ❌ Shared mutable state between tests
- ❌ Not clearing mocks between tests
- ❌ Over-mocking (testing implementation, not behavior)
- ❌ `as unknown as` casting to force types

**What to check in CERMONT**:
- ✅ `backend/vitest.config.ts` exists
- ✅ `backend/tests/setup.ts` with proper env setup
- ✅ `vi.clearAllMocks()` in `beforeEach`
- ⚠️ **Anti-pattern**: `as unknown as` used extensively in test files:
  - `backend/src/services/user.service.test.ts` — 15+ instances of `as unknown as` type casting
  - While this is common in complex Mongoose mock chains, it's error-prone
- ✅ Frontend also has vitest config for component testing

**Probable files**: `backend/vitest.config.ts`, `backend/tests/**/*.test.ts`
**Risk**: LOW — setup is correct, casting is a test-only concern

---

### 10. Supertest (^7.2.2)

**Best Practices 2026**:
- ✅ HTTP assertion testing for Express
- ✅ Combine with test runner (vitest)
- ✅ Test error paths and edge cases
- ✅ Clean app instance per test suite

**Anti-patterns to avoid**:
- ❌ Testing framework internals instead of behavior
- ❌ Missing status code assertions

**What to check in CERMONT**:
- ✅ Present in `backend/package.json` devDependencies
- ✅ Used with vitest for integration tests

**Probable files**: `backend/tests/**/*.test.ts`
**Risk**: LOW

---

### 11. Playwright

**Best Practices 2026**:
- ✅ Page Object Model for test organization
- ✅ Test fixtures for shared setup
- ✅ Web-first assertions (`toBeVisible`, `toHaveText`)
- ✅ Component testing in addition to E2E
- ✅ Visual regression testing
- ✅ Accessibility testing (axe-core)
- ✅ Network mocking for API tests
- ✅ `test.use()` for viewport, storage state

**Anti-patterns to avoid**:
- ❌ `page.waitForTimeout()` — use web-first assertions
- ❌ Flaky selectors (copy-pasted CSS classes)
- ❌ Missing `await` on assertions
- ❌ Tests dependent on specific data in database

**What to check in CERMONT**:
- ✅ Test files at `frontend/tests/e2e/`
- ✅ Fixtures for API client
- ✅ Business flow tests
- ❌ Need to verify web-first assertions vs `waitForTimeout`

**Probable files**: `frontend/tests/e2e/**/*.spec.ts`
**Risk**: LOW — proper fixture pattern

---

### 12. Biome

**Best Practices 2026**:
- ✅ Fast linter + formatter (Rust-based)
- ✅ Replaces ESLint + Prettier
- ✅ IDE integration via LSP
- ✅ Git-based VCS ignore
- ✅ Rule-specific overrides per workspace

**Anti-patterns to avoid**:
- ❌ Disabling rules project-wide instead of per-line
- ❌ Not using `useNamingConvention` — catches casing bugs
- ❌ Duplicate configs across workspaces

**What to check in CERMONT**:
- ✅ Root `biome.json` with proper config
- ⚠️ `useNamingConvention` is **disabled** in all workspace overrides (`backend`, `frontend`, `packages/*`). While pragmatic for migration, this misses naming convention enforcement
- ⚠️ `noExplicitAny` is set to `warn` instead of `error`
- ✅ VCS integration with git ignore file enabled
- ✅ CSS parser with Tailwind directives configured

**Probable files**: `biome.json`
**Risk**: LOW — config is reasonable

---

### 13. Turborepo (^2.9.14)

**Best Practices 2026**:
- ✅ Remote caching for CI
- ✅ Pipeline task dependencies (`dependsOn`)
- ✅ `--filter` for targeted execution
- ✅ Environment variable handling via `env` array
- ✅ Cache outputs declared per task
- ✅ `persistent: true` for dev tasks

**Anti-patterns to avoid**:
- ❌ Missing `env` declarations — cache not invalidated on env change
- ❌ Large cache outputs without exclude patterns
- ❌ Not declaring `inputs` for task granularity

**What to check in CERMONT**:
- ✅ `turbo.json` exists with comprehensive task pipeline
- ⚠️ `globalEnv` only includes `NODE_ENV` and `CI` — environment-specific cache invalidation may be insufficient
- ⚠️ Task `typecheck` has `outputs: []` but no `env` array (but types don't change with env, so this is acceptable)
- ✅ Proper `dependsOn` chains (`^build` pattern)
- ✅ `outputs` exclude `.next/cache/**`

**Probable files**: `turbo.json`
**Risk**: LOW

---

### 14. IndexedDB

**Best Practices 2026**:
- ✅ Use `idb` wrapper library for ergonomic API
- ✅ Store optimized for query patterns
- ✅ Versioned schema migrations
- ✅ Proper error handling for quota exceeded
- ✅ Transaction management for atomic operations
- ✅ Cleanup of stale data

**Anti-patterns to avoid**:
- ❌ Raw IndexedDB API without wrapper
- ❌ Storing without expiry/TTL
- ❌ No error handling for quota exceeded
- ❌ Blocking main thread with large reads/writes

**What to check in CERMONT**:
- ✅ IndexedDB implemented at `frontend/src/lib/pwa/query-persist.ts`
- ✅ Proper DB open/create with versioning
- ✅ TTL-based cache expiry (1 hour)
- ⚠️ Raw IndexedDB API used (no `idb` wrapper library)
- ⚠️ `console.warn` in production code at `query-persist.ts:56,85`
- ⚠️ `Promise<unknown | null>` return types — `unknown` as escape hatch

**Probable files**: `frontend/src/lib/pwa/query-persist.ts`
**Risk**: MEDIUM — implemented but uses raw API and `console.warn`

---

### 15. Service Worker / PWA

**Best Practices 2026**:
- ✅ Register SW early in app lifecycle
- ✅ Use Workbox for caching strategies
- ✅ Precache app shell for instant loading
- ✅ Network-first for API calls
- ✅ Cache-first for static assets
- ✅ Background Sync for offline mutations
- ✅ Update flow with `SKIP_WAITING`

**Anti-patterns to avoid**:
- ❌ No SW registration
- ❌ Blocking SW update without notification
- ❌ Caching everything without strategy
- ❌ Missing offline fallback page

**What to check in CERMONT**:
- ⚠️ SW registration component exists at `frontend/src/modules/core/ui/pwa/ServiceWorkerRegistration.tsx`
- ⚠️ PWA install prompt at `frontend/src/modules/core/ui/pwa/PwaInstallPrompt.tsx`
- ❌ **No `sw.js` found** in `frontend/public/` — the file referenced in `biome.json` ignore list does not exist
- ❌ No Workbox in project dependencies
- ⚠️ Partial offline implementation (sync queue, IndexedDB persist) but no actual service worker to enable offline loading

**Probable files**: `frontend/public/sw.js`, `frontend/src/modules/core/ui/pwa/`
**Risk**: **HIGH** — Service Worker infrastructure is incomplete

---

### 16. React Doctor

**Best Practices 2026**:
- ✅ Check for hydration mismatches
- ✅ Bundle size analysis
- ✅ Accessibility audit
- ✅ React-specific lint rules
- ✅ Performance profiling recommendations

**What to check in CERMONT**:
- ⚠️ React Doctor output files exist at root (`react-doctor-report.json`, `react-doctor-report-clean.json`, etc.)
- ⚠️ These were generated at some point but may be stale
- ❌ Not run as part of CI/verification gates

**Probable files**: `react-doctor-report*.json`, `react-doctor.config.json`
**Risk**: MEDIUM — should be integrated into pipeline

---

### 17. OWASP Full-Stack Compliance

**Best Practices 2026**:
- ✅ Helmet.js (security headers)
- ✅ Input validation (Zod)
- ✅ CORS strict configuration
- ✅ Rate limiting
- ✅ Parameterized queries (Mongoose)
- ✅ No secrets in code
- ✅ Proper error responses (no stack traces)
- ✅ IDOR prevention (ownership checks)
- ✅ XSS prevention via React's built-in escaping

**Anti-patterns to avoid**:
- ❌ IDOR (Insecure Direct Object Reference)
- ❌ Missing rate limiting on auth endpoints
- ❌ CORS with `*` in production
- ❌ Secrets in environment without validation
- ❌ Stack traces in error responses

**What to check in CERMONT**:
- ✅ Helmet installed and configured
- ✅ Zod validation on all inputs
- ✅ CORS configured
- ✅ Rate limiting implemented
- ⚠️ Past IDOR vulnerabilities fixed:
  - `f83bea6` fix(security): enforce ownership check in GET /orders/:id — **CRITICAL IDOR**
  - `5aa80f9` fix(security): enforce order ownership check in GET /evidences/order/:orderId — **CRITICAL IDOR**
  - `e49a2de` fix(security): remove hardcoded credentials from docker-compose and seed — **HIGH**

**Probable files**: `backend/src/middlewares/`, `backend/src/index.ts`
**Risk**: LOW — past issues fixed, current posture good

---

### 18. Workbox

**Best Practices 2026**:
- ✅ Use `generateSW` for production builds
- ✅ Runtime caching strategies per resource type
- ✅ Precaching app shell
- ✅ Background Sync for queue
- ✅ Cacheable response plugins
- ✅ Skip waiting + clients claim

**Anti-patterns to avoid**:
- ❌ Manual service worker without Workbox
- ❌ No cache cleanup strategy
- ❌ Missing navigation fallback

**What to check in CERMONT**:
- ❌ Workbox is not in any `package.json`
- ❌ No `generateSW` or `injectManifest` configuration
- ❌ Manual service worker may have existed but `sw.js` is not present

**Probable files**: `frontend/package.json`, `frontend/public/sw.js`
**Risk**: **HIGH** — no PWA build integration

---

## Anti-Patterns Found in Codebase

### Anti-Pattern 1: Silent error swallowing with bare `catch {}`
**Files**:
- `backend/src/index.ts:269` — `} catch {`
- `backend/src/modules/audit/audit.service.ts:83` — `} catch {`
- `backend/src/common/storage/local-storage.ts:92` — `} catch {`
- `backend/src/modules/evidence/evidence.controller.ts:49` — `} catch {`
- `backend/src/modules/documents/document.service.ts:508` — `} catch {`

**Evidence**: 5 files use a bare `catch {}` block that discards error information without logging or re-throwing. This violates the project rule "Never swallow errors — always add context, log, or re-throw as typed AppError".

```typescript
// Pattern found:
try {
  // ... operation
} catch {
  // Empty — error silently discarded
}
```

**Risk**: **MEDIUM-HIGH** — Silent catches hide bugs, make debugging impossible, and can leave the system in inconsistent states. The `audit.service.ts` and `evidence.controller.ts` instances are especially concerning.

**Remediation**: Add logging in every catch block. For controllers, use Express 5 error propagation (`next(error)`). For services, wrap in typed `AppError`.

---

### Anti-Pattern 2: `null` usage violating project's own "no null" policy
**Files**:
- `packages/domain/src/billing.rules.ts:12` — `currentStep: BillingStep | null;`
- `packages/domain/src/billing.rules.ts:20` — `BillingStep | null` return type
- `packages/domain/src/cost.rules.ts:12` — `proposalValue: number | null;`
- `packages/domain/src/cost.rules.ts:13` — `estimatedMaterials: number | null;`
- `packages/shared-types/src/schemas/common.schema.ts:33` — `deletedAt?: string | null;`
- `packages/shared-types/src/schemas/dynamic-form-response.schema.ts:9` — `z.string().nullable()`
- `packages/shared-types/src/schemas/xlsx-import.schema.ts:64` — `z.null()`
- `packages/shared-types/src/utils/types.ts:223` — `Nullable<T>` utility type

**Evidence**: The project rules explicitly state: "No `null` or `undefined` for absence — use status objects." Yet `null` is used pervasively in domain types and schemas. The `Nullable<T>` utility type actively enables this pattern.

**Risk**: **MEDIUM** — Violates project's own coding standards. `null` references are a common source of runtime errors (`Cannot read properties of null`).

**Remediation**: Replace `null` with discriminated union status types (e.g., `{ status: "pending" } | { status: "completed", value: number }`). Remove `Nullable<T>` helper type.

---

### Anti-Pattern 3: Direct `fetch()` calls bypassing centralized `apiClient`
**Files**:
- `frontend/src/modules/reports/queries.ts:281`:
  ```typescript
  const response = await fetch(toApiUrl(`/reports/order/${...}/pdf`), ...);
  ```
- `frontend/src/lib/offline/sync-manager.ts:135`:
  ```typescript
  const response = await fetch(toApiUrl(entry.endpoint), ...);
  ```
- `frontend/src/app/api/auth/login/route.ts:56`:
  ```typescript
  const response = await fetch(`${backendUrl}/api/auth/login`, ...);
  ```
- `frontend/src/app/api/auth/register-client/route.ts:22`:
  ```typescript
  const response = await fetch(`${apiRoot}/auth/register-client`, ...);
  ```
- `frontend/src/lib/http/api-client.ts:148,236,328`:
  ```typescript
  const response = await fetch(`${API_ROOT}/auth/refresh`, ...);
  ```

**Evidence**: The project rule states "No direct `fetch` in components — use `apiClient`". While the rule targets components specifically, direct `fetch` calls bypass centralized auth token handling, retry logic, and error normalization that `apiClient` provides.

**Risk**: **MEDIUM** — The `sync-manager.ts` and `reports/queries.ts` calls skip the auth interceptor and retry logic. API route handlers in Next.js are somewhat expected to use `fetch`, but the sync and query layer should use `apiClient`.

**Remediation**: Replace `fetch()` calls in sync-manager and queries with `apiClient.get/post`. For Next.js API routes, the direct `fetch` to backend is the standard pattern.

---

### Anti-Pattern 4: `console.log`/`console.warn` in production code
**Files**:
- `frontend/src/lib/http/api-client.ts:39-46` — `console.info` used for structured logging in production
- `frontend/src/lib/pwa/query-persist.ts:56,85` — `console.warn` for error handling
- `frontend/src/modules/evidences/ui/EvidenceUploader.tsx:91` — `console.error` for GPS failure
- `backend/src/scripts/*` — Multiple `console.log` calls in seed and migration scripts

**Evidence**: The project rule states "No `console.log` / `debugger` / `alert` in production". The `api-client.ts` uses `console.info` with JSON formatting in production mode — this is a deliberate design choice for structured logging but still leaks to browser console.

**Risk**: **LOW-MEDIUM** — The `api-client.ts` usage is intentional structured logging. The `query-persist.ts` and `EvidenceUploader.tsx` instances are true production code that should use a proper logging service.

**Remediation**: Replace `console.warn`/`console.error` in production code with the app's `createLogger` utility.

---

### Anti-Pattern 5: `as unknown as` type casting in test files
**Files**:
- `backend/src/services/user.service.test.ts` — 15+ instances:
  ```typescript
  mockUser as unknown as Awaited<ReturnType<typeof User.findOne>>,
  mockQuery as unknown as ReturnType<typeof User.findById>,
  ```
- `backend/tests/test-utils.ts:46` — `mockJwtReturn` uses type cast

**Evidence**: While often necessary for complex Mongoose mock chains, `as unknown as` double casting completely bypasses TypeScript's type system. This can mask type mismatches that would catch real bugs.

**Risk**: **LOW** — Confined to test files. The `test-utils.ts` wrapper is a pragmatic solution. However, alternative patterns (mocking at the HTTP layer with supertest rather than at the model layer) would be more robust.

**Remediation**: Prefer integration tests with supertest over mocked service unit tests where possible. For unit tests, use proper type-safe mock factories.

---

### Anti-Pattern 6: `unknown` as escape hatch in frontend code
**Files**:
- `frontend/src/lib/http/api-client.ts:70` — `parseJsonBody(response): Promise<unknown>`
- `frontend/src/lib/pwa/query-persist.ts:37,40,60` — `state: unknown`, `Promise<unknown | null>`
- `frontend/src/lib/offline/sync-queue.ts:15` — `payload: Record<string, unknown>`
- `frontend/src/lib/offline/sync-manager.ts:44,48,68` — function params typed as `Record<string, unknown>`
- `frontend/src/store/ui.store.ts:11,22` — `modalData: unknown`

**Evidence**: The project rule states "No `unknown` as escape hatch". However, `unknown` is used extensively in infrastructure code (API client, offline, PWA) where the runtime type is genuinely unknown. This is a reasonable use of `unknown` (safer than `any`), but `api-client.ts` should narrow types properly before returning.

**Risk**: **LOW** — `unknown` is the type-safe alternative to `any`. The usages in `api-client.ts` and `query-persist.ts` are legitimate for parsing external data. The `api-client.ts` functions do narrow types internally.

**Remediation**: Add Zod schemas for response shapes in `api-client.ts` to validate and narrow from `unknown` to specific types.

---

### Anti-Pattern 7: Incomplete Service Worker / PWA offline support
**Files**:
- `frontend/src/modules/core/ui/pwa/ServiceWorkerRegistration.tsx` — SW component exists
- ❌ `frontend/public/sw.js` — **File does not exist** (listed in biome.json ignore but absent)
- ❌ No Workbox in any `package.json`
- ⚠️ Partial offline: IndexedDB cache persist exists, sync queue exists, but no SW to enable offline app loading

**Evidence**: CERMONT has partial offline infrastructure:
- IndexedDB query cache (`query-persist.ts`) ✅
- Offline sync queue with retry (`sync-queue.ts`, `sync-manager.ts`) ✅
- Service Worker registration component ✅
- Connectivity tracking (`connectivity.ts`) ✅
- **No actual SW file** ❌ — Without `sw.js`, the PWA cannot:
  - Load when offline (no app shell cache)
  - Intercept fetch requests for caching
  - Work on first load without network

**Risk**: **HIGH** — The domain requires field operation with intermittent connectivity. Without a real service worker, users cannot load the app when offline, even though the sync queue would handle mutations once connectivity returns.

**Remediation**: Add Workbox to generate `sw.js` with app shell precaching and runtime caching strategies. Register it properly.

---

## Remediation Priority Matrix

| # | Anti-Pattern | Priority | Effort | Impact |
|---|-------------|----------|--------|--------|
| 7 | Incomplete Service Worker / no SW file | **P0** | Medium | Critical for offline field ops |
| 1 | Silent error swallowing (`catch {}`) | **P1** | Small | Bugs, debugging, system state |
| 2 | `null` in domain rules | **P1** | Small | Runtime errors, violates standards |
| 3 | Direct `fetch()` bypassing apiClient | **P2** | Small | Auth/retry bypass, inconsistency |
| 4 | `console.log` in production code | **P2** | Tiny | Minor hygiene |
| 6 | `unknown` as escape hatch | **P3** | Medium | Type safety improvement |
| 5 | `as unknown as` casting in tests | **P3** | Low | Test-only concern |

## Stack Recommendations

| Layer | Current | Recommend | Priority |
|-------|---------|-----------|----------|
| Validation | Zod 4.x ✅ | ✅ Keep | — |
| HTTP Client | apiClient ✅ | ✅ Keep, narrow `unknown` returns | P3 |
| State Mgmt | TanStack Query ✅ | ✅ Keep, add persist for offline | P0 |
| Offline | Partial ❌ | Add Workbox `generateSW` + actual `sw.js` | **P0** |
| Forms | RHF + Zod ✅ | ✅ Keep | — |
| Testing (BE) | Vitest + Supertest ✅ | ✅ Keep, reduce `as unknown as` | P3 |
| Testing (FE) | Playwright ✅ | ✅ Keep, expand coverage | P2 |
| Linting | Biome ✅ | Enable `useNamingConvention`, `noExplicitAny: error` | P2 |
| PWA | Partial ❌ | Add Workbox, proper SW generation | **P0** |
| Error Handling | Mixed ⚠️ | Fix bare `catch {}`, add typed error context | P1 |
| Security | Good ✅ | Periodic audit for IDOR regression | P1 |
