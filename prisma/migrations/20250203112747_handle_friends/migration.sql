-- AlterTable
ALTER TABLE "Hunter" ADD COLUMN "handle" TEXT;

-- CreateTable
CREATE TABLE "_Follows" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_Follows_A_fkey" FOREIGN KEY ("A") REFERENCES "Hunter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Follows_B_fkey" FOREIGN KEY ("B") REFERENCES "Hunter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_Follows_AB_unique" ON "_Follows"("A", "B");

-- CreateIndex
CREATE INDEX "_Follows_B_index" ON "_Follows"("B");
