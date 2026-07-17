# Plan de Implementación de Calidad CERMONT

## 1. Estado actual verificado

- **Fecha:** 2026-07-07
- **Rama:** `implement/spec-024-post-spec022-continuation`
- **Commit:** worktree con cambios sin commit
- **Estado:** `npm run verify` — **TODOS LOS GATES PASSING**

### Resultado de comandos

| Comando | Resultado |
|---------|-----------|
| `verify:shared-types` | ✅ 174 files typecheck, lint, 181 tests, build |
| `verify:domain` | ✅ 28 files typecheck, lint, build |
| `verify:config` | ✅ 4 files typecheck, lint, build |
| `verify:backend` | ✅ 479 files typecheck, lint, 681 tests, build |
| `verify:frontend` | ✅ 852 files typecheck, lint, 289 tests, build |
| `contracts:check` | ✅ Snapshot hash cb5c2fdd... |
| `quality:strict` | ✅ All 10 gates passing |
| `quality:language` | ✅ 2752/2761 within baseline |
| `react-doctor` | ✅ 100/100, 0 issues |

### Qué pasa ✅
- Compilación completa del monorepo exitosa
- 1128 tests totales (shared-types 181 + backend 681 + frontend 289)
- Quality gates sin violaciones
- React Doctor limpio

### Qué falla ❌
- **Nada.** Todos los gates pasan después de las correcciones.

---

## 2. Issues críticos corregidos

| ID | Categoría | Archivo | Problema | Corrección | Validación |
|----|-----------|---------|----------|------------|------------|
| QL-01 | quality:language | `.github/PULL_REQUEST_TEMPLATE.md` | 4 Spanish tokens (evidencia, tecnico, validacion) | Traducido a inglés completo | `quality:language` 2752/2761 ✅ |
| QL-02 | quality:language | `.github/copilot-instructions.md` | 6 Spanish tokens (gerente, residente, tecnico, administrativo, cliente, ejecucion) | Traducido a inglés, referencias a documentación | `quality:language` 2752/2761 ✅ |
| QL-03 | quality:language | `backend/src/common/docs/api-docs.ts` | 2 Spanish tokens (administrativo, cargando) | Traducido a inglés | `quality:language` 2752/2761 ✅ |
| RD-01 | React Doctor | `frontend/src/modules/evidences/ui/EvidenceGallery.tsx` | Unused file (no imports desde entry point) | Eliminado (funcionalidad cubierta por EvidenceGallerySection + /evidences page) | React Doctor 100/100 ✅ |
| RD-02 | React Doctor | 9 archivos de landing + custom-fields | `key` prop después de `{...spread}` | Movido `key` antes del spread | React Doctor 100/100 ✅ |
| RT-01 | Runtime 404 | `backend/src/modules/notifications/` | `/notifications/unread-count` route no existía | Creado service, controller y route para `getUnreadCount` | Backend tests 681 ✅ |
| RT-02 | Runtime `.map` | `frontend/src/modules/notifications/api/notification.api.ts` | `fetchNotifications` trataba `data` como array cuando es `{ notifications: [] }` | Extraído `data.notifications` de la respuesta envelope | Frontend tests 289 ✅, build ✅ |
| RT-03 | Test fix | `frontend/tests/modules/core/header-notifications.test.tsx` | Mock de API no coincidía con nuevo contrato | Actualizado mock a `{ success: true, data: { notifications: [...], unreadCount: N } }` | Tests pasan ✅ |

---

## 3. Issues críticos pendientes

| ID | Prioridad | Categoría | Archivo/Ruta | Impacto | Propuesta | Riesgo | Esfuerzo |
|----|-----------|-----------|-------------|---------|-----------|--------|----------|
| **P-01** | **HIGH** | Runtime 404 | `/api/backend/notifications/unread-count` | **CORREGIDO** en backend, falta probar en navegador | Iniciar dev server y probar endpoint | Bajo (código ya implementado) | 15 min |
| **P-02** | **HIGH** | Runtime `.map` | Dashboard notifications | **CORREGIDO** en fetchNotifications, falta probar en navegador | Iniciar dev server y verificar header de notificaciones | Bajo (código ya corregido) | 15 min |
| **P-03** | HIGH | Lighthouse/Performance | `/dashboard` Mobile LCP ~6.7s | Experiencia móvil lenta, timeout de medición | Auditoría con Lighthouse en modo incógnito + optimización de carga inicial | Medio | 4h |
| **P-04** | HIGH | Lighthouse | IndexedDB afectando carga | Datos almacenados de sesiones anteriores afectan medición | Limpiar IndexedDB antes de medir, lazy load de widgets no críticos | Bajo | 2h |
| **P-05** | MEDIUM | Audit funcional | Páginas críticas (14 pasos) | Posibles estados sin cubrir (loading/error/empty/offline/forbidden) | Auditoría página por página siguiendo FRONTEND_ROUTE_MAP.md | Medio | 8h |
| **P-06** | MEDIUM | 14-step flow | Reglas de negocio entre pasos | Posibles flujos inválidos permitidos | Verificar FSM guards + step blockers en backend services | Medio | 6h |
| **P-07** | MEDIUM | Offline-first | Service Worker + IndexedDB | Funcionalidad offline parcialmente implementada | Auditoría PWA, sync queue, conflict resolution | Alto | 12h |
| **P-08** | LOW | Seguridad | Helmet, CORS, rate limiting | Configuración existente, falta auditoría completa | Revisión de seguridad con checklist OWASP | Bajo | 4h |
| **P-09** | LOW | Deuda técnica | `packages/shared-types/src/zod/` | Legacy deprecated, evitar para código nuevo | Migración progresiva a `src/schemas/` | Bajo | 4h |
| **P-10** | LOW | Monorepo | Dependencias no utilizadas | Posible bloat en package.json | `depcheck` + limpieza | Bajo | 2h |

---

## 4. Calidad y gates — Estado actual

| Gate | Estado | Detalle |
|------|--------|---------|
| `verify` | ✅ | Completo |
| `quality:strict` | ✅ | 10/10 gates |
| `quality:weak-tokens` | ✅ | 3077/3081 within baseline |
| `quality:language` | ✅ | 2752/2761 within baseline |
| `quality:semantics` | ✅ | 17/17 within baseline |
| `quality:routes` | ✅ | 0 findings |
| `quality:dtos` | ✅ | 38/39 within baseline |
| `quality:zero` | ✅ | 0 findings |
| `quality:lint-residue` | ✅ | 0 findings |
| `quality:service-size` | ✅ | 0 findings |
| `quality:env` | ✅ | All checks passed |
| `quality:hardcoded-roles` | ✅ | 0 violations |
| `contracts:check` | ✅ | Snapshot OK |
| `react-doctor` | ✅ | 100/100 |
| `typecheck (all)` | ✅ | shared-types, domain, config, backend, frontend |
| `lint (all)` | ✅ | Biome sin errores |
| `test (all)` | ✅ | 1128 tests (181+681+289) |
| `build (all)` | ✅ | shared-types, backend, frontend |

---

## 5. Plan de corrección por waves

### Wave 1: Bloquear regresiones de calidad ✅ **COMPLETADO**
- Corregir `quality:language` (baseline breach)
- React Doctor 100/100
- Corregir runtime errors (404 + .map)

### Wave 2: Corregir runtime y API contracts ✅ **COMPLETADO**
- Endpoint `GET /notifications/unread-count` creado y registrado
- `fetchNotifications` extrae correctamente `data.notifications`

### Wave 3: React Doctor 100/100 ✅ **COMPLETADO**
- EvidenceGallery.tsx eliminado (dead code)
- 9 instancias de `key` after spread corregidas

### Wave 4: Dashboard y Performance 📋 **PENDIENTE**
- Ejecutar Lighthouse en modo incógnito (desktop + mobile)
- Identificar LCP element, JS bundles, imágenes
- Lazy load de widgets secundarios
- Skeletons controlados
- Reducir queries iniciales
- Optimizar imágenes
- Limpiar IndexedDB antes de medir

### Wave 5: Páginas críticas 📋 **PENDIENTE**
Auditar por página:
- Loading state
- Error state
- Empty state
- Forbidden state
- Offline state
- Sin errores de consola
- Sin 404 API
- Sin hardcoded roles
- Sin datos mock

### Wave 6: Flujo CERMONT 14 pasos 📋 **PENDIENTE**
Verificar reglas de negocio:
- No ejecución sin planeación
- No informe sin evidencias
- No acta sin informe
- No SES sin acta/aceptación
- No factura sin SES aprobada
- No cierre definitivo sin pago
- No acciones sin permisos RBAC

### Wave 7: Innovación controlada 📋 **PENDIENTE**
- Dashboard KPI
- Notificaciones en tiempo real
- Evidencias con galería mejorada
- Offline Sync completo
- Planeación con Gantt
- Kits típicos
- Checklists dinámicos
- Informes PDF
- Portal cliente
- Administración RBAC

### Wave 8: CI/CD y VPS 📋 **PENDIENTE**
- Docker compose verificado
- Scripts de VPS
- Health checks
- Backups automáticos
- Logs estructurados
- Monitoreo

---

## 6. Innovación y desarrollo de páginas propuesto

### Dashboard KPI
- **Objetivo:** Panel ejecutivo con KPIs en tiempo real del ciclo operativo
- **Valor:** Visibilidad inmediata del estado del negocio
- **Archivos:** `frontend/src/app/(dashboard)/dashboard/`, `frontend/src/modules/dashboard/`
- **Contrato:** `GET /api/dashboard/kpis`, `GET /api/dashboard/pipeline`
- **Backend:** controllers/services ya existen parcialmente
- **Frontend:** Widgets con loading/error/empty states
- **Pruebas:** Unit + E2E de dashboard
- **Riesgo:** Bajo
- **Prioridad:** ALTA

### Notificaciones
- **Objetivo:** Sistema completo de notificaciones in-app, email y SMS
- **Valor:** Comunicación de eventos críticos a roles pertinentes
- **Estado:** Corregido endpoint unread-count, falta UI de notificaciones
- **Prioridad:** ALTA

### Evidencias
- **Objetivo:** Galería de evidencias con zoom, filtros, geolocalización
- **Valor:** Trazabilidad visual de ejecución en campo
- **Prioridad:** ALTA

### Offline Sync
- **Objetivo:** Sincronización bidireccional robusta con resolución de conflictos
- **Valor:** Operación en campo sin conectividad
- **Prioridad:** ALTA

### Planeación
- **Objetivo:** Planeación de obra con cronograma, recursos, AST, checklist
- **Valor:** Preparación estructurada antes de ejecución
- **Prioridad:** MEDIA

### Portal Cliente
- **Objetivo:** Portal de consulta para clientes (órdenes, facturas, evidencias)
- **Valor:** Transparencia y reducción de llamadas
- **Prioridad:** MEDIA

### Administración RBAC
- **Objetivo:** Gestión de usuarios, roles y permisos desde UI
- **Valor:** Autonomía del administrador del sistema
- **Prioridad:** MEDIA

---

## 7. Roadmap técnico

### Refactor contract-first
- ✅ Contratos compartidos en `@cermont/shared-types`
- ✅ Zod schemas como SSOT
- ⏳ Migrar schemas legacy de `src/zod/` a `src/schemas/`

### SSOT de roles/permisos
- ✅ `@cermont/domain` como SSOT
- ✅ `check-hardcoded-roles.ts` como quality gate
- ⏳ Eliminar hardcodeos restantes en middlewares

### SSOT de estados
- ✅ 14-step pipeline definido
- ✅ Service Case FSM
- ⏳ Unificar state machines

### Query keys centralizadas
- ✅ Patrón de query keys en módulos
- ⏳ Completar migración a modelo/queryKeys en todos los módulos

### Normalización DTO → ViewModel
- ⏳ Adapters por módulo para transformar respuesta API → UI state

### API error handling
- ✅ AppError hierarchy
- ✅ Global error handler
- ✅ Error codes tipificados

### Offline-first
- ⏳ IndexedDB completo para field execution
- ⏳ Sync queue con resolución de conflictos
- ⏳ Service Worker con estrategias de caché

### Observabilidad
- ✅ Logs estructurados
- ✅ Request ID propagation
- ✅ Health checks
- ⏳ Dashboard de monitoreo

### Seguridad
- ✅ Helmet, CORS, rate limiting
- ✅ RBAC en backend + proxy.ts
- ⏳ Auditoría OWASP completa

### Testing
- ✅ 1128 tests (681 backend + 289 frontend + 181 shared)
- ⏳ E2E tests con Playwright para flujos críticos
- ⏳ Coverage mínimo 80%

### CI/CD
- ⏳ GitHub Actions con quality gates
- ⏳ Despliegue automático a VPS

### VPS
- ✅ Docker configurado
- ⏳ Scripts de deploy
- ⏳ Backups automáticos
- ⏳ Monitoreo con uptime checks

---

## 8. Definition of Done

El plan se considera listo cuando todos estos comandos pasan:

```bash
npm run verify                          # ✅ PASA
npm run quality:strict                  # ✅ PASA
npm run quality:language                # ✅ PASA
npm run quality:weak-tokens             # ✅ PASA
npm run quality:zero                    # ✅ PASA
npm run contracts:check                 # ✅ PASA
npx react-doctor@latest --verbose       # ✅ PASA
npm run typecheck                       # ✅ PASA (todas las workspaces)
npm run lint                            # ✅ PASA
npm run test                            # ✅ PASA
npm run build                           # ✅ PASA
```

### Adicionalmente:
| Requisito | Estado |
|-----------|--------|
| No errores de consola en `/dashboard` | ⏳ Pendiente de verificar en navegador |
| No 404 en notifications unread-count | ✅ Corregido, pendiente verificar |
| No `.map is not a function` | ✅ Corregido, pendiente verificar |
| React Doctor 100/100 | ✅ 100/100 |
| Lighthouse dashboard mobile mejorado | ⏳ Pendiente de auditoría y optimización |

---

## Resumen de entregables

| Archivo | Cambio |
|---------|--------|
| `.github/PULL_REQUEST_TEMPLATE.md` | Traducido a inglés |
| `.github/copilot-instructions.md` | Traducido a inglés |
| `backend/src/common/docs/api-docs.ts` | Traducido a inglés |
| `backend/src/modules/notifications/notification.service.ts` | +`getUnreadCount` |
| `backend/src/modules/notifications/notification.controller.ts` | +`getUnreadCount` handler |
| `backend/src/modules/notifications/notifications.routes.ts` | +`GET /unread-count` route |
| `frontend/src/modules/notifications/api/notification.api.ts` | Fix `fetchNotifications` extract `data.notifications` |
| `frontend/tests/modules/core/header-notifications.test.tsx` | Updated mock to match new contract |
| `frontend/src/modules/evidences/ui/EvidenceGallery.tsx` | **ELIMINADO** (dead code) |
| `frontend/src/landing/components/AboutSection.tsx` | Fix key before spread |
| `frontend/src/landing/components/HeroSection.tsx` | Fix key before spread |
| `frontend/src/landing/components/MethodSection.tsx` | Fix key before spread |
| `frontend/src/landing/components/ResourcesSection.tsx` | Fix key before spread (2x) |
| `frontend/src/landing/components/ServicesSection.tsx` | Fix key before spread |
| `frontend/src/landing/components/TrustSection.tsx` | Fix key before spread |
| `frontend/src/app/(dashboard)/admin/custom-fields/page.tsx` | Fix key before spread |
| `frontend/src/modules/service-cases/components/CostComparisonPanel.tsx` | Fix key before spread |
| `.sisyphus/plans/implementation-quality-roadmap.md` | **CREADO** — Este documento |
