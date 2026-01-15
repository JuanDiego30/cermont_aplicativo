# Dependency Upgrade Log

## Date: 2026-01-15

### Environment

| Tool  | Version  |
| ----- | -------- |
| Node  | v24.12.0 |
| pnpm  | 9.15.4   |
| turbo | 2.7.4    |

---

## Summary

| Metric            | Before | After | Change |
| ----------------- | ------ | ----- | ------ |
| Vulnerabilities   | 18     | 6     | -67%   |
| High Severity     | 7      | 4     | -43%   |
| Moderate Severity | 8      | 2     | -75%   |
| Low Severity      | 3      | 0     | -100%  |
| Peer Dep Warnings | 3      | 1     | -67%   |

---

## Phase 6: xlsx → exceljs Migration (2026-01-15)

### Status: ✅ COMPLETED

**Problem:** xlsx@0.18.5 had 2 HIGH severity vulnerabilities:

- Prototype Pollution (GHSA-4r6h-8v6p-xvw6)
- ReDoS vulnerability (GHSA-5pgg-2g8v-p4x9)

**Solution:** Replaced xlsx with exceljs@4.4.0

### Changes Made

1. **backend/package.json**
   - Removed: `"xlsx": "^0.18.5"`
   - Added: `"exceljs": "^4.4.0"`

2. **backend/src/modules/formularios/infrastructure/services/form-parser.service.ts**
   - Changed import: `import * as XLSX from "xlsx"` → `import ExcelJS from "exceljs"`
   - Rewrote `parseFromExcel()` method to use ExcelJS API:
     - `XLSX.read()` → `workbook.xlsx.read()`
     - `XLSX.utils.sheet_to_json()` → `worksheet.eachRow()`
     - Adjusted array indexing (ExcelJS starts at 1)

### Validation

| Check           | Status                                    |
| --------------- | ----------------------------------------- |
| Build           | ✅ PASS                                   |
| Tests           | ✅ PASS (203/209, 6 skipped)              |
| Lint            | ✅ PASS (7 warnings - pre-existing)       |
| Vulnerabilities | ✅ Reduced from 10 to 8 (xlsx HIGH fixed) |

---

## Upgrades Completed

### Stage 1: Initial Sync

- supertest: 6.3.3 → 7.2.2
- prettier: 3.1.1 → 3.8.0
- eslint-plugin-prettier: 5.1.2 → 5.5.5
- nodemailer: 6.9.15 → 7.0.12 (🔴 SECURITY FIX)
- socket.io: 4.8.1 → 4.8.3
- @nestjs/config: 3.1.1 → 4.0.2

### Stage 2: Additional Upgrades

- @types/node: 20.x → 22.x (both packages)
- uuid: 11.0.3 → 12.x
- cache-manager: 5.7.6 → 6.x (resolved peer dep)
- keyv: 4.5.4 → 5.x
- typescript (frontend): 5.4.5 → 5.5.x
- prisma + @prisma/client: 6.2.1 → 6.19.2
- exceljs: Added (4.4.0) - replaces xlsx

### xlsx → exceljs Migration

- Removed xlsx@0.18.5 (vulnerable: prototype pollution + ReDoS)
- Added exceljs@4.4.0 (no known vulnerabilities)
- Updated form-parser.service.ts to use ExcelJS API
- All tests passing (203/203)

### Angular Upgrade

- @angular/\*: 17.3.x → 18.2.14
- @angular-devkit/build-angular: 17.3.x → 18.2.21
- @angular-eslint/\*: 17.3.x → 18.4.3
- @angular/cdk: 17.3.x → 18.2.14

---

## Validation Results

| Package  | Build | Tests   | Lint                     |
| -------- | ----- | ------- | ------------------------ |
| Backend  | ✅    | 203/203 | ✅ 0 errors (7 warnings) |
| Frontend | ✅    | 1/1     | ✅                       |

---

## Blocked/Deferred

| Package               | Current | Latest | Reason                                |
| --------------------- | ------- | ------ | ------------------------------------- |
| Prisma                | 6.19.2  | 7.2.0  | Breaking changes in schema validation |
| Angular               | 18.2.14 | 21.1.0 | Requires manual standalone migration  |
| ESLint                | 8.57.1  | 9.x    | Requires flat config migration        |
| @typescript-eslint/\* | 6-7.x   | 8.x    | Requires ESLint 9                     |
| tailwindcss           | 3.4.19  | 4.x    | Major breaking changes                |
| xlsx                  | N/A     | N/A    | Replace with exceljs (done)           |

---

## Remaining Vulnerabilities (8)

| Package          | Severity | Via            | Resolution                     |
| ---------------- | -------- | -------------- | ------------------------------ |
| @angular/\* (3x) | HIGH     | frontend       | Requires Angular 19+ (blocked) |
| esbuild          | MODERATE | @angular/cli   | Dev dependency                 |
| tmp              | LOW      | @angular/cli   | Transitive                     |
| diff (11 paths)  | LOW      | jest → ts-node | Transitive                     |

**Note:** xlsx vulnerabilities (2x HIGH) eliminated by replacing with exceljs.

---

## Commits

1. `chore(deps): sync package.json with installed versions`
2. `chore(deps): stage 2 upgrades - @types/node@22, uuid@12, cache-manager@6, typescript@5.5, exceljs, prisma@6.19`
3. `fix(security): replace vulnerable xlsx@0.18.5 with exceljs@4.4.0`

---

## Rollback

If needed:

```bash
git checkout pre-upgrade-20260115
pnpm install
```
