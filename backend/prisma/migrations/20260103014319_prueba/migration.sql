/*
  Warnings:

  - A unique constraint covering the columns `[userId,deviceId,localId]` on the table `pending_syncs` will be added. If there are existing duplicate values, this will fail.
  - Made the column `deviceId` on table `pending_syncs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `localId` on table `pending_syncs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "pending_syncs" ALTER COLUMN "deviceId" SET NOT NULL,
ALTER COLUMN "localId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "pending_syncs_userId_deviceId_localId_key" ON "pending_syncs"("userId", "deviceId", "localId");
