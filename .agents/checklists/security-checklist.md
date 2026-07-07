# Security Checklist

> Run whenever a change touches: auth, RBAC, cookies, routes, API endpoints, or file uploads.

---

## Authentication

- [ ] Access token stored only in Zustand memory (`auth.store.ts`) — NOT in localStorage.
- [ ] Refresh token stored ONLY in HttpOnly cookie (`Secure + SameSite=strict` in production).
- [ ] JWT is validated in `authenticate` middleware before any controller runs.
- [ ] Expired tokens return 401 (not 403 or 500).
- [ ] `/auth/refresh` endpoint uses the HttpOnly cookie, not a body parameter.

## Authorization (RBAC)

- [ ] Every new protected route has both `authenticate` AND `authorize()` middleware.
- [ ] `authorize()` uses role constants from `@cermont/domain` — not hardcoded strings.
- [ ] Role checking happens on the backend — never relied upon from frontend alone.
- [ ] `proxy.ts` updated with new route protections if a new dashboard route was added.
- [ ] Public paths in `proxy.ts` exemption list are minimal and justified.

## Input Validation

- [ ] All `POST`/`PUT`/`PATCH` bodies validated with `validateBody(Schema)` middleware.
- [ ] All query params validated with `validateQuery(Schema)` where used.
- [ ] All path params validated with `validateParams(Schema)` where typed IDs are expected.
- [ ] Mongoose receives only parsed Zod data — never raw `req.body`.

## Secrets & Environment

- [ ] No secrets hardcoded in source code.
- [ ] No secrets in commit history.
- [ ] `.env` files excluded from git via `.gitignore`.
- [ ] `.env.example` updated if a new variable was added.
- [ ] `validateEnv()` updated to require the new variable.

## HTTP Security

- [ ] `helmet()` middleware active (already set in app bootstrap — verify not removed).
- [ ] CORS `origin` list does not include `*` in production.
- [ ] Rate limiting applied to `/auth/login` and any other auth-adjacent endpoints.
- [ ] `express-mongo-sanitize` active (prevents NoSQL injection).

## File Uploads

- [ ] MIME type validated (not just file extension).
- [ ] File size limited via `multer` config.
- [ ] File name sanitized (no path traversal characters).
- [ ] Files stored outside the web root or in dedicated storage.

## Logging

- [ ] Sensitive fields (passwords, tokens, PII) are masked in all logs.
- [ ] Error logs include `X-Request-ID` for traceability.
- [ ] No user enumeration possible from error messages.
