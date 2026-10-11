/*
  Warnings:

  - The primary key for the `HuntHunter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `spotNum` to the `HuntHunter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HuntHunter" DROP CONSTRAINT "HuntHunter_hunterId_fkey";

-- AlterTable
ALTER TABLE "HuntHunter" DROP CONSTRAINT "HuntHunter_pkey",
ADD COLUMN     "spotNum" SMALLINT NOT NULL,
ALTER COLUMN "hunterId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'empty',
ADD CONSTRAINT "HuntHunter_pkey" PRIMARY KEY ("huntId", "spotNum");

-- AddForeignKey
ALTER TABLE "HuntHunter" ADD CONSTRAINT "HuntHunter_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "Hunter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
