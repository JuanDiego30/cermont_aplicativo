# Flow 14 Steps — Canonical Report

**Fecha:** 2026-06-29  
**Baseline:** business-flow-map.md + LTG §1.2 + código actual

---

## Canonical Flow Definition

| Código | Paso | Entidad Principal | Documento Requerido | Transición Siguiente | RBAC |
|--------|------|-------------------|---------------------|---------------------|------|
| STEP_01 | Solicitud del cliente | WorkRequest | Formulario solicitud | STEP_02 o STEP_03 | Cliente/Admin |
| STEP_02 | Visita técnica | SiteVisit | Reporte visita, fotos | STEP_03 | Supervisor/Técnico |
| STEP_03 | Propuesta económica | Proposal | PDF propuesta, términos | STEP_04 | Admin/Gerente |
| STEP_04 | Aprobación con PO | PurchaseOrder | PO cliente | STEP_05 | Cliente/Admin |
| STEP_05 | Planeación | PlanningPacket | Plan trabajo, checklist | STEP_06 | Admin/Supervisor |
| STEP_06 | Ejecución con evidencias | ExecutionSession | Fotos, checklists | STEP_07 | Supervisor/Técnico |
| STEP_07 | Informe técnico | TechnicalReport | PDF informe, anexos | STEP_08 | Admin/Gerente |
| STEP_08 | Acta de entrega | DeliveryRecord | PDF acta | STEP_09 | Admin/Supervisor |
| STEP_09 | Firma del cliente | ClientSignature | Firma digital | STEP_10 | Cliente |
| STEP_10 | SES / Ariba | ServiceEntrySheet | PDF SES | STEP_11 | Admin |
| STEP_11 | Aprobación SES | SES (subestado) | PDF SES aprobada | STEP_12 | Cliente/Admin |
| STEP_12 | Factura | Invoice | PDF factura | STEP_13 | Admin |
| STEP_13 | Aprobación factura | Invoice (subestado) | Email aprobación | STEP_14 | Cliente/Admin |
| STEP_14 | Pago | Payment | Comprobante pago | — | Admin |

**Nota de re-indexación vs código actual:**
- Evidencias NO es paso separado; es parte del paso 6 (Ejecución)
- TechnicalReport = paso 7 (NO paso 8 como indica LTG)
- El código en operational-steps.ts requiere actualización para incluir STEP_07-TECHNICAL_REPORT como paso 7

**Códigos estables (no cambiar por reordenamiento futuro):**
"""STEP_01_WORK_REQUEST""", """STEP_02_SITE_VISIT""", etc.
