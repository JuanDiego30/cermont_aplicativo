# PROMPT MAESTRO — Spec Kit 005: Hotfix post-deploy, estabilización productiva e implementación real CERMONT

Actúa como un **Principal Full Stack Debugger + Release Engineer + SRE + Security Engineer + UX Engineer + Product Architect** experto en GitHub Spec Kit, Next.js 16, React 19, Express 5.2.1, MongoDB/Mongoose, Zod, TanStack Query, PWA/Serwist, Nginx/HTTPS, cookies HttpOnly, CORS, RBAC, Radix UI, WebAuthn/passkeys, FSM/CMMS/GMAO y debugging de producción.

Este prompt es para **corregir errores reales del deploy y retomar implementaciones pendientes**, no para crear más documentación vacía.

## 0. Errores reales reportados en producción

La app desplegada en `https://cermontsas.shop` presenta:

```txt
/favicon.png → 404
/icons/logo-cermont.png → 404
/icons/icon-512.png → 404
/icons/maskable-icon-192.png → 404
/icons/icon-192.png → 404
/icons/maskable-icon-512.png → 404

login / reports/analytics:
Uncaught (in promise) Error:
A listener indicated an asynchronous response by returning true,
but the message channel closed before a response was received

GET /api/backend/analytics/notifications?limit=20 → 401 Unauthorized
GET /api/backend/users/6a32adb0ffecdac02881d6db → 500 Internal Server Error

Radix UI:
DialogContent requires a DialogTitle.

POST /api/backend/work-requests → 400 Bad Request
POST /api/backend/documents → 400 Bad Request
```

Además:
- existe un sistema de huella/biometría en login que no funciona correctamente en celulares;
- varias funcionalidades planificadas no están implementadas;
- fotos de vehículos, fotos/PDF de herramientas, evidencias FSM, cámara, checklists, dashboard/KPIs y documentos siguen incompletos;
- los prompts/specs previos crearon planes, pero no se ve implementación real.

## 1. Objetivo principal

Crear y ejecutar:

```txt
specs/005-post-deploy-hotfix-and-real-implementation/
```

para:

1. reproducir y clasificar errores de producción;
2. corregir assets 404, manifest y PWA;
3. corregir 401, 500 y 400 con causa raíz;
4. corregir accesibilidad Radix Dialog;
5. auditar y corregir error async listener;
6. implementar biometría móvil correctamente mediante WebAuthn/passkeys o dejar bloqueo técnico real;
7. retomar implementaciones pendientes de vehículos, herramientas, evidencias, documentos, checklists y dashboard;
8. agregar pruebas de regresión;
9. redeployar con smoke tests y reporte final.

## 2. Reglas anti-alucinación

1. No inventes archivos, rutas, módulos ni endpoints.
2. Antes de modificar, busca y abre el archivo real.
3. No digas “implementado” sin código, test y comando ejecutado.
4. No cierres una tarea solo con documentación.
5. No elimines seguridad para hacer funcionar algo.
6. No introduzcas `any`.
7. No rompas Zod/shared-types, RBAC ni API envelope.
8. No dejes mocks productivos.
9. No ocultes errores 400/401/500.
10. No afirmes que un error viene de extensión del navegador sin reproducir en incógnito/sin extensiones.
11. No prometas huella digital directa: en web debe ser WebAuthn/passkeys con fallback.
12. No despliegues sin rollback y smoke tests.
13. No agregues funcionalidades nuevas antes de corregir P0 de producción.

## 3. Fuentes que debes leer primero

Lee y resume brevemente:

```txt
REGLAS_DESARROLLO_CERMONT.md
DESIGN.md
.specify/memory/constitution.md
specs/001-auditoria-integral-cermont/
specs/002-correcciones-post-auditoria-cermont/
specs/003-profesionalizacion-cermont/
specs/004-deploy-seguro-cermont/
PROMPT_AUDITORIA_SPEC_KIT_CERMONT.md
PROMPT_IMPLEMENTACION_SPEC_KIT_POST_AUDITORIA_CERMONT.md
PROMPT_SPEC_003_PROFESIONALIZACION_CERMONT.md
PROMPT_SPEC_003_IMPLEMENTACION_REAL_CERMONT.md
PROMPT_IMPLEMENTACION_MODULOS_PROFESIONALES_CERMONT.md
PROMPT_FOTOS_CAMARA_DOCUMENTOS_CERMONT.md
PROMPT_MEJORA_KPIS_E_IMPLEMENTACION_DESIGN.md
PROMPT_SPEC_004_DEPLOY_SEGURO_CERMONT.md
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
docs/API_STATUS.md
docs/DEVELOPMENT_STATUS.md
docs/deployment/PRODUCTION_DEPLOYMENT_REPORT.md
docs/deployment/SSL_HTTPS_AUDIT.md
docs/security/SECURITY_AUDIT.md
```

Si un archivo no existe, dilo. No lo inventes.

## 4. Crear Spec Kit 005

Si Spec Kit CLI existe:

```txt
/speckit.specify
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.implement
```

Si no existe, crear manualmente:

```txt
specs/005-post-deploy-hotfix-and-real-implementation/
  spec.md
  plan.md
  tasks.md
  bug-reproduction.md
  production-error-matrix.md
  api-contract-fix-plan.md
  pwa-assets-fix-plan.md
  auth-session-fix-plan.md
  webauthn-mobile-biometric-plan.md
  accessibility-fix-plan.md
  functional-implementation-plan.md
  regression-test-plan.md
  post-fix-deploy-runbook.md
  post-fix-report.md
  contracts/
    static-assets-contract.md
    auth-session-contract.md
    notifications-contract.md
    work-request-create-contract.md
    document-create-contract.md
    user-detail-contract.md
    webauthn-passkey-contract.md
```

# PLAN DE IMPLEMENTACIÓN

## FASE 0 — Baseline, reproducción y matriz de errores

### Acciones

```bash
git checkout -b fix/spec-005-post-deploy-hotfix
git status --short
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

Reproducir en producción:

```bash
curl -I https://cermontsas.shop/favicon.png
curl -I https://cermontsas.shop/icons/logo-cermont.png
curl -I https://cermontsas.shop/icons/icon-192.png
curl -I https://cermontsas.shop/icons/icon-512.png
curl -I https://cermontsas.shop/icons/maskable-icon-192.png
curl -I https://cermontsas.shop/icons/maskable-icon-512.png
curl -I https://cermontsas.shop/manifest.webmanifest
curl -I https://cermontsas.shop/login
curl -I https://cermontsas.shop/reports/analytics
curl -fsS https://cermontsas.shop/api/health
curl -I https://cermontsas.shop/api/backend/analytics/notifications?limit=20
```

Revisar logs:

```bash
docker compose logs --tail=300 backend
docker compose logs --tail=300 frontend
docker compose logs --tail=300 nginx
```

o:

```bash
pm2 logs cermont-backend --lines 300
pm2 logs cermont-frontend --lines 300
```

Crear:

```txt
specs/005-post-deploy-hotfix-and-real-implementation/production-error-matrix.md
```

Tabla:

| Error | Ruta | Severidad | Reproducible | Causa raíz | Evidencia | Fix | Test | Estado |
|---|---|---|---|---|---|---|---|---|

No avanzar sin clasificar todos los errores.

## FASE 1 — Corregir assets 404, manifest y PWA

Buscar:

```txt
frontend/public/
frontend/src/app/manifest.ts
frontend/public/manifest.webmanifest
frontend/src/app/icon.*
frontend/src/app/favicon.*
frontend/next.config.*
frontend/serwist*
```

Corregir o crear:

```txt
/frontend/public/favicon.png
/frontend/public/icons/logo-cermont.png
/frontend/public/icons/icon-192.png
/frontend/public/icons/icon-512.png
/frontend/public/icons/maskable-icon-192.png
/frontend/public/icons/maskable-icon-512.png
```

Acciones:

1. Confirmar si existen assets reales del logo CERMONT.
2. Si no existen, crear placeholders temporales correctos y documentar reemplazo por asset oficial.
3. Corregir manifest para que apunte a rutas públicas válidas.
4. Corregir metadata de Next.js.
5. Corregir Serwist/precache para no cachear rutas inexistentes.
6. Crear script:

```txt
scripts/check-static-assets.mjs
```

Debe fallar si algún asset requerido no existe.

Tests:

```bash
node scripts/check-static-assets.mjs
npm run build
```

Aceptación:
- todos los iconos devuelven 200;
- manifest no referencia rutas 404;
- PWA no falla por iconos.

## FASE 2 — Diagnosticar y corregir async listener error

No asumir que es extensión.

Acciones:

```bash
grep -R "return true" frontend/src frontend/public -n
grep -R "addEventListener.*message" frontend/src frontend/public -n
grep -R "chrome.runtime" frontend/src frontend/public -n
grep -R "postMessage" frontend/src frontend/public -n
grep -R "navigator.credentials" frontend/src -n
grep -R "serviceWorker" frontend/src frontend/public -n
```

Reproducir:
- modo incógnito sin extensiones;
- Chrome/Edge/Firefox;
- desactivar temporalmente service worker solo en entorno local para aislar.

Si es extensión:
- documentar como no-app con evidencia.

Si es app:
- corregir promesas sin catch;
- corregir `event.waitUntil`;
- revisar Serwist;
- revisar WebAuthn;
- agregar manejo de `AbortError`, `NotAllowedError`, `NotSupportedError`.

Aceptación:
- causa clasificada;
- si es app, corregida;
- no hay promesas sin manejo.

## FASE 3 — Corregir 401 en notifications

Error:

```txt
GET /api/backend/analytics/notifications?limit=20 → 401
```

Buscar:

```txt
frontend/src/modules/notifications/
frontend/src/modules/analytics/
frontend/src/lib/api-client*
frontend/src/app/(dashboard)/
backend/src/modules/notifications/
backend/src/modules/analytics/
backend/src/index.ts
nginx.conf
```

Acciones:

1. Revisar baseURL y ruta `/api/backend`.
2. Confirmar si endpoint real es `/api/notifications`, `/api/analytics/notifications` o `/api/backend/analytics/notifications`.
3. Revisar cookies:
   - `credentials: "include"`;
   - domain;
   - SameSite;
   - Secure;
   - path.
4. Revisar Nginx forwarding de cookies y headers.
5. Revisar hook:
   - no llamar notifications antes de tener sesión;
   - usar `enabled: Boolean(user/session)`;
   - manejar 401 sin spam.
6. Si el rol no tiene permiso, ajustar RBAC o UI.

Tests:
- no llamar endpoint sin sesión en login;
- con sesión válida responde 200;
- sin permiso muestra forbidden state.

Aceptación:
- no hay 401 repetitivo en login;
- notificaciones funcionan autenticado;
- UI no se rompe.

## FASE 4 — Corregir 500 en user detail

Error:

```txt
GET /api/backend/users/6a32adb0ffecdac02881d6db → 500
```

Acciones:

1. Revisar `users` params schema.
2. Validar ObjectId/ID antes del controller.
3. Si ID inválido → 400 `INVALID_USER_ID`.
4. Si no existe → 404 `USER_NOT_FOUND`.
5. Nunca devolver 500 por ID inválido/no encontrado.
6. Corregir frontend para no llamar con id vacío/inválido.

Tests:
- id inválido → 400;
- id inexistente → 404;
- id existente → 200.

## FASE 5 — Corregir 400 en work-requests

Error:

```txt
POST /api/backend/work-requests → 400
```

Acciones:

1. Revisar `createWorkRequestSchema`.
2. Capturar payload real del frontend.
3. Comparar campo por campo:
   - nombres;
   - enums;
   - fechas;
   - cliente;
   - prioridad;
   - descripción;
   - archivos si aplica.
4. Corregir default values y transform del formulario.
5. Backend debe devolver errores Zod legibles.
6. UI debe mostrar campo exacto que falla.

Tests:
- POST válido → 201/200;
- payload inválido → 400 con error tipado;
- E2E crear solicitud.

## FASE 6 — Corregir 400 en documents

Error:

```txt
POST /api/backend/documents → 400
```

Diagnóstico probable:
- frontend envía JSON y backend espera multipart;
- nombre del campo de archivo incorrecto;
- falta `ownerType/ownerId`;
- MIME/categoría inválida;
- endpoint incorrecto.

Acciones:

1. Revisar contrato de documentos.
2. Confirmar si endpoint espera `multipart/form-data`.
3. Revisar FormData:
   - `file`;
   - `ownerType`;
   - `ownerId`;
   - `category`;
   - `description`;
   - metadata.
4. Corregir frontend service y backend route.
5. Agregar mensajes claros.

Tests:
- subir PDF válido;
- subir imagen válida;
- MIME inválido;
- missing owner;
- permiso denegado.

## FASE 7 — Corregir Radix DialogTitle

Buscar:

```bash
grep -R "DialogContent" frontend/src -n
grep -R "@radix-ui/react-dialog" frontend/src -n
```

Cada `DialogContent` debe incluir `DialogTitle` visible o con `VisuallyHidden`.

Ejemplo:

```tsx
<DialogContent>
  <DialogTitle>Crear solicitud</DialogTitle>
  ...
</DialogContent>
```

o:

```tsx
<DialogContent>
  <VisuallyHidden>
    <DialogTitle>Menú de acciones</DialogTitle>
  </VisuallyHidden>
  ...
</DialogContent>
```

Aceptación:
- warning eliminado;
- modales accesibles.

## FASE 8 — Implementar huella/biometría móvil con WebAuthn/passkeys

La web no lee huella directamente. Debe usar WebAuthn/passkeys.

Buscar:

```bash
grep -R "fingerprint" frontend/src backend/src packages -n
grep -R "biometric" frontend/src backend/src packages -n
grep -R "webauthn" frontend/src backend/src packages -n
grep -R "navigator.credentials" frontend/src -n
```

Crear o corregir contrato:

```txt
packages/shared-types/src/schemas/webauthn.schema.ts
```

Endpoints:

```txt
POST /api/auth/webauthn/register/options
POST /api/auth/webauthn/register/verify
POST /api/auth/webauthn/login/options
POST /api/auth/webauthn/login/verify
GET  /api/auth/webauthn/devices
DELETE /api/auth/webauthn/devices/:id
```

Requisitos:
- HTTPS;
- RP ID `cermontsas.shop`;
- origin `https://cermontsas.shop`;
- challenge temporal;
- credentialId seguro;
- counter;
- revocación de dispositivo.

Frontend:
- botón “Activar acceso biométrico” en perfil;
- botón “Ingresar con huella/passkey” en login;
- detectar soporte:
  ```ts
  PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  ```
- fallback a login normal;
- mensajes claros en Android/iOS/desktop.

Si no se puede instalar dependencia aún, dejar bloqueado con razón técnica y task, no fingir implementación.

## FASE 9 — Retomar funcionalidades no implementadas

Después de P0/P1, implementar mínimo dos slices completos:

### 9.1 Vehículos/flota
- fotos;
- documentos PDF;
- vencimientos;
- readiness score;
- alertas;
- galería;
- checklist documentos;
- estado ready/incomplete/expired/blocked.

### 9.2 Herramientas
- fotos;
- PDF/manual/ficha/certificado;
- calibración;
- checklist;
- historial asignación;
- bloqueo por vencimiento.

### 9.3 Evidencias
- cámara;
- galería;
- ownerType/ownerId;
- fase before/during/after;
- aprobación/rechazo;
- bloqueo si usada en informe;
- auditoría descarga.

### 9.4 Dashboard/KPIs
- KPIs accionables;
- documentos vencidos;
- evidencias pendientes;
- herramientas bloqueadas;
- vehículos incompletos;
- UI según DESIGN.md.

### 9.5 Checklists
- plantillas;
- ítems obligatorios;
- ítems bloqueantes;
- comentario/foto requerida;
- integración con herramientas/vehículos/órdenes.

Regla:
Cada slice debe tener:

```txt
Zod → model/service/controller/route → frontend service/hook/UI → tests → docs
```

## FASE 10 — Regresión, smoke tests y redeploy

Ejecutar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

Smoke tests producción:

1. abrir login;
2. no aparecen 404 de assets;
3. login normal;
4. sesión persiste;
5. notifications sin 401 spam;
6. user detail sin 500;
7. crear work request;
8. subir documento;
9. modal sin warning DialogTitle;
10. passkey o fallback biométrico;
11. dashboard;
12. logout.

Crear:

```txt
docs/deployment/POST_DEPLOY_HOTFIX_REPORT.md
specs/005-post-deploy-hotfix-and-real-implementation/post-fix-report.md
```

# TASKS SPEC KIT 005

Si Spec 004 terminó en T152, continuar:

```md
# Tasks — Spec 005 Post Deploy Hotfix + Implementación Real

## P0 — Reproducción y assets
- [ ] T153 Crear spec 005.
- [ ] T154 Crear matriz de errores de producción.
- [ ] T155 Reproducir errores con curl/logs/browser.
- [ ] T156 Corregir favicon 404.
- [ ] T157 Corregir iconos PWA.
- [ ] T158 Corregir logo CERMONT 404.
- [ ] T159 Corregir manifest/PWA/precache.
- [ ] T160 Crear script check-static-assets.

## P0 — Auth/API
- [ ] T161 Diagnosticar async listener error.
- [ ] T162 Corregir 401 notifications.
- [ ] T163 Corregir 500 users detail.
- [ ] T164 Corregir 400 work-requests.
- [ ] T165 Corregir 400 documents.
- [ ] T166 Agregar tests de regresión API.

## P1 — Accesibilidad y login móvil
- [ ] T167 Corregir DialogContent sin DialogTitle.
- [ ] T168 Auditar sistema de huella existente.
- [ ] T169 Diseñar contrato WebAuthn/passkeys.
- [ ] T170 Implementar endpoints WebAuthn o dejar bloqueo técnico real.
- [ ] T171 Implementar UI passkey/fallback móvil.
- [ ] T172 Agregar tests/fallback biométrico.

## P1 — Funcionalidad pendiente real
- [ ] T173 Implementar vehículos con fotos/documentos/readiness.
- [ ] T174 Implementar herramientas con fotos/PDF/checklists.
- [ ] T175 Implementar evidencias FSM/cámara/aprobación.
- [ ] T176 Implementar dashboard KPIs accionables.
- [ ] T177 Implementar checklists bloqueantes.

## P2 — Validación y deploy
- [ ] T178 Ejecutar typecheck/lint/tests/build/contracts/verify.
- [ ] T179 Ejecutar smoke tests.
- [ ] T180 Redeploy con rollback.
- [ ] T181 Crear post-fix report.
- [ ] T182 Actualizar DEVELOPMENT_STATUS/API_STATUS/KNOWN_ISSUES.
```

# FORMATO DE RESPUESTA OBLIGATORIO

Al terminar cada fase:

```txt
# Fase X — Resultado

## Archivos revisados
## Causa raíz encontrada
## Archivos modificados
## Cambios implementados
## Tests agregados
## Comandos ejecutados
## Resultado
## Errores pendientes
## Siguiente fase
```

# DEFINITION OF DONE

La spec 005 solo queda cerrada si:

1. favicon e iconos ya no devuelven 404;
2. manifest/PWA no referencia assets inexistentes;
3. async listener error está corregido o clasificado con evidencia;
4. notifications no generan 401 spam;
5. users detail no devuelve 500 por ID inválido/no encontrado;
6. work-requests create funciona o muestra validación clara;
7. documents upload funciona o muestra validación clara;
8. todos los DialogContent tienen DialogTitle;
9. biometría móvil/WebAuthn tiene implementación real o bloqueo técnico verificable;
10. mínimo dos mejoras funcionales pendientes se implementaron en código real;
11. tests de regresión existen;
12. build pasa;
13. contracts guard pasa;
14. verify pasa;
15. smoke tests pasan;
16. deploy/hotfix documentado;
17. no se introdujo `any`;
18. no se rompió RBAC;
19. no se ocultaron errores;
20. documentación viva actualizada.

Empieza por FASE 0. No implementes funcionalidades nuevas hasta corregir P0 de producción.
