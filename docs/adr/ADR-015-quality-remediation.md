# ADR-015 — Quality Remediation (react-doctor + weak tokens sin baseline bump)

- Status: Accepted
- Date: 2026-07-07
- Branch: claude/bold-almeida-9f1776 (base: implement/spec-024-post-spec022-continuation)

## Context

`quality:strict` and react-doctor reported: 9 jsx-key issues (spread overwrites key), a `next/image fill` without `sizes`, a per-render `colorMap`, an unused export (`toDocStatus`), 7 dead files, and weak/spanish tokens above baseline.

## Decision

1. Fix findings at the source instead of bumping baselines:
   - `key` moved after spread in 9 components.
   - `sizes` added to the cockpit evidence `<Image fill>`.
   - `StatusRow` colorMap hoisted to module scope (`STATUS_COLOR_MAP`).
   - `toDocStatus` wired into `cockpitTransformer` (replacing a duplicated ternary) instead of deleting it — resolves unused-export and DRY at once.
   - 7 confirmed dead files deleted (`AuditTimeline`, `useDashboardKpis`, `KpiWidgetGrid`, `EvidenceReplacementDialog`, `CockpitPanel`, `FourteenStepProgress`, `NextActionsPanel`). `EvidenceGallery.tsx` preserved (false positive, has importers).
   - 5 Spanish backend comments translated to English (spanish-source-token 2764 → 2758 ≤ 2761 baseline).
2. `callback(null, true)` in the CORS origin handler stays: `@types/cors` requires `Error | null`, and replacing with `undefined` pushed `weak-token-ud` above baseline (782/781). `weak-token-n` remains within baseline (1516/1519).
3. No baseline value was increased.

## Consequences

- react-doctor 100/100 on changed scope; `quality:strict` fully green.
- Future evidence UI work must recreate deleted dashboard/cockpit widgets contract-first if needed (see quality-remediation plan Fase 5 note).
