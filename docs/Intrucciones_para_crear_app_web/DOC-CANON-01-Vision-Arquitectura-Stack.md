# DOC-CANON-01 — Vision, Arquitectura y Stack Tecnologico

**Proyecto:** Cermont S.A.S. — Plataforma documental-operativa para contratistas multiservicio
**Version:** v2.1 canónica ampliada para ejecución IA/Codex
**Estado:** SOURCE_OF_TRUTH + ANEXO v2.1 operativo
**Compresion:** DOC-01 + DOC-02 + partes de DOC-21

---

## 1. Vision del Proyecto

### 1.1 Que es Cermont

Cermont S.A.S. es una empresa contratista multiservicio que presta servicios de construccion, electricidad, refrigeracion, mantenimiento, CCTV, lineas de vida, obra civil, telecomunicaciones, montajes, suministro de materiales, herramientas, equipos y personal tecnico. Opera principalmente en el campo petrolero Caño Limon, administrado por Sierracol Energy, en Arauca, Colombia.

### 1.2 Problema Central

La empresa enfrenta dificultades criticas en la planeacion, ejecucion y cierre administrativo de sus procesos operativos debido a:

- **Formatos fisicos y dispersos:** Uso de hojas de calculo, documentos sueltos y registros manuales
- **Trazabilidad deficiente:** No hay un seguimiento centralizado del estado de cada trabajo
- **Planeacion incompleta:** No se definen claramente herramientas, materiales y elementos de proteccion requeridos
- **Evidencias sueltas:** Fotos y documentos quedan dispersos en WhatsApp, correos y carpetas personales
- **Informes manuales:** Los formatos se diligencian manualmente, generando demoras y errores
- **Cierre administrativo lento:** Retrasos en actas, SES, facturas y pagos por falta de seguimiento
- **Costos sin control:** No hay comparacion sistematica entre costos presupuestados y reales

### 1.3 Solucion: Plataforma Documental-Operativa

El aplicativo web debe convertirse en una **plataforma documental-operativa para contratistas multiservicio**, capaz de:

1. Transformar documentos existentes (PDF, Excel, Word) en formularios dinamicos
2. Capturar informacion de campo con soporte offline
3. Gestionar el flujo completo de solicitud a pago en 14 pasos
4. Controlar costos reales vs presupuestados
5. Generar informes tecnicos y actas automaticamente
6. Cerrar administrativamente los trabajos con trazabilidad completa

### 1.4 Idea Central: Document-Driven

```text
Documento real de Cermont (PDF/Excel/Word/Foto)
  → Ingesta digital
  → Deteccion de campos, tablas, checklists, firmas
  → Revision humana
  → Plantilla versionada
  → Formulario dinamico (online/offline)
  → Captura en campo
  → Informe/Acta/PDF generado
  → Cierre administrativo (SES → Factura → Pago)
```

### 1.5 Flujo Operativo Canonico de 14 Pasos

| Paso | Accion de Negocio | Entidad Principal | Salida Esperada |
|----:|---|---|---|
| 1 | Solicitud del cliente | `WorkRequest` | Solicitud registrada y clasificada |
| 2 | Visita tecnica si aplica | `SiteVisit` | Diagnostico o visita aprobada |
| 3 | Propuesta economica | `Proposal` | Oferta formal con alcance y costos |
| 4 | Aprobacion con PO | `PurchaseOrder` | Aprobacion contractual |
| 5 | Planeacion | `PlanningPacket` | Readiness operativo aprobado |
| 6 | Ejecucion | `ExecutionSession` | Trabajo ejecutado en campo |
| 7 | Evidencias | `Evidence` | Fotos, firmas, GPS, soportes |
| 8 | Informe tecnico | `TechnicalReport` | Informe generado y aprobado |
| 9 | Acta de entrega | `DeliveryRecord` | Acta emitida al cliente |
| 10 | Firma/recibo del cliente | `ClientSignature` | Acta firmada o rechazada |
| 11 | SES / Ariba | `ServiceEntrySheet` | Servicio radicado y aprobado |
| 12 | Factura | `Invoice` | Factura emitida contra SES aprobada |
| 13 | Aprobacion de factura | `InvoiceApproval` | Factura aceptada o rechazada |
| 14 | Pago | `Payment` | Pago registrado, conciliado y auditado |

---

## 2. Stack Tecnologico Completo

### 2.1 Frontend

| Tecnologia | Version | Proposito |
|---|---|---|
| **Next.js** | 16 (App Router) | Framework React principal con SSR/SSG |
| **React** | 19 | Biblioteca UI declarativa |
| **TypeScript** | 5.x | Tipado estatico |
| **TanStack Query v5** | ^5.0 | Data fetching, cache, sincronizacion |
| **Zustand** | ^5.0 | Estado global (autenticacion, temas, UI) |
| **Tailwind CSS v4** | ^4.0 | Estilos utilitarios |
| **Shadcn/ui** | latest | Componentes base (tablas, modales, formularios) |
| **Biome** | ^1.9 | Linter y formatter |
| **Vitest** | ^3.0 | Testing unitario |

**Reglas del frontend:**
- No usar `fetch` directo en componentes — usar `apiClient` unico
- No usar `useEffect` para data fetching — usar TanStack Query
- No usar `new Date()` ni `Math.random()` en render si afecta hydration
- No usar componentes gigantes (maximo ~200 lineas logicas)
- No duplicar componentes de Shadcn/ui
- Todo componente debe tener estados: `loading`, `error`, `empty`, `offline`

### 2.2 Backend

| Tecnologia | Version | Proposito |
|---|---|---|
| **Node.js** | 22 LTS | Runtime JavaScript |
| **Express 5** | ^5.0 | Framework web API REST |
| **TypeScript** | 5.x | Tipado estatico |
| **Mongoose** | ^8.0 | ODM para MongoDB |
| **MongoDB** | 8.x | Base de datos documental |
| **Zod** | ^3.24 | Validacion de esquemas |
| **Biome** | ^1.9 | Linter y formatter |
| **Vitest** | ^3.0 | Testing unitario |

**Reglas del backend:**
- Express 5 maneja errores async nativamente — no usar `express-async-handler`
- Todo payload externo validar con Zod antes del servicio
- Toda respuesta debe usar `ApiEnvelope<T>`
- Todo error debe ser tipado con codigo estable
- No usar `any`, `unknown`, `as any`, `catch {}`
- Autenticacion por cookies `httpOnly` + JWT en memoria

### 2.3 Base de Datos

| Aspecto | Decision |
|---|---|
| Motor principal | MongoDB 8 |
| ODM | Mongoose con tipado TypeScript |
| Patron | Schema-per-workspace en `backend/src/models/` |
| Campos obligatorios | `createdAt`, `updatedAt` |
| Relaciones | Referencias (no subdocumentos anidados) |
| Patron de versionado | Versionado semantico para documentos: v1.0, v1.1, v2.0 |
| Indices | Definir en cada schema para queries frecuentes |

### 2.4 Arquitectura General

```text
Cliente (Navegador/PWA)
  → Next.js 16 (Frontend SSR/CSR)
  → API Proxy (/api/backend/*)
  → Express 5 (Backend API REST)
  → MongoDB 8 (Persistencia)
```

```text
Monorepo con npm workspaces:

├── backend/                  ← Express 5 + Mongoose
│   ├── src/
│   │   ├── config/           ← Variables de entorno
│   │   ├── models/           ← Esquemas Mongoose
│   │   ├── routes/           ← Definicion de rutas
│   │   ├── controllers/      ← Logica de negocio
│   │   ├── middleware/       ← Auth, validacion, errores
│   │   ├── services/         ← Logica de dominio
│   │   ├── utils/            ← Helpers
│   │   └── types/            ← Tipos TypeScript
├── frontend/                 ← Next.js 16 + React 19
│   ├── src/
│   │   ├── app/              ← App Router (rutas)
│   │   ├── components/       ← Componentes React
│   │   ├── hooks/            ← Custom hooks
│   │   ├── lib/              ← Utilidades
│   │   ├── stores/           ← Zustand stores
│   │   ├── services/         ← apiClient, queries
│   │   └── types/            ← Tipos TypeScript
└── packages/
    ├── shared-types/         ← Esquemas Zod + tipos compartidos
    ├── domain/               ← Logica de dominio pura
    └── config/               ← Configuracion compartida
```

**Workspaces de npm:**
```json
{
  "workspaces": [
    "backend",
    "frontend",
    "packages/shared-types",
    "packages/domain",
    "packages/config"
  ]
}
```

---

## 3. Estructura de Carpetas Detallada

### 3.1 Backend

```text
backend/
├── src/
│   ├── config/
│   │   ├── database.ts           ← Conexion MongoDB
│   │   ├── env.ts                ← Validacion de variables de entorno
│   │   └── cors.ts               ← Configuracion CORS
│   ├── models/
│   │   ├── User.ts               ← Usuario con roles
│   │   ├── WorkRequest.ts        ← Solicitud de trabajo
│   │   ├── Proposal.ts           ← Propuesta economica
│   │   ├── WorkOrder.ts          ← Orden de trabajo
│   │   ├── PlanningPacket.ts     ← Paquete de planeacion
│   │   ├── ExecutionSession.ts   ← Sesion de ejecucion
│   │   ├── Evidence.ts           ← Evidencias (fotos, firmas, GPS)
│   │   ├── TechnicalReport.ts    ← Informe tecnico
│   │   ├── DeliveryRecord.ts     ← Acta de entrega
│   │   ├── ServiceEntrySheet.ts  ← SES / Ariba
│   │   ├── Invoice.ts            ← Factura
│   │   ├── Payment.ts            ← Pago
│   │   ├── DocumentTemplate.ts   ← Plantilla de documento
│   │   ├── DocumentImport.ts     ← Importacion documental
│   │   ├── CostCart.ts           ← Carrito de costos
│   │   ├── Asset.ts              ← Activos/equipos
│   │   ├── Certificate.ts        ← Certificados
│   │   ├── AuditEvent.ts         ← Eventos de auditoria
│   │   └── Notification.ts       ← Notificaciones
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── workRequest.routes.ts
│   │   ├── proposal.routes.ts
│   │   ├── workOrder.routes.ts
│   │   ├── planning.routes.ts
│   │   ├── execution.routes.ts
│   │   ├── evidence.routes.ts
│   │   ├── report.routes.ts
│   │   ├── delivery.routes.ts
│   │   ├── billing.routes.ts
│   │   ├── document.routes.ts
│   │   ├── cost.routes.ts
│   │   ├── asset.routes.ts
│   │   ├── dashboard.routes.ts
│   │   └── index.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── workRequest.controller.ts
│   │   └── ... (uno por dominio)
│   ├── middleware/
│   │   ├── auth.middleware.ts    ← JWT + RBAC
│   │   ├── validate.middleware.ts ← Validacion Zod
│   │   ├── error.middleware.ts   ← Manejo de errores global
│   │   └── audit.middleware.ts   ← Auditoria automatica
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── workRequest.service.ts
│   │   └── ... (logica de negocio)
│   ├── utils/
│   │   ├── ApiEnvelope.ts        ← Respuesta estandarizada
│   │   ├── TypedErrors.ts        ← Errores de dominio
│   │   ├── hash.ts               ← Hashing de passwords
│   │   └── logger.ts             ← Logger estructurado
│   ├── types/
│   │   └── express.d.ts          ← Tipos extendidos
│   └── index.ts                  ← Punto de entrada
├── tests/                        ← Tests de integracion
├── .env                          ← Variables de entorno
├── package.json
└── tsconfig.json
```

### 3.2 Frontend

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Layout raiz
│   │   ├── page.tsx                ← Landing / Login
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── work-requests/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── proposals/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── planning/page.tsx
│   │   │       ├── execution/page.tsx
│   │   │       ├── evidences/page.tsx
│   │   │       ├── reports/page.tsx
│   │   │       ├── delivery-record/page.tsx
│   │   │       ├── service-entry-sheet/page.tsx
│   │   │       ├── invoice/page.tsx
│   │   │       └── payment/page.tsx
│   │   ├── costs/
│   │   │   └── page.tsx
│   │   ├── billing/
│   │   │   ├── page.tsx
│   │   │   ├── ses/page.tsx
│   │   │   └── invoices/page.tsx
│   │   ├── payments/
│   │   │   └── page.tsx
│   │   ├── documents/
│   │   │   ├── page.tsx
│   │   │   └── templates/page.tsx
│   │   ├── assets/
│   │   │   └── page.tsx
│   │   ├── maintenance/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                     ← Shadcn/ui base
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── AppShell.tsx
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardPanel.tsx
│   │   │   ├── KPICards.tsx
│   │   │   └── BlockerList.tsx
│   │   ├── common/
│   │   │   ├── LoadingState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── OfflineState.tsx
│   │   └── ... (componentes por modulo)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWorkRequests.ts
│   │   └── ... (hooks por dominio)
│   ├── lib/
│   │   ├── apiClient.ts            ← Cliente HTTP unificado
│   │   ├── queryClient.ts          ← Config TanStack Query
│   │   └── utils.ts
│   ├── stores/
│   │   ├── authStore.ts            ← Zustand auth
│   │   └── uiStore.ts              ← Zustand UI
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── ... (servicios por dominio)
│   └── types/
│       └── index.ts
├── public/
│   ├── manifest.json               ← PWA manifest
│   ├── sw.js                       ← Service Worker
│   └── icons/
├── tests/
├── .env.local
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### 3.3 Paquetes Compartidos

```text
packages/
├── shared-types/
│   ├── src/
│   │   ├── schemas/              ← Esquemas Zod
│   │   │   ├── auth.schema.ts
│   │   │   ├── workRequest.schema.ts
│   │   │   ├── proposal.schema.ts
│   │   │   └── ...
│   │   ├── types/                ← Tipos TypeScript
│   │   │   ├── auth.types.ts
│   │   │   └── ...
│   │   └── index.ts
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── domain/
│   ├── src/
│   │   ├── commands/             ← Comandos de dominio
│   │   ├── events/               ← Eventos de dominio
│   │   └── errors/               ← Errores tipados
│   └── package.json
└── config/
    ├── src/
    │   ├── typescript/
    │   └── biome/
    └── package.json
```

---

## 4. Patrones y Convenciones Arquitectonicas

### 4.1 Principios Obligatorios

| Principio | Descripcion |
|---|---|
| **Contract-First Development** | Todo endpoint publico parte de un esquema Zod en `packages/shared-types` |
| **Vertical Slices** | Implementar de extremo a extremo: contrato → backend → frontend → test |
| **Single Source of Truth** | RBAC, rutas, permisos, estados y contratos tienen fuente unica |
| **Fail Fast + Typed Errors** | Errores detectados cerca del origen, con codigo estable y tipado |
| **No Silent Failures** | Prohibido tragar errores con `catch {}` o `catch (e) { return [] }` |
| **Observability by Design** | Cada modulo define eventos, metricas y errores observables desde el diseno |
| **Auditability by Default** | Cada accion critica deja trazabilidad con `AuditEvent` |
| **No Mock Data in Production** | Los mocks solo existen en `*.test.ts`, `tests/**`, `fixtures/**` |
| **Zero Any** | Prohibido `any` y `as any` |
| **Zero Unknown Escape** | Prohibido usar `unknown` como escape de tipado |

### 4.2 Patron de Respuesta API (ApiEnvelope)

Todas las respuestas backend deben usar `ApiEnvelope<T>`:

```typescript
// Respuesta exitosa
type ApiSuccess<T> = {
  success: true
  data: T
  message?: string
  meta?: { page: number; limit: number; total: number }
}

// Respuesta de error
type ApiError = {
  success: false
  error: {
    code: string        // Codigo estable (ej: "WORK_REQUEST_NOT_FOUND")
    message: string     // Mensaje legible para humanos
    details?: Array<{ field: string; message: string }>
    traceId?: string
  }
}

type ApiEnvelope<T> = ApiSuccess<T> | ApiError
```

Ejemplos:

```json
// Exito
{
  "success": true,
  "data": { "id": "wr_123", "status": "submitted" },
  "message": "Work request created"
}

// Error
{
  "success": false,
  "error": {
    "code": "PLANNING_PACKET_NOT_READY",
    "message": "Planning cannot be approved because required tools are missing.",
    "details": [{ "field": "tools", "message": "At least one tool must be assigned" }],
    "traceId": "req_01HF..."
  }
}
```

### 4.3 Patron de Errores de Dominio

```typescript
export class DomainError extends Error {
  constructor(
    public readonly code: string,     // Ej: "WORK_REQUEST_NOT_FOUND"
    message: string,                  // Mensaje legible
    public readonly statusCode: number, // HTTP status
    public readonly details: Array<{ field: string; message: string }> = []
  ) {
    super(message)
    this.name = "DomainError"
  }
}
```

### 4.4 Patron de Comandos de Dominio

Las transiciones criticas deben ejecutarse mediante comandos, no cambios de estado arbitrarios:

```typescript
// Ejemplo: Aprobar planeacion
interface ApprovePlanningCommand {
  planningPacketId: string
  approvedBy: string      // userId
  approvedAt: Date
  notes?: string
}

// Precondiciones verificadas en el servicio:
// 1. Planeacion existe
// 2. Usuario tiene permiso
// 3. No hay blockers criticos
// 4. AST y PTW estan adjuntos si aplica
// 5. Herramientas y personal asignados
```

### 4.5 Patron de Maquina de Estados (FSM)

Las entidades principales usan maquinas de estados finitos:

```typescript
// Estados de WorkRequest
type WorkRequestStatus =
  | "draft"
  | "submitted"
  | "qualified"
  | "visit_scheduled"
  | "visit_completed"
  | "converted_to_proposal"
  | "cancelled"

// Transiciones validas (solo estas transiciones son permitidas)
const validTransitions: Record<WorkRequestStatus, WorkRequestStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["qualified", "cancelled"],
  qualified: ["visit_scheduled", "converted_to_proposal", "cancelled"],
  visit_scheduled: ["visit_completed", "cancelled"],
  visit_completed: ["converted_to_proposal", "cancelled"],
  converted_to_proposal: [],          // Estado final
  cancelled: []                       // Estado final
}
```

---

## 5. Roles y RBAC

### 5.1 Roles Definidos

```typescript
type UserRole =
  | "gerente"           ← Acceso total
  | "administrativo"    ← SES, facturas, pagos, documentos
  | "supervisor"        ← Planeacion, ejecucion, informes, actas
  | "tecnico"           ← Ejecucion, evidencias, formularios offline
  | "cliente"           ← Firma/recibo, visualizacion limitada
  | "auditor"           ← Lectura, auditoria, trazabilidad
  | "hes"               ← HSE, permisos, AST/PTW, inspecciones
```

### 5.2 Matriz de Permisos

| Accion | gerente | administrativo | supervisor | tecnico | cliente | hes |
|---|---|---|---|---|---|---|
| Ver solicitudes | S | S | S | S | - | - |
| Crear solicitud | S | S | S | - | S | - |
| Aprobar propuesta | S | - | - | - | - | - |
| Registrar PO | S | S | - | - | - | - |
| Aprobar planeacion | S | - | S | - | - | - |
| Ejecutar orden | S | - | S | S | - | - |
| Subir evidencia | S | - | S | S | - | - |
| Aprobar informe | S | - | S | - | - | - |
| Firmar acta (cliente) | - | - | - | - | S | - |
| Radicar SES | S | S | - | - | - | - |
| Emitir factura | S | S | - | - | - | - |
| Registrar pago | S | S | - | - | - | - |
| Ver costos | S | S | S | - | - | - |
| Administrar usuarios | S | - | - | - | - | - |

---

## 6. Design System (Tokens de UI)

### 6.1 Colores

| Token | Valor | Uso |
|---|---|---|
| `--cermont-blue` | `#2154A6` | Color principal: botones, acentos, sidebar activo |
| `--cermont-deep-blue` | `#0F2C59` | Variante activa/presionada |
| `--cermont-green` | `#4CAF50` | Estados positivos, exito, verificaciones |
| `--cermont-light-green` | `#7CD966` | Fondo de confirmacion |
| `--cermont-blue-light` | `#3A78D8` | Tags y referencias |
| `--error` | `#EF4444` | Errores, validacion |
| `--warning` | `#F59E0B` | Advertencias |
| `--canvas` | `#FFFFFF` | Fondo principal |
| `--surface` | `#F8FAFC` | Fondos secundarios |
| `--ink` | `#0F172A` | Texto principal |
| `--charcoal` | `#334155` | Texto cuerpo |
| `--slate` | `#64748B` | Texto secundario |
| `--steel` | `#94A3B8` | Texto terciario |

### 6.2 Tipografia

| Token | Tamanio | Peso | Uso |
|---|---|---|---|
| `hero-display` | 72px | 600 | Landing principal |
| `heading-1` | 48px | 600 | Titulos de pagina |
| `heading-2` | 36px | 600 | Titulos de seccion |
| `heading-3` | 28px | 600 | Subsecciones |
| `heading-4` | 22px | 600 | Titulos de tarjetas |
| `body-md` | 16px | 400 | Texto principal |
| `body-sm` | 14px | 400 | Texto secundario, tablas |
| `caption` | 13px | 400 | Texto auxiliar |
| `micro` | 12px | 500 | Microcopy |

**Fuentes:** Inter (UI), Geist Mono (codigo)

### 6.3 Componentes Base

- **Boton primario:** Fondo `--cermont-blue`, texto blanco, `rounded-full`, padding `10px 20px`
- **Boton secundario:** Fondo transparente, borde `--hairline`, texto `--ink`, `rounded-full`
- **Tarjeta:** Fondo `--canvas`, borde `1px solid --hairline`, `rounded-lg (12px)`, padding `24px`
- **Input:** Fondo `--canvas`, borde `--hairline`, `rounded-md (8px)`, height `40px`
- **Focus:** Borde `2px solid --cermont-blue` en todos los inputs interactivos

---

## 7. Principios de Madurez Documental

El producto evoluciona por niveles de madurez documental:

| Nivel | Descripcion | Estado |
|---|---|---|
| **0** — Dispersa | Documentos fisicos, Excel, fotos sueltas, sin trazabilidad | Punto de partida |
| **1** — Inventario | Documentos registrados con tipo, unidad de negocio, proceso, version | MVP inicial |
| **2** — Ingesta | Subida de PDF/Excel/Word con metadata, hash, tipo MIME | Fase temprana |
| **3** — Deteccion | Deteccion automatica de campos, tablas, checklists, firmas | Fase media |
| **4** — Revision + Builder | Revision humana de campos detectados, construccion de plantillas | Fase media |
| **5** — Captura offline/online | Tecnicos capturan en campo, funciona offline, sincroniza despues | Fase operativa |
| **6** — Generacion de entregables | Informes, actas, PDFs generados desde datos capturados | Fase avanzada |
| **7** — Cierre administrativo trazable | SES → Factura → Pago con trazabilidad completa | Objetivo final |

---

## 8. Gates Obligatorios (Antes de Entregar)

Todo cambio debe pasar estos gates antes de considerarse completo:

```bash
# Gates globales (desde raiz del monorepo)
npm run ghost:check          # Verifica que no exista estructura legacy apps/*
npm run contracts:check      # Verifica contratos API compartidos
npm run typecheck            # TypeScript en todos los workspaces
npm run lint                 # Biome lint en todos los workspaces
npm run test                 # Tests unitarios/integracion
npm run build                # Compilacion de produccion
npm run verify               # Gate completo del proyecto
npx react-doctor@latest      # Calidad React/frontend (si cambio frontend)
```

**Criterio:** Todos los gates deben pasar. Warnings deben estar documentados. React Doctor ideal 100/100, aceptable >= 95/100 con residuales justificados.

---

## 9. Anti-patrones Prohibidos

| # | Anti-patron | Consecuencia |
|---|---|---|
| 1 | Usar `any` o `as any` | Perdida de tipado, errores en runtime |
| 2 | `catch {}` o `catch (e) { return [] }` | Errores tragados silenciosamente |
| 3 | `console.log` en produccion | Ruido en logs, posible fuga de datos |
| 4 | Mocks en produccion (`frontend/src/**`) | Datos falsos que ocultan problemas |
| 5 | Endpoints sin contrato en shared-types | Desalineacion frontend/backend |
| 6 | Paginas solo con titulo (sin logica) | Ruta visible pero no funcional |
| 7 | `fetch` directo en componentes | Duplicacion, sin manejo de errores |
| 8 | Componentes gigantes (>200 lineas) | Dificil mantenimiento y testing |
| 9 | Estructura `apps/backend` o `apps/frontend` | Legacy, no es la estructura actual |
| 10 | Hardcodear permisos en frontend | Bypass de RBAC |
| 11 | Cambiar `API_ROOT` sin probar auth | Login roto |
| 12 | `new Date()` o `Math.random()` en render | Hydration mismatch |
| 13 | Crear endpoints sin consumidor | Codigo muerto |
| 14 | Duplicar componentes de Shadcn/ui | Mantenimiento doble |
| 15 | Usar documentacion vieja como fuente | Implementacion legacy |
| 16 | Ignorar React Doctor | Deuda tecnica de calidad |
| 17 | `useEffect` para data fetching | Pattern anticuado, usar TanStack Query |
| 18 | Hardcodear IVA, retenciones, impuestos | No configurable por negocio |
---

# ANEXO v2.1 — Cierre de puntos ciegos para agentes IA/Codex

> **Prevalencia normativa:** si alguna sección anterior de este documento contradice este anexo, prevalece el **ANEXO v2.1**.  
> **Propósito:** convertir la documentación canónica en un plano arquitectónico ejecutable, verificable y sin ambigüedades para agentes IA/Codex.  
> **Regla base:** ningún agente puede declarar una función como implementada si no aporta **archivo + endpoint/contrato/componente + prueba + evidencia**.


## 1. Alcance multiservicio y no acoplamiento

CERMONT debe modelarse como contratista multiservicio. Caño Limón / Sierracol puede usarse como **escenario piloto**, no como regla fija del software.

El sistema debe permitir:

| Dimensión | Regla |
|---|---|
| Cliente | Múltiples clientes y contratos. |
| Sede/campo | Múltiples ubicaciones y entornos de trabajo. |
| Servicio | Construcción, electricidad, refrigeración, montajes, CCTV, telecomunicaciones, líneas de vida, suministro de materiales/equipos/personal. |
| Formato | PDF, Word, Excel, fotos, firmas, checklists. |
| Catálogo | Configurable por cliente, contrato, tipo de servicio o sede. |

## 2. Alcance MVP vs futuro

| Capacidad | MVP obligatorio | Futuro / evolución |
|---|---:|---:|
| Subir PDF/Word/Excel/fotos | Sí | — |
| Biblioteca documental reusable | Sí | — |
| Seleccionar documento existente | Sí | — |
| Crear formulario manual desde documento | Sí | — |
| Detección básica de campos/tablas | Parcial | Mejorar con parsers |
| OCR para PDF escaneado | No obligatorio | Sí |
| IA semántica para interpretar documentos | No obligatorio | Sí |
| Evidencias offline con sincronización | Sí | Mejoras de conflicto |
| Firma digital simple | Sí | Firma certificada |
| Costos estimados vs reales | Sí | Analítica avanzada |

**Regla:** no prometer OCR o IA como implementado si no existe motor real, dependencia instalada, endpoint, test y evidencia.

## 3. Versiones del stack: fuente real

Las versiones exactas se toman de:

```text
package.json
package-lock.json
backend/package.json
frontend/package.json
packages/*/package.json
```

Si este documento contradice `package.json`, prevalece `package.json`.

Antes de consultar documentación externa con Context7, el agente debe ejecutar:

```bash
npm pkg get workspaces
npm pkg get dependencies -w @cermont/frontend
npm pkg get dependencies -w @cermont/backend
npm pkg get dependencies -w @cermont/shared-types
npm pkg get dependencies -w @cermont/domain
npm pkg get dependencies -w @cermont/config
```

## 4. Screaming Architecture obligatoria

La estructura debe gritar el dominio CERMONT:

```text
backend/src/modules/service-cases
backend/src/modules/planning
backend/src/modules/execution
backend/src/modules/evidences
backend/src/modules/documents
backend/src/modules/templates
backend/src/modules/billing
backend/src/modules/payments
backend/src/modules/costs

frontend/src/modules/service-cases
frontend/src/modules/planning
frontend/src/modules/execution
frontend/src/modules/evidences
frontend/src/modules/documents
frontend/src/modules/templates
frontend/src/modules/billing
frontend/src/modules/payments
frontend/src/modules/costs
```

Antipatrones:

```text
components/misc
services/utils
controllers genéricos sin dominio
pantallas CRUD huérfanas
roles hardcodeados en UI
reglas de negocio en componentes React
```

## 5. Roles canónicos internos y labels visibles

La UI puede mostrar español, pero el código interno debe tender a inglés y usar mapeo controlado:

| Rol visible | Rol canónico recomendado | Uso |
|---|---|---|
| Gerente | `manager` | Aprobaciones, cierre, costos. |
| Coordinador administrativo | `administrativeCoordinator` | SES, facturas, pagos. |
| Coordinador HES | `hesCoordinator` | Seguridad, AST/PTW, permisos. |
| Supervisor electricista | `fieldSupervisor` | Planeación, ejecución, validación. |
| Ingeniero residente | `residentEngineer` | Planeación técnica y aprobación operativa. |
| Técnico electricista | `technician` | Ejecución, evidencias, checklists. |
| Cliente | `client` | Consulta, firma, aprobación externa. |

Si la base de datos tiene roles en español, no migrar sin script idempotente, backup y pruebas.

## 6. Antipatrones críticos para agentes

- “Compila, entonces está terminado”.
- “Existe archivo, entonces está implementado”.
- “Frontend bonito sin backend”.
- “Backend con endpoint sin UI”.
- “Documento dice implementado, pero no hay Playwright/curl”.
- “Formulario con opciones cerradas sin Otro/Personalizado”.
- “Offline como pantalla de error”.
- “Crear factura manualmente sin SES aprobada”.
- “Subir evidencia sin categoría, paso ni requisito”.
