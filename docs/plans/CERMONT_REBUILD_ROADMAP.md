# Cermont Rebuild Roadmap

**Status:** CURRENT_SOURCE_OF_TRUTH  
**Updated:** 2026-06-04

## Purpose

This roadmap defines the implementation order for the Cermont operational
platform. It keeps development aligned with the canonical 14-step business flow
and the vertical-slice rule:

`shared Zod contract -> backend route/service/model -> frontend query/page/state -> tests -> gates`

## Phase 0 — Truth Baseline

- Keep `docs/architecture/FRONTEND_ROUTE_MAP.md` and
  `docs/architecture/API_ENDPOINT_MATRIX.md` aligned with implemented routes.
- Regenerate audit maps when modules, endpoints, contracts, or workflows change.
- Record baseline failures before large implementation work.

## Phase 1 — Security And Offline Foundation

- Serve uploaded binaries only through authenticated API endpoints.
- Keep `/uploads` out of test and production public serving.
- Validate uploads with MIME, extension, magic bytes, size limit, and malware
  scan policy.
- Keep the Service Worker as app-shell/fallback only; do not cache or enqueue
  API mutations in the Service Worker.
- Store offline evidence binaries in IndexedDB and queue only JSON metadata with
  idempotency keys.

## Phase 2 — Field Operations

- Complete offline-capable field slices for work requests, site visits,
  planning, execution/checklists, and evidences.
- Every field slice must include loading, error, empty, offline/pending, and
  retry states.
- Sync must be authenticated, idempotent, ordered, and visible to the user.

## Phase 3 — Administrative Closure

- Complete technical report, delivery record, client signature, SES, invoice,
  invoice approval, and payment as online-first flows.
- Use `CermontWorkflowGateService` and administrative workflow services as the
  blocking sources of truth.
- Do not allow SES, invoice, or payment creation when required previous
  artifacts are missing.

## Phase 4 — Costs, Documents, And Dashboards

- Calculate proposal baseline, actual costs, evidence-backed supports, and
  variance server-side.
- Keep document-driven forms versioned and template-based.
- Connect dashboards to real endpoints only; no production mock data.

## Required Gates

Before reporting implementation completion:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
npx react-doctor@latest
```
