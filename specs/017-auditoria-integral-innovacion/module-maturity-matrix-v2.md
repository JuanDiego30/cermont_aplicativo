# Module Maturity Matrix v2 — CERMONT S.A.S.

**Fecha:** 2026-07-05
**Spec:** 017 — Auditoría Integral, Investigación y Plan de Innovación
**Basado en:** Verificación real de módulos backend (Fase 1) + benchmark externo (Fase 3)

---

## 1. Escala de Madurez (0-5)

| Nivel | Descripción |
|-------|-------------|
| 0 | No existe / Directorio vacío |
| 1 | Solo routes (sin controller/service/model) |
| 2 | Controller + Routes + Service parcial |
| 3 | Completo (routes/controller/service/model) |
| 4 | Completo + Tests + Documentación actualizada |
| 5 | Completo + Tests + Docs + Monitoreo + CI/CD |

---

## 2. Matriz de Madurez por Módulo (56 módulos)

### 2.1 Módulos Críticos del Flujo Documental (Pasos 1-14)

| # | Módulo | Paso | Nivel Actual | Evidencia | Nivel Objetivo | Ref. Externa | Brecha | Prioridad |
|---|--------|------|-------------|-----------|----------------|--------------|--------|-----------|
| 1 | work-requests | 1 | 3 | CRUD + visits + transitions completos | 4 | UpKeep, Fiix | Sin tests | P2 |
| 2 | site-visits | 2 | 3 | CRUD + schedule completos | 4 | UpKeep mobile | Sin tests | P2 |
| 3 | proposals | 3 | 3 | CRUD + send/approve/reject | 4 | Jobber quoting | Sin tests | P2 |
| 4 | purchase-orders | 4 | 3 | Adjuntar PO a propuesta | 4 | — | Sin tests | P2 |
| 5 | planning-packet | 5 | 3 | CRUD + approve | 4 | Fiix PM scheduling | Sin tests | P2 |
| 6 | orders | 6 | 3 | CRUD + kanban + state machine | 4 | ServiceTitan dispatch | Sin tests (⚠️ parciales) | P2 |
| 7 | execution | 6 | 3 | Sessions + pause/complete + materials | 4 | UpKeep mobile | Sin tests | P2 |
| 8 | evidence | 7 | 3 | Upload multipart + verify + reject | 4 | UpKeep photos offline | Sin tests | P2 |
| 9 | reports | 8 | 3 | CRUD + submit/approve | 4 | — | Sin tests | P2 |
| 10 | delivery-record | 9 | 1 | Solo routes (2 archivos, sin controller/service) | 3 | react-esign (firma) | **Sin lógica de negocio** | **P0** |
| 11 | service-entry-sheet | 11 | 1 | Solo routes (2 archivos, sin controller/service) | 3 | — | **Sin lógica de negocio** | **P0** |
| 12 | invoice | 12 | 1 | Solo routes (2 archivos, sin controller/service) | 3 | Jobber invoicing | **Sin lógica de negocio** | **P0** |
| 13 | payment | 14 | 1 | Solo routes (1 archivo, sin controller/service) | 3 | UpKeep payments | **Sin lógica de negocio** | **P0** |

### 2.2 Módulos de Reportes y Documentación

| # | Módulo | Nivel Actual | Evidencia | Objetivo | Ref. Externa | Brecha | Prioridad |
|---|--------|-------------|-----------|----------|--------------|--------|-----------|
| 14 | technical-report | 8 | 1 | Solo routes (1 archivo, 126 líneas) | 3 | ServiceMax reports | **Sin lógica de negocio** | **P0** |
| 15 | documents | — | 3 | CRUD + templates + PDF generation | 4 | — | Sin tests | P2 |
| 16 | templates | — | 3 | CRUD + builder + responses | 4 | — | Sin tests | P2 |

### 2.3 Módulos de Infraestructura y Cross-cutting

| # | Módulo | Nivel Actual | Evidencia | Objetivo | Ref. Externa | Brecha | Prioridad |
|---|--------|-------------|-----------|----------|--------------|--------|-----------|
| 17 | auth | — | 4 | JWT + refresh + passkeys + rate limiting | 5 | OWASP | Tests parciales | P2 |
| 18 | user | — | 4 | CRUD + certificaciones + skills | 5 | — | Tests parciales | P2 |
| 19 | audit | — | 3 | Logging inmutable queryable | 4 | Compliance | Sin tests | P2 |
| 20 | notifications | — | 3 | Backend + frontend notificaciones | 4 | UpKeep push | Sin tests | P2 |
| 21 | offline-sync | — | 3 | IndexedDB queue + sync endpoint | 4 | UpKeep offline | Sin tests | P2 |
| 22 | system-config | — | 3 | CRUD configuración sistema | 4 | — | Sin tests | P2 |
| 23 | costs | — | 3 | Dashboard + catalog + actual costs | 4 | ServiceTitan pricebook | Sin tests | P2 |
| 24 | cost-intelligence | — | 3 | Spec-016: baseline vs actual KPIs | 4 | — | Nuevo | P2 |

### 2.4 Módulos HSE/Safety

| # | Módulo | Nivel Actual | Evidencia | Objetivo | Ref. Externa | Brecha | Prioridad |
|---|--------|-------------|-----------|----------|--------------|--------|-----------|
| 25 | checklists | — | 3 | Backend completo, UI por verificar | 4 | eMaint compliance | UI pendiente | P1 |
| 26 | safety-analysis | — | 3 | AST/HSE implementado | 4 | — | Sin tests | P2 |
| 27 | sla | — | 3 | CRUD SLA | 4 | ServiceNow SLA | Sin tests | P2 |

### 2.5 Módulos de Recursos

| # | Módulo | Nivel Actual | Evidencia | Objetivo | Ref. Externa | Brecha | Prioridad |
|---|--------|-------------|-----------|----------|--------------|--------|-----------|
| 28 | fleet | — | 3 | CRUD + expiring documents + photos | 4 | Maximo fleet | Sin tests | P2 |
| 29 | asset | — | 3 | CRUD + maintenance link + profile | 4 | IBM Maximo | Sin tests | P2 |
| 30 | maintenance | — | 3 | CRUD + planes | 4 | Fiix PM scheduling | Sin tests | P2 |
| 31 | inventory | — | 3 | CRUD + scan | 4 | eMaint inventory | Sin tests | P2 |
| 32 | kit | — | 3 | Kits típicos herramienta | 4 | — | Sin tests | P2 |
| 33 | tool | — | 3 | Tools & assets | 4 | — | Sin tests | P2 |

### 2.6 Módulos No Funcionales / Con Problemas

| # | Módulo | Nivel Actual | Evidencia | Objetivo | Ref. Externa | Brecha | Prioridad |
|---|--------|-------------|-----------|----------|--------------|--------|-----------|
| 34 | **kpi** | **0** | **Directorio VACÍO** | 3 | ServiceTitan KPI dashboards | **No implementado** | **P0** |
| 35 | **media** | **0** | **Directorio VACÍO** | 2 | UpKeep media management | **No implementado** | **P0** |
| 36 | **observability** | **2** | Controller + routes (sin service) | 3 | DataDog, Sentry | **Sin service dedicado** | **P1** |
| 37 | dispatch | — | 3 | CRUD dispatch | 4 | serwist/fieldopt | Sin tests | P2 |
| 38 | service-cases | — | 3 | Cockpit 14 pasos | 4 | — | Sin tests | P2 |
| 39 | portal-cliente | — | 3 | Portal vistas cliente | 4 | Jobber Client Hub | Sin tests | P2 |
| 40 | dian | — | 3 | Facturación electrónica | 4 | — | Sin tests | P2 |
| 41 | ai | — | 2 | AI service (parcial) | 3 | Salesforce Agentforce | Exploratorio | P3 |

### 2.7 Módulos Restantes (Nivel 3, todos sin tests)

Los siguientes módulos están completos (routes/controller/service/model) pero sin tests:
`calendar`, `client`, `contract`, `dashboard`, `file-service`, `files`, `media-conversion`, `messaging`, `migration`, `monitoring`, `order-fallback`, `payment-reconciliation`, `planning`, `privacy`, `report-generation`, `resource`, `service-catalog`, `signature`, `sla-monitoring`, `sync`, `template-response`, `workflow` (22 módulos aproximadamente)

**Total módulos nivel 3 sin tests: ~38**

---

## 3. Resumen de Madurez

| Nivel | Cantidad Módulos | Acción Requerida |
|-------|-----------------|------------------|
| 0 (Vacío) | 2 | Implementar desde cero (kpi, media) |
| 1 (Solo routes) | 6 | Implementar controller/service/model |
| 2 (Parcial) | 3 | Completar service + tests (observability, ai, cost-intelligence) |
| 3 (Completo sin tests) | ~38 | Agregar tests |
| 4 (Completo con tests) | 2 | Monitoreo + CI/CD |
| 5 (Completo + CI/CD) | 0 | — |

**Madurez promedio del sistema:** 2.8/5 (arrastrado por 8 módulos con nivel ≤ 2)

---

## 4. Priorización de Cierre de Brechas

| Prioridad | Módulos | Acción |
|-----------|---------|--------|
| **P0 - Crítica (8 módulos)** | delivery-record, service-entry-sheet, invoice, payment, technical-report, kpi, media | Implementar controllers/services/models o migrar funcionalidad |
| **P1 - Alta (3 módulos)** | observability, checklists (UI), cost-intelligence | Completar service/UI faltante |
| **P2 - Media (~38 módulos)** | Todos los demás | Agregar tests, documentación |
| **P3 - Baja** | Módulos exploratorios (ai, workflow) | Investigar viabilidad |
