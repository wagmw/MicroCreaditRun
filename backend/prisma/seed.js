const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create default manager user
  const manager = await prisma.user.upsert({
    where: { username: "manager" },
    update: {},
    create: {
      id: uuidv4(),
      username: "manager",
      password: "manager123", // In production, this should be hashed!
      name: "System Manager",
      type: "MANAGER",
      updatedAt: new Date(),
    },
  });

  console.log("Created/Updated manager user:", manager);

  // Optionally create an admin user
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      id: uuidv4(),
      username: "admin",
      password: "admin123", // In production, this should be hashed!
      name: "System Administrator",
      type: "ADMIN",
      updatedAt: new Date(),
    },
  });

  console.log("Created/Updated admin user:", admin);

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
