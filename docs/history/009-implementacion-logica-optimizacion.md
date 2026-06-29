# PLAN: Spec 009 — Auditoría de Lógica, Optimización y Plan de Implementación con Context7

## TL;DR

> **Quick Summary**: Auditoría completa de lógica de negocio del flujo de 14 pasos de CERMONT, optimización de backend/frontend/PWA, y plan de implementación detallado con archivos exactos, contratos, endpoints, hooks, componentes UI y tests. Basado en el LTG (tesis de 203 páginas), el flujo de 14 pasos, 5 fallas críticas y el análisis del repositorio.
>
> **Deliverables**:
> - Auditoría del flujo de 14 pasos: 14/14 pasos mapeados, 7 estados implementados
> - Scorecard de 24 módulos con nivel de madurez
> - Matriz de lógica faltante por módulo
> - Guía de optimización backend/frontend/PWA
> - Plan de implementación Wave P0-P4 con archivos exactos
>
> **Estado actual**: 11/40 tareas del plan 003 completado (27.5%), 151 archivos modificados, ~70 untracked, quality:strict FAIL (29 violaciones)

---

## Context

### LTG Requirements Extracted (203-page thesis)

**Full Thesis**: `docs/pdf/01_main10.md` (203 pages, 468KB) — "Desarrollo de un Aplicativo Web para la Gestión de Órdenes de Trabajo, Trazabilidad y Cierre Administrativo de Procesos Operativos en CERMONT S.A.S." by Juan Diego Arévalo Pidiache

#### 14-Step Flow (from LTG §1.2)
| Paso | Etapa | Entidad | Estado actual de implementación |
|------|-------|---------|-------------------------------|
| 1 | Solicitud del cliente | WorkRequest | ✅ Implementado (backend + frontend) |
| 2 | Visita técnica | SiteVisit | ✅ Implementado |
| 3 | Propuesta económica | Proposal | ✅ Implementado |
| 4 | Aprobación con PO | PurchaseOrder | ✅ Implementado |
| 5 | Planeación | PlanningPacket | ✅ Implementado |
| 6 | Ejecución en campo | ExecutionSession | ✅ Implementado |
| 7 | Informe técnico | TechnicalReport | ✅ Implementado |
| 8 | Acta de entrega | DeliveryRecord | ✅ Implementado |
| 9 | Firma del cliente | ClientSignature | ✅ Implementado |
| 10 | SES / Ariba | ServiceEntrySheet | ✅ Implementado |
| 11 | Aprobación SES | SESApproval | ✅ Implementado (within SES) |
| 12 | Factura | Invoice | ✅ Implementado |
| 13 | Aprobación de factura | InvoiceApproval | ✅ Implementado (within Invoice) |
| 14 | Pago | Payment | ✅ Implementado |

#### 5 Critical Failures (from LTG §1.3)
1. **F1**: Planeación incompleta → PlanningPacket + kits típicos → ⚠️ PARCIAL (kits existen, validación automática de certificaciones NO)
2. **F2**: Evidencias dispersas → PWA + cámara + checklist → ⚠️ PARCIAL (PWA existe, sync de archivos binarios pendiente)
3. **F3**: Informes con recaptura → PDF autogenerado → ⚠️ PARCIAL (pdf-lib implementado, integración completa pendiente)
4. **F4**: Cierre administrativo fragmentado → Panel de trazabilidad → ⚠️ PARCIAL (admin panel existe, consolidación completa pendiente)
5. **F5**: Costos no centralizados → Motor de costos → ⚠️ PARCIAL (backend OK, frontend incompleto)

---

## 1. Context7 Evidence

| Tecnología | Library ID usado | Temas consultados | Decisión aplicada | Riesgo si no se aplica |
|-----------|-----------------|-------------------|-------------------|----------------------|
| Next.js | /vercel/next.js | App Router, metadata, layouts | Reafirmar uso actual (v16.2.1) | Layouts/server components obsoletos |
| TanStack Query | /tanstack/query | Query keys, mutations, invalidation | Mantener pattern actual; auditar enabled/invalidation | Queries sin enabled causan 401 spam |
| Zod 4 | /websites/zod_dev_v4 | Schema validation, infer, safeParse | Reafirmar contract-first | Schemas duplicados entre capas |
| Playwright | /microsoft/playwright | E2E testing, scenarios | Usar para smoke tests post-deploy | Sin E2E, regresiones indetectables |
| SimpleWebAuthn | /masterkale/simplewebauthn | Registration, authentication flows | Backend implementado correctamente | Frontend incompleto bloquea passkeys |
| Mongoose | (built-in knowledge) | Indexes, pagination, lean | Auditar N+1 y lean queries | Performance degradation con datos reales |

---

## 2. Scorecard de Madurez por Módulo

Escala: 0=inexistente, 1=documentación, 2=backend/schema, 3=frontend básico, 4=funcional E2E, 5=profesional, 6=comercializable

| Módulo | Score | Backend | Frontend | Lógica | UX | Tests | Optim. | Próximo salto |
|--------|-------|---------|----------|--------|-----|-------|--------|---------------|
| WorkRequest | 4 | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | Frontend form validation |
| SiteVisit | 3 | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Frontend detail/creation |
| Proposal | 4 | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | Cost estimation integration |
| PurchaseOrder | 3 | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | PO approval workflow |
| Orders (ServiceCase) | 4 | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | Timeline + blockers UI |
| PlanningPacket | 3 | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ | ⚠️ | Kit auto-validation |
| ExecutionSession | 4 | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | Offline sync robustness |
| Evidences | 3 | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | Form + PDF + gallery |
| Documents | 4 | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | Import pipeline |
| TechnicalReport | 3 | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ | ⚠️ | PDF auto-generation |
| DeliveryRecord | 3 | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Signature integration |
| ClientSignature | 3 | ✅ | ⚠️ | ✅ | ⚠️ | ❌ | ⚠️ | Biometric/WebAuthn |
| SES | 4 | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | Ariba integration |
| Invoice | 4 | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | DIAN XML |
| Payments | 3 | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Payment reconciliation |
| Costs | 3 | ✅ | ⚠️ | ✅ | ❌ | ⚠️ | ❌ | ERP-style UI + budget vs actual |
| Fleet | 2 | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ | Gallery + readiness + alerts |
| Tools/Assets | 2 | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ | Photo/document upload |
| Checklists | 2 | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | Blocking items + required photo |
| Maintenance | 1 | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | Schedule CRUD + logs |
| Notifications | 2 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | Real events + unread |
| Dashboard | 3 | ✅ | ✅ | ⚠️ | ❌ | ❌ | ⚠️ | KPIs accionables |
| Privacy/Consent | 2 | ✅ | ❌ | ⚠️ | ❌ | ✅ | ❌ | Consent gate frontend |
| WebAuthn | 2 | ✅ | ❌ | ✅ | ❌ | ⚠️ | ❌ | Login/profile UI |
| PWA/Offline | 2 | N/A | ⚠️ | ⚠️ | ⚠️ | ❌ | ⚠️ | Binary sync + conflict resolution |

**Score general**: ~2.8/6 (por debajo del objetivo Nivel 3 del LTG)

---

## 3. Auditoría de Lógica de Negocio — 14 Pasos

### Gates de transición (workflow-gate.service.ts)
- ✅ Implementados: ServiceCase state machine con 14 estados + eventos
- ✅ Bloqueadores por paso: `cermont-workflow-gate.service.ts` con resolvers por entidad
- ✅ `step-requirements.ts` con `canAdvanceStep()`, `getAllowedActions()`, `buildBlockers()`
- ❌ UI de bloqueadores: No hay componente frontend que muestre blockers al usuario
- ❌ Notificaciones de bloqueo: No se emiten notificaciones cuando un paso está bloqueado
- ❌ Timeline visual: No hay indicador visual del progreso de 14 pasos en la UI

### Lógica faltante crítica

| Paso | Lógica implementada | Lógica faltante | Prioridad |
|------|--------------------|----------------|-----------|
| 5-6 | PlanningPacket + ExecutionSession existen | No hay validación de certificaciones vencidas antes de asignar personal | P1 |
| 6 | ExecutionSession + Evidence | No hay bloqueo si evidencias requeridas faltan | P1 |
| 7-9 | TechnicalReport + DeliveryRecord | No hay generación automática de PDF con evidencias incrustadas | P1 |
| 10-14 | SES, Invoice, Payment CRUD | No hay consolidación visual del estado de cierre por orden | P1 |
| 3-14 | Cost module existe | No hay comparación presupuesto vs real por paso | P1 |

---

## 4. Auditoría de Optimización

### Backend/MongoDB
| Problema | Ubicación | Riesgo | Mejora |
|----------|-----------|--------|--------|
| Falta lean() en varias queries | Servicios backend | ALTO | Agregar `.lean()` en queries de solo lectura |
| Population sin select | Servicios backend | MEDIO | Agregar `.select()` para limitar campos |
| Paginación sin límite máximo | Controllers | ALTO | Asegurar `Math.min(limit, 100)` |
| No hay índices compuestos | Modelos | MEDIO | Agregar índices para filtros comunes (status+createdAt) |
| quality:strict 29 violaciones | Routes | ALTO | Corregir validación/authorization faltante |
| N+1 en listados de órdenes | Order service | MEDIO | Usar population con select |

### Frontend/React/Next.js
| Problema | Ubicación | Riesgo | Mejora |
|----------|-----------|--------|--------|
| Queries sin `enabled` | Varios hooks | ALTO | Agregar `enabled: Boolean(user)` |
| Sin invalidación post-mutación | Varias mutations | ALTO | Agregar `onSuccess: () => queryClient.invalidateQueries(...)` |
| Componentes cliente innecesarios | Varias páginas | MEDIO | Mover a Server Component cuando sea posible |
| Sin lazy loading en módulos pesados | Varios | MEDIO | Usar `next/dynamic` para modales/pesados |
| Sin refetchInterval en dashboard | Dashboard | BAJO | Agregar refetchInterval para datos en tiempo real |

### PWA/Offline
| Problema | Ubicación | Riesgo | Mejora |
|----------|-----------|--------|--------|
| Sin sync de archivos binarios grandes | SW/IndexedDB | ALTO | Implementar chunked upload en cola de sync |
| Sin resolución de conflictos | Sync service | ALTO | Implementar last-write-wins con clientMutationId |
| Sin offline fallback para API | SW config | MEDIO | Cache Network-First con fallback |
| Assets 404 previamente corregidos | public/icons | ✅ | Verificar en build |

---

## 5. WIP Classification

Se detectaron 151 archivos modificados + ~70 untracked:

| Categoría | Count | Riesgo |
|-----------|-------|--------|
| Hotfix (spec-005) | ~60 | BAJO — cambios controlados |
| Backend-gap | ~30 | MEDIO — lógica nueva sin tests |
| Frontend-gap | ~25 | MEDIO — componentes sin probar |
| Test-gap | ~10 | ALTO — tests nuevos sin verificar |
| Docs | ~15 | BAJO — solo documentación |
| Generated | ~70 | BAJO — assets/icons nuevos |
| Unknown | ~5 | ALTO — verificar antes de merge |

---

## 6. Plan de Implementación Detallado

### WAVE P0 — Bloqueantes (Día 1-3)

#### T1. quality:strict — 29 violaciones

**Archivos a modificar**:
- `backend/src/modules/ai/ai.routes.ts` (line 16) → add `authorize`
- `backend/src/modules/analytics/analytics.routes.ts` (lines 38, 53) → add `validateBody`
- `backend/src/modules/auth/auth.routes.ts` (lines 46-103) → add `validateBody` + `authorize`
- `backend/src/modules/documents/document-import.routes.ts` (lines 13, 23) → add `validateBody`
- `backend/src/modules/documents/document-template.routes.ts` (line 13) → add `validateBody`
- `backend/src/modules/erp-connector/erp-connector.routes.ts` (line 67) → add `validateBody`
- `backend/src/modules/form-submissions/form-submission.routes.ts` (lines 13, 46) → add `validateBody`
- `backend/src/modules/maintenance/maintenance.routes.ts` (line 79) → add `validateBody`
- `backend/src/modules/notifications/notifications.routes.ts` (line 38) → add `validateBody`
- `backend/src/modules/resource/resource.routes.ts` (lines 109, 111) → add `validateBody` + `authorize`
- `backend/src/modules/template-response/template-response.routes.ts` (line 19) → add `validateBody`
- `backend/src/modules/work-requests/work-requests.routes.ts` (lines 60, 73) → add `authorize`

**Criterio de aceptación**: `npm run quality:strict` → PASS

#### T2. Evidence form + PDF frontend

**Archivos**:
- CREATE `frontend/src/modules/evidences/ui/EvidenceForm.tsx`
- UPDATE `frontend/src/app/(dashboard)/evidences/page.tsx` → integrar form
- CREATE `frontend/src/modules/evidences/hooks/useEvidenceForm.ts`
- UPDATE `frontend/src/app/(dashboard)/evidences/[id]/page.tsx` → PDF download button

**Contrato Zod**: `EvidenceFormInputSchema` ya existe en `evidence-form.schema.ts`

**Endpoint**: `POST /api/evidences/form` ya existe

**Test**:
- UPDATE `backend/tests/controllers/evidence.controller.test.ts` → add form test
- CREATE `frontend/tests/modules/evidences/EvidenceForm.test.tsx`

#### T3. Fleet photo gallery + camera

**Archivos**:
- CREATE `frontend/src/modules/fleet/ui/FleetPhotoGallery.tsx`
- UPDATE `frontend/src/app/(dashboard)/fleet/[id]/page.tsx`
- CREATE `frontend/src/modules/fleet/hooks/useFleetPhotos.ts`
- UPDATE `frontend/src/modules/fleet/api/fleet-api.ts`

**Test**:
- CREATE `frontend/tests/modules/fleet/FleetPhotoGallery.test.tsx`

#### T4. Asset/tool photo/document endpoints

**Archivos**:
- UPDATE `backend/src/modules/asset/asset.routes.ts` → add photo/document routes
- UPDATE `backend/src/modules/asset/asset.controller.ts`
- UPDATE `backend/src/modules/asset/asset.service.ts`

**Contratos**: Reutilizar `VehiclePhotoUploadSchema` pattern

**Test**:
- UPDATE `backend/tests/controllers/asset.controller.test.ts`

#### T5. Consent gate en layout

**Archivos**:
- CREATE `frontend/src/modules/consents/ui/ConsentGate.tsx`
- UPDATE `frontend/src/app/(dashboard)/layout.tsx`

**Test**:
- CREATE `frontend/tests/modules/consents/ConsentGate.test.tsx`

---

### WAVE P1 — Core Logic (Día 4-6)

#### T6. Privacy requests frontend
- CREATE `frontend/src/app/(dashboard)/profile/privacy/page.tsx`
- CREATE `frontend/src/modules/privacy-requests/` (queries, hooks, ui)

#### T7. WebAuthn login + profile UI
- UPDATE `frontend/src/modules/auth/ui/LoginForm.tsx` → add passkey button
- UPDATE `frontend/src/app/(dashboard)/profile/page.tsx` → passkey manager

#### T8. Cost panel + execution form
- UPDATE `frontend/src/app/(dashboard)/orders/[id]/page.tsx` → CostPanel
- CREATE `frontend/src/app/(dashboard)/orders/[id]/costs/page.tsx`

#### T9. Maintenance schedule CRUD + frontend
- UPDATE `backend/src/modules/maintenance/maintenance.routes.ts` → schedule endpoints
- CREATE `frontend/src/app/(dashboard)/maintenance/schedules/`

#### T10. Dashboard KPIs accionables
- UPDATE `frontend/src/app/(dashboard)/dashboard/page.tsx`
- UPDATE `frontend/src/modules/dashboard/` → add KPI alerts

---

### WAVE P2 — Profesionalización (Día 7-9)

#### T11-T14: Notifications, Checklists, ERP, SLA
#### T15-T17: E2E tests, readiness UI, offline sync

---

### WAVE P3 — Optimización (Día 10-12)

#### T18-T20: Mongo indexes, query limits, TanStack Query invalidation
#### T21-T23: Lazy loading, bundle reduction, image optimization

---

### WAVE P4 — Tests & Quality (Día 13-15)

#### T24-T27: Contract tests, E2E, mobile E2E, accessibility
#### T28-T30: Full verify, baseline update, final report

---

## 7. Verification Strategy

### Gates obligatorios
```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run contracts:check
npm run quality:strict
```

### QA Policy
- Frontend/UI: Playwright
- API/Backend: curl + Supertest
- Evidencia: `.sisyphus/evidence/`

---

## 8. Success Criteria

### Final Checklist
- [ ] quality:strict: PASS
- [ ] typecheck: PASS
- [ ] lint: PASS
- [ ] test: PASS (1091+)
- [ ] build: PASS
- [ ] contracts:check: PASS
- [ ] Evidence form + PDF: working
- [ ] Fleet gallery: working
- [ ] Asset photo upload: working
- [ ] Consent gate: active
- [ ] Privacy requests: functional
- [ ] WebAuthn login: functional
- [ ] Cost panel: integrated
- [ ] Maintenance schedule: functional
- [ ] Dashboard KPIs: actionable
- [ ] E2E tests: passing
