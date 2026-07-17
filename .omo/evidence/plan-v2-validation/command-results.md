# Command Results — Plan v2 Audit

## Git Safety
- git status: 287 modified, 0 staged, 854+ untracked
- git rev-parse HEAD: 244626c5f05fa353076254c968bfb1c3d6b42112
- git diff --stat: 287 files changed, 39173 insertions(+), 25348 deletions(-)
- git branch: plan/contract-first-masterplan-v6
- No destructive commands executed

## Environment
- Node: v24.12.0
- npm: 11.15.0
- OS: Microsoft Windows 11 Pro
- Date: 2026-07-12 10:31:35 COT

## Quality Gates

### npm run typecheck
- Duration: 66.84s
- Exit: 0
- Result: 7 successful, 7 total
- Packages: @cermont/backend, @cermont/config, @cermont/domain, @cermont/frontend, @cermont/shared-types

### npm run lint
- Duration: 8.99s
- Exit: 0
- Result: 7 successful, 7 total
- Note: Frontend/backend use `biome lint .` not `biome check .`

### npm run test
- Frontend: 93 files, 487 passed, 64.67s
- Backend: 102 files, 688 passed, 29.97s
- Shared-types: 32 files, 183 passed, 3.56s

### npm run build
- Duration: 63.80s
- Exit: 0
- Result: 5 successful, 5 total
- Frontend: 97 routes (96 dynamic, 1 static)
- Serwist: 245 precache entries (7310.67 KiB)

### npm run contracts:check
- Exit: 0
- Snapshot hash: sha256:ed8e751325e7db58346bd6237d6068845e68412170b2349ec9a989bdb581b33e
- Latest migration: 078-payment-dashboard-aging-report

### npm run quality:strict
- weak-tokens: 3028 findings within baseline
- language: 2839 Spanish tokens within baseline
- semantics: 0 findings
- routes: 0 findings
- dtos: 12 local DTOs (baseline 45)
- zero: 0 violations
- lint-residue: 0 findings
- service-size: 1 finding (dashboard.service.ts 532 lines)
- env: PASS
- hardcoded-roles: 0 violations

### npx react-doctor@latest --verbose
- Score: 76/100 (Needs work)
- Target: 95/100
- Regression from historical 100/100
