/*
  Warnings:

  - You are about to drop the column `adminNotes` on the `quote_requests` table. All the data in the column will be lost.
  - You are about to drop the column `attachments` on the `quote_requests` table. All the data in the column will be lost.
  - You are about to drop the column `convertedOrderId` on the `quote_requests` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCost` on the `quote_requests` table. All the data in the column will be lost.
  - You are about to drop the column `quotedAt` on the `quote_requests` table. All the data in the column will be lost.
  - You are about to drop the column `quotedBy` on the `quote_requests` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "quote_requests_createdAt_idx";

-- AlterTable
ALTER TABLE "quote_requests" DROP COLUMN "adminNotes",
DROP COLUMN "attachments",
DROP COLUMN "convertedOrderId",
DROP COLUMN "estimatedCost",
DROP COLUMN "quotedAt",
DROP COLUMN "quotedBy",
ADD COLUMN     "location" TEXT;
