const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { v4: uuidv4 } = require("uuid");
const { logger } = require("../utils/logger");
const { asyncHandler } = require("../middleware/logging");

// Get all expenses
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });
    res.json(expenses);
  })
);

// Get unclaimed expenses (for bank deposit)
router.get(
  "/unclaimed",
  asyncHandler(async (req, res) => {
    const expenses = await prisma.expense.findMany({
      where: { claimed: false },
      orderBy: { date: "desc" },
    });
    res.json(expenses);
  })
);

// Get expense by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  })
);

// Create expense
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { amount, description, date } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount is required and must be greater than 0" });
    }

    if (!description || description.trim() === "") {
      return res.status(400).json({ error: "Description is required" });
    }

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const expense = await prisma.expense.create({
      data: {
        id: uuidv4(),
        amount: Number(amount),
        description: description.trim(),
        date: new Date(date),
      },
    });

    logger.logDbChange("create", "expense", {
      expenseId: expense.id,
      amount: Number(amount),
      description: description.trim(),
    });

    res.json(expense);
  })
);

// Update expense
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { amount, description, date } = req.body;
    const expenseId = req.params.id;

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Check if expense is already claimed
    if (existingExpense.claimed) {
      return res.status(400).json({
        error:
          "Cannot update claimed expense. This expense has already been included in a bank deposit.",
      });
    }

    // Validation
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    if (description !== undefined && description.trim() === "") {
      return res.status(400).json({ error: "Description cannot be empty" });
    }

    // Prepare update data
    const updateData = {};
    if (amount !== undefined) updateData.amount = Number(amount);
    if (description !== undefined) updateData.description = description.trim();
    if (date !== undefined) updateData.date = new Date(date);

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
    });

    logger.logDbChange("update", "expense", {
      expenseId: updatedExpense.id,
      updatedData: updateData,
    });

    res.json(updatedExpense);
  })
);

// Delete expense
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const expenseId = req.params.id;

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Check if expense is already claimed
    if (existingExpense.claimed) {
      return res.status(400).json({
        error:
          "Cannot delete claimed expense. This expense has already been included in a bank deposit.",
      });
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    logger.logDbChange("delete", "expense", {
      expenseId,
      amount: existingExpense.amount,
      description: existingExpense.description,
    });

    res.json({ success: true, message: "Expense deleted successfully" });
  })
);

// Mark expenses as claimed (called during bank deposit)
router.post(
  "/claim",
  asyncHandler(async (req, res) => {
    const { expenseIds } = req.body;

    if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({ error: "expenseIds array is required" });
    }

    // Update all expenses to claimed
    const result = await prisma.expense.updateMany({
      where: {
        id: { in: expenseIds },
        claimed: false, // Only claim unclaimed expenses
      },
      data: {
        claimed: true,
      },
    });

    res.json({ success: true, claimedCount: result.count });
  })
);

// Get total unclaimed expenses amount
router.get(
  "/summary/unclaimed",
  asyncHandler(async (req, res) => {
    const result = await prisma.expense.aggregate({
      where: { claimed: false },
      _sum: { amount: true },
    });

    res.json({ totalAmount: result._sum.amount || 0 });
  })
);

// Get total claimed expenses amount
router.get(
  "/summary/claimed",
  asyncHandler(async (req, res) => {
    const result = await prisma.expense.aggregate({
      where: { claimed: true },
      _sum: { amount: true },
    });

    res.json({ totalAmount: result._sum.amount || 0 });
  })
);

// Get total all expenses amount
router.get(
  "/summary/total",
  asyncHandler(async (req, res) => {
    const result = await prisma.expense.aggregate({
      _sum: { amount: true },
    });

    res.json({ totalAmount: result._sum.amount || 0 });
  })
);

module.exports = router;
