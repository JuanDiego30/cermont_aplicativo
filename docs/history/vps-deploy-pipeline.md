# Plan: VPS Deploy Pipeline — audit/business-logic-state → deploy/vps-clean → VPS

**Estado:** ACTIVO  
**Creado:** 2026-06-17  
**Objetivo:** Llevar los 33 commits de `audit/business-logic-state` hasta el VPS Ubuntu 24.04 con PM2.  
**Dependencias documentadas:**
- Arquitectura PM2: `docs/deploy/PRODUCTION_DEPLOYMENT.md`
- Provisioning VPS: `.sisyphus/plans/remove-docker-deployment.md`
- Variables de entorno: `docs/deploy/VARIABLES_ENTORNO.md`
- CI/CD actual: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

---

## Estado inicial confirmado (2026-06-17)

```
audit/business-logic-state HEAD  = bf91cf5  (33 commits ahead of origin)
deploy/vps-clean local           = 1243449  (2 ahead, 40 behind origin — divergido)
merge-base(audit, deploy/vps-clean) = bf91cf5  ← audit no tiene nada nuevo vs deploy local
```

**Working tree actual (7 archivos sin commitear — todas son eliminaciones Docker):**
```
 D .dockerignore
 D .env.docker.example
 D docker-compose.dev.yml
 D docker-compose.yml
 D docker/mongo-init.js
 D docker/nginx/nginx.conf
 D docker/qdrant/config.yaml
```

**Archivos sin trackear (no van al deploy):**
```
?? Libro/Capitulos/bibliografia_normativa_vps.bib   ← tesis, ignorar
?? docs/deploy/RELEASE_CHECKLIST_2026-06-17.md      ← checklist de sesión, opcional
```

**Quality gates (verificados en commit 660e451, necesitan re-verificación tras bf91cf5):**
- typecheck 7/7, lint 7/7, test 602+, build 5/5, verify/react-doctor ✅ en sesión anterior
- bf91cf5 cambió 344 archivos → re-ejecutar obligatorio

**Problema en deploy.yml:** usa `docker compose up -d --build` (obsoleto) y apunta a `main`.
Debe actualizarse a PM2 (`npm run deploy:pm2:reload`) antes de activar CI/CD automatizado.

---

## Phase 0 — Leer antes de ejecutar (solo lectura)

En cada nueva sesión que ejecute una fase, leer primero:
1. `docs/deploy/PRODUCTION_DEPLOYMENT.md` — arquitectura y comandos canonicos
2. `.sisyphus/plans/remove-docker-deployment.md` — VPS provisioning PM2
3. `.github/workflows/ci.yml` y `deploy.yml` — triggers actuales
4. `ecosystem.config.cjs` — definición de procesos PM2
5. `backend/.env.example` — variables requeridas

**Antipatrones a evitar:**
- NO usar `docker compose up` en ningún contexto de deploy (fue eliminado)
- NO pushear a `main` directamente
- NO stagear `Libro/` o archivos `.env` reales
- NO `git push --force` en ningún branch

---

## Phase 1 — Commit las eliminaciones Docker + push audit branch

**Contexto:** 7 archivos Docker eliminados en working tree sin commitear. La rama necesita ser pusheada para que CI corra en GitHub Actions.

**Qué implementar:**

### 1.1 Verificar estado limpio

```powershell
cd "C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo"
git status --short
# Deben aparecer exactamente 7 archivos D y 2 ?? (Libro/ y RELEASE_CHECKLIST)
# Si hay más, investigar antes de continuar
```

### 1.2 Stagear solo las eliminaciones Docker

```powershell
git rm .dockerignore .env.docker.example docker-compose.dev.yml docker-compose.yml
git rm docker/mongo-init.js docker/nginx/nginx.conf docker/qdrant/config.yaml
```

> Si el archivo ya fue eliminado del FS pero no staged, `git rm` lo registra igual.
> NO usar `git add .` para evitar incluir archivos no deseados.

### 1.3 Commit

```powershell
git commit -m "chore(infra): remove Docker artifacts — migrate fully to PM2 + nginx directo"
```

### 1.4 Push audit branch

```powershell
git push origin audit/business-logic-state
```

**Verificación de Phase 1:**
- [ ] `git status --short` muestra solo `?? Libro/` y `?? docs/deploy/RELEASE_CHECKLIST*`
- [ ] `git log --oneline origin/audit/business-logic-state..HEAD` → 0 commits (rama sincronizada)
- [ ] GitHub Actions CI job aparece en ejecución en `audit/business-logic-state`

---

## Phase 2 — Esperar y verificar CI en GitHub

**Contexto:** El trigger de CI en `.github/workflows/ci.yml` corre en `audit/**` branches.
Una vez que CI pase, los 34 commits de `audit/business-logic-state` están verificados.

**Qué verificar:**

```powershell
# Ver estado del último run (requiere gh CLI autenticado)
gh run list --branch audit/business-logic-state --limit 3
gh run view <run-id>
```

**Si CI falla:**
- `typecheck` → revisar errores en `backend/src/` o `frontend/src/`
- `lint` → correr `npm run lint --fix` localmente y re-commitear
- `test` → ver qué test falló; bf91cf5 cambió 344 archivos incluyendo tests
- `build` → verificar `npm run build` localmente primero

**Verificación de Phase 2:**
- [ ] CI run en `audit/business-logic-state` muestra ✅ en todos los steps
- [ ] No hay pasos `continue-on-error: true` que hayan fallado silenciosamente

---

## Phase 3 — Reconciliar deploy/vps-clean

**Contexto:** El worktree local de `deploy/vps-clean` divergió del remote:
- Local tiene 2 commits que remote no tiene
- Remote tiene 40 commits que local no tiene

**IMPORTANTE:** El merge-base con `audit/business-logic-state` es `bf91cf5`. Si `origin/deploy/vps-clean` ya contiene los commits del audit, no hay necesidad de merge manual.

### 3.1 Actualizar el worktree local a origin

```powershell
# Abrir worktree de deploy/vps-clean
cd "C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo-deploy"
git fetch origin
git log --oneline HEAD..origin/deploy/vps-clean | Select-Object -First 5
# Ver qué tienen los 40 commits del remote que local no tiene
```

### 3.2 Decidir estrategia de merge

**Opción A (recomendada):** Si `origin/deploy/vps-clean` ya incorporó el trabajo de `audit/`:
```powershell
# Descartar los 2 commits locales divergentes y usar remote
git reset --hard origin/deploy/vps-clean
```
> DESTRUYE los 2 commits locales de deploy/vps-clean. Confirmar que los 40 commits del remote ya incluyen el work de audit/business-logic-state antes de ejecutar.

**Opción B:** Si los 2 commits locales tienen cambios valiosos que remote no tiene:
```powershell
git rebase origin/deploy/vps-clean
# Resolver conflictos si los hay
git push origin deploy/vps-clean
```

### 3.3 Merge de audit/business-logic-state (si es necesario)

Solo ejecutar si el remote `deploy/vps-clean` NO tiene los commits de `audit/`:
```powershell
git checkout deploy/vps-clean
git merge audit/business-logic-state --no-ff -m "merge(audit): incorporate business-logic-state into deploy"
```

**Verificación de Phase 3:**
- [ ] `git log --oneline origin/deploy/vps-clean | head -5` muestra commits esperados
- [ ] `git log --oneline deploy/vps-clean..origin/deploy/vps-clean` → 0 (local sincronizado con remote)
- [ ] `git diff deploy/vps-clean origin/deploy/vps-clean` → sin diferencias

---

## Phase 4 — Actualizar deploy.yml para PM2

**Contexto:** `.github/workflows/deploy.yml` actual usa `docker compose up -d --build` y apunta a `main`. El deploy target es `deploy/vps-clean` con PM2.

**Qué cambiar** en `.github/workflows/deploy.yml`:

```yaml
# ANTES: apuntaba a main y usaba Docker
if: github.ref == 'refs/heads/main'
...
docker compose config --quiet
docker compose up -d --build --remove-orphans

# DESPUÉS: apunta a deploy/vps-clean y usa PM2
if: github.ref == 'refs/heads/deploy/vps-clean'
...
npm ci --include-workspace-root --workspaces
npm run build
npm run deploy:pm2:reload
sleep 5
curl --fail --silent --show-error --retry 12 --retry-delay 5 \
  http://127.0.0.1:4000/api/health/ready
```

**Referencia para el script SSH** (ver `.sisyphus/plans/remove-docker-deployment.md` §11.1 — "Fase 11"):
```yaml
script: |
  set -euo pipefail
  cd /opt/cermont/app
  git rev-parse HEAD > .last-known-good
  git fetch origin deploy/vps-clean
  git checkout deploy/vps-clean
  git pull --ff-only origin deploy/vps-clean
  npm ci --include-workspace-root --workspaces
  npm run build
  npm run deploy:pm2:reload
  sleep 5
  curl --fail --silent --show-error --retry 12 --retry-delay 5 \
    http://127.0.0.1:4000/api/health/ready
```

**Secretos requeridos en GitHub** (Settings → Secrets → Actions):
- `VPS_HOST` — IP del VPS
- `VPS_PORT` — 22
- `VPS_USER` — deploy
- `VPS_SSH_KEY` — llave privada ed25519
- `VPS_DOMAIN` — dominio (para health check HTTPS post-deploy)

**Verificación de Phase 4:**
- [ ] `deploy.yml` no contiene ninguna referencia a `docker`
- [ ] `deploy.yml` target branch es `deploy/vps-clean` (no `main`)
- [ ] Secretos configurados en GitHub repo settings
- [ ] `grep -r "docker" .github/workflows/` → 0 resultados

---

## Phase 5 — VPS: primer deploy o actualización

**Referencia canónica:** `docs/deploy/PRODUCTION_DEPLOYMENT.md` y `.sisyphus/plans/remove-docker-deployment.md`

### 5A — Si es primer deploy del VPS (provisioning desde cero)

Seguir `.sisyphus/plans/remove-docker-deployment.md` fases 1–12 en orden:
- Fase 1: SSH hardening
- Fase 2: UFW firewall
- Fase 3: Node.js via nvm
- Fase 4: MongoDB 7.0
- Fase 5: PM2 + app clone + .env + build + start
- Fase 6: nginx reverse proxy
- Fase 7: Certbot SSL

Puntos críticos que require acción manual:
```bash
# Generar secretos (NO reutilizar ningún valor de ejemplo)
openssl rand -hex 64  # JWT_SECRET
openssl rand -hex 64  # REFRESH_TOKEN_SECRET (diferente)
openssl rand -hex 32  # MongoDB cermont_app password

# Seed inicial
cd /opt/cermont/app && NODE_ENV=production npx tsx backend/src/scripts/seed.ts

# CAMBIAR INMEDIATAMENTE contraseña de gerencia@cermont.co (Cermont2026!)
```

### 5B — Si el VPS ya está provisionado (actualización)

```bash
# En el VPS como deploy
cd /opt/cermont/app
git rev-parse HEAD > .last-known-good
git fetch origin deploy/vps-clean
git checkout deploy/vps-clean
git pull --ff-only origin deploy/vps-clean
npm ci --include-workspace-root --workspaces
npm run build
npm run deploy:pm2:reload
sleep 5
curl --fail --silent --show-error http://127.0.0.1:4000/api/health/ready
```

**Post-deploy scripts (ejecutar si es necesario):**
```bash
./scripts/setup-uploads.sh        # crea y protege uploads/
./scripts/pm2-logrotate-setup.sh  # configura rotación de logs
```

**Verificación de Phase 5:**
- [ ] `pm2 status` → ambos procesos `online`
- [ ] `curl http://127.0.0.1:4000/api/health/ready` → 200 con `"mongodb":"connected"`
- [ ] `curl -s http://127.0.0.1:3000` → HTTP 200
- [ ] SSL activo: `curl https://<dominio>/api/health/ready` → 200

---

## Phase 6 — Smoke test post-deploy (15 minutos de observación)

Ejecutar desde una sesión con acceso a la app en producción:

### 6.1 Flujos críticos a verificar manualmente

| Flujo | Acción | Resultado esperado |
|-------|--------|-------------------|
| Login | `gerencia@cermont.co` + contraseña | Dashboard carga |
| RBAC | Login con técnico | Solo ve su menú |
| Planeación | Crear work request | Guarda y aparece en lista |
| Evidencias | Subir foto a evidencia | Upload exitoso, thumbnail aparece |
| Offline | Desconectar red, navegar | App responde desde SW cache |
| Sync | Reconectar red | Cambios offline sincronizan |

### 6.2 Verificar logs sin errores 500

```bash
pm2 logs --lines 200 | grep -E '"status":5|Error:|FATAL'
# Debe dar 0 resultados
```

### 6.3 Verificar firewall final

```bash
sudo ufw status verbose
# Solo 22, 80, 443 deben estar ALLOW IN
# Verificar que 27017, 3000, 4000 NO aparecen
```

**Verificación de Phase 6:**
- [ ] Todos los flujos críticos de la tabla funcionan
- [ ] 0 errores 500 en logs en los primeros 15 min
- [ ] UFW solo expone 22/80/443
- [ ] `certbot certificates` muestra SSL válido con > 60 días
- [ ] Backup cron activo: `crontab -l | grep backup`

---

## Rollback triggers

Revertir inmediatamente si cualquiera de estos ocurre:
- `pm2 status` muestra `errored` o restart loop
- `/api/health/ready` no responde tras 60 seg de start
- Login falla para cualquier rol
- Uploads retornan 500 o 404
- Tasa de errores > 5% en logs (primeros 15 min)

**Procedimiento:**
```bash
cd /opt/cermont/app
git checkout "$(cat .last-known-good)"
npm ci --include-workspace-root --workspaces
npm run build
npm run deploy:pm2:reload
```

---

## Issues conocidos (no bloquean deploy)

| ID | Descripción | Impacto | Acción |
|----|-------------|---------|--------|
| OPEN-1 | `asset.service.ts` — AppError args en orden incorrecto | Bajo | Issue abierto (chip task_fd399724) |
| P2-1 | OpenTelemetry / Prometheus no implementados | Observabilidad reducida | Diferir Wave P2 |
| P2-2 | 2 vulns moderadas PostCSS (requieren downgrade Next.js) | Muy bajo | Aceptadas formalmente |
| FEAT-1 | Form fields 1.2–1.6 (gaps de feature) | Solo formularios específicos | Iniciativas separadas |
