# Auditoría CERMONT_CODIGO.json vs Código Real

> **Fecha:** 2026-07-09
> **Propósito:** Comparar el inventario documentado en CERMONT_CODIGO.json contra el código real del monorepo

---

## Backend: Módulos Reales (58 encontrados)

```
admin-backup, ai, analytics, analytics-report, asset, audit, auth, automation,
business-document, checklist, client, client-signature, cost, custom-fields,
dashboard, delivery-record, dian, dispatch, documents, erp-connector, evidence,
execution-session, files, fleet, form-submissions, inspection, inventory, invoice,
jobs, kit, kpi, maintenance, notification-preferences, notifications, observability,
order, payment, planning-packet, portal, privacy-requests, proposal, purchase-order,
qr, report, resource, safety-analysis, service-cases, service-entry-sheet, site-visit,
sla, sync, system-config, technical-report, template-draft, template-response,
tool, user, work-requests
```

## Frontend: Rutas Reales (~140 encontradas)

**Dashboard (principal):**
`/admin`, `/admin/audit`, `/admin/backups`, `/admin/custom-fields`,
`/admin/erp-connectors`, `/admin/personnel`, `/admin/settings`, `/admin/users`,
`/admin/users/[id]`, `/admin/users/[id]/edit`, `/admin/users/new`,
`/assets`, `/assets/[id]`,
`/billing`, `/billing/invoices`, `/billing/invoices/[id]`, `/billing/invoices/[id]/approve`,
`/billing/invoices/new`, `/billing/ses`, `/billing/ses/[id]`, `/billing/ses/[id]/approve`, `/billing/ses/new`,
`/business-documents`, `/business-documents/[id]`,
`/checklists`,
`/costs`, `/costs/[orderId]`, `/costs/[orderId]/ejecucion`, `/costs/catalog`,
`/customers`, `/customers/[id]`, `/customers/new`,
`/dashboard`,
`/delivery-records`, `/delivery-records/[id]`, `/delivery-records/[id]/signature`, `/delivery-records/new`,
`/dispatch`, `/documents`, `/documents/ingestion/[id]`, `/documents/templates`, `/documents/templates/new`,
`/erp-connector`,
`/evidences`, `/evidences/[id]`, `/evidences/report`,
`/execution`, `/execution-sessions/[id]`, `/execution/[id]`, `/execution/new`,
`/fleet`, `/fleet/[id]`,
`/forms`, `/forms/[templateId]`,
`/inventory`, `/inventory/scan`, `/invoices/[id]/pipeline`,
`/maintenance`, `/maintenance/[id]`, `/maintenance/[id]/edit`, `/maintenance/new`, `/maintenance/schedules`,
`/notifications`,
`/offline-sync`,
`/orders`, `/orders/[id]`, `/orders/[id]/asts`, `/orders/[id]/costs`, `/orders/[id]/edit`,
`/orders/[id]/execution`, `/orders/[id]/inspections/[inspectionId]`, `/orders/[id]/invoice`,
`/orders/[id]/planning`, `/orders/kanban`, `/orders/new`,
`/payments`, `/payments/[id]`, `/payments/new`,
`/planning`, `/planning-packet/new`, `/planning/[id]`,
`/profile`, `/profile/privacy`,
`/proposals`, `/proposals/[id]`, `/proposals/new`,
`/purchase-orders`, `/purchase-orders/[id]`, `/purchase-orders/new`,
`/reports`, `/reports/[id]`, `/reports/[id]/draft`, `/reports/[id]/sign`,
`/reports/analytics`, `/reports/archive`, `/reports/new`,
`/resources`, `/resources/[id]`, `/resources/kits`, `/resources/kits/new`,
`/service-cases`, `/service-cases/[id]`,
`/settings/notifications`,
`/site-visits`, `/site-visits/[id]`, `/site-visits/new`,
`/sla`,
`/templates`, `/templates/[id]`,
`/tools`,
`/work-requests`, `/work-requests/[id]`, `/work-requests/new`

**Portal cliente:**
`/portal`, `/portal/invoices`, `/portal/orders`, `/portal/orders/[id]`, `/portal/proposals`,
`/portal/service-cases`, `/portal/service-cases/[id]`, `/portal/signatures/[id]`

**Otras:**
`/(auth)/forgot-password`, `/(auth)/login`, `/(auth)/register`, `/(auth)/reset-password`,
`/(legal)/consent`, `/(legal)/privacy`, `/(legal)/terms`,
`/~offline`, `/unauthorized`

## Schemas: Reales (111 encontrados)

La lista completa de schemas está en `packages/shared-types/src/schemas/`.

---

## Comparación contra CERMONT_CODIGO.json

**Estado:** [PENDIENTE — cargar y comparar CERMONT_CODIGO.json]

Para completar la comparación:
```bash
# Extraer módulos del JSON actual
Get-Content ".sisyphus/plans/CERMONT_CODIGO.json" | ConvertFrom-Json | Select-Object -ExpandProperty "modulos"

# Comparar contra la lista real (58 módulos)
# Marcar como:
# - "EN JSON PERO NO EN CÓDIGO" → posible módulo planeado no implementado
# - "EN CÓDIGO PERO NO EN JSON" → JSON desactualizado
```

## Hallazgos Preliminares

| Hallazgo | Descripción | Severidad |
|---|---|---|
| H-F7-01 | `CERMONT_CODIGO.json` no ha sido comparado contra el código real | Media |
| H-F7-02 | Se encontraron schemas como `lifeline.schema.ts` y `camera.schema.ts` que sugieren que los formatos operativos ya tienen cobertura parcial | Informativo |
| H-F7-03 | El frontend tiene ~140 rutas, significativamente más que las reportadas en planes anteriores | Informativo |
