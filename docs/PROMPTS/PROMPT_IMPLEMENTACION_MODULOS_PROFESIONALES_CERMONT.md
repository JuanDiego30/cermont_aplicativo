# PROMPT MAESTRO — Implementación real de mejoras funcionales y UI/UX CERMONT

Actúa como un **Product Architect + Staff Full Stack Engineer + UX Engineer + FSM/CMMS/ERP Consultant**.

Este prompt NO es para crear más documentos sin implementar. Es para revisar el aplicativo CERMONT y ejecutar un plan de desarrollo real, por módulos, con cambios verificables.

## 1. Problema actual

Aunque ya existen auditorías, specs y documentación, el aplicativo todavía se siente incompleto frente a una herramienta profesional:

- formularios demasiado simples;
- vehículos sin ficha completa tipo GMAO/CMMS;
- vehículos sin fotos suficientes, vencimientos, readiness, alertas y documentos;
- herramientas sin fotos, PDFs, certificados, calibraciones, checklists y trazabilidad;
- módulo de costos aún no se siente como ERP;
- evidencias sin suficiente lógica FSM;
- checklists poco robustos;
- notificaciones poco accionables;
- dashboard/KPIs poco ejecutivos;
- falta de estandarización real UI/UX en módulos;
- el agente anterior documentó, pero no implementó mejoras funcionales suficientes.

Ahora debes implementar mejoras reales con slices verticales:

```txt
contrato Zod → backend → frontend → tests → documentación viva
```

## 2. Reglas anti-alucinación obligatorias

1. No inventes archivos. Antes de modificar, busca y abre el archivo real.
2. No inventes módulos. Si un módulo no existe, crea un plan y luego créalo con estructura consistente.
3. No afirmes que implementaste algo sin test o evidencia.
4. No cierres tareas solo por crear documentación.
5. No repitas research ya creado salvo que esté incompleto.
6. No copies código de repositorios externos.
7. No hagas cambios masivos sin dividir en slices.
8. No introduzcas `any`.
9. No introduzcas `unknown`, `undefined` o `null` nuevos si violan `quality:strict`.
10. No rompas contratos Zod/shared-types.
11. No cambies API envelopes sin migración y tests.
12. No rompas RBAC.
13. No dejes mocks productivos.
14. No afirmes cumplimiento legal definitivo. Todo documento legal debe decir: “BORRADOR TÉCNICO — requiere revisión jurídica antes de uso”.
15. No afirmes titularidad patrimonial exclusiva de Juan Diego sin revisar contratos. Sí puedes implementar atribución técnica/moral razonable.
16. No uses colores o UI fuera de `DESIGN.md`.
17. No modifiques WIP no relacionado sin documentarlo.
18. No termines solo con “plan creado”. Debes implementar al menos Slice 0, Slice 1 y Slice 2.

## 3. Cómo saber si un módulo está a nivel profesional

Un módulo profesional debe cumplir:

1. Datos completos de negocio.
2. Estados claros.
3. Validaciones frontend/backend.
4. Documentos y evidencias.
5. Fotos o archivos donde tenga sentido.
6. Historial y auditoría.
7. Permisos RBAC.
8. Alertas.
9. Dashboard o indicadores.
10. Loading/error/empty/offline/forbidden states.
11. UI responsive y limpia.
12. Tests unitarios/integración.
13. Contrato Zod compartido.
14. API documentada.
15. No mocks productivos.
16. No duplicación de lógica.
17. No `any`.

## 4. Fuente de verdad que debes leer primero

Antes de tocar código, abre y resume:

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

Si un archivo no existe, dilo explícitamente y no lo inventes.

---

# PLAN DE IMPLEMENTACIÓN DETALLADO

Trabaja por slices. No saltarte pasos.

---

## SLICE 0 — Auditoría real de módulos existentes

### Objetivo
Saber exactamente qué existe antes de implementar.

### Acciones
Ejecutar:

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

Revisar módulos:

- fleet / vehicles;
- tools;
- assets;
- resources;
- evidences;
- files/documents;
- checklists;
- costs;
- dashboard;
- notifications;
- orders/service-cases;
- maintenance;
- planning.

Crear:

```txt
specs/003-profesionalizacion-cermont/implementation-gap-table.md
specs/003-profesionalizacion-cermont/implementation-log.md
```

Tabla obligatoria:

| Módulo | Existe backend | Existe frontend | Campos actuales | Campos faltantes | Endpoints | UI actual | Tests | Próxima acción |
|---|---|---|---|---|---|---|---|---|

### Criterio
No continuar sin saber qué falta realmente.

---

## SLICE 1 — Vehículos / flota tipo GMAO

### Objetivo
Convertir vehículos en un módulo profesional con fotos, documentos, vencimientos, alertas y readiness.

### Funcionalidad mínima

Cada vehículo debe tener:

#### Datos
- placa;
- marca;
- línea/modelo;
- año;
- color;
- tipo;
- VIN/serial;
- odómetro;
- combustible;
- ubicación;
- responsable;
- estado operativo;
- disponibilidad;
- observaciones.

#### Fotos
- foto principal;
- frontal;
- trasera;
- lateral izquierda;
- lateral derecha;
- placa;
- odómetro;
- interior;
- llantas;
- extintor;
- kit de carretera;
- daños.

#### Documentos
- SOAT;
- tecnomecánica;
- seguro;
- tarjeta de propiedad;
- permiso de ingreso;
- mantenimiento;
- otro PDF.

#### Vencimientos y alertas
- fecha de vencimiento por documento;
- alerta próximo a vencer;
- alerta vencido;
- estado `ready | incomplete | expiring_soon | expired | blocked`;
- readiness score.

#### Historial
- asignaciones;
- mantenimientos;
- novedades;
- auditoría.

### Implementación
1. Revisar schema existente.
2. Extender Zod schema.
3. Extender modelo backend.
4. Crear/ajustar endpoints.
5. Crear UI de detalle profesional.
6. Crear componente `VehiclePhotoGallery`.
7. Crear componente `VehicleDocumentChecklist`.
8. Crear componente `VehicleReadinessCard`.
9. Agregar alertas/notificaciones por vencimiento.
10. Agregar tests.

### Archivos probables

```txt
backend/src/modules/fleet/
frontend/src/modules/fleet/
frontend/src/app/(dashboard)/fleet/
packages/shared-types/src/schemas/
```

### Criterio de aceptación
- se puede agregar foto;
- se puede agregar PDF;
- se calcula readiness;
- se muestran alertas;
- se bloquea o advierte si hay vencimiento;
- tests pasan.

---

## SLICE 2 — Herramientas / activos tipo Snipe-IT + CMMS

### Objetivo
Hacer que herramientas y activos dejen de ser formularios simples y pasen a tener trazabilidad real.

### Funcionalidad mínima

#### Datos
- asset tag/código interno;
- nombre;
- tipo;
- categoría;
- marca;
- modelo;
- serial;
- ubicación;
- responsable;
- estado;
- disponibilidad;
- fecha compra;
- proveedor;
- valor;
- observaciones.

#### Fotos
- foto principal;
- serial/placa;
- estado físico;
- accesorios;
- daño/novedad.

#### PDFs/documentos
- manual;
- ficha técnica;
- certificado de calibración;
- certificado de inspección;
- hoja de vida;
- mantenimiento;
- factura;
- otro.

#### Checklists
- checklist preuso;
- checklist inspección;
- checklist devolución;
- ítems obligatorios;
- foto obligatoria si hay daño;
- comentario requerido si no conforme.

#### Historial
- checkout/checkin;
- responsable anterior;
- fechas;
- orden asociada;
- mantenimiento;
- auditoría.

### Implementación
1. Revisar si existe `tool`, `asset` o `resource`.
2. No duplicar módulo: decidir fuente de verdad.
3. Crear `ToolAssetProfile`.
4. Agregar `ToolPhotoGallery`.
5. Agregar `ToolDocumentList`.
6. Agregar `ToolChecklistPanel`.
7. Agregar `ToolAssignmentHistory`.
8. Crear alertas por certificado vencido.
9. Agregar tests.

### Archivos probables

```txt
backend/src/modules/tool/
backend/src/modules/asset/
frontend/src/modules/tools/
frontend/src/app/(dashboard)/assets/
frontend/src/app/(dashboard)/resources/
packages/shared-types/src/schemas/
```

### Criterio de aceptación
- herramienta acepta fotos;
- herramienta acepta PDF;
- tiene checklist;
- tiene historial;
- puede bloquearse por certificado vencido;
- UI cumple `DESIGN.md`.

---

## SLICE 3 — Evidencias FSM profesionales

### Objetivo
Que las evidencias no sean solo archivos; deben ser registros operativos del servicio de campo.

### Funcionalidad mínima
Cada evidencia debe tener:

- ownerType;
- ownerId;
- workOrderId/serviceCaseId;
- paso del flujo;
- categoría;
- fase: before/during/after/correction/hse;
- fuente: camera/gallery/upload;
- usuario;
- fecha/hora;
- GPS opcional;
- consentimiento asociado;
- descripción;
- estado: draft/pending/uploaded/pending_review/approved/rejected/locked;
- motivo de rechazo;
- uso en informe/acta;
- auditoría de descarga.

### UI
- galería por orden;
- filtros por fase;
- estado visual;
- cámara;
- upload;
- preview;
- aprobar/rechazar;
- bloquear si usado en informe.

### Implementación
1. Revisar módulo evidence/files.
2. Extender schema.
3. Extender backend.
4. Integrar consentimiento.
5. Integrar auditoría.
6. Mejorar UI.
7. Agregar tests.

### Criterio
- evidencia tiene contexto operativo;
- no se elimina si soporta informe;
- hay aprobación/rechazo;
- hay auditoría.

---

## SLICE 4 — Checklists profesionales

### Objetivo
Crear checklists dinámicos que realmente bloqueen avances y documenten cumplimiento.

### Funcionalidad mínima
- plantillas versionadas;
- secciones;
- ítems;
- tipos de respuesta;
- ítems obligatorios;
- ítems bloqueantes;
- comentario requerido si falla;
- foto requerida;
- evidencia ligada;
- firma opcional;
- progreso;
- estado;
- aprobación/rechazo.

### Implementación
1. Revisar si existe módulo checklist/forms.
2. Crear/ajustar `ChecklistTemplate`.
3. Crear/ajustar `ChecklistExecution`.
4. Crear UI móvil.
5. Integrar con órdenes, herramientas y vehículos.
6. Agregar gates.
7. Agregar tests.

### Criterio
- no permite completar ejecución si faltan ítems obligatorios;
- bloquea por no conformidad crítica;
- exige foto/comentario donde aplique.

---

## SLICE 5 — Costos tipo ERP operativo

### Objetivo
El módulo de costos debe permitir saber si una orden fue rentable.

### Funcionalidad mínima
- costo estimado desde propuesta;
- costo real;
- mano de obra;
- materiales;
- herramientas/equipos;
- vehículo/desplazamiento;
- terceros;
- imprevistos;
- impuestos;
- margen bruto;
- desviación;
- comparación estimado vs real;
- historial;
- exportación.

### UI
- resumen financiero;
- tabla por categoría;
- gráfico de desviación;
- alerta si supera presupuesto;
- relación con factura/pago.

### Implementación
1. Revisar módulo costs/proposals/invoices/payments.
2. Crear contrato `CostBreakdown`.
3. Agregar cálculo de margen.
4. Agregar UI tipo ERP.
5. Agregar tests.

---

## SLICE 6 — Dashboard profesional y KPIs accionables

### Objetivo
Que el dashboard diga qué hacer, no solo cuente cosas.

### KPIs
- órdenes activas;
- bloqueadas;
- en ejecución;
- listas para facturar;
- documentos vencidos;
- vehículos bloqueados;
- herramientas no disponibles;
- evidencias pendientes;
- checklists incompletos;
- margen promedio;
- facturación pendiente;
- SLA en riesgo.

### UI
- cards accionables;
- colores semánticos;
- links a módulos;
- empty states;
- filtros;
- alertas;
- actividad reciente;
- timeline.

### Implementación
1. Revisar dashboard summary backend.
2. Agregar KPIs nuevos.
3. Actualizar frontend.
4. Tests.

---

## SLICE 7 — Notificaciones accionables

### Eventos
- vehículo documento vencido;
- herramienta certificado vencido;
- evidencia rechazada;
- orden asignada;
- checklist bloqueado;
- costo excedido;
- factura pendiente;
- privacy request recibida;
- descarga sensible.

### Implementación
- backend notification service;
- campana;
- unread count;
- página de notificaciones;
- mark read;
- tests.

---

## SLICE 8 — UI/UX profesional transversal

### Reglas
- aplicar `DESIGN.md`;
- todos los módulos críticos con loading/error/empty/offline/forbidden;
- formularios por secciones;
- cards limpias;
- iconos consistentes;
- acciones claras;
- mobile-first.

### Componentes a crear o mejorar
- `SectionHeader`;
- `StatusBadge`;
- `ReadinessCard`;
- `DocumentChecklist`;
- `PhotoGallery`;
- `AttachmentDropzone`;
- `AuditTimeline`;
- `EmptyStateCard`;
- `BlockingAlert`;
- `KpiActionCard`.

---

## SLICE 9 — Legal, privacidad y autoría

### Implementar
- consentimiento tratamiento datos;
- consentimiento fotos/GPS;
- privacy requests;
- política/aviso visibles;
- retención/supresión;
- AUTHORS.md;
- NOTICE.md;
- COPYRIGHT.md;
- página Acerca de;
- atribución a Juan Diego Arévalo Pidiache con disclaimer de titularidad.

---

## SLICE 10 — Tests y verificación final

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

Agregar tests por cada slice implementado.

---

## Formato de respuesta por slice

```txt
# Slice X terminado

## Archivos revisados
## Archivos modificados
## Funcionalidad implementada
## Tests agregados
## Comandos ejecutados
## Resultado
## Riesgos abiertos
## Siguiente slice
```

## Definition of Done

No se puede decir que la mejora está terminada si no hay:

- código backend;
- código frontend;
- contrato Zod;
- tests;
- documentación actualizada;
- evidencia de comandos;
- UI real;
- validaciones;
- RBAC;
- no rompimiento de contratos.

Empieza por Slice 0 y después implementa Slice 1 y Slice 2. Luego reporta antes de continuar.
