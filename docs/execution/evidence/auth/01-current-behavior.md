# 01 — Current Behavior: Password Recovery

## Estado inicial

On `integration/documentation-baseline` (SHA bc2b64f), the password recovery was **fully stubbed**:

- `generateResetToken()` returned empty string ""
- `resetPassword()` always threw `BadRequestError`
- Controller had `// sendResetPasswordEmail(email, resetToken)` commented out
- No email sending implementation existed

## Estado actual

After Phase 01 implementation, the complete flow is:

### Backend (auth.service.ts)

- `generateResetToken()`: CSPRNG (crypto.randomBytes, 32 bytes, 64 hex chars), SHA-256 hash persisted on User model, 1 hour TTL, anti-enumeration (returns "" for non-existent/inactive users)
- `sendResetPasswordEmail()`: Builds HTML email with CERMONT branding, sends via emailGateway, logs delivery, creates audit logs (PASSWORD_RESET_EMAIL_SENT / PASSWORD_RESET_EMAIL_FAILED)
- `resetPassword()`: Hash lookup, expiry check, timing-safe comparison, password update, tokenVersion increment, resetToken fields cleared, refresh sessions revoked, audit log (PASSWORD_RESET_SUCCESS)

### Backend (auth.controller.ts)

- `forgotPassword()`: Validates body, calls generateResetToken, awaits sendResetPasswordEmail, always returns generic 200
- `resetPassword()`: Validates body, calls resetPassword, returns success

### Frontend

- `ForgotPasswordContent.tsx`: Email form, loading state, generic success message
- `ResetPasswordContent.tsx`: Token from URL, password + confirm, loading, error handling
- API routes proxy to backend

### Causa raíz original

The implementation was intentionally stubbed/commented out during initial development. All infrastructure existed (User model fields, email gateway, env config) but the auth service functions and controller calls were never completed.

### Pruebas agregadas

17 service tests + 10 controller tests — all passing.

### Pruebas faltantes

- E2E with Mailpit sandbox (requires running backend + frontend)
- Sandbox delivery verification
