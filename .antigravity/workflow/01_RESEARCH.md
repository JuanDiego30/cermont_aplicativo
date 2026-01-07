# 🧪 01_RESEARCH - Baseline del Repositorio (2025-01-07)

## Objetivo
Diagnosticar estructura profesional y áreas para refactorizar, priorizando seguridad y funcionalidad crítica.

## Scope Analizado
- Todo el monorepo: `apps/api`, `apps/web`, scripts, docs, CI/CD

## Baseline (Ejecutado)

### Linter
- **Resultado:** 8 warnings (0 errors)
- **Warnings:**
  - 7 importaciones restringidas en domain/** (usando NestJS/Prisma/Express en lugar de puertos)
  - 1 advertencia de ESLintRC deprecado (migrar a eslint.config.js)

### Typecheck
- **Resultado:** OK (sin errores)
- **Comando:** `pnpm -C apps/api run typecheck`

### Duplicación
- **Resultado:** ~90 clones detectados (1.50% de líneas duplicadas)
- **Archivos más afectados:**
  - `apps/api/src/modules/*/infrastructure/persistence/*-repository.ts` (mappers y builders)
  - `apps/api/src/modules/*/domain/entities/*.entity.ts` (métodos base)
  - `apps/web/src/app/features/*/*/components/*.component.ts` (código de UI)

## Hallazgos Críticos

### 1. Seguridad - Secretos (PR-SEC-001) - CRÍTICO

#### Fallbacks hardcodeados con credenciales
| Archivo | Línea | Problema |
|---------|-------|----------|
| `apps/api/prisma/verify-stats.ts` | 3 | `postgresql://postgres:admin@localhost:5432/cermont_fsm` |
| `apps/api/seed-test-user.ts` | 7-8 | `postgresql://postgres:admin@localhost:5432/cermont_fsm` |
| `apps/api/test-db.ts` | 6-7 | `postgresql://postgres:admin@localhost:5432/cermont_fsm` |

#### Credenciales expuestas en consolas
| Archivo | Línea | Problema |
|---------|-------|----------|
| `apps/api/prisma/seed_root.ts` | 23, 50 | Variable `passwordRaw` en código + console.log de password |
| `apps/api/seed-test-user.ts` | 19, 44 | Password en código + console.log |

### 2. Dashboard Frontend (PR-DASH-001) - ALTA

#### Problemas
- Dashboard muestra datos mock (0s en todas las métricas)
- No consume endpoint real del backend
- Menú lateral tiene rutas legacy no implementadas: "Forms", "Tables", "Pages"

## Estructura del Repositorio

### Monorepo (pnpm + Turborepo)
```
cermont_aplicativo/
├── apps/
│   ├── api/          # NestJS + Prisma + PostgreSQL
│   └── web/          # Angular 21+
├── .github/
│   └── workflows/ci-cd.yml
├── docs/prompts/
├── report/           # Reportes jscpd
└── docker-compose.yml
```

## Comandos Verificados

```bash
pnpm install --frozen-lockfile
pnpm run dev              # Arranca ambos
pnpm -C apps/api run dev  # Backend solo
pnpm run lint             # Lint en ambos
pnpm -C apps/api run typecheck
pnpm run test
pnpm run duplication      # jscpd
pnpm run check           # All checks
pnpm run build
```

## Estructura Profesional - Evaluación

### ✅ Bien
- Monorepo con Turborepo para build dev
- Separación clara apps/api y apps/web
- Lint y typecheck configurados
- CI/CD con GitHub Actions
- Prisma para ORM, NestJS modular en backend
- Angular signals, standalone components en frontend

### ⚠️ Mejoras Requeridas
- **Seguridad:** Eliminar secretos hardcodeados
- **Dashboard:** Conectar con backend real
- **Lint:** Arreglar 7 warnings de importaciones restringidas
- **Duplicación:** Refactor repos y mappers comunes
- **Formato:** Configurar Prettier global

## Siguiente
Ver `02_PLAN.md` para PRs priorizadas.
