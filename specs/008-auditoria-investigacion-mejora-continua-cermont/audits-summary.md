# Audits Summary — Spec 008

This document summarizes the findings from the deep technical and security audits (Tasks 11-15) of the Cermont S.A.S. application.

---

## T11: Deep RBAC Audit
- **Findings**:
  - Roles and permissions are correctly implemented using `@cermont/domain` definitions and backend `authorize(...)` middleware.
  - State transitions in the order lifecycle are gated by specific role checks in `order-rules.ts`.
  - **Gap**: The newly introduced roles `administrativo` and `cliente` have partial UI coverage, particularly in portal views (`/portal`). No hardcoded role checking arrays were found, ensuring standard compliance.

---

## T12: FileAsset Unification Audit
- **Findings**:
  - `FileAsset` is the canonical Single Source of Truth (SSOT) for media and file attachments.
  - The model `FileAsset.ts` and sub-schema `FileAssetRefSchema.ts` support 15 entity types (including `vehicle`, `tool`, `evidence`, `delivery_record`, `technical_report`) and 18 categories (e.g. `vehicle_image`, `tool_image`, `evidence_photo`, `signature_image`).
  - Fleet media was successfully refactored to delegate to `FileAsset` in Spec 007.
  - **Action**: Unify and verify parent service adapters in `files.service.ts` to ensure consistency.

---

## T13: PWA & Offline Sync Audit
- **Findings**:
  - The codebase features a robust offline module under `frontend/src/lib/offline/` utilizing Dexie (`offline-db.ts`), a custom outbox (`sync-queue.ts`), and a sync engine (`sync-engine.ts`).
  - Binary media files (e.g., photos taken offline) are successfully queued via `blob-outbox.ts` and processed using idempotency keys.
  - **Action**: Documented sync flows under `docs/architecture/PWA_OFFLINE_FLOW_MAP.md` to prevent architecture decay.

---

## T14: Business Module Flow Audit (14-Step Flow)
- **Findings**:
  - The backend supports all 14 stages of Cermont's operational workflow (from initial WorkRequest to final Payment / Closure).
  - 91% of frontend routes (82 of 90) are fully implemented and connected to backend endpoints.
  - Gaps exist for required but not yet implemented views (e.g., `/documents/templates`, `/costs/catalog`).

---

## T15: Legal & Privacy Gap Analysis
- **Findings**:
  - The legal pages `/consent` and `/privacy` do not contain search engine/social preview metadata, causing warnings in React Doctor.
  - UI consent forms for GPS tracking, signature consent, and Habeas Data policy agreements are missing or not fully integrated.
  - **Action**: Add metadata, terms, and consent gate views in subsequent slices (P1).
