-- AlterTable
ALTER TABLE "HuntHunter" ADD CONSTRAINT "HuntHunter_pkey" PRIMARY KEY ("huntId", "hunterId");

-- DropIndex
DROP INDEX "HuntHunter_huntId_hunterId_key";
