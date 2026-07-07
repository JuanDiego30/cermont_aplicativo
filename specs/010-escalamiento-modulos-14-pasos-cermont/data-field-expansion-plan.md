# Plan de expansión de campos por workspace

## Convención

- **PRESENT:** coincidencia física verificada en código; debe revisarse su semántica.
- **CANDIDATE:** solicitado por el plan, no encontrado con ese nombre exacto; requiere diseño contract-first.
- **DERIVED:** debe calcularse en dominio/backend, no persistirse o calcularse en UI salvo decisión explícita.

| Módulo | Campo | Tipo propuesto | Workspace inicial | Destino | Estado | Regla / test |
|---|---|---|---|---|---|---|
| Cockpit | `stepProgress` | array estructurado | shared-types | workflow schema | CANDIDATE; existe equivalente `steps` | 14 pasos ordenados y sin duplicados |
| Cockpit | `nextExpectedAction` | status object | shared-types/domain | workflow view | CANDIDATE; existe panel/acciones equivalentes | deriva del primer paso accionable y permisos |
| Cockpit | `blockers` | array de razones | domain/shared-types | workflow view | PRESENT | mismo código/razón backend-UI |
| Cockpit | `documentRequirements` | array de status | shared-types | workflow view | CANDIDATE; revisar `steps.documents` | no duplicar contrato existente |
| Cockpit | `evidenceRequirements` | array de status | shared-types | workflow view | nombre presente en resource/tool, no confirmado en cockpit | reconciliar antes de agregar |
| Cockpit | `costSummary` | objeto | shared-types/backend | cockpit aggregate | equivalente PRESENT | estimado, real, margen y riesgo consistentes |
| Cockpit | `administrativeClosureStatus` | status object | shared-types/backend | cockpit aggregate | CANDIDATE; existen closure fields | derivado de SES/factura/pago |
| Planning | `hasApprovedProposal` | boolean/status | domain | readiness result | CANDIDATE | bloquea aprobación si requerido |
| Planning | `allAssignedTechsHaveValidCerts` | status | domain | readiness result | CANDIDATE | incluye expiración/ausencia |
| Planning | `allVehiclesHaveValidDocuments` | status | domain | readiness result | CANDIDATE | regla única server-authoritative |
| Planning | `allToolsHaveValidCalibration` | status | domain | readiness result | CANDIDATE | solo herramientas que la requieren |
| Planning | `safetyChecklistComplete` | status | domain | readiness result | CANDIDATE | HES y versión aplicable |
| Planning | `canExecute` | derived status | domain | readiness result | CANDIDATE | true solo sin bloqueadores críticos |
| Planning | `blockingReasons` | array | domain | readiness result | CANDIDATE; equivalentes `blockers` presentes | códigos estables, mensajes localizables |
| Execution | `startTime`, `endTime` | ISO datetime status | shared-types | schema/model | CANDIDATE con esos nombres | orden temporal y transición válida |
| Execution | `elapsedMinutes`, `estimatedMinutes` | entero no negativo | domain/shared-types | read model | CANDIDATE/DERIVED | no cálculo divergente en UI |
| Execution | `offlineQueueSize` | entero | frontend read model | sync status | CANDIDATE/DERIVED | refleja cola real, no persistir en sesión |
| Execution | `evidenceQueue` | array refs | frontend/offline | sync state | CANDIDATE | idempotency key y owner válidos |
| Execution | `fieldNovelties` | array | shared-types | session schema/model | CANDIDATE | autor, timestamp y resolución |
| Execution | `supervisorSignature` | FileAsset/signature ref | shared-types | session/report | PRESENT en otros contratos | consentimiento y ownership |
| Evidence | `phase`, `source`, `rejectionReason` | enums/text status | shared-types | evidence schema/model | PRESENT | transición y motivo requeridos |
| Evidence | `reviewStatus`, `replacementOf` | enum/ref status | shared-types | evidence FSM | CANDIDATE | reemplazo no borra original |
| Evidence | `lockedByReport`, `usedInReport` | status/refs | shared-types/backend | evidence/report relation | CANDIDATE | evidencia usada no se elimina/muta |
| Evidence | `gpsMetadata`, `qualityScore` | object/score status | shared-types | evidence metadata | nombres CANDIDATE | GPS opcional y score explicable |
| Asset readiness | `documentStatus`, `certificationStatus`, `calibrationStatus`, `maintenanceStatus`, `availabilityStatus` | status objects | domain/shared-types | unified readiness | CANDIDATE | cada ausencia distingue not-required/missing/expired |
| Asset readiness | `readinessScore`, `blockingReasons` | score + array | domain | read model | score PRESENT en Kit; no generalizado | score nunca sustituye bloqueador crítico |
| Financial | `sesStatus`, `invoiceStatus`, `paymentStatus` | status | shared-types/backend | closure read model | PRESENT | secuencia y ownership correctos |
| Financial | `agingDays` | entero no negativo | domain/backend | invoice read model | CANDIDATE/DERIVED | fecha corte explícita y zona horaria |
| Financial | `estimatedCost`, `actualCost`, `margin`, `deviation`, `riskLevel` | money/percent/status | domain/shared-types | cost summary | varios PRESENT; `riskLevel` no financiero confirmado | fórmula única y casos cero/negativo |

## Orden de implementación por campo

1. Buscar equivalentes semánticos existentes y evitar duplicación.
2. Definir ausencia mediante status object, no `null`/`undefined` explícitos.
3. Añadir test de parseo/rechazo en shared-types.
4. Añadir regla pura y test en domain para campos derivados.
5. Migrar modelo solo si el campo es persistente.
6. Exponer por endpoint y consumir con TanStack Query.
7. Probar UI, RBAC, offline y compatibilidad de datos históricos.

