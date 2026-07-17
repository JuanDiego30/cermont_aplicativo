# Prompt de Implementación CERMONT V4.1 — Runtime Repair + Kits + Costos

> **Versión:** 4.1
> **Creado:** 2026-07-07
> **Propósito:** Corregir errores runtime reales, madurar Kits profesionales y Costos reales.
> **Regla de oro:** No implementar Kits ni Costos hasta que Sprint 0 pase con 0 errores runtime.

---

## Índice

1. [IDENTIDAD Y REGLAS INQUEBRANTABLES](#1-identidad-y-reglas-inquebrantables)
2. [DOCUMENTOS OBLIGATORIOS A LEER](#2-documentos-obligatorios-a-leer)
3. [DIAGNÓSTICO INICIAL — SPRINT 0 RUNTIME CONTRACT REPAIR](#3-sprint-0--runtime-contract-repair)
4. [CORRECCIÓN 1 — NOTIFICATIONS/UNREAD-COUNT 404](#4-corrección-obligatoria-1--notificationsunread-count)
5. [CORRECCIÓN 2 — DASHBOARD/OPERATIONAL-KPIS 404](#5-corrección-obligatoria-2--dashboardoperational-kpis)
6. [CORRECCIÓN 3 — DASHBOARD/SLA-RISK 404](#6-corrección-obligatoria-3--dashboardsla-risk)
7. [CORRECCIÓN 4 — ERP-CONNECTORS/NEW 404](#7-corrección-obligatoria-4--erp-connectorsnew)
8. [CORRECCIÓN 5 — RADIX DIALOG WARNINGS](#8-corrección-obligatoria-5--radix-dialog-warnings)
9. [DEFINITION OF DONE SPRINT 0](#9-definition-of-done-sprint-0)
10. [SPRINT 1 — KITS PROFESIONALES CERMONT](#10-sprint-1--kits-profesionales-cermont)
11. [SPRINT 2 — COSTOS REALES Y RENTABILIDAD](#11-sprint-2--costos-reales-y-rentabilidad)
12. [SPRINT 3 — INVENTARIO DE MADUREZ DE 95 PÁGINAS](#12-sprint-3--inventario-de-madurez-de-páginas)
13. [PRUEBAS OBLIGATORIAS](#13-pruebas-obligatorias)
14. [EVIDENCIA OBLIGATORIA](#14-evidencia-obligatoria)
15. [COMANDOS OBLIGATORIOS](#15-comandos-obligatorios)
16. [STOP CONDITIONS](#16-stop-conditions)
17. [REGLAS DE CALIDAD — PROHIBIDO](#17-reglas-de-calidad--prohibido)
18. [GUARD RAILS — SEGURIDAD E INTEGRIDAD](#18-guard-rails--seguridad-e-integridad)

---

## 1. IDENTIDAD Y REGLAS INQUEBRANTABLES

Eres un **ingeniero fullstack sénior** contratado para una **corrección quirúrgica de runtime** y una **maduración funcional** de los módulos Kits y Costos de CERMONT S.A.S.

### Stack (No negociable)

```
Express 5.2.1    → backend
Next.js 16       → frontend
React 19         → UI
Mongoose 9.x     → MongoDB ODM
Zod 4.x          → validación
TanStack Query 5 → server state
Zustand 5        → client state
Tailwind 4       → estilos
Radix UI         → componentes accesibles
```

### Stack prohibido (rechazar instantáneamente)

```
❌ NestJS        ❌ Prisma         ❌ PostgreSQL
❌ Auth.js       ❌ pnpm/yarn      ❌ middleware.ts
❌ Joi           ❌ Axios          ❌ try/catch en controllers Express 5
```

### Contrato de respuesta API (obligatorio en todo endpoint nuevo o corregido)

```typescript
// Éxito
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```

### Regla de prioridad absoluta

**No tocar Kits ni Costos hasta que Sprint 0 (Runtime Contract Repair) pase completamente.**

El build puede pasar (`npm run verify` exit 0) pero el navegador tiene errores 404 reales. Verify no equivale a runtime sano.

### Orden de ejecución obligatorio

```
1. Sprint 0 — Runtime Contract Repair
2. Reportar resultados Sprint 0
3. Si Sprint 0 pasa → Sprint 1 — Kits profesionales
4. Reportar resultados Sprint 1
5. Si Sprint 1 pasa → Sprint 2 — Costos reales
6. Reportar resultados Sprint 2
7. Sprint 3 — Inventario de madurez de páginas
8. NO avanzar a otros módulos sin aprobación explícita.
```

### Evidencia antes de tocar código

Cada sprint debe empezar con:
```powershell
New-Item -ItemType Directory -Force .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime
```

Cada evidencia se guarda en `.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-{NN}-{nombre}/`.

Si un archivo/ruta no existe, **reportarlo**. No inventar contenido.

---

## 2. DOCUMENTOS OBLIGATORIOS A LEER

Leer COMPLETAMENTE antes de implementar cualquier cambio. Extraer:
- Campos de formulario
- Checklist items
- Herramientas/equipos/EPP
- Evidencias requeridas
- Reglas de negocio
- Jerarquías y validaciones
- Integraciones con los 14 pasos del workflow

### Planos funcionales CERMONT

```txt
.sisyphus/plans/01_main10.md
.sisyphus/plans/02_INDUCCION_SGSST3.md
.sisyphus/plans/03_Jerarquia_de_controles_Cermont2.md
.sisyphus/plans/04_ATG_JUAN_DIEGO_AREVALO-13.md
.sisyphus/plans/05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA3.md
.sisyphus/plans/06_FORMATO_DE_PLANEACION_DE_OBRA3.md
.sisyphus/plans/07_DESARROLLO_DE_UN_APLICATIVO_WEB_PARA_APOYO_EN_LA_EJECUCION_Y_CIERRE_ADMINISTRATIVO_DE_LOS_TRABA3.md
.sisyphus/plans/08_Formato_Inspeccion_lineas_de_vida_Vertical3.md
.sisyphus/plans/09_Observaciones_Anteproyecto_Juan_Diego2.md
.sisyphus/plans/10_Formato_Mantenimiento_CCTV3.md
```

### Planos maestros de implementación

```txt
.sisyphus/plans/cermont-functional-refactor-masterplan-v4.md
.sisyphus/plans/cermont-product-implementation-masterplan.v3.md
.sisyphus/plans/LTG_JUAN_DIEGO_AREVALO-3_markdown.md
.sisyphus/plans/REGLAS_DESARROLLO_CERMONT.md
```

### Verificación de existencia

```powershell
Get-ChildItem -Recurse .sisyphus\plans | Select-Object FullName
```

Si algún archivo listado arriba no aparece en el resultado, reportarlo exactamente como: `[DOCUMENTO FALTANTE] .sisyphus/plans/<nombre>`.

---

## 3. SPRINT 0 — RUNTIME CONTRACT REPAIR

### 3.1 — Diagnóstico inicial

```powershell
# Crear directorio de evidencia
New-Item -ItemType Directory -Force .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime

# Capturar estado actual
git status --short --branch | Tee-Object -FilePath .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/git-status-before.txt
```

Luego iniciar backend + frontend:
```powershell
# Terminal 1: backend
npm run dev -w backend

# Terminal 2: frontend
npm run dev -w frontend
```

Esperar a que ambos servidores estén listos (backend: `http://localhost:4000`, frontend: `http://localhost:3000`).

### 3.2 — Apertura de URLs problemáticas

Abrir en navegador (o usar `Invoke-WebRequest`):

```txt
http://localhost:3000/dashboard
http://localhost:3000/notifications
http://localhost:3000/admin/erp-connectors
http://localhost:3000/resources/kits
http://localhost:3000/costs
```

### 3.3 — Captura de evidencia de runtime

```powershell
# Capturar errores de consola y red
# Abrir Chrome DevTools (F12) en cada URL y guardar:
# 1. Console output → .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/console-before.md
# 2. Network errors (404/500) → .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/network-before.md
```

### 3.4 — Diagnóstico en 5 capas para CADA endpoint 404

Para CADA uno de estos endpoints:

```txt
/api/backend/notifications/unread-count
/api/backend/dashboard/operational-kpis
/api/backend/dashboard/sla-risk
```

Ejecutar diagnóstico completo:

#### Capa A — Frontend caller

```powershell
Get-ChildItem -Path "frontend/src" -Recurse -Filter "*.ts" -Name | ForEach-Object { Select-String -Path "frontend/src/$_" -Pattern "unread-count|operational-kpis|sla-risk" -SimpleMatch }
Get-ChildItem -Path "frontend/src" -Recurse -Filter "*.tsx" -Name | ForEach-Object { Select-String -Path "frontend/src/$_" -Pattern "unread-count|operational-kpis|sla-risk" -SimpleMatch }
```

Identificar:
- ¿Quién llama cada endpoint?
- ¿Qué hook/componente lo consume?
- ¿El path coincide exactamente con el que espera el proxy?

#### Capa B — Proxy Next.js

Leer y verificar:

```txt
frontend/src/app/api/backend/[...path]/route.ts
frontend/src/lib/http/api-client.ts
frontend/src/lib/http/api-client-constants.ts
frontend/next.config.ts
frontend/proxy.ts
```

Verificar que:

1. `apiClient` use `API_ROOT = "/api/backend"` → el path final será `/api/backend/notifications/unread-count`
2. El route handler `frontend/src/app/api/backend/[...path]/route.ts` convierta `/api/backend/notifications/unread-count` → `http://localhost:4000/api/notifications/unread-count`
3. El proxy preserve el header `Authorization`
4. El proxy preserve cookies
5. El proxy no pierda path segments (especialmente rutas con guiones como `operational-kpis`)
6. `next.config.ts` NO tenga rewrites que compitan con el route handler
7. `proxy.ts` NO redirija estas rutas al login

#### Capa C — Backend mount

Verificar:

```txt
backend/src/index.ts       → ¿dónde se importan dashboardRoutes y notificationsRoutes?
backend/src/modules/dashboard/dashboard.routes.ts
backend/src/modules/notifications/notifications.routes.ts
```

Confirmar:

1. `dashboardRoutes` importado e incluido en `API_MOUNTS` con prefix `/api/dashboard`
2. `notificationsRoutes` importado e incluido en `API_MOUNTS` con prefix `/api/notifications`
3. Las rutas específicas existen en los routers:
   - `GET /operational-kpis` → `getOperationalKpis`
   - `GET /sla-risk` → `getSlaRisk`
   - `GET /unread-count` → `getUnreadCount`

#### Capa D — OpenAPI runtime

```powershell
Invoke-WebRequest http://localhost:4000/api/docs/openapi.json -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -ExpandProperty paths
```

Verificar que OpenAPI liste:

```txt
/api/notifications/unread-count
/api/dashboard/operational-kpis
/api/dashboard/sla-risk
```

#### Capa E — Request directa al backend (sin proxy)

```powershell
Invoke-WebRequest http://localhost:4000/api/notifications/unread-count -UseBasicParsing -SkipCertificateCheck
Invoke-WebRequest http://localhost:4000/api/dashboard/operational-kpis -UseBasicParsing -SkipCertificateCheck
Invoke-WebRequest http://localhost:4000/api/dashboard/sla-risk -UseBasicParsing -SkipCertificateCheck
```

### 3.5 — Interpretación de resultados (OBLIGATORIO)

```txt
Si backend directo responde 404:
  → La ruta NO está montada o el build del backend está desactualizado.
  → Solución: revisar mount en index.ts, recompilar, reiniciar.

Si backend directo responde 401/403 (esperado, sin token):
  → El backend SÍ tiene la ruta montada correctamente.
  → El 404 viene del proxy, service worker o frontend route handler.
  → Solución: revisar [...path]/route.ts, next.config.ts, service worker.

Si backend directo responde 200 y proxy responde 404:
  → El proxy no está reenviando correctamente.
  → Solución: revisar [...path]/route.ts, enviar headers de auth, verificar cookies.

Si OpenAPI no lista las rutas:
  → API_MOUNTS no incluye el router o el router está vacío.
  → El build del backend no refleja el código actual.

Si OpenAPI lista las rutas pero runtime da 404:
  → El backend ejecutado NO corresponde al código en disco.
  → Solución: detener servidor, recompilar, reiniciar.
```

### 3.6 — Mapa de decisión — Service Worker

Si las rutas funcionan directo al backend (401/403) pero fallan vía proxy, verificar service worker:

```txt
frontend/public/service-worker.js  → buscar reglas de fetch para /api/backend/* y /api/*
frontend/src/lib/pwa/sw-registration.ts  → registro del SW
```

Regla obligatoria: el service worker NO debe interceptar peticiones GET a `/api/backend/*` para devolver 404. Debe pasarlas al network o al proxy. Si hay una regla incorrecta en el SW, corregirla.

Prohibido:
- Desactivar el service worker sin entender qué regla causa el 404
- Hacer bypass general del SW sin análisis específico

---

## 4. CORRECCIÓN OBLIGATORIA 1 — NOTIFICATIONS/UNREAD-COUNT

### Archivos a verificar y/o modificar

```txt
backend/src/modules/notifications/notifications.routes.ts
backend/src/modules/notifications/notification.controller.ts
backend/src/modules/notifications/notification.service.ts
frontend/src/modules/notifications/api/notification.api.ts
frontend/src/modules/notifications/hooks/useUnreadCount.ts
frontend/src/modules/core/ui/layout/HeaderNotifications.tsx
frontend/src/modules/core/ui/layout/Header.tsx
```

### Checklist de corrección

- [ ] `notifications.routes.ts` tiene `GET /unread-count` ANTES de `GET /:id` (orden de rutas Express)
- [ ] El router está montado en `/api/notifications` en `backend/src/index.ts`
- [ ] El controller `getUnreadCount` existe y llama al service
- [ ] El service `getUnreadCount` existe y retorna `{ success: true, data: { count: number } }`
- [ ] `notification.api.ts` llama `fetchUnreadCount` que usa path `/notifications/unread-count`
- [ ] `useUnreadCount` usa `queryKey: ["notifications", "unread-count"]` (estable, sin Math.random)
- [ ] `HeaderNotifications.tsx` usa `useUnreadCount().data` y no tiene fallback silencioso
- [ ] El endpoint responde envelope: `{ success: true, data: { count: number } }`
- [ ] Si el endpoint falla (backend caído), `HeaderNotifications` se oculta o muestra estado offline sin romper el header
- [ ] **Prohibido**: `try/catch` vacío que oculte el error
- [ ] **Prohibido**: fallback que retorne `{ count: 0 }` silenciosamente cuando backend responde 500

### Tests obligatorios

```txt
Backend:
  - backend/src/modules/notifications/__tests__/unread-count.route.test.ts
  - Verificar GET /api/notifications/unread-count con token → 200 + { success: true, data: { count } }
  - Verificar GET sin token → 401
  - Verificar que /unread-count se resuelva antes que /:id

Frontend:
  - test que HeaderNotifications renderiza sin 404 ni error en consola
  - test que fetchUnreadCount parsea correctamente la respuesta
  - test que useUnreadCount tiene queryKey estable
```

---

## 5. CORRECCIÓN OBLIGATORIA 2 — DASHBOARD/OPERATIONAL-KPIS

### Archivos a verificar y/o modificar

```txt
backend/src/modules/dashboard/dashboard.routes.ts
backend/src/modules/dashboard/dashboard.controller.ts
backend/src/modules/dashboard/dashboard.service.ts
backend/src/modules/dashboard/dashboard-operational-kpi.service.ts
frontend/src/app/(dashboard)/dashboard/page.tsx
frontend/src/modules/dashboard/queries.ts (o equivalente)
frontend/src/modules/dashboard/ui/
```

### Checklist de corrección

- [ ] `dashboard.routes.ts` tiene `GET /operational-kpis` → `getOperationalKpis`
- [ ] Controller `getOperationalKpis` existe y llama service correspondiente
- [ ] Service `getOperationalKPIs` existe en `dashboard-operational-kpi.service.ts`
- [ ] El nombre del endpoint es EXACTAMENTE `operational-kpis` (con guión y plural)
- [ ] El endpoint responde: `{ success: true, data: { ... } }` con estructura válida
- [ ] Si no hay datos operacionales, devuelve estructura vacía válida, **NO 404**
- [ ] **Prohibido usar mock data.** Si no hay datos reales, el service retorna estructura vacía
- [ ] El frontend que consume este endpoint usa la URL exacta `/dashboard/operational-kpis` via `apiClient`

### Tests obligatorios

```txt
Backend:
  - backend/src/modules/dashboard/__tests__/operational-kpis.route.test.ts
  - Verificar GET /api/dashboard/operational-kpis con token → 200 + estructura válida
  - Verificar respuesta sin datos (base vacía) → 200, no 404

Frontend:
  - test que el dashboard widget consume operational-kpis sin error
  - test que parsea correctamente la respuesta
```

---

## 6. CORRECCIÓN OBLIGATORIA 3 — DASHBOARD/SLA-RISK

### Archivos a verificar y/o modificar

```txt
backend/src/modules/dashboard/dashboard.routes.ts
backend/src/modules/dashboard/dashboard.controller.ts
backend/src/modules/dashboard/dashboard-sla.service.ts
backend/src/modules/dashboard/dashboard.service.ts
frontend/src/app/(dashboard)/dashboard/page.tsx
frontend/src/modules/dashboard/queries.ts
```

### Checklist de corrección

- [ ] `dashboard.routes.ts` tiene `GET /sla-risk` → `getSlaRisk`
- [ ] Controller `getSlaRisk` existe
- [ ] Service `buildSlaRiskOrders` existe
- [ ] El endpoint responde array vacío `[]` si no hay órdenes en riesgo, **NO 404**
- [ ] El frontend usa URL exacta `/dashboard/sla-risk`

### Tests obligatorios

```txt
Backend:
  - backend/src/modules/dashboard/__tests__/sla-risk.route.test.ts
  - Verificar GET /api/dashboard/sla-risk con token → 200 + array
  - Verificar array vacío cuando no hay riesgo

Frontend:
  - test que el widget SLA risk consume endpoint real sin 404
```

---

## 7. CORRECCIÓN OBLIGATORIA 4 — ERP-CONNECTORS/NEW

### Diagnóstico

Buscar la procedencia del link roto:

```powershell
Get-ChildItem -Path "frontend/src" -Recurse -Filter "*.tsx" -Name | ForEach-Object { Select-String -Path "frontend/src/$_" -Pattern "erp-connectors/new" -SimpleMatch }
```

Verificar archivos:

```txt
frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx
frontend/src/app/(dashboard)/admin/erp-connectors/loading.tsx
frontend/src/app/(dashboard)/admin/erp-connectors/error.tsx
frontend/src/app/(dashboard)/erp-connector/page.tsx
```

### Árbol de decisión

**Paso 1**: Verificar si existe backend para ERP Connectors:

```txt
backend/src/modules/erp-connector/ (o similar)
backend/src/models/ErpConnector.ts  (o similar)
packages/shared-types/src/schemas/erp-connector.schema.ts  (o similar)
```

**Paso 2A — Si existe backend create + schema create**:
- Crear ruta real `/admin/erp-connectors/new` con formulario funcional
- El formulario debe usar contrato de `@cermont/shared-types`
- Debe crear el conector vía API POST
- Agregar validación Zod
- Agregar tests

**Paso 2B — Si NO existe backend create**:
- Cambiar el enlace en `page.tsx` para NO apuntar a ruta muerta
- Mostrar CTA deshabilitado con explicación: "La creación de conectores ERP estará disponible en una próxima actualización."
- NO dejar el enlace roto
- NO eliminar la página existente si tiene datos funcionales

### Prohibido

- Dejar enlace `<a href="/admin/erp-connectors/new">` que da 404
- Crear página vacía sin funcionalidad
- Crear endpoint sin uso frontend

---

## 8. CORRECCIÓN OBLIGATORIA 5 — RADIX DIALOG WARNINGS

### Diagnóstico

```powershell
Get-ChildItem -Path "frontend/src" -Recurse -Filter "*.tsx" -Name | ForEach-Object { Select-String -Path "frontend/src/$_" -Pattern "Dialog.Content|DialogContent" }
```

### Regla por cada DialogContent

Cada `<Dialog.Content>` (o `DialogContent`) DEBE tener:

```tsx
<Dialog.Title>...</Dialog.Title>
<Dialog.Description>...</Dialog.Description>
```

Excepciones permitidas:

1. Si el título debe estar oculto visualmente:
   ```tsx
   <Dialog.Title className="sr-only">Title for screen readers</Dialog.Title>
   ```
   (usar `sr-only` de Tailwind, no instalar `VisuallyHidden` si no existe ya)

2. Si la descripción es intencionalmente omitida:
   ```tsx
   <Dialog.Content aria-describedby={undefined}>
   ```
   **Solo si está justificado documentalmente** (ej: modal puramente visual sin contenido descriptivo)

### Investigación adicional

Si después de corregir todos los DialogContent conocidos los warnings persisten, buscar:

```powershell
Get-ChildItem -Path "node_modules" -Recurse -Filter "*.tsx" -Name | ForEach-Object { Select-String -Path "node_modules/$_" -Pattern "DialogContent" } -First 20
```

Pueden ser componentes de librerías que envuelven Radix (ej: shadcn/ui, recharts tooltips modales). Si es una librería externa, reportar el warning como externo y documentarlo.

### Prohibido

- Instalar nuevas dependencias para corregir warnings de Radix
- Ignorar warnings
- Eliminar DialogContent sin reemplazo

---

## 9. DEFINITION OF DONE SPRINT 0

Sprint 0 se completa **SOLO** si TODAS las siguientes condiciones se cumplen:

### Condiciones de runtime

```txt
✅ 0 errores 404 en consola para /api/backend/notifications/unread-count
✅ 0 errores 404 en consola para /api/backend/dashboard/operational-kpis
✅ 0 errores 404 en consola para /api/backend/dashboard/sla-risk
✅ 0 rutas muertas: /admin/erp-connectors/new no da 404 ni existe enlace roto
✅ 0 warnings "DialogContent requires a DialogTitle"
✅ 0 warnings "Missing Description or aria-describedby={undefined}"
✅ Console errors = 0 (cero) en dashboard, notifications, admin/erp-connectors
✅ Network 404 = 0 (cero) en dashboard, notifications, kits, costs, fleet
```

### Condiciones de calidad

```txt
✅ npm run typecheck → exit 0
✅ npm run lint → exit 0
✅ npm run test → exit 0 (tests existentes + nuevos)
✅ npm run contracts:check → exit 0
✅ npm run build → exit 0
✅ npm run verify → exit 0
```

### Condiciones de evidencia

```txt
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/audit-before.md
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/commands.md
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/test-results.md
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/implementation-notes.md
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/screenshots-before/ (capturas de consola con errores)
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/screenshots-after/ (capturas de consola sin errores)
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/network-before.md
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/network-after.md
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/console-before.md
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/console-after.md
✅ .sisyphus/evidence/v4-1-runtime-kits-costs/sprint-00-runtime/product-slice-report.md
```

Si alguna condición falla, **NO avanzar a Sprint 1**. Reportar exactamente qué condición falló y diagnosticar.

---

## 10. SPRINT 1 — KITS PROFESIONALES CERMONT

Solo después de que Sprint 0 esté 100% completo.

### 10.1 — Rutas principales

```txt
/resources/kits                          → listado de kits
/resources/kits/new                      → crear kit
/resources/kits/[id]                     → detalle de kit
/resources/kits/[id]/edit                → editar kit
/planning                                → planning con selector de kit
/orders/[id]/planning                    → planning de orden con aplicación de kit
```

### 10.2 — Archivos a leer (inspeccionar TODOS antes de modificar)

```txt
# Contratos (SSOT)
packages/shared-types/src/schemas/kit.schema.ts
packages/shared-types/src/index.ts

# Reglas de dominio
packages/domain/src/kit.rules.ts

# Backend
backend/src/models/Kit.ts
backend/src/models/MaintenanceKit.ts
backend/src/modules/kit/kit.routes.ts
backend/src/modules/kit/kit.controller.ts
backend/src/modules/kit/kit.service.ts
backend/src/config/kit-templates.ts

# Frontend
frontend/src/app/(dashboard)/resources/kits/page.tsx
frontend/src/app/(dashboard)/resources/kits/new/page.tsx
frontend/src/app/(dashboard)/resources/kits/[id]/page.tsx
frontend/src/modules/kits/api/kits.api.ts
frontend/src/modules/kits/hooks/useKits.ts
frontend/src/modules/kits/ui/KitWizardForm.tsx
frontend/src/modules/kits/ui/KitForm.tsx
frontend/src/modules/kits/ui/KitCard.tsx
frontend/src/modules/kits/ui/KitItemSection.tsx
frontend/src/modules/kits/ui/KitAttachmentsSection.tsx
frontend/src/modules/kits/ui/KitDetailHero.tsx
frontend/src/modules/kits/ui/KitItemSectionCard.tsx
frontend/src/modules/kits/ui/KitMetadataCard.tsx
frontend/src/modules/kits/ui/KitsStatsGrid.tsx
frontend/src/modules/kits/constants.ts
```

### 10.3 — Problemas conocidos a corregir

```txt
1. KitWizardForm usa schema LOCAL duplicado → debe usar contrato de @cermont/shared-types
2. KitWizardForm onSubmit usa Record<string, unknown> → tipar correctamente
3. Kits no están alimentados por documentos reales de CERMONT
4. No hay templates seed para CCTV
5. No hay templates seed para líneas de vida verticales
6. No hay EPP basado en documento SGSST
7. No hay jerarquía de controles conectada al AST
8. No hay checklist conectado al kit
9. No hay evidencia fotográfica requerida por kit
10. No hay autofill real hacia Planning Packet
11. No hay validación de kit incompleto (readiness)
```

### 10.4 — Documentos CERMONT que deben alimentar los kits

| Documento | Kit resultante |
|---|---|
| `10_Formato_Mantenimiento_CCTV3.md` | Kit mantenimiento CCTV |
| `08_Formato_Inspeccion_lineas_de_vida_Vertical3.md` | Kit inspección líneas de vida verticales |
| `05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA3.md` | Kit evidencia fotográfica anclaje/escalera/estructura |
| `02_INDUCCION_SGSST3.md` | Kit SGSST básico campo |
| `03_Jerarquia_de_controles_Cermont2.md` | Validaciones de jerarquía en AST |

### 10.5 — Resultado funcional esperado

Después de implementar Sprint 1, el sistema debe permitir:

1. **Kit profesional CCTV** con:
   - Checklist de mantenimiento CCTV (del documento `10_Formato_Mantenimiento_CCTV3.md`)
   - Herramientas típicas: multímetro, cámara térmica, kit de limpieza de lentes, etc.
   - Equipos típicos: DVR, cámaras, fuentes de poder, cables, conectores BNC
   - EPP requerido: casco, guantes dieléctricos, botas de seguridad, arnés (si aplica)
   - Materiales: cinta aislante, terminales, canaletas
   - Documentos: AST, PTW, formato de mantenimiento CCTV
   - Evidencias requeridas: foto de cámara antes/después, foto de rack, foto de etiqueta
   - Campos de hallazgos
   - Campos de acciones correctivas
   - Relación con informe técnico

2. **Kit inspección líneas de vida verticales** con:
   - Checklist de inspección (del documento `08_Formato_Inspeccion_lineas_de_vida_Vertical3.md`)
   - Campos: conformidad, no conformidad, no aplica por cada punto
   - Evidencias por punto inspeccionado
   - Requisitos de certificación del inspector
   - Relación con trabajo en alturas
   - Relación con AST/PTW

3. **Kit anclaje/escalera/estructura** con:
   - Catálogo de evidencias fotográficas requeridas (del documento `05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA3.md`)
   - Plantilla de fotos de anclaje, escalera, estructura
   - Validación de fotos obligatorias por checklist
   - Galería asociada a informe técnico

4. **Kit SGSST básico campo** con:
   - Requisitos SGSST (del documento `02_INDUCCION_SGSST3.md`)
   - Validación de personal habilitado
   - Checklist de seguridad
   - Bloqueo de planeación si falta inducción

5. **UI de kits funcional**:
   - Filtros por actividad: CCTV, líneas de vida, mantenimiento eléctrico, HSE, general
   - Creación de kit con formulario que usa contrato `@cermont/shared-types`
   - Vista de detalle con herramientas, equipos, EPP, materiales, documentos, checklist, evidencias
   - Aplicación de kit a planning: autofill de herramientas/equipos/EPP/checklists/documentos
   - Estado de readiness del kit: `incomplete`, `ready`, `critical`
   - Tests backend y frontend

### 10.6 — Seeds/templates requeridos

Crear o extender `backend/src/config/kit-templates.ts` con al menos:

```typescript
export const KIT_TEMPLATES = {
  "kit-cctv-maintenance": {
    name: "Mantenimiento Preventivo CCTV",
    description: "Kit estándar para mantenimiento preventivo de sistemas CCTV",
    activityType: "cctv",
    serviceCategory: "maintenance",
    riskLevel: "medium",
    estimatedDurationHours: 4,
    tools: ["multímetro digital", "kit limpieza lentes", "destornillador precision", ...],
    equipment: ["DVR portátil test", "monitor portátil", "fuente poder regulable", ...],
    materials: ["cinta aislante 3M", "terminales RJ45", "conectores BNC", ...],
    epp: ["casco dieléctrico", "guantes dieléctricos clase 0", "botas seguridad", ...],
    documents: ["AST", "PTW", "formato mantenimiento CCTV"],
    checklistItems: [...], // del documento 10
    requiredEvidence: [...], // fotos específicas CCTV
    requiredCertifications: ["trabajo alturas", "riesgo eléctrico"],
    sourceDocument: "10_Formato_Mantenimiento_CCTV3.md",
  },
  "kit-lifeline-vertical-inspection": {
    name: "Inspección Líneas de Vida Verticales",
    description: "Kit para inspección de líneas de vida verticales según normativa",
    activityType: "lifeline",
    serviceCategory: "inspection",
    riskLevel: "high",
    estimatedDurationHours: 3,
    tools: ["torquímetro", "medidor de tensión", "cámara fotográfica", ...],
    equipment: ["andamio", "línea de vida portátil", "punto de anclaje móvil", ...],
    materials: ["etiquetas", "marcadores", "formato inspección", ...],
    epp: ["arnés cuerpo completo", "eslinga doble", "absorvedor energía", ...],
    documents: ["AST", "PTW", "certificado inspector", "normativa aplicable"],
    checklistItems: [...], // del documento 08
    requiredEvidence: [...], // fotos específicas líneas de vida
    requiredCertifications: ["trabajo alturas avanzado", "inspector líneas vida"],
    sourceDocument: "08_Formato_Inspeccion_lineas_de_vida_Vertical3.md",
  },
  "kit-anchor-ladder-structure-photo-evidence": {
    name: "Evidencia Fotográfica Anclaje/Escalera/Estructura",
    description: "Kit de captura de evidencia fotográfica reglamentaria",
    activityType: "anchor-structure",
    serviceCategory: "inspection",
    riskLevel: "medium",
    estimatedDurationHours: 2,
    tools: ["cámara con geolocalización", "flexómetro", "nivel", ...],
    equipment: ["dron (si aplica)", "escalera", "punto referencia métrico", ...],
    epp: ["casco", "guantes", "botas", "arnés", "eslinga"],
    documents: ["guía fotográfica", "formato registro fotográfico"],
    checklistItems: [...], // del documento 05
    requiredEvidence: [...], // fotos específicas
    requiredCertifications: [],
    sourceDocument: "05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA3.md",
  },
  "kit-sgsst-basic-field-safety": {
    name: "Inducción SGSST Básica Campo",
    description: "Kit de verificación de requisitos SGSST antes de ingreso a campo",
    activityType: "safety",
    serviceCategory: "induction",
    riskLevel: "medium",
    estimatedDurationHours: 1,
    tools: [],
    equipment: [],
    materials: ["formato inducción SGSST", "carnet inducción", "EPP asignado", ...],
    epp: ["casco", "guantes", "botas", "chaleco reflectivo", "gafas seguridad"],
    documents: ["certificado inducción SGSST", "exámen médico", "afiliación ARL"],
    checklistItems: [...], // del documento 02
    requiredEvidence: ["foto carnet inducción", "foto EPP asignado"],
    requiredCertifications: ["inducción SGSST aprobada", "examen médico ocupacional"],
    sourceDocument: "02_INDUCCION_SGSST3.md",
  },
};
```

Los `checklistItems` y `requiredEvidence` deben extraerse de los documentos reales, no ser genéricos.

### 10.7 — Contratos a reutilizar/extender

```typescript
// @cermont/shared-types
KitSchema
CreateKitSchema  
UpdateKitSchema
KitItemSchema
KitAttachmentSchema

// Para relación con planning
ApplyKitToPlanningSchema  // si no existe, crearlo
PlanningKitSnapshotSchema  // si no existe, crearlo

// Para readiness
ReadinessCheckItemSchema  // si no existe, crearlo
SupportDocumentSchema  // si no existe, crearlo
```

**Prohibido**: crear DTO local duplicado en frontend. Todo debe venir de `@cermont/shared-types`.

### 10.8 — Tests obligatorios Sprint 1

```txt
Backend:
  - GET /api/kits → 200 + lista (con y sin filtros)
  - POST /api/kits con payload válido → 201
  - POST /api/kits con payload inválido → 400
  - POST /api/kits/apply-to-planning → 200 + snapshot
  - Kit templates seed devuelven estructura correcta

Frontend:
  - Kits page renderiza sin error
  - Kits page muestra templates CCTV/líneas de vida al cargar seeds
  - KitWizardForm NO usa Record<string, unknown> → tipo explícito
  - KitWizardForm usa CreateKitSchema de @cermont/shared-types
  - Aplicar kit a planning genera snapshot correcto
```

### 10.9 — Evidencia Sprint 1

```txt
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/audit-before.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/commands.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/test-results.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/implementation-notes.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/screenshots-before/
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/screenshots-after/
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/network-before.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/network-after.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/console-before.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/console-after.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-01-kits/product-slice-report.md
```

---

## 11. SPRINT 2 — COSTOS REALES Y RENTABILIDAD

Solo después de Sprint 1.

### 11.1 — Rutas principales

```txt
/costs                                  → tablero de costos reales
/costs/[orderId]                        → comparación propuesta vs real por orden
/costs/[orderId]/ejecucion              → registro de costos reales en campo
/orders/[id]/costs                      → pestaña de costos en detalle de orden
/proposals/new                          → propuesta alimenta presupuesto base
/dashboard                              → alerta de sobrecosto
```

### 11.2 — Archivos a leer (inspeccionar TODOS antes de modificar)

```txt
# Contratos
packages/shared-types/src/schemas/cost.schema.ts
packages/shared-types/src/schemas/cost-cart.schema.ts
packages/shared-types/src/schemas/cost-suggest.schema.ts
packages/shared-types/src/schemas/cost-traceability.schema.ts
packages/shared-types/src/schemas/costControl.schema.ts

# Reglas de dominio
packages/domain/src/cost.rules.ts

# Backend
backend/src/models/Cost.ts
backend/src/models/CostCatalogItem.ts
backend/src/models/CostControl.ts
backend/src/modules/cost/cost.routes.ts
backend/src/modules/cost/cost.controller.ts
backend/src/modules/cost/cost.service.ts
backend/src/modules/cost/cost-catalog.service.ts
backend/src/modules/cost/cost-budget-alert.service.ts
backend/src/modules/cost/cost-suggest.service.ts

# Frontend
frontend/src/app/(dashboard)/costs/page.tsx
frontend/src/app/(dashboard)/costs/[orderId]/page.tsx
frontend/src/app/(dashboard)/costs/[orderId]/ejecucion/page.tsx
frontend/src/app/(dashboard)/orders/[id]/costs/page.tsx
frontend/src/modules/costs/queries.ts
frontend/src/modules/costs/cost-export.ts
frontend/src/modules/costs/hooks/useOrderCostSummary.ts
frontend/src/modules/costs/ui/CostForm.tsx
frontend/src/modules/costs/ui/CostPanel.tsx
frontend/src/modules/costs/ui/CostComparisonChart.tsx
frontend/src/modules/costs/ui/CostDeviationStackedBar.tsx
frontend/src/modules/costs/ui/MarginSummaryCard.tsx
frontend/src/modules/costs/ui/BudgetConsumedGauge.tsx
frontend/src/modules/costs/ui/BaselineCostCard.tsx
frontend/src/modules/costs/ui/CostBreakdownTable.tsx
frontend/src/modules/costs/ui/CostBudgetStatus.tsx
frontend/src/modules/costs/ui/CostCatalogForm.tsx
frontend/src/modules/costs/ui/CostCatalogPanel.tsx
frontend/src/modules/costs/ui/CostExportButton.tsx
frontend/src/modules/costs/ui/CostSummaryCard.tsx
frontend/src/modules/orders/ui/detail/OrderCostsTab.tsx
frontend/src/modules/service-cases/components/CostComparisonPanel.tsx
```

### 11.3 — Problemas conocidos a corregir

```txt
1. Costos existen como módulos pero no cierran el problema empresarial de rentabilidad
2. No hay flujo claro propuesta → presupuesto → costo real → desviación → margen
3. No se exige soporte documental/evidencia para costo real
4. No hay tablero de rentabilidad por orden (margen estimado vs real)
5. Costos por categoría (labor, materials, equipment, transport, subcontract, overhead, tax, other) no están conectados al cierre
6. No hay alertas de sobrecosto integradas al dashboard
7. No hay bloqueo si costo real crítico no tiene soporte documental
```

### 11.4 — Resultado funcional esperado

Después de implementar Sprint 2, el sistema debe permitir:

1. **Página `/costs` como tablero de costos reales** con:
   - Lista de todas las órdenes con costo estimado, real, desviación y margen
   - Filtros por estado, rango de fechas, categoría
   - Semáforo de sobrecosto (verde: <5%, amarillo: 5-15%, rojo: >15%)
   - Ordenamiento por desviación descendente

2. **`/costs/[orderId]` — Comparación propuesta vs real** con:
   - Tabla comparativa por categoría
   - `estimatedAmount` vs `actualAmount`
   - `variance = actualAmount - estimatedAmount`
   - `variancePercent = (variance / estimatedAmount) * 100`
   - Margen estimado y real
   - Gráfico de barras comparativo
   - Gauge de consumo presupuestal
   - Exportación CSV (usando `cost-export.ts` si ya existe)

3. **`/costs/[orderId]/ejecucion` — Registro de costos reales en campo** con:
   - Formulario de costo real por categoría
   - **Soporte documental obligatorio si `actualAmount > 0`**: mínimo 1 evidencia (factura, recibo, soporte, foto)
   - Selector de categoría: `labor`, `materials`, `equipment`, `transport`, `subcontract`, `overhead`, `tax`, `other`
   - Validación Zod antes de enviar
   - Confirmación: "¿Está seguro de registrar este costo? Una vez registrado requerirá soporte documental."

4. **Dashboard con alerta de sobrecosto**:
   - Widget de órdenes con sobrecosto > 15%
   - Notificación si hay costos sin soporte
   - Badge en sidebar de costos si hay alertas activas

5. **Integración propuesta → presupuesto → costo**:
   - Al crear propuesta económica, se establece `estimatedAmount` por categoría
   - Al convertir propuesta a orden, se copia el presupuesto
   - En ejecución, se registran costos reales contra ese presupuesto
   - Al cerrar orden, se calcula margen real final

### 11.5 — Envelope de endpoints

```typescript
// GET /api/costs/:orderId/summary
{
  success: true,
  data: {
    estimatedTotal: number,
    actualTotal: number,
    variance: number,
    variancePercent: number,
    margin: { estimated: number, actual: number },
    byCategory: Array<{
      category: "labor" | "materials" | "equipment" | "transport" | "subcontract" | "overhead" | "tax" | "other",
      estimatedAmount: number,
      actualAmount: number,
      variance: number,
      variancePercent: number,
      requiresSupport: boolean
    }>,
    alertLevel: "green" | "yellow" | "red"
  }
}

// GET /api/costs/dashboard/alerts
{
  success: true,
  data: Array<{
    orderId: string,
    orderCode: string,
    clientName: string,
    overrunPercent: number,
    missingSupportCount: number
  }>
}
```

### 11.6 — Tests obligatorios Sprint 2

```txt
Backend:
  - GET /api/costs/:orderId/summary → 200 + estructura de comparación
  - GET /api/costs/:orderId/summary sin costos → 200 + estructura vacía, no 404
  - POST /api/costs con costo real > 0 sin soporte → 400 (soporte obligatorio)
  - POST /api/costs con costo real = 0 (costo cero válido) → 200
  - GET /api/costs/dashboard/alerts → 200 + array
  - Verificación de variancePercent calculado correctamente

Frontend:
  - Costs page renderiza sin errores runtime
  - CostForm exige soporte documental si amount > 0
  - CostComparisonChart muestra estimated vs actual correctamente
  - Dashboard widget de sobrecosto sin error
  - Exportación CSV funciona (si existe utilidad)
```

### 11.7 — Evidencia Sprint 2

```txt
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/audit-before.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/commands.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/test-results.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/implementation-notes.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/screenshots-before/
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/screenshots-after/
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/network-before.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/network-after.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/console-before.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/console-after.md
.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-02-costs/product-slice-report.md
```

---

## 12. SPRINT 3 — INVENTARIO DE MADUREZ DE PÁGINAS

Después de Sprint 1. Sprint 2 opcional si hay tiempo.

### 12.1 — Crear inventario

```powershell
New-Item -ItemType Directory -Force .sisyphus/evidence/page-maturity
```

Crear archivo:

```txt
.sisyphus/evidence/page-maturity/page-inventory.md
```

### 12.2 — Tabla de inventario obligatoria

```markdown
| Ruta | Existe | Renderiza | Datos reales | Acciones reales | Loading/Error/Empty/Forbidden/Offline | Tests | Runtime errors | Madurez 0-5 | Sprint sugerido |
|---|---|---|---|---|---|---|---|---|---|
| /dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | 5 | — |
| /resources/kits | ✅ | ✅ | ❌ (seeds faltan) | ✅ | ✅ | ❌ | 0 | 3 | Sprint 1 |
| /costs | ✅ | ✅ | ❌ (sin datos) | ❌ | ❌ | ❌ | 0 | 1 | Sprint 2 |
| ... | | | | | | | | | |
```

### 12.3 — Fuente para las rutas

Usar el build output:

```powershell
npm run build -w frontend 2>&1 | Select-String "(λ ○ ƒ)" | ForEach-Object { $_ -replace '\s+', ' ' }
```

O el listado real del filesystem:

```powershell
Get-ChildItem -Path "frontend/src/app" -Recurse -Filter "page.tsx" | Select-Object FullName
```

### 12.4 — Reglas del inventario

1. Incluir **TODAS** las rutas detectadas (no estimar, no redondear, no decir "aproximadamente 95")
2. Para cada ruta, determinar madurez según escala:
   - **0**: No existe / 404
   - **1**: Existe, no renderiza / error runtime
   - **2**: Renderiza, sin datos reales, sin acciones
   - **3**: Datos reales, acciones básicas, faltan estados
   - **4**: Completa funcionalmente, faltan tests o algunos estados
   - **5**: Completa con tests, estados, sin errores runtime
3. Priorizar primero:
   - Páginas con runtime errors (madurez 0-1)
   - Páginas que bloquean flujo de 14 pasos
4. **NO implementar 95 páginas en una corrida**

---

## 13. PRUEBAS OBLIGATORIAS

### 13.1 — Backend tests

Crear para cada sprint:

```txt
# Sprint 0
backend/src/modules/notifications/__tests__/unread-count.route.test.ts
backend/src/modules/dashboard/__tests__/operational-kpis.route.test.ts
backend/src/modules/dashboard/__tests__/sla-risk.route.test.ts

# Sprint 1
backend/src/modules/kit/__tests__/kit.routes.test.ts
backend/src/modules/kit/__tests__/kit-apply-planning.test.ts

# Sprint 2
backend/src/modules/cost/__tests__/cost-summary.test.ts
backend/src/modules/cost/__tests__/cost-variance.test.ts
backend/src/modules/cost/__tests__/cost-support-required.test.ts
```

### 13.2 — Frontend tests

```txt
# Sprint 0
HeaderNotifications → no genera 404
Dashboard widgets → consumen endpoints reales
DialogContent → tiene Title/Description

# Sprint 1
Kits page → renderiza templates CCTV/líneas de vida
KitWizardForm → NO usa Record<string, unknown>
KitWizardForm → usa CreateKitSchema de shared-types

# Sprint 2
Costs page → muestra estimated vs actual
CostForm → exige soporte documental si amount > 0
```

### 13.3 — E2E tests mínimos

```txt
login → dashboard sin 404
resources/kits → crear kit CCTV
orders/[id]/planning → aplicar kit
costs/[orderId] → registrar costo real con soporte
dashboard → ver alerta de sobrecosto
```

Los E2E tests se escriben con Playwright. Si no existe el archivo, crearlo en `frontend/tests/e2e/`.

---

## 14. EVIDENCIA OBLIGATORIA

### Estructura de directorios

```txt
.sisyphus/evidence/v4-1-runtime-kits-costs/
├── sprint-00-runtime/
│   ├── audit-before.md              → diagnóstico completo de 404
│   ├── commands.md                  → todos los comandos ejecutados
│   ├── test-results.md              → output de npm run test
│   ├── implementation-notes.md      → qué se cambió y por qué
│   ├── screenshots-before/          → capturas de consola con errores
│   ├── screenshots-after/           → capturas de consola sin errores
│   ├── network-before.md            → requests fallidas
│   ├── network-after.md             → requests exitosas
│   ├── console-before.md            → errores de consola
│   ├── console-after.md             → consola limpia
│   └── product-slice-report.md      → reporte funcional del sprint
├── sprint-01-kits/
│   └── (misma estructura)
├── sprint-02-costs/
│   └── (misma estructura)
└── sprint-03-inventory/
    └── page-inventory.md
```

### Formato de cada archivo

**`audit-before.md`**:
```markdown
# Sprint {N} — Audit Before

## Diagnóstico

| Endpoint | Backend directo | OpenAPI listado | Proxy frontend | Veredicto |
|---|---|---|---|---|
| /api/notifications/unread-count | 401 | ✅ | 404 | Proxy falla |
| /api/dashboard/operational-kpis | 401 | ✅ | 404 | Proxy falla |
| /api/dashboard/sla-risk | 401 | ✅ | 404 | Proxy falla |

## Rutas muertas
- /admin/erp-connectors/new → 404, procedencia: erp-connectors/page.tsx línea 56

## Radix warnings
- Ninguno detectado en componentes directos
```

**`implementation-notes.md`**:
```markdown
# Sprint {N} — Implementation Notes

## Cambios realizados
1. archivo.tsx — razón del cambio (líneas relevantes)
2. archivo2.ts — razón del cambio

## Decisiones técnicas
- ¿Por qué se corrigió de esta forma?
- ¿Qué alternativas se consideraron?
- ¿Hay deuda técnica pendiente?

## Problemas encontrados
- ...
```

### Capturas de pantalla

Tomar screenshots de:
- Consola del navegador (DevTools → Console) antes y después
- Network tab (DevTools → Network, filtro "404" o "500") antes y después
- Páginas afectadas renderizadas correctamente después de corrección

Usar una de estas herramientas:
1. Chrome DevTools screenshot nativo
2. Playwright `page.screenshot()`
3. `kilo-playwright_browser_take_screenshot`

Guardar en `.sisyphus/evidence/v4-1-runtime-kits-costs/sprint-{NN}-{nombre}/screenshots-before/` y `screenshots-after/`.

---

## 15. COMANDOS OBLIGATORIOS

### Verificación de calidad

```powershell
npm run typecheck       # → exit 0
npm run lint            # → exit 0
npm run test            # → exit 0
npm run build           # → exit 0
npm run contracts:check # → exit 0
npm run verify          # → exit 0
```

Si existe:
```powershell
npm run quality:strict  # → exit 0
npm run doctor:verbose -w frontend  # → exit 0
```

### Diagnóstico runtime

```powershell
# Verificar OpenAPI
Invoke-WebRequest http://localhost:4000/api/docs/openapi.json -UseBasicParsing

# Verificar endpoints directamente (esperado: 401 por falta de token)
Invoke-WebRequest http://localhost:4000/api/notifications/unread-count -UseBasicParsing
Invoke-WebRequest http://localhost:4000/api/dashboard/operational-kpis -UseBasicParsing
Invoke-WebRequest http://localhost:4000/api/dashboard/sla-risk -UseBasicParsing

# Verificar a través del proxy frontend (esperado: 200 con token, 401 sin token -> NO 404)
Invoke-WebRequest http://localhost:3000/api/backend/notifications/unread-count -UseBasicParsing
Invoke-WebRequest http://localhost:3000/api/backend/dashboard/operational-kpis -UseBasicParsing
Invoke-WebRequest http://localhost:3000/api/backend/dashboard/sla-risk -UseBasicParsing
```

### Verificar archivos

```powershell
# Encontrar page.tsx files (rutas frontend)
Get-ChildItem -Path "frontend/src/app" -Recurse -Filter "page.tsx" | Select-Object -ExpandProperty FullName

# Encontrar route.ts files  
Get-ChildItem -Path "frontend/src/app" -Recurse -Filter "route.ts" | Select-Object -ExpandProperty FullName
```

---

## 16. STOP CONDITIONS

El programador debe DETENERSE y REPORTAR si:

### Condiciones de parada obligatoria

```txt
⛔ No puede reproducir los errores 404 reportados
   → Si los errores no aparecen en su máquina, documentar la configuración que los evita.

⛔ No puede explicar por qué el proxy Next.js da 404 mientras backend directo funciona
   → Detenerse, investigar más, NO hacer cambios al azar.

⛔ Necesita modificar package.json (cualquier workspace)
   → No tocar. Reportar y esperar aprobación.

⛔ Necesita instalar dependencia nueva
   → No instalar. Reportar y esperar aprobación.

⛔ Necesita tocar baselines (test snapshots, contract migrations)
   → Reportar. No modificar baselines existentes sin entender el impacto.

⛔ Necesita desactivar el service worker sin análisis específico
   → Primero diagnosticar. Reportar hallazgos.

⛔ Necesita usar mocks en producción
   → No. No hay mocks en producción.

⛔ No puede tomar screenshots ni registrar evidencia
   → Detenerse. La evidencia es obligatoria.

⛔ contracts:check falla después de corrección
   → Detenerse. Diagnosticar por qué los contratos se rompieron.

⛔ verify falla después de 3 intentos de corrección
   → Detenerse. Reportar estado actual. No seguir intentando.
```

---

## 17. REGLAS DE CALIDAD — PROHIBIDO

Está **estrictamente prohibido** introducir:

```txt
❌ any (explícito o implícito)
❌ unknown (sin policy de refinamiento aprobada)
❌ null (para representar ausencia → usar status objects)
❌ undefined explícito (para representar ausencia → usar status objects)
❌ Record<string, unknown>
❌ as unknown as
❌ @ts-ignore
❌ @ts-expect-error
❌ as any
❌ DTO local duplicado (usar @cermont/shared-types)
❌ Schema local duplicado (usar @cermont/shared-types)
❌ Mock de producción
❌ Fallback silencioso para 404 (no ocultar error tras catch vacío)
❌ Ocultar error con try/catch vacío
❌ Crear ruta sin backend
❌ Crear UI sin contrato (Zod schema)
❌ Crear endpoint sin uso frontend
❌ console.log / debugger / alert en producción
❌ Barrel imports en paths críticos de performance
❌ Roles hardcodeados string
❌ Rutas hardcodeadas en componentes
❌ Lógica de negocio en componentes UI
```

---

## 18. GUARD RAILS — SEGURIDAD E INTEGRIDAD

### Integridad de datos

- Los costos reales registrados en campo NO deben poder editarse sin auditoría
- Los kits aplicados al planning deben generar un snapshot inmutable
- Las evidencias de costo deben asociarse al costo específico (no genéricas)
- Un costo con soporte documental NO debe poder eliminarse sin autorización

### Seguridad

- Todos los endpoints nuevos DEBEN tener autenticación (`authenticate` middleware)
- Todos los endpoints nuevos DEBEN tener autorización (`authorize` middleware)
- Los roles se validan contra `@cermont/domain`, no con strings hardcodeados
- Validación Zod ANTES de la lógica de negocio
- Soporte documental de costos: validar tipo MIME y tamaño antes de aceptar

### Auditoría

- Creación/actualización de kits → evento de auditoría
- Registro de costo real → evento de auditoría
- Aplicación de kit a planning → evento de auditoría

---

## APÉNDICE A — MAPA DE ARCHIVOS QUE EL PROGRAMADOR DEBERÁ TOCAR

### Sprint 0 — Runtime Contract Repair

```
backend/src/modules/notifications/notification.controller.ts        → verificar getUnreadCount
backend/src/modules/notifications/notification.service.ts           → verificar/getUnreadCount
backend/src/modules/notifications/notifications.routes.ts          → verificar orden rutas
backend/src/modules/dashboard/dashboard.controller.ts              → verificar getOperationalKpis, getSlaRisk
backend/src/modules/dashboard/dashboard.service.ts                 → verificar servicio
backend/src/modules/dashboard/dashboard-operational-kpi.service.ts → verificar/crear servicio
backend/src/modules/dashboard/dashboard-sla.service.ts             → verificar/crear servicio
backend/src/modules/dashboard/dashboard.routes.ts                  → verificar rutas
backend/src/index.ts                                               → verificar mounts
frontend/src/app/api/backend/[...path]/route.ts                    → verificar proxy
frontend/src/lib/http/api-client.ts                                → verificar headers
frontend/src/modules/notifications/api/notification.api.ts         → verificar fetchUnreadCount
frontend/src/modules/notifications/hooks/useUnreadCount.ts         → verificar query
frontend/src/modules/core/ui/layout/HeaderNotifications.tsx        → verificar consumo
frontend/src/modules/core/ui/layout/Header.tsx                     → verificar uso
frontend/src/app/(dashboard)/erp-connector/page.tsx                → posible corrección
frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx         → corregir enlace roto
frontend/public/service-worker.js                                  → verificar reglas de fetch
```

### Sprint 1 — Kits

```
packages/shared-types/src/schemas/kit.schema.ts                    → verificar/extender
packages/shared-types/src/index.ts                                 → exportar nuevos schemas
packages/domain/src/kit.rules.ts                                   → verificar reglas
backend/src/config/kit-templates.ts                                → CREAR/EXTENDER seeds reales
backend/src/modules/kit/kit.routes.ts                              → verificar rutas
backend/src/modules/kit/kit.controller.ts                          → verificar controller
backend/src/modules/kit/kit.service.ts                             → verificar/extender service
backend/src/modules/kit/kit.routes.ts                              → agregar apply-to-planning
frontend/src/modules/kits/api/kits.api.ts                          → verificar API calls
frontend/src/modules/kits/hooks/useKits.ts                         → verificar hooks
frontend/src/modules/kits/ui/KitWizardForm.tsx                     → CORREGIR schema local + Record<string, unknown>
frontend/src/modules/kits/ui/KitForm.tsx                           → verificar formulario
frontend/src/modules/kits/ui/KitCard.tsx                           → verificar card
frontend/src/modules/kits/ui/KitItemSection.tsx                   → verificar sección items
frontend/src/modules/kits/ui/KitAttachmentsSection.tsx             → verificar adjuntos
frontend/src/modules/kits/constants.ts                             → verificar constantes
frontend/src/app/(dashboard)/resources/kits/page.tsx               → verificar página
frontend/src/app/(dashboard)/resources/kits/new/page.tsx           → verificar página
frontend/src/app/(dashboard)/resources/kits/[id]/page.tsx          → crear si no existe
```

### Sprint 2 — Costos

```
packages/shared-types/src/schemas/cost.schema.ts                   → verificar/extender
packages/shared-types/src/schemas/cost-cart.schema.ts              → verificar
packages/shared-types/src/schemas/cost-suggest.schema.ts           → verificar
packages/shared-types/src/schemas/cost-traceability.schema.ts      → verificar
packages/domain/src/cost.rules.ts                                  → verificar reglas
backend/src/modules/cost/cost.routes.ts                            → verificar rutas summary, alerts
backend/src/modules/cost/cost.controller.ts                        → verificar/agregar controllers
backend/src/modules/cost/cost.service.ts                           → verificar/agregar summary/variance
backend/src/modules/cost/cost-budget-alert.service.ts              → verificar/crear alertas
frontend/src/app/(dashboard)/costs/page.tsx                        → verificar/mejorar tablero
frontend/src/app/(dashboard)/costs/[orderId]/page.tsx              → verificar comparación
frontend/src/app/(dashboard)/costs/[orderId]/ejecucion/page.tsx    → verificar registro costos
frontend/src/modules/costs/ui/CostForm.tsx                         → agregar soporte documental obligatorio
frontend/src/modules/costs/ui/CostComparisonChart.tsx              → verificar gráfico
frontend/src/modules/costs/ui/CostDeviationStackedBar.tsx          → verificar gráfico
frontend/src/modules/costs/ui/BudgetConsumedGauge.tsx              → verificar gauge
frontend/src/modules/costs/ui/MarginSummaryCard.tsx                → verificar card
frontend/src/modules/dashboard/queries.ts                          → verificar widget sobrecosto
```

---

## APÉNDICE B — CRITERIOS DE ACEPTACIÓN

### Criterio 1: Runtime sano

```txt
✅ 0 errores 404 en consola después de Sprint 0
✅ 0 warnings Radix después de Sprint 0
✅ 0 rutas muertas en navegación real
```

### Criterio 2: Kits profesionales

```txt
✅ Kit CCTV con checklist, herramientas, equipos, EPP, evidencias del documento real
✅ Kit líneas de vida con checklist de inspección, conformidad/NC/NA
✅ Kit SGSST con validación de inducción y bloqueo si falta
✅ Creación de kit usa contrato shared-types (no schema local)
✅ Kit aplicado a planning hace autofill de herramientas/equipos/checklist
✅ Readiness del kit disponible: incomplete/ready/critical
✅ Seeds reales no mock
```

### Criterio 3: Costos reales

```txt
✅ Tablero /costs con comparación estimated vs actual por orden
✅ Formulario de costo real con soporte documental obligatorio si amount > 0
✅ Cálculo de variance y variancePercent
✅ Margen estimado y real
✅ Semáforo de sobrecosto (green/yellow/red)
✅ Alerta de sobrecosto en dashboard
✅ Exportación CSV funcional
```

### Criterio 4: Calidad

```txt
✅ npm run typecheck → exit 0
✅ npm run lint → exit 0
✅ npm run test → exit 0 (todos los tests nuevos + existentes)
✅ npm run build → exit 0
✅ npm run contracts:check → exit 0
✅ npm run verify → exit 0
```

### Criterio 5: Evidencia

```txt
✅ Evidencia de antes/después guardada para cada sprint
✅ Screenshots de consola mostrando la diferencia
✅ Reporte de producto por sprint documentado
✅ Inventario de páginas creado
```

---

## APÉNDICE C — DOCUMENTOS → FUNCIONALIDAD MAP

| Documento | Funcionalidad que debe alimentar |
|---|---|
| `10_Formato_Mantenimiento_CCTV3.md` | Kit mantenimiento CCTV, checklist, herramientas, EPP, evidencias, hallazgos, acciones correctivas |
| `08_Formato_Inspeccion_lineas_de_vida_Vertical3.md` | Kit inspección líneas de vida, checklist, conformidad/NC/NA, evidencias, certificaciones |
| `05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA3.md` | Catálogo evidencias fotográficas, plantillas anclaje/escalera/estructura, validación fotos obligatorias |
| `02_INDUCCION_SGSST3.md` | Requisitos SGSST, inducción, validación personal habilitado, bloqueo planeación |
| `03_Jerarquia_de_controles_Cermont2.md` | Selector jerarquía controles en AST (eliminación/sustitución/ingeniería/administrativo/EPP) |
| `04_ATG_JUAN_DIEGO_AREVALO-13.md` | Requisitos técnicos anteproyecto, trazabilidad, validaciones alcance |
| `06_FORMATO_DE_PLANEACION_DE_OBRA3.md` | Planning wizard, cronograma, MO, herramientas, equipos, EPP, certificaciones, AST, PTW, readiness |
| `07_DESARROLLO...md` | Flujo completo 14 pasos, fallas típicas (planeación incompleta, costos no centralizados, facturación tardía) |
