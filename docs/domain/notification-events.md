# Notification Events — CERMONT S.A.S.

> **Última actualización:** 2026-06-08
> **Propósito:** Documentar todos los eventos críticos del sistema que disparan notificaciones, garantizando cobertura completa del flujo operativo de 14 pasos.

---

## Matriz de Eventos Críticos

| # | Evento | Disparador | Roles notificados | Estado |
|---|--------|-----------|-------------------|--------|
| 1 | Solicitud de servicio creada | `step_01_work_request` creado | gerente, residente | ✅ Implementado |
| 2 | Visita técnica completada | `step_02_site_visit` completado | residente, supervisor, tecnico | ✅ Implementado |
| 3 | Propuesta enviada/aprobada | `step_03_proposal` → aprobado | gerente, administrativo | ✅ Implementado |
| 4 | PO recibida | `step_04_purchase_order` registrada | gerente, administrativo, cliente | ✅ Implementado |
| 5 | Planeación completada | `step_05_planning` lista | residente, supervisor, gerente | ✅ Implementado |
| 6 | Ejecución iniciada/completada | `step_06_execution` estado cambiado | supervisor, tecnico, operador | ✅ Implementado |
| 7 | Informe técnico generado | `step_07_technical_report` creado | residente, supervisor | ✅ Implementado |
| 8 | Acta de entrega creada | `step_08_delivery_record` generado | residente, supervisor, administrativo | ✅ Implementado |
| 9 | Acta firmada por cliente | `step_09_client_signature` registrada | gerente, residente, cliente | ✅ Implementado |
| 10 | SES radicada | `step_10_ses_submission` enviada | administrativo, gerente | ✅ Implementado |
| 11 | SES aprobada | `step_11_ses_approval` aprobada | administrativo, gerente | ✅ Implementado |
| 12 | Factura emitida | `step_12_invoice_submission` enviada | administrativo, gerente | ✅ Implementado |
| 13 | Factura aprobada | `step_13_invoice_approval` aprobada | gerente, cliente | ✅ Implementado |
| 14 | Pago registrado | `step_14_payment_closure` conciliado | administrativo, gerente | ✅ Implementado |
| 15 | Planeación pendiente | Blocker detectado en step_05 | residente, supervisor | 🔄 Pendiente |
| 16 | Ejecución bloqueada | Blocker blocking en step_06 | residente, supervisor | 🔄 Pendiente |
| 17 | Evidencia sin sync | Evidencia con syncStatus "pending" > 24h | supervisor, residente | 🔄 Pendiente |
| 18 | SES pendiente (recordatorio) | step_10 sin avanzar > 7 días | administrativo, gerente | 🔄 Pendiente |
| 19 | Factura pendiente (recordatorio) | step_12 sin avanzar > 7 días | administrativo, gerente | 🔄 Pendiente |
| 20 | Pago vencido | step_14 sin pago > 30 días | gerente, administrativo | 🔄 Pendiente |

---

## Implementación Actual

### Notificaciones por cambio de paso (14 pasos)

Cada transición de paso en el flujo operativo dispara `notifyStateTransition()` desde:

- **`cermont-workflow-gate.service.ts:1099`** — Al avanzar un paso operativo vía `advanceServiceCaseStep()`
- **`service-case.service.ts:1374`** — Al realizar transiciones de estado en la máquina de estados

### Roles mapeados por paso

Ver `notification.service.ts:getRolesToNotifyForStep()` para el mapeo detallado de roles por paso.

### Registro de auditoría

Todas las transiciones de paso también generan un registro de auditoría inmutable vía `createAuditLog()` con:
- `entity: "ServiceCase"`
- `action: "SERVICE_CASE_STEP_ADVANCED"`
- `before/after: { previousStepCode, newStepCode, newStage }`

---

## Próximas Implementaciones (Pendientes)

### Eventos basados en blockers (15-16)
Agregar notificaciones en `calculateBlockersForServiceCase()` cuando se detecten blockers blocking.

### Recordatorios programados (18-20)
Implementar job programado (node-cron o similar) que verifique casos sin avance:
- `step_10_ses_submission` sin avanzar después de 7 días → notificar administrativo, gerente
- `step_12_invoice_submission` sin avanzar después de 7 días → notificar administrativo, gerente
- `step_14_payment_closure` sin pago después de 30 días → notificar gerente, administrativo

### Evidencia sin sincronizar (17)
Job diario que detecte evidencias con `syncStatus: "pending"` por más de 24 horas.
