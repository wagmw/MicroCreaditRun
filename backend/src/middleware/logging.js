const { logger } = require("../utils/logger");

/**
 * Middleware to log HTTP requests - only logs errors
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  // Override the end function to log response
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Only log errors (4xx, 5xx) - skip favicon 404s
    if (statusCode >= 400 && req.url !== "/favicon.ico") {
      logger.logHttpError(req, statusCode, null, {
        duration: `${duration}ms`,
        query: req.query,
        body: req.method !== "GET" ? req.body : undefined,
      });
    }

    // Call the original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Global error handling middleware - catches all unhandled errors
 */
const errorHandler = (err, req, res, next) => {
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Categorize and log error
  if (err.name === "ValidationError") {
    logger.logValidationError(req.path, err.errors || err.message, {
      method: req.method,
      url: req.url,
      body: req.body,
    });
  } else if (err.code && err.code.startsWith("P")) {
    // Prisma error
    logger.logDbError(req.method, err, {
      url: req.url,
      body: req.body,
    });
  } else if (err.name === "MulterError") {
    // File upload error
    logger.logFileError("upload", req.file?.originalname, err, {
      method: req.method,
      url: req.url,
    });
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    // JWT authentication error
    logger.error({
      type: "auth_error",
      errorName: err.name,
      errorMessage: err.message,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection?.remoteAddress,
    });
  } else if (
    err.name === "SyntaxError" &&
    err.status === 400 &&
    "body" in err
  ) {
    // JSON parsing error
    logger.error({
      type: "json_parse_error",
      errorMessage: err.message,
      method: req.method,
      url: req.url,
      body: req.body,
    });
  } else {
    // Generic error
    logger.logHttpError(req, statusCode, err, {
      errorName: err.name,
    });
  }

  // Send error response to client
  res.status(statusCode).json({
    success: false,
    error:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal server error"
        : err.message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
      name: err.name,
      code: err.code,
    }),
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log the error before passing to error handler
      logger.logError(error, {
        type: "async_handler_error",
        method: req.method,
        url: req.url,
        path: req.path,
      });
      next(error);
    });
  };
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  // Skip logging for favicon.ico
  if (req.url !== "/favicon.ico") {
    logger.error({
      type: "not_found",
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip || req.connection?.remoteAddress,
    });
  }

  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
  });
};

module.exports = {
  requestLogger,
  errorHandler,
  asyncHandler,
  notFoundHandler,
};
