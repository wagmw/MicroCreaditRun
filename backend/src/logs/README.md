# SMS Logging

All SMS sending attempts are automatically logged to `backend/src/logs/sms.log`.

## Log Format

Each log entry is a JSON object on a single line with a timestamp:

```
[2025-11-06T10:30:45.123Z] {"status":"success","recipient":"94712345678","message":"...","response":"...","timestamp":"2025-11-06T10:30:45.123Z"}
```

## Log Entry Types

### Success Response

```json
{
  "status": "success",
  "recipient": "94712345678",
  "message": "Loan: L001\nPaid: Rs 5,000\nBalance: Rs 15,000\nThank you!",
  "response": "sms reports with all details",
  "timestamp": "2025-11-06T10:30:45.123Z"
}
```

### Error Response

```json
{
  "status": "error",
  "recipient": "94712345678",
  "message": "Loan: L001\nPaid: Rs 5,000\nBalance: Rs 15,000\nThank you!",
  "error": "Invalid API token",
  "timestamp": "2025-11-06T10:30:45.123Z"
}
```

### Payment SMS (with additional context)

```json
{
  "type": "payment",
  "loanId": "L001",
  "payment": 5000,
  "outstanding": 15000,
  "recipient": "94712345678",
  "result": "success",
  "error": null,
  "timestamp": "2025-11-06T10:30:45.123Z"
}
```

### Network/Request Errors

```json
{
  "status": "request_error",
  "recipient": "94712345678",
  "message": "...",
  "error": "ECONNREFUSED",
  "timestamp": "2025-11-06T10:30:45.123Z"
}
```

### Parse Errors

```json
{
  "status": "parse_error",
  "recipient": "94712345678",
  "message": "...",
  "error": "Unexpected token",
  "rawResponse": "...",
  "timestamp": "2025-11-06T10:30:45.123Z"
}
```

## API Response Handling

The SMS utility checks the response from TextLK API:

### Success Response

```json
{
  "status": "success",
  "data": "sms reports with all details"
}
```

### Error Response

```json
{
  "status": "error",
  "message": "A human-readable description of the error."
}
```

## Log File Location

`backend/src/logs/sms.log`

## Features

- ✓ Automatic directory creation
- ✓ Append-only logging (never overwrites)
- ✓ ISO timestamp for each entry
- ✓ JSON format for easy parsing
- ✓ Logs all scenarios (success, error, network issues, parse errors)
- ✓ Payment-specific logging with loan details
- ✓ Non-blocking (errors don't crash the app)

## Viewing Logs

### View all logs

```bash
cat backend/src/logs/sms.log
```

### View last 10 entries

```bash
tail -n 10 backend/src/logs/sms.log
```

### View only errors

```bash
grep '"status":"error"' backend/src/logs/sms.log
```

### View only successful sends

```bash
grep '"status":"success"' backend/src/logs/sms.log
```

### View payment SMS logs

```bash
grep '"type":"payment"' backend/src/logs/sms.log
```

## Log Rotation

Consider implementing log rotation for production:

- Use `logrotate` on Linux
- Or use a Node.js logging library like `winston` with rotation
- Archive logs older than 30 days

## Privacy Note

SMS logs contain customer phone numbers and payment information. Ensure proper security:

- Restrict file permissions: `chmod 600 backend/src/logs/sms.log`
- Exclude from version control (already in .gitignore)
- Implement log retention policies
- Consider encryption for archived logs
