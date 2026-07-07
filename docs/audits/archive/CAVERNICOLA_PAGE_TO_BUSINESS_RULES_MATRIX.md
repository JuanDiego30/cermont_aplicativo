# CAVERNICOLA Page To Business Rules Matrix

**Generated:** 2026-06-03  
**Purpose:** Keep business blockers visible before UI or API edits.

| Route | Step | Business rule owner | Required backend rule | Required frontend feedback |
|---|---:|---|---|---|
| `/work-requests/new` | 1 | Work Request service | Cannot create without client/contact/description/service type | Inline validation plus API error block |
| `/site-visits/new` | 2 | Site Visit service | Cannot schedule without valid work request/service case and responsible user | Show selected origin and blocker if missing |
| `/proposals/new` | 3 | Proposal service | Cannot create proposal without valid origin and at least one priced item | Validate item table and show missing origin |
| `/purchase-orders/new` | 4 | Purchase Order service | Cannot register PO unless proposal is approved; cannot duplicate active PO for proposal | Show 422/409 with actionable text; do not POST `/purchase-orders/new` |
| `/planning` | 5 | Planning Packet service | Cannot approve planning without required labor/resources/certifications | BusinessRulesPanel with missing resources/certifications |
| `/execution` | 6 | Execution Session service | Cannot start without approved planning; cannot complete without checklist/evidence minimum | Disable completion when blockers exist; offline pending status |
| `/evidences` | 7 | Evidence/File services | Evidence requires entity link, category, file metadata, and idempotent upload | Upload pending/synced/dead-letter states |
| `/reports` | 8 | Report/Technical Report service | No technical report without completed execution and required evidence | Explain missing execution/evidence blockers |
| `/delivery-records` | 9 | Delivery Record service | No delivery record without approved technical report; no signed state without signature/document | Detail actions reflect report/signature blockers |
| `/billing/ses` | 10-11 | Service Entry Sheet service | No SES without accepted delivery record; no invoice until SES approved | Show delivery-record and approval dependency |
| `/billing/invoices` | 12-13 | Invoice service | No invoice without approved SES; no payment until invoice approved | Show SES approval and invoice approval dependency |
| `/payments` | 14 | Payment service | No final closure with unpaid balance or missing mandatory documents | Show balance, support document, closure blockers |
| `/resources` | 5-6 support | Resource service | Resource catalog failures must be typed; resources need category/status/unit | Typed error state; empty state guides resource creation |
| `/resources/kits` | 5-6 support | Kit/Resource services | Kits must keep tools/equipment/materials/EPP traceable and versioned | Show kit contents, empty state, delete/deactivate confirmation |

---

## Backend Error Handling Rule

All read endpoints for these pages must convert transient MongoDB dependency failures to a stable typed envelope:

```json
{
  "success": false,
  "error": {
    "code": "<MODULE>_SERVICE_UNAVAILABLE",
    "message": "<module-specific dependency outage message>"
  }
}
```

Implemented now:

- `RESOURCE_SERVICE_UNAVAILABLE` for the resources catalog.
- `PURCHASE_ORDER_SERVICE_UNAVAILABLE` for the purchase-order list endpoint.

Pending:

- Work requests, site visits, proposals, planning, execution, evidences, reports, delivery records, service entry sheets, invoices, payments, costs, documents.
