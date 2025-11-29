-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billingDetails" JSONB,
ADD COLUMN     "billingState" TEXT NOT NULL DEFAULT 'PENDING_ACTA';

-- CreateIndex
CREATE INDEX "Order_billingState_idx" ON "Order"("billingState");
