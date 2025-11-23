const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { v4: uuidv4 } = require("uuid");
const { logger } = require("../utils/logger");
const { asyncHandler } = require("../middleware/logging");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Configure multer for file uploads (temporary storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads/temp");
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: customerId-timestamp.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "temp-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
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
  next();
};

// Helper function to create customer folder structure
const createCustomerFolder = (customerId) => {
  const customerDir = path.join(
    __dirname,
    "../../uploads/customers",
    customerId
  );
  if (!fs.existsSync(customerDir)) {
    fs.mkdirSync(customerDir, { recursive: true });
  }
  return customerDir;
};

// Helper function to process and save customer photo with thumbnail
const processCustomerPhoto = async (tempFilePath, customerId) => {
  try {
    const customerDir = createCustomerFolder(customerId);
    const ext = path.extname(tempFilePath);
    const fullImagePath = path.join(customerDir, `photo${ext}`);
    const thumbnailPath = path.join(customerDir, `thumbnail${ext}`);

    // Process full image (resize to max 1200px width to save space)
    await sharp(tempFilePath)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(fullImagePath);

    // Create thumbnail (200x200 for list view)
    await sharp(tempFilePath)
      .resize(200, 200, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Delete temporary file
    fs.unlinkSync(tempFilePath);

    // Return thumbnail URL (frontend will use this by default)
    return `/uploads/customers/${customerId}/thumbnail${ext}`;
  } catch (error) {
    // Clean up temp file if processing fails
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw error;
  }
};

// Helper function to delete old customer photo folder
const deleteOldPhoto = (photoUrl) => {
  if (!photoUrl) return;

  // Extract customer ID and folder from URL
  const urlParts = photoUrl.split("/");
  const customerIdIndex = urlParts.indexOf("customers") + 1;

  if (customerIdIndex > 0 && urlParts[customerIdIndex]) {
    const customerId = urlParts[customerIdIndex];
    const customerDir = path.join(
      __dirname,
      "../../uploads/customers",
      customerId
    );

    // Delete entire customer folder
    if (fs.existsSync(customerDir)) {
      fs.rmSync(customerDir, { recursive: true, force: true });
    }
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

    try {
      const customerId = uuidv4();

      // Process photo if uploaded
      let photoUrl = null;
      if (req.file) {
        photoUrl = await processCustomerPhoto(req.file.path, customerId);
      }

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

      // Log database change
      logger.logDbChange("create", "customer", {
        customerId: customer.id,
        fullName: customer.fullName,
        otherNames: customer.otherNames,
        nationalIdNo: customer.nationalIdNo,
        dateOfBirth: customer.dateOfBirth,
        gender: customer.gender,
        maritalStatus: customer.maritalStatus,
        ethnicity: customer.ethnicity,
        religion: customer.religion,
        occupation: customer.occupation,
        mobilePhone: customer.mobilePhone,
        homePhone: customer.homePhone,
        permanentAddress: customer.permanentAddress,
      });

      res.json(customer);
    } catch (error) {
      // If database insert fails, clean up uploaded files
      if (req.file) {
        // Delete temp file if still exists
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        // Delete customer folder if created
        if (photoUrl) {
          deleteOldPhoto(photoUrl);
        }
      }

      if (error.code === "P2002") {
        const field = error.meta?.target?.[0];
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
        // Delete old photo folder if exists
        deleteOldPhoto(photoUrl);
        // Process and save new photo with thumbnail
        photoUrl = await processCustomerPhoto(req.file.path, req.params.id);
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

      // Log database change with actual values
      logger.logDbChange("update", "customer", {
        customerId: customer.id,
        updatedData: updateData,
      });

      res.json(customer);
    } catch (error) {
      // If database update fails and new photo was uploaded, clean up
      if (req.file) {
        // Delete temp file if still exists
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        // Restore old photo if new one was processed
        // (Note: old photo was already deleted, so this is for cleanup only)
      }

      if (error.code === "P2002") {
        const field = error.meta?.target?.[0];
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

// Get full-size photo URL for a customer
router.get(
  "/:id/photo/full",
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      select: { photoUrl: true },
    });

    if (!customer || !customer.photoUrl) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // Convert thumbnail URL to full photo URL
    const fullPhotoUrl = customer.photoUrl.replace("/thumbnail", "/photo");
    res.json({ photoUrl: fullPhotoUrl });
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
      return res.status(404).json({ error: "Customer not found" });
    }

    // If customer has loans, soft delete (hide)
    if (customerWithLoans.Loan.length > 0) {
      const customer = await prisma.customer.update({
        where: { id: req.params.id },
        data: { active: false },
      });

      // Log database change
      logger.logDbChange("delete", "customer", {
        customerId: req.params.id,
        fullName: customerWithLoans.fullName,
        nationalIdNo: customerWithLoans.nationalIdNo,
        deleteType: "soft",
        reason: "has_loans",
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

      // Log database change
      logger.logDbChange("delete", "customer", {
        customerId: req.params.id,
        fullName: customerWithLoans.fullName,
        nationalIdNo: customerWithLoans.nationalIdNo,
        deleteType: "hard",
      });

      res.json({
        message: "Customer deleted permanently",
        softDelete: false,
      });
    }
  })
);

module.exports = router;
