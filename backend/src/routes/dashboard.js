const express = require("express");
const prisma = require("../db");
const { logger } = require("../utils/logger");
const { asyncHandler } = require("../middleware/logging");
const router = express.Router();

// Get dashboard summary statistics
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    logger.info("Fetching dashboard statistics");

    try {
      // Test database connection first
      await prisma.$queryRaw`SELECT 1`;
      logger.info("Database connection verified");
    } catch (dbError) {
      logger.error("Database connection failed:", {
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack,
      });
      throw new Error(`Database connection failed: ${dbError.message}`);
    }

    // Optimize: Run all independent queries in parallel
    const [
      activeLoansCount,
      customersCount,
      completedLoansCount,
      activeLoans,
      pendingPayments,
      activeLoansData,
      allPayments,
      allLoans,
      totalExpenses,
    ] = await Promise.all([
      // Active loans count
      prisma.loan.count({
        where: { status: "ACTIVE" },
      }),
      // Total customers count
      prisma.customer.count({
        where: { active: true },
      }),
      // Completed loans count
      prisma.loan.count({
        where: { status: "COMPLETED" },
      }),
      // Active loans for overdue calculation
      prisma.loan.findMany({
        where: { status: "ACTIVE" },
        select: {
          startDate: true,
          durationMonths: true,
          durationDays: true,
          frequency: true,
        },
      }),
      // Total payments pending for bank deposit
      prisma.payment.aggregate({
        where: { banked: false },
        _sum: { amount: true },
      }),
      // Active loans data for outstanding calculation
      prisma.loan.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          amount: true,
          interest30: true,
          durationDays: true,
          durationMonths: true,
        },
      }),
      // Total collected from all payments
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      // Total principal from all loans
      prisma.loan.aggregate({
        _sum: { amount: true },
      }),
      // Total expenses (claimed - already deducted from business)
      prisma.expense.aggregate({
        where: { claimed: true },
        _sum: { amount: true },
      }),
    ]);

    // Calculate overdue based on expected completion date
    const now = new Date();
    const overduePaymentsCount = activeLoans.filter((loan) => {
      const startDate = new Date(loan.startDate);
      let expectedEndDate;

      if (loan.durationDays) {
        expectedEndDate = new Date(startDate);
        expectedEndDate.setDate(startDate.getDate() + loan.durationDays);
      } else if (loan.durationMonths) {
        expectedEndDate = new Date(startDate);
        expectedEndDate.setMonth(startDate.getMonth() + loan.durationMonths);
      } else {
        // Open-ended loans, consider overdue if more than 1 month old
        expectedEndDate = new Date(startDate);
        expectedEndDate.setMonth(startDate.getMonth() + 1);
      }

      return now > expectedEndDate;
    }).length;

    const totalPendingDeposit = pendingPayments._sum.amount || 0;

    // Calculate total amount including interest for all active loans
    const totalOutstanding = activeLoansData.reduce((sum, loan) => {
      const principal = loan.amount;
      let totalInterest = 0;

      // Calculate total interest based on duration
      if (loan.durationDays) {
        const periods = loan.durationDays / 30.0;
        totalInterest = (loan.interest30 / 100.0) * principal * periods;
      } else if (loan.durationMonths) {
        const periods = loan.durationMonths;
        totalInterest = (loan.interest30 / 100.0) * principal * periods;
      } else {
        // Open-ended loan, estimate 1 month
        totalInterest = (loan.interest30 / 100.0) * principal;
      }

      const totalLoanAmount = principal + totalInterest;
      return sum + totalLoanAmount;
    }, 0);

    // Calculate total already paid - use aggregate for better performance
    let totalAlreadyPaid = 0;
    if (activeLoansData.length > 0) {
      const activeLoanIds = activeLoansData.map((loan) => loan.id);
      const totalPaid = await prisma.payment.aggregate({
        where: {
          loanId: { in: activeLoanIds },
        },
        _sum: { amount: true },
      });
      totalAlreadyPaid = totalPaid._sum.amount || 0;
    }

    const totalToBeCollected = Math.max(0, totalOutstanding - totalAlreadyPaid);
    const totalCollected = allPayments._sum.amount || 0;
    const totalPrincipal = allLoans._sum.amount || 0;
    const totalExpensesAmount = totalExpenses._sum.amount || 0;

    // Net collected = total collected - expenses
    const netCollected = totalCollected - totalExpensesAmount;

    logger.info("Dashboard statistics calculated", {
      activeLoans: activeLoansCount,
      customers: customersCount,
      totalOutstanding,
      totalToBeCollected,
      totalCollected,
      totalExpenses: totalExpensesAmount,
      netCollected,
    });

    res.json({
      activeLoans: activeLoansCount,
      customers: customersCount,
      completedLoans: completedLoansCount,
      overduePayments: overduePaymentsCount,
      pendingDeposit: totalPendingDeposit,
      totalToBeCollected: totalToBeCollected,
      totalCollected: totalCollected,
      totalPrincipal: totalPrincipal,
      totalExpenses: totalExpensesAmount,
      netCollected: netCollected,
    });
  })
);

module.exports = router;
