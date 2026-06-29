# ADR-00X: Document Ingestion — Contract-First Architecture

**Status:** Accepted  
**Date:** Auto-generated  
**Deciders:** Principal Software Architect, Domain Engineer, Contract-First Engineer  

---

## Context

Cermont S.A.S. needs a cross-cutting document ingestion layer that:
- Accepts Word, Excel, PDF, and images as raw material
- Extracts structured data through pluggable adapters
- Proposes template drafts requiring human review
- Publishes versioned templates tied to workflow stages
- Supports offline form filling by field technicians

The existing codebase already has:
- `document-files` (upload/storage)
- `pdf-imports` and `xlsx-imports` (separate extraction flows)
- `document-template-versions` (versioned templates with fields/sections/tables/rules)
- `template-responses` (dynamic form responses with offline sync)

The gap is the **unified pipeline** connecting these pieces.

## Decision

Implement contract-first with 5 new Zod schemas in `packages/shared-types`:

1. **DocumentSourceFile** — Extends the upload concept with `linkedEntityType`/`linkedEntityId` so documents can be attached to any workflow stage entity.
2. **DocumentExtractionJob** — Unified async job with adapter selection (`sheetjs`, `pdf_basic`, `docling_sidecar`, `paddleocr_sidecar`, `unstructured_sidecar`, `manual`).
3. **ExtractedDocumentLayout** — Normalized output across all adapters.
4. **TemplateDraft** — Human-reviewed proposal before publication to `DocumentTemplateVersion`.
5. **TemplateStageRequirement** — Policy layer defining which templates are required at each stage.

## Consequences

### Positive

- Single pipeline for all document types instead of fragmented pdf-import/xlsx-import
- Human review gate prevents AI/LLM from publishing templates autonomously
- Stage requirements enable dynamic blocker detection in ServiceCase
- Normalized layout enables adapter swapping without changing downstream code

### Negative

- Five new schemas increase package surface area
- Existing pdf-import and xlsx-import modules become legacy; migration needed
- `DocumentSourceFile` partially overlaps with existing `DocumentFile`

### Mitigations

- Existing schemas left untouched for backward compatibility
- Legacy pdf-import/xlsx-import can be deprecated gradually with ADR
- `DocumentSourceFile` is additive; `DocumentFile` remains for template-library-only uploads

## Alternatives Considered

### A) Extend existing DocumentFile
Rejected: Would break existing document-files module and its consumers.

### B) Keep separate PDF and XLSX import schemas
Rejected: Fragmentation prevents unified extraction pipeline and stage requirements.

### C) Use JSON Schema instead of Zod
Rejected: Violates project SSOT policy; Zod is already the established contract language.

## Compliance

- SOLID: Each schema has single responsibility
- SSOT: Enums centralized, no duplication
- Contract-First: Schemas created before any backend/frontend code
- Backward Compatibility: Existing schemas untouched
