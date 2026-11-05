CREATE TABLE "MerchantSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MerchantSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MerchantSession_userId_revokedAt_idx" ON "MerchantSession"("userId", "revokedAt");
CREATE INDEX "MerchantSession_merchantId_revokedAt_idx" ON "MerchantSession"("merchantId", "revokedAt");
CREATE INDEX "MerchantSession_expiresAt_idx" ON "MerchantSession"("expiresAt");

ALTER TABLE "MerchantSession" ADD CONSTRAINT "MerchantSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MerchantSession" ADD CONSTRAINT "MerchantSession_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
