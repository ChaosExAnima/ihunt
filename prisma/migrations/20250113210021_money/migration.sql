/*
  Warnings:

  - You are about to drop the column `minRating` on the `Hunt` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Hunter` table. All the data in the column will be lost.

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
    "status" TEXT NOT NULL,
    "maxHunters" INTEGER NOT NULL,
    "danger" INTEGER NOT NULL DEFAULT 1,
    "rating" REAL
);
INSERT INTO "new_Hunt" ("completedAt", "createdAt", "description", "id", "maxHunters", "name", "status") SELECT "completedAt", "createdAt", "description", "id", "maxHunters", "name", "status" FROM "Hunt";
DROP TABLE "Hunt";
ALTER TABLE "new_Hunt" RENAME TO "Hunt";
CREATE INDEX "Hunt_status_idx" ON "Hunt"("status");
CREATE TABLE "new_Hunter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarId" INTEGER,
    "money" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Hunter_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Photo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hunter" ("avatarId", "email", "id", "name", "userId") SELECT "avatarId", "email", "id", "name", "userId" FROM "Hunter";
DROP TABLE "Hunter";
ALTER TABLE "new_Hunter" RENAME TO "Hunter";
CREATE UNIQUE INDEX "Hunter_userId_key" ON "Hunter"("userId");
CREATE UNIQUE INDEX "Hunter_avatarId_key" ON "Hunter"("avatarId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
