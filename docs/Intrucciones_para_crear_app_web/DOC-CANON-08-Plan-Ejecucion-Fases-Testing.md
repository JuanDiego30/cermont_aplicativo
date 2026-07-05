# DOC-CANON-08 — Plan de Ejecucion por Fases y Testing

**Proyecto:** Cermont S.A.S. — Plataforma documental-operativa
**Version:** v2.1 canónica ampliada para ejecución IA/Codex
**Estado:** SOURCE_OF_TRUTH + ANEXO v2.1 operativo
**Compresion:** DOC-11 + DOC-15 + DOC-17

---

## Parte I — Plan de Ejecucion por Fases

### 0. Fase 0: Fundacion (Semanas 1-2)

**Objetivo:** Monorepo funcional, conexion a BD, login basico.

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 0.1 | Crear estructura de monorepo con npm workspaces | `backend/`, `frontend/`, `packages/` |
| 0.2 | Configurar TypeScript en todos los workspaces | `tsconfig.json` por workspace |
| 0.3 | Configurar Biome (linter + formatter) | `biome.json` |
| 0.4 | Configurar Tailwind CSS v4 en frontend | `tailwind.config.ts` |
| 0.5 | Configurar Docker Compose con MongoDB | `docker-compose.yml` |
| 0.6 | Implementar sistema de variables de entorno con Zod | `env.ts` con validacion |
| 0.7 | Crear gate `npm run verify` | Script en `package.json` |
| 0.8 | Implementar `ApiEnvelope<T>` y `DomainError` | `ApiEnvelope.ts`, `TypedErrors.ts` |
| 0.9 | Documentacion canonica base | Este documento |

#### Gate de salida:
- [ ] `npm run ghost:check` pasa
- [ ] `npm run typecheck` pasa (todos los workspaces)
- [ ] `npm run lint` pasa
- [ ] `npm run verify` pasa
- [ ] MongoDB conecta correctamente

---

### 1. Fase 1: Autenticacion (Semana 3)

**Objetivo:** Usuarios pueden loguearse y acceder segun su rol.

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 1.1 | Schema Mongoose User con roles | `models/User.ts` |
| 1.2 | Endpoint POST /api/auth/login | `routes/auth.routes.ts` |
| 1.3 | Endpoint POST /api/auth/refresh | Refresh token en cookie httpOnly |
| 1.4 | Endpoint POST /api/auth/logout | Invalidacion de tokens |
| 1.5 | Endpoint GET /api/auth/me | Datos del usuario actual |
| 1.6 | Middleware de autenticacion JWT | `auth.middleware.ts` |
| 1.7 | Middleware de RBAC por roles | `requireRole()` |
| 1.8 | Pagina de login en frontend | `app/login/page.tsx` |
| 1.9 | Zustand store de autenticacion | `stores/authStore.ts` |
| 1.10 | Proteccion de rutas frontend | `ProtectedRoute` component |
| 1.11 | Layout con sidebar filtrado por rol | `Sidebar.tsx` |
| 1.12 | Seed de usuarios (6 roles) | `seed/users.seed.ts` |

#### Criterios de aceptacion:
- Login con `gerencia@cermont.co` funciona
- Password se almacena hasheado (bcrypt)
- JWT en cookie httpOnly
- Sidebar muestra solo rutas permitidas por rol
- `/dashboard` redirige a login si no hay sesion
- Logout limpia cookies y estado

#### Gate de salida:
- [ ] Login funciona (backend directo + proxy + UI)
- [ ] RBAC funciona para al menos 2 roles
- [ ] `npm run test` pasa
- [ ] `npm run build` pasa
- [ ] React Doctor >= 95/100

---

### 2. Fase 2: Solicitudes y Propuestas (Semanas 4-5)

**Objetivo:** Flujo completo de solicitud a propuesta aprobada con baseline.

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 2.1 | Schema Zod + Mongoose WorkRequest | `shared-types` + `models/` |
| 2.2 | CRUD WorkRequest (endpoints) | `routes/workRequest.routes.ts` |
| 2.3 | FSM WorkRequest (estados + transiciones) | `services/workRequest.service.ts` |
| 2.4 | Calificacion de solicitudes | `POST /:id/qualify` |
| 2.5 | Schema Zod + Mongoose Proposal | `shared-types` + `models/` |
| 2.6 | CRUD Proposal | `routes/proposal.routes.ts` |
| 2.7 | Baseline de costos en propuesta | `costBaseline: CostLine[]` |
| 2.8 | Aprobacion/rechazo de propuestas | `POST /:id/approve`, `POST /:id/reject` |
| 2.9 | Schema PurchaseOrder | `models/PurchaseOrder.ts` |
| 2.10 | Registro de PO | `POST /proposals/:id/purchase-order` |
| 2.11 | Conversion a orden | `POST /proposals/:id/convert-to-work-order` |
| 2.12 | Pagina de solicitudes (lista) | `app/work-requests/page.tsx` |
| 2.13 | Pagina de detalle de solicitud | `app/work-requests/[id]/page.tsx` |
| 2.14 | Pagina de propuestas | `app/proposals/page.tsx` |
| 2.15 | Seed de solicitudes y propuestas demo | `seed/workRequests.seed.ts` |

#### Criterios de aceptacion:
- Crear solicitud con cliente, sitio, tipo de servicio
- Calificar solicitud (determinar si necesita visita)
- Crear propuesta con baseline de costos
- Aprobar/rechazar propuesta
- Registrar PO
- Convertir a orden
- No convertir sin PO valida
- Variacion de costos se calcula correctamente

#### Gate de salida:
- [ ] Flujo solicitud → propuesta → PO → orden funcional
- [ ] Baseline de costos presente
- [ ] Tests de integracion pasan
- [ ] `npm run verify` pasa

---

### 3. Fase 3: Ordenes y Planeacion (Semanas 6-7)

**Objetivo:** La planeacion es una COMPUERTA OPERATIVA antes de ejecutar.

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 3.1 | Schema WorkOrder con FSM | `models/WorkOrder.ts` |
| 3.2 | CRUD WorkOrder | `routes/workOrder.routes.ts` |
| 3.3 | Schema PlanningPacket | `models/PlanningPacket.ts` |
| 3.4 | Asignacion de crew | `crew: [{ userId, role }]` |
| 3.5 | Lista de materiales | `materials: [{ description, quantity, unit }]` |
| 3.6 | Lista de herramientas/equipos | `tools: [{ toolId, name, required }]` |
| 3.7 | Elementos de seguridad | `safetyElements: [{ element, quantity }]` |
| 3.8 | Adjuntar AST | `astDocumentId` |
| 3.9 | Adjuntar PTW | `ptwDocumentId` |
| 3.10 | Calculo de readiness (blockers) | `calculateReadiness()` |
| 3.11 | Aprobacion de planeacion | `POST /planning-packets/:id/approve` |
| 3.12 | Pagina de detalle de orden | `app/orders/[id]/page.tsx` |
| 3.13 | Pagina de planeacion | `app/orders/[id]/planning/page.tsx` |
| 3.14 | Seed de ordenes y planeaciones demo | `seed/orders.seed.ts` |

#### Criterios de aceptacion:
- Planeacion con crew, materiales, herramientas, equipos
- Readiness se calcula correctamente
- Bloqueadores se muestran claramente
- No se aprueba si hay blockers criticos
- AST y PTW adjuntables
- Certificados vigentes verificados

#### Gate de salida:
- [ ] Planeacion funcional como compuerta
- [ ] Blockers calculados en tiempo real
- [ ] Tests de integracion pasan

---

### 4. Fase 4: Ejecucion y Evidencias (Semanas 8-9)

**Objetivo:** Captura de campo con soporte offline.

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 4.1 | Schema ExecutionSession | `models/ExecutionSession.ts` |
| 4.2 | Iniciar/finalizar ejecucion | `POST /orders/:id/execution/start`, `/finish` |
| 4.3 | Registrar actividades | `activities: [{ description, startedAt, finishedAt }]` |
| 4.4 | Checklist digital | `checklists: [{ item, completed, notes }]` |
| 4.5 | Registrar materiales usados | `materialsUsed: [{ description, quantity, unit }]` |
| 4.6 | Incidentes y novedades | `incidents: [{ description, severity }]` |
| 4.7 | Schema Evidence | `models/Evidence.ts` |
| 4.8 | Upload de evidencias (fotos) | `POST /api/evidences` |
| 4.9 | GPS automatico | `navigator.geolocation` |
| 4.10 | IndexedDB para evidencias offline | `lib/offlineStorage.ts` |
| 4.11 | Outbox para comandos offline | `lib/syncEngine.ts` |
| 4.12 | Sync engine | `SyncEngine.sync()` |
| 4.13 | Pagina de ejecucion | `app/orders/[id]/execution/page.tsx` |
| 4.14 | Pagina de evidencias | `app/orders/[id]/evidences/page.tsx` |
| 4.15 | Galeria de evidencias | `EvidenceGallery.tsx` |
| 4.16 | Componente de firma digital | `SignatureField.tsx` |

#### Criterios de aceptacion:
- Iniciar/finalizar ejecucion con timestamps
- Captura de fotos con caption y GPS
- Firma digital funcional
- Evidencias se guardan offline y sincronizan
- Checklist digital completable
- Materiales usados registrables

#### Gate de salida:
- [ ] Ejecucion funcional online y offline
- [ ] Evidencias se sincronizan correctamente
- [ ] Firma digital captura y guarda

---

### 5. Fase 5: Informes y Actas (Semanas 10-11)

**Objetivo:** Cierre tecnico del trabajo.

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 5.1 | Schema TechnicalReport | `models/TechnicalReport.ts` |
| 5.2 | Generacion de informe desde ejecucion | `POST /orders/:id/reports/generate` |
| 5.3 | Contenido: scope, observaciones, hallazgos | Campos del informe |
| 5.4 | Seleccion de evidencias para informe | `includedEvidences: string[]` |
| 5.5 | Aprobacion de informe | `POST /reports/:id/approve` |
| 5.6 | Schema DeliveryRecord | `models/DeliveryRecord.ts` |
| 5.7 | Generacion de acta desde informe | `POST /orders/:id/delivery-record` |
| 5.8 | Firma del cliente | `SignatureField` + metadata |
| 5.9 | Firma de Cermont | `SignatureField` + metadata |
| 5.10 | Envio de acta al cliente | `POST /delivery-records/:id/send` |
| 5.11 | Pagina de informes | `app/orders/[id]/reports/page.tsx` |
| 5.12 | Pagina de acta | `app/orders/[id]/delivery-record/page.tsx` |

#### Criterios de aceptacion:
- Informe se genera desde datos de ejecucion
- Evidencias seleccionables para inclusion
- Aprobacion de informe desbloquea acta
- Acta con firma de cliente y Cermont
- Firmas son inmutables una vez confirmadas
- Sin informe aprobado no hay acta

#### Gate de salida:
- [ ] Flujo ejecucion → informe → acta funcional
- [ ] Firmas inmutables
- [ ] Tests E2E pasan

---

### 6. Fase 6: Cierre Administrativo (Semanas 12-13)

**Objetivo:** SES → Factura → Pago.

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 6.1 | Schema ServiceEntrySheet | `models/ServiceEntrySheet.ts` |
| 6.2 | Crear SES | `POST /orders/:id/service-entry-sheet` |
| 6.3 | Radicar en Ariba | `POST /ses/:id/submit` |
| 6.4 | Adjuntar soportes | `supportingDocuments: string[]` |
| 6.5 | Aprobar/rechazar SES | `POST /ses/:id/approve`, `/reject` |
| 6.6 | Schema Invoice | `models/Invoice.ts` |
| 6.7 | Crear factura contra SES aprobada | `POST /orders/:id/invoice` |
| 6.8 | Definir montos (configurable) | `subtotal, taxAmount, total` |
| 6.9 | Enviar factura | `POST /invoices/:id/submit` |
| 6.10 | Aprobar/rechazar factura | `POST /invoices/:id/approve`, `/reject` |
| 6.11 | Schema Payment | `models/Payment.ts` |
| 6.12 | Registrar pago | `POST /orders/:id/payments` |
| 6.13 | Conciliar pago | `POST /payments/:id/reconcile` |
| 6.14 | Paginas de billing | `app/billing/*` |

#### Criterios de aceptacion:
- No SES sin acta firmada e informe aprobado
- No factura sin SES aprobada
- No pago sin factura aprobada
- Impuestos configurables (no hardcodeados)
- Montos coinciden con propuesta (variacion documentada)

#### Gate de salida:
- [ ] Pipeline SES → Factura → Pago validado
- [ ] Reglas de negocio criticas funcionan

---

### 7. Fase 7: Dashboard y Costos (Semanas 14-15)

**Objetivo:** Visibilidad operativa y financiera.

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 7.1 | ServiceCase projection | `services/serviceCase.service.ts` |
| 7.2 | Calculo de blockers en tiempo real | `calculateBlockers()` |
| 7.3 | Next actions por rol | `calculateNextActions()` |
| 7.4 | KPIs operativos | Dashboard cards |
| 7.5 | KPIs administrativos | Aging, SES, facturas |
| 7.6 | Variacion de costos | `CostCart` vs `Proposal.baseline` |
| 7.7 | Alertas de certificados vencidos | `checkCertificateAlerts()` |
| 7.8 | Pagina de dashboard | `app/dashboard/page.tsx` |
| 7.9 | Pagina de costos | `app/costs/page.tsx` |

#### Gate de salida:
- [ ] Dashboard muestra datos reales
- [ ] Blockers calculados correctamente
- [ ] Variacion de costos visible

---

### 8. Fase 8: Sistema Documental (Semanas 16-17)

**Objetivo:** Formularios dinamicos desde documentos reales.

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 8.1 | Schema DocumentImport | `models/DocumentImport.ts` |
| 8.2 | Upload de documentos | `POST /api/document-imports` |
| 8.3 | Deteccion de campos | `analyze()` |
| 8.4 | Revision humana | `POST /:id/review` |
| 8.5 | Schema DocumentTemplate | `models/DocumentTemplate.ts` |
| 8.6 | Versionado de plantillas | `versions: [{ version, fields, publishedAt }]` |
| 8.7 | Formulario dinamico | `DynamicForm.tsx` |
| 8.8 | Captura offline de formularios | IndexedDB + sync |
| 8.9 | Generacion de PDF | `POST /api/generated-documents` |
| 8.10 | Seed con formatos reales | Planeacion, inspeccion CCTV, mantenimiento |

---

### 9. Fase 9: Activos y Mantenimiento (Semanas 18-19)

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 9.1 | CRUD Asset | `routes/asset.routes.ts` |
| 9.2 | CRUD Certificate | `routes/certificate.routes.ts` |
| 9.3 | Alertas de vencimiento | Servicio de alertas |
| 9.4 | MaintenancePlan CRUD | `routes/maintenance.routes.ts` |
| 9.5 | MaintenanceTask execution | Completar tarea con checklist |
| 9.6 | Pagina de activos | `app/assets/page.tsx` |
| 9.7 | Pagina de mantenimiento | `app/maintenance/page.tsx` |

---

### 10. Fase 10: PWA y Optimizacion (Semanas 20-21)

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 10.1 | Service Worker completo | `public/sw.js` |
| 10.2 | Estrategias de cache | Cache-first, network-first |
| 10.3 | Background sync | `sync` event |
| 10.4 | Push notifications | `push` event (opcional) |
| 10.5 | Tests E2E de flujos criticos | Playwright o Cypress |
| 10.6 | Optimizacion de performance | Lighthouse >= 90 |
| 10.7 | Despliegue en VPS con Docker | `docker-compose.prod.yml` |

---

### 11. Fase 11: Observabilidad y Monitoreo (Semanas 22-23)

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 11.1 | Logger estructurado (Pino/Winston) | `utils/logger.ts` |
| 11.2 | Middleware de request logging | Log de cada request |
| 11.3 | Metricas de negocio | Contadores por entidad |
| 11.4 | Dashboard de monitoreo | Grafana o similar |
| 11.5 | Alertas configurables | Email/webhook |

---

### 12. Fase 12: Estabilizacion y Entrega (Semanas 24-25)

#### Tareas:

| # | Tarea | Entregable |
|---|---|---|
| 12.1 | Auditoria completa del sistema | Revisar todos los modulos |
| 12.2 | Correccion de bugs | Issues encontrados |
| 12.3 | Documentacion final | Actualizar docs |
| 12.4 | Capacitacion de usuarios | Manual de usuario |
| 12.5 | Pruebas piloto | 5 usuarios, 2 semanas |
| 12.6 | Medicion de KPIs | Reduccion de tiempos, trazabilidad |

---

## Parte II — Estrategia de Testing

### 1. Principios

1. **Contract-First:** Todo endpoint tiene schema Zod → test de contrato → test de endpoint
2. **Vertical Slice:** Cada funcionalidad se valida como slice completo (backend → frontend → E2E)
3. **No Mock Data in Production:** Mocks solo en `*.test.ts`, `tests/**`, `fixtures/**`
4. **Fail Fast:** Errores detectados cerca del origen
5. **Cobertura minima:** 80% de coverage en logica de negocio

### 2. Piramide de Testing

```
         /\
        /  \     E2E (pocos, criticos)
       /----\    ~5-10 flujos completos
      /      \
     /--------\   Integracion (moderados)
    /          \  ~50-100 escenarios
   /------------\
  /              \  Unitarios (muchos)
 /----------------\  ~200-500 tests
/                  \
```

### 3. Testing por Workspace

#### 3.1 Shared Types (`packages/shared-types`)

```typescript
// tests/schemas/workRequest.schema.test.ts
import { describe, it, expect } from "vitest"
import { CreateWorkRequestSchema } from "../../src/schemas/workRequest.schema"

describe("CreateWorkRequestSchema", () => {
  it("valida una solicitud completa", () => {
    const result = CreateWorkRequestSchema.safeParse({
      clientId: "client_123",
      siteId: "site_456",
      requestedBy: "Juan Perez",
      serviceType: "electricidad",
      description: "Instalacion de tablero electrico",
      urgency: "high",
    })
    expect(result.success).toBe(true)
  })

  it("rechaza sin cliente", () => {
    const result = CreateWorkRequestSchema.safeParse({
      siteId: "site_456",
      serviceType: "electricidad",
      description: "Instalacion",
    })
    expect(result.success).toBe(false)
  })

  it("rechaza descripcion corta", () => {
    const result = CreateWorkRequestSchema.safeParse({
      clientId: "client_123",
      siteId: "site_456",
      serviceType: "electricidad",
      description: "Corto",
    })
    expect(result.success).toBe(false)
  })
})
```

#### 3.2 Backend Tests

**Tests de Servicio:**
```typescript
// tests/services/workRequest.service.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { WorkRequestService } from "../../src/services/workRequest.service"

describe("WorkRequestService", () => {
  let service: WorkRequestService

  beforeEach(() => {
    service = new WorkRequestService()
  })

  describe("create", () => {
    it("crea una solicitud con estado draft", async () => {
      const result = await service.create(validInput, mockUser)
      expect(result.status).toBe("draft")
      expect(result.createdBy).toBe(mockUser.id)
    })

    it("genera numero de solicitud unico", async () => {
      const result = await service.create(validInput, mockUser)
      expect(result.requestNumber).toMatch(/^WR-\d{4}-\d{4}$/)
    })
  })

  describe("qualify", () => {
    it("califica una solicitud submitted", async () => {
      const result = await service.qualify(requestId, { findings: "OK", requiresVisit: true }, supervisorUser)
      expect(result.status).toBe("qualified")
    })

    it("rechaza calificar una solicitud cancelada", async () => {
      await expect(
        service.qualify(cancelledRequestId, { findings: "OK" }, supervisorUser)
      ).rejects.toThrow(DomainError)
    })
  })
})
```

**Tests de Integracion (endpoints):**
```typescript
// tests/integration/workRequest.test.ts
import { describe, it, expect } from "vitest"
import request from "supertest"
import { app } from "../../src/index"

describe("WorkRequest Endpoints", () => {
  describe("POST /api/work-requests", () => {
    it("crea una solicitud autenticado", async () => {
      const response = await request(app)
        .post("/api/work-requests")
        .set("Cookie", [authCookie])
        .send(validRequest)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe("draft")
    })

    it("rechaza sin autenticacion", async () => {
      await request(app)
        .post("/api/work-requests")
        .send(validRequest)
        .expect(401)
    })

    it("valida payload con Zod", async () => {
      const response = await request(app)
        .post("/api/work-requests")
        .set("Cookie", [authCookie])
        .send({ invalid: "data" })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe("VALIDATION_FAILED")
    })
  })
})
```

#### 3.3 Frontend Tests

**Tests de Componentes:**
```tsx
// tests/components/LoginForm.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { LoginForm } from "../../src/components/auth/LoginForm"

describe("LoginForm", () => {
  it("muestra error cuando email es invalido", async () => {
    render(<LoginForm onSubmit={vi.fn()} isLoading={false} />)

    fireEvent.change(screen.getByPlaceholderText("usuario@cermont.co"), {
      target: { value: "invalid-email" },
    })
    fireEvent.click(screen.getByText("Ingresar"))

    expect(await screen.findByText(/email invalido/i)).toBeInTheDocument()
  })

  it("deshabilita boton durante carga", () => {
    render(<LoginForm onSubmit={vi.fn()} isLoading={true} />)
    expect(screen.getByText("Ingresando...")).toBeDisabled()
  })
})
```

**Tests de Hooks:**
```typescript
// tests/hooks/useWorkRequests.test.ts
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useWorkRequests } from "../../src/hooks/useWorkRequests"
import { describe, it, expect } from "vitest"

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
)

describe("useWorkRequests", () => {
  it("carga solicitudes exitosamente", async () => {
    const { result } = renderHook(() => useWorkRequests(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toBeDefined()
    expect(Array.isArray(result.current.data?.items)).toBe(true)
  })

  it("maneja error correctamente", async () => {
    // Mock error
    const { result } = renderHook(() => useWorkRequests(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })
})
```

### 4. Tests E2E Criticos

#### Flujo 1: Login y Dashboard
```typescript
// tests/e2e/login-dashboard.spec.ts
import { test, expect } from "@playwright/test"

test("login y navegacion al dashboard", async ({ page }) => {
  await page.goto("http://localhost:3000/login")

  await page.fill("[name=email]", "gerencia@cermont.co")
  await page.fill("[name=password]", "Cermont2026!")
  await page.click("button[type=submit]")

  await page.waitForURL("http://localhost:3000/dashboard")
  await expect(page.locator("text=Dashboard")).toBeVisible()
})
```

#### Flujo 2: Solicitud a Propuesta
```typescript
// tests/e2e/request-to-proposal.spec.ts
test("crear solicitud, calificar y convertir a propuesta", async ({ page }) => {
  // Login
  await login(page)

  // Crear solicitud
  await page.goto("/work-requests/new")
  await page.fill("[name=clientId]", "client_demo")
  await page.fill("[name=siteId]", "site_demo")
  await page.fill("[name=requestedBy]", "Cliente Demo")
  await page.fill("[name=serviceType]", "electricidad")
  await page.fill("[name=description]", "Instalacion de tablero electrico en campo")
  await page.click("button[type=submit]")

  // Verificar solicitud creada
  await expect(page.locator("text=Solicitud creada")).toBeVisible()

  // Calificar
  await page.click("text=Calificar")
  await page.fill("[name=findings]", "Requiere visita tecnica")
  await page.check("[name=requiresVisit]")
  await page.click("text=Guardar")

  // Convertir a propuesta
  await page.click("text=Crear propuesta")
  await page.fill("[name=scope]", "Instalacion completa de tablero")
  await page.fill("[name=estimatedTotal]", "12500000")
  await page.click("text=Crear propuesta")

  await expect(page.locator("text=Propuesta creada")).toBeVisible()
})
```

#### Flujo 3: Pipeline Completo
```typescript
// tests/e2e/full-pipeline.spec.ts
test("flujo completo: solicitud → pago", async ({ page }) => {
  // Este test ejecuta todo el pipeline de 14 pasos
  // Usando datos de seed para acelerar

  await loginAsRole(page, "gerente")

  // 1. Crear solicitud
  const requestId = await createWorkRequest(page, demoData)

  // 2. Calificar
  await qualifyWorkRequest(page, requestId)

  // 3. Crear propuesta con baseline
  const proposalId = await createProposal(page, requestId, { estimatedTotal: 10000000 })

  // 4. Aprobar propuesta
  await approveProposal(page, proposalId)

  // 5. Registrar PO
  await registerPurchaseOrder(page, proposalId, { poNumber: "PO-2026-001", value: 10000000 })

  // 6. Convertir a orden
  const orderId = await convertToWorkOrder(page, proposalId)

  // 7. Crear y aprobar planeacion
  await createPlanningPacket(page, orderId)
  await approvePlanning(page, orderId)

  // 8. Ejecutar
  await startExecution(page, orderId)
  await addEvidence(page, orderId, { type: "during", caption: "Trabajo en progreso" })
  await finishExecution(page, orderId)

  // 9. Generar y aprobar informe
  const reportId = await generateTechnicalReport(page, orderId)
  await approveTechnicalReport(page, reportId)

  // 10. Crear y firmar acta
  const deliveryId = await createDeliveryRecord(page, orderId)
  await signDeliveryRecord(page, deliveryId, { by: "cliente" })
  await signDeliveryRecord(page, deliveryId, { by: "cermont" })

  // 11. SES
  const sesId = await createServiceEntrySheet(page, orderId)
  await approveServiceEntrySheet(page, sesId)

  // 12. Factura
  const invoiceId = await createInvoice(page, orderId, { total: 10000000 })
  await approveInvoice(page, invoiceId)

  // 13. Pago
  await registerPayment(page, invoiceId, { amount: 10000000 })

  // 14. Verificar orden cerrada
  await page.goto(`/orders/${orderId}`)
  await expect(page.locator("text=Cerrado")).toBeVisible()
})
```

### 5. React Doctor (Calidad Frontend)

```bash
npx react-doctor@latest
```

Criterio:
- **Ideal:** 100/100
- **Aceptable temporal:** >= 95/100 con residuales justificados

Issues que no se aceptan:
- Hydration mismatch
- `new Date()` o `Math.random()` en render
- Falta de reduced motion
- `useSearchParams` sin `Suspense`
- Direct fetch en componentes
- Componentes dead o gigantes

### 6. Convenciones de Nombres

```text
# Backend
backend/tests/integration/<module>.test.ts
backend/tests/services/<service>.test.ts
backend/tests/unit/<module>.test.ts

# Frontend
frontend/tests/components/<Component>.test.tsx
frontend/tests/hooks/<hook>.test.ts
frontend/tests/lib/<helper>.test.ts
frontend/tests/e2e/<flow>.spec.ts

# Shared Types
packages/shared-types/tests/schemas/<schema>.test.ts
```

### 7. Datos de Test (Fixtures)

```typescript
// tests/fixtures/users.fixture.ts
export const fixtureUsers = {
  gerente: {
    id: "user_gerente",
    email: "gerente@cermont.co",
    name: "Gerente Demo",
    role: "gerente",
    password: "Cermont2026!",
  },
  administrativo: {
    id: "user_admin",
    email: "administrativo@cermont.co",
    name: "Admin Demo",
    role: "administrativo",
    password: "Cermont2026!",
  },
  supervisor: {
    id: "user_supervisor",
    email: "supervisor@cermont.co",
    name: "Supervisor Demo",
    role: "supervisor",
    password: "Cermont2026!",
  },
  tecnico: {
    id: "user_tecnico",
    email: "tecnico@cermont.co",
    name: "Tecnico Demo",
    role: "tecnico",
    password: "Cermont2026!",
  },
}

// tests/fixtures/workRequests.fixture.ts
export const fixtureWorkRequest = {
  clientId: "client_demo",
  siteId: "site_demo",
  requestedBy: "Cliente Demo",
  requesterEmail: "cliente@empresa.com",
  serviceType: "electricidad",
  description: "Instalacion de tablero electrico en campo petrolero",
  urgency: "high" as const,
}
```

### 8. Cobertura Minima Requerida

| Modulo | Cobertura Minima |
|---|---|
| Auth (login, RBAC) | 95% |
| WorkRequest (FSM) | 90% |
| Proposal (baseline) | 85% |
| WorkOrder (pipeline) | 90% |
| PlanningPacket (readiness) | 85% |
| ExecutionSession | 80% |
| Evidence (offline) | 80% |
| TechnicalReport | 80% |
| DeliveryRecord | 80% |
| ServiceEntrySheet | 85% |
| Invoice | 85% |
| Payment | 85% |
| Cost Engine | 80% |
| Document System | 75% |
| Asset/Certificate | 75% |
| Dashboard | 70% |
---

# ANEXO v2.1 — Cierre de puntos ciegos para agentes IA/Codex

> **Prevalencia normativa:** si alguna sección anterior de este documento contradice este anexo, prevalece el **ANEXO v2.1**.  
> **Propósito:** convertir la documentación canónica en un plano arquitectónico ejecutable, verificable y sin ambigüedades para agentes IA/Codex.  
> **Regla base:** ningún agente puede declarar una función como implementada si no aporta **archivo + endpoint/contrato/componente + prueba + evidencia**.


## 1. Matriz de pruebas por falla CERMONT

| Falla | Unit test | Integración API | Playwright | Evidencia |
|---|---|---|---|---|
| Planeación incompleta | `planning-readiness.test.ts` | `POST /planning/:id/approve` | bloquear ejecución sin AST/PTW | screenshot blocker |
| Evidencias desordenadas | `evidence-category.test.ts` | `POST /evidences/batch` | renombrar/categorizar fotos | galería organizada |
| Informes/actas tardías | `report-generation.test.ts` | `POST /reports/from-execution` | generar informe y acta | PDF/screenshot |
| Cierre/facturación tardía | `billing-chain.test.ts` | SES→factura→pago | bloquear factura sin SES | pipeline cierre |
| Costos sin control | `cost-variance.test.ts` | `GET /costs/service-cases/:id` | ver estimado vs real | dashboard costos |

## 2. E2E obligatorio

Playwright debe demostrar:

1. crear solicitud;
2. crear/abrir caso;
3. ver cockpit 14 pasos;
4. intentar saltar a ejecución sin planeación: bloqueo;
5. subir/seleccionar AST y PTW;
6. aprobar planeación;
7. iniciar ejecución;
8. capturar evidencia offline;
9. renombrar foto;
10. asignar categoría personalizada;
11. sincronizar;
12. generar informe;
13. generar acta;
14. firmar acta;
15. crear SES;
16. aprobar SES;
17. crear factura;
18. aprobar factura;
19. registrar pago;
20. cerrar caso;
21. ver costos estimados vs reales.

## 3. Evidencia por gate

Guardar en:

```text
.sisyphus/evidence/<plan>/
├── contracts-check.txt
├── typecheck.txt
├── lint.txt
├── test.txt
├── build.txt
├── quality-strict.txt
├── verify.txt
├── react-doctor.txt
├── npm-audit.txt
├── curl/
├── playwright/
└── screenshots/
```

## 4. Criterio APROBADO/PARCIAL/BLOQUEADO

| Estado | Condición |
|---|---|
| `APROBADO` | verify + quality + tests + Playwright + evidencia pasan. |
| `PARCIAL` | gates pasan pero falta E2E/evidencia funcional. |
| `BLOQUEADO` | typecheck/lint/build/verify falla o falta dependencia crítica. |
| `RECHAZADO` | se ocultaron errores, se borró funcionalidad o se rompió regla de negocio. |

## 5. QA de seguridad mínimo

- IDOR por entidad.
- RBAC por endpoint.
- subida de archivo con MIME falso.
- tamaño máximo.
- archivo duplicado por hash.
- documento protegido no eliminable.
- pago mayor que factura.
- factura sin SES aprobada.
- SES sin acta firmada.
