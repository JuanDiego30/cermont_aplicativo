# Draft: Professionalization Refactor — CERMONT S.A.S.

## Requirements (confirmed from master prompt)
1. Full professionalization of the CERMONT web application from academic to commercial grade
2. 9 implementation phases: Audit → Design System → Vehicles → Evidence Camera → Notifications → Checklists → Workflow Cockpit → E2E Testing → Documentation
3. No breaking changes to existing functionality, contracts, RBAC, auth, PWA, or offline
4. Mobile-first, offline-first, contract-first approach
5. TypeScript strict - zero `any`, zero `unknown`, zero `null`, zero `undefined`

## Technical Decisions
- Stack remains: Next.js 16 + Express 5 + Mongoose + MongoDB + Tailwind 4 + TanStack Query + Zustand
- All new schemas in `packages/shared-types/src/schemas/`
- All new backend modules in `backend/src/modules/`
- All new frontend modules in `frontend/src/modules/`
- Design system tokens in existing Tailwind config + CSS variables
- Existing fleet/evidence/checklist/notifications modules will be enhanced, not replaced

## Current State (verified 2026-06-19)
- 53 backend modules existing
- 40 frontend modules existing
- Fleet module: backend (controller, routes, service) + frontend (api, queries) - needs photo docs and readiness gates
- Evidence module: backend (2 controllers, routes, services) - needs camera capture component, offline, validation flow
- Checklist module: backend (controller, routes, service) - needs templates, execution, blocking logic, mobile UI
- Notifications module: backend (controller, service, routes) - needs bell UI, notification page, event generators
- All verification passes: typecheck, lint, build, test, quality gates, react-doctor 100/100

## Scope Boundaries
- IN: Enhance existing modules (fleet, evidence, checklist, notifications), design system standardization, workflow cockpit, E2E testing
- OUT: No stack changes, no new database, no replacing existing functionality without improvement
- OUT: No middleware.ts (proxy.ts is the security perimeter)
- OUT: No NestJS, Prisma, PostgreSQL, Auth.js, pnpm/yarn

## Open Questions
- What is the priority order of the 9 phases? User specified them in order, assume sequential.
- Does the user want the FSM/CMMS benchmark document created as part of the plan?
