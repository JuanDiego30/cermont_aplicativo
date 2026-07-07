# Spec 018 — Cierre del Flujo Documental: Pasos 8-14

**Status:** IN PROGRESS
**Branch:** `implement/spec-018-cierre-flujo-documental`
**Baseline commit:** `6c8ccad` (pre-Spec-018)  
**Slice 01 commit:** `20414e6` (header-notifications test fix)

## Correction to Spec-017 Audit

The Spec-017 audit classified 6 modules (delivery-record, technical-report, service-entry-sheet, invoice, payment, observability) as "only routes" with maturity level 1. This classification was INACCURATE for modules 1-5:

**Actual architecture:** The administrative workflow (pasos 8-14) uses a centralized pattern:
- Routes: `backend/src/modules/{module}/*.routes.ts` (thin wiring)
- Controllers: `backend/src/modules/order/administrative-workflow.controller.ts` (453 lines, complete)
- Service: `backend/src/modules/order/administrative-workflow.service.ts` (1,605 lines, real logic)
- Models: `backend/src/models/{Module}.ts` (DeliveryRecord, TechnicalReport, ServiceEntrySheet, Invoice, Payment, ClientSignature)

**True gaps:**
- `backend/src/modules/kpi/` — EMPTY directory (confirmed)
- `backend/src/modules/media/` — EMPTY directory (confirmed - may be duplicative of FileAsset)
- `backend/src/modules/observability/` — has controller + routes, needs service file
- Documentation: API_ROUTE_MAP.md missing, API_ENDPOINT_MATRIX.md outdated
- Tests: No tests for administrative workflow service

## Revised Scope

| Slice | Module | Original Assessment | Corrected Assessment | Action |
|-------|--------|-------------------|---------------------|--------|
| 01 | header-notifications tests | 2 failing tests | Fixed ✅ | Complete |
| 02 | delivery-record | "only routes" | Centralized controller+service exist | Add tests + verify endpoints |
| 03 | technical-report | "only routes" | Centralized controller+service exist | Add tests |
| 04 | service-entry-sheet | "only routes" | Centralized controller+service exist | Add tests |
| 05 | invoice | "only routes" | Centralized controller+service exist | Add tests |
| 06 | payment | "only routes" | Centralized controller+service exist | Add tests |
| 07 | observability | controller+routes, no service | Confirmed | Implement service |
| 08 | kpi | Empty directory | Confirmed | Implement module |
| 09 | media | Empty directory | Confirmed | Evaluate if FileAsset covers it |
| 10 | digital signature | Not implemented | react-esign integration | Implement signature component |
| 11 | documentation | Multiple docs outdated | Confirmed | Regenerate docs + API route map |
