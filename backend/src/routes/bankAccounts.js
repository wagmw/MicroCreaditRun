const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();
const router = express.Router();

// Get all bank accounts
router.get("/", async (req, res) => {
  try {
    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(bankAccounts);
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    res.status(500).json({ error: "Failed to fetch bank accounts" });
  }
});

// Get a single bank account
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!bankAccount) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    res.json(bankAccount);
  } catch (error) {
    console.error("Error fetching bank account:", error);
    res.status(500).json({ error: "Failed to fetch bank account" });
  }
});

// Create a new bank account
router.post("/", async (req, res) => {
  try {
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

    res.status(201).json(newBankAccount);
  } catch (error) {
    console.error("Error creating bank account:", error);
    res.status(500).json({ error: "Failed to create bank account" });
  }
});

// Update a bank account
router.put("/:id", async (req, res) => {
  try {
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

    res.json(updatedBankAccount);
  } catch (error) {
    console.error("Error updating bank account:", error);
    res.status(500).json({ error: "Failed to update bank account" });
  }
});

// Delete a bank account
router.delete("/:id", async (req, res) => {
  try {
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

    res.json({ message: "Bank account deleted successfully" });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    res.status(500).json({ error: "Failed to delete bank account" });
  }
});

module.exports = router;
