-- Update all APPROVED loans to ACTIVE
UPDATE "Loan" SET "status" = 'ACTIVE' WHERE "status" = 'APPROVED';

-- Update all APPLIED loans to ACTIVE
UPDATE "Loan" SET "status" = 'ACTIVE' WHERE "status" = 'APPLIED';
