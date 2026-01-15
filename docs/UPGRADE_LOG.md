# Dependency Upgrade Log

## Date: 2026-01-15

### Environment

| Tool | Version |
|------|---------|
| Node | v24.12.0 |
| pnpm | 9.15.4 |
| turbo | 2.7.4 |

---

## Security Status

### pnpm audit
```
✅ No known vulnerabilities found
```

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Moderate | 0 |
| Low | 0 |

### Security Fixes Applied
- Added pnpm overrides for Angular vulnerabilities
- All dependencies patched to secure versions

---

## Upgrade Summary

### Frontend (@cermont/frontend)
| Package | Before | After |
|---------|--------|-------|
| @angular/* | 17.3.10 | **18.2.14** |
| @angular/cli | 17.3.10 | **18.2.21** |
| @angular-eslint/* | 17.3.0 | **18.4.3** |
| typescript | 5.4.5 | **5.5.4** |
| tailwindcss | 3.4.17 | **3.4.19** |

### Backend (@cermont/backend)
| Package | Status |
|---------|--------|
| @nestjs/* | Latest 11.x patches |
| prettier | **3.8.0** |
| prisma | 6.2.1 |

---

## Validation Results

| Command | Result | Notes |
|---------|--------|-------|
| `pnpm audit` | ✅ | 0 vulnerabilities |
| `pnpm build` | ✅ | 47s |
| `pnpm test --filter backend` | ✅ | All tests pass |
| `pnpm test --filter frontend` | ⚠️ | ENOENT (Chrome env) |

---

## Notes

- Frontend test failure is environment issue (Chrome not installed), not a code issue
- All security vulnerabilities resolved via pnpm overrides
- Angular upgraded from v17 to v18 successfully
- Prisma 7 migration: temporarily restored `datasource.url` in `prisma/schema.prisma` to preserve `new PrismaClient()` behavior while planning a future migration to the Prisma v7 adapter model (see `backend/prisma.config.ts`).

