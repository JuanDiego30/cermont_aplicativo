# PROMPT MAESTRO — Spec Kit + COMPLAN de implementación para corregir hallazgos de auditoría CERMONT

Actúa como un **Staff Software Architect + Tech Lead + Security Engineer + QA Lead + Compliance Analyst + DevOps Engineer**, experto en:

- GitHub Spec Kit y Spec-Driven Development;Lee `PROMPT_SPEC_005_HOTFIX_POST_DEPLOY_CERMONT.md` y ejecútalo desde FASE 0. Primero reproduce y clasifica todos los errores de producción con curl, logs y navegador. Corrige assets 404, manifest/PWA, 401 de notificaciones, 500 de usuario, 400 de work-requests, 400 de documents, warning de DialogTitle y sistema de biometría móvil con WebAuthn/passkeys o fallback real. No implementes nuevas funcionalidades hasta corregir P0. Después retoma mínimo dos slices funcionales pendientes: vehículos con fotos/documentos/readiness, herramientas con fotos/PDF/checklists, evidencias FSM/cámara, dashboard/KPIs o checklists bloqueantes. No cierres ninguna fase sin archivos modificados, tests, comandos ejecutados y evidencia.
::: 
"C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\docs\PROMPTS\PROMPT_FOTOS_CAMARA_DOCUMENTOS_CERMONT.md"
"C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\docs\PROMPTS\PROMPT_IMPLEMENTACION_MODULOS_PROFESIONALES_CERMONT.md"
"C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\docs\PROMPTS\PROMPT_SPEC_003_IMPLEMENTACION_REAL_CERMONT.md"
"C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\docs\PROMPTS\PROMPT_SPEC_003_PROFESIONALIZACION_CERMONT.md"
"C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\docs\PROMPTS\PROMPT_IMPLEMENTACION_SPEC_KIT_POST_AUDITORIA_CERMONT.md"
"C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\docs\PROMPTS\PROMPT_MEJORA_KPIS_E_IMPLEMENTACION_DESIGN.md"
"C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\docs\PROMPTS\PROMPT_SPEC_005_HOTFIX_POST_DEPLOY_CERMONT.md"
"C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\docs\PROMPTS\PROMPT_SPEC_004_DEPLOY_SEGURO_CERMONT.md"
"C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\docs\PROMPTS\PROMPT_AUDITORIA_SPEC_KIT_CERMONT.md"
- Next.js 16, React 19, TypeScript estricto y Turbopack;
- Express 5.2.1, MongoDB, Mongoose 9.x;
- Zod 4.x, contract-first development y shared-types;
- TanStack Query, query keys, apiClient único y hooks por módulo;
- RBAC, JWT, httpOnly cookies, proxy.ts y permisos por dominio;
- OWASP, seguridad de archivos, auditoría, logs y rate limiting;
- Ley 1581 de 2012, Decreto 1377 de 2013, RNBD y protección de datos personales en Colombia;
- SSL/HTTPS, Nginx, Certbot, Let's Encrypt, HSTS, CORS y deploy en VPS;
- documentación técnica viva y CI/CD con GitHub Actions.

Voy a trabajar sobre el aplicativo **CERMONT S.A.S.**, que ya fue auditado. Debes usar los hallazgos de auditoría como entrada principal y crear un **plan de corrección e implementación completo**, usando enfoque **Spec Kit / Spec-Driven Development**.

---

## 0. Hallazgos confirmados de auditoría

La auditoría determinó:

### Estado general
- Monorepo npm workspaces.
- Backend Express 5.2.1.
- Frontend Next.js 16 + React 19 + Turbopack.
- MongoDB + Mongoose 9.x.
- Zod 4.x como SSOT contractual.
- 52 módulos backend.
- 41 módulos frontend.
- 100+ schemas Zod compartidos.
- 389+ endpoints reales documentados en código.
- 52 API_MOUNTS registrados.
- 36 rutas App Router.
- apiClient único basado en fetch.
- TanStack Query con query keys centralizadas.
- RBAC en `packages/domain`.
- proxy.ts como perímetro frontend.
- arquitectura contract-first avanzada.

### Problemas prioritarios detectados
1. Response envelope de paginación inconsistente:
   - backend usa `pagination`;
   - frontend espera `meta`;
   - frontend tiene fallback, pero debe estandarizarse.

2. Dashboard:
   - verificar si `GET /dashboard/summary` responde con `{ success, data }`;
   - confirmar que el frontend no depende de mocks productivos.

3. Documentación API desactualizada:
   - documentación actual cubre aproximadamente 100 endpoints;
   - código real contiene 389+ endpoints;
   - se debe regenerar/inventariar documentación API real.

4. Tests casi inexistentes:
   - faltan tests de contrato;
   - faltan tests de integración;
   - faltan tests E2E críticos.

5. Cumplimiento legal Colombia en alto riesgo:
   - sin autorización de tratamiento;
   - sin política de tratamiento;
   - sin aviso de privacidad;
   - sin derechos ARCO/habeas data;
   - sin consentimiento de evidencias fotográficas;
   - sin consentimiento de geolocalización;
   - sin política de retención;
   - sin anonimización/supresión.

6. RNBD no verificado:
   - falta confirmar si CERMONT tiene activos totales superiores a 100.000 UVT.

7. SSL/HTTPS:
   - documentalmente configurado para `cermontsas.shop`;
   - Nginx 301 configurado;
   - HSTS configurado;
   - cookies Secure/HttpOnly configuradas;
   - Let's Encrypt no verificado en vivo;
   - mixed content no verificado;
   - VPS no auditado en vivo.

8. Seguridad:
   - base técnica buena;
   - falta rate limiting individual para forgot-password/reset-password;
   - seed passwords deben cambiarse por valores seguros post-deploy;
   - auditar descargas de evidencias;
   - agregar CSP report-only;
   - fortalecer backlog OWASP.

9. Documentación ya creada:
   - `.specify/memory/constitution.md`;
   - `specs/001-auditoria-integral-cermont/spec.md`;
   - `specs/001-auditoria-integral-cermont/plan.md`;
   - `specs/001-auditoria-integral-cermont/tasks.md`;
   - documentos de auditoría en `docs/audits`;
   - documentos de compliance en `docs/compliance`;
   - documentos de deployment en `docs/deployment`;
   - documentos de seguridad en `docs/security`;
   - `docs/DEVELOPMENT_STATUS.md`;
   - `docs/API_STATUS.md`;
   - `docs/TECHNICAL_DEBT.md`.

---

## 1. Objetivo principal

Crear e implementar un **COMPLAN de corrección** basado en Spec Kit para resolver los hallazgos de auditoría, sin romper la arquitectura existente.

El resultado debe:

1. Corregir la discrepancia de paginación.
2. Verificar y corregir el response envelope del dashboard.
3. Actualizar documentación API para 389+ endpoints.
4. Implementar tests de contrato, integración y E2E prioritarios.
5. Implementar flujo legal mínimo para Ley 1581 de 2012.
6. Agregar aviso de privacidad y autorización de tratamiento.
7. Agregar consentimiento para evidencias fotográficas y geolocalización.
8. Implementar derechos ARCO/habeas data como módulo o flujo administrativo.
9. Crear o completar documentos legales borrador.
10. Verificar SSL/HTTPS en VPS.
11. Corregir configuración de seguridad pendiente.
12. Actualizar documentación viva del desarrollo.
13. Crear tareas Spec Kit claras, verificables y ejecutables.
14. Ejecutar pruebas y dejar evidencia.

---

## 2. Modo de ejecución con GitHub Spec Kit

### 2.1 Si Spec Kit CLI está disponible

Usa el flujo:

```txt
/speckit.constitution
/speckit.specify
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.implement
```

### 2.2 Si Spec Kit CLI no está disponible

Como la auditoría detectó que Spec Kit CLI no está instalado, debes continuar manualmente con estructura compatible:

```txt
.specify/
  memory/
    constitution.md

specs/
  002-correcciones-post-auditoria-cermont/
    spec.md
    plan.md
    tasks.md
    research.md
    data-model.md
    contracts/
      pagination-envelope-contract.md
      dashboard-summary-contract.md
      legal-consent-contract.md
      privacy-rights-contract.md
      api-documentation-contract.md
      ssl-verification-contract.md
    quickstart.md
    compliance-checklist.md
    test-plan.md
```

No inventes que el CLI ejecutó comandos si no existe. Documenta si se hizo manual.

---

## 3. Constitución del proyecto

Primero actualiza `.specify/memory/constitution.md` agregando esta enmienda:

```md
# Enmienda post-auditoría CERMONT

## Principios añadidos

1. **API Contract Stability:** todos los endpoints deben usar envelopes consistentes y documentados.
2. **Pagination Standard:** la paginación del sistema debe usar un solo contrato canónico.
3. **Legal Compliance First:** todo flujo que trate datos personales debe incluir finalidad, autorización y trazabilidad.
4. **Evidence Privacy:** fotos, GPS, firmas, documentos y evidencias se consideran datos de alto cuidado.
5. **Production HTTPS:** ninguna operación de producción puede depender de HTTP plano.
6. **Tests Before Closure:** ninguna corrección crítica se considera cerrada sin test de contrato/integración.
7. **Documentation Parity:** si existen 389+ endpoints, la documentación API debe reflejar esos endpoints o justificar exclusiones.
8. **No Mock Drift:** los mocks no pueden alimentar pantallas productivas sin bandera explícita de demo/dev.
```

---

## 4. Crear nueva especificación Spec Kit

Crea:

```txt
specs/002-correcciones-post-auditoria-cermont/spec.md
```

Debe contener:

### 4.1 User stories

#### US-001 — Paginación consistente
Como desarrollador del sistema, quiero que backend y frontend usen un único contrato de paginación para evitar fallos silenciosos y lógica fallback innecesaria.

#### US-002 — Dashboard conectado y verificable
Como gerente, quiero que el dashboard consuma datos reales del backend y use el envelope estándar para confiar en los KPIs.

#### US-003 — Documentación API real
Como equipo técnico, quiero que la documentación API refleje los 389+ endpoints reales para mantener la plataforma auditable.

#### US-004 — Consentimiento legal
Como titular de datos personales, quiero conocer y autorizar el tratamiento de mis datos antes de usar el sistema.

#### US-005 — Aviso de privacidad visible
Como usuario, quiero consultar el aviso de privacidad desde login, registro y perfil.

#### US-006 — Evidencias fotográficas y GPS
Como técnico/ingeniero, quiero capturar evidencias con claridad legal sobre finalidad, uso, retención y acceso.

#### US-007 — Derechos del titular
Como titular, quiero poder solicitar consulta, actualización, rectificación, supresión o revocatoria de autorización.

#### US-008 — SSL/HTTPS verificado
Como administrador de producción, quiero confirmar que el dominio, API, cookies y certificados operan correctamente bajo HTTPS.

#### US-009 — Tests críticos
Como tech lead, quiero tests de contrato, integración y E2E que protejan los módulos críticos.

---

## 5. COMPLAN de implementación

Crea:

```txt
specs/002-correcciones-post-auditoria-cermont/plan.md
```

con el siguiente COMPLAN:

# COMPLAN — Correcciones post-auditoría CERMONT

## Fase 0 — Preparación segura

### Objetivo
Crear rama, respaldar estado actual y establecer línea base antes de modificar código.

### Acciones
1. Crear rama:
   ```bash
   git checkout -b fix/post-audit-compliance-contracts
   ```
2. Ejecutar:
   ```bash
   npm install
   npm run typecheck
   npm run lint
   npm run build
   ```
3. Si falla algún comando, documentar en:
   ```txt
   docs/KNOWN_ISSUES.md
   ```
4. No modificar funcionalidad hasta registrar línea base.

### Criterio de salida
- Línea base documentada.
- Errores iniciales diferenciados de errores introducidos.

---

## Fase 1 — Estandarizar contrato de paginación

### Decisión de arquitectura
Definir un contrato canónico:

```ts
type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type PaginatedResponse<T> = {
  success: true;
  data: T[];
  meta: PaginationMeta;
};
```

### Acciones
1. Buscar todos los usos de:
   - `pagination`
   - `meta`
   - `pages`
   - `totalPages`
2. Crear o actualizar schema Zod compartido:
   ```txt
   packages/shared-types/src/schemas/pagination.schema.ts
   ```
3. Actualizar helpers backend para responder `meta`.
4. Mantener compatibilidad temporal si hay clientes legacy:
   - backend puede incluir `pagination` deprecado solo durante transición;
   - documentar deprecación.
5. Actualizar frontend para usar solo `meta`.
6. Eliminar fallbacks innecesarios después de tests.
7. Actualizar docs API.

### Tests
- test unitario del schema;
- test integración `GET /api/orders`;
- test frontend service parseando `meta`;
- test de contrato.

### Criterio de aceptación
- ningún módulo productivo depende solo de `pagination`;
- frontend y backend usan `meta`;
- typecheck pasa;
- tests de orders pasan.

---

## Fase 2 — Verificar dashboard summary

### Acciones
1. Auditar endpoint:
   ```txt
   GET /api/dashboard/summary
   ```
2. Confirmar envelope:
   ```json
   { "success": true, "data": {} }
   ```
3. Confirmar schema Zod para dashboard summary.
4. Confirmar que el frontend no use mocks productivos.
5. Si hay mocks, moverlos a:
   ```txt
   dashboard.mock.ts
   ```
   y protegerlos con bandera:
   ```txt
   NEXT_PUBLIC_DEMO_MODE=true
   ```
6. Agregar loading/error/empty states.
7. Agregar test de integración.

### Criterio de aceptación
- dashboard consume backend real;
- mocks solo en demo/dev;
- response envelope estándar;
- test de integración creado.

---

## Fase 3 — Actualizar documentación API 389+ endpoints

### Acciones
1. Crear script:
   ```txt
   scripts/generate-api-inventory.ts
   ```
2. Extraer rutas de backend:
   - método;
   - path;
   - middleware auth;
   - permisos;
   - controller;
   - schema;
   - status;
   - test asociado.
3. Generar:
   ```txt
   docs/API_STATUS.md
   docs/audits/BACKEND_ENDPOINT_INVENTORY.md
   docs/audits/FRONTEND_BACKEND_ENDPOINT_MATRIX.md
   specs/002-correcciones-post-auditoria-cermont/contracts/openapi-detected.yaml
   ```
4. Si no se puede generar OpenAPI completo, crear inventario Markdown confiable.
5. Comparar con documentación anterior.
6. Marcar endpoints:
   - public;
   - authenticated;
   - admin;
   - deprecated;
   - internal;
   - unconsumed.

### Criterio de aceptación
- documentación refleja 389+ endpoints o justifica exclusiones;
- endpoints huérfanos identificados;
- endpoints sin tests marcados.

---

## Fase 4 — Implementar base legal Ley 1581

### Advertencia
Esto es implementación técnica de cumplimiento. Todo texto legal debe marcarse como borrador sujeto a revisión jurídica.

### Acciones frontend
1. En login/registro agregar enlaces visibles a:
   - política de tratamiento;
   - aviso de privacidad;
   - autorización de tratamiento.
2. Agregar checkbox requerido:
   ```txt
   Acepto la política de tratamiento de datos personales y autorizo el tratamiento de mis datos conforme a la finalidad informada.
   ```
3. Agregar checkbox específico para evidencias si aplica:
   ```txt
   Autorizo el tratamiento de imágenes, fotografías, documentos y evidencias asociadas a actividades operativas, cuando sea necesario para la ejecución, trazabilidad y cierre del servicio.
   ```
4. Para geolocalización:
   - pedir permiso contextual;
   - explicar finalidad;
   - permitir continuar sin GPS cuando no sea obligatorio;
   - registrar si el usuario aceptó o rechazó.

### Acciones backend
1. Crear modelo/colección:
   ```txt
   ConsentRecord
   ```
2. Campos mínimos:
   - userId;
   - consentType;
   - version;
   - accepted;
   - acceptedAt;
   - ipAddress;
   - userAgent;
   - source;
   - policyVersion;
   - evidence;
   - revokedAt;
   - createdAt.
3. Endpoints:
   - `POST /api/consents`
   - `GET /api/consents/me`
   - `GET /api/consents/:userId` protegido
   - `POST /api/consents/revoke`
4. Validar con Zod.
5. Auditar aceptación y revocatoria.

### Documentos
Crear/actualizar:

```txt
docs/legal/POLITICA_TRATAMIENTO_DATOS_PERSONALES_CERMONT_DRAFT.md
docs/legal/AVISO_PRIVACIDAD_CERMONT_DRAFT.md
docs/legal/AUTORIZACION_TRATAMIENTO_DATOS_TRABAJADORES_CONTRATISTAS_DRAFT.md
docs/legal/AUTORIZACION_USO_EVIDENCIAS_FOTOGRAFICAS_DRAFT.md
docs/legal/AUTORIZACION_USO_GEOLOCALIZACION_DRAFT.md
docs/legal/PROCEDIMIENTO_CONSULTAS_RECLAMOS_DATOS_PERSONALES_DRAFT.md
docs/legal/PROCEDIMIENTO_INCIDENTES_SEGURIDAD_DATOS_DRAFT.md
docs/legal/POLITICA_RETENCION_SUPRESION_DATOS_DRAFT.md
```

Todos deben iniciar con:

```txt
BORRADOR TÉCNICO — requiere revisión jurídica antes de uso.
```

### Criterio de aceptación
- consentimiento registrado;
- política/aviso visibles;
- versiones de documento registradas;
- auditoría creada;
- no se bloquea el sistema sin manejo UX;
- tests creados.

---

## Fase 5 — Derechos del titular / ARCO / Habeas Data

### Acciones
Crear módulo:

```txt
privacy-requests
```

### Solicitudes soportadas
- consulta;
- actualización;
- rectificación;
- supresión;
- revocatoria;
- copia de datos;
- reporte de incidente.

### Estados
- received;
- in_review;
- waiting_for_information;
- resolved;
- rejected;
- closed.

### Endpoints
- `POST /api/privacy-requests`
- `GET /api/privacy-requests/me`
- `GET /api/privacy-requests`
- `PATCH /api/privacy-requests/:id/status`

### UI
- página en perfil: “Mis datos y privacidad”;
- formulario para radicar solicitud;
- estado de solicitud;
- canal de contacto visible.

### Criterio de aceptación
- usuario puede radicar solicitud;
- admin puede gestionar;
- auditoría registra cambios;
- documentación actualizada.

---

## Fase 6 — Seguridad técnica P1/P2

### Acciones
1. Cambiar seed passwords:
   - eliminar contraseñas predecibles;
   - usar `.env`;
   - generar secreto post-deploy;
   - documentar rotación.
2. Rate limiting individual:
   - forgot-password;
   - reset-password;
   - login;
   - register, si aplica.
3. Auditoría de descargas:
   - evidencias;
   - PDFs;
   - documentos;
   - reportes.
4. CSP report-only:
   - configurar header;
   - endpoint de reporte;
   - revisar impacto antes de enforce.
5. Revisar CORS:
   - producción solo dominio real;
   - localhost solo en desarrollo.
6. Revisar cookies:
   - Secure;
   - HttpOnly;
   - SameSite;
   - domain correcto.

### Criterio de aceptación
- pruebas de seguridad básicas pasan;
- no hay secretos en repo;
- docs/security actualizado.

---

## Fase 7 — Verificar SSL/HTTPS real

### Si hay acceso al VPS
Ejecutar:

```bash
curl -I https://cermontsas.shop
curl -I http://cermontsas.shop
openssl s_client -connect cermontsas.shop:443 -servername cermontsas.shop
sudo certbot certificates
sudo certbot renew --dry-run
sudo nginx -t
sudo systemctl status nginx
docker compose ps
docker compose logs --tail=200
```

### Si no hay acceso al VPS
Crear checklist con comandos exactos y dejar estado `not-verified`.

### Verificar
- certificado válido;
- no vencido;
- redirect HTTP→HTTPS;
- HSTS;
- cookies Secure;
- CORS;
- mixed content;
- API URL no apunta a localhost;
- uploads/descargas por HTTPS.

### Criterio de aceptación
- `docs/deployment/SSL_HTTPS_AUDIT.md` actualizado con evidencia real;
- si no se verifica, queda como riesgo abierto.

---

## Fase 8 — Tests automatizados

### Tests de contrato prioritarios
Crear tests para:

- auth/login;
- auth/me;
- orders list paginated;
- orders detail;
- evidences list;
- evidences upload;
- dashboard summary;
- consents create/list;
- privacy requests create/list.

### Tests de integración backend
- auth;
- orders;
- evidence;
- consents;
- privacy requests;
- documents.

### E2E Playwright
Crear flujos:

1. Login.
2. Dashboard carga datos reales.
3. Listar órdenes con meta paginada.
4. Crear consentimiento en registro/login.
5. Subir evidencia o simular evidencia.
6. Radicar solicitud de privacidad.
7. Ver error state si API falla.

### Criterio de aceptación
- test suite mínima creada;
- comandos documentados;
- CI listo o documentado.

---

## Fase 9 — CI/CD GitHub Actions

Crear:

```txt
.github/workflows/ci.yml
.github/workflows/deploy.yml
```

### CI mínimo
- install;
- typecheck;
- lint;
- build;
- tests unitarios;
- tests integración;
- audit;
- artifact docs si aplica.

### Deploy opcional
- vía SSH;
- backup;
- pull;
- install/build;
- restart services;
- health check;
- rollback básico.

### Criterio de aceptación
- PR no puede pasar sin typecheck/build;
- deploy documentado.

---

## Fase 10 — Documentación viva

Actualizar:

```txt
docs/DEVELOPMENT_STATUS.md
docs/API_STATUS.md
docs/TECHNICAL_DEBT.md
docs/ROADMAP.md
docs/CHANGELOG.md
docs/KNOWN_ISSUES.md
README.md
```

Debe incluir:

- qué se corrigió;
- qué queda pendiente;
- endpoints auditados;
- estado legal;
- estado SSL;
- estado tests;
- comandos de verificación;
- riesgos abiertos.

---

## 6. Crear tasks Spec Kit

Crea:

```txt
specs/002-correcciones-post-auditoria-cermont/tasks.md
```

con esta estructura:

# Tasks — Correcciones post-auditoría CERMONT

## P0 — Contratos y API

- [ ] T001 Crear spec `002-correcciones-post-auditoria-cermont`.
- [ ] T002 Actualizar constitución con enmienda post-auditoría.
- [ ] T003 Crear schema Zod canónico de paginación.
- [ ] T004 Actualizar helpers backend para responder `meta`.
- [ ] T005 Ajustar frontend para consumir `meta`.
- [ ] T006 Agregar compatibilidad temporal/deprecación de `pagination`, si aplica.
- [ ] T007 Crear tests de contrato para `GET /api/orders`.
- [ ] T008 Verificar `GET /api/dashboard/summary`.
- [ ] T009 Eliminar mocks productivos del dashboard o aislarlos con `NEXT_PUBLIC_DEMO_MODE`.
- [ ] T010 Actualizar documentación de contratos.

## P1 — Legal y privacidad

- [ ] T011 Crear schemas Zod para consentimientos.
- [ ] T012 Crear modelo `ConsentRecord`.
- [ ] T013 Crear endpoints de consentimiento.
- [ ] T014 Agregar checkbox de autorización en login/registro o primer acceso.
- [ ] T015 Agregar aviso de privacidad visible.
- [ ] T016 Crear flujo de consentimiento para evidencias fotográficas.
- [ ] T017 Crear flujo de consentimiento para geolocalización.
- [ ] T018 Crear módulo `privacy-requests`.
- [ ] T019 Crear documentos legales borrador.
- [ ] T020 Actualizar `LEGAL_COMPLIANCE_AUDIT_COLOMBIA.md`.

## P1 — Seguridad

- [ ] T021 Rotar seed passwords.
- [ ] T022 Agregar rate limiting individual para forgot/reset password.
- [ ] T023 Auditar descargas de evidencias/documentos.
- [ ] T024 Configurar CSP report-only.
- [ ] T025 Revisar CORS producción.
- [ ] T026 Verificar cookies Secure/HttpOnly/SameSite.

## P2 — Documentación API

- [ ] T027 Crear script de inventario de rutas.
- [ ] T028 Generar inventario de 389+ endpoints.
- [ ] T029 Actualizar `API_STATUS.md`.
- [ ] T030 Actualizar matriz frontend-backend.
- [ ] T031 Identificar endpoints huérfanos.
- [ ] T032 Identificar endpoints sin tests.
- [ ] T033 Crear OpenAPI detectado o inventario Markdown.

## P2 — Tests

- [ ] T034 Crear tests de contrato auth.
- [ ] T035 Crear tests de contrato orders.
- [ ] T036 Crear tests de contrato evidence.
- [ ] T037 Crear tests de contrato dashboard.
- [ ] T038 Crear tests de contrato consents.
- [ ] T039 Crear tests integración backend.
- [ ] T040 Crear E2E básico con Playwright.
- [ ] T041 Documentar comandos de test.

## P2 — SSL/Deploy

- [ ] T042 Verificar HTTPS con curl.
- [ ] T043 Verificar certificado con openssl.
- [ ] T044 Verificar Certbot.
- [ ] T045 Verificar Nginx.
- [ ] T046 Verificar mixed content.
- [ ] T047 Actualizar `SSL_HTTPS_AUDIT.md`.

## P3 — CI/CD y profesionalización

- [ ] T048 Crear GitHub Actions CI.
- [ ] T049 Crear deploy workflow si aplica.
- [ ] T050 Actualizar README.
- [ ] T051 Actualizar ROADMAP.
- [ ] T052 Actualizar CHANGELOG.
- [ ] T053 Actualizar TECHNICAL_DEBT.
- [ ] T054 Crear reporte final post-implementación.

---

## 7. Contratos esperados

### 7.1 Contrato de paginación

Archivo:

```txt
specs/002-correcciones-post-auditoria-cermont/contracts/pagination-envelope-contract.md
```

Debe definir:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### 7.2 Contrato dashboard summary

Archivo:

```txt
specs/002-correcciones-post-auditoria-cermont/contracts/dashboard-summary-contract.md
```

Debe definir:

- KPIs;
- pipeline;
- órdenes recientes;
- actividad reciente;
- estados vacíos;
- formato envelope.

### 7.3 Contrato consentimiento

Archivo:

```txt
specs/002-correcciones-post-auditoria-cermont/contracts/legal-consent-contract.md
```

Debe definir:

- tipos de consentimiento;
- versión de política;
- evidencia de aceptación;
- revocatoria;
- consulta por usuario.

### 7.4 Contrato derechos del titular

Archivo:

```txt
specs/002-correcciones-post-auditoria-cermont/contracts/privacy-rights-contract.md
```

Debe definir:

- solicitud;
- estado;
- respuesta;
- auditoría;
- permisos.

---

## 8. Reglas de implementación

1. No hacer cambios masivos sin tests.
2. No eliminar endpoints sin deprecación.
3. No cambiar nombres de contratos sin migración.
4. No romper compatibilidad del frontend.
5. No introducir `any`.
6. No duplicar schemas.
7. No duplicar roles.
8. No hardcodear rutas.
9. No dejar mocks productivos.
10. No dejar textos legales como definitivos sin nota de revisión jurídica.
11. No afirmar cumplimiento legal completo sin revisión de abogado.
12. No afirmar SSL verificado si no se ejecutaron comandos.
13. No cerrar tareas sin evidencia.
14. No omitir documentación.

---

## 9. Comandos de validación

Ejecuta al final:

```bash
npm run typecheck
npm run lint
npm run build
npm test
npm run test:integration
npm run test:e2e
npm audit
```

Si algún script no existe, crear issue/tarea y documentarlo.

---

## 10. Formato de respuesta final del agente

Al terminar, responde:

```txt
# Implementación post-auditoría CERMONT — Resultado

## 1. Resumen ejecutivo
...

## 2. Correcciones implementadas
...

## 3. Contratos actualizados
...

## 4. Legal y privacidad
...

## 5. SSL/HTTPS
...

## 6. Seguridad
...

## 7. Tests agregados
...

## 8. Documentación actualizada
...

## 9. Spec Kit artifacts
...

## 10. Comandos ejecutados
...

## 11. Riesgos abiertos
...

## 12. Siguientes pasos
...
```

---

## 11. Resultado esperado

Al finalizar esta implementación, CERMONT debe quedar con:

- contratos de paginación consistentes;
- dashboard verificado contra backend real;
- API documentada de forma mucho más completa;
- base legal mínima implementada;
- consentimientos versionados;
- privacidad visible para usuarios;
- solicitudes de derechos del titular;
- SSL/HTTPS verificado o riesgo documentado;
- rate limiting reforzado;
- auditoría de descargas;
- tests críticos iniciales;
- documentación viva actualizada;
- tasks Spec Kit cerradas con evidencia.

No improvises. Corrige con Spec Kit, evidencia, tareas y pruebas.
