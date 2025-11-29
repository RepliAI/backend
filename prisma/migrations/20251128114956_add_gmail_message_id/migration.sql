/*
  Warnings:

  - A unique constraint covering the columns `[gmailId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "gmailId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Message_gmailId_key" ON "Message"("gmailId");
