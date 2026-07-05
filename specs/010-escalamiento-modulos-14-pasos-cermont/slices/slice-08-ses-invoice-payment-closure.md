# Slice 08 — SES → Invoice → Payment → Closure

**Estado:** módulos/páginas presentes; flujo completo pendiente de evidencia E2E.

## Objetivo

Conectar cierre técnico con SES, aprobación, factura, aprobación, pago y cierre administrativo.

## Gates

- SES requiere acta firmada.
- Factura requiere SES aprobada.
- Aprobación requiere factura enviada.
- Pago requiere factura aprobada.
- Cierre requiere soportes, checklists, evidencias y conciliación completos.

## Aceptación

Timeline único, aging explícito, alertas de vencimiento, motivos de rechazo, reenvíos idempotentes, comprobante FileAsset y auditoría.

## Tests

Cada gate negativo, camino feliz, rechazo/reenvío, duplicados, pago fallido/parcial, cierre bloqueado y ownership cliente.

## Límite

Seguimiento de factura no equivale a emisión electrónica DIAN; registro SES no equivale a integración SAP Ariba.

