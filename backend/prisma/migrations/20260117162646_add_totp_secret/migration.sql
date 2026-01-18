/*
  Warnings:

  - You are about to drop the column `checklistId` on the `fotos_evidencia` table. All the data in the column will be lost.
  - You are about to drop the column `checklistItemId` on the `fotos_evidencia` table. All the data in the column will be lost.
  - You are about to drop the `archivos_historicos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `certificados` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `checklist_ejecucion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `checklist_item_ejecucion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `checklist_template_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `checklist_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formulario_respuestas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formulario_respuestas_legacy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formulario_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formularios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pending_syncs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "archivos_historicos" DROP CONSTRAINT "archivos_historicos_creadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "certificados" DROP CONSTRAINT "certificados_userId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_ejecucion" DROP CONSTRAINT "checklist_ejecucion_completadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_ejecucion" DROP CONSTRAINT "checklist_ejecucion_ejecucionId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_ejecucion" DROP CONSTRAINT "checklist_ejecucion_templateId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_item_ejecucion" DROP CONSTRAINT "checklist_item_ejecucion_checklistId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_item_ejecucion" DROP CONSTRAINT "checklist_item_ejecucion_completadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_item_ejecucion" DROP CONSTRAINT "checklist_item_ejecucion_templateItemId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_template_items" DROP CONSTRAINT "checklist_template_items_templateId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_templates" DROP CONSTRAINT "checklist_templates_creadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "formulario_respuestas" DROP CONSTRAINT "formulario_respuestas_templateId_fkey";

-- DropForeignKey
ALTER TABLE "formulario_respuestas_legacy" DROP CONSTRAINT "formulario_respuestas_legacy_formularioId_fkey";

-- DropForeignKey
ALTER TABLE "formulario_templates" DROP CONSTRAINT "formulario_templates_creadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "fotos_evidencia" DROP CONSTRAINT "fotos_evidencia_checklistId_fkey";

-- DropForeignKey
ALTER TABLE "fotos_evidencia" DROP CONSTRAINT "fotos_evidencia_checklistItemId_fkey";

-- DropIndex
DROP INDEX "fotos_evidencia_checklistId_idx";

-- DropIndex
DROP INDEX "fotos_evidencia_checklistItemId_idx";

-- AlterTable
ALTER TABLE "formularios_instancias" ADD COLUMN     "ejecucionId" TEXT;

-- AlterTable
ALTER TABLE "fotos_evidencia" DROP COLUMN "checklistId",
DROP COLUMN "checklistItemId";

-- AlterTable
ALTER TABLE "kits_tipicos" ADD COLUMN     "formTemplateId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "twoFactorSecret" TEXT;

-- DropTable
DROP TABLE "archivos_historicos";

-- DropTable
DROP TABLE "certificados";

-- DropTable
DROP TABLE "checklist_ejecucion";

-- DropTable
DROP TABLE "checklist_item_ejecucion";

-- DropTable
DROP TABLE "checklist_template_items";

-- DropTable
DROP TABLE "checklist_templates";

-- DropTable
DROP TABLE "formulario_respuestas";

-- DropTable
DROP TABLE "formulario_respuestas_legacy";

-- DropTable
DROP TABLE "formulario_templates";

-- DropTable
DROP TABLE "formularios";

-- DropTable
DROP TABLE "pending_syncs";

-- DropEnum
DROP TYPE "TipoArchivo";

-- CreateIndex
CREATE INDEX "formularios_instancias_ejecucionId_idx" ON "formularios_instancias"("ejecucionId");

-- CreateIndex
CREATE INDEX "kits_tipicos_formTemplateId_idx" ON "kits_tipicos"("formTemplateId");

-- AddForeignKey
ALTER TABLE "formularios_instancias" ADD CONSTRAINT "formularios_instancias_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "ejecuciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kits_tipicos" ADD CONSTRAINT "kits_tipicos_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "form_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
