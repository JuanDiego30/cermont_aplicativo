# Deuda Técnica — CERMONT S.A.S.

**Fecha:** 2026-06-24

---

## P1 — Crítica

| ID | Deuda | Impacto | Módulo |
|----|-------|---------|--------|
| TD-001 | Sin tests de integración de rutas backend | Riesgo de regresiones | global |
| TD-002 | Sin tests de contratos compartidos | Riesgo de incompatibilidad FE/BE | shared-types |
| TD-003 | API_ENDPOINT_MATRIX.md desactualizado (100 docs vs 389+ reales) | Documentación no refleja realidad | docs |
| TD-004 | Sin cumplimiento legal Ley 1581 | Riesgo de multa SIC | global |
| TD-005 | ~~Seed de datos con contraseñas predecibles~~ RESUELTO en Spec 004: los seeds exigen contraseña por entorno, no imprimen secretos y rechazan `NODE_ENV=production` | Riesgo mitigado; mantener test `tooling/deployment-config.test.ts` | auth |

## P2 — Alta

| ID | Deuda | Módulo |
|----|-------|--------|
| TD-006 | ~~Discrepancia response paginación (meta vs pagination)~~ ✅ RESUELTO en Spec 002 | orders |
| TD-007 | ~~Sin rate limiting individual en forgot-password/reset-password~~ RESUELTO en Spec 003 Slice 2: `passwordRecoveryLimiter` separado de `authLimiter`, wiring probado en `auth-rate-limit.routes.test.ts` | auth |
| TD-008 | ~~Dashboard response envelope no verificado~~ ✅ RESUELTO en Spec 002 T-022b — `sendSuccess(res, summary)` confirmado conforme, test en `dashboard.controller.test.ts` | dashboard |
| TD-009 | Sin política de retención de evidencias | evidence |
| TD-010 | ~~Sin auditoría de descargas de evidencias/documentos~~ RESUELTO en Spec 003 Slice 2 para `FileAsset`: descarga `/api/files/:id/content` usa `FILE_ASSET_DOWNLOADED` y tests de servicio/controlador | evidence, files |
| TD-019 | ~~Inconsistencia de indexación de paginación: módulo `asset` es 0-indexed, el resto de la app es 1-indexed~~ RESUELTO en Spec 003 Slice 1: `ListAssetsQuerySchema` ahora es 1-indexed, snapshot contractual `058-asset-pagination-one-indexed`, tests en `asset-list.schema.test.ts` y `asset.service.test.ts` | asset |
| TD-020 | ~~`template-response.controller.ts::list` llama `listTemplateResponses(req.query)` con un solo argumento y descarta `page`/`limit`~~ RESUELTO en Spec 003 Slice 1: el controlador separa filtros y paginación, test en `template-response.controller.test.ts` | template-response |

## P3 — Media

| ID | Deuda | Módulo |
|----|-------|--------|
| TD-011 | CSP enforced mantiene `'unsafe-inline'`; Spec 003 Slice 2 agrega CSP report-only estricto sin `'unsafe-inline'` como paso de migracion gradual | global |
| TD-012 | Sin CAPTCHA en login/register | auth |
| TD-013 | Sin cobertura de tests en módulos críticos | global |
| TD-014 | Sin CI/CD pipeline automatizado (manual SSH deploy) | devops |
| TD-015 | Backups sin cifrado | devops |

## P4 — Baja

| ID | Deuda | Módulo |
|----|-------|--------|
| TD-016 | Sin MFA | auth |
| TD-017 | Sin control de sesiones concurrentes | auth |
| TD-018 | Permisos de archivos en VPS no auditados | devops |
