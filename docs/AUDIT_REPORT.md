# 📊 Audit Report

**Generated:** 2026-01-16T07:07:18.084Z  
**Commit:** `c6bb472d`  
**Branch:** `feat/rename-backend-es-en-step1`  
**Author:** JuanDiego30

---

## ⚙️ Environment

| Variable | Value |
|----------|-------|
| **Node.js** | v24.12.0 |
| **pnpm** | 9.15.4 |
| **OS** | win32 |
| **Runner** | Local/Unknown |

---

## 📈 Summary

| Module | Status | Errors | Warnings | Details |
|--------|--------|--------|----------|---------|
| **Backend Lint** | ⏳ | - | - | See details below |
| **Frontend Lint** | ⏳ | - | - | See details below |
| **Type Check** | ⏳ | - | - | See details below |
| **Tests** | ⏳ | - | - | See details below |
| **Build** | ⏳ | - | - | See details below |
| **API Coherence** | ❌ | 41 | - | API calls vs Backend routes |

---

## 📋 Detailed Results

### 1. API Coherence Report

**Status:** ❌ FAIL  
**Execution Time:** 0.21s  
**Backend Routes:** 154  
**Frontend API Calls:** 41  
**Inconsistencies Found:** 41

#### ⚠️ Issues Found:

1. `/api/:param/:param`
   - File: `frontend/src/app/services/ordenes.service.ts:97`

2. `/api/:param/change-password`
   - File: `frontend/src/app/core/services/user.service.ts:54`

3. `/api/:param/profile`
   - File: `frontend/src/app/core/services/user.service.ts:64`

4. `/api/:param/avatar`
   - File: `frontend/src/app/core/services/upload.service.ts:27`

5. `/api/:param/register`
   - File: `frontend/src/app/core/services/auth.service.ts:82`

6. `/api/:param/login`
   - File: `frontend/src/app/core/services/auth.service.ts:96`

7. `/api/:param/forgot-password`
   - File: `frontend/src/app/core/services/auth.service.ts:122`

8. `/api/:param/reset-password`
   - File: `frontend/src/app/core/services/auth.service.ts:131`

9. `/api/:param/2fa/enable`
   - File: `frontend/src/app/core/services/auth.service.ts:140`

10. `/api/:param/2fa/verify`
   - File: `frontend/src/app/core/services/auth.service.ts:149`

### 2. Linting Results

⏳ Linting report not available yet.

### 3. Type Checking

⏳ Type checking report not available yet.

### 4. Tests Results

⏳ Test report not available yet. Run tests to generate.

### 5. Build Status

⏳ Build report not available yet.

---

## 📚 Additional Resources

- **Quick Start:** [QUICK_START_AUDIT.md](../QUICK_START_AUDIT.md)
- **Complete Guide:** [docs/AUDIT_GUIDE.md](AUDIT_GUIDE.md)
- **Findings Analysis:** [docs/AUDIT_FINDINGS_ANALYSIS.md](AUDIT_FINDINGS_ANALYSIS.md)
- **Team Guide:** [TEAM_AUDIT_GUIDE.md](../TEAM_AUDIT_GUIDE.md)
- **System Diagram:** [AUDIT_SYSTEM_DIAGRAM.md](../AUDIT_SYSTEM_DIAGRAM.md)

---

## ⚠️ Known Issues & Recommendations

### API Coherence Script

**Note:** Initial run detected 41 inconsistencies. These may include false positives due to:
- Dynamic route parameters (:/userId, /:id, etc.)
- Template strings (${variable})
- Normalization of all :param to :param

**Recommendation:** Review `docs/AUDIT_FINDINGS_ANALYSIS.md` for detailed analysis.

### ESLint Configuration

**Note:** May require `globals` package:
```bash
cd backend && pnpm add -D globals
```

---

**Report Generated:** 1/16/2026, 2:07:18 AM  
**Duration:** Check individual sections above
