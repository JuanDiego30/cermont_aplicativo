# Module: Planning & Readiness

## Business Problem
Compuerta industrial previa a la ejecución: garantizar que toda orden de trabajo tenga personal cualificado, equipos calibrados, herramientas, EPP, certificaciones vigentes, AST/ATS/PTW aprobados y firmas HES. Sin planeación formal se ejecuta con recursos faltantes → retrabajo, incidentes, no conformidades en auditoría.

## Roles
| Role | Responsibility |
|------|---------------|
| `PLANNING_ACCESS_ROLES` | gerente, residente, supervisor, supervisor_electricista, coord_administrativo — CRUD |
| `MANAGEMENT_ROLES` | gerente, residente — approval |
| HES | Safety document review, ATS/AST/PTW signature |

## Use Cases
1. Create planning packet — schedule, crew, tools, equipment, materials, EPP, certifications
2. Apply kit template — snapshot professional kit → auto-populate resources
3. Crew assignment — personnel with certification validation
4. Certification verification — all required certs valid and current
5. Equipment calibration check — within valid date range
6. Safety document management — ATS, AST, PTW, procedures
7. Readiness gate — compute score with blockers (critical/error/warning)
8. Approval — HES sign → Resident/Gerente approve → Ready for execution
9. Kit lifecycle — create, version, activate, archive, void kit templates
10. Cost baseline freeze — snapshot estimated labor, material, equipment, contingency costs

## Entities
- **PlanningPacket** — schedule, crew, tools, equipment, materials, EPP, certifications, sign-offs, readiness, cost baseline
- **PlanningKitSnapshot** — snapshot of kit template applied to packet
- **CrewMember** — { userId, name, role, certificationIds[] }
- **PlanningSchedule** — { plannedStartAt, plannedEndAt, estimatedDurationHours }
- **PlanningResourceLine** — { description, quantity, unit }
- **PlanningTool** — { name, quantity, available, specifications? }
- **PlanningEquipment** — equipment with calibration tracking
- **WorkerRequirements** — counts per trade (electricistas, técnicos, instrumentistas, obreros)
- **RequiredCertification** — certification required per role
- **SupportDocument** — ATS, AST, PTW, procedures, checklists
- **ReadinessCheckItem** — boolean readiness checklist
- **CostBaselineSnapshot** — frozen cost estimate
- **KitTemplate** — reusable kit with items, safety rules, readiness rules

Schema files: `packages/shared-types/src/schemas/planning-packet.schema.ts`, `kit.schema.ts`

## States
**PlanningPacket:** `draft` → `incomplete` → `ready` → `blocked` → `approved`
**Kit:** `draft` → `active` → `archived` → `voided`

## Transitions
| From | To | Action | Guard |
|------|----|--------|-------|
| draft | incomplete/ready | (edit) | Packet exists |
| incomplete | ready | All requirements met | Readiness gate passes |
| ready | blocked | Blocker detected | Missing critical/error item |
| blocked | ready | Blocker resolved | All blockers cleared |
| ready | approved | approve | HES + resident signs, zero blockers |
| approved | draft | reopen | MANAGEMENT_ROLES |

## Preconditions (Readiness)
- Schedule defined (plannedStartAt, plannedEndAt, estimatedDurationHours)
- Labor assigned (crew with roles)
- Tools, equipment, materials assigned
- Safety elements defined (PPE, EPP)
- Certifications verified (personnel + equipment)
- Required documents uploaded (ATS, AST, PTW, procedures, checklists)

## Blockers (from `planning.rules.ts`)
| Code | Severity |
|------|----------|
| MISSING_SCHEDULE | error |
| MISSING_LABOR | error |
| MISSING_TOOLS | warning |
| MISSING_EQUIPMENT | warning |
| MISSING_MATERIALS | warning |
| MISSING_SAFETY | critical |
| MISSING_CERTIFICATIONS | error |
| MISSING_DOC_* | error |
| MISSING_CHECKLISTS | warning |

## Permissions
| Action | Required Role |
|--------|---------------|
| Create/Edit packet | PLANNING_ACCESS_ROLES |
| View packet | INTERNAL_ROLES |
| Validate readiness | PLANNING_ACCESS_ROLES + HES |
| Approve | MANAGEMENT_ROLES |
| Sign HES | HES |
| Apply kit template | PLANNING_ACCESS_ROLES |
| Create/Edit kit | gerente, residente |

## Endpoints
| Method | Path |
|--------|------|
| GET/POST | /api/planning-packets |
| GET/PATCH | /api/planning-packets/:id |
| POST | /api/planning-packets/:id/validate-readiness |
| POST | /api/planning-packets/:id/approve |
| POST | /api/planning-packets/:id/reopen |
| POST | /api/planning-packets/:id/apply-kit |
| POST | /api/planning-packets/:id/reference-documents |
| GET/POST/PUT | /api/kits |
| POST | /api/kits/:id/activate |
| POST | /api/kits/:id/archive |
| POST | /api/kits/:id/duplicate |

Backend: `backend/src/modules/planning-packet/planning-packet.{routes,controller,service}.ts`, `planning-readiness.service.ts`

## Screens
| Route | Component |
|-------|-----------|
| /planning/list | PlanningList |
| /planning/[id] | PlanningDetail (tabs) |
| /planning/new | PlanningWizard (6-step) |
| /resources/kits | KitList |

Frontend: `frontend/src/modules/planning/` — 20+ UI files, queries.ts, helpers/

## UI States
- **Loading** — wizard skeletons, readiness gate spinner
- **Empty** — no packet for order (create prompt)
- **Blocked** — red readiness gate with blocker list + severity icons
- **Warning** — yellow banner for expiring certs/calibrations
- **Approved** — green badge with approval metadata (who, when)
- **Wizard** — progress indicator, enabled/disabled steps

## Audit Events
`planning.created`, `planning.updated`, `planning.kit_applied`, `planning.readiness_checked`, `planning.approved`, `planning.reopened`, `kit.created`, `kit.activated`, `kit.archived`, `kit.voided`

## Negative Cases
| Scenario | Handling |
|----------|----------|
| Missing required field | Validation error per field |
| Expired certification | Blocker with cert name + expiry |
| Equipment out of calibration | Warning/blocker |
| Kit not active | Blocker: "Only active kits can be applied" |
| Approval without readiness | Blocker list with all unmet conditions |
| Double approval | No-op with status message |

## E2E Tests
- PL-01: Create packet → verify readiness
- PL-02: Readiness gate — missing safety → critical blocker
- PL-03: Kit application — create kit, apply, verify snapshot
- PL-04: Approval flow — HES signs → resident approves
- PL-05: Certification validation — expired cert → blocker
- PL-06: Kit lifecycle — draft → active → archive → restore → void
