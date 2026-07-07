---
slug: spec-012-escalamiento-profesional
status: approved-for-execution
intent: clear
pending-action: write .omo/plans/spec-012-escalamiento-profesional.md
approach: Reconcile Spec 012 against the live repository, then execute contract-first vertical slices in dependency order. Start with Tool/FileAsset correctness, stabilize Cost Intelligence only after its concurrent WIP is isolated, and defer AI until all P0/P1 gates are green.
---

# Draft: spec-012-escalamiento-profesional

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
<!-- id | outcome (one line) | status: active|deferred | evidence path -->

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
<!-- assumption | adopted default | rationale | reversible? -->

## Findings (cited - path:lines)

- Tool uploads currently resolve `entityType: tool` to the `Resource` model rather than `Tool` (`backend/src/modules/files/files.service.ts`).
- `/api/tools/calibrations-due` is declared after `/:id` and is shadowed (`backend/src/modules/tool/tool.routes.ts`).
- The untracked tools page uses a double-prefixed API path, wrong response envelope, noncanonical status and links to absent routes (`frontend/src/app/(dashboard)/tools/page.tsx`).
- Fleet photo upload/gallery is already implemented; creating another fleet module would duplicate behavior (`backend/src/modules/fleet`, `frontend/src/modules/fleet`).
- Cost catalog, budget alert, gross margin and CSV export already exist as dirty/untracked WIP; they must be reviewed and completed, not replaced (`backend/src/modules/cost`, `frontend/src/modules/costs`).
- Tool model/service retain `Schema.Types.Mixed`, `Record<string, unknown>` and assertion chains that violate repository strictness (`backend/src/models/Tool.ts`, `backend/src/modules/tool/tool.service.ts`).
- Tool assignment bypasses readiness/conformance checks, is not atomic and is unaudited; usage history is unbounded (`backend/src/modules/tool/tool.service.ts`, `backend/src/models/Tool.ts`).
- Cost mutations authorize broad internal roles instead of canonical action permissions (`backend/src/modules/cost/cost.routes.ts`, `packages/domain/src/permissions.ts`).
- Privacy request detail lookup is authenticated but not owner/admin scoped, creating an IDOR risk (`backend/src/modules/privacy-requests`).

## Decisions (with rationale)

- Execute Tool/FileAsset correction first because it is a confirmed data-integrity bug on clean files and unlocks the requested tools module.
- Use the shared `/api/files` engine and reusable file UI; no second media architecture.
- Treat the external Spec 012 as an intent document, not source of truth where it conflicts with canonical schemas, roles, routes or current implementation.
- Fix the confirmed privacy IDOR before feature expansion because it is an independently exploitable P0 security defect found during the requested compliance review.
- Costs are the second slice after reconciling existing WIP; preserve its current catalog/budget/export implementation.

## Scope IN

- All delta work needed to satisfy Spec 012 A-E at professional production quality, starting with Tools and Costs.
- Contract, model, service, controller, route, frontend query/UI, tests, docs and observable QA per slice.
- RBAC, audit, offline/degradation, accessibility and security review.

## Scope OUT (Must NOT have)

- No dependency installation or package manifest edits without explicit approval.
- No MediaAsset, ownerType `fleet_vehicle`, abbreviated roles, hardcoded routes, direct component fetches or mock production data.
- No AI production mutation and no Sprint 12-F implementation until all earlier gates are green.
- No deployment in this execution.

## Open questions

None blocking. The original request explicitly authorizes execution; dependency changes and live 42Crunch scans remain separate approval gates.

## Approval gate
status: approved-by-start-work-request
<!-- When exploration is exhausted and unknowns are answered, set status: awaiting-approval. -->
<!-- That durable record is the loop guard: on a later turn read it and resume at the gate instead of re-running exploration. -->
1 | Tool/FileAsset operational correctness and photo gallery | active | backend/src/modules/tool, backend/src/modules/files, frontend/src/app/(dashboard)/tools
2 | Cost intelligence lifecycle, RBAC, audit and profitability | active | backend/src/modules/cost, frontend/src/modules/costs
3 | Documentary and financial closure | active | technical-report, delivery-record, SES, invoice, payment modules
4 | Operational cockpit, dashboard, dispatch, portal and notifications | active | service-cases, dashboard, dispatch, portal, notifications modules
5 | AI/automation innovation | deferred until P0/P1 gates are green | Spec 012 Sprint 12-F guardrail
6 | Security, E2E and release gates | active | OpenAPI/42Crunch, Playwright, root gates
New dependencies | Do not add; prefer existing FileAsset/UI/browser APIs | package files require explicit approval | yes
Dirty worktree | Preserve all current changes; implement isolated work in a task-owned worktree | concurrent WIP spans costs/dashboard/portal/automation | yes
Spec role abbreviations | Use canonical @cermont/domain lowercase roles | canonical docs override Spec 012 examples | no
File ownership | Keep entityType tool/vehicle; do not introduce fleet_vehicle ownerType | FileAsset is SSOT | no
AI | Defer until A-E/P0-P1 validation is fully green | canonical product limits and Spec guardrail | yes
