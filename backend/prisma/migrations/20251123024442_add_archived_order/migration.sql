-- CreateTable
CREATE TABLE "ArchivedOrder" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "month" TEXT NOT NULL,
    "archivedBy" TEXT,

    CONSTRAINT "ArchivedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArchivedOrder_month_idx" ON "ArchivedOrder"("month");

-- CreateIndex
CREATE INDEX "ArchivedOrder_orderNumber_idx" ON "ArchivedOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "ArchivedOrder_archivedAt_idx" ON "ArchivedOrder"("archivedAt");
