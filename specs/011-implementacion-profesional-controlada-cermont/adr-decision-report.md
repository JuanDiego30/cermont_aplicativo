# ADR Decision Report — Wave 1

**Fecha:** 2026-06-29  
**Estado:** DECISIÓN TOMADA (basada en Spec 010 análisis + Spec 011 ejecución)

---

## ADR-011: Flujo canónico de 14 pasos

**Decisión:** LTG (tesis de 203 páginas §1.2) + docs/domain/CERMONT_BUSINESS_FLOW_MAP.md como fuente canónica.

### Comparación de fuentes

| Paso | Business Flow Map | LTG/Blueprint | Código actual | Decisión |
|------|-------------------|--------------|---------------|----------|
| 1 | Solicitud del cliente | Solicitud del cliente | WorkRequest | ✅ Coincide |
| 2 | Visita técnica | Visita técnica | SiteVisit | ✅ Coincide |
| 3 | Propuesta económica | Propuesta económica | Proposal | ✅ Coincide |
| 4 | Aprobación con PO | Aprobación con PO | PurchaseOrder | ✅ Coincide |
| 5 | Planeación | Planeación | PlanningPacket | ✅ Coincide |
| 6 | Ejecución (con evidencias) | Ejecución en campo | ExecutionSession | ✅ Coincide |
| 7 | Informe técnico | Informe técnico | TechnicalReport | ✅ 7=Evidencias según LTG |
| 8 | Acta de entrega | Acta de entrega | DeliveryRecord | ✅ Coincide |
| 9 | Firma del cliente | Firma del cliente | ClientSignature | ✅ Coincide |
| 10 | SES / Ariba | SES / Ariba | ServiceEntrySheet | ✅ Coincide |
| 11 | Aprobación SES | Aprobación SES | SESApproval (subestado) | ✅ SES approval es subestado del 11 |
| 12 | Factura | Factura | Invoice | ✅ Coincide |
| 13 | Aprobación de factura | Aprobación de factura | InvoiceApproval | ✅ Coincide |
| 14 | Pago | Pago | Payment | ✅ Coincide |

**Conflicto identificado:** El código actual en operational-steps.ts define 13 pasos (no 14) y omite Evidencias como paso separado.

**Decisión:** 
- Códigos estables: STEP_01 a STEP_14
- Evidencias es paso 7, TechnicalReport es paso 8 (reindex)
- SES Approval es subestado de ServiceEntrySheet (no paso aparte visual)
- El flujo debe tener exactamente 14 pasos con códigos estables y compatibilidad hacia atrás
- Characterization tests antes de migrar datos persistidos

---

## ADR-012: Alineación visual con DESIGN.md

**Decisión:** DESIGN.md + CERMONT_UIUX_GUIDE.md como SSOT visual.

### Problemas detectados

1. Tokens CSS inexistentes referenciados en componentes
2. Colores hardcodeados en múltiples componentes
3. Componentes locales duplicados (Card, Dialog, Table locales)
4. Overlays inaccesibles (sin focus trap, sin aria)
5. 355 hits de colores hardcodeados detectados en Spec 010

**Decisión:**
- DESIGN.md es SSOT visual
- Todo componente nuevo debe usar tokens existentes
- No crear nuevo sistema de diseño
- Migrar colores hardcodeados gradualmente, por módulo

---

## ADR-014: Consent Gateway

**Decisión:** ConsentGate en dashboard layout con consentimiento versionado en servidor.

### Arquitectura

1. Backend: endpoint /api/privacy/consents para crear/revocar/verificar consentimiento versionado
2. Frontend: ConsentGate component en dashboard layout
3. NO bloquea: login, logout, privacy policy, privacy notice, support
4. Almacenamiento: servidor como SSOT, localStorage como cache
5. Versión de política actual: v1

**Decisión:**
- ConsentGate en dashboard layout wrapper
- Registra consentimiento versionado (purpose + version + timestamp)
- No afirma cumplimiento legal definitivo
- Revocable desde perfil del usuario
