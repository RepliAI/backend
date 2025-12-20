-- CreateTable
CREATE TABLE "AiResponseUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiResponseUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiResponseUsage_userId_createdAt_idx" ON "AiResponseUsage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiResponseUsage" ADD CONSTRAINT "AiResponseUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
