/*
  Warnings:

  - You are about to drop the `UserVapid` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserVapid";
PRAGMA foreign_keys=on;
