# Workflow: Feature Development

> Use when building a new feature end-to-end.

---

## When to Use
- New endpoint + frontend UI.
- New business module (e.g., new order type, new report).
- Any change that requires coordinating shared-types + backend + frontend.

---

## Steps

### Phase 1 — Audit First
Follow [audit-first.md](./audit-first.md) before writing any code.

---

### Phase 2 — Contract First (shared-types)

1. Read the existing schemas in `packages/shared-types/src/schemas/`.
2. Define the new Zod schema:

```typescript
// packages/shared-types/src/schemas/newFeature.schema.ts
import { z } from 'zod';

export const CreateNewFeatureSchema = z.object({
  name: z.string().min(1).max(100),
  // ...
});

export type CreateNewFeatureInput = z.infer<typeof CreateNewFeatureSchema>;
```

3. Export from the package index.
4. Build and typecheck:

```bash
npm run build -w @cermont/shared-types
npm run typecheck -w @cermont/shared-types
```

5. Confirm the schema compiles before moving to backend.

---

### Phase 3 — Backend

Order: **Model → Service → Controller → Route**

#### 3a. Model
```typescript
// backend/src/models/newFeature.model.ts
import { Schema, model } from 'mongoose';
import type { INewFeature } from '@cermont/shared-types';

const newFeatureSchema = new Schema<INewFeature>({ ... }, { timestamps: true });
export const NewFeature = model<INewFeature>('NewFeature', newFeatureSchema);
```

#### 3b. Service
```typescript
// backend/src/services/newFeature.service.ts
import { CreateNewFeatureInput } from '@cermont/shared-types';
import { AppError } from '../common/errors/AppError';
import { NewFeature } from '../models/newFeature.model';

export async function createNewFeature(input: CreateNewFeatureInput) {
  // business logic
  return NewFeature.create(input);
}
```

#### 3c. Controller (thin — no try/catch)
```typescript
// backend/src/controllers/newFeature.controller.ts
import { Request, Response } from 'express';
import * as newFeatureService from '../services/newFeature.service';

export async function create(req: Request, res: Response): Promise<void> {
  const result = await newFeatureService.createNewFeature(req.body);
  res.status(201).json({ success: true, data: result, error: null, message: 'Created' });
}
```

#### 3d. Route
```typescript
// backend/src/routes/newFeature.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { validateBody } from '../middlewares/validate';
import { CreateNewFeatureSchema } from '@cermont/shared-types';
import * as controller from '../controllers/newFeature.controller';

export const newFeatureRouter = Router();
newFeatureRouter.post('/', authenticate, authorize('gerente'), validateBody(CreateNewFeatureSchema), controller.create);
```

#### 3e. Typecheck Backend
```bash
npm run typecheck -w backend
npm run lint -w backend
npm run test -w backend
```

---

### Phase 4 — Frontend

Order: **queries.ts → form/component → route/page**

#### 4a. Queries
```typescript
// frontend/src/modules/newFeature/queries.ts
import { apiRequest } from '@/lib/http/api-client';
import type { NewFeature } from '@cermont/shared-types';

export const newFeatureKeys = {
  all: ['newFeature'] as const,
  detail: (id: string) => ['newFeature', id] as const,
};

export function useNewFeatures() {
  return useQuery({
    queryKey: newFeatureKeys.all,
    queryFn: () => apiRequest<NewFeature[]>('/new-feature'),
  });
}
```

#### 4b. Form Component
- Use `react-hook-form` + `zodResolver(CreateNewFeatureSchema)`.
- Show loading/error/success states.
- Show `sonner` toast on success and failure.

#### 4c. Add Route to proxy.ts
If the new route requires RBAC, add it to `proxy.ts` exemptions or protected paths.

#### 4d. Typecheck Frontend
```bash
npm run typecheck -w frontend
npm run lint -w frontend
npm run test -w frontend
```

---

### Phase 5 — Tests

1. Write a Vitest unit test for the new service function.
2. Write a Playwright E2E test for the happy path.
3. Verify coverage is not degraded:

```bash
npm run test:coverage
```

---

### Phase 6 — Final Verification

```bash
npm run verify   # all quality gates
```

Confirm:
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 errors
- [ ] `npm run test` — all pass
- [ ] `npm run quality:strict` — all pass
- [ ] `npm run build` — succeeds
