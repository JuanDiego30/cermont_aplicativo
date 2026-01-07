# 04_INTEGRACION_BACKEND_PLAN.md — Plan de Integración Completa Backend-Frontend

## Fecha
2026-01-07

## Objetivo
Completar la integración del frontend con todos los endpoints del backend, generando servicios Angular tipados y asegurando que todas las pantallas consuman datos reales.

---

## 📋 Información Actual del Sistema

### 1. URL Base del Backend

**Desarrollo:**
- URL: `http://localhost:4000`
- Prefijo API: `/api`
- URL completa: `http://localhost:4000/api`

**Producción:**
- URL: `https://api.cermont.com`
- Prefijo API: `/api`
- URL completa: `https://api.cermont.com/api`

**Configuración:**
- Archivo: `apps/web/src/environments/environment.ts`
- Variable: `environment.apiUrl`
- Proxy config: `apps/web/proxy.conf.json` (para desarrollo)

### 2. Manejo de JWT en Frontend

**Almacenamiento:**
- **LocalStorage** (no cookies)
- Key principal: `cermont_access_token`
- Keys legacy (retrocompatibilidad): `auth_token`, `authToken`, `access_token`
- Refresh token: `refreshToken`
- Usuario: `current_user`

**Interceptores HTTP:**
1. **JwtInterceptor** (`apps/web/src/app/core/interceptors/jwt.interceptor.ts`)
   - Agrega `Authorization: Bearer <token>` automáticamente
   - Maneja refresh token en 401
   - Excluye rutas de autenticación

2. **AuthInterceptor** (`apps/web/src/app/core/interceptors/auth.interceptor.ts`)
   - Similar funcionalidad, maneja refresh automático
   - Redirige a login en caso de error

**Servicio de Storage:**
- `StorageService` (`apps/web/src/app/core/services/storage.service.ts`)
- Métodos: `getToken()`, `setToken()`, `removeToken()`
- Compatible con SSR (verifica `isPlatformBrowser`)

### 3. Estado Actual de Integración

#### ✅ **Módulos Completamente Integrados:**
1. **Dashboard** ✅
   - API: `DashboardApi` (`apps/web/src/app/core/api/dashboard.api.ts`)
   - Service: `DashboardService` (`apps/web/src/app/features/dashboard/services/dashboard.service.ts`)
   - Endpoints consumidos:
     - `GET /dashboard/stats`
     - `GET /dashboard/metricas`
     - `GET /dashboard/ordenes-recientes`
     - `GET /dashboard/kpis` (supervisor+)
     - `GET /dashboard/costs/breakdown` (supervisor+)
     - `GET /dashboard/performance/trends` (supervisor+)
     - `POST /dashboard/kpis/refresh` (admin)

2. **Auth** ✅
   - API: `AuthApi` (`apps/web/src/app/core/api/auth.api.ts`)
   - Service: `AuthService` (múltiples implementaciones)
   - Endpoints consumidos: login, register, refresh, logout

3. **Órdenes** ✅
   - API: `OrdenesApi` (`apps/web/src/app/core/api/ordenes.api.ts`)
   - Service: `OrdenesService` (`apps/web/src/app/features/ordenes/services/ordenes.service.ts`)
   - Endpoints: CRUD completo

4. **HES** ✅
   - API: `HesApi` (`apps/web/src/app/core/api/hes.api.ts`)
   - Service: `HesService` (`apps/web/src/app/features/hes/services/hes.service.ts`)
   - Endpoints: CRUD, firmas, PDF

5. **Reportes** ✅
   - API: `ReportesApi` (`apps/web/src/app/core/api/reportes.api.ts`)
   - Service: `ReportesService` (`apps/web/src/app/features/reportes/services/reportes.service.ts`)
   - Endpoints: reportes de órdenes, PDF

#### ⚠️ **Módulos Parcialmente Integrados:**
1. **Admin/Usuarios** ⚠️
   - API: `AdminApi` existe (`apps/web/src/app/core/api/admin.api.ts`)
   - Service: Verificar si está conectado a componentes
   - Pantallas: `users-list`, `user-detail`, `user-form`, `roles-permissions`

2. **Evidencias** ⚠️
   - API: `EvidenciasApi` existe (`apps/web/src/app/core/api/evidencias.api.ts`)
   - Service: Verificar implementación en componentes

3. **Kits** ⚠️
   - API: `KitsApi` existe (`apps/web/src/app/core/api/kits.api.ts`)
   - Service: `KitsService` existe pero verificar uso

4. **Mantenimientos** ⚠️
   - API: `MantenimientosApi` existe (`apps/web/src/app/core/api/mantenimientos.api.ts`)
   - Service: `MantenimientosService` existe pero verificar uso

5. **Técnicos** ⚠️
   - API: `TecnicosApi` existe (`apps/web/src/app/core/api/tecnicos.api.ts`)
   - Service: `TecnicosService` existe pero verificar uso

#### ❌ **Módulos Sin Integración:**
1. **Costos** ❌
   - Backend: `CostosController` existe
   - Frontend: No hay API service
   - Pantallas: No hay pantallas específicas (se muestra en órdenes)

2. **Checklists** ❌
   - Backend: `ChecklistsController` existe
   - Frontend: No hay API service
   - Pantallas: No identificadas

3. **Formularios** ❌
   - Backend: Formularios module existe
   - Frontend: No hay API service
   - Pantallas: No identificadas

4. **Calendario** ❌
   - Backend: No hay endpoint específico (usa órdenes)
   - Frontend: `calendario-home.component.ts` usa `OrdenesService` pero podría necesitar endpoints específicos

5. **Configuración** ❌
   - Backend: No identificado
   - Frontend: `configuracion-home.component.ts` existe pero sin servicio

6. **Planeación** ❌
   - Backend: `PlaneacionApi` existe pero verificar endpoints
   - Frontend: No hay pantallas identificadas

---

## 🎯 Plan de Acción

### Fase 1: Verificación y Completar APIs Existentes (Prioridad ALTA)

#### Task 1.1: Verificar y completar Admin/Usuarios
- [ ] Revisar `AdminApi` y verificar que todos los endpoints del backend estén mapeados
- [ ] Verificar que `users-list`, `user-detail`, `user-form` usen el API
- [ ] Verificar `roles-permissions` component
- [ ] Endpoints backend esperados:
  - `GET /admin/users` (con paginación/filtros)
  - `GET /admin/users/:id`
  - `POST /admin/users`
  - `PATCH /admin/users/:id`
  - `DELETE /admin/users/:id`
  - `GET /admin/users/:id/audit-logs`
  - `GET /admin/stats`
  - `GET /admin/roles`
  - `POST /admin/roles`
  - `PATCH /admin/roles/:id`

#### Task 1.2: Verificar y completar Evidencias
- [ ] Revisar `EvidenciasApi` y endpoints backend
- [ ] Verificar componentes que suben/descargan evidencias
- [ ] Endpoints backend esperados:
  - `POST /evidencias/upload` (multipart/form-data)
  - `GET /evidencias/:id`
  - `GET /evidencias/:id/download`
  - `GET /evidencias/orden/:ordenId`
  - `DELETE /evidencias/:id`

#### Task 1.3: Verificar Kits, Mantenimientos, Técnicos
- [ ] Revisar cada API service y comparar con endpoints backend
- [ ] Verificar que los servicios estén siendo usados en componentes
- [ ] Completar endpoints faltantes

### Fase 2: Crear APIs Faltantes (Prioridad MEDIA)

#### Task 2.1: Crear Costos API Service
**Backend endpoints identificados:**
- `GET /costos` (listar con filtros)
- `GET /costos/:id`
- `POST /costos`
- `PATCH /costos/:id`
- `DELETE /costos/:id`
- `GET /costos/orden/:ordenId`
- `GET /costos/stats`

**Archivos a crear:**
- `apps/web/src/app/core/api/costos.api.ts`
- `apps/web/src/app/core/models/costo.model.ts`
- `apps/web/src/app/features/costos/services/costos.service.ts` (si aplica)

#### Task 2.2: Crear Checklists API Service
**Backend endpoints identificados:**
- `GET /checklists`
- `GET /checklists/:id`
- `POST /checklists`
- `PATCH /checklists/:id`
- `DELETE /checklists/:id`
- `POST /checklists/:id/ejecutar`
- `GET /checklists/orden/:ordenId`

**Archivos a crear:**
- `apps/web/src/app/core/api/checklists.api.ts`
- `apps/web/src/app/core/models/checklist.model.ts`

#### Task 2.3: Crear Formularios API Service
**Backend endpoints identificados:**
- `GET /forms/templates`
- `POST /forms/templates`
- `GET /forms/instancias`
- `POST /forms/instancias`
- `GET /forms/instancias/:id`

**Archivos a crear:**
- `apps/web/src/app/core/api/formularios.api.ts`
- `apps/web/src/app/core/models/formulario.model.ts`

### Fase 3: Conectar Pantallas Faltantes (Prioridad MEDIA)

#### Task 3.1: Calendario
- [ ] Verificar si necesita endpoints específicos o si `OrdenesService` es suficiente
- [ ] Si necesita endpoints específicos, crear `GET /ordenes/calendario?fechaDesde=...&fechaHasta=...`

#### Task 3.2: Configuración
- [ ] Identificar qué configuraciones se necesitan
- [ ] Crear endpoints backend si no existen
- [ ] Crear API service y conectar componente

### Fase 4: Validación y Testing (Prioridad ALTA)

#### Task 4.1: Validar Autenticación
- [ ] Verificar que todos los requests incluyan JWT
- [ ] Verificar refresh token automático
- [ ] Verificar manejo de 401/403

#### Task 4.2: Validar Roles y Permisos
- [ ] Verificar que endpoints con restricciones de rol funcionen correctamente
- [ ] Verificar que frontend muestre/oculte opciones según rol
- [ ] Probar con diferentes roles (admin, supervisor, tecnico, cliente)

#### Task 4.3: Testing End-to-End
- [ ] Probar cada pantalla con datos reales
- [ ] Verificar manejo de errores
- [ ] Verificar loading states
- [ ] Verificar validaciones de formularios

---

## 📝 Endpoints Backend Identificados (Resumen)

### Dashboard (`/dashboard`)
- ✅ `GET /dashboard/stats`
- ✅ `GET /dashboard/metricas`
- ✅ `GET /dashboard/ordenes-recientes`
- ✅ `GET /dashboard/stats/ddd`
- ✅ `GET /dashboard/overview` (supervisor+)
- ✅ `POST /dashboard/kpis/refresh` (admin)
- ✅ `GET /dashboard/costs/breakdown` (supervisor+)
- ✅ `GET /dashboard/performance/trends` (supervisor+)

### Auth (`/auth`)
- ✅ `POST /auth/login`
- ✅ `POST /auth/register`
- ✅ `POST /auth/refresh`
- ✅ `POST /auth/logout`
- ✅ `POST /auth/forgot-password`
- ✅ `POST /auth/reset-password`
- ✅ `POST /auth/2fa/send`
- ✅ `POST /auth/2fa/verify`
- ✅ `GET /auth/me`

### Órdenes (`/ordenes`)
- ✅ `GET /ordenes` (con filtros/paginación)
- ✅ `GET /ordenes/:id`
- ✅ `POST /ordenes`
- ✅ `PATCH /ordenes/:id`
- ✅ `DELETE /ordenes/:id`
- ✅ `POST /ordenes/:id/cambiar-estado`
- ✅ `POST /ordenes/:id/asignar-tecnico`
- ✅ `GET /ordenes/:id/historial`
- ✅ `GET /ordenes/stats`

### HES (`/hes`)
- ✅ `GET /hes`
- ✅ `GET /hes/:id`
- ✅ `GET /hes/orden/:ordenId`
- ✅ `POST /hes`
- ✅ `POST /hes/:id/firmar-cliente`
- ✅ `POST /hes/:id/firmar-tecnico`
- ✅ `POST /hes/:id/completar`
- ✅ `GET /hes/:id/pdf`

### Reportes (`/reportes`)
- ✅ `GET /reportes/ordenes`
- ✅ `GET /reportes/ordenes/:id`
- ✅ `GET /reportes/ordenes/:id/pdf`

### Costos (`/costos`) - ⚠️ FALTA API SERVICE
- ❌ `GET /costos`
- ❌ `GET /costos/:id`
- ❌ `POST /costos`
- ❌ `PATCH /costos/:id`
- ❌ `DELETE /costos/:id`
- ❌ `GET /costos/orden/:ordenId`
- ❌ `GET /costos/stats`

### Checklists (`/checklists`) - ⚠️ FALTA API SERVICE
- ❌ `GET /checklists`
- ❌ `GET /checklists/:id`
- ❌ `POST /checklists`
- ❌ `PATCH /checklists/:id`
- ❌ `DELETE /checklists/:id`
- ❌ `POST /checklists/:id/ejecutar`
- ❌ `GET /checklists/orden/:ordenId`

### Admin (`/admin`) - ⚠️ VERIFICAR
- ⚠️ `GET /admin/users`
- ⚠️ `GET /admin/users/:id`
- ⚠️ `POST /admin/users`
- ⚠️ `PATCH /admin/users/:id`
- ⚠️ `DELETE /admin/users/:id`
- ⚠️ `GET /admin/users/:id/audit-logs`
- ⚠️ `GET /admin/stats`
- ⚠️ `GET /admin/roles`
- ⚠️ `POST /admin/roles`
- ⚠️ `PATCH /admin/roles/:id`

### Técnicos (`/tecnicos`) - ⚠️ VERIFICAR
- ⚠️ `GET /tecnicos`
- ⚠️ `GET /tecnicos/:id`
- ⚠️ `POST /tecnicos`
- ⚠️ `PATCH /tecnicos/:id`
- ⚠️ `DELETE /tecnicos/:id`
- ⚠️ `GET /tecnicos/stats`

### Kits (`/kits`) - ⚠️ VERIFICAR
- ⚠️ `GET /kits`
- ⚠️ `GET /kits/:id`
- ⚠️ `POST /kits`
- ⚠️ `PATCH /kits/:id`
- ⚠️ `DELETE /kits/:id`
- ⚠️ `POST /kits/:id/activar`
- ⚠️ `POST /kits/:id/desactivar`

### Mantenimientos (`/mantenimientos`) - ⚠️ VERIFICAR
- ⚠️ `GET /mantenimientos`
- ⚠️ `GET /mantenimientos/:id`
- ⚠️ `POST /mantenimientos`
- ⚠️ `PATCH /mantenimientos/:id`
- ⚠️ `DELETE /mantenimientos/:id`

### Evidencias (`/evidencias`) - ⚠️ VERIFICAR
- ⚠️ `POST /evidencias/upload`
- ⚠️ `GET /evidencias/:id`
- ⚠️ `GET /evidencias/:id/download`
- ⚠️ `GET /evidencias/orden/:ordenId`
- ⚠️ `DELETE /evidencias/:id`

---

## 🔧 Comandos para Verificar Estado Actual

```bash
# Verificar qué APIs existen
ls apps/web/src/app/core/api/

# Verificar qué servicios de features existen
find apps/web/src/app/features -name "*.service.ts"

# Verificar interceptores
ls apps/web/src/app/core/interceptors/

# Verificar configuración de environment
cat apps/web/src/environments/environment.ts
```

---

## 📌 Próximos Pasos Inmediatos

1. **Revisar y completar AdminApi** - Verificar que todos los endpoints estén mapeados
2. **Crear CostosApi** - Backend existe, frontend no tiene service
3. **Crear ChecklistsApi** - Backend existe, frontend no tiene service
4. **Verificar EvidenciasApi** - Asegurar que esté completo
5. **Testing end-to-end** - Probar cada pantalla con backend real

---

## ✅ Criterios de Aceptación

- [ ] Todos los endpoints del backend tienen su correspondiente API service en frontend
- [ ] Todas las pantallas consumen datos reales del backend (no mocks)
- [ ] JWT se envía correctamente en todos los requests
- [ ] Refresh token funciona automáticamente
- [ ] Roles y permisos se respetan en frontend y backend
- [ ] Manejo de errores es consistente
- [ ] Loading states están implementados
- [ ] Validaciones de formularios funcionan

---

## 📚 Referencias

- Backend controllers: `apps/api/src/modules/*/infrastructure/controllers/`
- Frontend APIs: `apps/web/src/app/core/api/`
- Frontend Services: `apps/web/src/app/features/*/services/`
- Environment config: `apps/web/src/environments/`
- Interceptors: `apps/web/src/app/core/interceptors/`

