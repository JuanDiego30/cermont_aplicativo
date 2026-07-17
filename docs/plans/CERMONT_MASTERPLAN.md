# CERMONT MASTERPLAN — Plan Vigente Único

> **Versión:** 7.0 (consolidado de v3→v6.1)
> **Fecha:** 2026-07-09
> **Estado:** `CURRENT_SOURCE_OF_TRUTH`
> **Reemplaza:** v3, v4, v5, v5.1, v6, v6.1 (archivados en `docs/plans/archive/`)
> **Repositorio:** https://github.com/JuanDiego30/cermont_aplicativo.git
> **Fuente principal de requisitos:** `docs/requirements/THESIS_CANONICAL.md`

<!-- Fuente: decisión de equipo, 2026-07-09 -->

---

## Historia de Evolución del Plan

<!-- Fuente: síntesis de v3, v4, v5, v5.1, v6, v6.1 -->

| Versión | Fecha Estimada | Aporte Principal | Por Qué Se Superó |
|---|---|---|---|
| **v3** | ~2026-05 | Estructura original de Waves (0-16), sistema de prioridades P0-P4, Anti-Hallucination Protocol, React Doctor Protocol | No tenía auditoría real del código; asumía que mucho no existía |
| **v4** | ~2026-06 | Benchmark profesional FSM/CMMS, Matriz de Madurez, auditoría detallada por módulo (59 backend, 48 frontend), guardrails, 12 sprints con tickets | Diagnóstico mejorado pero aún contenía suposiciones incorrectas sobre el código |
| **v5** | ~2026-07-07 | Correcciones de v4, inventario de madurez de páginas (94+), verificación runtime, especificaciones CCTV/Lifelines, estructura monorepo confirmada | 4000+ líneas, demasiado denso; algunas correcciones de v4 incorrectas |
| **v5.1** | ~2026-07-07 | 8 correcciones a suposiciones v5, alineación con CERMONT_CODIGO.json, "qué NO debe crearse desde cero", S0 reordenado | No integraba contract-first como metodología central |
| **v6** | ~2026-07 | Metodología contract-first aplicada a 25 módulos, templates de módulo consistentes, 18 sprints, marco legal Colombia, matriz anti-duplicidad | Git safety ausente; riesgo de comandos destructivos |
| **v6.1** | ~2026-07 | **Git Safety policy** (secciones 40-45), política de evidencias, jerarquía de fuentes de verdad, control de subida de archivos, política Context7/Vercel | Versión más madura; consolidada como base del v7 |

---

## Trazabilidad a Requisitos de Tesis

<!-- Fuente: v6 sección 2.3, + THESIS_REQUIREMENTS.md -->

La matriz de trazabilidad completa vive en [`docs/requirements/TRACEABILITY_MATRIX.md`](../requirements/TRACEABILITY_MATRIX.md).

**Resumen de las 5 Fallas Críticas (de la tesis, capítulo 1.3):**

| ID | Falla | Módulo Principal | Estado Actual |
|---|---|---|---|
| FC-01 | Planeación de la actividad (Paso 5) | 07 — Planning Packets | Parcial |
| FC-02 | Ejecución en campo y captura de evidencias (Paso 6) | 11 — Execution Sessions / 12 — Evidences | Parcial |
| FC-03 | Consolidación documental, informes y actas (Pasos 7-9) | 13 — Technical Reports / 14 — Delivery Records | Parcial |
| FC-04 | Retrasos en facturación y cierre administrativo (Pasos 10-14) | 15 — SES / 16 — Invoices / 17 — Payments | Parcial |
| FC-05 | Ausencia de control centralizado de costos reales (Transversal 3-14) | 18 — Costs / ERP | Parcial |

**Requisito contractual adicional (de Observaciones de Anteproyecto):**

| ID | Requisito | Módulo | Prioridad |
|---|---|---|---|
| REQ-006 | Modo offline en ejecución de campo | 11 — Execution Sessions | PRIORITARIO |

<!-- Fuente: 09_Observaciones_Anteproyecto_Juan_Diego2.md, "Módulo 1: Ejecución en Campo con Modo Online/Offline" -->

---

## Arquitectura del Monorepo

<!-- Fuente: v5.1 sección 0.4 + v6 sección 4.1 -->

```
cermont_aplicativo/
├── backend/                          # Express 5.2.1 + Mongoose 9
│   ├── src/
│   │   ├── modules/                  # ~59 módulos funcionales
│   │   ├── models/                   # Mongoose models
│   │   ├── middlewares/              # auth, rbac, sanitize, rate-limit
│   │   └── services/                 # cross-cutting services
│   └── tests/
├── frontend/                         # Next.js 16 App Router
│   ├── src/
│   │   ├── app/(dashboard)/          # Dashboard pages
│   │   ├── app/(portal)/             # Client portal
│   │   ├── modules/                  # Feature-sliced modules
│   │   └── lib/                      # Shared utilities
│   └── tests/
├── packages/
│   ├── shared-types/                 # Zod schemas + types
│   │   └── src/schemas/              # ~111 schemas
│   ├── domain/                       # Business rules (SSOT)
│   │   └── src/                      # roles, operational-steps, planning.rules, etc.
│   └── ... (otros)
├── docs/                             # Documentación (ver abajo)
├── .sisyphus/                        # Planes y evidencias
│   ├── plans/                        # 20 archivos fuente originales
│   └── evidence/                     # Evidencias de ejecución
└── scripts/                          # DevOps scripts
```

---

## Metodología Contract-First

<!-- Fuente: v6 sección 1 + cermont_documento_metodologia_modular_contract_first.md -->

### Orden Obligatorio por Módulo

```
Schema Zod (packages/shared-types/)
  → Tipo inferido (z.infer)
    → Reglas de dominio (packages/domain/)
      → Modelo Mongoose (backend/src/models/)
        → Servicio (backend/src/modules/{x}/*.service.ts)
          → Controlador delgado (backend/src/modules/{x}/*.controller.ts)
            → Ruta con validación (backend/src/modules/{x}/*.routes.ts)
              → API service frontend (frontend/src/modules/{x}/api/)
                → Query keys (frontend/src/modules/{x}/queries.ts)
                  → Hook TanStack Query (frontend/src/modules/{x}/hooks/)
                    → UI Componente (frontend/src/modules/{x}/ui/)
                      → Página (frontend/src/app/.../page.tsx)
                        → Tests
```

### Contract-First Checklist (por entidad nueva)

- [ ] Schema Zod definido (z.object con validaciones)
- [ ] Tipo inferido exportado
- [ ] Snapshot de contrato actualizado (`npm run contracts:check`)
- [ ] Reglas de dominio en `packages/domain/src/`
- [ ] Modelo Mongoose alineado con schema
- [ ] Servicio backend con manejo de errores tipados
- [ ] Controlador sin lógica de negocio
- [ ] Ruta con middleware chain completa
- [ ] Response envelope consistente
- [ ] API service frontend
- [ ] Query keys estables
- [ ] Hook TanStack Query
- [ ] Componente UI
- [ ] Página con loading/error/empty/offline states
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Evidencia documentada

<!-- Fuente: v3 Contract-First Checklist + v6 sección 1.2 -->

---

## Guardrails (Qué NO Tocar)

<!-- Fuente: v4 secciones 0, 1, 2; v6.1 sección 3 -->

### Stack Inmutable (NO cambiar sin ADR aprobado)

| Componente | Tecnología | Prohibición |
|---|---|---|
| Backend framework | Express 5.2.1 | ❌ No NestJS |
| Base de datos | MongoDB + Mongoose 9 | ❌ No Prisma / PostgreSQL |
| Validación | Zod 4.x | ❌ No Joi / Yup |
| Frontend framework | Next.js 16 App Router | ❌ No Vite / CRA |
| Auth | JWT + Zustand auth store | ❌ No NextAuth / Auth.js |
| HTTP client | apiClient wrapper | ❌ No Axios directo |
| Package manager | npm | ❌ No pnpm / yarn |
| Deploy | VPS (Docker + PM2 + Nginx) | ❌ No Vercel exclusivo |

### Prohibiciones Absolutas de Código

- ❌ `any` / `as any` / `@ts-ignore` / `@ts-expect-error`
- ❌ `null` / `undefined` para ausencia (usar status objects)
- ❌ `console.log` / `debugger` / `alert` en producción
- ❌ Duplicación de schemas, roles, rutas, estados, validaciones
- ❌ Roles hardcodeados en componentes (usar `@cermont/domain`)
- ❌ `fetch` directo en componentes (usar TanStack Query + apiClient)
- ❌ `useEffect` para data fetching (usar TanStack Query)
- ❌ Lógica de negocio en UI
- ❌ Middleware.ts de Next.js como perímetro de seguridad (usar `proxy.ts`)
- ❌ Catch vacío o errores tragados

### Anti-Hallucination Protocol

1. Verificar existencia de schema/model antes de crear uno nuevo
2. Buscar en `packages/shared-types/src/schemas/` antes de definir
3. Buscar en `backend/src/modules/` antes de crear ruta
4. Buscar en `frontend/src/modules/` antes de crear componente
5. Documentar hallazgo en `.sisyphus/evidence/` si no existe
6. Si existe, NO duplicar — usar lo existente o extenderlo

<!-- Fuente: v3 sección 4 + v6 sección 3 -->

---

## Política de Git y Evidencias

<!-- Fuente: v6.1 secciones 40-45, Apéndices L y R -->

### Git Safety (Regla de Oro)

> **Ningún comando git destructivo sin autorización explícita del usuario.**
> Comandos que requieren autorización: `checkout`, `switch`, `reset`, `stash`, `rebase`, `merge`, `push --force`, `branch -D`, `clean -fd`

### Flujo de Trabajo Autorizado

```
1. Mostrar estado al usuario (git status, git diff — solo lectura)
2. Usuario revisa y autoriza archivos específicos
3. Staging selectivo (solo archivos autorizados)
4. Verificar staging (git diff --cached)
5. Commit con mensaje Conventional Commit
6. Push
7. Reportar
```

### Política de Evidencias

- Las evidencias se guardan LOCALMENTE en `.sisyphus/evidence/`
- No se suben a GitHub sin autorización explícita
- Sanitizar: revisar tokens, tamaños, datos sensibles antes de subir
- `CERMONT_CODIGO.json` no debe estar en staging sin verificación

### Jerarquía de Fuente de Verdad

1. Código real compilado (backend/src/, frontend/src/)
2. Schemas Zod (packages/shared-types/)
3. Reglas de dominio (packages/domain/)
4. Documentación canónica (docs/ — esta estructura)
5. Planes archivados (docs/plans/archive/)
6. Archivos fuente originales (.sisyphus/plans/)

---

## Módulos y Tareas (Waves)

<!-- Fuente: v6.1 secciones 9-34, v4 sprints, v3 waves -->

### Mapa de 25 Módulos

| # | Módulo | Fase 14 Pasos | Prioridad | Sprint Asignado |
|---|---|---|---|---|
| 00 | Runtime Alignment + Evidence Baseline | Transversal | P0 | S0 |
| 01 | Customers / Clients | 1 (WR) | P1 | S1 |
| 02 | Work Requests | 1 | P1 | S1 |
| 03 | Site Visits | 2 | P1 | S1 |
| 04 | Proposals | 3 | P1 | S2 |
| 05 | Purchase Orders | 4 | P1 | S2 |
| 06 | Orders / Service Cases / 14-Step | 4→14 | P0 | S2 |
| 07 | Planning Packets | 5 | P0 | S3 |
| 08 | Kits / Tools / Equipment | 5 | P1 | S4 |
| 09 | Forms / Checklists / Dynamic Templates | 5, 6 | P0 | S5 |
| 10 | SGSST / AST / HES / Certifications | 5 | P1 | S6 |
| 11 | Execution Sessions / Offline Field Work | 6 | P0 | S7 |
| 12 | Evidences / Files / Photo Metadata | 6, 7 | P0 | S8 |
| 13 | Technical Reports | 7 | P1 | S9 |
| 14 | Delivery Records / Signatures | 8, 9 | P1 | S9 |
| 15 | SES / Ariba | 10, 11 | P1 | S10 |
| 16 | Invoices / DIAN / Colombia Legal | 12, 13 | P1 | S10 |
| 17 | Payments | 14 | P1 | S10 |
| 18 | Costs / ERP / Profitability | Transversal 3-14 | P0 | S11 |
| 19 | Dashboard / KPIs / SLA / Bottlenecks | Transversal | P1 | S12 |
| 20 | Fleet / Assets / Inventory / Maintenance | Transversal | P2 | S13 |
| 21 | Portal Cliente | Transversal | P2 | S14 |
| 22 | Admin / RBAC / Audit / Backups | Transversal | P1 | S15 |
| 23 | Notifications | Transversal | P2 | S15 |
| 24 | Documents / Business Documents | Transversal | P2 | S16 |
| 25 | VPS Production / Docker / Nginx / PM2 | Transversal | P0 | S17 |

### Módulo 11 — Ejecución en Campo (Modo Offline) — REQ-006

**Clasificación:** Requisito contractual PRIORITARIO (no "deseable")
**Fuente:** `docs/requirements/THESIS_REQUIREMENTS.md#REQ-006`
**Cita textual del anteproyecto (09_Observaciones_Anteproyecto_Juan_Diego2.md):**
> Módulo 1: Ejecución en Campo con Modo Online/Offline
> Modo de Uso Híbrido (Online/Offline): La aplicación móvil funcionará de forma nativa en el
> dispositivo, permitiendo al técnico registrar toda la información del servicio (checklists, fotos,
> firmas) sin necesidad de una conexión a internet.
> Sincronización Automática: El aplicativo detectará automáticamente la disponibilidad de una
> conexión a internet y sincronizará en segundo plano toda la información recolectada con el
> servidor central, sin requerir intervención del usuario.

**Estado de implementación verificado (2026-07-09):** Parcial — sync queue implementada,
conflict resolution pendiente

**Especificación técnica mínima (derivada del requisito):**
- IndexedDB para almacenamiento local de evidencias y formularios pendientes
- Sync queue con idempotency keys (clientMutationId)
- Detección de conectividad (online/offline) con indicador visual
- Resolución de conflictos cuando el servidor rechaza una mutación offline
- Retry con backoff exponencial

**Criterio de aceptación contractual:**
Un técnico en campo sin señal debe poder: completar un formato de inspección, capturar evidencia
fotográfica, y guardar localmente — sincronizando automáticamente al recuperar conectividad,
sin pérdida de datos.

<!-- Fuente: F8 de maduración documental, REQ-006 de 09_Observaciones_Anteproyecto_Juan_Diego2.md -->

### Prioridades (P0→P4)

- **P0**: Bloqueante de calidad/runtime/verify — debe resolverse antes de cualquier avance funcional
- **P1**: Flujo operativo y cierre administrativo — core del negocio
- **P2**: UX, performance, offline, tests — mejora continua
- **P3**: Innovación funcional — valor agregado
- **P4**: Escalamiento, histórico, VPS — infraestructura

<!-- Fuente: v3 sección 10 (Backlog Maestro Priorizado) -->

---

## Estado de Implementación Actual

<!-- NUEVO — verificado contra código real (2026-07-09) -->

Este estado se verifica ejecutando:
```bash
find backend/src/modules -maxdepth 1 -type d | wc -l
find frontend/src/app -name "page.tsx" | wc -l
find packages/shared-types/src/schemas -name "*.ts" | wc -l
```

**Backend:** ~59 módulos implementados (cobertura estructural alta)
**Frontend:** ~94+ páginas implementadas (madurez variable)
**Schemas:** ~111 schemas Zod definidos
**Tests:** 508+ backend tests, 100+ frontend tests, E2E creciendo
**ADRs:** 14+ existentes en `docs/adr/`

### Qué Falta (Gaps Conocidos)

- Módulo 09 (Dynamic Forms): conectividad template→submission parcial
- Módulo 11 (Offline): sync queue implementada, conflict resolution pendiente
- Módulo 18 (Costs): dashboard de rentabilidad contra propuesta pendiente
- Módulo 20 (Fleet): UI de checkout/checkin, mantenimiento programado
- Módulo 21 (Portal): autenticación de cliente, consulta de órdenes
- E2E flujo completo de 14 pasos
- Lighthouse/PWA audit complete

<!-- Fuente: v5 sección 5 (Page Maturity) + verificación de código -->

---

## Sprints de Implementación

<!-- Fuente: v6.1 sección 35, v3 sección 11, v4 sprint 31-35 -->

| Sprint | Duración | Módulos | Depende de |
|---|---|---|---|
| **S0** — Runtime Alignment | 1 día | 00 — Baseline + Evidencias | N/A |
| **S1** — Clientes + Solicitudes + Visitas | 3 días | 01, 02, 03 | S0 |
| **S2** — Propuestas + PO + Órdenes | 4 días | 04, 05, 06 | S1 |
| **S3** — Planning Contract-First | 5 días | 07 | S2 |
| **S4** — Kits / Tools / Equipment | 3 días | 08 | S3 |
| **S5** — Forms / Checklists / CCTV / Lifelines | 4 días | 09 | S3, S4 |
| **S6** — SGSST / AST / HES | 3 días | 10 | S3 |
| **S7** — Execution Offline | 5 días | 11 | S3, S5 |
| **S8** — Evidences / Files | 4 días | 12 | S7 |
| **S9** — Reports + Delivery + Signatures | 4 días | 13, 14 | S7, S8 |
| **S10** — SES + Invoices + Payments | 5 días | 15, 16, 17 | S9 |
| **S11** — Costs / ERP / Colombia Legal | 5 días | 18 | S10 |
| **S12** — Dashboard / KPIs | 4 días | 19 | S10, S11 |
| **S13** — Fleet / Assets / Inventory | 4 días | 20 | S5 |
| **S14** — Portal Cliente | 3 días | 21 | S9 |
| **S15** — Admin / RBAC / Audit / Notifications | 4 días | 22, 23 | S2 |
| **S16** — Business Documents | 3 días | 24 | S9 |
| **S17** — E2E 14 Pasos + VPS | 5 días | 25 | Todos |

**Total estimado:** 52-74 días hábiles

---

## Referencias a Documentación Canónica

<!-- Fuente: docs/ existentes -->

| Documento | Ubicación | Propósito |
|---|---|---|
| Product Blueprint | `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` | Visión de producto |
| Business Flow Map | `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` | 14 pasos, entidades, RBAC |
| Architecture Blueprint | `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` | Arquitectura técnica |
| Frontend Route Map | `docs/architecture/FRONTEND_ROUTE_MAP.md` | Todas las rutas |
| API Endpoint Matrix | `docs/architecture/API_ENDPOINT_MATRIX.md` | Todos los endpoints |
| ADRs | `docs/adr/*.md` | Decisiones arquitectónicas |
| Agent Playbook | `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` | Reglas de implementación |
| Development Rules | `docs/REGLAS_DESARROLLO_CERMONT.md` | SOLID, DRY, KISS, YAGNI |
| Operational Forms Map | `docs/domain/CERMONT_OPERATIONAL_FORMS.md` | Formatos → Schemas |
| Org Chart vs RBAC | `docs/domain/CERMONT_ORG_CHART_VS_RBAC.md` | Roles reales vs sistema |
| Traceability Matrix | `docs/requirements/TRACEABILITY_MATRIX.md` | Requisito → Módulo → Endpoint |
| Thesis Requirements | `docs/requirements/THESIS_REQUIREMENTS.md` | Requisitos extraídos de tesis |
| Thesis Canonical | `docs/requirements/THESIS_CANONICAL.md` | Tesis completa (LTG) |
| Conflicts Log | `docs/requirements/CONFLICTS_LOG.md` | Contradicciones no resueltas |

---

## Documentos Archivados (Deprecados)

<!-- Fuente: F3 de maduración documental -->

Los planes v3, v4, v5, v5.1, v6, v6.1 han sido archivados en `docs/plans/archive/` con headers de deprecación.
Cada uno contiene una nota sobre su aporte único preservado en este masterplan.

**NO usar como fuente de tareas activas.**
Para referencia histórica o auditoría, consultar los archivos en `docs/plans/archive/`.

---

*Documento generado el 2026-07-09 como parte de la maduración documental F2.*
*Próxima revisión programada: al completar Sprint 0 de implementación.*
