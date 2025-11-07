# Backend Logging System

## Overview

The backend now includes a comprehensive logging system using Winston to track all operations, identify errors, and monitor system behavior.

## Features

### 1. **Structured Logging**

- JSON-formatted logs for easy parsing and analysis
- Multiple log levels: `error`, `warn`, `info`, `debug`
- Timestamped entries with detailed context

### 2. **Log Rotation**

- Daily log file rotation to prevent disk space issues
- Configurable retention periods:
  - Combined logs: 14 days
  - Error logs: 30 days
  - HTTP logs: 7 days
  - Exception logs: 30 days
- Maximum file size: 20MB per file

### 3. **Log Types**

#### **Combined Logs** (`logs/combined-YYYY-MM-DD.log`)

- All application logs (info, warn, error)
- General application flow and operations

#### **Error Logs** (`logs/error-YYYY-MM-DD.log`)

- Error-level logs only
- Stack traces for debugging
- Failed operations and exceptions

#### **HTTP Logs** (`logs/http-YYYY-MM-DD.log`)

- All HTTP requests and responses
- Request method, URL, query parameters
- Response status codes and duration
- Client IP addresses

#### **Exception Logs** (`logs/exceptions-YYYY-MM-DD.log`)

- Uncaught exceptions
- Critical application errors

#### **Rejection Logs** (`logs/rejections-YYYY-MM-DD.log`)

- Unhandled promise rejections
- Async operation failures

## Log Levels

Set the log level using the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=debug  # Show all logs (debug, info, warn, error)
LOG_LEVEL=info   # Show info, warn, and error (default)
LOG_LEVEL=warn   # Show only warnings and errors
LOG_LEVEL=error  # Show only errors
```

## Usage in Code

### Basic Logging

```javascript
const { logger } = require("../utils/logger");

// Info level
logger.info("User logged in", { userId: user.id, username: user.username });

// Warning level
logger.warn("Invalid login attempt", { username });

// Error level
logger.error("Database connection failed", { error: error.message });
```

### Logging with Context

```javascript
logger.logWithContext("info", "Payment processed", {
  paymentId: payment.id,
  amount: payment.amount,
  customerId: customer.id,
});
```

### Error Logging with Stack Trace

```javascript
try {
  // some operation
} catch (error) {
  logger.logError(error, {
    operation: "createLoan",
    loanId: loan.id,
  });
}
```

## Middleware

### Request Logger

Automatically logs all incoming HTTP requests and their responses:

- Request details (method, URL, query params, IP)
- Response details (status code, duration)

### Error Handler

Catches all unhandled errors in routes and logs them with full context:

- Error message and stack trace
- Request details (method, URL, body)
- Client information

### Async Handler

Wraps async route handlers to catch errors automatically:

```javascript
router.get(
  "/customers",
  asyncHandler(async (req, res) => {
    const customers = await prisma.customer.findMany();
    res.json(customers);
  })
);
```

## What's Being Logged

### Authentication

- Login attempts (successful and failed)
- User information

### Customers

- Customer creation, updates, deletions
- Customer lookups and not found errors

### Loans

- Loan applications and approvals
- Loan rejections (e.g., active loans exist)
- Guarantor and document associations

### Payments

- Payment recordings
- Bank deposit operations
- SMS notification attempts (success/failure)

### Bank Accounts & Funds

- Account creation, updates, deletions
- Fund deposits and withdrawals
- Validation errors

### Dashboard

- Statistics calculations
- Performance metrics

## Console Output

In **development** mode:

- Colored, human-readable console output
- Shows all log levels based on `LOG_LEVEL`

In **production** mode:

- No console output (logs only to files)
- Reduced verbosity for performance

## Log File Location

All log files are stored in: `backend/src/logs/`

## Monitoring Tips

### Finding Errors

```bash
# View today's errors
cat logs/error-$(date +%Y-%m-%d).log

# Search for specific error
grep "Customer not found" logs/error-*.log
```

### Monitoring HTTP Requests

```bash
# View recent HTTP activity
tail -f logs/http-$(date +%Y-%m-%d).log

# Find slow requests (over 1 second)
grep '"duration":"[1-9][0-9][0-9][0-9]' logs/http-*.log
```

### Tracking Specific Operations

```bash
# Find all loan creations
grep "Loan created" logs/combined-*.log

# Track a specific customer
grep "customerId\":\"abc123" logs/*.log
```

## Environment Variables

Add to `.env` file:

```env
# Logging configuration
LOG_LEVEL=info
NODE_ENV=production  # or development
```

## Benefits

1. **Error Detection**: Quickly identify and diagnose issues
2. **Audit Trail**: Track all operations and changes
3. **Performance Monitoring**: Measure response times
4. **Security**: Log authentication attempts and failures
5. **Debugging**: Full context for troubleshooting

## Best Practices

1. **Don't log sensitive data**: Passwords, tokens, full credit card numbers
2. **Include context**: Always add relevant IDs and parameters
3. **Use appropriate levels**:
   - `error`: Something failed
   - `warn`: Something unexpected but handled
   - `info`: Normal operations
   - `debug`: Detailed debugging info
4. **Be concise**: Clear messages with structured data

## Future Enhancements

Consider adding:

- Log aggregation service (ELK Stack, Datadog, etc.)
- Real-time error alerts
- Performance metrics dashboard
- Log analysis and visualization tools
