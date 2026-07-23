# Active Slice — Repository Integration Baseline

**Phase:** 00.6
**Module:** Repository Integration Baseline
**Status:** in_progress
**Started:** 2026-07-23
**Based on:** origin/deploy/vps-clean (1541906)

## Objective

Create a clean, verified integration baseline from deploy/vps-clean,
selectively importing valid governance documentation from the rescue
snapshot (497ab94), correcting unsubstantiated claims, excluding
duplicated vendor skills, and establishing verified gates.

## In Scope

- Import governance files from rescue (AGENTS.md, docs/ governance)
- Correct DEF-001 from erified to partial
- Document agent instruction inventory and skill duplication
- Execute and document real gate results
- Create clean commits and Draft PR

## Out of Scope

- Auth password recovery implementation
- Any feature code
- Dashboard, planning, execution modules
- Installing nodemailer or SMTP configuration
- E2E test execution

## Next Allowed Phase

**Phase:** 01 — Authentication / Password Recovery
**Branch:** fix/auth-password-recovery
**Base:** integration/baseline-20260723

## Acceptance Evidence

- [x] Worktree based on deploy/vps-clean (not main)
- [x] Rescue branch untouched
- [x] Selective import of governance docs
- [x] DEF-001 corrected to partial
- [x] Skills duplication documented
- [ ] Gates executed and documented
- [ ] Clean commits created
- [ ] Branch pushed to GitHub
- [ ] Draft PR created with real number
- [ ] Remote SHA verified
