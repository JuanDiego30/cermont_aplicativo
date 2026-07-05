# DOC-CANON-07 — Archivos, Evidencias y Almacenamiento

**Proyecto:** Cermont S.A.S. — Plataforma documental-operativa
**Version:** v2.1 canónica ampliada para ejecución IA/Codex
**Estado:** SOURCE_OF_TRUTH + ANEXO v2.1 operativo
**Compresion:** DOC-19 + DOC-12 (parte archivos) + DOC-15 (parte testing archivos)

---

## 1. Vision

El sistema debe gestionar toda clase de archivos de manera segura, auditable y escalable. Esto incluye evidencias fotograficas, documentos de soporte, certificados, plantillas, firmas digitales, y archivos generados (PDFs de informes y actas).

### Principios

1. **Seguridad:** Todos los archivos se escanean, se controla acceso por rol y se auditan
2. **Integridad:** Hash SHA-256 para verificar que el archivo no fue alterado
3. **Trazabilidad:** Cada archivo sabe a que entidad de negocio pertenece
4. **Escalabilidad:** Soporte para almacenamiento local (dev), VPS y S3-compatible
5. **Offline:** Las evidencias se capturan sin conexion y se sincronizan despues

---

## 2. Entidad DocumentFile

```typescript
interface DocumentFile {
  id: string                    // UUID generado por el sistema

  // Archivo
  originalName: string          // Nombre original (ej: "foto_evidencia.jpg")
  storedName: string            // Nombre interno seguro (UUID) + extension
  extension: string             // jpg, png, pdf, docx, xlsx
  mimeType: string              // image/jpeg, application/pdf, etc.
  sizeBytes: number             // Tamano en bytes
  sha256: string                // Hash de integridad

  // Almacenamiento
  storageProvider: "local" | "vps" | "s3-compatible"
  storagePath: string           // Ruta relativa al storage root
  url: string                   // URL publica o firmada

  // Quien y cuando
  uploadedBy: string            // User ID
  uploadedAt: string            // ISO 8601

  // Negocio
  businessEntityType?: string   // workOrder, evidence, certificate, etc.
  businessEntityId?: string     // ID de la entidad asociada

  // Seguridad y control
  visibility: "private" | "internal" | "client_visible"
  status: "uploaded" | "validated" | "rejected" | "archived"
  scanStatus: "pending" | "clean" | "infected" | "not_available"

  // Soft delete
  deletedAt?: string
  deletedBy?: string

  createdAt: string
  updatedAt: string
}
```

---

## 3. Tipos de Archivo y Configuracion

### 3.1 Tipos MIME Permitidos

```typescript
const ALLOWED_MIME_TYPES = [
  // Imagenes
  "image/jpeg",
  "image/png",
  "image/webp",
  // Documentos
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Texto
  "text/plain",
  "text/csv",
] as const
```

### 3.2 Limites

```typescript
const UPLOAD_LIMITS = {
  maxFileSize: 25 * 1024 * 1024,  // 25 MB por archivo
  maxFilesPerUpload: 10,           // Maximo 10 archivos simultaneos
  maxTotalUpload: 100 * 1024 * 1024, // 100 MB total por request
}
```

### 3.3 Tipos de Archivo por Proposito

| Proposito | Extensiones | Max Size | Visibilidad |
|---|---|---|---|
| Evidencia fotografica | jpg, png, webp | 25 MB | client_visible |
| Documento soporte | pdf, docx, xlsx | 25 MB | internal |
| Plantilla de documento | pdf, xlsx, docx | 25 MB | internal |
| Firma digital | png | 5 MB | internal |
| Certificado | pdf | 25 MB | internal |
| Comprobante de pago | pdf, png | 25 MB | private |
| Factura | pdf | 25 MB | internal |
| Informe generado | pdf | 50 MB | client_visible |
| Acta de entrega | pdf | 50 MB | client_visible |

---

## 4. Arquitectura de Almacenamiento

### 4.1 Estrategia Multi-Provider

```text
+----------------+     +------------------+     +-----------------+
|  Desarrollo    |     |   Produccion VPS  |     |  S3-compatible  |
|  Local FS      |     |   (almacenar en  |     |  (futuro)       |
|  ./storage/    |     |    /var/cermont)  |     |                 |
+----------------+     +------------------+     +-----------------+
```

### 4.2 Configuracion por Entorno

```env
# Desarrollo
STORAGE_PROVIDER=local
STORAGE_ROOT=./storage

# Produccion VPS
STORAGE_PROVIDER=vps
STORAGE_ROOT=/var/cermont/storage

# Futuro: S3-compatible
# STORAGE_PROVIDER=s3-compatible
# S3_ENDPOINT=https://s3.cermont.co
# S3_BUCKET=cermont-documents
# S3_ACCESS_KEY=xxx
# S3_SECRET_KEY=xxx
```

### 4.3 Estructura de Carpetas (Local/VPS)

```text
/var/cermont/storage/
├── evidence/              # Evidencias fotograficas
│   ├── 2026/
│   │   ├── 05/
│   │   │   └── ev_xxxx.jpg
├── documents/             # Documentos de soporte
│   ├── po/
│   ├── ses/
│   ├── invoices/
│   └── certificates/
├── signatures/            # Firmas digitales
│   └── sig_xxxx.png
├── templates/             # Plantillas documentales
│   └── tpl_xxxx.pdf
├── reports/               # Informes generados
│   └── rpt_xxxx.pdf
├── uploads/               # Uploads temporales (scan pendiente)
│   └── tmp_xxxx.pdf
└── scans/                 # Resultados de escaneo
    └── clean/
```

### 4.4 Nomenclatura de Archivos Almacenados

```
{entityType}_{uuid}.{extension}

Ejemplos:
evidence_a1b2c3d4.jpg       → Evidencia fotografica
signature_e5f6g7h8.png      → Firma digital
report_i9j0k1l2.pdf         → Informe generado
document_m3n4o5p6.pdf       → Documento de soporte
```

---

## 5. Pipeline de Upload

### 5.1 Flujo Completo

```text
1. Frontend selecciona archivo
   → Validacion local: tipo MIME, tamano

2. Frontend envia al backend
   → POST /api/files (multipart/form-data)
   → Headers: X-Entity-Type, X-Entity-Id

3. Backend valida
   → Tipo MIME permitido
   -> Tamano dentro de limites
   → Usuario autenticado y autorizado

4. Backend almacena temporalmente
   → Guarda en ./storage/uploads/tmp_xxx

5. Backend calcula hash SHA-256
   → Verificacion de integridad

6. Backend escanea (si antivirus configurado)
   → ClamAV u otro motor de escaneo
   → Resultado: clean, infected, not_available

7. Backend mueve a destino final
   → ./storage/evidence/ o ./storage/documents/
   → Nombre seguro: {entityType}_{uuid}.{ext}

8. Backend persiste en MongoDB
   → DocumentFile con toda la metadata

9. Backend responde al frontend
   → { id, url, originalName, sizeBytes, status }

10. Frontend actualiza UI
    → Muestra preview, permite eliminar o reemplazar
```

### 5.2 Endpoint de Upload

```typescript
// POST /api/files
// Content-Type: multipart/form-data

// Request:
// - file: Binary
// - entityType: string (workOrder, evidence, certificate, etc.)
// - entityId: string
// - visibility: "private" | "internal" | "client_visible"

// Response:
{
  "success": true,
  "data": {
    "id": "file_abc123",
    "originalName": "foto_evidencia.jpg",
    "storedName": "evidence_a1b2c3d4.jpg",
    "extension": "jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 2048576,
    "sha256": "a3f5c8...",
    "url": "/api/files/file_abc123/download",
    "status": "validated",
    "scanStatus": "clean",
    "uploadedAt": "2026-05-15T10:30:00Z"
  }
}
```

### 5.3 Componente FileUpload (Frontend)

```tsx
// components/files/FileUpload.tsx
"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { apiClient } from "@/lib/apiClient"

interface Props {
  entityType: string
  entityId: string
  visibility?: "private" | "internal" | "client_visible"
  onUpload: (files: DocumentFile[]) => void
  maxFiles?: number
}

export function FileUpload({ entityType, entityId, visibility = "internal", onUpload, maxFiles = 10 }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    const uploaded: DocumentFile[] = []

    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("entityType", entityType)
      formData.append("entityId", entityId)
      formData.append("visibility", visibility)

      try {
        const result = await apiClient.post("/files", formData, {
          headers: {},  // Content-Type se maneja automaticamente
        })
        uploaded.push(result)
      } catch (error) {
        console.error("Upload failed:", error)
      }
    }

    setUploading(false)
    onUpload(uploaded)
  }, [entityType, entityId, visibility, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: 25 * 1024 * 1024,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? "border-[--cermont-blue] bg-blue-50" : "border-[--hairline] hover:border-[--cermont-blue]"
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="w-10 h-10 text-[--steel] mx-auto mb-3" />
      {uploading ? (
        <p className="text-body-sm text-[--cermont-blue]">Subiendo archivos...</p>
      ) : (
        <>
          <p className="text-body-sm text-[--ink]">
            {isDragActive ? "Suelta los archivos aqui" : "Arrastra archivos o haz clic para seleccionar"}
          </p>
          <p className="text-caption text-[--steel] mt-1">
            Maximo {maxFiles} archivos, 25 MB cada uno
          </p>
        </>
      )}
    </div>
  )
}
```

---

## 6. Sistema de Evidencias

### 6.1 Vision

Las evidencias son el componente critico del flujo operativo. Cada foto, firma, coordenada GPS y documento de soporte que se captura en campo se convierte en una `Evidence` vinculada a una `WorkOrder`.

### 6.2 Tipos de Evidencia

| Tipo | Descripcion | Cuando Usar |
|---|---|---|
| `before` | Foto "antes" del trabajo | Antes de iniciar trabajo |
| `during` | Foto "durante" el trabajo | Mientras se ejecuta |
| `after` | Foto "despues" del trabajo | Al finalizar trabajo |
| `issue` | Evidencia de un problema | Cuando se encuentra un hallazgo |
| `support` | Documento de soporte | Facturas, comprobantes, POs |
| `signature` | Firma digital | Actas, autorizaciones |
| `gps` | Coordenadas geograficas | Ubicacion automatica |

### 6.3 Entidad Evidence

```typescript
interface Evidence {
  id: string
  workOrderId: string
  executionSessionId?: string

  // Archivo
  documentFileId: string           // Referencia a DocumentFile
  documentFile?: DocumentFile

  // Metadata
  evidenceType: "before" | "during" | "after" | "issue" | "support" | "signature" | "gps"
  caption: string
  capturedAt: string               // ISO 8601
  capturedBy: string               // User ID

  // GPS
  gps?: {
    latitude: number
    longitude: number
    accuracy?: number               // Precision en metros
  }

  // Offline
  offlineSyncState: "pending" | "syncing" | "synced" | "failed" | "conflict"
  clientMutationId?: string         // Para idempotencia

  // Control
  isClientVisible: boolean          // Si el cliente puede verla
  status: "draft" | "submitted" | "approved" | "rejected" | "archived"

  createdAt: string
}
```

### 6.4 Captura de Evidencia Offline

```typescript
// hooks/useEvidenceCapture.ts
export function useEvidenceCapture(workOrderId: string) {
  const [isCapturing, setIsCapturing] = useState(false)
  const { saveEvidence } = useOfflineEvidence()

  const capturePhoto = useCallback(async (file: File, caption: string) => {
    setIsCapturing(true)
    try {
      // Obtener GPS si esta disponible
      const gps = await getCurrentPosition().catch(() => undefined)

      const evidenceId = await saveEvidence({
        workOrderId,
        file,
        type: "during",
        caption,
        gps,
        capturedBy: currentUser.id,
      })

      return evidenceId
    } finally {
      setIsCapturing(false)
    }
  }, [workOrderId, saveEvidence])

  return { capturePhoto, isCapturing }
}
```

### 6.5 Galeria de Evidencias

```tsx
// components/evidence/EvidenceGallery.tsx
interface Props {
  evidences: Evidence[]
  onDelete?: (id: string) => void
  onSelectForReport?: (id: string, selected: boolean) => void
  selectable?: boolean
}

export function EvidenceGallery({ evidences, onDelete, onSelectForReport, selectable }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedForReport, setSelectedForReport] = useState<Set<string>>(new Set())

  if (!evidences.length) {
    return <EmptyState
      title="Sin evidencias"
      description="Aun no se han cargado evidencias para esta orden."
    />
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {evidences.map((evidence) => (
        <EvidenceCard
          key={evidence.id}
          evidence={evidence}
          onClick={() => setSelectedId(evidence.id)}
          onDelete={onDelete}
          selectedForReport={selectedForReport.has(evidence.id)}
          onToggleReport={selectable ? (selected) => {
            const next = new Set(selectedForReport)
            if (selected) next.add(evidence.id)
            else next.delete(evidence.id)
            setSelectedForReport(next)
            onSelectForReport?.(evidence.id, selected)
          } : undefined}
        />
      ))}

      {/* Lightbox para ver en grande */}
      {selectedId && (
        <EvidenceLightbox
          evidence={evidences.find(e => e.id === selectedId)!}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
```

### 6.6 EvidenceCard

```tsx
// components/evidence/EvidenceCard.tsx
function EvidenceCard({ evidence, onClick, onDelete, selectedForReport, onToggleReport }: Props) {
  return (
    <div
      className="group relative rounded-lg overflow-hidden border border-[--hairline] bg-[--canvas] cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Preview */}
      <div className="aspect-square relative">
        {evidence.documentFile?.mimeType?.startsWith("image/") ? (
          <Image
            src={evidence.documentFile.url}
            alt={evidence.caption}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[--surface]">
            <FileText className="w-12 h-12 text-[--steel]" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`px-2 py-0.5 rounded-full text-micro ${
            evidence.evidenceType === "before" ? "bg-blue-100 text-blue-700" :
            evidence.evidenceType === "after" ? "bg-green-100 text-green-700" :
            evidence.evidenceType === "issue" ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-700"
          }`}>
            {evidence.evidenceType}
          </span>
        </div>

        {/* Sync status */}
        {evidence.offlineSyncState !== "synced" && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-micro">
            {evidence.offlineSyncState}
          </div>
        )}

        {/* Select for report */}
        {onToggleReport && (
          <div
            className="absolute bottom-2 right-2"
            onClick={(e) => {
              e.stopPropagation()
              onToggleReport(!selectedForReport)
            }}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedForReport ? "bg-[--cermont-blue] border-[--cermont-blue]" : "border-white bg-black/50"
            }`}>
              {selectedForReport && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-body-sm text-[--ink] truncate">{evidence.caption}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-caption text-[--steel]">
            {formatDate(evidence.capturedAt)}
          </span>
          {evidence.gps && (
            <MapPin className="w-3 h-3 text-[--steel]" title={`${evidence.gps.latitude}, ${evidence.gps.longitude}`} />
          )}
        </div>
      </div>
    </div>
  )
}
```

### 6.7 Firma Digital (SignatureField)

```tsx
// components/common/SignatureField.tsx
"use client"

import { useRef, useState, useCallback } from "react"

interface Props {
  onSave: (signatureData: string) => void    // base64 PNG
  width?: number
  height?: number
}

export function SignatureField({ onSave, width = 400, height = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawing, setHasDrawing] = useState(false)

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = "#0F172A"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    setIsDrawing(true)
    setHasDrawing(true)
  }, [getPos])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing, getPos])

  const stopDrawing = useCallback(() => setIsDrawing(false), [])

  const handleSave = useCallback(() => {
    if (!hasDrawing) return
    const dataUrl = canvasRef.current!.toDataURL("image/png")
    onSave(dataUrl)
  }, [hasDrawing, onSave])

  const handleClear = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    setHasDrawing(false)
  }, [width, height])

  return (
    <div className="space-y-3">
      <div className="border border-[--hairline] rounded-md overflow-hidden inline-block">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="bg-white cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!hasDrawing}
          className="px-4 py-2 rounded-full bg-[--cermont-blue] text-white text-button-md disabled:opacity-50"
        >
          Guardar firma
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-full border border-[--hairline] text-[--ink] text-button-md"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
```

---

## 7. Certificados y Vencimiento

### 7.1 Entidad Certificate

```typescript
interface Certificate {
  id: string
  documentFileId: string           // Archivo del certificado

  // A quien pertenece
  entityType: "asset" | "tool" | "equipment" | "user" | "company"
  entityId: string

  // Contenido
  certificateType: string           // "Calibracion", "Seguridad", "Operacion", etc.
  certificateNumber?: string
  issuedAt: string                  // ISO 8601
  expiresAt: string                 // ISO 8601
  issuer: string                    // Quien emitio el certificado

  // Estado calculado
  status: "valid" | "expired" | "expiring_soon" | "rejected"

  createdAt: string
}
```

### 7.2 Reglas de Negocio

1. **Vigencia automatica:** El sistema calcula el estado diariamente
2. **Alertas:** Se alerta 30 dias antes del vencimiento
3. **Blocker:** Una herramienta con certificado vencido bloquea la planeacion
4. **Tipos de certificado:**
   - Calibracion de instrumentos
   - Seguridad de equipos
   - Operacion de maquinaria
   - Entrenamiento de personal
   - Compania (ARL, poliza, etc.)

### 7.3 Alertas de Vencimiento

```typescript
// Servicio de alertas (ejecutado por cron o al cargar pagina)
function checkCertificateAlerts(): Alert[] {
  const now = new Date()
  const thirtyDaysFromNow = addDays(now, 30)

  return certificates
    .filter(cert => cert.status === "valid" && cert.expiresAt <= thirtyDaysFromNow)
    .map(cert => ({
      type: "certificate_expiring",
      severity: cert.expiresAt <= now ? "critical" : "warning",
      message: `Certificado ${cert.certificateType} de ${cert.entityName} vence el ${formatDate(cert.expiresAt)}`,
      entityType: "certificate",
      entityId: cert.id,
      action: "/assets",
    }))
}
```

---

## 8. Activos, Herramientas y Equipos

### 8.1 Entidad Asset

```typescript
interface Asset {
  id: string
  name: string
  type: "vehicle" | "tool" | "equipment" | "safety" | "telecom" | "access"
  code?: string                    // Codigo interno

  // Detalles
  brand?: string
  model?: string
  serialNumber?: string
  description?: string

  // Estado
  status: "active" | "maintenance" | "retired" | "lost"

  // Certificados
  certificates: string[]           // Certificate IDs

  // Mantenimiento
  maintenancePlans: string[]       // MaintenancePlan IDs
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string

  createdAt: string
  updatedAt: string
}
```

### 8.2 Plan de Mantenimiento

```typescript
interface MaintenancePlan {
  id: string
  assetId: string

  type: "preventive" | "corrective" | "predictive"
  description: string

  // Frecuencia
  frequencyType: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "hours"
  frequencyValue: number

  // Proximo
  nextDueDate?: string
  nextDueHours?: number

  // Historial
  completedTasks: MaintenanceTask[]

  createdAt: string
}
```

### 8.3 Tarea de Mantenimiento

```typescript
interface MaintenanceTask {
  id: string
  maintenancePlanId: string

  description: string
  checklist: ChecklistItem[]

  // Ejecucion
  scheduledDate: string
  completedDate?: string
  completedBy?: string

  // Evidencia
  evidenceIds: string[]
  notes?: string

  // Estado
  status: "scheduled" | "in_progress" | "completed" | "overdue" | "cancelled"
}
```

---

## 9. Endpoints de Archivos

```text
# Upload
POST   /api/files                    multipart/form-data

# Gestion
GET    /api/files/:id                Metadata del archivo
GET    /api/files/:id/download       Descargar archivo
GET    /api/files/:id/preview        Preview (para imagenes)
POST   /api/files/:id/archive        Archivar (soft delete)

# Evidencias
GET    /api/evidences                ?workOrderId=&type=&page=&limit
POST   /api/evidences                { workOrderId, type, file, caption, gps }
GET    /api/evidences/:id
PATCH  /api/evidences/:id            { caption, isClientVisible }
DELETE /api/evidences/:id

# Certificados
GET    /api/assets/:id/certificates
POST   /api/assets/:id/certificates  { file, type, issuedAt, expiresAt, issuer }
GET    /api/certificates             ?entityType=&entityId=&status=

# Mantenimiento
GET    /api/assets/:id/maintenance
POST   /api/assets/:id/maintenance   { type, description, frequency }
POST   /api/maintenance-tasks/:id/complete  { checklist, notes, evidences }
```

---

## 10. Seguridad de Archivos

### 10.1 Control de Acceso

| Rol | Ver evidencias | Subir evidencias | Ver documentos internos | Ver certificados | Ver comprobantes |
|---|---|---|---|---|---|
| gerente | Todas | Si | Todos | Todos | Todos |
| administrativo | Cliente+Interno | No | Interno+Cliente | Si | Todos |
| supervisor | Todas | Si | Interno | Si | No |
| tecnico | De sus ordenes | Si | Limitado | No | No |
| cliente | Cliente visible | No | Cliente visible | No | No |
| hes | Todas | No | Interno | Todos | No |
| auditor | Todas | No | Todos | Todos | Todos |

### 10.2 Escaneo de Archivos

En produccion, todo archivo debe ser escaneado:

```typescript
async function scanFile(filePath: string): Promise<"clean" | "infected" | "error"> {
  // Integracion con ClamAV u otro motor
  const result = await clamav.scan(filePath)
  return result.isInfected ? "infected" : "clean"
}
```

Si un archivo esta infectado:
1. Se marca como `status: "rejected"`, `scanStatus: "infected"`
2. Se notifica al uploader
3. Se registra en auditoria
4. No se muestra en la UI

### 10.3 Soft Delete

Los archivos no se eliminan fisicamente de inmediato:

```typescript
// Soft delete
async function archiveFile(fileId: string, userId: string) {
  await DocumentFile.updateOne(
    { _id: fileId },
    { $set: { status: "archived", deletedAt: new Date(), deletedBy: userId } }
  )
}

// El archivo fisico se elimina despues de un periodo de gracia (ej: 30 dias)
// mediante un job programado
```

---

## 11. Reglas de Resolucion de Conflictos Offline

| Tipo de Dato | Politica | Razonamiento |
|---|---|---|
| Evidencias fotograficas | Append-only | Las fotos no se sobrescriben, solo se agregan |
| Firmas | Inmutables | Una firma confirmada no cambia |
| Materiales usados | Merge por linea | Sumar cantidades si hay duplicados |
| Costos | Merge con auditoria | Combinar pero auditar variaciones |
| Estados de flujo | Comandos transaccionales | Validar precondiciones al sincronizar |
| Plantillas publicadas | Inmutables | Las versiones publicadas no cambian |

---

## 12. Implementacion

### Semanas 18-19: Activos y Mantenimiento

- [ ] CRUD de Asset (vehiculos, herramientas, equipos)
- [ ] CRUD de Certificate con fechas de vencimiento
- [ ] Alertas de certificados proximos a vencer
- [ ] CRUD de MaintenancePlan y MaintenanceTask
- [ ] Historial de mantenimiento
- [ ] Vinculacion de activos con planeacion

### Semanas 8-9 (continuacion): Evidencias Offline

- [ ] Upload de evidencias con GPS
- [ ] Galeria de evidencias con lightbox
- [ ] Firma digital (canvas)
- [ ] IndexedDB para almacenamiento offline
- [ ] Sync engine para sincronizacion
- [ ] Estados de sync visibles
- [ ] Seleccion de evidencias para informe

### Semanas 10-11 (continuacion): Archivos de Soporte

- [ ] Upload de documentos de soporte (PO, SES, etc.)
- [ ] Control de visibilidad
- [ ] Soft delete
- [ ] Escaneo de virus (configuracion)
- [ ] Hash SHA-256 para integridad
---

# ANEXO v2.1 — Cierre de puntos ciegos para agentes IA/Codex

> **Prevalencia normativa:** si alguna sección anterior de este documento contradice este anexo, prevalece el **ANEXO v2.1**.  
> **Propósito:** convertir la documentación canónica en un plano arquitectónico ejecutable, verificable y sin ambigüedades para agentes IA/Codex.  
> **Regla base:** ningún agente puede declarar una función como implementada si no aporta **archivo + endpoint/contrato/componente + prueba + evidencia**.


## 1. Modelo de evidencia categorizada

```ts
interface Evidence {
  readonly id: string;
  readonly serviceCaseId: string;
  readonly workOrderId: string;
  readonly stepKey: string;
  readonly requirementKey: string;
  readonly evidenceMoment: "before" | "during" | "after" | "closure";
  readonly evidenceType: "photo" | "document" | "signature" | "gps" | "note";
  readonly categoryId: string;
  readonly customCategoryLabel?: string;
  readonly customName: string;
  readonly sequenceNumber: number;
  readonly capturedAt: string;
  readonly capturedBy: string;
  readonly gps?: {
    readonly lat: number;
    readonly lng: number;
    readonly accuracy?: number;
  };
  readonly syncStatus: "pending" | "synced" | "failed" | "conflict";
  readonly verificationStatus: "pending" | "approved" | "rejected";
}
```

Si la regla del repositorio prohíbe propiedades opcionales, usar objetos de resultado o spreads condicionales en implementación.

## 2. Reglas de evidencia

- El técnico puede subir evidencias.
- El técnico puede renombrar evidencias antes de aprobación.
- Supervisor/residente puede validar, reclasificar o rechazar con motivo.
- Administrativo puede usar evidencias aprobadas para cierre.
- Cliente solo ve evidencia marcada como visible.
- Evidencia aprobada no se elimina físicamente.
- Evidencia usada en informe, acta, SES, factura o pago queda protegida.
- Toda reclasificación deja audit log.

## 3. UI mínima de evidencias

Componentes esperados:

```text
EvidenceGallery
EvidenceBatchUploader
EvidenceCategorizer
EvidenceRenameDialog
EvidenceRequirementChecklist
EvidenceVerificationPanel
EvidenceOfflineQueue
```

Flujo:

```text
Subir fotos
→ renombrar
→ asignar categoría
→ asignar paso/requisito
→ marcar before/during/after/closure
→ guardar online/offline
→ validar supervisor
→ usar en informe/acta
```

## 4. Categorías abiertas

Cada evidencia debe soportar:

- categoría de catálogo;
- categoría personalizada;
- propuesta de nueva categoría;
- aprobación de categoría por rol autorizado.

Ejemplos de categorías:

```text
Antes de intervención
Durante intervención
Después de intervención
Herramientas
Equipos
AST/PTW
Línea de vida
CCTV
Anclajes
Cierre administrativo
```

## 5. Política de eliminación y archivado

| Estado | Acción permitida |
|---|---|
| `pending` | editar/eliminar si no sincronizada |
| `synced` | archivar con motivo |
| `approved` | no eliminar; solo archivar con permiso |
| `used_in_report` | protegido |
| `used_in_delivery_record` | protegido |
| `used_in_ses` | protegido |
| `used_in_invoice` | protegido |

El borrado físico solo se permite por política de retención y con auditoría.
