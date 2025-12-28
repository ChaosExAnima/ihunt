/*
  Warnings:

  - Added the required column `expiresAt` to the `HuntInvite` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HuntInvite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromHunterId" INTEGER NOT NULL,
    "toHunterId" INTEGER NOT NULL,
    "huntId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "HuntInvite_fromHunterId_fkey" FOREIGN KEY ("fromHunterId") REFERENCES "Hunter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HuntInvite_toHunterId_fkey" FOREIGN KEY ("toHunterId") REFERENCES "Hunter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HuntInvite_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HuntInvite" ("createdAt", "fromHunterId", "huntId", "id", "status", "toHunterId") SELECT "createdAt", "fromHunterId", "huntId", "id", "status", "toHunterId" FROM "HuntInvite";
DROP TABLE "HuntInvite";
ALTER TABLE "new_HuntInvite" RENAME TO "HuntInvite";
CREATE INDEX "toHunterStatus" ON "HuntInvite"("toHunterId", "status");
CREATE INDEX "HuntInvite_expiresAt_idx" ON "HuntInvite"("expiresAt");
CREATE UNIQUE INDEX "HuntInvite_fromHunterId_huntId_toHunterId_key" ON "HuntInvite"("fromHunterId", "huntId", "toHunterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Hunter_alive_idx" ON "Hunter"("alive");
