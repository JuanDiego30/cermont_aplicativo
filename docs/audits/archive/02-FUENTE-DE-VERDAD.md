# FUENTE DE VERDAD — CERMONT S.A.S.
## Jerarquía Canónica para Auditoría

---

## JERARQUÍA DE VERDAD (Orden de precedencia)

```
1. FLUJO REAL DE CERMONT: 14 pasos operativos
2. FALLAS REALES: planeación, ejecución, informes/actas, facturación, costos
3. CONTRATOS COMPARTIDOS: packages/shared-types + packages/domain
4. BACKEND REAL: modelos, servicios, compuertas, endpoints
5. FRONTEND REAL: páginas, hooks, formularios, navegación
6. PRUEBAS FUNCIONALES: Vitest, curl, Playwright
7. GATES TÉCNICOS: typecheck, lint, build, test, verify
8. DOCUMENTACIÓN: docs canónicos, ADRs
```

Si una pantalla, endpoint o botón no ayuda a avanzar una OT por los 14 pasos
o no resuelve una falla real de CERMONT → **LEGACY / SECUNDARIO**

---

## MAPA DE ENTIDADES Y ARTEFACTOS

### Entidades Principales

| Entidad | Modelo Mongoose | Schema Zod | Propósito en Flujo |
|---------|----------------|------------|-------------------|
| `WorkRequest` | ✅ WorkRequest.ts | ✅ shared-types/schemas | Paso 1 — Solicitud inicial |
| `SiteVisit` | ✅ SiteVisit.ts | ✅ | Paso 2 — Visita técnica |
| `Proposal` | ✅ Proposal.ts | ✅ | Paso 3 — Propuesta económica |
| `PurchaseOrder` | ✅ PurchaseOrder.ts | ✅ | Paso 4 — OC aprobada |
| `PlanningPacket` | ✅ PlanningPacket.ts | ✅ | Paso 5 — Planeación |
| `ExecutionSession` | ✅ ExecutionSession.ts | ✅ | Paso 6 — Ejecución en campo |
| `TechnicalReport` | ✅ TechnicalReport.ts | ✅ | Paso 7 — Informe técnico |
| `DeliveryRecord` | ✅ DeliveryRecord.ts | ✅ | Pasos 8-9 — Acta + firma |
| `ServiceEntrySheet` | ✅ ServiceEntrySheet.ts | ✅ | Pasos 10-11 — SES/Ariba |
| `Invoice` | ✅ Invoice.ts | ✅ | Pasos 12-13 — Factura |
| `Payment` | ✅ Payment.ts | ✅ | Paso 14 — Pago y cierre |
| `ServiceCase` | ✅ ServiceCase.ts | ✅ | Orquestador central (hub) |
| `Order` | ✅ Order.ts | ✅ | OT de trabajo |
| `Cost` | ✅ Cost.ts | ✅ | Control de costos |
| `Document` | ✅ Document.ts | ✅ | Gestión documental |
| `Evidence` | ✅ Evidence.ts | ✅ | Evidencias fotográficas |
| `User` | ✅ User.ts | ✅ | Usuarios y autenticación |
| `AuditLog` | ✅ AuditLog.ts | ✅ | Trazabilidad de acciones |
| `Kit` | ✅ Kit.ts | ✅ | Kits de recursos típicos |
| `Checklist` | ✅ Checklist.ts | ✅ | Listas de verificación |
| `DocumentTemplate` | ✅ DocumentTemplate.ts | ✅ | Plantillas de documentos |
| `TemplateDraft` | ✅ TemplateDraft.ts | ✅ | Borradores de formularios |
| `TemplateResponse` | ✅ TemplateResponse.ts | ✅ | Respuestas a formularios |
| `CostControl` | ✅ CostControl.ts | ✅ | Control detallado de costos |
| `Asset` | ✅ Asset.ts | ✅ | Activos/equipos |
| `Resource` | ✅ Resource.ts | ✅ | Recursos humanos/materiales |
| `Tool` | ✅ Tool.ts | ✅ | Herramientas |
| `Inspection` | ✅ Inspection.ts | ✅ | Inspecciones HSE |
| `Report` | ✅ Report.ts | ✅ | Reportes generales |

**Total modelos: 37** — Todos los entidades críticas del flujo existen.

---

## FLUJO DE ESTADO DEL CASO (ServiceCase)

```
intake → assessment → proposal → authorization → planning → in_execution
      → technical_closure → administrative_closure → ses_pending 
      → billing_pending → receivable_open → paid
```

### Mapeo Step Code → Stage

| Step Code | Stage | 
|-----------|-------|
| step_01_work_request | intake |
| step_02_site_visit | assessment |
| step_03_proposal | proposal |
| step_04_purchase_order | authorization |
| step_05_planning | planning |
| step_06_execution | in_execution |
| step_07_technical_report | technical_closure |
| step_08_delivery_record | administrative_closure |
| step_09_client_signature | administrative_closure |
| step_10_ses_submission | ses_pending |
| step_11_ses_approval | billing_pending |
| step_12_invoice_submission | receivable_open |
| step_13_invoice_approval | receivable_open |
| step_14_payment_closure | paid |

---

## ROLES RBAC (de packages/domain)

| Código | Nombre | Nivel | 
|--------|--------|-------|
| GER | Gerente | Omnipotente — acceso completo |
| RES | Residente | Operativo Senior — crear OT, ejecutar, evidencias |
| HES | Salud y Seguridad | Auditoría preventiva — lectura + reportes |
| SUP | Supervisor | Coordinación táctica — asignar, evaluar |
| ADM | Administrativo | Custodia financiera — costos, SES, factura |
| OPE | Operador | Transacciones limitadas — ver asignadas, evidencias |
| TEC | Técnico | Restricción lectura — ver asignadas, actualizar estados |
| CLI | Cliente | Lectura propia — ver sus órdenes |

---

## CONTRATOS COMPARTIDOS (packages/shared-types)

### Estructura

```
packages/shared-types/src/
├── api/          → Schemas de request/response por endpoint
├── config/       → Configuración compartida
├── constants/    → Constantes de dominio
├── errors/       → Tipos de error
├── rbac/         → Tipos de roles y permisos
├── schemas/      → Zod schemas por entidad
├── utils/        → Utilidades de tipos
└── workflow/     → Tipos de flujo operativo (14 pasos, blockers)
```

### Contratos de Workflow (críticos)

```typescript
// DomainBlocker — define qué bloquea el avance de un paso
type DomainBlocker = {
  artifactType: string;
  code: string;
  field?: string;
  message: string;
  ownerRole: string;
  recommendedAction: string;
  severity: "blocking" | "warning";
}

// CermontOperationalStepCode — los 14 pasos como literal union
type CermontOperationalStepCode = 
  | "step_01_work_request" | "step_02_site_visit" | ...

// CERMONT_OPERATIONAL_STEPS — definición de los 14 pasos
const CERMONT_OPERATIONAL_STEPS = [...]
```

---

## SERVICIOS CORE DE ORQUESTACIÓN

| Servicio | Propósito |
|---------|----------|
| `cermont-workflow-gate.service.ts` | **Motor de compuertas** — calcula blockers reales para cada paso |
| `administrative-workflow.service.ts` | Flujo administrativo — SES, acta, firma, factura, pago |
| `execution-session.service.ts` | Gestión de sesión de ejecución en campo |
| `service-case.service.ts` | Orquestador central del caso |
| `order-state.service.ts` | Transiciones de estado de OT |
| `cost.service.ts` | Control de costos estimados vs reales |

---

## FUENTES NO CONFIABLES (ignorar en discrepancia)

- Archivos `*.log` en raíz del monorepo
- Archivos `*-output.txt`, `*-baseline.txt` en raíz
- Scripts ad-hoc: `fix.js`, `add-route.js`, `addwr.js`
- Versiones anteriores de auditorías en `docs/audits/` (anteriores a 2026-05-23)
- Cualquier hardcode o mock en tests que no refleje el dominio real

---

*Siguiente: [03-MATRIZ-14-PASOS.md](./03-MATRIZ-14-PASOS.md)*
