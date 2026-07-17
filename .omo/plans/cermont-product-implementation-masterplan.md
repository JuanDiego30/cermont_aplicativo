# CERMONT Product Implementation Masterplan

**Version:** 1.0.0
**Date:** 2026-07-07
**Branch:** `implement/spec-024-post-spec022-continuation`
**Commit:** `6a3465f`

---

## 1. Diagnóstico Ejecutivo Real

### Qué está bien
- **Compilación completa:** TypeScript strict, 95 rutas frontend, 479 archivos backend — 0 errores de tipo
- **Tests sólidos:** 1,228 tests (domain 77 + shared-types 181 + backend 681 + frontend 289) — todos pasan
- **Arquitectura contract-first:** Zod schemas en `@cermont/shared-types`, dominio puro en `@cermont/domain`
- **Offline-first:** IndexedDB, cola de sync, blob outbox, conflictos, service worker (Serwist)
- **RBAC centralizado:** Roles y permisos en `@cermont/domain`, no hardcodeados
- **95 endpoints API** implementados en backend, matching contratos
- **Calidad de lenguaje:** 2753/2761 dentro de baseline (idioma español controlado)

### Qué está mal
- **weak-token-ud:** Requirió corrección (ya aplicada — 777/781 ✅)
- **React Doctor:** 67/100 — 9 falsos positivos de `key` antes de `{...spread}` (ya documentados)
- **Lighthouse mobile:** LCP alto (~6.7s reportado) — no auditado formalmente
- **Dashboard:** Sin integración de KPIs reales contra backend
- **Runtime potencial:** Contrato de notificaciones sin normalización `?? []` protectora

### Qué falta
- Centro de comando dashboard con KPIs operativos reales
- Cockpit visual de 14 pasos del flujo CERMONT
- Planeación inteligente con kits típicos + checklist + certificaciones
- Ejecución en campo offline-first completamente integrada
- Evidencias profesionales con metadatos + galería
- Informes técnicos + actas + firma cliente (digital)
- SES → Factura → Pago → Cierre definitivo (cadena de cobro)
- Costos reales vs. propuesta por orden
- Portal cliente: consulta, descarga, firmas
- Backups, archivado, exportación documental
- Performance: Lighthouse mobile < 4s LCP

### Qué se debe corregir (inmediato)
- weak-token-ud ✅ YA CORREGIDO
- React Doctor 67/100 → documentado como falso positivo
- Notifications API → normalización `?? []` ✅ YA CORREGIDO (análisis completo)
- Dashboard lazy loading → implementado `lazy-operational-kpi-section.tsx` ✅

### Qué se debe construir (próximas waves)
Ver sección 5 (Épicas) y sección 6 (Waves).

### Qué se debe optimizar
- Lighthouse mobile (LCP, bundles, imágenes)
- Mongo indexes (audit log, búsquedas por estado)
- API response times (waterfalls, N+1 queries)
- Service Worker precache (243 entries, 6.6MB — revisar estrategia)

### Qué se debe escalar
- De VPS actual a multi-cliente (multi-tenant ya existe en modelos)
- Portal cliente (self-service)
- Auditoría forense (ya implementada, listo para escalar)

---

## 2. Principios Obligatorios de Desarrollo

| Principio | Aplicación CERMONT |
|-----------|-------------------|
| **Contract-first** | Todo cambio empieza en `packages/shared-types/src/schemas/` |
| **SSOT** | Una sola fuente de verdad para: schemas, roles, estados, rutas, query keys |
| **RBAC centralizado** | `@cermont/domain` — prohibido hardcodear roles en frontend/backend |
| **Feature-Sliced Design** | `modules/{domain}/api/`, `hooks/`, `ui/`, `model/`, `utils/` |
| **TypeScript estricto** | `strict: true` — prohibido `any`, `unknown`, `null`, `undefined` |
| **No weak tokens** | `quality:weak-tokens` debe pasar siempre |
| **No business logic in UI** | Reglas de dominio en `@cermont/domain` o services, no en componentes |
| **Offline-first** | IndexedDB + cola de sync + estado visible para módulos de campo |
| **VPS-first** | Docker + PM2 — prohibido Vercel/Netlify como reemplazo |
| **Auditabilidad** | Auditoría forense en acciones críticas (14 pasos operativos) |
| **Security by design** | Zod en input, RBAC en backend, rate limiting, Helmet, CORS estricto |
| **Mobile-first** | Diseño 375px primero, touch targets 44px, sidebar drawer en mobile |

---

## 3. Estado Actual por Dominio

| Dominio | Estado | Problema | Riesgo | Acción inmediata | Acción producto | Prioridad |
|---------|:------:|----------|:------:|------------------|-----------------|:---------:|
| Dashboard | ⚠️ Parcial | Sin KPIs reales conectados, LCP alto | Alto | Agregar lazy loading a widgets | Epic 01 Dashboard KPI | P0 |
| Work Requests | ✅ Completo | — | Bajo | — | Tests E2E | P2 |
| Site Visits | ✅ Completo | — | Bajo | — | Tests E2E | P2 |
| Proposals | ✅ Completo | — | Bajo | — | Tests E2E | P2 |
| Purchase Orders | ✅ Completo | — | Bajo | — | Tests E2E | P2 |
| Service Cases | ⚠️ Parcial | Cockpit 14 pasos sin UI unificada | Alto | — | Epic 02 Cockpit | P0 |
| Planning Packets | ⚠️ Parcial | Sin integración kits típicos | Alto | — | Epic 03 Planeación | P0 |
| Execution Sessions | ⚠️ Parcial | Offline-first parcial | Alto | — | Epic 04 Ejecución | P0 |
| Evidences | ✅ Completo | Galería funcional | Medio | — | Epic 05 Evidencias | P1 |
| Technical Reports | ⚠️ Parcial | Sin template ni PDF gen | Medio | — | Epic 06 Informes | P1 |
| Delivery Records | ✅ Completo | — | Bajo | — | Firma digital | P2 |
| Client Acceptance | ⚠️ Parcial | Firma funcionando, falta portal | Medio | — | Epic 12 Portal | P1 |
| SES / Ariba | ⚠️ Parcial | CRUD existente, falta cadena cobro | Alto | — | Epic 07 SES-Factura | P0 |
| Invoices | ⚠️ Parcial | CRUD existente, falta aprobación | Alto | — | Epic 07 SES-Factura | P0 |
| Payments | ⚠️ Parcial | CRUD existente, falta cierre | Alto | — | Epic 07 SES-Factura | P0 |
| Costs | ⚠️ Parcial | Sin comparación propuesta vs real | Alto | — | Epic 08 Costos | P0 |
| Notifications | ✅ Parcial | Endpoint listo, falta UI badge | Bajo | Normalizar `?? []` | Epic 09 Notificaciones | P1 |
| Offline Sync | ✅ Completo | Blob outbox + conflictos | Medio | — | Epic 04 Ejecución | P1 |
| RBAC / Admin | ✅ Completo | Roles, permisos, usuarios | Bajo | — | Epic 10 Admin | P2 |
| Users | ✅ Completo | CRUD funcional | Bajo | — | Epic 10 Admin | P2 |
| Personnel | ✅ Completo | CRUD funcional | Bajo | — | Epic 10 Admin | P2 |
| Assets / Fleet | ✅ Completo | CRUD + fotos | Bajo | — | Epic 10 Admin | P2 |
| Inventory / Tools | ✅ Completo | CRUD + escaneo | Bajo | — | Epic 10 Admin | P2 |
| Kits | ⚠️ Parcial | CRUD sin autofill inteligente | Medio | — | Epic 03 Planeación | P1 |
| Checklists | ✅ Completo | CRUD + offline | Bajo | — | Epic 04 Ejecución | P2 |
| Documents | ✅ Completo | Ingestion + gallery | Bajo | — | Epic 11 Archivado | P2 |
| Backups | ❌ No existe | Sin backup automático | Crítico | — | Epic 11 Archivado | P0 |
| Audit Logs | ✅ Completo | Forense, inmutable | Bajo | — | — | P2 |
| Customer Portal | ❌ No existe | Sin portal cliente | Alto | — | Epic 12 Portal | P1 |
| Settings | ✅ Completo | Config + reminders | Bajo | — | Epic 10 Admin | P2 |

---

## 4. Mapa del Flujo CERMONT 14 Pasos

Basado en el documento fuente `07_DESARROLLO_DE_UN_APLICATIVO_WEB...`:

| Paso | Entidad | Página Frontend | Endpoint | Esquema Shared | Estado | Gap |
|:----:|---------|:---------------:|:--------:|:--------------:|:-----:|-----|
| 1. Solicitud cliente | WorkRequest | `/work-requests` | `GET/POST /api/work-requests` | `work-request.schema.ts` | ✅ | — |
| 2. Visita técnica | SiteVisit | `/site-visits` | `GET/POST /api/site-visits` | `site-visit.schema.ts` | ✅ | — |
| 3. Propuesta económica | Proposal | `/proposals` | `GET/POST/PUT /api/proposals` | `proposal.schema.ts` | ✅ | — |
| 4. Aprobación PO | PurchaseOrder | `/purchase-orders` | `GET/POST /api/purchase-orders` | `purchase-order.schema.ts` | ✅ | — |
| 5. Planeación | PlanningPacket | `/planning` | `GET/POST /api/planning-packets` | `planning-packet.schema.ts` | ⚠️ | Sin kits típicos |
| 6. Ejecución campo | ExecutionSession | `/execution` | `GET/POST /api/execution-sessions` | `execution-session.schema.ts` | ⚠️ | Offline parcial |
| 7. Informe técnico | TechnicalReport | `/reports` | `GET/POST /api/reports` | `report.schema.ts` | ⚠️ | Sin template PDF |
| 8. Acta entrega | DeliveryRecord | `/delivery-records` | `GET/POST /api/delivery-records` | `delivery-record.schema.ts` | ✅ | — |
| 9. Acta firmada | ClientSignature | `/delivery-records/[id]/signature` | `POST /api/delivery-records/[id]/sign` | `delivery-record.schema.ts` | ⚠️ | Firma digital |
| 10. SES / Ariba | ServiceEntrySheet | `/billing/ses` | `GET/POST /api/ses` | `ses.schema.ts` | ⚠️ | Cadena cobro |
| 11. SES aprobada | ServiceEntrySheet | `/billing/ses/[id]/approve` | `PUT /api/ses/[id]/approve` | `ses.schema.ts` | ⚠️ | Cadena cobro |
| 12. Factura | Invoice | `/billing/invoices` | `GET/POST /api/invoices` | `invoice.schema.ts` | ⚠️ | Cadena cobro |
| 13. Aprobación factura | Invoice | `/billing/invoices/[id]/approve` | `PUT /api/invoices/[id]/approve` | `invoice.schema.ts` | ⚠️ | Cadena cobro |
| 14. Pago + cierre | Payment | `/payments` | `GET/POST /api/payments` | `payment.schema.ts` | ⚠️ | Sin cierre definitivo |

---

## 5. Épicas de Producto

### EPIC 01 — Centro de Comando Dashboard KPI
**Problema:** Sin visibilidad centralizada del estado operativo.
**Valor:** Toma de decisiones en tiempo real.
**Páginas:** `/dashboard`
**Módulos:** `dashboard/`
**Endpoints:** `GET /api/dashboard/operational-summary`, `GET /api/dashboard/sla-risk-orders`
**Contratos:** `dashboard-summary.schema.ts`, `DashboardSlaRiskOrder`
**Estados:** Loading (Skeleton), Error (retry), Empty (onboarding), Online/Offline
**Innovación:** Gauge de FTFR, MTTR/MTBF, embudo de caja, tabla de riesgo SLA
**DoD:** Lighthouse mobile LCP < 4s | Dashboard carga con datos reales | Sin 404 | Sin console errors

### EPIC 02 — Cockpit de Caso de Servicio 14 Pasos
**Problema:** No hay vista unificada del progreso del caso.
**Valor:** Gerentes y residentes ven el estado exacto de cada caso.
**Páginas:** `/service-cases/[id]/cockpit`
**Módulos:** `service-cases/` + `cockpit/`
**Endpoints:** `GET /api/service-cases/[id]/operational-steps`
**Contratos:** `service-case-step-context.schema.ts`
**Innovación:** Timeline con 14 pasos, bloqueos coloreados, transiciones, responsables
**DoD:** Timeline renderiza 14 pasos | Bloqueos se muestran | Transiciones funcionan

### EPIC 03 — Planeación Inteligente
**Problema:** Fallas en planeación por alcance incompleto (doc CERMONT pág. 1).
**Valor:** Reducción de olvidos de herramientas/equipos/EPP.
**Páginas:** `/planning`, `/planning/[id]`
**Módulos:** `planning/`
**Endpoints:** `GET /api/planning-packets` + kits
**Contratos:** `planning-packet.schema.ts`, `kit.schema.ts`
**Innovación:** Autofill de kits típicos, verificación certificaciones, checklist previo
**DoD:** Kits típicos se autocompletan | Checklist previo obligatorio | AST integrado

### EPIC 04 — Ejecución en Campo Offline-First
**Problema:** Baja conectividad en campo.
**Valor:** Operación sin interrupción.
**Páginas:** `/execution`, `/execution/[id]`, `/execution/new`
**Módulos:** `execution/`
**Endpoints:** `GET/POST/PUT /api/execution-sessions`
**Contratos:** `execution-session.schema.ts`
**Innovación:** Offline completo, cola sync, conflictos, firma offline, fotos offline
**DoD:** Captura offline → Sync automático | Conflictos resueltos | Estado sync visible

### EPIC 05 — Evidencias Profesionales
**Problema:** Evidencias dispersas en WhatsApp/dispositivos (doc CERMONT).
**Valor:** Trazabilidad fotográfica profesional.
**Páginas:** `/evidences`, `/evidences/[id]`
**Módulos:** `evidences/`
**Endpoints:** `GET/POST/DELETE /api/evidences`
**Contratos:** `evidence.schema.ts`, `file-asset.schema.ts`
**Innovación:** Galería, captura cámara, metadatos, geolocalización, antes/después
**DoD:** Galería funcional | Carga múltiple | Compresión | Metadata visible

### EPIC 06 — Informes Técnicos y Actas
**Problema:** Retraso en informes (doc CERMONT pág. 2).
**Valor:** Informes profesionales generados automáticamente.
**Páginas:** `/reports`, `/reports/[id]`, `/reports/new`
**Módulos:** `reports/`
**Endpoints:** `GET/POST /api/reports`, `POST /api/reports/[id]/generate-pdf`
**Contratos:** `report.schema.ts`
**Innovación:** Plantillas PDF, firma digital, control de versiones, aprobación
**DoD:** PDF generado | Firma adjunta | Versionado | Aprobación por RBAC

### EPIC 07 — SES, Facturación y Pagos
**Problema:** Retraso en facturación (doc CERMONT pág. 2).
**Valor:** Cadena de cobro completa y trazable.
**Páginas:** `/billing/ses`, `/billing/invoices`, `/payments`
**Módulos:** `billing/`, `payments/`
**Endpoints:** `GET/POST/PUT /api/ses`, `/api/invoices`, `/api/payments`
**Contratos:** `ses.schema.ts`, `invoice.schema.ts`, `payment.schema.ts`
**Innovación:** Cadena SES→Factura→Pago, bloqueos por estado, alertas de vencimiento
**DoD:** SES→Factura→Pago secuencial | Bloqueos funcionan | Alertas de vencimiento

### EPIC 08 — Costos Reales vs Propuesta
**Problema:** Sin costos reales centralizados (doc CERMONT pág. 2).
**Valor:** Rentabilidad por orden, márgenes reales.
**Páginas:** `/costs`, `/costs/[orderId]`
**Módulos:** `costs/`
**Endpoints:** `GET /api/costs/[orderId]`, `GET /api/costs/[orderId]/variance`
**Contratos:** `cost-intelligence.schema.ts`, `cost-budget.schema.ts`
**Innovación:** Comparación propuesta vs real, desviación %, margen por orden
**DoD:** Costos reales cargados | Comparación visual | Desviación calculada

### EPIC 09 — Notificaciones y Alertas
**Problema:** Sin alertas de eventos operativos.
**Valor:** Los usuarios saben qué requiere atención.
**Páginas:** `/notifications`
**Módulos:** `notifications/`
**Endpoints:** `GET /api/notifications`, `GET /api/notifications/unread-count`
**Contratos:** `notification.schema.ts`
**Innovación:** Campanita con badge, lista priorizada, alertas críticas, preferencias
**DoD:** Badge de no leídas | Lista funcional | Marcar leídas | Preferencias por rol

### EPIC 10 — Administración RBAC y Configuración
**Problema:** Sin gestión centralizada de configuración.
**Valor:** Autonomía administrativa.
**Páginas:** `/admin/*`
**Módulos:** `admin/`
**Endpoints:** `GET/POST/PUT /api/users`, `/api/personnel`, `/api/system-config`
**Contratos:** `user.schema.ts`, `system-config.schema.ts`
**Innovación:** Roles granulares, permisos por módulo, configuración por tenant
**DoD:** CRUD usuarios | Roles asignados | Config módulos | Logs auditoría

### EPIC 11 — Archivado Histórico y Backups
**Problema:** Sin backup ni archivado. Riesgo de pérdida de datos.
**Valor:** Continuidad del negocio.
**Módulos:** `backup/`
**Infra:** Scripts de backup, export CSV/ZIP, archivado mensual
**Innovación:** Archivado automático, exportación documental por orden, limpieza VPS
**DoD:** Backup automático configurado | Exportación funcional | Archivado mensual

### EPIC 12 — Portal Cliente
**Problema:** Clientes no tienen visibilidad de sus órdenes.
**Valor:** Reducción de llamadas/emails, transparencia.
**Páginas:** `/portal/*`
**Módulos:** `portal/`
**Endpoints:** `GET /api/portal/orders`, `/api/portal/invoices`, `/api/portal/signatures`
**Contratos:** `portal.schema.ts`
**Innovación:** Consulta de órdenes, descarga de PDFs, firma digital, historial
**DoD:** Portal carga sin auth del cliente (token temporal) | Órdenes visibles | Firmas funcionales

---

## 6. Roadmap por Waves

### Wave 0 — Restaurar Calidad y Runtime (✅ COMPLETADA)
**Objetivo:** Quality gates pasando, runtime estable.
**Valor:** Base técnica limpia para construir.
**Entregables:**
- [x] weak-token-ud corregido (env.ts, idempotency.middleware.ts)
- [x] React Doctor documentado (9 falsos positivos)
- [x] Notifications API normalizada
- [x] Dashboard KPI lazy loading
**Validación:** `npm run quality:strict && npm run quality:weak-tokens`

### Wave 1 — Normalización Contract-First
**Objetivo:** Revisar y unificar contratos en shared-types.
**Valor:** Consistencia entre frontend y backend.
**Tickets:**
- CERMONT-CONTRACT-001 — Revisar envelope `{ success, data }` en todos los endpoints
- CERMONT-CONTRACT-002 — Unificar naming de fechas (`createdAt`, `updatedAt`)
- CERMONT-CONTRACT-003 — Centralizar enumeraciones de estado en `@cermont/domain`
**Validación:** `npm run contracts:check && npm run typecheck`

### Wave 2 — Dashboard KPI Profesional
**Objetivo:** Dashboard con KPIs reales conectados a backend.
**Valor:** Toma de decisiones gerencial.
**Tickets:**
- CERMONT-DASH-001 — Endpoint `GET /api/dashboard/operational-summary`
- CERMONT-DASH-002 — Endpoint `GET /api/dashboard/sla-risk-orders`
- CERMONT-DASH-003 — Integrar KPIs en `OperationalKpiSection.tsx`
- CERMONT-DASH-004 — CashFlowFunnel con datos reales
- CERMONT-DASH-005 — SlaRiskOrdersTable con datos reales
**Archivos probables:** `dashboard/*`, `services/dashboard*.service.ts`
**Validación:** Dashboard carga con datos | Lighthouse LCP < 5s

### Wave 3 — Service Case Cockpit 14 Pasos
**Objetivo:** UI unificada del flujo completo.
**Valor:** Visibilidad de progreso por caso.
**Tickets:**
- CERMONT-COCKPIT-001 — Timeline visual de 14 pasos
- CERMONT-COCKPIT-002 — Bloqueos documentales por paso
- CERMONT-COCKPIT-003 — Transiciones de estado con RBAC
- CERMONT-COCKPIT-004 — Responsables y fechas por paso
**Archivos probables:** `service-cases/ui/CockpitPanel.tsx` (restaurar o recrear)
**Validación:** Timeline renderiza | Bloqueos correctos | RBAC validado

### Wave 4 — Planeación + Kits + Checklists
**Objetivo:** Planeación completa con kits típicos.
**Valor:** Reducción de olvidos en campo.
**Tickets:**
- CERMONT-PLAN-001 — Autofill de kits típicos por actividad
- CERMONT-PLAN-002 — Verificación certificaciones equipos/personal
- CERMONT-PLAN-003 — AST integrado en planeación
- CERMONT-PLAN-004 — Checklist previo obligatorio
**Validación:** Kit autocompleta | Certificaciones verificadas | AST generado

### Wave 5 — Ejecución Offline + Evidencias
**Objetivo:** Ejecución en campo offline-first completa.
**Valor:** Operación sin conexión.
**Tickets:**
- CERMONT-EXEC-001 — Modo offline completo en ExecutionSession
- CERMONT-EXEC-002 — Captura de evidencias offline
- CERMONT-EXEC-003 — Firma offline con cola de sync
- CERMONT-EXEC-004 — Checkpoint de progreso offline
**Validación:** Offline → Sync → Sin conflictos | Evidencias persisten

### Wave 6 — Informes + Actas + Firmas
**Objetivo:** Generación de informes profesionales.
**Valor:** Reducción de retraso en informes.
**Tickets:**
- CERMONT-REPORT-001 — Template de informe técnico
- CERMONT-REPORT-002 — Generación PDF del informe
- CERMONT-REPORT-003 — Acta de entrega con firma digital
- CERMONT-REPORT-004 — Control de versiones del informe

### Wave 7 — SES + Facturas + Pagos
**Objetivo:** Cadena de cobro completa.
**Valor:** Facturación oportuna.
**Tickets:**
- CERMONT-BILL-001 — Flujo SES → Factura con validación
- CERMONT-BILL-002 — Aprobación SES por RBAC
- CERMONT-BILL-003 — Aprobación factura por RBAC
- CERMONT-BILL-004 — Cierre definitivo tras pago

### Wave 8 — Costos Reales + Rentabilidad
**Objetivo:** Comparación propuesta vs costo real.
**Valor:** Margen por orden.
**Tickets:**
- CERMONT-COST-001 — Endpoint `GET /api/costs/[orderId]/variance`
- CERMONT-COST-002 — UI comparación propuesta vs real
- CERMONT-COST-003 — Cálculo de margen y desviación

### Wave 9 — Notificaciones + Alertas
**Objetivo:** Sistema de notificaciones completo.
**Valor:** Usuarios informados en tiempo real.
**Tickets:**
- CERMONT-NOTIF-001 — Badge de no leídas en Header
- CERMONT-NOTIF-002 — Lista paginada de notificaciones
- CERMONT-NOTIF-003 — Marcar como leídas
- CERMONT-NOTIF-004 — Preferencias por usuario

### Wave 10 — Admin RBAC + Configuración
**Objetivo:** Administración completa.
**Valor:** Autonomía administrativa.

### Wave 11 — Backups + Histórico + Exportación
**Objetivo:** Continuidad operativa.
**Valor:** Protección de datos.

### Wave 12 — Portal Cliente
**Objetivo:** Autoservicio para clientes.
**Valor:** Reducción de llamadas.

### Wave 13 — Performance + Lighthouse + Mobile UX
**Objetivo:** LCP < 3.5s mobile.
**Valor:** UX profesional.

### Wave 14 — CI/CD + VPS Production Hardening
**Objetivo:** Despliegue robusto.
**Valor:** Producción estable.

---

## 7. Tickets Implementables (40+)

### P0 — Bloqueantes para producción

| ID | Título | Dominio | Problema | Solución | Archivos | Validación |
|:--:|--------|:-------:|----------|----------|:--------:|:----------:|
| CERMONT-001 | Endpoint GET /api/dashboard/operational-summary | Dashboard | Sin KPI reales | Agregar service con agregaciones MongoDB | `backend/src/services/dashboard.service.ts`, `routes/dashboard.routes.ts` | `curl /api/dashboard/operational-summary` retorna JSON |
| CERMONT-002 | Cockpit timeline 14 pasos | Service Cases | Sin vista unificada | Componente Timeline con steps, bloqueos, responsables | `frontend/.../cockpit/ui/Timeline.tsx` | Timeline renderiza 14 pasos |
| CERMONT-003 | Autofill kits típicos | Planning | Planeación incompleta | Endpoint + UI para autocompletar kits | `backend/.../kit.service.ts`, `planning/pages` | Kit autocompleta herramientas |
| CERMONT-004 | Cadena SES → Factura → Pago | Billing | Sin flujo completo | Validaciones + UI conectada | `billing/*`, `payments/*` | Flujo completo funcional |
| CERMONT-005 | Comparación costos propuesta vs real | Costs | Sin rentabilidad | Endpoint variance + UI | `costs/*`, `dashboard/*` | Gráfica de desviación |
| CERMONT-006 | Backup automático | Infra | Sin backup | Script cron + MongoDB dump | `scripts/backup.sh` | Backup existe en disco |
| CERMONT-007 | Portal cliente consulta | Portal | Sin autoservicio | Páginas portal token-based | `portal/*` | Portal carga sin auth |
| CERMONT-008 | Lighthouse mobile LCP | Performance | Dashboard lento | Lazy loading + imágenes + bundles | `dashboard/ui/*`, `next.config.ts` | LCP < 4s |

### P1 — Alto valor de negocio

| ID | Título | Dominio |
|:--:|--------|:-------:|
| CERMONT-009 | CashFlowFunnel con datos reales | Dashboard |
| CERMONT-010 | SlaRiskOrdersTable con datos reales | Dashboard |
| CERMONT-011 | Bloqueos documentales en cockpit | Service Cases |
| CERMONT-012 | Transiciones RBAC en cockpit | Service Cases |
| CERMONT-013 | Verificación certificaciones equipos | Planning |
| CERMONT-014 | AST integrado en planeación | Planning |
| CERMONT-015 | Checklist previo obligatorio | Planning |
| CERMONT-016 | Evidencias offline con cola sync | Execution |
| CERMONT-017 | Generación PDF informe técnico | Reports |
| CERMONT-018 | Firma digital en acta | Delivery Records |
| CERMONT-019 | Badge de notificaciones | Notifications |
| CERMONT-020 | Lista paginada notificaciones | Notifications |

### P2 — Mejora continua

| ID | Título | Dominio |
|:--:|--------|:-------:|
| CERMONT-021 | Tests E2E flujo login → dashboard | E2E |
| CERMONT-022 | Tests E2E flujo órdenes | E2E |
| CERMONT-023 | Preferencias de notificaciones | Notifications |
| CERMONT-024 | Exportación documental ZIP | Documents |
| CERMONT-025 | Archivado mensual automático | Backups |
| CERMONT-026 | Portal cliente — descarga PDF | Portal |
| CERMONT-027 | Portal cliente — firma digital | Portal |
| CERMONT-028 | Portal cliente — historial | Portal |
| CERMONT-029 | RBAC granular por módulo | Admin |
| CERMONT-030 | Configuración por módulo | Admin |
| CERMONT-031 | MTTR/MTBF cards con datos reales | Dashboard |
| CERMONT-032 | FirstTimeFixRate gauge real | Dashboard |
| CERMONT-033 | Mongo indexes para performance | Backend |
| CERMONT-034 | Docker multi-stage optimizado | Infra |
| CERMONT-035 | PM2 startup on boot | Infra |
| CERMONT-036 | Health checks + alertas | Infra |
| CERMONT-037 | Rate limiting por usuario | Security |
| CERMONT-038 | CORS hardening | Security |
| CERMONT-039 | Logs JSON estructurados | Observability |
| CERMONT-040 | Error tracking + reporting | Observability |
| CERMONT-041 | Service Worker precache optimizado | PWA |
| CERMONT-042 | Table virtualization en listas grandes | UI |

---

## 8. Innovación Controlada

| Innovación | Valor | Complejidad | Riesgo | MVP | Versión avanzada | Datos | Módulos |
|------------|:-----:|:-----------:|:------:|:---:|:----------------:|:-----:|:--------:|
| Formularios dinámicos desde documentos | Alto | Alta | Medio | 5 plantillas | Editor visual | Documentos PDF | Documents |
| Constructor de checklists por servicio | Alto | Media | Bajo | 3 tipos | Editor drag-drop | Formatos inspección | Checklists |
| Kits típicos inteligentes | Alto | Media | Bajo | Autofill estático | ML recomendación | Historial actividades | Kits |
| Evidencias con geolocalización | Medio | Baja | Bajo | GPS en metadata | Mapa de evidencias | Coordenadas | Evidences |
| Motor de bloqueos documentales | Alto | Media | Medio | 5 reglas | Reglas dinámicas | Estados CERMONT | Service Cases |
| Timeline auditable 14 pasos | Alto | Media | Bajo | Timeline visual | Playback + filtros | Steps DB | Cockpit |
| Dashboard cuellos de botella | Alto | Alta | Medio | Top 5 retrasos | Predicción IA | Pipeline data | Dashboard |
| Alertas predictivas de retraso | Alto | Alta | Alto | Umbral fijo | ML predicción | Historial | Notifications |
| Exportación paquete documental | Medio | Baja | Bajo | ZIP por orden | ZIP + PDF + metadatos | Documentos orden | Documents |
| Comparador costo vs propuesta | Alto | Media | Bajo | Tabla comparativa | Gráfica + tendencia | Costos reales | Costs |
| Portal cliente self-service | Alto | Alta | Medio | Consulta + firma | Dashboard cliente | Órdenes cliente | Portal |
| Modo offline con sync batch | Alto | Media | Medio | Cola FIFO | Sync selectivo | IndexedDB | Offline |
| Control conflictos offline | Alto | Media | Medio | Last-write-wins | Merge UI | Sync log | Offline |
| Auditoría de acciones críticas | Alto | Baja | Bajo | Logs forenses | Dashboard auditoría | Audit log | Audit |

---

## 9. Optimización Técnica

| Área | Problema | Solución | Impacto esperado | Prioridad |
|------|----------|----------|:----------------:|:---------:|
| Lighthouse LCP | Imágenes sin optimizar, bundles grandes | `<Image>` + `next/dynamic` | LCP < 4s | P0 |
| Bundle JS | Dashboard imports completos | Code splitting por widget | -30% bundle | P0 |
| API waterfalls | Múltiples requests secuenciales | Parallel queries + prefetch | -50% tiempo carga | P1 |
| React Query cache | Sin staleTime | `staleTime: 30_000` en queries | -80% requests duplicados | P1 |
| Service Worker | 243 entries, 6.6MB precache | Revisar estrategia cache | -2MB precache | P2 |
| IndexedDB | Sin limpieza de datos viejos | TTL + purge automático | -200MB almacenamiento | P2 |
| Mongo indexes | Audit log sin index | Índices compuestos | < 100ms queries | P1 |
| Mongo indexes | Búsquedas por estado | Índice `{ status: 1, createdAt: -1 }` | < 50ms queries | P1 |
| Table virtualization | Listas grandes sin virtualizar | `react-virtual` o similar | 60fps en scroll | P2 |
| Pagination | Sin server-side pagination | `limit/offset` + `totalCount` | Carga inicial reducida | P1 |
| Image optimization | PNG sin comprimir | WebP + next/image | -70% peso imágenes | P0 |
| Docker image | Sin multi-stage | Multi-stage build | -60% imagen | P1 |
| VPS memory | Node process sin límite | PM2 max_memory_restart | Sin OOM kills | P1 |

---

## 10. Seguridad y Cumplimiento

| Área | Estado actual | Acción requerida | Prioridad |
|------|:-------------:|------------------|:---------:|
| RBAC por módulo | ✅ Implementado | Revisar cobertura en todos los módulos | P1 |
| Permisos por acción | ✅ Implementado | Test de integridad RBAC | P2 |
| Logs auditables | ✅ Implementado | Auditoría forense en 14 pasos | P1 |
| Protección datos personales | ⚠️ Parcial | Revisar almacenamiento de datos sensibles | P1 |
| Documentos confidenciales | ✅ Implementado | Retention-aware deletion | P2 |
| Firmas digitales | ⚠️ Parcial | Portal cliente con firma | P1 |
| Rate limiting | ✅ Implementado | MongoRateLimitStore funcional | P1 |
| CORS | ✅ Implementado | Config producción restrictiva | P1 |
| Cookies HttpOnly | ✅ Implementado | Refresh token en cookie | P1 |
| JWT | ✅ Implementado | Access + Refresh tokens | P1 |
| Validación Zod | ✅ Implementado | Input validation en todas las rutas | P1 |
| Errores tipados | ✅ Implementado | ApiError con código + mensaje | P1 |
| Helmet headers | ✅ Implementado | Seguridad HTTP headers | P2 |
| Upload allowlist | ✅ Implementado | Magic bytes validation | P1 |
| Sanitización | ✅ Implementado | Sanitize middleware | P1 |

---

## 11. Definition of Done Global

Ningún ticket se considera completado hasta que pase:

```bash
# Quality gates
npm run quality:weak-tokens      # 0 sobre baseline
npm run quality:language         # dentro de baseline
npm run quality:strict           # todos passing
npm run quality:zero             # sin null/undefined/unknown
npm run quality:routes           # 0 findings
npm run quality:dtos             # 0 findings
npm run quality:hardcoded-roles  # 0 findings

# React Doctor
npx react-doctor@latest --verbose --scope changed  # 100/100 o documentado

# Compilación
npm run typecheck                # 0 errors
npm run lint                     # 0 errors  
npm run build                    # exit 0

# Tests
npm run test                     # todos pass
npm run contracts:check          # snapshot match

# Verify completo
npm run verify                   # todos los gates

# Runtime (verificar manualmente si aplica)
# - Sin errores de consola en rutas críticas
# - Sin 404 API en rutas críticas
# - Sin .map is not a function
# - Dashboard mobile usable
# - Flujo 14 pasos con bloqueos
# - RBAC validado
# - Offline sync validado
# - VPS no roto
```

---

## 12. Estrategia de Commits

Cada wave produce commits atómicos por ticket:

```
type(scope): desc

tipos: feat, fix, refactor, test, docs, perf, security, chore
scopes: dashboard, cockpit, planning, execution, evidences, reports,
        billing, costs, notifications, admin, portal, infra
```

Ejemplos:
```
feat(dashboard): add operational-summary endpoint with MongoDB aggregations
fix(notifications): normalize response with ?? [] guard
refactor(cockpit): extract 14-step timeline into reusable component
```

---

## 13. Plan de Iteración Recomendado

```
Semana 1: Waves 0-1 (✅ Wave 0 completa) | Calidad + Contratos
Semana 2: Wave 2 | Dashboard KPI
Semana 3: Wave 3 | Cockpit 14 pasos
Semana 4: Wave 4 | Planeación + Kits
Semana 5: Wave 5 | Ejecución offline
Semana 6: Wave 6 | Informes + Actas
Semana 7: Wave 7 | SES + Facturas + Pagos
Semana 8: Wave 8 | Costos reales
Semana 9: Wave 9-10 | Notificaciones + Admin
Semana 10: Wave 11-12 | Backups + Portal
Semana 11: Wave 13 | Performance + Lighthouse
Semana 12: Wave 14 | VPS Production Hardening
```

**Total estimado:** 12 semanas para producto completo profesional.

---

*Documento generado a partir de auditoría técnica real y documentos fuente CERMONT. Todos los hallazgos fueron validados con comandos el 2026-07-07.*
