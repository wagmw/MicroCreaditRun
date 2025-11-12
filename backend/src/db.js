const { PrismaClient } = require("@prisma/client");

// Configure Prisma optimized for Neon.tech serverless PostgreSQL
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Test database connection on startup with retry logic for serverless
let connectionRetries = 0;
const maxRetries = 3;

const connectWithRetry = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    console.log(
      "📊 Database URL:",
      process.env.DATABASE_URL ? "Set" : "Not set"
    );
    return true;
  } catch (err) {
    connectionRetries++;
    console.error(
      `❌ Database connection attempt ${connectionRetries}/${maxRetries} failed:`,
      err.message
    );
    console.error("Error details:", {
      code: err.code,
      meta: err.meta,
      clientVersion: err.clientVersion,
    });

    if (connectionRetries < maxRetries) {
      console.log(`⏳ Retrying in 2 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return connectWithRetry();
    } else {
      console.error("❌ Failed to connect to database after multiple attempts");
      console.error("⚠️  Please check your DATABASE_URL environment variable");
      // Don't exit in production - let health checks fail instead
      if (process.env.NODE_ENV !== "production") {
        process.exit(1);
      }
    }
  }
};

// Initialize connection
connectWithRetry();

module.exports = prisma;
