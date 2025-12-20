-- ==========================================
-- ENUMS
-- ==========================================

-- Enum para subestados de orden (flujo completo)
CREATE TYPE "OrderSubState" AS ENUM (
  'SOLICITUD_RECIBIDA',
  'VISITA_PROGRAMADA',
  'PROPUESTA_ELABORADA',
  'PROPUESTA_APROBADA',
  'PLANEACION_INICIADA',
  'PLANEACION_APROBADA',
  'EJECUCION_INICIADA',
  'EJECUCION_COMPLETADA',
  'INFORME_GENERADO',
  'ACTA_ELABORADA',
  'ACTA_FIRMADA',
  'SES_APROBADA',
  'FACTURA_APROBADA',
  'PAGO_RECIBIDO'
);

-- Enum para tipos de alerta
CREATE TYPE "TipoAlerta" AS ENUM (
  'ACTA_SIN_FIRMAR',
  'SES_PENDIENTE',
  'FACTURA_VENCIDA',
  'RECURSO_FALTANTE',
  'CERTIFICACION_VENCIDA',
  'RETRASO_CRONOGRAMA',
  'PROPUESTA_SIN_RESPUESTA'
);

-- Enum para prioridad de alertas
CREATE TYPE "PrioridadAlerta" AS ENUM (
  'INFO',
  'WARNING',
  'ERROR',
  'CRITICAL'
);

-- Enum para tipos de formulario
CREATE TYPE "TipoFormulario" AS ENUM (
  'CHECKLIST',
  'INSPECCION',
  'MANTENIMIENTO',
  'REPORTE',
  'CERTIFICACION',
  'HES',
  'OTRO'
);

-- Enum para estado de formularios
CREATE TYPE "EstadoFormulario" AS ENUM (
  'BORRADOR',
  'EN_REVISION',
  'COMPLETADO',
  'RECHAZADO'
);

-- ==========================================
-- ALTER EXISTING TABLES
-- ==========================================

-- Agregar subestado a órdenes
ALTER TABLE "orders" 
  ADD COLUMN IF NOT EXISTS "subEstado" "OrderSubState" NOT NULL DEFAULT 'SOLICITUD_RECIBIDA';

-- ==========================================
-- PLANTILLAS DE FORMULARIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS "form_templates" (
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
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- INSTANCIAS DE FORMULARIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS "formularios_instancias" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "ordenId" TEXT,
  "data" JSONB NOT NULL,
  "estado" "EstadoFormulario" NOT NULL DEFAULT 'BORRADOR',
  "completadoPorId" TEXT,
  "completadoEn" TIMESTAMP(3),
  "revisadoPorId" TEXT,
  "revisadoEn" TIMESTAMP(3),
  "notasRevision" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "formularios_instancias_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- HISTORIAL DE ESTADOS DE ORDEN
-- ==========================================

CREATE TABLE IF NOT EXISTS "order_state_history" (
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

-- ==========================================
-- VISITAS TÉCNICAS
-- ==========================================

CREATE TABLE IF NOT EXISTS "visitas_tecnicas" (
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

-- ==========================================
-- PROPUESTAS ECONÓMICAS
-- ==========================================

CREATE TABLE IF NOT EXISTS "propuestas_economicas" (
  "id" TEXT NOT NULL,
  "ordenId" TEXT NOT NULL,
  
  -- Costos detallados
  "costoManoObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "costoMateriales" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "costoEquipos" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "costoTransporte" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "otrosCostos" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "impuestos" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "margenUtilidad" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
  
  -- Control de versiones
  "numeroVersion" INTEGER NOT NULL DEFAULT 1,
  
  -- Estado de aprobación
  "aprobada" BOOLEAN NOT NULL DEFAULT false,
  "numeroPO" TEXT,
  "fechaEnvio" TIMESTAMP(3),
  "fechaAprobacion" TIMESTAMP(3),
  "aprobadaPorId" TEXT,
  "fechaRechazo" TIMESTAMP(3),
  "rechazadaPorId" TEXT,
  "motivoRechazo" TEXT,
  
  -- Archivos
  "urlArchivo" TEXT,
  
  -- Auditoría
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "propuestas_economicas_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- ALERTAS AUTOMÁTICAS
-- ==========================================

CREATE TABLE IF NOT EXISTS "alertas_automaticas" (
  "id" TEXT NOT NULL,
  "tipo" "TipoAlerta" NOT NULL,
  "prioridad" "PrioridadAlerta" NOT NULL DEFAULT 'INFO',
  "ordenId" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "mensaje" TEXT NOT NULL,
  "usuarioId" TEXT,
  "leida" BOOLEAN NOT NULL DEFAULT false,
  "resuelta" BOOLEAN NOT NULL DEFAULT false,
  "resueltaPorId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leidaAt" TIMESTAMP(3),
  "resueltaAt" TIMESTAMP(3),

  CONSTRAINT "alertas_automaticas_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- COMPARATIVA DE COSTOS
-- ==========================================

CREATE TABLE IF NOT EXISTS "comparativa_costos" (
  "id" TEXT NOT NULL,
  "ordenId" TEXT NOT NULL,
  
  -- Costos estimados (de la propuesta)
  "estimadoManoObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "estimadoMateriales" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "estimadoEquipos" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "estimadoTransporte" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "estimadoOtros" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalEstimado" DOUBLE PRECISION NOT NULL DEFAULT 0,
  
  -- Costos reales (de ejecución)
  "realManoObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "realMateriales" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "realEquipos" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "realTransporte" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "realOtros" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalReal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  
  -- Análisis
  "varianzaPorcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "margenRealizado" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "eficienciaPresupuestal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  
  -- Auditoría
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "comparativa_costos_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- ÍNDICES OPTIMIZADOS
-- ==========================================

-- Form Templates
CREATE UNIQUE INDEX IF NOT EXISTS "form_templates_nombre_version_key" 
  ON "form_templates"("nombre", "version");
CREATE INDEX IF NOT EXISTS "form_templates_tipo_activo_idx" 
  ON "form_templates"("tipo", "activo");
CREATE INDEX IF NOT EXISTS "form_templates_categoria_activo_idx" 
  ON "form_templates"("categoria", "activo");

-- Formularios Instancias
CREATE INDEX IF NOT EXISTS "formularios_instancias_templateId_idx" 
  ON "formularios_instancias"("templateId");
CREATE INDEX IF NOT EXISTS "formularios_instancias_ordenId_idx" 
  ON "formularios_instancias"("ordenId");
CREATE INDEX IF NOT EXISTS "formularios_instancias_estado_idx" 
  ON "formularios_instancias"("estado");
CREATE INDEX IF NOT EXISTS "formularios_instancias_completadoPorId_idx" 
  ON "formularios_instancias"("completadoPorId");

-- Order State History
CREATE INDEX IF NOT EXISTS "order_state_history_ordenId_createdAt_idx" 
  ON "order_state_history"("ordenId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "order_state_history_userId_idx" 
  ON "order_state_history"("userId");
CREATE INDEX IF NOT EXISTS "order_state_history_toState_idx" 
  ON "order_state_history"("toState");

-- Visitas Técnicas
CREATE INDEX IF NOT EXISTS "visitas_tecnicas_ordenId_idx" 
  ON "visitas_tecnicas"("ordenId");
CREATE INDEX IF NOT EXISTS "visitas_tecnicas_tecnicoId_idx" 
  ON "visitas_tecnicas"("tecnicoId");
CREATE INDEX IF NOT EXISTS "visitas_tecnicas_fechaProgramada_idx" 
  ON "visitas_tecnicas"("fechaProgramada");
CREATE INDEX IF NOT EXISTS "visitas_tecnicas_completada_idx" 
  ON "visitas_tecnicas"("completada");
CREATE INDEX IF NOT EXISTS "visitas_tecnicas_tecnico_fecha_idx" 
  ON "visitas_tecnicas"("tecnicoId", "fechaProgramada");

-- Propuestas Económicas (ÍNDICE ÚNICO CORREGIDO)
CREATE UNIQUE INDEX IF NOT EXISTS "propuestas_economicas_ordenId_version_key" 
  ON "propuestas_economicas"("ordenId", "numeroVersion");
CREATE INDEX IF NOT EXISTS "propuestas_economicas_aprobada_idx" 
  ON "propuestas_economicas"("aprobada");
CREATE INDEX IF NOT EXISTS "propuestas_economicas_fechaEnvio_idx" 
  ON "propuestas_economicas"("fechaEnvio");

-- Alertas Automáticas
CREATE INDEX IF NOT EXISTS "alertas_automaticas_usuarioId_leida_idx" 
  ON "alertas_automaticas"("usuarioId", "leida");
CREATE INDEX IF NOT EXISTS "alertas_automaticas_tipo_createdAt_idx" 
  ON "alertas_automaticas"("tipo", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "alertas_automaticas_ordenId_idx" 
  ON "alertas_automaticas"("ordenId");
CREATE INDEX IF NOT EXISTS "alertas_automaticas_prioridad_resuelta_idx" 
  ON "alertas_automaticas"("prioridad", "resuelta");
CREATE INDEX IF NOT EXISTS "alertas_automaticas_usuario_prioridad_idx" 
  ON "alertas_automaticas"("usuarioId", "prioridad", "leida");

-- Comparativa Costos (ÍNDICE ÚNICO CORREGIDO)
CREATE UNIQUE INDEX IF NOT EXISTS "comparativa_costos_ordenId_key" 
  ON "comparativa_costos"("ordenId");

-- Orders (subestado)
CREATE INDEX IF NOT EXISTS "orders_subEstado_idx" 
  ON "orders"("subEstado");
CREATE INDEX IF NOT EXISTS "orders_subEstado_createdAt_idx" 
  ON "orders"("subEstado", "createdAt" DESC);

-- ==========================================
-- FOREIGN KEYS
-- ==========================================

-- Form Templates
ALTER TABLE "form_templates" 
  ADD CONSTRAINT "form_templates_createdBy_fkey" 
  FOREIGN KEY ("createdBy") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Formularios Instancias
ALTER TABLE "formularios_instancias" 
  ADD CONSTRAINT "formularios_instancias_templateId_fkey" 
  FOREIGN KEY ("templateId") REFERENCES "form_templates"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "formularios_instancias" 
  ADD CONSTRAINT "formularios_instancias_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "formularios_instancias" 
  ADD CONSTRAINT "formularios_instancias_completadoPorId_fkey" 
  FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "formularios_instancias" 
  ADD CONSTRAINT "formularios_instancias_revisadoPorId_fkey" 
  FOREIGN KEY ("revisadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Order State History
ALTER TABLE "order_state_history" 
  ADD CONSTRAINT "order_state_history_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_state_history" 
  ADD CONSTRAINT "order_state_history_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Visitas Técnicas
ALTER TABLE "visitas_tecnicas" 
  ADD CONSTRAINT "visitas_tecnicas_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "visitas_tecnicas" 
  ADD CONSTRAINT "visitas_tecnicas_tecnicoId_fkey" 
  FOREIGN KEY ("tecnicoId") REFERENCES "users"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Propuestas Económicas
ALTER TABLE "propuestas_economicas" 
  ADD CONSTRAINT "propuestas_economicas_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "propuestas_economicas" 
  ADD CONSTRAINT "propuestas_economicas_createdBy_fkey" 
  FOREIGN KEY ("createdBy") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "propuestas_economicas" 
  ADD CONSTRAINT "propuestas_economicas_aprobadaPorId_fkey" 
  FOREIGN KEY ("aprobadaPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "propuestas_economicas" 
  ADD CONSTRAINT "propuestas_economicas_rechazadaPorId_fkey" 
  FOREIGN KEY ("rechazadaPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Alertas Automáticas
ALTER TABLE "alertas_automaticas" 
  ADD CONSTRAINT "alertas_automaticas_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "alertas_automaticas" 
  ADD CONSTRAINT "alertas_automaticas_usuarioId_fkey" 
  FOREIGN KEY ("usuarioId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "alertas_automaticas" 
  ADD CONSTRAINT "alertas_automaticas_resueltaPorId_fkey" 
  FOREIGN KEY ("resueltaPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Comparativa Costos
ALTER TABLE "comparativa_costos" 
  ADD CONSTRAINT "comparativa_costos_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ==========================================
-- TRIGGERS PARA CÁLCULOS AUTOMÁTICOS
-- ==========================================

-- Trigger para calcular totales en propuestas económicas
CREATE OR REPLACE FUNCTION calcular_totales_propuesta()
RETURNS TRIGGER AS $$
BEGIN
  NEW.subtotal := NEW."costoManoObra" + NEW."costoMateriales" + 
                  NEW."costoEquipos" + NEW."costoTransporte" + NEW."otrosCostos";
  NEW.total := NEW.subtotal + NEW.impuestos + NEW."margenUtilidad";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER propuesta_calcular_totales
  BEFORE INSERT OR UPDATE ON "propuestas_economicas"
  FOR EACH ROW
  EXECUTE FUNCTION calcular_totales_propuesta();

-- Trigger para calcular varianza en comparativa de costos
CREATE OR REPLACE FUNCTION calcular_varianza_costos()
RETURNS TRIGGER AS $$
BEGIN
  NEW."totalEstimado" := NEW."estimadoManoObra" + NEW."estimadoMateriales" + 
                         NEW."estimadoEquipos" + NEW."estimadoTransporte" + NEW."estimadoOtros";
  NEW."totalReal" := NEW."realManoObra" + NEW."realMateriales" + 
                     NEW."realEquipos" + NEW."realTransporte" + NEW."realOtros";
  
  IF NEW."totalEstimado" > 0 THEN
    NEW."varianzaPorcentaje" := ((NEW."totalReal" - NEW."totalEstimado") / NEW."totalEstimado") * 100;
    NEW."eficienciaPresupuestal" := (NEW."totalEstimado" / NEW."totalReal") * 100;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comparativa_calcular_varianza
  BEFORE INSERT OR UPDATE ON "comparativa_costos"
  FOR EACH ROW
  EXECUTE FUNCTION calcular_varianza_costos();
