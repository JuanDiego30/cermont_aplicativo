# Known Issues - CERMONT

**Fecha:** 2026-06-24  
**Contexto:** baseline Spec 003 Profesionalizacion CERMONT.

## Baseline de calidad

| Issue | Estado | Accion |
|---|---|---|
| `quality:strict` pasa con deuda baseline | 2920 weak-token findings dentro de baseline; no se debe ampliar | Clasificar y reducir por lotes |
| Warnings Biome en `backend/src/models/ServiceCase.ts` | RESUELTO en Spec 003 Slice 1 | `npm run lint -w backend` PASS sin warnings; se reemplazo `void` por `ServiceCaseSummary` tipado |
| `quality:language` | 2601 tokens en espanol dentro de baseline | No aumentar sin justificacion |
| `quality:routes` | 20 findings dentro de baseline | Mapear contra ASVS/RBAC antes de tocar rutas |
| `quality:dtos` | 33 findings dentro de baseline | Migrar DTOs locales a shared contracts gradualmente |
| React Doctor | Score 87/100, 12 warnings | Revisar por lotes: CameraCapture, ProposalSelector, AttachmentGallery, archivos UI no usados y componentes grandes |

## Slice 0 baseline validado

El 2026-06-24 se ejecuto baseline completo para iniciar la implementacion real de la Spec 003:

- `npm run typecheck`: PASS.
- `npm run lint`: PASS con 2 warnings existentes en `backend/src/models/ServiceCase.ts`.
- `npm test`: PASS, 1014 tests.
- `npm run build`: PASS, 83 rutas frontend.
- `npm run contracts:check`: PASS, snapshot `sha256:c0efaa9be560bafe6bcdbfc5b2b433528ea1085dbc9ca1b7a9f8b1809dc74dfa`.
- `npm run quality:strict`: PASS, hallazgos dentro de baseline.
- `npm run verify`: PASS.
- `npx react-doctor@latest`: PASS con score 87/100 y 12 warnings.

Esta evidencia no cierra tareas funcionales; solo establece linea base antes de tocar codigo. La deuda `ServiceCase.ts` fue corregida posteriormente en Slice 1.

## React Doctor baseline

`npx react-doctor@latest` ejecuto React Doctor v0.5.8 y termino con codigo 0, score 87/100.

Categorias reportadas:

- Bugs: 3 warnings.
- Accessibility: 2 warnings.
- Maintainability: 7 warnings.

Archivos mencionados por `npm run verify` con `react-doctor --verbose`:

- `frontend/src/modules/files/ui/CameraCapture.tsx`
- `frontend/src/modules/service-cases/components/ProposalSelector.tsx`
- `frontend/src/modules/fleet/ui/VehicleDocumentSection.tsx`
- `frontend/src/modules/fleet/ui/VehiclePhotoSection.tsx`
- `frontend/src/modules/resources/ui/ToolDocumentSection.tsx`
- `frontend/src/modules/resources/ui/ToolPhotoSection.tsx`
- `frontend/src/modules/files/ui/AttachmentGallery.tsx`
- `frontend/src/modules/files/ui/FileEmptyState.tsx`
- `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx`

## WIP protegido

El arbol de trabajo contiene cambios previos extensos en backend, frontend, packages, tooling y docs. Spec 003 no debe revertirlos ni mezclarlos con implementaciones funcionales hasta que el usuario confirme el siguiente bloque.

## Riesgos legales abiertos

| Issue | Estado | Accion |
|---|---|---|
| RNBD CERMONT | No verificado | Confirmar si CERMONT tiene activos totales superiores a 100.000 UVT |
| Consentimientos de fotos/GPS/documentos | Backend contract/API creado en Slice 3; gates UI pendientes | Integrar gates en camara, GPS y documentos antes de cerrar T071-T073 |
| Politica de tratamiento | Borrador publico minimo creado en Slice 4 | Requiere revision juridica antes de uso y falta politica operacional de retencion/supresion |
| Derechos del titular | Modulo backend `privacy-requests` creado en Slice 3 | Falta UI operacional, SLA juridico validado y procedimiento revisado por abogado |

## Riesgos de autoria y licencias

| Issue | Estado | Accion |
|---|---|---|
| Atribucion Juan Diego Arevalo Pidiache | Implementada como borrador tecnico en Slice 4 | Revisar redaccion final con CERMONT S.A.S., Universidad de Pamplona y asesoria juridica |
| Titularidad patrimonial | No verificada | Revisar contrato con CERMONT, practica empresarial, Universidad de Pamplona, encargos y cesiones |
| Licencias de terceros | Inventario tecnico inicial creado en Slice 4 | Generar reporte automatico de licencias antes de release y validarlo juridicamente |

## Autoria y legal Slice 4

- `AUTHORS.md`, `NOTICE.md`, `COPYRIGHT.md` y README incluyen atribucion academica y tecnica a Juan Diego Arevalo Pidiache.
- `/about` muestra metadata centralizada desde `@cermont/config` y enlaces a borradores legales publicos.
- `/privacy-policy`, `/privacy-notice` y `/terms` existen como borradores tecnicos publicos con aviso obligatorio.
- Riesgo abierto: no se afirma titularidad patrimonial exclusiva ni cumplimiento legal definitivo.

## Riesgos funcionales priorizados

- Evidencias/documentos requieren consentimiento, retencion y auditoria de descargas.
- Herramientas/flota ya tienen summaries visibles de readiness/availability en Slice 5; faltan check-in/check-out persistente, historial de asignacion y reglas de bloqueo configurables.
- Service cases requieren SLA, timeline, bloqueos y cierre tecnico/administrativo separado.
- Checklists requieren versionado, items obligatorios/bloqueantes, foto y firma.
- Dashboard requiere KPIs accionables y filtros operativos.

## Seguridad Slice 2

- Rate limiting de recuperacion de contrasena implementado con bucket separado `password-recovery`.
- Descargas de `FileAsset` auditadas con accion `FILE_ASSET_DOWNLOADED`.
- CSP report-only estricto agregado sin `'unsafe-inline'`.
- Riesgo abierto: CSP enforced todavia conserva `'unsafe-inline'`; no se elimina hasta validar impacto en frontend.

## Deploy seguro Spec 004

- Los seeds destructivos ahora rechazan `NODE_ENV=production`, exigen contraseñas por entorno y no imprimen credenciales.
- El test de configuracion de despliegue fue alineado con la topologia canonica PM2 + Nginx, sin Docker.
- La validacion backend productiva exige origen HTTPS y secretos JWT distintos sin placeholders.
- La auditoria remota, backup, HTTPS y smoke tests siguen pendientes de evidencia del VPS; no se afirma cumplimiento hasta ejecutarlos.

## Modulos funcionales Slice 5

- Flota: `listVehicles` ahora agrega `readinessSummary` con score, documentos vencidos/proximos/faltantes y razones de bloqueo; `/fleet` muestra badge visible por vehiculo.
- Activos: `getAssets` ahora agrega `availabilitySummary` con score, mantenimiento proximo/vencido, estado bloqueante o asignado; `/assets` muestra badge visible por activo.
- Contratos: migracion `061-fleet-asset-readiness-summaries`, snapshot `sha256:3e99a9d60a029f673a52f4fe6c59957627553938a6a718de260ff23b73485378`.
- Riesgo abierto: estas mejoras son summaries derivados; no reemplazan historial persistente de asignacion, certificados/calibraciones completos ni bloqueo por politica configurable.

## Modulos profesionales Slice 063

- Flota: `/api/fleet/:id/profile` devuelve perfil Zod con readiness, fotos requeridas y documentos FileAsset; `/fleet/[id]` consume ese perfil sin `apiClient` directo.
- Activos/herramientas: `/api/assets/:id/profile` devuelve perfil Zod con availability, fotos requeridas y documentos FileAsset; `/assets/[id]` consume ese perfil sin `apiClient` directo.
- FileAsset: `asset` ahora es entityType soportado y `Asset` guarda `fileAssets`; se agregaron categorias asset/vehicle requeridas para perfiles.
- Riesgo abierto: check-in/check-out, historial de asignacion, calibraciones como flujo formal y politicas configurables de bloqueo siguen pendientes.

## CI y observabilidad Slice 6

- CI: `.github/workflows/ci.yml` ahora ejecuta `contracts:check`, `quality:strict` y `npm audit --audit-level=high` como gates explicitos.
- Test de CI: `tooling/ci-workflow.test.ts` pasa y valida que esos gates existan en el workflow.
- `npm audit --audit-level=high` falla por vulnerabilidades existentes en `multer`, `undici` y `postcss` via `next`. No se corrigio porque requiere modificar dependencias y `package-lock.json`.
- Observabilidad: `docs/observability/OBSERVABILITY_PLAN.md` documenta senales actuales y gaps. Falta destino productivo de alertas, owner operativo, politica de retencion aprobada y runbook de incidentes.
- `tooling/deployment-config.test.ts` sigue fallando por drift preexistente en deploy/docker/seed docs; no se mezclo con la slice de CI.
