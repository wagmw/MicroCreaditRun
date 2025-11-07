const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { logger } = require("../utils/logger");
const { asyncHandler } = require("../middleware/logging");

// Get all funds
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const funds = await prisma.fund.findMany({
      include: {
        BankAccount: {
          select: {
            id: true,
            nickname: true,
            accountNumber: true,
            bank: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    res.json(funds);
  })
);

// Get a single fund by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const fund = await prisma.fund.findUnique({
      where: { id },
      include: {
        BankAccount: {
          select: {
            id: true,
            nickname: true,
            accountNumber: true,
            bank: true,
          },
        },
      },
    });

    if (!fund) {
      logger.warn("Fund not found", { fundId: id });
      return res.status(404).json({ error: "Fund not found" });
    }

    res.json(fund);
  })
);

// Create a new fund
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { amount, bankAccountId, date, note } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      logger.warn("Invalid fund creation - invalid amount", { amount });
      return res.status(400).json({ error: "Valid amount is required" });
    }
    if (!bankAccountId) {
      logger.warn("Invalid fund creation - missing bank account");
      return res.status(400).json({ error: "Bank account is required" });
    }
    if (!date) {
      logger.warn("Invalid fund creation - missing date");
      return res.status(400).json({ error: "Date is required" });
    }

    // Check if bank account exists
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!bankAccount) {
      logger.warn("Bank account not found for fund creation", {
        bankAccountId,
      });
      return res.status(404).json({ error: "Bank account not found" });
    }

    logger.info("Creating new fund", { amount, bankAccountId, date });

    // Create fund
    const fund = await prisma.fund.create({
      data: {
        amount: parseFloat(amount),
        bankAccountId,
        date: new Date(date),
        note: note || null,
      },
      include: {
        BankAccount: {
          select: {
            id: true,
            nickname: true,
            accountNumber: true,
            bank: true,
          },
        },
      },
    });

    logger.info("Fund created successfully", {
      fundId: fund.id,
      amount: fund.amount,
      bankAccount: bankAccount.nickname,
    });

    res.status(201).json(fund);
  })
);

// Update a fund
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, bankAccountId, date, note } = req.body;

    // Check if fund exists
    const existingFund = await prisma.fund.findUnique({
      where: { id },
    });

    if (!existingFund) {
      logger.warn("Attempted to update non-existent fund", { fundId: id });
      return res.status(404).json({ error: "Fund not found" });
    }

    // Validation
    if (amount !== undefined && amount <= 0) {
      logger.warn("Invalid fund update - invalid amount", {
        fundId: id,
        amount,
      });
      return res.status(400).json({ error: "Valid amount is required" });
    }

    // Check if bank account exists (if being updated)
    if (bankAccountId) {
      const bankAccount = await prisma.bankAccount.findUnique({
        where: { id: bankAccountId },
      });

      if (!bankAccount) {
        logger.warn("Bank account not found for fund update", {
          fundId: id,
          bankAccountId,
        });
        return res.status(404).json({ error: "Bank account not found" });
      }
    }

    logger.info("Updating fund", { fundId: id });

    // Update fund
    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (bankAccountId) updateData.bankAccountId = bankAccountId;
    if (date) updateData.date = new Date(date);
    if (note !== undefined) updateData.note = note;

    const updatedFund = await prisma.fund.update({
      where: { id },
      data: updateData,
      include: {
        BankAccount: {
          select: {
            id: true,
            nickname: true,
            accountNumber: true,
            bank: true,
          },
        },
      },
    });

    logger.info("Fund updated successfully", { fundId: id });

    res.json(updatedFund);
  })
);

// Delete a fund
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if fund exists
    const fund = await prisma.fund.findUnique({
      where: { id },
    });

    if (!fund) {
      logger.warn("Attempted to delete non-existent fund", { fundId: id });
      return res.status(404).json({ error: "Fund not found" });
    }

    // Delete fund
    await prisma.fund.delete({
      where: { id },
    });

    logger.info("Fund deleted", { fundId: id, amount: fund.amount });

    res.json({ message: "Fund deleted successfully" });
  })
);

// Get funds summary (total by bank account)
router.get(
  "/summary/by-account",
  asyncHandler(async (req, res) => {
    const funds = await prisma.fund.groupBy({
      by: ["bankAccountId"],
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Fetch bank account details
    const summary = await Promise.all(
      funds.map(async (item) => {
        const bankAccount = await prisma.bankAccount.findUnique({
          where: { id: item.bankAccountId },
          select: {
            nickname: true,
            accountNumber: true,
            bank: true,
          },
        });

        return {
          bankAccountId: item.bankAccountId,
          bankAccount,
          totalAmount: item._sum.amount,
          count: item._count.id,
        };
      })
    );

    res.json(summary);
  })
);

// Get total funds invested (single number)
router.get(
  "/summary/total",
  asyncHandler(async (req, res) => {
    const result = await prisma.fund.aggregate({
      _sum: { amount: true },
    });
    res.json({ totalAmount: result._sum.amount || 0 });
  })
);

module.exports = router;
