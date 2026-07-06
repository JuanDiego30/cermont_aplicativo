# FILE OWNERSHIP — SPEC-022

## Legend
- [S0] = Sprint 0 (Protection)
- [S1] = Sprint 1 (ServiceCase Cockpit)
- [S2] = Sprint 2 (Field Execution + Evidence FSM)
- [S3] = Sprint 3 (Dashboard OS)
- [S4] = Sprint 4 (Planning Readiness)
- [S5] = Sprint 5 (Automation Rules MVP)
- [SPEC-021] = Owned by prior spec

## Ownership Map

### Coordination (S0 - shared)
docs/coordination/WORK_REGISTRY.md
docs/coordination/AGENT_HANDOFF.md
docs/coordination/FILE_OWNERSHIP.md
docs/coordination/CONFLICTS.md
docs/coordination/DELETION_LOG.md
.sisyphus/locks/*.lock.md
.sisyphus/patches/*.patch

### Shared-Types (S1-S5)
packages/shared-types/src/schemas/service-case-cockpit.schema.ts [S1]
packages/shared-types/src/schemas/execution-session.schema.ts [S2]
packages/shared-types/src/schemas/dashboard-summary.schema.ts [S3]
packages/shared-types/src/schemas/planning-packet.schema.ts [S4]
packages/shared-types/src/schemas/automation.schema.ts [S5]

### Domain (S1-S5)
packages/domain/src/operational-steps.ts [S1]
packages/domain/src/workflow/ [S1]

### Backend Modules
backend/src/modules/service-cases/ [S1]
backend/src/modules/execution-session/ [S2]
backend/src/modules/evidence/ [S2]
backend/src/modules/dashboard/ [S3]
backend/src/modules/planning-packet/ [S4]
backend/src/modules/automation/ [S5]

### Frontend Modules
frontend/src/modules/cockpit/ [S1]
frontend/src/modules/service-cases/ui/ [S1]
frontend/src/modules/execution/ [S2]
frontend/src/modules/evidences/ [S2]
frontend/src/modules/dashboard/ [S3]
frontend/src/modules/planning/ [S4]
frontend/src/modules/automation/ [S5]

## Shared Files (multiple sprints may read but only owner modifies)
packages/domain/src/index.ts [SPEC-021, owner; S1-S5 may extend exports]
packages/shared-types/src/schemas/index.ts [shared, coordinate via CONFLICTS.md]
backend/src/index.ts [shared, coordinate via CONFLICTS.md]
