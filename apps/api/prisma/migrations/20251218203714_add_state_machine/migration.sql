-- CreateEnum
CREATE TYPE "OrderSubState" AS ENUM ('SOLICITUD_RECIBIDA', 'VISITA_PROGRAMADA', 'PROPUESTA_ELABORADA', 'PROPUESTA_APROBADA', 'PLANEACION_INICIADA', 'PLANEACION_APROBADA', 'EJECUCION_INICIADA', 'EJECUCION_COMPLETADA', 'INFORME_GENERADO', 'ACTA_ELABORADA', 'ACTA_FIRMADA', 'SES_APROBADA', 'FACTURA_APROBADA', 'PAGO_RECIBIDO');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('ACTA_SIN_FIRMAR', 'SES_PENDIENTE', 'FACTURA_VENCIDA', 'RECURSO_FALTANTE', 'CERTIFICACION_VENCIDA', 'RETRASO_CRONOGRAMA', 'PROPUESTA_SIN_RESPUESTA');

-- CreateEnum
CREATE TYPE "PrioridadAlerta" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TipoFormulario" AS ENUM ('CHECKLIST', 'INSPECCION', 'MANTENIMIENTO', 'REPORTE', 'CERTIFICACION', 'HES', 'OTRO');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "subEstado" "OrderSubState" NOT NULL DEFAULT 'SOLICITUD_RECIBIDA';

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
    "completadoEn" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formularios_instancias_pkey" PRIMARY KEY ("id")
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propuestas_economicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_automaticas" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAlerta" NOT NULL,
    "prioridad" "PrioridadAlerta" NOT NULL DEFAULT 'INFO',
    "ordenId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "usuarioId" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "form_templates_nombre_key" ON "form_templates"("nombre");

-- CreateIndex
CREATE INDEX "form_templates_tipo_activo_idx" ON "form_templates"("tipo", "activo");

-- CreateIndex
CREATE INDEX "form_templates_categoria_idx" ON "form_templates"("categoria");

-- CreateIndex
CREATE INDEX "formularios_instancias_templateId_idx" ON "formularios_instancias"("templateId");

-- CreateIndex
CREATE INDEX "formularios_instancias_ordenId_idx" ON "formularios_instancias"("ordenId");

-- CreateIndex
CREATE INDEX "formularios_instancias_completadoPorId_idx" ON "formularios_instancias"("completadoPorId");

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
CREATE INDEX "orders_subEstado_idx" ON "orders"("subEstado");

-- AddForeignKey
ALTER TABLE "formularios_instancias" ADD CONSTRAINT "formularios_instancias_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "form_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_instancias" ADD CONSTRAINT "formularios_instancias_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_instancias" ADD CONSTRAINT "formularios_instancias_completadoPorId_fkey" FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "alertas_automaticas" ADD CONSTRAINT "alertas_automaticas_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_automaticas" ADD CONSTRAINT "alertas_automaticas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparativa_costos" ADD CONSTRAINT "comparativa_costos_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
