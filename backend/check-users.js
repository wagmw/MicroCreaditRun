const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log("\n=== Users in database ===");
    if (users.length === 0) {
      console.log("❌ No users found in database!");
      console.log("\nTo create a user, run: node add-manager.js");
    } else {
      users.forEach((user) => {
        console.log(`✓ Username: ${user.username}`);
        console.log(`  Type: ${user.type}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Active: ${user.active}`);
        console.log(`  Password: ${user.password}`);
        console.log("");
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
