# BASELINE TÉCNICO — CERMONT S.A.S.
## Fecha: 2026-05-23 | Fase 0 del Protocolo de Auditoría

---

## 1. GATES CI/CD EJECUTADOS

### `npm run typecheck` — Turbo (todos los workspaces)

```
@cermont/shared-types:typecheck: ✅ 0 errores
@cermont/domain:typecheck:       ✅ 0 errores
@cermont/config:typecheck:       ✅ 0 errores
frontend:typecheck:               ✅ 0 errores
backend:typecheck:                ✅ 0 errores

Tasks: 8 successful, 8 total | Cached: 8 cached | Time: 157ms FULL TURBO
```
**Estado: ✅ PASA — 0 errores TypeScript en todos los workspaces**

---

### `npm run lint` — Biome 2.x

```
backend:lint: 26 warnings encontrados
- Causa principal: `any` en tool.service.ts (línea 171: updateTool retorna Promise<any>)
- 6 diagnósticos adicionales no mostrados (límite max-diagnostics)
- 0 errores críticos
- Checked 230 files in 478ms

Tasks: 8 successful, 8 total | Time: 158ms FULL TURBO
```
**Estado: ⚠️ PASA con advertencias — No bloquea CI, pero `any` es violación de principios CERMONT**

---

### `npm run build` — Turborepo + Next.js

```
frontend:build: ✅ Compilación exitosa
- Rutas estáticas (○): /unauthorized, /sitemap.xml
- Rutas dinámicas (ƒ): /service-cases/[id], /work-requests, /planning, /execution, etc.
- Proxy (Middleware): proxy.ts activo ✅

Rutas verificadas en build:
  /work-requests ✅  /work-requests/[id] ✅  /work-requests/new ✅
  /site-visits ✅   /site-visits/[id] ✅    /site-visits/new ✅
  /service-cases/[id] ✅
  /planning ✅      /planning/[id] ✅
  /execution ✅     /execution/[id] ✅
  /resources/kits ✅ /resources/kits/new ✅
  /templates ✅     /templates/[id] ✅

backend:build: ✅ Compilación exitosa (TypeScript → dist/)

Tasks: 5 successful, 5 total | Cached: 4 cached | Time: 48.867s
```
**Estado: ✅ PASA — Build limpio, sin errores de compilación**

---

### `npm run test` — Vitest

```
backend:test:
  ✅ pdf-generator.service.test.ts    (4 tests)   249ms
  ✅ user.service.test.ts             (3 tests)   7ms
  ✅ checklist.service.test.ts        (15 tests)  66ms
  ✅ report.service.test.ts           (5 tests)   15ms
  ✅ cost.service.test.ts             (6 tests)   21ms
  ✅ work-request.test.ts             (5 tests)   9ms
  ✅ error-metrics.test.ts            (1 test)    9ms
  ✅ proposal.service.test.ts         (11 tests)  26ms
  ✅ purchase-order.service.test.ts   (4 tests)   13ms
  ✅ authorize.middleware.test.ts     (5 tests)   10ms
  ✅ mapping.test.ts                  (3 tests)   6ms

@cermont/shared-types:test:
  ❌ api-contracts.snapshot.test.ts   (1 FALLO)
  ✅ 80 tests pasando
  
  Causa del fallo:
    Enum `OrderServiceType` tiene valor "other" en la implementación
    pero el snapshot committed NO incluye "other".
    Diff:
    - "decommission"
    + "decommission",
    + "other"
    
    → El snapshot fue comprometido antes de añadir el valor "other"
    → Solución: npm run test -- --update-snapshots en shared-types

Tasks: 3 successful, 6 total | Failed: @cermont/shared-types#test | Time: 8.199s
```
**Estado: ⚠️ PARCIAL — Backend 100% verde. Shared-types tiene 1 snapshot desactualizado (no es falla de lógica)**

---

## 2. ESTADO DE ARCHIVOS CLAVE

### Estructura del Monorepo

```
cermont_aplicativo/
├── backend/                  ✅ Express 5.2.1 + Mongoose
│   └── src/
│       ├── controllers/      39 controllers
│       ├── services/         41 services  
│       ├── models/           37 models
│       ├── routes/           46 route files
│       ├── middlewares/      (verificar)
│       └── index.ts          Configuración principal
├── frontend/                 ✅ Next.js 16.2.4
│   └── src/
│       ├── app/              App Router
│       │   ├── (auth)/       Login, register
│       │   └── (dashboard)/  22 sub-rutas
│       ├── modules/          29 módulos feature-based
│       ├── lib/              http, offline, theme, form
│       ├── store/            Zustand (auth, ui)
│       └── components/       Shared components
├── packages/
│   ├── shared-types/         Zod schemas, interfaces, workflow
│   ├── domain/               RBAC, reglas de negocio
│   └── config/               Configuración compartida
├── proxy.ts                  ✅ RBAC proxy (no middleware.ts)
├── biome.json                ✅ Lint/format config
├── turbo.json                ✅ Turborepo pipeline
└── package.json              ✅ npm workspaces
```

---

## 3. PATRONES CRÍTICOS DETECTADOS EN BASELINE

### 🔴 CRÍTICO: Snapshot desactualizado

```
Archivo: packages/shared-types/tests/contracts/api-contracts.snapshot.test.ts
Problema: El snapshot no refleja el enum "other" añadido a OrderServiceType
Impacto: CI falla en @cermont/shared-types#test
Acción: npm run test -- --update-snapshots (en shared-types)
```

### 🟡 ADVERTENCIA: `any` en tool.service.ts

```
Archivo: backend/src/services/tool.service.ts línea 171
Código:  export async function updateTool(id: string, data: UpdateToolDto, userId: string): Promise<any>
Problema: Uso de `any` como tipo de retorno — viola principios CERMONT
Biome: 26 warnings (no bloquea build pero indica deuda)
Acción: Tipar correctamente el retorno
```

### 🟡 ADVERTENCIA: `localStorage` en uso legítimo/no legítimo

```
Detectado en:
- lib/form/index.tsx          → Draft forms (no tokens) ✅ aceptable
- lib/offline/sync-queue.ts   → Cola offline (fallback de IndexedDB) ✅ aceptable  
- lib/theme/ThemeProvider.tsx → Preferencia de tema ✅ aceptable
- store/ui.store.ts           → Tema UI ✅ aceptable
- store/auth.store.ts         → Comentario confirma: tokens SOLO en memoria ✅

Conclusión: localStorage NO se usa para tokens JWT/refresh → CONFORME
```

### ✅ CORRECTO: No hay try/catch en controllers

```
Búsqueda: grep "try {" en backend/src/controllers/
Resultado: 0 matches
Conclusión: Todos los controllers usan async/await directo
Express 5 propaga errores automáticamente al error handler global → CONFORME
```

### ✅ CORRECTO: proxy.ts reemplaza middleware.ts

```
frontend/proxy.ts:    EXISTE ✅
frontend/middleware.ts: NO EXISTE ✅  
Conclusión: RBAC implementado correctamente via proxy.ts → CONFORME
```

---

## 4. ARCHIVOS PROBLEMA IDENTIFICADOS EN RAÍZ

El directorio raíz contiene **154 archivos**, de los cuales muchos son logs, outputs y archivos temporales que **no deben estar en el repositorio**:

| Archivo | Problema |
|---------|---------|
| `*.log` (20+ archivos) | Logs de desarrollo commiteados |
| `*-output.txt`, `*-baseline.txt` | Outputs de comandos commiteados |
| `add-route.js`, `add_wr.js`, `addwr.js` | Scripts ad-hoc en raíz |
| `fix.js`, `fix2.js`, `fix-rbac-roles.js` | Fix scripts sin estructura |
| `test.js`, `test-endpoints.js` | Scripts de prueba sin estructura |
| `frontend_*.mjs` | Scripts de parche sin estructura |
| `frontend-test-evidence.txt`, `test-evidence.txt` | Evidencias manuales commiteadas |

**Acción requerida:** Mover a `scripts/`, `tmp/` o `.gitignore`

---

## 5. RESUMEN BASELINE

| Gate | Estado | Detalle |
|------|--------|---------|
| typecheck | ✅ PASA | 0 errores en 8 workspaces |
| lint | ⚠️ ADVIERTE | 26 warnings Biome (any en tool.service) |
| build | ✅ PASA | Frontend y backend compilan |
| test | ⚠️ PARCIAL | 1 snapshot desactualizado en shared-types |
| Seguridad básica | ✅ | Helmet, CORS, rate-limit, cookies HttpOnly |
| proxy.ts | ✅ | RBAC activo, middleware.ts ausente |
| Estructura | ⚠️ | Raíz con 154 archivos (muchos son basura de dev) |

---

*Siguiente: [02-FUENTE-DE-VERDAD.md](./02-FUENTE-DE-VERDAD.md)*
