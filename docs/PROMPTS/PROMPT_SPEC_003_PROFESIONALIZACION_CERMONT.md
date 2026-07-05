# PROMPT MAESTRO — Spec Kit 003: Profesionalización CERMONT

Actúa como un Staff Software Architect, Product Lead, Security Engineer, Compliance Analyst, UX Engineer y Open Source Researcher experto en GitHub Spec Kit, Spec-Driven Development, Next.js 16, React 19, TypeScript estricto, Express 5.2.1, MongoDB, Mongoose 9, Zod 4, Contract-First, FSM, CMMS/GMAO, ERP operativo, seguridad OWASP ASVS, Ley 1581 de 2012, RNBD, derechos de autor de software y documentación técnica viva.

Voy a continuar el aplicativo CERMONT S.A.S. después de la implementación Stage 1 / P0. El agente anterior ya dejó en verde la unificación de paginación a `meta`, verificó dashboard summary, agregó tests y actualizó documentación. Ahora necesito una nueva especificación para investigar software profesional/repositorios GitHub y mejorar módulos, seguridad, legalidad, funcionalidad y atribución de autoría a Juan Diego Arévalo Pidiache.

---

## 0. Estado confirmado del proyecto

El proyecto ya tiene:

- monorepo npm workspaces;
- backend Express 5.2.1;
- frontend Next.js 16 + React 19 + Turbopack;
- MongoDB + Mongoose 9.x;
- Zod 4.x como SSOT;
- 52+ módulos backend;
- 41+ módulos frontend;
- 100+ schemas Zod compartidos;
- 389+ endpoints reales;
- apiClient único basado en fetch;
- TanStack Query;
- RBAC en `packages/domain`;
- proxy.ts como perímetro frontend;
- PWA / Serwist;
- contratos y tests en crecimiento.

El agente anterior reportó:

- Stage 1 / P0 completado;
- 1014/1014 tests pasan;
- contracts guard pasa;
- typecheck pasa;
- build pasa;
- lint pasa con 2 warnings preexistentes en `ServiceCase.ts`;
- `quality:strict` falla por weak tokens existentes: `unknown`, `undefined`, `null`;
- TD-019: módulo asset usa paginación 0-indexed;
- TD-020: template-response ignora page/limit;
- hay WIP no comprometido mezclado con sistema de fotos/evidencias;
- Stage 2 legal/seguridad/SSL quedó planeado pero no iniciado.

---

## 1. Objetivo principal

Crear e implementar una nueva especificación Spec Kit:

```txt
specs/003-profesionalizacion-cermont/
```

para elevar CERMONT a nivel profesional mediante:

1. Investigación comparativa de software profesional y repositorios open source.
2. Mejora funcional de módulos ya desarrollados.
3. Mejora de seguridad técnica.
4. Mejora legal y privacidad.
5. Atribución y derechos de autor a Juan Diego Arévalo Pidiache.
6. Revisión de licencias y terceros.
7. Mejoras de UX/producto.
8. Tests, CI/CD, observabilidad y documentación viva.

No copiar código de terceros. Solo extraer patrones, modelos de flujo, ideas funcionales, criterios de madurez y buenas prácticas.

---

## 2. Reglas obligatorias

1. No hacer cambios masivos sin spec, plan y tasks.
2. No tocar WIP no relacionado sin documentarlo.
3. Cero `any`.
4. No aumentar findings de `quality:strict`.
5. No introducir `unknown`, `undefined` o `null` nuevos si están prohibidos por el repo.
6. No romper contratos.
7. No romper API envelopes.
8. No romper RBAC.
9. No romper PWA/offline.
10. No dejar mocks productivos.
11. No copiar código de repositorios externos.
12. No afirmar cumplimiento legal total sin revisión jurídica.
13. No afirmar titularidad patrimonial exclusiva sin verificar contratos con CERMONT, Universidad de Pamplona y acuerdos de práctica.
14. Toda mejora funcional debe tener pruebas o evidencia verificable.
15. Toda mejora legal debe generar documento técnico marcado como borrador.
16. Toda mejora de seguridad debe mapearse a OWASP ASVS o criterio equivalente.
17. Toda mejora visual debe respetar `DESIGN.md`.
18. Todo cambio debe actualizar documentación viva.

---

## 3. Modo de trabajo con GitHub Spec Kit

Si el CLI existe, usar:

```txt
/speckit.constitution
/speckit.specify
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.implement
```

Si no existe, crear manualmente:

```txt
.specify/
  memory/
    constitution.md

specs/
  003-profesionalizacion-cermont/
    spec.md
    plan.md
    tasks.md
    research.md
    benchmark-matrix.md
    data-model.md
    module-gap-analysis.md
    security-hardening-plan.md
    legal-compliance-plan.md
    copyright-attribution-plan.md
    test-plan.md
    quickstart.md
    contracts/
      professional-module-contracts.md
      asset-tool-fleet-contract.md
      evidence-document-contract.md
      privacy-consent-contract.md
      copyright-attribution-contract.md
      security-asvs-contract.md
```

---

## 4. Enmienda a la constitución

Actualizar `.specify/memory/constitution.md` agregando v1.2:

```md
# Enmienda v1.2 — Profesionalización, benchmarking y autoría

21. Professional Benchmarking Without Copying — se permite estudiar software FSM, CMMS, ERP, ITSM y asset management para extraer patrones, no código.
22. Feature Maturity Matrix — cada módulo crítico debe evaluarse contra referentes profesionales.
23. Legal By Design — privacidad, consentimiento, retención, supresión y finalidad hacen parte del producto.
24. Security Evidence — toda afirmación de seguridad debe tener prueba, configuración o documento asociado.
25. Copyright Attribution — la plataforma debe acreditar el desarrollo de Juan Diego Arévalo Pidiache, sin desconocer titularidad contractual que deba revisarse.
26. License Awareness — toda dependencia, plantilla, imagen o código externo debe tener revisión básica de licencia.
27. No Quality Regression — `quality:strict`, contratos, tests y lint no pueden empeorar.
28. User Trust Surfaces — login, perfil, acerca de, footer, documentos legales y reportes deben comunicar privacidad, soporte, autoría y versión.
```

---

## 5. Fase 0 — Línea base

1. Crear rama:
   ```bash
   git checkout -b feat/spec-003-professionalization
   ```
2. Ejecutar:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run build
   npm run contracts:check
   npm run quality:strict
   git status --short
   ```
3. Documentar resultado en:
   ```txt
   specs/003-profesionalizacion-cermont/quickstart.md
   docs/KNOWN_ISSUES.md
   ```
4. Registrar que `quality:strict` actualmente falla por weak tokens.
5. No corregir todos los weak tokens de una vez. Crear plan gradual.
6. Identificar WIP no relacionado antes de tocar archivos.

Criterio de salida: baseline documentada y WIP protegido.

---

## 6. Fase 1 — Investigación profesional y benchmarking

Crear:

```txt
specs/003-profesionalizacion-cermont/research.md
specs/003-profesionalizacion-cermont/benchmark-matrix.md
docs/research/PROFESSIONAL_SOFTWARE_BENCHMARK.md
```

Investigar mínimo:

### FSM / Field Service
- OCA Field Service / Odoo Field Service:
  - órdenes FSM;
  - actividades por orden;
  - territorios;
  - portal;
  - asignación de técnicos;
  - rutas;
  - partes de trabajo;
  - facturación conectada.

### ERP / Asset Maintenance
- ERPNext:
  - asset maintenance;
  - maintenance schedules;
  - maintenance visits/logs;
  - responsable por tarea;
  - fechas futuras;
  - inventario;
  - workflow de aprobación;
  - contabilidad/facturación conectada.

### CMMS / GMAO
- Atlas CMMS / Grash:
  - work orders;
  - preventive maintenance;
  - assets;
  - facilities;
  - procedimientos;
  - técnicos;
  - móvil;
  - SLA;
  - prioridades.

- openMAINT / CMDBuild:
  - inventario de activos;
  - plantas/equipos/dispositivos;
  - mantenimiento preventivo/correctivo;
  - logística;
  - costos;
  - workflows;
  - dashboards.

### ITSM / Asset Management
- GLPI:
  - activos;
  - tickets;
  - solicitudes;
  - catálogo de servicios;
  - SLA;
  - auditoría;
  - trazabilidad.

- Snipe-IT:
  - asset tags;
  - checkin/checkout;
  - historial de asignación;
  - ubicación;
  - responsable;
  - depreciación;
  - accesorios;
  - licencias;
  - API;
  - auditoría.

### Seguridad
- OWASP ASVS:
  - autenticación;
  - sesiones;
  - control de acceso;
  - validación;
  - logs;
  - protección de datos;
  - comunicaciones;
  - archivos;
  - configuración.

### Legal Colombia
- Ley 1581 de 2012;
- RNBD;
- autorización;
- aviso de privacidad;
- política de tratamiento;
- consultas y reclamos;
- responsabilidad demostrada;
- seguridad de bases de datos.

### Derechos de autor / software Colombia
- Ley 23 de 1982;
- registro de software ante DNDA;
- autoría;
- titularidad patrimonial a verificar;
- AUTHORS / NOTICE / COPYRIGHT;
- licencia;
- auditoría de terceros.

Crear matriz:

| Referente | Tipo | Módulo observado | Patrón útil | Adaptación CERMONT | Riesgo/licencia | Prioridad |
|---|---|---|---|---|---|---|

---

## 7. Fase 2 — Matriz de madurez por módulo

Crear:

```txt
specs/003-profesionalizacion-cermont/module-gap-analysis.md
docs/product/MODULE_MATURITY_MATRIX.md
```

Evaluar módulos:

- Dashboard/KPIs;
- Órdenes;
- Solicitudes;
- Visitas técnicas;
- Propuestas;
- Planeación;
- Recursos;
- Herramientas;
- Vehículos/flota;
- Evidencias;
- Cámara;
- Documentos/PDF;
- Checklists;
- Mantenimiento;
- Informes;
- Actas;
- SES;
- Facturación;
- Pagos;
- Notificaciones;
- Offline/PWA;
- Auditoría;
- Usuarios/RBAC;
- Legal/privacidad;
- Seguridad;
- Derechos de autor/atribución.

Usar niveles:

```txt
0 inexistente
1 básico
2 funcional
3 profesional
4 avanzado
5 diferencial
```

Tabla:

| Módulo | Nivel actual | Referente comparado | Brecha | Mejora propuesta | Impacto | Esfuerzo | Prioridad |
|---|---:|---|---|---|---|---|---|

---

## 8. Fase 3 — Mejoras funcionales profesionales

Crear:

```txt
specs/003-profesionalizacion-cermont/contracts/professional-module-contracts.md
```

Implementar solo mejoras priorizadas.

### 8.1 Herramientas y activos
Inspirarse en Snipe-IT, ERPNext y openMAINT.

Mejoras:
- asset tag/código interno;
- serial;
- marca/modelo;
- ubicación;
- responsable;
- estado;
- disponibilidad;
- historial de asignaciones;
- historial de mantenimiento;
- documentos;
- fotos;
- vencimientos;
- calibraciones;
- checklist de inspección;
- bloqueo por vencimiento;
- checkin/checkout;
- auditoría.

### 8.2 Vehículos/flota
Mejoras:
- foto principal y galería;
- SOAT, tecnomecánica, seguro, tarjeta, permisos;
- vencimientos;
- odómetro;
- historial de asignación;
- mantenimientos programados;
- inspección preoperacional;
- disponibilidad;
- bloqueo por documento vencido;
- alerta de vencimiento;
- readiness score.

### 8.3 Órdenes/service cases
Mejoras:
- prioridad;
- SLA;
- responsable;
- equipo asignado;
- tiempos reales;
- bloqueos;
- gates de checklist;
- evidencias obligatorias;
- timeline auditable;
- comentarios;
- costos reales;
- cierre técnico y administrativo separado.

### 8.4 Checklists
Mejoras:
- plantillas versionadas;
- secciones;
- ítems obligatorios;
- ítems bloqueantes;
- comentarios por no conformidad;
- foto obligatoria;
- firma;
- aprobación/rechazo;
- evidencia ligada;
- offline.

### 8.5 Evidencias y documentos
Mejoras:
- clasificación;
- galería;
- metadata;
- cámara/galería/upload;
- GPS opcional;
- consentimiento ligado;
- aprobación;
- bloqueo si usado en informe;
- auditoría de descarga;
- retención.

### 8.6 Notificaciones
Mejoras:
- campana real;
- vencimientos;
- evidencias rechazadas;
- asignaciones;
- cambios de estado;
- documentos por vencer;
- tareas pendientes;
- SLA en riesgo;
- digest opcional.

### 8.7 Dashboard/KPIs
Mejoras:
- KPIs accionables;
- filtros por cliente/fecha/estado;
- alertas;
- pipeline;
- SLA;
- readiness;
- cartera/cierre;
- actividad reciente;
- tendencia mensual;
- empty states.

---

## 9. Fase 4 — Seguridad profesional

Crear:

```txt
specs/003-profesionalizacion-cermont/security-hardening-plan.md
docs/security/ASVS_IMPLEMENTATION_MATRIX.md
docs/security/SECURITY_HARDENING_BACKLOG.md
```

### 9.1 Corregir baseline de quality:strict
1. Corregir warnings de `ServiceCase.ts`.
2. Clasificar weak tokens:
   - permitido por Mongoose/Express;
   - reemplazable por tipo seguro;
   - necesita wrapper;
   - falso positivo documentado.
3. No ampliar baseline sin justificación.
4. Crear plan por lotes.

### 9.2 OWASP ASVS
Crear matriz:

| Control | Estado | Evidencia | Gap | Task |
|---|---|---|---|---|

Revisar:
- auth;
- sesiones;
- control de acceso;
- validación;
- archivos;
- logs;
- errores;
- protección de datos;
- CORS;
- CSP;
- rate limiting;
- secretos;
- backups;
- dependencias.

### 9.3 Mejoras prioritarias
- rate limiting forgot/reset;
- CSP report-only;
- auditoría de descargas;
- validación MIME real;
- límites de tamaño;
- bloqueo de ejecutables;
- sanitización de filename;
- revisión CORS/cookies;
- control de acceso por archivo;
- logs sin secretos;
- npm audit;
- Dependabot/GitHub security alerts;
- SBOM opcional.

---

## 10. Fase 5 — Legal, privacidad y cumplimiento

Crear:

```txt
specs/003-profesionalizacion-cermont/legal-compliance-plan.md
docs/compliance/LEGAL_IMPLEMENTATION_PLAN_COLOMBIA.md
docs/compliance/DATA_PROTECTION_PROGRAM_DRAFT.md
docs/compliance/PRIVACY_REQUIREMENTS_TRACEABILITY.md
```

### 10.1 Consentimientos
Implementar o completar:
- tratamiento de datos personales;
- evidencias fotográficas;
- geolocalización;
- documentos;
- comunicaciones;
- versión de política;
- fecha/hora;
- IP;
- userAgent;
- revocatoria.

### 10.2 Derechos del titular
Módulo `privacy-requests`:
- consulta;
- actualización;
- rectificación;
- supresión;
- revocatoria;
- copia/exportación;
- reclamo;
- incidente.

### 10.3 Retención y supresión
- política por tipo de dato;
- evidencias;
- documentos;
- logs;
- usuarios;
- auditorías;
- soft delete;
- anonimización;
- bloqueo de eliminación si soporta cierre contractual.

### 10.4 Inventario de datos
Tabla:

| Dato | Categoría | Finalidad | Base legal | Retención | Acceso | Riesgo |
|---|---|---|---|---|---|---|

### 10.5 RNBD
Crear verificación:

```txt
¿CERMONT tiene activos totales superiores a 100.000 UVT?
Sí / No / No verificado
```

Si no está verificado, crear task administrativa.

### 10.6 Documentos legales borrador
Crear:

```txt
docs/legal/POLITICA_TRATAMIENTO_DATOS_PERSONALES_CERMONT_DRAFT.md
docs/legal/AVISO_PRIVACIDAD_CERMONT_DRAFT.md
docs/legal/AUTORIZACION_TRATAMIENTO_DATOS_DRAFT.md
docs/legal/AUTORIZACION_EVIDENCIAS_FOTOGRAFICAS_DRAFT.md
docs/legal/AUTORIZACION_GEOLOCALIZACION_DRAFT.md
docs/legal/PROCEDIMIENTO_CONSULTAS_RECLAMOS_DRAFT.md
docs/legal/PROCEDIMIENTO_INCIDENTES_DATOS_DRAFT.md
docs/legal/POLITICA_RETENCION_SUPRESION_DRAFT.md
```

Primera línea obligatoria:

```txt
BORRADOR TÉCNICO — requiere revisión jurídica antes de uso.
```

---

## 11. Fase 6 — Derechos de autor, autoría y propiedad intelectual

Crear:

```txt
specs/003-profesionalizacion-cermont/copyright-attribution-plan.md
docs/legal/COPYRIGHT_AND_AUTHORSHIP_PLAN.md
docs/legal/SOFTWARE_IP_INVENTORY.md
docs/legal/THIRD_PARTY_LICENSE_AUDIT.md
```

### 11.1 Advertencia obligatoria
No afirmar titularidad patrimonial exclusiva sin revisar:
- acuerdo de práctica empresarial;
- contrato con CERMONT S.A.S.;
- reglamento de trabajo de grado;
- lineamientos de Universidad de Pamplona;
- contratos laborales/prestación;
- licencias de dependencias;
- logos, documentos y marcas corporativas.

### 11.2 Atribución a Juan Diego Arévalo Pidiache
Implementar superficies:
1. `AUTHORS.md`
2. `NOTICE.md`
3. `COPYRIGHT.md`
4. revisión de `LICENSE.md`
5. sección README:
   ```txt
   Desarrollo académico y técnico por Juan Diego Arévalo Pidiache.
   ```
6. página `Acerca de`:
   - nombre del sistema;
   - versión;
   - desarrollado por Juan Diego Arévalo Pidiache;
   - modalidad trabajo de grado/práctica empresarial;
   - Universidad de Pamplona;
   - CERMONT S.A.S.;
   - aviso de revisión de titularidad.
7. footer discreto, solo si CERMONT lo aprueba:
   ```txt
   Plataforma desarrollada por Juan Diego Arévalo Pidiache — Universidad de Pamplona.
   ```
8. metadata:
   - appName;
   - version;
   - author;
   - repository;
   - buildDate;
   - commitSha.

### 11.3 Registro de software
Crear:

```txt
docs/legal/GUIA_REGISTRO_SOFTWARE_DNDA_DRAFT.md
```

Debe listar:
- descripción del software;
- código fuente;
- manual usuario;
- manual técnico;
- capturas;
- versión;
- autor;
- titulares patrimoniales a confirmar;
- dependencias;
- licencia;
- soportes.

### 11.4 Licencias de terceros
Crear matriz:

| Dependencia | Licencia | Uso | Riesgo | Acción |
|---|---|---|---|---|

---

## 12. Fase 7 — UX/producto profesional

Crear:

```txt
docs/product/PROFESSIONAL_PRODUCT_IMPROVEMENT_PLAN.md
docs/design/UIUX_GAP_ANALYSIS.md
```

Mejorar:
- dashboard;
- KPIs;
- flujo de 14 pasos;
- empty states;
- mobile field mode;
- evidencias;
- vehículos;
- herramientas;
- checklists;
- documentos;
- notificaciones;
- perfil, privacidad y acerca de.

Cada pantalla crítica debe tener:
- loading;
- error;
- empty;
- offline;
- forbidden.

---

## 13. Fase 8 — Tests, CI/CD y calidad

Crear:

```txt
specs/003-profesionalizacion-cermont/test-plan.md
docs/testing/PROFESSIONAL_TEST_PLAN.md
.github/workflows/ci.yml
```

Tests mínimos:
- contrato assets/tools;
- contrato fleet/vehicles;
- contrato evidences/documents;
- contrato consents;
- contrato privacy requests;
- permisos RBAC;
- descarga de archivos;
- audit log;
- dashboard KPIs;
- E2E consentimiento;
- E2E privacy request;
- E2E evidencia/cámara si posible.

CI:
```txt
install
typecheck
lint
test
build
contracts:check
quality:strict
security audit
```

Si `quality:strict` falla actualmente, iniciar como warning controlado y crear plan para volverlo bloqueante.

---

## 14. Fase 9 — Observabilidad y operación

Crear:

```txt
docs/operations/OBSERVABILITY_PLAN.md
docs/operations/BACKUP_AND_RECOVERY_PLAN.md
docs/operations/INCIDENT_RESPONSE_PLAN.md
```

Mejoras:
- health checks;
- request id;
- structured logs;
- audit trails;
- backup MongoDB;
- restore drill;
- error tracking;
- uptime monitoring;
- SSL expiry monitoring;
- disk usage;
- upload storage monitoring;
- logs sin secretos.

---

## 15. Tasks Spec Kit

Crear:

```txt
specs/003-profesionalizacion-cermont/tasks.md
```

Continuar numeración después de spec 002. Si la última task fue T-054, iniciar en T-055.

### P0 — Spec y research
- [ ] T055 Crear spec 003.
- [ ] T056 Actualizar constitución v1.2.
- [ ] T057 Documentar baseline post-Stage 1.
- [ ] T058 Crear research profesional.
- [ ] T059 Crear benchmark matrix.
- [ ] T060 Crear matriz de madurez por módulo.
- [ ] T061 Priorizar backlog.

### P1 — Seguridad y calidad
- [ ] T062 Corregir warnings `ServiceCase.ts`.
- [ ] T063 Clasificar weak tokens existentes.
- [ ] T064 Crear plan gradual para `quality:strict`.
- [ ] T065 Implementar rate limiting forgot/reset.
- [ ] T066 Implementar auditoría de descargas.
- [ ] T067 Configurar CSP report-only.
- [ ] T068 Revisar CORS/cookies.
- [ ] T069 Crear matriz OWASP ASVS.

### P1 — Legal y privacidad
- [ ] T070 Crear/ajustar ConsentRecord.
- [ ] T071 Implementar consentimiento tratamiento de datos.
- [ ] T072 Implementar consentimiento evidencias fotográficas.
- [ ] T073 Implementar consentimiento geolocalización.
- [ ] T074 Crear privacy-requests.
- [ ] T075 Crear política de retención/supresión.
- [ ] T076 Crear documentos legales borrador.
- [ ] T077 Crear verificación RNBD.

### P1 — Derechos de autor
- [ ] T078 Crear AUTHORS.md.
- [ ] T079 Crear NOTICE.md.
- [ ] T080 Crear COPYRIGHT.md.
- [ ] T081 Actualizar README con atribución.
- [ ] T082 Crear página Acerca de.
- [ ] T083 Agregar metadata de versión/autor.
- [ ] T084 Crear guía DNDA.
- [ ] T085 Crear auditoría de licencias.

### P2 — Módulos funcionales
- [ ] T086 Mejorar herramientas/activos.
- [ ] T087 Mejorar vehículos/flota.
- [ ] T088 Mejorar órdenes/service cases.
- [ ] T089 Mejorar checklists.
- [ ] T090 Mejorar evidencias/documentos.
- [ ] T091 Mejorar notificaciones.
- [ ] T092 Mejorar dashboard/KPIs.
- [ ] T093 Mejorar offline/PWA.

### P2 — Tests y CI
- [ ] T094 Crear tests contractuales nuevos.
- [ ] T095 Crear tests integración.
- [ ] T096 Crear E2E críticos.
- [ ] T097 Crear CI GitHub Actions.
- [ ] T098 Documentar quality gates.

### P3 — Operación y documentación
- [ ] T099 Crear observability plan.
- [ ] T100 Crear backup/restore plan.
- [ ] T101 Crear incident response plan.
- [ ] T102 Actualizar API_STATUS.
- [ ] T103 Actualizar DEVELOPMENT_STATUS.
- [ ] T104 Actualizar ROADMAP.
- [ ] T105 Actualizar CHANGELOG.
- [ ] T106 Crear reporte final Spec 003.

---

## 16. Entregables finales

Al finalizar responder:

```txt
# Spec 003 — Profesionalización CERMONT

## 1. Resumen ejecutivo
## 2. Benchmarks investigados
## 3. Módulos mejorados
## 4. Seguridad
## 5. Legal y privacidad
## 6. Derechos de autor y atribución
## 7. Tests y calidad
## 8. Documentación creada
## 9. Riesgos abiertos
## 10. Comandos ejecutados
## 11. Próximos pasos
```

---

## 17. Criterios de aceptación

La spec 003 solo queda cerrada si:

1. Existe investigación profesional documentada.
2. Existe benchmark matrix.
3. Existe matriz de madurez por módulo.
4. No se copió código externo.
5. Se mejoró seguridad sin empeorar quality.
6. Se creó plan legal y privacidad.
7. Se implementaron o planearon consentimientos y derechos del titular.
8. Se creó atribución de autoría para Juan Diego Arévalo Pidiache.
9. Se revisó titularidad sin afirmar propiedad exclusiva sin soporte.
10. Se creó auditoría de licencias.
11. Se actualizaron README, AUTHORS, NOTICE y página Acerca de.
12. Se crearon tests nuevos para módulos críticos.
13. Se actualizó documentación viva.
14. Typecheck pasa.
15. Lint pasa.
16. Tests pasan.
17. Contracts guard pasa.
18. Build pasa.
19. Riesgos abiertos documentados.
20. No se rompe funcionalidad existente.

---

## 18. Orden recomendado

Ejecutar por bloques:

1. Spec + research + benchmark.
2. Matriz de madurez.
3. Seguridad/quality baseline.
4. Legal/privacidad.
5. Derechos de autor/atribución.
6. Mejoras funcionales priorizadas.
7. Tests/CI.
8. Observabilidad/documentación.

Detente al final de cada bloque P0/P1/P2 para reportar resultados antes de seguir.
