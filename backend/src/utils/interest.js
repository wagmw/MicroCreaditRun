const { addDays, differenceInDays } = require("date-fns");

/**
 * Calculate total interest for a principal based on interest specified for 30 days.
 * interest30 is percentage (e.g., 2 means 2% for 30 days)
 * durationDays is number of days loan lasts
 */
function calculateTotalInterest(principal, interest30, durationDays) {
  if (!principal || principal <= 0) return 0;
  const periods = durationDays / 30.0; // fractional
  const totalInterest = (interest30 / 100.0) * principal * periods;
  return totalInterest;
}

/**
 * Generate a simple installment schedule for DAILY or WEEKLY frequencies.
 * - For daily: number of installments = durationDays
 * - For weekly: number of installments = Math.ceil(durationDays / 7)
 * For MONTHLY we provide two modes: fixedMonths (principal amortized equally) or interest-only monthly (if months unknown)
 * Returns array of { dueDate, principalPortion, interestPortion, totalDue }
 */
function generateSchedule({
  principal,
  interest30,
  startDate,
  durationDays,
  frequency,
  durationMonths,
}) {
  const start = new Date(startDate);
  if (frequency === "DAILY") {
    const n = Math.max(1, Math.round(durationDays));
    const totalInterest = calculateTotalInterest(
      principal,
      interest30,
      durationDays
    );
    const perInstallPrincipal = principal / n;
    const perInstallInterest = totalInterest / n;
    const schedule = [];
    for (let i = 0; i < n; i++) {
      schedule.push({
        dueDate: addDays(start, i),
        principalPortion: round(perInstallPrincipal),
        interestPortion: round(perInstallInterest),
        totalDue: round(perInstallPrincipal + perInstallInterest),
      });
    }
    return schedule;
  }

  if (frequency === "WEEKLY") {
    const n = Math.max(1, Math.ceil(durationDays / 7));
    const totalInterest = calculateTotalInterest(
      principal,
      interest30,
      durationDays
    );
    const perInstallPrincipal = principal / n;
    const perInstallInterest = totalInterest / n;
    const schedule = [];
    for (let i = 0; i < n; i++) {
      schedule.push({
        dueDate: addDays(start, i * 7),
        principalPortion: round(perInstallPrincipal),
        interestPortion: round(perInstallInterest),
        totalDue: round(perInstallPrincipal + perInstallInterest),
      });
    }
    return schedule;
  }

  if (frequency === "MONTHLY") {
    // If durationMonths provided, amortize principal across months and prorate interest per month (30-day interest rule)
    if (durationMonths && durationMonths > 0) {
      const n = durationMonths;
      // We'll treat each month as 30 days for interest calc since interest30 is per 30 days
      const totalInterest = calculateTotalInterest(
        principal,
        interest30,
        n * 30
      );
      const perInstallPrincipal = principal / n;
      const perInstallInterest = totalInterest / n;
      const schedule = [];
      for (let i = 0; i < n; i++) {
        schedule.push({
          dueDate: addDays(start, i * 30),
          principalPortion: round(perInstallPrincipal),
          interestPortion: round(perInstallInterest),
          totalDue: round(perInstallPrincipal + perInstallInterest),
        });
      }
      return schedule;
    }

    // OPEN/ONGOING monthly: return an interest-only single installment (monthly) based on 30-day interest
    const monthlyInterest = (interest30 / 100.0) * principal; // for 30 days
    return [
      {
        dueDate: start,
        principalPortion: 0,
        interestPortion: round(monthlyInterest),
        totalDue: round(monthlyInterest),
        note: "Interest-only monthly payment. Principal remains outstanding until settlement or fixed schedule created.",
      },
    ];
  }

  throw new Error("Unsupported frequency: " + frequency);
}

/**
 * If borrower misses payment beyond loan period finish by more than 10 days, a penalty applies.
 * Policy implemented: 12% per annum penalty interest on overdue principal amount, pro-rated daily for overdue days beyond grace.
 * Input overdueDays = number of days past due; gracePeriod = 10
 */
function calculateOverduePenalty(overdueAmount, overdueDays, gracePeriod = 10) {
  if (overdueDays <= gracePeriod) return 0;
  const daysCharged = overdueDays - gracePeriod;
  const annualRate = 0.12; // 12%
  const penalty = overdueAmount * annualRate * (daysCharged / 365.0);
  return round(penalty);
}

function round(n) {
  return Math.round(n * 100) / 100;
}

module.exports = {
  calculateTotalInterest,
  generateSchedule,
  calculateOverduePenalty,
};
