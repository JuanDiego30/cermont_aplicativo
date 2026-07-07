
> ## ⚠️ NOTA PARA EL BUSINESS FLOW MAP
> 
> **Estado:** CURRENT_SOURCE_OF_TRUTH (actualizado 2026-05-13)
> **Contexto:** Cermont S.A.S. es una empresa contratista MULTISERVICIO. Opera en construcción, electricidad, refrigeración, mantenimiento, montajes, obras civiles, telecomunicaciones, CCTV, líneas de vida, suministro de materiales, equipos, herramientas y personal técnico — con cobertura nacional. El sector petróleo/Caño Limón es UNO de sus clientes/sectores, NO el único ni el definitorio. Este documento define una plataforma para TODOS los sectores.
# CERMONT_BUSINESS_FLOW_MAP.md

## FASE 3 — MAPA DE DOMINIO Y LÓGICA DE NEGOCIO

**Fecha:** 2026-05-13
**Empresa:** Cermont S.A.S.
**Sector:** Contratista multiservicio (petróleo, construcción, electricidad, refrigeración, CCTV, líneas de vida, obra civil, telecomunicaciones, montajes, suministros)

---

## FLUJO DE TRABAJO DE 14 PASOS

| Paso | Etapa | Entidad Principal | Página | API | Estado | Precondiciones | Next Actions | Offline Required | Documentos Asociados |
|------|-------|-------------------|--------|-----|--------|----------------|--------------|------------------|---------------------|
| 1 | Solicitud del cliente | WorkRequest | /work-requests | /api/work-requests | open → assigned | Cliente inicia solicitud | Visita técnica o propuesta directa | Sí | Formulario solicitud |
| 2 | Visita técnica | SiteVisit | /work-requests/[id] | /api/work-requests/:id/visits | pending → completed | WorkRequest aprobada para visita | Generar propuesta o rechazar | Sí | Reporte visita, fotos |
| 3 | Propuesta económica | Proposal | /proposals | /api/proposals | draft → sent → approved → rejected | Visita completada o solicitud directa | Aprobación cliente con PO | Sí | PDF propuesta, términos |
| 4 | Aprobación con PO | PurchaseOrder | /proposals/[id] | /api/proposals/:id/po | pending → approved | Proposal aprobada | Crear WorkOrder | No | PO cliente, email aprobación |
| 5 | Planeación | PlanningPacket | /orders/[id]/planning | /api/orders/:id/planning | draft → ready | WorkOrder creada | Asignar recursos, personal | Sí | Plan de trabajo, checklist |
| 6 | Ejecución (con evidencias) | ExecutionSession | /execution | /api/execution | in_progress → paused → completed | Planeación lista | Generar informe técnico | Sí | Fotos, checklists, PTW, AST |
| 7 | Informe técnico | TechnicalReport | /reports | /api/reports | draft → submitted → approved | Ejecución completada | Acta de entrega | No | PDF informe, anexos |
| 8 | Acta de entrega | DeliveryRecord | /delivery-records | /api/delivery-records | draft → signed → approved | Informe aprobado | Firma cliente | No | PDF acta, firma digital |
| 9 | Firma del cliente | ClientSignature | /delivery-records/[id] | /api/delivery-records/:id/sign | pending → signed | Acta generada | SES / Ariba | No | Firma digital/huella |
| 10 | SES / Ariba | ServiceEntrySheet | /ses | /api/ses | draft → submitted → approved | Acta firmada | Factura | No | PDF SES, número SES |
| 11 | Aprobación SES | ServiceEntrySheet | /ses | /api/ses/:id/approve | submitted → approved | SES enviada | Factura | No | PDF SES aprobada |
| 12 | Factura | Invoice | /invoices | /api/invoices | draft → sent → approved | SES aprobada | Aprobación factura | No | PDF factura, XML |
| 13 | Aprobación de factura | InvoiceApproval | /invoices/[id] | /api/invoices/:id/approve | pending → approved → rejected | Factura enviada | Pago o rechazo | No | Email aprobación, observaciones |
| 14 | Pago | Payment | /payments | /api/payments | pending → processing → completed | Factura aprobada | Cierre administrativo | No | Comprobante pago |

---

## ENTIDADES DEL DOMINIO

### 1. WorkRequest
**Propósito:** Solicitud inicial del cliente para un servicio
**Página:** /work-requests
**API:** /api/work-requests
**Estado:** open → assigned → in_progress → completed → cancelled
**Precondiciones:** Usuario autenticado con rol cliente o administrativo
**Next Actions:** Crear SiteVisit o crear Proposal directamente
**Relación con ServiceCase:** WorkRequest es el punto de entrada, puede crear ServiceCase
**Permisos RBAC:** 
- gerente, residente, HES: CRUD completo
- cliente: crear solo propias, leer propias
- otros: leer solo
**Offline Required:** Sí (técnicos pueden recibir solicitudes offline)
**Documentos Asociados:** Formulario de solicitud, fotos adjuntas, documentos previos

### 2. SiteVisit
**Propósito:** Visita técnica para evaluar requerimientos
**Página:** /work-requests/[id] (tab de visitas)
**API:** /api/work-requests/:id/visits
**Estado:** pending → scheduled → in_progress → completed → cancelled
**Precondiciones:** WorkRequest asignada
**Next Actions:** Generar Proposal basada en visita
**Relación con ServiceCase:** Parte de fase de pre-venta
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- supervisor, tecnico: crear y actualizar
- otros: leer solo
**Offline Required:** Sí (visitas en campo sin conexión)
**Documentos Asociados:** Reporte de visita, fotos, videos, mediciones

### 3. Proposal
**Propósito:** Propuesta económica para el cliente
**Página:** /proposals
**API:** /api/proposals
**Estado:** draft → sent → approved → rejected → expired
**Precondiciones:** WorkRequest o SiteVisit completada
**Next Actions:** Aprobación cliente con PO → WorkOrder
**Relación con ServiceCase:** Convierte WorkRequest en compromiso económico
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- cliente: leer propias, aprobar/rechazar
- otros: leer solo
**Offline Required:** Sí (revisión offline)
**Documentos Asociados:** PDF propuesta, términos y condiciones, anexos técnicos

### 4. PurchaseOrder
**Propósito:** Orden de compra del cliente (PO)
**Página:** /proposals/[id] (tab de PO)
**API:** /api/proposals/:id/po
**Estado:** pending → received → approved → rejected
**Precondiciones:** Proposal aprobada
**Next Actions:** Crear WorkOrder
**Relación con ServiceCase:** Autoriza inicio de trabajo
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- cliente: crear PO, leer
- otros: leer solo
**Offline Required:** No (requiere validación en tiempo real)
**Documentos Asociados:** PO cliente, email de aprobación

### 5. WorkOrder
**Propósito:** Orden de trabajo interna
**Página:** /orders
**API:** /api/orders
**Estado:** open → assigned → in_progress → on_hold → completed → closed
**Precondiciones:** PO aprobada
**Next Actions:** Planeación → Ejecución
**Relación con ServiceCase:** WorkOrder ES ServiceCase
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- supervisor: asignar, actualizar estado
- operador, tecnico: leer asignadas, actualizar progreso
- cliente: leer propias
**Offline Required:** Sí (técnicos ejecutan offline)
**Documentos Asociados:** Orden de trabajo, checklists, planos

### 6. PlanningPacket
**Propósito:** Paquete de planeación para WorkOrder
**Página:** /orders/[id]/planning
**API:** /api/orders/:id/planning
**Estado:** draft → ready → approved
**Precondiciones:** WorkOrder asignada
**Next Actions:** Ejecución
**Relación con ServiceCase:** Define recursos y cronograma
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- supervisor: leer, actualizar recursos
- operador, tecnico: leer
- otros: leer solo
**Offline Required:** Sí (planeación offline)
**Documentos Asociados:** Plan de trabajo, asignación de personal, lista de materiales

### 7. ExecutionSession
**Propósito:** Sesión de ejecución de trabajo
**Página:** /execution
**API:** /api/execution
**Estado:** scheduled → in_progress → paused → completed → cancelled
**Precondiciones:** PlanningPacket aprobado
**Next Actions:** Registrar evidencias
**Relación con ServiceCase:** Ejecuta el trabajo planeado
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- supervisor: iniciar, pausar, completar
- operador, tecnico: registrar progreso, evidencias
- otros: leer solo
**Offline Required:** Sí (ejecución en campo)
**Documentos Asociados:** Logs de ejecución, checklists de progreso

### 8. Evidence
**Propósito:** Evidencias de trabajo (fotos, videos, documentos)
**Página:** /evidences
**API:** /api/evidences
**Estado:** pending → uploaded → verified → rejected
**Precondiciones:** ExecutionSession en curso
**Next Actions:** Generar TechnicalReport
**Relación con ServiceCase:** Soporta informe técnico
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- supervisor, operador, tecnico: crear, leer
- cliente: leer propias
- otros: leer solo
**Offline Required:** Sí (carga offline con sincronización)
**Documentos Asociados:** Fotos, videos, PDFs, documentos de soporte

### 9. TechnicalReport
**Propósito:** Informe técnico del trabajo ejecutado
**Página:** /reports
**API:** /api/reports
**Estado:** draft → submitted → approved → rejected
**Precondiciones:** Evidencias verificadas
**Next Actions:** Acta de entrega
**Relación con ServiceCase:** Documenta resultados técnicos
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- supervisor: crear, actualizar
- tecnico: crear borrador
- cliente: leer propias
- otros: leer solo
**Offline Required:** No (generación PDF requiere servidor)
**Documentos Asociados:** PDF informe, anexos técnicos, gráficos

### 10. DeliveryRecord
**Propósito:** Acta de entrega del servicio
**Página:** /delivery-records
**API:** /api/delivery-records
**Estado:** draft → generated → signed → approved
**Precondiciones:** TechnicalReport aprobado
**Next Actions:** Firma cliente → SES
**Relación con ServiceCase:** Formaliza entrega
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- supervisor: generar, actualizar
- cliente: firmar
- otros: leer solo
**Offline Required:** No (firma requiere validación)
**Documentos Asociados:** PDF acta, firma digital, huella

### 11. ServiceEntrySheet
**Propósito:** Hoja de entrada de servicio (SES / Ariba)
**Página:** /ses
**API:** /api/ses
**Estado:** draft → submitted → approved → rejected
**Precondiciones:** DeliveryRecord firmado
**Next Actions:** Factura
**Relación con ServiceCase:** Requisito para facturación
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- administrativo: crear, enviar
- cliente: leer
- otros: leer solo
**Offline Required:** No (integración Ariba requiere conexión)
**Documentos Asociados:** PDF SES, número SES, confirmación Ariba

### 12. Invoice
**Propósito:** Factura del servicio
**Página:** /invoices
**API:** /api/invoices
**Estado:** draft → sent → approved → rejected → paid
**Precondiciones:** SES aprobada
**Next Actions:** Aprobación factura → Pago
**Relación con ServiceCase:** Documento de cobro
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- administrativo: crear, enviar
- cliente: leer, aprobar/rechazar
- otros: leer solo
**Offline Required:** No (generación factura requiere servidor)
**Documentos Asociados:** PDF factura, XML, email de envío

### 13. InvoiceApproval
**Propósito:** Aprobación de factura por cliente
**Página:** /invoices/[id]
**API:** /api/invoices/:id/approve
**Estado:** pending → approved → rejected
**Precondiciones:** Invoice enviada
**Next Actions:** Pago (si aprobada) o correcciones (si rechazada)
**Relación con ServiceCase:** Autoriza pago
**Permisos RBAC:**
- cliente: aprobar/rechazar propias
- gerente, residente, HES: leer
- administrativo: leer
- otros: leer solo
**Offline Required:** No
**Documentos Asociados:** Email de aprobación, observaciones

### 14. Payment
**Propósito:** Registro de pago
**Página:** /payments
**API:** /api/payments
**Estado:** pending → processing → completed → failed
**Precondiciones:** Invoice aprobada
**Next Actions:** Cierre administrativo
**Relación con ServiceCase:** Cierra ciclo financiero
**Permisos RBAC:**
- gerente, residente, HES: CRUD completo
- administrativo: registrar, actualizar
- cliente: leer propias
- otros: leer solo
**Offline Required:** No
**Documentos Asociados:** Comprobante de pago, conciliación bancaria

---

## ENTIDADES ADICIONALES DE SOPORTE

### 15. DocumentTemplate
**Propósito:** Plantillas de documentos dinámicos
**Página:** /documents/templates
**API:** /api/documents/templates
**Estado:** draft → published → archived
**Permisos RBAC:** gerente, residente, HES: CRUD completo
**Offline Required:** No

### 16. DocumentImport
**Propósito:** Importación de documentos existentes (PDF, Excel, Word)
**Página:** /documents/import
**API:** /api/documents/import
**Estado:** pending → processing → completed → failed
**Permisos RBAC:** Todos los roles autenticados pueden importar
**Offline Required:** Sí (carga offline con sincronización)

### 17. DynamicForm
**Propósito:** Formularios dinámicos generados desde plantillas
**Página:** /forms
**API:** /api/forms
**Estado:** draft → published → archived
**Permisos RBAC:** gerente, residente, HES: CRUD completo
**Offline Required:** Sí

### 18. CostEstimate
**Propósito:** Estimación de costos en Proposal
**Página:** /proposals/[id]/costs
**API:** /api/proposals/:id/costs
**Estado:** draft → approved
**Permisos RBAC:** gerente, residente, HES: CRUD completo
**Offline Required:** Sí

### 19. ActualCost
**Propósito:** Costos reales en WorkOrder
**Página:** /orders/[id]/costs
**API:** /api/orders/:id/costs
**Estado:** pending → recorded → verified
**Permisos RBAC:** gerente, residente, HES, supervisor: CRUD completo
**Offline Required:** Sí

### 20. Asset
**Propósito:** Activos de Cermont (equipos, vehículos, herramientas)
**Página:** /assets
**API:** /api/assets
**Estado:** active → maintenance → inactive → retired
**Permisos RBAC:** gerente, residente: CRUD completo; otros: leer solo
**Offline Required:** Sí

### 21. MaintenancePlan
**Propósito:** Plan de mantenimiento preventivo
**Página:** /maintenance
**API:** /api/maintenance
**Estado:** scheduled → in_progress → completed → overdue
**Permisos RBAC:** gerente, residente, HES: CRUD completo; supervisor, tecnico: leer, actualizar
**Offline Required:** Sí

---

## TABLA DE ESTADOS POR ETAPA

| Etapa | Estados Posibles | Transiciones |
|-------|------------------|--------------|
| WorkRequest | open, assigned, in_progress, completed, cancelled | open → assigned → in_progress → completed |
| SiteVisit | pending, scheduled, in_progress, completed, cancelled | pending → scheduled → in_progress → completed |
| Proposal | draft, sent, approved, rejected, expired | draft → sent → approved/rejected |
| PurchaseOrder | pending, received, approved, rejected | pending → received → approved/rejected |
| WorkOrder | open, assigned, in_progress, on_hold, completed, closed | open → assigned → in_progress → on_hold → completed → closed |
| PlanningPacket | draft, ready, approved | draft → ready → approved |
| ExecutionSession | scheduled, in_progress, paused, completed, cancelled | scheduled → in_progress → paused → completed |
| Evidence | pending, uploaded, verified, rejected | pending → uploaded → verified/rejected |
| TechnicalReport | draft, submitted, approved, rejected | draft → submitted → approved/rejected |
| DeliveryRecord | draft, generated, signed, approved | draft → generated → signed → approved |
| ServiceEntrySheet | draft, submitted, approved, rejected | draft → submitted → approved/rejected |
| Invoice | draft, sent, approved, rejected, paid | draft → sent → approved/rejected → paid |
| InvoiceApproval | pending, approved, rejected | pending → approved/rejected |
| Payment | pending, processing, completed, failed | pending → processing → completed/failed |

---

## MAPEO A PÁGINAS EXISTENTES Y FALTANTES

| Entidad | Página Requerida | Página Existe | Estado |
|---------|------------------|---------------|--------|
| WorkRequest | /work-requests | ❌ NO (directorio vacío) | FASE 6 |
| SiteVisit | /work-requests/[id] | ❌ NO | FASE 6 |
| Proposal | /proposals | ✅ YES | ✅ OK |
| PurchaseOrder | /proposals/[id] | ✅ YES | ✅ OK |
| WorkOrder | /orders | ✅ YES | ✅ OK |
| PlanningPacket | /orders/[id]/planning | ✅ YES | ✅ OK |
| ExecutionSession | /execution | ❌ NO (directorio vacío) | FASE 6 |
| Evidence | /evidences | ✅ YES | ✅ OK |
| TechnicalReport | /reports | ✅ YES | ✅ OK |
| DeliveryRecord | /delivery-records | ❌ NO (directorio vacío) | FASE 6 |
| ServiceEntrySheet | /ses | ❌ NO (directorio vacío) | FASE 6 |
| Invoice | /invoices | ❌ NO (directorio vacío) | FASE 6 |
| InvoiceApproval | /invoices/[id] | ❌ NO | FASE 6 |
| Payment | /payments | ❌ NO (directorio vacío) | FASE 6 |
| Asset | /assets | ❌ NO (directorio vacío) | FASE 6 |
| MaintenancePlan | /maintenance | ✅ YES | ✅ OK |

---

## REGLAS DE NEGOCIO CRÍTICAS

1. **WorkOrder sin PO:** No se puede crear WorkOrder sin PO aprobado (excepto trabajos internos)
2. **Ejecución sin planeación:** No se puede iniciar ExecutionSession sin PlanningPacket aprobado
3. **Informe sin evidencias:** No se puede aprobar TechnicalReport sin evidencias verificadas
4. **Acta sin informe:** No se puede generar DeliveryRecord sin TechnicalReport aprobado
5. **SES sin acta:** No se puede crear SES sin DeliveryRecord firmado
6. **Factura sin SES:** No se puede generar Invoice sin SES aprobada
7. **Pago sin factura:** No se puede registrar Payment sin Invoice aprobada
8. **Offline-first:** Todas las entidades que requieren campo (WorkRequest, SiteVisit, PlanningPacket, ExecutionSession, Evidence) deben soportar offline
9. **RBAC estricto:** Cada entidad tiene permisos específicos por rol, no bypass
10. **Audit trail:** Todas las mutaciones deben registrar audit log con usuario, timestamp, y cambios

---

## BLOQUEADORES Y DEPENDENCIAS

| Entidad | Bloqueadores | Siguiente Entidad |
|---------|--------------|-------------------|
| WorkRequest | Usuario autenticado | SiteVisit o Proposal |
| SiteVisit | WorkRequest asignada | Proposal |
| Proposal | SiteVisit completada o WorkRequest directa | PurchaseOrder |
| PurchaseOrder | Proposal aprobada | WorkOrder |
| WorkOrder | PO aprobado | PlanningPacket |
| PlanningPacket | WorkOrder asignada | ExecutionSession |
| ExecutionSession | PlanningPacket aprobado | Evidence |
| Evidence | ExecutionSession en curso | TechnicalReport |
| TechnicalReport | Evidencias verificadas | DeliveryRecord |
| DeliveryRecord | TechnicalReport aprobado | ServiceEntrySheet |
| ServiceEntrySheet | DeliveryRecord firmado | Invoice |
| Invoice | SES aprobada | InvoiceApproval |
| InvoiceApproval | Invoice enviada | Payment |
| Payment | Invoice aprobada | Cierre administrativo |

---

## PRÓXIMOS PASOS (FASE 4-6)

1. **FASE 4:** Crear contratos Zod faltantes en packages/shared-types
2. **FASE 5:** Implementar endpoints backend faltantes
3. **FASE 6:** Crear páginas frontend faltantes

