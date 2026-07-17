# Plan: Implementar 10 Planes Sísifo Vertical Slices

Modo: ponytail (lo mínimo que funciona) + caveman (compacto)

Baseline: 3 plantillas frontend existen, 0 seeds DynamicFormTemplate, 0 CRUD backend plantillas, 0 UI gestión plantillas. Admin-Backup ya implementado.

---

## FASE 0: Seed DynamicFormTemplate (1 archivo, ~60 líneas)

Crear `backend/src/scripts/seed-form-templates.ts`:
- Leer las 3 plantillas de `cermont-form-templates.ts` (Planeación Obra, Líneas Vida, CCTV)
- Convertir a `DynamicFormTemplate` documents con `status: "active"`
- Idempotente: upsert por `name`
- Se llama desde seed script existente o standalone

Dependencias: DynamicFormTemplate model (existe), ceremont-form-templates.ts (existe)

---

## FASE 1: CRUD Backend DynamicFormTemplate (3 archivos, ~120 líneas)

Crear `backend/src/modules/dynamic-form-templates/`:
- `dynamic-form-templates.routes.ts` — GET list, GET by id, POST create, PUT update, DELETE archive (solo admin/gerente)
- `dynamic-form-templates.controller.ts` — thin controller, solo validación + delegación
- `dynamic-form-templates.service.ts` — CRUD con Zod validation reutilizando schemas existentes

Dependencias: DynamicFormTemplate model, auth/authorize middlewares, Zod schemas (todos existen)

---

## FASE 2: Frontend Form Template Management Page (1 archivo, ~80 líneas)

Crear `frontend/src/app/(dashboard)/admin/form-templates/page.tsx`:
- Listar plantillas (nombre, versión, status, tipo_trabajo)
- Botón "seed" que llama endpoint de seed (Fase 0)
- Estados: loading, error, empty
- Ruta: `/admin/form-templates`

Dependencias: admin layout (existe), APP_ROUTES (existe)

---

## FASE 3: Registrar Rutas en `backend/src/index.ts` (modificar 1 archivo, +2 líneas)

Agregar:
```ts
import dynamicFormTemplatesRoutes from "@/modules/dynamic-form-templates/dynamic-form-templates.routes"
app.use("/api/dynamic-form-templates", dynamicFormTemplatesRoutes)
```

Dependencias: Fase 1 completa

---

## FASE 4: Seed BusinessDocuments → FormTemplate Sync (1 archivo, ~40 líneas)

Agregar script que migra los 8 BusinessDocument seeds a DynamicFormTemplate:
- Los 3 existentes en ceremont-form-templates se complementan
- Los 5 nuevos (SG-SST Induction, Ladder Anchor, Safety Hierarchy, Field Permit, AST) se crean como templates draft
- Ejecutable: `npx tsx backend/src/scripts/sync-business-docs-to-form-templates.ts`

Dependencias: Fase 0, BusinessDocument model

---

## FASE 5: Photographic Evidence Template (modificar 1 archivo + 1 archivo, ~30 líneas)

- Agregar template `cermont_anclaje_escalera_v1` en ceremont-form-templates.ts
- Tipo: `photo` con slots para 5 fotos (soporte superior, anclaje peldaños, tornillos/soldadura, soporte inferior, estado general)
- Asociado a step `step_06_execution`, workType `trabajo_alturas`

Dependencias: Fase 0 (seeds)

---

## FASE 6: RBAC Hierarchy Alignment (modificar 1 archivo, ~20 líneas)

Cross-reference organizational chart (plan 03) vs existing RBAC roles:
- GERENTE → Gerente ✓
- ING_RESIDENTE → Residente ✓
- COORDINADOR_ADMIN → Administrativo ✓
- COORDINADOR_HES → HES ✓
- SUPERVISOR_ELECTRICISTA → Supervisor ✓
- TECNICO_ELECTRICISTA → Técnico ✓
- OFICIAL_CONSTRUCCION → Técnico ✓
- AUXILIAR_CONTABLE → Administrativo ✓
- PASANTE → Pasante ✓

Add missing roles or permissions if needed. Verify in `packages/domain/src/roles.ts`.

Dependencias: domain/roles.ts

---

## FASE 7: Admin-Backup Frontend Refactor (mover 1 archivo, ~30 líneas)

Mover lógica de `admin/backups/page.tsx` a `modules/admin-backup/ui/` (Feature-Sliced):
- Crear `AdminBackupList.tsx`, `AdminBackupFilters.tsx`
- page.tsx se vuelve delgado

Dependencias: admin-backup backend (existe)

---

## LÍNEA BASE (Ya implementado, no tocar)

- Dashboard/KPIs: ✅ Módulo dashboard frontend y backend
- Offline-first: ✅ IndexedDB + sync engine + Serwist
- RBAC: ✅ roles.ts + permissions.ts
- 14-step workflow: ✅ FSM engine + step-requirements.ts
- Kit templates: ✅ kit.rules.ts + kit-templates.ts
- Evidence capture: ✅ EvidenceUploader, photo, gps, QR
- Cost tracking: ✅ cost module backend + frontend
- Admin-Backup exports: ✅ admin-backup backend + frontend
- Document generation: ✅ pdf-generator.service.ts

---

## ORDEN DE EJECUCIÓN

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7
(seed)   (CRUD)   (UI)     (routes) (sync)   (photo)  (roles)  (refactor)
```

Cada fase produce archivos modificados/creados. Tests unitarios por fase.

---

## ARCHIVOS A MODIFICAR/CREAR

| Archivo | Acción | Líneas |
|---|---|---|
| `backend/src/scripts/seed-form-templates.ts` | CREAR | ~60 |
| `backend/src/modules/dynamic-form-templates/dynamic-form-templates.routes.ts` | CREAR | ~40 |
| `backend/src/modules/dynamic-form-templates/dynamic-form-templates.controller.ts` | CREAR | ~40 |
| `backend/src/modules/dynamic-form-templates/dynamic-form-templates.service.ts` | CREAR | ~50 |
| `backend/src/index.ts` | MODIFICAR | +2 |
| `frontend/src/app/(dashboard)/admin/form-templates/page.tsx` | CREAR | ~80 |
| `backend/src/scripts/sync-business-docs-to-form-templates.ts` | CREAR | ~40 |
| `frontend/src/modules/forms/templates/cermont-form-templates.ts` | MODIFICAR | +30 |
| `packages/domain/src/roles.ts` | MODIFICAR (verificar) | ~20 |
| `frontend/src/modules/admin-backup/ui/AdminBackupList.tsx` | CREAR | ~30 |

**Total: ~392 líneas nuevas, 3 archivos modificados**

---

## COMPUERTAS DE CALIDAD

Cada fase debe pasar antes de continuar:
```bash
npm run typecheck
npm run lint
npm run build
npm run test
```

---

## PLANES NO ACCIONABLES COMO CÓDIGO

| Plan | Contenido | Acción |
|---|---|---|
| `02_INDUCCION_SGSST3.md` | Inducción SG-SST (49 páginas informativas) | Referencia documental. No generar código. |
| `LTG_JUAN_DIEGO_AREVALO-3_markdown.md` | Tesis completa (207 páginas) | Validación académica del proyecto existente. |
| `REGLAS_DESARROLLO_CERMONT.md` | Reglas de desarrollo (17 secciones) | Ya implementadas en AGENTS.md + .agents/rules/ |

Estos 3 planes son documentales. No requieren implementación.
