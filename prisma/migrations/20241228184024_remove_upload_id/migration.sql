/*
  Warnings:

  - You are about to drop the column `uploadedBy` on the `Photo` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "blurry" TEXT,
    "hunterId" INTEGER,
    "huntId" INTEGER,
    CONSTRAINT "Photo_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "Hunter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Photo_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Photo" ("blurry", "height", "huntId", "hunterId", "id", "path", "width") SELECT "blurry", "height", "huntId", "hunterId", "id", "path", "width" FROM "Photo";
DROP TABLE "Photo";
ALTER TABLE "new_Photo" RENAME TO "Photo";
CREATE INDEX "Photo_huntId_hunterId_idx" ON "Photo"("huntId", "hunterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
