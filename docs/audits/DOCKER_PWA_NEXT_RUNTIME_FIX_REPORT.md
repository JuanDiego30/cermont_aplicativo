# Reporte Docker/PWA/Next.js — CERMONT S.A.S.

## 1. Resumen ejecutivo

Se diagnosticaron y corrigieron 5 errores críticos de runtime en Docker. Todos los errores fueron reproducidos, analizados y corregidos. La causa raíz principal fue un error en las rutas de copia del `frontend/Dockerfile` para el modo standalone, y una configuración de imágenes desactualizada en la build de Docker.

**Estado final:** ✅ Listo para deploy. 0 bloqueantes activos.

---

## 2. Ambiente probado

| Variable | Valor |
|---|---|
| SO host | Windows (PowerShell 7) |
| Node | v24.12.0 |
| npm | 11.15.0 |
| Docker | 29.5.3 |
| Docker Compose | v5.1.4 |
| Rama | `audit/business-logic-state` |
| Commit | `0e07091` (más cambios locales) |

---

## 3. Errores reproducidos y corregidos

| Error | URL | Antes | Después | Causa raíz | Solución |
|---|---|---|---|---|---|
| manifest.json | `/manifest.json` | 404 | 200 ✅ | Dockerfile copiaba `public/` a `./frontend/public/` en vez de `./app/frontend/public/` | Corregido Lote A |
| favicon.ico | `/favicon.ico` | 404 | 200 ✅ | Misma causa | Corregido Lote A |
| Landing images | `/images/optimized/landing/*.webp` | 404 | 200 ✅ | Misma causa | Corregido Lote A |
| `_next/image` 400 | `/_next/image?url=...` | 400 | Eliminado ✅ | Stale build sin `images.unoptimized: true` + SW cacheando error | Corregido Lote B + D |
| Chunks 404 | `/_next/static/chunks/*` | 404 | 200 ✅ | Dockerfile copiaba a `./frontend/.next/static/` en vez de `./app/frontend/.next/static/` | Corregido Lote A |

---

## 4. Causa raíz confirmada

**Problema #1 (Dockerfile):** El servidor standalone de Next.js ejecuta `process.chdir(__dirname)` donde `__dirname = /app/app/frontend/`. Next.js busca `public/` y `.next/static/` RELATIVO a ese directorio. El Dockerfile anterior copiaba estos directorios a `./frontend/...` en vez de `./app/frontend/...`.

```dockerfile
# ❌ ANTES (404s)
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

# ✅ DESPUÉS (200 OK)
COPY --from=builder /app/frontend/.next/static ./app/frontend/.next/static
COPY --from=builder /app/frontend/public ./app/frontend/public
```

**Problema #2 (Config obsoleta):** La build de Docker anterior no tenía `images.unoptimized: true` en `next.config.ts`. Esto causaba que `next/image` generara URLs `/_next/image` que retornaban 400. El archivo actual ya tenía la corrección, pero Docker no se había reconstruido.

**Problema #3 (SW caching):** El Service Worker usaba `StaleWhileRevalidate` para `/_next/image`, lo que cacheaba respuestas 400. Se cambió a `NetworkOnly`.

---

## 5. Hipótesis descartadas

| Hipótesis | Resultado |
|---|---|
| Service Worker sirve versión vieja | Descartado — errores ocurren en curl sin navegador |
| Chunks 404 son de Turbopack dev | Descartado — contenedor corre `next-server` standalone production |
| Volúmenes sobrescriben `.next` | Descartado — no hay volúmenes para frontend en compose |
| Nginx mal configurado | Descartado — nginx pasa todo a `frontend:3000` |

---

## 6. Archivos modificados

| Archivo | Cambio | Razón | Riesgo |
|---|---|---|---|
| `frontend/Dockerfile` | COPY paths: `./frontend/` → `./app/frontend/` | Servidor standalone busca assets relativo a `/app/app/frontend/` | Bajo |
| `frontend/next.config.ts` | `images.unoptimized: true` post-`withSerwist` wrapper | Garantiza que ningún wrapper sobreescriba la bandera | Bajo |
| `frontend/src/app/sw.ts` | `nextImageCaching`: `StaleWhileRevalidate` → `NetworkOnly` | Evita cachear respuestas 400 del optimizer | Bajo |
| `frontend/src/app/sw.ts` | `nextStaticCaching`: `CacheFirst` → `StaleWhileRevalidate` (7 días) | Evita chunks obsoletos post-deploy | Bajo |
| `frontend/src/modules/forms/queries/form-submissions.ts` | Remove unused `useQuery` import | Fix pre-existing TypeScript error que bloqueaba build | Bajo |
| `scripts/smoke-docker-runtime.mjs` | Agregados tests #7 (SW cache strategy) y #8 (image optimizer disabled) | Cobertura de verificación para regressiones | Ninguno |

---

## 7. Pruebas ejecutadas

| Prueba | Comando | Resultado |
|---|---|---|
| manifest.json | `curl -I http://localhost:3000/manifest.json` | ✅ 200 OK |
| favicon.ico | `curl -I http://localhost:3000/favicon.ico` | ✅ 200 OK |
| Landing image | `curl -I http://localhost:3000/images/optimized/landing/chatgpt-image-25-may-2026-22-58-49-1-1280.webp` | ✅ 200 OK |
| CSS chunk | `curl -I http://localhost:3000/_next/static/chunks/*.css` | ✅ 200 OK |
| JS chunk | `curl -I http://localhost:3000/_next/static/chunks/*.js` | ✅ 200 OK |
| Config baked | `grep unoptimized /app/app/frontend/server.js` | ✅ `unoptimized:true` |
| Smoke test completo | `node scripts/smoke-docker-runtime.mjs` | ✅ 38/38 PASS |
| Frontend logs | `docker compose logs frontend` | ✅ Sin errores de imagen |

---

## 8. Validación en Docker

```bash
$ curl -I http://localhost:3000/manifest.json
HTTP/1.1 200 OK

$ curl -I http://localhost:3000/favicon.ico
HTTP/1.1 200 OK

$ curl -I http://localhost:3000/images/optimized/landing/chatgpt-image-25-may-2026-22-58-49-1-1280.webp
HTTP/1.1 200 OK

$ curl -I http://localhost:3000/_next/static/chunks/0-gdusyq_snu3.js
HTTP/1.1 200 OK
Content-Type: application/javascript; charset=UTF-8

$ curl -I http://localhost:3000/_next/static/chunks/3spwfg5_07xqv.css
HTTP/1.1 200 OK
Content-Type: text/css; charset=UTF-8
```

---

## 9. Validación en navegador

- ✅ `manifest.json` — 200, sin errores
- ✅ `_next/image` — No aparecen requests 400 (optimizer deshabilitado)
- ✅ `_next/static/chunks` — Todos los chunks sirven 200
- ✅ Imágenes landing — Cargando sin errores
- ✅ Service Worker — No interfiere con assets estáticos

---

## 10. Estado final

- **Listo para deploy:** ✅ Sí
- **Bloqueantes restantes:** 0
- **Riesgos:** Ninguno identificado
- **Próximos pasos:** Commit de cambios, E2E Playwright para validación completa
