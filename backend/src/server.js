require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const prisma = require("./db");
const { logger } = require("./utils/logger");
const {
  requestLogger,
  errorHandler,
  notFoundHandler,
} = require("./middleware/logging");

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

// CRITICAL: Only parse JSON and urlencoded, skip multipart/form-data (multer handles that)
app.use((req, res, next) => {
  const contentType = req.get("content-type") || "";
  // Skip body parsing for multipart requests
  if (contentType.includes("multipart/form-data")) {
    return next();
  }
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static files (favicon, etc.)
app.use(express.static("public"));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "MicroCredit API",
    version: "0.1.0",
    status: "running",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

// Debug endpoint to test multipart form data
app.post("/api/debug-form", (req, res) => {
  res.json({
    receivedBody: req.body,
    receivedHeaders: req.headers,
    bodyKeys: Object.keys(req.body || {}),
  });
});

app.use("/api/auth", auth);
app.use("/api/customers", customers);
app.use("/api/loans", loans);
app.use("/api/payments", payments);
app.use("/api/dashboard", dashboard);
app.use("/api/bank-accounts", bankAccounts);
app.use("/api/funds", funds);
app.use("/api/expenses", expenses);

app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ok: true,
      database: "connected",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    logger.logDbError("health_check", error);
    res.status(503).json({
      ok: false,
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 handler (must be after all routes but before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

const port = process.env.PORT || 10000;
const host = "0.0.0.0"; // Bind to all interfaces for Render

const server = app.listen(port, host, () => {
  const startMessage = `🚀 Backend server started on ${host}:${port}`;
  logger.info(startMessage);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  server.close(async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      logger.logDbError("shutdown_disconnect", error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error({
      type: "forced_shutdown",
      message: "Could not close connections in time, forcefully shutting down",
      timestamp: new Date().toISOString(),
    });
    process.exit(1);
  }, 10000);
};

// Listen to shutdown signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle uncaught exceptions
process.on("uncaughtException", async (error) => {
  logger.error({
    type: "uncaught_exception",
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  // Only exit in development - in production, let the app continue
  if (process.env.NODE_ENV !== "production") {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      logger.logDbError("disconnect_on_exception", disconnectError);
    }
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason, promise) => {
  logger.error({
    type: "unhandled_rejection",
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: String(promise),
    timestamp: new Date().toISOString(),
  });

  // Only exit in development - in production, let the app continue
  if (process.env.NODE_ENV !== "production") {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      logger.logDbError("disconnect_on_rejection", disconnectError);
    }
    process.exit(1);
  }
});

// Handle warnings
process.on("warning", (warning) => {
  logger.error({
    type: "process_warning",
    warningName: warning.name,
    warningMessage: warning.message,
    stack: warning.stack,
    timestamp: new Date().toISOString(),
  });
});
