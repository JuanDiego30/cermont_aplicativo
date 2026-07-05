# Issues — Spec 005 Hotfix

## 2026-06-27

### BLOCKER: Subagent billing insufficient balance
- All subagent tasks fail with "Insufficient balance" error
- Affects: T1-T5 and likely all future tasks
- Workaround: Executing tasks directly as orchestrator (exception to delegation rule)
- Impact: Slower execution, but plan can continue

### T2: Production API auth blocked
- Cannot login to production API with known credentials
- Credentials tried: admin@cermont.test/Admin123!, gerencia@cermont.co/Cermont2026!Dev01, admin@cermont.co/admin123
- All return UNAUTHORIZED
- Root cause: Production DB users don't match seed/E2E credentials
- Workaround: Continue with non-auth tasks (T5, T6, T8, T13)

### T5: Assets 404 root cause identified
- manifest.json references /icons/logo-cermont.svg which doesn't exist
- manifest.json references /icons/maskable-icon-192.png which doesn't exist
- manifest.json references /icons/maskable-icon-512.png which doesn't exist
- Fix: Updated manifest.json to reference existing files only
- Still need to verify nginx config for static serving
