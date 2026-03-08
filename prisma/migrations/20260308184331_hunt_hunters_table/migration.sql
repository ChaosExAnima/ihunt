/*
  Warnings:

  - You are about to drop the column `paidHunters` on the `Hunt` table. All the data in the column will be lost.
  - You are about to drop the `HuntInvite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_HuntToHunter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HuntInvite" DROP CONSTRAINT "HuntInvite_fromHunterId_fkey";

-- DropForeignKey
ALTER TABLE "HuntInvite" DROP CONSTRAINT "HuntInvite_huntId_fkey";

-- DropForeignKey
ALTER TABLE "HuntInvite" DROP CONSTRAINT "HuntInvite_toHunterId_fkey";

-- DropForeignKey
ALTER TABLE "_HuntToHunter" DROP CONSTRAINT "_HuntToHunter_A_fkey";

-- DropForeignKey
ALTER TABLE "_HuntToHunter" DROP CONSTRAINT "_HuntToHunter_B_fkey";

-- AlterTable
ALTER TABLE "Hunt" DROP COLUMN "paidHunters";

-- DropTable
DROP TABLE "HuntInvite";

-- DropTable
DROP TABLE "_HuntToHunter";

-- CreateTable
CREATE TABLE "HuntHunter" (
    "huntId" INTEGER NOT NULL,
    "hunterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid" INTEGER,
    "fromHunterId" INTEGER
);

-- CreateIndex
CREATE INDEX "HuntHunter_expiresAt_idx" ON "HuntHunter"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "HuntHunter_huntId_hunterId_key" ON "HuntHunter"("huntId", "hunterId");

-- AddForeignKey
ALTER TABLE "HuntHunter" ADD CONSTRAINT "HuntHunter_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuntHunter" ADD CONSTRAINT "HuntHunter_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "Hunter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
