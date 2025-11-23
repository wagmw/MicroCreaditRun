const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { v4: uuidv4 } = require("uuid");
const { logger } = require("../utils/logger");
const { asyncHandler } = require("../middleware/logging");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads/customers");
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: customerId-timestamp.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "customer-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    logger.info("MULTER - File received", {
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
    }
  },
});

// Debug middleware to log before multer
const debugMultipart = (req, res, next) => {
  logger.info("Before multer processing", {
    contentType: req.get("content-type"),
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {}),
    body: req.body,
  });
  next();
};

// Helper function to delete old photo
const deleteOldPhoto = (photoUrl) => {
  if (!photoUrl) return;

  // Extract filename from URL (e.g., /uploads/customers/filename.jpg)
  const filename = photoUrl.split("/").pop();
  const filePath = path.join(__dirname, "../../uploads/customers", filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    logger.info("Deleted old photo", { filePath });
  }
};

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
  debugMultipart,
  upload.single("photo"),
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
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !permanentAddress ||
      !dateOfBirth ||
      !nationalIdNo ||
      !gender ||
      !maritalStatus ||
      !ethnicity ||
      !religion ||
      !occupation ||
      !mobilePhone
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields: [
          !fullName && "fullName",
          !permanentAddress && "permanentAddress",
          !dateOfBirth && "dateOfBirth",
          !nationalIdNo && "nationalIdNo",
          !gender && "gender",
          !maritalStatus && "maritalStatus",
          !ethnicity && "ethnicity",
          !religion && "religion",
          !occupation && "occupation",
          !mobilePhone && "mobilePhone",
        ].filter(Boolean),
      });
    }

    // If photo was uploaded, generate the URL
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/customers/${req.file.filename}`;
    }

    try {
      const customerId = uuidv4();
      const customerData = {
        id: customerId,
        fullName,
        otherNames: otherNames || null,
        permanentAddress,
        dateOfBirth: new Date(dateOfBirth),
        nationalIdNo,
        gender,
        maritalStatus,
        ethnicity,
        religion,
        occupation,
        homePhone: homePhone || null,
        mobilePhone,
        secondaryMobile: secondaryMobile || null,
        whatsappNumber: whatsappNumber || null,
        photoUrl,
        active: true,
        updatedAt: new Date(),
      };

      const customer = await prisma.customer.create({
        data: customerData,
      });

      res.json(customer);
    } catch (error) {
      // If database insert fails, delete the uploaded photo
      if (req.file) {
        deleteOldPhoto(photoUrl);
      }

      if (error.code === "P2002") {
        const field = error.meta?.target?.[0];
        logger.warn("Unique constraint violation", { field });
        return res.status(400).json({
          error: `A customer with this ${field} already exists`,
          field,
        });
      }

      return res.status(500).json({
        error: "Failed to create customer",
        details: error.message,
        code: error.code,
      });
    }
  })
);

// Update customer
router.put(
  "/:id",
  debugMultipart,
  upload.single("photo"),
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
      removePhoto,
    } = req.body;

    try {
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: req.params.id },
      });

      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      let photoUrl = existingCustomer.photoUrl;

      // Handle photo removal
      if (removePhoto === "true") {
        deleteOldPhoto(photoUrl);
        photoUrl = null;
      }

      // Handle new photo upload
      if (req.file) {
        // Delete old photo if exists
        deleteOldPhoto(photoUrl);
        photoUrl = `/uploads/customers/${req.file.filename}`;
      }

      // Build update data, excluding dateOfBirth if not provided
      const updateData = {
        fullName,
        otherNames: otherNames || null,
        permanentAddress,
        nationalIdNo,
        gender,
        maritalStatus,
        ethnicity,
        religion,
        occupation,
        homePhone: homePhone || null,
        mobilePhone,
        secondaryMobile: secondaryMobile || null,
        whatsappNumber: whatsappNumber || null,
        photoUrl,
        updatedAt: new Date(),
      };

      // Only include dateOfBirth if it's provided and valid
      if (dateOfBirth) {
        updateData.dateOfBirth = new Date(dateOfBirth);
      }

      const customer = await prisma.customer.update({
        where: { id: req.params.id },
        data: updateData,
      });

      res.json(customer);
    } catch (error) {
      // If database update fails and new photo was uploaded, delete it
      if (req.file) {
        deleteOldPhoto(`/uploads/customers/${req.file.filename}`);
      }

      if (error.code === "P2002") {
        const field = error.meta?.target?.[0];
        logger.warn("Unique constraint violation", {
          customerId: req.params.id,
          field,
        });
        return res.status(400).json({
          error: `A customer with this ${field} already exists`,
          field,
        });
      }

      // Return error details to client
      return res.status(500).json({
        error: "Failed to update customer",
        details: error.message,
        code: error.code,
      });
    }
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
