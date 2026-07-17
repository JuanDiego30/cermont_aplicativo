# Draft: Implementation Masterplan v7.0

## Requirements (confirmed from user prompt)
- Create Implementation Masterplan v7.0 from audit findings
- Respect REGLAS_DESARROLLO_CERMONT.md as ground truth
- Maintain `npm run verify` green at all times
- Reduce React Doctor score from 88/100 to >= 95/100
- Close all ❌ Missing and ⚠️ Partial items from Eje 1
- Provide DoD per task, not just descriptions
- Specify correct implementation order based on technical dependencies

## Scope
- 5 phases covering structural cleanup, React refactors, product features, E2E tests, tech debt
- Stack: Next.js 16, Turbopack, PWA/Serwist, NestJS backend, Turborepo, @cermont/shared-types, @cermont/domain, @cermont/config, Vitest, Biome, Zod, react-hook-form

## Research Needed
- [ ] Verify current `npm run verify` state
- [ ] Verify React Doctor score (88/100 with 22 issues)
- [ ] Check current git branch and state
- [ ] Locate KpiCard.tsx in components/common/
- [ ] Locate planning-packet/new/ directory
- [ ] Locate PlanningWizard.tsx (16 useState)
- [ ] Locate ResourcesStep.tsx (489 lines)
- [ ] Check current shared-types schemas
- [ ] Check costs module in backend/frontend
- [ ] Check billing module
- [ ] Check fleet UI frontend
- [ ] Check portal client routes
- [ ] Check evidence gallery module
- [ ] Verify pdf-lib config in backend
- [ ] Check offline sync infrastructure (Serwist/IndexedDB)
