# Decisions — 003-implementacion-real-cermont

## Architectural Decisions
- **Contract-first approach**: All new features start with Zod schemas in @cermont/shared-types
- **No breaking changes**: Existing schemas extended, never modified
- **Reuse existing components**: CameraCapture, AttachmentGallery, CostPanel already exist
- **RBAC via @cermont/domain**: No hardcoded roles anywhere
- **Response envelope**: All endpoints return `{ success, data, error, message }`

## Technology Decisions
- **PDF generation**: pdf-lib 1.17.1 (already in backend)
- **Image processing**: multer 2.1.1 + sharp 0.34.5 (existing pipeline)
- **Forms**: react-hook-form 7.72.0 + zodResolver (existing pattern)
- **State**: TanStack Query v5 for server state, Zustand 5 for client state

## Scope Decisions
- **Wave 1**: 8 tasks (schemas + types + permissions)
- **Wave 2**: 13 tasks (backend endpoints)
- **Wave 3**: 12 tasks (frontend components)
- **Wave 4**: 7 tasks (tests + docs + verify)
- **Final Wave**: 4 review tasks
