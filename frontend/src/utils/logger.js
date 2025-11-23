/**
 * Logger utility for frontend
 * - In development: logs to console
 * - In production: logs only errors
 * - All errors are written to err.log file
 */

import * as FileSystem from "expo-file-system";

const isDevelopment = __DEV__;
const LOG_FILE_PATH = `${FileSystem.documentDirectory}err.log`;

// Write error to file
const writeErrorToFile = async (message) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    // Append to file (create if doesn't exist)
    await FileSystem.writeAsStringAsync(LOG_FILE_PATH, logEntry, {
      encoding: FileSystem.EncodingType.UTF8,
      append: true,
    });
  } catch (fileError) {
    // Silently fail - don't want logging errors to crash the app
    console.warn("Failed to write to log file:", fileError);
  }
};

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
    // Always log errors to console
    logger.error(...args);

    // Write to file
    const message = args
      .map((arg) => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");

    writeErrorToFile(message);
  },

  // For debugging specific features
  debug: (...args) => {
    if (isDevelopment) {
      console.log("[DEBUG]", ...args);
    }
  },

  // Get log file path for debugging
  getLogFilePath: () => LOG_FILE_PATH,

  // Clear log file
  clearLogs: async () => {
    try {
      await FileSystem.deleteAsync(LOG_FILE_PATH, { idempotent: true });
    } catch (error) {
      console.warn("Failed to clear log file:", error);
    }
  },
};

export default logger;
