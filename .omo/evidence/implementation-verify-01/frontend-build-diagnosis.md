# Frontend Build Diagnosis — VERIFY-01

## Problem Reported
- Build error: "Next.js build worker exited with code: 4294967295"
- Occurred during `npm run verify` on previous session

## Root Cause Found
The error **4294967295** (= 0xFFFFFFFF = -1 signed) is a generic Windows process termination code. In this case, it was caused by:

**A stale `.next` lock from a previous build.** Next.js creates a build lock file in `.next/build-manifest.json` and when a concurrent build process is detected, the worker exits with this code.

Evidence:
- When running `npm run build -w frontend` in isolation: ✅ SUCCESS
- When running `npm run verify` (which chains build after test): ⚠️ FAILED with "Another next build process is already running"
- After cache cleanup (`Remove-Item -Recurse -Force frontend\.next`): ✅ SUCCESS

## Gates (before cleanup)

### Individual workspace
| Gate | Result |
|---|---|
| typecheck -w frontend | ✅ PASS |
| lint -w frontend | ✅ PASS (887 files, 0 issues) |
| test -w frontend | ✅ PASS (83 files, 411 tests) |
| build -w frontend | ✅ PASS (compiled in 10.3s, 96 pages) |

### Full verify (after cache cleanup)
| Gate | Result |
|---|---|
| verify:shared-types | ✅ PASS |
| verify:domain | ✅ PASS |
| verify:config | ✅ PASS |
| verify:backend | ✅ PASS |
| verify:frontend | ✅ PASS (typecheck + lint + test + build) |
| contracts:check | ✅ PASS |
| quality:strict | ❌ FAIL (4 pre-existing local DTO issues, NOT caused by this sprint) |
| doctor:verbose | ✅ 85/100 Great |

## Serwist / PWA
- 242 precache entries (6691.86 KiB) bundled successfully
- No Serwist-related errors in build output
- Service worker and sw.js map generated correctly

## Portal Pages
- portal/invoices: ✅ Static
- portal/orders: ✅ Static
- portal/orders/[id]: ✅ Dynamic
- portal/proposals: ✅ Static
- portal/service-cases: ✅ Static
- portal/service-cases/[id]: ✅ Dynamic
- portal/signatures/[id]: ✅ Dynamic

## Fix Applied
Cache cleanup only:
```
Remove-Item -Recurse -Force frontend\.next
Remove-Item -Recurse -Force .turbo
Remove-Item -Recurse -Force frontend\.turbo
```

No source code changes needed for frontend build stability.

## Recommendations
1. Add `.next/build-manifest.lock` or a pre-build cleanup to the verify script to prevent stale lock conflicts
2. Consider adding `Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue` before build in CI
3. The 4294967295 exit code is not a code bug — it's a Next.js lock contention on Windows
