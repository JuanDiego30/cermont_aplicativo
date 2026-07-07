# PROMPT MAESTRO — Spec Kit 006: Frontend Excellence CERMONT usando skills UI/UX

Actúa como un **Staff Frontend Engineer + UX Engineer + Product Designer + Accessibility Engineer + Performance Engineer** experto en Next.js 16, React 19, TypeScript estricto, App Router, TanStack Query, PWA/Serwist, Radix UI, Tailwind/design tokens, FSM/CMMS/ERP dashboards, WebAuthn/passkeys, accesibilidad WCAG, responsive mobile-first y GitHub Spec Kit.

Este prompt NO es para crear más documentación vacía. Es para **mejorar e implementar todo el apartado frontend** de CERMONT S.A.S. con cambios reales, pruebas y evidencia.

## 0. Skills que debes instalar, leer y aplicar

Ejecuta o verifica:

```bash
npx skills add pbakaus/impeccable
npx skills add emilkowalski/skill
npx skills add Leonxlnx/taste-skill
```

Después de instalarlas:

1. Localiza dónde quedaron instaladas.
2. Lee sus instrucciones reales.
3. Resume qué aporta cada skill.
4. Explica cómo se aplicará a CERMONT.
5. No asumas qué hace cada skill sin leerla.
6. Si alguna skill no instala o no se puede leer, documenta el bloqueo y continúa con `DESIGN.md`, accesibilidad, UX y buenas prácticas frontend.

Crear:

```txt
specs/006-frontend-excellence-cermont/skills-interpretation.md
```

Tabla:

| Skill | Reglas detectadas | Aplicación en CERMONT | Riesgo | Decisión |
|---|---|---|---|---|

---

## 1. Contexto del proyecto

CERMONT es una plataforma web para órdenes de trabajo, trazabilidad operativa, planeación, recursos, herramientas, vehículos, evidencias, documentos, checklists, informes, actas, SES, facturación, pagos, dashboard/KPIs, PWA/offline, RBAC y auditoría.

Problemas actuales del frontend:

- errores post-deploy en consola;
- assets 404 y errores PWA;
- warnings Radix por `DialogContent` sin `DialogTitle`;
- dashboard/KPIs poco profesionales;
- formularios simples;
- módulos de vehículos y herramientas incompletos visualmente;
- evidencias sin experiencia FSM/cámara robusta;
- checklists poco claros;
- costos sin experiencia tipo ERP;
- notificaciones poco accionables;
- login con huella/biometría no funcional en celulares;
- muchas mejoras fueron planificadas, pero no implementadas.

---

## 2. Objetivo principal

Crear y ejecutar:

```txt
specs/006-frontend-excellence-cermont/
```

para rediseñar, refactorizar e implementar el frontend CERMONT usando las skills indicadas, `DESIGN.md` y las specs anteriores.

La meta es que la app deje de sentirse como CRUD/admin básico y pase a sentirse como una plataforma profesional tipo **FSM + CMMS/GMAO + ERP operativo**.

---

## 3. Reglas anti-alucinación

1. No inventes archivos. Busca y abre los archivos reales antes de modificar.
2. No digas “implementado” sin código, pruebas y evidencia.
3. No crees solo documentación.
4. No cambies identidad visual fuera de `DESIGN.md`.
5. No introduzcas `any`.
6. No rompas contratos Zod/shared-types.
7. No rompas RBAC ni rutas protegidas.
8. No dejes mocks productivos.
9. No escondas errores de consola.
10. No agregues librerías sin justificar.
11. No copies código externo de las skills ni de repositorios; usa patrones y recomendaciones.
12. No hagas rediseños masivos sin slices.
13. No ignores mobile.
14. No ignores accesibilidad.
15. No cierres fase si fallan build, typecheck o tests.
16. No afirmes que WebAuthn/biometría funciona en móvil sin validar soporte y fallback.

---

## 4. Fuentes de verdad a leer primero

Lee y resume:

```txt
DESIGN.md
REGLAS_DESARROLLO_CERMONT.md
.specify/memory/constitution.md
specs/003-profesionalizacion-cermont/
specs/004-deploy-seguro-cermont/
specs/005-post-deploy-hotfix-and-real-implementation/
PROMPT_MEJORA_KPIS_E_IMPLEMENTACION_DESIGN.md
PROMPT_IMPLEMENTACION_MODULOS_PROFESIONALES_CERMONT.md
PROMPT_SPEC_005_HOTFIX_POST_DEPLOY_CERMONT.md
PROMPT_FOTOS_CAMARA_DOCUMENTOS_CERMONT.md
docs/DEVELOPMENT_STATUS.md
docs/API_STATUS.md
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
docs/design/
docs/product/
```

Si un archivo no existe, dilo. No lo inventes.

---

# PLAN DE IMPLEMENTACIÓN DETALLADO

Trabaja por fases. No avances si quedan errores críticos sin clasificar.

---

## FASE 0 — Baseline frontend y consola limpia

### Objetivo
Saber el estado real del frontend antes de rediseñar.

### Acciones

```bash
git status --short
npm run typecheck
npm run lint
npm test
npm run build
npm run verify
npx react-doctor@latest
```

Si existe Playwright:

```bash
npm run test:e2e
```

Reproducir producción o local:

```bash
curl -I https://cermontsas.shop/favicon.png
curl -I https://cermontsas.shop/icons/icon-192.png
curl -I https://cermontsas.shop/icons/icon-512.png
curl -I https://cermontsas.shop/login
curl -fsS https://cermontsas.shop/api/health
```

Crear:

```txt
specs/006-frontend-excellence-cermont/frontend-baseline.md
specs/006-frontend-excellence-cermont/frontend-error-matrix.md
```

Tabla:

| Error/UI issue | Ruta | Severidad | Causa raíz | Archivo probable | Fix | Test | Estado |
|---|---|---|---|---|---|---|---|

### Criterio de aceptación
- todos los errores de consola quedan clasificados;
- assets 404 y warnings Radix son bloqueantes P0;
- no iniciar rediseño visual si el frontend está roto.

---

## FASE 1 — Design system real y tokens

### Objetivo
Centralizar el diseño para que toda la app use un mismo lenguaje visual.

### Revisar

```txt
frontend/src/styles/
frontend/src/app/globals.css
frontend/tailwind.config.*
frontend/src/components/ui/
frontend/src/modules/
DESIGN.md
```

### Crear o refactorizar componentes base

```txt
SectionHeader
PageHeader
StatusBadge
MetricDelta
KpiActionCard
EmptyStateCard
BlockingAlert
ReadinessCard
DocumentChecklist
PhotoGallery
AttachmentDropzone
AuditTimeline
FormSection
FormActions
DataToolbar
ResponsiveTabs
```

Reglas:

- usar tokens de `DESIGN.md`;
- light/dark real;
- no colores hardcodeados innecesarios;
- iconos consistentes;
- cards limpias;
- spacing consistente;
- botones claros;
- estados hover/focus/disabled;
- mobile-first.

Crear:

```txt
specs/006-frontend-excellence-cermont/design-system-gap.md
docs/design/FRONTEND_DESIGN_SYSTEM_IMPLEMENTATION.md
```

---

## FASE 2 — Accesibilidad y errores visuales P0

### Corregir

1. `DialogContent` sin `DialogTitle`.
2. Inputs sin label.
3. Botones sin accessible name.
4. Estados de error no anunciados.
5. Focus invisible.
6. Modales sin descripción.
7. Tablas sin headers correctos.
8. Icon-only buttons sin `aria-label`.
9. Contraste insuficiente.
10. Navegación móvil deficiente.

Buscar:

```bash
grep -R "DialogContent" frontend/src -n
grep -R "button" frontend/src/components frontend/src/modules -n
grep -R "aria-label" frontend/src -n
```

Implementar:

- `DialogTitle` visible u oculto con `VisuallyHidden`;
- `DialogDescription` cuando aplique;
- `aria-label`;
- focus ring;
- error text asociado con `aria-describedby`;
- `role="alert"` para errores importantes.

---

## FASE 3 — Login profesional, sesión y biometría móvil

### Objetivo
Login confiable, bonito, mobile-first y con biometría/passkeys real o fallback.

### Corregir

- no llamar notificaciones antes de sesión;
- no spam 401;
- manejo correcto de refresh;
- mensajes de error claros;
- diseño limpio según `DESIGN.md`;
- loading states;
- recuperación de contraseña.

### Biometría móvil

La web no lee huella directamente. Debe usar:

```txt
WebAuthn / Passkeys / Platform Authenticator
```

Buscar:

```bash
grep -R "fingerprint" frontend/src backend/src packages -n
grep -R "biometric" frontend/src backend/src packages -n
grep -R "webauthn" frontend/src backend/src packages -n
grep -R "navigator.credentials" frontend/src -n
```

Frontend:

- botón “Ingresar con passkey/huella”;
- detectar soporte:
  ```ts
  PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  ```
- fallback a login normal;
- mensajes para Android/iOS/Desktop;
- UI para activar passkey en perfil.

Backend:

- si existen endpoints WebAuthn, consumirlos;
- si no existen, implementar con dependencia aprobada o dejar bloqueo técnico claro.

---

## FASE 4 — Dashboard/KPIs premium

### Objetivo
Convertir el dashboard en un centro de decisión.

### Implementar

- `DashboardHero`;
- `KpiActionCard`;
- filtros globales;
- KPIs accionables;
- flujo de 14 pasos mejorado;
- alertas críticas;
- actividad reciente;
- órdenes recientes;
- empty states;
- skeleton loading;
- error state;
- offline state.

KPIs:

- órdenes activas;
- bloqueadas;
- en ejecución;
- listas para facturar;
- evidencias pendientes;
- checklists incompletos;
- documentos vencidos;
- vehículos bloqueados;
- herramientas no disponibles;
- margen/costos si existe backend;
- SLA en riesgo.

Reglas:

- consumir backend real;
- no mocks productivos;
- si falta dato, mostrar empty state;
- cards con links al módulo;
- no hardcodear números falsos.

---

## FASE 5 — Vehículos/flota UX profesional

### UI requerida

- hero con foto principal;
- estado readiness;
- tabs: General, Fotos, Documentos, Vencimientos, Mantenimiento, Asignaciones, Auditoría;
- galería;
- checklist de documentos;
- alertas por vencimiento;
- subir PDF;
- subir imagen;
- tomar foto si módulo lo permite;
- mobile-friendly.

Componentes:

```txt
VehicleProfileHeader
VehicleReadinessCard
VehiclePhotoGallery
VehicleDocumentChecklist
VehicleExpiryAlerts
VehicleAssignmentTimeline
```

---

## FASE 6 — Herramientas/activos UX profesional

### UI requerida

- perfil de herramienta;
- asset tag visible;
- foto principal;
- estado disponibilidad;
- tabs: General, Fotos, Documentos/PDF, Checklists, Calibración/Certificados, Historial, Auditoría;
- cargar PDF;
- cargar fotos;
- checklist preuso/devolución;
- alerta de certificado vencido.

Componentes:

```txt
ToolAssetProfileHeader
ToolPhotoGallery
ToolDocumentList
ToolChecklistPanel
ToolAssignmentHistory
CertificateExpiryAlert
```

---

## FASE 7 — Evidencias FSM y documentos

### UI requerida

- galería por orden;
- filtros por fase: before, during, after, correction, hse;
- cámara;
- subir imagen;
- subir PDF/documento;
- preview;
- aprobación/rechazo;
- motivo de rechazo;
- badge de estado;
- auditoría de descarga;
- bloqueo si usada en informe/acta.

Componentes:

```txt
EvidenceGallery
EvidenceCaptureButton
EvidenceReviewPanel
EvidenceStatusBadge
DocumentPreviewDialog
AttachmentDropzone
```

---

## FASE 8 — Checklists profesionales

### UI requerida

- plantillas versionadas;
- secciones;
- progreso;
- ítems obligatorios;
- ítems bloqueantes;
- foto requerida;
- comentario requerido;
- firma opcional;
- integración con orden/herramienta/vehículo;
- mobile-first.

Componentes:

```txt
ChecklistTemplateEditor
ChecklistExecutionForm
ChecklistProgressCard
BlockingChecklistAlert
ChecklistEvidenceRequirement
```

---

## FASE 9 — Costos tipo ERP visual

### UI requerida

- resumen financiero;
- estimado vs real;
- mano de obra;
- materiales;
- herramientas;
- vehículos;
- terceros;
- imprevistos;
- margen;
- desviación;
- alerta de sobrecosto;
- conexión con factura/pago.

Componentes:

```txt
CostSummaryCard
CostBreakdownTable
MarginIndicator
BudgetDeviationChart
CostAlertBanner
```

---

## FASE 10 — Notificaciones y feedback

### UI requerida

- unread count;
- lista;
- estados;
- filtros;
- mark as read;
- acciones directas;
- eventos: evidencia rechazada, documento vencido, vehículo bloqueado, herramienta vencida, checklist bloqueado, orden asignada, factura pendiente.

Criterio:

- no llama endpoint sin sesión;
- no spam 401;
- notificación lleva a acción.

---

## FASE 11 — QA visual, performance y responsive

Acciones:

1. Revisar mobile: login, dashboard, vehículos, herramientas, evidencias, checklists.
2. Revisar Lighthouse/Core Web Vitals si aplica.
3. Reducir layout shift.
4. Optimizar imágenes.
5. Agregar skeletons.
6. Revisar error boundaries.

Ejecutar:

```bash
npm run build
npx react-doctor@latest
```

Si hay Playwright:

```bash
npm run test:e2e
```

---

## FASE 12 — Verificación final

Ejecutar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm run verify
```

Crear:

```txt
specs/006-frontend-excellence-cermont/frontend-final-report.md
docs/design/FRONTEND_EXCELLENCE_REPORT.md
```

---

# TASKS SPEC KIT 006

Si Spec 005 terminó en T182, continuar:

```md
# Tasks — Spec 006 Frontend Excellence

## P0 — Skills y baseline
- [ ] T183 Instalar/leer skills.
- [ ] T184 Crear spec 006.
- [ ] T185 Crear skills-interpretation.md.
- [ ] T186 Ejecutar baseline frontend.
- [ ] T187 Crear frontend-error-matrix.

## P0 — Errores visuales y accesibilidad
- [ ] T188 Corregir assets/manifest visibles en frontend si siguen fallando.
- [ ] T189 Corregir DialogContent sin DialogTitle.
- [ ] T190 Corregir labels, aria y focus states.
- [ ] T191 Corregir login notifications 401 spam.
- [ ] T192 Corregir UI de errores 400/500.

## P1 — Design system
- [ ] T193 Crear/refactor SectionHeader.
- [ ] T194 Crear/refactor StatusBadge.
- [ ] T195 Crear/refactor EmptyStateCard.
- [ ] T196 Crear/refactor KpiActionCard.
- [ ] T197 Crear/refactor ReadinessCard.
- [ ] T198 Crear/refactor PhotoGallery.
- [ ] T199 Crear/refactor DocumentChecklist.
- [ ] T200 Crear/refactor AuditTimeline.
- [ ] T201 Crear/refactor FormSection.

## P1 — Pantallas críticas
- [ ] T202 Rediseñar login.
- [ ] T203 Implementar passkey/biometría o fallback real.
- [ ] T204 Rediseñar dashboard.
- [ ] T205 Rediseñar vehículos/flota.
- [ ] T206 Rediseñar herramientas/activos.
- [ ] T207 Rediseñar evidencias/documentos.
- [ ] T208 Rediseñar checklists.
- [ ] T209 Rediseñar costos.
- [ ] T210 Rediseñar notificaciones.

## P2 — QA
- [ ] T211 Agregar tests de componentes.
- [ ] T212 Agregar tests de accesibilidad.
- [ ] T213 Agregar E2E mobile.
- [ ] T214 Ejecutar React Doctor.
- [ ] T215 Ejecutar build final.
- [ ] T216 Crear reporte final.
```

# FORMATO DE RESPUESTA OBLIGATORIO

Al terminar cada fase:

```txt
# Fase X — Resultado

## Archivos revisados
## Cambios implementados
## Componentes creados/refactorizados
## Pantallas modificadas
## Tests agregados
## Comandos ejecutados
## Resultado
## Errores pendientes
## Siguiente fase
```

# DEFINITION OF DONE

La spec 006 solo queda cerrada si:

1. las tres skills fueron instaladas/leídas o bloqueadas con evidencia;
2. se creó matriz de errores frontend;
3. no hay warnings Radix críticos;
4. login no genera spam 401;
5. dashboard se ve profesional;
6. vehículos tienen UI profesional para fotos/documentos/readiness;
7. herramientas tienen UI profesional para fotos/PDF/checklists;
8. evidencias tienen UI FSM/cámara/documentos;
9. checklists son claros y bloqueantes;
10. costos se ven tipo ERP;
11. componentes base fueron reutilizados;
12. light/dark funciona;
13. mobile funciona;
14. accesibilidad básica pasa;
15. build pasa;
16. tests pasan;
17. no se introdujo `any`;
18. no se rompió RBAC;
19. no se dejaron mocks productivos;
20. documentación viva actualizada.

Empieza por instalar/leer las skills y ejecutar FASE 0. No rediseñes pantallas antes de corregir P0.
