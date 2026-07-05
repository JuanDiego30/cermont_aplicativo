# PROMPT MAESTRO — Spec Kit 011: Implementación profesional controlada CERMONT

Actúa como un **Principal Software Engineer + Spec Kit Lead + Staff Full Stack Engineer + Product Architect FSM/CMMS/ERP + QA Lead + Release Engineer**.

Este prompt parte de la **Spec 010 — Auditoría, benchmark y orquestación CERMONT**. La investigación ya terminó; ahora se debe pasar a implementación profesional, pero sin improvisar ni romper el repositorio.

Estado base reportado por Spec 010:

```txt
typecheck: PASS
tests: PASS, 1091 tests
contracts: PASS
lint: FAIL
quality:strict: FAIL — 29 violaciones
verify: FAIL
React Doctor: 82/100 FAIL
build: compila pero Turbo no termina
stash histórico: stash@{0} con 247 archivos
score madurez: 2.8/6
deploy: NO DEPLOY
```

Este prompt SÍ es para implementar, pero por **waves controladas**. No hagas cambios masivos. No hagas deploy. No cierres una tarea sin código, tests y evidencia.

---

## 1. Objetivo principal

Crear y ejecutar:

```txt
specs/011-implementacion-profesional-controlada-cermont/
```

para convertir el roadmap de Spec 010 en desarrollo real:

1. Proteger WIP/stash histórico.
2. Resolver ADR-011, ADR-012 y ADR-014.
3. Corregir lint, `quality:strict`, verify, React Doctor y build/Turbo.
4. Consolidar una única definición del flujo de 14 pasos.
5. Implementar lógica central del flujo CERMONT.
6. Desarrollar módulos profesionales pendientes.
7. Mejorar navegación y frontend.
8. Completar privacidad, consentimiento y WebAuthn/passkeys.
9. Optimizar backend/frontend/PWA.
10. Agregar tests y documentación viva.
11. Dejar el repo listo para una futura Spec 012 de deploy.

---

## 2. Reglas absolutas

1. No implementar nada antes de proteger WIP/stash.
2. No aplicar el stash completo a ciegas.
3. No modificar lógica persistida antes de resolver ADR-011.
4. No modificar diseño global antes de resolver ADR-012.
5. No implementar consentimiento parcial antes de resolver ADR-014.
6. No decir “implementado” sin código, tests y comandos.
7. No introducir `any`.
8. No aumentar violaciones de `quality:strict`.
9. No romper Zod/shared-types.
10. No romper API envelope.
11. No romper RBAC.
12. No copiar código de repositorios externos.
13. No usar mocks productivos.
14. No dejar botones sin acción.
15. No dejar UI desconectada de backend.
16. No recomendar dependencias nuevas sin justificar licencia, tamaño y seguridad.
17. No hacer deploy desde esta spec.
18. No avanzar de wave si los criterios de aceptación no se cumplen.
19. No ignorar errores de consola o de build.
20. No cerrar la spec sin reporte final.

---

## 3. Fuentes obligatorias

Leer antes de tocar código:

```txt
specs/010-benchmark-orquestacion-refactor-cermont/final-orchestration-report.md
specs/010-benchmark-orquestacion-refactor-cermont/implementation-roadmap.md
specs/010-benchmark-orquestacion-refactor-cermont/implementation-slices.md
specs/010-benchmark-orquestacion-refactor-cermont/architecture-decision-records.md
specs/010-benchmark-orquestacion-refactor-cermont/risk-register.md
specs/010-benchmark-orquestacion-refactor-cermont/cermont-gap-vs-benchmark.md
specs/010-benchmark-orquestacion-refactor-cermont/logic-refactor-map.md
specs/010-benchmark-orquestacion-refactor-cermont/module-refactor-map.md
specs/010-benchmark-orquestacion-refactor-cermont/pattern-extraction-matrix.md
.sisyphus/plans/009-implementacion-logica-optimizacion.md
.sisyphus/plans/007-auditoria-roadmap.md
.sisyphus/plans/003-implementacion-real-cermont.md
docs/domain/CERMONT_BUSINESS_FLOW_MAP.md
docs/audits/IMPLEMENTATION_REALITY_AUDIT.md
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
docs/API_STATUS.md
docs/DEVELOPMENT_STATUS.md
docs/CHANGELOG.md
REGLAS_DESARROLLO_CERMONT.md
DESIGN.md
.specify/memory/constitution.md
```

Si falta un archivo, registrarlo en:

```txt
specs/011-implementacion-profesional-controlada-cermont/missing-inputs.md
```

---

## 4. Estructura Spec Kit 011

Si el CLI existe, usar:

```txt
/speckit.specify
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.implement
/speckit.analyze
```

Si no existe, crear manualmente:

```txt
specs/011-implementacion-profesional-controlada-cermont/
  spec.md
  plan.md
  tasks.md
  implementation-log.md
  missing-inputs.md
  wip-recovery-report.md
  adr-decision-report.md
  quality-gate-report.md
  flow-14-canonical-report.md
  visual-alignment-report.md
  consent-gateway-report.md
  wave-p0-stabilization-report.md
  wave-p1-core-flow-report.md
  wave-p2-professional-modules-report.md
  wave-p3-frontend-navigation-report.md
  wave-p4-optimization-report.md
  wave-p5-tests-quality-report.md
  final-implementation-report.md
  contracts/
    adr-011-flow-contract.md
    adr-012-visual-contract.md
    adr-014-consent-contract.md
    vertical-slice-contract.md
    module-acceptance-contract.md
    test-gate-contract.md
```

---

# WAVE 0 — Repo safety, stash y baseline

## Objetivo
Proteger el trabajo existente antes de tocar código.

## Comandos

```bash
git status --short
git branch --show-current
git stash list
git stash show --stat stash@{0}
git diff --stat
git diff --name-only
git ls-files --others --exclude-standard
```

Crear:

```txt
specs/011-implementacion-profesional-controlada-cermont/wip-recovery-report.md
```

Clasificar WIP/stash:

| Fuente | Archivo | Estado | Riesgo | Pertenece a | Acción |
|---|---|---|---|---|---|

Categorías:

```txt
hotfix-spec-005
frontend-excellence-spec-006
roadmap-spec-008
logic-plan-spec-009
benchmark-spec-010
generated/cache
unknown
```

## Regla de stash

No ejecutar `git stash pop` directamente. Inspeccionar primero:

```bash
git stash show --name-only stash@{0}
git stash show --patch stash@{0} -- <archivo>
```

Recuperar por archivo o crear rama aislada:

```bash
git stash branch recovery/spec-005-stash stash@{0}
```

## Baseline

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
npx react-doctor@latest
```

Registrar resultados en `quality-gate-report.md`.

Criterio: no pasar a Wave 1 sin WIP clasificado y protegido.

---

# WAVE 1 — Resolver ADRs bloqueantes

## ADR-011 — Flujo canónico de 14 pasos

Problema: existen tres definiciones incompatibles del flujo de 14 pasos.

Acciones:

1. Extraer definiciones de:
   - Product Blueprint / AGENTS si existe;
   - `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`;
   - código actual de state machine.
2. Crear comparación en:

```txt
flow-14-canonical-report.md
```

Tabla:

| Código | Fuente A | Fuente B | Código actual | Entidad | Estado | Conflicto | Decisión |
|---|---|---|---|---|---|---|---|

3. Proponer flujo canónico.
4. Crear characterization tests antes de cambiar lógica.
5. No migrar datos persistidos sin plan.

Decisión recomendada:

```txt
Fuente canónica: LTG + docs/domain/CERMONT_BUSINESS_FLOW_MAP.md.
El código debe adaptarse a esa fuente.
El flujo debe tener exactamente 14 pasos, códigos estables y compatibilidad hacia atrás.
```

## ADR-012 — Alineación visual con DESIGN.md

Acciones:

1. Detectar tokens inexistentes.
2. Detectar colores hardcodeados.
3. Detectar componentes locales duplicados.
4. Detectar overlays inaccesibles.
5. Crear `visual-alignment-report.md`.

Decisión recomendada:

```txt
DESIGN.md es SSOT visual.
Todo componente nuevo debe usar tokens existentes o proponer token antes de usarlo.
```

## ADR-014 — Consent gateway

Acciones:

1. Revisar backend privacy/consents.
2. Revisar frontend dashboard layout.
3. Definir rutas bloqueadas/excluidas.
4. Definir versión de política.
5. Definir logout no bloqueado.
6. Crear `consent-gateway-report.md`.

Decisión recomendada:

```txt
ConsentGate en dashboard layout.
No bloquea login, logout, privacy policy, privacy notice ni soporte.
Registra consentimiento versionado.
No afirma cumplimiento legal definitivo.
```

Criterio: no pasar a Wave 2 sin decisiones documentadas.

---

# WAVE 2 — Gates rojos y calidad P0

## Objetivo
Dejar la base técnica en verde antes de desarrollo funcional.

Tareas:

1. Corregir lint.
2. Corregir 29 violaciones `quality:strict`.
3. Corregir `verify`.
4. Diagnosticar build/Turbo que no termina.
5. Mejorar React Doctor a 90+ o documentar bloqueo.
6. Corregir rutas sin validación/RBAC.
7. Eliminar mocks productivos.

Comandos:

```bash
npm run lint
npm run quality:strict
npm run verify
npm run build
npx react-doctor@latest
npm run typecheck
npm test
npm run contracts:check
```

Criterio: no pasar a módulos profesionales si lint/quality/verify siguen rojos, salvo bloqueo documentado y aprobado.

---

# WAVE 3 — Lógica central del flujo 14 pasos

Implementar:

1. State machine canónica.
2. Workflow gate service alineado.
3. Requisitos por paso.
4. Documentos requeridos por paso.
5. Evidencias requeridas por paso.
6. Checklists requeridos por paso.
7. RBAC por transición.
8. Timeline de orden.
9. Notificación por bloqueo.
10. UI visual del flujo.

Archivos probables:

```txt
packages/domain/src/workflow/service-case-state-machine.ts
backend/src/services/cermont-workflow-gate.service.ts
backend/src/modules/service-case/
backend/src/modules/work-requests/
backend/src/modules/notifications/
frontend/src/modules/workflow/
frontend/src/modules/orders/
frontend/src/app/(dashboard)/orders/[id]/page.tsx
frontend/src/modules/dashboard/
```

Tests:

- characterization tests;
- transition tests;
- blocked transition tests;
- RBAC tests;
- frontend flow step tests.

Criterio: cada paso indica completo, bloqueado o pendiente y explica por qué.

---

# WAVE 4 — Módulos profesionales prioritarios

Cada módulo debe implementarse como slice vertical:

```txt
Zod → backend service/controller/route → frontend service/hook/UI → tests → docs
```

## Fleet
- galería;
- cámara;
- documentos;
- vencimientos;
- readiness score;
- alertas;
- bloqueo por documento vencido;
- historial.

## Tools / Assets
- fotos;
- PDFs/manual/certificado;
- checkin/checkout;
- calibración;
- bloqueo por vencimiento;
- historial.

## Evidences
- formulario FSM;
- cámara;
- fases;
- PDF;
- aprobación/rechazo;
- auditoría de descarga;
- galería por orden.

## Checklists
- plantillas versionadas;
- ítems bloqueantes;
- foto requerida;
- comentario requerido;
- integración con vehículo/herramienta/orden.

## Costs
- estimated vs actual;
- execution cost form;
- margen;
- desviación;
- chart;
- alerta de sobrecosto.

## Maintenance
- schedule CRUD;
- logs;
- SLA;
- historial por asset.

---

# WAVE 5 — Frontend Excellence y navegación

Implementar:

1. Dashboard con action cards.
2. Flujo visual de 14 pasos.
3. Sidebar y navegación móvil coherentes.
4. Breadcrumbs.
5. Deep links.
6. Empty/loading/error/forbidden/offline states.
7. Botones conectados.
8. Badges de estado y alertas.
9. Accesibilidad Radix.
10. Consistencia con `DESIGN.md`.

Archivos probables:

```txt
frontend/src/modules/core/navigation.ts
frontend/src/modules/core/ui/layout/Sidebar.tsx
frontend/src/modules/core/ui/layout/MobileNavigation.tsx
frontend/src/modules/dashboard/
frontend/src/components/ui/
frontend/src/app/(dashboard)/layout.tsx
```

Criterio: no hay rutas críticas ocultas ni botones muertos.

---

# WAVE 6 — Privacy, consent y WebAuthn

## Privacy/Consent

Implementar:

- ConsentGate;
- privacy requests frontend;
- enlaces legales en perfil/nav;
- versión de política;
- revocatoria;
- estado de solicitudes.

## WebAuthn

Completar:

- login con passkey;
- activar passkey en perfil;
- administrar dispositivos;
- fallback móvil;
- mensajes claros;
- tests.

Archivos probables:

```txt
frontend/src/modules/privacy/
frontend/src/app/(dashboard)/profile/privacy/page.tsx
frontend/src/modules/auth/ui/PasskeyButton.tsx
frontend/src/modules/auth/ui/PasskeyManager.tsx
frontend/src/app/login/page.tsx
frontend/src/app/(dashboard)/profile/security/page.tsx
backend/src/modules/auth/webauthn*
```

Criterio: no se promete huella directa; se usa WebAuthn/passkeys.

---

# WAVE 7 — Optimización

## Backend
- índices Mongoose;
- paginación estándar;
- limits;
- lean queries donde aplique;
- filtros/sort controlados;
- reducción de payload.

## Frontend
- TanStack Query `enabled`;
- invalidation correcta;
- lazy loading;
- image optimization;
- code splitting;
- evitar refetch innecesario;
- skeletons;
- error boundaries.

## PWA
- cache strategy;
- offline fallback;
- outbox;
- retry;
- upload queue;
- deduplicación.

Criterio: optimización medible o justificada.

---

# WAVE 8 — Tests, CI y verificación

Implementar:

1. Contract tests.
2. Backend integration tests.
3. Frontend component tests.
4. Playwright E2E:
   - flujo 14 pasos;
   - fleet;
   - tools/assets;
   - evidences;
   - costs;
   - maintenance;
   - consent;
   - WebAuthn fallback.
5. Mobile E2E.
6. Accessibility checks.
7. Smoke tests production-like.
8. CI gates.

Comandos finales:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
npx react-doctor@latest
npm run test:e2e
```

---

# WAVE 9 — Cierre y preparación para deploy

Crear/actualizar:

```txt
final-implementation-report.md
docs/DEVELOPMENT_STATUS.md
docs/API_STATUS.md
docs/TECHNICAL_DEBT.md
docs/KNOWN_ISSUES.md
docs/CHANGELOG.md
docs/audits/SPEC_011_IMPLEMENTATION_REPORT.md
```

Veredicto permitido:

```txt
READY_FOR_DEPLOY_SPEC_012
READY_WITH_WARNINGS
BLOCKED
```

No hacer deploy en Spec 011.

---

# TASKS SPEC KIT 011

Si Spec 010 terminó en T349, continuar desde T350:

```md
# Tasks — Spec 011 Implementación Profesional Controlada

## P0 — Repo safety y ADRs
- [ ] T350 Crear spec 011.
- [ ] T351 Clasificar WIP y stash histórico.
- [ ] T352 Proteger WIP con rama/stash/commit temporal.
- [ ] T353 Resolver ADR-011 flujo de 14 pasos.
- [ ] T354 Resolver ADR-012 alineación visual.
- [ ] T355 Resolver ADR-014 ConsentGate.
- [ ] T356 Ejecutar baseline completo.

## P0 — Gates rojos
- [ ] T357 Corregir lint.
- [ ] T358 Corregir 29 violaciones quality:strict.
- [ ] T359 Corregir verify.
- [ ] T360 Diagnosticar build/Turbo.
- [ ] T361 Mejorar React Doctor.
- [ ] T362 Corregir rutas sin validación/RBAC.

## P1 — Flujo central
- [ ] T363 Consolidar state machine canónica.
- [ ] T364 Crear characterization tests del flujo actual.
- [ ] T365 Alinear workflow gate service.
- [ ] T366 Crear requisitos por paso.
- [ ] T367 Implementar documentos/evidencias/checklists por paso.
- [ ] T368 Implementar timeline de orden.
- [ ] T369 Implementar UI visual del flujo.
- [ ] T370 Implementar notificaciones por bloqueo.

## P2 — Módulos profesionales
- [ ] T371 Completar Fleet gallery/camera/readiness.
- [ ] T372 Completar Fleet documents/expiry alerts.
- [ ] T373 Completar Tools/Assets photos/documents.
- [ ] T374 Implementar Tools checkin/checkout.
- [ ] T375 Completar Evidences FSM gallery/camera/PDF.
- [ ] T376 Implementar Evidence approval/download audit.
- [ ] T377 Completar Checklists blocking items/required photo.
- [ ] T378 Completar Costs ERP estimated vs actual.
- [ ] T379 Implementar Maintenance schedules/logs/SLA.

## P2 — Frontend y navegación
- [ ] T380 Rediseñar dashboard con action cards.
- [ ] T381 Implementar navegación por flujo 14 pasos.
- [ ] T382 Mejorar sidebar/mobile navigation.
- [ ] T383 Agregar breadcrumbs/deep links.
- [ ] T384 Corregir buttons/actions sin lógica.
- [ ] T385 Alinear UI con DESIGN.md.

## P3 — Privacy y auth
- [ ] T386 Implementar ConsentGate frontend.
- [ ] T387 Implementar Privacy Requests frontend.
- [ ] T388 Completar WebAuthn login.
- [ ] T389 Completar Passkey Manager en perfil.
- [ ] T390 Agregar tests de privacy/auth.

## P3 — Optimización
- [ ] T391 Agregar índices Mongo.
- [ ] T392 Optimizar queries/paginación.
- [ ] T393 Optimizar TanStack Query enabled/invalidation.
- [ ] T394 Optimizar imágenes/lazy/code splitting.
- [ ] T395 Revisar PWA outbox/cache.

## P4 — Tests y cierre
- [ ] T396 Crear tests backend integration.
- [ ] T397 Crear tests frontend component.
- [ ] T398 Crear Playwright E2E críticos.
- [ ] T399 Crear accessibility checks.
- [ ] T400 Ejecutar full verification pipeline.
- [ ] T401 Actualizar documentación viva.
- [ ] T402 Crear reporte final Spec 011.
```

---

# FORMATO DE RESPUESTA POR WAVE

```txt
# Wave X — Resultado

## 1. Objetivo
## 2. Decisiones tomadas
## 3. Archivos revisados
## 4. Archivos modificados
## 5. Funcionalidad implementada
## 6. Tests agregados
## 7. Comandos ejecutados
## 8. Resultado de gates
## 9. Riesgos abiertos
## 10. Próxima wave
```

---

# DEFINITION OF DONE

Spec 011 solo queda cerrada si:

1. WIP/stash fue protegido y clasificado.
2. ADR-011 resuelto.
3. ADR-012 resuelto.
4. ADR-014 resuelto.
5. Lint pasa o queda bloqueo aceptado.
6. `quality:strict` pasa o queda bloqueo aceptado.
7. `verify` pasa.
8. Build termina.
9. React Doctor mejora o queda bloqueo documentado.
10. Flujo de 14 pasos tiene definición canónica.
11. Workflow gate service alineado.
12. Módulos profesionales P2 implementados en slices.
13. Frontend no tiene botones muertos críticos.
14. ConsentGate funciona.
15. Privacy Requests frontend existe.
16. WebAuthn login/profile funcional o bloqueo real documentado.
17. Dashboard muestra acciones reales.
18. Navegación refleja el flujo operativo.
19. Tests nuevos agregados.
20. Documentación viva actualizada.
21. No se introdujo `any`.
22. No se copiaron repos externos.
23. No hay mocks productivos nuevos.
24. No hay deploy desde esta spec.
25. Reporte final creado.

Empieza por Wave 0. No avances a lógica ni UI hasta proteger WIP, resolver ADRs y estabilizar gates.
