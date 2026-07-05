# Workflow: Audit First

> Run this workflow **before modifying any code** in a new session or unfamiliar area.

---

## When to Use
- Starting a new feature.
- Picking up work after a break.
- Touching a module you haven't worked on recently.
- Responding to a bug report.

---

## Steps

### 1. Read the Task Brief
- What exactly needs to change?
- Which workspace does it touch: `backend`, `frontend`, `packages/shared-types`?
- Is it a new feature, a bug fix, a refactor, or a QA remediation?

### 2. Verify the Stack
```bash
# Check package.json to confirm versions and dependencies
cat package.json | grep '"next"\|"express"\|"mongoose"\|"zod"'
```
- Do NOT assume a library is available; check `package.json` first.
- If you need a new dependency, propose it explicitly to the user.

### 3. Read the Applicable Rule Files
```
.agents/rules/01-stack.md          # always
.agents/rules/02-architecture.md   # always
.agents/rules/03-frontend.md       # if touching frontend
.agents/rules/04-backend.md        # if touching backend
.agents/rules/05-security.md       # if touching auth/RBAC/cookies
.agents/rules/09-prohibitions.md   # always — before writing a single line
```

### 4. Read the Canonical DOC Files
For domain knowledge (schemas, endpoints, state machines):
- `docs/Intrucciones_para_crear_app_web/DOC-09` — data schemas
- `docs/Intrucciones_para_crear_app_web/DOC-10` — API contracts
- `docs/Intrucciones_para_crear_app_web/DOC-04` — security & RBAC

### 5. Scan the Relevant Module
```bash
# Find existing files in the module you'll touch
ls backend/src/controllers/
ls backend/src/services/
ls frontend/src/modules/<feature>/
```
- Read the existing controller, service, and model before writing anything.
- Match the local patterns and conventions.

### 6. Run the Current Test Suite
```bash
# Before touching anything, confirm what's already passing
npm run test -w backend
npm run test -w frontend
npm run typecheck
```
Record the baseline: how many tests pass, any pre-existing failures?

### 7. Run Quality Checks
```bash
npm run quality:strict    # identify existing issues before adding new code
```

### 8. Plan
- List the files you will create or modify.
- List the dependencies between them (what must exist first).
- Confirm the change is the smallest possible scope.

### 9. Get Confirmation (If the Change Is Broad)
If the change touches > 3 files or crosses module boundaries:
- Present the plan.
- Wait for confirmation before implementing.

---

## Stop Conditions
- **Stop immediately** if you discover the task contradicts a DOC or architecture rule.
- Report the contradiction; do not proceed until resolved.
- **Stop** if you cannot determine whether a dependency exists in `package.json`.
