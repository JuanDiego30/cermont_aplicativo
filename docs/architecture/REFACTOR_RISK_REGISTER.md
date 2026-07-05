# Refactor Risk Register — Spec 007

**Generated:** 2026-06-29  
**Method:** source inspection with `rg` and targeted reads; no codebase-memory graph was available.  
**Rule:** each item below has a reproducible repository receipt.

| # | Risk | Module | Evidence | Impact | Proposed refactor | Priority |
|---:|---|---|---|---|---|---|
| 1 | Spec and evidence artifacts are invisible to normal Git status | repository hygiene | `.gitignore:195` ignores `.sisyphus/`; `.gitignore:294` ignores every `*.md` | Work can appear complete locally while no reviewable artifact reaches the branch | Force-add the approved Spec 007 Markdown/evidence set or replace the broad ignore rules in a separately approved hygiene change | P0 |
| 2 | Requested structural MCP is absent | agent navigation | `specs/007-codebase-memory-innovation-cermont/codebase-memory-setup.md` records command/config checks | Maps lack persistent call-graph guarantees; future agents may mistake manual maps for indexed facts | Install a pinned/checksummed binary in a separately reviewed setup, restart the agent, then reconcile graph output | P1 |
| 3 | Canonical frontend route document contradicts itself | documentation | `FRONTEND_ROUTE_MAP.md:69,141-145,153-154,162-163` say `REQUIRED_NOT_IMPLEMENTED`; lines 286 and 290 claim zero | Agents can hide real gaps or recreate implemented routes | Generate status from filesystem/API receipts and remove the hand-maintained contradictory summary | P0 |
| 4 | Canonical API matrix is materially incomplete | documentation/API | `API_ENDPOINT_MATRIX.md:349-369` states 389 routes but documents about 100 and requests a rewrite | Endpoint impact analysis and RBAC review are unreliable | Generate a route inventory from mounted routers, then enrich incrementally with schema/RBAC/consumer links | P0 |
| 5 | RESOLVED — Fleet photo UI called four absent endpoints | fleet/frontend/backend | Fleet adapter routes and service now delegate to FileAsset | Vehicle gallery has a real backend flow | Covered by fleet/file service tests | Closed |
| 6 | RESOLVED — Fleet photo DTO invented `_id` while FileAsset uses `id` | fleet/frontend/contracts | `VehiclePhotoSchema` and gallery component use canonical `id` | Mutation identifiers are aligned | Covered by component and schema tests | Closed |
| 7 | FileAsset contract accepts owners the service cannot persist | files/contracts | allowed types at `file-asset.schema.ts:64-67`; parent registry starts at `files.service.ts:100` and lacks planning/checklist/order/execution handlers | Valid requests fail with `ENTITY_TYPE_NOT_SUPPORTED` after upload processing | Make supported-owner contract equal the registry or implement every advertised parent adapter | P0 |
| 8 | `tool` FileAsset ownership points at `Resource`, not the `Tool` model | files/tools | `files.service.ts:110`; separate `backend/src/models/Tool.ts` and `/api/tools` module exist | Uploads for a Tool ID can report parent-not-found or attach to the wrong aggregate | Decide canonical Tool vs Resource aggregate and migrate before extending tool media | P0 |
| 9 | Tool persistence bypasses strict contracts | tools/MongoDB | `Tool.ts:167-170` uses `Schema.Types.Mixed`; `tool.service.ts:24,38,209-216` uses `unknown` containers and double casts | Invalid shapes enter MongoDB and contract drift is hidden | Replace Mixed with typed sub-schemas and remove local command DTO/casts using shared Zod inputs | P0 |
| 10 | Vehicle readiness has multiple enforcement paths | fleet/domain | frontend calculates `evaluateFleetReadiness`; `fleet.service.ts` separately checks only SOAT/technical inspection during assignment | UI can say blocked while backend permits an unsafe assignment, or vice versa | Expose a server readiness endpoint and call the same `@cermont/domain` rule in mutation guards | P0 |
| 11 | Fleet detail bypasses its feature API/query-key factory | fleet/frontend | `frontend/src/app/(dashboard)/fleet/[id]/page.tsx:15,62-64` calls `apiClient` and hardcodes `['vehicle', id]` | Cache invalidation is fragmented and module boundaries erode | Add `getVehicle` and `useVehicle` to the fleet module and centralize keys | P1 |
| 12 | File metadata/content authorization is role-only | files/security | `files.routes.ts:26,55,58,61` authorizes any internal role; no owner/order scope appears in these routes | Knowing a file ID can expose a different order/client's binary or metadata to an unrelated internal user | Add a service-level authorization root check per `entityType/entityId` before metadata/content/delete | P0 |
| 13 | Hardcoded seed credential remains in tracked source | seed/security | `backend/src/scripts/seed.ts:36-37` defines a fallback credential | Reuse or accidental production seeding creates predictable access | Require `SEED_DEFAULT_PASSWORD` and fail closed outside explicit local test/dev seeding | P0 |
| 14 | Tool and Resource represent overlapping tool domains | assets/tools | `/api/tools` uses `Tool`; `/tools` is documented/implemented through `/api/resources?type=tool`; Tool model comment points to `resource.schema.ts` | Duplicate records, divergent certifications, and ambiguous ownership | Record an ADR selecting the aggregate and provide migration/compatibility endpoints | P1 |
| 15 | Audit/history designs proposed unbounded parent arrays | Spec 007 design | rejected T10/T11 drafts proposed `downloadedBy[]`, `maintenanceHistory[]`, and `assignmentHistory[]` | Parent documents grow indefinitely and risk the MongoDB 16 MB limit/write amplification | Use indexed referenced audit/event collections and keep bounded current-state snapshots on parent documents | P0 |
| 16 | Generated maps overstate verification | documentation | `CODEBASE_MAP.md` labels modules verified while current maps miss the fleet photo gap and FileAsset owner mismatch | Agents may trust a status label without tracing the consumer | Add file/line receipts, generation command, and verification date for every high-risk row | P1 |

## Immediate execution order

1. Close risks 5–8 with the vehicle FileAsset adapter slice.
2. Add owner-scope authorization tests before broadening media adoption (risk 12).
3. Make readiness server-authoritative (risk 10).
4. Decide Tool vs Resource ownership before tool expansion (risks 8, 9, 14).
5. Regenerate canonical route/API summaries from code (risks 3, 4, 16).
6. Remove the seed fallback before the next production seed operation (risk 13).
