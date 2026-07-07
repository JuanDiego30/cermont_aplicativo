# Slice 11 — AI Copilot Safe MVP Specification

## 1. Objective
Introduce assistive AI features (operational summaries and anomaly checks) under strict safety guidelines (no raw client data exposure, drafts only).

## 2. Technical Scope
- **Safe AI Prompts**: Design system prompts that prevent hallucinated statuses or data leakage.
- **Features**:
  - Technical report draft summarizer (compiling field logs and checklists into a structured text draft).
  - Missing evidence flagging (identifying missing required photographs based on order templates).
- **Audit Ledger**: Log all LLM requests, tokens, and users for cost and security monitoring.

## 3. Impacted Files
- [MODIFY] `backend/src/modules/ai/ai.service.ts`
- [MODIFY] `backend/src/modules/reports/reports.controller.ts`
- [NEW] `frontend/src/modules/reports/ui/AICopilotAssistant.tsx`

## 4. Verification Scenario
Verify that requesting a report summary successfully outputs a structured draft, and logs the request under `AuditLogs`.
