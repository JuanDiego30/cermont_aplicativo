## 📊 Reporte de Auditoría - Cermont

### Estado Actual
- **Fecha auditoría**: 2026-01-05
- **Monorepo**: Turbo + pnpm
- **Backend Stack**: NestJS `11.1.11`, Prisma `5.22.0`, PostgreSQL (`pg`)
- **Frontend Stack**: Angular `21.0.6`, TailwindCSS `4.1.18`
- **Herramientas instaladas**: `eslint`, `prettier`, `jest`, `supertest`, `jscpd`, `@nestjs/swagger`, `@nestjs/throttler`, `@nestjs/cache-manager`, `helmet`, `compression`

**Scripts disponibles (root)**
- `build`, `dev`, `test`, `lint`, `typecheck`, `duplication`, `check`

**Scripts disponibles (apps/api)**
- `lint`, `typecheck`, `test`, `test:cov`, `test:e2e`, `prisma:*`, `check`

**Scripts disponibles (apps/web)**
- `lint`, `test`, `build`, `dev`

### Estructura Detectada
- **Backend módulos** (`apps/api/src/modules/*`):
  - `admin`, `alertas`, `archivado-historico`, `auth`, `certificaciones`, `checklists`, `cierre-administrativo`, `clientes`, `costos`, `dashboard`, `ejecucion`, `evidencias`, `facturacion`, `formularios`, `hes`, `kits`, `kpis`, `notifications`, `ordenes`, `pdf-generation`, `planeacion`, `reportes`, `sync`, `tecnicos`, `weather`
- **Patrón arquitectural**: DDD **parcial/mixto**.
  - Varios módulos ya están en `application/`, `domain/`, `infrastructure/` (ej. `auth/`, `ordenes/`).
  - Existe una capa `common/` bien definida (pipes, errors, interceptors, guards, dto, utils).
  - Coexiste una capa `shared/` (base classes, mappers, value-objects) que solapa responsabilidades con `common/` → principal fuente potencial de duplicación/deriva.
- **Tests**:
  - Backend: Jest con varias suites unitarias por módulo (hay `apps/api/coverage/*`).
  - Frontend: Karma/ChromeHeadless (actualmente parece haber 1 spec “dummy”).

### Checks ejecutados (estado actual)
- **Frontend**
  - `pnpm -C apps/web lint`: ✅ OK
  - `pnpm -C apps/web test`: ✅ OK (1 test)
- **Backend**
  - `pnpm -C apps/api check`: ❌ FALLA por 1 test
    - Falla: `LoginUseCase › login admin sin twoFactorCode retorna requires2FA y envía código` (espera `requires2FA === true`, recibe `undefined`).

### Métricas Iniciales
- **Duplicación (jscpd existente)**: **6.35%** (5533 líneas duplicadas / 87132 totales) – objetivo <3%.
  - Nota: el reporte actual incluye ruido por artefactos/caches (ej. `.angular/cache`) y ejemplos UI, lo que infla el % y debe filtrarse.
- **Cobertura backend (artifact existente)**: aprox.
  - Statements: **91.53%**
  - Branches: **81.82%**
  - Functions: **91.94%**
  - Nota: esto proviene de `apps/api/coverage/coverage-final.json` (no garantiza estado “verde” hoy porque `pnpm check` está fallando).

---

## Problemas Detectados (priorizados)

1. 🔴 **CRÍTICO – Secret/credenciales en repo (Regla 21)**
   - Archivo trackeado por git: `apps/api/.env.generation` contiene `DATABASE_URL` con credenciales.
   - Riesgo: exposición de credenciales en repositorio, rotación/ambientes inconsistentes.

2. 🔴 **CRÍTICO – Tests backend no están verdes (Reglas 5/Testing)**
   - Falla 1 test en `apps/api/src/modules/auth/__tests__/login.use-case.spec.ts`.
   - Impacto: CI inestable, refactor sin red de seguridad confiable.

3. 🟡 **ALTO – Duplicación >3% (Regla 1)**
   - jscpd reporta 6.35% global.
   - Principales focos: `apps/web/src/app/shared/components/ui-example/**` (ejemplos) + ruido por caches.

4. 🟡 **ALTO – Uso de `any` en mappers/persistence (Type-safety / GEMINI “sin any”)**
   - Ej: `apps/api/src/modules/checklists/infrastructure/persistence/checklist.prisma.mapper.ts` usa `raw: any` y `item: any`.
   - Impacto: deriva de contratos, errores en runtime, bajo soporte IDE.

5. 🟡 **ALTO – Implementaciones incompletas/errores explícitos en runtime**
   - Ej: `apps/api/src/modules/planeacion/planeacion.service.ts` expone un `findAll()` que lanza `Error("no implementado")`.
   - Impacto: endpoints/servicios rotos si se usan accidentalmente.

6. 🟢 **MEDIO – Regla 6 (No console.*) en tests y frontend logger**
   - Backend tests: `apps/api/test/setup.ts` usa `console.log`/`console.warn`.
   - Frontend: `apps/web/src/app/core/utils/logger.ts` envuelve `console.*` condicionado por `environment`.
   - Nota: en frontend esto puede aceptarse como “logger” central siempre que se bloquee en producción (ya lo hace), pero debe documentarse como excepción/regla.

7. 🟢 **MEDIO – Node runtime no-LTS detectado**
   - Se detectó `Node.js v25.2.1` (odd, no LTS). El root solo exige `>=20`, pero conviene estandarizar a LTS para CI y producción.

---

## Violaciones Reglas GEMINI (relevantes)
- **Regla 1 (No duplicar)**: jscpd total 6.35% (objetivo <3%).
- **Regla 5 (Try/catch & manejo consistente de errores)**: pendiente de validar por módulo; hay throw genéricos en servicios (`findAll()` no implementado).
- **Regla 6 (No console.log)**:
  - Violaciones en tests (setup) y en util de logger frontend.
- **Regla 21 (No secrets hardcoded/committed)**:
  - `apps/api/.env.generation` está trackeado.
- **Type-safety (“no any”)**:
  - `any` en mappers/persistence (ej. checklists).

---

## Plan de Refactorización Propuesto

### Sprint 1: Foundation (1 semana)
- **Objetivo**: repo “verde” + medición confiable (baseline real) + preparar capa común para deduplicación.
- **Alcance (archivos/módulos)**:
  - Fix test roto de `auth` (alinear lógica 2FA vs expectation).
  - Agregar configuración de jscpd para excluir caches/builds (`.angular`, `dist`, `coverage`, `node_modules`, `.turbo`).
  - Revisar `apps/api/src/common/**` vs `apps/api/src/shared/**` y definir “source of truth” (sin romper imports).
  - Remover/aislar `console.*` en `apps/api/test/setup.ts` (reemplazo por logger de tests o gating por env).
  - Seguridad: sacar del repo `apps/api/.env.generation` o convertirlo a `.env.example` seguro.
- **Tests requeridos**:
  - Backend: `pnpm -C apps/api test` verde.
  - Frontend: `pnpm -C apps/web lint test`.
- **Métricas objetivo**:
  - Duplicación: baseline recalculado solo `src/**` (sin caches) y objetivo <3%.

### Sprint 2: Core Modules (2 semanas)
- **Objetivo**: estabilizar `auth` + `ordenes` con DDD consistente y contracts type-safe.
- **Módulos**: `apps/api/src/modules/auth/**`, `apps/api/src/modules/ordenes/**`.
- **Acciones**:
  - Unificar flujos de login/2FA (use-cases + DTOs + tests).
  - Auditar N+1 en queries de órdenes (includes/select específicos).
  - Estándar de paginación (usar `common/dto/pagination.dto.ts` y/o `PaginationUtil`).

### Sprint 3: Deduplicación sistemática (1–2 semanas)
- **Objetivo**: bajar duplicación global real <3%.
- **Backend**: consolidar base classes/mappers/VOs entre `shared/` y `common/`.
- **Frontend**: evaluar si `ui-example/**` debe moverse/aislarse (o refactor a componentes reutilizables reales).

### Sprint 4: Performance + Security hardening (1–2 semanas)
- Cache in-memory (ya instalado), throttling global (ya instalado), compresión + helmet (ya instalado) con configuración consistente.
- Validación de env vars en startup (`ConfigModule.validate`).

---

## Alternativas Gratuitas Propuestas

| Necesidad | Alternativa Gratis | Dependencia |
|----------|---------------------|------------|
| Cache | CacheModule (memory) | `@nestjs/cache-manager`, `cache-manager` (ya instaladas) |
| Rate limiting | Throttler guard | `@nestjs/throttler` (ya instalada) |
| Logging | Pino / Nest Logger | `pino`, `pino-http` (ya instaladas) |
| Seguridad headers | Helmet | `helmet` (ya instalada) |
| Compresión | gzip middleware | `compression` (ya instalada) |
| Duplicación | jscpd con ignore correcto | `jscpd` (ya instalada) |

---

## Notas y Decisiones Pendientes (requiere validación humana)
1. ¿`apps/api/src/shared/**` se migra a `common/**` (y se elimina) o se mantiene como capa separada con fronteras claras?
2. Confirmar política de “no console.*” en frontend: ¿se acepta wrapper `logger.ts` (bloqueado en prod) o se reemplaza por servicio Angular?
3. Definir política de archivos de entorno: borrar `.env.generation` del repo y dejar solo `.env.example` seguro.
