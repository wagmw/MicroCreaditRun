const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { sendPaymentSMS } = require("../utils/sms");
const { v4: uuidv4 } = require("uuid");

// Get all payments with customer and loan details
router.get("/all", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all unbanked payments
router.get("/unbanked", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deposit multiple payments to bank account
router.post("/deposit", async (req, res) => {
  try {
    const { paymentIds, bankAccountId } = req.body;

    console.log("Deposit request received:", { paymentIds, bankAccountId });

    // Validation
    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({ error: "paymentIds array is required" });
    }

    if (!bankAccountId) {
      return res.status(400).json({ error: "bankAccountId is required" });
    }

    // Verify bank account exists
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!bankAccount) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    console.log("Bank account verified:", bankAccount.nickname);

    // Check which payments exist and are unbanked
    const paymentsToDeposit = await prisma.payment.findMany({
      where: {
        id: { in: paymentIds },
        banked: false, // Only unbanked payments
      },
    });

    if (paymentsToDeposit.length === 0) {
      return res.status(400).json({
        error: "No valid unbanked payments found to deposit",
      });
    }

    console.log(
      "Found",
      paymentsToDeposit.length,
      "unbanked payments to deposit"
    );

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

    console.log(
      "Deposit successful:",
      updatedPayments.length,
      "payments updated"
    );

    res.json({
      success: true,
      deposited: updatedPayments.length,
      payments: updatedPayments,
    });
  } catch (err) {
    console.error("Deposit error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Record payment
router.post("/", async (req, res) => {
  try {
    const { loanId, customerId, amount, note } = req.body;

    // Get loan details with all payments to calculate outstanding
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        Payment: true,
      },
    });

    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    // Create payment with customer and loan details
    const payment = await prisma.payment.create({
      data: { id: uuidv4(), loanId, customerId, amount: Number(amount), note },
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

    // Calculate total paid (including this new payment)
    const totalPaid =
      loan.Payment.reduce((sum, p) => sum + p.amount, 0) + payment.amount;

    // Calculate outstanding
    const outstanding = Math.max(0, totalLoanAmount - totalPaid);

    // Send SMS notification to customer (async, don't block response)
    if (payment.Customer?.mobilePhone && payment.Loan?.loanId) {
      sendPaymentSMS(
        payment.Customer.mobilePhone,
        payment.Loan.loanId,
        payment.amount,
        outstanding
      ).catch((error) => {
        console.error("Failed to send payment SMS:", error);
        // Don't fail the payment if SMS fails
      });
    } else {
      console.warn("No phone number or loan ID found, SMS not sent");
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List payments for loan
router.get("/loan/:loanId", async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { loanId: req.params.loanId },
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
