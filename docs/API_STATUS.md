# API Status — CERMONT S.A.S.

**Fecha:** 2026-06-26

---

## Endpoints Totales

| Tipo | Cantidad |
|------|----------|
| API_MOUNTS | 65 |
| Route definitions (est.) | 389+ |
| Módulos backend | 53 |
| Módulos frontend consumiendo API | 41 |

## Health Endpoints

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/api/health` | GET, HEAD | Readiness (alias legacy) |
| `/api/health/live` | GET, HEAD | Liveness |
| `/api/health/ready` | GET, HEAD | Readiness (MongoDB check) |
| `/health` | GET, HEAD | Alias sin prefijo (Docker) |
| `/health/live` | GET, HEAD | Alias liveness |
| `/health/ready` | GET, HEAD | Alias readiness |

## API Documentation

| Endpoint | Descripción |
|----------|-------------|
| `/api/docs` | HTML generado desde API_MOUNTS |
| `/api/docs/openapi.json` | OpenAPI spec generada |

## Privacy Endpoints

| Endpoint | Metodo | Proposito |
|----------|--------|-----------|
| `/api/privacy/consents/me` | GET | Lista consentimientos del usuario autenticado |
| `/api/privacy/consents` | POST | Crea consentimiento versionado |
| `/api/privacy/consents/:id/revoke` | POST | Revoca consentimiento propio |
| `/api/privacy/requests/me` | GET | Lista solicitudes de derechos del titular del usuario autenticado |
| `/api/privacy/requests` | POST | Crea solicitud de acceso/correccion/supresion/revocatoria/copia/reclamo/incidente |
| `/api/privacy/requests` | GET | Lista solicitudes para administradores |
| `/api/privacy/requests/:id/status` | PATCH | Actualiza estado/respuesta de solicitud para administradores |

## Professional Module Profile Endpoints

| Endpoint | Metodo | Proposito |
|----------|--------|-----------|
| `/api/fleet/:id/profile` | GET | Perfil profesional de vehiculo con readiness, documentos, fotos requeridas y soporte FileAsset |
| `/api/assets/:id/profile` | GET | Perfil profesional de activo/herramienta con availability, documentos, fotos requeridas y soporte FileAsset |

## Estado de Consumo

- ✅ Todos los endpoints auditados tienen backend correspondiente
- ✅ Métodos HTTP coinciden
- ✅ Response envelope de paginación unificado: `meta` en backend y frontend (Spec 002, migración 057)
- ✅ Flota y activos tienen perfiles contract-first con Zod, backend, frontend y tests enfocados (migración 063)
- ⚠️ API_ENDPOINT_MATRIX.md documenta 100 endpoints, la realidad es 389+
