# 10 — Architecture, Refactor, & Legacy Code Plan

## Executive Summary

To maintain a healthy, maintainable monorepo that scales over years of commercial development, CERMONT S.A.S. must enforce a strict **Screaming Architecture & Zero-Coupling Code Quality Standard**. 

This audit-driven architectural plan evaluates the current layout of the codebase (`backend/src/`, `frontend/src/`, and `packages/`), identifies legacy trash scripts lying at the workspace root, traces duplicate patterns, exposes circular import vulnerabilities, and maps out concrete refactoring tasks per directory. It establishes the baseline for a code cleanup campaign to align the repository with the zero-trust, clean-code paradigms of the project rules.

---

## Sources & References

- **Canonical Repository Files**:
  - `package.json` — Workspaces declaration (`backend`, `frontend`, and `packages/*`).
  - Root directory listings (audited for temporary scripts).
  - `backend/src/models/` — Domain structures.
- **Architectural Paradigms**:
  - **Screaming Architecture (Robert C. Martin)**: Folders must scream their business domain rather than technical framework structures.
  - **Dependency Inversion Principle (DIP)**: Controllers must depend on service abstractions, and services must remain pure of HTTP bindings.

---

## Workspace Architecture Audit (Screaming Design)

CERMONT uses an npm workspaces monorepo structure, partitioned into distinct boundary layers:

```
cermont_aplicativo/
├── backend/               ← Express 5.2.1 REST API (Screaming features: modules, services)
├── frontend/              ← Next.js 16.2.6 App Router (Organized in route groups & modules)
└── packages/
    ├── shared-types/      ← Single Source of Truth (SSOT) for Zod contracts, RBAC enums, and API envelopes
    ├── domain/            ← Pure business domain rules (calculators, margin checkers, cost matrices)
    └── config/            ← Environment and config validations
```

### Layer Verification & Integrity Checks:
- **`packages/shared-types`**: Evaluated as the Single Source of Truth (SSOT). All API request payloads, Mongoose-adjacent models, and RBAC lists must live here. **Duplicating contracts in backend or frontend is strictly prohibited.**
- **`packages/domain`**: Audited for pure logic. This layer must remain completely isolated from databases (no mongoose imports) and networks (no express imports), storing pure utility rules (such as variance math formulas and tax margins).
- **`packages/config`**: Houses general Zod environmental schemas ensuring the backend fails fast at boot if `.env` variables are missing.

---

## Workspace Trash Script Inventory (P0 Clean Plan)

A sweep of the root workspace directory revealed a accumulation of temporary, uncommitted scripting junk. These files must be removed or organized into `tooling/` to prevent AI agents and developer tooling from indexing obsolete logic.

| Obsolete Script | Core Danger / Impact | Target Action |
|-----------------|----------------------|---------------|
| `fix.js` | Modifies package directories blindly. | **DELETE**. |
| `fix2.js` | Obsolete JSON rewriter script. | **DELETE**. |
| `fix-rbac-roles.js` | Modifies users in database with hardcoded credentials. | **DELETE**. Replace with standard DB seeds. |
| `add-route.js` | Legacy page scaffold generator. | **DELETE**. |
| `addwr.js` | Test tool for work request creation. | **DELETE**. Replace with Vitest integration specs. |
| `add_wr.js` | Duplicate of `addwr.js`. | **DELETE**. |
| `frontend_fixes.mjs` | Ad-hoc frontend file string patcher. | **DELETE**. |
| `test-endpoints.js` | Command-line HTTP fetch tester. | **DELETE**. |
| `test.js` | Shell command wrapper containing empty functions. | **DELETE**. |

---

## Anti-Patterns Identified in Codebase

During the codebase scan, several structural anti-patterns were confirmed.

### 1. Unbounded Infinite Queries (`MAX_PAGE_LIMIT` Abuse)
- **Anti-pattern**: In `backend/src/modules/order/order.service.ts` (or similar query engines), the backend loads a massive limit of elements to feed the Kanban board:
  `const orders = await this.orderService.findAll({ limit: KANBAN_ORDER_QUERY_LIMIT });` (where KANBAN_ORDER_QUERY_LIMIT is set to 250+).
- **Impact**: Server crash under high production concurrency.
- **Remediation**: Implement infinite pagination. Load a max limit of 25 records per column. Technicians trigger `useInfiniteQuery` via a "Cargar más" card when scrolling down.

### 2. Spanglish Code Identifiers
- **Anti-pattern**: Historical database dumps and schemas contain mixed language (e.g. `status_visita`, `order_fecha`, `manodeobra`).
- **Impact**: Code readability degradation.
- **Remediation**: Force absolute English naming across all variables, Mongoose schemas, Zod attributes, comments, and logs. Reject PRs containing mixed Spanglish.

### 3. Duplicate Contract Declarations
- **Anti-pattern**: Duplicating Zod validation schemas for requests directly inside `backend/src/routes/` and importing duplicate `interface` types inside the frontend.
- **Impact**: Drift between frontend expectations and backend reality, leading to silent integration failures.
- **Remediation**: Erase all native model declarations. Everything must be imported from `@cermont/shared-types`.

---

## Circular Dependencies & Code Health Audit

To verify the general health of the codebase, we establish standard diagnostic parameters.

### 1. Circular Imports
- **Audit Tool**: Madge (`npx madge --circular .`).
- **Impact**: Circular references cause runtime undefined errors during Next.js server-side rendering or Express startup.
- **Remediation**: Refactor loops by extracting shared definitions into a child utility module or migrating them to `packages/shared-types`.

### 2. Dead Code Expose
- **Audit Tool**: Knip (`npx knip`).
- **Impact**: Obsolete files, unused exports, and unneeded dependencies slow down packaging bundles and build times.
- **Remediation**: Prune orphaned modules. Eliminate packages not declared in workspaces dependencies.

### 3. Duplicated Code Cells
- **Audit Tool**: JSCPD (`npx jscpd --min-tokens 50`).
- **Impact**: Copy-paste coding causes bugs to multiply across routes.
- **Remediation**: Unify logic inside reusable custom hooks (frontend) or shared services (backend).

---

## Hardening Gates & Static Diagnostics

Before any pull request can be merged into `deploy/vps-clean`, the developer environment must enforce the following gates in sequence:

```
[ Developer Branch Work ]
           │
           ▼
  npm run typecheck       ◄── Enforces 0 TypeScript errors (strict: true)
           │
           ▼
  npm run lint            ◄── Biome 2.x scans (0 errors allowed)
           │
           ▼
  npx react-doctor        ◄── Scans for re-renders & bundle size issues
           │
           ▼
  npm run quality:strict  ◄── Scans for Spanglish, circular imports, and trash files
           │
           ▼
  npm run test            ◄── Runs Vitest + Playwright suites
           │
           ▼
  [ Ready to Commit ]
```
