/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Hunter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Hunter_userId_key" ON "Hunter"("userId");
