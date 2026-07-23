# Module: Client Acceptance & Signature

## Business Problem
After the delivery record is sent (Step 9), the client must formally accept the delivered work. This acceptance is captured via a legally valid digital signature — drawn on a canvas (touch or mouse), stored as PNG with metadata (IP, user agent, GPS, SHA-256 hash), and linked to the delivery record. Once signed, the acceptance triggers the administrative billing chain (SES creation). Without this module, there is no binding client approval to proceed with invoicing, causing payment delays and legal exposure.

## Roles
| Role | Can Capture | Can List/View | Can Verify | Can Reject |
|------|------------|---------------|------------|------------|
| gerente | ✅ | ✅ | ✅ | ✅ |
| residente | ✅ | ✅ | ✅ | ✅ |
| coord_administrativo | ❌ | ✅ | ❌ | ❌ |
| auxiliar_contable | ❌ | ✅ | ❌ | ❌ |
| supervisor | ❌ | ❌ | ❌ | ❌ |
| hes | ❌ | ❌ | ❌ | ❌ |
| auxiliar_hes | ❌ | ❌ | ❌ | ❌ |
| supervisor_electricista | ❌ | ❌ | ❌ | ❌ |
| tecnico_electricista | ❌ | ❌ | ❌ | ❌ |
| operador | ❌ | ❌ | ❌ | ❌ |
| tecnico | ❌ | ❌ | ❌ | ❌ |
| oficial_construccion | ❌ | ❌ | ❌ | ❌ |
| administrativo | ❌ | ✅ | ❌ | ❌ |
| pasante | ❌ | ❌ | ❌ | ❌ |
| cliente | ✅ | ✅ | ❌ | ❌ |

## Use Cases
- UC-ACS-01: List signatures with filters (contextType, contextId, status, clientId, date range)
- UC-ACS-02: View signature detail with full metadata (GPS, IP, user agent, hash)
- UC-ACS-03: Capture client signature via canvas (SignaturePad) — touch + mouse
- UC-ACS-04: Capture signature with GPS location metadata
- UC-ACS-05: Verify signature authenticity (management review)
- UC-ACS-06: Reject signature with structured reason
- UC-ACS-07: Idempotent signature capture (by clientMutationId)

## Entities
| Entity | Schema File | Description |
|--------|------------|-------------|
| ClientSignature | `packages/shared-types/src/schemas/client-signature.schema.ts` | Digital signature: client info, capture method, PNG image, GPS, IP, status |

Code format: `SIG-{YYYY}-{NNNN}`

## States
```
pending → captured → verified → rejected → expired
               ↓
           rejected
```

| State | Meaning |
|-------|---------|
| pending | Signature requested but not yet captured |
| captured | Client signed (PNG base64 via canvas) — awaiting verification |
| verified | Management verified the signature — ready for SES trigger |
| rejected | Signature rejected — reason required |
| expired | Signature token/link expired without action |

## Transitions
| From | To | Trigger | Guard |
|------|----|---------|-------|
| pending | captured | Client draws signature on canvas, taps "Save" | PNG must pass magic bytes + ≤2 MB + must have clientName |
| captured | verified | Management verifies authenticity | Must be management role (gerente/residente) |
| captured | rejected | Management rejects with reason | Rejection reason required (min 5 chars) |
| verified | - | Terminal state — triggers SES creation | Delivery record must be signed |
| rejected | - | Terminal state — requires re-capture | New signature must be requested |

## Preconditions
1. Delivery record must exist and be in `sent` state before signature can be captured
2. Client must be identifiable (clientId, clientName at minimum)
3. Signature context must resolve to a valid DeliveryRecord or TechnicalReport
4. Device must have canvas support for signature capture
5. Client must consent to digital signature capture (GPS, IP, user agent)

## Blockers
- BLOCKER-ACS-001: Delivery record not in `sent` state → cannot accept
- BLOCKER-ACS-002: Signature already captured for this context → idempotent check via clientMutationId
- BLOCKER-ACS-003: Canvas unavailable (no PointerEvent support) → fallback to uploaded image
- BLOCKER-ACS-004: Image exceeds 2 MB → reject with "Signature too large"
- BLOCKER-ACS-005: Image not valid PNG → reject with format error
- BLOCKER-ACS-006: Signature expired (token/ TTL) → request new signature
- BLOCKER-ACS-007: GPS unavailable → allow capture but log warning

## Permissions
| Action | gerente | residente | cliente | admin | coord_admin |
|--------|:-------:|:---------:|:-------:|:-----:|:-----------:|
| List signatures | ✓ | ✓ | | ✓ | ✓ |
| View signature detail | ✓ | ✓ | ✓ | ✓ | ✓ |
| Capture signature | ✓ | ✓ | ✓ | | |
| Verify signature | ✓ | ✓ | | | |
| Reject signature | ✓ | ✓ | | | |

## Contracts

### Zod Schemas
- `client-signature.schema.ts` — Full schema: client metadata, capture method, imageUrl, imageHash, encrypted flag, GPS, IP, UA, status, verification/rejection timestamps

### Schema Reference (`packages/shared-types/src/schemas/client-signature.schema.ts`)
```typescript
SignatureStatus:   pending | captured | verified | rejected | expired
CaptureMethod:     canvas_touch | canvas_mouse | fingerprint_scanner | uploaded_image
ContextType:       delivery_record | technical_report | site_visit | proposal_approval
                   | ses_approval | work_order_acceptance
```

### Backend Module
- `backend/src/modules/client-signature/` — routes (`/api/signatures`), controller, service
- Signature image validated: magic bytes (PNG), size (≤2 MB), SHA-256 hash computed on save
- File stored via `local-storage.ts` saveFile helper

### Frontend Modules
- `modules/signatures/api/signatures-api.ts` — `captureClientSignature()` wrapping `apiClient.post('/signatures', input)`
- `modules/signatures/ui/SignaturePad.tsx` — Canvas-based signature component (PointerEvent, touch + mouse)
- `core/ui/SignaturePad.tsx` — Legacy signature pad (simplified)
- `modules/signatures/hooks/` — TanStack Query hooks for signature operations
- `modules/signatures/model/` — Types, constants, query keys

## Endpoints

### Client Signature Controller (`/api/signatures`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/signatures` | List with filters (contextType, contextId, status, clientId, dateFrom, dateTo) |
| GET | `/api/signatures/:id` | Get signature detail with all metadata |
| POST | `/api/signatures` | Capture signature (canvas PNG base64, GPS, device info) |
| POST | `/api/signatures/:id/verify` | Verify signature (management) |
| POST | `/api/signatures/:id/reject` | Reject with reason (min 5 chars) |

## Screens

### Frontend Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/delivery-records/[id]/signature` | DeliverySignature | Signature capture page with SignaturePad canvas, client info form, GPS capture |
| `/portal/signatures/[id]` | PortalSignature | Client portal page for remote signature capture |

### Frontend Components
- `modules/signatures/ui/SignaturePad.tsx` — Reusable canvas signature pad with clear button
- `core/ui/SignaturePad.tsx` — Legacy variant with onSave callback, width/height props
- `modules/signatures/api/signatures-api.ts` — API service for signature capture
- `modules/reports/ui/DigitalSignaturePad.tsx` — Variant used in technical reports

## UI States
| State | Visual | Behavior |
|-------|--------|----------|
| Loading | Skeleton canvas | Placeholder while fetching signature status |
| Empty/Pending | Canvas with "Firme aquí" placeholder | Signature area ready for input |
| Drawing | Active ink strokes on canvas | Real-time pointer tracking |
| Captured | Signature preview thumbnail + metadata card | Shows signed PNG, GPS, IP, timestamp |
| Verified | Green badge | "Verified by [name]" — management confirmed |
| Rejected | Red badge + reason | "Rejected: [reason]" — management feedback |
| Expired | Gray badge + "Solicitar nueva firma" | Link expired, new signature needed |
| Offline | Queue badge + pending indicator | Signature stored locally, sync pending |
| Error | Error card with retry | Canvas unsupported, validation failure, network error |

## Audit Events
| Event | Payload | Triggered By |
|-------|---------|-------------|
| `signature.captured` | signatureId, clientId, method, hash, gps, ip | Canvas capture |
| `signature.verified` | signatureId, verifiedBy, verifiedAt | Management verify |
| `signature.rejected` | signatureId, rejectedBy, reason, rejectedAt | Management reject |
| `signature.expired` | signatureId, contextType, contextId | TTL expiration |
| `delivery.accepted` | deliveryRecordId, signatureId, signedAt | Signature verified → delivery accepted |
| `delivery.acceptance.triggered_ses` | deliveryRecordId, sesId | SES creation from signed delivery |

## Negative Cases
| Scenario | Expected Behavior |
|----------|------------------|
| Capture without client name | 422 — "Client name is required" |
| Signature image not valid PNG | 400 — "La firma debe ser una imagen PNG" (magic bytes fail) |
| Signature image exceeds 2 MB | 400 — "La imagen de la firma está vacía o excede 2MB" |
| Verify already verified signature | 409 — "La firma ya fue verificada" |
| Verify already rejected signature | 409 — "La firma ya fue rechazada" |
| Reject already rejected signature | 409 — "La firma ya fue rechazada" |
| Duplicate capture (same clientMutationId) | 200 — Returns existing signature (idempotent) |
| Capture with invalid contextType | 400 — "Invalid context type" (Zod validation) |
| Network failure during capture | Automatically retry with idempotency key |

## E2E Tests
- TC-ACS-001: Capture signature via SignaturePad → status is `captured`
- TC-ACS-002: Verify captured signature → status becomes `verified`
- TC-ACS-003: Reject captured signature → status becomes `rejected`
- TC-ACS-004: Duplicate capture (same clientMutationId) → returns existing signature
- TC-ACS-005: Upload non-PNG image as signature → 400 with format error
- TC-ACS-006: Verify rejected signature → 409 conflict
- TC-ACS-007: GPS metadata is stored with signature capture
- TC-ACS-008: IP and user agent are captured from request
- TC-ACS-009: Delivery record transitions to `signed` upon client acceptance
- TC-ACS-010: Signed delivery triggers SES creation flow

## Acceptance Evidence
- [ ] Client can draw signature on canvas (touch + mouse) via SignaturePad
- [ ] Signature is validated: PNG magic bytes, size ≤ 2 MB, SHA-256 hash stored
- [ ] Signature captures GPS metadata for field verification
- [ ] Signature captures IP and user agent for legal validity
- [ ] Management can verify or reject captured signatures
- [ ] Idempotent capture via clientMutationId prevents duplicates
- [ ] Delivery record transitions to `signed` upon verified signature
- [ ] SES creation is triggered from signed delivery
- [ ] All gates pass: `npm run typecheck && npm run lint && npm run test && npm run build`
