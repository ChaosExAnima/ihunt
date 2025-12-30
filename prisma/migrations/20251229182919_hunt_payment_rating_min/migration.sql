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
    "place" TEXT,
    "warnings" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "danger" INTEGER NOT NULL DEFAULT 1,
    "maxHunters" INTEGER NOT NULL DEFAULT 5,
    "minRating" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "comment" TEXT,
    "payment" INTEGER NOT NULL,
    "paidHunters" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Hunt" ("comment", "completedAt", "createdAt", "danger", "description", "id", "maxHunters", "name", "payment", "place", "rating", "scheduledAt", "status", "warnings") SELECT "comment", "completedAt", "createdAt", "danger", "description", "id", "maxHunters", "name", "payment", "place", "rating", "scheduledAt", "status", "warnings" FROM "Hunt";
DROP TABLE "Hunt";
ALTER TABLE "new_Hunt" RENAME TO "Hunt";
CREATE INDEX "Hunt_status_idx" ON "Hunt"("status");
CREATE INDEX "Hunt_scheduledAt_idx" ON "Hunt"("scheduledAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
