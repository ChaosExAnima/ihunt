/*
  Warnings:

  - You are about to alter the column `userId` on the `Hunter` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hunter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "avatarId" INTEGER,
    "money" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "bio" TEXT,
    "pronouns" TEXT,
    "handle" TEXT,
    "type" TEXT,
    CONSTRAINT "Hunter_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Photo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hunter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hunter" ("avatarId", "bio", "handle", "id", "money", "name", "pronouns", "type", "userId") SELECT "avatarId", "bio", "handle", "id", "money", "name", "pronouns", "type", "userId" FROM "Hunter";
DROP TABLE "Hunter";
ALTER TABLE "new_Hunter" RENAME TO "Hunter";
CREATE UNIQUE INDEX "Hunter_avatarId_key" ON "Hunter"("avatarId");
CREATE UNIQUE INDEX "Hunter_userId_key" ON "Hunter"("userId");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "password" TEXT NOT NULL,
    "run" INTEGER NOT NULL DEFAULT 1,
    "hideMoney" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "hideMoney", "id", "password", "run", "updatedAt") SELECT "createdAt", "hideMoney", "id", "password", "run", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_password_key" ON "User"("password");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
