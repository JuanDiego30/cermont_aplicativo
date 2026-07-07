# STALE DOCUMENTATION REPORT — Cermont S.A.S.

**Date:** 2026-05-13  
**Purpose:** Catalog all outdated, incorrect, or contradictory claims.  
**Author:** Cermont Documentation Foundation Rebuild

---

## CRITICAL CONTRADICTIONS

### 1. Workspace Path Mismatch — `apps/` vs. Root Level

**Claim:** 23 documents say `apps/backend` and `apps/frontend`.  
**Reality:** `package.json` workspaces: `["backend", "frontend", "packages/*"]`. Actual dirs: `backend/`, `frontend/`, `packages/`.  
**Impact:** Agents look for code in wrong directories.  
**Action:** Mark all affected docs. Canonical docs use correct paths.

### 2. Sector Framing — Petroleum-Only vs. Multi-Service

**Claim:** 14 documents frame Cermont as petroleum-sector, Caño Limón only.  
**Reality:** HES induction defines: construction, electricity, refrigeration, montages, materials, equipment, technical personnel. Mission adds: maintenance, telecom, national coverage.  
**Impact:** Petroleum-only systems are too rigid.  
**Action:** Document as multi-service contractor platform.

### 3. API Base Path Ambiguity

**Claim:** Some docs say `/api/backend`, some say `/api`.  
**Reality:** Proxy rewrites in `frontend/next.config.ts` need verification.  
**Action:** Document single convention in API Endpoint Matrix.

---

## OUTDATED CLAIMS TABLE

| # | Outdated Claim | Document(s) | Correct Rule | Action |
|---|----------------|-------------|--------------|--------|
| 1 | `apps/backend` | 23 docs (DOC-01 through DOC-21, README, AGENTS, copilot-instructions, etc.) | `backend/` | Mark all; fix canonicals |
| 2 | `apps/frontend` | 23 docs | `frontend/` | Mark all; fix canonicals |
| 3 | Petroleum/oil sector only | DOC-01, DOC-03, DOC-05, DOC-06, DOC-07, DOC-07B, DOC-10, DOC-12, WORKSPACE-CONFIG, plans1, test-diagnostic | Multi-service contractor | Historical context; document multi-service |
| 4 | Caño Limón only | DOC-01, DOC-03, DOC-06, DOC-07, DOC-10 | Multi-location, national | Historical example, not limit |
| 5 | Backend port 5000 | DOC-01 | PORT=4000 per .env.example | Fix |
| 6 | 6 workspaces | DOC-12 workspace doc | 3 workspaces: `["backend","frontend","packages/*"]` | Fix |
| 7 | `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | Root README | No NextAuth used (Ley 1) | Remove |
| 8 | Quantitative claims (30.1 hrs, 51.3%) | DOC-01 | Academic projection, not verified | Mark aspirational |
| 9 | `API_ROOT = .../api/backend` | plans1.md | Single documented convention needed | Document in matrix |
| 10 | `packages/domain` and `packages/config` as separate workspaces | README, AGENTS, copilot | They are sub-packages under `packages/*` glob | Clarify hierarchy |

---

## DOCUMENTS WITH HIGHEST CONTRADICTION DENSITY

| Document | Stale Claims | Severity | Action |
|----------|-------------|----------|--------|
| `docs/Intrucciones_para_crear_app_web/DOC-01` | 4 | HIGH | Mark OUTDATED; replaced by architecture blueprint |
| Root `README.md` | 5 | HIGH | Rewrite to match actual structure |
| Root `AGENTS.md` | 3 | HIGH | Mark stale; replaced by agent playbook |
| `.github/copilot-instructions.md` | 4 | HIGH | Mark stale; replaced by agent playbook |
| `docs/Intrucciones_para_crear_app_web/DOC-02` | 2 | HIGH | Mark outdated |
| `docs/Intrucciones_para_crear_app_web/DOC-07` | 3 | MEDIUM | Mark HISTORICAL |
| `docs/plans/plans1.md` | 3 | HIGH | Mark OUTDATED |

---

## SEARCH RESULTS

### `apps/backend|apps/frontend` in `docs/` — 23 matches
Every DOC-01 through DOC-21, plus plans1.md, PLAN.md, test-diagnostic-plan.md.

### `Caño Limón|petrolero|petróleo` in `docs/` — 14 matches
DOC-01, DOC-03, DOC-05, DOC-06, DOC-07, DOC-07B, DOC-10, DOC-12 workspace, WORKSPACE-CONFIG, plans1, test-diagnostic, deep-research, business-flow-map, codex-plan. **Deep-research and Codex plan intentionally challenge this framing.**

### `api/backend` in `docs/` — 1 match (plans1.md)

---

## POSITIVE FINDINGS (No Contradictions)

- **DESIGN.md:** Accurate design system. No stale references.
- **REGLAS_DESARROLLO_CERMONT.md:** Comprehensive, valid rules.
- **CERMONT_BUSINESS_FLOW_MAP.md:** Current, accurate 14-step flow.
- **CODEX_DOCUMENT_DRIVEN_CERMONT_PLATFORM_PLAN.md:** Current D0-D12 plan.
- **deep-research-report (3).md:** Validates multi-service approach.
- **ADR-document-ingestion-contract-first.md:** Valid ADR.
- **DOC-16 (Git workflow):** Workspace-agnostic, valid.
