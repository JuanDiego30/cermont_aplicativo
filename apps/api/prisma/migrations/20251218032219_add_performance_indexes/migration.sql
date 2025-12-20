-- ==========================================
-- ENUMS
-- ==========================================

CREATE TYPE "EstadoInspeccion" AS ENUM ('CONFORME', 'NO_CONFORME', 'PENDIENTE');
CREATE TYPE "TipoMantenimiento" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO');
CREATE TYPE "EstadoMantenimiento" AS ENUM ('PROGRAMADO', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO', 'PENDIENTE');
CREATE TYPE "PrioridadMantenimiento" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');
CREATE TYPE "EstadoActa" AS ENUM ('BORRADOR', 'GENERADA', 'ENVIADA', 'FIRMADA', 'RECHAZADA');
CREATE TYPE "EstadoSES" AS ENUM ('NO_CREADA', 'CREADA', 'ENVIADA', 'APROBADA', 'RECHAZADA');
CREATE TYPE "EstadoFactura" AS ENUM ('NO_CREADA', 'GENERADA', 'ENVIADA', 'APROBADA', 'PAGADA', 'RECHAZADA');
CREATE TYPE "TipoArchivo" AS ENUM ('ORDENES_CSV', 'EVIDENCIAS_ZIP', 'INFORMES_PDF', 'BACKUP_COMPLETO');
CREATE TYPE "EstadoFormulario" AS ENUM ('BORRADOR', 'EN_REVISION', 'COMPLETADO', 'RECHAZADO');
CREATE TYPE "EstadoChecklistItem" AS ENUM ('PENDIENTE', 'COMPLETADO', 'NO_APLICA', 'RECHAZADO');

-- ==========================================
-- ALTER EXISTING TABLES
-- ==========================================

-- Actualizar tabla orders
ALTER TABLE "orders" 
  ADD COLUMN IF NOT EXISTS "requiereHES" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "cumplimientoHES" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "presupuestoEstimado" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "margenUtilidad" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "impuestosAplicables" DOUBLE PRECISION DEFAULT 0;

-- Actualizar tabla planeaciones
ALTER TABLE "planeaciones" 
  ADD COLUMN IF NOT EXISTS "empresa" TEXT,
  ADD COLUMN IF NOT EXISTS "ubicacion" TEXT,
  ADD COLUMN IF NOT EXISTS "descripcionTrabajo" TEXT,
  ADD COLUMN IF NOT EXISTS "fechaEstimadaInicio" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "fechaEstimadaFin" TIMESTAMP(3),
  ALTER COLUMN "kitId" DROP NOT NULL;

-- Actualizar tabla ejecuciones
ALTER TABLE "ejecuciones" 
  ADD COLUMN IF NOT EXISTS "sincronizado" BOOLEAN NOT NULL DEFAULT false;

-- Actualizar tabla checklist_ejecucion
ALTER TABLE "checklist_ejecucion" 
  DROP COLUMN IF EXISTS "completadoPor",
  DROP COLUMN IF EXISTS "item",
  ADD COLUMN IF NOT EXISTS "nombre" TEXT NOT NULL DEFAULT 'Sin nombre',
  ADD COLUMN IF NOT EXISTS "descripcion" TEXT,
  ADD COLUMN IF NOT EXISTS "templateId" TEXT,
  ADD COLUMN IF NOT EXISTS "completadoPorId" TEXT;

-- ==========================================
-- KITS Y TEMPLATES
-- ==========================================

CREATE TABLE IF NOT EXISTS "kits" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "categoria" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "kits_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "kit_items" (
  "id" TEXT NOT NULL,
  "kitId" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "cantidad" INTEGER NOT NULL DEFAULT 1,
  "unidad" TEXT NOT NULL DEFAULT 'UND',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "kit_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "kit_items_cantidad_positive" CHECK ("cantidad" > 0)
);

CREATE TABLE IF NOT EXISTS "items_planeacion" (
  "id" TEXT NOT NULL,
  "planeacionId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "cantidad" INTEGER NOT NULL DEFAULT 1,
  "unidad" TEXT NOT NULL DEFAULT 'UND',
  "observaciones" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "items_planeacion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "items_planeacion_cantidad_positive" CHECK ("cantidad" > 0)
);

-- ==========================================
-- CHECKLIST TEMPLATES
-- ==========================================

CREATE TABLE IF NOT EXISTS "checklist_templates" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "descripcion" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "checklist_template_items" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "tipo" TEXT NOT NULL,
  "requereCertificacion" BOOLEAN NOT NULL DEFAULT false,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "checklist_template_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "checklist_item_ejecucion" (
  "id" TEXT NOT NULL,
  "checklistId" TEXT NOT NULL,
  "templateItemId" TEXT,
  "nombre" TEXT NOT NULL,
  "estado" "EstadoChecklistItem" NOT NULL DEFAULT 'PENDIENTE',
  "completado" BOOLEAN NOT NULL DEFAULT false,
  "completadoPorId" TEXT,
  "completadoEn" TIMESTAMP(3),
  "observaciones" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "checklist_item_ejecucion_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- EVIDENCIAS
-- ==========================================

CREATE TABLE IF NOT EXISTS "fotos_evidencia" (
  "id" TEXT NOT NULL,
  "ejecucionId" TEXT,
  "checklistId" TEXT,
  "checklistItemId" TEXT,
  "url" TEXT NOT NULL,
  "descripcion" TEXT,
  "fase" TEXT,
  "cargadoPorId" TEXT,
  "cargadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sincronizado" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "fotos_evidencia_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- HES - LÍNEAS DE VIDA
-- ==========================================

CREATE TABLE IF NOT EXISTS "lineas_vida" (
  "id" TEXT NOT NULL,
  "ubicacion" TEXT NOT NULL,
  "tipo" TEXT,
  "longitud" DOUBLE PRECISION,
  "capacidadUsuarios" INTEGER,
  "fechaInstalacion" TIMESTAMP(3),
  "fechaProximaInspeccion" TIMESTAMP(3),
  "observaciones" TEXT,
  "estado" TEXT NOT NULL DEFAULT 'activo',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "lineas_vida_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lineas_vida_longitud_positive" CHECK ("longitud" IS NULL OR "longitud" > 0),
  CONSTRAINT "lineas_vida_capacidad_positive" CHECK ("capacidadUsuarios" IS NULL OR "capacidadUsuarios" > 0)
);

CREATE TABLE IF NOT EXISTS "inspecciones_linea_vida" (
  "id" TEXT NOT NULL,
  "lineaVidaId" TEXT,
  "numeroLinea" TEXT NOT NULL,
  "fabricante" TEXT NOT NULL,
  "diametroCable" TEXT NOT NULL DEFAULT '8mm',
  "tipoCable" TEXT NOT NULL DEFAULT 'Acero Inoxidable',
  "ubicacion" TEXT NOT NULL,
  "especificaciones" JSONB,
  "fechaInspeccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fechaInstalacion" TIMESTAMP(3),
  "fechaUltimoMantenimiento" TIMESTAMP(3),
  "estado" "EstadoInspeccion" NOT NULL DEFAULT 'PENDIENTE',
  "accionesCorrectivas" TEXT,
  "observaciones" TEXT,
  "fotosEvidencia" TEXT[],
  "inspectorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "inspecciones_linea_vida_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "componentes_linea_vida" (
  "id" TEXT NOT NULL,
  "inspeccionId" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "hallazgos" TEXT,
  "estado" TEXT NOT NULL,
  "accionCorrectiva" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "componentes_linea_vida_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "condiciones_componente" (
  "id" TEXT NOT NULL,
  "componenteId" TEXT NOT NULL,
  "tipoAfeccion" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "estado" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "condiciones_componente_pkey" PRIMARY KEY ("id")
);

-- Legacy compatibility
CREATE TABLE IF NOT EXISTS "inspecciones_linea_vida_legacy" (
  "id" TEXT NOT NULL,
  "lineaVidaId" TEXT NOT NULL,
  "tipo" TEXT,
  "resultados" JSONB,
  "aprobado" BOOLEAN NOT NULL DEFAULT false,
  "observaciones" TEXT,
  "inspectorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "inspecciones_linea_vida_legacy_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- HES - EQUIPOS
-- ==========================================

CREATE TABLE IF NOT EXISTS "equipos_hes" (
  "id" TEXT NOT NULL,
  "numero" TEXT NOT NULL,
  "marca" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'DISPONIBLE',
  "ultimaInspeccion" TIMESTAMP(3),
  "proximaInspeccion" TIMESTAMP(3),
  "especificaciones" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "equipos_hes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "inspecciones_hes" (
  "id" TEXT NOT NULL,
  "equipoId" TEXT NOT NULL,
  "inspectorId" TEXT NOT NULL,
  "ordenId" TEXT,
  "fechaInspeccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "estado" TEXT NOT NULL,
  "observaciones" TEXT,
  "fotosEvidencia" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "inspecciones_hes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "inspeccion_items" (
  "id" TEXT NOT NULL,
  "inspeccionId" TEXT NOT NULL,
  "rubro" TEXT NOT NULL,
  "descripcion" TEXT,
  "estado" TEXT NOT NULL,
  "notas" TEXT,

  CONSTRAINT "inspeccion_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "orden_equipos_hes" (
  "id" TEXT NOT NULL,
  "ordenId" TEXT NOT NULL,
  "equipoId" TEXT NOT NULL,
  "cantidad" INTEGER NOT NULL DEFAULT 1,
  "estado" TEXT NOT NULL DEFAULT 'ASIGNADO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "orden_equipos_hes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "orden_equipos_hes_cantidad_positive" CHECK ("cantidad" > 0)
);

CREATE TABLE IF NOT EXISTS "hes_registros" (
  "id" TEXT NOT NULL,
  "equipoId" TEXT,
  "ordenId" TEXT,
  "tipo" TEXT NOT NULL,
  "resultados" JSONB,
  "observaciones" TEXT,
  "aprobado" BOOLEAN NOT NULL DEFAULT false,
  "inspectorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "hes_registros_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- MANTENIMIENTOS
-- ==========================================

CREATE TABLE IF NOT EXISTS "equipos" (
  "id" TEXT NOT NULL,
  "codigo" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "marca" TEXT,
  "modelo" TEXT,
  "serie" TEXT,
  "ubicacion" TEXT,
  "fechaAdquisicion" TIMESTAMP(3),
  "fechaUltimoMantenimiento" TIMESTAMP(3),
  "intervaloMantenimientoDias" INTEGER,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "notas" TEXT,
  "creadoPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "equipos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "equipos_intervalo_positive" CHECK ("intervaloMantenimientoDias" IS NULL OR "intervaloMantenimientoDias" > 0)
);

CREATE TABLE IF NOT EXISTS "mantenimientos" (
  "id" TEXT NOT NULL,
  "equipoId" TEXT NOT NULL,
  "tipo" "TipoMantenimiento" NOT NULL,
  "estado" "EstadoMantenimiento" NOT NULL DEFAULT 'PROGRAMADO',
  "prioridad" "PrioridadMantenimiento" NOT NULL DEFAULT 'MEDIA',
  "titulo" TEXT NOT NULL,
  "descripcion" TEXT,
  "fechaProgramada" TIMESTAMP(3) NOT NULL,
  "fechaInicio" TIMESTAMP(3),
  "fechaFin" TIMESTAMP(3),
  "tecnicoAsignadoId" TEXT,
  "estimacionHoras" DOUBLE PRECISION,
  "horasReales" DOUBLE PRECISION,
  "costoTotal" DOUBLE PRECISION,
  "notas" TEXT,
  "observaciones" TEXT,
  "trabajoRealizado" TEXT,
  "repuestosUtilizados" TEXT,
  "esRecurrente" BOOLEAN NOT NULL DEFAULT false,
  "frecuenciaDias" INTEGER,
  "mantenimientoPadreId" TEXT,
  "creadoPorId" TEXT,
  "actualizadoPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "mantenimientos_estimacion_positive" CHECK ("estimacionHoras" IS NULL OR "estimacionHoras" > 0),
  CONSTRAINT "mantenimientos_horas_reales_positive" CHECK ("horasReales" IS NULL OR "horasReales" > 0),
  CONSTRAINT "mantenimientos_costo_positive" CHECK ("costoTotal" IS NULL OR "costoTotal" >= 0),
  CONSTRAINT "mantenimientos_frecuencia_positive" CHECK ("frecuenciaDias" IS NULL OR "frecuenciaDias" > 0)
);

-- ==========================================
-- FORMULARIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS "formularios" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "categoria" TEXT,
  "campos" JSONB NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "formularios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "formulario_templates" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "schema" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "creadoPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "formulario_templates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "formulario_templates_version_positive" CHECK ("version" > 0)
);

CREATE TABLE IF NOT EXISTS "formulario_respuestas" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "ordenId" TEXT,
  "respuestas" TEXT NOT NULL,
  "completadoPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "formulario_respuestas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "formulario_respuestas_legacy" (
  "id" TEXT NOT NULL,
  "formularioId" TEXT NOT NULL,
  "ordenId" TEXT,
  "respuestas" JSONB NOT NULL,
  "creadoPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "formulario_respuestas_legacy_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- CIERRE ADMINISTRATIVO
-- ==========================================

CREATE TABLE IF NOT EXISTS "actas" (
  "id" TEXT NOT NULL,
  "numero" TEXT NOT NULL,
  "ordenId" TEXT NOT NULL,
  "estado" "EstadoActa" NOT NULL DEFAULT 'BORRADOR',
  "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fechaEntrega" TIMESTAMP(3),
  "trabajosRealizados" TEXT NOT NULL,
  "observaciones" TEXT,
  "firmaTecnico" TEXT,
  "firmaCliente" TEXT,
  "nombreFirmaTecnico" TEXT,
  "nombreFirmaCliente" TEXT,
  "cedulaFirmaTecnico" TEXT,
  "cedulaFirmaCliente" TEXT,
  "fechaFirma" TIMESTAMP(3),
  "archivoActaPDF" TEXT,
  "adjuntos" TEXT[],
  "alertaEnviada" BOOLEAN NOT NULL DEFAULT false,
  "diasSinFirmar" INTEGER NOT NULL DEFAULT 0,
  "creadoPorId" TEXT,
  "aprobadoPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "actas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ses" (
  "id" TEXT NOT NULL,
  "numeroSES" TEXT NOT NULL,
  "ordenId" TEXT NOT NULL,
  "estado" "EstadoSES" NOT NULL DEFAULT 'NO_CREADA',
  "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fechaEnvio" TIMESTAMP(3),
  "fechaAprobacion" TIMESTAMP(3),
  "codigoAriba" TEXT,
  "urlAriba" TEXT,
  "descripcionServicio" TEXT NOT NULL,
  "valorTotal" DOUBLE PRECISION NOT NULL,
  "observaciones" TEXT,
  "alertaEnviada" BOOLEAN NOT NULL DEFAULT false,
  "diasSinAprobar" INTEGER NOT NULL DEFAULT 0,
  "creadoPorId" TEXT,
  "aprobadoPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ses_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ses_valor_positive" CHECK ("valorTotal" >= 0)
);

CREATE TABLE IF NOT EXISTS "facturas" (
  "id" TEXT NOT NULL,
  "numeroFactura" TEXT NOT NULL,
  "ordenId" TEXT NOT NULL,
  "estado" "EstadoFactura" NOT NULL DEFAULT 'NO_CREADA',
  "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fechaVencimiento" TIMESTAMP(3),
  "fechaAprobacion" TIMESTAMP(3),
  "fechaPago" TIMESTAMP(3),
  "subtotal" DOUBLE PRECISION NOT NULL,
  "impuestos" DOUBLE PRECISION NOT NULL,
  "valorTotal" DOUBLE PRECISION NOT NULL,
  "conceptos" TEXT NOT NULL,
  "observaciones" TEXT,
  "archivoFacturaPDF" TEXT,
  "adjuntos" TEXT[],
  "codigoAriba" TEXT,
  "urlAriba" TEXT,
  "alertaEnviada" BOOLEAN NOT NULL DEFAULT false,
  "diasVencidos" INTEGER NOT NULL DEFAULT 0,
  "creadoPorId" TEXT,
  "aprobadoPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "facturas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "facturas_subtotal_positive" CHECK ("subtotal" >= 0),
  CONSTRAINT "facturas_impuestos_positive" CHECK ("impuestos" >= 0),
  CONSTRAINT "facturas_total_positive" CHECK ("valorTotal" >= 0)
);

CREATE TABLE IF NOT EXISTS "cierre_administrativo" (
  "id" TEXT NOT NULL,
  "ordenId" TEXT NOT NULL,
  "actaId" TEXT,
  "sesId" TEXT,
  "facturaId" TEXT,
  "porcentajeCompletado" INTEGER NOT NULL DEFAULT 0,
  "estaCompleto" BOOLEAN NOT NULL DEFAULT false,
  "fechaInicioOrden" TIMESTAMP(3) NOT NULL,
  "fechaFinOrden" TIMESTAMP(3),
  "fechaInicioCierre" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fechaCierreCompleto" TIMESTAMP(3),
  "diasParaCierre" INTEGER NOT NULL DEFAULT 0,
  "observaciones" TEXT,
  "bloqueos" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "cierre_administrativo_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cierre_porcentaje_range" CHECK ("porcentajeCompletado" >= 0 AND "porcentajeCompletado" <= 100)
);

-- ==========================================
-- ARCHIVOS HISTÓRICOS
-- ==========================================

CREATE TABLE IF NOT EXISTS "archivos_historicos" (
  "id" TEXT NOT NULL,
  "tipo" "TipoArchivo" NOT NULL,
  "mes" INTEGER NOT NULL,
  "anio" INTEGER NOT NULL,
  "nombreArchivo" TEXT NOT NULL,
  "rutaArchivo" TEXT NOT NULL,
  "tamanioBytes" BIGINT NOT NULL,
  "cantidadOrdenes" INTEGER NOT NULL DEFAULT 0,
  "cantidadEvidencias" INTEGER NOT NULL DEFAULT 0,
  "descripcion" TEXT,
  "disponible" BOOLEAN NOT NULL DEFAULT true,
  "descargado" BOOLEAN NOT NULL DEFAULT false,
  "fechaDescarga" TIMESTAMP(3),
  "creadoPorId" TEXT,
  "fechaArchivado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "archivos_historicos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "archivos_mes_range" CHECK ("mes" >= 1 AND "mes" <= 12),
  CONSTRAINT "archivos_anio_positive" CHECK ("anio" > 2000),
  CONSTRAINT "archivos_tamanio_positive" CHECK ("tamanioBytes" > 0)
);

-- ==========================================
-- SINCRONIZACIÓN OFFLINE
-- ==========================================

CREATE TABLE IF NOT EXISTS "pending_syncs" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "action" TEXT NOT NULL,
  "data" JSONB,
  "localId" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "error" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pending_syncs_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- ÍNDICES OPTIMIZADOS
-- ==========================================

-- Items Planeación
CREATE INDEX IF NOT EXISTS "items_planeacion_planeacionId_idx" ON "items_planeacion"("planeacionId");
CREATE INDEX IF NOT EXISTS "items_planeacion_tipo_idx" ON "items_planeacion"("tipo");

-- Checklist Templates
CREATE INDEX IF NOT EXISTS "checklist_templates_tipo_activo_idx" ON "checklist_templates"("tipo", "activo");
CREATE INDEX IF NOT EXISTS "checklist_template_items_templateId_orden_idx" ON "checklist_template_items"("templateId", "orden");

-- Checklist Items Ejecución
CREATE INDEX IF NOT EXISTS "checklist_item_ejecucion_checklistId_idx" ON "checklist_item_ejecucion"("checklistId");
CREATE INDEX IF NOT EXISTS "checklist_item_ejecucion_estado_idx" ON "checklist_item_ejecucion"("estado");
CREATE INDEX IF NOT EXISTS "checklist_item_ejecucion_completadoPorId_idx" ON "checklist_item_ejecucion"("completadoPorId");

-- Fotos Evidencia
CREATE INDEX IF NOT EXISTS "fotos_evidencia_ejecucionId_idx" ON "fotos_evidencia"("ejecucionId");
CREATE INDEX IF NOT EXISTS "fotos_evidencia_checklistId_idx" ON "fotos_evidencia"("checklistId");
CREATE INDEX IF NOT EXISTS "fotos_evidencia_sincronizado_idx" ON "fotos_evidencia"("sincronizado");

-- Inspecciones Línea Vida
CREATE UNIQUE INDEX IF NOT EXISTS "inspecciones_linea_vida_numeroLinea_fechaInspeccion_key" ON "inspecciones_linea_vida"("numeroLinea", "fechaInspeccion");
CREATE INDEX IF NOT EXISTS "inspecciones_linea_vida_estado_idx" ON "inspecciones_linea_vida"("estado");
CREATE INDEX IF NOT EXISTS "inspecciones_linea_vida_inspectorId_idx" ON "inspecciones_linea_vida"("inspectorId");

-- Equipos HES
CREATE UNIQUE INDEX IF NOT EXISTS "equipos_hes_numero_key" ON "equipos_hes"("numero");
CREATE INDEX IF NOT EXISTS "equipos_hes_estado_tipo_idx" ON "equipos_hes"("estado", "tipo");

-- Inspecciones HES
CREATE INDEX IF NOT EXISTS "inspecciones_hes_equipoId_estado_idx" ON "inspecciones_hes"("equipoId", "estado");
CREATE INDEX IF NOT EXISTS "inspecciones_hes_ordenId_idx" ON "inspecciones_hes"("ordenId");

-- Orden Equipos HES
CREATE UNIQUE INDEX IF NOT EXISTS "orden_equipos_hes_ordenId_equipoId_key" ON "orden_equipos_hes"("ordenId", "equipoId");

-- Equipos
CREATE UNIQUE INDEX IF NOT EXISTS "equipos_codigo_key" ON "equipos"("codigo");
CREATE INDEX IF NOT EXISTS "equipos_activo_idx" ON "equipos"("activo");

-- Mantenimientos
CREATE INDEX IF NOT EXISTS "mantenimientos_equipoId_estado_idx" ON "mantenimientos"("equipoId", "estado");
CREATE INDEX IF NOT EXISTS "mantenimientos_fechaProgramada_estado_idx" ON "mantenimientos"("fechaProgramada", "estado");
CREATE INDEX IF NOT EXISTS "mantenimientos_tecnicoAsignadoId_idx" ON "mantenimientos"("tecnicoAsignadoId");

-- Actas
CREATE UNIQUE INDEX IF NOT EXISTS "actas_numero_key" ON "actas"("numero");
CREATE UNIQUE INDEX IF NOT EXISTS "actas_ordenId_key" ON "actas"("ordenId");
CREATE INDEX IF NOT EXISTS "actas_estado_idx" ON "actas"("estado");

-- SES
CREATE UNIQUE INDEX IF NOT EXISTS "ses_numeroSES_key" ON "ses"("numeroSES");
CREATE UNIQUE INDEX IF NOT EXISTS "ses_ordenId_key" ON "ses"("ordenId");
CREATE INDEX IF NOT EXISTS "ses_estado_idx" ON "ses"("estado");

-- Facturas
CREATE UNIQUE INDEX IF NOT EXISTS "facturas_numeroFactura_key" ON "facturas"("numeroFactura");
CREATE UNIQUE INDEX IF NOT EXISTS "facturas_ordenId_key" ON "facturas"("ordenId");
CREATE INDEX IF NOT EXISTS "facturas_estado_idx" ON "facturas"("estado");
CREATE INDEX IF NOT EXISTS "facturas_fechaVencimiento_estado_idx" ON "facturas"("fechaVencimiento", "estado");

-- Cierre Administrativo
CREATE UNIQUE INDEX IF NOT EXISTS "cierre_administrativo_ordenId_key" ON "cierre_administrativo"("ordenId");
CREATE INDEX IF NOT EXISTS "cierre_administrativo_estaCompleto_idx" ON "cierre_administrativo"("estaCompleto");

-- Archivos Históricos
CREATE UNIQUE INDEX IF NOT EXISTS "archivos_historicos_mes_anio_tipo_key" ON "archivos_historicos"("mes", "anio", "tipo");
CREATE INDEX IF NOT EXISTS "archivos_historicos_disponible_idx" ON "archivos_historicos"("disponible");

-- Kit Items
CREATE INDEX IF NOT EXISTS "kit_items_kitId_idx" ON "kit_items"("kitId");

-- Formularios
CREATE INDEX IF NOT EXISTS "formulario_respuestas_templateId_ordenId_idx" ON "formulario_respuestas"("templateId", "ordenId");
CREATE INDEX IF NOT EXISTS "formulario_respuestas_legacy_formularioId_idx" ON "formulario_respuestas_legacy"("formularioId");

-- Pending Syncs
CREATE INDEX IF NOT EXISTS "pending_syncs_userId_status_idx" ON "pending_syncs"("userId", "status");
CREATE INDEX IF NOT EXISTS "pending_syncs_entityType_status_idx" ON "pending_syncs"("entityType", "status");

-- Orders (mejoras)
CREATE INDEX IF NOT EXISTS "orders_requiereHES_cumplimientoHES_idx" ON "orders"("requiereHES", "cumplimientoHES");

-- Checklist Ejecución
CREATE INDEX IF NOT EXISTS "checklist_ejecucion_templateId_idx" ON "checklist_ejecucion"("templateId");
CREATE INDEX IF NOT EXISTS "checklist_ejecucion_completadoPorId_idx" ON "checklist_ejecucion"("completadoPorId");

-- ==========================================
-- FOREIGN KEYS
-- ==========================================

-- Kits
ALTER TABLE "kit_items" 
  ADD CONSTRAINT "kit_items_kitId_fkey" 
  FOREIGN KEY ("kitId") REFERENCES "kits"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Planeaciones
ALTER TABLE "planeaciones" 
  ADD CONSTRAINT "planeaciones_kitId_fkey" 
  FOREIGN KEY ("kitId") REFERENCES "kits_tipicos"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "items_planeacion" 
  ADD CONSTRAINT "items_planeacion_planeacionId_fkey" 
  FOREIGN KEY ("planeacionId") REFERENCES "planeaciones"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Checklist Templates
ALTER TABLE "checklist_templates" 
  ADD CONSTRAINT "checklist_templates_createdBy_fkey" 
  FOREIGN KEY ("createdBy") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "checklist_template_items" 
  ADD CONSTRAINT "checklist_template_items_templateId_fkey" 
  FOREIGN KEY ("templateId") REFERENCES "checklist_templates"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "checklist_ejecucion" 
  ADD CONSTRAINT "checklist_ejecucion_templateId_fkey" 
  FOREIGN KEY ("templateId") REFERENCES "checklist_templates"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "checklist_ejecucion" 
  ADD CONSTRAINT "checklist_ejecucion_completadoPorId_fkey" 
  FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "checklist_item_ejecucion" 
  ADD CONSTRAINT "checklist_item_ejecucion_checklistId_fkey" 
  FOREIGN KEY ("checklistId") REFERENCES "checklist_ejecucion"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "checklist_item_ejecucion" 
  ADD CONSTRAINT "checklist_item_ejecucion_templateItemId_fkey" 
  FOREIGN KEY ("templateItemId") REFERENCES "checklist_template_items"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "checklist_item_ejecucion" 
  ADD CONSTRAINT "checklist_item_ejecucion_completadoPorId_fkey" 
  FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Fotos Evidencia
ALTER TABLE "fotos_evidencia" 
  ADD CONSTRAINT "fotos_evidencia_ejecucionId_fkey" 
  FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "fotos_evidencia" 
  ADD CONSTRAINT "fotos_evidencia_checklistId_fkey" 
  FOREIGN KEY ("checklistId") REFERENCES "checklist_ejecucion"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "fotos_evidencia" 
  ADD CONSTRAINT "fotos_evidencia_checklistItemId_fkey" 
  FOREIGN KEY ("checklistItemId") REFERENCES "checklist_item_ejecucion"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "fotos_evidencia" 
  ADD CONSTRAINT "fotos_evidencia_cargadoPorId_fkey" 
  FOREIGN KEY ("cargadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Evidencias Ejecución
ALTER TABLE "evidencias_ejecucion" 
  ADD CONSTRAINT "evidencias_ejecucion_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Líneas de Vida
ALTER TABLE "inspecciones_linea_vida" 
  ADD CONSTRAINT "inspecciones_linea_vida_lineaVidaId_fkey" 
  FOREIGN KEY ("lineaVidaId") REFERENCES "lineas_vida"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "inspecciones_linea_vida" 
  ADD CONSTRAINT "inspecciones_linea_vida_inspectorId_fkey" 
  FOREIGN KEY ("inspectorId") REFERENCES "users"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "componentes_linea_vida" 
  ADD CONSTRAINT "componentes_linea_vida_inspeccionId_fkey" 
  FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones_linea_vida"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "condiciones_componente" 
  ADD CONSTRAINT "condiciones_componente_componenteId_fkey" 
  FOREIGN KEY ("componenteId") REFERENCES "componentes_linea_vida"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inspecciones_linea_vida_legacy" 
  ADD CONSTRAINT "inspecciones_linea_vida_legacy_lineaVidaId_fkey" 
  FOREIGN KEY ("lineaVidaId") REFERENCES "lineas_vida"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inspecciones_linea_vida_legacy" 
  ADD CONSTRAINT "inspecciones_linea_vida_legacy_inspectorId_fkey" 
  FOREIGN KEY ("inspectorId") REFERENCES "users"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Equipos HES
ALTER TABLE "inspecciones_hes" 
  ADD CONSTRAINT "inspecciones_hes_equipoId_fkey" 
  FOREIGN KEY ("equipoId") REFERENCES "equipos_hes"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inspecciones_hes" 
  ADD CONSTRAINT "inspecciones_hes_inspectorId_fkey" 
  FOREIGN KEY ("inspectorId") REFERENCES "users"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inspecciones_hes" 
  ADD CONSTRAINT "inspecciones_hes_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "inspeccion_items" 
  ADD CONSTRAINT "inspeccion_items_inspeccionId_fkey" 
  FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones_hes"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "orden_equipos_hes" 
  ADD CONSTRAINT "orden_equipos_hes_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "orden_equipos_hes" 
  ADD CONSTRAINT "orden_equipos_hes_equipoId_fkey" 
  FOREIGN KEY ("equipoId") REFERENCES "equipos_hes"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hes_registros" 
  ADD CONSTRAINT "hes_registros_equipoId_fkey" 
  FOREIGN KEY ("equipoId") REFERENCES "equipos_hes"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "hes_registros" 
  ADD CONSTRAINT "hes_registros_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "hes_registros" 
  ADD CONSTRAINT "hes_registros_inspectorId_fkey" 
  FOREIGN KEY ("inspectorId") REFERENCES "users"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Equipos y Mantenimientos
ALTER TABLE "equipos" 
  ADD CONSTRAINT "equipos_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "mantenimientos" 
  ADD CONSTRAINT "mantenimientos_equipoId_fkey" 
  FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mantenimientos" 
  ADD CONSTRAINT "mantenimientos_tecnicoAsignadoId_fkey" 
  FOREIGN KEY ("tecnicoAsignadoId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "mantenimientos" 
  ADD CONSTRAINT "mantenimientos_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "mantenimientos" 
  ADD CONSTRAINT "mantenimientos_actualizadoPorId_fkey" 
  FOREIGN KEY ("actualizadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "mantenimientos" 
  ADD CONSTRAINT "mantenimientos_mantenimientoPadreId_fkey" 
  FOREIGN KEY ("mantenimientoPadreId") REFERENCES "mantenimientos"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Formularios
ALTER TABLE "formulario_templates" 
  ADD CONSTRAINT "formulario_templates_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "formulario_respuestas" 
  ADD CONSTRAINT "formulario_respuestas_templateId_fkey" 
  FOREIGN KEY ("templateId") REFERENCES "formulario_templates"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "formulario_respuestas" 
  ADD CONSTRAINT "formulario_respuestas_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "formulario_respuestas" 
  ADD CONSTRAINT "formulario_respuestas_completadoPorId_fkey" 
  FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "formulario_respuestas_legacy" 
  ADD CONSTRAINT "formulario_respuestas_legacy_formularioId_fkey" 
  FOREIGN KEY ("formularioId") REFERENCES "formularios"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "formulario_respuestas_legacy" 
  ADD CONSTRAINT "formulario_respuestas_legacy_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "formulario_respuestas_legacy" 
  ADD CONSTRAINT "formulario_respuestas_legacy_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Cierre Administrativo
ALTER TABLE "actas" 
  ADD CONSTRAINT "actas_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "actas" 
  ADD CONSTRAINT "actas_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "actas" 
  ADD CONSTRAINT "actas_aprobadoPorId_fkey" 
  FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ses" 
  ADD CONSTRAINT "ses_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ses" 
  ADD CONSTRAINT "ses_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ses" 
  ADD CONSTRAINT "ses_aprobadoPorId_fkey" 
  FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "facturas" 
  ADD CONSTRAINT "facturas_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "facturas" 
  ADD CONSTRAINT "facturas_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "facturas" 
  ADD CONSTRAINT "facturas_aprobadoPorId_fkey" 
  FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cierre_administrativo" 
  ADD CONSTRAINT "cierre_administrativo_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cierre_administrativo" 
  ADD CONSTRAINT "cierre_administrativo_actaId_fkey" 
  FOREIGN KEY ("actaId") REFERENCES "actas"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cierre_administrativo" 
  ADD CONSTRAINT "cierre_administrativo_sesId_fkey" 
  FOREIGN KEY ("sesId") REFERENCES "ses"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cierre_administrativo" 
  ADD CONSTRAINT "cierre_administrativo_facturaId_fkey" 
  FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Archivos Históricos
ALTER TABLE "archivos_historicos" 
  ADD CONSTRAINT "archivos_historicos_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Pending Syncs
ALTER TABLE "pending_syncs" 
  ADD CONSTRAINT "pending_syncs_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger para actualizar porcentaje de cierre administrativo
CREATE OR REPLACE FUNCTION actualizar_porcentaje_cierre()
RETURNS TRIGGER AS $$
DECLARE
  v_porcentaje INTEGER := 0;
BEGIN
  -- Acta firmada: 33%
  IF EXISTS (SELECT 1 FROM actas WHERE id = NEW."actaId" AND estado = 'FIRMADA') THEN
    v_porcentaje := v_porcentaje + 33;
  END IF;

  -- SES aprobada: 33%
  IF EXISTS (SELECT 1 FROM ses WHERE id = NEW."sesId" AND estado = 'APROBADA') THEN
    v_porcentaje := v_porcentaje + 33;
  END IF;

  -- Factura pagada: 34%
  IF EXISTS (SELECT 1 FROM facturas WHERE id = NEW."facturaId" AND estado = 'PAGADA') THEN
    v_porcentaje := v_porcentaje + 34;
  END IF;

  NEW."porcentajeCompletado" := v_porcentaje;
  NEW."estaCompleto" := (v_porcentaje = 100);

  IF NEW."estaCompleto" AND NEW."fechaCierreCompleto" IS NULL THEN
    NEW."fechaCierreCompleto" := CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cierre_actualizar_porcentaje
  BEFORE INSERT OR UPDATE ON "cierre_administrativo"
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_porcentaje_cierre();

-- Trigger para actualizar días sin firmar acta
CREATE OR REPLACE FUNCTION actualizar_dias_sin_firmar()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado != 'FIRMADA' AND NEW."fechaEmision" IS NOT NULL THEN
    NEW."diasSinFirmar" := EXTRACT(DAY FROM (CURRENT_TIMESTAMP - NEW."fechaEmision"));
  ELSE
    NEW."diasSinFirmar" := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actas_calcular_dias_sin_firmar
  BEFORE INSERT OR UPDATE ON "actas"
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_dias_sin_firmar();
