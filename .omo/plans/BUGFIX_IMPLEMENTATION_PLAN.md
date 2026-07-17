# PLAN DE CORRECCIÓN — AUDITORÍA PLAYWRIGHT CERMONT S.A.S.

## TL;DR

> **Quick Summary**: Corregir los 6 bugs P0 y 5 bugs P1 detectados en la auditoría Playwright que bloquean el flujo de 14 pasos, más 28 oportunidades de innovación. El plan desbloquea el paso 3 (Propuesta→PO) que actualmente detiene todo el flujo operativo.
>
> **Deliverables**:
> - 6 bugs P0 corregidos (flujo 14 pasos desbloqueado)
> - 5 bugs P1 de UX eliminados
> - 28 innovaciones implementadas (P2 + estratégicas)
> - Service Case SC-2026-0001 avanzable de paso 3 a paso 14
> - Transiciones de estado completas en Propuestas
> - Vincular Propuesta ↔ ServiceCase
>
> **Estimated Effort**: Large (3-4 semanas)
> **Parallel Execution**: YES — 5 waves
> **Critical Path**: Phase 0 → Phase 1 → Phase 2 → Phase 3
> **Baseline**: Auditoría Playwright 2026-07-14 (34 páginas, 6 P0, 5 P1, 28 oportunidades)

---

## Context

### Current State (Post-Audit)
| Métrica | Valor |
|---------|-------|
| Bugs P0 bloqueantes | 6 |
| Bugs P1 UX | 5 |
| Oportunidades innovación | 28 |
| Páginas auditadas | 34/34 (100% OK) |
| Páginas con datos reales | 6/34 (17.6%) |
| Flujo 14 pasos completable | ❌ BLOQUEADO en Paso 3 |
| Endpoints verificados | 15 |
| Errores consola | 3+ |
| Readiness frontend funcional | ~45% |

### Bug List (de auditoría)
**P0 - Críticos:**
- B-01: Link "Elaborar propuesta económica" no navegable (texto plano)
- B-02: Propuesta no vinculable a ServiceCase (sin campo serviceCaseId)
- B-03: Botón "Avanzar siguiente paso" deshabilitado sin indicación
- B-04: Badge "1 pendientes" en sidebar no se actualiza reactivamente
- B-06: No existe endpoint PATCH /proposals/:id/status
- B-09: Dropdown "Propuesta aprobada" siempre vacío en PO

**P1 - UX:**
- B-05: Técnico responsable requiere ObjectId manual
- B-07: Columna FLUJO en propuestas no interactiva
- B-08: Nueva propuesta sin campo serviceCaseId
- B-10: Dropdown PO sin filtro por sede
- U-01: Nodos diagrama 14 pasos no clicables

### Stack
Express 5.2.1 · Next.js 16.2.1 · TypeScript 5.x strict · MongoDB + Mongoose 9.x · Zod 4.x · JWT · TanStack Query · shadcn/ui

### Constraints (de REGLAS_DESARROLLO_CERMONT.md)
- Contract-First: shared-types → Mongoose → backend → frontend
- Zero `any`, `null`, `undefined` introducidos
- Zero duplicación de schemas, roles, rutas
- Zero fetch directo en componentes — siempre apiClient + TanStack Query
- Zero páginas en blanco — loading/error/empty/offline states
- Gate obligatorio: `typecheck && lint && build && test` antes de cada commit

---

## Execution Strategy

### Parallel Waves

```
Wave 0 (Día 0 — Preparación):
  ├── T00: Setup rama feat/bugfix-audit desde implement/spec-024-post-spec022-continuation
  └── T01: Verificar gates actuales (typecheck, lint, build, test)

Wave 1 (Días 1-2 — P0: Desbloquear flujo 14 pasos, MAX PARALLEL):
  ├── T02: Schema UpdateProposalStatusSchema + serviceCaseId en shared-types
  ├── T03: Backend PATCH /proposals/:id/status
  ├── T04: Backend GET /service-cases/:id/proposal
  ├── T05: Frontend botones estado propuesta (Enviar/Aprobar/Rechazar)
  ├── T06: Frontend link navegable en bloqueadores ServiceCase
  └── T07: Frontend vincular propuesta a ServiceCase via query param

Wave 2 (Días 3-4 — P0 continuados + P1 inicio):
  ├── T08: Frontend dropdown PO con propuestas aprobadas + autocomplete campos
  ├── T09: Backend GET /proposals?status=approved&sede=:sede
  ├── T10: Frontend badge solicitudes reactivo (refetchInterval 30s)
  ├── T11: Componente UserSelect con autocomplete usuarios
  └── T12: Frontend nodos 14 pasos clicables en Cockpit

Wave 3 (Días 5-7 — P1 UX + P2):
  ├── T13: Columna FLUJO interactiva con tooltip en propuestas
  ├── T14: Botones accionables en PRÓXIMAS ACCIONES del Cockpit
  ├── T15: Fix loading state persistente en /admin/settings
  ├── T16: CTAs en empty states de módulos sin datos
  ├── T17: Margen% column en propuestas
  ├── T18: Previsualización PDF en documentos
  └── T19: Dashboard personalizable drag-drop

Wave 4 (Días 8-10 — P2 continuados):
  ├── T20: Excel export desde órdenes
  ├── T21: Scanner QR para inventario
  ├── T22: Timeline aprobación en propuestas
  ├── T23: Tooltip dots FLUJO + PO expiry alerts
  ├── T24: Certificaciones vencimiento en Personal
  ├── T25: Filtros requestId en auditoría
  └── T26: Health score badge en clientes

Wave 5 (Días 11-16 — Innovaciones estratégicas):
  ├── T27: Motor templates dinámicos + 5 seeds CERMONT
  ├── T28: Offline-first execution con IndexedDB
  ├── T29: Dashboard KPIs reactivos con recharts
  ├── T30: PDF Export Engine (pdf-lib)
  └── T31: Service Cases Kanban con @dnd-kit

Wave FINAL (Verificación):
  ├── F1: Plan Compliance Audit (oracle)
  ├── F2: Code Quality Review (unspecified-high)
  ├── F3: Real Manual QA con Playwright (unspecified-high)
  └── F4: Scope Fidelity Check (deep)
```

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — All verification is agent-executed.

### Test Decision
- **Infrastructure**: ✅ Vitest + Playwright
- **Automated tests**: Tests-after (each task includes tests)
- **Gates**: `typecheck && lint && build && test` before each commit

### QA Policy
Each task includes:
- QA scenarios ejecutables por agente (Playwright + curl + bash)
- Happy path + error scenario
- Evidence saved to `.sisyphus/evidence/task-{N}/`

---

## TODOs

> Cada tarea sigue Contract-First: `shared-types (Zod) → Mongoose model → backend service → controller → route → API service frontend → query keys → TanStack Query hook → UI components → tests → commit`
>
> QA scenarios: Mínimo 1 happy path + 1 error/edge case por tarea. Evidencia en `.sisyphus/evidence/task-{N}/`.

---

### WAVE 0 — PREPARACIÓN

- [ ] T00. **Setup rama de trabajo**

  **What to do**:
  - Crear rama `feat/bugfix-audit` desde `implement/spec-024-post-spec022-continuation`
  - Verificar que los gates actuales pasan:
    ```bash
    npm run typecheck
    npm run lint
    npm run build
    npm run test
    ```
  - Confirmar que el backend responde:
    ```bash
    curl -s http://127.0.0.1:4000/api/health/live
    curl -s http://127.0.0.1:4000/api/health/ready
    ```

  **Must NOT do**:
  - No modificar código existente
  - No instalar dependencias

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 0
  - **Blocks**: T01-T31 (dependen de rama limpia)
  - **Blocked By**: None

  **References**:
  - `.sisyphus/evidence/playwright-audit-report.md` — Auditoría base
  - `.sisyphus/plans/FINAL_IMPLEMENTATION_PLAN.md` — Plan de implementación existente

  **Acceptance Criteria**:
  - [ ] Rama `feat/bugfix-audit` creada
  - [ ] `npm run typecheck && npm run lint && npm run build && npm run test` → all pass

  **QA Scenarios**:
  ```
  Scenario: Verificar rama y gates
    Tool: Bash
    Preconditions: Rama creada
    Steps:
      1. git branch --show-current → debe mostrar feat/bugfix-audit
      2. npm run typecheck → exit code 0
      3. npm run lint → exit code 0
    Expected Result: Rama correcta, gates pasan
    Evidence: .sisyphus/evidence/task-00-gates.txt
  ```
  **Commit**: NO (setup inicial)

---

### WAVE 1 — BUGS P0: DESBLOQUEAR FLUJO 14 PASOS (Días 1-2)

- [ ] T01. **Schema de transición de estado en Propuestas + serviceCaseId**

  **What to do**:
  - En `packages/shared-types/src/schemas/proposal.schema.ts`, agregar:
    ```typescript
    // Schema actual existe — EXTENDER con:
    export const ProposalStatusSchema = z.enum([
      'draft', 'sent', 'approved', 'rejected', 'converted'
    ]);

    export const UpdateProposalStatusSchema = z.object({
      status: z.enum(['sent', 'approved', 'rejected']),
      notes: z.string().max(500).optional(),
      approvedAt: z.string().datetime().optional(),
    });

    export const CreateProposalSchema = z.object({
      // ... campos existentes ...
      serviceCaseId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    });
    ```
  - Si `CreateProposalSchema` ya existe, extenderlo con el campo `serviceCaseId`
  - Verificar que `Proposal` type se mantiene compatible con los schemas existentes

  **Must NOT do**:
  - No cambiar campos existentes del schema Proposal
  - No eliminar validaciones existentes

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Parallel Group**: Wave 1 (con T02, T03, T04)
  - **Blocks**: T03, T04, T05, T06, T07, T08
  - **Blocked By**: None

  **References**:
  - `packages/shared-types/src/schemas/proposal.schema.ts` — Schema actual
  - `.sisyphus/evidence/playwright-audit-report.md` — Sección 2.1 (bug B-06)

  **Acceptance Criteria**:
  - [ ] `ProposalStatusSchema` incluye 'draft', 'sent', 'approved', 'rejected', 'converted'
  - [ ] `UpdateProposalStatusSchema` con status, notes, approvedAt
  - [ ] `CreateProposalSchema` extendido con serviceCaseId opcional
  - [ ] `npm run typecheck -w packages/shared-types` → 0 errores
  - [ ] `npm run typecheck` → 0 errores (no rompe nada)

  **QA Scenarios**:
  ```
  Scenario: Schemas compilan correctamente
    Tool: Bash
    Preconditions: Schemas modificados
    Steps:
      1. npm run typecheck -w packages/shared-types
    Expected Result: Exit code 0, no type errors
    Evidence: .sisyphus/evidence/task-01-schemas-typecheck.txt

  Scenario: Schema valida correctamente
    Tool: Bash
    Preconditions: Schemas compilados
    Steps:
      1. node -e "const z = require('zod'); const s = z.enum(['draft','sent','approved','rejected','converted']); console.log(s.parse('approved'));"
    Expected Result: 'approved' printed
    Evidence: .sisyphus/evidence/task-01-schema-validation.txt
  ```
  **Commit**: YES
  - Message: `feat: proposal schemas — UpdateProposalStatusSchema, serviceCaseId field in CreateProposalSchema`
  - Files: `packages/shared-types/src/schemas/proposal.schema.ts`
  - Pre-commit: `npm run typecheck -w packages/shared-types && npm run typecheck`

- [ ] T02. **Backend: PATCH /proposals/:id/status**

  **What to do**:
  - En `backend/src/services/proposal/proposal.service.ts`:
    ```typescript
    async updateStatus(id: string, dto: UpdateProposalStatusInput, actorId: string): Promise<Proposal> {
      const proposal = await this.proposalRepo.findById(id);
      if (!proposal) throw new AppError('PROPOSAL_NOT_FOUND', 404);

      // Validar transiciones permitidas
      const ALLOWED_TRANSITIONS: Record<string, string[]> = {
        'draft':    ['sent'],
        'sent':     ['approved', 'rejected'],
        'approved': ['converted'],
        'rejected': [],
        'converted': [],
      };

      const allowed = ALLOWED_TRANSITIONS[proposal.status];
      if (!allowed?.includes(dto.status)) {
        throw new AppError('INVALID_TRANSITION', 400,
          `No se puede cambiar de ${proposal.status} a ${dto.status}`);
      }

      const update: Record<string, unknown> = {
        status: dto.status,
        updatedBy: actorId,
        updatedAt: new Date(),
      };
      if (dto.notes) update.statusNotes = dto.notes;
      if (dto.approvedAt) update.approvedAt = new Date(dto.approvedAt);

      return await this.proposalRepo.update(id, update);
    }
    ```
  - En `backend/src/controllers/proposal.controller.ts`:
    ```typescript
    async updateStatus(req: Request, res: Response) {
      const { id } = req.params;
      const dto = UpdateProposalStatusSchema.parse(req.body);
      const result = await proposalService.updateStatus(id, dto, req.user.id);
      res.json({ success: true, data: result });
    }
    ```
  - En `backend/src/routes/proposal.routes.ts`:
    ```typescript
    router.patch('/:id/status',
      authenticate,
      authorize('gerente', 'residente'),
      validateBody(UpdateProposalStatusSchema),
      proposalController.updateStatus
    );
    ```
  - Registrar auditoría en cada transición: `auditService.log('PROPOSAL_STATUS_CHANGED', actorId, id, { from: oldStatus, to: newStatus })`

  **Must NOT do**:
  - No modificar POST /proposals existente
  - No eliminar validaciones actuales

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Parallel Group**: Wave 1 (con T01, T03, T04)
  - **Blocks**: T05 (frontend depende de endpoint)
  - **Blocked By**: T01 (schema UpdateProposalStatusSchema)

  **References**:
  - `backend/src/services/proposal/proposal.service.ts` — Servicio actual
  - `backend/src/controllers/proposal.controller.ts` — Controller actual
  - `backend/src/routes/proposal.routes.ts` — Rutas actuales
  - `backend/src/modules/auth/auth.routes.ts` — Patrón de rutas auth (middleware authenticate, authorize)

  **Acceptance Criteria**:
  - [ ] PATCH /api/proposals/:id/status → 200 OK con transición válida
  - [ ] PATCH /api/proposals/:id/status → 400 con transición inválida (ej: draft→approved)
  - [ ] PATCH /api/proposals/:id/status → 404 si propuesta no existe
  - [ ] Auditoría registra PROPOSAL_STATUS_CHANGED
  - [ ] `npm run typecheck -w backend && npm run test -w backend` → pass

  **QA Scenarios**:
  ```
  Scenario: Transición draft→sent funciona
    Tool: Bash
    Preconditions: Propuesta en estado draft (PROP-2026-0004)
    Steps:
      1. curl -s -X PATCH http://127.0.0.1:4000/api/proposals/PROP_ID/status -H "Content-Type: application/json" -d '{"status":"sent"}' -H "Authorization: Bearer $TOKEN" | jq '.success'
    Expected Result: true
    Evidence: .sisyphus/evidence/task-02-draft-to-sent.txt

  Scenario: Transición inválida draft→approved rechazada
    Tool: Bash
    Preconditions: Propuesta en estado draft
    Steps:
      1. curl -s -X PATCH http://127.0.0.1:4000/api/proposals/PROP_ID/status -H "Content-Type: application/json" -d '{"status":"approved"}' -H "Authorization: Bearer $TOKEN" | jq '.error.code'
    Expected Result: INVALID_TRANSITION
    Evidence: .sisyphus/evidence/task-02-invalid-transition.txt
  ```
  **Commit**: YES
  - Message: `feat: backend — PATCH /proposals/:id/status with transition validation`
  - Files: `backend/src/services/proposal/proposal.service.ts`, `backend/src/controllers/proposal.controller.ts`, `backend/src/routes/proposal.routes.ts`
  - Pre-commit: `npm run typecheck -w backend && npm run lint -w backend && npm run test -w backend`

- [ ] T03. **Backend: GET /service-cases/:id/proposal**

  **What to do**:
  - Crear endpoint que retorne la propuesta vinculada a un ServiceCase:
    ```typescript
    // backend/src/routes/service-case.routes.ts
    router.get('/:id/proposal',
      authenticate,
      authorizeAllAuthenticated(),
      serviceCaseController.getLinkedProposal
    );
    ```
  - En `service-case.service.ts`:
    ```typescript
    async getLinkedProposal(serviceCaseId: string): Promise<Proposal | null> {
      const proposal = await ProposalModel.findOne({ serviceCaseId });
      return proposal;
    }
    ```
  - Si no hay propuesta vinculada, retornar `{ success: true, data: null }` (no error)

  **Must NOT do**:
  - No modificar endpoints GET existentes de ServiceCase
  - No eliminar funcionalidad actual

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Parallel Group**: Wave 1 (con T01, T02, T04)
  - **Blocks**: T06, T07 (frontend depende de este endpoint)
  - **Blocked By**: T01 (schema serviceCaseId)

  **References**:
  - `backend/src/modules/service-case/` — Rutas y servicios existentes
  - `backend/src/modules/proposal/` — Modelo Proposal

  **Acceptance Criteria**:
  - [ ] GET /api/service-cases/:id/proposal → 200 con propuesta vinculada (si existe)
  - [ ] GET /api/service-cases/:id/proposal → 200 con data:null (si no existe)
  - [ ] `npm run typecheck -w backend && npm run test -w backend` → pass

  **QA Scenarios**:
  ```
  Scenario: Obtener propuesta vinculada a service case
    Tool: Bash
    Preconditions: ServiceCase existe, propuesta con serviceCaseId existe
    Steps:
      1. curl -s http://127.0.0.1:4000/api/service-cases/SC_ID/proposal -H "Authorization: Bearer $TOKEN" | jq '.success'
    Expected Result: true
    Evidence: .sisyphus/evidence/task-03-linked-proposal.txt
  ```
  **Commit**: YES
  - Message: `feat: backend — GET /service-cases/:id/proposal endpoint for linked proposal lookup`
  - Files: `backend/src/routes/service-case.routes.ts`, `backend/src/services/service-case/service-case.service.ts`, `backend/src/controllers/service-case.controller.ts`
  - Pre-commit: `npm run typecheck -w backend && npm run lint -w backend && npm run test -w backend`

- [ ] T04. **Frontend: Botones de estado en detalle de Propuesta**
  (see above - full definition)


  **What to do**:
  - Crear componente `ProposalStatusActions.tsx` en `frontend/src/modules/proposals/ui/`:
    ```tsx
    interface ProposalStatusActionsProps {
      proposal: Proposal;
      onStatusChange?: () => void;
    }

    export function ProposalStatusActions({ proposal, onStatusChange }: ProposalStatusActionsProps) {
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: (status: string) => proposalService.updateStatus(proposal._id, { status }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: proposalKeys.detail(proposal._id) });
          queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
          onStatusChange?.();
        },
      });

      if (proposal.status === 'draft') {
        return (
          <Button onClick={() => mutation.mutate('sent')} disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner /> : null}
            Enviar propuesta al cliente
          </Button>
        );
      }
      if (proposal.status === 'sent') {
        return (
          <div className="flex gap-2">
            <Button variant="default" onClick={() => mutation.mutate('approved')} disabled={mutation.isPending}>
              Marcar como aprobada
            </Button>
            <Button variant="destructive" onClick={() => mutation.mutate('rejected')} disabled={mutation.isPending}>
              Rechazar
            </Button>
          </div>
        );
      }
      if (proposal.status === 'approved') {
        return <Badge variant="success">Propuesta aprobada</Badge>;
      }
      if (proposal.status === 'rejected') {
        return <Badge variant="destructive">Propuesta rechazada</Badge>;
      }
      return null;
    }
    ```
  - En el detalle de propuesta (`/proposals/[id]/page.tsx`), agregar el componente `ProposalStatusActions` debajo del header
  - Crear `api/proposal.service.ts` con método `updateStatus(id, data)` usando `apiClient`
  - Crear query keys en `hooks/use-proposals.ts`:
    ```typescript
    export const proposalKeys = {
      all: ['proposals'] as const,
      lists: () => [...proposalKeys.all, 'list'] as const,
      list: (filters: ProposalFilters) => [...proposalKeys.lists(), filters] as const,
      details: () => [...proposalKeys.all, 'detail'] as const,
      detail: (id: string) => [...proposalKeys.details(), id] as const,
    };
    ```

  **Must NOT do**:
  - No eliminar el botón "Exportar PDF" existente
  - No modificar la tabla de lista de propuestas (solo el detalle)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Parallel Group**: Wave 1 (con T01, T02, T03)
  - **Blocks**: None (paralelo con backend)
  - **Blocked By**: T01 (schema)

  **References**:
  - `frontend/src/modules/proposals/` — Módulo actual de propuestas
  - `frontend/src/components/shared/` — Componentes compartidos (Button, Badge, Spinner)
  - `frontend/src/lib/api-client.ts` — apiClient wrapper

  **Acceptance Criteria**:
  - [ ] Botón "Enviar propuesta al cliente" visible cuando status='draft'
  - [ ] Botones "Marcar como aprobada" / "Rechazar" visibles cuando status='sent'
  - [ ] Badge "Propuesta aprobada" visible cuando status='approved'
  - [ ] Spinner durante la mutación
  - [ ] Invalidación de queries al completar
  - [ ] `npm run typecheck -w frontend && npm run lint -w frontend` → pass

  **QA Scenarios**:
  ```
  Scenario: Botón Enviar propuesta en detalle draft
    Tool: Playwright
    Preconditions: Propuesta en estado draft, usuario logueado como gerente
    Steps:
      1. Navegar a /proposals/PROP-2026-0004
      2. Verificar botón "Enviar propuesta al cliente" visible
      3. Hacer click
      4. Esperar mutación completar
      5. Verificar badge "Enviada" visible
    Expected Result: Propuesta cambia a estado sent
    Evidence: .sisyphus/evidence/task-04-proposal-status-button.txt
  ```
  **Commit**: YES
  - Message: `feat: frontend — ProposalStatusActions component with status transitions in proposal detail`
  - Files: `frontend/src/modules/proposals/ui/ProposalStatusActions.tsx`, `frontend/src/modules/proposals/api/proposal.service.ts`, `frontend/src/modules/proposals/hooks/use-proposals.ts`, `frontend/src/app/proposals/[id]/page.tsx`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build`

- [ ] T05. **Frontend: Link navegable en bloqueadores de ServiceCase**

  **What to do**:
  - Ubicar el componente en el Cockpit que renderiza blockers (buscar `BlockerCard`, `RequirementsList` o equivalente en `frontend/src/modules/service-cases/ui/`)
  - Reemplazar el texto plano `"Elaborar y guardar la propuesta económica"` con un `<Link>` de Next.js:
    ```tsx
    <Link
      href={`/proposals/new?serviceCaseId=${serviceCase.id}`}
      className="text-blue-600 hover:text-blue-800 underline font-medium"
      aria-label="Elaborar propuesta económica para este caso"
    >
      Elaborar y guardar la propuesta económica
    </Link>
    ```
  - Si el componente usa un datalist de bloqueadores genéricos, modificar el renderizado para que los blockers que contengan `serviceCaseId` en su metadata se rendericen como links
  - Agregar `aria-label` descriptivo en cada bloqueador que sea accionable
  - Verificar con `ast_grep_search pattern="Elaborar y guardar" lang=tsx`

  **Must NOT do**:
  - No cambiar la lógica de evaluación de bloqueadores
  - No modificar otros blockers ni su contenido

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Parallel Group**: Wave 2 (con T06, T07, T08)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/service-cases/ui/` — Componentes del Cockpit
  - `.sisyphus/evidence/playwright-audit-report.md` — Bug U-01 (texto plano no navegable)
  - `ast_grep_search pattern="Elaborar y guardar la propuesta económica" lang=tsx` — Para ubicar archivo exacto

  **Acceptance Criteria**:
  - [ ] Texto "Elaborar y guardar la propuesta económica" es un `<Link>` de Next.js
  - [ ] Link apunta a `/proposals/new?serviceCaseId=${serviceCase.id}`
  - [ ] Link tiene aria-label descriptivo
  - [ ] Link tiene estilo visual diferenciado (texto azul subrayado)
  - [ ] Otros bloqueadores no se ven afectados
  - [ ] `npm run typecheck -w frontend && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Blocker link navegable
    Tool: Playwright
    Preconditions: SC-2026-0001 en paso 3, usuario logueado
    Steps:
      1. Navegar a /service-cases/SC-2026-0001
      2. Localizar texto "Elaborar y guardar la propuesta económica"
      3. Verificar que es un elemento <a> con href
      4. Verificar aria-label presente
      5. Verificar que el link tiene clase text-blue-600
    Expected Result: Elemento es link navegable (no texto plano)
    Evidence: .sisyphus/evidence/task-05-blocker-link.txt
  ```
  **Commit**: YES
  - Message: `fix: service-cases — make blocker proposal text a navigable Link with query param`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build`

- [ ] T06. **Frontend: Vincular propuesta a ServiceCase via query param**

  **What to do**:
  - En `frontend/src/app/proposals/new/page.tsx`:
    - Leer `searchParams.get('serviceCaseId')` de la URL
    - Incluir `serviceCaseId` en el payload del formulario solo si está presente
    - Mostrar banner informativo azul cuando serviceCaseId está presente:
      ```tsx
      {serviceCaseId && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertTitle>Propuesta vinculada a caso de servicio</AlertTitle>
          <AlertDescription>
            Esta propuesta se vinculará automáticamente al caso. Al guardar, podrás
            continuar con el flujo de aprobación.
          </AlertDescription>
        </Alert>
      )}
      ```
    - Después de crear propuesta exitosamente, redirigir al detalle de la propuesta
      mostrando toast: "Propuesta creada. Puedes enviarla al cliente desde aquí."
  - Si el formulario usa react-hook-form, incluir `serviceCaseId` en `defaultValues`

  **Must NOT do**:
  - No hacer obligatorio serviceCaseId — debe ser opcional
  - No romper el flujo normal de creación de propuesta sin query param

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Parallel Group**: Wave 2 (con T05, T07, T08)
  - **Blocks**: None
  - **Blocked By**: T01 (schema serviceCaseId)

  **References**:
  - `frontend/src/app/proposals/new/page.tsx` — Página de nueva propuesta
  - `packages/shared-types/src/schemas/proposal.schema.ts` — Schema con serviceCaseId opcional
  - `.sisyphus/evidence/playwright-audit-report.md` — Bugs B-02, U-07, I-03

  **Acceptance Criteria**:
  - [ ] `/proposals/new?serviceCaseId=xxx` muestra banner informativo azul
  - [ ] serviceCaseId se envía en POST /api/proposals
  - [ ] Sin query param, formulario funciona exactamente como antes
  - [ ] Toast de éxito después de crear propuesta
  - [ ] `npm run typecheck -w frontend && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Crear propuesta vinculada desde ServiceCase
    Tool: Playwright
    Preconditions: ServiceCase SC-2026-0001 existe
    Steps:
      1. Navegar a /proposals/new?serviceCaseId=ID_DEL_CASO
      2. Verificar banner: "Propuesta vinculada a caso de servicio"
      3. Llenar campos requeridos del formulario
      4. Click en guardar
      5. Verificar toast de éxito
      6. curl GET /api/service-cases/ID/proposal → data no es null
    Expected Result: Propuesta creada con serviceCaseId
    Evidence: .sisyphus/evidence/task-06-proposal-linked.txt

  Scenario: Crear propuesta sin vinculación (caso normal)
    Tool: Playwright
    Preconditions: Usuario logueado
    Steps:
      1. Navegar a /proposals/new (sin query param)
      2. Verificar que NO hay banner azul
      3. Llenar campos requeridos
      4. Guardar → propuesta creada sin serviceCaseId
    Expected Result: Propuesta creada normalmente
    Evidence: .sisyphus/evidence/task-06-proposal-unlinked.txt
  ```
  **Commit**: YES
  - Message: `feat: proposals — serviceCaseId query param linking to ServiceCase, creation banner`
  - Files: `frontend/src/app/proposals/new/page.tsx`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build`

- [ ] T07. **Frontend: Dropdown PO con propuestas aprobadas + autocomplete**

  **What to do**:
  - En `frontend/src/app/purchase-orders/new/page.tsx` (o el componente de formulario PO):
    - Crear hook `use-approved-proposals.ts`:
      ```typescript
      export function useApprovedProposals(sede?: string) {
        return useQuery({
          queryKey: ['proposals', 'approved', sede],
          queryFn: () => proposalService.getApprovedProposals(sede),
          staleTime: 60_000,
        });
      }
      ```
    - El `<Select>` de "Propuesta aprobada" debe cargar opciones desde este hook
    - Cada opción muestra: `PROP-XXXX — Cliente — $Monto`
    - Al seleccionar una propuesta, auto-completar:
      - Cuenta de servicio → `proposal.billingAccount`
      - Cuenta de facturación → `proposal.invoicingAccount`
      - Monto aprobado → `proposal.total` (campo readonly)
      - Moneda → `proposal.currency` (campo readonly, default "COP")
    - Si no hay propuestas aprobadas:
      ```tsx
      <EmptyState
        icon={FileText}
        title="No hay propuestas aprobadas"
        description="Debes aprobar una propuesta económica primero para crear una orden de compra."
        primaryAction={{ label: "Ir a Propuestas", href: "/proposals" }}
        secondaryAction={{ label: "Ver casos activos", href: "/service-cases" }}
      />
      ```
    - Agregar query params `?status=approved` al endpoint GET /api/proposals
    - Mostrar loading skeleton mientras se cargan las propuestas

  **Must NOT do**:
  - No permitir seleccionar propuestas en estado draft o rejected
  - No permitir editar monto aprobado (readonly)
  - No eliminar la funcionalidad de crear PO manualmente

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Parallel Group**: Wave 2 (con T05, T06, T08)
  - **Blocks**: None
  - **Blocked By**: T02 (PATCH status - para tener propuestas approved)

  **References**:
  - `frontend/src/app/purchase-orders/new/page.tsx` — Formulario PO actual
  - `frontend/src/components/shared/EmptyState/EmptyState.tsx` — Componente EmptyState
  - `backend/src/services/proposal/proposal.service.ts` — Servicio proposals con filtro status
  - `.sisyphus/evidence/playwright-audit-report.md` — Bugs B-09, B-10, I-03

  **Acceptance Criteria**:
  - [ ] Select carga propuestas desde GET /api/proposals?status=approved
  - [ ] Cada opción muestra formato: PROP-XXXX — Cliente — $Monto
  - [ ] Al seleccionar propuesta, 4 campos se auto-completan (cuenta servicio, facturación, monto, moneda)
  - [ ] Monto y moneda son readonly después del autocomplete
  - [ ] Sin propuestas aprobadas: EmptyState con CTAs
  - [ ] Loading skeleton mientras carga
  - [ ] `npm run typecheck -w frontend && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: PO form sin propuestas aprobadas
    Tool: Playwright
    Preconditions: 0 propuestas en estado approved
    Steps:
      1. Navegar a /purchase-orders/new
      2. Verificar EmptyState: "No hay propuestas aprobadas"
      3. Click "Ir a Propuestas" → navega a /proposals
    Expected Result: Empty state funcional
    Evidence: .sisyphus/evidence/task-07-po-empty.txt

  Scenario: PO form con propuestas aprobadas
    Tool: Playwright
    Preconditions: Propuesta en estado approved
    Steps:
      1. Navegar a /purchase-orders/new
      2. Select "Propuesta aprobada" tiene opciones
      3. Seleccionar una propuesta
      4. Verificar campos auto-completados
      5. Verificar monto readonly
    Expected Result: Formulario PO usable
    Evidence: .sisyphus/evidence/task-07-po-approved.txt
  ```
  **Commit**: YES
  - Message: `fix: purchase-orders — dynamic approved proposals dropdown, autocomplete fields, empty state`
  - Files: `frontend/src/app/purchase-orders/new/page.tsx`, `frontend/src/modules/proposals/hooks/use-approved-proposals.ts`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build`

- [ ] T08. **Frontend: Badge solicitudes reactivo**

  **What to do**:
  - Encontrar el componente del sidebar que renderiza el badge numérico rojo junto a "Solicitudes"
  - Buscar con `ast_grep_search pattern="Solicitudes" lang=tsx` en `frontend/src/modules/core/ui/layout/`
  - Reemplazar el estado estático con useQuery:
    ```typescript
    function usePendingWorkRequestsCount() {
      return useQuery({
        queryKey: ['work-requests', 'pending-count'],
        queryFn: async () => {
          const res = await apiClient.get('/work-requests?status=submitted&limit=0');
          return res.data?.pagination?.total ?? 0;
        },
        staleTime: 30_000,
        refetchInterval: 60_000,
      });
    }
    ```
  - Si el badge muestra un número > 0: fondo rojo, texto blanco
  - Si el badge muestra 0: ocultar el badge completamente (o mostrar "0" con estilo gris tenue)
  - Invalidar cache cuando se ejecute `calificarSolicitud` en el hook `use-qualify-work-request.ts`:
    ```typescript
    const queryClient = useQueryClient();
    // en mutation.onSuccess:
    queryClient.invalidateQueries({ queryKey: ['work-requests', 'pending-count'] });
    ```

  **Must NOT do**:
  - No cambiar estructura del sidebar
  - No eliminar el badge existente — solo hacerlo reactivo

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Parallel Group**: Wave 2 (con T05, T06, T07)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/core/ui/layout/` — Layout y sidebar
  - `frontend/src/modules/work-requests/hooks/` — Hooks de work requests
  - `.sisyphus/evidence/playwright-audit-report.md` — Bug B-05 (badge no actualizado)

  **Acceptance Criteria**:
  - [ ] Badge se obtiene via useQuery con refetchInterval 60s
  - [ ] Badge se invalida después de calificar solicitud
  - [ ] Badge desaparece cuando count=0
  - [ ] Badge muestra número correcto cuando count>0
  - [ ] `npm run typecheck -w frontend && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Badge se actualiza después de calificar
    Tool: Playwright
    Preconditions: WR con status submitted, badge muestra 1
    Steps:
      1. Navegar a /work-requests
      2. Calificar la solicitud pendiente
      3. Verificar badge en sidebar → debe ser 0 o desaparecer
    Expected Result: Badge reactivo
    Evidence: .sisyphus/evidence/task-08-badge-updated.txt
  ```
  **Commit**: YES
  - Message: `fix: sidebar badge — reactive work-requests count with TanStack Query refetchInterval`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build`

---

### WAVE 3 — P1 UX + P2 MEJORAS (Días 5-7)

- [ ] T09. **Componente UserSelect con autocomplete de usuarios**

  **What to do**:
  - Crear `frontend/src/components/shared/UserSelect/UserSelect.tsx`:
    ```tsx
    interface UserSelectProps {
      value?: string;
      onChange: (userId: string) => void;
      roles?: UserRole[];
      placeholder?: string;
      label?: string;
      error?: string;
      disabled?: boolean;
    }
    ```
  - Debe:
    - Llamar a `GET /api/users?role=tecnico,residente&active=true` (roles configurables)
    - Renderizar nombre completo + rol + avatar initials
    - Usar shadcn `<Select>` o `<Combobox>` con búsqueda
    - El valor guardado es el ObjectId del usuario (24 chars)
    - Tener loading skeleton mientras carga usuarios
    - Tener empty state si no hay usuarios con ese rol
    - Tener error state si falla la API
  - Reemplazar los inputs de texto libre para "técnico responsable" en:
    - `modules/site-visits/` — formulario de visitas
    - `modules/planning/` — asignación de personal
  - Buscar con `ast_grep_search pattern="técnico|tecnico|responsable" lang=tsx` para encontrar todos los lugares

  **Must NOT do**:
  - No hardcodear roles — usar prop `roles` configurable
  - No permitir seleccionar usuarios inactivos

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Parallel Group**: Wave 3 (con T10, T11, T12)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/components/shared/` — Directorio de componentes compartidos
  - `backend/src/modules/user/user.routes.ts` — Endpoint GET /api/users
  - `packages/shared-types/src/constants/roles.ts` — Roles disponibles
  - `.sisyphus/evidence/playwright-audit-report.md` — Bug U-05 (ObjectId manual)

  **Acceptance Criteria**:
  - [ ] Componente carga usuarios desde GET /api/users?role=X&active=true
  - [ ] Búsqueda/autocomplete funcional por nombre
  - [ ] Muestra nombre + rol + initials
  - [ ] Valor guardado es ObjectId de 24 chars
  - [ ] Loading skeleton mientras carga
  - [ ] Error state si falla API
  - [ ] Reemplazado en formularios de site-visits y planning
  - [ ] `npm run typecheck -w frontend && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: UserSelect carga y filtra usuarios
    Tool: Playwright
    Preconditions: Usuarios con rol tecnico existen
    Steps:
      1. Navegar a /site-visits/new
      2. Click en campo "Técnico responsable"
      3. Verificar dropdown con usuarios
      4. Escribir nombre parcial → filtrar resultados
      5. Seleccionar usuario → campo se llena con nombre
      6. Verificar valor enviado es ObjectId
    Expected Result: Autocomplete funcional
    Evidence: .sisyphus/evidence/task-09-user-select.txt
  ```
  **Commit**: YES
  - Message: `feat: shared UserSelect component with autocomplete, replace manual ObjectId inputs in site-visits and planning`
  - Files: `frontend/src/components/shared/UserSelect/UserSelect.tsx`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build`

- [ ] T10. **Frontend: Nodos 14 pasos clicables en Cockpit**

  **What to do**:
  - Ubicar el componente `WorkflowStepper` o `FourteenStepProgress` en `frontend/src/modules/service-cases/ui/`
  - Modificar el renderizado de cada nodo del diagrama de 14 pasos:
    ```tsx
    interface StepNodeProps {
      stepNumber: number;
      label: string;
      status: 'completed' | 'current' | 'pending' | 'blocked';
      serviceCaseId: string;
      onStepClick?: (stepNumber: number) => void;
    }

    function StepNode({ stepNumber, label, status, serviceCaseId, onStepClick }: StepNodeProps) {
      const isClickable = status === 'current' || status === 'blocked';
      const href = getStepUrl(stepNumber, serviceCaseId);

      if (isClickable && href) {
        return (
          <Link
            href={href}
            className="..."
            aria-label={`Ir al Paso ${stepNumber}: ${label}`}
          >
            {renderStepContent(stepNumber, label, status)}
          </Link>
        );
      }

      return <div className="...">{renderStepContent(stepNumber, label, status)}</div>;
    }
    ```
  - Mapa de URLs por paso:
    ```typescript
    const STEP_URLS: Record<number, (caseId: string) => string> = {
      1: (id) => `/work-requests?serviceCaseId=${id}`,
      2: (id) => `/site-visits?serviceCaseId=${id}`,
      3: (id) => `/proposals/new?serviceCaseId=${id}`,
      4: (id) => `/purchase-orders/new?serviceCaseId=${id}`,
      5: (id) => `/planning?serviceCaseId=${id}`,
      // ... más pasos
    };
    ```

  **Must NOT do**:
  - No cambiar la lógica de avance de pasos
  - No eliminar el progreso visual (checkmarks, warning icons)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Parallel Group**: Wave 3 (con T09, T11, T12)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/service-cases/ui/` — Componentes del Cockpit
  - Buscar con `ast_grep_search pattern="14 pasos|WorkflowStepper|FourteenStep" lang=tsx`
  - `.sisyphus/evidence/playwright-audit-report.md` — Bug U-03 (nodos no clicables)

  **Acceptance Criteria**:
  - [ ] Pasos en estado 'current' o 'blocked' son clicables
  - [ ] Cada nodo clicable tiene aria-label descriptivo
  - [ ] Click en paso 3 navega a /proposals/new?serviceCaseId=...
  - [ ] Paso completado muestra checkmark pero no es clicable (opcional)
  - [ ] `npm run typecheck -w frontend && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Nodo paso 3 clicable navega a propuesta
    Tool: Playwright
    Preconditions: SC-2026-0001 en paso 3
    Steps:
      1. Navegar a /service-cases/SC-2026-0001
      2. Localizar paso 3 (⚠️ Propuesta económica)
      3. Click en el nodo
      4. Verificar navegación a /proposals/new?serviceCaseId=...
    Expected Result: Nodo clicable, navegación correcta
    Evidence: .sisyphus/evidence/task-10-step-nodes.txt
  ```
  **Commit**: YES
  - Message: `feat: service-cases — clickable 14-step diagram nodes with contextual navigation`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build`

- [ ] T11. **Frontend: Columnas interactivas y botones accionables en Cockpit**

  **What to do**:
  - **Columna FLUJO interactiva** (`Proposals`):
    - Encontrar la columna "FLUJO" en la tabla de propuestas
    - Cada dot debe tener un tooltip (shadcn Tooltip) que describa su significado:
      - Dot verde = paso completado
      - Dot naranja = paso actual
      - Dot gris = paso pendiente
    - Hacer cada dot clickable con tooltip informativo
  - **Botones accionables en PRÓXIMAS ACCIONES** (`Service Cases`):
    - En el panel "PRÓXIMAS ACCIONES" del Cockpit de ServiceCase
    - Reemplazar texto descriptivo por botones reales:
      ```tsx
      <Button asChild variant="default" size="sm">
        <Link href={`/proposals/new?serviceCaseId=${caseId}`}>
          Crear propuesta económica
        </Link>
      </Button>
      ```
    - Si hay múltiples acciones, usar un stack vertical de botones
    - Cada botón debe mostrar loading state mientras la acción se procesa

  **Must NOT do**:
  - No cambiar la lógica de qué acciones mostrar — solo cómo se renderizan
  - No eliminar el texto descriptivo — conservarlo como subtítulo

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Parallel Group**: Wave 3 (con T09, T10, T12)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/proposals/ui/` — Tabla de propuestas
  - `frontend/src/modules/service-cases/ui/` — Cockpit panel
  - `frontend/src/components/shared/` — Tooltip, Button componentes
  - `.sisyphus/evidence/playwright-audit-report.md` — Bugs B-07, U-02

  **Acceptance Criteria**:
  - [ ] Columna FLUJO: cada dot tiene tooltip descriptivo
  - [ ] PRÓXIMAS ACCIONES: botones reales con Link
  - [ ] Cada botón tiene loading state
  - [ ] `npm run typecheck -w frontend && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Tooltip en dots de FLUJO
    Tool: Playwright
    Preconditions: Tabla de propuestas con datos
    Steps:
      1. Navegar a /proposals
      2. Hover sobre un dot de la columna FLUJO
      3. Verificar tooltip visible con descripción
    Expected Result: Tooltip funcional
    Evidence: .sisyphus/evidence/task-11-flow-tooltip.txt

  Scenario: Botón accionable en Próximas Acciones
    Tool: Playwright
    Preconditions: SC en paso 3
    Steps:
      1. Navegar a /service-cases/SC-2026-0001
      2. Localizar panel "PRÓXIMAS ACCIONES"
      3. Verificar botón "Crear propuesta económica"
      4. Click → navega a /proposals/new?serviceCaseId=
    Expected Result: Botón funcional
    Evidence: .sisyphus/evidence/task-11-action-buttons.txt
  ```
  **Commit**: YES
  - Message: `feat: interactive FLUJO tooltip in proposals table, actionable buttons in ServiceCase cockpit`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build`

- [ ] T12. **Fix loading state /admin/settings + CTAs en empty states**

  **What to do**:
  - **Fix /admin/settings**:
    - Diagnosticar por qué "Cargando configuración..." se queda permanentemente
    - Verificar el hook/fetch que obtiene la configuración:
      - Si el error no se maneja → agregar error state con retry button
      - Si el endpoint no existe → agregar el endpoint o corregir la URL
      - Si el timeout es muy largo → reducir timeout
    - Agregar timeout de 10s en la consulta
    - Mostrar error state después de timeout: "No se pudo cargar la configuración. [Reintentar]"
  - **CTAs en empty states**:
    - Recorrer módulos que están 100% vacíos y agregar CTA:
      ```tsx
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        primaryAction={{ label: actionLabel, href: actionHref, onClick: actionFn }}
      />
      ```
    - Módulos prioritarios: dispatch, maintenance, sla, reports, delivery-records, templates, inventory, fleet, assets, backups

  **Must NOT do**:
  - No modificar funcionalidad de configuración existente
  - No crear endpoints nuevos para settings (solo corregir el fetch)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Parallel Group**: Wave 3 (con T09, T10, T11)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/app/admin/settings/page.tsx` — Página settings
  - `frontend/src/components/shared/EmptyState/EmptyState.tsx` — Componente EmptyState
  - `.sisyphus/evidence/playwright-audit-report.md` — Bug P1 loading state + I-05

  **Acceptance Criteria**:
  - [ ] /admin/settings no se queda en "Cargando..." permanentemente
  - [ ] Error state con botón "Reintentar" si el fetch falla
  - [ ] Timeout de 10s
  - [ ] 10 módulos con EmptyState CTA agregado
  - [ ] `npm run typecheck -w frontend && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Settings no se queda cargando
    Tool: Playwright
    Preconditions: Usuario logueado
    Steps:
      1. Navegar a /admin/settings
      2. Esperar 12s
      3. Verificar que NO muestra "Cargando configuración..."
    Expected Result: Settings carga o muestra error
    Evidence: .sisyphus/evidence/task-12-settings-fix.txt
  ```
  **Commit**: YES
  - Message: `fix: admin settings timeout/error handling, add EmptyState CTAs across 10 modules`
  - Pre-commit: `npm run typecheck -w frontend && npm run lint -w frontend && npm run build`

---

### WAVE 4 — P2 MEJORAS DE PRODUCTO (Días 8-10)

- [ ] T13. **Margen% column en propuestas + Timeline aprobación**

  **What to do**:
  - **Margen%**: Agregar columna calculada en tabla de propuestas:
    ```typescript
    // backend/src/services/proposal/proposal.service.ts
    // Si proposal tiene costEstimate y total:
    const marginPercent = proposal.costEstimate
      ? ((proposal.total - proposal.costEstimate) / proposal.costEstimate * 100).toFixed(1)
      : null;
    ```
    - Columna "MARGEN" con formato: `+15.3%` (verde si positivo, rojo si negativo)
    - Ordenable por margen
  - **Timeline aprobación**: En detalle de propuesta, agregar timeline visual:
    - `draft → sent → approved/rejected → converted` con fechas y quién realizó cada acción
    - Usar shadcn Timeline o componente similar
    - Basado en auditoría (eventos PROPOSAL_STATUS_CHANGED)

  **Must NOT do**:
  - No calcular margen si no hay costEstimate
  - No modificar cálculos existentes de total

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Parallel Group**: Wave 4 (con T14, T15, T16)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/proposals/ui/` — Tabla y detalle propuestas
  - `backend/src/audit/` — Servicio de auditoría

  **Acceptance Criteria**:
  - [ ] Columna MARGEN visible en tabla de propuestas
  - [ ] Margen positivo = verde, negativo = rojo
  - [ ] Timeline de aprobación visible en detalle
  - [ ] `npm run typecheck && npm run build` → pass

  **QA Scenarios**:
  ```
  Scenario: Columna Margen visible
    Tool: Playwright
    Preconditions: Propuestas con datos de costo
    Steps:
      1. Navegar a /proposals
      2. Verificar columna "MARGEN" presente
      3. Verificar formato "+XX.X%" o "-XX.X%"
    Expected Result: Margen calculado y visible
    Evidence: .sisyphus/evidence/task-13-margin-column.txt
  ```
  **Commit**: YES
  - Message: `feat: proposals — margin percent column, approval timeline from audit events`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build`

- [ ] T14. **Previsualización PDF en documentos + Excel export desde órdenes**

  **What to do**:
  - **PDF preview**: En módulo `/documents`, al hacer click en un PDF, mostrar preview inline:
    - Usar `<iframe>` o `react-pdf` (si ya está instalado)
    - Sidebar con lista de documentos, panel principal con preview
    - Si no hay visor, simplemente descargar el archivo
  - **Excel export desde órdenes**: 
    - Agregar botón "Exportar Excel" en `/orders`
    - GET /api/orders/export/xlsx (backend con exceljs si está instalado)
    - Si no hay backend, exportar data de la tabla actual a CSV como fallback

  **Must NOT do**:
  - No instalar dependencias nuevas sin aprobación

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Parallel Group**: Wave 4 (con T13, T15, T16)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/documents/` — Módulo documentos
  - `frontend/src/modules/orders/` — Módulo órdenes

  **Acceptance Criteria**:
  - [ ] PDF preview funcional en documentos
  - [ ] Botón "Exportar Excel" en órdenes
  - [ ] `npm run typecheck && npm run build` → pass

  **Commit**: YES
  - Message: `feat: pdf preview in documents, excel export in orders`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build`

- [ ] T15. **Scanner QR para inventario + PO expiry alerts + Health score badge**

  **What to do**:
  - **Scanner QR**: Verificar que `/inventory/scan` funciona con `html5-qrcode` (si está instalado)
    - Si no, redirigir a inventario con mensaje "Escáner disponible próximamente"
    - Si sí, probar que la cámara se activa y puede escanear códigos
  - **PO expiry alerts**: En `/purchase-orders`, agregar badge rojo "Vence en N días" cuando faltan <30 días
    - Color: rojo si <15 días, naranja si 15-30, verde si >30
  - **Health score badge en clientes**: En `/customers`, agregar columna "SALUD" con badge:
    - Verde: casos completados sin issues
    - Amarillo: casos con retrasos menores
    - Rojo: casos con bloqueadores activos

  **Must NOT do**:
  - No instalar dependencias sin aprobación
  - No modificar datos de clientes — solo visual

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Parallel Group**: Wave 4 (con T13, T14, T16)
  - **Blocks**: None
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] /inventory/scan funciona o muestra mensaje graceful
  - [ ] PO con <30 días muestran badge de alerta
  - [ ] Clientes tienen health score badge
  - [ ] `npm run typecheck && npm run build` → pass

  **Commit**: YES
  - Message: `feat: inventory QR scan, PO expiry alerts, customer health score badge`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build`

- [ ] T16. **Certificaciones vencimiento + Filtros auditoría + Dashboard personalizable**

  **What to do**:
  - **Certificaciones vencimiento**: En `/admin/personnel`, agregar:
    - Columna "CERTIFICACIONES" con badge verde (vigente) o rojo (vencida)
    - Alerta en tarjeta del empleado si alguna certificación vence en <30 días
  - **Filtros requestId en auditoría**: En `/admin/audit`, agregar:
    - Campo de búsqueda por `requestId`
    - Filtro por entidad, acción, actor
    - Exportar CSV con resultados filtrados
  - **Dashboard personalizable**: Si ya existe implementación de @dnd-kit en dashboard:
    - Verificar que el layout se pueda reorganizar drag-drop
    - Persistir layout en localStorage: `cermont:dashboard:layout`

  **Must NOT do**:
  - No instalar dependencias nuevas sin aprobación
  - No modificar datos de personal — solo agregar columnas visuales

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Parallel Group**: Wave 4 (con T13, T14, T15)
  - **Blocks**: None
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] Badge certificaciones visible en admin/personnel
  - [ ] Filtro requestId funcional en admin/audit
  - [ ] Dashboard personalizable (si ya existe @dnd-kit)
  - [ ] `npm run typecheck && npm run build` → pass

  **Commit**: YES
  - Message: `feat: certification expiry badges, audit requestId filters, customizable dashboard`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build`

---

### WAVE 5 — INNOVACIONES ESTRATÉGICAS (Días 11-16)

- [ ] T17. **Motor templates dinámicos + 5 seeds CERMONT**

  **What to do**:
  - Verificar si `TemplateSchema` ya existe en `packages/shared-types/`
  - Si no, crearlo siguiendo el plan `FINAL_IMPLEMENTATION_PLAN.md` (F2.3)
  - Crear `DynamicForm` component en `frontend/src/components/shared/DynamicForm/`
  - Seed 5 templates reales CERMONT:
    1. Inspección Líneas de Vida (8 campos: texto, select, photo, signature)
    2. Mantenimiento CCTV (9 campos: texto, number, select, photo)
    3. AST - Análisis de Seguridad (5 campos: texto, checkbox-group, signature)
    4. PTW - Permiso Trabajo Alturas (7 campos: texto, number, checkbox-group, signature)
    5. Inspección Anclajes (7 campos: select, texto, number, photo)
  - Cada template se guarda en MongoDB con su versión

  **Must NOT do**:
  - No duplicar TemplateSchema si ya existe
  - No instalar dependencias sin aprobación

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Parallel Group**: Wave 5 (con T18, T19)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `.sisyphus/plans/FINAL_IMPLEMENTATION_PLAN.md` — F2.3 Dynamic Template Engine
  - `packages/shared-types/src/schemas/` — Schemas existentes

  **Acceptance Criteria**:
  - [ ] TemplateSchema en shared-types
  - [ ] 5 seeds de templates CERMONT
  - [ ] DynamicForm renderiza según tipo de campo
  - [ ] `npm run typecheck && npm run build && npm run test` → pass

  **Commit**: YES
  - Message: `feat: template engine — DynamicForm, 5 Cermont templates (lineas-vida, CCTV, AST, PTW, anclajes)`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] T18. **Offline-first execution con IndexedDB**

  **What to do**:
  - Verificar si `idb-keyval` y `browser-image-compression` están instalados
  - Si no, instalarlos (aprobado en plan anterior)
  - Implementar en `modules/execution/`:
    - `store/execution-offline.store.ts` — idb-keyval para sesiones pendientes
    - `hooks/use-create-execution.ts` — con IndexedDB fallback:
      ```typescript
      async function submitExecution(data: ExecutionPayload) {
        const mutationId = data.clientMutationId ?? crypto.randomUUID();
        try {
          if (!navigator.onLine) throw new Error('offline');
          return await executionService.create({ ...data, clientMutationId: mutationId });
        } catch {
          await set(`execution:pending:${mutationId}`, { ...data, clientMutationId: mutationId });
        }
      }
      ```
    - Sync automático al recuperar conexión:
      ```typescript
      window.addEventListener('online', async () => {
        const entries = await keys();
        for (const key of entries.filter(k => String(k).startsWith('execution:pending:'))) {
          const payload = await get(key);
          await executionService.create(payload);
          await del(key);
        }
      });
      ```
  - `OfflineSyncIndicator` — badge que muestra conteo de operaciones pendientes

  **Must NOT do**:
  - No guardar server state en Zustand
  - No implementar mock data en producción

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Parallel Group**: Wave 5 (con T17, T19)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `.sisyphus/plans/FINAL_IMPLEMENTATION_PLAN.md` — F1.3 Execution offline-first
  - `frontend/src/modules/execution/` — Módulo execution existente

  **Acceptance Criteria**:
  - [ ] Offline submit guarda en IndexedDB
  - [ ] Sync automático al reconectar
  - [ ] OfflineSyncIndicator con conteo
  - [ ] `npm run typecheck && npm run test && npm run build` → pass

  **Commit**: YES
  - Message: `feat: execution — offline-first with IndexedDB, auto-sync on reconnect, pending indicator`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] T19. **Dashboard KPIs reactivos + recharts**

  **What to do**:
  - Conectar dashboard a backend real (`GET /api/dashboard/kpis`)
  - Reemplazar KPI cards estáticas por `KpiCard` component con trend:
    - Valor actual
    - Cambio porcentual vs período anterior
    - Flecha verde (subió) o roja (bajó)
  - Agregar `OperationalFlowMap` — pipeline horizontal 14 pasos con conteos reales
  - Agregar `AreaChart` recharts con gradiente verde-cermont
  - Agregar `RadialBarChart` distribución de estados de casos
  - Quick Actions bar: "Nueva OT", "Nueva Solicitud", "Crear Planeación", "Registrar Visita"

  **Must NOT do**:
  - No mock data — solo datos reales de backend
  - No guardar server state en Zustand

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Parallel Group**: Wave 5 (con T17, T18)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/dashboard/` — Módulo dashboard existente
  - `backend/src/modules/dashboard/` — Endpoints dashboard

  **Acceptance Criteria**:
  - [ ] KPIs conectados a backend real
  - [ ] KpiCard con trend (flecha + color)
  - [ ] OperationalFlowMap con 14 pasos y conteos
  - [ ] AreaChart + RadialBarChart con datos
  - [ ] Quick Actions bar funcional
  - [ ] `npm run typecheck && npm run build` → pass

  **Commit**: YES
  - Message: `feat: dashboard — reactive KPIs, recharts, OperationalFlowMap, quick actions`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

- [ ] T20. **PDF Export Engine + Service Cases Kanban**

  **What to do**:
  - **PDF Export**: Verificar y conectar endpoints de export:
    - GET /api/proposals/:id/export/pdf
    - GET /api/delivery-records/:id/export/pdf
    - GET /api/invoices/:id/export/pdf
    - Botones de descarga en cada módulo correspondiente
  - **Service Cases Kanban**: Agregar vista Kanban a `/service-cases/kanban`:
    - Columnas por fase: Comercial / Planeación / Ejecución / Cierre Técnico / Cierre Admin
    - Drag-and-drop entre columnas con @dnd-kit (ya instalado)
    - SLA countdown badge (rojo pulsante <3 días)
    - Toggle Kanban/Lista persistido en localStorage
    - Sheet detalle lateral con timeline y blockers

  **Must NOT do**:
  - No instalar dependencias sin aprobación
  - No eliminar vista de lista existente

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Parallel Group**: Wave 5 (con T17, T18, T19)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `backend/src/services/pdf-export.service.ts` — PDF export service
  - `frontend/src/modules/service-cases/` — Módulo service cases

  **Acceptance Criteria**:
  - [ ] PDF export funcional para proposals y delivery-records
  - [ ] Vista Kanban con 5 columnas por fase
  - [ ] Drag-and-drop con @dnd-kit
  - [ ] SLA countdown badge
  - [ ] Toggle Kanban/Lista persistido
  - [ ] `npm run typecheck && npm run build && npm run test` → pass

  **Commit**: YES
  - Message: `feat: pdf export engine (proposals, delivery-records, invoices), Service Cases Kanban with @dnd-kit`
  - Pre-commit: `npm run typecheck && npm run lint && npm run build && npm run test`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Leer plan end-to-end. Verificar cada "Must Have" contra implementación. Buscar violaciones de "Must NOT Have". Verificar evidence files.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  `tsc --noEmit` + `lint` + `test`. Revisar: `as any`, `@ts-ignore`, empty catches, `console.log`, commented-out code, unused imports.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N/N] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ playwright)
  Clean state. Ejecutar CADA QA scenario de CADA tarea. Verificar integración cross-task. Edge cases. Evidencia en `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  Por cada tarea: leer "What to do" vs diff real. Verificar 1:1. Detectar contaminación cross-task. Flag cambios no contabilizados.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

Conventional Commits: `type(scope): desc`
Types: `fix` `feat` `test` `refactor` `ci`

Gate pre-commit:
```bash
npm run typecheck && npm run lint && npm run build && npm run test
```

---

---

## Cross-Reference Matrix: Bugs → Tasks

| Bug ID | Descripción | Severidad | Task(s) | Módulo |
|--------|-------------|-----------|---------|--------|
| B-01 | Link bloqueador no navegable | P0 | T05 | Service Cases |
| B-02 | Propuesta no vinculable a ServiceCase | P0 | T01, T03, T06 | Propuestas/SC |
| B-03 | Botón Avanzar deshabilitado sin indicación | P0 | T11 (indirecto) | Service Cases |
| B-04 | Badge solicitudes no actualizado reactivamente | P0 | T08 | Sidebar/WR |
| B-05 | Técnico requiere ObjectId manual | P1 | T09 | Site Visits |
| B-06 | No existe PATCH /proposals/:id/status | P0 | T01, T02 | Propuestas |
| B-07 | Columna FLUJO no interactiva | P1 | T11 | Propuestas |
| B-08 | Nueva propuesta sin serviceCaseId | P1 | T01, T06 | Propuestas |
| B-09 | Dropdown Propuesta aprobada vacío | P0 | T07 | PO |
| B-10 | Dropdown PO sin filtro por sede | P1 | T07 | PO |
| U-01 | Nodos 14 pasos no clicables | P1 | T10 | Service Cases |
| U-02 | PRÓXIMAS ACCIONES solo texto | P1 | T11 | Service Cases |
| U-03 | /admin/settings loading persistente | P1 | T12 | Admin |
| U-04 | Módulos sin CTAs en empty state | P1 | T12 | Todos |
| I-01 | Botones contextuales propuesta | P2 | T04 | Propuestas |
| I-02 | Nodes 14 pasos interactivos | P2 | T10 | Service Cases |
| I-03 | serviceCaseId query param | P2 | T06 | Propuestas |
| I-04 | Badge polling 30s | P2 | T08 | Sidebar |
| I-05 | Empty states con CTA | P2 | T12 | Todos |
| I-06 | UserSelect component | P2 | T09 | Shared |
| I-07 | Test PDF export | P2 | T20 | Documentos |
| I-08 | Botones accionables Cockpit | P2 | T11 | Service Cases |

---

## Task Dependency Graph

```
T00 (Setup rama)
  │
  ├──► T01 (Schemas shared-types) ──► T02 (Backend PATCH status)
  │                                      │
  │                                      ├──► T04 (Frontend botones estado)
  │                                      │
  │                                      └──► T07 (Dropdown PO propuestas)
  │
  ├──► T01 ──► T03 (Backend GET linked proposal) ──► T06 (Frontend link propuesta)
  │
  ├──► T05 (Frontend blocker link) — depende de conocer estructura SC Cockpit
  │
  ├──► T08 (Badge reactivo) — independiente
  │
  └──► T09 (UserSelect) — independiente, arranca inmediato
         │
         └──► Reemplazar en site-visits y planning
                │
                T10 (Nodos 14 pasos) — independiente
                │
                T11 (Tooltips + botones) — independiente
                │
                T12 (Settings fix + CTAs) — independiente
                │
                T13-T16 (P2 mejoras) — independientes entre sí
                │
                T17-T20 (Innovaciones) — independientes entre sí
```

### Parallelism Analysis
- **Wave 1** (T01-T04): 4 tareas en paralelo (schemas + backend endpoints + frontend botones)
- **Wave 2** (T05-T08): 4 tareas en paralelo (bloqueador, vinculación, dropdown PO, badge)
- **Wave 3** (T09-T12): 4 tareas en paralelo (UserSelect, nodos, tooltips, settings)
- **Wave 4** (T13-T16): 4 tareas en paralelo (margen, PDF, QR, certificaciones)
- **Wave 5** (T17-T20): 4 tareas en paralelo (templates, offline, dashboard, kanban)
- **Max theoretical parallelism**: 4 tareas simultáneas
- **Estimated speedup**: 3x vs sequential

---

## Risk Register

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| T01 schema changes break existing Proposal consumers | Baja | Alto | Verificar typecheck en todos los workspaces |
| T02 transition validation bloquea flujos existentes | Baja | Medio | ALLOWED_TRANSITIONS solo agrega validación, no quita |
| T06 query param serviceCaseId no se propaga correctamente | Media | Alto | Fallback: sin query param, formulario funciona normal |
| T07 dropdown PO con props reactivas causa re-renders | Baja | Bajo | useMemo + staleTime 60s |
| T09 UserSelect con muchos usuarios (>100) lento | Media | Medio | Agregar paginación server-side si es necesario |
| T12 settings fix requiere endpoint backend que no existe | Alta | Alto | Diagnosticar primero, crear endpoint si es necesario |
| T18 offline sync causa duplicados | Media | Alto | clientMutationId + idempotency checks |
| T19 dashboard KPIs sin datos del backend | Alta | Medio | graceful degradation: mostrar "Sin datos" |
| T20 PDF export sin pdf-lib funcional | Media | Medio | Verificar instalación, fallback a descarga directa |

---

## Verificación del Flujo Completo (E2E)

Después de aplicar todas las correcciones, este es el flujo que DEBE funcionar:

### Flujo: Solicitud → Propuesta → PO → Planeación → Ejecución

```
1. Login como gerente → /dashboard → sidebar correcto
2. /work-requests → WR-2026-0001 visible, badge sidebar actualizado
3. /service-cases → SC-2026-0001, paso 3 bloqueador con link navegable
4. Click link → /proposals/new?serviceCaseId=ID
5. Crear propuesta → se vincula al case
6. Detalle propuesta → botón "Enviar propuesta al cliente"
7. Click enviar → PATCH status: 'sent' → propuesta ENVIADA
8. Botón "Marcar como aprobada" → PATCH status: 'approved'
9. Volver a ServiceCase → bloqueador resuelto
10. /purchase-orders/new → dropdown con propuesta aprobada
11. Seleccionar → campos auto-completados
12. Crear PO → flujo continúa a paso 5
13. /planning → crear planeación con orden aprobada
14. /execution → crear sesión de ejecución
15. Dashboard → KPIs actualizados con datos reales
```

### Verificación automática (script)
```bash
# Script de verificación del flujo completo
echo "=== VERIFICACIÓN FLUJO 14 PASOS ==="

# 1. Verificar login
TOKEN=$(curl -s -X POST http://127.0.0.1:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gerencia@cermont.co","password":"Cermont2026!Dev01"}' | jq -r '.data.accessToken')
echo "[1/6] Login: ${TOKEN:+OK}${TOKEN:-FAIL}"

# 2. Verificar transición propuesta draft→sent
PROP_ID=$(curl -s http://127.0.0.1:4000/api/proposals \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0]._id')
STATUS=$(curl -s -X PATCH "http://127.0.0.1:4000/api/proposals/$PROP_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"sent"}' | jq -r '.success')
echo "[2/6] Propuesta draft→sent: ${STATUS}"

# 3. Verificar propuesta approved
STATUS2=$(curl -s -X PATCH "http://127.0.0.1:4000/api/proposals/$PROP_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"approved"}' | jq -r '.success')
echo "[3/6] Propuesta sent→approved: ${STATUS2}"

# 4. Verificar propuestas aprobadas
COUNT=$(curl -s "http://127.0.0.1:4000/api/proposals?status=approved" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length')
echo "[4/6] Propuestas aprobadas: $COUNT (>0 esperado)"

# 5. Verificar ServiceCase progreso
SC_PROGRESS=$(curl -s http://127.0.0.1:4000/api/service-cases \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].currentStep // "unknown"')
echo "[5/6] ServiceCase paso actual: $SC_PROGRESS"

# 6. Verificar gates
echo "[6/6] Verificando gates..."
npm run typecheck --silent && echo "  typecheck: OK" || echo "  typecheck: FAIL"
npm run lint --silent && echo "  lint: OK" || echo "  lint: FAIL"
npm run build --silent && echo "  build: OK" || echo "  build: FAIL"
npm run test --silent && echo "  test: OK" || echo "  test: FAIL"
```

---

## Rollback Plan

Cada commit es atómico. Si una tarea introduce errores:

### Por tarea
```bash
# Revertir commit específico
git revert <commit-hash> --no-edit

# Si el commit rompe typecheck
git revert HEAD --no-edit && git push
```

### Por fase
```bash
# Revertir toda una wave
git revert HEAD~4..HEAD --no-edit  # Revertir últimos 4 commits (una wave)

# Si hay conflictos
git revert --abort  # Abortar revert
git reset --soft HEAD~5  # Reset suave, mantener cambios staged
```

### Rollback de datos
```bash
# Si una transición de estado corrompió datos
# Ejecutar seed para restaurar datos de prueba
npm run seed -w backend
```

---

## Integración con FINAL_IMPLEMENTATION_PLAN.md

Este plan de corrección es complementario al plan maestro en `.sisyphus/plans/FINAL_IMPLEMENTATION_PLAN.md`.

### Lo que este plan cubre (y el maestro no):
- Transiciones de estado en propuestas (PATCH /proposals/:id/status)
- Vinculación ServiceCase ↔ Propuesta
- Badge reactivo en sidebar
- UserSelect component con autocomplete
- Nodos 14 pasos clicables
- Columnas interactivas + botones accionables
- Fix loading state en settings
- CTAs en empty states
- Fixes específicos de la auditoría Playwright

### Lo que el plan maestro cubre (y este no):
- Limpieza de weak tokens (3028→0)
- Renombrado español→inglés (2850→1000)
- RBAC SSOT 10 roles
- Shared components library (PageHeader, KpiCard, etc.)
- Motor de templates dinámicos (cubierto parcialmente T17)
- Offline-first execution (cubierto T18)
- PDF Export Engine (cubierto T20)
- CI/CD GitHub Actions
- Deploy VPS Contabo

### Orden de ejecución recomendado:
1. **PRIMERO**: Este plan (BUGFIX_IMPLEMENTATION_PLAN) — desbloquear flujo 14 pasos
2. **SEGUNDO**: Phase 0 del plan maestro — fundación (weak tokens, español, shared components)
3. **TERCERO**: Phase 2 del plan maestro — calidad y completitud
4. **CUARTO**: Phase 3 del plan maestro — innovación, tests, deploy

---

## Métricas Post-Corrección

| Métrica | Pre-auditoría | Post-corrección (target) |
|---------|--------------|--------------------------|
| Páginas cargando OK | 34/34 (100%) | 34/34 (100%) |
| Bugs P0 | 6 | 0 |
| Bugs P1 | 5 | 0 |
| Flujo 14 pasos completable | ❌ (bloqueado paso 3) | ✅ (14/14) |
| Endpoints faltantes | 1 (PATCH /status) | 0 |
| Módulos con datos | 6/34 (17.6%) | 10+/34 (30%+) |
| Módulos con empty state CTA | ~5 | ~20 |
| Transiciones propuesta | 0 | 5 (draft→sent→approved→rejected→converted) |
| ServiceCase → Proposal link | No navegable | Link funcional |
| Badge sidebar | Estático | Reactivo (refetch 60s) |
| User autocomplete | ❌ (ObjectId manual) | ✅ (UserSelect component) |
| Nodos 14 pasos | No clicables | ✅ Clicables |
| Dashboard KPIs | Sin datos | ✅ Conectados a backend |
| Offline execution | ❌ | ✅ IndexedDB sync |

---

---

## QA Scenarios Detallados por Módulo

### Service Cases (T05, T10, T11)

| Scenario | Pasos | Expected | Herramienta |
|----------|-------|----------|-------------|
| Blocker link navegable | 1. Ir a /service-cases/SC-2026-0001 2. Buscar "Elaborar propuesta" 3. Verificar tagName='A' 4. Verificar href contiene /proposals/new | Link es <a> con href correcto | Playwright |
| Click en nodo paso 3 | 1. Ir a /service-cases/SC-2026-0001 2. Click en paso 3 del diagrama 3. Verificar URL cambió a /proposals/new | Navegación correcta | Playwright |
| Próximas Acciones tiene botón | 1. Ir a /service-cases/SC-2026-0001 2. Panel PRÓXIMAS ACCIONES 3. Buscar <button> o <a> con texto "Crear propuesta" | Botón funcional | Playwright |
| ServiceCase retorna propuesta vinculada | 1. GET /api/service-cases/ID/proposal 2. Verificar response.success=true 3. Verificar response.data tiene _id | Endpoint funcional | curl |

### Proposals (T01, T02, T04, T06, T11, T13)

| Scenario | Pasos | Expected | Herramienta |
|----------|-------|----------|-------------|
| Schema compila | 1. npm run typecheck -w packages/shared-types | 0 errores | Bash |
| UpdateProposalStatusSchema valida | 1. node -e validator 2. Pasar {status:'sent'} 3. Pasar {status:'invalid'} | Válido ok, inválido falla | Bash |
| PATCH draft→sent 200 | 1. curl -X PATCH /api/proposals/ID/status -d '{"status":"sent"}' | 200 {success:true} | curl |
| PATCH draft→approved 400 | 1. curl -X PATCH /api/proposals/ID/status -d '{"status":"approved"}' | 400 {error:{code:'INVALID_TRANSITION'}} | curl |
| PATCH inexistente 404 | 1. curl -X PATCH /api/proposals/FAKE/status -d '{"status":"sent"}' | 404 | curl |
| Botón Enviar en detalle | 1. Ir a /proposals/PROP_ID (draft) 2. Verificar botón "Enviar" visible 3. Click 4. Verificar badge cambió | Botón funcional, estado cambia | Playwright |
| Botón Aprobar en detalle | 1. Propuesta en sent 2. Ir a detalle 3. Click "Aprobar" 4. Badge "Aprobada" | Transición sent→approved | Playwright |
| Vinculación serviceCaseId | 1. Ir a /proposals/new?serviceCaseId=XXX 2. Verificar banner azul 3. Crear propuesta 4. GET /api/service-cases/XXX/proposal | Propuesta vinculada | Playwright + curl |
| Columna MARGEN visible | 1. Ir a /proposals 2. Verificar columna "MARGEN" 3. Verificar formato porcentaje | Columna presente | Playwright |
| Timeline aprobación | 1. Ir a detalle propuesta approved 2. Verificar timeline con fechas | Timeline visible | Playwright |
| Tooltip columna FLUJO | 1. Ir a /proposals 2. Hover en dot 3. Verificar tooltip | Tooltip visible | Playwright |

### Purchase Orders (T07)

| Scenario | Pasos | Expected | Herramienta |
|----------|-------|----------|-------------|
| Dropdown carga propuestas | 1. Tener propuesta approved 2. Ir a /purchase-orders/new 3. Select "Propuesta aprobada" 4. Verificar opciones | Opciones cargadas | Playwright |
| Autocomplete campos | 1. Seleccionar propuesta 2. Verificar cuenta servicio, facturación, monto, moneda | Campos auto-llenados | Playwright |
| Monto readonly | 1. Seleccionar propuesta 2. Intentar editar campo monto | Campo readonly | Playwright |
| Empty state sin propuestas | 1. 0 propuestas approved 2. Ir a /purchase-orders/new 3. Verificar EmptyState | EmptyState con CTA | Playwright |
| Badge vencimiento <30d | 1. PO con fecha vencimiento <30d 2. Verificar badge rojo | Badge visible | Playwright |

### Work Requests / Sidebar (T08)

| Scenario | Pasos | Expected | Herramienta |
|----------|-------|----------|-------------|
| Badge muestra count | 1. WR con status submitted 2. Verificar badge sidebar >0 | Badge visible | Playwright |
| Badge se actualiza post-calificar | 1. Calificar WR 2. Esperar 2s 3. Verificar badge 0 | Badge reactivo | Playwright |
| Badge desaparece en 0 | 1. Todos WR calificados 2. Refrescar página 3. Badge oculto | Badge invisible | Playwright |

### Site Visits / Planning (T09)

| Scenario | Pasos | Expected | Herramienta |
|----------|-------|----------|-------------|
| UserSelect carga usuarios | 1. Ir a /site-visits/new 2. Click campo técnico 3. Verificar dropdown | Usuarios listados | Playwright |
| UserSelect filtra por búsqueda | 1. Click campo técnico 2. Escribir "tec" 3. Verificar filtro | Filtro funcional | Playwright |
| UserSelect guarda ObjectId | 1. Seleccionar técnico 2. Submit formulario 3. Verificar payload contiene ObjectId 24 chars | ObjectId guardado | Playwright + curl |
| UserSelect error state | 1. Desconectar backend 2. Abrir campo 3. Verificar mensaje error | Error state visible | Playwright |

### Admin (T12)

| Scenario | Pasos | Expected | Herramienta |
|----------|-------|----------|-------------|
| Settings no loading infinito | 1. Ir a /admin/settings 2. Esperar 12s 3. No ver "Cargando configuración..." | Timeout + error state | Playwright |
| EmptyState CTA en dispatch | 1. Ir a /dispatch 2. Verificar EmptyState con botón acción | EmptyState funcional | Playwright |
| EmptyState CTA en maintenance | 1. Ir a /maintenance 2. Verificar EmptyState | EmptyState funcional | Playwright |
| Filtro requestId auditoría | 1. Ir a /admin/audit 2. Escribir requestId 3. Verificar filtro | Filtro funcional | Playwright |
| Certificaciones badge vencimiento | 1. Ir a /admin/personnel 2. Verificar columna CERTIFICACIONES | Badge visible | Playwright |

### Dashboard (T19)

| Scenario | Pasos | Expected | Herramienta |
|----------|-------|----------|-------------|
| KPI cards con datos | 1. GET /api/dashboard/kpis 2. Verificar response.data no vacío | KPIs con datos reales | curl |
| OperationalFlowMap visible | 1. Ir a /dashboard 2. Verificar pipeline 14 pasos | FlowMap presente | Playwright |
| Quick Actions bar | 1. Ir a /dashboard 2. Verificar botones "Nueva OT", "Nueva Solicitud" | Botones funcionales | Playwright |
| AreaChart con recharts | 1. Ir a /dashboard 2. Verificar gráfico | Gráfico visible | Playwright |

### Execution Offline (T18)

| Scenario | Pasos | Expected | Herramienta |
|----------|-------|----------|-------------|
| Offline submit a IndexedDB | 1. Simular offline 2. Crear sesión ejecución 3. Verificar IndexedDB tiene registro | Datos en IndexedDB | Playwright |
| Sync al reconectar | 1. Online otra vez 2. Esperar sync 3. Verificar POST a backend 4. Verificar IndexedDB vacío | Datos sincronizados | Playwright + curl |
| SyncIndicator muestra count | 1. Con datos offline pendientes 2. Verificar badge | Badge visible | Playwright |

### Templates (T17)

| Scenario | Pasos | Expected | Herramienta |
|----------|-------|----------|-------------|
| 5 templates seed exist | 1. GET /api/templates 2. Verificar count = 5 | 5 templates | curl |
| DynamicForm renderiza text | 1. Template con field type=text 2. Verificar <input> renderizado | Input visible | Playwright |
| DynamicForm renderiza photo | 1. Template con field type=photo 2. Verificar upload zone | Upload visible | Playwright |
| DynamicForm renderiza signature | 1. Template con field type=signature 2. Verificar canvas | Canvas visible | Playwright |
| DynamicForm submit | 1. Llenar campos requeridos 2. Submit 3. Verificar POST a backend | Submit funcional | Playwright |

### Kanban (T20)

| Scenario | Pasos | Expected | Herramienta |
|----------|-------|----------|-------------|
| Kanban con 5 columnas | 1. Ir a /service-cases/kanban 2. Verificar columnas por fase | 5 columnas | Playwright |
| Drag entre columnas | 1. Arrastrar caso de columna A a B 2. Verificar API PATCH llamado | Drag funcional | Playwright |
| SLA countdown badge | 1. Caso con SLA <3 días 2. Verificar badge rojo | Badge visible | Playwright |
| Toggle Kanban/Lista | 1. Click toggle 2. Verificar cambio vista | Toggle funcional | Playwright |

---

## Testing Strategy

### Backend Tests

#### proposal.service.test.ts
```typescript
describe('ProposalService.updateStatus', () => {
  // Happy paths
  it('should transition from draft to sent', async () => { /* ... */ });
  it('should transition from sent to approved', async () => { /* ... */ });
  it('should transition from sent to rejected', async () => { /* ... */ });
  it('should transition from approved to converted', async () => { /* ... */ });

  // Error paths
  it('should reject draft to approved (skip sent)', async () => {
    await expect(service.updateStatus(id, { status: 'approved' }, userId))
      .rejects.toThrow(AppError);
  });
  it('should reject draft to rejected (skip sent)', async () => {
    await expect(service.updateStatus(id, { status: 'rejected' }, userId))
      .rejects.toThrow(AppError);
  });
  it('should reject rejected to sent', async () => {
    await expect(service.updateStatus(id, { status: 'sent' }, userId))
      .rejects.toThrow(AppError);
  });
  it('should reject converted to anything', async () => {
    await expect(service.updateStatus(id, { status: 'draft' }, userId))
      .rejects.toThrow(AppError);
  });
  it('should throw 404 for nonexistent proposal', async () => {
    await expect(service.updateStatus('fake_id', { status: 'sent' }, userId))
      .rejects.toThrow(AppError);
  });
  it('should record audit event on status change', async () => {
    const result = await service.updateStatus(id, { status: 'sent' }, userId);
    expect(auditService.log).toHaveBeenCalledWith(
      'PROPOSAL_STATUS_CHANGED', userId, id, expect.any(Object)
    );
  });
});

describe('ProposalService.create with serviceCaseId', () => {
  it('should link proposal to service case when serviceCaseId provided', async () => {
    const result = await service.create({ ...data, serviceCaseId: caseId });
    expect(result.serviceCaseId).toBe(caseId);
  });
  it('should create proposal without serviceCaseId when not provided', async () => {
    const result = await service.create(data);
    expect(result.serviceCaseId).toBeUndefined();
  });
});
```

#### service-case.service.test.ts
```typescript
describe('ServiceCaseService.getLinkedProposal', () => {
  it('should return linked proposal if exists', async () => {
    const result = await service.getLinkedProposal(caseId);
    expect(result).not.toBeNull();
    expect(result!.serviceCaseId).toBe(caseId);
  });
  it('should return null if no linked proposal', async () => {
    const result = await service.getLinkedProposal(unlinkedCaseId);
    expect(result).toBeNull();
  });
});
```

### Frontend Tests

#### ProposalStatusActions.test.tsx
```typescript
describe('ProposalStatusActions', () => {
  it('shows "Enviar" button when status is draft', () => {
    render(<ProposalStatusActions proposal={draftProposal} />);
    expect(screen.getByText('Enviar propuesta al cliente')).toBeInTheDocument();
  });
  it('shows "Aprobar" and "Rechazar" when status is sent', () => {
    render(<ProposalStatusActions proposal={sentProposal} />);
    expect(screen.getByText('Marcar como aprobada')).toBeInTheDocument();
    expect(screen.getByText('Rechazar')).toBeInTheDocument();
  });
  it('shows success badge when status is approved', () => {
    render(<ProposalStatusActions proposal={approvedProposal} />);
    expect(screen.getByText('Propuesta aprobada')).toBeInTheDocument();
  });
  it('shows destructive badge when status is rejected', () => {
    render(<ProposalStatusActions proposal={rejectedProposal} />);
    expect(screen.getByText('Propuesta rechazada')).toBeInTheDocument();
  });
  it('shows loading spinner during mutation', async () => {
    render(<ProposalStatusActions proposal={draftProposal} />);
    fireEvent.click(screen.getByText('Enviar propuesta al cliente'));
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
  });
});

describe('UserSelect', () => {
  it('loads users on mount', async () => {
    render(<UserSelect roles={['tecnico']} onChange={mockOnChange} />);
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
  });
  it('filters by search text', async () => {
    render(<UserSelect roles={['tecnico']} onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: 'tec' } });
    await waitFor(() => {
      expect(screen.getByText('Técnico Electricista')).toBeInTheDocument();
    });
  });
  it('shows error state when API fails', async () => {
    render(<UserSelect roles={['tecnico']} onChange={mockOnChange} />);
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Test Count Targets
| Área | Tests actuales | Target nuevos | Target total |
|------|---------------|---------------|--------------|
| ProposalService.updateStatus | 0 | 10 | 10 |
| ServiceCaseService.getLinkedProposal | 0 | 2 | 2 |
| ProposalStatusActions | 0 | 5 | 5 |
| UserSelect | 0 | 3 | 3 |
| StepNode (diagrama 14 pasos) | 0 | 2 | 2 |
| Badge solicitudes reactivo | 0 | 2 | 2 |
| PurchaseOrder form (autocomplete) | 0 | 3 | 3 |
| EmptyState CTAs | 0 | 5 | 5 |
| DynamicForm | 0 | 4 | 4 |
| Offline execution | 0 | 3 | 3 |
| Dashboard KPIs | 0 | 3 | 3 |
| Kanban drag-drop | 0 | 3 | 3 |
| **Total** | **~1228** | **+45** | **~1273** |

---

## Accessibility Fixes (de auditoría a11y)

Basado en los hallazgos de accesibilidad de la auditoría Playwright (Sección 3):

| # | Hallazgo | Fix | WCAG | Task |
|---|----------|-----|------|------|
| A-01 | Sidebar módulos cierre: links sin href | Verificar que todos los `<a>` tienen href | 4.1.2 | T12 |
| A-02 | Badge "1 pendientes" sin aria-label | Agregar `aria-label="N solicitudes pendientes"` | 4.1.2 | T08 |
| A-03 | Upload zones sin aria-label consistente | Agregar `aria-label="Subir archivos"` a upload buttons | 4.1.2 | T12 |
| A-04 | Columna FLUJO en propuestas sin descripción | Agregar `aria-label` con significado de cada dot | 1.1.1 | T11 |
| A-05 | Service Case blockers no identificables como interactivos | Convertir a `<button>` o `<a>` con role apropiado | 2.4.4 | T05 |
| A-06 | Dropdown Nueva Propuesta sin aria-expanded | Agregar `aria-expanded={isOpen}` | 4.1.2 | T04 |
| A-07 | Selector de sede sin label screen reader | Agregar `aria-label="Seleccionar sede"` | 1.3.1 | T12 |
| A-08 | Nodos 14 pasos sin aria-label | Agregar `aria-label="Ir al Paso N: nombre"` | 2.4.4 | T10 |
| A-09 | Próximas Acciones sin roles ARIA | Agregar role="navigation" al panel | 4.1.2 | T11 |
| A-10 | Settings "Cargando..." sin anuncio | Agregar `aria-live="polite"` al loading state | 4.1.2 | T12 |

### Implementación de Fixes de Accesibilidad

```tsx
// A-02: Badge con aria-label
<Badge 
  className="..."
  aria-label={`${count} solicitudes pendientes de calificación`}
>
  {count}
</Badge>

// A-05: Blocker como elemento interactivo
<button
  onClick={handleResolve}
  aria-label={`Resolver bloqueador: ${blocker.description}`}
  className="..."
>
  {blocker.description}
</button>

// A-06: Dropdown con aria-expanded
<PopoverPrimitive.Trigger
  aria-expanded={isOpen}
  aria-haspopup="true"
>
  Nueva Propuesta
</PopoverPrimitive.Trigger>

// A-08: Nodo paso con aria-label
<Link
  href={stepUrl}
  aria-label={`Ir al Paso ${stepNumber}: ${stepName}`}
>
  {stepIcon}
  <span className="sr-only">Paso {stepNumber}: {stepName}</span>
</Link>

// A-10: Loading state con aria-live
<div aria-live="polite" aria-busy="true">
  <Spinner />
  <span>Cargando configuración...</span>
</div>
```

---

## Performance Considerations

### Bundle Size
- UserSelect component: lazy load si la lista de usuarios es >50
- DynamicForm: import dinámico de react-signature-canvas y html5-qrcode
- Dashboard recharts: tree-shaken por Next.js (solo importar charts usados)

### API Optimization
- GET /api/proposals?status=approved: agregar índice MongoDB en `{status: 1, sede: 1}`
- GET /api/users?role=X: agregar índice en `{role: 1, isActive: 1}`
- Badge solicitudes: endpoint liviano solo con `{pagination: {total}}` (sin data)

### Caching
- TanStack Query staleTime:
  - Badge count: 30s (se actualiza cada minuto)
  - Propuestas aprobadas: 60s (cambia poco)
  - Usuarios activos: 5min (cambia raramente)
  - Configuración: 10min
- LocalStorage: layout dashboard, preferencia Kanban/Lista

### Rendering
- Tabla propuestas: virtualizada si >100 filas (react-virtual)
- Kanban: memoizar cards (React.memo) para evitar re-renders en drag
- DynamicForm: field components lazy-loaded por tipo

---

## Monitoring y Logging

### Eventos a auditar (nuevos)
- `PROPOSAL_STATUS_CHANGED`: cada transición de estado
- `PROPOSAL_LINKED_TO_CASE`: cuando se vincula propuesta a ServiceCase
- `PURCHASE_ORDER_AUTOCOMPLETED`: cuando se auto-completan campos desde propuesta
- `EXECUTION_OFFLINE_SAVED`: cuando se guarda ejecución offline
- `EXECUTION_SYNCED`: cuando se sincroniza ejecución offline
- `TEMPLATE_USED`: cuando se usa un template dinámico

### Logging adicional
- Warning cuando dropdown PO no encuentra propuestas aprobadas
- Error cuando UserSelect falla al cargar usuarios
- Info cuando badge count cambia significativamente (>50% variación)
- Debug en operaciones offline (size de cola, tiempo de sync)

### Health Checks
- GET /api/health/live → debe incluir uptime
- GET /api/health/ready → debe verificar:
  - MongoDB connected
  - Índices creados (nuevos índices de status, role)
  - Templates seeds existen (count > 0)

---

## Componentes a Modificar por Tarea (Índice de Archivos)

### T01 — Schemas shared-types
| Archivo | Acción | Tipo |
|---------|--------|------|
| `packages/shared-types/src/schemas/proposal.schema.ts` | Extender con ProposalStatusSchema, UpdateProposalStatusSchema, serviceCaseId | MODIFY |

### T02 — Backend PATCH /proposals/:id/status
| Archivo | Acción | Tipo |
|---------|--------|------|
| `backend/src/services/proposal/proposal.service.ts` | Agregar método updateStatus con validación transiciones | MODIFY |
| `backend/src/controllers/proposal.controller.ts` | Agregar método updateStatus | MODIFY |
| `backend/src/routes/proposal.routes.ts` | Agregar ruta PATCH /:id/status | MODIFY |
| `backend/src/tests/proposal-status.test.ts` | Tests unitarios para transiciones | CREATE |

### T03 — Backend GET /service-cases/:id/proposal
| Archivo | Acción | Tipo |
|---------|--------|------|
| `backend/src/services/service-case/service-case.service.ts` | Agregar método getLinkedProposal | MODIFY |
| `backend/src/controllers/service-case.controller.ts` | Agregar método getLinkedProposal | MODIFY |
| `backend/src/routes/service-case.routes.ts` | Agregar ruta GET /:id/proposal | MODIFY |
| `backend/src/tests/service-case-proposal.test.ts` | Tests unitarios | CREATE |

### T04 — Frontend botones estado propuesta
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/modules/proposals/ui/ProposalStatusActions.tsx` | Componente con botones contextuales | CREATE |
| `frontend/src/modules/proposals/api/proposal.service.ts` | Método updateStatus | MODIFY/CREATE |
| `frontend/src/modules/proposals/hooks/use-proposals.ts` | Query keys para detail y list | MODIFY/CREATE |
| `frontend/src/app/proposals/[id]/page.tsx` | Integrar ProposalStatusActions | MODIFY |
| `frontend/src/modules/proposals/__tests__/ProposalStatusActions.test.tsx` | Tests componente | CREATE |

### T05 — Link navegable en bloqueadores ServiceCase
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/modules/service-cases/ui/BlockerCard.tsx` (o equivalente) | Reemplazar texto plano por `<Link>` | MODIFY |

### T06 — Vincular propuesta a ServiceCase
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/app/proposals/new/page.tsx` | Leer searchParams serviceCaseId, incluir en payload, banner | MODIFY |

### T07 — Dropdown PO con propuestas aprobadas
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/app/purchase-orders/new/page.tsx` | Select dinámico, autocomplete, empty state | MODIFY |
| `frontend/src/modules/proposals/hooks/use-approved-proposals.ts` | Hook TanStack Query para propuestas approved | CREATE |
| `frontend/src/app/purchase-orders/__tests__/PurchaseOrderForm.test.tsx` | Tests | CREATE |

### T08 — Badge solicitudes reactivo
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/modules/core/ui/layout/Sidebar.tsx` (o componente badge) | Reemplazar estático por useQuery | MODIFY |
| `frontend/src/modules/work-requests/hooks/use-pending-count.ts` | Hook para conteo pendientes | CREATE |
| `frontend/src/modules/work-requests/hooks/use-qualify-work-request.ts` | Invalidar pending-count en onSuccess | MODIFY |

### T09 — UserSelect component
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/components/shared/UserSelect/UserSelect.tsx` | Componente con autocomplete | CREATE |
| `frontend/src/components/shared/UserSelect/UserSelect.stories.tsx` | Storybook (si existe) | CREATE |
| `frontend/src/modules/site-visits/ui/SiteVisitForm.tsx` | Reemplazar input técnico | MODIFY |
| `frontend/src/modules/planning/ui/PlanningForm.tsx` | Reemplazar input personal | MODIFY |
| `frontend/src/components/shared/UserSelect/__tests__/UserSelect.test.tsx` | Tests | CREATE |

### T10 — Nodos 14 pasos clicables
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/modules/service-cases/ui/WorkflowStepper.tsx` (o equivalente) | Hacer nodos clicables con Link | MODIFY |
| `frontend/src/modules/service-cases/ui/StepNode.tsx` | Componente StepNode con mapa URLs | MODIFY/CREATE |
| `frontend/src/modules/service-cases/__tests__/StepNode.test.tsx` | Tests | CREATE |

### T11 — Columnas interactivas + botones accionables
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/modules/proposals/ui/ProposalsTable.tsx` | Tooltip columna FLUJO, columna MARGEN | MODIFY |
| `frontend/src/modules/service-cases/ui/NextActionsPanel.tsx` | Botones reales con Link | MODIFY |

### T12 — Settings fix + EmptyStates
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/app/admin/settings/page.tsx` | Timeout, error state, retry | MODIFY |
| `frontend/src/modules/dispatch/ui/DispatchPage.tsx` | EmptyState CTA | MODIFY |
| `frontend/src/modules/maintenance/ui/MaintenancePage.tsx` | EmptyState CTA | MODIFY |
| `frontend/src/modules/sla/ui/SlaPage.tsx` | EmptyState CTA | MODIFY |
| `frontend/src/modules/reports/ui/ReportsPage.tsx` | EmptyState CTA | MODIFY |
| `frontend/src/modules/delivery-records/ui/DeliveryRecordsPage.tsx` | EmptyState CTA | MODIFY |
| `frontend/src/modules/inventory/ui/InventoryPage.tsx` | EmptyState CTA | MODIFY |
| `frontend/src/modules/fleet/ui/FleetPage.tsx` | EmptyState CTA | MODIFY |
| `frontend/src/modules/assets/ui/AssetsPage.tsx` | EmptyState CTA | MODIFY |
| `frontend/src/modules/admin/backups/ui/BackupsPage.tsx` | EmptyState CTA | MODIFY |

### T13 — Margen% + Timeline aprobación
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/modules/proposals/ui/ProposalsTable.tsx` | Agregar columna MARGEN | MODIFY |
| `frontend/src/modules/proposals/ui/ProposalApprovalTimeline.tsx` | Timeline visual | CREATE |
| `frontend/src/app/proposals/[id]/page.tsx` | Integrar timeline | MODIFY |

### T14 — PDF preview + Excel export
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/modules/documents/ui/DocumentPreview.tsx` | PDF inline preview | CREATE |
| `frontend/src/modules/orders/ui/OrdersTable.tsx` | Botón Exportar Excel | MODIFY |

### T15 — QR scan + PO alerts + Health score
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/app/inventory/scan/page.tsx` | Verificar/simplificar scanner | MODIFY |
| `frontend/src/modules/purchase-orders/ui/POExpiryBadge.tsx` | Badge de vencimiento | CREATE |
| `frontend/src/modules/customers/ui/CustomersTable.tsx` | Health score column | MODIFY |

### T16 — Certificaciones + Filtros + Dashboard
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/app/admin/personnel/page.tsx` | Badge certificaciones | MODIFY |
| `frontend/src/app/admin/audit/page.tsx` | Filtro requestId, export CSV | MODIFY |
| `frontend/src/modules/dashboard/ui/DashboardPage.tsx` | Personalización drag-drop | MODIFY |

### T17 — Templates dinámicos
| Archivo | Acción | Tipo |
|---------|--------|------|
| `packages/shared-types/src/schemas/template.schema.ts` | TemplateSchema, FieldDefinitionSchema | CREATE |
| `backend/src/seeds/templates.seed.ts` | 5 templates CERMONT | CREATE |
| `frontend/src/components/shared/DynamicForm/DynamicForm.tsx` | Renderizado dinámico por tipo | CREATE |
| `frontend/src/components/shared/DynamicForm/fields/TextField.tsx` | Campo text | CREATE |
| `frontend/src/components/shared/DynamicForm/fields/SelectField.tsx` | Campo select | CREATE |
| `frontend/src/components/shared/DynamicForm/fields/PhotoField.tsx` | Campo photo (FileUploadZone) | CREATE |
| `frontend/src/components/shared/DynamicForm/fields/SignatureField.tsx` | Campo signature (react-signature-canvas) | CREATE |
| `frontend/src/components/shared/DynamicForm/fields/CheckboxGroupField.tsx` | Campo checkbox-group | CREATE |
| `frontend/src/components/shared/DynamicForm/fields/NumberField.tsx` | Campo number | CREATE |
| `frontend/src/components/shared/DynamicForm/fields/DateField.tsx` | Campo date | CREATE |
| `frontend/src/app/templates/page.tsx` | Lista de templates | MODIFY |
| `frontend/src/app/templates/[id]/page.tsx` | Render DynamicForm con template | MODIFY |

### T18 — Offline-first execution
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/modules/execution/store/execution-offline.store.ts` | idb-keyval store | CREATE |
| `frontend/src/modules/execution/hooks/use-create-execution.ts` | IndexedDB fallback + sync | MODIFY |
| `frontend/src/modules/execution/ui/OfflineSyncIndicator.tsx` | Badge operaciones pendientes | CREATE |
| `frontend/src/modules/execution/hooks/use-online-sync.ts` | Auto-sync al reconectar | CREATE |

### T19 — Dashboard KPIs reactivos
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/modules/dashboard/ui/KpiCard.tsx` | Trend + flecha + color | MODIFY |
| `frontend/src/modules/dashboard/ui/OperationalFlowMap.tsx` | Pipeline 14 pasos con conteos | CREATE |
| `frontend/src/modules/dashboard/ui/QuickActions.tsx` | Barra de acciones rápidas | CREATE |
| `frontend/src/modules/dashboard/ui/DashboardCharts.tsx` | AreaChart + RadialBarChart | MODIFY |
| `frontend/src/modules/dashboard/hooks/useDashboardKpis.ts` | Conectar a backend real | MODIFY |
| `frontend/src/modules/dashboard/hooks/useDashboardLayout.ts` | Persistir layout localStorage | CREATE |

### T20 — PDF Export + Kanban
| Archivo | Acción | Tipo |
|---------|--------|------|
| `frontend/src/modules/proposals/ui/ProposalPdfButton.tsx` | Botón descarga PDF | CREATE |
| `frontend/src/modules/delivery-records/ui/DeliveryRecordPdfButton.tsx` | Botón descarga PDF acta | CREATE |
| `frontend/src/modules/invoices/ui/InvoicePdfButton.tsx` | Botón descarga PDF factura | CREATE |
| `frontend/src/app/service-cases/kanban/page.tsx` | Vista Kanban | CREATE |
| `frontend/src/modules/service-cases/ui/KanbanBoard.tsx` | Board con @dnd-kit | CREATE |
| `frontend/src/modules/service-cases/ui/KanbanColumn.tsx` | Columna Kanban | CREATE |
| `frontend/src/modules/service-cases/ui/KanbanCard.tsx` | Card con SLA badge | CREATE |
| `frontend/src/modules/service-cases/ui/KanbanDetailSheet.tsx` | Sheet detalle lateral | CREATE |
| `frontend/src/modules/service-cases/hooks/use-kanban.ts` | Drag-and-drop logic | CREATE |
| `frontend/src/modules/service-cases/hooks/use-service-cases-view.ts` | Toggle Kanban/Lista | CREATE |

---

## Cronograma Detallado (Horas)

### Wave 0 (0.5h)
| Tarea | Tiempo | Descripción |
|-------|--------|-------------|
| T00 — Setup rama | 0.5h | Crear rama, verificar gates |

### Wave 1 (16h — 4 tareas paralelas)
| Tarea | Tiempo | Descripción |
|-------|--------|-------------|
| T01 — Schemas shared-types | 1h | Extender schemas Propuesta |
| T02 — Backend PATCH status | 4h | Endpoint + validación transiciones + tests |
| T03 — Backend GET linked proposal | 2h | Endpoint + tests |
| T04 — Frontend botones estado | 4h | Componente + API service + tests |
| **Total Wave 1** | **11h** | **Ejecución paralela: ~4h reales** |

### Wave 2 (12h — 4 tareas paralelas)
| Tarea | Tiempo | Descripción |
|-------|--------|-------------|
| T05 — Link bloqueador navegable | 1h | Reemplazar texto por Link |
| T06 — Vincular propuesta a SC | 2h | Query param + payload + banner |
| T07 — Dropdown PO propuestas | 4h | Select dinámico + autocomplete + empty |
| T08 — Badge solicitudes reactivo | 2h | useQuery + refetchInterval + invalidation |
| **Total Wave 2** | **9h** | **Ejecución paralela: ~4h reales** |

### Wave 3 (16h — 4 tareas paralelas)
| Tarea | Tiempo | Descripción |
|-------|--------|-------------|
| T09 — UserSelect component | 4h | Componente + integración site-visits + planning |
| T10 — Nodos 14 pasos clicables | 3h | StepNode + mapa URLs + tests |
| T11 — Tooltips + botones Cockpit | 3h | Tooltip FLUJO + botones acciones |
| T12 — Settings fix + CTAs | 4h | Settings timeout + 10 módulos EmptyState |
| **Total Wave 3** | **14h** | **Ejecución paralela: ~4h reales** |

### Wave 4 (12h — 4 tareas paralelas)
| Tarea | Tiempo | Descripción |
|-------|--------|-------------|
| T13 — Margen% + Timeline | 3h | Columna + timeline aprobación |
| T14 — PDF preview + Excel export | 3h | Preview documentos + export órdenes |
| T15 — QR scan + PO alerts + Health | 3h | Scanner + badges + health score |
| T16 — Certificaciones + Filtros | 3h | Badges + requestId filter + dashboard layout |
| **Total Wave 4** | **12h** | **Ejecución paralela: ~4h reales** |

### Wave 5 (32h — 4 tareas paralelas)
| Tarea | Tiempo | Descripción |
|-------|--------|-------------|
| T17 — Templates dinámicos | 12h | Schema + seeds + DynamicForm (6 field types) |
| T18 — Offline-first execution | 8h | IndexedDB + sync + indicator |
| T19 — Dashboard KPIs reactivos | 6h | KPIs + recharts + quick actions + layout |
| T20 — PDF Export + Kanban | 8h | PDF buttons + Kanban (board + columns + cards) |
| **Total Wave 5** | **34h** | **Ejecución paralela: ~12h reales** |

### Final Verification (8h — 4 agentes paralelos)
| Tarea | Tiempo | Descripción |
|-------|--------|-------------|
| F1 — Plan Compliance Audit | 2h | Oracle review |
| F2 — Code Quality Review | 2h | Code quality scan |
| F3 — Real Manual QA | 4h | Playwright full E2E + cross-task |
| F4 — Scope Fidelity Check | 2h | Scope compliance |
| **Total Verification** | **10h** | **Ejecución paralela: ~4h reales** |

### Resumen
| Fase | Tiempo neto | Tiempo real (paralelo) |
|------|-------------|----------------------|
| Wave 0 | 0.5h | 0.5h |
| Wave 1 | 11h | 4h |
| Wave 2 | 9h | 4h |
| Wave 3 | 14h | 4h |
| Wave 4 | 12h | 4h |
| Wave 5 | 34h | 12h |
| Verification | 10h | 4h |
| **Total** | **~90.5h** | **~32.5h** |

**Equivalente a ~4 días de trabajo continuo en paralelo máximo.**

---

## Matriz de Regresión

Para cada tarea, verificar que NO rompe:

| Tarea | Riesgo de regresión | Módulos afectados | Verificación |
|-------|---------------------|-------------------|--------------|
| T01 | ALTO — Schemas compartidos | Todos los que importan ProposalSchema | typecheck en todos los workspaces |
| T02 | MEDIO — Nuevo endpoint PATCH | Proposal list/detail | tests de transiciones |
| T03 | BAJO — Nuevo endpoint GET | ServiceCase detail | tests endpoint |
| T04 | BAJO — Nuevo componente UI | Proposal detail page | tests componente |
| T05 | BAJO — Reemplazar texto por Link | ServiceCase Cockpit | snapshot test |
| T06 | BAJO — Query param opcional | Proposal new page | tests con/sin param |
| T07 | MEDIO — Dropdown PO dinámico | PurchaseOrder form | tests formulario |
| T08 | BAJO — Badge reactivo | Sidebar | tests conteo |
| T09 | MEDIO — UserSelect reemplaza inputs | SiteVisits + Planning forms | tests integración |
| T10 | BAJO — Nodos clicables | ServiceCase diagrama | tests click |
| T11 | BAJO — Tooltips + botones | Proposals table + Cockpit | tests visuales |
| T12 | BAJO — EmptyState CTAs | 10 módulos | tests render |
| T13 | BAJO — Columna extra en tabla | Proposals table | tests columna |
| T14 | BAJO — PDF preview + botón | Documents + Orders | tests botón |
| T15 | BAJO — Badges visuales | PO + Customers | tests badge |
| T16 | BAJO — Filtros extra | Admin pages | tests filtro |
| T17 | ALTO — Nuevo schema + componente | Templates + DynamicForm | typecheck + tests |
| T18 | ALTO — Offline store | Execution module | tests offline/online |
| T19 | MEDIO — Dashboard refactor | Dashboard page | tests KPIs |
| T20 | MEDIO — Kanban nueva vista | ServiceCases + PDF | tests drag + tests PDF |

### Gate de Regresión (ejecutar antes de cada commit)
```bash
echo "=== GATE DE REGRESIÓN ==="
# 1. Typecheck completo
npm run typecheck
if [ $? -ne 0 ]; then echo "❌ TYPECHECK FALLÓ"; exit 1; fi

# 2. Lint
npm run lint
if [ $? -ne 0 ]; then echo "❌ LINT FALLÓ"; exit 1; fi

# 3. Build
npm run build
if [ $? -ne 0 ]; then echo "❌ BUILD FALLÓ"; exit 1; fi

# 4. Tests
npm run test
if [ $? -ne 0 ]; then echo "❌ TESTS FALLARON"; exit 1; fi

echo "✅ GATES SUPERADOS"
```

---

## Referencias a la Auditoría Playwright

Cada tarea en este plan se basa en hallazgos específicos de la auditoría documentada en:
`.sisyphus/evidence/playwright-audit-report.md`

### Mapa de Referencias Cruzadas

| Sección Auditoría | Hallazgo | Tarea | Estado esperado |
|-------------------|----------|-------|-----------------|
| 1.2 Service Cases | B-01, B-02, B-03, U-01, U-02 | T05, T06, T10, T11 | Links navegables, pasos clicables, botones accionables |
| 1.4 Work Requests | B-04 | T08 | Badge reactivo |
| 1.5 Site Visits | B-05 | T09 | UserSelect component |
| 1.6 Proposals | B-06, B-07, B-08, I-01, I-02 | T01, T02, T04, T06, T11, T13 | Transiciones estado, FLUJO tooltip, timeline |
| 1.7 PO | B-09, B-10, I-03 | T07 | Dropdown propuestas, autocomplete |
| 1.33 Settings | Loading persistente | T12 | Timeout + error state |
| 2.1 Flujo Propuestas | Análisis completo | T01-T07 | Flujo 3→4 desbloqueado |
| 2.2 Flujo PO | Análisis completo | T07 | PO creable con propuesta |
| 2.3 Flujo SC→Propuesta | Análisis completo | T05, T06 | Vinculación funcional |
| 3.1 a11y Hallazgos | A-01 a A-10 | T05, T08, T10, T11, T12 | aria-labels, roles, focus |
| 5.1 Innovación P0 | 6 items críticos | T01-T08 | Flujo 14 pasos completable |
| 5.2 Innovación P1 | 6 items UX | T09-T12 | UX mejorada |
| 5.3 Innovación P2 | 11 items mejora | T13-T16 | Calidad producto |
| 5.4 Estratégicas | 5 items innovación | T17-T20 | Innovaciones implementadas |

---

## Success Criteria

### Final Checklist
- [ ] SC-2026-0001 avanza de paso 3 a paso 14 sin bloqueos
- [ ] Propuesta BORRADOR puede pasar a ENVIADA → APROBADA vía UI
- [ ] Propuesta se vincula a ServiceCase automáticamente
- [ ] PO se crea con propuesta aprobada seleccionable
- [ ] Badge solicitudes se actualiza reactivamente
- [ ] UserSelect con autocomplete funciona en Visitas y Planeación
- [ ] Nodos 14 pasos son clicables
- [ ] Todos los módulos con datos tienen empty states con CTA
- [ ] Dashboard tiene KPIs reactivos conectados a backend
- [ ] Execution módulo funciona offline con IndexedDB
- [ ] 5 templates CERMONT seed disponibles en /templates
- [ ] PDF export funcional para propuestas, actas, facturas
- [ ] Todos los gates pasan: `npm run verify` → green
