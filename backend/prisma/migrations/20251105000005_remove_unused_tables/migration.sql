-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT IF EXISTS "Collection_collectorId_fkey";
ALTER TABLE "Collection" DROP CONSTRAINT IF EXISTS "Collection_customerId_fkey";
ALTER TABLE "Collection" DROP CONSTRAINT IF EXISTS "Collection_depositId_fkey";
ALTER TABLE "Collection" DROP CONSTRAINT IF EXISTS "Collection_loanId_fkey";

-- DropForeignKey
ALTER TABLE "CollectorDeposit" DROP CONSTRAINT IF EXISTS "CollectorDeposit_collectorId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_customerId_fkey";
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_loanId_fkey";

-- DropTable
DROP TABLE IF EXISTS "Collection";
DROP TABLE IF EXISTS "Collector";
DROP TABLE IF EXISTS "CollectorDeposit";
DROP TABLE IF EXISTS "Document";

-- DropEnum
DROP TYPE IF EXISTS "DocumentType";
