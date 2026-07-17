# CERMONT Implementation Wave 01 — Audit Before

## Branch
implement/spec-024-post-spec022-continuation

## Commit
6a3465fa1e9ed91013054a63418c9b328f531449

## Working Directory
C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo

## Critical Endpoints (Runtime)
- /api/backend/notifications/unread-count — 401 (protected, expected)
- /api/backend/dashboard/operational-kpis — 401 (protected, expected)
- /api/backend/dashboard/sla-risk — 401 (protected, expected)
- /api/erp-connectors — 401 (protected, expected)
- /admin/erp-connectors/new — 404 (DEAD ROUTE - not found)

## Files with Unsafe Casts (detected 102+)
- frontend/src/modules/kits/ui/KitForm.tsx — as never (line 97), as unknown as (line 142)
- frontend/src/modules/kits/ui/KitWizardForm.tsx — as never (line 84), as unknown as (line 108)
- frontend/src/modules/resources/ui/ResourceForm.tsx — as UpdateResource, as CreateResource (lines 87, 89)
- frontend/src/app/(dashboard)/planning-packet/new/page.tsx — as unknown as (line 366), unsafe cast (line 286)
- Various other files

## Local Schemas Detected (duplicates of shared-types)
- KitForm.tsx — kitFormSchema (local, duplicates CreateKitSchema)
- KitWizardForm.tsx — kitWizardSchema (local, duplicates CreateKitSchema)
- NewVehicleDrawer.tsx — VehicleCreateFormSchema (local, but has proper adapter pattern)

## Dead Routes
- /admin/erp-connectors/new — 404, linked from EmptyState action

## Dialog Warnings
- KitForm.tsx — Dialog.Content has aria-labelledby, uses Dialog.Title + Dialog.Description — OK
- NewVehicleDrawer.tsx — Dialog.Content has aria-describedby, uses Dialog.Title + Dialog.Description — OK
- ResourceForm.tsx — Dialog.Content has aria-labelledby, uses Dialog.Title + Dialog.Description — OK

## Modules
- Kits: KitForm + KitWizardForm with local schemas
- Planning: PlanningPacketNewPage with signatures not yet integrated
- Forms: 3 CERMONT templates (Planeación Obra, Líneas de Vida, CCTV)
- Evidence: Gallery with basic filtering
- Costs: Basic view
- Dashboard: Operational KPIs, SLA risk, summary
