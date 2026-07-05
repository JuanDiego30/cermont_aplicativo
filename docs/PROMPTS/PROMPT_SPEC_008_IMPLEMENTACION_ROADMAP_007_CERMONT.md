# PROMPT MAESTRO — Spec Kit 008: Implementación real del Roadmap 007 CERMONT

Actúa como un **Staff Software Architect + Principal Full Stack Engineer + Product Engineer FSM/CMMS/ERP + QA Lead + Release Engineer**.

Este prompt parte de la auditoría Spec 007. La auditoría confirmó que CERMONT tiene una base técnica sólida, pero que la implementación prometida está incompleta:

- typecheck, lint, build y 1091 tests pasan.
- `quality:strict` falla por 29 violaciones nuevas.
- Plan 003 completado solo en 11/40 tasks, equivalente a 27.5%.
- Wave 1 contracts: 8/8 completado.
- Wave 2 backend: 3/13 completado.
- Wave 3 frontend: 0/12 completado.
- Wave 4 tests/docs: 0/7 completado.
- WIP actual: 151 archivos modificados + ~70 untracked.
- Score general: ~35% implementado de lo prometido.
- 7 de 8 errores post-deploy corregidos, pero WebAuthn/huella móvil sigue parcial.

Este prompt NO es para auditar de nuevo ni para crear más documentación sin código. Es para **implementar el roadmap priorizado**, cerrar brechas reales, proteger el WIP y convertir lo documentado en funcionalidad verificable.

---

## 1. Objetivo principal

Crear y ejecutar:

```txt
specs/008-implementacion-roadmap-007-cermont/
```

para implementar, por waves y slices verticales:

1. estabilizar el WIP actual;
2. corregir `quality:strict`;
3. completar frontend Wave 3;
4. completar tests Wave 4;
5. cerrar backend gaps pendientes;
6. completar WebAuthn/login móvil;
7. implementar módulos profesionales faltantes;
8. mejorar navegación;
9. conectar UI con endpoints reales;
10. cerrar documentación viva con evidencia.

---

## 2. Reglas absolutas anti-alucinación

1. No volver a auditar todo desde cero salvo verificación puntual.
2. No crear solo documentos.
3. No decir “implementado” sin código modificado, test y comando ejecutado.
4. No tocar 151 archivos WIP sin clasificar primero.
5. No borrar cambios existentes sin respaldo.
6. No introducir `any`.
7. No aumentar violaciones de `quality:strict`.
8. No ignorar las 29 violaciones nuevas.
9. No cerrar Wave si no hay pruebas.
10. No dejar componentes frontend desconectados.
11. No dejar endpoints sin consumo si son parte del slice.
12. No dejar UI con botones sin acción.
13. No usar mocks productivos.
14. No romper RBAC.
15. No romper API envelope.
16. No romper contratos Zod/shared-types.
17. No implementar funcionalidades nuevas antes de cerrar P0.
18. No mezclar todos los cambios en un solo commit lógico.
19. No hacer deploy sin smoke tests.
20. No cerrar la spec sin reporte final.

---

## 3. Fuentes de verdad obligatorias

Leer antes de implementar:

```txt
.sisyphus/plans/007-auditoria-roadmap.md
specs/007-auditoria-implementacion-real-y-navegacion/final-audit-report.md
specs/007-auditoria-implementacion-real-y-navegacion/module-status-matrix.md
specs/007-auditoria-implementacion-real-y-navegacion/prompt-to-code-traceability.md
specs/007-auditoria-implementacion-real-y-navegacion/api-consumption-matrix.md
specs/007-auditoria-implementacion-real-y-navegacion/navigation-audit.md
specs/007-auditoria-implementacion-real-y-navegacion/implementation-roadmap.md
docs/audits/IMPLEMENTATION_REALITY_AUDIT.md
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
docs/API_STATUS.md
docs/DEVELOPMENT_STATUS.md
DESIGN.md
REGLAS_DESARROLLO_CERMONT.md
```

Si algún archivo no existe, documentarlo en:

```txt
specs/008-implementacion-roadmap-007-cermont/missing-inputs.md
```

---

## 4. Crear Spec Kit 008

Si Spec Kit CLI existe:

```txt
/speckit.specify
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.implement
```

Si no existe, crear manualmente:

```txt
specs/008-implementacion-roadmap-007-cermont/
  spec.md
  plan.md
  tasks.md
  implementation-log.md
  wip-stabilization-report.md
  quality-strict-fix-report.md
  wave-frontend-implementation-report.md
  wave-backend-gap-implementation-report.md
  wave-tests-report.md
  navigation-fix-report.md
  final-verification-report.md
  contracts/
    fleet-frontend-contract.md
    asset-tool-upload-contract.md
    evidence-pdf-audit-contract.md
    cost-tracking-contract.md
    maintenance-schedule-contract.md
    sla-indicator-contract.md
    consent-gate-contract.md
    privacy-requests-frontend-contract.md
    webauthn-login-contract.md
```

---

# PLAN DE IMPLEMENTACIÓN POR WAVES

---

## WAVE 0 — Proteger WIP y preparar rama

### Objetivo

No perder los 151 archivos modificados ni los ~70 untracked.

### Acciones

```bash
git status --short
git branch --show-current
git diff --stat
git diff --name-only
git ls-files --others --exclude-standard
```

Crear:

```txt
specs/008-implementacion-roadmap-007-cermont/wip-stabilization-report.md
```

Clasificar archivos en:

```txt
A. Cambios de Spec 005 hotfix
B. Cambios de contratos Wave 1
C. Cambios backend Wave 2
D. Cambios frontend incompletos
E. Docs/specs/prompts
F. Archivos generados/build/cache
G. Cambios desconocidos que requieren revisión
```

Si hay riesgo de pérdida:

```bash
git stash push -u -m "backup-before-spec-008-implementation"
```

o crear commit temporal:

```bash
git add -A
git commit -m "wip: backup before spec 008 implementation"
```

Solo hacer commit temporal si el equipo lo permite.

### Criterio de aceptación

- WIP clasificado.
- No se pierde trabajo.
- Rama limpia o estado documentado.
- No se avanza a Wave 1 sin protección.

---

## WAVE 1 — Corregir quality:strict y deuda bloqueante

### Objetivo

Quitar las 29 violaciones nuevas que bloquean CI/CD.

### Acciones

```bash
npm run quality:strict
```

Guardar salida completa en:

```txt
specs/008-implementacion-roadmap-007-cermont/quality-strict-fix-report.md
```

Corregir por archivo, no globalmente. No aumentar baseline. No usar `any`.

Módulos reportados por auditoría:

```txt
auth
analytics
documents
erp-connector
form-submissions
maintenance
notifications
resource
template-response
work-requests
```

### Criterio de aceptación

```bash
npm run quality:strict
npm run typecheck
npm run lint
npm test
```

deben pasar sin nuevas violaciones.

---

## WAVE 2 — Completar backend gaps críticos

### Objetivo

Cerrar tareas backend pendientes de Wave 2 del Plan 003.

### 2.1 Asset/tool photo/document upload endpoints

Implementar:

```txt
POST /api/assets/:id/photos
GET  /api/assets/:id/photos
POST /api/assets/:id/documents
GET  /api/assets/:id/documents
PATCH /api/assets/:id/primary-photo
```

Debe soportar fotos, PDFs, manual, ficha técnica, certificado, calibración, metadata, validación MIME, ownerType/ownerId, RBAC y auditoría.

### 2.2 Evidence download audit endpoint

Implementar auditoría para descarga PDF, descarga evidencia y visualización de documento sensible.

Eventos:

```txt
EVIDENCE_PDF_DOWNLOADED
EVIDENCE_FILE_VIEWED
DOCUMENT_DOWNLOADED
```

### 2.3 Cost tracking POST/PATCH/DELETE

Implementar:

```txt
POST   /api/costs/order/:orderId/items
PATCH  /api/costs/items/:id
DELETE /api/costs/items/:id
```

Categorías:

```txt
labor
material
tool
vehicle
subcontractor
travel
tax
other
```

### 2.4 ERP mapping validation

Implementar:

```txt
POST /api/erp-connectors/:id/validate-mapping
POST /api/erp-connectors/:id/test-sync
```

### 2.5 Maintenance schedule CRUD

Implementar:

```txt
GET    /api/maintenance/schedules
POST   /api/maintenance/schedules
GET    /api/maintenance/schedules/:id
PATCH  /api/maintenance/schedules/:id
DELETE /api/maintenance/schedules/:id
```

### 2.6 Maintenance logs

Implementar:

```txt
GET  /api/maintenance/assets/:assetId/logs
POST /api/maintenance/assets/:assetId/logs
```

### 2.7 SLA status endpoint

Implementar:

```txt
GET /api/sla/work-orders/:id/status
GET /api/sla/summary
```

### Criterio de aceptación Wave 2

- Endpoints existen.
- Zod valida params/body/query.
- RBAC aplicado.
- Response envelope estándar.
- Tests backend agregados.
- API_STATUS actualizado.

---

## WAVE 3 — Completar frontend pendiente del Plan 003

La auditoría confirmó que Wave 3 está 0/12. Esta wave es prioritaria.

### 3.1 Fleet photo gallery + camera + readiness

Crear/ajustar:

```txt
frontend/src/modules/fleet/ui/FleetPhotoGallery.tsx
frontend/src/modules/fleet/ui/FleetCameraCapture.tsx
frontend/src/modules/fleet/ui/ReadinessBadge.tsx
frontend/src/modules/fleet/ui/FleetDocumentChecklist.tsx
frontend/src/app/(dashboard)/fleet/[id]/page.tsx
```

Debe incluir galería, subir foto, tomar foto, seleccionar foto principal, readiness score, alertas de vencimiento, estado `ready/incomplete/expired/blocked` y estados empty/loading/error.

### 3.2 Evidence form + PDF download frontend

Crear/ajustar:

```txt
frontend/src/modules/evidences/ui/EvidenceForm.tsx
frontend/src/modules/evidences/ui/EvidencePdfDownloadButton.tsx
frontend/src/modules/evidences/ui/EvidenceGallery.tsx
frontend/src/app/(dashboard)/evidences/[id]/page.tsx
```

Debe incluir título, descripción, fase, fotos, ownerType/ownerId, PDF download, auditoría descarga y estado aprobación/rechazo.

### 3.3 Cost panel + execution tracking form

Crear/ajustar:

```txt
frontend/src/modules/costs/ui/CostPanel.tsx
frontend/src/modules/costs/ui/ExecutionCostForm.tsx
frontend/src/modules/costs/ui/CostBreakdownTable.tsx
frontend/src/modules/costs/ui/BudgetDeviationCard.tsx
frontend/src/app/(dashboard)/orders/[id]/page.tsx
frontend/src/app/(dashboard)/orders/[id]/execution/page.tsx
```

### 3.4 ERP admin page + sync trigger UI

Crear:

```txt
frontend/src/app/(dashboard)/admin/erp-connectors/page.tsx
frontend/src/modules/erp-connector/ui/ErpConnectorAdminPanel.tsx
frontend/src/modules/erp-connector/ui/ErpSyncTrigger.tsx
frontend/src/modules/erp-connector/ui/ErpHealthCard.tsx
```

### 3.5 Maintenance schedule UI

Crear:

```txt
frontend/src/app/(dashboard)/maintenance/schedules/page.tsx
frontend/src/modules/maintenance/ui/MaintenanceScheduleList.tsx
frontend/src/modules/maintenance/ui/MaintenanceScheduleForm.tsx
frontend/src/modules/maintenance/ui/MaintenanceLogTimeline.tsx
```

### 3.6 SLA indicator component

Crear:

```txt
frontend/src/modules/sla/ui/SlaStatusIndicator.tsx
frontend/src/modules/sla/ui/SlaSummaryCard.tsx
```

Integrar en order detail, dashboard y work order lists.

### 3.7 Consent gate

Crear/ajustar:

```txt
frontend/src/modules/privacy/ui/ConsentGate.tsx
frontend/src/app/(dashboard)/layout.tsx
```

Reglas: si no hay consentimiento vigente, mostrar gate; no bloquear logout; mostrar política/aviso; registrar aceptación.

### 3.8 Privacy requests frontend

Crear:

```txt
frontend/src/app/(dashboard)/profile/privacy/page.tsx
frontend/src/modules/privacy/ui/PrivacyRequestForm.tsx
frontend/src/modules/privacy/ui/PrivacyRequestList.tsx
frontend/src/modules/privacy/ui/PrivacyStatusBadge.tsx
```

### 3.9 WebAuthn login completo

Completar:

```txt
frontend/src/modules/auth/ui/PasskeyButton.tsx
frontend/src/modules/auth/ui/PasskeyManager.tsx
frontend/src/app/login/page.tsx
frontend/src/app/(dashboard)/profile/security/page.tsx
```

Debe detectar soporte móvil, mostrar fallback, registrar passkey, login con passkey, administrar dispositivos y manejar errores.

### Criterio de aceptación Wave 3

- Los 12 puntos frontend tienen UI real.
- Consumen hooks/services reales.
- No hay botones muertos.
- No hay mocks productivos.
- Tienen loading/error/empty/forbidden states.
- Mobile usable.
- DESIGN.md respetado.

---

## WAVE 4 — Tests faltantes

### Objetivo

Cerrar Wave 4 que está 0/7.

Implementar:

```txt
Fleet photo E2E test
Evidence form + PDF E2E test
Cost tracking integration test
ERP connector integration test
Maintenance module integration test
WebAuthn frontend/backend tests
Full verify pipeline
```

Si `test:e2e` no existe, crear script o documentar y agregar Playwright mínimo para:

- fleet photo;
- evidence form;
- cost tracking;
- privacy request;
- passkey fallback.

### Criterio de aceptación Wave 4

- Tests agregados.
- Pasan localmente.
- Documentación actualizada.
- CI preparado.

---

## WAVE 5 — Navegación y UX profesional

### Objetivo

Corregir navegación y UX detectadas en Spec 007.

Implementar:

1. Indicador visual del flujo de 14 pasos.
2. Enlaces a legal/privacy en perfil y/o footer.
3. Privacy requests page en navegación de perfil.
4. Tools debe dejar de redirigir simplemente a resources si hay módulo propio.
5. Estados claros para rutas sin permiso.
6. Navegación móvil mejorada.
7. Breadcrumbs consistentes.
8. Acciones rápidas por módulo.
9. Links desde dashboard KPIs a módulos.
10. Badges de alertas en navegación.

Archivos probables:

```txt
frontend/src/modules/core/navigation.ts
frontend/src/modules/core/ui/layout/Sidebar.tsx
frontend/src/modules/core/ui/layout/MobileNavigation.tsx
frontend/src/components/layout/
frontend/src/app/(dashboard)/layout.tsx
```

### Criterio de aceptación

- Cada módulo importante es navegable.
- No hay rutas huérfanas críticas.
- No hay menú a rutas inexistentes.
- Navegación refleja operación CERMONT.

---

## WAVE 6 — Dashboard KPIs accionables y notificaciones reales

### Dashboard

Implementar KPIs:

- órdenes activas;
- bloqueadas;
- en ejecución;
- listas para facturar;
- documentos vencidos;
- vehículos bloqueados;
- herramientas no disponibles;
- evidencias pendientes;
- checklists incompletos;
- margen promedio;
- facturación pendiente;
- SLA en riesgo.

### Notificaciones

Implementar eventos reales:

- vehículo documento vencido;
- herramienta certificado vencido;
- evidencia rechazada;
- orden asignada;
- checklist bloqueado;
- costo excedido;
- factura pendiente;
- privacy request recibida;
- descarga sensible.

### Criterio

- Notificaciones no generan 401 spam.
- Unread count estable.
- Dashboard muestra acciones, no solo números.

---

## WAVE 7 — Verificación final y preparación de deploy

Ejecutar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

Si aplica:

```bash
npm run test:e2e
npx react-doctor@latest
```

Crear/actualizar:

```txt
specs/008-implementacion-roadmap-007-cermont/final-verification-report.md
docs/audits/SPEC_008_IMPLEMENTATION_REPORT.md
docs/DEVELOPMENT_STATUS.md
docs/API_STATUS.md
docs/TECHNICAL_DEBT.md
docs/KNOWN_ISSUES.md
docs/CHANGELOG.md
```

---

# TASKS SPEC KIT 008

Si Spec 007 terminó en T246, continuar:

```md
# Tasks — Spec 008 Implementación Roadmap 007

## P0 — WIP y calidad
- [ ] T247 Crear spec 008.
- [ ] T248 Clasificar 151 archivos modificados y ~70 untracked.
- [ ] T249 Proteger WIP con stash o commit temporal.
- [ ] T250 Ejecutar baseline.
- [ ] T251 Corregir 29 violaciones quality:strict.
- [ ] T252 Verificar typecheck/lint/test/build.

## P0 — Backend gaps
- [ ] T253 Implementar asset photo upload endpoints.
- [ ] T254 Implementar asset document upload endpoints.
- [ ] T255 Implementar evidence download audit.
- [ ] T256 Implementar cost tracking POST/PATCH/DELETE.
- [ ] T257 Implementar ERP mapping validation.
- [ ] T258 Implementar maintenance schedule CRUD.
- [ ] T259 Implementar maintenance logs.
- [ ] T260 Implementar SLA status endpoints.

## P1 — Frontend Wave 3
- [ ] T261 Implementar FleetPhotoGallery.
- [ ] T262 Implementar FleetCameraCapture.
- [ ] T263 Implementar ReadinessBadge/ReadinessAlerts.
- [ ] T264 Implementar EvidenceForm.
- [ ] T265 Implementar EvidencePdfDownloadButton.
- [ ] T266 Implementar CostPanel en order detail.
- [ ] T267 Implementar ExecutionCostForm.
- [ ] T268 Implementar ERP admin page.
- [ ] T269 Implementar SyncTriggerUI.
- [ ] T270 Implementar MaintenanceScheduleUI.
- [ ] T271 Implementar SLA indicator.
- [ ] T272 Integrar ConsentGate.
- [ ] T273 Crear PrivacyRequests frontend.
- [ ] T274 Completar WebAuthn login/profile UI.

## P1 — Navegación y UX
- [ ] T275 Implementar flujo visual de 14 pasos.
- [ ] T276 Corregir navegación tools/resources.
- [ ] T277 Agregar legal/privacy a perfil/nav.
- [ ] T278 Mejorar navegación móvil.
- [ ] T279 Agregar breadcrumbs y estados forbidden.
- [ ] T280 Agregar links de KPIs a módulos.

## P1 — Dashboard y notificaciones
- [ ] T281 Implementar KPIs accionables.
- [ ] T282 Implementar alertas de vehículos/herramientas/evidencias.
- [ ] T283 Implementar eventos reales de notificación.
- [ ] T284 Estabilizar unread count.

## P2 — Tests
- [ ] T285 Crear Fleet photo E2E.
- [ ] T286 Crear Evidence form/PDF E2E.
- [ ] T287 Crear Cost tracking integration test.
- [ ] T288 Crear ERP connector integration test.
- [ ] T289 Crear Maintenance integration test.
- [ ] T290 Crear WebAuthn tests.
- [ ] T291 Crear Privacy requests tests.
- [ ] T292 Ejecutar full verify pipeline.

## P2 — Cierre
- [ ] T293 Actualizar DEVELOPMENT_STATUS.
- [ ] T294 Actualizar API_STATUS.
- [ ] T295 Actualizar TECHNICAL_DEBT.
- [ ] T296 Actualizar CHANGELOG.
- [ ] T297 Crear reporte final Spec 008.
```

---

# FORMATO DE RESPUESTA POR WAVE

```txt
# Wave X — Resultado

## 1. Objetivo
## 2. Archivos revisados
## 3. Archivos modificados
## 4. Funcionalidad implementada
## 5. Tests agregados
## 6. Comandos ejecutados
## 7. Resultado
## 8. Riesgos abiertos
## 9. Próxima wave
```

---

# DEFINITION OF DONE

Spec 008 solo queda cerrada si:

1. WIP fue protegido.
2. `quality:strict` pasa sin nuevas violaciones.
3. Backend gaps P0 implementados.
4. Wave 3 frontend ya no está 0%.
5. Fleet gallery/camera/readiness está implementado.
6. Evidence form/PDF download/audit está implementado.
7. Cost panel/execution form está implementado.
8. Asset/tool photos/documents está implementado.
9. Maintenance schedule CRUD/UI está implementado.
10. SLA indicator está implementado.
11. Consent gate y privacy requests frontend están implementados.
12. WebAuthn frontend está integrado en login/profile o bloqueado con razón técnica real.
13. Navigation audit corregido en P0/P1.
14. Dashboard KPIs accionables implementados.
15. Notificaciones reales implementadas.
16. Tests Wave 4 agregados.
17. typecheck pasa.
18. lint pasa.
19. tests pasan.
20. build pasa.
21. contracts guard pasa.
22. verify pasa.
23. documentación viva actualizada.
24. no se introdujo `any`.
25. no hay mocks productivos nuevos.
26. reporte final creado.

Empieza por Wave 0. No implementes frontend ni backend hasta proteger WIP y corregir quality:strict.
