-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('petrolero', 'industrial', 'comercial', 'residencial', 'gobierno', 'otro');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "clienteId" TEXT;

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "tipoCliente" "TipoCliente" NOT NULL DEFAULT 'petrolero',
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactos_cliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contactos_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones_cliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT,
    "departamento" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ubicaciones_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_nit_key" ON "clientes"("nit");

-- CreateIndex
CREATE INDEX "clientes_nit_idx" ON "clientes"("nit");

-- CreateIndex
CREATE INDEX "clientes_activo_idx" ON "clientes"("activo");

-- CreateIndex
CREATE INDEX "clientes_tipoCliente_idx" ON "clientes"("tipoCliente");

-- CreateIndex
CREATE INDEX "clientes_razonSocial_idx" ON "clientes"("razonSocial");

-- CreateIndex
CREATE INDEX "contactos_cliente_clienteId_idx" ON "contactos_cliente"("clienteId");

-- CreateIndex
CREATE INDEX "contactos_cliente_esPrincipal_idx" ON "contactos_cliente"("esPrincipal");

-- CreateIndex
CREATE INDEX "ubicaciones_cliente_clienteId_idx" ON "ubicaciones_cliente"("clienteId");

-- CreateIndex
CREATE INDEX "ubicaciones_cliente_esPrincipal_idx" ON "ubicaciones_cliente"("esPrincipal");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos_cliente" ADD CONSTRAINT "contactos_cliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicaciones_cliente" ADD CONSTRAINT "ubicaciones_cliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
