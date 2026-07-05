# CODEX TASK TEMPLATE

## Purpose

Every Codex task in this repository must follow this structure. It ensures the agent reads the right docs, respects scope boundaries, and delivers verifiable results.

---

## Task Template

```markdown
## Task

[Describe the exact task. One sentence. Be specific.]

## Scope

### Allowed
- backend/src/[module]/[file]
- frontend/src/modules/[module]/[file]
- packages/shared-types/src/schemas/[schema]

### Forbidden
- package.json
- package-lock.json
- docker/
- .github/
- backend/src/config/db.ts
- frontend/proxy.ts

## Canonical Docs to Read First

1. docs/README.md
2. docs/domain/CERMONT_BUSINESS_FLOW_MAP.md
3. docs/architecture/API_ENDPOINT_MATRIX.md
4. docs/architecture/FRONTEND_ROUTE_MAP.md

## Required Baseline (Run Before Editing)

```bash
git status --short
npm run typecheck
npm run lint
npm run test
```

## Implementation Rules

- Work by vertical slice: contract → backend → frontend → tests → gates
- Do not duplicate modules, schemas, roles, or routes
- Do not create apps/
- Do not use any/unknown escape hatches
- Do not modify package-lock.json

## Required Final Validation

```bash
npm run ghost:check
npm run contracts:check
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
npx react-doctor@latest
```

## Final Report Format

```
Task completed: [yes/no]
Files modified:
Files created:
Files deleted:
Tests executed:
Gates result (typecheck / lint / test / build / verify / react-doctor):
Known pending issues:
Deploy verdict:
```
```

---

## Example Filled Task

```markdown
## Task

Create the ServiceEntrySheet module: schema, backend endpoints, and frontend page.

## Scope

### Allowed
- packages/shared-types/src/schemas/service-entry-sheet.schema.ts
- backend/src/routes/ses.routes.ts
- backend/src/controllers/ses.controller.ts
- backend/src/services/ses.service.ts
- backend/src/models/ses.model.ts
- frontend/src/modules/service-entry-sheets/

### Forbidden
- package.json
- package-lock.json
- backend/src/config/db.ts
- frontend/proxy.ts

## Canonical Docs to Read First

1. docs/domain/CERMONT_BUSINESS_FLOW_MAP.md — Section 11: ServiceEntrySheet
2. docs/architecture/API_ENDPOINT_MATRIX.md — SES section
3. docs/architecture/FRONTEND_ROUTE_MAP.md — Routes 27-28

## Required Baseline

[output of git status --short]
[output of npm run typecheck]

## Implementation Rules

- Contract-first: Zod schema → Mongoose model → service → controller → route → frontend
- 5 endpoints required (see matrix)
- 2 pages: /billing/ses and /billing/ses/[id]
- RBAC: gerente, residente, HES, administrativo for create; cliente for approve
- Audit: all mutations
- States: loading, error, empty

## Required Final Validation

[npm run verify output]
[npx react-doctor@latest output]

## Final Report Format

Task completed: yes
Files modified: 0
Files created: ses.schema.ts, ses.routes.ts, ses.controller.ts, ses.service.ts, ses.model.ts, frontend module
Files deleted: 0
Tests executed: npm run test -w backend -- ses.service.test.ts
Gates result: typecheck ✅ | lint ✅ | test ✅ | build ✅ | verify ✅ | react-doctor 100/100
Known pending issues: none
Deploy verdict: ready
```
