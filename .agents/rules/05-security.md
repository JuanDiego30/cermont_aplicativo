# 05 — Security Rules

> Canonical source for Security-by-Design, RBAC, JWT/cookie handling, rate limiting, CORS, and upload security.

---

## Security Principles

### Security by Design
Security is built in from day one — not added after.  
Every feature must answer: "who can do this, and how do we prevent abuse?"

### Principle of Least Privilege (PoLP)
Grant only the minimum permissions required for a role to perform its function.  
Default: deny all. Explicitly permit what is allowed.

### Defense in Depth
Security is enforced at multiple independent layers. Compromise of one layer does not expose the system:

```
Layer 1: proxy.ts  (frontend navigation guard)
Layer 2: authenticate middleware  (validates JWT)
Layer 3: authorize middleware  (checks role)
Layer 4: service layer  (validates ownership/business rules)
Layer 5: Zod validation  (rejects malformed input)
Layer 6: Mongoose schema  (database-level integrity)
```

---

## Authentication — JWT

- **Access token:** short-lived (15 min), stored in memory only (`auth.store.ts` Zustand, not persisted to localStorage/sessionStorage).
- **Refresh token:** long-lived (7 days), stored in **HttpOnly cookie** (Secure + SameSite=strict in production).

```typescript
// ✅ Correct — HttpOnly cookie for refresh token
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

// ❌ FORBIDDEN — never store tokens in localStorage
localStorage.setItem('token', accessToken);
```

### JWT Validation
The `authenticate` middleware validates the access token on every protected request:
1. Extract `Authorization: Bearer <token>` header.
2. Verify signature using `JWT_SECRET`.
3. Check expiry.
4. Attach `req.user` with `{ id, role }`.

---

## Authorization — RBAC

Role constants (lowercase):
```
gerente | residente | hes | supervisor | operador | tecnico | administrativo | cliente
```

Always import role constants from `@cermont/domain` — never hardcode strings.

### Route Authorization Pattern

```typescript
// ✅ Correct — role check via middleware before controller
router.delete(
  '/:id',
  authenticate,
  authorize('gerente'),        // Only gerente can delete
  validateParams(OrderIdSchema),
  orderController.delete,
);
```

### RBAC Permissions Summary

| Role | Can Create | Can Update | Can Delete (logical) | Read All | Read Own |
|------|-----------|-----------|---------------------|----------|---------|
| gerente | ✅ | ✅ | ✅ | ✅ | ✅ |
| residente | ✅ | ✅ | ❌ | ✅ | ✅ |
| hes | ❌ | ❌ | ❌ | ✅ | ✅ |
| supervisor | ❌ | ✅ (task assign) | ❌ | ✅ | ✅ |
| administrativo | ❌ | ✅ (costs) | ❌ | Costs only | ✅ |
| operador | ❌ | ❌ | ❌ | Assigned only | ✅ |
| tecnico | ❌ | ✅ (state seq.) | ❌ | Assigned only | ✅ |
| cliente | ❌ | ❌ | ❌ | ❌ | Own orders only |

---

## Secrets Management

- **Never hardcode secrets** in source code.
- All secrets live in `.env` / `.env.local` files (excluded from git via `.gitignore`).
- Environment variables are validated at startup via `validateEnv()`.
- `.env.example` lists required variables (without values) for documentation.

---

## HTTP Security Headers — Helmet

Express app uses `helmet()` as the first middleware:

```typescript
app.use(helmet({
  contentSecurityPolicy: { ... },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
```

---

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                      // max 5 login attempts
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts' } },
});

router.post('/auth/login', authLimiter, authController.login);
```

---

## CORS

Explicitly list allowed origins — never use `origin: '*'` in production.

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
  credentials: true,   // required for cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
```

---

## File Upload Security

All file uploads (evidencias, documents) must:
1. Validate MIME type (not just extension).
2. Enforce file size limits.
3. Sanitize file names (no path traversal).
4. Store outside the web root or in object storage.
5. Use the `multer` middleware configured with limits.

---

## Input Sanitization

- Use `express-mongo-sanitize` to prevent NoSQL injection.
- Zod validation rejects unexpected fields by default (`.strict()` or `.strip()`).
- Never pass raw `req.body` to Mongoose — always parse through Zod first.

---

## No Secrets in Logs

Mask sensitive fields in all log output:

```typescript
// ✅ Correct
logger.info('Login attempt', { email: maskEmail(email) });

// ❌ Incorrect
logger.info('Login attempt', { email, password });
```

---

## Frontend Security Rules

- `proxy.ts` is the ONLY place for frontend RBAC checks. Never put role checks inline in components.
- `accessToken` lives in Zustand memory — **never in localStorage, sessionStorage, or cookies**.
- `refreshToken` arrives as an HttpOnly cookie — never readable by JavaScript.
- Never expose backend URLs, credentials, or internal IDs in client-side code.
