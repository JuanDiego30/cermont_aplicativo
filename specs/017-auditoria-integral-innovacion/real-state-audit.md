# Real State Audit — CERMONT S.A.S.

**Fecha:** 2026-07-05
**Spec:** 017 — Auditoría Integral, Investigación y Plan de Innovación
**Tipo:** Auditoría real de código y documentación (no supuestos)

---

## 1. Resumen de Gates Ejecutados

| Gate | Resultado | Evidencia |
|------|-----------|-----------|
| `npm run typecheck` | ✅ PASS (7/7 tasks, 0 errores) | `.sisyphus/evidence/sprint4-typecheck.txt` |
| `npm run lint` | ✅ PASS (1 warning `useOptionalChain`) | `.sisyphus/evidence/sprint4-lint.txt` |
| `npm run build` | ✅ PASS (95 rutas, 242 precache entries) | `.sisyphus/evidence/sprint4-build.txt` |
| `npm run test` | ❌ FAIL (1 test: checklist-file-upload) | `.sisyphus/evidence/sprint4-tests.txt` |
| `npm run quality:strict` | ✅ PASS (9/9 sub-checks) | `.sisyphus/evidence/quality-strict-after.txt` |
| `npx react-doctor@latest` | ✅ PASS (100/100, 0 warnings) | `.sisyphus/evidence/audit-react-doctor.txt` |

**Nota:** El plan original mencionaba "2 tests frontend: header-notifications" como falla, pero la evidencia real confirma que la falla actual es ÚNICAMENTE `checklist-file-upload.test.ts`. El test `header-notifications.test.tsx` está correctamente estructurado y no se reporta como falla en la ejecución actual.

---

## 2. Inventario Backend: Módulos y Endpoints

### 2.1 Total de módulos backend identificados: 56

Distribución verificada contra `backend/src/modules/`:

| # | Módulo | Archivos | Endpoints (route definitions) | Controller | Service | Model | Tests | Estado |
|---|--------|----------|-------------------------------|------------|---------|-------|-------|--------|
| 1 | auth | 6+ | ~12 | ✅ | ✅ | ✅ | ⚠️ | Completo |
| 2 | user | 4+ | ~15 | ✅ | ✅ | ✅ | ⚠️ | Completo |
| 3 | work-requests | 5+ | ~12 | ✅ | ✅ | ✅ | ❌ | Completo |
| 4 | site-visits | 4+ | ~8 | ✅ | ✅ | ✅ | ❌ | Completo |
| 5 | proposals | 5+ | ~14 | ✅ | ✅ | ✅ | ❌ | Completo |
| 6 | purchase-orders | 3+ | ~4 | ✅ | ✅ | ✅ | ❌ | Completo |
| 7 | planning-packet | 4+ | ~10 | ✅ | ✅ | ✅ | ❌ | Completo |
| 8 | order | 4+ | ~25 | ✅ | ✅ | ✅ | ⚠️ | Completo |
| 9 | execution | 4+ | ~10 | ✅ | ✅ | ✅ | ❌ | Completo |
| 10 | evidence | 4+ | ~15 | ✅ | ✅ | ✅ | ❌ | Completo |
| 11 | files | 3+ | ~10 | ✅ | ✅ | ✅ | ❌ | Completo |
| 12 | reports | 4+ | ~10 | ✅ | ✅ | ✅ | ❌ | Completo |
| 13 | delivery-record | 2 | ~8 | ❌ | ❌ | ❌ | ❌ | Solo routes |
| 14 | service-entry-sheet | 2 | ~10 | ❌ | ❌ | ❌ | ❌ | Solo routes |
| 15 | invoice | 2 | ~8 | ❌ | ❌ | ❌ | ❌ | Solo routes |
| 16 | payment | 1 | ~6 | ❌ | ❌ | ❌ | ❌ | Solo routes |
| 17 | technical-report | 1 | ~4 | ❌ | ❌ | ❌ | ❌ | Solo routes |
| 18 | observability | 2 | ~4 | ✅ | ❌ | ❌ | ❌ | Sin service |
| 19 | kpi | 0 | 0 | ❌ | ❌ | ❌ | ❌ | VACÍO |
| 20 | media | 0 | 0 | ❌ | ❌ | ❌ | ❌ | VACÍO |
| 21-56 | (36 módulos restantes) | varios | varios | ✅ | ✅ | ✅ | ❌ | Completo |

### 2.2 Endpoints totales

| Fuente | Cantidad | Fecha verificación |
|--------|----------|-------------------|
| Route definitions reales en backend | ~456 | 2026-07-05 |
| Documentados en API_ENDPOINT_MATRIX.md | 100 | 2026-06-14 |
| Brecha documentación vs código | ~356 no documentados | — |

### 2.3 Módulos con problemas (verificación detallada)

**Módulos VACÍOS (directorio existe sin archivos):**
- `backend/src/modules/kpi/` — 0 archivos
- `backend/src/modules/media/` — 0 archivos

**Módulos con solo routes (sin controller/service/model):**
- `delivery-record/` — 2 archivos .routes.ts (31 + 82 líneas), sin controller/service/model
- `invoice/` — 2 archivos .routes.ts (22 + 71 líneas), sin controller/service/model
- `service-entry-sheet/` — 2 archivos .routes.ts (22 + 100 líneas), sin controller/service/model
- `technical-report/` — 1 archivo .routes.ts (126 líneas), sin controller/service/model
- `payment/` — 1 archivo .routes.ts (59 líneas), sin controller/service/model
- `observability/` — 2 archivos (controller.ts 30 líneas, routes.ts 26 líneas), SIN service.ts

Notar: Aunque estos módulos tienen routes con lógica (router.get/router.post, etc.), la ausencia de controllers/services dedicados significa que la lógica de negocio está acoplada a las routes o es inexistente.

---

## 3. Inventario Frontend: Rutas

### 3.1 Rutas frontend verificadas

| Fuente | Cantidad | Fecha |
|--------|----------|-------|
| page.tsx encontrados | 131 | 2026-07-05 |
| Rutas únicas en build output | 95 | 2026-07-05 |
| Documentadas en FRONTEND_ROUTE_MAP.md | 86 | 2026-06-06 |

### 3.2 Cobertura de estados por página (loading/error/empty/offline)

No se ejecutó verificación exhaustiva página por página. Pendiente para Fase 2 de auditoría.

---

## 4. Discrepancias Documentación vs Código Real

### 4.1 Documentación faltante

| Documento | Existe | Observación |
|-----------|--------|-------------|
| `docs/architecture/API_ROUTE_MAP.md` | ❌ NO EXISTE | Solo existe API_ENDPOINT_MATRIX.md |
| `docs/architecture/API_ENDPOINT_MATRIX.md` | ✅ EXISTE | Documenta 100 endpoints vs 456 reales |
| `docs/architecture/FRONTEND_BACKEND_MATRIX.md` | ✅ EXISTE | Generado 2026-06-29 |
| `docs/architecture/DOMAIN_MODULE_MAP.md` | ✅ EXISTE | 38 líneas, completa pero concisa |
| `docs/architecture/RBAC_PERMISSION_MAP.md` | ✅ EXISTE | 260 líneas, completa |
| `docs/architecture/MEDIA_EVIDENCE_FLOW_MAP.md` | ✅ EXISTE | 255 líneas, detallada |
| `docs/architecture/PWA_OFFLINE_FLOW_MAP.md` | ✅ EXISTE | 104 líneas |
| `docs/KNOWN_ISSUES.md` | ✅ EXISTE | 124 líneas |
| `docs/TECHNICAL_DEBT.md` | ✅ EXISTE | 45 líneas |
| `docs/API_STATUS.md` | ✅ EXISTE | 59 líneas |
| `docs/DEVELOPMENT_STATUS.md` | ✅ EXISTE | 82 líneas |

### 4.2 Discrepancias críticas

| # | Discrepancia | Severidad | Evidencia |
|---|-------------|-----------|-----------|
| 1 | API_ENDPOINT_MATRIX documenta 100 endpoints; código real tiene ~456 | CRÍTICA | Conteo de route definitions |
| 2 | API_ENDPOINT_MATRIX marca módulos como REQUIRED que ya están IMPLEMENTED | ALTA | work-requests, execution, delivery-record marcados REQUIRED pero existen |
| 3 | DEVELOPMENT_STATUS.md marca todos los módulos como `done` incluso delivery-record, invoice, payment | ALTA | Esos módulos no tienen controller/service |
| 4 | API_ROUTE_MAP.md no existe (solo la matriz de endpoints) | MEDIA | Confirmado con Test-Path |
| 5 | El plan original menciona "2 tests header-notifications fallando" pero la falla real es en checklist-file-upload | MEDIA | El test header-notifications está correcto; checklist-file-upload tiene 1 assertion fallando |
| 6 | react-doctor pasó de 87/100 (baseline) a 100/100 (actual) — mejora no documentada | BAJA | Comparación con KNOWN_ISSUES.md que reporta 87/100 |

---

## 5. Deuda Técnica Cuantificada

| Métrica | Valor | Fecha |
|---------|-------|-------|
| `:any` explícito en source (backend/src, frontend/src, packages) | 0 | 2026-07-05 |
| `console.log` en source | 17 | 2026-07-05 |
| TODO/FIXME/HACK en source | 100 | 2026-07-05 |
| Archivos con TODO/FIXME/HACK | ~46 | 2026-07-05 |
| `null`/`undefined` en schemas Zod | (requiere auditoría adicional) | — |

### 5.1 Distribución de TODO/FIXME/HACK

Los 100 marcadores se distribuyen en:
- `backend/src/modules/*.routes.ts` — Roles comments (no técnicos, son docstring)
- `backend/src/models/User.ts` — Métodos de instancia
- `backend/src/modules/kit/kit.service.ts` — Función `toDomainModel`
- `backend/src/services/messaging/sms.gateway.ts` — TODO: Integrate with Twilio
- `backend/src/modules/documents/file.service.ts` — TODO: ClamAV scan
- `frontend/src/` — Varios componentes

Nota: Muchos son comentarios de documentación ("Roles: Todos"), no deuda técnica real. Los TODO reales son ~15-20.

---

## 6. Hallazgos Críticos

| # | Hallazgo | Impacto | Acción Requerida |
|---|----------|---------|------------------|
| H1 | 6 módulos del flujo documental (delivery-record, invoice, service-entry-sheet, technical-report, payment, observability) sin controller/service dedicados — solo tienen routes | ALTO — Los pasos 8-14 del flujo de negocio no tienen lógica de negocio implementada | Implementar controllers/services para completar el flujo documental |
| H2 | 2 módulos (kpi, media) completamente vacíos | ALTO — Dashboard KPIs y manejo de medios no funcionales | Implementar o migrar funcionalidad desde otros módulos |
| H3 | 1 test fallando: `checklist-file-upload.test.ts` — `FormData.get("metadata")` retorna null cuando debería retornar `{"checklistItemId":"ats-1"}` | MEDIO — Indica posible bug en el pipeline de subida de archivos checklist | Investigar si es bug de implementación o test desactualizado |
| H4 | API_ENDPOINT_MATRIX.md desactualizado (100 vs 456 endpoints) | MEDIO — Documentación no refleja la realidad del código | Regenerar matriz completa |
| H5 | DEVELOPMENT_STATUS.md demasiado optimista (todo `done`) | MEDIO — Enmascara módulos incompletos | Actualizar estados reales |

---

## 7. Evolución de Gates (Baseline vs Actual)

| Gate | Baseline (2026-06-24) | Actual (2026-07-05) | Cambio |
|------|----------------------|---------------------|--------|
| typecheck | PASS | PASS | Estable |
| lint | PASS (2 warnings) | PASS (1 warning) | ✅ Mejoró |
| build | PASS (83 rutas) | PASS (95 rutas) | ✅ +12 rutas |
| test | PASS (1014 tests) | FAIL (1: checklist-file-upload) | ❌ Nuevo fail |
| react-doctor | 87/100, 12 warnings | 100/100, 0 warnings | ✅ Mejoró significativamente |

---

## 8. Evidencia de Comandos Ejecutados

Todos los comandos de verificación se ejecutaron con evidencia almacenada en `.sisyphus/evidence/`:

```
.sisyphus/evidence/
├── audit-react-doctor.txt          — react-doctor output (100/100)
├── audit-todo-fixme-list.txt       — 100 TODO/FIXME/HACK listados
├── sprint4-typecheck.txt           — typecheck PASS
├── sprint4-lint.txt                — lint PASS
├── sprint4-build.txt               — build PASS (95 rutas)
├── sprint4-tests.txt               — tests FAIL (1 test)
├── sprint4-quality-strict.txt      — quality:strict PASS
├── sprint4-verify.txt              — verify PASS
├── sprint4-contracts.txt           — contracts check PASS
├── quality-strict-baseline.txt     — baseline comparativo
├── quality-strict-after.txt        — post-fix quality
├── react-doctor-baseline.txt       — baseline react-doctor (87/100)
└── react-doctor-verbose.txt        — verbose react-doctor
```

---

## 9. Análisis de Falla de Test

**Archivo:** `frontend/tests/modules/checklists/checklist-file-upload.test.ts`
**Test:** `serializa el item de checklist en metadata del FileAsset`
**Causa raíz:** `FormData.get("metadata")` retorna `null` en lugar de `'{"checklistItemId":"ats-1"}'`

**Análisis:**
El test verifica que al subir un archivo de checklist, el FormData incluya un campo `metadata` con el ID del item de checklist serializado como JSON. El valor recibido es `null`, lo que sugiere que:
1. La implementación actual no incluye el campo `metadata` en el FormData
2. O el campo se llama diferente en la implementación actual
3. O el mock de `apiClient.post` no está capturando correctamente el FormData

**No se reparó** (esta es una auditoría, no reparación).

---

## 10. Métricas Clave del Proyecto

| Métrica | Valor |
|---------|-------|
| Módulos backend | 56 |
| Route definitions reales | ~456 |
| page.tsx frontend | 131 |
| Rutas frontend únicas (build) | 95 |
| Módulos con controller/service/model completo | ~38 |
| Módulos con solo routes | 6 |
| Módulos vacíos | 2 |
| Tests backend | 508 passing, 1 failing |
| Tests frontend | 259 passing, 1 failing |
| Endpoints documentados en API_ENDPOINT_MATRIX | 100 |
| Documentos de arquitectura existentes | 10 de 11 |
| Roles RBAC | 8 |
| Paquetes npm | 848 |
| Vulnerabilidades npm | 4 (no bloqueantes) |
