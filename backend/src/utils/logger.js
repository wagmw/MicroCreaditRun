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
  options: { flags: "a" }, // append mode
});

// Transport for error logs only
const errorLogsTransport = new winston.transports.File({
  filename: path.join(logsDir, "error.log"),
  level: "error",
  maxsize: 10485760, // 10MB
  maxFiles: 5,
  format: logFormat,
  options: { flags: "a" }, // append mode
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
      options: { flags: "a" },
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      maxsize: 10485760,
      maxFiles: 5,
      options: { flags: "a" },
    }),
  ],
  silent: false,
});

// Force immediate flush on each log
logger.on("finish", () => {
  infoLogsTransport.close();
  errorLogsTransport.close();
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
      options: { flags: "a" },
    }),
  ],
  silent: false,
});

// Helper function to log with context and force flush
logger.logWithContext = (level, message, context = {}) => {
  logger.log(level, message, context);
  // Force flush transports
  logger.transports.forEach((transport) => {
    if (transport.flush) transport.flush();
  });
};

// Helper function to log errors with full details and force flush
logger.logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
  // Force flush transports
  logger.transports.forEach((transport) => {
    if (transport.flush) transport.flush();
  });
};

// Override default log methods to force flush
const originalLog = logger.log.bind(logger);
logger.log = function (...args) {
  originalLog(...args);
  logger.transports.forEach((transport) => {
    if (transport.flush) transport.flush();
  });
};

const originalError = logger.error.bind(logger);
logger.error = function (...args) {
  originalError(...args);
  logger.transports.forEach((transport) => {
    if (transport.flush) transport.flush();
  });
};

const originalInfo = logger.info.bind(logger);
logger.info = function (...args) {
  originalInfo(...args);
  logger.transports.forEach((transport) => {
    if (transport.flush) transport.flush();
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
