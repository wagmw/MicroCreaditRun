# Backend (Developer Manual)

This backend is a minimal Node + Express + Prisma project for MicroCreditRun.

Prereqs:

- Node.js 18+
- npm
- A PostgreSQL database (Neon is recommended). Copy `.env.example` to `.env` and set `DATABASE_URL`.

Quick start:

1. cd backend
2. npm install
3. npm run prisma:generate
4. npm run migrate:dev # creates DB schema
5. npm run dev

Key files:

- `prisma/schema.prisma` - database schema models (Customer, Loan, Payment, LoanGuarantor, LoanExtension, BankAccount, User)
- `src/utils/interest.js` - interest & schedule generation logic. Interest is specified as `interest30` (percentage for 30 days).
- `src/routes` - REST endpoints for customers, loans, payments, bank accounts, dashboard, and auth.

Interest / installments rules implemented:

- interest30: percent for 30 days (e.g., 2 means 2% per 30 days)
- For a given duration in days, total interest = (interest30/100) _ principal _ (durationDays / 30)
- Daily/Weekly: we compute total interest for full duration then split interest+principal equally across installments
- Monthly: if duration months known, amortize across months; if unknown, support interest-only monthly payments
- Overdue penalty: if borrower is >10 days late after loan period, a 12% per annum penalty is charged on overdue amount and prorated daily (implemented in utils)

Developer notes & next steps:

- Improve input validation and error handling
- Add more API endpoints for loan extensions and settlements
- Consider adding document management for loan collateral
