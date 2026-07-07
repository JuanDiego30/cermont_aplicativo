# DOCUMENTATION INVENTORY — Cermont S.A.S.

**Date:** 2026-05-13
**Purpose:** Complete inventory of all existing documentation, classified by status and usability for future implementation.
**Author:** Cermont Documentation Foundation Rebuild

---

## Classification Legend

| Status | Meaning |
|--------|---------|
| **CURRENT_SOURCE_OF_TRUTH** | Fully valid; use as primary reference for implementation |
| **USE_WITH_CAUTION** | Mostly valid but contains some outdated claims; cross-reference with canonical docs |
| **HISTORICAL_ONLY** | Accurate for its time; do not use for current implementation |
| **OUTDATED_DO_NOT_USE_FOR_IMPLEMENTATION** | Contains incorrect claims about current architecture |
| **NEEDS_MERGE** | Valid content that should be merged into a canonical document |
| **NEEDS_REWRITE** | Core topic but must be rewritten for current architecture |

---

## Full Inventory

### DOC FILES (docs/Intrucciones_para_crear_app_web/)

| # | File | Status | Use For Impl? | Notes |
|---|------|--------|---------------|-------|
| 1 | DOC-01 — Vision General | OUTDATED_DO_NOT_USE | No | `apps/backend`, petrolero-only |
| 2 | DOC-02 — Estructura de Carpetas | OUTDATED_DO_NOT_USE | No | Wrong directory structure |
| 3 | DOC-03 — Desarrollo Backend | USE_WITH_CAUTION | Partial | Valid Express patterns; fix paths |
| 4 | DOC-04 — Seguridad JWT RBAC | USE_WITH_CAUTION | Partial | Security model valid; fix paths |
| 5 | DOC-05 — Frontend Next.js 16 | USE_WITH_CAUTION | Partial | Frontend patterns valid; fix paths |
| 6 | DOC-06 — Offline-First PWA | USE_WITH_CAUTION | Partial | Offline patterns valid; fix paths |
| 7 | DOC-07 — Modulos de Negocio | HISTORICAL_ONLY | No | Petrolero-only; Caño Limón framing |
| 8 | DOC-07B — Dashboard FSM Plan | HISTORICAL_ONLY | No | FSM-specific narrow scope |
| 9 | DOC-08 — Despliegue DevOps | USE_WITH_CAUTION | Partial | DevOps patterns valid |
| 10 | DOC-09 — Diccionario Datos | USE_WITH_CAUTION | Partial | Cross-reference with actual schemas |
| 11 | DOC-10 — Contratos API REST | USE_WITH_CAUTION | Partial | Cross-reference with actual endpoints |
| 12 | DOC-11 — Plan Ejecucion Agente | USE_WITH_CAUTION | Partial | Agent patterns valid; fix paths |
| 13 | DOC-12 — Audit Remediation v5 | HISTORICAL_ONLY | No | Previous audit cycle |
| 14 | DOC-12 — Workspace config | OUTDATED_DO_NOT_USE | No | Wrong workspace count/naming |
| 15 | DOC-13 — Setup Onboarding | USE_WITH_CAUTION | Partial | Fix workspace paths |
| 16 | DOC-14 — Manejo Errores | USE_WITH_CAUTION | Partial | Error patterns valid |
| 17 | DOC-15 — Testing | USE_WITH_CAUTION | Partial | Testing patterns valid |
| 18 | DOC-16 — Flujo Git | CURRENT_SOURCE_OF_TRUTH | Yes | Workspace-agnostic |
| 19 | DOC-17 — Seed Datos | USE_WITH_CAUTION | Partial | Fix workspace paths |
| 20 | DOC-18 — Observabilidad | USE_WITH_CAUTION | Partial | Observability patterns valid |
| 21 | DOC-19 — Archivos Evidencias | USE_WITH_CAUTION | Partial | Storage patterns valid |
| 22 | DOC-20 — Soporte Operativo | USE_WITH_CAUTION | Partial | Support patterns valid |
| 23 | DOC-21 — Buenas Practicas | USE_WITH_CAUTION | Partial | Fix workspace paths |
| 24 | DOC-22 — Cierre Brechas | USE_WITH_CAUTION | Partial | Business flow logic valid |
| 25 | WORKSPACE-CONFIG | USE_WITH_CAUTION | Partial | Check for stale paths |

### CANONICAL DOCUMENTS (Current Source of Truth)

| # | File | Topic |
|---|------|-------|
| 1 | `docs/REGLAS_DESARROLLO_CERMONT.md` | Development rules |
| 2 | `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` | Business flow, entities, RBAC |
| 3 | `docs/plans/CODEX_DOCUMENT_DRIVEN_CERMONT_PLATFORM_PLAN.md` | Document-driven platform plan |
| 4 | `docs/agents/deep-research-report (3).md` | Strategic research |
| 5 | `docs/adr/ADR-document-ingestion-contract-first.md` | Architecture decision |
| 6 | `DESIGN.md` (root) | UI/UX design system |
| 7 | `docs/pdf/DESARROLLO DE UN APLICATIVO WEB...` | 14-step flow source |
| 8 | `docs/pdf/INDUCCION SGSST.pdf` | Company scope definition |
| 9 | `docs/pdf/FORMATO DE PLANEACION DE OBRA.pdf` | Template sample |
| 10 | `docs/pdf/Formato Inspeccion lineas de vida Vertical.pdf` | Template sample |
| 11 | `docs/pdf/Formato Mantenimiento CCTV.pdf` | Template sample |
| 12 | `docs/pdf/FOTOS ANCLAJE ESCALERA A ESTRUCTURA.pdf` | Photo evidence sample |

### PROJECT ROOT FILES (Documentation-Adjacent)

| # | File | Status | Notes |
|---|------|--------|-------|
| 1 | `README.md` (root) | OUTDATED | `apps/backend`, `apps/frontend`, NextAuth refs |
| 2 | `AGENTS.md` (root) | OUTDATED | `apps/backend`, `apps/frontend` |
| 3 | `.github/copilot-instructions.md` | OUTDATED | `apps/backend`, `apps/frontend` |
| 4 | `.cursorrules` | USE_WITH_CAUTION | Check for stale paths |
| 5 | `package.json` | CURRENT | Workspaces: `["backend","frontend","packages/*"]` |

### NEW CANONICAL DOCUMENTS (Created in this Rebuild)

| # | Document | Phase |
|---|----------|-------|
| 1 | `docs/DOCUMENTATION_INVENTORY.md` | 0 |
| 2 | `docs/STALE_DOCUMENTATION_REPORT.md` | 1 |
| 3 | `docs/README.md` | 2 |
| 4 | `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` | 3 |
| 5 | `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` (updated) | 4 |
| 6 | `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` | 5 |
| 7 | `docs/architecture/FRONTEND_ROUTE_MAP.md` | 6 |
| 8 | `docs/architecture/API_ENDPOINT_MATRIX.md` | 7 |
| 9 | `docs/product/DOCUMENT_DRIVEN_FORMS_SPEC.md` | 8 |
| 10 | `docs/product/COST_ENGINE_SPEC.md` | 9 |
| 11 | `docs/design/CERMONT_UIUX_GUIDE.md` | 10 |
| 12 | `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` | 11 |
| 13 | `docs/plans/CERMONT_REBUILD_ROADMAP.md` | 12 |
| 14 | `docs/DOCUMENTATION_VALIDATION_REPORT.md` | 14 |

## Summary

| Classification | Count |
|----------------|-------|
| CURRENT_SOURCE_OF_TRUTH | 12+ |
| USE_WITH_CAUTION | 22 |
| HISTORICAL_ONLY | 5 |
| OUTDATED_DO_NOT_USE | 6 |
| **Total inventoried** | **45+** |

**Critical finding:** 23 documents reference `apps/backend` or `apps/frontend` — the actual workspace structure is `backend/`, `frontend/`, `packages/`. 14 documents frame Cermont as petroleum-only — the company is a multi-service contractor.
