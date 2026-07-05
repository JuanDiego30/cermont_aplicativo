# 03 — Plan: biblioteca documental reutilizable y contextual

## Problema

Subir un archivo y dejarlo en `/documents` no resuelve la operación. El documento debe poder llamarse, asociarse y reutilizarse desde cualquier paso.

## Objetivo

Crear un flujo documental profesional:

```text
Subir nuevo o seleccionar existente
→ asociar a caso/OT/paso/requisito
→ clasificar propósito
→ procesar si aplica
→ resolver blocker
→ quedar visible en timeline
```

## Entidades

### DocumentSourceFile

Documento físico o digital cargado.

Campos mínimos:

```text
id
fileName
mimeType
size
storageKey
uploadedBy
uploadedAt
checksum
tags
source
```

### DocumentAssociation

Relación funcional del documento.

```text
documentId
serviceCaseId
orderId
stepKey
requirementKey
purpose
entityType
entityId
blocksOrResolves
status
```

### DocumentProcessingJob

Procesamiento opcional.

```text
documentId
jobType: extract_text | extract_table | detect_fields | classify_evidence
status: pending | processing | completed | failed
result
confidence
error
```

## Endpoints

```text
POST /api/documents/upload
GET /api/documents
GET /api/documents/:id
POST /api/documents/:id/associate
DELETE /api/documents/:id/associations/:associationId
POST /api/documents/:id/process
GET /api/service-cases/:id/documents
GET /api/orders/:id/documents
GET /api/workflow/:entityId/steps/:stepKey/documents
```

## Frontend

Crear componente:

```text
DocumentPickerModal
```

Debe tener dos pestañas:

1. Subir nuevo.
2. Seleccionar existente.

Debe recibir:

```ts
serviceCaseId
orderId
stepKey
requirementKey
purpose
acceptedTypes
```

## Reglas

No se acepta:

```text
<a href="/documents">Soportes</a>
```

Se acepta:

```text
<Button onClick={() => openDocumentPicker({
  serviceCaseId,
  stepKey: "ses_submission",
  requirementKey: "ariba_support",
  purpose: "closure_support"
})}>
  Adjuntar soporte Ariba
</Button>
```

## QA

- Desde SES se adjunta soporte nuevo.
- Desde factura se selecciona documento ya existente.
- Desde acta se adjunta PDF firmado.
- El mismo documento puede estar asociado a dos entidades con propósitos distintos.
- Al asociar documento requerido se recalculan bloqueadores.
