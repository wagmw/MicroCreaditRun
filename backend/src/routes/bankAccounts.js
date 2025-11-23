const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const { logger } = require("../utils/logger");
const { asyncHandler } = require("../middleware/logging");

const prisma = new PrismaClient();
const router = express.Router();

// Get all bank accounts
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(bankAccounts);
  })
);

// Get a single bank account
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!bankAccount) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    res.json(bankAccount);
  })
);

// Create a new bank account
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { nickname, accountName, accountNumber, bank, branch } = req.body;

    // Validation
    if (!nickname || !accountName || !accountNumber || !bank || !branch) {
      return res.status(400).json({
        error:
          "All fields are required: nickname, accountName, accountNumber, bank, branch",
      });
    }

    const newBankAccount = await prisma.bankAccount.create({
      data: {
        id: uuidv4(),
        nickname,
        accountName,
        accountNumber,
        bank,
        branch,
      },
    });

    logger.logDbChange("create", "bankAccount", {
      accountId: newBankAccount.id,
      nickname,
      accountName,
      accountNumber,
      bank,
    });

    res.status(201).json(newBankAccount);
  })
);

// Update a bank account
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nickname, accountName, accountNumber, bank, branch } = req.body;

    // Check if bank account exists
    const existingAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existingAccount) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    // Validation
    if (!nickname || !accountName || !accountNumber || !bank || !branch) {
      return res.status(400).json({
        error:
          "All fields are required: nickname, accountName, accountNumber, bank, branch",
      });
    }

    const updatedBankAccount = await prisma.bankAccount.update({
      where: { id },
      data: {
        nickname,
        accountName,
        accountNumber,
        bank,
        branch,
      },
    });

    logger.logDbChange("update", "bankAccount", {
      accountId: updatedBankAccount.id,
      updatedData: {
        nickname,
        accountName,
        accountNumber,
        bank,
        branch,
      },
    });

    res.json(updatedBankAccount);
  })
);

// Delete a bank account
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if bank account exists
    const existingAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existingAccount) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    await prisma.bankAccount.delete({
      where: { id },
    });

    logger.logDbChange("delete", "bankAccount", {
      accountId: id,
      nickname: existingAccount.nickname,
      accountNumber: existingAccount.accountNumber,
    });

    res.json({ message: "Bank account deleted successfully" });
  })
);

module.exports = router;
