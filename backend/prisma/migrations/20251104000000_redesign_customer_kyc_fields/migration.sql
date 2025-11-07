-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED', 'OTHER');

-- CreateEnum
CREATE TYPE "Ethnicity" AS ENUM ('SINHALA', 'SRI_LANKAN_TAMIL', 'INDIAN_TAMIL', 'SRI_LANKAN_MOOR', 'BURGHER', 'MALAY', 'MUSLIM', 'OTHER');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('BUDDHISM', 'HINDUISM', 'ISLAM', 'CHRISTIANITY', 'ROMAN_CATHOLIC', 'OTHER');

-- Drop existing customers (since we need to rebuild the table structure)
DELETE FROM "Customer";

-- AlterTable: Add new columns with temporary nullable constraints
ALTER TABLE "Customer" ADD COLUMN "fullName" TEXT;
ALTER TABLE "Customer" ADD COLUMN "otherNames" TEXT;
ALTER TABLE "Customer" ADD COLUMN "permanentAddress" TEXT;
ALTER TABLE "Customer" ADD COLUMN "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN "nationalIdNo" TEXT;
ALTER TABLE "Customer" ADD COLUMN "gender" "Gender";
ALTER TABLE "Customer" ADD COLUMN "maritalStatus" "MaritalStatus";
ALTER TABLE "Customer" ADD COLUMN "ethnicity" "Ethnicity";
ALTER TABLE "Customer" ADD COLUMN "religion" "Religion";
ALTER TABLE "Customer" ADD COLUMN "occupation" TEXT;
ALTER TABLE "Customer" ADD COLUMN "homePhone" TEXT;
ALTER TABLE "Customer" ADD COLUMN "mobilePhone" TEXT;

-- Make columns NOT NULL
ALTER TABLE "Customer" ALTER COLUMN "fullName" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "permanentAddress" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "dateOfBirth" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "nationalIdNo" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "gender" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "maritalStatus" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "ethnicity" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "religion" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "occupation" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "mobilePhone" SET NOT NULL;

-- Add unique constraints
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_nationalIdNo_key" UNIQUE ("nationalIdNo");
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_mobilePhone_key" UNIQUE ("mobilePhone");

-- Drop old columns (if they exist)
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "firstName";
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "lastName";
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "phone";
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "email";
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "address";

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Customer' AND column_name='active') THEN
        ALTER TABLE "Customer" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Customer' AND column_name='photoUrl') THEN
        ALTER TABLE "Customer" ADD COLUMN "photoUrl" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Customer' AND column_name='createdAt') THEN
        ALTER TABLE "Customer" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Customer' AND column_name='updatedAt') THEN
        ALTER TABLE "Customer" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;
