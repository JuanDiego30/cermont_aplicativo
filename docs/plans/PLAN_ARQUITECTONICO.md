Actúa como un ingeniero senior full-stack, arquitecto PWA offline-first y auditor de monorepos TypeScript. Eres experto en Next.js 16 App Router, React, Serwist/Turbopack, Service Workers, IndexedDB/Dexie, TanStack Query, Express, autenticación JWT/cookies HttpOnly, RBAC, contratos compartidos, base de datos, Playwright, React Doctor, Context7 y documentación técnica de trabajo de grado.

Necesito diagnosticar y corregir nuevamente el offline del aplicativo CERMONT S.A.S. porque aparecieron errores críticos en consola que pueden indicar que Serwist, el Service Worker, IndexedDB/Dexie o el proxy de autenticación están afectando el login y la persistencia local.

## 0. Errores reales observados

En consola aparecen estos errores:

```txt
sw.js:13 Event handler of 'jamToggleDumpStore' event must be added on the initial evaluation of worker script.
jv @ sw.js:13

api/backend/auth/login:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)
api/backend/auth/login:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)

09nqekty9nnij.js:1 Uncaught (in promise) NotFoundError: Failed to execute 'transaction' on 'IDBDatabase': One of the specified object stores was not found.
    at eL (09nqekty9nnij.js:1:28381)
    at async eU (09nqekty9nnij.js:1:28994)
    at async eQ (09nqekty9nnij.js:1:29089)
    at async 09nqekty9nnij.js:1:31997
```

Además, `npm run quality:strict` ya pasa correctamente. No enfocar este ciclo en `quality:strict`, salvo que se rompa.

Estado de quality reportado:

```txt
weak-token-a: 47/48 ✓
weak-token-n: 675/706 ✓
weak-token-u: 456/486 ✓
weak-token-ud: 584/588 ✓
spanish-source-token: 1868/1871 ✓
missing-semantic-landmark: 12/12 ✓
route-missing-authentication: 1/1 ✓
route-missing-authorization-policy: 30/30 ✓
route-missing-validation: 21/21 ✓
local-api-dto: 6/40 ✓
lint-disable-residue: 2 ✓
zero rules: 0 ✓
service-size: 0 ✓
```

`local-api-dto: 6/40` está dentro del baseline. No es fallo bloqueante. Si se decide reducirlo, debe ser una tarea separada de refactor contract-first.

## 1. Regla obligatoria: usar Context7 antes de codificar

Antes de modificar código relacionado con librerías o APIs externas, debes usar Context7 para consultar documentación actualizada.

Obligatorio usar Context7 para:

1. `@serwist/turbopack`
2. `serwist`
3. `Next.js 16 App Router`
4. `Dexie`
5. `IndexedDB migrations`
6. `TanStack Query persistQueryClient`
7. `Playwright service workers/offline`
8. `React Doctor` si vas a tocar warnings
9. Express auth/cookies solo si hay duda de implementación actual

No inventes APIs de Serwist, Dexie o TanStack. Si no estás seguro de una firma, busca en Context7 y documenta la fuente en evidencia.

Crear archivo:

```txt
.sisyphus/evidence/offline-auth-idb-fix/00_context7_docs_consulted.md
```

Debe incluir:

* paquete consultado,
* versión detectada en el repo,
* función/API usada,
* decisión aplicada,
* enlace o resumen de Context7.

## 2. Contexto real de negocio CERMONT

No trates esto como una app genérica.

El aplicativo CERMONT S.A.S. debe soportar la gestión de órdenes de trabajo, trazabilidad operativa y cierre administrativo. El flujo operativo-administrativo tiene 14 pasos:

1. Solicitud formal del cliente.
2. Visita técnica.
3. Propuesta económica.
4. Aprobación con orden de compra / PO.
5. Planeación de la actividad.
6. Ejecución en campo.
7. Informe técnico.
8. Acta de entrega.
9. Acta firmada.
10. SES en Ariba.
11. SES aprobada.
12. Factura.
13. Factura aprobada.
14. Pago y cierre definitivo.

La app debe resolver fallas reales:

* Fallas en planeación: falta de herramientas, equipos, personal, certificaciones, AST y documentos.
* Fallas en ejecución: checklists, permisos, evidencias, fotos, firmas y documentación incompleta.
* Fallas en informes/actas: retrasos, soportes dispersos, evidencias no consolidadas.
* Fallas en cierre administrativo: SES, factura, aprobación y pago sin trazabilidad.
* Falta de control de costos reales.

Los formularios no son básicos. Deben permitir estructuras como:

* Planeación de obra:

  * responsable,
  * lugar,
  * fecha,
  * unidad de negocio,
  * alcance,
  * materiales,
  * herramientas,
  * equipos,
  * elementos de seguridad,
  * número de trabajadores.

* Inspección de líneas de vida:

  * condición a evaluar,
  * tipo de afección,
  * estado,
  * hallazgo,
  * acción correctiva,
  * observaciones.

* Mantenimiento CCTV:

  * cámara,
  * rutina,
  * lugar,
  * fecha,
  * altura,
  * modelo,
  * serial,
  * radio,
  * antena,
  * switch,
  * alimentación,
  * sistema eléctrico,
  * sistema fotovoltaico,
  * registro fotográfico.

No rompas estos módulos ni simplifiques formularios por corregir offline.

## 3. Reglas absolutas

1. No cambies seed ni credenciales sin autorización.
2. No cambies correo/clave de login por “arreglar” el 401.
3. No caches `POST /auth/login`.
4. No caches endpoints `/api/backend/auth/*`.
5. No interceptes login con fallback offline.
6. No guardes tokens en IndexedDB, localStorage ni Cache Storage.
7. No uses cache del SW para respuestas autenticadas dinámicas.
8. No borres IndexedDB del usuario sin confirmación, salvo en test controlado.
9. No ocultes errores de IDB con try/catch vacío.
10. No cambies versiones de DB Dexie sin migración.
11. No paralelices sync de pasos dependientes del flujo de 14 pasos.
12. No uses `/~offline` como experiencia principal.
13. No inventes stores IndexedDB; audita el esquema real.
14. No inventes endpoints.
15. No cambies contratos sin actualizar `packages`, backend, frontend y tests.
16. No edites React Doctor si el problema actual es login/IDB/offline, salvo que se toque el archivo afectado.
17. No finalices sin Playwright de login + offline + IndexedDB.

## 4. Credenciales de prueba local/dev

Verificar, pero no exponer en logs públicos.

Credenciales locales/dev esperadas:

```txt
Correo: gerencia@cermont.con
Clave: Cermont2026!
```

Si login falla:

1. Diagnosticar backend y seed.
2. Diagnosticar si el correo real en DB es `.con` o `.com`.
3. Diagnosticar si el frontend manda payload correcto.
4. Diagnosticar si el proxy `/api/backend/auth/login` reenvía correctamente.
5. Diagnosticar si el SW intercepta indebidamente.
6. Diagnosticar cookies/JWT/CSRF si aplica.
7. Solo después proponer corrección mínima.

No cambiar credenciales como primera respuesta.

## 5. Fase 0 — Congelar evidencia del estado actual

Crear carpeta:

```powershell
New-Item -ItemType Directory -Force .sisyphus/evidence/offline-auth-idb-fix
```

Ejecutar:

```powershell
git status --short
git branch --show-current
git log --oneline -8
node -v
npm -v
Get-Content package.json
Get-Content frontend/package.json
Get-Content frontend/next.config.ts
Get-Content frontend/tsconfig.json
```

Guardar en:

```txt
.sisyphus/evidence/offline-auth-idb-fix/01_repo_context.txt
```

Ejecutar:

```powershell
npm ls @serwist/turbopack serwist dexie @tanstack/react-query @tanstack/react-query-persist-client -w frontend
```

Guardar en:

```txt
.sisyphus/evidence/offline-auth-idb-fix/02_dependency_versions.txt
```

## 6. Fase 1 — Revisar evidencia anterior y no repetir errores

Leer evidencia previa si existe:

```powershell
Get-Content .sisyphus/evidence/offline-final/02_offline_final_summary.md -ErrorAction SilentlyContinue
Get-Content .sisyphus/evidence/offline-final/00_auditoria_inicial.md -ErrorAction SilentlyContinue
Get-Content .sisyphus/evidence/offline-final/playwright-offline.txt -ErrorAction SilentlyContinue
Get-Content .sisyphus/evidence/react-doctor-35/19_final_score_summary.md -ErrorAction SilentlyContinue
```

Crear:

```txt
.sisyphus/evidence/offline-auth-idb-fix/03_previous_work_review.md
```

Debe decir:

* qué estaba funcionando,
* qué se rompió,
* qué no se debe tocar,
* qué hipótesis explicarían los errores actuales.

## 7. Fase 2 — Diagnóstico del error `jamToggleDumpStore`

Este error puede venir de:

* extensión del navegador,
* Jam DevTools,
* script inyectado,
* listener agregado tarde en el SW,
* bug del SW generado/minificado,
* registro tardío de evento en worker.

No asumir.

Pasos:

1. Probar en navegador limpio sin extensiones.
2. Probar en perfil incógnito sin extensiones.
3. Probar con Playwright Chromium limpio.
4. Buscar `jamToggleDumpStore` en el repo:

```powershell
rg "jamToggleDumpStore|jam|dumpStore" frontend backend packages public . -g "!node_modules" -g "!.next"
```

5. Abrir SW fuente real:

```powershell
Get-Content frontend/src/app/sw.ts
Get-Content frontend/src/app/serwist/[path]/route.ts
```

6. Revisar SW generado:

```powershell
curl.exe -L http://localhost:3000/serwist/sw.js -o .sisyphus/evidence/offline-auth-idb-fix/sw.generated.js
```

7. Buscar en SW generado:

```powershell
Select-String -Path .sisyphus/evidence/offline-auth-idb-fix/sw.generated.js -Pattern "jamToggleDumpStore|addEventListener|message|sync|fetch"
```

Diagnóstico esperado:

* Si aparece solo con extensión, documentar como ruido de extensión y probar con Playwright.
* Si aparece en SW generado, corregir `sw.ts` para registrar handlers en evaluación inicial.
* No registrar event handlers dentro de promesas, callbacks tardíos o ramas async.

Guardar:

```txt
.sisyphus/evidence/offline-auth-idb-fix/04_jamToggleDumpStore_diagnosis.md
```

## 8. Fase 3 — Diagnóstico del 401 en login

Objetivo: saber si el 401 viene de seed, backend, payload, proxy, cookies o Service Worker.

### 8.1 Verificar que SW no intercepte auth

Auditar `frontend/src/app/sw.ts`.

Regla obligatoria:

* `/api/backend/auth/login`
* `/api/backend/auth/logout`
* `/api/backend/auth/refresh`
* `/api/auth/login`
* `/api/auth/*`

deben ser `NetworkOnly` o bypass total del SW.
Nunca deben usar `CacheFirst`, `StaleWhileRevalidate`, `NetworkFirst` con fallback, ni background sync.

Agregar explícitamente matcher de exclusión si falta.

Ejemplo conceptual, ajustar a API real de Serwist consultada en Context7:

```ts
const AUTH_API_PREFIXES = [
  "/api/backend/auth/",
  "/api/auth/",
];

function isAuthRequest(url: URL) {
  return AUTH_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}
```

En runtime caching:

* auth debe ir antes que reglas genéricas de `/api`.
* auth debe responder solo por red.
* si falla red, debe fallar claramente, no fallback offline.

### 8.2 Probar backend directo

Identificar puerto backend real.

Buscar:

```powershell
Get-Content backend/package.json
rg "PORT|4000|3001|auth/login|login" backend frontend/src
```

Probar endpoint backend directo con `curl` o script Node, sin frontend ni SW.

Guardar:

```txt
.sisyphus/evidence/offline-auth-idb-fix/05_login_backend_direct.txt
```

### 8.3 Probar proxy frontend

Probar:

```powershell
curl.exe -i -X POST http://localhost:3000/api/backend/auth/login `
  -H "Content-Type: application/json" `
  --data "{\"email\":\"gerencia@cermont.con\",\"password\":\"Cermont2026!\"}"
```

Si el backend espera `correo`, `password`, `clave` u otro DTO, no inventar. Leer contrato real.

Guardar:

```txt
.sisyphus/evidence/offline-auth-idb-fix/06_login_frontend_proxy.txt
```

### 8.4 Revisar seed

Buscar:

```powershell
rg "gerencia@cermont|Cermont2026|seed|auth" backend packages frontend
```

Verificar:

* correo,
* hash de contraseña,
* rol,
* estado activo,
* tenant/empresa si aplica,
* migración/seed ejecutado,
* base correcta.

Guardar:

```txt
.sisyphus/evidence/offline-auth-idb-fix/07_seed_diagnosis.md
```

### 8.5 Playwright login sin SW

Crear prueba temporal o usar context limpio:

* unregister SW,
* clear cache storage,
* NO borrar DB real salvo test,
* probar login.

### 8.6 Playwright login con SW

Luego probar con SW activo.
Comparar resultado.

Si login falla solo con SW activo, corregir Serwist.
Si login falla sin SW, corregir backend/seed/proxy.

Guardar:

```txt
.sisyphus/evidence/offline-auth-idb-fix/08_login_sw_comparison.md
```

## 9. Fase 4 — Diagnóstico y corrección de IndexedDB NotFoundError

Error:

```txt
NotFoundError: Failed to execute 'transaction' on 'IDBDatabase': One of the specified object stores was not found.
```

Hipótesis principales:

1. Código usa un store que no existe en la versión actual de Dexie.
2. Se agregó store sin incrementar versión.
3. IndexedDB vieja quedó instalada con esquema anterior.
4. Migración Dexie incompleta.
5. Nombre de store diferente entre repositorio y schema.
6. Build viejo del frontend usa stores nuevos contra DB vieja.
7. PersistQueryClient y offline-db usan DBs separadas con nombres parecidos.
8. Tests borran o abren DB con versión incompleta.

Pasos:

### 9.1 Auditar schemas IDB/Dexie

```powershell
rg "new Dexie|version\\(|stores\\(|indexedDB|createObjectStore|objectStore|transaction\\(" frontend/src frontend/tests
```

Leer:

* `frontend/src/lib/offline/offline-db.ts`
* `frontend/src/lib/offline/local-repositories.ts`
* `frontend/src/lib/pwa/query-persist.ts`
* cualquier archivo Dexie/IDB real.

Crear:

```txt
.sisyphus/evidence/offline-auth-idb-fix/09_idb_schema_audit.md
```

Debe mapear:

* nombre de DB,
* versión,
* stores declarados,
* stores usados,
* repositorio que usa cada store,
* migraciones,
* stores faltantes.

### 9.2 Comparar stores usados vs stores definidos

Crear matriz:

```txt
Store | Definido en Dexie | Usado por | Existe en versión actual | Acción
```

Si hay store usado y no definido:

* agregarlo al schema.
* incrementar versión Dexie.
* definir migración segura.

Si el store existió con otro nombre:

* crear migración de datos o adapter.

### 9.3 Migración segura

No borrar DB en producción.
Implementar migración:

```ts
db.version(N).stores({
  ...
});
```

Si se necesita `upgrade`, hacerlo con cuidado.

Agregar función de recuperación controlada solo para casos irrecuperables:

* detectar `MissingObjectStoreError`,
* mostrar aviso técnico,
* permitir “reconstruir almacenamiento local” solo si el usuario acepta,
* nunca borrar datos pendientes sin backup/export.

### 9.4 Modo desarrollo

En desarrollo se puede incluir utilidad manual:

```txt
Reset local offline storage
```

pero no ejecutarla automáticamente.

Guardar:

```txt
.sisyphus/evidence/offline-auth-idb-fix/10_idb_migration_fix.md
```

## 10. Fase 5 — Revalidar Serwist con Context7

Usando Context7, revisar configuración correcta para:

* `@serwist/turbopack`
* route handler `app/serwist/[path]/route.ts`
* `SerwistProvider`
* `defaultCache`
* `runtimeCaching`
* `fallbacks`
* `NetworkOnly`
* exclusión de auth/API dinámicas
* navegación offline de app shell

Auditar:

```powershell
Get-Content frontend/src/app/sw.ts
Get-Content frontend/src/app/serwist/[path]/route.ts
Get-Content frontend/src/app/layout.tsx
Get-Content frontend/next.config.ts
```

Reglas:

1. SW debe estar en `/serwist/sw.js`.
2. Login/auth no se cachean.
3. `/api/backend/*` dinámico no se cachea indiscriminadamente.
4. Navegación interna calentada sí debe funcionar offline.
5. `/_next/static/*`, imágenes, iconos, fuentes sí se cachean.
6. `/~offline` solo fallback extremo.
7. Event listeners del SW deben registrarse en evaluación inicial.
8. No usar APIs antiguas de `@serwist/next` si el proyecto usa `@serwist/turbopack`.

Guardar:

```txt
.sisyphus/evidence/offline-auth-idb-fix/11_serwist_audit_and_fix.md
```

## 11. Fase 6 — Revisión de módulos CERMONT faltantes

No basta con arreglar login. Revisar que módulos realmente resuelvan fallas CERMONT.

Crear matriz:

```txt
.sisyphus/evidence/offline-auth-idb-fix/12_cermont_module_gap_matrix.md
```

Columnas:

```txt
Paso | Módulo | Backend endpoint | Contrato shared/domain | Modelo DB | Frontend page | Query/mutation | Offline support | Evidencia/test | Brecha
```

Módulos mínimos:

### Paso 1 — Work Request

* solicitud formal,
* cliente,
* alcance inicial,
* estado,
* adjuntos.

### Paso 2 — Site Visit

* visita técnica,
* mediciones,
* registro fotográfico,
* observaciones.

### Paso 3 — Proposal

* propuesta económica,
* costos,
* alcance.

### Paso 4 — Purchase Order

* PO,
* aprobación.

### Paso 5 — Planning

* cronograma,
* mano de obra,
* herramientas,
* equipos,
* certificaciones,
* AST,
* documentos de apoyo,
* kits típicos.

### Paso 6 — Execution

* checklists,
* permisos,
* socialización AST,
* fotos,
* firmas,
* observaciones,
* avance de actividad.

### Paso 7 — Technical Report

* informe,
* actividades ejecutadas,
* registro fotográfico.

### Pasos 8-14 — Admin Closure

* acta entrega,
* firma,
* SES,
* factura,
* aprobación,
* pago,
* cierre definitivo.

### Transversal

* evidencias,
* documentos,
* costos reales,
* usuarios/roles,
* auditoría,
* offline sync.

No inventar módulos. Si no existen, registrar brecha y proponer implementación. Si existen incompletos, completar lo mínimo seguro.

## 12. Fase 7 — Corregir offline de módulos sin romper auth

Asegurar:

1. Módulos principales navegan offline después de warmup.
2. Datos se leen de IndexedDB.
3. Mutaciones offline se encolan.
4. Evidencias offline usan blob outbox.
5. Auth/login siempre red.
6. Logout/refresh siempre red o manejo seguro.
7. Si sesión expira offline, la app debe informar y no borrar datos pendientes.

Pruebas mínimas:

* `/service-cases`
* `/work-requests`
* `/site-visits`
* `/templates`
* módulo de evidencias si existe,
* módulo de planning si existe,
* módulo de execution si existe,
* cierre admin si existe.

Guardar:

```txt
.sisyphus/evidence/offline-auth-idb-fix/13_offline_modules_validation.md
```

## 13. Fase 8 — Crear pruebas E2E específicas del bug

Crear o corregir:

```txt
frontend/tests/e2e/auth-sw-idb-regression.spec.ts
```

Escenarios obligatorios:

### Escenario 1 — Login sin SW corrupto

* limpiar SW/caches de test,
* iniciar backend/frontend producción,
* abrir `/login`,
* login con credenciales dev,
* esperar dashboard,
* verificar no 401 en consola.

### Escenario 2 — Login con SW activo

* registrar SW,
* recargar,
* login,
* verificar que `/api/backend/auth/login` no es respondido por Service Worker cache.
* verificar response real de red o backend.

### Escenario 3 — Auth no se cachea

* inspeccionar Cache Storage desde browser context.
* verificar que no existe entrada cacheada de `/api/backend/auth/login`.

### Escenario 4 — IDB schema completo

* abrir app,
* ejecutar código en page para listar `indexedDB.databases()` si soporta.
* abrir Dexie/offline DB.
* verificar stores esperados.
* no debe lanzar NotFoundError.

### Escenario 5 — Upgrade de DB

* simular DB vieja si es viable.
* cargar app nueva.
* verificar migración.
* verificar no se pierden pendientes.

### Escenario 6 — Offline warmup

* login online,
* visitar rutas principales,
* apagar red,
* recargar `/service-cases`,
* renderiza módulo real.

### Escenario 7 — Reconexión sync

* crear cambio offline pequeño si existe flujo,
* verificar queue,
* reconectar,
* verificar sync.

Guardar resultado:

```txt
.sisyphus/evidence/offline-auth-idb-fix/14_playwright_auth_sw_idb.txt
```

## 14. Fase 9 — Revisar React Doctor solo si fue impactado

Después de corregir SW/IDB/auth, correr:

```powershell
npx react-doctor@latest --verbose 2>&1 | Tee-Object -FilePath ".sisyphus/evidence/offline-auth-idb-fix/15_react_doctor_after.txt"
```

No convertir este ciclo en refactor React Doctor si el login/IDB sigue roto.

Si React Doctor sube warnings por cambios realizados, corregirlos con evidencia.

## 15. Fase 10 — Validación de calidad

Ejecutar:

```powershell
npm run typecheck -w frontend 2>&1 | Tee-Object -FilePath ".sisyphus/evidence/offline-auth-idb-fix/typecheck-frontend.txt"
npm run lint -w frontend 2>&1 | Tee-Object -FilePath ".sisyphus/evidence/offline-auth-idb-fix/lint-frontend.txt"
npm run test -w frontend 2>&1 | Tee-Object -FilePath ".sisyphus/evidence/offline-auth-idb-fix/test-frontend.txt"
npm run build -w frontend 2>&1 | Tee-Object -FilePath ".sisyphus/evidence/offline-auth-idb-fix/build-frontend.txt"
```

Si se toca backend:

```powershell
npm run typecheck -w backend 2>&1 | Tee-Object -FilePath ".sisyphus/evidence/offline-auth-idb-fix/typecheck-backend.txt"
npm run test -w backend 2>&1 | Tee-Object -FilePath ".sisyphus/evidence/offline-auth-idb-fix/test-backend.txt"
```

Root:

```powershell
npm run verify 2>&1 | Tee-Object -FilePath ".sisyphus/evidence/offline-auth-idb-fix/verify-root.txt"
```

SW endpoint:

```powershell
curl.exe -I http://localhost:3000/serwist/sw.js 2>&1 | Tee-Object -FilePath ".sisyphus/evidence/offline-auth-idb-fix/sw-headers.txt"
curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/serwist/sw.js | Tee-Object -FilePath ".sisyphus/evidence/offline-auth-idb-fix/sw-code.txt"
```

## 16. Fase 11 — Limpieza controlada de caches en desarrollo

Si el problema IDB/SW se debe a estado viejo, crear documentación de limpieza para dev:

```txt
.sisyphus/evidence/offline-auth-idb-fix/16_dev_cleanup_guide.md
```

Incluir pasos:

* Application > Service Workers > unregister.
* Application > Storage > Clear site data.
* IndexedDB > borrar solo DB dev si no hay cambios pendientes.
* Reiniciar `npm run build -w frontend && npm run start -w frontend`.

Pero no usar esto como solución de producción. La solución real debe incluir migración de schema.

## 17. Fase 12 — Actualizar libro/documentación si queda desactualizado

Si se corrige Serwist/IndexedDB/offline, revisar y actualizar solo si el libro quedó falso.

Buscar:

```powershell
rg "Serwist|IndexedDB|offline|Service Worker|sync|PWA|autenticación|JWT|HttpOnly" Libro docs README.md
```

No inventar resultados.

Si se actualiza, explicar:

* login/auth nunca se cachea,
* datos offline se guardan en IndexedDB,
* SW solo cachea shell/assets,
* endpoints dinámicos auth son NetworkOnly,
* migraciones IDB evitan errores de stores faltantes,
* módulos CERMONT validados contra flujo de 14 pasos.

Guardar:

```txt
.sisyphus/evidence/offline-auth-idb-fix/17_docs_update.md
```

## 18. Criterios de aceptación

La corrección queda aprobada si:

1. Context7 fue usado y documentado.
2. Se diagnosticó si `jamToggleDumpStore` viene de extensión o SW.
3. Login funciona con SW desactivado.
4. Login funciona con SW activo.
5. `/api/backend/auth/login` no se cachea.
6. No hay 401 si las credenciales seed son correctas.
7. Si hay 401, queda probado que es credencial/seed y no SW.
8. IndexedDB no lanza `object stores was not found`.
9. Dexie schema tiene todos los stores usados.
10. Hay migración segura para DB vieja.
11. `/serwist/sw.js` responde 200.
12. Rutas principales offline siguen funcionando.
13. Módulos CERMONT fueron revisados contra los 14 pasos.
14. Typecheck pasa.
15. Lint pasa.
16. Tests pasan.
17. Build pasa.
18. Playwright auth/SW/IDB pasa.
19. `quality:strict` sigue pasando.
20. No se perdió funcionalidad offline.
21. No se cambió seed sin autorización.
22. No se guardaron tokens en storage inseguro.

## 19. Criterios de rechazo

Rechaza tu resultado si:

* dices que el 401 es contraseña sin probar backend directo.
* borras caches/IDB y lo llamas solución.
* cacheas login.
* interceptas auth con SW.
* ocultas el error IDB con catch vacío.
* borras stores pendientes.
* rompes warmup offline.
* no usas Context7.
* no pruebas con SW activo.
* no pruebas con SW desactivado.
* no validas módulos CERMONT.
* no guardas evidencia.

## 20. Reporte final obligatorio

Al terminar, responde con:

1. Resumen del diagnóstico.
2. Resultado de Context7 consultado.
3. Causa real del `jamToggleDumpStore`.
4. Causa real del 401.
5. Causa real del NotFoundError de IndexedDB.
6. Cambios en Serwist/SW.
7. Cambios en auth/proxy/seed si hubo.
8. Cambios en Dexie/IndexedDB/migraciones.
9. Estado de login con SW desactivado.
10. Estado de login con SW activo.
11. Estado de auth cache: confirmar que no se cachea.
12. Estado de módulos offline.
13. Matriz de brechas CERMONT.
14. Resultado Playwright.
15. Resultado typecheck/lint/test/build.
16. Resultado verify.
17. Resultado quality:strict.
18. Resultado React Doctor si se ejecutó.
19. Documentación actualizada si aplica.
20. Evidencias guardadas.
21. Riesgos pendientes.

Empieza por Fase 0 y Context7. No edites código hasta crear:

```txt
.sisyphus/evidence/offline-auth-idb-fix/00_context7_docs_consulted.md
.sisyphus/evidence/offline-auth-idb-fix/01_repo_context.txt
```
una vez terminada todas las fases de este plan continua con el plan arquitecntonico

Actúa como un arquitecto senior full-stack, product engineer de software FSM/CMMS/ERP y auditor de monorepos TypeScript. Eres experto en Next.js 16 App Router, React, Serwist/Turbopack, PWA offline-first, Dexie/IndexedDB, TanStack Query, Express 5, Zod, MongoDB/Mongoose o la base real del repo, RBAC, contract-first development, field service management, CMMS, gestión documental, evidencias, flujo administrativo, SES/facturación, auditoría, Playwright, Vitest, React Doctor y Context7.

Necesito que continúes el prompt anterior, pero ahora agregando un **plan arquitectónico completo** para desarrollar y corregir los módulos principales de CERMONT S.A.S., además del offline. No quiero una app con páginas sueltas ni formularios básicos. El aplicativo debe resolver las fallas reales de CERMONT y mantener coherencia entre contratos, backend, base de datos, frontend, offline y documentación.

## 0. Contexto obligatorio de CERMONT S.A.S.

El aplicativo CERMONT S.A.S. tiene como finalidad gestionar órdenes de trabajo, trazabilidad operativa y cierre administrativo de procesos de campo. La empresa tiene fallas derivadas del uso de formatos físicos, hojas de cálculo, evidencias dispersas y cierre administrativo manual.

El flujo real tiene 14 pasos:

1. Solicitud formal del cliente.
2. Visita técnica.
3. Propuesta económica.
4. Aprobación con orden de compra / PO.
5. Planeación para ejecutar la actividad.
6. Ejecución de la actividad.
7. Elaboración de informe técnico.
8. Elaboración de acta de entrega.
9. Recibo de acta firmada.
10. Elaboración de SES en Ariba.
11. Recibo de SES aprobada.
12. Elaboración y envío de factura.
13. Recibo de aprobación de factura.
14. Pago de factura y cierre definitivo.

El aplicativo debe resolver cinco fallas principales:

1. Falla de planeación.
2. Falla de ejecución y captura de evidencias.
3. Falla de consolidación documental, informes y actas.
4. Falla de cierre administrativo, SES, factura y pago.
5. Falla de control centralizado de costos reales.

Además del módulo offline, se deben construir o completar cuatro módulos principales:

1. **Módulo de Planeación Operativa y Kits Típicos.**
2. **Módulo de Ejecución en Campo, Checklists y Evidencias.**
3. **Módulo de Informes Técnicos, Actas y Gestión Documental.**
4. **Módulo de Cierre Administrativo, SES, Facturación, Pagos y Costos Reales.**

Cada módulo debe respetar:

```txt
packages/shared-types o packages/domain
        ↓
backend models / repositories / services / controllers
        ↓
base de datos / índices / auditoría / estado
        ↓
frontend api-client / query keys / hooks / forms
        ↓
offline snapshot / sync queue / blob outbox si aplica
        ↓
UI / UX / accesibilidad / responsive
        ↓
tests unitarios / integración / Playwright
        ↓
documentación / libro / ADR
```

## 1. Referencias externas obligatorias

Antes de implementar, investiga y documenta en `.sisyphus/evidence/architecture-plan/00_research.md`:

1. OCA Field Service:

   * módulos de órdenes de campo,
   * actividades,
   * acuerdos/contratos,
   * calendario,
   * CRM,
   * equipos/stock,
   * proyectos,
   * reparación,
   * rutas,
   * ventas,
   * timesheets,
   * vehículos.

2. Odoo Field Service:

   * tasks,
   * product management,
   * itinerary planning,
   * worksheets.

3. ERPNext:

   * order management,
   * accounting,
   * asset management,
   * projects,
   * inventory,
   * framework con autenticación, base de datos y API.

4. Si es útil, revisar:

   * openMAINT / CMDBuild para activos y mantenimiento,
   * OpenProject para tareas, Gantt, costos y documentos,
   * GLPI para activos, service desk e inventario.

No copiar estas plataformas. Usarlas como referencia para estructurar CERMONT de forma profesional.

## 2. Regla obligatoria: Context7

Antes de codificar con librerías o APIs, usar Context7 y documentar:

* Next.js 16 App Router.
* Serwist/Turbopack.
* Dexie.
* IndexedDB migrations.
* TanStack Query.
* Zod.
* Express 5.
* Playwright.
* React Doctor si se toca frontend/performance.

Crear:

```txt
.sisyphus/evidence/architecture-plan/01_context7_docs.md
```

Debe incluir:

* librería consultada,
* versión real instalada,
* API usada,
* decisión tomada.

## 3. Reglas de desarrollo obligatorias

Debes aplicar las reglas del archivo `REGLAS_DESARROLLO_CERMONT.md`:

1. SOLID.
2. SDLC.
3. DRY.
4. KISS.
5. YAGNI.
6. Feature-Sliced Design.
7. One Module One Responsibility.
8. Single Source of Truth.
9. Contract-First Development.
10. RBAC centralizado.
11. TypeScript estricto.
12. Sin `any`.
13. Sin `unknown` salvo refinamiento aprobado.
14. Sin `null`/`undefined` como estado de negocio.
15. Sin lógica de negocio compleja en UI.
16. Sin fetch directo en componentes.
17. Query keys estables.
18. Loading/error/empty/offline/forbidden states.
19. Offline-first para ejecución, evidencias, checklists, materiales, horas, notas y sync queue.
20. Idempotencia para acciones críticas.
21. Auditoría por defecto.
22. Tests antes de refactor.
23. Cada flujo crítico con prueba E2E o pendiente documentado.

No elimines funcionalidad existente sin reemplazarla, mejorarla o escalarla de forma verificada.

## 4. Fase 0 — Auditoría del estado actual del repo

Antes de modificar código, ejecutar:

```powershell
New-Item -ItemType Directory -Force .sisyphus/evidence/architecture-plan

git status --short
git branch --show-current
git log --oneline -8

Get-Content package.json
Get-Content frontend/package.json
Get-Content backend/package.json -ErrorAction SilentlyContinue

Get-ChildItem packages -Recurse -File -Include *.ts,*.tsx | Select-Object FullName
Get-ChildItem backend/src -Recurse -File -Include *.ts,*.tsx | Select-Object FullName
Get-ChildItem frontend/src -Recurse -File -Include *.ts,*.tsx | Select-Object FullName

rg "WorkRequest|SiteVisit|Proposal|PurchaseOrder|ServiceCase|WorkOrder|Planning|Execution|Checklist|Evidence|TechnicalReport|DeliveryRecord|SES|ServiceEntrySheet|Invoice|Payment|Cost|ActualCost|Audit|RBAC|role|permission" packages backend frontend/src
```

Crear:

```txt
.sisyphus/evidence/architecture-plan/02_current_state_audit.md
```

Debe incluir:

* módulos existentes,
* módulos incompletos,
* contratos existentes,
* endpoints existentes,
* modelos de DB existentes,
* páginas frontend existentes,
* hooks y query keys existentes,
* soporte offline existente,
* pruebas existentes,
* brechas.

No implementes hasta completar esta auditoría.

## 5. Fase 1 — Mapa arquitectónico general de CERMONT

Crear un documento:

```txt
.sisyphus/evidence/architecture-plan/03_target_architecture_map.md
```

Debe definir este mapa:

```txt
CERMONT Platform
│
├── Core Platform
│   ├── Auth + Session + HttpOnly cookies
│   ├── RBAC + Permission Policy
│   ├── Audit Log
│   ├── File Storage
│   ├── Notification/Status Center
│   └── Offline Engine
│
├── Module 1: Work Intake
│   ├── Work Requests
│   ├── Site Visits
│   ├── Proposals
│   └── Purchase Orders
│
├── Module 2: Planning
│   ├── Planning Packets
│   ├── Typical Kits
│   ├── Materials
│   ├── Tools
│   ├── Equipment
│   ├── Safety Elements
│   ├── Labor Planning
│   ├── Certifications
│   ├── AST / HSE Documents
│   └── Approval Gate
│
├── Module 3: Field Execution
│   ├── Execution Sessions
│   ├── Checklists
│   ├── Permits
│   ├── AST Socialization
│   ├── Materials Used
│   ├── Labor Hours
│   ├── Field Notes
│   ├── Evidence Capture
│   ├── Signatures
│   └── Offline Drafts
│
├── Module 4: Technical Documentation
│   ├── Technical Reports
│   ├── Evidence Consolidation
│   ├── Photo Logs
│   ├── Delivery Records
│   ├── Client Acceptance
│   └── PDF Generation
│
├── Module 5: Administrative Closure
│   ├── SES
│   ├── SES Approval
│   ├── Invoices
│   ├── Invoice Approval
│   ├── Payments
│   ├── Closure Checklist
│   └── Collection Follow-up
│
├── Module 6: Costs
│   ├── Estimated Costs
│   ├── Actual Costs
│   ├── Labor Cost
│   ├── Material Cost
│   ├── Equipment Cost
│   ├── Variance Analysis
│   └── Profitability View
│
└── Module 7: Templates & Configuration
    ├── Dynamic Forms
    ├── Checklist Templates
    ├── Kit Templates
    ├── Document Templates
    ├── Workflow Rules
    └── Business Units
```

Aunque se hable de “otros 4 módulos”, conservar este mapa completo. Los cuatro prioritarios son:

* Planning,
* Field Execution,
* Technical Documentation,
* Administrative Closure/Costs.

## 6. Fase 2 — Contract-first y SSOT

Antes de tocar frontend o backend, crear una matriz:

```txt
.sisyphus/evidence/architecture-plan/04_contract_first_matrix.md
```

Columnas:

```txt
Domain | Entity | Shared Schema | Domain Rule | DB Model | Backend Service | Controller | Frontend Query/Mutation | Offline Store | Test
```

Entidades mínimas:

```txt
WorkRequest
SiteVisit
Proposal
PurchaseOrder
ServiceCase
PlanningPacket
TypicalKit
PlanningResource
ExecutionSession
ChecklistTemplate
ChecklistResponse
Evidence
TechnicalReport
DeliveryRecord
ServiceEntrySheet
Invoice
Payment
ActualCost
AuditEvent
OfflineMutation
BlobOutboxItem
```

Reglas:

* No duplicar schemas Zod.
* No crear DTO local en frontend si puede ir en `packages/shared-types`.
* No duplicar enums de estado.
* Query keys centralizadas.
* Roles y permisos centralizados.
* Estados del flujo en dominio, no en UI.

## 7. Fase 3 — Módulo 1: Planeación Operativa y Kits Típicos

Este módulo resuelve la falla de planeación: la actividad se ejecuta sin herramientas, equipos, materiales, personal o documentación completa.

Debe estar construido así:

### 7.1 Dominio

Entidades:

* `PlanningPacket`
* `TypicalKit`
* `PlanningResource`
* `SafetyRequirement`
* `CertificationRequirement`
* `AstRequirement`
* `PlanningApproval`

Estados sugeridos:

* `draft`
* `pending_review`
* `approved`
* `rejected`
* `locked_for_execution`

Reglas:

* No se puede iniciar ejecución si la planeación obligatoria no está aprobada.
* No se puede aprobar si faltan herramientas/equipos/materiales/personas requeridas.
* Kits típicos deben poder aplicar plantillas según tipo de trabajo.
* Debe permitir recursos personalizados, porque CERMONT no siempre repite exactamente el mismo servicio.
* Debe registrar responsable, lugar, fecha, unidad de negocio, alcance, materiales, herramientas, equipos, elementos de seguridad y número de trabajadores.

### 7.2 Backend

Crear/verificar:

* schemas Zod en `packages/shared-types`,
* reglas en `packages/domain`,
* modelo DB,
* service,
* controller delgado,
* rutas:

  * `GET /planning-packets`
  * `GET /planning-packets/:id`
  * `POST /planning-packets`
  * `PATCH /planning-packets/:id`
  * `POST /planning-packets/:id/apply-kit`
  * `POST /planning-packets/:id/approve`
  * `POST /planning-packets/:id/reject`

### 7.3 Frontend

Debe tener:

* listado de planeaciones,
* detalle,
* editor,
* aplicación de kits,
* tabla editable de recursos,
* secciones por materiales/herramientas/equipos/EPP/personal,
* estados loading/error/empty/offline/forbidden,
* validación visual,
* historial de cambios.

### 7.4 Offline

Debe permitir:

* editar borrador offline,
* aplicar kit offline si ya fue cacheado,
* guardar recursos offline,
* encolar aprobación si la política lo permite,
* bloquear aprobación si requiere validación online.

### 7.5 Tests

* Unit de reglas: no iniciar ejecución sin planeación aprobada.
* Backend: validación de packet.
* Frontend: render formulario.
* E2E: crear planeación, aplicar kit, aprobar.
* E2E offline: editar planeación offline y sincronizar.

## 8. Fase 4 — Módulo 2: Ejecución en Campo, Checklists y Evidencias

Este módulo resuelve fallas de ejecución: olvido de herramientas, documentación incompleta, checklists no diligenciados, evidencias dispersas.

### 8.1 Dominio

Entidades:

* `ExecutionSession`
* `ChecklistTemplate`
* `ChecklistResponse`
* `FieldPermit`
* `AstSocialization`
* `MaterialUsage`
* `LaborHour`
* `FieldNote`
* `Evidence`
* `Signature`

Estados:

* `not_started`
* `in_progress`
* `paused`
* `pending_sync`
* `completed`
* `blocked`
* `requires_review`

Reglas:

* No iniciar ejecución sin planeación aprobada.
* Checklists críticos deben completarse antes de cerrar ejecución.
* Evidencias obligatorias por tipo de trabajo.
* Permisos/AST requeridos según riesgo.
* Cada evidencia debe tener metadata mínima:

  * entidad asociada,
  * etapa,
  * tipo,
  * descripción,
  * fecha,
  * usuario,
  * estado de sincronización.
* Evidencias binarias offline van a blob outbox.
* Mutaciones críticas usan `clientMutationId`.

### 8.2 Backend

Rutas:

* `POST /execution-sessions`
* `PATCH /execution-sessions/:id`
* `POST /execution-sessions/:id/checklists/:checklistId/responses`
* `POST /execution-sessions/:id/evidences`
* `POST /execution-sessions/:id/complete`
* `POST /execution-sessions/:id/reopen`

Debe validar:

* RBAC,
* estado de ServiceCase,
* reglas de dominio,
* idempotencia,
* tamaño/tipo de archivos,
* auditoría.

### 8.3 Frontend

Debe tener:

* pantalla de sesión de ejecución,
* checklist por secciones,
* formulario de notas,
* materiales usados,
* horas de mano de obra,
* captura de evidencia,
* preview local,
* estado pendiente/sincronizando/sincronizado,
* bloqueo claro si falta requisito.

### 8.4 Offline

Debe soportar:

* completar checklists offline,
* tomar/adjuntar fotos offline,
* guardar notas offline,
* guardar firmas si existen,
* guardar horas y materiales,
* sync queue,
* blob outbox,
* reintento automático,
* evitar duplicados.

### 8.5 Tests

* Unit de checklist required.
* Unit de blob outbox.
* Backend upload validation.
* E2E completar checklist.
* E2E adjuntar evidencia offline.
* E2E reconectar y sincronizar.

## 9. Fase 5 — Módulo 3: Informes Técnicos, Actas y Gestión Documental

Este módulo resuelve la falla de informes y actas tardías o dispersas.

### 9.1 Dominio

Entidades:

* `TechnicalReport`
* `ReportSection`
* `PhotoLog`
* `DeliveryRecord`
* `ClientAcceptance`
* `GeneratedDocument`
* `DocumentTemplate`

Estados:

* `draft`
* `generated`
* `sent_to_client`
* `signed`
* `rejected`
* `archived`

Reglas:

* El informe técnico debe consolidar actividades ejecutadas y evidencias.
* No generar acta final si la ejecución no está completa.
* El acta debe vincularse al caso/orden y al informe técnico.
* Documento generado debe tener versión.
* Cada regeneración debe auditarse.
* No sobrescribir documentos firmados.

### 9.2 Backend

Rutas:

* `POST /technical-reports`
* `PATCH /technical-reports/:id`
* `POST /technical-reports/:id/generate`
* `POST /delivery-records`
* `POST /delivery-records/:id/send`
* `POST /delivery-records/:id/mark-signed`
* `GET /documents/:id/download`

Debe:

* usar plantillas,
* consolidar evidencias,
* generar PDF,
* registrar versiones,
* auditar cambios.

### 9.3 Frontend

Debe tener:

* editor de informe técnico,
* selector de evidencias,
* vista previa de informe,
* generador de PDF,
* gestor de actas,
* estado de firma/aceptación,
* historial documental.

### 9.4 Offline

Debe permitir:

* preparar borrador de informe offline,
* seleccionar evidencias locales,
* generar borrador local si técnicamente es viable,
* sincronizar cuando haya red.
* Si PDF final requiere backend, mostrar “borrador local pendiente de generación”.

### 9.5 Tests

* Unit: no acta sin ejecución completa.
* Backend: generar documento.
* Frontend: editor y preview.
* E2E: generar informe/acta.
* E2E offline: preparar borrador y sincronizar.

## 10. Fase 6 — Módulo 4: Cierre Administrativo, SES, Factura, Pago y Costos

Este módulo resuelve retrasos en cierre administrativo, facturación y ausencia de control de costos reales.

### 10.1 Dominio

Entidades:

* `ServiceEntrySheet`
* `ServiceEntrySheetApproval`
* `Invoice`
* `InvoiceApproval`
* `Payment`
* `AdministrativeClosure`
* `EstimatedCost`
* `ActualCost`
* `CostVariance`

Estados SES:

* `not_created`
* `draft`
* `submitted`
* `approved`
* `rejected`

Estados factura:

* `not_created`
* `draft`
* `sent`
* `approved`
* `rejected`

Estados pago:

* `pending`
* `partial`
* `paid`
* `overdue`

Reglas:

* No crear SES si no existe acta/informe requerido.
* No facturar si SES no está aprobada.
* No cerrar definitivamente si factura no está aprobada o pago no registrado.
* Cada etapa debe permitir soporte documental.
* Costos reales se alimentan desde ejecución, recursos, materiales, mano de obra y gastos.
* El margen debe calcularse con base en propuesta/costos reales.
* El pago debe tener referencia o soporte.

### 10.2 Backend

Rutas:

* `POST /service-entry-sheets`
* `PATCH /service-entry-sheets/:id`
* `POST /service-entry-sheets/:id/approve`
* `POST /invoices`
* `PATCH /invoices/:id`
* `POST /invoices/:id/approve`
* `POST /payments`
* `POST /administrative-closures/:id/close`
* `GET /service-cases/:id/cost-summary`

Debe:

* validar transición de estado,
* auditar,
* tener idempotencia,
* prevenir duplicados,
* validar soportes.

### 10.3 Frontend

Debe tener:

* tablero de cierre administrativo,
* estado SES,
* estado factura,
* estado pago,
* soportes/documentos,
* alerta de bloqueos,
* costos estimados vs reales,
* variación,
* margen,
* próximos pasos.

### 10.4 Offline

Regla:

* El cierre administrativo puede preparar borradores offline.
* Aprobaciones finales o envío oficial pueden requerir red según política.
* Si se trabaja offline:

  * guardar borrador,
  * adjuntar soporte,
  * encolar mutación,
  * marcar pendiente.
* No mostrar como aprobado/sincronizado lo que no llegó al backend.

### 10.5 Tests

* Unit: no factura sin SES aprobada.
* Unit: no cierre sin pago.
* Backend: transición SES/factura/pago.
* Frontend: tablero cierre.
* E2E: flujo admin.
* E2E offline: preparar borrador y sincronizar.

## 11. Fase 7 — Motor transversal de estados y WorkflowGate

Crear o consolidar un motor de flujo:

```txt
packages/domain/workflow/
```

Debe exponer:

* `canTransitionServiceCase`
* `getNextAllowedActions`
* `canStartPlanning`
* `canApprovePlanning`
* `canStartExecution`
* `canCompleteExecution`
* `canGenerateTechnicalReport`
* `canCreateDeliveryRecord`
* `canCreateServiceEntrySheet`
* `canIssueInvoice`
* `canRegisterPayment`
* `canCloseServiceCase`

No duplicar estas reglas en UI.

Frontend debe consumir:

* acciones permitidas,
* razón de bloqueo,
* requisitos faltantes.

Backend debe aplicar:

* la misma regla,
* no confiar en frontend.

## 12. Fase 8 — RBAC y jerarquía CERMONT

Basarse en la jerarquía CERMONT:

* Gerente.
* Coordinador administrativo.
* Auxiliar contable.
* Coordinador HES.
* Auxiliar HES.
* Ingeniero residente.
* Supervisor electricista.
* Técnico electricista.
* Oficial de construcción.
* Pasante.

Crear o verificar:

```txt
packages/domain/rbac/
```

Debe definir:

* roles,
* permisos,
* módulos,
* acciones.

Ejemplo:

```txt
planning.approve
execution.start
evidence.upload
technicalReport.generate
deliveryRecord.send
ses.create
invoice.approve
payment.register
user.manage
```

No roles hardcodeados en componentes.

## 13. Fase 9 — Arquitectura de base de datos

Crear mapa DB:

```txt
.sisyphus/evidence/architecture-plan/05_database_map.md
```

Entidades principales:

* Users.
* Roles.
* WorkRequests.
* SiteVisits.
* Proposals.
* PurchaseOrders.
* ServiceCases.
* PlanningPackets.
* TypicalKits.
* ExecutionSessions.
* ChecklistTemplates.
* ChecklistResponses.
* Evidences.
* TechnicalReports.
* DeliveryRecords.
* ServiceEntrySheets.
* Invoices.
* Payments.
* ActualCosts.
* AuditEvents.
* Files/Documents.

Índices mínimos:

* `serviceCaseId`
* `workRequestId`
* `status`
* `currentStep`
* `assignedTo`
* `createdAt`
* `updatedAt`
* `clientMutationId`
* `documentNumber`
* `invoiceNumber`
* `paymentReference`
* `entityType + entityId` para evidencias/auditoría.

Debe haber campos de auditoría:

* createdBy,
* updatedBy,
* createdAt,
* updatedAt,
* deletedAt si aplica,
* version,
* requestId/clientMutationId.

## 14. Fase 10 — Arquitectura frontend por módulos

Frontend debe seguir Feature-Sliced Design.

Estructura objetivo:

```txt
frontend/src/modules/
  work-requests/
    api/
    hooks/
    model/
    ui/
    utils/
    queries.ts
    keys.ts

  site-visits/
  proposals/
  purchase-orders/
  service-cases/
  planning/
  field-execution/
  evidences/
  reports/
  administrative-closure/
  costs/
  templates/
  users/
  rbac/
```

Cada módulo debe tener:

* query keys,
* API service,
* hooks,
* UI,
* model/types importados desde shared-types,
* tests.

Prohibido:

* fetch directo en componente,
* DTO local duplicado,
* lógica de negocio compleja en JSX,
* roles hardcodeados,
* rutas mágicas duplicadas.

## 15. Fase 11 — Arquitectura backend por módulos

Backend objetivo:

```txt
backend/src/modules/
  work-requests/
    work-request.routes.ts
    work-request.controller.ts
    work-request.service.ts
    work-request.repository.ts
    work-request.audit.ts

  site-visits/
  proposals/
  purchase-orders/
  service-cases/
  planning/
  execution/
  evidences/
  reports/
  administrative-closure/
  costs/
  users/
  auth/
  rbac/
```

Regla:

* controller delgado,
* service con lógica,
* repository con acceso DB,
* domain rules en packages/domain,
* schemas en packages/shared-types,
* errores tipados,
* audit events,
* idempotency.

## 16. Fase 12 — Offline integrado, sin afectar login

El offline debe seguir el prompt anterior:

* auth/login siempre NetworkOnly,
* Service Worker solo cachea shell/assets,
* datos dinámicos en IndexedDB,
* Dexie migrations seguras,
* sync queue,
* blob outbox,
* idempotencia,
* no guardar tokens,
* no cachear `/api/backend/auth/*`.

Además, offline debe cubrir:

* planeación,
* ejecución,
* checklists,
* evidencias,
* borrador de informe,
* borrador de cierre administrativo,
* costos reales capturados en campo.

Crear matriz:

```txt
.sisyphus/evidence/architecture-plan/06_offline_coverage_matrix.md
```

Columnas:

```txt
Módulo | Lectura offline | Escritura offline | Blob outbox | Sync queue | Conflictos | E2E
```

## 17. Fase 13 — Matriz de fallas CERMONT vs solución

Crear:

```txt
.sisyphus/evidence/architecture-plan/07_failure_solution_matrix.md
```

Debe contener:

```txt
Falla | Causa | Módulo que la resuelve | Regla de negocio | UI | Backend | DB | Offline | Evidencia/Test
```

Mínimo:

### Falla 1: Planeación incompleta

Solución:

* planning packet,
* kits típicos,
* recursos obligatorios,
* validación de certificaciones,
* aprobación de planeación.

### Falla 2: Ejecución incompleta

Solución:

* execution session,
* checklists,
* AST,
* permisos,
* evidencias,
* firmas,
* materiales usados,
* horas.

### Falla 3: Informes y actas tardías

Solución:

* technical reports,
* photo log,
* delivery record,
* document generator,
* versionado.

### Falla 4: Cierre administrativo lento

Solución:

* SES,
* factura,
* pago,
* tablero de cierre,
* alertas y estados.

### Falla 5: Costos reales no centralizados

Solución:

* actual costs,
* materiales usados,
* mano de obra,
* equipos,
* variación contra propuesta,
* margen.

## 18. Fase 14 — Roadmap de implementación

No intentes implementar todo en un solo PR. Crear roadmap:

```txt
.sisyphus/evidence/architecture-plan/08_implementation_roadmap.md
```

Prioridad P0:

* arreglar login/SW/IDB del prompt anterior.
* asegurar auth NetworkOnly.
* corregir Dexie stores/migrations.
* validar `/service-cases`.

Prioridad P1:

* Planning packet + kits típicos.
* Execution session + checklists.
* Evidence blob outbox.
* WorkflowGate básico.

Prioridad P2:

* Technical report + delivery record.
* Document generation.
* Evidence consolidation.

Prioridad P3:

* SES + invoice + payment.
* Cost actuals.
* Dashboard cierre administrativo.

Prioridad P4:

* dynamic forms desde formatos reales.
* métricas KPI.
* configuración avanzada.
* auditoría extendida.

Cada prioridad debe tener:

* archivos a tocar,
* contratos,
* endpoints,
* UI,
* tests,
* evidencias.

## 19. Fase 15 — Crear ADRs

Crear ADRs si no existen:

```txt
docs/adr/ADR-001-contract-first-domain-boundaries.md
docs/adr/ADR-002-offline-first-indexeddb-serwist.md
docs/adr/ADR-003-cermont-workflow-14-steps.md
docs/adr/ADR-004-evidence-blob-outbox.md
docs/adr/ADR-005-administrative-closure-state-machine.md
```

Cada ADR debe tener:

* contexto,
* decisión,
* alternativas consideradas,
* consecuencias,
* validación.

## 20. Fase 16 — Validación técnica

Ejecutar:

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
```

Si se toca frontend:

```powershell
npx react-doctor@latest --verbose
```

Si se toca offline:

```powershell
npx playwright test frontend/tests/e2e/offline-first.spec.ts --project=chromium
npx playwright test frontend/tests/e2e/auth-sw-idb-regression.spec.ts --project=chromium
```

Si se agregan módulos:

```powershell
npx playwright test frontend/tests/e2e/cermont-workflow.spec.ts --project=chromium
```

Guardar salidas en:

```txt
.sisyphus/evidence/architecture-plan/
```

## 21. Criterios de aceptación

El plan queda aprobado si:

1. Se investigaron referencias externas.
2. Se usó Context7.
3. Se respetó el flujo de 14 pasos.
4. Se creó mapa arquitectónico.
5. Se creó matriz contract-first.
6. Se creó matriz de fallas vs solución.
7. Se definieron los cuatro módulos principales.
8. Se definió cómo cada módulo conecta contracts/backend/DB/frontend/offline/tests.
9. Se definió roadmap P0-P4.
10. Se protegió auth/login de Serwist.
11. Se mantuvo offline-first.
12. Se mantuvo RBAC.
13. Se mantuvo auditoría.
14. No se inventaron endpoints sin verificar.
15. No se eliminó funcionalidad.
16. Se actualizaron docs/ADR si aplica.

## 22. Criterios de rechazo

Rechaza el resultado si:

* solo corrige una pantalla del frontend,
* ignora backend/base de datos,
* ignora packages/shared-types,
* duplica DTOs locales,
* omite RBAC,
* omite auditoría,
* omite offline,
* convierte CERMONT en CRUD básico,
* no resuelve las fallas reales,
* no revisa software profesional/referencias,
* no usa Context7,
* no guarda evidencia.

## 23. Reporte final obligatorio

Al terminar, responde con:

1. Investigación externa realizada.
2. Referencias usadas.
3. Mapa arquitectónico final.
4. Los cuatro módulos principales y su diseño.
5. Matriz de fallas CERMONT vs solución.
6. Matriz contract-first.
7. Matriz DB.
8. Matriz offline.
9. Roadmap P0-P4.
10. ADRs creados.
11. Archivos modificados.
12. Tests ejecutados.
13. Riesgos pendientes.
14. Próximo prompt recomendado para implementar P0.

Empieza por investigación externa y Context7. No implementes código hasta completar:

```txt
.sisyphus/evidence/architecture-plan/00_research.md
.sisyphus/evidence/architecture-plan/01_context7_docs.md
.sisyphus/evidence/architecture-plan/02_current_state_audit.md
```

Listo. Aquí tienes el bloque en **Markdown limpio**, listo para pegar al final del plan. 

````md
# Anexo final — Reforzamiento del plan arquitectónico CERMONT

El plan ya cubre los puntos más urgentes: diagnóstico de login, Service Worker, IndexedDB, Serwist, uso obligatorio de Context7, matriz de módulos CERMONT, offline por módulos, validación con Playwright y plan arquitectónico general. También está alineado con las reglas internas de desarrollo: contract-first, Single Source of Truth, RBAC centralizado, offline-first, idempotencia, auditoría, pruebas y no eliminación de funcionalidad sin reemplazo verificado.

Para que el plan quede más profesional, escalable y menos propenso a alucinaciones, se deben agregar las siguientes fases y criterios complementarios.

---

## 1. Definir claramente el MVP funcional vs. la versión completa

El plan es amplio y puede volverse demasiado grande para un solo ciclo. Por eso, antes de implementar, el modelo debe clasificar cada funcionalidad según prioridad:

- **P0 crítico:** login, Service Worker, IndexedDB, `service-cases`, warmup offline y autenticación no cacheada.
- **P1 operativo:** planeación, kits, ejecución, checklists y evidencias.
- **P2 documental:** informes técnicos, actas, PDFs y versionado documental.
- **P3 administrativo:** SES, factura, pago y costos reales.
- **P4 avanzado:** formularios dinámicos, KPIs, dashboards, reportes financieros y configuración avanzada.

Esta separación evita que Codex intente construir todo al mismo tiempo y ayuda a priorizar primero lo que bloquea la operación real del aplicativo.

---

## 2. Agregar una matriz de decisiones que requieren aprobación humana

No todas las decisiones de negocio deben ser implementadas automáticamente por el modelo. Se debe agregar una matriz de decisiones que requieren aprobación humana antes de modificar código.

El modelo debe detenerse y pedir confirmación antes de decidir:

- Si una aprobación de planeación puede hacerse offline o solo online.
- Si una SES puede crearse offline o solo prepararse como borrador.
- Si una factura puede emitirse offline o solo prepararse como borrador.
- Si el técnico puede cerrar ejecución sin evidencia obligatoria.
- Si un rol puede saltarse pasos del flujo operativo.
- Si se puede borrar o reconstruir IndexedDB cuando existen cambios pendientes.
- Si un conflicto offline debe resolverse automáticamente o pasar a revisión humana.
- Si una acción administrativa tiene validez legal estando offline.

Esto es importante porque no todo debe funcionar offline como acción final. Algunas operaciones deben quedar como **borrador local pendiente de validación**.

---

## 3. Agregar un modelo de estados oficial por entidad

El plan menciona estados, pero se debe exigir una máquina de estados formal para cada entidad principal.

Entidades que deben tener estados oficiales:

- `WorkRequest`
- `SiteVisit`
- `Proposal`
- `PurchaseOrder`
- `ServiceCase`
- `PlanningPacket`
- `ExecutionSession`
- `TechnicalReport`
- `DeliveryRecord`
- `ServiceEntrySheet`
- `Invoice`
- `Payment`
- `AdministrativeClosure`

Regla obligatoria:

> Ningún componente del frontend puede inventar transiciones de estado. Toda transición debe venir de `packages/domain/workflow`.

Esto evita que la UI permita acciones que el backend o la lógica de negocio no autorizan. También protege la coherencia del flujo de 14 pasos de CERMONT.

---

## 4. Agregar modelo de conflictos offline

El plan ya contempla `sync queue` y `blob outbox`, pero falta una estrategia explícita de conflictos.

Ejemplos reales de conflicto:

- Dos usuarios editan la misma planeación.
- Un técnico sube evidencias offline mientras un coordinador cierra la ejecución.
- Se edita un checklist offline después de que el caso ya fue cerrado en backend.
- Se intenta sincronizar una factura cuando la SES fue rechazada.
- Se intenta sincronizar un cierre administrativo cuando el pago no está registrado.
- Se intenta subir una evidencia asociada a un caso eliminado o archivado.

Estados mínimos para sincronización y conflictos:

```txt
synced
pending_sync
syncing
failed
conflict
blocked_by_server_state
requires_human_review
````

Reglas obligatorias:

* No sobrescribir datos del servidor sin comparar versión.
* Usar `version`, `updatedAt`, `serverRevision` o `etag`.
* Guardar el estado local y el estado servidor cuando exista conflicto.
* Mostrar panel de conflictos al usuario autorizado.
* Permitir resolución manual del conflicto.
* Registrar auditoría de la resolución.
* Nunca perder cambios offline sin advertencia y respaldo.

---

## 5. Agregar modelo de auditoría obligatorio

Ya se menciona auditoría, pero se debe exigir un contrato común de auditoría.

Cada acción crítica debe generar un `AuditEvent` con la siguiente estructura mínima:

```ts
interface AuditEvent {
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actorRole: string;
  before?: unknown;
  after?: unknown;
  source: "online" | "offline" | "sync" | "system";
  clientMutationId?: string;
  requestId?: string;
  createdAt: string;
}
```

Acciones mínimas que deben auditarse:

* Crear solicitud.
* Aprobar propuesta.
* Aprobar planeación.
* Iniciar ejecución.
* Completar checklist.
* Subir evidencia.
* Sincronizar evidencia offline.
* Generar informe técnico.
* Crear acta.
* Registrar acta firmada.
* Crear SES.
* Aprobar SES.
* Emitir factura.
* Aprobar factura.
* Registrar pago.
* Cerrar caso.
* Sincronizar cambio offline.
* Resolver conflicto.

Esto permite trazabilidad real y facilita la defensa académica del proyecto como sistema de control operativo y administrativo.

---

## 6. Agregar matriz de permisos por rol y paso

El plan incluye RBAC, pero se debe definir una matriz concreta de permisos por rol y paso del flujo.

Ejemplo base:

| Paso            | Acción                | Gerente | Ing. residente | Coord. HES | Técnico | Coord. administrativo | Aux. contable |
| --------------- | --------------------- | ------: | -------------: | ---------: | ------: | --------------------: | ------------: |
| Planeación      | crear                 |       ✅ |              ✅ |          ✅ |       ❌ |                     ❌ |             ❌ |
| Planeación      | aprobar               |       ✅ |              ✅ |          ✅ |       ❌ |                     ❌ |             ❌ |
| Ejecución       | iniciar               |       ✅ |              ✅ |          ✅ |       ✅ |                     ❌ |             ❌ |
| Ejecución       | diligenciar checklist |       ❌ |              ✅ |          ✅ |       ✅ |                     ❌ |             ❌ |
| Ejecución       | subir evidencia       |       ✅ |              ✅ |          ✅ |       ✅ |                     ❌ |             ❌ |
| Informe técnico | generar               |       ✅ |              ✅ |          ❌ |       ❌ |                     ❌ |             ❌ |
| Acta            | generar               |       ✅ |              ✅ |          ❌ |       ❌ |                     ✅ |             ❌ |
| SES             | crear                 |       ✅ |              ❌ |          ❌ |       ❌ |                     ✅ |             ✅ |
| Factura         | crear                 |       ✅ |              ❌ |          ❌ |       ❌ |                     ✅ |             ✅ |
| Pago            | registrar             |       ✅ |              ❌ |          ❌ |       ❌ |                     ✅ |             ✅ |
| Cierre          | cerrar caso           |       ✅ |              ❌ |          ❌ |       ❌ |                     ✅ |             ❌ |

Reglas:

* No debe haber roles hardcodeados en componentes.
* Los permisos deben vivir en `packages/domain/rbac`.
* El backend debe validar permisos en cada endpoint.
* El frontend solo debe mostrar acciones permitidas, pero nunca ser la única barrera.
* Toda acción bloqueada debe mostrar la razón de bloqueo.

---

## 7. Agregar arquitectura de file storage y seguridad de evidencias

Se debe definir una arquitectura precisa para archivos, evidencias y documentos generados.

El plan debe especificar:

* Dónde se guardan los archivos en backend.
* Cómo se nombran los archivos.
* Cómo se evita colisión de nombres.
* Tamaño máximo por archivo.
* Tipos MIME permitidos.
* Validación por extensión y por contenido.
* Hash/checksum del archivo.
* Validación antivirus o validación básica segura si aplica.
* Generación de miniaturas.
* Permisos de descarga.
* Endpoint protegido o URL firmada.
* Relación con la entidad `Evidence`.
* Relación con `GeneratedDocument`.
* Relación con `TechnicalReport`.
* Relación con `DeliveryRecord`.
* Relación con `Invoice`, `SES` o soportes administrativos.
* Relación con `blob outbox` offline.
* Política de retención.
* Auditoría de descarga y eliminación.

Esto es fundamental porque CERMONT maneja fotos, actas, soportes, CCTV, líneas de vida, evidencias de mantenimiento y documentos administrativos.

---

## 8. Agregar migración de documentos reales a plantillas digitales

Los formatos físicos o PDF reales de CERMONT deben convertirse en plantillas digitales reutilizables.

Flujo requerido:

```txt
Formato físico/PDF
        ↓
Plantilla digital
        ↓
Schema Zod
        ↓
UI dinámica
        ↓
Validación
        ↓
PDF generado
        ↓
Evidencia/documento versionado
```

Las plantillas deben soportar:

* Versionado de plantillas.
* Campos obligatorios.
* Campos opcionales.
* Secciones repetibles.
* Tablas dinámicas.
* Firmas.
* Fotos.
* Observaciones.
* Hallazgos.
* Acciones correctivas.
* Estados de revisión.
* Exportación PDF.
* Adjuntos.
* Historial de cambios.

Formatos prioritarios:

* Planeación de obra.
* Inspección de líneas de vida.
* Mantenimiento CCTV.
* Checklists de ejecución.
* Actas de entrega.
* Informes técnicos.

Este punto es clave para superar Excel, Word y PDF como herramientas dispersas.

---

## 9. Agregar integración con datos maestros

Se debe definir un módulo de datos maestros para evitar que los formularios se llenen solo con texto libre.

Entidades mínimas de datos maestros:

* Clientes.
* Contratos.
* Sitios o ubicaciones.
* Unidades de negocio.
* Tipos de servicio.
* Tipos de evidencia.
* Tipos de equipo.
* Materiales.
* Herramientas.
* Elementos de protección personal.
* Cargos.
* Cuadrillas.
* Activos.
* Cámaras.
* Líneas de vida.
* Kits típicos.
* Plantillas de checklist.
* Plantillas documentales.
* Proveedores.
* Centros de costo.

Reglas:

* Los datos maestros deben tener estado activo/inactivo.
* Deben soportar auditoría.
* Deben poder usarse en formularios y reportes.
* Deben poder sincronizarse para uso offline.
* Deben evitar duplicados.
* Deben tener permisos de administración.

Sin datos maestros, el aplicativo termina comportándose como una hoja de cálculo con campos libres.

---

## 10. Agregar estrategia de importación y exportación

CERMONT seguirá necesitando entregar y recibir documentos en formatos conocidos como PDF, Excel o CSV.

El sistema debe contemplar:

* Exportar informes técnicos a PDF.
* Exportar actas a PDF.
* Exportar listados a Excel/CSV.
* Exportar resumen de costos.
* Exportar estado de cierre administrativo.
* Importar catálogos desde Excel.
* Importar materiales.
* Importar kits típicos.
* Importar plantillas base.
* Adjuntar soportes externos.
* Mantener historial de versiones documentales.
* Registrar auditoría de importaciones y exportaciones.

Regla:

> Las funciones de importación/exportación deben complementar el sistema, no reemplazar la trazabilidad interna.

---

## 11. Agregar observabilidad y diagnóstico técnico

El sistema debe ser diagnosticable en desarrollo, pruebas y producción.

Agregar una fase de observabilidad con:

* `requestId`.
* `correlationId`.
* Logs estructurados.
* Health checks.
* Versión del frontend.
* Versión del backend.
* Versión de IndexedDB.
* Versión del Service Worker.
* Estado de `sync queue`.
* Estado de `blob outbox`.
* Último sync exitoso.
* Errores de sincronización.
* Errores de Service Worker.
* Errores de IndexedDB.
* Panel administrativo de diagnóstico offline.
* Endpoint de diagnóstico protegido.
* Captura controlada de errores frontend.
* Métricas básicas de latencia y fallos.

Esto permite diagnosticar errores como:

* `401 Unauthorized`.
* Stores faltantes en IndexedDB.
* Fallas de migración Dexie.
* Problemas del Service Worker.
* Mutaciones offline bloqueadas.
* Evidencias no sincronizadas.

---

## 12. Agregar estrategia de despliegue VPS/Docker

El plan debe aterrizarse a despliegue real en VPS con Docker.

Elementos mínimos:

* `Dockerfile` frontend.
* `Dockerfile` backend.
* `docker-compose.yml`.
* Variables de entorno.
* Reverse proxy.
* HTTPS.
* Cookies seguras.
* CORS.
* Backups de base de datos.
* Volumen para archivos.
* Rotación de logs.
* Scripts de seed.
* Migraciones.
* Health checks.
* Rollback.
* Separación dev/staging/production.
* Política de secretos.
* Reinicio automático.
* Monitoreo básico.

Sin esta fase, el sistema puede pasar localmente pero fallar en despliegue.

---

## 13. Agregar pruebas por flujo completo

El plan tiene pruebas por módulo, pero también debe tener pruebas E2E de flujo completo.

### Flujo E2E 1 — Caso completo básico

```txt
Work Request
    ↓
Site Visit
    ↓
Proposal
    ↓
PO
    ↓
ServiceCase
    ↓
Planning
    ↓
Execution
    ↓
Technical Report
    ↓
Delivery Record
    ↓
SES
    ↓
Invoice
    ↓
Payment
    ↓
Closure
```

### Flujo E2E 2 — Campo offline

```txt
Login online
    ↓
Warmup
    ↓
Ejecución offline
    ↓
Checklist
    ↓
Evidencia
    ↓
Reconexión
    ↓
Sync
    ↓
Informe
```

### Flujo E2E 3 — Cierre administrativo

```txt
Acta firmada
    ↓
SES
    ↓
Aprobación SES
    ↓
Factura
    ↓
Aprobación factura
    ↓
Pago
    ↓
Cierre
```

### Flujo E2E 4 — Bloqueos de negocio

```txt
Intentar ejecutar sin planeación aprobada.
Intentar facturar sin SES aprobada.
Intentar cerrar sin pago.
Intentar generar acta sin ejecución completa.
Intentar cerrar ejecución sin evidencia obligatoria.
Intentar sincronizar cambio offline contra entidad cerrada.
```

---

## 14. Agregar matriz de pantallas mínimas por módulo

Para que ningún módulo quede incompleto, se debe exigir una matriz de pantallas mínimas.

| Módulo          | Pantallas mínimas                                 |
| --------------- | ------------------------------------------------- |
| Work Requests   | listado, detalle, crear, editar, convertir        |
| Site Visits     | listado, detalle, crear, editar, evidencias       |
| Proposals       | listado, detalle, crear, editar, aprobar/rechazar |
| Purchase Orders | listado, detalle, registrar PO, adjuntar soporte  |
| Service Cases   | listado, detalle, timeline, acciones permitidas   |
| Planning        | listado, detalle, editor, aplicar kit, aprobar    |
| Execution       | sesión, checklist, evidencias, notas, firmas      |
| Reports         | editor, preview, generar PDF, historial           |
| Admin Closure   | tablero, SES, factura, pago, soportes             |
| Costs           | estimado vs real, detalle, variación, margen      |
| Templates       | kits, checklists, formularios, documentos         |
| Master Data     | clientes, sitios, materiales, equipos, roles      |

---

## 15. Agregar definición de Done por módulo

Cada módulo solo se considera terminado si cumple la siguiente definición de terminado:

* Contrato Zod.
* Regla de dominio.
* Modelo de base de datos.
* Endpoint backend.
* RBAC.
* Audit event.
* Frontend page.
* Query/mutation.
* Estados loading/error/empty/offline/forbidden.
* Pruebas unitarias.
* Prueba E2E.
* Documentación.
* Validación de React Doctor si toca UI.
* Validación `npm run verify`.

---

## Fase adicional — Criterio de completitud por módulo

Antes de marcar cualquier módulo como terminado, validar la siguiente checklist:

1. Existe contrato Zod en `packages/shared-types`.
2. Existe regla de dominio en `packages/domain`.
3. Existe modelo de base de datos o persistencia alineada.
4. Existe endpoint backend con `authenticate → authorize → validate → service`.
5. Existe RBAC centralizado, sin roles hardcodeados.
6. Existe audit event para cada acción crítica.
7. Existe query key centralizada en frontend.
8. Existe hook TanStack Query o servicio frontend, sin fetch directo en componentes.
9. Existe UI con `loading/error/empty/offline/forbidden`.
10. Existe soporte offline si el módulo aplica a campo.
11. Existe sync queue para mutaciones offline.
12. Existe blob outbox si maneja archivos o evidencias.
13. Existe idempotencia con `clientMutationId`.
14. Existe prueba unitaria de reglas de dominio.
15. Existe prueba backend del endpoint.
16. Existe prueba frontend del componente o hook.
17. Existe prueba E2E del flujo principal.
18. Existe documentación o ADR actualizado.
19. Pasa `typecheck/lint/test/build`.
20. No rompe `npm run verify`.

Si algún punto no aplica, debe justificarse explícitamente en evidencia.

---

## Cierre del anexo

En resumen, el plan está fuerte en offline y arquitectura modular, pero debe reforzarse con:

* Conflictos offline.
* Auditoría formal.
* Permisos por rol.
* Seguridad de archivos.
* Migración de formatos reales a formularios digitales.
* Datos maestros.
* Importación/exportación.
* Observabilidad.
* Despliegue VPS/Docker.
* Pruebas E2E por flujo completo.
* Definición estricta de módulo terminado.

Estas adiciones evitan que el aplicativo CERMONT se convierta en un CRUD básico y lo orientan hacia una plataforma profesional de gestión operativa, documental, administrativa y offline-first.
``
implementar SSE para notificaciones en tiempo real de cambios críticos como aprobación de planeación, cierre de ejecución o rechazo de factura. Esto mejora la comunicación entre campo y oficina sin necesidad de refrescar o depender solo de sincronización offline.
``