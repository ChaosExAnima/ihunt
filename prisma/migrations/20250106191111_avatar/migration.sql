-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hunter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarId" INTEGER,
    CONSTRAINT "Hunter_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Photo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hunter" ("email", "id", "name", "rating", "userId") SELECT "email", "id", "name", "rating", "userId" FROM "Hunter";
DROP TABLE "Hunter";
ALTER TABLE "new_Hunter" RENAME TO "Hunter";
CREATE UNIQUE INDEX "Hunter_userId_key" ON "Hunter"("userId");
CREATE UNIQUE INDEX "Hunter_avatarId_key" ON "Hunter"("avatarId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
