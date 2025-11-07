const https = require("https");
const fs = require("fs");
const path = require("path");

const SMS_CONFIG = {
  apiUrl: "https://app.text.lk/api/http/sms/send",
  apiToken: process.env.SMS_API_TOKEN,
  senderId: "TextLKDemo",
};

const LOG_FILE = path.join(__dirname, "../logs/sms.log");

/**
 * Ensure log directory exists
 */
function ensureLogDirectory() {
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Write SMS log entry
 * @param {Object} logEntry - Log entry object
 */
function logSMS(logEntry) {
  try {
    ensureLogDirectory();
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${JSON.stringify(logEntry)}\n`;
    fs.appendFileSync(LOG_FILE, logLine, "utf8");
  } catch (error) {
    console.error("Failed to write SMS log:", error.message);
  }
}

/**
 * Format phone number to match TextLK API requirements (94XXXXXXXXX)
 * @param {string} phoneNumber - Phone number in any format
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;

  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // If starts with 0, replace with 94
  if (cleaned.startsWith("0")) {
    cleaned = "94" + cleaned.substring(1);
  }

  // If doesn't start with 94, add it
  if (!cleaned.startsWith("94")) {
    cleaned = "94" + cleaned;
  }

  return cleaned;
}

/**
 * Send SMS via TextLK API
 * @param {string} recipient - Phone number (will be formatted automatically)
 * @param {string} message - SMS message content
 * @returns {Promise<Object>} - API response
 */
async function sendSMS(recipient, message) {
  return new Promise((resolve, reject) => {
    try {
      const formattedRecipient = formatPhoneNumber(recipient);

      if (!formattedRecipient) {
        throw new Error("Invalid phone number");
      }

      if (!SMS_CONFIG.apiToken) {
        throw new Error(
          "SMS_API_TOKEN not configured in environment variables"
        );
      }

      console.log(`Sending SMS to ${formattedRecipient}: ${message}`);

      const postData = JSON.stringify({
        api_token: SMS_CONFIG.apiToken,
        recipient: formattedRecipient,
        sender_id: SMS_CONFIG.senderId,
        type: "plain",
        message: message,
      });

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      const req = https.request(SMS_CONFIG.apiUrl, options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);

            // Check response status
            if (response.status === "success") {
              console.log("SMS sent successfully:", response);

              // Log success
              logSMS({
                status: "success",
                recipient: formattedRecipient,
                message: message,
                response: response.data,
                timestamp: new Date().toISOString(),
              });

              resolve({ success: true, data: response });
            } else if (response.status === "error") {
              console.error("SMS sending failed:", response.message);

              // Log error
              logSMS({
                status: "error",
                recipient: formattedRecipient,
                message: message,
                error: response.message,
                timestamp: new Date().toISOString(),
              });

              resolve({ success: false, error: response.message });
            } else {
              // Unknown response format
              console.log("SMS response (unknown format):", response);

              logSMS({
                status: "unknown",
                recipient: formattedRecipient,
                message: message,
                response: response,
                timestamp: new Date().toISOString(),
              });

              resolve({ success: true, data: response });
            }
          } catch (parseError) {
            console.error("SMS response parse error:", parseError.message);
            console.log("Raw response:", data);

            // Log parse error
            logSMS({
              status: "parse_error",
              recipient: formattedRecipient,
              message: message,
              error: parseError.message,
              rawResponse: data,
              timestamp: new Date().toISOString(),
            });

            resolve({ success: false, error: "Invalid response format" });
          }
        });
      });

      req.on("error", (error) => {
        console.error("SMS sending failed:", error.message);

        // Log request error
        logSMS({
          status: "request_error",
          recipient: formattedRecipient,
          message: message,
          error: error.message,
          timestamp: new Date().toISOString(),
        });

        resolve({ success: false, error: error.message });
      });

      req.write(postData);
      req.end();
    } catch (error) {
      console.error("SMS sending failed:", error.message);

      // Log exception
      logSMS({
        status: "exception",
        recipient: recipient,
        message: message,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      resolve({ success: false, error: error.message });
    }
  });
}

/**
 * Send payment confirmation SMS to customer
 * @param {Object} payment - Payment object with customer details
 * @returns {Promise<Object>} - SMS sending result
 */
async function sendPaymentConfirmationSMS(payment) {
  try {
    const customerPhone = payment.Customer?.mobilePhone;

    if (!customerPhone) {
      console.warn("No phone number found for customer");
      return { success: false, error: "No phone number available" };
    }

    const message = `Payment Received! 
Amount: Rs. ${payment.amount.toLocaleString()}
Date: ${new Date(payment.paidAt).toLocaleDateString()}
Thank you for your payment!`;

    return await sendSMS(customerPhone, message);
  } catch (error) {
    console.error("Error sending payment confirmation SMS:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send payment SMS to customer (max 153 characters, 4 lines)
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} loanId - Loan ID
 * @param {number} payment - Payment amount
 * @param {number} outstanding - Outstanding balance
 * @returns {Promise<Object>} - SMS sending result
 */
async function sendPaymentSMS(phoneNumber, loanId, payment, outstanding) {
  try {
    // Format in 4 lines with spaces after colons
    const message = `LoanId: ${loanId}
Today Paid: Rs ${payment.toLocaleString()}
Balance: Rs ${outstanding.toLocaleString()}
Thank you!`;

    console.log(`SMS length: ${message.length} characters`);

    if (message.length > 153) {
      console.warn(`SMS message exceeds 153 characters: ${message.length}`);
    }

    const result = await sendSMS(phoneNumber, message);

    // Log payment SMS with loan details
    logSMS({
      type: "payment",
      loanId: loanId,
      payment: payment,
      outstanding: outstanding,
      recipient: phoneNumber,
      result: result.success ? "success" : "failed",
      error: result.error || null,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    console.error("Error sending payment SMS:", error);

    // Log error
    logSMS({
      type: "payment",
      loanId: loanId,
      payment: payment,
      outstanding: outstanding,
      recipient: phoneNumber,
      result: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    return { success: false, error: error.message };
  }
}

module.exports = {
  sendSMS,
  sendPaymentConfirmationSMS,
  sendPaymentSMS,
  formatPhoneNumber,
};
