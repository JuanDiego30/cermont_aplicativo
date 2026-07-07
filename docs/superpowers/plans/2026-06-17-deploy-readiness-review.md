# Plan de Revisión de Readiness para Deploy — Cermont S.A.S.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Determinar si el aplicativo Cermont está listo para ser desplegado a producción en el VPS Contabo, identificando riesgos bloqueantes y generando un reporte de readiness ejecutivo.

**Architecture:** El plan se divide en 7 fases secuenciales: (1) preparación del entorno, (2) verificación de quality gates, (3) auditoría de seguridad, (4) validación de infraestructura VPS, (5) smoke tests funcionales, (6) verificación de deploy pipeline, (7) generación de reporte final. Cada fase produce un artefacto verificable.

**Tech Stack:** Node.js 24, TypeScript 6, Next.js 16, Express 5, MongoDB 7, Docker 29, PM2, nginx, Biome, Vitest, Playwright

---

## Task 1: Preparación del Entorno de Auditoría

**Files:**
- Execute: `git status` desde raíz del repo
- Execute: `node -v`, `npm -v`, `docker --version`, `docker compose version`
- Execute: `git branch --show-current`, `git log --oneline -10`
- Verify: Existencia de `backend/.env`, `frontend/.env.local`, `docker-compose.yml`, `ecosystem.config.cjs`

- [ ] **Step 1: Registrar estado del working tree**

Ejecutar:
```bash
cd /opt/cermont/app
echo "=== BRANCH ===" && git branch --show-current
echo "=== STATUS ===" && git status --short
echo "=== UNTRACKED ===" && git ls-files --others --exclude-standard
```

Expected: Rama actual debe ser `main`. Working tree limpio o cambios documentados.

- [ ] **Step 2: Registrar versiones del entorno**

```bash
echo "NODE: $(node -v)" && echo "NPM: $(npm -v)"
echo "DOCKER: $(docker --version 2>/dev/null || echo 'no instalado')"
echo "PM2: $(pm2 --version 2>/dev/null || echo 'no instalado')"
echo "TSC: $(npx tsc --version)"
```

Expected: Node.js >= 22.20.0, npm >= 10.9.4.

- [ ] **Step 3: Verificar archivos críticos de configuración**

```bash
for f in backend/.env frontend/.env.local docker-compose.yml ecosystem.config.cjs .env.docker.example; do
  test -f "$f" && echo "OK  $f" || echo "FALTA $f"
done
```

- [ ] **Step 4: Commit checkpoint (opcional)**

```bash
git add -A && git commit -m "chore: pre-deploy checkpoint"
```

## Task 2: Verificación de Quality Gates

**Files:**
- Execute: 
pm run typecheck (raíz)
- Execute: 
pm run lint (raíz)
- Execute: 
pm run test (raíz)
- Execute: 
pm run build (raíz)
- Execute: 
pm run verify (raíz)
- Execute: 
px react-doctor@latest (en rontend/)

- [ ] **Step 1: TypeScript typecheck**

``bash
npm run typecheck 2>&1
``
Expected: Exit 0. Todos los workspaces pasan.

- [ ] **Step 2: Lint (Biome)**

``bash
npm run lint 2>&1
``
Expected: Exit 0. Cero errores.

- [ ] **Step 3: Tests**

``bash
npm run test 2>&1
``
Expected: Exit 0. > 700 tests pasan.

- [ ] **Step 4: Build**

``bash
npm run build 2>&1
``
Expected: Exit 0. Si falla, BLOQUEANTE.



## Task 2: Verificación de Quality Gates

**Files:**
- Execute: `npm run typecheck` (raíz)
- Execute: `npm run lint` (raíz)
- Execute: `npm run test` (raíz)
- Execute: `npm run build` (raíz)
- Execute: `npm run verify` (raíz)
- Execute: `npx react-doctor@latest` (en `frontend/`)

- [ ] **Step 1: TypeScript typecheck**

```bash
npm run typecheck 2>&1
```
Expected: Exit 0. Todos los workspaces pasan.

- [ ] **Step 2: Lint (Biome)**

```bash
npm run lint 2>&1
```
Expected: Exit 0. Cero errores.

- [ ] **Step 3: Tests**

```bash
npm run test 2>&1
```
Expected: Exit 0. > 700 tests pasan.

- [ ] **Step 4: Build**

```bash
npm run build 2>&1
```
Expected: Exit 0. Si falla, BLOQUEANTE.

- [ ] **Step 5: Verify completo**

```bash
npm run verify 2>&1
```
Expected: Exit 0. Cualquier fallo BLOQUEANTE.

- [ ] **Step 6: React Doctor**

```bash
cd frontend && npx react-doctor@latest 2>&1
```
Expected: Score >= 80/100.

- [ ] **Step 7: Documentar resultados**

```markdown
| Gate | Status | Details |
|------|--------|---------|
| typecheck | / | |
| lint | / | |
| test | / | X passed/Y failed |
| build | / | |
| verify | / | |
| react-doctor | | Score: X/100 |
```

---

## Task 3: Auditoría de Seguridad y Variables de Entorno

**Files:**
- Read: `backend/.env`, `frontend/.env.local`
- Read: `backend/.env.example`, `.env.docker.example`
- Read: `backend/src/config/env.ts`

- [ ] **Step 1: Verificar NODE_ENV**

```bash
grep -E "^NODE_ENV=" backend/.env
```
Expected: `NODE_ENV=production`. Si es `development`, BLOQUEANTE.

- [ ] **Step 2: Verificar secretos JWT**

```bash
grep -E "^JWT_SECRET=|^REFRESH_TOKEN_SECRET=" backend/.env
```
Expected: Ambas >= 32 chars, diferentes entre si.

- [ ] **Step 3: Verificar MONGODB_URI**

```bash
grep "^MONGODB_URI=" backend/.env
```

- [ ] **Step 4: Verificar URLs publicas**

```bash
grep -E "^FRONTEND_URL=" backend/.env
grep -E "^NEXT_PUBLIC_API_URL=" frontend/.env.local
grep -E "^NEXT_PUBLIC_APP_URL=" frontend/.env.local
```

- [ ] **Step 5: Verificar trust proxy**

```bash
grep -E "trust proxy|secure|sameSite" backend/src/server.ts backend/src/index.ts
```

- [ ] **Step 6: Verificar .env en Git**

```bash
git ls-files --cached | grep -E "\.env$|\.env\.local$" || echo "OK - No .env en Git"
```

- [ ] **Step 7: Verificar seguridad Docker**

```bash
grep -E "ports:" docker-compose.yml -A 3
test -f .dockerignore && echo "OK" || echo "FALTA .dockerignore"
```

---

## Task 4: Validación de Infraestructura VPS (Contabo)

**Files:**
- Execute: Scripts via SSH al VPS
- Read: `docs/deploy/PRODUCTION_DEPLOYMENT.md`
- Read: `docs/deploy/pm2-vps.md`

- [ ] **Step 1: Verificar acceso SSH**

```bash
ssh -o ConnectTimeout=10 deploy@<VPS_IP> "echo CONECTADO"
```
Expected: Conexion exitosa. Sin acceso SSH, BLOQUEANTE.

- [ ] **Step 2: Inventario del servidor**

```bash
ssh deploy@<VPS_IP> << 'CMDS'
cat /etc/os-release
echo "CPU:" && nproc
echo "RAM:" && free -h
echo "DISK:" && df -h /
echo "NODE:" && node -v
echo "DOCKER:" && docker --version
echo "NGINX:" && nginx -v
echo "MONGODB:" && mongod --version
echo "UFW:" && sudo ufw status verbose
echo "FAIL2BAN:" && sudo fail2ban-client status || echo "no instalado"
CMDS
```
Expected: Ubuntu 24.04+, Node 22+, MongoDB 7.0, UFW activo.

- [ ] **Step 3: Verificar seguridad SSH**

```bash
ssh deploy@<VPS_IP> "sudo grep -E 'PermitRootLogin|PasswordAuthentication|PubkeyAuthentication' /etc/ssh/sshd_config | grep -v '^#'"
```
Expected: `PermitRootLogin prohibit-password`, `PasswordAuthentication no`.

- [ ] **Step 4: Verificar firewall**

```bash
ssh deploy@<VPS_IP> "sudo ufw status verbose"
```
Expected: Solo 22, 80, 443. MongoDB (27017) NO expuesto.

- [ ] **Step 5: Verificar SSL**

```bash
ssh deploy@<VPS_IP> "sudo certbot certificates 2>/dev/null || echo 'Sin SSL'"
```
Expected: Certificado activo. Sin SSL, BLOQUEANTE para produccion.

- [ ] **Step 6: Verificar nginx config**

```bash
ssh deploy@<VPS_IP> "sudo nginx -t 2>&1"
```
Expected: Syntax OK.

- [ ] **Step 7: Verificar backups**

```bash
ssh deploy@<VPS_IP> "crontab -l 2>/dev/null | grep -i backup || echo 'Sin cron backup'; ls -la /opt/cermont/backups/ 2>/dev/null || echo 'Sin backups'"
```

---

## Task 5: Smoke Tests Funcionales

**Files:**
- Read: `frontend/playwright.deploy-readiness.config.ts`
- Execute: Playwright deploy-readiness tests
- Execute: Verificacion manual de endpoints

- [ ] **Step 1: Health endpoints**

```bash
curl -sf http://127.0.0.1:4000/api/health/live
curl -sf http://127.0.0.1:4000/api/health/ready
```
Expected: `{"status":"ok"}`

- [ ] **Step 2: Playwright deploy-readiness tests**

```bash
cd frontend && npx playwright test --config=playwright.deploy-readiness.config.ts 2>&1
```
Expected: Todos pasan.

- [ ] **Step 3: Login funcional**

```bash
curl -sf -X POST http://127.0.0.1:4000/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"gerencia@cermont.co","password":"Cermont2026!"}'
```
Expected: 200 con tokens. Si falla, BLOQUEANTE.

- [ ] **Step 4: Probar modulos criticos via API**

```bash
TOKEN=$(curl -sf -X POST http://127.0.0.1:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"gerencia@cermont.co","password":"Cermont2026!"}' | jq -r '.data.accessToken')
for ep in orders proposals service-cases evidences costs documents; do
  echo "$ep: $(curl -sf -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer $TOKEN' http://127.0.0.1:4000/api/$ep)"
done
```

- [ ] **Step 5: Verificar frontend**

```bash
curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/
curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/login
```

- [ ] **Step 6: Verificar PWA**

```bash
curl -sf http://127.0.0.1:3000/manifest.json | head -c 200
```

---

## Task 6: Verificacion de Deploy Pipeline

**Files:**
- Read: `.github/workflows/ci.yml`
- Read: `.github/workflows/deploy.yml`
- Read: `docker-compose.yml`
- Read: `ecosystem.config.cjs`

- [ ] **Step 1: Verificar CI/CD**

```bash
cat .github/workflows/ci.yml 2>/dev/null | head -30
```

- [ ] **Step 2: Verificar scripts de deploy**

```bash
grep -E "deploy:" package.json
```

- [ ] **Step 3: Validar docker-compose.yml**

```bash
docker compose config 2>&1
```
Expected: Exit 0.

- [ ] **Step 4: Verificar Dockerfiles compilan**

```bash
docker build -f backend/Dockerfile --target=runner -t cermont-backend:test . 2>&1 | tail -5
docker build -f frontend/Dockerfile --target=runner -t cermont-frontend:test . 2>&1 | tail -5
```

- [ ] **Step 5: Verificar nginx config**

```bash
nginx -t -c docker/nginx/nginx.conf 2>&1 || echo "Verificacion manual requerida"
```

- [ ] **Step 6: Build Docker completo**

```bash
docker compose build 2>&1
```
Expected: Exit 0.

---

## Task 7: Generacion de Reporte Final

**Files:**
- Create: `docs/audits/READINESS_REPORT_DEPLOY_$(date +%F).md`

- [ ] **Step 1: Compilar resultados de Tasks 1-6**

```markdown
| Dimension | Puntaje | Estado |
|-----------|---------|--------|
| Quality Gates | /100 | |
| Seguridad | /100 | |
| Infraestructura VPS | /100 | |
| Smoke Tests | /100 | |
| Deploy Pipeline | /100 | |
| **GLOBAL** | **/100** | |
```

- [ ] **Step 2: Determinar veredicto**

| Veredicto | Criterio |
|-----------|----------|
| APTO | Todos los gates pasan, seguridad OK, VPS verificado, smoke tests OK |
| APTO CON RIESGOS | Gates pasan, riesgos menores documentados, VPS accesible |
| NO APTO | Gate bloqueante falla, seguridad critica, VPS no accesible |

- [ ] **Step 3: Documentar issues**

```markdown
| ID | Severidad | Descripcion | Accion |
|----|-----------|-------------|--------|
| I01 | BLOQUEANTE | | |
```

- [ ] **Step 4: Guardar reporte**

```bash
cp /tmp/readiness-report.md "docs/audits/READINESS_REPORT_DEPLOY_$(date +%F).md"
echo "Reporte guardado"
```

- [ ] **Step 5: Commit del reporte (opcional)**

```bash
git add "docs/audits/READINESS_REPORT_DEPLOY_$(date +%F).md"
git commit -m "docs: add deploy readiness report $(date +%F)"
```
