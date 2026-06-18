-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "side" TEXT NOT NULL DEFAULT 'buy',
    "quantity" DOUBLE PRECISION NOT NULL,
    "entryPriceUsd" DOUBLE PRECISION NOT NULL,
    "exitPriceUsd" DOUBLE PRECISION,
    "feesUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realizedPnlUsd" DOUBLE PRECISION,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalEntry_ownerId_openedAt_idx" ON "JournalEntry"("ownerId", "openedAt");

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
