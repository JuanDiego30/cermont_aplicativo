# Module Architecture — Cermont Backend

> Documento canónico: la arquitectura real del backend es **modular por feature**,
> NO MVC plana. Este documento describe la organización, convenciones y reglas
> para trabajar con los módulos.

---

## TL;DR

```txt
backend/src/modules/<feature>/
├── <feature>.routes.ts      → Endpoints + middleware binding
├── <feature>.controller.ts  → Capa HTTP delgada
└── <feature>.service.ts     → Lógica de negocio pura
```

Cada módulo es autónomo. No hay routes/controllers/services globales.
Los módulos NO dependen entre sí directamente — usan servicios compartidos via `common/`.

---

## Estructura General

```txt
backend/src/
├── index.ts                 ← App composer: middleware global + API_MOUNTS (52 routes)
├── server.ts                ← Bootstrap: validateEnv → connectDB → listen
│
├── config/                  ← Configuración global
│   ├── db.ts                ←   Conexión MongoDB (IPv4, family: 4)
│   └── env.ts               ←   Validación de variables de entorno
│
├── common/                  ← Código compartido entre módulos
│   ├── errors/              ←   AppError hierarchy (12 tipos) + errorHandler
│   │   ├── AppError.ts
│   │   ├── error-codes.ts   ←   30+ códigos tipados
│   │   └── error-handler.ts ←   Middleware global de errores
│   ├── middlewares/         ←   request-id, authorize, validateBody
│   ├── utils/               ←   logger, mapping, response helpers
│   └── docs/                ←   OpenAPI generator
│
├── middlewares/             ← Middlewares específicos (rate-limit, upload)
│
├── modules/                 ← **FEATURE MODULES** (40+ módulos)
│   ├── auth/                ←   Autenticación JWT
│   ├── order/               ←   Órdenes de trabajo + workflow
│   ├── proposal/            ←   Propuestas comerciales
│   ├── work-requests/       ←   Solicitudes de servicio
│   ├── user/                ←   Gestión de usuarios
│   ├── evidence/            ←   Evidencias fotográficas
│   ├── cost/                ←   Control de costos
│   ├── invoice/             ←   Facturación
│   ├── ...                  ←   30+ módulos más
│   └── service-cases/       ←   Pipeline de 14 pasos
│
├── services/                ← Servicios compartidos cross-módulo
│
└── models/                  ← Modelos Mongoose compartidos
```

---

## Convención de Módulos

### Estructura estándar de un módulo

```txt
backend/src/modules/<feature>/
├── <feature>.routes.ts         ← [REQUERIDO] Endpoints + middleware binding
├── <feature>.controller.ts     ← [RECOMENDADO] Capa HTTP delgada
├── <feature>.service.ts        ← [RECOMENDADO] Lógica de negocio
└── <feature>.model.ts          ← [OPCIONAL] Schema Mongoose propio
```

Tests van en `backend/tests/services/<feature>.service.test.ts` (NO dentro del módulo).

### Registro en API_MOUNTS

Cada módulo se registra en `backend/src/index.ts` dentro del array `API_MOUNTS`:

```typescript
const API_MOUNTS: ApiMount[] = [
  { prefix: "/api/orders", router: orderRoutes },
  { prefix: "/api/users", router: userRoutes },
  // ... más mounts
];
```

Un mismo prefijo puede tener múltiples routers:
```typescript
{ prefix: "/api/orders", router: orderRoutes },
{ prefix: "/api/orders", router: orderClosureRoutes },      // /api/orders/:id/close
{ prefix: "/api/orders", router: orderAdministrativeWorkflowRoutes }, // /api/orders/:id/approve
```

---

## Reglas por Capa

### Routes (`*.routes.ts`) — Solo wiring

```typescript
// ✅ CORRECTO
router.post('/',
  authenticate,
  authorize('gerente', 'residente'),
  validateBody(createOrderSchema),
  orderController.create
);

// ❌ INCORRECTO — lógica de negocio en routes
router.post('/', async (req, res) => {
  const result = await OrderModel.create(req.body);
  res.json({ success: true, data: result });
});
```

**Responsabilidades:**
- Definir method + path
- Encadenar middlewares: authenticate → authorize → validateBody/Query/Params
- Delegar a controller
- NO lógica de negocio
- NO llamadas a Mongoose

### Controllers (`*.controller.ts`) — Capa HTTP delgada

```typescript
// ✅ CORRECTO
async function create(req: Request, res: Response) {
  const result = await orderService.create(req.body, req.user.id);
  res.status(201).json({ success: true, data: result });
}

// ❌ INCORRECTO — lógica de negocio en controller
async function create(req: Request, res: Response) {
  const total = req.body.items.reduce((sum, item) => sum + item.price, 0);
}
```

**Responsabilidades:**
- Extraer datos de req (body, params, query, user)
- Llamar al service
- Responder con res.json() usando helpers sendSuccess/sendError
- NO lógica de negocio
- NO try/catch (Express 5 propaga errores nativos)
- NO llamar Mongoose directamente

### Services (`*.service.ts`) — Toda la lógica de negocio

```typescript
// ✅ CORRECTO
async function create(data: CreateOrderDto, userId: string): Promise<Order> {
  const order = await OrderModel.create({ ...data, createdBy: userId });
  await auditService.log('ORDER_CREATED', userId, order._id);
  return order;
}

// ❌ INCORRECTO — aceptar req/res
async function create(req: Request, res: Response) { ... }
```

**Responsabilidades:**
- Toda la lógica de negocio
- Validaciones de dominio
- Interacción con Mongoose
- Llamadas a otros servicios
- Lanzar AppError para errores esperados
- NO aceptar req, res, next
- NO importar cosas HTTP

---

## Módulos Actuales (52 mounts)

A continuación los módulos registrados en `API_MOUNTS`:

| # | Prefix | Router Source | Módulo |
|---|--------|--------------|--------|
| 1 | `/api/auth` | `authRoutes` | Autenticación |
| 2 | `/api/orders` | `orderRoutes` | Órdenes |
| 3 | `/api/orders` | `orderExecutionSessionRoutes` | Sesiones de ejecución |
| 4 | `/api/orders` | `orderClosureRoutes` | Cierre de órdenes |
| 5 | `/api/orders` | `orderAdministrativeWorkflowRoutes` | Workflow administrativo |
| 6 | `/api/users` | `userRoutes` | Usuarios |
| 7 | `/api/evidences` | `evidenceRoutes` | Evidencias |
| 8 | `/api/evidence-collections` | `evidenceCollectionRoutes` | Colecciones de evidencia |
| 9 | `/api/execution-sessions` | `executionSessionRoutes` | Sesiones de ejecución |
| 10 | `/api/execution-sessions` | `executionTechnicalReportRoutes` | Reportes técnicos |
| 11 | `/api/files` | `filesRoutes` | Archivos |
| 12 | `/api/fleet` | `fleetRoutes` | Flota |
| 13 | `/api/form-submissions` | `formSubmissionRoutes` | Envíos de formularios |
| 14 | `/api/checklists` | `checklistRoutes` | Checklists |
| 15 | `/api/clients` | `clientRoutes` | Clientes |
| 16 | `/api/signatures` | `clientSignatureRoutes` | Firmas |
| 17 | `/api/costs` | `costRoutes` | Costos |
| 18 | `/api/custom-fields` | `customFieldRoutes` | Campos personalizados |
| 19 | `/api/kits` | `kitRoutes` | Kits de herramientas |
| 20 | `/api/maintenance` | `maintenanceRoutes` | Mantenimiento |
| 21 | `/api/documents` | `documentRoutes` | Documentos |
| 22 | `/api/documents` | `documentImportRoutes` | Importación docs |
| 23 | `/api/documents` | `documentIngestionRoutes` | Ingestión docs |
| 24 | `/api/document-templates` | `documentTemplateRoutes` | Plantillas docs |
| 25 | `/api/template-drafts` | `templateDraftRoutes` | Borradores |
| 26 | `/api/template-responses` | `templateResponseRoutes` | Respuestas |
| 27 | `/api/proposals` | `proposalRoutes` | Propuestas |
| 28 | `/api/purchase-orders` | `purchaseOrderRoutes` | Órdenes de compra |
| 29 | `/api/resources` | `resourceRoutes` | Recursos |
| 30 | `/api/reports` | `reportRoutes` | Reportes |
| 31 | `/api/technical-reports` | `technicalReportRoutes` | Reportes técnicos |
| 32 | `/api/tools` | `toolRoutes` | Herramientas |
| 33 | `/api/delivery-records` | `deliveryRecordRoutes` | Actas de entrega |
| 34 | `/api/delivery-records` | `deliveryRecordServiceEntrySheetRoutes` | SES desde acta |
| 35 | `/api/service-entry-sheets` | `serviceEntrySheetRoutes` | SES |
| 36 | `/api/service-entry-sheets` | `serviceEntrySheetInvoiceRoutes` | Factura desde SES |
| 37 | `/api/invoices` | `invoiceRoutes` | Facturas |
| 38 | `/api/invoices` | `invoicePaymentRoutes` | Pago desde factura |
| 39 | `/api/payments` | `paymentRoutes` | Pagos |
| 40 | `/api/audit` | `auditRoutes` | Auditoría |
| 41 | `/api/analytics` | `analyticsRoutes` | Analítica |
| 42 | `/api/inspections` | `inspectionRoutes` | Inspecciones |
| 43 | `/api/inventory` | `inventoryRoutes` | Inventario |
| 44 | `/api/sync` | `syncRoutes` | Sincronización offline |
| 45 | `/api/ai` | `aiRoutes` | IA |
| 46 | `/api/work-requests` | `workRequestRoutes` | Solicitudes |
| 47 | `/api/asts` | `safetyAnalysisRoutes` | AST/Safety |
| 48 | `/api/assets` | `assetRoutes` | Activos |
| 49 | `/api/planning-packets` | `planningPacketRoutes` | Paquetes planeación |
| 50 | `/api/site-visits` | `siteVisitRoutes` | Visitas a sitio |
| 51 | `/api/observability` | `observabilityRoutes` | Observabilidad |
| 52 | `/api/notifications` | `notificationsRoutes` | Notificaciones |
| 53 | `/api/service-cases` | `serviceCaseRoutes` | Casos de servicio |
| 54 | `/api/dashboard` | `dashboardRoutes` | Dashboard |
| 55 | `/api/metrics` | `metricsRoutes` | Métricas |
| 56 | `/api/portal` | `portalRoutes` | Portal cliente |
| 57 | `/api/dian` | `dianRoutes` | DIAN |
| 58 | `/api/sla` | `slaRoutes` | SLA |
| 59 | `/api/dispatch` | `dispatchRoutes` | Despacho |
| 60 | `/api/system-config` | `systemConfigRoutes` | Config sistema |
| 61 | `/api/admin/backups` | `adminBackupRoutes` | Backups admin |

> Nota: 52 entries because some entries share prefix (e.g., /api/orders has 4 routers).

---

## Cómo Crear un Módulo Nuevo

### Paso 1: Crear la estructura

```bash
mkdir -p backend/src/modules/<feature>
touch backend/src/modules/<feature>/<feature>.routes.ts
touch backend/src/modules/<feature>/<feature>.controller.ts
touch backend/src/modules/<feature>/<feature>.service.ts
```

### Paso 2: Implementar service

```typescript
// modules/<feature>/<feature>.service.ts
import { FeatureModel } from "./<feature>.model";
import { NotFoundError } from "../../common/errors";

export async function findById(id: string) {
  const doc = await FeatureModel.findById(id);
  if (!doc) throw new NotFoundError("Feature not found");
  return doc;
}
```

### Paso 3: Implementar controller

```typescript
// modules/<feature>/<feature>.controller.ts
import { featureService } from "./<feature>.service";
import { sendSuccess } from "../../common/utils/response";

export async function getById(req: Request, res: Response) {
  const doc = await featureService.findById(req.params.id);
  sendSuccess(res, doc);
}
```

### Paso 4: Implementar routes

```typescript
// modules/<feature>/<feature>.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "../../common/middlewares";
import * as controller from "./<feature>.controller";

const router = Router();
router.get("/:id", authenticate, authorize("gerente"), controller.getById);
export default router;
```

### Paso 5: Registrar en API_MOUNTS

```typescript
// backend/src/index.ts
import featureRoutes from "./modules/<feature>/<feature>.routes";

const API_MOUNTS: ApiMount[] = [
  { prefix: "/api/<features>", router: featureRoutes },
];
```

---

## Servicios Compartidos vs Módulos

| Tipo | Ubicación | Uso |
|------|-----------|-----|
| **Módulo feature** | `backend/src/modules/<feature>/<feature>.service.ts` | Lógica específica del dominio |
| **Servicio compartido** | `backend/src/services/*.service.ts` | Lógica usada por múltiples módulos |
| **Common** | `backend/src/common/*` | Error hierarchy, middlewares, utils |

**Regla:** Si un servicio es usado por 2+ módulos, va en `backend/src/services/`.
Si es específico de un módulo, va dentro del módulo.

---

## Migración desde MVC Plano

El backend migró de una estructura MVC plana (`routes/`, `controllers/`, `services/`, `models/`) a módulos por feature. Durante la transición:

- `backend/src/services/` contiene servicios legacy que aún no se han movido a módulos
- `backend/src/models/` contiene modelos Mongoose legacy
- Los módulos nuevos DEBEN crearse dentro de `backend/src/modules/`
- Los servicios legacy DEBEN migrarse gradualmente a módulos

**No crear** archivos nuevos en `backend/src/services/` o `backend/src/models/`.
Crear siempre dentro del módulo correspondiente en `backend/src/modules/`.
