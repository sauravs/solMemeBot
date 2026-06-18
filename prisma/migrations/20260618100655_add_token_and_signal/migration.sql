-- CreateTable
CREATE TABLE "Token" (
    "mint" TEXT NOT NULL,
    "symbol" TEXT,
    "name" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("mint")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "txSig" TEXT NOT NULL,
    "side" TEXT NOT NULL DEFAULT 'buy',
    "signalPriceUsd" DECIMAL(38,18),
    "observedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Signal_walletId_observedAt_idx" ON "Signal"("walletId", "observedAt");

-- CreateIndex
CREATE INDEX "Signal_tokenMint_idx" ON "Signal"("tokenMint");

-- CreateIndex
CREATE UNIQUE INDEX "Signal_walletId_txSig_tokenMint_key" ON "Signal"("walletId", "txSig", "tokenMint");

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "TrackedWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_tokenMint_fkey" FOREIGN KEY ("tokenMint") REFERENCES "Token"("mint") ON DELETE RESTRICT ON UPDATE CASCADE;
