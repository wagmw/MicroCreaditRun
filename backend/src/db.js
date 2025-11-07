const { PrismaClient } = require("@prisma/client");

// Configure Prisma with optimized settings for better performance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;
