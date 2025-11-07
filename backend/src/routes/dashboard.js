const express = require("express");
const prisma = require("../db");
const router = express.Router();

// Get dashboard summary statistics
router.get("/stats", async (req, res) => {
  try {
    // Active loans count
    const activeLoansCount = await prisma.loan.count({
      where: {
        status: "ACTIVE",
      },
    });

    // Total customers count
    const customersCount = await prisma.customer.count({
      where: {
        active: true,
      },
    });

    // Completed loans count
    const completedLoansCount = await prisma.loan.count({
      where: {
        status: "COMPLETED",
      },
    });

    // Overdue payments count (simplified: loans that have been active for more than expected duration)
    const activeLoans = await prisma.loan.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        startDate: true,
        durationMonths: true,
        durationDays: true,
        frequency: true,
      },
    });

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

    // Total payments pending for bank deposit (unbanked payments)
    const pendingPayments = await prisma.payment.aggregate({
      where: {
        banked: false,
      },
      _sum: {
        amount: true,
      },
    });
    const totalPendingDeposit = pendingPayments._sum.amount || 0;

    // Total outstanding amount to be collected from all active loans
    const activeLoansData = await prisma.loan.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        amount: true,
        interest30: true,
        durationDays: true,
        durationMonths: true,
      },
    });

    // Calculate total amount including interest for all active loans
    const totalOutstanding = activeLoansData.reduce((sum, loan) => {
      const principal = loan.amount;
      let totalInterest = 0;

      // Calculate total interest based on duration
      if (loan.durationDays) {
        const periods = loan.durationDays / 30.0;
        totalInterest = (loan.interest30 / 100.0) * principal * periods;
      } else if (loan.durationMonths) {
        const periods = loan.durationMonths; // Each month counts as one 30-day period
        totalInterest = (loan.interest30 / 100.0) * principal * periods;
      } else {
        // Open-ended loan, estimate 1 month
        totalInterest = (loan.interest30 / 100.0) * principal;
      }

      const totalLoanAmount = principal + totalInterest;
      return sum + totalLoanAmount;
    }, 0);

    // Calculate total already paid - get loan IDs first
    const activeLoanIds = activeLoansData.map((loan) => loan.id);

    let totalAlreadyPaid = 0;
    if (activeLoanIds.length > 0) {
      const totalPaid = await prisma.payment.aggregate({
        where: {
          loanId: {
            in: activeLoanIds,
          },
        },
        _sum: {
          amount: true,
        },
      });
      totalAlreadyPaid = totalPaid._sum.amount || 0;
    }
    const totalToBeCollected = Math.max(0, totalOutstanding - totalAlreadyPaid);

    // Debug logging
    console.log("Active Loans Data:", activeLoansData.length, "loans");
    console.log("Total Outstanding:", totalOutstanding);
    console.log("Total Already Paid:", totalAlreadyPaid);
    console.log("Total To Be Collected:", totalToBeCollected);

    res.json({
      activeLoans: activeLoansCount,
      customers: customersCount,
      completedLoans: completedLoansCount,
      overduePayments: overduePaymentsCount,
      pendingDeposit: totalPendingDeposit,
      totalToBeCollected: totalToBeCollected,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

module.exports = router;
