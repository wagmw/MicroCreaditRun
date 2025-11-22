/**
 * Logger utility for frontend
 * - In development: logs to console
 * - In production: logs only errors (can be extended to send to a service)
 */

const isDevelopment = __DEV__;

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  error: (...args) => {
    // Always log errors (could send to error tracking service in production)
    console.error(...args);
  },

  // For debugging specific features
  debug: (...args) => {
    if (isDevelopment) {
      console.log("[DEBUG]", ...args);
    }
  },
};

export default logger;
