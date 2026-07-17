# Planning packet route audit

Date: 2026-07-10
Scope: `frontend/src/app/(dashboard)/planning-packet/new/`

## Evidence

- `page.tsx` imports only `CaseSelector` and the canonical `@/modules/planning/ui/PlanningWizard`.
- `CaseSelector.tsx` is consumed by `page.tsx` and remains active.
- No source file under `frontend/src/` imports the legacy presentation files or `shared-types.ts`.
- The canonical planning implementation is `frontend/src/modules/planning/ui/`.
- `git log` shows the route was recently migrated to the extracted `CaseSelector`; the legacy files have no current consumer.

## Decisions

| File | Classification | Decision | Reason |
|---|---|---|---|
| `CaseSelector.tsx` | Active | Keep | Imported by the route page |
| `page.tsx` | Active | Keep | Route entry point; renders canonical wizard |
| `PlanningPacketBasicInfo.tsx` | Duplicate/dead | Delete | Replaced by `ScheduleStep` |
| `PlanningPacketResources.tsx` | Duplicate/dead | Delete | Replaced by `ResourcesStep` |
| `PlanningPacketSafety.tsx` | Duplicate/dead | Delete | Replaced by `SafetyStep` |
| `PlanningPacketSchedule.tsx` | Duplicate/dead | Delete | Replaced by `ScheduleStep` and `WorkersTab` |
| `PlanningPacketSignatures.tsx` | Duplicate/dead | Delete | Replaced by wizard signature defaults and `ReviewStep` |
| `constants.ts` | Duplicate/dead | Delete | Only imported by deleted legacy components |
| `shared-components.tsx` | Duplicate/dead | Delete | Only imported by deleted legacy components |

The route directory now contains only its active entry point and active case selector. No navigation change was required.
