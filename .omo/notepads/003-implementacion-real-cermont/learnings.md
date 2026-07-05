# Learnings — 003-implementacion-real-cermont

## Conventions
- Contract-first: Zod schema → TypeScript type → DTO → Mongoose model → Service → Controller → Route → API client → Hook → UI
- Backend: Express 5.2.1, no try/catch in controllers, AppError for business failures
- Frontend: Next.js 16 App Router, Server Components by default, TanStack Query for server state, Zustand for client state
- RBAC: 8 roles from @cermont/domain, never hardcoded
- Response envelope: `{ success: boolean, data?: T, error?: string, message?: string }`
- MongoDB: use `127.0.0.1` never `localhost`, force IPv4 with `family: 4`

## Key Files
- `packages/shared-types/src/schemas/` — Zod schemas SSOT
- `packages/shared-types/src/index.ts` — Export barrel
- `backend/src/modules/<feature>/<feature>.routes.ts` — Route wiring
- `backend/src/modules/<feature>/<feature>.controller.ts` — Thin HTTP layer
- `backend/src/modules/<feature>/<feature>.service.ts` — Business logic
- `frontend/src/modules/<feature>/` — Feature modules (hooks, api, ui)
- `frontend/src/lib/http/api-client.ts` — API client (no direct fetch)
- `frontend/proxy.ts` — Security perimeter (no middleware.ts)

## Existing Components to Reuse
- `CameraCapture` — Already recycled into evidences module
- `AttachmentGallery` — Already integrated, supports entityType/entityId
- `EvidenceUploader`, `EvidenceDropZone`, `EvidencePhotoCard` — Evidence UI
- `CostPanel`, `CostForm`, `CostSummaryCard`, `CostBreakdownTable` — Cost UI
- `FileUploadField`, `ImageUploadField`, `FileAttachmentsSection` — File UI

## Dependencies
- pdf-lib: 1.17.1 (already in backend)
- multer: 2.1.1 + sharp: 0.34.5 for image processing
- react-hook-form: 7.72.0 + @hookform/resolvers: 5.2.2
- Zod: 4.3.6 (unified backend+frontend)
