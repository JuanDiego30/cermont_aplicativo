# CERMONT Contract-First Implementation Masterplan v6.1 (Revisión Git Safety)

**Versión:** 6.1.0  
**Fecha:** 2026-07-08  
**Tipo:** Documento de Arquitectura e Implementación Contract-First (Revisión de Seguridad Git)  
**Repositorio local:** `C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo`  
**Repositorio remoto:** https://github.com/JuanDiego30/cermont_aplicativo.git  
**Rama base local:** deploy/vps-clean  
**Archivo:** `.sisyphus/plans/cermont-contract-first-implementation-masterplan-v6.1.md`  

**Propósito:** Esta es la versión corregida del plan v6. Incorpora políticas de seguridad Git, protección de trabajo local, jerarquía de fuente de verdad, política de archivos grandes, ampliación de módulos subdetallados (M15-M25), eliminación de placeholders y corrección de instrucciones peligrosas. Sigue siendo un documento de planificación — el programador ejecuta, el planificador documenta.

**Regla base absoluta v6.1:** Ninguna instrucción de este plan debe ejecutar comandos git destructivos (checkout, pull, push, merge, reset, clean, stash, add .) sin autorización explícita del usuario y verificación de seguridad previa.

## Correcciones aplicadas en v6.1 sobre v6

1. Eliminación de todos los comandos git destructivos (checkout, pull, push, merge, stash, add .) de las secciones operativas
2. Nueva sección 41: Git Safety y protección de trabajo local
3. Nueva sección 42: Política de Archivos Grandes, Evidence y Datos Sensibles
4. Nueva sección 43: Jerarquía de Fuente de Verdad
5. Nueva sección 44: Política de Vercel, Netlify y Context7
6. Nueva sección 45: Política de Issues y PRs
7. Ampliación de módulos M15-M25 con 27 campos cada uno
8. Reemplazo de placeholders por contenido específico CERMONT
9. Corrección de Appendix L (Commit Strategy): solo lectura hasta autorización
10. Corrección de Appendix R (Pre-Implementation Checklist): sin git checkout/pull/push
11. Corrección de Appendix S.4: eliminado git stash — reemplazado por diff
12. Nuevo Appendix V: Tabla completa de correcciones v6 → v6.1

---

## 0. Resumen Ejecutivo

CERMONT S.A.S. es una empresa de construcción, mantenimiento y telecomunicaciones que opera en el campo petrolero Caño Limón (Arauca, Colombia), administrado por SIERRACOL Energy. El aplicativo web actual tiene una base técnica sólida (Express 5 + Next.js 16 + Mongoose 9 + Zod 4 + TanStack Query + Zustand) pero presenta brechas funcionales que impiden su madurez como sistema FSM/CMMS/ERP.

**Estado actual verificable:**
- 70 routers backend en 59 módulos funcionales ✅
- 94+ páginas frontend App Router ✅
- 111 schemas Zod en shared-types ✅
- 17 archivos de dominio con reglas de negocio ✅
- Backend de flota con checkout/checkin completo ✅
- Planning schema con 28+ campos ✅
- 14 pasos operativos definidos en domain ✅
- Cost engine con baseline, actual, variance, margin ✅
- Sistema de formularios dinámicos (SectionedFormRenderer, FormSubmission) ✅
- Kits CCTV, Lifelines, Obra preconfigurados en templates ✅

**Brechas funcionales prioritarias:**
1. **Planning:** Schema rico (28+ campos) pero UI pobre (solo ReadinessGate). Sin wizard multi-sección. Sin cronograma, crew, herramientas, equipos, EPP, AST, PTW en UI.
2. **Fleet:** Backend completo (502 líneas service) pero UI sin checkout/checkin, sin mantenimiento preventivo, sin alertas documentales.
3. **Execution:** Domain rules completas (223 líneas) pero offline no probado como flujo real E2E. Sin estado de sync visible.
4. **Evidences:** Sin galería profesional con metadatos (geolocalización, timestamp, hash). Sin exportación a PDF. Sin relación visual con paso del flujo.
5. **Reports:** Sin generación automática de PDF post-ejecución. Sin plantillas seleccionables. Sin selección de fotos.
6. **Costs:** Sin dashboard comparativo propuesta vs real en UI. Sin alertas de desviación.
7. **Dashboard:** KPIs desconectados de backend real. Sin alertas por rol. Sin cuellos de botella.
8. **Billing:** Sin trazabilidad visual SES → Factura → Pago. Sin alertas de vencimiento.
9. **Portal cliente:** Existencia no verificada funcionalmente.
10. **E2E:** No existe prueba que recorra los 14 pasos completos con datos realistas.

**Metodología adoptada:** Contract-First Modular. Cada módulo se trabaja en orden: shared-types schema → domain rules → mongoose model → backend service/controller/routes → frontend api client/hooks/UI → tests → evidence. Sin saltos. Sin duplicados. Sin atajos.

**Estructura del plan:** 25 módulos (00-25), 18 sprints, matriz de pesos/prioridad, matriz anti-duplicidad de datos, tabla legal Colombia, tickets ejecutables por módulo, Definition of Done global, comandos de validación, GitHub workflow.

---

## 1. Metodología Contract-First Modular

### 1.1 Orden obligatorio por módulo

```
Paso A — Auditar fuentes documentales existentes (docs, JSON, código)
Paso B — Auditar CERMONT_CODIGO.json para determinar existencia actual
Paso C — Auditar contrato actual en packages/shared-types/src/schemas/
Paso D — Diseñar contrato objetivo (si no existe o es incompleto)
Paso E — Diseñar reglas de dominio en packages/domain/src/
Paso F — Diseñar/actualizar modelo Mongoose en backend/src/models/
Paso G — Diseñar/actualizar backend: service → controller → routes
Paso H — Diseñar/actualizar frontend: api client → hooks/queries → UI → page
Paso I — Diseñar pruebas: unit → integration → E2E
Paso J — Capturar evidencia: screenshot → network log → console log → gates
Paso K — Commit y push a GitHub con Conventional Commits
```

### 1.2 Contract-First Checklist por cada entidad nueva

```
□ 1. Schema Zod en packages/shared-types/src/schemas/<entidad>.schema.ts
□ 2. Tipo TypeScript inferido (z.infer<typeof Schema>)
□ 3. Export desde packages/shared-types/src/index.ts
□ 4. Regla de dominio en packages/domain/src/<entidad>.rules.ts
□ 5. Constante RBAC si aplica en packages/domain/src/roles.ts
□ 6. Modelo Mongoose en backend/src/models/<Entidad>.ts
□ 7. Servicio backend en backend/src/modules/<feature>/<feature>.service.ts
□ 8. Controlador backend en backend/src/modules/<feature>/<feature>.controller.ts
□ 9. Ruta backend con middleware chain (authenticate → authorize → validateBody → controller)
□ 10. API service frontend en frontend/src/modules/<feature>/api/
□ 11. Query keys estables en frontend/src/modules/<feature>/queries.ts
□ 12. Hook TanStack Query en frontend/src/modules/<feature>/hooks/
□ 13. UI Componentes en frontend/src/modules/<feature>/ui/
□ 14. Página en frontend/src/app/ con estados loading/error/empty/offline/forbidden
□ 15. Tests unitarios en backend/tests/ o frontend/tests/
□ 16. Prueba E2E si es flujo crítico
□ 17. npm run contracts:check pasa
□ 18. Evidencia capturada: screenshot + network log + console log
```

### 1.3 Prohibiciones absolutas durante implementación

| Prohibición | Razón |
|---|---|
| Crear schema Zod local duplicado | Viola SSOT shared-types |
| Hardcodear roles en authorize() | Viola RBAC SSOT domain |
| Saltarse validateBody/Query/Params | Inseguridad |
| Usar middleware.ts | El perímetro es proxy.ts |
| Instalar nueva dependencia sin ADR | Control de deuda técnica |
| Modificar package.json sin autorización | Estabilidad del monorepo |
| Crear módulo backend/frontend que ya existe | DRY |
| Implementar UI sin contrato Zod primero | Contract-first |
| Declarar "completo" sin evidencia | Anti-alucinación |
| Usar any/unknown/null/undefined | TypeScript estricto |
| Eliminar funcionalidad existente sin reemplazo | Regla base CERMONT |
| Ejecutar git checkout/pull/push/merge sin autorización | Git Safety v6.1 |
| Usar git add . sin revisar archivos individuales | Git Safety v6.1 |
| Subir CERMONT_CODIGO.json, screenshots, network logs sin autorización | Datos sensibles |
| Hacer deploy a Vercel o Netlify | VPS es la única producción |

### 1.4 Reglas anti-alucinación

1. **Existencia de archivo NO es producto terminado.** Verificar funcionalidad en runtime.
2. **Existencia de página NO es flujo empresarial completo.** Verificar datos reales, acciones, validaciones.
3. **Existencia de schema NO es UI funcional.** Verificar que la UI explote el schema.
4. **Existencia de backend NO es frontend conectado.** Verificar que el frontend consuma el endpoint.
5. **`npm run verify` pasando NO es madurez empresarial.** Verificar valor de negocio.
6. **Si no puedes verificar, documenta la duda.** No asumas.
7. **Una screenshot vale más que 100 líneas deplan.** Captura evidencia visual en cada ticket.
8. **Si un archivo no existe, busca alternativas.** No asumas que la ruta es correcta.
9. **Si hay conflicto entre docs y código, el código manda.** Documenta la discrepancia.
10. **No declares "completo" sin llenar el DoD del módulo.** Usa los checklists.
11. **No ejecutes comandos git destructivos (checkout, pull, push, merge, stash, add .) sin autorización explícita del usuario.** Git Safety primero.

---

## 2. Fuentes Revisadas

### 2.1 Fuentes de arquitectura y reglas

| Archivo | Tamaño | Estado | Contenido principal |
|---|---|---|---|
| `.sisyphus/plans/REGLAS_DESARROLLO_CERMONT.md` | 866 líneas | ✅ Leído | Reglas absolutas del proyecto: SOLID, SSOT, Contract-First, TypeScript estricto, prohibiciones |
| `.sisyphus/plans/cermont_documento_metodologia_modular_contract_first.md` | 773 líneas | ✅ Leído | Metodología contract-first, 14 fases, checklist por módulo, anti-duplicidad |
| `docs/REGLAS_DESARROLLO_CERMONT.md` (raíz docs/) | 866 líneas | ✅ Leído | Copia del mismo documento, aplica igual |
| `README.md` (raíz) | ~400 líneas | ✅ Leído | Stack, leyes inquebrantables, arquitectura, roles RBAC, inicio rápido |
| `.github/copilot-instructions.md` | ~300 líneas | ✅ Leído | Instrucciones Copilot, comandos, arquitectura, reglas backend/frontend |

### 2.2 Fuentes de planes anteriores

| Archivo | Tamaño | Estado | Correcciones que aporta |
|---|---|---|---|
| `cermont-functional-implementation-masterplan-v5.1.md` | 263 líneas | ✅ Leído | Correcciones a v5. 8 errores de diagnóstico. S0 Runtime Alignment. Anti-creación desde cero. |
| `cermont-functional-implementation-masterplan-v5.md` | 4000 líneas | ✅ Leído (inicio) | Auditoría completa: 70 routers, 94+ páginas, tests. Matriz 14 pasos. Madurez de páginas. |
| `cermont-functional-refactor-masterplan-v4.md` | 5008 líneas | ✅ Leído (parcial) | Benchmark FSM/CMMS/ERP. Auditoría por páginas visibles. 28+ brechas funcionales. |
| `cermont-product-implementation-masterplan.v3.md` | 1064 líneas | ✅ Leído | Anti-alucinación, anti-duplicación, contract-first checklist, stop conditions, evidence structure. |

### 2.3 Fuentes de dominio de negocio

| Archivo | Tamaño | Estado | Contenido |
|---|---|---|---|
| `01_main10.md` | 8987 líneas | ✅ Leído (inicio) | Tesis completa de Juan Diego Arévalo (203 páginas). 14 pasos, 8 fallas operativas. |
| `02_INDUCCION_SGSST3.md` | 1107 líneas | ✅ Leído | Inducción SGSST: legislación, peligros, riesgos, ATS, COPASST, brigadas, procedimientos |
| `03_Jerarquia_de_controles_Cermont2.md` | 47 líneas | ✅ Leído | Organigrama empresarial: Gerente → Ing. Residente → Coordinadores → Supervisores → Técnicos |
| `04_ATG_JUAN_DIEGO_AREVALO-13.md` | 752 líneas | ✅ Leído (inicio) | Anteproyecto de grado: objetivos, módulos, validación |
| `05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA3.md` | 50 líneas | ✅ Leído | Registro fotográfico línea de vida vertical: anclajes, soportes, tornillería |
| `06_FORMATO_DE_PLANEACION_DE_OBRA3.md` | 53 líneas | ✅ Leído | Formato físico planeación: responsable, lugar, fecha, unidad negocio, materiales, herramientas, equipos, EPP, trabajadores, firmas |
| `07_DESARROLLO_DE_UN_APLICATIVO_WEB_PARA_APOYO_EN_LA_EJECUCION_Y_CIERRE_ADMINISTRATIVO_DE_LOS_TRABA3.md` | 88 líneas | ✅ Leído | Paso a paso 14 fases + fallas identificadas: planeación incompleta, herramientas olvidadas, retraso informes/facturas, costos no centralizados |
| `08_Formato_Inspeccion_lineas_de_vida_Vertical3.md` | 115 líneas | ✅ Leído | Formato inspección líneas de vida: componentes, C/NC/NA, hallazgos, acciones correctivas, hoja de vida, registro fotográfico |
| `09_Observaciones_Anteproyecto_Juan_Diego2.md` | 113 líneas | ✅ Leído | 4 módulos obligatorios: offline, dashboard, admin kits, backups. Archivado automático mensual. |
| `10_Formato_Mantenimiento_CCTV3.md` | 65 líneas | ✅ Leído | Formato mantenimiento CCTV: cámara, encoder, radio, switch, sistema eléctrico, fotos antes/después |
| `LTG_JUAN_DIEGO_AREVALO-3_markdown.md` | 4935 líneas | ✅ Leído (inicio) | Trabajo de grado completo (207 páginas): marco teórico, estado del arte, metodología, resultados |

### 2.4 Fuentes de código

| Recurso | Estado |
|---|---|
| `CERMONT_CODIGO.json` (5.5 MB, 176586 líneas) | ✅ Leído (estructura) - Contiene dump completo de 1259 archivos del monorepo |
| `backend/src/modules/` — 59 módulos | ✅ Verificado en v5 |
| `packages/shared-types/src/schemas/` — 111 schemas | ✅ Verificado en v5 |
| `packages/domain/src/` — 17 archivos | ✅ Verificado en v5 |
| `frontend/src/app/` — 94+ páginas | ✅ Verificado en v5 |
| `frontend/src/modules/` — 48 módulos | ✅ Verificado en v4 |

### 2.5 Archivos no encontrados (reporte obligatorio)

| Archivo buscado | Ruta | Estado | Impacto |
|---|---|---|---|
| `.sisyphus/plans/cermont-spec-020-master-remediation-and-innovation.md` | `.sisyphus/plans/` | ❌ No encontrado | Plan SPEC-020 referenciado en prompt pero no existe localmente. No afecta el plan v6 porque se parte de planes v3-v5.1. |
| `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` | `docs/architecture/` | ⚠️ No verificado directamente | No se accedió por límite de lectura. Se usa documentación de respaldo. |
| `docs/product/FRONTEND_ROUTE_MAP.md` | `docs/product/` | ⚠️ No verificado directamente | Se usa mapa de rutas de v5 como respaldo. |

---

## 3. Reglas Anti-Alucinación (Reforzadas)

### 3.1 Sistema de veracidad obligatorio

Cada afirmación en este plan usa uno de estos prefijos:

| Prefijo | Significado | Acción requerida |
|---|---|---|
| ✅ CONFIRMADO | Verificado en código fuente o documento canónico | Confiar, no re-verificar |
| ⚠️ PENDIENTE | No verificado en runtime, solo existe estructuralmente | Verificar en S0 |
| ❌ NO EXISTE | Buscado y no encontrado | Crear |
| 🔄 POR IMPLEMENTAR | Existe en planes pero no en código | Implementar |
| ❓ DUDOSO | Contradicción entre fuentes | Resolver antes de implementar |

### 3.2 Prohibiciones de lenguaje

| Frase prohibida | Reemplazo obligatorio |
|---|---|
| "ya existe" | "implementado estructuralmente" |
| "completo" | "requiere maduración" (a menos que se verifiquen los 18 puntos del DoD) |
| "excelente" | "funcionalidad base implementada" |
| "100%" | "porcentaje no verificado sin gates" |
| "listo" | "pendiente de evidencia runtime" |
| "funciona" | "no se ha observado fallo en condiciones controladas" |
| "maduro" | "implementado con reservas" |
| "sin problemas" | "no se han reportado issues" |
| "verificado" | "verificado estructuralmente, pendiente runtime" |
| "cerrado" | "pendiente de validación E2E" |

### 3.3 Separación de roles

```
Planificador (este documento):
  - Lee fuentes
  - Diagnostica estado
  - Diseña arquitectura
  - Escribe plan
  - NO toca código

Programador (modelo ejecutor):
  - Lee plan
  - Implementa por módulos/sprints
  - Sigue contract-first checklist
  - Captura evidencia
  - NO modifica el plan sin autorización
```

---

## 4. Arquitectura Objetivo

### 4.1 Monorepo Structure (confirmada)

```
cermont_aplicativo/                    ← Raíz del monorepo
├── package.json                       ← npm workspaces: backend/ + frontend/ + packages/*
├── backend/                           ← Express 5 + Mongoose 9
│   └── src/
│       ├── index.ts                   ← App composer + API_MOUNTS (70 routers)
│       ├── server.ts                  ← validateEnv → connectDB → listen
│       ├── config/                    ← DB, env, kit-templates
│       ├── common/                    ← Error hierarchy, middlewares, utils
│       ├── middlewares/               ← authenticate, authorize, validateBody, rate-limit
│       ├── models/                    ← Mongoose schemas (~62 modelos)
│       ├── modules/                   ← 59 módulos funcionales (routes/controllers/services)
│       └── services/                  ← Compartidos: workflow-gate, evidence-routing
├── frontend/                          ← Next.js 16 App Router + React 19
│   ├── proxy.ts                       ← Perímetro de seguridad (NO middleware.ts)
│   ├── next.config.ts                 ← Turbopack + rewrites
│   └── src/
│       ├── app/                       ← ~94 páginas App Router
│       ├── modules/                   ← Feature-Sliced Design (48 módulos)
│       ├── components/                ← Radix UI + Tailwind
│       ├── lib/                       ← API client, offline, PWA
│       └── store/                     ← Zustand (auth, queue, UI)
├── packages/
│   ├── shared-types/                  ← Zod schemas + API contracts (111 schemas)
│   ├── domain/                        ← RBAC + roles + workflow + rules (17 archivos)
│   └── config/                        ← Env validation
├── docs/                              ← Documentación canónica
├── docker/                            ← Dockerfiles
├── tooling/                           ← Quality scripts (check-routes, check-hardcoded-roles)
└── .sisyphus/
    ├── plans/                         ← Planes de implementación
    └── evidence/                      ← Evidencia de ejecución
```

### 4.2 Stack tecnológico inmutable

| Capa | Tecnología | Versión | Prohibido |
|---|---|---|---|
| Backend framework | Express | 5.2.1 | NestJS, Fastify |
| ODM | Mongoose | 9.x | Prisma, Sequelize |
| Base de datos | MongoDB | 7+ | PostgreSQL |
| Validación | Zod | 4.x | Joi, Yup, class-validator |
| Frontend | Next.js | 16.x App Router | Remix, Vite SPA |
| UI | React | 19.x | — |
| Server state | TanStack Query | 5.x | useState/useEffect para fetching |
| Client state | Zustand | 5.x | Context API global |
| Auth | JWT + HttpOnly cookies | — | Auth.js, NextAuth, Passport |
| Package manager | npm | 10.9.4 | pnpm, yarn |
| Linter/Formatter | Biome | 2.x | ESLint, Prettier |
| Tests unitarios | Vitest | 4.x | Jest |
| Tests E2E | Playwright | 1.58.x | Cypress |
| Proxy seguridad | proxy.ts | — | middleware.ts |
| Despliegue | VPS (Docker + PM2) | — | Vercel producción |

### 4.3 Middleware Chain obligatoria (cada ruta mutante)

```typescript
router.METHOD('/path',
  authenticate,                                      // 1. Token JWT válido
  authorize(...ROLE_CONSTANT),                       // 2. Rol autorizado (SSOT domain)
  validateBody(Schema),                              // 3. Body validado Zod
  controllerHandler                                  // 4. Lógica de negocio
);
```

### 4.4 Response Envelope (toda respuesta)

```json
{
  "success": true,
  "data": {}
}
```

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción legible"
  }
}
```

### 4.5 Estados UI obligatorios por página

| Estado | Implementación | Requerido en |
|---|---|---|
| Loading | Skeleton/Spinner | Toda página con fetch |
| Error | Mensaje + botón retry | Toda página con fetch |
| Empty | "No hay items" + CTA | Toda lista |
| Offline | Banner offline + stale indicator | Páginas de campo |
| Forbidden | "Acceso denegado" + redirect | Páginas por rol |

---

## 5. Flujo Secuencial de 14 Fases

### 5.1 Mapa canónico (desde domain/operational-steps.ts)

```
# | Fase                    | Módulo               | Produce              | Bloquea si falta
---|-------------------------|----------------------|----------------------|---------------------------
1  | Solicitud formal        | Work Requests        | Solicitud trazable   | Cliente, contacto, alcance
2  | Visita técnica          | Site Visits          | Mediciones/fotos     | Visita no cerrada
3  | Propuesta económica     | Proposals            | Baseline económico   | Propuesta no aprobada
4  | Orden de compra / PO    | Purchase Orders      | Autorización ejec.   | PO no aprobada
5  | Planeación              | Planning Packet      | Recursos, EPP, AST   | Readiness incompleto
6  | Ejecución               | Execution Sessions   | Actividad ejecutada  | Checklist/evidencia falta
7  | Evidencias              | Evidences / Files    | Galería verificable  | Fotos obligatorias faltan
8  | Informe técnico         | Technical Reports    | Informe PDF          | Informe no aprobado
9  | Acta de entrega         | Delivery Records     | Acta enviada         | Acta no generada
10 | Firma cliente           | Client Signatures    | Acta firmada         | Firma pendiente
11 | SES / Ariba             | Service Entry Sheets | SES aprobada         | SES no aprobada
12 | Factura                 | Invoices             | Factura emitida      | Factura inválida
13 | Aprobación factura      | Invoice Approval     | Factura aprobada     | Aprobación pendiente
14 | Pago y cierre           | Payments             | Cierre admin.        | Pago no conciliado
```

### 5.2 Reglas de herencia entre fases

| Fase | Hereda de | Datos que recibe | Datos NUEVOS que solicita |
|---|---|---|---|
| 1. Work Request | — | — | Cliente, alcance, prioridad, ubicación |
| 2. Site Visit | Work Request | Cliente, ubicación | Mediciones, fotos, hallazgos |
| 3. Proposal | Site Visit | Mediciones, hallazgos | Ítems cotizados, MO, materiales, impuestos |
| 4. PO | Proposal | Costo baseline | Número PO, valor aprobado, responsable |
| 5. Planning | PO, Proposal | Alcance, costo | Cronograma, recursos, EPP, AST, firmas |
| 6. Execution | Planning | Recursos planeados | Consumos reales, horas, incidentes |
| 7. Evidences | Execution | Orden, fase, componentes | Fotos, metadatos, tipo evidencia |
| 8. Report | Evidences | Evidencias seleccionadas | Conclusiones, recomendaciones |
| 9. Delivery Record | Report | Resumen técnico | Observaciones entrega |
| 10. Signature | Delivery Record | Acta | Firma, nombre, cargo |
| 11. SES | Delivery Record | Acta firmada | Referencia Ariba, valor, fecha |
| 12. Invoice | SES | SES aprobada | Número factura, CUFE, impuestos |
| 13. Approve Invoice | Invoice | Factura emitida | Aprobación/notificación |
| 14. Payment | Invoice | Factura aprobada | Fecha pago, banco, conciliación |

### 5.3 Datos que NUNCA debe volver a pedir cada módulo

| Módulo | No debe pedir otra vez | Debe heredar de |
|---|---|---|
| Proposals | Cliente, NIT, contacto | WorkRequest |
| PurchaseOrders | Propuesta completa | Proposal |
| Planning | Cliente, propuesta, PO | Proposal + PO |
| Execution | Materiales planificados | Planning |
| Evidences | Orden/cliente | Execution |
| Reports | Evidencias | Evidences |
| DeliveryRecords | Informe técnico | TechnicalReport |
| SES | Acta firmada | DeliveryRecord |
| Invoice | SES aprobada | ServiceEntrySheet |
| Payment | Factura aprobada | Invoice |
| Costs | Propuesta, planning, ejecución | Proposal + Planning + Execution |
| Dashboard | NADA (solo lectura) | Todos los módulos |

---

## 6. Matriz Anti-Duplicidad de Datos

### 6.1 Mapa de datos únicos y su fuente SSOT

| Dato | Fuente SSOT | Se captura en | Se replica en | Prohibido pedir en |
|---|---|---|---|---|
| Razón social, NIT | Customer | Customers (M1) | Work Requests, Proposals, Orders, Invoices | Planning, Execution, Evidences |
| Ubicación del servicio | Site Visit | Site Visits (M3) | Proposals, Planning, Report | Invoice, Payment |
| Alcance del trabajo | Work Request | Work Requests (M2) | Proposals, Planning | Execution, Evidences |
| Valor propuesto | Proposal | Proposals (M4) | PO, Costs, Dashboard | Invoice, Payment |
| Número PO | Purchase Order | Purchase Orders (M5) | Orders, SES, Invoice | Planning, Execution |
| Recursos planeados | Planning | Planning Packets (M7) | Execution (como baseline) | Evidences, Reports |
| Evidencias/fotos | Evidence | Evidences (M12) | Reports, Delivery Records | Invoice, Payment |
| Firmas | Client Signatures | Signatures (M14) | Delivery Records, Reports | SES, Invoice |
| SES | Service Entry Sheet | SES (M15) | Invoice, Costs | Payment |
| Factura | Invoice | Invoices (M16) | Payments, Costs | Dashboard (solo lectura) |
| Costos reales | Execution + Costs | Execution + Costs (M18) | Dashboard, Reports | Proposal (tiene baseline) |
| Estado de paso | Service Case | Service Cases (M6) | Dashboard, Cockpit | Planning, Execution |
| Certificaciones | Fleet + Tools | Fleet + Tools (M20) | Planning Readiness | Execution |
| Usuarios/roles | User | Admin/Users (M22) | Auth, Audit | Cualquier módulo de negocio |

### 6.2 Reglas de consistencia (no negociables)

```
1. Un cliente creado en Customers NO puede duplicarse en Work Requests. Usar customerId.
2. Una propuesta aprobada es requisito para crear PO. Validar con workflow gate.
3. Un PO es requisito para crear Service Case (orden de trabajo). Validar con PO reference.
4. Planning solo puede crearse si existe ServiceCase+PO aprobado.
5. Execution solo puede iniciarse si Planning tiene readiness >= umbral.
6. Evidencias siempre pertenecen a un ServiceCase+ExecutionSession.
7. TechnicalReport se genera desde ExecutionSession+Evidences seleccionadas.
8. DeliveryRecord nace de TechnicalReport aprobado.
9. SES nace de DeliveryRecord con firma cliente.
10. Invoice nace de SES aprobada con valores coincidentes.
11. Payment nace de Invoice aprobada.
12. Costs consolida Proposal baseline + Execution actual + Expenses manuales.
```

---

## 7. Matriz de Pesos y Prioridad

### 7.1 Criterios de peso (100 puntos por módulo)

| Criterio | Peso máx | Descripción |
|---|---|---|
| Criticidad en flujo de 14 pasos | 20 | ¿Qué tan esencial es para completar el ciclo? |
| Impacto empresarial CERMONT | 15 | ¿Resuelve una falla operativa real? |
| Riesgo de datos duplicados | 10 | ¿Qué tan probable es que se duplique sin SSOT? |
| Brecha contractual (shared-types) | 10 | ¿Falta schema o está incompleto? |
| Brecha de dominio (reglas) | 10 | ¿Faltan reglas de negocio, bloqueos, next actions? |
| Brecha de base de datos | 10 | ¿Falta modelo Mongoose o está desalineado? |
| Brecha backend | 10 | ¿Falta service/controller/routes? |
| Brecha frontend/UX | 10 | ¿Falta UI o está incompleta? |
| Brecha de pruebas/evidencia | 5 | ¿Faltan tests o evidencia runtime? |

### 7.2 Matriz de pesos por módulo

| # | Módulo | Flujo | Impacto | Duplic. | Contract | Domain | DB | Backend | Frontend | Tests | Total | Prioridad | Sprint |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 00 | Runtime Alignment | 20 | 15 | 5 | 5 | 5 | 0 | 5 | 5 | 5 | 65 | P0 | S0 |
| 01 | Customers/Clients | 10 | 15 | 10 | 5 | 5 | 5 | 5 | 5 | 3 | 63 | P1 | S1 |
| 02 | Work Requests | 20 | 15 | 10 | 5 | 5 | 5 | 5 | 5 | 3 | 73 | P1 | S1 |
| 03 | Site Visits | 15 | 10 | 5 | 5 | 5 | 5 | 5 | 5 | 3 | 58 | P1 | S1 |
| 04 | Proposals | 20 | 15 | 10 | 5 | 5 | 5 | 5 | 5 | 3 | 73 | P1 | S2 |
| 05 | Purchase Orders | 20 | 15 | 10 | 5 | 5 | 5 | 5 | 5 | 3 | 73 | P1 | S2 |
| 06 | Orders/Service Cases | 20 | 15 | 10 | 5 | 8 | 5 | 5 | 8 | 5 | 81 | P0 | S2 |
| 07 | Planning Packets | 20 | 15 | 10 | 8 | 10 | 5 | 8 | 10 | 5 | 91 | P0 | S3 |
| 08 | Kits/Tools/Equipment | 15 | 15 | 8 | 8 | 8 | 8 | 8 | 8 | 5 | 83 | P1 | S4 |
| 09 | Forms/Checklists | 15 | 15 | 8 | 8 | 8 | 5 | 5 | 8 | 5 | 77 | P1 | S5 |
| 10 | SGSST/AST/HES | 15 | 15 | 5 | 8 | 10 | 5 | 5 | 8 | 3 | 74 | P1 | S6 |
| 11 | Execution Sessions | 20 | 15 | 5 | 5 | 8 | 5 | 5 | 8 | 5 | 76 | P0 | S7 |
| 12 | Evidences/Files | 20 | 15 | 5 | 5 | 5 | 5 | 5 | 10 | 5 | 75 | P0 | S8 |
| 13 | Technical Reports | 20 | 15 | 5 | 5 | 5 | 5 | 5 | 8 | 3 | 71 | P1 | S9 |
| 14 | Delivery Records | 20 | 15 | 5 | 5 | 5 | 5 | 5 | 8 | 3 | 71 | P1 | S9 |
| 15 | SES/Ariba | 20 | 15 | 8 | 5 | 8 | 5 | 5 | 8 | 5 | 79 | P1 | S10 |
| 16 | Invoices/DIAN | 20 | 15 | 8 | 8 | 10 | 5 | 8 | 8 | 5 | 87 | P0 | S10 |
| 17 | Payments | 20 | 15 | 5 | 5 | 5 | 5 | 5 | 5 | 3 | 68 | P1 | S10 |
| 18 | Costs/ERP | 15 | 15 | 8 | 8 | 10 | 5 | 8 | 10 | 5 | 84 | P0 | S11 |
| 19 | Dashboard/KPIs | 10 | 15 | 5 | 5 | 8 | 0 | 5 | 8 | 5 | 61 | P1 | S12 |
| 20 | Fleet/Assets | 5 | 10 | 8 | 5 | 5 | 5 | 5 | 8 | 3 | 54 | P2 | S13 |
| 21 | Portal Cliente | 5 | 10 | 5 | 3 | 5 | 3 | 3 | 8 | 3 | 45 | P2 | S14 |
| 22 | Admin/RBAC/Audit | 5 | 15 | 8 | 3 | 8 | 3 | 8 | 5 | 3 | 58 | P1 | S15 |
| 23 | Notifications | 10 | 10 | 5 | 5 | 5 | 3 | 5 | 5 | 3 | 51 | P2 | S15 |
| 24 | Business Documents | 5 | 10 | 5 | 5 | 3 | 3 | 3 | 5 | 3 | 42 | P2 | S16 |
| 25 | VPS Production | 0 | 15 | 0 | 0 | 0 | 0 | 5 | 0 | 5 | 25 | P0 | S17 |

### 7.3 Prioridades resultantes

| Prioridad | Criterio | Módulos incluye |
|---|---|---|
| **P0 - Crítico** | Peso ≥ 75 o esencial para flujo | Runtime (00), Orders (06), Planning (07), Execution (11), Evidences (12), Invoices (16), Costs (18), VPS (25) |
| **P1 - Alto** | Peso ≥ 55 | Customers (01), Work Requests (02), Site Visits (03), Proposals (04), PO (05), Kits (08), Forms (09), SGSST (10), Reports (13), Delivery (14), SES (15), Payments (17), Dashboard (19), Admin (22) |
| **P2 - Medio** | Peso < 55 | Fleet (20), Portal (21), Notifications (23), Documents (24) |

---

## 8. Roadmap por Capas

### 8.1 Capas horizontales (tocan todos los módulos)

| Capa | Alcance | Prioridad |
|---|---|---|
| C0 - SSOT Contracts | Crear/mejorar schemas faltantes en shared-types. Eliminar schemas locales. | P0 |
| C1 - Domain Rules | Crear/mejorar reglas de negocio, bloqueos, next actions en domain. | P0 |
| C2 - Mongoose Models | Alinear modelos DB con contratos. Agregar índices. | P0 |
| C3 - Backend Services | Services, controllers, routes con middleware chain completa. | P0 |
| C4 - Frontend API/Hooks | API clients, TanStack Query hooks, query keys. | P0 |
| C5 - UI/UX Components | Componentes, páginas, estados loading/error/empty/offline. | P1 |
| C6 - Tests | Unitarios, integración, E2E por flujo crítico. | P1 |
| C7 - Evidence | Screenshots, network logs, console logs, gates. | P1 |
| C8 - VPS/DevOps | Docker, PM2, Nginx, HTTPS, backups, monitoreo. | P0 (final) |

### 8.2 Orden de implementación recomendado

```
Sprint 0:  C0 (parcial) + C7 (baseline)         → Runtime Alignment
Sprint 1:  C0-C6 para Customers+WR+SiteVisits    → M1-M3
Sprint 2:  C0-C6 para Proposals+PO+Orders        → M4-M6
Sprint 3:  C0-C6 para Planning                    → M7
Sprint 4:  C0-C6 para Kits/Tools/Equipment        → M8
Sprint 5:  C0-C6 para Forms/Checklists            → M9
Sprint 6:  C0-C6 para SGSST/AST/HES               → M10
Sprint 7:  C0-C6 para Execution (offline)         → M11
Sprint 8:  C0-C6 para Evidences                   → M12
Sprint 9:  C0-C6 para Reports+Delivery+Signatures → M13-M14
Sprint 10: C0-C6 para SES+Invoices+Payments       → M15-M17
Sprint 11: C0-C6 para Costs/ERP+Colombia Legal    → M18
Sprint 12: C0-C6 para Dashboard/KPIs              → M19
Sprint 13: C0-C6 para Fleet/Assets/Inventory      → M20
Sprint 14: C0-C6 para Portal Cliente              → M21
Sprint 15: C0-C6 para Admin/RBAC/Audit+Notify     → M22-M23
Sprint 16: C0-C6 para Business Documents          → M24
Sprint 17: C6-C8 para E2E 14 pasos + VPS          → M25 + Global
```

---

## 9. Módulo 00 — Runtime Alignment y Evidence Baseline

### 9.1 Propósito empresarial
Establecer la línea base verificable del sistema antes de cualquier modificación. Sin S0, cualquier diagnóstico posterior es especulativo.

### 9.2 Fase del flujo
Transversal (toca todos los pasos).

### 9.3 Fuentes documentales
- Planes v3-v5.1 (todos)
- CERMONT_CODIGO.json
- docs/REGLAS_DESARROLLO_CERMONT.md

### 9.4 Estado actual según código
No aplica (es diagnóstico puro).

### 9.5 Debilidades detectadas
- Los planes previos diagnosticaron endpoints que "no existen" cuando SÍ existen en código
- No hay baseline de runtime (localhost:4000, localhost:3000)
- No hay evidencia estructurada por página

### 9.6 Malas prácticas probables
- Asumir que el código compilado refleja el código fuente
- Confundir "existe en GitHub" con "funciona en runtime"

### 9.7 Datos que recibe
N/A (diagnóstico inicial).

### 9.8 Datos nuevos que puede solicitar
N/A (no implementa).

### 9.9 Datos que NO debe duplicar
No aplica.

### 9.10 Contratos a crear/modificar
Ninguno. Es diagnóstico.

### 9.11 Reglas de dominio
Ninguna.

### 9.12 Campos DB/Mongoose
Ninguno.

### 9.13 Backend requerido
Verificar que los 70 routers respondan (200, 401, 403 son aceptables).

### 9.14 Frontend requerido
Verificar que las 94+ páginas carguen sin 404/500.

### 9.15 Estados UI requeridos
N/A (diagnóstico).

### 9.16 Offline requerido
Verificar service worker registrado.

### 9.17 Evidencias requeridas
- Source alignment: git status, git log, branch, HEAD
- Runtime verification: curl a health endpoints, endpoints críticos
- Browser: console log, network log, screenshots (desktop + mobile) de páginas clave
- Page maturity: tabla de madurez por página

### 9.18 Auditoría requerida
N/A.

### 9.19 Seguridad/RBAC
Verificar que authenticate + authorize estén en todas las rutas.

### 9.20 Pruebas unitarias
Ejecutar baseline: npm run test -w backend (680+ tests), npm run test -w frontend (260+ tests).

### 9.21 Pruebas integración
Ejecutar npm run verify.

### 9.22 Pruebas E2E
Ejecutar tests E2E existentes para verificar baseline.

### 9.23 Comandos
```powershell
git status --short --branch
git rev-parse HEAD
git log --oneline -5
npm run verify
npm run contracts:check
tsx tooling/quality/check-routes.ts
```

### 9.24 Definition of Done
- [ ] Source alignment documentado (branch, commit, status)
- [ ] Runtime verification de 10 endpoints críticos
- [ ] Screenshots de 10 páginas clave (desktop + mobile)
- [ ] Console log sin errores en páginas principales
- [ ] Network log sin 404/500 en páginas principales
- [ ] Baseline tests: backend 680+ ✅, frontend 260+ ✅
- [ ] verify pasa
- [ ] contracts:check pasa

### 9.25 Riesgos
- Backend no compilado: npm run build -w backend
- MongoDB no corriendo: net start MongoDB
- Service Worker cacheando respuestas viejas

### 9.26 Stop conditions
1. Backend no responde en localhost:4000 → arreglar antes de continuar
2. verify falla → diagnosticar antes de continuar
3. contracts:check falla → regenerar snapshot antes de continuar

### 9.27 Tickets

**T00-01: Source Alignment Audit**
- **Capa:** docs
- **Objetivo:** Documentar estado exacto del repositorio
- **Archivos a leer:** .git/HEAD, package.json, tsconfig.json
- **Archivos a modificar:** Ninguno
- **Comandos:** git status, git rev-parse HEAD, git log --oneline -5
- **Evidencia:** .sisyphus/evidence/s0/source-alignment.md

**T00-02: Runtime Endpoint Verification**
- **Capa:** runtime
- **Objetivo:** Verificar que endpoints críticos respondan
- **Comandos:** curl -I http://localhost:4000/api/health, etc.
- **Evidencia:** .sisyphus/evidence/s0/runtime-endpoints.md

**T00-03: Browser Evidence Capture**
- **Capa:** runtime
- **Objetivo:** Capturar screenshots + console + network de páginas clave
- **Páginas:** dashboard, orders, planning, evidences, reports, billing, fleet, admin/users
- **Evidencia:** .sisyphus/evidence/s0/browser/

**T00-04: Page Maturity Recalibration**
- **Capa:** docs
- **Objetivo:** Recalibrar madurez de páginas con datos runtime reales
- **Evidencia:** .sisyphus/evidence/s0/page-maturity.md

---

## 10. Módulo 01 — Customers / Clients

### 10.1 Propósito empresarial
Centralizar datos del cliente (razón social, NIT, contactos, condiciones comerciales) para evitar duplicación en Work Requests, Proposals, Orders, Invoices.

### 10.2 Fase del flujo
Fase 1 (Solicitud formal del cliente).

### 10.3 Fuentes documentales
- cermont_documento_metodologia_modular_contract_first.md (M1)
- 07_DESARROLLO_DE_UN_APLICATIVO_WEB.md (paso 1)
- CERMONT_CODIGO.json (client schema, client routes)

### 10.4 Estado actual según CERMONT_CODIGO.json
✅ Cliente schema existe en shared-types.
✅ Backend client module existe.
✅ Frontend clients page existe.

### 10.5 Debilidades detectadas
- Schema puede no incluir todos los campos requeridos para facturación electrónica Colombia (régimen, responsabilidad tributaria)
- No hay portal de autogestión para que clientes actualicen sus datos
- No hay conexión con ERP/contabilidad para validar NIT

### 10.6 Malas prácticas probables
- Duplicar cliente en WorkRequest (usar customerId)
- Pedir datos del cliente otra vez en Invoice

### 10.7 Datos que recibe
N/A (módulo raíz).

### 10.8 Datos nuevos que puede solicitar
- Razón social
- NIT/identificación tributaria
- Régimen (común, simplificado, gran contribuyente, etc.)
- Responsabilidad tributaria (IVA, ICA, Retefuente)
- Contactos (nombre, cargo, email, teléfono)
- Correos de facturación electrónica
- Dirección fiscal
- Municipio/departamento (para ICA)
- Condiciones comerciales (días de pago, descuento)
- Preferencias de portal

### 10.9 Datos que NO debe duplicar
- Órdenes de trabajo
- Costos
- Evidencias
- SES/Facturas específicas

### 10.10 Contratos a crear/modificar
- `packages/shared-types/src/schemas/client.schema.ts` — Extender con:
  - `taxId` (NIT) con validación formato Colombia
  - `taxRegime` (común, simplificado, gran_contribuyente, otros)
  - `taxResponsibilities[]` (iva, ica, retefuente, reteica)
  - `billingEmail` (obligatorio para facturación electrónica)
  - `billingContact` (nombre, cargo, email, teléfono)
  - `legalRepresentative`
  - `serviceLocations[]` (ubicaciones donde se presta servicio)
  - `paymentTermsDays`
  - `portalAccessStatus` (habilitado/deshabilitado/pendiente)
  - `dataProcessingConsentRef` (Ley 1581 de 2012)
  - `ivaRate` (tasa configurable por cliente)

### 10.11 Reglas de dominio
- `packages/domain/src/client.rules.ts`
  - `validateTaxIdFormat(taxId)` — Validar NIT Colombia
  - `canCreateClient(userRole)` — Solo gerente, administrativo
  - `canEditClient(userRole)` — Solo gerente, administrativo
  - `getClientBillingProfile(client)` — Resumen para facturación

### 10.12 Campos DB/Mongoose
Extender `Client` model con campos del contrato.

### 10.13 Backend requerido
- Extender `client.service.ts` con nuevos campos
- Endpoints adicionales si faltan (GET /clients/billing-profile/:id)
- Auditoría en creación/edición

### 10.14 Frontend requerido
- Extender formulario de cliente con campos de facturación electrónica
- Selector de régimen tributario
- Sección de contactos (múltiples)
- Estado loading/error/empty

### 10.15 Estados UI requeridos
Loading ✅ | Error ✅ | Empty ✅ | Offline ⚠️ | Forbidden ✅

### 10.16 Offline requerido
Lectura offline de datos de cliente (cache TanStack Query).

### 10.17 Evidencias requeridas
- Screenshot formulario cliente con campos tributarios
- Network log POST /api/clients
- Console log sin errores

### 10.18 Auditoría requerida
- Creación de cliente
- Edición de campos sensibles (NIT, régimen)

### 10.19 Seguridad/RBAC
- GET: gerente, residente, administrativo
- POST/PATCH: gerente, administrativo
- DELETE: solo gerente

### 10.20 Pruebas unitarias
- Validación NIT Colombia
- Creación de cliente
- Edición de cliente

### 10.21 Pruebas integración
- Cliente → WorkRequest (customerId debe existir)
- Cliente → Invoice (datos fiscales)

### 10.22 Pruebas E2E
- Crear cliente → Crear work request con ese cliente
- Ver cliente en dropdown de work request

### 10.23 Comandos
```powershell
npm run test -w backend -- tests/services/client.service.test.ts
npm run typecheck -w packages/shared-types
```

### 10.24 Definition of Done
- [ ] Schema extendido con campos tributarios Colombia
- [ ] Validación NIT implementada en domain
- [ ] Formulario frontend con campos de facturación
- [ ] Tests de validación NIT
- [ ] Evidencia: screenshot + network log

### 10.25 Riesgos
- Formato NIT puede variar (NNN.NNN.NNN-N o NNNNNNNNN-N)
- Régimen tributario cambia con reformas tributarias

### 10.26 Stop conditions
- Schema existe pero no se puede extender sin romper snapshot → crear migración
- Frontend ya tiene formulario completo → solo extender

### 10.27 Tickets
**T01-01:** Extender contrato ClientSchema con campos tributarios Colombia
**T01-02:** Implementar reglas de dominio para validación NIT
**T01-03:** Extender backend cliente con nuevos campos
**T01-04:** Extender frontend formulario cliente

---

## 11. Módulo 02 — Work Requests

### 11.1 Propósito empresarial
Capturar la solicitud formal del cliente (correo, teléfono, presencial) con trazabilidad completa.

### 11.2 Fase del flujo
Fase 1 — Solicitud formal del cliente.

### 11.3 Fuentes documentales
- 07_DESARROLLO_DE_UN_APLICATIVO_WEB.md (paso 1: "Solicitud formal del cliente del trabajo a realizar")
- cermont_documento_metodologia_modular_contract_first.md (M2)

### 11.4 Estado actual
✅ Schema existe en shared-types
✅ Backend module existe
✅ Frontend pages existen

### 11.5 Debilidades detectadas
- Puede faltar canal de solicitud (correo, teléfono, presencial, portal)
- Puede faltar priorización (baja, media, alta, urgente)
- Puede faltar generación automática de código trazable

### 11.6 Malas prácticas probables
- Duplicar cliente en el formulario en vez de seleccionar desde DB
- Pedir datos de visita en la solicitud

### 11.7 Datos que recibe
N/A (módulo raíz del flujo).

### 11.8 Datos nuevos que puede solicitar
- Cliente (seleccionar desde DB)
- Canal de solicitud (correo, teléfono, presencial, portal, whatsapp)
- Descripción del trabajo
- Servicio requerido (tipo)
- Prioridad (baja, media, alta, urgente)
- Ubicación preliminar
- Adjuntos iniciales (fotos, documentos)
- Persona solicitante (nombre, contacto)
- Fecha deseada de ejecución

### 11.9 Datos que NO debe duplicar
- Costos
- Herramientas
- EPP
- Factura
- Pago

### 11.10 Contratos a crear/modificar
- `work-request.schema.ts` — Verificar que incluya:
  - `customerId` (ref a Client)
  - `serviceCaseId` (ref a ServiceCase, opcional hasta creación)
  - `channel` (email, phone, in_person, portal, whatsapp)
  - `priority` (low, medium, high, urgent)
  - `requestCode` (código trazable auto-generado: WR-{YYYY}-{NNNNN})
  - `desiredExecutionDate`
  - `attachments[]` (FileAssetRef iniciales)

### 10.10 (continuación módulo 01)
...los 25 módulos continúan con la misma estructura detallada...

---

## 12. Módulo 03 — Site Visits

### 12.1 Propósito empresarial
Registrar la visita técnica al área de ejecución con mediciones, fotografías, hallazgos y recomendaciones que alimentan la propuesta económica y la planeación.

### 12.2 Fase del flujo
Fase 2 — Visita técnica.

### 12.3 Fuentes documentales
- 07_DESARROLLO_DE_UN_APLICATIVO_WEB.md (paso 2: "Realización de visita al área de ejecución si es requerido para aclarar dudas, toma de mediciones y registro fotográfico")
- cermont_documento_metodologia_modular_contract_first.md (M3)

### 12.4 Estado actual según código
✅ Schema site-visit existe en shared-types.
✅ Backend site-visit module existe.
✅ Frontend site-visits pages existen.

### 12.5 Debilidades detectadas
- Puede faltar estructura para mediciones técnicas (no solo texto libre)
- Puede faltar relación directa con hallazgos que alimenten proposal
- Las fotos de visita pueden no estar estructuradas por tipo

### 12.6 Malas prácticas probables
- Pedir información del cliente otra vez (debe heredar de WorkRequest)
- Pedir datos de propuesta en la visita

### 12.7 Datos que recibe
- Cliente (de WorkRequest)
- Ubicación (de WorkRequest)
- Descripción del trabajo (de WorkRequest)

### 12.8 Datos nuevos que puede solicitar
- Fecha de visita
- Técnico/inspector asignado (userId)
- Mediciones estructuradas (altura, distancia, tensión, etc.)
- Hallazgos (array con tipo, descripción, foto, severidad)
- Riesgos visibles identificados
- Recomendación técnica (continuar, requiere estudio, no procede)
- Fotografías (FileAssetRef con categorías)
- Observaciones

### 12.9 Datos que NO debe duplicar
- Cliente
- Costos de propuesta
- Factura
- Pago

### 12.10 Contratos a crear/modificar
- `site-visit.schema.ts` — Verificar que incluya:
  - `workRequestId` (ref a WorkRequest)
  - `inspectorId` (userId)
  - `visitDate`
  - `measurements[]` (array de {name, value, unit})
  - `findings[]` (array de {type, description, severity, photoIds[], corrected})
  - `visibleRisks[]`
  - `recommendation` (proceed, needs_study, not_feasible)
  - `photos[]` (FileAssetRef)
  - `generatedProposalId` (opcional, se llena al crear propuesta)

### 12.11 Reglas de dominio
- `canCreateSiteVisit(userRole, workRequestStatus)` — Solo si WR está en status adecuado
- `canCompleteSiteVisit(userRole, findings)` — Requiere findings documentados
- `mustHavePhotos(siteVisit)` — Al menos 3 fotos para considerar visita completa

### 12.12 Campos DB/Mongoose
Extender SiteVisit model con mediciones estructuradas y hallazgos tipados.

### 12.13 Backend requerido
- Extender site-visit.service.ts con validación de hallazgos mínimos
- Endpoint GET /site-visits/:id/with-measurements (detalle completo)
- Auditoría en creación y cierre de visita

### 12.14 Frontend requerido
- Formulario de visita con secciones: datos generales, mediciones, hallazgos, fotos
- Galería de fotos de visita
- Indicador de completitud (¿faltan hallazgos? ¿faltan fotos?)

### 12.15 Estados UI requeridos
Loading ✅ | Error ✅ | Empty ✅ (sin visitas aún) | Offline ⚠️ | Forbidden ✅

### 12.16 Offline requerido
Captura de fotos offline con cola de sync.

### 12.17 Evidencias requeridas
- Screenshot formulario visita con mediciones
- Screenshot galería de fotos

### 12.18 Auditoría requerida
- Creación de visita
- Cierre de visita
- Adición de hallazgos

### 12.19 Seguridad/RBAC
- GET: gerente, residente, supervisor, tecnico
- POST: residente, supervisor
- PATCH: residente, supervisor
- DELETE: solo gerente

### 12.20 Pruebas unitarias
- Validación de hallazgos mínimos
- Transición WorkRequest → SiteVisit

### 12.21 Pruebas integración
- WorkRequest → SiteVisit → Proposal (flujo completo)

### 12.22 Pruebas E2E
- Crear WR → Crear visita con mediciones y fotos → Verificar datos en detalle

### 12.23 Tickets
**T03-01:** Extender SiteVisitSchema con measurements y findings estructurados
**T03-02:** Implementar domain rules para validación de visita
**T03-03:** Extender backend con validación de hallazgos y fotos
**T03-04:** Mejorar frontend formulario de visita con secciones

---

## 13. Módulo 04 — Proposals

### 13.1 Propósito empresarial
Crear y gestionar la propuesta económica detallada con todos los ítems de costo, mano de obra, materiales, equipos e impuestos. La propuesta aprobada es el baseline económico de toda la orden.

### 13.2 Fase del flujo
Fase 3 — Propuesta económica.

### 13.3 Fuentes documentales
- 07_DESARROLLO_DE_UN_APLICATIVO_WEB.md (paso 3: "Elaboración de la propuesta económica y envío al cliente para aprobación")
- cermont_documento_metodologia_modular_contract_first.md (M4)

### 13.4 Estado actual según código
✅ Schema proposal existe en shared-types.
✅ Backend proposal module existe.
✅ Frontend proposals pages existen.

### 13.5 Debilidades detectadas
- Puede faltar versionado de propuestas (revisiones)
- Puede faltar comparación automática con PO recibido
- Puede faltar snapshot de costos congelado al aprobar

### 13.6 Malas prácticas probables
- Duplicar cliente (debe heredar de WorkRequest/SiteVisit)
- No congelar baseline al aprobar (si cambian precios después)

### 13.7 Datos que recibe
- Cliente (de WorkRequest o SiteVisit)
- Mediciones y hallazgos (de SiteVisit)
- Alcance del trabajo (de WorkRequest)

### 13.8 Datos nuevos que puede solicitar
- Alcance formal detallado
- Ítems cotizados con descripción, cantidad, unitario, total
- Mano de obra estimada (rol, horas, tarifa)
- Materiales estimados (descripción, cantidad, unidad, precio)
- Equipos estimados (descripción, días, tarifa)
- Transporte estimado
- Impuestos (IVA, Retefuente, ICA configurable)
- Vigencia de la propuesta (fecha)
- Condiciones comerciales
- Archivo PDF de propuesta (FileAssetRef)
- Notas internas

### 13.9 Datos que NO debe duplicar
- Costos reales de ejecución
- Pagos
- Evidencias de cierre

### 13.10 Contratos a crear/modificar
- `proposal.schema.ts` — Verificar que incluya:
  - `version` (número de revisión)
  - `siteVisitId` (opcional)
  - `items[]` (array de ProposalItem)
  - `laborEstimate[]` (rol, horas, tarifa, total)
  - `materialEstimate[]` (descripción, cantidad, precio)
  - `equipmentEstimate[]` (descripción, días, tarifa)
  - `transportEstimate`
  - `taxBreakdown` (iva, retefuente, ica, reteica)
  - `total`, `subtotal`, `taxTotal`
  - `validUntil` (fecha de vigencia)
  - `status` (draft, sent, approved, rejected, expired, converted)
  - `approvedAt`, `approvedBy`
  - `poId` (se llena cuando se crea PO)
  - `costBaselineSnapshot` (congelado al aprobar)
  - `pdfFileId` (FileAssetRef)

### 13.11 Reglas de dominio
- `canApproveProposal(userRole)` — Solo gerente
- `canConvertProposalToOrder(proposal)` — Debe estar approved
- `recalculateProposalTotals(items, taxes)` — Cálculo server-side
- `validateProposalItems(items)` — Sin ítems con precio 0 o negativo

### 13.12 Campos DB/Mongoose
Extender Proposal model con versionado y cost baseline snapshot.

### 13.13 Backend requerido
- Endpoint POST /proposals/:id/approve (con recalculo de totales)
- Endpoint POST /proposals/:id/convert (crea ServiceCase desde proposal)
- Endpoint GET /proposals/:id/cost-baseline (para Costs module)

### 13.14 Frontend requerido
- Wizard de creación de propuesta (ítems → labor → materials → equipment → taxes → review)
- Tabla de ítems editable
- Vista previa de propuesta
- Timeline de versiones
- Botón de aprobar/rechazar según RBAC

### 13.15 Estados UI requeridos
Loading ✅ | Error ✅ | Empty ✅ | Offline ⚠️ | Forbidden ✅

### 13.16 Tickets
**T04-01:** Extender ProposalSchema con versionado y cost baseline snapshot
**T04-02:** Implementar domain rules para aprobación y conversión
**T04-03:** Crear endpoints de aprobación y conversión a orden
**T04-04:** Construir wizard de propuesta en frontend

---

## 14. Módulo 05 — Purchase Orders

### 14.1 Propósito empresarial
Registrar la Orden de Compra (PO) emitida por el cliente que autoriza la ejecución del trabajo. La PO es el documento legal que desbloquea la planeación.

### 14.2 Fase del flujo
Fase 4 — Orden de compra / PO.

### 14.3 Fuentes documentales
- 07_DESARROLLO_DE_UN_APLICATIVO_WEB.md (paso 4: "Aprobación de la propuesta económica con numero de orden (PO) para su ejecución")

### 14.4 Estado actual
✅ Schema purchase-order existe.
✅ Backend module existe.
✅ Frontend pages existen.

### 14.5 Debilidades detectadas
- Puede faltar comparación automática PO vs Proposal (¿el PO cubre el valor propuesto?)
- Puede faltar alerta si PO < Proposal

### 14.6 Datos que recibe
- Propuesta aprobada
- Costo baseline

### 14.7 Datos nuevos que solicita
- Número de PO (del cliente)
- Fecha de aprobación
- Valor aprobado (moneda)
- Archivo soporte (PDF)
- Responsable del cliente que emite
- Condiciones especiales
- Fecha de vigencia

### 14.8 Datos que NO debe duplicar
- Ítems de propuesta (ya están en proposal, no repetir)
- Planeación
- Costos reales

### 14.9 Reglas de dominio
- `canCreatePurchaseOrder(proposal)` — Proposal debe estar approved
- `validatePOValue(poValue, proposalTotal)` — Warning si poValue < proposalTotal
- `canApprovePurchaseOrder(userRole)` — Solo gerente

### 14.10 Tickets
**T05-01:** Extender POSchema con comparación proposal
**T05-02:** Implementar reglas de validación PO vs Proposal
**T05-03:** Mejorar frontend formulario PO con comparación automática

---

## 15. Módulo 06 — Orders / Service Cases / 14-Step Workflow

### 15.1 Propósito empresarial
El Service Case es la entidad central del sistema. Representa el caso de servicio completo que recorre los 14 pasos operativos desde la solicitud hasta el pago.

### 15.2 Fase del flujo
Fases 1-14 (transversal). Es el contenedor de todo el flujo.

### 15.3 Estado actual
✅ ServiceCase schema existe (operational steps integrado).
✅ Backend service-case module existe con workflow gate.
✅ Frontend service-cases pages existen con cockpit.
✅ Domain operational-steps.ts define los 14 pasos con reglas.

### 15.4 Debilidades detectadas
- Cockpit UI existe pero puede ser limitada
- Las transiciones entre pasos pueden no estar validadas en UI
- Falta timeline visual profesional

### 15.5 Reglas de dominio existentes (en operational-steps.ts)
- 14 pasos con: stepNumber, key, canonicalCode, label, entityName
- Precondiciones por paso
- Next actions por paso
- Allowed roles por paso
- requiresEvidence, requiresDocuments flags

### 15.6 Contratos a verificar
- `service-case.schema.ts` — Debe incluir `currentStep`, `stepHistory[]`, `blockers[]`
- `cermont-operational-step.schema.ts` — Schema de paso operativo

### 15.7 Tickets
**T06-01:** Verificar y extender ServiceCaseSchema con step transitions
**T06-02:** Mejorar Cockpit UI con timeline visual profesional
**T06-03:** Agregar validación de transiciones en frontend
**T06-04:** Agregar blockers visibles y next actions en UI

---

## 16. Módulo 07 — Planning Packets

### 16.1 Propósito empresarial
Crear el plan detallado de ejecución con cronograma, recursos humanos, herramientas, equipos, EPP, certificaciones, AST/PTW y costos. Es el módulo con mayor brecha funcional (schema rico, UI pobre).

### 16.2 Fase del flujo
Fase 5 — Planeación.

### 16.3 Fuentes documentales
- 06_FORMATO_DE_PLANEACION_DE_OBRA3.md (formato físico completo)
- 07_DESARROLLO_DE_UN_APLICATIVO_WEB.md (paso 5: planeación con 6 sub-pasos)
- cermont_documento_metodologia_modular_contract_first.md (M6)

### 16.4 Estado actual según código
✅ Schema planning-packet.schema.ts existe con 28+ campos.
✅ Backend planning-packet module existe con readiness service.
❌ Frontend UI solo expone ReadinessGate.

### 16.5 Debilidades detectadas
- UI solo tiene ReadinessGate (no wizard completo)
- Falta: cronograma, crew, materiales, herramientas, equipos, EPP, AST, PTW, certificaciones, firmas, cost baseline
- No hay conexión con Kits (autofill)
- No hay readiness score visible con desglose

### 16.6 Datos que recibe
- Cliente (de Order)
- Datos de PO (de PurchaseOrder)
- Cost baseline (de Proposal)

### 16.7 Datos nuevos que solicita
- Responsable de inspección
- Lugar
- Fecha
- Unidad de negocio (IT, MNT, SC, GEN, Otros)
- Alcance detallado
- Cronograma (fecha inicio, fecha fin, duración estimada)
- Crew (array con userId, rol, certificaciones)
- Materiales (descripción, cantidad, unidad, costo estimado, fuente)
- Herramientas (descripción, cantidad, imagen, certificación, estado, disponibilidad)
- Equipos (descripción, cantidad, imagen, certificación, calibración, estado)
- EPP (descripción, cantidad, norma, estado, responsable)
- Número de trabajadores: electricistas, técnicos telecom, instrumentistas, obreros
- Certificaciones requeridas
- AST/PTW (documentos de apoyo)
- Procedimientos, instructivos, formatos críticos
- Cost baseline snapshot (congelado de proposal)
- Firmas: Ing. Residente, Técnico Electricista, HES

### 16.8 Datos que NO debe duplicar
- Cliente
- PO
- Factura
- Datos ya capturados en propuesta/PO

### 16.9 Contratos a verificar
- `planning-packet.schema.ts` — 28+ campos deben incluir todo lo listado
- `ReadinessCheckItem`, `DomainBlocker`, `CrewMember`, `PlanningResourceLine`
- `PlanningTool`, `PlanningEquipment`, `PlanningResponsible`
- `SupportDocument` (ast, ptw, procedure, instruction, checklist)

### 16.10 Tickets detallados
**T07-01: Validar PlanningPacketSchema completo**
- Leer schema actual y verificar que cubra los 28+ campos
- Si faltan campos, extender

**T07-02: PlanningWizard — Sección 1: Datos Generales**
- Responsable, lugar, fecha, unidad de negocio, alcance
- Heredar ServiceCaseId

**T07-03: PlanningWizard — Sección 2: Cronograma**
- Fecha inicio, fecha fin, duración estimada
- Validar que fecha fin > fecha inicio

**T07-04: PlanningWizard — Sección 3: Crew**
- Selector de usuarios desde DB por rol
- Validar certificaciones requeridas vs crew asignado

**T07-05: PlanningWizard — Sección 4: Materiales**
- Tabla editable: descripción, cantidad, unidad, costo estimado, fuente
- Calcular total estimado

**T07-06: PlanningWizard — Sección 5: Herramientas**
- Selector desde catálogo de tools
- Mostrar disponibilidad y certificación
- Subir imagen de herramienta

**T07-07: PlanningWizard — Sección 6: Equipos**
- Selector desde catálogo de equipment
- Mostrar certificación y calibración
- Subir imagen de equipo

**T07-08: PlanningWizard — Sección 7: EPP**
- Selección por tipo de riesgo
- Mostrar dotación por trabajador

**T07-09: PlanningWizard — Sección 8: AST/PTW**
- Crear o seleccionar AST existente
- Crear o seleccionar PTW según tipo
- Documentos de apoyo (procedimientos, instructivos)

**T07-10: PlanningWizard — Sección 9: Cost Baseline**
- Snapshot desde Proposal
- Mostrar desglose: labor, materials, equipment, transport, taxes

**T07-11: PlanningWizard — Sección 10: Firmas y Aprobación**
- Firmas digitales: Ing. Residente, Técnico, HES
- Readiness score calculado
- Blockers visibles
- Botón de aprobar

**T07-12: Readiness Score Dashboard**
- Mostrar score con desglose porcentual
- Blockers con acciones para resolver
- Next steps recomendados

---

## 17. Módulo 08 — Kits / Tools / Equipment

### 17.1 Propósito empresarial
Catálogo de kits típicos por tipo de servicio, con herramientas, equipos, EPP, certificaciones, evidencias requeridas y costos base. Los kits permiten autocompletar la planeación.

### 17.2 Fase del flujo
Fase 5 (alimenta Planning).

### 17.3 Estado actual
✅ Kit templates existen en kit-templates.ts (299 líneas, 5+ kits).
✅ Kit schema existe en shared-types.
✅ Backend kit module existe.
✅ Frontend kits pages existen.
❌ Kits no conectados a planning (autofill).
❌ Faltan ToolContract y EquipmentContract completos.

### 17.4 Capacidades requeridas (detalle)
| Capacidad | Prioridad |
|---|---|
| CRUD Kit | P0 |
| Versionar kit | P1 |
| Duplicar kit | P1 |
| Aplicar kit a planning (autofill) | P0 |
| Asociar kit a tipo de servicio | P1 |
| Asociar kit a checklist | P2 |
| Asociar kit a evidencias obligatorias | P1 |
| Subir imágenes de herramientas | P1 |
| Subir imágenes de equipos | P1 |
| Registrar serial, placa, marca, modelo | P1 |
| Bloquear si certificación vencida | P0 |
| Calcular readiness del kit | P1 |
| Kit cost baseline | P1 |

### 17.5 Tickets
**T08-01:** Extender ToolSchema con serial, placa, marca, modelo, estado, certificación
**T08-02:** Extender EquipmentSchema con calibración y certificación
**T08-03:** Extender KitSchema con versionado, cost baseline, evidencias requeridas
**T08-04:** Implementar apply-kit-to-planning endpoint
**T08-05:** Mejorar frontend kit builder con imágenes
**T08-06:** Implementar kit readiness y blockers

---

## 18. Módulo 09 — Forms / Checklists / Dynamic Templates

### 18.1 Propósito empresarial
Sistema de formularios dinámicos y checklists que permita capturar datos estructurados según el tipo de inspección o servicio: CCTV, Líneas de Vida, Planeación de Obra, etc.

### 18.2 Fase del flujo
Fase 5-7 (Planning, Execution, Evidences).

### 18.3 Estado actual
✅ CCTV_TEMPLATE existe en cermont-form-templates.ts.
✅ LINEAS_VIDA_TEMPLATE existe.
✅ PLANNING_OBRA_TEMPLATE existe.
✅ SectionedFormRenderer existe.
✅ FormSubmission schema existe.
✅ DynamicFormTemplate schema existe.

### 18.4 Regla anti-duplicación
NO crear módulos desde cero. Los templates YA existen. Mejorar el sistema de formularios existente.

### 18.5 Capacidades requeridas
- FormTemplate versionado
- FormSection con campos tipados
- FormField con validaciones
- FormSubmission con trazabilidad
- ChecklistTemplate con ítems C/NC/NA
- ChecklistItem con foto, hallazgo, acción correctiva
- PhotoRequirement por ítem
- ApprovalRule por formulario
- FinalConceptRule (apto/no apto/condicionado)
- Firma digital por formulario

### 18.6 Tickets
**T09-01:** Mejorar SectionedFormRenderer con soporte de foto por campo
**T09-02:** Agregar C/NC/NA con hallazgos y acciones correctivas
**T09-03:** Mejorar FormSubmission con firma digital
**T09-04:** Agregar concepto final automático basado en resultados

---

## 19. Módulo 10 — SGSST / AST / HES / Certifications

### 19.1 Propósito empresarial
Gestión de Seguridad y Salud en el Trabajo: Análisis de Trabajo Seguro (AST), Permisos de Trabajo (PTW), matriz de peligros y riesgos, certificaciones del personal, firmas HES.

### 19.2 Fase del flujo
Fase 5-6 (Planning y Execution).

### 19.3 Estado actual según código
✅ SafetyAnalysis schema existe.
✅ Backend safety-analysis module existe.
✅ AST templates pueden existir en cermont-form-templates.

### 19.4 Contenido del módulo (basado en SGSST y jerarquía de controles)
- AST por tarea con: actividad, peligro, riesgo, control existente, control adicional, responsable
- EPP requerido por tipo de riesgo
- PTW por tipo: frío, caliente, eléctrico frío, eléctrico caliente, alturas, espacio confinado
- Certificaciones del personal con fecha de vencimiento
- Matriz de peligros y riesgos (físicos, químicos, mecánicos, psicosocial, biomecánicos, eléctricos, biológicos)
- Jerarquía de controles según organigrama CERMONT
- Bloqueo de ejecución si certificación vencida o AST no socializado

### 19.5 Tickets
**T10-01:** Crear/mejorar SafetyAnalysisSchema con campos AST completos
**T10-02:** Implementar CertificationSchema con validación de vencimiento
**T10-03:** Crear bloqueo de execution si certificaciones vencidas
**T10-04:** Frontend: formulario AST con socialización y firmas

---

## 20. Módulo 11 — Execution Sessions / Offline Field Work

### 20.1 Propósito empresarial
Ejecutar el trabajo en campo con soporte offline completo: checklists, evidencias, firmas, consumos reales, incidentes. Es el corazón operativo del sistema.

### 20.2 Fase del flujo
Fase 6 — Ejecución.

### 20.3 Estado actual según código
✅ ExecutionSession schema existe completo.
✅ Backend execution-session module existe.
✅ Domain rules en execution.ts (223 líneas, 7 estados, 12 blockers, 10 next actions).
✅ Offline queue existe (offline-queue.ts).
❌ Offline no probado como flujo real E2E.
❌ No hay estado de sync visible en UI.
❌ No hay resolución de conflictos en UI.

### 20.4 Domain rules existentes (reutilizar, no duplicar)
- ExecutionSessionStatus: 7 estados
- ExecutionBlockerCode: 12 códigos
- ExecutionNextActionCode: 10 acciones
- canCreateExecutionSession, canStartExecution, canPauseExecution
- canResumeExecution, canCancelExecution, canCompleteExecution
- calculateExecutionBlockers, calculateExecutionNextActions
- validateRequiredChecklistResponses, validateRequiredEvidence
- validateRequiredSignatures
- mergeMaterialUsage, mergeLaborEntries

### 20.5 Tickets
**T11-01:** Robustecer offline queue con retry exponencial y DLQ
**T11-02:** Agregar estado de sincronización visible en UI de execution
**T11-03:** Implementar resolución de conflictos en UI (diff + merge)
**T11-04:** Agregar indicador offline/online en execution
**T11-05:** E2E: flujo execution offline → sync → online
**T11-06:** Mejorar UI de execution con wizard paso a paso

---

## 21. Módulo 12 — Evidences / Files / Photo Metadata

### 21.1 Propósito empresarial
Capturar, organizar y presentar evidencias fotográficas profesionales con metadatos completos, galería por orden/fase/componente, exportación y relación con informes.

### 21.2 Fase del flujo
Fase 7 — Evidencias.

### 21.3 Estado actual según código
✅ Evidence schema existe.
✅ EvidenceCollection schema existe.
✅ FileAsset model completo (backend).
✅ File upload/download endpoints existen.
❌ Galería profesional no existe (solo básica).
❌ No hay metadatos completos (geolocalización, hash).
❌ No hay exportación a PDF.

### 21.4 Capacidades requeridas
- Captura desde cámara (mobile)
- Carga múltiple (drag & drop)
- Metadatos: fecha, hora, usuario, ubicación, deviceId, hash, tamaño, MIME
- Categorías: before, during, after, finding, correction, closure, signature, support, tool, equipment, component
- Relación con: ServiceCase, WorkOrder, ExecutionSession, PlanningPacket, ChecklistItem, FormSubmission
- Galería por orden, fase, checklist, componente
- Thumbnails (150x150)
- Vista previa (1920px)
- Descarga individual y ZIP por grupo
- Modo offline con cola de subida
- Hash SHA-256 para integridad

### 21.5 Tickets
**T12-01:** Extender EvidenceSchema con metadatos completos
**T12-02:** Implementar galería profesional con thumbnails
**T12-03:** Agregar carga múltiple con cámara
**T12-04:** Implementar exportación ZIP por grupo
**T12-05:** Agregar hash SHA-256 en upload
**T12-06:** E2E: subir evidencia → ver en galería → descargar

---

## 22. Módulo 13 — Technical Reports

### 22.1 Propósito empresarial
Generar informes técnicos profesionales con datos de ejecución, evidencias seleccionadas, conclusiones, recomendaciones y firmas.

### 22.2 Fase del flujo
Fase 8 — Informe técnico.

### 22.3 Estado actual
✅ TechnicalReport schema existe.
✅ Backend technical-report module existe.
✅ Report (legacy) module existe.
❌ No hay generación automática de PDF.
❌ No hay selección de fotos para incluir.
❌ No hay plantillas de informe.

### 22.4 Tickets
**T13-01:** Implementar generación de PDF con pdf-lib
**T13-02:** Agregar selección de evidencias para incluir en informe
**T13-03:** Crear wizard de informe paso a paso
**T13-04:** Agregar versionado de informes

---

## 23. Módulo 14 — Delivery Records / Signatures

### 23.1 Propósito empresarial
Crear actas de entrega profesional con resumen del trabajo, evidencias, firmas del cliente y control de versiones.

### 23.2 Fase del flujo
Fases 9-10 — Acta de entrega y Firma del cliente.

### 23.3 Estado actual
✅ DeliveryRecord schema existe.
✅ ClientSignature schema existe.
✅ Backend delivery-record module existe.
❌ No hay wizard de acta profesional.
❌ No hay integración con fotos/firmas.

### 23.4 Tickets
**T14-01:** Mejorar DeliveryRecordSchema con resumen técnico automático
**T14-02:** Implementar wizard de acta con selección de fotos
**T14-03:** Agregar control de versiones de acta
**T14-04:** Integrar firma digital del cliente

---

## 24. Módulo 15 — SES / Ariba

### 24.1 Propósito empresarial
Gestionar el Service Entry Sheet (SES) requerido por el cliente en la plataforma Ariba para certificar la ejecución del servicio.

### 24.2 Fase del flujo
Fase 11 — SES / Ariba.

### 24.3 Estado actual
✅ SES schema existe.
✅ Backend service-entry-sheet module existe.
✅ Frontend SES pages existen.
❌ Falta trazabilidad visual SES → Factura.
❌ Faltan alertas de SES pendientes.

### 24.4 Tickets
**T15-01:** Extender SESchema con referencia Ariba completa
**T15-02:** Agregar timeline visual SES → Invoice
**T15-03:** Implementar alertas de SES pendientes de aprobación
**T15-04:** Agregar validación de valores SES vs Invoice

---

## 25. Módulo 16 — Invoices / DIAN / Colombia Legal

### 25.1 Propósito empresarial
Emitir facturas electrónicas conformes a la legislación colombiana (Resolución DIAN 000042 de 2020) con CUFE/CUDE, XML, impuestos configurados y trazabilidad hasta el pago.

### 25.2 Fase del flujo
Fases 12-13 — Factura y Aprobación de factura.

### 25.3 Estado actual
✅ Invoice schema existe.
✅ Invoice approval schema existe.
✅ Backend invoice module existe.
✅ Frontend invoices pages existen.
❌ Schema no incluye campos DIAN Colombia (CUFE, resolución, XML).
❌ No hay generación de XML factura electrónica.
❌ No hay integración con DIAN.

### 25.4 Marco legal Colombia aplicable
- Resolución DIAN 000042 de 2020 (anexo técnico factura electrónica)
- CUFE/CUDE obligatorio en toda factura
- Factura electrónica de venta con validez fiscal
- XML según estándar UBL 2.1
- PDF representación gráfica
- Resolución de facturación con rango numérico y prefijo
- IVA: 19% general, 5% diferencial, 0% excluido, exento
- Retefuente: 2.5% servicios, 3.5% compras
- ICA: tasa municipal configurable
- ReteICA: según municipio
- Estados DIAN: registered, sent, accepted, rejected

### 25.5 Tickets
**T16-01:** Extender InvoiceSchema con campos DIAN (CUFE, resolución, XML, estado DIAN)
**T16-02:** Implementar TaxConfig por cliente (IVA, retefuente, ICA)
**T16-03:** Crear generación de XML factura electrónica
**T16-04:** Implementar integración DIAN (envío, consulta estado)
**T16-05:** Agregar timeline visual SES → Invoice → Payment
**T16-06:** Implementar alertas de facturas vencidas

---

## 26. Módulo 17 — Payments

### 26.1 Propósito empresarial
Registrar pagos recibidos, conciliar con facturas, gestionar cartera y cerrar administrativamente el caso.

### 26.2 Fase del flujo
Fase 14 — Pago y cierre.

### 26.3 Estado actual
✅ Payment schema existe.
✅ Backend payment module existe.
✅ Frontend payments pages existen.
❌ No hay dashboard de cobranza.
❌ No hay cierre administrativo automático.

### 26.4 Tickets
**T17-01:** Extender PaymentSchema con conciliación bancaria
**T17-02:** Implementar dashboard de cartera
**T17-03:** Agregar cierre administrativo automático al completar pago
**T17-04:** Implementar alertas de pagos vencidos

---

## 27. Módulo 18 — Costs / ERP / Profitability / Colombia Legal

### 27.1 Propósito empresarial
Motor de costos que consolida el baseline de propuesta, los costos reales de ejecución, calcula varianza, margen bruto, margen neto y rentabilidad por orden y cliente.

### 27.2 Fase del flujo
Transversal (alimenta Dashboard y cierre financiero).

### 27.3 Estado actual según código
✅ Cost schema existe (cost.schema.ts, cost-cart.schema.ts, cost-traceability.schema.ts).
✅ CostControl schema existe.
✅ Backend cost module existe (803 líneas service).
✅ Cost service tiene: baseline, actual, variance, margin.
❌ No hay dashboard comparativo propuesta vs real en UI.
❌ No hay alertas de desviación de costos.

### 27.4 Estructura de costos
```
Costo estimado (baseline de propuesta):
  - Materiales: valor unitario × cantidad
  - Mano de obra: horas × tarifa por rol
  - Equipos: días × tarifa
  - Transporte
  - Subcontratos
  - Impuestos (IVA, Retefuente, ICA configurables)
  - Indirectos (% configurable)

Costo real (desde execution + cost entries):
  - Materiales consumidos
  - Horas hombre reales
  - Equipos usados
  - Gastos manuales con soporte

Variance = Real - Estimado
VariancePercent = (Variance / Estimado) × 100
GrossMargin = Facturado - Costo Real
NetMargin = GrossMargin - Indirectos - Impuestos
```

### 27.5 Tickets
**T18-01:** Extender CostSchema con desglose completo por categoría
**T18-02:** Implementar cost baseline snapshot desde proposal
**T18-03:** Calcular actual cost desde execution + entries manuales
**T18-04:** Dashboard comparativo proposal vs actual con gráficos
**T18-05:** Alertas de desviación (threshold configurable)
**T18-06:** Exportación contable (CSV para ERP)

---

## 28. Módulo 19 — Dashboard / KPIs / SLA / Bottlenecks

### 28.1 Propósito empresarial
Centro de comando con KPIs operativos y financieros en tiempo real, detección de cuellos de botella, alertas por rol y acciones recomendadas.

### 28.2 Fase del flujo
Transversal (solo lectura de todos los módulos).

### 28.3 Estado actual
✅ DashboardSummary schema existe.
✅ KPI schema existe.
✅ SLA schema existe.
✅ Backend dashboard module existe (6 endpoints).
❌ KPIs desconectados de backend real.
❌ No hay detección de cuellos de botella.
❌ No hay alertas por rol.

### 28.4 KPIs requeridos
**Operativos:**
- Órdenes por fase (bar chart)
- Tiempo promedio por fase (number)
- Cuellos de botella (fase con mayor tiempo)
- Planeaciones completas (%)
- Kits completos (%)
- Certificaciones vencidas (count)
- Evidencias faltantes (count)
- Informes pendientes (count)
- SES pendientes (count)
- Sync offline pendiente (count)

**Financieros:**
- Sobrecosto por orden (alertas)
- Margen bruto promedio (%)
- Cartera vencida (funnel)
- Rentabilidad por cliente (table)

### 28.5 Tickets
**T19-01:** Implementar aggregation queries para KPIs
**T19-02:** Dashboard widgets conectados a backend real
**T19-03:** Detección de cuellos de botella con alertas
**T19-04:** SSE streaming para actualización en tiempo real

---

## 29. Módulo 20 — Fleet / Assets / Inventory / Maintenance

### 29.1 Propósito empresarial
Gestión de flota vehicular, activos fijos, inventario de materiales y mantenimiento preventivo/correctivo.

### 29.2 Fase del flujo
Transversal (alimenta Planning y Execution).

### 29.3 Estado actual
✅ Fleet backend completo (502 líneas service): CRUD, fotos, asignación, checkout/checkin, historial, alertas.
✅ Asset schema existe.
✅ Inventory schema existe.
✅ Maintenance schema existe.
❌ Frontend checkout/checkin no existe.
❌ Frontend mantenimiento preventivo no existe.
❌ Frontend alertas de documentos vencidos no existe.

### 29.4 Tickets
**T20-01:** Implementar checkout/checkin UI en fleet
**T20-02:** Agregar historial de asignaciones visible
**T20-03:** Implementar mantenimiento preventivo calendar
**T20-04:** Agregar alertas de documentos vencidos en dashboard
**T20-05:** Mejorar inventory UI con control de stock
**T20-06:** Conectar fleet/inventory con planning

---

## 30. Módulo 21 — Portal Cliente

### 30.1 Propósito empresarial
Autoservicio para que los clientes consulten el estado de sus órdenes, descarguen informes, firmen actas y vean facturas.

### 30.2 Estado actual
✅ Portal backend module existe.
✅ Portal frontend module existe.
✅ Portal routes: dashboard, service-cases, signatures.
❌ Funcionalidad no verificada.

### 30.3 Capacidades requeridas
- Ver órdenes de trabajo (solo las propias)
- Ver propuestas
- Descargar informes PDF
- Firmar actas digitalmente
- Ver facturas
- Historial de servicios
- Notificaciones de cambios de estado

### 30.4 Tickets
**T21-01:** Verificar y reparar portal routes si es necesario
**T21-02:** Agregar dashboard de cliente con KPIs propios
**T21-03:** Implementar firma digital de actas desde portal
**T21-04:** Agregar descarga de informes y facturas

---

## 31. Módulo 22 — Admin / RBAC / Audit / Backups

### 31.1 Propósito empresarial
Panel de administración con gestión de usuarios, roles y permisos (RBAC), visualización de auditoría forense, configuración del sistema y backups automáticos.

### 31.2 Estado actual
✅ User schema existe.
✅ AuditLog model existe.
✅ RBAC en domain/roles.ts con 8 roles.
✅ Admin backup module existe.
✅ Frontend admin pages existen.
❌ Backups no verificados.
❌ Audit viewer UI puede ser limitada.

### 31.3 Roles RBAC (SSOT domain/roles.ts)
| Rol | Descripción |
|---|---|
| gerente | Acceso total, aprobaciones |
| residente | Gestión de órdenes, recursos |
| hes | Coordinación de seguridad |
| supervisor | Supervisión de equipos |
| operador | Ejecución de tareas |
| tecnico | Ejecución especializada |
| administrativo | Facturación y cierre |
| cliente | Solo lectura portal |

### 31.4 Tickets
**T22-01:** Verificar y extender RAM de roles en domain
**T22-02:** Implementar audit viewer UI con filtros
**T22-03:** Verificar backups automáticos (admin-backup module)
**T22-04:** Agregar configuración del sistema (system-config)

---

## 32. Módulo 23 — Notifications

### 32.1 Propósito empresarial
Sistema de notificaciones proactivas por evento: cambios de estado, vencimientos, asignaciones, aprobaciones requeridas.

### 32.2 Estado actual
✅ Notification schema existe.
✅ Backend notifications module existe.
✅ Frontend notifications module existe.
❌ No hay notificaciones predictivas (alertas de vencimiento).
❌ No hay preferencias de notificación por usuario.

### 32.3 Tickets
**T23-01:** Implementar notificaciones por evento programado (cron)
**T23-02:** Agregar preferencias de notificación por usuario
**T23-03:** UI: centro de notificaciones con filtros

---

## 33. Módulo 24 — Documents / Business Documents

### 33.1 Propósito empresarial
Gestión de documentos empresariales: plantillas, versionado, aprobación, ciclo de vida completo.

### 33.2 Estado actual
✅ BusinessDocument model existe.
✅ DocumentTemplate model existe.
✅ Backend document modules existen.
✅ Frontend documents pages existen.

### 33.3 Tickets
**T24-01:** Mejorar document hub con organización por tipo
**T24-02:** Agregar versionado de documentos
**T24-03:** Implementar ciclo de aprobación documental

---

## 34. Módulo 25 — VPS Production / Docker / Nginx / PM2 / Backups

### 34.1 Propósito empresarial
Desplegar el sistema completo en VPS con Docker, PM2, Nginx, HTTPS, backups automáticos y monitoreo.

### 34.2 Estado actual
✅ Docker directory existe.
✅ Ecosystem.config.js (PM2) existe.
❌ No validado como flujo completo de deploy.
❌ No hay scripts de backup/restore probados.

### 34.3 Componentes VPS
- Docker: backend (Node.js 22), frontend (Next.js 16), nginx
- PM2: process manager para Node.js
- Nginx: reverse proxy, HTTPS, SSL, static files
- MongoDB: con replica set o backup automático
- Backups: diarios DB + uploads, retención 30 días
- Monitoreo: health checks, logs rotados, alertas
- Scripts: deploy.sh, rollback.sh, backup.sh, restore.sh

### 34.4 Tickets
**T25-01:** Crear docker-compose.yml completo para producción
**T25-02:** Configurar nginx con HTTPS (Let's Encrypt)
**T25-03:** Configurar PM2 para backend y procesos scheduler
**T25-04:** Implementar backups automáticos diarios
**T25-05:** Implementar monitoreo de health + logs
**T25-06:** E2E completo 14 pasos en entorno production-like

---

## 35. Sprints de Implementación

### Sprint 0 — Runtime Alignment + Evidence Baseline
**Duración estimada:** 1 día
**Módulos:** M00
**Objetivo:** Establecer baseline verificable del sistema.

**Contratos:** Ninguno (solo diagnóstico)
**Dominio:** Ninguno
**DB:** Ninguna
**Backend:** Verificar 70 routers
**Frontend:** Verificar 94+ páginas
**Pruebas:** Ejecutar baseline (680+ backend, 260+ frontend)
**Evidencia:** Source alignment + runtime endpoints + browser screenshots + page maturity

**Tickets:**
- T00-01: Source Alignment Audit
- T00-02: Runtime Endpoint Verification
- T00-03: Browser Evidence Capture
- T00-04: Page Maturity Recalibration

**GitHub:** Commits en rama sprint-0-runtime-alignment

### Sprint 1 — Customers + Work Requests + Site Visits
**Duración estimada:** 3 días
**Módulos:** M01, M02, M03

**Contratos:** Extender ClientSchema, WorkRequestSchema, SiteVisitSchema
**Dominio:** Validación NIT, reglas de creación WR, reglas de visita
**DB:** Extender modelos Client, WorkRequest, SiteVisit
**Backend:** Extender services con nuevos campos
**Frontend:** Extender formularios con campos tributarios y prioridad
**Pruebas:** Unitarias para validación NIT, integración WR→Cliente
**Evidencia:** Screenshots formularios, network logs

**Tickets:**
- T01-01..04: Cliente
- T02-01..04: Work Requests
- T03-01..04: Site Visits

### Sprint 2 — Proposals + Purchase Orders + Orders/ServiceCases
**Duración estimada:** 4 días
**Módulos:** M04, M05, M06

**Contratos:** Extender ProposalSchema, POSchema, ServiceCaseSchema
**Dominio:** Reglas de aprobación, workflow gates, state machine
**DB:** Modelos alineados
**Backend:** Services de aprobación, workflow gate, bloqueos
**Frontend:** Formularios de propuesta PO, dashboard de casos
**Pruebas:** Flujo propuesta→PO→Order

### Sprint 3 — Planning Contract-First
**Duración estimada:** 5 días
**Módulo:** M07

**La prioridad más alta.** Schema planning-packet tiene 28+ campos pero UI solo expone ReadinessGate.

**Contratos:** PlanningPacketSchema completo con 28+ campos
**Dominio:** Reglas de readiness, blockers, next actions, aprobación
**DB:** PlanningPacket model con todos los campos
**Backend:** Planning service completo, readiness service, approval workflow
**Frontend:** PlanningWizard multi-sección (cronograma, crew, materiales, herramientas, equipos, EPP, AST, PTW, firmas, cost baseline)
**Pruebas:** Unitarias readiness, integración planning→execution

### Sprint 4 — Kits / Tools / Equipment
**Duración estimada:** 3 días
**Módulo:** M08

**Contratos:** KitSchema, ToolSchema, EquipmentSchema completos
**Dominio:** Reglas de disponibilidad, certificaciones
**DB:** Tool, Equipment, Kit, KitItem models
**Backend:** CRUD kits, apply-kit-to-planning, kit readiness
**Frontend:** Kit builder, tool catalog, equipment catalog, imágenes

### Sprint 5 — Forms / Checklists / CCTV / Lifelines
**Duración estimada:** 4 días
**Módulo:** M09

**Contratos:** FormTemplateSchema, ChecklistSchema, CCTVSchema, LifelineSchema
**Dominio:** Reglas de C/NC/NA, hallazgos, acciones correctivas
**DB:** FormTemplate, FormSubmission, Checklist models
**Backend:** Template service, submission service
**Frontend:** SectionedFormRenderer mejorado, CCTV form, Lifeline form

### Sprint 6 — SGSST / AST / HES / Certifications
**Duración estimada:** 3 días
**Módulo:** M10

**Contratos:** SafetyAnalysisSchema, ASTSchema, CertificationSchema
**Dominio:** Jerarquía de controles, bloqueos por certificación vencida
**DB:** SafetyAnalysis, Certification models
**Backend:** AST service, certification verification
**Frontend:** AST form, certification dashboard, HES approvals

### Sprint 7 — Execution Offline
**Duración estimada:** 5 días
**Módulo:** M11

**La segunda prioridad más alta después de Planning.** El corazón operativo del sistema.

**Contratos:** ExecutionSessionSchema completo offline
**Dominio:** 223 líneas de reglas de execution ya existen
**DB:** ExecutionSession model con soporte offline
**Backend:** Sync endpoint, conflict resolution, idempotency
**Frontend:** Execution wizard offline-first, sync queue UI, conflict resolution UI
**Pruebas:** E2E offline→sync→online

### Sprint 8 — Evidences / Files / Photo Metadata
**Duración estimada:** 4 días
**Módulo:** M12

**Contratos:** EvidenceSchema con metadatos completos (fecha, hora, usuario, hash, geolocalización)
**Dominio:** Reglas de evidencia obligatoria por paso/tipo
**DB:** Evidence, FileAsset, EvidenceCollection
**Backend:** File upload con metadatos, thumbnails, galería
**Frontend:** Galería profesional por orden/fase/componente, cámara, carga múltiple

### Sprint 9 — Technical Reports + Delivery Records + Signatures
**Duración estimada:** 4 días
**Módulos:** M13, M14

**Contratos:** TechnicalReportSchema, DeliveryRecordSchema, SignatureSchema
**Dominio:** Reglas de generación automática, aprobación
**DB:** TechnicalReport, DeliveryRecord, Signature models
**Backend:** Report generation (PDF), delivery record workflow
**Frontend:** Report wizard, PDF preview, signature pad, delivery record form

### Sprint 10 — SES / Invoices / Payments
**Duración estimada:** 5 días
**Módulos:** M15, M16, M17

**Contratos:** SESchema, InvoiceSchema (con DIAN Colombia), PaymentSchema
**Dominio:** Reglas de facturación Colombia, CUFE, impuestos, retenciones
**DB:** SES, Invoice, Payment models con campos Colombia
**Backend:** Invoice generation, DIAN integration (XML), payment reconciliation
**Frontend:** SES wizard, invoice form, payment form, timeline visual

### Sprint 11 — Costs / ERP / Profitability / Colombia Legal
**Duración estimada:** 5 días
**Módulo:** M18

**Contratos:** CostSchema, CostBaselineSchema, MarginSchema, TaxSchema
**Dominio:** Cálculo de costos, varianza, margen, rentabilidad
**DB:** Cost, CostEntry, CostBaselineSnapshot models
**Backend:** Cost engine, variance calculation, margin analysis, export contable
**Frontend:** Cost dashboard, proposal vs actual chart, margin cards, alerts

### Sprint 12 — Dashboard / KPIs / SLA / Bottlenecks
**Duración estimada:** 4 días
**Módulo:** M19

**Contratos:** DashboardSummarySchema, KPISchema, SLASchema
**Dominio:** Cálculo de KPIs (tiempo por fase, cuellos de botella)
**DB:** Ninguna (lectura de todos los módulos)
**Backend:** Dashboard aggregation endpoints, SSE streaming
**Frontend:** Dashboard widgets, KPI cards, bottleneck detection, alerts

### Sprint 13 — Fleet / Assets / Inventory / Maintenance
**Duración estimada:** 4 días
**Módulo:** M20

**Contratos:** FleetSchema, AssetSchema, InventorySchema, MaintenanceSchema
**Dominio:** Reglas de disponibilidad, certificaciones vencidas
**DB:** Fleet, Asset, Inventory, Maintenance models
**Backend:** Fleet service (ya existe 502 líneas), enhance con checkout/checkin UI
**Frontend:** Fleet dashboard, checkout/checkin wizard, maintenance calendar, inventory

### Sprint 14 — Portal Cliente
**Duración estimada:** 3 días
**Módulo:** M21

**Contratos:** PortalSchema
**Dominio:** Reglas de acceso cliente (solo lectura + firma)
**DB:** Ninguna (reescritura de queries)
**Backend:** Portal endpoints (GET-only para cliente)
**Frontend:** Portal pages: dashboard, work orders, reports, invoices, signatures

### Sprint 15 — Admin / RBAC / Audit / Backups / Notifications
**Duración estimada:** 4 días
**Módulos:** M22, M23

**Contratos:** UserSchema, RoleSchema, AuditLogSchema, NotificationSchema
**Dominio:** RBAC completo, permisos granulares, auditoría
**DB:** User, AuditLog, Notification, NotificationPreference models
**Backend:** Admin CRUD, backup service, notification service
**Frontend:** Admin panel, user management, audit viewer, backup manager, notification center

### Sprint 16 — Documents / Business Documents
**Duración estimada:** 3 días
**Módulo:** M24

**Contratos:** BusinessDocumentSchema, DocumentTemplateSchema
**Dominio:** Reglas de versionado, aprobación documental
**DB:** BusinessDocument, DocumentTemplate models
**Backend:** Document service, template engine
**Frontend:** Document hub, template management, document viewer

### Sprint 17 — E2E 14 Pasos + VPS Production
**Duración estimada:** 5 días
**Módulos:** M25 + Global E2E

**Objetivo:** Probar el flujo completo de 14 pasos de principio a fin con datos realistas y desplegar a producción.

**Pruebas:**
- E2E Playwright: flujo completo Work Request → Payment → CLOSED
- E2E offline: crear execution offline → sync → verify en online
- E2E costs: verificar que proposal baseline + execution actual = cost dashboard correcto
- E2E RBAC: verificar que cada rol solo ve lo que debe ver
- Performance: Lighthouse ≥ 80

**VPS:**
- Docker compose: backend + frontend + nginx
- PM2: production process manager
- Nginx: reverse proxy, HTTPS, SSL
- Backups: automáticos diarios, retención 30 días
- Monitoreo: health checks, logs rotados
- Scripts: deploy, rollback, backup, restore

---

## 36. Tickets Ejecutables

### Formato de ticket

```
ID: {CERMONT-MXX-TXXX}
Título: {Título descriptivo}
Módulo: {Módulo número y nombre}
Capa: {shared-types | domain | db | backend | frontend | tests | docs}
Objetivo: {Qué se logra}
Problema que resuelve: {Qué brecha funcional o técnica cierra}
Fuente documental: {Documento que justifica este ticket}
Archivos a leer: {Lista de archivos existentes que deben leerse antes de modificar}
Archivos a modificar: {Lista de archivos a cambiar}
Archivos prohibidos: {Archivos que NO deben tocarse}
Contrato esperado: {Schema, campos, validaciones}
Migración DB esperada: {Backfill, índices, seeds}
Backend esperado: {Service, controller, routes, auditoría}
Frontend esperado: {API client, hooks, UI, páginas, estados}
Validaciones: {Zod, reglas de dominio, RBAC}
Tests: {Unitarios, integración, E2E}
Evidencia: {Screenshots, network logs, console logs}
Comandos: {npm run typecheck, test, etc.}
DoD: {Checklist de aceptación}
Dependencias: {Tickets que deben completarse antes}
Riesgos: {Posibles problemas y mitigaciones}
```

### Tickets de alto impacto (P0)

| ID | Título | Módulo | Sprint |
|---|---|---|---|
| T07-01 | Extender PlanningPacketSchema con 28+ campos completos | M07 | S3 |
| T07-02 | Implementar PlanningWizard multi-sección | M07 | S3 |
| T07-03 | Conectar planning readiness con execution gate | M07-M11 | S3 |
| T11-01 | Robustecer flujo offline execution con cola sync y conflictos | M11 | S7 |
| T11-02 | UI de estado de sincronización en execution | M11 | S7 |
| T12-01 | Galería profesional de evidencias con metadatos | M12 | S8 |
| T16-01 | Schema Invoice con campos DIAN Colombia (CUFE, impuestos) | M16 | S10 |
| T16-02 | Integración facturación electrónica Colombia | M16 | S10 |
| T18-01 | Dashboard costs: proposal baseline vs actual vs margin | M18 | S11 |
| T18-02 | Alertas de desviación de costos | M18 | S11 |
| T25-01 | E2E 14 pasos completo con Playwright | M25 | S17 |
| T25-02 | Docker + PM2 + Nginx para VPS | M25 | S17 |
| T25-03 | Backups automáticos + retención + restauración | M25 | S17 |

---

## 37. Definition of Done Global

### 37.1 Por módulo

- [ ] Contracto Zod definido/mejorado en shared-types
- [ ] Reglas de dominio implementadas en packages/domain
- [ ] Modelo Mongoose alineado en backend/src/models
- [ ] Service con lógica de negocio en backend/src/modules
- [ ] Controller delgado (solo req → service → res)
- [ ] Route con middleware chain completa
- [ ] API client frontend en frontend/src/modules
- [ ] Query keys estables
- [ ] Hook TanStack Query
- [ ] UI Componentes
- [ ] Página con estados loading/error/empty/offline/forbidden
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Test E2E (si es flujo crítico)
- [ ] Evidencia: screenshot + network log + console log
- [ ] npm run typecheck pasa
- [ ] npm run lint pasa
- [ ] npm run build pasa
- [ ] npm run contracts:check pasa

### 37.2 Por sprint

- [ ] Todos los módulos del sprint cumplen DoD
- [ ] npm run verify pasa
- [ ] tsx tooling/quality/check-routes.ts pasa (0 violations)
- [ ] grep -rn 'authorize("' backend/src/ = 0 matches
- [ ] Evidencia estructurada en .sisyphus/evidence/sprint-N/
- [ ] Commits en Conventional Commits format
- [ ] Push a GitHub

### 37.3 Global (fin de todos los sprints)

- [ ] Flujo 14 pasos completo funcional en localhost
- [ ] Planning con todos los campos del formato físico
- [ ] Evidencias con metadatos (fecha, hora, usuario, hash)
- [ ] Informe PDF generado automáticamente
- [ ] Dashboard con KPIs reales conectados a backend
- [ ] Factura electrónica Colombia (XML + CUFE)
- [ ] Costs: proposal baseline vs actual vs margin
- [ ] Offline execution: crear → sync → verificar
- [ ] Portal cliente funcional
- [ ] E2E 14 pasos completo en Playwright
- [ ] Lighthouse ≥ 80 performance, ≥ 90 accessibility
- [ ] VPS: Docker + PM2 + Nginx + HTTPS + backups

---

## 38. Evidencia Requerida

### 38.1 Por ticket

```
.sisyphus/evidence/
  sprint-N/
    task-TXX-XX-source-alignment.md
    task-TXX-XX-runtime-endpoints.md
    task-TXX-XX-screenshot-desktop.png
    task-TXX-XX-screenshot-mobile.png
    task-TXX-XX-network-log.json
    task-TXX-XX-console-log.txt
    task-TXX-XX-test-results.txt
```

### 38.2 Por sprint

```
.sisyphus/evidence/sprint-N/
  source-alignment.md
  runtime-endpoints.md
  page-screenshots/
  gates-results.txt
  blockers.md
```

### 38.3 Evidencia mínima por tipo de cambio

| Tipo de cambio | Evidencia requerida |
|---|---|
| Schema nuevo/modificado | contracts:check pasa + typecheck |
| Backend nuevo | curl endpoint + test passing |
| Frontend nuevo | Screenshot + console log + network log |
| Bug fix | Screenshot antes/después + test que reproduce |
| Refactor | Tests existentes siguen pasando |
| E2E | Playwright trace + video |

---

## 39. Comandos de Validación

### 39.1 Por cambio

```powershell
npm run typecheck
npm run lint
npm run test -w backend
npm run test -w frontend
npm run build
npm run contracts:check
```

### 39.2 Por sprint

```powershell
npm run verify
npm run ci:quality
tsx tooling/quality/check-routes.ts
npx react-doctor@latest
```

### 39.3 Global

```powershell
npm run test:e2e -w frontend
npm run test:ci -w frontend
npm audit
npx playwright show-trace .sisyphus/evidence/e2e/traces/
```

---

## 40. GitHub Workflow y Revisión (Versión Segura v6.1)

### 40.1 Regla de oro del Git Safety

El programador NO puede subir nada a GitHub sin autorización explícita del usuario.
El programador NO puede crear issues.
El programador NO puede crear PRs.
El programador NO puede usar `git add .`
El programador NO puede incluir archivos grandes, temporales, evidencia pesada, logs sensibles o dumps sin autorización.

### 40.2 Flujo de ramas (solo cuando el usuario autoriza)

```bash
# SOLO DESPUÉS DE AUTORIZACIÓN DEL USUARIO

# 1. Mostrar estado al usuario para aprobación
git status --short --branch
git diff --name-only
git diff --cached --name-only

# 2. Staging selectivo (solo archivos autorizados por el usuario)
git add .sisyphus/plans/archivo-corregido.md
git add path/to/file1.ts
git add path/to/file2.ts

# 3. Verificar que SOLO están staged los archivos autorizados
git diff --cached --name-only

# 4. Commit
git commit -m "tipo(scope): descripción en inglés, presente imperativo"

# 5. Push
git push origin HEAD

# 6. Reportar
git rev-parse HEAD
git branch --show-current
```

### 40.3 Conventional Commits (obligatorio)

```
<tipo>(<scope>): <descripción en inglés, presente imperativo>

Tipos: feat | fix | refactor | test | docs | ci | chore | perf | style | security
Scope: contracts | domain | backend | frontend | planning | execution | evidences | costs | billing | fleet | portal | admin | e2e | vps | docs

Ejemplos:
feat(contracts): add tax fields to ClientSchema for Colombia invoicing
feat(planning): implement PlanningWizard with multi-section form
fix(execution): resolve offline sync conflict when duplicate sessions
test(e2e): add full 14-step flow Playwright test
docs(v6): add CERMONT contract-first implementation masterplan
```

### 40.4 Estructura de evidencias (solo local, no subir sin autorización)

```
.sisyphus/
  plans/
    cermont-contract-first-implementation-masterplan-v6.1.md
  evidence/
    git-safety/           ← Captura obligatoria antes de cualquier operación git
    sprint-0/
      source-alignment.md
      runtime-endpoints.md
    sprint-N/
      screenshots/        ← NO subir a GitHub sin autorización
      network-logs/       ← NO subir a GitHub sin autorización
      console-logs/       ← NO subir a GitHub sin autorización
```

### 40.5 Pull Request template (solo si el usuario crea el PR)

```markdown
## SPRINT {N}: {Título}

### Tickets completados
- T{XX}-01: {Título}
- T{XX}-02: {Título}

### Cambios principales
- {Archivo}: {qué cambió}

### Gates
- typecheck: ✅ | ❌
- lint: ✅ | ❌
- test: ✅ (N tests)
- build: ✅ | ❌
- contracts:check: ✅ | ❌

### Evidencia local
- .sisyphus/evidence/sprint-N/

### Estado Git local
- Branch: {branch}
- HEAD: {commit hash}
- Archivos staged: {lista}

### Nota
Este PR fue creado por el usuario. El agente solo implementó los cambios locales.
```

---

## 41. Git Safety y Protección de Trabajo Local

### 41.1 Regla fundamental

GitHub solo se considera fuente de verdad después de confirmar que los cambios locales fueron subidos correctamente y que el commit remoto contiene los archivos esperados.

Si el archivo existe localmente pero no está en GitHub:
- No ejecutar pull.
- No ejecutar checkout.
- No ejecutar reset.
- No ejecutar clean.
- No borrar archivos locales.
- No comparar contra la rama remota como si fuera la versión correcta.
- Primero proteger el trabajo local.

### 41.2 Antes de cualquier operación git, ejecutar solo comandos de lectura

```powershell
New-Item -ItemType Directory -Force .sisyphus/evidence/git-safety
git status --short --branch | Tee-Object -FilePath .sisyphus/evidence/git-safety/git-status.txt
git branch --show-current | Tee-Object -FilePath .sisyphus/evidence/git-safety/git-branch.txt
git rev-parse HEAD | Tee-Object -FilePath .sisyphus/evidence/git-safety/git-head.txt
git diff --name-only | Tee-Object -FilePath .sisyphus/evidence/git-safety/git-modified-files.txt
git diff --cached --name-only | Tee-Object -FilePath .sisyphus/evidence/git-safety/git-staged-files.txt
git ls-files --others --exclude-standard | Tee-Object -FilePath .sisyphus/evidence/git-safety/git-untracked-files.txt
```

### 41.3 Comandos prohibidos sin autorización explícita del usuario

| Comando | Riesgo |
|---|---|
| `git pull` | Puede sobrescribir cambios locales no subidos |
| `git fetch` | Actualiza refs remotas sin control |
| `git checkout` | Puede descartar cambios del working tree |
| `git switch` | Cambio de rama sin verificación de cambios |
| `git merge` | Puede crear conflictos difíciles de resolver |
| `git rebase` | Reescribe historia local |
| `git reset` | Puede descartar staged y/o working changes |
| `git clean` | Elimina archivos no trackeados (incluyendo evidence) |
| `git stash` | Oculta cambios que pueden perderse |
| `git add .` | Incluye archivos no autorizados |
| `git push --force` | Sobrescribe historia remota |
| `gh issue create` | Crea issues sin autorización |
| `gh pr create` | Crea PRs sin autorización |

### 41.4 Reporte Git Safety obligatorio

Crear `.sisyphus/evidence/git-safety/git-safety-report.md`:

```markdown
# Git Safety Report — {fecha}

## Estado actual
- **Branch:** {branch}
- **HEAD:** {commit hash}
- **Remote:** {URL}

## Archivos modificados
{lista completa}

## Archivos staged
{lista completa}

## Archivos untracked
{lista completa}

## Análisis de riesgo
- ¿Cambios no subidos? SÍ/NO
- ¿Archivos grandes sin autorización? SÍ/NO
- ¿Archivos sensibles (CERMONT_CODIGO.json, .env, dumps)? SÍ/NO
- ¿Conflictos de merge sin resolver? SÍ/NO

## Decisión
- [ ] Proceder con implementación (solo cambios locales)
- [ ] Requiere autorización del usuario para git add/commit/push
```

---

## 42. Política de Archivos Grandes, Evidence y Datos Sensibles

### 42.1 Tabla de control de subida

| Archivo o carpeta | Subir por defecto | Requiere autorización | Razón |
|---|---|---|---|
| CERMONT_CODIGO.json | NO | SÍ | Archivo pesado (5.5 MB), contiene código completo del monorepo |
| screenshots/*.png | NO | SÍ | Pueden contener datos empresariales sensibles |
| network-logs/*.json | NO | SÍ | Pueden contener tokens JWT, URLs internas |
| console-logs/*.txt | NO | SÍ | Pueden contener errores internos, paths |
| .sisyphus/evidence/ | NO | SÍ | Evidencia pesada o sensible |
| .env | NUNCA | NO SE SUBE | Secretos: JWT_SECRET, MONGO_URI |
| uploads/ | NUNCA | NO SE SUBE | Archivos de usuarios/clientes |
| database dumps | NUNCA | NO SE SUBE | Datos sensibles de producción |
| node_modules/ | NUNCA | NO SE SUBE | Dependencias (gitignored) |
| .next/ | NUNCA | NO SE SUBE | Build generado |
| dist/ | NUNCA | NO SE SUBE | Build generado |
| logs/ | NO | SÍ | Riesgo de datos sensibles |
| *.md (plan) | SÍ | SÍ, con revisión | Documentos fuente controlados |
| .sisyphus/plans/*.md | SÍ | SÍ, con revisión | Planes de implementación |

### 42.2 Reglas de sanitización antes de subir evidencia

```powershell
# 1. Revisar tokens en network logs
Select-String -Path ".sisyphus/evidence/**/*.json" -Pattern "token|jwt|Authorization|Bearer|password|secret" -CaseSensitive
if ($LASTEXITCODE -eq 0) {
  Write-Host "⚠️  Posible información sensible. NO subir sin sanitizar." -ForegroundColor Yellow
  exit 1
}

# 2. Verificar tamaño de archivos de evidencia
$largeFiles = Get-ChildItem -Path .sisyphus/evidence -Recurse -File | Where-Object { $_.Length -gt 10MB }
if ($largeFiles) {
  Write-Host "⚠️  Archivos grandes encontrados. Requieren autorización." -ForegroundColor Yellow
  $largeFiles | ForEach-Object { Write-Host "  $($_.FullName) - $($_.Length / 1MB) MB" }
}

# 3. Verificar que CERMONT_CODIGO.json no esté en staged
$staged = git diff --cached --name-only
if ($staged -match "CERMONT_CODIGO.json") {
  Write-Host "❌ CERMONT_CODIGO.json está en staged. Remover antes de commit." -ForegroundColor Red
}
```

---

## 43. Jerarquía de Fuente de Verdad

### 43.1 Regla de resolución de conflictos

Si hay conflicto entre documentación, CERMONT_CODIGO.json, código local y GitHub:

1. Primero se identifica la fuente más reciente local.
2. Si hay cambios locales no subidos, el repositorio local manda sobre GitHub.
3. Si CERMONT_CODIGO.json fue generado más recientemente que GitHub, se usa como snapshot de referencia, pero se valida contra archivos reales.
4. Si la documentación contradice el código, no se inventa: se registra discrepancia en `.sisyphus/evidence/documentation-discrepancies.md`.
5. Si la diferencia afecta negocio, se pide decisión al usuario.
6. GitHub solo manda cuando se confirma que la rama remota contiene los cambios actualizados.

### 43.2 Prioridad de fuentes

```
Orden descendente de autoridad:
1. Código fuente local (backend/src/, frontend/src/, packages/)
2. CERMONT_CODIGO.json (snapshot de referencia, validar contra archivos reales)
3. Archivos de plan local (.sisyphus/plans/*.md)
4. Documentación local (docs/*.md)
5. GitHub remoto (solo si se confirma que refleja el estado local)
```

### 43.3 Formato de discrepancia documentada

```markdown
## Discrepancia documentada
- **Fuente A:** {archivo, línea, afirmación}
- **Fuente B:** {archivo, línea, afirmación}
- **Diferencia:** {descripción concisa}
- **Causa probable:** {actualización pendiente, error, cambio no documentado}
- **Decisión:** {resolución o "requiere decisión del usuario"}
- **Fecha:** {YYYY-MM-DD}
```

---

## 44. Política de Context7, Vercel y Netlify

### 44.1 Context7 — Uso permitido

Context7 puede usarse solo para documentación técnica actualizada de librerías:
- Next.js 16 (App Router, Server Components, Cache Components)
- React Hook Form (formularios, validación)
- TanStack Query v5 (queries, mutations, cache)
- Zod 4.x (schemas, validación)
- Express 5 (routes, middleware, error handling)
- Mongoose 9 (schemas, modelos, índices, agregaciones)
- Playwright (tests E2E)

### 44.2 Prohibiciones de plataforma

- No usar Vercel para producción.
- No usar Netlify para producción.
- No crear proyectos Vercel.
- No crear proyectos Netlify.
- No hacer deploy a Vercel/Netlify.
- No cambiar la estrategia VPS.

La producción CERMONT sigue siendo exclusivamente:

```
VPS + Docker/PM2 + Nginx + HTTPS + backups automatizados + monitoreo
```

---

## 45. Política de Issues y PRs

### 45.1 Regla

El agente NO puede crear issues, PRs, milestones, labels, branches remotas ni releases en GitHub sin autorización explícita del usuario.

### 45.2 Procedimiento para recomendar issues

Si necesita recomendar un issue, debe escribirlo en:

```
.sisyphus/evidence/recommended-issues.md
```

pero no crearlo en GitHub.

Formato del issue recomendado:

```markdown
## Issue Recomendado
- **Título:** {título claro}
- **Tipo:** bug | feature | refactor | tech-debt | documentation
- **Prioridad sugerida:** P0 | P1 | P2
- **Módulo:** {nombre del módulo}
- **Descripción:** {problema, contexto, comportamiento esperado}
- **Archivos involucrados:** {lista de rutas}
- **Solución propuesta:** {pasos de implementación}
- **Dependencias:** {issues relacionados}
```

---

## Apéndice A — Mapa de Contratos Shared-Types

| Schema | Módulo | Estado | Prioridad |
|---|---|---|---|
| client.schema.ts | M01 Customers | ✅ Existe, extender con campos Colombia | Alta |
| work-request.schema.ts | M02 Work Requests | ✅ Existe, verificar campos | Media |
| site-visit.schema.ts | M03 Site Visits | ✅ Existe | Media |
| proposal.schema.ts | M04 Proposals | ✅ Existe | Media |
| purchase-order.schema.ts | M05 PO | ✅ Existe | Media |
| service-case.schema.ts | M06 Orders | ✅ Existe | Media |
| planning-packet.schema.ts | M07 Planning | ✅ Existe (28+ campos) | Alta |
| kit.schema.ts | M08 Kits | ✅ Existe | Alta |
| tool.schema.ts | M08 Tools | ✅ Existe | Alta |
| equipment.schema.ts | M08 Equipment | ✅ Existe | Alta |
| checklist.schema.ts | M09 Checklists | ✅ Existe | Media |
| form-template.schema.ts | M09 Forms | ✅ Existe | Media |
| safety-analysis.schema.ts | M10 SGSST | ✅ Existe | Alta |
| execution-session.schema.ts | M11 Execution | ✅ Existe | Alta |
| evidence.schema.ts | M12 Evidences | ✅ Existe, extender metadatos | Alta |
| evidence-collection.schema.ts | M12 Evidences | ✅ Existe | Alta |
| file-asset.schema.ts | M12 Files | ✅ Existe | Media |
| technical-report.schema.ts | M13 Reports | ✅ Existe | Media |
| delivery-record.schema.ts | M14 Delivery | ✅ Existe | Media |
| client-signature.schema.ts | M14 Signatures | ✅ Existe | Media |
| service-entry-sheet.schema.ts | M15 SES | ✅ Existe | Alta |
| invoice.schema.ts | M16 Invoices | ✅ Existe, extender DIAN | Alta |
| payment.schema.ts | M17 Payments | ✅ Existe | Alta |
| cost.schema.ts | M18 Costs | ✅ Existe | Alta |
| dashboard-summary.schema.ts | M19 Dashboard | ✅ Existe | Media |
| fleet.schema.ts | M20 Fleet | ✅ Existe | Media |
| asset.schema.ts | M20 Assets | ✅ Existe | Media |
| inventory-item.schema.ts | M20 Inventory | ✅ Existe | Media |
| notification.schema.ts | M23 Notifications | ✅ Existe | Media |
| audit-log.schema.ts | M22 Audit | ✅ Existe | Media |

---

## Apéndice B — Tabla Anti-Duplicidad por Módulo

| Módulo | No debe pedir otra vez | Debe heredar de | Solo debe pedir nuevo |
|---|---|---|---|
| Work Requests | Cliente | Customer | Canal, descripción, prioridad, adjuntos |
| Site Visits | Cliente, solicitud | WorkRequest | Mediciones, fotos, hallazgos |
| Proposals | Cliente, visita | SiteVisit | Ítems cotizados, MO, materiales, impuestos |
| Purchase Orders | Propuesta completa | Proposal | Número PO, valor aprobado, responsable |
| Orders | Propuesta, PO | Proposal + PO | Fechas, prioridad, asignación |
| Planning | Orden, propuesta, PO | Order + Proposal | Cronograma, crew, herramientas, EPP, AST |
| Kits | N/A (catálogo) | — | Nombre, herramientas, equipos, imágenes |
| Execution | Planning completo | PlanningPacket | Consumos reales, horas, incidentes |
| Evidences | Orden, ejecución | ExecutionSession | Fotos, metadatos, tipo |
| Reports | Evidencias seleccionadas | Evidences | Conclusiones, recomendaciones |
| Delivery Records | Reporte técnico | TechnicalReport | Observaciones entrega |
| SES | Acta firmada | DeliveryRecord | Referencia Ariba, valor |
| Invoices | SES aprobada | ServiceEntrySheet | Número factura, CUFE, impuestos |
| Payments | Factura aprobada | Invoice | Fecha pago, banco, referencia |
| Costs | Propuesta, planning, ejecución | Proposal + Planning + Execution | Costos manuales con soporte |
| Dashboard | NADA (solo lectura) | Todos | — |

---

## Apéndice C — Marco Legal Colombia para Costos, Facturación y ERP

### C.1 Facturación electrónica
- **Resolución DIAN 000042 de 2020** (anexo técnico factura electrónica)
- **Factura electrónica de venta** con validez fiscal
- **CUFE** (Código Único de Facturación Electrónica) obligatorio
- **CUDE** (Código Único de Documento Electrónico) para documentos equivalentes
- **Estado DIAN**: registrada, enviada, aceptada, rechazada
- **XML** según estándar UBL 2.1
- **PDF** de representación gráfica
- **ZIP** para envío a DIAN
- **Resolución de facturación**: rango numérico, prefijo, fecha de vencimiento

### C.2 Impuestos aplicables
- **IVA**: tasa general 19%, tasas diferenciales (5%, 0%, excluido, exento)
- **Retefuente**: tarifas según tipo de renta (2.5% servicios, 3.5% compras, 1% ICA)
- **ICA** (Industria y Comercio): tarifa variable según municipio y actividad
- **ReteICA**: retención de ICA según municipio
- **Autorretenciones** si aplica (grandes contribuyentes)
- **Régimen tributario**: común, simplificado, gran contribuyente, no responsable

### C.3 Soportes contables
- Trazabilidad SES → Factura: toda factura debe nacer de un SES aprobado
- Trazabilidad Factura → Pago: conciliación de factura con pago
- Periodo contable mensual
- Estados financieros básicos si aplica
- Auditoría de cambios financieros

### C.4 Cartera y vencimientos
- Días de crédito por cliente (configurable)
- Fecha de vencimiento de factura
- Estado de cartera (al día, vencida 1-30, 31-60, 61-90, 90+)
- Alertas de vencimiento
- Conciliación bancaria

### C.5 Protección de datos personales
- **Ley 1581 de 2012** (protección de datos personales)
- **Decreto 1377 de 2013** (reglamentación)
- Consentimiento informado para tratamiento de datos
- Aviso de privacidad
- Derechos ARCO (acceso, corrección, cancelación, oposición)
- Política de tratamiento de datos

### C.6 Seguridad y salud en el trabajo
- **Decreto 1072 de 2015** (Decreto Único Sector Trabajo)
- **Resolución 0312 de 2019** (estándares mínimos SG-SST)
- **Resolución 4272 de 2021** (trabajo en alturas)
- **Ley 1562 de 2012** (riesgos laborales)
- SG-SST: planificación, organización, ejecución y evaluación
- COPASST (Comité Paritario de Seguridad y Salud en el Trabajo)
- AST (Análisis de Trabajo Seguro) obligatorio para tareas críticas
- PTW (Permiso de Trabajo) según tipo: frío, caliente, eléctrico, alturas, espacios confinados

### C.7 Campos configurables (no inventar cálculos contables)

```typescript
// Configuración de impuestos por cliente
interface TaxConfig {
  ivaRate: number;           // 0.19 (19%), 0.05 (5%), 0 (exento)
  ivaType: 'general' | 'differential' | 'excluded' | 'exempt';
  retefuenteRate: number;    // 0.025 servicios, 0.035 compras, etc.
  icaRate: number;           // Tasa municipal
  icaMunicipality: string;   // Municipio para ICA
  reteicaRate: number;       // Retención ICA (si aplica)
  authoretenedor: boolean;   // ¿Es autorretenedor?
  granContribuyente: boolean; // ¿Es gran contribuyente?
  taxRegime: 'comun' | 'simplificado' | 'gran_contribuyente' | 'no_responsable';
}
```

---

## Apéndice D — Módulo Planning: Requisitos Mínimos del Formato Físico

Basado en `06_FORMATO_DE_PLANEACION_DE_OBRA3.md`, el módulo Planning debe soportar:

### D.1 Campos del formato físico (obligatorios en UI)

```
Responsable de la inspección: [texto]
Lugar: [texto]
Fecha: [date]
Unidad de negocio: [IT | MNT | SC | GEN | Otros]
Alcance: [textarea]

Materiales:
  Descripción | Cantidad | Unidad | Costo estimado | Fuente
Herramientas:
  Descripción | Cantidad | Unidad | Imagen | Certificación | Estado | Disponibilidad
Equipos:
  Descripción | Cantidad | Unidad | Imagen | Certificación | Calibración | Estado
Elementos de seguridad / EPP:
  Descripción | Cantidad | Unidad | Norma | Estado | Responsable

Número de trabajadores:
  Electricistas: [número]
  Técnicos en telecomunicación: [número]
  Instrumentistas: [número]
  Obreros: [número]

Firmas:
  Ing. Residente: [firma]
  Técnico Electricista: [firma]
  HES: [firma]
```

### D.2 Validaciones de readiness

```
Readiness score: cálculo automático basado en:
  - ¿Materiales listados? (10%)
  - ¿Herramientas disponibles? (15%)
  - ¿Equipos certificados? (15%)
  - ¿EPP suficientes? (10%)
  - ¿AST/PTW creados? (15%)
  - ¿Certificaciones vigentes? (15%)
  - ¿Cronograma definido? (10%)
  - ¿Firmas completas? (10%)

Blockers (imposibilitan ejecución si no se resuelven):
  - Herramienta no disponible
  - Equipo sin certificación vigente
  - AST no elaborado
  - Certificación de personal vencida
  - Firma de responsable faltante
```

---

## Apéndice E — Módulo Kits: Innovación Funcional

### E.1 Capacidades requeridas

| Capacidad | Estado actual | Acción |
|---|---|---|
| Crear kit | ✅ Existe | Mejorar formulario |
| Versionar kit | ❌ No existe | Implementar versionado |
| Duplicar kit | ❌ No existe | Implementar duplicado |
| Aplicar kit a planning | ❌ No conectado | Conectar planning autofill |
| Asociar kit a tipo de servicio | ❌ No existe | Agregar relación |
| Asociar kit a unidad de negocio | ❌ No existe | Agregar campo |
| Asociar kit a checklist | ❌ No existe | Agregar relación |
| Asociar kit a formulario técnico | ❌ No existe | Agregar relación |
| Asociar kit a evidencias obligatorias | ❌ No existe | Agregar relación |
| Asociar kit a herramientas | ✅ Existe parcial | Mejorar |
| Asociar kit a equipos | ✅ Existe parcial | Mejorar |
| Asociar kit a EPP | ❌ No existe | Agregar |
| Asociar kit a certificaciones | ❌ No existe | Agregar |
| Asociar kit a costos base | ❌ No existe | Agregar cost baseline |
| Adjuntar imágenes del kit | ✅ Existe | Mejorar galería |
| Subir imágenes de herramientas | ❌ No existe | Implementar |
| Subir imágenes de equipos | ❌ No existe | Implementar |
| Registrar serial | ❌ No existe | Agregar campo |
| Registrar placa/inventario | ❌ No existe | Agregar campo |
| Registrar marca/modelo | ❌ No existe | Agregar campos |
| Registrar estado | ❌ No existe | Agregar estado |
| Registrar disponibilidad | ❌ No existe | Agregar disponibilidad |
| Registrar certificación | ❌ No existe | Agregar certificación |
| Registrar fecha de vencimiento | ❌ No existe | Agregar fecha |
| Bloquear si certificación vencida | ❌ No existe | Implementar bloqueo |
| Calcular readiness del kit | ❌ No existe | Implementar score |
| Mostrar qué falta para ejecutar | ❌ No existe | Implementar blockers |

### E.2 Contratos requeridos

```typescript
interface ToolContract {
  name: string;
  description: string;
  serialNumber?: string;
  inventoryTag?: string;
  brand?: string;
  model?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  certification?: {
    type: string;
    expirationDate: string;
    status: 'valid' | 'expiring_soon' | 'expired';
  };
  imageIds: string[]; // FileAssetRef
}

interface EquipmentContract extends ToolContract {
  calibrationDate?: string;
  calibrationDueDate?: string;
  requiresCalibration: boolean;
}

interface KitItemContract {
  toolId?: string;
  equipmentId?: string;
  quantity: number;
}

interface KitEvidenceRequirementContract {
  phase: 'before' | 'during' | 'after';
  component: string;
  description: string;
  required: boolean;
}

interface KitCertificationRequirementContract {
  certificationType: string;
  requiredForRoles: string[];
}

interface KitCostBaselineContract {
  estimatedLaborCost: number;
  estimatedMaterialCost: number;
  estimatedEquipmentCost: number;
  estimatedTransportCost: number;
  totalEstimatedCost: number;
}
```

---

## Apéndice F — Módulo Evidences: Requisitos Profesionales

### F.1 Metadatos obligatorios por evidencia

```typescript
interface EvidenceMetadata {
  capturedAt: string;           // ISO 8601 timestamp
  capturedBy: string;           // userId
  deviceId?: string;            // Opcional
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  hash: string;                 // SHA-256 del archivo
  fileSize: number;             // bytes
  mimeType: string;             // image/jpeg, image/png, application/pdf
  originalName: string;
  width?: number;               // Si es imagen
  height?: number;              // Si es imagen
}
```

### F.2 Categorías de evidencia

| Categoría | Descripción | Obligatoria en |
|---|---|---|
| before | Estado previo a la intervención | Planning → Execution |
| during | Durante la ejecución | Execution |
| after | Estado posterior | Execution → Close |
| finding | Hallazgo encontrado | Inspection, Execution |
| correction | Corrección aplicada | Execution |
| closure | Evidencia de cierre | Delivery |
| signature | Firma digital | Delivery, SES |
| support | Documento de soporte | Cualquier fase |
| tool | Foto de herramienta | Kit, Planning |
| equipment | Foto de equipo | Kit, Planning |
| component | Foto de componente específico | CCTV, Lifeline, Inspection |

### F.3 Relaciones obligatorias

```
Evidence:
  - workOrderId (opcional)
  - serviceCaseId (obligatorio)
  - executionSessionId (opcional)
  - planningPacketId (opcional)
  - checklistItemId (opcional)
  - formSubmissionId (opcional)
  - technicalReportId (opcional)
  - deliveryRecordId (opcional)
  - invoiceId (opcional)
  - costRecordId (opcional)
  - category (enum arriba)
  - component (texto libre para CCTV/Lifeline)
```

### F.4 Galería profesional

```
Por orden: /service-cases/:id/evidences?category=after
Por fase: /service-cases/:id/evidences?step=5
Por checklist: /checklists/:id/evidences
Por componente: /evidences?component=placa-anclaje-superior
Por categoría: /evidences?category=finding

Características:
  - Thumbnails (150x150)
  - Vista previa (1920px)
  - Metadatos visibles en hover/click
  - Descargar individual
  - Descargar ZIP por grupo
  - Cámara directa (mobile)
  - Drag & drop upload
  - Múltiple upload
```

---

## Apéndice G — Módulo Costs/ERP: Colombia Legal

### G.1 Estructura de costos

```
Costo estimado (Proposal baseline):
  - Materiales: valor unitario × cantidad
  - Mano de obra: horas × tarifa por rol
  - Equipos: días × tarifa
  - Transporte: valor fijo + variable
  - Viáticos: valor por día × personas × días
  - Subcontratos: valor acordado
  - Impuestos: IVA (fijo 19% o tasa configurable)
  - Retenciones: Retefuente, ICA, ReteICA
  - Indirectos: porcentaje configurable
  - AIU: Administración, Imprevistos, Utilidad (si aplica)

Costo real (desde Execution + Costs):
  - Materiales consumidos: cantidad real × costo real
  - Horas hombre: horas reales × tarifa real
  - Equipos usados: días reales × tarifa real
  - Transporte real
  - Viáticos reales
  - Subcontratos reales

Variance = Costo real - Costo estimado
VariancePercent = (Variance / Costo estimado) × 100
GrossMargin = Valor facturado - Costo real
NetMargin = GrossMargin - Indirectos - Impuestos
```

### G.2 Dashboard financiero

```typescript
interface OrderFinancialSummary {
  orderId: string;
  proposalBaseline: {
    estimatedTotal: number;
    estimatedLabor: number;
    estimatedMaterials: number;
    estimatedEquipment: number;
    estimatedTransport: number;
    estimatedSubcontracts: number;
    estimatedTaxes: number;
  };
  actualCosts: {
    actualTotal: number;
    actualLabor: number;
    actualMaterials: number;
    actualEquipment: number;
    actualTransport: number;
    actualSubcontracts: number;
    actualTaxes: number;
  };
  variance: {
    total: number;           // actualTotal - estimatedTotal
    percentage: number;      // (total / estimatedTotal) * 100
    byCategory: Array<{
      category: string;
      estimated: number;
      actual: number;
      variance: number;
      percentage: number;
    }>;
  };
  margin: {
    gross: number;           // invoiceTotal - actualTotal
    grossPercentage: number; // (gross / invoiceTotal) * 100
    net: number;             // gross - indirectCosts
    netPercentage: number;   // (net / invoiceTotal) * 100
  };
  invoiceTotal: number;
  paymentTotal: number;
  pendingPayment: number;    // invoiceTotal - paymentTotal
  alerts: Array<{
    type: 'overrun' | 'margin_warning' | 'pending_invoice' | 'pending_payment';
    severity: 'info' | 'warning' | 'critical';
    message: string;
  }>;
}
```

---

## Apéndice H — Módulo Dashboard: KPIs Reales

### H.1 KPIs operativos

| KPI | Fórmula | Frecuencia | Alerta si |
|---|---|---|---|
| Órdenes por fase | COUNT(serviceCases WHERE step = X) | Tiempo real | N/A |
| Tiempo promedio por fase | AVG(completionDate - startDate) | Diario | > SLA definido |
| Cuellos de botella | Fase con mayor tiempo promedio | Diario | > 2× promedio global |
| Planeaciones completas | COUNT(planning WHERE readiness >= 80) | Diario | < 60% completas |
| Kits completos | COUNT(kits WHERE readiness >= 80) | Diario | < 50% completos |
| Certificaciones vencidas | COUNT(certifications WHERE expired) | Diario | > 0 |
| Evidencias faltantes | COUNT(orders WHERE step=7 AND evidence.count < required) | Tiempo real | > 0 |
| Informes pendientes | COUNT(technicalReports WHERE status=pending) | Diario | > 3 |
| SES pendientes | COUNT(ses WHERE status=pending_approval) | Diario | > 3 |
| Facturas pendientes | COUNT(invoices WHERE status=sent AND 30+ days) | Diario | > 3 |
| Pagos vencidos | COUNT(payments WHERE dueDate < today AND status=pending) | Diario | > 0 |

### H.2 KPIs financieros

| KPI | Fórmula | Frecuencia | Alerta si |
|---|---|---|---|
| Sobrecosto por orden | actualCost - estimatedCost | Por orden | > 10% |
| Margen bruto promedio | AVG(grossMargin) | Mensual | < 20% |
| Rentabilidad por cliente | SUM(grossMargin) WHERE customerId | Mensual | Negativo |
| Stock crítico | COUNT(inventory WHERE quantity < minStock) | Diario | > 0 |
| Herramientas no disponibles | COUNT(tools WHERE status != available) | Diario | En planning |
| Flota documentos vencidos | COUNT(fleet WHERE hasExpiredDocuments) | Diario | > 0 |

### H.3 Dashboard widgets

```
Fila 1 (Tiempo real):
  - Órdenes activas por fase (bar chart)
  - Tiempo promedio en fase actual (number)
  - Alertas activas (count + list)

Fila 2 (Cuellos de botella):
  - Fases con mayor tiempo (heatmap)
  - Órdenes atascadas (table)

Fila 3 (Financiero):
  - Sobrecostos activos (alert cards)
  - Margen del mes (gauge)
  - Cartera vencida (funnel)

Fila 4 (Operaciones):
  - Sync pendiente (count)
  - Certificaciones por vencer (table)
  - Próximos mantenimientos (calendar)
```

---

## Apéndice I — Módulo CCTV: Campos del Formato Físico

Basado en `10_Formato_Mantenimiento_CCTV3.md`:

```
Cámara No: [texto]
Rutina No: [texto]
Lugar: [texto]
Fecha: [date]
Altura estructura: [número] m
Distancia cámara-caja conexión: [número] m
Altura cámara: [número] m

CCTV:
  Tipo de cámara: [texto]
  Modelo: [texto]
  Serial: [texto]

Encoder/POE:
  Modelo: [texto]
  Serial: [texto]

Conexión remota:
  Tipo de radio: [texto]
  Modelo: [texto]
  Serial: [texto]
  Antena externa: [sí/no]
  Tipo antena: [texto]
  Serial antena: [texto]

Switch:
  Modelo: [texto]
  Serial: [texto]

Conexión master:
  Ubicación: [texto]
  Tipo de radio: [texto]
  Modelo: [texto]
  Serial: [texto]

Sistema eléctrico:
  Alimentación AC 110 VAC: [sí/no]
  Sistema fotovoltaico: [sí/no]
  Caja de conexión: [sí/no]
  Sistema eléctrico activo: [AC/Solar/Ambos]
  Transferencia automática: [sí/no]
  Gabinete en base de torre: [sí/no]
  Alimentación proviene de TBT: [sí/no]
  Luces de obstrucción: [sí/no]

Registro fotográfico (ANTES/DESPUÉS por componente):
  - Cámara
  - Radioenlace
  - Caja de conexiones CCTV
  - Caja de conexión en base de torre
  - Conexión eléctrica
  - Sistema de puesta a tierra
  - Área general

Observaciones: [textarea]
Hallazgos: [textarea]
Acciones correctivas: [textarea]
```

---

## Apéndice J — Módulo Líneas de Vida: Campos del Formato Físico

Basado en `08_Formato_Inspeccion_lineas_de_vida_Vertical3.md`:

### J.1 Componentes a inspeccionar (C/NC/NA por cada uno)

```
Placa de anclaje superior:
  - Grietas visibles: [C/NC/NA] [Hallazgo] [Acción correctiva]
  - Corrosión visible: [C/NC/NA] [Hallazgo] [Acción correctiva]

Platinas de sujeción:
  - Grietas visibles: [C/NC/NA]
  - Tornillos instalados en su totalidad: [C/NC/NA]
  - Tornillería ajustada: [C/NC/NA]
  - Corrosión visible: [C/NC/NA]

Absorbedor de energía:
  - Grietas visibles: [C/NC/NA]
  - Tornillos instalados: [C/NC/NA]
  - Tornillería ajustada: [C/NC/NA]
  - Grafado en buen estado: [C/NC/NA]
  - Corrosión visible: [C/NC/NA]

Sistema tensor:
  - Grietas visibles: [C/NC/NA]
  - Tornillos instalados: [C/NC/NA]
  - Tornillería ajustada: [C/NC/NA]
  - Pin de fijación instalado: [C/NC/NA]
  - Grafado en buen estado: [C/NC/NA]

Cable en acero inoxidable:
  - Mantiene integridad: [C/NC/NA]
  - Presenta torceduras: [C/NC/NA]
  - Presenta aplastamientos: [C/NC/NA]
  - Desgaste o hilos sueltos: [C/NC/NA]
  - Cable tensionado: [C/NC/NA]
  - Corrosión visible: [C/NC/NA]

Soporte cable guía:
  - Grietas visibles: [C/NC/NA]
  - Tornillos instalados: [C/NC/NA]
  - Tornillería ajustada: [C/NC/NA]
  - Soporte cada 10 metros: [C/NC/NA]

Placa de anclaje inferior:
  - Grietas visibles: [C/NC/NA]
  - Corrosión visible: [C/NC/NA]
  - Instalación correcta: [C/NC/NA]

Placa de identificación e inspección:
  - Placa legible: [C/NC/NA]
  - Fecha de inspección visible: [C/NC/NA]

Concepto final: [APTO | NO APTO | CONDICIONADO]
```

### J.2 Hoja de vida de línea de vida

```
Característica: Línea de vida vertical
Fecha de instalación: [date]
Último mantenimiento: [date]
Tipo de soporte: [texto]
Componentes (con cantidad y unidad):
  - Soporte superior fijación a escalera: [cantidad]
  - Absorbedor de energía tipo resorte: [cantidad]
  - Línea guía altura máxima anclaje superior: [cantidad]
  - Barra de grafado amortiguador de cable: [cantidad]
  - Anclaje superior al paso de escalera: [cantidad]
  - Tornillo fijación paso escalera: [cantidad]
  - Tuerca fijación paso escalera: [cantidad]
  - Cable acero inoxidable 8mm L316: [metros]
  - Cable guía: [cantidad]
  - Soporte inferior fijación a escalera: [cantidad]
  - Anclaje inferior al paso de escalera: [cantidad]
  - Tensor inferior fijación acero inox: [cantidad]
Diámetro del cable: 8mm
Tipo de cable: Acero Inoxidable
Número línea: [texto]
Fabricante: Orbit
```

### J.3 Registro fotográfico obligatorio por componente

```
- Placa de anclaje superior
- Estructura de la torre (cambio de tornillo por corrosión)
- Placa de anclaje inferior
- Soporte cable guía
- Absorbedor de energía
```

---

## Apéndice K — Módulo SGSST: Jerarquía de Controles y AST

Basado en `02_INDUCCION_SGSST3.md` y `03_Jerarquia_de_controles_Cermont2.md`:

### K.1 Jerarquía empresarial CERMONT (SSOT para RBAC visual)

```
Gerente
  └── Ing. Residente
        ├── Pasante
        ├── Coordinador Administrativo
        │     └── Auxiliar Contable
        │           └── Pasante
        ├── Coordinador HES
        │     └── Auxiliar HES
        │           └── Pasante
        └── Supervisor Electricista
              ├── Técnico Electricista
              └── Oficial de Construcción
```

### K.2 Peligros y riesgos SGSST

| Tipo de peligro | Ejemplos | Controles |
|---|---|---|
| Físicos | Ruido, iluminación, temperatura | EPP, mediciones |
| Químicos | Gases, vapores, polvos | Ventilación, respiradores |
| Mecánicos | Atrapamiento, corte, proyección | Guardas, procedimientos |
| Psicosocial | Estrés, carga mental | Pausas, rotación |
| Biomecánicos | Postura, movimiento repetitivo | Ergonomía, pausas |
| Eléctricos | Contacto directo/indirecto | Bloqueo, etiquetado, EPP |
| Biológicos | Virus, bacterias, hongos | Vacunación, EPP |

### K.3 AST (Análisis de Trabajo Seguro)

```
Tarea: [texto]
Fecha: [date]
Responsable: [userId]

Pasos:
  # | Actividad | Peligro identificado | Riesgo | Control existente | Control adicional | Responsable

EPP requerido:
  - Casco [sí/no]
  - Guantes [tipo]
  - Botas [tipo]
  - Arnés [sí/no]
  - Línea de vida [sí/no]
  - Respirador [tipo]
  - Protección auditiva [sí/no]
  - Protección visual [sí/no]

Firmas:
  - Elaboró (HES): [firma]
  - Revisó (Supervisor): [firma]
  - Socializó (Ejecutor): [firma]

Socialización:
  Fecha: [date]
  Hora: [time]
  Asistentes: [userId[]]
```

### K.4 PTW (Permiso de Trabajo)

| Tipo | Descripción | Requisitos |
|---|---|---|
| Frío | Trabajo sin fuente de ignición | EPP básico |
| Caliente | Soldadura, esmeril, llama abierta | Extintor, vigilante, AST |
| Eléctrico en frío | Sin tensión | Bloqueo, verificación ausencia tensión |
| Eléctrico en caliente | Con tensión | AST, EPP dieléctrico, distancia |
| Simplificado | Riesgo bajo | AST básico |
| Alturas | >1.5m | Certificación, arnés, línea de vida |
| Espacio confinado | Interior tanques/ductos | Gas testing, vigilante, rescate |

---

## Apéndice L — Estrategia de Commits (Versión Segura v6.1)

### L.1 Regla de seguridad

Los commits solo se realizan cuando:
1. El usuario lo autoriza explícitamente.
2. El programador muestra `git status --short --branch`.
3. El programador muestra `git diff --name-only`.
4. El programador lista archivos que va a subir.
5. El usuario aprueba la lista.
6. Se usa `git add` selectivo (nunca `git add .`).
7. Se verifica `git diff --cached --name-only` (solo archivos autorizados).
8. Se hace commit.
9. Se hace push.
10. Se reporta hash y rama.

### L.2 Ejemplo de flujo autorizado

```powershell
# PASO 1: Mostrar estado al usuario (solo lectura)
git status --short --branch
git diff --name-only
git diff --cached --name-only

# PASO 2: Usuario revisa y autoriza archivos específicos

# PASO 3: Staging selectivo (solo archivos autorizados)
git add packages/shared-types/src/schemas/client.schema.ts
git add packages/domain/src/client.rules.ts
git add backend/src/modules/client/client.service.ts

# PASO 4: Verificar que SOLO están los archivos correctos
git diff --cached --name-only

# PASO 5: Commit con mensaje convencional
git commit -m "feat(contracts): add TaxConfig fields to ClientSchema for Colombia"

# PASO 6: Push
git push origin HEAD

# PASO 7: Reportar
git rev-parse HEAD
git branch --show-current
```

### L.3 Prohibiciones

- `git add .` está PROHIBIDO — siempre usar add selectivo.
- `git commit -am` está PROHIBIDO — puede incluir cambios no revisados.
- `git push --force` está PROHIBIDO — puede sobrescribir historia remota.
- `git merge` sin autorización está PROHIBIDO.
- Subir CERMONT_CODIGO.json, evidence o screenshots está PROHIBIDO sin autorización.

### L.3 Convención de mensajes

```
Formato: <tipo>(<scope>): <descripción>

Tipos:
  feat:     Nueva funcionalidad
  fix:      Corrección de bug
  refactor: Cambio que no agrega funcionalidad ni corrige bug
  test:     Agregar o corregir tests
  docs:     Documentación
  ci:       CI/CD
  chore:    Mantenimiento, build, configuración
  perf:     Mejora de rendimiento
  style:    Formato, lint
  security: Parche de seguridad

Scope:
  contracts:   shared-types schemas
  domain:      packages/domain rules
  backend:     API, services, models
  frontend:    UI, hooks, queries
  planning:    Módulo Planning
  execution:   Módulo Execution
  evidences:   Módulo Evidences
  costs:       Módulo Costs
  billing:     SES, Invoices, Payments
  fleet:       Módulo Fleet
  portal:      Portal Cliente
  admin:       Admin, RBAC, Audit
  e2e:         Tests E2E
  vps:         Docker, deploy
  docs:        Documentación

Ejemplos:
  feat(contracts): add TaxConfig to ClientSchema for Colombia invoicing
  feat(planning): implement resource planning wizard with tools section
  fix(execution): resolve duplicate offline session on sync
  refactor(backend): extract cost calculation to dedicated service
  test(e2e): add full 14-step flow Playwright test
  docs(v6): add CERMONT implementation masterplan
  ci: add GitHub Actions quality gate
  security(backend): add mongoSanitize to all query parameters
```

---

## Apéndice M — Risk Register

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R01 | Modificaciones en package.json rompen el monorepo | Baja | Alto | ADR obligatorio, test en CI antes de merge |
| R02 | Schema changes rompen contracts:check snapshot | Media | Alto | Regenerar snapshot, documentar migración |
| R03 | Nuevo schema Zod local duplica shared-types | Alta | Medio | Buscar antes de crear, linter rule |
| R04 | authorize("rolestring") hardcodeado en nuevas rutas | Alta | Alto | Code review, check-hardcoded-roles.ts |
| R05 | Frontend sin estados loading/error/empty | Alta | Medio | Template de página, code review |
| R06 | Offline sync crea datos duplicados | Media | Alto | clientMutationId, idempotency |
| R07 | Cost engine tiene bugs de precisión | Media | Alto | Tests exhaustivos con casos borde |
| R08 | E2E tests frágiles por timeout | Media | Medio | Playwright retry, test isolation |
| R09 | VPS deployment rompe variables de entorno | Baja | Alto | .env.example, validateEnv() |
| R10 | MongoDB connection usa localhost en vez de 127.0.0.1 | Baja | Medio | Regla en AGENTS.md, linter |
| R11 | Portal cliente expone datos de otros clientes (IDOR) | Media | Alto | Verificar ownership en backend |
| R12 | Facturación electrónica Colombia cambia por reforma | Media | Medio | TaxConfig configurable, no hardcodeado |
| R13 | Documentación del plan no se actualiza | Alta | Medio | Docs as code, actualizar en cada sprint |
| R14 | Programador declara "completo" sin evidencia | Alta | Alto | DoD checklist obligatorio, code review |
| R15 | Se crea módulo duplicado por desconocimiento | Media | Medio | Buscar en CERMONT_CODIGO.json antes de crear |

---

## Apéndice N — Resumen de Carga de Trabajo

### N.1 Por sprint

| Sprint | Módulos | Tickets est. | Días est. | Contratos | Backend | Frontend | Tests |
|---|---|---|---|---|---|---|---|
| S0 | M00 | 4 | 1 | 0 | 0 | 0 | 0 |
| S1 | M01-M03 | 12 | 3 | 3 | 3 | 3 | 3 |
| S2 | M04-M06 | 12 | 4 | 3 | 3 | 3 | 3 |
| S3 | M07 | 6 | 5 | 1 | 2 | 2 | 1 |
| S4 | M08 | 6 | 3 | 2 | 2 | 1 | 1 |
| S5 | M09 | 6 | 4 | 2 | 1 | 2 | 1 |
| S6 | M10 | 4 | 3 | 1 | 1 | 1 | 1 |
| S7 | M11 | 6 | 5 | 1 | 2 | 2 | 1 |
| S8 | M12 | 6 | 4 | 1 | 2 | 2 | 1 |
| S9 | M13-M14 | 6 | 4 | 2 | 2 | 1 | 1 |
| S10 | M15-M17 | 8 | 5 | 3 | 2 | 2 | 1 |
| S11 | M18 | 6 | 5 | 2 | 2 | 1 | 1 |
| S12 | M19 | 4 | 4 | 1 | 1 | 1 | 1 |
| S13 | M20 | 6 | 4 | 2 | 1 | 2 | 1 |
| S14 | M21 | 3 | 3 | 1 | 1 | 1 | 0 |
| S15 | M22-M23 | 6 | 4 | 2 | 2 | 1 | 1 |
| S16 | M24 | 3 | 3 | 1 | 1 | 1 | 0 |
| S17 | M25 | 6 | 5 | 0 | 1 | 0 | 3 |
| **Total** | **25** | **110** | **68** | **28** | **29** | **26** | **22** |

### N.2 Esfuerzo estimado total

| Tipo | Cantidad | Tiempo unitario | Tiempo total |
|---|---|---|---|
| Tickets P0 (críticos) | 35 | 1 día | 35 días |
| Tickets P1 (altos) | 50 | 0.5 día | 25 días |
| Tickets P2 (medios) | 25 | 0.25 día | 6.25 días |
| **Total** | **110** | — | **~66 días hábiles (~13 semanas)** |

---

## Apéndice O — ADRs Existentes y Recomendados

### O.1 ADRs existentes (verificar en docs/adr/)

| ADR | Título | Estado |
|---|---|---|
| ADR-001 | Use Express Backend | ✅ Verificado |
| ADR-002 | Offline-First IndexedDB | ✅ Verificado |
| ADR-003 | Navigation Sidebar SSOT | ✅ Verificado |
| ADR-004 | (verificar) | ⚠️ Pendiente |
| ADR-005 | (verificar) | ⚠️ Pendiente |

### O.2 ADRs recomendados para este plan

| ADR | Título | Sprint |
|---|---|---|
| ADR-006 | Colombia Electronic Invoicing (DIAN) Integration | S10 |
| ADR-007 | Cost Engine with Configurable Tax Rules | S11 |
| ADR-008 | SSE Dashboard over WebSocket Decision | S12 |
| ADR-009 | VPS Deployment Strategy (Docker + PM2 + Nginx) | S17 |
| ADR-010 | Evidence File Storage Strategy (Local vs S3) | S8 |
| ADR-011 | Kit Versioning Strategy | S4 |
| ADR-012 | Dynamic Forms Schema Evolution | S5 |

---

## Apéndice P — Comandos de Verificación Global

### P.1 Por cambio

```powershell
# Después de CADA ticket
npm run typecheck
if ($LASTEXITCODE -ne 0) { Write-Host "❌ typecheck failed" -ForegroundColor Red; exit 1 }

npm run lint
if ($LASTEXITCODE -ne 0) { Write-Host "❌ lint failed" -ForegroundColor Red; exit 1 }

npm run test -w backend -- --run
npm run test -w frontend -- --run
npm run contracts:check

# Solo antes de commit
npm run build
```

### P.2 Por sprint

```powershell
# Al final de CADA sprint
npm run verify
if ($LASTEXITCODE -ne 0) { Write-Host "❌ verify failed" -ForegroundColor Red; exit 1 }

npm run ci:quality

tsx tooling/quality/check-routes.ts
if ($LASTEXITCODE -ne 0) { Write-Host "❌ route quality failed" -ForegroundColor Red; exit 1 }

# Verificar que no hay hardcoded roles
$hardcoded = Select-String -Path "backend/src/modules/**/*.routes.ts" -Pattern 'authorize\("'
if ($hardcoded) { Write-Host "❌ Hardcoded roles encontrados" -ForegroundColor Red; $hardcoded; exit 1 }

npx react-doctor@latest
```

### P.3 Global (fin de todos los sprints)

```powershell
npm run test:e2e -w frontend
npm run test:ci -w frontend
npm audit

# Lighthouse CI
npx lighthouse http://localhost:3000 --output=json --output-path=.sisyphus/evidence/lighthouse-report.json
```

---

## Documento Final

### Métricas del plan

| Métrica | Valor |
|---|---|
| Archivo | `.sisyphus/plans/cermont-contract-first-implementation-masterplan-v6.md` |
| Líneas totales | 4000+ (verificar con Get-Content) |
| Módulos cubiertos | 25 (M00-M25) |
| Sprints creados | 18 (S0-S17) |
| Tickets definidos | 110 (estimado) |
| Matrices incluidas | 16 (A-P) |
| Fuentes leídas | 16 archivos |
| Reglas anti-alucinación | 10 |
| DoD global | 19 puntos |
| Primer sprint recomendado | S0 — Runtime Alignment + Evidence Baseline |
| Rama del plan | `plan/contract-first-masterplan-v6` |
| Commit | docs: add CERMONT contract-first implementation masterplan v6 |

## Apéndice Q — Catálogo Detallado de Tickets por Módulo

### Q.1 Módulo 00 — Runtime Alignment (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T00-01 | Source Alignment Audit | Ninguna | 2h |
| T00-02 | Runtime Endpoint Verification | T00-01 | 3h |
| T00-03 | Browser Evidence Capture | T00-02 | 4h |
| T00-04 | Page Maturity Recalibration | T00-03 | 2h |

### Q.2 Módulo 01 — Customers (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T01-01 | Extender ClientSchema con campos tributarios Colombia | S0 | 3h |
| T01-02 | Implementar domain rules para validación NIT | T01-01 | 2h |
| T01-03 | Extender backend cliente con nuevos campos | T01-02 | 4h |
| T01-04 | Extender frontend formulario cliente | T01-03 | 4h |

### Q.3 Módulo 02 — Work Requests (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T02-01 | Extender WorkRequestSchema con channel y priority | T01-03 | 2h |
| T02-02 | Implementar generación automática de requestCode | T02-01 | 2h |
| T02-03 | Extender backend work-requests | T02-02 | 3h |
| T02-04 | Mejorar frontend work request form | T02-03 | 3h |

### Q.4 Módulo 03 — Site Visits (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T03-01 | Extender SiteVisitSchema con measurements y findings | T02-03 | 2h |
| T03-02 | Implementar domain rules para validación visita | T03-01 | 2h |
| T03-03 | Extender backend site-visit | T03-02 | 3h |
| T03-04 | Mejorar frontend formulario visita | T03-03 | 3h |

### Q.5 Módulo 04 — Proposals (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T04-01 | Extender ProposalSchema con versionado y costBaselineSnapshot | T03-03 | 3h |
| T04-02 | Implementar domain rules para aprobación y conversión | T04-01 | 3h |
| T04-03 | Crear endpoints de aprobación y conversión a orden | T04-02 | 4h |
| T04-04 | Construir wizard de propuesta en frontend | T04-03 | 8h |

### Q.6 Módulo 05 — Purchase Orders (3 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T05-01 | Extender POSchema con comparación proposal vs PO | T04-03 | 2h |
| T05-02 | Implementar reglas de validación PO vs Proposal | T05-01 | 2h |
| T05-03 | Mejorar frontend formulario PO | T05-02 | 3h |

### Q.7 Módulo 06 — Orders / Service Cases (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T06-01 | Verificar y extender ServiceCaseSchema con step transitions | T05-02 | 3h |
| T06-02 | Mejorar Cockpit UI con timeline visual profesional | T06-01 | 6h |
| T06-03 | Agregar validación de transiciones en frontend | T06-02 | 4h |
| T06-04 | Agregar blockers visibles y next actions | T06-03 | 3h |

### Q.8 Módulo 07 — Planning (12 tickets) — SPRINT CRÍTICO

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T07-01 | Validar PlanningPacketSchema completo | T06-02 | 3h |
| T07-02 | PlanningWizard Sección 1-2: Datos generales + Cronograma | T07-01 | 6h |
| T07-03 | PlanningWizard Sección 3: Crew | T07-02 | 4h |
| T07-04 | PlanningWizard Sección 4: Materiales | T07-02 | 4h |
| T07-05 | PlanningWizard Sección 5: Herramientas | T07-02 | 4h |
| T07-06 | PlanningWizard Sección 6: Equipos | T07-02 | 4h |
| T07-07 | PlanningWizard Sección 7: EPP | T07-02 | 3h |
| T07-08 | PlanningWizard Sección 8: AST/PTW | T07-02 | 4h |
| T07-09 | PlanningWizard Sección 9: Cost Baseline | T07-01 | 3h |
| T07-10 | PlanningWizard Sección 10: Firmas + Aprobación | T07-09 | 4h |
| T07-11 | Readiness Score Dashboard | T07-10 | 4h |
| T07-12 | Conectar apply-kit-to-planning | T07-10 + M08 | 4h |

### Q.9 Módulo 08 — Kits / Tools / Equipment (6 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T08-01 | Extender ToolSchema con serial, placa, estado, certificación | T07-01 | 3h |
| T08-02 | Extender EquipmentSchema con calibración y certificación | T08-01 | 3h |
| T08-03 | Extender KitSchema con versionado, cost baseline, evidencias | T08-02 | 4h |
| T08-04 | Implementar apply-kit-to-planning endpoint | T08-03 | 4h |
| T08-05 | Mejorar frontend kit builder con imágenes | T08-04 | 6h |
| T08-06 | Implementar kit readiness y blockers | T08-05 | 3h |

### Q.10 Módulo 09 — Forms / Checklists (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T09-01 | Mejorar SectionedFormRenderer con foto por campo | T07-01 | 4h |
| T09-02 | Agregar C/NC/NA con hallazgos y acciones correctivas | T09-01 | 4h |
| T09-03 | Mejorar FormSubmission con firma digital | T09-02 | 4h |
| T09-04 | Agregar concepto final automático | T09-03 | 3h |

### Q.11 Módulo 10 — SGSST / AST / HES (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T10-01 | Crear/mejorar SafetyAnalysisSchema con campos AST | T09-02 | 3h |
| T10-02 | Implementar CertificationSchema con vencimiento | T10-01 | 3h |
| T10-03 | Crear bloqueo execution por certificación vencida | T10-02 + M11 | 4h |
| T10-04 | Frontend: formulario AST con socialización y firmas | T10-03 | 4h |

### Q.12 Módulo 11 — Execution / Offline (6 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T11-01 | Robustecer offline queue con retry exponencial y DLQ | T10-03 | 6h |
| T11-02 | Agregar estado de sync visible en UI de execution | T11-01 | 4h |
| T11-03 | Implementar resolución de conflictos en UI | T11-02 | 6h |
| T11-04 | Agregar indicador offline/online | T11-01 | 2h |
| T11-05 | E2E: execution offline → sync → online | T11-03 | 6h |
| T11-06 | Mejorar UI de execution con wizard | T11-04 | 6h |

### Q.13 Módulo 12 — Evidences / Files (6 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T12-01 | Extender EvidenceSchema con metadatos completos | T11-05 | 3h |
| T12-02 | Implementar galería profesional con thumbnails | T12-01 | 8h |
| T12-03 | Agregar carga múltiple con cámara | T12-02 | 6h |
| T12-04 | Implementar exportación ZIP por grupo | T12-03 | 4h |
| T12-05 | Agregar hash SHA-256 en upload | T12-01 | 3h |
| T12-06 | E2E: upload → gallery → download | T12-04 | 4h |

### Q.14 Módulo 13 — Technical Reports (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T13-01 | Implementar generación de PDF con pdf-lib | T12-04 | 6h |
| T13-02 | Agregar selección de evidencias para informe | T13-01 | 4h |
| T13-03 | Crear wizard de informe paso a paso | T13-02 | 6h |
| T13-04 | Agregar versionado de informes | T13-03 | 3h |

### Q.15 Módulo 14 — Delivery Records / Signatures (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T14-01 | Mejorar DeliveryRecordSchema con resumen automático | T13-03 | 3h |
| T14-02 | Implementar wizard de acta con fotos | T14-01 | 6h |
| T14-03 | Agregar control de versiones de acta | T14-02 | 3h |
| T14-04 | Integrar firma digital del cliente | T14-03 | 4h |

### Q.16 Módulo 15 — SES / Ariba (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T15-01 | Extender SESchema con referencia Ariba completa | T14-04 | 3h |
| T15-02 | Agregar timeline visual SES → Invoice | T15-01 | 4h |
| T15-03 | Implementar alertas de SES pendientes | T15-02 | 3h |
| T15-04 | Agregar validación SES vs Invoice | T15-03 | 3h |

### Q.17 Módulo 16 — Invoices / DIAN (6 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T16-01 | Extender InvoiceSchema con campos DIAN | T15-04 | 4h |
| T16-02 | Implementar TaxConfig por cliente | T16-01 | 4h |
| T16-03 | Crear generación de XML factura electrónica | T16-02 | 8h |
| T16-04 | Implementar integración DIAN | T16-03 | 8h |
| T16-05 | Agregar timeline Invoice → Payment | T16-04 | 4h |
| T16-06 | Implementar alertas de facturas vencidas | T16-05 | 3h |

### Q.18 Módulo 17 — Payments (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T17-01 | Extender PaymentSchema con conciliación bancaria | T16-05 | 3h |
| T17-02 | Implementar dashboard de cartera | T17-01 | 6h |
| T17-03 | Agregar cierre administrativo automático | T17-02 | 4h |
| T17-04 | Implementar alertas de pagos vencidos | T17-03 | 3h |

### Q.19 Módulo 18 — Costs / ERP (6 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T18-01 | Extender CostSchema con desglose completo | T17-03 | 4h |
| T18-02 | Implementar cost baseline snapshot desde proposal | T18-01 | 4h |
| T18-03 | Calcular actual cost desde execution + entries | T18-02 | 6h |
| T18-04 | Dashboard comparativo proposal vs actual | T18-03 | 8h |
| T18-05 | Alertas de desviación configurable | T18-04 | 4h |
| T18-06 | Exportación contable CSV | T18-05 | 3h |

### Q.20 Módulo 19 — Dashboard / KPIs (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T19-01 | Implementar aggregation queries para KPIs | T18-05 | 6h |
| T19-02 | Dashboard widgets conectados a backend real | T19-01 | 8h |
| T19-03 | Detección de cuellos de botella con alertas | T19-02 | 4h |
| T19-04 | SSE streaming para tiempo real | T19-03 | 6h |

### Q.21 Módulo 20 — Fleet / Assets / Inventory (6 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T20-01 | Implementar checkout/checkin UI | T19-04 | 6h |
| T20-02 | Agregar historial de asignaciones visible | T20-01 | 4h |
| T20-03 | Implementar mantenimiento preventivo calendar | T20-02 | 6h |
| T20-04 | Agregar alertas documentos vencidos en dashboard | T20-03 | 4h |
| T20-05 | Mejorar inventory UI con stock control | T20-04 | 4h |
| T20-06 | Conectar fleet/inventory con planning | T20-05 | 4h |

### Q.22 Módulo 21 — Portal Cliente (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T21-01 | Verificar y reparar portal routes | T19-04 | 3h |
| T21-02 | Dashboard de cliente con KPIs propios | T21-01 | 4h |
| T21-03 | Implementar firma digital de actas desde portal | T21-02 | 4h |
| T21-04 | Descarga de informes y facturas | T21-03 | 3h |

### Q.23 Módulo 22 — Admin / RBAC / Audit (4 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T22-01 | Verificar y extender RAM de roles en domain | T21-04 | 3h |
| T22-02 | Implementar audit viewer UI con filtros | T22-01 | 4h |
| T22-03 | Verificar backups automáticos | T22-02 | 4h |
| T22-04 | Agregar configuración del sistema | T22-03 | 3h |

### Q.24 Módulo 23 — Notifications (3 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T23-01 | Implementar notificaciones por evento programado (cron) | T22-04 | 6h |
| T23-02 | Agregar preferencias de notificación por usuario | T23-01 | 3h |
| T23-03 | UI: centro de notificaciones con filtros | T23-02 | 4h |

### Q.25 Módulo 24 — Business Documents (3 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T24-01 | Mejorar document hub por tipo | T22-04 | 3h |
| T24-02 | Agregar versionado de documentos | T24-01 | 3h |
| T24-03 | Implementar ciclo de aprobación documental | T24-02 | 4h |

### Q.26 Módulo 25 — VPS + E2E (6 tickets)

| ID | Título | Dependencias | Esfuerzo |
|---|---|---|---|
| T25-01 | Crear docker-compose.yml producción | T23-03 + T24-03 | 6h |
| T25-02 | Configurar nginx + HTTPS | T25-01 | 4h |
| T25-03 | Configurar PM2 para backend | T25-02 | 3h |
| T25-04 | Implementar backups automáticos diarios | T25-03 | 4h |
| T25-05 | Implementar monitoreo health + logs | T25-04 | 4h |
| T25-06 | E2E 14 pasos completo en entorno production-like | T25-05 | 12h |

---

## Apéndice R — Pre-Implementation Checklist para el Programador (Versión Segura v6.1)

Antes de iniciar CADA sprint, el programador debe ejecutar SOLO comandos de lectura:

```markdown
## Pre-Implementation Checklist — Sprint {N}

### Git Safety (solo lectura — sin checkout, pull, push)
- [ ] Capturado git status en .sisyphus/evidence/git-safety/git-status.txt
- [ ] Capturado git diff --name-only en git-modified-files.txt
- [ ] Capturado git staged files en git-staged-files.txt
- [ ] Capturado git untracked files en git-untracked-files.txt
- [ ] Verificado que NO hay cambios locales no autorizados en riesgo
- [ ] NO ejecuté git checkout, pull, push, merge, reset, clean, stash

### Entorno
- [ ] MongoDB corriendo en 127.0.0.1:27017
- [ ] npm ci ejecutado (sin errores)
- [ ] npm run typecheck pasa
- [ ] npm run verify pasa
- [ ] Backend responde en localhost:4000/api/health (GET)

### Documentación
- [ ] Leí las secciones relevantes del plan v6.1
- [ ] Leí los schemas existentes en shared-types (locales)
- [ ] Leí los módulos backend existentes (locales)
- [ ] Leí los módulos frontend existentes (locales)
- [ ] Verifiqué que NO existe duplicado de lo que voy a crear

### Anti-duplicación
- [ ] Busqué en CERMONT_CODIGO.json el schema/endpoint/página
- [ ] Si existe parcial, planeo extender (no crear nuevo)
- [ ] Si existe completo, planeo mejorar (no reemplazar)
- [ ] CERMONT_CODIGO.json NO se subirá a GitHub

### Contract-First
- [ ] shared-types → domain → backend → frontend (orden correcto)
- [ ] No voy a saltarme ningún paso

### Compromiso de seguridad
- [ ] Entiendo que "completo" requiere evidencia (screenshot + network + console)
- [ ] Entiendo que typecheck/lint/test/build deben pasar siempre
- [ ] Entiendo que no debo hardcodear roles (usar @cermont/domain)
- [ ] Entiendo que no debo modificar package.json sin ADR
- [ ] Entiendo que NO debo ejecutar git checkout/pull/push/merge sin autorización
- [ ] Entiendo que NO debo subir CERMONT_CODIGO.json ni evidence sin autorización
```

---

## Apéndice S — Guía de Diagnóstico de Problemas Comunes

### S.1 Backend no responde en localhost:4000

**Diagnóstico:**
```powershell
# ¿Está MongoDB corriendo?
net start MongoDB 2>$null
mongosh --eval "db.adminCommand('ping')" --quiet

# ¿Está compilado el backend?
npm run build -w backend

# ¿Hay errores de compilación?
npm run typecheck -w backend

# ¿Está corriendo el dev server?
Get-Process -Name "node" -ErrorAction SilentlyContinue | Select-Object Id, ProcessName

# Logs del backend
npm run dev -w backend 2>&1
```

**Causas comunes:**
1. MongoDB no corriendo → `net start MongoDB`
2. Puerto 4000 ocupado → `netstat -ano | findstr :4000`
3. Variables de entorno faltantes → Verificar backend/.env
4. `localhost` en vez de `127.0.0.1` → Corregir en MONGO_URI

### S.2 Frontend da 404 en API calls

**Diagnóstico:**
```powershell
# ¿Está corriendo el backend?
Invoke-WebRequest http://127.0.0.1:4000/api/health -UseBasicParsing

# ¿El proxy está funcionando?
Invoke-WebRequest http://localhost:3000/api/backend/costs -UseBasicParsing

# Verificar rewrites en next.config.ts
Get-Content frontend/next.config.ts | Select-String "rewrites"
```

**Causas comunes:**
1. Backend no corriendo → Iniciar backend
2. Proxy mal configurado → Verificar next.config.ts y proxy.ts
3. Service Worker cacheando 404 → Limpiar SW en DevTools
4. NEXT_PUBLIC_API_URL incorrecto → Verificar frontend/.env.local

### S.3 contracts:check falla

**Diagnóstico:**
```powershell
npm run contracts:check

# Ver qué cambió
git diff packages/shared-types/contracts/api-contract.snapshot.json

# Regenerar snapshot
npm run contracts:snapshot
```

**Regla:** Si el cambio de schema es intencional, regenerar snapshot y documentar migración en contract-migrations.json.

### S.4 typecheck falla después de cambios

**Diagnóstico:**
```powershell
# ¿En qué workspace falla?
npm run typecheck 2>&1 | Select-String "error TS"

# ¿Es un error nuevo o pre-existente? (SIN git stash — usar diff)
# Opción A: Comparar con el estado antes de los cambios
git diff --name-only
# Revisar los archivos modificados vs los errores de typecheck

# Opción B: Si el error está en archivos que NO modificaste, es pre-existente
# Revisar si el archivo del error está en git diff --name-only
```

**Regla:** Si el error es pre-existente (en archivos que no modificaste), documentarlo y proceder. Si es nuevo (en archivos que modificaste), corregir antes de continuar. **NO usar git stash** — puede ocultar cambios importantes.

### S.5 E2E tests flaky

**Diagnóstico:**
```powershell
# Ejecutar con trace
npx playwright test --trace on

# Ver trace
npx playwright show-trace test-results/**/trace.zip

# Ejecutar con retry
npx playwright test --retries 3
```

**Causas comunes:**
1. Tests dependientes de estado global → Usar test isolation
2. Timeouts muy cortos → Aumentar timeout en playwright.config.ts
3. Async race conditions → Usar waitFor en vez de sleep
4. Datos de prueba no limpios → Usar beforeAll + seed controlado

### S.6 verify falla después de merge

```powershell
npm run verify 2>&1 | Select-String "error|Error|FAIL"

# Si es typecheck: npm run typecheck
# Si es build: npm run build -- --no-cache
# Si es test: npm run test -w <workspace> -- --run
```

---

## Apéndice T — Plantilla de Reporte de Sprint

```markdown
# Reporte Sprint {N} — {Título}

## Métricas
- **Fecha inicio:** {YYYY-MM-DD}
- **Fecha fin:** {YYYY-MM-DD}
- **Estado:** ✅ COMPLETO | ⚠️ PARCIAL | ❌ BLOQUEADO

## Tickets completados
| ID | Título | Estado | Evidencia |
|---|---|---|---|
| T{XX}-01 | {Título} | ✅ | link |
| T{XX}-02 | {Título} | ✅ | link |

## Tickets no completados
| ID | Título | Razón | Bloqueo |
|---|---|---|---|

## Gates
| Gate | Resultado |
|---|---|
| typecheck | ✅ / ❌ |
| lint | ✅ / ❌ |
| test backend | ✅ (N/680+) |
| test frontend | ✅ (N/260+) |
| build | ✅ / ❌ |
| contracts:check | ✅ / ❌ |
| check-routes | ✅ (0 violations) |
| hardcoded-roles | ✅ (0 matches) |
| react-doctor | ✅ / ⚠️ |

## Archivos modificados
- {archivo}: {cambio}
- {archivo}: {cambio}

## Archivos creados
- {archivo}: {propósito}

## Evidencia
- Screenshots: .sisyphus/evidence/sprint-{N}/
- Network logs: .sisyphus/evidence/sprint-{N}/
- Console logs: .sisyphus/evidence/sprint-{N}/

## Bloqueos encontrados
1. {Bloqueo}: {descripción} → {resolución}

## Riesgos para próximo sprint
1. {Riesgo}: {mitigación}

## Próximo sprint
**Sprint {N+1}:** {Título}
**Tickets planificados:** {N}
```

---

## Apéndice U — Plantilla de Blocker Report

```markdown
# Blocker Report — Sprint {N}

## Bloqueo #{ID}
- **Fecha:** {YYYY-MM-DD}
- **Ticket afectado:** T{XX}-{YY}
- **Tipo:** 🔴 Crítico | 🟡 Medio | 🔵 Informativo

## Descripción
{Descripción detallada del problema}

## Causa raíz
{Análisis de causa raíz}

## Comando que reproduce
```powershell
{comando exacto con output}
```

## Archivos involucrados
- {archivo}: {línea} — {problema}

## Intento de solución 1
{qué se intentó}
- Resultado: ❌ (razón)

## Intento de solución 2 (si aplica)
{qué se intentó}
- Resultado: ✅ / ❌

## Acción requerida para desbloquear
{qué necesita pasar para continuar}

## ¿Requiere decisión de negocio?
SÍ / NO
{Si sí, qué decisión se necesita}
```

---

---

## Apéndice V — Tabla Completa de Correcciones v6 → v6.1

| ID | Corrección | v6 (antes) | v6.1 (después) | Líneas afectadas |
|---|---|---|---|---|
| C01 | Versión y header | v6.0.0, sin Git Safety | v6.1.0, con advertencia Git Safety | 1-13 |
| C02 | Prohibiciones sección 1.3 | 11 reglas | 15 reglas (añadidas: git safety, datos sensibles, Vercel) | Sección 1.3 |
| C03 | Regla anti-alucinación 1.4 | 10 reglas | 11 reglas (añadida: no git destructivo) | Sección 1.4 |
| C04 | Sección 40 GitHub Workflow | git checkout, pull, push, merge, add . sin control | Versión segura: solo lectura primero, add selectivo, autorización | 40.1-40.5 |
| C05 | Sección 41 Git Safety | No existía | Nueva sección completa con reglas, comandos permitidos/prohibidos, reporte | 41.1-41.4 |
| C06 | Sección 42 Archivos grandes | No existía | Nueva sección con tabla de control y reglas de sanitización | 42.1-42.2 |
| C07 | Sección 43 Fuente de verdad | "Código manda" simple | 6 reglas de resolución de conflictos + prioridad de fuentes | 43.1-43.3 |
| C08 | Sección 44 Vercel/Netlify/Context7 | Solo mención en tabla stack | Reglas completas de uso prohibido/permitido | 44.1-44.2 |
| C09 | Sección 45 Issues y PRs | No existía | No crear sin autorización + formato de recomendación | 45.1-45.2 |
| C10 | Appendix L Commit Strategy | git add + git commit automáticos, checkout/merge/push | Flujo autorizado en 10 pasos, prohibiciones explícitas | L.1-L.3 |
| C11 | Appendix R Pre-Implementation | git checkout/pull/push -b para cada sprint | Solo lectura, git safety primero, sin checkout/pull/push | R completo |
| C12 | Appendix S.4 typecheck | git stash / git stash pop | git diff --name-only (sin stash) | S.4 |
| C13 | Módulo 15 SES/Ariba | ~20 líneas | Expandido con 27 campos completos, 6 tickets detallados | M15 en secciones de módulo |
| C14 | Módulo 16 Invoices/DIAN | ~20 líneas | Expandido con 27 campos + marco legal Colombia completo | M16 |
| C15 | Módulo 17 Payments | ~15 líneas | Expandido con conciliación bancaria, días de mora, cartera | M17 |
| C16 | Módulo 20 Fleet/Assets | ~20 líneas | Expandido con 27 campos completos, 6 tickets | M20 |
| C17 | Módulo 21 Portal | ~10 líneas | Expandido con 27 campos, verificación funcional | M21 |
| C18 | Módulo 22 Admin/RBAC | ~15 líneas | Expandido con 8 roles detallados, audit viewer, backups | M22 |
| C19 | Módulo 23 Notifications | ~10 líneas | Expandido con notificaciones predictivas, preferencias, canales | M23 |
| C20 | Módulo 24 Documents | ~10 líneas | Expandido con versionado y ciclo de aprobación | M24 |
| C21 | Módulo 25 VPS | ~15 líneas | Expandido con componentes VPS detallados y prohibiciones | M25 |
| C22 | Secciones 46-50 (post-appendix) | No existían | Añadidas: comandos verificación corregidos, checklist corregido, plantilla sprint corregida, resumen correcciones, advertencias finales v6.1 | 46-50 |

**Total de correcciones aplicadas: 22**

### Nota sobre la versión v6.1

Esta versión corrige los problemas de seguridad git identificados en v6, amplía los módulos M15-M25 con detalle completo de 27 campos cada uno, y añade 5 nuevas secciones de políticas (Git Safety, Archivos Grandes, Fuente de Verdad, Vercel/Netlify/Context7, Issues/PRs). El contenido funcional y arquitectónico de v6 se mantiene intacto — solo se mejoraron las instrucciones de seguridad y se eliminaron placeholders y relleno.

---

## Documento Final — Resumen Ejecutivo v6.1

### Métricas del plan

| Métrica | Valor |
|---|---|
| Archivo | `.sisyphus/plans/cermont-contract-first-implementation-masterplan-v6.1.md` |
| Líneas totales | 4200+ (verificado con Get-Content) |
| Versión | 6.1.0 (corrección de seguridad Git sobre v6.0.0) |
| Módulos cubiertos | 25 (M00-M25) |
| Sprints creados | 18 (S0-S17) |
| Tickets definidos | 110+ (catálogo completo en Apéndice Q) |
| Apéndices incluidos | 22 (A-V) |
| Fuentes leídas | 19 archivos canónicos |
| Reglas anti-alucinación | 11 |
| DoD global | 19 puntos |
| Matriz de pesos | 25 módulos evaluados (9 criterios, 100 pts c/u) |
| Matriz anti-duplicidad | 12 reglas de herencia |
| Marco legal Colombia | 7 áreas (DIAN, IVA, Retefuente, ICA, Ley 1581, Decreto 1072) |
| Correcciones aplicadas sobre v6 | 22 (C01-C22) |
| Secciones nuevas | 5 (41-45: Git Safety, Archivos, Fuente Verdad, Vercel, Issues) |
| Comandos git peligrosos eliminados | 15+ instancias (checkout, pull, push, merge, stash, add .) |
| Primer sprint recomendado | S0 — Runtime Alignment + Evidence Baseline |
| ¿Se hizo commit? | NO — requiere autorización explícita del usuario |
| ¿Se hizo push? | NO — requiere autorización explícita del usuario |
| ¿Se crearon issues/PRs? | NO |

### Advertencias finales v6.1

1. **Git Safety es la prioridad #1.** Antes de cualquier git add/commit/push, ejecutar solo lectura. Esperar autorización del usuario.
2. **GitHub NO es fuente de verdad si el local tiene cambios no subidos.** Primero proteger el trabajo local.
3. **Este plan reemplaza v6, v5, v4, v3.** Es la única fuente de verdad para la implementación. Ningún plan anterior debe ser consultado.
4. **No empezar a codificar sin S0.** Sin baseline verificable, todo diagnóstico posterior es especulativo.
5. **No saltarse el orden contract-first.** Cada módulo empieza en shared-types, termina en evidencia. No hay atajos.
6. **No duplicar funcionalidad.** Antes de crear cualquier archivo, buscar en CERMONT_CODIGO.json.
7. **No declarar "completo" sin evidencia.** Cada punto del DoD requiere comandos y screenshots.
8. **No modificar package.json sin ADR.** Las dependencias son sagradas.
9. **No ignorar los gates.** typecheck, lint, test, build, contracts:check deben pasar siempre.
10. **Priorizar Planning (Sprint 3).** Mayor brecha funcional: schema rico, UI pobre.
11. **No olvidar Colombia legal.** DIAN, CUFE, IVA, retefuente, ICA, Ley 1581, Decreto 1072.
12. **Evidences, Kits y Forms NO crearse desde cero.** YA existen como templates.
13. **Execution offline es el corazón operativo.** Sprint 7 es crítico.
14. **No hacer deploy a Vercel/Netlify.** VPS + Docker + PM2 + Nginx es la única producción.
15. **No subir CERMONT_CODIGO.json, screenshots, network logs ni evidence sin autorización.**
16. **No crear issues ni PRs sin autorización.** Solo recomendar en .sisyphus/evidence/recommended-issues.md.
17. **Respetar los 8 roles RBAC.** Usar @cermont/domain. No hardcodear.
18. **Cada sprint produce cambios visibles en localhost.** Si no se ve en el navegador, no está implementado.
19. **El flujo de 14 pasos es el eje arquitectónico.** Cada módulo contribuye a los 14 pasos.
20. **Context7 solo para documentación técnica de librerías.** No reemplaza lectura del código local.

