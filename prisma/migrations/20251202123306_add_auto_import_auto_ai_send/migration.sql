-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "autoAiSend" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoImport" BOOLEAN NOT NULL DEFAULT false;
