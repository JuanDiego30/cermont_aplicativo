/*
  Warnings:

  - You are about to drop the column `completadoPor` on the `checklist_ejecucion` table. All the data in the column will be lost.
  - You are about to drop the column `item` on the `checklist_ejecucion` table. All the data in the column will be lost.
  - Added the required column `nombre` to the `checklist_ejecucion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoInspeccion" AS ENUM ('CONFORME', 'NO_CONFORME', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "TipoMantenimiento" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO');

-- CreateEnum
CREATE TYPE "EstadoMantenimiento" AS ENUM ('PROGRAMADO', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "PrioridadMantenimiento" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "EstadoActa" AS ENUM ('BORRADOR', 'GENERADA', 'ENVIADA', 'FIRMADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstadoSES" AS ENUM ('NO_CREADA', 'CREADA', 'ENVIADA', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('NO_CREADA', 'GENERADA', 'ENVIADA', 'APROBADA', 'PAGADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoArchivo" AS ENUM ('ORDENES_CSV', 'EVIDENCIAS_ZIP', 'INFORMES_PDF', 'BACKUP_COMPLETO');

-- DropForeignKey
ALTER TABLE "evidencias_ejecucion" DROP CONSTRAINT "evidencias_ejecucion_ordenId_fkey";

-- DropForeignKey
ALTER TABLE "planeaciones" DROP CONSTRAINT "planeaciones_kitId_fkey";

-- AlterTable
ALTER TABLE "checklist_ejecucion" DROP COLUMN "completadoPor",
DROP COLUMN "item",
ADD COLUMN     "completadoPorId" TEXT,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "ejecuciones" ADD COLUMN     "sincronizado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cumplimientoHES" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "impuestosAplicables" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "margenUtilidad" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "presupuestoEstimado" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "requiereHES" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "planeaciones" ADD COLUMN     "descripcionTrabajo" TEXT,
ADD COLUMN     "empresa" TEXT,
ADD COLUMN     "fechaEstimadaFin" TIMESTAMP(3),
ADD COLUMN     "fechaEstimadaInicio" TIMESTAMP(3),
ADD COLUMN     "ubicacion" TEXT,
ALTER COLUMN "kitId" DROP NOT NULL;

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
CREATE TABLE "checklist_templates" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
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
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_template_items_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "fotos_evidencia" (
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
    "estado" "EstadoInspeccion" NOT NULL DEFAULT 'PENDIENTE',
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condiciones_componente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos_hes" (
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
    "notas" TEXT,

    CONSTRAINT "inspeccion_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_equipos_hes" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "estado" TEXT NOT NULL DEFAULT 'ASIGNADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orden_equipos_hes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
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

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mantenimientos" (
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

    CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "actas" (
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

-- CreateTable
CREATE TABLE "ses" (
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

    CONSTRAINT "ses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
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
    "observaciones" TEXT,
    "bloqueos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cierre_administrativo_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "items_planeacion_planeacionId_idx" ON "items_planeacion"("planeacionId");

-- CreateIndex
CREATE INDEX "items_planeacion_tipo_idx" ON "items_planeacion"("tipo");

-- CreateIndex
CREATE INDEX "checklist_templates_tipo_activo_idx" ON "checklist_templates"("tipo", "activo");

-- CreateIndex
CREATE INDEX "checklist_template_items_templateId_idx" ON "checklist_template_items"("templateId");

-- CreateIndex
CREATE INDEX "checklist_item_ejecucion_checklistId_idx" ON "checklist_item_ejecucion"("checklistId");

-- CreateIndex
CREATE INDEX "checklist_item_ejecucion_templateItemId_idx" ON "checklist_item_ejecucion"("templateItemId");

-- CreateIndex
CREATE INDEX "checklist_item_ejecucion_completadoPorId_idx" ON "checklist_item_ejecucion"("completadoPorId");

-- CreateIndex
CREATE INDEX "fotos_evidencia_ejecucionId_idx" ON "fotos_evidencia"("ejecucionId");

-- CreateIndex
CREATE INDEX "fotos_evidencia_checklistId_idx" ON "fotos_evidencia"("checklistId");

-- CreateIndex
CREATE INDEX "fotos_evidencia_checklistItemId_idx" ON "fotos_evidencia"("checklistItemId");

-- CreateIndex
CREATE INDEX "fotos_evidencia_cargadoPorId_idx" ON "fotos_evidencia"("cargadoPorId");

-- CreateIndex
CREATE UNIQUE INDEX "inspecciones_linea_vida_numeroLinea_key" ON "inspecciones_linea_vida"("numeroLinea");

-- CreateIndex
CREATE INDEX "inspecciones_linea_vida_numeroLinea_idx" ON "inspecciones_linea_vida"("numeroLinea");

-- CreateIndex
CREATE INDEX "inspecciones_linea_vida_inspectorId_idx" ON "inspecciones_linea_vida"("inspectorId");

-- CreateIndex
CREATE INDEX "inspecciones_linea_vida_estado_idx" ON "inspecciones_linea_vida"("estado");

-- CreateIndex
CREATE INDEX "componentes_linea_vida_inspeccionId_idx" ON "componentes_linea_vida"("inspeccionId");

-- CreateIndex
CREATE INDEX "condiciones_componente_componenteId_idx" ON "condiciones_componente"("componenteId");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_hes_numero_key" ON "equipos_hes"("numero");

-- CreateIndex
CREATE INDEX "equipos_hes_estado_idx" ON "equipos_hes"("estado");

-- CreateIndex
CREATE INDEX "equipos_hes_tipo_idx" ON "equipos_hes"("tipo");

-- CreateIndex
CREATE INDEX "inspecciones_hes_equipoId_idx" ON "inspecciones_hes"("equipoId");

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
CREATE UNIQUE INDEX "orden_equipos_hes_ordenId_equipoId_key" ON "orden_equipos_hes"("ordenId", "equipoId");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_codigo_key" ON "equipos"("codigo");

-- CreateIndex
CREATE INDEX "equipos_codigo_idx" ON "equipos"("codigo");

-- CreateIndex
CREATE INDEX "equipos_activo_idx" ON "equipos"("activo");

-- CreateIndex
CREATE INDEX "mantenimientos_equipoId_idx" ON "mantenimientos"("equipoId");

-- CreateIndex
CREATE INDEX "mantenimientos_estado_idx" ON "mantenimientos"("estado");

-- CreateIndex
CREATE INDEX "mantenimientos_fechaProgramada_idx" ON "mantenimientos"("fechaProgramada");

-- CreateIndex
CREATE INDEX "mantenimientos_tecnicoAsignadoId_idx" ON "mantenimientos"("tecnicoAsignadoId");

-- CreateIndex
CREATE INDEX "mantenimientos_creadoPorId_idx" ON "mantenimientos"("creadoPorId");

-- CreateIndex
CREATE INDEX "formulario_templates_activo_idx" ON "formulario_templates"("activo");

-- CreateIndex
CREATE INDEX "formulario_respuestas_templateId_idx" ON "formulario_respuestas"("templateId");

-- CreateIndex
CREATE INDEX "formulario_respuestas_ordenId_idx" ON "formulario_respuestas"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "actas_numero_key" ON "actas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "actas_ordenId_key" ON "actas"("ordenId");

-- CreateIndex
CREATE INDEX "actas_ordenId_idx" ON "actas"("ordenId");

-- CreateIndex
CREATE INDEX "actas_estado_idx" ON "actas"("estado");

-- CreateIndex
CREATE INDEX "actas_numero_idx" ON "actas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "ses_numeroSES_key" ON "ses"("numeroSES");

-- CreateIndex
CREATE UNIQUE INDEX "ses_ordenId_key" ON "ses"("ordenId");

-- CreateIndex
CREATE INDEX "ses_ordenId_idx" ON "ses"("ordenId");

-- CreateIndex
CREATE INDEX "ses_estado_idx" ON "ses"("estado");

-- CreateIndex
CREATE INDEX "ses_numeroSES_idx" ON "ses"("numeroSES");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numeroFactura_key" ON "facturas"("numeroFactura");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_ordenId_key" ON "facturas"("ordenId");

-- CreateIndex
CREATE INDEX "facturas_ordenId_idx" ON "facturas"("ordenId");

-- CreateIndex
CREATE INDEX "facturas_estado_idx" ON "facturas"("estado");

-- CreateIndex
CREATE INDEX "facturas_numeroFactura_idx" ON "facturas"("numeroFactura");

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
CREATE INDEX "archivos_historicos_mes_anio_idx" ON "archivos_historicos"("mes", "anio");

-- CreateIndex
CREATE INDEX "archivos_historicos_disponible_idx" ON "archivos_historicos"("disponible");

-- CreateIndex
CREATE UNIQUE INDEX "archivos_historicos_mes_anio_tipo_key" ON "archivos_historicos"("mes", "anio", "tipo");

-- CreateIndex
CREATE INDEX "kit_items_kitId_idx" ON "kit_items"("kitId");

-- CreateIndex
CREATE INDEX "formulario_respuestas_legacy_formularioId_idx" ON "formulario_respuestas_legacy"("formularioId");

-- CreateIndex
CREATE INDEX "formulario_respuestas_legacy_ordenId_idx" ON "formulario_respuestas_legacy"("ordenId");

-- CreateIndex
CREATE INDEX "inspecciones_linea_vida_legacy_lineaVidaId_idx" ON "inspecciones_linea_vida_legacy"("lineaVidaId");

-- CreateIndex
CREATE INDEX "pending_syncs_userId_idx" ON "pending_syncs"("userId");

-- CreateIndex
CREATE INDEX "pending_syncs_status_idx" ON "pending_syncs"("status");

-- CreateIndex
CREATE INDEX "checklist_ejecucion_templateId_idx" ON "checklist_ejecucion"("templateId");

-- CreateIndex
CREATE INDEX "checklist_ejecucion_completadoPorId_idx" ON "checklist_ejecucion"("completadoPorId");

-- CreateIndex
CREATE INDEX "costs_tipo_idx" ON "costs"("tipo");

-- CreateIndex
CREATE INDEX "costs_createdAt_idx" ON "costs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ejecuciones_planeacionId_idx" ON "ejecuciones"("planeacionId");

-- CreateIndex
CREATE INDEX "evidences_tipo_idx" ON "evidences"("tipo");

-- CreateIndex
CREATE INDEX "evidences_createdAt_idx" ON "evidences"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "orders_creadorId_idx" ON "orders"("creadorId");

-- CreateIndex
CREATE INDEX "orders_asignadoId_idx" ON "orders"("asignadoId");

-- CreateIndex
CREATE INDEX "orders_prioridad_idx" ON "orders"("prioridad");

-- CreateIndex
CREATE INDEX "orders_fechaInicio_idx" ON "orders"("fechaInicio");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "orders_estado_fechaInicio_idx" ON "orders"("estado", "fechaInicio");

-- CreateIndex
CREATE INDEX "orders_asignadoId_estado_idx" ON "orders"("asignadoId", "estado");

-- CreateIndex
CREATE INDEX "orders_cliente_estado_idx" ON "orders"("cliente", "estado");

-- CreateIndex
CREATE INDEX "orders_estado_prioridad_fechaInicio_idx" ON "orders"("estado", "prioridad", "fechaInicio");

-- CreateIndex
CREATE INDEX "planeaciones_aprobadoPorId_idx" ON "planeaciones"("aprobadoPorId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_active_idx" ON "users"("active");

-- CreateIndex
CREATE INDEX "users_role_active_idx" ON "users"("role", "active");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "planeaciones" ADD CONSTRAINT "planeaciones_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits_tipicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_planeacion" ADD CONSTRAINT "items_planeacion_planeacionId_fkey" FOREIGN KEY ("planeacionId") REFERENCES "planeaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_template_items" ADD CONSTRAINT "checklist_template_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "fotos_evidencia" ADD CONSTRAINT "fotos_evidencia_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_evidencia" ADD CONSTRAINT "fotos_evidencia_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "checklist_ejecucion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_evidencia" ADD CONSTRAINT "fotos_evidencia_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "checklist_item_ejecucion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_evidencia" ADD CONSTRAINT "fotos_evidencia_cargadoPorId_fkey" FOREIGN KEY ("cargadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_ejecucion" ADD CONSTRAINT "evidencias_ejecucion_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones_linea_vida" ADD CONSTRAINT "inspecciones_linea_vida_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "componentes_linea_vida" ADD CONSTRAINT "componentes_linea_vida_inspeccionId_fkey" FOREIGN KEY ("inspeccionId") REFERENCES "inspecciones_linea_vida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condiciones_componente" ADD CONSTRAINT "condiciones_componente_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "componentes_linea_vida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_tecnicoAsignadoId_fkey" FOREIGN KEY ("tecnicoAsignadoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulario_respuestas" ADD CONSTRAINT "formulario_respuestas_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "formulario_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas" ADD CONSTRAINT "actas_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ses" ADD CONSTRAINT "ses_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_administrativo" ADD CONSTRAINT "cierre_administrativo_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_administrativo" ADD CONSTRAINT "cierre_administrativo_actaId_fkey" FOREIGN KEY ("actaId") REFERENCES "actas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_administrativo" ADD CONSTRAINT "cierre_administrativo_sesId_fkey" FOREIGN KEY ("sesId") REFERENCES "ses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierre_administrativo" ADD CONSTRAINT "cierre_administrativo_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_items" ADD CONSTRAINT "kit_items_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulario_respuestas_legacy" ADD CONSTRAINT "formulario_respuestas_legacy_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "formularios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones_linea_vida_legacy" ADD CONSTRAINT "inspecciones_linea_vida_legacy_lineaVidaId_fkey" FOREIGN KEY ("lineaVidaId") REFERENCES "lineas_vida"("id") ON DELETE CASCADE ON UPDATE CASCADE;
