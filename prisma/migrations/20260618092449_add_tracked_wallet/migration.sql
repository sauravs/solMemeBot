-- CreateTable
CREATE TABLE "TrackedWallet" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackedWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackedWallet_ownerId_idx" ON "TrackedWallet"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackedWallet_ownerId_address_key" ON "TrackedWallet"("ownerId", "address");

-- AddForeignKey
ALTER TABLE "TrackedWallet" ADD CONSTRAINT "TrackedWallet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
