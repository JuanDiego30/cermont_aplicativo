# Technical Debt Top 20 — Post-Sprint 4

Ranking by impact × risk.

| # | Deuda | Archivo/Módulo | Impacto | Riesgo | Esfuerzo | Sprint |
|---|-------|---------------|---------|--------|----------|--------|
| 1 | unsafe types (194 instancias Record/unknown/as never) | 58 backend services | Alto | Medio | 5 días | S5 |
| 2 | Local Zod schemas (3 archivos) | KitForm, KitWizardForm, NewVehicleDrawer | Alto | Alto | 1 día | S5 |
| 3 | quality:weak-tokens baseline drift | Todo el monorepo | Medio | Alto | 3 días | S5 |
| 4 | quality:language baseline drift | Todo el monorepo | Medio | Alto | 3 días | S6 |
| 5 | 22 unused files (cockpit, dashboard) | frontend/src/modules/cockpit/, dashboard/ui/* | Medio | Medio | 1 día | S5 |
| 6 | package.json modificado (local) | backend/package.json, root package.json | Alto | Alto | — | Urgente |
| 7 | package-lock.json con cambios locales | package-lock.json | Alto | Alto | — | Urgente |
| 8 | Frontend build 6665 KiB precache | Service Worker bundle | Medio | Bajo | 1 día | S6 |
| 9 | 2 flaky backend tests (timeout 5s) | proposals.controller, spec-008-endpoints | Bajo | Medio | 0.5 día | S5 |
| 10 | Planning sin wizard multi-sección | frontend/modules/planning/ui/ | Alto | Medio | 3 días | S6 |
| 11 | Evidencias sin galería profesional | frontend/modules/evidences/ui/ | Alto | Medio | 2 días | S6 |
| 12 | Offline no probado E2E | frontend/lib/pwa/, modules/offline/ | Alto | Alto | 3 días | S7 |
| 13 | React Doctor 88/100 (22 unused files) | cockpit/, dashboard/components | Medio | Bajo | 1 día | S5 |
| 14 | Scripts en español en domain/models | fsm-engine.ts, roles.guard.ts | Bajo | Bajo | 2 días | S6 |
| 15 | Evidence excesiva en .omo/ y .sisyphus/ | .omo/evidence/, .sisyphus/evidence/ | Bajo | Medio | — | S8 |
| 16 | Untracked files masivos | skills/, .agents/, .claude/ | Bajo | Medio | — | Gitignore |
| 17 | Dockerfile creado pero no probado | Dockerfile (untracked) | Medio | Alto | 2 días | S8 |
| 18 | Portal cliente básico sin features | frontend/modules/portal/ | Medio | Medio | 3 días | S9 |
| 19 | Costos: UI comparativa propuesta vs real | frontend/modules/costs/ui/ | Alto | Medio | 2 días | S7 |
| 20 | Fleet: checkout/checkin UI no implementada | frontend/modules/fleet/ui/ | Medio | Medio | 2 días | S8 |
