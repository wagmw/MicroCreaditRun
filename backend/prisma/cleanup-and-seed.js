const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Starting cleanup and seeding...\n");

  // 1. Delete all COMPLETED loans and their payments
  console.log("1️⃣  Deleting COMPLETED loans and related payments...");

  const completedLoans = await prisma.loan.findMany({
    where: { status: "COMPLETED" },
    select: { id: true, loanId: true },
  });

  if (completedLoans.length > 0) {
    console.log(`   Found ${completedLoans.length} COMPLETED loans to delete`);

    for (const loan of completedLoans) {
      // Delete payments first
      const deletedPayments = await prisma.payment.deleteMany({
        where: { loanId: loan.id },
      });
      console.log(
        `   - Deleted ${deletedPayments.count} payments for loan ${loan.loanId}`
      );

      // Delete guarantors
      await prisma.loanGuarantor.deleteMany({
        where: { loanId: loan.id },
      });

      // Delete loan extensions
      await prisma.loanExtension.deleteMany({
        where: { loanId: loan.id },
      });

      // Delete loan
      await prisma.loan.delete({
        where: { id: loan.id },
      });
      console.log(`   - Deleted loan ${loan.loanId}`);
    }
  } else {
    console.log("   No COMPLETED loans found");
  }

  console.log("\n✅ Cleanup complete!\n");

  // 2. Get all customers for seeding
  const customers = await prisma.customer.findMany({
    select: { id: true, fullName: true },
    take: 13, // We need at least 13 customers (for loans + guarantors)
  });

  if (customers.length < 2) {
    console.log(
      "❌ Not enough customers in database. Please add customers first."
    );
    return;
  }

  console.log(`2️⃣  Creating seed data with ${customers.length} customers...\n`);

  const now = new Date();
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  // Get the highest loan number to generate unique loan IDs
  const existingLoans = await prisma.loan.findMany({
    orderBy: { loanId: "desc" },
    take: 1,
  });

  let loanCounter = 1;
  if (existingLoans.length > 0) {
    // Extract number from loanId (e.g., "L0015" -> 15)
    const lastLoanNumber = parseInt(existingLoans[0].loanId.substring(1));
    loanCounter = lastLoanNumber + 1;
  }

  // 3. Create 3 COMPLETED loans (weekly, 2 months duration)
  console.log("3️⃣  Creating 3 COMPLETED loans...");

  for (let i = 0; i < 3; i++) {
    const customer = customers[i];
    const loanNumber = `L${String(loanCounter++).padStart(4, "0")}`;
    const loanAmount = 50000 + i * 10000; // 50000, 60000, 70000
    const interest = 10; // 10% per 30 days

    const loan = await prisma.loan.create({
      data: {
        id: uuidv4(),
        loanId: loanNumber,
        applicantId: customer.id,
        amount: loanAmount,
        interest30: interest,
        startDate: twoMonthsAgo,
        durationMonths: 2,
        frequency: "WEEKLY",
        status: "COMPLETED",
        updatedAt: now,
      },
    });

    // Calculate total amount with interest
    const totalAmount = loanAmount + (loanAmount * interest * 2) / 100;

    // Create weekly payments for 8 weeks (2 months)
    const weeklyPayment = totalAmount / 8;

    for (let week = 0; week < 8; week++) {
      const paymentDate = new Date(twoMonthsAgo);
      paymentDate.setDate(paymentDate.getDate() + week * 7);

      await prisma.payment.create({
        data: {
          id: uuidv4(),
          loanId: loan.id,
          customerId: customer.id,
          amount: weeklyPayment,
          paidAt: paymentDate,
          note: `Week ${week + 1} payment`,
        },
      });
    }

    console.log(
      `   ✓ Created loan ${loanNumber} for ${
        customer.fullName
      } - Rs. ${loanAmount.toLocaleString()} (COMPLETED)`
    );
  }

  // 4. Create 10 ACTIVE loans (weekly, 2 months duration)
  console.log("\n4️⃣  Creating 10 ACTIVE loans...");

  for (let i = 0; i < 10; i++) {
    const customer = customers[(i + 3) % customers.length];
    const loanNumber = `L${String(loanCounter++).padStart(4, "0")}`;
    const loanAmount = 30000 + i * 5000; // Varying amounts
    const interest = 10; // 10% per 30 days

    const loan = await prisma.loan.create({
      data: {
        id: uuidv4(),
        loanId: loanNumber,
        applicantId: customer.id,
        amount: loanAmount,
        interest30: interest,
        startDate: twoMonthsAgo,
        durationMonths: 2,
        frequency: "WEEKLY",
        status: "ACTIVE",
        updatedAt: now,
      },
    });

    // Create partial payments (2-5 weeks paid out of 8)
    const paidWeeks = 2 + (i % 4); // 2-5 weeks paid
    const totalAmount = loanAmount + (loanAmount * interest * 2) / 100;
    const weeklyPayment = totalAmount / 8;

    for (let week = 0; week < paidWeeks; week++) {
      const paymentDate = new Date(twoMonthsAgo);
      paymentDate.setDate(paymentDate.getDate() + week * 7);

      await prisma.payment.create({
        data: {
          id: uuidv4(),
          loanId: loan.id,
          customerId: customer.id,
          amount: weeklyPayment,
          paidAt: paymentDate,
          note: `Week ${week + 1} payment`,
        },
      });
    }

    console.log(
      `   ✓ Created loan ${loanNumber} for ${
        customer.fullName
      } - Rs. ${loanAmount.toLocaleString()} (ACTIVE, ${paidWeeks}/8 weeks paid)`
    );
  }

  console.log("\n✨ Seed data creation complete!");
  console.log("\n📊 Summary:");
  console.log(`   - 3 COMPLETED loans (fully paid)`);
  console.log(`   - 10 ACTIVE loans (partially paid)`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
