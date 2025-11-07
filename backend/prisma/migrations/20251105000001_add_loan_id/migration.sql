-- AlterTable
ALTER TABLE "Loan" ADD COLUMN "loanId" TEXT;

-- Generate LoanId for existing loans (format: LOAN-YYYYMMDD-XXXX)
DO $$
DECLARE
  loan_record RECORD;
  counter INT := 1;
BEGIN
  FOR loan_record IN SELECT id, "createdAt" FROM "Loan" ORDER BY "createdAt" LOOP
    UPDATE "Loan" 
    SET "loanId" = 'LOAN-' || TO_CHAR(loan_record."createdAt", 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0')
    WHERE id = loan_record.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Make loanId required and unique
ALTER TABLE "Loan" ALTER COLUMN "loanId" SET NOT NULL;
CREATE UNIQUE INDEX "Loan_loanId_key" ON "Loan"("loanId");
