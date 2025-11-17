/*
  Warnings:

  - You are about to drop the column `isActive` on the `Kit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN "clientEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN "clientPhone" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Kit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "tools" TEXT NOT NULL DEFAULT '[]',
    "equipment" TEXT NOT NULL DEFAULT '[]',
    "documents" TEXT NOT NULL DEFAULT '[]',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Kit_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Kit" ("category", "createdAt", "createdBy", "description", "documents", "equipment", "id", "name", "tools", "updatedAt") SELECT "category", "createdAt", "createdBy", "description", "documents", "equipment", "id", "name", "tools", "updatedAt" FROM "Kit";
DROP TABLE "Kit";
ALTER TABLE "new_Kit" RENAME TO "Kit";
CREATE INDEX "Kit_category_idx" ON "Kit"("category");
CREATE INDEX "Kit_active_idx" ON "Kit"("active");
CREATE TABLE "new_RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RefreshToken" ("createdAt", "expiresAt", "family", "id", "ipAddress", "isRevoked", "lastUsedAt", "token", "updatedAt", "userAgent", "userId") SELECT "createdAt", "expiresAt", "family", "id", "ipAddress", "isRevoked", "lastUsedAt", "token", "updatedAt", "userAgent", "userId" FROM "RefreshToken";
DROP TABLE "RefreshToken";
ALTER TABLE "new_RefreshToken" RENAME TO "RefreshToken";
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_family_idx" ON "RefreshToken"("family");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
