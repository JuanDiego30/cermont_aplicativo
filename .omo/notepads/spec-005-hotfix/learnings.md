# Learnings — Spec 005 Hotfix

## 2026-06-27

### T1: Spec kit created
- Created specs/005-post-deploy-hotfix-and-real-implementation/ with spec.md, tasks.md, plan.md
- Created scripts/check-static-assets.mjs
- Copied original prompt to original-prompt.md

### T2: Production reproduction — BLOCKED on API auth
- Asset check via curl: favicon.png 404, all icons 404, manifest.json 200
- Login attempts failed:
  - admin@cermont.test / Admin123! → UNAUTHORIZED
  - gerencia@cermont.co / Cermont2026!Dev01 → UNAUTHORIZED
  - admin@cermont.co / admin123 → UNAUTHORIZED
- Root cause: Production DB users don't match seed/E2E credentials
- BLOCKER: Need valid production credentials or SSH access to check production DB users
- Workaround: Continue with non-auth tasks (T5, T6, T8, T13)

### Next steps
- T5: Fix assets 404 (known: public/ exists, build/nginx issue)
- T6: Fix manifest/PWA
- T8: Diagnose async listener (local reproduction possible)
- T13: Fix DialogTitle (frontend code fix)
- T9-T12: Blocked until auth resolved
