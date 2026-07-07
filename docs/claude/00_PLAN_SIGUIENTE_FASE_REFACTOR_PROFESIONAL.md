# 00 — Plan siguiente fase: refactor profesional CERMONT

## 1. Propósito

La siguiente fase debe dejar el aplicativo como un sistema profesional, no como un prototipo legacy. La plataforma debe permitir que CERMONT gestione casos/OT a través de los 14 pasos, usando documentos reutilizables, formularios dinámicos abiertos, evidencias, bloqueadores, cierre administrativo y costos reales.

## 2. Problema actual

Aunque los planes ya se implementaron parcialmente, el sistema todavía tiene estos riesgos:

1. Formularios cerrados con selectores rígidos.
2. Botones de documentos que suben archivo pero no lo vuelven seleccionable ni reutilizable.
3. Documentos no asociados correctamente a caso/OT/paso/requisito.
4. “Formularios dinámicos” que no se comportan como builder real.
5. Bloqueadores débiles o simulados.
6. Cierre administrativo superficial.
7. Costos con datos en cero o sin trazabilidad.
8. Código con `any`, almacenamiento in-memory, redirects genéricos y deuda de gates.

## 3. Decisión técnica

La fase se ejecuta por **vertical slices**, no por archivos sueltos:

```text
Contrato Zod
→ Tipo inferido
→ Modelo Mongoose
→ Servicio de dominio
→ Controlador
→ Ruta Express
→ Hook TanStack Query
→ Componente UI
→ QA Playwright/curl
→ Test Vitest
```

## 4. Fases

### Fase 0 — Baseline y saneamiento controlado

**Objetivo:** dejar claro qué falla y qué no, sin esconder deuda.

Tareas:

- Ejecutar `git status`.
- Ejecutar `npm run typecheck`.
- Ejecutar `npm run lint`.
- Ejecutar `npm run test`.
- Ejecutar `npm run build`.
- Ejecutar `npm run verify`.
- Guardar logs en `.sisyphus/evidence/baseline/`.
- Corregir solo formateo y tipos triviales si bloquean el avance.
- No actualizar snapshots sin explicar qué contrato cambió y por qué.

### Fase 1 — Contratos compartidos

**Objetivo:** que `packages/shared-types` y `packages/domain` sean la fuente de verdad.

Crear o verificar:

- `OpenOptionSchema`
- `CustomOptionSchema`
- `DynamicSelectFieldSchema`
- `DocumentAssociationSchema`
- `DocumentReferenceSchema`
- `DocumentReuseSchema`
- `FormTemplateVersionSchema`
- `TemplateResponseSchema`
- `WorkflowRequirementSchema`
- `WorkflowBlockerSchema`
- `CostTraceabilitySchema`
- `ClosureStepSchema`

### Fase 2 — Formularios abiertos

**Objetivo:** ningún selector crítico debe ser rígido.

Cada campo select/multi-select/radio debe soportar:

```text
options[]
allowCustomOption
customOptionLabel
customValue
persistCustomOption
requiresApproval
sourceCatalog
```

Ejemplo funcional:

```text
Tipo de herramienta:
[Multímetro] [Pinza amperimétrica] [Taladro] [Otro...]

Si usuario selecciona Otro:
→ aparece input “Escriba herramienta requerida”
→ se guarda como customOption
→ puede aprobarse como opción reutilizable
→ queda asociada a la OT/paso/requisito
```

### Fase 3 — Biblioteca documental reutilizable

**Objetivo:** si no se puede hacer un formulario dinámico desde un documento, al menos el documento debe poder quedar almacenado y seleccionarse después.

Flujo requerido:

```text
Subir documento
→ guardar en DocumentSourceFile
→ clasificar propósito
→ asociar a OT/caso/paso/requisito
→ permitir seleccionarlo desde biblioteca
→ usarlo como soporte, evidencia, plantilla o referencia
```

No aceptar:

```text
Botón → /documents → subir archivo → nada más
```

Aceptar:

```text
Botón “Adjuntar soporte SES”
→ modal contextual
→ subir nuevo o seleccionar existente
→ asociar a paso 10/11
→ resolver blocker
→ mostrar documento en timeline
```

### Fase 4 — Slices por las 4 fallas de CERMONT

#### Slice A — Planeación

Debe resolver:

- alcance incompleto;
- herramientas/equipos/personas faltantes;
- certificaciones no verificadas;
- AST/PTW/documentos de apoyo faltantes.

Entregable:

- checklist dinámico;
- kit típico configurable;
- carga Excel de recursos;
- opciones “Otro” para herramientas/equipos;
- bloqueador antes de ejecutar.

#### Slice B — Ejecución

Debe resolver:

- olvido de herramientas;
- falta de evidencias;
- ejecución sin documentación;
- registro manual disperso.

Entregable:

- sesión de ejecución con checklist;
- evidencias before/during/after;
- materiales usados;
- horas reales;
- firma/supervisión;
- bloqueo antes de cerrar ejecución.

#### Slice C — Informes y actas

Debe resolver:

- retraso en informes;
- actas finales demoradas;
- desconexión entre ejecución, informe y acta.

Entregable:

- generar informe desde ejecución;
- seleccionar evidencias;
- generar acta desde informe;
- firma cliente;
- bloqueo antes de SES.

#### Slice D — Cierre administrativo y costos

Debe resolver:

- retrasos SES/Ariba;
- facturación tardía;
- pagos sin seguimiento;
- costos reales no centralizados.

Entregable:

- timeline 10–14;
- SES radicada/aprobada;
- factura enviada/aprobada;
- pago recibido;
- costos estimado vs real vs facturado vs pagado.

### Fase 5 — UI profesional

Cada página debe trabajar con el cockpit o contexto de caso/OT.

Páginas mínimas:

- `/service-cases/[id]`
- `/work-requests`
- `/site-visits`
- `/proposals`
- `/orders`
- `/planning`
- `/execution`
- `/evidences`
- `/reports`
- `/delivery-records`
- `/billing/ses`
- `/billing/invoices`
- `/payments`
- `/costs`
- `/documents`
- `/templates`

Cada página debe mostrar:

- contexto de caso/OT;
- paso operativo;
- requisitos;
- documentos asociados;
- bloqueadores;
- acciones contextuales;
- estado de sincronización;
- próxima acción.

### Fase 6 — Pruebas funcionales

Crear pruebas para demostrar que el sistema resuelve negocio:

- no ejecutar sin planeación completa;
- no cerrar ejecución sin evidencias;
- no generar acta sin informe;
- no crear SES sin acta firmada;
- no facturar sin SES aprobada;
- no cerrar sin pago;
- no perder documentos subidos;
- permitir opción “Otro” y persistirla;
- seleccionar documento existente y asociarlo;
- costos reales se calculan sin `$0` por defecto.

## 5. Entrega final

El agente debe entregar:

- archivos modificados;
- evidencia de QA;
- logs de gates;
- matriz de criterios aceptados/rechazados;
- deuda pendiente explícita;
- veredicto final.
