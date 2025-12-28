/*
  Warnings:

  - You are about to alter the column `rating` on the `Hunter` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hunter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "alive" BOOLEAN NOT NULL DEFAULT true,
    "avatarId" INTEGER,
    "money" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER,
    "groupId" INTEGER,
    "bio" TEXT,
    "pronouns" TEXT,
    "type" TEXT,
    "rating" REAL NOT NULL DEFAULT 1,
    CONSTRAINT "Hunter_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Photo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hunter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hunter_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "HunterGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hunter" ("alive", "avatarId", "bio", "groupId", "handle", "id", "money", "name", "pronouns", "rating", "type", "userId") SELECT "alive", "avatarId", "bio", "groupId", "handle", "id", "money", "name", "pronouns", "rating", "type", "userId" FROM "Hunter";
DROP TABLE "Hunter";
ALTER TABLE "new_Hunter" RENAME TO "Hunter";
CREATE UNIQUE INDEX "Hunter_handle_key" ON "Hunter"("handle");
CREATE UNIQUE INDEX "Hunter_avatarId_key" ON "Hunter"("avatarId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
