/**
 * Format currency amount with 2 decimal places
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with 2 decimal places and thousand separators
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0.00";
  }
  return Number(amount)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format currency with Rs prefix
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with Rs prefix
 */
export const formatRs = (amount) => {
  return `Rs. ${formatCurrency(amount)}`;
};
