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
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.get("user-agent");

    // Log login attempt
    logger.logLogin(username, false, {
      type: "login_attempt",
      ip,
      userAgent,
    });

    // In production, you should:
    // 1. Hash passwords before storing
    // 2. Compare hashed passwords
    // 3. Use proper session management
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      // Log failed login
      logger.logLogin(username, false, {
        reason: !user ? "user_not_found" : "invalid_password",
        ip,
        userAgent,
      });

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

    // Log successful login
    logger.logLogin(username, true, {
      userId: user.id,
      userType: user.type,
      userName: user.name,
      ip,
      userAgent,
    });

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
