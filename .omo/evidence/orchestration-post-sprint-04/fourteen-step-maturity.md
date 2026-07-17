# 14-Step Flow Maturity — Post-Sprint 4

---

## Maturity by Step

| # | Paso | Entidad | Contrato | Modelo DB | Endpoint | Página | Acción | Tests | Madurez | Gap | Siguiente acción |
|---|------|---------|----------|-----------|----------|--------|--------|-------|---------|-----|-----------------|
| 1 | Solicitud formal | WorkRequest | ✅ | ✅ | ✅ | ✅ | CRUD | ✅ | 4.5 | Sin wizard multi-canal | Mejorar canal solicitud |
| 2 | Visita técnica | SiteVisit | ✅ | ✅ | ✅ | ✅ | CRUD+mediciones | ✅ | 4.3 | Mediciones básicas | Extender hallazgos estructurados |
| 3 | Propuesta | Proposal | ✅ | ✅ | ✅ | ✅ | CRUD+aprobación | ✅ | 4.5 | Sin versionado visual | Agregar timeline versiones |
| 4 | PO | PurchaseOrder | ✅ | ✅ | ✅ | ✅ | CRUD+aprobación | ✅ | 4.3 | Sin comparación propuesta | Agregar comparación |
| 5 | Planeación | PlanningPacket | ✅ | ✅ | ✅ | ✅ | Readiness+aprobación | ✅ | 3.8 | Sin wizard completo | Construir wizard 10 secciones |
| 6 | Ejecución | ExecutionSession | ✅ | ✅ | ✅ | ✅ | Sesión campo | ✅ | 4.0 | Offline no probado E2E | Probar flujo offline completo |
| 7 | Evidencias | Evidence | ✅ | ✅ | ✅ | ✅ | Galería+upload | ✅ | 3.5 | Sin metadatos profesionales | Agregar geolocalización, hash |
| 8 | Informe técnico | TechnicalReport | ✅ | ✅ | ✅ | ✅ | CRUD+PDF | ✅ | 3.5 | Sin generación automática | Generar PDF post-ejecución |
| 9 | Acta entrega | DeliveryRecord | ✅ | ✅ | ✅ | ✅ | CRUD+firma | ✅ | 3.5 | Sin wizard profesional | Mejorar wizard acta |
| 10 | Firma cliente | ClientSignature | ✅ | ✅ | ✅ | ✅ | Firma digital | ✅ | 3.8 | Offline no probado | Probar firma offline |
| 11 | SES | ServiceEntrySheet | ✅ | ✅ | ✅ | ✅ | CRUD+aprobación | ✅ | 4.0 | Sin timeline visual | Agregar timeline SES→Factura→Pago |
| 12 | Factura | Invoice | ✅ | ✅ | ✅ | ✅ | CRUD+aprobación | ✅ | 4.0 | Sin alertas vencimiento | Agregar alertas 30/60/90 días |
| 13 | Aprobación factura | InvoiceApproval | ✅ | ✅ | ✅ | ✅ | Aprobación RBAC | ✅ | 4.0 | Sin dashboard cobranza | Dashboard cuentas por cobrar |
| 14 | Pago/cierre | Payment | ✅ | ✅ | ✅ | ✅ | CRUD+conciliación | ✅ | 4.0 | Sin cierre automático | Cierre admin automático |

## Summary
- **Pasos maduros (4.0+):** 10 (pasos 1-4, 6, 11-14)
- **Pasos parciales (3.0-3.9):** 4 (pasos 5, 7, 8, 9, 10)
- **Pasos bloqueados:** 0
- **Mayor gap:** Paso 5 (Planning) — schema rico pero UI pobre. Paso 7 (Evidencias) — falta galería profesional.
