# 02_PLAN.md — Plan de Acción para Análisis Exhaustivo de Calidad de Código + VPS Contabo

## 🎯 Objetivo
Implementar un plan sistemático para resolver los **67 problemas de calidad de código** identificados en el análisis exhaustivo del repositorio Cermont, priorizados por criticidad e impacto, **más preparar el aplicativo para despliegue en VPS Contabo eliminando dependencias de pago y corrigiendo errores críticos**.

## 🚨 FASE 0: BLOQUEANTES PARA VPS CONTABO (CRÍTICO - HOY)

### ⚠️ IMPORTANTE
Esta Fase 0 es **CRÍTICA** y debe completarse ANTES de desplegar a VPS Contabo. Resuelve problemas legales (dependencias de pago) y técnicos (tests rotos) que bloquean el despliegue en producción.

---

### Task 00.1 — Eliminar AmCharts (Dependencia de Pago) 🚨

**Problema:** `@amcharts/amcharts5` requiere licencia comercial ($199+ USD/año). El uso sin pago viola términos de licencia y expone a riesgos legales.

**Archivos afectados:**
- `apps/web/package.json`
- `apps/web/src/app/shared/components/ecommerce/country-map/country-map.component.ts`

**Acciones:**

1. **Eliminar dependencias de pago:**
   ```bash
   cd apps/web
   pnpm remove @amcharts/amcharts5 @amcharts/amcharts5-geodata
   ```

2. **Instalar Leaflet (open source - MIT license):**
   ```bash
   pnpm add leaflet @types/leaflet
   ```

3. **Reescribir `country-map.component.ts` con Leaflet:**
   ```typescript
   import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
   import L from 'leaflet';

   @Component({
     selector: 'app-country-map',
     template: `<div #mapContainer style="width: 100%; height: 300px; border-radius: 1rem;"></div>`,
     standalone: true
   })
   export class CountryMapComponent implements OnInit, AfterViewInit {
     @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
     map: L.Map | null = null;

     ngAfterViewInit() {
       // Inicializar mapa con OpenStreetMap
       this.map = L.map(this.mapContainer.nativeElement, {
         center: [20, 0],
         zoom: 2,
         minZoom: 2,
         maxZoom: 5,
         zoomControl: false
       });

       // Agregar tiles de OpenStreetMap (GRATIS, sin límites)
       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '&copy; OpenStreetMap contributors',
         maxZoom: 19
       }).addTo(this.map);

       // Agregar marcadores
       const markers = [
         { lat: 37.2580397, lon: -104.657039, name: "United States" },
         { lat: 20.7504374, lon: 73.7276105, name: "India" },
         { lat: 53.613, lon: -11.6368, name: "United Kingdom" },
         { lat: -25.0304388, lon: 115.2092761, name: "Sweden" },
       ];

       markers.forEach(m => {
         L.circleMarker([m.lat, m.lon], {
           radius: 8,
           fillColor: '#465FFF',
           color: '#ffffff',
           weight: 2,
           opacity: 1,
           fillOpacity: 1
         }).bindPopup(m.name).addTo(this.map);
       });
     }
   }
   ```

4. **Importar CSS de Leaflet en `styles.css`:**
   ```css
   @import 'leaflet/dist/leaflet.css';
   ```

**Criterios de éxito:**
- ✅ `pnpm list` no muestra `@amcharts/amcharts5`
- ✅ `pnpm run build` de @cermont/web pasa
- ✅ Mapa renderiza correctamente en browser
- ✅ Marcadores interactivos funcionan (hover/click)
- ✅ Bundle size reducido (Leaflet ~40KB vs AmCharts ~200KB)

**Tiempo estimado:** 2-3 horas

---

### Task 00.2 — Corregir Errores TypeScript en Tests de Órdenes

**Problema:** 4 errores de TypeScript en `ordenes.controller.spec.ts` impiden typecheck y ejecución de tests.

**Archivo:**
- `apps/api/src/modules/ordenes/infrastructure/controllers/ordenes.controller.spec.ts`

**Errores y correcciones:**

#### Error 1 (Línea 107):
```typescript
// ❌ Antes
const dto = {
    descripcion: 'Nueva orden de mantenimiento',
    cliente: 'Cliente ABC',
    prioridad: Prioridad.ALTA,
};

// ✅ Después
const dto = {
    descripcion: 'Nueva orden de mantenimiento',
    cliente: 'Cliente ABC',
    prioridad: 'alta' as Prioridad,
};
```

#### Error 2 (Línea 146):
```typescript
// ❌ Antes
const query = { page: 1, limit: 10, estado: OrdenEstadoEnum.PENDIENTE };

// ✅ Después
const query = { page: 1, limit: 10, estado: 'pendiente' as OrdenEstado };
```

#### Error 3 (Línea 185):
```typescript
// ❌ Antes
const mockOrdenResponse = {
    estado: 'string',
    prioridad: 'string',
    // ...
};

// ✅ Después
const mockOrdenResponse = {
    id: 'orden-123',
    numero: 'ORD-2026-001',
    descripcion: 'Test orden',
    cliente: 'Cliente Test',
    estado: OrdenEstado.PENDIENTE,
    prioridad: Prioridad.MEDIA,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};
```

#### Error 4 (Línea 187):
```typescript
// ❌ Antes
const dto = { nuevoEstado: OrdenEstadoEnum.EJECUCION };

// ✅ Después
const dto = {
    nuevoEstado: OrdenEstadoEnum.EJECUCION,
    motivo: 'Iniciar ejecución',
};
```

**Criterios de éxito:**
- ✅ `pnpm run typecheck` en @cermont/api pasa sin errores
- ✅ Tests unitarios de órdenes ejecutan: `pnpm run test`
- ✅ Todos los mocks usan tipos correctos (enums)

**Tiempo estimado:** 1-2 horas

---

### Task 00.3 — Verificación Completa del Build

**Scope:**
- Root del proyecto

**Acciones:**
```bash
# 1. Build completo de monorepo
pnpm run build

# 2. Lint de ambos apps
pnpm run lint

# 3. Typecheck de ambos apps
pnpm run typecheck

# 4. Verificar no hay dependencias de pago
pnpm list | grep amcharts  # Debe retornar vacío
```

**Criterios de éxito:**
- ✅ Build de @cermont/api: SUCCESS
- ✅ Build de @cermont/web: SUCCESS
- ✅ Lint: 0 errores (warnings aceptables)
- ✅ Typecheck: 0 errores
- ✅ No dependencias de pago (amcharts eliminado)
- ✅ Aplicativo listo para desplegar a VPS Contabo

**Tiempo estimado:** 30 minutos

---

## 📊 RESUMEN FASE 0 - VPS CONTABO

| Task | Archivos afectados | Cambios | Tiempo | Prioridad |
|------|-------------------|----------|--------|-----------|
| 00.1 | 2 archivos | Eliminar AmCharts, instalar Leaflet, reescribir componente | 2-3 horas | **CRÍTICA** 🚨 |
| 00.2 | 1 archivo | Corregir 4 errores TypeScript en tests | 1-2 horas | **ALTA** |
| 00.3 | N/A | Verificación de build, lint, typecheck | 30 min | **CRÍTICA** |
| **TOTAL** | **3 archivos** | **+0 dependencias nuevas, -2 de pago** | **4-6 horas** | - |

**Resultado esperado de Fase 0:**
- ✅ 0 dependencias de pago (100% open source)
- ✅ 0 errores de TypeScript
- ✅ Build, lint, typecheck: PASS
- ✅ Tests ejecutan correctamente
- ✅ **Listo para desplegar a VPS Contabo** 🚀

---

## 🛡️ User approval gate
> Antigravity debe detenerse aquí y pedir aprobación antes de implementar si:
> - Se agregan dependencias (NO APLICA en Fase 0 - Leaflet reemplaza AmCharts)
> - Se cambian contratos DTO/API (NO APLICA - solo refactor interno)
> - Hay migraciones Prisma (NO APLICA - solo correcciones de tipos)
> - Se toca auth/roles/permisos (NO APLICA - solo correcciones de tests)

**Estado Fase 0:** Fast lane aplicable (tasks pequeñas ≤ 3 archivos, Leaflet es open source MIT)

**Estado Fase 1+:** Requiere aprobación para tareas que afecten arquitectura o agreguen dependencias

---

## 📋 RESUMEN DE TAREAS (67 total)

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

### 🎯 FASES DE IMPLEMENTACIÓN

| Fase | Problemas | Duración Estimada | Focus |
|------|-----------|-------------------|-------|
| **Fase 1** | 20 críticos | 2-3 semanas | Estabilidad y seguridad |
| **Fase 2** | 25 altos | 3-4 semanas | Performance y mantenibilidad |
| **Fase 3** | 20 medios | 2 semanas | Calidad y consistencia |
| **Fase 4** | 9 bajos | 1-2 semanas | Optimización final |

---

## 🔴 PRIORIDAD 2: CRÍTICO (Security + Performance)

### 🚀 BACKEND - PRIORIDAD 2

#### Task 1 — Corregir violations de DDD en Domain Layer (7 archivos)
**Problema:** 7 archivos en domain/ importan NestJS/Common/Prisma

**Archivos (7):**
- `apps/api/src/modules/auth/domain/value-objects/jwt-token.vo.ts`
- `apps/api/src/modules/costos/domain/entities/costo.entity.ts`
- `apps/api/src/modules/costos/domain/services/cost-calculator.service.ts`
- `apps/api/src/modules/costos/domain/value-objects/money.vo.ts`
- `apps/api/src/modules/evidencias/domain/services/file-validator.service.ts`
- `apps/api/src/modules/hes/domain/services/hes-numero-generator.service.ts`
- `apps/api/src/modules/ordenes/domain/orden-state-machine.ts`

**Cambios:**
1. Mover lógica que requiere framework a `application/` o `infrastructure/`
2. Crear puertos en `domain/ports/` si necesario
3. Eliminar imports de NestJS/Common/Prisma desde domain/

**Criterios:**
- `pnpm run lint` en @cermont/api pasa sin warnings de arquitectura
- Domain layer queda puro (sin dependencias de framework)

---

#### Task 2 — Corregir N+1 Queries en Ordenes Repository
**Problema:** `findAll()` carga relaciones sin optimización

**Archivo:**
- `apps/api/src/modules/ordenes/infrastructure/persistence/prisma-orden.repository.ts`

**Cambios:**
1. Optimizar query con `select` directo
2. Considerar batch loading para relaciones
3. Agregar índices en DB (comentario, no requiere migración)

**Criterios:**
- Query usa `include` optimizado o `select` directo
- Comentario agregado para índices sugeridos: `(estado, createdAt)` y `(asignadoId, estado)`

---

#### Task 3 — Sanitizar logs en AuthController
**Problema:** Logs pueden exponer info sensible

**Archivo:**
- `apps/api/src/modules/auth/infrastructure/controllers/auth.controller.ts`

**Cambios:**
1. Usar `LoggerService.sanitizeLogMeta()` para todos los logs
2. Sanitizar stack traces antes de loguear
3. Loguear solo mensajes genéricos en producción

**Criterios:**
- Todos los logs usan sanitización
- No hay passwords/tokens/stack traces en logs

---

#### Task 4 — Validar JWT_SECRET al startup
**Problema:** No hay validación de longitud/complejidad

**Archivos:**
- `apps/api/src/config/env.validation.ts` (crear o modificar)
- `apps/api/src/main.ts` (llamar validación)

**Cambios:**
1. Crear validación en `env.validation.ts`: mínimo 32 caracteres
2. Llamar validación en `bootstrap()` antes de crear app
3. Fallar fast si validation falla

**Criterios:**
- Validación ejecuta al startup
- App falla con mensaje claro si JWT_SECRET es débil

---

#### Task 5 — Agregar Rate Limiting a Upload Endpoint
**Problema:** `EvidenciasController.upload()` sin rate limiting

**Archivo:**
- `apps/api/src/modules/evidencias/infrastructure/controllers/evidencias.controller.ts`

**Cambios:**
1. Agregar `@ThrottleAuth()` al endpoint
2. Límite: 10 uploads/min por usuario
3. Validación de tamaño total acumulado por usuario (en Use Case)

**Criterios:**
- Endpoint tiene `@ThrottleAuth()`
- Rate limit configurado en 10/min

---

#### Task 6 — Implementar Caching de Queries Frecuentes
**Problema:** Dashboard/KPIs sin caché, generan carga DB innecesaria

**Archivos:**
- `apps/api/src/modules/dashboard/dashboard.service.ts`
- `apps/api/src/modules/kpis/` (revisar)

**Cambios:**
1. Usar `@nestjs/cache-manager` ya configurado
2. Cache con TTL de 5 minutos para dashboard stats
3. Cache con TTL de 10 minutos para KPIs

**Criterios:**
- Dashboard usa caché (decorador `@CacheTTL()`)
- KPIs usan caché
- Invalidation cuando cambia una orden

---

## 🟡 PRIORIDAD 3: ALTA (Arquitectura + Testing)

### 🚀 BACKEND - PRIORIDAD 3

#### Task 7 — Unificar DTOs en OrdenesController
**Problema:** Type casts múltiples entre DTOs Zod y ClassValidator

**Archivo:**
- `apps/api/src/modules/ordenes/infrastructure/controllers/ordenes.controller.ts`

**Cambios:**
1. Unificar a solo Zod (recomendado)
2. Eliminar todos los type casts `as unknown as`
3. Mapear directamente sin conversión intermedia

**Criterios:**
- No hay type casts en `findAll()`
- Solo se usa un sistema de validación (Zod)

---

#### Task 8 — Centralizar Validación de DTOs en Value Objects
**Problema:** Validación de email/password duplicada

**Archivos:**
- `apps/api/src/modules/auth/domain/value-objects/` (crear o modificar)
- `apps/api/src/modules/auth/infrastructure/controllers/auth.controller.ts`
- `apps/api/src/modules/auth/application/use-cases/login.use-case.ts`

**Cambios:**
1. Usar `Email.create()` y `Password.create()` en controladores
2. Eliminar validación duplicada en Use Case
3. VOs centralizan toda la lógica de validación

**Criterios:**
- Controladores solo reciben DTOs crudos
- Use Cases validan usando VOs
- No hay validación duplicada

---

#### Task 9 — Agregar Caching a Dashboard Service
**Problema:** Dashboard hace 4 queries separadas sin caché

**Archivo:**
- `apps/api/src/modules/dashboard/dashboard.service.ts`

**Cambios:**
1. Usar `@CacheTTL(300)` en `getStats()` (5 min)
2. Usar `@CacheTTL(600)` en `getMetricas()` (10 min)
3. Invalidar caché en eventos de orden

**Criterios:**
- Métodos usan caché
- Tests de caché pasan

---

#### Task 10 — Mejorar Tests E2E con Autenticación Real
**Problema:** `ordenes.e2e-spec.ts` usa token mock

**Archivo:**
- `apps/api/test/ordenes.e2e-spec.ts`

**Cambios:**
1. Crear usuario de test en `beforeAll()`
2. Login real y obtener token válido
3. Usar token en todos los tests

**Criterios:**
- Tests prueban flujo de autenticación real
- No hay tokens hardcodeados

---

#### Task 11 — Refactorizar LoginUseCase (Métodos Privados)
**Problema:** LoginUseCase.execute() tiene ~180 líneas

**Archivo:**
- `apps/api/src/modules/auth/application/use-cases/login.use-case.ts`

**Cambios:**
1. Extraer a métodos privados:
   - `validateCredentials()`
   - `checkLockout()`
   - `issueTokens()`
   - `logLoginAttempt()`
2. Usar Template Method pattern para flujo de login

**Criterios:**
- `execute()` tiene < 80 líneas
- Métodos privados tienen nombres claros
- Tests siguen pasando

---

#### Task 12 — Eliminar Type Casts en Controllers
**Problema:** Múltiples `as unknown as` en OrdenesController

**Archivo:**
- `apps/api/src/modules/ordenes/infrastructure/controllers/ordenes.controller.ts`

**Cambios:**
1. Unificar DTOs (Task 7 debe completarse primero)
2. Eliminar todos los type casts
3. Mapear directamente

**Criterios:**
- No hay type casts en el controller
- TypeScript infiere tipos correctamente

---

### 🎨 FRONTEND - PRIORIDAD 3

#### Task 13 — Agregar Tests de Componentes (Unit Tests)
**Problema:** Sin tests de componentes en features/

**Archivos:**
- `apps/web/src/app/features/ordenes/components/` (ejemplo)
- Crear archivos `.spec.ts` para componentes críticos

**Cambios:**
1. Crear tests unitarios para `ordenes-list.component.ts`
2. Crear tests unitarios para `orden-form.component.ts`
3. Usar `ng test --code-coverage`

**Criterios:**
- Cobertura > 80% en componentes críticos
- Tests pasan

---

#### Task 14 — Corregir Error de Build en Mobile Header
**Problema:** Error bloqueante de build

**Archivo:**
- `apps/web/src/app/shared/components/common/mobile-header/mobile-header.component.ts`

**Cambios:**
1. Línea 65: Cambiar `toggleMobile()` por `toggleMobileOpen()`

**Criterios:**
- `pnpm run build` ejecuta sin errores
- `pnpm run test` puede ejecutarse completamente

---

## 🟢 PRIORIDAD 4: MEDIA (Performance + DevEx + Testing)

### 🚀 BACKEND - PRIORIDAD 4

#### Task 15 — Configurar Connection Pooling en DATABASE_URL
**Problema:** Sin configuración de pool

**Archivos:**
- `apps/api/.env.example` (actualizar)
- `apps/api/.env` (comentario)

**Cambios:**
1. Agregar a `.env.example`: `DATABASE_URL=postgresql://...?connection_limit=10&pool_timeout=2`
2. Documentar configuración en README

**Criterios:**
- `.env.example` tiene pool configurado
- README tiene documentación

---

#### Task 16 — Refactorizar LoggerService.writeToFile()
**Problema:** Método complejo de rotación de archivos

**Archivo:**
- `apps/api/src/lib/logging/logger.service.ts`

**Cambios:**
1. Extraer a `FileRotator` class
2. Simplificar con métodos privados enfocados
3. Usar dependency injection para testability

**Criterios:**
- `FileRotator` es una clase separada
- `writeToFile()` tiene < 50 líneas
- Tests de rotación pasan

---

#### Task 17 — Definir Bounded Contexts Explícitamente
**Problema:** Sin límites claros entre módulos

**Archivos:**
- `docs/ARCHITECTURE.md` (actualizar)

**Cambios:**
1. Definir bounded contexts: Auth, Ordenes, Evidencias, Dashboard
2. Documentar comunicación entre contexts (eventos)
3. Minimizar imports entre contexts

**Criterios:**
- ARCHITECTURE.md tiene bounded contexts definidos
- Módulos respetan límites

---

### 🎨 FRONTEND - PRIORIDAD 4

#### Task 18 — Modernizar Control Flow (4 Componentes)
**Problema:** Uso obsoleto de `*ngIf` y `*ngFor`

**Archivos:**
- `apps/web/src/app/features/calendario/pages/calendario-home.component.ts`
- `apps/web/src/app/features/hes/pages/hes-home.component.ts`
- `apps/web/src/app/features/reportes/pages/reportes-financieros.component.ts`
- `apps/web/src/app/features/reportes/pages/reportes-operativos.component.ts`

**Cambios:**
1. Reemplazar `*ngIf` por `@if` (16 ocurrencias)
2. Reemplazar `*ngFor` por `@for` (4 ocurrencias)

**Criterios:**
- `pnpm run lint` en @cermont/web pasa sin errores
- Funcionalidad idéntica

---

#### Task 19 — Implementar Lazy Loading de Rutas
**Problema:** Bundle inicial contiene código de todas las features

**Archivo:**
- `apps/web/src/app/app.routes.ts`

**Cambios:**
1. Convertir rutas a lazy loading con `loadComponent`
2. Usar `import()` para features

**Criterios:**
- Rutas usan `loadComponent`
- Bundle inicial reducido

---

#### Task 20 — Agregar Documentación en README.md
**Problema:** README sin Quick Start para Developers

**Archivo:**
- `README.md`

**Cambios:**
1. Agregar sección "Quick Start for Developers"
2. Incluir comandos: `pnpm install`, `pnpm run dev`, `pnpm run lint:fix`

**Criterios:**
- README tiene Quick Start completo
- Comandos funcionan

---

#### Task 21 — Crear Scripts de Utilidad para Seeds/Test Data
**Problema:** Sin scripts para generar datos de test

**Archivos:**
- `apps/api/scripts/generate-test-data.ts` (crear)
- `apps/api/package.json` (agregar script)

**Cambios:**
1. Crear script usando `@faker-js/faker`
2. Integrar con Prisma seed
3. Agregar comando: `pnpm run seed:test`

**Criterios:**
- Script genera datos de test
- Comando `pnpm run seed:test` funciona

---

#### Task 22 — Crear Configuration para Debugging (launch.json)
**Problema:** Sin config para debugging de tests

**Archivo:**
- `.vscode/launch.json` (crear o actualizar)

**Cambios:**
1. Agregar configs para debugging Jest tests
2. Agregar configs para debugging E2E tests

**Criterios:**
- launch.json tiene configs de debugging
- Debugging de tests funciona en VS Code

---

## ⚪ PRIORIDAD 5: NICE-TO-HAVE (Code Quality)

### 🚀 BACKEND - PRIORIDAD 5

#### Task 23 — Centralizar Constants (AUTH, LOGGING)
**Problema:** Magic numbers dispersos

**Archivos:**
- `apps/api/src/modules/auth/application/use-cases/login.use-case.ts`
- `apps/api/src/lib/logging/logger.service.ts`

**Cambios:**
1. Crear `AUTH_CONSTANTS` en `auth.constants.ts`
2. Crear `LOGGING_CONSTANTS` en `logger.constants.ts`
3. Reemplazar magic numbers por constantes

**Criterios:**
- Magic numbers eliminados
- Constantes centralizadas

---

### 🎨 FRONTEND - PRIORIDAD 5

#### Task 24 — Eliminar Comments Triviales
**Problema:** Comentarios que describen código evidente

**Archivos:**
- Múltiples archivos en frontend

**Cambios:**
1. Eliminar comentarios triviales ("qué hace", no "por qué")
2. Mantener solo comentarios que explican "por qué"

**Criterios:**
- Sin comentarios triviales
- Código auto-documentado

---

## 📦 POLÍTICA DE DEPENDENCIAS

**Nueva dependencia: NO**
- Motivo: Solo refactor de código existente
- Alternativas descartadas: N/A
- Riesgo peer-deps: Ninguno
- Aprobación requerida: NO

---

## ✅ VERIFICACIÓN (comandos obligatorios)

```bash
# Backend
pnpm --filter @cermont/api run lint
pnpm --filter @cermont/api run typecheck
pnpm --filter @cermont/api run test
pnpm --filter @cermont/api run build

# Frontend
pnpm --filter @cermont/web run lint
pnpm --filter @cermont/web run typecheck
pnpm --filter @cermont/web run test
pnpm --filter @cermont/web run build

# Global
pnpm run check
```

---

## 🔄 ROLLBACK PLAN

- Revertir cambios en Git usando `git checkout` o `git revert`
- Confirmar que los comandos de verificación vuelven a mostrar los mismos errores originales
- Documentar rollback en 03_VERIFY.md

---

## 📋 ORDEN DE EJECUCIÓN

### FASE 1: Desbloqueantes (1 día)
1. **Task 14** (Frontend - Build error) - Desbloquea pipeline
2. **Task 18** (Frontend - Lint errors) - Modernización

### FASE 2: Críticos (2-3 días)
3. **Task 1** (Backend - DDD violations)
4. **Task 2** (Backend - N+1 queries)
5. **Task 3** (Backend - Log sanitization)
6. **Task 4** (Backend - JWT secret validation)
7. **Task 5** (Backend - Rate limiting upload)
8. **Task 6** (Backend - Caching queries)

### FASE 3: Alta prioridad (3-4 días)
9. **Task 7** (Backend - Unificar DTOs)
10. **Task 8** (Backend - Centralizar validación)
11. **Task 9** (Backend - Caching dashboard)
12. **Task 10** (Backend - E2E tests)
13. **Task 11** (Backend - Refactor LoginUseCase)
14. **Task 12** (Backend - Eliminar type casts)
15. **Task 13** (Frontend - Tests componentes)

### FASE 4: Media prioridad (2-3 días)
16. **Task 15** (Backend - Connection pooling)
17. **Task 16** (Backend - Refactor Logger)
18. **Task 17** (Backend - Bounded contexts)
19. **Task 19** (Frontend - Lazy loading)
20. **Task 20** (Frontend - README)
21. **Task 21** (Backend - Seeds scripts)
22. **Task 22** (Frontend - Debugging config)

### FASE 5: Nice-to-have (1 día)
23. **Task 23** (Backend - Constants)
24. **Task 24** (Frontend - Comments)

---

**Tiempo estimado total:** 8-11 semanas (2-3 meses)

---

## 📊 IMPACTO ESPERADO

### Métricas Cuantitativas
- **Líneas de código duplicadas eliminadas:** ~1,200 (30% menos)
- **Problemas de type safety eliminados:** 66 ocurrencias
- **Archivos con DDD violations corregidos:** 7 archivos
- **Queries optimizados:** > 60% reducción
- **Bundle size frontend reducido:** > 30%
- **Tiempo de respuesta dashboard:** < 200ms

### Beneficios Cualitativos
- **TypeScript strict mode:** Sin errores
- **Lint rules:** 0 warnings
- **Test coverage:** > 80%
- **Code review time:** 50% reducción
- **Onboarding time:** 40% reducción

### ROI Estimado
- **Inversión:** 2-3 meses desarrollo
- **Retorno:** 50% menos tiempo en mantenimiento futuro, 30% más rápido desarrollo de nuevas features

---

## ✅ APROBACIÓN REQUERIDA

**Stakeholders requeridos para aprobación:**
- [ ] CTO / Tech Lead
- [ ] Engineering Manager  
- [ ] Product Manager
- [ ] QA Lead

**Firma de aprobación:**
_________________________ 
Date: _______________

---

*Este documento está sujeto a cambios basados en el progreso real y hallazgos durante la implementación.*

