# CODEX REFACTOR PROTOCOL

## Purpose

This protocol defines how to safely refactor Cermont code without breaking existing functionality, introducing regressions, or violating architecture rules.

---

## Phase 1: Capture Baseline

Before touching any code:

```bash
# Capture full state
git status --short > baseline-status.txt
npm run typecheck > baseline-typecheck.txt 2>&1
npm run lint > baseline-lint.txt 2>&1
npm run test > baseline-test.txt 2>&1
npm run build > baseline-build.txt 2>&1
npx react-doctor@latest > baseline-react-doctor.txt 2>&1
```

**Rule:** Never refactor if baseline gates are not green. Fix first, then refactor.

---

## Phase 2: Identify Real Rendered/Imported Files

Before refactoring a module, verify what actually needs to change:

```bash
# Find all imports of a module
rg "from.*['\"]\..*module-name" --type ts --type tsx

# Find all usages of a component
rg "<ComponentName" --type tsx

# Check if a file is dead code (no imports anywhere)
rg "from.*['\"].*file-name" --type ts --type tsx
```

**Rule:** Never refactor files that aren't actually imported. Delete dead code separately.

---

## Phase 3: Check for Duplicates

Before creating new modules or components:

```bash
# Search for similar schemas
rg "export const.*Schema.*=.*z\." packages/shared-types/src/schemas/

# Search for similar services
rg "export.*class.*Service|export.*function.*create|export.*function.*update" backend/src/services/

# Search for similar components
rg "export.*function.*Button|export.*function.*Card|export.*function.*Dialog" frontend/src/components/
```

**Rule:** If a similar module/schema/component exists, extend it. Never duplicate.

---

## Phase 4: Refactor in Small Batches

### Batch Size Limits
| Scope | Max per Batch |
|-------|--------------|
| Zod schemas | 1 schema group |
| Backend services | 1 service |
| Backend controllers | 1 controller |
| Backend routes | 1 route file |
| Frontend pages | 1 page family (list + detail) |
| Frontend components | 1 component + its variants |
| Shared types | 1 contract group |

### Batch Workflow
```
1. Make the change (single file or small group)
2. npm run typecheck -w <workspace>
3. npm run lint -w <workspace>
4. npm run test -w <workspace> -- <specific test>
5. If green → commit or continue to next batch
6. If red → fix before continuing
```

**Rule:** Never batch multiple independent refactors. One concern per batch.

---

## Phase 5: Run Workspace Gates

After each workspace change:

### Backend
```bash
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
```

### Frontend
```bash
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npx react-doctor@latest
```

### Shared Types
```bash
npm run typecheck -w @cermont/shared-types
npm run build -w @cermont/shared-types
npm run contracts:check
```

---

## Phase 6: Run Root Gates

After all batch changes are complete:

```bash
npm run ghost:check
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
npx react-doctor@latest
```

---

## Phase 7: Update Documentation

If behavior changed:
- Update the relevant canonical doc in `docs/`
- Update `FRONTEND_ROUTE_MAP.md` if routes changed
- Update `API_ENDPOINT_MATRIX.md` if endpoints changed
- Update `CERMONT_BUSINESS_FLOW_MAP.md` if entity/state changed

---

## Phase 8: Report Honestly

Use `docs/agents/CODEX_FINAL_REPORT_TEMPLATE.md` format. Include real gate output. Never fabricate "all green."

---

## Stop Conditions

Stop the refactor and report immediately if:

1. **package-lock.json changes unexpectedly** — agent may have triggered an npm install
2. **`apps/` directory appears** — catastrophic regression to legacy structure
3. **Duplicate module detected** — merge, don't create second copy
4. **Gate fails and cause is unclear** — don't guess; investigate or ask
5. **Implementation requires business decision** — don't invent business rules
6. **Two canonical docs contradict each other** — flag for documentation update
7. **More than 3 files changed without a gate passing** — batch is too large

---

## Pre-Refactor Checklist

Before any refactor, answer:

- [ ] Is this file actually imported anywhere?
- [ ] Is there another module doing the same job?
- [ ] Is there an existing Zod contract for this?
- [ ] Is there an existing backend endpoint?
- [ ] Is there an existing frontend route?
- [ ] Is there an existing test?
- [ ] Is there documentation for this module?
- [ ] Will this change break any contract?
- [ ] Will this change orphan any route?
- [ ] Will this change leave a sidebar link pointing to 404?

If any answer is "I don't know" → investigate before refactoring.
