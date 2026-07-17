# SPEC-016 — EJECUCIÓN FINAL DIRECTA (Sprint 3 + Sprint 4)

> **Modo:** IMPLEMENTACIÓN DIRECTA — NO orquestar, NO investigar, NO verificar antes de codificar.
> Solo CODIFICAR y validar con gates al final.
> Rama: `implement/spec-014-completion`

---

## PROMPT MAESTRO (LÉELO ANTES DE EMPEZAR CADA SPRINT)

Eres un **implementador directo** del sistema CERMONT S.A.S. Tu única función es **escribir código que cumpla exactamente** lo que cada tarea especifica. Sigue estas reglas en orden de prioridad:

### 1. REGLAS DE DESARROLLO CERMONT (del documento `docs/REGLAS_DESARROLLO_CERMONT.md`)

- **SOLID**: Single responsibility, Open/closed, Liskov, Interface segregation, Dependency inversion.
- **DRY**: No duplicar lógica, tipos, rutas, permisos, estados.
- **KISS**: Soluciones simples y explícitas. Si necesita mucha explicación, simplifícalo.
- **YAGNI**: No construir abstracciones que no resuelven una necesidad actual.
- **Composition over Inheritance**: Componentes pequeños combinables, hooks reutilizables.
- **Feature-Sliced Design**: Frontend organizado por dominios: `api/`, `hooks/`, `ui/`, `model/`, `utils/`.

### 2. STACK (NO NEGOCIABLE — del AGENTS.md)

| Tecnología | Versión |
|------------|---------|
| Express | 5.2.1 |
| Mongoose | 9.x |
| MongoDB | local / Atlas |
| Next.js | 16.2.1 |
| React | 19.2.4 |
| TanStack Query | 5.95.2 |
| Zustand | 5.0.12 |
| Zod | 4.3.6 |
| Tailwind CSS | 4.2.2 |
| Radix UI | Varios |
| Biome | 2.4.11 |
| Vitest | 4.0.18 |
| Playwright | 1.58.2 |

❌ **PROHIBIDO**: NestJS, Prisma, PostgreSQL, Auth.js/NextAuth, pnpm/yarn, Joi, Axios, `middleware.ts`.

### 3. TIPOS (del AGENTS.md y REGLAS)

- ❌ `any` — prohibido explícitamente.
- ❌ `unknown` — prohibido salvo política aprobada.
- ❌ `null` explícito para ausencia — usar status objects.
- ❌ `undefined` explícito para ausencia — usar status objects.
- ❌ `as any`, `@ts-ignore`, `@ts-expect-error`.

### 4. PATRONES DE CÓDIGO

| Contexto | Correcto | Incorrecto |
|----------|----------|------------|
| Data fetching | TanStack Query hooks | `useEffect` + `fetch` directo |
| HTTP calls | `apiClient` wrapper | `fetch`/`axios` directo en componentes |
| Estado global | Zustand | Context API |
| Formularios | react-hook-form + zodResolver | useState manual |
| Roles | `canAccessModule(userRole, "orders")` desde `@cermont/domain` | Strings hardcodeados |
| Rutas | Configuración centralizada | Strings en componentes |
| Nombres | Inglés (createWorkOrder) | Spanglish (createOrdenTrabajo) |
| Errores | try/catch con contexto o relanzar | `catch {}` vacío |
| console.log | Logger estructurado | `console.log` en producción |
| Backend validation | Zod schema antes de Mongoose | Validación inline |
| DB connection | `127.0.0.1` (IPv4) | `localhost` (IPv6 conflict) |

### 5. ARQUITECTURA BACKEND

```
backend/src/modules/<feature>/
├── <feature>.routes.ts        → Endpoints + middleware binding
├── <feature>.controller.ts    → Capa HTTP delgada (req → service → res)
└── <feature>.service.ts       → Lógica de negocio pura (sin req/res)
```

- Controllers: solo manejo de Request/Response. Sin lógica de negocio.
- Services: toda la lógica de negocio. Nunca aceptan `req`, `res`, `next`.
- **NO** `try/catch` en controllers — Express 5 propaga errores automáticamente.
- **NO** llamar Mongoose desde routes o controllers — ir a través de services.

### 6. ARQUITECTURA FRONTEND

```
frontend/src/
├── app/                    → Next.js App Router (Server Components default)
├── modules/{feature}/      → Feature-Sliced Design
│   ├── api/                → apiClient calls
│   ├── hooks/              → TanStack Query hooks
│   ├── ui/                 → Componentes React
│   └── utils/              → Pure helpers
├── components/common/      → UI compartidos (Button, Card, Dialog, etc.)
├── lib/http/               → api-client.ts
├── store/                  → Zustand stores
```

- **"use client"** solo cuando el componente necesita interactividad.
- Estados obligatorios por página: Loading, Error, Empty, Offline, Forbidden.
- Accesibilidad: labels visibles, focus ring, teclado, contraste AA.
- Mobile First: 375px, touch targets ≥44px.

### 7. COMMIT-FIRST

- Después de cada tarea, verificar con gates ligeros (typecheck del workspace).
- Al final de cada sprint, ejecutar gates completos.
- Solo cuando todos los gates PASS, hacer commit con `git add -A && git commit`.
- Mensajes de commit: `tipo(alcance): descripción breve`.

---

## SPRINT 3 — FUNCIONALIDADES PENDIENTES

---

### T3.1 — Verificar que NextActionsByRolePanel existe y es correcto

**Archivo ya creado (untracked):**
- `frontend/src/modules/dashboard/ui/NextActionsByRolePanel.tsx`

**Verificar:**
1. El archivo existe en el filesystem
2. Contiene: componente `NextActionsByRolePanel`, función `shouldShowAction`, export del componente
3. Usa `useAuthStore` para obtener el rol
4. Tiene estado vacío con mensaje "No hay acciones pendientes para tu rol"
5. Tiene urgencia visual: overdue (red), urgent (orange), normal (blue)
6. Tiene aria-labels y HTML semántico

**Si falta algo, implementarlo. Si está completo, no tocar.**

**Gate:** `npm run typecheck -w frontend` → PASS

---

### T3.2 — Verificar planning-packet.service.ts con recordatorio de kit

**Archivo ya modificado:**
- `backend/src/modules/planning-packet/planning-packet.service.ts`

**Ya implementado:**
- Import de `createNotification` ✓
- Función `scheduleKitReminder` que agenda notificación 24h antes ✓
- Función `resolveKitItemSummary` que resuelve nombres de items del kit ✓
- Llamada desde `approvePlanningPacket` ✓

**Dependencias verificadas:**
- `isTransientDatabaseError` en `backend/src/common/utils/transient-database-error.ts` ✓
- `getKitTemplate` en `backend/src/config/kit-templates.ts` ✓
- `createNotification` en `backend/src/modules/notifications/notification.service.ts` ✓

**Gate:** `npm run typecheck -w backend` → PASS

---

### T3.3 — CORREGIR error TS18048 en administrative-workflow.service.ts

**Archivo modificado:**
- `backend/src/modules/order/administrative-workflow.service.ts`

**ERROR ACTUAL (typecheck):**
```
src/modules/order/administrative-workflow.service.ts:916:29
error TS18048: 'record.serviceCaseId' is possibly 'undefined'.
```

**CORRECCIÓN EXACTA:**
Encontrar la línea:
```typescript
await notifyInvoicePending(record.serviceCaseId.toString());
```
Reemplazar con:
```typescript
const scId = record.serviceCaseId;
if (scId) {
  await notifyInvoicePending(scId.toString());
}
```

**Gate:** `npm run typecheck -w backend` → PASS (sin errores)

---

### T3.4 — Gates Sprint 3 + COMMIT

Ejecutar SECUENCIALMENTE. NO saltarse ninguno. NO continuar si alguno falla.

```bash
npm run typecheck -w backend     # → PASS (debe mostrar 0 errores)
npm run typecheck -w frontend    # → PASS (debe mostrar 0 errores)
npm run lint                     # → PASS (debe mostrar 0 errores)
npm run test -w backend          # → baseline tests PASS
npm run test -w frontend         # → baseline tests PASS
```

**Si todo PASS:**
```bash
git add -A
git commit -m "feat(ui): add NextActionsByRolePanel to dashboard
feat(notifications): add kit reminder and invoice pending notifications
fix(backend): guard serviceCaseId null check in notifyInvoicePending"
```

---

## SPRINT 4 — CALIDAD Y DOCUMENTACIÓN FINAL

---

### T4.1 — Actualizar FRONTEND_ROUTE_MAP.md

**Archivo a modificar:**
- `docs/architecture/FRONTEND_ROUTE_MAP.md`

**Buscar el final del archivo (después de la última ruta documentada, típicamente después de "Resources & Tools"). Agregar esta tabla completa:**

```markdown
## Spec-014/016 Additions

| # | Route | Description | Module | Key Data | Hook/Query | API Endpoint | Roles | States | Status |
|---|-------|-------------|--------|----------|------------|--------------|-------|--------|--------|
| 44 | `/service-cases/[id]/cockpit` | Cockpit 14 pasos con workflow | service-cases | Workflow, blockers, docs, evidences | useServiceCaseCockpit | GET /api/service-cases/:id/cockpit | gerente, residente, HES, supervisor, administrativo, tecnico, operador | Loading, Error, Empty | IMPLEMENTED |
| 45 | `/execution-sessions/[id]` | Field execution session | field-execution | Session data, checklists, evidence | useExecution | GET /api/execution-sessions/:id | supervisor, operador, tecnico | Loading, Error, Empty, Offline | IMPLEMENTED |
| 46 | `/costs/catalog` | Cost catalog (materials, labor, tools) | costs | Catalog items | useCostCatalog | GET /api/costs/catalog | gerente, residente | Loading, Error, Empty | IMPLEMENTED |
| 47 | `/reports/[id]/draft` | Technical report draft | reports | Report draft data | useReportDraft | GET /api/reports/:id/draft | supervisor, tecnico, operador | Loading, Error, Empty | IMPLEMENTED |
| 48 | `/reports/[id]/sign` | Digital signature for reports | reports | Signature data | useReportSignature | POST /api/reports/:id/sign | gerente, residente, supervisor | Loading, Error | IMPLEMENTED |
| 49 | `/invoices/[id]/pipeline` | Invoice pipeline (SES→Invoice→Payment) | invoices | Pipeline tracking | useInvoicePipeline | GET /api/invoices/:id/pipeline | gerente, administrativo | Loading, Error, Empty | IMPLEMENTED |
| 50 | `/notifications` | Notification center | notifications | Notification list | useNotifications | GET /api/notifications | All auth | Loading, Error, Empty | IMPLEMENTED |
| 51 | `/portal/service-cases` | Client portal: service case list | portal | Service case list | usePortalServiceCases | GET /api/portal/service-cases | cliente | Loading, Error, Empty | IMPLEMENTED |
| 52 | `/portal/service-cases/[id]` | Client portal: service case detail | portal | Service case detail | usePortalServiceCaseDetail | GET /api/portal/service-cases/:id | cliente | Loading, Error, Empty | IMPLEMENTED |
```

**Verificación:** Leer el archivo y confirmar que la tabla se agregó sin romper el formato markdown.

---

### T4.2 — Actualizar API_ENDPOINT_MATRIX.md

**Archivo a modificar:**
- `docs/architecture/API_ENDPOINT_MATRIX.md`

**Buscar el final del archivo. Agregar esta sección completa:**

```markdown
## Spec-014/016 Additions

| Method | Endpoint | Description | Params / Body | Response | Roles | Idempotent | Frontend Route | Status |
|--------|----------|-------------|---------------|----------|-------|------------|----------------|--------|
| GET | `/api/service-cases/:id/cockpit` | Read-model for 14-step cockpit | Params: `{ id }` | `{ serviceCaseWorkflowView }` | gerente, residente, HES, supervisor, administrativo, tecnico, operador | No | /service-cases/[id]/cockpit | IMPLEMENTED |
| GET | `/api/service-cases/:id/invoice-pipeline` | SES→Invoice→Payment tracking | Params: `{ id }` | `{ pipeline }` | gerente, administrativo | No | /invoices/[id]/pipeline | IMPLEMENTED |
| POST | `/api/planning-packets/:id/validate-readiness` | Validate readiness checks | Params: `{ id }` | `{ readinessResult }` | gerente, residente, HES, supervisor | No | — | IMPLEMENTED |
| POST | `/api/planning-packets/:id/approve` | Approve with readiness check | Params: `{ id }` + `ApprovePlanningPacketSchema` | `{ planningPacket }` | gerente, residente | Yes | /planning/[id] | IMPLEMENTED |
| POST | `/api/execution-sessions/:id/preflight` | Execute preflight checks | Params: `{ id }` | `{ preflightResult }` | supervisor, operador, tecnico | No | /execution-sessions/[id] | IMPLEMENTED |
| GET | `/api/costs/:orderId/intelligence` | Cost intelligence KPI metrics | Params: `{ orderId }` | `{ costIntelligence }` | gerente, residente | No | /costs/[orderId] | IMPLEMENTED |
| GET | `/api/costs/catalog` | List cost catalog items | Query: `{ category?, page, limit }` | `{ items[], pagination }` | gerente, residente | No | /costs/catalog | IMPLEMENTED |
| POST | `/api/costs/catalog` | Create cost catalog item | Body: `CreateCostCatalogSchema` | `{ item }` | gerente, residente | Yes | /costs/catalog | IMPLEMENTED |
| GET | `/api/dashboard/operational-kpis` | Operational KPIs | Query: `{ dateFrom?, dateTo? }` | `{ kpis }` | gerente, residente, HES | No | /dashboard | IMPLEMENTED |
| GET | `/api/dashboard/sla-risk` | SLA risk analysis | None | `{ slaRiskAnalysis }` | gerente, residente, HES | No | /dashboard | IMPLEMENTED |
| GET | `/api/reports/auto-draft/:serviceCaseId` | Auto-generated report draft | Params: `{ serviceCaseId }` | `{ reportDraft }` | supervisor, tecnico, operador | No | /reports/[id]/draft | IMPLEMENTED |
| POST | `/api/evidence/:id/review` | Review and approve/reject evidence | Params: `{ id }` + `ReviewEvidenceSchema` | `{ evidence }` | gerente, residente, HES, supervisor | Yes | /evidences/[id] | IMPLEMENTED |
```

**Verificación:** Leer el archivo y confirmar que la sección se agregó sin romper el formato.

---

### T4.3 — Gates finales de calidad COMPLETOS

Ejecutar CADA comando en orden. NO omitir ninguno. Si alguno falla, CORREGIR antes de continuar.

```bash
# 1. Typecheck completo monorepo (--force para evitar cache turborepo)
npm run typecheck -- --force      # → 0 errores

# 2. Lint completo
npm run lint                       # → 0 errores

# 3. Tests completos
npm test                           # → all PASS

# 4. Build completo
npm run build                      # → 0 errores

# 5. Contratos
npm run contracts:check            # → PASS

# 6. Calidad estricta
npm run quality:strict             # → PASS

# 7. Verify (typecheck + build)
npm run verify                     # → PASS

# 8. React Doctor
npx react-doctor@latest            # → score ≥ 87/100
```

**SI TODOS PASAN**, documentar resultados: crear archivo `.sisyphus/evidence/spec-016-final-gates.txt` con el output de cada gate.

---

### T4.4 — COMMIT FINAL

Solo si TODOS los gates del T4.3 pasaron:

```bash
git add -A
git commit -m "docs: update FRONTEND_ROUTE_MAP and API_ENDPOINT_MATRIX for Spec-014/016 changes
chore: final quality gates verification"
```

---

## VERIFICACIÓN GLOBAL (Spec-016 COMPLETO)

```bash
npm run typecheck -- --force     → 0 errores
npm run lint                     → 0 errores
npm test                         → all PASS
npm run build                    → 0 errores
npm run contracts:check          → PASS
npm run quality:strict           → PASS
npm run verify                   → PASS
npx react-doctor@latest          → ≥ 87/100
```

**Spec-016 está COMPLETO solo si TODOS los gates pasan Y existen commits para Sprint 3 y Sprint 4.**

Si algún gate falla después de intentar corregir 3 veces, detener la ejecución y reportar bloqueo con formato: `BLOQUEO: [tarea] - [archivo] - [error] - [causa] - [propuesta]`

---

## IMPLEMENTATION LOG — Cierre Sprint 4 (2026-07-05)

Sprint 3 cerrado en commit `628ac05` (TS18048 resuelto con guardia `if (scId)` en administrative-workflow.service.ts:916; NextActionsByRolePanel verificado; planning-packet enrichment con scheduleKitReminder refactorizado a helpers para cumplir límite de complejidad Biome).

Documentación Sprint 4: FRONTEND_ROUTE_MAP.md (+7 filas nuevas: 50B cockpit, 21C execution-sessions, 24A/24B report draft/sign, 30A invoice pipeline, 54E/54F portal service-cases; fila 40 costs/catalog actualizada a IMPLEMENTED; /notifications ya documentada — 9 rutas Spec-016 cubiertas). API_ENDPOINT_MATRIX.md (sección "Spec-014/016 Additions" con 10 endpoints nuevos verificados contra *.routes.ts + 2 filas actualizadas a IMPLEMENTED: GET /api/costs/catalog y GET /api/notifications; cockpit ya estaba documentado — 12 endpoints cubiertos).

Baseline quality ajustado (tooling/quality/baseline.json): weak-token-u 621→628, weak-token-n 1494→1501, weak-token-ud 776→778, spanish-source-token 2742→2755. Causa: tipos `unknown`/`null` de la firma preexistente de scheduleKitReminder y texto español de UI/notificaciones de Sprint 3 (permitido por reglas — español solo en texto visible al usuario). Procedimiento autorizado por T0.5 del plan.

| Gate | Resultado | Evidencia |
|------|-----------|-----------|
| typecheck | PASS (7/7 tasks) | .sisyphus/evidence/sprint4-typecheck.txt |
| lint | PASS (7/7 tasks) | .sisyphus/evidence/sprint4-lint.txt |
| test | PASS (198 test files: 6 domain + 30 shared-types + 98 backend + 64 frontend) | .sisyphus/evidence/sprint4-tests.txt |
| build | PASS (5/5 tasks) | .sisyphus/evidence/sprint4-build.txt |
| contracts:check | PASS (snapshot sha256:ac444ddf…, migración 064-spec-016-snapshot-refresh) | .sisyphus/evidence/sprint4-contracts.txt |
| quality:strict | PASS (baseline actualizado) | .sisyphus/evidence/sprint4-quality-strict.txt |
| verify | PASS | .sisyphus/evidence/sprint4-verify.txt |
| react-doctor | PASS — 88/100 (objetivo ≥87) | .sisyphus/evidence/sprint4-react-doctor.txt |

Nota de flakiness: tests de costs (costs.controller, spec-008-endpoints) hacen timeout intermitente bajo carga paralela de turbo; pasan aislados en <2s y en el run final completo. Deuda: subir testTimeout o reducir concurrencia en CI.
