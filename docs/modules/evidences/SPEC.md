# Module: Evidence & Files

## Business Problem
Sistema seguro de evidencias de ejecución: fotos, videos, audio, documentos firmados como prueba de servicio. Deben capturarse offline, subirse con integridad (hash SHA-256, magic bytes), verificarse y pasar por flujo de revisión. Sin este módulo las evidencias se pierden, adulteran o desvinculan de la orden → disputas de pago y no conformidades.

## Roles
| Role Group | Roles |
|------------|-------|
| `EVIDENCE_ACCESS_ROLES` | gerente, residente, hes, auxiliar_hes, supervisor, supervisor_electricista, operador, tecnico, tecnico_electricista, oficial_construccion |
| `SUPERVISORY_ROLES` | gerente, residente, supervisor — review/verify/delete |

## Use Cases
1. Capture photo/video/audio evidence (offline-safe with IndexedDB blob outbox)
2. Upload file with integrity verification (SHA-256, magic bytes, MIME whitelist)
3. Attach evidence to execution step/session
4. Review evidence (approve/reject with comment)
5. Replace rejected evidence with corrected version
6. Bulk upload from collection
7. Verify file integrity via hash
8. Download evidence with audit trail
9. Auto-route evidence to closing collection
10. Delete evidence (soft delete with retention)

## Entities
- **Evidence** — orderId, type, filename, url, mimeType, sizeBytes, hash, GPS metadata, phase (before/during/after/correction/hse), FSM status (captured/uploaded/pending_review/approved/rejected/replacement_requested/locked/archived), rejection tracking via `statusObject`, replacement tracking, lock tracking
- **EvidenceCollection** — grouped evidence for a step/deliverable
- **FileAsset** — raw file stored with Multer, original name, path, hash, upload timestamp

Schema files: `packages/shared-types/src/schemas/evidence.schema.ts`, `evidence-collection.schema.ts`

## States
`captured` → `uploaded` → `pending_review` → `approved` | `rejected` → `replacement_requested` → `uploaded`

## Transitions
| From | To | Trigger | Guard |
|------|----|---------|-------|
| captured | uploaded | Sync from offline queue | File passes magic bytes + MIME |
| uploaded | pending_review | Reviewer picks up | — |
| pending_review | approved | Reviewer approves | — |
| pending_review | rejected | Reject with reason | reason >= 3 chars |
| rejected | replacement_requested | Re-upload corrected | Must reference original ID |
| replacement_requested | uploaded | Upload completes | — |
| approved | locked | (lock action) | SUPERVISORY_ROLES |

## Preconditions
- File must pass magic bytes validation (first 12 bytes against known signatures)
- File size within limits: photos 25 MB, videos 200 MB, audio 50 MB, PDF 25 MB
- SHA-256 hash computed before storage (client-side for offline, server-side for verification)
- Evidence linked to existing execution session or step
- File extension must match detected MIME type
- MIME whitelist: image/jpeg, image/png, image/webp, video/mp4, audio/mp3, application/pdf

## Blockers
| Code | Condition |
|------|-----------|
| BLOCKER-001 | Magic bytes mismatch → upload rejected |
| BLOCKER-002 | File exceeds max size → 413 |
| BLOCKER-003 | Duplicate evidence for same step/type |
| BLOCKER-004 | Review empty collection |
| BLOCKER-005 | Offline blob outbox full |
| BLOCKER-006 | Hash mismatch → corrupted file → re-upload |

## Permissions
| Action | Roles |
|--------|-------|
| Upload (POST) | operador, tecnico, supervisor |
| List/View | INTERNAL_ROLES |
| Review (approve/reject) | SUPERVISORY_ROLES |
| Verify hash | SUPERVISORY_ROLES |
| Delete | SUPERVISORY_ROLES |
| Replace | EVIDENCE_ACCESS_ROLES |

## Endpoints
| Method | Path |
|--------|------|
| POST | /api/evidences (multipart) |
| GET | /api/evidences |
| GET | /api/evidences/order/:orderId |
| GET | /api/evidences/order/:orderId/gallery |
| GET | /api/evidences/:id |
| DELETE | /api/evidences/:id |
| POST | /api/evidences/:id/verify |
| POST | /api/evidences/:id/review |
| POST | /api/evidences/:id/replace |
| POST | /api/evidences/:id/download |
| POST | /api/evidences/:id/view |
| POST | /api/evidence-collections |

Backend: `backend/src/modules/evidence/evidence.{routes,controller,service}.ts`, `evidence-collection.{routes,controller,service}.ts`

## Screens
| Route | Component |
|-------|-----------|
| /evidences/list | EvidenceList |
| /evidences/[id] | EvidenceDetail |

Frontend: `frontend/src/modules/evidences/` — hooks/, keys.ts, model/, queries.ts, ui/ (CameraCapture, EvidenceUploader, EvidenceApprovalPanel, EvidenceGallery, QRScanner, etc.)

## UI States
- **Loading** — skeleton gallery
- **Empty** — "No evidence captured yet"
- **Uploading** — progress bar per file
- **Offline** — queue badge "3 files pending sync" (IndexedDB blob outbox)
- **Validation Error** — red border + message
- **Under Review** — yellow badge
- **Approved** — green badge
- **Rejected** — red badge + reason
- **Hash Mismatch** — error dialog "File may be corrupted"

## Audit Events
`evidence.uploaded`, `evidence.review.started`, `evidence.approved`, `evidence.rejected`, `evidence.replaced`, `evidence.deleted`, `evidence.hash.verified`, `evidence.collection.routed`, `evidence.sync.completed`

## Negative Cases
| Scenario | Expected |
|----------|----------|
| Upload with faked extension | Magic bytes mismatch → reject |
| Upload exceeding size limit | 413 "File too large" |
| Review empty collection | 422 "Cannot approve empty collection" |
| Verify corrupted file | Return mismatch, suggest re-upload |
| Network failure during upload | Exponential backoff retry (3 attempts) |

## E2E Tests
- TC-EVI-001: Upload photo → status=uploaded
- TC-EVI-002: Reject → re-upload → status=uploaded
- TC-EVI-004: Magic bytes rejects forged types
- TC-EVI-005: Offline capture → sync online → appears in list
- TC-EVI-007: Hash mismatch triggers re-upload
- TC-EVI-009: Review workflow uploaded→pending_review→approved

## Acceptance Evidence
- All uploaded files pass magic bytes + MIME validation
- SHA-256 hash computed and stored per file
- Review workflow cycles through all states
- Blob outbox queues offline captures and syncs reliably
