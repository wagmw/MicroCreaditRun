const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { v4: uuidv4 } = require("uuid");
const { logger } = require("../utils/logger");
const { asyncHandler } = require("../middleware/logging");

// Get all active customers
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const customers = await prisma.customer.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(customers);
  })
);

// Get customer by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { Loan: true, Payment: true },
    });
    if (!customer || !customer.active) {
      logger.warn("Customer not found", { customerId: req.params.id });
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  })
);

// Create customer
router.post(
  "/",
  asyncHandler(async (req, res) => {
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

    logger.info("Creating new customer", { fullName, nationalIdNo });

    const customer = await prisma.customer.create({
      data: {
        id: uuidv4(),
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
        updatedAt: new Date(),
      },
    });

    logger.info("Customer created successfully", {
      customerId: customer.id,
      fullName,
    });
    res.json(customer);
  })
);

// Update customer
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
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

    logger.info("Updating customer", { customerId: req.params.id });

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

    logger.info("Customer updated successfully", { customerId: customer.id });
    res.json(customer);
  })
);

// Delete customer (soft delete if has loans, hard delete if no loans)
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    // Check if customer has any loans
    const customerWithLoans = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { Loan: true },
    });

    if (!customerWithLoans) {
      logger.warn("Attempt to delete non-existent customer", {
        customerId: req.params.id,
      });
      return res.status(404).json({ error: "Customer not found" });
    }

    // If customer has loans, soft delete (hide)
    if (customerWithLoans.Loan.length > 0) {
      const customer = await prisma.customer.update({
        where: { id: req.params.id },
        data: { active: false },
      });
      logger.info("Customer soft deleted (has loans)", {
        customerId: req.params.id,
        loanCount: customerWithLoans.Loan.length,
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
      logger.info("Customer hard deleted", { customerId: req.params.id });
      res.json({
        message: "Customer deleted permanently",
        softDelete: false,
      });
    }
  })
);

module.exports = router;
