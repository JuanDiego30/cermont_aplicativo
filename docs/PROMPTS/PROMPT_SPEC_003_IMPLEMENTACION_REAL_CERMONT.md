# PROMPT MAESTRO — Spec 003 Implementación Real CERMONT: refactor, mejoras funcionales, seguridad, legalidad y autoría

Actúa como un **Staff Software Architect + Senior Full Stack Engineer + Security Engineer + Compliance Engineer + UX/Product Engineer**.

Este prompt NO es para crear más documentación solamente.  
Este prompt es para **implementar mejoras reales en el aplicativo CERMONT**, usando la spec ya creada `003-profesionalizacion-cermont` como base.

El agente anterior hizo correctamente la parte documental inicial:

- creó `specs/003-profesionalizacion-cermont/spec.md`;
- creó `quickstart.md`;
- creó `research.md`;
- creó `benchmark-matrix.md`;
- creó `module-gap-analysis.md`;
- creó `plan.md`;
- creó `tasks.md`;
- actualizó `.specify/memory/constitution.md`;
- creó documentos de benchmark y matriz de madurez;
- ejecutó gates y todo pasó;
- NO implementó cambios funcionales;
- NO refactorizó módulos;
- NO mejoró realmente el aplicativo.

Ahora debes ejecutar una **fase de implementación real**, con cambios de código, pruebas y documentación viva.

---

## 0. Contexto confirmado

El proyecto CERMONT tiene:

- monorepo npm workspaces;
- backend Express 5.2.1;
- frontend Next.js 16 + React 19 + Turbopack;
- MongoDB + Mongoose 9.x;
- Zod 4.x;
- contract-first;
- shared-types;
- apiClient único basado en fetch;
- TanStack Query;
- RBAC en `packages/domain`;
- proxy.ts como perímetro frontend;
- PWA / Serwist;
- 52+ módulos backend;
- 41+ módulos frontend;
- 389+ endpoints;
- 1014 tests pasando;
- contracts guard pasando;
- `quality:strict` pasa con deuda baseline;
- 2920 weak-token findings dentro de baseline;
- 2 warnings preexistentes en `ServiceCase.ts`;
- React Doctor score 87/100 con 12 warnings;
- `.gitignore` ignora `*.md`, por eso los artifacts Markdown locales requieren `git add -f`.

La spec 003 existe, pero todavía no se ejecutó funcionalmente.

---

## 1. Objetivo principal

Implementar mejoras reales y verificables en el aplicativo CERMONT con base en la spec 003, evitando alucinaciones, cambios superficiales o documentación vacía.

Debes entregar cambios en código que mejoren:

1. funcionalidad profesional;
2. seguridad;
3. cumplimiento legal;
4. privacidad;
5. autoría y atribución;
6. UX/producto;
7. calidad;
8. tests;
9. documentación viva.

---

## 2. Reglas anti-alucinación obligatorias

1. **No inventes archivos.** Antes de modificar, busca y abre el archivo real.
2. **No inventes módulos.** Si un módulo no existe, crea un plan y luego créalo con estructura consistente.
3. **No afirmes que implementaste algo sin test o evidencia.**
4. **No cierres una tarea solo por crear documentación.**
5. **No repitas research ya creado salvo que esté incompleto.**
6. **No copies código de repositorios externos.**
7. **No hagas cambios masivos sin dividir en slices.**
8. **No introduzcas `any`.**
9. **No introduzcas `unknown`, `undefined` o `null` nuevos si violan `quality:strict`.**
10. **No rompas contratos Zod/shared-types.**
11. **No cambies API envelopes sin migración y tests.**
12. **No rompas RBAC.**
13. **No dejes mocks productivos.**
14. **No afirmes cumplimiento legal definitivo. Todo documento legal debe decir: “BORRADOR TÉCNICO — requiere revisión jurídica antes de uso”.**
15. **No afirmes titularidad patrimonial exclusiva de Juan Diego sin revisar contratos. Sí puedes implementar atribución técnica/moral razonable.**
16. **No uses colores o UI fuera de `DESIGN.md`.**
17. **No modifiques WIP no relacionado sin documentarlo.**
18. **No termines solo con “plan creado”. Debes implementar al menos los slices P0 y P1 definidos abajo.**

---

## 3. Fuente de verdad que debes leer primero

Antes de tocar código, abre y resume en tu respuesta inicial:

```txt
.specify/memory/constitution.md
specs/003-profesionalizacion-cermont/spec.md
specs/003-profesionalizacion-cermont/plan.md
specs/003-profesionalizacion-cermont/tasks.md
specs/003-profesionalizacion-cermont/module-gap-analysis.md
specs/003-profesionalizacion-cermont/benchmark-matrix.md
docs/product/MODULE_MATURITY_MATRIX.md
docs/research/PROFESSIONAL_SOFTWARE_BENCHMARK.md
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
docs/DEVELOPMENT_STATUS.md
docs/API_STATUS.md
DESIGN.md
```

Si un archivo no existe, dilo explícitamente y no lo inventes como si existiera.

---

## 4. Flujo de trabajo obligatorio con Spec Kit

Usa la spec ya creada. No crear otra spec nueva salvo que falte.

Trabaja sobre:

```txt
specs/003-profesionalizacion-cermont/
```

Si necesitas agregar detalle, crea estos archivos adicionales:

```txt
specs/003-profesionalizacion-cermont/implementation-plan.md
specs/003-profesionalizacion-cermont/implementation-log.md
specs/003-profesionalizacion-cermont/slice-01-quality-security.md
specs/003-profesionalizacion-cermont/slice-02-legal-privacy.md
specs/003-profesionalizacion-cermont/slice-03-authorship.md
specs/003-profesionalizacion-cermont/slice-04-functional-refactor.md
specs/003-profesionalizacion-cermont/slice-05-tests-ci.md
```

Cada slice debe tener:

```txt
Objetivo
Archivos reales a revisar
Archivos reales a modificar
Cambios esperados
Tests requeridos
Riesgos
Criterios de aceptación
Resultado final
```

---

# 5. PLAN DE IMPLEMENTACIÓN DETALLADO

Debes implementar por slices. No saltarte pasos.

---

## SLICE 0 — Preparación y baseline

### Objetivo
Confirmar el estado real del repo y proteger WIP antes de tocar código.

### Acciones obligatorias

1. Ejecutar:
   ```bash
   git status --short
   npm run typecheck
   npm run lint
   npm test
   npm run build
   npm run contracts:check
   npm run quality:strict
   npm run verify
   ```

2. Documentar resultado en:
   ```txt
   specs/003-profesionalizacion-cermont/implementation-log.md
   docs/KNOWN_ISSUES.md
   ```

3. Si `*.md` está ignorado, documentar que los artifacts deben agregarse con:
   ```bash
   git add -f specs/003-profesionalizacion-cermont/*.md docs/**/*.md
   ```

4. Identificar WIP no relacionado:
   - fotos/evidencias;
   - cambios previos no commiteados;
   - archivos modificados antes de esta tarea.

### Criterio de aceptación
No se hace ningún cambio funcional sin baseline documentada.

---

## SLICE 1 — Correcciones técnicas pequeñas pero reales

### Objetivo
Demostrar que la spec 003 ya no es solo documentación corrigiendo deuda técnica concreta y segura.

### Cambios obligatorios

#### 1.1 Corregir warnings `ServiceCase.ts`

Archivo esperado:

```txt
backend/src/models/ServiceCase.ts
```

Problema reportado:

```txt
financialSummary?: Record<string, string | number | boolean | object | Date | void>;
operationalSummary?: Record<string, string | number | boolean | object | Date | void>;
```

Acción:

- reemplazar `void` por un tipo permitido por las reglas del repo;
- preferir `undefined` solo si `quality:strict` lo permite y no aumenta findings;
- si `undefined` está prohibido, crear alias seguro existente o nuevo tipo permitido, por ejemplo:
  ```ts
  type ServiceCaseSummaryValue = string | number | boolean | Date | Record<string, never>;
  ```
- no usar `any`;
- no usar `unknown` nuevo.

Tests:

```bash
npm run lint -w backend
npm run typecheck -w backend
npm run test -w backend
npm run quality:strict
```

#### 1.2 Resolver TD-019: asset pagination 0-indexed

Buscar primero en:

```txt
backend/src/modules/asset/
frontend/src/app/(dashboard)/assets/
frontend/src/modules/assets/
packages/shared-types/src/schemas/
```

Acción:

- confirmar si asset usa paginación 0-indexed;
- cambiar a estándar 1-indexed;
- actualizar schema/params si aplica;
- actualizar frontend consumidor;
- agregar test de regresión;
- actualizar `TECHNICAL_DEBT.md`.

Criterio:

- no debe quedar inconsistencia con `meta.page`;
- tests pasan.

#### 1.3 Resolver TD-020: template-response ignora page/limit

Buscar:

```txt
backend/src/modules/template-response/
frontend/src/modules/templates/
frontend/src/modules/service-cases/
```

Acción:

- confirmar que `template-response.controller.ts::list` llama service sin page/limit;
- corregir controller/service para pasar `page` y `limit`;
- validar query params con Zod;
- devolver `meta` estándar;
- agregar test de integración;
- actualizar `TECHNICAL_DEBT.md`.

### Criterio de aceptación Slice 1

- warnings corregidos;
- TD-019 cerrado o documentado con evidencia si no aplica;
- TD-020 corregido;
- tests agregados;
- quality no empeora;
- documentación actualizada.

---

## SLICE 2 — Seguridad real y no solo documento

### Objetivo
Implementar hardening concreto priorizado por la auditoría.

### 2.1 Rate limiting individual forgot/reset password

Buscar:

```txt
backend/src/middlewares/rate-limiter.ts
backend/src/modules/auth/
backend/src/routes/
frontend/src/app/forgot-password
frontend/src/app/reset-password
```

Acción:

- crear limiter específico para forgot-password;
- crear limiter específico para reset-password;
- si es posible, key por IP + email normalizado;
- no loggear email completo si se considera dato personal;
- devolver error tipado estable;
- agregar tests.

Errores sugeridos:

```txt
PASSWORD_RESET_RATE_LIMITED
FORGOT_PASSWORD_RATE_LIMITED
```

### 2.2 Auditoría de descargas de evidencias/documentos

Buscar endpoints de descarga:

```txt
backend/src/modules/files/
backend/src/modules/evidences/
backend/src/modules/documents/
frontend/src/app/api/files/[id]/content
```

Acción:

- cada descarga o visualización de archivo sensible debe registrar audit log;
- registrar:
  - userId;
  - fileId/evidenceId/documentId;
  - ownerType;
  - action;
  - timestamp;
  - ip/userAgent si ya existe patrón;
- no registrar secretos;
- no exponer paths internos;
- agregar test.

Eventos sugeridos:

```txt
FILE_DOWNLOADED
EVIDENCE_VIEWED
DOCUMENT_DOWNLOADED
```

### 2.3 CSP report-only

Buscar:

```txt
backend/src/index.ts
backend/src/config/
frontend/next.config.*
frontend/src/proxy.ts
```

Acción:

- implementar `Content-Security-Policy-Report-Only`;
- crear endpoint de recepción si encaja:
  ```txt
  POST /api/security/csp-report
  ```
- no activar CSP enforce todavía;
- documentar en `docs/security/SECURITY_HARDENING_BACKLOG.md`.

### Criterio de aceptación Slice 2

- rate limit implementado y probado;
- auditoría de descargas implementada y probada;
- CSP report-only configurado o planificado con evidencia;
- docs/security actualizados;
- tests pasan.

---

## SLICE 3 — Legal y privacidad implementados en app

### Objetivo
Pasar de “documento legal pendiente” a flujo técnico mínimo dentro de la app.

### 3.1 ConsentRecord

Crear o ajustar módulo:

```txt
backend/src/modules/consents/
packages/shared-types/src/schemas/consent.schema.ts
frontend/src/modules/consents/
```

Si ya existe, refactorizar sin duplicar.

Campos mínimos:

```ts
consentType:
  | "data_processing"
  | "photo_evidence"
  | "gps_location"
  | "document_processing"
  | "communications"

policyVersion: string
accepted: boolean
acceptedAt: Date
revokedAt?: Date
userId: string
ipAddress?: string
userAgent?: string
source: "login" | "profile" | "evidence_capture" | "admin"
```

Evitar `undefined`/`null` si el repo lo prohíbe.

Endpoints:

```txt
POST /api/consents
GET /api/consents/me
POST /api/consents/revoke
```

### 3.2 Modal o gate de consentimiento

Implementar en frontend:

```txt
frontend/src/modules/consents/
frontend/src/app/(dashboard)/layout.tsx
frontend/src/app/login
frontend/src/app/profile
```

Reglas:

- si el usuario autenticado no tiene consentimiento de tratamiento vigente, mostrar gate;
- no bloquear rutas públicas;
- no bloquear logout;
- mostrar enlaces a política y aviso;
- registrar versión de política;
- permitir aceptación explícita;
- no marcar como aceptado automáticamente.

### 3.3 Consentimiento para fotos/GPS

Integrar con evidencias/cámara:

```txt
frontend/src/modules/evidences/
frontend/src/modules/camera/
frontend/src/modules/files/
```

Reglas:

- antes de cámara/evidencia pedir consentimiento específico si no existe;
- GPS debe pedir consentimiento contextual;
- si GPS no es obligatorio, permitir continuar sin ubicación;
- registrar decisión.

### 3.4 Privacy Requests / derechos del titular

Crear módulo si no existe:

```txt
backend/src/modules/privacy-requests/
frontend/src/modules/privacy-requests/
frontend/src/app/(dashboard)/profile/privacy
```

Tipos:

```txt
consultation
update
rectification
deletion
revocation
data_copy
claim
incident
```

Estados:

```txt
received
in_review
waiting_for_information
resolved
rejected
closed
```

Endpoints:

```txt
POST /api/privacy-requests
GET /api/privacy-requests/me
GET /api/privacy-requests
PATCH /api/privacy-requests/:id/status
```

RBAC:

- usuario ve sus solicitudes;
- admin/gerencia/responsable autorizado gestiona;
- backend valida siempre.

### 3.5 Documentos legales visibles

Crear páginas o rutas:

```txt
frontend/src/app/privacy-policy
frontend/src/app/privacy-notice
frontend/src/app/terms
```

O usar rutas existentes si ya existen.

Todo texto legal debe decir:

```txt
BORRADOR TÉCNICO — requiere revisión jurídica antes de uso.
```

### Criterio de aceptación Slice 3

- usuario puede aceptar tratamiento;
- consentimiento queda registrado;
- cámara/evidencia consulta consentimiento;
- usuario puede crear solicitud de privacidad;
- admin puede verla/gestionarla;
- documentos legales son visibles;
- tests pasan;
- no se afirma cumplimiento legal final.

---

## SLICE 4 — Autoría y derechos de autor visibles

### Objetivo
Acreditar correctamente el trabajo de Juan Diego Arévalo Pidiache sin sobreafirmar titularidad patrimonial.

### Archivos a crear/actualizar

```txt
AUTHORS.md
NOTICE.md
COPYRIGHT.md
README.md
docs/legal/COPYRIGHT_AND_AUTHORSHIP_PLAN.md
docs/legal/SOFTWARE_IP_INVENTORY.md
docs/legal/THIRD_PARTY_LICENSE_AUDIT.md
docs/legal/GUIA_REGISTRO_SOFTWARE_DNDA_DRAFT.md
```

### Contenido obligatorio

Debe aparecer:

```txt
Desarrollo académico y técnico: Juan Diego Arévalo Pidiache.
Universidad de Pamplona.
Proyecto desarrollado para CERMONT S.A.S. en modalidad de trabajo de grado/práctica empresarial.
La titularidad patrimonial, permisos de uso, distribución y explotación deben revisarse según acuerdos con CERMONT S.A.S., Universidad de Pamplona y documentación contractual aplicable.
```

### Página Acerca de

Crear:

```txt
frontend/src/app/(dashboard)/about/page.tsx
```

o ruta equivalente.

Debe mostrar:

- nombre del sistema;
- versión;
- build info si existe;
- autor/desarrollador académico;
- Universidad de Pamplona;
- CERMONT S.A.S.;
- disclaimer de titularidad;
- enlaces a política/aviso;
- licencia o aviso de uso interno.

### Metadata de sistema

Crear o usar existente:

```txt
packages/config/src/app-metadata.ts
```

Campos:

```ts
appName
version
academicDeveloperName
academicDeveloperInstitution
companyName
buildDate
commitSha
copyrightNotice
```

No hardcodear en muchos lugares. SSOT.

### Criterio de aceptación Slice 4

- autoría visible en README/AUTHORS/NOTICE/COPYRIGHT;
- página Acerca de existe;
- metadata centralizada;
- no se afirma titularidad exclusiva sin soporte;
- docs legales creados;
- tests o snapshot si aplica.

---

## SLICE 5 — Mejoras funcionales reales en módulos críticos

### Objetivo
Implementar mejoras de producto inspiradas en benchmarks, no solo documentarlas.

Debes escoger como mínimo **dos vertical slices funcionales** de esta lista y completarlos con backend + frontend + tests + docs.

Prioridad recomendada:

1. Vehículos/flota.
2. Herramientas/activos.
3. Evidencias/documentos.
4. Checklists.
5. Notificaciones.
6. Dashboard/KPIs.

---

### 5.1 Vehículos/flota profesional

Inspirado en Snipe-IT / CMMS / ERPNext.

Implementar o mejorar:

- foto principal;
- galería;
- documentos requeridos:
  - SOAT;
  - tecnomecánica;
  - seguro;
  - tarjeta de propiedad;
  - permiso;
- fecha de vencimiento;
- estado:
  - ready;
  - incomplete;
  - expiring_soon;
  - expired;
  - blocked;
- readiness score;
- alerta de documento vencido;
- bloqueo si política lo exige;
- historial de asignación.

Archivos probables:

```txt
backend/src/modules/fleet/
frontend/src/modules/fleet/
frontend/src/app/(dashboard)/fleet/
packages/shared-types/src/schemas/
```

Tests:

- schema;
- service;
- endpoint list/detail;
- UI readiness;
- vencimiento.

---

### 5.2 Herramientas/activos profesional

Inspirado en Snipe-IT / openMAINT.

Implementar o mejorar:

- asset tag;
- serial;
- ubicación;
- responsable;
- disponibilidad;
- checkin/checkout;
- historial de asignación;
- certificado/calibración con vencimiento;
- foto principal;
- documentos;
- bloqueo por vencimiento;
- auditoría.

Archivos probables:

```txt
backend/src/modules/tool/
backend/src/modules/asset/
frontend/src/modules/tools/
frontend/src/app/(dashboard)/assets/
frontend/src/app/(dashboard)/resources/
packages/shared-types/src/schemas/
```

Tests:

- crear/editar herramienta;
- asignar/devolver;
- vencimiento;
- bloqueo;
- UI estado.

---

### 5.3 Evidencias/documentos profesional

Implementar o mejorar:

- categoría;
- ownerType/ownerId;
- estado de aprobación;
- consentimiento ligado;
- auditoría de descarga;
- bloqueo si usado en informe/acta;
- galería;
- preview PDF/imagen;
- metadata;
- fuente camera/gallery/upload.

Archivos probables:

```txt
backend/src/modules/evidences/
backend/src/modules/files/
backend/src/modules/documents/
frontend/src/modules/evidences/
frontend/src/modules/files/
frontend/src/app/(dashboard)/evidences/
```

Tests:

- upload;
- approve/reject;
- download audit;
- permission denied;
- locked evidence.

---

### 5.4 Checklists profesional

Implementar o mejorar:

- template versionado;
- ítems bloqueantes;
- foto requerida;
- comentario requerido si no conforme;
- evidencia ligada;
- progreso;
- aprobación/rechazo;
- offline-ready.

Archivos probables:

```txt
backend/src/modules/checklists/
frontend/src/modules/checklists/
packages/shared-types/src/schemas/
```

Tests:

- blocking item;
- required photo;
- non-compliance comment;
- completion gate.

---

### 5.5 Notificaciones reales

Implementar o mejorar eventos:

- documento vehículo por vencer;
- evidencia rechazada;
- orden asignada;
- checklist bloqueado;
- solicitud de privacidad recibida;
- descarga sensible;
- SLA en riesgo.

Archivos probables:

```txt
backend/src/modules/notifications/
frontend/src/app/(dashboard)/notifications/
frontend/src/modules/notifications/
```

Tests:

- evento genera notificación;
- unread count;
- mark as read;
- RBAC.

---

### 5.6 Dashboard/KPIs accionables

Implementar:

- KPIs con datos reales;
- tarjetas accionables;
- alertas por vencimiento;
- bloqueos;
- readiness;
- estado legal/privacidad;
- actividad reciente.

Archivos probables:

```txt
backend/src/modules/dashboard/
frontend/src/app/(dashboard)/dashboard/
frontend/src/modules/dashboard/
```

Tests:

- dashboard summary;
- KPIs incluyen nuevos campos;
- empty states.

### Criterio de aceptación Slice 5

- mínimo dos vertical slices funcionales terminados;
- no solo docs;
- backend + frontend + tests;
- docs actualizados;
- no rompió app.

---

## SLICE 6 — Tests, CI y verificación final

### Tests mínimos

Agregar o actualizar:

```txt
backend tests
frontend tests
shared-types tests
Playwright E2E si existe
contract tests
```

Escenarios obligatorios según lo implementado:

- consentimiento;
- privacy request;
- descarga auditada;
- vehículo readiness;
- herramienta bloqueo/vencimiento;
- evidencia con consentimiento;
- notificación generada.

### CI

Si no existe, crear:

```txt
.github/workflows/ci.yml
```

Pipeline mínimo:

```txt
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run contracts:check
npm run quality:strict
npm audit
```

Si `quality:strict` depende de baseline, documentar.

### Verificación final

Ejecutar:

```bash
npm run verify
npm run contracts:check
npm run quality:strict
npx react-doctor@latest
```

---

# 6. Formato de respuesta obligatorio

Al terminar cada slice responde:

```txt
# Slice X — Resultado

## 1. Objetivo
## 2. Archivos revisados
## 3. Archivos modificados
## 4. Cambios implementados
## 5. Tests agregados
## 6. Comandos ejecutados
## 7. Resultado
## 8. Riesgos abiertos
## 9. Próximo slice recomendado
```

No digas “terminado” si no ejecutaste tests o si no documentaste por qué no se pudieron ejecutar.

---

# 7. Definición de Done general

La implementación solo queda cerrada si:

1. hubo cambios funcionales reales;
2. mínimo Slice 1, 2, 3 y 4 ejecutados;
3. mínimo dos vertical slices del Slice 5 ejecutados;
4. typecheck pasa;
5. lint pasa;
6. tests pasan;
7. build pasa;
8. contracts guard pasa;
9. quality no empeora;
10. documentación viva actualizada;
11. autoría de Juan Diego aparece en AUTHORS/NOTICE/COPYRIGHT/README/About;
12. privacidad tiene flujo técnico real;
13. seguridad tiene al menos rate limit + auditoría de descargas;
14. no se inventaron archivos ni resultados;
15. todo riesgo abierto quedó documentado.

---

# 8. Primer mensaje que debes responder antes de implementar

Antes de modificar código, responde solo con:

```txt
Voy a ejecutar la Spec 003 en modo implementación real, no documentación. Primero haré Slice 0 para validar baseline y WIP; luego Slice 1 para deuda técnica concreta; Slice 2 seguridad; Slice 3 legal/privacidad; Slice 4 autoría; y después escogeré dos vertical slices funcionales del Slice 5. No cerraré tareas sin pruebas ni afirmaré resultados sin evidencia.
```

Después inicia la ejecución.
