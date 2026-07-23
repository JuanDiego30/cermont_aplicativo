# Module: Fleet

## Business Problem
Gestión de vehículos de la flota empresarial con control de documentos (SOAT, tecnomecánica), asignación a órdenes de trabajo, y check-in/check-out. Sin este módulo no hay trazabilidad del estado de la flota ni alertas de vencimiento documental.

## Roles
Per `MAINTENANCE_MANAGEMENT_ROLES` (`gerente`, `residente`, `hes`, `auxiliar_hes`) + `administrativo`.

| Action | MAINTENANCE_ROLES | administrativo |
|--------|:-----------------:|:--------------:|
| Create/edit vehicle | ✓ | |
| Assign vehicle | ✓ | ✓ |
| Check-in/check-out | ✓ | ✓ |
| Upload documents | ✓ | ✓ |
| View fleet | ✓ | ✓ |

## Use Cases
- UC-FLT-01: Registrar vehículo (placa, marca, modelo, año, capacidad)
- UC-FLT-02: Adjuntar documentos (SOAT, tecnomecánica, seguro) con fechas de vencimiento
- UC-FLT-03: Asignar vehículo a orden de trabajo (conductor, fecha inicio, fecha fin)
- UC-FLT-04: Check-in/check-out con kilometraje y fotos
- UC-FLT-05: Dashboard de flota con indicador de disponibilidad
- UC-FLT-06: Alertas de documentos próximos a vencer
- UC-FLT-07: Historial de asignaciones por vehículo
- UC-FLT-08: Galería de fotos del vehículo

## Entities
- `Vehicle` (plate, brand, model, year, capacity, documents[], photos[], readinessScore, status)
- `VehicleAssignment` (vehicleId, workOrderId, driverId, startDate, endDate, checkInKm, checkOutKm, status)
- `VehicleDocument` (type: soat | technomechanical | insurance | others, issueDate, expiryDate, fileUrl, status)

## Document Expiry
```
valid → expiring_soon (30 days) → expired
```

## Readiness Score
Calculated as: percentage of required documents valid + vehicle in operational state.
- 100%: All required docs valid, no maintenance issues
- < 100%: Missing or expired documents
- 0%: Critical document expired or vehicle in maintenance

## States
### Vehicle
```
active → assigned → maintenance → inactive
```

### VehicleAssignment
```
pending → active → completed → cancelled
```

## Preconditions
1. Vehicle must be in `active` state to be assigned
2. At least SOAT and technomechanical must be valid for assignment
3. Cannot assign same vehicle to overlapping dates
4. Check-out requires mileage reading and at least one photo

## Blockers
- BLOCKER-FLT-001: Expired SOAT → vehicle cannot be assigned
- BLOCKER-FLT-002: Expired technomechanical → vehicle cannot be assigned
- BLOCKER-FLT-003: Vehicle already assigned in date range → overlapping assignment blocked
- BLOCKER-FLT-004: Vehicle in maintenance → cannot assign

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/fleet` | List vehicles with readiness score |
| POST | `/api/fleet` | Register vehicle |
| GET | `/api/fleet/:id` | Get vehicle detail |
| PUT | `/api/fleet/:id` | Update vehicle |
| GET | `/api/fleet/:id/profile` | Full profile: info, docs, assignments, photos |
| POST | `/api/fleet/:id/documents` | Upload document |
| POST | `/api/fleet/:id/assign` | Assign to work order |
| POST | `/api/fleet/:id/check-in` | Check-in (return) |
| POST | `/api/fleet/:id/check-out` | Check-out (dispatch) |
| GET | `/api/fleet/dashboard` | Fleet overview with readiness |

## Screens
| Route | Component | Description |
|-------|-----------|-------------|
| `/fleet/list` | FleetList | Table: plate, brand, readiness badge, status |
| `/fleet/[id]` | FleetDetail | Profile: info, documents, assignments, photo gallery |
| `/fleet/[id]/assign` | FleetAssign | Assignment form with order/driver selector |
| `/fleet/dashboard` | FleetDashboard | Readiness gauge, expiry alerts, availability |

## UI States
| State | Visual | Behavior |
|-------|--------|----------|
| Loading | Skeleton | Card placeholders |
| Empty | Illustration | "No hay vehículos registrados" |
| Readiness 100% | Green badge | "Flota operativa" |
| Readiness < 100% | Yellow badge | "Documentos por vencer" |
| Readiness 0% | Red badge | "Vehículo no operable" |
| Document expiring | Orange warning | "SOAT vence en 15 días" |
| Document expired | Red critical | "Tecnomecánica vencida" |
| Active assignment | Blue badge | "Asignado a orden WOR-2026-0012" |

## Audit Events
- `fleet:vehicle.created` / `fleet:vehicle.updated`
- `fleet:document.uploaded` / `fleet:document.expired`
- `fleet:assignment.created` / `fleet:assignment.completed`
- `fleet:checkout` / `fleet:checkin` (with km reading)
- `fleet:readiness.changed` (with score delta)

## Negative Cases
| Scenario | Expected Behavior |
|----------|------------------|
| Assign vehicle with expired SOAT | 422 — "SOAT must be valid for assignment" |
| Overlapping assignment dates | 409 — "Vehicle already assigned in date range" |
| Check-out without mileage | 422 — "Mileage reading required for check-out" |
| Assign vehicle in maintenance | 422 — "Vehicle is in maintenance" |
| Upload document without expiry date | 422 — "Expiry date required for document type" |
| Delete vehicle with active assignments | 409 — "Cannot delete vehicle with active assignments" |

## E2E Tests
- TC-FLT-001: Register vehicle → verify in list with readiness
- TC-FLT-002: Upload SOAT with expiry → verify document list
- TC-FLT-003: Assign vehicle to order → status changes to assigned
- TC-FLT-004: Check-out → check-in → verify km log
- TC-FLT-005: Document expiry → readiness score decreases
- TC-FLT-006: Expired SOAT blocks assignment → 422
- TC-FLT-007: Dashboard shows correct fleet readiness
