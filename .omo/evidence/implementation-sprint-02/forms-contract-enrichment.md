# Forms/Checklists Contract Enrichment — Block B

**Date:** 2026-07-08

## What Was Done

Added `FormSectionSchema` to `DynamicFormTemplateSchema` to enable inspection template grouping for CCTV, Lifelines, and Planning formats.

## Analysis

### Existing Contracts Coverage

| Format | DynamicFormTemplate | Checklist | Gap |
|--------|-------------------|-----------|-----|
| CCTV inspection | Supported via field types (text, number, select, file, signature, gps) | Supported via items | No section grouping for per-component fields |
| Lifeline inspection | Same | Same | Same |
| Planning de obra | Supported | Supported | Minor |
| C/NC/NA evaluation | Not as dedicated type | Supported via result (passed/failed) | Could use `c_nc_na` enum |

### Gap: Section Grouping

The CCTV format requires per-component fields (e.g., for each camera: type, model, serial, encoder status, radio status, before/after photos, findings, corrective actions). The flat `fields[]` array requires naming conventions for grouping.

## Changes

### Added `FormSectionSchema`
```typescript
FormSectionSchema = z.object({
    key, title, description,
    fields: DynamicFormFieldSchema[],
    repeatable, maxRepeat,
    requiresPhotoPerItem,
    requiresEvaluation: "none" | "pass_fail" | "c_nc_na"
})
```

### Extended `DynamicFormTemplateSchema`
Added optional `sections: FormSectionSchema[]` alongside existing `fields[]`.

### Added Migration
Migration 072 in contract-migrations.json documents this non-breaking change.

## Format Coverage Assessment

| Format | Coverage |
|--------|----------|
| **CCTV** | ✅ All fields representable. Sections enable grouping by camera component. `c_nc_na` evaluation per section item. Photo fields per component via `file` type + `requiresPhotoPerItem: true`. |
| **Lifeline** | ✅ Same pattern. Sections for anchor plate, cable, tensor, identification plate. |
| **Planning** | Already covered by 28+ field PlanningPacket schema. |
| **SGSST** | Covered via existing checklist/safety schemas. |
