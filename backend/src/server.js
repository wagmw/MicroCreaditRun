require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const prisma = require("./db");
const { logger } = require("./utils/logger");
const { requestLogger, errorHandler } = require("./middleware/logging");

const customers = require("./routes/customers");
const loans = require("./routes/loans");
const payments = require("./routes/payments");
const auth = require("./routes/auth");
const dashboard = require("./routes/dashboard");
const bankAccounts = require("./routes/bankAccounts");
const funds = require("./routes/funds");
const expenses = require("./routes/expenses");

const app = express();

// Apply middleware
app.use(cors());
// Enable response compression for faster data transfer
app.use(compression());
app.use(bodyParser.json());
app.use(requestLogger);

app.use("/api/auth", auth);
app.use("/api/customers", customers);
app.use("/api/loans", loans);
app.use("/api/payments", payments);
app.use("/api/dashboard", dashboard);
app.use("/api/bank-accounts", bankAccounts);
app.use("/api/funds", funds);
app.use("/api/expenses", expenses);

app.get("/health", (req, res) => res.json({ ok: true }));

// Global error handler (must be after all routes)
app.use(errorHandler);

const port = process.env.PORT || 10000;
const host = "0.0.0.0"; // Bind to all interfaces for Render

const server = app.listen(port, host, () => {
  logger.info(`Backend server started on ${host}:${port}`);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received: shutting down gracefully...`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await prisma.$disconnect();
      logger.info("Database connection closed");
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown:", error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Listen to shutdown signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle uncaught exceptions
process.on("uncaughtException", async (error) => {
  logger.error("Uncaught Exception:", {
    message: error.message,
    stack: error.stack,
  });

  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    logger.error("Error disconnecting from database:", disconnectError);
  }

  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason, promise) => {
  logger.error("Unhandled Rejection:", {
    reason: reason,
    promise: promise,
  });

  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    logger.error("Error disconnecting from database:", disconnectError);
  }

  process.exit(1);
});
