# Contract Inventory — Wave 2 T01

## Schemas (111) vs Models (62)

### Schemas without direct model counterpart
Most schemas correspond to Mongoose models either directly or as sub-schemas. Key schemas without dedicated models are typically:
- **Abstract/composition schemas:** common, service-case-step-context, service-case-cockpit, cermont-operational-step, work-order-fsm
- **Sub-object schemas:** cost-cart, cost-traceability, delivery-package, document-attachment, document-composer, document-file, document-source-file, execution-equipment, execution-evidence, execution-gps, execution-labor, execution-signature, extracted-document-layout, geolocation, planning-reference-document, schedule-event, domain-blocker, domain-command, operational-step-requirement, template-stage-requirement, workflow-blocker, camera, epp, lifeline, material, field-permit, qr-code
- **Config/meta schemas:** system-config, sla, dian, analytics, ai, tariff, pdf-import, xlsx-import, privacy-request, notification-preference, erp-connector, history

### Models with schema ✅
Most models have matching schemas in shared-types.

### Date field naming — ✅ Already unified
All schemas use `createdAt`/`updatedAt`. No `fechaCreacion` or `fechaActualizacion` found.

### Status enums — ✅ Already centralized in @cermont/domain
- OperationalStepStatus, ExecutionSessionStatus, KitStatus, UserRole
- ChecklistItemResult, BillingState, BillingStep, PermissionResource
- quality:hardcoded-roles: 0 violations

**Verdict:** Contract-first architecture is already well-implemented. No major discrepancies.
