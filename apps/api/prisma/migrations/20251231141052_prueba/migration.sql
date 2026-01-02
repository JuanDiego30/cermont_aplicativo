-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'supervisor', 'tecnico', 'administrativo', 'gerente');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pendiente', 'planeacion', 'ejecucion', 'completada', 'cancelada', 'pausada');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('baja', 'media', 'alta', 'urgente');

-- CreateEnum
CREATE TYPE "EstadoPlaneacion" AS ENUM ('borrador', 'en_revision', 'aprobada', 'en_ejecucion', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "EstadoEjecucion" AS ENUM ('no_iniciada', 'en_progreso', 'pausada', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "EstadoInspeccion" AS ENUM ('conforme', 'no_conforme', 'pendiente');

-- CreateEnum
CREATE TYPE "TipoMantenimiento" AS ENUM ('preventivo', 'correctivo', 'predictivo');

-- CreateEnum
CREATE TYPE "EstadoMantenimiento" AS ENUM ('programado', 'en_progreso', 'completado', 'cancelado', 'pendiente');

-- CreateEnum
CREATE TYPE "PrioridadMantenimiento" AS ENUM ('baja', 'media', 'alta', 'critica');

-- CreateEnum
CREATE TYPE "EstadoActa" AS ENUM ('borrador', 'generada', 'enviada', 'firmada', 'rechazada');

-- CreateEnum
CREATE TYPE "EstadoSES" AS ENUM ('no_creada', 'creada', 'enviada', 'aprobada', 'rechazada');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('no_creada', 'generada', 'enviada', 'aprobada', 'pagada', 'rechazada');

-- CreateEnum
CREATE TYPE "TipoArchivo" AS ENUM ('ordenes_csv', 'evidencias_zip', 'informes_pdf', 'backup_completo');

-- CreateEnum
CREATE TYPE "OrderSubState" AS ENUM ('solicitud_recibida', 'visita_programada', 'propuesta_elaborada', 'propuesta_aprobada', 'planeacion_iniciada', 'planeacion_aprobada', 'ejecucion_iniciada', 'ejecucion_completada', 'informe_generado', 'acta_elaborada', 'acta_firmada', 'ses_aprobada', 'factura_aprobada', 'pago_recibido');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('acta_sin_firmar', 'ses_pendiente', 'factura_vencida', 'recurso_faltante', 'certificacion_vencida', 'retraso_cronograma', 'propuesta_sin_respuesta');

-- CreateEnum
CREATE TYPE "PrioridadAlerta" AS ENUM ('info', 'warning', 'error', 'critical');

-- CreateEnum
CREATE TYPE "TipoFormulario" AS ENUM ('checklist', 'inspeccion', 'mantenimiento', 'reporte', 'certificacion', 'hes', 'otro');

-- CreateEnum
CREATE TYPE "EstadoFormulario" AS ENUM ('borrador', 'en_revision', 'completado', 'rechazado');

-- CreateEnum
CREATE TYPE "TipoEvidencia" AS ENUM ('foto', 'video', 'documento', 'audio', 'otro');

-- CreateEnum
CREATE TYPE "TipoCosto" AS ENUM ('material', 'mano_obra', 'equipo', 'transporte', 'otro');

-- CreateEnum
CREATE TYPE "MantenimientoPeriodicidad" AS ENUM ('SEMANAL', 'QUINCENAL', 'MENSUAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'NO_APLICA');

-- CreateEnum
CREATE TYPE "EstadoHES" AS ENUM ('BORRADOR', 'COMPLETADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "TipoServicio" AS ENUM ('MANTENIMIENTO_PREVENTIVO', 'MANTENIMIENTO_CORRECTIVO', 'REPARACION', 'INSTALACION', 'INSPECCION', 'DIAGNOSTICO', 'GARANTIA');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "NivelRiesgo" AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'CRITICO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'tecnico',
    "phone" TEXT,
    "avatar" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "googleId" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'local',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "previousData" JSONB,
    "newData" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fechaExpedicion" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "archivo" TEXT,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_templates" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_template_items" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "requereCertificacion" BOOLEAN NOT NULL DEFAULT false,
    "criticidad" TEXT DEFAULT 'normal',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_ejecucion" (
    "id" TEXT NOT NULL,
    "ejecucionId" TEXT NOT NULL,
    "templateId" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "completadoPorId" TEXT,
    "completadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_ejecucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_item_ejecucion" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "templateItemId" TEXT,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "completadoPorId" TEXT,
    "completadoEn" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_item_ejecucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "estado" "EstadoActa" NOT NULL DEFAULT 'borrador',
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
    "cargoFirmaTecnico" TEXT,
    "cargoFirmaCliente" TEXT,
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

-- CreateTable
CREATE TABLE "ses" (
    "id" TEXT NOT NULL,
    "numeroSES" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "estado" "EstadoSES" NOT NULL DEFAULT 'no_creada',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEnvio" TIMESTAMP(3),
    "fechaAprobacion" TIMESTAMP(3),
    "codigoAriba" TEXT,
    "urlAriba" TEXT,
    "numeroPO" TEXT,
    "descripcionServicio" TEXT NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "observaciones" TEXT,
    "alertaEnviada" BOOLEAN NOT NULL DEFAULT false,
    "diasSinAprobar" INTEGER NOT NULL DEFAULT 0,
    "creadoPorId" TEXT,
    "aprobadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" TEXT NOT NULL,
    "numeroFactura" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'no_creada',
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3),
    "fechaAprobacion" TIMESTAMP(3),
    "fechaPago" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL,
    "impuestos" DOUBLE PRECISION NOT NULL,
    "descuentos" DOUBLE PRECISION DEFAULT 0,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "conceptos" TEXT NOT NULL,
    "observaciones" TEXT,
    "archivoFacturaPDF" TEXT,
    "adjuntos" TEXT[],
    "codigoAriba" TEXT,
    "urlAriba" TEXT,
    "numeroSAP" TEXT,
    "alertaEnviada" BOOLEAN NOT NULL DEFAULT false,
    "diasVencidos" INTEGER NOT NULL DEFAULT 0,
    "creadoPorId" TEXT,
    "aprobadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cierre_administrativo" (
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
    "diasTranscurridos" INTEGER NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "bloqueos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cierre_administrativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejecuciones" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "planeacionId" TEXT NOT NULL,
    "estado" "EstadoEjecucion" NOT NULL DEFAULT 'no_iniciada',
    "avancePercentaje" INTEGER NOT NULL DEFAULT 0,
    "horasActuales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "horasEstimadas" DOUBLE PRECISION NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaTermino" TIMESTAMP(3),
    "ubicacionGPS" JSONB,
    "observacionesInicio" TEXT,
    "observaciones" TEXT,
    "sincronizado" BOOLEAN NOT NULL DEFAULT false,
    "iniciadoPorId" TEXT,
    "finalizadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ejecuciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas_ejecucion" (
    "id" TEXT NOT NULL,
    "ejecucionId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "horasEstimadas" DOUBLE PRECISION NOT NULL,
    "horasReales" DOUBLE PRECISION,
    "observaciones" TEXT,
    "completadaEn" TIMESTAMP(3),
    "completadaPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tareas_ejecucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_evidencia" (
    "id" TEXT NOT NULL,
    "ejecucionId" TEXT,
    "checklistId" TEXT,
    "checklistItemId" TEXT,
    "url" TEXT NOT NULL,
    "urlThumbnail" TEXT,
    "descripcion" TEXT,
    "fase" TEXT,
    "tamanoBytes" BIGINT,
    "mimeType" TEXT,
    "cargadoPorId" TEXT,
    "cargadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sincronizado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fotos_evidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias_ejecucion" (
    "id" TEXT NOT NULL,
    "ejecucionId" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "rutaArchivo" TEXT NOT NULL,
    "tamano" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "descripcion" TEXT NOT NULL,
    "ubicacionGPS" JSONB,
    "tags" TEXT[],
    "subidoPor" TEXT NOT NULL,
    "verificada" BOOLEAN NOT NULL DEFAULT false,
    "verificadoPor" TEXT,
    "verificadoEn" TIMESTAMP(3),
    "thumbnailPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "metadata" JSONB,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidencias_ejecucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_templates" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoFormulario" NOT NULL,
    "categoria" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "schema" JSONB NOT NULL,
    "uiSchema" JSONB,
    "descripcion" TEXT,
    "tags" TEXT[],
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios_instancias" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "ordenId" TEXT,
    "data" JSONB NOT NULL,
    "completadoPorId" TEXT,
    "revisadoPorId" TEXT,
    "completadoEn" TIMESTAMP(3),
    "revisadoEn" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formularios_instancias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formulario_templates" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "schema" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formulario_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formulario_respuestas" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "ordenId" TEXT,
    "respuestas" TEXT NOT NULL,
    "completadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formulario_respuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hojas_entrada_servicio" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "estado" "EstadoHES" NOT NULL DEFAULT 'BORRADOR',
    "version" INTEGER NOT NULL DEFAULT 1,
    "tipoServicio" "TipoServicio" NOT NULL,
    "prioridad" "Prioridad" NOT NULL,
    "nivelRiesgo" "NivelRiesgo" NOT NULL DEFAULT 'BAJO',
    "clienteInfo" JSONB NOT NULL,
    "condicionesEntrada" JSONB,
    "diagnosticoPreliminar" JSONB,
    "requerimientosSeguridad" JSONB,
    "firmaCliente" JSONB,
    "firmaTecnico" JSONB,
    "firmadoClienteAt" TIMESTAMP(3),
    "firmadoTecnicoAt" TIMESTAMP(3),
    "creadoPor" TEXT NOT NULL,
    "completadoEn" TIMESTAMP(3),
    "anuladoEn" TIMESTAMP(3),
    "anuladoPor" TEXT,
    "motivoAnulacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hojas_entrada_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos_hes" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "codigo" TEXT,
    "marca" TEXT NOT NULL,
    "modelo" TEXT,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'disponible',
    "fechaCompra" TIMESTAMP(3),
    "fechaFabricacion" TIMESTAMP(3),
    "vidaUtilAnios" INTEGER,
    "ultimaInspeccion" TIMESTAMP(3),
    "proximaInspeccion" TIMESTAMP(3),
    "especificaciones" JSONB,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_hes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspecciones_hes" (
    "id" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "ordenId" TEXT,
    "fechaInspeccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,
    "observaciones" TEXT,
    "fotosEvidencia" TEXT[],
    "aprobada" BOOLEAN NOT NULL DEFAULT false,
    "aprobadaEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspecciones_hes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspeccion_items" (
    "id" TEXT NOT NULL,
    "inspeccionId" TEXT NOT NULL,
    "rubro" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL,
    "conforme" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,

    CONSTRAINT "inspeccion_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_equipos_hes" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "estado" TEXT NOT NULL DEFAULT 'asignado',
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDevolucion" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orden_equipos_hes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspecciones_linea_vida" (
    "id" TEXT NOT NULL,
    "numeroLinea" TEXT NOT NULL,
    "fabricante" TEXT NOT NULL,
    "diametroCable" TEXT NOT NULL DEFAULT '8mm',
    "tipoCable" TEXT NOT NULL DEFAULT 'Acero Inoxidable',
    "ubicacion" TEXT NOT NULL,
    "especificaciones" JSONB,
    "fechaInspeccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInstalacion" TIMESTAMP(3),
    "fechaUltimoMantenimiento" TIMESTAMP(3),
    "proximaInspeccion" TIMESTAMP(3),
    "estado" "EstadoInspeccion" NOT NULL DEFAULT 'pendiente',
    "accionesCorrectivas" TEXT,
    "observaciones" TEXT,
    "fotosEvidencia" TEXT[],
    "inspectorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspecciones_linea_vida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "componentes_linea_vida" (
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

-- CreateTable
CREATE TABLE "condiciones_componente" (
    "id" TEXT NOT NULL,
    "componenteId" TEXT NOT NULL,
    "tipoAfeccion" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "severidad" TEXT DEFAULT 'media',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condiciones_componente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kits" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kit_items" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "unidad" TEXT NOT NULL DEFAULT 'UND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kit_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios" (
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

-- CreateTable
CREATE TABLE "formulario_respuestas_legacy" (
    "id" TEXT NOT NULL,
    "formularioId" TEXT NOT NULL,
    "ordenId" TEXT,
    "respuestas" JSONB NOT NULL,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formulario_respuestas_legacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hes_registros" (
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

-- CreateTable
CREATE TABLE "lineas_vida" (
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

    CONSTRAINT "lineas_vida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspecciones_linea_vida_legacy" (
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

-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "serie" TEXT,
    "categoria" TEXT,
    "ubicacion" TEXT,
    "fechaAdquisicion" TIMESTAMP(3),
    "fechaUltimoMantenimiento" TIMESTAMP(3),
    "intervaloMantenimientoDias" INTEGER,
    "proximoMantenimiento" TIMESTAMP(3),
    "valorAdquisicion" DOUBLE PRECISION,
    "vidaUtilEstimada" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mantenimientos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoMantenimiento" NOT NULL,
    "estado" "EstadoMantenimiento" NOT NULL DEFAULT 'programado',
    "prioridad" "PrioridadMantenimiento" NOT NULL DEFAULT 'media',
    "periodicidad" "MantenimientoPeriodicidad" NOT NULL DEFAULT 'NO_APLICA',
    "fechaProgramada" TIMESTAMP(3) NOT NULL,
    "duracionEstimada" DOUBLE PRECISION,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "activoId" TEXT NOT NULL,
    "activoTipo" TEXT,
    "tecnicoId" TEXT,
    "tareas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "materiales" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "observaciones" TEXT,
    "trabajoRealizado" TEXT,
    "tareasCompletadas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "problemasEncontrados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "repuestosUtilizados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "requiereSeguimiento" BOOLEAN NOT NULL DEFAULT false,
    "calificacionFinal" DOUBLE PRECISION,
    "recomendaciones" TEXT,
    "evidenciaIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "costoTotal" DOUBLE PRECISION,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "contactoCliente" TEXT,
    "telefonoCliente" TEXT,
    "direccion" TEXT,
    "estado" "OrderStatus" NOT NULL DEFAULT 'pendiente',
    "subEstado" "OrderSubState" NOT NULL DEFAULT 'solicitud_recibida',
    "prioridad" "OrderPriority" NOT NULL DEFAULT 'media',
    "fechaFinEstimada" TIMESTAMP(3),
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "presupuestoEstimado" DOUBLE PRECISION DEFAULT 0,
    "costoReal" DOUBLE PRECISION DEFAULT 0,
    "varianzaCosto" DOUBLE PRECISION DEFAULT 0,
    "impuestosAplicables" DOUBLE PRECISION DEFAULT 0,
    "margenUtilidad" DOUBLE PRECISION DEFAULT 0,
    "requiereHES" BOOLEAN NOT NULL DEFAULT true,
    "cumplimientoHES" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "motivoCancelacion" TEXT,
    "canceladaEn" TIMESTAMP(3),
    "canceladaPorId" TEXT,
    "creadorId" TEXT,
    "asignadoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "delete_reason" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "unidad" TEXT NOT NULL DEFAULT 'UND',
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "completadoEn" TIMESTAMP(3),
    "completadoPorId" TEXT,
    "notas" TEXT,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidences" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEvidencia" NOT NULL,
    "url" TEXT NOT NULL,
    "urlThumbnail" TEXT,
    "descripcion" TEXT,
    "tamanoBytes" BIGINT,
    "mimeType" TEXT,
    "metadata" JSONB,
    "orderId" TEXT NOT NULL,
    "subidoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costs" (
    "id" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "tipo" "TipoCosto" NOT NULL,
    "descripcion" TEXT,
    "cantidad" INTEGER DEFAULT 1,
    "precioUnitario" DOUBLE PRECISION,
    "facturable" BOOLEAN NOT NULL DEFAULT true,
    "facturado" BOOLEAN NOT NULL DEFAULT false,
    "numeroFactura" TEXT,
    "orderId" TEXT NOT NULL,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_state_history" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "fromState" "OrderSubState",
    "toState" "OrderSubState" NOT NULL,
    "userId" TEXT,
    "notas" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_state_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitas_tecnicas" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "fechaProgramada" TIMESTAMP(3) NOT NULL,
    "fechaRealizada" TIMESTAMP(3),
    "duracionMinutos" INTEGER,
    "tecnicoId" TEXT NOT NULL,
    "mediciones" JSONB,
    "fotosUrl" TEXT[],
    "observaciones" TEXT,
    "coordenadas" JSONB,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitas_tecnicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propuestas_economicas" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "costoManoObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costoMateriales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costoEquipos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costoTransporte" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otrosCostos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impuestos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "margenUtilidad" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "numeroVersion" INTEGER NOT NULL DEFAULT 1,
    "aprobada" BOOLEAN NOT NULL DEFAULT false,
    "numeroPO" TEXT,
    "fechaEnvio" TIMESTAMP(3),
    "fechaAprobacion" TIMESTAMP(3),
    "fechaRechazo" TIMESTAMP(3),
    "motivoRechazo" TEXT,
    "urlArchivo" TEXT,
    "creadoPorId" TEXT,
    "aprobadoPorId" TEXT,
    "rechazadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propuestas_economicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_automaticas" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAlerta" NOT NULL,
    "prioridad" "PrioridadAlerta" NOT NULL DEFAULT 'info',
    "ordenId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "usuarioId" TEXT,
    "resueltoPorId" TEXT,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leidaAt" TIMESTAMP(3),
    "resueltaAt" TIMESTAMP(3),

    CONSTRAINT "alertas_automaticas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparativa_costos" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "estimadoManoObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimadoMateriales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimadoEquipos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimadoTransporte" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimadoOtros" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEstimado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realManoObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realMateriales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realEquipos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realTransporte" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realOtros" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "varianzaPorcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "margenRealizado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comparativa_costos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kits_tipicos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT,
    "herramientas" JSONB NOT NULL,
    "equipos" JSONB NOT NULL,
    "materiales" JSONB,
    "documentos" TEXT[],
    "checklistItems" TEXT[],
    "duracionEstimadaHoras" INTEGER NOT NULL,
    "costoEstimado" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kits_tipicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planeaciones" (
    "id" TEXT NOT NULL,
    "estado" "EstadoPlaneacion" NOT NULL DEFAULT 'borrador',
    "empresa" TEXT,
    "ubicacion" TEXT,
    "fechaEstimadaInicio" TIMESTAMP(3),
    "fechaEstimadaFin" TIMESTAMP(3),
    "descripcionTrabajo" TEXT,
    "cronograma" JSONB NOT NULL,
    "manoDeObra" JSONB NOT NULL,
    "herramientasAdicionales" JSONB,
    "materialesAdicionales" JSONB,
    "documentosApoyo" TEXT[],
    "observaciones" TEXT,
    "motivoRechazo" TEXT,
    "rechazadoEn" TIMESTAMP(3),
    "rechazadoPorId" TEXT,
    "aprobadoPorId" TEXT,
    "fechaAprobacion" TIMESTAMP(3),
    "ordenId" TEXT NOT NULL,
    "kitId" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planeaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_planeacion" (
    "id" TEXT NOT NULL,
    "planeacionId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "unidad" TEXT NOT NULL DEFAULT 'UND',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_planeacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "deviceId" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivos_historicos" (
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

    CONSTRAINT "archivos_historicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_syncs" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_active_idx" ON "users"("active");

-- CreateIndex
CREATE INDEX "users_email_active_idx" ON "users"("email", "active");

-- CreateIndex
CREATE INDEX "users_googleId_idx" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_authProvider_idx" ON "users"("authProvider");

-- CreateIndex
CREATE INDEX "users_emailVerified_idx" ON "users"("emailVerified");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_expiresAt_idx" ON "refresh_tokens"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_isRevoked_idx" ON "refresh_tokens"("userId", "isRevoked");

-- CreateIndex
CREATE INDEX "refresh_tokens_family_idx" ON "refresh_tokens"("family");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_usedAt_idx" ON "password_reset_tokens"("userId", "usedAt");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_action_idx" ON "audit_logs"("userId", "action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "two_factor_tokens_userId_idx" ON "two_factor_tokens"("userId");

-- CreateIndex
CREATE INDEX "two_factor_tokens_code_idx" ON "two_factor_tokens"("code");

-- CreateIndex
CREATE INDEX "two_factor_tokens_expiresAt_idx" ON "two_factor_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "two_factor_tokens_userId_verified_idx" ON "two_factor_tokens"("userId", "verified");

-- CreateIndex
CREATE INDEX "certificados_userId_activo_idx" ON "certificados"("userId", "activo");

-- CreateIndex
CREATE INDEX "certificados_fechaVencimiento_idx" ON "certificados"("fechaVencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_templates_nombre_key" ON "checklist_templates"("nombre");

-- CreateIndex
CREATE INDEX "checklist_templates_tipo_activo_idx" ON "checklist_templates"("tipo", "activo");

-- CreateIndex
CREATE INDEX "checklist_templates_categoria_idx" ON "checklist_templates"("categoria");

-- CreateIndex
CREATE INDEX "checklist_templates_creadoPorId_idx" ON "checklist_templates"("creadoPorId");

-- CreateIndex
CREATE INDEX "checklist_template_items_templateId_orden_idx" ON "checklist_template_items"("templateId", "orden");

-- CreateIndex
CREATE INDEX "checklist_ejecucion_ejecucionId_completada_idx" ON "checklist_ejecucion"("ejecucionId", "completada");

-- CreateIndex
CREATE INDEX "checklist_ejecucion_templateId_idx" ON "checklist_ejecucion"("templateId");

-- CreateIndex
CREATE INDEX "checklist_ejecucion_completadoPorId_idx" ON "checklist_ejecucion"("completadoPorId");

-- CreateIndex
CREATE INDEX "checklist_item_ejecucion_checklistId_estado_idx" ON "checklist_item_ejecucion"("checklistId", "estado");

-- CreateIndex
CREATE INDEX "checklist_item_ejecucion_templateItemId_idx" ON "checklist_item_ejecucion"("templateItemId");

-- CreateIndex
CREATE INDEX "checklist_item_ejecucion_completadoPorId_idx" ON "checklist_item_ejecucion"("completadoPorId");

-- CreateIndex
CREATE UNIQUE INDEX "actas_numero_key" ON "actas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "actas_ordenId_key" ON "actas"("ordenId");

-- CreateIndex
CREATE INDEX "actas_estado_idx" ON "actas"("estado");

-- CreateIndex
CREATE INDEX "actas_numero_idx" ON "actas"("numero");

-- CreateIndex
CREATE INDEX "actas_creadoPorId_idx" ON "actas"("creadoPorId");

-- CreateIndex
CREATE UNIQUE INDEX "ses_numeroSES_key" ON "ses"("numeroSES");

-- CreateIndex
CREATE UNIQUE INDEX "ses_ordenId_key" ON "ses"("ordenId");

-- CreateIndex
CREATE INDEX "ses_estado_idx" ON "ses"("estado");

-- CreateIndex
CREATE INDEX "ses_numeroSES_idx" ON "ses"("numeroSES");

-- CreateIndex
CREATE INDEX "ses_creadoPorId_idx" ON "ses"("creadoPorId");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numeroFactura_key" ON "facturas"("numeroFactura");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_ordenId_key" ON "facturas"("ordenId");

-- CreateIndex
CREATE INDEX "facturas_estado_idx" ON "facturas"("estado");

-- CreateIndex
CREATE INDEX "facturas_numeroFactura_idx" ON "facturas"("numeroFactura");

-- CreateIndex
CREATE INDEX "facturas_creadoPorId_idx" ON "facturas"("creadoPorId");

-- CreateIndex
CREATE UNIQUE INDEX "cierre_administrativo_ordenId_key" ON "cierre_administrativo"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "cierre_administrativo_actaId_key" ON "cierre_administrativo"("actaId");

-- CreateIndex
CREATE UNIQUE INDEX "cierre_administrativo_sesId_key" ON "cierre_administrativo"("sesId");

-- CreateIndex
CREATE UNIQUE INDEX "cierre_administrativo_facturaId_key" ON "cierre_administrativo"("facturaId");

-- CreateIndex
CREATE INDEX "cierre_administrativo_ordenId_idx" ON "cierre_administrativo"("ordenId");

-- CreateIndex
CREATE INDEX "cierre_administrativo_estaCompleto_idx" ON "cierre_administrativo"("estaCompleto");

-- CreateIndex
CREATE UNIQUE INDEX "ejecuciones_ordenId_key" ON "ejecuciones"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "ejecuciones_planeacionId_key" ON "ejecuciones"("planeacionId");

-- CreateIndex
CREATE INDEX "ejecuciones_estado_idx" ON "ejecuciones"("estado");

-- CreateIndex
CREATE INDEX "ejecuciones_sincronizado_idx" ON "ejecuciones"("sincronizado");

-- CreateIndex
CREATE INDEX "ejecuciones_iniciadoPorId_idx" ON "ejecuciones"("iniciadoPorId");

-- CreateIndex
CREATE INDEX "ejecuciones_finalizadoPorId_idx" ON "ejecuciones"("finalizadoPorId");

-- CreateIndex
CREATE INDEX "tareas_ejecucion_ejecucionId_completada_idx" ON "tareas_ejecucion"("ejecucionId", "completada");

-- CreateIndex
CREATE INDEX "tareas_ejecucion_completadaPorId_idx" ON "tareas_ejecucion"("completadaPorId");

-- CreateIndex
CREATE INDEX "fotos_evidencia_ejecucionId_idx" ON "fotos_evidencia"("ejecucionId");

-- CreateIndex
CREATE INDEX "fotos_evidencia_checklistId_idx" ON "fotos_evidencia"("checklistId");

-- CreateIndex
CREATE INDEX "fotos_evidencia_checklistItemId_idx" ON "fotos_evidencia"("checklistItemId");

-- CreateIndex
CREATE INDEX "fotos_evidencia_cargadoPorId_idx" ON "fotos_evidencia"("cargadoPorId");

-- CreateIndex
CREATE INDEX "fotos_evidencia_sincronizado_idx" ON "fotos_evidencia"("sincronizado");

-- CreateIndex
CREATE INDEX "evidencias_ejecucion_ejecucionId_idx" ON "evidencias_ejecucion"("ejecucionId");

-- CreateIndex
CREATE INDEX "evidencias_ejecucion_ordenId_tipo_idx" ON "evidencias_ejecucion"("ordenId", "tipo");

-- CreateIndex
CREATE INDEX "evidencias_ejecucion_verificada_idx" ON "evidencias_ejecucion"("verificada");

-- CreateIndex
CREATE INDEX "evidencias_ejecucion_status_idx" ON "evidencias_ejecucion"("status");

-- CreateIndex
CREATE INDEX "evidencias_ejecucion_deletedAt_idx" ON "evidencias_ejecucion"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "form_templates_nombre_key" ON "form_templates"("nombre");

-- CreateIndex
CREATE INDEX "form_templates_tipo_activo_idx" ON "form_templates"("tipo", "activo");

-- CreateIndex
CREATE INDEX "form_templates_categoria_idx" ON "form_templates"("categoria");

-- CreateIndex
CREATE INDEX "form_templates_creadoPorId_idx" ON "form_templates"("creadoPorId");

-- CreateIndex
CREATE INDEX "formularios_instancias_templateId_idx" ON "formularios_instancias"("templateId");

-- CreateIndex
CREATE INDEX "formularios_instancias_ordenId_idx" ON "formularios_instancias"("ordenId");

-- CreateIndex
CREATE INDEX "formularios_instancias_completadoPorId_idx" ON "formularios_instancias"("completadoPorId");

-- CreateIndex
CREATE INDEX "formularios_instancias_estado_idx" ON "formularios_instancias"("estado");

-- CreateIndex
CREATE INDEX "formulario_templates_activo_idx" ON "formulario_templates"("activo");

-- CreateIndex
CREATE INDEX "formulario_templates_creadoPorId_idx" ON "formulario_templates"("creadoPorId");

-- CreateIndex
CREATE INDEX "formulario_respuestas_templateId_idx" ON "formulario_respuestas"("templateId");

-- CreateIndex
CREATE INDEX "formulario_respuestas_ordenId_idx" ON "formulario_respuestas"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "hojas_entrada_servicio_numero_key" ON "hojas_entrada_servicio"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "hojas_entrada_servicio_ordenId_key" ON "hojas_entrada_servicio"("ordenId");

-- CreateIndex
CREATE INDEX "hojas_entrada_servicio_numero_idx" ON "hojas_entrada_servicio"("numero");

-- CreateIndex
CREATE INDEX "hojas_entrada_servicio_ordenId_idx" ON "hojas_entrada_servicio"("ordenId");

-- CreateIndex
CREATE INDEX "hojas_entrada_servicio_estado_idx" ON "hojas_entrada_servicio"("estado");

-- CreateIndex
CREATE INDEX "hojas_entrada_servicio_tipoServicio_idx" ON "hojas_entrada_servicio"("tipoServicio");

-- CreateIndex
CREATE INDEX "hojas_entrada_servicio_creadoPor_idx" ON "hojas_entrada_servicio"("creadoPor");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_hes_numero_key" ON "equipos_hes"("numero");

-- CreateIndex
CREATE INDEX "equipos_hes_estado_idx" ON "equipos_hes"("estado");

-- CreateIndex
CREATE INDEX "equipos_hes_tipo_idx" ON "equipos_hes"("tipo");

-- CreateIndex
CREATE INDEX "equipos_hes_proximaInspeccion_idx" ON "equipos_hes"("proximaInspeccion");

-- CreateIndex
CREATE INDEX "inspecciones_hes_equipoId_fechaInspeccion_idx" ON "inspecciones_hes"("equipoId", "fechaInspeccion" DESC);

-- CreateIndex
CREATE INDEX "inspecciones_hes_inspectorId_idx" ON "inspecciones_hes"("inspectorId");

-- CreateIndex
CREATE INDEX "inspecciones_hes_ordenId_idx" ON "inspecciones_hes"("ordenId");

-- CreateIndex
CREATE INDEX "inspecciones_hes_estado_idx" ON "inspecciones_hes"("estado");

-- CreateIndex
CREATE INDEX "inspeccion_items_inspeccionId_idx" ON "inspeccion_items"("inspeccionId");

-- CreateIndex
CREATE INDEX "orden_equipos_hes_ordenId_idx" ON "orden_equipos_hes"("ordenId");

-- CreateIndex
CREATE INDEX "orden_equipos_hes_equipoId_idx" ON "orden_equipos_hes"("equipoId");

-- CreateIndex
CREATE INDEX "orden_equipos_hes_estado_idx" ON "orden_equipos_hes"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "orden_equipos_hes_ordenId_equipoId_key" ON "orden_equipos_hes"("ordenId", "equipoId");

-- CreateIndex
CREATE UNIQUE INDEX "inspecciones_linea_vida_numeroLinea_key" ON "inspecciones_linea_vida"("numeroLinea");

-- CreateIndex
CREATE INDEX "inspecciones_linea_vida_numeroLinea_idx" ON "inspecciones_linea_vida"("numeroLinea");

-- CreateIndex
CREATE INDEX "inspecciones_linea_vida_inspectorId_idx" ON "inspecciones_linea_vida"("inspectorId");

-- CreateIndex
CREATE INDEX "inspecciones_linea_vida_estado_idx" ON "inspecciones_linea_vida"("estado");

-- CreateIndex
CREATE INDEX "inspecciones_linea_vida_proximaInspeccion_idx" ON "inspecciones_linea_vida"("proximaInspeccion");

-- CreateIndex
CREATE INDEX "componentes_linea_vida_inspeccionId_idx" ON "componentes_linea_vida"("inspeccionId");

-- CreateIndex
CREATE INDEX "condiciones_componente_componenteId_idx" ON "condiciones_componente"("componenteId");

-- CreateIndex
CREATE INDEX "kit_items_kitId_idx" ON "kit_items"("kitId");

-- CreateIndex
CREATE INDEX "formulario_respuestas_legacy_formularioId_idx" ON "formulario_respuestas_legacy"("formularioId");

-- CreateIndex
CREATE INDEX "formulario_respuestas_legacy_ordenId_idx" ON "formulario_respuestas_legacy"("ordenId");

-- CreateIndex
CREATE INDEX "inspecciones_linea_vida_legacy_lineaVidaId_idx" ON "inspecciones_linea_vida_legacy"("lineaVidaId");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_codigo_key" ON "equipos"("codigo");

-- CreateIndex
CREATE INDEX "equipos_codigo_idx" ON "equipos"("codigo");

-- CreateIndex
CREATE INDEX "equipos_activo_idx" ON "equipos"("activo");

-- CreateIndex
CREATE INDEX "equipos_categoria_idx" ON "equipos"("categoria");

-- CreateIndex
CREATE INDEX "equipos_proximoMantenimiento_idx" ON "equipos"("proximoMantenimiento");

-- CreateIndex
CREATE INDEX "mantenimientos_activoId_idx" ON "mantenimientos"("activoId");

-- CreateIndex
CREATE INDEX "mantenimientos_estado_idx" ON "mantenimientos"("estado");

-- CreateIndex
CREATE INDEX "mantenimientos_fechaProgramada_idx" ON "mantenimientos"("fechaProgramada");

-- CreateIndex
CREATE INDEX "mantenimientos_tecnicoId_idx" ON "mantenimientos"("tecnicoId");

-- CreateIndex
CREATE INDEX "mantenimientos_prioridad_estado_idx" ON "mantenimientos"("prioridad", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "orders_numero_key" ON "orders"("numero");

-- CreateIndex
CREATE INDEX "orders_deleted_at_idx" ON "orders"("deleted_at");

-- CreateIndex
CREATE INDEX "orders_prioridad_idx" ON "orders"("prioridad");

-- CreateIndex
CREATE INDEX "orders_cliente_idx" ON "orders"("cliente");

-- CreateIndex
CREATE INDEX "orders_asignadoId_idx" ON "orders"("asignadoId");

-- CreateIndex
CREATE INDEX "orders_fechaInicio_idx" ON "orders"("fechaInicio");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "orders_estado_prioridad_idx" ON "orders"("estado", "prioridad");

-- CreateIndex
CREATE INDEX "orders_cliente_estado_idx" ON "orders"("cliente", "estado");

-- CreateIndex
CREATE INDEX "orders_asignadoId_estado_idx" ON "orders"("asignadoId", "estado");

-- CreateIndex
CREATE INDEX "orders_fechaInicio_fechaFin_idx" ON "orders"("fechaInicio", "fechaFin");

-- CreateIndex
CREATE INDEX "orders_estado_prioridad_fechaInicio_idx" ON "orders"("estado", "prioridad", "fechaInicio");

-- CreateIndex
CREATE INDEX "orders_subEstado_createdAt_idx" ON "orders"("subEstado", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "orders_creadorId_idx" ON "orders"("creadorId");

-- CreateIndex
CREATE INDEX "orders_numero_idx" ON "orders"("numero");

-- CreateIndex
CREATE INDEX "orders_requiereHES_cumplimientoHES_idx" ON "orders"("requiereHES", "cumplimientoHES");

-- CreateIndex
CREATE INDEX "order_items_orderId_completado_idx" ON "order_items"("orderId", "completado");

-- CreateIndex
CREATE INDEX "evidences_orderId_tipo_idx" ON "evidences"("orderId", "tipo");

-- CreateIndex
CREATE INDEX "evidences_subidoPorId_idx" ON "evidences"("subidoPorId");

-- CreateIndex
CREATE INDEX "evidences_createdAt_idx" ON "evidences"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "costs_orderId_tipo_idx" ON "costs"("orderId", "tipo");

-- CreateIndex
CREATE INDEX "costs_facturado_idx" ON "costs"("facturado");

-- CreateIndex
CREATE INDEX "costs_creadoPorId_idx" ON "costs"("creadoPorId");

-- CreateIndex
CREATE INDEX "order_state_history_ordenId_createdAt_idx" ON "order_state_history"("ordenId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "order_state_history_userId_idx" ON "order_state_history"("userId");

-- CreateIndex
CREATE INDEX "visitas_tecnicas_ordenId_idx" ON "visitas_tecnicas"("ordenId");

-- CreateIndex
CREATE INDEX "visitas_tecnicas_tecnicoId_idx" ON "visitas_tecnicas"("tecnicoId");

-- CreateIndex
CREATE INDEX "visitas_tecnicas_fechaProgramada_idx" ON "visitas_tecnicas"("fechaProgramada");

-- CreateIndex
CREATE UNIQUE INDEX "propuestas_economicas_ordenId_key" ON "propuestas_economicas"("ordenId");

-- CreateIndex
CREATE INDEX "propuestas_economicas_ordenId_idx" ON "propuestas_economicas"("ordenId");

-- CreateIndex
CREATE INDEX "propuestas_economicas_creadoPorId_idx" ON "propuestas_economicas"("creadoPorId");

-- CreateIndex
CREATE INDEX "alertas_automaticas_usuarioId_leida_idx" ON "alertas_automaticas"("usuarioId", "leida");

-- CreateIndex
CREATE INDEX "alertas_automaticas_tipo_createdAt_idx" ON "alertas_automaticas"("tipo", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "alertas_automaticas_ordenId_idx" ON "alertas_automaticas"("ordenId");

-- CreateIndex
CREATE INDEX "alertas_automaticas_prioridad_resuelta_idx" ON "alertas_automaticas"("prioridad", "resuelta");

-- CreateIndex
CREATE UNIQUE INDEX "comparativa_costos_ordenId_key" ON "comparativa_costos"("ordenId");

-- CreateIndex
CREATE INDEX "comparativa_costos_ordenId_idx" ON "comparativa_costos"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "kits_tipicos_nombre_key" ON "kits_tipicos"("nombre");

-- CreateIndex
CREATE INDEX "kits_tipicos_activo_categoria_idx" ON "kits_tipicos"("activo", "categoria");

-- CreateIndex
CREATE INDEX "kits_tipicos_codigo_idx" ON "kits_tipicos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "planeaciones_ordenId_key" ON "planeaciones"("ordenId");

-- CreateIndex
CREATE INDEX "planeaciones_estado_idx" ON "planeaciones"("estado");

-- CreateIndex
CREATE INDEX "planeaciones_kitId_idx" ON "planeaciones"("kitId");

-- CreateIndex
CREATE INDEX "planeaciones_aprobadoPorId_idx" ON "planeaciones"("aprobadoPorId");

-- CreateIndex
CREATE INDEX "items_planeacion_planeacionId_idx" ON "items_planeacion"("planeacionId");

-- CreateIndex
CREATE INDEX "items_planeacion_tipo_idx" ON "items_planeacion"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_activa_idx" ON "push_subscriptions"("userId", "activa");

-- CreateIndex
CREATE INDEX "archivos_historicos_mes_anio_idx" ON "archivos_historicos"("mes", "anio");

-- CreateIndex
CREATE INDEX "archivos_historicos_disponible_idx" ON "archivos_historicos"("disponible");

-- CreateIndex
CREATE INDEX "archivos_historicos_creadoPorId_idx" ON "archivos_historicos"("creadoPorId");

-- CreateIndex
CREATE UNIQUE INDEX "archivos_historicos_mes_anio_tipo_key" ON "archivos_historicos"("mes", "anio", "tipo");

-- CreateIndex
CREATE INDEX "pending_syncs_userId_idx" ON "pending_syncs"("userId");

-- CreateIndex
CREATE INDEX "pending_syncs_status_idx" ON "pending_syncs"("status");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_tokens" ADD CONSTRAINT "two_factor_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_template_items" ADD CONSTRAINT "checklist_template_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_ejecucion" ADD CONSTRAINT "checklist_ejecucion_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_ejecucion" ADD CONSTRAINT "checklist_ejecucion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "checklist_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_ejecucion" ADD CONSTRAINT "checklist_ejecucion_completadoPorId_fkey" FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_item_ejecucion" ADD CONSTRAINT "checklist_item_ejecucion_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "checklist_ejecucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_item_ejecucion" ADD CONSTRAINT "checklist_item_ejecucion_templateItemId_fkey" FOREIGN KEY ("templateItemId") REFERENCES "checklist_template_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_item_ejecucion" ADD CONSTRAINT "checklist_item_ejecucion_completadoPorId_fkey" FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas" ADD CONSTRAINT "actas_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas" ADD CONSTRAINT "actas_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas" ADD CONSTRAINT "actas_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ses" ADD CONSTRAINT "ses_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ses" ADD CONSTRAINT "ses_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ses" ADD CONSTRAINT "ses_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_administrativo" ADD CONSTRAINT "cierre_administrativo_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_administrativo" ADD CONSTRAINT "cierre_administrativo_actaId_fkey" FOREIGN KEY ("actaId") REFERENCES "actas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_administrativo" ADD CONSTRAINT "cierre_administrativo_sesId_fkey" FOREIGN KEY ("sesId") REFERENCES "ses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_administrativo" ADD CONSTRAINT "cierre_administrativo_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecuciones" ADD CONSTRAINT "ejecuciones_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecuciones" ADD CONSTRAINT "ejecuciones_planeacionId_fkey" FOREIGN KEY ("planeacionId") REFERENCES "planeaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecuciones" ADD CONSTRAINT "ejecuciones_iniciadoPorId_fkey" FOREIGN KEY ("iniciadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecuciones" ADD CONSTRAINT "ejecuciones_finalizadoPorId_fkey" FOREIGN KEY ("finalizadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_ejecucion" ADD CONSTRAINT "tareas_ejecucion_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_ejecucion" ADD CONSTRAINT "tareas_ejecucion_completadaPorId_fkey" FOREIGN KEY ("completadaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_evidencia" ADD CONSTRAINT "fotos_evidencia_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_evidencia" ADD CONSTRAINT "fotos_evidencia_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "checklist_ejecucion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_evidencia" ADD CONSTRAINT "fotos_evidencia_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "checklist_item_ejecucion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_evidencia" ADD CONSTRAINT "fotos_evidencia_cargadoPorId_fkey" FOREIGN KEY ("cargadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_ejecucion" ADD CONSTRAINT "evidencias_ejecucion_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_ejecucion" ADD CONSTRAINT "evidencias_ejecucion_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_templates" ADD CONSTRAINT "form_templates_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_instancias" ADD CONSTRAINT "formularios_instancias_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "form_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_instancias" ADD CONSTRAINT "formularios_instancias_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_instancias" ADD CONSTRAINT "formularios_instancias_completadoPorId_fkey" FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_instancias" ADD CONSTRAINT "formularios_instancias_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulario_templates" ADD CONSTRAINT "formulario_templates_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulario_respuestas" ADD CONSTRAINT "formulario_respuestas_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "formulario_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hojas_entrada_servicio" ADD CONSTRAINT "hojas_entrada_servicio_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones_hes" ADD CONSTRAINT "inspecciones_hes_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos_hes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones_hes" ADD CONSTRAINT "inspecciones_hes_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones_hes" ADD CONSTRAINT "inspecciones_hes_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspeccion_items" ADD CONSTRAINT "inspeccion_items_inspeccionId_fkey" FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones_hes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_equipos_hes" ADD CONSTRAINT "orden_equipos_hes_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_equipos_hes" ADD CONSTRAINT "orden_equipos_hes_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos_hes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones_linea_vida" ADD CONSTRAINT "inspecciones_linea_vida_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "componentes_linea_vida" ADD CONSTRAINT "componentes_linea_vida_inspeccionId_fkey" FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones_linea_vida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condiciones_componente" ADD CONSTRAINT "condiciones_componente_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "componentes_linea_vida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_items" ADD CONSTRAINT "kit_items_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulario_respuestas_legacy" ADD CONSTRAINT "formulario_respuestas_legacy_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "formularios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones_linea_vida_legacy" ADD CONSTRAINT "inspecciones_linea_vida_legacy_lineaVidaId_fkey" FOREIGN KEY ("lineaVidaId") REFERENCES "lineas_vida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_asignadoId_fkey" FOREIGN KEY ("asignadoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_canceladaPorId_fkey" FOREIGN KEY ("canceladaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_completadoPorId_fkey" FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costs" ADD CONSTRAINT "costs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costs" ADD CONSTRAINT "costs_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_state_history" ADD CONSTRAINT "order_state_history_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_state_history" ADD CONSTRAINT "order_state_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas_tecnicas" ADD CONSTRAINT "visitas_tecnicas_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas_tecnicas" ADD CONSTRAINT "visitas_tecnicas_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propuestas_economicas" ADD CONSTRAINT "propuestas_economicas_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propuestas_economicas" ADD CONSTRAINT "propuestas_economicas_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propuestas_economicas" ADD CONSTRAINT "propuestas_economicas_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propuestas_economicas" ADD CONSTRAINT "propuestas_economicas_rechazadoPorId_fkey" FOREIGN KEY ("rechazadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_automaticas" ADD CONSTRAINT "alertas_automaticas_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_automaticas" ADD CONSTRAINT "alertas_automaticas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_automaticas" ADD CONSTRAINT "alertas_automaticas_resueltoPorId_fkey" FOREIGN KEY ("resueltoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparativa_costos" ADD CONSTRAINT "comparativa_costos_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kits_tipicos" ADD CONSTRAINT "kits_tipicos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planeaciones" ADD CONSTRAINT "planeaciones_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planeaciones" ADD CONSTRAINT "planeaciones_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits_tipicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planeaciones" ADD CONSTRAINT "planeaciones_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planeaciones" ADD CONSTRAINT "planeaciones_rechazadoPorId_fkey" FOREIGN KEY ("rechazadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planeaciones" ADD CONSTRAINT "planeaciones_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_planeacion" ADD CONSTRAINT "items_planeacion_planeacionId_fkey" FOREIGN KEY ("planeacionId") REFERENCES "planeaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_historicos" ADD CONSTRAINT "archivos_historicos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
