/*
  Warnings:

  - You are about to drop the `HuntHunter` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `email` to the `Hunter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" ADD COLUMN "blurry" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HuntHunter";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_HuntToHunter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_HuntToHunter_A_fkey" FOREIGN KEY ("A") REFERENCES "Hunt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_HuntToHunter_B_fkey" FOREIGN KEY ("B") REFERENCES "Hunter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hunter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL
);
INSERT INTO "new_Hunter" ("id", "name", "rating", "userId") SELECT "id", "name", "rating", "userId" FROM "Hunter";
DROP TABLE "Hunter";
ALTER TABLE "new_Hunter" RENAME TO "Hunter";
CREATE UNIQUE INDEX "Hunter_userId_key" ON "Hunter"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_HuntToHunter_AB_unique" ON "_HuntToHunter"("A", "B");

-- CreateIndex
CREATE INDEX "_HuntToHunter_B_index" ON "_HuntToHunter"("B");

-- CreateIndex
CREATE INDEX "Photo_huntId_hunterId_idx" ON "Photo"("huntId", "hunterId");
