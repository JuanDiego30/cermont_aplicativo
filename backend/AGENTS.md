# backend/AGENTS.md — Backend Rules

## Scope

This workspace is the **Express 5 API server** for Cermont S.A.S. It is NOT a NestJS app, NOT a Prisma app, NOT a PostgreSQL app.

**Stack:** Node.js ≥22.20.0 | Express 5.2.1 | Mongoose 9.x | MongoDB 7.0 | Zod 4.3.6

---

## Do Not Modify

```txt
frontend/
packages/
package.json (root)
package-lock.json (root)
docker/
```

---

## Architecture Rules

### Layer Order (Strict)
```
routes/      → Endpoint wiring + middleware binding ONLY
middlewares/ → authenticate → authorize → validateBody/validateQuery → next()
controllers/ → Thin HTTP: req parsing → service call → res.json(ApiEnvelope)
services/    → ALL business logic. NEVER accept req, res, or next.
models/      → Mongoose schemas ONLY
utils/       → Pure helper functions
```

### No-Go Zones
- ❌ Never call Mongoose from routes or controllers — go through services
- ❌ Never add `try/catch` to controllers — Express 5 propagates async errors natively
- ❌ Never put business logic in routes or controllers
- ❌ Never import `req`, `res`, or `next` in services
- ❌ Never create endpoints not documented in `docs/architecture/API_ENDPOINT_MATRIX.md`
- ❌ Never duplicate services for existing modules
- ❌ Never swallow errors — always add context, log, or re-throw as typed `AppError`

### Correct Patterns
```typescript
// ✅ Route: wiring only
router.post('/',
  authenticate,
  authorize('gerente', 'residente'),
  validateBody(createOrderSchema),
  orderController.create
);

// ✅ Controller: thin HTTP layer
async create(req: Request, res: Response) {
  const result = await orderService.create(req.body, req.user.id);
  res.status(201).json({ success: true, data: result });
}

// ✅ Service: all business logic
async create(data: CreateOrderDto, userId: string): Promise<Order> {
  const order = await OrderModel.create({ ...data, createdBy: userId });
  await auditService.log('ORDER_CREATED', userId, order._id);
  return order;
}
```

---

## API Conventions

**Base URL:** `http://127.0.0.1:4000/api`

**Response Envelope:**
```typescript
// Success
{ success: true, data: T, message?: string }

// Error
{ success: false, error: { code: "ERROR_CODE", message: string } }

// Paginated
{ success: true, data: T[], pagination: { page, limit, total, totalPages } }
```

**Middleware order per route:**
```
authenticate → authorize(roles?) → validateBody/validateQuery/validateParams → controller
```

---

## RBAC

Roles are defined in `@cermont/domain`. The valid role strings are:
```
gerente | residente | HES | supervisor | operador | tecnico | administrativo | cliente
```
Never hardcode role arrays. Use the helpers from `@cermont/domain`.

---

## MongoDB Connection

Always connect via `127.0.0.1`, NOT `localhost` (Node 22+ resolves localhost as IPv6):
```typescript
await mongoose.connect('mongodb://127.0.0.1:27017/cermont', {
  family: 4,  // Force IPv4
  serverSelectionTimeoutMS: 5000,
});
```

---

## Audit

Critical mutations (create, approve, reject, sign, pay) MUST generate audit events. Use the audit service. Every audit event records: `userId`, `timestamp`, `entity`, `action`, `changes`.

---

## Required Validation

After backend changes:
```bash
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
npm run build -w backend
```
