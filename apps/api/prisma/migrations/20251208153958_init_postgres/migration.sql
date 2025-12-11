-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'supervisor', 'tecnico', 'administrativo');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('planeacion', 'ejecucion', 'pausada', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('baja', 'media', 'alta', 'urgente');

-- CreateEnum
CREATE TYPE "EstadoPlaneacion" AS ENUM ('borrador', 'en_revision', 'aprobada', 'en_ejecucion', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "EstadoEjecucion" AS ENUM ('NO_INICIADA', 'EN_PROGRESO', 'PAUSADA', 'COMPLETADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'tecnico',
    "phone" TEXT,
    "avatar" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "estado" "OrderStatus" NOT NULL DEFAULT 'planeacion',
    "prioridad" "OrderPriority" NOT NULL DEFAULT 'media',
    "fechaFinEstimada" TIMESTAMP(3),
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "creadorId" TEXT,
    "asignadoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidences" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costs" (
    "id" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kits_tipicos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "herramientas" JSONB NOT NULL,
    "equipos" JSONB NOT NULL,
    "documentos" TEXT[],
    "checklistItems" TEXT[],
    "duracionEstimadaHoras" INTEGER NOT NULL,
    "costoEstimado" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kits_tipicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planeaciones" (
    "id" TEXT NOT NULL,
    "estado" "EstadoPlaneacion" NOT NULL DEFAULT 'borrador',
    "cronograma" JSONB NOT NULL,
    "manoDeObra" JSONB NOT NULL,
    "herramientasAdicionales" JSONB,
    "documentosApoyo" TEXT[],
    "observaciones" TEXT,
    "aprobadoPorId" TEXT,
    "fechaAprobacion" TIMESTAMP(3),
    "ordenId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planeaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejecuciones" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "planeacionId" TEXT NOT NULL,
    "estado" "EstadoEjecucion" NOT NULL DEFAULT 'NO_INICIADA',
    "avancePercentaje" INTEGER NOT NULL DEFAULT 0,
    "horasActuales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "horasEstimadas" DOUBLE PRECISION NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaTermino" TIMESTAMP(3),
    "ubicacionGPS" JSONB,
    "observacionesInicio" TEXT,
    "observaciones" TEXT,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tareas_ejecucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_ejecucion" (
    "id" TEXT NOT NULL,
    "ejecucionId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "completadoPor" TEXT,
    "completadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_ejecucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias_ejecucion" (
    "id" TEXT NOT NULL,
    "ejecucionId" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "rutaArchivo" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "descripcion" TEXT NOT NULL,
    "ubicacionGPS" JSONB,
    "tags" TEXT[],
    "subidoPor" TEXT NOT NULL,
    "verificada" BOOLEAN NOT NULL DEFAULT false,
    "verificadoPor" TEXT,
    "verificadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidencias_ejecucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_numero_key" ON "orders"("numero");

-- CreateIndex
CREATE INDEX "orders_estado_idx" ON "orders"("estado");

-- CreateIndex
CREATE INDEX "orders_cliente_idx" ON "orders"("cliente");

-- CreateIndex
CREATE INDEX "orders_numero_idx" ON "orders"("numero");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "evidences_orderId_idx" ON "evidences"("orderId");

-- CreateIndex
CREATE INDEX "costs_orderId_idx" ON "costs"("orderId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kits_tipicos_nombre_key" ON "kits_tipicos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "planeaciones_ordenId_key" ON "planeaciones"("ordenId");

-- CreateIndex
CREATE INDEX "planeaciones_ordenId_idx" ON "planeaciones"("ordenId");

-- CreateIndex
CREATE INDEX "planeaciones_kitId_idx" ON "planeaciones"("kitId");

-- CreateIndex
CREATE INDEX "planeaciones_estado_idx" ON "planeaciones"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "ejecuciones_ordenId_key" ON "ejecuciones"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "ejecuciones_planeacionId_key" ON "ejecuciones"("planeacionId");

-- CreateIndex
CREATE INDEX "ejecuciones_ordenId_idx" ON "ejecuciones"("ordenId");

-- CreateIndex
CREATE INDEX "ejecuciones_estado_idx" ON "ejecuciones"("estado");

-- CreateIndex
CREATE INDEX "tareas_ejecucion_ejecucionId_idx" ON "tareas_ejecucion"("ejecucionId");

-- CreateIndex
CREATE INDEX "checklist_ejecucion_ejecucionId_idx" ON "checklist_ejecucion"("ejecucionId");

-- CreateIndex
CREATE INDEX "evidencias_ejecucion_ejecucionId_idx" ON "evidencias_ejecucion"("ejecucionId");

-- CreateIndex
CREATE INDEX "evidencias_ejecucion_ordenId_idx" ON "evidencias_ejecucion"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_asignadoId_fkey" FOREIGN KEY ("asignadoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costs" ADD CONSTRAINT "costs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planeaciones" ADD CONSTRAINT "planeaciones_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planeaciones" ADD CONSTRAINT "planeaciones_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits_tipicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planeaciones" ADD CONSTRAINT "planeaciones_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecuciones" ADD CONSTRAINT "ejecuciones_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecuciones" ADD CONSTRAINT "ejecuciones_planeacionId_fkey" FOREIGN KEY ("planeacionId") REFERENCES "planeaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_ejecucion" ADD CONSTRAINT "tareas_ejecucion_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_ejecucion" ADD CONSTRAINT "checklist_ejecucion_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_ejecucion" ADD CONSTRAINT "evidencias_ejecucion_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_ejecucion" ADD CONSTRAINT "evidencias_ejecucion_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
