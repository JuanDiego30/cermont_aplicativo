# 04 — Backend Rules

> Canonical source for Express 5, Mongoose 9, service layer, error handling, and API conventions.

---

## Express 5 — Async Error Handling

Express 5 natively propagates async errors to the global error handler.  
**Never add `try/catch` to controllers.** This is a hard rule with zero exceptions.

```typescript
// ✅ Correct — Express 5 propagates the error automatically
export async function getOrder(req: Request, res: Response): Promise<void> {
  const order = await orderService.getById(req.params.id);
  res.json({ success: true, data: order, error: null, message: 'OK' });
}

// ❌ Incorrect — unnecessary try/catch violates DRY and SRP
export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getById(req.params.id);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}
```

---

## MVC Layer Responsibilities

### Routes (`*.routes.ts`)
Wire middleware chains only:

```typescript
router.get(
  '/:id',
  authenticate,
  authorize('gerente', 'residente', 'supervisor'),
  validateParams(OrderIdSchema),
  orderController.getById,
);
```

Never put business logic or Mongoose calls in route files.

### Controllers (`*.controller.ts`)
HTTP boundary only — parse input → call one service → return response:

```typescript
export async function getOrder(req: Request, res: Response): Promise<void> {
  const order = await orderService.getById(req.params.id);
  res.status(200).json({ success: true, data: order, error: null, message: 'OK' });
}
```

- No Mongoose calls in controllers.
- No business logic in controllers.
- One service call per controller action.

### Services (`*.service.ts`)
Pure business logic:

```typescript
export async function getById(id: string): Promise<Order> {
  const order = await orderRepository.findById(id);
  if (!order) throw new AppError('ORDER_NOT_FOUND', 404, 'Order not found');
  return order;
}
```

- Never import `req`, `res`, or `next`.
- May call multiple repositories if orchestration is required.
- Throw `AppError` for expected business failures.
- Service file > 300 lines → split by responsibility.

### Models (`*.model.ts`)
Mongoose schema definitions only:

```typescript
const orderSchema = new Schema<IOrder>({
  code: { type: String, required: true, unique: true },
  status: { type: String, enum: ORDER_STATUSES, required: true },
  // ...
}, { timestamps: true });

export const Order = model<IOrder>('Order', orderSchema);
```

---

## Error Handling

Use `AppError` for all expected business failures:

```typescript
// Pattern
throw new AppError('ERROR_CODE', httpStatus, 'Human-readable message');

// Examples
throw new AppError('ORDER_NOT_FOUND', 404, 'Order not found');
throw new AppError('INSUFFICIENT_PERMISSIONS', 403, 'Role not authorized for this action');
throw new AppError('VALIDATION_ERROR', 400, 'Invalid input');
```

The global error handler in `src/common/errors/error-handler.ts` catches all thrown errors and returns the standard API envelope.

---

## Input Validation

All API inputs are validated with Zod **before** the controller runs:

```typescript
// In route file:
router.post('/', authenticate, authorize('residente'), validateBody(CreateOrderSchema), orderController.create);

// Schema in @cermont/shared-types — never redefine locally
import { CreateOrderSchema } from '@cermont/shared-types';
```

Use these middleware helpers:
- `validateBody(Schema)` — for `req.body`
- `validateQuery(Schema)` — for `req.query`
- `validateParams(Schema)` — for `req.params`

---

## MongoDB Connection

```typescript
// Always use IPv4 — prevents DNS resolution issues on Windows
mongoose.connect(process.env.MONGODB_URI, { family: 4 });

// Local development URI
// mongodb://127.0.0.1:27017/cermont_dev
// NOT: mongodb://localhost:27017/cermont_dev
```

---

## Middleware Boot Order

The Express app must initialize in this exact order:

```typescript
// 1. Security middleware
app.use(requestId);
app.use(helmet());
app.use(rateLimiter);
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json());

// 2. API routes
app.use('/api', apiRouter);

// 3. Global error handler — ALWAYS LAST
app.use(errorHandler);
```

---

## File Naming

```
orders.controller.ts
orders.service.ts
orders.routes.ts
orders.model.ts
orders.repository.ts   ← optional, for complex query isolation
orders.types.ts        ← local types that don't belong in shared-types
```

---

## Import Order

1. Native Node modules (`path`, `crypto`, etc.)
2. External npm packages (`express`, `mongoose`, `zod`, etc.)
3. Workspace packages (`@cermont/shared-types`, `@cermont/domain`)
4. Local relative imports (`../services/order.service`)

---

## Audit Logging

Sensitive operations (order create/update/delete, user role changes) must write to the audit log.  
Use the shared audit service — do not implement inline in controllers.

---

## Request ID Middleware

Every request receives a unique `X-Request-ID` header (generated by `requestId` middleware).  
Include this ID in all error logs for distributed tracing.
