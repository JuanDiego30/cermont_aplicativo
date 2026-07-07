# DOC-CANON-02 — Entorno de Desarrollo, Setup y Flujo de Trabajo

**Proyecto:** Cermont S.A.S. — Plataforma documental-operativa
**Version:** v2.1 canónica ampliada para ejecución IA/Codex
**Estado:** SOURCE_OF_TRUTH + ANEXO v2.1 operativo
**Compresion:** DOC-13 + DOC-15 + DOC-16 + DOC-17 + DOC-11

---

## 1. Requisitos Previos

### 1.1 Software Requerido

| Herramienta | Uso | Version Minima |
|---|---|---|
| Node.js | Runtime JavaScript/TypeScript | 22 LTS |
| npm | Package manager | 10.x (viene con Node 22) |
| Docker Desktop | MongoDB y servicios locales | Ultima estable |
| Git | Control de versiones | 2.40+ |
| VS Code / Cursor / Windsurf | Editor de codigo | Ultima estable |
| Navegador Chromium | Pruebas frontend | Ultima estable |

### 1.2 Verificacion Inicial

Antes de instalar, confirmar la estructura del monorepo:

```powershell
# Verificar estructura correcta
git status --short
npm pkg get workspaces
Get-ChildItem .\packages
```

Debe existir:
```text
backend/
frontend/
packages/
```

**No debe existir** (estructura legacy, prohibida):
```text
apps/
apps/backend
apps/frontend
```

---

## 2. Instalacion Limpia

### 2.1 Proceso Completo

```powershell
# Paso 1: Clonar o verificar repositorio
git clone <url-repositorio> cermont_aplicativo
cd cermont_aplicativo

# Paso 2: Verificar estructura (gate inicial)
npm run ghost:check

# Paso 3: Instalar dependencias
npm install
```

### 2.2 Si hay Errores de Red

```powershell
# Error: ECONNRESET, timeout, etc.
npm cache verify
npm install

# Si persiste:
npm cache clean --force
npm install
```

**Prohibido:**
```powershell
npm install --force           # Sin justificacion tecnica
npm install --legacy-peer-deps # Sin ADR aprobado
```

No modificar `package.json` ni `package-lock.json` para resolver errores de conectividad.

---

## 3. Variables de Entorno

### 3.1 Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/cermont
JWT_SECRET=change-me-in-local-development-only
JWT_REFRESH_SECRET=change-me-in-local-refresh-only
FRONTEND_URL=http://localhost:3000

# Almacenamiento
STORAGE_PROVIDER=local
STORAGE_ROOT=/var/cermont/storage
UPLOAD_MAX_SIZE_MB=25
UPLOAD_ALLOWED_MIME_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp

# Logging
LOG_LEVEL=debug
```

### 3.2 Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3.3 Reglas de Seguridad para Variables

- **Nunca** subir secretos reales al repositorio
- **Nunca** guardar credenciales productivas en `.env`
- **Nunca** hardcodear JWT secrets en codigo
- Usar valores seguros en desarrollo, rotar en produccion
- El backend debe validar que `JWT_SECRET` exista al iniciar (fail-fast)

---

## 4. Levantar Servicios Locales

### 4.1 MongoDB con Docker

```powershell
# Opcion A: Solo MongoDB
docker compose up -d mongodb

# Opcion B: Todos los servicios (si hay docker-compose.yml completo)
docker compose up --build

# Verificar
docker ps

# Apagar
docker compose down

# Reset completo (borra datos locales)
docker compose down -v
```

### 4.2 Orden Correcto de Levantado

```powershell
# Terminal 1: Construir paquetes compartidos primero
npm run build -w @cermont/shared-types
npm run build -w @cermont/domain
npm run build -w @cermont/config

# Terminal 2: Backend
npm run dev -w backend
# Esperado: http://localhost:4000

# Terminal 3: Frontend (en otra terminal)
npm run dev -w frontend
# Esperado: http://localhost:3000
```

### 4.3 Smoke Test Local

Abrir y verificar:

| URL | Verificacion |
|---|---|
| `http://localhost:3000/` | Carga sin hydration mismatch |
| `http://localhost:3000/login` | Carga sin errores de consola |
| `http://localhost:3000/dashboard` | Redirige a login si no hay sesion |
| Login con seed user | Funciona auth completo |

Verificar que **no** hay:
- CSS chunk 404
- Warnings de GSAP por targets inexistentes
- Endpoint 404 en notificaciones
- Errores de hydration

---

## 5. Usuario Seed de Desarrollo

Para pruebas locales, el sistema debe crear automaticamente:

```text
Email:    gerencia@cermont.co
Password: Cermont2026!
Rol:      gerente
Status:   active
```

**Reglas:**
- La contrasena se almacena **hasheada** (bcrypt/Argon2)
- Este usuario **solo** existe en seed/desarrollo
- No hardcodear credenciales en frontend
- El login debe probarse por: backend directo, proxy frontend, y UI

### 5.1 Prueba de Login (Backend Directo)

```powershell
$body = @{
  email = "gerencia@cermont.co"
  password = "Cermont2026!"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/api/auth/login" `
  -ContentType "application/json" `
  -Body $body
```

### 5.2 Prueba de Login (via Frontend Proxy)

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/backend/auth/login" `
  -ContentType "application/json" `
  -Body $body
```

---

## 6. Convencion de API

### 6.1 Frontend → Backend

El frontend usa un `apiClient` centralizado con:

```typescript
const API_ROOT = "/api/backend"  // Proxy de Next.js

// Ejemplo de llamada correcta:
apiClient.post("/auth/login", payload)
apiClient.get("/notifications")
apiClient.get("/work-requests")

// INCORRECTO - no duplicar prefijos:
apiClient.post("/api/backend/auth/login", payload)  // Doble prefijo
```

### 6.2 Backend

Las rutas del backend se montan bajo `/api/`:

```text
POST   /api/auth/login
GET    /api/notifications
GET    /api/work-requests
POST   /api/work-requests
GET    /api/work-requests/:id
```

### 6.3 Proxy Next.js

El frontend reenvia automaticamente:

```text
/api/backend/:path*  →  backend /api/:path*
```

---

## 7. Comandos Principales

### 7.1 Gates Globales (desde raiz)

```bash
npm run ghost:check          # Verifica estructura (no apps/)
npm run contracts:check      # Valida contratos API
npm run typecheck            # TypeScript en todos los workspaces
npm run lint                 # Lint en todos los workspaces
npm run test                 # Tests en todos los workspaces
npm run build                # Build de produccion
npm run verify               # Gate completo (todos los anteriores)
npx react-doctor@latest      # Calidad React (solo si cambio frontend)
```

### 7.2 Por Workspace

```bash
# Backend
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend

# Frontend
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npx react-doctor@latest

# Shared Types
npm run typecheck -w @cermont/shared-types
npm run lint -w @cermont/shared-types
npm run test -w @cermont/shared-types
npm run build -w @cermont/shared-types
npm run contracts:check

# Domain
npm run typecheck -w @cermont/domain
npm run lint -w @cermont/domain
npm run test -w @cermont/domain

# Config
npm run typecheck -w @cermont/config
npm run lint -w @cermont/config
```

---

## 8. Flujo Git y Ramas

### 8.1 Principios

1. **No trabajar a ciegas:** Siempre verificar `git status`, rama actual, archivos modificados
2. **No reset global** sin autorizacion explicita (`git reset --hard`, `git checkout .`)
3. **Cambios pequenos por vertical slice:** Un slice = contrato → backend → frontend → test
4. **Todo cambio verificable:** Debe pasar gates antes de merge

### 8.2 Tipos de Ramas

Formato: `<tipo>/<alcance>-<descripcion-corta>`

| Tipo | Uso | Ejemplo |
|---|---|---|
| `feature/` | Nueva capacidad funcional | `feature/work-request-vertical-slice` |
| `fix/` | Correccion de bug | `fix/auth-gerencia-login` |
| `hotfix/` | Correccion urgente produccion | `hotfix/ses-critical-bug` |
| `refactor/` | Mejora interna sin cambio funcional | `refactor/frontend-core-ui` |
| `docs/` | Documentacion | `docs/canonical-documentation` |
| `test/` | Pruebas, fixtures, E2E | `test/e2e-request-to-payment` |
| `design/` | UI/UX visual | `design/cermont-blue-green-ui` |
| `audit/` | Auditoria | `audit/frontend-api-endpoint-matrix` |
| `recovery/` | Recuperacion de estado roto | `recovery/remove-apps-ghost` |

**Prohibidos:** `fix/all`, `refactor/everything`, `final`, `new-version`, `test`, `my-changes`

### 8.3 Ramas Principales

| Rama | Proposito |
|---|---|
| `main` | Codigo estable y desplegable |
| `develop` | Integracion controlada (opcional) |
| `backup/*` | Respaldo temporal antes de cambios riesgosos |

### 8.4 Backup Antes de Recuperaciones

```bash
# Antes de cualquier recuperacion compleja:
git branch backup/<descripcion>-<fecha>
git diff > ../backup-working-tree.patch
git diff --staged > ../backup-staged.patch
```

### 8.5 Convencion de Commits

```text
<tipo>(<alcance>): <descripcion corta>
```

Ejemplos:
```text
docs(architecture): add canonical monorepo blueprint
fix(auth): align login endpoint with frontend proxy
feature(work-requests): add request intake vertical slice
refactor(ui): centralize Cermont blue green tokens
test(frontend): add sidebar route matrix tests
```

Tipos: `docs`, `fix`, `feature`, `refactor`, `test`, `chore`, `design`, `security`, `perf`, `recovery`

### 8.6 Plantilla de Pull Request

Cada PR debe incluir:

```markdown
## Objetivo
Descripcion del problema y solucion.

## Alcance
- [ ] backend
- [ ] frontend
- [ ] packages/shared-types
- [ ] docs
- [ ] tests

## Reglas Cermont Verificadas
- [ ] No `apps/*`
- [ ] No duplicados
- [ ] No componentes gigantes
- [ ] No endpoints huerfanos
- [ ] No rutas 404 visibles
- [ ] No mocks en produccion
- [ ] No `any`
- [ ] No `unknown` como escape

## Gates Ejecutados
| Gate | Estado |
|---|---|
| ghost:check | PASS/FAIL |
| contracts:check | PASS/FAIL |
| typecheck | PASS/FAIL |
| lint | PASS/FAIL |
| test | PASS/FAIL |
| build | PASS/FAIL |
| verify | PASS/FAIL |
| React Doctor | PASS/FAIL |

## Evidencia
- Rutas probadas:
- Endpoints probados:
```

### 8.7 Checklist Antes de Merge

- [ ] `git status --short` revisado
- [ ] No hay cambios accidentales
- [ ] No hay `apps/*`
- [ ] No hay `package-lock.json` modificado sin justificacion
- [ ] No hay `any` ni `unknown` como escape
- [ ] No hay direct fetch en componentes
- [ ] No hay mocks en produccion
- [ ] No hay rutas visibles con 404
- [ ] Documentacion actualizada
- [ ] Tests agregados/actualizados
- [ ] Gates completos ejecutados
- [ ] React Doctor ejecutado si toco frontend
- [ ] Reporte en `docs/audits/` creado si aplica

---

## 9. Estrategia de Testing

### 9.1 Principios

- **Test Before Refactor:** Ejecutar baseline antes y despues del cambio
- **Contract-First Testing:** Todo endpoint tiene schema Zod → test de contrato → test de endpoint
- **Vertical Slice Testing:** Cada funcionalidad se valida como slice completo
- **No Mock Data in Production:** Mocks solo en `*.test.ts`, `tests/**`, `fixtures/**`

### 9.2 Tipos de Pruebas

#### A. Pruebas de Contrato (`packages/shared-types`)

Validan que los schemas Zod esten alineados:

```bash
npm run typecheck -w @cermont/shared-types
npm run test -w @cermont/shared-types
npm run build -w @cermont/shared-types
npm run contracts:check
```

Deben cubrir: `ApiEnvelope<T>`, roles RBAC, payloads de auth, todas las entidades de negocio.

#### B. Pruebas Backend

Validan rutas, servicios, comandos, RBAC, auditoria, errores, persistencia:

```bash
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
```

Cada endpoint debe probar:
- Happy path (caso de exito)
- Validacion fallida (Zod)
- Unauthorized (401)
- Forbidden (403, RBAC)
- Not found (404)
- Domain conflict (409)
- Audit event generado
- Idempotencia si aplica

#### C. Pruebas Frontend

Validan render, hooks, apiClient, estados UI, formularios, navegacion, accesibilidad:

```bash
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
npm run build -w frontend
npx react-doctor@latest
```

Cada pagina debe probar:
- Render de la pagina
- Estado loading
- Estado error
- Estado empty
- Estado offline si aplica
- Estados de forbidden
- Submit deshabilitado durante mutation
- No direct fetch
- Rutas del sidebar no 404

#### D. Pruebas de Rutas Frontend

Debe existir una prueba que valide que todo `href` visible del sidebar tiene pagina:

```text
/dashboard
/work-requests
/proposals
/orders
/planning
/execution
/evidences
/reports
/delivery-records
/documents
/costs
/billing
/billing/ses
/billing/invoices
/payments
/assets
/maintenance
/users
/settings
```

#### E. Pruebas E2E Criticas

Flujos minimos a automatizar:

1. **Login y Dashboard:**
   ```text
   /login → ingresar credenciales → submit → /dashboard → auth/me OK
   ```

2. **Flujo Operativo Completo:**
   ```text
   Crear WorkRequest → Calificar → Convertir a Proposal → Aprobar Proposal
   → Registrar PO → Convertir a WorkOrder → Aprobar PlanningPacket
   → Iniciar ExecutionSession → Agregar Evidence → Finalizar ejecucion
   → Generar TechnicalReport → Aprobar TechnicalReport
   → Crear DeliveryRecord → Firmar DeliveryRecord
   → Crear SES → Aprobar SES
   → Crear Invoice → Registrar Payment
   ```

3. **Flujo Documental:**
   ```text
   Subir formato → Detectar campos → Revisar campos → Publicar plantilla
   → Diligenciar formulario → Adjuntar foto → Firmar → Generar documento
   ```

4. **Flujo de Costos:**
   ```text
   Crear propuesta con baseline → Crear orden → Agregar costos reales
   → Comparar variacion → Mostrar dashboard
   ```

### 9.3 React Doctor (Gate de Calidad Frontend)

```bash
npx react-doctor@latest
```

Criterio:
- **Ideal:** 100/100
- **Aceptable temporal:** >= 95/100 con residuales documentados que no sean correctness/accessibility/security

No se aceptan issues de:
- Hydration mismatch
- `new Date()` o `Math.random()` en render
- Falta de reduced motion
- `useSearchParams` sin `Suspense`
- Direct fetch en componentes
- Componentes dead o gigantes

### 9.4 Convenciones de Nombres de Tests

```text
# Backend
backend/tests/integration/<module>.test.ts
backend/tests/services/<service>.test.ts
backend/tests/common/<middleware>.test.ts

# Frontend
frontend/tests/components/<Component>.test.tsx
frontend/tests/lib/<helper>.test.ts
frontend/tests/e2e/<flow>.spec.ts

# Shared Types
packages/shared-types/tests/schemas/<schema>.test.ts
packages/shared-types/tests/contracts/api-contracts.snapshot.test.ts
```

---

## 10. Seed de Datos Demo

### 10.1 Proposito

El seed no es decorativo. Debe representar el flujo real de negocio y permitir validar el aplicativo de punta a punta.

### 10.2 Principios

1. **Datos demo, no mocks de produccion**
2. **Seed alineado al dominio** — cada dato existe para validar una historia de negocio
3. **Repetible e idempotente** — ejecutar varias veces no crea duplicados
4. **Seguro** — sin secretos reales, documentos privados ni credenciales productivas
5. **Contract-first** — todo dato seed cumple los esquemas de `packages/shared-types`
6. **Sin datos huerfanos** — toda entidad esta relacionada con un flujo entendible

### 10.3 Usuarios Seed Minimos

| Email | Rol | Proposito |
|---|---|---|
| `gerencia@cermont.co` | `gerente` | Validacion general, dashboard, configuracion |
| `administrativo@cermont.co` | `administrativo` | SES, facturacion, pagos, documentos |
| `supervisor@cermont.co` | `supervisor` | Planeacion, ejecucion, reportes, actas |
| `tecnico@cermont.co` | `tecnico` | Ejecucion en campo, evidencias, formularios offline |
| `hes@cermont.co` | `hes` | HSE, permisos, AST/PTW, inspecciones |
| `cliente.demo@empresa.com` | `cliente` | Firma/recibo, revision de entregables |

Password para todos en desarrollo: `Cermont2026!` (almacenado hasheado)

### 10.4 Casos de Servicio Demo (ServiceCases)

El seed debe crear al menos 6 casos cubriendo estados del pipeline:

| # | Caso | Estado | Datos Minimos |
|---|---|---|---|
| 1 | Solicitud pendiente | `submitted` | WorkRequest, cliente, sitio, urgencia |
| 2 | Propuesta pendiente | `proposal_submitted` | WorkRequest calificada, Proposal con baseline |
| 3 | Orden en planeacion | `planning_pending` | WorkOrder, PlanningPacket con blockers |
| 4 | Ejecucion en campo | `in_progress` | ExecutionSession, evidencias, materiales |
| 5 | Cierre tecnico | `technical_closure` | TechnicalReport, DeliveryRecord, firma |
| 6 | Cierre administrativo | `admin_closure` | SES, Invoice, Payment reconciliado |

### 10.5 Plantillas Documentales Demo

El seed incluye datos para:

- **Planeacion de obra:** responsable, lugar, fecha, materiales, herramientas, equipos, elementos de seguridad, firmas
- **Inspeccion de linea de vida vertical:** caracteristicas, fabricante, condicion C/NC, hallazgos, fotos
- **Mantenimiento CCTV:** camara, rutina, sistema electrico, fotos antes/despues
- **Registro fotografico:** componente, descripcion, foto antes/despues, observacion

### 10.6 Datos de Costos Demo

Categorias configurables:
```text
material, labor, tool, equipment, transport, subcontract, administrative, tax, contingency
```

Ejemplo de catalogo demo:

| Categoria | Item | Unidad |
|---|---|---|
| material | Cable electrico demo | metro |
| labor | Tecnico electricista | hora |
| equipment | Camioneta operativa | dia |
| tool | Taladro percutor | dia |

**Reglas:**
- No fijar precios reales de Cermont
- No inventar impuestos obligatorios
- IVA, retenciones deben ser configurables

### 10.7 Comandos de Seed

```bash
npm run seed -w backend           # Seed completo
npm run seed:reset -w backend     # Reset de datos demo
npm run seed:demo -w backend      # Solo datos demo
npm run seed:test -w backend      # Datos para tests
```

### 10.8 Validacion Post-Seed

Despues de ejecutar seed, validar manualmente:

1. Login con `gerencia@cermont.co` funciona
2. Dashboard carga con datos
3. Sidebar no apunta a 404
4. `/work-requests` muestra datos o empty state real
5. `/orders` muestra ordenes demo
6. `/documents` muestra plantillas
7. `/costs` muestra catalogo
8. No hay errores de consola
9. React Doctor no baja

---

## 11. Diagnostico de Errores Frecuentes

### 11.1 `npm install` falla con ECONNRESET

**Causa:** Red inestable, proxy, registry temporalmente fallando
**Solucion:**
```powershell
npm cache verify
npm install
```
No modificar dependencias.

### 11.2 `apps/backend` o `apps/frontend` vuelve a aparecer

**Causa:** Documentacion vieja, script viejo, agente revirtio cambios
**Solucion:**
```powershell
npm run ghost:check
git status --short
rg "apps/backend|apps/frontend" .
```
Corregir referencias, no recrear carpetas.

### 11.3 Login da 404

**Causa:** Frontend llama ruta incorrecta, proxy mal configurado, backend no monta auth route
**Solucion:**
```powershell
rg "auth/login|API_ROOT|api/backend|api/auth" frontend backend packages
```
Probar backend directo y proxy.

### 11.4 Refresh da 401

**Causa:** Normal si no hay cookie/sesion activa
**Solucion:** Tratar como sesion ausente, no como error critico de runtime.

### 11.5 CSS chunk 404

**Causa:** Cache vieja de `.next`, service worker cacheando, build stale
**Solucion:**
```powershell
Remove-Item -Recurse -Force .\frontend\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\.turbo -ErrorAction SilentlyContinue
npm run build -w frontend
```

### 11.6 Hydration Mismatch

**Causa:** `Date.now()` en render, `new Date()` en JSX, `Math.random()` en render, `localStorage` antes de mount
**Solucion:**
- Usar `useEffect`/estado `mounted` para UI client-only
- Usar `useSyncExternalStore` para estado externo
- No renderizar datos volatiles en SSR sin snapshot

### 11.7 React Doctor falla por reduced motion

Agregar en CSS global:
```css
@media (prefers-reduced-motion: reduce) {
  html:focus-within { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    transition-duration: 0.01ms;
  }
}
```

---

## 12. Onboarding para Agentes/Desarrolladores

### 12.1 Documentos a Leer ANTES de Programar

1. `docs/README.md`
2. `docs/product/CERMONT_PRODUCT_BLUEPRINT.md`
3. `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`
4. `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md`
5. `docs/architecture/FRONTEND_ROUTE_MAP.md`
6. `docs/architecture/API_ENDPOINT_MATRIX.md`
7. `docs/product/DOCUMENT_DRIVEN_FORMS_SPEC.md`
8. `docs/product/COST_ENGINE_SPEC.md`
9. `docs/design/CERMONT_UIUX_GUIDE.md`
10. `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md`

### 12.2 Flujo de Trabajo para Cambios

#### Cambios Backend
1. Revisar contrato en `packages/shared-types`
2. Agregar/actualizar schema Zod
3. Implementar endpoint backend (route → controller → service)
4. Agregar tests backend
5. Ejecutar gates del backend
6. Ejecutar gates globales

#### Cambios Frontend
1. Revisar ruta en `FRONTEND_ROUTE_MAP`
2. Revisar endpoint en `API_ENDPOINT_MATRIX`
3. Usar `apiClient` y TanStack Query
4. Implementar estados loading/error/empty/offline
5. Validar accesibilidad
6. Ejecutar React Doctor
7. Ejecutar gates frontend y globales

#### Cambios Document-Driven
1. Revisar `DOCUMENT_DRIVEN_FORMS_SPEC`
2. Definir contrato
3. Implementar ingesta
4. Implementar revision de campos
5. Implementar plantilla versionada
6. Implementar runtime form
7. Implementar generacion de documento
8. Agregar tests y E2E

#### Cambios de Costos
1. Revisar `COST_ENGINE_SPEC`
2. Definir categoria configurable
3. Evitar impuestos hardcodeados
4. Conectar con propuesta/orden/ejecucion
5. Agregar soporte/evidencia
6. Comparar costo real vs propuesta
7. Agregar tests

---

## 13. Criterio de Entorno Listo

El entorno local se considera listo cuando:

```powershell
npm run ghost:check       # PASS
npm run contracts:check   # PASS
npm run typecheck         # PASS (todos los workspaces)
npm run lint              # PASS (todos los workspaces)
npm run test              # PASS (todos los workspaces)
npm run build             # PASS (todos los workspaces)
npm run verify            # PASS
npx react-doctor@latest   # 100/100 o >= 95 con residuales justificados
```

Y manualmente:
- `/` carga sin hydration mismatch
- `/login` carga sin errores
- Login con `gerencia@cermont.co` funciona
- `/dashboard` muestra datos
- Sidebar no apunta a 404
- No hay errores de consola

---

## 14. Flujo de Ejecucion por Fases (Plan de Implementacion)

El desarrollo se organiza en fases incrementales, cada una entregando valor funcional:

### Fase 0: Fundacion (Semanas 1-2)
- [ ] Setup del monorepo con npm workspaces
- [ ] Configuracion de TypeScript, Biome, Tailwind
- [ ] Estructura de carpetas backend + frontend + packages
- [ ] Docker Compose con MongoDB
- [ ] Sistema de variables de entorno
- [ ] Gate `npm run verify` funcional
- [ ] Documentacion canonica base

### Fase 1: Autenticacion (Semana 3)
- [ ] Modelo User con roles (Mongoose)
- [ ] Endpoints: login, refresh, logout, me
- [ ] JWT en cookies httpOnly + memoria
- [ ] Middleware de autenticacion y RBAC
- [ ] Pagina de login en frontend
- [ ] Zustand store de autenticacion
- [ ] Proteccion de rutas
- [ ] Seed de usuarios

### Fase 2: Solicitudes y Propuestas (Semanas 4-5)
- [ ] CRUD WorkRequest con FSM
- [ ] Calificacion de solicitudes
- [ ] CRUD Proposal con baseline de costos
- [ ] Aprobacion/rechazo de propuestas
- [ ] Registro de Purchase Order
- [ ] Conversion de propuesta a orden

### Fase 3: Ordenes y Planeacion (Semanas 6-7)
- [ ] CRUD WorkOrder
- [ ] PlanningPacket con readiness
- [ ] Verificacion de blockers (herramientas, personal, certificados)
- [ ] AST/PTW
- [ ] Aprobacion de planeacion

### Fase 4: Ejecucion y Evidencias (Semanas 8-9)
- [ ] ExecutionSession (inicio/fin)
- [ ] Captura de evidencias (fotos, firmas, GPS)
- [ ] Soporte offline con IndexedDB
- [ ] Sincronizacion outbox
- [ ] Materiales usados
- [ ] Finalizacion de ejecucion

### Fase 5: Informes y Actas (Semanas 10-11)
- [ ] Generacion de TechnicalReport desde ejecucion
- [ ] Aprobacion de informes
- [ ] Creacion de DeliveryRecord
- [ ] Firma de actas

### Fase 6: Cierre Administrativo (Semanas 12-13)
- [ ] Service Entry Sheet (SES)
- [ ] Invoice contra SES aprobada
- [ ] Payment con conciliacion
- [ ] Pipeline completo validado

### Fase 7: Dashboard y Costos (Semanas 14-15)
- [ ] Dashboard con KPIs
- [ ] Blockers y next actions
- [ ] Cost Cart con variacion vs propuesta
- [ ] Aging de cartera

### Fase 8: Sistema Documental (Semanas 16-17)
- [ ] Ingesta de documentos (PDF/Excel/Word)
- [ ] Deteccion de campos
- [ ] Revision humana y builder de plantillas
- [ ] Formularios dinamicos online/offline
- [ ] Generacion de documentos

### Fase 9: Activos y Mantenimiento (Semanas 18-19)
- [ ] CRUD de activos (vehiculos, herramientas, equipos)
- [ ] Certificados con vencimiento
- [ ] Alertas de certificados proximos a vencer
- [ ] Plan de mantenimiento preventivo

### Fase 10: PWA y Optimizacion (Semanas 20-21)
- [ ] Service Worker completo
- [ ] Estrategias de cache avanzadas
- [ ] Background sync
- [ ] Tests E2E de flujos criticos
- [ ] Optimizacion de performance
- [ ] Despliegue en VPS con Docker

### Fase 11: Observabilidad y Monitoreo (Semanas 22-23)
- [ ] Logging estructurado completo
- [ ] Metricas de negocio y tecnicas
- [ ] Dashboard de monitoreo
- [ ] Alertas configurables

### Fase 12: Estabilizacion y Entrega (Semanas 24-25)
- [ ] Auditoria completa del sistema
- [ ] Correccion de bugs
- [ ] Documentacion final
- [ ] Capacitacion de usuarios
- [ ] Pruebas piloto con 5 usuarios durante 2 semanas
- [ ] Medicion de KPIs: reduccion de tiempos, mejora de trazabilidad, eficiencia de cierre
---

# ANEXO v2.1 — Cierre de puntos ciegos para agentes IA/Codex

> **Prevalencia normativa:** si alguna sección anterior de este documento contradice este anexo, prevalece el **ANEXO v2.1**.  
> **Propósito:** convertir la documentación canónica en un plano arquitectónico ejecutable, verificable y sin ambigüedades para agentes IA/Codex.  
> **Regla base:** ningún agente puede declarar una función como implementada si no aporta **archivo + endpoint/contrato/componente + prueba + evidencia**.


## 1. Recuperación segura Git

Durante recuperación o sincronización de ramas, está prohibido ejecutar:

```bash
git reset --hard
git clean -fd
git clean -fdx
git checkout -f
git push --force
npm run clean
npm run clean:hard
docker compose down -v
```

Procedimiento obligatorio:

1. Hacer backup físico de la carpeta local.
2. Clonar rama remota en carpeta nueva.
3. Comparar `package.json`, `package-lock.json`, `turbo.json`, `biome.json`, `tsconfig.json`, `packages/`, `backend/`, `frontend/`.
4. Ejecutar `npm pkg get workspaces`.
5. Ejecutar `npm install`.
6. Ejecutar `npm run typecheck` y `npm run build`.
7. Solo después reemplazar o fusionar.

## 2. Archivos que sí deben versionarse

Nunca ignorar globalmente:

```gitignore
*.json
```

Deben versionarse siempre:

```text
package.json
package-lock.json
turbo.json
tsconfig.json
tsconfig.base.json
biome.json
backend/package.json
backend/tsconfig.json
frontend/package.json
frontend/tsconfig.json
packages/*/package.json
packages/*/tsconfig.json
packages/shared-types/contracts/*.json
```

No deben versionarse:

```text
.env
.env.local
node_modules/
.next/
dist/
coverage/
uploads/
logs/
storage/
```

## 3. Diagnóstico de corrupción de codificación

Buscar caracteres corruptos:

```bash
rg "â|Ã|Â|�|├|┬|└|┐|┤|┼" package.json backend frontend packages docs tooling scripts
```

Si aparece texto como `Gestiâ...n`, corregirlo y validar JSON:

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"
```

## 4. Evidencia mínima por tarea

Cada tarea debe guardar evidencia en:

```text
.sisyphus/evidence/<plan>/<fase>/
```

Con archivos:

```text
baseline.md
typecheck.txt
lint.txt
test.txt
build.txt
verify.txt
react-doctor.txt
curl/
playwright/
screenshots/
```

## 5. Flujo de trabajo recomendado

1. `git status --short`
2. `npm run contracts:check`
3. `npm run typecheck`
4. `npm run lint`
5. `npm run test`
6. `npm run build`
7. `npm run quality:strict`
8. `npm run verify`
9. `npx react-doctor@latest`
10. Playwright/curl cuando el cambio afecte UI/API.

Si falla un gate, no avanzar a refactor funcional.
