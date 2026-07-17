# Forms Backend Integration — Block A

**Date:** 2026-07-08

## What Was Done

Added `formSectionSchema` Mongoose sub-schema to `DynamicFormTemplate.ts` model, enabling the backend to persist and retrieve templates with section groupings (key, title, description, fields, repeatable, maxRepeat, requiresPhotoPerItem, requiresEvaluation).

## Mongoose Model Changes

Added sub-schema:
```typescript
const formSectionSchema = new Schema({
    key: { type: String, required: true, maxlength: 100 },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 500 },
    fields: { type: [formFieldSchema], required: true, /* min 1 */ },
    repeatable: { type: Boolean, default: false },
    maxRepeat: { type: Number },
    requiresPhotoPerItem: { type: Boolean, default: false },
    requiresEvaluation: { enum: ["none", "pass_fail", "c_nc_na"], default: "none" }
});
```

Extended main schema with optional `sections: [formSectionSchema]` alongside existing `fields`.

## Validation

- `section.key` unique per template (enforced by Zod schema from shared-types)
- `section.title` required
- `section.fields` minimum 1
- `requiresEvaluation` limited to `none`/`pass_fail`/`c_nc_na`
- `fields` and `sections` are both optional (supports templates that use either flat fields or sections)

## Compatibility

- Old templates (fields only) continue to work unchanged
- New templates can use sections exclusively or mix with fields
- The `SectionedFormRenderer` already handles both patterns
