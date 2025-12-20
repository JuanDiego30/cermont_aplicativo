-- ==========================================
-- ENUMS (CONSISTENTES EN SNAKE_CASE)
-- ==========================================

CREATE TYPE "UserRole" AS ENUM ('admin', 'supervisor', 'tecnico', 'administrativo', 'gerente');
CREATE TYPE "OrderStatus" AS ENUM ('planeacion', 'ejecucion', 'pausada', 'completada', 'cancelada');
CREATE TYPE "OrderPriority" AS ENUM ('baja', 'media', 'alta', 'urgente');
CREATE TYPE "EstadoPlaneacion" AS ENUM ('borrador', 'en_revision', 'aprobada', 'en_ejecucion', 'completada', 'cancelada');
CREATE TYPE "EstadoEjecucion" AS ENUM ('no_iniciada', 'en_progreso', 'pausada', 'completada', 'cancelada');
CREATE TYPE "TipoEvidencia" AS ENUM ('foto', 'video', 'documento', 'audio', 'otro');
CREATE TYPE "TipoCosto" AS ENUM ('material', 'mano_obra', 'equipo', 'transporte', 'otro');

-- ==========================================
-- USERS Y AUTENTICACIÓN
-- ==========================================

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT, -- Nullable para OAuth
  "name" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'tecnico',
  "phone" TEXT,
  "avatar" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "emailVerifiedAt" TIMESTAMP(3),
  "lastLogin" TIMESTAMP(3),
  "loginAttempts" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_login_attempts_positive" CHECK ("loginAttempts" >= 0)
);

CREATE TABLE "refresh_tokens" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL, -- Debe estar hasheado en la aplicación
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

CREATE TABLE "password_reset_tokens" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL, -- Debe estar hasheado en la aplicación
  "userId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- ÓRDENES DE TRABAJO
-- ==========================================

CREATE TABLE "orders" (
  "id" TEXT NOT NULL,
  "numero" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "cliente" TEXT NOT NULL,
  "contactoCliente" TEXT,
  "telefonoCliente" TEXT,
  "direccion" TEXT,
  "estado" "OrderStatus" NOT NULL DEFAULT 'planeacion',
  "prioridad" "OrderPriority" NOT NULL DEFAULT 'media',
  "fechaFinEstimada" TIMESTAMP(3),
  "fechaInicio" TIMESTAMP(3),
  "fechaFin" TIMESTAMP(3),
  "presupuestoEstimado" DOUBLE PRECISION DEFAULT 0,
  "costoReal" DOUBLE PRECISION DEFAULT 0,
  "varianzaCosto" DOUBLE PRECISION DEFAULT 0,
  "observaciones" TEXT,
  "motivoCancelacion" TEXT,
  "canceladaEn" TIMESTAMP(3),
  "canceladaPorId" TEXT,
  "creadorId" TEXT,
  "asignadoId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "orders_presupuesto_positive" CHECK ("presupuestoEstimado" IS NULL OR "presupuestoEstimado" >= 0),
  CONSTRAINT "orders_costo_positive" CHECK ("costoReal" >= 0)
);

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

  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "order_items_cantidad_positive" CHECK ("cantidad" > 0)
);

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

  CONSTRAINT "evidences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "evidences_tamano_positive" CHECK ("tamanoBytes" IS NULL OR "tamanoBytes" > 0)
);

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

  CONSTRAINT "costs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "costs_monto_positive" CHECK ("monto" >= 0),
  CONSTRAINT "costs_cantidad_positive" CHECK ("cantidad" IS NULL OR "cantidad" > 0),
  CONSTRAINT "costs_precio_positive" CHECK ("precioUnitario" IS NULL OR "precioUnitario" >= 0)
);

-- ==========================================
-- AUDITORÍA
-- ==========================================

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
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- KITS TÍPICOS Y PLANEACIÓN
-- ==========================================

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

  CONSTRAINT "kits_tipicos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "kits_duracion_positive" CHECK ("duracionEstimadaHoras" > 0),
  CONSTRAINT "kits_costo_positive" CHECK ("costoEstimado" >= 0)
);

CREATE TABLE "planeaciones" (
  "id" TEXT NOT NULL,
  "estado" "EstadoPlaneacion" NOT NULL DEFAULT 'borrador',
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

-- ==========================================
-- EJECUCIÓN
-- ==========================================

CREATE TABLE "ejecuciones" (
  "id" TEXT NOT NULL,
  "ordenId" TEXT NOT NULL,
  "planeacionId" TEXT NOT NULL,
  "estado" "EstadoEjecucion" NOT NULL DEFAULT 'no_iniciada',
  "avancePercentaje" INTEGER NOT NULL DEFAULT 0,
  "horasActuales" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "horasEstimadas" DOUBLE PRECISION NOT NULL,
  "fechaInicio" TIMESTAMP(3),
  "fechaTermino" TIMESTAMP(3),
  "ubicacionGPS" JSONB,
  "observacionesInicio" TEXT,
  "observaciones" TEXT,
  "iniciadaPorId" TEXT,
  "finalizadaPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ejecuciones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ejecuciones_avance_range" CHECK ("avancePercentaje" >= 0 AND "avancePercentaje" <= 100),
  CONSTRAINT "ejecuciones_horas_positive" CHECK ("horasActuales" >= 0 AND "horasEstimadas" >= 0)
);

CREATE TABLE "tareas_ejecucion" (
  "id" TEXT NOT NULL,
  "ejecucionId" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "completada" BOOLEAN NOT NULL DEFAULT false,
  "horasEstimadas" DOUBLE PRECISION NOT NULL,
  "horasReales" DOUBLE PRECISION DEFAULT 0,
  "observaciones" TEXT,
  "completadaPorId" TEXT,
  "completadaEn" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "tareas_ejecucion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tareas_horas_estimadas_positive" CHECK ("horasEstimadas" >= 0),
  CONSTRAINT "tareas_horas_reales_positive" CHECK ("horasReales" IS NULL OR "horasReales" >= 0)
);

CREATE TABLE "checklist_ejecucion" (
  "id" TEXT NOT NULL,
  "ejecucionId" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "completada" BOOLEAN NOT NULL DEFAULT false,
  "completadoPorId" TEXT,
  "completadoEn" TIMESTAMP(3),
  "orden" INTEGER NOT NULL DEFAULT 0,
  "requerido" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "checklist_ejecucion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "evidencias_ejecucion" (
  "id" TEXT NOT NULL,
  "ejecucionId" TEXT NOT NULL,
  "ordenId" TEXT NOT NULL,
  "tipo" "TipoEvidencia" NOT NULL,
  "nombreArchivo" TEXT NOT NULL,
  "rutaArchivo" TEXT NOT NULL,
  "tamano" BIGINT NOT NULL,
  "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
  "descripcion" TEXT,
  "ubicacionGPS" JSONB,
  "tags" TEXT[],
  "metadata" JSONB,
  "subidoPorId" TEXT NOT NULL,
  "verificada" BOOLEAN NOT NULL DEFAULT false,
  "verificadoPorId" TEXT,
  "verificadoEn" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "evidencias_ejecucion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "evidencias_tamano_positive" CHECK ("tamano" > 0)
);

-- ==========================================
-- PUSH NOTIFICATIONS
-- ==========================================

CREATE TABLE "push_subscriptions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "deviceInfo" JSONB,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastUsedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- ==========================================
-- ÍNDICES OPTIMIZADOS
-- ==========================================

-- Users
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_active_idx" ON "users"("role", "active");
CREATE INDEX "users_active_idx" ON "users"("active");

-- Refresh Tokens
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX "refresh_tokens_userId_isRevoked_idx" ON "refresh_tokens"("userId", "isRevoked");
CREATE INDEX "refresh_tokens_family_idx" ON "refresh_tokens"("family");
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- Password Reset Tokens
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
CREATE INDEX "password_reset_tokens_userId_usedAt_idx" ON "password_reset_tokens"("userId", "usedAt");
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- Orders
CREATE UNIQUE INDEX "orders_numero_key" ON "orders"("numero");
CREATE INDEX "orders_estado_prioridad_idx" ON "orders"("estado", "prioridad");
CREATE INDEX "orders_cliente_estado_idx" ON "orders"("cliente", "estado");
CREATE INDEX "orders_asignadoId_estado_idx" ON "orders"("asignadoId", "estado");
CREATE INDEX "orders_creadorId_idx" ON "orders"("creadorId");
CREATE INDEX "orders_fechaInicio_idx" ON "orders"("fechaInicio");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt" DESC);

-- Order Items
CREATE INDEX "order_items_orderId_completado_idx" ON "order_items"("orderId", "completado");

-- Evidences
CREATE INDEX "evidences_orderId_tipo_idx" ON "evidences"("orderId", "tipo");
CREATE INDEX "evidences_subidoPorId_idx" ON "evidences"("subidoPorId");
CREATE INDEX "evidences_createdAt_idx" ON "evidences"("createdAt" DESC);

-- Costs
CREATE INDEX "costs_orderId_tipo_idx" ON "costs"("orderId", "tipo");
CREATE INDEX "costs_facturado_idx" ON "costs"("facturado");
CREATE INDEX "costs_creadoPorId_idx" ON "costs"("creadoPorId");

-- Audit Logs
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");
CREATE INDEX "audit_logs_userId_action_idx" ON "audit_logs"("userId", "action");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt" DESC);
CREATE INDEX "audit_logs_changes_gin_idx" ON "audit_logs" USING GIN ("changes");

-- Kits Típicos
CREATE UNIQUE INDEX "kits_tipicos_nombre_key" ON "kits_tipicos"("nombre");
CREATE INDEX "kits_tipicos_activo_categoria_idx" ON "kits_tipicos"("activo", "categoria");
CREATE INDEX "kits_tipicos_codigo_idx" ON "kits_tipicos"("codigo");
CREATE INDEX "kits_herramientas_gin_idx" ON "kits_tipicos" USING GIN ("herramientas");
CREATE INDEX "kits_equipos_gin_idx" ON "kits_tipicos" USING GIN ("equipos");

-- Planeaciones
CREATE UNIQUE INDEX "planeaciones_ordenId_key" ON "planeaciones"("ordenId");
CREATE INDEX "planeaciones_estado_idx" ON "planeaciones"("estado");
CREATE INDEX "planeaciones_kitId_idx" ON "planeaciones"("kitId");
CREATE INDEX "planeaciones_aprobadoPorId_idx" ON "planeaciones"("aprobadoPorId");
CREATE INDEX "planeaciones_cronograma_gin_idx" ON "planeaciones" USING GIN ("cronograma");

-- Ejecuciones
CREATE UNIQUE INDEX "ejecuciones_ordenId_key" ON "ejecuciones"("ordenId");
CREATE UNIQUE INDEX "ejecuciones_planeacionId_key" ON "ejecuciones"("planeacionId");
CREATE INDEX "ejecuciones_estado_avance_idx" ON "ejecuciones"("estado", "avancePercentaje");
CREATE INDEX "ejecuciones_fechaInicio_idx" ON "ejecuciones"("fechaInicio");

-- Tareas Ejecución
CREATE INDEX "tareas_ejecucion_ejecucionId_completada_idx" ON "tareas_ejecucion"("ejecucionId", "completada");
CREATE INDEX "tareas_ejecucion_orden_idx" ON "tareas_ejecucion"("ejecucionId", "orden");

-- Checklist Ejecución
CREATE INDEX "checklist_ejecucion_ejecucionId_completada_idx" ON "checklist_ejecucion"("ejecucionId", "completada");
CREATE INDEX "checklist_ejecucion_orden_idx" ON "checklist_ejecucion"("ejecucionId", "orden");

-- Evidencias Ejecución
CREATE INDEX "evidencias_ejecucion_ejecucionId_tipo_idx" ON "evidencias_ejecucion"("ejecucionId", "tipo");
CREATE INDEX "evidencias_ejecucion_ordenId_idx" ON "evidencias_ejecucion"("ordenId");
CREATE INDEX "evidencias_ejecucion_verificada_idx" ON "evidencias_ejecucion"("verificada");
CREATE INDEX "evidencias_ejecucion_tags_gin_idx" ON "evidencias_ejecucion" USING GIN ("tags");

-- Push Subscriptions
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");
CREATE INDEX "push_subscriptions_userId_active_idx" ON "push_subscriptions"("userId", "active");

-- ==========================================
-- FOREIGN KEYS
-- ==========================================

-- Refresh Tokens
ALTER TABLE "refresh_tokens" 
  ADD CONSTRAINT "refresh_tokens_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Password Reset Tokens
ALTER TABLE "password_reset_tokens" 
  ADD CONSTRAINT "password_reset_tokens_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Orders
ALTER TABLE "orders" 
  ADD CONSTRAINT "orders_creadorId_fkey" 
  FOREIGN KEY ("creadorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "orders" 
  ADD CONSTRAINT "orders_asignadoId_fkey" 
  FOREIGN KEY ("asignadoId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "orders" 
  ADD CONSTRAINT "orders_canceladaPorId_fkey" 
  FOREIGN KEY ("canceladaPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Order Items
ALTER TABLE "order_items" 
  ADD CONSTRAINT "order_items_orderId_fkey" 
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items" 
  ADD CONSTRAINT "order_items_completadoPorId_fkey" 
  FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Evidences
ALTER TABLE "evidences" 
  ADD CONSTRAINT "evidences_orderId_fkey" 
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evidences" 
  ADD CONSTRAINT "evidences_subidoPorId_fkey" 
  FOREIGN KEY ("subidoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Costs
ALTER TABLE "costs" 
  ADD CONSTRAINT "costs_orderId_fkey" 
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "costs" 
  ADD CONSTRAINT "costs_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Audit Logs
ALTER TABLE "audit_logs" 
  ADD CONSTRAINT "audit_logs_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Kits Típicos
ALTER TABLE "kits_tipicos" 
  ADD CONSTRAINT "kits_tipicos_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Planeaciones
ALTER TABLE "planeaciones" 
  ADD CONSTRAINT "planeaciones_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "planeaciones" 
  ADD CONSTRAINT "planeaciones_kitId_fkey" 
  FOREIGN KEY ("kitId") REFERENCES "kits_tipicos"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "planeaciones" 
  ADD CONSTRAINT "planeaciones_aprobadoPorId_fkey" 
  FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "planeaciones" 
  ADD CONSTRAINT "planeaciones_rechazadoPorId_fkey" 
  FOREIGN KEY ("rechazadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "planeaciones" 
  ADD CONSTRAINT "planeaciones_creadoPorId_fkey" 
  FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Ejecuciones
ALTER TABLE "ejecuciones" 
  ADD CONSTRAINT "ejecuciones_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ejecuciones" 
  ADD CONSTRAINT "ejecuciones_planeacionId_fkey" 
  FOREIGN KEY ("planeacionId") REFERENCES "planeaciones"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ejecuciones" 
  ADD CONSTRAINT "ejecuciones_iniciadaPorId_fkey" 
  FOREIGN KEY ("iniciadaPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ejecuciones" 
  ADD CONSTRAINT "ejecuciones_finalizadaPorId_fkey" 
  FOREIGN KEY ("finalizadaPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Tareas Ejecución
ALTER TABLE "tareas_ejecucion" 
  ADD CONSTRAINT "tareas_ejecucion_ejecucionId_fkey" 
  FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tareas_ejecucion" 
  ADD CONSTRAINT "tareas_ejecucion_completadaPorId_fkey" 
  FOREIGN KEY ("completadaPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Checklist Ejecución
ALTER TABLE "checklist_ejecucion" 
  ADD CONSTRAINT "checklist_ejecucion_ejecucionId_fkey" 
  FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "checklist_ejecucion" 
  ADD CONSTRAINT "checklist_ejecucion_completadoPorId_fkey" 
  FOREIGN KEY ("completadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Evidencias Ejecución
ALTER TABLE "evidencias_ejecucion" 
  ADD CONSTRAINT "evidencias_ejecucion_ejecucionId_fkey" 
  FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evidencias_ejecucion" 
  ADD CONSTRAINT "evidencias_ejecucion_ordenId_fkey" 
  FOREIGN KEY ("ordenId") REFERENCES "orders"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evidencias_ejecucion" 
  ADD CONSTRAINT "evidencias_ejecucion_subidoPorId_fkey" 
  FOREIGN KEY ("subidoPorId") REFERENCES "users"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "evidencias_ejecucion" 
  ADD CONSTRAINT "evidencias_ejecucion_verificadoPorId_fkey" 
  FOREIGN KEY ("verificadoPorId") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Push Subscriptions
ALTER TABLE "push_subscriptions" 
  ADD CONSTRAINT "push_subscriptions_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Calcular varianza de costos automáticamente
CREATE OR REPLACE FUNCTION calcular_varianza_orden()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."presupuestoEstimado" > 0 THEN
    NEW."varianzaCosto" := ((NEW."costoReal" - NEW."presupuestoEstimado") / NEW."presupuestoEstimado") * 100;
  ELSE
    NEW."varianzaCosto" := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_calcular_varianza
  BEFORE INSERT OR UPDATE OF "presupuestoEstimado", "costoReal" ON "orders"
  FOR EACH ROW
  EXECUTE FUNCTION calcular_varianza_orden();

-- Actualizar avance de ejecución basado en tareas
CREATE OR REPLACE FUNCTION actualizar_avance_ejecucion()
RETURNS TRIGGER AS $$
DECLARE
  v_total INTEGER;
  v_completadas INTEGER;
  v_porcentaje INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE completada = true)
  INTO v_total, v_completadas
  FROM tareas_ejecucion
  WHERE "ejecucionId" = COALESCE(NEW."ejecucionId", OLD."ejecucionId");

  IF v_total > 0 THEN
    v_porcentaje := ROUND((v_completadas::DECIMAL / v_total) * 100);
    
    UPDATE ejecuciones
    SET "avancePercentaje" = v_porcentaje,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW."ejecucionId", OLD."ejecucionId");
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tareas_actualizar_avance
  AFTER INSERT OR UPDATE OF completada OR DELETE ON "tareas_ejecucion"
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_avance_ejecucion();
