# Matriz de madurez de módulos

## Escala y método

- **0:** no existe.
- **1:** CRUD o base aislada.
- **2:** contrato, backend y frontend conectados.
- **3:** estados, RBAC, auditoría y tests con evidencia parcial.
- **4:** capacidad profesional FSM/GMAO/ERP con integraciones y gates demostrados.
- **5:** SaaS comercializable con aislamiento, automatización, analítica y operación validada.

Los niveles actuales son una **evaluación estática provisional** basada en archivos, rutas, contratos y tests presentes al 2026-06-30. No certifican producción ni sustituyen E2E/UAT. Ante falta de evidencia integral se asigna el nivel inferior.

| Módulo | Actual | Objetivo | Brecha principal | Backend | Frontend | Packages | Prioridad |
|---|---:|---:|---|---|---|---|---|
| WorkRequest | 3 | 4 | validar offline, SLA y conversión completa | `modules/work-requests`, `models/WorkRequest.ts` | `modules/work-requests`, `/work-requests` | `work-request.schema.ts` | P1 |
| SiteVisit | 3 | 4 | evidencia/mediciones offline y handoff a propuesta | `modules/site-visit`, `models/SiteVisit.ts` | `modules/site-visits`, `/site-visits` | `site-visit.schema.ts` | P1 |
| Proposal | 3 | 4 | versionado, margen y aprobación E2E | `modules/proposal`, `models/Proposal.ts` | `modules/proposals`, `/proposals` | `proposal.schema.ts` | P1 |
| PurchaseOrder | 3 | 4 | validar monto/archivo/aprobación contra propuesta | `modules/purchase-order`, `models/PurchaseOrder.ts` | `modules/purchase-orders`, `/purchase-orders` | `purchase-order-authorization.schema.ts` | P1 |
| ServiceCase / WorkOrder | 4 | 4 | carga/agregación, permisos y UAT del cockpit | `modules/service-cases`, `modules/order` | `modules/service-cases`, `modules/orders` | `service-case-workflow.schema.ts`, workflow domain | P1 |
| PlanningPacket | 3 | 4 | readiness único y autoritativo en servidor | `modules/planning-packet`, `models/PlanningPacket.ts` | `modules/planning`, `/planning` | `planning-packet.schema.ts`, `planning.rules.ts` | P0/P1 |
| ExecutionSession | 3 | 4 | cola visible, reintentos e idempotencia E2E | `modules/execution-session`, `models/ExecutionSession.ts` | `modules/execution`, `/execution` | `execution-session.schema.ts`, `execution.ts` | P1 |
| Evidence | 3 | 4 | completar reemplazo y lock por informe | `modules/evidence`, `models/Evidence.ts` | `modules/evidences`, `/evidences` | `evidence.schema.ts` | P1 |
| TechnicalReport | 3 | 4 | versionado/plantillas y bloqueo de insumos | `modules/technical-report`, `modules/report` | `modules/reports`, `/reports` | `technical-report.schema.ts`, `report.schema.ts` | P1 |
| DeliveryRecord | 3 | 4 | aceptación/firma y documento inmutable E2E | `modules/delivery-record`, `models/DeliveryRecord.ts` | páginas `/delivery-records` | `delivery-record.schema.ts` | P1 |
| ClientAcceptance / Signature | 3 | 4 | ownership, consentimiento y validación legal | `modules/client-signature`, `models/ClientSignature.ts` | `modules/signatures` | `client-signature.schema.ts` | P1 |
| ServiceEntrySheet | 3 | 4 | vínculo estricto con acta; Ariba sigue externo | `modules/service-entry-sheet` | `modules/billing`, `/billing/ses` | `service-entry-sheet.schema.ts` | P1 |
| SESApproval | 3 | 4 | pruebas de rechazo/reenvío e idempotencia | `modules/service-entry-sheet` | `/billing/ses/[id]/approve` | `service-entry-sheet.schema.ts` | P1 |
| InvoiceTracking | 3 | 4 | aging, soportes y aclarar no-emisión DIAN | `modules/invoice`, `models/Invoice.ts` | `/billing/invoices` | `invoice.schema.ts` | P1 |
| InvoiceApproval | 3 | 4 | pruebas negativas por rol/ownership | `modules/invoice` | `/billing/invoices/[id]/approve` | `invoice-approval.schema.ts` | P1 |
| PaymentRecord | 3 | 4 | conciliación, comprobante y cierre inmutable | `modules/payment`, `models/Payment.ts` | `modules/billing`, `/payments` | `payment.schema.ts` | P1 |
| Fleet / Vehicles | 3 | 4 | una regla server-authoritative de readiness | `modules/fleet`, `models/Vehicle*.ts` | `modules/fleet`, `/fleet` | `vehicle.schema.ts`, `fleet-readiness.rules.ts` | P1 |
| Tools / Assets / Resources | 3 | 4 | resolver ownership dual `Tool`/`Resource` | `modules/tool`, `asset`, `resource` | `resources`, `/tools` documentado como `/resources` real | `tool.schema.ts`, `asset.schema.ts`, `resource.schema.ts` | P0/P1 |
| Checklists | 4 | 4 | E2E de bloqueo en orden real | `modules/checklist`, `models/Checklist.ts` | `modules/checklists`, `/checklists` | `checklist.schema.ts`, `checklist.rules.ts` | P1 |
| Costs | 4 | 4 | rentabilidad validada con datos reales | `modules/cost`, `models/Cost*.ts` | `modules/costs`, `/costs` | `cost.schema.ts`, `cost.rules.ts` | P1 |
| Dashboard | 4 | 4 | perfiles/latencia y UAT; evitar KPI genérico | `modules/dashboard` | `modules/dashboard`, `/dashboard` | `dashboard-summary.schema.ts` | P1 |
| Notifications | 3 | 4 | delivery/outbox/retry observables | `modules/notifications`, `Notification*.ts` | `modules/notifications`, `/notifications` | `notification.schema.ts` | P1 |
| Users / RBAC | 3 | 4 | matriz negativa E2E y consistencia proxy/API | `modules/user`, `auth`, middlewares | `modules/users`, `auth`, `proxy.ts` | `domain/roles.ts`, `permissions.ts` | P0 |
| Audit | 3 | 4 | cobertura exhaustiva de mutaciones críticas | `modules/audit`, `models/AuditLog.ts` | `modules/audit`, `/admin/audit` | `audit.schema.ts` | P0 |
| PWA / Offline Sync | 3 | 4 | binarios y todos los formularios críticos | `modules/sync` | `modules/offline`, `lib/offline`, `sw.ts` | `sync.schema.ts` | P0/P1 |
| Legal / Privacy | 2 | 4 | consulta titular, retención, evidencia de consentimiento | `modules/privacy-requests` | consent/privacy/profile | contratos de privacidad/consentimiento dispersos | P1 |
| Portal Client | 2 | 4 | completar aprobaciones/firmas con ownership | `modules/portal` | `modules/portal`, `/portal/*` | contratos de portal no aislados | P2 |
| AI | 2 | 4 | guardrails, evaluación, revisión humana | `modules/ai` | AI drawer | `ai.schema.ts` | P2 |
| Automation Rules | 3 | 4 | integración end-to-end, loops, outbox y observabilidad | `modules/automation`, modelos Automation* | `modules/automation` | `automation.schema.ts` | P1/P2 |
| SaaS / Tenant Isolation | 0 | 5 | no existe `tenantId`; requiere ADR/migración/pruebas | no verificado | flags globales existentes, no tenancy | sin contrato tenant | P3 |

## Riesgos de interpretación

- `CODEBASE_MAP.md` usa “verified” solo para existencia física.
- Algunos mapas antiguos usan nombres plurales que no coinciden con carpetas reales.
- Feature flags globales verificadas no equivalen a aislamiento por tenant.
- La presencia de páginas de aprobación no demuestra autorización/ownership correctos.

