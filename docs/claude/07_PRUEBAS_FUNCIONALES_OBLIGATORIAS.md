# 07 — Pruebas funcionales obligatorias

## Pruebas API

### 1. No iniciar ejecución sin planeación

```text
POST /api/orders/:id/advance-step
body: { targetStep: "execution" }
expected: 422, blocker planning_incomplete
```

### 2. Adjuntar documento contextual

```text
POST /api/documents/upload
POST /api/documents/:id/associate
expected: association.stepKey, requirementKey, purpose
```

### 3. Seleccionar documento existente

```text
GET /api/documents?query=AST
POST /api/documents/:id/associate
expected: blocker resolved
```

### 4. Guardar opción custom

```text
POST /api/template-responses
body: { field: "tools", customValues: ["Cortadora de plasma"] }
expected: custom option persisted
```

### 5. No radicar SES sin acta firmada

```text
POST /api/service-entry-sheets
expected: 422, missing_signed_delivery_record
```

### 6. No facturar sin SES aprobada

```text
POST /api/invoices
expected: 422, ses_not_approved
```

### 7. No cerrar sin pago

```text
POST /api/orders/:id/close
expected: 422, payment_missing
```

## Pruebas UI Playwright

### A. Botón de documento no redirige

- Ir a `/billing/ses`.
- Click en “Adjuntar soporte”.
- Debe abrir modal contextual.
- No debe navegar a `/documents`.
- Debe mostrar paso/requisito.

### B. Selector abierto

- Ir a planeación.
- Abrir herramientas.
- Seleccionar “Otro”.
- Escribir herramienta.
- Guardar.
- Ver opción en resumen.

### C. Cockpit 14 pasos

- Ir a `/service-cases/:id`.
- Ver 14 pasos.
- Ver bloqueadores.
- Resolver documento faltante.
- Ver actualización de estado.

### D. Costos

- Ir a costos de OT.
- Ver estimado.
- Registrar horas/materiales.
- Ver real.
- Ver varianza y margen.

## Evidencia

Guardar en:

```text
.sisyphus/evidence/api/
.sisyphus/evidence/ui/
.sisyphus/evidence/gates/
```
