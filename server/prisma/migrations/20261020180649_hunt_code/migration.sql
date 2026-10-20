/*
  Warnings:

  - Added the required column `code` to the `Hunt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hunt" ADD COLUMN     "code" TEXT NOT NULL;
