-- CreateTable
CREATE TABLE "SafetyReport" (
    "id" TEXT NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "flags" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SafetyReport_tokenMint_key" ON "SafetyReport"("tokenMint");

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_tokenMint_fkey" FOREIGN KEY ("tokenMint") REFERENCES "Token"("mint") ON DELETE CASCADE ON UPDATE CASCADE;
