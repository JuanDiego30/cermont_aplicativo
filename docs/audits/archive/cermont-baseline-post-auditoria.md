# Auditoría Post-Auditoría — Baseline Reproducible

**Fecha:** 2026-05-23  
**Repositorio:** `cermont_aplicativo`  
**Rama observada:** `feature/document-driven-platform`  
**Estado inicial del worktree:** extremadamente sucio (`git diff --stat` reporta ~206 archivos modificados; no se asumió que esos cambios fueran seguros para desplegar)

## 1. Preflight ejecutado

### Evidencia base

- `git status --short`
- `git diff --stat`
- `git diff`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test`
- `npm run dev`

### Scripts detectados

```text
Scripts disponibles:
- npm run dev: turbo run dev
- npm run verify: npm run typecheck && npm run lint && npm run build
- npm run test: turbo run test
- npm run seed: npm run db:seed
- npm run docker: npm run db:dev

Infraestructura detectada:
- Mongo local: sí
- Docker compose: sí
- Puerto backend: 4000
- Puerto frontend: 3000
- MONGODB_URI esperado: mongodb://127.0.0.1:27017/cermont_app
- Healthcheck disponible: sí (/health)
```

## 2. Archivos y configuración revisados

- `package.json`
- `turbo.json`
- `backend/package.json`
- `frontend/package.json`
- `packages/*/package.json`
- `.env.example`
- `.env.docker.example`
- `backend/.env.example`
- `frontend/.env.example`
- `frontend/.env.local.example`
- `docker-compose.yml`
- `docker-compose.dev.yml`
- `backend/src/scripts/seed.ts`
- documentación canónica en `docs/README.md`, `docs/product`, `docs/domain`, `docs/architecture`, `docs/agents`, `docs/plans`

## 3. Resultado del baseline técnico

### Gates

| Gate | Resultado | Observación |
|---|---|---|
| `npm run typecheck` | PASS | sin errores |
| `npm run lint` | PASS con warnings | persisten 26 warnings |
| `npm run test` | PASS | backend, frontend y shared-types en verde |
| `npm run build` | PASS | build de Next/Express correcto |
| `npm run verify` | pendiente de rerun en esta iteración | el script no ejecuta tests |
| `npx react-doctor@latest` | no rerun en esta iteración | auditoría anterior: 84/100 con deuda de código muerto |

### Warnings activos detectados

- `backend/src/services/kit.service.ts`
- `backend/src/services/tool.service.ts`

Tipo de warning dominante:

- uso de `any`
- payloads demasiado flexibles
- deuda de normalización de contratos

Clasificación:

- `P0`: no se detectó warning de lint que por sí solo implique corrupción inmediata de datos
- `P1`: warnings de tipado flexible en servicios de negocio
- `P2`: deuda de mantenibilidad fuera del flujo CERMONT principal

## 4. Dev mode reproducible

### Resultado real

- Mongo local respondió en `127.0.0.1:27017`
- `backend` levantó en `http://127.0.0.1:4000`
- `frontend` levantó en `http://127.0.0.1:3000`
- `GET /health` respondió `ok`

### Hallazgo de infraestructura

- El repositorio sí trae `docker-compose.yml` y `docker-compose.dev.yml`.
- `npm run db:dev` depende del daemon Docker; en esta máquina el daemon no estaba disponible, por lo que el camino reproducible real quedó siendo Mongo local.

## 5. Hallazgos críticos confirmados antes de corregir

### P0

1. `GET /api/service-cases/:id/workflow` no devuelve la vista canónica del cockpit; el controller llama `getServiceCaseById()` en lugar de `buildServiceCaseWorkflowView()`.
2. El frontend tipa `/service-cases/:id/workflow` como `ServiceCase`, no como `ServiceCaseWorkflowViewModel`.
3. El selector “Seleccionar existente” en documentos no asocia nada al caso/paso; solo rellena el título.
4. El backend de documentos no expone `/api/documents/:id/associate` ni `/api/documents/:id/associations`.
5. Se permite registrar pago para una factura en estado `draft`.
6. La ruta `/service-cases` existe en navegación, pero no tiene página y responde `404`.

### P1

1. `DocumentListQuerySchema` rechaza parámetros de paginación usados por el frontend (`limit`).
2. La lista de `service-cases` usa envelope inconsistente en frontend (`meta`) frente al backend (`pagination`).
3. El seed oficial no reproduce escenarios CERMONT; solo crea usuarios y requiere `SEED_DEFAULT_PASSWORD`.
4. Persisten stores `Map`/in-memory en módulos documentales secundarios (`document-import`, `document-template`, `kit-document`, `resource-document`).
5. La trazabilidad de costos del cockpit sigue llena de ceros por defecto en el backend.

## 6. Veredicto del baseline

**Estado actual antes de corregir:** `PARCIAL`

La plataforma puede levantar y pasar gates técnicos principales, pero todavía no demuestra:

- cockpit 14 pasos alineado con su contrato canónico;
- reutilización documental real;
- cierre administrativo protegido hasta pago válido;
- seed funcional reproducible para escenarios CERMONT;
- costos reales centralizados sin placeholders.
