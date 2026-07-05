# Contract note — Delivery Record + Signature

## SSOT actual

`delivery-record.schema.ts`, `client-signature.schema.ts`, modelos y módulos homónimos.

## Invariantes

- Acta referencia ServiceCase e informe aprobado.
- Documento emitido tiene versión/hash/archivo rastreable.
- Firma referencia versión exacta, firmante, capacidad, consentimiento y timestamp.
- Firma repetida es idempotente o conflicto explícito.
- Corrección posterior crea nueva versión; no altera la firmada.
- Ownership cliente y permisos internos se validan en backend.

## Límite

Este contrato registra aceptación; no afirma certificación PKI salvo implementación separada y validada.

