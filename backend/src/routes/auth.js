const express = require("express");
const router = express.Router();
const prisma = require("../db");
const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");
const { asyncHandler } = require("../middleware/logging");

// Login endpoint
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    logger.info("Login attempt", { username });

    // In production, you should:
    // 1. Hash passwords before storing
    // 2. Compare hashed passwords
    // 3. Use proper session management
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      logger.warn("Failed login attempt", { username });
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        type: user.type,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    logger.info("Successful login", { username, userId: user.id });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        type: user.type,
        name: user.name,
      },
    });
  })
);

module.exports = router;
