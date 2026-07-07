# Spec 009 — Implementation log

## Fase 0 — Resultado

Fecha: 2026-06-29  
Rama: `implement/spec-009-execution-scale-cermont`  
Commit base: `a5490f3`

### Impact Map

La Fase 0 solo crea evidencia y no modifica funcionalidad. Se preservan tres cambios previos del usuario en dashboard, fleet y order detail, además de los archivos no rastreados existentes.

### Entradas obligatorias

- Encontrado como alternativa: `docs/REGLAS_DESARROLLO_CERMONT.md`.
- Ausente en la ruta indicada: `REGLAS_DESARROLLO_CERMONT.md`.
- Ausente: `.specify/memory/constitution.md`; no existe otra constitución en el repositorio.
- Leídos: documentos canónicos, `docs/architecture/`, `docs/product/`, Spec 008 y prompt Spec 009.

### Baseline ejecutado

| Gate | Estado | Evidencia | Bloquea | Acción |
|---|---|---|---|---|
| `npm run typecheck` | PASS | 7/7 tareas | No | Ninguna |
| `npm run lint` | PASS | 7/7 tareas, sin errores | No | Ninguna |
| `npm test` | PASS | 173 archivos, 1057 tests | No | Mantener |
| `npm run build` | PASS | 5/5 tareas, 89 páginas, exit 0 | No | Mantener |
| `npm run contracts:check` | PASS | `sha256:c2cd5b00201976c53ab97502d236b3d3a3b5c88fe3cf06a76f32c39da83328c0` | No | No actualizar snapshot |
| `npm run quality:strict` | PASS | 2862 weak tokens dentro del baseline | No | No subir baseline |
| `npm run verify` | PASS | Secuencia completa, exit 0 | No | Repetir tras cambios |
| `npx react-doctor@latest` | 77/100 | 1 error, 19 warnings | Sí, cierre P0 | Corregir por TDD y causa raíz |

### Hallazgos de baseline

- Weak tokens: `a 65/67`, `n 1449/1449`, `u 597/597`, `ud 751/751`.
- React Doctor v0.5.8 reporta 20 issues; el error principal es un timer sin cleanup en `NewVehicleDrawer.tsx`.
- Los tests pasan, pero emiten una advertencia real de Radix: `DialogContent` sin `DialogTitle` en `DocumentGallery`.
- El baseline documental de Spec 008 que describía `quality:strict` fallido está obsoleto frente a la ejecución actual.

### Siguiente fase

Fase 1 P0: corregir React Doctor y verificar los errores post-deploy conocidos. No se inicia P1 hasta que P0 y FileAsset SSOT pasen sus gates.

## Fases 1–2 — Estabilización P0 y FileAsset SSOT

- Límite JSON de Express elevado de 10 KB a 2 MB y cubierto por regresión de perfil/avatar.
- Endpoints de notificaciones del header alineados a `/notifications`; los errores ya no se convierten en éxito vacío.
- Assets PWA canónicos regenerados y `robots.ts` incorporado.
- React Doctor v0.5.8: 97/100, 0 errores, 1 warning.
- Warning Radix de `DocumentGallery` corregido y cubierto por test.
- `/api/media` y sus consumidores frontend retirados; `/api/files` queda como única API genérica.
- FileAsset incorpora kind, source, lifecycle status, primary flag y metadata escalar.
- Parent adapters alineados para planning, document, work order, service case, execution session, checklist y report.
- Descargas auditadas; idempotencia offline aislada por owner/entity/uploader; `cliente` permanece fuera del perímetro interno.
- Snapshot contractual actualizado solo después del diseño final: migración `055-spec-009-fileasset-ssot`.

### Clasificación de incidentes post-deploy

| Incidente | Estado local | Clasificación |
|---|---|---|
| `PayloadTooLargeError` en perfil | Corregido y probado | Bug de código cerrado localmente; falta despliegue autorizado |
| Manifest/iconos/robots ausentes | Corregido y probado | Assets locales cerrados; falta despliegue autorizado |
| Notificaciones 401/endpoint incorrecto | Corregido y probado | Bug frontend cerrado localmente |
| Radix `DialogTitle` | Corregido y probado | Bug de accesibilidad cerrado |
| Work request 400 | Contrato frontend/backend coincidente | No reproducido; probable versión desplegada obsoleta |
| Document upload 400 | Pipeline local usa `processUploadedFile` y `storedPath` | No reproducido; requiere smoke sobre VPS después de deploy autorizado |
| User detail 500 | Ruta y servicio locales presentes | No reproducido; requiere evidencia de logs del VPS |

No se realizó deploy.
