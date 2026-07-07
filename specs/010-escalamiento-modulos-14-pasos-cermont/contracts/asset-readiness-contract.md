# Contract note — Asset Readiness

## SSOT actual

Schemas vehicle/tool/asset/resource, `fleet-readiness.rules.ts`, modelos Vehicle/Tool/Resource/Asset y módulos fleet/tool/resource/asset/maintenance.

## Resultado

Disponibilidad y estados de documentos, certificación, calibración y mantenimiento, más blockers estructurados. Un score puede resumir, pero nunca sobreescribe un bloqueo crítico.

## Invariantes

- Regla única compartida y aplicada por backend.
- “No aplica”, “faltante”, “vigente” y “vencido” son distintos.
- Asignación/checkout concurrente es atómico.
- FileAsset owner adapter coincide con el modelo canónico.
- La dualidad Tool/Resource se resuelve antes de expandir contratos.

