# SPEC-016 — PLAN DE IMPLEMENTACIÓN ACTUALIZADO (Post-Auditoría)

**Versión:** 2.0 — 5 de julio de 2026  
**Rama base:** `implement/spec-014-completion`  
**HEAD commit:** `3ba18ff`  
**Auditoría ejecutada:** 2026-07-05 22:30 GMT-5  

---

## SECCIÓN 0: PROMPT MAESTRO PARA IMPLEMENTADORES

### Identidad
Eres un **implementador directo** del sistema CERMONT S.A.S. Tu única función es **escribir código que cumpla exactamente** lo que cada tarea especifica. No investigues, no verifiques más allá de los gates — solo CODIFICA.

### Reglas Absolutas (REGLAS_DESARROLLO_CERMONT.md)
1. **Stack prohibido**: Express 5.2.1, Mongoose 9.x, MongoDB, JWT, Zod 4.x, Next.js 16, React 19, TanStack Query, Zustand, Tailwind 4, Radix UI. ❌ No NestJS, Prisma, PostgreSQL, Auth.js, pnpm/yarn, Joi, Axios.
2. **Contract-First**: Zod → tipo → Mongoose → service → controller → route → frontend api → hook → UI → test.
3. **Zero any/unknown/null/undefined**: Prohibido. Usar status objects o discriminated unions.
4. **Zero console.log en producción**: Usar logger estructurado.
5. **Zero fetch directo en componentes**: Usar apiClient + TanStack Query.
6. **RBAC desde @cermont/domain**: No hardcodear roles.
7. **FileAsset es SSOT**: Para archivos, evidencias, adjuntos. No crear MediaAsset.
8. **Nombres en inglés**: Código en inglés. Español solo en UI visible.
9. **Mobile first**: 375px, touch targets ≥44px.
10. **No modificar package.json** sin justificación explícita.
11. **No eliminar funcionalidad existente** sin reemplazo verificado.
12. **Toda página crítica**: loading/error/empty/offline/forbidden.

### Reglas de Trabajo
- Trabajas en `implement/spec-014-completion`. **No cambiar de rama.**
- Antes de editar, leer el archivo. Cambios mínimos y precisos.
- No subagentes. No investigaciones externas. Solo codificar y verificar con gates.
- Después de cada tarea, correr los gates correspondientes.
- Si un gate falla, CORREGIR inmediatamente.
- Al final del plan: `git add -A && git commit`.

---

## SECCIÓN 1: AUDITORÍA COMPLETA

### 1.1 Commits Verificados

| Commit | Sprint | Mensaje | Estado |
|--------|--------|---------|--------|
| `34fc9e6` | Sprint 0 | Estabilización de gates | ✅ EXISTE |
| `20275e9` | Sprint 1 | Módulos parciales | ✅ EXISTE |
| `d0330b9` | Sprint 2 | E2E estables | ✅ EXISTE |
| `628ac05` | Sprint 3 (parcial) | NextActionsByRolePanel, planning-packet, fix TS18048 | ✅ EXISTE |
| `0f7ac76` | Sprint 4 (parcial) | FRONTEND_ROUTE_MAP + API_ENDPOINT_MATRIX | ✅ EXISTE |
| `3ba18ff` | Sprint 3 (segundo) | funcionalidades pendientes | ✅ EXISTE **⚠️ PROBLEMÁTICO** |

### 1.2 Gates Verificados (2026-07-05 22:30)

| Gate | Resultado | Detalle |
|------|-----------|---------|
| `npm run typecheck --force` | ✅ PASS | 7/7 workspaces, 0 errores |
| `npm run lint` | ✅ PASS | 7/7 workspaces, 0 errores |
| `npm run test -w backend` | ✅ PASS | 98 suites, 669 tests |
| `npm run test -w frontend` | ✅ PASS | 64 suites, 260 tests |
| `npm run build` | ✅ PASS | 5/5 workspaces |
| `npm run contracts:check` | ✅ PASS | Snapshot 064-spec-016 |
| `npm run quality:strict` | ✅ PASS | 9/9 sub-checks |
| `npx react-doctor@latest` | ✅ PASS | 92/100 (Great) |

### 1.3 Archivos Verificados Contra Reporte

#### Archivos que SÍ existen (coinciden con reporte):

| Archivo | Commit origen | Estado |
|---------|--------------|--------|
| `packages/domain/src/spec-013-rules.ts` | `20275e9` | ✅ EXISTE |
| `frontend/src/modules/portal/hooks/usePortalServiceCases.ts` | `20275e9` | ✅ EXISTE |
| `frontend/src/modules/dashboard/ui/NextActionsByRolePanel.tsx` | `628ac05` | ✅ EXISTE |
| `docs/architecture/FRONTEND_ROUTE_MAP.md` | `0f7ac76` | ✅ ACTUALIZADO |
| `docs/architecture/API_ENDPOINT_MATRIX.md` | `0f7ac76` | ✅ ACTUALIZADO |
| `backend/src/modules/service-cases/service-case.routes.ts` | `20275e9` | ✅ invoice-pipeline route |
| `backend/src/modules/planning-packet/planning-packet.service.ts` | `628ac05` | ✅ kit reminder |
| `backend/src/modules/order/administrative-workflow.service.ts` | `628ac05` | ✅ invoice pending + fix TS18048 |
| `frontend/src/modules/core/ui/layout/HeaderNotifications.tsx` | `20275e9` | ✅ header integration |

#### Archivos CREADOS en Sprint 1 y ELIMINADOS en Sprint 3 (🔴 REGRESIÓN):

| Archivo | Creado en | Eliminado en | Estado actual |
|---------|-----------|-------------|---------------|
| `frontend/src/modules/notifications/api/notification.api.ts` | `20275e9` | `3ba18ff` | 🔴 ELIMINADO (restaurado en auditoría) |
| `frontend/src/modules/notifications/api/types.ts` | `20275e9` | `3ba18ff` | 🔴 ELIMINADO (restaurado en auditoría) |
| `frontend/src/modules/notifications/hooks/useNotifications.ts` | `20275e9` | `3ba18ff` | 🔴 ELIMINADO (restaurado en auditoría) |
| `frontend/src/modules/notifications/hooks/useUnreadCount.ts` | `20275e9` | `3ba18ff` | 🔴 ELIMINADO (restaurado en auditoría) |
| `frontend/src/modules/notifications/ui/NotificationBell.tsx` | `20275e9` | `3ba18ff` | 🔴 ELIMINADO (restaurado en auditoría) |
| `frontend/src/modules/notifications/ui/NotificationCard.tsx` | `20275e9` | `3ba18ff` | 🔴 ELIMINADO (restaurado en auditoría) |
| `frontend/src/modules/notifications/ui/NotificationPanel.tsx` | `20275e9` | `3ba18ff` | 🔴 ELIMINADO (restaurado en auditoría) |

### 1.4 Archivos Sin Commit

| Archivo | Cambio | Estado |
|---------|--------|--------|
| `tooling/quality/baseline.json` | weak-token-ud: 778→779 | ⚠️ UNCOMMITTED |

### 1.5 React-Doctor Issues (92/100 — 2 warnings)

1. **Bugs (1 warning)**: Revisar con `--verbose` para identificar.
2. **Maintainability (1 warning)**: Revisar con `--verbose` para identificar.

---

## SECCIÓN 2: TAREAS PENDIENTES

### Tarea R1 — Commit archivos restaurados

**Archivos afectados** (7 archivos restaurados de `20275e9`):
- `frontend/src/modules/notifications/api/notification.api.ts`
- `frontend/src/modules/notifications/api/types.ts`
- `frontend/src/modules/notifications/hooks/useNotifications.ts`
- `frontend/src/modules/notifications/hooks/useUnreadCount.ts`
- `frontend/src/modules/notifications/ui/NotificationBell.tsx`
- `frontend/src/modules/notifications/ui/NotificationCard.tsx`
- `frontend/src/modules/notifications/ui/NotificationPanel.tsx`

**Qué hacer**: Verificar que los archivos existen y compilan. Luego hacer commit con estos archivos + el baseline actualizado.

**Verificación**: `npm run typecheck -w frontend` → PASS

---

### Tarea R2 — Commit baseline.json actualizado

**Archivo afectado**:
- `tooling/quality/baseline.json`

**Qué hacer**: El baseline tiene weak-token-ud incrementado de 778 a 779. Verificar que `npm run quality:strict` pase y commitear.

**Verificación**: `npm run quality:strict` → PASS

---

### Tarea R3 — React-Doctor: investigar 2 warnings

**Qué hacer**: Ejecutar `npx react-doctor@latest --verbose --scope changed` para identificar los 2 warnings y corregirlos.

Posibles causas:
- Bug: algún componente con dependencia faltante en useEffect/useMemo
- Maintainability: componente muy grande o lógica compleja en UI

**Verificación**: `npx react-doctor@latest` → 92/100 o más.

---

### Tarea R4 — Gates finales completos

Ejecutar en orden:
```bash
npm run typecheck -- --force      # 0 errores
npm run lint                       # 0 errores
npm run test                       # baseline tests intactos
npm run build                      # 0 errores
npm run contracts:check            # snapshot alineado
npm run quality:strict             # PASS
npm run verify                     # PASS
npx react-doctor@latest            # ≥ 87/100
```

Si TODOS PASS:
```bash
git add -A
git commit -m "fix(spec-016): restore 7 notifications files deleted in 3ba18ff regression
chore: update quality:strict baseline (weak-token-ud 779)
fix(audit): apply react-doctor fixes"
```

---

## SECCIÓN 3: RESUMEN DE DISCREPANCIAS REPORTE VS REALIDAD

| Item reportado | Estado real | Diferencia |
|----------------|-------------|------------|
| `notification.api.ts` creado | Creado en `20275e9`, ELIMINADO en `3ba18ff` | 🔴 Regresión corregida en auditoría |
| `types.ts` creado | Creado en `20275e9`, ELIMINADO en `3ba18ff` | 🔴 Regresión corregida en auditoría |
| `useNotifications.ts` creado | Creado en `20275e9`, ELIMINADO en `3ba18ff` | 🔴 Regresión corregida en auditoría |
| `useUnreadCount.ts` creado | Creado en `20275e9`, ELIMINADO en `3ba18ff` | 🔴 Regresión corregida en auditoría |
| NotificationBell/NotificationCard/NotificationPanel | Creados en `20275e9`, ELIMINADOS en `3ba18ff` | 🔴 Regresión corregida en auditoría |
| Todos los gates PASS | ✅ VERIFICADO | Sin diferencia |
| 92/100 react-doctor | ✅ VERIFICADO | Sin diferencia |

## SECCIÓN 4: VERIFICACIÓN GLOBAL

```bash
npm run typecheck -- --force    # 0 errores
npm run lint                     # 0 errores
npm test                         # baseline tests intactos
npm run build                    # 0 errores
npm run contracts:check          # snapshot alineado
npm run quality:strict           # PASS
npm run verify                   # PASS
npx react-doctor@latest          # ≥ 87/100
```

**Spec-016 solo se considera completo si TODOS los gates pasan Y los 7 archivos restaurados están commiteados.**
