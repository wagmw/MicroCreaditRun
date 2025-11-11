const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

async function addManager() {
  try {
    console.log("👤 Adding manager user...");

    // Check if manager already exists
    const existingManager = await prisma.user.findUnique({
      where: { username: "manager" },
    });

    if (existingManager) {
      console.log("⚠️  Manager user already exists. Updating password...");

      await prisma.user.update({
        where: { username: "manager" },
        data: {
          password: "manager123",
          name: "Manager",
          type: "MANAGER",
          active: true,
          updatedAt: new Date(),
        },
      });

      console.log("✅ Manager user updated successfully!");
    } else {
      await prisma.user.create({
        data: {
          id: uuidv4(),
          username: "manager",
          password: "manager123",
          name: "Manager",
          type: "MANAGER",
          active: true,
          updatedAt: new Date(),
        },
      });

      console.log("✅ Manager user created successfully!");
    }

    console.log("\n📋 Manager Credentials:");
    console.log("   Username: manager");
    console.log("   Password: manager123");
    console.log("   Type: MANAGER");
  } catch (error) {
    console.error("❌ Error adding manager:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
addManager()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
