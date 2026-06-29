# ADR-011: Flujo Canónico de 14 Pasos

**Estado:** Aceptado
**Fecha:** 2026-06-29
**Driver:** Especificación de Ingeniería (DOC-CANON-05) + Mapa de Negocio (CERMONT_BUSINESS_FLOW_MAP.md)
**Reemplaza:** ADR-003 (ampliado)

---

## Contexto

El sistema Cermont tiene 3 fuentes que describen el flujo operacional de 14 pasos, con diferencias de nomenclatura y granularidad. Esta ADR resuelve las discrepancias y define el flujo canónico.

### Fuentes comparadas

| Fuente | Ruta | Propósito | Prioridad |
|--------|------|-----------|-----------|
| **LTG (DOC-CANON-05)** | `docs/Intrucciones_para_crear_app_web/DOC-CANON-05-Flujo-Operacional-14-Pasos.md` | Especificación original de ingeniería | 1 (máxima) |
| **Business Flow Map** | `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` | Mapa de negocio actual | 2 |
| **State Machine actual** | `packages/domain/src/workflow/service-case-state-machine.ts` | Implementación actual | 3 (debe adaptarse) |
| **Operational Steps** | `packages/domain/src/operational-steps.ts` | Implementación actual organizada | 2 |

---

## Comparación de Etapas

### DOC-CANON-05 (LTG)

| # | Stage | Entidad |
|---|-------|---------|
| — | `intake` | WorkRequest recibida |
| — | `qualification` | En calificación/visita |
| — | `proposal` | Propuesta pendiente |
| — | `approval` | Esperando PO |
| — | `planning` | En planeación |
| — | `ready_to_execute` | Listo para ejecutar |
| — | `execution` | En ejecución |
| — | `evidence_collection` | Recolectando evidencias |
| — | `technical_closure` | Cierre técnico (informe) |
| — | `delivery` | Entrega (acta) |
| — | `ses` | SES/Ariba |
| — | `invoicing` | Facturación |
| — | `payment` | Pago |
| — | `closed` | Cerrado |
| — | `cancelled` | Cancelado |

Nota: DOC-CANON-05 usa **15 estados derivados** (no 14 pasos secuenciales). La entidad orquestadora `ServiceCase` calcula `stage` desde entidades hijas.

### Business Flow Map

| # | Paso | Entidad |
|---|------|---------|
| 1 | Solicitud del cliente | WorkRequest |
| 2 | Visita técnica | SiteVisit |
| 3 | Propuesta económica | Proposal |
| 4 | Aprobación con PO | PurchaseOrder |
| 5 | Planeación | PlanningPacket |
| 6 | Ejecución (con evidencias) | ExecutionSession |
| 7 | Informe técnico | TechnicalReport |
| 8 | Acta de entrega | DeliveryRecord |
| 9 | Firma del cliente | ClientSignature |
| 10 | SES / Ariba | ServiceEntrySheet |
| 11 | Aprobación SES | ServiceEntrySheet (approval) |
| 12 | Factura | Invoice |
| 13 | Aprobación de factura | InvoiceApproval |
| 14 | Pago | Payment |

### Operational Steps (code) — ADOPTADO como canónico

| # | key | canonicalCode | Entidad |
|---|------|---------------|---------|
| 1 | `work_request` | `STEP_01_WORK_REQUEST` | WorkRequest |
| 2 | `site_visit` | `STEP_02_SITE_VISIT` | SiteVisit |
| 3 | `proposal` | `STEP_03_PROPOSAL` | Proposal |
| 4 | `purchase_order` | `STEP_04_PURCHASE_ORDER` | PurchaseOrder |
| 5 | `planning` | `STEP_05_PLANNING` | PlanningPacket |
| 6 | `execution` | `STEP_06_EXECUTION` | ExecutionSession |
| 7 | `technical_report` | `STEP_07_TECHNICAL_REPORT` | TechnicalReport |
| 8 | `delivery_record` | `STEP_08_DELIVERY_RECORD` | DeliveryRecord |
| 9 | `client_signature` | `STEP_09_CLIENT_SIGNATURE` | ClientSignature |
| 10 | `ses` | `STEP_10_SES` | ServiceEntrySheet |
| 11 | `invoice` | `STEP_11_INVOICE` | Invoice |
| 12 | `invoice_approval` | `STEP_12_INVOICE_APPROVAL` | InvoiceApproval |
| 13 | `payment` | `STEP_13_PAYMENT` | Payment |
| 14 | `closure` | `STEP_14_CLOSURE` | ServiceCase |

---

## Conflictos Detectados y Resolución

### Conflicto 1: SES como 1 o 2 pasos

| Fuente | Pasos |
|--------|-------|
| Business Flow Map | SES (10) + Aprobación SES (11) = 2 |
| Operational Steps | `ses` (10) = 1 paso |
| **Resolución** | **1 paso — `ses`** es suficiente. El approval es un sub-estado de `ses`, no un paso independiente. La entidad `ServiceEntrySheet` maneja ambos estados internamente. |

### Conflicto 2: Closure como paso 14

| Fuente | Paso 14 |
|--------|---------|
| Business Flow Map | Payment (sin closure explícito) |
| Operational Steps | `closure` (cierre administrativo) |
| DOC-CANON-05 | `closed` como stage final derivado de `paymentId` |
| **Resolución** | **14 pasos incluyendo `closure`**. El cierre administrativo es un paso real que incluye: verificación de documentación completa, conciliación de pagos, auditoría final, y cierre formal del ServiceCase. |

### Conflicto 3: DOC-CANON-05 tiene ready_to_execute + evidence_collection separados

| Fuente | Pasos extra |
|--------|-------------|
| DOC-CANON-05 | `ready_to_execute` (entre planning y execution) + `evidence_collection` (entre execution y technical_closure) |
| Operational Steps | No tiene estos pasos separados |
| **Resolución** | No se agregan como pasos independientes. `ready_to_execute` es un **bloqueador calculado** dentro del paso `planning`. `evidence_collection` es parte del paso `execution`. |

### Conflicto 4: DOC-CANON-05 usa `qualification` en vez de `site_visit`

| Fuente | Nombre |
|--------|--------|
| DOC-CANON-05 | `qualification` (etapa derivada que incluye visita) |
| Operational Steps | `site_visit` (paso explícito) |
| **Resolución** | Se mantiene `site_visit` como paso independiente. La "calificación" es un sub-estado del WorkRequest, no un paso separado. |

---

## Decisión Canónica

**El flujo oficial de 14 pasos es el definido en `packages/domain/src/operational-steps.ts` con `canonicalCode`.**

| Paso | Código | Transición SM | Descripción |
|------|--------|---------------|-------------|
| 1 | `STEP_01_WORK_REQUEST` | `WORK_REQUEST_CREATED` | Solicitud del cliente |
| 2 | `STEP_02_SITE_VISIT` | `SITE_VISIT_COMPLETED` | Visita técnica |
| 3 | `STEP_03_PROPOSAL` | `PROPOSAL_APPROVED` | Propuesta económica |
| 4 | `STEP_04_PURCHASE_ORDER` | `PURCHASE_ORDER_APPROVED` | Aprobación con PO |
| 5 | `STEP_05_PLANNING` | `PLANNING_APPROVED` | Planeación de obra |
| 6 | `STEP_06_EXECUTION` | `EXECUTION_COMPLETED` | Ejecución en campo |
| 7 | `STEP_07_TECHNICAL_REPORT` | `TECHNICAL_REPORT_APPROVED` | Informe técnico |
| 8 | `STEP_08_DELIVERY_RECORD` | `DELIVERY_RECORD_GENERATED` | Acta de entrega |
| 9 | `STEP_09_CLIENT_SIGNATURE` | `CLIENT_SIGNATURE_REGISTERED` | Firma del cliente |
| 10 | `STEP_10_SES` | `SES_APPROVED` | SES / Ariba |
| 11 | `STEP_11_INVOICE` | `INVOICE_CREATED` | Factura |
| 12 | `STEP_12_INVOICE_APPROVAL` | `INVOICE_APPROVED` | Aprobación de factura |
| 13 | `STEP_13_PAYMENT` | `PAYMENT_REGISTERED` | Pago |
| 14 | `STEP_14_CLOSURE` | `CASE_CLOSED` | Cierre administrativo |

### Reglas de Transición

1. **Progresión lineal obligatoria**: Cada paso requiere que el anterior esté `completed` antes de pasar al siguiente.
2. **Sin saltos**: No se puede saltar un paso (ej: de proposal directo a planning sin PO).
3. **Bloqueadores calculados**: Cada paso tiene precondiciones que generan `blockers` si no se cumplen.
4. **Estados permitidos por paso**: `pending → available → in_progress → completed | blocked`.
5. **Rollback**: Solo se permite retroceder un paso mediante acción administrativa con auditoría.

---

## Afectados

| Componente | Acción requerida | Estado |
|------------|-----------------|--------|
| `packages/domain/src/operational-steps.ts` | Ya actualizado con `canonicalCode` | ✅ |
| `packages/domain/src/index.ts` | Exportar `CANONICAL_CODES` | ✅ |
| `packages/domain/src/workflow/service-case-state-machine.ts` | Agregar `closed` a estados si no existe | ✅ |
| `packages/shared-types/src/schemas/` | Contrato de step guardado | ✅ |
| `backend/src/modules/*/` | Validaciones de paso | Pendiente |
| `frontend/src/modules/*/` | UI de bloqueadores | Pendiente |
| `docs/` | Sincronizar documentación | Pendiente |

---

## Consecuencias

Positivas:
- SSOT único para los 14 pasos
- Códigos canónicos (`STEP_01_WORK_REQUEST` etc.) permiten referencias estables
- Comparabilidad entre frontend, backend y documentación

Negativas:
- DOC-CANON-05 y Business Flow Map quedan como material de referencia no vinculante para implementación
- Cualquier cambio en los pasos requiere actualizar `operational-steps.ts`, state machine, y contratos

---

## Referencias

- ADR-003 (sustituido parcialmente)
- `packages/domain/src/operational-steps.ts`
- `packages/domain/src/workflow/service-case-state-machine.ts`
- `packages/domain/src/workflow/step-requirements.ts`
- `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`
- `docs/Intrucciones_para_crear_app_web/DOC-CANON-05-Flujo-Operacional-14-Pasos.md`
