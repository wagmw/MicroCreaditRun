const { PrismaClient } = require("@prisma/client");
const { logger } = require("./utils/logger");

// Configure Prisma optimized for serverless
const prisma = new PrismaClient({
  log: [
    { level: "error", emit: "event" },
    { level: "warn", emit: "event" },
  ],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Log Prisma errors and warnings to file
prisma.$on("error", (e) => {
  logger.error("Prisma error", { message: e.message, target: e.target });
});

prisma.$on("warn", (e) => {
  logger.warn("Prisma warning", { message: e.message, target: e.target });
});

// Test database connection on startup with retry logic
let connectionRetries = 0;
const maxRetries = 3;
let isConnecting = false;

const connectWithRetry = async () => {
  if (isConnecting) return;
  isConnecting = true;

  try {
    await prisma.$connect();
    const successMessage = "✅ Database connected successfully";
    const dbInfo = {
      databaseConfigured: !!process.env.DATABASE_URL,
      host: process.env.DATABASE_URL
        ? new URL(process.env.DATABASE_URL).host
        : "not configured",
    };

    // Log to file
    logger.info(successMessage, dbInfo);
    // Also show in console
    console.log(successMessage);
    console.log(`📊 Database: ${dbInfo.host}`);

    isConnecting = false;
    return true;
  } catch (err) {
    connectionRetries++;
    const errorMessage = `❌ Database connection attempt ${connectionRetries}/${maxRetries} failed: ${err.message}`;

    // Log to file
    logger.error(errorMessage, {
      code: err.code,
      meta: err.meta,
    });
    // Also show in console
    console.error(errorMessage);

    if (connectionRetries < maxRetries) {
      const retryMessage = `⏳ Retrying in 2 seconds...`;
      console.log(retryMessage);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return connectWithRetry();
    } else {
      const failureMessage =
        "❌ Failed to connect to database after multiple attempts";
      logger.error(failureMessage);
      console.error(failureMessage);
      console.error("⚠️  Please check your DATABASE_URL environment variable");
      isConnecting = false;
      // Don't exit in production - let the server start and show errors in health check
      if (process.env.NODE_ENV !== "production") {
        process.exit(1);
      }
    }
  }
};

// Initialize connection asynchronously - don't block server startup
connectWithRetry().catch((err) => {
  logger.error("Failed to initialize database connection", {
    message: err.message,
    stack: err.stack,
  });
});

module.exports = prisma;
