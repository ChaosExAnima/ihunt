/*
  Warnings:

  - Added the required column `payment` to the `Hunt` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hunt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" DATETIME,
    "completedAt" DATETIME,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "maxHunters" INTEGER NOT NULL DEFAULT 4,
    "danger" INTEGER NOT NULL DEFAULT 1,
    "rating" REAL,
    "comment" TEXT,
    "payment" INTEGER NOT NULL
);
INSERT INTO "new_Hunt" ("completedAt", "createdAt", "danger", "description", "id", "maxHunters", "name", "rating", "scheduledAt", "status") SELECT "completedAt", "createdAt", "danger", "description", "id", "maxHunters", "name", "rating", "scheduledAt", "status" FROM "Hunt";
DROP TABLE "Hunt";
ALTER TABLE "new_Hunt" RENAME TO "Hunt";
CREATE INDEX "Hunt_status_idx" ON "Hunt"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
