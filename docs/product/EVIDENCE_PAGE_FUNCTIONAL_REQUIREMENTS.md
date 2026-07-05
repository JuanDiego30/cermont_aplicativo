# Requerimientos Funcionales — Página de Evidencias (Resultados Finales)

**Fecha:** 2026-06-09  
**Versión:** 1.0  
**Estado:** BORRADOR  
**Empresa:** Cermont S.A.S.  
**Contexto:** Plataforma documental y operativa para contratistas multiservicio  
**Flujo asociado:** Paso 7 del pipeline de 14 pasos (Evidence → TechnicalReport)

---

## Tabla de Contenidos

1. [Propósito y Alcance](#1-propósito-y-alcance)
2. [Glosario](#2-glosario)
3. [Descripción General](#3-descripción-general)
4. [Requerimientos Funcionales del Usuario](#4-requerimientos-funcionales-del-usuario)
5. [Reglas de Negocio](#5-reglas-de-negocio)
6. [Diferenciación Resultado Final vs. Proceso](#6-diferenciación-resultado-final-vs-proceso)
7. [Especificaciones de Datos](#7-especificaciones-de-datos)
8. [Flujo de Interacción](#8-flujo-de-interacción)
9. [Estados de la UI](#9-estados-de-la-ui)
10. [Criterios de Aceptación](#10-criterios-de-aceptación)
11. [Dependencias y Bloqueadores](#11-dependencias-y-bloqueadores)
12. [Casos de Borde](#12-casos-de-borde)

---

## 1. Propósito y Alcance

### 1.1 Propósito

Definir los requerimientos funcionales y reglas de negocio para la **Página de Evidencias** del sistema Cermont S.A.S. Esta página permite a los usuarios cargar, clasificar y visualizar imágenes que representan el **resultado final del trabajo ejecutado** en una orden de servicio, estableciendo una separación clara y forzada por el sistema entre:

- **Evidencias de proceso** (documentación del avance durante la ejecución)
- **Evidencias de resultado final** (registro fotográfico del trabajo terminado)

### 1.2 Alcance

| Incluye | No incluye |
|---------|------------|
| Carga de archivos de imagen (JPG, PNG, WebP) | Carga de videos o documentos PDF |
| Asignación de título descriptivo por imagen | Edición masiva de evidencias |
| Campo de información adicional / descripción detallada | Procesamiento de imágenes (OCR, etiquetado automático) |
| Clasificación por fase de resultado final | Generación automática de informes desde evidencias |
| Captura de geolocalización | Integración con dispositivos de captura externos |
| Visualización en galería y tabla | Módulo de evidencias de proceso (existe en otra vista) |
| Filtrado por orden, búsqueda textual | Reconocimiento de objetos en imágenes |
| Soporte offline para captura en campo | Edición de metadatos EXIF |
| Sincronización automática al recuperar conectividad | Eliminación masiva de evidencias |

### 1.3 Audiencia

- **Operadores y técnicos**: Capturan evidencias en campo
- **Supervisores**: Validan que las evidencias correspondan a resultados finales
- **Residentes y gerentes**: Revisan y aprueban evidencias para generar informes
- **Clientes**: Visualizan evidencias de resultados finales de sus órdenes

---

## 2. Glosario

| Término | Definición |
|---------|------------|
| **Evidencia de proceso** | Imagen capturada durante la ejecución que documenta el método, los hallazgos intermedios, o el avance parcial. **No es objeto de esta página.** |
| **Evidencia de resultado final** | Imagen capturada al completar una etapa o el trabajo total, que muestra el estado final del activo, instalación o servicio. **Es el objeto exclusivo de esta página.** |
| **Fase (`phase`)** | Clasificación temporal de la evidencia respecto al ciclo de trabajo: `before`, `during`, `after`, `closure`. Esta página solo acepta `after` y `closure`. |
| **Categoría técnica (`technicalCategory`)** | Dominio específico del trabajo: `lineas_de_vida`, `cctv`, `anclajes`, `general`. |
| **Orden de trabajo (WorkOrder)** | Entidad que agrupa el trabajo a ejecutar. Las evidencias se asocian a una orden. |
| **Sesión de ejecución (ExecutionSession)** | Instancia concreta de ejecución en campo. Una orden puede tener múltiples sesiones. |
| **Código de evidencia (`code`)** | Identificador único generado por el sistema para cada evidencia (ej: `EVD-2026-00042`). |
| **clientMutationId** | UUID generado en cliente para garantizar idempotencia en sincronización offline. |

---

## 3. Descripción General

### 3.1 Contexto en el Flujo de 14 Pasos

```
Paso 5: PlanningPacket (aprobado)
    ↓
Paso 6: ExecutionSession (en curso)
    ↓
Paso 7: Evidence ← Esta página
    ├── Evidencias de proceso (otra vista / API existente)
    └── Evidencias de resultado final (Página de Evidencias - este documento)
    ↓
Paso 8: TechnicalReport (requiere evidencias verificadas)
```

### 3.2 Principio de Diseño

La página debe **guiar activamente** al usuario para que solo capture resultados finales, mediante:

1. Validación en el formulario de carga que fuerza la selección de fase `after` o `closure`
2. Etiquetado visual claro que distingue el propósito de la página
3. Imposibilidad técnica de subir evidencias catalogadas como `before` o `during` desde esta interfaz
4. Mensajes de confirmación que refuercen el propósito ("Evidencia de resultado final registrada correctamente")

### 3.3 Relación con Entidades Existentes

La evidencia se relaciona con el modelo `EvidenceSchemaV2` existente en `packages/shared-types/src/schemas/evidence.schema.ts`, utilizando los campos:

| Campo | Valor para resultado final |
|-------|---------------------------|
| `phase` | `"after"` o `"closure"` |
| `category` | Según el tipo de trabajo |
| `technicalCategory` | Según el dominio técnico |
| `description` | Descripción detallada |
| `photoLabel` | Título descriptivo (nuevo campo obligatorio) |
| `beforeAfter` | `"after"` |

---

## 4. Requerimientos Funcionales del Usuario

### RF-01: Selección de Orden de Trabajo

**Descripción:** El usuario debe poder seleccionar una orden de trabajo activa para asociar las evidencias.

**Criterios:**
- El selector de orden debe mostrar órdenes en estado `in_progress` o `assigned`
- Debe mostrar el código de orden y nombre del activo/sitio
- Debe incluir búsqueda por código o nombre
- Si no hay órdenes disponibles, debe mostrar un mensaje informativo y un enlace a la página de órdenes
- La selección persiste en la URL como query param `?orderId=`

**UX:**
- Select con search (combobox) en desktop
- Lista seleccionable con búsqueda en móvil
- Label: "Orden de trabajo"
- Placeholder: "Selecciona una orden en ejecución"

### RF-02: Carga de Archivo de Imagen

**Descripción:** El usuario debe poder seleccionar y previsualizar una imagen desde su dispositivo antes de subirla.

**Criterios:**
- Formatos aceptados: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- Tamaño máximo: 10 MB por archivo
- Vista previa inmediata después de seleccionar el archivo
- Botón para quitar la imagen seleccionada y elegir otra
- Indicación visual del nombre del archivo y tamaño
- La selección debe funcionar tanto por clic como por arrastrar y soltar (drag & drop)

**Validaciones:**
- Si el archivo excede 10 MB: mostrar error toast "El archivo no debe superar 10MB"
- Si el formato no es válido: mostrar error toast "Formato no válido. Use JPG, PNG o WebP"
- Si no hay archivo seleccionado al enviar: mostrar error en el campo

**UX:**
- Zona de drop con borde punteado
- Icono de imagen como placeholder
- Texto: "Arrastra una imagen o haz clic para seleccionar"
- Subtítulo: "JPG, PNG, WebP — Máx 10MB"
- En móvil: touch target mínimo 44×44px en el área de carga

### RF-03: Asignación de Título Descriptivo

**Descripción:** Cada evidencia debe tener un título descriptivo obligatorio que indique qué muestra la imagen.

**Criterios:**
- Campo de texto obligatorio
- Máximo 200 caracteres
- Label: "Título"
- Placeholder: "¿Qué resultado final muestra esta evidencia?"
- Validación en cliente y servidor
- El título se almacena en el campo `photoLabel` del schema `EvidenceSchemaV2`
- Si el usuario intenta enviar sin título, mostrar: "Agrega un título descriptivo para esta evidencia"

**UX:**
- Input de texto simple
- Indicador de caracteres restantes (opcional pero recomendado)

### RF-04: Descripción Adicional

**Descripción:** El usuario puede agregar información adicional sobre lo capturado en la imagen.

**Criterios:**
- Campo de texto opcional
- Máximo 500 caracteres
- Label: "Descripción adicional"
- Placeholder: "Detalles del resultado final, observaciones técnicas, hallazgos…"
- Se almacena en el campo `description` del schema
- No debe duplicar información del título

**UX:**
- Textarea de 2-3 líneas de altura
- Redimensionable verticalmente

### RF-05: Clasificación por Categoría Técnica

**Descripción:** El usuario debe clasificar la evidencia según el dominio técnico del trabajo.

**Criterios:**
- Categorías disponibles: `lineas_de_vida`, `cctv`, `anclajes`, `general`
- Selección obligatoria
- Label: "Categoría técnica"
- Placeholder: "Selecciona una categoría"
- Se almacena en el campo `technicalCategory`

**UX:**
- Select nativo o Radix UI Select
- Cada opción con icono representativo (opcional)

### RF-06: Captura de Geolocalización

**Descripción:** El sistema debe permitir capturar coordenadas GPS del punto donde se tomó la evidencia.

**Criterios:**
- Botón "Capturar GPS" que solicita permisos de geolocalización al navegador
- Indicación visual del estado: idle, capturando, éxito, error
- Si el usuario deniega el permiso, mostrar mensaje: "Falla de GPS (requerido para fotos de campo)"
- Si se captura con éxito, mostrar: "Ubicación capturada: lat, lng" con indicador verde
- La ubicación se almacena en el campo `gpsLocation` (`lat`, `lng`, `accuracy`, `capturedAt`)

**UX:**
- Sección colapsable o inline dentro del formulario
- Texto pequeño indicando la importancia de la geolocalización para evidencia legal

### RF-07: Clasificación de Fase (Resultado Final)

**Descripción:** El usuario debe indicar si la evidencia corresponde al resultado final de una etapa o al cierre total.

**Criterios:**
- Opciones: `after` (Resultado final de etapa) | `closure` (Cierre total de la orden)
- Solo estas dos fases están disponibles en esta página
- Valor por defecto: `after`
- Se almacena en el campo `phase`

**UX:**
- Radix UI Radio Group o Select
- Breve descripción de cada opción
- Label: "Tipo de resultado"

### RF-08: Visualización en Galería

**Descripción:** Las evidencias subidas deben mostrarse en una vista de galería tipo grid.

**Criterios:**
- Grid responsive: 1 columna en móvil, 2 en tablet, 3 en escritorio
- Cada tarjeta muestra: imagen thumbnail, título, fase, fecha, categoría técnica
- Al hacer clic en una tarjeta, abrir modal con imagen en tamaño completo
- El modal debe mostrar: imagen, título, descripción, metadatos (fecha, ubicación, categoría, subido por)
- Las imágenes deben cargarse con lazy loading usando `next/image`
- Las imágenes deben servirse en variante `web` para rendimiento, con fallback a `original`

**UX:**
- Tarjetas con border-radius consistente con el design system
- Sombra suave
- Transiciones suaves al hover

### RF-09: Visualización en Tabla

**Descripción:** Las evidencias deben poder visualizarse en una vista de tabla para revisión rápida.

**Criterios:**
- Columnas: Título, Orden, Categoría, Fase, Fecha, Acciones (ver, eliminar si aplica)
- La tabla debe ser responsive: en móvil, mostrar como tarjetas
- Ordenable por columna (fecha, título)
- Las filas deben tener indicador visual de fase (`after` vs `closure`)

**UX:**
- Cabecera fija al hacer scroll
- Striped rows para legibilidad

### RF-10: Alternancia de Vista

**Descripción:** El usuario debe poder alternar entre vista galería y vista tabla.

**Criterios:**
- Toggle con iconos de grid y lista
- Estado persistido en URL como query param `?view=gallery|table`
- Default: galería
- Label: "Modo de visualización"

**UX:**
- Button group con iconos `LayoutGrid` y `Rows3` de lucide-react
- Estado activo con color azul Cermont

### RF-11: Filtro por Texto

**Descripción:** El usuario debe poder buscar evidencias por texto libre.

**Criterios:**
- Búsqueda en título, descripción y código de evidencia
- Debounce de 300ms antes de ejecutar la búsqueda
- Persistencia en URL como query param `?q=`

**UX:**
- Input con icono de lupa
- Placeholder: "Buscar por título o descripción"
- Botón "Limpiar" para resetear filtros

### RF-12: Filtro por Fase

**Descripción:** El usuario debe poder filtrar evidencias por fase (`after` o `closure`).

**Criterios:**
- Filtro tipo checkbox o select múltiple
- Por defecto: mostrar todas (ambas fases)
- Persistencia en URL como query param `?phase=after,closure`

**UX:**
- Radix UI Checkbox group o Select múltiple

### RF-13: Soporte Offline

**Descripción:** La captura de evidencias debe funcionar sin conexión a internet.

**Criterios:**
- Si el usuario no tiene conexión, la evidencia se almacena en IndexedDB (CermontOfflineDB) con estado `pending`
- Se genera un `clientMutationId` (UUID v4) para idempotencia
- Al recuperar conexión, la evidencia se sincroniza automáticamente
- El formulario de carga debe estar disponible offline (el componente no debe romperse)
- La cola offline debe mostrar estado visual (pendiente, sincronizando, sincronizado, fallido)
- Banner de sincronización visible cuando hay elementos pendientes

**UX:**
- Toast informativo al guardar offline: "Evidencia guardada para sincronizar cuando haya conexión"
- SyncBanner persistente con estado de la cola

### RF-14: Eliminación de Evidencia

**Descripción:** El usuario autorizado debe poder eliminar una evidencia.

**Criterios:**
- Solo gerentes, residentes, HES y supervisores pueden eliminar
- Eliminación lógica: establece `deletedAt` con `{ value: timestamp, set: true }`
- Confirmación antes de eliminar (modal o dialog)
- La evidencia eliminada no debe aparecer en galería ni tabla
- Deshacer no soportado en MVP (registro de auditoría como respaldo)

**UX:**
- Botón de eliminar en el modal de detalle o en acciones de tabla
- Icono de papelera (lucide `Trash2`)
- Modal de confirmación: "¿Eliminar esta evidencia?" con acciones "Cancelar" / "Eliminar"

### RF-15: Ver Detalle de Evidencia

**Descripción:** El usuario debe poder ver el detalle completo de una evidencia en un modal.

**Criterios:**
- Modal/dialog con imagen en tamaño completo
- Metadatos visibles: título, descripción, fase, categoría técnica, ubicación GPS (si existe), fecha de captura, fecha de subida, subido por
- Si la imagen no carga, mostrar placeholder de error
- Cerrar con Escape, clic fuera del modal o botón X

**UX:**
- Overlay semitransparente
- Animación de entrada (Framer Motion)
- Focus trap activo mientras el modal está abierto

---

## 5. Reglas de Negocio

### RN-01: Exclusividad de Resultado Final

**Regla:** Esta página **SOLO** acepta evidencias con `phase = "after"` o `phase = "closure"`.  
**Validación:**
- El formulario de carga no ofrece las opciones `before` o `during`
- El backend rechaza cualquier creación con fase `before` o `during` desde esta ruta específica
- Si una evidencia existente con fase `during` necesita promoverse a resultado final, debe ser re-cargada como `after`

### RN-02: Orden en Ejecución

**Regla:** Solo se puede subir evidencia a órdenes en estado `in_progress` o que hayan completado al menos una `ExecutionSession`.  
**Validación:**
- El selector de órdenes solo muestra órdenes que cumplan esta condición
- El backend verifica el estado de la orden antes de aceptar la evidencia
- Si la orden está en estado `open`, `assigned` o `completed`, mostrar mensaje correspondiente

### RN-03: Título Obligatorio

**Regla:** Toda evidencia debe tener un título descriptivo.  
**Validación:**
- Frontend: el botón de enviar se deshabilita si el título está vacío
- Backend: `photoLabel` es requerido en el schema de creación para esta página
- Si se intenta enviar sin título: "Agrega un título descriptivo para esta evidencia"

### RN-04: Máximo de Archivos

**Regla:** Se puede subir una imagen a la vez. No hay límite de evidencias por orden, pero se recomienda un máximo de 30 por orden para mantener rendimiento.  
**Validación:**
- El formulario permite un archivo por envío
- No hay límite estricto en backend, pero se debe mostrar advertencia si una orden supera 30 evidencias

### RN-05: Idempotencia Offline

**Regla:** La misma evidencia no debe duplicarse por reintento offline o doble clic.  
**Validación:**
- Cada carga genera un `clientMutationId` (UUID v4)
- El backend rechaza evidencias duplicadas basado en `clientMutationId`
- El botón de enviar se deshabilita después del primer clic hasta que la operación complete

### RN-06: RBAC por Acción

**Regla:** Las acciones disponibles dependen del rol del usuario. Basado en `@cermont/domain`.

| Acción | gerente | residente | HES | supervisor | operador | tecnico | admin | cliente |
|--------|---------|-----------|-----|------------|----------|---------|-------|---------|
| Subir evidencia | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver evidencias | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Solo propias |
| Eliminar evidencia | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver detalle | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Solo propias |

### RN-07: Vinculación con TechnicalReport

**Regla:** Las evidencias de resultado final son requisito para generar el TechnicalReport (Paso 8).  
**Validación:**
- No se puede aprobar un TechnicalReport si la orden no tiene al menos una evidencia con `phase = "after"` o `closure`
- El TechnicalReport debe incluir las evidencias de resultado final como anexo

### RN-08: Caducidad de Captura de GPS

**Regla:** La ubicación GPS debe capturarse en el momento de tomar la evidencia. No se aceptan coordenadas posteriores.  
**Validación:**
- El campo `gpsLocation.capturedAt` no puede diferir más de 5 minutos de `capturedAt` de la evidencia
- Se muestra advertencia si el GPS se capturó después de la imagen

### RN-09: Consistencia de Metadatos

**Regla:** No se permite modificar el título, descripción, fase o categoría de una evidencia después de subida.  
**Validación:**
- Las APIs de evidencia no exponen endpoints de actualización para estos campos
- Si el usuario necesita corregir, debe eliminar y volver a subir

### RN-10: Auditoría

**Regla:** Toda creación y eliminación de evidencia debe registrar un evento de auditoría.  
**Validación:**
- Evento `EVIDENCE_CREATED` con: userId, orderId, evidenceId, timestamp
- Evento `EVIDENCE_DELETED` con: userId, orderId, evidenceId, timestamp, motivo (opcional)

---

## 6. Diferenciación Resultado Final vs. Proceso

### 6.1 Criterios de Clasificación

| Criterio | Evidencia de Proceso | Evidencia de Resultado Final |
|----------|---------------------|------------------------------|
| **Fase** | `before`, `during` | `after`, `closure` |
| **Momento de captura** | Durante la ejecución | Al completar una etapa o el trabajo total |
| **Propósito** | Documentar método, hallazgos, avance | Mostrar estado final del activo/servicio |
| **Uso en informes** | Respaldar metodología | Anexar al informe técnico |
| **Visibilidad al cliente** | Restringida (solo equipo interno) | Visible al cliente |
| **Requiere título** | Opcional | **Obligatorio** |

### 6.2 Separación en la UI

La Página de Evidencias (Resultados Finales) debe diferenciarse visualmente de cualquier vista de evidencias de proceso mediante:

1. **Header específico**: "Evidencias del resultado final" (no ambiguo)
2. **Subtítulo**: "Registra imágenes del trabajo terminado para adjuntar al informe técnico"
3. **Color de acento**: Usar verde (`#4CAF50`) como color distintivo de esta sección (vs. el azul general)
4. **Badge de fase**: Cada tarjeta debe mostrar un badge "Resultado final" o "Cierre total"
5. **Validación de intención**: Si el sistema detecta que el usuario intenta subir una imagen de proceso (por ejemplo, una foto borrosa, de un proceso interno, o mal clasificada), no debe bloquear — pero debe mostrar un mensaje recordatorio: "¿Esta imagen corresponde al resultado final del trabajo?"

### 6.3 Prohibiciones

- ❌ No se pueden subir imágenes categorizadas como `before` o `during` desde esta página
- ❌ No se pueden re-clasificar evidencias de proceso como resultado final
- ❌ No se pueden asociar evidencias de resultado final a órdenes sin ExecutionSession completada
- ❌ No se permite la edición de metadatos después de la subida (RN-09)

---

## 7. Especificaciones de Datos

### 7.1 Schema Zod (EvidenceSchemaV2 — campos relevantes)

Basado en el schema existente en `packages/shared-types/src/schemas/evidence.schema.ts`.

```typescript
// Campos obligatorios para resultado final
export const FinalEvidenceCreateSchema = z.object({
  // Relaciones
  serviceCaseId: ObjectIdSchema,
  workOrderId: ObjectIdSchema.optional(),
  executionSessionId: ObjectIdSchema.optional(),

  // Clasificación forzada
  phase: z.enum(["after", "closure"]),  // Solo after o closure
  category: EvidenceCategorySchema,
  technicalCategory: TechnicalCategorySchema.optional(),

  // Metadatos de la imagen
  title: z.string().min(1).max(200),     // → photoLabel
  description: z.string().max(500).optional(),

  // Archivo
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive(),
  url: z.string().url(),

  // Geolocalización
  gpsLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().positive().optional(),
    capturedAt: z.string().datetime().optional(),
  }).optional(),

  // Offline
  clientMutationId: z.string().uuid(),
  syncStatus: z.enum(["pending", "syncing", "synced", "failed"]).default("pending"),

  // Auditoría
  uploadedBy: ObjectIdSchema,
  uploadedAt: z.string().datetime(),
  capturedAt: z.string().datetime(),
}).strict();
```

### 7.2 Endpoints API

Basado en la convención de la arquitectura existente.

| Método | Ruta | Propósito |
|--------|------|-----------|
| `POST` | `/api/evidences/final` | Crear evidencia de resultado final (valida phase=after\|closure) |
| `GET` | `/api/evidences/final?orderId=&page=&limit=` | Listar evidencias finales con paginación |
| `GET` | `/api/evidences/final/:id` | Obtener detalle de evidencia final |
| `DELETE` | `/api/evidences/final/:id` | Eliminación lógica de evidencia final |
| `POST` | `/api/upload/evidence` | Subir archivo de imagen (multipart) y devolver URL |

### 7.3 Query Keys

```typescript
// Query keys estables para TanStack Query
export const evidenceKeys = {
  all: ["final-evidences"] as const,
  list: (filters: EvidenceListQuery) => ["final-evidences", "list", filters] as const,
  detail: (id: string) => ["final-evidences", "detail", id] as const,
  byOrder: (orderId: string) => ["final-evidences", "order", orderId] as const,
};
```

---

## 8. Flujo de Interacción

### 8.1 Flujo Principal: Carga de Evidencia

```
1. Usuario navega a /evidences
2. Sistema verifica RBAC (ver RN-06)
3. Usuario selecciona una orden de trabajo del selector
4. Sistema carga la orden y sus ExecutionSessions
5. Usuario rellena el formulario:
   a. Título (obligatorio)
   b. Descripción adicional (opcional)
   c. Categoría técnica (obligatorio)
   d. Fase: "Resultado final de etapa" o "Cierre total"
   e. GPS: Captura ubicación (opcional pero recomendado)
   f. Archivo: Selecciona imagen
6. Usuario hace clic en "Subir evidencia"
7. Sistema valida:
   a. Título presente
   b. Archivo presente y formato válido
   c. Tamaño ≤ 10MB
   d. Orden activa
8. Si hay conexión:
   a. Sube imagen al servidor (POST /api/upload/evidence)
   b. Crea registro de evidencia (POST /api/evidences/final)
   c. Muestra toast de éxito
   d. Actualiza la lista de evidencias
9. Si no hay conexión:
   a. Guarda en IndexedDB con clientMutationId
   b. Muestra toast de guardado offline
   c. Encola para sincronización automática
10. Sistema limpia el formulario para próxima carga
```

### 8.2 Flujo de Visualización

```
1. Usuario selecciona orden (o llega con ?orderId= en URL)
2. Sistema carga evidencias de resultado final para esa orden
3. Si no hay evidencias:
   → Muestra empty state: "No hay evidencias de resultado final"
   → Botón/Call-to-action: "Subir primera evidencia"
4. Si hay evidencias:
   → Muestra en vista activa (galería o tabla)
   → Cada tarjeta/fila muestra metadatos clave
5. Usuario puede:
   → Alternar vista (galería ↔ tabla)
   → Filtrar por texto
   → Filtrar por fase (after/closure)
   → Hacer clic en una evidencia para ver detalle modal
   → Eliminar (si tiene permiso)
```

### 8.3 Flujo de Error

```
1. Error de carga:
   → Toast con mensaje descriptivo
   → El formulario conserva los datos ingresados
   → Botón de reintento disponible
2. Error de red:
   → Fallback offline automático
   → Toast informativo
   → La imagen queda en cola de sincronización
3. Error de servidor:
   → Mensaje de error específico (código + descripción)
   → Log de error en consola (solo dev)
   → Opción de reintentar
```

---

## 9. Estados de la UI

Cada componente de la página debe manejar los siguientes estados:

| Componente | Loading | Error | Empty | Success | Offline | Forbidden |
|------------|---------|-------|-------|---------|---------|-----------|
| Selector de orden | Skeleton | "Error al cargar órdenes" + reintentar | "No hay órdenes disponibles" + enlace | Lista de órdenes | Misma data en caché | Mensaje de permiso denegado |
| Formulario de carga | Spinner en botón | Toast de error | N/A | Formulario limpio | Banner offline + toast | N/A |
| Galería de evidencias | Skeleton grid | "No se pudieron cargar las evidencias" + reintentar | "No hay evidencias de resultado final" + CTA | Grid de tarjetas | Datos cacheados | Mensaje de permiso denegado |
| Tabla de evidencias | Skeleton rows | Mismo que galería | Mismo que galería | Filas de tabla | Datos cacheados | Mismo |
| Modal de detalle | Spinner | Placeholder de error de imagen | N/A | Imagen + metadatos | Misma data en caché | N/A |
| SyncBanner | N/A | N/A | Oculto | N/A | Visible con conteo | N/A |

### 9.1 Estados de Imagen

- **Cargando**: Placeholder con skeleton mientras se descarga la imagen
- **Error de carga**: Icono de imagen rota + texto "No se pudo cargar la imagen"
- **Offline**: Imagen desde caché del SW si está disponible
- **Eliminada**: No debe renderizarse (filtro en query)

---

## 10. Criterios de Aceptación

### CA-01: Carga Exitosa
Dado un usuario autenticado con rol operador  
Cuando selecciona una orden, completa título, selecciona imagen JPG válida y hace clic en "Subir evidencia"  
Entonces la imagen se sube, el registro se crea con `phase: "after"`, y la galería se actualiza

### CA-02: Rechazo de Fase Incorrecta
Dado un usuario en la página de evidencias de resultado final  
Cuando intenta enviar el formulario  
Entonces las únicas opciones de fase disponibles son "after" y "closure"

### CA-03: Título Obligatorio
Dado un usuario con imagen seleccionada  
Cuando intenta enviar sin título  
Entonces el botón de enviar está deshabilitado y se muestra validación "Agrega un título descriptivo"

### CA-04: Offline
Dado un usuario sin conexión a internet  
Cuando carga una evidencia  
Entonces se guarda en IndexedDB, se muestra toast de guardado offline, y se sincroniza automáticamente al recuperar conexión

### CA-05: RBAC
Dado un usuario con rol cliente  
Cuando navega a /evidences  
Entonces solo puede ver evidencias de sus propias órdenes, no puede subir ni eliminar

### CA-06: Filtros y Búsqueda
Dado un usuario viendo la galería de evidencias  
Cuando escribe en el campo de búsqueda  
Entonces la lista se filtra en tiempo real por título y descripción

### CA-07: Eliminación
Dado un usuario con rol gerente  
Cuando hace clic en eliminar en una evidencia  
Entonces se muestra confirmación, y al aceptar la evidencia desaparece de la lista

### CA-08: Galería Responsive
Dado un usuario en un dispositivo móvil (375px)  
Cuando ve la galería  
Entonces las tarjetas se muestran en 1 columna con touch targets de 44px mínimo

### CA-09: Verificación de Backend
Dado un request POST a `/api/evidences/final` con `phase: "during"`  
Cuando el servidor procesa el request  
Entonces responde con error 400: "Solo se permiten evidencias de resultado final (phase: after|closure)"

---

## 11. Dependencias y Bloqueadores

| # | Dependencia | Tipo | Bloquea | Estado |
|---|-------------|------|---------|--------|
| 1 | `EvidenceSchemaV2` en shared-types | Schema | Sí (debe incluir `photoLabel` como requerido) | ✅ Existe |
| 2 | `EvidencePhaseSchema` con valores `after` y `closure` | Schema | Sí | ✅ Existe |
| 3 | Endpoint `POST /api/upload/evidence` | Backend | Sí (necesario para subir archivos) | ⚠️ Verificar |
| 4 | Endpoint `GET /api/evidences/final` | Backend | Sí | ❌ Nuevo |
| 5 | `useOfflineEvidence` hook | Frontend | No (existe para evidencias generales) | ✅ Existe |
| 6 | `CermontOfflineDB` (Dexie/IndexedDB) | Frontend | No (existe) | ✅ Existe |
| 7 | Componentes UI: `Button`, `Dialog`, `Card` | Frontend | No (existen en `components/common/`) | ✅ Existen |
| 8 | `@cermont/domain` para permisos RBAC | Package | No (existe) | ✅ Existe |
| 9 | Endpoint `GET /api/orders?status=in_progress` | Backend | Sí (selector de órdenes) | ⚠️ Verificar |
| 10 | Imágenes procesadas con sharp (variants) | Backend | No (existe) | ✅ Existe |

---

## 12. Casos de Borde

### CB-01: Imagen corrupta o inválida

- **Escenario:** El usuario selecciona un archivo con extensión .jpg pero que no es una imagen válida
- **Respuesta:** El backend debe validar el MIME type real del archivo (no solo la extensión) usando `file-type` o `sharp`
- **UX:** Toast: "El archivo no es una imagen válida"

### CB-02: Usuario sin permisos de geolocalización

- **Escenario:** El usuario deniega el permiso de GPS o el navegador no lo soporta
- **Respuesta:** La carga no se bloquea, pero se muestra advertencia persistente
- **UX:** Badge naranja: "GPS no disponible — la evidencia no tendrá ubicación"

### CB-03: Conexión intermitente durante la carga

- **Escenario:** El usuario inicia la carga con conexión, pero se pierde durante la transferencia
- **Respuesta:** El sistema debe reintentar automáticamente hasta 3 veces, luego pasar a cola offline
- **UX:** Toast: "Conexión perdida — la evidencia se sincronizará automáticamente"

### CB-04: Múltiples cargas rápidas

- **Escenario:** El usuario hace clic varias veces en "Subir evidencia"
- **Respuesta:** El botón se deshabilita después del primer clic hasta que la operación complete
- **UX:** Botón disabled + spinner

### CB-05: Orden sin ExecutionSession

- **Escenario:** El usuario selecciona una orden que no tiene ninguna ExecutionSession completada
- **Respuesta:** El sistema debe mostrar mensaje y sugerir iniciar una sesión de ejecución
- **UX:** Tooltip o mensaje: "Esta orden no tiene sesiones de ejecución. Debes ejecutar el trabajo antes de subir evidencias del resultado."

### CB-06: Nombre de archivo duplicado

- **Escenario:** El usuario sube dos imágenes con el mismo nombre de archivo
- **Respuesta:** El backend debe generar un nombre único (timestamp + UUID) para evitar colisiones
- **UX:** No debe afectar al usuario

### CB-07: Evidencia de resultado final sin TechnicalReport posterior

- **Escenario:** El usuario sube evidencias pero nunca genera el TechnicalReport
- **Respuesta:** Las evidencias quedan disponibles pero el sistema debe recordar al usuario al navegar a /reports
- **UX:** Banner opcional: "Tienes X evidencias de resultado final sin informe técnico asociado"

### CB-08: Imagen con orientación incorrecta (EXIF)

- **Escenario:** La imagen fue tomada en vertical (retrato) pero se muestra rotada
- **Respuesta:** El backend debe procesar la imagen con sharp respetando los metadatos EXIF de orientación (`.rotate()`)
- **UX:** La imagen debe mostrarse en la orientación correcta en todos los navegadores

### CB-09: Usuario sin roles de campo

- **Escenario:** Un usuario con rol `administrativo` navega a /evidences
- **Respuesta:** La página carga pero el formulario de carga no se muestra
- **UX:** La galería está visible en modo solo lectura

### CB-10: Gran volumen de evidencias en una orden

- **Escenario:** Una orden tiene 100+ evidencias de resultado final
- **Respuesta:** La galería carga las primeras 20 con paginación o scroll infinito
- **UX:** Carga progresiva con lazy loading

---

## Apéndice A: Mapa de Archivos a Crear/Modificar

| Archivo | Acción | Propósito |
|---------|--------|-----------|
| `frontend/src/app/(dashboard)/evidences/page.tsx` | Modificar | Separar carga de resultado final vs proceso |
| `frontend/src/modules/evidences/ui/FinalEvidenceUploader.tsx` | Crear | Formulario específico para resultado final |
| `frontend/src/modules/evidences/hooks/useFinalEvidence.ts` | Crear | Hook TanStack Query para evidencias finales |
| `frontend/src/modules/evidences/queries.ts` | Modificar | Agregar query keys y funciones para final-evidences |
| `packages/shared-types/src/schemas/evidence.schema.ts` | Verificar | Asegurar que `photoLabel` está disponible |
| `backend/src/modules/evidence/` | Modificar | Agregar ruta/controlador/servicio para `/final` |
| `backend/src/routes/evidence.routes.ts` | Modificar | Registrar nueva ruta POST /evidences/final |
| `frontend/src/modules/evidences/model/` | Crear | Query keys, constantes, tipos específicos |
| `frontend/tests/modules/evidences/` | Modificar | Agregar tests para la nueva funcionalidad |
| `frontend/tests/e2e/evidence-flow.spec.ts` | Modificar | Agregar E2E para flujo de resultado final |

---

## Apéndice B: Referencias

- `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` — Entidad Evidence (paso 7), estados, RBAC
- `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` — Arquitectura general, contract-first, offline
- `docs/adr/ADR-004-evidence-blob-outbox.md` — Estrategia de almacenamiento de blobs
- `packages/shared-types/src/schemas/evidence.schema.ts` — Schema Zod existente
- `packages/shared-types/src/schemas/evidence-collection.schema.ts` — Schema de colección de evidencias
- `frontend/src/modules/evidences/` — Implementación frontend existente
- `backend/src/modules/evidence/` — Implementación backend existente
- `frontend/AGENTS.md` — Reglas de implementación frontend
- `packages/AGENTS.md` — Reglas de paquetes compartidos
- `docs/design/CERMONT_UIUX_GUIDE.md` — Guía de diseño UI/UX
- `docs/REGLAS_DESARROLLO_CERMONT.md` — Reglas de desarrollo de software
