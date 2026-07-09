-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "service" TEXT NOT NULL DEFAULT 'cut',
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessHours" TEXT NOT NULL DEFAULT '09:00-19:00',
    "closedDays" TEXT NOT NULL DEFAULT '1,2',
    "slotDuration" INTEGER NOT NULL DEFAULT 60,
    "updatedAt" DATETIME NOT NULL
);
