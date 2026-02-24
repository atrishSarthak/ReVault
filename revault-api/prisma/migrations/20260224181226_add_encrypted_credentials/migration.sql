-- CreateTable
CREATE TABLE "EncryptedCredential" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,

    CONSTRAINT "EncryptedCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EncryptedCredential_assetId_key" ON "EncryptedCredential"("assetId");

-- AddForeignKey
ALTER TABLE "EncryptedCredential" ADD CONSTRAINT "EncryptedCredential_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
