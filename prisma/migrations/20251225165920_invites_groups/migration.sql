/*
  Warnings:

  - You are about to drop the `_Follows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "_Follows_B_index";

-- DropIndex
DROP INDEX "_Follows_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_Follows";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "HunterGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "HuntInvite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromHunterId" INTEGER NOT NULL,
    "toHunterId" INTEGER NOT NULL,
    "huntId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "HuntInvite_fromHunterId_fkey" FOREIGN KEY ("fromHunterId") REFERENCES "Hunter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HuntInvite_toHunterId_fkey" FOREIGN KEY ("toHunterId") REFERENCES "Hunter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HuntInvite_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "rating" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Hunter_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Photo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hunter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hunter_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "HunterGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hunter" ("alive", "avatarId", "bio", "handle", "id", "money", "name", "pronouns", "type", "userId") SELECT "alive", "avatarId", "bio", "handle", "id", "money", "name", "pronouns", "type", "userId" FROM "Hunter";
DROP TABLE "Hunter";
ALTER TABLE "new_Hunter" RENAME TO "Hunter";
CREATE UNIQUE INDEX "Hunter_handle_key" ON "Hunter"("handle");
CREATE UNIQUE INDEX "Hunter_avatarId_key" ON "Hunter"("avatarId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
