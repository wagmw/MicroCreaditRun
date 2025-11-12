const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { sendPaymentSMS } = require("../utils/sms");
const { SMS_MESSAGES } = require("../config/smsMessages");
const { v4: uuidv4 } = require("uuid");
const { logger } = require("../utils/logger");
const { asyncHandler } = require("../middleware/logging");

// Get all payments with customer and loan details
router.get(
  "/all",
  asyncHandler(async (req, res) => {
    const payments = await prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: {
        Customer: {
          select: {
            id: true,
            fullName: true,
            mobilePhone: true,
          },
        },
        Loan: {
          select: {
            id: true,
            amount: true,
            frequency: true,
            status: true,
          },
        },
        BankAccount: {
          select: {
            id: true,
            nickname: true,
            accountName: true,
            bank: true,
          },
        },
      },
    });
    res.json(payments);
  })
);

// Get all unbanked payments
router.get(
  "/unbanked",
  asyncHandler(async (req, res) => {
    const payments = await prisma.payment.findMany({
      where: { banked: false },
      orderBy: { paidAt: "desc" },
      include: {
        Customer: {
          select: {
            id: true,
            fullName: true,
            mobilePhone: true,
          },
        },
        Loan: {
          select: {
            id: true,
            loanId: true,
            amount: true,
            frequency: true,
            status: true,
          },
        },
      },
    });
    res.json(payments);
  })
);

// Deposit multiple payments to bank account
router.post(
  "/deposit",
  asyncHandler(async (req, res) => {
    const { paymentIds, expenseIds, bankAccountId, smsNumber } = req.body;

    logger.info("Deposit request received", {
      paymentCount: paymentIds?.length,
      expenseCount: expenseIds?.length,
      bankAccountId,
    });

    // Validation
    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      logger.warn("Invalid deposit request - missing paymentIds");
      return res.status(400).json({ error: "paymentIds array is required" });
    }

    if (!bankAccountId) {
      logger.warn("Invalid deposit request - missing bankAccountId");
      return res.status(400).json({ error: "bankAccountId is required" });
    }

    // Verify bank account exists
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!bankAccount) {
      logger.warn("Bank account not found", { bankAccountId });
      return res.status(404).json({ error: "Bank account not found" });
    }

    logger.info("Bank account verified", {
      bankAccountId,
      nickname: bankAccount.nickname,
    });

    // Check which payments exist and are unbanked
    const paymentsToDeposit = await prisma.payment.findMany({
      where: {
        id: { in: paymentIds },
        banked: false, // Only unbanked payments
      },
    });

    if (paymentsToDeposit.length === 0) {
      logger.warn("No valid unbanked payments found", { paymentIds });
      return res.status(400).json({
        error: "No valid unbanked payments found to deposit",
      });
    }

    logger.info("Found unbanked payments to deposit", {
      count: paymentsToDeposit.length,
    });

    // Handle expenses if provided
    let expensesToClaim = [];
    let totalExpenseAmount = 0;
    if (expenseIds && Array.isArray(expenseIds) && expenseIds.length > 0) {
      expensesToClaim = await prisma.expense.findMany({
        where: {
          id: { in: expenseIds },
          claimed: false, // Only unclaimed expenses
        },
      });

      totalExpenseAmount = expensesToClaim.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      logger.info("Found unclaimed expenses to include", {
        count: expensesToClaim.length,
        totalAmount: totalExpenseAmount,
      });
    }

    // Update payments and expenses in a transaction
    await prisma.$transaction(async (tx) => {
      // Update payments
      await tx.payment.updateMany({
        where: {
          id: { in: paymentsToDeposit.map((p) => p.id) },
        },
        data: {
          banked: true,
          bankAccountId: bankAccountId,
        },
      });

      // Mark expenses as claimed
      if (expensesToClaim.length > 0) {
        await tx.expense.updateMany({
          where: {
            id: { in: expensesToClaim.map((e) => e.id) },
          },
          data: {
            claimed: true,
          },
        });
      }
    });

    // Fetch updated payments with relations
    const updatedPayments = await prisma.payment.findMany({
      where: {
        id: { in: paymentsToDeposit.map((p) => p.id) },
      },
      include: {
        Customer: {
          select: {
            id: true,
            fullName: true,
            mobilePhone: true,
          },
        },
        Loan: {
          select: {
            id: true,
            amount: true,
            frequency: true,
          },
        },
        BankAccount: {
          select: {
            id: true,
            nickname: true,
            accountName: true,
            bank: true,
          },
        },
      },
    });

    const totalPaymentAmount = updatedPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );
    const netAmount = totalPaymentAmount - totalExpenseAmount;

    logger.info("Deposit successful", {
      paymentsDeposited: updatedPayments.length,
      expensesClaimed: expensesToClaim.length,
      totalPaymentAmount,
      totalExpenseAmount,
      netAmount,
      bankAccountId,
    });

    // Send SMS notification if SMS number provided and SMS util is available
    try {
      const { sendSMS } = require("../utils/sms");

      if (smsNumber && sendSMS) {
        const depositDate = new Date();
        const formattedDate = depositDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const formattedTime = depositDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        let smsMessage = SMS_MESSAGES.bankDeposit(
          formattedDate,
          formattedTime,
          totalPaymentAmount,
          totalExpenseAmount,
          netAmount,
          bankAccount.nickname
        );

        logger.info("Sending bank deposit SMS", {
          recipient: smsNumber,
          totalPaymentAmount,
          totalExpenseAmount,
          netAmount,
          bank: bankAccount.nickname,
        });

        await sendSMS(smsNumber, smsMessage);

        logger.info("Bank deposit SMS sent successfully");
      } else {
        logger.info(
          "Bank deposit SMS not configured - skipping SMS notification"
        );
      }
    } catch (smsError) {
      logger.error("Failed to send bank deposit SMS", {
        error: smsError.message,
        stack: smsError.stack,
      });
      // Don't fail the deposit if SMS fails
    }

    res.json({
      success: true,
      deposited: updatedPayments.length,
      expensesClaimed: expensesToClaim.length,
      totalPaymentAmount,
      totalExpenseAmount,
      netAmount,
      payments: updatedPayments,
      expenses: expensesToClaim,
    });
  })
);

// Record payment
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { loanId, customerId, amount, note } = req.body;

    logger.info("Recording payment", { loanId, customerId, amount });

    // First, verify loan exists and is ACTIVE
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      select: {
        id: true,
        status: true,
        amount: true,
        interest30: true,
        durationMonths: true,
        durationDays: true,
      },
    });

    if (!loan) {
      logger.warn("Payment rejected - loan not found", { loanId });
      return res.status(404).json({ error: "Loan not found" });
    }

    if (loan.status !== "ACTIVE") {
      logger.warn("Payment rejected - loan is not active", {
        loanId,
        status: loan.status,
      });
      return res.status(400).json({
        error: `Payments can only be made to ACTIVE loans. This loan is ${loan.status}.`,
      });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        id: uuidv4(),
        loanId,
        customerId,
        amount: Number(amount),
        note,
      },
      include: {
        Customer: {
          select: {
            id: true,
            fullName: true,
            mobilePhone: true,
          },
        },
        Loan: {
          select: {
            id: true,
            loanId: true,
            amount: true,
            interest30: true,
            durationMonths: true,
            durationDays: true,
          },
        },
      },
    });

    // Calculate total loan amount (principal + interest)
    const principal = loan.amount;
    const interestAmount =
      (principal *
        loan.interest30 *
        (loan.durationMonths || loan.durationDays / 30)) /
      100;
    const totalLoanAmount = principal + interestAmount;

    // Optimize: Use aggregate to calculate total paid instead of fetching all payments
    const totalPaidResult = await prisma.payment.aggregate({
      where: { loanId },
      _sum: { amount: true },
    });
    const totalPaid = totalPaidResult._sum.amount || 0;

    // Calculate outstanding
    const outstanding = Math.max(0, totalLoanAmount - totalPaid);

    // Auto-complete loan if outstanding is 0
    if (outstanding === 0 && loan.status === "ACTIVE") {
      await prisma.loan.update({
        where: { id: loanId },
        data: { status: "COMPLETED", updatedAt: new Date() },
      });

      logger.info("Loan auto-completed - outstanding reached 0", {
        loanId,
        totalPaid,
        totalLoanAmount,
      });

      // Send completion SMS
      if (payment.Customer?.mobilePhone && payment.Loan?.loanId) {
        setImmediate(() => {
          const { sendSMS } = require("../utils/sms");
          const completionMessage = SMS_MESSAGES.loanCompletion(
            payment.Loan.loanId
          );

          sendSMS(payment.Customer.mobilePhone, completionMessage).catch(
            (error) => {
              logger.error("Failed to send loan completion SMS", {
                error: error.message,
                loanId,
                mobilePhone: payment.Customer.mobilePhone,
              });
            }
          );
        });
      }
    }

    logger.info("Payment recorded successfully", {
      paymentId: payment.id,
      loanId,
      amount: payment.amount,
      outstanding,
      loanStatus: outstanding === 0 ? "COMPLETED" : "ACTIVE",
      customerName: payment.Customer?.fullName,
    });

    // Respond immediately without waiting for SMS
    res.json(payment);

    // Send SMS notification asynchronously in background (fire and forget)
    setImmediate(() => {
      if (payment.Customer?.mobilePhone && payment.Loan?.loanId) {
        sendPaymentSMS(
          payment.Customer.mobilePhone,
          payment.Loan.loanId,
          payment.amount,
          outstanding
        ).catch((error) => {
          logger.error("Failed to send payment SMS", {
            error: error.message,
            paymentId: payment.id,
            mobilePhone: payment.Customer.mobilePhone,
          });
        });
      } else {
        logger.warn("SMS not sent - missing phone or loan ID", {
          paymentId: payment.id,
          hasPhone: !!payment.Customer?.mobilePhone,
          hasLoanId: !!payment.Loan?.loanId,
        });
      }
    });
  })
);

// List payments for loan
router.get(
  "/loan/:loanId",
  asyncHandler(async (req, res) => {
    const payments = await prisma.payment.findMany({
      where: { loanId: req.params.loanId },
    });
    res.json(payments);
  })
);

// Predict payments within a date range
router.post(
  "/predict",
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.body;

    logger.info("Predicting payments for date range", { startDate, endDate });

    // Validation
    if (!startDate || !endDate) {
      logger.warn("Invalid prediction request - missing dates");
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      logger.warn("Invalid date format");
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (start > end) {
      logger.warn("Start date is after end date");
      return res
        .status(400)
        .json({ error: "Start date must be before or equal to end date" });
    }

    // Get all active loans
    const activeLoans = await prisma.loan.findMany({
      where: { status: "ACTIVE" },
      include: {
        Customer: {
          select: {
            id: true,
            fullName: true,
            mobilePhone: true,
          },
        },
        Payment: true,
      },
    });

    const predictions = [];
    let totalPredictedAmount = 0;

    // For each loan, calculate expected payments within the date range
    activeLoans.forEach((loan) => {
      const principal = loan.amount;
      const interest30 = loan.interest30;
      const durationMonths =
        loan.durationMonths || Math.ceil(loan.durationDays / 30);
      const frequency = loan.frequency;
      const loanStartDate = new Date(loan.startDate);

      // Calculate total loan amount
      const totalInterest = (principal * interest30 * durationMonths) / 100;
      const totalLoanAmount = principal + totalInterest;

      // Calculate total paid so far
      const totalPaid = loan.Payment.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const outstanding = totalLoanAmount - totalPaid;

      // Skip if loan is already fully paid
      if (outstanding <= 0) return;

      // Calculate installment details
      let numberOfInstallments;
      let daysBetweenPayments;

      if (frequency === "MONTHLY") {
        numberOfInstallments = durationMonths;
        daysBetweenPayments = 30;
      } else if (frequency === "WEEKLY") {
        numberOfInstallments = Math.ceil((durationMonths * 30) / 7);
        daysBetweenPayments = 7;
      } else if (frequency === "DAILY") {
        numberOfInstallments = durationMonths * 30;
        daysBetweenPayments = 1;
      }

      const installmentAmount = totalLoanAmount / numberOfInstallments;

      // Generate payment schedule and find payments within date range
      let remainingBalance = totalLoanAmount - totalPaid;
      let installmentsPaid = Math.floor(totalPaid / installmentAmount);

      for (
        let i = installmentsPaid;
        i < numberOfInstallments && remainingBalance > 0;
        i++
      ) {
        const paymentDate = new Date(loanStartDate);
        paymentDate.setDate(paymentDate.getDate() + i * daysBetweenPayments);

        // Check if this payment falls within the requested date range
        if (paymentDate >= start && paymentDate <= end) {
          const expectedAmount = Math.min(installmentAmount, remainingBalance);

          predictions.push({
            loanId: loan.id,
            loanNumber: loan.loanId,
            customerId: loan.Customer.id,
            customerName: loan.Customer.fullName,
            mobilePhone: loan.Customer.mobilePhone,
            expectedDate: paymentDate,
            expectedAmount: expectedAmount,
            frequency: loan.frequency,
            installmentNumber: i + 1,
            totalInstallments: numberOfInstallments,
          });

          totalPredictedAmount += expectedAmount;
          remainingBalance -= expectedAmount;
        }

        // Stop if we're past the end date
        if (paymentDate > end) break;
      }
    });

    // Sort predictions by date
    predictions.sort((a, b) => a.expectedDate - b.expectedDate);

    logger.info("Payment predictions generated", {
      count: predictions.length,
      totalAmount: totalPredictedAmount,
    });

    res.json({
      startDate: start,
      endDate: end,
      predictions,
      totalPredictedAmount,
      count: predictions.length,
    });
  })
);

module.exports = router;
