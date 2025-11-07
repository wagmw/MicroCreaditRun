require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const prisma = require("./db");

const customers = require("./routes/customers");
const loans = require("./routes/loans");
const payments = require("./routes/payments");
const auth = require("./routes/auth");
const dashboard = require("./routes/dashboard");
const bankAccounts = require("./routes/bankAccounts");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", auth);
app.use("/api/customers", customers);
app.use("/api/loans", loans);
app.use("/api/payments", payments);
app.use("/api/dashboard", dashboard);
app.use("/api/bank-accounts", bankAccounts);

app.get("/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
