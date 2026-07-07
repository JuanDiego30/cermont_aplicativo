# DOC-CANON-06 — Sistema Documental y Motor de Costos

**Proyecto:** Cermont S.A.S. — Plataforma documental-operativa
**Version:** v2.1 canónica ampliada para ejecución IA/Codex
**Estado:** SOURCE_OF_TRUTH + ANEXO v2.1 operativo
**Compresion:** DOC-07B (sistema documental) + DOC-07 (cost engine) + DOC-22 (cierre brechas)

---

## Parte I — Sistema Documental (Document-Driven Forms)

### 1. Vision

El sistema documental de Cermont transforma los formatos fisicos existentes (PDF, Excel, Word) en formularios digitales que los tecnicos pueden diligenciar en campo con soporte offline. El proceso sigue el principio "document-driven":

```text
Documento real (PDF/Excel/Word/Foto)
  → Ingesta digital
  → Deteccion de campos, tablas, checklists, firmas
  → Revision humana
  → Plantilla versionada
  → Formulario dinamico (online/offline)
  → Captura en campo
  → Informe/Acta/PDF generado
  → Cierre administrativo
```

### 2. Entidades Principales

| Entidad | Proposito |
|---|---|
| `DocumentImport` | Registro de archivo subido para analisis |
| `DocumentTemplate` | Plantilla versionada de formulario dinamico |
| `TemplateResponse` | Respuesta capturada de un tecnico usando plantilla |
| `GeneratedDocument` | PDF/Word generado a partir de respuesta |
| `DocumentFile` | Archivo almacenado (origen o generado) |

### 3. Tipos de Campo Soportados

```typescript
type FieldType =
  | "text"              // Campo de texto corto
  | "textarea"          // Campo de texto largo
  | "number"            // Numero entero o decimal
  | "date"              // Fecha
  | "select"            // Seleccion unica
  | "multiSelect"       // Seleccion multiple
  | "checkbox"          // Casilla individual
  | "checklist"         // Lista de verificacion (C/NC/NA)
  | "table"             // Tabla editable
  | "photo"             // Foto con caption
  | "signature"         // Firma digital (canvas)
  | "gps"               // Coordenadas geograficas
  | "costLine"          // Linea de costo con calculo
  | "materialList"      // Lista de materiales
  | "toolList"          // Lista de herramientas
  | "equipmentList"     // Lista de equipos
  | "safetyElementList" // Elementos de seguridad
  | "workerCount"       // Conteo de trabajadores
```

### 4. Maquina de Estados: DocumentImport

```
+-----------+   upload()   +------------+   detect()   +-------------+
| uploaded  +------------->+ detecting  +------------->+  detected   |
+-----------+              +------------+              +------+------+
                                                         |      | review()
                                                         |      v
                                                         |  +---+--------+
                                                         |  |  reviewed  |
                                                         |  +---+--------+
                                                         |      | approveFields()
                                                         |      v
                                                         |  +---+--------+
                                                         +->+  approved  |
                                                            +---+--------+
                                                                | createTemplate()
                                                                v
                                                           +----+-------+
                                                           | template_  |
                                                           |  created   |
                                                           +------------+
```

### 5. Maquina de Estados: DocumentTemplate

```
+-----------+   publish()   +------------+   deprecate()   +-------------+
|   draft   +-------------->+  published  +--------------->+  deprecated  |
+-----------+               +-------------+                +--------------+
       |                          |                              |
       | edit()                   | edit()                       |
       v                          v                              |
  +----+----+               +-----+------+                       |
  | edited  +-------------->+ new version|                       |
  +---------+               +------------+                       |
```

**Regla clave:** Las versiones publicadas son **inmutables**. Para cambiar se crea nueva version.

### 6. Flujo de Ingesta (Paso a Paso)

#### Paso 1: Subida de Archivo

```typescript
// POST /api/document-imports
const response = await apiClient.post("/document-imports", {
  file: File,           // Archivo PDF/Excel/Word
  businessUnit: "electricidad",  // Unidad de negocio
  workflowStep: "planning",      // Etapa del flujo
  name: "Formato de Planeacion de Obra v3",
  description: "Formato usado para planeacion de trabajos de electricidad",
})
```

Validaciones:
- MIME type permitido: `application/pdf`, `application/vnd.openxmlformats-officedocument.*`, `image/*`
- Tamano maximo: 25 MB
- Se calcula hash SHA-256 para deduplicacion

#### Paso 2: Deteccion Automatica

El sistema analiza el documento y detecta:

```typescript
interface DetectedField {
  id: string                    // ID unico del campo
  type: FieldType               // Tipo detectado
  label: string                 // Etiqueta (extraida del documento)
  originalPosition: {            // Ubicacion en documento original
    page: number
    x: number
    y: number
  }
  suggestedValidation?: {
    required?: boolean
    pattern?: string
    min?: number
    max?: number
  }
  confidence: number            // 0.0 - 1.0
}
```

Algoritmo de deteccion:
1. Extraer texto del PDF (OCR si es imagen escaneada)
2. Analizar estructura: encabezados, tablas, campos de formulario
3. Mapear a tipos de campo conocidos
4. Calcular confianza por campo

#### Paso 3: Revision Humana

El usuario revisa los campos detectados:

```typescript
// POST /api/document-imports/:id/review
const response = await apiClient.post(`/document-imports/${importId}/review`, {
  fields: [
    {
      id: "f_001",
      type: "text",
      label: "Responsable de la Obra",
      required: true,
      section: "Datos Generales",
    },
    {
      id: "f_002",
      type: "date",
      label: "Fecha de Ejecucion",
      required: true,
      section: "Datos Generales",
    },
    {
      id: "f_003",
      type: "table",
      label: "Materiales",
      required: true,
      section: "Materiales",
      columns: ["Descripcion", "Cantidad", "Unidad", "Disponible"],
    },
    // ...
  ],
})
```

#### Paso 4: Creacion de Plantilla

```typescript
// POST /api/document-imports/:id/create-template
const response = await apiClient.post(`/document-imports/${importId}/create-template`, {
  name: "Formato de Planeacion de Obra",
  businessUnit: "electricidad",
  workflowStep: "planning",
})
```

La plantilla queda en estado `published` version `1.0.0`.

#### Paso 5: Uso del Formulario en Campo

El tecnico accede al formulario desde su dispositivo (funciona offline):

```typescript
// POST /api/template-responses
const response = await apiClient.post("/template-responses", {
  templateId: "tpl_123",
  templateVersion: "1.0.0",
  workOrderId: "wo_456",
  data: {
    f_001: "Juan Perez",
    f_002: "2026-05-15",
    f_003: [
      { descripcion: "Cable THW 12 AWG", cantidad: 100, unidad: "m", disponible: true },
      { descripcion: "Condulet", cantidad: 10, unidad: "und", disponible: true },
    ],
    // ...
  },
})
```

#### Paso 6: Generacion de Documento

```typescript
// POST /api/generated-documents
const response = await apiClient.post("/generated-documents", {
  templateResponseId: "tr_789",
  format: "pdf",  // o "docx"
})
```

### 7. Formularios Dinamicos Offline

El formulario dinamico se renderiza a partir de la plantilla:

```tsx
// components/dynamic-forms/DynamicForm.tsx
interface Props {
  template: DocumentTemplate
  onSubmit: (data: Record<string, unknown>) => void
  initialData?: Record<string, unknown>
}

export function DynamicForm({ template, onSubmit, initialData }: Props) {
  const { fields } = template.versions.find(v => v.isPublished)!
  const form = useForm({ defaultValues: initialData })

  const renderField = (field: TemplateField) => {
    switch (field.type) {
      case "text":
        return <input {...form.register(field.id, { required: field.required })} />
      case "textarea":
        return <textarea {...form.register(field.id, { required: field.required })} />
      case "number":
        return <input type="number" {...form.register(field.id, { required: field.required })} />
      case "date":
        return <input type="date" {...form.register(field.id, { required: field.required })} />
      case "select":
        return (
          <select {...form.register(field.id, { required: field.required })}>
            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )
      case "checklist":
        return <ChecklistField field={field} form={form} />
      case "table":
        return <TableField field={field} form={form} />
      case "photo":
        return <PhotoField field={field} form={form} />
      case "signature":
        return <SignatureField onSave={(data) => form.setValue(field.id, data)} />
      case "gps":
        return <GPSField field={field} form={form} />
      default:
        return <input {...form.register(field.id)} />
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map(field => (
        <div key={field.id} className="form-field">
          <label>{field.label} {field.required && "*"}</label>
          {renderField(field)}
        </div>
      ))}
      <button type="submit">Guardar</button>
    </form>
  )
}
```

### 8. Plantillas Documentales Demo (Seed)

El sistema debe incluir seed para estos formatos reales de Cermont:

#### 8.1 Formato de Planeacion de Obra

| Campo | Tipo | Seccion |
|---|---|---|
| Cliente | text | Datos Generales |
| Lugar | text | Datos Generales |
| Fecha | date | Datos Generales |
| Responsable | text | Datos Generales |
| Materiales | table | Recursos |
| Herramientas | table | Recursos |
| Equipos | table | Recursos |
| Elementos de Proteccion Personal | table | Seguridad |
| Firmas | signature | Firmas |

#### 8.2 Formato de Inspeccion de Linea de Vida Vertical

| Campo | Tipo | Seccion |
|---|---|---|
| Fecha | date | Datos Generales |
| Ubicacion | text | Datos Generales |
| Caracteristicas | textarea | Datos Generales |
| Fabricante | text | Datos Generales |
| Condicion | checklist | Evaluacion |
| Hallazgos | textarea | Evaluacion |
| Fotos | photo | Evidencias |
| Firmas | signature | Firmas |

#### 8.3 Formato de Mantenimiento CCTV

| Campo | Tipo | Seccion |
|---|---|---|
| Fecha | date | Datos Generales |
| Camara | text | Datos Generales |
| Limpieza de Lente | checklist | Rutina |
| Ajuste de Camara | checklist | Rutina |
| Sistema Electrico | checklist | Sistema |
| Video | checklist | Sistema |
| Fotos Antes | photo | Evidencias |
| Fotos Despues | photo | Evidencias |
| Firmas | signature | Firmas |

#### 8.4 Formato de Registro Fotografico

| Campo | Tipo | Seccion |
|---|---|---|
| Componente | text | Datos |
| Descripcion | textarea | Datos |
| Foto Antes | photo | Evidencias |
| Foto Despues | photo | Evidencias |
| Observacion | textarea | Observaciones |
| Firmas | signature | Firmas |

---

## Parte II — Motor de Costos (Cost Engine)

### 1. Vision

El motor de costos captura, categoriza y audita los costos de cada orden de trabajo, comparandolos contra la propuesta aprobada para detectar variaciones.

### 2. Entidades Principales

| Entidad | Proposito |
|---|---|
| `CostCatalogItem` | Item configurable del catalogo de costos |
| `CostCart` | Carrito de costos de una orden |
| `CostLine` | Linea individual de costo |
| `CostVariance` | Variacion entre costo estimado y real |

### 3. Categorias Configurables

Las categorias de costo son configurables, no hardcodeadas:

```typescript
type CostCategory =
  | "material"           // Materiales consumidos
  | "labor"              // Mano de obra
  | "tool"               // Herramientas
  | "equipment"          // Equipos
  | "transport"          // Transporte
  | "subcontract"        // Subcontratos
  | "administrative"     // Gastos administrativos
  | "tax"                // Impuestos
  | "contingency"        // Contingencias
```

**Nota:** No incluir IVA ni retenciones como categorias obligatorias. Estos deben ser configurables por negocio.

### 4. Catalogo de Costos

```typescript
interface CostCatalogItem {
  id: string
  category: CostCategory
  item: string           // "Cable THW 12 AWG", "Tecnico electricista"
  unit: string           // "metro", "hora", "dia"
  unitPrice?: number     // Precio base de referencia
  description?: string
  isActive: boolean
  createdAt: string
}
```

### 5. Linea de Costo

```typescript
interface CostLine {
  id: string
  costCartId: string
  category: CostCategory
  item: string
  quantity: number
  unit: string
  unitPrice: number
  subtotal: number       // Calculado: quantity * unitPrice
  currency: string

  // Soporte/evidencia
  supportDocumentId?: string  // Archivo soporte (factura, comprobante)
  evidenceId?: string         // Evidencia asociada

  // Contexto
  workOrderId: string
  executionSessionId?: string // Si fue durante ejecucion

  // Baseline (referencia)
  baselineUnitPrice?: number   // Precio estimado en propuesta
  baselineQuantity?: number    // Cantidad estimada
  baselineSubtotal?: number    // Subtotal estimado

  createdBy: string
  createdAt: string
}
```

### 6. Carrito de Costos (CostCart)

```typescript
interface CostCart {
  id: string
  workOrderId: string

  // Lineas
  lines: CostLine[]

  // Totales calculados
  totalEstimated: number   // Suma de baselines
  totalActual: number      // Suma de costos reales
  totalVariance: number    // totalActual - totalEstimated
  variancePercent: number  // (totalVariance / totalEstimated) * 100

  // Por categoria
  summaryByCategory: Array<{
    category: CostCategory
    estimated: number
    actual: number
    variance: number
  }>

  createdAt: string
  updatedAt: string
}
```

### 7. Flujo de Costos

```text
1. Propuesta aprobada
   → Se crea CostCart con baseline (precios estimados)

2. Ejecucion en campo
   → Tecnico registra materiales usados
   → Supervisor aprueba costos
   → Se agregan CostLine al CostCart

3. Comparacion automatica
   → Al agregar cada linea, se calcula variacion vs baseline
   → Si variacion > umbral (ej: 10%), se marca como alerta

4. Dashboard
   → Se muestra variacion por categoria
   → Se resaltan costos sin soporte
   → Se alertan desviaciones mayores
```

### 8. Reglas de Negocio

1. **Categorias configurables:** El admin define que categorias existen y si son obligatorias
2. **Sin impuestos hardcodeados:** IVA, retenciones, etc. son configurables
3. **Soporte obligatorio para costos grandes:** Costos mayores a un umbral requieren archivo de soporte
4. **Costos sin evidencia auditados:** Se marcan con advertencia
5. **Variaciones alertadas:** Si costo real > estimado + umbral, se alerta
6. **Append-only:** Las lineas de costo no se borran, se anulan con linea negativa si es necesario

### 9. Endpoints de Costos

```text
GET    /api/cost-catalog               → Lista catalogo
POST   /api/cost-catalog               → Crear item de catalogo
PUT    /api/cost-catalog/:id           → Actualizar item
DELETE /api/cost-catalog/:id           → Desactivar item

GET    /api/orders/:id/costs           → Ver CostCart de orden
POST   /api/orders/:id/costs           → Agregar lineas de costo
PUT    /api/cost-lines/:id             → Actualizar linea
DELETE /api/cost-lines/:id             → Anular linea (no borrar)

GET    /api/orders/:id/cost-variance   → Ver variacion vs propuesta
```

### 10. UI de Costos

```
+-------------------------------------------------------------+
|  COSTOS: Orden WO-0045                                      |
+-------------------------------------------------------------+
|                                                             |
|  Estimado: $12,450,000    Real: $13,890,000    Var: +11.6%|
|  [=========|=======|===========]                            |
|  materials  labor    equipment                              |
|                                                             |
+-------------------------------------------------------------+
|  LINEAS DE COSTO          |  SOPORTE  |  VARIACION          |
+-------------------------------------------------------------+
|  Cable THW 12 AWG         | [PDF]     | +8%  (alerta)       |
|  Tecnico electricista     | [PDF]     | +2%                 |
|  Camioneta operativa      | [SIN]     | +15% (CRITICO)      |
|  ...                      |           |                     |
+-------------------------------------------------------------+
|  [+ Agregar linea de costo]                                 |
+-------------------------------------------------------------+
```

---

## 10. Cierre de Brechas Documental y Financiero

### 10.1 Gaps Identificados y Soluciones

| Gap | Estado Actual | Solucion en Plataforma |
|---|---|---|
| No hay sistema documental | Excel, papel, PDF sueltos | Document-driven forms con versionado |
| No hay cost tracking | Costos en hojas separadas | Cost Cart por orden con variacion vs propuesta |
| Informes manuales | Digitados a mano | Generacion automatica desde ejecucion |
| Facturacion sin SES | Facturan sin SES aprobada | Pipeline: SES → Factura → Pago |
| Costos sin soporte | No hay comprobantes | Archivo soporte obligatorio por linea |
| Estados inmutables | No se sabe en que va cada trabajo | ServiceCase con FSM y blockers en tiempo real |

### 10.2 Criterios de Madurez

| Nivel | Descripcion |
|---|---|
| 0 | Documentos fisicos, Excel, fotos sueltas, sin trazabilidad |
| 1 | Documentos registrados con tipo, unidad de negocio, version |
| 2 | Subida de PDF/Excel con metadata y hash |
| 3 | Deteccion automatica de campos, tablas, checklists, firmas |
| 4 | Revision humana y construccion de plantillas versionadas |
| 5 | Captura en campo online/offline con sincronizacion |
| 6 | Generacion de entregables (informes, actas, PDFs) |
| 7 | Cierre administrativo trazable: SES → Factura → Pago |

---

## 11. Implementacion

### Fase A: Sistema Documental (Semanas 16-17)

- [ ] CRUD de DocumentImport con upload
- [ ] Deteccion de campos (basica: texto, tablas, checkboxes)
- [ ] Revision humana de campos detectados
- [ ] CRUD de DocumentTemplate con versionado
- [ ] Formulario dinamico renderizado desde plantilla
- [ ] Soporte offline para formularios
- [ ] Generacion de PDF basico desde respuesta
- [ ] Seed con formatos reales de Cermont
- [ ] Tests: unitarios + integracion + E2E

### Fase B: Motor de Costos (Semanas 14-15, paralelo con dashboard)

- [ ] CRUD de CostCatalogItem
- [ ] CRUD de CostCart y CostLine
- [ ] Calculo de variacion vs baseline
- [ ] Alertas de desviacion
- [ ] Archivo de soporte por linea
- [ ] Dashboard de costos
- [ ] Tests: unitarios + integracion

### Fase C: Cierre de Brechas (Semanas 18-19)

- [ ] Pipeline SES → Factura → Pago con validaciones
- [ ] Alerta de facturas sin SES
- [ ] Alerta de pagos sin factura
- [ ] Bloqueadores en ServiceCase
- [ ] E2E completo de flujo documental
- [ ] E2E completo de flujo financiero
---

# ANEXO v2.1 — Cierre de puntos ciegos para agentes IA/Codex

> **Prevalencia normativa:** si alguna sección anterior de este documento contradice este anexo, prevalece el **ANEXO v2.1**.  
> **Propósito:** convertir la documentación canónica en un plano arquitectónico ejecutable, verificable y sin ambigüedades para agentes IA/Codex.  
> **Regla base:** ningún agente puede declarar una función como implementada si no aporta **archivo + endpoint/contrato/componente + prueba + evidencia**.


## 1. Niveles de extracción documental

| Nivel | Nombre | Descripción | Estado recomendado |
|---:|---|---|---|
| 0 | Biblioteca documental | subir, clasificar, seleccionar y asociar documentos | MVP obligatorio |
| 1 | Formulario manual desde documento | usuario crea campos observando el documento | MVP obligatorio |
| 2 | Extracción básica | detectar texto, encabezados y tablas simples | MVP parcial |
| 3 | OCR escaneado | leer imágenes/PDF escaneados | Futuro |
| 4 | IA semántica | interpretar campos y proponer reglas | Futuro |

**Regla:** no fingir OCR/IA. Si el motor no existe, el sistema debe decir “requiere revisión manual”.

## 2. Pipeline documental ejecutable

```text
Upload
→ DocumentFile
→ DocumentImport
→ Parser básico
→ ExtractedDocumentLayout
→ TemplateDraft
→ HumanReview
→ DocumentTemplateVersion
→ DynamicForm
→ TemplateResponse
→ GeneratedDocument
→ Cierre administrativo
```

## 3. Diferencia por tipo de archivo

| Archivo | MVP | Futuro |
|---|---|---|
| Excel | detectar hojas, encabezados, tablas | fórmulas avanzadas |
| Word | extraer texto y secciones | layout preciso |
| PDF digital | extraer texto básico | tablas complejas |
| PDF escaneado | guardar + revisión manual | OCR |
| Imagen | evidencia o referencia | OCR/visión |

## 4. Campos dinámicos obligatorios

| Tipo | Uso |
|---|---|
| `text` | texto corto |
| `textarea` | observaciones |
| `number` | cantidades |
| `currency` | costos |
| `date` | fechas |
| `select` | selección única |
| `multi_select` | selección múltiple |
| `checklist` | C/NC/NA o cumple/no cumple |
| `table` | filas editables |
| `repeatable_group` | grupos repetibles |
| `file` | adjunto |
| `photo` | evidencia fotográfica |
| `signature` | firma |
| `gps` | coordenadas |
| `evidence_block` | bloque de evidencias |
| `calculated` | cálculo |
| `custom_option` | opción personalizada |

## 5. Otro / Personalizado

Todo campo `select`, `multi_select`, `checklist` o categoría debe permitir:

1. opciones predefinidas;
2. opción `Otro / Personalizado`;
3. input libre;
4. guardado temporal en la respuesta;
5. aprobación a catálogo si el rol lo permite;
6. auditoría de quién creó la opción.

## 6. Motor de costos sin $0 falso

No mostrar `$0` si no hay datos.

Estados de datos:

| Estado | Significado | UI |
|---|---|---|
| `NO_DATA` | no hay costos registrados | “Sin datos” |
| `ESTIMATED_ONLY` | solo propuesta | “Solo estimado” |
| `ACTUAL_ONLY` | solo real | “Sin línea base” |
| `ESTIMATED_AND_ACTUAL` | comparación válida | variación |
| `INVOICED` | facturado | valor factura |
| `PAID` | pagado | valor pagado |

El costo debe comparar:

```text
Propuesta estimada
vs Materiales reales
vs Mano de obra real
vs Equipos/herramientas
vs Facturado
vs Pagado
vs Margen/variación
```
