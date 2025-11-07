const express = require("express");
const router = express.Router();
const prisma = require("../db");
const {
  generateSchedule,
  calculateTotalInterest,
} = require("../utils/interest");

// Get all loans with applicant details
router.get("/", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Apply loan
router.post("/apply", async (req, res) => {
  try {
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

    // Check if customer has any active loans
    const activeLoans = await prisma.loan.findMany({
      where: {
        applicantId,
        status: {
          in: ["ACTIVE", "APPROVED", "APPLIED"],
        },
      },
    });

    if (activeLoans.length > 0) {
      return res.status(400).json({
        error:
          "Customer already has an active loan. Please complete all existing loans before applying for a new one.",
      });
    }

    // Generate LoanId (format: L0001, L0002, etc.)
    const totalLoansCount = await prisma.loan.count();
    const sequence = String(totalLoansCount + 1).padStart(4, "0");
    const loanId = `L${sequence}`;

    const loan = await prisma.loan.create({
      data: {
        loanId,
        applicantId,
        amount: Number(amount),
        interest30: Number(interest30),
        startDate: new Date(startDate),
        durationMonths: durationMonths ? Number(durationMonths) : null,
        durationDays: durationDays ? Number(durationDays) : null,
        frequency,
        status: "APPROVED",
      },
    });

    // create guarantor links
    if (Array.isArray(guarantorIds)) {
      for (const gid of guarantorIds) {
        await prisma.loanGuarantor.create({
          data: { loanId: loan.id, customerId: gid },
        });
      }
    }

    // create documents
    if (Array.isArray(documents)) {
      for (const d of documents) {
        await prisma.document.create({
          data: {
            loanId: loan.id,
            type: d.type,
            note: d.note,
            fileUrl: d.fileUrl,
          },
        });
      }
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get loan by id, include payments/guarantors
router.get("/:id", async (req, res) => {
  try {
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
        Document: true,
      },
    });

    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    // Format response with lowercase property names for frontend compatibility
    const formattedLoan = {
      ...loan,
      applicant: loan.Customer,
      payments: loan.Payment,
      guarantors: loan.LoanGuarantor,
      documents: loan.Document,
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
    delete formattedLoan.Document;

    res.json(formattedLoan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all loans for a specific customer
router.get("/customer/:customerId", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
