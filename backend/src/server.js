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

app.get("/health", (req, res) => res.json({ ok: true }));

// Global error handler (must be after all routes)
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  logger.info(`Backend server started on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  logger.info("Database connection closed");
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection:", {
    reason: reason,
    promise: promise,
  });
});
