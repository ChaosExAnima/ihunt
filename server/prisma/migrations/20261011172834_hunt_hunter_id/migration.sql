/*
  Warnings:

  - The primary key for the `HuntHunter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `spotNum` on the `HuntHunter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HuntHunter" DROP CONSTRAINT "HuntHunter_pkey",
DROP COLUMN "spotNum",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "HuntHunter_pkey" PRIMARY KEY ("id");
