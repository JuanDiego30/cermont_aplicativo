# Fleet/Tools Professional Layer — Corrected Contract

**Task:** T11  
**Status:** DESIGN_APPROVED  
**Reviewed:** vehicle/tool Zod schemas, Mongoose models, fleet/tool/resource services and routes, maintenance logs, checklist contract, frontend fleet consumers.

## Current capability, verified from code

### Fleet

- `VehicleSchema` and `VehicleModel` already hold plate, type, driver, Colombian document expirations, kilometre maintenance threshold, status, and audit users.
- `/api/fleet` supports create/list/detail/update and expiring-document alerts.
- readiness is calculated with `evaluateFleetReadiness` in `@cermont/domain`, but the frontend computes it independently and the backend assignment guard checks only part of the same policy.
- the frontend exposes a photo gallery whose `/api/fleet/:id/photos` calls do not exist.

### Tools

- `ToolSchema`, `Tool` model, and `/api/tools` already support CRUD, certifications, documents, and expired-certificate reporting.
- `/tools` currently presents resource/tool data through `/api/resources`, creating two overlapping tool aggregates.
- the Mongoose `Tool` model stores certifications/documents/evidence requirements as `Mixed`, while the service relies on casts and duplicated command interfaces.

## Decisions

1. Extend existing contracts; do not create `FleetVehicle`, `FleetTool`, or another CRUD module.
2. Close the broken vehicle-media flow first using the canonical FileAsset engine described in T10.
3. Keep readiness rules in `@cermont/domain`; backend mutations and frontend display must call the same rule.
4. Do not embed `maintenanceHistory[]`, `assignmentHistory[]`, GPS samples, or audit/download histories in Vehicle/Tool documents. These grow without a product bound and require referenced, indexed records.
5. Reuse current maintenance/checklist capabilities where their ownership model fits. Add a new referenced record only when the existing order-only checklist or Asset-only maintenance log cannot represent the use case.
6. Defer live GPS. No tracker/provider or consent/retention contract exists.

## Slice A — Vehicle media (implementation target)

Defined by `architecture-map-contract.md`:

- vehicle FileAsset ownership;
- bounded embedded refs on Vehicle;
- primary photo identifier on Vehicle;
- four fleet photo adapter routes delegating to the files service;
- current gallery remains functional with real endpoints.

## Slice B — Server-authoritative readiness

### Contract

```text
GET /api/fleet/:id/readiness
→ { vehicleId, score, ready, blockers[], evaluatedAt }
```

- `evaluateFleetReadiness` remains the only rule implementation.
- driver assignment and future dispatch must reject the same blocking result.
- insurance expiry, technical inspection, SOAT, maintenance age/threshold, and out-of-service status must not drift between client and server.

## Slice C — Tool contract hardening

Before adding fields:

1. select one canonical aggregate for tools (`Tool` or `Resource type=tool`) through an ADR and migration inventory;
2. replace `Schema.Types.Mixed` with typed sub-schemas aligned to `tool.schema.ts`;
3. remove service-local command DTO duplication and parse shared contracts at the boundary;
4. eliminate `Record<string, unknown>[]` and double casts from the tool service;
5. add focused schema/model/service tests.

Calibration is already representable as a certification type. New top-level `calibrationDate` fields would duplicate `certifications[]` and are therefore rejected.

## Referenced operational history

If Cermont requires assignment, maintenance, or inspection history, use independently pageable records:

```text
AssetEvent
- assetType: vehicle | tool
- assetId
- eventType: assignment | return | maintenance | inspection | incident
- occurredAt
- actorId
- orderId (status: present | absent)
- payload: discriminated event contract
```

Index `(assetType, assetId, occurredAt desc)`. Keep only bounded snapshot fields such as `lastMaintenanceAt`, `nextMaintenanceKm`, and current assignment on the parent for fast profile reads.

## Non-goals for the first release

- WebSocket GPS tracking.
- QR/NFC hardware provisioning.
- predictive maintenance without historical data quality.
- configurable cross-tenant checklist marketplace.
- embedded histories or parallel vehicle/tool models.

## Acceptance tests

1. No frontend fleet photo request points to an absent backend route.
2. Readiness result is identical in service and UI fixtures.
3. A vehicle with any blocking document/maintenance rule cannot be assigned.
4. Tool contract/model tests prove certification and document shapes without `Mixed` or escape-hatch casts in changed code.
5. Histories are pageable references, never unbounded parent arrays.
6. Existing fleet, tool, resource, maintenance, and checklist tests remain green.
