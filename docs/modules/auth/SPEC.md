# Módulo: Autenticación, Sesiones y Correo

## Problema empresarial

Usuarios de múltiples roles (gerentes, técnicos, administrativos, clientes) necesitan acceso seguro con sesiones persistentes via refresh token rotation, protección contra token replay, y recuperación de contraseña por email.

## Roles

Los 15 roles definidos en `@cermont/domain` (`gerente`, `residente`, `hes`, `coord_administrativo`, `auxiliar_contable`, `supervisor`, `auxiliar_hes`, `supervisor_electricista`, `tecnico_electricista`, `operador`, `tecnico`, `oficial_construccion`, `administrativo`, `pasante`, `cliente`). Login/refresh/forgot/reset son públicos (rate-limited). Logout/me/change-password requieren autenticación (`authorizeAllAuthenticated`).

## Casos de uso

1. **Login con credenciales** — `POST /api/auth/login` → JWT accessToken (en memoria) + refreshToken (httpOnly cookie `refreshToken`) + cookie `userRole` (lectura JS)
2. **Login con WebAuthn** — `webauthn.service.ts`: register passkey, authenticate con passkey, emite mismo token pair
3. **Portal login** — `portalLogin()` para rol `cliente` exclusivamente
4. **Refresh automático** — `POST /api/auth/refresh` lee cookie, rota refreshToken (old → `rotated`, new en misma `familyId`)
5. **Logout** — revoca access vía `TokenBlacklist` + refresh vía status `revoked`, limpia cookies
6. **Ver perfil** — `GET /api/auth/me` via `UserService.getUserById()`
7. **Cambiar contraseña** — `PATCH /api/auth/change-password` incrementa `tokenVersion`, revoca todas las sesiones activas
8. **Forgot password** — `POST /api/auth/forgot-password` genera resetToken (crypto.randomBytes 32), almacena hash + expiry 1h en User, envía email
9. **Reset password** — `POST /api/auth/reset-password` valida hash, actualiza password, incrementa tokenVersion
10. **Listar sesiones** — `listUserSessions(userId)` retorna últimas 50 sesiones del usuario
11. **Revocar sesión** — `revokeSession(jti, userId, reason)` revoca una sesión específica

## Entidades

- **User** (Mongoose `backend/src/models/User.ts`): `_id`, `name`, `email`, `password` (hashed bcrypt, `select: false`), `role`, `isActive`, `tokenVersion`, `resetPasswordToken`, `resetPasswordExpires`, `webauthnCredentials`, `webauthnChallenge`
- **RefreshToken** (Mongoose `backend/src/models/RefreshToken.ts`): `jti` (único), `userId`, `familyId`, `tokenHash` (SHA-256), `tokenVersion`, `expiresAt`, `deleteAt` (TTL index), `status.state` (`active` | `rotated` | `revoked` | `compromised`), `status.reason` (`none` | `rotation` | `logout` | `password_change` | `reuse_detected` | `expired`), `status.replacedByJti`
- **TokenBlacklist** (Mongoose): `jti`, `expiresAt`, `reason` — para access tokens revocados
- **RateLimitBucket** (Mongoose): usado por rate-limiter middleware

## Estados del token

```
active ──→ rotated (refresh rotation)
active ──→ revoked (logout, password_change, expired)
active ──→ compromised (reuse_detected — toda la familia se revoca + tokenVersion incrementado)
```

## Precondiciones

- User debe existir con `isActive: true`
- `JWT_SECRET` y `REFRESH_TOKEN_SECRET` configurados en env
- Rate limiter middleware aplicado en endpoints públicos (`authLimiter` 10/15min, `refreshLimiter` 10/15min)
- Token refresh: `tokenType === "refresh"`, `jti`, `familyId`, `tokenVersion` deben existir en claims

## Blockers

- Credenciales inválidas → `401 "Invalid email or password"`
- Cuenta desactivada → `401 "User account is deactivated"`
- Token expirado → `401 "Refresh token expired"`
- Token revocado → `401 "Refresh token has been revoked"`
- Token reusado (replay) → familia comprometida + `tokenVersion++` → `401 "Refresh token reuse detected"`
- Legacy token (missing claims) → `401 "Session expired — please log in again"`
- `tokenVersion` mismatch (password change) → `401 "Refresh token version is no longer valid"`
- Nueva contraseña igual a actual → `400 "New password must be different"`

## Permisos

| Endpoint | Acceso |
|----------|--------|
| `POST /api/auth/login` | Público (rate-limited `authLimiter`) |
| `POST /api/auth/refresh` | Público (rate-limited `refreshLimiter`) |
| `POST /api/auth/logout` | Autenticado (`authorizeAllAuthenticated`) |
| `GET /api/auth/me` | Autenticado (`authorizeAllAuthenticated`) |
| `PATCH /api/auth/change-password` | Autenticado + `validateBody(ChangePasswordSchema)` |
| `POST /api/auth/forgot-password` | Público + `validateBody(ForgotPasswordSchema)` |
| `POST /api/auth/reset-password` | Público + `validateBody(ResetPasswordSchema)` |
| Sesiones (list/revoke) | Solo sesiones propias (IDOR protegido) |

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login email+password, devuelve `{accessToken, user}`, setea cookies `refreshToken` + `userRole` |
| POST | `/api/auth/refresh` | Lee cookie `refreshToken`, rota token, devuelve nuevo `accessToken` |
| POST | `/api/auth/logout` | Revoca access (blacklist) + refresh (status revoked), limpia cookies |
| GET | `/api/auth/me` | Perfil del usuario autenticado via `UserService.getUserById()` |
| PATCH | `/api/auth/change-password` | Valida currentPassword, actualiza password, revoca sesiones |
| POST | `/api/auth/forgot-password` | Genera reset token, almacena hash en User, envía email |
| POST | `/api/auth/reset-password` | Valida token, actualiza password + tokenVersion |
| POST | `/api/auth/register` | No implementado en backend — solo frontend proxy |
| POST | `/api/auth/register-client` | Frontend proxy route handler |

## Pantallas

- **`/login`** — Form email+password, submit → `useAuthActions.login()` → almacena accessToken en Zustand (memoria)
- **`/register`** — Form registro cliente
- **`/forgot-password`** — Form email → `POST /api/auth/forgot-password`
- **`/reset-password`** — Form token + new password → `POST /api/auth/reset-password`
- **`/unauthorized`** — Mostrado cuando el rol no tiene acceso RBAC a una ruta

## Estados UI

- **loading** — Spinner durante login mutation
- **error** — Mensaje de error (`Invalid email or password`, `Network error`)
- **rate-limited** — `429 Too Many Requests`
- **success** — Redirect a dashboard post-login; clear auth + redirect a `/login` post-logout

## Eventos de auditoría

| Evento | Disparador |
|--------|------------|
| `LOGIN_SUCCESS` | Login exitoso (incluye `loginMethod: "password" \| "passkey"`) |
| `LOGOUT` | Logout exitoso |
| `SESSION_REVOKED` | Revocación de sesión específica |
| `REFRESH_TOKEN_REUSE_DETECTED` | Token replay detectado — alerta de seguridad |
| `PASSKEY_REGISTERED` | Registro de WebAuthn passkey |

## Casos negativos

- Login con wrong password → 401
- Login con cuenta desactivada → 401
- Refresh con token expirado → 401 + cookies limpiadas
- Refresh con token revocado → 401 + cookies limpiadas
- Refresh con token reusado → familia comprometida, `tokenVersion` incrementado
- Refresh con legacy token (missing claims) → `401 SESSION_EXPIRED`
- Refresh post-password-change (tokenVersion mismatch) → 401
- Change-password con wrong current → 401
- Change-password con mismo password → 400
- Acceso `/me` sin token → 401
- Rate limit excedido → 429

## Pruebas E2E

- Login credenciales válidas → accessToken + refreshToken cookie
- Login credenciales inválidas → 401, sin token
- Refresh persistence → nueva accessToken + refreshToken rotado
- Logout → limpia cookies, refreshes posteriores fallan
- Forgot-password → genera token, almacena hash, retorna success
- Reset-password → permite login con nuevo password
- Change-password → invalida sesiones existentes
- Token reuse detection → familia comprometida
