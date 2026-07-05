# DOC-CANON-03 — Backend, API REST, Seguridad y Modelo de Datos

**Proyecto:** Cermont S.A.S. — Plataforma documental-operativa
**Version:** v2.1 canónica ampliada para ejecución IA/Codex
**Estado:** SOURCE_OF_TRUTH + ANEXO v2.1 operativo
**Compresion:** DOC-03 + DOC-04 + DOC-09 + DOC-10 + DOC-14

---

## 1. Backend — Express 5 + Mongoose + MongoDB

### 1.1 Punto de Entrada (`backend/src/index.ts`)

```typescript
import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import { connectDatabase } from "./config/database"
import { env } from "./config/env"
import { errorMiddleware } from "./middleware/error.middleware"
import routes from "./routes"

const app = express()

// Middlewares globales
app.use(helmet())
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: "25mb" }))
app.use(cookieParser())

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok", service: "backend", database: "connected", timestamp: new Date().toISOString() } })
})

// Rutas
app.use("/api", routes)

// Error handler global (siempre al final)
app.use(errorMiddleware)

// Conectar DB y iniciar servidor
connectDatabase().then(() => {
  app.listen(env.PORT, () => {
    console.log(`Backend Cermont corriendo en puerto ${env.PORT}`)
  })
})
```

### 1.2 Configuracion de MongoDB (`backend/src/config/database.ts`)

```typescript
import mongoose from "mongoose"
import { env } from "./env"

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI)
    console.log("MongoDB conectado")
  } catch (error) {
    console.error("Error conectando MongoDB:", error)
    process.exit(1)  // Fail fast
  }
}
```

### 1.3 Validacion de Variables de Entorno (`backend/src/config/env.ts`)

```typescript
import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("4000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI es requerida"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET debe tener al menos 32 caracteres"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
})

export const env = envSchema.parse(process.env)
// Si falta una variable obligatoria, el proceso falla inmediatamente
```

### 1.4 Patron en Rutas y Controladores

Express 5 maneja errores async nativamente. **No usar `express-async-handler`.**

**Correcto:**
```typescript
// routes/workRequest.routes.ts
import { Router } from "express"
import { WorkRequestController } from "../controllers/workRequest.controller"
import { authenticate, requireRole } from "../middleware/auth.middleware"
import { validateBody } from "../middleware/validate.middleware"
import { CreateWorkRequestSchema } from "@cermont/shared-types"

const router = Router()
const controller = new WorkRequestController()

router.get("/", authenticate, controller.list)
router.post("/", authenticate, validateBody(CreateWorkRequestSchema), controller.create)
router.get("/:id", authenticate, controller.getById)
router.patch("/:id/qualify", authenticate, requireRole(["gerente", "supervisor"]), controller.qualify)

export default router
```

**Correcto (sin try/catch innecesario):**
```typescript
// controllers/workRequest.controller.ts
export class WorkRequestController {
  async create(req: Request, res: Response) {
    // Si el servicio lanza error, Express 5 lo captura y envia al error middleware
    const result = await this.service.create(req.body, req.user)
    res.status(201).json(successEnvelope(result, "Work request created"))
  }

  async list(req: Request, res: Response) {
    const result = await this.service.list(req.query, req.user)
    res.json(successEnvelope(result))
  }
}
```

**Incorrecto (try/catch que solo relanza):**
```typescript
// NO HACER ESTO
async create(req, res, next) {
  try {
    const result = await this.service.create(req.body)
    res.json(result)
  } catch (error) {
    next(error)  // Redundante en Express 5
  }
}
```

### 1.5 Patron de Servicios

```typescript
// services/workRequest.service.ts
export class WorkRequestService {
  async create(data: CreateWorkRequestInput, user: AuthenticatedUser): Promise<WorkRequest> {
    // 1. Validar precondiciones de dominio
    // 2. Ejecutar logica de negocio
    // 3. Persistir
    // 4. Emitir evento/auditoria
    // 5. Retornar resultado

    const workRequest = new WorkRequestModel({
      ...data,
      status: "draft",
      createdBy: user.id,
      createdAt: new Date(),
    })

    await workRequest.save()

    // Auditoria
    await this.auditService.log({
      action: "work_request_created",
      actorId: user.id,
      entityType: "WorkRequest",
      entityId: workRequest.id,
    })

    return workRequest
  }
}
```

---

## 2. Seguridad — Autenticacion y Autorizacion

### 2.1 Estrategia: JWT + Cookies httpOnly

```text
+--------+                    +--------+
|Cliente | -- login --------> |Backend |
|        | <-- cookie JWT ----|        |
|        |                    |        |
|        | -- request -------->|        |
|        |   (cookie JWT)     |        |
|        | <-- data ----------|        |
|        |                    |        |
|        | -- refresh ------->|        |
|        |   (refresh token)  |        |
|        | <-- new cookie ----|        |
+--------+                    +--------+
```

**Flujo:**
1. Usuario hace login con email/password
2. Backend valida credenciales (bcrypt)
3. Backend genera JWT access token (corto: 15 min) y refresh token (largo: 7 dias)
4. Access token se envia en cookie httpOnly
5. Refresh token se almacena en BD y se envia en cookie httpOnly separada
6. Frontend mantiene estado de sesion en Zustand
7. Token se renueva automaticamente via refresh endpoint
8. Logout invalida tokens y limpia cookies

### 2.2 Modelo de Usuario

```typescript
// models/User.ts
import { Schema, model } from "mongoose"

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },  // No se incluye por defecto
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ["gerente", "administrativo", "supervisor", "tecnico", "cliente", "auditor", "hes"],
    required: true,
  },
  status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Index para busquedas frecuentes
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1, status: 1 })

export const UserModel = model("User", UserSchema)
```

### 2.3 Endpoints de Autenticacion

| Metodo | Endpoint | Proposito | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login con email/password | Publico |
| `POST` | `/api/auth/refresh` | Renovar access token | Cookie refresh |
| `POST` | `/api/auth/logout` | Cerrar sesion | Cookie access |
| `GET` | `/api/auth/me` | Obtener usuario actual | JWT access |

### 2.4 Middleware de Autenticacion (`auth.middleware.ts`)

```typescript
import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt"

// Extiende Request para incluir usuario
interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string; name: string }
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken

  if (!token) {
    throw new DomainError("AUTH_REQUIRED", "Authentication required", 401)
  }

  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch {
    throw new DomainError("AUTH_SESSION_EXPIRED", "Session expired", 401)
  }
}
```

### 2.5 Middleware de RBAC

```typescript
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new DomainError("AUTH_REQUIRED", "Authentication required", 401)
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new DomainError("RBAC_FORBIDDEN", "Insufficient permissions", 403)
    }

    next()
  }
}

// Uso en rutas:
router.post("/:id/approve", authenticate, requireRole(["gerente"]), controller.approve)
```

### 2.6 Zustand Store de Autenticacion (Frontend)

```typescript
// stores/authStore.ts
import { create } from "zustand"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    await apiClient.post("/auth/login", { email, password })
    // Cookies se manejan automaticamente por el navegador
    const { data } = await apiClient.get("/auth/me")
    set({ user: data, isAuthenticated: true })
  },

  logout: async () => {
    await apiClient.post("/auth/logout")
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      const { data } = await apiClient.get("/auth/me")
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
```

### 2.7 Proteccion de Rutas Frontend

```typescript
// app/layout.tsx o middleware
export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, isLoading, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
    if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/dashboard")  // Redirect si no tiene permiso
    }
  }, [isLoading, isAuthenticated, user])

  if (isLoading) return <LoadingState />
  if (!isAuthenticated) return null

  return children
}
```

---

## 3. Manejo de Errores y Logging

### 3.1 Principios

1. **No silent failures** — Prohibido `catch {}`
2. **No silent fallback** — Prohibido `.catch(() => [])`
3. **No production debug code** — Prohibido `console.log`, `debugger`, `alert`
4. **Errores tipados** — Todo error de dominio usa codigo estable

### 3.2 Middleware Global de Errores

```typescript
// middleware/error.middleware.ts
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const traceId = req.headers["x-request-id"] || crypto.randomUUID()

  // 1. Errores de dominio conocidos
  if (error instanceof DomainError) {
    logger.warn({ traceId, code: error.code, path: req.path, userId: req.user?.id })
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        traceId,
      },
    })
  }

  // 2. Errores de validacion Zod
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }))
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_FAILED", message: "Validation failed", details, traceId },
    })
  }

  // 3. Errores de Mongoose
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "Invalid identifier format", traceId },
    })
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: { code: "MONGOOSE_VALIDATION", message: error.message, traceId },
    })
  }

  // 4. Error interno (no revelar detalles en produccion)
  logger.error({ traceId, error: error.message, stack: error.stack })
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "Internal error" : error.message,
      traceId,
    },
  })
}
```

### 3.3 Categorias de Errores

| Categoria | HTTP | Codigo Ejemplo | Descripcion |
|---|---|---|---|
| Validacion | 400 | `VALIDATION_FAILED` | Payload invalido segun Zod |
| Autenticacion | 401 | `AUTH_REQUIRED` | No hay sesion valida |
| Credenciales | 401 | `AUTH_INVALID_CREDENTIALS` | Email o password invalidos |
| Sesion expirada | 401 | `AUTH_SESSION_EXPIRED` | Refresh token invalido |
| Autorizacion | 403 | `RBAC_FORBIDDEN` | Rol sin permiso |
| No encontrado | 404 | `RESOURCE_NOT_FOUND` | Entidad inexistente |
| Conflicto | 409 | `DOMAIN_CONFLICT` | Estado impide transicion |
| Archivo invalido | 415 | `UNSUPPORTED_MEDIA_TYPE` | MIME no permitido |
| Payload grande | 413 | `PAYLOAD_TOO_LARGE` | Archivo excede limite |
| Rate limit | 429 | `RATE_LIMIT_EXCEEDED` | Demasiadas solicitudes |
| Error interno | 500 | `INTERNAL_SERVER_ERROR` | Fallo inesperado |

### 3.4 Errores de Dominio por Flujo

```typescript
// WorkRequest
"WORK_REQUEST_NOT_FOUND"
"WORK_REQUEST_ALREADY_CANCELLED"
"WORK_REQUEST_REQUIRES_CLIENT"

// Proposal
"PROPOSAL_NOT_FOUND"
"PROPOSAL_REQUIRES_BASELINE_COST"
"PROPOSAL_REQUIRES_APPROVAL"
"PROPOSAL_ALREADY_CONVERTED"

// Planning
"PLANNING_PACKET_NOT_FOUND"
"PLANNING_PACKET_NOT_READY"
"PLANNING_PACKET_REQUIRES_CREW"
"PLANNING_PACKET_REQUIRES_TOOLS"
"PLANNING_PACKET_REQUIRES_AST"
"PLANNING_PACKET_REQUIRES_PTW"

// Execution
"EXECUTION_SESSION_NOT_FOUND"
"EXECUTION_REQUIRES_APPROVED_PLANNING"
"EXECUTION_ALREADY_STARTED"
"EXECUTION_NOT_STARTED"
"EXECUTION_ALREADY_FINISHED"

// Documents
"DOCUMENT_IMPORT_NOT_FOUND"
"DOCUMENT_IMPORT_UNSUPPORTED_FILE_TYPE"
"DOCUMENT_TEMPLATE_VERSION_IMMUTABLE"

// Costs
"COST_CART_NOT_FOUND"
"COST_LINE_INVALID_QUANTITY"
"COST_BASELINE_MISSING"

// Administrative Closure
"SES_REQUIRES_SIGNED_DELIVERY_RECORD"
"INVOICE_REQUIRES_APPROVED_SES"
"PAYMENT_REQUIRES_APPROVED_INVOICE"
```

### 3.5 Logging Estructurado

**Campos minimos de cada log:**

| Campo | Descripcion |
|---|---|
| `timestamp` | Fecha/hora ISO |
| `level` | debug / info / warn / error |
| `traceId` | Identificador de request |
| `userId` | Usuario autenticado |
| `role` | Rol del usuario |
| `method` | Metodo HTTP |
| `path` | Ruta |
| `statusCode` | Codigo HTTP |
| `durationMs` | Duracion del request |
| `domain` | Modulo de negocio |
| `entityType` | Tipo de entidad |
| `entityId` | ID de entidad |
| `action` | Accion ejecutada |
| `errorCode` | Codigo de error si aplica |

**Niveles:**
- `debug`: Solo desarrollo local, nunca datos sensibles
- `info`: Operacion normal importante
- `warn`: Error recuperable, conflicto o condicion anomala
- `error`: Fallo no recuperable

**Prohibido loguear:**
- Contrasenas, tokens JWT, refresh tokens
- Cookies completas, firmas en base64
- Documentos privados completos, archivos subidos
- Secretos de `.env`, headers de autorizacion

### 3.6 Auditoria de Negocio (AuditEvent)

Cada accion critica genera un `AuditEvent`:

```typescript
interface AuditEvent {
  id: string
  traceId: string
  actorId: string
  actorRole: string
  action: string           // ej: "proposal_approved"
  entityType: string       // ej: "Proposal"
  entityId: string
  previousState?: string
  nextState?: string
  metadata?: Record<string, string | number | boolean>
  createdAt: string
}
```

**Acciones que requieren auditoria:**

| Accion | Audit Requerido |
|---|---|
| Login exitoso | Si |
| Login fallido | Si (sin password) |
| Crear WorkRequest | Si |
| Calificar solicitud | Si |
| Aprobar propuesta | Si |
| Registrar PO | Si |
| Aprobar planeacion | Si |
| Iniciar ejecucion | Si |
| Finalizar ejecucion | Si |
| Subir evidencia | Si |
| Generar informe | Si |
| Firmar acta | Si |
| Aprobar SES | Si |
| Enviar factura | Si |
| Registrar pago | Si |
| Publicar plantilla | Si |
| Cambiar rol de usuario | Si |

---

## 4. Modelo de Datos Completo (Esquemas Mongoose)

### 4.1 WorkRequest — Solicitud de Trabajo

```typescript
const WorkRequestSchema = new Schema({
  // Identificacion
  requestNumber: { type: String, required: true, unique: true },  // WR-2026-0001

  // Cliente y sitio
  clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
  siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },

  // Solicitante y contacto
  requestedBy: { type: String, required: true },  // Nombre de quien solicita
  requesterEmail: { type: String },
  requesterPhone: { type: String },

  // Detalle del servicio
  serviceType: { type: String, required: true },  // electricidad, cctv, mantenimiento, etc.
  description: { type: String, required: true },
  urgency: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },

  // Estado (FSM)
  status: {
    type: String,
    enum: ["draft", "submitted", "qualified", "visit_scheduled", "visit_completed", "converted_to_proposal", "cancelled"],
    default: "draft",
  },

  // Visita tecnica
  requiresVisit: { type: Boolean, default: false },
  visitDate: { type: Date },
  visitNotes: { type: String },

  // Relaciones
  proposalId: { type: Schema.Types.ObjectId, ref: "Proposal" },

  // Metadatos
  attachments: [{ type: Schema.Types.ObjectId, ref: "DocumentFile" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

WorkRequestSchema.index({ status: 1, createdAt: -1 })
WorkRequestSchema.index({ clientId: 1 })
WorkRequestSchema.index({ siteId: 1 })
```

### 4.2 Proposal — Propuesta Economica

```typescript
const ProposalSchema = new Schema({
  proposalNumber: { type: String, required: true, unique: true },

  // Relaciones
  workRequestId: { type: Schema.Types.ObjectId, ref: "WorkRequest", required: true },
  clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
  siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },

  // Contenido
  scope: { type: String, required: true },
  description: { type: String },
  currency: { type: String, enum: ["COP", "USD"], default: "COP" },

  // Costos
  estimatedTotal: { type: Number, required: true },
  costBaseline: [{  // Desglose de costos estimados
    category: { type: String, enum: ["material", "labor", "tool", "equipment", "transport", "subcontract", "administrative", "contingency"] },
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  }],

  // Condiciones
  terms: { type: String },
  validityDays: { type: Number, default: 30 },

  // Estado
  status: {
    type: String,
    enum: ["draft", "submitted", "approved", "rejected", "expired", "converted_to_order"],
    default: "draft",
  },

  // PO
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: "PurchaseOrder" },

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})
```

### 4.3 WorkOrder — Orden de Trabajo

```typescript
const WorkOrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },

  // Relaciones
  proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
  workRequestId: { type: Schema.Types.ObjectId, ref: "WorkRequest", required: true },
  clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
  siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: "PurchaseOrder" },

  // Contenido
  scope: { type: String, required: true },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },

  // Estado operativo
  status: {
    type: String,
    enum: ["created", "planning", "planning_approved", "in_progress", "completed", "cancelled"],
    default: "created",
  },

  // Fechas
  plannedStartDate: { type: Date },
  plannedEndDate: { type: Date },
  actualStartDate: { type: Date },
  actualEndDate: { type: Date },

  // Responsables
  assignedSupervisor: { type: Schema.Types.ObjectId, ref: "User" },
  assignedTechnicians: [{ type: Schema.Types.ObjectId, ref: "User" }],

  // Relaciones de cierre
  planningPacketId: { type: Schema.Types.ObjectId, ref: "PlanningPacket" },
  executionSessionId: { type: Schema.Types.ObjectId, ref: "ExecutionSession" },
  technicalReportId: { type: Schema.Types.ObjectId, ref: "TechnicalReport" },
  deliveryRecordId: { type: Schema.Types.ObjectId, ref: "DeliveryRecord" },
  serviceEntrySheetId: { type: Schema.Types.ObjectId, ref: "ServiceEntrySheet" },
  invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})
```

### 4.4 PlanningPacket — Paquete de Planeacion

```typescript
const PlanningPacketSchema = new Schema({
  workOrderId: { type: Schema.Types.ObjectId, ref: "WorkOrder", required: true },

  // Equipo de trabajo
  crew: [{
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    role: { type: String },  // supervisor, tecnico, electricista, etc.
  }],

  // Recursos
  materials: [{ description: String, quantity: Number, unit: String, provided: Boolean }],
  tools: [{ toolId: { type: Schema.Types.ObjectId, ref: "Asset" }, name: String, required: Boolean }],
  equipment: [{ equipmentId: { type: Schema.Types.ObjectId, ref: "Asset" }, name: String, required: Boolean }],
  safetyElements: [{ element: String, quantity: Number, required: Boolean }],

  // HSE
  astDocumentId: { type: Schema.Types.ObjectId, ref: "DocumentFile" },  // Analisis de Seguridad en el Trabajo
  ptwDocumentId: { type: Schema.Types.ObjectId, ref: "DocumentFile" },  // Permiso de Trabajo
  riskAssessment: { type: String },

  // Readiness
  readinessStatus: {
    type: String,
    enum: ["pending", "incomplete", "ready", "approved"],
    default: "pending",
  },
  blockers: [{ type: String }],  // Lista de blockers calculados

  // Estado
  status: { type: String, enum: ["draft", "submitted", "approved", "reopened"], default: "draft" },

  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})
```

### 4.5 ExecutionSession — Sesion de Ejecucion

```typescript
const ExecutionSessionSchema = new Schema({
  workOrderId: { type: Schema.Types.ObjectId, ref: "WorkOrder", required: true },

  // Tecnico responsable
  leadTechnicianId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  crew: [{ userId: { type: Schema.Types.ObjectId, ref: "User" }, role: String }],

  // Tiempos
  startedAt: { type: Date },
  finishedAt: { type: Date },

  // Ubicacion
  gpsStart: { latitude: Number, longitude: Number, accuracy: Number },
  gpsEnd: { latitude: Number, longitude: Number, accuracy: Number },

  // Actividades
  activities: [{ description: String, startedAt: Date, finishedAt: Date }],
  checklists: [{ item: String, completed: Boolean, notes: String }],

  // Materiales usados
  materialsUsed: [{ description: String, quantity: Number, unit: String }],

  // Novedades e incidentes
  notes: { type: String },
  incidents: [{ description: String, severity: String, reportedAt: Date }],

  // Estado
  status: { type: String, enum: ["not_started", "in_progress", "paused", "finished"], default: "not_started" },

  // Relaciones
  evidences: [{ type: Schema.Types.ObjectId, ref: "Evidence" }],

  // Offline sync
  offlineSyncState: { type: String, enum: ["pending", "synced", "failed", "conflict"], default: "synced" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})
```

### 4.6 Evidence — Evidencia

```typescript
const EvidenceSchema = new Schema({
  workOrderId: { type: Schema.Types.ObjectId, ref: "WorkOrder", required: true },
  executionSessionId: { type: Schema.Types.ObjectId, ref: "ExecutionSession" },

  // Archivo
  documentFileId: { type: Schema.Types.ObjectId, ref: "DocumentFile", required: true },

  // Tipo y metadata
  evidenceType: { type: String, enum: ["before", "during", "after", "issue", "support", "signature", "gps"], required: true },
  caption: { type: String },
  capturedAt: { type: Date, default: Date.now },
  capturedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

  // GPS
  gps: { latitude: Number, longitude: Number, accuracy: Number },

  // Offline
  offlineSyncState: { type: String, enum: ["pending", "syncing", "synced", "failed", "conflict"], default: "synced" },
  clientMutationId: { type: String },  // Idempotencia offline

  // Visibilidad
  isClientVisible: { type: Boolean, default: true },
  status: { type: String, enum: ["draft", "submitted", "approved", "rejected", "archived"], default: "draft" },

  createdAt: { type: Date, default: Date.now },
})

EvidenceSchema.index({ workOrderId: 1, evidenceType: 1 })
EvidenceSchema.index({ executionSessionId: 1 })
```

### 4.7 TechnicalReport — Informe Tecnico

```typescript
const TechnicalReportSchema = new Schema({
  workOrderId: { type: Schema.Types.ObjectId, ref: "WorkOrder", required: true },
  executionSessionId: { type: Schema.Types.ObjectId, ref: "ExecutionSession", required: true },

  // Contenido generado
  scopeExecuted: { type: String, required: true },
  observations: { type: String },
  findings: [{ description: String, severity: String, recommendation: String }],

  // Evidencias incluidas
  includedEvidences: [{ type: Schema.Types.ObjectId, ref: "Evidence" }],

  // Materiales utilizados
  materialsSummary: [{ description: String, quantity: Number, unit: String }],

  // Estado
  status: { type: String, enum: ["draft", "generated", "submitted", "approved", "rejected"], default: "draft" },

  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },

  // Documento generado
  generatedDocumentId: { type: Schema.Types.ObjectId, ref: "GeneratedDocument" },

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})
```

### 4.8 DeliveryRecord — Acta de Entrega

```typescript
const DeliveryRecordSchema = new Schema({
  workOrderId: { type: Schema.Types.ObjectId, ref: "WorkOrder", required: true },
  technicalReportId: { type: Schema.Types.ObjectId, ref: "TechnicalReport", required: true },

  // Contenido
  summary: { type: String, required: true },
  deliveredDocuments: [{ type: String }],
  observations: { type: String },

  // Firmas
  clientSignature: {
    signedBy: { type: String },  // Nombre de quien firma
    signedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    signedAt: { type: Date },
    signatureFileId: { type: Schema.Types.ObjectId, ref: "DocumentFile" },
    ipAddress: { type: String },
    accepted: { type: Boolean },  // true = aceptado, false = rechazado
    rejectionReason: { type: String },
  },

  cermontSignature: {
    signedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    signedAt: { type: Date },
    signatureFileId: { type: Schema.Types.ObjectId, ref: "DocumentFile" },
  },

  // Estado
  status: { type: String, enum: ["draft", "sent", "signed", "rejected"], default: "draft" },

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
})
```

### 4.9 ServiceEntrySheet — SES / Ariba

```typescript
const ServiceEntrySheetSchema = new Schema({
  workOrderId: { type: Schema.Types.ObjectId, ref: "WorkOrder", required: true },
  deliveryRecordId: { type: Schema.Types.ObjectId, ref: "DeliveryRecord", required: true },

  // Datos SES
  sesNumber: { type: String, required: true },
  platform: { type: String, enum: ["ariba", "manual", "other"], default: "ariba" },

  // Estado
  status: { type: String, enum: ["draft", "submitted", "approved", "rejected"], default: "draft" },

  // Fechas
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },

  // Documentos soporte
  supportingDocuments: [{ type: Schema.Types.ObjectId, ref: "DocumentFile" }],

  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  submittedBy: { type: Schema.Types.ObjectId, ref: "User" },

  createdAt: { type: Date, default: Date.now },
})
```

### 4.10 Invoice — Factura

```typescript
const InvoiceSchema = new Schema({
  workOrderId: { type: Schema.Types.ObjectId, ref: "WorkOrder", required: true },
  serviceEntrySheetId: { type: Schema.Types.ObjectId, ref: "ServiceEntrySheet", required: true },

  // Datos de factura
  invoiceNumber: { type: String, required: true, unique: true },
  billingAccount: { type: String, required: true },

  // Montos
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },

  // Fechas
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },

  // Estado
  status: { type: String, enum: ["draft", "submitted", "approved", "rejected", "paid"], default: "draft" },

  rejectionReason: { type: String },
  supportingDocuments: [{ type: Schema.Types.ObjectId, ref: "DocumentFile" }],

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
})
```

### 4.11 Payment — Pago

```typescript
const PaymentSchema = new Schema({
  invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
  workOrderId: { type: Schema.Types.ObjectId, ref: "WorkOrder", required: true },

  // Datos del pago
  amountPaid: { type: Number, required: true },
  paymentReference: { type: String, required: true },  // Numero de referencia bancaria
  paymentDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ["bank_transfer", "check", "cash", "other"], required: true },

  // Estado
  status: { type: String, enum: ["registered", "reconciled", "disputed", "cancelled"], default: "registered" },

  // Conciliacion
  reconciliationDate: { type: Date },
  reconciliationNotes: { type: String },

  // Archivo soporte
  supportingDocumentId: { type: Schema.Types.ObjectId, ref: "DocumentFile" },

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
})
```

### 4.12 DocumentTemplate — Plantilla de Documento

```typescript
const DocumentTemplateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  businessUnit: { type: String, required: true },  // electricidad, cctv, mantenimiento, etc.
  workflowStep: { type: String, required: true },  // planning, execution, report, etc.

  // Versionado
  currentVersion: { type: String, default: "1.0.0" },
  versions: [{
    version: { type: String, required: true },
    fields: [{  // Campos del formulario dinamico
      id: String,
      type: { type: String, enum: ["text", "textarea", "number", "date", "select", "multiSelect", "checkbox", "checklist", "table", "photo", "signature", "gps", "costLine", "materialList", "toolList", "equipmentList", "safetyElementList", "workerCount"] },
      label: { type: String, required: true },
      required: { type: Boolean, default: false },
      options: [String],  // Para select/multiSelect
      validation: {
        min: Number,
        max: Number,
        pattern: String,
      },
      section: { type: String },  // Grupo/Seccion
      order: { type: Number },
    }],
    publishedAt: { type: Date },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isPublished: { type: Boolean, default: false },
  }],

  // Origen
  sourceImportId: { type: Schema.Types.ObjectId, ref: "DocumentImport" },

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})
```

### 4.13 DocumentFile — Archivo

```typescript
const DocumentFileSchema = new Schema({
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },  // Nombre interno seguro (UUID)
  mimeType: { type: String, required: true },
  extension: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  sha256: { type: String, required: true },  // Hash de integridad

  storageProvider: { type: String, enum: ["local", "vps", "s3-compatible"], default: "local" },
  storagePath: { type: String, required: true },

  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  uploadedAt: { type: Date, default: Date.now },

  // Negocio
  businessEntityType: { type: String },  // workOrder, evidence, certificate, etc.
  businessEntityId: { type: Schema.Types.ObjectId },

  // Seguridad
  visibility: { type: String, enum: ["private", "internal", "client_visible"], default: "internal" },
  status: { type: String, enum: ["uploaded", "validated", "rejected", "archived"], default: "uploaded" },
  scanStatus: { type: String, enum: ["pending", "clean", "infected", "not_available"], default: "not_available" },

  deletedAt: { type: Date },  // Soft delete
  createdAt: { type: Date, default: Date.now },
})
```

### 4.14 Asset — Activo (Vehiculo, Herramienta, Equipo)

```typescript
const AssetSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["vehicle", "tool", "equipment", "safety", "telecom", "access"], required: true },
  code: { type: String, unique: true },  // Codigo interno

  // Detalles
  brand: { type: String },
  model: { type: String },
  serialNumber: { type: String },
  description: { type: String },

  // Estado
  status: { type: String, enum: ["active", "maintenance", "retired", "lost"], default: "active" },

  // Certificados
  certificates: [{ type: Schema.Types.ObjectId, ref: "Certificate" }],

  // Mantenimiento
  maintenancePlans: [{ type: Schema.Types.ObjectId, ref: "MaintenancePlan" }],
  lastMaintenanceDate: { type: Date },
  nextMaintenanceDate: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})
```

### 4.15 Certificate — Certificado

```typescript
const CertificateSchema = new Schema({
  documentFileId: { type: Schema.Types.ObjectId, ref: "DocumentFile", required: true },
  certificateType: { type: String, required: true },  // Calibracion, seguridad, operacion, etc.

  // Entidad asociada
  entityType: { type: String, enum: ["asset", "tool", "equipment", "user", "company"], required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },

  // Vigencia
  issuedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  issuer: { type: String, required: true },

  // Estado
  status: { type: String, enum: ["valid", "expired", "expiring_soon", "rejected"], default: "valid" },

  createdAt: { type: Date, default: Date.now },
})

CertificateSchema.index({ entityId: 1, entityType: 1 })
CertificateSchema.index({ expiresAt: 1 })  // Para alertas de vencimiento
```

---

## 5. Contratos API REST

### 5.1 Endpoints de Autenticacion

```text
POST   /api/auth/login           { email, password }                    → { user, message }
POST   /api/auth/refresh         (cookie refresh)                       → { message }
POST   /api/auth/logout          (cookie access)                        → { message }
GET    /api/auth/me              (cookie access)                        → { user }
```

### 5.2 Endpoints de WorkRequest

```text
GET    /api/work-requests        ?status=&page=&limit                   → { items[], meta }
POST   /api/work-requests        { clientId, siteId, serviceType, ... }  → { workRequest }
GET    /api/work-requests/:id                                           → { workRequest }
PATCH  /api/work-requests/:id    { status, ... }                         → { workRequest }
POST   /api/work-requests/:id/qualify { findings, requiresVisit }        → { workRequest }
POST   /api/work-requests/:id/convert-to-proposal { proposalData }       → { proposal }
POST   /api/work-requests/:id/cancel  { reason }                         → { workRequest }
```

### 5.3 Endpoints de Proposal

```text
GET    /api/proposals            ?status=&page=&limit                   → { items[], meta }
POST   /api/proposals            { workRequestId, scope, estimatedTotal, ... } → { proposal }
GET    /api/proposals/:id                                               → { proposal }
POST   /api/proposals/:id/submit                                        → { proposal }
POST   /api/proposals/:id/approve                                       → { proposal }
POST   /api/proposals/:id/reject    { reason }                           → { proposal }
POST   /api/proposals/:id/purchase-order { poNumber, file, ... }         → { purchaseOrder }
POST   /api/proposals/:id/convert-to-work-order                         → { workOrder }
```

### 5.4 Endpoints de WorkOrder

```text
GET    /api/orders               ?status=&page=&limit                   → { items[], meta }
GET    /api/orders/:id                                                    → { workOrder }
POST   /api/orders/:id/planning-packet  { crew, materials, tools, ... }   → { planningPacket }
GET    /api/orders/:id/planning-packet                                    → { planningPacket }
POST   /api/planning-packets/:id/approve                                → { planningPacket }
POST   /api/orders/:id/execution/start                                  → { executionSession }
POST   /api/orders/:id/execution/finish                                 → { executionSession }
GET    /api/orders/:id/evidences                                        → { evidences[] }
POST   /api/orders/:id/evidences    { files[], type, caption, ... }       → { evidences[] }
POST   /api/orders/:id/reports/generate                                 → { technicalReport }
POST   /api/orders/:id/delivery-record    { summary, ... }                → { deliveryRecord }
POST   /api/orders/:id/service-entry-sheet  { sesNumber, ... }            → { ses }
POST   /api/orders/:id/invoice    { invoiceNumber, amounts, ... }         → { invoice }
POST   /api/orders/:id/payments   { amount, reference, date, method }     → { payment }
```

### 5.5 Endpoints de Billing (SES, Invoice, Payment)

```text
GET    /api/billing/ses            ?status=&page=&limit                  → { items[], meta }
POST   /api/service-entry-sheets/:id/submit                               → { ses }
POST   /api/service-entry-sheets/:id/approve                              → { ses }
POST   /api/service-entry-sheets/:id/reject   { reason }                   → { ses }

GET    /api/billing/invoices       ?status=&page=&limit                  → { items[], meta }
POST   /api/invoices/:id/submit                                           → { invoice }
POST   /api/invoices/:id/approve                                          → { invoice }
POST   /api/invoices/:id/reject     { reason }                             → { invoice }

GET    /api/payments               ?status=&page=&limit                  → { items[], meta }
POST   /api/payments/:id/reconcile                                        → { payment }
```

### 5.6 Endpoints de Documentos

```text
POST   /api/document-imports        { file, businessUnit, workflowStep }  → { import }
GET    /api/document-imports        ?status=&page=&limit                  → { items[], meta }
GET    /api/document-imports/:id                                          → { import }
POST   /api/document-imports/:id/analyze                                  → { import }
POST   /api/document-imports/:id/review   { fields[] }                     → { import }
POST   /api/document-imports/:id/create-template                        → { template }

GET    /api/document-templates      ?businessUnit=&workflowStep           → { items[], meta }
POST   /api/document-templates      { name, businessUnit, fields[] }      → { template }
GET    /api/document-templates/:id                                        → { template }
POST   /api/document-templates/:id/publish-version  { fields[] }         → { template }

POST   /api/template-responses      { templateId, templateVersion, data } → { response }
GET    /api/template-responses/:id                                        → { response }

POST   /api/generated-documents     { templateResponseId }                → { document }
GET    /api/generated-documents/:id/download                              → (archivo)
```

### 5.7 Endpoints de Evidencias

```text
GET    /api/evidences              ?workOrderId=&type=&page=&limit        → { items[], meta }
POST   /api/evidences              { workOrderId, type, file, caption, gps } → { evidence }
GET    /api/evidences/:id                                                   → { evidence }
PATCH  /api/evidences/:id          { caption, isClientVisible }              → { evidence }
```

### 5.8 Endpoints de Costos

```text
GET    /api/cost-catalog           ?category=&page=&limit                  → { items[], meta }
POST   /api/cost-catalog           { category, item, unit }                → { item }

GET    /api/orders/:id/costs                                               → { costCart }
POST   /api/orders/:id/costs       { lines[] }                              → { costCart }
PUT    /api/cost-lines/:id         { quantity, unitPrice }                  → { costLine }
DELETE /api/cost-lines/:id                                                 → { message }
GET    /api/orders/:id/cost-variance                                       → { variance }
```

### 5.9 Endpoints de Activos

```text
GET    /api/assets                 ?type=&status=&page=&limit             → { items[], meta }
POST   /api/assets                 { name, type, brand, model, ... }       → { asset }
GET    /api/assets/:id                                                    → { asset }
PUT    /api/assets/:id             { status, ... }                          → { asset }

POST   /api/assets/:id/certificates   { file, type, issuedAt, expiresAt, issuer } → { certificate }
GET    /api/assets/:id/certificates                                       → { certificates[] }

POST   /api/assets/:id/maintenance  { type, description, scheduledDate }   → { plan }
GET    /api/assets/:id/maintenance                                        → { plans[] }
```

### 5.10 Endpoints de Dashboard

```text
GET    /api/dashboard/summary                                              → { kpis }
GET    /api/dashboard/blockers                                             → { blockers[] }
GET    /api/dashboard/next-actions                                         → { actions[] }
GET    /api/dashboard/aging                                                → { aging[] }
GET    /api/dashboard/cost-variance                                        → { variances[] }
GET    /api/dashboard/offline-queue                                        → { queue[] }
GET    /api/notifications                                                  → { notifications[] }
POST   /api/notifications/:id/read                                         → { notification }
```

### 5.11 Endpoints de Archivos

```text
POST   /api/files                  { file, entityType, entityId }          → { file }
GET    /api/files/:id                                                      → { file }
GET    /api/files/:id/download                                             → (archivo)
GET    /api/files/:id/preview                                              → (archivo)
POST   /api/files/:id/archive                                              → { file }
```

---

## 6. Validacion con Zod (Shared Types)

### 6.1 Patron

Todo schema Zod debe vivir en `packages/shared-types/src/schemas/`:

```typescript
// packages/shared-types/src/schemas/workRequest.schema.ts
import { z } from "zod"

export const CreateWorkRequestSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  siteId: z.string().min(1, "Site is required"),
  requestedBy: z.string().min(1, "Requester name is required"),
  requesterEmail: z.string().email().optional(),
  requesterPhone: z.string().optional(),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  urgency: z.enum(["low", "medium", "high", "critical"]).default("medium"),
})

export const QualifyWorkRequestSchema = z.object({
  findings: z.string().min(1),
  requiresVisit: z.boolean().default(false),
})

// Tipos TypeScript derivados automaticamente
export type CreateWorkRequestInput = z.infer<typeof CreateWorkRequestSchema>
export type QualifyWorkRequestInput = z.infer<typeof QualifyWorkRequestSchema>
```

### 6.2 Middleware de Validacion

```typescript
// middleware/validate.middleware.ts
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      throw result.error  // El error middleware se encarga de formatear
    }
    req.body = result.data  // Body tipado
    next()
  }
}
```

### 6.3 Exportacion de Shared Types

```typescript
// packages/shared-types/src/index.ts
export * from "./schemas/auth.schema"
export * from "./schemas/workRequest.schema"
export * from "./schemas/proposal.schema"
export * from "./schemas/workOrder.schema"
export * from "./schemas/planning.schema"
export * from "./schemas/execution.schema"
export * from "./schemas/evidence.schema"
export * from "./schemas/report.schema"
export * from "./schemas/delivery.schema"
export * from "./schemas/billing.schema"
export * from "./schemas/document.schema"
export * from "./schemas/cost.schema"
export * from "./schemas/asset.schema"

export * from "./types/api.types"
export * from "./types/auth.types"
export * from "./types/domain.types"
```

### 6.4 Consumo en Backend y Frontend

```typescript
// Backend: validacion
import { CreateWorkRequestSchema } from "@cermont/shared-types"
router.post("/", validateBody(CreateWorkRequestSchema), controller.create)

// Frontend: tipado de forms
import { type CreateWorkRequestInput } from "@cermont/shared-types"
const form = useForm<CreateWorkRequestInput>()
```
---

# ANEXO v2.1 — Cierre de puntos ciegos para agentes IA/Codex

> **Prevalencia normativa:** si alguna sección anterior de este documento contradice este anexo, prevalece el **ANEXO v2.1**.  
> **Propósito:** convertir la documentación canónica en un plano arquitectónico ejecutable, verificable y sin ambigüedades para agentes IA/Codex.  
> **Regla base:** ningún agente puede declarar una función como implementada si no aporta **archivo + endpoint/contrato/componente + prueba + evidencia**.


## 1. Vertical slice obligatorio

Cada módulo backend debe seguir:

```text
schema Zod
→ tipo inferido
→ modelo Mongoose
→ servicio de dominio
→ controlador delgado
→ ruta con authenticate/authorize/validate
→ test unitario/integración
→ evidencia curl
```

Prohibido:
- validar directamente en el controlador si existe schema compartido;
- duplicar DTOs;
- aceptar strings genéricos cuando existe enum/union;
- crear endpoints sin RBAC.

## 2. ApiEnvelope obligatorio

Respuesta exitosa:

```ts
type SuccessEnvelope<T> = {
  readonly success: true;
  readonly data: T;
  readonly traceId: string;
};
```

Respuesta de error:

```ts
type ErrorEnvelope = {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Readonly<Record<string, string | number | boolean>>;
    readonly traceId: string;
  };
};
```

Si las reglas del repositorio prohíben `undefined`, la propiedad opcional se omite con spread condicional y no se asigna explícitamente.

## 3. Matriz mínima de endpoints críticos

| Método | Endpoint | Módulo | Request schema | Response schema | RBAC | Regla de negocio | Test |
|---|---|---|---|---|---|---|---|
| POST | `/api/work-requests` | work-requests | `CreateWorkRequestSchema` | `WorkRequestResponseSchema` | cliente/manager/supervisor | crea paso 1 | integración + curl |
| POST | `/api/site-visits` | site-visits | `CreateSiteVisitSchema` | `SiteVisitSchema` | supervisor/residentEngineer | requiere solicitud/caso | integración + curl |
| POST | `/api/proposals/:id/approve` | proposals | `ApproveProposalSchema` | `ProposalSchema` | manager | no PO sin propuesta aprobada | unit + curl |
| POST | `/api/planning/:id/approve` | planning | `ApprovePlanningSchema` | `PlanningPacketSchema` | manager/residentEngineer | bloquea si falta AST/PTW/kit | unit + Playwright |
| POST | `/api/execution/:id/start` | execution | `StartExecutionSchema` | `ExecutionSessionSchema` | supervisor/technician | no iniciar sin planeación aprobada | integration |
| POST | `/api/evidences/batch` | evidences | `CreateEvidenceBatchSchema` | `EvidenceBatchSchema` | technician/supervisor | requiere caso/paso/categoría | Playwright |
| POST | `/api/reports/from-execution` | reports | `GenerateReportSchema` | `TechnicalReportSchema` | supervisor/residentEngineer | requiere ejecución cerrada | integration |
| POST | `/api/delivery-records` | delivery-records | `CreateDeliveryRecordSchema` | `DeliveryRecordSchema` | administrative/residentEngineer | requiere informe aprobado | integration |
| POST | `/api/billing/ses` | billing | `CreateServiceEntrySheetSchema` | `ServiceEntrySheetSchema` | administrative | requiere acta firmada | integration |
| POST | `/api/billing/invoices` | billing | `CreateInvoiceSchema` | `InvoiceSchema` | administrative | requiere SES aprobada | integration |
| POST | `/api/payments` | payments | `CreatePaymentSchema` | `PaymentSchema` | administrative/manager | requiere factura aprobada; no sobrepago | integration |
| GET | `/api/service-cases/:id/workflow` | service-cases | params schema | `ServiceCaseWorkflowSchema` | authenticated | cockpit 14 pasos | curl + Playwright |
| GET | `/api/offline/bootstrap` | sync/offline | query schema | `OfflineBootstrapSchema` | authenticated | precarga trabajo asignado | offline E2E |
| POST | `/api/sync/flush` | sync | `SyncFlushSchema` | `SyncFlushResultSchema` | authenticated | idempotencia por `clientMutationId` | integration |

## 4. Seguridad e IDOR

Cada endpoint que recibe `:id` debe verificar:

1. usuario autenticado;
2. rol autorizado;
3. pertenencia o permiso sobre entidad;
4. estado de negocio;
5. auditoría.

Tests mínimos:

| Caso | Resultado esperado |
|---|---|
| Usuario sin sesión | 401 |
| Rol no autorizado | 403 |
| ID válido pero de otro cliente | 403/404 seguro |
| ID malformado | 400 |
| Estado inválido para transición | 422 |
| Payload inválido | 400 |

## 5. Error codes estables

Los mensajes visibles se traducen en frontend. El backend debe entregar códigos estables:

```text
PLANNING_NOT_READY
MISSING_AST
MISSING_PTW
MISSING_REQUIRED_EVIDENCE
DELIVERY_RECORD_NOT_SIGNED
SES_NOT_APPROVED
INVOICE_NOT_APPROVED
PAYMENT_EXCEEDS_INVOICE_BALANCE
DOCUMENT_PROTECTED
OFFLINE_COMMAND_CONFLICT
```
