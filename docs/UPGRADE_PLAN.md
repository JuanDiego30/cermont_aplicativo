# Dependency Upgrade Plan

## Date: 2026-01-15
## Strategy: Staged Rollout with Test Gates

---

## Executive Summary

This plan upgrades dependencies in **3 stages** with mandatory test gates between each stage. Total estimated time: 2-3 hours.

**Rollback Point:** `git checkout pre-upgrade-20260115`

---

## Stage 1: Security Patches & Patch/Minor Updates (LOW RISK)

### 1.1 Backend Security Fix (PRIORITY)
```bash
pnpm -C backend add nodemailer@^7.0.12
```
- **Fixes:** DoS vulnerability GHSA-rcmh-qjqh-p98v

### 1.2 Backend Patch/Minor Updates
```bash
pnpm -C backend add socket.io@^4.8.3 prettier@^3.8.0
pnpm -C backend add -D eslint-plugin-prettier@^5.5.5
```

### 1.3 Remove Deprecated @types
```bash
pnpm -C backend remove @types/bcryptjs @types/uuid @types/sanitize-filename
```
- These packages now include own TypeScript declarations

### 1.4 Root Monorepo
```bash
pnpm add -w -D prettier@^3.8.0
```

### ✅ TEST GATE 1
```bash
pnpm -C backend build && pnpm -C backend test && pnpm -C backend lint
```

---

## Stage 2: Major Updates - Backend DevDependencies (MEDIUM RISK)

### 2.1 ESLint Ecosystem (Backend)

**Note:** ESLint 9.x has major config changes. Recommend staying on 8.x for now or migrate configs separately.

```bash
# If staying on ESLint 8 (recommended for stability):
# No changes needed

# If upgrading to ESLint 9:
pnpm -C backend add -D eslint@^9.39.2 @typescript-eslint/eslint-plugin@^8.53.0 @typescript-eslint/parser@^8.53.0 eslint-config-prettier@^10.1.8
# Requires migrating .eslintrc.* to eslint.config.js
```

### 2.2 supertest
```bash
pnpm -C backend add -D supertest@^7.2.2
```

### 2.3 @types/node
```bash
pnpm -C backend add -D @types/node@^22
pnpm -C frontend add -D @types/node@^22
```

### ✅ TEST GATE 2
```bash
pnpm -C backend build && pnpm -C backend test && pnpm -C backend lint
```

---

## Stage 3: Major Updates - Production Dependencies (HIGH RISK)

### 3.1 Prisma 6 → 7

**Pre-requisite:** Backup database before upgrade

```bash
pnpm -C backend add @prisma/client@^7.2.0
pnpm -C backend add -D prisma@^7.2.0
pnpm -C backend exec prisma generate
```

**Post-upgrade:**
- Run `prisma db push` or `prisma migrate dev` in dev environment
- Verify all database queries work correctly

### 3.2 @nestjs/config
```bash
pnpm -C backend add @nestjs/config@^4.0.2
```

### 3.3 uuid
```bash
pnpm -C backend add uuid@^13.0.0
```
- Check for API changes in v12/v13

### ✅ TEST GATE 3
```bash
pnpm -C backend build && pnpm -C backend test && pnpm -C backend lint
```

---

## Stage 4: Frontend Updates (SEPARATE SESSION RECOMMENDED)

### 4.1 TypeScript (within Angular 17 limits)
```bash
pnpm -C frontend add -D typescript@~5.4.5
```
- Already at max for Angular 17.x

### 4.2 Tailwind CSS 3.x → 4.x

**Major breaking changes - requires config migration**

```bash
# NOT recommended without dedicated testing
# Tailwind 4.x changes config format entirely
```

**Recommendation:** Stay on Tailwind 3.4.x until Angular upgrade

### 4.3 Zone.js
```bash
pnpm -C frontend add zone.js@~0.15.0
```
- Check Angular 17 compatibility first

### 4.4 Angular Upgrade (FUTURE)

Angular 17 → 18 should be a **separate project**:
```bash
ng update @angular/core@18 @angular/cli@18
ng update @angular-eslint/schematics@18
```

---

## Final Cleanup

### Dedupe Dependencies
```bash
pnpm dedupe
```

### Verify No Audit Issues
```bash
pnpm audit
```

### Full Validation
```bash
pnpm -C backend build && pnpm -C backend test
pnpm -C frontend build && pnpm -C frontend test
```

---

## Recommended Execution Order

| Order | Action | Risk | Time |
|-------|--------|------|------|
| 1 | Stage 1.1: nodemailer security fix | Low | 5 min |
| 2 | Stage 1.2-1.4: Patches & deprecated types | Low | 10 min |
| 3 | TEST GATE 1 | - | 2 min |
| 4 | Stage 2.2-2.3: supertest, @types/node | Medium | 10 min |
| 5 | TEST GATE 2 | - | 2 min |
| 6 | Stage 3.1: Prisma upgrade | High | 15 min |
| 7 | Stage 3.2-3.3: @nestjs/config, uuid | Medium | 10 min |
| 8 | TEST GATE 3 | - | 2 min |
| 9 | Final cleanup & dedupe | Low | 5 min |

**Total Backend:** ~1 hour

---

## Deferred Items (Separate Sessions)

| Item | Reason |
|------|--------|
| ESLint 9.x migration | Requires config file format change |
| Angular 18+ upgrade | Major migration, requires dedicated sprint |
| Tailwind 4.x | Breaking config changes |

---

## Rollback Procedure

```bash
# If any stage fails:
git stash
git checkout pre-upgrade-20260115
pnpm install
```
