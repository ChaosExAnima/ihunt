-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hunt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "maxHunters" INTEGER NOT NULL,
    "minRating" REAL NOT NULL
);
INSERT INTO "new_Hunt" ("completedAt", "createdAt", "description", "id", "maxHunters", "minRating", "status") SELECT "completedAt", "createdAt", "description", "id", "maxHunters", "minRating", "status" FROM "Hunt";
DROP TABLE "Hunt";
ALTER TABLE "new_Hunt" RENAME TO "Hunt";
CREATE INDEX "Hunt_status_idx" ON "Hunt"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
