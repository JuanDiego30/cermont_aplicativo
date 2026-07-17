# SPEC-016 — PLAN DE IMPLEMENTACIÓN DIRECTA (SIN ORQUESTACIÓN)

**Versión:** 1.0 — 5 de julio de 2026  
**Rama base:** `deploy/vps-clean`  
**Rama de trabajo:** `implement/spec-014-completion` (existente, con cambios acumulados)  
**Modo:** IMPLEMENTACIÓN DIRECTA — No investigar, no orquestar, no verificar. Solo CODIFICAR.

---

## 0. PROMPT MAESTRO — CÓMO DEBES TRABAJAR

Eres un **implementador directo** del sistema CERMONT S.A.S. Tu única función es **escribir código que cumpla exactamente** lo que cada tarea especifica. No investigues, no verifiques, no orquestes — solo CODIFICA.

### REGLAS ABSOLUTAS (del documento REGLAS_DESARROLLO_CERMONT.md)

1. **Stack prohibido**: Express 5.2.1, Mongoose 9.x, MongoDB, JWT, Zod 4.x, Next.js 16, React 19, TanStack Query, Zustand, Tailwind 4, Radix UI. ❌ No NestJS, Prisma, PostgreSQL, Auth.js, pnpm/yarn, Joi, Axios.
2. **Contract-First**: Si tocas un schema, el orden es: Zod → tipo → Mongoose → service → controller → route → frontend api → hook → UI → test.
3. **Zero any/unknown/null/undefined**: Prohibido introducir estos tipos. Usar status objects o discriminated unions.
4. **Zero try/catch en Express 5**: Express 5 propaga errores automáticamente.
5. **Zero console.log en producción**: Usar logger estructurado si necesitas logging.
6. **Zero fetch directo en componentes**: Usar apiClient + TanStack Query.
7. **Zero useEffect para data fetching**: Usar TanStack Query.
8. **RBAC desde @cermont/domain**: No hardcodear roles. Usar `canAccessModule` del domain.
9. **FileAsset es SSOT**: Para archivos, evidencias, adjuntos. No crear MediaAsset.
10. **Nombres en inglés**: Código interno en inglés. Español solo en UI visible al usuario.
11. **Mobile first**: 375px, touch targets ≥44px.
12. **No modificar package.json sin justificación explícita**.
13. **No eliminar funcionalidad existente** sin reemplazo verificado.
14. **Estados obligatorios**: Toda página crítica debe tener loading/error/empty/offline/forbidden.

### REGLAS DE TRABAJO

- Trabajas en la rama `implement/spec-014-completion`.
- Los cambios ya existen en el working directory (365 archivos modificados). NO los pierdas.
- No hagas `git` nada excepto `git add` y `git commit` al final de cada sprint.
- No lances subagentes, no investigues, no consultes documentación externa. Todo lo que necesitas está en este plan.
- Cada tarea especifica EXACTAMENTE qué archivo modificar. No te desvíes.
- Después de completar cada sprint, ejecuta los gates correspondientes.
- Si un gate falla, CORRIGE el error inmediatamente, no avances.
- Trabaja en orden secuencial: Sprint 0 → Sprint 1 → Sprint 2 → Sprint 3 → Sprint 4.

---

## SPRINT 0 — ESTABILIZACIÓN DE GATES (IMPEDITIVO)

**Objetivo:** Todos los gates verdes. Nada más importa hasta que esto pase.

---

### T0.1 — Regenerar snapshot API contract

**Qué hacer:**
El archivo `packages/shared-types/tests/contracts/__snapshots__/api-contracts.snapshot.test.ts.snap` está desactualizado. Debes regenerarlo.

**Archivo a modificar:**
- `packages/shared-types/tests/contracts/api-contracts.snapshot.test.ts`

**Cómo:**
1. Busca el bloque `migration-063` en los archivos de migración de contracts
2. Regenera el snapshot ejecutando el comando que actualiza el hash
3. Alternativamente, usa `npm run contracts:check -- --update` si existe ese script

**Si falla con EPERM** (como reportó tsx/esbuild):
- Ejecuta manualmente desde PowerShell como Administrador: el script que corresponda
- O copia manualmente el snapshot generado al archivo .snap

**Verificación:** `npm run test -w @cermont/shared-types` → PASS

---

### T0.2 — Corregir 6 errores Biome en backend

**Qué hacer:**
El linter reporta 6 errores en biome sobre el backend. Necesitas corregirlos.

**Archivo a modificar:**
Ejecuta primero `npm run lint 2>&1` para ver los errores exactos, luego corrige cada uno.

Los errores típicos de Biome incluyen:
- Asignaciones en condicionales: `if (x = y)` → cambiarlo a `if (x === y)` o extraer la asignación
- Variables no usadas: eliminarlas
- Comparaciones sueltas

**Proceder:**
1. Corre `npm run lint -w backend` para ver los errores exactos
2. Corrige CADA uno de los 6 errores en los archivos señalados
3. Vuelve a correr lint hasta que pase

**Verificación:** `npm run lint -w backend` → PASS

---

### T0.3 — Corregir 2 tests frontend fallando (CostBudgetStatus)

**Qué hacer:**
El archivo `frontend/tests/modules/costs/CostBudgetStatus.test.tsx` tiene 2 tests fallando.

**Archivo a modificar:**
- `frontend/tests/modules/costs/CostBudgetStatus.test.tsx`
- Posiblemente `frontend/src/modules/costs/ui/CostBudgetStatus.tsx`

**Contexto del error:**
Los tests esperan que `CostBudgetStatus` use `actual - estimated` como la comparación de varianza. Revisa si la lógica en el componente cambió o si el test tiene expectativas incorrectas.

**Proceder:**
1. Corre `npm run test -w frontend -- -t "CostBudgetStatus"` para ver los errores exactos
2. Determina si el error está en el componente o en el test
3. Si el componente cambió: actualiza el test para reflejar la nueva lógica
4. Si el test es correcto: corrige el componente
5. Verifica que ambos tests pasen

**Verificación:** `npm run test -w frontend -- -t "CostBudgetStatus"` → ambos tests PASS

---

### T0.4 — Forzar typecheck fresco

**Qué hacer:**
Turborepo está cacheando typecheck. Forzar ejecución completa.

```bash
npm run typecheck -- --force
```

Si hay errores reales de TypeScript (no cache), corregirlos.

**Verificación:** `npm run typecheck -- --force` → PASS (sin errores)

---

### T0.5 — Ejecutar quality:strict y ajustar baseline

**Qué hacer:**
El comando `npm run quality:strict` falla porque el baseline de weak tokens está desactualizado.

**Archivo a modificar:**
- `tooling/quality/check-weak-tokens.ts` (ajustar baseline numbers)

**Proceder:**
1. Corre `npm run quality:strict 2>&1` para ver los valores actuales
2. Actualiza los números baseline en el archivo de configuración de quality
3. Vuelve a correr hasta que pase

**Verificación:** `npm run quality:strict` → PASS

---

### T0.6 — Ejecutar react-doctor y corregir issues

**Qué hacer:**
Correr `npx react-doctor@latest` y capturar el score. Si es menor a 87/100, corregir los issues más graves.

**Archivos a modificar:**
Dependerá de los hallazgos de react-doctor. Priorizar:
- Issues de accesibilidad (a11y) — más impacto en score
- Issues de mantenibilidad
- Bugs

**Proceder:**
1. Corre `npx react-doctor@latest 2>&1 > .sisyphus/evidence/react-doctor-baseline.txt`
2. Lee los hallazgos
3. Corrige hasta alcanzar ≥87/100

**Verificación:** `npx react-doctor@latest` → ≥87/100

---

### T0.7 — Verificación final de gates

```bash
npm run typecheck -- --force   # 0 errores
npm run lint                   # 0 errores
npm test                       # 0 fallos
npm run build                  # 0 errores
npm run contracts:check        # PASS
npm run quality:strict        # PASS
npm run verify                 # PASS
```

Si TODOS pasan, haz commit:
```bash
git add -A
git commit -m "fix(gates): Sprint 0 - estabilización de gates de calidad"
```

Si ALGUNO falla, NO COMMITEES. Corrige y repite.

---

## SPRINT 1 — COMPLETAR MÓDULOS PARCIALES

---

### T1.1 — Crear `spec-013-rules.ts` en domain

**Archivo a crear:**
- `packages/domain/src/spec-013-rules.ts`

**Archivo a modificar:**
- `packages/domain/src/index.ts`

**Qué hacer:**
Crear el archivo `spec-013-rules.ts` que el plan Spec-013 S1.6 requiere. Este archivo debe contener las mismas funciones que existen en `spec-015-rules.ts`, pero con el nombre y estructura que Spec-013 espera.

El archivo debe exportar:
- `evaluatePreflightGates(items, checks): PreflightResult`
- `evaluateSLARisk(slaDeadline: string, currentStep: number): SLARiskLevel`
- `evaluateCostRisk(consumedPercent: number): CostRiskLevel`
- `evaluateEvidenceCompleteness(slots): CanClosePhase`
- `computeMTTR(sessions): number`
- `computeMTBF(orders): number`
- `computeFirstTimeFixRate(orders): number`
- `computeTechnicianUtilization(sessions): number`

**NO** copies y pegues de spec-015-rules.ts. En su lugar, **re-exporta** desde spec-015-rules.ts:

```typescript
// packages/domain/src/spec-013-rules.ts
// SPEC-013: Reglas de negocio — re-exportadas desde spec-015-rules.ts
// Este archivo existe por compatibilidad con el plan Spec-013 S1.6

export {
  evaluatePreflightGates,
  evaluateSLARisk,
  evaluateCostRisk,
  evaluateEvidenceCompleteness,
  computeMTTR,
  computeMTBF,
  computeFirstTimeFixRate,
  computeTechnicianUtilization,
} from './spec-015-rules';

export type {
  PreflightGateInput,
  PreflightResult,
  SLARiskLevel,
  CostRiskLevel,
  CanClosePhase,
  SessionForKPI,
  OrderForKPI,
} from './spec-015-rules';
```

Luego en `packages/domain/src/index.ts`, agrega:
```typescript
export * from './spec-013-rules';
```

**Verificación:** `npm run typecheck -w @cermont/domain` → PASS

---

### T1.2 — Crear api/hooks para notifications module

**Archivos a crear:**
- `frontend/src/modules/notifications/api/notification.api.ts`
- `frontend/src/modules/notifications/hooks/useNotifications.ts`
- `frontend/src/modules/notifications/hooks/useUnreadCount.ts`

**Qué hacer:**

**`notification.api.ts`:**
```typescript
// api/notification.api.ts
import { apiClient } from '@/lib/http/api-client';
import type { Notification } from './types';

const BASE = '/notifications';

export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get(`${BASE}`);
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await apiClient.get(`${BASE}/unread-count`);
  return data?.count ?? 0;
}

export async function markAsRead(id: string): Promise<void> {
  await apiClient.patch(`${BASE}/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.post(`${BASE}/mark-all-read`);
}
```

**`useNotifications.ts`:**
```typescript
// hooks/useNotifications.ts
import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../api/notification.api';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: fetchNotifications,
    refetchInterval: 30_000, // polling cada 30s
  });
}
```

**`useUnreadCount.ts`:**
```typescript
// hooks/useUnreadCount.ts
import { useQuery } from '@tanstack/react-query';
import { fetchUnreadCount } from '../api/notification.api';
import { notificationKeys } from './useNotifications';

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
  });
}
```

**Verificación:** `npm run typecheck -w frontend` → PASS

---

### T1.3 — Crear hooks para portal module

**Archivo a crear:**
- `frontend/src/modules/portal/hooks/usePortalServiceCases.ts`

**Qué hacer:**

```typescript
// hooks/usePortalServiceCases.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';

const BASE = '/portal/service-cases';

export const portalKeys = {
  all: ['portal'] as const,
  serviceCases: () => [...portalKeys.all, 'service-cases'] as const,
  serviceCaseDetail: (id: string) => [...portalKeys.all, 'detail', id] as const,
};

export function usePortalServiceCases() {
  return useQuery({
    queryKey: portalKeys.serviceCases(),
    queryFn: async () => {
      const { data } = await apiClient.get(BASE);
      return data;
    },
  });
}

export function usePortalServiceCaseDetail(id: string) {
  return useQuery({
    queryKey: portalKeys.serviceCaseDetail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`${BASE}/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
```

**Verificación:** `npm run typecheck -w frontend` → PASS

---

### T1.4 — Exponer invoice-pipeline como ruta HTTP

**Archivo a modificar:**
- `backend/src/modules/service-cases/service-case.controller.ts`
- `backend/src/modules/service-cases/service-case.routes.ts`

**Qué hacer:**
La función `getInvoicePipeline` ya existe en `service-case.service.ts` (línea 1642). Necesitas exponerla como endpoint HTTP.

En `service-case.routes.ts`, agrega:
```typescript
// GET /api/service-cases/:id/invoice-pipeline — SES→Invoice→Payment tracking
// Roles: INTERNAL_ROLES (gerente, residente, administrativo)
router.get(
  '/:id/invoice-pipeline',
  authenticate,
  authorize(...INTERNAL_ROLES),
  validateParams(IdParamSchema),
  ServiceCaseController.getInvoicePipeline,
);
```

En `service-case.controller.ts`, agrega:
```typescript
// Controller method
async getInvoicePipeline(req: Request, res: Response) {
  const { id } = req.params;
  const result = await serviceCaseService.getInvoicePipeline(id);
  res.json({ success: true, data: result });
}
```

**Verificación:** `npm run typecheck -w backend` → PASS

---

### T1.5 — Integrar NotificationBell en header

**Archivo a modificar:**
Encontrar el header principal del frontend y agregar NotificationBell.

Busca el archivo del header existente (ej: `frontend/src/modules/core/ui/Header.tsx` o similar) e importa:

```tsx
import { NotificationBell } from '@/modules/notifications/ui/NotificationBell';
```

Agrega el componente `<NotificationBell />` en el área de navegación/acciones del header.

**Verificación:** `npm run typecheck -w frontend` → PASS

---

### T1.6 — Commit Sprint 1

```bash
git add -A
git commit -m "feat(domain): add spec-013-rules.ts re-export for Spec-013 compatibility
feat(ui): add notifications api/hooks module
feat(ui): add portal hooks module
feat(backend): expose GET /service-cases/:id/invoice-pipeline route
feat(ui): integrate NotificationBell in header"
```

---

## SPRINT 2 — ESTABILIZAR E2E

---

### T2.1 — Crear fixtures E2E con autenticación

**Archivos a crear/modificar:**
- `frontend/tests/e2e/fixtures/base.fixture.ts`
- `frontend/tests/e2e/fixtures/auth.fixture.ts`

**Qué hacer:**
Crear fixtures que proporcionen autenticación real usando el endpoint de login.

```typescript
// fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { apiClient } from '@/lib/http/api-client';

type AuthFixtures = {
  authToken: string;
  authenticatedRequest: typeof apiClient;
};

export const test = base.extend<AuthFixtures>({
  authToken: async ({}, use) => {
    const response = await fetch('http://127.0.0.1:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@cermont.com', password: 'test' }),
    });
    const { data } = await response.json();
    await use(data.accessToken);
  },
});

export { expect } from '@playwright/test';
```

---

### T2.2 — Corregir selectores inestables en specs E2E

**Archivos a modificar:**
- `frontend/tests/e2e/spec-014/01-cockpit-14-steps.spec.ts`
- `frontend/tests/e2e/spec-014/02-dashboard-kpis.spec.ts`
- (y otros según sea necesario)

**Qué hacer:**
Revisar cada spec E2E y reemplazar selectores frágiles (texto dinámico, clases CSS volátiles) con selectores estables basados en `data-testid` o roles ARIA.

Para cada spec:
1. Busca selectores como `page.locator('text=...')` o `page.locator('.some-class')`
2. Reemplázalos con `page.getByTestId('...')` o `page.getByRole('...', { name: '...' })`
3. Si el componente no tiene `data-testid`, agrégalo en el código fuente del componente

Ejemplo de conversión:
```typescript
// ANTES (frágil):
await page.locator('text=Cargando...').waitFor();

// DESPUÉS (estable):
await page.getByTestId('cockpit-progress-bar').waitFor();
```

---

### T2.3 — Ejecutar y depurar E2E

```bash
npm run test:e2e -w frontend -- tests/e2e/spec-014/ --max-failures=0
```

Por cada spec que falle:
1. Lee el error exacto
2. Corrige el selector, fixture, o timeout
3. Vuelve a ejecutar SOLO ese spec: `npm run test:e2e -w frontend -- tests/e2e/spec-014/01-cockpit-14-steps.spec.ts`
4. Una vez que pase individualmente, ejecuta toda la suite

**Verificación:** `npm run test:e2e -w frontend -- tests/e2e/spec-014/` → 10/10 PASS

---

### T2.4 — Commit Sprint 2

```bash
git add -A
git commit -m "test(e2e): stabilize E2E fixtures with real auth and robust selectors"
```

---

## SPRINT 3 — FUNCIONALIDADES PENDIENTES

---

### T3.1 — NextActionsByRolePanel (dashboard)

**Archivo a crear:**
- `frontend/src/modules/dashboard/ui/NextActionsByRolePanel.tsx`

**Qué hacer:**
Crear un panel que muestre las próximas acciones filtradas por el rol del usuario autenticado.

```tsx
// NextActionsByRolePanel.tsx
'use client';

import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';

type ActionItem = {
  id: string;
  description: string;
  orderCode: string;
  deadline?: string;
  deepLink: string;
  urgency: 'normal' | 'urgent' | 'overdue';
};

export function NextActionsByRolePanel({ actions }: { actions: ActionItem[] }) {
  const role = useAuthStore(state => state.user?.role);

  const roleActions = actions.filter(a => {
    // Filtro por rol
    if (role === 'gerente') return a.description.includes('aprobar') || a.description.includes('pago');
    if (role === 'administrativo') return a.description.includes('factura') || a.description.includes('SES');
    if (role === 'tecnico' || role === 'operador') return a.description.includes('ejecutar') || a.description.includes('evidencia');
    return true;
  });

  if (roleActions.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Próximas acciones</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No hay acciones pendientes para tu rol</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Próximas acciones</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {roleActions.map(action => (
          <div key={action.id} className="flex items-start gap-3 rounded-lg border p-3">
            <AlertCircle className={`mt-0.5 h-4 w-4 ${
              action.urgency === 'overdue' ? 'text-red-500' :
              action.urgency === 'urgent' ? 'text-orange-500' : 'text-blue-500'
            }`} />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{action.description}</p>
              <p className="text-xs text-muted-foreground">Orden: {action.orderCode}</p>
              {action.deadline && (
                <Badge variant={action.urgency === 'overdue' ? 'destructive' : 'outline'}>
                  {action.urgency === 'overdue' ? 'Vencida' :
                   action.urgency === 'urgent' ? 'Urgente' : action.deadline}
                </Badge>
              )}
            </div>
            <Button size="sm" variant="ghost" asChild>
              <a href={action.deepLink}><ArrowRight className="h-4 w-4" /></a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

**Verificación:** `npm run typecheck -w frontend` → PASS

---

### T3.2 — Notificaciones de kit incompleto (backend)

**Archivo a modificar:**
- `backend/src/modules/planning-packet/planning-packet.service.ts`

**Qué hacer:**
Agregar lógica para que al aprobar un planning packet, se programe una notificación 24h antes de la ejecución con la lista de herramientas del kit.

Busca la función `approveWithReadinessCheck` o similar y agrega al final:

```typescript
// Después de aprobar, programar recordatorio de kit
if (packet.kitTemplateId) {
  const kit = await this.kitModel.findById(packet.kitTemplateId).lean();
  const scheduledDate = new Date(packet.scheduledStartDate.getTime() - 24 * 60 * 60 * 1000);
  
  await this.notificationService.scheduleNotification({
    userIds: packet.assignedCrewIds,
    type: 'KIT_REMINDER',
    title: 'Recordatorio: Kit de herramientas',
    message: `Recuerda verificar el kit para la orden ${packet.serviceCaseCode}: ${kit?.items?.map(i => i.name).join(', ') || 'herramientas asignadas'}`,
    scheduledFor: scheduledDate,
    deepLink: `/planning-packets/${packet._id}`,
  });
}
```

**Verificación:** `npm run typecheck -w backend` → PASS

---

### T3.3 — Alertas de facturación pendiente (backend)

**Archivo a modificar:**
- `backend/src/modules/order/administrative-workflow.service.ts`
- O el servicio donde se maneje el flujo administrativo

**Qué hacer:**
Cuando un ClientAcceptance se completa (paso 9), disparar notificación al administrativo para crear SES y factura.

```typescript
// En el handler de ClientAcceptance completado
await this.notificationService.sendNotification({
  userIds: administrativeUserIds,
  type: 'INVOICE_PENDING',
  title: 'Acta firmada — Pendiente facturación',
  message: `La orden ${serviceCaseCode} tiene acta firmada. Continuar con SES → Factura → Pago`,
  deepLink: `/service-cases/${serviceCaseId}/cockpit`,
});
```

**Verificación:** `npm run typecheck -w backend` → PASS

---

### T3.4 — Commit Sprint 3

```bash
git add -A
git commit -m "feat(ui): add NextActionsByRolePanel to dashboard
feat(notifications): add kit reminder and invoice pending notifications"
```

---

## SPRINT 4 — CALIDAD Y DOCUMENTACIÓN FINAL

---

### T4.1 — Actualizar FRONTEND_ROUTE_MAP.md

**Archivo a modificar:**
- `docs/architecture/FRONTEND_ROUTE_MAP.md`

Agregar las rutas nuevas que se implementaron en Spec-014 y quedaron sin documentar:
- `/service-cases/[id]/cockpit` — Cockpit 14 pasos
- `/execution-sessions/[id]` — Field execution mode
- `/costs/catalog` — Catálogo de costos
- `/reports/[id]/draft` — Borrador de informe
- `/reports/[id]/sign` — Firma digital
- `/invoices/[id]/pipeline` — Pipeline facturación
- `/notifications` — Centro de notificaciones
- `/portal/service-cases` — Portal cliente: lista
- `/portal/service-cases/[id]` — Portal cliente: detalle

---

### T4.2 — Actualizar API_ENDPOINT_MATRIX.md

**Archivo a modificar:**
- `docs/architecture/API_ENDPOINT_MATRIX.md`

Agregar:
- `GET /service-cases/:id/cockpit`
- `GET /service-cases/:id/invoice-pipeline`
- `POST /planning-packets/:id/validate-readiness`
- `POST /planning-packets/:id/approve`
- `POST /execution-sessions/:id/preflight`
- `GET /costs/:orderId/intelligence`
- `GET/POST /costs/catalog`
- `GET /dashboard/operational-kpis`
- `GET /dashboard/sla-risk`
- `GET /reports/auto-draft/:serviceCaseId`
- `POST /evidence/:id/review`

---

### T4.3 — Verificación de calidad final

Ejecutar todos los gates:
```bash
npm run typecheck -- --force
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
npx react-doctor@latest
```

Cada uno debe pasar sin errores. Documentar resultados en `.sisyphus/evidence/spec-016-final-gates.txt`.

---

### T4.4 — Commit final

```bash
git add -A
git commit -m "docs: update FRONTEND_ROUTE_MAP and API_ENDPOINT_MATRIX for Spec-014/016 changes
chore: final quality gates verification"
```

---

## VERIFICACIÓN GLOBAL

```bash
# Gates
npm run typecheck -- --force    # 0 errores
npm run lint                     # 0 errores
npm test                         # baseline tests intactos
npm run build                    # 0 errores
npm run contracts:check          # snapshot alineado
npm run quality:strict          # PASS
npm run verify                   # PASS
npx react-doctor@latest         # ≥ 87/100

# E2E
npm run test:e2e -w frontend -- tests/e2e/spec-014/   # 10/10 pass
```

**Spec-016 solo se considera completa si TODOS los gates pasan.**
