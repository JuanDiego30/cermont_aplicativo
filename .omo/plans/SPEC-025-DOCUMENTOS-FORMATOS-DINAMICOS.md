# SPEC-025: Formatos Operativos como Formularios Dinámicos

Basado en 10 documentos fuente. No duplica SPEC-024 (bugfix) ni FINAL_IMPLEMENTATION_PLAN (14-step UI).

## 1. QUÉ

Convertir 4 formatos PDF CERMONT reales en formularios dinámicos configurables:

| Doc | Formato | Tipo | Prioridad |
|-----|---------|------|-----------|
| 06 | Planeación de Obra | Checklist materiales/herramientas/equipos/EPP/personal | P0 |
| 08 | Inspección Líneas de Vida Vertical (OPE-006) | Checklist inspección + hoja de vida + registro fotográfico | P0 |
| 10 | Mantenimiento Preventivo CCTV | Formulario técnico + registro fotográfico | P1 |
| 05 | Fotos Anclaje Escalera a Estructura | Plantilla registro fotográfico (usa mismo schema que 08) | P1 |

Los otros 6 documentos son REFERENCIA (no producen código):
- 02 (Inducción SGSST-49p) → contenido estático para módulo de inducción
- 03 (Jerarquía de controles) → referencia org chart
- 07 (Brief 14 pasos) → ya cubierto por FINAL_IMPLEMENTATION_PLAN
- 09 (Observaciones anteproyecto) → requisitos: Módulo 1 offline, Módulo 2 dashboard, Módulo 3 admin, Módulo 4 backup histórico
- LTG (Tesis completa) → validación académica, arquitectura ya implementada
- REGLAS_DESARROLLO → ya vigente

## 2. POR QUÉ AHORA

- FINAL_IMPLEMENTATION_PLAN cubre infraestructura de 14 pasos pero NO los formatos específicos que los técnicos diligencian en campo
- Los PDFs contienen la estructura EXACTA de campos que los inspectores usan
- Sin estos formatos, el sistema tiene el flujo pero no el contenido operativo real
- Son el "qué" del ExecutionSession (Paso 6) — el contenido concreto del checklist de campo

## 3. ENFOQUE (ponytail)

No crear componentes hardcodeados por cada formato. Usar schema-driven forms.

Repositorio de templates JSON que definen secciones/campos/tipos/validaciones → componente FormRenderer genérico.

Mínimo código nuevo. Máxima reutilización.

## 4. QUÉ SE ENTREGA

### 4.1 Schema de Template Dinámico (shared-types)

```
packages/shared-types/src/schemas/dynamic-template/
  dynamic-template.schema.ts    → schema base del template
  template-instance.schema.ts   → schema de la instancia (respuestas)
  field-types.ts                → tipos de campo: text, number, select, checkbox, photo, signature, date
```

Un template = secciones con campos. Una instancia = respuestas vinculadas a un ExecutionSession.

### 4.2 Catálogo Inicial de Templates

Los 4 formatos codificados como JSON en backend:

```
backend/src/templates/
  lifeline-inspection.template.json    (OPE-006)
  ctv-maintenance.template.json
  work-planning.template.json
  ladder-anchor-photos.template.json
```

Cada template se siembra en DB al deploy (seed).

### 4.3 Backend Endpoints

```
POST   /api/templates                  → crear template (admin)
GET    /api/templates                  → listar templates
GET    /api/templates/:id              → obtener template con campos
POST   /api/template-instances         → crear instancia (respuestas)
GET    /api/template-instances?session=:executionSessionId
GET    /api/template-instances/:id
PATCH  /api/template-instances/:id     → actualizar respuestas parciales
```

### 4.4 Frontend

```
frontend/components/dynamic-form/
  FormRenderer.tsx          → renderiza cualquier template dinámico
  fields/
    TextField.tsx
    NumberField.tsx
    SelectField.tsx
    CheckboxField.tsx
    PhotoField.tsx          → captura foto + geo + metadata
    SignatureField.tsx
    DateField.tsx
    SectionRenderer.tsx     → agrupa campos por sección con estado C/NC

frontend/app/(dashboard)/field-execution/[id]/checklist/
  page.tsx                  → página que carga template según tipo de orden
```

### 4.5 Mapeo de Formatos Específicos

#### Formato 06: Planeación de Obra
Secciones:
- Responsable / Lugar / Fecha / Unidad de Negocio
- Alcance (textarea)
- Materiales (tabla: descripción × cantidad, 2 columnas)
- Herramientas (tabla: descripción × cantidad, 2 columnas)
- Equipos (tabla: descripción × cantidad, 2 columnas)
- Elementos de Seguridad (tabla: descripción × cantidad, 2 columnas)
- Trabajadores (electricistas, técnicos telecom, instrumentistas, obreros)
- Firmas: Ing. Residente, Técnico Electricista, HES

#### Formato 08: Inspección Líneas de Vida Vertical (OPE-006)
Checklist por componente con evaluación C/NC:

Sección 1 - Inspección:
- Placa de Anclaje Superior: grietas, corrosión (C/NC)
- Platinas de Sujeción: corrosión, grietas, tornillos instalados, tornillería ajustada
- Absorbedor de Energía: tornillos, grafado, corrosión, grietas
- Sistema Tensor: tornillos, pin fijación, grafado
- Cable Acero Inoxidable: integridad, torceduras, aplastamientos, desgaste, tensión, corrosión
- Soporte Cable Guía: grietas, tornillos, distancia 10m
- Placa de Anclaje Inferior: grietas, corrosión
- Placa Identificación: instalación, legible, fecha inspección
- Concepto Final

Sección 2 - Hoja de Vida:
- Componentes con referencia/cantidad/unidad (10+ líneas: absorbedor, cable, anclajes, tensor...)
- Diámetro cable, tipo cable, fabricante, número línea

Sección 3 - Registro Fotográfico:
- Foto placa anclaje superior
- Foto estructura torre
- Foto placa anclaje inferior
- Foto soporte cable guía
- Foto absorbedor energía

#### Formato 10: Mantenimiento CCTV
- Info cámara: número, lugar, fecha, altura, distancia caja conexión
- Tipo cámara, modelo, serial
- Encoder/POE: modelo, serial
- Conexión remota: radio modelo, serial, antena
- Switch: modelo, serial
- Conexión master: ubicación, radio
- Sistema eléctrico: AC 110V, fotovoltaico, caja conexión, transferencia automática, gabinete
- Alimentación: TBT
- Luces de obstrucción
- Registro fotográfico: cámara, radioenlace, caja conexiones, conexión eléctrica, sistema puesta a tierra

#### Formato 05: Fotos Anclaje Escalera a Estructura
Reusa Sección 3 del formato 08. Template separado por claridad:
- Anclaje peldaños soporte superior
- Estado tornillos/soldadura soporte superior
- Anclaje soporte superior a lo largo
- Anclaje soporte inferior
- Estado tornillos/soldadura soporte inferior

### 4.6 Integración con Módulo 4 (Backup Histórico - del doc 09)

El doc 09 pide Módulo 4: Archivado automático mensual + portal de descarga.

Esto ya está parcialmente en FINAL_IMPLEMENTATION_PLAN. Agregar:
- Archivar instancias de templates completadas > 30 días a DB histórica
- Portal admin: seleccionar mes/año → descargar .zip con PDFs

## 5. LO QUE SE SALTA (YAGNI)

- ❌ No crear un drag-drop form builder UI en esta iteración (los templates se definen como JSON)
- ❌ No crear editor visual de templates (admin edita JSON)
- ❌ No implementar lógica condicional compleja (show/hide entre campos) en v1
- ❌ No crear plugin system para tipos de campo custom
- ❌ No validar todos los formatos históricos (solo los 4 priorizados)

## 6. LO QUE SE REUSA

- ✅ FormRenderer usa existing shadcn/ui components (Input, Select, Checkbox, Button, Card, Table)
- ✅ PhotoField usa existing evidence upload flow (apiClient + TanStack Query)
- ✅ Template instances se vinculan a ExecutionSession existente
- ✅ PDF generation engine existente (pdf-lib) para exportar instancias a PDF
- ✅ RBAC gates existentes para controlar quién crea/edita templates

## 7. ORDEN DE IMPLEMENTACIÓN

```
Wave 1 (Día 1-2): Schema base + backend CRUD templates/instances
  → shared-types: dynamic-template.schema, template-instance.schema
  → backend: endpoints template + instance (Mongoose models)
  → seed: lifeline-inspection.template.json

Wave 2 (Día 3-4): FormRenderer + Lifeline Inspection form
  → FormRenderer component + field types básicos
  → SectionRenderer con C/NC toggle
  → PhotoField component
  → Página /field-execution/[id]/checklist

Wave 3 (Día 5-6): Work Planning + CCTV templates
  → work-planning.template.json seed
  → ctv-maintenance.template.json seed
  → Tablas dinámicas en FormRenderer (materiales × cantidad)
  → SignatureField component

Wave 4 (Día 7): Ladder Anchor Photos + PDF export
  → ladder-anchor-photos.template.json seed
  → Export template instance → PDF
  → Vincular al paso 6 del flujo (ExecutionSession)

Wave 5 (Día 8-9): Portal histórico + pruebas
  → Admin portal: listar/descargar histórico
  → Test: crear template, llenar instancia, exportar PDF
  → Gates: typecheck, lint, build, test
```

## 8. GATES

```bash
npm run typecheck  # 0 errors
npm run lint       # 0 errors
npm run build      # 5/5
npm run test       # existing + new template tests passing
```

## 9. ARCHIVOS A MODIFICAR/CREAR

```
CREATE packages/shared-types/src/schemas/dynamic-template/index.ts
CREATE packages/shared-types/src/schemas/dynamic-template/dynamic-template.schema.ts
CREATE packages/shared-types/src/schemas/dynamic-template/template-instance.schema.ts
CREATE packages/shared-types/src/schemas/dynamic-template/field-types.ts
CREATE backend/src/models/DynamicTemplate.ts
CREATE backend/src/models/TemplateInstance.ts
CREATE backend/src/routes/templates.ts
CREATE backend/src/routes/template-instances.ts
CREATE backend/src/services/template.service.ts
CREATE backend/src/templates/lifeline-inspection.template.json
CREATE backend/src/templates/work-planning.template.json
CREATE backend/src/templates/ctv-maintenance.template.json
CREATE backend/src/templates/ladder-anchor-photos.template.json
CREATE backend/src/seed/templates.seed.ts
CREATE frontend/components/dynamic-form/FormRenderer.tsx
CREATE frontend/components/dynamic-form/SectionRenderer.tsx
CREATE frontend/components/dynamic-form/fields/index.ts
CREATE frontend/components/dynamic-form/fields/TextField.tsx
CREATE frontend/components/dynamic-form/fields/NumberField.tsx
CREATE frontend/components/dynamic-form/fields/SelectField.tsx
CREATE frontend/components/dynamic-form/fields/CheckboxField.tsx
CREATE frontend/components/dynamic-form/fields/PhotoField.tsx
CREATE frontend/components/dynamic-form/fields/SignatureField.tsx
CREATE frontend/components/dynamic-form/fields/DateField.tsx
CREATE frontend/app/(dashboard)/field-execution/[id]/checklist/page.tsx
MODIFY backend/src/app.ts (registrar rutas)
MODIFY backend/src/seed/index.ts (agregar templates seed)
PENDING  frontend/app/(dashboard)/admin/historical/page.tsx (Wave 5)
```

## 10. RIESGOS

- Template JSON seed necesita migración si cambia schema → usar mismo migration system existente
- PhotoField necesita cámara nativa en PWA → verificar si ya está implementada en existing evidence upload
- Offline: FormRenderer necesita IndexedDB wrapper → reusar existing offline sync
- PDF export de instancias → reusar existing pdf-lib engine
