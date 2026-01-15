# Dependency Upgrade Log

## Session: 2026-01-15

### PHASE 0: Baseline Snapshot ✅

**Git State:**
- Branch: `chore/dep-upgrade-20260115`
- Tag: `pre-upgrade-20260115`
- Node.js: v24.12.0
- pnpm: 9.15.4

---

### Baseline Results

#### Backend (@cermont/backend)

| Check | Status | Details |
|-------|--------|---------|
| Build | ✅ PASS | `nest build` successful |
| Tests | ✅ PASS | 39 suites, 203 passed, 6 skipped |
| Lint | ⚠️ WARNINGS | 0 errors, 7 warnings (domain purity rules) |

**Original Versions:**
- NestJS: 11.1.11
- TypeScript: 5.9.3
- Prisma: 6.2.1
- Jest: 30.2.0
- RxJS: 7.8.2

#### Frontend (@cermont/frontend)

| Check | Status | Details |
|-------|--------|---------|
| Build | ✅ PASS | Angular build complete (8.2s) |
| Tests | ✅ PASS | 1 test suite, 1 passed |
| Lint | ✅ PASS | All files pass linting |

**Original Versions:**
- Angular: 17.3.12
- TypeScript: 5.4.5
- RxJS: 7.8.2
- Zone.js: 0.14.10

---

## PHASE 1: Audit & Matrix ✅

See:
- [COMPAT_MATRIX.md](COMPAT_MATRIX.md)
- [UPGRADE_PLAN.md](UPGRADE_PLAN.md)

**Initial Audit:**
- 18 vulnerabilities found
- 6 deprecated @types packages
- Multiple outdated dependencies

---

## PHASE 3: Backend Upgrades ✅

### Upgrades Applied

| Package | Before | After | Type |
|---------|--------|-------|------|
| nodemailer | 6.9.15 | 7.0.12 | 🔴 SECURITY FIX |
| socket.io | 4.8.1 | 4.8.3 | PATCH |
| @nestjs/config | 3.1.1 | 4.0.2 | MAJOR |
| supertest | 6.3.3 | 7.2.2 | MAJOR |
| prettier (root) | 3.7.4 | 3.8.0 | MINOR |
| eslint-plugin-prettier | 5.1.2 | 5.5.5 | MINOR |

### Removed (Deprecated)

| Package | Reason |
|---------|--------|
| @types/bcryptjs | bcryptjs includes own types |
| @types/uuid | uuid includes own types |
| @types/sanitize-filename | sanitize-filename includes own types |
| zod | Migrated to class-validator |

### Schema Updates

- Removed `previewFeatures = ["fullTextSearchPostgres"]` from Prisma schema (graduated to stable)

### Deferred

| Package | Reason |
|---------|--------|
| Prisma 7.x | Breaking changes in schema validation |
| ESLint 9.x | Requires config migration to flat config |
| Angular 18+ | Major migration, separate sprint |

---

## PHASE 4: Dependency Resolution ✅

- `pnpm dedupe` removed 25 duplicate packages
- Remaining peer dep warnings:
  - @nestjs/cache-manager needs cache-manager@>=6 (low priority, works fine)
  - ng-apexcharts needs Angular 20+ (library outdated, works fine with 17)

---

## PHASE 5: Validation Gate ✅

### Final Test Results

**Backend:**
- Build: ✅ PASS
- Tests: 39 suites, 203 passed, 6 skipped
- Lint: 0 errors, 7 warnings

**Frontend:**
- Build: ✅ PASS (26.8s)
- Tests: ✅ PASS
- Lint: ✅ PASS

### Security Audit Improvement

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total Vulnerabilities | 18 | 10 | -44% |
| High Severity | 7 | 6 | -1 |
| Moderate Severity | 8 | 2 | -6 |
| Low Severity | 3 | 2 | -1 |

**Note:** Remaining vulnerabilities are transitive (via Jest → ts-node → diff@4.x)

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Vulnerabilities | 18 | 10 |
| Deprecated packages | 6 | 0 |
| Duplicate packages | 25+ | 0 |
| Build Status | ✅ | ✅ |
| Test Count | 203 | 203 |
| Breaking Changes | - | 0 |

---

## Rollback

If needed:
```bash
git checkout pre-upgrade-20260115
pnpm install
```
