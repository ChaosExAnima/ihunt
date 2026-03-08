-- CreateTable
CREATE TABLE "Hunt" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "place" TEXT,
    "warnings" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "danger" INTEGER NOT NULL DEFAULT 1,
    "maxHunters" INTEGER NOT NULL DEFAULT 5,
    "minRating" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "comment" TEXT,
    "payment" INTEGER NOT NULL,
    "paidHunters" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Hunt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hunter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "alive" BOOLEAN NOT NULL DEFAULT true,
    "avatarId" INTEGER,
    "money" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER,
    "groupId" INTEGER,
    "bio" TEXT,
    "pronouns" TEXT,
    "type" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "Hunter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HunterGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "HunterGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HuntInvite" (
    "id" SERIAL NOT NULL,
    "fromHunterId" INTEGER NOT NULL,
    "toHunterId" INTEGER NOT NULL,
    "huntId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "HuntInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "blurry" TEXT,
    "hunterId" INTEGER,
    "huntId" INTEGER,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "run" INTEGER NOT NULL DEFAULT 1,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hunterId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVapid" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "payload" TEXT NOT NULL,
    "expirationTime" TIMESTAMP(3),

    CONSTRAINT "UserVapid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HuntToHunter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_HuntToHunter_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Hunt_status_idx" ON "Hunt"("status");

-- CreateIndex
CREATE INDEX "Hunt_scheduledAt_idx" ON "Hunt"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Hunter_handle_key" ON "Hunter"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Hunter_avatarId_key" ON "Hunter"("avatarId");

-- CreateIndex
CREATE UNIQUE INDEX "Hunter_userId_key" ON "Hunter"("userId");

-- CreateIndex
CREATE INDEX "Hunter_alive_idx" ON "Hunter"("alive");

-- CreateIndex
CREATE INDEX "toHunterStatus" ON "HuntInvite"("toHunterId", "status");

-- CreateIndex
CREATE INDEX "HuntInvite_expiresAt_idx" ON "HuntInvite"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "HuntInvite_fromHunterId_huntId_toHunterId_key" ON "HuntInvite"("fromHunterId", "huntId", "toHunterId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_path_key" ON "Photo"("path");

-- CreateIndex
CREATE INDEX "Photo_huntId_hunterId_idx" ON "Photo"("huntId", "hunterId");

-- CreateIndex
CREATE UNIQUE INDEX "User_password_key" ON "User"("password");

-- CreateIndex
CREATE INDEX "UserVapid_userId_expirationTime_idx" ON "UserVapid"("userId", "expirationTime");

-- CreateIndex
CREATE INDEX "_HuntToHunter_B_index" ON "_HuntToHunter"("B");

-- AddForeignKey
ALTER TABLE "Hunter" ADD CONSTRAINT "Hunter_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Photo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hunter" ADD CONSTRAINT "Hunter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hunter" ADD CONSTRAINT "Hunter_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "HunterGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuntInvite" ADD CONSTRAINT "HuntInvite_fromHunterId_fkey" FOREIGN KEY ("fromHunterId") REFERENCES "Hunter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuntInvite" ADD CONSTRAINT "HuntInvite_toHunterId_fkey" FOREIGN KEY ("toHunterId") REFERENCES "Hunter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuntInvite" ADD CONSTRAINT "HuntInvite_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "Hunter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVapid" ADD CONSTRAINT "UserVapid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HuntToHunter" ADD CONSTRAINT "_HuntToHunter_A_fkey" FOREIGN KEY ("A") REFERENCES "Hunt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HuntToHunter" ADD CONSTRAINT "_HuntToHunter_B_fkey" FOREIGN KEY ("B") REFERENCES "Hunter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
