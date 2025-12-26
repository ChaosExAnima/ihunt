/*
  Warnings:

  - A unique constraint covering the columns `[fromHunterId,huntId,toHunterId]` on the table `HuntInvite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Hunt_scheduledAt_idx" ON "Hunt"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "HuntInvite_fromHunterId_huntId_toHunterId_key" ON "HuntInvite"("fromHunterId", "huntId", "toHunterId");
