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

// Custom format to only log specific info types (login, database changes)
const filterInfoLogs = winston.format((info) => {
  if (info.level !== "info") return false;

  // Only log these types in info.log:
  // 1. Login attempts/successes
  // 2. Database changes (create, update, delete)
  const allowedTypes = [
    "login_attempt",
    "login_success",
    "login_failed",
    "db_create",
    "db_update",
    "db_delete",
  ];

  if (info.type && allowedTypes.includes(info.type)) {
    return info;
  }

  return false;
});

// Transport for info logs (login and database changes only)
const infoLogsTransport = new winston.transports.File({
  filename: path.join(logsDir, "info.log"),
  level: "info",
  maxsize: 10485760, // 10MB
  maxFiles: 5,
  format: winston.format.combine(filterInfoLogs(), logFormat),
  options: { flags: "a" }, // append mode
  handleExceptions: false,
  handleRejections: false,
});

// Transport for error logs (all errors and exceptions)
const errorLogsTransport = new winston.transports.File({
  filename: path.join(logsDir, "error.log"),
  level: "error",
  maxsize: 10485760, // 10MB
  maxFiles: 5,
  format: logFormat,
  options: { flags: "a" }, // append mode
  handleExceptions: false,
  handleRejections: false,
});

// Transport for SMS logs
const smsLogsTransport = new winston.transports.File({
  filename: path.join(logsDir, "sms.log"),
  level: "info",
  maxsize: 10485760, // 10MB
  maxFiles: 5,
  format: logFormat,
  options: { flags: "a" }, // append mode
  handleExceptions: false,
  handleRejections: false,
});

// Create the main logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    infoLogsTransport,
    errorLogsTransport,
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      maxsize: 10485760,
      maxFiles: 5,
      options: { flags: "a" },
    }),
    new winston.transports.Console(),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      maxsize: 10485760,
      maxFiles: 5,
      options: { flags: "a" },
    }),
    new winston.transports.Console(),
  ],
  silent: false,
});

// Create a separate logger for SMS
const smsLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    smsLogsTransport,
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
  silent: false,
});

// Force immediate flush on each log
logger.on("finish", () => {
  infoLogsTransport.close();
  errorLogsTransport.close();
});

smsLogger.on("finish", () => {
  smsLogsTransport.close();
});

// Helper function to log login attempts
logger.logLogin = (username, success, context = {}) => {
  const logType = success ? "login_success" : "login_failed";

  logger.info({
    message: `${logType}: ${username}`,
    type: logType,
    username,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Helper function to log database changes
logger.logDbChange = (operation, entity, data, context = {}) => {
  const logType = `db_${operation}`; // db_create, db_update, db_delete

  logger.info({
    message: `${logType}: ${entity}`,
    type: logType,
    entity,
    operation,
    data,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Helper function to log all errors with full details
logger.logError = (error, context = {}) => {
  logger.error({
    type: "error",
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  });
  // Force flush
  logger.transports.forEach((transport) => {
    if (transport.flush) transport.flush();
  });
};

// Helper function to log HTTP errors
logger.logHttpError = (req, statusCode, error, context = {}) => {
  logger.error({
    type: "http_error",
    method: req.method,
    url: req.url,
    path: req.path,
    statusCode,
    errorMessage: error?.message,
    stack: error?.stack,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get("user-agent"),
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Helper function to log database errors
logger.logDbError = (operation, error, context = {}) => {
  logger.error({
    type: "database_error",
    operation,
    errorCode: error.code,
    errorMessage: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Helper function to log validation errors
logger.logValidationError = (entity, errors, context = {}) => {
  logger.error({
    type: "validation_error",
    entity,
    errors,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Helper function to log file operation errors
logger.logFileError = (operation, filePath, error, context = {}) => {
  logger.error({
    type: "file_error",
    operation,
    filePath,
    errorMessage: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Helper function to log SMS activities
smsLogger.logSMS = (recipient, message, status, context = {}) => {
  const logData = {
    type: "sms",
    recipient,
    message,
    status, // success, failed, disabled, error
    timestamp: new Date().toISOString(),
    ...context,
  };
  smsLogger.info(logData);
};

// Override error method to force flush
const originalError = logger.error.bind(logger);
logger.error = function (...args) {
  originalError(...args);
  logger.transports.forEach((transport) => {
    if (transport.flush) transport.flush();
  });
};

module.exports = { logger, smsLogger };
