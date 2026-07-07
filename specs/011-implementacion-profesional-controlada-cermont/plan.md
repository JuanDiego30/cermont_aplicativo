# Spec 011 — Plan de Implementación Profesional Controlada

**Baseline:** typecheck PASS, lint PASS, test PASS (846), contracts PASS, quality:strict FAIL, verify FAIL, build FAIL
**Branch:** hotfix/spec-005-post-deploy
**Deploy:** NO DEPLOY

---

## Waves

| Wave | Prioridad | Objetivo | Depende de |
|------|-----------|----------|------------|
| 0 | P0 | Repo safety, stash protection, baseline | — |
| 1 | P0 | Resolver ADR-011 (14-step flow), ADR-012 (visual), ADR-014 (ConsentGate) | Wave 0 |
| 2 | P0 | Fix quality:strict (29+ weak-token violations), verify, build, React Doctor | Wave 1 (parcial) |
| 3 | P1 | Core 14-step flow: state machine, gates, requirements, timeline | Wave 2 |
| 4 | P2 | Professional modules: Fleet, Tools/Assets, Evidences, Checklists, Costs, Maintenance | Wave 3 |
| 5 | P2 | Frontend: dashboard, navigation, DESIGN.md alignment | Wave 4 |
| 6 | P3 | Privacy/ConsentGate + WebAuthn passkeys | Wave 5 |
| 7 | P3 | Optimization: MongoDB indexes, TanStack Query, PWA outbox | Wave 6 |
| 8 | P4 | Tests: contract, integration, Playwright E2E, CI gates | Wave 7 |
| 9 | P4 | Final report, docs update, deploy verdict (READY_FOR_DEPLOY) | Wave 8 |

---

## Decisiones ADR

| ADR | Decisión | Status |
|-----|----------|--------|
| ADR-011 | LTG + docs/domain/CERMONT_BUSINESS_FLOW_MAP.md como fuente canónica. 14 pasos exactos con códigos estables. Evidencias = paso 7, SES approval = subestado del 11 | ⏳ Pendiente |
| ADR-012 | DESIGN.md + CERMONT_UIUX_GUIDE.md como SSOT visual. No crear segundo sistema de diseño. Tokens primero | ⏳ Pendiente |
| ADR-014 | ConsentGate en dashboard layout. No bloquea login/logout/privacy. Consentimiento versionado en servidor. localStorage solo cache | ⏳ Pendiente |
