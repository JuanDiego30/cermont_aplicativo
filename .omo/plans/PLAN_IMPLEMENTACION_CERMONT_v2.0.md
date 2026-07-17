# Plan de Implementación Completo — Cermont v2.0
# ENFOQUE: FUNCIONALIDAD + CONTENIDO — SIN NUEVAS DEPENDENCIAS PAGAS

## TL;DR

> **Objetivo**: Escalar y madurar el aplicativo Cermont S.A.S. mejorando la funcionalidad y contenido de cada página del flujo de 14 pasos. Implementar formularios dinámicos ajustables (campos configurables por el usuario), impresión PDF de todos los formularios, llenar campos faltantes en formularios existentes (herramientas, equipos, EPP, certificaciones) e innovaciones de automatización de procesos. CERO nuevas dependencias o servicios pagos.
>
> **Entregables**:
> - ✅ Formularios dinámicos ajustables (SectionedFormRenderer + DynamicFormTemplate existentes)
> - ✅ Impresión PDF de formularios, actas, informes y checklists
> - ✅ Campos faltantes completados en planeación, ejecución, evidencias
> - ✅ KPIs contextuales CERMONT (líneas de vida, CCTV, anclajes, HSE, costos)
> - ✅ Sistema de diseño v4.0 (DESIGN.md) — dark mode, bottom nav, cards responsive
> - ✅ Flujo de 14 pasos funcionando con datos reales, bloqueadores y transiciones
> - ✅ Automatización de procesos: recordatorios inteligentes, detección de hallazgos, reportes automáticos
> - ❌ Eliminado: Redis, BullMQ, OpenTelemetry, Sentry, CDN, AI SDKs, Leaflet, Socket.io
>
> **Estimación**: ~800 horas | **Paralelización**: 4 tracks | **Stack**: Solo lo existente — Express 5 + Next.js 16 + MongoDB + Mongoose + Zod 4.x + TanStack Query + Zustand + Tailwind + Lucide + Recharts

---

## Contexto

### Resumen Ejecutivo Consolidado (Fase 1)

#### Problemática del Negocio

CERMONT S.A.S. es una contratista multiservicio en Arauca, Colombia, que opera bajo el cliente SIERRACOL Energy en el campo petrolero Caño Limón. El ciclo de vida operativo-administrativo comprende **14 pasos secuenciales** desde la solicitud de trabajo hasta el pago. Se identificaron **5 fallas críticas**:

1. **Falla Crítica 1 — Planeación (Paso 5)**: Inexistencia de biblioteca centralizada de kits típicos; sin control de vigencia de certificaciones del personal ni calibración de instrumentos.
2. **Falla Crítica 2 — Ejecución (Paso 6)**: Dispersión de evidencias fotográficas sin vínculo único a la orden; registros en papel que se pierden o digitalizan tarde.
3. **Falla Crítica 3 — Consolidación documental (Pasos 7-9)**: Retrasos en elaboración de informes técnicos y actas; datos fragmentados entre formatos físicos, hojas de cálculo y carpetas locales.
4. **Falla Crítica 4 — Facturación (Pasos 10-14)**: Retrasos en SES, facturación y cierre; falta de seguimiento centralizado del estado de cada paso.
5. **Falla Crítica 5 — Costos (Transversal)**: Ausencia de control centralizado de costos reales vs. estimados; no hay hoja de cálculo que relacione costos de operación versus propuesta.

#### Observaciones del Evaluador (Anteproyecto)

- **Valor diferencial**: Integración precisa entre operación en campo, cierre administrativo y datos históricos.
- **Módulos obligatorios mínimos**:
  - Módulo 1: Ejecución en campo con modo Online/Offline
  - Módulo 2: Dashboard informativo con métricas y KPIs
  - Módulo 3: Administración (kits típicos, checklists dinámicos, RBAC)
  - Módulo 4: Mantenimiento y respaldo de datos (archivado automático mensual, portal de descarga de históricos)
- **Stack requerido**: Next.js 14+, MongoDB, TypeScript, Docker
- **Restricciones**: Despliegue VPS, entorno desarrollo localhost:3000, producción VPS Contabo

#### Lineamientos del Director (LTG)

El director MSc. Luis Alberto Muñoz Bedoya establece:
- Arquitectura con separación clara de capas (interfaz, lógica, contratos, persistencia)
- Control de acceso por perfil (RBAC)
- Validación mediante escenarios de uso, pruebas de integración y aceptación por rol
- Indicadores cuantitativos de impacto solo con evidencia verificable de fase piloto
- Documentación técnica completa (serie 00-22)
- Contemplar formularios dinámicos basados en documentos heredados de la empresa

#### Stack Real del Repositorio (Verificado contra AGENTS.md + REGLAS_DESARROLLO + código fuente)

| Tecnología | Estado Real | Restricción |
|---|---|---|
| Express 5.2.1 | ✅ Confirmado | ❌ No NestJS |
| Next.js 16 | ✅ Confirmado | App Router |
| MongoDB + Mongoose | ✅ Confirmado | ❌ No Prisma/PostgreSQL |
| Zod 4.x | ✅ Confirmado | ❌ No Joi |
| JWT + Zustand | ✅ Confirmado | ❌ No Auth.js/NextAuth |
| `apiClient` wrapper | ✅ Confirmado | ❌ No Axios |
| `proxy.ts` (no middleware.ts) | ✅ Confirmado | Perímetro de seguridad |
| npm | ✅ Confirmado | ❌ No pnpm/yarn |
| TypeScript strict | ✅ Confirmado | ❌ No `any`/`unknown`/`null` |
| Contract-First | ✅ Implementado | Shared types en packages/ |
| RBAC en backend | ✅ Implementado | Middleware de roles |
| Offline-first (PWA) | ✅ Parcial | Service Worker Serwist presente |
| Pruebas automatizadas | ✅ Backend (~508 tests) | Vitest |

#### Estado Actual del Sistema

- **Rutas frontend**: 83/86 implementadas (3 REQUIRED_NOT_IMPLEMENTED)
- **Endpoints backend**: ~389 implementados
- **Gaps principales identificados**:
  - Dashboard de costos no implementado (ruta #39)
  - Gestión de activos no implementada (rutas #41, #42)
  - Biblioteca de plantillas no implementada (4 rutas: #35-#38)
  - Módulo de inventario + escaneo QR no implementado
  - Dispatch y Fleet management no implementados
  - SLA management no implementado
  - Offline-first incompleto (sync de execution no funcional)
  - Cobertura de pruebas backend: ~508 tests; frontend: sin métrica
  - Módulo Cermont AI: No implementado
  - Portal de descarga de históricos: No implementado
  - Archivado automático mensual (Módulo 4 del evaluador): No implementado
  - Auditoría: sin exportación ni correlación por requestId
  - Session Management/MFA: No implementado
  - ERP connectors (Ariba): Sin capa de integración real

---

## Verificación Estratégica

### Test Decision
- **Infrastructure exists**: YES (Vitest en backend, Playwright config presente)
- **Automated tests**: YES (Tests-after) — TDD en módulos críticos (costos, execution, offline sync)
- **Framework**: Vitest (backend unit/integration) + Playwright (E2E)
- **QA Policy**: Agent-executed scenarios for every task. Evidence saved to `.sisyphus/evidence/`.

---

## Arquitectura Target (Simplificada — Solo Stack Existente)

### Diagrama Arquitectural

```mermaid
graph TB
    subgraph "Client Layer"
        A1["Next.js 16 App (Frontend)"]
        A2["Service Worker (Serwist PWA)"]
        A3["IndexedDB (Dexie.js)"]
    end

    subgraph "Security Perimeter"
        B1["proxy.ts (Next.js Rewrites)"]
        B2["Helmet + CORS Estricto"]
        B3["Rate Limiting (express-rate-limit)"]
    end

    subgraph "API Layer (Express 5.2.1)"
        C1["Middleware Chain: Auth -> RBAC -> Validation"]
        C2["Controllers (Delgados)"]
        C3["Domain Services (Lógica de Negocio)"]
        C4["Mongoose Models"]
    end

    subgraph "Data Layer"
        D1["MongoDB (Operativa + Histórica)"]
        D2["Filesystem local (Archivos/Evidencias)"]
    end

    subgraph "Cross-Cutting"
        E2["Audit Log (Inmutable, sin TTL)"]
        E3["Formularios Dinámicos (SectionedFormRenderer)"]
        E4["PDF Generation (pdf-lib)"]
        E5["Sync Queue (IndexedDB -> Backend)"]
    end

    A1 --> B1
    A2 --> A3
    A3 --> B1
    B1 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> D1
    C4 -.-> D2
    C3 -.-> E2
    C3 -.-> E3
    C3 -.-> E4
    C3 -.-> E5
```

> **NOTA**: Se eliminaron Redis, MinIO/S3, OpenTelemetry, Sentry, Cermont AI (Vercel AI SDK), BullMQ y ERP Connectors. Estos servicios no se implementarán porque requieren infraestructura externa, pagos por uso o dependencias no críticas. La arquitectura target utiliza ÚNICAMENTE el stack existente: Express 5 + Next.js 16 + MongoDB + Mongoose + Zod + TanStack Query + Zustand + Tailwind.

### Stack Tecnológico Final Recomendado

#### Frontend (Next.js 16 App Router)

| Librería | Versión | Propósito | Prioridad | Licencia |
|---|---|---|---|---|
| Next.js | 16.x | Framework principal (App Router, RSC, Server Actions) | ⭐ Crítico | MIT |
| @tanstack/react-query | 5.x | Data fetching, caché, sincronización offline | ⭐ Crítico | MIT |
| @tanstack/react-table | 8.x | Tablas avanzadas con ordenamiento, filtros, paginación | ⭐ Crítico | MIT |
| Zustand | 5.x | Estado global (auth, UI, offline queue) | ⭐ Crítico | MIT |
| React Hook Form | 7.x | Formularios performantes con validación | ⭐ Crítico | MIT |
| Zod 4.x | 4.x | Validación de formularios y contratos | ⭐ Crítico | MIT |
| Dexie.js | 4.x | IndexedDB wrapper para operación offline | ⭐ Crítico | Apache 2.0 |
| Serwist | latest | Service Worker PWA (app-shell + offline) | ⭐ Crítico | MIT |
| Lucide React | latest | Iconografía unificada | ⭐ Crítico | ISC |
| Tailwind CSS | 4.x | Estilos utility-first | ⭐ Crítico | MIT |
| shadcn/ui | latest | Componentes base (Button, Card, Dialog, Table, Badge) | Alta | MIT |
| framer-motion | 12.x | Animaciones de UI | Media | MIT |
| react-dropzone | 15.x | Drag & drop de archivos adjuntos | Alta | MIT |
| sonner | 2.x | Notificaciones toast | Media | MIT |
| date-fns | 4.x | Manipulación de fechas | Alta | MIT |
| react-hook-form + @hookform/resolvers | latest | Integración RHF + Zod | ⭐ Crítico | MIT |

> **NOTA**: Se eliminaron del stack recomendado: Leaflet (no crítico, sin mapas), @zxing (QR scanning no crítico), react-pdf (pdf-lib ya maneja PDFs), Socket.io (tiempo real no crítico), @dnd-kit (drag&drop no crítico). Estos pueden agregarse en el futuro si hay necesidad, pero no son prioridad ahora.

#### Backend (Express 5.2.1)

| Librería | Versión | Propósito | Prioridad | Licencia |
|---|---|---|---|---|
| Express | 5.2.1 | Framework HTTP | ⭐ Crítico | MIT |
| Mongoose | 8.x | ODM MongoDB con schemas | ⭐ Crítico | MIT |
| Zod 4.x | 4.x | Validación de contratos y payloads | ⭐ Crítico | MIT |
| jsonwebtoken | 9.x | JWT stateless authentication | ⭐ Crítico | MIT |
| bcryptjs | 2.x | Hashing de contraseñas | ⭐ Crítico | MIT |
| helmet | 8.x | Seguridad HTTP headers | ⭐ Crítico | MIT |
| cors | 2.x | CORS configuration | ⭐ Crítico | MIT |
| express-rate-limit | 7.x | Rate limiting | Alta | MIT |
| pdf-lib | 1.17.1 | ✅ YA INSTALADO — Generación PDF | Alta | MIT |
| sharp | 0.34.5 | ✅ YA INSTALADO — Procesamiento imágenes | Alta | Apache 2.0 |
| multer | 2.1.1 | ✅ YA INSTALADO — Upload archivos | Alta | MIT |

#### Paquetes Compartidos (monorepo packages/)

| Paquete | Propósito | Dependencias clave |
|---|---|---|
| `@cermont/shared-types` | Schemas Zod, tipos inferidos, enums, constantes | Zod 4.x |
| `@cermont/domain` | Reglas de negocio: RBAC, FSM 14 pasos, gates, costos | Zod 4.x |
| `@cermont/validators` | Validaciones reutilizables (NIT, placas, emails, etc.) | Zod 4.x |
| `@cermont/ui` | Componentes UI compartidos (shadcn wrappers) | React, Tailwind |

### Estrategia de Migración (Estado Actual -> Target)

**Paso 1 — Estabilización Inmediata** (Semana 1):
- Sin cambios arquitectónicos mayores
- Cerrar endpoints REQUIRED_NOT_IMPLEMENTED
- Implementar módulos faltantes (costos, assets, templates)
- Implementar almacenamiento de credenciales de servicios externos

**Paso 2 — Refactorización Contract-First** (Semanas 2-4):
- Migrar módulos existentes al orden estricto: Schema Zod -> Tipo -> Modelo -> Servicio -> Controller -> Ruta -> API -> Query Keys -> Hook -> UI -> Tests
- Extraer lógica de negocio de controladores a servicios
- Implementar el patrón de estados (loading/error/empty/offline/forbidden) en todas las páginas

**Paso 3 — Formularios Dinámicos Ajustables** (Semanas 3-5):
- Completar e integrar el motor de formularios dinámicos existente (SectionedFormRenderer + DynamicFormTemplate)
- Permitir que el administrador agregue/quite campos de formularios sin código
- Generación PDF de cualquier formulario usando pdf-lib (ya instalado)
- Llenar campos faltantes en formularios de planeación (herramientas, equipos, EPP, certificaciones)

**Paso 4 — Contenido y Funcionalidad** (Semanas 5-8):
- KPIs contextuales CERMONT en dashboard (líneas de vida, CCTV, anclajes, HSE, costos)
- Sistema de diseño v4.0 (DESIGN.md — dark mode, bottom nav, cards responsive)
- Automatización de procesos: recordatorios inteligentes, detección de hallazgos, reportes automáticos
- Portal de descarga de históricos y archivado automático mensual

**Paso 5 — Calidad y Madurez** (Semanas 9-12):
- React Doctor ≥ 90/100
- Tests faltantes (billing modules)
- Migración de símbolos español → inglés
- Documentación técnica final

> **NOTA**: Se eliminaron los pasos de Redis, BullMQ, OpenTelemetry, Sentry, Cermont AI, sharding, CDN y ERP connectors porque requieren infraestructura externa o servicios pagos. Toda la mejora se hace con el stack existente.

---

## Roadmap por Sprints (Fase 3.2)

### Sprint 1: Fundación y Cierre de Gaps (Semanas 1-2) — 200h

**Objetivo clave**: Cerrar módulos pendientes y completar APIs críticas faltantes.

| ID | Tarea | Módulo | Estimación | Prioridad | Dependencias |
|---|---|---|---|---|---|
| S1.1 | Implementar dashboard de costos (GET /api/costs/dashboard + UI) | costs | 20h | ⭐ Crítica | — |
| S1.2 | Implementar costos de propuesta (GET /api/proposals/:id/costs + UI) | proposals | 15h | ⭐ Crítica | — |
| S1.3 | Implementar módulo de activos (CRUD + UI + historial) | assets | 30h | Alta | — |
| S1.4 | Implementar módulo de inventario + escaneo QR | inventory | 30h | Media | S1.3 (opcional) |
| S1.5 | Cerrar APIs REQUIRED_NOT_IMPLEMENTED (~15 endpoints) | multiple | 30h | ⭐ Crítica | — |
| S1.6 | Portal de descarga de históricos (UI + ZIP export) | backups | 20h | ⭐ Crítica | — |
| S1.7 | Implementar módulo dispatch + fleet básico | dispatch | 25h | Media | — |
| S1.8 | Configurar CI/CD básico (typecheck + lint + test + build) | devops | 15h | Alta | — |
| S1.9 | Migrar pruebas existentes a Vitest + Playwright | testing | 15h | Alta | — |

**Criterios de aceptación del Sprint 1:**
- [ ] Dashboard de costos muestra KPIs y gráficos funcionales
- [ ] Costos de propuesta con desglose detallado y exportable
- [ ] Módulo de activos con CRUD completo e historial
- [ ] 100% de endpoints marcados REQUIRED_NOT_IMPLEMENTED ahora son IMPLEMENTED
- [ ] Portal de descarga de históricos genera ZIP con evidencias
- [ ] CI/CD pipeline ejecuta typecheck + lint + test + build

### Sprint 2: Formularios Dinámicos + PDF + Offline (Semanas 3-4) — 200h

**Objetivo clave**: Implementar formularios dinámicos ajustables (campos configurables por el administrador), impresión PDF de todos los formularios, y mejorar la operación offline-first.

| ID | Tarea | Módulo | Estimación | Prioridad | Dependencias |
|---|---|---|---|---|---|
| S2.1 | **Formularios dinámicos ajustables** — Completar SectionedFormRenderer para que el admin pueda agregar/quitar campos; almacenar configuración en DynamicFormTemplate | forms | 50h | ⭐ Crítica | — |
| S2.2 | **PDF printing de formularios** — Implementar botón "Imprimir PDF" en todos los formularios usando pdf-lib (ya instalado). Formularios: planeación, checklists, actas, informes, SES | all | 40h | ⭐ Crítica | — |
| S2.3 | **Campos faltantes en formularios existentes** — Completar campos de herramientas, equipos, EPP, certificaciones en PlanningWizard y ExecutionSession según el formato real de planeación de obra CERMONT | planning | 35h | Alta | — |
| S2.4 | Mejora de dashboard con KPIs contextuales CERMONT (sin WebSocket) | dashboard | 30h | Alta | — |
| S2.5 | Kit builder y biblioteca de kits típicos mejorada (asociar kits a technicalCategory) | planning | 15h | Alta | — |
| S2.6 | Verificación de certificaciones antes de asignación + alertas de vencimiento | planning | 10h | Alta | — |
| S2.7 | Offline execution: cola FIFO, clientMutationId, idempotencia, UI de sync | execution | 25h | Alta | — |

**Criterios de aceptación del Sprint 2:**
- [ ] Formularios ajustables: admin puede agregar/quitar campos sin código
- [ ] Botón "Imprimir PDF" en formularios de planeación, checklists, actas, informes
- [ ] PDF generado con pdf-lib usando datos reales (no mock)
- [ ] Campos de herramientas, equipos, EPP, certificaciones completados en PlanningWizard
- [ ] Execution offline: datos guardados en IndexedDB, sincronización al reconectar

### Sprint 3: Contenido del Flujo 14 Pasos + Innovación (Semanas 5-6) — 200h

**Objetivo clave**: Completar el contenido real de cada paso del flujo de 14 pasos. Asegurar que los datos se hereden entre pasos, los bloqueadores funcionen, los formularios tengan todos los campos necesarios. Incorporar innovaciones de automatización de procesos.

**Innovaciones de automatización (basadas en investigación de tendencias FSM/CMMS open source):**

| Innovación | Descripción | Stack | Esfuerzo |
|---|---|---|---|
| Recordatorios inteligentes de pasos pendientes | Notificar al responsable cuando un paso lleva X días sin avanzar (reminder-worker.service.ts ya existe, mejorarlo) | Existente | 15h |
| PDF autogenerado al completar ejecución | Al cerrar una sesión de ejecución, generar automáticamente informe técnico borrador (pdf-lib ya instalado) | Existente | 20h |
| Detección automática de hallazgos | Al subir evidencias con categoría "defect", crear automáticamente un hallazgo en el TechnicalReport | Existente | 15h |
| Alertas de vencimiento de certificaciones | Verificar automáticamente certificaciones vencidas del personal asignado antes de la ejecución | Existente | 10h |
| Conciliación visual SES→Invoice→Payment | Panel que muestra el estado de cada documento y alerta si falta alguno | Existente | 20h |
| Archivado automático mensual (Módulo 4 LTG) | node-cron para mover órdenes completadas >30 días a colección histórica | Existente | 20h |
| Portal de descarga de históricos ZIP | Seleccionar mes/año y descargar ZIP con órdenes, PDFs y evidencias | Existente | 20h |
| Formularios precargados según tipo de servicio | Al crear un planning packet, precargar kit típico según technicalCategory (lifeline/cctv/anchor/hse) | Existente | 15h |

| ID | Tarea | Módulo | Estimación | Prioridad | Dependencias |
|---|---|---|---|---|---|
| S3.1 | **Campos faltantes paso 1-4**: WorkRequest (technicalCategory), SiteVisit (fotos, GPS), Proposal (items desglosados), PO (validación) | comercial | 30h | Alta | — |
| S3.2 | **Campos faltantes paso 5**: PlanningPacket con todos los campos del formato real (herramientas, equipos, EPP, certificaciones, AST) — llenar gaps identificados en LTG §1.3.1 | planning | 40h | Alta | S2.3 |
| S3.3 | **Campos faltantes paso 6**: ExecutionSession con checklist de seguridad pre-vuelo, timer real, categorías de evidencia | execution | 35h | Alta | — |
| S3.4 | **Pasos 7-10**: Evidencias con galería + metadatos, Informe técnico precargado, Acta con PDF + firma | reports | 30h | Alta | S3.3 |
| S3.5 | **Pasos 11-14**: SES precargado, Invoice desde SES, Payment con aging, conciliación visual | billing | 35h | Alta | — |
| S3.6 | **Innovaciones**: Implementar las 8 innovaciones de automatización listadas arriba | multiple | 30h | Alta | — |

**Criterios de aceptación del Sprint 3:**
- [ ] WorkRequest con technicalCategory (lifeline/cctv/anchor/hse/general)
- [ ] PlanningPacket con campos completos: herramientas, equipos, EPP, certificaciones
- [ ] ExecutionSession con preflight checklist + timer + categorías de evidencia
- [ ] PDF autogenerado al completar ejecución (informe técnico borrador)
- [ ] Conciliación visual: SES → Invoice → Payment funcionando
- [ ] Recordatorios: reminder-worker envía notificaciones de pasos pendientes
- [ ] Archivado automático mensual: órdenes >30 días movidas a histórica

### Sprint 4: Dashboard + KPIs CERMONT + Diseño v4.0 (Semanas 7-8) — 200h

**Objetivo clave**: Reemplazar todos los KPIs genéricos del dashboard con KPIs contextuales del dominio CERMONT (líneas de vida, CCTV, anclajes, HSE, costos). Implementar el sistema de diseño v4.0 (DESIGN.md).

**Basado en**: `PROMPT_MEJORA_KPIS_E_IMPLEMENTACION_DESIGN.md` (KPIs) + `DESIGN.md` (diseño UI/UX)

| ID | Tarea | Módulo | Estimación | Prioridad | Dependencias |
|---|---|---|---|---|---|
| S4.1 | **Schemas Zod de KPIs CERMONT** (7 schemas: lifeline, hse, execution, cctv, anchors, costs, dashboard) — en shared-types | shared-types | 40h | Alta | — |
| S4.2 | **Backend endpoints de KPIs** (7 endpoints: GET /api/kpi/* con agregaciones reales sobre datos existentes) | backend/kpi | 50h | Alta | S4.1 |
| S4.3 | **Componentes UI de KPIs** (KpiCard, KpiGrid, KpiTrend, KpiProgress, KpiAlert) con colores por dominio CERMONT | dashboard | 60h | Alta | S4.2 |
| S4.4 | **Secciones de dashboard por dominio** (LifelineSection, HseSection, CctvSection, AnchorSection, ExecutionSection, CostSection) | dashboard | 50h | Alta | S4.3 |

**Criterios de aceptación del Sprint 4:**
- [ ] 7 schemas Zod de KPIs CERMONT en shared-types (npm run typecheck pasa)
- [ ] 7 endpoints de KPIs con agregaciones reales (datos de Evidence, Checklist, CostSummary, etc.)
- [ ] KPI cards con icon-capsule semántico (40px), label, valor metric, delta, progress bar
- [ ] Dashboard organizado por dominios CERMONT con colores asignados por dominio
- [ ] Sin KPIs genéricos ("Órdenes activas", "MTTR") — solo KPIs que nombren activos CERMONT
- [ ] Estados loading (skeleton), error (retry), empty ("Sin datos para este período") en cada sección

### Sprint 5: Administración + Calidad (Semanas 9-10) — 200h

**Objetivo clave**: Mejorar paneles administrativos con contenido real, completar formularios dinámicos ajustables, subir calidad del código.

| ID | Tarea | Módulo | Estimación | Prioridad | Dependencias |
|---|---|---|---|---|---|
| S5.1 | Admin formularios dinámicos ajustables — Completar DynamicFormTemplate + SectionedFormRenderer: builder de campos, validación, persistencia, renderizado | admin/custom-fields | 40h | ⭐ Crítica | — |
| S5.2 | **Impresión PDF de formularios** — Integrar botón "Exportar PDF" en formularios dinámicos, checklists, actas, informes usando pdf-lib (ya instalado) | all | 30h | ⭐ Crítica | — |
| S5.3 | Admin backups + archivado automático mensual (node-cron) + portal de descarga ZIP | admin/backups | 35h | Alta | — |
| S5.4 | Admin auditoría (filtros, exportación, correlación requestId) | admin/audit | 20h | Media | — |
| S5.5 | Admin personnel + certificaciones (dashboard + alertas vencimiento) | admin/personnel | 20h | Media | — |
| S5.6 | Admin settings (categorizado + validación Zod) | admin/settings | 15h | Media | — |
| S5.7 | SLA management (monitoreo + dashboard visual, sin predicción IA) | sla | 20h | Media | — |
| S5.8 | React Doctor: corregir issues para subir de 76 a ≥ 90 | frontend | 20h | Alta | — |

**Criterios de aceptación del Sprint 5:**
- [ ] Formularios dinámicos ajustables: admin puede crear/editar campos sin código
- [ ] PDF export funcional en formularios dinámicos y documentos
- [ ] Archivado automático mensual con node-cron (sin colas externas)
- [ ] Portal de descarga ZIP de históricos funcional
- [ ] React Doctor ≥ 90/100
- [ ] `npm run verify` pasa completo

### Sprint 6: Diseño v4.0 + Calidad Final (Semanas 11-12) — 200h

**Objetivo clave**: Implementar el diseño v4.0 completo (DESIGN.md), corregir calidad del código, documentar.

| ID | Tarea | Módulo | Estimación | Prioridad | Dependencias |
|---|---|---|---|---|---|
| S6.1 | **Design tokens + dark mode** — Implementar tokens CSS de DESIGN.md en globals.css (surfaces, text, borders, semantic colors) con toggle dark/light | frontend | 30h | Alta | — |
| S6.2 | **Bottom nav mobile + sidebar desktop** — Navegación responsive según DESIGN.md §7-8 (bottom nav 5 ítems + FAB, sidebar 240px) | frontend | 30h | Alta | — |
| S6.3 | **Cards responsive** — Refactorizar cards con radios 24px mobile/16px desktop, touch targets ≥44px, gutter 12px | frontend | 20h | Media | — |
| S6.4 | **Iconografía unicolor** — Reemplazar emojis funcionales por Lucide React, corregir currentColor | frontend | 15h | Media | — |
| S6.5 | **Estados UI faltantes** — Agregar loading/error/empty/offline/forbidden en páginas que falten | frontend | 25h | Alta | — |
| S6.6 | E2E tests con Playwright para flujos críticos | testing | 30h | Alta | — |
| S6.7 | Migración de símbolos español → inglés + types cleanup | quality | 25h | Media | — |
| S6.8 | Documentación técnica final + despliegue CI/CD básico | docs | 25h | Alta | — |

**Criterios de aceptación del Sprint 6:**
- [ ] Design tokens implementados en globals.css (dark mode default, light toggle)
- [ ] Bottom nav funcional en mobile + sidebar en desktop
- [ ] Cards con radios 24px mobile / 16px desktop
- [ ] 0 emojis funcionales — todos reemplazados por Lucide React
- [ ] 100% de páginas críticas con estados loading/error/empty/offline
- [ ] React Doctor ≥ 90/100
- [ ] `npm run verify` pasa sin errores
- [ ] spanish-source-token < 2000
- **Implementación**: Servicio de análisis estadístico con datos agregados de MongoDB

#### 4. Análisis de Costos Predictivo (Módulo Costs)
- **Input**: Propuesta económica + datos históricos de costos reales por tipo de servicio
- **Output**: Recomendación de precio, detección de órdenes con riesgo de sobrecosto
- **Implementación**: Comparativa estadística + alertas tempranas

### Arquitectura de Automatización (sin IA externa)

La automatización de procesos se implementa usando únicamente el stack existente:

```typescript
// backend/src/modules/automation/ — Automatización sin IA externa
// 1. Recordatorios inteligentes: reminder-worker.service.ts (ya existe)
//    - Verifica pasos bloqueados por tiempo
//    - Envía notificaciones al responsable del paso
//    - Escala a supervisor si no hay avance en X días
//
// 2. PDF autogenerado: pdf-lib (ya instalado 1.17.1)
//    - Al completar ejecución → genera borrador de informe técnico
//    - Al completar acta → genera PDF de delivery record
//    - Todos los formularios dinámicos → botón "Exportar PDF"
//
// 3. Detección de hallazgos basada en reglas (no ML):
//    - Palabras clave en descripciones de evidencias → clasificación automática
//    - severity inferida desde technicalCategory + keywords
//    - Creación automática de hallazgos en TechnicalReport
//
// 4. Archivado automático con node-cron (ya en package.json):
//    - Órdenes completadas > 30 días → colección histórica
//    - ZIP descargable con evidencias y PDFs
//
// 5. Conciliación visual:
//    - Panel que cruza SES → Invoice → Payment por orderId
//    - Alertas cuando falta un documento en la cadena
```
      messages: [{ role: 'user', content: query }],
      temperature: 0.5,
    });
  }

  private buildReportPrompt(data: ReportData): string {
    return `
Eres un ingeniero experto en redacción de informes técnicos de campo.
Genera un informe técnico profesional en español con la siguiente estructura:

## 1. Datos Generales
- Orden: ${data.order.code}
- Cliente: ${data.order.clientName}
- Fecha: ${data.order.executionDate}
- Ubicación: ${data.order.location}
- Responsable: ${data.order.assignedTo}

## 2. Actividades Realizadas
[Describe detalladamente las actividades basadas en: ${JSON.stringify(data.planning.activities)}]

## 3. Evidencias
[Enumera las ${data.evidences.length} evidencias registradas con su descripción y geolocalización]

## 4. Observaciones y Novedades
[Incluye cualquier novedad reportada durante la ejecución]

## 5. Conclusiones y Recomendaciones
[Conclusiones técnicas basadas en los hallazgos]

Formato: Markdown estructurado, lenguaje técnico profesional, extensión 500-1500 palabras.
`;
  }

  private buildSystemPrompt(context: ChatContext): string {
    return `Eres Cermont AI, un asistente virtual especializado en el sistema de gestión de órdenes de trabajo de CERMONT S.A.S.

Contexto actual del usuario:
- Rol: ${context.userRole}
- Página: ${context.currentPage}
- Orden activa: ${context.activeOrderId || 'Ninguna'}

Puedes consultar la base de datos para responder preguntas sobre:
- Estado de órdenes, propuestas, facturas
- Evidencias registradas
- Costos y presupuestos
- Planeación y recursos asignados
- SLA y tiempos de servicio

Responde de forma clara y concisa en español técnico profesional.
Si no tienes suficiente información, solicita más detalles.`;
  }
}
```

### Endpoints de IA

| Método | Endpoint | Propósito | Modelo |
|---|---|---|---|
| POST | `/api/ai/chat` | Chat contextual con historial | GPT-4o-mini |
| POST | `/api/ai/generate-report` | Generar informe técnico completo | Claude 3.5 Sonnet |
| POST | `/api/ai/predict-sla` | Predecir cumplimiento de SLA | Estadístico + ML |
| POST | `/api/ai/analyze-costs` | Analizar variación de costos | GPT-4o-mini |
| POST | `/api/ai/field-assist` | Asistente de campo (voz/texto) | GPT-4o-mini + STT |

---

## Plan de Escalabilidad (Fase 3.5)

### Estrategia de Base de Datos (MongoDB)

#### Índices Recomendados por Módulo

| Colección | Índices | Justificación |
|---|---|---|
| orders | `{ status: 1, createdAt: -1 }`, `{ clientId: 1, status: 1 }`, `{ assignedTo: 1, status: 1 }` | Filtros de dashboard y listados |
| service_cases | `{ currentStep: 1, status: 1 }`, `{ orderId: 1 }` | Pipeline de 14 pasos |
| evidences | `{ orderId: 1, createdAt: -1 }`, `{ executionSessionId: 1 }` | Galería por orden |
| proposals | `{ status: 1, clientId: 1 }`, `{ workRequestId: 1 }` | Listados y vinculación |
| invoices | `{ status: 1, dueDate: 1 }`, `{ sesId: 1 }` | Dashboard facturación |
| audit_logs | `{ actor: 1, createdAt: -1 }`, `{ action: 1, entityType: 1, entityId: 1 }`, `{ requestId: 1 }` | Consultas de auditoría |
| costs | `{ orderId: 1, type: 1 }`, `{ proposalId: 1 }` | Análisis de costos |
| planning_packets | `{ orderId: 1 }`, `{ kitId: 1 }` | Planeación y kits |
| delivery_records | `{ orderId: 1, status: 1 }` | Seguimiento actas |
| ses | `{ orderId: 1, status: 1 }`, `{ aribaRef: 1 }` | Integración Ariba |
| payments | `{ invoiceId: 1 }`, `{ clientId: 1, paymentDate: -1 }` | Conciliación pagos |
| assets | `{ code: 1 }`, `{ type: 1, status: 1 }` | Gestión de activos |
| inventory | `{ code: 1 }`, `{ category: 1, quantity: { $lt: "$minQuantity" } }` | Control stock |
| fleet_vehicles | `{ plate: 1 }`, `{ soatExpiry: 1 }` | Flota vehicular |

#### Estrategia de Sharding (Futuro)

- **Shard key**: `clientId` (distribución natural por cliente)
- **Zones**: Clientes grandes en shards dedicados
- **Archivado**: Documentos > 30 días completados a BD histórica separada

### Estrategia de Caché (Redis)

| Clave | Tipo | TTL | Propósito |
|---|---|---|---|
| `dashboard:kpi:{userId}` | String (JSON) | 5 min | KPIs del dashboard |
| `dashboard:charts:{filters}` | String (JSON) | 10 min | Datos de gráficos |
| `catalog:kits` | String (JSON) | 1 hora | Catálogo de kits típicos |
| `catalog:costs` | String (JSON) | 1 hora | Catálogo de costos |
| `session:{tokenId}` | String (JSON) | 24 horas | Sesiones activas |
| `rate-limit:{ip}:{endpoint}` | Sorted Set | variable | Rate limiting |

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Cermont CI/CD
on:
  push:
    branches: [main, develop, 'sprint-*']
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  e2e:
    needs: quality
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports: ['27017:27017']
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [quality, e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t cermont-app .
      - run: docker push ${{ secrets.REGISTRY }}/cermont-app:latest
      - run: |
          ssh deploy@${{ secrets.VPS_HOST }} 'cd /app && \
          docker-compose pull && \
          docker-compose up -d'
```

### Monitoreo (OpenTelemetry + Sentry)

| Métrica | Instrumentación | Alerta |
|---|---|---|
| Latencia de endpoints | OpenTelemetry HTTP server instrumentation | >500ms p95 |
| Tasa de error endpoints | Sentry captureException | >1% en 5 min |
| Operaciones MongoDB | OpenTelemetry MongoDB instrumentation | >200ms slow query |
| Memoria VPS | Node.js process.memoryUsage | >80% RSS |
| Sincronización offline | Custom metric (sync queue size) | >100 items queue |
| Estado conexión Ariba | Custom metric (last sync timestamp) | >1 hora sin sync |
| Backup exitoso | Custom metric (last backup timestamp) | >24 horas sin backup |

### Costos de Infraestructura (Estimación Mensual)

| Recurso | Especificación | Costo estimado/mes |
|---|---|---|
| VPS Producción | Contabo: 8 vCPU, 32GB RAM, 800GB SSD | ~$35 USD |
| VPS Staging | Contabo: 4 vCPU, 16GB RAM, 400GB SSD | ~$20 USD |
| MongoDB Atlas | M20 (2 vCPU, 8GB RAM, 20GB storage) | ~$60 USD |
| Servicio | Costo | Nota |
|---|---|---|
| **Total servicios externos** | **$0 USD** | No se requiere ningún servicio pago adicional. Todo el stack actual es suficiente. |
| **Total** | | **~$181 USD/mes** |

---

## Tareas Detalladas por Módulo con Perfiles de Agente y QA Scenarios

### Convenciones para todas las tareas

**Perfiles de agente disponibles:**
- `visual-engineering`: Frontend, UI/UX, diseño, animación
- `deep`: Tareas complejas que requieren investigación y comprensión profunda
- `quick`: Tareas simples (1-3 archivos, cambios directos)
- `unspecified-high`: Tareas que no encajan en otras categorías, esfuerzo alto
- `writing`: Documentación, textos, guías

**QA Scenarios**: Cada tarea DEBE incluir escenarios de verificación ejecutables por el agente. Escenarios guardados en `.sisyphus/evidence/task-{N}-{slug}.{ext}`.

---

### Tarea 1.1: Dashboard de Costos (Sprint 1)

**Recomendado**: `unspecified-high` con skills `[nodejs-backend-patterns, mongodb-schema-design, tailwind-css-patterns]`
**Paralelización**: Wave 1 (puede correr en paralelo con T1.2, T1.3, T1.8)
**Bloquea**: T4.3 (análisis predictivo de costos)
**Bloqueado por**: Ninguno

**What to do**:
1. Crear schema Zod `CostDashboard` en `packages/shared-types/src/schemas/costs.ts` con: totalEstimated, totalActual, variance, variancePercentage, period, topVarianceOrders, monthlyTrend
2. Implementar endpoint `GET /api/costs/dashboard` con pipeline de agregación MongoDB que calcule:
   - Sumatoria de costos reales vs estimados por período
   - Top 5 órdenes con mayor variación negativa
   - Tendencia mensual (últimos 12 meses)
   - Margen bruto general
3. Implementar servicio `CostDashboardService` con queries agregadas
4. Crear UI con:
   - Tarjetas KPI: Costo Total, Costo Facturado, Margen, Variación
   - Gráfico de barras: Real vs Estimado por mes (Recharts)
   - Tabla: Top 10 órdenes con peor variación (TanStack Table)
   - Selector de período (mensual/trimestral/anual)
5. Estados: loading (skeleton), error (retry button), empty (mensaje "No hay datos"), offline (indicador + datos cacheados)

**Must NOT do**:
- No mock data en producción (usar datos reales siempre)
- No exponer datos de costos a roles no autorizados (solo gerente, residente, HES)
- No calcular costos en frontend (siempre server-side)

**QA Scenarios**:
```txt
Scenario: Happy path — Dashboard carga con datos reales
  Tool: Bash (curl)
  Preconditions: Base de datos con al menos 3 órdenes completadas con costos
  Steps:
    1. curl -X GET "http://localhost:4000/api/costs/dashboard?period=monthly" -H "Authorization: Bearer $TOKEN"
    2. curl -X GET "http://localhost:3000/dashboard" (UI carga)
  Expected Result: JSON con KPIs > 0, gráficos renderizados, tabla con 5+ filas
  Evidence: .sisyphus/evidence/task-1.1-kpi-response.json

Scenario: Error — Sin datos en período seleccionado
  Tool: Bash (curl)
  Preconditions: Base de datos vacía o filtro sin resultados
  Steps:
    1. curl -X GET "http://localhost:4000/api/costs/dashboard?period=yearly&year=2020"
  Expected Result: KPIs en 0, empty state visible en UI
  Evidence: .sisyphus/evidence/task-1.1-empty-state.json

Scenario: RBAC — Rol no autorizado recibe 403
  Tool: Bash (curl)
  Preconditions: Token de rol "tecnico" (sin acceso a costos)
  Steps:
    1. curl -X GET "http://localhost:4000/api/costs/dashboard" -H "Authorization: Bearer $TECNICO_TOKEN"
  Expected Result: HTTP 403 Forbidden
  Evidence: .sisyphus/evidence/task-1.1-rbac-error.json
```

**Acceptance Criteria**:
- [ ] Schema Zod `CostDashboard` creado con todos los campos requeridos
- [ ] Pipeline de agregación MongoDB calcula KPIs correctamente (verificado con datos de prueba)
- [ ] Endpoint GET /api/costs/dashboard responde en <500ms con 12 meses de datos
- [ ] UI muestra KPIs, gráfico de barras y tabla de variación
- [ ] Estados loading, error, empty implementados
- [ ] RBAC: solo gerente, residente, HES pueden acceder

---

### Tarea 1.2: Costos de Propuesta (Sprint 1)

**Recomendado**: `unspecified-high` con skills `[nodejs-backend-patterns, zod, tailwind-css-patterns]`
**Paralelización**: Wave 1 (paralelo con T1.1, T1.3, T1.8)
**Bloquea**: Ninguno
**Bloqueado por**: Ninguno

**What to do**:
1. Schema Zod `ProposalCostBreakdown` con: items[] (description, quantity, unitPrice, total), subtotal, tax, totalWithTax
2. Endpoint `GET /api/proposals/:id/costs` (implementar el REQUIRED)
3. Servicio de recálculo de totales en backend (regla de integridad: recalcular antes de aprobar)
4. UI en `/proposals/[id]/costs` con:
   - Tabla de ítems editable (React Hook Form + Zod)
   - Cálculo automático de subtotal, IVA (19%), total
   - Botón "Guardar" y "Exportar PDF"
5. PDF de propuesta generado con pdf-lib (template profesional con logo CERMONT)

**QA Scenarios**:
```txt
Scenario: Happy path — Costos de propuesta calculados correctamente
  Tool: Bash (curl)
  Preconditions: Propuesta existente con 3+ items
  Steps:
    1. curl -X GET "http://localhost:4000/api/proposals/:id/costs" -H "Authorization: Bearer $TOKEN"
    2. curl http://localhost:3000/proposals/:id/costs (UI carga)
  Expected Result: JSON con items[] donde total = quantity * unitPrice, subtotal = sum(totals), totalWithTax = subtotal * 1.19
  Evidence: .sisyphus/evidence/task-1.2-costs-response.json

Scenario: Error — Propuesta no existe
  Tool: Bash (curl)
  Steps:
    1. curl -X GET "http://localhost:4000/api/proposals/nonexistent-id/costs"
  Expected Result: HTTP 404 PROPOSAL_NOT_FOUND
  Evidence: .sisyphus/evidence/task-1.2-not-found.json
```

**Acceptance Criteria**:
- [ ] Schema Zod `ProposalCostBreakdown` creado
- [ ] Endpoint GET /api/proposals/:id/costs implementado
- [ ] Cálculos (subtotal, tax, total) correctos verificados con datos de prueba
- [ ] PDF de propuesta generado con template profesional
- [ ] Ruta /proposals/[id]/costs funcional y responsiva

---

### Tarea 1.3: Módulo de Activos (Sprint 1)

**Recomendado**: `unspecified-high` con skills `[nodejs-backend-patterns, zod, tailwind-css-patterns, mongodb-schema-design]`
**Paralelización**: Wave 1 (paralelo con T1.1, T1.2, T1.8)
**Bloquea**: T1.4 (inventario), T5.2 (vinculación con mantenimiento)
**Bloqueado por**: Ninguno

**What to do**:
1. Schema Zod `Asset` en shared-types con: code, name, type (enum: tool/equipment/vehicle/machinery), brand, model, serialNumber, location, status, acquisitionDate, value, category, certificates[]
2. Schema `AssetCertificate` con: type, issuer, issueDate, expiryDate, fileUrl
3. Modelo Mongoose `AssetModel` con índices en: code (unique), type + status, location
4. Endpoints CRUD completos:
   - `GET /api/assets` — Lista con paginación, filtros (type, status, location)
   - `GET /api/assets/:id` — Detalle con certificados e historial
   - `POST /api/assets` — Crear activo (solo gerente/residente)
   - `PUT /api/assets/:id` — Actualizar activo
   - `DELETE /api/assets/:id` — Soft delete (lifecycleStatus: "deleted")
5. UI con:
   - Lista: TanStack Table con columnas código, nombre, tipo, estado, ubicación, próxima calibración
   - Detalle: Información general, certificados, historial de intervenciones
   - Formulario creación/edición con React Hook Form + Zod
6. Estados loading/error/empty en todas las vistas

**QA Scenarios**:
```txt
Scenario: Happy path — Crear y listar activos
  Tool: Bash (curl)
  Preconditions: Autenticado como gerente
  Steps:
    1. POST /api/assets con body: { code: "EQ-001", name: "Multímetro Fluke 87V", type: "tool", status: "available" }
    2. GET /api/assets
  Expected Result: Código 201, activo creado con id. Lista incluye el nuevo activo.
  Evidence: .sisyphus/evidence/task-1.3-asset-create.json

Scenario: Error — Código duplicado
  Tool: Bash (curl)
  Preconditions: Activo con code "EQ-001" ya existe
  Steps:
    1. POST /api/assets con body: { code: "EQ-001", ... }
  Expected Result: HTTP 409 ASSET_CODE_EXISTS
  Evidence: .sisyphus/evidence/task-1.3-duplicate-code.json

Scenario: Empty — Sin activos registrados
  Tool: Bash (curl) + Playwright
  Steps:
    1. Abrir http://localhost:3000/assets
  Expected Result: Empty state: "No hay activos registrados. Cree el primer activo."
  Evidence: .sisyphus/evidence/task-1.3-empty-state.png
```

**Acceptance Criteria**:
- [ ] Schema Zod `Asset` con todos los campos + certificados
- [ ] CRUD completo de activos (5 endpoints)
- [ ] Soft delete implementado
- [ ] TanStack Table con filtros y paginación
- [ ] Estados loading/error/empty en UI
- [ ] RBAC: solo gerente/residente pueden crear/editar/eliminar

---

### Tarea 1.4: Módulo de Inventario + Escaneo QR (Sprint 1)

**Recomendado**: `unspecified-high` con skills `[nodejs-backend-patterns, zod, tailwind-css-patterns]`
**Paralelización**: Wave 2 (después de T1.3)
**Bloquea**: Ninguno
**Bloqueado por**: T1.3 (Assets)

**What to do**:
1. Schema Zod: `InventoryItem` (code, name, category, minQuantity, currentQuantity, unit, location) y `InventoryMovement` (itemId, type: entry/exit, quantity, responsibleId, orderId, timestamp)
2. Endpoints:
   - `GET /api/inventory` — Lista con stock bajo destacado
   - `POST /api/inventory/movements` — Registrar entrada/salida
   - `GET /api/inventory/movements/:itemId` — Historial del ítem
   - `POST /api/inventory/scan` — Validar QR/Barcode recibido, devolver item detail
3. UI:
   - Dashboard de inventario: tarjetas por categoría con indicador stock bajo (rojo < min, ámbar < min*1.5)
   - Modal de escaneo QR con cámara (@zxing/library)
   - Formulario de movimiento: itemId, tipo, cantidad, orden (opcional)
4. Servicio de alertas de stock mínimo (BullMQ cron diario)

**QA Scenarios**:
```txt
Scenario: Happy path — Registrar entrada de inventario
  Tool: Bash (curl)
  Steps:
    1. POST /api/inventory/movements { itemId, type: "entry", quantity: 10, notes: "Compra mensual" }
    2. GET /api/inventory/:itemId
  Expected Result: currentQuantity incrementado en 10, historial muestra la entrada
  Evidence: .sisyphus/evidence/task-1.4-movement-entry.json

Scenario: QR scan devuelve item
  Tool: Bash (curl)
  Steps:
    1. POST /api/inventory/scan { qrData: "INV-001" }
  Expected Result: JSON con el item completo { code, name, quantity, location, ... }
  Evidence: .sisyphus/evidence/task-1.4-qr-scan.json

Scenario: Empty — Sin movimientos
  Tool: Playwright
  Steps:
    1. Abrir /inventory/movements/:itemId para item sin movimientos
  Expected Result: Empty state "No hay movimientos registrados"
  Evidence: .sisyphus/evidence/task-1.4-empty-movements.png
```

**Acceptance Criteria**:
- [ ] Schema Zod `InventoryItem` e `InventoryMovement` creados
- [ ] CRUD de inventario + movimientos implementados
- [ ] Escaneo QR funcional (mock de cámara)
- [ ] Indicador visual de stock bajo
- [ ] Alerta automática de stock mínimo (cron diario)

---

### Tarea 1.5: Cerrar APIs REQUIRED_NOT_IMPLEMENTED (~15 endpoints)

**Recomendado**: `quick` con skills `[nodejs-backend-patterns, zod]`
**Paralelización**: Wave 1 (puede dividirse en 3 sub-tareas paralelas)
**Bloquea**: Múltiples tareas en Sprints 2-3
**Bloqueado por**: Ninguno

**What to do**:
Implementar los siguientes endpoints marcados como REQUIRED en FRONTEND_ROUTE_MAP y API_ENDPOINT_MATRIX:

**Bloque Execution** (5 endpoints):
- `GET /api/execution` — Listar sesiones con paginación
- `POST /api/execution` — Crear sesión (orderId, startDate, location, notes)
- `PUT /api/execution/:id` — Actualizar sesión (status, progress, notes)
- `POST /api/execution/:id/pause` — Pausar sesión con razón
- `POST /api/execution/:id/complete` — Completar con summary + checklistResults

**Bloque Delivery Records** (4 endpoints):
- `GET /api/delivery-records` — Listar actas
- `GET /api/delivery-records/:id` — Detalle
- `POST /api/delivery-records` — Crear acta
- `POST /api/delivery-records/:id/sign` — Firma digital

**Bloque SES** (4+ endpoints):
- `GET /api/ses` — Listar SES
- `GET /api/ses/:id` — Detalle
- `POST /api/ses` — Crear SES
- `POST /api/ses/:id/submit` — Enviar a Ariba

**Otros**:
- `POST /api/proposals/:id/approve` (si no está completo)
- `POST /api/orders/:id/assign` — Asignar personal

Cada endpoint debe seguir el formato Contract-First:
1. Zod schema de request/response (o reutilizar existente)
2. Servicio con lógica de negocio
3. Controller delgado
4. Ruta con validación Zod + RBAC

**QA Scenarios** (por cada endpoint, al menos happy + error):
```txt
Scenario: Happy path — POST /api/execution
  Tool: Bash (curl)
  Preconditions: Orden en estado "planned"
  Steps:
    1. POST /api/execution { orderId, startDate: "2026-07-15", location: "Campo Caño Limón", notes: "Inicio programado" }
  Expected Result: 201 Created, execution session con status "in_progress"
  Evidence: .sisyphus/evidence/task-1.5-execution-create.json

Scenario: Error — Orden no encontrada
  Tool: Bash (curl)
  Steps:
    1. POST /api/execution { orderId: "invalid", ... }
  Expected Result: 404 ORDER_NOT_FOUND
  Evidence: .sisyphus/evidence/task-1.5-execution-notfound.json
```

**Acceptance Criteria**:
- [ ] Endpoints marcados REQUIRED ahora son IMPLEMENTED
- [ ] Cada endpoint tiene validación Zod + RBAC
- [ ] Cada endpoint tiene al menos 1 test de integración
- [ ] API matrix actualizada

---

### Tarea 1.6: Portal de Descarga de Históricos (Sprint 1)

**Recomendado**: `unspecified-high` con skills `[nodejs-backend-patterns, mongodb-schema-design]`
**Paralelización**: Wave 1
**Bloquea**: T5.3 (archivado automático)
**Bloqueado por**: Ninguno

**What to do**:
1. Interfaz de administración para seleccionar mes/año a exportar
2. Servicio backend que:
   - Consulta órdenes completadas + facturadas del período
   - Genera ZIP con: CSV de órdenes, PDFs de informes, evidencias (imágenes comprimidas)
   - Almacena el ZIP en S3/MinIO con TTL de 7 días
   - Devuelve URL de descarga firmada
3. Endpoints:
   - `POST /api/admin/historical/export` — Inicia generación de ZIP (async, devuelve jobId)
   - `GET /api/admin/historical/status/:jobId` — Estado del job (processing/ready/error)
   - `GET /api/admin/historical/download/:jobId` — Descargar ZIP
4. BullMQ job queue para generación asíncrona
5. Servicio de limpieza de ZIPs viejos (>7 días)

**QA Scenarios**:
```txt
Scenario: Happy path — Exportar histórico mensual
  Tool: Bash (curl)
  Preconditions: 5+ órdenes completadas en junio 2026
  Steps:
    1. POST /api/admin/historical/export { month: 6, year: 2026 }
    2. GET /api/admin/historical/status/:jobId (poll cada 2s hasta "ready")
    3. GET /api/admin/historical/download/:jobId
  Expected Result: ZIP descargable con CSV + PDFs + imágenes
  Evidence: .sisyphus/evidence/task-1.6-export.zip

Scenario: Error — Mes sin datos
  Tool: Bash (curl)
  Steps:
    1. POST /api/admin/historical/export { month: 6, year: 2025 }
  Expected Result: Job se completa pero ZIP contiene mensaje "Sin datos para el período seleccionado"
  Evidence: .sisyphus/evidence/task-1.6-empty-export.json
```

**Acceptance Criteria**:
- [ ] Portal de selección de mes/año funcional
- [ ] Generación asíncrona de ZIP con BullMQ
- [ ] ZIP contiene: CSV de órdenes + PDFs de informes + evidencias
- [ ] URL de descarga firmada con expiración de 7 días
- [ ] Limpieza automática de ZIPs viejos

---

### Tarea 2.1: Offline-First Completo para Execution (Sprint 2)

**Recomendado**: `deep` con skills `[nodejs-best-practices, playwright-best-practices, nodejs-backend-patterns]`
**Paralelización**: Wave 2 (depende de T1.5)
**Bloquea**: T2.2 (evidencias offline)
**Bloqueado por**: T1.5 (APIs de execution)

**What to do**:
1. **IndexedDB layer** (Dexie.js):
   - Schema: `executionSessions`, `checklistItems`, `materialsUsed`, `laborHours`
   - Cada registro con: `id` (local autoincrement), `serverId` (nullable, asignado post-sync), `clientMutationId` (uuid), `synced` (boolean), `lastModified`
2. **Sync service**:
   - Enqueue: Cuando el usuario crea/modifica datos offline, se guardan en IndexedDB con `synced: false`
   - Sync trigger: Al recuperar conexión (evento `window.online`), se procesa la cola FIFO
   - Idempotencia: Cada payload incluye `clientMutationId`, el servidor rechaza duplicados
   - DLQ (Dead Letter Queue): Errores de sync se guardan en tabla `syncErrors` con reintento automático (3 intentos, backoff exponencial)
3. **UI de sincronización**:
   - Badge en navbar: "3 pendientes" con color ámbar, "Sincronizando..." con spinner, "Todo sincronizado" en verde
   - Lista de items pendientes con botón de reintento individual
   - Toast al completar sync
4. **Service Worker** (Serwist):
   - App-shell cache (HTML, JS, CSS)
   - No cachear API mutations (solo GETs)
   - Fallback a IndexedDB cuando fetch falla
5. **Endpoints backend**:
   - `POST /api/execution-sessions/:id/sync` — Acepta payload completo de sesión (checklist + materiales + horas + fotos)
   - Idempotencia: verifica `clientMutationId`, si ya existe responde 200 con el serverId

**Código de referencia**:
```typescript
// frontend/lib/offline/sync-queue.service.ts
import Dexie from 'dexie';

export class SyncQueueService {
  private db: Dexie;

  constructor() {
    this.db = new Dexie('CermontOffline');
    this.db.version(1).stores({
      pendingMutations: '++id, entityType, entityId, createdAt',
      syncErrors: '++id, entityType, entityId, retryCount, lastError',
    });
  }

  async enqueue(entityType: string, payload: Record<string, unknown>) {
    await this.db.table('pendingMutations').add({
      entityType,
      payload: { ...payload, clientMutationId: crypto.randomUUID() },
      createdAt: new Date(),
      retryCount: 0,
    });
    this.attemptSync();
  }

  async attemptSync() {
    const pending = await this.db.table('pendingMutations')
      .orderBy('createdAt')
      .toArray();

    for (const mutation of pending) {
      try {
        const response = await apiClient.post(`/api/${mutation.entityType}/sync`, mutation.payload);
        await this.db.table('pendingMutations').delete(mutation.id);
        this.notifySyncComplete(response.data);
      } catch (error) {
        mutation.retryCount++;
        if (mutation.retryCount >= 3) {
          await this.db.table('syncErrors').add({
            ...mutation,
            lastError: error.message,
            movedToDLQ: new Date(),
          });
          await this.db.table('pendingMutations').delete(mutation.id);
        } else {
          await this.db.table('pendingMutations').put(mutation);
          // Backoff exponencial: 2s, 4s, 8s
          setTimeout(() => this.attemptSync(), 2000 * Math.pow(2, mutation.retryCount - 1));
        }
      }
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const pending = await this.db.table('pendingMutations').count();
    const errors = await this.db.table('syncErrors').count();
    if (errors > 0) return 'error';
    if (pending > 0) return 'pending';
    return 'synced';
  }
}
```

**QA Scenarios**:
```txt
Scenario: Happy path — Offline execution sync
  Tool: Playwright
  Preconditions: Navegador en modo offline (devtools -> Network -> Offline)
  Steps:
    1. Ir a /orders/[id]/execution (cargado previamente)
    2. Completar checklist (3 items)
    3. Agregar material usado ("Tubería PVC 2\" x 5 und")
    4. Registrar 2 horas laborales
    5. Salir del modo offline
    6. Esperar sync automático (máx 10s)
  Expected Result: Badge cambia a "Todo sincronizado" en verde. Al recargar la página online, datos persisten del servidor.
  Evidence: .sisyphus/evidence/task-2.1-offline-sync.mp4

Scenario: Error — Conflicto de sync (clientMutationId duplicado)
  Tool: Bash (curl)
  Preconditions: Mutation con clientMutationId "abc-123" ya existe en servidor
  Steps:
    1. POST /api/execution-sessions/:id/sync { clientMutationId: "abc-123", ... }
  Expected Result: HTTP 200 (no 409), servidor responde "Already processed" + serverId existente
  Evidence: .sisyphus/evidence/task-2.1-idempotent-sync.json

Scenario: DLQ — 3 intentos fallidos
  Tool: Playwright + Bash
  Preconditions: Servidor offline (docker stop backend)
  Steps:
    1. Completar execution offline
    2. Activar online (servidor sigue caído)
    3. Esperar 3 intentos de sync con backoff
  Expected Result: Mutation movida a syncErrors, toast "Error de sincronización. Reintentar manualmente."
  Evidence: .sisyphus/evidence/task-2.1-dlq-state.json
```

**Acceptance Criteria**:
- [ ] Dexie.js configurado con schemas executionSessions, checklistItems, materialsUsed, laborHours
- [ ] Sync service: FIFO, idempotente (clientMutationId), backoff exponencial
- [ ] DLQ: 3 intentos máximos, errores visibles en UI
- [ ] UI de estado de sync: badge global + lista pendientes + reintento individual
- [ ] Service Worker: app-shell cache, no cachear mutations
- [ ] Endpoint POST /api/execution-sessions/:id/sync implementado

---

### Tarea 2.2: Galería de Evidencias Mejorada (Sprint 2)

**Recomendado**: `visual-engineering` con skills `[tailwind-css-patterns, playwright-best-practices]`
**Paralelización**: Wave 2 (independiente de T2.1 pero mismo sprint)
**Bloquea**: Ninguno
**Bloqueado por**: Ninguno

**What to do**:
1. **Grid de galería**:
   - 3 columnas en desktop, 2 en tablet, 1 en mobile
   - Thumbnails con lazy loading (next/image o IntersectionObserver)
   - Overlay al hover: nombre, fecha, categoría
2. **Lightbox**:
   - Click en thumbnail -> modal fullscreen
   - Navegación: teclado (← →), swipe mobile, botones
   - Metadatos: descripción, geolocalización (mapa Leaflet embed), fecha, técnico
   - Botón descargar original
3. **Captura de evidencia**:
   - Botón "Agregar evidencia" -> modal con:
   - Cámara: navigator.mediaDevices.getUserMedia (priorizar cam trasera en mobile)
   - Geolocalización automática: navigator.geolocation.getCurrentPosition
   - Categoría: Fotografía, Checklist, Novedad, Firma (select)
   - Campo de descripción
   - Drag & drop de archivos (react-dropzone)
4. **Cola de sincronización**:
   - Indicador por evidencia: icono check (synced), spinner (pending), alert-triangle (error)
   - Botón de reintento individual
   - Progreso global: "5 de 12 evidencias sincronizadas"
5. **Backend**: Endpoint `POST /api/evidences/batch` para subida batch offline

**QA Scenarios**:
```txt
Scenario: Happy path — Ver galería con 10+ evidencias
  Tool: Playwright
  Preconditions: Orden con 10+ evidencias subidas
  Steps:
    1. Ir a /orders/[id]/evidences
    2. Verificar grid responsivo
    3. Hover sobre thumbnail -> overlay visible
    4. Click para abrir lightbox
    5. Navegar con tecla derecha (->) 3 veces
    6. Cerrar lightbox con Escape
  Expected Result: Grid 3 columnas, overlay al hover, lightbox funcional, navegación por teclado
  Evidence: .sisyphus/evidence/task-2.2-gallery-grid.png

Scenario: Offline — Capturar evidencia sin conexión
  Tool: Playwright
  Preconditions: Modo offline activado
  Steps:
    1. Click "Agregar evidencia"
    2. Seleccionar archivo de prueba
    3. Ingresar descripción "Prueba offline"
    4. Click "Guardar"
    5. Salir de offline
  Expected Result: Evidencia guardada en IndexedDB, badge "1 pendiente", sync automático al volver online
  Evidence: .sisyphus/evidence/task-2.2-offline-evidence.png

Scenario: Error — Archivo muy grande (>20MB)
  Tool: Playwright
  Steps:
    1. Click "Agregar evidencia"
    2. Seleccionar archivo de 25MB
  Expected Result: Error message "El archivo excede el límite de 20MB"
  Evidence: .sisyphus/evidence/task-2.2-file-too-large.png
```

**Acceptance Criteria**:
- [ ] Grid responsivo 3/2/1 columnas con lazy loading
- [ ] Lightbox con navegación teclado + swipe
- [ ] Captura de evidencia con cámara + geolocalización automática
- [ ] Categorías: Fotografía, Checklist, Novedad, Firma
- [ ] Cola de sincronización con estado por evidencia
- [ ] Batch upload endpoint implementado

---

### Tarea 2.3: Wizard de Planificación 6 Pasos (Sprint 2)

**Recomendado**: `visual-engineering` con skills `[tailwind-css-patterns, zod, react-hook-form]`
**Paralelización**: Wave 2
**Bloquea**: T2.1 (execution depende de planning aprobado)
**Bloqueado por**: T1.5 (APIs planning)

**What to do**:
1. Wizard con 6 pasos navegables (anterior/siguiente + stepper header):
   - **Paso 1: Cronograma** — Calendario con fechas de inicio y fin, duración estimada
   - **Paso 2: Personal** — Selector múltiple de personal con indicador de certificaciones vigentes/vencidas
   - **Paso 3: Herramientas y equipos** — Catálogo + búsqueda + cantidades, agrupado por kit típico
   - **Paso 4: Materiales y consumibles** — Tabla editable (nombre, cantidad, unidad)
   - **Paso 5: ASTs y documentos de seguridad** — Checkbox de ASTs requeridos, upload de documentos
   - **Paso 6: Revisión y aprobación** — Resumen de todos los pasos, firma digital
2. Cada paso valida con Zod antes de permitir avanzar
3. Borrador guardado en IndexedDB en cada cambio de paso
4. Al completar: POST a API de planning, redirige a detalle

**Código de referencia**:
```tsx
// frontend/modules/planning/ui/PlanningWizard.tsx
const STEPS = ['Cronograma', 'Personal', 'Herramientas', 'Materiales', 'ASTs', 'Aprobación'];

export function PlanningWizard({ orderId }: { orderId: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const methods = useForm<PlanningFormData>({
    resolver: zodResolver(PlanningFormSchema),
    defaultValues: { /* valores por defecto estables */ },
  });

  // Auto-save draft on step change
  const { watch } = methods;
  useEffect(() => {
    const subscription = watch(async (data) => {
      await savePlanningDraft(orderId, currentStep, data);
    });
    return () => subscription.unsubscribe();
  }, [orderId, currentStep, watch]);

  const canAdvance = async () => {
    const result = await methods.trigger(getFieldsForStep(currentStep));
    return result;
  };

  return (
    <div className="space-y-6">
      <Stepper currentStep={currentStep} steps={STEPS} />
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {currentStep === 0 && <CronogramaStep control={methods.control} />}
        {currentStep === 1 && <PersonalStep control={methods.control} />}
        {currentStep === 2 && <HerramientasStep control={methods.control} />}
        {currentStep === 3 && <MaterialesStep control={methods.control} />}
        {currentStep === 4 && <ASTsStep control={methods.control} />}
        {currentStep === 5 && <ResumenStep formData={methods.watch()} />}
        <WizardNavigation
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onBack={() => setCurrentStep((p) => p - 1)}
          onNext={async () => {
            if (await canAdvance()) setCurrentStep((p) => p + 1);
          }}
          onSubmit={methods.handleSubmit(onSubmit)}
        />
      </form>
    </div>
  );
}
```

**QA Scenarios**:
```txt
Scenario: Happy path — Completar wizard 6 pasos
  Tool: Playwright
  Preconditions: Orden en estado "pending_planning"
  Steps:
    1. Ir a /orders/[id]/planning
    2. Paso 1: Seleccionar fechas, duración 3 días -> Siguiente
    3. Paso 2: Seleccionar 2 técnicos -> Siguiente
    4. Paso 3: Agregar kit "Instalación CCTV" -> Siguiente
    5. Paso 4: Agregar material "Cable coaxial 50m" -> Siguiente
    6. Paso 5: Marcar AST Alturas + AST Eléctrico -> Siguiente
    7. Paso 6: Verificar resumen, firmar digitalmente, click "Completar"
  Expected Result: POST exitoso, redirigido a detalle, planning status "approved"
  Evidence: .sisyphus/evidence/task-2.3-wizard-complete.mp4

Scenario: Error — Personal sin certificaciones vigentes
  Tool: Playwright
  Preconditions: Técnico "Juan Pérez" tiene certificación de alturas vencida
  Steps:
    1. Paso 2: Seleccionar "Juan Pérez"
  Expected Result: Indicador rojo "Certificación de alturas vencida (expiró 2026-01-15)"
  Evidence: .sisyphus/evidence/task-2.3-cert-expired.png
```

**Acceptance Criteria**:
- [ ] Wizard 6 pasos con navegación forward/backward
- [ ] Validación Zod por paso
- [ ] Borrador guardado en IndexedDB automáticamente
- [ ] Kits típicos seleccionables por tipo de servicio
- [ ] Verificación visual de certificaciones (verde/rojo/ámbar)
- [ ] Firma digital en paso de aprobación
- [ ] Paso 6 muestra resumen completo antes de enviar

---

### Tarea 3.1: SES/Ariba — CRUD + Integración (Sprint 3)

**Recomendado**: `unspecified-high` con skills `[nodejs-backend-patterns, mongodb-schema-design, zod]`
**Paralelización**: Wave 3 (depende de T1.5)
**Bloquea**: T3.2 (facturación), T3.4 (conciliación 3 vías)
**Bloqueado por**: T1.5 (APIs de delivery records y SES)

**What to do**:
1. Schema Zod `ServiceEntrySheet` completo con: orderId, deliveryRecordId, aribaRef, items[], subtotal, taxes, total, status (draft/submitted/approved/rejected), version
2. Endpoints completos:
   - `GET /api/ses` — Lista paginada con filtros (status, orderId, date range)
   - `GET /api/ses/:id` — Detalle con todos los campos
   - `POST /api/ses` — Crear SES (solo si delivery record firmado existe)
   - `PUT /api/ses/:id` — Actualizar (solo en draft)
   - `POST /api/ses/:id/submit` — Enviar a Ariba
   - `POST /api/ses/:id/approve` — Aprobar SES
   - `POST /api/ses/:id/reject` — Rechazar con motivo
3. `AribaConnectorService`:
   - Cliente HTTP REST para SAP Ariba API
   - Métodos: submitSES, getSESStatus, getSESList
   - Configurable desde admin (endpoint, credenciales, timeout)
   - Logging de todas las interacciones
4. `SESReconciliationService`:
   - Verificar que SES coincide con Invoice (montos, ítems, referencias)
   - Generar reporte de discrepancias
5. UI:
   - Lista con TanStack Table + filtros
   - Formulario de creación con items dinámicos
   - Timeline: Draft -> Enviado -> En Revisión -> Aprobado/Rechazado
   - PDF preview

**QA Scenarios**:
```txt
Scenario: Happy path — Crear y enviar SES a Ariba
  Tool: Bash (curl) + Playwright
  Preconditions: Delivery record firmado existe, Ariba mock configurado
  Steps:
    1. POST /api/ses { orderId, deliveryRecordId, items: [{description: "Mantenimiento CCTV", quantity: 1, unitPrice: 5000000}] }
    2. POST /api/ses/:id/submit
    3. Verificar timeline en UI
  Expected Result: SES creada en draft, luego status cambia a "submitted", timeline refleja envío
  Evidence: .sisyphus/evidence/task-3.1-ses-submit.json

Scenario: Error — SES sin delivery record firmado
  Tool: Bash (curl)
  Preconditions: Orden sin delivery record firmado
  Steps:
    1. POST /api/ses { orderId, deliveryRecordId: null, ... }
  Expected Result: 422 DELIVERY_RECORD_REQUIRED
  Evidence: .sisyphus/evidence/task-3.1-ses-no-dr.json

Scenario: Reconciliación — Discrepancia SES vs Invoice
  Tool: Bash (curl)
  Preconditions: SES con total 5,000,000 e Invoice con total 4,800,000
  Steps:
    1. GET /api/ses/:id/reconciliation
  Expected Result: Discrepancia detectada: "El total del SES (5,000,000) difiere del total de la factura (4,800,000)"
  Evidence: .sisyphus/evidence/task-3.1-reconciliation-discrepancy.json
```

**Acceptance Criteria**:
- [ ] Schema Zod SES completo con items, estados, version
- [ ] CRUD completo (7 endpoints)
- [ ] Gate: no crear SES sin delivery record firmado
- [ ] AribaConnectorService con mock funcional
- [ ] Timeline de estado en UI
- [ ] PDF de SES generado automáticamente
- [ ] Reconciliación SES vs Invoice implementada

---

### Tarea 3.2: Facturación Electrónica (Sprint 3)

**Recomendado**: `deep` con skills `[nodejs-backend-patterns, zod, tailwind-css-patterns]`
**Paralelización**: Wave 3 (depende de T3.1)
**Bloquea**: T3.3 (pagos), T3.4 (conciliación 3 vías)
**Bloqueado por**: T3.1 (SES)

**What to do**:
1. Schema Zod `Invoice` con: sesId, number (formato legal: PREFEJO-NNN), issueDate, dueDate, items[], subtotal, tax (19%), total, status (draft/issued/sent/approved/paid/cancelled), dianReference
2. Endpoints:
   - `GET /api/invoices` — Lista con dashboard KPIs
   - `POST /api/invoices` — Crear desde SES aprobada (precargar items)
   - `POST /api/invoices/:id/send-dian` — Enviar a DIAN (facturación electrónica)
   - `POST /api/invoices/:id/approve` — Aprobar
   - `GET /api/invoices/dashboard` — KPIs agregados
3. **Generación PDF**: Template legal colombiano con:
   - Resolución DIAN (número, fecha)
   - Numeración consecutiva por prefijo
   - Logo CERMONT, NIT, dirección
   - Items, subtotal, IVA 19%, total
   - Código QR con CUFE (Código Único de Facturación Electrónica)
4. **Integración DIAN** (sandbox):
   - Cliente REST para servicios DIAN
   - Generación de CUFE (SHA-256 de datos de factura)
   - Envío, consulta de estado, recepción de acuse
5. Dashboard de facturación en UI:
   - Tarjetas: Por emitir, Emitidas, Vencidas, Pagadas
   - Gráfico de morosidad por cliente
   - Tabla con días de vencimiento y alertas

**QA Scenarios**:
```txt
Scenario: Happy path — Crear factura desde SES y enviar a DIAN
  Tool: Bash (curl) + Playwright
  Preconditions: SES aprobada existe
  Steps:
    1. Ir a /billing/invoices/new, seleccionar SES
    2. Verificar items precargados
    3. Generar PDF preview
    4. Enviar a DIAN (sandbox)
  Expected Result: Invoice creada con items de SES, PDF generado, status "issued", CUFE generado
  Evidence: .sisyphus/evidence/task-3.2-invoice-pdf.pdf

Scenario: Error — Factura sin SES aprobada
  Tool: Bash (curl)
  Preconditions: SES en status "draft"
  Steps:
    1. POST /api/invoices { sesId: "ses-id" }
  Expected Result: 422 SES_NOT_APPROVED
  Evidence: .sisyphus/evidence/task-3.2-invoice-no-ses.json

Scenario: Dashboard — KPIs de facturación
  Tool: Playwright
  Preconditions: 10+ facturas en varios estados
  Steps:
    1. Ir a /billing/invoices
  Expected Result: Tarjetas KPI con conteos correctos, gráfico de morosidad, tabla con vencimientos
  Evidence: .sisyphus/evidence/task-3.2-invoice-dashboard.png
```

**Acceptance Criteria**:
- [ ] Schema Zod Invoice completo con formato legal colombiano
- [ ] PDF de factura con resolución DIAN, numeración, IVA, CUFE
- [ ] Integración DIAN sandbox: envío + consulta estado
- [ ] Dashboard de facturación con KPIs y alertas de vencimiento
- [ ] Gate: no crear factura sin SES aprobada
- [ ] Cálculo automático de subtotal, IVA (19%), total

---

### Tarea 4.1: Cermont AI Chat Contextual (Sprint 4)

**Recomendado**: `deep` con skills `[nodejs-backend-patterns, nodejs-best-practices]`
**Paralelización**: Wave 4
**Bloquea**: T4.2, T4.3, T4.4
**Bloqueado por**: Ninguno

**What to do**:
1. **Vercel AI SDK setup**:
   - `npm install ai @ai-sdk/openai @ai-sdk/anthropic`
   - Provider config: OpenAI para chat (rápido), Anthropic para informes (preciso)
2. **Context builder**: Servicio que recopila contexto de la página actual:
   - Datos de la orden/entidad visible
   - Historial de conversación (últimos 10 mensajes)
   - Rol del usuario y permisos
   - Acciones disponibles en la UI
3. **RAG (Retrieval Augmented Generation)**:
   - Almacenar embeddings de documentos en MongoDB Atlas Vector Search
   - Al hacer query, buscar documentos relevantes por similitud coseno
   - Incluir resultados en el prompt como contexto
4. **Endpoint**: `POST /api/ai/chat` con streaming:
   - Accept: `{ query: string, context: { page, entityId, entityType } }`
   - Response: SSE (Server-Sent Events) stream con tokens
5. **UI Widget**: Sidebar/drawer de chat:
   - Input de texto + botón enviar
   - Mensajes formateados (markdown ligero)
   - Indicador de "pensando..." con animación
   - Botón de limpiar conversación
   - Colapsable (toggle en sidebar)

**Código de referencia**:
```typescript
// backend/src/services/ai/ai-chat.service.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export class AIChatService {
  async chatStream(query: string, context: ChatContext, history: Message[]) {
    // Construir system prompt con contexto
    const systemPrompt = this.buildContextPrompt(context);

    // Definir herramientas disponibles para el AI
    const tools = {
      getOrderStatus: tool({
        description: 'Obtener el estado actual de una orden de trabajo',
        parameters: z.object({ orderId: z.string() }),
        execute: async ({ orderId }) => this.orderRepo.getStatus(orderId),
      }),
      getEvidencesCount: tool({
        description: 'Obtener el conteo de evidencias de una orden',
        parameters: z.object({ orderId: z.string() }),
        execute: async ({ orderId }) => this.evidenceRepo.countByOrder(orderId),
      }),
      getCostVariance: tool({
        description: 'Obtener la variación de costos de una orden',
        parameters: z.object({ orderId: z.string() }),
        execute: async ({ orderId }) => this.costService.getVariance(orderId),
      }),
    };

    return streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: history,
      tools,
      maxSteps: 3, // Permitir múltiples tool calls
    });
  }

  private buildContextPrompt(context: ChatContext): string {
    return `Eres Cermont AI, asistente virtual especializado del sistema CERMONT S.A.S.

Contexto actual del usuario:
- Nombre: ${context.userName}
- Rol: ${context.userRole}
- Página actual: ${context.currentPage}
- Entidad activa: ${context.entityType} #${context.entityId}

Puedes usar herramientas para consultar datos en tiempo real:
- getOrderStatus: Estado de cualquier orden
- getEvidencesCount: Cuántas evidencias tiene una orden
- getCostVariance: Variación de costos de una orden

Responde en español técnico, claro y conciso.
Si la pregunta requiere acciones (crear/modificar), indícale al usuario los pasos a seguir en la UI.`;
  }
}
```

**QA Scenarios**:
```txt
Scenario: Happy path — Chat responde con datos reales
  Tool: Playwright
  Preconditions: Orden con ID "ORD-001" existe con datos
  Steps:
    1. Abrir sidebar de Cermont AI
    2. Escribir "¿Cuál es el estado de la orden ORD-001?"
    3. Esperar respuesta streaming
  Expected Result: Respuesta con estado real de la orden + tool call visible
  Evidence: .sisyphus/evidence/task-4.1-chat-response-stream.mp4

Scenario: Error — Consulta sin datos suficientes
  Tool: Playwright
  Steps:
    1. Escribir "¿Cuál fue el costo total del año 2020?"
  Expected Result: Respuesta "No tengo datos disponibles para ese período. ¿Quieres consultar el dashboard de costos?"
  Evidence: .sisyphus/evidence/task-4.1-chat-no-data.png

Scenario: RBAC — Chat respeta permisos
  Tool: Playwright
  Preconditions: Rol "tecnico" (sin acceso a costos)
  Steps:
    1. Preguntar "¿Cuál es la variación de costos de ORD-001?"
  Expected Result: "No tienes permisos para consultar costos. Consulta con tu supervisor."
  Evidence: .sisyphus/evidence/task-4.1-chat-rbac.png
```

**Acceptance Criteria**:
- [ ] Vercel AI SDK configurado con OpenAI + Anthropic
- [ ] Context builder incluye datos de página actual
- [ ] Herramientas (tool calling) funcionales: getOrderStatus, getEvidencesCount, getCostVariance
- [ ] Streaming de respuesta con SSE
- [ ] UI Widget: sidebar colapsable, mensajes markdown, indicador pensando
- [ ] RBAC: AI no revela datos que el usuario no pueda ver

---

### Tarea 4.2: Generación Automática de Informes con IA (Sprint 4)

**Recomendado**: `deep` con skills `[nodejs-backend-patterns]`
**Paralelización**: Wave 4 (depende de T4.1)
**Bloquea**: Ninguno
**Bloqueado por**: T4.1 (Cermont AI base)

**What to do**:
1. Servicio `AIReportGenerator`:
   - Recopila: orden + planeación + checklist + evidencias + observaciones
   - Construye prompt estructurado con secciones predefinidas
   - Llama a Claude 3.5 Sonnet para generar texto del informe
   - Parse respuesta estructurada a JSON
2. Post-procesamiento:
   - Generar PDF con pdf-lib (template + contenido generado)
   - Insertar evidencias como imágenes en el PDF
   - Firmar digitalmente el informe
3. Endpoint: `POST /api/ai/generate-report`:
   - Input: `{ orderId, templateId?, additionalNotes? }`
   - Output: `{ reportText, pdfUrl, wordCount, evidenceCount }`
4. UI:
   - Botón "Generar informe con IA" en detalle de orden
   - Modal con opciones: template, notas adicionales
   - Progreso: "Recopilando datos..." -> "Generando texto..." -> "Creando PDF..."
   - Preview del informe generado editable
   - Botón "Aceptar y guardar"

**QA Scenarios**:
```txt
Scenario: Happy path — Generar informe completo
  Tool: Playwright
  Preconditions: Orden con execution completa, 5+ evidencias, checklist lleno
  Steps:
    1. Ir a /orders/[id]/execution
    2. Click "Generar informe con IA"
    3. Seleccionar template "Informe técnico estándar"
    4. Click "Generar"
    5. Esperar 15-30s
  Expected Result: Informe generado con secciones completas, PDF descargable
  Evidence: .sisyphus/evidence/task-4.2-report-preview.pdf

Scenario: Error — Sin datos suficientes
  Tool: Playwright
  Preconditions: Orden sin execution completada, sin evidencias
  Steps:
    1. Click "Generar informe con IA"
  Expected Result: Mensaje "La orden no tiene datos suficientes. Complete la ejecución y agregue evidencias primero."
  Evidence: .sisyphus/evidence/task-4.2-report-no-data.png
```

**Acceptance Criteria**:
- [ ] AIReportService: recopila datos, construye prompt, llama a Claude
- [ ] Prompt estructurado genera informe con 5 secciones
- [ ] PDF generado con evidencias embebidas
- [ ] UI con progreso y preview editable
- [ ] Gate: no generar sin execution completa + evidencias

---

### Tarea 5.3: Archivado Automático Mensual + Backups (Sprint 5)

**Recomendado**: `unspecified-high` con skills `[nodejs-backend-patterns, bash-defensive-patterns, mongodb-schema-design]`
**Paralelización**: Wave 5 (puede correr en paralelo con T5.1, T5.2)
**Bloquea**: Ninguno
**Bloqueado por**: T1.6 (portal históricos)

**What to do**:

#### Archivado Automático Mensual (Módulo 4 del evaluador)
1. BullMQ job `monthly-archive` (cron: primer día del mes a las 00:00):
   - Identificar órdenes con: `status: "paid"` y `updatedAt < 30 días`
   - Migrar a MongoDB histórica: orden, informes, evidencias (comprimidas), actas, SES, facturas
   - Marcar en BD operativa: `lifecycleStatus: "archived"`, `archivedAt`, `historicalDbRef`
   - Generar ZIP resumen del mes
2. Servicio `ArchiveService`:
   - `archiveMonth(year, month)`: Ejecuta archivado manual
   - `getArchiveStatus()`: Estado del último archivado
   - `restoreFromArchive(historicalId)`: Restaurar orden archivada
3. UI de configuración:
   - Días de retención configurable (default: 30)
   - Frecuencia: mensual/semanal
   - Destino: misma BD / BD separada / S3
   - Último archivado: fecha, órdenes archivadas, tamaño

#### Backups Automáticos
1. BullMQ job `daily-backup` (cron: 03:00 AM):
   - Ejecutar `mongodump` de BD operativa
   - Comprimir con gzip
   - Subir a S3/MinIO
   - Limpiar backups >30 días
2. Endpoints:
   - `POST /api/admin/backups/trigger` — Backup manual
   - `GET /api/admin/backups` — Listar backups (fecha, tamaño, estado)
   - `POST /api/admin/backups/:id/restore` — Restaurar (con confirmación doble)
   - `DELETE /api/admin/backups/:id` — Eliminar backup
3. UI:
   - Tabla de backups con fecha, tamaño, tipo (auto/manual)
   - Botones: Crear backup, Restaurar, Eliminar
   - Confirmación: "¿Está seguro? Esto sobrescribirá la base de datos actual."

**QA Scenarios**:
```txt
Scenario: Happy path — Archivado mensual automático
  Tool: Bash (curl)
  Preconditions: 10+ órdenes pagadas con updatedAt > 31 días
  Steps:
    1. Ejecutar job manualmente: POST /api/admin/archive/trigger { month: 6, year: 2026 }
    2. GET /api/admin/archive/status
    3. Verificar órdenes archivadas en BD histórica
    4. GET /api/orders con filtro lifecycleStatus: "archived"
  Expected Result: 10 órdenes archivadas, ZIP generado, órdenes visibles con flag "archivada"
  Evidence: .sisyphus/evidence/task-5.3-archive-result.json

Scenario: Happy path — Backup y restauración
  Tool: Bash (curl)
  Preconditions: BD con datos actuales
  Steps:
    1. POST /api/admin/backups/trigger
    2. Esperar a que job complete (poll cada 2s, máx 60s)
    3. POST /api/admin/backups/:id/restore con confirmación "CONFIRM"
  Expected Result: Backup creado en S3, restauración exitosa, datos intactos post-restore
  Evidence: .sisyphus/evidence/task-5.3-backup-restore.json

Scenario: Error — Restaurar sin confirmación
  Tool: Bash (curl)
  Steps:
    1. POST /api/admin/backups/:id/restore { confirm: "no" }
  Expected Result: HTTP 400 CONFIRMATION_REQUIRED
  Evidence: .sisyphus/evidence/task-5.3-restore-no-confirm.json
```

**Acceptance Criteria**:
- [ ] Job mensual automático: identifica, migra, marca, genera ZIP
- [ ] Árchivado manual desde UI con selector de mes/año
- [ ] Configuración de retención y frecuencia
- [ ] Backup diario automático con mongodump + S3
- [ ] Restauración desde UI con confirmación doble
- [ ] Limpieza de backups >30 días

---

## Anexos

### Anexo A: Referencias de Código Abierto Investigadas (GitHub)

| Repositorio | Stars | Propósito | URL |
|---|---|---|---|
| TanStack Table | 25k+ | Tablas avanzadas | https://github.com/TanStack/table |
| TanStack Query | 42k+ | Data fetching + cache | https://github.com/TanStack/query |
| Zustand | 48k+ | Estado global | https://github.com/pmndrs/zustand |
| Dexie.js | 11k+ | IndexedDB wrapper | https://github.com/dexie/Dexie.js |
| Serwist | 3k+ | Service Worker PWA | https://github.com/serwist/serwist |
| Tremor | 16k+ | Dashboards React | https://github.com/tremorlabs/tremor |
| Recharts | 24k+ | Gráficos React | https://github.com/recharts/recharts |
| react-pdf | 9k+ | Visualización PDF | https://github.com/wojtekmaj/react-pdf |
| pdf-lib | 7k+ | Generación PDF server-side | https://github.com/Hopding/pdf-lib |
| BullMQ | 6k+ | Job queues con Redis | https://github.com/taskforcesh/bullmq |
| Sharp | 20k+ | Procesamiento imágenes | https://github.com/lovell/sharp |
| Vercel AI SDK | 12k+ | Framework IA | https://github.com/vercel/ai |
| @dnd-kit | 12k+ | Drag & drop | https://github.com/clauderic/dnd-kit |
| Leaflet | 42k+ | Mapas interactivos | https://github.com/Leaflet/Leaflet |
| ZXing | 12k+ | Escaneo QR/Barcode | https://github.com/zxing-js/library |
| Archiver | 3k+ | Creación ZIPs | https://github.com/archiverjs/node-archiver |
| ExcelJS | 14k+ | Exportación Excel | https://github.com/exceljs/exceljs |
| Speakeasy | 4k+ | TOTP 2FA | https://github.com/speakeasyjs/speakeasy |
| Pino | 14k+ | Logging estructurado | https://github.com/pinojs/pino |
| OpenTelemetry JS | 3k+ | Trazas distribuidas | https://github.com/open-telemetry/opentelemetry-js |
| Shadcn UI | 82k+ | Componentes React | https://github.com/shadcn-ui/ui |
| Framer Motion | 24k+ | Animaciones | https://github.com/framer/motion |

### Anexo B: ADRs Propuestos

#### ADR-007: Offline-First con Dexie.js + clientMutationId
- **Contexto**: La ejecución en campo requiere operación sin conexión
- **Decisión**: Usar Dexie.js para IndexedDB con cola FIFO y clientMutationId para idempotencia
- **Consecuencias**: +20% complejidad inicial, -90% pérdida de datos offline
- **Estado**: Propuesto

#### ADR-008: Automatización de Procesos (sin IA externa)
- **Problema**: Recordatorios, PDF autogenerados, detección de hallazgos
- **Decisión**: Usar únicamente el stack existente: reminder-worker (node-cron), pdf-lib, reglas basadas en keywords
- **Alternativas**: Vercel AI SDK + OpenAI/Anthropic (DESCARTADO — APIs pagas)
- **Consecuencias**: Automatización menos "inteligente" pero 100% gratuita y sin dependencias externas

#### ADR-009: Base de Datos Histórica y Archivado
- **Problema**: Evitar saturación de BD principal con datos de órdenes completadas
- **Decisión**: Misma BD MongoDB, colección separada para históricos + node-cron para archivado mensual
- **Alternativas**: BD separada, S3 (DESCARTADO — complejidad innecesaria)
- **Consecuencias**: Archivado mensual automático sin infraestructura adicional

#### ADR-010: Generación de Formularios Dinámicos
- **Problema**: Campos de formularios cambian según tipo de servicio y requisitos del cliente
- **Decisión**: SectionedFormRenderer + DynamicFormTemplate existentes; el admin configura campos desde UI
- **Alternativas**: Formularios hardcodeados (actual), librería externa de forms
- **Consecuencias**: El admin puede ajustar formularios sin código, los datos se almacenan como JSON estructurado

#### ADR-011: Impresión PDF de Formularios
- **Problema**: Todos los formularios deben poder imprimirse/exportarse como PDF
- **Decisión**: Usar pdf-lib (ya instalado 1.17.1) + botón "Imprimir PDF" en cada formulario
- **Alternativas**: react-pdf/renderer (nueva dependencia), Puppeteer (pesado)
- **Consecuencias**: PDF generado server-side sin dependencias adicionales
- **Estado**: Propuesto

### Anexo C: Matriz de Trazabilidad (Falla -> Requisito -> Módulo -> Tarea)

| Falla Crítica | Requisito Funcional | Módulo Afectado | Tarea | Sprint |
|---|---|---|---|---|
| FC1: Planeación | Biblioteca de kits típicos | planning | T2.3, T2.5 | Sprint 2 |
| FC1: Planeación | Verificación certificaciones | planning/personnel | T2.6, T5.5 | Sprint 2, 5 |
| FC1: Planeación | ASTs digitales integrados | planning | T2.3 | Sprint 2 |
| FC2: Ejecución | Operación offline completa | execution | T2.1 | Sprint 2 |
| FC2: Ejecución | Checklist dinámico offline | execution | T2.1 | Sprint 2 |
| FC2: Ejecución | Evidencias con geoetiquetado | evidences | T2.2 | Sprint 2 |
| FC3: Consolidación | Informes técnicos automáticos | reports | T3.6, T4.2 | Sprint 3, 4 |
| FC3: Consolidación | Plantillas de informes | documents/templates | T1.4 (modulo) | Sprint 1 |
| FC3: Consolidación | Actas de entrega digitales | delivery-records | T3.1 | Sprint 3 |
| FC4: Facturación | SES con integración Ariba | ses | T3.1 | Sprint 3 |
| FC4: Facturación | Facturación electrónica DIAN | invoices | T3.2 | Sprint 3 |
| FC4: Facturación | Dashboard de facturación | invoices | T3.2 | Sprint 3 |
| FC5: Costos | Dashboard costos reales vs estimados | costs | T1.1 | Sprint 1 |
| FC5: Costos | Costos de propuesta detallados | proposals | T1.2 | Sprint 1 |
| FC5: Costos | Análisis predictivo de costos | ai/costs | T4.4 | Sprint 4 |
| Módulo 4 Evaluador | Archivado automático mensual | backups | T5.3 | Sprint 5 |
| Módulo 4 Evaluador | Portal descarga históricos | backups | T1.6 | Sprint 1 |
| Módulo 4 Evaluador | Backup BD programado | backups | T5.3 | Sprint 5 |
| Transversal | Offline-first (requisito evaluador) | execution/evidences | T2.1, T2.2 | Sprint 2 |
| Transversal | Dashboard KPIs en tiempo real | dashboard | T2.4 | Sprint 2 |
| Transversal | RBAC completo (requisito evaluador) | auth | T1.5 | Sprint 1 |
| Transversal | Firmas digitales | delivery-records/reports | T3.1, T3.6 | Sprint 3 |
| Transversal | MFA para roles admin | auth | T5.1 | Sprint 5 |
| Transversal | Auditoría exportable | audit | T5.2 | Sprint 5 |
| Transversal | Cermont AI (diferenciador) | ai | T4.1, T4.2, T4.3, T4.4 | Sprint 4 |

### Anexo D: Estrategia de Pruebas por Capa

| Capa | Herramienta | Cobertura Objetivo | Ejecución |
|---|---|---|---|
| Unit (Servicios) | Vitest | 90%+ | CI (cada push) |
| Integration (Endpoints) | Vitest + Supertest | 85%+ | CI (cada push) |
| Component (UI) | Vitest + Testing Library | 70%+ | CI (cada push) |
| E2E (Flujos críticos) | Playwright | 14 flujos (uno por paso operativo) | CI (antes de deploy) |
| Visual (UI regresión) | Playwright + Percy | Páginas principales | CI (semanal) |
| Performance | Lighthouse CI | >85 todas métricas | CI (semanal) |
| Security | OWASP ZAP + npm audit | Alto riesgo cubierto | CI (mensual) |

### Anexo E: Configuración Docker para Producción

```dockerfile
# backend/Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
RUN npm ci
COPY backend/ ./backend/
RUN npm run build --workspace=backend

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASS}
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: always

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://${MONGO_USER}:${MONGO_PASS}@mongodb:27017/cermont
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - DIAN_API_KEY=${DIAN_API_KEY}
      - ARIBA_API_KEY=${ARIDA_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on:
      - mongodb
      - redis
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000/api
      - NODE_ENV=production
    depends_on:
      - backend
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - frontend
    restart: always

volumes:
  mongo_data:
  redis_data:
```

---

### Expanded Task: S3.3 — Dashboard de Pagos + Aging Report

**Recomendado**: `visual-engineering` con skills `[tailwind-css-patterns, nodejs-backend-patterns, mongodb-schema-design]`
**Paralelización**: Wave 3 (puede correr en paralelo con S3.2)
**Bloquea**: S3.4 (conciliación 3 vías)
**Bloqueado por**: Ninguno

**What to do**:
1. Schema Zod `PaymentDashboard` con: totalInvoiced, totalCollected, totalPending, totalOverdue, collectionRate, averagePaymentDays, agingBuckets (0-30, 31-60, 61-90, 90+)
2. Endpoint `GET /api/payments/dashboard` con pipeline MongoDB:
   - Agregación por estado de factura
   - Cálculo de días de morosidad (now - dueDate)
   - Distribución por buckets de antigüedad
   - Tasa de recaudo (totalCollected / totalInvoiced * 100)
3. Endpoint `GET /api/payments/aging` con reporte detallado:
   - Cliente, factura, fecha emisión, fecha vencimiento, valor, días morosidad, bucket
4. UI Dashboard:
   - **KPIs**: Total Facturado, Total Cobrado, Pendiente, Vencido > 90 días
   - **Gráfico**: Barras apiladas por bucket (Recharts)
   - **Tabla**: TanStack Table con aging detallado
   - **Color coding**: 0-30d (verde), 31-60d (ámbar), 61-90d (naranja), 90+d (rojo)
   - Filtros: por cliente, rango de fechas
   - Exportación a Excel
5. WebSocket: Notificar cuando un pago se registra (actualizar dashboard en tiempo real)

**Código de referencia** (pipeline MongoDB):
```javascript
// backend/src/services/payment-dashboard.service.ts
async function getAgingReport(clientId?: string) {
  const match: Record<string, unknown> = { status: { $in: ['issued', 'overdue', 'partially_paid'] } };
  if (clientId) match.clientId = clientId;

  return await InvoiceModel.aggregate([
    { $match: match },
    { $addFields: {
        daysOverdue: {
          $floor: {
            $divide: [{ $subtract: [new Date(), '$dueDate'] }, 86400000] // ms to days
          }
        }
      }
    },
    { $addFields: {
        agingBucket: {
          $switch: {
            branches: [
              { case: { $lte: ['$daysOverdue', 0] }, then: 'current' },
              { case: { $lte: ['$daysOverdue', 30] }, then: '0-30' },
              { case: { $lte: ['$daysOverdue', 60] }, then: '31-60' },
              { case: { $lte: ['$daysOverdue', 90] }, then: '61-90' },
            ],
            default: '90+'
          }
        }
      }
    },
    { $lookup: { from: 'payments', localField: '_id', foreignField: 'invoiceId', as: 'payments' } },
    { $addFields: {
        collectedAmount: { $sum: '$payments.amount' },
        pendingAmount: { $subtract: ['$total', { $ifNull: [{ $sum: '$payments.amount' }, 0] }] }
      }
    },
    { $sort: { daysOverdue: -1 } },
    { $project: { payments: 0 } }
  ]);
}
```

**QA Scenarios**:
```txt
Scenario: Happy path — Dashboard refleja datos correctos
  Tool: Bash (curl) + Playwright
  Preconditions: 10 facturas en varios estados de pago, algunas vencidas
  Steps:
    1. GET /api/payments/dashboard
    2. GET /api/payments/aging
    3. Abrir /payments en navegador
  Expected Result: KPIs correctos (suma de montos coincide), buckets tienen conteos correctos, tabla con color coding
  Evidence: .sisyphus/evidence/task-3.3-payment-dashboard.png

Scenario: Empty — Sin pagos registrados
  Tool: Playwright
  Preconditions: No hay facturas emitidas
  Steps:
    1. Ir a /payments
  Expected Result: Empty state "No hay movimientos de pago registrados"
  Evidence: .sisyphus/evidence/task-3.3-payments-empty.png
```

**Acceptance Criteria**:
- [ ] Dashboard KPIs: totalInvoiced, totalCollected, totalPending, totalOverdue
- [ ] Aging report con 5 buckets (current, 0-30, 31-60, 61-90, 90+)
- [ ] Pipeline MongoDB con agregación correcta
- [ ] Exportación a Excel
- [ ] WebSocket notifica nuevo pago

---

### Expanded Task: S4.3 — Predicción de SLA

**Recomendado**: `deep` con skills `[nodejs-backend-patterns, mongodb-schema-design]`
**Paralelización**: Wave 4 (paralelo con S4.2, S4.4)
**Bloquea**: Ninguno
**Bloqueado por**: T4.1 (Cermont AI base)

**What to do**:
1. Schema Zod `SLAPrediction` con: serviceCaseId, estimatedCompletionDate, confidence (0-100), riskFactors[], recommendedActions[]
2. Servicio `SLAPredictorService`:
   - **Fase 1 (Estadístico)**: Calcular promedio histórico de duración por tipo de servicio
   - **Fase 2 (ML básico)**: Regresión lineal simple con factores: tipoServicio, recursosAsignados, complejidad, cliente
   - **Fase 3 (IA)**: Usar GPT-4o-mini para análisis contextual cuando datos históricos son insuficientes
3. Endpoint `POST /api/ai/predict-sla`:
   - Input: `{ orderId }`
   - Output: `{ predictedCompletionDate, confidence, riskLevel (low/medium/high), riskFactors[], estimatedHours }`
4. UI:
   - Badge en detalle de orden: "85% confianza: completar antes del 15/07/2026"
   - Dashboard widget: "Órdenes en riesgo de incumplir SLA" (lista con prioridad)
   - Timeline con línea de SLA vs progreso real

**Código de referencia**:
```typescript
// backend/src/services/ai/sla-predictor.service.ts
export class SLAPredictorService {
  constructor(
    private orderRepo: OrderRepository,
    private slaRulesRepo: SLARulesRepository,
    private aiService: AIChatService,
  ) {}

  async predictSLARisk(orderId: string): Promise<SLAPrediction> {
    const order = await this.orderRepo.findById(orderId);
    const slaRule = await this.slaRulesRepo.findByClient(order.clientId);

    // Fase 1: Datos históricos
    const historicalAvg = await this.getHistoricalAverage(order.serviceType);

    // Fase 2: Regresión simple
    const factors = {
      serviceType: order.serviceType,
      assignedResources: order.assignedPersonnel?.length || 0,
      complexity: order.complexity || 'medium',
      clientHistory: await this.getClientOnTimeRate(order.clientId),
      currentProgress: order.progress || 0,
    };

    const estimatedHours = this.linearRegression(factors);
    const estimatedCompletionDate = new Date(
      Date.now() + estimatedHours * 3600000
    );

    // Fase 3: IA para factores de riesgo contextuales
    let riskFactors: string[] = [];
    if (historicalAvg.dataPoints < 5) {
      const aiAnalysis = await this.aiService.analyzeSLARisk(order, factors);
      riskFactors = aiAnalysis.riskFactors;
    }

    const timeRemaining = slaRule.maxHours - this.getElapsedHours(order);
    const atRisk = timeRemaining < estimatedHours * 0.8;

    return {
      serviceCaseId: orderId,
      estimatedCompletionDate,
      confidence: Math.min(100, historicalAvg.dataPoints * 10), // Más datos = más confianza
      riskLevel: atRisk ? 'high' : 'low',
      riskFactors: atRisk ? ['Tiempo restante insuficiente', ...riskFactors] : [],
      recommendedActions: atRisk
        ? ['Asignar recursos adicionales', 'Priorizar en planificación diaria']
        : [],
    };
  }

  private linearRegression(factors: Record<string, number>): number {
    // Regresión: hours = base + w1*factor1 + w2*factor2 + ...
    // Pesos calibrados con datos históricos
    const weights = { serviceType: 5, assignedResources: -3, complexity: 8, clientHistory: -4, currentProgress: -2 };
    const base = 40; // horas base
    return Object.entries(factors).reduce((acc, [key, val]) => {
      return acc + (weights[key] || 0) * (typeof val === 'number' ? val : 0);
    }, base);
  }

  private async getHistoricalAverage(serviceType: string): Promise<{ avg: number; dataPoints: number }> {
    const result = await this.orderRepo.aggregate([
      { $match: { serviceType, status: 'completed' } },
      { $group: { _id: null, avgHours: { $avg: '$actualHours' }, count: { $sum: 1 } } },
    ]);
    return result.length > 0
      ? { avg: result[0].avgHours, dataPoints: result[0].count }
      : { avg: 48, dataPoints: 0 }; // default 48h si no hay datos
  }
}
```

**QA Scenarios**:
```txt
Scenario: Happy path — Predicción con datos históricos suficientes
  Tool: Bash (curl)
  Preconditions: 20+ órdenes completadas del mismo tipo de servicio
  Steps:
    1. POST /api/ai/predict-sla { orderId }
  Expected Result: JSON con predictedCompletionDate, confidence > 50, riskFactors
  Evidence: .sisyphus/evidence/task-4.3-sla-prediction.json

Scenario: Baja confianza — Sin datos históricos
  Tool: Bash (curl)
  Preconditions: Tipo de servicio nuevo, sin histórico
  Steps:
    1. POST /api/ai/predict-sla { orderId }
  Expected Result: confidence < 30, riskFactors incluye "Datos históricos insuficientes"
  Evidence: .sisyphus/evidence/task-4.3-sla-low-confidence.json
```

**Acceptance Criteria**:
- [ ] SLAPredictorService con 3 fases: estadístico, regresión, IA
- [ ] Predicción con nivel de confianza basado en cantidad de datos históricos
- [ ] Factores de riesgo identificables y accionables
- [ ] UI muestra badge de predicción en detalle de orden
- [ ] Dashboard widget de "órdenes en riesgo"

---

### Expanded Task: S5.1 — Admin Usuarios Mejorado + MFA

**Recomendado**: `unspecified-high` con skills `[nodejs-backend-patterns, zod, tailwind-css-patterns]`
**Paralelización**: Wave 5
**Bloquea**: Ninguno
**Bloqueado por**: Ninguno

**What to do**:
1. **Matriz de permisos**:
   - Endpoint `GET /api/users/permissions-matrix` — Todos los roles con sus permisos por módulo
   - Endpoint `PUT /api/users/permissions-matrix` — Actualizar permisos (solo gerente)
   - UI: Tabla con roles en filas, módulos en columnas, checkboxes
   - Zod schema: matriz tipada con todos los roles y módulos
2. **Historial de actividad por usuario**:
   - Endpoint `GET /api/users/:id/activity` — Paginado, filtros por acción y fecha
   - UI: Timeline de actividad del usuario en su detalle
3. **MFA (TOTP)**:
   - Schema `UserMFA` con: enabled, secret (encrypted), recoveryCodes[] (hashed), method (totp/sms/email)
   - Endpoints:
     - `POST /api/auth/mfa/setup` — Generar secret + QR code
     - `POST /api/auth/mfa/verify` — Verificar código TOTP y activar MFA
     - `POST /api/auth/mfa/disable` — Deshabilitar MFA (requiere contraseña + confirmación recovery code)
     - `POST /api/auth/mfa/recovery` — Usar recovery code para acceso de emergencia
   - UI: Configuración MFA en perfil con QR code, input de verificación, recovery codes descargables
   - Flujo login: password OK -> si MFA habilitado -> pedir código TOTP
4. **Desactivación masiva**:
   - Endpoint `PUT /api/users/batch-status` — { userIds: string[], active: boolean }
   - UI: Tabla con checkboxes, botón "Desactivar seleccionados"

**Código de referencia**:
```typescript
// backend/src/services/auth/mfa.service.ts
import { authenticator } from 'otplib';
import { QRCode } from 'qrcode';

export class MFAService {
  async setupMFA(userId: string): Promise<{ secret: string; qrCodeUrl: string; recoveryCodes: string[] }> {
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(userId, 'Cermont S.A.S.', secret);

    // Generar QR code como data URL
    const qrCodeUrl = await QRCode.toDataURL(uri);

    // Generar 8 recovery codes (hasheados para almacenar)
    const recoveryCodes = Array.from({ length: 8 }, () => crypto.randomUUID().slice(0, 10));
    const hashedCodes = recoveryCodes.map(code => bcrypt.hashSync(code, 10));

    // Almacenar secret encriptado + recovery codes hasheados
    await this.storeMFASecrets(userId, secret, hashedCodes);

    return { secret, qrCodeUrl, recoveryCodes }; // recovery codes SOLO se muestran una vez
  }

  async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const { secret } = await this.getMFASecrets(userId);
    return authenticator.verify({ token, secret });
  }
}
```

**QA Scenarios**:
```txt
Scenario: Happy path — Configurar y verificar MFA
  Tool: Playwright
  Preconditions: Usuario autenticado como gerente
  Steps:
    1. Ir a /profile -> "Configurar MFA"
    2. Click "Configurar autenticación de dos factores"
    3. Ver QR code en pantalla
    4. Copiar recovery codes mostrados
    5. Ingresar código TOTP desde app autenticadora (mocked)
    6. Click "Verificar y activar"
  Expected Result: MFA activado, recovery codes visibles, QR code generado
  Evidence: .sisyphus/evidence/task-5.1-mfa-setup.png

Scenario: Happy path — Login con MFA
  Tool: Playwright
  Preconditions: Usuario con MFA activado
  Steps:
    1. Ir a /login, ingresar credenciales
    2. Click "Iniciar sesión"
    3. Ver prompt de código TOTP
    4. Ingresar código válido
  Expected Result: Login exitoso, redirigido a dashboard
  Evidence: .sisyphus/evidence/task-5.1-mfa-login.png

Scenario: Error — Recovery code usado
  Tool: Playwright
  Preconditions: Usuario perdió acceso a app TOTP
  Steps:
    1. En pantalla de MFA, click "¿Perdiste acceso?"
    2. Ingresar uno de los recovery codes
  Expected Result: Acceso concedido, recovery code marcado como usado (no reutilizable)
  Evidence: .sisyphus/evidence/task-5.1-mfa-recovery.png
```

**Acceptance Criteria**:
- [ ] Matriz de permisos: todos los roles, todos los módulos, editable
- [ ] MFA TOTP: setup con QR, verify, disable con recovery codes
- [ ] Recovery codes: 8 códigos, cada uno usable una sola vez
- [ ] Desactivación masiva de usuarios
- [ ] Historial de actividad por usuario

---

### Expanded Task: S5.2 — Admin Auditoría Mejorada

**Recomendado**: `unspecified-high` con skills `[nodejs-backend-patterns, tailwind-css-patterns]`
**Paralelización**: Wave 5
**Bloquea**: Ninguno
**Bloqueado por**: Ninguno

**What to do**:
1. **Filtros avanzados**:
   - Fecha (desde/hasta con date picker)
   - Actor (autocompletado de usuarios)
   - Acción (dropdown con todas las acciones del sistema)
   - Entidad (tipo + ID)
   - Estado (éxito/error)
   - Combinación AND de todos los filtros
2. **Tabla mejorada** (TanStack Table):
   - Columnas: Fecha, Actor, Acción, Entidad, ID, IP, Éxito
   - Ordenamiento por fecha
   - Expansión de fila: click -> panel con detalle completo (payload, cambios, metadatos)
   - Paginación server-side
3. **Correlación por requestId**:
   - Click en requestId -> muestra todas las acciones del mismo request
   - Timeline visual de eventos correlacionados
4. **Exportación** a CSV/Excel con los filtros aplicados
5. **Retención configurable**: días de retención, política de archivado automático

**QA Scenarios**:
```txt
Scenario: Happy path — Filtrar y exportar auditoría
  Tool: Playwright
  Preconditions: 100+ eventos de auditoría en BD
  Steps:
    1. Ir a /admin/audit
    2. Aplicar filtros: Fecha última semana, Actor "juan.perez", Acción "CREAR_ORDEN"
    3. Verificar resultados filtrados
    4. Click en fila para expandir detalle
    5. Click "Exportar" -> seleccionar CSV
  Expected Result: Tabla filtrada muestra solo eventos del filtro, detalle expandido con JSON formateado, CSV descargado
  Evidence: .sisyphus/evidence/task-5.2-audit-export.csv

Scenario: Correlación — Timeline de un request
  Tool: Playwright
  Steps:
    1. En detalle de auditoría, click en requestId
  Expected Result: Timeline muestra todas las acciones del mismo request (autenticación, validación, creación, etc.)
  Evidence: .sisyphus/evidence/task-5.2-audit-correlation.png
```

**Acceptance Criteria**:
- [ ] Filtros combinados (fecha + actor + acción + entidad + estado)
- [ ] Tabla con expansión de detalle y JSON formateado
- [ ] Correlación por requestId con timeline
- [ ] Exportación CSV/Excel
- [ ] Retención configurable desde admin settings

---

### Expanded Task: S5.7 — Admin ERP Connectors + Ariba

**Recomendado**: `deep` con skills `[nodejs-backend-patterns, nodejs-best-practices]`
**Paralelización**: Wave 5 (depende de S3.1)
**Bloquea**: Ninguno
**Bloqueado por**: S3.1 (SES)

**What to do**:
1. **Interfaz abstracta `ERPConnector`**:
```typescript
// packages/shared-types/src/erp/connector.interface.ts
export interface ERPConnectorConfig {
  name: string;
  type: 'ariba' | 'sap' | 'oracle' | 'custom';
  baseUrl: string;
  apiKey: string; // encriptado en BD
  timeout: number;
  retryCount: number;
}

export interface ERPConnector {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  getStatus(): Promise<{ connected: boolean; lastSync: Date | null; error: string | null }>;
  sync(entity: string, data: unknown): Promise<SyncResult>;
}
```
2. **Implementación `AribaConnector`**:
   - Cliente REST para SAP Ariba Procurement API
   - Métodos: `submitSES(sesData)`, `getSESStatus(sesId)`, `submitInvoice(invoiceData)`, `getInvoiceStatus(invoiceId)`
   - Mapeo de estados: Cermont status -> Ariba status y viceversa
   - Logging de cada petición con requestId y duración
3. **Schema `ERPConnection`** con: name, type, config (encriptado), status, lastSync, lastError
4. **Endpoints**:
   - `POST /api/admin/erp-connections` — Crear conexión
   - `GET /api/admin/erp-connections` — Listar conexiones
   - `POST /api/admin/erp-connections/:id/sync` — Sincronización manual
   - `GET /api/admin/erp-connections/:id/logs` — Log de sincronización
   - `PUT /api/admin/erp-connections/:id/config` — Actualizar configuración
5. **Encriptación**: Almacenar apiKey encriptada con AES-256-GCM, clave maestra en variable de entorno
6. **UI**: Panel con conexiones, estado (verde/rojo), última sincronización, logs, botón sync manual

**QA Scenarios**:
```txt
Scenario: Happy path — Conectar con Ariba y sincronizar SES
  Tool: Bash (curl)
  Preconditions: Servidor mock de Ariba funcionando, SES en estado "pending_submit"
  Steps:
    1. POST /api/admin/erp-connections { name: "Ariba Producción", type: "ariba", baseUrl: "https://mock-ariba.com/api", apiKey: "test-key" }
    2. POST /api/admin/erp-connections/:id/sync { entity: "ses", ids: ["ses-id-1", "ses-id-2"] }
    3. GET /api/admin/erp-connections/:id/logs
  Expected Result: Conexión creada con status "connected", SES sincronizadas, logs con detalle de cada petición
  Evidence: .sisyphus/evidence/task-5.7-ariba-sync.json

Scenario: Error — Conexión fallida
  Tool: Bash (curl)
  Preconditions: URL inválida
  Steps:
    1. POST /api/admin/erp-connections { baseUrl: "https://invalid-url.com/api" }
    2. GET /api/admin/erp-connections/:id
  Expected Result: Status "error", mensaje de error descriptivo, logs del intento fallido
  Evidence: .sisyphus/evidence/task-5.7-ariba-error.json
```

**Acceptance Criteria**:
- [ ] Interfaz abstracta ERPConnector con métodos connect, disconnect, getStatus, sync
- [ ] Implementación AribaConnector con todos los métodos
- [ ] Configuración encriptada (AES-256-GCM)
- [ ] Logging de sincronización con requestId y duración
- [ ] UI con panel de conexiones y estado visual
- [ ] Sincronización manual desde UI

---

### Expanded Task: S6.1 — Redis Cache Layer

**Recomendado**: `unspecified-high` con skills `[nodejs-backend-patterns, bash-defensive-patterns]`
**Paralelización**: Wave 6 (puede correr en paralelo con S6.2, S6.3)
**Bloquea**: S6.7 (performance audit)
**Bloqueado por**: Ninguno

**What to do**:
1. **Cache Service** genérico:
```typescript
// backend/src/services/cache/cache.service.ts
import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;
  private defaultTTL: number = 300; // 5 min default

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached) as T;

    const fresh = await fetcher();
    await this.redis.setex(key, ttl, JSON.stringify(fresh));
    return fresh;
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) await this.redis.del(...keys);
  }

  async invalidateByTag(tag: string): Promise<void> {
    // Tag-based invalidation: cache:tag:{tag}:*
    const keys = await this.redis.keys(`cache:tag:${tag}:*`);
    if (keys.length > 0) await this.redis.del(...keys);
  }
}
```

2. **Configuración de caché por módulo**:

| Módulo | Clave | TTL | Estrategia de Invalidación |
|---|---|---|---|
| Dashboard KPIs | `cache:dashboard:kpi:{userId}` | 5 min | Cada 5 min o cuando se completa orden |
| Dashboard charts | `cache:dashboard:charts:{filters}` | 10 min | Cada 10 min |
| Catálogo de kits | `cache:catalog:kits` | 1 hora | Cuando se modifica un kit |
| Catálogo de costos | `cache:catalog:costs` | 1 hora | Cuando se actualiza catálogo |
| Órdenes activas | `cache:orders:active:{userId}` | 2 min | Cuando cambia estado de orden |
| Usuarios | `cache:users:list:{filters}` | 5 min | Cuando se crea/modifica usuario |
| Assets | `cache:assets:{id}` | 10 min | Cuando se actualiza asset |
| Inventario | `cache:inventory:stock:{id}` | 1 min | Cuando hay movimiento |

3. **Middleware de caché automática** para endpoints GET:
```typescript
// backend/src/middleware/cache.middleware.ts
export function cacheMiddleware(ttl: number, keyFn?: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = keyFn?.(req) || `cache:${req.originalUrl}`;
    const cached = await cacheService.get(key);
    if (cached) return res.json(cached);
    
    // Intercept res.json para cachear respuesta
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      cacheService.set(key, body, ttl);
      return originalJson(body);
    };
    next();
  };
}
```

4. **Redis para sesiones**: Almacenar refresh token sessions en Redis con TTL
5. **Redis para rate limiting**: Usar `ioredis` + sorted sets para rate limiting por IP + endpoint

**QA Scenarios**:
```txt
Scenario: Happy path — Caché reduce latencia
  Tool: Bash (curl)
  Preconditions: Dashboard con datos cargables
  Steps:
    1. curl -w "%{time_total}" GET /api/costs/dashboard (first request - no cache)
    2. curl -w "%{time_total}" GET /api/costs/dashboard (second request - cached)
  Expected Result: Segunda request 5-10x más rápida que la primera (<50ms vs >300ms)
  Evidence: .sisyphus/evidence/task-6.1-cache-latency.json

Scenario: Invalidación — Al completar orden, cache se invalida
  Tool: Bash (curl)
  Steps:
    1. GET /api/dashboard/kpi (cachea resultado)
    2. POST /api/orders/:id/advance-step (completa paso)
    3. GET /api/dashboard/kpi
  Expected Result: Tercera request no usa cache obsoleto, refleja nuevo estado
  Evidence: .sisyphus/evidence/task-6.1-cache-invalidation.json
```

**Acceptance Criteria**:
- [ ] CacheService genérico con getOrSet, invalidate, invalidateByTag
- [ ] Middleware de caché automática para GET endpoints
- [ ] Caché configurable por módulo con TTLs definidos
- [ ] Invalidación automática cuando datos cambian
- [ ] Redis configurado para sesiones y rate limiting
- [ ] Segunda request < 50ms para endpoints cacheados

---

### Expanded Task: S6.6 — E2E Tests con Playwright (Flujos Críticos)

**Recomendado**: `unspecified-high` con skills `[playwright-best-practices, nodejs-backend-patterns]`
**Paralelización**: Wave 6
**Bloquea**: Ninguno
**Bloqueado por**: Sprints 1-5 completos

**What to do**:
Crear suite de 14 E2E tests (uno por paso operativo) con Playwright:

**Test Suite Structure**:
```typescript
// frontend/e2e/flows/01-work-request.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Flujo 1: Solicitud de Trabajo', () => {
  test('Crear solicitud y asignar visita', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@cermont.com');
    await page.fill('[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/work-requests/new');
    await page.fill('[name="description"]', 'Mantenimiento preventivo CCTV - Edificio Principal');
    await page.selectOption('[name="serviceType"]', 'maintenance');
    await page.selectOption('[name="priority"]', 'high');
    await page.click('button:has-text("Guardar")');
    await page.waitForURL('/work-requests/**');

    // Verificar solicitud creada
    await expect(page.locator('text=Mantenimiento preventivo CCTV')).toBeVisible();
    await expect(page.locator('[data-testid="status-badge"]')).toContainText('pending');
  });

  test('Validación - Campos requeridos', async ({ page }) => {
    await page.goto('/work-requests/new');
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('text=La descripción es requerida')).toBeVisible();
    await expect(page.locator('text=El tipo de servicio es requerido')).toBeVisible();
  });
});
```

**14 Flujos Críticos a Testear**:
1. Solicitud de trabajo (crear + validar)
2. Visita técnica (agendar + completar)
3. Propuesta económica (crear + enviar + aprobar)
4. Orden de compra (adjuntar PO a propuesta)
5. Planeación (wizard 6 pasos completo)
6. Ejecución en campo (offline + sync)
7. Evidencias (captura + galería + geolocalización)
8. Informe técnico (generar con IA)
9. Acta de entrega (crear + firma digital)
10. SES (crear + enviar Ariba mock)
11. Factura (crear desde SES + PDF legal)
12. Pago (registrar + conciliar)
13. RBAC (usuario sin permisos no puede acceder)
14. Offline-first (desconectar, operar, reconectar, sync)

**Configuración de Playwright**:
```typescript
// frontend/playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  retries: 2,
  workers: 4,
  reporter: [['html'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: '**/setup.ts' },
    {
      name: 'authenticated',
      testMatch: '**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        storageState: '.auth/admin.json',
      },
    },
  ],
});
```

**QA Scenarios**:
```txt
Scenario: Todos los flujos pasan en CI
  Tool: Bash (terminal)
  Steps:
    1. npx playwright install --with-deps
    2. npm run build
    3. npm run test:e2e
  Expected Result: 14/14 tests passing, 0 failures, 0 flaky
  Evidence: .sisyphus/evidence/task-6.6-e2e-results.json

Scenario: Flaky detection — 3 retries por test
  Tool: Bash (terminal)
  Steps:
    1. npx playwright test --repeat-each 3
  Expected Result: 42/42 tests passing (14 flujos x 3 repeticiones)
  Evidence: .sisyphus/evidence/task-6.6-e2e-stability.json
```

**Acceptance Criteria**:
- [ ] 14 E2E tests (uno por paso operativo)
- [ ] Tests ejecutándose en CI con Playwright
- [ ] Captura de screenshots en fallos
- [ ] Traces para debugging
- [ ] 100% de tests pasando consistentemente (3 ejecuciones consecutivas)

---

## Guía de Estilo UI/UX para Todos los Módulos

### Principios de Diseño (basados en CERMONT_UIUX_GUIDE.md)

1. **Paleta de colores**:
   - Primary: `#2154A6` (Cermont Blue)
   - Secondary: `#4CAF50` (Cermont Green)
   - Error: `#DC2626` (Rojo)
   - Warning: `#F59E0B` (Ámbar)
   - Success: `#16A34A` (Verde)
   - Background: `#F8FAFC` (Gris claro)
   - Surface: `#FFFFFF`
   - Text: `#1E293B` (Slate 800)
   - Text Secondary: `#64748B` (Slate 500)

2. **Tipografía**:
   - Font: Inter (sistema)
   - Headings: `font-semibold`, `tracking-tight`
   - Body: `text-sm` (14px) para tablas, `text-base` (16px) para contenido
   - Monospace: `font-mono` para códigos e IDs

3. **Componentes base (shadcn/ui)**:
   - `Button`: variants (default, destructive, outline, secondary, ghost, link)
   - `Card`: contenedor con `rounded-lg border bg-card text-card-foreground shadow-sm`
   - `Table`: TanStack Table con `Table` wrapper estilizado
   - `Dialog`: para modales de confirmación y formularios
   - `Badge`: para estados (success/warning/destructive/outline)
   - `FormField`: wrapper de label + input + error message
   - `Tabs`: para páginas con múltiples secciones
   - `DropdownMenu`: para acciones en filas de tabla
   - `Sheet`: sidebar/drawer para móvil
   - `Toast`: notificaciones temporales

4. **Layout responsivo**:
   - Mobile: 1 columna, sidebar como drawer (Sheet)
   - Tablet: 2 columnas, sidebar colapsable
   - Desktop: layout fijo con sidebar + contenido
   - Touch targets: mínimo 44px

5. **Estados visuales por página**:
   - Loading: Skeleton con `animate-pulse` (shadcn Skeleton)
   - Error: `Alert` variant destructive + botón "Reintentar"
   - Empty: Ilustración + texto + CTA (ej: "Crear primera orden")
   - Offline: Badge "Sin conexión" + datos cacheados
   - Forbidden: Card con icono candado + mensaje de permiso

6. **Patrones de animación** (framer-motion):
   - Page transitions: `fadeIn` (0.3s)
   - List items: `staggerChildren` (0.05s delay entre items)
   - Modals: `scale` + `fade` (0.2s)
   - Toasts: `slideIn` from right

7. **Accesibilidad (WCAG 2.2 AA)**:
   - Todos los inputs con `<label>` explícito
   - Botones con texto o `aria-label`
   - Focus visible en todos los elementos interactivos
   - Navegación por teclado (Tab, Enter, Escape)
   - Modales con focus trap
   - Contraste de color mínimo 4.5:1
   - No depender solo del color para comunicar estado

### Patrón de Página Tipo

```tsx
// Template de página estándar para todos los módulos
export function StandardPageTemplate({
  title,
  description,
  children,
  actions,
  loading,
  error,
  empty,
  forbidden,
  offline,
}: PageTemplateProps) {
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={error.onRetry} />;
  if (forbidden) return <ForbiddenState />;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {offline && <OfflineBadge />}
        <div className="flex items-center gap-2">{actions}</div>
      </div>

      {/* Content */}
      {empty ? <EmptyState message={empty.message} action={empty.action} /> : children}
    </div>
  );
}
```

---

## Despliegue y Operaciones

### Configuración de VPS (Contabo)

**Requisitos de hardware**:
- 8 vCPU, 32GB RAM, 800GB SSD (producción)
- 4 vCPU, 16GB RAM, 400GB SSD (staging)
- Ubuntu 24.04 LTS

**Stack de servicios**:
```
- Docker + Docker Compose (contenedores)
- Nginx (reverse proxy + SSL con Let's Encrypt)
- MongoDB 7 (base de datos)
- Redis 7 (caché + sesiones + colas)
- Node.js 22 (runtime backend)
- MinIO (almacenamiento de archivos)
```

**Scripts de despliegue**:
```bash
#!/bin/bash
# deploy.sh — Despliegue automatizado a VPS

set -euo pipefail

APP_DIR="/opt/cermont"
BACKUP_DIR="/opt/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== CERMONT DEPLOY v2.0 ==="

# 1. Backup pre-deploy
echo "[1/5] Creando backup pre-deploy..."
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/pre-deploy-$TIMESTAMP"
echo "  -> Backup creado en $BACKUP_DIR/pre-deploy-$TIMESTAMP"

# 2. Pull latest images
echo "[2/5] Actualizando imágenes..."
docker compose -f docker-compose.prod.yml pull

# 3. Deploy con zero-downtime
echo "[3/5] Desplegando nuevos contenedores..."
docker compose -f docker-compose.prod.yml up -d --no-deps --build backend frontend

# 4. Health check
echo "[4/5] Verificando salud del sistema..."
for i in {1..30}; do
  if curl -sf http://localhost:4000/api/health/ready > /dev/null 2>&1; then
    echo "  -> Backend saludable después de ${i}s"
    break
  fi
  sleep 2
done

# 5. Limpiar recursos viejos
echo "[5/5] Limpieza..."
docker system prune -f --filter "until=24h"
find "$BACKUP_DIR" -type d -mtime +30 -exec rm -rf {} +
echo "  -> Backups >30 días eliminados"

echo "=== DEPLOY COMPLETADO ==="
```

### Monitoreo y Alertas (Sentry + OpenTelemetry)

**Sentry setup**:
```typescript
// backend/src/config/sentry.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.2, // 20% de requests trazadas
  profilesSampleRate: 0.2,
  integrations: [nodeProfilingIntegration()],
  beforeSend(event) {
    // No enviar errores de health checks
    if (event.request?.url?.includes('/api/health')) return null;
    return event;
  },
});
```

**OpenTelemetry tracing**:
```typescript
// backend/src/config/telemetry.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'cermont-backend',
    [SemanticResourceAttributes.SERVICE_VERSION]: '2.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Solo instrumentar lo relevante
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-mongodb': { enabled: true },
      '@opentelemetry/instrumentation-redis': { enabled: true },
    }),
  ],
});

sdk.start();
```

**Alertas configuradas**:
| Alerta | Condición | Canal | Prioridad |
|---|---|---|---|
| Latencia alta | p95 > 1000ms en 5 min | Email + Slack | P1 |
| Error rate > 5% | Tasa error > 5% en 5 min | Email + Slack + SMS | P1 |
| Backup fallido | Sin backup exitoso en 24h | Email | P2 |
| Sync offline queue > 100 | Más de 100 items en cola de sync | Email | P2 |
| VPS disk > 85% | Uso de disco > 85% | Email | P2 |
| Certificado SSL próximo a vencer | < 30 días para expirar | Email | P3 |

---

## Estimación de Esfuerzo Detallada

### Sprint 1: Fundación (185-215h)

| Tarea | Frontend (h) | Backend (h) | Testing (h) | Total (h) |
|---|---|---|---|---|
| S1.1 Dashboard costos | 10 | 6 | 4 | 20 |
| S1.2 Costos propuesta | 8 | 5 | 2 | 15 |
| S1.3 Módulo activos | 12 | 10 | 8 | 30 |
| S1.4 Módulo inventario | 12 | 10 | 8 | 30 |
| S1.5 Cerrar APIs REQUIRED | 5 | 18 | 7 | 30 |
| S1.6 Portal históricos | 5 | 10 | 5 | 20 |
| S1.7 Dispatch + Fleet | 10 | 10 | 5 | 25 |
| S1.8 CI/CD setup | 0 | 10 | 5 | 15 |
| S1.9 Migrar tests | 5 | 5 | 5 | 15 |

### Sprint 2: Offline-First (170-210h)

| Tarea | Frontend (h) | Backend (h) | Testing (h) | Total (h) |
|---|---|---|---|---|
| S2.1 Offline execution | 20 | 15 | 15 | 50 |
| S2.2 Galería evidencias | 20 | 8 | 7 | 35 |
| S2.3 Wizard planificación | 20 | 8 | 7 | 35 |
| S2.4 Dashboard KPIs WS | 15 | 10 | 5 | 30 |
| S2.5 Kit builder | 10 | 3 | 2 | 15 |
| S2.6 Certificaciones | 5 | 3 | 2 | 10 |
| S2.7 Kanban drag-drop | 15 | 5 | 5 | 25 |

### Sprint 3: Cierre Administrativo (190-210h)

| Tarea | Frontend (h) | Backend (h) | Testing (h) | Total (h) |
|---|---|---|---|---|
| S3.1 Delivery records | 12 | 10 | 8 | 30 |
| S3.2 SES + Ariba | 15 | 15 | 10 | 40 |
| S3.3 Facturación DIAN | 15 | 20 | 10 | 45 |
| S3.4 Dashboard pagos | 12 | 8 | 5 | 25 |
| S3.5 Conciliación 3 vías | 5 | 18 | 7 | 30 |
| S3.6 Reportes técnicos | 15 | 10 | 5 | 30 |

### Sprint 4: IA y Analytics (170-200h)

| Tarea | Frontend (h) | Backend (h) | IA Config (h) | Testing (h) | Total (h) |
|---|---|---|---|---|---|
| S4.1 Chat contextual | 12 | 8 | 15 | 5 | 40 |
| S4.2 Generación informes | 5 | 10 | 12 | 3 | 30 |
| S4.3 Predicción SLA | 5 | 12 | 5 | 3 | 25 |
| S4.4 Análisis costos | 5 | 12 | 5 | 3 | 25 |
| S4.5 Analytics dashboard | 15 | 10 | 0 | 5 | 30 |
| S4.6 Asistente campo | 10 | 8 | 5 | 2 | 25 |

### Sprint 5: Administración (190-210h)

| Tarea | Frontend (h) | Backend (h) | Testing (h) | Total (h) |
|---|---|---|---|---|
| S5.1 Usuarios + MFA | 10 | 10 | 5 | 25 |
| S5.2 Auditoría | 8 | 8 | 4 | 20 |
| S5.3 Backups + archivado | 8 | 20 | 7 | 35 |
| S5.4 Custom fields | 15 | 7 | 3 | 25 |
| S5.5 Certificaciones | 8 | 8 | 4 | 20 |
| S5.6 Settings | 6 | 6 | 3 | 15 |
| S5.7 ERP Connectors | 8 | 15 | 7 | 30 |
| S5.8 SLA management | 12 | 12 | 6 | 30 |

### Sprint 6: Escalamiento (160-190h)

| Tarea | Frontend (h) | Backend (h) | DevOps (h) | Testing (h) | Total (h) |
|---|---|---|---|---|---|
| S6.1 Redis cache | 0 | 15 | 3 | 2 | 20 |
| S6.2 MongoDB índices | 0 | 15 | 8 | 2 | 25 |
| S6.3 CDN assets | 8 | 0 | 7 | 0 | 15 |
| S6.4 OpenTelemetry | 2 | 15 | 8 | 0 | 25 |
| S6.5 CI/CD completo | 0 | 5 | 15 | 0 | 20 |
| S6.6 E2E tests | 0 | 0 | 0 | 40 | 40 |
| S6.7 Performance | 15 | 10 | 5 | 0 | 30 |
| S6.8 Documentación | 10 | 10 | 5 | 0 | 25 |

### Totales por Sprint

| Sprint | Total (h) | Frontend (h) | Backend (h) | Testing/DevOps (h) |
|---|---|---|---|---|
| Sprint 1 | ~200 | 67 | 74 | 46 |
| Sprint 2 | ~200 | 85 | 52 | 43 |
| Sprint 3 | ~200 | 74 | 81 | 45 |
| Sprint 4 | ~200 | 52 | 60 | 38 |
| Sprint 5 | ~200 | 75 | 86 | 39 |
| Sprint 6 | ~200 | 35 | 60 | 89 |
| **Total** | **~1,200** | **388** | **413** | **300** |

---

## Patrones Arquitecturales Detallados

### Patrón Contract-First (Aplicación Completa)

```typescript
// packages/shared-types/src/schemas/service-case.schema.ts
import { z } from 'zod';

// === 1. ENUMS COMPARTIDOS ===
export const ServiceStepEnum = z.enum([
  'work_request', 'site_visit', 'proposal', 'purchase_order',
  'planning', 'execution', 'technical_report', 'delivery_record',
  'client_acceptance', 'ses', 'ses_approval', 'invoice', 'invoice_approval', 'payment'
]);
export type ServiceStep = z.infer<typeof ServiceStepEnum>;

export const ServiceCaseStatusEnum = z.enum([
  'active', 'blocked', 'completed', 'cancelled', 'archived', 'paid'
]);

// === 2. SCHEMAS COMPARTIDOS ===
export const ServiceCaseSchema = z.object({
  _id: z.string().optional(),
  orderId: z.string(),
  clientId: z.string(),
  currentStep: ServiceStepEnum,
  status: ServiceCaseStatusEnum,
  steps: z.record(
    ServiceStepEnum,
    z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'blocked', 'skipped']),
      completedAt: z.date().nullable(),
      completedBy: z.string().nullable(),
      blockers: z.array(z.object({
        reason: z.string(),
        createdAt: z.date(),
        resolvedAt: z.date().nullable(),
        resolvedBy: z.string().nullable(),
      })),
    })
  ),
  documents: z.array(z.object({
    type: z.string(),
    fileId: z.string(),
    uploadedAt: z.date(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
  lifecycleStatus: z.enum(['active', 'archived', 'deleted']).default('active'),
});
export type ServiceCase = z.infer<typeof ServiceCaseSchema>;

// === 3. SCHEMAS DE REQUEST/RESPONSE ===
export const AdvanceStepRequestSchema = z.object({
  step: ServiceStepEnum,
  evidence: z.array(z.string()).optional(), // IDs de evidencias requeridas
  notes: z.string().max(500).optional(),
});
export type AdvanceStepRequest = z.infer<typeof AdvanceStepRequestSchema>;

export const ServiceCaseWorkflowViewSchema = z.object({
  id: z.string(),
  currentStep: ServiceStepEnum,
  status: ServiceCaseStatusEnum,
  steps: z.record(ServiceStepEnum, z.object({
    status: z.enum(['pending', 'active', 'completed', 'blocked']),
    label: z.string(),
    icon: z.string(),
    requiredDocuments: z.array(z.string()),
    canAdvance: z.boolean(),
    blockedBy: z.array(z.string()),
  })),
  progress: z.number().min(0).max(100), // X/14 pasos
});
export type ServiceCaseWorkflowView = z.infer<typeof ServiceCaseWorkflowViewSchema>;
```

### Patrón Service Layer + Repository

```typescript
// backend/src/services/service-case.service.ts
import { ServiceCaseModel } from '../models/service-case.model';
import { AdvanceStepRequest, ServiceStep } from '@cermont/shared-types';

export class ServiceCaseService {
  constructor(
    private readonly workflowGateService: WorkflowGateService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  async advanceStep(
    caseId: string,
    request: AdvanceStepRequest,
    userId: string,
  ): Promise<ServiceCase> {
    const serviceCase = await ServiceCaseModel.findById(caseId);
    if (!serviceCase) throw new NotFoundError('SERVICE_CASE_NOT_FOUND');

    // Validar gate condition antes de avanzar
    const gateResult = await this.workflowGateService.evaluateGate(
      serviceCase.currentStep,
      request.step,
      { caseId, userId, evidenceIds: request.evidence || [] },
    );

    if (!gateResult.allowed) {
      await this.auditService.log({
        action: 'ADVANCE_STEP_BLOCKED',
        actor: userId,
        entity: 'service_case',
        entityId: caseId,
        metadata: { from: serviceCase.currentStep, to: request.step, reason: gateResult.reason },
      });
      throw new StepBlockedError(gateResult.reason, gateResult.blockers);
    }

    // Avanzar paso
    const previousStep = serviceCase.currentStep;
    serviceCase.steps[previousStep].status = 'completed';
    serviceCase.steps[previousStep].completedAt = new Date();
    serviceCase.steps[previousStep].completedBy = userId;
    serviceCase.currentStep = request.step;
    serviceCase.steps[request.step].status = 'in_progress';
    serviceCase.updatedAt = new Date();

    await serviceCase.save();

    // Notificar cambio de estado
    await this.notificationService.notifyStepChange(caseId, previousStep, request.step);

    // Auditar
    await this.auditService.log({
      action: 'ADVANCE_STEP',
      actor: userId,
      entity: 'service_case',
      entityId: caseId,
      metadata: { from: previousStep, to: request.step, notes: request.notes },
    });

    return serviceCase;
  }

  async getWorkflowView(caseId: string): Promise<ServiceCaseWorkflowView> {
    const serviceCase = await ServiceCaseModel.findById(caseId)
      .populate('documents.fileId');
    if (!serviceCase) throw new NotFoundError('SERVICE_CASE_NOT_FOUND');

    const totalSteps = ServiceStepEnum.options.length;
    const completedCount = Object.values(serviceCase.steps)
      .filter(s => s.status === 'completed').length;

    return {
      id: serviceCase._id.toString(),
      currentStep: serviceCase.currentStep,
      status: serviceCase.status,
      steps: Object.fromEntries(
        ServiceStepEnum.options.map(step => {
          const stepData = serviceCase.steps[step] || { status: 'pending' };
          return [step, {
            status: step === serviceCase.currentStep ? 'active' : stepData.status,
            label: STEP_LABELS[step],
            icon: STEP_ICONS[step],
            requiredDocuments: STEP_REQUIRED_DOCS[step] || [],
            canAdvance: step === serviceCase.currentStep && stepData.blockers.length === 0,
            blockedBy: stepData.blockers.filter(b => !b.resolvedAt).map(b => b.reason),
          }];
        })
      ),
      progress: Math.round((completedCount / totalSteps) * 100),
    };
  }
}
```

### Patrón de Manejo de Errores

```typescript
// backend/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number = 400,
    message?: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message || code);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super(
      `${entity}_NOT_FOUND`,
      404,
      id ? `${entity} con ID ${id} no encontrado` : `${entity} no encontrado`,
    );
  }
}

export class ValidationError extends AppError {
  constructor(errors: ZodError) {
    super('VALIDATION_ERROR', 422, 'Error de validación', {
      fields: errors.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(permission: string) {
    super('FORBIDDEN', 403, `No tienes permiso para: ${permission}`);
  }
}

export class StepBlockedError extends AppError {
  constructor(reason: string, blockers: string[]) {
    super('STEP_BLOCKED', 409, reason, { blockers });
  }
}

// Middleware global de errores
export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction) {
  // Error conocido de la aplicación
  if (err instanceof AppError) {
    logger.warn({ code: err.code, statusCode: err.statusCode, message: err.message, path: req.path });
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Error de validación Zod
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        details: {
          fields: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
      },
    });
  }

  // Error desconocido (no mostrar stack en producción)
  logger.error({ err, path: req.path, method: req.method });
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Error interno del servidor',
    },
  });
}
```

### Patrón de Validación con Zod (Zero-Trust)

```typescript
// backend/src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Middleware de validación parametrizado
export function validate(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query) as any;
      if (schema.params) req.params = schema.params.parse(req.params) as any;
      next();
    } catch (error) {
      next(error); // El errorMiddleware lo maneja
    }
  };
}

// Uso en rutas:
router.post('/:id/advance-step',
  authenticate,
  authorize('service_case', 'advance'),
  validate({
    params: z.object({ id: z.string().length(24) }),
    body: AdvanceStepRequestSchema,
  }),
  serviceCaseController.advanceStep,
);
```

### Patrón Repository (Abstracción de Mongoose)

```typescript
// backend/src/repositories/base.repository.ts
import { Model, Document, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    return this.model.findById(id, null, options).exec();
  }

  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    return this.model.findOne(filter, null, options).exec();
  }

  async find(
    filter: FilterQuery<T> = {},
    options: { page?: number; limit?: number; sort?: Record<string, 1 | -1> } = {},
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter)
        .sort(options.sort || { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async softDelete(id: string): Promise<T | null> {
    return this.model.findByIdAndUpdate(
      id,
      { lifecycleStatus: 'deleted', deletedAt: new Date() } as any,
      { new: true },
    ).exec();
  }
}
```

### Patrón de Sincronización Offline (Idempotencia)

```typescript
// backend/src/middleware/idempotency.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

export class IdempotencyMiddleware {
  private redis: Redis;
  private ttl: number = 86400; // 24 horas de retención

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Solo para mutaciones
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

      const idempotencyKey = req.headers['x-idempotency-key'] as string
        || req.body?.clientMutationId;

      if (!idempotencyKey) return next();

      const existing = await this.redis.get(`idempotency:${idempotencyKey}`);

      if (existing) {
        // Si ya se procesó, devolver resultado anterior
        const cachedResponse = JSON.parse(existing);
        return res.status(cachedResponse.statusCode).json(cachedResponse.body);
      }

      // Interceptar respuesta para cachearla
      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        this.redis.setex(
          `idempotency:${idempotencyKey}`,
          this.ttl,
          JSON.stringify({ statusCode: res.statusCode, body }),
        );
        return originalJson(body);
      };

      next();
    };
  }
}

// Uso en rutas:
router.post('/execution-sessions/:id/sync',
  authenticate,
  idempotencyMiddleware.middleware(),
  executionController.syncSession,
);
```

### Patrón de Jobs Programados (BullMQ)

```typescript
// backend/src/jobs/scheduler.ts
import { Queue, Worker, QueueScheduler } from 'bullmq';
import { logger } from '../config/logger';

const connection = { host: process.env.REDIS_HOST || 'localhost', port: 6379 };

// Definición de colas
export const queues = {
  archive: new Queue('archive', { connection }),
  backup: new Queue('backup', { connection }),
  slaMonitoring: new Queue('sla-monitoring', { connection }),
  notifications: new Queue('notifications', { connection }),
  cleanup: new Queue('cleanup', { connection }),
} as const;

// Registro de workers
export function registerWorkers() {
  // Archivo mensual automático
  new Worker('archive', async (job) => {
    logger.info({ jobId: job.id, name: job.name, data: job.data }, 'Iniciando archivado');
    const { month, year } = job.data;
    const { ArchiveService } = await import('../services/archive.service');
    await new ArchiveService().archiveMonth(month, year);
  }, { connection });

  // Backup diario
  new Worker('backup', async (job) => {
    logger.info({ jobId: job.id }, 'Iniciando backup');
    const { BackupService } = await import('../services/backup.service');
    await new BackupService().createBackup(job.data.type || 'auto');
  }, { connection });

  // Monitoreo de SLA
  new Worker('sla-monitoring', async (job) => {
    const { SLAMonitoringService } = await import('../services/sla-monitoring.service');
    await new SLAMonitoringService().checkAllActiveOrders();
  }, { connection });

  logger.info('Workers registrados correctamente');
}

// Registro de schedules (cron)
export function registerSchedules() {
  // Archivo mensual: 1er día del mes a las 00:00
  queues.archive.add('monthly-archive', {}, {
    repeat: { pattern: '0 0 1 * *' },
    jobId: 'monthly-archive',
  });

  // Backup diario: 3:00 AM
  queues.backup.add('daily-backup', { type: 'auto' }, {
    repeat: { pattern: '0 3 * * *' },
    jobId: 'daily-backup',
  });

  // SLA monitoring: cada hora
  queues.slaMonitoring.add('hourly-sla-check', {}, {
    repeat: { pattern: '0 * * * *' },
    jobId: 'hourly-sla-check',
  });

  // Limpieza: cada día a las 4:00 AM
  queues.cleanup.add('daily-cleanup', {}, {
    repeat: { pattern: '0 4 * * *' },
    jobId: 'daily-cleanup',
  });

  logger.info('Schedules registrados correctamente');
}
```

### Patrón WebSocket para Tiempo Real

```typescript
// backend/src/config/socket.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { verifyToken } from '../middleware/auth.middleware';

let io: SocketServer;

export function initializeSocket(httpServer: HTTPServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    // Solo transport websocket para evitar long-polling overhead
    transports: ['websocket'],
  });

  // Autenticación por socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token as string;
      if (!token) return next(new Error('AUTH_REQUIRED'));

      const user = await verifyToken(token);
      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info({ userId: user.id, socketId: socket.id }, 'Cliente conectado');

    // Unirse a sala de su organización
    socket.join(`org:${user.organizationId}`);

    // Unirse a sala de órdenes asignadas
    if (user.assignedOrders) {
      user.assignedOrders.forEach((orderId: string) => {
        socket.join(`order:${orderId}`);
      });
    }

    socket.on('disconnect', () => {
      logger.info({ userId: user.id, socketId: socket.id }, 'Cliente desconectado');
    });
  });

  return io;
}

// Funciones helper para emitir eventos
export function notifyStepChange(orderId: string, from: string, to: string) {
  io.to(`order:${orderId}`).emit('step:changed', { orderId, from, to, timestamp: new Date() });
}

export function notifySyncComplete(orderId: string, sessionId: string) {
  io.to(`order:${orderId}`).emit('sync:complete', { orderId, sessionId, timestamp: new Date() });
}

export function notifyPaymentReceived(invoiceId: string, amount: number) {
  io.emit('payment:received', { invoiceId, amount, timestamp: new Date() });
}

export function notifyAlert(userId: string, alert: { type: string; message: string; severity: string }) {
  io.to(`user:${userId}`).emit('alert:new', alert);
}
```

### Patrón de Feature-Sliced Design (Frontend)

```
frontend/modules/
├── work-requests/
│   ├── api/
│   │   ├── work-requests.api.ts      # Llamadas apiClient
│   │   ├── work-requests.hooks.ts    # TanStack Query hooks
│   │   └── keys.ts                   # Query keys centralizadas
│   ├── hooks/
│   │   ├── useWorkRequestForm.ts     # Lógica de formulario
│   │   └── useOfflineDraft.ts        # Borrador offline
│   ├── ui/
│   │   ├── WorkRequestListPage.tsx
│   │   ├── WorkRequestDetailPage.tsx
│   │   ├── WorkRequestNewPage.tsx
│   │   ├── components/
│   │   │   ├── WorkRequestTable.tsx
│   │   │   ├── WorkRequestForm.tsx
│   │   │   ├── WorkRequestTimeline.tsx
│   │   │   └── SiteVisitCard.tsx
│   │   └── sections/
│   │       └── visits-tab.tsx
│   ├── model/
│   │   └── types.ts                  # Tipos específicos del módulo
│   └── utils/
│       ├── wr-status.ts             # Helpers de estado
│       └── wr-validation.ts         # Validaciones específicas
├── orders/
│   ├── api/
│   ├── hooks/
│   ├── ui/
│   │   ├── KanbanBoard.tsx
│   │   ├── OrderTimeline.tsx
│   │   └── GanttView.tsx
│   ├── model/
│   └── utils/
├── costs/
│   ├── api/
│   ├── hooks/
│   ├── ui/
│   │   ├── CostDashboardPage.tsx
│   │   ├── CostVarianceChart.tsx
│   │   └── CostCatalogTable.tsx
│   ├── model/
│   └── utils/
├── ai/
│   ├── api/
│   │   ├── ai-chat.api.ts
│   │   └── ai-report.api.ts
│   ├── hooks/
│   │   ├── useAIChat.ts
│   │   └── useAIReport.ts
│   ├── ui/
│   │   ├── AIChatWidget.tsx
│   │   ├── AIReportModal.tsx
│   │   └── AISuggestions.tsx
│   └── model/
└── ... (cada módulo sigue la misma estructura)
```

### Patrón de Query Keys Centralizadas

```typescript
// frontend/modules/orders/api/keys.ts
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  planning: (orderId: string) => [...orderKeys.detail(orderId), 'planning'] as const,
  execution: (orderId: string) => [...orderKeys.detail(orderId), 'execution'] as const,
  evidences: (orderId: string) => [...orderKeys.detail(orderId), 'evidences'] as const,
  costs: (orderId: string) => [...orderKeys.detail(orderId), 'costs'] as const,
  timeline: (orderId: string) => [...orderKeys.detail(orderId), 'timeline'] as const,
  kanban: () => [...orderKeys.all, 'kanban'] as const,
};

// frontend/modules/orders/api/orders.hooks.ts
export function useOrderList(filters: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => apiClient.get<PaginatedResponse<Order>>('/orders', { params: filters }),
    placeholderData: keepPreviousData,
    staleTime: 30_000, // 30s antes de refetch
  });
}

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => apiClient.get<Order>(`/orders/${id}`),
    enabled: !!id,
  });
}

export function useAdvanceStep(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdvanceStepRequest) =>
      apiClient.post(`/orders/${orderId}/advance-step`, data),
    onSuccess: () => {
      // Invalidar múltiples queries relacionadas
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.timeline(orderId) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.kpi });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.pipeline });
    },
  });
}
```

## Estrategia de Datos de Prueba (Seed Data)

### Script de Seed para Desarrollo

```typescript
// backend/scripts/seed.ts
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker/locale/es';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cermont');

  // 1. Usuarios por rol
  const roles = ['gerente', 'residente', 'HES', 'supervisor', 'administrativo', 'tecnico', 'operador', 'cliente'];
  const users = await UserModel.insertMany(
    roles.map(role => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: bcrypt.hashSync('test123', 10),
      role,
      active: true,
    }))
  );
  console.log(`✅ ${users.length} usuarios creados`);

  // 2. Clientes
  const clients = await ClientModel.insertMany(
    Array.from({ length: 5 }, () => ({
      name: faker.company.name(),
      nit: faker.string.numeric(9) + '-' + faker.string.numeric(1),
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      address: faker.location.streetAddress(),
    }))
  );
  console.log(`✅ ${clients.length} clientes creados`);

  // 3. Work Requests + Proposals + Orders (crear 10 casos completos)
  for (let i = 0; i < 10; i++) {
    const client = faker.helpers.arrayElement(clients);
    const wr = await WorkRequestModel.create({
      clientId: client._id,
      description: faker.lorem.sentence(),
      serviceType: faker.helpers.arrayElement(['maintenance', 'installation', 'inspection', 'repair']),
      location: faker.location.streetAddress(),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
      createdBy: faker.helpers.arrayElement(users)._id,
    });

    const proposal = await ProposalModel.create({
      workRequestId: wr._id,
      clientId: client._id,
      description: wr.description,
      items: Array.from({ length: faker.number.int({ min: 2, max: 8 }) }, () => ({
        description: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        unitPrice: faker.number.int({ min: 100000, max: 5000000 }),
      })),
      status: 'approved',
      total: 0, // Se recalcula en servicio
    });

    const order = await OrderModel.create({
      proposalId: proposal._id,
      clientId: client._id,
      description: wr.description,
      location: wr.location,
      priority: wr.priority,
      status: faker.helpers.arrayElement(['pending', 'planned', 'in_progress', 'completed', 'invoiced', 'paid']),
      assignedTo: faker.helpers.arrayElements(
        users.filter(u => ['supervisor', 'tecnico', 'operador'].includes(u.role)),
        faker.number.int({ min: 1, max: 3 })
      ).map(u => u._id),
      createdBy: faker.helpers.arrayElement(users)._id,
    });

    // 4. Evidencias para órdenes en ciertos estados
    if (['in_progress', 'completed', 'invoiced', 'paid'].includes(order.status)) {
      await EvidenceModel.insertMany(
        Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
          orderId: order._id,
          fileName: `foto-${faker.string.uuid()}.jpg`,
          mimeType: 'image/jpeg',
          category: faker.helpers.arrayElement(['fotografia', 'checklist', 'novedad']),
          description: faker.lorem.sentence(),
          gps: {
            latitude: faker.location.latitude({ min: 6.5, max: 7.5 }),
            longitude: faker.location.longitude({ min: -72.5, max: -71.5 }),
          },
          uploadedBy: faker.helpers.arrayElement(users)._id,
          verified: faker.datatype.boolean(),
        }))
      );
    }
  }
  console.log('✅ Casos de prueba creados');
  console.log('🎉 Seed completado!');

  await mongoose.disconnect();
}

seed().catch(console.error);
```

### Datos Mínimos para Desarrollo (por sprint)

| Sprint | Seed requerido | Propósito |
|---|---|---|
| Sprint 1 | 5 usuarios (1 por rol), 3 clientes, 5 órdenes | Probar CRUDs y costos |
| Sprint 2 | +10 órdenes con execution, +50 evidencias | Probar offline y galería |
| Sprint 3 | +10 delivery records, +10 SES, +10 invoices | Probar cierre administrativo |
| Sprint 4 | +100 órdenes históricas completadas | Entrenar modelos IA |
| Sprint 5 | +50 usuarios, +100 eventos auditoría | Probar admin y permisos |
| Sprint 6 | +500 órdenes (datos masivos) | Probar performance |

## Variables de Entorno por Entorno

```bash
# .env.development
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cermont
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key
FRONTEND_URL=http://localhost:3000
BACKEND_PORT=4000
SENTRY_DSN=
DIAN_API_KEY=sandbox-key
ARIDA_API_KEY=sandbox-key
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-your-key
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=cermont-files

# .env.staging
NODE_ENV=staging
MONGODB_URI=mongodb://mongodb:27017/cermont
REDIS_URL=redis://redis:6379
JWT_SECRET=<staging-secret>
JWT_REFRESH_SECRET=<staging-refresh-secret>
FRONTEND_URL=https://staging.cermont.com
BACKEND_PORT=4000
SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/xxx
DIAN_API_KEY=sandbox-key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# .env.production
# SECRETOS: Usar Docker secrets o HashiCorp Vault en lugar de .env
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/cermont?retryWrites=true&w=majority
REDIS_URL=redis://redis:6379
JWT_SECRET=<production-secret-rotado-mensualmente>
JWT_REFRESH_SECRET=<rotado-mensualmente>
FRONTEND_URL=https://app.cermont.com
BACKEND_PORT=4000
SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/xxx
DIAN_API_KEY=<dian-prod-key>
ARIDA_API_KEY=<ariba-prod-key>
OPENAI_API_KEY=<openai-prod-key>
ANTHROPIC_API_KEY=<anthropic-prod-key>
AWS_ACCESS_KEY_ID=<minio-prod-key>
AWS_SECRET_ACCESS_KEY=<minio-prod-secret>
S3_ENDPOINT=https://s3.cermont.com
S3_BUCKET=cermont-files-prod
OTEL_EXPORTER_OTLP_ENDPOINT=http://grafana-tempo:4318
```

## Seguridad y Hardening

### Checklist de Seguridad Pre-Producción

- [ ] Helmet configurado con Content-Security-Policy estricta
- [ ] CORS con allowlist de orígenes específicos
- [ ] Rate limiting por IP + endpoint (almacenado en Redis)
- [ ] JWT con expiración corta (15 min access, 7 días refresh)
- [ ] Refresh token rotation con detección de reuso
- [ ] MFA obligatorio para roles: gerente, administrativo
- [ ] Passwords: mínimo 8 chars, bcrypt con salt rounds 12
- [ ] Upload de archivos: validación MIME + extensión + magic bytes + tamaño máx 20MB + escaneo malware
- [ ] Archivos servidos solo a través de endpoint autenticado, nunca estáticos
- [ ] SQL Injection: No aplica (MongoDB), pero validar con Zod siempre
- [ ] XSS: CSP headers + React escapado por defecto
- [ ] CSRF: SameSite=Strict en cookies + CSRF token en mutaciones
- [ ] Logs sin datos sensibles (passwords, tokens, secretos redactados automáticamente)
- [ ] Errores sin stack trace en producción
- [ ] Encriptación de datos sensibles en BD (apiKeys, secrets MFA) con AES-256-GCM
- [ ] Backup automático diario con cifrado
- [ ] Auditoría inmutable de todas las acciones críticas
- [ ] Pruebas de penetración anuales

### Política de Seguridad de Contraseñas

```typescript
// packages/shared-types/src/validators/password.validator.ts
import { z } from 'zod';

export const PasswordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(64, 'La contraseña no puede exceder 64 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial')
  .refine(
    (password) => !COMMON_PASSWORDS.includes(password.toLowerCase()),
    'Esta contraseña es demasiado común. Elige una más segura.',
  );

const COMMON_PASSWORDS = [
  'password123', 'admin123', 'cermont2024', '12345678',
  'qwerty123', 'abc12345', 'letmein', 'welcome1',
];
```

### Content-Security-Policy (Helmet)

```typescript
// backend/src/config/security.ts
import helmet from 'helmet';

export const securityConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.sentry-cdn.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:', `${process.env.S3_ENDPOINT}`],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: [
        "'self'",
        'ws://localhost:4000',
        'wss://app.cermont.com',
        'https://api.openai.com',
        'https://api.anthropic.com',
        'https://o45000000000000.ingest.us.sentry.io',
        `${process.env.DIAN_API_ENDPOINT}`,
      ],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});
```

## Monitoreo de Costos de Infraestructura

| Recurso | Desarrollo | Staging | Producción | Total/mes |
|---|---|---|---|---|
| VPS Contabo (8 vCPU, 32GB) | — | $25.99 | $35.99 | $61.98 |
| MongoDB Atlas (M20) | — | $30.00 | $60.00 | $90.00 |
| Redis (Upstash 1GB) | — | $5.00 | $15.00 | $20.00 |
| Backblaze B2 (500GB) | — | $3.00 | $5.00 | $8.00 |
| Sentry Team (5 users) | — | — | $26.00 | $26.00 |
| OpenAI API (uso moderado) | $5.00 | $10.00 | $20.00 | $35.00 |
| Anthropic API (informes) | $5.00 | $10.00 | $30.00 | $45.00 |
| Domain + SSL | — | $10.00 | $10.00 | $20.00 |
| **Total** | **$10.00** | **$93.99** | **$201.99** | **$305.98** |

## Guía de Referencia Rápida para Desarrollo

### Comandos Útiles

```bash
# Desarrollo
npm run dev           # Iniciar frontend + backend en dev
npm run dev:backend   # Solo backend
npm run dev:frontend  # Solo frontend

# Testing
npm run test          # Tests unitarios + integración
npm run test:e2e      # Tests E2E Playwright
npm run test:watch    # Tests en modo watch
npm run test:coverage # Reporte de cobertura

# Calidad
npm run typecheck     # TypeScript strict check
npm run lint          # ESLint + Biome
npm run build         # Build producción
npm run verify        # Quality gates completos
npx react-doctor      # React diagnostics

# Base de datos
npm run seed          # Poblar BD con datos de prueba
npm run seed:reset    # Reset + seed
npm run mongosh       # Conectar a MongoDB shell

# Jobs manuales
npm run job:archive   # Ejecutar archivado manual
npm run job:backup    # Ejecutar backup manual

# Docker
docker compose up -d                  # Iniciar servicios
docker compose -f docker-compose.prod.yml up -d  # Producción
docker compose logs -f                # Ver logs

# Deploy
./scripts/deploy.sh                   # Deploy a VPS
./scripts/deploy.sh --rollback        # Rollback al backup pre-deploy
```

### Mapa de Dependencias entre Paquetes

```
@cermont/shared-types  ←  @cermont/domain  ←  @cermont/validators  ←  @cermont/ui
       ↑                       ↑                       ↑                      ↑
       └───────────────────────┴───────────────────────┴──────────────────────┘
                                                                             │
                                                              backend/ (Express 5)
                                                                    /
                                                           frontend/ (Next.js 16)

- packages/shared-types: Schemas Zod, tipos inferidos, enums (0 dependencias externas)
- packages/domain: Reglas de negocio puras, RBAC, FSM (solo depende de shared-types)
- packages/validators: Validaciones reutilizables (solo depende de shared-types)
- packages/ui: Componentes UI compartidos (React, Tailwind, shadcn)
- backend: Express, Mongoose, Zod, Redis, BullMQ (depende de todos los packages)
- frontend: Next.js, TanStack Query, Zustand, shadcn (depende de todos los packages)
```

---

## Módulos Adicionales: Especificaciones Técnicas Completas

### Módulo: Reportes Técnicos — `/reports` (Sprint 3, T3.6)

**Generación de PDF con pdf-lib**:
```typescript
// backend/src/services/reports/pdf-generator.service.ts
import { PDFDocument, PDFPage, rgb, StandardFonts, degrees } from 'pdf-lib';

export class TechnicalReportPDFGenerator {
  async generate(report: TechnicalReport, evidences: Evidence[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 10;

    // Portada
    const coverPage = pdfDoc.addPage([595.28, 841.89]); // A4
    this.drawCover(coverPage, report, font, fontBold);

    // Contenido
    const contentPage = pdfDoc.addPage([595.28, 841.89]);
    this.drawHeader(contentPage, 'INFORME TÉCNICO', font, fontBold);

    // Sección 1: Datos Generales
    let yPos = 750;
    yPos = this.drawSectionTitle(contentPage, '1. DATOS GENERALES', fontBold, yPos);
    yPos = this.drawField(contentPage, 'Orden:', report.orderCode, font, yPos);
    yPos = this.drawField(contentPage, 'Cliente:', report.clientName, font, yPos);
    yPos = this.drawField(contentPage, 'Fecha:', report.date.toLocaleDateString('es-CO'), font, yPos);
    yPos = this.drawField(contentPage, 'Ubicación:', report.location, font, yPos);

    // Sección 2: Actividades Realizadas
    yPos -= 20;
    yPos = this.drawSectionTitle(contentPage, '2. ACTIVIDADES REALIZADAS', fontBold, yPos);
    for (const activity of report.activities) {
      yPos = this.drawBulletPoint(contentPage, `• ${activity}`, font, yPos);
    }

    // Sección 3: Evidencias
    if (evidences.length > 0) {
      yPos -= 20;
      yPos = this.drawSectionTitle(contentPage, '3. REGISTRO FOTOGRÁFICO', fontBold, yPos);
      for (const ev of evidences.slice(0, 6)) { // Máximo 6 fotos en PDF
        if (yPos < 100) break; // Nueva página si es necesario
        const imgBytes = await this.fetchImageBytes(ev.fileId);
        if (imgBytes) {
          try {
            const image = await pdfDoc.embedJpg(imgBytes);
            const imgDims = image.scale(0.3);
            contentPage.drawImage(image, {
              x: 50,
              y: yPos - imgDims.height,
              width: imgDims.width,
              height: imgDims.height,
            });
            yPos = yPos - imgDims.height - 15;
          } catch {
            // Skip corrupted images
          }
        }
      }
    }

    // Sección 4: Observaciones
    yPos -= 20;
    yPos = this.drawSectionTitle(contentPage, '4. OBSERVACIONES', fontBold, yPos);
    yPos = this.drawWrappedText(contentPage, report.observations || 'Sin observaciones adicionales.', font, yPos);

    // Sección 5: Firmas
    yPos = Math.min(yPos - 40, 200);
    this.drawSignatureSection(contentPage, font, fontBold, yPos, report);

    return pdfDoc.save();
  }

  private async fetchImageBytes(fileId: string): Promise<Uint8Array | null> {
    try {
      const { FileAssetService } = await import('../file-asset.service');
      return await new FileAssetService().getFileBytes(fileId);
    } catch { return null; }
  }

  private drawSectionTitle(page: PDFPage, title: string, font: any, y: number): number {
    page.drawText(title, { x: 50, y, size: 14, font, color: rgb(33/255, 84/255, 166/255) });
    page.drawLine({
      start: { x: 50, y: y - 5 },
      end: { x: 545, y: y - 5 },
      thickness: 1,
      color: rgb(33/255, 84/255, 166/255),
    });
    return y - 30;
  }

  private drawField(page: PDFPage, label: string, value: string, font: any, y: number): number {
    page.drawText(`${label} ${value}`, { x: 60, y, size: 10, font });
    return y - 15;
  }

  private drawBulletPoint(page: PDFPage, text: string, font: any, y: number): number {
    page.drawText(text, { x: 70, y, size: 10, font });
    return y - 14;
  }

  private drawWrappedText(page: PDFPage, text: string, font: any, y: number): number {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, 10);
      if (width > 495) { // 545 - 50 (margin)
        page.drawText(line, { x: 60, y: currentY, size: 10, font });
        line = word;
        currentY -= 14;
      } else {
        line = testLine;
      }
    }
    if (line) page.drawText(line, { x: 60, y: currentY, size: 10, font });
    return currentY - 14;
  }

  private drawCover(page: PDFPage, report: TechnicalReport, font: any, fontBold: any) {
    // Logo placeholder
    page.drawRectangle({
      x: 50, y: 700, width: 100, height: 100,
      color: rgb(33/255, 84/255, 166/255),
    });
    page.drawText('CERMONT S.A.S.', { x: 50, y: 680, size: 24, font: fontBold, color: rgb(33/255, 84/255, 166/255) });

    page.drawText('INFORME TÉCNICO DE SERVICIO', {
      x: 50, y: 500, size: 18, font: fontBold,
    });
    page.drawText(`Orden: ${report.orderCode}`, { x: 50, y: 470, size: 12, font });
    page.drawText(`Fecha: ${report.date.toLocaleDateString('es-CO')}`, { x: 50, y: 450, size: 12, font });
    page.drawText(`Cliente: ${report.clientName}`, { x: 50, y: 430, size: 12, font });
    page.drawText(`NIT: ${report.clientNit}`, { x: 50, y: 410, size: 12, font });
  }

  private drawSignatureSection(page: PDFPage, font: any, fontBold: any, y: number, report: TechnicalReport) {
    const lineY = y;
    page.drawLine({ start: { x: 50, y: lineY }, end: { x: 250, y: lineY }, thickness: 1 });
    page.drawText(report.technicianName || 'Técnico Responsable', { x: 50, y: lineY - 15, size: 9, font });

    page.drawLine({ start: { x: 350, y: lineY }, end: { x: 545, y: lineY }, thickness: 1 });
    page.drawText('Cliente / Supervisor', { x: 400, y: lineY - 15, size: 9, font });
  }
}
```

### Módulo: Admin Custom Fields Builder (Sprint 5, T5.4)

**Arquitectura del Builder**:
```typescript
// packages/shared-types/src/schemas/custom-fields.ts
export const FieldTypeEnum = z.enum([
  'text', 'number', 'date', 'select', 'multi_select',
  'checkbox', 'file', 'image', 'signature', 'lookup',
]);

export const CustomFieldDefinitionSchema = z.object({
  _id: z.string().optional(),
  entity: z.enum([
    'work_request', 'proposal', 'order', 'execution',
    'evidence', 'report', 'delivery_record', 'ses', 'invoice',
  ]),
  fieldKey: z.string().regex(/^[a-z_][a-z0-9_]*$/, 'Key inválida (solo minúsculas, números, underscore)'),
  label: z.string().min(1).max(100),
  type: FieldTypeEnum,
  required: z.boolean().default(false),
  placeholder: z.string().max(200).optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(), // para select / multi_select
  validations: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(), // regex
    maxLength: z.number().optional(),
    minLength: z.number().optional(),
  }).optional(),
  order: z.number().int().min(0),
  section: z.string().max(100).default('General'),
  active: z.boolean().default(true),
}).strict();
export type CustomFieldDefinition = z.infer<typeof CustomFieldDefinitionSchema>;
```

**Renderizado dinámico**:
```tsx
// frontend/modules/custom-fields/ui/DynamicFieldsRenderer.tsx
function DynamicFieldsRenderer({
  entityType,
  entityId,
  values,
  onChange,
}: {
  entityType: string;
  entityId?: string;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  const { data: fields, isLoading } = useQuery({
    queryKey: ['custom-fields', entityType],
    queryFn: () => apiClient.get<CustomFieldDefinition[]>(`/custom-fields/${entityType}`),
  });

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (!fields?.length) return null; // Sin campos personalizados

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Campos Personalizados</h3>
      {fields
        .sort((a, b) => a.order - b.order)
        .filter(f => f.active)
        .map(field => (
          <DynamicField
            key={field.fieldKey}
            field={field}
            value={values[field.fieldKey]}
            onChange={(v) => onChange(field.fieldKey, v)}
          />
        ))}
    </div>
  );
}

// Renderizado por tipo
function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  switch (field.type) {
    case 'text':
      return (
        <FormField>
          <Label>{field.label}{field.required && ' *'}</Label>
          <Input
            value={value as string || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.validations?.maxLength}
          />
        </FormField>
      );
    case 'number':
      return (
        <FormField>
          <Label>{field.label}{field.required && ' *'}</Label>
          <Input
            type="number"
            value={value as number || ''}
            onChange={e => onChange(Number(e.target.value))}
            min={field.validations?.min}
            max={field.validations?.max}
          />
        </FormField>
      );
    case 'select':
      return (
        <FormField>
          <Label>{field.label}{field.required && ' *'}</Label>
          <select
            className="w-full rounded-md border p-2"
            value={value as string || ''}
            onChange={e => onChange(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </FormField>
      );
    case 'signature':
      return <SignaturePad value={value as string} onChange={onChange} />;
    case 'file':
      return <FileUpload value={value as string[]} onChange={onChange} />;
    case 'image':
      return <ImageCapture value={value as string} onChange={onChange} />;
    case 'lookup':
      return <EntityLookup field={field} value={value} onChange={onChange} />;
    default:
      return <Input value={value as string || ''} onChange={e => onChange(e.target.value)} />;
  }
}
```

### Módulo: Dispatch y Fleet (Sprint 1, T1.7)

**Schemas**:
```typescript
// packages/shared-types/src/schemas/dispatch.schema.ts
export const DispatchStatusEnum = z.enum([
  'pending', 'loading', 'in_transit', 'on_site', 'returning', 'completed', 'cancelled'
]);

export const DispatchRecordSchema = z.object({
  orderId: z.string(),
  vehicleId: z.string(),
  personnelIds: z.array(z.string()).min(1),
  departureTime: z.date(),
  estimatedArrivalTime: z.date().optional(),
  actualArrivalTime: z.date().optional(),
  departureGPS: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
  arrivalGPS: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
  status: DispatchStatusEnum,
  cargoManifest: z.array(z.object({
    itemType: z.enum(['tool', 'material', 'equipment', 'epp', 'document']),
    itemId: z.string(),
    quantity: z.number().positive(),
  })).optional(),
  notes: z.string().max(500).optional(),
  createdBy: z.string(),
  approvedBy: z.string().optional(),
}).strict();
export type DispatchRecord = z.infer<typeof DispatchRecordSchema>;

// packages/shared-types/src/schemas/fleet.schema.ts
export const VehicleTypeEnum = z.enum(['pickup', 'van', 'truck', 'motorcycle', 'other']);
export const VehicleStatusEnum = z.enum(['available', 'in_use', 'maintenance', 'out_of_service']);

export const FleetVehicleSchema = z.object({
  plate: z.string().regex(/^[A-Z]{3}\d{3}$/, 'Placa inválida (formato: ABC123)'),
  brand: z.string(),
  model: z.string(),
  year: z.number().int().min(2000).max(2030),
  type: VehicleTypeEnum,
  color: z.string().optional(),
  vin: z.string().length(17).optional(),
  mileage: z.number().int().min(0),
  status: VehicleStatusEnum,
  documents: z.array(z.object({
    type: z.enum(['soat', 'tecnomecanica', 'seguro', 'propiedad']),
    number: z.string(),
    expiryDate: z.date(),
    fileId: z.string().optional(),
  })),
  assignedDrivers: z.array(z.string()).optional(),
  notes: z.string().max(500).optional(),
}).strict();
export type FleetVehicle = z.infer<typeof FleetVehicleSchema>;
```

**Endpoints**:
```typescript
// Dispatch
GET    /api/dispatch                    // Listar despachos con filtros
POST   /api/dispatch                    // Crear despacho
GET    /api/dispatch/:id                // Detalle
PUT    /api/dispatch/:id                // Actualizar
POST   /api/dispatch/:id/start         // Iniciar despacho (registrar salida + GPS)
POST   /api/dispatch/:id/arrive        // Confirmar llegada (GPS)
POST   /api/dispatch/:id/complete      // Completar despacho

// Fleet
GET    /api/fleet                       // Listar vehículos
GET    /api/fleet/:id                   // Detalle vehículo
POST   /api/fleet                       // Crear vehículo
PUT    /api/fleet/:id                   // Actualizar
GET    /api/fleet/:id/maintenance       // Historial mantenimiento
POST   /api/fleet/:id/maintenance      // Registrar mantenimiento
GET    /api/fleet/alerts               // Alertas (SOAT, tecnomecánica vencidas)
```

### Módulo: SLA Management (Sprint 5, T5.8)

```typescript
// packages/shared-types/src/schemas/sla.schema.ts
export const SLAStatusEnum = z.enum([
  'on_track', 'at_risk', 'breached', 'completed', 'not_applicable'
]);

export const SLARuleSchema = z.object({
  name: z.string().min(1).max(100),
  clientId: z.string().optional(), // null = aplica a todos
  serviceType: z.string().optional(), // null = aplica a todos
  maxHours: z.number().positive(), // Tiempo máximo para completar
  penaltyPerDay: z.number().min(0).optional(), // Penalización por día de retraso
  maxPenalty: z.number().min(0).optional(), // Penalización máxima
  escalationRules: z.array(z.object({
    afterHours: z.number().positive(),
    notifyRole: z.string(),
    action: z.enum(['notify', 'escalate', 'auto_penalty']),
  })).optional(),
  active: z.boolean().default(true),
}).strict();
export type SLARule = z.infer<typeof SLARuleSchema>;

export const SLATrackingSchema = z.object({
  orderId: z.string(),
  ruleId: z.string(),
  startTime: z.date(),                         // Cuando la orden entró en el alcance del SLA
  elapsedHours: z.number().min(0),              // Calculado periódicamente
  remainingHours: z.number().min(0),            // maxHours - elapsedHours
  status: SLAStatusEnum,
  lastCheckedAt: z.date(),
  breachNotifiedAt: z.date().optional(),
  penaltyApplied: z.boolean().default(false),
  escalationLevel: z.number().int().min(0).default(0),
}).strict();
export type SLATracking = z.infer<typeof SLATrackingSchema>;
```

**Servicio de Monitoreo**:
```typescript
// backend/src/services/sla/sla-monitoring.service.ts
export class SLAMonitoringService {
  async checkAllActiveOrders(): Promise<SLAResult[]> {
    const activeOrders = await OrderModel.find({
      status: { $in: ['pending', 'planned', 'in_progress'] },
    });

    const results: SLAResult[] = [];

    for (const order of activeOrders) {
      const slaRule = await SLARuleModel.findOne({
        $or: [
          { clientId: order.clientId, serviceType: order.serviceType },
          { clientId: order.clientId, serviceType: null },
          { clientId: null, serviceType: order.serviceType },
          { clientId: null, serviceType: null },
        ],
        active: true,
      }).sort({ clientId: -1, serviceType: -1 }); // Más específico primero

      if (!slaRule) continue;

      const tracking = await SLATrackingModel.findOne({ orderId: order._id })
        ?? await SLATrackingModel.create({
          orderId: order._id,
          ruleId: slaRule._id,
          startTime: new Date(),
          elapsedHours: 0,
          remainingHours: slaRule.maxHours,
          status: 'on_track',
          lastCheckedAt: new Date(),
        });

      // Calcular horas transcurridas
      const hoursElapsed = (Date.now() - tracking.startTime.getTime()) / 3600000;
      tracking.elapsedHours = hoursElapsed;
      tracking.remainingHours = Math.max(0, slaRule.maxHours - hoursElapsed);
      tracking.lastCheckedAt = new Date();

      // Determinar estado
      if (hoursElapsed >= slaRule.maxHours) {
        tracking.status = 'breached';
      } else if (hoursElapsed >= slaRule.maxHours * 0.8) {
        tracking.status = 'at_risk';
      } else {
        tracking.status = 'on_track';
      }

      // Escalamiento
      if (tracking.status === 'at_risk' || tracking.status === 'breached') {
        for (const escalation of slaRule.escalationRules || []) {
          if (hoursElapsed >= escalation.afterHours && tracking.escalationLevel < escalation.afterHours) {
            await this.notificationService.notifyRole(escalation.notifyRole, {
              type: 'sla_escalation',
              orderId: order._id,
              level: escalation.afterHours,
              action: escalation.action,
            });
            tracking.escalationLevel = escalation.afterHours;
          }
        }
      }

      await tracking.save();
      results.push({ orderId: order._id, status: tracking.status, remainingHours: tracking.remainingHours });
    }

    return results;
  }
}
```

## Plan de Calidad y Aseguramiento

### Pirámide de Pruebas (Objetivos)

```
         ╱╲
        ╱  ╲          E2E (Playwright): 14 flujos críticos
       ╱    ╲          Coverage: cada paso del flujo operativo
      ╱ E2E  ╲        Tiempo: < 5 min total
     ╱────────╲
    ╱          ╲      Integration (Vitest + Supertest): ~200 tests
   ╱            ╲     Coverage: 85% endpoints, flujos completos
  ╱ Integration ╲    Tiempo: < 30s
 ╱────────────────╲
╱                  ╲  Unit (Vitest): ~800 tests
╱     Unit          ╲ Coverage: 90% servicios, 100% reglas de negocio
╱────────────────────╲ Tiempo: < 10s
```

### Matriz de Pruebas por Módulo

| Módulo | Unit Tests | Integration Tests | Component Tests | E2E Tests |
|---|---|---|---|---|
| Auth + RBAC | 20 | 10 | — | 2 |
| Work Requests | 10 | 8 | 5 | 1 |
| Site Visits | 8 | 6 | 3 | 1 |
| Proposals | 12 | 8 | 5 | 1 |
| Purchase Orders | 8 | 6 | 3 | — |
| Orders | 15 | 10 | 8 | 1 |
| Planning | 15 | 10 | 8 | 1 |
| Execution | 20 | 15 | 10 | 1 |
| Evidences | 12 | 10 | 8 | 1 |
| Reports | 15 | 10 | 5 | 1 |
| Delivery Records | 10 | 8 | 5 | 1 |
| SES | 12 | 10 | 5 | 1 |
| Invoices | 15 | 12 | 5 | 1 |
| Payments | 10 | 8 | 5 | 1 |
| Costs | 15 | 10 | 8 | — |
| Documents | 10 | 8 | 5 | — |
| Assets | 12 | 8 | 5 | — |
| Inventory | 12 | 8 | 5 | — |
| Dispatch | 10 | 8 | 5 | — |
| Fleet | 8 | 6 | 3 | — |
| SLA | 10 | 8 | 3 | — |
| AI | 8 | 6 | 5 | 1 |
| Admin | 15 | 10 | 8 | — |
| **Total** | **~302** | **~213** | **~118** | **14** |

### Calidad de Código — Gates Automatizados

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }

      - name: Install dependencies
        run: npm ci

      - name: TypeScript strict check
        run: npm run typecheck
        # Exit 0 si no hay errores. Zero any/unknown/null enforcement.

      - name: Lint (Biome + ESLint)
        run: npm run lint
        # Biome: formato + reglas de estilo
        # ESLint: @typescript-eslint/strict, react-hooks, import

      - name: Unit + Integration Tests
        run: npm run test -- --coverage
        # Coverage mínima: 80% lines, 70% branches

      - name: Build
        run: npm run build
        # Verifica que el build de producción no tenga errores

      - name: React Doctor
        run: npx react-doctor@latest
        # Diagnóstico de React: hooks, renders, accesibilidad

      - name: Security Audit
        run: npm audit --audit-level=high

      - name: Bundle Size
        run: npx next-bundle-analyzer
        # Alertar si bundle > 500KB (gzip)
```

### Pre-commit Hook (Husky + lint-staged)

```json
// .husky/pre-commit
{
  "scripts": {
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "biome check --apply",
      "eslint --fix --max-warnings=0"
    ],
    "*.{json,md,yaml}": ["biome check --apply"],
    "package.json": ["node scripts/check-dependencies.js"]
  }
}

// .husky/pre-push
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run typecheck
npm run lint
npm run test -- --changedSince=main
```

---

## Glosario de Términos

| Término | Definición |
|---|---|
| **CERMONT S.A.S.** | Contratista multiservicio colombiano, cliente de SIERRACOL Energy |
| **FSM** | Field Service Management — Gestión de servicios de campo |
| **CMMS** | Computerized Maintenance Management System |
| **SES** | Service Entry Sheet — Hoja de entrada de servicio (SAP Ariba) |
| **PO** | Purchase Order — Orden de compra |
| **AST** | Análisis de Trabajo Seguro — Documento de seguridad laboral |
| **EPP** | Equipo de Protección Personal |
| **RBAC** | Role-Based Access Control |
| **SSOT** | Single Source of Truth — Fuente única de verdad |
| **FSD** | Feature-Sliced Design — Patrón de organización modular |
| **RAG** | Retrieval Augmented Generation — Generación aumentada por recuperación |
| **CUFE** | Código Único de Facturación Electrónica (Colombia) |
| **DIAN** | Dirección de Impuestos y Aduanas Nacionales de Colombia |
| **TOTP** | Time-based One-Time Password — Autenticación de dos factores |
| **DLQ** | Dead Letter Queue — Cola de mensajes fallidos |
| **BFF** | Backend for Frontend |
| **PWA** | Progressive Web Application |
| **VPS** | Virtual Private Server |
| **BullMQ** | Librería de colas de trabajo con Redis |
| **Dexie.js** | Wrapper para IndexedDB con API simple |
| **Serwist** | Librería moderna de Service Worker para Next.js |
| **Vercel AI SDK** | Framework unificado de IA para JavaScript |

---

## Referencias Bibliográficas y Fuentes

1. CERMONT S.A.S. Portal institucional. https://cermont.com.co
2. SIERRACOL Energy. Operador del campo Caño Limón. https://sierra-col.com
3. TanStack Table. GitHub repository. https://github.com/TanStack/table (25k+ stars, MIT)
4. TanStack Query. GitHub repository. https://github.com/TanStack/query (42k+ stars, MIT)
5. Zustand. GitHub repository. https://github.com/pmndrs/zustand (48k+ stars, MIT)
6. Dexie.js. GitHub repository. https://github.com/dexie/Dexie.js (11k+ stars, Apache 2.0)
7. Serwist. GitHub repository. https://github.com/serwist/serwist (3k+ stars, MIT)
8. Tremor. GitHub repository. https://github.com/tremorlabs/tremor (16k+ stars, Apache 2.0)
9. BullMQ. GitHub repository. https://github.com/taskforcesh/bullmq (6k+ stars, MIT)
10. Vercel AI SDK. GitHub repository. https://github.com/vercel/ai (12k+ stars, Apache 2.0)
11. Shadcn UI. https://ui.shadcn.com (82k+ stars, MIT)
12. SAP Ariba API Documentation. https://help.sap.com/docs/ariba
13. DIAN Facturación Electrónica. https://www.dian.gov.co
14. Universidad de Pamplona. Facultad de Ingenierías y Arquitectura.
15. Ley 1581 de 2012. Protección de datos personales en Colombia.
16. Node.js Best Practices. https://github.com/goldbergyoni/nodebestpractices
17. MongoDB Schema Design. https://www.mongodb.com/docs/manual/core/data-modeling-introduction/
18. OWASP Top 10 Web Application Security Risks. https://owasp.org/www-project-top-ten/

---

## Commit Strategy

```
Sprint 1: Fundación
  S1.1  feat(costs): implement cost dashboard with KPI aggregation
  S1.2  feat(proposals): add cost breakdown page and endpoint
  S1.3  feat(assets): implement asset management CRUD
  S1.4  feat(inventory): add inventory control with QR scanning
  S1.5  fix(api): complete all REQUIRED_NOT_IMPLEMENTED endpoints (~15)
  S1.6  feat(backups): add historical download portal with ZIP export
  S1.7  feat(dispatch): implement dispatch and fleet management
  S1.8  ci: setup GitHub Actions workflow (typecheck, lint, test, build)
  S1.9  test: migrate and establish Vitest + Playwright test suite

Sprint 2: Offline-First
  S2.1  feat(execution): complete offline-first with IndexedDB sync
  S2.2  feat(evidences): add lightbox gallery with geotagging
  S2.3  feat(planning): implement 6-step planning wizard
  S2.4  feat(dashboard): add WebSocket real-time KPI updates
  S2.5  feat(kits): enhance kit builder and typical kit library
  S2.6  feat(planning): add certification verification before assignment
  S2.7  feat(orders): enhance Kanban with drag-and-drop

Sprint 3: Administrative Closure
S3.1  feat(workflow): complete step 1-4 fields (WorkRequest, SiteVisit, Proposal, PO)
S3.2  feat(planning): complete all planning fields (tools, equipment, EPP, certifications)
S3.3  feat(execution): add preflight checklist, timer, evidence categories
S3.4  feat(reports): evidence gallery, preloaded report, delivery record PDF
S3.5  feat(billing): preloaded SES, Invoice from SES, payment aging, visual reconciliation
S3.6  feat(automation): implement 8 process automation innovations
S4.1  feat(schemas): add 7 CERMONT KPI Zod schemas to shared-types
S4.2  feat(kpi): implement 7 KPI aggregation endpoints
S4.3  feat(dashboard): build KPI UI components (KpiCard, KpiGrid, KpiTrend)
S4.4  feat(dashboard): organize dashboard by CERMONT domains (lifeline, HSE, CCTV, etc.)
S5.1  feat(forms): complete dynamic form builder with admin UI
S5.2  feat(forms): add PDF export to all dynamic forms
S5.3  feat(admin): implement automated monthly archive + historical ZIP download
S5.4  feat(admin): enhance audit with filters and export
S5.5  feat(admin): add personnel dashboard with certification alerts
S5.6  feat(admin): implement categorized settings
S5.7  feat(sla): implement SLA monitoring dashboard
S5.8  fix(frontend): resolve React Doctor issues to reach >= 90/100
S6.1  feat(ui): implement DESIGN.md v4.0 tokens and dark mode
S6.2  feat(ui): implement responsive navigation (bottom nav + sidebar)
S6.3  feat(ui): refactor cards to DESIGN.md specs (24px radius)
S6.4  feat(ui): replace emoji icons with Lucide React unicolor
S6.5  feat(ui): add missing UI states (loading, error, empty, offline, forbidden)
S6.6  test: implement E2E tests for critical flows
S6.7  refactor: migrate Spanish symbols to English + clean types
S6.8  docs: finalize technical documentation
```

---

## Success Criteria

### Verification Commands

```bash
npm run typecheck        # Expected: exit 0, no errors
npm run lint             # Expected: exit 0, no warnings
npm run test             # Expected: all 508+ tests pass
npm run test:e2e         # Expected: all 14+ E2E flows pass
npm run build            # Expected: exit 0, production build
npx react-doctor@latest  # Expected: no critical issues
npm run verify           # Expected: all quality gates pass
```

### Final Checklist

- [ ] 100% de rutas frontend implementadas (86/86)
- [ ] 100% de endpoints backend implementados (todos status IMPLEMENTED)
- [ ] Offline-first completo para execution y evidencias
- [ ] Dashboard con KPIs en tiempo real vía WebSocket
- [ ] Flujo administrativo completo: SES -> Invoice -> Payment con conciliación 3 vías
- [ ] Cermont AI: chat contextual + generación de informes + predicción SLA
- [ ] Portal de descarga de históricos con archivado automático mensual
- [ ] CI/CD pipeline: push a main -> deploy automático a VPS
- [ ] Documentación técnica completa (rutas, API, módulos, ADRs)
- [ ] Lighthouse >85 en performance, accesibilidad, buenas prácticas, SEO
- [ ] Typecheck, lint, test, build pasando en CI
- [ ] Sesiones activas manejables con MFA para roles administrativos
- [ ] Matriz de permisos por rol visible y editable
- [ ] Custom fields builder con drag & drop funcional
- [ ] ERP connector Ariba implementado y funcional
