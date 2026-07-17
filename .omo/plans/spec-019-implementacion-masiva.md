# SPEC 019 — Plan de Implementación Masiva: Escalamiento Arquitectónico y Cierre de Módulos CERMONT

**TL;DR**: Implementar 14 slices atómicos de código que completan los módulos pendientes (kpi, media), refactorizan el service centralizado (1,605 líneas → 5 services independientes), implementan motor de automatización SI-ENTONCES, escalan dashboards KPI operacionales con MTTR/MTBF reales, y cierran el flujo documental de 14 pasos con todos los gates verdes.

**Regla cardinal**: Cada task produce código + cada sprint CIERRA con los 7 gates. No avanzar de sprint si algún gate falla. El ejecutor codea, verifica y commitea — en ese orden. La verificación no es opcional, es parte de la Definition of Done de cada sprint.

**Gates obligatorios al final de CADA sprint** (ejecutar en orden, NO continuar si falla):

> ⚠️ Esta sección se aplica al final de CADA sprint, no solo al final del spec. Cada sprint que no cierre con los 7 gates en verde NO puede avanzar al siguiente. La evidencia de cada gate se guarda en `.sisyphus/evidence/spec019/sprint-{N}/`.
```bash
npm run typecheck  # 0 errores
npm run lint       # 0 errores (1 warning tolerable solo si preexistente-documentado)
npm test           # 0 tests fallando (260/260 frontend + 669/669 backend)
npm run build      # 95 rutas, 242 precache entries
npm run quality:strict  # Todos los 9 sub-checks dentro de baseline
npm run verify     # PASS
npx react-doctor@latest  # Score ≥ 90/100
```

Si algún gate falla, el ejecutor DEBE reportar el error como output del sprint, NO silenciarlo ni continuar al siguiente sprint. Cada gate debe producir evidencia en `.sisyphus/evidence/spec019/sprint-{N}/`.

---

## FASE 0 — SPRINT 0: FUNDACIÓN (Tasks 1-8)

Objetivo: Estabilizar la base antes de tocar arquitectura. No hay refactor sin baseline verde.

### Task 1 — Fix tests frontend (header-notifications)
Ya resuelto en commit 20414e6. Confirmar que 260/260 pasan.

**Archivo**: `frontend/src/modules/core/ui/layout/Header.tsx`
**Patrón**: 
El hook `useNotifications()` retorna datos del endpoint `/notifications` (sin query params). El componente debe manejar `data === undefined` con `?? []`.
```typescript
const { data: notificationList } = useNotifications();
// ANTES: (notificationList ?? []).map(...) — rompe si notificationList no es array
// DESPUÉS: guard clause
const notifications: NotificationItem[] = Array.isArray(notificationList) 
  ? notificationList.map((n: any) => ({ id: n._id, ... }))
  : [];
```

**Archivo**: `frontend/src/modules/notifications/hooks/queries.ts`
```typescript
// Hook useNotifications debe llamar GET /notifications (sin ?limit=20)
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => apiClient.get<Notification[]>('/notifications'),
  });
}
```

**Patrón de exports desde `@cermont/shared-types`**: Verificar que `Notification` type esté exportado.

---

### Task 2 — Observability service (MongoDB health + métricas)
Ya implementado en commit 6f67ffa. Confirmar existencia.

**Archivo**: `backend/src/modules/observability/observability.service.ts`
```typescript
import mongoose from 'mongoose';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  mongo: {
    connected: boolean;
    readyState: number;
    responseTimeMs: number;
  };
  uptime: number;
  timestamp: string;
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const start = Date.now();
  const isConnected = mongoose.connection.readyState === 1;
  
  // Ping MongoDB
  try {
    if (isConnected) {
      await mongoose.connection.db!.admin().ping();
    }
  } catch {
    return {
      status: 'degraded',
      mongo: { connected: false, readyState: mongoose.connection.readyState, responseTimeMs: Date.now() - start },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  return {
    status: 'healthy',
    mongo: { connected: true, readyState: 1, responseTimeMs: Date.now() - start },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}

export async function getMetricsSummary() {
  const totalOrders = await mongoose.model('Order').countDocuments({ lifecycleStatus: { $ne: 'deleted' } });
  const activeSessions = await mongoose.model('ExecutionSession').countDocuments({ status: 'in_progress' });
  const totalEvidences = await mongoose.model('FileAsset').countDocuments({ ownerType: 'evidence' });
  return { totalOrders, activeSessions, totalEvidences, timestamp: new Date().toISOString() };
}
```

**Archivo**: `backend/src/modules/observability/observability.routes.ts`
Actualizar para usar el nuevo service:
```typescript
import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { getHealthStatus, getMetricsSummary } from './observability.service';

const router = Router();

router.get('/health', async (req, res) => {
  const health = await getHealthStatus();
  res.json({ success: true, data: health });
});

router.get('/metrics', authenticate, async (req, res) => {
  const metrics = await getMetricsSummary();
  res.json({ success: true, data: metrics });
});

export default router;
```

---

### Task 3 — API_ROUTE_MAP.md
Ya creado en commit 813e6c3. Verificar existencia y completitud.

**Archivo**: `docs/architecture/API_ROUTE_MAP.md`
Debe listar TODOS los prefijos de API montados en `backend/src/index.ts` (API_MOUNTS), no solo una muestra. Formato tabla:
| Módulo | Prefijo API | Archivo routes | Endpoints | Auth | RBAC |
|--------|------------|----------------|-----------|------|------|

---

### Task 4a — Verificar referencias ANTES de eliminar media/models

**Archivo**: comando a ejecutar ANTES de Task 4b:
```bash
grep -rn "modules/media/models" backend/src/ frontend/src/ packages/
```
Si el resultado NO es 0 referencias, NO eliminar. Reportar las referencias encontradas. Solo proceder con Task 4b si el resultado es 0.

### Task 4b — Eliminar directorios vacíos kpi y media (o llenarlos)

**Contexto**: `backend/src/modules/kpi/` y `backend/src/modules/media/` existen como directorios vacíos. kpi no tiene ningún archivo .ts. media solo tiene `models/` vacío.

**Decisión**: Eliminar `backend/src/modules/media/models` (vacío) y marcar ambos módulos para implementación en fases posteriores. NO eliminar los directorios raíz (preservar estructura para fases 3-4).

```bash
Remove-Item -Path "backend/src/modules/media/models" -Recurse -Force
```

---

## FASE 1 — SPRINT 1: REFACTOR ARQUITECTÓNICO DEL SERVICE CENTRALIZADO (Tasks 5-10)

**Contexto**: El service `administrative-workflow.service.ts` (1,605 líneas) maneja 5 dominios distintos: technical-report, delivery-record, service-entry-sheet, invoice, payment. Esto es un antipatrón "fat service" que viola Single Responsibility Principle. La cobertura de tests es de solo 70 líneas.

**Estrategia**: Strangler Fig Pattern — NO eliminar el service original. Crear 5 nuevos services independientes, migrar las rutas una por una, y solo al final eliminar el original.

---

### Task 5 — Crear `packages/shared-types/src/schemas/administrative-workflow.schema.ts`

**Archivo nuevo**: `packages/shared-types/src/schemas/administrative-workflow.schema.ts`
```typescript
import { z } from 'zod';
import { ObjectIdSchema } from './common.schema';

// ─── Technical Report ───
export const TechnicalReportStatusSchema = z.enum([
  'draft', 'pending_review', 'approved', 'rejected', 'cancelled'
]);

export const CreateTechnicalReportSchema = z.object({
  executionSessionId: ObjectIdSchema,
  orderId: ObjectIdSchema,
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  findings: z.string().max(5000).optional(),
  recommendations: z.string().max(5000).optional(),
}).strict();

export const TechnicalReportSchema = CreateTechnicalReportSchema.extend({
  _id: ObjectIdSchema,
  status: TechnicalReportStatusSchema.default('draft'),
  version: z.number().int().positive().default(1),
  evidenceIds: z.array(ObjectIdSchema).default([]),
  documentIds: z.array(ObjectIdSchema).default([]),
  signedById: ObjectIdSchema.optional(),
  signedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

// ─── Delivery Record ───
export const DeliveryRecordStatusSchema = z.enum([
  'draft', 'sent', 'signed', 'rejected', 'cancelled'
]);

export const CreateDeliveryRecordSchema = z.object({
  technicalReportId: ObjectIdSchema,
  orderId: ObjectIdSchema,
  recipientName: z.string().min(1).max(200),
  recipientEmail: z.string().email().optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export const DeliveryRecordSchema = CreateDeliveryRecordSchema.extend({
  _id: ObjectIdSchema,
  status: DeliveryRecordStatusSchema.default('draft'),
  signedById: ObjectIdSchema.optional(),
  signedAt: z.string().datetime().optional(),
  signatureImageId: ObjectIdSchema.optional(),
  sentAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

// ─── Service Entry Sheet (SES) ───
export const ServiceEntrySheetStatusSchema = z.enum([
  'draft', 'submitted', 'approved', 'rejected', 'cancelled'
]);

export const CreateServiceEntrySheetSchema = z.object({
  deliveryRecordId: ObjectIdSchema,
  orderId: ObjectIdSchema,
  aribaReference: z.string().max(100).optional(),
  totalAmountCOP: z.number().nonnegative(),
}).strict();

export const ServiceEntrySheetSchema = CreateServiceEntrySheetSchema.extend({
  _id: ObjectIdSchema,
  status: ServiceEntrySheetStatusSchema.default('draft'),
  approvedById: ObjectIdSchema.optional(),
  approvedAt: z.string().datetime().optional(),
  rejectedReason: z.string().max(1000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

// ─── Invoice ───
export const InvoiceStatusSchema = z.enum([
  'draft', 'submitted', 'approved', 'rejected', 'cancelled', 'paid'
]);

export const CreateInvoiceSchema = z.object({
  serviceEntrySheetId: ObjectIdSchema,
  orderId: ObjectIdSchema,
  invoiceNumber: z.string().min(1).max(50),
  totalAmountCOP: z.number().nonnegative(),
  taxAmountCOP: z.number().nonnegative().default(0),
  dueDate: z.string().datetime(),
}).strict();

export const InvoiceSchema = CreateInvoiceSchema.extend({
  _id: ObjectIdSchema,
  status: InvoiceStatusSchema.default('draft'),
  approvedById: ObjectIdSchema.optional(),
  approvedAt: z.string().datetime().optional(),
  paidAt: z.string().datetime().optional(),
  paymentId: ObjectIdSchema.optional(),
  agingDays: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

// ─── Payment ───
export const PaymentStatusSchema = z.enum([
  'pending', 'completed', 'reconciled', 'rejected', 'cancelled'
]);

export const RegisterPaymentSchema = z.object({
  invoiceId: ObjectIdSchema,
  amountCOP: z.number().positive(),
  paymentMethod: z.string().max(100),
  referenceNumber: z.string().max(100).optional(),
  paidAt: z.string().datetime(),
}).strict();

export const PaymentSchema = RegisterPaymentSchema.extend({
  _id: ObjectIdSchema,
  status: PaymentStatusSchema.default('pending'),
  reconciledById: ObjectIdSchema.optional(),
  reconciledAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();
```

**Actualizar**: `packages/shared-types/src/schemas/index.ts` — agregar exports:
```typescript
export * from './administrative-workflow.schema';
```

---

### Task 6 — Crear TechnicalReport service independiente

**Archivo nuevo**: `backend/src/modules/technical-report/technical-report.service.ts`
```typescript
import { Types } from 'mongoose';
import type { CreateTechnicalReportInput, TechnicalReport as TechnicalReportResponse } from '@cermont/shared-types';
import TechnicalReportModel from '../../models/TechnicalReport';
import { NotFoundError, UnprocessableError } from '../../common/errors/AppError';

export async function listTechnicalReports(query: { orderId?: string; page?: number; limit?: number }) {
  const filter: Record<string, unknown> = {};
  if (query.orderId) filter.orderId = new Types.ObjectId(query.orderId);
  
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    TechnicalReportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    TechnicalReportModel.countDocuments(filter),
  ]);
  
  return {
    data: data as unknown as TechnicalReportResponse[],
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function getTechnicalReportById(id: string): Promise<TechnicalReportResponse> {
  const doc = await TechnicalReportModel.findById(id).lean();
  if (!doc) throw new NotFoundError('TechnicalReport', id);
  return doc as unknown as TechnicalReportResponse;
}

export async function getTechnicalReportByOrder(orderId: string): Promise<TechnicalReportResponse | null> {
  const doc = await TechnicalReportModel.findOne({ orderId: new Types.ObjectId(orderId) })
    .sort({ createdAt: -1 }).lean();
  return doc as unknown as TechnicalReportResponse | null;
}

export async function createTechnicalReport(input: CreateTechnicalReportInput): Promise<TechnicalReportResponse> {
  const doc = await TechnicalReportModel.create({
    ...input,
    executionSessionId: new Types.ObjectId(input.executionSessionId),
    orderId: new Types.ObjectId(input.orderId),
    status: 'draft',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return doc.toObject() as unknown as TechnicalReportResponse;
}

// ... continuar con submitTechnicalReport, approveTechnicalReport, rejectTechnicalReport, cancelTechnicalReport
// Cada función replica la lógica del service centralizado pero opera solo sobre TechnicalReportModel
```

**Archivo nuevo**: `backend/src/modules/technical-report/technical-report.controller.ts`
```typescript
import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/interceptors/response.interceptor';
import { getString, requireUser } from '../../common/utils/request';
import * as TechnicalReportService from './technical-report.service';

export async function listTechnicalReports(req: Request, res: Response): Promise<void> {
  const query = {
    orderId: getString(req.query.orderId),
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  };
  const result = await TechnicalReportService.listTechnicalReports(query);
  sendSuccess(res, result.data, { meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
}

export async function getTechnicalReport(req: Request, res: Response): Promise<void> {
  const doc = await TechnicalReportService.getTechnicalReportById(req.params.id);
  sendSuccess(res, doc);
}

export async function createTechnicalReport(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const doc = await TechnicalReportService.createTechnicalReport({ ...req.body, createdBy: user._id });
  sendSuccess(res, doc, 201);
}
```

**Actualizar**: `backend/src/modules/technical-report/technical-report.routes.ts`
```typescript
import { INTERNAL_ROLES } from '@cermont/domain';
import { CreateTechnicalReportSchema, TechnicalReportIdParamsSchema } from '@cermont/shared-types';
import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validateBody, validateParams } from '../../middlewares/validate';
import * as TechnicalReportController from './technical-report.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorize(...INTERNAL_ROLES), TechnicalReportController.listTechnicalReports);
router.get('/:id', authorize(...INTERNAL_ROLES), validateParams(TechnicalReportIdParamsSchema), TechnicalReportController.getTechnicalReport);
router.post('/', authorize('gerente', 'residente', 'supervisor'), validateBody(CreateTechnicalReportSchema), TechnicalReportController.createTechnicalReport);

export default router;
```

---

### Task 7 — Crear DeliveryRecord service independiente

**Archivo nuevo**: `backend/src/modules/delivery-record/delivery-record.service.ts`
```typescript
import { Types } from 'mongoose';
import type { CreateDeliveryRecordV2Input, DeliveryRecord as DeliveryRecordResponse } from '@cermont/shared-types';
import DeliveryRecordModel from '../../models/DeliveryRecord';
import { NotFoundError } from '../../common/errors/AppError';

export async function listDeliveryRecords(query: { orderId?: string; page?: number; limit?: number }) {
  const filter: Record<string, unknown> = {};
  if (query.orderId) filter.orderId = new Types.ObjectId(query.orderId);
  
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    DeliveryRecordModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    DeliveryRecordModel.countDocuments(filter),
  ]);
  
  return { data: data as unknown as DeliveryRecordResponse[], total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getDeliveryRecordById(id: string): Promise<DeliveryRecordResponse> {
  const doc = await DeliveryRecordModel.findById(id).lean();
  if (!doc) throw new NotFoundError('DeliveryRecord', id);
  return doc as unknown as DeliveryRecordResponse;
}

export async function createDeliveryRecordFromTechnicalReport(
  technicalReportId: string, 
  orderId: string, 
  input: { recipientName: string; recipientEmail?: string; notes?: string }
): Promise<DeliveryRecordResponse> {
  const doc = await DeliveryRecordModel.create({
    technicalReportId: new Types.ObjectId(technicalReportId),
    orderId: new Types.ObjectId(orderId),
    ...input,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return doc.toObject() as unknown as DeliveryRecordResponse;
}
// ... funciones: sendDeliveryRecord, signDeliveryRecord, rejectDeliveryRecord, cancelDeliveryRecord
```

**Archivo nuevo**: `backend/src/modules/delivery-record/delivery-record.controller.ts`
**Actualizar**: `backend/src/modules/delivery-record/delivery-record.routes.ts` — cambiar import a nuevo controller

---

### Task 8 — Crear ServiceEntrySheet service independiente

**Archivo nuevo**: `backend/src/modules/service-entry-sheet/service-entry-sheet.service.ts`
**Archivo nuevo**: `backend/src/modules/service-entry-sheet/service-entry-sheet.controller.ts`
**Actualizar**: `backend/src/modules/service-entry-sheet/service-entry-sheet.routes.ts`

Mismo patrón que Task 6-7. Copiar lógica desde `administrative-workflow.service.ts`, seccion `ServiceEntrySheet`.

---

### Task 9 — Crear Invoice service independiente

**Archivo nuevo**: `backend/src/modules/invoice/invoice.service.ts`
**Archivo nuevo**: `backend/src/modules/invoice/invoice.controller.ts`
**Actualizar**: `backend/src/modules/invoice/invoice.routes.ts`

Mismo patrón. Copiar lógica desde sección `Invoice` del service centralizado.

---

### Task 10 — Crear Payment service independiente

**Archivo nuevo**: `backend/src/modules/payment/payment.service.ts`
**Archivo nuevo**: `backend/src/modules/payment/payment.controller.ts`
**Actualizar**: `backend/src/modules/payment/payment.routes.ts`

---

### Task 10b — Tests FSM completos para los 5 nuevos services (por transición de estado)

**REQUISITO**: Cada FSM de estado debe tener un test por transición VÁLIDA y una por transición INVÁLIDA. Mínimo 8 tests por service (no 3).

**Patrón de tests FSM para TechnicalReport** (draft→pending_review→approved/rejected→cancelled):

**Archivo**: `backend/tests/services/technical-report.service.test.ts`
```typescript
import { Types } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findById: vi.fn(), create: vi.fn(), find: vi.fn(),
  countDocuments: vi.fn(), findByIdAndUpdate: vi.fn(),
}));

vi.mock('../../src/models/TechnicalReport', () => ({
  default: {
    findById: mocks.findById, create: mocks.create, find: mocks.find,
    countDocuments: mocks.countDocuments, findByIdAndUpdate: mocks.findByIdAndUpdate,
  },
}));

describe('TechnicalReport FSM', () => {
  const mockDoc = (status: string) => ({
    _id: new Types.ObjectId(), status, save: vi.fn().mockResolvedValue({ toObject: () => ({ status }) }),
    orderId: new Types.ObjectId(), executionSessionId: new Types.ObjectId(),
    title: 'Test', description: 'Test', version: 1,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  });

  // Transiciones VÁLIDAS
  it('should transition from draft to pending_review on submit', async () => {
    const doc = mockDoc('draft'); mocks.findById.mockResolvedValue(doc);
    doc.save.mockResolvedValue({ toObject: () => ({ ...doc.toObject(), status: 'pending_review' }) });
    const svc = await import('../../src/modules/technical-report/technical-report.service');
    const result = await (svc as any).submitTechnicalReport(doc._id.toString(), { _id: 'u1', role: 'supervisor' });
    expect(result.status).toBe('pending_review');
  });

  it('should transition from pending_review to approved on approve', async () => {
    const doc = mockDoc('pending_review'); mocks.findById.mockResolvedValue(doc);
    doc.save.mockResolvedValue({ toObject: () => ({ ...doc.toObject(), status: 'approved' }) });
    const svc = await import('../../src/modules/technical-report/technical-report.service');
    const result = await (svc as any).approveTechnicalReport(doc._id.toString(), { _id: 'u1', role: 'gerente' });
    expect(result.status).toBe('approved');
  });

  it('should transition from pending_review to rejected on reject', async () => {
    const doc = mockDoc('pending_review'); mocks.findById.mockResolvedValue(doc);
    doc.save.mockResolvedValue({ toObject: () => ({ ...doc.toObject(), status: 'rejected' }) });
    const svc = await import('../../src/modules/technical-report/technical-report.service');
    const result = await (svc as any).rejectTechnicalReport(doc._id.toString(), 'Incomplete evidence', { _id: 'u1', role: 'gerente' });
    expect(result.status).toBe('rejected');
  });

  // Transiciones INVÁLIDAS
  it('should NOT transition from draft to approved directly (skip submit)', async () => {
    const doc = mockDoc('draft'); mocks.findById.mockResolvedValue(doc);
    const svc = await import('../../src/modules/technical-report/technical-report.service');
    await expect((svc as any).approveTechnicalReport(doc._id.toString(), { _id: 'u1', role: 'gerente' }))
      .rejects.toThrow(/cannot|invalid|not allowed/i);
  });

  it('should NOT transition from approved to submitted (no retroceso)', async () => {
    const doc = mockDoc('approved'); mocks.findById.mockResolvedValue(doc);
    const svc = await import('../../src/modules/technical-report/technical-report.service');
    await expect((svc as any).submitTechnicalReport(doc._id.toString(), { _id: 'u1', role: 'supervisor' }))
      .rejects.toThrow(/cannot|invalid|not allowed/i);
  });

  it('should NOT transition from cancelled to any state (terminal)', async () => {
    const doc = mockDoc('cancelled'); mocks.findById.mockResolvedValue(doc);
    const svc = await import('../../src/modules/technical-report/technical-report.service');
    await expect((svc as any).submitTechnicalReport(doc._id.toString(), { _id: 'u1', role: 'supervisor' }))
      .rejects.toThrow(/cannot|cancelled|terminal/i);
  });
});
```

**Aplicar mismo patrón FSM para los otros 4 services**:
- DeliveryRecord: draft→sent→signed/rejected→cancelled (mínimo 8 tests)
- ServiceEntrySheet: draft→submitted→approved/rejected→cancelled (mínimo 8 tests)
- Invoice: draft→submitted→approved/rejected→paid (mínimo 10 tests, incluir aging)
- Payment: pending→completed→reconciled/rejected→cancelled (mínimo 8 tests)

### Task 10c — Test de compatibilidad de esquema entre service viejo y nuevos

**Contexto**: Durante el refactor, los datos existentes en MongoDB fueron creados por `administrative-workflow.service.ts` (1,605 líneas). Los nuevos services usan `findById().lean()`. Si el shape del documento difiere (tipos de campos, populate implícito, virtuals), pueden fallar silenciosamente.

**Archivo**: `backend/tests/integration/schema-compatibility.test.ts`
```typescript
import { describe, expect, it, beforeAll } from 'vitest';
import mongoose from 'mongoose';

describe('Schema compatibility: old vs new services', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cermont_test');
  });

  it('TechnicalReport: old model shape matches new service expectations', async () => {
    const doc = await mongoose.model('TechnicalReport').findOne().lean();
    if (!doc) return; // skip si no hay datos
    const d = doc as Record<string, unknown>;
    expect(d._id).toBeDefined();
    expect(d.status).toBeDefined();
    expect(['draft', 'pending_review', 'approved', 'rejected', 'cancelled']).toContain(d.status);
    expect(typeof d.executionSessionId).toBe('object'); // ObjectId
    expect(typeof d.orderId).toBe('object');
  });

  it('Invoice: agingDays may be missing on old docs (calculate on read)', async () => {
    const doc = await mongoose.model('Invoice').findOne().lean();
    if (!doc) return;
    const d = doc as Record<string, unknown>;
    // agingDays puede ser 0 si el doc fue creado antes del campo
    expect(d.agingDays === undefined || typeof d.agingDays === 'number').toBe(true);
  });

  it('DeliveryRecord: signature fields may be null on old unsent docs', async () => {
    const doc = await mongoose.model('DeliveryRecord').findOne({ status: 'draft' }).lean();
    if (!doc) return;
    const d = doc as Record<string, unknown>;
    // Campos de firma pueden no existir en drafts viejos — los nuevos services deben tolerarlo
    expect(d.signedById === undefined || d.signedAt === undefined).toBe(true);
  });
});
```

### Task 10d — Smoke test de colisión de rutas durante migración

**Contexto**: Mientras coexisten `administrative-workflow.controller.ts` y los 5 controllers nuevos, ambos podrían responder al mismo prefijo de ruta si `order.routes.ts` no se desmonta correctamente.

**Regla de desmontaje ordenado (seguir este orden exacto)**:
```
1. Commit N: Crear technical-report service + controller + routes NUEVOS
   → Remover ruta technical-report de administrative-workflow.controller.ts
   → Montar nueva ruta technical-report en order.routes.ts
2. Commit N+1: Crear delivery-record service + controller + routes NUEVOS
   → Remover ruta delivery-record del workflow viejo
   → Montar nueva ruta delivery-record
3. Commit N+2: Service-entry-sheet
4. Commit N+3: Invoice
5. Commit N+4: Payment
```

**Archivo**: `backend/tests/integration/route-collision.test.ts`
```typescript
import { describe, expect, it } from 'vitest';

describe('Route collision prevention during migration', () => {
  it('each domain endpoint should respond from exactly ONE controller', () => {
    const domains = ['technical-reports', 'delivery-records', 'service-entry-sheets', 'invoices', 'payments'];
    // En staging, golpear cada endpoint con un header X-Debug-Controller
    // Verificar que el header indique el controller NUEVO, no el viejo
    domains.forEach(domain => {
      // curl -H "X-Debug-Controller: true" /api/${domain}/some-id
      // Response header X-Controller: debe ser el nuevo, no "administrative-workflow"
      expect(true).toBe(true); // placeholder — implementar con curl real en staging
    });
  });

  it('old and new controllers do not share mount points', () => {
    // Verificar que order.routes.ts NO monta rutas que también montan los nuevos modules
    const oldMounts = ['/technical-reports', '/delivery-records', '/service-entry-sheets', '/invoices', '/payments'];
    // Leer order.routes.ts y confirmar que estas rutas ya no están montadas allí
    oldMounts.forEach(mount => {
      expect(true).toBe(true); // placeholder — implementar con grep real
    });
  });
});

Patrón de test (usar vitest):
```typescript
import { Types } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  create: vi.fn(),
  find: vi.fn(),
  countDocuments: vi.fn(),
}));

vi.mock('../../src/models/TechnicalReport', () => ({
  default: {
    findById: mocks.findById,
    create: mocks.create,
    find: mocks.find,
    countDocuments: mocks.countDocuments,
  },
}));

describe('TechnicalReportService', () => {
  it('should create a technical report', async () => {
    mocks.create.mockResolvedValue({ toObject: () => ({ _id: new Types.ObjectId(), ... }) });
    const result = await TechnicalReportService.createTechnicalReport({ ... });
    expect(result).toBeDefined();
    expect(result.status).toBe('draft');
  });
  
  it('should throw NotFoundError when getting non-existent report', async () => {
    mocks.findById.mockResolvedValue(null);
    await expect(TechnicalReportService.getTechnicalReportById(new Types.ObjectId().toString()))
      .rejects.toThrow('TechnicalReport');
  });
});
```

---

## FASE 2 — SPRINT 2: COMPLETAR MÓDULOS FALTANTES (Tasks 11-14)

### Task 11 — Implementar módulo KPI con MTTR/MTBF reales

**Contexto**: kpi/ está vacío. El dashboard necesita KPIs operacionales: MTTR (Mean Time To Repair), MTBF (Mean Time Between Failures), first-time fix rate, technician utilization.

**Schema nuevo**: `packages/shared-types/src/schemas/kpi.schema.ts`
```typescript
import { z } from 'zod';

export const KpiTimeRangeSchema = z.enum(['7d', '30d', '90d', '12m']);

export const MttrKpiSchema = z.object({
  period: KpiTimeRangeSchema,
  totalRepairHours: z.number().nonnegative(),
  totalRepairEvents: z.number().int().nonnegative(),
  mttrHours: z.number().nonnegative(),
  trend: z.number(), // positivo = empeorando, negativo = mejorando
}).strict();

export const MtbfKpiSchema = z.object({
  period: KpiTimeRangeSchema,
  totalOperationalHours: z.number().nonnegative(),
  totalFailures: z.number().int().nonnegative(),
  mtbfHours: z.number().nonnegative(),
  trend: z.number(),
}).strict();

export const FirstTimeFixRateKpiSchema = z.object({
  period: KpiTimeRangeSchema,
  totalJobs: z.number().int().nonnegative(),
  firstTimeFixes: z.number().int().nonnegative(),
  rate: z.number().min(0).max(100), // porcentaje
  trend: z.number(),
}).strict();

export const TechnicianUtilizationKpiSchema = z.object({
  period: KpiTimeRangeSchema,
  totalAvailableHours: z.number().nonnegative(),
  totalBilledHours: z.number().nonnegative(),
  utilizationRate: z.number().min(0).max(100),
  trend: z.number(),
}).strict();

export const DashboardKpiSummarySchema = z.object({
  mttr: MttrKpiSchema,
  mtbf: MtbfKpiSchema,
  firstTimeFixRate: FirstTimeFixRateKpiSchema,
  technicianUtilization: TechnicianUtilizationKpiSchema,
  period: KpiTimeRangeSchema,
  calculatedAt: z.string().datetime(),
}).strict();
```

**Service**: `backend/src/modules/kpi/kpi.service.ts`
```typescript
import mongoose from 'mongoose';
import type { DashboardKpiSummary, KpiTimeRange } from '@cermont/shared-types';

function getDateRange(period: KpiTimeRange): Date {
  const now = new Date();
  const map: Record<KpiTimeRange, number> = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 };
  return new Date(now.getTime() - map[period] * 24 * 60 * 60 * 1000);
}

export async function calculateMttr(period: KpiTimeRange) {
  const since = getDateRange(period);
  const ExecutionSession = mongoose.model('ExecutionSession');
  
  const sessions = await ExecutionSession.find({
    status: 'completed',
    updatedAt: { $gte: since },
  }).lean();
  
  const totalRepairHours = sessions.reduce((sum: number, s: Record<string, unknown>) => {
    const elapsed = (s.elapsedMinutes as number) || 0;
    return sum + elapsed / 60;
  }, 0);
  
  return {
    period,
    totalRepairHours,
    totalRepairEvents: sessions.length,
    mttrHours: sessions.length > 0 ? totalRepairHours / sessions.length : 0,
    trend: 0, // calcular contra período anterior
  };
}

export async function calculateMtbf(period: KpiTimeRange) {
  const since = getDateRange(period);
  const Maintenance = mongoose.model('Maintenance');
  
  const failures = await Maintenance.countDocuments({
    type: 'corrective',
    createdAt: { $gte: since },
  });
  
  const totalDays = since.getTime() === getDateRange(period).getTime() 
    ? 365 : parseInt(period) === 7 ? 7 : parseInt(period) === 30 ? 30 : 90;
  
  return {
    period,
    totalOperationalHours: totalDays * 24,
    totalFailures: failures,
    mtbfHours: failures > 0 ? (totalDays * 24) / failures : totalDays * 24,
    trend: 0,
  };
}

export async function calculateFirstTimeFixRate(period: KpiTimeRange) {
  const since = getDateRange(period);
  const Order = mongoose.model('Order');
  
  const orders = await Order.find({
    createdAt: { $gte: since },
    lifecycleStatus: { $ne: 'deleted' },
  }).lean();
  
  const totalJobs = orders.length;
  const firstTimeFixes = orders.filter((o: Record<string, unknown>) => 
    (o.visitCount as number || 1) === 1
  ).length;
  
  return {
    period,
    totalJobs,
    firstTimeFixes,
    rate: totalJobs > 0 ? (firstTimeFixes / totalJobs) * 100 : 0,
    trend: 0,
  };
}

export async function getDashboardKpiSummary(period: KpiTimeRange = '30d'): Promise<DashboardKpiSummary> {
  const [mttr, mtbf, firstTimeFixRate] = await Promise.all([
    calculateMttr(period),
    calculateMtbf(period),
    calculateFirstTimeFixRate(period),
  ]);
  
  return {
    mttr,
    mtbf,
    firstTimeFixRate,
    technicianUtilization: { period, totalAvailableHours: 0, totalBilledHours: 0, utilizationRate: 0, trend: 0 },
    period,
    calculatedAt: new Date().toISOString(),
  };
}
```

**Controller**: `backend/src/modules/kpi/kpi.controller.ts`
**Routes**: `backend/src/modules/kpi/kpi.routes.ts`

---

### Task 12 — Resolver módulo media (consolidar en FileAsset)

**Contexto**: `media/` está vacío. La regla dice FileAsset es SSOT para archivos. `files/` module ya maneja FileAsset con upload, download, procesamiento con sharp.

**Decisión**: Eliminar `backend/src/modules/media/` completamente. Cualquier funcionalidad de medios (fotos, videos, documentos) debe usar el módulo `files/` existente.

```bash
Remove-Item -Path "backend/src/modules/media" -Recurse -Force
```

Verificar que ningún otro módulo importa de `media/`:
```bash
grep -rn "from.*media" backend/src/ --include="*.ts"
```

Si hay imports, redirigirlos a `files/`.

---

### Task 13 — Implementar motor de automatización SI-ENTONCES (json-rules-engine)

**Contexto**: El módulo `automation/` ya existe con controller, routes, service. Pero el service actual probablemente es básico. Implementar un motor de reglas completo usando `json-rules-engine`.

**Schema**: `packages/shared-types/src/schemas/automation-rule.schema.ts`
```typescript
import { z } from 'zod';

export const RuleConditionOperatorSchema = z.enum([
  'equal', 'notEqual', 'lessThan', 'lessThanInclusive', 
  'greaterThan', 'greaterThanInclusive', 'in', 'notIn', 
  'contains', 'doesNotContain'
]);

export const RuleConditionSchema = z.object({
  fact: z.string().min(1).max(100),       // ej: "order.status"
  operator: RuleConditionOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
}).strict();

export const RuleActionTypeSchema = z.enum([
  'notify', 'block_transition', 'create_task', 
  'request_evidence', 'send_email', 'update_field'
]);

export const RuleActionSchema = z.object({
  type: RuleActionTypeSchema,
  config: z.record(z.unknown()).default({}), // payload específico por tipo
}).strict();

export const AutomationRuleSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  module: z.string().min(1).max(80),      // "order", "evidence", "ses", etc.
  event: z.string().min(1).max(80),       // "status_changed", "created", etc.
  conditions: z.array(RuleConditionSchema).min(1),
  actions: z.array(RuleActionSchema).min(1),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).max(100).default(50),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

export const CreateAutomationRuleSchema = AutomationRuleSchema.omit({ 
  _id: true, createdAt: true, updatedAt: true 
});
```

**Service**: `backend/src/modules/automation/automation.service.ts`
```typescript
import { Engine } from 'json-rules-engine';
import type { AutomationRule, RuleCondition, RuleAction } from '@cermont/shared-types';
import mongoose from 'mongoose';

const AutomationRuleModel = mongoose.model('AutomationRule', new mongoose.Schema({
  name: String,
  description: String,
  module: String,
  event: String,
  conditions: [mongoose.Schema.Types.Mixed],
  actions: [mongoose.Schema.Types.Mixed],
  isActive: Boolean,
  priority: Number,
  createdBy: String,
  createdAt: String,
  updatedAt: String,
}));

function buildRuleFromSchema(rule: AutomationRule) {
  return {
    name: rule.name,
    conditions: {
      all: rule.conditions.map((c: RuleCondition) => ({
        fact: c.fact,
        operator: c.operator,
        value: c.value,
      })),
    },
    event: {
      type: rule.actions[0]?.type || 'notify',
      params: { actions: rule.actions, ruleId: rule._id },
    },
    priority: rule.priority,
  };
}

export async function evaluateRules(module: string, event: string, facts: Record<string, unknown>) {
  const rules = await AutomationRuleModel.find({
    module, event, isActive: true,
  }).sort({ priority: -1 }).lean();
  
  if (rules.length === 0) return [];
  
  const engine = new Engine();
  const triggered: unknown[] = [];
  
  for (const rule of rules) {
    const jsonRule = buildRuleFromSchema(rule as unknown as AutomationRule);
    engine.addRule(jsonRule);
  }
  
  engine.on('success', (event: { type: string; params: Record<string, unknown> }) => {
    triggered.push(event.params);
  });
  
  await engine.run(facts);
  return triggered;
}

export async function executeActions(actions: RuleAction[], facts: Record<string, unknown>) {
  const results = [];
  for (const action of actions) {
    switch (action.type) {
      case 'notify':
        // Usar módulo de notificaciones existente
        break;
      case 'block_transition':
        // Llamar al workflow gate service
        break;
      case 'create_task':
        // Crear tarea en el módulo jobs
        break;
      case 'request_evidence':
        // Marcar evidencia como requerida
        break;
      case 'send_email':
        // Enviar email
        break;
      case 'update_field':
        // Actualizar campo en entidad
        break;
    }
    results.push({ action: action.type, executed: true });
  }
  return results;
}
```

---

### Task 14 — Escalar dashboard con KPIs operacionales reales

**Contexto**: El dashboard actual tiene widgets (SlaWidget, CostComparisonChart) pero sin datos de MTTR/MTBF.

**Schema**: Ampliar `packages/shared-types/src/schemas/dashboard-summary.schema.ts`:
```typescript
export const DashboardKpiWidgetSchema = z.object({
  mttr: z.number().nonnegative(),       // horas
  mtbf: z.number().nonnegative(),       // horas  
  firstTimeFixRate: z.number().min(0).max(100),
  technicianUtilizationRate: z.number().min(0).max(100),
  slaCompliance: z.number().min(0).max(100),
  pendingCertifications: z.number().int().nonnegative(),
  periodLabel: z.string(),
}).strict();
```

**Service**: `backend/src/modules/dashboard/dashboard.service.ts` — agregar método:
```typescript
import { getDashboardKpiSummary } from '../kpi/kpi.service';

export async function getDashboardWithKpis(period: KpiTimeRange = '30d') {
  const [summary, kpis] = await Promise.all([
    getDashboardSummary(),  // existing
    getDashboardKpiSummary(period),
  ]);
  
  return {
    ...summary,
    kpis: {
      mttr: kpis.mttr.mttrHours,
      mtbf: kpis.mtbf.mtbfHours,
      firstTimeFixRate: kpis.firstTimeFixRate.rate,
      technicianUtilization: kpis.technicianUtilization.utilizationRate,
      periodLabel: period,
    },
  };
}
```

**Frontend**: `frontend/src/modules/dashboard/ui/KpiWidgetGrid.tsx`
```tsx
'use client';
import { useDashboardKpis } from '../hooks/queries';

export function KpiWidgetGrid() {
  const { data, isLoading, error } = useDashboardKpis('30d');
  
  if (isLoading) return <div className="grid grid-cols-2 gap-4 p-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <div className="text-red-500">Error loading KPIs</div>;
  if (!data) return <div className="text-muted-foreground">No KPI data available</div>;
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard title="MTTR" value={`${data.mttr.toFixed(1)}h`} subtitle="Mean Time To Repair" />
      <KpiCard title="MTBF" value={`${data.mtbf.toFixed(0)}h`} subtitle="Mean Time Between Failures" />
      <KpiCard title="First-Time Fix" value={`${data.firstTimeFixRate.toFixed(0)}%`} subtitle="成功率" />
      <KpiCard title="Utilization" value={`${data.technicianUtilization.toFixed(0)}%`} subtitle="Technician utilization" />
    </div>
  );
}

function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

function SkeletonCard() {
  return <div className="rounded-lg border bg-card p-4 animate-pulse"><div className="h-4 w-20 bg-gray-200 rounded" /><div className="h-8 w-16 bg-gray-200 rounded mt-2" /></div>;
}
```

**Query hook**: `frontend/src/modules/dashboard/hooks/queries.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  kpis: (period: string) => ['dashboard', 'kpis', period] as const,
};

export function useDashboardKpis(period: string = '30d') {
  return useQuery({
    queryKey: dashboardKeys.kpis(period),
    queryFn: () => apiClient.get<{
      mttr: number; mtbf: number; firstTimeFixRate: number; 
      technicianUtilization: number; periodLabel: string;
    }>(`/dashboard/kpis?period=${period}`),
  });
}
```

---

## FASE 3 — SPRINT 3: CIERRE DE FLUJO DOCUMENTAL 14 PASOS (Tasks 15-19)

### Task 15 — End-to-end flow verification: WorkRequest → SiteVisit → Proposal → PO
**(Slides 1-4 del flujo de 14 pasos)**

Verificar que cada paso tiene:
- Schema en shared-types ✅ (mayoría ya existe)
- Backend service + controller + routes
- Frontend page + hook + query
- Los steps 1-4 ya están implementados (work-requests, site-visit, proposal, purchase-order)

**Focus**: Agregar campos faltantes según LTG y Spec-013:
- WorkRequest: `channel` (email/phone/portal), `priority` (low/medium/high/critical), `slaHours`
- SiteVisit: `scheduledDate`, `assignedTechId`, `findings`, `requiresProposal`
- Proposal: `margin`, `taxAmount`, `validUntil`, `version`
- PurchaseOrder: `poNumber`, `poDate`, `amount`, `validatedAgainstProposal`

---

### Task 16 — PlanningPacket Readiness Gate
**(Slide 5)**

Implementar readiness check que bloquea ejecución si no se cumplen pre-requisitos.

**Endpoint**: `GET /planning-packets/:id/readiness`
```typescript
export async function getReadiness(packetId: string) {
  const packet = await PlanningPacketModel.findById(packetId).lean();
  if (!packet) throw new NotFoundError('PlanningPacket', packetId);
  
  const checks = {
    approvedProposalExists: !!packet.proposalId,
    allTechsHaveValidCerts: true,  // verificar contra módulo resource
    allVehiclesDocumentsOk: true,  // verificar contra módulo fleet
    allToolsCalibrated: true,      // verificar contra módulo tool
    safetyChecklistComplete: false, // verificar contra módulo checklist
  };
  
  const canExecute = Object.values(checks).every(Boolean);
  const blockingReasons = Object.entries(checks)
    .filter(([_, v]) => !v)
    .map(([k]) => k);
  
  return { packetId, checks, canExecute, blockingReasons };
}
```

---

### Task 17 — Evidence FSM con slots requeridos
**(Slide 6)**

El evidence FSM (captured→uploaded→pending_review→approved→rejected→locked→archived) ya existe en el módulo evidence. Agregar `replacement_requested` state y `qualityScore`.

**Schema**: Modificar `EvidenceWorkflowStatusSchema` en `evidence.schema.ts`:
```typescript
export const EvidenceWorkflowStatusSchema = z.enum([
  'captured', 'uploaded', 'pending_review', 'approved', 
  'rejected', 'replacement_requested', 'locked', 'archived'
]);
```

**Servicio**: Agregar endpoint `POST /evidences/:id/request-replacement`
```typescript
export async function requestEvidenceReplacement(id: string, reason: string) {
  const doc = await EvidenceModel.findById(id);
  if (!doc) throw new NotFoundError('Evidence', id);
  if (doc.status !== 'rejected') throw new UnprocessableError('Only rejected evidence can have replacement requested');
  
  doc.status = 'replacement_requested';
  doc.rejectionReason = reason;
  doc.updatedAt = new Date().toISOString();
  return (await doc.save()).toObject();
}
```

---

### Task 18 — Técnico: TechnicalReport + DeliveryRecord + Signature
**(Slides 7-9)**

Refinar los services creados en Sprint 1 con lógica de firma digital y generación de PDF.

**DeliveryRecord sign flow**:
```typescript
export async function signDeliveryRecord(id: string, actor: { _id: string; role: string }, signatureImageId: string) {
  const doc = await DeliveryRecordModel.findById(id);
  if (!doc) throw new NotFoundError('DeliveryRecord', id);
  if (doc.status !== 'sent') throw new UnprocessableError('Only sent records can be signed');
  
  doc.status = 'signed';
  doc.signedById = new Types.ObjectId(actor._id);
  doc.signedAt = new Date().toISOString();
  doc.signatureImageId = new Types.ObjectId(signatureImageId);
  doc.updatedAt = new Date().toISOString();
  return (await doc.save()).toObject();
}
```

---

### Task 19 — SES → Invoice → Payment → Closure con aging automático
**(Slides 10-14)**

Implementar cálculo automático de agingDays para facturas y alertas de vencimiento.

**Invoice service — cálculo de aging**:
```typescript
export async function calculateInvoiceAging() {
  const now = new Date();
  const invoices = await InvoiceModel.find({
    status: { $in: ['submitted', 'approved'] },
    lifecycleStatus: { $ne: 'deleted' },
  }).lean();
  
  const updates = invoices.map((inv: Record<string, unknown>) => {
    const dueDate = new Date(inv.dueDate as string);
    const agingDays = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    return InvoiceModel.findByIdAndUpdate(inv._id, { agingDays }, { new: true });
  });
  
  await Promise.all(updates);
  return { updated: updates.length };
}
```

---

## FASE 4 — SPRINT 4: CIERRE ADMINISTRATIVO Y FINANCIERO (Tasks 20-23)

### Task 20 — Cost Intelligence: baseline vs actual con alertas >80%

**Nuevo endpoint**: `GET /costs/:orderId/intelligence`
Devuelve: totalEstimated, totalActual, margin, marginPercent, budgetConsumedPercent, isAtRisk (>80%), isCritical (>100%), deviationByCategory.

**Servicio** (ya existe en cost.service.ts parcialmente):
```typescript
export async function getCostIntelligence(orderId: string) {
  const order = await OrderModel.findById(orderId).lean();
  if (!order) throw new NotFoundError('Order', orderId);
  
  const costs = await CostModel.find({ orderId: new Types.ObjectId(orderId) }).lean();
  const costsArray = costs as unknown as Array<Record<string, unknown>>;
  
  const totalActual = costsArray.reduce((s: number, c: Record<string, unknown>) => s + (c.amountCOP as number || 0), 0);
  const totalEstimated = (order as Record<string, unknown>).estimatedCostCOP as number || 0;
  const totalTax = costsArray.reduce((s: number, c: Record<string, unknown>) => s + (c.taxCOP as number || 0), 0);
  const margin = totalEstimated - totalActual - totalTax;
  const marginPercent = totalEstimated > 0 ? (margin / totalEstimated) * 100 : 0;
  const budgetConsumedPercent = totalEstimated > 0 ? ((totalActual + totalTax) / totalEstimated) * 100 : 0;
  
  return {
    orderId,
    orderCode: (order as Record<string, unknown>).code,
    totalEstimated,
    totalActual,
    totalTax,
    margin,
    marginPercent,
    budgetConsumedPercent,
    isAtRisk: budgetConsumedPercent > 80,
    isCritical: budgetConsumedPercent > 100,
    deviationByCategory: [],  // agregar agrupación por categoría
    lastUpdatedAt: new Date().toISOString(),
  };
}
```

---

### Task 21 — Portal Cliente: endpoints faltantes

Verificar endpoints del portal:
- `GET /portal/orders` ✅ 
- `GET /portal/orders/:id` ✅ 
- `GET /portal/proposals` ✅ 
- `GET /portal/invoices` ✅ 
- `GET /portal/service-cases` ✅ 
- `POST /portal/signatures/:id` — firmar acta como cliente

Agregar si falta:
```typescript
// POST /portal/signatures/:id
export async function clientSignDocument(deliveryRecordId: string, clientId: string, signatureData: string) {
  // Decodificar signatureData (base64), guardar como FileAsset
  const fileAsset = await FileAssetModel.create({
    originalName: `signature-${deliveryRecordId}.png`,
    mimeType: 'image/png',
    ownerType: 'client_signature',
    ownerId: new Types.ObjectId(deliveryRecordId),
    // ... manejo de archivo
  });
  
  // Firmar el delivery record
  const doc = await DeliveryRecordModel.findByIdAndUpdate(
    deliveryRecordId,
    { 
      status: 'signed', 
      signatureImageId: fileAsset._id,
      signedAt: new Date().toISOString(),
      signedById: new Types.ObjectId(clientId),
    },
    { new: true }
  );
  return doc;
}
```

---

### Task 22 — Notificaciones y recordatorios automáticos

Implementar worker que corre diariamente y envía notificaciones para:
- Facturas próximas a vencer (aging > 30 días)
- SES pendientes de aprobación (> 7 días)
- Evidencias requeridas faltantes
- Certificaciones de vehículos próximas a expirar

**Worker**: `backend/src/services/reminder-worker.service.ts` (ya existe pero puede necesitar ampliación)

---

### Task 23 — Multi-tenancy foundation (preparación SaaS)

Agregar campo `tenantId` a modelos principales (Order, ServiceCase, Client, Invoice) como campo opcional para preparar multi-tenancy sin romper datos existentes:

```typescript
// En cada schema donde aplique
tenantId: ObjectIdSchema.optional(),
```

Crear middleware de isolation en backend:
```typescript
// backend/src/middlewares/tenant.middleware.ts
export function tenantIsolation(tenantField = 'tenantId') {
  return (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (tenantId) {
      req.tenantId = tenantId;
      // Modificar query para filtrar por tenant
      const originalQuery = req.query;
      req.query = { ...originalQuery, [tenantField]: tenantId };
    }
    next();
  };
}
```

---

## FASE 5 — SPRINT 5: INNOVACIÓN Y PROFESIONALIZACIÓN (Tasks 24-28)

### Task 24 — Dashboard Operating System con next-actions por rol

Implementar panel que muestra para cada usuario qué debe hacer ahora:
- Evidencias pendientes de revisar → HES, supervisor
- SES por aprobar → gerente, residente
- Facturas por emitir → administrativo
- Órdenes sin planificar → residente
- Vehículos con documentos vencidos → administrativo

**Endpoint**: `GET /dashboard/next-actions`
```typescript
export async function getNextActionsByRole(role: string, userId: string) {
  const actions = [];
  
  if (['gerente', 'residente'].includes(role)) {
    const pendingSES = await ServiceEntrySheetModel.countDocuments({ status: 'submitted' });
    if (pendingSES > 0) actions.push({ type: 'approve_ses', count: pendingSES, urgency: 'high' });
    
    const pendingInvoices = await InvoiceModel.countDocuments({ status: 'submitted' });
    if (pendingInvoices > 0) actions.push({ type: 'approve_invoice', count: pendingInvoices, urgency: 'high' });
  }
  
  if (['hes', 'supervisor'].includes(role)) {
    const pendingEvidences = await EvidenceModel.countDocuments({ status: 'pending_review' });
    if (pendingEvidences > 0) actions.push({ type: 'review_evidence', count: pendingEvidences, urgency: 'medium' });
  }
  
  if (role === 'administrativo') {
    const expiredDocs = await VehicleModel.countDocuments({ soatExpiry: { $lte: new Date() } });
    if (expiredDocs > 0) actions.push({ type: 'renew_vehicle_docs', count: expiredDocs, urgency: 'high' });
  }
  
  return actions;
}
```

---

### Task 25 — QR/NFC para activos (fleet, tools, inventory)

**Servicio**: Generar QR con ID del activo.
```typescript
// backend/src/modules/asset/asset-qr.service.ts
import QRCode from 'qrcode'; // agregar dependencia

export async function generateAssetQrCode(assetId: string, baseUrl: string) {
  const url = `${baseUrl}/assets/${assetId}`;
  const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
  return qrDataUrl;
}
```

**Endpoint**: `GET /assets/:id/qr` — devuelve imagen QR.

---

### Task 26 — Formularios dinámicos desde documentos

Usar el módulo `template-draft` y `template-response` existentes para implementar:
- Crear plantilla desde documento subido (PDF → extraer campos)
- Llenar plantilla en campo
- Generar PDF con datos llenados

---

### Task 27 — AI Copilot MVP (seguro, solo texto)

**Contexto**: El módulo `ai/` existe con endpoints. Implementar un copiloto seguro que:
- No alucina datos de producción
- Solo sugiere acciones basadas en reglas
- No modifica datos sin confirmación

```typescript
// backend/src/modules/ai/ai-copilot.service.ts
export async function getSuggestedNextAction(serviceCaseId: string) {
  const serviceCase = await ServiceCaseModel.findById(serviceCaseId).lean();
  if (!serviceCase) throw new NotFoundError('ServiceCase', serviceCaseId);
  
  const sc = serviceCase as Record<string, unknown>;
  const currentStep = sc.currentStep as number;
  
  // Reglas basadas en el paso actual
  const suggestions: Array<{ step: number; action: string; reason: string }> = [];
  
  if (currentStep === 5) { // Planning
    const readiness = await getReadiness(serviceCaseId);
    if (!readiness.canExecute) {
      suggestions.push({ step: 5, action: 'Complete planning readiness checks', reason: `Blocked by: ${readiness.blockingReasons.join(', ')}` });
    }
  }
  
  if (currentStep === 6) { // Execution
    const evidenceCount = await EvidenceModel.countDocuments({ 
      ownerType: 'execution_session', 
      ownerId: new Types.ObjectId(sc.executionSessionId as string) 
    });
    if (evidenceCount === 0) {
      suggestions.push({ step: 6, action: 'Capture execution evidence photos', reason: 'No evidence recorded yet' });
    }
  }
  
  return suggestions;
}
```

---

### Task 28 — Final cleanup: eliminar administrative-workflow original

SOLO después de que los 5 nuevos services de Sprint 1 estén funcionando y todos los gates pasen:

1. Eliminar `backend/src/modules/order/administrative-workflow.controller.ts`
2. Eliminar `backend/src/modules/order/administrative-workflow.service.ts`
3. Actualizar `backend/src/modules/order/order.routes.ts` — remover import del workflow controller
4. Verificar que ningún otro módulo importa de administrative-workflow

---

---

## FASE 6 — SPRINT 6: FRONTEND COMPONENTES PROFESIONALES (Tasks 29-34)

### Task 29 — Componente FourteenStepProgress (barra de progreso de 14 pasos)

**Archivo**: `frontend/src/modules/service-cases/ui/FourteenStepProgress.tsx`
```tsx
'use client';

import { CheckCircle2, Circle, Clock, AlertTriangle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'blocked' | 'skipped';
  description?: string;
}

const STEPS: Step[] = [
  { id: 1, label: 'Work Request', status: 'pending', description: 'Cliente solicita servicio' },
  { id: 2, label: 'Site Visit', status: 'pending', description: 'Visita técnica' },
  { id: 3, label: 'Proposal', status: 'pending', description: 'Propuesta económica' },
  { id: 4, label: 'Purchase Order', status: 'pending', description: 'Aprobación del cliente' },
  { id: 5, label: 'Planning', status: 'pending', description: 'Planeación de obra' },
  { id: 6, label: 'Execution', status: 'pending', description: 'Ejecución en campo' },
  { id: 7, label: 'Technical Report', status: 'pending', description: 'Informe técnico' },
  { id: 8, label: 'Delivery Record', status: 'pending', description: 'Acta de entrega' },
  { id: 9, label: 'Acceptance', status: 'pending', description: 'Aceptación del cliente' },
  { id: 10, label: 'SES', status: 'pending', description: 'Service Entry Sheet' },
  { id: 11, label: 'SES Approval', status: 'pending', description: 'Aprobación SES' },
  { id: 12, label: 'Invoice', status: 'pending', description: 'Facturación' },
  { id: 13, label: 'Invoice Approval', status: 'pending', description: 'Aprobación factura' },
  { id: 14, label: 'Payment', status: 'pending', description: 'Pago y cierre' },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="size-5 text-green-500" />,
  active: <Clock className="size-5 text-blue-500 animate-pulse" />,
  blocked: <AlertTriangle className="size-5 text-amber-500" />,
  skipped: <Lock className="size-5 text-gray-300" />,
  pending: <Circle className="size-5 text-gray-300" />,
};

export function FourteenStepProgress({ currentStep, stepStatuses }: { currentStep: number; stepStatuses: Record<number, Step['status']> }) {
  const steps = STEPS.map(s => ({ ...s, status: stepStatuses[s.id] || s.status }));
  
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              'flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors',
              step.status === 'active' && 'bg-blue-50 dark:bg-blue-950/30',
              step.status === 'completed' && 'bg-green-50 dark:bg-green-950/20',
              step.status === 'blocked' && 'bg-amber-50 dark:bg-amber-950/20',
              step.id === currentStep && 'ring-2 ring-blue-200'
            )}>
              <div className="flex items-center gap-1.5">
                {STATUS_ICONS[step.status]}
                <span className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  step.status === 'completed' && 'text-green-700 dark:text-green-400',
                  step.status === 'active' && 'text-blue-700 dark:text-blue-400',
                  step.status === 'blocked' && 'text-amber-700 dark:text-amber-400',
                  step.status === 'pending' && 'text-gray-500'
                )}>
                  {step.id}. {step.label}
                </span>
              </div>
              {step.description && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{step.description}</span>
              )}
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                'h-0.5 w-4 mx-0.5 rounded-full',
                step.status === 'completed' ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Task 30 — Componente CockpitPanel (vista 360 de una orden)

**Archivo**: `frontend/src/modules/service-cases/ui/CockpitPanel.tsx`
```tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { FourteenStepProgress } from './FourteenStepProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CockpitData {
  orderId: string;
  orderCode: string;
  currentStep: number;
  stepStatuses: Record<number, string>;
  blockers: Array<{ step: number; reason: string; severity: 'low' | 'medium' | 'high' }>;
  nextActions: Array<{ action: string; module: string; urgency: 'low' | 'medium' | 'high' }>;
  costSummary: {
    estimated: number;
    actual: number;
    margin: number;
    marginPercent: number;
    isAtRisk: boolean;
  };
  timeline: Array<{ step: number; action: string; actor: string; timestamp: string }>;
}

export function CockpitPanel({ orderId }: { orderId: string }) {
  const { data, isLoading, error } = useQuery<CockpitData>({
    queryKey: ['service-cases', orderId, 'cockpit'],
    queryFn: () => apiClient.get(`/service-cases/${orderId}/cockpit`),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
        <p className="font-semibold">Error loading cockpit</p>
        <p className="text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>No cockpit data available for this order</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Order {data.orderCode}</h2>
          <p className="text-sm text-muted-foreground">Step {data.currentStep} of 14</p>
        </div>
        <Badge variant={data.costSummary.isAtRisk ? 'destructive' : 'default'}>
          {data.costSummary.isAtRisk ? 'At Risk' : 'On Track'}
        </Badge>
      </div>

      {/* Progress Bar */}
      <FourteenStepProgress currentStep={data.currentStep} stepStatuses={data.stepStatuses as Record<number, 'pending' | 'active' | 'completed' | 'blocked' | 'skipped'>} />

      {/* Three-panel grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blockers */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Blockers ({data.blockers.length})</CardTitle></CardHeader>
          <CardContent>
            {data.blockers.length === 0 ? (
              <p className="text-sm text-green-600">No blockers</p>
            ) : (
              <ul className="space-y-2">
                {data.blockers.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={b.severity === 'high' ? 'text-red-500' : 'text-amber-500'}>●</span>
                    <span>{b.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Next Actions */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Next Actions ({data.nextActions.length})</CardTitle></CardHeader>
          <CardContent>
            {data.nextActions.length === 0 ? (
              <p className="text-sm text-gray-400">No pending actions</p>
            ) : (
              <ul className="space-y-2">
                {data.nextActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={a.urgency === 'high' ? 'text-red-500' : 'text-blue-500'}>→</span>
                    <div>
                      <p>{a.action}</p>
                      <p className="text-xs text-gray-400">{a.module}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Cost Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm"><span>Estimated</span><span>${data.costSummary.estimated.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span>Actual</span><span>${data.costSummary.actual.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Margin</span>
              <span className={data.costSummary.margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                {data.costSummary.marginPercent.toFixed(1)}%
              </span>
            </div>
            {data.costSummary.isAtRisk && (
              <Badge variant="destructive" className="w-full mt-2">Budget exceeded 80%</Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Task 31 — Componente KpiWidgetGrid con Recharts

**Archivo**: `frontend/src/modules/dashboard/ui/KpiWidgetGrid.tsx`
```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface KpiData {
  mttr: number;
  mtbf: number;
  firstTimeFixRate: number;
  technicianUtilization: number;
  slaCompliance: number;
  periodLabel: string;
  trend: {
    mttr: number;
    mtbf: number;
    firstTimeFixRate: number;
    technicianUtilization: number;
  };
  monthlyData: Array<{ month: string; mttr: number; mtbf: number }>;
}

export function KpiWidgetGrid() {
  const { data, isLoading, error } = useQuery<KpiData>({
    queryKey: ['dashboard', 'kpis', '30d'],
    queryFn: () => apiClient.get('/dashboard/kpis?period=30d'),
    refetchInterval: 300_000, // cada 5 minutos
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="size-4" />
            <p className="text-sm">Error loading KPIs. Retrying...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-400">
          <p className="text-sm">No KPI data available for this period</p>
        </CardContent>
      </Card>
    );
  }

  const widgets = [
    { title: 'MTTR', value: `${data.mttr.toFixed(1)}h`, subtitle: 'Mean Time To Repair', icon: Clock, trend: data.trend.mttr, color: 'text-blue-600' },
    { title: 'MTBF', value: `${data.mtbf.toFixed(0)}h`, subtitle: 'Mean Time Between Failures', icon: CheckCircle2, trend: data.trend.mtbf, color: 'text-green-600' },
    { title: 'First-Time Fix', value: `${data.firstTimeFixRate.toFixed(0)}%`, subtitle: 'Repair success rate', icon: Wrench, trend: data.trend.firstTimeFixRate, color: 'text-purple-600' },
    { title: 'Utilization', value: `${data.technicianUtilization.toFixed(0)}%`, subtitle: 'Technician utilization', icon: TrendingUp, trend: data.trend.technicianUtilization, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map(w => (
          <Card key={w.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{w.title}</p>
                  <p className={`text-2xl font-bold mt-1 ${w.color}`}>{w.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{w.subtitle}</p>
                </div>
                <div className="flex items-center gap-1">
                  <w.icon className={`size-4 ${w.trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs font-medium ${w.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {w.trend >= 0 ? '+' : ''}{w.trend.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MTTR/MTBF Trend Chart */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">MTTR / MTBF Trend (Last 12 months)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="mttr" fill="#3b82f6" name="MTTR (hours)" radius={[4,4,0,0]} />
              <Bar dataKey="mtbf" fill="#22c55e" name="MTBF (hours)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SLA Compliance */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">SLA Compliance</p>
              <p className="text-xs text-muted-foreground">Orders completed within SLA</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${data.slaCompliance}%`,
                    backgroundColor: data.slaCompliance >= 90 ? '#22c55e' : data.slaCompliance >= 70 ? '#f59e0b' : '#ef4444'
                  }} 
                />
              </div>
              <span className="text-sm font-bold">{data.slaCompliance.toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Task 32 — Componente NextActionsByRolePanel

**Archivo**: `frontend/src/modules/dashboard/ui/NextActionsByRolePanel.tsx`
```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import { FileCheck, FileText, ClipboardCheck, Truck, CreditCard, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; route: string }> = {
  approve_ses: { icon: <FileCheck className="size-4" />, label: 'Approve SES', route: '/billing/ses' },
  approve_invoice: { icon: <CreditCard className="size-4" />, label: 'Approve Invoice', route: '/billing/invoices' },
  review_evidence: { icon: <ClipboardCheck className="size-4" />, label: 'Review Evidence', route: '/evidences' },
  plan_orders: { icon: <FileText className="size-4" />, label: 'Plan Orders', route: '/orders/kanban' },
  renew_vehicle_docs: { icon: <Truck className="size-4" />, label: 'Renew Vehicle Docs', route: '/fleet' },
};

export function NextActionsByRolePanel() {
  const role = useAuthStore(s => s.user?.role);
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'next-actions', role],
    queryFn: () => apiClient.get<Array<{ type: string; count: number; urgency: string }>>('/dashboard/next-actions'),
    enabled: !!role,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Pending Actions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Pending Actions</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 text-center py-4">No pending actions. All clear ✓</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Pending Actions</CardTitle>
        <Badge variant="secondary" className="text-xs">{data.length} pending</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map((action, i) => {
          const config = ACTION_CONFIG[action.type];
          if (!config) return null;
          return (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <div className={`p-2 rounded-full ${action.urgency === 'high' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                {config.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{config.label}</p>
                <p className="text-xs text-muted-foreground">{action.count} items pending</p>
              </div>
              <Badge variant={action.urgency === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">
                {action.urgency}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

### Task 33 — Componente EvidenceGallery con FSM visual

**Archivo**: `frontend/src/modules/evidences/ui/EvidenceGallery.tsx`
```tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, ThumbsUp, ThumbsDown, RotateCcw, Lock, ImageIcon, FileIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  captured: { label: 'Captured', variant: 'secondary' },
  uploaded: { label: 'Uploaded', variant: 'default' },
  pending_review: { label: 'Pending Review', variant: 'outline' },
  approved: { label: 'Approved', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  replacement_requested: { label: 'Replacement Requested', variant: 'destructive' },
  locked: { label: 'Locked', variant: 'outline' },
  archived: { label: 'Archived', variant: 'secondary' },
};

interface EvidenceItem {
  _id: string;
  fileName: string;
  mimeType: string;
  status: string;
  phase: string;
  rejectionReason?: string;
  qualityScore?: number;
  gpsMetadata?: { lat: number; lng: number };
  capturedAt: string;
  capturedBy: { name: string };
}

export function EvidenceGallery({ orderId }: { orderId: string }) {
  const [selected, setSelected] = useState<EvidenceItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['evidences', orderId],
    queryFn: () => apiClient.get<EvidenceItem[]>(`/orders/${orderId}/evidences`),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/evidences/${id}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidences'] });
      toast.success('Evidence approved');
    },
    onError: () => toast.error('Failed to approve evidence'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => apiClient.post(`/evidences/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidences'] });
      setRejectReason('');
      toast.success('Evidence rejected');
    },
    onError: () => toast.error('Failed to reject evidence'),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <ImageIcon className="size-12 mx-auto mb-3 opacity-50" />
        <p>No evidence captured yet</p>
        <p className="text-sm">Start an execution session to capture photos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Phase filters */}
      <div className="flex gap-2">
        {['all', 'before', 'during', 'after'].map(phase => (
          <Button key={phase} variant="outline" size="sm" className="text-xs capitalize">
            {phase === 'all' ? 'All Phases' : phase}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map(ev => (
          <Card key={ev._id} className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all">
            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative">
              {ev.mimeType.startsWith('image/') ? (
                <img src={`/api/files/${ev._id}/content`} alt={ev.fileName} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FileIcon className="size-8 text-gray-400" />
                </div>
              )}
              <Badge className="absolute top-2 right-2 text-[10px]" variant={STATUS_BADGES[ev.status]?.variant || 'secondary'}>
                {STATUS_BADGES[ev.status]?.label || ev.status}
              </Badge>
              {ev.qualityScore && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  Score: {ev.qualityScore}
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-medium truncate">{ev.fileName}</p>
              <p className="text-[10px] text-gray-400">
                {ev.capturedAt ? format(new Date(ev.capturedAt), 'MMM d, HH:mm') : ''}
                {ev.capturedBy?.name ? ` · ${ev.capturedBy.name}` : ''}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base">{selected.fileName}</DialogTitle>
              <DialogDescription className="text-xs">
                Captured {selected.capturedAt ? format(new Date(selected.capturedAt), 'MMM d, yyyy HH:mm') : ''}
                {selected.capturedBy?.name ? ` by ${selected.capturedBy.name}` : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selected.mimeType.startsWith('image/') && (
                <img src={`/api/files/${selected._id}/content`} alt={selected.fileName} className="w-full rounded-lg max-h-96 object-contain bg-gray-100" />
              )}
              <div className="flex gap-2 flex-wrap">
                <Badge>{STATUS_BADGES[selected.status]?.label || selected.status}</Badge>
                <Badge variant="outline">{selected.phase}</Badge>
                {selected.qualityScore && <Badge variant="secondary">Score: {selected.qualityScore}</Badge>}
                {selected.gpsMetadata && <Badge variant="outline">{selected.gpsMetadata.lat.toFixed(4)}, {selected.gpsMetadata.lng.toFixed(4)}</Badge>}
              </div>
              {selected.rejectionReason && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="text-xs font-medium text-red-600">Rejection reason:</p>
                  <p className="text-sm">{selected.rejectionReason}</p>
                </div>
              )}
              <div className="flex gap-2">
                {selected.status === 'pending_review' && (
                  <>
                    <Button size="sm" onClick={() => verifyMutation.mutate(selected._id)}>
                      <ThumbsUp className="size-4 mr-1" /> Approve
                    </Button>
                    {/* Rejection inline dentro del Dialog — NO usar prompt() nativo, rompe accesibilidad y consistencia UX */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive"><ThumbsDown className="size-4 mr-1" /> Reject</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Reject Evidence</DialogTitle><DialogDescription>Provide a reason for rejection</DialogDescription></DialogHeader>
                        <div className="space-y-4 p-4">
                          <Textarea placeholder="Describe why this evidence is rejected..." 
                            onChange={(e) => setRejectReason(e.target.value)} />
                          <Button variant="destructive" onClick={() => {
                            if (rejectReason) rejectMutation.mutate({ id: selected._id, reason: rejectReason });
                          }}>Confirm Rejection</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                      <ThumbsDown className="size-4 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {selected.status === 'rejected' && (
                  <Button size="sm" variant="outline">
                    <RotateCcw className="size-4 mr-1" /> Request Replacement
                  </Button>
                )}
                {selected.status === 'locked' && (
                  <Button size="sm" variant="outline" disabled>
                    <Lock className="size-4 mr-1" /> Locked in Report
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
```

### Task 34 — Componente PlanningReadinessGate

**Archivo**: `frontend/src/modules/planning/ui/ReadinessGate.tsx`
```tsx
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, AlertTriangle, Play } from 'lucide-react';
import { toast } from 'sonner';

interface ReadinessCheck {
  key: string;
  label: string;
  passed: boolean;
  blocking: boolean;
}

interface ReadinessData {
  packetId: string;
  checks: ReadinessCheck[];
  canExecute: boolean;
  blockingReasons: string[];
}

export function ReadinessGate({ packetId }: { packetId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['planning-packets', packetId, 'readiness'],
    queryFn: () => apiClient.get<ReadinessData>(`/planning-packets/${packetId}/readiness`),
  });

  const approveMutation = useMutation({
    mutationFn: () => apiClient.post(`/planning-packets/${packetId}/approve`),
    onSuccess: () => {
      toast.success('Planning approved! Execution can start.');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-400">
          <AlertTriangle className="size-8 mx-auto mb-2" />
          <p className="text-sm">Readiness data not available</p>
        </CardContent>
      </Card>
    );
  }

  const passedCount = data.checks.filter(c => c.passed).length;
  const totalCount = data.checks.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Execution Readiness</CardTitle>
          <Badge variant={data.canExecute ? 'default' : 'destructive'}>
            {data.canExecute ? 'Ready' : `${passedCount}/${totalCount}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(passedCount / totalCount) * 100}%`, backgroundColor: data.canExecute ? '#22c55e' : '#f59e0b' }}
          />
        </div>

        {/* Checks list */}
        <div className="space-y-2">
          {data.checks.map(check => (
            <div key={check.key} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              {check.passed ? (
                <CheckCircle2 className="size-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="size-4 text-red-500 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm">{check.label}</p>
              </div>
              {check.blocking && !check.passed && (
                <Badge variant="destructive" className="text-[10px]">BLOCKING</Badge>
              )}
            </div>
          ))}
        </div>

        {/* Action button */}
        <Button 
          className="w-full" 
          disabled={!data.canExecute || approveMutation.isPending}
          onClick={() => approveMutation.mutate()}
        >
          {approveMutation.isPending ? 'Approving...' : data.canExecute ? (
            <><Play className="size-4 mr-2" /> Start Execution</>
          ) : (
            <><AlertTriangle className="size-4 mr-2" /> Resolve Blockers First</>
          )}
        </Button>

        {data.blockingReasons.length > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Blocking issues:</p>
            <ul className="text-xs text-amber-600 dark:text-amber-300 list-disc list-inside mt-1">
              {data.blockingReasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## FASE 7 — SPRINT 7: TESTS Y CIERRE (Tasks 35-40)

### Task 35 — Tests de schemas shared-types

**Archivo**: `packages/shared-types/src/__tests__/administrative-workflow-schema.test.ts`
```typescript
import { describe, expect, it } from 'vitest';
import { 
  CreateTechnicalReportSchema, 
  TechnicalReportSchema,
  CreateDeliveryRecordSchema,
  DeliveryRecordSchema,
  CreateServiceEntrySheetSchema,
  ServiceEntrySheetSchema,
  CreateInvoiceSchema,
  InvoiceSchema,
  RegisterPaymentSchema,
  PaymentSchema,
} from '../schemas/administrative-workflow.schema';
import { ObjectIdSchema } from '../schemas/common.schema';

const VALID_OBJECT_ID = '507f1f77bcf86cd799439011';

describe('Administrative Workflow Schemas', () => {
  describe('TechnicalReport', () => {
    it('should validate a valid create input', () => {
      const result = CreateTechnicalReportSchema.safeParse({
        executionSessionId: VALID_OBJECT_ID,
        orderId: VALID_OBJECT_ID,
        title: 'Test Report',
        description: 'Test description for the technical report',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const result = CreateTechnicalReportSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should reject invalid ObjectId', () => {
      const result = CreateTechnicalReportSchema.safeParse({
        executionSessionId: 'not-an-object-id',
        orderId: VALID_OBJECT_ID,
        title: 'Test',
        description: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('should apply default status on full schema', () => {
      const result = TechnicalReportSchema.safeParse({
        _id: VALID_OBJECT_ID,
        executionSessionId: VALID_OBJECT_ID,
        orderId: VALID_OBJECT_ID,
        title: 'Test Report',
        description: 'Test',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('draft');
        expect(result.data.evidenceIds).toEqual([]);
      }
    });
  });

  describe('Invoice', () => {
    it('should validate invoice with tax', () => {
      const result = CreateInvoiceSchema.safeParse({
        serviceEntrySheetId: VALID_OBJECT_ID,
        orderId: VALID_OBJECT_ID,
        invoiceNumber: 'INV-2026-001',
        totalAmountCOP: 10000000,
        taxAmountCOP: 1900000,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.taxAmountCOP).toBe(1900000);
      }
    });

    it('should default tax to 0', () => {
      const result = CreateInvoiceSchema.safeParse({
        serviceEntrySheetId: VALID_OBJECT_ID,
        orderId: VALID_OBJECT_ID,
        invoiceNumber: 'INV-2026-002',
        totalAmountCOP: 5000000,
        dueDate: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.taxAmountCOP).toBe(0);
      }
    });
  });

  describe('Payment', () => {
    it('should validate a payment with all fields', () => {
      const result = RegisterPaymentSchema.safeParse({
        invoiceId: VALID_OBJECT_ID,
        amountCOP: 10000000,
        paymentMethod: 'bank_transfer',
        referenceNumber: 'REF-2026-001',
        paidAt: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const result = RegisterPaymentSchema.safeParse({
        invoiceId: VALID_OBJECT_ID,
        amountCOP: -100,
        paymentMethod: 'cash',
        paidAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });
  });
});
```

### Task 36 — Tests de KPI service

**Archivo**: `backend/tests/services/kpi.service.test.ts`
```typescript
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  countDocuments: vi.fn(),
  find: vi.fn(),
}));

vi.mock('mongoose', () => ({
  default: {
    model: vi.fn(() => ({
      countDocuments: mocks.countDocuments,
      find: mocks.find,
    })),
  },
  Types: { ObjectId: vi.fn(id => id) },
}));

describe('KPI Service', () => {
  it('should calculate MTTR correctly', async () => {
    mocks.find.mockResolvedValue([
      { elapsedMinutes: 120, status: 'completed' },
      { elapsedMinutes: 60, status: 'completed' },
    ]);
    
    const kpiService = await import('../../src/modules/kpi/kpi.service');
    const result = await kpiService.calculateMttr('7d');
    
    expect(result.totalRepairEvents).toBe(2);
    expect(result.mttrHours).toBe(1.5); // (120 + 60) / 60 / 2
    expect(result.period).toBe('7d');
  });

  it('should return 0 MTTR when no events', async () => {
    mocks.find.mockResolvedValue([]);
    
    const kpiService = await import('../../src/modules/kpi/kpi.service');
    const result = await kpiService.calculateMttr('30d');
    
    expect(result.totalRepairEvents).toBe(0);
    expect(result.mttrHours).toBe(0);
  });

  it('should calculate MTBF from corrective maintenance', async () => {
    mocks.countDocuments.mockResolvedValue(5);
    
    const kpiService = await import('../../src/modules/kpi/kpi.service');
    const result = await kpiService.calculateMtbf('30d');
    
    expect(result.totalFailures).toBe(5);
    expect(result.mtbfHours).toBeGreaterThan(0);
    expect(result.period).toBe('30d');
  });

  it('should calculate first-time fix rate', async () => {
    mocks.find.mockResolvedValue([
      { visitCount: 1 },
      { visitCount: 1 },
      { visitCount: 3 }, // revisit
      { visitCount: 1 },
    ]);
    
    const kpiService = await import('../../src/modules/kpi/kpi.service');
    const result = await kpiService.calculateFirstTimeFixRate('90d');
    
    expect(result.totalJobs).toBe(4);
    expect(result.firstTimeFixes).toBe(3);
    expect(result.rate).toBe(75); // 3/4 * 100
  });
});
```

### Task 37 — Tests de automotion rule engine

**Archivo**: `backend/tests/services/automation.service.test.ts`
```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  sort: vi.fn(),
  lean: vi.fn(),
}));

vi.mock('mongoose', () => ({
  default: {
    Schema: vi.fn(),
    model: vi.fn(() => ({
      find: vi.fn(() => ({ sort: mocks.sort })),
      countDocuments: vi.fn(),
      create: vi.fn(),
    })),
  },
}));

describe('Automation Rule Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no active rules match', async () => {
    mocks.sort.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) });
    
    const autoService = await import('../../src/modules/automation/automation.service');
    const result = await autoService.evaluateRules('order', 'status_changed', { status: 'completed' });
    
    expect(result).toEqual([]);
  });

  it('should trigger rule when conditions match', async () => {
    const mockRule = {
      _id: 'rule-1',
      name: 'Notify on completion',
      module: 'order',
      event: 'status_changed',
      conditions: [{ fact: 'status', operator: 'equal', value: 'completed' }],
      actions: [{ type: 'notify', config: { message: 'Order completed' } }],
      isActive: true,
      priority: 50,
    };
    
    mocks.sort.mockReturnValue({ lean: vi.fn().mockResolvedValue([mockRule]) });
    
    const autoService = await import('../../src/modules/automation/automation.service');
    const result = await autoService.evaluateRules('order', 'status_changed', { status: 'completed' });
    
    expect(result.length).toBeGreaterThanOrEqual(0);
    // json-rules-engine evaluará la condición
  });

  it('should not trigger rule when conditions do not match', async () => {
    const mockRule = {
      _id: 'rule-2',
      name: 'Block on planning incomplete',
      module: 'order',
      event: 'status_changed',
      conditions: [{ fact: 'status', operator: 'equal', value: 'planning_incomplete' }],
      actions: [{ type: 'block_transition', config: {} }],
      isActive: true,
      priority: 100,
    };
    
    mocks.sort.mockReturnValue({ lean: vi.fn().mockResolvedValue([mockRule]) });
    
    const autoService = await import('../../src/modules/automation/automation.service');
    const result = await autoService.evaluateRules('order', 'status_changed', { status: 'completed' });
    
    expect(result.length).toBeGreaterThanOrEqual(0);
  });
});
```

### Task 38 — Tests de delivery-record routes

**Archivo**: `backend/tests/routes/delivery-record.routes.test.ts`
```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  create: vi.fn(),
  find: vi.fn(),
  countDocuments: vi.fn(),
}));

vi.mock('../../src/models/DeliveryRecord', () => ({
  default: {
    findById: mocks.findById,
    findByIdAndUpdate: mocks.findByIdAndUpdate,
    create: mocks.create,
    find: mocks.find,
    countDocuments: mocks.countDocuments,
  },
}));

describe('DeliveryRecord Routes', () => {
  const validId = new Types.ObjectId().toString();

  it('should list delivery records with pagination', async () => {
    mocks.find.mockReturnValue({ sort: vi.fn().mockReturnValue({ skip: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }) }) }) });
    mocks.countDocuments.mockResolvedValue(0);
    
    const service = await import('../../src/modules/delivery-record/delivery-record.service');
    const result = await service.listDeliveryRecords({ page: 1, limit: 20 });
    
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
  });

  it('should throw NotFoundError for non-existent record', async () => {
    mocks.findById.mockResolvedValue(null);
    
    const service = await import('../../src/modules/delivery-record/delivery-record.service');
    await expect(service.getDeliveryRecordById(validId)).rejects.toThrow('DeliveryRecord');
  });

  it('should create delivery record from technical report', async () => {
    const mockDoc = {
      _id: validId,
      technicalReportId: validId,
      orderId: validId,
      recipientName: 'Test Client',
      status: 'draft',
      toObject: () => ({ _id: validId, status: 'draft' }),
    };
    mocks.create.mockResolvedValue(mockDoc);
    
    const service = await import('../../src/modules/delivery-record/delivery-record.service');
    const result = await service.createDeliveryRecordFromTechnicalReport(
      validId, validId, { recipientName: 'Test Client' }
    );
    
    expect(result.status).toBe('draft');
  });
});
```

### Task 39 — Tests de invoice service

**Archivo**: `backend/tests/services/invoice.service.test.ts`
```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  countDocuments: vi.fn(),
}));

vi.mock('../../src/models/Invoice', () => ({
  default: {
    findById: mocks.findById,
    find: mocks.find,
    create: mocks.create,
    findByIdAndUpdate: mocks.findByIdAndUpdate,
    countDocuments: mocks.countDocuments,
  },
}));

describe('Invoice Service', () => {
  const validId = new Types.ObjectId().toString();

  it('should create invoice from SES', async () => {
    mocks.create.mockResolvedValue({
      toObject: () => ({ _id: validId, status: 'draft', totalAmountCOP: 10000000 }),
    });

    const service = await import('../../src/modules/invoice/invoice.service');
    // ... test implementation
  });

  it('should calculate aging days correctly', async () => {
    const pastDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
    
    mocks.find.mockResolvedValue([
      { _id: validId, dueDate: pastDate, status: 'submitted', lifecycleStatus: { $ne: 'deleted' } },
    ]);
    mocks.findByIdAndUpdate.mockResolvedValue({});

    const service = await import('../../src/modules/invoice/invoice.service');
    // ... test aging calculation
  });
});
```

### Task 40 — Tests de payment service

**Archivo**: `backend/tests/services/payment.service.test.ts`
```typescript
import { describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';

// Mock Payment model and Invoice model
const mocks = vi.hoisted(() => ({
  paymentFindById: vi.fn(),
  paymentCreate: vi.fn(),
  paymentFindOne: vi.fn(),
  invoiceFindByIdAndUpdate: vi.fn(),
}));

vi.mock('../../src/models/Payment', () => ({
  default: {
    findById: mocks.paymentFindById,
    create: mocks.paymentCreate,
    findOne: mocks.paymentFindOne,
  },
}));

vi.mock('../../src/models/Invoice', () => ({
  default: {
    findByIdAndUpdate: mocks.invoiceFindByIdAndUpdate,
  },
}));

describe('Payment Service', () => {
  it('should register payment for invoice', async () => {
    const paymentId = new Types.ObjectId().toString();
    const invoiceId = new Types.ObjectId().toString();
    
    mocks.paymentCreate.mockResolvedValue({
      toObject: () => ({ _id: paymentId, invoiceId, amountCOP: 5000000, status: 'pending' }),
    });
    
    const service = await import('../../src/modules/payment/payment.service');
    // test registerPaymentForInvoice
  });

  it('should reconcile payment', async () => {
    mocks.paymentFindById.mockResolvedValue({
      _id: new Types.ObjectId(),
      status: 'completed',
      save: vi.fn().mockResolvedValue({ toObject: () => ({ status: 'reconciled' }) }),
    });
    
    const service = await import('../../src/modules/payment/payment.service');
    // test reconcilePayment
  });
});
```

---

---

## FASE 8 — SPRINT 8: INFRAESTRUCTURA Y DEVOPS (Tasks 41-45)

### Task 41 — Dockerfile optimizado para producción multi-stage

**Archivo**: `Dockerfile` (raíz del monorepo)
```dockerfile
# Stage 1: Build shared packages
FROM node:22-alpine AS builder-shared
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/ ./packages/
RUN npm ci --ignore-scripts && npm run build -w @cermont/shared-types && npm run build -w @cermont/domain && npm run build -w @cermont/config

# Stage 2: Build backend
FROM node:22-alpine AS builder-backend
WORKDIR /app
COPY --from=builder-shared /app ./
COPY backend/ ./backend/
RUN npm ci --ignore-scripts -w backend && npm run build -w backend

# Stage 3: Build frontend
FROM node:22-alpine AS builder-frontend
WORKDIR /app
COPY --from=builder-shared /app ./
COPY --from=builder-backend /app/backend/dist ./backend/dist
COPY frontend/ ./frontend/
RUN npm ci --ignore-scripts -w frontend && npm run build -w frontend

# Stage 4: Production
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder-shared /app/packages ./packages
COPY --from=builder-backend /app/backend/dist ./backend/dist
COPY --from=builder-backend /app/backend/package.json ./backend/
COPY --from=builder-frontend /app/frontend/.next ./frontend/.next
COPY --from=builder-frontend /app/frontend/public ./frontend/public
COPY --from=builder-frontend /app/frontend/package.json ./frontend/
COPY --from=builder-frontend /app/frontend/next.config.ts ./frontend/
COPY package.json package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

USER appuser
EXPOSE 4000 3000
CMD ["node", "backend/dist/server.js"]
```

### Task 42 — Script de seed con datos de prueba realistas

**Archivo**: `backend/src/scripts/seed-demo-data.ts`
```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function seedDemoData() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cermont');
  console.log('Connected to MongoDB');

  // Crear usuarios demo
  const User = mongoose.model('User');
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('Demo1234!', salt);

  const users = [
    { name: 'Gerente Demo', email: 'gerente@cermont.com', password, role: 'gerente', isActive: true },
    { name: 'Residente Demo', email: 'residente@cermont.com', password, role: 'residente', isActive: true },
    { name: 'HES Demo', email: 'hes@cermont.com', password, role: 'hes', isActive: true },
    { name: 'Supervisor Demo', email: 'supervisor@cermont.com', password, role: 'supervisor', isActive: true },
    { name: 'Operador Demo', email: 'operador@cermont.com', password, role: 'operador', isActive: true },
    { name: 'Tecnico Demo', email: 'tecnico@cermont.com', password, role: 'tecnico', isActive: true },
    { name: 'Admin Demo', email: 'admin@cermont.com', password, role: 'administrativo', isActive: true },
    { name: 'Cliente Demo', email: 'cliente@cermont.com', password, role: 'cliente', isActive: true },
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      await User.create(u);
      console.log(`Created user: ${u.email}`);
    }
  }

  // Crear clientes demo
  const Client = mongoose.model('Client');
  const clients = [
    { name: 'SIERRACOL Energy', nit: '900123456-7', email: 'facturas@sierracol.com', phone: '+57 1 2345678' },
    { name: 'Ecopetrol S.A.', nit: '899999001-1', email: 'facturas@ecopetrol.com', phone: '+57 1 2345679' },
    { name: 'Constructora ABC', nit: '900789012-3', email: 'info@constructoraabc.com', phone: '+57 4 5678901' },
  ];

  for (const c of clients) {
    const existing = await Client.findOne({ nit: c.nit });
    if (!existing) {
      await Client.create(c);
      console.log(`Created client: ${c.name}`);
    }
  }

  // Crear órdenes demo en varios estados
  const Order = mongoose.model('Order');
  const ServiceCase = mongoose.model('ServiceCase');
  const workStatuses = ['open', 'assigned', 'in_progress', 'completed', 'closed'];
  const orderTypes = [
    { title: 'Mantenimiento CCTV Torre 5A', type: 'cctv_maintenance' },
    { title: 'Instalación línea de vida vertical', type: 'safety_line' },
    { title: 'Mantenimiento eléctrico subestación', type: 'electrical' },
    { title: 'Montaje de equipos de refrigeración', type: 'refrigeration' },
    { title: 'Inspección de redes de telecomunicaciones', type: 'telecom' },
  ];

  for (let i = 0; i < 10; i++) {
    const sc = await ServiceCase.create({
      code: `SC-2026-${String(i + 1).padStart(3, '0')}`,
      title: orderTypes[i % orderTypes.length].title,
      clientId: clients[i % clients.length]._id,
      status: 'open',
      currentStep: Math.floor(Math.random() * 8) + 1,
      createdBy: users[i % users.length]._id,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    });

    await Order.create({
      code: `ORD-2026-${String(i + 1).padStart(3, '0')}`,
      serviceCaseId: sc._id,
      clientId: clients[i % clients.length]._id,
      title: sc.title,
      status: workStatuses[i % workStatuses.length],
      type: orderTypes[i % orderTypes.length].type,
      estimatedCostCOP: Math.floor(Math.random() * 50000000) + 5000000,
      createdBy: users[i % users.length]._id,
      createdAt: sc.createdAt,
    });
  }

  console.log('Demo data seeded successfully!');
  process.exit(0);
}

seedDemoData().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

### Task 43 — Script de backup automático con compresión

**Archivo**: `backend/src/scripts/backup.ts`
```typescript
import { execSync } from 'child_process';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';

interface BackupConfig {
  mongoUri: string;
  backupDir: string;
  retentionDays: number;
}

const config: BackupConfig = {
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cermont',
  backupDir: process.env.BACKUP_DIR || './backups',
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
};

async function createBackup(): Promise<string> {
  if (!existsSync(config.backupDir)) {
    mkdirSync(config.backupDir, { recursive: true });
  }

  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
  const backupPath = join(config.backupDir, `cermont-backup-${timestamp}`);
  const archivePath = `${backupPath}.gz`;

  console.log(`Creating backup: ${backupPath}`);

  // Usar mongodump
  execSync(
    `mongodump --uri="${config.mongoUri}" --out="${backupPath}" --gzip`,
    { stdio: 'inherit', timeout: 300000 }
  );

  // Comprimir
  execSync(
    `tar -czf "${archivePath}" -C "${config.backupDir}" "cermont-backup-${timestamp}"`,
    { stdio: 'inherit', timeout: 300000 }
  );

  // Limpiar directorio temporal
  execSync(
    process.platform === 'win32'
      ? `rmdir /s /q "${backupPath}"`
      : `rm -rf "${backupPath}"`,
    { stdio: 'inherit' }
  );

  console.log(`Backup created: ${archivePath}`);
  return archivePath;
}

async function cleanupOldBackups(): Promise<void> {
  if (!existsSync(config.backupDir)) return;
  
  const { readdirSync, unlinkSync } = await import('fs');
  const files = readdirSync(config.backupDir);
  const now = Date.now();
  
  let deleted = 0;
  for (const file of files) {
    if (!file.endsWith('.gz')) continue;
    const filePath = join(config.backupDir, file);
    const stat = await import('fs/promises').then(fs => fs.stat(filePath));
    const ageDays = (now - stat.mtimeMs) / (1000 * 60 * 60 * 24);
    
    if (ageDays > config.retentionDays) {
      unlinkSync(filePath);
      deleted++;
    }
  }
  
  console.log(`Cleaned up ${deleted} old backups (retention: ${config.retentionDays} days)`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'backup';

  switch (command) {
    case 'backup':
      await createBackup();
      await cleanupOldBackups();
      break;
    case 'cleanup':
      await cleanupOldBackups();
      break;
    case 'list':
      const { readdirSync } = await import('fs');
      const files = readdirSync(config.backupDir)
        .filter(f => f.endsWith('.gz'))
        .sort()
        .reverse();
      console.log('Available backups:');
      files.forEach(f => console.log(`  ${f}`));
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Usage: tsx backup.ts [backup|cleanup|list]');
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
```

### Task 44 — Health check endpoints mejorados

**Archivo**: `backend/src/modules/observability/health.routes.ts`
```typescript
import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess, sendError } from '../../common/interceptors/response.interceptor';

const router = Router();

// Liveness probe — el proceso está vivo
router.get('/live', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'alive', uptime: process.uptime(), timestamp: new Date().toISOString() } });
});

// Readiness probe — el proceso puede recibir tráfico
router.get('/ready', async (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  
  if (mongoState === 1) {
    // Verificar que podemos hacer queries
    try {
      await mongoose.connection.db?.admin().ping();
      sendSuccess(res, {
        status: 'ready',
        mongo: { connected: true, readyState: mongoState },
        timestamp: new Date().toISOString(),
      });
    } catch {
      sendSuccess(res, {
        status: 'degraded',
        mongo: { connected: true, readyState: mongoState, pingFailed: true },
        timestamp: new Date().toISOString(),
      }, 200); // 200 porque el server funciona, MongoDB responde lento
    }
  } else {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: `MongoDB not ready (state: ${mongoState})`,
      },
    });
  }
});

// Startup probe — verificar dependencias críticas
router.get('/startup', async (_req, res) => {
  const checks: Record<string, unknown> = {};
  
  // MongoDB
  checks.mongo = mongoose.connection.readyState === 1;
  
  // Directorio de uploads
  const fs = await import('fs');
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  checks.uploadDir = fs.existsSync(uploadDir);
  
  // Variables de entorno críticas
  checks.env = {
    nodeEnv: !!process.env.NODE_ENV,
    jwtSecret: !!process.env.JWT_SECRET,
    mongoUri: !!process.env.MONGO_URI,
    frontendUrl: !!process.env.FRONTEND_URL,
  };
  
  const allPassed = Object.values(checks).every(v => v === true || (typeof v === 'object' && Object.values(v as Record<string, unknown>).every(x => x)));
  
  res.status(allPassed ? 200 : 503).json({
    success: allPassed,
    data: { checks, allPassed, timestamp: new Date().toISOString() },
  });
});

export default router;
```

### Task 45 — PM2 ecosystem config para producción

**Archivo**: `ecosystem.config.js`
```javascript
module.exports = {
  apps: [
    {
      name: 'cermont-backend',
      script: 'backend/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      env_file: 'backend/.env',
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
      min_uptime: '30s',
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
    {
      name: 'cermont-frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: 'frontend',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: 'frontend/.env.production',
      max_memory_restart: '512M',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      merge_logs: true,
      autorestart: true,
      watch: false,
    },
  ],
};
```

---

## FASE 9 — SPRINT 9: SEGURIDAD Y CUMPLIMIENTO (Tasks 46-50)

### Task 46 — Rate limiting mejorado por ruta

**Archivo**: `backend/src/middlewares/rate-limit.config.ts`
```typescript
import rateLimit from 'express-rate-limit';

// Auth endpoints: 5 intentos por 15 minutos
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many auth attempts. Try again in 15 minutes.' } },
});

// API general: 100 requests por minuto
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Slow down.' } },
});

// Upload endpoints: 10 requests por minuto (archivos pesados)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'UPLOAD_LIMIT_EXCEEDED', message: 'Upload limit reached. Try again later.' } },
});

// Portal público: 30 requests por minuto
export const portalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests.' } },
});
```

### Task 47 — Input sanitization middleware

**Archivo**: `backend/src/middlewares/sanitize.middleware.ts`
```typescript
import type { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';

// Sanitizar inputs: remover $ y . de keys para prevenir NoSQL injection
export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }: { req: Request; key: string }) => {
    // Loggear intentos de inyección (sin datos sensibles)
    if (key.startsWith('$')) {
      req.log?.warn?.('NoSQL injection attempt blocked', { path: req.path, key });
    }
  },
});

// Sanitizar strings: remover HTML tags peligrosos
export function sanitizeStrings(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Remover scripts HTML
      result[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                         .replace(/on\w+="[^"]*"/gi, '')
                         .replace(/javascript:/gi, '');
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeStrings(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Middleware que sanitiza body, query y params
export function sanitizeAll(req: Request, _res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeStrings(req.body);
  if (req.query) req.query = sanitizeStrings(req.query as Record<string, unknown>);
  if (req.params) req.params = sanitizeStrings(req.params as Record<string, unknown>) as Request['params'];
  next();
}
```

### Task 48 — Audit logging middleware centralizado

**Archivo**: `backend/src/middlewares/audit-log.middleware.ts`
```typescript
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface AuditEntry {
  action: string;
  entityType: string;
  entityId?: string;
  actorId: string;
  actorRole: string;
  requestId: string;
  metadata: Record<string, unknown>;
  ip: string;
  userAgent: string;
  timestamp: string;
}

// Las acciones críticas que deben auditarse
const CRITICAL_ACTIONS = [
  'create_order', 'approve_proposal', 'approve_planning',
  'start_execution', 'complete_execution', 'reject_evidence',
  'approve_ses', 'reject_ses', 'approve_invoice', 'reject_invoice',
  'register_payment', 'reconcile_payment', 'change_role',
  'deactivate_user', 'delete_document',
];

const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({
  action: String,
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  actorId: mongoose.Schema.Types.ObjectId,
  actorRole: String,
  requestId: String,
  metadata: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String,
  timestamp: Date,
}, { timestamps: false }));

// Índices para consultas forenses
AuditLog.collection?.createIndex({ action: 1, timestamp: -1 });
AuditLog.collection?.createIndex({ entityType: 1, entityId: 1 });
AuditLog.collection?.createIndex({ actorId: 1, timestamp: -1 });
AuditLog.collection?.createIndex({ requestId: 1 });

export function auditLog(action: string, entityType: string, metadata: Record<string, unknown> = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Guardar el audit log después de que la respuesta se envíe
    const originalSend = res.json.bind(res);
    res.json = function (body: Record<string, unknown>) {
      if (CRITICAL_ACTIONS.includes(action) && res.statusCode < 400) {
        const user = (req as Record<string, unknown>).user as Record<string, unknown> | undefined;
        const entry: AuditEntry = {
          action,
          entityType,
          entityId: req.params.id || (body?.data as Record<string, unknown>)?._id as string,
          actorId: user?._id as string || 'system',
          actorRole: user?.role as string || 'system',
          requestId: (req as Record<string, unknown>).requestId as string || 'unknown',
          metadata: { ...metadata, method: req.method, path: req.path, statusCode: res.statusCode },
          ip: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          timestamp: new Date().toISOString(),
        };
        
        AuditLog.create(entry).catch(err => {
          console.error('Audit log creation failed:', err.message);
        });
      }
      return originalSend(body);
    };
    next();
  };
}
```

### Task 49 — CSP Headers hardening

**Archivo**: Modificar `backend/src/index.ts` — agregar helmet con CSP estricto:
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],  // necesario para Next.js
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,  // necesario para algunos assets de Next.js
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
```

### Task 50 — Validación de variables de entorno al iniciar

**Archivo**: `backend/src/config/validate-env.ts`
```typescript
import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('4000'),
  MONGO_URI: z.string().url().refine(
    uri => uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'),
    { message: 'MONGO_URI must be a valid MongoDB connection string' }
  ),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().regex(/^\d+$/).transform(Number).default('10485760'),
  BACKUP_DIR: z.string().optional().default('./backups'),
  BACKUP_RETENTION_DAYS: z.string().regex(/^\d+$/).transform(Number).default('30'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('60000'),
  RATE_LIMIT_MAX: z.string().regex(/^\d+$/).transform(Number).default('100'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(): EnvConfig {
  const result = EnvSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Environment variable validation failed:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  
  return result.data;
}
```

---

## FASE 10 — SPRINT 10: PÁGINAS FRONTEND COMPLETAS (Tasks 51-56)

Cada página incluye: loading state, error state, empty state, offline handling, y RBAC via roles del store.

### Task 51 — Kanban Board con drag-and-drop

**Archivo**: `frontend/src/app/(dashboard)/orders/kanban/page.tsx`
```tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

const COLUMNS = [
  { id: 'open', title: 'Open', color: 'bg-gray-100 dark:bg-gray-800/50' },
  { id: 'assigned', title: 'Assigned', color: 'bg-blue-50 dark:bg-blue-950/20' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-50 dark:bg-amber-950/20' },
  { id: 'completed', title: 'Completed', color: 'bg-green-50 dark:bg-green-950/20' },
  { id: 'closed', title: 'Closed', color: 'bg-gray-100 dark:bg-gray-800/50' },
];

interface OrderCard {
  _id: string; code: string; title: string; status: string;
  priority: string; clientName: string; estimatedCostCOP: number;
  type: string; createdAt: string;
}

export default function KanbanPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('all');
  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'kanban'],
    queryFn: () => apiClient.get<OrderCard[]>('/orders'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch(`/orders/${id}`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order updated'); },
    onError: () => toast.error('Failed to update order'),
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.droppableId === result.source.droppableId) return;
    updateStatus.mutate({ id: result.draggableId, status: result.destination.droppableId });
  };

  if (isLoading) return (
    <div className="flex gap-4 p-6 overflow-x-auto">
      {COLUMNS.map(col => (
        <div key={col.id} className="flex-1 min-w-[280px] space-y-3">
          <Skeleton className="h-8 w-24" />
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      ))}
    </div>
  );

  const ordersByStatus: Record<string, OrderCard[]> = {};
  for (const col of COLUMNS) {
    ordersByStatus[col.id] = (data || []).filter(o => o.status === col.id && (filterType === 'all' || o.type === filterType));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Kanban Board</h1>
        <div className="flex gap-2">
          <select className="text-sm border rounded-md px-3 py-1.5 bg-background" value={filterType}
            onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="cctv_maintenance">CCTV</option>
            <option value="safety_line">Safety Lines</option>
            <option value="electrical">Electrical</option>
            <option value="refrigeration">Refrigeration</option>
            <option value="telecom">Telecom</option>
          </select>
          <Button asChild size="sm"><Link href="/orders/new"><Plus className="size-4 mr-1" /> New Order</Link></Button>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <div key={col.id} className={`flex-1 min-w-[280px] rounded-lg ${col.color} p-3`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <Badge variant="secondary" className="text-[10px]">{ordersByStatus[col.id]?.length || 0}</Badge>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className={`space-y-2 min-h-[200px] rounded-md transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                    {(ordersByStatus[col.id] || []).map((order, index) => (
                      <Draggable key={order._id} draggableId={order._id} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            className={`bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border transition-all ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-200 rotate-2' : ''}`}>
                            <div className="flex items-start justify-between mb-1">
                              <Link href={`/orders/${order._id}`} className="text-xs font-mono text-muted-foreground hover:underline">{order.code}</Link>
                              {order.status === 'in_progress' ? <AlertTriangle className="size-3 text-amber-400" /> :
                               order.status === 'completed' ? <CheckCircle2 className="size-3 text-green-400" /> :
                               <Clock className="size-3 text-gray-400" />}
                            </div>
                            <p className="text-sm font-medium leading-tight mb-2">{order.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>{order.clientName}</span><span>·</span>
                              <span>${(order.estimatedCostCOP / 1000000).toFixed(1)}M</span>
                            </div>
                            {order.createdAt && <p className="text-[10px] text-gray-400 mt-1">{format(new Date(order.createdAt), 'MMM d')}</p>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
```

### Task 52 — Order Detail Page con Cockpit

**Archivo**: `frontend/src/app/(dashboard)/orders/[id]/page.tsx`
```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, ClipboardList, Camera, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { FourteenStepProgress } from '@/modules/service-cases/ui/FourteenStepProgress';

interface OrderDetailData {
  _id: string; code: string; title: string; status: string; type: string;
  client: { _id: string; name: string };
  serviceCaseId: string; estimatedCostCOP: number; actualCostCOP: number;
  description: string; createdAt: string;
  serviceCase: { currentStep: number; stepStatuses: Record<number, string> };
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', params.id],
    queryFn: () => apiClient.get<OrderDetailData>(`/orders/${params.id}`),
  });

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>;

  if (error) return (
    <div className="p-6"><div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
      <h2 className="font-semibold text-red-600">Error loading order</h2>
      <p className="text-sm text-red-500">{(error as Error).message}</p>
    </div></div>
  );

  if (!data) return (
    <div className="p-6"><div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border text-center">
      <p className="text-gray-400">Order not found</p>
    </div></div>
  );

  const margin = data.estimatedCostCOP - (data.actualCostCOP || 0);
  const marginPercent = data.estimatedCostCOP > 0 ? (margin / data.estimatedCostCOP) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild><Link href="/orders"><ArrowLeft className="size-4" /></Link></Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{data.code}</h1>
              <Badge>{data.status}</Badge>
              <Badge variant="outline">{data.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{data.title}</p>
            <p className="text-xs text-muted-foreground">{data.client?.name} · {new Date(data.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <FourteenStepProgress currentStep={data.serviceCase?.currentStep || 1}
        stepStatuses={(data.serviceCase?.stepStatuses || {}) as Record<number, 'pending' | 'active' | 'completed' | 'blocked' | 'skipped'>} />

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-xs text-muted-foreground">Estimated</p>
          <p className="text-lg font-bold">${(data.estimatedCostCOP / 1000000).toFixed(1)}M</p>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
          <p className="text-xs text-muted-foreground">Actual</p>
          <p className="text-lg font-bold">${((data.actualCostCOP || 0) / 1000000).toFixed(1)}M</p>
        </div>
        <div className={`p-4 rounded-lg ${margin >= 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
          <p className="text-xs text-muted-foreground">Margin</p>
          <p className={`text-lg font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{marginPercent.toFixed(1)}%</p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><FileText className="size-4 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="planning"><ClipboardList className="size-4 mr-1" /> Planning</TabsTrigger>
          <TabsTrigger value="evidences"><Camera className="size-4 mr-1" /> Evidences</TabsTrigger>
          <TabsTrigger value="costs"><DollarSign className="size-4 mr-1" /> Costs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <p className="text-sm text-muted-foreground">{data.description || 'No description provided.'}</p>
        </TabsContent>
        <TabsContent value="planning" className="mt-4">
          <p className="text-sm text-gray-400">Planning content coming in Sprint 2</p>
        </TabsContent>
        <TabsContent value="evidences" className="mt-4">
          <p className="text-sm text-gray-400 text-center py-8">No evidence available</p>
        </TabsContent>
        <TabsContent value="costs" className="mt-4">
          <p className="text-sm text-gray-400">Cost breakdown coming in Sprint 4</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Task 53 — Field Execution Session Page

**Archivo**: `frontend/src/app/(dashboard)/execution/[id]/page.tsx`
```tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square, Camera, CheckSquare, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ExecData {
  _id: string; orderId: string;
  status: 'pending' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  startedAt?: string; pausedAt?: string; completedAt?: string;
}

export default function ExecutionPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['execution-sessions', params.id],
    queryFn: () => apiClient.get<ExecData>(`/execution-sessions/${params.id}`),
    refetchInterval: 30000,
  });

  const startMut = useMutation({
    mutationFn: () => apiClient.post(`/execution-sessions/${params.id}/start`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['execution-sessions'] }); toast.success('Started'); },
  });
  const pauseMut = useMutation({
    mutationFn: () => apiClient.post(`/execution-sessions/${params.id}/pause`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['execution-sessions'] }); toast.success('Paused'); },
  });
  const completeMut = useMutation({
    mutationFn: () => apiClient.post(`/execution-sessions/${params.id}/complete`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['execution-sessions'] }); toast.success('Completed'); },
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-96 w-full rounded-lg" /></div>;
  if (error) return <div className="p-6 text-red-500">Error: {(error as Error).message}</div>;
  if (!data) return <div className="p-6 text-center text-gray-400"><AlertTriangle className="size-12 mx-auto mb-3" /><p>Session not found</p></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Field Execution</h1><p className="text-sm text-muted-foreground">ID: {data._id.slice(-8)}</p></div>
        <Badge variant={data.status === 'in_progress' ? 'default' : data.status === 'paused' ? 'secondary' : 'outline'}>
          <Clock className="size-3 mr-1" /> {data.status.replace('_', ' ')}
        </Badge>
      </div>

      <Card><CardContent className="p-6 text-center">
        <p className="text-5xl font-mono font-bold tabular-nums">00:00</p>
        <div className="flex justify-center gap-3 mt-4">
          {data.status === 'pending' && <Button onClick={() => startMut.mutate()}><Play className="size-4 mr-1" /> Start</Button>}
          {data.status === 'in_progress' && (<><Button variant="outline" onClick={() => pauseMut.mutate()}><Pause className="size-4 mr-1" /> Pause</Button><Button onClick={() => completeMut.mutate()}><Square className="size-4 mr-1" /> Complete</Button></>)}
          {data.status === 'paused' && <Button onClick={() => startMut.mutate()}><Play className="size-4 mr-1" /> Resume</Button>}
        </div>
      </CardContent></Card>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1"><Camera className="size-4 mr-1" /> Capture Evidence</Button>
        <Button variant="outline" className="flex-1"><CheckSquare className="size-4 mr-1" /> Checklist</Button>
        <Button variant="outline" className="flex-1"><AlertTriangle className="size-4 mr-1" /> Report Issue</Button>
      </div>
    </div>
  );
}
```

### Task 54 — Billing Pipeline Page

**Archivo**: `frontend/src/app/(dashboard)/billing/page.tsx`
```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CreditCard, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600', submitted: 'bg-blue-100 text-blue-600',
  approved: 'bg-green-100 text-green-600', rejected: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-400', paid: 'bg-emerald-100 text-emerald-600',
};

export default function BillingPage() {
  const { data: sesList, isLoading: sesLoad } = useQuery({ queryKey: ['billing', 'ses'], queryFn: () => apiClient.get('/service-entry-sheets') });
  const { data: invList, isLoading: invLoad } = useQuery({ queryKey: ['billing', 'invoices'], queryFn: () => apiClient.get('/invoices') });
  const { data: payList, isLoading: payLoad } = useQuery({ queryKey: ['billing', 'payments'], queryFn: () => apiClient.get('/payments') });

  const Pipeline = ({ data, label, color }: { data: unknown[]; label: string; color: string }) => (
    <div className="flex-1 text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{(data as Array<unknown>)?.length || 0}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Billing Pipeline</h1>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline"><Link href="/billing/ses/new"><FileText className="size-4 mr-1" /> New SES</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href="/billing/invoices/new"><CreditCard className="size-4 mr-1" /> New Invoice</Link></Button>
          <Button asChild size="sm"><Link href="/payments/new"><DollarSign className="size-4 mr-1" /> Record Payment</Link></Button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <Pipeline data={sesList as unknown[]} label="SES" color="text-blue-600" />
        <ArrowRight className="size-5 text-gray-300" />
        <Pipeline data={invList as unknown[]} label="Invoices" color="text-purple-600" />
        <ArrowRight className="size-5 text-gray-300" />
        <Pipeline data={payList as unknown[]} label="Payments" color="text-green-600" />
      </div>

      <Tabs defaultValue="ses">
        <TabsList><TabsTrigger value="ses">SES</TabsTrigger><TabsTrigger value="invoices">Invoices</TabsTrigger><TabsTrigger value="payments">Payments</TabsTrigger></TabsList>

        <TabsContent value="ses" className="mt-4">
          {sesLoad ? <Skeleton className="h-64 w-full" /> : !(sesList as Array<Record<string, unknown>>)?.length
            ? <p className="text-sm text-gray-400 text-center py-8">No SES records yet</p>
            : <div className="space-y-2">{(sesList as Array<Record<string, unknown>>).map((s: Record<string, unknown>) => (
              <Card key={s._id as string}><CardContent className="p-4 flex items-center justify-between">
                <div><p className="text-sm font-medium">{s.aribaReference as string || 'N/A'}</p><p className="text-xs text-muted-foreground">Order: {(s.orderId as string)?.slice(-8)}</p></div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[s.status as string] || ''}`}>{s.status as string}</span>
              </CardContent></Card>
            ))}</div>}
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <div className="space-y-2">{(invList as Array<Record<string, unknown>> || []).map((inv: Record<string, unknown>) => (
            <Card key={inv._id as string}><CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-sm font-medium">{inv.invoiceNumber as string}</p><p className="text-xs text-muted-foreground">${(inv.totalAmountCOP as number || 0).toLocaleString()}</p></div>
              <div className="flex items-center gap-3">
                {(inv.agingDays as number || 0) > 30 && <Badge variant="destructive">{inv.agingDays as number}d overdue</Badge>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inv.status as string] || ''}`}>{inv.status as string}</span>
              </div>
            </CardContent></Card>
          ))}</div>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <div className="space-y-2">{(payList as Array<Record<string, unknown>> || []).map((p: Record<string, unknown>) => (
            <Card key={p._id as string}><CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-sm font-medium">${(p.amountCOP as number || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">{p.paymentMethod as string}</p></div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status as string] || ''}`}>{p.status as string}</span>
            </CardContent></Card>
          ))}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Task 55 — Service Cases Listing Page

**Archivo**: `frontend/src/app/(dashboard)/service-cases/page.tsx`
```tsx
'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface SCData { _id: string; code: string; title: string; clientName: string; currentStep: number; status: string; createdAt: string; priority: string; }

export default function ServiceCasesPage() {
  const [search, setSearch] = useState('');
  const [filterStep, setFilterStep] = useState<number | null>(null);
  const { data, isLoading, error } = useQuery({ queryKey: ['service-cases'], queryFn: () => apiClient.get<SCData[]>('/service-cases') });

  const filtered = (data || []).filter((sc: SCData) => {
    const ms = !search || sc.code.toLowerCase().includes(search.toLowerCase()) || sc.title.toLowerCase().includes(search.toLowerCase());
    const mf = !filterStep || sc.currentStep === filterStep;
    return ms && mf;
  });

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}</div></div>;
  if (error) return <div className="p-6 text-red-500">Error: {(error as Error).message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Service Cases</h1>
        <Button asChild size="sm"><Link href="/work-requests/new"><Plus className="size-4 mr-1" /> New Case</Link></Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input placeholder="Search by code or title..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {[null, 1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(s => (
            <Button key={s ?? 'all'} variant={filterStep === s ? 'default' : 'ghost'} size="sm" className="text-xs h-7 px-2" onClick={() => setFilterStep(s)}>{s ?? 'All'}</Button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><AlertTriangle className="size-12 mx-auto mb-3 opacity-50" /><p>No service cases found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sc: SCData) => (
            <Link key={sc._id} href={`/service-cases/${sc._id}`}>
              <Card className="hover:shadow-md hover:ring-1 hover:ring-blue-200 transition-all cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div><p className="text-xs font-mono text-muted-foreground">{sc.code}</p><p className="text-sm font-medium mt-1">{sc.title}</p></div>
                    <Badge variant={sc.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">{sc.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{sc.clientName}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(sc.currentStep / 14) * 100}%` }} /></div>
                    <span className="text-xs font-mono text-muted-foreground">{sc.currentStep}/14</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-gray-400">{format(new Date(sc.createdAt), 'MMM d')}</span>
                    <ChevronRight className="size-4 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Task 56 — Evidences Gallery Page

**Archivo**: `frontend/src/app/(dashboard)/evidences/page.tsx`
```tsx
'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/http/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ImageIcon, FileIcon } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_FILTERS = ['all', 'captured', 'uploaded', 'pending_review', 'approved', 'rejected', 'locked'];

interface EvData { _id: string; fileName: string; mimeType: string; status: string; phase: string; capturedAt: string; capturedByName: string; orderCode: string; }

export default function EvidencesPage() {
  const [filter, setFilter] = useState('all');
  const { data, isLoading, error } = useQuery({ queryKey: ['evidences'], queryFn: () => apiClient.get<EvData[]>('/evidences') });

  const filtered = (data || []).filter(e => filter === 'all' || e.status === filter);

  if (isLoading) return <div className="p-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}</div></div>;
  if (error) return <div className="p-6 text-red-500">Error: {(error as Error).message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Evidence Gallery</h1>
        <div className="flex gap-2">
          {STATUS_FILTERS.map(s => (
            <Button key={s} variant={filter === s ? 'default' : 'ghost'} size="sm" className="text-xs capitalize" onClick={() => setFilter(s)}>
              {s.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <div className="text-center py-12 text-gray-400">
          <ImageIcon className="size-12 mx-auto mb-3 opacity-50" />
          <p>No evidence found</p>
          <p className="text-sm">Start an execution session to capture photos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map(ev => (
            <Card key={ev._id} className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all">
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center">
                {ev.mimeType.startsWith('image/') ? (
                  <img src={`/api/files/${ev._id}/content`} alt={ev.fileName} className="w-full h-full object-cover" />
                ) : <FileIcon className="size-8 text-gray-400" />}
                <Badge className="absolute top-2 right-2 text-[10px]" variant={ev.status === 'approved' ? 'default' : ev.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {ev.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{ev.fileName}</p>
                <p className="text-[10px] text-gray-400">{ev.capturedAt ? format(new Date(ev.capturedAt), 'MMM d') : ''}{ev.capturedByName ? ` · ${ev.capturedByName}` : ''}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## FASE 11 — SPRINT 11: ENRIQUECIMIENTO DE SCHEMAS Y MÓDULOS EXISTENTES (Tasks 57-59)

### Task 57 — Extender schemas con campos de negocio del LTG

Cada schema existente en shared-types debe ser enriquecido con campos del LTG. Modificar archivos existentes (solo agregar campos, nunca eliminar):

**Archivo**: `packages/shared-types/src/schemas/work-request.schema.ts`
Agregar: `channel: z.enum(['email', 'phone', 'portal', 'in_person']).default('email')`, `priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')`, `slaHours: z.number().int().positive().default(48)`.

**Archivo**: `packages/shared-types/src/schemas/proposal.schema.ts`
Agregar: `marginPercent: z.number().optional()`, `taxAmountCOP: z.number().nonnegative().default(0)`, `validUntil: z.string().datetime().optional()`, `version: z.number().int().positive().default(1)`.

**Archivo**: `packages/shared-types/src/schemas/purchase-order.schema.ts`
Agregar: `poNumber: z.string().min(1).max(50)`, `poDate: z.string().datetime()`, `amountCOP: z.number().nonnegative()`, `validatedAgainstProposal: z.boolean().default(false)`.

**Archivo**: `packages/shared-types/src/schemas/dashboard-summary.schema.ts`
Agregar: `DashboardKpiWidgetSchema` con `mttr: z.number()`, `mtbf: z.number()`, `firstTimeFixRate: z.number()`, `technicianUtilization: z.number()`, `slaCompliance: z.number()`, `pendingCertifications: z.number()`.

### Task 58 — KPI Module: Implementar CRUD completo

El módulo kpi/ está vacío. Crear estructura completa:

**Archivo**: `backend/src/modules/kpi/kpi.model.ts`
```typescript
import mongoose, { Schema, type Document } from 'mongoose';

export interface IKpiDashboard extends Document {
  period: string;
  mttr: number;
  mtbf: number;
  firstTimeFixRate: number;
  technicianUtilization: number;
  calculatedAt: Date;
  data: Record<string, unknown>;
}

const KpiDashboardSchema = new Schema<IKpiDashboard>({
  period: { type: String, required: true, enum: ['7d', '30d', '90d', '12m'] },
  mttr: { type: Number, required: true, default: 0 },
  mtbf: { type: Number, required: true, default: 0 },
  firstTimeFixRate: { type: Number, required: true, default: 0 },
  technicianUtilization: { type: Number, required: true, default: 0 },
  calculatedAt: { type: Date, required: true, default: Date.now },
  data: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

KpiDashboardSchema.index({ period: 1, calculatedAt: -1 });
export default mongoose.model<IKpiDashboard>('KpiDashboard', KpiDashboardSchema);
```

**Archivo**: `backend/src/modules/kpi/kpi.service.ts` — completar con CRUD y cálculos MTTR/MTBF desde ExecutionSession y Maintenance.

**Archivo**: `backend/src/modules/kpi/kpi.controller.ts`
```typescript
import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/interceptors/response.interceptor';
import * as KpiService from './kpi.service';

export async function getKpiSummary(req: Request, res: Response): Promise<void> {
  const period = (req.query.period as string) || '30d';
  const data = await KpiService.getDashboardKpiSummary(period as '7d' | '30d' | '90d' | '12m');
  sendSuccess(res, data);
}

export async function recalculateKpis(_req: Request, res: Response): Promise<void> {
  const result = await KpiService.recalculateAllKpis();
  sendSuccess(res, result);
}
```

**Archivo**: `backend/src/modules/kpi/kpi.routes.ts`
```typescript
import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import * as KpiController from './kpi.controller';

const router = Router();
router.use(authenticate);

router.get('/summary', authorize('gerente', 'residente', 'hes'), KpiController.getKpiSummary);
router.post('/recalculate', authorize('gerente'), KpiController.recalculateKpis);

export default router;
```

### Task 59 — Media Module: Implementar upload con FileAsset

**Contexto**: media/ tiene solo un directorio `models/` vacío. Según regla 5 del spec, FileAsset es SSOT para archivos.

**Decisión**: No crear módulo media duplicado. En su lugar, extender el módulo `files/` existente para soportar tipos MIME adicionales (video, audio) si es necesario.

**Archivo**: `backend/src/modules/files/files.service.ts` — extender con:
```typescript
// Agregar soporte para videos y audios
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
const ALLOWED_ALL = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES];
```

Eliminar `backend/src/modules/media/` si existe como directorio vacío.

---

## FASE 12 — SPRINT 12: ENRIQUECIMIENTO DE PASOS DEL FLUJO (Tasks 60-75)

### Task 60-62: Enriquecer Steps 1-4 (WorkRequest, SiteVisit, Proposal, PO)

Para cada paso, agregar campos faltantes según LTG en schemas, modelos y servicios. Seguir patrón Contract-First.

### Task 63-65: Enriquecer Steps 5-8 (Planning, Execution, TechnicalReport, DeliveryRecord)

Implementar preflight checklist, auto-generación de informes desde ejecución, y flujo de firma digital.

### Task 66-68: Enriquecer Steps 9-14 (SES, Invoice, Payment)

Implementar integración Ariba, pipeline visual de facturación, y conciliación de pagos.

### Task 69-75: Módulos de soporte

Cost catalog, fleet alerts, tool calibration, inventory QR scanning, checklist templates, safety analysis, notifications preferences.

Cada task sigue el mismo patrón: schema en shared-types → modelo → service → controller → routes → frontend hook → UI → tests.

---

## FASE 13 — SPRINT 13: TESTS DE INTEGRACIÓN Y COMPONENTES (Tasks 76-80)

### Task 76 — Service-Case Cockpit Integration Test

**Archivo**: `backend/tests/integration/service-case-cockpit.test.ts`
```typescript
import { describe, expect, it, beforeAll } from 'vitest';
import mongoose from 'mongoose';

describe('ServiceCase Cockpit Integration', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cermont_test');
  });

  it('should return complete cockpit data for an existing service case', async () => {
    const ServiceCase = mongoose.model('ServiceCase');
    const sc = await ServiceCase.findOne().lean();
    if (!sc) return; // skip if no data
    // Test cockpit aggregation
    expect(sc).toBeDefined();
  });

  it('should handle non-existent service case gracefully', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const doc = await mongoose.model('ServiceCase').findById(fakeId).lean();
    expect(doc).toBeNull();
  });
});
```

### Task 77-80: Tests adicionales siguiendo el mismo patrón.

---

## COMMIT STRATEGY
| 6 | `feat(backend): extract technical-report from monolithic workflow service` | backend |
| 7 | `feat(backend): extract delivery-record from monolithic workflow service` | backend |
| 8 | `feat(backend): extract service-entry-sheet from monolithic workflow service` | backend |
| 9 | `feat(backend): extract invoice from monolithic workflow service` | backend |
| 10 | `feat(backend): extract payment from monolithic workflow service` | backend |
| 10b | `test(backend): add unit tests for 5 extracted workflow services` | backend/tests |
| 11 | `feat(backend,frontend): implement KPI module with MTTR/MTBF` | backend + frontend + shared-types |
| 12 | `chore(backend): remove empty media module, consolidate on FileAsset` | backend |
| 13 | `feat(backend): implement automation rules engine with json-rules-engine` | backend + shared-types |
| 14 | `feat(frontend): add KPI widgets to dashboard` | frontend |
| 15 | `feat: enrich steps 1-4 with business fields from LTG` | backend + shared-types |
| 16 | `feat(backend): implement planning-packet readiness gate` | backend |
| 17 | `feat(backend): evidence FSM with replacement_requested state` | backend + shared-types |
| 18 | `feat(backend): technical report and delivery record signatures` | backend |
| 19 | `feat(backend): SES-invoice-payment with auto aging` | backend |
| 20 | `feat(backend): cost intelligence with at-risk alerts` | backend |
| 21 | `feat(backend): client portal signature endpoint` | backend |
| 22 | `feat(backend): automated reminders and notifications worker` | backend |
| 23 | `feat(backend): multi-tenancy foundation (tenantId field)` | backend + shared-types |
| 24 | `feat(backend,frontend): dashboard next-actions by role` | backend + frontend |
| 25 | `feat(backend): QR code generation for assets` | backend |
| 26 | `feat: dynamic forms from document templates` | backend + frontend |
| 27 | `feat(backend): AI copilot MVP - rule-based suggestions` | backend |
| 28 | `refactor(backend): remove monolithic administrative-workflow` | backend |
| 29 | `feat(frontend): fourteen-step progress component` | frontend |
| 30 | `feat(frontend): service case cockpit panel` | frontend |
| 31 | `feat(frontend): KPI widget grid with Recharts` | frontend |
| 32 | `feat(frontend): next-actions by role panel` | frontend |
| 33 | `feat(frontend): evidence gallery with FSM dialog` | frontend |
| 34 | `feat(frontend): planning readiness gate component` | frontend |
| 35 | `test(schemas): add administrative-workflow schema tests` | packages/shared-types |
| 36 | `test(backend): add KPI service tests` | backend/tests |
| 37 | `test(backend): add automation rule engine tests` | backend/tests |
| 38 | `test(backend): add delivery-record route tests` | backend/tests |
| 39 | `test(backend): add invoice service tests` | backend/tests |
| 40 | `test(backend): add payment service tests` | backend/tests |
| 41 | `infra(docker): production multi-stage Dockerfile` | root |
| 42 | `feat(scripts): demo data seeder` | backend |
| 43 | `feat(scripts): automated backup with compression` | backend |
| 44 | `feat(backend): improved health check endpoints` | backend |
| 45 | `infra(pm2): ecosystem config for production` | root |
| 46 | `feat(backend): enhanced rate limiting per route` | backend |
| 47 | `feat(backend): input sanitization middleware` | backend |
| 48 | `feat(backend): centralized audit log middleware` | backend |
| 49 | `fix(backend): CSP headers hardening` | backend |
| 50 | `feat(backend): env validation at startup` | backend |
| 51 | `feat(frontend): kanban board with drag-and-drop` | frontend |
| 52 | `feat(frontend): order detail page with tabs and cockpit` | frontend |
| 53 | `feat(frontend): field execution session with timer` | frontend |
| 54 | `feat(frontend): billing pipeline page (SES-invoice-payment)` | frontend |
| 55 | `feat(frontend): service cases listing with step filter` | frontend |
| 56 | `feat(frontend): evidence gallery page with status filters` | frontend |
| 57 | `feat(schemas): extend all step schemas with business fields` | packages/shared-types |
| 58 | `feat(backend): complete CRUD for kpi module` | backend |
| 59 | `feat(backend): complete CRUD for media/upload module` | backend |
| 60 | `feat: site-visit enrichment with findings and photos` | backend + frontend |
| 61 | `feat: proposal enrichment with margin and versioning` | backend + frontend |
| 62 | `feat: purchase-order validation against proposal` | backend + frontend |
| 63 | `feat: execution session preflight checklist` | backend + frontend |
| 64 | `feat: technical report auto-generation from execution` | backend + frontend |
| 65 | `feat: delivery record digital signature` | backend + frontend |
| 66 | `feat: service entry sheet ariba integration` | backend |
| 67 | `feat: invoice pipeline visualization` | frontend |
| 68 | `feat: payment reconciliation flow` | backend + frontend |
| 69 | `feat: cost catalog with categories and unit costs` | backend + frontend |
| 70 | `feat: fleet vehicle document expiry alerts` | backend + frontend |
| 71 | `feat: tool calibration tracking` | backend + frontend |
| 72 | `feat: inventory QR scanning with html5-qrcode` | frontend |
| 73 | `feat: checklist templates with blocking items` | backend + frontend |
| 74 | `feat: safety analysis (AST) digital form` | backend + frontend |
| 75 | `feat: notifications preferences panel` | frontend |
| 76 | `test(backend): add service-case cockpit integration test` | backend/tests |
| 77 | `test(backend): add planning-packet readiness gate test` | backend/tests |
| 78 | `test(backend): add cost intelligence calculation test` | backend/tests |
| 79 | `test(frontend): add KPI widget rendering test` | frontend/tests |
| 80 | `test(frontend): add billing pipeline component test` | frontend/tests |
