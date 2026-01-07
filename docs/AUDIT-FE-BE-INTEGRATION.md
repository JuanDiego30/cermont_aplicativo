# 📋 Catálogo de Integración FE↔BE - Cermont

## Estado General

**Fecha:** 2026-01-07  
**Backend TSC:** ✅ PASS  
**Frontend Build:** ✅ PASS

---

## Resumen de Cobertura

| Módulo FE (*.api.ts) | Módulo BE (controller) | Estado |
|----------------------|------------------------|--------|
| `auth.api.ts` | `auth.controller.ts` | ✅ Completo |
| `ordenes.api.ts` | `ordenes.controller.ts` | ✅ Completo |
| `admin.api.ts` | `admin.controller.ts` | ✅ Completo |
| `dashboard.api.ts` | `dashboard.controller.ts` | ✅ Completo |
| `evidencias.api.ts` | `evidencias.controller.ts` | ✅ Completo |
| `planeacion.api.ts` | `planeacion.controller.ts` | ⚠️ Verificar rutas |
| `tecnicos.api.ts` | `tecnicos.controller.ts` | ✅ Completo |
| `kits.api.ts` | `kits.controller.ts` | ✅ Completo |
| `mantenimientos.api.ts` | `mantenimientos.controller.ts` | ✅ Existe |
| `reportes.api.ts` | `reportes.controller.ts` | ✅ Completo |

---

## Módulos BE sin cliente FE (por evaluar)

| Módulo Backend | Controller | Acción Sugerida |
|----------------|------------|-----------------|
| `costos` | `costos.controller.ts` | Crear `costos.api.ts` o integrar en Dashboard |
| `cierre-administrativo` | `cierre-administrativo.controller.ts` | Crear cliente FE para flujo de cierre |
| `clientes` | `clientes.controller.ts` | Crear `clientes.api.ts` |
| `certificaciones` | `certificaciones.controller.ts` | Crear cliente FE para gestión certs |
| `checklists` | `checklists.controller.ts` | Crear `checklists.api.ts` |
| `ejecucion` | `ejecucion.controller.ts` | Integrar con flujo de órdenes |
| `facturacion` | `facturacion.controller.ts` | Crear cliente FE |
| `formularios` | `formularios.controller.ts` | Crear `formularios.api.ts` |
| `kpis` | `kpis.controller.ts` | Ya consumido por Dashboard |
| `notifications` | (verificar) | Sistema de notificaciones |
| `pdf-generation` | `pdf.controller.ts` | Integrar con Reportes |
| `weather` | `weather.controller.ts` | Opcional - clima para trabajos |
| `hes` | `hes.controller.ts` | Inspecciones HES |
| `alertas` | `alertas.controller.ts` | Sistema de alertas |
| `sync` | `sync.controller.ts` | Sincronización offline |

---

## Detalle por Sector

### Auth Sector ✅

| FE Method | BE Endpoint | Status |
|-----------|-------------|--------|
| `login()` | `POST /auth/login` | ✅ |
| `register()` | `POST /auth/register` | ✅ |
| `refresh()` | `POST /auth/refresh` | ✅ |
| `logout()` | `POST /auth/logout` | ✅ |
| `me()` | `GET /auth/me` | ✅ |

**CSRF:** ✅ Implementado (x-csrf-token header en interceptor)

### Órdenes Sector ✅

| FE Method | BE Endpoint | Status |
|-----------|-------------|--------|
| `list()` | `GET /ordenes` | ✅ |
| `getById()` | `GET /ordenes/:id` | ✅ |
| `create()` | `POST /ordenes` | ✅ |
| `update()` | `PATCH /ordenes/:id` | ✅ |
| `remove()` | `DELETE /ordenes/:id` | ✅ |
| `changeEstado()` | `POST /ordenes/:id/cambiar-estado` | ✅ |
| `asignarTecnico()` | `POST /ordenes/:id/asignar-tecnico` | ✅ |
| `getHistorial()` | `GET /ordenes/:id/historial` | ✅ |
| `getStats()` | `GET /ordenes/stats` | ⚠️ Verificar orden de rutas |

### Admin Sector ✅

| FE Method | BE Endpoint | Status |
|-----------|-------------|--------|
| `listUsers()` | `GET /admin/users` | ✅ |
| `getUser()` | `GET /admin/users/:id` | ✅ |
| `createUser()` | `POST /admin/users` | ✅ |
| `updateUser()` | `PATCH /admin/users/:id` | ✅ |
| `removeUser()` | `DELETE /admin/users/:id` | ✅ |
| `changeRole()` | `PATCH /admin/users/:id/role` | ✅ |
| `toggleActive()` | `PATCH /admin/users/:id/toggle-active` | ✅ |
| `updateStatus()` | `PATCH /admin/users/:id/status` | ✅ |
| `resetPassword()` | `PATCH /admin/users/:id/password` | ✅ |
| `getStats()` | `GET /admin/stats/users` | ✅ |

### Dashboard Sector ✅

| FE Method | BE Endpoint | Status |
|-----------|-------------|--------|
| `getStats()` | `GET /dashboard/stats` | ✅ |
| `getMetricas()` | `GET /dashboard/metricas` | ✅ |
| `getOrdenesRecientes()` | `GET /dashboard/ordenes-recientes` | ✅ |
| `getKpis()` | `GET /dashboard/overview` | ✅ Fixed |
| `getCostosBreakdown()` | `GET /dashboard/costs/breakdown` | ✅ Fixed |
| `getPerformanceTrends()` | `GET /dashboard/performance/trends` | ✅ Fixed |

---

## Contratos y Tipos

### Enums Unificados ✅

| Enum | SSOT Location | Frontend Aligned |
|------|---------------|------------------|
| `UserRole` | `common/enums/user-role.enum.ts` | ✅ |
| `OrdenEstado` | `common/enums/orden-estado.enum.ts` | ✅ |
| `PlaneacionEstado` | Prisma `EstadoPlaneacion` | ✅ (lowercase) |

### Tipos Compartidos FE ✅

| Type | Location | Purpose |
|------|----------|---------|
| `QueryParams` | `core/api/shared-types.ts` | Query string params |
| `PaginatedResponse` | `core/api/shared-types.ts` | Pagination envelope |
| `ActionResponse` | `core/api/shared-types.ts` | Success/message pattern |
| `ApiError` | `core/api/shared-types.ts` | Error format |

---

## Pendientes P0/P1

1. [ ] Crear `ApiErrorDto` estándar en BE y alinear filters
2. [ ] Verificar orden de rutas en OrdenesController (stats antes de :id)
3. [ ] Crear clientes FE para módulos críticos:
   - `costos.api.ts`
   - `clientes.api.ts`
   - `checklists.api.ts`
4. [ ] Consolidar DTOs duplicados en BE (application/dto vs dto/)

---

## Notas de Implementación

### ApiBaseService Pattern

Todos los `*.api.ts` ahora extienden `ApiBaseService` proporcionando:
- Retry automático (1x para 5xx/network errors)
- Error handling centralizado
- Query params building con tipo `QueryParams`
- Logger integration

### Auth Flow

1. Login → Backend devuelve `{ token, csrfToken, user }`
2. FE almacena en localStorage (`cermont_access_token`, `cermont_csrf_token`)
3. Interceptor adjunta `Authorization: Bearer` + `x-csrf-token` headers
4. 401 → Intenta refresh → Si falla, redirect a login

### CSRF Implementation

- Backend: Double-submit cookie pattern
- Cookie: `cermont_csrf` (httpOnly: false para leer en JS)
- Header: `x-csrf-token` (enviado por interceptor en POST/PATCH/DELETE)
