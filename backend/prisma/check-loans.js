const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const loans = await prisma.loan.findMany({
    select: { loanId: true, status: true },
    orderBy: { loanId: "asc" },
  });

  console.log("Existing loans:", loans);
  await prisma.$disconnect();
}

main();
