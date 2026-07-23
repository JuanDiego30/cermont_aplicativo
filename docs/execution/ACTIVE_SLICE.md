# Active Slice — Authentication / Password Recovery / Email Delivery

**Module:** Authentication
**Status:** `review`
**Next:** Frontend token extraction + E2E verification

---

## Defect (DEF-001)

El flujo de recuperación de contraseña no era funcional de extremo a extremo:
- `generateResetToken()` era stub que retornaba `""`
- `resetPassword()` lanzaba excepción "not implemented"
- Controller ignoraba el token generado
- No se enviaba email de recuperación

## Estado Actual (2026-07-23)

### ✅ Backend completado
- `generateResetToken()` — `crypto.randomBytes(32)` → SHA-256 hash → persistencia en User
- `resetPassword()` — timing-safe compare → bcrypt vía model hook → session revocation → auditoría
- `forgotPassword` controller — captura token, envía email via gateway
- `auth-email.service.ts` — servicio separado con plantilla HTML, usa `env.FRONTEND_URL` validado
- Audit actions `PASSWORD_RESET_REQUESTED/COMPLETED` agregados al SSOT
- **Gates:** typecheck ✅ lint ✅ test ✅ build ✅

### ❌ Pendiente
- Frontend `ResetPasswordContent` recibe prop `token?: string` pero `page.tsx` no extrae el token de `useSearchParams()`
- Sin E2E Playwright (requiere frontend funcional)
- Sin sandbox SMTP verificable en desarrollo

## In Scope (para `verified`)

- Extraer `token` de `useSearchParams()` en reset-password page y pasarlo a `ResetPasswordContent`
- E2E: forgot-password → email (dev logger) → reset → login
- Sandbox SMTP (Mailtrap) para verificar entrega de correo

## Out of Scope

- Social login / OAuth
- MFA / WebAuthn passkey
- Rediseño de UI de login
- Otros módulos del producto

## Acceptance Evidence

- [x] Token criptográfico + SHA-256 hash persistido
- [x] Expiración 1h validada
- [x] Timing-safe comparison
- [x] Anti-enumeration de cuentas
- [x] Session revocation post-reset
- [x] Auditoría de eventos
- [x] typecheck, lint, test, build pasan
- [ ] Frontend extrae token de URL
- [ ] E2E completo
- [ ] Sandbox SMTP verificado
