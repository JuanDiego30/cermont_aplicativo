# Auditoria de campos - modelos contra formatos reales CERMONT

Fecha de revision: 2026-06-03.

Esta auditoria compara los modelos y contratos actuales contra tres formatos documentales reales ubicados en `docs/pdf/`:

- `FORMATO DE PLANEACION DE OBRA.pdf`
- `Formato Inspeccion lineas de vida Vertical.pdf`
- `Formato Mantenimiento CCTV.pdf`

No se modifico codigo. Los hallazgos se usan como insumo para la fase DB -> contratos -> backend.

## Planeacion de obra

Evidencia revisada:

- `backend/src/models/PlanningPacket.ts`
- `packages/shared-types/src/schemas/planning-packet.schema.ts`
- `backend/src/modules/planning-packet/planning-packet.service.ts`
- PDF `FORMATO DE PLANEACION DE OBRA.pdf`

| Campo requerido por formato real | Estado en modelo/contrato actual | Riesgo | Accion requerida |
| --- | --- | --- | --- |
| Responsable de la inspeccion | Parcial: existen `supervisorId` y `hesResponsibleId`, pero no `responsibleInspectorId/name` explicito. | El formato no queda trazable al responsable real. | Agregar responsable formal o mapearlo de forma documentada. |
| Lugar | No explicito en `PlanningPacket`. | La planeacion no conserva ubicacion propia del formato. | Agregar `place` o relacionarlo obligatoriamente con la orden. |
| Fecha | Parcial: existe `schedule`, no una fecha simple de planeacion/inspeccion. | Dificulta recrear el formato. | Agregar `plannedDate` o derivacion clara desde `schedule.plannedStartAt`. |
| Unidad de negocio IT/MNT/SC/GEN/Otros | No existe como enum. | No se puede clasificar la actividad segun formato. | Crear enum `businessUnit: IT/MNT/SC/GEN/OTHER`. |
| Alcance | No existe campo `scope`; hay `planningNotes`. | Se pierde el alcance tecnico formal. | Agregar `scope` con longitud minima. |
| Materiales con descripcion y cantidad | No existe arreglo `materials`; solo `tools`, `equipment`, `kitSnapshot`. | No resuelve la falla de materiales faltantes. | Agregar `materials: resourceLine[]`. |
| Herramientas con descripcion y cantidad | Parcial: existe `tools`. | Falta normalizar contra recurso/kit y disponibilidad. | Mantener y reforzar disponibilidad/certificacion si aplica. |
| Equipos con descripcion y cantidad | Parcial: existe `equipment`. | Falta control de certificaciones/calibraciones reales. | Conectar a `Asset`, `Certification` y `CalibrationRecord`. |
| Elementos de seguridad | Parcial: `kitSnapshot.minimumPpe`; no arreglo editable `safetyElements`. | EPP queda como texto de kit, no como requisito verificable. | Agregar `safetyElements: resourceLine[]`. |
| Numero de trabajadores por perfil | Parcial: `crew` lista usuarios; no hay conteo por electricistas, telecom, instrumentistas, obreros. | El formato no puede recrearse directamente. | Agregar `workerRequirements` tipado. |
| Firmas Ing. Residente, Tecnico Electricista, HES | No existen firmas estructuradas. | No hay evidencia formal de aprobacion documental. | Agregar `signatures` o vincular `SignatureEvidence`. |
| AST/PTW/documentos de apoyo | Parcial: `astRequired`, `ptwRequired`, `supportDocuments`. | Bien encaminado, pero faltan reglas de obligatoriedad por actividad. | Reforzar readiness y pruebas. |

Conclusion: `PlanningPacket` es parcial. Es el primer modelo que debe reforzarse porque la planeacion incompleta es una falla critica del negocio.

## Inspeccion de lineas de vida verticales

Evidencia revisada:

- `backend/src/models/Inspection.ts`
- `packages/shared-types/src/schemas/inspection.schema.ts`
- PDF `Formato Inspeccion lineas de vida Vertical.pdf`

| Elemento del formato real | Estado actual | Riesgo | Accion requerida |
| --- | --- | --- | --- |
| Numero de linea, fabricante, diametro, tipo de cable | No existe estructura especifica. | No se identifica tecnicamente la linea inspeccionada. | Agregar template o schema `VerticalLifelineInspection`. |
| Componentes: placa anclaje superior, platinas, absorbedor, tensor, cable, soporte guia, placa inferior, placa identificacion | Parcial: `items` genericos con `code`, `description`, `passed`. | No obliga los componentes reales del formato. | Crear checklist canonico versionado para lineas de vida. |
| Estado C/NC | Parcial: `passed: boolean`; no conserva C/NC textual ni condicion. | Pierde semantica del formato y trazabilidad de no conformidades. | Usar enum `conforming/non_conforming` o `C/NC`. |
| Tipo de afeccion | No existe. | Hallazgos tecnicos quedan incompletos. | Agregar `affectionType`. |
| Hallazgo | Parcial: `notes`; no campo formal. | No se separa hallazgo de observacion. | Agregar `finding`. |
| Estado del hallazgo | No existe. | No se controla seguimiento de acciones. | Agregar `findingStatus`. |
| Accion correctiva | No existe. | No se soporta cierre de no conformidades. | Agregar `correctiveAction`. |
| Observaciones | Existe `observations`. | Correcto, pero insuficiente solo. | Mantener. |
| Concepto final | No existe. | No queda decision final de inspeccion. | Agregar enum `finalConcept`. |
| Registro fotografico | Parcial: `photos: string[]`. | No relaciona foto con componente/hallazgo. | Asociar evidencia por item/componente. |

Conclusion: `Inspection` es parcial y generico. Para representar este formato se recomienda motor de formularios dinamicos o un schema especifico de lineas de vida.

## Mantenimiento preventivo CCTV

Evidencia revisada:

- `backend/src/models/Asset.ts`
- `packages/shared-types/src/schemas/asset.schema.ts`
- PDF `Formato Mantenimiento CCTV.pdf`

| Campo o seccion del formato real | Estado actual | Riesgo | Accion requerida |
| --- | --- | --- | --- |
| Camara No., rutina No., lugar, fecha | No existe como formato CCTV. | No se puede generar informe de mantenimiento CCTV completo. | Crear `CctvMaintenanceSubmission` o template versionado. |
| Altura de estructura y altura de camara | No existe explicito. | Perdida de datos tecnicos. | Agregar campos numericos en template CCTV. |
| Tipo de camara, modelo, serial | Parcial: `Asset` tiene `type`, `model`, `serialNumber`. | Sirve para activo, no para mantenimiento puntual. | Distinguir activo de submission de mantenimiento. |
| Encoder/POE, radio, antena, switch | No existe explicito; podria caer en `specifications`. | `metadata` no es validacion defendible. | Tipar sub-secciones del formato o template. |
| Alimentacion AC 110 VAC, sistema electrico, sistema fotovoltaico | No existe explicito. | No se validan condiciones tecnicas. | Agregar campos booleanos/select. |
| Conexion remota, conexion master, radioenlace, caja conexiones, puesta a tierra | No existe explicito. | El checklist tecnico queda incompleto. | Crear checklist CCTV. |
| Observaciones | Parcial: podria estar en otro modulo, no en `Asset`. | Observacion de mantenimiento no queda ligada al evento. | Agregar en submission. |
| Registro fotografico antes/despues | Parcial: `Evidence` tiene fases before/during/after, pero no template CCTV especifico. | Fotos no quedan obligatorias por formato. | Asociar evidencias `before/after` a submission CCTV. |

Conclusion: `Asset` no debe absorber el formato CCTV completo. Se requiere entidad/submission de mantenimiento o template dinamico.

## Evidencias

Evidencia revisada:

- `backend/src/models/Evidence.ts`
- `packages/shared-types/src/schemas/evidence.schema.ts`

| Requisito | Estado | Riesgo | Accion |
| --- | --- | --- | --- |
| Orden o caso asociado | Parcial: existen `orderId`, `workOrderId`, `serviceCaseId`; `orderId` V1 es opcional. | Evidencias pueden quedar sin relacion obligatoria segun version. | Hacer obligatoria una relacion de contexto segun tipo de evidencia. |
| Paso del flujo | Parcial: existen `phase` y `category`, pero no `flowStep` canonico explicito. | Dificulta trazabilidad de 14 pasos. | Agregar `flowStep` o derivacion obligatoria. |
| Archivo, MIME, tamano | Implementado. | Bajo. | Mantener. |
| Hash | Pendiente por verificar en repositorio. | Integridad documental incompleta si no se guarda hash. | Verificar `FileAsset` y upload service antes de declarar implementado. |
| GPS | Implementado parcial con `gpsLocation`. | Requiere prueba de captura y privacidad. | Probar y documentar. |
| Antes/despues | Parcial con `phase`. | Debe ser obligatorio en formatos como CCTV. | Validar por template/formulario. |
| Offline sync | Parcial con `syncStatus` e idempotencia. | Offline completo requiere prueba E2E. | Ejecutar E2E de sync y conflicto. |

## Costos

Evidencia revisada:

- `backend/src/models/Cost.ts`
- `packages/shared-types/src/schemas/cost.schema.ts`
- `docs/product/COST_ENGINE_SPEC.md`

| Requisito del motor de costos | Estado actual | Riesgo | Accion |
| --- | --- | --- | --- |
| Estimado vs real | Implementado parcial: `estimatedAmount`, `actualAmount`, `variance`. | Sirve por linea, pero no congela baseline de propuesta. | Crear `CostEstimate`/baseline congelado. |
| Categorias materiales, mano de obra, herramientas, equipos, transporte, impuestos | Parcial: categorias incluyen labor/materials/equipment/transport/tax/other; no `tool` explicito. | Costos de herramientas se mezclan o quedan fuera. | Ajustar categorias al spec. |
| Evidencia por costo real | No obligatoria en `Cost`. | Costos reales sin soporte. | Agregar `evidenceId`/soporte obligatorio para actual costs. |
| Catalogo de costos | Pendiente por verificar en repositorio. | No hay referencia estandar de precios/tarifas. | Crear/validar `CostCatalogItem`. |
| Desviacion aprobable | Parcial: virtual `variance`; no hay `CostDeviation` con aprobacion. | No hay gobierno administrativo de sobrecostos. | Implementar `CostDeviation` y approval. |
| Impuestos configurables | Parcial: `taxRate` por costo. | Falta configuracion historica auditable. | Agregar tax config por baseline o setting. |

## Prioridad de refuerzo

1. `PlanningPacket`: campos reales de planeacion de obra.
2. `Inspection` o `FormTemplate`: lineas de vida verticales.
3. `CCTV maintenance submission`: formato CCTV con evidencias antes/despues.
4. `Evidence`: relacion obligatoria con paso/orden/formulario.
5. `Cost`: baseline, catalogo, evidencia y desviaciones.
