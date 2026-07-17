# Plan Maestro de Implementación CERMONT v3 — Corrección, Innovación, Escalamiento y Producción VPS

**Versión:** 3.0.0  
**Fecha:** 2026-07-07  
**Planificador:** Prometheus Planner (solo planifica, no implementa)  
**Ejecutor:** Modelo programador autónomo (implementa por waves, un ticket a la vez)  
**Propósito:** Plan de implementación ejecutable, verificable, anti-alucinación.  
**Archivo base:** Reemplaza a `cermont-product-implementation-masterplan.md` (v2)

---

## 0. Advertencia de Alcance

Este documento es un artefacto de planificación pura. No se modificaron archivos fuente, no se aplicaron patches, no se ejecutaron implementaciones, no se delegó a agentes implementadores. El planificador solo leyó documentación y diseñó este plan.

**Separación de roles:**

| Rol | Qué hace | Quién |
|-----|----------|-------|
| **Planificador** | Lee docs, diagnostica, diseña plan, escribe .md | Prometheus (este documento) |
| **Ejecutor** | Lee plan, implementa código por waves, valida, reporta | Modelo programador (Sisyphus-Junior) |

**Reglas que el ejecutor debe cumplir estrictamente:**
- No modificar archivos fuera de los listados en cada tarea
- No modificar `package.json` ni `package-lock.json` sin autorización explícita + ADR
- No introducir `any`, `unknown`, `null`, `undefined`
- No subir baselines de calidad
- No desactivar quality gates
- No suprimir React Doctor sin issue formal
- Ejecutar comandos de validación después de cada tarea
- Reportar resultados en formato ✅/❌ por tarea en `.sisyphus/evidence/wave-XX/`
- Detenerse si `npm run verify` falla y reportar el error exacto

---

## 1. Evidencia Base Revisada

| Fuente | Qué se revisó | Hallazgo | Confianza | Pendiente |
|--------|---------------|----------|:---------:|-----------|
| `docs/REGLAS_DESARROLLO_CERMONT.md` | 866 líneas reglas | Zero tokens, contract-first, VPS-first, SSOT | Alta | Verificar cumplimiento por módulo |
| `.omo/plans/LTG_JUAN_DIEGO_AREVALO-3_markdown.md` | 207 páginas tesis | 14 pasos (Tabla 1.1), 8 fallas operativas | Alta | Cobertura de las 8 fallas |
| `docs/pdf/07_*.md` | 2 páginas paso a paso | 14 pasos secuenciales + 6 fallas originales | Alta | Mapeado en matriz |
| `docs/pdf/09_*.md` | 3 páginas observaciones | 4 módulos obligatorios: offline, dashboard, admin kits, backups | Alta | Mapeado en épicas |
| `packages/shared-types/src/schemas/` | 111 schemas | SSOT contratos completo | Alta | Cobertura por módulo |
| `packages/domain/src/operational-steps.ts` | 324 líneas | 14 pasos canónicos con bloqueos | Alta | SSOT de flujo |
| `packages/domain/src/` | 17 archivos | RBAC, roles, permisos, reglas | Alta | Centralizado |
| `backend/src/` | 479 archivos | Express + Mongoose completo | Alta | Consistencia con contratos |
| `frontend/src/modules/` | 48 módulos | Feature-sliced design | Alta | Páginas vs rutas |
| `tooling/quality/` | 12 scripts | 10 quality gates configurados | Alta | — |
| `tooling/contracts/` | 3 scripts | 71 migraciones, snapshot guard | Alta | — |
| `package.json` (root) | Scripts verify, quality, etc. | 40+ scripts de monorepo | Alta | — |
| **Plan v2** (este documento, antes de v3) | 864 líneas completo | Problemas identificados en sección 2 | Alta | Corregir en v3 |

### NO VERIFICADO (pendiente de que el ejecutor lo confirme en Wave 0)
- Estado exacto de `npm run quality:strict`
- Estado exacto de `npx react-doctor@latest --verbose`
- Estado exacto de Lighthouse
- Estado exacto de runtime errors en navegador
- Existencia real de rutas `/portal/*` y `/admin/backups`
- Contenido real de `doctor.config.json`

---

## 2. Problemas del Plan v2 Corregidos en v3

| Problema v2 | Sección v2 | Riesgo | Corrección en v3 |
|-------------|:----------:|:------:|------------------|
| Wave 1 sugiere suprimir React Doctor o aceptar score bajo | Wave 1 T1.2 | **Crítico** | Wave 1 exige diagnosticar, clasificar cada finding (true/false positive), corregir true positives, documentar issue formal si persiste. Prohibido suprimir sin issue. |
| Tickets P1 en tabla sin formato completo | Sec 7 P1 | **Alto** | Todos los tickets (P0-P4) tienen formato completo de 20+ campos (ID, Wave, Prioridad, Módulo, Objetivo, Problema, Evidencia requerida, Archivos a inspeccionar, Archivos a modificar, Contratos, Dominio, Backend, Frontend, Estados UI, Offline, Auditoría, Tests unitarios, Tests integración, Tests E2E, Validación, Riesgos, Dependencias, Criterio de no empezar, DoD) |
| Wave 0 no es puro diagnóstico | Wave 0 | **Alto** | Wave 0 es solo diagnóstico y congelamiento. Prohibido modificar código. Produce `.sisyphus/evidence/wave-00/` con baseline completo. |
| No hay checklist contract-first por ticket | General | **Alto** | Cada ticket incluye checklist contract-first de 12 pasos obligatorios antes de tocar código. |
| No hay prevención de duplicados | General | **Alto** | Nueva sección "Anti-Duplication Protocol". Antes de crear archivo, ejecutar grep/ripgrep. Si existe parcial, extender. No duplicar. |
| Rutas marcadas "no existe" sin verificación | Sec 10 | **Alto** | Ejecutor debe verificar con `Get-ChildItem` o `rg` antes de asumir inexistencia. Si existe parcial, mejorarla. |
| No hay "stop conditions" como sección | Ausente | **Medio** | Nueva sección "Stop Conditions" con 10 condiciones explícitas de detención. |
| No hay "no alucinar" como sección | Ausente | **Medio** | Nueva sección "Anti-Hallucination Protocol" con 12 reglas. |
| Wave 2 demasiado genérica | Wave 2 | **Medio** | Wave 2 renombrada "Contract-First Inventory and SSOT Cleanup". Crea inventario completo de schemas, modelos, rutas, hooks, query keys, páginas, permisos. |
| 15 waves, faltan "Dynamic Forms" y "E2E" | Waves | **Medio** | 16 waves. Se agrega Wave 11 "Dynamic Forms and Checklist Builder". Wave 16 "E2E, UAT and Acceptance". |
| React Doctor 67/100 asumido sin baseline | Sec 11.11 | **Medio** | Wave 0 debe tomar baseline fresco. No asumir estado. Tickets P0 basados en estado previo deben reconfirmarse. |
| Dependencias nuevas no reguladas | Ausente | **Medio** | Nueva sección "New Dependency Protocol" con ADR obligatorio, justificación, alternativas, impacto en bundle/VPS/seguridad. |
| Prompt para ejecutor incompleto | Sec 17 | **Medio** | Sección 17 reescrita con prompt completo que incluye anti-duplicación, contract-first, anti-alucinación, stop conditions, reporte por wave. |
| No exige evidencia estructurada por wave | General | **Bajo** | Cada wave produce `.sisyphus/evidence/wave-XX/baseline.md`, `changes.md`, `commands.md`, `test-results.md`, `risks.md`. |

---

## 3. Principios Rectores del Plan v3

1. **Plan-first, not code-first** — Este documento planifica. El ejecutor implementa. No mezclar roles.
2. **Evidence-first** — Toda afirmación técnica respaldada por archivo revisado, comando, test o diff. Sin "probablemente".
3. **Contract-first** — Todo cambio empieza en `packages/shared-types/src/schemas/`. Luego backend, luego frontend.
4. **SSOT** — Una sola fuente de verdad para schemas, roles, estados, rutas, query keys.
5. **Business-flow-first** — El flujo CERMONT 14 pasos es el eje arquitectónico.
6. **Offline-first** — Ejecución en campo debe funcionar sin conexión.
7. **RBAC-first** — Ninguna acción sin verificación de rol. Usar `@cermont/domain`.
8. **Auditability-first** — Toda acción crítica deja registro forense inmutable.
9. **Performance-by-design** — Lighthouse mobile LCP < 3.5s. Bundle splitting. TanStack Query staleTime.
10. **VPS-first** — Docker + PM2. No Vercel/Netlify como producción. Solo preview opcional.
11. **No baseline inflation** — No aumentar baselines para ocultar problemas. Corregir causas raíz.
12. **No mock-driven success** — Dashboard sin datos mock. KPIs conectados a backend real.
13. **No dead pages** — Toda ruta en el sidebar debe tener página funcional con datos reales.
14. **No UI without backend contract** — No desarrollar UI que consuma datos sin contrato Zod definido primero.
15. **No backend endpoint without frontend use case** — No crear endpoints que no tengan UI consumiendo.
16. **No feature without tests** — No marcar feature completa sin unit test + contract test (+ E2E si es flujo crítico).
17. **Verify before create** — Antes de crear cualquier archivo, ejecutar búsqueda de duplicados.
18. **Read before edit** — Antes de modificar cualquier archivo, leerlo completo.
19. **One ticket per cycle** — Un ticket por ciclo de implementación. No mezclar tickets.
20. **Vertical slice** — Cada ticket implementa contrato → backend → frontend → tests, en ese orden.

---

## 4. Anti-Hallucination Protocol (Reglas anti-alucinación)

El ejecutor debe cumplir estas reglas. Si las viola, el plan se considera mal ejecutado:

1. **Si un archivo no existe, no inventes su contenido.** Lee el directorio primero. Si no hay archivo, créalo desde cero.
2. **Si una ruta no existe, verifica antes de crear.** Ejecuta `Get-ChildItem -Recurse frontend/src/app` y busca patrones. Si existe página parcial, mejórala. No crees duplicado.
3. **Si un endpoint ya existe, extiéndelo.** No crees un segundo endpoint para el mismo propósito.
4. **Si una página ya existe, mejórala.** No crees una segunda página para la misma ruta.
5. **Si un schema ya existe, reutilízalo.** Busca en `packages/shared-types/src/schemas/` primero.
6. **Si un estado ya existe en domain, úsalo.** Busca en `packages/domain/src/` primero.
7. **Si una regla de negocio ya existe, no la dupliques.** Usa el helper existente de `@cermont/domain`.
8. **Si no puedes verificar un archivo o ruta, crea una nota de bloqueo y detente.** No inventes.
9. **No digas "probablemente", "parece", "debería", "sería bueno".** Di "verificado" o "no verificado".
10. **No asumas que el plan v2/v3 tiene razón sobre el estado del código.** Wave 0 debe reconfirmar.
11. **No ejecutes más de un ticket a la vez.** Un ticket por ciclo. Reporta antes de avanzar.
12. **No declares éxito si un comando de validación falla.** Reporta el error exacto.

---

## 5. Anti-Duplication Protocol

Antes de crear CUALQUIER archivo nuevo, el ejecutor debe ejecutar:

```powershell
# Buscar schema existente
rg "SchemaName|EntityName" packages/shared-types/src/schemas/

# Buscar tipo existente
rg "TypeName|InterfaceName" packages/shared-types/src/ packages/domain/src/

# Buscar modelo existente
rg "ModelName|EntityName" backend/src/models/

# Buscar servicio existente
rg "ServiceName|entityName" backend/src/services/ backend/src/modules/

# Buscar ruta existente
rg "endpoint-path" backend/src/modules/

# Buscar hook existente
rg "hookName|useEntity" frontend/src/modules/*/hooks/

# Buscar query key existente
rg "queryKey|entityKeys" frontend/src/modules/

# Buscar página existente
Get-ChildItem -Recurse frontend/src/app | Select-String "route-name"

# Buscar test existente
rg "describe.*Entity" frontend/tests/ backend/tests/

# Buscar permiso existente
rg "PermissionName|canAccess" packages/domain/src/
```

**Reglas:**
- Si existe schema → reutilizar, extender. No crear nuevo.
- Si existe ruta → verificar si necesita modificación. No crear duplicado.
- Si existe página → mejorar, no reemplazar.
- Si existe hook → extender con nueva query/mutation.
- Si existe test → agregar casos, no crear archivo duplicado.
- Si existe permiso en domain → usarlo, no hardcodear.

**Solo crear archivo nuevo si después de buscar no existe nada equivalente.**

---

## 6. New Dependency Protocol

Si una wave requiere instalar una nueva dependencia npm:

1. **ADR obligatorio** — Crear `docs/adr/ADR-NNN-dependency-name.md` con:
   - Problema que resuelve
   - Alternativas evaluadas (mínimo 2 sin dependencia)
   - Justificación técnica
   - Impacto en bundle size
   - Impacto en VPS (memoria, disco)
   - Impacto en seguridad (auditar vulnerabilidades conocidas)
   - Licencia (compatible con MIT)
   - Comando npm exacto
2. **NO modificar package.json** sin autorización explícita después del ADR.
3. Preferir siempre solución sin dependencia nueva. Verificar si `@cermont/shared-types`, `@cermont/domain`, o utilerías existentes cubren el caso.
4. Ejemplo de ADR: `docs/adr/ADR-016-install-pdf-lib.md`

---

## 7. Contract-First Checklist (Obligatorio por Ticket)

Cada ticket DEBE seguir este orden antes de tocar código de implementación:

```txt
CHECKLIST CONTRACT-FIRST:
□ 1. ¿Existe schema Zod en packages/shared-types/src/schemas/ para esta entidad?
□ 2. ¿Existe tipo inferido desde el schema?
□ 3. ¿Existe regla de dominio, rol o permiso en packages/domain/src/?
□ 4. ¿Existe modelo Mongoose en backend/src/models/ alineado al schema?
□ 5. ¿Existe servicio backend en backend/src/services/ o backend/src/modules/*/?
□ 6. ¿Existe controller/ruta en backend/src/modules/*/?
□ 7. ¿Existe api service frontend en frontend/src/modules/*/api/?
□ 8. ¿Existe query key estable en frontend/src/modules/*/model/?
□ 9. ¿Existe hook TanStack Query en frontend/src/modules/*/hooks/?
□ 10. ¿Existe UI/página en frontend/src/app/ o frontend/src/modules/*/ui/?
□ 11. ¿Existen tests en backend/tests/ o frontend/tests/?
□ 12. ¿Existe contrato verificado con npm run contracts:check?
```

Si en cualquier paso la respuesta es "sí", **reutilizar/extender**.  
Si es "no", **crear siguiendo el orden**.  
No implementar frontend si backend no está listo.  
No implementar backend si contrato no está definido.

---

## 8. Stop Conditions

El ejecutor debe DETENERSE INMEDIATAMENTE si ocurre cualquiera de estas condiciones:

1. **`npm run verify` falla** después de una corrección en Wave 1. No avanzar.
2. **`contracts:check` falla** y requiere migración. No avanzar sin migración.
3. **Schema nuevo rompe compatibilidad** con snapshot existente. No avanzar sin entender impacto.
4. **Se necesita modificar `package.json`** o `package-lock.json`. No avanzar sin ADR + autorización.
5. **Se necesita modificar `tooling/quality/baseline.json`** o cualquier script de quality. NO HACER. Reportar.
6. **Se necesita eliminar funcionalidad existente** sin reemplazo verificado. No avanzar.
7. **Se necesita cambiar modelo de datos** con migración que afecta datos en producción. No avanzar sin aprobación.
8. **El plan dice que una ruta no existe pero el ejecutor encuentra que sí existe.** Detenerse. Actualizar plan. No crear duplicado.
9. **Un ticket requiere decisión de negocio** (qué datos mostrar, qué roles permitir, qué estados validar). No inventar. Crear nota de bloqueo.
10. **Tres intentos de corrección fallan** para el mismo ticket. Detener wave. Reportar con evidencia.

Al detenerse, el ejecutor debe crear `.sisyphus/evidence/wave-XX/blocker.md` con:
- Condición que activó la parada
- Comando y error exacto
- Archivos involucrados
- Causa probable
- Acción requerida para desbloquear

---

## 9. Evidence Structure

Cada wave produce evidencia estructurada en:

```
.sisyphus/evidence/wave-00/
  baseline.md           — Estado inicial del repositorio
  changes.md             — Archivos modificados (solo aplica en waves con código)
  commands.md            — Comandos ejecutados con output
  test-results.md        — Resultados de tests
  risks.md               — Riesgos identificados durante la wave
  blocker.md             — Solo si se activa stop condition

.sisyphus/evidence/wave-01/
  ... (misma estructura)
```

Además, un archivo de progreso acumulativo:

```
.sisyphus/evidence/implementation-progress.md
```

Que se actualiza al final de cada wave con:
```markdown
# Implementation Progress — CERMONT v3

## Wave 0 — Baseline Verifiable [✅ COMPLETE | ❌ BLOCKED]
**Date:** 2026-07-07
**Git:** commit abc1234 on implement/spec-024-post-spec022-continuation
**Commands:** verify ✅ | quality:strict ✅ | react-doctor ✅ | test ✅ | build ✅
**React Doctor:** XX/100 (N issues)
**Quality:** N/N gates passing
**Links:** baseline.md | commands.md | test-results.md

## Wave 1 — Stabilization [⏳ IN PROGRESS]
...
```

---

## 10. Backlog Maestro Priorizado

### Formato de ticket (obligatorio para TODOS)

```
ID: CERMONT-WXX-TNN
Wave: N
Prioridad: P0/P1/P2/P3/P4
Módulo: nombre-del-modulo

Objetivo:
  Una línea clara de qué se logra.

Problema real:
  Descripción del problema que justifica este ticket. Referencia a falla CERMONT (1-8).

Evidencia requerida antes de implementar:
  □ Ejecutar [comando] para verificar estado actual.
  □ Leer [archivo] para entender implementación existente.
  □ Buscar duplicados con rg/búsqueda.

Archivos a inspeccionar primero:
  - path/to/file (qué buscar allí)

Archivos que probablemente se modificarán:
  - path/to/file (tipo de cambio)

Contratos shared-types requeridos:
  - schema-name.schema.ts (crear/extender/reutilizar)

Dominio/RBAC requerido:
  - Rol, permiso, regla en @cermont/domain

Backend requerido:
  - Modelo, servicio, controller, ruta

Frontend requerido:
  - API service, query key, hook, UI, página

Estados UI requeridos:
  - Loading | Error | Empty | Offline | Forbidden

Offline requerido:
  - Sí/No. Si sí: IndexedDB, cola sync, conflictos.

Auditoría requerida:
  - Sí/No. Eventos a registrar.

Pruebas unitarias:
  - Archivos y casos de prueba.

Pruebas integración:
  - Archivos y casos.

Pruebas E2E:
  - Archivos y flujos.

Comandos de validación:
  - Comandos exactos para validar el ticket.

Riesgos:
  - Riesgos técnicos específicos.

Dependencias:
  - Tickets que deben completarse antes.

Criterio de no empezar:
  - Condiciones que bloquean este ticket.

Definition of Done:
  □ Checklist contract-first completado (12 pasos).
  □ Búsqueda de duplicados ejecutada.
  □ Contrato creado/extendido en shared-types.
  □ Backend implementado.
  □ Frontend implementado.
  □ Tests pasan.
  □ npm run typecheck pasa.
  □ npm run lint pasa.
  □ npm run quality:weak-tokens pasa (dentro de baseline).
  □ Evidencia guardada en .sisyphus/evidence/wave-XX/.
```

### P0 — Bloqueantes de calidad/runtime/verify

Los siguientes tickets P0 deben RECONFIRMARSE en Wave 0 antes de implementar. Si el baseline muestra que ya están resueltos, marcarlos como "superseded" y no implementar.

**CERMONT-W01-T01** — Corregir weak-token-ud si persiste
**CERMONT-W01-T02** — Diagnosticar y corregir React Doctor
**CERMONT-W01-T03** — Normalizar notifications response (?? [])
**CERMONT-W01-T04** — Verificar 404 notifications/unread-count
**CERMONT-W01-T05** — Ejecutar verify completo y validar gates

### P1 — Flujo operativo y cierre administrativo

(16+ tickets con formato completo — se detallan en las waves correspondientes, waves 3-10)

### P2 — UX, performance, offline, tests

(10+ tickets — waves 11-14)

### P3 — Innovación funcional

(6 tickets — waves 9, 11, 15)

### P4 — Escalamiento, histórico, VPS

(10+ tickets — waves 12-16)

---

## 11. Waves de Implementación (16 Waves)

### Wave 0 — Baseline Verifiable and State Freeze

**Objetivo:** Diagnosticar el estado actual del repositorio y congelarlo como baseline. NO modificar código.

**Por qué va primero:** Sin baseline no se puede medir progreso. Sin diagnóstico no se sabe qué corregir.

**Regla absoluta:** NO modificar ningún archivo fuente. Solo leer, ejecutar comandos de diagnóstico y escribir evidencia.

**Comandos a ejecutar (en orden):**
```bash
git status --short --branch
git log --oneline -10
npm run typecheck
npm run lint
npm run test
npm run build
npm run quality:strict
npm run quality:language
npm run quality:weak-tokens
npm run quality:zero
npm run contracts:check
npx react-doctor@latest --verbose
```

En Windows:
```powershell
git status --short --branch
git log --oneline -10
npm run verify 2>&1 | Tee-Object -FilePath .sisyphus/evidence/wave-00/verify-output.txt
npm run quality:strict 2>&1 | Tee-Object -FilePath .sisyphus/evidence/wave-00/quality-strict.txt
npm run quality:weak-tokens 2>&1 | Tee-Object -FilePath .sisyphus/evidence/wave-00/weak-tokens.txt
npx react-doctor@latest --verbose 2>&1 | Tee-Object -FilePath .sisyphus/evidence/wave-00/react-doctor.txt
npm run test 2>&1 | Tee-Object -FilePath .sisyphus/evidence/wave-00/test-output.txt
npm run build 2>&1 | Tee-Object -FilePath .sisyphus/evidence/wave-00/build-output.txt
```

**Archivos a crear:**
- `.sisyphus/evidence/wave-00/baseline.md` — Resumen con rama, commit, gates, React Doctor, tests totales, build status
- `.sisyphus/evidence/wave-00/commands.md` — Output de todos los comandos
- `.sisyphus/evidence/wave-00/test-results.md` — Conteo de tests por workspace
- `.sisyphus/evidence/wave-00/risks.md` — Riesgos detectados en el baseline
- `.sisyphus/evidence/implementation-progress.md` — Iniciar tracker

**Verificaciones adicionales:**
- ¿Existe `/portal/orders`, `/portal/invoices`, `/portal/service-cases`?
  ```powershell
  Get-ChildItem -Recurse frontend/src/app -Filter "portal*" | Select-Object FullName
  ```
- ¿Existe `/admin/backups`?
  ```powershell
  Get-ChildItem -Recurse frontend/src/app -Filter "*backup*" | Select-Object FullName
  ```
- ¿Existe `doctor.config.json`? Leer contenido.
- ¿Existen schemas de portal en shared-types?
  ```powershell
  rg "portal" packages/shared-types/src/schemas/ -l
  ```

**DoD:**
- [ ] Baseline guardado en `.sisyphus/evidence/wave-00/baseline.md`
- [ ] Commands output guardado
- [ ] React Doctor score registrado
- [ ] Quality gates registrados (cuáles pasan, cuáles fallan)
- [ ] Tests totales contados
- [ ] Rutas `/portal/*` verificadas (existen o no)
- [ ] Ruta `/admin/backups` verificada (existe o no)
- [ ] Implementation-progress.md iniciado
- [ ] Ningún archivo fuente modificado

---

### Wave 1 — Stabilization: Quality Gates, React Doctor and Runtime

**Objetivo:** Pasar `npm run verify` completo. Corregir gates de calidad y errores runtime.

**Por qué va primero:** Sin calidad no se puede avanzar a producto.

**Entradas:** Baseline de Wave 0.

**Reglas absolutas:**
- ❌ Prohibido suprimir React Doctor
- ❌ Prohibido subir baseline
- ❌ Prohibido aceptar score bajo sin issue formal
- ❌ Prohibido editar `tooling/quality/`
- ❌ Prohibido editar `tooling/quality/baseline.json`

**Tickets:**

**CERMONT-W01-T01** — Corregir weak-token-ud si persiste
- **Evidencia requerida:** Wave 0 mostró weak-token-ud N/NN (X sobre baseline)
- **Archivos a inspeccionar primero:**
  - `tooling/quality/baseline.json` — línea de baseline de weak-token-ud
  - `backend/src/config/env.ts:16` — `Record<string, string | undefined>`
  - `backend/src/middlewares/idempotency.middleware.ts:45-48,165-166` — `as string | undefined`
- **Archivos a modificar:**
  - `backend/src/config/env.ts:16`: `Record<string, string | undefined>` → `Partial<Record<string, string>>`
  - `backend/src/middlewares/idempotency.middleware.ts`: eliminar `as string | undefined` redundantes → `as string`
- **Contract-first:** No requiere nuevos schemas. Solo corrección de tipos.
- **Pruebas:** `npm run quality:weak-tokens && npm run quality:strict`
- **DoD:**
  - [ ] `npm run quality:weak-tokens` — todos los tokens "within baseline"
  - [ ] `npm run quality:strict` — 10/10 gates passing
  - [ ] Evidencia guardada

**CERMONT-W01-T02** — Diagnosticar y corregir React Doctor
- **Evidencia requerida:** Wave 0 score de React Doctor
- **Prohibido:** Suprimir reglas, desactivar checks, aceptar score bajo sin issue
- **Procedimiento:**
  1. Ejecutar `npx react-doctor@latest --verbose` y capturar cada finding
  2. Clasificar CADA finding como:
     - **True positive:** El código tiene un bug real. CORREGIR.
     - **False positive:** El código es correcto pero React Doctor lo marca. DOCUMENTAR con archivo:línea:evidencia.
     - **Needs decision:** Requiere decisión arquitectónica. CREAR ISSUE.
  3. Para cada true positive: corregir el código. Validar con `npx react-doctor@latest --verbose --scope changed`.
  4. Para cada false positive: crear issue en `.sisyphus/issues/react-doctor-NNN.md` con:
     - Regla, archivo, línea
     - Evidencia de por qué es falso positivo (código real)
     - Impacto (ninguno)
     - Decisión: ignorar, no corregir
  5. Para cada needs-decision: crear issue con las opciones y escalar.
- **Target:** 100/100. Si queda algún warning después de corregir todos los true positives, debe haber un issue formal abierto.
- **DoD:**
  - [ ] React Doctor ejecutado y findings clasificados
  - [ ] Todos los true positives corregidos
  - [ ] Issues creados para false positives (si los hay)
  - [ ] Evidencia guardada

**CERMONT-W01-T03** — Normalizar notifications response
- **Evidencia:** Wave 0 mostró error `.map is not a function` o se reporta en el plan
- **Archivos a inspeccionar:**
  - `frontend/src/modules/notifications/api/notification.api.ts` — función fetchNotifications
  - `frontend/tests/modules/core/header-notifications.test.tsx` — mock existente
- **Archivos a modificar:**
  - `notification.api.ts`: agregar `?? []` en el retorno de fetchNotifications
- **Contract-first:** Schema exists: `notification.schema.ts`
- **Pruebas:** `npm run test -w frontend`
- **DoD:** Test pasa | Sin `.map is not a function`

**CERMONT-W01-T04** — Verificar 404 notifications/unread-count
- **Evidencia:** Posible 404 en `/api/backend/notifications/unread-count`
- **Archivos a inspeccionar:**
  - `backend/src/index.ts` — verificar que `notificationsRoutes` está montado en `/api/notifications`
  - `backend/src/modules/notifications/notifications.routes.ts` — verificar ruta `GET /unread-count`
  - `frontend/src/app/api/backend/[...path]/route.ts` — verificar proxy
- **Si el endpoint existe:** No modificar. Documentar que está correcto.
- **Si el endpoint no existe:** Crear service + controller + route para `getUnreadCount`
- **DoD:** Endpoint responde 200 con `{ success: true, data: { count: N } }`

**CERMONT-W01-T05** — Ejecutar verify completo
- Después de completar T01-T04, ejecutar:
  ```bash
  npm run verify
  ```
- **DoD:** `npm run verify` pasa completo. Todos los gates verdes. Evidencia guardada.

---

### Wave 2 — Contract-First Inventory and SSOT Cleanup

**Objetivo:** Crear inventario completo de contratos, eliminar duplicación, unificar naming.

**No implementar features grandes.** Solo audit, inventory, cleanup.

**Tickets:**

**CERMONT-W02-T01** — Inventory of all schemas vs models vs routes
- Buscar discrepancias entre `packages/shared-types/src/schemas/` y `backend/src/models/`
- Documentar schemas sin modelo y modelos sin schema
- **Output:** `.sisyphus/evidence/wave-02/contract-inventory.md`

**CERMONT-W02-T02** — Unify date field naming
- Buscar `fechaCreacion`, `fechaActualizacion`, `fecha`, `createdAt`, `updatedAt` en schemas, modelos y frontend
- Unificar a `createdAt` / `updatedAt`
- **Output:** Cambios en schemas + migración snapshot

**CERMONT-W02-T03** — Centralize status enums in @cermont/domain
- Buscar enums de estado hardcodeados en backend y frontend
- Mover a `packages/domain/src/`
- **Output:** Archivos movidos + tests actualizados

**DoD Wave 2:**
- [ ] Contract inventory creado en `.sisyphus/evidence/wave-02/contract-inventory.md`
- [ ] `npm run contracts:check` pasa
- [ ] `npm run typecheck` pasa
- [ ] 0 DTOs locales duplicados (quality:dtos dentro de baseline)

---

### Wave 3 — 14-Step Workflow Cockpit and Blockers

**Objetivo:** UI unificada del flujo completo de 14 pasos con timeline, bloqueos, transiciones.

**Tickets detallados en el ticket completo — resumen:**
1. Endpoint `GET /api/service-cases/[id]/operational-steps`
2. Componente CockpitPanel con timeline visual
3. Colores por estado (pending/available/in_progress/completed/blocked)
4. Bloqueos documentales mostrados en UI
5. Transiciones con verificación RBAC
6. Responsables y fechas por paso

**Contract-first:** `service-case-step-context.schema.ts` existe | `operational-steps.ts` en domain existe

**DoD:** Timeline renderiza 14 pasos | Bloqueos correctos | RBAC validado | Tests pasan

---

### Wave 4 — Planning, Kits, Certifications and AST Readiness

**Objetivo:** Planeación completa con autofill de kits típicos, verificación de certificaciones, AST integrado.

**Ataque directo a:** Falla 1 (planeación incompleta) y Falla 2 (ejecución sin herramientas).

**Tickets:**
1. Endpoint `GET /api/kits/by-service-type` para autofill
2. UI de autofill en página de planning
3. Verificación de certificaciones de equipos y personal
4. AST integrado en paquete de planeación
5. Checklist previo obligatorio antes de ejecución

---

### Wave 5 — Field Execution, Offline Queue, Evidences and Signatures

**Objetivo:** Ejecución en campo completamente offline-first.

**Ataque directo a:** Falla 2 (ejecución sin herramientas) y Falla 3 (evidencias dispersas).

**Tickets:**
1. Modo offline completo en ExecutionSession
2. Captura de evidencias offline (cámara + cola)
3. Firma offline con cola de sincronización
4. Checkpoint de progreso offline (porcentaje)
5. Interfaz de conflictos de sincronización

---

### Wave 6 — Technical Reports, Delivery Records and Client Acceptance

**Objetivo:** Cadena informe → acta → firma → aceptación.

**Ataque directo a:** Falla 4 (retrasos en informes y actas).

**Tickets:**
1. Template de informe técnico con datos de orden
2. Generación PDF del informe (backend)
3. Acta de entrega con firma digital
4. Endpoint firma cliente
5. Control de versiones del informe

---

### Wave 7 — SES, Invoices, Payments and Administrative Closure

**Objetivo:** Cadena completa SES → Factura → Pago → Cierre.

**Ataque directo a:** Falla 5 (retrasos en facturación).

**Tickets:**
1. Validación SES → Factura con bloqueos
2. Aprobación SES por RBAC
3. Aprobación factura por RBAC
4. Cierre definitivo tras pago conciliado
5. Alertas de vencimiento

---

### Wave 8 — Real Costs, Cost Variance and Profitability

**Objetivo:** Comparación propuesta vs costo real por orden.

**Ataque directo a:** Falla 6 (ausencia de costos reales centralizados).

**Tickets:**
1. Endpoint `GET /api/costs/[orderId]/variance`
2. UI comparativa propuesta vs real
3. Cálculo de margen y desviación
4. Alerta de sobrecosto

---

### Wave 9 — Dashboard KPIs, SLA, Bottlenecks and Notifications

**Objetivo:** Dashboard con KPIs reales conectados a backend.

**Tickets:**
1. Endpoint `GET /api/dashboard/operational-summary`
2. Endpoint `GET /api/dashboard/sla-risk-orders`
3. Integrar KPIs en OperationalKpiSection.tsx
4. CashFlowFunnel con datos reales
5. Badge de notificaciones no leídas en Header
6. Lista paginada de notificaciones
7. Preferencias de notificaciones por usuario

---

### Wave 10 — Customer Portal and External Traceability

**Objetivo:** Autoservicio para clientes.

**Tickets:**
1. Determinar si `/portal/*` ya existe (Wave 0)
2. Si existe parcial: mejorar con datos reales
3. Si no existe: crear páginas portal protegidas por token
4. Consulta de órdenes del cliente
5. Descarga de PDFs
6. Firma digital desde portal
7. Historial de servicios

---

### Wave 11 — Dynamic Forms and Checklist Builder

**Objetivo:** Formularios dinámicos basados en documentos heredados + constructor de checklists.

**Tickets:**
1. Template engine para formularios dinámicos
2. Checklist builder por tipo de servicio
3. 3 plantillas iniciales (CCTV, líneas de vida, mantenimiento eléctrico)
4. Publicación controlada de versiones

---

### Wave 12 — Backups, Historical Archive and Download Portal

**Objetivo:** Archivado automático y descarga de paquetes históricos.

**Ataque directo a:** Falla 7 (falta de histórico descargable) + requerimiento anteproyecto.

**Tickets:**
1. Script backup automático MongoDB (mongodump diario)
2. Archivado mensual: mover completadas a BD histórica
3. Portal de descarga de paquetes ZIP por mes/año
4. Exportación CSV por cliente
5. Retención documental + purge controlado
6. Índices MongoDB optimizados para VPS

---

### Wave 13 — Performance, Lighthouse, PWA and Mobile-First Optimization

**Objetivo:** LCP < 3.5s mobile. Bundle optimizado. PWA sólida.

**Tickets:**
1. Auditoría Lighthouse mobile/desktop (antes)
2. Lazy loading componentes pesados del dashboard
3. Code splitting por widget
4. Imágenes con `next/image`
5. TanStack Query staleTime: 30s en dashboard
6. Virtualización de tablas largas
7. IndexedDB cleanup automático (TTL)
8. Service Worker precache optimizado (reducir 6.6MB)
9. Auditoría Lighthouse (después) — comparar

---

### Wave 14 — Security, Auditability, Observability and RBAC Hardening

**Objetivo:** Fortalecer seguridad y observabilidad.

**Tickets:**
1. Auditoría forense en los 14 pasos operativos
2. Rate limiting por usuario (no solo por IP)
3. CORS producción restrictivo
4. Logs JSON estructurados (pino)
5. Error tracking con errores tipados
6. Health checks liveness + readiness
7. Pruebas de penetración básicas (IDOR, XSS)

---

### Wave 15 — CI/CD, Docker, PM2 and VPS Production Readiness

**Objetivo:** Despliegue robusto en VPS.

**Tickets:**
1. Docker multi-stage build (backend + frontend)
2. PM2 ecosystem.config.js con max_memory_restart
3. Nginx reverse proxy + HTTPS (Let's Encrypt)
4. Variables de entorno validadas en producción
5. Migraciones automáticas
6. Seed seguro para primer deploy
7. Scripts de rollback
8. Monitoreo disco, RAM, CPU, upload storage

---

### Wave 16 — E2E, UAT Pilot and Final Acceptance

**Objetivo:** Cobertura E2E de flujos críticos + validación piloto.

**Tickets:**
1. Playwright: flujo login → dashboard
2. Playwright: flujo work-request → proposal → order
3. Playwright: flujo execution → evidences → report
4. Playwright: flujo billing SES → invoice → payment
5. Playwright: flujo offline → sync → online
6. Test RBAC: cada rol solo ve lo suyo
7. Test 14 pasos: bloqueos funcionan
8. Lighthouse audit final
9. UAT pilot con datos reales (opcional)
10. Documento de aceptación final

---

## 12. React Doctor Protocol (Detallado)

**Esto reemplaza cualquier mención vaga sobre React Doctor en el plan.**

### Procedimiento obligatorio

1. **Ejecutar:** `npx react-doctor@latest --verbose`
2. **Capturar output completo** en `.sisyphus/evidence/wave-XX/react-doctor-raw.txt`
3. **Para CADA finding individual**, clasificar:

| Finding | Archivo:línea | Clasificación | Acción |
|---------|:-------------:|:-------------:|--------|
| `Missing key in list` | `AboutSection.tsx:60` | False positive (key antes de spread) | Crear issue, no corregir |
| `Unused file` | `EvidenceGallery.tsx` | True positive | Corregir (eliminar o integrar) |
| ... | ... | ... | ... |

4. **True positives:** Corregir código. No hay excusa. Cada corrección sigue contract-first.
5. **False positives:** Crear issue en `.sisyphus/issues/react-doctor-FP-NNN.md` con:
   - Regla, archivo, línea
   - Evidencia de por qué el código es correcto
   - Impacto real (ninguno)
   - Decisión documentada
6. **Si persiste algún finding después de corregir true positives:** No avanzar.
   El issue debe revisarse antes de continuar.
7. **Target:** 100/100.
   - Si se logra: avanzar.
   - Si no se logra: debe haber un issue formal abierto por cada punto restante, con código leído y evidencia.

**Prohibido:**
- Suprimir React Doctor en `doctor.config.json` sin issue formal.
- Aceptar 67/100 porque "son falsos positivos". Los falsos positivos se documentan, no se ignoran.
- Modificar reglas de React Doctor.
- Ocultar output de React Doctor.

---

## 13. Plan de Calidad y Corrección

### quality:weak-tokens
- **Qué mide:** `any`, `null`, `undefined`, `unknown` en código fuente
- **Estado:** Depende de Wave 0
- **Corrección:** Tipos fuertes, sin casts
- **Prohibido:** Subir baseline
- **DoD:** Todos "within baseline"

### quality:language
- **Qué mide:** Tokens en español en código
- **Corrección:** Código en inglés, labels en español solo en UI
- **DoD:** Dentro de baseline

### quality:zero
- **Qué mide:** `null`/`undefined` como valores
- **Estado:** 0 findings
- **DoD:** Mantener 0

### quality:routes
- **Qué mide:** Rutas backend registradas correctamente
- **Estado:** 0 findings
- **DoD:** Mantener 0

### quality:dtos
- **Qué mide:** DTOs locales duplicados
- **Estado:** 38/39 (depende de Wave 0)
- **DoD:** Dentro de baseline

### Hardcoded roles
- **Qué mide:** Strings de roles hardcodeados
- **Estado:** 0 violations
- **DoD:** Mantener 0

### Runtime 404
- **Diagnóstico:** Consola del navegador en rutas críticas
- **Corrección:** Verificar mount de rutas, proxy, contratos
- **DoD:** 0 errores 404

### `.map is not a function`
- **Diagnóstico:** Consola del navegador
- **Corrección:** Normalizar con `?? []` o adaptador DTO
- **DoD:** 0 errores

---

## 14. Plan de Testing

| Flujo | Tipo | Prioridad |
|-------|:----:|:---------:|
| Login → Dashboard | E2E Playwright | P0 |
| WorkRequest → Proposal → Order | E2E Playwright | P1 |
| Planning → Execution → Evidences | E2E Playwright | P1 |
| SES → Invoice → Payment | E2E Playwright | P1 |
| Offline → Sync → Online | E2E Playwright | P1 |
| RBAC: cada rol solo ve lo suyo | Integration | P1 |
| 14 pasos: bloqueos funcionan | Integration | P1 |
| Contracts: snapshot match | Contract | P0 |
| Notifications badge | Unit | P1 |
| Dashboard KPI data flow | Integration | P0 |
| Cost variance calculation | Unit | P1 |
| Backup script | Shell | P0 |
| Lighthouse audit | Audit | P0 |

---

## 15. Plan de Performance

| Área | Antes | Después |
|------|:-----:|:-------:|
| Lighthouse mobile LCP | Wave 0 | < 3.5s |
| Lighthouse performance | Wave 0 | > 70 |
| Bundle size dashboard | Wave 0 | -30% |
| Service Worker precache | 6.6MB | < 4MB |
| IndexedDB size | Sin límite | < 100MB |
| Mongo audit query | > 500ms | < 50ms |
| Mongo orders query | > 200ms | < 20ms |
| Image weight | ~200KB | < 50KB |

---

## 16. Roadmap Temporal

```
Short term (Waves 0-2) — Stabilization
  Wave 0: Baseline (0 dependencies)
  Wave 1: Quality + Runtime (depends: W0)
  Wave 2: Contract Inventory (depends: W1)

Medium term (Waves 3-8) — Business flow
  Wave 3: 14-step Cockpit (depends: W2)
  Wave 4: Planning + Kits (depends: W3)
  Wave 5: Execution Offline (depends: W4)
  Wave 6: Reports + Delivery (depends: W5)
  Wave 7: SES + Invoices + Payments (depends: W6)
  Wave 8: Cost Variance (depends: W5)

Long term (Waves 9-16) — Innovation + Scale
  Wave 9: Dashboard + KPIs (depends: W3, W7, W8)
  Wave 10: Customer Portal (depends: W3)
  Wave 11: Dynamic Forms (depends: W4)
  Wave 12: Backups + Archive (depends: W7)
  Wave 13: Performance + Lighthouse (depends: W9)
  Wave 14: Security + Audit (depends: W1)
  Wave 15: CI/CD + VPS (depends: W12, W13, W14)
  Wave 16: E2E + Acceptance (depends: W3-W15)
```

---

## 17. Prompt para Modelo Programador

```
PROMPT PARA EJECUTOR DEL PLAN CERMONT v3
=========================================

Actúa como modelo implementador senior para CERMONT. No eres planificador.
Debes ejecutar el Plan Maestro v3 estrictamente por waves, empezando por Wave 0.
No uses subagentes ni delegues. No inventes archivos, rutas, endpoints ni resultados.
Lee, verifica, implementa un ticket por ciclo, valida y reporta evidencia.

ARCHIVO DEL PLAN:
.sisyphus/plans/cermont-product-implementation-masterplan.v3.md

ORDEN DE EJECUCIÓN:
1. Wave 0: Baseline (solo diagnóstico, no código)
2. Wave 1: Qualify gates, React Doctor, runtime
3. Wave 2: Contract inventory
4. Waves 3-16 en orden secuencial
Cada wave produce evidencia en .sisyphus/evidence/wave-XX/

REGLAS POR WAVE:
- Leer la sección de la wave completa antes de empezar
- Ejecutar tickets en orden dentro de la wave
- Cada ticket tiene "Archivos a inspeccionar primero" — LEERLOS antes de modificar
- Cada ticket tiene "Archivos a modificar" — SOLO esos archivos
- Cada ticket tiene DoD — NO AVANCES si no cumples todo

ANTES DE CREAR CUALQUIER ARCHIVO:
1. Ejecutar búsqueda de duplicados (ver sección 5 del plan)
2. Si existe algo parcial: EXTENDER, no duplicar
3. Solo crear si después de buscar no existe nada equivalente

CONTRACT-FIRST CHECKLIST (OBLIGATORIO POR TICKET):
□ Schema en shared-types? (reutilizar/extender/crear)
□ Tipo inferido?
□ Regla en domain? (rol, permiso)
□ Modelo Mongoose?
□ Servicio backend?
□ Controller/ruta?
□ API service frontend?
□ Query key?
□ Hook?
□ UI/página?
□ Tests?
□ contracts:check pasa?

ARCHIVOS QUE NO DEBES TOCAR BAJO NINGUNA CIRCUNSTANCIA:
- package.json (root o cualquier workspace) sin autorización + ADR
- package-lock.json
- tooling/quality/baseline.json
- tooling/quality/*.ts
- docker/ (sin Wave 15)
- scripts/deploy/ (sin Wave 15)

STOP CONDITIONS (detenerse si ocurre alguna):
1. npm run verify falla después de corrección
2. contracts:check falla y requiere migración
3. Schema nuevo rompe compatibilidad
4. Se necesita modificar package.json
5. Se necesita modificar baseline/quality scripts
6. Se necesita eliminar funcionalidad sin reemplazo
7. El plan dice que ruta no existe pero SÍ existe
8. Ticket requiere decisión de negocio
9. 3 intentos de corrección fallan
10. Diferencia entre plan y repo real detectada

REPORTE POR WAVE:
.sisyphus/evidence/wave-XX/baseline.md — estado inicial
.sisyphus/evidence/wave-XX/changes.md — archivos modificados
.sisyphus/evidence/wave-XX/commands.md — comandos ejecutados
.sisyphus/evidence/wave-XX/test-results.md — tests
.sisyphus/evidence/wave-XX/risks.md — riesgos detectados
.sisyphus/evidence/implementation-progress.md — tracker acumulativo

NO HACER:
- No introducir any, unknown, null, undefined
- No subir baselines
- No desactivar quality gates
- No suprimir React Doctor sin issue formal
- No instalar dependencias sin ADR
- No usar Vercel/Netlify para producción
- No borrar funcionalidad existente sin reemplazo
- No implementar más de un ticket a la vez
- No inventar archivos, rutas, endpoints ni resultados
- No decir "probablemente", "parece", "debería"
```

---

## 18. Criterios de Calidad del Plan v3

Este plan será rechazado si:

- [ ] Es genérico y no específico para CERMONT
- [ ] Propone subir baseline o desactivar gates
- [ ] Sugiere suprimir React Doctor
- [ ] No exige baseline fresco en Wave 0
- [ ] No tiene tickets con formato completo (20+ campos)
- [ ] No incluye checklist contract-first por ticket
- [ ] No incluye anti-duplication protocol
- [ ] No incluye anti-hallucination protocol
- [ ] No incluye stop conditions
- [ ] No incluye new dependency protocol
- [ ] No incluye evidencia estructurada por wave
- [ ] No incluye 16 waves completas
- [ ] No incluye prompt para ejecutor completo
- [ ] Dice que implementó código (viola rol de planificador)
- [ ] Se inventa resultados de comandos sin ejecutarlos

---

*Documento generado como artefacto de planificación pura el 2026-07-07.*
*Ningún archivo fuente fue modificado. Ningún comando de implementación fue ejecutado.*
*Plan v3 reemplaza a v2. El ejecutor debe empezar por Wave 0.*
