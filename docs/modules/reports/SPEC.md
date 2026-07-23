# Module: Technical Reports

## Business Problem
El informe técnico consolida datos de ejecución (actividades, evidencias, equipos, mano de obra) en un documento formal para presentar resultados al cliente. Sin este módulo, no hay trazabilidad auditada del trabajo ejecutado ni documento base para actas de entrega.

## Roles
Per `DOCUMENT_MANAGEMENT_ROLES` (`gerente`, `residente`, `administrativo`, `supervisor`) + `report_approver` + `cliente` (view).

## Use Cases
- UC-RPT-01: Auto-generar borrador desde sesión de ejecución completada
- UC-RPT-02: Editar contenido del reporte (resumen, hallazgos, observaciones)
- UC-RPT-03: Seleccionar evidencias aprobadas para incluir en el reporte
- UC-RPT-04: Revisar workflow (draft → pending_review → approved → rejected)
- UC-RPT-05: Generar PDF con hash SHA-256 embebido
- UC-RPT-06: Aprobar/rechazar reporte con retroalimentación
- UC-RPT-07: Ver historial de versiones del PDF

## Entities
- `TechnicalReport` (executionSummary, activitiesPerformed, findings, evidenceIds[], generatedPdfUrl, version, hash, status)

## States
```
draft → pending_review → approved → rejected
  ↑__________________________|         |
  |____________________________________|
```

| State | Meaning |
|-------|---------|
| draft | Borrador inicial generado desde ejecución |
| pending_review | Enviado para revisión interna |
| approved | Aprobado — listo para generación de PDF y entrega |
| rejected | Rechazado con motivo — retorna a draft |

## Transitions
| From | To | Trigger | Guard |
|------|----|---------|-------|
| draft | pending_review | Submit for review | All required sections + approved evidence |
| pending_review | approved | POST approve | reviewer role |
| pending_review | rejected | POST reject | rejectionReason min 10 chars |
| rejected | draft | Return to draft | reason required |

## Preconditions
1. Execution session must be completed
2. All selected evidence must be in approved state
3. Report must have executionSummary and at least one activity

## Blockers
- BLOCKER-001: Execution not completed → cannot generate draft
- BLOCKER-002: Evidence not approved → cannot submit for review
- BLOCKER-003: Report already approved → locked for editing
- BLOCKER-004: PDF generation fails on missing asset → warn which asset

## Permissions
| Action | DOCUMENT_MGMT_ROLES | report_approver | cliente |
|--------|:-:|:-:|:-:|
| Generate draft | ✓ | | |
| Edit draft | ✓ | | |
| Submit for review | ✓ | | |
| Approve/reject | | ✓ | |
| View report | ✓ | ✓ | ✓ |
| Download PDF | ✓ | ✓ | ✓ |

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/technical-reports/generate` | Auto-draft from execution data |
| GET | `/api/technical-reports` | List with filters (status, date) |
| GET | `/api/technical-reports/:id` | Get detail |
| PATCH | `/api/technical-reports/:id` | Update (draft only) |
| POST | `/api/technical-reports/:id/submit` | Submit for review |
| POST | `/api/technical-reports/:id/approve` | Approve |
| POST | `/api/technical-reports/:id/reject` | Reject |
| POST | `/api/technical-reports/:id/generate-pdf` | Generate PDF with hash |
| GET | `/api/technical-reports/:id/pdf` | Download PDF |

## Screens
| Route | Component | Description |
|-------|-----------|-------------|
| `/reports/list` | ReportList | Table with status filters |
| `/reports/[id]` | ReportDetail | Full report + evidence gallery + PDF download |
| `/reports/[id]/edit` | ReportEdit | Edit sections, select evidence |
| `/reports/review` | ReportReview | Queue for pending_review reports |

## UI States
| State | Visual | Behavior |
|-------|--------|----------|
| Loading | Skeleton | Shimmer placeholder |
| Empty | Illustration + CTA | "No hay informes técnicos" |
| Draft | Yellow banner | "Borrador — Completa las secciones requeridas" |
| pending_review | Blue badge | "En revisión — Solo lectura" |
| approved | Green badge | "Aprobado — Descargar PDF" |
| rejected | Red badge + reason | "Rechazado: [motivo]" |
| PDF Generating | Progress bar | "Generando PDF..." |
| Error | Error banner + retry | "Error al generar el informe" |

## Audit Events
- `report.generated` — Auto-draft created from execution
- `report.submitted` — Submitted for review
- `report.approved` / `report.rejected` — Review decision
- `report.pdf.generated` — PDF created (version, hash)

## Negative Cases
| Scenario | Expected Behavior |
|----------|------------------|
| Generate from incomplete execution | 422 — "Execution session must be completed" |
| Submit with unapproved evidence | 422 — "All evidence must be approved" |
| Approve already approved report | 409 — "Report already approved" |
| Reject without reason | 422 — "Rejection reason required (min 10 chars)" |
| Generate PDF with deleted evidence | 400 — warn which evidence IDs are missing |
| Edit report in pending_review | 409 — "Report is under review, editing locked" |

## E2E Tests
- TC-RPT-001: Full lifecycle — generate draft → submit → approve → PDF
- TC-RPT-002: Generate from completed execution verifies auto-populated fields
- TC-RPT-003: Submit with missing evidence → blocked 422
- TC-RPT-004: Reject → return to draft → re-submit → approve
- TC-RPT-005: PDF generation includes correct hash and version
