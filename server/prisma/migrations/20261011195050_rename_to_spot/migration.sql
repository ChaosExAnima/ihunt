/*
  Warnings:

  - You are about to drop the `HuntHunter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HuntHunter" DROP CONSTRAINT "HuntHunter_huntId_fkey";

-- DropForeignKey
ALTER TABLE "HuntHunter" DROP CONSTRAINT "HuntHunter_hunterId_fkey";

-- DropTable
DROP TABLE "HuntHunter";

-- CreateTable
CREATE TABLE "HuntSpot" (
    "id" SERIAL NOT NULL,
    "huntId" INTEGER NOT NULL,
    "hunterId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'empty',
    "paid" INTEGER,
    "fromHunterId" INTEGER,

    CONSTRAINT "HuntSpot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HuntSpot" ADD CONSTRAINT "HuntSpot_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuntSpot" ADD CONSTRAINT "HuntSpot_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "Hunter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
