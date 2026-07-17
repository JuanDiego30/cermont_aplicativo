# Plan de Implementación — Cermont v3.0

# INNOVACIÓN Y MADUREZ — DE FUNCIONAL A ENTERPRISE

## TL;DR

> **Objetivo**: Elevar Cermont de plataforma funcional a sistema enterprise maduro. Cerrar gaps de infraestructura (CI/CD, caché, monitoreo), implementar testing E2E completo, agregar analítica predictiva, madurar integraciones ERP/producción, reforzar seguridad, y optimizar performance. TODO sobre el stack existente — Zero nuevas dependencias pagas.
>
> **Estado actual**: 1,368 tests pasando ✅ | 115 rutas ✅ | React Doctor 93/100 ✅ | 52+ módulos backend ✅ | Plan v2.0 COMPLETADO.
>
> **Entregables**:
> - 🔄 CI/CD Pipeline (GitHub Actions) + Docker compose producción
> - ⚡ Redis Cache Layer + optimización MongoDB (índices, agregaciones)
> - 🧪 Playwright E2E Suite (14 flujos críticos)
> - 📊 Business Intelligence: dashboards personalizados, exportación Excel, reportes programados
> - 🔐 Security Hardening: auditoría OWASP, rate limiting por endpoint, CSP estricta
> - 🤖 AI/ML: predicción de costos, detección de anomalías en evidencias, recomendación de precios
> - 🔗 Integración producción: DIAN producción, Ariba producción, conectores ERP
> - 📱 Mobile offline avanzado: sync bidireccional, conflictos, DLQ management
> - 📚 Developer Portal: API docs interactivas, storybook componentes, changelog
> - 🏗️ Performance: Lighthouse >95, bundle <300KB gzip, P95 <200ms API

---

## Contexto

### Estado Actual del Sistema (Auditado Julio 2026)

El plan v2.0 original (6 sprints, ~1200h estimadas) está **completamente implementado**. El aplicativo Cermont ha evolucionado de un proyecto académico a una plataforma funcional con:

| Métrica | Julio 2026 |
|---|---|
| Módulos backend | 52+ (todos implementados) |
| Rutas frontend | 115 (de 86 originales) |
| Tests passing | 1,368 (694 backend + 490 frontend + 184 shared-types) |
| TypeScript Strict | ✅ Sin errores |
| Biome Lint | ✅ Sin errores |
| Build (Turbopack) | ✅ Compilado 12s |
| React Doctor | 93/100 |
| Quality Gates | ✅ 14 checks pasando |
| Offline/PWA | ✅ Serwist + IndexedDB |
| WebAuthn/Passkeys | ✅ Implementado |
| AI Copilot | ✅ Implementado |
| Portal Cliente | ✅ Implementado |
| DIAN Integration | ✅ Sandbox implementado |
| ERP Connectors | ✅ Ariba mock implementado |

### Lo que NO está implementado (Gaps v3.0)

| Gap | Impacto | Prioridad |
|---|---|---|
| CI/CD Pipeline (GitHub Actions) | Sin automatización de deploys | 🔴 Crítica |
| Redis Cache Layer | API sin caché, latencias altas en dashboards | 🔴 Crítica |
| Playwright E2E Tests | Sin pruebas de flujo completo | 🟡 Alta |
| Docker producción | Sin docker-compose funcional | 🟡 Alta |
| OpenTelemetry + Sentry | Sin trazabilidad de errores en producción | 🟡 Alta |
| Security hardening completo | Sin auditoría OWASP, CSP parcial | 🟡 Alta |
| Business Intelligence | Sin dashboards personalizables ni exportación | 🟢 Media |
| Mobile offline avanzado | Sin DLQ UI ni resolución de conflictos | 🟢 Media |
| Developer Portal | Sin documentación interactiva | 🟢 Media |
| Performance optimization | Lighthouse no medido, bundle sin auditar | 🟢 Media |

---

## Work Objectives

### Core Objective

Transformar Cermont de plataforma funcional a sistema enterprise maduro, cerrando gaps de infraestructura, calidad, seguridad e inteligencia de negocio.

### Concrete Deliverables

- [ ] CI/CD Pipeline: GitHub Actions con typecheck → lint → test → build → deploy VPS
- [ ] Docker: docker-compose.prod.yml funcional con backend + frontend + MongoDB + Redis
- [ ] Redis Cache: CacheService con middleware automático, TTLs por módulo, invalidación por tag
- [ ] Playwright E2E: 14+ tests de flujos críticos con setup/teardown automatizado
- [ ] Analytics BI: Dashboard Builder, exportación Excel/CSV, reportes programados
- [ ] Security: OWASP Top 10 audit, CSP headers estrictos, rate limiting completo
- [ ] AI/ML: Predicción de costos, detección anomalías evidencias, recomendador de precios
- [ ] Integración producción: DIAN, Ariba, conectores ERP con logging y monitoreo
- [ ] Performance: Lighthouse >95, bundle <300KB, API P95 <200ms
- [ ] Developer Portal: API docs interactivas (Scalar/Swagger), Storybook, CHANGELOG.md

### Definition of Done

- [ ] `npm run verify` pasa completo en CI sin errores
- [ ] Playwright E2E: 14/14 flujos pasando
- [ ] Lighthouse >= 95 en 4 categorías
- [ ] API P95 < 200ms endpoints GET
- [ ] Bundle frontend < 300KB gzip
- [ ] React Doctor >= 90

### Must Have

- CI/CD pipeline funcional que deploye a VPS automáticamente
- Redis cache layer reduciendo latencia de dashboards >5x
- Playwright E2E suite con 14 flujos pasando consistentemente
- Security audit con OWASP Top 10 y todas las vulnerabilidades altas mitigadas
- Lighthouse >95 en performance, accesibilidad, buenas prácticas, SEO
- `npm run verify` pasando en CI sin errores

### Must NOT Have (Guardrails)

- ❌ No nuevas dependencias pagas (Redis autoalojado)
- ❌ No cambiar stack: Express 5 + Next.js 16 + MongoDB + Mongoose + Zod 4.x
- ❌ No eliminar funcionalidad existente — solo agregar o mejorar
- ❌ No mock data en producción — siempre datos reales
- ❌ No introducir `any`/`unknown`/`null`/`undefined`
- ❌ No cambiar package.json ni instalar dependencias sin aprobación explícita
- ❌ No implementar AI con APIs pagas (solo estadística pura)
- ❌ No reemplazar el perímetro de seguridad `proxy.ts` por `middleware.ts`
- ❌ No introducir NestJS, Prisma, PostgreSQL, Auth.js, pnpm/yarn

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (Vitest + Playwright config)
- **Automated tests**: YES (TDD para nuevos módulos, tests-after para mejoras)
- **Framework**: Vitest (unit/integration) + Playwright (E2E)
- **Agent-Executed QA**: Mandatory for every task

### QA Policy

Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **TUI/CLI**: interactive_bash (tmux) — Run command, send keystrokes, validate output
- **API/Backend**: Bash (curl) — Send requests, assert status + response fields
- **Library/Module**: Bash (bun/node REPL) — Import, call functions, compare output

### Quality Gates

```
npm run typecheck   → exit 0
npm run lint        → exit 0
npm run test        → 1,368+ tests passing
npm run build       → exit 0
npm run verify      → exit 0
npx react-doctor    → score >= 90
npx playwright test → 14+ E2E tests passing
npx lighthouse-ci   → score >= 95
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Infrastructure Foundation):
├── Task 1.1: GitHub Actions CI/CD pipeline
├── Task 1.2: Docker production compose + deploy scripts
├── Task 1.3: Redis Cache Layer (CacheService + middleware)
└── Task 1.4: MongoDB index audit + optimization

Wave 2 (Testing & Quality):
├── Task 2.1: Playwright E2E suite (14 flows)
├── Task 2.2: Visual regression testing setup
├── Task 2.3: Security audit (OWASP Top 10)
└── Task 2.4: CSP + Rate limiting hardening

Wave 3 (Performance & Scale):
├── Task 3.1: API performance optimization (P95 < 200ms)
├── Task 3.2: Frontend bundle optimization (< 300KB)
├── Task 3.3: Lighthouse audit + fixes (target 95+)
└── Task 3.4: OpenTelemetry + Sentry integration

Wave 4 (Business Intelligence):
├── Task 4.1: Custom dashboard builder (drag & drop widgets)
├── Task 4.2: Excel/CSV export engine
├── Task 4.3: Scheduled report delivery
└── Task 4.4: Analytics API + metrics service

Wave 5 (AI/ML Advanced):
├── Task 5.1: Cost prediction engine (statistical)
├── Task 5.2: Evidence anomaly detection
├── Task 5.3: Price recommendation system
└── Task 5.4: SLA prediction refinement

Wave 6 (Integration Production):
├── Task 6.1: DIAN production integration
├── Task 6.2: Ariba production connector
├── Task 6.3: ERP connector monitoring dashboard
└── Task 6.4: Webhook system for external integrations

Wave 7 (Mobile & Offline Advanced):
├── Task 7.1: Offline DLQ management UI
├── Task 7.2: Bidirectional sync conflict resolution
├── Task 7.3: PWA install optimization + native features
└── Task 7.4: Background sync API

Wave 8 (Developer Experience):
├── Task 8.1: API documentation (Scalar/Swagger)
├── Task 8.2: Storybook component library
├── Task 8.3: CHANGELOG.md + migration guides
└── Task 8.4: Developer onboarding scripts + docs
```

---

## TODOs

### Wave 1: Infrastructure Foundation

- [ ] 1.1 **GitHub Actions CI/CD Pipeline**

  **What to do**:
  - Create `.github/workflows/ci.yml` with 3 jobs:
    - `quality`: Ubuntu + MongoDB service → npm ci → typecheck → lint → test
    - `build`: depends on quality → npm run build
    - `e2e`: depends on build → Playwright tests
  - Create `.github/workflows/deploy.yml` (on push to main/deploy):
    - Build Docker images → push to GHCR → SSH deploy to VPS
  - Add status badge to README.md
  - Configure branch protection rules documentation

  **Recommended Agent Profile**: `unspecified-high` with `[bash-defensive-patterns]`
  **Parallelization**: Wave 1 | **Blocks**: 2.1, 1.2

  **Acceptance Criteria**:
  - [ ] CI pipeline ejecuta typecheck + lint + test + build en cada push
  - [ ] Deploy pipeline deploya a VPS en push a main
  - [ ] Status badge visible en README.md
  - [ ] `gh run list --workflow ci.yml --json conclusion` muestra "success"

  **QA Scenarios**:
  ```
  Scenario: CI pipeline runs and passes
    Tool: Bash (git + gh)
    Steps:
      1. git push origin feature/test-ci
      2. gh run list --workflow ci.yml --limit 1 --json conclusion
    Expected Result: conclusion = "success"
    Evidence: .sisyphus/evidence/task-1.1-ci-result.json
  ```

- [ ] 1.2 **Docker Production Compose + Deploy Scripts**

  **What to do**:
  - Create `docker-compose.prod.yml`:
    - `mongodb` (mongo:7, volumes, user/pass)
    - `redis` (redis:7-alpine)
    - `backend` (Dockerfile build + depends_on)
    - `frontend` (Dockerfile build + depends_on)
    - `nginx` (nginx:alpine, reverse proxy, SSL)
  - Create `backend/Dockerfile` (multi-stage builder + runner)
  - Create `frontend/Dockerfile` (Next.js standalone)
  - Create `nginx.conf` con reverse proxy + SSL
  - Create `scripts/deploy.sh`: backup → pull → build → up → health check → cleanup
  - Create `scripts/rollback.sh`

  **Recommended Agent Profile**: `unspecified-high` with `[bash-defensive-patterns]`
  **Parallelization**: Wave 1 | **Blocks**: 6.1, 6.2 | **Blocked By**: 1.1

  **Acceptance Criteria**:
  - [ ] docker-compose.prod.yml levanta todos los servicios
  - [ ] Frontend accesible vía nginx en puerto 80/443
  - [ ] deploy.sh completa backup + deploy + health check

- [ ] 1.3 **Redis Cache Layer**

  **What to do**:
  - Create `backend/src/services/cache/cache.service.ts`:
    - `getOrSet<T>(key, fetcher, ttl)` — Patrón cache-aside con fallback graceful
    - `invalidate(pattern)` — Invalida por patrón de clave
    - `invalidateByTag(tag)` — Invalidación por tags
  - Create `backend/src/middleware/cache.middleware.ts`:
    - Intercepta `res.json` para cachear automáticamente
    - Headers: `X-Cache: HIT/MISS`, `X-Cache-TTL`
  - Aplicar a endpoints críticos con TTLs definidos:
    - Dashboard KPIs: 5min | Catálogos: 1h | Lists: 2min
  - Invalidación automática al mutar entidades

  **Recommended Agent Profile**: `unspecified-high` with `[nodejs-backend-patterns]`
  **Parallelization**: Wave 1 | **Blocks**: 3.1 | **Blocked By**: 1.2

  **Acceptance Criteria**:
  - [ ] CacheService con getOrSet, invalidate, invalidateByTag
  - [ ] Endpoints dashboard < 50ms con cache HIT (vs > 300ms MISS)
  - [ ] Degradación graceful: si Redis no está, API funciona sin cache
  - [ ] Headers X-Cache presentes en respuestas cacheadas

- [ ] 1.4 **MongoDB Index Audit + Optimization**

  **What to do**:
  - Review índices existentes en todas las colecciones
  - Agregar índices compuestos faltantes: orders, evidences, audit_logs, service_cases, costs
  - Crear `backend/scripts/ensure-indexes.ts`
  - Analizar slow queries con `explain()` en endpoints lentos

  **Recommended Agent Profile**: `deep` with `[mongodb-schema-design]`
  **Parallelization**: Wave 1 | **Blocks**: 3.1

  **Acceptance Criteria**:
  - [ ] Índices compuestos creados para patrones de query comunes
  - [ ] Script ensure-indexes.ts funcional (`npm run db:indexes`)
  - [ ] explain() muestra IXSCAN (no COLLSCAN) en queries principales

---

### Wave 2: Testing & Quality

- [ ] 2.1 **Playwright E2E Suite (14 Flujos Críticos)**

  **What to do**:
  - Configurar `frontend/playwright.config.ts`
  - Implementar 14 E2E tests (uno por paso del flujo operativo):
    1-14: work-request, site-visit, proposal, PO, planning, execution, evidence, technical-report, delivery-record, SES, invoice, payment, RBAC, offline
  - Crear helpers: `setup.ts` (auth + seed), `fixtures.ts` (test data)
  - Agregar script `npm run test:e2e`

  **Recommended Agent Profile**: `unspecified-high` with `[playwright-best-practices]`
  **Parallelization**: Wave 2 | **Blocked By**: 1.1

  **Acceptance Criteria**:
  - [ ] 14 E2E tests implementados
  - [ ] Tests ejecutándose en CI
  - [ ] Captura de screenshots en fallo
  - [ ] 14/14 tests pasando consistentemente

- [ ] 2.2 **Visual Regression Testing**

  **What to do**:
  - Configurar Storybook + Chromatic o Percy
  - Crear stories para componentes core y compuestos
  - Integrar en CI como job separado

  **Recommended Agent Profile**: `visual-engineering`
  **Parallelization**: Wave 2

- [ ] 2.3 **Security Audit (OWASP Top 10)**

  **What to do**:
  - Revisar y mitigar OWASP Top 10:
    - Broken Access Control, Cryptographic Failures, Injection (Zod verify)
    - Security Misconfiguration (Helmet), Vulnerable Components (npm audit)
    - Auth (password policy, MFA), CSP headers, CSRF tokens
    - Logging (audit completeness), SSRF (URL validation)
  - Crear `docs/security/SECURITY_AUDIT.md`

  **Recommended Agent Profile**: `deep` with `[nodejs-best-practices]`
  **Parallelization**: Wave 2

- [ ] 2.4 **CSP + Rate Limiting Hardening**

  **What to do**:
  - Configurar CSP estricta sin unsafe-inline/eval
  - Rate limiting: auth (5/min), general (100/min), upload (10/min)
  - Store en Redis (fallback a memoria)

  **Recommended Agent Profile**: `quick` with `[nodejs-backend-patterns]`
  **Parallelization**: Wave 2

---

### Wave 3: Performance & Scale

- [ ] 3.1 **API Performance Optimization**

  **What to do**:
  - Profiling: agregar `x-response-time` header
  - Optimizar agregaciones MongoDB: $match temprano, índices, $limit temprano
  - Paginación cursor-based en listas grandes
  - Target: P95 < 200ms endpoints GET

  **Recommended Agent Profile**: `deep` with `[nodejs-backend-patterns, mongodb-schema-design]`
  **Parallelization**: Wave 3 | **Blocked By**: 1.3, 1.4

- [ ] 3.2 **Frontend Bundle Optimization**

  **What to do**:
  - Analizar bundle con `next-bundle-analyzer`
  - Dynamic imports para Recharts, FullCalendar
  - Tree shaking, code splitting, imports individuales (no barrel)
  - Target: JS inicial < 300KB gzip

  **Recommended Agent Profile**: `visual-engineering` with `[next-best-practices]`
  **Parallelization**: Wave 3

- [ ] 3.3 **Lighthouse Audit + Fixes**

  **What to do**:
  - Ejecutar Lighthouse CI en pipeline
  - Fixes: LCP, CLS, INP, ARIA labels, color contrast, meta tags, structured data
  - Target: Score >= 95 en 4 categorías

  **Recommended Agent Profile**: `visual-engineering` with `[impeccable, accessibility]`
  **Parallelization**: Wave 3

- [ ] 3.4 **OpenTelemetry + Sentry Integration**

  **What to do**:
  - Sentry backend (`@sentry/node`) + frontend (`@sentry/nextjs`)
  - OpenTelemetry: HTTP, Express, MongoDB instrumentations
  - Dashboard de monitoreo: latencia, errores, slow queries

  **Recommended Agent Profile**: `unspecified-high` with `[nodejs-best-practices]`
  **Parallelization**: Wave 3

---

### Wave 4: Business Intelligence

- [ ] 4.1 **Custom Dashboard Builder**

  **What to do**:
  - Componente drag & drop DashboardBuilder
  - Widgets: KpiWidget, ChartWidget (bar/line/pie), TableWidget, MetricWidget, ListWidget
  - Endpoints CRUD dashboards personalizados
  - Layout persistido por usuario

  **Recommended Agent Profile**: `visual-engineering` with `[tailwind-css-patterns]`
  **Parallelization**: Wave 4

- [ ] 4.2 **Excel/CSV Export Engine**

  **What to do**:
  - ExportService: CSV (BOM), XLSX (formatos), PDF
  - Endpoint `POST /api/export` con entity + filters + format + columns
  - Botón "Exportar" en todas las tablas

  **Recommended Agent Profile**: `unspecified-high` with `[nodejs-backend-patterns]`
  **Parallelization**: Wave 4

- [ ] 4.3 **Scheduled Report Delivery**

  **What to do**:
  - Schema ReportSchedule con cron + recipients + format
  - CRUD schedules + worker node-cron
  - Email con attachment (nodemailer)

  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: Wave 4

- [ ] 4.4 **Analytics API + Metrics Service**

  **What to do**:
  - MetricsService: orderMetrics, revenueMetrics, operationalMetrics, trendMetrics
  - Endpoint `GET /api/analytics/{metric}`
  - UI: página `/analytics` con gráficos + filtros

  **Recommended Agent Profile**: `deep` with `[nodejs-backend-patterns, mongodb-schema-design]`
  **Parallelization**: Wave 4

---

### Wave 5: AI/ML Advanced

- [ ] 5.1 **Cost Prediction Engine (Statistical)**

  **What to do**:
  - CostPredictorService: promedio histórico → regresión lineal → validación cruzada
  - Factores: serviceType, estimatedHours, personnel, complexity, clientHistory
  - Endpoint `GET /api/ai/predict-cost/:orderId`
  - UI: badge en detalle de orden

  **Recommended Agent Profile**: `deep` with `[nodejs-backend-patterns, mongodb-schema-design]`
  **Parallelization**: Wave 5

- [ ] 5.2 **Evidence Anomaly Detection**

  **What to do**:
  - AnomalyDetectionService: 5 reglas (metadata, cantidad, tiempo, duplicados, categoría)
  - Endpoint `GET /api/ai/anomalies/:orderId`
  - Alertas en dashboard

  **Recommended Agent Profile**: `deep` with `[nodejs-best-practices]`
  **Parallelization**: Wave 5

- [ ] 5.3 **Price Recommendation System**

  **What to do**:
  - PriceRecommenderService: análisis histórico por tipo de servicio
  - Endpoint `POST /api/ai/recommend-price`
  - UI: panel en creación de propuesta

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 5

- [ ] 5.4 **SLA Prediction Refinement**

  **What to do**:
  - Refinar SLAPredictorService: más features, seasonality, promedios ponderados
  - Dashboard widget precisión de predicciones

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 5

---

### Wave 6: Integration Production

- [ ] 6.1 **DIAN Production Integration**

  **What to do**:
  - Resolución DIAN real + CUFE + firmado digital
  - Endpoints: envío, consulta estado, acuse
  - Dashboard facturas enviadas/aceptadas/rechazadas

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 6 | **Blocked By**: 1.2

- [ ] 6.2 **Ariba Production Connector**

  **What to do**:
  - AribaConnector producción: submitSES, getSESStatus, submitInvoice
  - Mapeo estados + throttling + reintentos
  - Dashboard estado conexión

  **Recommended Agent Profile**: `deep`
  **Parallelization**: Wave 6 | **Blocked By**: 1.2

- [ ] 6.3 **ERP Connector Monitoring Dashboard**

  **What to do**:
  - Dashboard unificado: estado, última sync, tasa error, volumen
  - Health checks + alertas

  **Recommended Agent Profile**: `visual-engineering`
  **Parallelization**: Wave 6

- [ ] 6.4 **Webhook System**

  **What to do**:
  - Schema WebhookConfig: events, url, secret, retryCount
  - Delivery con HMAC signature + 3 reintentos + DLQ
  - UI administración webhooks

  **Recommended Agent Profile**: `unspecified-high` with `[nodejs-backend-patterns]`
  **Parallelization**: Wave 6

---

### Wave 7: Mobile & Offline Advanced

- [ ] 7.1 **Offline DLQ Management UI**

  **What to do**:
  - Página `/offline-sync/dlq`: lista, detalle, acciones (retry/discard/edit)
  - Filtros + batch retry

  **Recommended Agent Profile**: `visual-engineering`
  **Parallelization**: Wave 7

- [ ] 7.2 **Bidirectional Sync Conflict Resolution**

  **What to do**:
  - 3 estrategias: Last-Write-Wins, Server-Wins, Manual
  - UI resolución: tabla campo vs campo, elegir versión
  - Version tracking (`__v`, `lastModified`)

  **Recommended Agent Profile**: `deep` with `[nodejs-backend-patterns]`
  **Parallelization**: Wave 7

- [ ] 7.3 **PWA Install Optimization + Native Features**

  **What to do**:
  - Iconos todos tamaños + screenshots + categories
  - Push notifications (VAPID) + File System Access API
  - Install prompt personalizado

  **Recommended Agent Profile**: `visual-engineering` with `[next-best-practices]`
  **Parallelization**: Wave 7

- [ ] 7.4 **Background Sync API**

  **What to do**:
  - Sync tags: pending-mutations, cache-dashboard, upload-evidences
  - Service worker sync events + IndexedDB

  **Recommended Agent Profile**: `deep` with `[nodejs-best-practices]`
  **Parallelization**: Wave 7

---

### Wave 8: Developer Experience

- [ ] 8.1 **API Documentation (Scalar)**

  **What to do**:
  - Integrar Scalar API Reference
  - Docs generadas desde schemas Zod
  - Agrupar por módulo con ejemplos request/response

  **Recommended Agent Profile**: `writing` with `[nodejs-backend-patterns]`
  **Parallelization**: Wave 8

- [ ] 8.2 **Storybook Component Library**

  **What to do**:
  - Storybook 8.x + Tailwind
  - Stories para componentes base y compuestos
  - Publicar en GitHub Pages o Vercel preview

  **Recommended Agent Profile**: `visual-engineering`
  **Parallelization**: Wave 8

- [ ] 8.3 **CHANGELOG.md + Migration Guides**

  **What to do**:
  - CHANGELOG.md (Keep a Changelog format)
  - Migration guides por versión
  - API changelog

  **Recommended Agent Profile**: `writing`
  **Parallelization**: Wave 8

- [ ] 8.4 **Developer Onboarding Scripts + Docs**

  **What to do**:
  - `scripts/setup-dev.sh`: check requisitos → install → .env → seed → start
  - CONTRIBUTING.md: branch naming, PR template, commit conventions
  - GitHub PR + ISSUE templates

  **Recommended Agent Profile**: `writing`
  **Parallelization**: Wave 8

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verificar cada Must Have y Must NOT Have. Leer archivos, correr endpoints.

- [ ] F2. **Code Quality Review** — `unspecified-high`
  `tsc --noEmit` + `npm run lint` + `npm run test`. Sin `any`/`@ts-ignore`.

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Ejecutar cada escenario QA de cada tarea. Guardar evidencia.

- [ ] F4. **Scope Fidelity Check** — `deep`
  Verificar 1:1 plan vs implementación. Sin scope creep.

---

## Commit Strategy

```
Wave 1:
  1.1  ci: setup GitHub Actions CI/CD pipeline
  1.2  docker: add production compose and deploy scripts
  1.3  feat(cache): implement Redis cache layer and middleware
  1.4  perf(db): add MongoDB indexes and optimize queries

Wave 2:
  2.1  test: add Playwright E2E suite (14 critical flows)
  2.2  test: setup visual regression testing
  2.3  security: OWASP audit and mitigation
  2.4  security: harden CSP and rate limiting

Wave 3:
  3.1  perf(api): optimize API response times (P95 < 200ms)
  3.2  perf(frontend): reduce bundle size (< 300KB gzip)
  3.3  perf: Lighthouse audit and fixes to 95+
  3.4  feat(observability): add OpenTelemetry and Sentry

Wave 4:
  4.1  feat(dashboard): custom dashboard builder
  4.2  feat(export): Excel/CSV export engine
  4.3  feat(reports): scheduled report delivery
  4.4  feat(analytics): analytics API and metrics service

Wave 5:
  5.1  feat(ai): cost prediction engine
  5.2  feat(ai): evidence anomaly detection
  5.3  feat(ai): price recommendation system
  5.4  feat(ai): SLA prediction refinement

Wave 6:
  6.1  feat(dian): production DIAN integration
  6.2  feat(ariba): production Ariba connector
  6.3  feat(erp): connector monitoring dashboard
  6.4  feat(webhooks): webhook system

Wave 7:
  7.1  feat(offline): DLQ management UI
  7.2  feat(offline): sync conflict resolution
  7.3  feat(pwa): install optimization and native features
  7.4  feat(pwa): background sync API

Wave 8:
  8.1  docs: Scalar API documentation
  8.2  docs: Storybook component library
  8.3  docs: CHANGELOG and migration guides
  8.4  docs: developer onboarding scripts
```

---

## Success Criteria

### Verification Commands

```bash
npm run typecheck          # Expected: exit 0, no errors
npm run lint               # Expected: exit 0, no warnings
npm run test               # Expected: all 1,368+ tests pass
npm run test:e2e           # Expected: 14/14 E2E flows pass
npm run build              # Expected: exit 0, production build
npm run verify             # Expected: all quality gates pass
npx react-doctor@latest    # Expected: score >= 90
npx lighthouse-ci          # Expected: >= 95 all categories
```

### Final Checklist

- [ ] CI/CD pipeline: typecheck + lint + test + build + deploy automático
- [ ] Docker compose producción: backend + frontend + MongoDB + Redis + nginx
- [ ] Redis cache layer: endpoints de dashboard < 50ms (cache HIT)
- [ ] Playwright E2E: 14/14 flujos pasando consistentemente
- [ ] Security: OWASP Top 10 auditado, CSP estricto, rate limiting completo
- [ ] Lighthouse >= 95 en performance, accesibilidad, buenas prácticas, SEO
- [ ] API P95 < 200ms para endpoints GET
- [ ] Bundle frontend < 300KB gzip
- [ ] OpenTelemetry + Sentry integrados y funcionales
- [ ] Dashboard Builder: drag & drop widgets personalizables
- [ ] Export engine: CSV/Excel/PDF desde cualquier tabla
- [ ] Reportes programados con delivery automático
- [ ] Cost prediction engine con >= 80% precisión
- [ ] Anomaly detection: 5 reglas implementadas
- [ ] DIAN producción: envío + consulta estado + acuse
- [ ] Ariba producción: submit SES + consulta estado
- [ ] Webhook system: delivery con HMAC, reintentos, DLQ
- [ ] DLQ management UI: reintentar, descartar, editar payload
- [ ] Conflict resolution: 3 estrategias implementadas
- [ ] PWA: install prompt personalizado, background sync, push notifications
- [ ] Scalar API docs: todos los módulos documentados
- [ ] Storybook: componentes core + compuestos documentados
- [ ] CHANGELOG.md + migration guides + onboarding scripts
- [ ] `npm run verify` pasa completo en CI
