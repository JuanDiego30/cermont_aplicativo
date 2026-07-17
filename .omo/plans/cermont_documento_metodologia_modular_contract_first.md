# CERMONT — Documento de Trabajo Arquitectónico por Módulos

## Metodología Contract-First → Base de Datos → Backend → Frontend

**Versión:** 1.0  
**Propósito:** ordenar la maduración del aplicativo CERMONT por módulos/responsabilidades, evitando duplicidad de información y manteniendo el flujo secuencial de 14 fases.

---

## 1. Metodología obligatoria por módulo

Cada módulo se trabaja en este orden:

1. **Contratos compartidos (`packages/shared-types`)**
   - Schemas Zod.
   - Types inferidos.
   - DTOs de create/update/list/detail.
   - Response schemas.
   - Filtros, estados, paginación, errores.
   - Prohibido schema local duplicado.

2. **Dominio (`packages/domain`)**
   - Reglas de estado.
   - Precondiciones.
   - RBAC.
   - Bloqueos.
   - Next actions.
   - Readiness/madurez.
   - Reglas financieras, HSE o documentales.

3. **Base de datos (`backend/src/models`)**
   - Mongoose schema.
   - Sub-schemas reutilizables.
   - Índices.
   - Migrations/backfill.
   - Seeds/catálogos.

4. **Backend (`backend/src/modules/<module>`)**
   - Routes.
   - Controllers.
   - Services.
   - Mappers.
   - Auditoría.
   - Tests.

5. **Frontend (`frontend/src/modules/<module>` + `frontend/src/app`)**
   - API client.
   - Hooks.
   - UI.
   - Pages.
   - Loading/error/empty/offline/forbidden.
   - Mobile-first.
   - Tests/E2E.

6. **Evidencia**
   - Screenshot antes/después.
   - Network log.
   - Console log.
   - `typecheck`, `lint`, `test`, `build`, `contracts:check`, `verify`.

---

## 2. Regla central: no duplicar información entre fases

El flujo de 14 fases debe funcionar como cadena de herencia. Cada fase lee lo anterior, agrega solo lo que le corresponde y bloquea si falta un prerrequisito.

| Dato | Se captura en | No volver a pedir en |
|---|---|---|
| Cliente, NIT, contacto | Customer / Work Request | Proposal, Planning, Execution, Invoice |
| Alcance inicial | Work Request / Proposal | Execution, Report |
| Ubicación | Work Request / Site Visit | Report, Invoice |
| Fotos y mediciones visita | Site Visit | Proposal, Planning |
| Valor propuesto | Proposal | Invoice, Payment |
| PO | Purchase Order | SES, Invoice |
| Cronograma, recursos, EPP | Planning | Execution |
| Evidencias | Evidence / Execution | Report, Delivery Record |
| Firma cliente | Delivery Record | Invoice, Payment |
| SES aprobada | Service Entry Sheet | Invoice |
| Factura aprobada | Invoice Approval | Payment |

---

## 3. Flujo secuencial de 14 fases

| # | Fase | Módulo | Debe producir | Bloquea si falta |
|---|---|---|---|---|
| 1 | Solicitud formal | Work Requests | Solicitud trazable | Cliente/contacto/alcance |
| 2 | Visita técnica | Site Visits | Mediciones/fotos/hallazgos | Visita requerida no cerrada |
| 3 | Propuesta | Proposals | Baseline económico | Propuesta no aprobada |
| 4 | PO | Purchase Orders | Autorización de ejecución | PO no aprobada |
| 5 | Planeación | Planning Packet | Recursos, EPP, AST/PTW, firmas | Readiness incompleto |
| 6 | Ejecución | Execution Sessions | Actividad ejecutada | Checklist/evidencia crítica faltante |
| 7 | Evidencias | Evidences / Files | Galería verificable | Fotos obligatorias faltantes |
| 8 | Informe | Technical Reports | Informe técnico/PDF | Informe no aprobado |
| 9 | Acta | Delivery Records | Acta enviada | Acta no generada |
| 10 | Firma cliente | Client Signatures | Acta firmada | Firma/rechazo pendiente |
| 11 | SES | Service Entry Sheets | SES aprobada | SES no aprobada |
| 12 | Factura | Invoices | Factura emitida/enviada | Factura inválida |
| 13 | Aprobación factura | Invoice Approval | Factura aprobada | Aprobación pendiente |
| 14 | Pago | Payments | Cierre administrativo | Pago no conciliado |

---

## 4. Módulos y checklist de maduración

### M0 — Fundamentos transversales

**Debe ir:** FileAssetRef, WorkflowStepRef, MoneyAmount, TaxBreakdown, SignatureRef, DocumentRequirement, EvidenceRequirement, ApprovalState, audit metadata.  
**No debe ir:** reglas específicas de CCTV, factura o pago.

Checklist:
- [ ] Crear/validar `WorkflowStepRefSchema`.
- [ ] Crear/validar `DocumentRequirementSchema`.
- [ ] Crear/validar `EvidenceRequirementSchema`.
- [ ] Crear/validar `FileAssetRefSchema`.
- [ ] Crear/validar `MoneyAmountSchema`.
- [ ] Crear/validar `TaxBreakdownSchema`.
- [ ] Crear/validar `SignatureRefSchema`.
- [ ] Eliminar `Record<string, unknown>` reemplazable por sub-schemas.
- [ ] Índices por `orderId`, `serviceCaseId`, `workflowStep`, `status`.

### M1 — Customers / Clients

Debe centralizar datos del cliente para no repetirlos.

Solicitar:
- Razón social.
- NIT/identificación.
- Régimen/responsabilidad tributaria si aplica.
- Contactos.
- Correos de facturación.
- Dirección.
- Municipio/departamento.
- Condiciones comerciales.
- Preferencias de portal.

No solicitar:
- Datos de cada orden.
- Costos.
- Evidencias.
- SES/facturas específicas.

Campos sugeridos:
- `taxId`
- `taxRegime`
- `billingEmail`
- `billingContact`
- `legalRepresentative`
- `serviceLocations[]`
- `paymentTermsDays`
- `portalAccessStatus`
- `dataProcessingConsentRef`

### M2 — Work Requests

Solicitar:
- Cliente.
- Canal de solicitud.
- Descripción.
- Servicio requerido.
- Prioridad.
- Ubicación preliminar.
- Adjuntos iniciales.
- Persona solicitante.

No solicitar:
- Costos reales.
- Herramientas.
- EPP.
- Factura.
- Pago.

Checklist:
- [ ] Asociar `customerId`.
- [ ] Asociar `serviceCaseId`.
- [ ] Generar código trazable.
- [ ] Adjuntos iniciales.
- [ ] Definir si requiere visita.
- [ ] Auditoría.

### M3 — Site Visits

Solicitar:
- Fecha.
- Técnico/inspector.
- Mediciones.
- Fotos.
- Hallazgos.
- Riesgos visibles.
- Recursos potenciales.
- Recomendación.

No solicitar:
- Valor final.
- Factura.
- Pago.

Checklist:
- [ ] Heredar solicitud/cliente.
- [ ] Fotos como `FileAssetRef`.
- [ ] Mediciones estructuradas.
- [ ] Alimentar propuesta y planning.

### M4 — Proposals

Solicitar:
- Alcance formal.
- Ítems cotizados.
- Mano de obra estimada.
- Materiales estimados.
- Equipos estimados.
- Transporte.
- Impuestos.
- Vigencia.
- Condiciones.
- Archivo de propuesta.

No solicitar:
- Costo real.
- Pago.
- Evidencias de cierre.

Checklist:
- [ ] Crear `proposalCostBaseline`.
- [ ] Versionar propuesta.
- [ ] Aprobar/rechazar.
- [ ] Bloquear PO si no está aprobada.

### M5 — Purchase Orders

Solicitar:
- Número PO.
- Fecha aprobación.
- Valor aprobado.
- Archivo soporte.
- Responsable cliente.
- Condiciones especiales.

No solicitar:
- Planeación.
- Costos reales.
- Factura final.

Checklist:
- [ ] Validar propuesta aprobada.
- [ ] Comparar PO vs propuesta.
- [ ] Desbloquear planeación.

### M6 — Planning / Planning Packet

Debe representar el formato real de planeación de obra.

Solicitar:
- Responsable inspección.
- Lugar.
- Fecha.
- Unidad de negocio: IT, MNT, SC, GEN, Otros.
- Alcance.
- Materiales: descripción/cantidad.
- Herramientas: descripción/cantidad.
- Equipos: descripción/cantidad.
- Elementos de seguridad/EPP: descripción/cantidad.
- Número de trabajadores: electricistas, técnicos telecom, instrumentistas, obreros.
- Firmas: Ing. Residente, Técnico Electricista, HES.
- Cronograma.
- Certificaciones.
- AST/PTW.
- Procedimientos/documentos de apoyo.

No solicitar:
- Cliente.
- Factura.
- Pago.
- Datos ya capturados en propuesta/PO.

Checklist:
- [ ] Extender `PlanningPacketSchema`.
- [ ] Agregar `businessUnit`.
- [ ] Agregar `resourcePlan.materials[]`.
- [ ] Agregar `resourcePlan.tools[]`.
- [ ] Agregar `resourcePlan.equipment[]`.
- [ ] Agregar `resourcePlan.safetyItems[]`.
- [ ] Agregar `laborPlan`.
- [ ] Agregar `requiredCertifications[]`.
- [ ] Agregar `requiredAst`.
- [ ] Agregar `requiredPtw`.
- [ ] Agregar `internalSignatures`.
- [ ] Endpoint `apply-kit-to-planning`.
- [ ] Endpoint `validate-readiness`.
- [ ] Endpoint `approve-planning`.
- [ ] Wizard por secciones.
- [ ] Readiness visible.
- [ ] Bloqueos visibles.

### M7 — Kits / Resources / Tools / Equipment

Objetivo: módulo tipo CMMS/EAM con recursos, fotos y requisitos.

Solicitar:
- Nombre.
- Tipo de servicio.
- Herramientas.
- Equipos.
- Materiales.
- EPP.
- Certificaciones.
- Documentos.
- Evidencias requeridas.
- Checklists.
- Imágenes del kit.
- Imágenes de herramienta.
- Imágenes de equipo.
- Estado.
- Versión.
- Fuente documental.

No solicitar:
- Cliente.
- Factura.
- Pago.
- Evidencias de ejecución específicas.

Campos:
- `fileAssets[]`
- `primaryImageId`
- `resourceImages[]`
- `requiredEvidenceTypes[]`
- `requiredCertifications[]`
- `requiredPermits[]`
- `requiredAst`
- `usageHistory[]`
- `version`
- `templateSourceDocument`

Checklist:
- [ ] Subir imágenes de herramientas.
- [ ] Subir imágenes de equipos.
- [ ] Imagen principal.
- [ ] Reusar `FileAssetRef`.
- [ ] Conectar herramientas al catálogo `resources`.
- [ ] Conectar kits a planning.
- [ ] Conectar kits a formularios.
- [ ] Conectar kits a evidencias obligatorias.
- [ ] No crear CCTV/lifeline desde cero si ya existen templates.
- [ ] Eliminar schemas locales.

### M8 — Forms / Templates / Checklists

Solicitar:
- Template.
- Versión.
- Secciones.
- Campos.
- Validaciones.
- Evidencia por campo.
- C/NC/NA.
- Hallazgos.
- Acciones correctivas.
- Observaciones.
- Firma.
- Concepto final.

No solicitar:
- Cliente/orden si ya vienen del contexto.
- Recursos si ya vienen de planning/kit.

CCTV:
- [ ] Cámara No.
- [ ] Rutina No.
- [ ] Lugar.
- [ ] Fecha.
- [ ] Altura estructura.
- [ ] Distancia cámara-caja conexión.
- [ ] Altura cámara.
- [ ] Tipo/modelo/serial.
- [ ] Encoder/POE.
- [ ] Radio.
- [ ] Antena.
- [ ] Switch.
- [ ] Sistema eléctrico.
- [ ] AC 110 VAC.
- [ ] Sistema fotovoltaico.
- [ ] Caja de conexión.
- [ ] Transferencia automática.
- [ ] Gabinete.
- [ ] Luces obstrucción.
- [ ] Fotos antes/después por componente.

Línea de vida:
- [ ] Placa anclaje superior.
- [ ] Platinas.
- [ ] Absorbedor.
- [ ] Sistema tensor.
- [ ] Cable acero inoxidable.
- [ ] Soporte cable guía.
- [ ] Placa anclaje inferior.
- [ ] Placa identificación.
- [ ] C/NC/NA.
- [ ] Hallazgo.
- [ ] Acción correctiva.
- [ ] Observaciones.
- [ ] Concepto final.
- [ ] Fotos por componente.

### M9 — Safety / AST / SGSST

Solicitar:
- Peligro.
- Riesgo.
- Control.
- Jerarquía de control.
- EPP.
- Responsable HES.
- Personal habilitado.
- Inducción/reinducción.
- Certificaciones.
- Firma HES.
- Permiso de trabajo.

No solicitar:
- Factura.
- Pago.
- Datos comerciales.

Checklist:
- [ ] Matriz HSE por actividad.
- [ ] Bloqueo si falta inducción/certificación.
- [ ] AST en planning.
- [ ] Socialización AST en execution.
- [ ] Aprobación HES.
- [ ] Auditoría.

### M10 — Execution / Offline

Solicitar:
- Inicio/fin.
- Actividades.
- Consumos reales.
- Horas hombre.
- Herramientas/equipos usados.
- Checklists.
- Incidentes.
- Observaciones.
- Firmas.
- Evidencias.

No solicitar:
- Cliente.
- PO.
- Factura.
- Baseline propuesta.

Checklist:
- [ ] Heredar planning.
- [ ] Cargar checklists/forms del kit.
- [ ] Offline.
- [ ] Cola sync.
- [ ] Resolver conflictos.
- [ ] Evidencia por ítem.
- [ ] Costo real desde ejecución.
- [ ] Bloqueo por evidencias críticas.

### M11 — Evidences / Files

Solicitar:
- Foto/documento.
- Tipo: antes, después, hallazgo, cierre, firma, soporte.
- Relación: orden, ejecución, checklist, form item, reporte.
- Metadatos.
- Observaciones.
- Estado revisión.

No solicitar:
- Cliente.
- Costo.
- Factura.

Checklist:
- [ ] Carga múltiple.
- [ ] Cámara.
- [ ] `FileAssetRef`.
- [ ] Miniaturas.
- [ ] Hash/checksum.
- [ ] Offline local id.
- [ ] Sync status.
- [ ] Galería por orden.
- [ ] Galería por informe.
- [ ] Export PDF/ZIP.

### M12 — Technical Reports

Solicitar:
- Selección de evidencias.
- Conclusiones.
- Recomendaciones.
- Aprobador.
- Firma técnica.

No solicitar:
- Cliente.
- Fotos ya existentes.
- Herramientas planeadas.

Checklist:
- [ ] Informe desde execution + evidence + forms.
- [ ] Plantilla profesional.
- [ ] Versionado.
- [ ] PDF.
- [ ] Aprobación.
- [ ] Historial.

### M13 — Delivery Records / Signatures

Solicitar:
- Observación de entrega.
- Firma cliente.
- Nombre/cargo firmante.
- Fecha.
- Aceptación/rechazo.

No solicitar:
- Factura.
- Pago.
- Fotos ya incluidas.

Checklist:
- [ ] Acta desde informe.
- [ ] Firma digital.
- [ ] Rechazo con motivo.
- [ ] Reapertura.
- [ ] Bloquear SES si no hay acta firmada.

### M14 — Billing / SES / Invoices / Payments

SES debe solicitar:
- Referencia SES/Ariba.
- Valor.
- Fecha envío.
- Fecha aprobación.
- Soporte.
- Estado.

Factura debe solicitar:
- Número factura.
- Resolución/rango.
- CUFE/CUDE si aplica.
- Fecha emisión.
- Fecha vencimiento.
- Subtotal.
- IVA.
- Retenciones.
- ICA/reteICA si aplica.
- Estado DIAN.
- XML/PDF/ZIP.
- Correo enviado.
- Soporte.

Pago debe solicitar:
- Fecha pago.
- Valor pagado.
- Banco.
- Referencia.
- Soporte.
- Conciliación.
- Diferencia.

No solicitar:
- Cliente otra vez.
- PO otra vez.
- Factura completa en pago.

Checklist:
- [ ] `TaxProfile`.
- [ ] IVA configurable por ítem/categoría.
- [ ] Retenciones configurables.
- [ ] ICA/reteICA configurable por cliente/municipio si aplica.
- [ ] Estado DIAN.
- [ ] XML/PDF/soporte.
- [ ] CUFE/CUDE.
- [ ] Resolución/rango.
- [ ] Invoice desde SES aprobada.
- [ ] Payment desde invoice aprobada.
- [ ] Timeline SES → Factura → Pago.
- [ ] Auditoría financiera.

### M15 — Costs / ERP Financial Control

Solicitar:
- Baseline propuesta.
- Costo real ejecución.
- Mano de obra.
- Materiales.
- Equipos/herramientas.
- Transporte.
- Subcontratos.
- Impuestos.
- Retenciones.
- Indirectos.
- Soportes.
- Margen.
- Variación.

No solicitar:
- Cliente.
- Orden.
- Ejecución ya existente.

Checklist:
- [ ] Snapshot propuesta.
- [ ] Snapshot PO.
- [ ] Actual cost desde execution.
- [ ] Costos manuales con soporte obligatorio.
- [ ] Variance.
- [ ] VariancePercent.
- [ ] GrossMargin.
- [ ] NetMargin.
- [ ] Overrun alerts.
- [ ] Rentabilidad por cliente.
- [ ] Rentabilidad por unidad de negocio.
- [ ] Export financiero.
- [ ] Auditoría.

### M16 — Dashboard / KPIs

Debe mostrar:
- Órdenes por fase.
- Cuellos de botella.
- SLA risk.
- Planeaciones incompletas.
- Evidencias faltantes.
- Informes pendientes.
- Actas pendientes.
- SES pendientes.
- Facturas vencidas.
- Pagos pendientes.
- Sobrecostos.
- Rentabilidad.
- Documentos vencidos.
- Sync offline.
- Alertas por rol.

No debe solicitar datos; debe leer de módulos existentes.

Checklist:
- [ ] KPIs por fase.
- [ ] Alertas por rol.
- [ ] Acciones recomendadas.
- [ ] Drilldown.
- [ ] No métricas inventadas.

### M17 — Fleet / Assets / Inventory / Maintenance / Dispatch

Solicitar:
- Activos.
- Vehículos.
- Documentos.
- Fotos.
- Certificaciones.
- Mantenimiento.
- Disponibilidad.
- Asignaciones.
- Inventario.
- Reservas.

No solicitar:
- Cliente.
- Factura.
- Pago.

Checklist:
- [ ] Foto de activo/herramienta.
- [ ] Disponibilidad.
- [ ] Reserva para planning.
- [ ] Check-out/check-in.
- [ ] Documentos vencidos.
- [ ] Mantenimiento preventivo.
- [ ] Descuento inventario al ejecutar.
- [ ] Alertas stock.

### M18 — Portal / Admin / Backups / Audit

Portal:
- [ ] Ver órdenes.
- [ ] Ver propuestas.
- [ ] Descargar informes.
- [ ] Firmar actas.
- [ ] Ver facturas.
- [ ] Crear casos.

Admin:
- [ ] Usuarios.
- [ ] Roles.
- [ ] Configuración.
- [ ] ERP connectors.
- [ ] Backups.
- [ ] Auditoría.
- [ ] Catálogos.
- [ ] Plantillas.

---

## 5. Orden de implementación

### Fase A — Preparación estructural
- [ ] Baseline.
- [ ] Inventario contratos.
- [ ] Inventario modelos.
- [ ] Inventario backend.
- [ ] Inventario frontend.
- [ ] Matriz ruta → módulo → fase.

### Fase B — Contratos y dominio
- [ ] Common schemas.
- [ ] WorkflowStep schemas.
- [ ] Customer contracts.
- [ ] Planning contracts.
- [ ] Resource/Kit contracts.
- [ ] Forms/Checklist contracts.
- [ ] Evidence/File contracts.
- [ ] Execution contracts.
- [ ] Report/Delivery contracts.
- [ ] Billing contracts.
- [ ] Costs/Tax contracts.
- [ ] Dashboard contracts.

### Fase C — Base de datos
- [ ] Mongoose models.
- [ ] Sub-schemas.
- [ ] Índices.
- [ ] Migrations.
- [ ] Seeds.
- [ ] Backfill.

### Fase D — Backend
- [ ] Services.
- [ ] Controllers.
- [ ] Routes.
- [ ] RBAC.
- [ ] Audit.
- [ ] Tests.
- [ ] OpenAPI.

### Fase E — Frontend
- [ ] API clients.
- [ ] Hooks.
- [ ] UI.
- [ ] Pages.
- [ ] States.
- [ ] Mobile.
- [ ] E2E.

### Fase F — Validación
- [ ] Typecheck.
- [ ] Lint.
- [ ] Test.
- [ ] Build.
- [ ] Contracts check.
- [ ] Verify.
- [ ] Screenshots.
- [ ] Network/console.

---

## 6. Primer módulo recomendado

Primero trabajar **M6 Planning**, conectado con **M7 Kits/Resources** y **M8 Forms/Checklists**, pero empezando por contratos y modelos, no por UI.

Razón:
- Planning y evidencias son la base operativa.
- Kits alimentan planning.
- Forms/checklists alimentan execution/evidences.
- Sin planning maduro, reports, costs y dashboard quedan desconectados.

