const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { v4: uuidv4 } = require("uuid");
const { logger } = require("../utils/logger");
const { asyncHandler } = require("../middleware/logging");
const {
  generateSchedule,
  calculateTotalInterest,
} = require("../utils/interest");
const { sendSMS } = require("../utils/sms");
const { SMS_MESSAGES } = require("../config/smsMessages");

// Get all loans with applicant details
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // Support filtering by status via query parameter
    // Example: /loans?status=ACTIVE,APPROVED
    const { status } = req.query;

    let whereClause = {};
    if (status) {
      // Split comma-separated statuses
      const statusArray = status.split(",").map((s) => s.trim());
      whereClause.status = {
        in: statusArray,
      };
    }

    const loans = await prisma.loan.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        Customer: {
          select: {
            id: true,
            fullName: true,
            mobilePhone: true,
            homePhone: true,
          },
        },
        Payment: true,
      },
    });

    // Map to expected frontend format
    const formattedLoans = loans.map((loan) => ({
      ...loan,
      applicant: loan.Customer,
      payments: loan.Payment,
    }));

    res.json(formattedLoans);
  })
);

// Apply loan
router.post(
  "/apply",
  asyncHandler(async (req, res) => {
    const {
      applicantId,
      amount,
      interest30,
      startDate,
      durationMonths,
      durationDays,
      frequency,
      guarantorIds,
      documents,
    } = req.body;

    logger.info("Loan application received", {
      applicantId,
      amount,
      frequency,
    });

    // Check if customer has any active loans
    const activeLoans = await prisma.loan.findMany({
      where: {
        applicantId,
        status: "ACTIVE",
      },
    });

    if (activeLoans.length > 0) {
      logger.warn("Loan application rejected - customer has active loans", {
        applicantId,
        activeLoanCount: activeLoans.length,
      });
      return res.status(400).json({
        error:
          "Customer already has an active loan. Please complete all existing loans before applying for a new one.",
      });
    }

    // Generate LoanId (format: L0001, L0002, etc.) - find the highest existing loan number
    const existingLoans = await prisma.loan.findMany({
      orderBy: { loanId: "desc" },
      take: 1,
    });

    let sequence = 1;
    if (existingLoans.length > 0) {
      // Extract number from loanId (e.g., "L0030" -> 30)
      const lastLoanNumber = parseInt(existingLoans[0].loanId.substring(1));
      sequence = lastLoanNumber + 1;
    }

    const loanId = `L${String(sequence).padStart(4, "0")}`;

    const loan = await prisma.loan.create({
      data: {
        id: uuidv4(),
        loanId,
        applicantId,
        amount: Number(amount),
        interest30: Number(interest30),
        startDate: new Date(startDate),
        durationMonths: durationMonths ? Number(durationMonths) : null,
        durationDays: durationDays ? Number(durationDays) : null,
        frequency,
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });

    logger.info("Loan created", {
      loanId: loan.id,
      loanNumber: loanId,
      applicantId,
      amount,
    });

    // create guarantor links
    if (Array.isArray(guarantorIds)) {
      for (const gid of guarantorIds) {
        await prisma.loanGuarantor.create({
          data: { id: uuidv4(), loanId: loan.id, customerId: gid },
        });
      }
      logger.info("Guarantors added to loan", {
        loanId: loan.id,
        guarantorCount: guarantorIds.length,
      });
    }

    // Note: Document model has been removed from schema
    // If documents are needed in the future, add Document model to schema

    // Send SMS notification for new loan
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: applicantId },
        select: { mobilePhone: true, fullName: true },
      });

      if (customer?.mobilePhone) {
        const smsMessage = SMS_MESSAGES.newLoanApproval(
          loanId,
          amount,
          interest30,
          durationMonths,
          durationDays,
          frequency
        );

        await sendSMS(customer.mobilePhone, smsMessage);
        logger.info("New loan SMS sent", {
          loanId: loanId,
          recipient: customer.mobilePhone,
        });
      }
    } catch (smsError) {
      logger.error("Failed to send new loan SMS", {
        loanId: loanId,
        error: smsError.message,
      });
      // Don't fail the loan creation if SMS fails
    }

    // optionally return a suggested schedule
    let schedule = null;
    if (
      frequency === "DAILY" ||
      frequency === "WEEKLY" ||
      frequency === "MONTHLY"
    ) {
      const durDays =
        durationDays ||
        (durationMonths
          ? durationMonths * 30
          : frequency === "MONTHLY"
          ? 30
          : 0);
      schedule = generateSchedule({
        principal: Number(amount),
        interest30: Number(interest30),
        startDate: loan.startDate,
        durationDays: durDays,
        frequency,
        durationMonths,
      });
    }

    res.json({ loan, schedule });
  })
);

// Get loan by id, include payments/guarantors
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id },
      include: {
        Customer: {
          select: {
            id: true,
            fullName: true,
            mobilePhone: true,
            nationalIdNo: true,
          },
        },
        Payment: {
          orderBy: { paidAt: "desc" },
        },
        LoanGuarantor: {
          include: {
            Customer: {
              select: {
                id: true,
                fullName: true,
                mobilePhone: true,
                nationalIdNo: true,
              },
            },
          },
        },
        LoanExtension: true,
      },
    });

    if (!loan) {
      logger.warn("Loan not found", { loanId: req.params.id });
      return res.status(404).json({ error: "Loan not found" });
    }

    // Format response with lowercase property names for frontend compatibility
    const formattedLoan = {
      ...loan,
      applicant: loan.Customer,
      payments: loan.Payment,
      guarantors: loan.LoanGuarantor,
      extensions: loan.LoanExtension,
    };

    // Flatten guarantor data for easier access
    if (formattedLoan.guarantors && formattedLoan.guarantors.length > 0) {
      formattedLoan.guarantor = formattedLoan.guarantors[0].Customer;
      formattedLoan.guarantorId = formattedLoan.guarantor.id;
    }

    // Clean up capitalized properties
    delete formattedLoan.Customer;
    delete formattedLoan.Payment;
    delete formattedLoan.LoanGuarantor;
    delete formattedLoan.LoanExtension;

    res.json(formattedLoan);
  })
);

// Get all loans for a specific customer
router.get(
  "/customer/:customerId",
  asyncHandler(async (req, res) => {
    const loans = await prisma.loan.findMany({
      where: { applicantId: req.params.customerId },
      orderBy: { createdAt: "desc" },
      include: {
        Payment: true,
        LoanGuarantor: { include: { Customer: true } },
      },
    });

    // Format response with lowercase property names for frontend compatibility
    const formattedLoans = loans.map((loan) => ({
      ...loan,
      payments: loan.Payment,
      guarantors: loan.LoanGuarantor,
      // Clean up by not including capitalized versions
    }));

    // Remove capitalized properties from response
    formattedLoans.forEach((loan) => {
      delete loan.Payment;
      delete loan.LoanGuarantor;
    });

    res.json(formattedLoans);
  })
);

// Update loan status
router.put(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status, settlementAmount } = req.body;
    const loanId = req.params.id;

    // Validate status
    const validStatuses = [
      "ACTIVE",
      "COMPLETED",
      "DEFAULTED",
      "SETTLED",
      "RENEWED",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid loan status" });
    }

    // If settling a loan, create payment and update status in a transaction
    if (status === "SETTLED") {
      if (!settlementAmount || settlementAmount <= 0) {
        return res.status(400).json({
          error: "Settlement amount is required and must be greater than 0",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Get loan details
        const loan = await tx.loan.findUnique({
          where: { id: loanId },
          include: {
            Customer: {
              select: {
                id: true,
                mobilePhone: true,
                fullName: true,
              },
            },
          },
        });

        if (!loan) {
          throw new Error("Loan not found");
        }

        // Create settlement payment
        const settlementPayment = await tx.payment.create({
          data: {
            id: uuidv4(),
            loanId: loanId,
            customerId: loan.applicantId,
            amount: Number(settlementAmount),
            note: "Full settlement payment",
          },
        });

        // Update loan status to SETTLED
        const updatedLoan = await tx.loan.update({
          where: { id: loanId },
          data: { status: "SETTLED", updatedAt: new Date() },
          include: {
            Customer: {
              select: {
                mobilePhone: true,
                fullName: true,
              },
            },
          },
        });

        return { updatedLoan, settlementPayment };
      });

      logger.info("Loan settled with payment", {
        loanId,
        settlementAmount,
        paymentId: result.settlementPayment.id,
      });

      // Send SMS notification
      try {
        if (result.updatedLoan.Customer?.mobilePhone) {
          const smsMessage = SMS_MESSAGES.loanSettlement(
            result.updatedLoan.loanId
          );

          await sendSMS(result.updatedLoan.Customer.mobilePhone, smsMessage);
          logger.info("Loan settlement SMS sent", {
            loanId: result.updatedLoan.loanId,
            recipient: result.updatedLoan.Customer.mobilePhone,
          });
        }
      } catch (smsError) {
        logger.error("Failed to send loan settlement SMS", {
          loanId: result.updatedLoan.loanId,
          error: smsError.message,
        });
      }

      return res.json(result.updatedLoan);
    }

    // For other status updates, just update the status
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: { status },
      include: {
        Customer: {
          select: {
            mobilePhone: true,
            fullName: true,
          },
        },
      },
    });

    logger.info("Loan status updated", {
      loanId,
      newStatus: status,
    });

    // Send SMS notification if loan is completed
    if (status === "COMPLETED") {
      try {
        if (updatedLoan.Customer?.mobilePhone) {
          const smsMessage = SMS_MESSAGES.loanCompletion(updatedLoan.loanId);

          await sendSMS(updatedLoan.Customer.mobilePhone, smsMessage);
          logger.info("Loan completion SMS sent", {
            loanId: updatedLoan.loanId,
            recipient: updatedLoan.Customer.mobilePhone,
          });
        }
      } catch (smsError) {
        logger.error("Failed to send loan completion SMS", {
          loanId: updatedLoan.loanId,
          error: smsError.message,
        });
      }
    }

    res.json(updatedLoan);
  })
);

// Renew loan - settle old loan and create new one in a transaction
router.post(
  "/:id/renew",
  asyncHandler(async (req, res) => {
    const oldLoanId = req.params.id;
    const {
      amount,
      interest30,
      startDate,
      durationMonths,
      durationDays,
      frequency,
      guarantorIds,
      outstandingAmount,
    } = req.body;

    // Validate inputs
    if (!amount || !outstandingAmount) {
      return res.status(400).json({
        error: "Loan amount and outstanding amount are required",
      });
    }

    logger.info("Starting loan renewal", {
      oldLoanId,
      newLoanAmount: amount,
      outstandingAmount,
    });

    // Use Prisma transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the old loan details
      const oldLoan = await tx.loan.findUnique({
        where: { id: oldLoanId },
        include: {
          Customer: true,
          LoanGuarantor: true,
        },
      });

      if (!oldLoan) {
        throw new Error("Loan not found");
      }

      if (oldLoan.status !== "ACTIVE") {
        throw new Error("Only active loans can be renewed");
      }

      // 2. Update old loan status to RENEWED (no payment created - balance carried forward)
      const renewedLoan = await tx.loan.update({
        where: { id: oldLoanId },
        data: { status: "RENEWED", updatedAt: new Date() },
      });

      // 3. Generate new loan ID - find the highest existing loan number
      const existingLoans = await tx.loan.findMany({
        orderBy: { loanId: "desc" },
        take: 1,
      });

      let sequence = 1;
      if (existingLoans.length > 0) {
        // Extract number from loanId (e.g., "L0030" -> 30)
        const lastLoanNumber = parseInt(existingLoans[0].loanId.substring(1));
        sequence = lastLoanNumber + 1;
      }

      const loanId = `L${String(sequence).padStart(4, "0")}`;

      // 4. Create new loan with user-specified details (balance carried forward, no payment)
      const newLoan = await tx.loan.create({
        data: {
          id: uuidv4(),
          loanId,
          applicantId: oldLoan.applicantId,
          amount: Number(amount),
          interest30: Number(interest30),
          startDate: startDate ? new Date(startDate) : new Date(),
          durationMonths: durationMonths ? Number(durationMonths) : null,
          durationDays: durationDays ? Number(durationDays) : null,
          frequency: frequency,
          status: "ACTIVE",
          updatedAt: new Date(),
        },
      });

      // 5. Add guarantors for new loan
      if (guarantorIds && guarantorIds.length > 0) {
        for (const guarantorId of guarantorIds) {
          await tx.loanGuarantor.create({
            data: {
              id: uuidv4(),
              loanId: newLoan.id,
              customerId: guarantorId,
            },
          });
        }
      }

      return {
        oldLoan: renewedLoan,
        newLoan,
      };
    });

    logger.info("Loan renewal completed successfully", {
      oldLoanId,
      newLoanId: result.newLoan.id,
      outstandingAmount: outstandingAmount,
      newLoanAmount: amount,
    });

    // Send SMS notifications for loan renewal (do this before sending response)
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: result.newLoan.applicantId },
        select: { mobilePhone: true, fullName: true },
      });

      if (customer?.mobilePhone) {
        const oldLoan = await prisma.loan.findUnique({
          where: { id: oldLoanId },
          select: { loanId: true },
        });

        // First SMS: Loan Renewal notification
        logger.info("About to send first SMS (renewal notification)");
        try {
          const renewalMessage = SMS_MESSAGES.loanRenewal(
            oldLoan.loanId,
            outstandingAmount,
            result.newLoan.loanId
          );

          const firstSmsResult = await sendSMS(
            customer.mobilePhone,
            renewalMessage
          );
          logger.info("Loan renewal SMS sent", {
            oldLoanId: oldLoan.loanId,
            newLoanId: result.newLoan.loanId,
            recipient: customer.mobilePhone,
            success: firstSmsResult.success,
          });
        } catch (smsError) {
          logger.error("Failed to send loan renewal SMS", {
            oldLoanId,
            newLoanId: result.newLoan.id,
            error: smsError.message,
            stack: smsError.stack,
          });
        }

        logger.info("First SMS completed, about to wait 2 seconds");

        // Wait 2 seconds before sending second SMS to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));

        logger.info("Wait completed, about to send second SMS");

        // Second SMS: New Loan Approved notification
        try {
          const newLoanMessage = SMS_MESSAGES.newLoanApproval(
            result.newLoan.loanId,
            amount,
            interest30,
            durationMonths,
            durationDays,
            frequency
          );

          logger.info("Sending new loan approval SMS", {
            newLoanId: result.newLoan.loanId,
            recipient: customer.mobilePhone,
          });

          const smsResult = await sendSMS(customer.mobilePhone, newLoanMessage);
          logger.info("New loan approval SMS sent (renewal)", {
            newLoanId: result.newLoan.loanId,
            recipient: customer.mobilePhone,
            success: smsResult.success,
          });
        } catch (smsError) {
          logger.error("Failed to send new loan approval SMS (renewal)", {
            newLoanId: result.newLoan.id,
            error: smsError.message,
            stack: smsError.stack,
          });
        }

        logger.info("Second SMS block completed");
      } else {
        logger.warn("No customer phone number found, skipping SMS");
      }
    } catch (error) {
      logger.error("Error in SMS notification process", {
        error: error.message,
        stack: error.stack,
      });
    }

    logger.info("About to send response to client");

    res.json({
      success: true,
      message: "Loan renewed successfully",
      oldLoan: result.oldLoan,
      newLoan: result.newLoan,
    });
  })
);

module.exports = router;
