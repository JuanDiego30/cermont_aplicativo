# Task 1 — MediaAsset inventory and disposition

Date: 2026-06-29
Branch: `refactor/spec-007-memory-innovation`
Decision: `FileAsset` remains the only file/media metadata aggregate.

## Dependency inventory

| File | Type | Import/reference | Line(s) | Action | Reason |
|---|---|---|---:|---|---|
| `packages/shared-types/src/schemas/media-asset.schema.ts` | Zod contract | Declares `MediaAssetRefSchema` and related enums/DTOs | 27–239 | Delete | Duplicates the canonical `FileAssetRefSchema`; exported only by its own barrel entry. |
| `packages/shared-types/src/schemas/index.ts` | Schema barrel | `export * from "./media-asset.schema"` | 49 | Remove export | Prevent the duplicate contract from entering the public API snapshot. |
| `backend/src/modules/media/models/MediaAsset.ts` | Mongoose model | Declares independent `MediaAsset` collection | 52–364 | Delete | Parallel persistence model; no external consumers and contains invalid `as any` escapes. |
| `backend/src/modules/media/media.service.ts` | Service | Imports `MediaAssetModel` and MediaAsset DTOs | 11–263 | Delete | Uses an invalid model import, duplicates FileAsset CRUD, and has no consumer outside this module. |
| `backend/src/modules/media/media.controller.ts` | HTTP controller | Delegates to `MediaService` | 7–114 | Delete | Only serves the duplicate `/api/media` routes and does not compile. |
| `backend/src/modules/media/media.routes.ts` | Express router | Declares five `/api/media` operations | 8–84 | Delete | Orphan API surface with no frontend client or tests. |
| `backend/src/index.ts` | Backend composition root | Imports `mediaRoutes`; mounts `/api/media` | 53, 233 | Remove import and mount | Desregister the duplicate API surface. |

Search scope: `backend`, `frontend`, `packages`, `docs`, `specs`, and `.sisyphus`, excluding `.git` and `node_modules`.

## Consumers and tests

- `frontend/src/modules/media`: absent.
- Frontend calls to `/api/media`: none.
- Tests importing `MediaAsset`, `media-asset`, or `/api/media`: none.
- Runtime consumers outside the duplicate module and its two registration lines: none.

## Capability disposition

| MediaAsset concept | Canonical FileAsset capability | Disposition |
|---|---|---|
| `ownerType` / `ownerId` | Required `entityType` / `entityId` | Do not migrate duplicate aliases. |
| `classification` | Typed `FileAssetCategory`, including evidence phases | Do not add an untyped second classification. |
| `lifecycleStatus=deleted` | `deletedAt` plus soft-delete-aware queries | Preserve existing FileAsset implementation. |
| `lifecycleStatus=pending_sync/sync_failed` | `syncStatus` | Preserve existing typed sync state. |
| `audit.downloadedBy` / consent arrays | Central append-only `AuditLog` service | Do not embed unbounded audit arrays. The MediaAsset methods have no callers, so no live behavior is removed. |
| `variants[]` | `thumbnailUrl` plus original content URL | Preserve the current bounded representation; variants require a separate vertical slice. |
| `deviceId` / `idempotencyKey` | `offlineLocalId` and `Idempotency-Key` upload handling | Preserve the existing idempotency mechanism. |
| `gpsLocation` | No current MediaAsset caller, UI, route, or domain requirement | Defer to an evidence-geolocation vertical slice rather than add an unused optional field. |
| `serviceCaseId` / `workOrderId` / `executionSessionId` | `entityType` / `entityId` | Do not migrate redundant foreign keys. |

## Verification conclusion

All executable behavior in the concurrent module is either duplicated by `FileAsset`, unreachable, or uncompilable. Removing the seven integration points above does not remove a working consumer-facing feature. Adding the proposed parallel aliases would violate the stated SSOT objective and the repository rule against duplicate schemas.
