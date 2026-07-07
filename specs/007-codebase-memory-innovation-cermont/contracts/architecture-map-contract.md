# Unified Media/Evidence Engine — Corrected Contract

**Task:** T10  
**Status:** DESIGN_APPROVED  
**Source of truth reviewed:** `file-asset.schema.ts`, `FileAsset.ts`, `files.service.ts`, `files.routes.ts`, `Evidence.ts`, offline blob outbox.

## Decision

`FileAsset` remains the single metadata/storage engine. Spec 007 will not create a `MediaAsset` collection, duplicate `ownerType/ownerId`, or add a parallel `/api/media` API.

The earlier draft was rejected because:

- `entityType/entityId` already provides polymorphic ownership;
- `/api/files` already implements validated online/offline upload, authenticated content delivery, checksums, soft deletion, parent linkage, and audit events;
- `Evidence` is a business record with approval and workflow semantics, not merely a file, so it must not be collapsed into `FileAsset`;
- embedding `downloadedBy[]` would create an unbounded audit array; downloads belong in the immutable `AuditLog` collection;
- a second endpoint family would violate the repository's no-duplicate-route and SSOT rules.

## Target architecture

```text
Domain record (Evidence, Vehicle, Tool, Document, ...)
  └─ bounded FileAssetRef[] for convenient rendering
       └─ canonical FileAsset document
            └─ binary outside web root

POST /api/files/upload
GET  /api/files?entityType&entityId&category
GET  /api/files/:id/content
DELETE /api/files/:id
```

Domain-specific endpoints may act as thin adapters when they add domain behavior, but storage and file metadata must delegate to the existing files service.

## First implementation slice: vehicle media adapter

The current frontend calls four non-existent routes under `/api/fleet/:id/photos`. The first slice closes that real gap without introducing a second media engine.

### Contract additions

1. Add `vehicle` to `FileAssetEntityType`.
2. Add `vehicle_image` to `FileAssetCategory` and its preset.
3. Add a bounded `fileAssets: FileAssetRef[]` field to `VehicleSchema` and the Mongoose vehicle model.
4. Add `primaryPhotoId` to the vehicle contract/model as a single optional file identifier. Primary status belongs to the vehicle aggregate, not to every media record.
5. Keep existing FileAsset response identifiers (`id`), never invent `_id` in frontend media DTOs.

### Fleet adapter endpoints

| Method | Endpoint | Behavior | RBAC |
|---|---|---|---|
| GET | `/api/fleet/:id/photos` | Validate vehicle and list `vehicle_image` FileAssets | Internal roles |
| POST | `/api/fleet/:id/photos` | Reuse upload middleware and `createFileAssetFromUpload` with `entityType=vehicle` | Management roles + upload limiter |
| PATCH | `/api/fleet/:id/photos/:photoId/primary` | Verify photo ownership, set `Vehicle.primaryPhotoId` | Management roles |
| DELETE | `/api/fleet/:id/photos/:photoId` | Verify ownership, soft-delete through files service, clear primary when needed | Management roles |

The generic `/api/files` endpoints remain canonical. The fleet routes are a domain façade retained because an existing UI already consumes them and they enforce vehicle ownership.

## Security invariants

- A photo identifier must resolve to `entityType=vehicle` and the requested vehicle ID before mutation.
- Upload keeps MIME, extension, magic-byte, size, rate-limit, and malware checks from the existing pipeline.
- Content continues through authenticated `/api/files/:id/content`; `/uploads` remains private.
- Every upload, deletion, and primary-photo change emits an audit event.
- No embedded download/view history is added.

## Offline/PWA invariants

- The blob outbox continues to submit to `/api/files/offline-upload`.
- `vehicle` becomes a valid FileAsset owner without adding another offline queue.
- Existing idempotency through `offlineLocalId` remains unchanged.

## TDD acceptance tests

1. Shared contract accepts `vehicle` + `vehicle_image` and rejects unsupported values.
2. Upload delegates to the files service and appends the returned ref to the vehicle.
3. Cross-vehicle primary/delete attempts return a typed authorization/domain error.
4. Deleting the primary photo clears `primaryPhotoId`; deleting another photo does not.
5. Fleet frontend maps `FileAssetRef.id` correctly and renders loading, error, empty, and populated states.
6. Existing file-asset, fleet, upload-security, and offline tests remain green.

## Deferred work

- Video/audio support.
- Storage-provider abstraction beyond the existing local implementation.
- Image variant generation beyond `thumbnailUrl`.
- Per-download audit events after an explicit privacy/retention decision.
- Migrating evidence UI to shared gallery primitives; first prove the vehicle adapter.
