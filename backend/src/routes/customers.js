const express = require("express");
const router = express.Router();
const prisma = require("../db");

// Get all active customers
router.get("/", async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { Loan: true, Document: true, Payment: true },
    });
    if (!customer || !customer.active) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create customer
router.post("/", async (req, res) => {
  const {
    fullName,
    otherNames,
    permanentAddress,
    dateOfBirth,
    nationalIdNo,
    gender,
    maritalStatus,
    ethnicity,
    religion,
    occupation,
    homePhone,
    mobilePhone,
    secondaryMobile,
    whatsappNumber,
    photoUrl,
  } = req.body;
  try {
    const customer = await prisma.customer.create({
      data: {
        fullName,
        otherNames,
        permanentAddress,
        dateOfBirth: new Date(dateOfBirth),
        nationalIdNo,
        gender,
        maritalStatus,
        ethnicity,
        religion,
        occupation,
        homePhone,
        mobilePhone,
        secondaryMobile,
        whatsappNumber,
        photoUrl,
        active: true,
      },
    });
    res.json(customer);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Unable to create customer", details: err.message });
  }
});

// Update customer
router.put("/:id", async (req, res) => {
  const {
    fullName,
    otherNames,
    permanentAddress,
    dateOfBirth,
    nationalIdNo,
    gender,
    maritalStatus,
    ethnicity,
    religion,
    occupation,
    homePhone,
    mobilePhone,
    secondaryMobile,
    whatsappNumber,
    photoUrl,
  } = req.body;
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        fullName,
        otherNames,
        permanentAddress,
        dateOfBirth: new Date(dateOfBirth),
        nationalIdNo,
        gender,
        maritalStatus,
        ethnicity,
        religion,
        occupation,
        homePhone,
        mobilePhone,
        secondaryMobile,
        whatsappNumber,
        photoUrl,
      },
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer (soft delete if has loans, hard delete if no loans)
router.delete("/:id", async (req, res) => {
  try {
    // Check if customer has any loans
    const customerWithLoans = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { Loan: true },
    });

    if (!customerWithLoans) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // If customer has loans, soft delete (hide)
    if (customerWithLoans.Loan.length > 0) {
      const customer = await prisma.customer.update({
        where: { id: req.params.id },
        data: { active: false },
      });
      res.json({
        message: "Customer hidden (has loans)",
        customer,
        softDelete: true,
      });
    } else {
      // No loans, can hard delete
      await prisma.customer.delete({
        where: { id: req.params.id },
      });
      res.json({
        message: "Customer deleted permanently",
        softDelete: false,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
