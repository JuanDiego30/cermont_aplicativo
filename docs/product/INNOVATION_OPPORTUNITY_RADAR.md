# INNOVATION OPPORTUNITY RADAR — Cermont S.A.S.

> **Generated**: 2026-06-29  
> **Source**: T8 research + T2-T6 maps + MODULE_MATURITY_MATRIX  
> **Methodology**: Impacto × Esfuerzo × Riesgo prioritization

---

## Executive Summary

From 15+ identified opportunities, 6 are prioritized for immediate action. The remaining 9+ are documented as "Visión Futuro" for post-MVP consideration.

---

## Top 6 Prioritized Opportunities

### 1. Unified Media/Evidence Engine (P1 — Alta Prioridad)

**Problem**: Evidencias son el core del producto, pero el flujo actual está fragmentado entre V1/V2, múltiples modelos (Evidence, FileAsset), y storage local sin CDN.

**Modules Affected**:
- Backend: `evidence/`, `files/`, `documents/`
- Frontend: `evidences/`, `documents/`
- Packages: `shared-types` (schemas)

**Data Needed**: Evidence documents, FileAsset metadata, storage config

**Complexity**: Alta (requiere migración V1→V2, nuevo schema unificado)

**Impact**: Alto — mejora UX, reduce deuda técnica, habilita features futuras

**Risk**: Medio — migración de datos existentes, backward compatibility

**MVP Definition**:
1. Schema unificado `MediaAsset` con `ownerType`/`ownerId` polimórfico
2. Migración automática V1→V2 (script one-time)
3. API unificada `/api/media` reemplaza `/api/evidences` y `/api/files`
4. Frontend usa nuevo hook `useMediaAssets`
5. Storage local mantenido (CDN en Fase 2)

**Success Metric**: 100% de evidencias migradas a V2, 0% errores en upload, <200ms latency en list

---

### 2. Fleet/Tools Professional Asset Layer (P1 — Alta Prioridad)

**Problem**: Vehículos y herramientas son activos críticos del negocio, pero la gestión es básica. Falta: historial de mantenimiento, certificaciones, disponibilidad en tiempo real, vinculación a órdenes.

**Modules Affected**:
- Backend: `fleet/`, `tool/`, `maintenance/`, `inventory/`
- Frontend: `fleet/`, `resources/`, `maintenance/`

**Data Needed**: Vehicle/Tool documents, maintenance logs, certification records

**Complexity**: Media — extiende modelos existentes, nuevos servicios

**Impact**: Alto — reduce downtime, mejora planificación, cumple normativa

**Risk**: Bajo — datos existentes se preservan, features son aditivas

**MVP Definition**:
1. Extender `Vehicle` y `Tool` con `certifications[]`, `maintenanceHistory[]`
2. Servicio `asset-readiness` calcula disponibilidad
3. UI: Fleet/Tool profile con pestañas (info, mantenimiento, certificados, historial)
4. Alertas: SOAT/tecnomecánica/póliza por vencer
5. Vinculación a órdenes: "Asignar vehículo a orden"

**Success Metric**: 80% de activos con certificaciones registradas, <24h en alertas de vencimiento

---

### 3. Digital Twin per Order (P2 — Media-Alta)

**Problem**: No existe visualización unificada del estado documental de una orden. Clientes y supervisores necesitan "ver" el progreso en tiempo real.

**Modules Affected**:
- Backend: `order/`, `service-case/`, `audit/`
- Frontend: `orders/`, `service-cases/`, `workflow/`

**Data Needed**: Order state history, audit events, document timestamps

**Complexity**: Media — timeline component, state reconstruction

**Impact**: Medio-Alto — diferencial competitivo, mejora transparency

**Risk**: Bajo — read-only feature, no afecta datos existentes

**MVP Definition**:
1. Backend: endpoint `/api/orders/:id/timeline` retorna eventos ordenados
2. Frontend: componente `OrderTimeline` con D3.js/Framer Motion
3. Estados coloreados: verde (completado), amarillo (en progreso), rojo (bloqueado)
4. Filtros: por usuario, por tipo de evento, por fecha
5. Export: PDF/CSV del timeline

**Success Metric**: 90% de órdenes con timeline visible, <3s carga del timeline

---

### 4. AI Copilot MVP (P2 — Media)

**Problem**: Operadores y supervisores pierden tiempo buscando información. Necesitan asistentes que resuman, alerten y sugieran — sin exponer datos sensibles.

**Modules Affected**:
- Backend: Nuevo módulo `ai/` (ya existe básico)
- Frontend: `dashboard/`, `orders/`, `evidences/`

**Data Needed**: Orders, evidences, reports (RBAC-filtered)

**Complexity**: Alta — requiere LLM integration, RAG, seguridad

**Impact**: Medio — ahorra tiempo, mejora decisiones

**Risk**: Alto — seguridad de datos, costo de LLM, calidad de respuestas

**MVP Definition**:
1. RAG interno: embeddings de órdenes/evidencias en MongoDB Atlas Vector Search
2. LLM: Gemini/Claude con prompt estricto (sin datos personales)
3. Features iniciales:
   - "Resumir estado de orden X" → 3 bullets
   - "¿Qué falta para cerrar orden X?" → lista de pendientes
   - "Generar borrador de informe" → template prellenado
4. Seguridad: scope a datos RBAC, log de todas las consultas, sin PII en prompts
5. UI: Chat widget en sidebar, respuestas con citations

**Success Metric**: 70% de consultas respondidas correctamente, <5s respuesta, 0% fugas de PII

---

### 5. Automation Rules Engine (P2 — Media)

**Problem**: Muchas acciones son repetitivas: aprobar planning cuando todos los documentos están, notificar cuando evidencia es subida, cerrar orden cuando SES está aprobada.

**Modules Affected**:
- Backend: Nuevo módulo `automation/`
- Frontend: `admin/`, `orders/`

**Data Needed**: Order states, document statuses, user actions

**Complexity**: Media — rule engine, event system

**Impact**: Medio — reduce error humano, acelera flujos

**Risk**: Bajo — opt-in por módulo, fácil desactivar

**MVP Definition**:
1. Motor de reglas simple: `WHEN [event] THEN [action] IF [condition]`
2. Eventos: `evidence.uploaded`, `document.approved`, `ses.submitted`
3. Acciones: `notify.user`, `advance.step`, `create.task`
4. UI: Admin configura reglas por módulo
5. Ejemplos predefinidos:
   - "When evidence uploaded → notify supervisor"
   - "When all documents approved → advance to next step"
   - "When SES approved → create invoice"

**Success Metric**: 50% de órdenes avanzan automáticamente, 80% reducción en acciones manuales repetitivas

---

### 6. Commercial SaaS Foundation (P3 — Media-Baja)

**Problem**: Cermont es un producto, no una plataforma. Para escalar a múltiples contratistas, necesita multi-tenancy, feature flags, y billing.

**Modules Affected**:
- Backend: Todos (tenantId injection)
- Frontend: Todos (branding, feature flags)
- Infra: MongoDB, VPS

**Data Needed**: Tenant config, usage metrics, billing data

**Complexity**: Alta — requiere cambios arquitectónicos

**Impact**: Medio-Bajo — habilitador de negocio, no producto directo

**Risk**: Alto — migración compleja, downtime potencial

**MVP Definition**:
1. Schema `Tenant` con `features[]`, `branding{}`, `limits{}`
2. Middleware inyecta `tenantId` en todas las queries
3. Feature flags: `canAccessFeature(tenantId, 'advanced-analytics')`
4. Billing básico: `usage` collection con `apiCalls`, `storageBytes`, `usersCount`
5. UI: Tenant admin configura branding y límites

**Success Metric**: Soporte para 10+ tenants, 99.9% aislamiento de datos, billing preciso

---

## Visión Futuro (Oportunidades 7-15)

Estas oportunidades se documentan para consideración post-MVP:

| # | Oportunidad | Categoría | Esfuerzo | Razón de Postergación |
|---|-------------|-----------|----------|----------------------|
| 7 | Real-Time Collaboration | UX | Alto | Requiere WebSocket infra, priorizar MVP core primero |
| 8 | Advanced Analytics (Predictivo) | AI | Alto | Depende de AI Copilot (P2) |
| 9 | Mobile Native App | UX | Alto | PWA actual es suficiente para MVP |
| 10 | ERP Integration Marketplace | Integración | Medio | Requiere SaaS Foundation (P3) |
| 11 | Computer Vision para Documentos | AI | Medio | Depende de AI Copilot infra |
| 12 | Blockchain para Audit Trail | Seguridad | Alto | Overkill para etapa actual |
| 13 | IoT Integration (Sensores) | IoT | Alto | No es core del negocio actual |
| 14 | Gamificación de Field Teams | UX | Medio | Nice-to-have, no crítico |
| 15 | Advanced Reporting (BI) | Analytics | Medio | Depende de Digital Twin (P2) |

---

## Implementation Roadmap

### Sprint 1-4 (Q3 2026)
- **T9.1**: Unified Media/Evidence Engine — Schema + Migration
- **T9.2**: Fleet/Tools Professional Asset Layer — Extensions

### Sprint 5-8 (Q4 2026)
- **T9.3**: Unified Media/Evidence Engine — API + Frontend
- **T9.4**: Digital Twin per Order — Timeline MVP

### Sprint 9-12 (Q1 2027)
- **T9.5**: AI Copilot MVP — RAG + LLM integration
- **T9.6**: Automation Rules Engine — Core engine

### Sprint 13-16 (Q2 2027)
- **T9.7**: Commercial SaaS Foundation — Multi-tenancy
- **T9.8**: Advanced features based on learnings

---

## Dependencies Graph

```
Unified Media Engine ──┐
                       ├──▶ Digital Twin ──▶ Advanced Reporting
Fleet/Tools Layer ─────┘
                       │
AI Copilot ────────────┼──▶ Automation Rules
                       │
SaaS Foundation ───────┼──▶ ERP Marketplace
                       │
Real-Time Collab ──────┘ (post-MVP)
```

---

## Risk Register

| Opportunity | Risk | Mitigation |
|-------------|------|------------|
| Unified Media Engine | Migración V1→V2 fallida | Script de migración con rollback, feature flag |
| Fleet/Tools Layer | Datos incompletos | UI de carga masiva, validación |
| Digital Twin | Performance con muchos eventos | Paginación, virtual scroll, cache |
| AI Copilot | Fuga de PII, costo LLM | Scoping RBAC, cache de respuestas, presupuesto |
| Automation Rules | Reglas conflictivas | Validación de reglas, orden de ejecución |
| SaaS Foundation | Downtime en migración | Blue-green deployment, rollback plan |

---

## Success Criteria

1. **Unified Media Engine**: 100% migración V2, 0% errores upload
2. **Fleet/Tools Layer**: 80% activos certificados, alertas <24h
3. **Digital Twin**: 90% órdenes con timeline, <3s carga
4. **AI Copilot**: 70% consultas correctas, <5s respuesta, 0% PII leaks
5. **Automation Rules**: 50% avances automáticos, 80% reducción acciones
6. **SaaS Foundation**: 10+ tenants, 99.9% aislamiento

---

## Next Steps

1. **Inmediato**: Comenzar T10 (Unified Media Engine design)
2. **Esta semana**: Validar priorización con stakeholders
3. **Próximo sprint**: T10-T11 (design + contract)
4. **Siguiente sprint**: T12-T13 (backend implementation)
