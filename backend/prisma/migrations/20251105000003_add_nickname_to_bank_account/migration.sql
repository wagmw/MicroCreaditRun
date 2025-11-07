-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN "nickname" TEXT NOT NULL DEFAULT '';

-- Update existing records with a default nickname
UPDATE "BankAccount" SET "nickname" = "bank" || ' - ' || "branch" WHERE "nickname" = '';
