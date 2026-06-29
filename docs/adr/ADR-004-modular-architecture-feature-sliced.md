# ADR-004: Feature-Sliced Modular Architecture

**Status:** Accepted
**Date:** 2026-05-29
**Deciders:** Principal Software Architect, Backend Engineer, Frontend Engineer

---

## Context

Cermont S.A.S. initially organized its backend around a layered architecture (controllers/routes/services/models), with all business logic in `backend/src/services/` and all Mongoose schemas in `backend/src/models/`. As the application grew to support the full 14-step workflow, several problems emerged:

- **Monolithic services**: `work-request.service.ts` grew to 600+ lines handling everything from CRUD to workflow transitions.
- **Cross-contamination**: Planning logic leaked into execution services; billing logic touched delivery-record code.
- **Unclear boundaries**: New engineers couldn't tell where one domain ended and another began.
- **Testing friction**: Testing a single workflow step required mocking 5+ unrelated services.
- **Frontend-backend mismatch**: The frontend organized by domain modules (`modules/orders/`, `modules/billing/`) but the backend was flat.

## Decision

Reorganize the backend into **feature-sliced modules** in `backend/src/modules/`, each following a consistent internal structure:

```
backend/src/modules/
  work-requests/
    work-requests.controller.ts
    work-requests.service.ts
    work-requests.routes.ts
    work-requests.model.ts (or import from shared where schema exists)
  proposals/
  orders/
  planning/
  field-execution/
  evidences/
  reports/
  delivery-records/
  service-entry-sheets/
  invoices/
  payments/
```

### Module Internal Structure

Each module is self-contained with:
- **Controller**: Thin HTTP layer (parse request → call service → return response)
- **Service**: All business logic
- **Routes**: Endpoint wiring (optionally, routes can be centralized)
- **Model/Model access**: Mongoose operations

### Cross-Cutting Modules

Some concerns span multiple domains and live outside `modules/`:
- `backend/src/services/` — Cross-cutting business services (workflow gate, audit, PDF generation)
- `backend/src/middlewares/` — Auth, RBAC, validation
- `backend/src/config/` — Env validation, app config
- `backend/src/common/` — Shared utilities (logger, errors)
- `backend/src/models/` — Mongoose schemas (shared across modules)

## Consequences

### Positive

- **Clear domain boundaries**: Each module owns its business logic. Planning doesn't import from execution.
- **Parallel development**: Multiple engineers can work on different modules without merge conflicts.
- **Test isolation**: Module tests mock only their domain dependencies, not the entire system.
- **Frontend-backend alignment**: Both use the same domain names (`modules/orders/`, `modules/billing/`).
- **Easier onboarding**: New engineers read one module at a time rather than the entire service layer.

### Negative

- **Duplicate patterns**: Some cross-cutting patterns (audit, status transitions) repeat across modules.
- **Module communication**: Modules that need to interact (e.g., order creation triggers planning) must go through shared services, not direct imports.
- **Migration effort**: Legacy `backend/src/services/` files need gradual migration into modules.

### Mitigations

- Cross-cutting services (`cermont-workflow-gate.service.ts`) handle inter-module orchestration.
- Migration is incremental: legacy services coexist with new modules during transition.
- Shared Mongoose models in `backend/src/models/` prevent schema duplication.

## Alternatives Considered

### A) Keep flat layered architecture
Rejected: Monolithic services violate Single Responsibility Principle. A single `services/` directory with 40+ files has no domain orientation.

### B) NestJS modules
Rejected per ADR-001: NestJS is not used. Feature-sliced modules are a directory convention, not a framework feature.

### C) Microservices
Rejected: Overkill for Cermont's scale. The monorepo with bounded module contexts provides sufficient isolation without the operational cost of service boundaries.

## Compliance

- SOLID: Single Responsibility per module, Open for extension via shared services.
- Feature-sliced: Domain-aligned modules match frontend organization.
- DRY: Shared models and cross-cutting services prevent duplication.
- Low coupling: Modules communicate through well-defined shared services, not direct imports.
