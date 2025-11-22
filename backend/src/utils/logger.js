const winston = require("winston");
const path = require("path");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");

// Custom format to filter out error level logs for info.log
const filterErrors = winston.format((info) => {
  return info.level === "error" ? false : info;
});

// Transport for info logs (general application logs) - exclude errors
const infoLogsTransport = new winston.transports.File({
  filename: path.join(logsDir, "info.log"),
  level: "info",
  maxsize: 10485760, // 10MB
  maxFiles: 5,
  format: winston.format.combine(filterErrors(), logFormat),
});

// Transport for error logs only
const errorLogsTransport = new winston.transports.File({
  filename: path.join(logsDir, "error.log"),
  level: "error",
  maxsize: 10485760, // 10MB
  maxFiles: 5,
  format: logFormat,
});

// Create the logger - NO CONSOLE OUTPUT
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [infoLogsTransport, errorLogsTransport],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
  silent: false,
});

// Create a separate logger for SMS logs
const smsLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "info.log"),
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
  silent: false,
});

// Helper function to log with context
logger.logWithContext = (level, message, context = {}) => {
  logger.log(level, message, context);
};

// Helper function to log errors with full details
logger.logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

// Helper function to log SMS activities
smsLogger.logSMS = (logEntry) => {
  smsLogger.info({
    type: "sms",
    ...logEntry,
  });
};

module.exports = { logger, smsLogger };
