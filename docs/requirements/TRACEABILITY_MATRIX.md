# Matriz de Trazabilidad: Requisito → Módulo → Endpoint

> **Fuente:** `docs/requirements/THESIS_REQUIREMENTS.md`
> **Fecha:** 2026-07-09
> **Estado:** VERIFICADO PARCIALMENTE CONTRA CÓDIGO REAL (2026-07-09)

---

## Matriz de Trazabilidad (Verificada)

| Req ID | Falla/Requisito | Módulo Backend | Endpoint(s) | Schema Zod | Frontend Route | Estado Real |
|---|---|---|---|---|---|---|
| FC-01 | Planeación de obra (Paso 5) | `backend/src/modules/planning-packet/` | `POST/GET/PUT /api/planning-packet/*` | `planning-packet.schema.ts` | `/planning` | ✅ VERIFICADO (módulo existe, 2 rutas detectadas) |
| FC-02 | Ejecución + evidencias (Paso 6) | `backend/src/modules/execution-session/`, `evidence/` | `POST/GET /api/execution-session/*`, `POST/GET /api/evidence/*` | `execution-session.schema.ts`, `evidence.schema.ts` | `/execution/[id]`, `/evidences` | ✅ VERIFICADO (ambos módulos existen con rutas) |
| FC-03 | Consolidación documental (Pasos 7-9) | `backend/src/modules/report/`, `delivery-record/` | `POST/GET /api/report/*`, `POST/GET /api/delivery-record/*` | `report.schema.ts`, `delivery-record.schema.ts` | `/reports`, `/delivery-records` | ✅ VERIFICADO (ambos módulos existen) |
| FC-04 | Facturación y cierre (Pasos 10-14) | `backend/src/modules/service-entry-sheet/`, `invoice/`, `payment/` | `POST/GET /api/service-entry-sheet/*`, `POST/GET /api/invoice/*`, `POST/GET /api/payment/*` | `service-entry-sheet.schema.ts`, `invoice.schema.ts`, `payment.schema.ts` | `/billing/ses`, `/billing/invoices`, `/payments` | ✅ VERIFICADO (3 módulos existen) |
| FC-05 | Costos reales vs presupuestados (Transversal) | `backend/src/modules/cost/` | `GET /api/orders/:id/costs`, `POST /api/cost/*` | `cost.schema.ts`, `cost-cart.schema.ts` | `/costs/:orderId` | ✅ VERIFICADO (módulo existe con 1 ruta) |
| REQ-006 | Modo offline ejecución campo | `backend/src/modules/sync/` | `POST /api/sync/*` | `sync.schema.ts` | `/offline-sync` | ✅ VERIFICADO (módulo existe, frontend tiene ruta /offline-sync) |
| REQ-007 | Formularios dinámicos (futuro) | `backend/src/modules/form-submissions/` | `POST/GET /api/form-templates/*`, `POST /api/form-submissions/*` | `dynamic-form-template.schema.ts`, `dynamic-form-response.schema.ts`, `form-submission.schema.ts` | `/forms/[templateId]` | ✅ VERIFICADO (módulo form-submissions existe)

---

## Comandos de Verificación

Ejecutar para verificar cada celda de la matriz:

```bash
# Verificar existencia de módulos backend
Get-ChildItem -Path "backend/src/modules" -Directory | Select-Object Name

# Verificar endpoints específicos
Select-String -Path "backend/src/modules/*/routes.ts" -Pattern "router\.(get|post|put|delete|patch)"

# Verificar existencia de schemas
Get-ChildItem -Path "packages/shared-types/src/schemas" -Name

# Verificar rutas frontend
Get-ChildItem -Path "frontend/src/app" -Recurse -Filter "page.tsx"
```

---

## Gaps Detectados

| Gap | Descripción | Acción Requerida |
|---|---|---|
| Sin verificar | Ninguna celda de la matriz ha sido verificada contra código real | Ejecutar comandos de verificación y actualizar filas |

## Implementaciones Sin Requisito Trazado

| Módulo | Posible Razón |
|---|---|
| `backend/src/modules/fleet/` | No mencionado en 5 fallas críticas — posible scope creep |
| `backend/src/modules/asset/` | No mencionado en 5 fallas críticas — posible scope creep |
| `backend/src/modules/portal/` | No mencionado en 5 fallas críticas — extensión |
| `backend/src/modules/notifications/` | No mencionado en 5 fallas críticas — mejora continua |
| `backend/src/modules/automation/` | No mencionado en 5 fallas críticas — innovación |
