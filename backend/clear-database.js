const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log("🗑️  Starting database cleanup...");

    // Delete in correct order to respect foreign key constraints
    console.log("Deleting Payments...");
    await prisma.payment.deleteMany({});

    console.log("Deleting Funds...");
    await prisma.fund.deleteMany({});

    console.log("Deleting Loan Guarantors...");
    await prisma.loanGuarantor.deleteMany({});

    console.log("Deleting Loan Extensions...");
    await prisma.loanExtension.deleteMany({});

    console.log("Deleting Loans...");
    await prisma.loan.deleteMany({});

    console.log("Deleting Customers...");
    await prisma.customer.deleteMany({});

    console.log("Deleting Bank Accounts...");
    await prisma.bankAccount.deleteMany({});

    console.log("Deleting Users (except admin)...");
    // Keep at least one admin user for access
    const adminUsers = await prisma.user.findMany({
      where: { type: "ADMIN" },
      take: 1,
    });

    if (adminUsers.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: { not: adminUsers[0].id },
        },
      });
      console.log(`✅ Kept admin user: ${adminUsers[0].username}`);
    } else {
      await prisma.user.deleteMany({});
      console.log("⚠️  Warning: No admin user found. All users deleted.");
    }

    console.log("\n✨ Database cleared successfully!");
    console.log("You can now add real data through the interface.");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
