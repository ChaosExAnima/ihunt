-- CreateTable
CREATE TABLE "UserVapid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "payload" TEXT NOT NULL,
    "expirationTime" DATETIME,
    CONSTRAINT "UserVapid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserVapid_userId_expirationTime_idx" ON "UserVapid"("userId", "expirationTime");
