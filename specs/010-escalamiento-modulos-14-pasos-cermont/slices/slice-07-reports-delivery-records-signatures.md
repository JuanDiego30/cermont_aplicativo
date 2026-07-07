# Slice 07 — TechnicalReport + DeliveryRecord + Signatures

**Estado:** módulos/páginas presentes; cadena documental E2E pendiente.

## Objetivo

Generar informe y acta desde datos estructurados, conservar versiones y formalizar firma/aceptación sin recaptura completa.

## Aceptación

- Informe usa la plantilla del servicio y solo evidencia válida del caso.
- Preview y versión emitida quedan trazables.
- Acta requiere informe aprobado.
- Firma registra consentimiento, firmante, tiempo y documento exacto.
- Documento firmado es inmutable; corrección crea nueva versión.
- Cliente solo accede a sus documentos.

## Tests

Informe sin evidencia, evidencia de otro caso, generación PDF, versión, acta prematura, firma ajena/repetida y auditoría.

## Límite

Firma capturada no equivale automáticamente a firma digital criptográfica certificada; el LTG clasifica PKI como evolución futura.

