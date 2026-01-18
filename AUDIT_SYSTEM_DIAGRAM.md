# 🔄 Flujo del Sistema de Auditoría

## 1️⃣ FLUJO LOCAL (Ejecución Manual)

```
Developer runs: pnpm run audit:full
        ↓
┌──────────────────────────────────────────┐
│ 1. audit:local                           │
│  - pnpm run lint                         │
│  - pnpm exec jscpd                       │
│  - node check-api-consistency.js         │
│  - pnpm audit --prod                     │
└──────────────────────────────────────────┘
        ↓ Genera logs en audit/ folder
┌──────────────────────────────────────────┐
│ 2. audit:report                          │
│  - node generate-audit-report.mjs        │
└──────────────────────────────────────────┘
        ↓ Lee logs y consolida
┌──────────────────────────────────────────┐
│ 3. Salida                                │
│  📁 audit/                               │
│  ├── lint-*.log                          │
│  ├── typecheck-*.log                     │
│  ├── test-*.log                          │
│  ├── build-*.log                         │
│  └── api-consistency-report.json         │
│                                          │
│  📄 docs/AUDIT_REPORT.md                │
│  (Markdown consolidado legible)          │
└──────────────────────────────────────────┘
        ↓
    Developer revisa logs y reporte
    ✅ Fix issues o merge
```

---

## 2️⃣ FLUJO GITHUB ACTIONS (Automático)

```
Developer: git push origin main
        ↓
GitHub Events:
├── push [main, master, chore/*]
├── pull_request [main, master]
├── workflow_dispatch (manual)
└── schedule (domingo 2 AM UTC)
        ↓
┌──────────────────────────────────────────────────────────┐
│ Workflow: Quality & Security Audit Report                │
│ Environment: ubuntu-latest, Node 20, pnpm 9              │
└──────────────────────────────────────────────────────────┘
        ↓
┌─ SETUP PHASE ─────────────────────────────────────────┐
│ 1. Checkout code                                      │
│ 2. Setup Node + pnpm                                  │
│ 3. Install deps + cache                               │
│ 4. Generate Prisma Client                             │
└───────────────────────────────────────────────────────┘
        ↓
┌─ AUDIT PHASE ─────────────────────────────────────────┐
│ 5. Lint Backend       → audit/lint-backend.log        │
│ 6. Lint Frontend      → audit/lint-frontend.log       │
│ 7. Type Check Back    → audit/typecheck-backend.log   │
│ 8. Type Check Front   → audit/typecheck-frontend.log  │
│ 9. Build Backend      → audit/build-backend.log       │
│ 10. Build Frontend    → audit/build-frontend.log      │
│ 11. Duplication (JSCPD) → audit/duplication.log      │
│ 12. API Coherence     → audit/api-consistency.log     │
│ 13. Security Audit    → audit/security-audit.log      │
│ 14. Outdated Deps     → audit/outdated.log            │
│ 15. Backend Tests     → audit/test-backend.log        │
│ 16. Frontend Tests    → audit/test-frontend.log       │
└───────────────────────────────────────────────────────┘
        ↓
┌─ REPORTING PHASE ────────────────────────────────────┐
│ 17. Generate report   → docs/AUDIT_REPORT.md         │
│ 18. Upload artifacts  → GitHub artifacts storage      │
│ 19. Post PR comment   → (si es PR)                    │
└───────────────────────────────────────────────────────┘
        ↓
    GitHub Actions completed
    ├── Artifacts available (30 days)
    ├── PR comment published (if PR)
    └── Logs viewable in Actions tab
```

---

## 3️⃣ ESTRUCTURA DE DATOS

### Input Scanning

```
Backend Controllers:
  backend/src/modules/*/controllers/*.controller.ts
    ↓ Extract @Controller + @Get/@Post/@Put/@Delete/@Patch

  Example:
  @Controller('auth')
  class AuthController {
    @Post('login')        → /api/auth/login
    @Post('register')     → /api/auth/register
    @Get('profile/:id')   → /api/auth/profile/:id
  }

Frontend API Calls:
  frontend/src/**/*.ts
    ↓ Extract http.get/post, fetch, axios calls

  Example:
  this.http.post('/api/auth/login', ...)  → /api/auth/login
  fetch('/api/auth/register', ...)         → /api/auth/register
```

### Processing

```
1. Normalize URLs
   /api/auth/login/:id   → /api/auth/login/:param
   /api/:module/:endpoint → /api/:param/:param

2. Compare Sets
   Backend routes (154 total)
   Frontend calls (41 total)
   Inconsistencies (41 found in first run)

3. Generate Report
   YAML frontmatter + sections + details
   → docs/AUDIT_REPORT.md
```

### Output Files

```
audit/
├── lint-backend.log              # ESLint output
├── lint-frontend.log             # Angular ESLint output
├── typecheck-backend.log         # TSC errors
├── typecheck-frontend.log        # NG type check
├── build-backend.log             # NestJS build
├── build-frontend.log            # Angular build
├── test-backend.log              # Jest output
├── test-frontend.log             # Karma/Jasmine output
├── api-consistency.log           # Custom script output
├── api-consistency-report.json   # Structured data
├── security-audit.log            # pnpm audit output
├── duplication.log               # JSCPD output
├── jscpd-report.html             # Visual HTML report
└── outdated.log                  # pnpm outdated output

docs/
└── AUDIT_REPORT.md               # Final consolidated report
```

---

## 4️⃣ HERRAMIENTAS UTILIZADAS

| Herramienta             | Propósito                | Output                                           |
| ----------------------- | ------------------------ | ------------------------------------------------ |
| **ESLint**              | Linting Backend          | lint-backend.log                                 |
| **Angular ESLint**      | Linting Frontend         | lint-frontend.log                                |
| **TypeScript Compiler** | Type checking            | typecheck-\*.log                                 |
| **NestJS CLI**          | Backend build            | build-backend.log                                |
| **Angular CLI**         | Frontend build           | build-frontend.log                               |
| **Jest**                | Backend tests            | test-backend.log                                 |
| **Karma/Jasmine**       | Frontend tests           | test-frontend.log                                |
| **JSCPD**               | Code duplication         | duplication.log, jscpd-report.html               |
| **Custom Script**       | API coherence            | api-consistency.log, api-consistency-report.json |
| **pnpm audit**          | Security vulnerabilities | security-audit.log                               |
| **pnpm outdated**       | Dependency versions      | outdated.log                                     |
| **Custom Node Script**  | Report generation        | AUDIT_REPORT.md                                  |

---

## 5️⃣ DECISIONES DE DISEÑO

### ✅ Continuity on Error

```yaml
continue-on-error: true
```

**Por qué:** No queremos que un warning de lint bloquee todo el workflow.  
Cada paso se ejecuta independently y se reporta en el documento final.

### ✅ Artifact Storage

```yaml
retention-days: 30
```

**Por qué:** Historial auditable. Mantener 30 días de logs para debugging.

### ✅ PR Comments

```javascript
github.rest.issues.createComment(...)
```

**Por qué:** Feedback inmediato sin dejar GitHub.

### ✅ Scheduled Execution

```yaml
schedule:
  - cron: '0 2 * * 0'
```

**Por qué:** Auditoría semanal sin necesidad de manual trigger.

### ✅ Modular Scripts

Cada script es independiente:

- `check-api-consistency.js` - Puede ejecutarse solo
- `generate-audit-report.mjs` - Puede ejecutarse solo
- `verify-audit-setup.js` - Puede ejecutarse solo

**Por qué:** Reutilizable en diferentes contextos (local, CI, dashboard, etc).

---

## 6️⃣ ESTADÍSTICAS ESPERADAS

Después de primera auditoría:

```
┌─────────────────────────────────────────────┐
│ Backend Routes:        154                  │
│ Frontend API Calls:     41                  │
│ Inconsistencies:        41                  │
│ Code Duplication:       TBD                 │
│ Security Issues:        TBD                 │
│ Lint Errors/Warnings:   TBD                 │
│ Type Errors:            TBD                 │
│ Test Failures:          TBD                 │
│ Build Issues:           TBD                 │
└─────────────────────────────────────────────┘
```

Los valores TBD se llenarán con ejecuciones posteriores.

---

**Diagrama actualizado:** 16 de enero de 2026
