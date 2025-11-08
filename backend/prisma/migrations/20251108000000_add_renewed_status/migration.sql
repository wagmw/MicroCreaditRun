-- Add RENEWED to the LoanStatus enum
ALTER TYPE "LoanStatus" ADD VALUE IF NOT EXISTS 'RENEWED';
