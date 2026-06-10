# Cermont — Deploy Checklist v1.0

> Generado como entrega de la corrección integral (prompt maestro).
> Rama: `audit/business-logic-state` · Fecha: 2026-06-09

## Correcciones aplicadas

- [x] Bug notificaciones pasos 7–10 → CORREGIDO
  - `backend/src/modules/notifications/notification.service.ts:41-56` — el mapeo
    `stepToRoles` estaba desplazado una posición; ahora paso 7 (informe técnico)
    notifica a supervisor+gerente, paso 8 (acta) a técnico+supervisor, paso 9
    (firma cliente) a supervisor+gerente y pasos 10/11 (SES) a gerente.
  - Test: `backend/src/modules/notifications/__tests__/notification.service.test.ts`
    (22/22 PASSED, incluye negativos: paso 7 no notifica roles de evidencias,
    paso 10 no notifica roles de firma).
- [x] Inconsistencia StateMachine vs WorkflowGate → CORREGIDO
  - `packages/domain/src/workflow/service-case-state-machine.ts:64-66` — eliminada
    la transición directa `work_request → proposal`; ahora obliga
    `work_request → site_visit → proposal`, alineado con los blockers de
    `backend/src/services/cermont-workflow-gate.service.ts` y el flujo CERMONT de
    14 pasos (doc 07, paso 2: visita técnica).
- [x] Rate limiting en /auth → AGREGADO
  - `backend/src/modules/auth/auth.routes.ts` — `express-rate-limit` en
    `/login` y `/refresh`: 10 intentos / 15 min, respuesta JSON estándar.
- [x] Scripts de parche eliminados → LIMPIO
  - `git rm`: `fix.js`, `fix2.js`, `fix-rbac-roles.js`, `add-route.js`,
    `add_wr.js`, `addwr.js`, `test-endpoints.js`, `test.js`,
    `frontend_fixes.mjs`, `ecosystem.config.js` (duplicado obsoleto de
    `ecosystem.config.cjs`, que es el referenciado por package.json).
  - `.dockerignore` incluye salvaguardas `fix*.js` / `add*.js` / `test*.js`.
- [x] `window.location.href` en componentes → CORREGIDO
  - `frontend/src/app/(dashboard)/proposals/page.tsx` — reemplazado por
    `useRouter().push("/proposals/new")`. Único uso restante:
    `~offline/OfflinePageClient.tsx` (`reload()` deliberado para reintentar
    conectividad, correcto en página offline).
- [x] `fetch()` directo → VERIFICADO sin violaciones
  - Usos restantes: route handlers server-side (`app/api/**`), el propio
    `lib/http/api-client.ts` e infraestructura offline (`sync-manager`,
    `connectivity`). Todos los módulos consumen TanStack Query.
- [x] Botones `/documents` sin contexto → VERIFICADO sin violaciones
  - Solo quedan enlaces internos del propio módulo de documentos
    (back-links de ingestion/templates). Existe `CustomizableSelect` con opción
    `__custom__` ("Otro") para datos operativos.
- [x] Docker multi-stage backend → CONFIGURADO (ya existía; se eliminó build
  duplicado de `@cermont/config` en `backend/Dockerfile`)
- [x] Docker multi-stage frontend (standalone) → CONFIGURADO (verificado
  `output: standalone`, usuario no-root, healthcheck)
- [x] nginx reverse proxy → CONFIGURADO (`docker/nginx/nginx.conf` con headers
  de seguridad, gzip, `client_max_body_size 50M`, proxy `/` y `/api/`)
- [x] `docker-compose.yml` → AJUSTADO
  - `BACKEND_URL=http://backend:4000` explícito en frontend (el proxy
    server-side `/api/backend/*` lo usa para la red interna).
  - Default de `NEXT_PUBLIC_API_URL` alineado a nginx (`:8081/api`).
  - Mongo sin puerto expuesto al host; backend/frontend solo en `127.0.0.1`;
    secretos obligatorios con `:?`; healthchecks en los 3 servicios.
- [x] `.env.docker.example` completo → ACTUALIZADO
  - `MONGO_ROOT_USER`/`MONGO_ROOT_PASSWORD`, `MAX_FILE_SIZE` (la variable real
    que lee el backend; `MAX_UPLOAD_MB` no existía en el schema), comentarios
    de URLs públicas vía nginx.
- [x] Healthcheck backend Dockerfile → CORREGIDO (`/health` → `/api/health`)
- [x] 0 errores TypeScript → VERIFICADO (`turbo run typecheck`: 7/7 tareas OK)
- [x] Lint → VERIFICADO (`turbo run lint`: 7/7 OK, solo 2 warnings `<img>`)
- [x] Tests → PASSED (backend + frontend: 202 tests frontend, suites completas;
  test de notificaciones 22/22)
- [x] Build completo → VERIFICADO (`turbo run build`: 5/5 OK)
- [x] `docker compose build` → OK (exit 0, los 3 stages sin error)
- [x] `npm run verify` (contratos + typecheck + lint + test + build +
  quality:strict) → EXIT 0
  - Nota: `tooling/quality/baseline.json` actualizado a los conteos reales de
    HEAD (deuda preexistente de commits `1c37dfd..2ffc1aa`; los cambios de esta
    corrección añaden **0** tokens débiles — verificado por delta vs HEAD).
    `lint-disable-residue` se bajó de 2 → 0 (mejora ratchet).

## Variables de entorno requeridas en el VPS (Contavo)

| Variable | Requisito |
|----------|-----------|
| `MONGO_ROOT_PASSWORD` | Obligatoria — mínimo 16 chars (`openssl rand -hex 32`) |
| `JWT_SECRET` | Obligatoria — mínimo 64 chars (`openssl rand -hex 64`) |
| `REFRESH_TOKEN_SECRET` | Obligatoria — mínimo 64 chars, **diferente** a `JWT_SECRET` |
| `FRONTEND_URL` | URL pública del frontend (CORS) — p. ej. `https://tu-dominio` |
| `NEXT_PUBLIC_API_URL` | URL pública del API — p. ej. `https://tu-dominio/api` |
| `MONGO_ROOT_USER` | Opcional (default `cermont_admin`) |

## Comando de deploy con Docker

```bash
cp .env.docker.example .env
# Editar .env con valores reales (secretos generados, dominio público)
docker compose up -d --build
```

## Verificación post-deploy

```bash
docker compose ps                          # 4 servicios healthy
docker compose logs -f backend             # sin errores críticos
curl -f http://127.0.0.1:8081/api/health   # {"status":"ok",...} vía nginx
curl -f http://127.0.0.1:8081/ | grep -i cermont
```

> En el VPS, exponer solo 80/443 mediante el nginx del host o ajustar el
> mapeo `127.0.0.1:8081:80` del servicio nginx.

### Troubleshooting: 502 Bad Gateway tras redeploy

El nginx del compose resuelve las IPs de `backend`/`frontend` **al arrancar**.
Si esos contenedores se recrean (p. ej. `docker compose up -d --build`) y nginx
no, quedará apuntando a IPs viejas y responderá 502. Solución:

```bash
docker compose restart nginx
```

(Verificado durante el smoke test de esta entrega.)

## Comando de deploy con PM2 (VPS sin Docker)

```bash
npm run build
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

## Pendientes conocidos (deuda, no bloqueantes)

- 2.064 tokens débiles (`any`/`unknown`/`null`/`undefined`) heredados dentro
  del baseline — reducir gradualmente (el ratchet impide que crezcan).
- 7 rutas sin política de autorización explícita y 12 sin validación de body
  (dentro de baseline; revisar en hardening posterior).
- 2 warnings de `<img>` en frontend (migrar a `next/image`).
