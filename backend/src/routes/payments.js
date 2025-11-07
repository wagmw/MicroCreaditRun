const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { sendPaymentSMS } = require("../utils/sms");
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
    const { paymentIds, bankAccountId } = req.body;

    logger.info("Deposit request received", {
      paymentCount: paymentIds?.length,
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

    // Update payments using updateMany for better performance
    await prisma.payment.updateMany({
      where: {
        id: { in: paymentsToDeposit.map((p) => p.id) },
      },
      data: {
        banked: true,
        bankAccountId: bankAccountId,
      },
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

    logger.info("Deposit successful", {
      paymentsDeposited: updatedPayments.length,
      bankAccountId,
      totalAmount: updatedPayments.reduce((sum, p) => sum + p.amount, 0),
    });

    res.json({
      success: true,
      deposited: updatedPayments.length,
      payments: updatedPayments,
    });
  })
);

// Record payment
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { loanId, customerId, amount, note } = req.body;

    logger.info("Recording payment", { loanId, customerId, amount });

    // Optimize: Fetch loan details and create payment in parallel
    const [loan, payment] = await Promise.all([
      // Get only the fields we need for calculation
      prisma.loan.findUnique({
        where: { id: loanId },
        select: {
          id: true,
          amount: true,
          interest30: true,
          durationMonths: true,
          durationDays: true,
        },
      }),
      // Create payment with customer and loan details
      prisma.payment.create({
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
      }),
    ]);

    if (!loan) {
      logger.warn("Loan not found for payment", { loanId });
      return res.status(404).json({ error: "Loan not found" });
    }

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

    logger.info("Payment recorded successfully", {
      paymentId: payment.id,
      loanId,
      amount: payment.amount,
      outstanding,
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

module.exports = router;
