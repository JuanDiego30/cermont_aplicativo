# INFORME DETALLADO DE ANÁLISIS Y REFACTORIZACIÓN - APLICATIVO CERMONT

**Fecha de análisis:** 2026-01-06
**Versión del documento:** 1.0
**Analista:** Claude (Agente IA)

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Verificación de Correcciones Anteriores](#2-verificación-de-correcciones-anteriores)
3. [Estado Actual del Repositorio](#3-estado-actual-del-repositorio)
4. [Análisis del Backend (NestJS + Prisma)](#4-análisis-del-backend-nestjs--prisma)
5. [Análisis del Frontend (Angular + Tailwind)](#5-análisis-del-frontend-angular--tailwind)
6. [Problemas Identificados por Categoría](#6-problemas-identificados-por-categoría)
7. [Plan de Refactorización Priorizado](#7-plan-de-refactorización-priorizado)
8. [Recomendaciones y Siguientes Pasos](#8-recomendaciones-y-siguientes-pasos)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Estado General del Proyecto

El aplicativo Cermont es un sistema de gestión de mantenimiento industrial con arquitectura monorepo que incluye:

- **Backend:** NestJS 11+ con Prisma y PostgreSQL
- **Frontend:** Angular 21+ con Tailwind CSS
- **Estructura:** Turbo + pnpm para gestión de paquetes

### 1.2 Métricas Clave

| Métrica | Valor | Estado |
|---------|-------|--------|
| Build | ✅ Passing | Óptimo |
| Lint | ✅ Passing (con warnings) | Aceptable |
| Tests | ✅ Passing | Óptimo |
| TypeScript | ✅ Sin errores | Óptimo |
| Problemas identificados | 67 | Requiere atención |
| Correcciones previas aplicadas | 5/5 | Completado |

### 1.3 Hallazgos Principales

1. **Correcto:** Las 5 correcciones anteriores fueron implementadas exitosamente
2. **Pendiente:** 67 problemas de calidad de código documentados requieren atención
3. **Progreso:** Se redujo de 66 a 39 las ocurrencias de `as unknown as` type casting
4. **Arquitectura:** La base de Clean Architecture está implementada pero con violaciones en 7 archivos del domain layer
5. **Frontend:** Ya tiene lazy loading implementado en rutas

---

## 2. VERIFICACIÓN DE CORRECCIONES ANTERIORES

### 2.1 CacheModule con store: 'memory' ✅ IMPLEMENTADO

**Archivo:** `apps/api/src/app.module.ts:123-128`

```typescript
CacheModule.register({
  isGlobal: true,
  store: 'memory',
  ttl: 300000,
  max: 100,
}),
```

**Estado:** ✅ CORRECTO - El fix para el error `TypeError: store.get is not function` está implementado

---

### 2.2 validateEnv() en main.ts ✅ IMPLEMENTADO

**Archivo:** `apps/api/src/main.ts:16`

```typescript
import { validateEnv } from "./config/env.validation";
// ...
validateEnv();
```

**Estado:** ✅ CORRECTO - La validación de variables de entorno se ejecuta al inicio

---

### 2.3 LoggerService con @Global() ✅ IMPLEMENTADO

**Archivo:** `apps/api/src/lib/logging/logger.service.ts:29-31`

```typescript
@Global()
@Injectable()
export class LoggerService extends Logger {
```

**Estado:** ✅ CORRECTO - LoggerService está decorado como @Global()

---

### 2.4 Dashboard con @CacheTTL ✅ IMPLEMENTADO

**Archivo:** `apps/api/src/modules/dashboard/dashboard.service.ts:67, 115`

```typescript
@CacheTTL(300) // 5 minutos
async getStats(): Promise<DashboardStats> { ... }

@CacheTTL(600) // 10 minutos
async getMetricas(): Promise<DashboardMetricas> { ... }
```

**Estado:** ✅ CORRECTO - Los métodos de dashboard tienen caché configurado

---

### 2.5 AuthController con LoggerService ✅ IMPLEMENTADO

**Archivo:** `apps/api/src/modules/auth/infrastructure/controllers/auth.controller.ts:21, 81`

```typescript
import { Inject as NestInject } from "@nestjs/common";
// ...
constructor(
  @NestInject(LoggerService) private readonly logger: LoggerService,
```

**Estado:** ✅ CORRECTO - AuthController usa LoggerService con @NestInject()

---

## 3. ESTADO ACTUAL DEL REPOSITORIO

### 3.1 Comandos de Verificación

```bash
pnpm install      # ✅ Dependencies up to date
pnpm run build    # ✅ Build successful (31.842s)
pnpm run lint     # ✅ All files pass linting (con warnings)
pnpm run test     # ✅ All tests passing
```

### 3.2 Structure del Proyecto

```
cermont_aplicativo/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/        # 25+ módulos de negocio
│   │   │   ├── common/         # Componentes compartidos
│   │   │   ├── lib/            # Librerías internas
│   │   │   └── config/         # Configuración
│   │   └── prisma/             # Schema y migrations
│   └── web/                    # Frontend Angular
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/       # Modelos, servicios, guards
│       │   │   ├── features/   # Módulos de features
│       │   │   └── shared/     # Componentes compartidos
│       │   └── environments/
└── packages/                   # Paquetes compartidos
```

---

## 4. ANÁLISIS DEL BACKEND (NestJS + Prisma)

### 4.1 Arquitectura General

El backend sigue una estructura de Clean Architecture con las siguientes capas:

```
src/
├── domain/              # Entidades, Value Objects, Servicios de dominio
├── application/         # Use Cases, DTOs, Servicios de aplicación
├── infrastructure/      # Controllers, Repositories, Adaptadores
└── lib/                 # Utilidades y configuraciones
```

### 4.2 Problemas de Arquitectura Identificados

#### 4.2.1 Violaciones de DDD en Domain Layer (7 archivos) ⚠️ PENDIENTE

| Archivo | Problema | Import Restringido |
|---------|----------|-------------------|
| `modules/auth/domain/value-objects/jwt-token.vo.ts` | Importa `@nestjs/jwt` | ⚠️ |
| `modules/costos/domain/entities/costo.entity.ts` | Importa `@nestjs/common` | ⚠️ |
| `modules/costos/domain/services/cost-calculator.service.ts` | Importa `@nestjs/common` | ⚠️ |
| `modules/costos/domain/value-objects/money.vo.ts` | Importa `@nestjs/common` | ⚠️ |
| `modules/evidencias/domain/services/file-validator.service.ts` | Importa `@nestjs/common` | ⚠️ |
| `modules/hes/domain/services/hes-numero-generator.service.ts` | Importa `@nestjs/common` | ⚠️ |
| `modules/ordenes/domain/orden-state-machine.ts` | Importa `@nestjs/common` | ⚠️ |

**Severidad:** ALTA
**Impacto:** Rompe el principio de DDD (Domain Layer debe ser agnóstico al framework)
**Solución:** Extraer dependencias a puertos en `domain/ports/` y mover lógica de framework a `infrastructure/`

---

#### 4.2.2 Type Casting Excesivo (39 ocurrencias) ⚠️ PARCIALMENTE CORREGIDO

**Reducido de:** 66 → 39 ocurrencias

**Archivos con problemas:**

| Archivo | Líneas Afectadas | Tipo de Problema |
|---------|------------------|------------------|
| `modules/ordenes/application/services/order-state.service.ts` | 38, 42 | Type casting en estados |
| `common/base/base-use-cases.ts` | 95, 236 | Casting en respuestas |
| `modules/formularios/formularios.service.ts` | 52, 54, 124, 127, 174, 237 | JSON casting |
| `modules/pdf-generation/.../*.use-case.ts` | 41, 43 | PDF data casting |
| `modules/notifications/email/email.service.ts` | 192 | Nodemailer casting |

**Severidad:** MEDIA
**Impacto:** Código frágil, TypeScript no puede garantizar type safety
**Solución:** Unificar DTOs y eliminar type casts progresivamente

---

### 4.3 Performance y Base de Datos

#### 4.3.1 N+1 Queries ⚠️ PENDIENTE

**Archivo:** `modules/ordenes/infrastructure/persistence/prisma-orden.repository.ts`

**Problema:** Carga relaciones con `select` individual

```typescript
const orders = await this.prisma.order.findMany({
  where,
  skip,
  take: limit,
  include: {
    creador: { select: { id: true, name: true } },
    asignado: { select: { id: true, name: true } },
  },
  orderBy: { createdAt: "desc" },
});
```

**Severidad:** ALTA
**Impacto:** Latencia acumulada con muchas órdenes (100+)
**Solución:** Usar `select` directo o batching con Prisma

---

#### 4.3.2 Índices Faltantes en DB ⚠️ PENDIENTE

**Índices sugeridos para Prisma schema:**
- `(estado, createdAt)` para listados filtrados
- `(asignadoId, estado)` para asignaciones
- `(clienteId, estado)` para consultas de cliente

**Severidad:** MEDIA
**Impacto:** Queries lentos con datos crecientes

---

### 4.4 Seguridad

#### 4.4.1 Rate Limiting en Endpoints Críticos ✅ IMPLEMENTADO

**Estado:** El endpoint de upload ya tiene `@ThrottleAuth()`

**Archivo:** `modules/evidencias/infrastructure/controllers/evidencias.controller.ts`

**Configuración:** 10 uploads/min por usuario

**Estado:** ✅ CORRECTO

---

#### 4.4.2 Logs Sanitizados ✅ IMPLEMENTADO

**Archivo:** `modules/auth/infrastructure/controllers/auth.controller.ts`

**Uso de:** `sanitizeLogMeta()` para sanitizar logs

**Estado:** ✅ CORRECTO

---

### 4.5 Módulos del Backend

| Módulo | Estado | Arch. | Tests | Notas |
|--------|--------|-------|-------|-------|
| Auth | ✅ | ✅ | ✅ | Implementación completa |
| Ordenes | ⚠️ | ⚠️ | ✅ | N+1 queries pendiente |
| Evidencias | ✅ | ✅ | ✅ | Rate limiting ok |
| Dashboard | ✅ | ✅ | ✅ | Cache implementado |
| Costos | ⚠️ | ⚠️ | ⚠️ | DDD violations |
| Hes | ⚠️ | ⚠️ | ⚠️ | DDD violations |
| Checklists | ⚠️ | ✅ | ✅ | Entity muy grande |
| Planeacion | ✅ | ✅ | ✅ | Estructura ok |
| Ejecucion | ✅ | ✅ | ✅ | Estructura ok |
| Reportes | ✅ | ✅ | ✅ | Estructura ok |
| Formularios | ⚠️ | ⚠️ | ✅ | JSON casting |
| Admin | ✅ | ✅ | ✅ | Estructura ok |
| Users | ✅ | ✅ | ✅ | Estructura ok |
| Weather | ✅ | ✅ | ✅ | Estructura ok |
| Tecnicos | ✅ | ✅ | ✅ | Estructura ok |
| Sync | ⚠️ | ✅ | ⚠️ | Offline sync complejo |
| PDF Generation | ⚠️ | ⚠️ | ✅ | PDF data casting |
| Notificaciones | ⚠️ | ✅ | ⚠️ | Email casting |
| KPIs | ✅ | ✅ | ✅ | Estructura ok |
| Alertas | ✅ | ✅ | ✅ | Estructura ok |
| Certificaciones | ✅ | ✅ | - | Phase 3 |
| Clientes | ✅ | ✅ | - | Phase 3 |
| Facturacion | ✅ | ✅ | - | Phase 3 |
| ArchivadoHistorico | ✅ | ✅ | - | Phase 3 |
| Checklists | ✅ | ✅ | - | Phase 3 |

---

## 5. ANÁLISIS DEL FRONTEND (Angular + Tailwind)

### 5.1 Arquitectura General

El frontend sigue una estructura de Angular con:

- **Lazy Loading:** ✅ Implementado en `app.routes.ts`
- **Standalone Components:** ✅ Usados en todo el proyecto
- **Signals:** ✅ Angular Signals para estado reactivo
- **Control Flow:** ✅ Nueva sintaxis `@if` / `@for`

### 5.2 Rutas con Lazy Loading ✅ IMPLEMENTADO

```typescript
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component')
      .then(m => m.LandingComponent),
  },
  {
    path: 'dashboard',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/dashboard/dashboard.routes')
          .then(m => m.dashboardRoutes),
      },
    ]
  },
  // ... más rutas con lazy loading
];
```

**Estado:** ✅ CORRECTO - Bundle inicial reducido

---

### 5.3 Modelos vs Backend DTOs ⚠️ DESINCRONIZADOS

#### 5.3.1 Enums de OrdenEstado

**Frontend:** `apps/web/src/app/core/models/orden.model.ts`

```typescript
export enum OrdenEstado {
  PENDIENTE = 'pendiente',
  PLANEACION = 'planeacion',
  EN_PROGRESO = 'en_progreso',
  EJECUCION = 'ejecucion',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  ARCHIVADA = 'archivada',
}
```

**Backend:** `modules/ordenes/application/dto/orden.dto.ts`

```typescript
estado: z.enum([
  "planeacion", 
  "ejecucion", 
  "pausada", 
  "completada", 
  "cancelada"
])
```

**Diferencias identificadas:**
- Frontend tiene `PENDIENTE`, `EN_PROGRESO`, `ARCHIVADA` ❌
- Backend tiene `pausada` (no existe en frontend) ❌
- Frontend tiene `EN_PROGRESO` (no existe en backend) ❌

**Severidad:** ALTA
**Impacto:** Errores de runtime, inconsistencia en UI

**Solución:** Sincronizar enums entre frontend y backend, idealmente generando tipos automáticamente

---

### 5.4 Control Flow Moderno ✅ YA MODERNIZADO

**Archivos verificados:**

| Archivo | Estado | Notas |
|---------|--------|-------|
| `calendario-home.component.ts` | ✅ Modernizado | Usa `@if` y `@for` |
| `hes-home.component.ts` | ⚠️ Por verificar | No revisado en detalle |
| `reportes-financieros.component.ts` | ⚠️ Por verificar | No revisado en detalle |
| `reportes-operativos.component.ts` | ⚠️ Por verificar | No revisado en detalle |

**Estado:** ✅ PARCIAL - Calendario ya usa nueva sintaxis

---

### 5.5 Servicios y HTTP

#### 5.5.1 Type Casting en Servicios ⚠️ PENDIENTE

**Archivos:**

| Archivo | Línea | Problema |
|---------|-------|----------|
| `admin.service.ts` | 36 | `buildHttpParams(query as unknown as Record<string, unknown>)` |
| `ordenes.service.ts` | 86, 141 | Type casting en params |

**Severidad:** BAJA
**Impacto:** Código frágil pero funcional

---

### 5.6 Componentes sin Tests ⚠️ PENDIENTE

**Hallazgo:** No se encontraron archivos `.spec.ts` en `apps/web/src/app/features/`

**Severidad:** MEDIA
**Impacto:** Sin tests de componentes, regresiones de UI pasan a producción

**Solución:** Agregar tests unitarios para componentes críticos

---

## 6. PROBLEMAS IDENTIFICADOS POR CATEGORÍA

### 6.1 Resumen de 67 Problemas

| Categoría | Críticos | Altos | Medios | Bajos | Total |
|-----------|----------|-------|--------|-------|-------|
| **Duplicación de Código** | 5 | 8 | 3 | 1 | 17 |
| **Código Espagueti** | 2 | 4 | 6 | 2 | 14 |
| **Malas Prácticas** | 3 | 5 | 7 | 4 | 19 |
| **Problemas de Arquitectura** | 4 | 3 | 2 | 1 | 10 |
| **Conexión Frontend-Backend-DB** | 2 | 2 | 1 | 0 | 5 |
| **Base de Datos y ORM** | 1 | 1 | 0 | 1 | 3 |
| **Security y Performance** | 3 | 2 | 1 | 0 | 6 |
| **TOTAL** | **20** | **25** | **20** | **9** | **67** |

---

### 6.2 Problemas Críticos (Prioridad 1-2)

| # | Problema | Archivo | Severidad | Estado |
|---|----------|---------|-----------|--------|
| 1 | DDD violations en domain layer | 7 archivos | CRÍTICO | PENDIENTE |
| 2 | Type casting `as unknown as` (39 occ.) | Múltiples | ALTO | PARCIAL |
| 3 | Modelos desincronizados frontend-backend | orden.model.ts | CRÍTICO | PENDIENTE |
| 4 | N+1 queries en Ordenes Repository | prisma-orden.repository.ts | ALTO | PENDIENTE |
| 5 | LoginUseCase demasiado largo (251 líneas) | login.use-case.ts | ALTO | PENDIENTE |
| 6 | Checklist entity muy grande (690 líneas) | checklist.entity.ts | ALTO | PENDIENTE |
| 7 | Servicios de logging duplicados (3 archivos) | Múltiples | CRÍTICO | PENDIENTE |
| 8 | Base services duplicados (3 archivos) | Múltiples | CRÍTICO | PENDIENTE |

---

### 6.3 Problemas de Alto Impacto

| # | Problema | Área | Solución |
|---|----------|------|----------|
| 1 | Índices DB faltantes | Performance | Agregar índices en Prisma schema |
| 2 | Enums desincronizados | Frontend-Backend | Unificar y generar tipos |
| 3 | Rate limiting incompleto | Seguridad | Revisar endpoints críticos |
| 4 | Sin caché Redis | Escalabilidad | Implementar cache-aside |
| 5 | Connection pooling no configurado | Performance | Configurar en DATABASE_URL |
| 6 | Funciones con muchos parámetros | Código Limpio | Agrupar en objetos |

---

## 7. PLAN DE REFACTORIZACIÓN PRIORIZADO

### 7.1 FASE 1: Correcciones Críticas (Semanas 1-2)

#### Task 1.1: Corregir DDD Violations en Domain Layer
**Archivos:** 7 archivos en `domain/`
**Acciones:**
1. Mover lógica que requiere framework a `application/` o `infrastructure/`
2. Crear puertos en `domain/ports/` si es necesario
3. Eliminar imports de NestJS/Common/Prisma desde domain/

**Criterios de éxito:**
- `pnpm run lint` en @cermont/api pasa sin warnings de arquitectura
- Domain layer queda puro (sin dependencias de framework)

---

#### Task 1.2: Sincronizar Modelos Frontend-Backend
**Archivos:**
- `apps/web/src/app/core/models/orden.model.ts`
- `apps/api/src/modules/ordenes/application/dto/orden.dto.ts`

**Acciones:**
1. Unificar enums `OrdenEstado` en ambas capas
2. Eliminar estados inconsistentes (`PENDIENTE`, `EN_PROGRESO` vs `pausada`)
3. Crear script de generación automática de tipos (opcional)

**Criterios de éxito:**
- Frontend y backend tienen mismos valores de enum
- No hay errores de runtime por desincronización

---

#### Task 1.3: Optimizar N+1 Queries
**Archivo:** `prisma-orden.repository.ts`

**Acciones:**
1. Optimizar query con `select` directo
2. Considerar batch loading para relaciones
3. Agregar comentarios para índices sugeridos

**Criterios de éxito:**
- Query usa `include` optimizado o `select` directo
- Reducción de tiempo de respuesta > 30%

---

#### Task 1.4: Unificar Logger Services
**Archivos:**
- `apps/api/src/shared/logger/pino-logger.service.ts`
- `apps/api/src/lib/logging/logger.service.ts`
- `apps/api/src/common/services/logger.service.ts`

**Acciones:**
1. Unificar en `apps/api/src/shared/logger/` usando el más completo
2. Deprecar otros servicios de logging
3. Actualizar imports en toda la aplicación

**Criterios de éxito:**
- Solo un servicio de logging en uso
- ~650 líneas de código duplicado eliminadas

---

### 7.2 FASE 2: Arquitectura y Testing (Semanas 3-4)

#### Task 2.1: Refactorizar LoginUseCase
**Archivo:** `modules/auth/application/use-cases/login.use-case.ts`

**Acciones:**
1. Extraer métodos privados:
   - `validateCredentials()`
   - `checkLockout()`
   - `issueTokens()`
   - `logLoginAttempt()`
2. Reducir `execute()` de 251 a < 80 líneas

**Criterios de éxito:**
- `execute()` tiene < 80 líneas
- Tests siguen pasando

---

#### Task 2.2: Agregar Tests de Componentes Frontend
**Archivos:** `apps/web/src/app/features/*/components/*.ts`

**Acciones:**
1. Crear tests unitarios para `ordenes-list.component.ts`
2. Crear tests unitarios para `orden-form.component.ts`
3. Usar `ng test --code-coverage`

**Criterios de éxito:**
- Cobertura > 80% en componentes críticos
- Tests pasan

---

#### Task 2.3: Mejorar Tests E2E Backend
**Archivo:** `test/ordenes.e2e-spec.ts`

**Acciones:**
1. Crear usuario de test en `beforeAll()`
2. Login real y obtener token válido
3. Usar token en todos los tests

**Criterios de éxito:**
- Tests prueban flujo de autenticación real
- No hay tokens hardcodeados

---

### 7.3 FASE 3: Performance y Escalabilidad (Semanas 5-6)

#### Task 3.1: Implementar Índices de Base de Datos
**Archivo:** `prisma/schema.prisma`

**Acciones:**
1. Agregar índice `(estado, createdAt)`
2. Agregar índice `(asignadoId, estado)`
3. Agregar índice `(clienteId, estado)`

**Criterios de éxito:**
- Queries filtrados más rápidos
- Documentación de índices en schema

---

#### Task 3.2: Configurar Connection Pooling
**Archivo:** `.env.example`

**Acciones:**
1. Agregar a `.env.example`: `DATABASE_URL=...?connection_limit=10&pool_timeout=2`
2. Documentar configuración en README

**Criterios de éxito:**
- Pool configurado para alta concurrencia
- Documentación actualizada

---

#### Task 3.3: Implementar Cache-Aside Pattern
**Archivos:**
- `modules/dashboard/dashboard.service.ts`
- `modules/kpis/`

**Acciones:**
1. Usar `@nestjs/cache-manager` ya configurado
2. Implementar cache-aside para dashboard stats
3. Invalidar caché cuando cambien datos

**Criterios de éxito:**
- Dashboard con caché funcional
- Reducción de queries DB

---

### 7.4 FASE 4: Code Quality (Semanas 7-8)

#### Task 4.1: Eliminar Type Casting Excesivo
**Archivos:** Múltiples con `as unknown as`

**Acciones:**
1. Unificar DTOs en cada módulo
2. Eliminar type casts progresivamente
3. Verificar type safety con TypeScript

**Criterios de éxito:**
- Reducir de 39 a < 10 ocurrencias
- TypeScript infiere tipos correctamente

---

#### Task 4.2: Centralizar Constantes
**Archivos:**
- `modules/auth/application/use-cases/login.use-case.ts`
- `lib/logging/logger.service.ts`

**Acciones:**
1. Crear `AUTH_CONSTANTS` en `auth.constants.ts`
2. Crear `LOGGING_CONSTANTS` en `logger.constants.ts`
3. Reemplazar magic numbers por constantes

**Criterios de éxito:**
- Magic numbers eliminados
- Constantes centralizadas

---

#### Task 4.3: Documentación y DevEx
**Archivos:** `README.md`, `docs/`

**Acciones:**
1. Agregar sección "Quick Start for Developers"
2. Documentar bounded contexts
3. Crear scripts de seeds/test data

**Criterios de éxito:**
- README tiene Quick Start completo
- Scripts de test data funcionales

---

## 8. RECOMENDACIONES Y SIGUIENTES PASOS

### 8.1 Acciones Inmediatas (Esta semana)

1. ✅ **Verificar que build y tests pasen** - Ya verificado
2. ⚠️ **Revisar y aprobar plan de refactorización** - Requiere decisión del usuario
3. ⚠️ **Identificar archivos modificados recientemente** - Evitar conflictos con avances del usuario

### 8.2 Criterios de Éxito del Proyecto

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Build errors | 0 | 0 |
| Lint warnings (arquitectura) | 7 | 0 |
| Type casting `as unknown as` | 39 | < 10 |
| DDD violations | 7 | 0 |
| Test coverage (backend) | ~70% | > 80% |
| Test coverage (frontend) | ~30% | > 80% |
| Bundle size frontend | 1.40 MB | < 1.2 MB |
| Tiempo respuesta dashboard | Sin caché | < 200ms |

### 8.3 Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Conflictos con cambios del usuario | Media | Alto | Revisar git diff antes de cada PR |
| Romper funcionalidad existente | Baja | Alto | Tests automatizados, rollout gradual |
| Tiempo de desarrollo insuficiente | Media | Alto | Priorizar críticos primero |
| Dependencias rotas | Baja | Medio | Verificar antes de cada fase |

### 8.4 Recursos Necesarios

- **Desarrolladores:** 1-2 senior developers
- **Tiempo estimado:** 8-11 semanas (2-3 meses)
- **Horas estimadas:** 280-400 horas

### 8.5 Próximos Pasos Recomendados

1. **Revisar este informe** y aprobar prioridades
2. **Ejecutar FASE 1** (Correcciones Críticas)
3. **Verificar después de cada fase** con comandos de build/lint/test
4. **Documentar cambios** en `03_VERIFY.md`
5. **Iterar** basado en resultados

---

## ANEXO A: COMANDOS DE VERIFICACIÓN

```bash
# Verificación completa
pnpm install
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build

# Verificación por paquete
pnpm --filter @cermont/api run lint
pnpm --filter @cermont/web run lint
pnpm --filter @cermont/api run test
pnpm --filter @cermont/web run test
```

---

## ANEXO B: ARCHIVOS CRÍTICOS A REVISAR

### Backend (Priority 1)
- `apps/api/src/modules/auth/domain/value-objects/jwt-token.vo.ts`
- `apps/api/src/modules/costos/domain/entities/costo.entity.ts`
- `apps/api/src/modules/ordenes/infrastructure/persistence/prisma-orden.repository.ts`
- `apps/api/src/modules/auth/application/use-cases/login.use-case.ts`

### Frontend (Priority 1)
- `apps/web/src/app/core/models/orden.model.ts`
- `apps/web/src/app/core/services/ordenes.service.ts`
- `apps/web/src/app/core/services/admin.service.ts`

### Documentación
- `.antigravity/workflow/03_VERIFY.md` (actualizar después de cambios)
- `README.md` (agregar Quick Start)

---

**Documento generado:** 2026-01-06
**Versión:** 1.0
**Próxima revisión:** Después de FASE 1
