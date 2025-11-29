-- CreateTable
CREATE TABLE "CostBreakdownItem" (
    "id" TEXT NOT NULL,
    "workPlanId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedAmount" DOUBLE PRECISION NOT NULL,
    "actualAmount" DOUBLE PRECISION,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostBreakdownItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CostBreakdownItem_workPlanId_idx" ON "CostBreakdownItem"("workPlanId");

-- CreateIndex
CREATE INDEX "CostBreakdownItem_category_idx" ON "CostBreakdownItem"("category");

-- AddForeignKey
ALTER TABLE "CostBreakdownItem" ADD CONSTRAINT "CostBreakdownItem_workPlanId_fkey" FOREIGN KEY ("workPlanId") REFERENCES "WorkPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
