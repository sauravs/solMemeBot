/*
  Warnings:

  - You are about to alter the column `signalPriceUsd` on the `Signal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(38,18)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Signal" ALTER COLUMN "signalPriceUsd" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "horizon" TEXT NOT NULL,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceSnapshot_signalId_idx" ON "PriceSnapshot"("signalId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceSnapshot_signalId_horizon_key" ON "PriceSnapshot"("signalId", "horizon");

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
