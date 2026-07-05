# Backend Checklist

> Run after any change in the `backend/` workspace.

---

## Architecture

- [ ] Controller is thin: parses request → calls one service → returns response.
- [ ] Controller has NO `try/catch`.
- [ ] Controller does NOT call Mongoose directly.
- [ ] Service contains the business logic.
- [ ] Service does NOT import `req`, `res`, or `next`.
- [ ] Service file is ≤ 300 lines (if longer, split by SRP).
- [ ] Route file only wires middleware and controllers.
- [ ] Model file only defines the Mongoose schema.

## Validation

- [ ] Every mutating route (`POST`, `PUT`, `PATCH`) has `validateBody(Schema)` middleware.
- [ ] Every route with path params has `validateParams(Schema)` middleware.
- [ ] Schema is imported from `@cermont/shared-types` — not redefined locally.

## Security

- [ ] Every protected route has `authenticate` middleware.
- [ ] Every role-restricted route has `authorize('role', ...)` middleware.
- [ ] `authorize()` comes after `authenticate()` in the middleware chain.

## Error Handling

- [ ] Expected failures throw `new AppError('CODE', status, 'message')`.
- [ ] No error swallowed silently (no empty catch blocks).
- [ ] No `res.send()` called after an error — let the error handler respond.

## Database

- [ ] MongoDB connection uses `127.0.0.1` (not `localhost`).
- [ ] New Mongoose schemas have indexes on fields used in queries.
- [ ] `timestamps: true` set on all schemas.
- [ ] Sensitive fields (passwords) are NOT returned in API responses (use `.select('-password')`).

## API Response

- [ ] All responses use the standard envelope: `{ success, data, error, message }`.
- [ ] Status codes are semantically correct (201 for create, 204 for delete, etc.).

## Quality

- [ ] `npm run typecheck -w backend` — 0 errors
- [ ] `npm run lint -w backend` — 0 errors
- [ ] `npm run test -w backend` — all pass
