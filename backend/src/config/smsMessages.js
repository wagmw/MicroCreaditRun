/**
 * SMS Message Templates (Sinhala)
 * All SMS messages are centralized here for easy maintenance and translation
 */

const SMS_MESSAGES = {
  /**
   * Payment SMS - sent when customer makes a payment
   * @param {string} loanId - Loan ID
   * @param {number} payment - Payment amount
   * @param {number} outstanding - Outstanding balance
   */
  payment: (loanId, payment, outstanding) => `ණය අංකය: ${loanId}
අද ගෙවූ මුදල: රු ${payment.toLocaleString()}
ඉතිරි මුදල: රු ${outstanding.toLocaleString()}
ස්තූතියි!`,

  /**
   * Payment Confirmation SMS
   * @param {number} amount - Payment amount
   * @param {string} date - Payment date
   */
  paymentConfirmation: (amount, date) => `ගෙවීම ලැබී ඇත!
මුදල: රු. ${amount.toLocaleString()}
දිනය: ${date}
ස්තූතියි!`,

  /**
   * Bank Deposit SMS
   * @param {string} formattedDate - Formatted date
   * @param {string} formattedTime - Formatted time
   * @param {number} totalPaymentAmount - Total payments
   * @param {number} totalExpenseAmount - Total expenses (optional)
   * @param {number} netAmount - Net amount
   * @param {string} bankNickname - Bank account nickname
   */
  bankDeposit: (
    formattedDate,
    formattedTime,
    totalPaymentAmount,
    totalExpenseAmount,
    netAmount,
    bankNickname
  ) => {
    let message = `බැංකු තැන්පතුව
දිනය: ${formattedDate} ${formattedTime}
ගෙවීම්: රු. ${totalPaymentAmount.toFixed(2)}`;

    if (totalExpenseAmount > 0) {
      message += `
වියදම්: රු. ${totalExpenseAmount.toFixed(2)}`;
    }

    message += `
ශුද්ධ මුදල: රු. ${netAmount.toFixed(2)}
බැංකුව: ${bankNickname}`;

    return message;
  },

  /**
   * Loan Completion SMS
   * @param {string} loanId - Loan ID
   */
  loanCompletion: (loanId) => `ණය ${loanId} සම්පූර්ණයි
ඉතිරි මුදල: 0
ස්තූතියි!`,

  /**
   * Loan Settlement SMS
   * @param {string} loanId - Loan ID
   */
  loanSettlement: (loanId) => `ණය ${loanId} සමතු කරන ලදී
ඉතිරි මුදල: 0
ස්තූතියි!`,

  /**
   * New Loan Approval SMS
   * @param {string} loanId - Loan ID
   * @param {number} amount - Loan amount
   * @param {number} interest30 - Interest rate (30 days)
   * @param {number} durationMonths - Duration in months (optional)
   * @param {number} durationDays - Duration in days (optional)
   * @param {string} frequency - Payment frequency (DAILY/WEEKLY/MONTHLY)
   */
  newLoanApproval: (
    loanId,
    amount,
    interest30,
    durationMonths,
    durationDays,
    frequency
  ) => {
    const paymentFrequency =
      frequency === "DAILY"
        ? "දෛනික"
        : frequency === "WEEKLY"
        ? "සතිපතා"
        : "මාසික";

    const duration = durationMonths
      ? `මාස ${durationMonths}`
      : `දින ${durationDays}`;

    return `නව ණය ${loanId} අනුමත විය
මුදල: රු ${Number(amount).toLocaleString()}
පොලිය: ${interest30}%
කාලය: ${duration}
ගෙවීම: ${paymentFrequency}`;
  },

  /**
   * Loan Renewal SMS
   * @param {string} oldLoanId - Old loan ID
   * @param {number} outstandingAmount - Outstanding amount
   * @param {string} newLoanId - New loan ID
   */
  loanRenewal: (
    oldLoanId,
    outstandingAmount,
    newLoanId
  ) => `ණය ${oldLoanId} අළුත් කරන ලදී
මුදල: රු ${Number(outstandingAmount).toLocaleString()}
නව ණය අංකය: ${newLoanId}`,
};

/**
 * Payment frequency translations
 */
const PAYMENT_FREQUENCY = {
  DAILY: "දෛනික",
  WEEKLY: "සතිපතා",
  MONTHLY: "මාසික",
};

module.exports = {
  SMS_MESSAGES,
  PAYMENT_FREQUENCY,
};
