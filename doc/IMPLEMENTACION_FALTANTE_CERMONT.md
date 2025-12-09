# 🔍 ANÁLISIS DE IMPLEMENTACIÓN FALTANTE - CERMONT

**Fecha**: Diciembre 8, 2025  
**Estado del Proyecto**: 35% Completado (Backend básico + Dashboard inicial)  
**Prioridad**: CRÍTICA - Validación piloto requerida en 2 semanas

---

## 📊 RESUMEN EJECUTIVO

El proyecto CERMONT ha completado la **estructura base del backend** con módulos de autenticación y dashboard. Sin embargo, **falta la implementación de 70% de la funcionalidad crítica** requerida según la propuesta académica y los requisitos operativos de la empresa.

### Métricas Actuales:
- ✅ **Completado**: Auth (JWT + OAuth2 Google), Dashboard KPIs, Estructura API
- ❌ **Falta**: Módulo Ejecución, Evidencias, Reportes, Offline/Online, Archivado
- 🟡 **Parcial**: Planeación (esquema pero sin UI), Órdenes (CRUD incompleto)

---

## 🎯 MÓDULOS CRÍTICOS FALTANTES

### **1. MÓDULO EJECUCIÓN EN CAMPO (Priority: CRITICAL)**

#### 🔴 Estado: 0% Implementado

**Descripción**: Aplicación mobile/web que permite a técnicos registrar trabajo en tiempo real, con capacidad offline.

**Falta Implementar**:

```typescript
// ejecucion.types.ts - PENDIENTE COMPLETAR
export interface EjecucionDTO {
  ordenId: string;
  tecnicoId: string;
  // ❌ Falta: Checklists dinámicos
  // ❌ Falta: Fotos/videos con geolocalización
  // ❌ Falta: Firmas digitales
  // ❌ Falta: Estado sincronización offline
  // ❌ Falta: Timestamps de inicio/fin
}

// ejecucion.service.ts - PENDIENTE
export class EjecucionService {
  // ❌ TODO: iniciarEjecucion()
  // ❌ TODO: registrarChecklistItem()
  // ❌ TODO: uploadFotografia()
  // ❌ TODO: capturarFirma()
  // ❌ TODO: completarEjecucion()
  // ❌ TODO: sincronizarOffline()
}

// Frontend - COMPLETAMENTE PENDIENTE
// ❌ components/ejecucion/mobile-checklist.tsx
// ❌ components/ejecucion/camera-capture.tsx
// ❌ components/ejecucion/signature-pad.tsx
// ❌ lib/offline-storage.ts (IndexedDB sync)
// ❌ features/ejecucion/use-offline-mode.ts
```

**Tareas Específicas**:
- [ ] Schema Prisma: `EjecucionLog`, `ChecklistItem`, `Fotografia`, `Firma`
- [ ] Repository: CRUD completo + queries offline
- [ ] Service: Lógica de sincronización offline/online
- [ ] API Routes: POST `/api/ejecucion/{id}/iniciar`, `...checklist`, `...foto`, etc.
- [ ] Mobile Component: Interfaz responsive para campo (acceso rápido, bajo consumo datos)
- [ ] Offline Storage: IndexedDB para almacenamiento local + Service Worker
- [ ] Tests: Unit tests (95% coverage) + Integration tests (ejecución completa)

**Estimado**: 80 horas (8 días con parar completo)

---

### **2. MÓDULO EVIDENCIAS (Priority: CRITICAL)**

#### 🔴 Estado: 20% Implementado (solo estructura base)

**Descripción**: Gestión centralizada de fotos, videos y documentos con metadatos.

**Falta Implementar**:

```typescript
// evidencias.service.ts - INCOMPLETO
export class EvidenciasService {
  // ✅ Existe: uploadFotografia() (básico)
  // ❌ TODO: Compresión de imágenes
  // ❌ TODO: Generación de thumbnails
  // ❌ TODO: Extracción de EXIF (geolocalización)
  // ❌ TODO: Validación de metadatos
  // ❌ TODO: Organización en carpetas por orden
  // ❌ TODO: Búsqueda y filtrado avanzado
  // ❌ TODO: Integración con reporte PDF
}

// Frontend - PENDIENTE
// ❌ components/evidencias/gallery-viewer.tsx
// ❌ components/evidencias/image-editor.tsx
// ❌ components/evidencias/geomap.tsx (mostrar ubicaciones)
// ❌ hooks/use-camera.ts
// ❌ hooks/use-file-upload.ts
```

**Tareas Específicas**:
- [ ] Storage: Configurar AWS S3 o Cloudinary (reemplazar servidor local)
- [ ] Pipeline: Compresión → Thumbnail → Validación → Storage → DB
- [ ] EXIF Parser: Extraer GPS, timestamp, orientación
- [ ] Gallery Component: Grid responsivo + lightbox + metadata display
- [ ] Map Integration: Mostrar fotos en mapa según geolocalización
- [ ] Batch Operations: Descargar múltiples fotos, cambiar permisos, etc.
- [ ] Tests: Upload simulado, validación EXIF, organizacion carpetas

**Estimado**: 60 horas (6 días)

---

### **3. MÓDULO REPORTES & CIERRE (Priority: CRITICAL)**

#### 🔴 Estado: 0% Implementado

**Descripción**: Generación automática de informes técnicos, actas y facturas en PDF.

**Falta Implementar**:

```typescript
// reportes.service.ts - COMPLETAMENTE PENDIENTE
export class ReportesService {
  // ❌ TODO: generarInformeTecnico(ordenId)
  // ❌ TODO: generarActaEntrega(ordenId)
  // ❌ TODO: generarSES(ordenId) - Solicitud de Especificación Técnica
  // ❌ TODO: generarFactura(ordenId)
  // ❌ TODO: exportarCSV(filtros)
  // ❌ TODO: enviarPorEmail()
}

// Frontend - PENDIENTE
// ❌ pages/reportes/[id]/preview.tsx
// ❌ components/reportes/report-generator-form.tsx
// ❌ components/reportes/pdf-viewer.tsx
// ❌ features/reportes/api/reportes.api.ts
```

**Tareas Específicas**:
- [ ] Schema: `Reporte`, `ActaEntrega`, `SES`, `Factura`
- [ ] PDF Generator: puppeteer/wkhtmltopdf (templates con Handlebars)
- [ ] Templates HTML: Informe técnico, acta, SES, factura (branding Cermont)
- [ ] Email Service: Nodemailer (envío de PDF a cliente y archivo interno)
- [ ] Automatización: Trigger al marcar orden como "completada"
- [ ] Archivo Histórico: Guardar PDFs en S3 con metadata
- [ ] Validación: Verificar firmas, aprobaciones antes de generar PDF final

**Estimado**: 100 horas (10 días - incluye diseño templates)

---

### **4. MÓDULO OFFLINE/ONLINE SYNC (Priority: HIGH)**

#### 🔴 Estado: 0% Implementado

**Descripción**: Sincronización automática entre app offline y servidor.

**Falta Implementar**:

```typescript
// lib/sync-manager.ts - COMPLETAMENTE PENDIENTE
export class SyncManager {
  // ❌ TODO: detectNetworkStatus()
  // ❌ TODO: queueOfflineActions()
  // ❌ TODO: syncOnConnectionRestore()
  // ❌ TODO: handleConflictResolution()
  // ❌ TODO: retryFailedSync()
}

// Frontend - PENDIENTE
// ❌ hooks/use-sync-status.ts
// ❌ components/sync-indicator.tsx (muestra estado sincronización)
// ❌ service-worker.ts (background sync)
// ❌ context/offline-context.tsx
```

**Tareas Específicas**:
- [ ] Service Worker: Implementación de background sync
- [ ] IndexedDB Schema: Modelo local que replica API
- [ ] Conflict Resolution: Timestamp-based o last-write-wins
- [ ] Retry Logic: Exponential backoff para reintentos
- [ ] UI Indicator: Mostrar "Offline", "Sincronizando", "Sincronizado"
- [ ] Queue Management: Priorizar acciones críticas (fotos) vs. metadata
- [ ] Tests: Simulación offline/online, conflictos, timeouts

**Estimado**: 50 horas (5 días)

---

### **5. MÓDULO ARCHIVADO & HISTÓRICOS (Priority: HIGH)**

#### 🔴 Estado: 0% Implementado

**Descripción**: Archivado automático mensual y portal de descargas históricas.

**Falta Implementar**:

```typescript
// archivado.service.ts - COMPLETAMENTE PENDIENTE
export class ArchivadoService {
  // ❌ TODO: archivarOrdenesCompletadas()
  // ❌ TODO: exportarPaqueteHistorico(mes, año)
  // ❌ TODO: crearBackupMensual()
  // ❌ TODO: moverABaseDatosHistorica()
}

// Frontend - PENDIENTE
// ❌ pages/admin/historicos/index.tsx
// ❌ components/admin/historic-download.tsx
// ❌ features/admin/api/historicos.api.ts
```

**Tareas Específicas**:
- [ ] Cron Job: Ejecutar archivado el último día de cada mes (23:00 UTC-5)
- [ ] Database: Crear schema histórica en PostgreSQL (idéntica a operativa)
- [ ] Migration: Script para mover órdenes+evidencias a histórica
- [ ] Portal: UI para seleccionar mes/año y descargar ZIP
- [ ] Compresión: ZIP con estructura: `ordenes.csv`, `facturas/`, `informes/`, `fotos/`
- [ ] Validación: Verificar integridad de datos antes de archivar
- [ ] Auditoría: Log de qué se archivó cuándo y por quién

**Estimado**: 40 horas (4 días)

---

### **6. MÓDULO PLANEACIÓN (Priority: MEDIUM)**

#### 🟡 Estado: 30% Implementado (schema solo, sin UI)

**Falta Implementar**:

```typescript
// planeacion.controller.ts - INCOMPLETO
export class PlaneacionController {
  // ✅ Existe: createPlaneacion()
  // ❌ TODO: getKitsTipicos()
  // ❌ TODO: crearChecklistDesdeKit()
  // ❌ TODO: validarCompletitud()
  // ❌ TODO: aprobarPlaneacion()
}

// Frontend - COMPLETAMENTE PENDIENTE
// ❌ components/planeacion/planning-form.tsx
// ❌ components/planeacion/kit-selector.tsx
// ❌ components/planeacion/checklist-builder.tsx
```

**Tareas Específicas**:
- [ ] Completar CRUD de Kits Típicos (UI drag-and-drop)
- [ ] Builder de Checklists: Seleccionar kit → generar checklist dinámico
- [ ] Validaciones: Verificar que técnico tenga certificaciones requeridas
- [ ] Cronograma: Integración visual (timeline o Gantt chart)
- [ ] Aprobación Workflow: Supervisor aprueba antes de ejecutar
- [ ] Historial: Ver cambios en planeación (audit trail)

**Estimado**: 50 horas (5 días)

---

### **7. MÓDULO ÓRDENES - COMPLETAR (Priority: MEDIUM)**

#### 🟡 Estado: 50% Implementado (CRUD básico, falta flujo completo)

**Falta Implementar**:

```typescript
// ordenes.service.ts - INCOMPLETO
export class OrdenesService {
  // ✅ Existe: createOrden(), getOrdenes()
  // ❌ TODO: cambiarEstado() con validaciones
  // ❌ TODO: asignarTecnico()
  // ❌ TODO: calcularCostoReal()
  // ❌ TODO: validarCompletitud antes de cierre
}

// Frontend - PARCIAL
// ❌ pages/ordenes/[id]/index.tsx (vista completa falta)
// ❌ components/ordenes/status-timeline.tsx
// ❌ components/ordenes/cost-comparison.tsx
```

**Tareas Específicas**:
- [ ] State Machine: Estados (creada → planeada → en ejecución → completada → facturada)
- [ ] Validaciones: No permitir cambios después de cierre
- [ ] Cálculo de Costos: Suma de mano de obra + materiales + equipos + impuestos
- [ ] Comparativa: Presupuesto vs. Real (mostrar varianza %)
- [ ] Historial: Cambios de estado con timestamp y usuario
- [ ] Notificaciones: Alertar supervisor si hay retrasos o sobrecostos

**Estimado**: 40 horas (4 días)

---

### **8. MÓDULO USUARIOS & ROLES (Priority: MEDIUM)**

#### 🟡 Estado: 60% Implementado (auth básico, falta RBAC avanzado)

**Falta Implementar**:

```typescript
// usuarios.service.ts - INCOMPLETO
export class UsuariosService {
  // ✅ Existe: createUser(), getUsers()
  // ❌ TODO: asignarRol()
  // ❌ TODO: validarCertificaciones()
  // ❌ TODO: generarReportePorUsuario()
  // ❌ TODO: deactivarUsuario()
}

// Frontend - PENDIENTE
// ❌ pages/admin/usuarios/index.tsx
// ❌ components/admin/user-management.tsx
// ❌ components/admin/role-assignment.tsx
```

**Tareas Específicas**:
- [ ] Panel de Usuarios: CRUD con filtros
- [ ] Asignación de Roles: admin, supervisor, técnico, administrativo
- [ ] Permisos Granulares: Qué puede hacer cada rol
- [ ] Certificaciones: Registrar qué técnico puede hacer qué tipo de trabajo
- [ ] Auditoría: Log de acciones por usuario
- [ ] 2FA (Two-Factor Auth): Implementar para admin

**Estimado**: 35 horas (3.5 días)

---

### **9. MÓDULO HES (HEALTH & ENVIRONMENTAL SAFETY) - (Priority: MEDIUM)**

#### 🔴 Estado: 0% Implementado

**Falta Implementar**:

```typescript
// hes.service.ts - COMPLETAMENTE PENDIENTE
export class HESService {
  // ❌ TODO: registrarInspeccion()
  // ❌ TODO: generarAuditoria()
  // ❌ TODO: registrarNoConformidad()
  // ❌ TODO: trackearAcciones()
}

// Frontend - PENDIENTE
// ❌ pages/hes/inspecciones/index.tsx
// ❌ components/hes/inspection-form.tsx
```

**Tareas Específicas**:
- [ ] Formularios de Inspección: Checklist de seguridad
- [ ] Registro de Incidentes: No conformidades encontradas
- [ ] Planes de Acción: Seguimiento de correcciones
- [ ] Reportes: Análisis de tendencias de seguridad
- [ ] Integración: Vinculación con órdenes de trabajo

**Estimado**: 30 horas (3 días)

---

### **10. MÓDULO KITS & LÍNEAS DE VIDA (Priority: LOW)**

#### 🔴 Estado: 0% Implementado

**Falta Implementar**:

```typescript
// kits.service.ts - COMPLETAMENTE PENDIENTE
export class KitsService {
  // ❌ TODO: crearKit()
  // ❌ TODO: validarKitPorActividad()
}

// lineas-vida.service.ts - COMPLETAMENTE PENDIENTE
export class LineasVidaService {
  // ❌ TODO: registrarInspeccion()
  // ❌ TODO: generarCertificado()
}
```

**Tareas Específicas**:
- [ ] Catálogo de Kits: CRUD para administrador
- [ ] Validación: Qué kit usar para cada tipo de actividad
- [ ] Líneas de Vida: Registro de equipos con caducidad
- [ ] Alertas: Notificar cuando equipo próximo a vencer

**Estimado**: 30 horas (3 días)

---

## 🗂️ ARCHIVOS QUE NECESITAN CREACIÓN O COMPLETACIÓN

### Backend (Node.js/Express/TypeScript):

```
api/src/
├── modules/
│   ├── ejecucion/
│   │   ├── ejecucion.controller.ts       ❌ TODO
│   │   ├── ejecucion.service.ts          ❌ TODO
│   │   ├── ejecucion.repository.ts       ❌ TODO
│   │   ├── ejecucion.types.ts            ❌ TODO
│   │   └── ejecucion.routes.ts           ❌ TODO
│   │
│   ├── evidencias/
│   │   ├── upload.service.ts             🟡 COMPLETAR (AWS S3)
│   │   ├── image-processor.ts            ❌ TODO (compresión)
│   │   └── geotagging.service.ts         ❌ TODO (EXIF)
│   │
│   ├── reportes/
│   │   ├── reportes.service.ts           ❌ TODO
│   │   ├── pdf-generator.ts              ❌ TODO
│   │   ├── email.service.ts              ❌ TODO
│   │   └── templates/
│   │       ├── informe-tecnico.hbs       ❌ TODO
│   │       ├── acta-entrega.hbs          ❌ TODO
│   │       ├── ses.hbs                   ❌ TODO
│   │       └── factura.hbs               ❌ TODO
│   │
│   ├── archivado/
│   │   ├── archivado.service.ts          ❌ TODO
│   │   ├── archivado.cron.ts             ❌ TODO
│   │   └── historic-db.service.ts        ❌ TODO
│   │
│   ├── planeacion/
│   │   ├── planeacion.controller.ts      🟡 COMPLETAR
│   │   └── kits.service.ts               ❌ TODO
│   │
│   ├── ordenes/
│   │   ├── ordenes.service.ts            🟡 COMPLETAR
│   │   └── cost-calculator.ts            ❌ TODO
│   │
│   ├── usuarios/
│   │   ├── usuarios.service.ts           🟡 COMPLETAR
│   │   └── permissions.service.ts        ❌ TODO
│   │
│   ├── hes/
│   │   ├── hes.controller.ts             ❌ TODO
│   │   ├── hes.service.ts                ❌ TODO
│   │   └── hes.routes.ts                 ❌ TODO
│   │
│   └── kits-lineas-vida/
│       ├── kits.controller.ts            ❌ TODO
│       ├── lineas-vida.controller.ts     ❌ TODO
│       └── ...
│
├── shared/
│   ├── sync/
│   │   ├── sync.manager.ts               ❌ TODO
│   │   └── conflict-resolver.ts          ❌ TODO
│   │
│   └── workers/
│       ├── archivado.worker.ts           ❌ TODO
│       └── email.worker.ts               ❌ TODO
│
└── prisma/
    ├── migrations/
    │   ├── 03_add_ejecucion.sql          ❌ TODO
    │   ├── 04_add_evidencias_extended.sql ❌ TODO
    │   ├── 05_add_reportes.sql           ❌ TODO
    │   └── ...
    └── schema.prisma                      🟡 ACTUALIZAR (17 nuevos modelos)
```

### Frontend (Next.js/React/TypeScript):

```
web/
├── app/
│   ├── dashboard/
│   │   ├── ejecucion/
│   │   │   ├── page.tsx                  ❌ TODO
│   │   │   └── [id]/
│   │   │       ├── page.tsx              ❌ TODO
│   │   │       └── layout.tsx            ❌ TODO
│   │   │
│   │   ├── evidencias/
│   │   │   ├── page.tsx                  ❌ TODO
│   │   │   └── [id]/gallery.tsx          ❌ TODO
│   │   │
│   │   ├── reportes/
│   │   │   ├── page.tsx                  ❌ TODO
│   │   │   └── [id]/preview.tsx          ❌ TODO
│   │   │
│   │   ├── admin/
│   │   │   ├── usuarios/page.tsx         ❌ TODO
│   │   │   ├── historicos/page.tsx       ❌ TODO
│   │   │   ├── kits/page.tsx             ❌ TODO
│   │   │   └── hes/page.tsx              ❌ TODO
│   │   │
│   │   └── ordenes/[id]/
│   │       ├── page.tsx                  🟡 COMPLETAR
│   │       ├── ejecucion.tsx             ❌ TODO
│   │       ├── evidencias.tsx            ❌ TODO
│   │       └── reporte.tsx               ❌ TODO
│   │
│   └── ...
│
├── components/
│   ├── ejecucion/
│   │   ├── mobile-checklist.tsx          ❌ TODO
│   │   ├── camera-capture.tsx            ❌ TODO
│   │   └── signature-pad.tsx             ❌ TODO
│   │
│   ├── evidencias/
│   │   ├── gallery-viewer.tsx            ❌ TODO
│   │   ├── image-editor.tsx              ❌ TODO
│   │   └── geomap.tsx                    ❌ TODO
│   │
│   ├── reportes/
│   │   ├── pdf-viewer.tsx                ❌ TODO
│   │   ├── report-generator-form.tsx     ❌ TODO
│   │   └── email-dialog.tsx              ❌ TODO
│   │
│   └── shared/
│       ├── sync-indicator.tsx            ❌ TODO
│       └── status-timeline.tsx           ❌ TODO
│
├── features/
│   ├── ejecucion/
│   │   ├── api/ejecucion.api.ts          ❌ TODO
│   │   └── hooks/use-ejecucion.ts        ❌ TODO
│   │
│   ├── evidencias/
│   │   ├── api/evidencias.api.ts         🟡 COMPLETAR
│   │   ├── hooks/use-camera.ts           ❌ TODO
│   │   └── hooks/use-file-upload.ts      ❌ TODO
│   │
│   └── ...
│
├── hooks/
│   ├── use-sync-status.ts                ❌ TODO
│   ├── use-offline-mode.ts               ❌ TODO
│   ├── use-geolocation.ts                ❌ TODO
│   └── use-network-status.ts             ❌ TODO
│
├── lib/
│   ├── offline-storage.ts                ❌ TODO (IndexedDB)
│   ├── sync-manager.ts                   ❌ TODO
│   └── service-worker.ts                 ❌ TODO
│
└── context/
    └── offline-context.tsx               ❌ TODO
```

---

## 📋 MATRIZ DE DEPENDENCIAS

```
BLOQUEADORES (debe hacerse primero):
1. Schema Prisma (17 nuevos modelos) → bloquer todo backend
2. API Rest completa → bloquer todo frontend
3. Service Worker + IndexedDB → requiere offline mode

CADENA CRÍTICA:
1. Módulo Ejecución ← bloqueado por Schema Prisma
   ├── → Módulo Evidencias (depende de logística ejecución)
   └── → Módulo Reportes (depende de datos de ejecución)

MÓDULOS INDEPENDIENTES (pueden hacerse en paralelo):
- Usuarios/RBAC
- Planeación
- HES
- Kits/Líneas de Vida
```

---

## ⏱️ ESTIMACIÓN DE TIEMPO TOTAL

| Módulo | Horas | Días | Prioridad |
|--------|-------|------|-----------|
| **Ejecución en Campo** | 80 | 10 | CRITICAL |
| **Reportes & Cierre** | 100 | 12 | CRITICAL |
| **Evidencias** | 60 | 7 | CRITICAL |
| **Offline/Online Sync** | 50 | 6 | HIGH |
| **Archivado & Históricos** | 40 | 5 | HIGH |
| **Planeación (Completar)** | 50 | 6 | MEDIUM |
| **Órdenes (Completar)** | 40 | 5 | MEDIUM |
| **Usuarios/RBAC** | 35 | 4 | MEDIUM |
| **HES** | 30 | 4 | MEDIUM |
| **Kits/Líneas de Vida** | 30 | 4 | LOW |
| **Testing & QA** | 80 | 10 | CRITICAL |
| **Documentación** | 40 | 5 | MEDIUM |
| **Deployment & DevOps** | 30 | 4 | MEDIUM |
| **TOTAL** | **625** | **82 horas = 16 semanas** | - |

### 🚨 Restricción Crítica
**Validación Piloto Requerida en 2 semanas** → Necesario priorizar:
1. ✅ Ejecución en Campo (core feature)
2. ✅ Evidencias (requirements cliente)
3. ✅ Reportes (cierre administrativo)
4. ✅ Sincronización Offline
5. ✅ Testing completo

**Estimado para MVP piloto**: 300 horas = 6 semanas (trabajo intensivo)

---

## 🔧 PRÓXIMAS ACCIONES (Semana 1)

### Prioridad Inmediata:

```typescript
// 1. Actualizar Prisma Schema
// prisma/schema.prisma
model Ejecucion {
  id String @id @default(cuid())
  ordenId String @unique
  orden Orden @relation(fields: [ordenId], references: [id])
  tecnicoId String
  tecnico User @relation(fields: [tecnicoId], references: [id])
  estado String @default("iniciada") // iniciada, en_progreso, pausada, completada
  checklistItems ChecklistItem[]
  fotografias Fotografia[]
  firmas Firma[]
  iniciadoEn DateTime @default(now())
  completadoEn DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([ordenId])
  @@index([tecnicoId])
  @@index([estado])
}

model ChecklistItem {
  id String @id @default(cuid())
  ejecucionId String
  ejecucion Ejecucion @relation(fields: [ejecucionId], references: [id], onDelete: Cascade)
  titulo String
  completado Boolean @default(false)
  completadoEn DateTime?
  observaciones String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ... más modelos
```

### 2. Crear Endpoints REST básicos:
```bash
# Backend
POST   /api/ejecucion/:ordenId/iniciar
PATCH  /api/ejecucion/:id/checklist/:itemId
POST   /api/ejecucion/:id/fotografia
POST   /api/ejecucion/:id/firma
PATCH  /api/ejecucion/:id/completar

# Frontend
lib/api.ts → add EjecucionAPI client
hooks/use-ejecucion.ts → mutations
components/ejecucion/mobile-checklist.tsx → UI
```

### 3. Configurar S3 para fotos:
```typescript
// config/s3.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-1',
});

export async function uploadFoto(buffer, ordenId, nombreArchivo) {
  const params = {
    Bucket: 'cermont-evidencias',
    Key: `ordenes/${ordenId}/${nombreArchivo}`,
    Body: buffer,
    ContentType: 'image/jpeg',
  };
  return s3.upload(params).promise();
}
```

---

## 📊 DASHBOARD ACTUAL vs. REQUERIDO

**Actual**:
- KPIs básicos (total, activas, completadas)
- Tablas de órdenes
- Gráficos simples (Chart.js)

**Requerido Agregar**:
- ❌ Comparativa Costos (Presupuestado vs. Real)
- ❌ Timeline de Ejecución (horas trabajadas vs. estimadas)
- ❌ Mapa de Órdenes Activas (geolocalización)
- ❌ Alertas de Sobrecostos/Retrasos
- ❌ Métricas de Calidad (foto por ítem completado, firmas)
- ❌ Tendencias (varianza mes a mes)

---

## ✅ CHECKLIST IMPLEMENTACIÓN

Use esto como guía para el desarrollo:

- [ ] Schema Prisma 100% completado (17 modelos nuevos)
- [ ] Migrations creadas y validadas
- [ ] API REST completa (todos los módulos)
- [ ] Tests unitarios (>80% coverage)
- [ ] Componentes Frontend (responsive, accesible)
- [ ] Offline/Online Sync funcional
- [ ] PDF Generator con templates
- [ ] Email Service integrado
- [ ] S3 Storage configurado
- [ ] Cron Job de Archivado
- [ ] Documentación técnica completa
- [ ] Manual de usuario (PDF)
- [ ] Capacitación a 5 usuarios piloto
- [ ] Validación en campo (2 semanas)
- [ ] Reporte de impacto (métricas)

---

**Siguiente Paso**: Revisar esta lista con el equipo de desarrollo y asignar tareas por prioridad. ¿Empezamos por Ejecución en Campo?
