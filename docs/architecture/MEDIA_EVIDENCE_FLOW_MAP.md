# MEDIA EVIDENCE FLOW MAP — Cermont S.A.S.

> **Generated**: 2026-06-29  
> **Source**: backend/src/modules/evidence/, frontend/src/modules/evidences/, backend/src/middlewares/uploadMiddleware.ts  
> **Purpose**: Complete trace of media/evidence from upload to delivery

---

## Flow Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Upload      │────▶│  Validation │────▶│  Processing  │────▶│   Storage   │
│   (React)   │     │  (multer)    │     │  (Zod+AV)   │     │  (sharp)     │     │  (local/S3) │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
       │                                                                                   │
       │                                                                                   ▼
       │                                                                           ┌──────────────┐
       │                                                                           │   Metadata    │
       │                                                                           │   (MongoDB)   │
       │                                                                           └──────────────┘
       │                                                                                   │
       ▼                                                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Delivery   │◀────│   Query      │◀────│   Populate  │◀────│   Reference  │◀────│   Evidence   │
│  (GET/:id)  │     │  (TanStack)  │     │  (Mongoose)  │     │   (URL)      │     │   Document   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
```

---

## Step 1: Frontend Upload

| Component | File | Function |
|-----------|------|----------|
| EvidenceUploader | `frontend/src/modules/evidences/ui/EvidenceUploader.tsx` | File input, drag-drop, preview |
| useUploadEvidence | `frontend/src/modules/evidences/hooks/useUploadEvidence.ts` | TanStack Query mutation |
| uploadEvidence | `frontend/src/modules/evidences/api/evidence.ts` | POST /api/evidences with FormData |

**Payload:**
```typescript
FormData {
  file: File,           // Image file (PNG, JPEG, WebP, GIF)
  orderId: string,      // Associated order
  type: string,         // before|during|after|defect|safety|signature
  description?: string,
  gpsLocation?: { lat, lng, accuracy, capturedAt },
  capturedAt: string,
  idempotencyKey?: string
}
```

---

## Step 2: Upload Middleware (multer)

| Component | File | Function |
|-----------|------|----------|
| uploadMiddleware | `backend/src/middlewares/uploadMiddleware.ts` | Multer MemoryStorage config |
| hasValidImageSignature | `backend/src/middlewares/uploadMiddleware.ts` | Magic-byte validation (PNG/JPEG/WebP/GIF) |
| scanWithClamAV | `backend/src/middlewares/uploadMiddleware.ts` | Malware scan (ClamAV) |
| MAX_FILE_SIZE | `backend/src/middlewares/uploadMiddleware.ts` | 20MB limit |

**Validation chain:**
1. Multer MemoryStorage → buffer in memory
2. Magic-byte check → reject non-image files
3. ClamAV scan → reject malware
4. Size check → reject >20MB

---

## Step 3: Processing (sharp)

| Component | File | Function |
|-----------|------|----------|
| processImageFile | `backend/src/modules/evidence/evidence.service.ts:187` | V1: compress to WebP, save |
| createEvidenceV2 | `backend/src/modules/evidence/evidence.service.ts:337` | V2: generate variants |

**V1 Processing:**
```
Input buffer → sharp().webp({ quality: 80 }) → saveFile() → { filename, url, sizeBytes }
```

**V2 Processing (3 variants):**
```
Input buffer
  ├─▶ sharp().webp({ quality: 90 }) → original.webp (full resolution)
  ├─▶ sharp().webp({ quality: 80 }) → {uuid}-web.webp (max 1200px)
  └─▶ sharp().resize(200,200).webp({ quality: 60 }) → {uuid}-thumb.webp (thumbnail)
```

---

## Step 4: Storage

| Component | File | Function |
|-----------|------|----------|
| saveFile | `backend/src/common/storage/local-storage.ts` | Save to local filesystem |
| FileAsset model | `backend/src/models/FileAsset.ts` | MongoDB metadata document |

**Storage path:** `backend/uploads/evidences/{uuid}.webp`  
**URL pattern:** `/api/files/{fileAssetId}/content`

**FileAsset document:**
```typescript
{
  filename: string,      // UUID filename
  originalName: string,  // Original filename
  mimeType: string,      // image/webp
  sizeBytes: number,
  url: string,           // /api/files/:id/content
  category: string,      // evidence
  entityType: string,    // Evidence
  entityId: string,      // Evidence document ID
  uploadedBy: ObjectId,
  createdAt: Date
}
```

---

## Step 5: Metadata (MongoDB)

| Component | File | Function |
|-----------|------|----------|
| Evidence model | `backend/src/models/Evidence.ts` | Mongoose schema |
| createEvidence | `evidence.service.ts:242` | V1: create evidence record |
| createEvidenceV2 | `evidence.service.ts:337` | V2: create with variants |

**Evidence document (V2):**
```typescript
{
  code: string,                    // EVID-{timestamp}
  phase: EvidencePhase,            // before|during|after|defect|safety|signature
  category: EvidenceCategory,      // photo|video|document|audio
  serviceCaseId: ObjectId,
  workOrderId?: ObjectId,
  executionSessionId?: ObjectId,
  description?: string,
  mimeType: string,
  sizeBytes: number,
  url: string,                     // Original file URL
  variants: [                      // Generated variants
    { url, variant, width, height, sizeBytes, uploadedAt }
  ],
  uploadedBy: ObjectId,
  uploadedByName: string,
  capturedAt: Date,
  offlineCapturedAt: Date,
  gpsLocation?: { lat, lng, accuracy, capturedAt },
  syncStatus: "pending"|"syncing"|"synced"|"failed",
  idempotencyKey?: string,
  deviceId?: string,
  verificationStatus?: "approved"|"rejected",
  verifiedAt?: Date,
  verifiedBy?: ObjectId,
  verificationComment?: string,
  deletedAt?: Date,
  lifecycleStatus: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Step 6: Query & Delivery

| Component | File | Function |
|-----------|------|----------|
| getEvidencesByOrderId | `evidence.service.ts:560` | List by order |
| listEvidences | `evidence.service.ts:612` | Paginated list with filters |
| getEvidenceById | `evidence.service.ts:677` | Single evidence |
| trackDownload | `evidence.service.ts:502` | Audit download |
| trackView | `evidence.service.ts:529` | Audit view |

**Delivery endpoints:**
```
GET  /api/evidences              → List (with visibility filter)
GET  /api/evidences/:id          → Detail (with order auth check)
POST /api/evidences/:id/download → Audit + return URL
POST /api/evidences/:id/view     → Audit + return detail
GET  /api/files/:id/content      → Serve binary (authenticated)
```

---

## Step 7: Authorization

| Function | File | Logic |
|----------|------|-------|
| hasGlobalEvidenceAccess | `evidence.service.ts:78` | ADMIN_PLUS_RESIDENTE roles |
| getAccessibleOrderIds | `evidence.service.ts:82` | Orders where user is creator/assignee/supervisor |
| buildEvidenceVisibilityFilter | `evidence.service.ts:96` | $or filter for order-scoped access |
| assertEvidenceOrderAccess | `evidence.service.ts:109` | Verify user can access evidence's order |

**Access rules:**
- `gerente`, `residente`: Global access (all evidences)
- `supervisor`, `operador`, `tecnico`: Order-scoped (createdBy/assignedTo/supervisedBy)
- `administrativo`: No evidence access
- `cliente`: No evidence access

---

## Step 8: Audit Trail

| Action | Audit Event | Trigger |
|--------|-------------|---------|
| Upload | EVIDENCE_UPLOADED | createEvidence, createEvidenceV2 |
| Delete | EVIDENCE_DELETED | deleteEvidence |
| Verify | EVIDENCE_VERIFIED / EVIDENCE_REJECTED | verifyEvidence |
| Download | EVIDENCE_PDF_DOWNLOADED | trackDownload |
| View | EVIDENCE_FILE_VIEWED | trackView |

---

## Key Files Reference

| Layer | File | Purpose |
|-------|------|---------|
| Backend Model | `backend/src/models/Evidence.ts` | Mongoose schema |
| Backend Service | `backend/src/modules/evidence/evidence.service.ts` | Business logic (846 lines) |
| Backend Routes | `backend/src/modules/evidence/evidence.routes.ts` | Endpoint wiring |
| Backend Controller | `backend/src/modules/evidence/evidence.controller.ts` | HTTP layer |
| Upload Middleware | `backend/src/middlewares/uploadMiddleware.ts` | Multer + validation |
| Storage | `backend/src/common/storage/local-storage.ts` | File system save |
| Frontend Hook | `frontend/src/modules/evidences/hooks/useUploadEvidence.ts` | Upload mutation |
| Frontend UI | `frontend/src/modules/evidences/ui/EvidenceUploader.tsx` | Upload component |
| Frontend API | `frontend/src/modules/evidences/api/evidence.ts` | API client |

---

## V1 vs V2 Comparison

| Feature | V1 (legacy) | V2 (current) |
|---------|-------------|--------------|
| Upload endpoint | POST /api/evidences | POST /api/evidences (same) |
| Variants | Single file | 3 variants (original, web, thumbnail) |
| Service case linkage | orderId only | serviceCaseId + workOrderId + executionSessionId |
| Offline support | No | Yes (syncStatus, deviceId, idempotencyKey) |
| GPS | Basic | Enhanced (accuracy, capturedAt) |
| Phases | type string | phase + category enums |
| File processing | sharp().webp(80) | 3 sharp operations with different sizes |

---

## T13 Verified Gaps

1. `FileAsset` is already the canonical generic file engine; a parallel `MediaAsset` model or `/api/media` route would duplicate it.
2. Resolved by Spec 009: the owner enum and backend parent registry cover planning, document, work order, service case, execution session, checklist execution/item, report, fleet and resource owners.
3. `tool` ownership currently resolves through `Resource`, not the separate `Tool` model.
4. Vehicle media support was added in the Spec 007 slice: `vehicle` + `vehicle_image` contracts, Vehicle parent linkage, and Fleet adapter routes over FileAsset.
5. `/api/files/:id` and `/api/files/:id/content` enforce internal-role RBAC; client users remain outside the perimeter. Offline idempotency is scoped by owner, entity and uploader, and every content download is audited.

Evidence remains a workflow/domain record linked to FileAssets; it is not merged into the storage metadata collection. The duplicate `/api/media` module was retired in Spec 009.
