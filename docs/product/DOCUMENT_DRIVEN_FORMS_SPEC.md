# DOCUMENT-DRIVEN FORMS SPECIFICATION

**Date:** 2026-05-13  
**Version:** 1.0 — Canonical  
**Status:** CURRENT_SOURCE_OF_TRUTH  
**Replaces:** DOC-19 (partial), DOC-07 (template logic)

---

## 1. Core Philosophy

Cermont already has documents: PDFs, Excel files, Word docs, photos, physical formats. The software must NOT force abandonment of these documents. Instead, it must convert them into **matter for the system**:

```
EXISTING DOCUMENT → INGEST → FIELD DETECTION → HUMAN REVIEW → VERSIONED TEMPLATE → DYNAMIC FORM → OFFLINE/ONLINE CAPTURE → GENERATED OUTPUT
```

---

## 2. Document Ingestion Pipeline

### Step 1: Upload
- User uploads PDF, Excel (.xlsx), Word (.docx), or photos
- System captures: filename, size, MIME type, uploader, timestamp, hash (SHA-256)
- Entity: `DocumentImport`

### Step 2: File Metadata Extraction
- File type detection (extension + magic bytes)
- Page/sheet count
- Hash for integrity verification
- Allowlist: PDF, XLSX, DOCX, JPG, PNG, WEBP
- Max size: configurable (default 10MB)

### Step 3: Structural Parsing
| Source | Parsing Strategy |
|--------|-----------------|
| **Excel (.xlsx)** | SheetJS — read workbooks, sheets, tables, preserve structure |
| **PDF (digital)** | Text extraction, layout analysis, table detection |
| **PDF (scanned)** | OCR with layout analysis, mark for human review |
| **Word (.docx)** | Titles, tables, fields, repeatable blocks |
| **Photos** | Metadata (EXIF), GPS, batch association to activity |

### Step 4: Field Detection
Auto-detect:
- **Labels:** text near blank spaces or cells
- **Tables:** grid patterns, headers
- **Checklists:** boolean patterns, checkboxes
- **Signatures:** signature blocks, line areas
- **Photo slots:** labeled areas for images
- **Cost lines:** monetary patterns, quantity × unit price
- **Confidence score:** per field, used for review prioritization

### Step 5: Field Classification
Each detected field gets a type:

| Type | Use | Example |
|------|-----|---------|
| `text` | Short text input | Name, location |
| `textarea` | Long text | Observations, notes |
| `number` | Numeric input | Quantities, measurements |
| `date` | Date picker | Inspection date |
| `select` | Single selection | Status, condition |
| `multiSelect` | Multiple selection | Tools required |
| `checkbox` | Boolean | Present/Not present |
| `checklist` | List of checkable items | Safety checklist |
| `table` | Dynamic table with columns | Materials list |
| `photo` | Photo capture | Evidence photo |
| `signature` | Digital signature | Approval signature |
| `gps` | Geolocation | Location stamp |
| `costLine` | Cost entry | Unit price × quantity |
| `workerCount` | Number of workers | Personnel count |
| `materialList` | Materials table | Material name, quantity, unit |
| `toolList` | Tools table | Tool name, quantity, condition |
| `equipmentList` | Equipment table | Equipment, serial, certification |
| `safetyElementList` | Safety elements | EPP items, certification |

---

## 3. Human Review Phase

### Review UI
- Side-by-side: original document left, detected fields right
- Edit: rename labels, change types, mark required, add options
- Confidence indicators: green (high), yellow (medium), red (low)
- Table editor: add/remove columns, rename headers
- Checklist editor: add/remove items, reorder
- Signature placement: mark signature areas
- Photo slot placement: mark where photos go

### Actions
- **Confirm field** — keep as detected
- **Correct field** — change type, label, options
- **Add field** — insert new field not detected
- **Remove field** — delete false positive
- **Add section** — group fields logically
- **Mark complete** — review done, ready to publish

---

## 4. Template Versioning

### DocumentTemplate entity
```
{
  id, name, originDocumentId, serviceType, version,
  schema: { sections[], fields[], rules[] },
  status: draft | published | archived,
  createdBy, updatedBy, createdAt, updatedAt
}
```

### Versioning Rules
- Every publish creates a new immutable version
- Existing responses are locked to their template version
- New orders use the latest published version
- Archived templates remain queryable for historical data
- Schema changes between versions are tracked

---

## 5. Dynamic Form Runtime

### Form Generation
Template schema → Dynamic form with:
- Sections rendered as collapsible groups
- Fields rendered by type (text input, date picker, camera, signature pad, GPS)
- Tables rendered as add/remove row grids
- Conditional logic: show/hide/require based on other field values
- Validation: Zod schema generated from field definitions

### Offline Capture
- Full form available offline (no server needed)
- Photos stored in IndexedDB as blobs
- Signatures captured via canvas
- GPS captured from device
- Auto-save every 30 seconds
- Queue: pending items visible with status indicators

### Sync
- On connectivity restore: auto-sync queue
- Conflict: if server version has been updated, surface conflict to user
- Retry: exponential backoff for failed syncs
- Idempotency: `clientMutationId` prevents duplicates

---

## 6. Generated Document Output

### Output Types
- **PDF Report:** formatted document with all fields, photos, signatures
- **Excel Export:** raw data in .xlsx for external processing
- **Word Export:** formatted .docx for client submission
- **ZIP Archive:** all evidence + report for historical archiving

### Generation Rules
- Template defines layout: sections, headers, footers, branding
- Photos inserted inline at marked slots
- Signatures rendered as images
- Tables formatted with headers and alternating rows
- GPS coordinates shown as map link or coordinates
- Footer: generated timestamp, template version, document ID

---

## 7. Real-World Template Examples

### Example 1: Work Planning Format
**Source:** `FORMATO DE PLANEACION DE OBRA.pdf`

**Detected fields and types:**
| Field | Type | Required |
|-------|------|----------|
| Responsible inspector | text | Yes |
| Place | text | Yes |
| Date | date | Yes |
| Business unit | select | Yes |
| Scope | textarea | Yes |
| Materials | materialList | Yes |
| Tools | toolList | Yes |
| Equipment | equipmentList | Yes |
| Safety elements | safetyElementList | Yes |
| Number of workers | workerCount | Yes |
| Ing. Residente signature | signature | Yes |
| Tecnico Electricista signature | signature | Yes |
| HES signature | signature | Yes |

### Example 2: Vertical Lifeline Inspection
**Source:** `Formato Inspección líneas de vida Vertical.pdf`

**Detected fields and types:**
| Field | Type | Required |
|-------|------|----------|
| Lifeline number | text | Yes |
| Manufacturer | text | Yes |
| Diameter | number | Yes |
| Cable type | select | Yes |
| Components | checklist | Yes |
| Condition to evaluate | textarea | Yes |
| Affection type | select | Yes |
| Status C/NC | select | Yes |
| Finding | textarea | No |
| Corrective action | textarea | No |
| Observations | textarea | No |
| Final concept | select | Yes |
| Photographic record | photo (multiple) | Yes |

### Example 3: CCTV Maintenance
**Source:** `Formato Mantenimiento CCTV.pdf`

**Detected fields and types:**
| Field | Type | Required |
|-------|------|----------|
| Camera number | text | Yes |
| Routine number | text | Yes |
| Place | text | Yes |
| Date | date | Yes |
| Structure height | number | No |
| Camera height | number | No |
| Camera type/model/serial | text | Yes |
| Encoder/POE | text | No |
| Radio | text | No |
| Antenna | text | No |
| Switch | text | No |
| Electrical system | select | Yes |
| Photovoltaic system | select | Yes |
| Observations | textarea | No |
| Before photo | photo | Yes |
| After photo | photo | Yes |

---

## 8. Key Technical Decisions

1. **Excel-first ingestion:** Preserves more structure than PDF. SheetJS reads workbooks natively.
2. **PDF as secondary:** For legacy docs without original Excel. OCR with human review required.
3. **Confidence scores:** Enable efficient review triage. High-confidence fields need minimal review.
4. **Immutable versions:** Published templates are locked. Prevents breaking historical responses.
5. **Offline-first runtime:** Form rendering and capture must work without server. Only sync needs connectivity.
6. **No AI-only pipeline:** Human review is mandatory before publishing a template. AI assists, doesn't decide.
7. **Audit trail:** Every template change, review correction, and form submission is audited.
