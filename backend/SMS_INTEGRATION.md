# SMS Notification Integration

This feature automatically sends SMS notifications to customers when they make loan payments.

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
SMS_API_TOKEN=2087|gPSKzgARJ2v82uuXskLwqlvZHqk4C1x9bxYWsttkea9117c1
```

### SMS Provider

- **Provider**: TextLK (https://app.text.lk)
- **Sender ID**: TextLKDemo
- **API Endpoint**: https://app.text.lk/api/http/sms/send

## Features

### Automatic Payment Notifications

When a customer makes a payment via `POST /api/payments`, an SMS is automatically sent containing:

- Payment amount
- Loan ID (if available)
- Payment date
- Customer name

### Phone Number Formatting

The system automatically formats phone numbers to match TextLK requirements:

- Accepts formats: `0712345678`, `712345678`, `94712345678`
- Converts to: `94712345678`

### Error Handling

- SMS sending failures don't block payment creation
- All SMS attempts are logged to console
- Missing phone numbers are handled gracefully

## Usage

### Payment Creation

```javascript
POST /api/payments
{
  "loanId": "loan-id",
  "customerId": "customer-id",
  "amount": 5000,
  "note": "Monthly installment"
}
```

**Response includes:**

```json
{
  "id": "payment-id",
  "amount": 5000,
  "customerId": "customer-id",
  "loanId": "loan-id",
  "paidAt": "2025-11-06T...",
  "Customer": {
    "fullName": "John Doe",
    "mobilePhone": "0712345678"
  }
}
```

**SMS sent to customer:**

```
Dear John Doe,
Your payment of Rs. 5,000 has been received successfully.
Loan ID: LOAN-001
Date: 11/6/2025
Thank you!
```

## API Utilities

### Available Functions

Located in `src/utils/sms.js`:

#### sendSMS(recipient, message)

Send a custom SMS message.

```javascript
const { sendSMS } = require("./utils/sms");
await sendSMS("0712345678", "Your custom message");
```

#### sendCustomPaymentSMS(phoneNumber, customerName, amount, loanId)

Send a formatted payment confirmation SMS.

```javascript
const { sendCustomPaymentSMS } = require("./utils/sms");
await sendCustomPaymentSMS("0712345678", "John Doe", 5000, "LOAN-001");
```

#### formatPhoneNumber(phoneNumber)

Format phone number to TextLK format.

```javascript
const { formatPhoneNumber } = require("./utils/sms");
const formatted = formatPhoneNumber("0712345678"); // Returns: '94712345678'
```

## Testing

### Test SMS Sending

You can test the SMS functionality using curl:

```bash
curl -X POST https://app.text.lk/api/http/sms/send \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "api_token":"2087|gPSKzgARJ2v82uuXskLwqlvZHqk4C1x9bxYWsttkea9117c1",
    "recipient":"94710000000",
    "sender_id":"TextLKDemo",
    "type":"plain",
    "message":"Test message"
  }'
```

## Logging

SMS operations are logged to the console:

```
Sending SMS to 94712345678: Dear John Doe...
SMS sent successfully: { success: true, message_id: '...' }
```

Or in case of failure:

```
SMS sending failed: Invalid API token
```

## Future Enhancements

Possible improvements:

- SMS templates for different event types
- Bulk SMS for reminders
- SMS delivery status tracking
- SMS history database table
- Multi-language support
- Configurable sender ID per customer preference
