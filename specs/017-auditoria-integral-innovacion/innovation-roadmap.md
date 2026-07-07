# Innovation Roadmap — CERMONT S.A.S.

**Fecha:** 2026-07-05
**Spec:** 017 — Auditoría Integral, Investigación y Plan de Innovación
**Propósito:** Roadmap priorizado de iniciativas, reconciliado contra lo que YA existe (no proponer de nuevo lo implementado).

---

## 0. Lo que YA existe (no repetir)

Antes de priorizar, se confirma que CERMONT ya tiene implementado:
- ✅ 456 endpoints backend reales en 56 módulos
- ✅ 95 rutas frontend con TanStack Query + Zustand + react-hook-form
- ✅ RBAC con 8 roles + matriz de permisos
- ✅ PWA/Offline con Serwist + IndexedDB + cola de sync
- ✅ Contratos Zod compartidos (packages/shared-types)
- ✅ Audit logging inmutable
- ✅ FullCalendar + react-dnd (scheduling + kanban)
- ✅ Recharts (dashboards), Framer Motion (animaciones)
- ✅ Cost intelligence (baseline vs actual KPIs)
- ✅ Service Cases Cockpit (14 pasos)
- ✅ Passkeys (WebAuthn)
- ✅ Facturación electrónica DIAN
- ✅ Evidence upload con GPS + offline
- ✅ Portal cliente
- ✅ Planning packet con readiness checks

---

## 1. Iniciativas Priorizadas

### P0 — Completar módulos del flujo documental (Pasos 8-14)

| # | Iniciativa | Módulo | Justificación | Complejidad | Dependencias |
|---|-----------|--------|---------------|-------------|--------------|
| P0-1 | Implementar controller/service para delivery-record (Acta de Entrega + Firma Cliente) | delivery-record | Paso 9-10 del flujo: módulo existe con routes pero sin lógica de negocio. Requisito BR-02. Referencia: react-esign (firma digital) | M (3-4 semanas) | Schemas Zod en shared-types |
| P0-2 | Implementar controller/service para technical-report (Informe Técnico) | technical-report | Paso 8 del flujo: solo routes. Requisito BR-01 | M (2-3 semanas) | Schemas Zod |
| P0-3 | Implementar controller/service para service-entry-sheet (SES/Ariba) | service-entry-sheet | Paso 11 del flujo: solo routes. Requisito BR-03 | M (3-4 semanas) | Schemas Zod |
| P0-4 | Implementar controller/service para invoice (Facturación + Aprobación) | invoice | Pasos 12-13 del flujo: solo routes. Requisito BR-04. Referencia: Jobber invoicing | M (3-4 semanas) | SES completado (P0-3) |
| P0-5 | Implementar controller/service para payment (Pago) | payment | Paso 14 del flujo: solo routes. Requisito BR-05 | B (2 semanas) | Invoice completado (P0-4) |
| P0-6 | Implementar módulo kpi (Dashboard KPIs operativos) | kpi | Módulo vacío. Dashboard de KPIs en tiempo real. Requisito BR-06. Referencia: ServiceTitan KPI, Recharts (ya en uso) | M (3-4 semanas) | Definir KPIs de negocio |
| P0-7 | Implementar módulo media (Gestión de medios) | media | Módulo vacío. Fotos, videos, documentos. Requisito BR-07. Referencia: evidence module ya existe — migrar o extender | M (3-4 semanas) | Análisis si es nuevo o extensión de evidence |

### P1 — Fortalecer módulos existentes

| # | Iniciativa | Módulo | Justificación | Complejidad | Dependencias |
|---|-----------|--------|---------------|-------------|--------------|
| P1-1 | Completar service de observability (health checks, métricas) | observability | Controller + routes existen, service faltante. Requisito BR-08. Referencia: DataDog, Sentry | B (1 semana) | — |
| P1-2 | Corregir test fallido checklist-file-upload | checklists | Test `serializa el item de checklist en metadata del FileAsset` falla porque `FormData.get("metadata")` retorna null | B (1-2 días) | Diagnóstico preciso |
| P1-3 | Agregar firma digital a delivery-record | delivery-record | Paso 10 requiere firma cliente. Referencia: react-esign (signature pad component, zero-dependency) | B (1 semana) | P0-1 |
| P1-4 | Agregar QR scanning para assets/equipos | inventory, asset | Asociar QR tags a assets para escaneo en campo. Referencia: Fiix QR scanning, zxing library | M (2 semanas) | Módulo asset completo |
| P1-5 | Fortalecer offline-first para evidence en campo | evidence, PWA | Offline capture + queue + sync ya existe pero requiere robustez. Referencia: UpKeep offline mode | M (3-4 semanas) | — |
| P1-6 | Implementar rule engine para workflow de 14 pasos | workflow | Motor SI-ENTONCES para transiciones de estado, SLA management, validaciones condicionales. Referencia: json-rules-engine (TypeScript) | M (3-4 semanas) | Análisis de reglas de negocio |

### P2 — Mejoras de calidad y experiencia

| # | Iniciativa | Módulo | Justificación | Complejidad | Dependencias |
|---|-----------|--------|---------------|-------------|--------------|
| P2-1 | Agregar tests a módulos críticos (auth, orders, evidence, work-requests) | global | ~38 módulos sin tests. Riesgo de regresiones. Referencia: Vitest + Playwright (ya en uso) | H (3-4 meses) | — |
| P2-2 | Regenerar API_ENDPOINT_MATRIX.md para reflejar 456 endpoints reales | docs | Documentación desactualizada (100 vs 456). Discrepancia crítica H4 | M (1-2 semanas) | Script de generación automática |
| P2-3 | Implementar QuickBooks/integraciones contables | invoices | Sincronización facturas con sistema contable. Referencia: Jobber QuickBooks integration | M (3-4 semanas) | P0-4 |
| P2-4 | Mejorar portal cliente con notificaciones en tiempo real | portal-cliente | WebSocket para actualizaciones en vivo. Referencia: ServiceTitan customer portal | M (3-4 semanas) | — |
| P2-5 | Implementar asset lifecycle tracking completo | asset | Desde procurement hasta decommission. Referencia: IBM Maximo asset lifecycle | H (2-3 meses) | — |
| P2-6 | Agregar predicción de mantenimiento básico (time-based) | maintenance | PM scheduling con alertas predictivas. Referencia: eMaint predictive maintenance | M (3-4 semanas) | — |
| P2-7 | Dashboard drag-to-reorder widgets | dashboard | Personalización de dashboard por rol. Referencia: KaranChandekar dashboard, Tremor | M (2-3 semanas) | — |

### P3 — Innovación y exploración

| # | Iniciativa | Módulo | Justificación | Complejidad | Dependencias |
|---|-----------|--------|---------------|-------------|--------------|
| P3-1 | AI agent para creación de work orders por foto/voz | ai | Foto de equipo dañado → WO automático. Referencia: Salesforce Agentforce, OxMaint AI Copilot, Fexa AI | H (3-4 meses) | Módulo ai existente (parcial) |
| P3-2 | Dispatch optimization con routing inteligente | dispatch | Asignación óptima de técnicos por skills/ubicación/carga. Referencia: sys-ae/fieldopt, ServiceTitan dispatch | H (2-3 meses) | Módulo dispatch completo |
| P3-3 | Gemelo digital de assets | asset | Réplica digital con datos IoT. Referencia: IBM Maximo Digital Twin | H (4-6 meses) | Asset completo + IoT |
| P3-4 | Multi-tenancy SaaS | global | Separación datos por cliente. Requerido para modelo SaaS multi-cliente | H (3-4 meses) | Infraestructura |
| P3-5 | Gantt scheduling avanzado con conflict detection | dispatch | Timeline Gantt con detección de conflictos. Referencia: solvice/scheduler-plugin, WorksCalendar | M (3-4 semanas) | — |

---

## 2. Roadmap Temporal

### Sprint Inmediato (Semanas 1-2)
| Item | Prioridad |
|------|-----------|
| P1-2: Corregir test checklist-file-upload | P1 |
| P1-1: Completar service observability | P1 |
| P0-6: Iniciar análisis módulo kpi | P0 |

### Sprint 1 (Semanas 3-6)
| Item | Prioridad |
|------|-----------|
| P0-1: delivery-record controller/service | P0 |
| P0-2: technical-report controller/service | P0 |
| P0-5: payment controller/service | P0 |
| P1-3: Firma digital (react-esign) | P1 |

### Sprint 2 (Semanas 7-10)
| Item | Prioridad |
|------|-----------|
| P0-3: service-entry-sheet controller/service | P0 |
| P0-4: invoice controller/service | P0 |
| P0-7: Módulo media | P0 |
| P1-4: QR scanning | P1 |

### Sprint 3 (Semanas 11-16)
| Item | Prioridad |
|------|-----------|
| P2-1: Tests masivos (~38 módulos) | P2 |
| P2-2: Regenerar API_ENDPOINT_MATRIX | P2 |
| P1-5: Fortalecer offline-first | P1 |
| P1-6: Rule engine | P1 |

### Sprint 4+ (Semanas 17+)
| Item | Prioridad |
|------|-----------|
| P2-3 a P2-7: Mejoras calidad | P2 |
| P3-1 a P3-5: Innovación | P3 |

---

## 3. No Repetir (lecciones de specs anteriores)

Basado en Spec-010, 012, 013, 016 y verificación de Fase 1:

| Lo que specs anteriores proponían | Estado real | Acción |
|----------------------------------|-------------|--------|
| Implementar RBAC desde paquete domain | ✅ YA implementado | No repetir |
| Implementar PWA/offline | ✅ YA implementado (Serwist + IndexedDB) | No repetir |
| Implementar cost intelligence | ✅ YA implementado (Spec-016) | No repetir |
| Implementar cockpit 14 pasos | ✅ YA implementado | No repetir |
| Implementar planning packet readiness | ✅ YA implementado | No repetir |
| Implementar evidence con GPS | ✅ YA implementado | No repetir |
| Implementar passkeys/WebAuthn | ✅ YA implementado | No repetir |
| Contratos Zod compartidos | ✅ YA implementado | No repetir |
| Implementar audit logging | ✅ YA implementado | No repetir |
| Portal cliente | ✅ YA implementado | No repetir |
| Facturación DIAN | ✅ YA implementado | No repetir |
| Tests E2E Playwright | ✅ YA existen | Expandir cobertura, no crear desde cero |

---

## 4. Matriz de Esfuerzo vs Impacto

```
Impacto
  ▲
  │ P0-1 a P0-7  │  P2-1 (tests)
  │ (completar    │
H │ flujo 8-14)   │
  │               │
  │ P1-3 (firma)  │  P3-1 (AI agent)
  │ P1-4 (QR)     │  P3-2 (dispatch)
M │ P1-6 (rules)  │  P3-3 (digital twin)
  │               │
  │ P1-1 (observ) │  P2-3 a P2-7
  │ P1-2 (fix test)│  P3-4 (multi-tenant)
B │               │
  └───────┬───────┴───────┬───────
          B               M               H
                    Esfuerzo
```

**Conclusión:** Priorizar P0-1 a P0-7 (completar flujo documental 8-14) que tienen alto impacto con esfuerzo medio, antes de abordar innovaciones de alto esfuerzo como AI/multi-tenancy.
