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
        const error = new Error("Invalid phone number");
        smsLogger.logSMS(recipient, message, "error", { error: error.message });
        throw error;
      }

      // Check if SMS sending is enabled
      if (!SMS_CONFIG.enabled) {
        // Log as disabled
        smsLogger.logSMS(formattedRecipient, message, "disabled");

        return resolve({
          success: true,
          disabled: true,
          message: "SMS sending is disabled",
        });
      }

      if (!SMS_CONFIG.apiToken) {
        const error = new Error(
          "SMS_API_TOKEN not configured in environment variables"
        );
        smsLogger.logSMS(formattedRecipient, message, "error", {
          error: error.message,
        });
        throw error;
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
              smsLogger.logSMS(formattedRecipient, message, "success", {
                messageId: response.data?.message_id,
                cost: response.data?.cost,
              });

              resolve({ success: true, data: response });
            } else if (response.status === "error") {
              // Log error
              smsLogger.logSMS(formattedRecipient, message, "failed", {
                apiError: response.message,
              });

              resolve({ success: false, error: response.message });
            } else {
              // Unknown response format
              smsLogger.logSMS(formattedRecipient, message, "unknown", {
                response: response,
              });

              resolve({ success: true, data: response });
            }
          } catch (parseError) {
            // Log parse error
            smsLogger.logSMS(formattedRecipient, message, "error", {
              error: "Parse error",
              errorMessage: parseError.message,
              rawResponse: data,
            });

            resolve({ success: false, error: "Invalid response format" });
          }
        });
      });

      req.on("error", (error) => {
        // Log request error
        smsLogger.logSMS(formattedRecipient, message, "error", {
          error: "Request error",
          errorMessage: error.message,
        });

        resolve({ success: false, error: error.message });
      });

      req.write(postData);
      req.end();
    } catch (error) {
      // Log exception
      smsLogger.logSMS(recipient, message, "error", {
        error: "Exception",
        errorMessage: error.message,
        stack: error.stack,
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
      smsLogger.logSMS("N/A", "Payment confirmation", "error", {
        error: "No phone number available",
        paymentId: payment.id,
      });
      return { success: false, error: "No phone number available" };
    }

    const message = SMS_MESSAGES.paymentConfirmation(
      payment.amount,
      new Date(payment.paidAt).toLocaleDateString()
    );

    return await sendSMS(customerPhone, message);
  } catch (error) {
    smsLogger.logSMS(
      payment.Customer?.mobilePhone || "N/A",
      "Payment confirmation",
      "error",
      {
        error: error.message,
        stack: error.stack,
        paymentId: payment.id,
      }
    );
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

    // Additional context logged with main SMS log
    return result;
  } catch (error) {
    // Log error
    smsLogger.logSMS(phoneNumber, `Payment SMS for loan ${loanId}`, "error", {
      error: error.message,
      stack: error.stack,
      loanId,
      payment,
      outstanding,
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
