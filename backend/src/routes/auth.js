const express = require("express");
const router = express.Router();
const prisma = require("../db");
const jwt = require("jsonwebtoken");

// Login endpoint
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // In production, you should:
    // 1. Hash passwords before storing
    // 2. Compare hashed passwords
    // 3. Use proper session management
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

module.exports = router;
