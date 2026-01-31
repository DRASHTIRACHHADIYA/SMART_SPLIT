/**
 * SMS Service
 * Mock implementation for development. Replace with Twilio/AWS SNS in production.
 */

/**
 * Send SMS (mock implementation)
 * @param {string} phoneNumber - E.164 format phone number
 * @param {string} message - SMS content
 * @returns {Object} - { success, messageId, error }
 */
async function sendSMS(phoneNumber, message) {
    // In development, just log the SMS
    console.log("=".repeat(50));
    console.log("📱 SMS SENT (MOCK)");
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log("=".repeat(50));

    // Simulate async SMS sending
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                messageId: `mock_${Date.now()}`,
                phone: phoneNumber,
            });
        }, 100);
    });
}

/**
 * Send OTP SMS
 * @param {string} phoneNumber - E.164 format phone number
 * @param {string} otp - OTP code
 * @returns {Object} - { success, messageId, error }
 */
async function sendOTPSMS(phoneNumber, otp) {
    const message = `Your SmartSplit verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    return sendSMS(phoneNumber, message);
}

/**
 * Send group invitation SMS
 * @param {string} phoneNumber - E.164 format phone number
 * @param {string} inviterName - Name of person inviting
 * @param {string} groupName - Group name
 * @returns {Object} - { success, messageId, error }
 */
async function sendInvitationSMS(phoneNumber, inviterName, groupName) {
    const message = `${inviterName} added you to "${groupName}" on SmartSplit. Download the app to track shared expenses: https://smartsplit.app/invite`;
    return sendSMS(phoneNumber, message);
}

module.exports = {
    sendSMS,
    sendOTPSMS,
    sendInvitationSMS,
};
