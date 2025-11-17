-- AlterTable
ALTER TABLE "WorkPlan" ADD COLUMN "actualEnd" DATETIME;
ALTER TABLE "WorkPlan" ADD COLUMN "actualStart" DATETIME;
ALTER TABLE "WorkPlan" ADD COLUMN "assignedTeam" TEXT;
ALTER TABLE "WorkPlan" ADD COLUMN "asts" TEXT;
ALTER TABLE "WorkPlan" ADD COLUMN "attachments" TEXT;
ALTER TABLE "WorkPlan" ADD COLUMN "budgetBreakdown" TEXT;
ALTER TABLE "WorkPlan" ADD COLUMN "checklists" TEXT;
ALTER TABLE "WorkPlan" ADD COLUMN "notes" TEXT;
ALTER TABLE "WorkPlan" ADD COLUMN "plannedEnd" DATETIME;
ALTER TABLE "WorkPlan" ADD COLUMN "plannedStart" DATETIME;
ALTER TABLE "WorkPlan" ADD COLUMN "safetyMeetings" TEXT;
ALTER TABLE "WorkPlan" ADD COLUMN "tasks" TEXT;
