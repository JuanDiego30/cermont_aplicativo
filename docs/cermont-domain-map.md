# Mapa maestro del dominio CERMONT

Fecha de creacion: 2026-06-03.

Este archivo consolida la logica de dominio que debe guiar la refactorizacion. No reemplaza los documentos canonicos; funciona como mapa operativo para evitar que el libro o el software afirmen funcionalidades sin evidencia real.

## 1. Problema central

CERMONT S.A.S. requiere una plataforma documental y operativa que reduzca la fragmentacion de la informacion entre correos, formatos fisicos, Excel, Word, fotos, informes, actas, SES, facturas y pagos. La falla principal no es la ausencia de un CRUD, sino la falta de trazabilidad integral entre planeacion, ejecucion, evidencias, cierre administrativo y costos reales.

## 2. Flujo operativo de 14 pasos

| Paso | Nombre | Entidad o artefacto principal | Observacion |
| --- | --- | --- | --- |
| 1 | Solicitud formal del cliente | `WorkRequest` | Entrada del flujo. |
| 2 | Visita tecnica | `SiteVisit` | Puede ser condicional segun alcance. |
| 3 | Propuesta economica | `Proposal` | Debe relacionarse con baseline de costos. |
| 4 | Aprobacion con PO | `PurchaseOrder` | Autoriza la orden de trabajo. |
| 5 | Planeacion | `PlanningPacket` | Debe representar el formato real de planeacion de obra. |
| 6 | Ejecucion en campo | `ExecutionSession` | Debe bloquearse si no hay planeacion aprobada. |
| 7 | Evidencias | `Evidence` | Fotos, documentos, firmas y soportes por paso. |
| 8 | Informe tecnico | `TechnicalReport` | Resultado tecnico de la ejecucion. |
| 9 | Acta de entrega | `DeliveryRecord` | Formaliza entrega del servicio. |
| 10 | Acta firmada / firma cliente | `DeliveryRecord` o `ClientSignature` | Actualmente no se verifico modelo separado `ClientSignature`. |
| 11 | SES / Ariba | `ServiceEntrySheet` | Seguimiento de SES; no debe afirmarse automatizacion Ariba sin evidencia. |
| 12 | Factura | `Invoice` | Debe depender de SES aprobada. |
| 13 | Aprobacion de factura | `Invoice` o `InvoiceApproval` | Actualmente no se verifico modelo separado `InvoiceApproval`. |
| 14 | Pago | `Payment` | Debe cerrar financieramente la orden. |

## 3. Fallas criticas

| Falla | Consecuencia | Modulos relacionados |
| --- | --- | --- |
| Planeacion incompleta de herramientas, equipos, materiales, EPP, personal y documentos. | Retrasos o ejecucion sin recursos completos. | `PlanningPacket`, `Kit`, `Tool`, `Resource`, `Asset`, `Checklist` |
| Ejecucion con soportes dispersos y formatos fisicos. | Perdida de trazabilidad y dificultad para armar informes. | `ExecutionSession`, `Evidence`, `Document`, `TemplateResponse` |
| Informes y actas tardias. | Cierre tecnico lento y facturacion bloqueada. | `TechnicalReport`, `DeliveryRecord`, `Documents` |
| Seguimiento administrativo fragmentado de SES, facturas y pagos. | Facturacion tardia y baja visibilidad del cierre. | `ServiceEntrySheet`, `Invoice`, `Payment` |
| Ausencia de control centralizado de costos reales vs propuesta. | No se conoce desviacion economica por orden. | `Cost`, `Proposal`, `CostEstimate`, `ActualCost`, `CostDeviation` |

## 4. Roles reales de CERMONT

Roles derivados de la jerarquia empresarial y de la solicitud de refactorizacion:

| Rol real | Estado actual en dominio | Accion |
| --- | --- | --- |
| Gerente | `gerente` | Mantener. |
| Ingeniero residente | `residente` | Mantener con etiqueta clara. |
| Coordinador administrativo | Parcial: podria mapearse a `administrativo`. | Crear rol especifico o mapeo. |
| Auxiliar contable | No existe. | Crear rol o mapear con permisos financieros limitados. |
| Coordinador HES | `hes` | Mantener/renombrar etiqueta. |
| Auxiliar HES | No existe. | Crear rol o mapear con permisos HES limitados. |
| Supervisor electricista | Parcial: `supervisor`. | Crear rol especifico o mapear. |
| Tecnico electricista | Parcial: `tecnico`. | Crear rol especifico o mapear. |
| Oficial de construccion | No existe. | Crear rol de campo con permisos acotados. |
| Pasante | No existe. | Crear rol de apoyo con permisos minimos. |

Roles actuales en `@cermont/domain`: `gerente`, `residente`, `hes`, `supervisor`, `operador`, `tecnico`, `administrativo`, `cliente`.

## 5. Modulos del sistema

| Grupo | Modulos |
| --- | --- |
| Nucleo operativo | `work-requests`, `site-visit`, `proposal`, `purchase-order`, `order`, `planning-packet`, `execution-session`, `evidence` |
| Cierre tecnico | `technical-report`, `delivery-record`, `report`, `documents` |
| Cierre administrativo | `service-entry-sheet`, `invoice`, `payment`, `cost`, `dashboard` |
| Recursos y planeacion | `kit`, `tool`, `resource`, `asset`, `checklist`, `maintenance`, `inspection` |
| Plataforma documental | `documents`, `template-draft`, `template-response`, `files`, `sync` |
| Seguridad y soporte | `auth`, `user`, `audit`, `observability`, `notifications`, `analytics` |

## 6. Entidades de base de datos verificadas

Se verificaron modelos en `backend/src/models` para: `WorkRequest`, `SiteVisit`, `Proposal`, `PurchaseOrder`, `Order`, `PlanningPacket`, `ExecutionSession`, `Evidence`, `TechnicalReport`, `DeliveryRecord`, `ServiceEntrySheet`, `Invoice`, `Payment`, `Cost`, `Asset`, `Inspection`, `Kit`, `Resource`, `DocumentTemplate`, `TemplateResponse`, `AuditLog`, entre otros.

Pendientes o no verificados como modelos separados:

- `ClientAcceptance` / `ClientSignature`.
- `InvoiceApproval`.
- `CostEstimate` como baseline congelado separado.
- `ActualCost` separado de `Cost`.
- `CostDeviation`.
- `FormSection` / `FormField` como modelos independientes si se decide no usar solo template JSON.

## 7. Formularios requeridos

### Planeacion de obra

Debe incluir: responsable de inspeccion, lugar, fecha, unidad de negocio (`IT`, `MNT`, `SC`, `GEN`, `OTHER`), alcance, materiales, herramientas, equipos, elementos de seguridad, numero de trabajadores por perfil y firmas de ingeniero residente, tecnico electricista y HES.

Estado actual: parcial. `PlanningPacket` no contiene todos estos campos de forma explicita.

### Inspeccion de lineas de vida verticales

Debe incluir: caracteristicas de la linea, componentes, condicion a evaluar, tipo de afeccion, estado C/NC, hallazgo, estado del hallazgo, accion correctiva, observaciones, concepto final y registro fotografico.

Estado actual: parcial. `Inspection` es generico.

### Mantenimiento preventivo CCTV

Debe incluir: camara, rutina, lugar, fecha, alturas, tipo/modelo/serial de camara, encoder/POE, radio, antena, switch, ubicacion, alimentacion, sistema electrico, sistema fotovoltaico, conexion remota/master, radioenlace, caja CCTV, puesta a tierra, observaciones y fotos antes/despues.

Estado actual: parcial. `Asset` no debe usarse como sustituto del formulario completo.

## 8. Evidencias requeridas

| Paso | Evidencia/documento minimo |
| --- | --- |
| 1 | Solicitud formal o soporte de solicitud. |
| 2 | Reporte/fotos/mediciones de visita, si aplica. |
| 3 | Propuesta economica enviada. |
| 4 | PO o soporte de aprobacion. |
| 5 | Planeacion, AST/PTW/checklists, recursos, firmas. |
| 6 | Sesion de ejecucion, formularios y registros de campo. |
| 7 | Evidencias fotograficas/documentales por antes/durante/despues o por componente. |
| 8 | Informe tecnico generado/revisado. |
| 9 | Acta de entrega. |
| 10 | Acta firmada o firma/aceptacion del cliente. |
| 11 | SES y referencia Ariba. |
| 12 | Factura y soportes. |
| 13 | Aprobacion de factura. |
| 14 | Comprobante o referencia de pago. |

## 9. Estados por orden y artefactos

La orden no debe cargar todo el estado en un solo enum. Se recomienda conservar:

- Estado operativo: solicitud, visita, propuesta, PO, planeacion, ejecucion, evidencias, informe, acta.
- Estado administrativo: SES, factura, aprobacion, pago.
- Estado documental: borrador, enviado, aprobado, rechazado, firmado, archivado.
- Estado offline: pendiente, sincronizando, sincronizado, fallido.

## 10. Relacion entre modulos

```txt
WorkRequest
  -> SiteVisit opcional
  -> Proposal
  -> PurchaseOrder
  -> Order / ServiceCase
  -> PlanningPacket
  -> ExecutionSession
  -> Evidence / TemplateResponse
  -> TechnicalReport
  -> DeliveryRecord
  -> ServiceEntrySheet
  -> Invoice
  -> Payment
  -> AuditLog / StateTransition
```

## 11. Clasificacion de alcance actual

| Funcionalidad | Estado |
| --- | --- |
| Flujo base de 14 pasos | Parcial |
| RBAC | Parcial por roles reales pendientes |
| JWT/Auth | Implementada |
| Planeacion con formato real | Parcial |
| Kits tipicos | Parcial |
| Ejecucion en campo | Parcial |
| Evidencias | Parcial avanzada |
| Informes tecnicos | Parcial |
| Actas | Parcial |
| SES/Ariba | Parcial; seguimiento, no automatizacion Ariba |
| Facturacion | Parcial |
| Pagos | Parcial |
| Costos reales vs propuesta | Parcial |
| Formularios dinamicos | Parcial |
| Offline/PWA | Parcial pendiente de pruebas E2E |
| Validacion con usuarios | Pendiente por anexar evidencia |
| Reduccion de tiempos | Pendiente por anexar evidencia |

## 12. Regla de continuidad

Antes de modificar cualquier modulo se debe presentar:

```txt
Modulo:
Estado encontrado:
Archivos revisados:
Problemas detectados:
Dependencias:
Plan de cambio:
Riesgos:
Pruebas que se ejecutaran:
```

Este mapa bloquea implementaciones desde frontend que no tengan primero modelo, contrato, servicio, ruta, permisos y pruebas.
