/**
 * Phone Number Utilities
 * Handles phone number normalization and validation using E.164 format
 */

const { parsePhoneNumber, isValidPhoneNumber } = require("libphonenumber-js");

/**
 * Normalize phone number to E.164 format
 * @param {string} phoneNumber - Raw phone number input
 * @param {string} defaultCountry - Default country code (e.g., 'IN')
 * @returns {string|null} - Normalized phone number or null if invalid
 */
function normalizePhoneNumber(phoneNumber, defaultCountry = "IN") {
    try {
        if (!phoneNumber) return null;

        // Remove spaces and special characters except +
        const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, "");

        // If already in E.164 format
        if (/^\+[1-9]\d{10,14}$/.test(cleaned)) {
            return cleaned;
        }

        // Parse and normalize
        const parsed = parsePhoneNumber(cleaned, defaultCountry);
        if (parsed && parsed.isValid()) {
            return parsed.format("E.164");
        }

        return null;
    } catch (error) {
        console.error("Phone normalization error:", error.message);
        return null;
    }
}

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @param {string} defaultCountry - Default country code
 * @returns {boolean} - True if valid
 */
function validatePhoneNumber(phoneNumber, defaultCountry = "IN") {
    try {
        if (!phoneNumber) return false;

        // Clean the input
        const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, "");

        // Check if valid using libphonenumber-js
        return isValidPhoneNumber(cleaned, defaultCountry);
    } catch (error) {
        return false;
    }
}

/**
 * Extract country code from E.164 phone number
 * @param {string} phoneNumber - E.164 format phone number
 * @returns {string|null} - Country code or null
 */
function getCountryCode(phoneNumber) {
    try {
        const parsed = parsePhoneNumber(phoneNumber);
        return parsed ? parsed.country : null;
    } catch (error) {
        return null;
    }
}

/**
 * Format phone number for display
 * @param {string} phoneNumber - E.164 format phone number
 * @returns {string} - Formatted for display (e.g., +91 98765 43210)
 */
function formatPhoneForDisplay(phoneNumber) {
    try {
        const parsed = parsePhoneNumber(phoneNumber);
        return parsed ? parsed.formatInternational() : phoneNumber;
    } catch (error) {
        return phoneNumber;
    }
}

module.exports = {
    normalizePhoneNumber,
    validatePhoneNumber,
    getCountryCode,
    formatPhoneForDisplay,
};
