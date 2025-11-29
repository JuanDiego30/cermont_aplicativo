-- AlterTable
ALTER TABLE "Kit" ADD COLUMN     "activityType" TEXT;

-- AlterTable
ALTER TABLE "WorkPlan" ADD COLUMN     "kitVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suggestedKitId" TEXT;

-- CreateTable
CREATE TABLE "form_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "activityType" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "schema" JSONB NOT NULL,
    "pdfConfig" JSONB,
    "referencePdf" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "orderId" TEXT,
    "workplanId" TEXT,
    "data" JSONB NOT NULL,
    "signatures" JSONB,
    "attachments" TEXT[],
    "location" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedBy" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closing_acts" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "workDone" TEXT NOT NULL,
    "observations" TEXT,
    "recommendations" TEXT,
    "checklistResults" JSONB,
    "evidenceIds" TEXT[],
    "technicianSignature" TEXT,
    "technicianName" TEXT,
    "technicianSignedAt" TIMESTAMP(3),
    "clientSignature" TEXT,
    "clientName" TEXT,
    "clientSignedAt" TIMESTAMP(3),
    "supervisorSignature" TEXT,
    "supervisorName" TEXT,
    "supervisorSignedAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finalizedAt" TIMESTAMP(3),

    CONSTRAINT "closing_acts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_records" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "equipmentId" TEXT,
    "equipmentName" TEXT NOT NULL,
    "location" TEXT,
    "checklistItems" JSONB NOT NULL,
    "result" TEXT NOT NULL,
    "findings" TEXT,
    "recommendations" TEXT,
    "photos" JSONB,
    "inspectorId" TEXT NOT NULL,
    "inspectorSignature" TEXT,
    "nextInspectionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_templates_category_idx" ON "form_templates"("category");

-- CreateIndex
CREATE INDEX "form_templates_activityType_idx" ON "form_templates"("activityType");

-- CreateIndex
CREATE INDEX "form_templates_isActive_idx" ON "form_templates"("isActive");

-- CreateIndex
CREATE INDEX "form_submissions_templateId_idx" ON "form_submissions"("templateId");

-- CreateIndex
CREATE INDEX "form_submissions_orderId_idx" ON "form_submissions"("orderId");

-- CreateIndex
CREATE INDEX "form_submissions_workplanId_idx" ON "form_submissions"("workplanId");

-- CreateIndex
CREATE INDEX "form_submissions_status_idx" ON "form_submissions"("status");

-- CreateIndex
CREATE INDEX "form_submissions_submittedBy_idx" ON "form_submissions"("submittedBy");

-- CreateIndex
CREATE UNIQUE INDEX "closing_acts_orderId_key" ON "closing_acts"("orderId");

-- CreateIndex
CREATE INDEX "closing_acts_orderId_idx" ON "closing_acts"("orderId");

-- CreateIndex
CREATE INDEX "closing_acts_status_idx" ON "closing_acts"("status");

-- CreateIndex
CREATE INDEX "inspection_records_orderId_idx" ON "inspection_records"("orderId");

-- CreateIndex
CREATE INDEX "inspection_records_type_idx" ON "inspection_records"("type");

-- CreateIndex
CREATE INDEX "inspection_records_result_idx" ON "inspection_records"("result");

-- CreateIndex
CREATE INDEX "inspection_records_inspectorId_idx" ON "inspection_records"("inspectorId");

-- AddForeignKey
ALTER TABLE "form_templates" ADD CONSTRAINT "form_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "form_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_workplanId_fkey" FOREIGN KEY ("workplanId") REFERENCES "WorkPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
