# Plan: Correcciones Post-Code Review

## TL;DR

> **Resumen**: Implementar las 19 correcciones identificadas en el code review pre-deploy del monorepo Cermont. Incluye 8 issues críticos (a11y, tests, env, E2E) + 11 sugerencias de mejora (build, audit, configuración).
>
> **Deliverables**:
> - 2 archivos `.env` creados (frontend + backend)
> - 1 fix de accesibilidad en `DialogContent`
> - 3 tests re-habilitados con mocks correctos
> - 63 nuevas rutas con smoke tests E2E
> - 6 verificaciones de configuración (CORS, SW, ecosystem, uploads, logrotate, cache)
> - 1 ciclo de `npm audit fix`
>
> **Esfuerzo**: Large (~6-10 horas, dominado por E2E tests)
> **Paralelización**: PARCIAL — Waves 1-2 en paralelo, Wave 3 (E2E) es secuencial
> **Ruta crítica**: T1 → T8 (E2E) → F1-F3

---

## Context

### Origen
Code review pre-deploy del monorepo Cermont S.A.S. Identificó 8 issues críticos que bloquean el deploy y 11 sugerencias de mejora.

### Decisiones del entrevistado
- **Alcance**: CR-01 a CR-08 + SG-01 a SG-11 (19 items)
- **CR-05**: Cobertura E2E completa para las 63 rutas sin cubrir
- **VPS**: Excluido del plan — solo modificaciones locales en el repositorio
- **CR-06, CR-07, CR-08, SG-02, SG-03, SG-10**: Excluidos por ser tareas exclusivas del VPS

### Issues Excluidos del Plan (VPS)
| ID | Issue | Razón |
|----|-------|-------|
| CR-06 | Node v24 en VPS | Solo VPS — `nvm use 22` |
| CR-07 | UFW sin puertos 80/443 | Solo VPS — `ufw allow` |
| CR-08 | `/opt/cermont` no existe | Solo VPS — `git clone` |
| SG-02 | pm2 startup | Solo VPS — `pm2 startup` |
| SG-03 | MongoDB sin auth | Solo VPS — `mongosh` + config |
| SG-10 | SSL/Certbot | Solo VPS — `certbot --nginx` |

---

## Work Objectives

### Core Objective
Resolver los 13 issues de código/config del code review para desbloquear el deploy a producción.

### Concrete Deliverables
- `frontend/.env.production` — variables de entorno para producción
- `frontend/.env.local` — variables de entorno para desarrollo local
- `backend/.env.example` — template con todas las variables requeridas
- Fix de accesibilidad en `DocumentGallery.tsx` (DialogTitle + VisuallyHidden)
- Tests re-habilitados: `evidences-page.test.tsx` y `site-visits-new-page.test.tsx`
- Archivo de smoke tests E2E expandido: `tests/e2e/page-smoke.spec.ts`
- `ecosystem.config.cjs` verificado
- Configuraciones: CORS, SW cache headers, uploads persistence, logrotate, turbo cache

### Definition of Done
- [ ] `npm run typecheck` → 0 errors
- [ ] `npm run lint` → 0 errors
- [ ] `npm run build` → exit 0
- [ ] `npm run test` → 985+ tests pass
- [ ] `npm run test:e2e` → nuevas rutas cubiertas
- [ ] `npm audit --audit-level=high` → 0 high/critical

### Must Have
- CR-01: Ningún `DialogContent` sin `DialogTitle` en frontend
- CR-02: Cero tests `.skip` en evidencias y site-visits
- CR-03: `NEXT_PUBLIC_APP_URL` configurada en producción
- CR-04: `backend/.env.example` con todas las variables documentadas
- CR-05: Smoke tests E2E para todas las rutas actualmente sin cubrir
- SG-01: Build exitoso en local
- SG-07: `CORS_ORIGINS` sin comodín en producción

### Must NOT Have (Guardrails)
- No modificar `package.json` ni `package-lock.json` sin aprobación explícita
- No introducir `any`, `unknown`, `null`, `undefined` en los fixes
- No eliminar funcionalidad existente
- No mock data en producción
- No `console.log` en producción
- No crear archivos fuera de frontend/, backend/, packages/ (excepto .sisyphus/)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest backend + frontend, Playwright E2E)
- **Automated tests**: Tests-after (primero fix, luego verificar)
- **Framework**: Vitest + Playwright
- **QA**: Cada tarea se verifica ejecutando los tests relevantes

### Verification Commands por Tarea
Cada tarea incluye comandos de verificación exactos. No se requiere intervención humana para validar.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — env + config, 4 tareas en paralelo):
├── T1: frontend/.env.production + .env.local (CR-03) [quick]
├── T2: backend/.env.example (CR-04) [quick]
├── T3: Verificar ecosystem.config.cjs (SG-04) [quick]
└── T4: Verificar CORS_ORIGINS (SG-07) [quick]

Wave 2 (Code fixes — 3 tareas en paralelo):
├── T5: Fix DialogContent a11y (CR-01) [quick]
├── T6: Unskip 3 tests (CR-02) [quick]
├── T7: Uploads persistence setup (SG-05) [quick]
├── T8: SW cache headers verify (SG-06) [quick]
└── T9: Turbo remote cache config (SG-11) [quick]

Wave 3 (E2E smoke tests — tarea grande, secuencial):
├── T10: E2E smoke test expansion (CR-05) [deep]

Wave 4 (Verification + hardening — 3 tareas en paralelo):
├── T11: npm run build verify (SG-01) [quick]
├── T12: npm audit fix (SG-08) [quick]
└── T13: PM2 logrotate config (SG-09) [quick]

Wave FINAL (quality gates — paralelo):
├── F1: npm run typecheck + lint
├── F2: npm run test (all)
├── F3: npm run test:e2e
└── F4: npm run build
→ Presentar resultados y obtener OK del usuario

Ruta crítica: T1 → T10 → F2 → F3 → F4
Paralelización: ~60% más rápido que secuencial
Máximo concurrente: 5 (Wave 2)
```

---

## TODOs

- [ ] 1. Crear `frontend/.env.production` y `frontend/.env.local`

  **Issue**: CR-03 — `NEXT_PUBLIC_APP_URL` no configurada, build fallará en VPS

  **What to do**:
  - Crear `frontend/.env.production`:
    ```env
    NEXT_PUBLIC_APP_URL=https://cermontsas.shop
    BACKEND_INTERNAL_URL=http://127.0.0.1:5000
    NEXT_PUBLIC_API_URL=https://api.cermontsas.shop
    NEXT_PUBLIC_SW_ENABLED=true
    NEXT_PUBLIC_OFFLINE_ENABLED=true
    NODE_ENV=production
    ```
  - Crear `frontend/.env.local`:
    ```env
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    BACKEND_INTERNAL_URL=http://localhost:5000
    NEXT_PUBLIC_API_URL=http://localhost:5000
    NODE_ENV=development
    ```
  - NO modificar `frontend/.env` si existe (es para otras configuraciones)
  - NO agregar secrets reales al repositorio (solo template values)

  **Parallelization**: Wave 1 (con T2, T3, T4)
  **Blocks**: T10 (E2E tests need API URL), T11 (build)
  **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `frontend/.env.production` existe con `NEXT_PUBLIC_APP_URL`
  - [ ] `frontend/.env.local` existe con URLs de desarrollo

  **Verification**:
  ```bash
  cat frontend/.env.production | Select-String "NEXT_PUBLIC_APP_URL"
  cat frontend/.env.local | Select-String "NEXT_PUBLIC_API_URL"
  ```
  Ambos comandos deben mostrar la variable configurada.

  **Commit**: YES (con T2, T3, T4)
  - Message: `chore(env): add frontend env templates for production and development`

- [ ] 2. Crear `backend/.env.example` para producción

  **Issue**: CR-04 — backend/.env de producción sin crear

  **What to do**:
  - Crear `backend/.env.example` con todas las variables requeridas (documentadas pero sin secrets reales):
    ```env
    NODE_ENV=production
    PORT=5000
    MONGODB_URI=mongodb://127.0.0.1:27017/cermont_prod
    JWT_SECRET=<generate-with: node -e "require('crypto').randomBytes(64).toString('hex')">
    JWT_EXPIRES_IN=15m
    JWT_REFRESH_SECRET=<generate-with: node -e "require('crypto').randomBytes(64).toString('hex')">
    JWT_REFRESH_EXPIRES_IN=7d
    CORS_ORIGINS=https://cermontsas.shop,https://www.cermontsas.shop
    FRONTEND_URL=https://cermontsas.shop
    API_URL=https://api.cermontsas.shop
    COOKIE_SECURE=true
    BCRYPT_ROUNDS=12
    ```
  - Verificar que el backend valida estas variables al iniciar (Zod env validation)
  - NO incluir secrets reales — solo placeholders documentados

  **Parallelization**: Wave 1 (con T1, T3, T4)
  **Blocks**: None directly (es template, no runtime)
  **Blocked By**: None

  **References**:
  - `backend/src/config/env.ts` — Validación Zod de variables de entorno

  **Acceptance Criteria**:
  - [ ] `backend/.env.example` existe con todas las variables documentadas
  - [ ] Cada variable incluye comentario con cómo generarla

  **Verification**:
  ```bash
  cat backend/.env.example | Select-String "MONGODB_URI\|JWT_SECRET\|CORS_ORIGINS"
  ```
  Debe mostrar las variables con placeholders.

  **Commit**: YES (con T1, T3, T4)

- [ ] 3. Verificar `ecosystem.config.cjs`

  **Issue**: SG-04 — ecosystem.config.cjs sin verificar en esta sesión

  **What to do**:
  - Leer `ecosystem.config.cjs` y verificar que contenga:
    - `name: "cermont-backend"` con `script: "backend/dist/server.js"` en puerto 5000
    - `name: "cermont-frontend"` con `script: "node_modules/.bin/next"`, `args: "start"`, puerto 3000
  - Si no existe o tiene errores, corregirlo según el plan de deploy
  - NO cambiar la estructura del archivo si ya es correcta

  **Parallelization**: Wave 1 (con T1, T2, T4)
  **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `ecosystem.config.cjs` existe y tiene las 2 apps configuradas
  - [ ] Las rutas de script son correctas para producción

  **Verification**:
  ```bash
  cat ecosystem.config.cjs
  ```
  Verificar que backend apunta a `backend/dist/server.js` y frontend a `next start`.

  **Commit**: YES (con T1, T2, T4)

- [ ] 4. Verificar configuración CORS

  **Issue**: SG-07 — CORS wildcards en producción

  **What to do**:
  - Localizar la configuración de CORS en backend (buscar `cors()` en `backend/src/index.ts`)
  - Verificar que `CORS_ORIGINS` en backend usa la variable de entorno, no un comodín
  - Verificar que el validador Zod de env rechaza `*` en producción
  - Si hay hardcoded `*`, reemplazar con la variable de entorno
  - NO cambiar la lógica de CORS para desarrollo (localhost debe seguir funcionando)

  **Parallelization**: Wave 1 (con T1, T2, T3)
  **Blocked By**: None

  **References**:
  - `backend/src/index.ts` — Configuración de middlewares CORS
  - `backend/src/config/env.ts` — Validación de CORS_ORIGINS

  **Acceptance Criteria**:
  - [ ] CORS usa `CORS_ORIGINS` desde env variables
  - [ ] En producción, `CORS_ORIGINS` no acepta `*`
  - [ ] Desarrollo local sigue funcionando con localhost

  **Verification**:
  ```bash
  Select-String -Path "backend/src/index.ts" -Pattern "cors|corsOptions|CORS_ORIGINS"
  ```
  Debe mostrar que CORS lee de variable de entorno.

  **Commit**: YES (con T1, T2, T3)

---

- [ ] 5. Fix accesibilidad `DialogContent` — agregar `DialogTitle`

  **Issue**: CR-01 — DialogContent sin DialogTitle (violación WCAG 2.1 AA)

  **What to do**:
  - Buscar TODAS las instancias de `DialogContent` en frontend:
    ```bash
    grep -rn "DialogContent" frontend/src --include="*.tsx" -l
    ```
  - Para cada instancia, verificar si tiene un `DialogTitle` como hijo
  - Donde falte, agregar:
    ```tsx
    import { DialogTitle } from "@/components/ui/dialog";
    import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
    
    <VisuallyHidden.Root>
      <DialogTitle>{título descriptivo}</DialogTitle>
    </VisuallyHidden.Root>
    ```
  - Si el diálogo ya tiene un título visible, solo asegurar que use `DialogTitle`
  - NO cambiar el comportamiento visual ni la funcionalidad

  **Archivo conocido**:
  - `frontend/src/modules/documents/ui/DocumentGallery.tsx` — diálogo de confirmación de borrado

  **Parallelization**: Wave 2 (con T6, T7, T8, T9)
  **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] Ningún `DialogContent` sin `DialogTitle` en frontend
  - [ ] Los títulos ocultos usan `VisuallyHidden.Root`

  **Verification**:
  ```bash
  npm run test -w frontend 2>&1 | Select-String "DialogContent.*requires.*DialogTitle"
  # Debe devolver vacío — sin warnings de a11y
  ```
  También revisar con linter:
  ```bash
  npm run lint -w frontend 2>&1 | Select-String "DialogTitle"
  ```

  **Commit**: YES (con T6, T7, T8, T9)
  - Message: `fix(a11y): add DialogTitle to all DialogContent instances`

- [ ] 6. Re-habilitar 3 tests skipped

  **Issue**: CR-02 — 3 tests marcados como skip en módulos críticos

  **What to do**:
  - Archivos afectados:
    - `frontend/tests/modules/evidences/evidences-page.test.tsx` (2 skipped)
    - `frontend/tests/modules/site-visits/site-visits-new-page.test.tsx` (1 skipped)
  - Leer cada archivo y localizar los bloques `it.skip`, `test.skip`, `xit`, `xtest`
  - Reemplazar `skip` con tests activos
  - Si el skip es por falta de mock de `navigator.geolocation`, agregar en el test o en `vitest.setup.ts`:
    ```typescript
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: vi.fn((success) =>
          success({
            coords: { latitude: 6.23, longitude: -75.59, accuracy: 5 },
            timestamp: Date.now(),
          })
        ),
      },
      mediaDevices: {
        getUserMedia: vi.fn(() => Promise.resolve(new MediaStream())),
      },
    });
    ```
  - Si hay otra razón para el skip, documentar y corregir apropiadamente
  - NO eliminar tests — solo activarlos con los mocks correctos

  **Parallelization**: Wave 2 (con T5, T7, T8, T9)
  **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `evidences-page.test.tsx` — 0 tests skipped
  - [ ] `site-visits-new-page.test.tsx` — 0 tests skipped
  - [ ] Ambos tests pasan: `npm run test -w frontend`

  **Verification**:
  ```bash
  npm run test -w frontend -- tests/modules/evidences/evidences-page.test.tsx --reporter=verbose 2>&1
  npm run test -w frontend -- tests/modules/site-visits/site-visits-new-page.test.tsx --reporter=verbose 2>&1
  ```
  Ambos deben mostrar todos los tests como `✓ PASS` sin `↓ SKIP`.

  **Commit**: YES (con T5, T7, T8, T9)

- [ ] 7. Configurar persistencia de uploads

  **Issue**: SG-05 — Uploads directory no persistente entre deploys

  **What to do**:
  - Verificar si `backend/uploads/` existe y está en `.gitignore`:
    ```bash
    cat .gitignore | Select-String "upload"
    ```
  - Si uploads está en `.gitignore` (lo correcto), crear un mecanismo para que en producción los archivos sean persistentes:
    - Opción A: Crear script `scripts/setup-uploads.sh` que crea el directorio y lo linkea
    - Opción B: Agregar configuración en `ecosystem.config.cjs` para crear el directorio al iniciar
  - Documentar en el archivo cómo se manejarán los uploads en producción
  - NO cambiar `.gitignore` (uploads no deben estar en git)
  - NO incluir archivos binarios en el repo

  **Parallelization**: Wave 2 (con T5, T6, T8, T9)
  **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] Mecanismo de persistencia documentado/implementado
  - [ ] `.gitignore` ignora correctamente `backend/uploads/`

  **Verification**:
  ```bash
  Test-Path backend/uploads || mkdir backend/uploads
  echo "test" | Set-Content backend/uploads/test.txt
  git status backend/uploads/
  # Debe mostrar que uploads/ está ignorado por .gitignore
  ```

  **Commit**: YES (con T5, T6, T8, T9)

- [ ] 8. Verificar SW cache headers

  **Issue**: SG-06 — Service Worker puede causar stale cache

  **What to do**:
  - Localizar la configuración de nginx o proxy para `sw.js`
  - Verificar que existe la directiva:
    ```nginx
    location /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    ```
  - Si el proxy está en `frontend/proxy.ts`, verificar que maneja correctamente los headers del SW
  - Si falta, agregar la configuración en el archivo relevante
  - NO cambiar la lógica de registro del service worker

  **Parallelization**: Wave 2 (con T5, T6, T7, T9)
  **Blocked By**: None

  **References**:
  - `frontend/proxy.ts` — Security perimeter para el frontend
  - `frontend/next.config.ts` — Configuración de Next.js

  **Acceptance Criteria**:
  - [ ] `sw.js` tiene headers `Cache-Control: no-cache, no-store, must-revalidate`

  **Verification**:
  ```bash
  Select-String -Path "frontend/proxy.ts" -Pattern "sw\.js|service.worker|Cache-Control" 2>$null
  Select-String -Path "frontend/next.config.ts" -Pattern "sw\.js|service.worker|Cache-Control" 2>$null
  # Debe encontrar la configuración de cache para sw.js
  ```

  **Commit**: YES (con T5, T6, T7, T9)

- [ ] 9. Configurar Turbo remote cache

  **Issue**: SG-11 — Turbo remote caching desactivado

  **What to do**:
  - Revisar `turbo.json` para la configuración de cache
  - Verificar el output de `npm run build` que muestra "Remote caching disabled"
  - Decidir si habilitar remote cache (requiere Vercel token) o solo optimizar local cache
  - Para remote cache: documentar los pasos en caso de querer habilitarlo después
  - Para local cache: asegurar que `turbo.json` tiene `"cache": true` en las tasks relevantes
  - NO agregar tokens de Vercel al repositorio
  - NO cambiar la configuración de build sin verificar

  **Parallelization**: Wave 2 (con T5, T6, T7, T8)
  **Blocked By**: None

  **References**:
  - `turbo.json` — Configuración de pipelines de Turborepo

  **Acceptance Criteria**:
  - [ ] Configuración de cache revisada y documentada
  - [ ] Local cache habilitado en `turbo.json`

  **Verification**:
  ```bash
  cat turbo.json | ConvertFrom-Json | Select-Object -ExpandProperty pipeline | Get-Member
  ```
  Verificar que las tasks tienen `"cache": true`.

  **Commit**: YES (con T5, T6, T7, T8)

---

- [ ] 10. Expandir smoke tests E2E (63 rutas)

  **Issue**: CR-05 — 63 de 81 rutas sin smoke test

  **What to do**:
  - **Este es el task más grande del plan.** Estimar 3-5 horas de trabajo.
  - Archivo a modificar: `frontend/tests/e2e/page-smoke.spec.ts`
  - Estrategia: Para cada ruta sin cubrir, agregar un test que:
    1. Navegue a la ruta (o intente navegar considerando autenticación)
    2. Verifique que la página carga sin errores (status 200 o redirect esperado)
    3. Capture evidencia del estado de la página
  - Rutas a cubrir (orden por prioridad de negocio):

    **Flujo 14 pasos (alta prioridad):**
    - `/costs`
    - `/proposals/new`
    - `/proposals/[id]`
    - `/planning/[id]`
    - `/execution/[id]`
    - `/reports/[id]`
    - `/delivery-records/[id]`
    - `/service-entry-sheets/[id]`
    - `/invoices/[id]`

    **Administración (alta prioridad):**
    - `/admin/users`
    - `/admin/audit`

    **Rutas restantes (media/baja prioridad):**
    - El resto de rutas identificadas como no cubiertas (52 adicionales)
    - Usar un patrón genérico para rutas con estructura similar

  - Usar autenticación mockeada si las rutas requieren login
  - NO usar datos reales de producción en los tests
  - NO modificar la base de datos durante los tests
  - Si una ruta requiere parámetros dinámicos, usar IDs mock

  **Parallelization**: Wave 3 (secuencial — depende de Wave 1)
  **Blocks**: F2, F3 (quality gates)
  **Blocked By**: T1 (API URL configurada)

  **References**:
  - `frontend/tests/e2e/page-smoke.spec.ts` — Archivo existente con 18 tests
  - `docs/architecture/FRONTEND_ROUTE_MAP.md` — Mapa completo de rutas

  **Acceptance Criteria**:
  - [ ] `page-smoke.spec.ts` contiene tests para 81 rutas (18 existentes + 63 nuevas)
  - [ ] Todos los tests pasan: `npm run test:e2e -w frontend -- tests/e2e/page-smoke.spec.ts`

  **Verification**:
  ```bash
  cd frontend
  npx playwright test tests/e2e/page-smoke.spec.ts --reporter=line 2>&1 | Select-String -Pattern "passed|failed|✓|✗"
  # Debe mostrar todas las rutas pasando
  ```

  **Commit**: YES
  - Message: `test(e2e): add smoke tests for 63 uncovered routes`
  - Files: `frontend/tests/e2e/page-smoke.spec.ts`

---

- [ ] 11. Verificar `npm run build`

  **Issue**: SG-01 — npm run build no verificado en esta sesión

  **What to do**:
  - Ejecutar `npm run build` desde la raíz del monorepo
  - Verificar que:
    - `backend/dist/server.js` existe
    - `frontend/.next/` existe con las rutas compiladas
    - 0 errores de compilación
  - Si hay errores, diagnosticar y corregir
  - NO modificar `next.config.ts` ni `tsconfig.json` a menos que sea necesario para el build

  **Parallelization**: Wave 4 (con T12, T13)
  **Blocked By**: T1, T2, T5, T6 (cambios en frontend/backend deben estar compilados)

  **Acceptance Criteria**:
  - [ ] `npm run build` → exit 0
  - [ ] `backend/dist/server.js` existe
  - [ ] `frontend/.next/` existe

  **Verification**:
  ```bash
  npm run build 2>&1
  # Exit code 0, sin errores
  Test-Path backend/dist/server.js  # True
  Test-Path frontend/.next/BUILD_ID  # True
  ```

  **Commit**: NO (solo verificación)
  - Nota: Si se requieren cambios para que build pase, commitearlos como fix

- [ ] 12. Ejecutar `npm audit fix`

  **Issue**: SG-08 — npm audit no ejecutado

  **What to do**:
  - Ejecutar `npm audit --audit-level=high`
  - Si hay vulnerabilidades high/critical:
    ```bash
    npm audit fix --audit-level=high
    ```
  - Si `audit fix` no resuelve todas, intentar con `--force` (con cuidado)
  - Si no se puede arreglar automáticamente, documentar las vulnerabilidades restantes
  - NO modificar `package.json` manualmente a menos que sea necesario
  - NO ignorar vulnerabilidades sin documentar

  **Parallelization**: Wave 4 (con T11, T13)
  **Blocked By**: Todas las tareas anteriores (para tener el estado final del código)

  **Acceptance Criteria**:
  - [ ] `npm audit --audit-level=high` → 0 high/critical
  - [ ] O, si hay residuales, documentadas con plan de mitigación

  **Verification**:
  ```bash
  npm audit --audit-level=high
  # Output: "found 0 vulnerabilities" o lista documentada
  ```

  **Commit**: YES (si se hicieron cambios)
  - Message: `chore(deps): npm audit fix`

- [ ] 13. Configurar PM2 logrotate

  **Issue**: SG-09 — Logs de PM2 sin rotación

  **What to do**:
  - Crear o actualizar script de configuración para PM2 logrotate
  - Si el VPS tiene `pm2-logrotate` instalado, agregar configuración en `ecosystem.config.cjs` o crear `scripts/pm2-logrotate-setup.sh`:
    ```bash
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 7
    pm2 set pm2-logrotate:compress true
    ```
  - Documentar en el script cómo se ejecuta en el VPS
  - NO ejecutar comandos PM2 (esto se hace en VPS)
  - NO instalar dependencias globales

  **Parallelization**: Wave 4 (con T11, T12)
  **Blocked By**: None (es independiente)

  **Acceptance Criteria**:
  - [ ] Script `scripts/pm2-logrotate-setup.sh` existe con configuración documentada

  **Verification**:
  ```bash
  cat scripts/pm2-logrotate-setup.sh
  # Debe mostrar los comandos de instalación y configuración
  ```

  **Commit**: YES (con T11, T12)
  - Message: `chore: add PM2 logrotate setup script`

---

## Final Verification Wave

### Quality Gates
Después de TODAS las tareas implementadas, ejecutar en orden:

1. **TypeCheck + Lint**:
   ```bash
   npm run typecheck
   npm run lint
   ```

2. **Full Test Suite**:
   ```bash
   npm run test
   ```

3. **E2E Smoke Tests**:
   ```bash
   npm run test:e2e -w frontend -- tests/e2e/page-smoke.spec.ts
   ```

4. **Build**:
   ```bash
   npm run build
   ```

5. **Audit**:
   ```bash
   npm audit --audit-level=high
   ```

### Criterios de Aceptación Final
- [ ] typecheck: 0 errors
- [ ] lint: 0 errors
- [ ] test: 985+ tests pass (ninguno skipped nuevo)
- [ ] test:e2e: todas las rutas nuevas pasan
- [ ] build: exit 0
- [ ] audit: 0 high/critical vulnerabilities

---

## Commit Strategy

- **T1-T4** (Wave 1): `chore(env): add frontend and backend env templates`
- **T5-T9** (Wave 2): `fix(a11y): add DialogTitle to DialogContent instances` + `test: unskip evidence and site-visit tests` + `chore: uploads persistence, SW headers, turbo cache`
- **T10** (Wave 3): `test(e2e): add smoke tests for 63 uncovered routes`
- **T11-T13** (Wave 4): `chore: build verify, npm audit fix, pm2 logrotate`

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck   # 0 errors
npm run lint        # 0 errors
npm run test        # 985+ pass, 0 skipped
npm run test:e2e    # nuevas rutas cubiertas
npm run build       # exit 0
npm audit --audit-level=high  # 0 high/critical
```

### Final Checklist
- [ ] CR-01: No hay DialogContent sin DialogTitle en frontend
- [ ] CR-02: evidences-page.test.tsx y site-visits-new-page.test.tsx sin skip
- [ ] CR-03: frontend/.env.production existe con NEXT_PUBLIC_APP_URL
- [ ] CR-04: backend/.env.example existe con todas las variables
- [ ] CR-05: 63 rutas nuevas con smoke tests E2E
- [ ] SG-01: npm run build pasa
- [ ] SG-04: ecosystem.config.cjs verificado
- [ ] SG-05: uploads persistence configurado
- [ ] SG-06: SW cache headers verificados
- [ ] SG-07: CORS sin comodín en producción
- [ ] SG-08: npm audit sin high/critical
- [ ] SG-09: PM2 logrotate configurado
- [ ] SG-11: Turbo cache config revisado
