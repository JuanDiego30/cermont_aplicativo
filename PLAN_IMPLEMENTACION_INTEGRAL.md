# 🚀 CERMONT: PLAN DE IMPLEMENTACIÓN INTEGRAL

**Status Actual:** 🔴 BUILD FAILING (23 errores TS)  
**Objetivo:** ✅ PRODUCTION READY (Score A-)  
**Duración Estimada:** 10-12 días laborales  
**Equipo Recomendado:** 2 desarrolladores

---

## 📋 ÍNDICE RÁPIDO

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Diagnóstico Detallado](#diagnóstico-detallado)
3. [Fases de Implementación](#fases-de-implementación)
4. [Tareas por Fase](#tareas-por-fase)
5. [Métricas de Éxito](#métricas-de-éxito)
6. [Timeline Visual](#timeline-visual)

---

## 📊 RESUMEN EJECUTIVO

### Problemas Críticos (Tier 1)

| ID  | Problema       | Errores   | Impacto    | Solución                        |
| --- | -------------- | --------- | ---------- | ------------------------------- |
| 1.1 | Decimal.js ESM | 12 TS2351 | 🔴 CRÍTICO | Wrapper dinámico + import async |
| 1.2 | Null/Undefined | 7 TS2322  | 🔴 CRÍTICO | Helper nullToUndefined()        |
| 1.3 | Dependencias   | 3 TS2307  | 🔴 CRÍTICO | pnpm add pdf-parse              |
| 1.4 | JWT Generics   | 6 TS2345  | 🔴 CRÍTICO | Adapter pattern                 |

### Plan Estratégico

```
SEMANA 1: ESTABILIZACIÓN (Build Verde)
├─ Fase 1: Fix 23 errores TypeScript
└─ Validación: pnpm build ✅

SEMANA 2: INTEGRACIÓN
├─ Fase 2: Shared Types (DRY Principle)
└─ Validación: Frontend + Backend con shared-types

SEMANA 2-3: ARQUITECTURA
├─ Fase 3: CQRS Piloto (Orders)
└─ Validación: Commands/Queries/Handlers funcionan

SEMANA 3: SEGURIDAD
├─ Fase 4: Typed Config
└─ Validación: Variables validadas en bootstrap

SEMANA 3-4: LIMPIEZA
├─ Fase 5: Eliminar duplicados (clientes/customers)
└─ Validación: Un único módulo de clientes

SEMANA 4: DOCUMENTACIÓN
├─ Fase 6: Tests + Docs + OpenAPI
└─ Validación: Coverage >70%, Docs completa

SEMANA 4: VALIDACIÓN FINAL
├─ Fase 7: Runbook + Docker + E2E
└─ Tag v1.0.0-alpha
```

**Riesgo Residual:** BAJO (arquitectura sólida, no refactor mayor)  
**Inversión:** ~80-100 horas  
**ROI:** Monorepo enterprise-ready, reducción deuda técnica 40%

---

## 🔴 DIAGNÓSTICO DETALLADO

### Errores Críticos por Módulo

#### 1.1 Decimal.js Import Failures (12 errores TS2351)

**Causa Raíz:**

- `decimal.js` es CommonJS con `module.exports`
- Backend usa ESM (`"type":"module"` en package.json)
- Import directo `import Decimal from 'decimal.js'` no resuelve correctamente

**Archivos Afectados:**

```
backend/src/modules/costos/
├── domain/value-objects/money.vo.ts (8 errores)
├── domain/value-objects/budget-limit.vo.ts (4 errores)
├── domain/value-objects/cost-variance.vo.ts (2 errores)
└── domain/services/cost-calculator.service.ts (2 errores)
```

**Solución:**

```typescript
// ✅ Crear wrapper ESM-safe
// backend/src/shared/utils/decimal.ts
export async function createDecimal(value: string | number) {
  const { default: Decimal } = await import('decimal.js');
  return new Decimal(value);
}

// ✅ O en VOs:
class Money {
  private decimal: any; // Type after dynamic import

  static async create(amount: string) {
    const { default: Decimal } = await import('decimal.js');
    return new Decimal(amount);
  }
}
```

---

#### 1.2 Null/Undefined Type Mismatch (7 errores TS2322)

**Causa Raíz:**

- Prisma retorna `string | null` para campos nullable
- DTOs definen como `string | undefined` (opcional)
- TypeScript estricto: `null !== undefined`

**Archivo Afectado:**

```
backend/src/modules/clientes/clientes.service.ts (líneas 257-271)
```

**Solución:**

```typescript
// ✅ Helper
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// ✅ Uso
return {
  direccion: nullToUndefined(cliente.direccion),
  telefono: nullToUndefined(cliente.telefono),
  contactos:
    cliente.contactos?.map(c => ({
      ...c,
      telefono: nullToUndefined(c.telefono),
    })) ?? [],
};
```

---

#### 1.3 Missing Dependencies (3 errores TS2307)

**Archivos Afectados:**

- `backend/src/modules/alerts/infrastructure/queue/notification-queue.service.ts` (bullmq)
- `backend/src/modules/notifications/email/email-queue.service.ts` (bullmq)
- `backend/src/modules/formularios/infrastructure/services/form-parser.service.ts` (pdf-parse)

**Solución:**

```bash
cd backend
pnpm add pdf-parse
pnpm add -D @types/bullmq  # Si falta
pnpm install
```

---

#### 1.4 JWT Generic Type Incompatibility (6 errores TS2345)

**Causa Raíz:**

- `JwtSignerPort<T>` define `verify<T>(token): T`
- `JwtService` retorna `object` (no generic)
- Interface no satisfecha

**Archivos Afectados:**

```
backend/src/modules/auth/
├── domain/ports/jwt-signer.port.ts
├── infrastructure/jwt.service.ts
└── __tests__/jwt-token.vo.spec.ts
```

**Solución:**

```typescript
// ✅ Port (actualizado)
export interface JwtSignerPort<T extends object = any> {
  sign(payload: T): string;
  verify<R extends object = any>(token: string): Promise<R>;
}

// ✅ Adapter (nuevo)
@Injectable()
export class NestJwtSignerAdapter implements JwtSignerPort {
  constructor(private jwtService: JwtService) {}

  verify<T extends object = any>(token: string): Promise<T> {
    return Promise.resolve(this.jwtService.verify(token) as T);
  }
}
```

---

### Problemas Secundarios (Tier 2)

#### 5. Librería Compartida Vacía

- **Impacto:** Duplicación Backend/Frontend (DTOs, Enums, Tipos)
- **Solución:** Rellenar `packages/shared-types/src/`

#### 6. Ambigüedad clientes/customers

- **Impacto:** Confusión, rutas inconsistentes, mantenimiento difícil
- **Solución:** Eliminar `customers/`, mantener `clientes/` (Spanish domain language)

---

## 🎯 FASES DE IMPLEMENTACIÓN

### FASE 1: ESTABILIZACIÓN BUILD (3 días)

**Objetivo:** Lograr `pnpm build` ✅ sin errores TS

**Tareas:**

```
1.1 Fix Decimal.js ESM imports
    ├─ Crear wrapper en backend/src/shared/utils/decimal.ts
    ├─ Actualizar 4 archivos en costos/
    └─ Tiempo: 1-2 horas

1.2 Fix null/undefined mapping
    ├─ Crear helpers en backend/src/shared/utils/mappers.ts
    ├─ Refactorizar clientes.service.ts
    └─ Tiempo: 1-2 horas

1.3 Install missing dependencies
    ├─ pnpm add pdf-parse
    ├─ pnpm add -D @types/bullmq
    └─ Tiempo: 30 minutos

1.4 Fix JWT generics
    ├─ Crear NestJwtSignerAdapter
    ├─ Actualizar jwt-signer.port.ts
    ├─ Actualizar tests en jwt-token.vo.spec.ts
    └─ Tiempo: 2-3 horas

1.5 Validar build verde
    ├─ pnpm clean && pnpm install
    ├─ pnpm build (0 errores)
    ├─ pnpm lint (0 errores críticos)
    ├─ pnpm test (pasar o marcar como TODO)
    └─ Tiempo: 1 hora
```

**Entregables:**

- ✅ Build sin errores TS
- ✅ Lint sin errores críticos
- ✅ Commit: "fix: resolve 23 TypeScript errors"

---

### FASE 2: INTEGRACIÓN SHARED-TYPES (2-3 días)

**Objetivo:** Backend + Frontend usan `@cermont/shared-types` como source of truth

**Tareas:**

```
2.1 Audit DTOs backend
    ├─ find backend/src/modules -name "*.dto.ts"
    ├─ Cruzar con packages/shared-types/src/dtos/
    ├─ Crear matriz: Local → Shared
    └─ Tiempo: 1 hora

2.2 Migrate backend DTOs
    ├─ Para cada DTO: DELETE local o MOVER a shared
    ├─ Actualizar imports en controllers/services
    ├─ Validar imports rotos
    └─ Tiempo: 2-3 horas

2.3 Audit interfaces frontend
    ├─ find frontend/src -name "*.model.ts" -o "*.interface.ts"
    ├─ Cruzar con shared-types
    ├─ Crear matriz: Local → Shared
    └─ Tiempo: 1 hora

2.4 Migrate frontend interfaces
    ├─ DELETE interfaces locales
    ├─ ADD imports desde @cermont/shared-types
    ├─ Verificar dependency en frontend/package.json
    └─ Tiempo: 2-3 horas

2.5 Centralizar enums y constantes
    ├─ Buscar enum duplicados (OrderStatus, ClienteType, etc.)
    ├─ Mover a packages/shared-types/src/enums/
    ├─ Actualizar imports (backend + frontend)
    └─ Tiempo: 1-2 horas

2.6 Validar integración
    ├─ pnpm build (todo pasa)
    ├─ Verificar node_modules/@cermont/shared-types
    ├─ Commit: "feat: shared-types integration complete"
    └─ Tiempo: 30 minutos
```

**Entregables:**

- ✅ Shared-types consumida por backend + frontend
- ✅ 0 DTOs duplicados
- ✅ Build verde
- ✅ Commit con cambios

---

### FASE 3: ARQUITECTURA CQRS PILOTO (3-4 días)

**Objetivo:** Implementar CQRS en módulo Orders como POC

**Tareas:**

```
3.1 Install @nestjs/cqrs
    ├─ cd backend && pnpm add @nestjs/cqrs
    ├─ Crear carpetas: commands/, queries/, handlers/
    └─ Tiempo: 30 minutos

3.2 Refactor CreateOrder → Command
    ├─ Crear CreateOrderCommand class
    ├─ Crear CreateOrderHandler (CommandHandler decorator)
    ├─ Inyectar CommandBus en controller
    ├─ Mover lógica de ordersService.create() → handler
    ├─ Publicar eventos de dominio
    └─ Tiempo: 2 horas

3.3 Refactor GetOrders → Query
    ├─ Crear GetOrdersQuery class
    ├─ Crear GetOrdersHandler (QueryHandler decorator)
    ├─ Inyectar QueryBus en controller
    └─ Tiempo: 1-2 horas

3.4 Refactor UpdateOrder → Command
    ├─ Crear UpdateOrderCommand class
    ├─ Crear UpdateOrderHandler
    ├─ Mantener validaciones y eventos
    └─ Tiempo: 1-2 horas

3.5 Unit tests para handlers
    ├─ Mock PrismaService, EventBus
    ├─ Assert persistencia + eventos
    ├─ Crear __tests__/handlers/
    ├─ Target: 80% coverage en handlers
    └─ Tiempo: 2-3 horas

3.6 Validar CQRS piloto
    ├─ pnpm build && pnpm test
    ├─ Orders module funciona completo
    ├─ Commit: "feat: CQRS architecture in Orders module"
    └─ Tiempo: 1 hora
```

**Entregables:**

- ✅ CreateOrderCommand/Handler funcionales
- ✅ GetOrdersQuery/Handler funcionales
- ✅ UpdateOrderCommand/Handler funcionales
- ✅ Unit tests para handlers (80% coverage)
- ✅ Commit con arquitectura CQRS

---

### FASE 4: CONFIGURACIÓN TIPADA (2-3 días)

**Objetivo:** Variables de entorno validadas al bootstrap

**Tareas:**

```
4.1 Install typed-config dependencies
    ├─ pnpm add nest-typed-config
    ├─ pnpm add class-validator class-transformer
    └─ Tiempo: 30 minutos

4.2 Create AppConfig class
    ├─ backend/src/config/app.config.ts
    ├─ Decoradores: @IsPort, @IsUrl, @IsEnum, @IsNumber
    ├─ Properties: NODE_ENV, PORT, DATABASE_URL, JWT_SECRET, etc.
    ├─ Validar en constructor
    └─ Tiempo: 1 hora

4.3 Integrate in AppModule
    ├─ ConfigModule.forRoot({schema: AppConfig}) global
    ├─ backend/src/app.module.ts
    └─ Tiempo: 30 minutos

4.4 Replace process.env in main.ts
    ├─ app.get(AppConfig)
    ├─ Usar config.PORT en lugar de process.env.PORT
    ├─ Usar config.DATABASE_URL en lugar de process.env.DATABASE_URL
    └─ Tiempo: 30 minutos

4.5 Update services to use typed config
    ├─ Buscar process.env en servicios clave
    ├─ Inyectar AppConfig
    ├─ Refactorizar auth.service, database.service, etc.
    └─ Tiempo: 2 horas

4.6 Validar configuración tipada
    ├─ Remover variable de .env
    ├─ Iniciar app → debe fallar con mensaje claro
    ├─ Restaurar .env → debe funcionar
    ├─ Commit: "feat: typed configuration with validation"
    └─ Tiempo: 1 hora
```

**Entregables:**

- ✅ AppConfig class tipada
- ✅ Variables validadas en bootstrap
- ✅ Servicios usan config inyectada
- ✅ Commit con typed config

---

### FASE 5: ELIMINACIÓN DUPLICADOS (1-2 días)

**Objetivo:** Un único módulo de clientes (Spanish domain language)

**Tareas:**

```
5.1 Audit clientes vs customers
    ├─ Listar endpoints en ambos módulos
    ├─ Determinar cuál está más completo
    ├─ Crear matriz: clientes (completo) vs customers (backup)
    └─ Tiempo: 30 minutos

5.2 Delete customers module
    ├─ rm -rf backend/src/modules/customers/
    ├─ grep -r "customers" backend/src → sin resultados
    └─ Tiempo: 30 minutos

5.3 Update app.module.ts imports
    ├─ CustomersModule → DELETE
    ├─ ClientesModule → MANTENER
    ├─ Import providers actualizados
    └─ Tiempo: 30 minutos

5.4 Update tests and fixtures
    ├─ Buscar imports de customers en tests
    ├─ Reemplazar por clientes
    ├─ Actualizar seeds/fixtures
    └─ Tiempo: 1 hora

5.5 Validar consolidación
    ├─ pnpm build && pnpm test
    ├─ No hay broken imports
    ├─ Commit: "refactor: consolidate clientes module"
    └─ Tiempo: 1 hora
```

**Entregables:**

- ✅ Módulo customers eliminado
- ✅ Módulo clientes consolidado
- ✅ Tests actualizados
- ✅ Commit con consolidación

---

### FASE 6: DOCUMENTACIÓN Y TESTING (2-3 días)

**Objetivo:** Coverage >70%, Documentación completa, OpenAPI specs

**Tareas:**

```
6.1 Audit current test coverage
    ├─ pnpm --filter @cermont/backend test -- --coverage
    ├─ Identificar módulos <50% coverage
    ├─ Priorizar: auth, orders, clientes, invoicing
    └─ Tiempo: 1 hora

6.2 Add missing unit tests
    ├─ Tests para handlers CQRS (Fase 3)
    ├─ Tests para utilidades (mappers, validators)
    ├─ Tests para DTOs y VOs críticos
    ├─ Target: 70% coverage backend
    └─ Tiempo: 3-4 horas

6.3 Add OpenAPI/Swagger decorators
    ├─ pnpm add @nestjs/swagger swagger-ui-express
    ├─ Decoradores @ApiOperation, @ApiResponse
    ├─ Decoradores en DTOs (@ApiProperty)
    ├─ Setup en main.ts (SwaggerModule)
    ├─ Resultado: /api/docs
    └─ Tiempo: 2-3 horas

6.4 Create architecture documentation
    ├─ docs/ARCHITECTURE.md
    ├─ Descripción de módulos (30+)
    ├─ CQRS pattern explicado
    ├─ Shared-types strategy
    ├─ Diagramas de flujo
    └─ Tiempo: 2 horas

6.5 Create API documentation
    ├─ docs/API.md o exportar OpenAPI spec
    ├─ Endpoints principales
    ├─ Request/response examples
    ├─ Error codes y descripciones
    └─ Tiempo: 2 horas

6.6 Create contribution guidelines
    ├─ docs/CONTRIBUTING.md
    ├─ Naming conventions
    ├─ How to add modules (step-by-step)
    ├─ Testing standards
    ├─ PR checklist
    └─ Tiempo: 1-2 horas

6.7 Final audit report
    ├─ docs/BENCHMARK_REPORT.md
    ├─ Antes/después vs lehcode/angular-fullstack-pro-starter
    ├─ Scores: Build ✅, Type Safety ✅, Testing 70%, Shared ✅, CQRS 🟡, Docs ✅
    ├─ Oportunidades futuras (Phase 2)
    └─ Tiempo: 1-2 horas
```

**Entregables:**

- ✅ Coverage >70% backend
- ✅ Swagger docs en /api/docs
- ✅ Documentación completa
- ✅ Benchmark report

---

### FASE 7: VALIDACIÓN FINAL (1-2 días)

**Objetivo:** Build completamente verde, Docker funcional, E2E básico

**Tareas:**

```
7.1 Full runbook execution
    ├─ pnpm clean && pnpm install
    ├─ pnpm --filter @cermont/backend build
    ├─ pnpm --filter @cermont/backend lint
    ├─ pnpm --filter @cermont/backend test --coverage
    ├─ pnpm --filter @cermont/frontend build
    ├─ Todos deben pasar sin warnings críticos
    └─ Tiempo: 1-2 horas

7.2 Docker build validation
    ├─ docker-compose build
    ├─ Verificar ambos servicios (backend, frontend)
    ├─ Revisar tamaño de imágenes
    └─ Tiempo: 30 minutos

7.3 E2E testing (manual)
    ├─ docker-compose up
    ├─ Test auth flow (login, token)
    ├─ Test crear orden (POST /api/orders)
    ├─ Test consultar clientes (GET /api/clientes)
    ├─ Acceder a /api/docs (Swagger)
    ├─ Frontend: navegar, crear datos
    └─ Tiempo: 1-2 horas

7.4 Create changelog
    ├─ CHANGELOG.md o resumen en Git
    ├─ Listar: Fixes (23 TS errors), Features (Shared Types, CQRS, Typed Config)
    ├─ Breaking changes (si aplica)
    └─ Tiempo: 30 minutos

7.5 Tag version and PR
    ├─ git tag v1.0.0-alpha
    ├─ git push --tags
    ├─ Crear PR a main
    ├─ Descripción clara de cambios
    └─ Tiempo: 30 minutos

7.6 Code review and merge
    ├─ Request reviews
    ├─ Resolver comentarios
    ├─ Merge a main cuando esté aprobado
    └─ Tiempo: Depends on reviewers
```

**Entregables:**

- ✅ Build 100% verde
- ✅ Docker funcional
- ✅ E2E básico pasado
- ✅ Changelog
- ✅ v1.0.0-alpha tagged

---

## 📈 MÉTRICAS DE ÉXITO

### Cuantitativos

| Métrica                  | Inicial | Objetivo | Status |
| ------------------------ | ------- | -------- | ------ |
| TypeScript Errors        | 23      | 0        | 🎯     |
| Build Time               | -       | <2min    | 🎯     |
| Test Coverage Backend    | 15%     | 70%+     | 🎯     |
| Test Coverage Frontend   | -       | 50%+     | 🎯     |
| Code Duplication         | HIGH    | LOW      | 🎯     |
| Modules with Docs        | 0       | 30+      | 🎯     |
| API Endpoints Documented | 0%      | 100%     | 🎯     |

### Cualitativos

- ✅ Build estable sin warnings críticos
- ✅ Arquitectura clara y documentada
- ✅ Type safety en 100% del código
- ✅ Patrón CQRS implementado (piloto)
- ✅ Configuración segura y validada
- ✅ Shared library reutilizable
- ✅ Documentación profesional

---

## 📅 TIMELINE VISUAL

```
┌─────────────────────────────────────────────────────────────────┐
│ SEMANA 1: ESTABILIZACIÓN (Build Verde)                          │
├─────────────────────────────────────────────────────────────────┤
│ L M X J V                                                       │
│ 1.1 → Decimal.js fix (1-2h)                                     │
│    1.2 → Null/undefined (1-2h)                                  │
│       1.3 → Deps (30m)                                          │
│          1.4 → JWT (2-3h) | 1.5 → Validate (1h)                │
│                                                                  │
│ ✅ DELIVERABLE: pnpm build ✅                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SEMANA 2: INTEGRACIÓN SHARED-TYPES                              │
├─────────────────────────────────────────────────────────────────┤
│ L M X J V                                                       │
│ 2.1 → Backend DTOs audit (1h)                                   │
│ 2.2 → Migrate backend DTOs (2-3h)                               │
│    2.3 → Frontend interfaces audit (1h)                         │
│    2.4 → Migrate frontend (2-3h)                                │
│       2.5 → Enums consolidation (1-2h)                          │
│          2.6 → Validate integration (30m)                       │
│                                                                  │
│ ✅ DELIVERABLE: Frontend + Backend con shared-types             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SEMANA 2-3: ARQUITECTURA CQRS                                   │
├─────────────────────────────────────────────────────────────────┤
│ L M X J V                                                       │
│ 3.1 → Install CQRS (30m)                                        │
│ 3.2 → CreateOrder Command (2h)                                  │
│ 3.3 → GetOrders Query (1-2h)                                    │
│ 3.4 → UpdateOrder Command (1-2h)                                │
│ 3.5 → Unit tests (2-3h)                                         │
│ 3.6 → Validate CQRS (1h)                                        │
│                                                                  │
│ ✅ DELIVERABLE: CQRS piloto funcional en Orders                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SEMANA 3: CONFIGURACIÓN + LIMPIEZA                              │
├─────────────────────────────────────────────────────────────────┤
│ L M X J V                                                       │
│ 4.1-4.6 → Typed Config (5-6h)                                   │
│          5.1-5.5 → Remove customers/ (3-4h)                     │
│                                                                  │
│ ✅ DELIVERABLE: Config tipada + Clientes consolidado            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SEMANA 4: DOCUMENTACIÓN + FINAL                                 │
├─────────────────────────────────────────────────────────────────┤
│ L M X J V                                                       │
│ 6.1-6.7 → Tests + Docs + OpenAPI (8-10h)                        │
│       7.1-7.6 → Final validation + merge (3-4h)                 │
│                                                                  │
│ ✅ DELIVERABLE: v1.0.0-alpha tagged, merged a main              │
└─────────────────────────────────────────────────────────────────┘

TOTAL: 10-12 días laborales | 80-100 horas
```

---

## 🔥 COMANDOS CLAVE POR FASE

### Fase 1: Estabilización

```bash
git checkout -b fix/build-green

# After fixes
pnpm clean
pnpm install
pnpm build            # Must pass: 0 errors
pnpm lint             # Must pass: 0 critical errors
pnpm test             # Run tests

git add .
git commit -m "fix: resolve 23 TypeScript errors"
```

### Fase 2: Shared Types

```bash
git checkout -b feat/shared-types-integration

# After migrations
pnpm build            # Must pass
pnpm test             # Must pass

git add .
git commit -m "feat: shared-types integration complete"
```

### Fase 3: CQRS

```bash
git checkout -b feat/cqrs-architecture

# After refactoring
cd backend
pnpm add @nestjs/cqrs

# After handlers + tests
pnpm build
pnpm test

git add .
git commit -m "feat: CQRS architecture in Orders module"
```

### Fase 4: Typed Config

```bash
git checkout -b feat/typed-configuration

# After AppConfig
cd backend
pnpm add nest-typed-config class-validator class-transformer

pnpm build
pnpm test

git add .
git commit -m "feat: typed configuration with validation"
```

### Fase 5: Limpieza

```bash
git checkout -b refactor/consolidate-clientes

# After deletion
rm -rf backend/src/modules/customers/

pnpm build
pnpm test

git add .
git commit -m "refactor: consolidate clientes module (remove customers)"
```

### Fase 6: Documentación

```bash
# After tests + docs + swagger

pnpm build
pnpm test --coverage

git add .
git commit -m "docs: tests, architecture, and API documentation"
```

### Fase 7: Validación Final

```bash
# Full runbook
pnpm clean && pnpm install
pnpm --filter @cermont/backend build
pnpm --filter @cermont/backend lint
pnpm --filter @cermont/backend test --coverage
pnpm --filter @cermont/frontend build

docker-compose build
docker-compose up  # Manual E2E test

git tag v1.0.0-alpha
git push --tags

# Create PR
git push origin feat/...
# Go to GitHub, create PR
```

---

## 📊 RIESGOS Y MITIGACIÓN

| Riesgo                    | Probabilidad | Impacto | Mitigación                           |
| ------------------------- | ------------ | ------- | ------------------------------------ |
| Regresión en Fase 1 fixes | MEDIA        | ALTO    | Unit tests después de cada fix       |
| Imports rotos en Fase 2   | MEDIA        | ALTO    | Grep recursivo pre-commit            |
| CQRS incompleto en Fase 3 | BAJA         | MEDIO   | POC solo en Orders, no scale todo    |
| Docker no compila         | BAJA         | MEDIO   | Test local before final push         |
| Merge conflicts           | BAJA         | BAJO    | Rebase early, push to main frecuente |

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### Fase 1: COMPLETA cuando

- ✅ `pnpm build` retorna exit code 0
- ✅ `pnpm lint` no tiene critical errors
- ✅ 0 TypeScript errors
- ✅ Commit mergeado a feat/build-green

### Fase 2: COMPLETA cuando

- ✅ Shared-types consumida por backend y frontend
- ✅ 0 DTOs duplicados entre modules y shared-types
- ✅ Imports actualizados en >90% de archivos
- ✅ Frontend + Backend compilación correcta

### Fase 3: COMPLETA cuando

- ✅ CreateOrderCommand/Handler funcionan
- ✅ GetOrdersQuery/Handler funcionan
- ✅ 80%+ coverage en handlers
- ✅ Orders module pasa todos los tests

### Fase 4: COMPLETA cuando

- ✅ AppConfig validado al bootstrap
- ✅ Si falta variable env → error claro
- ✅ Todos los servicios usan typed config
- ✅ `pnpm build` pasa

### Fase 5: COMPLETA cuando

- ✅ customers/ módulo eliminado
- ✅ 0 imports de 'customers' en el codebase
- ✅ clientes/ es el único módulo de clientes
- ✅ Tests pasan

### Fase 6: COMPLETA cuando

- ✅ Coverage backend >70%
- ✅ Swagger docs en /api/docs
- ✅ 4 documentos creados (ARCHITECTURE, API, CONTRIBUTING, BENCHMARK)
- ✅ `pnpm test --coverage` muestra número verde

### Fase 7: COMPLETA cuando

- ✅ Full runbook pasa sin errores
- ✅ Docker build exitoso
- ✅ E2E manual: auth, orders, clientes, swagger funcionales
- ✅ v1.0.0-alpha tagged
- ✅ PR creado a main

---

## 📞 CONTACTO & ESCALACIONES

Si encuentras bloqueadores:

1. **TypeScript errors no resolvibles:**
   - Revisar tsconfig.json (moduleResolution, lib, etc.)
   - Considerar ajustes en eslint.config.mjs

2. **Imports rotos tras migration:**
   - `grep -r "^import.*from.*deleted"` backend/src
   - Verificar node_modules está actualizado

3. **Tests fallando:**
   - Revisar mocks (PrismaService, EventBus)
   - Ejecutar en aislamiento: `pnpm test -- nombre.spec.ts`

4. **Docker issues:**
   - Check Dockerfile
   - Verificar WORKDIR y COPY paths

---

## 🚀 PRÓXIMOS PASOS

1. **AHORA:** Revisar este plan con el equipo (30 minutos)
2. **HOY:** Iniciar Fase 1 (crear rama, começar fixes)
3. **MAÑANA:** Completar Fase 1 + iniciar Fase 2
4. **SEMANA PRÓXIMA:** Fases 3-4 en paralelo
5. **FINALES:** Fases 5-7 y merge a main

**Duración Total:** 10-12 días laborales  
**Equipo:** 2 devs (posible solo con 1 dev más lento)  
**ROI:** Monorepo enterprise-ready, reducción deuda 40%

---

**Documento Versión:** 1.0  
**Fecha:** 16 de enero, 2026  
**Autor:** Tech Lead Audit System  
**Status:** LISTO PARA EJECUCIÓN
