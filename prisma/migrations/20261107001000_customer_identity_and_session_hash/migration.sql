-- Existing session tokens were stored in plaintext. Invalidate prototype sessions
-- before renaming the field to make clear that new values contain only hashes.
DELETE FROM "CustomerSession";

DROP INDEX IF EXISTS "CustomerSession_sessionToken_key";
ALTER TABLE "CustomerSession" RENAME COLUMN "sessionToken" TO "sessionTokenHash";
CREATE UNIQUE INDEX "CustomerSession_sessionTokenHash_key" ON "CustomerSession"("sessionTokenHash");

ALTER TABLE "Customer" ADD COLUMN "paypalPayerId" TEXT;
CREATE UNIQUE INDEX "Customer_paypalPayerId_key" ON "Customer"("paypalPayerId");
