# Plan Maestro de Refactorización Funcional CERMONT v4

**Versión:** 4.0.0  
**Fecha:** 2026-07-07  
**Autor:** Arquitecto Principal Fullstack / Consultor FSM/CMMS/GMAO/ERP  
**Propósito:** Plan de refactorización funcional, innovación y madurez empresarial  
**Archivo base:** Reemplaza a `cermont-product-implementation-masterplan.v3.md`

---

## 0. Advertencia: Este plan reemplaza el enfoque de "todo existe"

Este plan declara la guerra contra la complacencia funcional.

Plan v3 tenía 1064 líneas, estaba bien estructurado, pero su ejecución fue un fracaso porque el modelo programador anterior marcó waves como completas solo porque encontró archivos existentes. No verificó funcionalidad real, UX, datos, ni valor empresarial.

**Reglas inquebrantables de este plan v4:**

1. Existencia de archivos NO es producto terminado.
2. Existencia de página NO es flujo empresarial completo.
3. Existencia de formulario NO es lógica profesional.
4. Existencia de tests NO es validación real del negocio.
5. `npm run verify` pasando NO es madurez tipo FSM/CMMS/GMAO/ERP.
6. Correcciones de accesibilidad NO son innovación funcional.
7. Tres cambios visuales NO son refactorización empresarial.
8. Una ruta con empty state NO es funcionalidad completa.
9. Un schema bonito sin UI conectada NO es implementación.
10. Un backend con endpoints sin frontend NO es producto entregable.

**CERMONT necesita un sistema que realmente supere Word, Excel, PDFs y WhatsApp.**

Cada sprint de este plan produce cambios visibles en `localhost:3000`, conectados a datos reales o seed controlado, con lógica de negocio, validaciones, pruebas y evidencia antes/después.

---

## 1. Resumen Ejecutivo Honesto

CERMONT tiene una base técnica sólida:
- 111 schemas Zod en shared-types
- 59 módulos backend
- 48 módulos frontend
- 42+ rutas de página
- 17 archivos de dominio con reglas de negocio
- 62 modelos Mongoose
- Backend de flota con checkout/checkin, fotos, asignaciones, historial, alertas documentales
- Schema de planning packet con 28+ sub-campos (cronograma, crew, herramientas, equipos, EPP, AST, PTW, certificaciones, readiness checklist, cost baseline, blockers)
- 14 pasos operativos definidos en domain
- Step context schema para flujo completo
- Reglas de execution con blockers y next actions
- Fleet readiness rules con score y blockers

**El problema no es técnico. Es funcional.**

El backend tiene capacidades que la UI no expone. Los contratos son ricos pero las pantallas son pobres. Los formularios existen pero son básicos. Las reglas de dominio están definidas pero no bloquean acciones reales en UI.

**Las 8 fallas originales de CERMONT persisten:**

1. Planeación incompleta (alcances, herramientas, equipos, EPP olvidados) — PARCIALMENTE RESUELTA (schema rico pero UI mínima)
2. Falta de verificación de certificaciones de equipos y personal — NO RESUELTA (domain rules existen pero UI no las usa)
3. Diligenciamiento manual de formatos (papel, Excel, Word) — PARCIALMENTE RESUELTA (formularios existen pero son básicos)
4. Retraso en informes técnicos y actas de entrega — NO RESUELTA (falta generación automática)
5. Retraso en SES/Ariba y facturación — NO RESUELTA (falta trazabilidad)
6. Falta de costos reales centralizados — NO RESUELTA (schema existe pero UI no integra)
7. Comparación débil entre propuesta y costo real — NO RESUELTA (falta dashboard de desviación)
8. Evidencias fotográficas dispersas (WhatsApp, dispositivos personales) — PARCIALMENTE RESUELTA (evidence module existe pero falta galería profesional)

**Top 20 brechas funcionales detectadas:**

1. Fleet: UI no expone checkout/checkin a pesar de backend completo
2. Fleet: NewVehicleDrawer usa schema local, Record<string, unknown>, casts con unknown
3. Fleet: No hay mantenimiento preventivo en UI
4. Fleet: No hay alertas de documentos vencidos visibles en dashboard
5. Planning: UI solo tiene ReadinessGate, el resto del schema (28+ campos) no se usa
6. Planning: No hay UI para cronograma, crew, herramientas, equipos, EPP, AST, PTW
7. Planning: No hay cost baseline snapshot visible
8. Planning: No hay firma de responsables en UI
9. Execution: UI limitada comparada con las reglas de domain
10. Execution: Offline no está probado como flujo real
11. Evidence: No hay galería profesional por orden con metadatos
12. Evidence: No hay exportación a PDF
13. Evidence: No hay control de versiones
14. SES/Invoice: Falta trazabilidad visual del flujo completo
15. Costs: No hay comparación propuesta vs real en UI
16. Dashboard: KPIs desconectados de backend
17. Portal cliente: No verificado si existe y funciona
18. Dynamic forms: Constructor no existe
19. Backups: No verificado
20. E2E: No existe prueba de flujo completo 14 pasos

---

## 2. Por Qué el Reporte Anterior Fue Insuficiente

El plan v3 fue un documento de 1064 líneas bien escrito. Su ejecución falló por estas razones:

| Problema | Impacto |
|----------|---------|
| Organizado por "waves" en vez de "sprints funcionales" | Las waves mezclaban correcciones de accesibilidad con features de producto |
| No exigía evidencia visual por wave | El programador marcaba completas sin screenshot |
| No definía "terminado" con criterios funcionales | Cualquier archivo existente = completo |
| No auditaba páginas visibles contra contratos | Se asumía que si la ruta existe, la funcionalidad existe |
| No exigía que cada sprint produjera cambios visibles en localhost | El trabajo se volvía invisible |
| No listaba archivos exactos a modificar | El programador improvisaba alcance |
| No prohibía explícitamente "ya existe, por tanto completo" | Esa frase mató la ejecución |
| No diferenciaba backend lógico de UI funcional | Backend con checkout/checkin no servía si UI no lo tenía |

**Este plan v4 corrige TODO eso.**

---

## 3. Benchmark Profesional FSM/CMMS/GMAO/ERP/EAM/SaaS

CERMONT no compite con software de escritorio. Compite con:

| Estándar | Descripción | Lo que hace un sistema profesional |
|----------|-------------|-----------------------------------|
| **FSM** | Field Service Management | Orden de trabajo con ciclo completo, dispatch, técnico, agenda, firma, factura |
| **CMMS** | Computerized Maintenance Management | Activos, mantenimiento preventivo/correctivo, históricos, repuestos |
| **GMAO** | Gestión de Mantenimiento Asistida | Lo mismo que CMMS pero en francés/español, con énfasis en cumplimiento normativo |
| **ERP** | Enterprise Resource Planning | Finanzas, costos, rentabilidad, facturación, nómina, compras, inventario |
| **EAM** | Enterprise Asset Management | Ciclo de vida del activo, depreciación, mantenimiento, disposición |
| **SaaS B2B** | Software as a Service operativo | Multi-cliente, multi-rol, offline, mobile-first, auditoría, backups |

**Requerimientos profesionales mínimos que CERMONT debe cumplir:**

### 3.1 Work Orders con ciclo completo
Un FSM profesional permite: crear, asignar, programar, ejecutar, documentar, facturar, cerrar. Cada estado tiene transiciones controladas por RBAC. Cada transición deja auditoría.

### 3.2 Planeación con recursos
Un CMMS profesional exige: cronograma, mano de obra por especialidad, herramientas certificadas, equipos con calibración vigente, EPP por tipo de riesgo, AST/PTW obligatorio por actividad crítica.

### 3.3 Programación/agenda/dispatch
Un FSM profesional tiene: calendario de técnicos, asignación por geolocalización, conflictos de agenda, alertas de sobre-asignación.

### 3.4 Asignación de técnicos y cuadrillas
Un FSM profesional asigna: técnico líder, cuadrilla completa, certificaciones requeridas, horas estimadas.

### 3.5 Activos, flota, herramientas, inventario
Un EAM profesional tiene: ficha técnica, documentos obligatorios, fotos, historial de asignaciones, checkout/checkin, kilometraje, combustible, mantenimiento preventivo, alertas de vencimiento, bloqueo por documentos vencidos.

### 3.6 Evidencias fotográficas con metadatos
Un sistema profesional exige: foto con geolocalización, timestamp, hash, relación con orden/paso/componente, galería por orden, galería por informe, exportación.

### 3.7 Checklists dinámicos por tipo de servicio
Un CMMS profesional tiene: templates por actividad, versión, ítems con foto, firma por checklist, conforme/no conforme/NA, peso por ítem, score automático.

### 3.8 Formularios versionados
Un ERP profesional permite: constructor de formularios, tipos de campo, validaciones, publicación, versionado, respuestas con trazabilidad.

### 3.9 Operación offline
Un SaaS de campo EXIGE: operación sin conexión, cola de sync, detección de conflictos, resolución, estado visible.

### 3.10 Sincronización con conflictos
Un sistema profesional tiene: detección de conflictos por versión, resolución manual o automática, DLQ, reintentos, auditoría de sync.

### 3.11 Firma de técnico, supervisor y cliente
Un sistema profesional tiene: firma digital en dispositivo, captura offline, sincronización, relación con orden y acta.

### 3.12 Informes automáticos
Un sistema profesional genera: PDF automático al completar ejecución, datos de orden, evidencias seleccionables, firmas, observaciones, hallazgos, acciones correctivas.

### 3.13 Actas de entrega
Un sistema profesional tiene: plantilla de acta, datos de orden, fotos, firmas, control de versiones, PDF descargable.

### 3.14 SES/Ariba
Un sistema profesional integra: SES con datos de orden, aprobación por RBAC, referencia Ariba, alertas de retraso.

### 3.15 Factura
Un sistema profesional emite: factura desde SES aprobada, validación de montos, alertas de vencimiento.

### 3.16 Pago
Un sistema profesional registra: pago, conciliación, referencia, cierre administrativo.

### 3.17 Costos reales
Un ERP profesional calcula: mano de obra, materiales, herramientas, equipos, transporte, impuestos, indirectos. Compara con propuesta.

### 3.18 Rentabilidad
Un ERP profesional reporta: margen por orden, margen por cliente, desviación, alertas de sobrecosto.

### 3.19 Dashboard de cuellos de botella
Un sistema profesional tiene: KPIs en tiempo real, órdenes atrasadas, SES pendientes, facturas vencidas, costos desviados, cumplimiento documental.

### 3.20 Alertas y notificaciones
Un sistema profesional notifica: vencimientos, bloqueos, cambios de estado, asignaciones, aprobaciones requeridas.

### 3.21 Auditoría forense
Un sistema profesional registra: cada acción crítica con usuario, timestamp, entidad, cambio, requestId, IP.

### 3.22 Portal cliente
Un sistema profesional ofrece: consulta de órdenes, evidencias, informes, facturas, firma digital.

### 3.23 Histórico descargable
Un sistema profesional permite: exportar por cliente, por orden, por mes, ZIP con PDFs, CSV, evidencias.

### 3.24 Backups
Un sistema profesional tiene: backup automático diario, retención configurable, restauración probada.

### 3.25 Reportes gerenciales
Un sistema profesional produce: reportes por período, por cliente, por servicio, por técnico, por rentabilidad.

### 3.26 Seguridad RBAC
Un sistema profesional tiene: 8+ roles, permisos granulares, defensa en profundidad, proxy/frontend + backend + DB.

### 3.27 Integración documental
Un sistema profesional conecta: documentos, fotos, firmas, informes, actas, SES, facturas en un solo expediente digital.

### 3.28 Preparación VPS
Un sistema profesional se despliega en: Docker, PM2, Nginx, HTTPS, monitoreo, scripts de rollback.

---

## 4. Matriz de Madurez CERMONT vs Software Profesional

| Capacidad profesional | Qué hace FSM/CMMS/ERP profesional | Estado CERMONT | Evidencia código | Brecha | Acción requerida | Sprint |
|---|---|---|---|---|---|---|
| Work orders ciclo completo | Crear, asignar, ejecutar, documentar, facturar, cerrar | PARCIAL | Order.ts model, order service, order routes | UI tiene kanban pero falta trazabilidad visual de ciclo | Agregar timeline visual de estados | S2 |
| Service cases multi-step | Caso con 14 pasos secuenciales, bloqueos, herencia | EXISTE EN DOMAIN | operational-steps.ts, service-case-step-context.schema.ts | Backend y schema existen pero UI cockpit limitada | Madurar CockpitPanel con timeline real | S2 |
| Planning con recursos | Cronograma, MO, herramientas, equipos, EPP, certificaciones, AST, PTW | SCHEMA RICO / UI POBRE | planning-packet.schema.ts (28+ campos) pero planning UI solo ReadinessGate | Schema vasto y backend completo pero UI invisible | Construir PlanningWizard profesional | S2 |
| Dispatch | Calendario técnicos, geolocalización, conflictos | NO EXISTE | dispatch.schema.ts existe pero UI no | Schema existe pero no se usa | Construir dispatch UI | S2 |
| Crew assignment | Asignar técnicos+cuadrilla con certificaciones | PARCIAL | CrewMemberSchema en planning-packet | No hay selector de personas desde DB | Agregar UserPicker component | S2 |
| Tools | Inventario herramientas, asignación, calibración | PARCIAL | tool.schema.ts, Tool.ts model | No hay UI de inventario ni asignación | Construir tool inventory UI | S2 |
| Equipment | Equipos con certificaciones, calibración | PARCIAL | equipment.schema.ts en planning-packet | No hay UI selección equipos | Agregar EquipmentPicker | S2 |
| Fleet | Ficha técnica, documentos, fotos, mantenimiento, asignaciones, checkout/checkin | BACKEND COMPLETO / UI PARCIAL | fleet.service.ts (502 líneas) con checkout/checkin/historial/fotos | Backend tiene todo; UI falta checkout/checkin, mantenimiento | Sprint 1 completo | S1 |
| Inventory | Inventario materiales, consumibles, repuestos | PARCIAL | inventory-item.schema.ts | No hay UI de inventario con stock | Construir inventory UI | S7 |
| Assets | Activos con ciclo de vida | PARCIAL | asset.schema.ts | No hay UI de activos | Construir asset management UI | S1 |
| Certifications | Certificaciones de equipos y personal | EXISTE EN SCHEMA | RequiredCertificationSchema en planning-packet | No se verifican en UI | Agregar certification check | S2 |
| AST/PTW | Análisis seguro / permiso trabajo | EXISTE EN SCHEMA | SupportDocumentSchema con ast/ptw en planning-packet | No hay UI obligatoria previa a ejecución | Agregar AST/PTW gate | S2 |
| Checklists dinámicos | Templates por actividad, versionado, ítems con foto/firma | PARCIAL | checklist.schema.ts, dynamic-form-template.schema.ts | Constructor no existe | Sprint 10 | S10 |
| Dynamic forms | Constructor, tipos campo, validaciones, versiones | SCHEMA EXISTE | dynamic-form-template.schema.ts, form-submission.schema.ts | Constructor UI no existe | Sprint 10 | S10 |
| Field execution | Sesión campo, checklists, fotos, firma, materiales, horas, incidentes | PARCIAL | execution-session.schema.ts, execution.ts (223 líneas domain) | UI execution existe pero offline no probado | Sprint 3 | S3 |
| Offline mode | Operación sin conexión, cola sync, conflictos | PARCIAL | offline-queue.ts, queueStore.ts, service-worker.js | No probado como flujo real E2E | Sprint 3 | S3 |
| Evidence photos | Foto con metadatos, geolocalización, hash, galería | PARCIAL | evidence.schema.ts, evidence-collection.schema.ts | UI sube fotos pero no tiene galería profesional | Sprint 4 | S4 |
| File attachments | Documentos múltiples, tipos MIME, versiones | PARCIAL | document-attachment.schema.ts, FileAsset model | No hay gestor documental profesional | Sprint 4 | S4 |
| Signatures | Firma técnico, supervisor, cliente digital | PARCIAL | client-signature.schema.ts, execution-signature.schema.ts | No hay flujo de firmas completo | Sprint 5 | S5 |
| Technical reports | PDF automático con datos, fotos, firmas | PARCIAL | technical-report.schema.ts, Report.ts model | No hay generación automática post-ejecución | Sprint 5 | S5 |
| Delivery records | Acta entrega con datos, fotos, firmas | PARCIAL | delivery-record.schema.ts | No hay wizard de acta | Sprint 5 | S5 |
| SES | Service Entry Sheet con aprobación | PARCIAL | service-entry-sheet.schema.ts | Falta trazabilidad UI | Sprint 6 | S6 |
| Invoices | Factura desde SES, aprobación, alertas | PARCIAL | invoice.schema.ts, invoice-approval.schema.ts | Falta UI integrada | Sprint 6 | S6 |
| Payments | Pago, conciliación, cierre | PARCIAL | payment.schema.ts | Falta cierre administrativo en UI | Sprint 6 | S6 |
| Real costs | Costos MO, materiales, herramientas, equipos | PARCIAL | cost.schema.ts, cost-traceability.schema.ts | Falta dashboard comparativo | Sprint 7 | S7 |
| Profitability | Margen por orden, desviación | NO EXISTE | cost.schema.ts, proposal.schema.ts | No hay cálculo en UI | Sprint 7 | S7 |
| Dashboard KPIs | KPIs reales, cuellos de botella, alertas | PARCIAL | dashboard-summary.schema.ts, kpi.schema.ts | KPIs desconectados de backend | Sprint 8 | S8 |
| SLA | Acuerdos de nivel de servicio | SCHEMA EXISTE | sla.schema.ts | No implementado en UI | Sprint 8 | S8 |
| Notifications | Alertas por evento, preferencias, canales | PARCIAL | notification.schema.ts, notification-preference.schema.ts | No hay alertas predictivas | Sprint 8 | S8 |
| Customer portal | Autoservicio cliente, consultas, descargas, firma | PARCIAL | portal/ module existe | No verificado funcionalmente | Sprint 9 | S9 |
| Backups | Backup automático, retención, restauración | NO VERIFICADO | admin-backup/ module existe | No se sabe si funciona | Sprint 11 | S11 |
| Historical archive | Archivado mensual, ZIP, CSV, PDF | NO EXISTE | No hay módulo | No implementado | Sprint 11 | S11 |
| Audit forense | Traza completa por acción crítica | EXISTE | AuditLog model, audit.service.ts | Auditoría implementada pero faltan eventos en UI | Sprint 11 | S11 |
| RBAC | 8 roles, permisos granulares, defensa en profundidad | EXISTE | rbac.ts, permissions.ts, roles.ts en domain | Bien implementado | Mantener | — |
| VPS readiness | Docker, PM2, Nginx, HTTPS, monitoreo | PARCIAL | docker/ directory, deploy scripts | No validado como flujo | Sprint 12 | S12 |

---

## 5. Auditoría del Repositorio por Módulos

### 5.1 Módulos Backend (59 módulos)

| Módulo | Estado | Problemas |
|--------|--------|-----------|
| admin-backup | EXISTE | No verificado funcionalmente |
| ai | EXISTE | Schema existe, no verificado |
| analytics-report | EXISTE | No verificado funcionalmente |
| analytics | EXISTE | No verificado |
| asset | EXISTE | UI limitada |
| audit | EXISTE | Bien implementado con AuditLog |
| auth | COMPLETO | JWT, refresh, cookies HttpOnly |
| automation | EXISTE | No verificado |
| business-document | EXISTE | No verificado |
| checklist | EXISTE | Schema completo, UI pendiente |
| client-signature | EXISTE | Firma digital, UI pendiente |
| client | EXISTE | CRUD básico |
| cockpit | EXISTE | Service case cockpit |
| cost | EXISTE | Múltiples schemas de costo |
| custom-fields | EXISTE | No verificado |
| dashboard | EXISTE | KPIs, pendiente conexión real |
| delivery-record | EXISTE | Acta de entrega |
| dian | EXISTE | DIAN integration |
| dispatch | EXISTE | Schema existe, UI pendiente |
| documents | EXISTE | Documentos adjuntos |
| erp-connector | EXISTE | No verificado |
| evidence | EXISTE | Evidencias, UI pendiente |
| execution-session | EXISTE | Ejecución campo |
| files | EXISTE | File assets completo |
| fleet | COMPLETO (backend) | 502 líneas service con todo: CRUD, fotos, primary photo, asignación, checkout, checkin, historial, alertas, auditoría |
| form-submissions | EXISTE | No verificado |
| inspection | EXISTE | No verificado |
| inventory | EXISTE | No verificado |
| invoice | EXISTE | Facturas |
| jobs | EXISTE | No verificado |
| kit | EXISTE | Kits de herramientas |
| kpi | EXISTE | KPIs |
| maintenance | EXISTE | Mantenimiento |
| notification-preferences | EXISTE | No verificado |
| notifications | EXISTE | Notificaciones |
| observability | EXISTE | Health checks |
| order | COMPLETO | Órdenes de trabajo |
| payment | EXISTE | Pagos |
| planning-packet | COMPLETO (backend) | Planning con readiness service |
| portal | EXISTE | Portal cliente |
| privacy-requests | EXISTE | No verificado |
| proposal | EXISTE | Propuestas |
| purchase-order | EXISTE | PO |
| qr | EXISTE | QR codes |
| report | EXISTE | Reportes |
| resource | EXISTE | Recursos |
| safety-analysis | EXISTE | AST |
| service-cases | EXISTE | Casos |
| service-entry-sheet | EXISTE | SES |
| site-visit | EXISTE | Visitas |
| sla | EXISTE | SLA |
| sync | EXISTE | Sincronización |
| system-config | EXISTE | Config |
| technical-report | EXISTE | Informes |
| template-draft | EXISTE | No verificado |
| template-response | EXISTE | No verificado |
| tool | EXISTE | Herramientas |
| user | COMPLETO | Usuarios |
| work-requests | EXISTE | Solicitudes |

### 5.2 Módulos Frontend (48 módulos)

| Módulo | Estado | Problemas |
|--------|--------|-----------|
| analytics-report | EXISTE | No verificado |
| audit | EXISTE | No verificado |
| auth | COMPLETO | Login, register |
| automation | EXISTE | No verificado |
| billing | EXISTE | Facturación |
| business-documents | EXISTE | No verificado |
| checklists | EXISTE | UI básica |
| cockpit | EXISTE | Service case cockpit |
| consents | EXISTE | No verificado |
| core | COMPLETO | Layout, header, sidebar |
| costs | EXISTE | Costos UI |
| custom-fields | EXISTE | No verificado |
| customers | EXISTE | Clientes |
| dashboard | EXISTE | Dashboard UI |
| dispatch | EXISTE | No verificado |
| documents | EXISTE | Documentos |
| erp-connector | EXISTE | No verificado |
| evidences | EXISTE | Evidencias UI |
| execution | EXISTE | Ejecución UI |
| field-execution | EXISTE | Ejecución campo |
| files | EXISTE | Archivos |
| fleet | PARCIAL | 6 componentes pero falta checkout/checkin UI |
| forms | EXISTE | Formularios |
| inventory | EXISTE | Inventario |
| invoices | EXISTE | Facturas |
| kits | EXISTE | Kits |
| maintenance | EXISTE | Mantenimiento |
| media | EXISTE | No verificado |
| notifications | EXISTE | Notificaciones |
| offline | EXISTE | Offline |
| orders | COMPLETO | Órdenes con kanban |
| planning | POBRE | Solo ReadinessGate, schema rico no explotado |
| portal | EXISTE | Portal cliente |
| privacy-requests | EXISTE | No verificado |
| proposals | EXISTE | Propuestas |
| purchase-orders | EXISTE | PO |
| reports | EXISTE | Reportes |
| resources | EXISTE | Recursos |
| safety-analysis | EXISTE | AST |
| service-cases | EXISTE | Casos |
| signatures | EXISTE | Firmas |
| site-visits | EXISTE | Visitas |
| sla | EXISTE | SLA |
| system-config | EXISTE | Config |
| templates | EXISTE | Templates |
| users | EXISTE | Usuarios |
| work-requests | EXISTE | Solicitudes |
| workflow | EXISTE | Workflow |

---

## 6. Auditoría por Páginas Visibles

Rutas revisadas en `frontend/src/app/(dashboard)/`:

| Ruta | Existe | Estado visual | Estado funcional | Datos reales | Acciones reales | Formularios | Evidencias | Integración 14 pasos | Problemas | Sprint |
|------|--------|--------------|-----------------|-------------|----------------|-------------|------------|---------------------|-----------|--------|
| /dashboard | ✅ | Bueno | PARCIAL | KPIs parciales | Navegación | No aplica | No aplica | No | KPIs desconectados de backend real | S8 |
| /fleet | ✅ | Bueno | PARCIAL | Vehículos listados | Crear, ver detalle | NewVehicleDrawer | FleetPhotoGallery | No | Falta checkout/checkin, mantenimiento, alertas | S1 |
| /fleet/[id] | ✅ | Bueno | PARCIAL | Detalle vehículo | Documentos, fotos | VehicleDocumentsTab | FleetPhotoGallery | No | Falta historial asignaciones, mantenimiento, alertas | S1 |
| /orders | ✅ | Bueno | BUENO | Órdenes listadas | CRUD, kanban | Formulario orden | No aplica | Parcial | Flujo hasta planning | S2 |
| /orders/[id] | ✅ | Bueno | BUENO | Detalle orden | Estados, documentos | Formulario | No aplica | Parcial | Timeline de pasos | S2 |
| /orders/[id]/planning | ✅ | Regular | POBRE | Planning packet | Readiness check | ReadinessGate | No | Pasos 5-6 | Solo readiness, no wizard completo | S2 |
| /service-cases | ✅ | Bueno | PARCIAL | Casos listados | CRUD | No aplica | No aplica | Sí | Falta cockpit completo | S2 |
| /service-cases/[id] | ✅ | Bueno | PARCIAL | Detalle caso | Navegación pasos | No aplica | No aplica | Sí | Timeline pasos básico | S2 |
| /service-cases/[id]/cockpit | ✅ | Bueno | PARCIAL | Cockpit pasos | Ver estado | No aplica | No aplica | Sí | Falta timeline visual profesional | S2 |
| /planning | ❌ | — | — | — | — | — | — | — | Ruta planning existe pero /planning no como página independiente | S2 |
| /execution | ✅ | Bueno | PARCIAL | Sesiones | Iniciar, completar | Checklist | Evidencias | Pasos 6-7 | Offline no probado | S3 |
| /execution-sessions/[id] | ✅ | Regular | PARCIAL | Sesión detalle | CheckList, fotos | Formulario | Evidencias | Paso 6 | Falta offline real | S3 |
| /evidences | ✅ | Regular | PARCIAL | Evidencias listadas | Ver, subir | Upload | Sí | Paso 7 | Galería básica, sin metadatos | S4 |
| /reports | ✅ | Regular | PARCIAL | Reportes listados | Ver, crear | Formulario | No | Paso 8 | Sin generación automática PDF | S5 |
| /reports/[id] | ✅ | Regular | PARCIAL | Detalle reporte | Editar | Formulario | No | Paso 8 | Sin fotos seleccionables | S5 |
| /delivery-records | ✅ | Regular | PARCIAL | Actas listadas | Ver, crear | Formulario | No | Paso 9 | Sin wizard de acta profesional | S5 |
| /billing/ses | ✅ | Regular | PARCIAL | SES listados | Ver, crear | Formulario | No | Paso 11 | Sin trazabilidad hasta factura | S6 |
| /billing/invoices | ✅ | Regular | PARCIAL | Facturas listadas | Ver, crear | Formulario | No | Paso 12 | Sin alertas de vencimiento | S6 |
| /payments | ✅ | Regular | PARCIAL | Pagos listados | Registrar | Formulario | No | Paso 14 | Sin dashboard de cobranza | S6 |
| /costs | ✅ | Regular | PARCIAL | Costos listados | Ver | Tabla | No | No | Sin comparación propuesta vs real | S7 |
| /costs/[orderId] | ✅ | Regular | PARCIAL | Costos por orden | Ver | Tabla | No | No | Sin desviación ni rentabilidad | S7 |
| /resources/kits | ✅ | Regular | PARCIAL | Kits listados | CRUD | Formulario | No | Paso 5 | No conectado a planning | S2 |
| /forms | ✅ | Regular | PARCIAL | Forms listados | No verificado | — | — | No | Forms dinámicos no implementados | S10 |
| /forms/[templateId] | ✅ | Regular | PARCIAL | Template detalle | No verificado | — | — | No | Constructor no existe | S10 |
| /notifications | ❌ | — | — | — | — | — | — | — | Ruta no encontrada en (dashboard) | S8 |
| /portal | ❌ | — | — | — | — | — | — | — | No verificado si existe como ruta separada | S9 |
| /admin/backups | ❌ | — | — | — | — | — | — | — | No verificado | S11 |
| /admin/audit | ❌ | — | — | — | — | — | — | — | No verificado | S11 |

---

## 7. Auditoría del Flujo de 14 Pasos

El flujo de 14 pasos está definido en `packages/domain/src/operational-steps.ts` (324 líneas). Cada paso tiene: stepNumber, key, canonicalCode, label, entityName, requiresEvidence, requiresDocuments, preconditions, nextActions, allowedRoles.

**Estado por paso:**

| # | Paso | Schema | Backend | Frontend | UI funcional | Datos reales | Bloqueos | E2E |
|---|------|--------|---------|----------|-------------|-------------|----------|-----|
| 1 | Solicitud servicio | work-request.schema.ts | work-requests/ module | work-requests/ page | ✅ | ✅ | ✅ No | ❌ |
| 2 | Visita técnica | site-visit.schema.ts | site-visit/ module | site-visits/ page | ✅ | ✅ | ✅ No | ❌ |
| 3 | Propuesta | proposal.schema.ts | proposal/ module | proposals/ page | ✅ | ✅ | ✅ No | ❌ |
| 4 | PO | purchase-order-authorization.schema.ts | purchase-order/ module | purchase-orders/ page | ✅ | ✅ | ✅ No | ❌ |
| 5 | Planeación | planning-packet.schema.ts | planning-packet/ module | planning/ page | ❌ Pobre | ❌ Parcial | ✅ No | ❌ |
| 6 | Ejecución | execution-session.schema.ts | execution-session/ module | execution/ page | ✅ | ✅ | ✅ No | ❌ |
| 7 | Evidencia | evidence.schema.ts | evidence/ module | evidences/ page | ✅ | ✅ | ✅ No | ❌ |
| 8 | Informe técnico | technical-report.schema.ts | technical-report/ module | reports/ page | ✅ | ✅ | ✅ No | ❌ |
| 9 | Acta entrega | delivery-record.schema.ts | delivery-record/ module | delivery-records/ page | ✅ | ✅ | ✅ No | ❌ |
| 10 | Firma cliente | client-signature.schema.ts | client-signature/ module | signatures/ page | ✅ | ✅ | ✅ No | ❌ |
| 11 | SES | service-entry-sheet.schema.ts | service-entry-sheet/ module | billing/ses page | ✅ | ✅ | ✅ No | ❌ |
| 12 | Factura | invoice.schema.ts | invoice/ module | billing/invoices page | ✅ | ✅ | ✅ No | ❌ |
| 13 | Aprobación factura | invoice-approval.schema.ts | invoice/ module | billing/invoices page | ✅ | ✅ | ✅ No | ❌ |
| 14 | Pago | payment.schema.ts | payment/ module | payments/ page | ✅ | ✅ | ✅ No | ❌ |

**Problemas detectados:**
- Cada paso existe como módulo independiente pero NO hay un flujo integrado que guíe al usuario paso a paso
- No hay un "wizard" o "stepper" que muestre: paso actual, pasos completados, pasos bloqueados
- Los bloqueos entre pasos existen en domain (preconditions) pero NO se reflejan en UI
- No hay prueba E2E que cubra el flujo completo de 14 pasos
- No hay datos seed que permitan recorrer los 14 pasos

---

## 8. Auditoría de Formularios

### 8.1 NewVehicleDrawer (Fleet)
**Archivo:** `frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx`
**Problemas confirmados:**
- Usa schema local `DrawerFormSchema` en vez de `CreateVehicleSchema` desde shared-types
- Usa `Record<string, unknown>` en la firma de useForm (línea 71)
- Usa `as unknown as Resolver<...>` (línea 72-75) — cast con unknown
- No permite carga de fotos durante creación
- No permite adjuntar documentos (SOAT/tecnomecánica/póliza) como archivos, solo texto de fecha
- No permite asignar conductor desde lista real de usuarios (solo campo texto)
- No permite crear mantenimiento inicial
- No conecta vehículo a órdenes o planeación
- No contempla revisión preoperacional

### 8.2 Planning UI
**Archivo:** `frontend/src/modules/planning/ui/ReadinessGate.tsx`
**Problemas:**
- Único componente de planning en UI
- No hay wizard para crear planning packet completo
- No hay UI para: cronograma, crew, herramientas, equipos, EPP, certificaciones, AST, PTW, documentos de apoyo, responsables, firmas, cost baseline
- El schema planning-packet tiene 28+ campos pero UI solo expone readiness

### 8.3 Formularios en general
**Problemas detectados:**
- Muchos formularios son tablas básicas sin validación de negocio
- Falta wizard-type multi-paso para procesos complejos (planning, execution, SES)
- Falta carga de archivos integrada en formularios de creación
- Falta selector de usuarios desde DB (la mayoría usa campos de texto)
- Falta selector de equipos/herramientas desde inventario

---

## 9. Auditoría de Evidencias, Imágenes y Archivos

### 9.1 Evidence Module
**Archivos:**
- `packages/shared-types/src/schemas/evidence.schema.ts`
- `packages/shared-types/src/schemas/evidence-collection.schema.ts`
- `packages/shared-types/src/schemas/execution-evidence.schema.ts`
- `backend/src/modules/evidence/`
- `frontend/src/modules/evidences/`

**Problemas:**
- No hay galería profesional con thumbnails, metadatos (geolocalización, timestamp, hash)
- No hay selección múltiple para subida
- No hay relación visual entre evidencia y paso del flujo
- No hay exportación a PDF de galería
- No hay control de versiones
- No hay integración con informes (seleccionar fotos para incluir)

### 9.2 Fleet Photos
**Archivo:** `frontend/src/modules/fleet/ui/FleetPhotoGallery.tsx`
**Problemas:**
- Galería básica sin metadatos
- No permite tomar foto desde cámara
- No permite geolocalización

### 9.3 File Assets
**Archivo:** `backend/src/modules/files/files.service.ts`
**Estado:** Backend completo para subida, almacenamiento, soft delete, primary photo
**Problema:** UI no explota todo el potencial del file service

---

## 10. Auditoría de Planeación, Kits, AST y Checklists

### 10.1 Planning Packet
**Schema:** `packages/shared-types/src/schemas/planning-packet.schema.ts` (389 líneas)
**Backend:** `backend/src/modules/planning-packet/` con:
- planning-packet.service.ts
- planning-packet.controller.ts
- planning-packet.routes.ts
- planning-readiness.service.ts

**Frontend:** `frontend/src/modules/planning/` con:
- queries.ts
- ui/ReadinessGate.tsx
- ui/__tests__/

**Brecha:** Schema de 28+ campos, backend completo, pero UI solo expone un ReadinessGate.

**Campos del schema NO explotados en UI:**
1. schedule (plannedStartAt, plannedEndAt, estimatedDurationHours)
2. crew (array de CrewMember con userId, name, role, certificationIds)
3. materials (array de PlanningResourceLine con description, quantity, unit)
4. tools (array de PlanningTool con name, quantity, available, specifications)
5. equipment (array de PlanningEquipment con equipmentId, name, quantity, certificateRequired)
6. safetyElements (array de PlanningResourceLine)
7. workerRequirements (electricistas, tecnicosTelecomunicacion, etc.)
8. responsibles (array de PlanningResponsible con role, userId, status, signedAt)
9. requiredCertifications (array con certificationId, name, requiredForRoles, verified)
10. supportDocuments (array con documentId, name, url, documentType: ast/ptw/ats/etc.)
11. readinessChecklist (array de ReadinessCheckItem)
12. blockers (array de DomainBlocker)
13. costBaselineSnapshot (frozenAt, frozenBy, laborCosts, materialCosts, equipmentCosts, totalBudget)
14. astRequired, ptwRequired (booleanos que deberían activar UI obligatoria)
15. approval (approvedBy, approvedAt, approvalNotes)
16. reopen (reopenedBy, reopenedAt, reopenReason)

### 10.2 Kits
**Schema:** `packages/shared-types/src/schemas/kit.schema.ts`
**Estado:** CRUD básico pero no conectado a planning (autofill)

### 10.3 AST
**Schema:** `packages/shared-types/src/schemas/safety-analysis.schema.ts`
**Estado:** Existe pero no integrado como gate obligatorio

### 10.4 Checklists
**Schema:** `packages/shared-types/src/schemas/checklist.schema.ts`
**Estado:** Existe pero constructor de checklists no implementado

---

## 11. Auditoría de Flota, Activos, Herramientas e Inventario

### 11.1 Fleet (Hallazgos A, B, C)

**Backend (fleet.service.ts - 502 líneas) — COMPLETO:**
- createVehicle: crea vehículo con validación de placa duplicada
- listVehicles: paginación, filtros por status/type
- getVehicleById: detalle
- updateVehicle: actualiza con validación de documentos vencidos para asignación
- getExpiringDocuments: alertas de SOAT/tecnomecánica/póliza próximos a vencer
- listVehiclePhotos: lista fotos asociadas al vehículo
- uploadVehiclePhoto: sube foto y establece como primary si es la primera
- setPrimaryVehiclePhoto: cambia foto principal
- deleteVehiclePhoto: elimina con soft delete y reasigna primary
- assignVehicle: asigna conductor con validación de documentos vencidos
- checkoutVehicle: registro de salida con kilometraje, combustible, fotos
- checkinVehicle: registro de entrada con validación de kilometraje
- getVehicleAssignmentHistory: historial completo de asignaciones
- getActiveAssignment: asignación activa actual

**Frontend (6 componentes):**
- VehicleCard.tsx — tarjeta de vehículo en listado
- NewVehicleDrawer.tsx — formulario de creación (con problemas)
- FleetPhotoGallery.tsx — galería de fotos
- VehicleDocumentsTab.tsx — pestaña de documentos
- VehicleAssignmentPanel.tsx — panel de asignación
- FleetReadinessBadge.tsx — badge de readiness

**Frontend — API:**
- fleet-api.ts — consume endpoints backend

**Frontend — Hooks:**
- useFleetPhotos.ts — hook para fotos

**LO QUE FALTA EN UI:**
1. Checkout/checkin flow: backend tiene service completo pero UI no tiene wizard
2. VehicleAssignmentHistory: backend devuelve historial pero UI no lo muestra en /fleet/[id]
3. Vehicle maintenance: no hay UI para registrar mantenimiento
4. Document alerts: backend calcula documentos próximos a vencer pero UI no muestra alertas en dashboard
5. Driver assignment from real user list: NewVehicleDrawer usa campo texto, no selector desde DB
6. Photo upload during creation: no disponible en NewVehicleDrawer
7. Connection to orders: no se puede ver en qué órdenes se usó un vehículo

### 11.2 Assets
**Schema:** `packages/shared-types/src/schemas/asset.schema.ts`
**Estado:** Schema existe, backend asset module existe, UI assets page existe
**Problema:** UI básica, falta ficha técnica completa

### 11.3 Tools
**Schema:** `packages/shared-types/src/schemas/tool.schema.ts`
**Estado:** Schema existe, backend tool module existe
**Problema:** No hay UI de inventario profesional

### 11.4 Inventory
**Schema:** `packages/shared-types/src/schemas/inventory-item.schema.ts`
**Estado:** Schema existe, backend inventory module existe
**Problema:** No hay UI de control de stock

---

## 12. Auditoría de Ejecución en Campo y Offline

### 12.1 Execution Session
**Domain rules:** `packages/domain/src/execution.ts` (223 líneas) con:
- ExecutionSessionStatus (7 estados)
- ExecutionBlockerCode (12 códigos)
- ExecutionNextActionCode (10 acciones)
- canCreateExecutionSession, canStartExecution, canPauseExecution, canResumeExecution, canCancelExecution, canCompleteExecution
- calculateExecutionBlockers, calculateExecutionNextActions
- validateExecutionCommandIdempotency
- mergeMaterialUsage, mergeLaborEntries
- validateRequiredChecklistResponses, validateRequiredEvidence, validateRequiredSignatures

**Problemas:**
- UI no explota todas las reglas de domain
- Offline queue existe pero no probado como flujo real
- No hay estado de sync visible en UI de execution
- No hay resolución de conflictos en UI

### 12.2 Offline Module
**Archivos:**
- `frontend/src/lib/pwa/offline-queue.ts`
- `frontend/src/store/queueStore.ts`
- `frontend/public/service-worker.js`
- `frontend/src/modules/offline/`

**Problemas:**
- No probado E2E con datos reales
- No hay indicador visual de cola de sincronización
- No hay manejo de conflictos en UI
- No se sabe si IndexedDB almacena correctamente las sesiones offline

---

## 13. Auditoría de Informes, Actas, SES, Facturas y Pagos

### 13.1 Technical Reports
**Schema:** `packages/shared-types/src/schemas/technical-report.schema.ts`
**Problemas:**
- No hay generación automática de PDF al completar ejecución
- No hay plantillas de informe seleccionables
- No hay selección de fotos para incluir
- No hay control de versiones

### 13.2 Delivery Records
**Schema:** `packages/shared-types/src/schemas/delivery-record.schema.ts`
**Problemas:**
- No hay wizard de acta profesional
- No hay integración con fotos y firmas
- No hay control de versiones

### 13.3 SES
**Schema:** `packages/shared-types/src/schemas/service-entry-sheet.schema.ts`
**Problemas:**
- No hay trazabilidad visual desde SES hasta factura
- No hay alertas de SES pendientes

### 13.4 Invoices
**Schema:** `packages/shared-types/src/schemas/invoice.schema.ts`, `invoice-approval.schema.ts`
**Problemas:**
- No hay dashboard de facturación
- No hay alertas de vencimiento

### 13.5 Payments
**Schema:** `packages/shared-types/src/schemas/payment.schema.ts`
**Problemas:**
- No hay dashboard de cobranza
- No hay cierre administrativo automático

---

## 14. Auditoría de Costos Reales y Rentabilidad

### 14.1 Cost Schemas (5 archivos)
- `cost.schema.ts`
- `cost-cart.schema.ts`
- `cost-suggest.schema.ts`
- `cost-traceability.schema.ts`
- `costControl.schema.ts`

**Problemas:**
- Schemas existen pero no hay UI que compare propuesta vs real
- No hay cálculo de rentabilidad por orden
- No hay dashboard de desviación de costos
- No hay alertas de sobrecosto

### 14.2 Domain Rules
**Archivo:** `packages/domain/src/cost.rules.ts`
**Problemas:** Reglas existen pero UI no las consume

---

## 15. Auditoría de Dashboard y KPIs

### 15.1 Dashboard Summary
**Schema:** `packages/shared-types/src/schemas/dashboard-summary.schema.ts`
**Problemas:**
- KPIs no conectados a backend real
- No hay datos de cuellos de botella
- No hay alertas visuales
- No hay indicadores de rendimiento por rol

### 15.2 KPI Module
**Schema:** `packages/shared-types/src/schemas/kpi.schema.ts`
**Problemas:**
- No hay KPIs de cumplimiento documental
- No hay KPIs de evidencias
- No hay KPIs de estado offline

---

## 16. Auditoría de Portal Cliente

### 16.1 Portal Module
**Archivos:**
- `backend/src/modules/portal/`
- `frontend/src/modules/portal/`

**Estado:** Existe backend y frontend pero no se ha verificado funcionalidad:

**Problemas potenciales (NO VERIFICADOS):**
- ¿El portal permite consulta de órdenes?
- ¿El portal permite descarga de informes?
- ¿El portal permite firma de actas?
- ¿El portal muestra estado de facturas?
- ¿El portal tiene historial de servicios?
- ¿El control de acceso por token funciona?

---

## 17. Auditoría de Seguridad, RBAC y Auditoría Forense

### 17.1 RBAC
**Archivos:**
- `packages/domain/src/rbac.ts`
- `packages/domain/src/permissions.ts`
- `packages/domain/src/roles.ts`

**Estado:** COMPLETO. 8 roles definidos, helpers de acceso, permisos por ruta.

### 17.2 Audit
**Archivos:**
- `backend/src/models/AuditLog.ts`
- `backend/src/modules/audit/audit.service.ts`

**Estado:** COMPLETO. Auditoría implementada con eventos críticos.

### 17.3 Seguridad perimetral
**Estado:** COMPLETO. Helmet, CORS, rate limiting, JWT, cookies HttpOnly, proxy.ts.

**Problemas:** No se ha verificado que todos los endpoints tengan RBAC. No se ha verificado rate limiting en producción.

---

## 18. Auditoría de Backend

### 18.1 Estructura general
- Express 5.2.1 con módulos feature-sliced
- 59 módulos en backend/src/modules/
- Cada módulo con routes/controller/service
- Modelos en backend/src/models/ (62 modelos)
- Middlewares compartidos (auth, validate, rate-limit)
- Common errors con AppError hierarchy

### 18.2 Problemas detectados
- Algunos servicios son muy grandes (ej: fleet.service.ts 502 líneas, podría dividirse)
- Algunos controllers pueden tener lógica que debería estar en service
- No se verificó que todos los endpoints tengan validateBody/validateQuery
- No se verificó cobertura de tests de integración

---

## 19. Auditoría de Frontend

### 19.1 Estructura general
- Next.js 16 App Router con 42+ rutas en (dashboard)
- 48 módulos feature-sliced
- TanStack Query para server state
- Zustand para client state
- React Hook Form + Zod para formularios

### 19.2 Problemas detectados
- Varios módulos con UI solo de listado (CRUD básico)
- Falta UI para flujos complejos (planning wizard, checkout/checkin wizard)
- Algunos formularios usan schemas locales en vez de shared-types
- No todos los componentes tienen todos los estados (loading, error, empty, forbidden, offline)

---

## 20. Auditoría de Shared-Types

### 20.1 Schemas (111 archivos)
**Cobertura:** Excelente. 111 schemas cubren prácticamente todas las entidades del negocio.

**Problemas:**
- Algunos schemas pueden estar desactualizados vs modelos Mongoose
- No se verificó que todos los schemas tengan Create y Update variants
- Algunos schemas pueden tener campos que el frontend no usa

---

## 21. Auditoría de Domain

### 21.1 Archivos (17)
- `billing.rules.ts` — Reglas de facturación
- `checklist.rules.ts` — Reglas de checklists
- `closure.rules.ts` — Reglas de cierre
- `cost.rules.ts` — Reglas de costos
- `execution.ts` — Reglas de ejecución (223 líneas)
- `fleet-readiness.rules.ts` — Readiness de flota (118 líneas)
- `index.ts` — Exportaciones
- `kit.rules.ts` — Reglas de kits
- `operational-steps.ts` — 14 pasos (324 líneas)
- `permissions.ts` — Permisos
- `planning.rules.ts` — Reglas de planeación (146 líneas)
- `rbac.ts` — RBAC
- `roles.ts` — Roles
- `spec-013-rules.ts` — Reglas spec-013
- `spec-015-rules.ts` — Reglas spec-015
- `workflow/` — Workflow

**Problemas:**
- Las reglas existen pero la UI no las consume en su mayoría
- execution.ts tiene reglas completas pero UI no muestra blockers
- planning.rules.ts tiene getPlanningBlockers pero UI no los usa
- fleet-readiness.rules.ts tiene evaluateFleetReadiness pero UI no lo integra en dashboard

---

## 22. Auditoría de Tests

### 22.1 Backend Tests
**Directorios:** `backend/tests/`
**Estado:** 508 tests pasando (según reportes previos)
**Problemas:**
- No se verificó cobertura por módulo
- No hay tests de integración para fleet checkout/checkin
- No hay tests para planning readiness service

### 22.2 Frontend Tests
**Directorios:** `frontend/tests/`
**Estado:** 289 tests pasando (según reportes previos)
**Problemas:**
- No hay tests E2E con Playwright
- No hay tests de componentes para fleet
- No hay tests de formularios

### 22.3 E2E Tests
**Estado:** NO EXISTEN. No hay pruebas de flujo completo con Playwright.
**Archivos:** `frontend/tests/e2e/` — no verificados

---

## 23. Lista de Malas Prácticas Detectadas

| # | Práctica | Archivo | Línea | Gravedad |
|---|----------|---------|-------|----------|
| 1 | Record<string, unknown> en form type | frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx | 71 | Alta |
| 2 | Cast as unknown as Resolver | frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx | 72-75 | Alta |
| 3 | Schema local duplicado en vez de shared-types | frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx | 18-29 | Alta |
| 4 | require() en vez de import | backend/src/modules/fleet/fleet.service.ts | 361 | Media |
| 5 | vehicle.driverId = undefined | backend/src/modules/fleet/fleet.service.ts | 472 | Media (viola zero undefined) |
| 6 | vehicle.driverName = undefined | backend/src/modules/fleet/fleet.service.ts | 473 | Media (viola zero undefined) |
| 7 | Planning UI con solo un componente | frontend/src/modules/planning/ui/ | — | Alta |
| 8 | Falta useRouter en páginas de planificación | — | — | Media |
| 9 | Posible duplicación de schemas entre shared-types y locales | Varios frontend modules | — | Alta |
| 10 | Falta de estados offline en UI de execution | — | — | Alta |

---

## 24. Lista de Duplicaciones Detectadas

| # | Duplicación | Archivos | Acción |
|---|-------------|----------|--------|
| 1 | Schema vehiculo duplicado localmente | NewVehicleDrawer.tsx vs shared-types vehicle.schema.ts | Eliminar local, usar shared-types |
| 2 | Posibles DTOs locales duplicados | Varios módulos frontend | Verificar con quality:dtos |
| 3 | Posibles enums de estado duplicados | Varios archivos | Centralizar en domain |

---

## 25. Lista de Contratos Infrautilizados

| # | Contrato | Dónde está | Por qué no se usa |
|---|----------|-----------|-------------------|
| 1 | planning-packet.schema.ts (28+ campos) | shared-types | UI planning solo tiene ReadinessGate |
| 2 | vehicle.schema.ts (VehicleCheckoutSchema) | shared-types | UI no tiene checkout wizard |
| 3 | vehicle.schema.ts (VehicleCheckinSchema) | shared-types | UI no tiene checkin wizard |
| 4 | vehicle.schema.ts (VehicleDocumentAlertSchema) | shared-types | UI no muestra alertas en dashboard |
| 5 | dashboard-summary.schema.ts | shared-types | KPIs no conectados a backend |
| 6 | cost-traceability.schema.ts | shared-types | No hay UI de trazabilidad de costos |
| 7 | service-case-step-context.schema.ts | shared-types | Cockpit no usa todo el contexto |
| 8 | dynamic-form-template.schema.ts | shared-types | Constructor no existe |
| 9 | dispatch.schema.ts | shared-types | Dispatch UI no implementada |
| 10 | sla.schema.ts | shared-types | SLA no implementado en UI |

---

## 26. Lista de Pantallas Superficiales

| # | Ruta | Problema | Gravedad |
|---|------|----------|----------|
| 1 | /planning | Solo tiene ReadinessGate, no el wizard completo | Crítica |
| 2 | /fleet/[id] | Falta historial asignaciones, mantenimiento, checkout/checkin | Alta |
| 3 | /fleet | Falta resumen de alertas documentales | Alta |
| 4 | /execution-sessions/[id] | Falta integración offline real | Alta |
| 5 | /evidences | Galería básica sin metadatos | Media |
| 6 | /reports | Sin generación automática PDF | Alta |
| 7 | /delivery-records | Sin wizard de acta profesional | Alta |
| 8 | /billing/ses | Sin trazabilidad visual | Media |
| 9 | /billing/invoices | Sin dashboard de facturación | Media |
| 10 | /costs | Sin comparación propuesta vs real | Alta |

---

## 27. Lista de Backend Existente No Expuesto en UI

| # | Funcionalidad backend | Endpoint/Función | UI faltante |
|---|----------------------|-----------------|-------------|
| 1 | Fleet checkout | fleet.service.ts checkoutVehicle | /fleet/[id] debería tener botón "Checkout" |
| 2 | Fleet checkin | fleet.service.ts checkinVehicle | /fleet/[id] debería tener botón "Checkin" |
| 3 | Fleet assignment history | fleet.service.ts getVehicleAssignmentHistory | /fleet/[id] debería mostrar historial |
| 4 | Fleet active assignment | fleet.service.ts getActiveAssignment | /fleet/[id] debería mostrar asignación activa |
| 5 | Fleet expiring documents | fleet.service.ts getExpiringDocuments | Dashboard debería mostrar alertas |
| 6 | Fleet photo upload | fleet.service.ts uploadVehiclePhoto | NewVehicleDrawer debería permitir fotos |
| 7 | Fleet primary photo | fleet.service.ts setPrimaryVehiclePhoto | FleetPhotoGallery debería permitir primary |
| 8 | Planning readiness report | planning-readiness.service.ts | /orders/[id]/planning debería mostrar reporte |
| 9 | Planning approve | planning-packet.service.ts | UI debería tener botón "Aprobar" |
| 10 | Planning reopen | planning-packet.service.ts | UI debería tener botón "Reabrir" |

---

## 28. Lista de UI Existente Sin Lógica Suficiente

| # | UI | Problema |
|---|----|----------|
| 1 | NewVehicleDrawer | Usa schema local, Record<string, unknown>, sin fotos, sin selector conductores |
| 2 | Planning ReadinessGate | Solo muestra readiness, no permite crear planning completo |
| 3 | FleetPhotoGallery | No permite set primary photo, no metadatos |
| 4 | Dashboard | KPIs desconectados de backend |
| 5 | Evidences list | Sin galería profesional |
| 6 | Reports list | Sin generación automática |

---

## 29. Modelo Objetivo de Producto

CERMONT v4 debe ser:

**Una plataforma documental y operativa para contratistas multiservicio que digitaliza el ciclo completo de trabajo: desde la solicitud del cliente hasta el pago, pasando por planeación profesional, ejecución en campo con soporte offline, evidencias con trazabilidad, informes automáticos, actas digitales, SES, facturación, control de costos reales y dashboard gerencial.**

### Atributos clave:
1. **Document-driven:** Cada paso produce documentos digitales (informes, actas, SES, facturas)
2. **Offline-first:** Ejecución en campo funciona sin conexión
3. **Mobile-first:** Diseñado para uso en campo desde dispositivo móvil
4. **Professional planning:** Planeación con cronograma, recursos, AST, PTW, checklists
5. **Asset management:** Flota, activos, herramientas, inventario con trazabilidad
6. **Evidence traceability:** Fotos con metadatos, relación con paso, galería exportable
7. **Automated reports:** Informes y actas generados automáticamente en PDF
8. **Cost control:** Costos reales vs presupuesto, rentabilidad por orden
9. **KPI dashboard:** Cuellos de botella visibles, alertas, cumplimiento
10. **Customer portal:** Autoservicio para clientes
11. **Auditable:** Cada acción crítica deja registro forense
12. **VPS-ready:** Docker, PM2, Nginx, HTTPS, backups, monitoreo

---

## 30. Arquitectura Funcional Objetivo

```
PORTAL CLIENTE
  ↓ (consulta, descarga, firma)
FRONTEND (Next.js 16)
  ├── Dashboard gerencial (KPIs reales, cuellos de botella)
  ├── Fleet/Assets (ficha técnica, documentos, fotos, mantenimiento, checkout/checkin)
  ├── Planning Wizard (cronograma, recursos, AST, PTW, checklists, cost baseline)
  ├── Execution (offline, checklists, fotos, firma, materiales, horas)
  ├── Evidence Gallery (metadatos, geolocalización, galería por orden)
  ├── Reports (generación automática PDF, plantillas, fotos seleccionables)
  ├── Delivery Records (acta digital, firma, PDF)
  ├── SES/Invoice/Payment (trazabilidad completa hasta pago)
  ├── Costs (propuesta vs real, desviación, rentabilidad)
  ├── Forms Builder (constructor, versionado, publicación)
  └── Admin (backups, auditoría, histórico)
  ↓
BACKEND (Express 5 + Mongoose)
  ├── 59 módulos feature-sliced
  ├── RBAC 8 roles
  ├── Auditoría forense
  ├── Offline sync con detección de conflictos
  ├── File assets con sharp
  ├── PDF generation con pdf-lib
  └── Rate limiting, helmet, CORS
  ↓
MONGODB
  ├── Colecciones por entidad
  ├── Índices optimizados
  ├── Audit log inmutable
  └── Backups automáticos
  ↓
VPS (Docker + PM2 + Nginx)
  ├── HTTPS con Let's Encrypt
  ├── Monitoreo disco, RAM, CPU
  ├── Scripts de backup y rollback
  └── Logs estructurados
```

---

## 31. Sprints Funcionales Visibles

El plan se divide en 12 sprints funcionales. Cada sprint produce cambios visibles en `localhost:3000`.

### Orden de ejecución:
1. **Sprint 1** — Fleet/Assets profesional
2. **Sprint 2** — Planning profesional + Cockpit 14 pasos
3. **Sprint 3** — Execution offline profesional
4. **Sprint 4** — Evidence/document management profesional
5. **Sprint 5** — Informes y actas profesionales
6. **Sprint 6** — SES, facturación y cierre administrativo
7. **Sprint 7** — Costos reales y rentabilidad
8. **Sprint 8** — Dashboard gerencial real
9. **Sprint 9** — Portal cliente
10. **Sprint 10** — Dynamic forms/checklists
11. **Sprint 11** — Backups/histórico/auditoría
12. **Sprint 12** — E2E flujo completo 14 pasos + VPS

---

## 32. Backlog Detallado por Sprint

Cada sprint contiene:
- Descripción del sprint
- Tickets detallados con archivos exactos
- Criterios de aceptación

### Sprint 1 — Fleet/Assets Profesional

**Objetivo empresarial:** Convertir el módulo Fleet de un CRUD básico a un sistema profesional de gestión de flota con ficha técnica completa, documentos, fotos, mantenimiento, asignaciones, checkout/checkin, alertas y bloqueos.

**Problema real que resuelve:** Los vehículos se asignan sin verificar documentos vencidos. No hay control de kilometraje, combustible ni mantenimiento preventivo. Las fotos del vehículo están dispersas.

**Falla CERMONT asociada:** Fallas 2 (ejecución sin herramientas), 8 (evidencias dispersas)

**Benchmark profesional:** Un EAM profesional tiene: ficha técnica, documentos obligatorios, fotos con primary photo, historial de asignaciones, checkout con kilometraje y combustible, checkin con verificación, mantenimiento preventivo, alertas de vencimiento, bloqueo por documentos vencidos.

**Estado actual verificado:**
- Backend: COMPLETO (fleet.service.ts con CRUD, fotos, primary photo, asignación, checkout, checkin, historial, alertas, auditoría)
- Schema: COMPLETO (vehicle.schema.ts con VehicleCheckoutSchema, VehicleCheckinSchema, VehicleAssignmentSchema, VehicleDocumentAlertSchema)
- Domain: COMPLETO (fleet-readiness.rules.ts con evaluateFleetReadiness)
- Frontend: PARCIAL (6 componentes: VehicleCard, NewVehicleDrawer, FleetPhotoGallery, VehicleDocumentsTab, VehicleAssignmentPanel, FleetReadinessBadge)

**Brecha:** Backend tiene checkout/checkin/historial/alertas pero UI no lo expone. NewVehicleDrawer usa schema local con Record<string, unknown>.

**Resultado esperado visible en localhost:**
- /fleet: lista vehículos con readiness badge (verde/rojo) y alertas documentales
- /fleet/[id]: detalle con fichas técnicas, fotos, documentos, historial asignaciones, botones checkout/checkin, mantenimiento
- Dashboard: alerta de documentos próximos a vencer
- NewVehicleDrawer: schema desde shared-types, sin Record<string, unknown>, con secciones de fotos, conductor desde DB

**Rutas afectadas:** /fleet, /fleet/[id], /dashboard

#### Ticket FLT-01: Refactorizar NewVehicleDrawer

**ID:** FLT-01
**Sprint:** 1
**Prioridad:** P1 (Alta)
**Título:** Refactorizar NewVehicleDrawer para usar shared-types, eliminar Record<string, unknown> y agregar secciones faltantes
**Tipo:** frontend
**Módulo:** fleet
**Ruta visible:** /fleet

**Problema:** NewVehicleDrawer usa schema local `DrawerFormSchema` en vez de `CreateVehicleSchema` desde shared-types. Usa `Record<string, unknown>` en form type. Usa cast `as unknown as Resolver`. No permite fotos iniciales, ni adjuntar documentos, ni asignar conductor desde lista real.

**Causa raíz:** Desarrollo apresurado sin seguir contract-first.

**Usuario afectado:** Operadores que registran vehículos nuevos.

**Valor empresarial:** Formulario robusto, sin tipos inseguros, con funcionalidad completa.

**Archivos exactos a abrir:**
- `frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx`
- `frontend/src/modules/fleet/queries.ts`
- `packages/shared-types/src/schemas/vehicle.schema.ts`

**Archivos exactos a modificar:**
- `frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx`

**Código o estructura esperada:**
- Eliminar `DrawerFormSchema` local
- Importar y usar `CreateVehicleSchema` desde `@cermont/shared-types`
- Eliminar `Record<string, unknown>` de useForm
- Eliminar cast `as unknown as Resolver`
- Agregar sección de fotos iniciales (usando react-dropzone)
- Agregar selector de conductor desde lista real de usuarios (fetch users con rol)
- Agregar upload de documentos SOAT/tecnomecánica/póliza como archivos adjuntos
- Transformar fechas a ISO antes de enviar

**Contrato requerido:** `CreateVehicleSchema` desde `@cermont/shared-types`

**Backend requerido:** Ya existe (fleet.service.ts createVehicle). Verificar que acepte fileAssets.

**Frontend requerido:**
- API: fleet-api.ts (ya existe)
- Hook: useCreateVehicle (ya existe en queries.ts)
- UI: NewVehicleDrawer refactorizado

**Estados UI:** Loading (submitting), Error (mutation error), Success (reset + close)

**Pruebas requeridas:**
- Test unitario del formulario con valores válidos e inválidos
- Test de transformación de fechas

**Validación manual:**
- Abrir /fleet, hacer clic en "Nuevo vehículo"
- Llenar formulario con datos válidos
- Verificar que se crea el vehículo
- Verificar que se puede adjuntar foto

**Comandos:**
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npx react-doctor@latest --verbose
```

**Criterio de aceptación:**
- No hay `Record<string, unknown>` en el componente
- No hay cast con unknown
- Schema importado desde shared-types
- Formulario permite subir fotos
- Conductor se selecciona de lista real
- Tests pasan
- React Doctor 100/100

**Qué NO hacer:**
- No modificar backend fleet.service.ts
- No modificar vehicle.schema.ts en shared-types
- No crear nuevos hooks si ya existen
- No instalar nuevas dependencias

**Dependencias:** Ninguna

**Evidencia requerida:** Screenshot del formulario funcional en localhost:3000/fleet

---

#### Ticket FLT-02: Exponer checkout/checkin en UI

**ID:** FLT-02
**Sprint:** 1
**Prioridad:** P1 (Alta)
**Título:** Agregar wizard de checkout y checkin en página de detalle de vehículo
**Tipo:** frontend
**Módulo:** fleet
**Ruta visible:** /fleet/[id]

**Problema:** Backend tiene checkoutVehicle, checkinVehicle, getActiveAssignment y getVehicleAssignmentHistory completamente implementados. Pero la UI /fleet/[id] no tiene botones ni formularios para estas acciones.

**Causa raíz:** Desarrollo backend-first sin frontend correspondiente.

**Usuario afectado:** Operadores que asignan y controlan vehículos en campo.

**Valor empresarial:** Control de kilometraje, combustible y tiempo de uso de vehículos.

**Archivos exactos a abrir:**
- `frontend/src/app/(dashboard)/fleet/[id]/page.tsx`
- `frontend/src/modules/fleet/ui/VehicleAssignmentPanel.tsx`
- `frontend/src/modules/fleet/hooks/useAssignments.ts` (crear si no existe)
- `backend/src/modules/fleet/fleet.service.ts`
- `backend/src/modules/fleet/fleet.controller.ts`
- `backend/src/modules/fleet/fleet.routes.ts`

**Archivos exactos a modificar:**
- `frontend/src/app/(dashboard)/fleet/[id]/page.tsx` — agregar secciones de asignación activa y acciones
- `frontend/src/modules/fleet/ui/VehicleAssignmentPanel.tsx` — extender con checkout/checkin wizard
- `frontend/src/modules/fleet/hooks/` — crear useAssignments.ts
- `frontend/src/modules/fleet/api/fleet-api.ts` — agregar métodos de assignment
- `frontend/src/modules/fleet/queries.ts` — agregar queries de assignment

**Código o estructura esperada:**
- En /fleet/[id]: mostrar asignación activa actual (conductor, fecha, kilometraje salida)
- Si hay asignación activa: mostrar botón "Checkin" con formulario (kilometraje entrada, nivel combustible, fotos, notas)
- Si no hay asignación activa: mostrar botón "Checkout" con formulario (kilometraje salida, nivel combustible, fotos, notas)
- Si no hay asignación activa: mostrar botón "Asignar vehículo" que abre selector de conductor
- Mostrar historial de asignaciones (tabla con conductor, fechas, kilometraje, estado)

**Contrato requerido:** VehicleCheckoutSchema, VehicleCheckinSchema, VehicleAssignmentSchema (ya existen en shared-types)

**Backend requerido:** Ya existe. Verificar que los endpoints estén montados en fleet.routes.ts.

**Frontend requerido:**
- Componente de checkout wizard
- Componente de checkin wizard
- Tabla de historial de asignaciones
- Hooks para checkout/checkin/getActiveAssignment/getHistory

**Estados UI:** Loading, Error, Empty (sin asignaciones), Success

**Pruebas requeridas:**
- Test de checkout flow
- Test de checkin flow
- Test de validación de kilometraje

**Validación manual:**
- Navegar a /fleet/[id]
- Asignar conductor
- Realizar checkout con kilometraje
- Realizar checkin con kilometraje
- Verificar historial

**Comandos:**
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
```

**Criterio de aceptación:**
- Checkout registra kilometraje y combustible
- Checkin valida kilometraje mayor o igual al de salida
- Historial muestra todas las asignaciones
- API responde con datos correctos

**Qué NO hacer:**
- No modificar backend fleet.service.ts ni fleet.controller.ts ni fleet.routes.ts
- No modificar shared-types vehicle.schema.ts

**Dependencias:** FLT-01

**Evidencia requerida:** Screenshot de checkout/checkin en /fleet/[id]

---

#### Ticket FLT-03: Agregar mantenimiento de vehículos en UI

**ID:** FLT-03
**Sprint:** 1
**Prioridad:** P2 (Media)
**Título:** Agregar registro de mantenimiento preventivo y correctivo en detalle de vehículo
**Tipo:** frontend + backend
**Módulo:** fleet
**Ruta visible:** /fleet/[id]

**Problema:** No hay UI para registrar mantenimiento de vehículos. El schema vehicle tiene lastMaintenanceAt y nextMaintenanceKm pero no hay formulario para actualizarlos.

**Causa raíz:** Funcionalidad no implementada en frontend.

**Usuario afectado:** Operadores y administradores de flota.

**Valor empresarial:** Control de mantenimiento preventivo reduce costos y paradas no planificadas.

**Archivos exactos a abrir:**
- `frontend/src/app/(dashboard)/fleet/[id]/page.tsx`
- `frontend/src/modules/fleet/api/fleet-api.ts`
- `frontend/src/modules/fleet/queries.ts`
- `backend/src/modules/fleet/fleet.controller.ts` — verificar endpoint updateVehicle
- `backend/src/modules/fleet/fleet.service.ts` — verificar updateVehicle

**Archivos exactos a modificar:**
- `frontend/src/app/(dashboard)/fleet/[id]/page.tsx` — agregar sección de mantenimiento
- `frontend/src/modules/fleet/ui/` — crear MaintenanceTab.tsx
- `frontend/src/modules/fleet/api/fleet-api.ts` — agregar updateMaintenance
- `frontend/src/modules/fleet/queries.ts` — agregar useUpdateMaintenance

**Código o estructura esperada:**
- Pestaña "Mantenimiento" en /fleet/[id]
- Formulario: tipo (preventivo/correctivo), fecha, kilometraje, descripción, costo, próximo mantenimiento (km)
- Historial de mantenimientos registrados

**Contrato requerido:** UpdateVehicleSchema (ya existe en shared-types)

**Backend requerido:** updateVehicle ya soporta lastMaintenanceAt y nextMaintenanceKm

**Frontend requerido:** MaintenanceTab component, hook useUpdateMaintenance

**Estados UI:** Loading, Error, Empty, Success

**Pruebas requeridas:** Test de formulario de mantenimiento

**Validación manual:** Registrar mantenimiento, verificar que se guarda

**Criterio de aceptación:** Mantenimiento se guarda y lista en historial

**Dependencias:** FLT-01

---

#### Ticket FLT-04: Alertas documentales en dashboard

**ID:** FLT-04
**Sprint:** 1
**Prioridad:** P2 (Media)
**Título:** Mostrar alertas de documentos de vehículos próximos a vencer en dashboard
**Tipo:** frontend
**Módulo:** fleet + dashboard
**Ruta visible:** /dashboard

**Problema:** Backend calcula getExpiringDocuments pero UI no muestra alertas.

**Archivos exactos a abrir:**
- `frontend/src/app/(dashboard)/dashboard/page.tsx`
- `backend/src/modules/fleet/fleet.service.ts`
- `backend/src/modules/fleet/fleet.routes.ts`
- `frontend/src/modules/fleet/api/fleet-api.ts`

**Archivos exactos a modificar:**
- `frontend/src/app/(dashboard)/dashboard/page.tsx` — agregar sección de alertas
- `frontend/src/modules/dashboard/` — o crear widget de fleet alerts
- `frontend/src/modules/fleet/api/fleet-api.ts` — agregar getExpiringDocuments
- `frontend/src/modules/fleet/queries.ts` — agregar useExpiringDocumentsQuery

**Código o estructura esperada:** Widget en dashboard que muestra vehículos con SOAT, tecnomecánica o póliza próximos a vencer (rojo: vencido, amarillo: próximo 30 días)

**Criterio de aceptación:** Alertas visibles en dashboard con datos reales

---

#### Ticket FLT-05: Asset management UI básica

**ID:** FLT-05
**Sprint:** 1
**Prioridad:** P2 (Media)
**Título:** Mejorar UI de módulo Assets con ficha técnica
**Tipo:** frontend
**Módulo:** asset
**Ruta visible:** /assets

**Archivos exactos a abrir:**
- `frontend/src/app/(dashboard)/assets/page.tsx`
- `frontend/src/app/(dashboard)/assets/[id]/page.tsx`
- `packages/shared-types/src/schemas/asset.schema.ts`
- `backend/src/modules/asset/`

**Archivos exactos a modificar:**
- Frontend pages de assets para mostrar ficha técnica completa
- Asset schema compartido

**Criterio de aceptación:** Assets con ficha técnica, documentos y fotos

---

### Sprint 2 — Planning Profesional + Cockpit 14 Pasos

**Objetivo empresarial:** Convertir planning de un readiness check básico a un wizard profesional con cronograma, recursos, herramientas, equipos, EPP, AST, PTW, certificaciones, firmas, cost baseline y approval.

**Problema real que resuelve:** Planeación incompleta (alcances, herramientas, equipos, EPP olvidados). Falta de verificación de certificaciones.

**Falla CERMONT asociada:** Fallas 1 (planeación incompleta), 2 (ejecución sin herramientas)

**Benchmark profesional:** Un CMMS profesional exige: cronograma, MO por especialidad, herramientas certificadas, equipos calibrados, EPP por riesgo, AST/PTW obligatorio, readiness gate, aprobación por RBAC.

**Estado actual verificado:**
- Schema: COMPLETO (planning-packet.schema.ts con 28+ campos)
- Backend: COMPLETO (planning-packet.service.ts + planning-readiness.service.ts)
- Domain: COMPLETO (planning.rules.ts con getPlanningBlockers)
- Frontend: POBRE (solo ReadinessGate.tsx)

**Brecha:** Schema vasto (28+ campos) pero UI solo expone 1 componente.

**Resultado esperado visible en localhost:**
- /orders/[id]/planning: wizard multi-paso con cronograma, recursos, herramientas, equipos, EPP, AST, PTW, certificaciones, documentos, firmas, cost baseline
- /service-cases/[id]/cockpit: timeline visual de 14 pasos con colores por estado, bloqueos, responsables

**Rutas afectadas:** /orders/[id]/planning, /planning, /service-cases/[id]/cockpit, /resources/kits

#### Ticket PLN-01: PlanningWizard multi-paso

**ID:** PLN-01
**Sprint:** 2
**Prioridad:** P1 (Crítica)
**Título:** Construir PlanningWizard multi-paso con todos los campos del schema planning-packet
**Tipo:** frontend
**Módulo:** planning
**Ruta visible:** /orders/[id]/planning

**Problema:** El schema planning-packet tiene 28+ campos (cronograma, crew, herramientas, equipos, EPP, certificaciones, AST, PTW, documentos, responsables, cost baseline) pero la UI solo tiene un ReadinessGate.

**Causa raíz:** Desarrollo sin prioridad en UI de planeación.

**Usuario afectado:** Residentes, supervisores que planifican órdenes.

**Valor empresarial:** Planeación completa reduce retrabajos, accidentes y sobrecostos.

**Archivos exactos a abrir:**
- `packages/shared-types/src/schemas/planning-packet.schema.ts`
- `backend/src/modules/planning-packet/planning-packet.service.ts`
- `backend/src/modules/planning-packet/planning-packet.controller.ts`
- `backend/src/modules/planning-packet/planning-packet.routes.ts`
- `backend/src/modules/planning-packet/planning-readiness.service.ts`
- `frontend/src/modules/planning/queries.ts`
- `frontend/src/modules/planning/ui/ReadinessGate.tsx`
- `frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx`
- `packages/domain/src/planning.rules.ts`

**Archivos exactos a modificar/crear:**
- `frontend/src/modules/planning/ui/PlanningWizard.tsx` — CREAR wizard multi-paso
- `frontend/src/modules/planning/ui/steps/ScheduleStep.tsx` — CREAR paso cronograma
- `frontend/src/modules/planning/ui/steps/ResourcesStep.tsx` — CREAR paso recursos
- `frontend/src/modules/planning/ui/steps/SafetyStep.tsx` — CREAR paso seguridad
- `frontend/src/modules/planning/ui/steps/DocumentsStep.tsx` — CREAR paso documentos
- `frontend/src/modules/planning/ui/steps/ReviewStep.tsx` — CREAR paso revisión
- `frontend/src/modules/planning/queries.ts` — EXTENDER con mutations
- `frontend/src/modules/planning/api/` — CREAR planning-api.ts
- `frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx` — MODIFICAR para usar wizard

**Código o estructura esperada:**
- Wizard de 5 pasos:
  1. Schedule: fecha inicio, fecha fin, horas estimadas, lugar
  2. Resources: crew (select de usuarios), herramientas, equipos, materiales, EPP
  3. Safety: AST required, PTW required, documentos de apoyo
  4. Certifications: verificar certificaciones del personal y equipos
  5. Review: resumen, cost baseline, readiness check, submit for approval

**Contrato requerido:** CreatePlanningPacketSchema, UpdatePlanningPacketSchema, ApprovePlanningPacketSchema (ya existen)

**Backend requerido:** Ya existe. Verificar planning-packet.routes.ts endpoints.

**Frontend requerido:** PlanningWizard component + step components

**Estados UI:** Loading, Error, Empty, Success, Forbidden

**Pruebas requeridas:** Test de wizard multi-paso

**Validación manual:** Navegar a order con planning, crear planning completo

**Comandos:**
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
```

**Criterio de aceptación:**
- Wizard tiene 5 pasos navegables
- Se puede guardar planning packet completo
- Readiness check muestra blockers reales
- Se puede enviar a aprobación

**Qué NO hacer:**
- No modificar shared-types planning-packet.schema.ts
- No modificar backend planning-packet module
- No modificar domain planning.rules.ts

**Dependencias:** Ninguna

---

#### Ticket PLN-02: Cockpit timeline 14 pasos

**ID:** PLN-02
**Sprint:** 2
**Prioridad:** P1 (Crítica)
**Título:** Mejorar CockpitPanel con timeline visual profesional de 14 pasos
**Tipo:** frontend
**Módulo:** cockpit
**Ruta visible:** /service-cases/[id]/cockpit

**Problema:** Cockpit existe pero timeline visual es básico. No muestra bloqueos, responsables, transiciones, ni colores por estado.

**Archivos exactos a abrir:**
- `frontend/src/modules/cockpit/`
- `frontend/src/app/(dashboard)/service-cases/[id]/cockpit/page.tsx`
- `packages/shared-types/src/schemas/service-case-step-context.schema.ts`
- `packages/domain/src/operational-steps.ts`

**Archivos exactos a modificar:** Componentes de cockpit

**Criterio de aceptación:** Timeline visual con 14 pasos, colores por estado, bloqueos, acciones, responsables

---

### Sprint 3 — Ejecución Offline Profesional

**Objetivo empresarial:** Sesión de campo completa con checklist offline, fotos offline, firma offline, materiales, horas hombre, incidentes, sincronización con detección de conflictos.

**Problema real que resuelve:** Operación en campo con baja conectividad.

**Falla CERMONT asociada:** Falla 9 (operación en campo con baja conectividad)

**Estado actual:**
- Domain rules: COMPLETAS (execution.ts con 223 líneas)
- Schema execution-session: COMPLETO
- Offline queue: EXISTE
- UI execution: PARCIAL

#### Tickets (resumen):
- **EXE-01:** Mejorar ExecutionSession UI con todos los campos del schema
- **EXE-02:** Implementar checklist offline funcional
- **EXE-03:** Implementar captura de fotos offline con cola de sync
- **EXE-04:** Implementar firma offline
- **EXE-05:** Implementar registro de materiales y horas hombre
- **EXE-06:** Implementar manejo de incidentes
- **EXE-07:** Implementar indicador de estado de sincronización
- **EXE-08:** Probar flujo offline completo E2E

---

### Sprint 4 — Evidence/Document Management Profesional

**Objetivo empresarial:** Galería de evidencias profesional con metadatos, geolocalización, hash, relación con paso/componente, exportación a PDF.

**Problema real que resuelve:** Evidencias fotográficas dispersas (WhatsApp, dispositivos personales).

**Falla CERMONT asociada:** Falla 8 (evidencias dispersas)

#### Tickets (resumen):
- **EVD-01:** Galería profesional con thumbnails, metadatos, geolocalización
- **EVD-02:** Subida múltiple con cámara y archivo
- **EVD-03:** Relación evidencia-paso-componente
- **EVD-04:** Exportación de galería a PDF
- **EVD-05:** Control de versiones de evidencias
- **EVD-06:** File manager profesional para documentos adjuntos

---

### Sprint 5 — Informes y Actas Profesionales

**Objetivo empresarial:** Generación automática de informes técnicos y actas de entrega en PDF con fotos seleccionables, observaciones, hallazgos, acciones correctivas, firmas.

**Problema real que resuelve:** Retraso en informes técnicos y actas de entrega.

**Falla CERMONT asociada:** Falla 4 (retrasos en informes y actas)

#### Tickets (resumen):
- **INF-01:** Generación automática de PDF de informe técnico al completar ejecución
- **INF-02:** Plantillas de informe seleccionables
- **INF-03:** Selección de fotos para incluir en informe
- **INF-04:** Firma digital de técnico, supervisor y cliente
- **INF-05:** Wizard de acta de entrega profesional
- **INF-06:** Control de versiones de informes y actas
- **INF-07:** PDF descargable con todos los datos

---

### Sprint 6 — SES, Facturación y Cierre Administrativo

**Objetivo empresarial:** Cadena completa SES → Factura → Aprobación → Pago → Cierre con trazabilidad visual y alertas.

**Problema real que resuelve:** Retraso en SES/Ariba y facturación.

**Falla CERMONT asociada:** Falla 5 (retrasos en facturación)

#### Tickets (resumen):
- **SES-01:** Dashboard de SES pendientes con alertas de retraso
- **SES-02:** Wizard de creación de SES con datos de orden
- **SES-03:** Aprobación de SES por RBAC
- **FAC-01:** Dashboard de facturas pendientes y vencidas
- **FAC-02:** Creación de factura desde SES aprobado
- **FAC-03:** Aprobación de factura por RBAC
- **PAG-01:** Dashboard de cobranza
- **PAG-02:** Registro de pago con conciliación
- **PAG-03:** Cierre administrativo automático
- **PAG-04:** Trazabilidad visual del flujo completo SES→Factura→Pago

---

### Sprint 7 — Costos Reales y Rentabilidad

**Objetivo empresarial:** Comparación propuesta vs costo real por orden con cálculo de desviación y rentabilidad.

**Problema real que resuelve:** Falta de costos reales centralizados y comparación débil entre propuesta y costo real.

**Fallas CERMONT asociadas:** Fallas 6 y 7

#### Tickets (resumen):
- **CST-01:** Dashboard de costos por orden con comparación propuesta vs real
- **CST-02:** Cálculo de desviación por categoría (MO, materiales, herramientas, equipos, transporte)
- **CST-03:** Cálculo de rentabilidad por orden
- **CST-04:** Alerta de sobrecosto
- **CST-05:** Reporte de costos exportable

---

### Sprint 8 — Dashboard Gerencial Real

**Objetivo empresarial:** Dashboard con KPIs reales conectados a backend, cuellos de botella, alertas por rol.

**Problema real que resuelve:** Sin visibilidad gerencial del estado operativo.

#### Tickets (resumen):
- **KPI-01:** Endpoint GET /api/dashboard/operational-summary con datos reales
- **KPI-02:** Widget de órdenes atrasadas
- **KPI-03:** Widget de SES pendientes
- **KPI-04:** Widget de facturas pendientes
- **KPI-05:** Widget de costos desviados
- **KPI-06:** Widget de cumplimiento documental
- **KPI-07:** Widget de estado de flota (alertas documentales)
- **KPI-08:** Widget de cumplimiento de evidencias
- **KPI-09:** Widget de estado offline
- **KPI-10:** Notificaciones y alertas por rol

---

### Sprint 9 — Portal Cliente

**Objetivo empresarial:** Autoservicio para clientes con consulta de órdenes, evidencias, descarga de informes, firma de actas.

#### Tickets (resumen):
- **PRT-01:** Verificar estado actual del módulo portal
- **PRT-02:** Login de cliente con token
- **PRT-03:** Consulta de órdenes del cliente
- **PRT-04:** Consulta de evidencias por orden
- **PRT-05:** Descarga de informes PDF
- **PRT-06:** Firma digital de actas desde portal
- **PRT-07:** Estado de facturas

---

### Sprint 10 — Dynamic Forms/Checklists

**Objetivo empresarial:** Constructor de formularios dinámicos con versionado, tipos de campo, validaciones, publicación controlada.

#### Tickets (resumen):
- **FRM-01:** Constructor de templates con tipos de campo (texto, número, fecha, foto, firma, select, checkbox)
- **FRM-02:** Versionado de templates
- **FRM-03:** Publicación controlada (draft/public/archived)
- **FRM-04:** Checklist builder con ítems conforme/no conforme/NA
- **FRM-05:** Plantillas iniciales (CCTV, líneas de vida, mantenimiento eléctrico)
- **FRM-06:** Foto por ítem de checklist
- **FRM-07:** Firma por checklist
- **FRM-08:** Score automático por checklist

---

### Sprint 11 — Backups/Histórico/Auditoría

**Objetivo empresarial:** Backup automático, archivado mensual, histórico descargable, auditoría forense.

#### Tickets (resumen):
- **BAK-01:** Script de backup automático MongoDB (mongodump diario)
- **BAK-02:** Archivado mensual de órdenes completadas
- **BAK-03:** Portal de descarga de paquetes ZIP por mes/cliente
- **BAK-04:** Exportación CSV por cliente
- **BAK-05:** Retención documental configurable
- **BAK-06:** Página de auditoría con filtros por entidad/acción/usuario/fecha
- **BAK-07:** Dashboard de estado de backups

---

### Sprint 12 — E2E + VPS

**Objetivo empresarial:** Prueba E2E del flujo completo de 14 pasos con Playwright y despliegue VPS robusto.

#### Tickets (resumen):
- **E2E-01:** Seed realista con datos para 14 pasos
- **E2E-02:** Playwright: login → crear solicitud → visita → propuesta → PO → planning → ejecución → evidencias → informe → acta → firma → SES → factura → pago
- **E2E-03:** Playwright: flujo offline → sync → online
- **E2E-04:** Playwright: RBAC por rol
- **E2E-05:** Docker multi-stage build (backend + frontend)
- **E2E-06:** PM2 ecosystem.config.js
- **E2E-07:** Nginx reverse proxy + HTTPS
- **E2E-08:** Scripts de backup y rollback
- **E2E-09:** Pruebas de carga básicas

---

## 33. Matriz de Archivos Exactos a Modificar

### Sprint 1 — Fleet/Assets

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx | MODIFICAR (schema, tipos, fotos, conductor) | FLT-01 |
| frontend/src/app/(dashboard)/fleet/[id]/page.tsx | MODIFICAR (asignación activa, checkout/checkin, mantenimiento) | FLT-02, FLT-03 |
| frontend/src/modules/fleet/ui/VehicleAssignmentPanel.tsx | EXTENDER (checkout/checkin wizard) | FLT-02 |
| frontend/src/modules/fleet/hooks/useAssignments.ts | CREAR | FLT-02 |
| frontend/src/modules/fleet/api/fleet-api.ts | EXTENDER (assignments) | FLT-02 |
| frontend/src/modules/fleet/queries.ts | EXTENDER (assignment queries) | FLT-02 |
| frontend/src/modules/fleet/ui/MaintenanceTab.tsx | CREAR | FLT-03 |
| frontend/src/app/(dashboard)/dashboard/page.tsx | MODIFICAR (alertas flota) | FLT-04 |
| frontend/src/modules/fleet/api/fleet-api.ts | EXTENDER (expiring documents) | FLT-04 |
| frontend/src/modules/fleet/queries.ts | EXTENDER (expiring documents query) | FLT-04 |
| frontend/src/app/(dashboard)/assets/page.tsx | MODIFICAR (ficha técnica) | FLT-05 |
| frontend/src/app/(dashboard)/assets/[id]/page.tsx | MODIFICAR (detalle) | FLT-05 |
| frontend/tests/modules/fleet/NewVehicleDrawer.test.tsx | CREAR | FLT-01 |
| frontend/tests/modules/fleet/VehicleAssignment.test.tsx | CREAR | FLT-02 |
| frontend/tests/modules/fleet/Maintenance.test.tsx | CREAR | FLT-03 |

### Sprint 2 — Planning + Cockpit

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/src/modules/planning/ui/PlanningWizard.tsx | CREAR | PLN-01 |
| frontend/src/modules/planning/ui/steps/ScheduleStep.tsx | CREAR | PLN-01 |
| frontend/src/modules/planning/ui/steps/ResourcesStep.tsx | CREAR | PLN-01 |
| frontend/src/modules/planning/ui/steps/SafetyStep.tsx | CREAR | PLN-01 |
| frontend/src/modules/planning/ui/steps/DocumentsStep.tsx | CREAR | PLN-01 |
| frontend/src/modules/planning/ui/steps/CertificationsStep.tsx | CREAR | PLN-01 |
| frontend/src/modules/planning/ui/steps/ReviewStep.tsx | CREAR | PLN-01 |
| frontend/src/modules/planning/api/planning-api.ts | CREAR | PLN-01 |
| frontend/src/modules/planning/queries.ts | EXTENDER | PLN-01 |
| frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx | MODIFICAR | PLN-01 |
| frontend/src/modules/cockpit/ | MODIFICAR (timeline) | PLN-02 |

### Sprint 3 — Execution

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/src/modules/execution/ | EXTENDER (checklist offline, fotos, firma) | EXE-01..08 |
| frontend/src/modules/field-execution/ | EXTENDER | EXE-01..08 |
| frontend/src/modules/offline/ | EXTENDER (sync status) | EXE-07 |

### Sprint 4 — Evidence

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/src/modules/evidences/ | REDISEÑAR (galería profesional) | EVD-01..06 |
| frontend/src/modules/documents/ | EXTENDER | EVD-06 |

### Sprint 5 — Reports

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/src/modules/reports/ | REDISEÑAR (generación PDF) | INF-01..07 |
| backend/src/services/report.service.ts | EXTENDER | INF-01 |
| frontend/src/modules/delivery-records/ | REDISEÑAR (wizard acta) | INF-05 |

### Sprint 6 — SES/Invoice/Payment

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/src/modules/billing/ | EXTENDER (dashboard SES) | SES-01..03 |
| frontend/src/modules/invoices/ | EXTENDER (dashboard facturas) | FAC-01..03 |
| frontend/src/modules/payments/ | EXTENDER (dashboard cobranza) | PAG-01..04 |

### Sprint 7 — Costs

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/src/modules/costs/ | REDISEÑAR (comparación propuesta vs real) | CST-01..05 |

### Sprint 8 — Dashboard

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/src/app/(dashboard)/dashboard/page.tsx | REDISEÑAR (KPIs reales) | KPI-01..10 |
| backend/src/modules/dashboard/ | EXTENDER (endpoints) | KPI-01 |

### Sprint 9 — Portal

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/src/modules/portal/ | AUDITAR y EXTENDER | PRT-01..07 |
| backend/src/modules/portal/ | VERIFICAR | PRT-01 |

### Sprint 10 — Forms

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/src/modules/forms/ | CREAR (builder) | FRM-01..08 |
| frontend/src/modules/checklists/ | EXTENDER (constructor) | FRM-04..08 |

### Sprint 11 — Backups/Audit

| Archivo | Acción | Ticket |
|---------|--------|--------|
| backend/src/modules/admin-backup/ | VERIFICAR y EXTENDER | BAK-01..07 |
| frontend/src/app/(dashboard)/admin/ | CREAR (backups, audit pages) | BAK-06, BAK-07 |

### Sprint 12 — E2E + VPS

| Archivo | Acción | Ticket |
|---------|--------|--------|
| frontend/tests/e2e/flujo-14-pasos.spec.ts | CREAR | E2E-02 |
| frontend/tests/e2e/offline.spec.ts | CREAR | E2E-03 |
| frontend/tests/e2e/rbac.spec.ts | CREAR | E2E-04 |
| docker/Dockerfile | CREAR/MEJORAR | E2E-05 |
| ecosystem.config.cjs | CREAR | E2E-06 |

---

## 34. Definition of Done por Sprint

Cada sprint debe cumplir estos 20 puntos para ser marcado como COMPLETO:

| # | Criterio | Cómo se verifica |
|---|----------|------------------|
| 1 | Usuario puede usar en localhost | Abrir navegador en localhost:3000, navegar a ruta, interactuar |
| 2 | Datos reales o seed controlado | Seed con datos de prueba o endpoint responde con datos reales |
| 3 | Contrato compartido | Schema Zod en shared-types |
| 4 | Backend real | Endpoint Express responde con datos |
| 5 | Frontend conectado | Componente consume endpoint via TanStack Query |
| 6 | Loading state | Skeleton o spinner visible mientras carga |
| 7 | Error state | Card de error con mensaje y botón retry |
| 8 | Empty state | Ilustración + descripción + CTA cuando no hay datos |
| 9 | Forbidden state | Card "Sin permiso" cuando rol no tiene acceso |
| 10 | Offline state si aplica | Banner persistente + estado de cola para funcionalidades de campo |
| 11 | Permisos RBAC | Usar canAccessModule/@cermont/domain, no hardcodear roles |
| 12 | Auditoría | Eventos críticos registrados en AuditLog |
| 13 | Validaciones de negocio | Reglas de domain aplicadas en UI y backend |
| 14 | Relación con paso CERMONT | La funcionalidad se asigna a uno o más de los 14 pasos |
| 15 | Pruebas unitarias | Vitest: casos de prueba creados y pasando |
| 16 | Pruebas de integración | Backend: pruebas de integración creadas |
| 17 | Prueba E2E si es flujo crítico | Playwright: prueba de flujo completo |
| 18 | Evidencia visual antes/después | Screenshots desktop + mobile guardados en .sisyphus/evidence/ |
| 19 | Documentación de uso | docs/ actualizado si el comportamiento cambia |
| 20 | npm run verify pasa | typecheck, lint, test, build, contracts:check, quality:strict, react-doctor |

---

## 35. Pruebas Requeridas por Sprint

### Sprint 1 — Fleet/Assets
- Unit: NewVehicleDrawer form validation
- Unit: VehicleAssignment checkout/checkin flow
- Unit: MaintenanceTab form
- Unit: FleetReadinessBadge
- Integration: Fleet API endpoints
- Integration: Vehicle assignment lifecycle
- E2E: Crear vehículo → asignar → checkout → checkin → ver historial

### Sprint 2 — Planning + Cockpit
- Unit: PlanningWizard step navigation
- Unit: PlanningWizard form validation
- Unit: Cockpit timeline rendering
- Integration: Planning packet CRUD
- Integration: Readiness gate evaluation
- E2E: Crear planning packet completo → approve → verificar readiness

### Sprint 3 — Execution
- Unit: Execution session CRUD
- Unit: Offline queue operations
- Integration: Execution lifecycle (create, start, pause, complete)
- Integration: Offline sync with conflict detection
- E2E: Flujo offline completo (crear sesión offline → sync → verificar)

### Sprint 4 — Evidence
- Unit: Evidence gallery rendering
- Unit: File upload validation
- Integration: Evidence CRUD with files

### Sprint 5 — Reports
- Unit: PDF generation
- Unit: Report template rendering
- Integration: Report lifecycle (create, approve, sign)

### Sprint 6 — SES/Invoice/Payment
- Unit: SES creation validation
- Unit: Invoice creation from SES
- Integration: Full billing cycle
- E2E: SES → Invoice → Approval → Payment

### Sprint 7 — Costs
- Unit: Cost variance calculation
- Unit: Profitability calculation
- Integration: Cost comparison endpoint

### Sprint 8 — Dashboard
- Unit: KPI calculation
- Integration: Dashboard endpoints
- Integration: Dashboard data flow

### Sprint 9 — Portal
- Integration: Portal API endpoints
- E2E: Client login → view orders → download report

### Sprint 10 — Forms
- Unit: Form builder operations
- Unit: Template validation
- Integration: Form submission workflow

### Sprint 11 — Backups
- Integration: Backup script execution
- Integration: Archive creation
- Integration: Audit log query

### Sprint 12 — E2E + VPS
- E2E: Flujo completo 14 pasos
- E2E: Offline sync
- E2E: RBAC verification
- Integration: Docker build
- Integration: PM2 startup

---

## 36. Evidencia Requerida por Sprint

Cada sprint debe crear:

```
.sisyphus/evidence/sprint-NN/audit-before.md        — Estado inicial del módulo
.sisyphus/evidence/sprint-NN/before-desktop.png      — Screenshot desktop antes
.sisyphus/evidence/sprint-NN/before-mobile.png       — Screenshot mobile antes
.sisyphus/evidence/sprint-NN/implementation-notes.md — Notas de implementación
.sisyphus/evidence/sprint-NN/commands.md              — Comandos ejecutados con output
.sisyphus/evidence/sprint-NN/test-results.md          — Resultados de tests
.sisyphus/evidence/sprint-NN/after-desktop.png       — Screenshot desktop después
.sisyphus/evidence/sprint-NN/after-mobile.png        — Screenshot mobile después
.sisyphus/evidence/sprint-NN/product-slice-report.md — Reporte de slice funcional
```

**Reglas de evidencia:**
- Screenshots deben mostrar DATOS REALES, no empty states
- Si el sprint afecta formularios, mostrar formulario lleno
- Si el sprint afecta listados, mostrar listado con datos
- Si el sprint afecta dashboard, mostrar dashboard con KPIs
- No se acepta "no se pudo tomar screenshot" como excusa

---

## 37. Riesgos y Stop Conditions

### Riesgos identificados:

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|:-----------:|:-------:|------------|
| 1 | Plan v4 es muy largo (4000+ líneas) y el programador no lo lee completo | Alta | Alto | Dividir en sprints independientes, empezar por Sprint 1 |
| 2 | Algunos archivos listados no existen exactamente en esa ruta | Media | Medio | Programador debe verificar con Get-ChildItem antes de tocar |
| 3 | Backend puede no tener todos los endpoints asumidos | Media | Alto | Verificar cada endpoint antes de implementar frontend |
| 4 | npm run verify puede fallar por cambios inesperados | Baja | Alto | Ejecutar después de cada ticket, no al final del sprint |
| 5 | El programador marca "completo" sin evidencia | Alta | Alto | DoD de 20 puntos es obligatorio. Sin screenshots no está completo |
| 6 | React Doctor puede quejarse de código nuevo | Media | Medio | Corregir antes de marcar completo |
| 7 | Conflictos de merge si otro desarrollador toca los mismos archivos | Baja | Alto | Trabajar en branch separada |
| 8 | Dependencias nuevas requeridas | Media | Medio | ADR obligatorio antes de instalar |

### Stop Conditions (el programador debe DETENERSE si ocurre):

1. **npm run verify falla** después de una corrección en el sprint. No avanzar.
2. **contracts:check falla** y requiere migración. No avanzar sin migración.
3. **Schema nuevo rompe compatibilidad** con snapshot existente. No avanzar sin entender impacto.
4. **Se necesita modificar package.json** sin autorización. Detenerse y reportar.
5. **Se necesita modificar tooling/quality/baseline.json** o quality scripts. NO HACER. Reportar.
6. **Se encuentra que un archivo listado en el plan NO existe** en la ruta exacta. Verificar con búsqueda.
7. **Se encuentra que un archivo listado en el plan SÍ existe pero con contenido diferente al esperado**. Leer primero, modificar después.
8. **El plan dice que backend tiene endpoint pero no está montado en routes**. Verificar, si falta, reportar.
9. **Un ticket requiere decisión de negocio**. No inventar. Crear nota de bloqueo.
10. **Tres intentos de corrección fallan** para el mismo ticket. Detener sprint. Reportar con evidencia.

---

## 38. Prompt Final para Modelo Programador

```
=========================================================
PROMPT PARA EJECUTOR — PLAN MAESTRO CERMONT v4
=========================================================

Actúa como programador senior fullstack para CERMONT.
No vas a hacer inventario. No vas a auditar.
Vas a implementar el Sprint 1 del Plan v4.

No puedes marcar nada como terminado por existencia de archivos.
Debes producir cambios visibles, lógica de negocio real, pruebas y evidencia antes/después.

ARCHIVO DEL PLAN:
.sisyphus/plans/cermont-functional-refactor-masterplan-v4.md

ORDEN DE EJECUCIÓN:
1. Sprint 1 — Fleet/Assets profesional (FLT-01 a FLT-05)
2. Detenerte después de Sprint 1. Reportar resultados.
3. No avanzar a Sprint 2 sin aprobación.

REGLAS ABSOLUTAS:
1. LEER antes de EDITAR. Cada archivo listado debe leerse completo antes de modificarlo.
2. BUSCAR antes de CREAR. Si un archivo similar existe, extenderlo, no duplicarlo.
3. NO decir "ya existe, por tanto completo". Solo se acepta "existe y fue validado con screenshot, acción de usuario, respuesta backend, test, DoD cumplido".
4. NO usar "SUPERSEDED" sin evidencia funcional.
5. NO usar any, unknown, null, undefined.
6. NO usar mocks de producción.
7. NO modificar package.json sin autorización.
8. NO modificar tooling/quality/ ni baselines.
9. NO desactivar quality gates.
10. NO instalar dependencias sin ADR.

TICKETS DEL SPRINT 1:
FLT-01: Refactorizar NewVehicleDrawer (schema shared-types, eliminar Record<string,unknown>, fotos, conductor)
FLT-02: Exponer checkout/checkin en /fleet/[id]
FLT-03: Agregar mantenimiento de vehículos
FLT-04: Alertas documentales en dashboard
FLT-05: Mejorar módulo Assets

ARCHIVOS A NO TOCAR BAJO NINGUNA CIRCUNSTANCIA:
- package.json (root, backend, frontend)
- package-lock.json
- tooling/quality/baseline.json
- tooling/quality/*.ts
- packages/shared-types/src/schemas/ (solo leer, no modificar en Sprint 1)
- packages/domain/src/ (solo leer, no modificar)
- backend/src/modules/fleet/fleet.service.ts (solo leer, verificar endpoints)
- backend/src/modules/fleet/fleet.controller.ts (solo leer)
- backend/src/modules/fleet/fleet.routes.ts (solo leer)

VALIDACIÓN OBLIGATORIA:
Después de CADA ticket ejecutar:
  npm run typecheck -w frontend
  npm run lint -w frontend
  npm run test -w frontend
  npm run build -w frontend

Al final del sprint ejecutar:
  npm run verify

EVIDENCIA OBLIGATORIA:
.sisyphus/evidence/sprint-01/audit-before.md
.sisyphus/evidence/sprint-01/before-desktop.png
.sisyphus/evidence/sprint-01/after-desktop.png
.sisyphus/evidence/sprint-01/after-mobile.png
.sisyphus/evidence/sprint-01/implementation-notes.md
.sisyphus/evidence/sprint-01/commands.md
.sisyphus/evidence/sprint-01/test-results.md
.sisyphus/evidence/sprint-01/product-slice-report.md

DEFINITION OF DONE SPRINT 1:
□ FLT-01: NewVehicleDrawer sin Record<string,unknown>, sin casts, schema de shared-types, fotos, conductor desde DB
□ FLT-02: /fleet/[id] con checkout/checkin wizard, historial asignaciones
□ FLT-03: /fleet/[id] con pestaña mantenimiento, historial
□ FLT-04: Dashboard con alertas de documentos próximos a vencer
□ FLT-05: Assets con ficha técnica
□ npm run verify pasa
□ React Doctor 100/100
□ Screenshots guardados
□ Product slice report creado

NO HACER:
- No modificar backend fleet service/controller/routes
- No modificar shared-types vehicle schema
- No modificar domain fleet-readiness rules
- No implementar más de un ticket a la vez
- No marcar ticket como completo sin screenshot
- No avanzar sin DoD cumplido

INICIAR CON FLT-01.
```

---

## Resumen Final

### 1. Ruta del archivo creado
`.sisyphus/plans/cermont-functional-refactor-masterplan-v4.md`

### 2. Número total de líneas
~4200 líneas (estimado)

### 3. Resumen ejecutivo
CERMONT tiene base técnica sólida (111 schemas, 59 módulos backend, 48 módulos frontend) pero sufre de brecha funcional: el backend y los contratos son más maduros que la UI. Este plan v4 reemplaza el enfoque de "waves completas por existencia de archivos" con 12 sprints funcionales que producen cambios visibles en localhost, con DoD de 20 puntos, tickets con archivos exactos, evidencia antes/después y pruebas obligatorias.

### 4. Top 20 brechas funcionales detectadas
1. Fleet: UI no expone checkout/checkin a pesar de backend completo
2. NewVehicleDrawer: schema local, Record<string, unknown>, casts
3. Fleet: No hay mantenimiento preventivo en UI
4. Fleet: Alertas documentales no visibles en dashboard
5. Planning: UI solo ReadinessGate, schema de 28+ campos no explotado
6. Planning: Sin cronograma, crew, herramientas, equipos, EPP, AST, PTW
7. Planning: Sin cost baseline snapshot
8. Planning: Sin firma de responsables
9. Execution: Offline no probado como flujo real
10. Evidence: Sin galería profesional
11. Evidence: Sin exportación PDF
12. Evidence: Sin control de versiones
13. SES/Invoice: Sin trazabilidad visual
14. Costs: Sin comparación propuesta vs real
15. Dashboard: KPIs desconectados de backend
16. Portal cliente: No verificado
17. Dynamic forms: Constructor no existe
18. Backups: No verificado
19. E2E: No existe prueba de flujo completo
20. Auditoría: No hay UI de consulta de auditoría

### 5. Top 20 archivos críticos a refactorizar
1. frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx
2. frontend/src/app/(dashboard)/fleet/[id]/page.tsx
3. frontend/src/modules/fleet/ui/VehicleAssignmentPanel.tsx
4. frontend/src/modules/planning/ui/ReadinessGate.tsx
5. frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx
6. frontend/src/modules/cockpit/
7. frontend/src/modules/execution/
8. frontend/src/modules/evidences/
9. frontend/src/modules/reports/
10. frontend/src/modules/delivery-records/
11. frontend/src/modules/billing/
12. frontend/src/modules/costs/
13. frontend/src/app/(dashboard)/dashboard/page.tsx
14. frontend/src/modules/portal/
15. frontend/src/modules/forms/
16. frontend/src/modules/checklists/
17. backend/src/modules/admin-backup/
18. frontend/tests/e2e/ (CREAR)
19. frontend/src/modules/fleet/queries.ts
20. frontend/src/modules/fleet/api/fleet-api.ts

### 6. Sprints propuestos
1. **Sprint 1** — Fleet/Assets profesional
2. **Sprint 2** — Planning profesional + Cockpit 14 pasos
3. **Sprint 3** — Execution offline profesional
4. **Sprint 4** — Evidence/document management profesional
5. **Sprint 5** — Informes y actas profesionales
6. **Sprint 6** — SES, facturación y cierre administrativo
7. **Sprint 7** — Costos reales y rentabilidad
8. **Sprint 8** — Dashboard gerencial real
9. **Sprint 9** — Portal cliente
10. **Sprint 10** — Dynamic forms/checklists
11. **Sprint 11** — Backups/histórico/auditoría
12. **Sprint 12** — E2E flujo completo 14 pasos + VPS

### 7. Primer sprint que debe ejecutar el programador
**Sprint 1 — Fleet/Assets profesional** (5 tickets: FLT-01 a FLT-05)

### 8. Prompt final para el programador
Incluido en la Sección 38 de este documento.

---

## Anexo A: Desglose Detallado de Tickets Sprint 2 — Planning Profesional

### Ticket PLN-01: PlanningWizard multi-paso

**ID:** PLN-01
**Sprint:** 2
**Prioridad:** P0 (Crítica)
**Título:** Construir PlanningWizard multi-paso con los 28+ campos del schema planning-packet
**Tipo:** frontend
**Módulo:** planning
**Ruta visible:** /orders/[id]/planning

**Problema:** El schema planning-packet.schema.ts tiene 28+ sub-schemas (CrewMemberSchema, PlanningScheduleSchema, PlanningToolSchema, PlanningEquipmentSchema, WorkerRequirementsSchema, SupportDocumentSchema con AST/PTW, ReadinessCheckItemSchema, CostBaselineSnapshotSchema, etc.) pero la UI solo expone ReadinessGate.tsx. El backend planning-packet.service.ts tiene CRUD completo pero la UI no puede crear ni editar un planning packet.

**Causa raíz:** El desarrollo se enfocó en backend y contratos, dejando la UI para después. "Después" nunca llegó.

**Usuario afectado:** Residentes y supervisores que planifican órdenes de trabajo. Sin planning completo, la ejecución en campo se hace sin recursos adecuados.

**Valor empresarial:** Planeación completa con cronograma, recursos, seguridad y costos. Reduce retrabajos, accidentes y sobrecostos. Las fallas 1 y 2 de CERMONT se atacan directamente.

**Archivos exactos a abrir:**
- `packages/shared-types/src/schemas/planning-packet.schema.ts` (389 líneas, leer todos los sub-schemas)
- `backend/src/modules/planning-packet/planning-packet.service.ts` (leer para entender CRUD)
- `backend/src/modules/planning-packet/planning-packet.controller.ts`
- `backend/src/modules/planning-packet/planning-packet.routes.ts`
- `backend/src/modules/planning-packet/planning-readiness.service.ts`
- `frontend/src/modules/planning/queries.ts`
- `frontend/src/modules/planning/ui/ReadinessGate.tsx`
- `frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx`
- `packages/domain/src/planning.rules.ts` (146 líneas)
- `packages/domain/src/kit.rules.ts`
- `packages/shared-types/src/schemas/kit.schema.ts`

**Archivos exactos a crear:**
- `frontend/src/modules/planning/ui/PlanningWizard.tsx` — Componente principal del wizard
- `frontend/src/modules/planning/ui/steps/ScheduleStep.tsx` — Paso 1: Cronograma
- `frontend/src/modules/planning/ui/steps/ResourcesStep.tsx` — Paso 2: Recursos (crew, tools, equipment, materials, PPE)
- `frontend/src/modules/planning/ui/steps/SafetyStep.tsx` — Paso 3: Seguridad (AST, PTW, documentos de apoyo)
- `frontend/src/modules/planning/ui/steps/CertificationsStep.tsx` — Paso 4: Certificaciones
- `frontend/src/modules/planning/ui/steps/ReviewStep.tsx` — Paso 5: Revisión y envío
- `frontend/src/modules/planning/api/planning-api.ts` — API service

**Archivos exactos a modificar:**
- `frontend/src/modules/planning/queries.ts` — Agregar mutations create/update/approve/reopen
- `frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx` — Reemplazar ReadinessGate con PlanningWizard

**Código o estructura esperada:**

El wizard debe tener 5 pasos navegables con botones "Anterior" y "Siguiente":

**Paso 1 — Schedule:**
- plannedStartAt: date picker (react-day-picker)
- plannedEndAt: date picker
- estimatedDurationHours: number input
- place: text input
- businessUnit: select (IT, MNT, SC, GEN, OTHER)
- scope: textarea (mínimo 20 caracteres)

**Paso 2 — Resources:**
- Crew: selector de usuarios desde DB (fetch usuarios con rol operador/tecnico/supervisor). Múltiple selección con chips. Cada miembro muestra nombre, rol, certificationIds.
- Tools: selector de herramientas desde tool inventory (fetch tools). Múltiple selección con cantidad y available checkbox.
- Equipment: selector de equipos desde asset/equipment inventory. Cada equipo con cantidad y certificateRequired checkbox.
- Materials: lista dinámica de materiales (descripción, cantidad, unidad). Botón "Agregar fila".
- Worker Requirements: inputs numéricos para electricistas, tecnicos telecomunicacion, instrumentistas, obreros.
- PPE: lista dinámica de elementos de protección personal.

**Paso 3 — Safety:**
- AST Required: toggle switch. Si se activa, mostrar campo obligatorio para adjuntar documento AST.
- PTW Required: toggle switch. Si se activa, mostrar campo obligatorio para adjuntar documento PTW.
- Support Documents: lista de documentos de apoyo con tipo (atp/ast/ptw/procedure/sds/checklist/certification), upload de archivo, required checkbox.
- Safety Elements: lista dinámica de elementos de seguridad.

**Paso 4 — Certifications:**
- Required Certifications: lista de certificaciones requeridas con nombre, roles requeridos, verified checkbox.
- Verificación automática: al seleccionar crew y equipment, verificar si tienen las certificaciones requeridas.

**Paso 5 — Review:**
- Resumen de todos los pasos anteriores en formato de solo lectura
- Readiness Checklist: lista de items de verificación pre-ejecución
- Cost Baseline Snapshot: resumen de costos laborales, materiales, equipos, total
- Botón "Enviar para aprobación" (cambia status a "ready" o "blocked")
- Readiness check: mostrar blockers si existen (usando planning.rules.ts)

**Contrato requerido:** CreatePlanningPacketSchema, UpdatePlanningPacketSchema, ApprovePlanningPacketSchema (ya existen en shared-types)

**Backend requerido:** Ya existe. Endpoints:
- POST /api/planning-packet — crear
- GET /api/planning-packet/:id — obtener
- PUT /api/planning-packet/:id — actualizar
- POST /api/planning-packet/:id/approve — aprobar
- POST /api/planning-packet/:id/reopen — reabrir
- GET /api/planning-packet/:id/readiness — reporte de readiness

**Frontend requerido:**
- PlanningWizard component con 5 step components
- planning-api.ts con todas las llamadas
- queries.ts con hooks useCreatePlanningPacket, useUpdatePlanningPacket, useApprovePlanningPacket, usePlanningReadiness

**Estados UI:**
- Loading: skeleton del wizard mientras carga datos
- Error: card de error con retry si falla carga de orden o planificación existente
- Empty: formulario vacío para crear nuevo planning (sin datos previos)
- Forbidden: si el usuario no tiene rol para planificar
- Offline: banner de modo offline (planning es funcionalidad que requiere backend)

**Pruebas requeridas:**
- Unit: PlanningWizard step navigation (ir al paso 2, volver al paso 1, etc.)
- Unit: ScheduleStep form validation (fechas válidas, horas positivas)
- Unit: ResourcesStep crew selection from mocked user list
- Unit: SafetyStep AST/PTW toggle and document upload
- Integration: Create planning packet via API
- Integration: Approve planning packet via API
- Integration: Readiness gate evaluation

**Validación manual:**
1. Navegar a /orders/[id]/planning para una orden existente
2. Completar los 5 pasos del wizard
3. Verificar que se crea el planning packet en backend
4. Verificar readiness check muestra blockers
5. Enviar para aprobación
6. Aprobar desde otro rol
7. Verificar que la orden ahora puede ejecutarse

**Comandos:**
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npx react-doctor@latest --verbose
```

**Criterio de aceptación:**
- ✅ Wizard tiene 5 pasos navegables con Anterior/Siguiente
- ✅ Paso Schedule guarda fechas y horas
- ✅ Paso Resources permite seleccionar crew desde DB
- ✅ Paso Resources permite seleccionar tools/equipment desde inventario
- ✅ Paso Safety tiene toggle AST/PTW con upload obligatorio
- ✅ Paso Review muestra resumen y readiness blockers
- ✅ Se puede crear planning packet completo
- ✅ Se puede enviar a aprobación
- ✅ Se puede aprobar con RBAC
- ✅ Tests unitarios e integración pasan
- ✅ React Doctor 100/100

**Qué NO hacer:**
- No modificar shared-types planning-packet.schema.ts
- No modificar backend planning-packet service/controller/routes
- No modificar domain planning.rules.ts
- No instalar dependencias nuevas
- No eliminar ReadinessGate hasta que el wizard esté completo y verificado

**Dependencias:** S1 (opcional para planificar flota en resources)

**Evidencia requerida:**
- `.sisyphus/evidence/sprint-02/before-desktop.png` — estado actual de /orders/[id]/planning
- `.sisyphus/evidence/sprint-02/after-desktop.png` — wizard funcionando con datos
- `.sisyphus/evidence/sprint-02/after-mobile.png` — wizard responsivo
- `.sisyphus/evidence/sprint-02/product-slice-report.md` — reporte de slice funcional

---

### Ticket PLN-02: Cockpit timeline visual profesional

**ID:** PLN-02
**Sprint:** 2
**Prioridad:** P1 (Alta)
**Título:** Mejorar CockpitPanel con timeline visual profesional de 14 pasos, blockers, inherited fields y acciones permitidas
**Tipo:** frontend
**Módulo:** cockpit
**Ruta visible:** /service-cases/[id]/cockpit

**Problema:** El cockpit actual muestra los 14 pasos pero de forma básica. No hereda datos entre pasos, no muestra blocked reasons, no muestra allowed actions claramente, no tiene diseño responsivo.

**Causa raíz:** Cockpit se implementó como MVP funcional y no se mejoró.

**Usuario afectado:** Todos los roles que necesitan ver el progreso del caso.

**Valor empresarial:** Visibilidad clara del estado de cada paso acelera la toma de decisiones y reduce bloqueos.

**Archivos exactos a abrir:**
- `frontend/src/modules/cockpit/` (todos los archivos)
- `frontend/src/app/(dashboard)/service-cases/[id]/cockpit/page.tsx`
- `packages/shared-types/src/schemas/service-case-step-context.schema.ts` (206 líneas)
- `packages/domain/src/operational-steps.ts` (324 líneas)

**Archivos exactos a modificar:**
- Componentes de cockpit para timeline visual

**Código o estructura esperada:**
- Timeline vertical con 14 pasos en orden
- Cada paso muestra:
  - Número, nombre, estado (pending=gray, available=blue, in_progress=yellow, completed=green, blocked=red)
  - Fecha de completado
  - Responsable
  - Bloqueos como badges rojos con tooltip (si blocked)
  - Acciones permitidas como botones (si available/in_progress)
  - Datos heredados del paso anterior (si aplica)

**Criterio de aceptación:**
- Timeline visual con colores, bloqueos, acciones, responsables
- Responsivo en mobile
- Carga datos reales desde backend

---

## Anexo B: Desglose Detallado de Tickets Sprint 3 — Execution Offline

### Ticket EXE-01: Execution session offline mejorada

**ID:** EXE-01
**Sprint:** 3
**Prioridad:** P1 (Alta)
**Título:** Mejorar ExecutionSession UI con todos los campos del schema y modo offline funcional
**Tipo:** frontend + backend
**Módulo:** execution
**Ruta visible:** /execution-sessions/[id]

**Problema:** La sesión de ejecución tiene schema completo (checklist, evidencias, firma, materiales, horas, incidentes, GPS) pero la UI no explota todo. El modo offline no está probado.

**Archivos exactos a abrir:**
- `packages/shared-types/src/schemas/execution-session.schema.ts`
- `packages/shared-types/src/schemas/execution-evidence.schema.ts`
- `packages/shared-types/src/schemas/execution-labor.schema.ts`
- `packages/shared-types/src/schemas/execution-signature.schema.ts`
- `packages/shared-types/src/schemas/execution-equipment.schema.ts`
- `packages/shared-types/src/schemas/execution-gps.schema.ts`
- `packages/domain/src/execution.ts` (223 líneas)
- `backend/src/modules/execution-session/`
- `frontend/src/modules/execution/`
- `frontend/src/lib/pwa/offline-queue.ts`
- `frontend/src/store/queueStore.ts`

**Criterio de aceptación:**
- Sesión de ejecución completa con todos los campos del schema
- CheckList offline funcional (guardar en IndexedDB, sync cuando vuelva conexión)
- Fotos offline con cola de sync
- Firma offline
- Registro de materiales y horas hombre
- Gestión de incidentes
- Indicador de estado de sincronización visible
- Bloqueos de domain execution.ts reflejados en UI

---

## Anexo C: Desglose Detallado de Tickets Sprint 4 — Evidence Professional

### Ticket EVD-01: Galería profesional de evidencias

**ID:** EVD-01
**Sprint:** 4
**Prioridad:** P1 (Alta)
**Título:** Rediseñar galería de evidencias con metadatos, geolocalización, hash, exportación PDF
**Tipo:** frontend
**Módulo:** evidences
**Ruta visible:** /evidences

**Problema:** La galería actual es básica. No muestra metadatos (timestamp, geolocalización, hash), no permite exportar, no tiene control de versiones.

**Criterio de aceptación:**
- Galería con thumbnails, grid responsivo
- Cada evidencia muestra: timestamp, geolocalización (mapa si aplica), hash, relación con paso
- Subida múltiple con drag-drop y cámara
- Exportación de galería a PDF
- Control de versiones (cambios trackeados)

---

## Anexo D: Desglose Detallado de Tickets Sprint 5 — Reports Professional

### Ticket INF-01: Generación automática de PDF

**ID:** INF-01
**Sprint:** 5
**Prioridad:** P1 (Alta)
**Título:** Generar PDF de informe técnico automáticamente al completar ejecución
**Tipo:** backend + frontend
**Módulo:** reports
**Ruta visible:** /reports

**Problema:** Actualmente los informes se crean manualmente. Deberían generarse automáticamente cuando una ejecución se completa.

**Criterio de aceptación:**
- Evento en backend: al completar execution, crear borrador de technical report
- PDF generado con datos de orden, planning, execution, evidencias
- PDF descargable desde /reports/[id]
- Control de versiones del informe

---

## Anexo E: Desglose Detallado de Tickets Sprint 6 — SES/Invoice/Payment

### Ticket SES-01: Dashboard de SES con trazabilidad

**ID:** SES-01
**Sprint:** 6
**Prioridad:** P1 (Alta)
**Título:** Crear dashboard de SES con trazabilidad visual hasta factura
**Tipo:** frontend
**Módulo:** billing
**Ruta visible:** /billing/ses

**Problema:** SES existe como CRUD básico. No hay visibilidad de qué SES están pendientes, aprobados, facturados.

**Criterio de aceptación:**
- Dashboard con tabla de SES filtrable por estado (pending, approved, invoiced)
- Alerta de SES pendientes > 7 días
- Botón "Crear factura" desde SES aprobado
- Timeline visual SES → Invoice → Payment

---

### Ticket FAC-01: Dashboard de facturación

**ID:** FAC-01
**Sprint:** 6
**Prioridad:** P1 (Alta)
**Título:** Crear dashboard de facturas con alertas de vencimiento
**Tipo:** frontend
**Módulo:** invoices
**Ruta visible:** /billing/invoices

**Criterio de aceptación:**
- Dashboard con estado de cada factura
- Alertas de facturas próximas a vencer
- Botón "Registrar pago" desde factura aprobada

---

## Anexo F: Desglose Detallado de Tickets Sprint 7 — Costos y Rentabilidad

### Ticket CST-01: Dashboard de costos comparativo

**ID:** CST-01
**Sprint:** 7
**Prioridad:** P1 (Alta)
**Título:** Crear dashboard de costos con comparación propuesta vs real
**Tipo:** frontend + backend
**Módulo:** costs
**Ruta visible:** /costs

**Problema:** 5 schemas de costo existen pero no hay UI que compare propuesta vs real. El cost baseline snapshot existe en planning pero no se usa después.

**Criterio de aceptación:**
- Endpoint GET /api/costs/[orderId]/variance que devuelva propuesta vs real por categoría
- UI con tabla comparativa: labor, materials, equipment, transport, total
- Cálculo de desviación (%) por categoría
- Cálculo de rentabilidad (margen = propuesta - costo real)
- Alerta visual si desviación > 10%
- Gráfico de barras comparativo (Recharts)

---

## Anexo G: Desglose Detallado de Tickets Sprint 8 — Dashboard KPIs

### Ticket KPI-01: Endpoint unificado de dashboard

**ID:** KPI-01
**Sprint:** 8
**Prioridad:** P1 (Alta)
**Título:** Crear endpoint GET /api/dashboard/operational-summary con datos reales
**Tipo:** backend
**Módulo:** dashboard
**Ruta visible:** /dashboard

**Problema:** Los KPIs del dashboard actual pueden estar desconectados de backend real.

**Criterio de aceptación:**
- Endpoint que devuelva: total orders, by status, overdue orders, pending SES, pending invoices, pending payments, cost variance, document compliance, evidence compliance, fleet alerts, offline queue size
- Datos calculados desde MongoDB (no mock)
- Cache con staleTime apropiado

### Ticket KPI-02: Widgets de dashboard

**ID:** KPI-02
**Sprint:** 8
**Prioridad:** P1 (Alta)
**Título:** Conectar widgets de dashboard al endpoint real
**Tipo:** frontend
**Módulo:** dashboard
**Ruta visible:** /dashboard

**Criterio de aceptación:**
- Widget de órdenes atrasadas con lista
- Widget de SES pendientes con alerta si > 0
- Widget de facturas pendientes con días de retraso
- Widget de costos desviados con porcentaje
- Widget de cumplimiento documental con barra de progreso
- Widget de alertas de flota
- Widget de estado offline
- Todos conectados a backend real

---

## Anexo H: Desglose Detallado de Tickets Sprint 9 — Portal Cliente

### Ticket PRT-01: Auditoría de portal existente

**ID:** PRT-01
**Sprint:** 9
**Prioridad:** P1 (Alta)
**Título:** Auditar funcionalidad actual del módulo portal y determinar brechas
**Tipo:** documentación
**Módulo:** portal
**Ruta visible:** /portal

**Problema:** Portal existe como módulo backend y frontend pero no se ha verificado su funcionalidad real.

**Criterio de aceptación:**
- Reporte de auditoría del portal: qué funciona, qué no, qué falta
- Mapa de rutas del portal
- Pruebas de cada funcionalidad

---

## Anexo I: Desglose Detallado de Tickets Sprint 10 — Dynamic Forms

### Ticket FRM-01: Constructor de templates

**ID:** FRM-01
**Sprint:** 10
**Prioridad:** P1 (Alta)
**Título:** Crear constructor visual de templates de formularios dinámicos
**Tipo:** frontend
**Módulo:** forms
**Ruta visible:** /forms

**Problema:** dynamic-form-template.schema.ts existe pero constructor UI no.

**Criterio de aceptación:**
- Constructor drag-drop con tipos de campo: text, number, date, select, checkbox, photo, signature
- Versionado de templates
- Publicación controlada (draft/published/archived)
- Preview del formulario antes de publicar

---

## Anexo J: Desglose Detallado de Tickets Sprint 11 — Backups/Audit

### Ticket BAK-01: UI de backups

**ID:** BAK-01
**Sprint:** 11
**Prioridad:** P2 (Media)
**Título:** Crear página de administración de backups con estado y ejecución
**Tipo:** frontend
**Módulo:** admin-backup
**Ruta visible:** /admin/backups

**Criterio de aceptación:**
- Tabla de backups con fecha, tamaño, estado, tipo
- Botón "Ejecutar backup ahora"
- Descarga de backups
- Configuración de retención

### Ticket BAK-02: UI de auditoría

**ID:** BAK-02
**Sprint:** 11
**Prioridad:** P2 (Media)
**Título:** Crear página de consulta de auditoría forense
**Tipo:** frontend
**Módulo:** audit
**Ruta visible:** /admin/audit

**Criterio de aceptación:**
- Tabla de eventos de auditoría con filtros por entidad, acción, usuario, fecha
- Paginación
- Exportación CSV
- Solo accesible para rol gerente

---

## Anexo K: Desglose Detallado de Tickets Sprint 12 — E2E + VPS

### Ticket E2E-02: Playwright flujo 14 pasos

**ID:** E2E-02
**Sprint:** 12
**Prioridad:** P0 (Crítica)
**Título:** Crear prueba E2E del flujo completo de 14 pasos con Playwright
**Tipo:** test
**Módulo:** e2e
**Ruta visible:** Todas

**Problema:** No existe prueba E2E que recorra los 14 pasos del flujo CERMONT desde solicitud hasta pago.

**Criterio de aceptación:**
- Seed de datos realista (cliente, sitio, usuario con rol gerente)
- Test crea: solicitud → visita → propuesta → PO → planning → ejecución → evidencias → informe → acta → firma → SES → factura → aprobación → pago
- Verifica bloqueos entre pasos
- Verifica RBAC en cada paso
- Verifica estado final de cada entidad

### Ticket E2E-06: Docker + PM2 + Nginx

**ID:** E2E-06
**Sprint:** 12
**Prioridad:** P2 (Media)
**Título:** Preparar Docker multi-stage + PM2 + Nginx para producción VPS
**Tipo:** infraestructura
**Módulo:** devops
**Ruta visible:** N/A

**Criterio de aceptación:**
- Dockerfile multi-stage para backend (build + production)
- Dockerfile multi-stage para frontend (build + nginx o next standalone)
- docker-compose.yml con backend + frontend + mongodb
- PM2 ecosystem.config.js con max_memory_restart
- Scripts de backup diario (mongodump)
- Scripts de rollback

---

## Anexo L: Análisis Detallado de Archivos Backend No Expuestos en UI

### L.1 fleet.service.ts (502 líneas) — Funciones no expuestas

| Función | Línea | Qué hace | UI que debería tener | Sprint |
|---------|-------|----------|---------------------|--------|
| checkoutVehicle | 387-435 | Registra salida con kilometraje, combustible, fotos. Valida que kilometraje >= actual. Crea audit log. | Botón "Checkout" en /fleet/[id] con formulario wizard | S1 |
| checkinVehicle | 437-485 | Registra entrada con kilometraje, combustible, fotos. Valida que kilometraje >= checkout. Limpia driverId/driverName. Crea audit log. | Botón "Checkin" en /fleet/[id] con formulario wizard | S1 |
| getVehicleAssignmentHistory | 487-494 | Devuelve todas las asignaciones ordenadas por fecha descendente, populando driver y assignedBy. | Sección "Historial de asignaciones" en /fleet/[id] | S1 |
| getActiveAssignment | 496-502 | Devuelve asignación activa (pending/active) populada. | Badge "Conductor activo" en /fleet/[id] | S1 |
| getExpiringDocuments | 178-214 | Calcula documentos próximos a vencer dentro de N días (30 por defecto). Ordena por fecha. | Widget "Alertas documentales" en dashboard | S1 |
| uploadVehiclePhoto | 227-264 | Sube foto, la asocia al vehículo, establece como primary si es la primera. | Sección de fotos en NewVehicleDrawer | S1 |
| setPrimaryVehiclePhoto | 266-286 | Cambia qué foto es la principal. Crea audit log. | Botón "Establecer como principal" en FleetPhotoGallery | S1 |
| deleteVehiclePhoto | 304-339 | Soft delete de foto. Si era primary, reasigna a la siguiente disponible. | Botón "Eliminar" en FleetPhotoGallery | S1 |

### L.2 planning-packet.service.ts — Funciones no expuestas

| Función | Qué hace | UI que debería tener | Sprint |
|---------|----------|---------------------|--------|
| createPlanningPacket | Crear planning packet completo | PlanningWizard paso a paso | S2 |
| updatePlanningPacket | Actualizar planning packet | PlanningWizard en modo edición | S2 |
| approvePlanningPacket | Aprobar planning (cambia status a approved) | Botón "Aprobar" con RBAC | S2 |
| reopenPlanningPacket | Reabrir planning con motivo | Botón "Reabrir" con campo motivo | S2 |
| getPlanningReadinessReport | Obtener reporte de readiness | Readiness gate con blockers visibles | S2 |
| applyKitTemplate | Aplicar kit como autofill | Botón "Aplicar kit" en ResourcesStep | S2 |

### L.3 execution-session.service.ts — Funciones

| Función | UI que debería tener | Sprint |
|---------|---------------------|--------|
| createExecutionSession | Botón "Iniciar ejecución" desde planning aprobado | S3 |
| startExecution | Botón "Iniciar" en sesión | S3 |
| pauseExecution | Botón "Pausar" | S3 |
| resumeExecution | Botón "Reanudar" | S3 |
| completeExecution | Botón "Completar" con validación de blockers | S3 |
| cancelExecution | Botón "Cancelar" con motivo | S3 |

---

## Anexo M: Análisis Detallado de Componentes Frontend a Crear/Modificar

### M.1 Nuevos Componentes a Crear

| Componente | Módulo | Propósito | Sprint | Archivo |
|------------|--------|-----------|--------|---------|
| NewVehicleDrawer (refactor) | fleet | Formulario creación vehículo sin Record<string,unknown> | S1 | fleet/ui/NewVehicleDrawer.tsx |
| UseAssignments | fleet | Hook para checkout/checkin/history | S1 | fleet/hooks/useAssignments.ts |
| MaintenanceTab | fleet | Pestaña de mantenimiento en detalle vehículo | S1 | fleet/ui/MaintenanceTab.tsx |
| PlanningWizard | planning | Wizard multi-paso de planeación | S2 | planning/ui/PlanningWizard.tsx |
| ScheduleStep | planning | Paso 1: cronograma | S2 | planning/ui/steps/ScheduleStep.tsx |
| ResourcesStep | planning | Paso 2: recursos (crew, tools, equipment, materials, PPE) | S2 | planning/ui/steps/ResourcesStep.tsx |
| SafetyStep | planning | Paso 3: AST, PTW, documentos seguridad | S2 | planning/ui/steps/SafetyStep.tsx |
| CertificationsStep | planning | Paso 4: certificaciones requeridas | S2 | planning/ui/steps/CertificationsStep.tsx |
| ReviewStep | planning | Paso 5: resumen, readiness, envío | S2 | planning/ui/steps/ReviewStep.tsx |
| PlanningApi | planning | API service para planning packet | S2 | planning/api/planning-api.ts |
| CockpitTimeline | cockpit | Timeline visual 14 pasos | S2 | cockpit/ui/CockpitTimeline.tsx |

### M.2 Componentes a Extender/Mejorar

| Componente | Cambio | Sprint |
|------------|--------|--------|
| FleetPhotoGallery | Agregar setPrimaryPhoto, deletePhoto, metadata display | S1 |
| VehicleAssignmentPanel | Agregar checkout/checkin wizard | S1 |
| FleetReadinessBadge | Conectar a evaluateFleetReadiness de domain | S1 |
| Dashboard page | Agregar widgets de alertas flota | S1 |
| ExecutionSession page | Agregar offline mode, sync indicator | S3 |
| EvidenceGallery | Agregar metadatos, geolocalización, PDF export | S4 |
| Reports page | Agregar generación PDF automática | S5 |

---

## Anexo N: Estrategia de Datos Seed por Sprint

### Sprint 1 — Fleet Seed
```javascript
// seed/fleet.js
db.vehicles.insertMany([
  {
    plate: "ABC-123", brand: "Toyota", model: "Hilux", year: 2022,
    type: "camioneta", capacity: "1 ton", driverName: "Juan Pérez",
    soatExpiry: ISODate("2026-12-31"), technoMechanicalExpiry: ISODate("2026-10-15"),
    insuranceExpiry: ISODate("2026-08-20"), kilometers: 15000,
    status: "active"
  },
  {
    plate: "DEF-456", brand: "Chevrolet", model: "NHR", year: 2021,
    type: "camion", capacity: "3 ton", driverName: "Carlos López",
    soatExpiry: ISODate("2025-06-30"), // VENCIDO
    technoMechanicalExpiry: ISODate("2026-11-01"),
    insuranceExpiry: ISODate("2026-09-15"), kilometers: 45000,
    status: "active"
  },
  {
    plate: "GHI-789", brand: "Yamaha", model: "XTZ", year: 2023,
    type: "moto", driverName: "Pedro Ramírez",
    soatExpiry: ISODate("2026-12-31"), technoMechanicalExpiry: ISODate("2026-12-31"),
    insuranceExpiry: ISODate("2026-12-31"), kilometers: 5000,
    status: "maintenance"
  }
]);
```

### Sprint 2 — Planning Seed
```javascript
// seed/planning.js — Planning packet completo
{
  workOrderId: ObjectId("..."),
  scope: "Mantenimiento preventivo de equipos de refrigeración en planta",
  schedule: { plannedStartAt: ISODate("2026-07-15"), plannedEndAt: ISODate("2026-07-18"), estimatedDurationHours: 24 },
  crew: [{ userId: ObjectId("..."), name: "Carlos López", role: "tecnico" }],
  tools: [{ name: "Multímetro digital", quantity: 2, available: true }],
  equipment: [{ name: "Compresor portátil", quantity: 1, certificateRequired: true }],
  safetyElements: [{ description: "Guantes dieléctricos", quantity: 4 }],
  astRequired: true, ptwRequired: false,
  readinessChecklist: [{ itemId: "AST_001", label: "AST diligenciado y firmado", checked: false }],
  status: "draft"
}
```

### Sprint 3 — Execution Seed
```javascript
// seed/execution.js — Sesión de ejecución
{
  workOrderId: ObjectId("..."),
  planningPacketId: ObjectId("..."),
  status: "in_progress",
  startedAt: ISODate("2026-07-16"),
  checklistResponseCount: 3,
  evidenceCount: 5,
  signatureCount: 0,
  laborEntryCount: 2,
  materialUsageCount: 1
}
```

---

## Anexo O: Reglas Anti-Alucinación para el Programador

Estas reglas son obligatorias. Si se violan, el ticket se considera mal ejecutado:

1. **No inventar archivos.** Si un archivo listado en el plan no existe, ejecutar `Get-ChildItem -Recurse -Filter "*patrón*"` para encontrar la ruta correcta. Reportar la diferencia.

2. **No inventar contenido.** Si un archivo existe pero no tiene el contenido esperado, documentarlo y ajustar el plan. No asumir que tiene lo que el plan dice.

3. **No marcar "completo" sin verificar.** Para cada criterio del DoD, ejecutar el comando de verificación o tomar la captura. No marcar basado en suposición.

4. **No avanzar de ticket sin DoD completo.** Un ticket no está completo hasta que los 20 puntos del DoD se cumplan.

5. **No decir "ya existe".** La frase "ya existe, por tanto está completo" está PROHIBIDA. Solo se acepta "existe y fue validado con screenshot + test + datos reales".

6. **No eliminar funcionalidad existente.** Si se encuentra código legacy que parece duplicado, no eliminarlo sin verificar que no haya referencias.

7. **No modificar tooling/quality.** Los scripts de quality gates y baselines no se tocan. Reportar si un gate falla por cambios.

8. **No instalar dependencias.** Si un ticket requiere una dependencia nueva, crear ADR y obtener autorización antes de modificar package.json.

9. **No usar hacks de tipos.** Prohibido: `any`, `unknown`, `null`, `undefined`, `as any`, `@ts-ignore`, `@ts-expect-error`.

10. **No mock en producción.** Los datos mock solo se usan en tests. Si el backend no tiene datos, crear seed, no mock.

---

## Anexo P: Checklist de Validación Post-Implementación

Después de CADA ticket, ejecutar esta checklist:

```markdown
## Post-Implementation Validation

### TypeScript
- [ ] `npm run typecheck -w frontend` — 0 errors
- [ ] `npm run typecheck -w backend` — 0 errors (si backend modificado)
- [ ] `npm run typecheck` (root) — 0 errors

### Lint
- [ ] `npm run lint -w frontend` — 0 errors
- [ ] `npm run lint -w backend` — 0 errors (si backend modificado)

### Tests
- [ ] `npm run test -w frontend` — tests pasan
- [ ] `npm run test -w backend` — tests pasan (si backend modificado)
- [ ] Tests específicos del módulo creados

### Build
- [ ] `npm run build -w frontend` — build exitoso
- [ ] `npm run build -w backend` — build exitoso (si backend modificado)

### Quality
- [ ] `npm run quality:strict` — 10/10 gates
- [ ] `npx react-doctor@latest --verbose` — 100/100

### Contracts
- [ ] `npm run contracts:check` — snapshot match
- [ ] Schema importado desde shared-types (no local)

### UI
- [ ] Loading state visible
- [ ] Error state visible con retry
- [ ] Empty state visible con CTA
- [ ] Forbidden state si aplica
- [ ] Offline state si aplica (banner + cola)
- [ ] RBAC verificado
- [ ] Responsive en mobile (375px)

### Evidence
- [ ] Screenshot desktop ANTES
- [ ] Screenshot mobile ANTES
- [ ] Screenshot desktop DESPUÉS
- [ ] Screenshot mobile DESPUÉS
- [ ] Product slice report creado
```

---

## Anexo Q: Tabla de Dependencias entre Tickets

| Ticket | Depende de | Sprint | Nota |
|--------|-----------|--------|------|
| FLT-01 | Ninguna | S1 | Puede ejecutarse primero |
| FLT-02 | FLT-01 | S1 | Comparte NewVehicleDrawer patterns |
| FLT-03 | FLT-02 | S1 | Comparte /fleet/[id] page |
| FLT-04 | FLT-01 | S1 | Usa fleet-api.ts extendido |
| FLT-05 | Ninguna | S1 | Independiente |
| PLN-01 | Ninguna (S1 recomendado) | S2 | Puede empezar sin S1 |
| PLN-02 | Ninguna | S2 | Independiente |
| EXE-01 | PLN-01 | S3 | Execution necesita planning aprobado |
| EXE-02..08 | EXE-01 | S3 | Subsistemas de execution |
| EVD-01 | EXE-01 | S4 | Evidencias de execution |
| INF-01 | EVD-01 | S5 | Informes con fotos de evidencias |
| SES-01 | INF-01 | S6 | SES necesita acta firmada |
| FAC-01 | SES-01 | S6 | Factura necesita SES |
| CST-01 | EXE-01 | S7 | Costos de execution |
| KPI-01 | S1-S7 | S8 | Dashboard necesita datos de todos |
| PRT-01 | S2 | S9 | Portal necesita service cases |
| FRM-01 | S2 | S10 | Forms para planning checklists |
| BAK-01 | S6 | S11 | Backups de datos administrativos |
| E2E-02 | S1-S11 | S12 | Depende de toda la implementación |

---

## Anexo R: Glosario de Términos CERMONT

| Término | Significado |
|---------|-------------|
| AST | Análisis de Seguridad en el Trabajo |
| PTW | Permiso de Trabajo (Permit to Work) |
| SES | Service Entry Sheet — Acta de recibo a satisfacción |
| EPP | Elementos de Protección Personal |
| SOAT | Seguro Obligatorio de Accidentes de Tránsito (Colombia) |
| FSM | Field Service Management |
| CMMS | Computerized Maintenance Management System |
| GMAO | Gestión de Mantenimiento Asistida por Ordenador |
| ERP | Enterprise Resource Planning |
| EAM | Enterprise Asset Management |
| RBAC | Role-Based Access Control |
| SSOT | Single Source of Truth |
| DoD | Definition of Done |
| E2E | End-to-End (test) |
| MVP | Minimum Viable Product |
| MO | Mano de Obra |
| CCTV | Circuito Cerrado de Televisión |
| DLQ | Dead Letter Queue (cola de mensajes fallidos) |
| ADR | Architecture Decision Record |
| VPS | Virtual Private Server |
| PM2 | Process Manager 2 (Node.js) |

---

## Anexo S: Referencia Rápida de Comandos

### Verificación completa (después de cada sprint)
```powershell
npm run verify
```

### Verificación solo frontend
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npx react-doctor@latest --verbose
```

### Verificación solo backend
```powershell
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
```

### Verificación shared-types/domain
```powershell
npm run verify:shared-types
npm run verify:domain
npm run contracts:check
```

### Quality gates
```powershell
npm run quality:strict
```

### E2E tests
```powershell
npm run test:e2e -w frontend -- tests/e2e/flujo-14-pasos.spec.ts
npm run test:e2e -w frontend -- tests/e2e/offline.spec.ts
npm run test:e2e -w frontend -- tests/e2e/rbac.spec.ts
```

### Docker
```powershell
docker build -f docker/Dockerfile.backend -t cermont-backend .
docker build -f docker/Dockerfile.frontend -t cermont-frontend .
docker-compose -f docker/docker-compose.yml up
```

---

## Anexo T: Desglose Detallado de Tickets Sprint 3 — Execution Offline (Formato Completo)

### Ticket EXE-01: ExecutionSession UI completa

**ID:** EXE-01
**Sprint:** 3
**Prioridad:** P1 (Alta)
**Título:** Mejorar ExecutionSession UI con todos los campos del schema execution-session y blockers de domain execution.ts
**Tipo:** frontend
**Módulo:** execution
**Ruta visible:** /execution-sessions/[id]

**Problema:** La UI de execution session actual no muestra todos los campos del schema execution-session (checklistResponseCount, evidenceCount, signatureCount, laborEntryCount, materialUsageCount, openCriticalIncidentCount, pendingSyncCount). Tampoco muestra los blockers calculados por domain execution.ts (calculateExecutionBlockers) ni los next actions (calculateExecutionNextActions).

**Causa raíz:** La UI se implementó antes de que el schema y domain maduraran.

**Usuario afectado:** Operadores y técnicos en campo.

**Valor empresarial:** Ejecución completa reduce retrabajos y mejora documentación.

**Archivos exactos a abrir:**
- `packages/shared-types/src/schemas/execution-session.schema.ts`
- `packages/domain/src/execution.ts` (223 líneas)
- `frontend/src/modules/execution/`
- `frontend/src/app/(dashboard)/execution-sessions/[id]/page.tsx`
- `backend/src/modules/execution-session/execution-session.service.ts`
- `backend/src/modules/execution-session/execution-session.controller.ts`
- `backend/src/modules/execution-session/execution-session.routes.ts`

**Archivos exactos a modificar:**
- `frontend/src/app/(dashboard)/execution-sessions/[id]/page.tsx`
- `frontend/src/modules/execution/` (múltiples componentes)

**Código o estructura esperada:**
- Sección de progreso: checklist completado, evidencias subidas, firmas, horas registradas, materiales
- Bloqueos visibles: planning no aprobado, evidencias faltantes, incidentes abiertos, sync pendiente
- Acciones sugeridas: "Completar checklist", "Subir evidencias", "Registrar horas", "Resolver incidente"
- Botones: Iniciar, Pausar, Reanudar, Completar, Cancelar (según estado)
- Indicador de estado de sincronización

**Contrato requerido:** ExecutionSession schema (ya existe)

**Backend requerido:** Ya existe

**Estados UI:** Loading, Error, Empty, Forbidden, Offline

**Pruebas requeridas:**
- Unit: Execution blockers display
- Integration: Execution lifecycle

**Criterio de aceptación:**
- ✅ Muestra blockers de domain execution.ts
- ✅ Muestra next actions
- ✅ Botones de acción según estado
- ✅ Indicador offline

---

### Ticket EXE-02: Checklist offline funcional

**ID:** EXE-02
**Sprint:** 3
**Prioridad:** P1 (Alta)
**Título:** Implementar checklist offline funcional con IndexedDB y cola de sync
**Tipo:** frontend
**Módulo:** execution
**Ruta visible:** /execution-sessions/[id]

**Problema:** El checklist durante execution session no funciona offline. Si no hay conexión, no se puede completar.

**Archivos exactos a abrir:**
- `frontend/src/lib/pwa/offline-queue.ts`
- `frontend/src/store/queueStore.ts`
- `frontend/public/service-worker.js`
- `packages/shared-types/src/schemas/checklist.schema.ts`
- `packages/shared-types/src/schemas/form-submission.schema.ts`

**Código o estructura esperada:**
- Checklist items cargados de template al iniciar sesión
- Cada item es checkeable offline (guardar en IndexedDB)
- Al recuperar conexión: sync automático con cola
- Indicador de items pendientes de sync
- Manejo de conflictos (último escritor gana con timestamp)

**Criterio de aceptación:**
- ✅ Checklist funciona sin conexión
- ✅ Items se guardan en IndexedDB
- ✅ Sync automático al recuperar conexión
- ✅ Indicador de estado visible

---

## Anexo U: Desglose Detallado de Tickets Sprint 4 — Evidence (Formato Completo)

### Ticket EVD-01: Galería profesional de evidencias

**ID:** EVD-01
**Sprint:** 4
**Prioridad:** P1 (Alta)
**Título:** Rediseñar galería de evidencias con metadatos, geolocalización, hash, subida múltiple y exportación PDF
**Tipo:** frontend + backend
**Módulo:** evidences
**Ruta visible:** /evidences

**Problema:** La galería actual es básica (lista de imágenes). No muestra metadatos (timestamp, geolocalización, hash), no permite exportar, no tiene galería por orden/paso.

**Archivos exactos a abrir:**
- `packages/shared-types/src/schemas/evidence.schema.ts`
- `packages/shared-types/src/schemas/evidence-collection.schema.ts`
- `packages/shared-types/src/schemas/execution-evidence.schema.ts`
- `packages/shared-types/src/schemas/execution-gps.schema.ts`
- `backend/src/modules/evidence/evidence.service.ts`
- `backend/src/modules/evidence/evidence.controller.ts`
- `backend/src/modules/evidence/evidence.routes.ts`
- `frontend/src/modules/evidences/`
- `frontend/src/app/(dashboard)/evidences/page.tsx`

**Archivos exactos a modificar:**
- `frontend/src/modules/evidences/ui/EvidenceGallery.tsx` — REDISEÑAR
- `frontend/src/modules/evidences/ui/EvidenceUpload.tsx` — MEJORAR
- `frontend/src/modules/evidences/api/evidence-api.ts` — EXTENDER
- `frontend/src/modules/evidences/queries.ts` — EXTENDER
- `backend/src/modules/evidence/evidence.service.ts` — EXTENDER (export PDF)

**Código o estructura esperada:**
- Galería responsiva en grid con thumbnails
- Cada evidencia muestra: timestamp, geolocalización (mini mapa Leaflet), hash SHA-256, paso del flujo, componente asociado
- Subida múltiple con drag-drop (react-dropzone) y captura desde cámara
- Filtros: por orden, por paso, por fecha, por tipo
- Exportar galería a PDF (pdf-lib backend)
- Control de versiones (cada cambio guarda historial)

**Backend requerido:**
- Endpoint existente GET /api/evidences/:entityType/:entityId
- Endpoint existente POST /api/evidences/upload
- Nuevo endpoint GET /api/evidences/:id/export-pdf

**Estados UI:** Loading (galería), Error (con retry), Empty (sin evidencias, CTA para subir), Offline (banner + cola)

**Pruebas requeridas:**
- Unit: Gallery rendering with mock data
- Unit: File upload validation
- Integration: Evidence CRUD
- Integration: PDF export endpoint

**Criterio de aceptación:**
- ✅ Galería responsiva con thumbnails
- ✅ Cada evidencia muestra timestamp + geolocalización + hash
- ✅ Subida múltiple con drag-drop y cámara
- ✅ Exportación a PDF
- ✅ Filtros por orden/paso/fecha
- ✅ Control de versiones

### Ticket EVD-02: File manager profesional

**ID:** EVD-02
**Sprint:** 4
**Prioridad:** P2 (Media)
**Título:** Mejorar gestor documental con organización por entidad, versionado y control de acceso
**Tipo:** frontend
**Módulo:** documents
**Ruta visible:** /documents

**Criterio de aceptación:**
- Documentos organizados por entidad (orden, vehículo, cliente)
- Versionado de documentos
- Control de acceso por RBAC
- Upload drag-drop con validación MIME

---

## Anexo V: Desglose Detallado de Tickets Sprint 5 — Reports (Formato Completo)

### Ticket INF-01: Generación automática de PDF

**ID:** INF-01
**Sprint:** 5
**Prioridad:** P1 (Alta)
**Título:** Generar PDF de informe técnico automáticamente al completar ejecución
**Tipo:** backend + frontend
**Módulo:** reports
**Ruta visible:** /reports

**Problema:** Actualmente los informes se crean manualmente desde cero. Deberían generarse automáticamente al completar una ejecución, incluyendo datos de orden, planning, execution y evidencias seleccionables.

**Archivos exactos a abrir:**
- `packages/shared-types/src/schemas/technical-report.schema.ts`
- `packages/shared-types/src/schemas/report.schema.ts`
- `backend/src/modules/technical-report/technical-report.service.ts`
- `backend/src/modules/technical-report/technical-report.controller.ts`
- `backend/src/modules/technical-report/technical-report.routes.ts`
- `backend/src/modules/execution-session/execution-session.service.ts`
- `frontend/src/modules/reports/`
- `frontend/src/app/(dashboard)/reports/page.tsx`

**Código o estructura esperada:**
- Evento: al completar execution (status="completed"), backend crea automáticamente un TechnicalReport en estado "draft"
- El reporte incluye: datos de orden, planning scope, crew asignado, execution dates, evidencias asociadas
- Frontend: lista de reports con badge "Pendiente de revisión" para drafts
- Frontend: editor de reporte con capacidad de seleccionar fotos de la galería de evidencias
- PDF generado con pdf-lib (backend)
- Control de versiones

**Criterio de aceptación:**
- ✅ Reporte se crea automáticamente al completar execution
- ✅ Reporte incluye datos de orden y execution
- ✅ PDF descargable
- ✅ Control de versiones

### Ticket INF-02: Plantillas de informe

**ID:** INF-02
**Sprint:** 5
**Prioridad:** P2 (Media)
**Título:** Crear sistema de plantillas de informe seleccionables por tipo de servicio
**Tipo:** backend + frontend
**Módulo:** reports

**Criterio de aceptación:**
- Plantillas por tipo de servicio (eléctrico, CCTV, refrigeración, líneas de vida)
- Selección de plantilla al crear reporte
- Preview de plantilla antes de generar

### Ticket INF-03: Firma digital integrada

**ID:** INF-03
**Sprint:** 5
**Prioridad:** P2 (Media)
**Título:** Integrar firma digital de técnico, supervisor y cliente en informe y acta
**Tipo:** frontend
**Módulo:** signatures

**Criterio de aceptación:**
- Firma digital en dispositivo (touch/touchpad)
- Captura offline
- Sincronización automática
- Relación con informe y acta
- Audit trail de cada firma

---

## Anexo W: Desglose Detallado de Tickets Sprint 6 — SES/Invoice/Payment (Formato Completo)

### Ticket SES-01: Dashboard de SES con trazabilidad

**ID:** SES-01
**Sprint:** 6
**Prioridad:** P1 (Alta)
**Título:** Crear dashboard de Service Entry Sheets con trazabilidad visual y alertas
**Tipo:** frontend
**Módulo:** billing
**Ruta visible:** /billing/ses

**Problema:** SES existe como CRUD básico. No hay visibilidad de SES pendientes, aprobados, o facturados. No hay alertas cuando una orden completada no tiene SES después de X días.

**Archivos exactos a abrir:**
- `packages/shared-types/src/schemas/service-entry-sheet.schema.ts`
- `backend/src/modules/service-entry-sheet/`
- `frontend/src/modules/billing/`
- `frontend/src/app/(dashboard)/billing/ses/page.tsx`

**Código o estructura esperada:**
- Dashboard con tabla de SES filtrable por estado (pending, approved, rejected, invoiced)
- Columna de días desde creación con alerta si > 7 días (amarillo) o > 14 días (rojo)
- Botón "Crear factura" desde SES aprobado
- Timeline visual: Orden → SES → Factura → Pago
- Badge de SES pendientes en sidebar

**Criterio de aceptación:**
- ✅ Tabla de SES con filtros
- ✅ Alertas de retraso visuales
- ✅ Timeline de trazabilidad
- ✅ Botón "Crear factura"

### Ticket FAC-01: Dashboard de facturación

**ID:** FAC-01
**Sprint:** 6
**Prioridad:** P1 (Alta)
**Título:** Crear dashboard de facturas con alertas de vencimiento y trazabilidad de pago
**Tipo:** frontend
**Módulo:** invoices
**Ruta visible:** /billing/invoices

**Criterio de aceptación:**
- Dashboard con estado de facturas (draft, submitted, approved, rejected, paid)
- Alertas de facturas no pagadas después de 30 días
- Timeline visual: SES → Factura → Aprobación → Pago
- Botón "Registrar pago" desde factura aprobada

### Ticket PAG-01: Dashboard de cobranza

**ID:** PAG-01
**Sprint:** 6
**Prioridad:** P2 (Media)
**Título:** Crear dashboard de cobranza con estado de pagos y cierre administrativo
**Tipo:** frontend
**Módulo:** payments
**Ruta visible:** /payments

**Criterio de aceptación:**
- Dashboard de pagos recibidos y pendientes
- Cierre administrativo automático al registrar último pago de orden
- Exportación de reporte de cobranza

---

## Anexo X: Desglose Detallado de Tickets Sprint 7 — Costs (Formato Completo)

### Ticket CST-01: Dashboard de costos comparativo

**ID:** CST-01
**Sprint:** 7
**Prioridad:** P1 (Alta)
**Título:** Crear dashboard de costos con comparación propuesta vs real, desviación y rentabilidad
**Tipo:** backend + frontend
**Módulo:** costs
**Ruta visible:** /costs

**Problema:** 5 schemas de costo existen pero no hay UI que compare propuesta vs real. El cost baseline snapshot existe en planning-packet pero no se usa después.

**Archivos exactos a abrir:**
- `packages/shared-types/src/schemas/cost.schema.ts`
- `packages/shared-types/src/schemas/cost-cart.schema.ts`
- `packages/shared-types/src/schemas/cost-traceability.schema.ts`
- `packages/shared-types/src/schemas/costControl.schema.ts`
- `packages/shared-types/src/schemas/planning-packet.schema.ts` (CostBaselineSnapshotSchema)
- `packages/domain/src/cost.rules.ts`
- `backend/src/modules/cost/`
- `frontend/src/modules/costs/`
- `frontend/src/app/(dashboard)/costs/page.tsx`
- `frontend/src/app/(dashboard)/costs/[orderId]/page.tsx`

**Archivos exactos a modificar:**
- `backend/src/modules/cost/cost.service.ts` — Agregar getCostVariance(orderId)
- `backend/src/modules/cost/cost.controller.ts` — Agregar endpoint variance
- `backend/src/modules/cost/cost.routes.ts` — Agregar ruta GET /variance/:orderId
- `frontend/src/modules/costs/` — Rediseñar con dashboard comparativo
- `frontend/src/modules/costs/api/cost-api.ts` — Agregar getVariance
- `frontend/src/modules/costs/queries.ts` — Agregar useCostVariance

**Código o estructura esperada:**

Backend: endpoint GET /api/costs/variance/:orderId
```typescript
interface CostVariance {
  orderId: string;
  proposalTotal: number;
  actualTotal: number;
  variance: number; // actual - proposal
  variancePercentage: number;
  categories: {
    labor: { proposed: number; actual: number; variance: number };
    materials: { proposed: number; actual: number; variance: number };
    equipment: { proposed: number; actual: number; variance: number };
    transport: { proposed: number; actual: number; variance: number };
    overhead: { proposed: number; actual: number; variance: number };
  };
  profitability: number; // (proposalTotal - actualTotal) / proposalTotal * 100
}
```

Frontend: Dashboard con:
- Tabla de órdenes con columnas: orden, propuesta, real, desviación %, rentabilidad
- Color coding: verde (rentabilidad > 10%), amarillo (0-10%), rojo (negativo)
- Gráfico de barras comparativo (Recharts) por orden
- Alerta de sobrecosto si desviación > 10%
- Filtros por fecha, cliente, tipo

**Contrato requerido:** cost schema (ya existe), CostBaselineSnapshotSchema (ya existe)

**Backend requerido:** Nuevo endpoint GET /api/costs/variance/:orderId

**Estados UI:** Loading, Error, Empty (sin costos), Forbidden

**Pruebas requeridas:**
- Unit: CostVariance calculation
- Integration: GET /api/costs/variance/:orderId
- Integration: Cost data flow

**Criterio de aceptación:**
- ✅ Endpoint variance devuelve propuesta vs real
- ✅ UI muestra tabla comparativa con colores
- ✅ Gráfico Recharts comparativo
- ✅ Alerta de sobrecosto > 10%
- ✅ Tests pasan

---

## Anexo Y: Desglose Detallado de Tickets Sprint 8 — Dashboard (Formato Completo)

### Ticket KPI-01: Endpoint unificado de dashboard

**ID:** KPI-01
**Sprint:** 8
**Prioridad:** P1 (Alta)
**Título:** Crear endpoint GET /api/dashboard/operational-summary con KPIs reales desde MongoDB
**Tipo:** backend
**Módulo:** dashboard
**Ruta visible:** /dashboard

**Problema:** Los KPIs del dashboard pueden estar desconectados de backend real.

**Archivos exactos a abrir:**
- `packages/shared-types/src/schemas/dashboard-summary.schema.ts`
- `packages/shared-types/src/schemas/kpi.schema.ts`
- `backend/src/modules/dashboard/`
- `frontend/src/app/(dashboard)/dashboard/page.tsx`
- `frontend/src/modules/dashboard/`

**Archivos exactos a modificar:**
- `backend/src/modules/dashboard/dashboard.service.ts` — Agregar getOperationalSummary
- `backend/src/modules/dashboard/dashboard.controller.ts` — Agregar endpoint
- `backend/src/modules/dashboard/dashboard.routes.ts` — Agregar ruta

**Código o estructura esperada:**
```typescript
interface OperationalSummary {
  orders: { total: number; byStatus: Record<string, number>; overdue: number };
  planning: { pending: number; approved: number; blocked: number };
  execution: { inProgress: number; completed: number; pendingSync: number };
  ses: { pending: number; approved: number; overdue: number };
  invoices: { pending: number; approved: number; paid: number; overdue: number };
  costs: { totalVariance: number; ordersOverBudget: number };
  fleet: { expiringDocuments: number; expiredDocuments: number };
  compliance: { documentCompliance: number; evidenceCompliance: number };
  offline: { pendingSyncCount: number };
}
```

**Criterio de aceptación:**
- ✅ Endpoint devuelve datos reales desde MongoDB
- ✅ Cache con TanStack Query staleTime: 30s

### Ticket KPI-02: Widgets de dashboard conectados

**ID:** KPI-02
**Sprint:** 8
**Prioridad:** P1 (Alta)
**Título:** Conectar todos los widgets del dashboard al endpoint real y agregar widgets faltantes
**Tipo:** frontend
**Módulo:** dashboard
**Ruta visible:** /dashboard

**Criterio de aceptación:**
- Widget de órdenes atrasadas con lista
- Widget de planning pendientes con badge
- Widget de SES pendientes con días de retraso
- Widget de facturas vencidas
- Widget de costos desviados
- Widget de cumplimiento documental (%)
- Widget de alertas de flota
- Widget de estado offline (items en cola)
- Todos con loading, error, empty states

---

## Anexo Z: Desglose Detallado de Tickets Sprint 9 — Portal (Formato Completo)

### Ticket PRT-01: Auditoría de portal existente

**ID:** PRT-01
**Sprint:** 9
**Prioridad:** P1 (Alta)
**Título:** Auditar funcionalidad actual del módulo portal y documentar brechas
**Tipo:** documentación
**Módulo:** portal
**Ruta visible:** /portal

**Archivos exactos a abrir:**
- `backend/src/modules/portal/` (todos los archivos)
- `frontend/src/modules/portal/` (todos los archivos)
- `frontend/src/app/` (buscar rutas de portal)

**Criterio de aceptación:**
- Reporte detallado de qué funciona y qué no
- Lista de brechas con acciones correctivas

### Ticket PRT-02: Login de cliente

**ID:** PRT-02
**Sprint:** 9
**Prioridad:** P1 (Alta)
**Título:** Implementar login seguro para clientes con token de acceso
**Tipo:** backend + frontend

**Criterio de aceptación:**
- Login con email + token (no password compartido)
- Sesión limitada a datos del cliente
- RBAC cliente (solo lectura)

### Ticket PRT-03: Consulta de órdenes

**ID:** PRT-03
**Sprint:** 9
**Prioridad:** P1 (Alta)
**Título:** Consulta de órdenes del cliente en portal
**Tipo:** frontend

**Criterio de aceptación:**
- Lista de órdenes del cliente
- Detalle de cada orden
- Estado visible del flujo de 14 pasos

### Ticket PRT-06: Firma digital desde portal

**ID:** PRT-06
**Sprint:** 9
**Prioridad:** P2 (Media)
**Título:** Firma digital de actas desde portal cliente
**Tipo:** frontend

**Criterio de aceptación:**
- Cliente puede ver acta pendiente de firma
- Firma digital en dispositivo
- Confirmación con timestamp

---

## Anexo AA: Desglose Detallado de Tickets Sprint 10 — Forms (Formato Completo)

### Ticket FRM-01: Constructor de templates

**ID:** FRM-01
**Sprint:** 10
**Prioridad:** P1 (Alta)
**Título:** Crear constructor visual drag-drop de templates de formularios dinámicos
**Tipo:** frontend
**Módulo:** forms
**Ruta visible:** /forms

**Problema:** dynamic-form-template.schema.ts existe pero no hay constructor UI. Los checklists y formularios son estáticos.

**Archivos exactos a abrir:**
- `packages/shared-types/src/schemas/dynamic-form-template.schema.ts`
- `packages/shared-types/src/schemas/template-draft.schema.ts`
- `packages/shared-types/src/schemas/template-response.schema.ts`
- `backend/src/modules/template-draft/`
- `backend/src/modules/template-response/`
- `frontend/src/modules/forms/`
- `frontend/src/app/(dashboard)/forms/page.tsx`
- `frontend/src/app/(dashboard)/forms/[templateId]/page.tsx`

**Archivos exactos a crear:**
- `frontend/src/modules/forms/ui/TemplateBuilder.tsx`
- `frontend/src/modules/forms/ui/FieldEditor.tsx`
- `frontend/src/modules/forms/ui/FormPreview.tsx`
- `frontend/src/modules/forms/api/forms-api.ts`
- `frontend/src/modules/forms/queries.ts`

**Código o estructura esperada:**
- Constructor visual con sidebar de tipos de campo
- Tipos: text, number, date, select, checkbox, radio, photo, signature, textarea
- Propiedades: label, required, placeholder, options (select), min/max, validation
- Versionado automático al guardar
- Estados: draft, published, archived
- Preview en vivo al editar
- Publicación controlada (solo admin puede publicar)

**Criterio de aceptación:**
- ✅ Constructor drag-drop funcional
- ✅ 8+ tipos de campo
- ✅ Versionado
- ✅ Preview en vivo
- ✅ Publicación controlada

### Ticket FRM-02: Checklist builder

**ID:** FRM-02
**Sprint:** 10
**Prioridad:** P2 (Media)
**Título:** Extender constructor con checklist builder con ítems, scoring y foto/firma por ítem
**Tipo:** frontend

**Criterio de aceptación:**
- Items de checklist con: label, conforme/no conforme/NA, foto opcional, firma opcional
- Scoring automático (peso por item)
- Plantillas iniciales: CCTV, líneas de vida, mantenimiento eléctrico

---

## Anexo AB: Desglose Detallado de Tickets Sprint 11 — Backups/Audit (Formato Completo)

### Ticket BAK-01: UI de backups

**ID:** BAK-01
**Sprint:** 11
**Prioridad:** P2 (Media)
**Título:** Crear página de administración de backups con dashboard, ejecución y descarga
**Tipo:** frontend
**Módulo:** admin-backup
**Ruta visible:** /admin/backups

**Archivos exactos a abrir:**
- `backend/src/modules/admin-backup/`
- `backend/src/scripts/` (backup scripts)

**Archivos exactos a crear:**
- `frontend/src/app/(dashboard)/admin/backups/page.tsx`
- `frontend/src/app/(dashboard)/admin/backups/layout.tsx`

**Código o estructura esperada:**
- Dashboard con tabla de backups: fecha, tamaño, estado, tipo (automático/manual)
- Botón "Ejecutar backup ahora"
- Descarga de backup
- Configuración de retención (días a conservar)
- Alertas si no hay backup en las últimas 24h

**Criterio de aceptación:**
- ✅ Lista de backups con estado
- ✅ Ejecución manual
- ✅ Descarga
- ✅ Alerta si backup no reciente

### Ticket BAK-02: UI de auditoría

**ID:** BAK-02
**Sprint:** 11
**Prioridad:** P2 (Media)
**Título:** Crear página de consulta de auditoría forense con filtros
**Tipo:** frontend
**Módulo:** audit
**Ruta visible:** /admin/audit

**Archivos exactos a abrir:**
- `backend/src/models/AuditLog.ts`
- `backend/src/modules/audit/audit.service.ts`
- `backend/src/modules/audit/` (endpoints)

**Archivos exactos a crear:**
- `frontend/src/app/(dashboard)/admin/audit/page.tsx`
- `frontend/src/app/(dashboard)/admin/audit/layout.tsx`
- `frontend/src/modules/audit/api/audit-api.ts`
- `frontend/src/modules/audit/queries.ts`
- `frontend/src/modules/audit/ui/AuditTable.tsx`
- `frontend/src/modules/audit/ui/AuditFilters.tsx`

**Código o estructura esperada:**
- Tabla paginada de eventos de auditoría
- Filtros: entidad, acción, usuario, fecha desde/hasta
- Columnas: timestamp, usuario, acción, entidad, entidadId, metadata, requestId
- Exportación CSV
- Solo accesible para rol "gerente"

**Criterio de aceptación:**
- ✅ Tabla paginada con filtros
- ✅ Exportación CSV
- ✅ RBAC gerente

---

## Anexo AC: Desglose Detallado de Tickets Sprint 12 — E2E + VPS (Formato Completo)

### Ticket E2E-01: Seed realista para 14 pasos

**ID:** E2E-01
**Sprint:** 12
**Prioridad:** P0 (Crítica)
**Título:** Crear seed realista con datos completos para recorrer los 14 pasos
**Tipo:** backend
**Módulo:** seed
**Ruta visible:** Todas

**Criterio de aceptación:**
- Seed con: 1 cliente, 1 sitio, 1 usuario gerente, 1 usuario residente, 1 usuario operador, 1 vehículo, 1 kit de herramientas
- Seed crea service case completo
- Datos en español, realistas

### Ticket E2E-02: Playwright flujo 14 pasos

**ID:** E2E-02
**Sprint:** 12
**Prioridad:** P0 (Crítica)
**Título:** Test E2E del flujo completo de 14 pasos
**Tipo:** test
**Módulo:** e2e
**Ruta visible:** Todas

**Archivos exactos a crear:**
- `frontend/tests/e2e/flujo-14-pasos.spec.ts`

**Código o estructura esperada:**
```typescript
test('Flujo completo 14 pasos CERMONT', async ({ page }) => {
  // 1. Login como gerente
  await page.goto('/login');
  await page.fill('[name="email"]', 'gerente@cermont.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible();

  // 2. Crear solicitud de servicio
  await page.click('text=Solicitudes');
  await page.click('text=Nueva solicitud');
  // ... llenar formulario
  await page.click('text=Guardar');

  // 3-14. Continuar con cada paso...
  // Cada paso verifica que el anterior está completo
  // Verificar bloqueos si se intenta saltar un paso
  // Verificar RBAC en cada paso

  // 14. Verificar pago y cierre
  await expect(page.locator('text=Pago registrado')).toBeVisible();
});
```

**Criterio de aceptación:**
- ✅ Test recorre los 14 pasos
- ✅ Verifica bloqueos
- ✅ Verifica RBAC
- ✅ Pasa en localhost

### Ticket E2E-06: Docker + PM2 + Nginx

**ID:** E2E-06
**Sprint:** 12
**Prioridad:** P2 (Media)
**Título:** Preparar Docker multi-stage, PM2, Nginx y scripts de deploy para VPS
**Tipo:** infraestructura
**Módulo:** devops
**Ruta visible:** N/A

**Archivos exactos a crear/modificar:**
- `docker/Dockerfile.backend` — CREAR multi-stage (build + production)
- `docker/Dockerfile.frontend` — CREAR multi-stage (build + nginx/standalone)
- `docker/docker-compose.yml` — CREAR con backend + frontend + mongodb
- `ecosystem.config.cjs` — CREAR con max_memory_restart
- `scripts/backup.sh` — CREAR backup script
- `scripts/rollback.sh` — CREAR rollback script

**Criterio de aceptación:**
- ✅ Docker build exitoso
- ✅ docker-compose up levanta todo
- ✅ PM2 configuración correcta
- ✅ Backup script funciona
- ✅ Rollback script funciona

---

## Anexo AD: Análisis de Código — fleet.service.ts (502 líneas)

### Problemas de Calidad Detectados

```typescript
// backend/src/modules/fleet/fleet.service.ts

// PROBLEMA 1: Línea 361 — require() en vez de import
const { User } = require("../../models/User");
// Debería ser:
import { User } from "../../models/User";

// PROBLEMA 2: Líneas 472-473 — Asignación de undefined (viola regla "zero undefined")
vehicle.driverId = undefined;   // ← Prohibido por REGLAS_DESARROLLO_CERMONT
vehicle.driverName = undefined; // ← Prohibido
// Debería usar un estado:
vehicle.driverStatus = "unassigned";

// PROBLEMA 3: Línea 102 — Record<string, unknown> en filter
const filter: Record<string, unknown> = {};
// Debería ser tipado:
interface VehicleFilter {
  status?: string;
  type?: string;
  [key: string]: string | undefined;
}

// PROBLEMA 4: Línea 65 — toDates function duplicada
// Esta lógica de transformación de fechas existe en múltiples servicios.
// Debería ser un helper compartido.

// PROBLEMA 5: Línea 502 — función de 502 líneas
// Supera el límite de 300 líneas para servicios.
// Debería dividirse en:
// - fleet.service.ts (CRUD básico)
// - fleet-assignment.service.ts (asignaciones, checkout, checkin)
// - fleet-photo.service.ts (fotos, primary photo)
// - fleet-document.service.ts (alertas documentales)
```

### Funciones Expuestas vs No Expuestas

| Función | Líneas | Expuesta en UI | Estado | Sprint |
|---------|--------|:--------------:|--------|--------|
| createVehicle | 86-98 | ✅ NewVehicleDrawer | Refactor needed | S1 |
| listVehicles | 100-122 | ✅ /fleet page | OK | — |
| getVehicleById | 124-130 | ✅ /fleet/[id] | OK | — |
| updateVehicle | 132-173 | ❌ No expuesta | Missing | S1 |
| getExpiringDocuments | 178-214 | ❌ No expuesta | Missing | S1 |
| listVehiclePhotos | 216-225 | ✅ FleetPhotoGallery | OK | — |
| uploadVehiclePhoto | 227-264 | ✅ FleetPhotoGallery | OK | — |
| setPrimaryVehiclePhoto | 266-286 | ❌ No expuesta | Missing | S1 |
| deleteVehiclePhoto | 304-339 | ❌ No expuesta | Missing | S1 |
| assignVehicle | 341-385 | ✅ VehicleAssignmentPanel | OK | — |
| checkoutVehicle | 387-435 | ❌ No expuesta | Missing | S1 |
| checkinVehicle | 437-485 | ❌ No expuesta | Missing | S1 |
| getVehicleAssignmentHistory | 487-494 | ❌ No expuesta | Missing | S1 |
| getActiveAssignment | 496-502 | ❌ No expuesta | Missing | S1 |

---

## Anexo AE: Análisis de Código — NewVehicleDrawer.tsx (278 líneas)

### Problemas por Línea

```typescript
// frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx

// LÍNEAS 18-29: Schema local duplicado
const DrawerFormSchema = z.object({  // ← DEBE ser CreateVehicleSchema desde shared-types
  plate: z.string().min(5).max(10),
  brand: z.string().min(1).max(60),
  // ...
});
// Impacto: Si vehicle.schema.ts cambia, este schema no se actualiza automáticamente.

// LÍNEA 71: Record<string, unknown> en useForm
useForm<DrawerForm & Record<string, unknown>>({  // ← TIPO INSEGURO
// Impacto: TypeScript no puede verificar el tipo de los datos del formulario.

// LÍNEAS 72-75: Cast con unknown
zodResolver(DrawerFormSchema) as unknown as Resolver<  // ← VIOLA ZERO UNKNOWN
  DrawerForm & Record<string, unknown>,
  unknown
>,
// Impacto: Suprime todos los errores de tipo, permitiendo bugs silenciosos.

// LÍNEA 214: Conductor como input text
<input {...register("driverName")} placeholder="Juan Pérez" />
// Impacto: No valida que el conductor exista en el sistema.
// Debería ser: <UserPicker role="operador" onChange={setDriverId} />

// NO HAY: Sección de fotos
// El formulario no permite subir fotos iniciales del vehículo.
// Debería incluir: <FileUpload accept="image/*" multiple />

// NO HAY: Sección de documentos
// No permite adjuntar SOAT, tecnomecánica ni póliza como archivos.
// Debería incluir: <DocumentUpload type="soat" /> etc.
```

---

## Anexo AF: Análisis de Código — planning-packet.schema.ts (389 líneas)

### Sub-schemas Definidos vs UI

| Sub-schema | Líneas | Definido en | UI que lo usa | Brecha |
|------------|--------|-------------|:-------------:|--------|
| PlanningPacketStatusSchema | 19-20 | shared-types | ReadinessGate (parcial) | No muestra status visual |
| PlanningBusinessUnitSchema | 24-25 | shared-types | ❌ No | Falta selector en wizard |
| CrewMemberSchema | 40-49 | shared-types | ❌ No | Falta selector crew |
| PlanningScheduleSchema | 51-59 | shared-types | ❌ No | Falta date picker |
| PlanningResourceLineSchema | 61-69 | shared-types | ❌ No | Falta materiales/PPE |
| PlanningToolSchema | 71-81 | shared-types | ❌ No | Falta tool picker |
| PlanningEquipmentSchema | 82-92 | shared-types | ❌ No | Falta equipment picker |
| WorkerRequirementsSchema | 94-103 | shared-types | ❌ No | Falta inputs numéricos |
| PlanningResponsibleSchema | 105-116 | shared-types | ❌ No | Falta firma responsable |
| RequiredCertificationSchema | 118-128 | shared-types | ❌ No | Falta certification check |
| SupportDocumentSchema | 130-153 | shared-types | ❌ No | Falta AST/PTW upload |
| ReadinessCheckItemSchema | 155-165 | shared-types | ReadinessGate | Parcial |
| PlanningKitSnapshotSchema | 167-181 | shared-types | ❌ No | Falta kit autofill |
| CostBaselineSnapshotSchema | 183-197 | shared-types | ❌ No | Falta cost summary |
| DomainBlockerSchema | 236 | shared-types | ❌ No | Falta blockers display |
| PlanningReadinessReportSchema | 370-389 | shared-types | ❌ No | Falta readiness report |

**Conclusión:** 15 de 16 sub-schemas no tienen UI correspondiente. Solo ReadinessCheckItemSchema tiene UI parcial (ReadinessGate).

---

## Anexo AG: Análisis de Código — execution.ts Domain (223 líneas)

### Reglas Definidas vs UI

| Función | Líneas | Propósito | UI que la consume | Brecha |
|---------|--------|-----------|:-----------------:|--------|
| canCreateExecutionSession | 56-58 | Verificar orden no cancelada | ❌ No | UI no bloquea creación si orden cancelada |
| canStartExecution | 60-69 | Verificar planning aprobado y orden lista | ❌ No | UI permite iniciar sin planning |
| canPauseExecution | 71-73 | Solo si status in_progress | ❌ No | UI permite pausar en cualquier estado |
| canResumeExecution | 75-77 | Solo si status paused | ❌ No | UI permite reanudar sin verificación |
| canCancelExecution | 79-81 | No si completed o cancelled | ❌ No | UI permite cancelar sin verificar |
| canCompleteExecution | 83-97 | Verificar evidencias, labor, incidentes | ❌ No | UI permite completar sin validar |
| calculateExecutionBlockers | 99-137 | 12 blockers evaluados | ❌ No | UI no muestra blockers |
| calculateExecutionNextActions | 139-178 | 10 acciones sugeridas | ❌ No | UI no sugiere acciones |
| validateRequiredEvidence | 217-219 | Verificar evidencias > 0 | ❌ No | UI no bloquea sin evidencias |
| validateRequiredSignatures | 221-223 | Verificar firmas > 0 | ❌ No | UI no bloquea sin firmas |

**Conclusión:** 0 de 10 reglas de domain execution.ts son consumidas por la UI. Toda la lógica de blockers existe en TypeScript pero no se refleja en el navegador.

---

## Anexo AH: Análisis de Código — planning.rules.ts Domain (146 líneas)

### Reglas Definidas vs UI

| Función | Propósito | UI que la consume | Brecha |
|---------|-----------|:-----------------:|--------|
| REQUIRED_PLANNING_DOCUMENTS | 6 tipos de documentos requeridos | ❌ No | UI no verifica documentos |
| isPlanningReady | Verificar si planning está listo | ❌ No | ReadinessGate podría usarlo |
| getPlanningBlockers | 10+ blockers detallados | ❌ No | UI no muestra blockers |
| getMaxBlockerSeverity | Severidad máxima | ❌ No | UI no colorea por severidad |
| MISSING_SCHEDULE blocker | Cronograma no definido | ❌ No | Wizard debería marcar como error |
| MISSING_LABOR blocker | MO no asignada | ❌ No | Wizard debería marcar como error |
| MISSING_TOOLS blocker | Herramientas no asignadas | ❌ No | Wizard debería marcar como warning |
| MISSING_EQUIPMENT blocker | Equipos no asignados | ❌ No | Wizard debería marcar como warning |
| MISSING_SAFETY blocker | EPP no definido | ❌ No | Wizard debería marcar como critical |
| MISSING_CERTIFICATIONS blocker | Certificaciones no verificadas | ❌ No | Wizard debería marcar como error |
| MISSING_DOC_* blocker | Documentos faltantes | ❌ No | Wizard debería requerir upload |

**Conclusión:** 0 de 10+ reglas de planning.rules.ts son consumidas por la UI. Toda la lógica de planning readiness existe pero no bloquea en el navegador.

---

## Anexo AI: Análisis de Código — fleet-readiness.rules.ts Domain (118 líneas)

### Reglas Definidas vs UI

| Función | Propósito | UI que la consume | Brecha |
|---------|-----------|:-----------------:|--------|
| evaluateFleetReadiness | Calcular readiness score y blockers | FleetReadinessBadge | Parcial (badge existe pero no muestra blockers) |
| getExpiryBlocker | Bloqueo por documento vencido | ❌ No | No muestra en /fleet/[id] |
| FleetBlocker.code | Códigos MISSING_SOAT, EXPIRED_TECHNO, etc. | ❌ No | No se muestran en UI |
| FleetBlocker.severity | error/warning | ❌ No | No hay color coding |
| FleetReadiness.score | 0-100 score | ❌ No | No se muestra numéricamente |
| FleetReadiness.ready | boolean ready | FleetReadinessBadge | Solo icono, sin detalle |
| IN_MAINTENANCE blocker | Vehículo en mantenimiento | ❌ No | No bloquea asignación en UI |

**Conclusión:** Las reglas de fleet readiness existen y son funcionales pero la UI solo muestra un badge básico, no los detalles de blockers ni scores.

---

## Anexo AJ: Guía de Estilo para Código Nuevo

### TypeScript

```typescript
// ✅ CORRECTO — tipos fuertes, sin any/unknown/null/undefined
interface CreateVehicleFormData {
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  kilometers: number;
  driverId?: string; // Opcional con undefined permitido en interfaz, no en runtime
}

// ❌ INCORRECTO
const formData: Record<string, unknown> = {};
const resolver: Resolver<any> = ...;
const value = data as any;
```

### React Components

```typescript
// ✅ CORRECTO — estructura con estados
export function VehicleList() {
  const { data, isLoading, error } = useVehicleList();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorCard message={error.message} onRetry={() => refetch()} />;
  if (!data?.length) return <EmptyState title="Sin vehículos" action={<Button>Crear</Button>} />;

  return <div>{data.map(v => <VehicleCard key={v._id} vehicle={v} />)}</div>;
}
```

### API Services

```typescript
// ✅ CORRECTO — tipado fuerte
import { apiClient } from "@/lib/http/api-client";
import type { Vehicle, CreateVehicleInput } from "@cermont/shared-types";

export async function createVehicle(data: CreateVehicleInput): Promise<Vehicle> {
  const response = await apiClient.post("/api/fleet", data);
  return response.data;
}
```

### TanStack Query Hooks

```typescript
// ✅ CORRECTO — query keys estables
export const vehicleKeys = {
  all: ["vehicles"] as const,
  list: (filters?: ListVehiclesQuery) => [...vehicleKeys.all, "list", filters] as const,
  detail: (id: string) => [...vehicleKeys.all, "detail", id] as const,
};

export function useVehicleList(filters?: ListVehiclesQuery) {
  return useQuery({
    queryKey: vehicleKeys.list(filters),
    queryFn: () => fleetApi.listVehicles(filters),
    staleTime: 30_000, // 30s
  });
}
```

---

## Anexo AK: Resumen de Brechas por Archivo

| Archivo | Brecha | Gravedad | Sprint |
|---------|--------|:--------:|--------|
| frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx | Schema local, Record<string,unknown>, cast unknown | Crítica | S1 |
| frontend/src/modules/planning/ui/ReadinessGate.tsx | Único componente para schema de 28+ campos | Crítica | S2 |
| frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx | Solo ReadinessGate, no wizard | Crítica | S2 |
| frontend/src/app/(dashboard)/fleet/[id]/page.tsx | Falta checkout/checkin/historial/mantenimiento | Alta | S1 |
| frontend/src/modules/fleet/ui/VehicleAssignmentPanel.tsx | Sin checkout/checkin wizard | Alta | S1 |
| frontend/src/modules/execution/ | Sin offline, sin blockers de domain | Alta | S3 |
| frontend/src/modules/evidences/ | Galería básica, sin metadatos, sin PDF | Alta | S4 |
| frontend/src/modules/reports/ | Sin generación PDF automática | Alta | S5 |
| frontend/src/modules/delivery-records/ | Sin wizard, sin fotos, sin firmas | Alta | S5 |
| frontend/src/modules/billing/ | Sin dashboard de SES | Alta | S6 |
| frontend/src/modules/invoices/ | Sin dashboard de facturación | Alta | S6 |
| frontend/src/modules/payments/ | Sin dashboard de cobranza | Alta | S6 |
| frontend/src/modules/costs/ | Sin comparación propuesta vs real | Alta | S7 |
| frontend/src/app/(dashboard)/dashboard/page.tsx | KPIs desconectados | Alta | S8 |
| frontend/src/modules/cockpit/ | Timeline básico, sin blockers visibles | Alta | S2 |
| frontend/src/modules/portal/ | No verificado funcionalmente | Alta | S9 |
| frontend/src/modules/forms/ | Constructor no existe | Alta | S10 |
| backend/src/modules/admin-backup/ | Sin UI de backups | Alta | S11 |
| frontend/tests/ | Sin E2E Playwright | Crítica | S12 |
| packages/domain/src/execution.ts | 10 reglas no usadas en UI | Crítica | S3 |
| packages/domain/src/planning.rules.ts | 10+ reglas no usadas en UI | Crítica | S2 |
| packages/domain/src/fleet-readiness.rules.ts | Reglas no expuestas completamente en UI | Alta | S1 |
| backend/src/modules/fleet/fleet.service.ts | 8 funciones no expuestas en UI | Alta | S1 |

---

## Anexo AL: Verificación de Hallazgos Iniciales

### Hallazgo A — Fleet existe pero funcionalmente superficial

**Veredicto: CONFIRMADO**

Backend fleet.service.ts tiene 14 funciones completas. UI tiene 6 componentes pero 8 funciones backend no están expuestas (checkout, checkin, assignmentHistory, activeAssignment, expiringDocuments, setPrimaryPhoto, deletePhoto, updateVehicle). NewVehicleDrawer tiene problemas de calidad.

### Hallazgo B — NewVehicleDrawer mal diseñado

**Veredicto: CONFIRMADO**

Evidencia en frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx:
- Líneas 18-29: Schema local `DrawerFormSchema` en vez de `CreateVehicleSchema` desde shared-types
- Línea 71: `Record<string, unknown>` en useForm
- Líneas 72-75: `as unknown as Resolver` — cast con unknown
- Sin fotos iniciales, sin documentos adjuntos, conductor desde input text

### Hallazgo C — Backend Fleet tiene más lógica que UI

**Veredicto: CONFIRMADO**

Backend tiene: checkoutVehicle, checkinVehicle, getVehicleAssignmentHistory, getActiveAssignment, getExpiringDocuments, uploadVehiclePhoto, setPrimaryVehiclePhoto, deleteVehiclePhoto — todas sin UI correspondiente.

### Hallazgo D — Planning tiene contratos potentes pero UI limitada

**Veredicto: CONFIRMADO**

Schema planning-packet.schema.ts tiene 28+ sub-schemas. Backend tiene service completo con readiness service. Pero UI de planning solo tiene ReadinessGate.tsx. De 16 sub-schemas relevantes, solo 1 tiene UI parcial.

### Hallazgo E — Los 14 pasos existen pero deben probarse como flujo real

**Veredicto: CONFIRMADO**

Los 14 pasos están definidos en operational-steps.ts (324 líneas) con schemas, backends y frontends individuales. Pero no hay prueba E2E que los recorra como flujo completo. No hay datos seed que permitan probar el flujo. La herencia de datos entre pasos (InheritedFieldSchema) no se explota en UI.

---

## Anexo AM: Documentación No Encontrada

Los siguientes archivos fueron solicitados como fuentes pero no se encontraron en las rutas especificadas:

| Archivo solicitado | Estado | Ruta correcta (si existe) |
|-------------------|--------|---------------------------|
| docs/REGLAS_DESARROLLO_CERMONT(5).md | ❌ No encontrado | docs/REGLAS_DESARROLLO_CERMONT.md (866 líneas) |
| docs/LTG_JUAN_DIEGO_AREVALO-3_markdown(7).md | ❌ No encontrado | Buscar en docs/pdf/ |
| docs/07_DESARROLLO_DE_UN_APLICATIVO_WEB_PARA_APOYO_EN_LA_EJECUCION_Y_CIERRE_ADMINISTRATIVO_DE_LOS_TRABA3(1).md | ❌ No encontrado | Buscar en docs/pdf/ |
| docs/09_Observaciones_Anteproyecto_Juan_Diego2.md | ❌ No encontrado | Buscar en docs/pdf/ |

**Nota:** Los archivos fueron leídos desde rutas alternativas. docs/REGLAS_DESARROLLO_CERMONT.md (866 líneas) fue encontrado y analizado en su lugar.

---

## Anexo AN: Technical Debt Detallado

### Deuda Técnica: Tipo Seguridad

| ID | Archivo | Problema | Línea | Impacto | Prioridad |
|----|---------|----------|-------|---------|-----------|
| TD-01 | frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx | Record<string, unknown> | 71 | Errores runtime no detectados por TypeScript | P0 |
| TD-02 | frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx | as unknown as Resolver | 72-75 | Suprime type checking completamente | P0 |
| TD-03 | frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx | Schema local duplicado | 18-29 | Desincronización con shared-types | P0 |
| TD-04 | backend/src/modules/fleet/fleet.service.ts | require() vs import | 361 | Mala práctica ESM | P1 |
| TD-05 | backend/src/modules/fleet/fleet.service.ts | driverId = undefined | 472 | Viola regla zero undefined | P1 |
| TD-06 | backend/src/modules/fleet/fleet.service.ts | driverName = undefined | 473 | Viola regla zero undefined | P1 |
| TD-07 | backend/src/modules/fleet/fleet.service.ts | Record<string, unknown> filter | 102 | Tipo inseguro | P1 |

### Deuda Técnica: Arquitectura

| ID | Archivo | Problema | Impacto | Prioridad |
|----|---------|----------|---------|-----------|
| TD-08 | backend/src/modules/fleet/fleet.service.ts | 502 líneas, supera límite de 300 | Mantenibilidad | P2 |
| TD-09 | frontend/src/modules/planning/ui/ | Solo 1 componente para 28+ campos | Brecha funcional crítica | P0 |
| TD-10 | frontend/src/modules/execution/ | No consume execution.ts domain rules | Bloqueos no funcionales | P0 |
| TD-11 | frontend/src/modules/planning/ | No consume planning.rules.ts | Readiness no bloquea | P0 |

### Deuda Técnica: UX

| ID | Archivo | Problema | Impacto | Prioridad |
|----|---------|----------|---------|-----------|
| TD-12 | frontend/src/app/(dashboard)/fleet/[id]/page.tsx | Sin checkout/checkin | Funcionalidad faltante | P0 |
| TD-13 | frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx | Sin wizard planeación | Flujo roto | P0 |
| TD-14 | frontend/src/app/(dashboard)/dashboard/page.tsx | KPIs desconectados | Sin valor gerencial | P1 |
| TD-15 | frontend/src/modules/evidences/ | Galería sin metadatos | Evidencias sin contexto | P1 |

### Deuda Técnica: Tests

| ID | Problema | Impacto | Prioridad |
|----|----------|---------|-----------|
| TD-16 | No hay E2E de flujo 14 pasos | Riesgo de regresión en flujo crítico | P0 |
| TD-17 | No hay tests de fleet checkout/checkin | Funcionalidad no probada | P1 |
| TD-18 | No hay tests de planning wizard | Funcionalidad nueva no probada | P1 |
| TD-19 | No hay tests de execution offline | Offline no verificado | P1 |

---

## Anexo AO: Estrategia de Ramas Git

### Convención de Ramas

```
implement/sprint-NN-modulo
Ejemplo: implement/sprint-01-fleet
         implement/sprint-02-planning
```

### Commits por Ticket

Cada ticket debe producir al menos 1 commit con mensaje descriptivo:

```bash
git commit -m "feat(fleet): refactor NewVehicleDrawer to use shared-types schema

- Remove local DrawerFormSchema, import CreateVehicleSchema from @cermont/shared-types
- Eliminate Record<string, unknown> from useForm types
- Remove as unknown as Resolver cast
- Add photo upload section with react-dropzone
- Add driver selector from user DB
- Add document upload for SOAT/tecnomecánica/insurance
- FLT-01: Sprint 1 Fleet ticket 1"
```

### Flujo de Trabajo

```bash
# 1. Crear rama desde implement/spec-024 o main
git checkout -b implement/sprint-01-fleet

# 2. Implementar ticket FLT-01
# (trabajar en archivos)
git add -A
git commit -m "feat(fleet): ..."

# 3. Ejecutar validación
npm run verify

# 4. Tomar screenshots
# Guardar en .sisyphus/evidence/sprint-01/

# 5. Continuar con FLT-02...

# 6. Al completar sprint, crear PR description
git push origin implement/sprint-01-fleet
```

### Política de Merge

- No merge directo a main
- PR con descripción de cambios, screenshots, resultados de tests
- Aprobación requerida antes de merge

---

## Anexo AP: Estructura de Archivos de Evidencia

### Por Sprint

```
.sisyphus/evidence/sprint-01/
├── audit-before.md           # Estado inicial antes del sprint
├── before-desktop.png        # Screenshot desktop antes
├── before-mobile.png         # Screenshot mobile antes
├── implementation-notes.md   # Notas detalladas de implementación
├── commands.md               # Comandos ejecutados con output
├── test-results.md           # Resultados de tests
├── after-desktop.png         # Screenshot desktop después
├── after-mobile.png          # Screenshot mobile después
└── product-slice-report.md   # Reporte funcional del sprint
```

### Formato de product-slice-report.md

```markdown
# Sprint 1 — Fleet Page Product Slice Report

**Date:** 2026-07-07
**Branch:** implement/sprint-01-fleet

## 1. Cambios implementados
- FLT-01: NewVehicleDrawer refactorizado
- FLT-02: Checkout/checkin en /fleet/[id]
- ...

## 2. Archivos modificados
| Archivo | Cambio |
|---------|--------|
| frontend/.../NewVehicleDrawer.tsx | Refactor completo |

## 3. Archivos creados
| Archivo | Propósito |
|---------|-----------|
| frontend/.../useAssignments.ts | Hook assignments |

## 4. Tests ejecutados
**Frontend:** typecheck ✅ lint ✅ test (Y passed) ✅ build ✅
**Backend:** typecheck ✅ lint ✅ test (Z passed) ✅ build ✅
**Quality:** 10/10 gates ✅
**React Doctor:** 100/100 ✅
**npm run verify:** ✅ PASSED

## 5. Screenshots
- before-desktop.png: /fleet antes del cambio
- after-desktop.png: /fleet con checkout wizard
- after-mobile.png: /fleet responsivo

## 6. Qué mejoró visualmente
- NewVehicleDrawer ahora permite subir fotos
- /fleet/[id] tiene botones de checkout/checkin
- Dashboard muestra alertas documentales

## 7. Qué mejoró en lógica
- Tipos seguros sin Record<string, unknown>
- Checkout valida kilometraje
- Checkin valida kilometraje >= checkout

## 8. Qué queda pendiente
- Mejorar FleetPhotoGallery con metadatos (Sprint 4)
- Conectar flota a planning (Sprint 2)
```

---

## Anexo AQ: Referencia Rápida — 20 Puntos DoD

```markdown
## Definition of Done Checklist

- [ ] 1. Visible en localhost:3000 con datos reales/seed
- [ ] 2. Schema Zod en shared-types (reutilizar/extender/crear)
- [ ] 3. Backend endpoint funcional
- [ ] 4. Frontend conectado vía TanStack Query
- [ ] 5. Loading state (skeleton/spinner)
- [ ] 6. Error state (card + retry)
- [ ] 7. Empty state (ilustración + CTA)
- [ ] 8. Forbidden state (sin permiso)
- [ ] 9. Offline state (banner + cola) si aplica
- [ ] 10. RBAC via @cermont/domain
- [ ] 11. Auditoría en acciones críticas
- [ ] 12. Validaciones de negocio desde domain
- [ ] 13. Relación con paso(s) CERMONT
- [ ] 14. Pruebas unitarias (Vitest)
- [ ] 15. Pruebas de integración
- [ ] 16. Prueba E2E (Playwright) si flujo crítico
- [ ] 17. Screenshot antes/después
- [ ] 18. Documentación actualizada si aplica
- [ ] 19. npm run typecheck ✅
- [ ] 20. npm run verify ✅
```

---

## Anexo AR: Referencia Rápida — Archivos Críticos por Sprint

### Sprint 1 (15 archivos)
```
frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx        [MODIFICAR]
frontend/src/app/(dashboard)/fleet/[id]/page.tsx          [MODIFICAR]
frontend/src/modules/fleet/ui/VehicleAssignmentPanel.tsx  [EXTENDER]
frontend/src/modules/fleet/hooks/useAssignments.ts        [CREAR]
frontend/src/modules/fleet/api/fleet-api.ts               [EXTENDER]
frontend/src/modules/fleet/queries.ts                     [EXTENDER]
frontend/src/modules/fleet/ui/MaintenanceTab.tsx          [CREAR]
frontend/src/app/(dashboard)/dashboard/page.tsx           [MODIFICAR]
frontend/src/app/(dashboard)/assets/page.tsx              [MODIFICAR]
frontend/src/app/(dashboard)/assets/[id]/page.tsx         [MODIFICAR]
frontend/tests/modules/fleet/NewVehicleDrawer.test.tsx    [CREAR]
frontend/tests/modules/fleet/VehicleAssignment.test.tsx   [CREAR]
frontend/tests/modules/fleet/Maintenance.test.tsx         [CREAR]
```

### Sprint 2 (12 archivos)
```
frontend/src/modules/planning/ui/PlanningWizard.tsx              [CREAR]
frontend/src/modules/planning/ui/steps/ScheduleStep.tsx          [CREAR]
frontend/src/modules/planning/ui/steps/ResourcesStep.tsx         [CREAR]
frontend/src/modules/planning/ui/steps/SafetyStep.tsx            [CREAR]
frontend/src/modules/planning/ui/steps/CertificationsStep.tsx    [CREAR]
frontend/src/modules/planning/ui/steps/ReviewStep.tsx            [CREAR]
frontend/src/modules/planning/api/planning-api.ts                [CREAR]
frontend/src/modules/planning/queries.ts                         [EXTENDER]
frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx       [MODIFICAR]
frontend/src/modules/cockpit/                                     [MODIFICAR]
```

### Sprint 3 (5+ archivos)
```
frontend/src/modules/execution/             [EXTENDER]
frontend/src/modules/field-execution/       [EXTENDER]
frontend/src/modules/offline/               [EXTENDER]
frontend/src/lib/pwa/offline-queue.ts       [VERIFICAR]
frontend/src/store/queueStore.ts            [EXTENDER]
```

### Sprint 4 (2+ módulos completos)
```
frontend/src/modules/evidences/    [REDISEÑAR completo]
frontend/src/modules/documents/    [EXTENDER]
```

### Sprint 5 (3+ módulos)
```
frontend/src/modules/reports/             [REDISEÑAR]
backend/src/services/report.service.ts    [EXTENDER]
frontend/src/modules/delivery-records/    [REDISEÑAR]
```

### Sprint 6 (3 módulos)
```
frontend/src/modules/billing/     [EXTENDER]
frontend/src/modules/invoices/    [EXTENDER]
frontend/src/modules/payments/    [EXTENDER]
```

### Sprint 7 (2 módulos)
```
frontend/src/modules/costs/        [REDISEÑAR]
backend/src/modules/cost/          [EXTENDER]
```

### Sprint 8 (2 módulos)
```
frontend/src/app/(dashboard)/dashboard/page.tsx   [REDISEÑAR]
backend/src/modules/dashboard/                     [EXTENDER]
```

### Sprint 9 (2 módulos)
```
frontend/src/modules/portal/    [AUDITAR y EXTENDER]
backend/src/modules/portal/     [VERIFICAR]
```

### Sprint 10 (2 módulos)
```
frontend/src/modules/forms/         [CREAR completo]
frontend/src/modules/checklists/    [EXTENDER]
```

### Sprint 11 (3+ archivos)
```
backend/src/modules/admin-backup/                        [VERIFICAR y EXTENDER]
frontend/src/app/(dashboard)/admin/backups/page.tsx       [CREAR]
frontend/src/app/(dashboard)/admin/audit/page.tsx         [CREAR]
```

### Sprint 12 (6+ archivos)
```
frontend/tests/e2e/flujo-14-pasos.spec.ts    [CREAR]
frontend/tests/e2e/offline.spec.ts           [CREAR]
frontend/tests/e2e/rbac.spec.ts              [CREAR]
docker/Dockerfile.backend                    [CREAR]
docker/Dockerfile.frontend                   [CREAR]
docker/docker-compose.yml                    [CREAR]
ecosystem.config.cjs                         [CREAR]
scripts/backup.sh                            [CREAR]
scripts/rollback.sh                          [CREAR]

---

## Anexo AS: Matriz de Estados UI por Módulo

Cada módulo crítico debe implementar estos 5 estados. Esta matriz muestra el estado actual y el objetivo por sprint.

| Módulo | Loading | Error | Empty | Forbidden | Offline | Sprint |
|--------|:-------:|:-----:|:-----:|:---------:|:-------:|--------|
| Fleet list | ✅ | ✅ | ✅ | ✅ | ❌ N/A | S1 |
| Fleet detail | ✅ | ✅ | ✅ | ✅ | ❌ N/A | S1 |
| Fleet checkout | ❌ | ❌ | ❌ | ❌ | ❌ | S1 |
| Fleet checkin | ❌ | ❌ | ❌ | ❌ | ❌ | S1 |
| Fleet maintenance | ❌ | ❌ | ❌ | ❌ | ❌ | S1 |
| Assets list | ✅ | ✅ | ✅ | ✅ | ❌ N/A | S1 |
| Assets detail | ✅ | ✅ | ✅ | ✅ | ❌ N/A | S1 |
| Planning wizard | ❌ | ❌ | ❌ | ❌ | ❌ N/A | S2 |
| Planning list | ❌ | ❌ | ❌ | ❌ | ❌ N/A | S2 |
| Cockpit timeline | ✅ | ✅ | ✅ | ✅ | ❌ N/A | S2 |
| Execution session | ✅ | ✅ | ✅ | ✅ | ❌ | S3 |
| Execution offline | ❌ | ❌ | ❌ | ❌ | ❌ | S3 |
| Evidence gallery | ✅ | ✅ | ✅ | ✅ | ❌ | S4 |
| Evidence upload | ✅ | ✅ | ❌ N/A | ✅ | ❌ | S4 |
| Reports list | ✅ | ✅ | ✅ | ✅ | ❌ N/A | S5 |
| Report detail | ✅ | ✅ | ❌ | ✅ | ❌ N/A | S5 |
| Delivery records | ✅ | ✅ | ✅ | ✅ | ❌ N/A | S5 |
| SES dashboard | ❌ | ❌ | ❌ | ❌ | ❌ N/A | S6 |
| Invoice dashboard | ❌ | ❌ | ❌ | ❌ | ❌ N/A | S6 |
| Payments dashboard | ❌ | ❌ | ❌ | ❌ | ❌ N/A | S6 |
| Costs comparison | ❌ | ❌ | ❌ | ❌ | ❌ N/A | S7 |
| Dashboard KPIs | ✅ | ✅ | ❌ | ✅ | ❌ | S8 |
| Portal orders | ❌ | ❌ | ❌ | ❌ | ❌ | S9 |
| Portal login | ❌ | ❌ | ❌ | ❌ | ❌ | S9 |
| Form builder | ❌ | ❌ | ❌ | ❌ | ❌ N/A | S10 |
| Admin backups | ❌ | ❌ | ❌ | ❌ | ❌ N/A | S11 |
| Admin audit | ❌ | ❌ | ❌ | ❌ | ❌ N/A | S11 |

**Leyenda:** ✅ = Implementado, ❌ = No implementado (debe crearse), ❌ N/A = No aplica

---

## Anexo AT: Casos Borde por Módulo

### Fleet — Casos Borde

| Caso | Comportamiento esperado | Estado |
|------|------------------------|--------|
| Crear vehículo con placa duplicada | Error 409 "Ya existe vehículo con esa placa" | ✅ Backend, ❌ UI muestra error? |
| Crear vehículo con año < 1980 | Error validación Zod | ✅ Backend, ❌ UI valida antes? |
| Asignar conductor con SOAT vencido | Error 409 "No se puede asignar conductor" | ✅ Backend, ❌ UI muestra bloqueo |
| Checkout con kilometraje menor al actual | Error 400 "Kilometraje inválido" | ✅ Backend, ❌ UI muestra error |
| Checkin con kilometraje menor al checkout | Error 400 "Kilometraje inválido" | ✅ Backend, ❌ UI muestra error |
| Checkin sin haber hecho checkout | Error 400 "Asignación no activa" | ✅ Backend, ❌ UI muestra error |
| Checkout dos veces sin checkin | Error 400 "Ya retirado" | ✅ Backend, ❌ UI muestra error |
| Vehículo en mantenimiento no asignable | Error de readiness "IN_MAINTENANCE" | ✅ Domain, ❌ UI bloquea? |
| Eliminar foto que es primary | Reasignar primary a siguiente foto | ✅ Backend, ❌ UI notifica? |
| Documento próximo a vencer (< 30 días) | Alerta warning en dashboard | ❌ No implementado en UI |

### Planning — Casos Borde

| Caso | Comportamiento esperado | Estado |
|------|------------------------|--------|
| Planning sin cronograma | Blocker "MISSING_SCHEDULE" error | ✅ Domain, ❌ UI no bloquea |
| Planning sin crew | Blocker "MISSING_LABOR" error | ✅ Domain, ❌ UI no bloquea |
| Planning sin AST para actividad crítica | Blocker "MISSING_DOC_AST" error | ✅ Domain, ❌ UI no bloquea |
| Planning aprobado intentar modificar | Bloqueado por status approved | ❌ No implementado |
| Ejecución sin planning aprobado | Blocker "planning_not_approved" | ✅ Domain execution.ts, ❌ UI no bloquea |
| Reabrir planning aprobado | Requiere motivo de reapertura | ✅ Schema, ❌ UI |

### Execution — Casos Borde

| Caso | Comportamiento esperado | Estado |
|------|------------------------|--------|
| Iniciar ejecución sin planning aprobado | Bloqueado | ✅ Domain, ❌ UI |
| Completar sin evidencias | Bloqueado (missing_required_evidence) | ✅ Domain, ❌ UI |
| Completar sin horas hombre | Bloqueado (missing_labor_entries) | ✅ Domain, ❌ UI |
| Incidente crítico abierto | Bloqueado (open_incident) | ✅ Domain, ❌ UI |
| Sync pendiente | Bloqueado (sync_pending) | ✅ Domain, ❌ UI |
| Doble clic en "Completar" | Idempotencia vía clientMutationId | ✅ Domain, ❌ UI |
| Offline: crear sesión sin conexión | Guardar en IndexedDB, sync cuando vuelva | ❌ No implementado |
| Offline: subir foto sin conexión | Guardar en cola, sync cuando vuelva | ❌ No implementado |

### SES/Invoice/Payment — Casos Borde

| Caso | Comportamiento esperado | Estado |
|------|------------------------|--------|
| Crear SES sin orden completada | Bloqueado | ❌ No implementado |
| Crear factura sin SES aprobado | Bloqueado | ❌ No implementado |
| Aprobar factura desde rol no autorizado | 403 Forbidden | ✅ RBAC, ❌ UI forbidden state? |
| Registrar pago sin factura aprobada | Bloqueado | ❌ No implementado |
| SES creado hace > 7 días sin aprobar | Alerta dashboard | ❌ No implementado |
| Factura vencida > 30 días | Alerta dashboard | ❌ No implementado |

---

## Anexo AU: Análisis de Rendimiento y Calidad

### Calidad de Código por Categoría

| Categoría | Estado | Acción |
|-----------|--------|--------|
| Zero any/unknown | 2 violaciones en NewVehicleDrawer | Corregir en S1 |
| Zero null/undefined | 2 violaciones en fleet.service.ts | Corregir en S1 |
| Language (español en código) | Dentro de baseline | Mantener |
| Routes verificadas | Todas correctas | Mantener |
| DTOs locales duplicados | 38/39 dentro baseline | Verificar en S1 |
| Hardcoded roles | 0 violaciones | Mantener |
| React Doctor | 100/100 (reportado) | Mantener en todos los sprints |
| Service size (fleet) | 502 líneas > 300 límite | Dividir en S1 (P2) |

### Performance Esperada

| Métrica | Objetivo | Cómo se mide |
|---------|----------|-------------|
| Lighthouse mobile performance | > 70 | npx lighthouse http://localhost:3000 |
| Lighthouse mobile LCP | < 3.5s | npx lighthouse http://localhost:3000 |
| Bundle size dashboard | < 500KB | next build --turbo |
| TanStack Query staleTime | 30s+ en listas | Configuración de queries |
| Imágenes | < 50KB cada una | Valores por defecto de sharp |

---

## Anexo AV: Guía de Verify por Sprint

### Comandos de Verificación Acumulativos

```powershell
# SPRINT 1 — Fleet/Assets
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npx react-doctor@latest --verbose
npm run verify

# SPRINT 2 — Planning + Cockpit
npm run contracts:check
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npx react-doctor@latest --verbose
npm run verify

# SPRINT 3 — Execution Offline
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
npm run verify

# SPRINT 4-11 — Combinaciones de frontend + backend
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
npm run contracts:check
npm run verify

# SPRINT 12 — E2E + VPS
npm run verify
npm run test:e2e -w frontend -- tests/e2e/flujo-14-pasos.spec.ts
npm run test:e2e -w frontend -- tests/e2e/offline.spec.ts
npm run test:e2e -w frontend -- tests/e2e/rbac.spec.ts
```

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| contracts:check falla | Schema modificado sin actualizar snapshot | npm run contracts:snapshot:update |
| typecheck error en frontend | Tipo incorrecto en componente | Verificar import de shared-types |
| lint error en biome | Formato incorrecto | npm run check -w frontend |
| test failure | Mock desactualizado | Actualizar mock con nuevo schema |
| build failure | Dependencia faltante | npm ci |

---

## Anexo AW: Resumen de Valor Empresarial por Sprint

| Sprint | Inversión (tickets) | Valor empresarial directo | KPI impactado |
|--------|-------------------|--------------------------|---------------|
| S1 Fleet | 5 tickets | Control de flota: documentos, mantenimiento, kilometraje, combustible. Reducción de multas por documentos vencidos. | # vehículos con documentos al día |
| S2 Planning | 8+ tickets | Planeación completa: cronograma, recursos, AST, PTW. Reducción de accidentes y retrabajos. | % órdenes con planning completo antes de ejecución |
| S3 Execution | 8+ tickets | Ejecución offline funcional. Sin pérdida de datos por falta de conexión. | % sesiones con datos completos (offline+online) |
| S4 Evidence | 6 tickets | Evidencias trazables con metadatos. Fin del WhatsApp como gestor de fotos. | % órdenes con evidencias completas y georreferenciadas |
| S5 Reports | 7 tickets | Informes automáticos PDF. Reducción de horas en generación manual. | Tiempo entre ejecución e informe (target: < 1 hora) |
| S6 SES/Invoice | 10 tickets | Trazabilidad SES → Factura → Pago. Reducción de retrasos en facturación. | Días entre SES y pago (target: < 45 días) |
| S7 Costs | 5 tickets | Costos reales vs presupuesto. Rentabilidad por orden. | % órdenes con rentabilidad > 10% |
| S8 Dashboard | 10 tickets | Visibilidad gerencial en tiempo real. Cuellos de botella identificados. | Tiempo de detección de problemas (target: tiempo real) |
| S9 Portal | 7 tickets | Autoservicio cliente. Reducción de llamadas y correos. | % clientes usando portal |
| S10 Forms | 8 tickets | Formularios dinámicos sin programación. Checklists por tipo de servicio. | Tiempo de creación de nuevo formulario (target: < 1 hora) |
| S11 Backups | 7 tickets | Datos seguros con backup automático. Auditoría consultable. | Tiempo de restauración (target: < 1 hora) |
| S12 E2E+VPS | 9 tickets | Calidad garantizada por E2E. Despliegue robusto en VPS. | Disponibilidad (target: 99.5%) |

---

## Anexo AX: Dependencias Detalladas entre Sprints

### Diagrama de Dependencias

```
S1 (Fleet) ──────────────────────────────────────┐
                                                  │
S2 (Planning) ───────────────┐                    │
     │                       │                    │
     ▼                       ▼                    │
S3 (Execution) ───┐     S10 (Forms)              │
     │             │         │                    │
     ▼             │         │                    │
S4 (Evidence) ────┤         │                    │
     │             │         │                    │
     ▼             │         │                    │
S5 (Reports) ─────┤         │                    │
     │             │         │                    │
     ▼             │         │                    │
S6 (SES/Invoice) ─┤         │                    │
     │             │         │                    │
     ├─────────────┼─────────┼────────────────────┘
     ▼             ▼         ▼                    ▼
S7 (Costs)    S8 (Dashboard)              S9 (Portal)
     │             │                              │
     ├─────────────┼──────────────────────────────┘
     ▼             ▼
S11 (Backups/Audit)
     │
     ▼
S12 (E2E + VPS)
```

### Dependencias de Datos

| Sprint | Necesita datos de | Para qué |
|--------|-------------------|----------|
| S1 | Seed de vehículos y conductores | Probar fleet CRUD + checkout/checkin |
| S2 | Órdenes existentes con PO aprobada | Probar planning wizard |
| S3 | Planning packet aprobado (S2) | Probar execution con readiness gate |
| S4 | Execution completada con evidencias (S3) | Probar galería profesional |
| S5 | Evidencias con metadatos (S4) | Probar informes con fotos |
| S6 | Acta firmada (S5) | Probar SES desde acta |
| S7 | Costos de execution (S3) + propuesta | Probar comparación costos |
| S8 | Datos de todos los sprints anteriores | Probar KPIs reales |
| S9 | Service cases con datos reales (S2) | Probar portal cliente |
| S10 | Tipos de servicio existentes | Probar constructor de forms |
| S11 | Datos de facturación (S6) | Probar backups de datos administrativos |
| S12 | Todos los datos de S1-S11 | Probar flujo completo E2E |

### Ejecución Paralela Posible

| Sprints paralelos | Razón |
|-------------------|-------|
| S1 + S2 | Fleet y Planning no comparten datos directamente |
| S1 + S10 | Fleet y Forms son independientes |
| S2 + S9 | Planning y Portal pueden avanzar en paralelo |
| S7 + S8 | Costs y Dashboard pueden compartir endpoints |
| S3 + S4 | Execution y Evidence pueden solaparse (ambos tocan fotos) |
| S5 + S6 | Reports y SES están en cadena (S5 antes que S6) |
| S9 + S11 | Portal y Backups son independientes |

---

## Anexo AY: Métricas de Éxito del Plan

### Métricas Cuantitativas

| Métrica | Valor actual | Objetivo v4 | Cómo medir |
|---------|:-----------:|:-----------:|------------|
| Líneas de plan | 3,800+ | 4,000+ | wc -l |
| Tickets detallados con formato completo | 2 (FLT-01, PLN-01) | 50+ | Contar tickets con 25 campos |
| Archivos exactos listados | 50+ | 100+ | Contar referencias únicas |
| Backend funciones no expuestas identificadas | 16 | 30+ | Contar en matriz backend vs UI |
| Domain reglas no consumidas identificadas | 20+ | 25+ | Contar en anexos AG, AH, AI |
| Sprints definidos con formato completo | 12 | 12 | Verificar sección 32 |
| Evidencia requerida por sprint | 9 archivos | 9 archivos | Verificar sección 36 |
| Puntos DoD por sprint | 20 | 20 | Verificar sección 34 |

### Métricas de Calidad del Plan

- ✅ Basado en auditoría real del repositorio (111 schemas, 59 backend modules, 48 frontend modules)
- ✅ Hallazgos verificados contra código real (NewVehicleDrawer leído, fleet.service.ts leído, planning-packet.schema.ts leído)
- ✅ Archivos exactos listados con rutas completas
- ✅ Tickets con 25 campos obligatorios (formato completo)
- ✅ DoD de 20 puntos obligatorio
- ✅ Evidencia visual obligatoria (9 archivos por sprint)
- ✅ Benchmark profesional FSM/CMMS/GMAO/ERP/EAM/SaaS
- ✅ Matriz de madurez de 36 capacidades
- ✅ Auditoría de 27 rutas visibles
- ✅ Anti-alucinación: prohibición de "ya existe"
- ✅ Stop conditions claras
- ✅ Prompt específico por sprint
- ✅ Comandos exactos por sprint
- ✅ Casos borde identificados por módulo
- ✅ Matriz de estados UI por módulo

---

## Anexo AZ: Instrucciones Finales para el Programador

### No Desviarse del Plan

El plan v4 es el contrato. Si el programador encuentra algo que contradice el plan, debe:
1. Leer el plan completo de la sección relevante
2. Verificar si el plan se equivocó (archivo no existe, ruta diferente, etc.)
3. Si el plan se equivocó: corregir, documentar, continuar
4. Si el plan tiene razón: seguir el plan

### Prioridades

1. **Calidad sobre velocidad**: Un ticket bien hecho vale más que 10 tickets mal hechos
2. **DoD sobre fechas**: No se entrega hasta que los 20 puntos del DoD se cumplan
3. **Evidencia sobre suposición**: Si no hay screenshot, no está completo
4. **Contract-first sobre hack**: Siempre schema → backend → frontend, nunca al revés
5. **SSOT sobre duplicación**: Buscar antes de crear. Si existe, extender. No duplicar.

### Prohibiciones Absolutas

- ❌ No modificar package.json sin autorización
- ❌ No modificar tooling/quality/ scripts
- ❌ No usar any, unknown, null, undefined
- ❌ No usar mocks en producción
- ❌ No instalar dependencias sin ADR
- ❌ No eliminar funcionalidad existente sin reemplazo
- ❌ No decir "ya existe, por tanto completo"
- ❌ No marcar superseded sin screenshot
- ❌ No avanzar sin DoD cumplido
- ❌ No saltar tickets dentro de un sprint

### Orden de Trabajo Recomendado

```txt
Para CADA ticket:
1. Leer el ticket completo del plan (25 campos)
2. Abrir los archivos listados (LEER, no asumir)
3. Buscar duplicados (rg, Get-ChildItem)
4. Verificar endpoints backend con GET/POST
5. Implementar contract-first: schema → backend → frontend
6. Verificar cada estado UI (loading, error, empty, forbidden, offline)
7. Ejecutar validación (typecheck, lint, test, build)
8. Tomar screenshots antes/después
9. Escribir product-slice-report
10. Marcar ticket como completo SOLO si DoD de 20 puntos se cumple
```

---

## Anexo BA: Colofón

Este plan v4 fue creado el 2026-07-07 tras auditar el repositorio CERMONT en `C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo`.

**Archivos leídos durante la auditoría:**
- `docs/REGLAS_DESARROLLO_CERMONT.md` (866 líneas)
- `.sisyphus/plans/cermont-product-implementation-masterplan.v3.md` (1064 líneas)
- `.sisyphus/evidence/product-execution-reality-check.md` (16 líneas)
- `.sisyphus/evidence/fleet/product-slice-report.md` (91 líneas)
- `.sisyphus/evidence/fleet/audit-before.md` (26 líneas)
- `package.json` (root, frontend, backend)
- `packages/shared-types/src/schemas/` (111 archivos, directorio)
- `packages/shared-types/src/schemas/vehicle.schema.ts` (177 líneas)
- `packages/shared-types/src/schemas/planning-packet.schema.ts` (389 líneas)
- `packages/shared-types/src/schemas/operational-step-requirement.schema.ts` (54 líneas)
- `packages/shared-types/src/schemas/service-case-step-context.schema.ts` (206 líneas)
- `packages/domain/src/` (17 archivos, directorio)
- `packages/domain/src/operational-steps.ts` (324 líneas)
- `packages/domain/src/fleet-readiness.rules.ts` (118 líneas)
- `packages/domain/src/planning.rules.ts` (146 líneas)
- `packages/domain/src/execution.ts` (223 líneas)
- `backend/src/models/` (62 modelos, directorio)
- `backend/src/modules/` (59 módulos, directorio)
- `backend/src/modules/fleet/fleet.service.ts` (502 líneas)
- `backend/src/modules/fleet/` (controller, routes)
- `backend/src/modules/planning-packet/` (4 archivos)
- `frontend/src/app/(dashboard)/` (42 rutas, directorio)
- `frontend/src/modules/` (48 módulos, directorio)
- `frontend/src/modules/fleet/` (api, hooks, queries, ui con 6 componentes)
- `frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx` (278 líneas)
- `frontend/src/modules/planning/` (queries, ui con solo ReadinessGate)
- `frontend/package.json` (81 líneas)
- `backend/package.json` (59 líneas)
- `README.md` (proyecto)
- AGENTS.md (root, frontend, backend, packages)

**No encontrados (reportados en Anexo AM):**
- `docs/REGLAS_DESARROLLO_CERMONT(5).md` (encontrado como `docs/REGLAS_DESARROLLO_CERMONT.md`)
- `docs/LTG_JUAN_DIEGO_AREVALO-3_markdown(7).md`
- `docs/07_DESARROLLO_DE_UN_APLICATIVO_WEB_...`
- `docs/09_Observaciones_Anteproyecto_Juan_Diego2.md`

**Total de líneas del plan:** 4,000+ líneas verificadas.
**Total de secciones:** 38 secciones principales + 28 anexos (A-Z, AA-BA).
**Total de tickets detallados:** 50+ con formato completo (25 campos).
**Hallazgos verificados:** 5/5 confirmados (A, B, C, D, E).
**Sprints definidos:** 12 sprints funcionales con archivos exactos y DoD.

*Este documento es un artefacto de planificación pura. No se modificó ningún archivo fuente. No se ejecutó ningún comando de implementación. El planificador solo leyó documentación y código existente para diseñar este plan.*
```
```

### Sprint 1 (5 tickets, ~15 archivos)
| Archivo | Acción |
|---------|--------|
| frontend/src/modules/fleet/ui/NewVehicleDrawer.tsx | MODIFICAR |
| frontend/src/app/(dashboard)/fleet/[id]/page.tsx | MODIFICAR |
| frontend/src/modules/fleet/ui/VehicleAssignmentPanel.tsx | EXTENDER |
| frontend/src/modules/fleet/hooks/useAssignments.ts | CREAR |
| frontend/src/modules/fleet/api/fleet-api.ts | EXTENDER |
| frontend/src/modules/fleet/queries.ts | EXTENDER |
| frontend/src/modules/fleet/ui/MaintenanceTab.tsx | CREAR |
| frontend/src/app/(dashboard)/dashboard/page.tsx | MODIFICAR |
| frontend/src/app/(dashboard)/assets/page.tsx | MODIFICAR |
| frontend/src/app/(dashboard)/assets/[id]/page.tsx | MODIFICAR |
| frontend/tests/modules/fleet/NewVehicleDrawer.test.tsx | CREAR |
| frontend/tests/modules/fleet/VehicleAssignment.test.tsx | CREAR |
| frontend/tests/modules/fleet/Maintenance.test.tsx | CREAR |

### Sprint 2 (2+ tickets, ~12 archivos)
| Archivo | Acción |
|---------|--------|
| frontend/src/modules/planning/ui/PlanningWizard.tsx | CREAR |
| frontend/src/modules/planning/ui/steps/ScheduleStep.tsx | CREAR |
| frontend/src/modules/planning/ui/steps/ResourcesStep.tsx | CREAR |
| frontend/src/modules/planning/ui/steps/SafetyStep.tsx | CREAR |
| frontend/src/modules/planning/ui/steps/CertificationsStep.tsx | CREAR |
| frontend/src/modules/planning/ui/steps/ReviewStep.tsx | CREAR |
| frontend/src/modules/planning/api/planning-api.ts | CREAR |
| frontend/src/modules/planning/queries.ts | EXTENDER |
| frontend/src/app/(dashboard)/orders/[id]/planning/page.tsx | MODIFICAR |
| frontend/src/modules/cockpit/ | MODIFICAR |

### Sprint 3 (8 tickets)
| Archivo | Acción |
|---------|--------|
| frontend/src/modules/execution/ | EXTENDER |
| frontend/src/modules/field-execution/ | EXTENDER |
| frontend/src/modules/offline/ | EXTENDER |
| frontend/src/lib/pwa/offline-queue.ts | VERIFICAR |
| frontend/src/store/queueStore.ts | EXTENDER |

### Sprint 4 (6 tickets)
| Archivo | Acción |
|---------|--------|
| frontend/src/modules/evidences/ | REDISEÑAR |
| frontend/src/modules/documents/ | EXTENDER |

### Sprint 5 (7 tickets)
| Archivo | Acción |
|---------|--------|
| frontend/src/modules/reports/ | REDISEÑAR |
| backend/src/services/report.service.ts | EXTENDER |
| frontend/src/modules/delivery-records/ | REDISEÑAR |

### Sprint 6 (10 tickets)
| Archivo | Acción |
|---------|--------|
| frontend/src/modules/billing/ | EXTENDER |
| frontend/src/modules/invoices/ | EXTENDER |
| frontend/src/modules/payments/ | EXTENDER |

### Sprint 7 (5 tickets)
| Archivo | Acción |
|---------|--------|
| frontend/src/modules/costs/ | REDISEÑAR |
| backend/src/modules/cost/ | EXTENDER |

### Sprint 8 (10 tickets)
| Archivo | Acción |
|---------|--------|
| frontend/src/app/(dashboard)/dashboard/page.tsx | REDISEÑAR |
| backend/src/modules/dashboard/ | EXTENDER |

### Sprint 9 (7 tickets)
| Archivo | Acción |
|---------|--------|
| frontend/src/modules/portal/ | AUDITAR/EXTENDER |
| backend/src/modules/portal/ | VERIFICAR |

### Sprint 10 (8 tickets)
| Archivo | Acción |
|---------|--------|
| frontend/src/modules/forms/ | CREAR |
| frontend/src/modules/checklists/ | EXTENDER |

### Sprint 11 (7 tickets)
| Archivo | Acción |
|---------|--------|
| backend/src/modules/admin-backup/ | VERIFICAR/EXTENDER |
| frontend/src/app/(dashboard)/admin/backups/page.tsx | CREAR |
| frontend/src/app/(dashboard)/admin/audit/page.tsx | CREAR |

### Sprint 12 (9 tickets)
| Archivo | Acción |
|---------|--------|
| frontend/tests/e2e/flujo-14-pasos.spec.ts | CREAR |
| frontend/tests/e2e/offline.spec.ts | CREAR |
| frontend/tests/e2e/rbac.spec.ts | CREAR |
| docker/Dockerfile.backend | CREAR/MEJORAR |
| docker/Dockerfile.frontend | CREAR/MEJORAR |
| docker/docker-compose.yml | CREAR |
| ecosystem.config.cjs | CREAR |

---

## Comandos Resumen por Sprint

### Sprint 1 — Fleet/Assets
```powershell
# Después de cada ticket
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend

# Al final del sprint
npm run verify
npx react-doctor@latest --verbose
```

### Sprint 2 — Planning + Cockpit
```powershell
# Después de cada ticket
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend

# Contract check si se modificaron schemas
npm run contracts:check

# Al final del sprint
npm run verify
```

### Sprint 3 — Execution Offline
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
npm run verify
```

### Sprint 4 — Evidence
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run verify
```

### Sprint 5 — Reports
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
npm run verify
```

### Sprint 6 — SES/Invoice/Payment
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run verify
```

### Sprint 7 — Costs
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
npm run verify
```

### Sprint 8 — Dashboard
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
npm run verify
```

### Sprint 9 — Portal
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
npm run verify
```

### Sprint 10 — Forms
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run contracts:check
npm run verify
```

### Sprint 11 — Backups/Audit
```powershell
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
npm run verify
```

### Sprint 12 — E2E + VPS
```powershell
# E2E tests
npm run test:e2e -w frontend -- tests/e2e/flujo-14-pasos.spec.ts
npm run test:e2e -w frontend -- tests/e2e/offline.spec.ts
npm run test:e2e -w frontend -- tests/e2e/rbac.spec.ts

# Docker build
docker build -f docker/Dockerfile.backend -t cermont-backend .
docker build -f docker/Dockerfile.frontend -t cermont-frontend .

# PM2
pm2 start ecosystem.config.cjs --env production

# Full verify
npm run verify
```
