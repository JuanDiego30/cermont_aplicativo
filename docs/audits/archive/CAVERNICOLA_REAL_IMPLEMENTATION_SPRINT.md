# CAVERNICOLA Real Implementation Sprint

Sprint goal:
- Build real functional slices for files/photos first, then resources, kits, dynamic forms, planning, and evidence.
- Audit files do not count as progress except this sprint note and graph updates after code changes.

Modules to implement:
- Phase 42: Files & Photos.
- Phase 43: Resources.
- Phase 44: Kits.
- Phase 45: Dynamic Forms.
- Phase 46: Planning + Kits/Resources/Forms integration.

Code files to modify:
- `packages/shared-types/src/schemas/file-asset.schema.ts`
- `backend/src/models/FileAsset.ts`
- `backend/src/modules/files/*`
- `frontend/src/modules/files/*`
- Related resource, kit, planning, and evidence files only after Files & Photos passes.
- `docs/audits/CAVERNICOLA_REPO_GRAPH.json` only after functional graph changes.

Tests to create:
- `backend/tests/files/file-upload.test.ts`
- `frontend/tests/files/image-upload-field.test.tsx`
- `frontend/tests/e2e/file-upload.spec.ts`
- Later: resources, kits, dynamic forms, planning, and evidence E2E specs.

Acceptance criteria:
- A real image/PDF upload creates a persisted `FileAsset` in MongoDB.
- Frontend upload components show preview, progress, error, and persisted reload state.
- Files can be listed by `entityType` and `entityId`.
- Files can be deleted through RBAC-protected backend routes.
- Phase gates pass: `npm run typecheck`, `npm run lint`, `npm run test`.
- Browser proof uses real upload flow, not mocks.
