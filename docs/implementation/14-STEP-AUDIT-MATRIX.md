# Matriz de auditoría — Flujo operativo de 14 pasos (2026-07-07)

Verificado contra código real en rama `claude/bold-almeida-9f1776` (incluye spec-022/024).

Fuente única de estados: `packages/domain/src/operational-steps.ts` (`OPERATIONAL_STEPS`, `CANONICAL_CODES`) + máquina de estados `packages/domain/src/workflow/service-case-state-machine.ts` y requisitos por paso `step-requirements.ts`. Gates de transición: `backend/src/services/cermont-workflow-gate.service.ts` (con tests).

| # | Paso | Backend | Frontend | Estado |
|---|------|---------|----------|--------|
| 1 | Solicitud formal | `modules/work-requests` | `/work-requests` | Implementado |
| 2 | Visita técnica | `modules/site-visit` | `/site-visits` | Implementado |
| 3 | Propuesta económica | `modules/proposal` (totales recalculados en backend) | `/proposals` | Implementado |
| 4 | Aprobación con PO | `modules/purchase-order` | `/purchase-orders` | Implementado |
| 5 | Planeación | `modules/planning-packet` + `POST /:id/validate-readiness` + `POST /:id/approve` (readiness gate) | `ReadinessGate` (con tests) | Implementado |
| 6 | Ejecución en campo | `modules/execution-session` (preflight, offline sync vía `modules/sync`) | `/execution-sessions/[id]`, offline queue IndexedDB | Implementado |
| 7 | Informe técnico | `modules/technical-report` (auto-draft) | `/reports/[id]/draft` | Implementado |
| 8 | Acta de entrega | `modules/delivery-record` | firma digital | Implementado |
| 9 | Acta firmada | `client-signature`, portal | portal cliente | Implementado |
| 10 | SES / Ariba | `modules/service-entry-sheet` | pipeline | Implementado |
| 11 | SES aprobada | SES approval + validación factura↔SES | pipeline | Implementado |
| 12 | Factura | `modules/invoice` | `/invoices/[id]/pipeline` | Implementado |
| 13 | Aprobación factura | invoice workflow states | pipeline | Implementado |
| 14 | Pago y cierre | `modules/payment` + `administrative-workflow.service` (cierre bloqueado hasta pago) | pipeline/cockpit | Implementado |

Transversales verificados:
- Cockpit: `GET /service-cases/:id/workflow` + alias `/cockpit`; página `/service-cases/[id]/cockpit` con loading/error/empty.
- Evidence FSM: `POST /evidences/:id/verify`, `/:id/replace`, `/:id/review` (reject exige motivo ≥3 chars); tests backend de FSM.
- Dashboard OS: `/dashboard/summary|operational-kpis|sla-risk|next-actions|blockers|recent-activity`.
- Automation MVP: CRUD `/automation/rules` + enable/disable.
- Auditoría: `audit-log.middleware` + módulo `audit` (registro con requestId, actor, acción).
- RBAC: `authorize(...)` desde `@cermont/domain` en todas las rutas (checker 0 violations).

Brechas conocidas (deuda, no bloqueante):
- Estados offline/forbidden no uniformes en todas las páginas del flujo (cockpit tiene loading/error/empty; falta offline/forbidden explícitos).
- Query keys inline en ~40 sitios (ver fase-2-ssot-audit).
- Automation: ejecución real de reglas ante eventos limitada (MVP CRUD + test dry-run).
