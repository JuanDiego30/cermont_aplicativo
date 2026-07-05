# PROMPT MAESTRO — Spec Kit 004: Deploy seguro, profesional y verificable de CERMONT

Actúa como un Principal DevOps Engineer, Staff Full Stack Engineer, Security Engineer, Release Manager y SRE, experto en GitHub Spec Kit, Next.js 16, React 19, Express 5.2.1, MongoDB, npm workspaces, Docker, Nginx, Certbot, SSL/TLS, GitHub Actions, backups, rollback, health checks y observabilidad.

Este prompt debe usarse para llevar el aplicativo web CERMONT S.A.S. a producción de forma segura, profesional y verificable.

No prometas “cero errores absolutos”. La meta real es: cero errores conocidos antes del deploy, gates de calidad en verde, rollback preparado, observabilidad activa y evidencia verificable de que la app funciona en producción.

---

## 0. Contexto del proyecto

El aplicativo CERMONT es una plataforma web modular para órdenes de trabajo, trazabilidad operativa, planeación, recursos, herramientas, vehículos, evidencias, documentos, checklists, informes, actas, SES, facturación, pagos, dashboard/KPIs, PWA/offline, RBAC y auditoría.

Stack esperado:

- Monorepo npm workspaces.
- Frontend: Next.js 16 + React 19 + Turbopack.
- Backend: Express 5.2.1.
- DB: MongoDB + Mongoose.
- Validación: Zod 4.x.
- Auth: JWT + httpOnly cookies.
- API: apiClient único.
- Server state: TanStack Query.
- Seguridad: proxy.ts, backend RBAC, Helmet, CORS, rate limits.
- PWA: Serwist.
- Deploy objetivo: VPS Linux con dominio `cermontsas.shop` o dominio definido por el usuario.

---

## 1. Objetivo principal

Crear y ejecutar una nueva especificación:

```txt
specs/004-deploy-seguro-cermont/
```

para preparar, validar, desplegar y monitorear la app CERMONT en producción con un proceso seguro y profesional.

El resultado debe incluir:

1. auditoría pre-deploy;
2. spec, plan y tasks;
3. checklist de producción;
4. validación de variables de entorno;
5. verificación de secretos;
6. build reproducible;
7. respaldo de base de datos;
8. migraciones/seed controlados;
9. despliegue frontend/backend;
10. configuración HTTPS;
11. configuración reverse proxy;
12. cookies seguras;
13. CORS productivo;
14. health checks;
15. smoke tests;
16. pruebas E2E post-deploy;
17. monitoreo;
18. rollback;
19. documentación de operación;
20. reporte final con evidencia.

---

## 2. Reglas obligatorias

1. No hacer deploy si typecheck, lint, test, build, contracts:check o verify fallan.
2. No hacer deploy si faltan variables críticas de entorno.
3. No hacer deploy si hay secretos hardcodeados en el repo.
4. No hacer deploy si NEXT_PUBLIC_API_URL, FRONTEND_URL, BACKEND_URL o CORS apuntan incorrectamente a localhost en producción.
5. No hacer deploy si cookies de auth no son HttpOnly, Secure y SameSite correctamente configuradas en producción.
6. No hacer deploy si el dominio no resuelve al servidor.
7. No hacer deploy sin backup previo de MongoDB.
8. No hacer deploy sin rollback documentado.
9. No hacer deploy sin health checks.
10. No hacer deploy si HTTP no redirige a HTTPS.
11. No afirmar que SSL está correcto sin ejecutar curl, openssl o revisión equivalente.
12. No afirmar que la app funciona si no se hicieron smoke tests reales.
13. No ejecutar seeds destructivos en producción.
14. No sobrescribir .env.production sin respaldo.
15. No exponer .env, logs con tokens, claves JWT, contraseñas, URIs de DB o cookies.
16. No ignorar errores del build.
17. No dejar procesos corriendo manualmente sin service manager.
18. No cerrar la tarea sin reporte de comandos ejecutados y resultados.

---

## 3. Fuentes de verdad del proyecto

Antes de modificar o desplegar, leer:

```txt
REGLAS_DESARROLLO_CERMONT.md
.specify/memory/constitution.md
specs/001-auditoria-integral-cermont/
specs/002-correcciones-post-auditoria-cermont/
specs/003-profesionalizacion-cermont/
docs/DEVELOPMENT_STATUS.md
docs/API_STATUS.md
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
docs/deployment/SSL_HTTPS_AUDIT.md
docs/deployment/PRODUCTION_DEPLOYMENT_CHECKLIST.md
docs/security/SECURITY_AUDIT.md
docs/security/OWASP_ASVS_BACKLOG.md
README.md
package.json
docker-compose.yml
Dockerfile
frontend/next.config.*
backend/src/index.ts
backend/src/config/env.ts
frontend/.env.example
backend/.env.example
.env.example
```

Si un archivo no existe, documentarlo. No inventarlo.

---

## 4. GitHub Spec Kit

### 4.1 Si Spec Kit CLI existe

Usar flujo:

```txt
/speckit.constitution
/speckit.specify
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.checklist
/speckit.analyze
/speckit.implement
```

### 4.2 Si Spec Kit CLI no existe

Crear manualmente:

```txt
specs/004-deploy-seguro-cermont/
  spec.md
  plan.md
  tasks.md
  checklist.md
  deployment-runbook.md
  rollback-plan.md
  smoke-test-plan.md
  production-env-matrix.md
  ssl-https-verification.md
  security-release-gate.md
  post-deploy-report.md
  contracts/
    production-env-contract.md
    health-check-contract.md
    release-gate-contract.md
    rollback-contract.md
```

---

## 5. Enmienda a la constitución

Actualizar:

```txt
.specify/memory/constitution.md
```

Agregar:

```md
# Enmienda v1.3 — Deploy seguro y operación en producción

29. Production Readiness Gate — ningún deploy productivo se permite sin typecheck, lint, tests, build, contracts guard, verify, backup y rollback.
30. Secrets Safety — ninguna credencial, token, URI sensible, cookie secret o JWT secret puede quedar en el repositorio ni en logs.
31. HTTPS Only Production — producción debe operar únicamente por HTTPS con redirección HTTP a HTTPS.
32. Deployment Evidence — toda afirmación de deploy debe incluir comando, salida, timestamp y resultado.
33. Rollback First — todo release debe tener plan de rollback probado o al menos documentado antes de aplicar cambios.
34. Observability Required — toda versión desplegada debe tener health check, logs, monitoreo mínimo y procedimiento de incidentes.
35. No Localhost in Production — ninguna variable pública o privada productiva puede depender de localhost, 127.0.0.1 o dominios dev salvo comunicación interna Docker explícitamente documentada.
36. Zero Known Critical Errors — no se despliega con errores críticos conocidos de build, auth, DB, CORS, cookies, SSL, API o permisos.
```

---

# PLAN DE IMPLEMENTACIÓN

Trabaja por fases. No saltar fases. Cada fase debe actualizar `specs/004-deploy-seguro-cermont/deployment-runbook.md`.

---

## FASE 0 — Preparación de rama y baseline

### Objetivo
Congelar estado inicial y evitar confundir WIP con errores del deploy.

### Acciones

```bash
git status --short
git branch --show-current
git checkout -b release/production-deploy-cermont
```

Si la rama ya existe, usarla o crear una con timestamp.

Ejecutar:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

Si `npm ci` no aplica porque el proyecto usa `npm install`, documentarlo y usar el comando correcto.

### Documentar

Crear/actualizar:

```txt
specs/004-deploy-seguro-cermont/deployment-runbook.md
docs/deployment/DEPLOYMENT_BASELINE.md
```

Debe incluir:

| Comando | Resultado | Observación |
|---|---|---|

### Criterio de salida

- baseline ejecutada;
- errores conocidos documentados;
- no se avanza si falla gate crítico.

---

## FASE 1 — Auditoría de configuración productiva

### Objetivo
Validar que producción no use configuración de desarrollo.

### Revisar variables

Buscar en:

```txt
.env
.env.local
.env.production
.env.example
frontend/.env.production
backend/.env.production
docker-compose.yml
Dockerfile
frontend/next.config.*
backend/src/config/env.ts
backend/src/index.ts
```

### Variables mínimas

Documentar sin imprimir secretos:

```txt
NODE_ENV=production
FRONTEND_URL=https://cermontsas.shop
BACKEND_URL=https://api.cermontsas.shop o https://cermontsas.shop/api
NEXT_PUBLIC_API_URL=https://cermontsas.shop/api o ruta proxy correcta
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
COOKIE_DOMAIN=
CORS_ORIGIN=
UPLOAD_DIR=
MAX_UPLOAD_SIZE=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

Estado permitido:

```txt
present / missing / unsafe / dev-value / needs-rotation
```

Crear:

```txt
specs/004-deploy-seguro-cermont/production-env-matrix.md
docs/deployment/PRODUCTION_ENV_AUDIT.md
```

Formato:

| Variable | Requerida | Estado | Riesgo | Acción |
|---|---|---|---|---|

### Criterio de salida

- no hay localhost público en producción;
- secretos presentes sin exponerse;
- variables faltantes documentadas;
- CORS y cookies revisados.

---

## FASE 2 — Seguridad pre-deploy

### Objetivo
Evitar subir una app insegura.

### Acciones

1. Buscar secretos:
   ```bash
   git grep -n "JWT_SECRET\|MONGODB_URI\|password\|SECRET\|TOKEN\|PRIVATE_KEY\|BEGIN RSA\|BEGIN PRIVATE"
   ```
2. Revisar `.gitignore`.
3. Revisar que `.env*` no esté trackeado indebidamente.
4. Ejecutar:
   ```bash
   npm audit
   ```
5. Verificar rate limiting de auth.
6. Verificar Helmet.
7. Verificar CORS.
8. Verificar cookies.
9. Verificar que uploads tengan allowlist.
10. Verificar que no se exponga `/api/docs` públicamente si no debe.

Crear:

```txt
specs/004-deploy-seguro-cermont/security-release-gate.md
docs/security/PRE_DEPLOY_SECURITY_GATE.md
```

### Criterio de salida

- no secretos expuestos;
- dependencias críticas documentadas;
- CORS productivo;
- cookies seguras;
- headers de seguridad activos;
- uploads controlados.

---

## FASE 3 — Base de datos y backup

### Objetivo
Nunca desplegar sin respaldo.

### Acciones

Si MongoDB está en VPS:

```bash
mkdir -p ~/backups/cermont
mongodump --uri "$MONGODB_URI" --out ~/backups/cermont/$(date +%Y%m%d-%H%M%S)
```

Si MongoDB está en Docker:

```bash
docker exec <mongo_container> mongodump --archive=/backup/cermont-$(date +%Y%m%d-%H%M%S).archive
docker cp <mongo_container>:/backup ./backup
```

Si MongoDB Atlas:

- crear snapshot manual;
- verificar último snapshot automático;
- documentar timestamp.

Crear:

```txt
docs/deployment/MONGODB_BACKUP_AND_RESTORE.md
specs/004-deploy-seguro-cermont/rollback-plan.md
```

Debe incluir:

- comando de backup;
- ubicación;
- timestamp;
- tamaño;
- cómo restaurar;
- responsable.

### Criterio de salida

- backup verificado antes de deploy;
- restore documentado.

---

## FASE 4 — Build productivo reproducible

### Objetivo
Crear build limpio antes de tocar producción.

### Acciones

```bash
npm run build -w @cermont/shared-types
npm run build -w @cermont/domain
npm run build -w @cermont/config
npm run build -w backend
npm run build -w frontend
npm run verify
npm run contracts:check
```

Validar Next.js:

- rutas esperadas;
- PWA/Serwist generado;
- no errores de server actions;
- no errores de env;
- no warnings críticos;
- tamaño razonable.

Crear:

```txt
docs/deployment/BUILD_REPORT.md
```

### Criterio de salida

- build reproducible;
- backend compila;
- frontend compila;
- shared packages compilan.

---

## FASE 5 — Estrategia de deploy

### Objetivo
Elegir estrategia segura.

### Opciones

#### Opción A — Docker Compose recomendado

Crear o verificar:

```txt
docker-compose.production.yml
.env.production
nginx.conf
```

Servicios:

```txt
frontend
backend
mongo o conexión externa
nginx
certbot opcional
```

#### Opción B — PM2 + Nginx

Verificar:

```bash
pm2 list
pm2 logs
pm2 save
pm2 startup
```

#### Opción C — systemd

Verificar services:

```bash
systemctl status cermont-backend
systemctl status cermont-frontend
```

### Decisión

Documentar en:

```txt
specs/004-deploy-seguro-cermont/plan.md
docs/deployment/DEPLOYMENT_STRATEGY.md
```

### Criterio de salida

- estrategia elegida;
- comandos definidos;
- rollback compatible.

---

## FASE 6 — Reverse proxy y HTTPS

### Objetivo
Asegurar tráfico productivo por HTTPS.

### Nginx mínimo recomendado

Validar o crear configuración con:

- redirección 80 a 443;
- proxy frontend;
- proxy backend `/api`;
- headers;
- upload size;
- gzip/brotli si aplica;
- static cache;
- no exponer internos.

Ejecutar:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Certbot / Let’s Encrypt

Ejecutar:

```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

Si no existe certificado:

```bash
sudo certbot --nginx -d cermontsas.shop -d www.cermontsas.shop
```

### Verificación externa

```bash
curl -I http://cermontsas.shop
curl -I https://cermontsas.shop
openssl s_client -connect cermontsas.shop:443 -servername cermontsas.shop
```

Verificar:

- HTTP responde 301/308 hacia HTTPS;
- certificado válido;
- fecha de expiración;
- HSTS;
- cookies Secure;
- no mixed content.

Crear:

```txt
specs/004-deploy-seguro-cermont/ssl-https-verification.md
docs/deployment/SSL_HTTPS_AUDIT.md
```

### Criterio de salida

- HTTPS verificado con evidencia;
- renovación verificada;
- redirección activa.

---

## FASE 7 — Deploy backend

### Objetivo
Publicar API sin romper contratos.

### Antes

```bash
npm run test -w backend
npm run build -w backend
npm run contracts:check
```

Comandos ejemplo Docker:

```bash
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml build backend
docker compose -f docker-compose.production.yml up -d backend
docker compose -f docker-compose.production.yml logs -f backend
```

Comandos ejemplo PM2:

```bash
pm2 restart cermont-backend --update-env
pm2 logs cermont-backend --lines 100
```

Health checks:

```bash
curl -fsS https://cermontsas.shop/api/health
curl -fsS https://cermontsas.shop/api/docs/openapi.json
```

Si `/api/docs` no debe ser público, verificarlo con auth o deshabilitarlo.

### Criterio de salida

- API responde;
- logs sin errores críticos;
- DB conectada;
- auth endpoints responden;
- CORS correcto.

---

## FASE 8 — Deploy frontend

### Objetivo
Publicar UI sin rutas rotas.

### Antes

```bash
npm run test -w frontend
npm run build -w frontend
```

Acciones Docker:

```bash
docker compose -f docker-compose.production.yml build frontend
docker compose -f docker-compose.production.yml up -d frontend
docker compose -f docker-compose.production.yml logs -f frontend
```

Acciones PM2:

```bash
pm2 restart cermont-frontend --update-env
pm2 logs cermont-frontend --lines 100
```

Verificar:

```bash
curl -I https://cermontsas.shop
curl -I https://cermontsas.shop/login
curl -I https://cermontsas.shop/dashboard
curl -I https://cermontsas.shop/~offline
```

### Criterio de salida

- frontend carga;
- rutas principales cargan;
- assets cargan;
- service worker no rompe navegación;
- no mixed content.

---

## FASE 9 — Smoke tests funcionales

### Objetivo
Confirmar que la app funciona en producción.

Crear:

```txt
specs/004-deploy-seguro-cermont/smoke-test-plan.md
docs/deployment/PRODUCTION_SMOKE_TEST_REPORT.md
```

### Escenarios mínimos

1. Abrir home/login.
2. Login con usuario autorizado.
3. Refresh de sesión.
4. Cargar dashboard.
5. Listar órdenes.
6. Abrir una orden.
7. Cargar módulo de vehículos.
8. Cargar módulo de herramientas/recursos.
9. Cargar evidencias/documentos.
10. Subir archivo de prueba en ambiente controlado, si aplica.
11. Ver notificaciones.
12. Ver perfil.
13. Logout.
14. Intentar ruta protegida sin sesión.
15. Verificar PWA/offline básico.

Si hay Playwright:

```bash
npm run test:e2e -- --project=production
```

Si no existe E2E productivo, hacer checklist manual documentado.

### Criterio de salida

- smoke tests pasados;
- capturas o logs documentados;
- errores registrados con severidad.

---

## FASE 10 — Observabilidad y monitoreo

### Objetivo
Que el sistema sea diagnosticable después del deploy.

Implementar/verificar:

- `/api/health`;
- `/api/ready` si aplica;
- logs estructurados;
- request id;
- uptime monitoring;
- SSL expiry monitoring;
- disk usage;
- backup monitoring;
- MongoDB connection monitoring;
- alertas por caída;
- alertas por error 5xx;
- rotación de logs.

Crear:

```txt
docs/operations/OBSERVABILITY_RUNBOOK.md
docs/operations/INCIDENT_RESPONSE_PLAN.md
docs/operations/BACKUP_AND_RECOVERY_PLAN.md
```

### Criterio de salida

- health visible;
- logs accesibles;
- procedimiento de incidentes documentado.

---

## FASE 11 — Rollback

### Objetivo
Poder volver atrás si algo falla.

Crear:

```txt
specs/004-deploy-seguro-cermont/rollback-plan.md
docs/deployment/ROLLBACK_RUNBOOK.md
```

Debe incluir:

- versión anterior;
- commit anterior;
- backup DB;
- comandos rollback Docker/PM2;
- cómo restaurar DB;
- cómo revertir Nginx;
- cómo revertir env;
- cuándo activar rollback.

Comandos ejemplo:

```bash
git rev-parse HEAD
git log --oneline -5
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=200
```

### Criterio de salida

- rollback documentado antes de cerrar deploy.

---

## FASE 12 — Reporte final de deploy

Crear:

```txt
specs/004-deploy-seguro-cermont/post-deploy-report.md
docs/deployment/PRODUCTION_DEPLOYMENT_REPORT.md
```

Formato:

```txt
# Reporte de Deploy CERMONT

## 1. Versión desplegada
## 2. Commit
## 3. Fecha/hora
## 4. Responsable
## 5. Dominio
## 6. Variables verificadas
## 7. Backup realizado
## 8. Build
## 9. Tests
## 10. SSL/HTTPS
## 11. Backend health
## 12. Frontend health
## 13. Smoke tests
## 14. Observabilidad
## 15. Rollback
## 16. Errores encontrados
## 17. Riesgos abiertos
## 18. Veredicto final
```

Veredicto permitido:

```txt
APPROVED_FOR_PRODUCTION
APPROVED_WITH_WARNINGS
BLOCKED
ROLLED_BACK
```

---

# TASKS SPEC KIT

Crear:

```txt
specs/004-deploy-seguro-cermont/tasks.md
```

Si la spec 003 terminó en T106, iniciar en T107.

```md
# Tasks — Spec 004 Deploy Seguro CERMONT

## P0 — Preflight
- [ ] T107 Crear spec 004.
- [ ] T108 Actualizar constitución v1.3.
- [ ] T109 Ejecutar baseline local.
- [ ] T110 Auditar WIP y branch.
- [ ] T111 Crear deployment runbook.

## P0 — Configuración
- [ ] T112 Auditar variables de entorno.
- [ ] T113 Eliminar valores dev/localhost en producción.
- [ ] T114 Validar secretos.
- [ ] T115 Validar CORS.
- [ ] T116 Validar cookies seguras.

## P0 — Seguridad
- [ ] T117 Buscar secretos en repo.
- [ ] T118 Ejecutar npm audit.
- [ ] T119 Verificar Helmet/rate limits.
- [ ] T120 Verificar uploads.
- [ ] T121 Crear security release gate.

## P0 — Backup
- [ ] T122 Crear backup MongoDB.
- [ ] T123 Documentar restore.
- [ ] T124 Verificar tamaño/ubicación backup.

## P1 — Build y deploy
- [ ] T125 Build shared packages.
- [ ] T126 Build backend.
- [ ] T127 Build frontend.
- [ ] T128 Elegir estrategia Docker/PM2/systemd.
- [ ] T129 Configurar servicios producción.
- [ ] T130 Desplegar backend.
- [ ] T131 Desplegar frontend.

## P1 — HTTPS
- [ ] T132 Configurar Nginx/reverse proxy.
- [ ] T133 Configurar Certbot/Let’s Encrypt.
- [ ] T134 Verificar HTTP a HTTPS.
- [ ] T135 Verificar certificado.
- [ ] T136 Verificar HSTS.
- [ ] T137 Verificar mixed content.

## P1 — Validación
- [ ] T138 Verificar API health.
- [ ] T139 Verificar frontend routes.
- [ ] T140 Ejecutar smoke tests.
- [ ] T141 Ejecutar E2E producción si existe.
- [ ] T142 Verificar logs.

## P2 — Operación
- [ ] T143 Configurar monitoreo mínimo.
- [ ] T144 Configurar rotación de logs.
- [ ] T145 Documentar incident response.
- [ ] T146 Documentar backup/restore.
- [ ] T147 Documentar rollback.

## P2 — Cierre
- [ ] T148 Crear reporte final deploy.
- [ ] T149 Actualizar README.
- [ ] T150 Actualizar DEVELOPMENT_STATUS.
- [ ] T151 Actualizar CHANGELOG.
- [ ] T152 Emitir veredicto final.
```

---

# FORMATO DE RESPUESTA DEL AGENTE

Al terminar cada fase, responder:

```txt
# Fase X — Resultado

## Objetivo
## Archivos revisados
## Archivos creados/modificados
## Comandos ejecutados
## Salidas importantes
## Errores encontrados
## Decisiones tomadas
## Riesgos abiertos
## Siguiente fase
```

Al terminar todo:

```txt
# Deploy CERMONT — Resultado Final

## 1. Veredicto
## 2. Versión desplegada
## 3. Dominio
## 4. Backend
## 5. Frontend
## 6. Base de datos
## 7. SSL/HTTPS
## 8. Seguridad
## 9. Smoke tests
## 10. Observabilidad
## 11. Rollback
## 12. Riesgos abiertos
## 13. Comandos ejecutados
## 14. Próximas acciones
```

---

# DEFINITION OF DONE

El deploy solo queda aprobado si:

1. `npm run verify` pasa.
2. `npm run contracts:check` pasa.
3. `npm run build` pasa.
4. No hay secretos expuestos.
5. Variables productivas están correctas.
6. Backup de DB realizado.
7. Backend responde health.
8. Frontend carga por HTTPS.
9. HTTP redirige a HTTPS.
10. Certificado SSL válido.
11. Cookies seguras verificadas.
12. CORS productivo correcto.
13. No mixed content crítico.
14. Smoke tests pasan.
15. Logs no muestran errores críticos.
16. Rollback documentado.
17. Reporte final creado.
18. Riesgos abiertos documentados.
19. No se rompió funcionalidad existente.
20. No se afirmó nada sin evidencia.

Empieza por crear `specs/004-deploy-seguro-cermont/` y ejecutar Fase 0. No hagas deploy hasta que P0 esté completo.
