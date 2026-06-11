# Auditoría Docker Runtime — CERMONT S.A.S.

**Fecha:** 2026-06-09  
**Auditor:** Sisyphus (automated)  
**Propósito:** FASE 0 (reproducir errores) + FASE 1 (verificar config Next.js)

---

## 1. Ambiente probado

| Variable | Valor |
|---|---|
| SO host | Windows (PowerShell 7) |
| Node | v24.12.0 |
| npm | 11.15.0 |
| Docker | 29.5.3 |
| Docker Compose | v5.1.4 |
| Rama | `audit/business-logic-state` |
| Commit HEAD | `0e07091` |
| Contenedor frontend | `cermont_aplicativo-frontend` (401MB), corriendo `next-server v16.2.7` |
| Contenedor backend | `cermont_aplicativo-backend` (940MB) |
| Contenedor nginx | `nginx:1.25-alpine` (puerto 8081) |
| Contenedor mongodb | `mongo:7.0` |

---

## 2. Errores reproducidos

| # | Error | URL | Status HTTP | Reproducido | Causa probable | Evidencia | Archivo relacionado | Prioridad |
|---|---|---|---|---|---|---|---|---|
| 1 | manifest.json no servido | `http://localhost:3000/manifest.json` | 404 | ✅ curl | `public/` copiado a ruta incorrecta en Dockerfile | `curl -I` → 404 + HTML page | `frontend/Dockerfile` | 🔴 Alta |
| 2 | favicon.ico no servido | `http://localhost:3000/favicon.ico` | 404 | ✅ curl | Misma causa #1 | `curl -I` → 404 | `frontend/Dockerfile` | 🔴 Alta |
| 3 | Imágenes landing no servidas | `http://localhost:3000/images/optimized/landing/*.webp` | 404 | ✅ curl | Misma causa #1 | `curl -I` → 404; logs: "requested resource isn't a valid image...received null" | `frontend/Dockerfile` | 🔴 Alta |
| 4 | `_next/image` 400 | `/_next/image?url=/images/...&w=1920&q=75` | 400 | ✅ logs frontend | `images.unoptimized: false` en baked config (no se aplicó `true` de `next.config.ts`) | Logs contenedor muestran error repetitivo | `frontend/next.config.ts`, `withSerwist` wrapper | 🔴 Alta |
| 5 | Chunks 404 | `/_next/static/chunks/*.js`, `/*.css` | 404 | ✅ curl | `.next/static/` copiado a ruta incorrecta en Dockerfile | `curl -I` → 404; chunks existen en `/app/frontend/.next/static/` pero NO en `/app/app/frontend/.next/static/` | `frontend/Dockerfile` | 🔴 Alta |
| 6 | Root page carga OK | `http://localhost:3000/` | 200 | ✅ curl | — | `curl -I` → 200, HTML renders | — | ✅ Sin error |

---

## 3. Causa raíz confirmada

### Causa #1 (errores 1, 2, 3, 5): Dockerfile copia assets a rutas incorrectas para standalone

El `frontend/Dockerfile` actual:

```dockerfile
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public
```

Esto produce esta estructura en el contenedor:

```
/app/
├── app/frontend/              ← CWD del servidor standalone (process.chdir(__dirname))
│   ├── server.js
│   ├── .next/                 ← manifiestos, server files (NO static/)
│   └── package.json
├── frontend/                  ← ASSETS AQUÍ, PERO SERVER NO MIRA AQUÍ
│   ├── .next/static/chunks/   ← los chunks SÍ existen
│   └── public/                ← manifest, favicon, imágenes SÍ existen
└── package.json
```

El servidor standalone ejecuta `process.chdir(__dirname)` donde `__dirname` = `/app/app/frontend/`.  
Next.js busca `public/` y `.next/static/` **relativo a ese directorio**:

- `/app/app/frontend/public/` ❌ **NO EXISTE**
- `/app/app/frontend/.next/static/` ❌ **NO EXISTE**

**Solución:** Cambiar las rutas de copia en el Dockerfile:

```dockerfile
COPY --from=builder /app/frontend/.next/static ./app/frontend/.next/static
COPY --from=builder /app/frontend/public ./app/frontend/public
```

### Causa #2 (error 4): `images.unoptimized: true` no está aplicado en la baked config

El archivo `required-server-files.json` dentro del contenedor (bakeado en `server.js`) contiene:

```json
"images": { "unoptimized": false, ... }
```

A pesar de que el `next.config.ts` actual tiene `unoptimized: true`. Causas posibles:

1. La build de Docker se hizo con una versión anterior de `next.config.ts` (antes del cambio)
2. El wrapper `withSerwist` de `@serwist/turbopack` está sobreescribiendo la configuración de `images`
3. Reconstruir con `--no-cache` + verificar si `withSerwist` modifica la config

---

## 4. Hipótesis descartadas

| Hipótesis | Resultado | Evidencia |
|---|---|---|
| H1: `images.unoptimized` no aplicado | **CONFIRMADO** — `false` en baked config | `required-server-files.json` dentro del contenedor |
| H2: Assets no existen en contenedor | **RECHAZADO** — SÍ existen en `/app/frontend/public/` | `find` dentro del contenedor los encontró |
| H3: Service Worker sirve versión vieja | **NO APLICA** — SW solo activo en producción vía SerwistProvider; errores ocurren en curl sin navegador | SW no interfiere en requests directas |
| H4: Chunks 404 son de Turbopack dev | **RECHAZADO** — Contenedor corre `next-server v16.2.7` (standalone production) | Logs: no hay Turbopack en producción |
| H5: Volúmenes sobrescriben `.next` | **RECHAZADO** — No hay volúmenes para frontend en `docker-compose.yml` | Revisado en compose |
| H6: Nginx mal configurado | **RECHAZADO** — Nginx pasa todo a `frontend:3000` sin filtros | Config revisada |

---

## 5. Configuración Next.js auditada (FASE 1)

| Configuración | Valor en `next.config.ts` | Valor baked en container | ¿Se aplica? |
|---|---|---|---|
| `output` | `standalone` (en Linux) | `standalone` | ✅ |
| `outputFileTracingRoot` | `monorepoRoot` | `"/"` | ✅ (resuelto en contenedor) |
| `images.unoptimized` | `true` | `false` | ❌ **NO** |
| `distDir` | `.next` (default) | `.next` | ✅ |
| `assetPrefix` | no definido | `""` | ✅ |
| `basePath` | no definido | `""` | ✅ |
| `rewrites` | `/uploads/*` → backend | `/uploads/*` → `http://127.0.0.1:4000/` | ⚠️ `backendUrl` resuelto a localhost |
| `transpilePackages` | `[@cermont/shared-types]` | `[@cermont/shared-types]` | ✅ |
| `poweredByHeader` | `false` | `false` | ✅ |

---

## 6. Archivos que requieren modificación

| Archivo | Cambio necesario | Riesgo |
|---|---|---|
| `frontend/Dockerfile` | Corregir rutas de `COPY` para `public/` y `.next/static/` | Bajo — solo cambia paths de copia |
| `frontend/next.config.ts` | Verificar/garantizar que `images.unoptimized: true` se aplique en build (posible interacción con `withSerwist`) | Medio — requiere rebuild + test |
| _(nuevo)_ `scripts/smoke-docker-runtime.mjs` | Crear smoke test para validar assets en Docker | Bajo — script independiente |

---

## 7. Plan de corrección (propuesto)

### Lote A: Assets públicos (manifest, favicon, imágenes)
1. Corregir `frontend/Dockerfile`: cambiar `./frontend/public` → `./app/frontend/public`
2. Rebuild: `docker compose build --no-cache frontend`
3. Validar: `curl -I http://localhost:3000/manifest.json` → 200

### Lote B: Next.js image optimizer
1. Verificar si `withSerwist` modifica `images.unoptimized`
2. Si es necesario, mover `unoptimized: true` fuera del alcance de `withSerwist` o agregar `unoptimized` directamente en componentes críticos
3. Rebuild y validar que no hay 400 en `/_next/image`

### Lote C: Chunks 404
1. Corregir `frontend/Dockerfile`: cambiar `./frontend/.next/static` → `./app/frontend/.next/static`
2. Rebuild y validar chunks

### Lote D: Smoke test
1. Crear `scripts/smoke-docker-runtime.mjs`

---

## 8. Veredicto

**El sistema NO está funcionando correctamente en Docker.** Todos los errores reportados son reales y fueron reproducidos vía curl y logs de contenedor. La causa raíz principal es un error en las rutas de copia del `frontend/Dockerfile` para el modo standalone. No es un problema de cache de navegador ni de Service Worker.

**No safe to deploy.** Tres bloqueantes activos:
1. Assets públicos 404 (manifest, favicon, imágenes)
2. Image optimizer 400/404
3. Chunks estáticos 404

**Próximo paso:** Implementar Lote A (corrección de Dockerfile para assets públicos).
