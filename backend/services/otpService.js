/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 * Note: In production, use Redis for OTP storage. This uses in-memory storage for development.
 */

const crypto = require("crypto");

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();
const sessionStore = new Map();

// Rate limiting storage
const rateLimitStore = new Map();

// Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 3;
const MAX_OTP_REQUESTS_PER_HOUR = 3;
const SESSION_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Generate a random OTP
 * @returns {string} - 6-digit OTP
 */
function generateOTP() {
    // Generate cryptographically secure random number
    const buffer = crypto.randomBytes(4);
    const number = buffer.readUInt32BE(0);
    // Convert to 6-digit string (000000-999999)
    return String(number % 1000000).padStart(OTP_LENGTH, "0");
}

/**
 * Generate a session token
 * @returns {string} - Hex session token
 */
function generateSessionToken() {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Check if phone number is rate limited
 * @param {string} phoneNumber - E.164 format phone number
 * @returns {Object} - { limited: boolean, retryAfter: number (seconds) }
 */
function checkRateLimit(phoneNumber) {
    const key = `otp_rate:${phoneNumber}`;
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;

    let record = rateLimitStore.get(key);
    if (!record) {
        record = { requests: [] };
    }

    // Filter out requests older than 1 hour
    record.requests = record.requests.filter((time) => time > hourAgo);

    if (record.requests.length >= MAX_OTP_REQUESTS_PER_HOUR) {
        const oldestRequest = record.requests[0];
        const retryAfter = Math.ceil((oldestRequest + 60 * 60 * 1000 - now) / 1000);
        return { limited: true, retryAfter };
    }

    return { limited: false, retryAfter: 0 };
}

/**
 * Record an OTP request for rate limiting
 * @param {string} phoneNumber - E.164 format phone number
 */
function recordOTPRequest(phoneNumber) {
    const key = `otp_rate:${phoneNumber}`;
    let record = rateLimitStore.get(key) || { requests: [] };
    record.requests.push(Date.now());
    rateLimitStore.set(key, record);
}

/**
 * Create and store OTP for a phone number
 * @param {string} phoneNumber - E.164 format phone number
 * @returns {Object} - { success, sessionToken, otp, expiresIn, error }
 */
function createOTP(phoneNumber) {
    // Check rate limit
    const rateCheck = checkRateLimit(phoneNumber);
    if (rateCheck.limited) {
        return {
            success: false,
            error: "RATE_LIMIT_EXCEEDED",
            message: `Too many OTP requests. Try again in ${rateCheck.retryAfter} seconds.`,
            retryAfter: rateCheck.retryAfter,
        };
    }

    const otp = generateOTP();
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    // Store OTP
    otpStore.set(phoneNumber, {
        otp,
        expiresAt,
        attempts: 0,
    });

    // Store session token -> phone number mapping
    sessionStore.set(sessionToken, {
        phoneNumber,
        expiresAt: Date.now() + SESSION_EXPIRY_MS,
    });

    // Record request for rate limiting
    recordOTPRequest(phoneNumber);

    return {
        success: true,
        sessionToken,
        otp, // In production, DON'T return OTP - send via SMS
        expiresIn: OTP_EXPIRY_MS / 1000,
    };
}

/**
 * Verify OTP
 * @param {string} sessionToken - Session token from createOTP
 * @param {string} inputOTP - User-provided OTP
 * @returns {Object} - { success, phoneNumber, error }
 */
function verifyOTP(sessionToken, inputOTP) {
    // Get phone number from session
    const session = sessionStore.get(sessionToken);

    if (!session) {
        return {
            success: false,
            error: "INVALID_SESSION",
            message: "Session expired or invalid. Please request a new OTP.",
        };
    }

    if (session.expiresAt < Date.now()) {
        sessionStore.delete(sessionToken);
        return {
            success: false,
            error: "SESSION_EXPIRED",
            message: "Session expired. Please request a new OTP.",
        };
    }

    const phoneNumber = session.phoneNumber;
    const otpRecord = otpStore.get(phoneNumber);

    if (!otpRecord) {
        return {
            success: false,
            error: "OTP_NOT_FOUND",
            message: "OTP not found. Please request a new OTP.",
        };
    }

    if (otpRecord.expiresAt < Date.now()) {
        otpStore.delete(phoneNumber);
        return {
            success: false,
            error: "OTP_EXPIRED",
            message: "OTP expired. Please request a new OTP.",
        };
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        otpStore.delete(phoneNumber);
        sessionStore.delete(sessionToken);
        return {
            success: false,
            error: "MAX_ATTEMPTS_EXCEEDED",
            message: "Too many incorrect attempts. Please request a new OTP.",
        };
    }

    // Timing-safe comparison
    const inputBuffer = Buffer.from(inputOTP.padStart(OTP_LENGTH, "0"));
    const storedBuffer = Buffer.from(otpRecord.otp);

    if (!crypto.timingSafeEqual(inputBuffer, storedBuffer)) {
        otpRecord.attempts += 1;
        otpStore.set(phoneNumber, otpRecord);
        return {
            success: false,
            error: "INVALID_OTP",
            message: `Incorrect OTP. ${MAX_OTP_ATTEMPTS - otpRecord.attempts} attempts remaining.`,
            attemptsRemaining: MAX_OTP_ATTEMPTS - otpRecord.attempts,
        };
    }

    // Success - clean up
    otpStore.delete(phoneNumber);
    sessionStore.delete(sessionToken);

    return {
        success: true,
        phoneNumber,
    };
}

/**
 * Create a registration token for new users
 * @param {string} phoneNumber - E.164 format phone number
 * @returns {string} - Registration token
 */
function createRegistrationToken(phoneNumber) {
    const token = generateSessionToken();
    sessionStore.set(`reg:${token}`, {
        phoneNumber,
        expiresAt: Date.now() + SESSION_EXPIRY_MS,
        type: "registration",
    });
    return token;
}

/**
 * Verify registration token
 * @param {string} token - Registration token
 * @returns {Object} - { valid, phoneNumber, error }
 */
function verifyRegistrationToken(token) {
    const session = sessionStore.get(`reg:${token}`);

    if (!session || session.type !== "registration") {
        return { valid: false, error: "Invalid registration token" };
    }

    if (session.expiresAt < Date.now()) {
        sessionStore.delete(`reg:${token}`);
        return { valid: false, error: "Registration token expired" };
    }

    return { valid: true, phoneNumber: session.phoneNumber };
}

/**
 * Consume registration token (delete after use)
 * @param {string} token - Registration token
 */
function consumeRegistrationToken(token) {
    sessionStore.delete(`reg:${token}`);
}

// Cleanup expired entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();

    for (const [key, value] of otpStore.entries()) {
        if (value.expiresAt < now) {
            otpStore.delete(key);
        }
    }

    for (const [key, value] of sessionStore.entries()) {
        if (value.expiresAt < now) {
            sessionStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

module.exports = {
    generateOTP,
    createOTP,
    verifyOTP,
    createRegistrationToken,
    verifyRegistrationToken,
    consumeRegistrationToken,
};
