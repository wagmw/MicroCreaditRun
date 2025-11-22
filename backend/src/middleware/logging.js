const { logger } = require("../utils/logger");

/**
 * Middleware to log HTTP requests - only logs errors and important events
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  // Override the end function to log response
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Only log errors (4xx, 5xx) and important endpoints
    if (statusCode >= 400) {
      logger.error("HTTP Error Response", {
        method: req.method,
        url: req.url,
        path: req.path,
        statusCode: statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        query: req.query,
      });
    }

    // Call the original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error with full context
  logger.error({
    type: "ERROR",
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip || req.connection.remoteAddress,
    statusCode: err.statusCode || 500,
  });

  // Send error response
  res.status(err.statusCode || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  requestLogger,
  errorHandler,
  asyncHandler,
};
