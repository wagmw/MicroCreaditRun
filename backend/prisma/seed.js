const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create users
  console.log("Creating users...");
  const manager = await prisma.user.upsert({
    where: { username: "manager" },
    update: {},
    create: {
      id: uuidv4(),
      username: "manager",
      password: "manager123",
      name: "System Manager",
      type: "MANAGER",
      updatedAt: new Date(),
    },
  });

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      id: uuidv4(),
      username: "admin",
      password: "admin123",
      name: "System Administrator",
      type: "ADMIN",
      updatedAt: new Date(),
    },
  });

  const collector = await prisma.user.upsert({
    where: { username: "collector1" },
    update: {},
    create: {
      id: uuidv4(),
      username: "collector1",
      password: "collector123",
      name: "John Collector",
      type: "COLLECTOR",
      updatedAt: new Date(),
    },
  });

  console.log("✓ Users created");

  // Create bank accounts
  console.log("Creating bank accounts...");
  const bankAccount1 = await prisma.bankAccount.create({
    data: {
      id: uuidv4(),
      nickname: "Main Account",
      accountName: "MicroCredit Business",
      accountNumber: "1234567890",
      bank: "Commercial Bank",
      branch: "Colombo Main",
    },
  });

  const bankAccount2 = await prisma.bankAccount.create({
    data: {
      id: uuidv4(),
      nickname: "Secondary Account",
      accountName: "MicroCredit Operations",
      accountNumber: "0987654321",
      bank: "Bank of Ceylon",
      branch: "Kandy",
    },
  });

  console.log("✓ Bank accounts created");

  // Create funds
  console.log("Creating funds...");
  await prisma.fund.create({
    data: {
      id: uuidv4(),
      amount: 500000,
      bankAccountId: bankAccount1.id,
      note: "Initial capital investment",
      date: new Date("2025-01-01"),
    },
  });

  await prisma.fund.create({
    data: {
      id: uuidv4(),
      amount: 250000,
      bankAccountId: bankAccount2.id,
      note: "Additional funding",
      date: new Date("2025-02-01"),
    },
  });

  console.log("✓ Funds created");

  // Create expenses
  console.log("Creating expenses...");
  await prisma.expense.create({
    data: {
      id: uuidv4(),
      amount: 5000,
      description: "Office supplies",
      date: new Date("2025-01-15"),
      claimed: true,
    },
  });

  await prisma.expense.create({
    data: {
      id: uuidv4(),
      amount: 12000,
      description: "Staff salaries - January",
      date: new Date("2025-01-31"),
      claimed: false,
    },
  });

  await prisma.expense.create({
    data: {
      id: uuidv4(),
      amount: 3500,
      description: "Transportation costs",
      date: new Date("2025-02-10"),
      claimed: false,
    },
  });

  console.log("✓ Expenses created");

  // Create customers
  console.log("Creating customers...");
  const customer1 = await prisma.customer.create({
    data: {
      id: uuidv4(),
      fullName: "Nimal Perera",
      permanentAddress: "No. 45, Galle Road, Colombo 03",
      dateOfBirth: new Date("1985-03-15"),
      nationalIdNo: "851234567V",
      gender: "MALE",
      maritalStatus: "MARRIED",
      ethnicity: "SINHALA",
      religion: "BUDDHISM",
      occupation: "Small Business Owner",
      mobilePhone: "0771234567",
      secondaryMobile: "0112345678",
      whatsappNumber: "0771234567",
      updatedAt: new Date(),
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      id: uuidv4(),
      fullName: "Kamala Silva",
      permanentAddress: "No. 78, Main Street, Kandy",
      dateOfBirth: new Date("1990-07-22"),
      nationalIdNo: "907890123V",
      gender: "FEMALE",
      maritalStatus: "SINGLE",
      ethnicity: "SINHALA",
      religion: "BUDDHISM",
      occupation: "Shopkeeper",
      mobilePhone: "0779876543",
      whatsappNumber: "0779876543",
      updatedAt: new Date(),
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      id: uuidv4(),
      fullName: "Rajesh Kumar",
      permanentAddress: "No. 12, Temple Road, Jaffna",
      dateOfBirth: new Date("1978-11-08"),
      nationalIdNo: "781122334V",
      gender: "MALE",
      maritalStatus: "MARRIED",
      ethnicity: "SRI_LANKAN_TAMIL",
      religion: "HINDUISM",
      occupation: "Tailor",
      mobilePhone: "0765432109",
      secondaryMobile: "0215551234",
      whatsappNumber: "0765432109",
      updatedAt: new Date(),
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      id: uuidv4(),
      fullName: "Fatima Hussain",
      permanentAddress: "No. 34, Market Street, Colombo 11",
      dateOfBirth: new Date("1995-04-30"),
      nationalIdNo: "955551234V",
      gender: "FEMALE",
      maritalStatus: "MARRIED",
      ethnicity: "SRI_LANKAN_MOOR",
      religion: "ISLAM",
      occupation: "Textile Merchant",
      mobilePhone: "0778889999",
      whatsappNumber: "0778889999",
      updatedAt: new Date(),
    },
  });

  console.log("✓ Customers created");

  // Create loans
  console.log("Creating loans...");
  const loan1 = await prisma.loan.create({
    data: {
      id: uuidv4(),
      loanId: "LN-2025-001",
      applicantId: customer1.id,
      amount: 50000,
      interest30: 5000,
      startDate: new Date("2025-01-10"),
      durationMonths: 6,
      frequency: "MONTHLY",
      status: "ACTIVE",
      updatedAt: new Date(),
    },
  });

  const loan2 = await prisma.loan.create({
    data: {
      id: uuidv4(),
      loanId: "LN-2025-002",
      applicantId: customer2.id,
      amount: 30000,
      interest30: 3000,
      startDate: new Date("2025-02-01"),
      durationMonths: 3,
      frequency: "WEEKLY",
      status: "ACTIVE",
      updatedAt: new Date(),
    },
  });

  const loan3 = await prisma.loan.create({
    data: {
      id: uuidv4(),
      loanId: "LN-2025-003",
      applicantId: customer3.id,
      amount: 75000,
      interest30: 7500,
      startDate: new Date("2025-01-15"),
      durationMonths: 12,
      frequency: "MONTHLY",
      status: "ACTIVE",
      updatedAt: new Date(),
    },
  });

  const loan4 = await prisma.loan.create({
    data: {
      id: uuidv4(),
      loanId: "LN-2024-050",
      applicantId: customer4.id,
      amount: 25000,
      interest30: 2500,
      startDate: new Date("2024-10-01"),
      durationMonths: 6,
      frequency: "MONTHLY",
      status: "COMPLETED",
      updatedAt: new Date(),
    },
  });

  console.log("✓ Loans created");

  // Create loan guarantors
  console.log("Creating loan guarantors...");
  await prisma.loanGuarantor.create({
    data: {
      id: uuidv4(),
      loanId: loan1.id,
      customerId: customer2.id,
    },
  });

  await prisma.loanGuarantor.create({
    data: {
      id: uuidv4(),
      loanId: loan3.id,
      customerId: customer1.id,
    },
  });

  console.log("✓ Loan guarantors created");

  // Create payments
  console.log("Creating payments...");
  await prisma.payment.create({
    data: {
      id: uuidv4(),
      loanId: loan1.id,
      customerId: customer1.id,
      amount: 10000,
      paidAt: new Date("2025-02-10"),
      note: "First installment",
      banked: true,
      bankAccountId: bankAccount1.id,
    },
  });

  await prisma.payment.create({
    data: {
      id: uuidv4(),
      loanId: loan1.id,
      customerId: customer1.id,
      amount: 10000,
      paidAt: new Date("2025-03-10"),
      note: "Second installment",
      banked: true,
      bankAccountId: bankAccount1.id,
    },
  });

  await prisma.payment.create({
    data: {
      id: uuidv4(),
      loanId: loan2.id,
      customerId: customer2.id,
      amount: 8000,
      paidAt: new Date("2025-02-08"),
      note: "Weekly payment",
      banked: false,
    },
  });

  await prisma.payment.create({
    data: {
      id: uuidv4(),
      loanId: loan2.id,
      customerId: customer2.id,
      amount: 8000,
      paidAt: new Date("2025-02-15"),
      note: "Weekly payment",
      banked: false,
    },
  });

  await prisma.payment.create({
    data: {
      id: uuidv4(),
      loanId: loan3.id,
      customerId: customer3.id,
      amount: 7500,
      paidAt: new Date("2025-02-15"),
      note: "Monthly installment",
      banked: true,
      bankAccountId: bankAccount2.id,
    },
  });

  await prisma.payment.create({
    data: {
      id: uuidv4(),
      loanId: loan4.id,
      customerId: customer4.id,
      amount: 27500,
      paidAt: new Date("2025-04-01"),
      note: "Final settlement",
      banked: true,
      bankAccountId: bankAccount1.id,
    },
  });

  console.log("✓ Payments created");

  // Create loan extension
  console.log("Creating loan extension...");
  await prisma.loanExtension.create({
    data: {
      id: uuidv4(),
      loanId: loan3.id,
      newDurationMonths: 18,
      newInstallmentAmount: 5000,
      reason: "Customer requested extension due to business slowdown",
    },
  });

  console.log("✓ Loan extension created");

  console.log("\n✅ Database seed completed successfully!");
  console.log("\n📊 Test data summary:");
  console.log("   - 3 Users (manager, admin, collector)");
  console.log("   - 2 Bank Accounts");
  console.log("   - 2 Funds");
  console.log("   - 3 Expenses");
  console.log("   - 4 Customers");
  console.log("   - 4 Loans");
  console.log("   - 2 Loan Guarantors");
  console.log("   - 6 Payments");
  console.log("   - 1 Loan Extension");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
