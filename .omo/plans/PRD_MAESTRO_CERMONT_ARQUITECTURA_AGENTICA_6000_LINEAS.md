---
title: "PRD MAESTRO CERMONT — Arquitectura de Producto, Software y Ejecución Agéntica"
document_type: "Product Requirements Document"
document_status: "Authoritative Working Baseline"
version: "1.0.0"
language: "es"
target_line_count: 6000
generated_at_utc: "2026-07-19T18:52:59.476360+00:00"
product: "Plataforma CERMONT"
organization: "CERMONT S.A.S."
repository_windows_path: "C:\\Users\\camil\\Downloads\\cermont_aplicativo\\cermont_aplicativo"
repository_remote_reference: "https://github.com/JuanDiego30/cermont_aplicativo.git"
execution_shell: "Bash"
autonomous_git_policy: "NO_GIT_COMMANDS"
architecture_style:
  - "Modular Monorepo"
  - "Contract-First"
  - "Vertical Slices"
  - "Domain-Oriented"
  - "Offline-First"
  - "Defense in Depth"
  - "Event-Audited"
  - "Agent-Orchestrated"
primary_stack:
  frontend: "Next.js 16 + React 19 + TypeScript + Tailwind CSS + TanStack Query + Zustand"
  backend: "Express 5 + TypeScript + Mongoose + MongoDB"
  contracts: "Zod + TypeScript"
  offline: "PWA + Serwist + IndexedDB/Dexie + mutation queue"
  testing: "Vitest + Supertest + Playwright"
deployment_target: "VPS"
---

# PRD MAESTRO CERMONT

## PRODUCT REQUIREMENTS DOCUMENT PARA DESARROLLAR, CORREGIR, REFACTORIZAR, MADURAR, ESCALAR E INNOVAR LA PLATAFORMA

## 0. DECLARACIÓN DE AUTORIDAD

Este documento es la línea base de producto, arquitectura, ejecución, calidad y coordinación agéntica para la plataforma CERMONT.
Debe ser leído antes de modificar funcionalidades, contratos, arquitectura, persistencia, experiencia de usuario, seguridad, operación offline, documentación o despliegue.
No es únicamente una lista de funcionalidades.
Es un contrato operativo entre producto, arquitectura, agentes, subagentes, código, pruebas y documentación.
Toda implementación debe demostrar trazabilidad entre problema, requisito, diseño, código, prueba y evidencia.
No se debe eliminar funcionalidad existente sin reemplazarla, mejorarla o escalarla de forma verificada.
No se debe presentar una interfaz simulada como funcionalidad terminada.
No se deben afirmar resultados cuantitativos sin medición verificable.
No se debe reconstruir el sistema desde cero sin auditar la implementación existente.
No se deben ejecutar comandos Git durante la ejecución autónoma.
No se deben borrar documentos, pruebas, assets, datos o código parcialmente implementado.
Toda modificación debe avanzar desde el estado actual y conservar evidencia de los archivos intervenidos.

## 1. RESUMEN EJECUTIVO

CERMONT S.A.S. requiere una plataforma modular para gestionar órdenes de trabajo, trazabilidad operativa, evidencias, documentación técnica, cierre administrativo y seguimiento financiero.
El proceso empresarial no termina cuando finaliza el trabajo de campo.
Continúa con informes, actas, aceptación del cliente, SES, facturación, aprobación, pago y cierre.
La plataforma debe conectar esos registros bajo una entidad transversal y una secuencia controlada.
El sistema debe resolver cinco fallas críticas:
1. Planeación incompleta de personal, herramientas, equipos, certificaciones, EPP y documentos.
2. Ejecución con evidencias dispersas y operación en conectividad intermitente.
3. Retrasos y recaptura en informes, actas y documentos de cierre.
4. Retrasos en SES, facturación, aprobaciones y recaudo.
5. Ausencia de comparación centralizada entre costo estimado, presupuestado y real.
El producto se posiciona entre FSM, CMMS y ERP.
No debe intentar reemplazar todas las funciones de un ERP generalista.
Debe especializarse en el proceso real de CERMONT.
La diferenciación principal es integrar operación de campo, documentación, cierre administrativo y consulta histórica.
El desarrollo debe mantener una arquitectura modular con contratos compartidos, reglas de dominio, backend separado, frontend modular, persistencia documental, PWA offline, RBAC y auditoría.
El producto debe evolucionar de prototipo académico a plataforma operativa sostenible.
La adopción debe ser gradual y basada en datos reales.
La innovación debe ser explicable, configurable y segura.

## 2. DOCUMENTOS FUENTE

Los documentos fuente fueron leídos desde los archivos cargados.
Su contenido define contexto, reglas, formatos, actores, riesgos y alcance.
- SRC-01: `LTG_JUAN_DIEGO_AREVALO-3_markdown(13).md` — 4935 líneas — SHA-256 `bb3197f8c035e25aa7615e98ab9dfd0e896f94e0b231f77e815fe39272e75a64`.
- SRC-02: `REGLAS_DESARROLLO_CERMONT(11).md` — 866 líneas — SHA-256 `510e84703fa3a568461d3b798df8b17a68ad94cd0711ff678b4d56644cbfdc95`.
- SRC-03: `06_FORMATO_DE_PLANEACION_DE_OBRA3(5).md` — 53 líneas — SHA-256 `4c435d75abf2602231b57f57dbc7ee34029d023e65934ed6f2b4572ef49ca355`.
- SRC-04: `07_DESARROLLO_DE_UN_APLICATIVO_WEB_PARA_APOYO_EN_LA_EJECUCION_Y_CIERRE_ADMINISTRATIVO_DE_LOS_TRABA3(7).md` — 88 líneas — SHA-256 `8c5096d8d37731bd173aeec17e9a57248daa03b1300be8042c1f0c4742c8ed0f`.
- SRC-05: `08_Formato_Inspeccion_lineas_de_vida_Vertical3(4).md` — 115 líneas — SHA-256 `ffd5a80dc79c30541b4bf340317e973dc3592c5a451ec8d88b25ad416fbe2bf4`.
- SRC-06: `09_Observaciones_Anteproyecto_Juan_Diego2(6).md` — 113 líneas — SHA-256 `2964b2495d084a5476df9e5e79f52568758d2f104e79544c7ceccbc3bd6feb96`.
- SRC-07: `10_Formato_Mantenimiento_CCTV3(4).md` — 65 líneas — SHA-256 `41c1cf5c081194ed9be2f3c2ec111b0e6c2eb62d30bde9b242af46b378648176`.
- SRC-08: `05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA3(4).md` — 50 líneas — SHA-256 `84b11464b49e5a7d8855bbe20b8bec94daddc1d273082383bb1a1a10380e5f80`.
- SRC-09: `02_INDUCCION_SGSST3(3).md` — 1107 líneas — SHA-256 `f318331d2587429fc30122a07c94c69956203703baaf0c7dbd54f59c9664fe9f`.
- SRC-10: `03_Jerarquia_de_controles_Cermont2(3).md` — 47 líneas — SHA-256 `1ff56cfa88c159661bd114ca7daed2addc25f783cb2891879cbf86840db8dba4`.

## 3. PRECEDENCIA DE FUENTES

Cuando exista contradicción, se aplica este orden:
1. Obligaciones legales y de seguridad.
2. Reglas operativas verificadas de CERMONT.
3. Flujo canónico de catorce pasos y sus compuertas.
4. Reglas de desarrollo CERMONT.
5. Contratos compartidos vigentes y validados.
6. Reglas puras del dominio.
7. Código ejecutable actual.
8. Pruebas que representen el comportamiento correcto.
9. Plan específico aprobado más reciente.
10. LTG como marco funcional y arquitectónico.
11. Formatos heredados.
12. Propuestas de innovación no implementadas.
Una fecha reciente no convierte automáticamente un documento en fuente de verdad.
Una prueba que contradiga una regla empresarial debe revisarse.
Un documento heredado no debe copiarse literalmente sin modelado.
Toda contradicción debe registrarse como decisión.
Toda decisión arquitectónica relevante debe producir o actualizar un ADR.

## 4. GLOSARIO CONTROLADO

- `WorkRequest`: solicitud formal del cliente.
- `SiteVisit`: visita técnica opcional o requerida.
- `Proposal`: propuesta técnica y económica.
- `PurchaseOrder`: aprobación formal u orden de compra.
- `ServiceCase`: entidad transversal del ciclo completo.
- `WorkOrder`: entidad operativa asociada a ejecución.
- `PlanningPacket`: planeación de recursos, seguridad y documentos.
- `ExecutionSession`: sesión controlada de ejecución en campo.
- `TechnicalReport`: informe técnico consolidado.
- `DeliveryRecord`: acta de entrega.
- `ClientAcceptance`: aceptación o firma del cliente.
- `ServiceEntrySheet`: SES.
- `SESApproval`: aprobación de SES.
- `Invoice`: factura y sus soportes.
- `InvoiceApproval`: aprobación de factura.
- `PaymentRecord`: registro de pago.
- `Closure`: cierre definitivo.
- `Artifact`: evidencia, documento, aprobación o soporte asociado a una etapa.
- `Readiness`: condición verificable para avanzar.
- `Blocker`: condición que impide una transición.
- `Contract-First`: diseño mediante schema compartido antes de implementar capas.
- `Vertical Slice`: corte funcional que atraviesa contrato, dominio, backend, frontend y pruebas.
- `Offline-First`: operación que conserva trabajo útil ante conectividad intermitente.
- `SSOT`: fuente única de verdad.
- `RBAC`: control de acceso basado en roles.
- `HES`: seguridad, salud y ambiente según uso interno.
- `FSM`: gestión de servicios de campo.
- `CMMS/GMAO`: gestión de mantenimiento y activos.
- `ERP`: planificación integral de recursos empresariales.
- `DLQ`: cola de operaciones fallidas que requieren revisión.
- `ADR`: Architecture Decision Record.
- `PRD`: Product Requirements Document.

## 5. VISIÓN DEL PRODUCTO

Construir una plataforma operativa y documental que permita a CERMONT planear, ejecutar, demostrar, cerrar y analizar cada servicio desde una única línea de trazabilidad.
La plataforma debe ayudar a evitar omisiones antes de la salida a campo.
Debe mantener evidencia contextual durante la ejecución.
Debe reducir recaptura en informes y actas.
Debe mostrar bloqueos del cierre administrativo.
Debe preparar datos para análisis de costos y tiempos.
Debe funcionar en condiciones de conectividad variable.
Debe conservar evidencia histórica y soportar auditoría.
Debe permitir configuración gradual mediante kits, checklists y plantillas.
Debe servir a técnicos, supervisores, HES, residentes, administrativos, gerencia y clientes autorizados.
Debe ser mantenible por un equipo pequeño.
Debe desplegarse en VPS sin dependencia obligatoria de plataformas propietarias no aprobadas.

## 6. DECLARACIÓN DEL PROBLEMA

La información operativa se dispersa entre documentos físicos, hojas de cálculo, fotografías, mensajería, actas y plataformas externas.
La dispersión dificulta reconstruir la historia de un servicio.
La planeación depende de memoria y experiencia individual.
La ejecución puede iniciar sin recursos completos.
Las evidencias pueden perder contexto.
Los informes y actas pueden retrasarse.
La SES y la factura dependen de soportes previos.
Los costos reales no siempre se conectan con la propuesta.
La organización necesita una entidad transversal que relacione actores, recursos, documentos, estados y fechas.
El producto debe convertir un flujo informal y fragmentado en un proceso verificable sin imponer complejidad innecesaria.

## 7. OBJETIVOS DE PRODUCTO

### 7.1 Objetivo general

Diseñar, implementar y madurar una plataforma web modular que gestione órdenes de trabajo, trazabilidad documental y cierre administrativo de los procesos operativos de CERMONT S.A.S.

### 7.2 Objetivos específicos

- Centralizar solicitudes, visitas, propuestas y órdenes.
- Formalizar la planeación de recursos y seguridad.
- Permitir ejecución de campo con soporte offline.
- Asociar evidencias a orden, etapa, actor y fecha.
- Generar informes y actas a partir de datos existentes.
- Controlar SES, facturación, aprobación y pago.
- Comparar estimación, presupuesto y costo real.
- Implementar RBAC y auditoría.
- Crear kits y plantillas configurables.
- Proveer dashboard de seguimiento.
- Conservar históricos y respaldos.
- Facilitar validación por roles.
- Mantener calidad de software verificable.

## 8. NO OBJETIVOS

- No sustituir SAP, Ariba o DIAN sin integración aprobada.
- No afirmar reducción de tiempos sin piloto.
- No afirmar ahorros sin datos reales.
- No automatizar decisiones de seguridad sin revisión humana.
- No convertir la plataforma en un ERP generalista.
- No implementar microservicios por moda.
- No migrar de MongoDB sin evidencia.
- No migrar de Express a otro framework sin ADR.
- No sustituir npm por otro gestor sin necesidad.
- No depender de Vercel para producción.
- No eliminar formatos heredados antes de validar equivalencia.
- No exponer información financiera a roles no autorizados.
- No permitir cierre arbitrario.
- No crear IA que apruebe documentos automáticamente.
- No publicar documentos o fotografías sensibles sin autorización.

## 9. PRINCIPIOS DE PRODUCTO

- Trazabilidad antes que apariencia.
- Seguridad antes que conveniencia.
- Configuración antes que duplicación.
- Evidencia antes que afirmación.
- Operación real antes que demo.
- Mobile-first para campo.
- Desktop productivo para supervisión.
- Offline con estados explícitos.
- Menos recaptura.
- Más reutilización de datos.
- Transiciones controladas.
- Permisos mínimos.
- Auditoría por defecto.
- Evolución incremental.
- Innovación con fallback.
- Métricas explicables.
- Compatibilidad hacia adelante.
- Documentación viva.
- Pruebas proporcionales al riesgo.
- Simplicidad operativa.

## 10. MODELO DE MADUREZ

Nivel 0 — Información dispersa.
Nivel 1 — Digitalización de registros.
Nivel 2 — Módulos conectados por identificadores.
Nivel 3 — Flujo controlado por estado y evidencia.
Nivel 4 — Operación offline confiable y configuración.
Nivel 5 — Analítica, predicción explicable e integraciones.
El producto no debe declarar un nivel que no pueda demostrar.
Cada módulo debe registrar su nivel actual.
La roadmap debe priorizar cerrar brechas de niveles anteriores antes de nuevas funciones.

## 11. STAKEHOLDERS

- Gerente.
- Ingeniero residente.
- Coordinador administrativo.
- Coordinador HES.
- Supervisor electricista.
- Técnico electricista.
- Técnico de telecomunicaciones.
- Instrumentista.
- Oficial de construcción.
- Auxiliar administrativo o contable.
- Pasante.
- Cliente corporativo.
- Administrador del sistema.
- Soporte técnico.
- Auditor interno.
- Auditor externo autorizado.
- Responsable de infraestructura VPS.
- Responsable de protección de datos.

## 12. PERSONAS

### 12.1 Gerencia

Necesita visibilidad de órdenes, bloqueos, costos, facturación y recaudo.
No necesita editar detalles técnicos ordinarios.
Requiere indicadores explicables y drill-down.

### 12.2 Ingeniería residente

Necesita calificar solicitudes, preparar propuestas, planear recursos, asignar responsables y revisar cierres.
Debe ver bloqueos y vencimientos.
Necesita minimizar recaptura.

### 12.3 Coordinación HES

Necesita verificar AST, permisos, EPP, certificaciones, riesgos y conformidad.
Debe poder bloquear ejecución.
Debe dejar auditoría.

### 12.4 Técnico de campo

Necesita una interfaz móvil rápida.
Debe consultar orden, planeación, checklist y documentos.
Debe capturar fotos, notas, materiales, horas y firmas.
Debe trabajar offline.
No debe manejar IDs técnicos.

### 12.5 Coordinación administrativa

Necesita actas, SES, facturas, aprobaciones, pagos y documentos.
Debe ver pendientes por orden.
Debe evitar duplicados.

### 12.6 Cliente

Necesita consultar solicitudes, propuestas, órdenes, entregables y aprobaciones permitidas.
No debe ver información de otros clientes.
Debe recibir lenguaje claro.

### 12.7 Administrador

Necesita gestionar usuarios, roles, catálogos, kits, plantillas y configuración.
No debe poder alterar auditoría.

## 13. JOBS TO BE DONE

- Cuando recibo una solicitud, quiero convertirla en un caso trazable.
- Cuando el alcance es incierto, quiero registrar una visita.
- Cuando preparo una propuesta, quiero reutilizar datos previos.
- Cuando recibo una PO, quiero habilitar planeación sin duplicar orden.
- Cuando planeo, quiero saber si faltan herramientas, personal o certificados.
- Cuando salgo a campo, quiero disponer de información sin conexión.
- Cuando capturo evidencia, quiero que quede vinculada automáticamente.
- Cuando termino, quiero generar informe y acta sin recapturar.
- Cuando administro cierre, quiero saber qué soporte falta.
- Cuando registro pago, quiero evitar duplicados y cerrar de forma auditable.
- Cuando analizo costos, quiero comparar estimado y real.
- Cuando audito, quiero reconstruir quién hizo qué y cuándo.
- Cuando configuro un servicio, quiero reutilizar kits y plantillas.
- Cuando consulto históricos, quiero exportar paquetes íntegros.

## 14. FLUJO CANÓNICO DE CATORCE PASOS

1. WorkRequest.
2. SiteVisit.
3. Proposal.
4. PurchaseOrder.
5. PlanningPacket.
6. ExecutionSession.
7. TechnicalReport.
8. DeliveryRecord.
9. ClientAcceptance.
10. ServiceEntrySheet.
11. SESApproval.
12. Invoice.
13. InvoiceApproval.
14. PaymentRecord y Closure.
ServiceCase es la entidad transversal.
WorkOrder representa la ejecución interna cuando el modelo lo requiera.
Cada paso tiene precondiciones.
Cada paso tiene permisos.
Cada paso tiene artifacts.
Cada paso tiene eventos de auditoría.
Cada paso tiene pruebas.
No se permiten saltos silenciosos.
Las excepciones requieren permiso y motivo.
## 15. REQUISITOS FUNCIONALES
### FR-001 — Gestión de autenticación y sesión
- El sistema debe autenticar usuarios con el mecanismo vigente.
- Debe emitir y renovar credenciales según política.
- Debe permitir revocar sesiones.
- Debe impedir acceso de usuarios inactivos.
- Debe auditar login, logout, refresh y revocación.
- El frontend no debe ser el único control de acceso.

### FR-002 — RBAC y jerarquía
- Los permisos deben centralizarse.
- La jerarquía empresarial debe mapearse a roles configurables.
- Los endpoints deben validar permiso y ownership.
- La navegación debe mostrar acciones autorizadas.
- Los cambios de rol deben auditarse.
- Ningún rol debe modificar auditoría.

### FR-003 — Clientes, sedes y contactos
- Debe existir catálogo de clientes.
- Debe existir catálogo de sedes.
- Debe existir catálogo de contactos.
- Los usuarios deben seleccionar nombres y no ObjectIds.
- Debe controlarse acceso por cliente.
- Debe conservarse historial de relaciones.

### FR-004 — Solicitud de trabajo
- Debe capturar canal, cliente, sede, contacto, descripción, urgencia y adjuntos.
- Debe soportar solicitud creada por cliente autorizado o personal interno.
- Debe validar información mínima.
- Debe asignar o permitir calificación.
- Debe crear o vincular ServiceCase.
- Debe generar evento de auditoría.

### FR-005 — Visita técnica
- Debe permitir decidir si la visita es requerida.
- Debe permitir programación y asignación.
- Debe capturar mediciones, riesgos, observaciones y fotografías.
- Debe alimentar propuesta y planeación.
- Debe soportar captura móvil.
- Debe registrar omisión justificada cuando no aplica.

### FR-006 — Propuesta
- Debe estructurar alcance, recursos, condiciones, impuestos y total.
- Debe recalcular totales en backend.
- Debe generar documento reproducible.
- Debe soportar estados de envío, aprobación, rechazo y expiración.
- Debe evitar conversión duplicada.
- Debe vincular artifacts al ServiceCase.

### FR-007 — Orden de compra
- Debe registrar PO o autorización equivalente.
- Debe validar correspondencia con propuesta.
- Debe almacenar soporte documental.
- Debe actuar como compuerta contractual.
- Debe permitir excepciones autorizadas y auditadas.
- Debe crear o vincular WorkOrder de forma idempotente.

### FR-008 — Planeación
- Debe capturar responsable, lugar, fecha, unidad de negocio y alcance.
- Debe gestionar materiales, herramientas, equipos y elementos de seguridad.
- Debe gestionar número y perfiles de trabajadores.
- Debe verificar certificaciones y calibraciones.
- Debe asociar AST, permisos, procedimientos y checklists.
- Debe calcular readiness y blockers.

### FR-009 — Kits típicos
- Debe permitir kits por tipo de servicio.
- Debe incluir recursos, cantidades, documentos y checklists.
- Debe permitir versionado.
- Debe permitir personalización por orden.
- Debe mantener trazabilidad de origen.
- Debe evitar modificar planeaciones históricas al cambiar un kit.

### FR-010 — Ejecución
- Debe controlar inicio, pausa, reanudación y finalización.
- Debe verificar planeación aprobada.
- Debe capturar materiales, horas, notas y checklists.
- Debe asociar evidencias.
- Debe soportar conectividad intermitente.
- Debe impedir cierre sin mínimos definidos.

### FR-011 — Evidencias
- Debe asociar orden, ServiceCase, ejecución, etapa, componente y actor.
- Debe almacenar metadata y estado de sincronización.
- Debe validar MIME y magic bytes.
- Debe soportar before/after cuando aplique.
- Debe permitir verificación, rechazo y reemplazo.
- Debe aplicar borrado lógico y retención.

### FR-012 — Inspección de líneas de vida
- Debe modelar condiciones evaluadas y conformidad.
- Debe registrar hallazgo, acción correctiva y observación.
- Debe modelar componentes y hoja de vida.
- Debe registrar fotografías por componente.
- Debe conservar versión del formato.
- Debe permitir concepto final.

### FR-013 — Mantenimiento CCTV
- Debe capturar generalidades, cámara, radio, antena, switch y ubicación.
- Debe registrar sistema eléctrico y alimentación.
- Debe registrar antes y después por componente.
- Debe soportar seriales y modelos.
- Debe generar informe.
- Debe reutilizar evidencias autorizadas.

### FR-014 — Informe técnico
- Debe reutilizar datos de ejecución y evidencias.
- Debe permitir observaciones y conclusiones.
- Debe controlar revisión interna.
- Debe generar PDF versionado.
- Debe conservar hash y plantilla.
- Debe bloquear acta si el informe no está aprobado cuando aplique.

### FR-015 — Acta de entrega
- Debe generarse desde datos consolidados.
- Debe permitir envío, revisión y corrección.
- Debe vincular aceptación.
- Debe conservar versiones.
- Debe auditar cambios.
- Debe servir como precondición administrativa.

### FR-016 — Aceptación del cliente
- Debe capturar firmante, rol, fecha y documento.
- Debe permitir firma o soporte equivalente.
- Debe validar integridad.
- Debe registrar rechazo o comentarios.
- Debe proteger datos personales.
- Debe actualizar el estado del caso.

### FR-017 — SES
- Debe registrar elaboración y envío.
- Debe almacenar referencia de plataforma externa.
- Debe adjuntar soportes.
- Debe controlar aprobación o rechazo.
- Debe auditar actores y fechas.
- Debe bloquear factura según regla.

### FR-018 — Factura
- Debe relacionarse con SES aprobada.
- Debe validar referencias, moneda, ítems y valores.
- Debe registrar emisión, envío y aprobación.
- Debe adjuntar soporte.
- Debe impedir duplicados.
- Debe preparar integración externa sin fingirla.

### FR-019 — Pago y cierre
- Debe registrar referencia, fecha, valor y soporte.
- Debe ser idempotente.
- Debe impedir pago duplicado.
- Debe conciliar con factura.
- Debe cerrar el ServiceCase cuando todas las precondiciones se cumplen.
- Debe volver inmutable el caso cerrado según política.

### FR-020 — Costos
- Debe separar estimado, presupuestado, comprometido, real, facturado y pagado.
- Debe manejar materiales, mano de obra, herramientas, equipos, transporte, subcontratos, impuestos e imprevistos.
- Debe distinguir cero de dato no disponible.
- Debe calcular variaciones en backend.
- Debe documentar fórmula y moneda.
- No debe mostrar márgenes inventados.

### FR-021 — Inventario y herramientas
- Debe mantener catálogo, disponibilidad y estado.
- Debe asignar recursos a planeación y ejecución.
- Debe registrar check-in y check-out.
- Debe gestionar certificación o calibración.
- Debe alertar vencimientos.
- Debe conservar historial.

### FR-022 — Flota
- Debe gestionar vehículos, documentos, disponibilidad y mantenimiento.
- Debe asociar vehículos a órdenes.
- Debe registrar check-in y check-out.
- Debe alertar vencimientos.
- Debe conservar fotografías y soportes.
- Debe controlar permisos.

### FR-023 — Activos y mantenimiento
- Debe registrar activos y componentes.
- Debe relacionar intervenciones.
- Debe permitir mantenimiento preventivo y correctivo.
- Debe conservar historial.
- Debe relacionar costos.
- Debe soportar QR cuando exista caso de uso.

### FR-024 — Dashboard
- Debe mostrar estado por orden.
- Debe mostrar bloqueos y siguientes acciones.
- Debe documentar KPIs.
- Debe actualizarse con datos reales.
- Debe permitir drill-down.
- Debe distinguir not_available de cero.

### FR-025 — Notificaciones
- Debe notificar asignaciones, cambios, vencimientos y bloqueos.
- Debe permitir preferencias.
- Debe evitar duplicados.
- Debe conservar deep links autorizados.
- Debe registrar estado leído.
- No debe filtrar datos sensibles.

### FR-026 — Portal cliente
- Debe filtrar por identidad y clientId.
- Debe mostrar solicitudes, propuestas, órdenes y documentos permitidos.
- Debe permitir acciones autorizadas.
- Debe impedir acceso cruzado.
- Debe usar lenguaje claro.
- Debe registrar aprobaciones.

### FR-027 — Formularios dinámicos
- Debe permitir templates versionados.
- Debe derivar campos de documentos con revisión humana.
- Debe separar schema, layout y validación.
- Debe conservar versión por respuesta.
- Debe permitir publicación y retiro.
- Debe generar PDF reproducible.

### FR-028 — Offline sync
- Debe persistir mutaciones de campo.
- Debe usar idempotency keys.
- Debe mostrar estado de sincronización.
- Debe conservar errores y conflictos.
- Debe resolver dependencias entre operaciones.
- Debe mantener DLQ.

### FR-029 — Históricos
- Debe permitir consulta por periodo.
- Debe exportar CSV y paquetes documentales.
- Debe generar manifiesto.
- Debe mantener integridad.
- Debe aplicar retención.
- No debe archivar prematuramente datos operativos.

### FR-030 — Backups
- Debe definir frecuencia, retención, cifrado y ubicación.
- Debe probar restauración.
- Debe registrar resultados.
- Debe proteger secretos.
- Debe separar backup de archivo histórico.
- Debe documentar RPO y RTO cuando se validen.

### FR-031 — Administración
- Debe gestionar usuarios, roles, catálogos, kits, plantillas y configuración.
- Debe aplicar permisos mínimos.
- Debe mostrar impacto de cambios.
- Debe conservar historial.
- Debe impedir cambios peligrosos sin confirmación.
- Debe soportar datos maestros.

### FR-032 — Búsqueda
- Debe buscar por código, cliente, sede, estado y fechas.
- Debe respetar permisos.
- Debe evitar resultados de otros clientes.
- Debe soportar paginación.
- Debe indexar campos relevantes.
- Debe registrar consultas costosas para optimización.

### FR-033 — Auditoría
- Debe registrar eventos críticos.
- Debe ser inmutable.
- Debe incluir actor, entidad, acción, requestId y timestamp.
- Debe permitir consulta administrativa.
- Debe redactar secretos.
- No debe tener TTL.

### FR-034 — Integraciones
- Debe encapsular Ariba, DIAN, ERP, correo y AI detrás de adapters.
- Debe definir estados explícitos.
- Debe implementar reintentos acotados.
- Debe usar circuit breaker cuando corresponda.
- Debe permitir sandbox.
- Debe degradarse sin mentir.

### FR-035 — Cermont AI
- Debe asistir, no aprobar automáticamente.
- Debe documentar fuente y confianza.
- Debe proteger información.
- Debe ofrecer revisión humana.
- Debe mantener fallback manual.
- Debe registrar uso y costo cuando exista.

## 16. REQUISITOS NO FUNCIONALES
### NFR-001 — Mantenibilidad
- Arquitectura modular.
- Funciones pequeñas.
- Bajo acoplamiento.
- Alta cohesión.
- ADRs para decisiones importantes.

### NFR-002 — TypeScript estricto
- Cero any explícito.
- Cero casts inseguros.
- Errores tipados.
- Ausencia modelada explícitamente.
- Tipos inferidos desde schemas.

### NFR-003 — Seguridad
- Defense in depth.
- RBAC backend.
- Validación Zod.
- Uploads allowlist.
- Logs sin secretos.

### NFR-004 — Privacidad
- Minimización de datos.
- Finalidad definida.
- Acceso restringido.
- Retención.
- Trazabilidad.

### NFR-005 — Disponibilidad
- Health live.
- Health ready.
- Graceful shutdown.
- Backups.
- Degradación controlada.

### NFR-006 — Offline
- Persistencia local.
- Estado visible.
- Reintentos.
- Idempotencia.
- Conflictos explícitos.

### NFR-007 — Rendimiento
- Paginación.
- Índices.
- Imágenes optimizadas.
- Bundles controlados.
- No N+1.

### NFR-008 — Accesibilidad
- WCAG AA objetivo.
- Teclado.
- Focus visible.
- Labels.
- No depender solo del color.

### NFR-009 — Observabilidad
- Logs JSON.
- Request ID.
- Métricas.
- Errores tipados.
- Dashboards técnicos.

### NFR-010 — Auditabilidad
- Eventos inmutables.
- Búsqueda por entidad.
- Actor.
- Estado previo y nuevo.
- Retención.

### NFR-011 — Compatibilidad
- No romper endpoints usados.
- Deprecación.
- Migración.
- Pruebas.
- Versionado.

### NFR-012 — Escalabilidad
- Escala vertical inicial.
- Colas para trabajo pesado.
- Caching medido.
- Separación de blobs.
- Índices.

### NFR-013 — Calidad
- Typecheck.
- Lint.
- Tests.
- Build.
- E2E.

### NFR-014 — Usabilidad
- Mobile-first.
- Estados completos.
- Lenguaje español.
- Sin ObjectIds.
- Acciones claras.

### NFR-015 — Portabilidad
- VPS.
- Docker cuando exista.
- Variables de entorno.
- Sin lock-in no aprobado.
- Backups exportables.

### NFR-016 — Configurabilidad
- Catálogos.
- Kits.
- Plantillas.
- Permisos.
- Versionado.

### NFR-017 — Integridad
- Transacciones críticas.
- Índices únicos.
- Idempotencia.
- Validaciones.
- Conciliación.

### NFR-018 — Testabilidad
- Dependencias inyectables.
- Adapters.
- Factories.
- Fixtures.
- Sin servicios reales en unit tests.

### NFR-019 — Documentación
- Docs as code.
- OpenAPI.
- ADRs.
- Runbooks.
- Matriz de trazabilidad.

### NFR-020 — Ética
- No métricas inventadas.
- AI supervisada.
- Privacidad.
- Transparencia.
- No automatizar riesgo crítico.


## 17. ARQUITECTURA LÓGICA

La arquitectura se organiza en cinco unidades:
```text
packages/shared-types
packages/domain
packages/config
backend
frontend
```
`shared-types` define contratos serializables.
`domain` define reglas puras y permisos.
`config` define configuración compartida no secreta.
`backend` coordina seguridad, persistencia, documentos, colas e integraciones.
`frontend` implementa experiencia web, PWA y portal.
No se deben crear dependencias circulares.
El dominio no depende de Express, Mongoose ni React.
Los contratos no dependen del backend.
El frontend no importa modelos Mongoose.
El backend no importa componentes frontend.
Los adapters externos no deben contaminar servicios de dominio.

## 18. ARQUITECTURA CONTRACT-FIRST

El orden obligatorio es:
1. Schema Zod.
2. Tipo inferido.
3. Regla de dominio.
4. Mapper de entrada.
5. Mapper de persistencia.
6. Modelo.
7. Servicio.
8. Controller.
9. Route.
10. Cliente API.
11. Query key.
12. Hook.
13. UI.
14. Prueba unitaria.
15. Prueba de integración.
16. E2E.
17. Documentación.
No se debe iniciar por la UI cuando el contrato no existe.
No se debe pasar un DTO directo a Mongoose sin revisar normalización.
No se deben duplicar enums.
No se deben usar magic strings.

## 19. ARQUITECTURA FRONTEND

Next.js App Router.
Pages y layouts son Server Components por defecto.
Client Components se limitan a interacción.
TanStack Query gestiona server state interactivo.
Zustand gestiona UI o sesión en memoria según diseño vigente.
React Hook Form usa schemas compartidos.
Los módulos siguen Feature-Sliced Design.
Cada página crítica implementa loading, error, empty, offline, forbidden y success.
No se usa fetch directo en componentes.
Las query keys se centralizan.
Los formularios tienen defaults estables.
La lógica de negocio no vive en UI.
La navegación se deriva de rutas y permisos centralizados.
La interfaz usa español.
El código interno usa inglés.

## 20. ARQUITECTURA BACKEND

Express 5.
Orden de ruta:
```text
authenticate
→ authorize
→ validate
→ controller
→ service
→ domain
→ persistence
```
Controllers delgados.
Services sin Request o Response.
Errores tipados.
Middleware global de errores.
API envelope consistente.
Request ID.
Logs estructurados.
Adapters externos.
No silent catch.
No swallowed errors.
Configuración validada al iniciar.
Uploads protegidos.
Auditoría para acciones críticas.

## 21. ARQUITECTURA DE DATOS

MongoDB y Mongoose.
Diseño documental según patrones de acceso.
Referencias para entidades de alto crecimiento o reutilización.
Embebidos para snapshots pequeños y estables.
Índices por estado, cliente, fecha, relación y códigos.
Índices únicos para referencias idempotentes.
Soft delete en documentos y evidencias.
Retención para cierres.
Casos pagados, archivados o cancelados con inmutabilidad definida.
No se deben mover registros a histórico sin estrategia validada.
La base histórica no sustituye backups.
La migración debe avanzar sin borrar datos.

## 22. MODELO DE ENTIDADES

Entidades principales:
- User.
- Role.
- Permission.
- Client.
- ServiceSite.
- Contact.
- WorkRequest.
- SiteVisit.
- Proposal.
- PurchaseOrder.
- ServiceCase.
- WorkOrder.
- PlanningPacket.
- KitTemplate.
- Resource.
- Tool.
- Equipment.
- Vehicle.
- Asset.
- ExecutionSession.
- ChecklistResponse.
- Evidence.
- FileAsset.
- TechnicalReport.
- DeliveryRecord.
- ClientAcceptance.
- ServiceEntrySheet.
- Invoice.
- PaymentRecord.
- CostLine.
- Notification.
- AuditEvent.
- DynamicFormTemplate.
- DynamicFormResponse.
- SyncOperation.
- HistoricalExport.
- BackupRun.
Las relaciones deben documentarse.
Las cardinalidades deben estar probadas.
Los nombres canónicos deben ser consistentes.

## 23. API

Base REST bajo `/api`.
Versionado cuando exista ruptura.
Envelopes:
```json
{
  "success": true,
  "data": {}
}
```
Errores:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje comprensible",
    "details": []
  },
  "requestId": "..."
}
```
Paginación consistente.
Filtros validados.
Ordenación allowlist.
No exponer stack.
No exponer ObjectIds como único label.
OpenAPI debe reflejar contratos.
Los endpoints legacy se deprecian antes de retirar.

## 24. SEGURIDAD Y CUMPLIMIENTO

Aplicar protección de datos personales.
Aplicar seguridad y salud en el trabajo.
Aplicar confidencialidad.
Aplicar licencias de software.
Aplicar facturación electrónica según integración.
Aplicar ética de métricas.
Aplicar minimización.
Aplicar separación de funciones.
Aplicar principio de mínimo privilegio.
Aplicar defensa en profundidad.
Aplicar revisión de archivos.
Aplicar rate limiting.
Aplicar CORS estricto.
Aplicar Helmet.
Aplicar TLS en producción.
No guardar secretos en repositorio.
No registrar cookies o tokens.
No usar datos productivos en pruebas.
Los documentos operativos se clasifican.
Las fotografías se revisan por sensibilidad.
Las firmas tienen controles de integridad.
Los eventos de auditoría son forenses.

## 25. OFFLINE-FIRST

Aplica a:
- Ejecución.
- Evidencias.
- Checklists.
- Materiales.
- Horas.
- Notas.
- Firmas cuando el riesgo lo permita.
La cola debe tener:
- operationId.
- clientMutationId.
- idempotencyKey.
- entityType.
- entityId.
- payloadVersion.
- dependencies.
- createdAt.
- retryCount.
- nextRetryAt.
- status.
- errorCode.
- conflictData.
Estados:
```text
pending
syncing
synced
failed
conflict
dead_letter
```
No marcar synced sin confirmación.
No reintentar errores 4xx de validación.
No sobrescribir conflictos silenciosamente.
Mantener centro `/offline-sync`.
Registrar blobs.
No almacenar secretos.
Probar reinicio, pérdida de red y reconexión.

## 26. DOCUMENTOS Y EVIDENCIAS

FileAsset separa metadata de storage.
Evidence aporta contexto de negocio.
Template define estructura.
GeneratedDocument representa una versión.
Signature representa aceptación.
Debe existir hash.
Debe existir MIME validado.
Debe existir tamaño.
Debe existir actor.
Debe existir timestamps.
Debe existir relación con paso.
Debe existir lifecycle status.
Debe existir acceso autorizado.
Los documentos críticos no se eliminan físicamente.
La generación debe ser reproducible.
Los formatos heredados se modelan como templates versionados.
La extracción automática requiere revisión.

## 27. MOTOR DE COSTOS

Fuentes:
- Proposal.
- Planning.
- Execution.
- Inventory.
- Labor.
- Transport.
- Subcontracts.
- Taxes.
- Invoice.
- Payment.
Estados de dato:
- available.
- partial.
- not_available.
No usar null como significado.
Fórmulas centralizadas.
Moneda explícita.
Periodo explícito.
Impuestos configurables.
Variaciones explicables.
No reportar rentabilidad sin datos completos.
Probar redondeo.
Probar conciliación.
Probar casos sin datos.

## 28. DASHBOARD Y KPIS

Cada KPI debe incluir:
- Nombre.
- Definición.
- Fórmula.
- Fuente.
- Periodo.
- Timezone.
- Población.
- Estado de disponibilidad.
- Limitaciones.
- Link de detalle.
KPIs candidatos:
- Casos por etapa.
- Tiempo por etapa.
- Blockers.
- Cumplimiento de planeación.
- Evidencias pendientes.
- SES pendientes.
- Facturas pendientes.
- Pagos vencidos.
- Desviación de costos.
- Disponibilidad de flota.
No declarar mejoras sin baseline.
No mostrar cero cuando no hay dato.

## 29. OBSERVABILIDAD

Logs JSON.
Niveles.
Redacción.
Request ID.
Correlation ID.
Duración.
Actor.
Entidad.
Acción.
Resultado.
Health live.
Health ready.
Métricas técnicas.
Métricas de negocio.
Alertas.
Runbooks.
No usar console.log en producción.
No registrar secretos.
Los errores deben ser accionables.

## 30. PERFORMANCE

Frontend:
- Control de bundle.
- Lazy load de módulos pesados.
- Imágenes optimizadas.
- Listas paginadas.
- Virtualización solo con volumen.
- Providers mínimos.
Backend:
- Índices.
- Paginación.
- Proyecciones.
- Lean reads.
- Evitar N+1.
- Colas para PDF y exports.
- Streaming para archivos.
Base:
- Explain en queries críticas.
- Índices medidos.
- Retención.
No optimizar sin medir.
Registrar presupuesto de performance.

## 31. UX Y ACCESIBILIDAD

Mobile-first.
Touch target 44 px.
Sin overflow.
Formularios de campo.
Estados completos.
Mensajes en español.
No mostrar IDs.
No depender del color.
Labels.
Focus visible.
Teclado.
Modales con focus trap.
Reduced motion.
Contraste.
Tablas responsive.
Drawer móvil.
Errores junto al campo.
Confirmación para acciones críticas.
No usar dark patterns.

## 32. ESTRATEGIA DE PRUEBAS

Pirámide:
- Unitarias de schemas.
- Unitarias de dominio.
- Unitarias de services.
- Integración de rutas.
- Frontend por comportamiento.
- E2E críticos.
- Aceptación por rol.
Cada bug debe producir prueba.
Cada refactor crítico requiere prueba previa.
No snapshots gigantes.
No skip.
No timeout aumentado para ocultar bloqueo.
No servicios externos reales en unit tests.
MongoDB de prueba aislada para integración.
Playwright por rol.
Trazas para diagnóstico.
Pruebas de seguridad negativas.
Pruebas offline.
Pruebas de archivos.

## 33. QUALITY GATES

Orden:
```bash
npm run typecheck
npm run lint
npm run build
npm run verify
```
Adicionales:
```bash
npm run contracts:check
npm run quality:strict
npm run verify:strict
npm run test:e2e
```
No modificar scripts para pasar.
No ignorar warnings.
No reducir cobertura.
No excluir archivos.
No eliminar tests.
No declarar éxito con verify fallido.
Cada workspace debe pasar aislado.

## 34. DESPLIEGUE

Destino VPS.
No reemplazar por Vercel.
Mantener scripts y Docker si existen.
Variables de entorno validadas.
Secrets fuera del repositorio.
HTTPS.
Reverse proxy.
Health checks.
Graceful shutdown.
Backups.
Rollback operativo documentado.
Migraciones forward-only.
Monitoreo.
No desplegar automáticamente sin autorización.
No modificar producción durante depuración local.

## 35. DOCUMENTACIÓN

Docs as code.
Actualizar:
- Rutas.
- Contratos.
- Módulos.
- Roles.
- Flujos.
- Offline.
- Variables.
- Despliegue.
- Runbooks.
- ADRs.
- OpenAPI.
- Matriz de trazabilidad.
- Changelog técnico.
No modificar documentos fuente para ocultar contradicciones.
Crear anexos o ADRs.

# PARTE II — GOBIERNO DE AGENTES Y SUBAGENTES

## 36. PRINCIPIO DE ORQUESTACIÓN

El trabajo se coordina mediante un agente principal.
El agente principal mantiene contexto de producto, dependencias y riesgos.
Los subagentes reciben alcance acotado.
Un subagente no decide cambios globales sin handoff.
No se editan los mismos archivos simultáneamente.
Toda tarea tiene propietario.
Toda tarea tiene entrada, salida, pruebas y definición de terminado.
El coordinador verifica integración.
Los subagentes no marcan una fase global como terminada.
El agente principal no delega responsabilidad de verificación.
La paralelización se usa solo entre tareas sin dependencia de archivos o contratos.

## 37. AGENTE COORDINADOR

Responsabilidades:
- Leer PRD.
- Leer documentación.
- Mantener backlog.
- Resolver dependencias.
- Asignar subagentes.
- Evitar colisiones.
- Revisar handoffs.
- Ejecutar gates globales.
- Mantener registro.
- Comunicar progreso.
- Decidir cuándo parar por bloqueo externo.
No debe:
- Implementar cambios masivos sin descomponer.
- Aceptar reportes sin evidencia.
- Permitir que dos agentes editen el mismo contrato.
- Pedir al usuario decisiones rutinarias.
- Declarar éxito sin gates.

## 38. SUBAGENTE DE PRODUCTO Y DOMINIO

Responsabilidades:
- Traducir documentos en requisitos.
- Mantener flujo de catorce pasos.
- Definir estados y precondiciones.
- Validar terminología.
- Evitar claims no medidos.
- Revisar impacto empresarial.
Entregables:
- Requisitos.
- Acceptance criteria.
- Matriz de trazabilidad.
- Decisiones de dominio.
No edita UI sin coordinación.

## 39. SUBAGENTE DE ARQUITECTURA

Responsabilidades:
- Revisar límites de módulos.
- Revisar dependencias.
- Proponer ADR.
- Validar Contract-First.
- Evitar duplicación.
- Definir estrategia de migración.
Entregables:
- Diagrama lógico.
- ADR.
- Lista de impactos.
- Riesgos.
No introduce tecnología sin justificación.

## 40. SUBAGENTE DE CONTRATOS

Responsabilidades:
- Schemas Zod.
- Tipos inferidos.
- Enums.
- Errores.
- DTOs.
- Exports.
- Contract tests.
Debe coordinar con domain, backend y frontend.
Tiene propiedad exclusiva de `shared-types` durante la tarea.
No implementa modelos Mongoose como contratos.

## 41. SUBAGENTE DE DOMINIO

Responsabilidades:
- Reglas puras.
- FSM.
- Readiness.
- Blockers.
- RBAC helpers.
- Cálculos.
- Idempotencia conceptual.
No depende de frameworks.
Entrega pruebas exhaustivas.
No usa I/O.

## 42. SUBAGENTE BACKEND

Responsabilidades:
- Routes.
- Controllers.
- Services.
- Persistence.
- Adapters.
- Security.
- Audit.
- Tests.
Consulta contratos.
No altera schemas sin handoff.
No duplica reglas en controller.
No usa Request en service.

## 43. SUBAGENTE FRONTEND

Responsabilidades:
- App Router.
- Pages.
- Components.
- Hooks.
- Query keys.
- Forms.
- Responsive.
- Accessibility.
- Tests.
Consulta contratos.
No implementa reglas empresariales complejas.
No crea fetch directo.
No convierte toda la página en Client Component.

## 44. SUBAGENTE OFFLINE

Responsabilidades:
- Service Worker.
- IndexedDB.
- Queue.
- Idempotencia.
- Blobs.
- Conflictos.
- DLQ.
- UI de sincronización.
Debe coordinar con contratos y backend.
No simula confirmación.
Entrega pruebas de reconexión.

## 45. SUBAGENTE DOCUMENTAL

Responsabilidades:
- FileAsset.
- Evidence.
- Templates.
- PDF.
- Signatures.
- Exports.
- Retención.
- Seguridad de archivos.
Debe modelar formatos operativos.
No publica OCR sin revisión.
No elimina documentos críticos.

## 46. SUBAGENTE QA

Responsabilidades:
- Estrategia de pruebas.
- Reproducción de bugs.
- Unit.
- Integration.
- E2E.
- Fixtures.
- Flaky tests.
- Traces.
No modifica producción solo para adaptar una prueba inválida.
No aumenta timeout como primera solución.
No elimina pruebas.

## 47. SUBAGENTE DE SEGURIDAD

Responsabilidades:
- Threat model.
- Auth.
- RBAC.
- IDOR.
- Uploads.
- Secrets.
- CORS.
- Rate limits.
- Audit.
- Dependency review.
Puede usar skills de seguridad instaladas.
No realiza explotación destructiva.
Entrega findings, severidad, evidencia y corrección.

## 48. SUBAGENTE UX Y ACCESIBILIDAD

Responsabilidades:
- Flujos.
- Jerarquía.
- Responsive.
- Estados.
- Lenguaje.
- Accesibilidad.
- Diseño de campo.
No crea otro design system.
No elimina información esencial por estética.
Entrega pruebas visuales.

## 49. SUBAGENTE PERFORMANCE

Responsabilidades:
- Medir.
- Identificar cuellos.
- Optimizar queries.
- Optimizar bundles.
- Optimizar imágenes.
- Documentar antes y después.
No optimiza sin baseline.
No introduce caching inconsistente.

## 50. SUBAGENTE OBSERVABILIDAD

Responsabilidades:
- Logs.
- Request ID.
- Metrics.
- Health.
- Alerts.
- Runbooks.
- Dashboards técnicos.
No registra secretos.
No crea métricas sin definición.

## 51. SUBAGENTE DEVOPS VPS

Responsabilidades:
- Build.
- Docker.
- Reverse proxy.
- Env.
- Health.
- Backups.
- Deploy docs.
- CI.
No despliega sin autorización.
No usa Vercel como sustituto.
No borra datos.
No ejecuta Git en modo autónomo.

## 52. SUBAGENTE DOCUMENTACIÓN

Responsabilidades:
- ADR.
- OpenAPI.
- Runbooks.
- Matrices.
- Changelog.
- Manuales.
No altera evidencia fuente.
Distingue actual de propuesto.
No inventa métricas.

## 53. SUBAGENTE DE INNOVACIÓN

Responsabilidades:
- Identificar oportunidad.
- Formular hipótesis.
- Definir métrica.
- Diseñar experimento.
- Definir fallback.
- Evaluar privacidad y riesgo.
No implementa antes de estabilización.
No presenta IA como autoridad.
No crea feature sin problema.

## 54. CONTRATO DE TAREA PARA SUBAGENTES

Cada asignación contiene:
```text
Task ID
Owner
Goal
Scope
Out of scope
Files allowed
Files read-only
Contracts involved
Dependencies
Skills required
Tools allowed
Inputs
Expected output
Tests
Gate
Risks
Handoff recipient
```
Sin contrato no se delega.
Los archivos permitidos se enumeran.
Los contratos compartidos requieren propiedad exclusiva.
Los subagentes reportan exactamente lo modificado.
No se aceptan mensajes vagos.

## 55. HANDOFF ENTRE AGENTES

Cada handoff incluye:
```text
Summary
Decisions
Files changed
Contracts changed
Tests
Commands
Results
Remaining risks
Migration notes
Next owner
```
El receptor revisa.
El coordinador integra.
No se transfiere una tarea con tests fallidos salvo bloqueo documentado.
No se omiten efectos secundarios.

## 56. CONCURRENCIA

Permitida:
- Frontend de un módulo y documentación no compartida.
- Pruebas E2E de otro módulo estable.
- Auditoría de performance de una ruta distinta.
No permitida:
- Dos agentes editando el mismo schema.
- Dos agentes editando el mismo model.
- Dos agentes modificando navegación central.
- Refactor backend y migración de contrato sin coordinación.
- Formateo global concurrente.
El coordinador mantiene locks lógicos.

## 57. MEMORIA Y CONTEXTO

El agente principal mantiene:
- Decisiones.
- Contradicciones.
- Requisitos.
- Gates.
- Riesgos.
- Estado de archivos.
- Handoffs.
Los subagentes leen solo contexto relevante más PRD.
No se copian secretos.
No se comparte código innecesario con servicios externos.
Los resúmenes deben conservar nombres canónicos.

## 58. POLÍTICA DE PREGUNTAS

No preguntar:
- Qué fase sigue.
- Si debe continuar.
- Si debe corregir tests.
- Si debe usar contratos.
- Si debe preservar archivos.
Preguntar solo cuando:
- Falta una decisión empresarial no inferible.
- Se requiere credencial.
- Se requiere autorización de despliegue.
- Se requiere autorización legal para datos.
- Existe conflicto irreversible.
Mientras tanto, aplicar mejor criterio documentado.

## 59. POLÍTICA DE ACTUALIZACIONES

El coordinador informa:
```text
Phase
Task
Owner
Root cause
Files
Tests
Gate
Risks
Next
```
Las actualizaciones no son solicitudes de permiso.
No se repite el plan completo.
Se muestra evidencia temprana.

## 60. SKILLS

Los agentes deben descubrir skills instaladas.
Deben leer la skill antes de usar la herramienta asociada cuando sea obligatorio.
Skills relevantes cuando estén disponibles:
- Context7 para documentación actual.
- Next.js para App Router.
- React best practices.
- Shadcn para componentes existentes.
- Agent browser.
- Browser verify.
- Verification end-to-end.
- Security scan.
- Threat model.
- Finding validation.
- Fix finding.
- GitHub read-only.
- Documentation tools.
- Observability.
No se usa una skill por decoración.
Se registra qué decisión soportó.
No se usa una skill de despliegue Vercel para reemplazar VPS.

## 61. CONTEXT7

Antes de modificar APIs de librerías:
1. Leer versión instalada.
2. Resolver library ID.
3. Consultar docs de esa versión.
4. Registrar consulta.
5. Implementar.
6. Probar.
Librerías prioritarias:
- Next.js.
- React.
- Express.
- Mongoose.
- Zod.
- TanStack Query.
- Zustand.
- Dexie.
- Serwist.
- Vitest.
- Playwright.
- pdf-lib.
- Sharp.
No enviar secretos.
No enviar código propietario completo.
No usar documentación genérica cuando hay versión exacta.

## 62. HERRAMIENTAS

Permitidas:
- Búsqueda de archivos.
- Lectura de archivos.
- Bash no destructivo.
- Context7.
- Browser.
- Playwright.
- Test runners.
- Linters.
- Typecheck.
- Build.
- Análisis estático.
- Security scans seguras.
- GitHub read-only cuando sea necesario.
No permitidas sin aprobación:
- Deploy.
- Push.
- Escritura remota.
- Migración productiva.
- Borrado.
- Rotación de secretos.
- Acciones sobre datos reales.

## 63. POLÍTICA GIT

Durante ejecución autónoma:
- Cero comandos Git.
- No status.
- No diff.
- No log.
- No reset.
- No restore.
- No clean.
- No stash.
- No checkout.
- No switch.
- No merge.
- No rebase.
- No commit.
- No push.
La preservación usa filesystem.
La publicación requiere flujo separado y autorización explícita.
No se permite que un subagente decida usar Git.

## 64. BASH Y PRESERVACIÓN

Usar Bash.
No PowerShell.
Crear:
```bash
SESSION_STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_ROOT=".sisyphus/safe-backups/$SESSION_STAMP"
PROGRESS_FILE=".sisyphus/progress/prd-execution-$SESSION_STAMP.md"
mkdir -p "$BACKUP_ROOT"
mkdir -p "$(dirname "$PROGRESS_FILE")"
```
Respaldar archivo antes de editar:
```bash
backup_file() {
  local file="$1"
  if [ -f "$file" ]; then
    local target="$BACKUP_ROOT/$file"
    mkdir -p "$(dirname "$target")"
    cp -p "$file" "$target"
    sha256sum "$file" >> "$BACKUP_ROOT/original-sha256.txt"
  fi
}
```
No usar rm.
No usar truncate.
No usar find -delete.
No sobrescribir backups.
Registrar checksum posterior.
Crear diff con `diff -u`.
No restaurar ciegamente.

## 65. CICLO DE TRABAJO

1. Leer PRD.
2. Leer fuente.
3. Inspeccionar código.
4. Reproducir problema.
5. Crear tarea.
6. Asignar owner.
7. Consultar skill.
8. Respaldar.
9. Crear prueba.
10. Implementar.
11. Ejecutar prueba.
12. Ejecutar gate.
13. Documentar.
14. Handoff.
15. Integrar.
16. Ejecutar gate global.
No saltar pasos críticos.
No editar veinte archivos antes de probar.

## 66. DEBUGGING

Clasificar:
- Formatting.
- Contract.
- Type.
- Domain.
- Persistence.
- Backend.
- Frontend.
- Integration.
- Async.
- Test.
- Build.
- Config.
- Security.
- Offline.
- Performance.
Corregir causa primaria.
Buscar definiciones y consumidores.
No aumentar timeout primero.
No eliminar exec de producción para satisfacer un mock.
No convertir null en cero sin semántica.
No usar casts.
Crear regresión test.

## 67. REFACTOR

Antes:
- Test.
- Mapa de consumidores.
- Backup.
- Alcance.
Durante:
- Cambios pequeños.
- Compatibilidad.
- Sin cambio funcional accidental.
Después:
- Tests.
- Typecheck.
- Lint.
- Build.
- E2E.
No refactor masivo.
No mover archivos sin actualizar imports y docs.
No borrar implementación previa durante migración no verificada.

## 68. INNOVACIÓN

Requisitos:
- Problema.
- Usuario.
- Hipótesis.
- Valor.
- Riesgo.
- Métrica.
- Datos.
- Fallback.
- Privacidad.
- Experimento.
- Gate de salida.
Prioridades:
- Kits.
- Plantillas.
- Offline.
- Alertas.
- Portal.
- Históricos.
- Analítica.
- Recomendaciones.
- AI supervisada.
No innovar sobre gates rojos.
No crear feature por moda.
No automatizar aprobación crítica.

## 69. MIGRACIONES

Forward-only.
Backups.
Dry run.
Versionado.
Compatibilidad.
Normalizadores legacy.
Pruebas.
Observabilidad.
Rollback operativo sin Git.
No borrar registros.
No cambiar enum sin migración.
No ejecutar en producción sin aprobación.

## 70. DEFINITION OF READY

Una tarea está lista cuando:
- Tiene problema.
- Tiene fuente.
- Tiene owner.
- Tiene alcance.
- Tiene contrato.
- Tiene criterio.
- Tiene dependencia.
- Tiene prueba prevista.
- Tiene archivos.
- Tiene riesgo.
- No depende de decisión abierta crítica.

## 71. DEFINITION OF DONE

Una tarea termina cuando:
- Código implementado.
- Contratos alineados.
- Tests pasan.
- Typecheck pasa.
- Lint pasa.
- No warnings.
- Build pasa.
- Seguridad revisada.
- Accesibilidad revisada.
- Docs actualizadas.
- Backup registrado.
- Handoff aceptado.
- Sin deuda oculta.
## 72. ROADMAP
### P00 — Preservación, lectura y baseline
- Objetivo: Preparar entorno, respaldos, documentación, inventario y gates.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0001 — P00.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0002 — P00.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0003 — P00.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0004 — P00.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0005 — P00.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0006 — P00.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0007 — P00.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0008 — P00.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P01 — Contratos y dominio
- Objetivo: Consolidar schemas, tipos, errores, roles, FSM y reglas.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0009 — P01.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0010 — P01.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0011 — P01.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0012 — P01.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0013 — P01.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0014 — P01.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0015 — P01.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0016 — P01.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P02 — Estabilización de pruebas
- Objetivo: Corregir mocks, async leaks, imports y regresiones.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0017 — P02.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0018 — P02.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0019 — P02.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0020 — P02.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0021 — P02.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0022 — P02.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0023 — P02.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0024 — P02.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P03 — Autenticación y seguridad
- Objetivo: Estabilizar sesiones, WebAuthn, RBAC, IDOR y auditoría.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0025 — P03.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0026 — P03.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0027 — P03.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0028 — P03.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0029 — P03.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0030 — P03.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0031 — P03.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0032 — P03.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P04 — Clientes y solicitudes
- Objetivo: Completar maestros, WorkRequest y SiteVisit.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0033 — P04.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0034 — P04.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0035 — P04.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0036 — P04.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0037 — P04.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0038 — P04.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0039 — P04.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0040 — P04.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P05 — Propuesta y PO
- Objetivo: Completar costeo, PDF, aprobación y conversión.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0041 — P05.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0042 — P05.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0043 — P05.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0044 — P05.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0045 — P05.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0046 — P05.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0047 — P05.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0048 — P05.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P06 — ServiceCase y cockpit
- Objetivo: Consolidar proyección, artifacts, blockers y next actions.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0049 — P06.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0050 — P06.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0051 — P06.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0052 — P06.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0053 — P06.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0054 — P06.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0055 — P06.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0056 — P06.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P07 — Planeación y kits
- Objetivo: Completar recursos, seguridad, certificaciones y readiness.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0057 — P07.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0058 — P07.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0059 — P07.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0060 — P07.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0061 — P07.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0062 — P07.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0063 — P07.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0064 — P07.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P08 — Ejecución offline
- Objetivo: Completar sesiones, checklists, queue, blobs y conflictos.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0065 — P08.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0066 — P08.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0067 — P08.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0068 — P08.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0069 — P08.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0070 — P08.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0071 — P08.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0072 — P08.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P09 — Evidencias y documentos
- Objetivo: Completar ciclo de evidencia, informes, templates y firmas.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0073 — P09.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0074 — P09.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0075 — P09.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0076 — P09.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0077 — P09.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0078 — P09.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0079 — P09.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0080 — P09.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P10 — Cierre administrativo
- Objetivo: Completar acta, SES, factura, pago y cierre.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0081 — P10.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0082 — P10.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0083 — P10.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0084 — P10.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0085 — P10.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0086 — P10.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0087 — P10.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0088 — P10.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P11 — Costos
- Objetivo: Completar motor transversal y dashboards.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0089 — P11.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0090 — P11.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0091 — P11.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0092 — P11.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0093 — P11.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0094 — P11.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0095 — P11.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0096 — P11.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P12 — Recursos y activos
- Objetivo: Integrar inventario, herramientas, flota, activos y mantenimiento.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0097 — P12.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0098 — P12.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0099 — P12.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0100 — P12.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0101 — P12.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0102 — P12.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0103 — P12.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0104 — P12.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P13 — Portal y notificaciones
- Objetivo: Completar autoservicio, eventos y preferencias.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0105 — P13.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0106 — P13.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0107 — P13.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0108 — P13.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0109 — P13.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0110 — P13.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0111 — P13.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0112 — P13.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P14 — Históricos y backups
- Objetivo: Completar retención, exports, restore y auditoría.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0113 — P14.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0114 — P14.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0115 — P14.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0116 — P14.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0117 — P14.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0118 — P14.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0119 — P14.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0120 — P14.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P15 — UX, accesibilidad y performance
- Objetivo: Madurar experiencia y rendimiento.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0121 — P15.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0122 — P15.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0123 — P15.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0124 — P15.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0125 — P15.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0126 — P15.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0127 — P15.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0128 — P15.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P16 — Seguridad y observabilidad
- Objetivo: Hardening, logs, métricas, health y runbooks.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0129 — P16.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0130 — P16.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0131 — P16.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0132 — P16.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0133 — P16.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0134 — P16.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0135 — P16.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0136 — P16.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P17 — Innovación
- Objetivo: Plantillas dinámicas, adapters, AI supervisada y analítica.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0137 — P17.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0138 — P17.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0139 — P17.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0140 — P17.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0141 — P17.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0142 — P17.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0143 — P17.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0144 — P17.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.

### P18 — Piloto
- Objetivo: Validar con roles, órdenes y datos reales.
- Entrada: fase anterior verificada o dependencia explícita resuelta.
- Salida: corte vertical funcional, pruebas, documentación y evidencia.
- Gate mínimo: typecheck, lint, tests del alcance y build afectado.
- Owner: asignado por el agente coordinador.
- No se permite cerrar con warnings nuevos.

- [ ] TASK-0145 — P18.1: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0146 — P18.2: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0147 — P18.3: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0148 — P18.4: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0149 — P18.5: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0150 — P18.6: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0151 — P18.7: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.
- [ ] TASK-0152 — P18.8: ejecutar una unidad atómica del objetivo, con backup, prueba, implementación, gate y handoff.


## 73. MATRIZ DE TRAZABILIDAD

Cada requisito debe mapear:
```text
Source
Problem
Requirement
Entity
Contract
Domain rule
Backend endpoint
Frontend route
Role
Audit event
Test
Evidence
Status
```
No se acepta requisito sin prueba prevista.
No se acepta endpoint sin rol.
No se acepta transición sin evento.
No se acepta UI sin estado de error.
No se acepta KPI sin fórmula.
No se acepta documento sin versión.
No se acepta integración sin fallback.

## 74. MÉTRICAS DE PRODUCTO

Métricas de adopción:
- Usuarios activos por rol.
- Órdenes creadas.
- Órdenes con flujo completo.
- Uso offline.
- Kits aplicados.
Métricas de proceso:
- Tiempo por etapa.
- Blockers.
- Reaperturas.
- Documentos faltantes.
- Reintentos de sincronización.
Métricas de calidad:
- Errores.
- Tests.
- Build.
- Uptime.
- Latencia.
Métricas de resultado:
- Solo después de piloto.
- No afirmar ahorro o reducción sin baseline.
- Documentar método.

## 75. PILOTO

Seleccionar subconjunto de servicios.
Seleccionar usuarios representativos.
Empezar por planeación y evidencias.
Definir datos mínimos.
Capacitar.
Observar.
Registrar incidencias.
No desplegar todo de una vez.
Medir sin interferir.
Recoger aceptación cualitativa.
Ajustar.
Ampliar gradualmente.

## 76. RIESGOS

- Datos maestros incompletos.
- Resistencia al cambio.
- Conectividad.
- Dispositivos.
- Documentos sensibles.
- Integraciones externas.
- Duplicación de reglas.
- Deuda técnica.
- Métricas sin baseline.
- Archivos grandes.
- Backups no probados.
- Roles mal configurados.
- Flujos informales.
- Dependencia de una persona.
- Scope creep.
Cada riesgo tiene owner, probabilidad, impacto y mitigación.

## 77. SUPUESTOS

- El repositorio actual contiene una base avanzada.
- El stack se conserva.
- El despliegue es VPS.
- Los documentos requieren aprobación para digitalización final.
- Los roles pueden configurarse.
- La operación offline se prioriza en campo.
- Las integraciones externas pueden no estar disponibles.
- Los indicadores se validan en piloto.
Los supuestos deben verificarse.
Cuando fallen, actualizar PRD y ADR.

## 78. DEPENDENCIAS

- MongoDB.
- Almacenamiento de archivos.
- Correo o canal de notificación.
- Infraestructura VPS.
- Certificados TLS.
- Datos de clientes.
- Catálogos.
- Roles.
- Plantillas.
- Acceso a Ariba o DIAN para integraciones reales.
- Dispositivos móviles.
- Autorización de datos y fotografías.

## 79. CRITERIOS DE LANZAMIENTO

- Flujo piloto definido.
- Usuarios creados.
- Roles verificados.
- Backups verificados.
- Health listo.
- Logs listos.
- Errores críticos cero.
- Typecheck verde.
- Lint verde.
- Build verde.
- Verify verde.
- E2E crítico verde.
- Manual disponible.
- Runbook disponible.
- Plan de soporte.
- Consentimientos.
- Seguridad revisada.

## 80. CRITERIOS DE NO LANZAMIENTO

- Pérdida de datos.
- Sync no confiable.
- RBAC roto.
- IDOR.
- Factura sin regla.
- Pago duplicable.
- Evidencia sin contexto.
- Backups sin restore.
- Errors swallowed.
- Tests críticos fallidos.
- Secrets en logs.
- Documentos sensibles expuestos.
- Flujo de cierre incompleto presentado como completo.

## 81. REPORTE DE EJECUCIÓN

Formato:
```text
Phase
Task
Owner
Status
Source
Files
Backup
Decision
Implementation
Tests
Commands
Result
Risk
Debt
Handoff
```
Estados:
- pending.
- ready.
- in_progress.
- review.
- verified.
- blocked_external.
- rejected.
No usar done sin verified.

## 82. INSTRUCCIÓN PARA EL AGENTE PRINCIPAL

Lee el PRD completo.
Construye backlog.
No generes otro PRD.
No preguntes prioridades ya definidas.
No uses Git.
Usa Bash.
Preserva archivos.
Asigna subagentes.
Evita colisiones.
Consulta skills.
Consulta Context7.
Implementa por cortes verticales.
Ejecuta gates.
Documenta.
Continúa hasta alcanzar el objetivo de la fase asignada.
## 83. CATÁLOGO GRANULAR DE CRITERIOS DE ACEPTACIÓN
- [ ] AC-00001 — ProductGovernance: tiene una fuente de verdad identificada.
- [ ] AC-00002 — ProductGovernance: tiene owner definido.
- [ ] AC-00003 — ProductGovernance: tiene alcance y fuera de alcance.
- [ ] AC-00004 — ProductGovernance: tiene contrato versionado.
- [ ] AC-00005 — ProductGovernance: tiene regla de dominio probada.
- [ ] AC-00006 — ProductGovernance: tiene autorización backend.
- [ ] AC-00007 — ProductGovernance: tiene auditoría.
- [ ] AC-00008 — ProductGovernance: tiene idempotencia cuando aplica.
- [ ] AC-00009 — ProductGovernance: tiene loading state.
- [ ] AC-00010 — ProductGovernance: tiene error state.
- [ ] AC-00011 — SourceTraceability: tiene empty state.
- [ ] AC-00012 — SourceTraceability: tiene offline state cuando aplica.
- [ ] AC-00013 — SourceTraceability: tiene forbidden state.
- [ ] AC-00014 — SourceTraceability: tiene mensajes en español.
- [ ] AC-00015 — SourceTraceability: no muestra ObjectIds.
- [ ] AC-00016 — SourceTraceability: no introduce any.
- [ ] AC-00017 — SourceTraceability: no introduce casts inseguros.
- [ ] AC-00018 — SourceTraceability: no usa null como estado de negocio.
- [ ] AC-00019 — SourceTraceability: no duplica enums.
- [ ] AC-00020 — SourceTraceability: no duplica query keys.
- [ ] AC-00021 — SourceTraceability: tiene prueba unitaria.
- [ ] AC-00022 — AgentCoordinator: tiene prueba de integración.
- [ ] AC-00023 — AgentCoordinator: tiene prueba negativa.
- [ ] AC-00024 — AgentCoordinator: tiene prueba E2E crítica.
- [ ] AC-00025 — AgentCoordinator: tiene documentación actualizada.
- [ ] AC-00026 — AgentCoordinator: tiene backup del archivo modificado.
- [ ] AC-00027 — AgentCoordinator: pasa typecheck.
- [ ] AC-00028 — AgentCoordinator: pasa lint sin warnings.
- [ ] AC-00029 — AgentCoordinator: pasa build.
- [ ] AC-00030 — AgentCoordinator: pasa verify.
- [ ] AC-00031 — AgentCoordinator: respeta mobile-first.
- [ ] AC-00032 — AgentCoordinator: respeta accesibilidad.
- [ ] AC-00033 — AgentHandoff: respeta privacidad.
- [ ] AC-00034 — AgentHandoff: respeta performance budget.
- [ ] AC-00035 — AgentHandoff: registra métricas verificables.
- [ ] AC-00036 — AgentHandoff: tiene fallback.
- [ ] AC-00037 — AgentHandoff: tiene estrategia de migración.
- [ ] AC-00038 — AgentHandoff: conserva compatibilidad.
- [ ] AC-00039 — AgentHandoff: no borra datos.
- [ ] AC-00040 — AgentHandoff: no ejecuta Git.
- [ ] AC-00041 — SharedTypes: tiene una fuente de verdad identificada.
- [ ] AC-00042 — SharedTypes: tiene owner definido.
- [ ] AC-00043 — SharedTypes: tiene alcance y fuera de alcance.
- [ ] AC-00044 — DomainFSM: tiene contrato versionado.
- [ ] AC-00045 — DomainFSM: tiene regla de dominio probada.
- [ ] AC-00046 — DomainFSM: tiene autorización backend.
- [ ] AC-00047 — DomainFSM: tiene auditoría.
- [ ] AC-00048 — DomainFSM: tiene idempotencia cuando aplica.
- [ ] AC-00049 — DomainFSM: tiene loading state.
- [ ] AC-00050 — DomainFSM: tiene error state.
- [ ] AC-00051 — DomainFSM: tiene empty state.
- [ ] AC-00052 — DomainFSM: tiene offline state cuando aplica.
- [ ] AC-00053 — DomainFSM: tiene forbidden state.
- [ ] AC-00054 — DomainFSM: tiene mensajes en español.
- [ ] AC-00055 — Config: no muestra ObjectIds.
- [ ] AC-00056 — Config: no introduce any.
- [ ] AC-00057 — Config: no introduce casts inseguros.
- [ ] AC-00058 — Config: no usa null como estado de negocio.
- [ ] AC-00059 — Config: no duplica enums.
- [ ] AC-00060 — Config: no duplica query keys.
- [ ] AC-00061 — Config: tiene prueba unitaria.
- [ ] AC-00062 — Config: tiene prueba de integración.
- [ ] AC-00063 — Config: tiene prueba negativa.
- [ ] AC-00064 — Config: tiene prueba E2E crítica.
- [ ] AC-00065 — Config: tiene documentación actualizada.
- [ ] AC-00066 — Auth: tiene backup del archivo modificado.
- [ ] AC-00067 — Auth: pasa typecheck.
- [ ] AC-00068 — Auth: pasa lint sin warnings.
- [ ] AC-00069 — Auth: pasa build.
- [ ] AC-00070 — Auth: pasa verify.
- [ ] AC-00071 — Auth: respeta mobile-first.
- [ ] AC-00072 — Auth: respeta accesibilidad.
- [ ] AC-00073 — Auth: respeta privacidad.
- [ ] AC-00074 — Auth: respeta performance budget.
- [ ] AC-00075 — Auth: registra métricas verificables.
- [ ] AC-00076 — Auth: tiene fallback.
- [ ] AC-00077 — Session: tiene estrategia de migración.
- [ ] AC-00078 — Session: conserva compatibilidad.
- [ ] AC-00079 — Session: no borra datos.
- [ ] AC-00080 — Session: no ejecuta Git.
- [ ] AC-00081 — WebAuthn: tiene una fuente de verdad identificada.
- [ ] AC-00082 — WebAuthn: tiene owner definido.
- [ ] AC-00083 — WebAuthn: tiene alcance y fuera de alcance.
- [ ] AC-00084 — WebAuthn: tiene contrato versionado.
- [ ] AC-00085 — WebAuthn: tiene regla de dominio probada.
- [ ] AC-00086 — WebAuthn: tiene autorización backend.
- [ ] AC-00087 — WebAuthn: tiene auditoría.
- [ ] AC-00088 — RBAC: tiene idempotencia cuando aplica.
- [ ] AC-00089 — RBAC: tiene loading state.
- [ ] AC-00090 — RBAC: tiene error state.
- [ ] AC-00091 — RBAC: tiene empty state.
- [ ] AC-00092 — RBAC: tiene offline state cuando aplica.
- [ ] AC-00093 — RBAC: tiene forbidden state.
- [ ] AC-00094 — RBAC: tiene mensajes en español.
- [ ] AC-00095 — RBAC: no muestra ObjectIds.
- [ ] AC-00096 — RBAC: no introduce any.
- [ ] AC-00097 — RBAC: no introduce casts inseguros.
- [ ] AC-00098 — RBAC: no usa null como estado de negocio.
- [ ] AC-00099 — Clients: no duplica enums.
- [ ] AC-00100 — Clients: no duplica query keys.
- [ ] AC-00101 — Clients: tiene prueba unitaria.
- [ ] AC-00102 — Clients: tiene prueba de integración.
- [ ] AC-00103 — Clients: tiene prueba negativa.
- [ ] AC-00104 — Clients: tiene prueba E2E crítica.
- [ ] AC-00105 — Clients: tiene documentación actualizada.
- [ ] AC-00106 — Clients: tiene backup del archivo modificado.
- [ ] AC-00107 — Clients: pasa typecheck.
- [ ] AC-00108 — Clients: pasa lint sin warnings.
- [ ] AC-00109 — Clients: pasa build.
- [ ] AC-00110 — Sites: pasa verify.
- [ ] AC-00111 — Sites: respeta mobile-first.
- [ ] AC-00112 — Sites: respeta accesibilidad.
- [ ] AC-00113 — Sites: respeta privacidad.
- [ ] AC-00114 — Sites: respeta performance budget.
- [ ] AC-00115 — Sites: registra métricas verificables.
- [ ] AC-00116 — Sites: tiene fallback.
- [ ] AC-00117 — Sites: tiene estrategia de migración.
- [ ] AC-00118 — Sites: conserva compatibilidad.
- [ ] AC-00119 — Sites: no borra datos.
- [ ] AC-00120 — Sites: no ejecuta Git.
- [ ] AC-00121 — Contacts: tiene una fuente de verdad identificada.
- [ ] AC-00122 — Contacts: tiene owner definido.
- [ ] AC-00123 — Contacts: tiene alcance y fuera de alcance.
- [ ] AC-00124 — Contacts: tiene contrato versionado.
- [ ] AC-00125 — Contacts: tiene regla de dominio probada.
- [ ] AC-00126 — Contacts: tiene autorización backend.
- [ ] AC-00127 — Contacts: tiene auditoría.
- [ ] AC-00128 — Contacts: tiene idempotencia cuando aplica.
- [ ] AC-00129 — Contacts: tiene loading state.
- [ ] AC-00130 — Contacts: tiene error state.
- [ ] AC-00131 — Contacts: tiene empty state.
- [ ] AC-00132 — WorkRequests: tiene offline state cuando aplica.
- [ ] AC-00133 — WorkRequests: tiene forbidden state.
- [ ] AC-00134 — WorkRequests: tiene mensajes en español.
- [ ] AC-00135 — WorkRequests: no muestra ObjectIds.
- [ ] AC-00136 — WorkRequests: no introduce any.
- [ ] AC-00137 — WorkRequests: no introduce casts inseguros.
- [ ] AC-00138 — WorkRequests: no usa null como estado de negocio.
- [ ] AC-00139 — WorkRequests: no duplica enums.
- [ ] AC-00140 — WorkRequests: no duplica query keys.
- [ ] AC-00141 — WorkRequests: tiene prueba unitaria.
- [ ] AC-00142 — WorkRequests: tiene prueba de integración.
- [ ] AC-00143 — SiteVisits: tiene prueba negativa.
- [ ] AC-00144 — SiteVisits: tiene prueba E2E crítica.
- [ ] AC-00145 — SiteVisits: tiene documentación actualizada.
- [ ] AC-00146 — SiteVisits: tiene backup del archivo modificado.
- [ ] AC-00147 — SiteVisits: pasa typecheck.
- [ ] AC-00148 — SiteVisits: pasa lint sin warnings.
- [ ] AC-00149 — SiteVisits: pasa build.
- [ ] AC-00150 — SiteVisits: pasa verify.
- [ ] AC-00151 — SiteVisits: respeta mobile-first.
- [ ] AC-00152 — SiteVisits: respeta accesibilidad.
- [ ] AC-00153 — SiteVisits: respeta privacidad.
- [ ] AC-00154 — Proposals: respeta performance budget.
- [ ] AC-00155 — Proposals: registra métricas verificables.
- [ ] AC-00156 — Proposals: tiene fallback.
- [ ] AC-00157 — Proposals: tiene estrategia de migración.
- [ ] AC-00158 — Proposals: conserva compatibilidad.
- [ ] AC-00159 — Proposals: no borra datos.
- [ ] AC-00160 — Proposals: no ejecuta Git.
- [ ] AC-00161 — PurchaseOrders: tiene una fuente de verdad identificada.
- [ ] AC-00162 — PurchaseOrders: tiene owner definido.
- [ ] AC-00163 — PurchaseOrders: tiene alcance y fuera de alcance.
- [ ] AC-00164 — PurchaseOrders: tiene contrato versionado.
- [ ] AC-00165 — ServiceCases: tiene regla de dominio probada.
- [ ] AC-00166 — ServiceCases: tiene autorización backend.
- [ ] AC-00167 — ServiceCases: tiene auditoría.
- [ ] AC-00168 — ServiceCases: tiene idempotencia cuando aplica.
- [ ] AC-00169 — ServiceCases: tiene loading state.
- [ ] AC-00170 — ServiceCases: tiene error state.
- [ ] AC-00171 — ServiceCases: tiene empty state.
- [ ] AC-00172 — ServiceCases: tiene offline state cuando aplica.
- [ ] AC-00173 — ServiceCases: tiene forbidden state.
- [ ] AC-00174 — ServiceCases: tiene mensajes en español.
- [ ] AC-00175 — ServiceCases: no muestra ObjectIds.
- [ ] AC-00176 — WorkOrders: no introduce any.
- [ ] AC-00177 — WorkOrders: no introduce casts inseguros.
- [ ] AC-00178 — WorkOrders: no usa null como estado de negocio.
- [ ] AC-00179 — WorkOrders: no duplica enums.
- [ ] AC-00180 — WorkOrders: no duplica query keys.
- [ ] AC-00181 — WorkOrders: tiene prueba unitaria.
- [ ] AC-00182 — WorkOrders: tiene prueba de integración.
- [ ] AC-00183 — WorkOrders: tiene prueba negativa.
- [ ] AC-00184 — WorkOrders: tiene prueba E2E crítica.
- [ ] AC-00185 — WorkOrders: tiene documentación actualizada.
- [ ] AC-00186 — WorkOrders: tiene backup del archivo modificado.
- [ ] AC-00187 — PlanningPackets: pasa typecheck.
- [ ] AC-00188 — PlanningPackets: pasa lint sin warnings.
- [ ] AC-00189 — PlanningPackets: pasa build.
- [ ] AC-00190 — PlanningPackets: pasa verify.
- [ ] AC-00191 — PlanningPackets: respeta mobile-first.
- [ ] AC-00192 — PlanningPackets: respeta accesibilidad.
- [ ] AC-00193 — PlanningPackets: respeta privacidad.
- [ ] AC-00194 — PlanningPackets: respeta performance budget.
- [ ] AC-00195 — PlanningPackets: registra métricas verificables.
- [ ] AC-00196 — PlanningPackets: tiene fallback.
- [ ] AC-00197 — PlanningPackets: tiene estrategia de migración.
- [ ] AC-00198 — Kits: conserva compatibilidad.
- [ ] AC-00199 — Kits: no borra datos.
- [ ] AC-00200 — Kits: no ejecuta Git.
- [ ] AC-00201 — Safety: tiene una fuente de verdad identificada.
- [ ] AC-00202 — Safety: tiene owner definido.
- [ ] AC-00203 — Safety: tiene alcance y fuera de alcance.
- [ ] AC-00204 — Safety: tiene contrato versionado.
- [ ] AC-00205 — Safety: tiene regla de dominio probada.
- [ ] AC-00206 — Safety: tiene autorización backend.
- [ ] AC-00207 — Safety: tiene auditoría.
- [ ] AC-00208 — Safety: tiene idempotencia cuando aplica.
- [ ] AC-00209 — ExecutionSessions: tiene loading state.
- [ ] AC-00210 — ExecutionSessions: tiene error state.
- [ ] AC-00211 — ExecutionSessions: tiene empty state.
- [ ] AC-00212 — ExecutionSessions: tiene offline state cuando aplica.
- [ ] AC-00213 — ExecutionSessions: tiene forbidden state.
- [ ] AC-00214 — ExecutionSessions: tiene mensajes en español.
- [ ] AC-00215 — ExecutionSessions: no muestra ObjectIds.
- [ ] AC-00216 — ExecutionSessions: no introduce any.
- [ ] AC-00217 — ExecutionSessions: no introduce casts inseguros.
- [ ] AC-00218 — ExecutionSessions: no usa null como estado de negocio.
- [ ] AC-00219 — ExecutionSessions: no duplica enums.
- [ ] AC-00220 — OfflineQueue: no duplica query keys.
- [ ] AC-00221 — OfflineQueue: tiene prueba unitaria.
- [ ] AC-00222 — OfflineQueue: tiene prueba de integración.
- [ ] AC-00223 — OfflineQueue: tiene prueba negativa.
- [ ] AC-00224 — OfflineQueue: tiene prueba E2E crítica.
- [ ] AC-00225 — OfflineQueue: tiene documentación actualizada.
- [ ] AC-00226 — OfflineQueue: tiene backup del archivo modificado.
- [ ] AC-00227 — OfflineQueue: pasa typecheck.
- [ ] AC-00228 — OfflineQueue: pasa lint sin warnings.
- [ ] AC-00229 — OfflineQueue: pasa build.
- [ ] AC-00230 — OfflineQueue: pasa verify.
- [ ] AC-00231 — SyncConflicts: respeta mobile-first.
- [ ] AC-00232 — SyncConflicts: respeta accesibilidad.
- [ ] AC-00233 — SyncConflicts: respeta privacidad.
- [ ] AC-00234 — SyncConflicts: respeta performance budget.
- [ ] AC-00235 — SyncConflicts: registra métricas verificables.
- [ ] AC-00236 — SyncConflicts: tiene fallback.
- [ ] AC-00237 — SyncConflicts: tiene estrategia de migración.
- [ ] AC-00238 — SyncConflicts: conserva compatibilidad.
- [ ] AC-00239 — SyncConflicts: no borra datos.
- [ ] AC-00240 — SyncConflicts: no ejecuta Git.
- [ ] AC-00241 — Evidences: tiene una fuente de verdad identificada.
- [ ] AC-00242 — FileAssets: tiene owner definido.
- [ ] AC-00243 — FileAssets: tiene alcance y fuera de alcance.
- [ ] AC-00244 — FileAssets: tiene contrato versionado.
- [ ] AC-00245 — FileAssets: tiene regla de dominio probada.
- [ ] AC-00246 — FileAssets: tiene autorización backend.
- [ ] AC-00247 — FileAssets: tiene auditoría.
- [ ] AC-00248 — FileAssets: tiene idempotencia cuando aplica.
- [ ] AC-00249 — FileAssets: tiene loading state.
- [ ] AC-00250 — FileAssets: tiene error state.
- [ ] AC-00251 — FileAssets: tiene empty state.
- [ ] AC-00252 — FileAssets: tiene offline state cuando aplica.
- [ ] AC-00253 — LineInspection: tiene forbidden state.
- [ ] AC-00254 — LineInspection: tiene mensajes en español.
- [ ] AC-00255 — LineInspection: no muestra ObjectIds.
- [ ] AC-00256 — LineInspection: no introduce any.
- [ ] AC-00257 — LineInspection: no introduce casts inseguros.
- [ ] AC-00258 — LineInspection: no usa null como estado de negocio.
- [ ] AC-00259 — LineInspection: no duplica enums.
- [ ] AC-00260 — LineInspection: no duplica query keys.
- [ ] AC-00261 — LineInspection: tiene prueba unitaria.
- [ ] AC-00262 — LineInspection: tiene prueba de integración.
- [ ] AC-00263 — LineInspection: tiene prueba negativa.
- [ ] AC-00264 — CCTV: tiene prueba E2E crítica.
- [ ] AC-00265 — CCTV: tiene documentación actualizada.
- [ ] AC-00266 — CCTV: tiene backup del archivo modificado.
- [ ] AC-00267 — CCTV: pasa typecheck.
- [ ] AC-00268 — CCTV: pasa lint sin warnings.
- [ ] AC-00269 — CCTV: pasa build.
- [ ] AC-00270 — CCTV: pasa verify.
- [ ] AC-00271 — CCTV: respeta mobile-first.
- [ ] AC-00272 — CCTV: respeta accesibilidad.
- [ ] AC-00273 — CCTV: respeta privacidad.
- [ ] AC-00274 — CCTV: respeta performance budget.
- [ ] AC-00275 — TechnicalReports: registra métricas verificables.
- [ ] AC-00276 — TechnicalReports: tiene fallback.
- [ ] AC-00277 — TechnicalReports: tiene estrategia de migración.
- [ ] AC-00278 — TechnicalReports: conserva compatibilidad.
- [ ] AC-00279 — TechnicalReports: no borra datos.
- [ ] AC-00280 — TechnicalReports: no ejecuta Git.
- [ ] AC-00281 — DynamicForms: tiene una fuente de verdad identificada.
- [ ] AC-00282 — DynamicForms: tiene owner definido.
- [ ] AC-00283 — DynamicForms: tiene alcance y fuera de alcance.
- [ ] AC-00284 — DynamicForms: tiene contrato versionado.
- [ ] AC-00285 — DynamicForms: tiene regla de dominio probada.
- [ ] AC-00286 — DeliveryRecords: tiene autorización backend.
- [ ] AC-00287 — DeliveryRecords: tiene auditoría.
- [ ] AC-00288 — DeliveryRecords: tiene idempotencia cuando aplica.
- [ ] AC-00289 — DeliveryRecords: tiene loading state.
- [ ] AC-00290 — DeliveryRecords: tiene error state.
- [ ] AC-00291 — DeliveryRecords: tiene empty state.
- [ ] AC-00292 — DeliveryRecords: tiene offline state cuando aplica.
- [ ] AC-00293 — DeliveryRecords: tiene forbidden state.
- [ ] AC-00294 — DeliveryRecords: tiene mensajes en español.
- [ ] AC-00295 — DeliveryRecords: no muestra ObjectIds.
- [ ] AC-00296 — DeliveryRecords: no introduce any.
- [ ] AC-00297 — ClientAcceptance: no introduce casts inseguros.
- [ ] AC-00298 — ClientAcceptance: no usa null como estado de negocio.
- [ ] AC-00299 — ClientAcceptance: no duplica enums.
- [ ] AC-00300 — ClientAcceptance: no duplica query keys.
- [ ] AC-00301 — ClientAcceptance: tiene prueba unitaria.
- [ ] AC-00302 — ClientAcceptance: tiene prueba de integración.
- [ ] AC-00303 — ClientAcceptance: tiene prueba negativa.
- [ ] AC-00304 — ClientAcceptance: tiene prueba E2E crítica.
- [ ] AC-00305 — ClientAcceptance: tiene documentación actualizada.
- [ ] AC-00306 — ClientAcceptance: tiene backup del archivo modificado.
- [ ] AC-00307 — ClientAcceptance: pasa typecheck.
- [ ] AC-00308 — SES: pasa lint sin warnings.
- [ ] AC-00309 — SES: pasa build.
- [ ] AC-00310 — SES: pasa verify.
- [ ] AC-00311 — SES: respeta mobile-first.
- [ ] AC-00312 — SES: respeta accesibilidad.
- [ ] AC-00313 — SES: respeta privacidad.
- [ ] AC-00314 — SES: respeta performance budget.
- [ ] AC-00315 — SES: registra métricas verificables.
- [ ] AC-00316 — SES: tiene fallback.
- [ ] AC-00317 — SES: tiene estrategia de migración.
- [ ] AC-00318 — SES: conserva compatibilidad.
- [ ] AC-00319 — SESApproval: no borra datos.
- [ ] AC-00320 — SESApproval: no ejecuta Git.
- [ ] AC-00321 — Invoices: tiene una fuente de verdad identificada.
- [ ] AC-00322 — Invoices: tiene owner definido.
- [ ] AC-00323 — Invoices: tiene alcance y fuera de alcance.
- [ ] AC-00324 — Invoices: tiene contrato versionado.
- [ ] AC-00325 — Invoices: tiene regla de dominio probada.
- [ ] AC-00326 — Invoices: tiene autorización backend.
- [ ] AC-00327 — Invoices: tiene auditoría.
- [ ] AC-00328 — Invoices: tiene idempotencia cuando aplica.
- [ ] AC-00329 — Invoices: tiene loading state.
- [ ] AC-00330 — InvoiceApproval: tiene error state.
- [ ] AC-00331 — InvoiceApproval: tiene empty state.
- [ ] AC-00332 — InvoiceApproval: tiene offline state cuando aplica.
- [ ] AC-00333 — InvoiceApproval: tiene forbidden state.
- [ ] AC-00334 — InvoiceApproval: tiene mensajes en español.
- [ ] AC-00335 — InvoiceApproval: no muestra ObjectIds.
- [ ] AC-00336 — InvoiceApproval: no introduce any.
- [ ] AC-00337 — InvoiceApproval: no introduce casts inseguros.
- [ ] AC-00338 — InvoiceApproval: no usa null como estado de negocio.
- [ ] AC-00339 — InvoiceApproval: no duplica enums.
- [ ] AC-00340 — InvoiceApproval: no duplica query keys.
- [ ] AC-00341 — Payments: tiene prueba unitaria.
- [ ] AC-00342 — Payments: tiene prueba de integración.
- [ ] AC-00343 — Payments: tiene prueba negativa.
- [ ] AC-00344 — Payments: tiene prueba E2E crítica.
- [ ] AC-00345 — Payments: tiene documentación actualizada.
- [ ] AC-00346 — Payments: tiene backup del archivo modificado.
- [ ] AC-00347 — Payments: pasa typecheck.
- [ ] AC-00348 — Payments: pasa lint sin warnings.
- [ ] AC-00349 — Payments: pasa build.
- [ ] AC-00350 — Payments: pasa verify.
- [ ] AC-00351 — Payments: respeta mobile-first.
- [ ] AC-00352 — Closure: respeta accesibilidad.
- [ ] AC-00353 — Closure: respeta privacidad.
- [ ] AC-00354 — Closure: respeta performance budget.
- [ ] AC-00355 — Closure: registra métricas verificables.
- [ ] AC-00356 — Closure: tiene fallback.
- [ ] AC-00357 — Closure: tiene estrategia de migración.
- [ ] AC-00358 — Closure: conserva compatibilidad.
- [ ] AC-00359 — Closure: no borra datos.
- [ ] AC-00360 — Closure: no ejecuta Git.
- [ ] AC-00361 — Costs: tiene una fuente de verdad identificada.
- [ ] AC-00362 — Costs: tiene owner definido.
- [ ] AC-00363 — Inventory: tiene alcance y fuera de alcance.
- [ ] AC-00364 — Inventory: tiene contrato versionado.
- [ ] AC-00365 — Inventory: tiene regla de dominio probada.
- [ ] AC-00366 — Inventory: tiene autorización backend.
- [ ] AC-00367 — Inventory: tiene auditoría.
- [ ] AC-00368 — Inventory: tiene idempotencia cuando aplica.
- [ ] AC-00369 — Inventory: tiene loading state.
- [ ] AC-00370 — Inventory: tiene error state.
- [ ] AC-00371 — Inventory: tiene empty state.
- [ ] AC-00372 — Inventory: tiene offline state cuando aplica.
- [ ] AC-00373 — Inventory: tiene forbidden state.
- [ ] AC-00374 — Tools: tiene mensajes en español.
- [ ] AC-00375 — Tools: no muestra ObjectIds.
- [ ] AC-00376 — Tools: no introduce any.
- [ ] AC-00377 — Tools: no introduce casts inseguros.
- [ ] AC-00378 — Tools: no usa null como estado de negocio.
- [ ] AC-00379 — Tools: no duplica enums.
- [ ] AC-00380 — Tools: no duplica query keys.
- [ ] AC-00381 — Tools: tiene prueba unitaria.
- [ ] AC-00382 — Tools: tiene prueba de integración.
- [ ] AC-00383 — Tools: tiene prueba negativa.
- [ ] AC-00384 — Tools: tiene prueba E2E crítica.
- [ ] AC-00385 — Fleet: tiene documentación actualizada.
- [ ] AC-00386 — Fleet: tiene backup del archivo modificado.
- [ ] AC-00387 — Fleet: pasa typecheck.
- [ ] AC-00388 — Fleet: pasa lint sin warnings.
- [ ] AC-00389 — Fleet: pasa build.
- [ ] AC-00390 — Fleet: pasa verify.
- [ ] AC-00391 — Fleet: respeta mobile-first.
- [ ] AC-00392 — Fleet: respeta accesibilidad.
- [ ] AC-00393 — Fleet: respeta privacidad.
- [ ] AC-00394 — Fleet: respeta performance budget.
- [ ] AC-00395 — Fleet: registra métricas verificables.
- [ ] AC-00396 — Assets: tiene fallback.
- [ ] AC-00397 — Assets: tiene estrategia de migración.
- [ ] AC-00398 — Assets: conserva compatibilidad.
- [ ] AC-00399 — Assets: no borra datos.
- [ ] AC-00400 — Assets: no ejecuta Git.
- [ ] AC-00401 — Maintenance: tiene una fuente de verdad identificada.
- [ ] AC-00402 — Maintenance: tiene owner definido.
- [ ] AC-00403 — Maintenance: tiene alcance y fuera de alcance.
- [ ] AC-00404 — Maintenance: tiene contrato versionado.
- [ ] AC-00405 — Maintenance: tiene regla de dominio probada.
- [ ] AC-00406 — Maintenance: tiene autorización backend.
- [ ] AC-00407 — Dashboard: tiene auditoría.
- [ ] AC-00408 — Dashboard: tiene idempotencia cuando aplica.
- [ ] AC-00409 — Dashboard: tiene loading state.
- [ ] AC-00410 — Dashboard: tiene error state.
- [ ] AC-00411 — Dashboard: tiene empty state.
- [ ] AC-00412 — Dashboard: tiene offline state cuando aplica.
- [ ] AC-00413 — Dashboard: tiene forbidden state.
- [ ] AC-00414 — Dashboard: tiene mensajes en español.
- [ ] AC-00415 — Dashboard: no muestra ObjectIds.
- [ ] AC-00416 — Dashboard: no introduce any.
- [ ] AC-00417 — Dashboard: no introduce casts inseguros.
- [ ] AC-00418 — SLA: no usa null como estado de negocio.
- [ ] AC-00419 — SLA: no duplica enums.
- [ ] AC-00420 — SLA: no duplica query keys.
- [ ] AC-00421 — SLA: tiene prueba unitaria.
- [ ] AC-00422 — SLA: tiene prueba de integración.
- [ ] AC-00423 — SLA: tiene prueba negativa.
- [ ] AC-00424 — SLA: tiene prueba E2E crítica.
- [ ] AC-00425 — SLA: tiene documentación actualizada.
- [ ] AC-00426 — SLA: tiene backup del archivo modificado.
- [ ] AC-00427 — SLA: pasa typecheck.
- [ ] AC-00428 — SLA: pasa lint sin warnings.
- [ ] AC-00429 — Dispatch: pasa build.
- [ ] AC-00430 — Dispatch: pasa verify.
- [ ] AC-00431 — Dispatch: respeta mobile-first.
- [ ] AC-00432 — Dispatch: respeta accesibilidad.
- [ ] AC-00433 — Dispatch: respeta privacidad.
- [ ] AC-00434 — Dispatch: respeta performance budget.
- [ ] AC-00435 — Dispatch: registra métricas verificables.
- [ ] AC-00436 — Dispatch: tiene fallback.
- [ ] AC-00437 — Dispatch: tiene estrategia de migración.
- [ ] AC-00438 — Dispatch: conserva compatibilidad.
- [ ] AC-00439 — Dispatch: no borra datos.
- [ ] AC-00440 — Notifications: no ejecuta Git.
- [ ] AC-00441 — ClientPortal: tiene una fuente de verdad identificada.
- [ ] AC-00442 — ClientPortal: tiene owner definido.
- [ ] AC-00443 — ClientPortal: tiene alcance y fuera de alcance.
- [ ] AC-00444 — ClientPortal: tiene contrato versionado.
- [ ] AC-00445 — ClientPortal: tiene regla de dominio probada.
- [ ] AC-00446 — ClientPortal: tiene autorización backend.
- [ ] AC-00447 — ClientPortal: tiene auditoría.
- [ ] AC-00448 — ClientPortal: tiene idempotencia cuando aplica.
- [ ] AC-00449 — ClientPortal: tiene loading state.
- [ ] AC-00450 — ClientPortal: tiene error state.
- [ ] AC-00451 — HistoricalArchive: tiene empty state.
- [ ] AC-00452 — HistoricalArchive: tiene offline state cuando aplica.
- [ ] AC-00453 — HistoricalArchive: tiene forbidden state.
- [ ] AC-00454 — HistoricalArchive: tiene mensajes en español.
- [ ] AC-00455 — HistoricalArchive: no muestra ObjectIds.
- [ ] AC-00456 — HistoricalArchive: no introduce any.
- [ ] AC-00457 — HistoricalArchive: no introduce casts inseguros.
- [ ] AC-00458 — HistoricalArchive: no usa null como estado de negocio.
- [ ] AC-00459 — HistoricalArchive: no duplica enums.
- [ ] AC-00460 — HistoricalArchive: no duplica query keys.
- [ ] AC-00461 — HistoricalArchive: tiene prueba unitaria.
- [ ] AC-00462 — Backups: tiene prueba de integración.
- [ ] AC-00463 — Backups: tiene prueba negativa.
- [ ] AC-00464 — Backups: tiene prueba E2E crítica.
- [ ] AC-00465 — Backups: tiene documentación actualizada.
- [ ] AC-00466 — Backups: tiene backup del archivo modificado.
- [ ] AC-00467 — Backups: pasa typecheck.
- [ ] AC-00468 — Backups: pasa lint sin warnings.
- [ ] AC-00469 — Backups: pasa build.
- [ ] AC-00470 — Backups: pasa verify.
- [ ] AC-00471 — Backups: respeta mobile-first.
- [ ] AC-00472 — Backups: respeta accesibilidad.
- [ ] AC-00473 — Audit: respeta privacidad.
- [ ] AC-00474 — Audit: respeta performance budget.
- [ ] AC-00475 — Audit: registra métricas verificables.
- [ ] AC-00476 — Audit: tiene fallback.
- [ ] AC-00477 — Audit: tiene estrategia de migración.
- [ ] AC-00478 — Audit: conserva compatibilidad.
- [ ] AC-00479 — Audit: no borra datos.
- [ ] AC-00480 — Audit: no ejecuta Git.
- [ ] AC-00481 — Observability: tiene una fuente de verdad identificada.
- [ ] AC-00482 — Observability: tiene owner definido.
- [ ] AC-00483 — Observability: tiene alcance y fuera de alcance.
- [ ] AC-00484 — Security: tiene contrato versionado.
- [ ] AC-00485 — Security: tiene regla de dominio probada.
- [ ] AC-00486 — Security: tiene autorización backend.
- [ ] AC-00487 — Security: tiene auditoría.
- [ ] AC-00488 — Security: tiene idempotencia cuando aplica.
- [ ] AC-00489 — Security: tiene loading state.
- [ ] AC-00490 — Security: tiene error state.
- [ ] AC-00491 — Security: tiene empty state.
- [ ] AC-00492 — Security: tiene offline state cuando aplica.
- [ ] AC-00493 — Security: tiene forbidden state.
- [ ] AC-00494 — Security: tiene mensajes en español.
- [ ] AC-00495 — Accessibility: no muestra ObjectIds.
- [ ] AC-00496 — Accessibility: no introduce any.
- [ ] AC-00497 — Accessibility: no introduce casts inseguros.
- [ ] AC-00498 — Accessibility: no usa null como estado de negocio.
- [ ] AC-00499 — Accessibility: no duplica enums.
- [ ] AC-00500 — Accessibility: no duplica query keys.
- [ ] AC-00501 — Accessibility: tiene prueba unitaria.
- [ ] AC-00502 — Accessibility: tiene prueba de integración.
- [ ] AC-00503 — Accessibility: tiene prueba negativa.
- [ ] AC-00504 — Accessibility: tiene prueba E2E crítica.
- [ ] AC-00505 — Accessibility: tiene documentación actualizada.
- [ ] AC-00506 — Performance: tiene backup del archivo modificado.
- [ ] AC-00507 — Performance: pasa typecheck.
- [ ] AC-00508 — Performance: pasa lint sin warnings.
- [ ] AC-00509 — Performance: pasa build.
- [ ] AC-00510 — Performance: pasa verify.
- [ ] AC-00511 — Performance: respeta mobile-first.
- [ ] AC-00512 — Performance: respeta accesibilidad.
- [ ] AC-00513 — Performance: respeta privacidad.
- [ ] AC-00514 — Performance: respeta performance budget.
- [ ] AC-00515 — Performance: registra métricas verificables.
- [ ] AC-00516 — Performance: tiene fallback.
- [ ] AC-00517 — Testing: tiene estrategia de migración.
- [ ] AC-00518 — Testing: conserva compatibilidad.
- [ ] AC-00519 — Testing: no borra datos.
- [ ] AC-00520 — Testing: no ejecuta Git.
- [ ] AC-00521 — Documentation: tiene una fuente de verdad identificada.
- [ ] AC-00522 — Documentation: tiene owner definido.
- [ ] AC-00523 — Documentation: tiene alcance y fuera de alcance.
- [ ] AC-00524 — Documentation: tiene contrato versionado.
- [ ] AC-00525 — Documentation: tiene regla de dominio probada.
- [ ] AC-00526 — Documentation: tiene autorización backend.
- [ ] AC-00527 — Documentation: tiene auditoría.
- [ ] AC-00528 — Deployment: tiene idempotencia cuando aplica.
- [ ] AC-00529 — Deployment: tiene loading state.
- [ ] AC-00530 — Deployment: tiene error state.
- [ ] AC-00531 — Deployment: tiene empty state.
- [ ] AC-00532 — Deployment: tiene offline state cuando aplica.
- [ ] AC-00533 — Deployment: tiene forbidden state.
- [ ] AC-00534 — Deployment: tiene mensajes en español.
- [ ] AC-00535 — Deployment: no muestra ObjectIds.
- [ ] AC-00536 — Deployment: no introduce any.
- [ ] AC-00537 — Deployment: no introduce casts inseguros.
- [ ] AC-00538 — Deployment: no usa null como estado de negocio.
- [ ] AC-00539 — Innovation: no duplica enums.
- [ ] AC-00540 — Innovation: no duplica query keys.
- [ ] AC-00541 — Innovation: tiene prueba unitaria.
- [ ] AC-00542 — Innovation: tiene prueba de integración.
- [ ] AC-00543 — Innovation: tiene prueba negativa.
- [ ] AC-00544 — Innovation: tiene prueba E2E crítica.
- [ ] AC-00545 — Innovation: tiene documentación actualizada.
- [ ] AC-00546 — Innovation: tiene backup del archivo modificado.
- [ ] AC-00547 — Innovation: pasa typecheck.
- [ ] AC-00548 — Innovation: pasa lint sin warnings.
- [ ] AC-00549 — Innovation: pasa build.
- [ ] AC-00550 — AIAdapter: pasa verify.
- [ ] AC-00551 — AIAdapter: respeta mobile-first.
- [ ] AC-00552 — AIAdapter: respeta accesibilidad.
- [ ] AC-00553 — AIAdapter: respeta privacidad.
- [ ] AC-00554 — AIAdapter: respeta performance budget.
- [ ] AC-00555 — AIAdapter: registra métricas verificables.
- [ ] AC-00556 — AIAdapter: tiene fallback.
- [ ] AC-00557 — AIAdapter: tiene estrategia de migración.
- [ ] AC-00558 — AIAdapter: conserva compatibilidad.
- [ ] AC-00559 — AIAdapter: no borra datos.
- [ ] AC-00560 — AIAdapter: no ejecuta Git.
- [ ] AC-00561 — Integrations: tiene una fuente de verdad identificada.
- [ ] AC-00562 — Integrations: tiene owner definido.
- [ ] AC-00563 — Integrations: tiene alcance y fuera de alcance.
- [ ] AC-00564 — Integrations: tiene contrato versionado.
- [ ] AC-00565 — Integrations: tiene regla de dominio probada.
- [ ] AC-00566 — Integrations: tiene autorización backend.
- [ ] AC-00567 — Integrations: tiene auditoría.
- [ ] AC-00568 — Integrations: tiene idempotencia cuando aplica.
- [ ] AC-00569 — Integrations: tiene loading state.
- [ ] AC-00570 — Integrations: tiene error state.
- [ ] AC-00571 — Integrations: tiene empty state.
- [ ] AC-00572 — ProductGovernance: tiene offline state cuando aplica.
- [ ] AC-00573 — ProductGovernance: tiene forbidden state.
- [ ] AC-00574 — ProductGovernance: tiene mensajes en español.
- [ ] AC-00575 — ProductGovernance: no muestra ObjectIds.
- [ ] AC-00576 — ProductGovernance: no introduce any.
- [ ] AC-00577 — ProductGovernance: no introduce casts inseguros.
- [ ] AC-00578 — ProductGovernance: no usa null como estado de negocio.
- [ ] AC-00579 — ProductGovernance: no duplica enums.
- [ ] AC-00580 — ProductGovernance: no duplica query keys.
- [ ] AC-00581 — ProductGovernance: tiene prueba unitaria.
- [ ] AC-00582 — ProductGovernance: tiene prueba de integración.
- [ ] AC-00583 — SourceTraceability: tiene prueba negativa.
- [ ] AC-00584 — SourceTraceability: tiene prueba E2E crítica.
- [ ] AC-00585 — SourceTraceability: tiene documentación actualizada.
- [ ] AC-00586 — SourceTraceability: tiene backup del archivo modificado.
- [ ] AC-00587 — SourceTraceability: pasa typecheck.
- [ ] AC-00588 — SourceTraceability: pasa lint sin warnings.
- [ ] AC-00589 — SourceTraceability: pasa build.
- [ ] AC-00590 — SourceTraceability: pasa verify.
- [ ] AC-00591 — SourceTraceability: respeta mobile-first.
- [ ] AC-00592 — SourceTraceability: respeta accesibilidad.
- [ ] AC-00593 — SourceTraceability: respeta privacidad.
- [ ] AC-00594 — AgentCoordinator: respeta performance budget.
- [ ] AC-00595 — AgentCoordinator: registra métricas verificables.
- [ ] AC-00596 — AgentCoordinator: tiene fallback.
- [ ] AC-00597 — AgentCoordinator: tiene estrategia de migración.
- [ ] AC-00598 — AgentCoordinator: conserva compatibilidad.
- [ ] AC-00599 — AgentCoordinator: no borra datos.
- [ ] AC-00600 — AgentCoordinator: no ejecuta Git.
- [ ] AC-00601 — AgentHandoff: tiene una fuente de verdad identificada.
- [ ] AC-00602 — AgentHandoff: tiene owner definido.
- [ ] AC-00603 — AgentHandoff: tiene alcance y fuera de alcance.
- [ ] AC-00604 — AgentHandoff: tiene contrato versionado.
- [ ] AC-00605 — SharedTypes: tiene regla de dominio probada.
- [ ] AC-00606 — SharedTypes: tiene autorización backend.
- [ ] AC-00607 — SharedTypes: tiene auditoría.
- [ ] AC-00608 — SharedTypes: tiene idempotencia cuando aplica.
- [ ] AC-00609 — SharedTypes: tiene loading state.
- [ ] AC-00610 — SharedTypes: tiene error state.
- [ ] AC-00611 — SharedTypes: tiene empty state.
- [ ] AC-00612 — SharedTypes: tiene offline state cuando aplica.
- [ ] AC-00613 — SharedTypes: tiene forbidden state.
- [ ] AC-00614 — SharedTypes: tiene mensajes en español.
- [ ] AC-00615 — SharedTypes: no muestra ObjectIds.
- [ ] AC-00616 — DomainFSM: no introduce any.
- [ ] AC-00617 — DomainFSM: no introduce casts inseguros.
- [ ] AC-00618 — DomainFSM: no usa null como estado de negocio.
- [ ] AC-00619 — DomainFSM: no duplica enums.
- [ ] AC-00620 — DomainFSM: no duplica query keys.
- [ ] AC-00621 — DomainFSM: tiene prueba unitaria.
- [ ] AC-00622 — DomainFSM: tiene prueba de integración.
- [ ] AC-00623 — DomainFSM: tiene prueba negativa.
- [ ] AC-00624 — DomainFSM: tiene prueba E2E crítica.
- [ ] AC-00625 — DomainFSM: tiene documentación actualizada.
- [ ] AC-00626 — DomainFSM: tiene backup del archivo modificado.
- [ ] AC-00627 — Config: pasa typecheck.
- [ ] AC-00628 — Config: pasa lint sin warnings.
- [ ] AC-00629 — Config: pasa build.
- [ ] AC-00630 — Config: pasa verify.
- [ ] AC-00631 — Config: respeta mobile-first.
- [ ] AC-00632 — Config: respeta accesibilidad.
- [ ] AC-00633 — Config: respeta privacidad.
- [ ] AC-00634 — Config: respeta performance budget.
- [ ] AC-00635 — Config: registra métricas verificables.
- [ ] AC-00636 — Config: tiene fallback.
- [ ] AC-00637 — Config: tiene estrategia de migración.
- [ ] AC-00638 — Auth: conserva compatibilidad.
- [ ] AC-00639 — Auth: no borra datos.
- [ ] AC-00640 — Auth: no ejecuta Git.
- [ ] AC-00641 — Session: tiene una fuente de verdad identificada.
- [ ] AC-00642 — Session: tiene owner definido.
- [ ] AC-00643 — Session: tiene alcance y fuera de alcance.
- [ ] AC-00644 — Session: tiene contrato versionado.
- [ ] AC-00645 — Session: tiene regla de dominio probada.
- [ ] AC-00646 — Session: tiene autorización backend.
- [ ] AC-00647 — Session: tiene auditoría.
- [ ] AC-00648 — Session: tiene idempotencia cuando aplica.
- [ ] AC-00649 — WebAuthn: tiene loading state.
- [ ] AC-00650 — WebAuthn: tiene error state.
- [ ] AC-00651 — WebAuthn: tiene empty state.
- [ ] AC-00652 — WebAuthn: tiene offline state cuando aplica.
- [ ] AC-00653 — WebAuthn: tiene forbidden state.
- [ ] AC-00654 — WebAuthn: tiene mensajes en español.
- [ ] AC-00655 — WebAuthn: no muestra ObjectIds.
- [ ] AC-00656 — WebAuthn: no introduce any.
- [ ] AC-00657 — WebAuthn: no introduce casts inseguros.
- [ ] AC-00658 — WebAuthn: no usa null como estado de negocio.
- [ ] AC-00659 — WebAuthn: no duplica enums.
- [ ] AC-00660 — RBAC: no duplica query keys.
- [ ] AC-00661 — RBAC: tiene prueba unitaria.
- [ ] AC-00662 — RBAC: tiene prueba de integración.
- [ ] AC-00663 — RBAC: tiene prueba negativa.
- [ ] AC-00664 — RBAC: tiene prueba E2E crítica.
- [ ] AC-00665 — RBAC: tiene documentación actualizada.
- [ ] AC-00666 — RBAC: tiene backup del archivo modificado.
- [ ] AC-00667 — RBAC: pasa typecheck.
- [ ] AC-00668 — RBAC: pasa lint sin warnings.
- [ ] AC-00669 — RBAC: pasa build.
- [ ] AC-00670 — RBAC: pasa verify.
- [ ] AC-00671 — Clients: respeta mobile-first.
- [ ] AC-00672 — Clients: respeta accesibilidad.
- [ ] AC-00673 — Clients: respeta privacidad.
- [ ] AC-00674 — Clients: respeta performance budget.
- [ ] AC-00675 — Clients: registra métricas verificables.
- [ ] AC-00676 — Clients: tiene fallback.
- [ ] AC-00677 — Clients: tiene estrategia de migración.
- [ ] AC-00678 — Clients: conserva compatibilidad.
- [ ] AC-00679 — Clients: no borra datos.
- [ ] AC-00680 — Clients: no ejecuta Git.
- [ ] AC-00681 — Sites: tiene una fuente de verdad identificada.
- [ ] AC-00682 — Contacts: tiene owner definido.
- [ ] AC-00683 — Contacts: tiene alcance y fuera de alcance.
- [ ] AC-00684 — Contacts: tiene contrato versionado.
- [ ] AC-00685 — Contacts: tiene regla de dominio probada.
- [ ] AC-00686 — Contacts: tiene autorización backend.
- [ ] AC-00687 — Contacts: tiene auditoría.
- [ ] AC-00688 — Contacts: tiene idempotencia cuando aplica.
- [ ] AC-00689 — Contacts: tiene loading state.
- [ ] AC-00690 — Contacts: tiene error state.
- [ ] AC-00691 — Contacts: tiene empty state.
- [ ] AC-00692 — Contacts: tiene offline state cuando aplica.
- [ ] AC-00693 — WorkRequests: tiene forbidden state.
- [ ] AC-00694 — WorkRequests: tiene mensajes en español.
- [ ] AC-00695 — WorkRequests: no muestra ObjectIds.
- [ ] AC-00696 — WorkRequests: no introduce any.
- [ ] AC-00697 — WorkRequests: no introduce casts inseguros.
- [ ] AC-00698 — WorkRequests: no usa null como estado de negocio.
- [ ] AC-00699 — WorkRequests: no duplica enums.
- [ ] AC-00700 — WorkRequests: no duplica query keys.
- [ ] AC-00701 — WorkRequests: tiene prueba unitaria.
- [ ] AC-00702 — WorkRequests: tiene prueba de integración.
- [ ] AC-00703 — WorkRequests: tiene prueba negativa.
- [ ] AC-00704 — SiteVisits: tiene prueba E2E crítica.
- [ ] AC-00705 — SiteVisits: tiene documentación actualizada.
- [ ] AC-00706 — SiteVisits: tiene backup del archivo modificado.
- [ ] AC-00707 — SiteVisits: pasa typecheck.
- [ ] AC-00708 — SiteVisits: pasa lint sin warnings.
- [ ] AC-00709 — SiteVisits: pasa build.
- [ ] AC-00710 — SiteVisits: pasa verify.
- [ ] AC-00711 — SiteVisits: respeta mobile-first.
- [ ] AC-00712 — SiteVisits: respeta accesibilidad.
- [ ] AC-00713 — SiteVisits: respeta privacidad.
- [ ] AC-00714 — SiteVisits: respeta performance budget.
- [ ] AC-00715 — Proposals: registra métricas verificables.
- [ ] AC-00716 — Proposals: tiene fallback.
- [ ] AC-00717 — Proposals: tiene estrategia de migración.
- [ ] AC-00718 — Proposals: conserva compatibilidad.
- [ ] AC-00719 — Proposals: no borra datos.
- [ ] AC-00720 — Proposals: no ejecuta Git.
- [ ] AC-00721 — PurchaseOrders: tiene una fuente de verdad identificada.
- [ ] AC-00722 — PurchaseOrders: tiene owner definido.
- [ ] AC-00723 — PurchaseOrders: tiene alcance y fuera de alcance.
- [ ] AC-00724 — PurchaseOrders: tiene contrato versionado.
- [ ] AC-00725 — PurchaseOrders: tiene regla de dominio probada.
- [ ] AC-00726 — ServiceCases: tiene autorización backend.
- [ ] AC-00727 — ServiceCases: tiene auditoría.
- [ ] AC-00728 — ServiceCases: tiene idempotencia cuando aplica.
- [ ] AC-00729 — ServiceCases: tiene loading state.
- [ ] AC-00730 — ServiceCases: tiene error state.
- [ ] AC-00731 — ServiceCases: tiene empty state.
- [ ] AC-00732 — ServiceCases: tiene offline state cuando aplica.
- [ ] AC-00733 — ServiceCases: tiene forbidden state.
- [ ] AC-00734 — ServiceCases: tiene mensajes en español.
- [ ] AC-00735 — ServiceCases: no muestra ObjectIds.
- [ ] AC-00736 — ServiceCases: no introduce any.
- [ ] AC-00737 — WorkOrders: no introduce casts inseguros.
- [ ] AC-00738 — WorkOrders: no usa null como estado de negocio.
- [ ] AC-00739 — WorkOrders: no duplica enums.
- [ ] AC-00740 — WorkOrders: no duplica query keys.
- [ ] AC-00741 — WorkOrders: tiene prueba unitaria.
- [ ] AC-00742 — WorkOrders: tiene prueba de integración.
- [ ] AC-00743 — WorkOrders: tiene prueba negativa.
- [ ] AC-00744 — WorkOrders: tiene prueba E2E crítica.
- [ ] AC-00745 — WorkOrders: tiene documentación actualizada.
- [ ] AC-00746 — WorkOrders: tiene backup del archivo modificado.
- [ ] AC-00747 — WorkOrders: pasa typecheck.
- [ ] AC-00748 — PlanningPackets: pasa lint sin warnings.
- [ ] AC-00749 — PlanningPackets: pasa build.
- [ ] AC-00750 — PlanningPackets: pasa verify.
- [ ] AC-00751 — PlanningPackets: respeta mobile-first.
- [ ] AC-00752 — PlanningPackets: respeta accesibilidad.
- [ ] AC-00753 — PlanningPackets: respeta privacidad.
- [ ] AC-00754 — PlanningPackets: respeta performance budget.
- [ ] AC-00755 — PlanningPackets: registra métricas verificables.
- [ ] AC-00756 — PlanningPackets: tiene fallback.
- [ ] AC-00757 — PlanningPackets: tiene estrategia de migración.
- [ ] AC-00758 — PlanningPackets: conserva compatibilidad.
- [ ] AC-00759 — Kits: no borra datos.
- [ ] AC-00760 — Kits: no ejecuta Git.
- [ ] AC-00761 — Safety: tiene una fuente de verdad identificada.
- [ ] AC-00762 — Safety: tiene owner definido.
- [ ] AC-00763 — Safety: tiene alcance y fuera de alcance.
- [ ] AC-00764 — Safety: tiene contrato versionado.
- [ ] AC-00765 — Safety: tiene regla de dominio probada.
- [ ] AC-00766 — Safety: tiene autorización backend.
- [ ] AC-00767 — Safety: tiene auditoría.
- [ ] AC-00768 — Safety: tiene idempotencia cuando aplica.
- [ ] AC-00769 — Safety: tiene loading state.
- [ ] AC-00770 — ExecutionSessions: tiene error state.
- [ ] AC-00771 — ExecutionSessions: tiene empty state.
- [ ] AC-00772 — ExecutionSessions: tiene offline state cuando aplica.
- [ ] AC-00773 — ExecutionSessions: tiene forbidden state.
- [ ] AC-00774 — ExecutionSessions: tiene mensajes en español.
- [ ] AC-00775 — ExecutionSessions: no muestra ObjectIds.
- [ ] AC-00776 — ExecutionSessions: no introduce any.
- [ ] AC-00777 — ExecutionSessions: no introduce casts inseguros.
- [ ] AC-00778 — ExecutionSessions: no usa null como estado de negocio.
- [ ] AC-00779 — ExecutionSessions: no duplica enums.
- [ ] AC-00780 — ExecutionSessions: no duplica query keys.
- [ ] AC-00781 — OfflineQueue: tiene prueba unitaria.
- [ ] AC-00782 — OfflineQueue: tiene prueba de integración.
- [ ] AC-00783 — OfflineQueue: tiene prueba negativa.
- [ ] AC-00784 — OfflineQueue: tiene prueba E2E crítica.
- [ ] AC-00785 — OfflineQueue: tiene documentación actualizada.
- [ ] AC-00786 — OfflineQueue: tiene backup del archivo modificado.
- [ ] AC-00787 — OfflineQueue: pasa typecheck.
- [ ] AC-00788 — OfflineQueue: pasa lint sin warnings.
- [ ] AC-00789 — OfflineQueue: pasa build.
- [ ] AC-00790 — OfflineQueue: pasa verify.
- [ ] AC-00791 — OfflineQueue: respeta mobile-first.
- [ ] AC-00792 — SyncConflicts: respeta accesibilidad.
- [ ] AC-00793 — SyncConflicts: respeta privacidad.
- [ ] AC-00794 — SyncConflicts: respeta performance budget.
- [ ] AC-00795 — SyncConflicts: registra métricas verificables.
- [ ] AC-00796 — SyncConflicts: tiene fallback.
- [ ] AC-00797 — SyncConflicts: tiene estrategia de migración.
- [ ] AC-00798 — SyncConflicts: conserva compatibilidad.
- [ ] AC-00799 — SyncConflicts: no borra datos.
- [ ] AC-00800 — SyncConflicts: no ejecuta Git.
- [ ] AC-00801 — Evidences: tiene una fuente de verdad identificada.
- [ ] AC-00802 — Evidences: tiene owner definido.
- [ ] AC-00803 — FileAssets: tiene alcance y fuera de alcance.
- [ ] AC-00804 — FileAssets: tiene contrato versionado.
- [ ] AC-00805 — FileAssets: tiene regla de dominio probada.
- [ ] AC-00806 — FileAssets: tiene autorización backend.
- [ ] AC-00807 — FileAssets: tiene auditoría.
- [ ] AC-00808 — FileAssets: tiene idempotencia cuando aplica.
- [ ] AC-00809 — FileAssets: tiene loading state.
- [ ] AC-00810 — FileAssets: tiene error state.
- [ ] AC-00811 — FileAssets: tiene empty state.
- [ ] AC-00812 — FileAssets: tiene offline state cuando aplica.
- [ ] AC-00813 — FileAssets: tiene forbidden state.
- [ ] AC-00814 — LineInspection: tiene mensajes en español.
- [ ] AC-00815 — LineInspection: no muestra ObjectIds.
- [ ] AC-00816 — LineInspection: no introduce any.
- [ ] AC-00817 — LineInspection: no introduce casts inseguros.
- [ ] AC-00818 — LineInspection: no usa null como estado de negocio.
- [ ] AC-00819 — LineInspection: no duplica enums.
- [ ] AC-00820 — LineInspection: no duplica query keys.
- [ ] AC-00821 — LineInspection: tiene prueba unitaria.
- [ ] AC-00822 — LineInspection: tiene prueba de integración.
- [ ] AC-00823 — LineInspection: tiene prueba negativa.
- [ ] AC-00824 — LineInspection: tiene prueba E2E crítica.
- [ ] AC-00825 — CCTV: tiene documentación actualizada.
- [ ] AC-00826 — CCTV: tiene backup del archivo modificado.
- [ ] AC-00827 — CCTV: pasa typecheck.
- [ ] AC-00828 — CCTV: pasa lint sin warnings.
- [ ] AC-00829 — CCTV: pasa build.
- [ ] AC-00830 — CCTV: pasa verify.
- [ ] AC-00831 — CCTV: respeta mobile-first.
- [ ] AC-00832 — CCTV: respeta accesibilidad.
- [ ] AC-00833 — CCTV: respeta privacidad.
- [ ] AC-00834 — CCTV: respeta performance budget.
- [ ] AC-00835 — CCTV: registra métricas verificables.
- [ ] AC-00836 — TechnicalReports: tiene fallback.
- [ ] AC-00837 — TechnicalReports: tiene estrategia de migración.
- [ ] AC-00838 — TechnicalReports: conserva compatibilidad.
- [ ] AC-00839 — TechnicalReports: no borra datos.
- [ ] AC-00840 — TechnicalReports: no ejecuta Git.
- [ ] AC-00841 — DynamicForms: tiene una fuente de verdad identificada.
- [ ] AC-00842 — DynamicForms: tiene owner definido.
- [ ] AC-00843 — DynamicForms: tiene alcance y fuera de alcance.
- [ ] AC-00844 — DynamicForms: tiene contrato versionado.
- [ ] AC-00845 — DynamicForms: tiene regla de dominio probada.
- [ ] AC-00846 — DynamicForms: tiene autorización backend.
- [ ] AC-00847 — DeliveryRecords: tiene auditoría.
- [ ] AC-00848 — DeliveryRecords: tiene idempotencia cuando aplica.
- [ ] AC-00849 — DeliveryRecords: tiene loading state.
- [ ] AC-00850 — DeliveryRecords: tiene error state.
- [ ] AC-00851 — DeliveryRecords: tiene empty state.
- [ ] AC-00852 — DeliveryRecords: tiene offline state cuando aplica.
- [ ] AC-00853 — DeliveryRecords: tiene forbidden state.
- [ ] AC-00854 — DeliveryRecords: tiene mensajes en español.
- [ ] AC-00855 — DeliveryRecords: no muestra ObjectIds.
- [ ] AC-00856 — DeliveryRecords: no introduce any.
- [ ] AC-00857 — DeliveryRecords: no introduce casts inseguros.
- [ ] AC-00858 — ClientAcceptance: no usa null como estado de negocio.
- [ ] AC-00859 — ClientAcceptance: no duplica enums.
- [ ] AC-00860 — ClientAcceptance: no duplica query keys.
- [ ] AC-00861 — ClientAcceptance: tiene prueba unitaria.
- [ ] AC-00862 — ClientAcceptance: tiene prueba de integración.
- [ ] AC-00863 — ClientAcceptance: tiene prueba negativa.
- [ ] AC-00864 — ClientAcceptance: tiene prueba E2E crítica.
- [ ] AC-00865 — ClientAcceptance: tiene documentación actualizada.
- [ ] AC-00866 — ClientAcceptance: tiene backup del archivo modificado.
- [ ] AC-00867 — ClientAcceptance: pasa typecheck.
- [ ] AC-00868 — ClientAcceptance: pasa lint sin warnings.
- [ ] AC-00869 — SES: pasa build.
- [ ] AC-00870 — SES: pasa verify.
- [ ] AC-00871 — SES: respeta mobile-first.
- [ ] AC-00872 — SES: respeta accesibilidad.
- [ ] AC-00873 — SES: respeta privacidad.
- [ ] AC-00874 — SES: respeta performance budget.
- [ ] AC-00875 — SES: registra métricas verificables.
- [ ] AC-00876 — SES: tiene fallback.
- [ ] AC-00877 — SES: tiene estrategia de migración.
- [ ] AC-00878 — SES: conserva compatibilidad.
- [ ] AC-00879 — SES: no borra datos.
- [ ] AC-00880 — SESApproval: no ejecuta Git.
- [ ] AC-00881 — Invoices: tiene una fuente de verdad identificada.
- [ ] AC-00882 — Invoices: tiene owner definido.
- [ ] AC-00883 — Invoices: tiene alcance y fuera de alcance.
- [ ] AC-00884 — Invoices: tiene contrato versionado.
- [ ] AC-00885 — Invoices: tiene regla de dominio probada.
- [ ] AC-00886 — Invoices: tiene autorización backend.
- [ ] AC-00887 — Invoices: tiene auditoría.
- [ ] AC-00888 — Invoices: tiene idempotencia cuando aplica.
- [ ] AC-00889 — Invoices: tiene loading state.
- [ ] AC-00890 — Invoices: tiene error state.
- [ ] AC-00891 — InvoiceApproval: tiene empty state.
- [ ] AC-00892 — InvoiceApproval: tiene offline state cuando aplica.
- [ ] AC-00893 — InvoiceApproval: tiene forbidden state.
- [ ] AC-00894 — InvoiceApproval: tiene mensajes en español.
- [ ] AC-00895 — InvoiceApproval: no muestra ObjectIds.
- [ ] AC-00896 — InvoiceApproval: no introduce any.
- [ ] AC-00897 — InvoiceApproval: no introduce casts inseguros.
- [ ] AC-00898 — InvoiceApproval: no usa null como estado de negocio.
- [ ] AC-00899 — InvoiceApproval: no duplica enums.
- [ ] AC-00900 — InvoiceApproval: no duplica query keys.
- [ ] AC-00901 — InvoiceApproval: tiene prueba unitaria.
- [ ] AC-00902 — Payments: tiene prueba de integración.
- [ ] AC-00903 — Payments: tiene prueba negativa.
- [ ] AC-00904 — Payments: tiene prueba E2E crítica.
- [ ] AC-00905 — Payments: tiene documentación actualizada.
- [ ] AC-00906 — Payments: tiene backup del archivo modificado.
- [ ] AC-00907 — Payments: pasa typecheck.
- [ ] AC-00908 — Payments: pasa lint sin warnings.
- [ ] AC-00909 — Payments: pasa build.
- [ ] AC-00910 — Payments: pasa verify.
- [ ] AC-00911 — Payments: respeta mobile-first.
- [ ] AC-00912 — Payments: respeta accesibilidad.
- [ ] AC-00913 — Closure: respeta privacidad.
- [ ] AC-00914 — Closure: respeta performance budget.
- [ ] AC-00915 — Closure: registra métricas verificables.
- [ ] AC-00916 — Closure: tiene fallback.
- [ ] AC-00917 — Closure: tiene estrategia de migración.
- [ ] AC-00918 — Closure: conserva compatibilidad.
- [ ] AC-00919 — Closure: no borra datos.
- [ ] AC-00920 — Closure: no ejecuta Git.
- [ ] AC-00921 — Costs: tiene una fuente de verdad identificada.
- [ ] AC-00922 — Costs: tiene owner definido.
- [ ] AC-00923 — Costs: tiene alcance y fuera de alcance.
- [ ] AC-00924 — Inventory: tiene contrato versionado.
- [ ] AC-00925 — Inventory: tiene regla de dominio probada.
- [ ] AC-00926 — Inventory: tiene autorización backend.
- [ ] AC-00927 — Inventory: tiene auditoría.
- [ ] AC-00928 — Inventory: tiene idempotencia cuando aplica.
- [ ] AC-00929 — Inventory: tiene loading state.
- [ ] AC-00930 — Inventory: tiene error state.
- [ ] AC-00931 — Inventory: tiene empty state.
- [ ] AC-00932 — Inventory: tiene offline state cuando aplica.
- [ ] AC-00933 — Inventory: tiene forbidden state.
- [ ] AC-00934 — Inventory: tiene mensajes en español.
- [ ] AC-00935 — Tools: no muestra ObjectIds.
- [ ] AC-00936 — Tools: no introduce any.
- [ ] AC-00937 — Tools: no introduce casts inseguros.
- [ ] AC-00938 — Tools: no usa null como estado de negocio.
- [ ] AC-00939 — Tools: no duplica enums.
- [ ] AC-00940 — Tools: no duplica query keys.
- [ ] AC-00941 — Tools: tiene prueba unitaria.
- [ ] AC-00942 — Tools: tiene prueba de integración.
- [ ] AC-00943 — Tools: tiene prueba negativa.
- [ ] AC-00944 — Tools: tiene prueba E2E crítica.
- [ ] AC-00945 — Tools: tiene documentación actualizada.
- [ ] AC-00946 — Fleet: tiene backup del archivo modificado.
- [ ] AC-00947 — Fleet: pasa typecheck.
- [ ] AC-00948 — Fleet: pasa lint sin warnings.
- [ ] AC-00949 — Fleet: pasa build.
- [ ] AC-00950 — Fleet: pasa verify.
- [ ] AC-00951 — Fleet: respeta mobile-first.
- [ ] AC-00952 — Fleet: respeta accesibilidad.
- [ ] AC-00953 — Fleet: respeta privacidad.
- [ ] AC-00954 — Fleet: respeta performance budget.
- [ ] AC-00955 — Fleet: registra métricas verificables.
- [ ] AC-00956 — Fleet: tiene fallback.
- [ ] AC-00957 — Assets: tiene estrategia de migración.
- [ ] AC-00958 — Assets: conserva compatibilidad.
- [ ] AC-00959 — Assets: no borra datos.
- [ ] AC-00960 — Assets: no ejecuta Git.
- [ ] AC-00961 — Maintenance: tiene una fuente de verdad identificada.
- [ ] AC-00962 — Maintenance: tiene owner definido.
- [ ] AC-00963 — Maintenance: tiene alcance y fuera de alcance.
- [ ] AC-00964 — Maintenance: tiene contrato versionado.
- [ ] AC-00965 — Maintenance: tiene regla de dominio probada.
- [ ] AC-00966 — Maintenance: tiene autorización backend.
- [ ] AC-00967 — Maintenance: tiene auditoría.
- [ ] AC-00968 — Dashboard: tiene idempotencia cuando aplica.
- [ ] AC-00969 — Dashboard: tiene loading state.
- [ ] AC-00970 — Dashboard: tiene error state.
- [ ] AC-00971 — Dashboard: tiene empty state.
- [ ] AC-00972 — Dashboard: tiene offline state cuando aplica.
- [ ] AC-00973 — Dashboard: tiene forbidden state.
- [ ] AC-00974 — Dashboard: tiene mensajes en español.
- [ ] AC-00975 — Dashboard: no muestra ObjectIds.
- [ ] AC-00976 — Dashboard: no introduce any.
- [ ] AC-00977 — Dashboard: no introduce casts inseguros.
- [ ] AC-00978 — Dashboard: no usa null como estado de negocio.
- [ ] AC-00979 — SLA: no duplica enums.
- [ ] AC-00980 — SLA: no duplica query keys.
- [ ] AC-00981 — SLA: tiene prueba unitaria.
- [ ] AC-00982 — SLA: tiene prueba de integración.
- [ ] AC-00983 — SLA: tiene prueba negativa.
- [ ] AC-00984 — SLA: tiene prueba E2E crítica.
- [ ] AC-00985 — SLA: tiene documentación actualizada.
- [ ] AC-00986 — SLA: tiene backup del archivo modificado.
- [ ] AC-00987 — SLA: pasa typecheck.
- [ ] AC-00988 — SLA: pasa lint sin warnings.
- [ ] AC-00989 — SLA: pasa build.
- [ ] AC-00990 — Dispatch: pasa verify.
- [ ] AC-00991 — Dispatch: respeta mobile-first.
- [ ] AC-00992 — Dispatch: respeta accesibilidad.
- [ ] AC-00993 — Dispatch: respeta privacidad.
- [ ] AC-00994 — Dispatch: respeta performance budget.
- [ ] AC-00995 — Dispatch: registra métricas verificables.
- [ ] AC-00996 — Dispatch: tiene fallback.
- [ ] AC-00997 — Dispatch: tiene estrategia de migración.
- [ ] AC-00998 — Dispatch: conserva compatibilidad.
- [ ] AC-00999 — Dispatch: no borra datos.
- [ ] AC-01000 — Dispatch: no ejecuta Git.
- [ ] AC-01001 — Notifications: tiene una fuente de verdad identificada.
- [ ] AC-01002 — Notifications: tiene owner definido.
- [ ] AC-01003 — Notifications: tiene alcance y fuera de alcance.
- [ ] AC-01004 — Notifications: tiene contrato versionado.
- [ ] AC-01005 — Notifications: tiene regla de dominio probada.
- [ ] AC-01006 — Notifications: tiene autorización backend.
- [ ] AC-01007 — Notifications: tiene auditoría.
- [ ] AC-01008 — Notifications: tiene idempotencia cuando aplica.
- [ ] AC-01009 — Notifications: tiene loading state.
- [ ] AC-01010 — Notifications: tiene error state.
- [ ] AC-01011 — Notifications: tiene empty state.
- [ ] AC-01012 — ClientPortal: tiene offline state cuando aplica.
- [ ] AC-01013 — ClientPortal: tiene forbidden state.
- [ ] AC-01014 — ClientPortal: tiene mensajes en español.
- [ ] AC-01015 — ClientPortal: no muestra ObjectIds.
- [ ] AC-01016 — ClientPortal: no introduce any.
- [ ] AC-01017 — ClientPortal: no introduce casts inseguros.
- [ ] AC-01018 — ClientPortal: no usa null como estado de negocio.
- [ ] AC-01019 — ClientPortal: no duplica enums.
- [ ] AC-01020 — ClientPortal: no duplica query keys.
- [ ] AC-01021 — ClientPortal: tiene prueba unitaria.
- [ ] AC-01022 — ClientPortal: tiene prueba de integración.
- [ ] AC-01023 — HistoricalArchive: tiene prueba negativa.
- [ ] AC-01024 — HistoricalArchive: tiene prueba E2E crítica.
- [ ] AC-01025 — HistoricalArchive: tiene documentación actualizada.
- [ ] AC-01026 — HistoricalArchive: tiene backup del archivo modificado.
- [ ] AC-01027 — HistoricalArchive: pasa typecheck.
- [ ] AC-01028 — HistoricalArchive: pasa lint sin warnings.
- [ ] AC-01029 — HistoricalArchive: pasa build.
- [ ] AC-01030 — HistoricalArchive: pasa verify.
- [ ] AC-01031 — HistoricalArchive: respeta mobile-first.
- [ ] AC-01032 — HistoricalArchive: respeta accesibilidad.
- [ ] AC-01033 — HistoricalArchive: respeta privacidad.
- [ ] AC-01034 — Backups: respeta performance budget.
- [ ] AC-01035 — Backups: registra métricas verificables.
- [ ] AC-01036 — Backups: tiene fallback.
- [ ] AC-01037 — Backups: tiene estrategia de migración.
- [ ] AC-01038 — Backups: conserva compatibilidad.
- [ ] AC-01039 — Backups: no borra datos.
- [ ] AC-01040 — Backups: no ejecuta Git.
- [ ] AC-01041 — Audit: tiene una fuente de verdad identificada.
- [ ] AC-01042 — Audit: tiene owner definido.
- [ ] AC-01043 — Audit: tiene alcance y fuera de alcance.
- [ ] AC-01044 — Audit: tiene contrato versionado.
- [ ] AC-01045 — Observability: tiene regla de dominio probada.
- [ ] AC-01046 — Observability: tiene autorización backend.
- [ ] AC-01047 — Observability: tiene auditoría.
- [ ] AC-01048 — Observability: tiene idempotencia cuando aplica.
- [ ] AC-01049 — Observability: tiene loading state.
- [ ] AC-01050 — Observability: tiene error state.
- [ ] AC-01051 — Observability: tiene empty state.
- [ ] AC-01052 — Observability: tiene offline state cuando aplica.
- [ ] AC-01053 — Observability: tiene forbidden state.
- [ ] AC-01054 — Observability: tiene mensajes en español.
- [ ] AC-01055 — Observability: no muestra ObjectIds.
- [ ] AC-01056 — Security: no introduce any.
- [ ] AC-01057 — Security: no introduce casts inseguros.
- [ ] AC-01058 — Security: no usa null como estado de negocio.
- [ ] AC-01059 — Security: no duplica enums.
- [ ] AC-01060 — Security: no duplica query keys.
- [ ] AC-01061 — Security: tiene prueba unitaria.
- [ ] AC-01062 — Security: tiene prueba de integración.
- [ ] AC-01063 — Security: tiene prueba negativa.
- [ ] AC-01064 — Security: tiene prueba E2E crítica.
- [ ] AC-01065 — Security: tiene documentación actualizada.
- [ ] AC-01066 — Security: tiene backup del archivo modificado.
- [ ] AC-01067 — Accessibility: pasa typecheck.
- [ ] AC-01068 — Accessibility: pasa lint sin warnings.
- [ ] AC-01069 — Accessibility: pasa build.
- [ ] AC-01070 — Accessibility: pasa verify.
- [ ] AC-01071 — Accessibility: respeta mobile-first.
- [ ] AC-01072 — Accessibility: respeta accesibilidad.
- [ ] AC-01073 — Accessibility: respeta privacidad.
- [ ] AC-01074 — Accessibility: respeta performance budget.
- [ ] AC-01075 — Accessibility: registra métricas verificables.
- [ ] AC-01076 — Accessibility: tiene fallback.
- [ ] AC-01077 — Accessibility: tiene estrategia de migración.
- [ ] AC-01078 — Performance: conserva compatibilidad.
- [ ] AC-01079 — Performance: no borra datos.
- [ ] AC-01080 — Performance: no ejecuta Git.
- [ ] AC-01081 — Testing: tiene una fuente de verdad identificada.
- [ ] AC-01082 — Testing: tiene owner definido.
- [ ] AC-01083 — Testing: tiene alcance y fuera de alcance.
- [ ] AC-01084 — Testing: tiene contrato versionado.
- [ ] AC-01085 — Testing: tiene regla de dominio probada.
- [ ] AC-01086 — Testing: tiene autorización backend.
- [ ] AC-01087 — Testing: tiene auditoría.
- [ ] AC-01088 — Testing: tiene idempotencia cuando aplica.
- [ ] AC-01089 — Documentation: tiene loading state.
- [ ] AC-01090 — Documentation: tiene error state.
- [ ] AC-01091 — Documentation: tiene empty state.
- [ ] AC-01092 — Documentation: tiene offline state cuando aplica.
- [ ] AC-01093 — Documentation: tiene forbidden state.
- [ ] AC-01094 — Documentation: tiene mensajes en español.
- [ ] AC-01095 — Documentation: no muestra ObjectIds.
- [ ] AC-01096 — Documentation: no introduce any.
- [ ] AC-01097 — Documentation: no introduce casts inseguros.
- [ ] AC-01098 — Documentation: no usa null como estado de negocio.
- [ ] AC-01099 — Documentation: no duplica enums.
- [ ] AC-01100 — Deployment: no duplica query keys.
- [ ] AC-01101 — Deployment: tiene prueba unitaria.
- [ ] AC-01102 — Deployment: tiene prueba de integración.
- [ ] AC-01103 — Deployment: tiene prueba negativa.
- [ ] AC-01104 — Deployment: tiene prueba E2E crítica.
- [ ] AC-01105 — Deployment: tiene documentación actualizada.
- [ ] AC-01106 — Deployment: tiene backup del archivo modificado.
- [ ] AC-01107 — Deployment: pasa typecheck.
- [ ] AC-01108 — Deployment: pasa lint sin warnings.
- [ ] AC-01109 — Deployment: pasa build.
- [ ] AC-01110 — Deployment: pasa verify.
- [ ] AC-01111 — Innovation: respeta mobile-first.
- [ ] AC-01112 — Innovation: respeta accesibilidad.
- [ ] AC-01113 — Innovation: respeta privacidad.
- [ ] AC-01114 — Innovation: respeta performance budget.
- [ ] AC-01115 — Innovation: registra métricas verificables.
- [ ] AC-01116 — Innovation: tiene fallback.
- [ ] AC-01117 — Innovation: tiene estrategia de migración.
- [ ] AC-01118 — Innovation: conserva compatibilidad.
- [ ] AC-01119 — Innovation: no borra datos.
- [ ] AC-01120 — Innovation: no ejecuta Git.
- [ ] AC-01121 — AIAdapter: tiene una fuente de verdad identificada.
- [ ] AC-01122 — Integrations: tiene owner definido.
- [ ] AC-01123 — Integrations: tiene alcance y fuera de alcance.
- [ ] AC-01124 — Integrations: tiene contrato versionado.
- [ ] AC-01125 — Integrations: tiene regla de dominio probada.
- [ ] AC-01126 — Integrations: tiene autorización backend.
- [ ] AC-01127 — Integrations: tiene auditoría.
- [ ] AC-01128 — Integrations: tiene idempotencia cuando aplica.
- [ ] AC-01129 — Integrations: tiene loading state.
- [ ] AC-01130 — Integrations: tiene error state.
- [ ] AC-01131 — Integrations: tiene empty state.
- [ ] AC-01132 — Integrations: tiene offline state cuando aplica.
- [ ] AC-01133 — ProductGovernance: tiene forbidden state.
- [ ] AC-01134 — ProductGovernance: tiene mensajes en español.
- [ ] AC-01135 — ProductGovernance: no muestra ObjectIds.
- [ ] AC-01136 — ProductGovernance: no introduce any.
- [ ] AC-01137 — ProductGovernance: no introduce casts inseguros.
- [ ] AC-01138 — ProductGovernance: no usa null como estado de negocio.
- [ ] AC-01139 — ProductGovernance: no duplica enums.
- [ ] AC-01140 — ProductGovernance: no duplica query keys.
- [ ] AC-01141 — ProductGovernance: tiene prueba unitaria.
- [ ] AC-01142 — ProductGovernance: tiene prueba de integración.
- [ ] AC-01143 — ProductGovernance: tiene prueba negativa.
- [ ] AC-01144 — SourceTraceability: tiene prueba E2E crítica.
- [ ] AC-01145 — SourceTraceability: tiene documentación actualizada.
- [ ] AC-01146 — SourceTraceability: tiene backup del archivo modificado.
- [ ] AC-01147 — SourceTraceability: pasa typecheck.
- [ ] AC-01148 — SourceTraceability: pasa lint sin warnings.
- [ ] AC-01149 — SourceTraceability: pasa build.
- [ ] AC-01150 — SourceTraceability: pasa verify.
- [ ] AC-01151 — SourceTraceability: respeta mobile-first.
- [ ] AC-01152 — SourceTraceability: respeta accesibilidad.
- [ ] AC-01153 — SourceTraceability: respeta privacidad.
- [ ] AC-01154 — SourceTraceability: respeta performance budget.
- [ ] AC-01155 — AgentCoordinator: registra métricas verificables.
- [ ] AC-01156 — AgentCoordinator: tiene fallback.
- [ ] AC-01157 — AgentCoordinator: tiene estrategia de migración.
- [ ] AC-01158 — AgentCoordinator: conserva compatibilidad.
- [ ] AC-01159 — AgentCoordinator: no borra datos.
- [ ] AC-01160 — AgentCoordinator: no ejecuta Git.
- [ ] AC-01161 — AgentHandoff: tiene una fuente de verdad identificada.
- [ ] AC-01162 — AgentHandoff: tiene owner definido.
- [ ] AC-01163 — AgentHandoff: tiene alcance y fuera de alcance.
- [ ] AC-01164 — AgentHandoff: tiene contrato versionado.
- [ ] AC-01165 — AgentHandoff: tiene regla de dominio probada.
- [ ] AC-01166 — SharedTypes: tiene autorización backend.
- [ ] AC-01167 — SharedTypes: tiene auditoría.
- [ ] AC-01168 — SharedTypes: tiene idempotencia cuando aplica.
- [ ] AC-01169 — SharedTypes: tiene loading state.
- [ ] AC-01170 — SharedTypes: tiene error state.
- [ ] AC-01171 — SharedTypes: tiene empty state.
- [ ] AC-01172 — SharedTypes: tiene offline state cuando aplica.
- [ ] AC-01173 — SharedTypes: tiene forbidden state.
- [ ] AC-01174 — SharedTypes: tiene mensajes en español.
- [ ] AC-01175 — SharedTypes: no muestra ObjectIds.
- [ ] AC-01176 — SharedTypes: no introduce any.
- [ ] AC-01177 — DomainFSM: no introduce casts inseguros.
- [ ] AC-01178 — DomainFSM: no usa null como estado de negocio.
- [ ] AC-01179 — DomainFSM: no duplica enums.
- [ ] AC-01180 — DomainFSM: no duplica query keys.
- [ ] AC-01181 — DomainFSM: tiene prueba unitaria.
- [ ] AC-01182 — DomainFSM: tiene prueba de integración.
- [ ] AC-01183 — DomainFSM: tiene prueba negativa.
- [ ] AC-01184 — DomainFSM: tiene prueba E2E crítica.
- [ ] AC-01185 — DomainFSM: tiene documentación actualizada.
- [ ] AC-01186 — DomainFSM: tiene backup del archivo modificado.
- [ ] AC-01187 — DomainFSM: pasa typecheck.
- [ ] AC-01188 — Config: pasa lint sin warnings.
- [ ] AC-01189 — Config: pasa build.
- [ ] AC-01190 — Config: pasa verify.
- [ ] AC-01191 — Config: respeta mobile-first.
- [ ] AC-01192 — Config: respeta accesibilidad.
- [ ] AC-01193 — Config: respeta privacidad.
- [ ] AC-01194 — Config: respeta performance budget.
- [ ] AC-01195 — Config: registra métricas verificables.
- [ ] AC-01196 — Config: tiene fallback.
- [ ] AC-01197 — Config: tiene estrategia de migración.
- [ ] AC-01198 — Config: conserva compatibilidad.
- [ ] AC-01199 — Auth: no borra datos.
- [ ] AC-01200 — Auth: no ejecuta Git.
- [ ] AC-01201 — Session: tiene una fuente de verdad identificada.
- [ ] AC-01202 — Session: tiene owner definido.
- [ ] AC-01203 — Session: tiene alcance y fuera de alcance.
- [ ] AC-01204 — Session: tiene contrato versionado.
- [ ] AC-01205 — Session: tiene regla de dominio probada.
- [ ] AC-01206 — Session: tiene autorización backend.
- [ ] AC-01207 — Session: tiene auditoría.
- [ ] AC-01208 — Session: tiene idempotencia cuando aplica.
- [ ] AC-01209 — Session: tiene loading state.
- [ ] AC-01210 — WebAuthn: tiene error state.
- [ ] AC-01211 — WebAuthn: tiene empty state.
- [ ] AC-01212 — WebAuthn: tiene offline state cuando aplica.
- [ ] AC-01213 — WebAuthn: tiene forbidden state.
- [ ] AC-01214 — WebAuthn: tiene mensajes en español.
- [ ] AC-01215 — WebAuthn: no muestra ObjectIds.
- [ ] AC-01216 — WebAuthn: no introduce any.
- [ ] AC-01217 — WebAuthn: no introduce casts inseguros.
- [ ] AC-01218 — WebAuthn: no usa null como estado de negocio.
- [ ] AC-01219 — WebAuthn: no duplica enums.
- [ ] AC-01220 — WebAuthn: no duplica query keys.
- [ ] AC-01221 — RBAC: tiene prueba unitaria.
- [ ] AC-01222 — RBAC: tiene prueba de integración.
- [ ] AC-01223 — RBAC: tiene prueba negativa.
- [ ] AC-01224 — RBAC: tiene prueba E2E crítica.
- [ ] AC-01225 — RBAC: tiene documentación actualizada.
- [ ] AC-01226 — RBAC: tiene backup del archivo modificado.
- [ ] AC-01227 — RBAC: pasa typecheck.
- [ ] AC-01228 — RBAC: pasa lint sin warnings.
- [ ] AC-01229 — RBAC: pasa build.
- [ ] AC-01230 — RBAC: pasa verify.
- [ ] AC-01231 — RBAC: respeta mobile-first.
- [ ] AC-01232 — Clients: respeta accesibilidad.
- [ ] AC-01233 — Clients: respeta privacidad.
- [ ] AC-01234 — Clients: respeta performance budget.
- [ ] AC-01235 — Clients: registra métricas verificables.
- [ ] AC-01236 — Clients: tiene fallback.
- [ ] AC-01237 — Clients: tiene estrategia de migración.
- [ ] AC-01238 — Clients: conserva compatibilidad.
- [ ] AC-01239 — Clients: no borra datos.
- [ ] AC-01240 — Clients: no ejecuta Git.
- [ ] AC-01241 — Sites: tiene una fuente de verdad identificada.
- [ ] AC-01242 — Sites: tiene owner definido.
- [ ] AC-01243 — Contacts: tiene alcance y fuera de alcance.
- [ ] AC-01244 — Contacts: tiene contrato versionado.
- [ ] AC-01245 — Contacts: tiene regla de dominio probada.
- [ ] AC-01246 — Contacts: tiene autorización backend.
- [ ] AC-01247 — Contacts: tiene auditoría.
- [ ] AC-01248 — Contacts: tiene idempotencia cuando aplica.
- [ ] AC-01249 — Contacts: tiene loading state.
- [ ] AC-01250 — Contacts: tiene error state.
- [ ] AC-01251 — Contacts: tiene empty state.
- [ ] AC-01252 — Contacts: tiene offline state cuando aplica.
- [ ] AC-01253 — Contacts: tiene forbidden state.
- [ ] AC-01254 — WorkRequests: tiene mensajes en español.
- [ ] AC-01255 — WorkRequests: no muestra ObjectIds.
- [ ] AC-01256 — WorkRequests: no introduce any.
- [ ] AC-01257 — WorkRequests: no introduce casts inseguros.
- [ ] AC-01258 — WorkRequests: no usa null como estado de negocio.
- [ ] AC-01259 — WorkRequests: no duplica enums.
- [ ] AC-01260 — WorkRequests: no duplica query keys.
- [ ] AC-01261 — WorkRequests: tiene prueba unitaria.
- [ ] AC-01262 — WorkRequests: tiene prueba de integración.
- [ ] AC-01263 — WorkRequests: tiene prueba negativa.
- [ ] AC-01264 — WorkRequests: tiene prueba E2E crítica.
- [ ] AC-01265 — SiteVisits: tiene documentación actualizada.
- [ ] AC-01266 — SiteVisits: tiene backup del archivo modificado.
- [ ] AC-01267 — SiteVisits: pasa typecheck.
- [ ] AC-01268 — SiteVisits: pasa lint sin warnings.
- [ ] AC-01269 — SiteVisits: pasa build.
- [ ] AC-01270 — SiteVisits: pasa verify.
- [ ] AC-01271 — SiteVisits: respeta mobile-first.
- [ ] AC-01272 — SiteVisits: respeta accesibilidad.
- [ ] AC-01273 — SiteVisits: respeta privacidad.
- [ ] AC-01274 — SiteVisits: respeta performance budget.
- [ ] AC-01275 — SiteVisits: registra métricas verificables.
- [ ] AC-01276 — Proposals: tiene fallback.
- [ ] AC-01277 — Proposals: tiene estrategia de migración.
- [ ] AC-01278 — Proposals: conserva compatibilidad.
- [ ] AC-01279 — Proposals: no borra datos.
- [ ] AC-01280 — Proposals: no ejecuta Git.
- [ ] AC-01281 — PurchaseOrders: tiene una fuente de verdad identificada.
- [ ] AC-01282 — PurchaseOrders: tiene owner definido.
- [ ] AC-01283 — PurchaseOrders: tiene alcance y fuera de alcance.
- [ ] AC-01284 — PurchaseOrders: tiene contrato versionado.
- [ ] AC-01285 — PurchaseOrders: tiene regla de dominio probada.
- [ ] AC-01286 — PurchaseOrders: tiene autorización backend.
- [ ] AC-01287 — ServiceCases: tiene auditoría.
- [ ] AC-01288 — ServiceCases: tiene idempotencia cuando aplica.
- [ ] AC-01289 — ServiceCases: tiene loading state.
- [ ] AC-01290 — ServiceCases: tiene error state.
- [ ] AC-01291 — ServiceCases: tiene empty state.
- [ ] AC-01292 — ServiceCases: tiene offline state cuando aplica.
- [ ] AC-01293 — ServiceCases: tiene forbidden state.
- [ ] AC-01294 — ServiceCases: tiene mensajes en español.
- [ ] AC-01295 — ServiceCases: no muestra ObjectIds.
- [ ] AC-01296 — ServiceCases: no introduce any.
- [ ] AC-01297 — ServiceCases: no introduce casts inseguros.
- [ ] AC-01298 — WorkOrders: no usa null como estado de negocio.
- [ ] AC-01299 — WorkOrders: no duplica enums.
- [ ] AC-01300 — WorkOrders: no duplica query keys.
- [ ] AC-01301 — WorkOrders: tiene prueba unitaria.
- [ ] AC-01302 — WorkOrders: tiene prueba de integración.
- [ ] AC-01303 — WorkOrders: tiene prueba negativa.
- [ ] AC-01304 — WorkOrders: tiene prueba E2E crítica.
- [ ] AC-01305 — WorkOrders: tiene documentación actualizada.
- [ ] AC-01306 — WorkOrders: tiene backup del archivo modificado.
- [ ] AC-01307 — WorkOrders: pasa typecheck.
- [ ] AC-01308 — WorkOrders: pasa lint sin warnings.
- [ ] AC-01309 — PlanningPackets: pasa build.
- [ ] AC-01310 — PlanningPackets: pasa verify.
- [ ] AC-01311 — PlanningPackets: respeta mobile-first.
- [ ] AC-01312 — PlanningPackets: respeta accesibilidad.
- [ ] AC-01313 — PlanningPackets: respeta privacidad.
- [ ] AC-01314 — PlanningPackets: respeta performance budget.
- [ ] AC-01315 — PlanningPackets: registra métricas verificables.
- [ ] AC-01316 — PlanningPackets: tiene fallback.
- [ ] AC-01317 — PlanningPackets: tiene estrategia de migración.
- [ ] AC-01318 — PlanningPackets: conserva compatibilidad.
- [ ] AC-01319 — PlanningPackets: no borra datos.
- [ ] AC-01320 — Kits: no ejecuta Git.
- [ ] AC-01321 — Safety: tiene una fuente de verdad identificada.
- [ ] AC-01322 — Safety: tiene owner definido.
- [ ] AC-01323 — Safety: tiene alcance y fuera de alcance.
- [ ] AC-01324 — Safety: tiene contrato versionado.
- [ ] AC-01325 — Safety: tiene regla de dominio probada.
- [ ] AC-01326 — Safety: tiene autorización backend.
- [ ] AC-01327 — Safety: tiene auditoría.
- [ ] AC-01328 — Safety: tiene idempotencia cuando aplica.
- [ ] AC-01329 — Safety: tiene loading state.
- [ ] AC-01330 — Safety: tiene error state.
- [ ] AC-01331 — ExecutionSessions: tiene empty state.
- [ ] AC-01332 — ExecutionSessions: tiene offline state cuando aplica.
- [ ] AC-01333 — ExecutionSessions: tiene forbidden state.
- [ ] AC-01334 — ExecutionSessions: tiene mensajes en español.
- [ ] AC-01335 — ExecutionSessions: no muestra ObjectIds.
- [ ] AC-01336 — ExecutionSessions: no introduce any.
- [ ] AC-01337 — ExecutionSessions: no introduce casts inseguros.
- [ ] AC-01338 — ExecutionSessions: no usa null como estado de negocio.
- [ ] AC-01339 — ExecutionSessions: no duplica enums.
- [ ] AC-01340 — ExecutionSessions: no duplica query keys.
- [ ] AC-01341 — ExecutionSessions: tiene prueba unitaria.
- [ ] AC-01342 — OfflineQueue: tiene prueba de integración.
- [ ] AC-01343 — OfflineQueue: tiene prueba negativa.
- [ ] AC-01344 — OfflineQueue: tiene prueba E2E crítica.
- [ ] AC-01345 — OfflineQueue: tiene documentación actualizada.
- [ ] AC-01346 — OfflineQueue: tiene backup del archivo modificado.
- [ ] AC-01347 — OfflineQueue: pasa typecheck.
- [ ] AC-01348 — OfflineQueue: pasa lint sin warnings.
- [ ] AC-01349 — OfflineQueue: pasa build.
- [ ] AC-01350 — OfflineQueue: pasa verify.
- [ ] AC-01351 — OfflineQueue: respeta mobile-first.
- [ ] AC-01352 — OfflineQueue: respeta accesibilidad.
- [ ] AC-01353 — SyncConflicts: respeta privacidad.
- [ ] AC-01354 — SyncConflicts: respeta performance budget.
- [ ] AC-01355 — SyncConflicts: registra métricas verificables.
- [ ] AC-01356 — SyncConflicts: tiene fallback.
- [ ] AC-01357 — SyncConflicts: tiene estrategia de migración.
- [ ] AC-01358 — SyncConflicts: conserva compatibilidad.
- [ ] AC-01359 — SyncConflicts: no borra datos.
- [ ] AC-01360 — SyncConflicts: no ejecuta Git.
- [ ] AC-01361 — Evidences: tiene una fuente de verdad identificada.
- [ ] AC-01362 — Evidences: tiene owner definido.
- [ ] AC-01363 — Evidences: tiene alcance y fuera de alcance.
- [ ] AC-01364 — FileAssets: tiene contrato versionado.
- [ ] AC-01365 — FileAssets: tiene regla de dominio probada.
- [ ] AC-01366 — FileAssets: tiene autorización backend.
- [ ] AC-01367 — FileAssets: tiene auditoría.
- [ ] AC-01368 — FileAssets: tiene idempotencia cuando aplica.
- [ ] AC-01369 — FileAssets: tiene loading state.
- [ ] AC-01370 — FileAssets: tiene error state.
- [ ] AC-01371 — FileAssets: tiene empty state.
- [ ] AC-01372 — FileAssets: tiene offline state cuando aplica.
- [ ] AC-01373 — FileAssets: tiene forbidden state.
- [ ] AC-01374 — FileAssets: tiene mensajes en español.
- [ ] AC-01375 — LineInspection: no muestra ObjectIds.
- [ ] AC-01376 — LineInspection: no introduce any.
- [ ] AC-01377 — LineInspection: no introduce casts inseguros.
- [ ] AC-01378 — LineInspection: no usa null como estado de negocio.
- [ ] AC-01379 — LineInspection: no duplica enums.
- [ ] AC-01380 — LineInspection: no duplica query keys.
- [ ] AC-01381 — LineInspection: tiene prueba unitaria.
- [ ] AC-01382 — LineInspection: tiene prueba de integración.
- [ ] AC-01383 — LineInspection: tiene prueba negativa.
- [ ] AC-01384 — LineInspection: tiene prueba E2E crítica.
- [ ] AC-01385 — LineInspection: tiene documentación actualizada.
- [ ] AC-01386 — CCTV: tiene backup del archivo modificado.
- [ ] AC-01387 — CCTV: pasa typecheck.
- [ ] AC-01388 — CCTV: pasa lint sin warnings.
- [ ] AC-01389 — CCTV: pasa build.
- [ ] AC-01390 — CCTV: pasa verify.
- [ ] AC-01391 — CCTV: respeta mobile-first.
- [ ] AC-01392 — CCTV: respeta accesibilidad.
- [ ] AC-01393 — CCTV: respeta privacidad.
- [ ] AC-01394 — CCTV: respeta performance budget.
- [ ] AC-01395 — CCTV: registra métricas verificables.
- [ ] AC-01396 — CCTV: tiene fallback.
- [ ] AC-01397 — TechnicalReports: tiene estrategia de migración.
- [ ] AC-01398 — TechnicalReports: conserva compatibilidad.
- [ ] AC-01399 — TechnicalReports: no borra datos.
- [ ] AC-01400 — TechnicalReports: no ejecuta Git.
- [ ] AC-01401 — DynamicForms: tiene una fuente de verdad identificada.
- [ ] AC-01402 — DynamicForms: tiene owner definido.
- [ ] AC-01403 — DynamicForms: tiene alcance y fuera de alcance.
- [ ] AC-01404 — DynamicForms: tiene contrato versionado.
- [ ] AC-01405 — DynamicForms: tiene regla de dominio probada.
- [ ] AC-01406 — DynamicForms: tiene autorización backend.
- [ ] AC-01407 — DynamicForms: tiene auditoría.
- [ ] AC-01408 — DeliveryRecords: tiene idempotencia cuando aplica.
- [ ] AC-01409 — DeliveryRecords: tiene loading state.
- [ ] AC-01410 — DeliveryRecords: tiene error state.
- [ ] AC-01411 — DeliveryRecords: tiene empty state.
- [ ] AC-01412 — DeliveryRecords: tiene offline state cuando aplica.
- [ ] AC-01413 — DeliveryRecords: tiene forbidden state.
- [ ] AC-01414 — DeliveryRecords: tiene mensajes en español.
- [ ] AC-01415 — DeliveryRecords: no muestra ObjectIds.
- [ ] AC-01416 — DeliveryRecords: no introduce any.
- [ ] AC-01417 — DeliveryRecords: no introduce casts inseguros.
- [ ] AC-01418 — DeliveryRecords: no usa null como estado de negocio.
- [ ] AC-01419 — ClientAcceptance: no duplica enums.
- [ ] AC-01420 — ClientAcceptance: no duplica query keys.
- [ ] AC-01421 — ClientAcceptance: tiene prueba unitaria.
- [ ] AC-01422 — ClientAcceptance: tiene prueba de integración.
- [ ] AC-01423 — ClientAcceptance: tiene prueba negativa.
- [ ] AC-01424 — ClientAcceptance: tiene prueba E2E crítica.
- [ ] AC-01425 — ClientAcceptance: tiene documentación actualizada.
- [ ] AC-01426 — ClientAcceptance: tiene backup del archivo modificado.
- [ ] AC-01427 — ClientAcceptance: pasa typecheck.
- [ ] AC-01428 — ClientAcceptance: pasa lint sin warnings.
- [ ] AC-01429 — ClientAcceptance: pasa build.
- [ ] AC-01430 — SES: pasa verify.
- [ ] AC-01431 — SES: respeta mobile-first.
- [ ] AC-01432 — SES: respeta accesibilidad.
- [ ] AC-01433 — SES: respeta privacidad.
- [ ] AC-01434 — SES: respeta performance budget.
- [ ] AC-01435 — SES: registra métricas verificables.
- [ ] AC-01436 — SES: tiene fallback.
- [ ] AC-01437 — SES: tiene estrategia de migración.
- [ ] AC-01438 — SES: conserva compatibilidad.
- [ ] AC-01439 — SES: no borra datos.
- [ ] AC-01440 — SES: no ejecuta Git.
- [ ] AC-01441 — SESApproval: tiene una fuente de verdad identificada.
- [ ] AC-01442 — SESApproval: tiene owner definido.
- [ ] AC-01443 — SESApproval: tiene alcance y fuera de alcance.
- [ ] AC-01444 — SESApproval: tiene contrato versionado.
- [ ] AC-01445 — SESApproval: tiene regla de dominio probada.
- [ ] AC-01446 — SESApproval: tiene autorización backend.
- [ ] AC-01447 — SESApproval: tiene auditoría.
- [ ] AC-01448 — SESApproval: tiene idempotencia cuando aplica.
- [ ] AC-01449 — SESApproval: tiene loading state.
- [ ] AC-01450 — SESApproval: tiene error state.
- [ ] AC-01451 — SESApproval: tiene empty state.
- [ ] AC-01452 — Invoices: tiene offline state cuando aplica.
- [ ] AC-01453 — Invoices: tiene forbidden state.
- [ ] AC-01454 — Invoices: tiene mensajes en español.
- [ ] AC-01455 — Invoices: no muestra ObjectIds.
- [ ] AC-01456 — Invoices: no introduce any.
- [ ] AC-01457 — Invoices: no introduce casts inseguros.
- [ ] AC-01458 — Invoices: no usa null como estado de negocio.
- [ ] AC-01459 — Invoices: no duplica enums.
- [ ] AC-01460 — Invoices: no duplica query keys.
- [ ] AC-01461 — Invoices: tiene prueba unitaria.
- [ ] AC-01462 — Invoices: tiene prueba de integración.
- [ ] AC-01463 — InvoiceApproval: tiene prueba negativa.
- [ ] AC-01464 — InvoiceApproval: tiene prueba E2E crítica.
- [ ] AC-01465 — InvoiceApproval: tiene documentación actualizada.
- [ ] AC-01466 — InvoiceApproval: tiene backup del archivo modificado.
- [ ] AC-01467 — InvoiceApproval: pasa typecheck.
- [ ] AC-01468 — InvoiceApproval: pasa lint sin warnings.
- [ ] AC-01469 — InvoiceApproval: pasa build.
- [ ] AC-01470 — InvoiceApproval: pasa verify.
- [ ] AC-01471 — InvoiceApproval: respeta mobile-first.
- [ ] AC-01472 — InvoiceApproval: respeta accesibilidad.
- [ ] AC-01473 — InvoiceApproval: respeta privacidad.
- [ ] AC-01474 — Payments: respeta performance budget.
- [ ] AC-01475 — Payments: registra métricas verificables.
- [ ] AC-01476 — Payments: tiene fallback.
- [ ] AC-01477 — Payments: tiene estrategia de migración.
- [ ] AC-01478 — Payments: conserva compatibilidad.
- [ ] AC-01479 — Payments: no borra datos.
- [ ] AC-01480 — Payments: no ejecuta Git.
- [ ] AC-01481 — Closure: tiene una fuente de verdad identificada.
- [ ] AC-01482 — Closure: tiene owner definido.
- [ ] AC-01483 — Closure: tiene alcance y fuera de alcance.
- [ ] AC-01484 — Closure: tiene contrato versionado.
- [ ] AC-01485 — Costs: tiene regla de dominio probada.
- [ ] AC-01486 — Costs: tiene autorización backend.
- [ ] AC-01487 — Costs: tiene auditoría.
- [ ] AC-01488 — Costs: tiene idempotencia cuando aplica.
- [ ] AC-01489 — Costs: tiene loading state.
- [ ] AC-01490 — Costs: tiene error state.
- [ ] AC-01491 — Costs: tiene empty state.
- [ ] AC-01492 — Costs: tiene offline state cuando aplica.
- [ ] AC-01493 — Costs: tiene forbidden state.
- [ ] AC-01494 — Costs: tiene mensajes en español.
- [ ] AC-01495 — Costs: no muestra ObjectIds.
- [ ] AC-01496 — Inventory: no introduce any.
- [ ] AC-01497 — Inventory: no introduce casts inseguros.
- [ ] AC-01498 — Inventory: no usa null como estado de negocio.
- [ ] AC-01499 — Inventory: no duplica enums.
- [ ] AC-01500 — Inventory: no duplica query keys.
- [ ] AC-01501 — Inventory: tiene prueba unitaria.
- [ ] AC-01502 — Inventory: tiene prueba de integración.
- [ ] AC-01503 — Inventory: tiene prueba negativa.
- [ ] AC-01504 — Inventory: tiene prueba E2E crítica.
- [ ] AC-01505 — Inventory: tiene documentación actualizada.
- [ ] AC-01506 — Inventory: tiene backup del archivo modificado.
- [ ] AC-01507 — Tools: pasa typecheck.
- [ ] AC-01508 — Tools: pasa lint sin warnings.
- [ ] AC-01509 — Tools: pasa build.
- [ ] AC-01510 — Tools: pasa verify.
- [ ] AC-01511 — Tools: respeta mobile-first.
- [ ] AC-01512 — Tools: respeta accesibilidad.
- [ ] AC-01513 — Tools: respeta privacidad.
- [ ] AC-01514 — Tools: respeta performance budget.
- [ ] AC-01515 — Tools: registra métricas verificables.
- [ ] AC-01516 — Tools: tiene fallback.
- [ ] AC-01517 — Tools: tiene estrategia de migración.
- [ ] AC-01518 — Fleet: conserva compatibilidad.
- [ ] AC-01519 — Fleet: no borra datos.
- [ ] AC-01520 — Fleet: no ejecuta Git.
- [ ] AC-01521 — Assets: tiene una fuente de verdad identificada.
- [ ] AC-01522 — Assets: tiene owner definido.
- [ ] AC-01523 — Assets: tiene alcance y fuera de alcance.
- [ ] AC-01524 — Assets: tiene contrato versionado.
- [ ] AC-01525 — Assets: tiene regla de dominio probada.
- [ ] AC-01526 — Assets: tiene autorización backend.
- [ ] AC-01527 — Assets: tiene auditoría.
- [ ] AC-01528 — Assets: tiene idempotencia cuando aplica.
- [ ] AC-01529 — Maintenance: tiene loading state.
- [ ] AC-01530 — Maintenance: tiene error state.
- [ ] AC-01531 — Maintenance: tiene empty state.
- [ ] AC-01532 — Maintenance: tiene offline state cuando aplica.
- [ ] AC-01533 — Maintenance: tiene forbidden state.
- [ ] AC-01534 — Maintenance: tiene mensajes en español.
- [ ] AC-01535 — Maintenance: no muestra ObjectIds.
- [ ] AC-01536 — Maintenance: no introduce any.
- [ ] AC-01537 — Maintenance: no introduce casts inseguros.
- [ ] AC-01538 — Maintenance: no usa null como estado de negocio.
- [ ] AC-01539 — Maintenance: no duplica enums.
- [ ] AC-01540 — Dashboard: no duplica query keys.
- [ ] AC-01541 — Dashboard: tiene prueba unitaria.
- [ ] AC-01542 — Dashboard: tiene prueba de integración.
- [ ] AC-01543 — Dashboard: tiene prueba negativa.
- [ ] AC-01544 — Dashboard: tiene prueba E2E crítica.
- [ ] AC-01545 — Dashboard: tiene documentación actualizada.
- [ ] AC-01546 — Dashboard: tiene backup del archivo modificado.
- [ ] AC-01547 — Dashboard: pasa typecheck.
- [ ] AC-01548 — Dashboard: pasa lint sin warnings.
- [ ] AC-01549 — Dashboard: pasa build.
- [ ] AC-01550 — Dashboard: pasa verify.
- [ ] AC-01551 — SLA: respeta mobile-first.
- [ ] AC-01552 — SLA: respeta accesibilidad.
- [ ] AC-01553 — SLA: respeta privacidad.
- [ ] AC-01554 — SLA: respeta performance budget.
- [ ] AC-01555 — SLA: registra métricas verificables.
- [ ] AC-01556 — SLA: tiene fallback.
- [ ] AC-01557 — SLA: tiene estrategia de migración.
- [ ] AC-01558 — SLA: conserva compatibilidad.
- [ ] AC-01559 — SLA: no borra datos.
- [ ] AC-01560 — SLA: no ejecuta Git.
- [ ] AC-01561 — Dispatch: tiene una fuente de verdad identificada.
- [ ] AC-01562 — Notifications: tiene owner definido.
- [ ] AC-01563 — Notifications: tiene alcance y fuera de alcance.
- [ ] AC-01564 — Notifications: tiene contrato versionado.
- [ ] AC-01565 — Notifications: tiene regla de dominio probada.
- [ ] AC-01566 — Notifications: tiene autorización backend.
- [ ] AC-01567 — Notifications: tiene auditoría.
- [ ] AC-01568 — Notifications: tiene idempotencia cuando aplica.
- [ ] AC-01569 — Notifications: tiene loading state.
- [ ] AC-01570 — Notifications: tiene error state.
- [ ] AC-01571 — Notifications: tiene empty state.
- [ ] AC-01572 — Notifications: tiene offline state cuando aplica.
- [ ] AC-01573 — ClientPortal: tiene forbidden state.
- [ ] AC-01574 — ClientPortal: tiene mensajes en español.
- [ ] AC-01575 — ClientPortal: no muestra ObjectIds.
- [ ] AC-01576 — ClientPortal: no introduce any.
- [ ] AC-01577 — ClientPortal: no introduce casts inseguros.
- [ ] AC-01578 — ClientPortal: no usa null como estado de negocio.
- [ ] AC-01579 — ClientPortal: no duplica enums.
- [ ] AC-01580 — ClientPortal: no duplica query keys.
- [ ] AC-01581 — ClientPortal: tiene prueba unitaria.
- [ ] AC-01582 — ClientPortal: tiene prueba de integración.
- [ ] AC-01583 — ClientPortal: tiene prueba negativa.
- [ ] AC-01584 — HistoricalArchive: tiene prueba E2E crítica.
- [ ] AC-01585 — HistoricalArchive: tiene documentación actualizada.
- [ ] AC-01586 — HistoricalArchive: tiene backup del archivo modificado.
- [ ] AC-01587 — HistoricalArchive: pasa typecheck.
- [ ] AC-01588 — HistoricalArchive: pasa lint sin warnings.
- [ ] AC-01589 — HistoricalArchive: pasa build.
- [ ] AC-01590 — HistoricalArchive: pasa verify.
- [ ] AC-01591 — HistoricalArchive: respeta mobile-first.
- [ ] AC-01592 — HistoricalArchive: respeta accesibilidad.
- [ ] AC-01593 — HistoricalArchive: respeta privacidad.
- [ ] AC-01594 — HistoricalArchive: respeta performance budget.
- [ ] AC-01595 — Backups: registra métricas verificables.
- [ ] AC-01596 — Backups: tiene fallback.
- [ ] AC-01597 — Backups: tiene estrategia de migración.
- [ ] AC-01598 — Backups: conserva compatibilidad.
- [ ] AC-01599 — Backups: no borra datos.
- [ ] AC-01600 — Backups: no ejecuta Git.
- [ ] AC-01601 — Audit: tiene una fuente de verdad identificada.
- [ ] AC-01602 — Audit: tiene owner definido.
- [ ] AC-01603 — Audit: tiene alcance y fuera de alcance.
- [ ] AC-01604 — Audit: tiene contrato versionado.
- [ ] AC-01605 — Audit: tiene regla de dominio probada.
- [ ] AC-01606 — Observability: tiene autorización backend.
- [ ] AC-01607 — Observability: tiene auditoría.
- [ ] AC-01608 — Observability: tiene idempotencia cuando aplica.
- [ ] AC-01609 — Observability: tiene loading state.
- [ ] AC-01610 — Observability: tiene error state.
- [ ] AC-01611 — Observability: tiene empty state.
- [ ] AC-01612 — Observability: tiene offline state cuando aplica.
- [ ] AC-01613 — Observability: tiene forbidden state.
- [ ] AC-01614 — Observability: tiene mensajes en español.
- [ ] AC-01615 — Observability: no muestra ObjectIds.
- [ ] AC-01616 — Observability: no introduce any.
- [ ] AC-01617 — Security: no introduce casts inseguros.
- [ ] AC-01618 — Security: no usa null como estado de negocio.
- [ ] AC-01619 — Security: no duplica enums.
- [ ] AC-01620 — Security: no duplica query keys.
- [ ] AC-01621 — Security: tiene prueba unitaria.
- [ ] AC-01622 — Security: tiene prueba de integración.
- [ ] AC-01623 — Security: tiene prueba negativa.
- [ ] AC-01624 — Security: tiene prueba E2E crítica.
- [ ] AC-01625 — Security: tiene documentación actualizada.
- [ ] AC-01626 — Security: tiene backup del archivo modificado.
- [ ] AC-01627 — Security: pasa typecheck.
- [ ] AC-01628 — Accessibility: pasa lint sin warnings.
- [ ] AC-01629 — Accessibility: pasa build.
- [ ] AC-01630 — Accessibility: pasa verify.
- [ ] AC-01631 — Accessibility: respeta mobile-first.
- [ ] AC-01632 — Accessibility: respeta accesibilidad.
- [ ] AC-01633 — Accessibility: respeta privacidad.
- [ ] AC-01634 — Accessibility: respeta performance budget.
- [ ] AC-01635 — Accessibility: registra métricas verificables.
- [ ] AC-01636 — Accessibility: tiene fallback.
- [ ] AC-01637 — Accessibility: tiene estrategia de migración.
- [ ] AC-01638 — Accessibility: conserva compatibilidad.
- [ ] AC-01639 — Performance: no borra datos.
- [ ] AC-01640 — Performance: no ejecuta Git.
- [ ] AC-01641 — Testing: tiene una fuente de verdad identificada.
- [ ] AC-01642 — Testing: tiene owner definido.
- [ ] AC-01643 — Testing: tiene alcance y fuera de alcance.
- [ ] AC-01644 — Testing: tiene contrato versionado.
- [ ] AC-01645 — Testing: tiene regla de dominio probada.
- [ ] AC-01646 — Testing: tiene autorización backend.
- [ ] AC-01647 — Testing: tiene auditoría.
- [ ] AC-01648 — Testing: tiene idempotencia cuando aplica.
- [ ] AC-01649 — Testing: tiene loading state.
- [ ] AC-01650 — Documentation: tiene error state.
- [ ] AC-01651 — Documentation: tiene empty state.
- [ ] AC-01652 — Documentation: tiene offline state cuando aplica.
- [ ] AC-01653 — Documentation: tiene forbidden state.
- [ ] AC-01654 — Documentation: tiene mensajes en español.
- [ ] AC-01655 — Documentation: no muestra ObjectIds.
- [ ] AC-01656 — Documentation: no introduce any.
- [ ] AC-01657 — Documentation: no introduce casts inseguros.
- [ ] AC-01658 — Documentation: no usa null como estado de negocio.
- [ ] AC-01659 — Documentation: no duplica enums.
- [ ] AC-01660 — Documentation: no duplica query keys.
- [ ] AC-01661 — Deployment: tiene prueba unitaria.
- [ ] AC-01662 — Deployment: tiene prueba de integración.
- [ ] AC-01663 — Deployment: tiene prueba negativa.
- [ ] AC-01664 — Deployment: tiene prueba E2E crítica.
- [ ] AC-01665 — Deployment: tiene documentación actualizada.
- [ ] AC-01666 — Deployment: tiene backup del archivo modificado.
- [ ] AC-01667 — Deployment: pasa typecheck.
- [ ] AC-01668 — Deployment: pasa lint sin warnings.
- [ ] AC-01669 — Deployment: pasa build.
- [ ] AC-01670 — Deployment: pasa verify.
- [ ] AC-01671 — Deployment: respeta mobile-first.
- [ ] AC-01672 — Innovation: respeta accesibilidad.
- [ ] AC-01673 — Innovation: respeta privacidad.
- [ ] AC-01674 — Innovation: respeta performance budget.
- [ ] AC-01675 — Innovation: registra métricas verificables.
- [ ] AC-01676 — Innovation: tiene fallback.
- [ ] AC-01677 — Innovation: tiene estrategia de migración.
- [ ] AC-01678 — Innovation: conserva compatibilidad.
- [ ] AC-01679 — Innovation: no borra datos.
- [ ] AC-01680 — Innovation: no ejecuta Git.
- [ ] AC-01681 — AIAdapter: tiene una fuente de verdad identificada.
- [ ] AC-01682 — AIAdapter: tiene owner definido.
- [ ] AC-01683 — Integrations: tiene alcance y fuera de alcance.
- [ ] AC-01684 — Integrations: tiene contrato versionado.
- [ ] AC-01685 — Integrations: tiene regla de dominio probada.
- [ ] AC-01686 — Integrations: tiene autorización backend.
- [ ] AC-01687 — Integrations: tiene auditoría.
- [ ] AC-01688 — Integrations: tiene idempotencia cuando aplica.
- [ ] AC-01689 — Integrations: tiene loading state.
- [ ] AC-01690 — Integrations: tiene error state.
- [ ] AC-01691 — Integrations: tiene empty state.
- [ ] AC-01692 — Integrations: tiene offline state cuando aplica.
- [ ] AC-01693 — Integrations: tiene forbidden state.
- [ ] AC-01694 — ProductGovernance: tiene mensajes en español.
- [ ] AC-01695 — ProductGovernance: no muestra ObjectIds.
- [ ] AC-01696 — ProductGovernance: no introduce any.
- [ ] AC-01697 — ProductGovernance: no introduce casts inseguros.
- [ ] AC-01698 — ProductGovernance: no usa null como estado de negocio.
- [ ] AC-01699 — ProductGovernance: no duplica enums.
- [ ] AC-01700 — ProductGovernance: no duplica query keys.
- [ ] AC-01701 — ProductGovernance: tiene prueba unitaria.
- [ ] AC-01702 — ProductGovernance: tiene prueba de integración.
- [ ] AC-01703 — ProductGovernance: tiene prueba negativa.
- [ ] AC-01704 — ProductGovernance: tiene prueba E2E crítica.
- [ ] AC-01705 — SourceTraceability: tiene documentación actualizada.
- [ ] AC-01706 — SourceTraceability: tiene backup del archivo modificado.
- [ ] AC-01707 — SourceTraceability: pasa typecheck.
- [ ] AC-01708 — SourceTraceability: pasa lint sin warnings.
- [ ] AC-01709 — SourceTraceability: pasa build.
- [ ] AC-01710 — SourceTraceability: pasa verify.
- [ ] AC-01711 — SourceTraceability: respeta mobile-first.
- [ ] AC-01712 — SourceTraceability: respeta accesibilidad.
- [ ] AC-01713 — SourceTraceability: respeta privacidad.
- [ ] AC-01714 — SourceTraceability: respeta performance budget.
- [ ] AC-01715 — SourceTraceability: registra métricas verificables.
- [ ] AC-01716 — AgentCoordinator: tiene fallback.
- [ ] AC-01717 — AgentCoordinator: tiene estrategia de migración.
- [ ] AC-01718 — AgentCoordinator: conserva compatibilidad.
- [ ] AC-01719 — AgentCoordinator: no borra datos.
- [ ] AC-01720 — AgentCoordinator: no ejecuta Git.
- [ ] AC-01721 — AgentHandoff: tiene una fuente de verdad identificada.
- [ ] AC-01722 — AgentHandoff: tiene owner definido.
- [ ] AC-01723 — AgentHandoff: tiene alcance y fuera de alcance.
- [ ] AC-01724 — AgentHandoff: tiene contrato versionado.
- [ ] AC-01725 — AgentHandoff: tiene regla de dominio probada.
- [ ] AC-01726 — AgentHandoff: tiene autorización backend.
- [ ] AC-01727 — SharedTypes: tiene auditoría.
- [ ] AC-01728 — SharedTypes: tiene idempotencia cuando aplica.
- [ ] AC-01729 — SharedTypes: tiene loading state.
- [ ] AC-01730 — SharedTypes: tiene error state.
- [ ] AC-01731 — SharedTypes: tiene empty state.
- [ ] AC-01732 — SharedTypes: tiene offline state cuando aplica.
- [ ] AC-01733 — SharedTypes: tiene forbidden state.
- [ ] AC-01734 — SharedTypes: tiene mensajes en español.
- [ ] AC-01735 — SharedTypes: no muestra ObjectIds.
- [ ] AC-01736 — SharedTypes: no introduce any.
- [ ] AC-01737 — SharedTypes: no introduce casts inseguros.
- [ ] AC-01738 — DomainFSM: no usa null como estado de negocio.
- [ ] AC-01739 — DomainFSM: no duplica enums.
- [ ] AC-01740 — DomainFSM: no duplica query keys.
- [ ] AC-01741 — DomainFSM: tiene prueba unitaria.
- [ ] AC-01742 — DomainFSM: tiene prueba de integración.
- [ ] AC-01743 — DomainFSM: tiene prueba negativa.
- [ ] AC-01744 — DomainFSM: tiene prueba E2E crítica.
- [ ] AC-01745 — DomainFSM: tiene documentación actualizada.
- [ ] AC-01746 — DomainFSM: tiene backup del archivo modificado.
- [ ] AC-01747 — DomainFSM: pasa typecheck.
- [ ] AC-01748 — DomainFSM: pasa lint sin warnings.
- [ ] AC-01749 — Config: pasa build.
- [ ] AC-01750 — Config: pasa verify.
- [ ] AC-01751 — Config: respeta mobile-first.
- [ ] AC-01752 — Config: respeta accesibilidad.
- [ ] AC-01753 — Config: respeta privacidad.
- [ ] AC-01754 — Config: respeta performance budget.
- [ ] AC-01755 — Config: registra métricas verificables.
- [ ] AC-01756 — Config: tiene fallback.
- [ ] AC-01757 — Config: tiene estrategia de migración.
- [ ] AC-01758 — Config: conserva compatibilidad.
- [ ] AC-01759 — Config: no borra datos.
- [ ] AC-01760 — Auth: no ejecuta Git.
- [ ] AC-01761 — Session: tiene una fuente de verdad identificada.
- [ ] AC-01762 — Session: tiene owner definido.
- [ ] AC-01763 — Session: tiene alcance y fuera de alcance.
- [ ] AC-01764 — Session: tiene contrato versionado.
- [ ] AC-01765 — Session: tiene regla de dominio probada.
- [ ] AC-01766 — Session: tiene autorización backend.
- [ ] AC-01767 — Session: tiene auditoría.
- [ ] AC-01768 — Session: tiene idempotencia cuando aplica.
- [ ] AC-01769 — Session: tiene loading state.
- [ ] AC-01770 — Session: tiene error state.
- [ ] AC-01771 — WebAuthn: tiene empty state.
- [ ] AC-01772 — WebAuthn: tiene offline state cuando aplica.
- [ ] AC-01773 — WebAuthn: tiene forbidden state.
- [ ] AC-01774 — WebAuthn: tiene mensajes en español.
- [ ] AC-01775 — WebAuthn: no muestra ObjectIds.
- [ ] AC-01776 — WebAuthn: no introduce any.
- [ ] AC-01777 — WebAuthn: no introduce casts inseguros.
- [ ] AC-01778 — WebAuthn: no usa null como estado de negocio.
- [ ] AC-01779 — WebAuthn: no duplica enums.
- [ ] AC-01780 — WebAuthn: no duplica query keys.
- [ ] AC-01781 — WebAuthn: tiene prueba unitaria.
- [ ] AC-01782 — RBAC: tiene prueba de integración.
- [ ] AC-01783 — RBAC: tiene prueba negativa.
- [ ] AC-01784 — RBAC: tiene prueba E2E crítica.
- [ ] AC-01785 — RBAC: tiene documentación actualizada.
- [ ] AC-01786 — RBAC: tiene backup del archivo modificado.
- [ ] AC-01787 — RBAC: pasa typecheck.
- [ ] AC-01788 — RBAC: pasa lint sin warnings.
- [ ] AC-01789 — RBAC: pasa build.
- [ ] AC-01790 — RBAC: pasa verify.
- [ ] AC-01791 — RBAC: respeta mobile-first.
- [ ] AC-01792 — RBAC: respeta accesibilidad.
- [ ] AC-01793 — Clients: respeta privacidad.
- [ ] AC-01794 — Clients: respeta performance budget.
- [ ] AC-01795 — Clients: registra métricas verificables.
- [ ] AC-01796 — Clients: tiene fallback.
- [ ] AC-01797 — Clients: tiene estrategia de migración.
- [ ] AC-01798 — Clients: conserva compatibilidad.
- [ ] AC-01799 — Clients: no borra datos.
- [ ] AC-01800 — Clients: no ejecuta Git.
- [ ] AC-01801 — Sites: tiene una fuente de verdad identificada.
- [ ] AC-01802 — Sites: tiene owner definido.
- [ ] AC-01803 — Sites: tiene alcance y fuera de alcance.
- [ ] AC-01804 — Contacts: tiene contrato versionado.
- [ ] AC-01805 — Contacts: tiene regla de dominio probada.
- [ ] AC-01806 — Contacts: tiene autorización backend.
- [ ] AC-01807 — Contacts: tiene auditoría.
- [ ] AC-01808 — Contacts: tiene idempotencia cuando aplica.
- [ ] AC-01809 — Contacts: tiene loading state.
- [ ] AC-01810 — Contacts: tiene error state.
- [ ] AC-01811 — Contacts: tiene empty state.
- [ ] AC-01812 — Contacts: tiene offline state cuando aplica.
- [ ] AC-01813 — Contacts: tiene forbidden state.
- [ ] AC-01814 — Contacts: tiene mensajes en español.
- [ ] AC-01815 — WorkRequests: no muestra ObjectIds.
- [ ] AC-01816 — WorkRequests: no introduce any.
- [ ] AC-01817 — WorkRequests: no introduce casts inseguros.
- [ ] AC-01818 — WorkRequests: no usa null como estado de negocio.
- [ ] AC-01819 — WorkRequests: no duplica enums.
- [ ] AC-01820 — WorkRequests: no duplica query keys.
- [ ] AC-01821 — WorkRequests: tiene prueba unitaria.
- [ ] AC-01822 — WorkRequests: tiene prueba de integración.
- [ ] AC-01823 — WorkRequests: tiene prueba negativa.
- [ ] AC-01824 — WorkRequests: tiene prueba E2E crítica.
- [ ] AC-01825 — WorkRequests: tiene documentación actualizada.
- [ ] AC-01826 — SiteVisits: tiene backup del archivo modificado.
- [ ] AC-01827 — SiteVisits: pasa typecheck.
- [ ] AC-01828 — SiteVisits: pasa lint sin warnings.
- [ ] AC-01829 — SiteVisits: pasa build.
- [ ] AC-01830 — SiteVisits: pasa verify.
- [ ] AC-01831 — SiteVisits: respeta mobile-first.
- [ ] AC-01832 — SiteVisits: respeta accesibilidad.
- [ ] AC-01833 — SiteVisits: respeta privacidad.
- [ ] AC-01834 — SiteVisits: respeta performance budget.
- [ ] AC-01835 — SiteVisits: registra métricas verificables.
- [ ] AC-01836 — SiteVisits: tiene fallback.
- [ ] AC-01837 — Proposals: tiene estrategia de migración.
- [ ] AC-01838 — Proposals: conserva compatibilidad.
- [ ] AC-01839 — Proposals: no borra datos.
- [ ] AC-01840 — Proposals: no ejecuta Git.
- [ ] AC-01841 — PurchaseOrders: tiene una fuente de verdad identificada.
- [ ] AC-01842 — PurchaseOrders: tiene owner definido.
- [ ] AC-01843 — PurchaseOrders: tiene alcance y fuera de alcance.
- [ ] AC-01844 — PurchaseOrders: tiene contrato versionado.
- [ ] AC-01845 — PurchaseOrders: tiene regla de dominio probada.
- [ ] AC-01846 — PurchaseOrders: tiene autorización backend.
- [ ] AC-01847 — PurchaseOrders: tiene auditoría.
- [ ] AC-01848 — ServiceCases: tiene idempotencia cuando aplica.
- [ ] AC-01849 — ServiceCases: tiene loading state.
- [ ] AC-01850 — ServiceCases: tiene error state.
- [ ] AC-01851 — ServiceCases: tiene empty state.
- [ ] AC-01852 — ServiceCases: tiene offline state cuando aplica.
- [ ] AC-01853 — ServiceCases: tiene forbidden state.
- [ ] AC-01854 — ServiceCases: tiene mensajes en español.
- [ ] AC-01855 — ServiceCases: no muestra ObjectIds.
- [ ] AC-01856 — ServiceCases: no introduce any.
- [ ] AC-01857 — ServiceCases: no introduce casts inseguros.
- [ ] AC-01858 — ServiceCases: no usa null como estado de negocio.
- [ ] AC-01859 — WorkOrders: no duplica enums.
- [ ] AC-01860 — WorkOrders: no duplica query keys.
- [ ] AC-01861 — WorkOrders: tiene prueba unitaria.
- [ ] AC-01862 — WorkOrders: tiene prueba de integración.
- [ ] AC-01863 — WorkOrders: tiene prueba negativa.
- [ ] AC-01864 — WorkOrders: tiene prueba E2E crítica.
- [ ] AC-01865 — WorkOrders: tiene documentación actualizada.
- [ ] AC-01866 — WorkOrders: tiene backup del archivo modificado.
- [ ] AC-01867 — WorkOrders: pasa typecheck.
- [ ] AC-01868 — WorkOrders: pasa lint sin warnings.
- [ ] AC-01869 — WorkOrders: pasa build.
- [ ] AC-01870 — PlanningPackets: pasa verify.
- [ ] AC-01871 — PlanningPackets: respeta mobile-first.
- [ ] AC-01872 — PlanningPackets: respeta accesibilidad.
- [ ] AC-01873 — PlanningPackets: respeta privacidad.
- [ ] AC-01874 — PlanningPackets: respeta performance budget.
- [ ] AC-01875 — PlanningPackets: registra métricas verificables.
- [ ] AC-01876 — PlanningPackets: tiene fallback.
- [ ] AC-01877 — PlanningPackets: tiene estrategia de migración.
- [ ] AC-01878 — PlanningPackets: conserva compatibilidad.
- [ ] AC-01879 — PlanningPackets: no borra datos.
- [ ] AC-01880 — PlanningPackets: no ejecuta Git.
- [ ] AC-01881 — Kits: tiene una fuente de verdad identificada.
- [ ] AC-01882 — Kits: tiene owner definido.
- [ ] AC-01883 — Kits: tiene alcance y fuera de alcance.
- [ ] AC-01884 — Kits: tiene contrato versionado.
- [ ] AC-01885 — Kits: tiene regla de dominio probada.
- [ ] AC-01886 — Kits: tiene autorización backend.
- [ ] AC-01887 — Kits: tiene auditoría.
- [ ] AC-01888 — Kits: tiene idempotencia cuando aplica.
- [ ] AC-01889 — Kits: tiene loading state.
- [ ] AC-01890 — Kits: tiene error state.
- [ ] AC-01891 — Kits: tiene empty state.
- [ ] AC-01892 — Safety: tiene offline state cuando aplica.
- [ ] AC-01893 — Safety: tiene forbidden state.
- [ ] AC-01894 — Safety: tiene mensajes en español.
- [ ] AC-01895 — Safety: no muestra ObjectIds.
- [ ] AC-01896 — Safety: no introduce any.
- [ ] AC-01897 — Safety: no introduce casts inseguros.
- [ ] AC-01898 — Safety: no usa null como estado de negocio.
- [ ] AC-01899 — Safety: no duplica enums.
- [ ] AC-01900 — Safety: no duplica query keys.
- [ ] AC-01901 — Safety: tiene prueba unitaria.
- [ ] AC-01902 — Safety: tiene prueba de integración.
- [ ] AC-01903 — ExecutionSessions: tiene prueba negativa.
- [ ] AC-01904 — ExecutionSessions: tiene prueba E2E crítica.
- [ ] AC-01905 — ExecutionSessions: tiene documentación actualizada.
- [ ] AC-01906 — ExecutionSessions: tiene backup del archivo modificado.
- [ ] AC-01907 — ExecutionSessions: pasa typecheck.
- [ ] AC-01908 — ExecutionSessions: pasa lint sin warnings.
- [ ] AC-01909 — ExecutionSessions: pasa build.
- [ ] AC-01910 — ExecutionSessions: pasa verify.
- [ ] AC-01911 — ExecutionSessions: respeta mobile-first.
- [ ] AC-01912 — ExecutionSessions: respeta accesibilidad.
- [ ] AC-01913 — ExecutionSessions: respeta privacidad.
- [ ] AC-01914 — OfflineQueue: respeta performance budget.
- [ ] AC-01915 — OfflineQueue: registra métricas verificables.
- [ ] AC-01916 — OfflineQueue: tiene fallback.
- [ ] AC-01917 — OfflineQueue: tiene estrategia de migración.
- [ ] AC-01918 — OfflineQueue: conserva compatibilidad.
- [ ] AC-01919 — OfflineQueue: no borra datos.
- [ ] AC-01920 — OfflineQueue: no ejecuta Git.
- [ ] AC-01921 — SyncConflicts: tiene una fuente de verdad identificada.
- [ ] AC-01922 — SyncConflicts: tiene owner definido.
- [ ] AC-01923 — SyncConflicts: tiene alcance y fuera de alcance.
- [ ] AC-01924 — SyncConflicts: tiene contrato versionado.
- [ ] AC-01925 — Evidences: tiene regla de dominio probada.
- [ ] AC-01926 — Evidences: tiene autorización backend.
- [ ] AC-01927 — Evidences: tiene auditoría.
- [ ] AC-01928 — Evidences: tiene idempotencia cuando aplica.
- [ ] AC-01929 — Evidences: tiene loading state.
- [ ] AC-01930 — Evidences: tiene error state.
- [ ] AC-01931 — Evidences: tiene empty state.
- [ ] AC-01932 — Evidences: tiene offline state cuando aplica.
- [ ] AC-01933 — Evidences: tiene forbidden state.
- [ ] AC-01934 — Evidences: tiene mensajes en español.
- [ ] AC-01935 — Evidences: no muestra ObjectIds.
- [ ] AC-01936 — FileAssets: no introduce any.
- [ ] AC-01937 — FileAssets: no introduce casts inseguros.
- [ ] AC-01938 — FileAssets: no usa null como estado de negocio.
- [ ] AC-01939 — FileAssets: no duplica enums.
- [ ] AC-01940 — FileAssets: no duplica query keys.
- [ ] AC-01941 — FileAssets: tiene prueba unitaria.
- [ ] AC-01942 — FileAssets: tiene prueba de integración.
- [ ] AC-01943 — FileAssets: tiene prueba negativa.
- [ ] AC-01944 — FileAssets: tiene prueba E2E crítica.
- [ ] AC-01945 — FileAssets: tiene documentación actualizada.
- [ ] AC-01946 — FileAssets: tiene backup del archivo modificado.
- [ ] AC-01947 — LineInspection: pasa typecheck.
- [ ] AC-01948 — LineInspection: pasa lint sin warnings.
- [ ] AC-01949 — LineInspection: pasa build.
- [ ] AC-01950 — LineInspection: pasa verify.
- [ ] AC-01951 — LineInspection: respeta mobile-first.
- [ ] AC-01952 — LineInspection: respeta accesibilidad.
- [ ] AC-01953 — LineInspection: respeta privacidad.
- [ ] AC-01954 — LineInspection: respeta performance budget.
- [ ] AC-01955 — LineInspection: registra métricas verificables.
- [ ] AC-01956 — LineInspection: tiene fallback.
- [ ] AC-01957 — LineInspection: tiene estrategia de migración.
- [ ] AC-01958 — CCTV: conserva compatibilidad.
- [ ] AC-01959 — CCTV: no borra datos.
- [ ] AC-01960 — CCTV: no ejecuta Git.
- [ ] AC-01961 — TechnicalReports: tiene una fuente de verdad identificada.
- [ ] AC-01962 — TechnicalReports: tiene owner definido.
- [ ] AC-01963 — TechnicalReports: tiene alcance y fuera de alcance.
- [ ] AC-01964 — TechnicalReports: tiene contrato versionado.
- [ ] AC-01965 — TechnicalReports: tiene regla de dominio probada.
- [ ] AC-01966 — TechnicalReports: tiene autorización backend.
- [ ] AC-01967 — TechnicalReports: tiene auditoría.
- [ ] AC-01968 — TechnicalReports: tiene idempotencia cuando aplica.
- [ ] AC-01969 — DynamicForms: tiene loading state.
- [ ] AC-01970 — DynamicForms: tiene error state.
- [ ] AC-01971 — DynamicForms: tiene empty state.
- [ ] AC-01972 — DynamicForms: tiene offline state cuando aplica.
- [ ] AC-01973 — DynamicForms: tiene forbidden state.
- [ ] AC-01974 — DynamicForms: tiene mensajes en español.
- [ ] AC-01975 — DynamicForms: no muestra ObjectIds.
- [ ] AC-01976 — DynamicForms: no introduce any.
- [ ] AC-01977 — DynamicForms: no introduce casts inseguros.
- [ ] AC-01978 — DynamicForms: no usa null como estado de negocio.
- [ ] AC-01979 — DynamicForms: no duplica enums.
- [ ] AC-01980 — DeliveryRecords: no duplica query keys.
- [ ] AC-01981 — DeliveryRecords: tiene prueba unitaria.
- [ ] AC-01982 — DeliveryRecords: tiene prueba de integración.
- [ ] AC-01983 — DeliveryRecords: tiene prueba negativa.
- [ ] AC-01984 — DeliveryRecords: tiene prueba E2E crítica.
- [ ] AC-01985 — DeliveryRecords: tiene documentación actualizada.
- [ ] AC-01986 — DeliveryRecords: tiene backup del archivo modificado.
- [ ] AC-01987 — DeliveryRecords: pasa typecheck.
- [ ] AC-01988 — DeliveryRecords: pasa lint sin warnings.
- [ ] AC-01989 — DeliveryRecords: pasa build.
- [ ] AC-01990 — DeliveryRecords: pasa verify.
- [ ] AC-01991 — ClientAcceptance: respeta mobile-first.
- [ ] AC-01992 — ClientAcceptance: respeta accesibilidad.
- [ ] AC-01993 — ClientAcceptance: respeta privacidad.
- [ ] AC-01994 — ClientAcceptance: respeta performance budget.
- [ ] AC-01995 — ClientAcceptance: registra métricas verificables.
- [ ] AC-01996 — ClientAcceptance: tiene fallback.
- [ ] AC-01997 — ClientAcceptance: tiene estrategia de migración.
- [ ] AC-01998 — ClientAcceptance: conserva compatibilidad.
- [ ] AC-01999 — ClientAcceptance: no borra datos.
- [ ] AC-02000 — ClientAcceptance: no ejecuta Git.
- [ ] AC-02001 — SES: tiene una fuente de verdad identificada.
- [ ] AC-02002 — SESApproval: tiene owner definido.
- [ ] AC-02003 — SESApproval: tiene alcance y fuera de alcance.
- [ ] AC-02004 — SESApproval: tiene contrato versionado.
- [ ] AC-02005 — SESApproval: tiene regla de dominio probada.
- [ ] AC-02006 — SESApproval: tiene autorización backend.
- [ ] AC-02007 — SESApproval: tiene auditoría.
- [ ] AC-02008 — SESApproval: tiene idempotencia cuando aplica.
- [ ] AC-02009 — SESApproval: tiene loading state.
- [ ] AC-02010 — SESApproval: tiene error state.
- [ ] AC-02011 — SESApproval: tiene empty state.
- [ ] AC-02012 — SESApproval: tiene offline state cuando aplica.
- [ ] AC-02013 — Invoices: tiene forbidden state.
- [ ] AC-02014 — Invoices: tiene mensajes en español.
- [ ] AC-02015 — Invoices: no muestra ObjectIds.
- [ ] AC-02016 — Invoices: no introduce any.
- [ ] AC-02017 — Invoices: no introduce casts inseguros.
- [ ] AC-02018 — Invoices: no usa null como estado de negocio.
- [ ] AC-02019 — Invoices: no duplica enums.
- [ ] AC-02020 — Invoices: no duplica query keys.
- [ ] AC-02021 — Invoices: tiene prueba unitaria.
- [ ] AC-02022 — Invoices: tiene prueba de integración.
- [ ] AC-02023 — Invoices: tiene prueba negativa.
- [ ] AC-02024 — InvoiceApproval: tiene prueba E2E crítica.
- [ ] AC-02025 — InvoiceApproval: tiene documentación actualizada.
- [ ] AC-02026 — InvoiceApproval: tiene backup del archivo modificado.
- [ ] AC-02027 — InvoiceApproval: pasa typecheck.
- [ ] AC-02028 — InvoiceApproval: pasa lint sin warnings.
- [ ] AC-02029 — InvoiceApproval: pasa build.
- [ ] AC-02030 — InvoiceApproval: pasa verify.
- [ ] AC-02031 — InvoiceApproval: respeta mobile-first.
- [ ] AC-02032 — InvoiceApproval: respeta accesibilidad.
- [ ] AC-02033 — InvoiceApproval: respeta privacidad.
- [ ] AC-02034 — InvoiceApproval: respeta performance budget.
- [ ] AC-02035 — Payments: registra métricas verificables.
- [ ] AC-02036 — Payments: tiene fallback.
- [ ] AC-02037 — Payments: tiene estrategia de migración.
- [ ] AC-02038 — Payments: conserva compatibilidad.
- [ ] AC-02039 — Payments: no borra datos.
- [ ] AC-02040 — Payments: no ejecuta Git.
- [ ] AC-02041 — Closure: tiene una fuente de verdad identificada.
- [ ] AC-02042 — Closure: tiene owner definido.
- [ ] AC-02043 — Closure: tiene alcance y fuera de alcance.
- [ ] AC-02044 — Closure: tiene contrato versionado.
- [ ] AC-02045 — Closure: tiene regla de dominio probada.
- [ ] AC-02046 — Costs: tiene autorización backend.
- [ ] AC-02047 — Costs: tiene auditoría.
- [ ] AC-02048 — Costs: tiene idempotencia cuando aplica.
- [ ] AC-02049 — Costs: tiene loading state.
- [ ] AC-02050 — Costs: tiene error state.
- [ ] AC-02051 — Costs: tiene empty state.
- [ ] AC-02052 — Costs: tiene offline state cuando aplica.
- [ ] AC-02053 — Costs: tiene forbidden state.
- [ ] AC-02054 — Costs: tiene mensajes en español.
- [ ] AC-02055 — Costs: no muestra ObjectIds.
- [ ] AC-02056 — Costs: no introduce any.
- [ ] AC-02057 — Inventory: no introduce casts inseguros.
- [ ] AC-02058 — Inventory: no usa null como estado de negocio.
- [ ] AC-02059 — Inventory: no duplica enums.
- [ ] AC-02060 — Inventory: no duplica query keys.
- [ ] AC-02061 — Inventory: tiene prueba unitaria.
- [ ] AC-02062 — Inventory: tiene prueba de integración.
- [ ] AC-02063 — Inventory: tiene prueba negativa.
- [ ] AC-02064 — Inventory: tiene prueba E2E crítica.
- [ ] AC-02065 — Inventory: tiene documentación actualizada.
- [ ] AC-02066 — Inventory: tiene backup del archivo modificado.
- [ ] AC-02067 — Inventory: pasa typecheck.
- [ ] AC-02068 — Tools: pasa lint sin warnings.
- [ ] AC-02069 — Tools: pasa build.
- [ ] AC-02070 — Tools: pasa verify.
- [ ] AC-02071 — Tools: respeta mobile-first.
- [ ] AC-02072 — Tools: respeta accesibilidad.
- [ ] AC-02073 — Tools: respeta privacidad.
- [ ] AC-02074 — Tools: respeta performance budget.
- [ ] AC-02075 — Tools: registra métricas verificables.
- [ ] AC-02076 — Tools: tiene fallback.
- [ ] AC-02077 — Tools: tiene estrategia de migración.
- [ ] AC-02078 — Tools: conserva compatibilidad.
- [ ] AC-02079 — Fleet: no borra datos.
- [ ] AC-02080 — Fleet: no ejecuta Git.
- [ ] AC-02081 — Assets: tiene una fuente de verdad identificada.
- [ ] AC-02082 — Assets: tiene owner definido.
- [ ] AC-02083 — Assets: tiene alcance y fuera de alcance.
- [ ] AC-02084 — Assets: tiene contrato versionado.
- [ ] AC-02085 — Assets: tiene regla de dominio probada.
- [ ] AC-02086 — Assets: tiene autorización backend.
- [ ] AC-02087 — Assets: tiene auditoría.
- [ ] AC-02088 — Assets: tiene idempotencia cuando aplica.
- [ ] AC-02089 — Assets: tiene loading state.
- [ ] AC-02090 — Maintenance: tiene error state.
- [ ] AC-02091 — Maintenance: tiene empty state.
- [ ] AC-02092 — Maintenance: tiene offline state cuando aplica.
- [ ] AC-02093 — Maintenance: tiene forbidden state.
- [ ] AC-02094 — Maintenance: tiene mensajes en español.
- [ ] AC-02095 — Maintenance: no muestra ObjectIds.
- [ ] AC-02096 — Maintenance: no introduce any.
- [ ] AC-02097 — Maintenance: no introduce casts inseguros.
- [ ] AC-02098 — Maintenance: no usa null como estado de negocio.
- [ ] AC-02099 — Maintenance: no duplica enums.
- [ ] AC-02100 — Maintenance: no duplica query keys.
- [ ] AC-02101 — Dashboard: tiene prueba unitaria.
- [ ] AC-02102 — Dashboard: tiene prueba de integración.
- [ ] AC-02103 — Dashboard: tiene prueba negativa.
- [ ] AC-02104 — Dashboard: tiene prueba E2E crítica.
- [ ] AC-02105 — Dashboard: tiene documentación actualizada.
- [ ] AC-02106 — Dashboard: tiene backup del archivo modificado.
- [ ] AC-02107 — Dashboard: pasa typecheck.
- [ ] AC-02108 — Dashboard: pasa lint sin warnings.
- [ ] AC-02109 — Dashboard: pasa build.
- [ ] AC-02110 — Dashboard: pasa verify.
- [ ] AC-02111 — Dashboard: respeta mobile-first.
- [ ] AC-02112 — SLA: respeta accesibilidad.
- [ ] AC-02113 — SLA: respeta privacidad.
- [ ] AC-02114 — SLA: respeta performance budget.
- [ ] AC-02115 — SLA: registra métricas verificables.
- [ ] AC-02116 — SLA: tiene fallback.
- [ ] AC-02117 — SLA: tiene estrategia de migración.
- [ ] AC-02118 — SLA: conserva compatibilidad.
- [ ] AC-02119 — SLA: no borra datos.
- [ ] AC-02120 — SLA: no ejecuta Git.
- [ ] AC-02121 — Dispatch: tiene una fuente de verdad identificada.
- [ ] AC-02122 — Dispatch: tiene owner definido.
- [ ] AC-02123 — Notifications: tiene alcance y fuera de alcance.
- [ ] AC-02124 — Notifications: tiene contrato versionado.
- [ ] AC-02125 — Notifications: tiene regla de dominio probada.
- [ ] AC-02126 — Notifications: tiene autorización backend.
- [ ] AC-02127 — Notifications: tiene auditoría.
- [ ] AC-02128 — Notifications: tiene idempotencia cuando aplica.
- [ ] AC-02129 — Notifications: tiene loading state.
- [ ] AC-02130 — Notifications: tiene error state.
- [ ] AC-02131 — Notifications: tiene empty state.
- [ ] AC-02132 — Notifications: tiene offline state cuando aplica.
- [ ] AC-02133 — Notifications: tiene forbidden state.
- [ ] AC-02134 — ClientPortal: tiene mensajes en español.
- [ ] AC-02135 — ClientPortal: no muestra ObjectIds.
- [ ] AC-02136 — ClientPortal: no introduce any.
- [ ] AC-02137 — ClientPortal: no introduce casts inseguros.
- [ ] AC-02138 — ClientPortal: no usa null como estado de negocio.
- [ ] AC-02139 — ClientPortal: no duplica enums.
- [ ] AC-02140 — ClientPortal: no duplica query keys.
- [ ] AC-02141 — ClientPortal: tiene prueba unitaria.
- [ ] AC-02142 — ClientPortal: tiene prueba de integración.
- [ ] AC-02143 — ClientPortal: tiene prueba negativa.
- [ ] AC-02144 — ClientPortal: tiene prueba E2E crítica.
- [ ] AC-02145 — HistoricalArchive: tiene documentación actualizada.
- [ ] AC-02146 — HistoricalArchive: tiene backup del archivo modificado.
- [ ] AC-02147 — HistoricalArchive: pasa typecheck.
- [ ] AC-02148 — HistoricalArchive: pasa lint sin warnings.
- [ ] AC-02149 — HistoricalArchive: pasa build.
- [ ] AC-02150 — HistoricalArchive: pasa verify.
- [ ] AC-02151 — HistoricalArchive: respeta mobile-first.
- [ ] AC-02152 — HistoricalArchive: respeta accesibilidad.
- [ ] AC-02153 — HistoricalArchive: respeta privacidad.
- [ ] AC-02154 — HistoricalArchive: respeta performance budget.
- [ ] AC-02155 — HistoricalArchive: registra métricas verificables.
- [ ] AC-02156 — Backups: tiene fallback.
- [ ] AC-02157 — Backups: tiene estrategia de migración.
- [ ] AC-02158 — Backups: conserva compatibilidad.
- [ ] AC-02159 — Backups: no borra datos.
- [ ] AC-02160 — Backups: no ejecuta Git.
- [ ] AC-02161 — Audit: tiene una fuente de verdad identificada.
- [ ] AC-02162 — Audit: tiene owner definido.
- [ ] AC-02163 — Audit: tiene alcance y fuera de alcance.
- [ ] AC-02164 — Audit: tiene contrato versionado.
- [ ] AC-02165 — Audit: tiene regla de dominio probada.
- [ ] AC-02166 — Audit: tiene autorización backend.
- [ ] AC-02167 — Observability: tiene auditoría.
- [ ] AC-02168 — Observability: tiene idempotencia cuando aplica.
- [ ] AC-02169 — Observability: tiene loading state.
- [ ] AC-02170 — Observability: tiene error state.
- [ ] AC-02171 — Observability: tiene empty state.
- [ ] AC-02172 — Observability: tiene offline state cuando aplica.
- [ ] AC-02173 — Observability: tiene forbidden state.
- [ ] AC-02174 — Observability: tiene mensajes en español.
- [ ] AC-02175 — Observability: no muestra ObjectIds.
- [ ] AC-02176 — Observability: no introduce any.
- [ ] AC-02177 — Observability: no introduce casts inseguros.
- [ ] AC-02178 — Security: no usa null como estado de negocio.
- [ ] AC-02179 — Security: no duplica enums.
- [ ] AC-02180 — Security: no duplica query keys.
- [ ] AC-02181 — Security: tiene prueba unitaria.
- [ ] AC-02182 — Security: tiene prueba de integración.
- [ ] AC-02183 — Security: tiene prueba negativa.
- [ ] AC-02184 — Security: tiene prueba E2E crítica.
- [ ] AC-02185 — Security: tiene documentación actualizada.
- [ ] AC-02186 — Security: tiene backup del archivo modificado.
- [ ] AC-02187 — Security: pasa typecheck.
- [ ] AC-02188 — Security: pasa lint sin warnings.
- [ ] AC-02189 — Accessibility: pasa build.
- [ ] AC-02190 — Accessibility: pasa verify.
- [ ] AC-02191 — Accessibility: respeta mobile-first.
- [ ] AC-02192 — Accessibility: respeta accesibilidad.
- [ ] AC-02193 — Accessibility: respeta privacidad.
- [ ] AC-02194 — Accessibility: respeta performance budget.
- [ ] AC-02195 — Accessibility: registra métricas verificables.
- [ ] AC-02196 — Accessibility: tiene fallback.
- [ ] AC-02197 — Accessibility: tiene estrategia de migración.
- [ ] AC-02198 — Accessibility: conserva compatibilidad.
- [ ] AC-02199 — Accessibility: no borra datos.
- [ ] AC-02200 — Performance: no ejecuta Git.
- [ ] AC-02201 — Testing: tiene una fuente de verdad identificada.
- [ ] AC-02202 — Testing: tiene owner definido.
- [ ] AC-02203 — Testing: tiene alcance y fuera de alcance.
- [ ] AC-02204 — Testing: tiene contrato versionado.
- [ ] AC-02205 — Testing: tiene regla de dominio probada.
- [ ] AC-02206 — Testing: tiene autorización backend.
- [ ] AC-02207 — Testing: tiene auditoría.
- [ ] AC-02208 — Testing: tiene idempotencia cuando aplica.
- [ ] AC-02209 — Testing: tiene loading state.
- [ ] AC-02210 — Testing: tiene error state.
- [ ] AC-02211 — Documentation: tiene empty state.
- [ ] AC-02212 — Documentation: tiene offline state cuando aplica.
- [ ] AC-02213 — Documentation: tiene forbidden state.
- [ ] AC-02214 — Documentation: tiene mensajes en español.
- [ ] AC-02215 — Documentation: no muestra ObjectIds.
- [ ] AC-02216 — Documentation: no introduce any.
- [ ] AC-02217 — Documentation: no introduce casts inseguros.
- [ ] AC-02218 — Documentation: no usa null como estado de negocio.
- [ ] AC-02219 — Documentation: no duplica enums.
- [ ] AC-02220 — Documentation: no duplica query keys.
- [ ] AC-02221 — Documentation: tiene prueba unitaria.
- [ ] AC-02222 — Deployment: tiene prueba de integración.
- [ ] AC-02223 — Deployment: tiene prueba negativa.
- [ ] AC-02224 — Deployment: tiene prueba E2E crítica.
- [ ] AC-02225 — Deployment: tiene documentación actualizada.
- [ ] AC-02226 — Deployment: tiene backup del archivo modificado.
- [ ] AC-02227 — Deployment: pasa typecheck.
- [ ] AC-02228 — Deployment: pasa lint sin warnings.
- [ ] AC-02229 — Deployment: pasa build.
- [ ] AC-02230 — Deployment: pasa verify.
- [ ] AC-02231 — Deployment: respeta mobile-first.
- [ ] AC-02232 — Deployment: respeta accesibilidad.
- [ ] AC-02233 — Innovation: respeta privacidad.
- [ ] AC-02234 — Innovation: respeta performance budget.
- [ ] AC-02235 — Innovation: registra métricas verificables.
- [ ] AC-02236 — Innovation: tiene fallback.
- [ ] AC-02237 — Innovation: tiene estrategia de migración.
- [ ] AC-02238 — Innovation: conserva compatibilidad.
- [ ] AC-02239 — Innovation: no borra datos.
- [ ] AC-02240 — Innovation: no ejecuta Git.
- [ ] AC-02241 — AIAdapter: tiene una fuente de verdad identificada.
- [ ] AC-02242 — AIAdapter: tiene owner definido.
- [ ] AC-02243 — AIAdapter: tiene alcance y fuera de alcance.
- [ ] AC-02244 — Integrations: tiene contrato versionado.
- [ ] AC-02245 — Integrations: tiene regla de dominio probada.
- [ ] AC-02246 — Integrations: tiene autorización backend.
- [ ] AC-02247 — Integrations: tiene auditoría.
- [ ] AC-02248 — Integrations: tiene idempotencia cuando aplica.
- [ ] AC-02249 — Integrations: tiene loading state.
- [ ] AC-02250 — Integrations: tiene error state.
- [ ] AC-02251 — Integrations: tiene empty state.
- [ ] AC-02252 — Integrations: tiene offline state cuando aplica.
- [ ] AC-02253 — Integrations: tiene forbidden state.
- [ ] AC-02254 — Integrations: tiene mensajes en español.
- [ ] AC-02255 — ProductGovernance: no muestra ObjectIds.
- [ ] AC-02256 — ProductGovernance: no introduce any.
- [ ] AC-02257 — ProductGovernance: no introduce casts inseguros.
- [ ] AC-02258 — ProductGovernance: no usa null como estado de negocio.
- [ ] AC-02259 — ProductGovernance: no duplica enums.
- [ ] AC-02260 — ProductGovernance: no duplica query keys.
- [ ] AC-02261 — ProductGovernance: tiene prueba unitaria.
- [ ] AC-02262 — ProductGovernance: tiene prueba de integración.
- [ ] AC-02263 — ProductGovernance: tiene prueba negativa.
- [ ] AC-02264 — ProductGovernance: tiene prueba E2E crítica.
- [ ] AC-02265 — ProductGovernance: tiene documentación actualizada.
- [ ] AC-02266 — SourceTraceability: tiene backup del archivo modificado.
- [ ] AC-02267 — SourceTraceability: pasa typecheck.
- [ ] AC-02268 — SourceTraceability: pasa lint sin warnings.
- [ ] AC-02269 — SourceTraceability: pasa build.
- [ ] AC-02270 — SourceTraceability: pasa verify.
- [ ] AC-02271 — SourceTraceability: respeta mobile-first.
- [ ] AC-02272 — SourceTraceability: respeta accesibilidad.
- [ ] AC-02273 — SourceTraceability: respeta privacidad.
- [ ] AC-02274 — SourceTraceability: respeta performance budget.
- [ ] AC-02275 — SourceTraceability: registra métricas verificables.
- [ ] AC-02276 — SourceTraceability: tiene fallback.
- [ ] AC-02277 — AgentCoordinator: tiene estrategia de migración.
- [ ] AC-02278 — AgentCoordinator: conserva compatibilidad.
- [ ] AC-02279 — AgentCoordinator: no borra datos.
- [ ] AC-02280 — AgentCoordinator: no ejecuta Git.
- [ ] AC-02281 — AgentHandoff: tiene una fuente de verdad identificada.
- [ ] AC-02282 — AgentHandoff: tiene owner definido.
- [ ] AC-02283 — AgentHandoff: tiene alcance y fuera de alcance.
- [ ] AC-02284 — AgentHandoff: tiene contrato versionado.
- [ ] AC-02285 — AgentHandoff: tiene regla de dominio probada.
- [ ] AC-02286 — AgentHandoff: tiene autorización backend.
- [ ] AC-02287 — AgentHandoff: tiene auditoría.
- [ ] AC-02288 — SharedTypes: tiene idempotencia cuando aplica.
- [ ] AC-02289 — SharedTypes: tiene loading state.
- [ ] AC-02290 — SharedTypes: tiene error state.
- [ ] AC-02291 — SharedTypes: tiene empty state.
- [ ] AC-02292 — SharedTypes: tiene offline state cuando aplica.
- [ ] AC-02293 — SharedTypes: tiene forbidden state.
- [ ] AC-02294 — SharedTypes: tiene mensajes en español.
- [ ] AC-02295 — SharedTypes: no muestra ObjectIds.
- [ ] AC-02296 — SharedTypes: no introduce any.
- [ ] AC-02297 — SharedTypes: no introduce casts inseguros.
- [ ] AC-02298 — SharedTypes: no usa null como estado de negocio.
- [ ] AC-02299 — DomainFSM: no duplica enums.
- [ ] AC-02300 — DomainFSM: no duplica query keys.
- [ ] AC-02301 — DomainFSM: tiene prueba unitaria.
- [ ] AC-02302 — DomainFSM: tiene prueba de integración.
- [ ] AC-02303 — DomainFSM: tiene prueba negativa.
- [ ] AC-02304 — DomainFSM: tiene prueba E2E crítica.
- [ ] AC-02305 — DomainFSM: tiene documentación actualizada.
- [ ] AC-02306 — DomainFSM: tiene backup del archivo modificado.
- [ ] AC-02307 — DomainFSM: pasa typecheck.
- [ ] AC-02308 — DomainFSM: pasa lint sin warnings.
- [ ] AC-02309 — DomainFSM: pasa build.
- [ ] AC-02310 — Config: pasa verify.
- [ ] AC-02311 — Config: respeta mobile-first.
- [ ] AC-02312 — Config: respeta accesibilidad.
- [ ] AC-02313 — Config: respeta privacidad.
- [ ] AC-02314 — Config: respeta performance budget.
- [ ] AC-02315 — Config: registra métricas verificables.
- [ ] AC-02316 — Config: tiene fallback.
- [ ] AC-02317 — Config: tiene estrategia de migración.
- [ ] AC-02318 — Config: conserva compatibilidad.
- [ ] AC-02319 — Config: no borra datos.
- [ ] AC-02320 — Config: no ejecuta Git.
- [ ] AC-02321 — Auth: tiene una fuente de verdad identificada.
- [ ] AC-02322 — Auth: tiene owner definido.
- [ ] AC-02323 — Auth: tiene alcance y fuera de alcance.
- [ ] AC-02324 — Auth: tiene contrato versionado.
- [ ] AC-02325 — Auth: tiene regla de dominio probada.
- [ ] AC-02326 — Auth: tiene autorización backend.
- [ ] AC-02327 — Auth: tiene auditoría.
- [ ] AC-02328 — Auth: tiene idempotencia cuando aplica.
- [ ] AC-02329 — Auth: tiene loading state.
- [ ] AC-02330 — Auth: tiene error state.
- [ ] AC-02331 — Auth: tiene empty state.
- [ ] AC-02332 — Session: tiene offline state cuando aplica.
- [ ] AC-02333 — Session: tiene forbidden state.
- [ ] AC-02334 — Session: tiene mensajes en español.
- [ ] AC-02335 — Session: no muestra ObjectIds.
- [ ] AC-02336 — Session: no introduce any.
- [ ] AC-02337 — Session: no introduce casts inseguros.
- [ ] AC-02338 — Session: no usa null como estado de negocio.
- [ ] AC-02339 — Session: no duplica enums.
- [ ] AC-02340 — Session: no duplica query keys.
- [ ] AC-02341 — Session: tiene prueba unitaria.
- [ ] AC-02342 — Session: tiene prueba de integración.
- [ ] AC-02343 — WebAuthn: tiene prueba negativa.
- [ ] AC-02344 — WebAuthn: tiene prueba E2E crítica.
- [ ] AC-02345 — WebAuthn: tiene documentación actualizada.
- [ ] AC-02346 — WebAuthn: tiene backup del archivo modificado.
- [ ] AC-02347 — WebAuthn: pasa typecheck.
- [ ] AC-02348 — WebAuthn: pasa lint sin warnings.
- [ ] AC-02349 — WebAuthn: pasa build.
- [ ] AC-02350 — WebAuthn: pasa verify.
- [ ] AC-02351 — WebAuthn: respeta mobile-first.
- [ ] AC-02352 — WebAuthn: respeta accesibilidad.
- [ ] AC-02353 — WebAuthn: respeta privacidad.
- [ ] AC-02354 — RBAC: respeta performance budget.
- [ ] AC-02355 — RBAC: registra métricas verificables.
- [ ] AC-02356 — RBAC: tiene fallback.
- [ ] AC-02357 — RBAC: tiene estrategia de migración.
- [ ] AC-02358 — RBAC: conserva compatibilidad.
- [ ] AC-02359 — RBAC: no borra datos.
- [ ] AC-02360 — RBAC: no ejecuta Git.
- [ ] AC-02361 — Clients: tiene una fuente de verdad identificada.
- [ ] AC-02362 — Clients: tiene owner definido.
- [ ] AC-02363 — Clients: tiene alcance y fuera de alcance.
- [ ] AC-02364 — Clients: tiene contrato versionado.
- [ ] AC-02365 — Sites: tiene regla de dominio probada.
- [ ] AC-02366 — Sites: tiene autorización backend.
- [ ] AC-02367 — Sites: tiene auditoría.
- [ ] AC-02368 — Sites: tiene idempotencia cuando aplica.
- [ ] AC-02369 — Sites: tiene loading state.
- [ ] AC-02370 — Sites: tiene error state.
- [ ] AC-02371 — Sites: tiene empty state.
- [ ] AC-02372 — Sites: tiene offline state cuando aplica.
- [ ] AC-02373 — Sites: tiene forbidden state.
- [ ] AC-02374 — Sites: tiene mensajes en español.
- [ ] AC-02375 — Sites: no muestra ObjectIds.
- [ ] AC-02376 — Contacts: no introduce any.
- [ ] AC-02377 — Contacts: no introduce casts inseguros.
- [ ] AC-02378 — Contacts: no usa null como estado de negocio.
- [ ] AC-02379 — Contacts: no duplica enums.
- [ ] AC-02380 — Contacts: no duplica query keys.
- [ ] AC-02381 — Contacts: tiene prueba unitaria.
- [ ] AC-02382 — Contacts: tiene prueba de integración.
- [ ] AC-02383 — Contacts: tiene prueba negativa.
- [ ] AC-02384 — Contacts: tiene prueba E2E crítica.
- [ ] AC-02385 — Contacts: tiene documentación actualizada.
- [ ] AC-02386 — Contacts: tiene backup del archivo modificado.
- [ ] AC-02387 — WorkRequests: pasa typecheck.
- [ ] AC-02388 — WorkRequests: pasa lint sin warnings.
- [ ] AC-02389 — WorkRequests: pasa build.
- [ ] AC-02390 — WorkRequests: pasa verify.
- [ ] AC-02391 — WorkRequests: respeta mobile-first.
- [ ] AC-02392 — WorkRequests: respeta accesibilidad.
- [ ] AC-02393 — WorkRequests: respeta privacidad.
- [ ] AC-02394 — WorkRequests: respeta performance budget.
- [ ] AC-02395 — WorkRequests: registra métricas verificables.
- [ ] AC-02396 — WorkRequests: tiene fallback.
- [ ] AC-02397 — WorkRequests: tiene estrategia de migración.
- [ ] AC-02398 — SiteVisits: conserva compatibilidad.
- [ ] AC-02399 — SiteVisits: no borra datos.
- [ ] AC-02400 — SiteVisits: no ejecuta Git.
- [ ] AC-02401 — Proposals: tiene una fuente de verdad identificada.
- [ ] AC-02402 — Proposals: tiene owner definido.
- [ ] AC-02403 — Proposals: tiene alcance y fuera de alcance.
- [ ] AC-02404 — Proposals: tiene contrato versionado.
- [ ] AC-02405 — Proposals: tiene regla de dominio probada.
- [ ] AC-02406 — Proposals: tiene autorización backend.
- [ ] AC-02407 — Proposals: tiene auditoría.
- [ ] AC-02408 — Proposals: tiene idempotencia cuando aplica.
- [ ] AC-02409 — PurchaseOrders: tiene loading state.
- [ ] AC-02410 — PurchaseOrders: tiene error state.
- [ ] AC-02411 — PurchaseOrders: tiene empty state.
- [ ] AC-02412 — PurchaseOrders: tiene offline state cuando aplica.
- [ ] AC-02413 — PurchaseOrders: tiene forbidden state.
- [ ] AC-02414 — PurchaseOrders: tiene mensajes en español.
- [ ] AC-02415 — PurchaseOrders: no muestra ObjectIds.
- [ ] AC-02416 — PurchaseOrders: no introduce any.
- [ ] AC-02417 — PurchaseOrders: no introduce casts inseguros.
- [ ] AC-02418 — PurchaseOrders: no usa null como estado de negocio.
- [ ] AC-02419 — PurchaseOrders: no duplica enums.
- [ ] AC-02420 — ServiceCases: no duplica query keys.
- [ ] AC-02421 — ServiceCases: tiene prueba unitaria.
- [ ] AC-02422 — ServiceCases: tiene prueba de integración.
- [ ] AC-02423 — ServiceCases: tiene prueba negativa.
- [ ] AC-02424 — ServiceCases: tiene prueba E2E crítica.
- [ ] AC-02425 — ServiceCases: tiene documentación actualizada.
- [ ] AC-02426 — ServiceCases: tiene backup del archivo modificado.
- [ ] AC-02427 — ServiceCases: pasa typecheck.
- [ ] AC-02428 — ServiceCases: pasa lint sin warnings.
- [ ] AC-02429 — ServiceCases: pasa build.
- [ ] AC-02430 — ServiceCases: pasa verify.
- [ ] AC-02431 — WorkOrders: respeta mobile-first.
- [ ] AC-02432 — WorkOrders: respeta accesibilidad.
- [ ] AC-02433 — WorkOrders: respeta privacidad.
- [ ] AC-02434 — WorkOrders: respeta performance budget.
- [ ] AC-02435 — WorkOrders: registra métricas verificables.
- [ ] AC-02436 — WorkOrders: tiene fallback.
- [ ] AC-02437 — WorkOrders: tiene estrategia de migración.
- [ ] AC-02438 — WorkOrders: conserva compatibilidad.
- [ ] AC-02439 — WorkOrders: no borra datos.
- [ ] AC-02440 — WorkOrders: no ejecuta Git.
- [ ] AC-02441 — PlanningPackets: tiene una fuente de verdad identificada.
- [ ] AC-02442 — Kits: tiene owner definido.
- [ ] AC-02443 — Kits: tiene alcance y fuera de alcance.
- [ ] AC-02444 — Kits: tiene contrato versionado.
- [ ] AC-02445 — Kits: tiene regla de dominio probada.
- [ ] AC-02446 — Kits: tiene autorización backend.
- [ ] AC-02447 — Kits: tiene auditoría.
- [ ] AC-02448 — Kits: tiene idempotencia cuando aplica.
- [ ] AC-02449 — Kits: tiene loading state.
- [ ] AC-02450 — Kits: tiene error state.
- [ ] AC-02451 — Kits: tiene empty state.
- [ ] AC-02452 — Kits: tiene offline state cuando aplica.
- [ ] AC-02453 — Safety: tiene forbidden state.
- [ ] AC-02454 — Safety: tiene mensajes en español.
- [ ] AC-02455 — Safety: no muestra ObjectIds.
- [ ] AC-02456 — Safety: no introduce any.
- [ ] AC-02457 — Safety: no introduce casts inseguros.
- [ ] AC-02458 — Safety: no usa null como estado de negocio.
- [ ] AC-02459 — Safety: no duplica enums.
- [ ] AC-02460 — Safety: no duplica query keys.
- [ ] AC-02461 — Safety: tiene prueba unitaria.
- [ ] AC-02462 — Safety: tiene prueba de integración.
- [ ] AC-02463 — Safety: tiene prueba negativa.
- [ ] AC-02464 — ExecutionSessions: tiene prueba E2E crítica.
- [ ] AC-02465 — ExecutionSessions: tiene documentación actualizada.
- [ ] AC-02466 — ExecutionSessions: tiene backup del archivo modificado.
- [ ] AC-02467 — ExecutionSessions: pasa typecheck.
- [ ] AC-02468 — ExecutionSessions: pasa lint sin warnings.
- [ ] AC-02469 — ExecutionSessions: pasa build.
- [ ] AC-02470 — ExecutionSessions: pasa verify.
- [ ] AC-02471 — ExecutionSessions: respeta mobile-first.
- [ ] AC-02472 — ExecutionSessions: respeta accesibilidad.
- [ ] AC-02473 — ExecutionSessions: respeta privacidad.
- [ ] AC-02474 — ExecutionSessions: respeta performance budget.
- [ ] AC-02475 — OfflineQueue: registra métricas verificables.
- [ ] AC-02476 — OfflineQueue: tiene fallback.
- [ ] AC-02477 — OfflineQueue: tiene estrategia de migración.
- [ ] AC-02478 — OfflineQueue: conserva compatibilidad.
- [ ] AC-02479 — OfflineQueue: no borra datos.
- [ ] AC-02480 — OfflineQueue: no ejecuta Git.
- [ ] AC-02481 — SyncConflicts: tiene una fuente de verdad identificada.
- [ ] AC-02482 — SyncConflicts: tiene owner definido.
- [ ] AC-02483 — SyncConflicts: tiene alcance y fuera de alcance.
- [ ] AC-02484 — SyncConflicts: tiene contrato versionado.
- [ ] AC-02485 — SyncConflicts: tiene regla de dominio probada.
- [ ] AC-02486 — Evidences: tiene autorización backend.
- [ ] AC-02487 — Evidences: tiene auditoría.
- [ ] AC-02488 — Evidences: tiene idempotencia cuando aplica.
- [ ] AC-02489 — Evidences: tiene loading state.
- [ ] AC-02490 — Evidences: tiene error state.
- [ ] AC-02491 — Evidences: tiene empty state.
- [ ] AC-02492 — Evidences: tiene offline state cuando aplica.
- [ ] AC-02493 — Evidences: tiene forbidden state.
- [ ] AC-02494 — Evidences: tiene mensajes en español.
- [ ] AC-02495 — Evidences: no muestra ObjectIds.
- [ ] AC-02496 — Evidences: no introduce any.
- [ ] AC-02497 — FileAssets: no introduce casts inseguros.
- [ ] AC-02498 — FileAssets: no usa null como estado de negocio.
- [ ] AC-02499 — FileAssets: no duplica enums.
- [ ] AC-02500 — FileAssets: no duplica query keys.
- [ ] AC-02501 — FileAssets: tiene prueba unitaria.
- [ ] AC-02502 — FileAssets: tiene prueba de integración.
- [ ] AC-02503 — FileAssets: tiene prueba negativa.
- [ ] AC-02504 — FileAssets: tiene prueba E2E crítica.
- [ ] AC-02505 — FileAssets: tiene documentación actualizada.
- [ ] AC-02506 — FileAssets: tiene backup del archivo modificado.
- [ ] AC-02507 — FileAssets: pasa typecheck.
- [ ] AC-02508 — LineInspection: pasa lint sin warnings.
- [ ] AC-02509 — LineInspection: pasa build.
- [ ] AC-02510 — LineInspection: pasa verify.
- [ ] AC-02511 — LineInspection: respeta mobile-first.
- [ ] AC-02512 — LineInspection: respeta accesibilidad.
- [ ] AC-02513 — LineInspection: respeta privacidad.
- [ ] AC-02514 — LineInspection: respeta performance budget.
- [ ] AC-02515 — LineInspection: registra métricas verificables.
- [ ] AC-02516 — LineInspection: tiene fallback.
- [ ] AC-02517 — LineInspection: tiene estrategia de migración.
- [ ] AC-02518 — LineInspection: conserva compatibilidad.
- [ ] AC-02519 — CCTV: no borra datos.
- [ ] AC-02520 — CCTV: no ejecuta Git.
- [ ] AC-02521 — TechnicalReports: tiene una fuente de verdad identificada.
- [ ] AC-02522 — TechnicalReports: tiene owner definido.
- [ ] AC-02523 — TechnicalReports: tiene alcance y fuera de alcance.
- [ ] AC-02524 — TechnicalReports: tiene contrato versionado.
- [ ] AC-02525 — TechnicalReports: tiene regla de dominio probada.
- [ ] AC-02526 — TechnicalReports: tiene autorización backend.
- [ ] AC-02527 — TechnicalReports: tiene auditoría.
- [ ] AC-02528 — TechnicalReports: tiene idempotencia cuando aplica.
- [ ] AC-02529 — TechnicalReports: tiene loading state.
- [ ] AC-02530 — DynamicForms: tiene error state.
- [ ] AC-02531 — DynamicForms: tiene empty state.
- [ ] AC-02532 — DynamicForms: tiene offline state cuando aplica.
- [ ] AC-02533 — DynamicForms: tiene forbidden state.
- [ ] AC-02534 — DynamicForms: tiene mensajes en español.
- [ ] AC-02535 — DynamicForms: no muestra ObjectIds.
- [ ] AC-02536 — DynamicForms: no introduce any.
- [ ] AC-02537 — DynamicForms: no introduce casts inseguros.
- [ ] AC-02538 — DynamicForms: no usa null como estado de negocio.
- [ ] AC-02539 — DynamicForms: no duplica enums.
- [ ] AC-02540 — DynamicForms: no duplica query keys.
- [ ] AC-02541 — DeliveryRecords: tiene prueba unitaria.
- [ ] AC-02542 — DeliveryRecords: tiene prueba de integración.
- [ ] AC-02543 — DeliveryRecords: tiene prueba negativa.
- [ ] AC-02544 — DeliveryRecords: tiene prueba E2E crítica.
- [ ] AC-02545 — DeliveryRecords: tiene documentación actualizada.
- [ ] AC-02546 — DeliveryRecords: tiene backup del archivo modificado.
- [ ] AC-02547 — DeliveryRecords: pasa typecheck.
- [ ] AC-02548 — DeliveryRecords: pasa lint sin warnings.
- [ ] AC-02549 — DeliveryRecords: pasa build.
- [ ] AC-02550 — DeliveryRecords: pasa verify.
- [ ] AC-02551 — DeliveryRecords: respeta mobile-first.
- [ ] AC-02552 — ClientAcceptance: respeta accesibilidad.
- [ ] AC-02553 — ClientAcceptance: respeta privacidad.
- [ ] AC-02554 — ClientAcceptance: respeta performance budget.
- [ ] AC-02555 — ClientAcceptance: registra métricas verificables.
- [ ] AC-02556 — ClientAcceptance: tiene fallback.
- [ ] AC-02557 — ClientAcceptance: tiene estrategia de migración.
- [ ] AC-02558 — ClientAcceptance: conserva compatibilidad.
- [ ] AC-02559 — ClientAcceptance: no borra datos.
- [ ] AC-02560 — ClientAcceptance: no ejecuta Git.
- [ ] AC-02561 — SES: tiene una fuente de verdad identificada.
- [ ] AC-02562 — SES: tiene owner definido.
- [ ] AC-02563 — SESApproval: tiene alcance y fuera de alcance.
- [ ] AC-02564 — SESApproval: tiene contrato versionado.
- [ ] AC-02565 — SESApproval: tiene regla de dominio probada.
- [ ] AC-02566 — SESApproval: tiene autorización backend.
- [ ] AC-02567 — SESApproval: tiene auditoría.
- [ ] AC-02568 — SESApproval: tiene idempotencia cuando aplica.
- [ ] AC-02569 — SESApproval: tiene loading state.
- [ ] AC-02570 — SESApproval: tiene error state.
- [ ] AC-02571 — SESApproval: tiene empty state.
- [ ] AC-02572 — SESApproval: tiene offline state cuando aplica.
- [ ] AC-02573 — SESApproval: tiene forbidden state.
- [ ] AC-02574 — Invoices: tiene mensajes en español.
- [ ] AC-02575 — Invoices: no muestra ObjectIds.
- [ ] AC-02576 — Invoices: no introduce any.
- [ ] AC-02577 — Invoices: no introduce casts inseguros.
- [ ] AC-02578 — Invoices: no usa null como estado de negocio.
- [ ] AC-02579 — Invoices: no duplica enums.
- [ ] AC-02580 — Invoices: no duplica query keys.
- [ ] AC-02581 — Invoices: tiene prueba unitaria.
- [ ] AC-02582 — Invoices: tiene prueba de integración.
- [ ] AC-02583 — Invoices: tiene prueba negativa.
- [ ] AC-02584 — Invoices: tiene prueba E2E crítica.
- [ ] AC-02585 — InvoiceApproval: tiene documentación actualizada.
- [ ] AC-02586 — InvoiceApproval: tiene backup del archivo modificado.
- [ ] AC-02587 — InvoiceApproval: pasa typecheck.
- [ ] AC-02588 — InvoiceApproval: pasa lint sin warnings.
- [ ] AC-02589 — InvoiceApproval: pasa build.
- [ ] AC-02590 — InvoiceApproval: pasa verify.
- [ ] AC-02591 — InvoiceApproval: respeta mobile-first.
- [ ] AC-02592 — InvoiceApproval: respeta accesibilidad.
- [ ] AC-02593 — InvoiceApproval: respeta privacidad.
- [ ] AC-02594 — InvoiceApproval: respeta performance budget.
- [ ] AC-02595 — InvoiceApproval: registra métricas verificables.
- [ ] AC-02596 — Payments: tiene fallback.
- [ ] AC-02597 — Payments: tiene estrategia de migración.
- [ ] AC-02598 — Payments: conserva compatibilidad.
- [ ] AC-02599 — Payments: no borra datos.
- [ ] AC-02600 — Payments: no ejecuta Git.
- [ ] AC-02601 — Closure: tiene una fuente de verdad identificada.
- [ ] AC-02602 — Closure: tiene owner definido.
- [ ] AC-02603 — Closure: tiene alcance y fuera de alcance.
- [ ] AC-02604 — Closure: tiene contrato versionado.
- [ ] AC-02605 — Closure: tiene regla de dominio probada.
- [ ] AC-02606 — Closure: tiene autorización backend.
- [ ] AC-02607 — Costs: tiene auditoría.
- [ ] AC-02608 — Costs: tiene idempotencia cuando aplica.
- [ ] AC-02609 — Costs: tiene loading state.
- [ ] AC-02610 — Costs: tiene error state.
- [ ] AC-02611 — Costs: tiene empty state.
- [ ] AC-02612 — Costs: tiene offline state cuando aplica.
- [ ] AC-02613 — Costs: tiene forbidden state.
- [ ] AC-02614 — Costs: tiene mensajes en español.
- [ ] AC-02615 — Costs: no muestra ObjectIds.
- [ ] AC-02616 — Costs: no introduce any.
- [ ] AC-02617 — Costs: no introduce casts inseguros.
- [ ] AC-02618 — Inventory: no usa null como estado de negocio.
- [ ] AC-02619 — Inventory: no duplica enums.
- [ ] AC-02620 — Inventory: no duplica query keys.
- [ ] AC-02621 — Inventory: tiene prueba unitaria.
- [ ] AC-02622 — Inventory: tiene prueba de integración.
- [ ] AC-02623 — Inventory: tiene prueba negativa.
- [ ] AC-02624 — Inventory: tiene prueba E2E crítica.
- [ ] AC-02625 — Inventory: tiene documentación actualizada.
- [ ] AC-02626 — Inventory: tiene backup del archivo modificado.
- [ ] AC-02627 — Inventory: pasa typecheck.
- [ ] AC-02628 — Inventory: pasa lint sin warnings.
- [ ] AC-02629 — Tools: pasa build.
- [ ] AC-02630 — Tools: pasa verify.
- [ ] AC-02631 — Tools: respeta mobile-first.
- [ ] AC-02632 — Tools: respeta accesibilidad.
- [ ] AC-02633 — Tools: respeta privacidad.
- [ ] AC-02634 — Tools: respeta performance budget.
- [ ] AC-02635 — Tools: registra métricas verificables.
- [ ] AC-02636 — Tools: tiene fallback.
- [ ] AC-02637 — Tools: tiene estrategia de migración.
- [ ] AC-02638 — Tools: conserva compatibilidad.
- [ ] AC-02639 — Tools: no borra datos.
- [ ] AC-02640 — Fleet: no ejecuta Git.
- [ ] AC-02641 — Assets: tiene una fuente de verdad identificada.
- [ ] AC-02642 — Assets: tiene owner definido.
- [ ] AC-02643 — Assets: tiene alcance y fuera de alcance.
- [ ] AC-02644 — Assets: tiene contrato versionado.
- [ ] AC-02645 — Assets: tiene regla de dominio probada.
- [ ] AC-02646 — Assets: tiene autorización backend.
- [ ] AC-02647 — Assets: tiene auditoría.
- [ ] AC-02648 — Assets: tiene idempotencia cuando aplica.
- [ ] AC-02649 — Assets: tiene loading state.
- [ ] AC-02650 — Assets: tiene error state.
- [ ] AC-02651 — Maintenance: tiene empty state.
- [ ] AC-02652 — Maintenance: tiene offline state cuando aplica.
- [ ] AC-02653 — Maintenance: tiene forbidden state.
- [ ] AC-02654 — Maintenance: tiene mensajes en español.
- [ ] AC-02655 — Maintenance: no muestra ObjectIds.
- [ ] AC-02656 — Maintenance: no introduce any.
- [ ] AC-02657 — Maintenance: no introduce casts inseguros.
- [ ] AC-02658 — Maintenance: no usa null como estado de negocio.
- [ ] AC-02659 — Maintenance: no duplica enums.
- [ ] AC-02660 — Maintenance: no duplica query keys.
- [ ] AC-02661 — Maintenance: tiene prueba unitaria.
- [ ] AC-02662 — Dashboard: tiene prueba de integración.
- [ ] AC-02663 — Dashboard: tiene prueba negativa.
- [ ] AC-02664 — Dashboard: tiene prueba E2E crítica.
- [ ] AC-02665 — Dashboard: tiene documentación actualizada.
- [ ] AC-02666 — Dashboard: tiene backup del archivo modificado.
- [ ] AC-02667 — Dashboard: pasa typecheck.
- [ ] AC-02668 — Dashboard: pasa lint sin warnings.
- [ ] AC-02669 — Dashboard: pasa build.
- [ ] AC-02670 — Dashboard: pasa verify.
- [ ] AC-02671 — Dashboard: respeta mobile-first.
- [ ] AC-02672 — Dashboard: respeta accesibilidad.
- [ ] AC-02673 — SLA: respeta privacidad.
- [ ] AC-02674 — SLA: respeta performance budget.
- [ ] AC-02675 — SLA: registra métricas verificables.
- [ ] AC-02676 — SLA: tiene fallback.
- [ ] AC-02677 — SLA: tiene estrategia de migración.
- [ ] AC-02678 — SLA: conserva compatibilidad.
- [ ] AC-02679 — SLA: no borra datos.
- [ ] AC-02680 — SLA: no ejecuta Git.
- [ ] AC-02681 — Dispatch: tiene una fuente de verdad identificada.
- [ ] AC-02682 — Dispatch: tiene owner definido.
- [ ] AC-02683 — Dispatch: tiene alcance y fuera de alcance.
- [ ] AC-02684 — Notifications: tiene contrato versionado.
- [ ] AC-02685 — Notifications: tiene regla de dominio probada.
- [ ] AC-02686 — Notifications: tiene autorización backend.
- [ ] AC-02687 — Notifications: tiene auditoría.
- [ ] AC-02688 — Notifications: tiene idempotencia cuando aplica.
- [ ] AC-02689 — Notifications: tiene loading state.
- [ ] AC-02690 — Notifications: tiene error state.
- [ ] AC-02691 — Notifications: tiene empty state.
- [ ] AC-02692 — Notifications: tiene offline state cuando aplica.
- [ ] AC-02693 — Notifications: tiene forbidden state.
- [ ] AC-02694 — Notifications: tiene mensajes en español.
- [ ] AC-02695 — ClientPortal: no muestra ObjectIds.
- [ ] AC-02696 — ClientPortal: no introduce any.
- [ ] AC-02697 — ClientPortal: no introduce casts inseguros.
- [ ] AC-02698 — ClientPortal: no usa null como estado de negocio.
- [ ] AC-02699 — ClientPortal: no duplica enums.
- [ ] AC-02700 — ClientPortal: no duplica query keys.
- [ ] AC-02701 — ClientPortal: tiene prueba unitaria.
- [ ] AC-02702 — ClientPortal: tiene prueba de integración.
- [ ] AC-02703 — ClientPortal: tiene prueba negativa.
- [ ] AC-02704 — ClientPortal: tiene prueba E2E crítica.
- [ ] AC-02705 — ClientPortal: tiene documentación actualizada.
- [ ] AC-02706 — HistoricalArchive: tiene backup del archivo modificado.
- [ ] AC-02707 — HistoricalArchive: pasa typecheck.
- [ ] AC-02708 — HistoricalArchive: pasa lint sin warnings.
- [ ] AC-02709 — HistoricalArchive: pasa build.
- [ ] AC-02710 — HistoricalArchive: pasa verify.
- [ ] AC-02711 — HistoricalArchive: respeta mobile-first.
- [ ] AC-02712 — HistoricalArchive: respeta accesibilidad.
- [ ] AC-02713 — HistoricalArchive: respeta privacidad.
- [ ] AC-02714 — HistoricalArchive: respeta performance budget.
- [ ] AC-02715 — HistoricalArchive: registra métricas verificables.
- [ ] AC-02716 — HistoricalArchive: tiene fallback.
- [ ] AC-02717 — Backups: tiene estrategia de migración.
- [ ] AC-02718 — Backups: conserva compatibilidad.
- [ ] AC-02719 — Backups: no borra datos.
- [ ] AC-02720 — Backups: no ejecuta Git.
- [ ] AC-02721 — Audit: tiene una fuente de verdad identificada.
- [ ] AC-02722 — Audit: tiene owner definido.
- [ ] AC-02723 — Audit: tiene alcance y fuera de alcance.
- [ ] AC-02724 — Audit: tiene contrato versionado.
- [ ] AC-02725 — Audit: tiene regla de dominio probada.
- [ ] AC-02726 — Audit: tiene autorización backend.
- [ ] AC-02727 — Audit: tiene auditoría.
- [ ] AC-02728 — Observability: tiene idempotencia cuando aplica.
- [ ] AC-02729 — Observability: tiene loading state.
- [ ] AC-02730 — Observability: tiene error state.
- [ ] AC-02731 — Observability: tiene empty state.
- [ ] AC-02732 — Observability: tiene offline state cuando aplica.
- [ ] AC-02733 — Observability: tiene forbidden state.
- [ ] AC-02734 — Observability: tiene mensajes en español.
- [ ] AC-02735 — Observability: no muestra ObjectIds.
- [ ] AC-02736 — Observability: no introduce any.
- [ ] AC-02737 — Observability: no introduce casts inseguros.
- [ ] AC-02738 — Observability: no usa null como estado de negocio.
- [ ] AC-02739 — Security: no duplica enums.
- [ ] AC-02740 — Security: no duplica query keys.
- [ ] AC-02741 — Security: tiene prueba unitaria.
- [ ] AC-02742 — Security: tiene prueba de integración.
- [ ] AC-02743 — Security: tiene prueba negativa.
- [ ] AC-02744 — Security: tiene prueba E2E crítica.
- [ ] AC-02745 — Security: tiene documentación actualizada.
- [ ] AC-02746 — Security: tiene backup del archivo modificado.
- [ ] AC-02747 — Security: pasa typecheck.
- [ ] AC-02748 — Security: pasa lint sin warnings.
- [ ] AC-02749 — Security: pasa build.
- [ ] AC-02750 — Accessibility: pasa verify.
- [ ] AC-02751 — Accessibility: respeta mobile-first.
- [ ] AC-02752 — Accessibility: respeta accesibilidad.
- [ ] AC-02753 — Accessibility: respeta privacidad.
- [ ] AC-02754 — Accessibility: respeta performance budget.
- [ ] AC-02755 — Accessibility: registra métricas verificables.
- [ ] AC-02756 — Accessibility: tiene fallback.
- [ ] AC-02757 — Accessibility: tiene estrategia de migración.
- [ ] AC-02758 — Accessibility: conserva compatibilidad.
- [ ] AC-02759 — Accessibility: no borra datos.
- [ ] AC-02760 — Accessibility: no ejecuta Git.
- [ ] AC-02761 — Performance: tiene una fuente de verdad identificada.
- [ ] AC-02762 — Performance: tiene owner definido.
- [ ] AC-02763 — Performance: tiene alcance y fuera de alcance.
- [ ] AC-02764 — Performance: tiene contrato versionado.
- [ ] AC-02765 — Performance: tiene regla de dominio probada.
- [ ] AC-02766 — Performance: tiene autorización backend.
- [ ] AC-02767 — Performance: tiene auditoría.
- [ ] AC-02768 — Performance: tiene idempotencia cuando aplica.
- [ ] AC-02769 — Performance: tiene loading state.
- [ ] AC-02770 — Performance: tiene error state.
- [ ] AC-02771 — Performance: tiene empty state.
- [ ] AC-02772 — Testing: tiene offline state cuando aplica.
- [ ] AC-02773 — Testing: tiene forbidden state.
- [ ] AC-02774 — Testing: tiene mensajes en español.
- [ ] AC-02775 — Testing: no muestra ObjectIds.
- [ ] AC-02776 — Testing: no introduce any.
- [ ] AC-02777 — Testing: no introduce casts inseguros.
- [ ] AC-02778 — Testing: no usa null como estado de negocio.
- [ ] AC-02779 — Testing: no duplica enums.
- [ ] AC-02780 — Testing: no duplica query keys.
- [ ] AC-02781 — Testing: tiene prueba unitaria.
- [ ] AC-02782 — Testing: tiene prueba de integración.
- [ ] AC-02783 — Documentation: tiene prueba negativa.
- [ ] AC-02784 — Documentation: tiene prueba E2E crítica.
- [ ] AC-02785 — Documentation: tiene documentación actualizada.
- [ ] AC-02786 — Documentation: tiene backup del archivo modificado.
- [ ] AC-02787 — Documentation: pasa typecheck.
- [ ] AC-02788 — Documentation: pasa lint sin warnings.
- [ ] AC-02789 — Documentation: pasa build.
- [ ] AC-02790 — Documentation: pasa verify.
- [ ] AC-02791 — Documentation: respeta mobile-first.
- [ ] AC-02792 — Documentation: respeta accesibilidad.
- [ ] AC-02793 — Documentation: respeta privacidad.
- [ ] AC-02794 — Deployment: respeta performance budget.
- [ ] AC-02795 — Deployment: registra métricas verificables.
- [ ] AC-02796 — Deployment: tiene fallback.
- [ ] AC-02797 — Deployment: tiene estrategia de migración.
- [ ] AC-02798 — Deployment: conserva compatibilidad.
- [ ] AC-02799 — Deployment: no borra datos.
- [ ] AC-02800 — Deployment: no ejecuta Git.
- [ ] AC-02801 — Innovation: tiene una fuente de verdad identificada.
- [ ] AC-02802 — Innovation: tiene owner definido.
- [ ] AC-02803 — Innovation: tiene alcance y fuera de alcance.
- [ ] AC-02804 — Innovation: tiene contrato versionado.
- [ ] AC-02805 — AIAdapter: tiene regla de dominio probada.
- [ ] AC-02806 — AIAdapter: tiene autorización backend.
- [ ] AC-02807 — AIAdapter: tiene auditoría.
- [ ] AC-02808 — AIAdapter: tiene idempotencia cuando aplica.
- [ ] AC-02809 — AIAdapter: tiene loading state.
- [ ] AC-02810 — AIAdapter: tiene error state.
- [ ] AC-02811 — AIAdapter: tiene empty state.
- [ ] AC-02812 — AIAdapter: tiene offline state cuando aplica.
- [ ] AC-02813 — AIAdapter: tiene forbidden state.
- [ ] AC-02814 — AIAdapter: tiene mensajes en español.
- [ ] AC-02815 — AIAdapter: no muestra ObjectIds.
- [ ] AC-02816 — Integrations: no introduce any.
- [ ] AC-02817 — Integrations: no introduce casts inseguros.
- [ ] AC-02818 — Integrations: no usa null como estado de negocio.
- [ ] AC-02819 — Integrations: no duplica enums.
- [ ] AC-02820 — Integrations: no duplica query keys.
- [ ] AC-02821 — Integrations: tiene prueba unitaria.
- [ ] AC-02822 — Integrations: tiene prueba de integración.
- [ ] AC-02823 — Integrations: tiene prueba negativa.
- [ ] AC-02824 — Integrations: tiene prueba E2E crítica.
- [ ] AC-02825 — Integrations: tiene documentación actualizada.
- [ ] AC-02826 — Integrations: tiene backup del archivo modificado.
- [ ] AC-02827 — ProductGovernance: pasa typecheck.
- [ ] AC-02828 — ProductGovernance: pasa lint sin warnings.
- [ ] AC-02829 — ProductGovernance: pasa build.
- [ ] AC-02830 — ProductGovernance: pasa verify.
- [ ] AC-02831 — ProductGovernance: respeta mobile-first.
- [ ] AC-02832 — ProductGovernance: respeta accesibilidad.
- [ ] AC-02833 — ProductGovernance: respeta privacidad.
- [ ] AC-02834 — ProductGovernance: respeta performance budget.
- [ ] AC-02835 — ProductGovernance: registra métricas verificables.
- [ ] AC-02836 — ProductGovernance: tiene fallback.
- [ ] AC-02837 — ProductGovernance: tiene estrategia de migración.
- [ ] AC-02838 — SourceTraceability: conserva compatibilidad.
- [ ] AC-02839 — SourceTraceability: no borra datos.
- [ ] AC-02840 — SourceTraceability: no ejecuta Git.
- [ ] AC-02841 — AgentCoordinator: tiene una fuente de verdad identificada.
- [ ] AC-02842 — AgentCoordinator: tiene owner definido.
- [ ] AC-02843 — AgentCoordinator: tiene alcance y fuera de alcance.
- [ ] AC-02844 — AgentCoordinator: tiene contrato versionado.
- [ ] AC-02845 — AgentCoordinator: tiene regla de dominio probada.
- [ ] AC-02846 — AgentCoordinator: tiene autorización backend.
- [ ] AC-02847 — AgentCoordinator: tiene auditoría.
- [ ] AC-02848 — AgentCoordinator: tiene idempotencia cuando aplica.
- [ ] AC-02849 — AgentHandoff: tiene loading state.
- [ ] AC-02850 — AgentHandoff: tiene error state.
- [ ] AC-02851 — AgentHandoff: tiene empty state.
- [ ] AC-02852 — AgentHandoff: tiene offline state cuando aplica.
- [ ] AC-02853 — AgentHandoff: tiene forbidden state.
- [ ] AC-02854 — AgentHandoff: tiene mensajes en español.
- [ ] AC-02855 — AgentHandoff: no muestra ObjectIds.
- [ ] AC-02856 — AgentHandoff: no introduce any.
- [ ] AC-02857 — AgentHandoff: no introduce casts inseguros.
- [ ] AC-02858 — AgentHandoff: no usa null como estado de negocio.
- [ ] AC-02859 — AgentHandoff: no duplica enums.
- [ ] AC-02860 — SharedTypes: no duplica query keys.
- [ ] AC-02861 — SharedTypes: tiene prueba unitaria.
- [ ] AC-02862 — SharedTypes: tiene prueba de integración.
- [ ] AC-02863 — SharedTypes: tiene prueba negativa.
- [ ] AC-02864 — SharedTypes: tiene prueba E2E crítica.
- [ ] AC-02865 — SharedTypes: tiene documentación actualizada.
- [ ] AC-02866 — SharedTypes: tiene backup del archivo modificado.
- [ ] AC-02867 — SharedTypes: pasa typecheck.
- [ ] AC-02868 — SharedTypes: pasa lint sin warnings.
- [ ] AC-02869 — SharedTypes: pasa build.
- [ ] AC-02870 — SharedTypes: pasa verify.
- [ ] AC-02871 — DomainFSM: respeta mobile-first.
- [ ] AC-02872 — DomainFSM: respeta accesibilidad.
- [ ] AC-02873 — DomainFSM: respeta privacidad.
- [ ] AC-02874 — DomainFSM: respeta performance budget.
- [ ] AC-02875 — DomainFSM: registra métricas verificables.
- [ ] AC-02876 — DomainFSM: tiene fallback.
- [ ] AC-02877 — DomainFSM: tiene estrategia de migración.
- [ ] AC-02878 — DomainFSM: conserva compatibilidad.
- [ ] AC-02879 — DomainFSM: no borra datos.
- [ ] AC-02880 — DomainFSM: no ejecuta Git.
- [ ] AC-02881 — Config: tiene una fuente de verdad identificada.
- [ ] AC-02882 — Auth: tiene owner definido.
- [ ] AC-02883 — Auth: tiene alcance y fuera de alcance.
- [ ] AC-02884 — Auth: tiene contrato versionado.
- [ ] AC-02885 — Auth: tiene regla de dominio probada.
- [ ] AC-02886 — Auth: tiene autorización backend.
- [ ] AC-02887 — Auth: tiene auditoría.
- [ ] AC-02888 — Auth: tiene idempotencia cuando aplica.
- [ ] AC-02889 — Auth: tiene loading state.
- [ ] AC-02890 — Auth: tiene error state.
- [ ] AC-02891 — Auth: tiene empty state.
- [ ] AC-02892 — Auth: tiene offline state cuando aplica.
- [ ] AC-02893 — Session: tiene forbidden state.
- [ ] AC-02894 — Session: tiene mensajes en español.
- [ ] AC-02895 — Session: no muestra ObjectIds.
- [ ] AC-02896 — Session: no introduce any.
- [ ] AC-02897 — Session: no introduce casts inseguros.
- [ ] AC-02898 — Session: no usa null como estado de negocio.
- [ ] AC-02899 — Session: no duplica enums.
- [ ] AC-02900 — Session: no duplica query keys.
- [ ] AC-02901 — Session: tiene prueba unitaria.
- [ ] AC-02902 — Session: tiene prueba de integración.
- [ ] AC-02903 — Session: tiene prueba negativa.
- [ ] AC-02904 — WebAuthn: tiene prueba E2E crítica.
- [ ] AC-02905 — WebAuthn: tiene documentación actualizada.
- [ ] AC-02906 — WebAuthn: tiene backup del archivo modificado.
- [ ] AC-02907 — WebAuthn: pasa typecheck.
- [ ] AC-02908 — WebAuthn: pasa lint sin warnings.
- [ ] AC-02909 — WebAuthn: pasa build.
- [ ] AC-02910 — WebAuthn: pasa verify.
- [ ] AC-02911 — WebAuthn: respeta mobile-first.
- [ ] AC-02912 — WebAuthn: respeta accesibilidad.
- [ ] AC-02913 — WebAuthn: respeta privacidad.
- [ ] AC-02914 — WebAuthn: respeta performance budget.
- [ ] AC-02915 — RBAC: registra métricas verificables.
- [ ] AC-02916 — RBAC: tiene fallback.
- [ ] AC-02917 — RBAC: tiene estrategia de migración.
- [ ] AC-02918 — RBAC: conserva compatibilidad.
- [ ] AC-02919 — RBAC: no borra datos.
- [ ] AC-02920 — RBAC: no ejecuta Git.
- [ ] AC-02921 — Clients: tiene una fuente de verdad identificada.
- [ ] AC-02922 — Clients: tiene owner definido.
- [ ] AC-02923 — Clients: tiene alcance y fuera de alcance.
- [ ] AC-02924 — Clients: tiene contrato versionado.
- [ ] AC-02925 — Clients: tiene regla de dominio probada.
- [ ] AC-02926 — Sites: tiene autorización backend.
- [ ] AC-02927 — Sites: tiene auditoría.
- [ ] AC-02928 — Sites: tiene idempotencia cuando aplica.
- [ ] AC-02929 — Sites: tiene loading state.
- [ ] AC-02930 — Sites: tiene error state.
- [ ] AC-02931 — Sites: tiene empty state.
- [ ] AC-02932 — Sites: tiene offline state cuando aplica.
- [ ] AC-02933 — Sites: tiene forbidden state.
- [ ] AC-02934 — Sites: tiene mensajes en español.
- [ ] AC-02935 — Sites: no muestra ObjectIds.
- [ ] AC-02936 — Sites: no introduce any.
- [ ] AC-02937 — Contacts: no introduce casts inseguros.
- [ ] AC-02938 — Contacts: no usa null como estado de negocio.
- [ ] AC-02939 — Contacts: no duplica enums.
- [ ] AC-02940 — Contacts: no duplica query keys.
- [ ] AC-02941 — Contacts: tiene prueba unitaria.
- [ ] AC-02942 — Contacts: tiene prueba de integración.
- [ ] AC-02943 — Contacts: tiene prueba negativa.
- [ ] AC-02944 — Contacts: tiene prueba E2E crítica.
- [ ] AC-02945 — Contacts: tiene documentación actualizada.
- [ ] AC-02946 — Contacts: tiene backup del archivo modificado.
- [ ] AC-02947 — Contacts: pasa typecheck.
- [ ] AC-02948 — WorkRequests: pasa lint sin warnings.
- [ ] AC-02949 — WorkRequests: pasa build.
- [ ] AC-02950 — WorkRequests: pasa verify.
- [ ] AC-02951 — WorkRequests: respeta mobile-first.
- [ ] AC-02952 — WorkRequests: respeta accesibilidad.
- [ ] AC-02953 — WorkRequests: respeta privacidad.
- [ ] AC-02954 — WorkRequests: respeta performance budget.
- [ ] AC-02955 — WorkRequests: registra métricas verificables.
- [ ] AC-02956 — WorkRequests: tiene fallback.
- [ ] AC-02957 — WorkRequests: tiene estrategia de migración.
- [ ] AC-02958 — WorkRequests: conserva compatibilidad.
- [ ] AC-02959 — SiteVisits: no borra datos.
- [ ] AC-02960 — SiteVisits: no ejecuta Git.
- [ ] AC-02961 — Proposals: tiene una fuente de verdad identificada.
- [ ] AC-02962 — Proposals: tiene owner definido.
- [ ] AC-02963 — Proposals: tiene alcance y fuera de alcance.
- [ ] AC-02964 — Proposals: tiene contrato versionado.
- [ ] AC-02965 — Proposals: tiene regla de dominio probada.
- [ ] AC-02966 — Proposals: tiene autorización backend.
- [ ] AC-02967 — Proposals: tiene auditoría.
- [ ] AC-02968 — Proposals: tiene idempotencia cuando aplica.
- [ ] AC-02969 — Proposals: tiene loading state.
- [ ] AC-02970 — PurchaseOrders: tiene error state.
- [ ] AC-02971 — PurchaseOrders: tiene empty state.
- [ ] AC-02972 — PurchaseOrders: tiene offline state cuando aplica.
- [ ] AC-02973 — PurchaseOrders: tiene forbidden state.
- [ ] AC-02974 — PurchaseOrders: tiene mensajes en español.
- [ ] AC-02975 — PurchaseOrders: no muestra ObjectIds.
- [ ] AC-02976 — PurchaseOrders: no introduce any.
- [ ] AC-02977 — PurchaseOrders: no introduce casts inseguros.
- [ ] AC-02978 — PurchaseOrders: no usa null como estado de negocio.
- [ ] AC-02979 — PurchaseOrders: no duplica enums.
- [ ] AC-02980 — PurchaseOrders: no duplica query keys.
- [ ] AC-02981 — ServiceCases: tiene prueba unitaria.
- [ ] AC-02982 — ServiceCases: tiene prueba de integración.
- [ ] AC-02983 — ServiceCases: tiene prueba negativa.
- [ ] AC-02984 — ServiceCases: tiene prueba E2E crítica.
- [ ] AC-02985 — ServiceCases: tiene documentación actualizada.
- [ ] AC-02986 — ServiceCases: tiene backup del archivo modificado.
- [ ] AC-02987 — ServiceCases: pasa typecheck.
- [ ] AC-02988 — ServiceCases: pasa lint sin warnings.
- [ ] AC-02989 — ServiceCases: pasa build.
- [ ] AC-02990 — ServiceCases: pasa verify.
- [ ] AC-02991 — ServiceCases: respeta mobile-first.
- [ ] AC-02992 — WorkOrders: respeta accesibilidad.
- [ ] AC-02993 — WorkOrders: respeta privacidad.
- [ ] AC-02994 — WorkOrders: respeta performance budget.
- [ ] AC-02995 — WorkOrders: registra métricas verificables.
- [ ] AC-02996 — WorkOrders: tiene fallback.
- [ ] AC-02997 — WorkOrders: tiene estrategia de migración.
- [ ] AC-02998 — WorkOrders: conserva compatibilidad.
- [ ] AC-02999 — WorkOrders: no borra datos.
- [ ] AC-03000 — WorkOrders: no ejecuta Git.
- [ ] AC-03001 — PlanningPackets: tiene una fuente de verdad identificada.
- [ ] AC-03002 — PlanningPackets: tiene owner definido.
- [ ] AC-03003 — Kits: tiene alcance y fuera de alcance.
- [ ] AC-03004 — Kits: tiene contrato versionado.
- [ ] AC-03005 — Kits: tiene regla de dominio probada.
- [ ] AC-03006 — Kits: tiene autorización backend.
- [ ] AC-03007 — Kits: tiene auditoría.
- [ ] AC-03008 — Kits: tiene idempotencia cuando aplica.
- [ ] AC-03009 — Kits: tiene loading state.
- [ ] AC-03010 — Kits: tiene error state.
- [ ] AC-03011 — Kits: tiene empty state.
- [ ] AC-03012 — Kits: tiene offline state cuando aplica.
- [ ] AC-03013 — Kits: tiene forbidden state.
- [ ] AC-03014 — Safety: tiene mensajes en español.
- [ ] AC-03015 — Safety: no muestra ObjectIds.
- [ ] AC-03016 — Safety: no introduce any.
- [ ] AC-03017 — Safety: no introduce casts inseguros.
- [ ] AC-03018 — Safety: no usa null como estado de negocio.
- [ ] AC-03019 — Safety: no duplica enums.
- [ ] AC-03020 — Safety: no duplica query keys.
- [ ] AC-03021 — Safety: tiene prueba unitaria.
- [ ] AC-03022 — Safety: tiene prueba de integración.
- [ ] AC-03023 — Safety: tiene prueba negativa.
- [ ] AC-03024 — Safety: tiene prueba E2E crítica.
- [ ] AC-03025 — ExecutionSessions: tiene documentación actualizada.
- [ ] AC-03026 — ExecutionSessions: tiene backup del archivo modificado.
- [ ] AC-03027 — ExecutionSessions: pasa typecheck.
- [ ] AC-03028 — ExecutionSessions: pasa lint sin warnings.
- [ ] AC-03029 — ExecutionSessions: pasa build.
- [ ] AC-03030 — ExecutionSessions: pasa verify.
- [ ] AC-03031 — ExecutionSessions: respeta mobile-first.
- [ ] AC-03032 — ExecutionSessions: respeta accesibilidad.
- [ ] AC-03033 — ExecutionSessions: respeta privacidad.
- [ ] AC-03034 — ExecutionSessions: respeta performance budget.
- [ ] AC-03035 — ExecutionSessions: registra métricas verificables.
- [ ] AC-03036 — OfflineQueue: tiene fallback.
- [ ] AC-03037 — OfflineQueue: tiene estrategia de migración.
- [ ] AC-03038 — OfflineQueue: conserva compatibilidad.
- [ ] AC-03039 — OfflineQueue: no borra datos.
- [ ] AC-03040 — OfflineQueue: no ejecuta Git.
- [ ] AC-03041 — SyncConflicts: tiene una fuente de verdad identificada.
- [ ] AC-03042 — SyncConflicts: tiene owner definido.
- [ ] AC-03043 — SyncConflicts: tiene alcance y fuera de alcance.
- [ ] AC-03044 — SyncConflicts: tiene contrato versionado.
- [ ] AC-03045 — SyncConflicts: tiene regla de dominio probada.
- [ ] AC-03046 — SyncConflicts: tiene autorización backend.
- [ ] AC-03047 — Evidences: tiene auditoría.
- [ ] AC-03048 — Evidences: tiene idempotencia cuando aplica.
- [ ] AC-03049 — Evidences: tiene loading state.
- [ ] AC-03050 — Evidences: tiene error state.
- [ ] AC-03051 — Evidences: tiene empty state.
- [ ] AC-03052 — Evidences: tiene offline state cuando aplica.
- [ ] AC-03053 — Evidences: tiene forbidden state.
- [ ] AC-03054 — Evidences: tiene mensajes en español.
- [ ] AC-03055 — Evidences: no muestra ObjectIds.
- [ ] AC-03056 — Evidences: no introduce any.
- [ ] AC-03057 — Evidences: no introduce casts inseguros.
- [ ] AC-03058 — FileAssets: no usa null como estado de negocio.
- [ ] AC-03059 — FileAssets: no duplica enums.
- [ ] AC-03060 — FileAssets: no duplica query keys.
- [ ] AC-03061 — FileAssets: tiene prueba unitaria.
- [ ] AC-03062 — FileAssets: tiene prueba de integración.
- [ ] AC-03063 — FileAssets: tiene prueba negativa.
- [ ] AC-03064 — FileAssets: tiene prueba E2E crítica.
- [ ] AC-03065 — FileAssets: tiene documentación actualizada.
- [ ] AC-03066 — FileAssets: tiene backup del archivo modificado.
- [ ] AC-03067 — FileAssets: pasa typecheck.
- [ ] AC-03068 — FileAssets: pasa lint sin warnings.
- [ ] AC-03069 — LineInspection: pasa build.
- [ ] AC-03070 — LineInspection: pasa verify.
- [ ] AC-03071 — LineInspection: respeta mobile-first.
- [ ] AC-03072 — LineInspection: respeta accesibilidad.
- [ ] AC-03073 — LineInspection: respeta privacidad.
- [ ] AC-03074 — LineInspection: respeta performance budget.
- [ ] AC-03075 — LineInspection: registra métricas verificables.
- [ ] AC-03076 — LineInspection: tiene fallback.
- [ ] AC-03077 — LineInspection: tiene estrategia de migración.
- [ ] AC-03078 — LineInspection: conserva compatibilidad.
- [ ] AC-03079 — LineInspection: no borra datos.
- [ ] AC-03080 — CCTV: no ejecuta Git.
- [ ] AC-03081 — TechnicalReports: tiene una fuente de verdad identificada.
- [ ] AC-03082 — TechnicalReports: tiene owner definido.
- [ ] AC-03083 — TechnicalReports: tiene alcance y fuera de alcance.
- [ ] AC-03084 — TechnicalReports: tiene contrato versionado.
- [ ] AC-03085 — TechnicalReports: tiene regla de dominio probada.
- [ ] AC-03086 — TechnicalReports: tiene autorización backend.
- [ ] AC-03087 — TechnicalReports: tiene auditoría.
- [ ] AC-03088 — TechnicalReports: tiene idempotencia cuando aplica.
- [ ] AC-03089 — TechnicalReports: tiene loading state.
- [ ] AC-03090 — TechnicalReports: tiene error state.
- [ ] AC-03091 — DynamicForms: tiene empty state.
- [ ] AC-03092 — DynamicForms: tiene offline state cuando aplica.
- [ ] AC-03093 — DynamicForms: tiene forbidden state.
- [ ] AC-03094 — DynamicForms: tiene mensajes en español.
- [ ] AC-03095 — DynamicForms: no muestra ObjectIds.
- [ ] AC-03096 — DynamicForms: no introduce any.
- [ ] AC-03097 — DynamicForms: no introduce casts inseguros.
- [ ] AC-03098 — DynamicForms: no usa null como estado de negocio.
- [ ] AC-03099 — DynamicForms: no duplica enums.
- [ ] AC-03100 — DynamicForms: no duplica query keys.
- [ ] AC-03101 — DynamicForms: tiene prueba unitaria.
- [ ] AC-03102 — DeliveryRecords: tiene prueba de integración.
- [ ] AC-03103 — DeliveryRecords: tiene prueba negativa.
- [ ] AC-03104 — DeliveryRecords: tiene prueba E2E crítica.
- [ ] AC-03105 — DeliveryRecords: tiene documentación actualizada.
- [ ] AC-03106 — DeliveryRecords: tiene backup del archivo modificado.
- [ ] AC-03107 — DeliveryRecords: pasa typecheck.
- [ ] AC-03108 — DeliveryRecords: pasa lint sin warnings.
- [ ] AC-03109 — DeliveryRecords: pasa build.
- [ ] AC-03110 — DeliveryRecords: pasa verify.
- [ ] AC-03111 — DeliveryRecords: respeta mobile-first.
- [ ] AC-03112 — DeliveryRecords: respeta accesibilidad.
- [ ] AC-03113 — ClientAcceptance: respeta privacidad.
- [ ] AC-03114 — ClientAcceptance: respeta performance budget.
- [ ] AC-03115 — ClientAcceptance: registra métricas verificables.
- [ ] AC-03116 — ClientAcceptance: tiene fallback.
- [ ] AC-03117 — ClientAcceptance: tiene estrategia de migración.
- [ ] AC-03118 — ClientAcceptance: conserva compatibilidad.
- [ ] AC-03119 — ClientAcceptance: no borra datos.
- [ ] AC-03120 — ClientAcceptance: no ejecuta Git.
- [ ] AC-03121 — SES: tiene una fuente de verdad identificada.
- [ ] AC-03122 — SES: tiene owner definido.
- [ ] AC-03123 — SES: tiene alcance y fuera de alcance.
- [ ] AC-03124 — SESApproval: tiene contrato versionado.
- [ ] AC-03125 — SESApproval: tiene regla de dominio probada.
- [ ] AC-03126 — SESApproval: tiene autorización backend.
- [ ] AC-03127 — SESApproval: tiene auditoría.
- [ ] AC-03128 — SESApproval: tiene idempotencia cuando aplica.
- [ ] AC-03129 — SESApproval: tiene loading state.
- [ ] AC-03130 — SESApproval: tiene error state.
- [ ] AC-03131 — SESApproval: tiene empty state.
- [ ] AC-03132 — SESApproval: tiene offline state cuando aplica.
- [ ] AC-03133 — SESApproval: tiene forbidden state.
- [ ] AC-03134 — SESApproval: tiene mensajes en español.
- [ ] AC-03135 — Invoices: no muestra ObjectIds.
- [ ] AC-03136 — Invoices: no introduce any.
- [ ] AC-03137 — Invoices: no introduce casts inseguros.
- [ ] AC-03138 — Invoices: no usa null como estado de negocio.
- [ ] AC-03139 — Invoices: no duplica enums.
- [ ] AC-03140 — Invoices: no duplica query keys.
- [ ] AC-03141 — Invoices: tiene prueba unitaria.
- [ ] AC-03142 — Invoices: tiene prueba de integración.
- [ ] AC-03143 — Invoices: tiene prueba negativa.
- [ ] AC-03144 — Invoices: tiene prueba E2E crítica.
- [ ] AC-03145 — Invoices: tiene documentación actualizada.
- [ ] AC-03146 — InvoiceApproval: tiene backup del archivo modificado.
- [ ] AC-03147 — InvoiceApproval: pasa typecheck.
- [ ] AC-03148 — InvoiceApproval: pasa lint sin warnings.
- [ ] AC-03149 — InvoiceApproval: pasa build.
- [ ] AC-03150 — InvoiceApproval: pasa verify.
- [ ] AC-03151 — InvoiceApproval: respeta mobile-first.
- [ ] AC-03152 — InvoiceApproval: respeta accesibilidad.
- [ ] AC-03153 — InvoiceApproval: respeta privacidad.
- [ ] AC-03154 — InvoiceApproval: respeta performance budget.
- [ ] AC-03155 — InvoiceApproval: registra métricas verificables.
- [ ] AC-03156 — InvoiceApproval: tiene fallback.
- [ ] AC-03157 — Payments: tiene estrategia de migración.
- [ ] AC-03158 — Payments: conserva compatibilidad.
- [ ] AC-03159 — Payments: no borra datos.
- [ ] AC-03160 — Payments: no ejecuta Git.
- [ ] AC-03161 — Closure: tiene una fuente de verdad identificada.
- [ ] AC-03162 — Closure: tiene owner definido.
- [ ] AC-03163 — Closure: tiene alcance y fuera de alcance.
- [ ] AC-03164 — Closure: tiene contrato versionado.
- [ ] AC-03165 — Closure: tiene regla de dominio probada.
- [ ] AC-03166 — Closure: tiene autorización backend.
- [ ] AC-03167 — Closure: tiene auditoría.
- [ ] AC-03168 — Costs: tiene idempotencia cuando aplica.
- [ ] AC-03169 — Costs: tiene loading state.
- [ ] AC-03170 — Costs: tiene error state.
- [ ] AC-03171 — Costs: tiene empty state.
- [ ] AC-03172 — Costs: tiene offline state cuando aplica.
- [ ] AC-03173 — Costs: tiene forbidden state.
- [ ] AC-03174 — Costs: tiene mensajes en español.
- [ ] AC-03175 — Costs: no muestra ObjectIds.
- [ ] AC-03176 — Costs: no introduce any.
- [ ] AC-03177 — Costs: no introduce casts inseguros.
- [ ] AC-03178 — Costs: no usa null como estado de negocio.
- [ ] AC-03179 — Inventory: no duplica enums.
- [ ] AC-03180 — Inventory: no duplica query keys.
- [ ] AC-03181 — Inventory: tiene prueba unitaria.
- [ ] AC-03182 — Inventory: tiene prueba de integración.
- [ ] AC-03183 — Inventory: tiene prueba negativa.
- [ ] AC-03184 — Inventory: tiene prueba E2E crítica.
- [ ] AC-03185 — Inventory: tiene documentación actualizada.
- [ ] AC-03186 — Inventory: tiene backup del archivo modificado.
- [ ] AC-03187 — Inventory: pasa typecheck.
- [ ] AC-03188 — Inventory: pasa lint sin warnings.
- [ ] AC-03189 — Inventory: pasa build.
- [ ] AC-03190 — Tools: pasa verify.
- [ ] AC-03191 — Tools: respeta mobile-first.
- [ ] AC-03192 — Tools: respeta accesibilidad.
- [ ] AC-03193 — Tools: respeta privacidad.
- [ ] AC-03194 — Tools: respeta performance budget.
- [ ] AC-03195 — Tools: registra métricas verificables.
- [ ] AC-03196 — Tools: tiene fallback.
- [ ] AC-03197 — Tools: tiene estrategia de migración.
- [ ] AC-03198 — Tools: conserva compatibilidad.
- [ ] AC-03199 — Tools: no borra datos.
- [ ] AC-03200 — Tools: no ejecuta Git.
- [ ] AC-03201 — Fleet: tiene una fuente de verdad identificada.
- [ ] AC-03202 — Fleet: tiene owner definido.
- [ ] AC-03203 — Fleet: tiene alcance y fuera de alcance.
- [ ] AC-03204 — Fleet: tiene contrato versionado.
- [ ] AC-03205 — Fleet: tiene regla de dominio probada.
- [ ] AC-03206 — Fleet: tiene autorización backend.
- [ ] AC-03207 — Fleet: tiene auditoría.
- [ ] AC-03208 — Fleet: tiene idempotencia cuando aplica.
- [ ] AC-03209 — Fleet: tiene loading state.
- [ ] AC-03210 — Fleet: tiene error state.
- [ ] AC-03211 — Fleet: tiene empty state.
- [ ] AC-03212 — Assets: tiene offline state cuando aplica.
- [ ] AC-03213 — Assets: tiene forbidden state.
- [ ] AC-03214 — Assets: tiene mensajes en español.
- [ ] AC-03215 — Assets: no muestra ObjectIds.
- [ ] AC-03216 — Assets: no introduce any.
- [ ] AC-03217 — Assets: no introduce casts inseguros.
- [ ] AC-03218 — Assets: no usa null como estado de negocio.
- [ ] AC-03219 — Assets: no duplica enums.
- [ ] AC-03220 — Assets: no duplica query keys.
- [ ] AC-03221 — Assets: tiene prueba unitaria.
- [ ] AC-03222 — Assets: tiene prueba de integración.
- [ ] AC-03223 — Maintenance: tiene prueba negativa.
- [ ] AC-03224 — Maintenance: tiene prueba E2E crítica.
- [ ] AC-03225 — Maintenance: tiene documentación actualizada.
- [ ] AC-03226 — Maintenance: tiene backup del archivo modificado.
- [ ] AC-03227 — Maintenance: pasa typecheck.
- [ ] AC-03228 — Maintenance: pasa lint sin warnings.
- [ ] AC-03229 — Maintenance: pasa build.
- [ ] AC-03230 — Maintenance: pasa verify.
- [ ] AC-03231 — Maintenance: respeta mobile-first.
- [ ] AC-03232 — Maintenance: respeta accesibilidad.
- [ ] AC-03233 — Maintenance: respeta privacidad.
- [ ] AC-03234 — Dashboard: respeta performance budget.
- [ ] AC-03235 — Dashboard: registra métricas verificables.
- [ ] AC-03236 — Dashboard: tiene fallback.
- [ ] AC-03237 — Dashboard: tiene estrategia de migración.
- [ ] AC-03238 — Dashboard: conserva compatibilidad.
- [ ] AC-03239 — Dashboard: no borra datos.
- [ ] AC-03240 — Dashboard: no ejecuta Git.
- [ ] AC-03241 — SLA: tiene una fuente de verdad identificada.
- [ ] AC-03242 — SLA: tiene owner definido.
- [ ] AC-03243 — SLA: tiene alcance y fuera de alcance.
- [ ] AC-03244 — SLA: tiene contrato versionado.
- [ ] AC-03245 — Dispatch: tiene regla de dominio probada.
- [ ] AC-03246 — Dispatch: tiene autorización backend.
- [ ] AC-03247 — Dispatch: tiene auditoría.
- [ ] AC-03248 — Dispatch: tiene idempotencia cuando aplica.
- [ ] AC-03249 — Dispatch: tiene loading state.
- [ ] AC-03250 — Dispatch: tiene error state.
- [ ] AC-03251 — Dispatch: tiene empty state.
- [ ] AC-03252 — Dispatch: tiene offline state cuando aplica.
- [ ] AC-03253 — Dispatch: tiene forbidden state.
- [ ] AC-03254 — Dispatch: tiene mensajes en español.
- [ ] AC-03255 — Dispatch: no muestra ObjectIds.
- [ ] AC-03256 — Notifications: no introduce any.
- [ ] AC-03257 — Notifications: no introduce casts inseguros.
- [ ] AC-03258 — Notifications: no usa null como estado de negocio.
- [ ] AC-03259 — Notifications: no duplica enums.
- [ ] AC-03260 — Notifications: no duplica query keys.
- [ ] AC-03261 — Notifications: tiene prueba unitaria.
- [ ] AC-03262 — Notifications: tiene prueba de integración.
- [ ] AC-03263 — Notifications: tiene prueba negativa.
- [ ] AC-03264 — Notifications: tiene prueba E2E crítica.
- [ ] AC-03265 — Notifications: tiene documentación actualizada.
- [ ] AC-03266 — Notifications: tiene backup del archivo modificado.
- [ ] AC-03267 — ClientPortal: pasa typecheck.
- [ ] AC-03268 — ClientPortal: pasa lint sin warnings.
- [ ] AC-03269 — ClientPortal: pasa build.
- [ ] AC-03270 — ClientPortal: pasa verify.
- [ ] AC-03271 — ClientPortal: respeta mobile-first.
- [ ] AC-03272 — ClientPortal: respeta accesibilidad.
- [ ] AC-03273 — ClientPortal: respeta privacidad.
- [ ] AC-03274 — ClientPortal: respeta performance budget.
- [ ] AC-03275 — ClientPortal: registra métricas verificables.
- [ ] AC-03276 — ClientPortal: tiene fallback.
- [ ] AC-03277 — ClientPortal: tiene estrategia de migración.
- [ ] AC-03278 — HistoricalArchive: conserva compatibilidad.
- [ ] AC-03279 — HistoricalArchive: no borra datos.
- [ ] AC-03280 — HistoricalArchive: no ejecuta Git.
- [ ] AC-03281 — Backups: tiene una fuente de verdad identificada.
- [ ] AC-03282 — Backups: tiene owner definido.
- [ ] AC-03283 — Backups: tiene alcance y fuera de alcance.
- [ ] AC-03284 — Backups: tiene contrato versionado.
- [ ] AC-03285 — Backups: tiene regla de dominio probada.
- [ ] AC-03286 — Backups: tiene autorización backend.
- [ ] AC-03287 — Backups: tiene auditoría.
- [ ] AC-03288 — Backups: tiene idempotencia cuando aplica.
- [ ] AC-03289 — Audit: tiene loading state.
- [ ] AC-03290 — Audit: tiene error state.
- [ ] AC-03291 — Audit: tiene empty state.
- [ ] AC-03292 — Audit: tiene offline state cuando aplica.
- [ ] AC-03293 — Audit: tiene forbidden state.
- [ ] AC-03294 — Audit: tiene mensajes en español.
- [ ] AC-03295 — Audit: no muestra ObjectIds.
- [ ] AC-03296 — Audit: no introduce any.
- [ ] AC-03297 — Audit: no introduce casts inseguros.
- [ ] AC-03298 — Audit: no usa null como estado de negocio.
- [ ] AC-03299 — Audit: no duplica enums.
- [ ] AC-03300 — Observability: no duplica query keys.
- [ ] AC-03301 — Observability: tiene prueba unitaria.
- [ ] AC-03302 — Observability: tiene prueba de integración.
- [ ] AC-03303 — Observability: tiene prueba negativa.
- [ ] AC-03304 — Observability: tiene prueba E2E crítica.
- [ ] AC-03305 — Observability: tiene documentación actualizada.
- [ ] AC-03306 — Observability: tiene backup del archivo modificado.
- [ ] AC-03307 — Observability: pasa typecheck.
- [ ] AC-03308 — Observability: pasa lint sin warnings.
- [ ] AC-03309 — Observability: pasa build.
- [ ] AC-03310 — Observability: pasa verify.
- [ ] AC-03311 — Security: respeta mobile-first.
- [ ] AC-03312 — Security: respeta accesibilidad.
- [ ] AC-03313 — Security: respeta privacidad.
- [ ] AC-03314 — Security: respeta performance budget.
- [ ] AC-03315 — Security: registra métricas verificables.
- [ ] AC-03316 — Security: tiene fallback.
- [ ] AC-03317 — Security: tiene estrategia de migración.
- [ ] AC-03318 — Security: conserva compatibilidad.
- [ ] AC-03319 — Security: no borra datos.
- [ ] AC-03320 — Security: no ejecuta Git.
- [ ] AC-03321 — Accessibility: tiene una fuente de verdad identificada.
- [ ] AC-03322 — Performance: tiene owner definido.
- [ ] AC-03323 — Performance: tiene alcance y fuera de alcance.
- [ ] AC-03324 — Performance: tiene contrato versionado.
- [ ] AC-03325 — Performance: tiene regla de dominio probada.
- [ ] AC-03326 — Performance: tiene autorización backend.
- [ ] AC-03327 — Performance: tiene auditoría.
- [ ] AC-03328 — Performance: tiene idempotencia cuando aplica.
- [ ] AC-03329 — Performance: tiene loading state.
- [ ] AC-03330 — Performance: tiene error state.
- [ ] AC-03331 — Performance: tiene empty state.
- [ ] AC-03332 — Performance: tiene offline state cuando aplica.
- [ ] AC-03333 — Testing: tiene forbidden state.
- [ ] AC-03334 — Testing: tiene mensajes en español.
- [ ] AC-03335 — Testing: no muestra ObjectIds.
- [ ] AC-03336 — Testing: no introduce any.
- [ ] AC-03337 — Testing: no introduce casts inseguros.
- [ ] AC-03338 — Testing: no usa null como estado de negocio.
- [ ] AC-03339 — Testing: no duplica enums.
- [ ] AC-03340 — Testing: no duplica query keys.
- [ ] AC-03341 — Testing: tiene prueba unitaria.
- [ ] AC-03342 — Testing: tiene prueba de integración.
- [ ] AC-03343 — Testing: tiene prueba negativa.
- [ ] AC-03344 — Documentation: tiene prueba E2E crítica.
- [ ] AC-03345 — Documentation: tiene documentación actualizada.
- [ ] AC-03346 — Documentation: tiene backup del archivo modificado.
- [ ] AC-03347 — Documentation: pasa typecheck.
- [ ] AC-03348 — Documentation: pasa lint sin warnings.
- [ ] AC-03349 — Documentation: pasa build.
- [ ] AC-03350 — Documentation: pasa verify.
- [ ] AC-03351 — Documentation: respeta mobile-first.
- [ ] AC-03352 — Documentation: respeta accesibilidad.
- [ ] AC-03353 — Documentation: respeta privacidad.
- [ ] AC-03354 — Documentation: respeta performance budget.
- [ ] AC-03355 — Deployment: registra métricas verificables.
- [ ] AC-03356 — Deployment: tiene fallback.
- [ ] AC-03357 — Deployment: tiene estrategia de migración.
- [ ] AC-03358 — Deployment: conserva compatibilidad.
- [ ] AC-03359 — Deployment: no borra datos.
- [ ] AC-03360 — Deployment: no ejecuta Git.
- [ ] AC-03361 — Innovation: tiene una fuente de verdad identificada.
- [ ] AC-03362 — Innovation: tiene owner definido.
- [ ] AC-03363 — Innovation: tiene alcance y fuera de alcance.
- [ ] AC-03364 — Innovation: tiene contrato versionado.
- [ ] AC-03365 — Innovation: tiene regla de dominio probada.
- [ ] AC-03366 — AIAdapter: tiene autorización backend.
- [ ] AC-03367 — AIAdapter: tiene auditoría.
- [ ] AC-03368 — AIAdapter: tiene idempotencia cuando aplica.
- [ ] AC-03369 — AIAdapter: tiene loading state.
- [ ] AC-03370 — AIAdapter: tiene error state.
- [ ] AC-03371 — AIAdapter: tiene empty state.
- [ ] AC-03372 — AIAdapter: tiene offline state cuando aplica.
- [ ] AC-03373 — AIAdapter: tiene forbidden state.
- [ ] AC-03374 — AIAdapter: tiene mensajes en español.
- [ ] AC-03375 — AIAdapter: no muestra ObjectIds.
- [ ] AC-03376 — AIAdapter: no introduce any.
- [ ] AC-03377 — Integrations: no introduce casts inseguros.
- [ ] AC-03378 — Integrations: no usa null como estado de negocio.
- [ ] AC-03379 — Integrations: no duplica enums.
- [ ] AC-03380 — Integrations: no duplica query keys.
- [ ] AC-03381 — Integrations: tiene prueba unitaria.
- [ ] AC-03382 — Integrations: tiene prueba de integración.
- [ ] AC-03383 — Integrations: tiene prueba negativa.
- [ ] AC-03384 — Integrations: tiene prueba E2E crítica.
- [ ] AC-03385 — Integrations: tiene documentación actualizada.
- [ ] AC-03386 — Integrations: tiene backup del archivo modificado.
- [ ] AC-03387 — Integrations: pasa typecheck.
- [ ] AC-03388 — ProductGovernance: pasa lint sin warnings.
- [ ] AC-03389 — ProductGovernance: pasa build.
- [ ] AC-03390 — ProductGovernance: pasa verify.
- [ ] AC-03391 — ProductGovernance: respeta mobile-first.
- [ ] AC-03392 — ProductGovernance: respeta accesibilidad.
- [ ] AC-03393 — ProductGovernance: respeta privacidad.
- [ ] AC-03394 — ProductGovernance: respeta performance budget.
- [ ] AC-03395 — ProductGovernance: registra métricas verificables.
- [ ] AC-03396 — ProductGovernance: tiene fallback.
- [ ] AC-03397 — ProductGovernance: tiene estrategia de migración.
- [ ] AC-03398 — ProductGovernance: conserva compatibilidad.
- [ ] AC-03399 — SourceTraceability: no borra datos.
- [ ] AC-03400 — SourceTraceability: no ejecuta Git.
- [ ] AC-03401 — AgentCoordinator: tiene una fuente de verdad identificada.
- [ ] AC-03402 — AgentCoordinator: tiene owner definido.
- [ ] AC-03403 — AgentCoordinator: tiene alcance y fuera de alcance.
- [ ] AC-03404 — AgentCoordinator: tiene contrato versionado.
- [ ] AC-03405 — AgentCoordinator: tiene regla de dominio probada.
- [ ] AC-03406 — AgentCoordinator: tiene autorización backend.
- [ ] AC-03407 — AgentCoordinator: tiene auditoría.
- [ ] AC-03408 — AgentCoordinator: tiene idempotencia cuando aplica.
- [ ] AC-03409 — AgentCoordinator: tiene loading state.
- [ ] AC-03410 — AgentHandoff: tiene error state.
- [ ] AC-03411 — AgentHandoff: tiene empty state.
- [ ] AC-03412 — AgentHandoff: tiene offline state cuando aplica.
- [ ] AC-03413 — AgentHandoff: tiene forbidden state.
- [ ] AC-03414 — AgentHandoff: tiene mensajes en español.
- [ ] AC-03415 — AgentHandoff: no muestra ObjectIds.
- [ ] AC-03416 — AgentHandoff: no introduce any.
- [ ] AC-03417 — AgentHandoff: no introduce casts inseguros.
- [ ] AC-03418 — AgentHandoff: no usa null como estado de negocio.
- [ ] AC-03419 — AgentHandoff: no duplica enums.
- [ ] AC-03420 — AgentHandoff: no duplica query keys.
- [ ] AC-03421 — SharedTypes: tiene prueba unitaria.
- [ ] AC-03422 — SharedTypes: tiene prueba de integración.
- [ ] AC-03423 — SharedTypes: tiene prueba negativa.
- [ ] AC-03424 — SharedTypes: tiene prueba E2E crítica.
- [ ] AC-03425 — SharedTypes: tiene documentación actualizada.
- [ ] AC-03426 — SharedTypes: tiene backup del archivo modificado.
- [ ] AC-03427 — SharedTypes: pasa typecheck.
- [ ] AC-03428 — SharedTypes: pasa lint sin warnings.
- [ ] AC-03429 — SharedTypes: pasa build.
- [ ] AC-03430 — SharedTypes: pasa verify.
- [ ] AC-03431 — SharedTypes: respeta mobile-first.
- [ ] AC-03432 — DomainFSM: respeta accesibilidad.
- [ ] AC-03433 — DomainFSM: respeta privacidad.
- [ ] AC-03434 — DomainFSM: respeta performance budget.
- [ ] AC-03435 — DomainFSM: registra métricas verificables.
- [ ] AC-03436 — DomainFSM: tiene fallback.
- [ ] AC-03437 — DomainFSM: tiene estrategia de migración.
- [ ] AC-03438 — DomainFSM: conserva compatibilidad.
- [ ] AC-03439 — DomainFSM: no borra datos.
- [ ] AC-03440 — DomainFSM: no ejecuta Git.
- [ ] AC-03441 — Config: tiene una fuente de verdad identificada.
- [ ] AC-03442 — Config: tiene owner definido.
- [ ] AC-03443 — Auth: tiene alcance y fuera de alcance.
- [ ] AC-03444 — Auth: tiene contrato versionado.
- [ ] AC-03445 — Auth: tiene regla de dominio probada.
- [ ] AC-03446 — Auth: tiene autorización backend.
- [ ] AC-03447 — Auth: tiene auditoría.
- [ ] AC-03448 — Auth: tiene idempotencia cuando aplica.
- [ ] AC-03449 — Auth: tiene loading state.
- [ ] AC-03450 — Auth: tiene error state.
- [ ] AC-03451 — Auth: tiene empty state.
- [ ] AC-03452 — Auth: tiene offline state cuando aplica.
- [ ] AC-03453 — Auth: tiene forbidden state.
- [ ] AC-03454 — Session: tiene mensajes en español.
- [ ] AC-03455 — Session: no muestra ObjectIds.
- [ ] AC-03456 — Session: no introduce any.
- [ ] AC-03457 — Session: no introduce casts inseguros.
- [ ] AC-03458 — Session: no usa null como estado de negocio.
- [ ] AC-03459 — Session: no duplica enums.
- [ ] AC-03460 — Session: no duplica query keys.
- [ ] AC-03461 — Session: tiene prueba unitaria.
- [ ] AC-03462 — Session: tiene prueba de integración.
- [ ] AC-03463 — Session: tiene prueba negativa.
- [ ] AC-03464 — Session: tiene prueba E2E crítica.
- [ ] AC-03465 — WebAuthn: tiene documentación actualizada.
- [ ] AC-03466 — WebAuthn: tiene backup del archivo modificado.
- [ ] AC-03467 — WebAuthn: pasa typecheck.
- [ ] AC-03468 — WebAuthn: pasa lint sin warnings.
- [ ] AC-03469 — WebAuthn: pasa build.
- [ ] AC-03470 — WebAuthn: pasa verify.
- [ ] AC-03471 — WebAuthn: respeta mobile-first.
- [ ] AC-03472 — WebAuthn: respeta accesibilidad.
- [ ] AC-03473 — WebAuthn: respeta privacidad.
- [ ] AC-03474 — WebAuthn: respeta performance budget.
- [ ] AC-03475 — WebAuthn: registra métricas verificables.
- [ ] AC-03476 — RBAC: tiene fallback.
- [ ] AC-03477 — RBAC: tiene estrategia de migración.
- [ ] AC-03478 — RBAC: conserva compatibilidad.
- [ ] AC-03479 — RBAC: no borra datos.
- [ ] AC-03480 — RBAC: no ejecuta Git.
- [ ] AC-03481 — Clients: tiene una fuente de verdad identificada.
- [ ] AC-03482 — Clients: tiene owner definido.
- [ ] AC-03483 — Clients: tiene alcance y fuera de alcance.
- [ ] AC-03484 — Clients: tiene contrato versionado.
- [ ] AC-03485 — Clients: tiene regla de dominio probada.
- [ ] AC-03486 — Clients: tiene autorización backend.
- [ ] AC-03487 — Sites: tiene auditoría.
- [ ] AC-03488 — Sites: tiene idempotencia cuando aplica.
- [ ] AC-03489 — Sites: tiene loading state.
- [ ] AC-03490 — Sites: tiene error state.
- [ ] AC-03491 — Sites: tiene empty state.
- [ ] AC-03492 — Sites: tiene offline state cuando aplica.
- [ ] AC-03493 — Sites: tiene forbidden state.
- [ ] AC-03494 — Sites: tiene mensajes en español.
- [ ] AC-03495 — Sites: no muestra ObjectIds.
- [ ] AC-03496 — Sites: no introduce any.
- [ ] AC-03497 — Sites: no introduce casts inseguros.
- [ ] AC-03498 — Contacts: no usa null como estado de negocio.
- [ ] AC-03499 — Contacts: no duplica enums.
- [ ] AC-03500 — Contacts: no duplica query keys.
- [ ] AC-03501 — Contacts: tiene prueba unitaria.
- [ ] AC-03502 — Contacts: tiene prueba de integración.
- [ ] AC-03503 — Contacts: tiene prueba negativa.
- [ ] AC-03504 — Contacts: tiene prueba E2E crítica.
- [ ] AC-03505 — Contacts: tiene documentación actualizada.
- [ ] AC-03506 — Contacts: tiene backup del archivo modificado.
- [ ] AC-03507 — Contacts: pasa typecheck.
- [ ] AC-03508 — Contacts: pasa lint sin warnings.
- [ ] AC-03509 — WorkRequests: pasa build.
- [ ] AC-03510 — WorkRequests: pasa verify.
- [ ] AC-03511 — WorkRequests: respeta mobile-first.
- [ ] AC-03512 — WorkRequests: respeta accesibilidad.
- [ ] AC-03513 — WorkRequests: respeta privacidad.
- [ ] AC-03514 — WorkRequests: respeta performance budget.
- [ ] AC-03515 — WorkRequests: registra métricas verificables.
- [ ] AC-03516 — WorkRequests: tiene fallback.
- [ ] AC-03517 — WorkRequests: tiene estrategia de migración.
- [ ] AC-03518 — WorkRequests: conserva compatibilidad.
- [ ] AC-03519 — WorkRequests: no borra datos.
- [ ] AC-03520 — SiteVisits: no ejecuta Git.
- [ ] AC-03521 — Proposals: tiene una fuente de verdad identificada.
- [ ] AC-03522 — Proposals: tiene owner definido.
- [ ] AC-03523 — Proposals: tiene alcance y fuera de alcance.
- [ ] AC-03524 — Proposals: tiene contrato versionado.
- [ ] AC-03525 — Proposals: tiene regla de dominio probada.
- [ ] AC-03526 — Proposals: tiene autorización backend.
- [ ] AC-03527 — Proposals: tiene auditoría.
- [ ] AC-03528 — Proposals: tiene idempotencia cuando aplica.
- [ ] AC-03529 — Proposals: tiene loading state.
- [ ] AC-03530 — Proposals: tiene error state.
- [ ] AC-03531 — PurchaseOrders: tiene empty state.
- [ ] AC-03532 — PurchaseOrders: tiene offline state cuando aplica.
- [ ] AC-03533 — PurchaseOrders: tiene forbidden state.
- [ ] AC-03534 — PurchaseOrders: tiene mensajes en español.
- [ ] AC-03535 — PurchaseOrders: no muestra ObjectIds.
- [ ] AC-03536 — PurchaseOrders: no introduce any.
- [ ] AC-03537 — PurchaseOrders: no introduce casts inseguros.
- [ ] AC-03538 — PurchaseOrders: no usa null como estado de negocio.
- [ ] AC-03539 — PurchaseOrders: no duplica enums.
- [ ] AC-03540 — PurchaseOrders: no duplica query keys.
- [ ] AC-03541 — PurchaseOrders: tiene prueba unitaria.
- [ ] AC-03542 — ServiceCases: tiene prueba de integración.
- [ ] AC-03543 — ServiceCases: tiene prueba negativa.
- [ ] AC-03544 — ServiceCases: tiene prueba E2E crítica.
- [ ] AC-03545 — ServiceCases: tiene documentación actualizada.
- [ ] AC-03546 — ServiceCases: tiene backup del archivo modificado.
- [ ] AC-03547 — ServiceCases: pasa typecheck.
- [ ] AC-03548 — ServiceCases: pasa lint sin warnings.
- [ ] AC-03549 — ServiceCases: pasa build.
- [ ] AC-03550 — ServiceCases: pasa verify.
- [ ] AC-03551 — ServiceCases: respeta mobile-first.
- [ ] AC-03552 — ServiceCases: respeta accesibilidad.
- [ ] AC-03553 — WorkOrders: respeta privacidad.
- [ ] AC-03554 — WorkOrders: respeta performance budget.
- [ ] AC-03555 — WorkOrders: registra métricas verificables.
- [ ] AC-03556 — WorkOrders: tiene fallback.
- [ ] AC-03557 — WorkOrders: tiene estrategia de migración.
- [ ] AC-03558 — WorkOrders: conserva compatibilidad.
- [ ] AC-03559 — WorkOrders: no borra datos.
- [ ] AC-03560 — WorkOrders: no ejecuta Git.
- [ ] AC-03561 — PlanningPackets: tiene una fuente de verdad identificada.
- [ ] AC-03562 — PlanningPackets: tiene owner definido.
- [ ] AC-03563 — PlanningPackets: tiene alcance y fuera de alcance.
- [ ] AC-03564 — Kits: tiene contrato versionado.
- [ ] AC-03565 — Kits: tiene regla de dominio probada.
- [ ] AC-03566 — Kits: tiene autorización backend.
- [ ] AC-03567 — Kits: tiene auditoría.
- [ ] AC-03568 — Kits: tiene idempotencia cuando aplica.
- [ ] AC-03569 — Kits: tiene loading state.
- [ ] AC-03570 — Kits: tiene error state.
<!-- FIN DEL PRD MAESTRO CERMONT — EXACTAMENTE 6000 LÍNEAS -->
