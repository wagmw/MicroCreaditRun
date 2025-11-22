const https = require("https");
const { SMS_MESSAGES } = require("../config/smsMessages");
const { smsLogger } = require("./logger");

const SMS_CONFIG = {
  apiUrl: "https://app.text.lk/api/http/sms/send",
  apiToken: process.env.SMS_API_TOKEN,
  senderId: process.env.SMS_SENDER_ID || "TextLKDemo",
  enabled: process.env.SMS_ENABLED === "1",
};

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

      // Check if SMS sending is enabled
      if (!SMS_CONFIG.enabled) {
        // Log as disabled
        smsLogger.logSMS({
          status: "disabled",
          recipient: formattedRecipient,
          message: message,
        });

        return resolve({
          success: true,
          disabled: true,
          message: "SMS sending is disabled",
        });
      }

      if (!SMS_CONFIG.apiToken) {
        throw new Error(
          "SMS_API_TOKEN not configured in environment variables"
        );
      }

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
              // Log success
              smsLogger.logSMS({
                status: "success",
                recipient: formattedRecipient,
                message: message,
                response: response.data,
              });

              resolve({ success: true, data: response });
            } else if (response.status === "error") {
              // Log error
              smsLogger.logSMS({
                status: "error",
                recipient: formattedRecipient,
                message: message,
                error: response.message,
              });

              resolve({ success: false, error: response.message });
            } else {
              // Unknown response format
              smsLogger.logSMS({
                status: "unknown",
                recipient: formattedRecipient,
                message: message,
                response: response,
              });

              resolve({ success: true, data: response });
            }
          } catch (parseError) {
            // Log parse error
            smsLogger.logSMS({
              status: "parse_error",
              recipient: formattedRecipient,
              message: message,
              error: parseError.message,
              rawResponse: data,
            });

            resolve({ success: false, error: "Invalid response format" });
          }
        });
      });

      req.on("error", (error) => {
        // Log request error
        smsLogger.logSMS({
          status: "request_error",
          recipient: formattedRecipient,
          message: message,
          error: error.message,
        });

        resolve({ success: false, error: error.message });
      });

      req.write(postData);
      req.end();
    } catch (error) {
      // Log exception
      smsLogger.logSMS({
        status: "exception",
        recipient: recipient,
        message: message,
        error: error.message,
      });

      resolve({ success: false, error: error.message });
    }
  });
}

/**
 * Send payment confirmation SMS to customer (in Sinhala)
 * @param {Object} payment - Payment object with customer details
 * @returns {Promise<Object>} - SMS sending result
 */
async function sendPaymentConfirmationSMS(payment) {
  try {
    const customerPhone = payment.Customer?.mobilePhone;

    if (!customerPhone) {
      return { success: false, error: "No phone number available" };
    }

    const message = SMS_MESSAGES.paymentConfirmation(
      payment.amount,
      new Date(payment.paidAt).toLocaleDateString()
    );

    return await sendSMS(customerPhone, message);
  } catch (error) {
    smsLogger.error("Error sending payment confirmation SMS", {
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: error.message };
  }
}

/**
 * Send payment SMS to customer in Sinhala (max 153 characters, 4 lines)
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} loanId - Loan ID
 * @param {number} payment - Payment amount
 * @param {number} outstanding - Outstanding balance
 * @returns {Promise<Object>} - SMS sending result
 */
async function sendPaymentSMS(phoneNumber, loanId, payment, outstanding) {
  try {
    const message = SMS_MESSAGES.payment(loanId, payment, outstanding);

    const result = await sendSMS(phoneNumber, message);

    // Log payment SMS with loan details
    smsLogger.logSMS({
      type: "payment",
      loanId: loanId,
      payment: payment,
      outstanding: outstanding,
      recipient: phoneNumber,
      result: result.success ? "success" : "failed",
      error: result.error || null,
      messageLength: message.length,
    });

    return result;
  } catch (error) {
    // Log error
    smsLogger.logSMS({
      type: "payment",
      loanId: loanId,
      payment: payment,
      outstanding: outstanding,
      recipient: phoneNumber,
      result: "error",
      error: error.message,
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
