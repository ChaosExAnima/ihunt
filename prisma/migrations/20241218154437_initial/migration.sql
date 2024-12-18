-- CreateTable
CREATE TABLE "Hunt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "maxHunters" INTEGER NOT NULL,
    "minRating" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "HuntHunter" (
    "huntId" INTEGER NOT NULL,
    "hunterId" INTEGER NOT NULL,
    "acceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" REAL,

    PRIMARY KEY ("huntId", "hunterId"),
    CONSTRAINT "HuntHunter_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HuntHunter_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "Hunter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hunter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "uploadedBy" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "hunterId" INTEGER,
    "huntId" INTEGER,
    CONSTRAINT "Photo_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "Hunter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Photo_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Hunt_status_idx" ON "Hunt"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Hunter_userId_key" ON "Hunter"("userId");
