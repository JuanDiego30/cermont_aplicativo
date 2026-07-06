# AGENTS.md — Cermont S.A.S.

## Purpose

This repository contains the Cermont S.A.S. web application: a **document-driven operational platform for multi-service contractor workflows**.

The application supports the full 14-step business flow:
1. Work request → 2. Site visit → 3. Proposal → 4. Purchase Order approval → 5. Planning → 6. Execution → 7. Evidence → 8. Technical report → 9. Delivery record → 10. Client signature → 11. SES / Ariba → 12. Invoice → 13. Invoice approval → 14. Payment

**The system must not be treated as** a generic dashboard, a petroleum-only tool, a legacy maintenance template, or a collection of hardcoded forms.

---

## Canonical Repository Structure

The valid structure is:
```txt
backend/
frontend/
packages/
```

Valid workspaces (`package.json`):
```txt
backend
frontend
packages/*
```

Do **not** create or restore:
```txt
apps/
apps/backend
apps/frontend
```

---

## Canonical Documentation (Read Before Coding)

1. `docs/README.md` — Master index
2. `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` — Product vision
3. `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — Entities, states, RBAC, 14-step flow
4. `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` — Technical architecture
5. `docs/architecture/FRONTEND_ROUTE_MAP.md` — All routes + status
6. `docs/architecture/API_ENDPOINT_MATRIX.md` — All endpoints + schemas
7. `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` — Full implementation rules
8. `docs/plans/CERMONT_REBUILD_ROADMAP.md` — 23-phase rebuild plan

**If older documentation contradicts these files, the canonical files win.**

---

## Non-Negotiable Rules

### Language & Types
- ❌ No `any` — TypeScript strict
- ❌ No `unknown` as escape hatch
- ❌ No `as any`, `@ts-ignore`, `@ts-expect-error`
- ❌ No `null` or `undefined` for absence — use status objects

### Stack (Instant Rejection)
- ❌ No NestJS → Express 5.2.1 only
- ❌ No Prisma / PostgreSQL → Mongoose + MongoDB only
- ❌ No Auth.js / NextAuth → JWT + Zustand auth store
- ❌ No pnpm / yarn → npm only
- ❌ No Joi → Zod 4.x only
- ❌ No Axios → `apiClient` wrapper
- ❌ No `middleware.ts` → `proxy.ts` is the security perimeter

### Code Quality
- ❌ No duplicate modules, components, schemas, roles, or routes
- ❌ No giant monolithic components
- ❌ No business logic in UI components
- ❌ No direct `fetch` in components → TanStack Query
- ❌ No `useEffect` for data fetching → TanStack Query
- ❌ No hardcoded roles → `@cermont/domain`
- ❌ No hardcoded routes
- ❌ No mock data in production
- ❌ No silent catches or swallowed errors
- ❌ No orphan routes or dead components
- ❌ No `console.log` / `debugger` / `alert` in production

### Project Hygiene
- ❌ Do not modify `package.json` or `package-lock.json` without explicit approval
- ❌ Do not install dependencies without explicit approval
- ❌ Do not disable lint, tests, or typecheck
- ❌ Do not remove implemented functionality without replacement
- ❌ Do not leave sidebar routes pointing to 404
- ❌ Do not leave frontend API calls without backend endpoints

---

## Required Implementation Style

Work by **vertical slices**:
```txt
contract (Zod in shared-types) → backend (route/service/model) → frontend (query/page/state) → tests → gates
```

Every visible feature must include:
- ✅ Contract in `packages/shared-types/src/schemas/`
- ✅ Backend endpoint if data is required
- ✅ Frontend page or component
- ✅ Loading state
- ✅ Error state
- ✅ Empty state
- ✅ Offline / graceful degradation where applicable
- ✅ RBAC via `@cermont/domain`
- ✅ Tests (unit + E2E for critical flows)
- ✅ Documentation update if behavior changes

---

## Required Gates

Before reporting completion, run **all** of these and ensure they pass:
```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
npx react-doctor@latest
```

**Do not claim completion if any gate fails.**

---

## Frontend Design Rule

Use the Cermont UI guide at `docs/design/CERMONT_UIUX_GUIDE.md`. The design keeps the Mintlify-style system with Cermont blue (`#2154A6`) + green (`#4CAF50`) palette. **Do not create a second design system.** **Do not duplicate `Button`, `Card`, `FormField`, `Dialog`, `Table`, `Badge`.**

---

## Every Task Must Finish With

```txt
Files modified
Files created
Files deleted
Tests executed
Gates result (typecheck / lint / test / build / verify / react-doctor)
Known pending issues
Deploy verdict
```


<claude-mem-context>
# Memory Context

# [cermont_aplicativo] recent context, 2026-07-06 1:28am GMT-5

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (26.892t read) | 2.582.951t work | 99% savings

### Apr 27, 2026
S6 Frontend responsive design fixes and component refactoring for orders page (Apr 27, 10:12 PM)
S3 Crear auditoría de accesibilidad WCAG en campos de formulario y plan de correcciones fase por fase (Apr 27, 10:12 PM)
S4 Crear auditoría de accesibilidad WCAG en campos de formulario y plan de correcciones fase por fase (Apr 27, 10:12 PM)
S8 Comprehensive dependency cleanup and dead code removal plan created for Cermont monorepo (Apr 27, 10:56 PM)
S7 Comprehensive dependency and code audit of Cermont monorepo - align 4 package.json files, eliminate duplicate dependencies, remove dead/zombie code following clean code principles (SOLID, DRY, KISS, YAGNI) (Apr 27, 11:18 PM)
S9 Dependency cleanup and dead code removal plan created and documented in docs/claude (Apr 27, 11:19 PM)
### Apr 28, 2026
S10 Master atomic refactoring plan created with 6-phase execution framework for Cermont monorepo (Apr 28, 1:21 AM)
S13 Awaiting user decision to begin atomic refactoring execution (Apr 28, 1:25 AM)
S11 Codebase structure discovery for atomic refactoring plan execution (Apr 28, 1:32 AM)
S12 Codebase structure exploration for atomic refactoring plan execution (Apr 28, 1:33 AM)
### Jul 1, 2026
570 4:00p 🔵 Git Bash Confirmed Ready at `C:\Program Files\Git\bin\bash.exe`
571 4:01p 🔵 Git Bash Fork Exhaustion: Windows Exit Code 0xC0000142 (STATUS_DLL_INIT_FAILED), errno 11
572 " 🔵 CERMONT Repo on `implement/spec-010-modulos-14-pasos` — Massive Uncommitted Spec-010 Work In Progress
573 " ⚖️ Spec-012 Absolute Development Rules — CERMONT Contract-First Architecture Constraints
574 " ⚖️ Spec-012 Sprint Plan: 6 Sprints, Contract-First from packages/ Outward to frontend/
575 " 🔵 Sprint 1 Schema Enrichment Spec: PreflightChecklist, EvidenceSlots, and New Enum Values
576 4:02p 🔵 CERMONT Tech Stack Confirmed: Express 5 + Next.js 16 + MongoDB — Prohibited Tech List
577 " 🔵 CERMONT Frontend Pages Existence Matrix — 8 of 14 Workflow Pages Are Missing
578 " 🔵 Spec-012 Task S1.8: New `spec-012-rules.ts` Domain File with 8 KPI Computation Functions
579 " 🔵 Complete Spec-012 Commit Strategy: 29 Atomic Commits Across 6 Sprint Branches
580 4:04p 🔵 FRONTEND_ROUTE_MAP Audit: 83/86 Routes IMPLEMENTED — Previous Summary Was Outdated
581 " 🔵 API Matrix vs. Reality Gap: Backend Has 389 Routes; Cockpit Endpoints Already Implemented
582 " 🔵 Repo State Confirmed: Branch implement/spec-010, GitHub Remote JuanDiego30, No Worktrees
583 4:07p 🔵 Worktree `implement/spec-012-ssot-enrichment` Created Successfully at `.codex/worktrees/spec-012-implementation-master`
584 " 🔵 CRITICAL: Remote Has NO `main` Branch — Default Remote Branch is `deploy/vps-clean`
585 " 🔵 npm ci in Spec-012 Worktree is Stalling (Session 52364) — Likely Still Installing
586 " 🔵 Spec-010 Commit History: 4 Commits Ahead of Spec-009, Contains Tool/Fleet/Evidence FSM Schemas
587 4:08p 🔴 npm ci Completed Successfully (exit=0) — 848 Packages Installed, 4 Non-Blocking Vulnerabilities
588 " 🔴 CRITICAL Baseline Failure: packages/domain typecheck BROKEN — 14 TypeScript Errors in index.ts (Pre-Existing at commit 1bcef8f)
589 " 🔴 Worktree .codex/worktrees/spec-012-implementation-master Deregistered from Git But Directory Still Exists
590 " 🔵 Monorepo Structure: ALL Packages Inside packages/ — No Separate Top-Level backend/ or frontend/ Directories
591 4:13p 🔵 Spec-012 Branch Re-Created from WRONG Base (deploy/vps-clean = 15419061), NOT 1bcef8f
592 " 🔴 BASELINE GATES (deploy/vps-clean): lint ✅ contracts:check ✅ — typecheck ❌ test ❌ build ❌ — Root Cause: Missing VehicleAssignment Model + Checklist Fields
594 " 🔵 Test Suite Reveals COMPLETE Monorepo Structure: backend/ and frontend/ ARE Top-Level Directories (Not Inside packages/)
595 " 🔵 Backend Test Results: 508 Passing, 16 Suites + 1 Test Failing — All Trace to VehicleAssignment Missing + 1 Timeout
597 4:17p 🔵 PRIMARY SESSION RESEARCH PHASE: VehicleAssignment.ts Exists in Main Repo (1bcef8f) — Full Implementation Retrieved
598 " 🔵 CRITICAL: Comprehensive checklist.service.ts Update Requires evaluateChecklistReadiness from @cermont/domain — NOT in deploy/vps-clean Domain
599 " 🔵 PRIMARY SESSION READS: TypeScript+MongoDB Skill References + IChecklistDocument Confirms Schema Fields Already Exist
600 4:25p ⚖️ CERMONT Spec-012 Master Scaling Plan Initiated
601 " 🔵 CERMONT App Domain: Construction Safety & Administrative Work Support
602 4:26p 🔵 CERMONT Monorepo Architecture Confirmed via Turbo Build
603 " 🔵 CERMONT Frontend: Complete Route Map and PWA Architecture
604 4:27p 🔵 Spec-012 Worktree Git State: 3 Backend Fixes on Top of Merged Spec-009 PR
605 " 🔵 Spec-012 Feature Gap Analysis: Most Planned Schemas Are Missing
606 4:28p 🔵 Execution Session Schema: Full Offline-First Command Architecture
607 " 🔵 Evidence Schema V2 Maps Directly to CERMONT Field Inspection Categories
608 " 🔵 Domain Package Exports Full Business Rules: 14-Step Pipeline, RBAC, Kit, Closure, Billing, Cost
609 4:29p 🟣 Spec-012 Phase 1: PreflightChecklist and FieldNovelty Schemas Implemented and Tested
610 4:30p 🔵 Pre-commit Hook Runs Full Monorepo Typecheck via Turbo Before Each Commit
611 " 🔵 API Contract Snapshot Test Guards Schema Changes — Requires Snapshot Regen After Spec-012 Extensions
612 " 🔵 Contract Governance System: 58-Migration Audit Trail + Two-Phase Snapshot Guard
613 4:31p ✅ API Contract Snapshot Regenerated and Migration 059 Added for Spec-012
614 " 🟣 Spec-012 Phase 1 Schema Work Fully Verified: All Guards Green
615 " 🔴 Biome Lint Blocked Commit: contract-migrations.json Has Incorrect Indentation
616 4:32p 🔴 Biome Auto-fixed contract-migrations.json Indentation — File Needs Re-staging
### Jul 3, 2026
617 2:11p ⚖️ CERMONT Spec-013: Master Plan for Critical Gap Closure Post Spec-009/010/011
618 " 🔵 Codex Agent Execution Environment: OMO 4.14.0 + Superpowers 6.1.0 Plugin Stack Loaded
619 2:12p ⚖️ CERMONT Spec-013 — Anti-Hallucination Audit-First Strategy Adopted
620 " 🔵 CERMONT Spec-013 Target Features: Cost Intelligence + Kit Readiness Gate
### Jul 4, 2026
621 1:16a 🔵 TypeScript Baseline Error Fix Task Initiated

Access 2583k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>