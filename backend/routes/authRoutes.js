const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { normalizePhoneNumber, validatePhoneNumber } = require("../utils/phoneUtils");
const { createOTP, verifyOTP, createRegistrationToken, verifyRegistrationToken, consumeRegistrationToken } = require("../services/otpService");
const { sendOTPSMS } = require("../services/smsService");
const { reconcilePendingMember, getPendingMemberData } = require("../services/reconciliationService");

const router = express.Router();

// =====================
// SEND OTP
// =====================
router.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber, countryCode = "IN" } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "MISSING_PHONE",
        message: "Phone number is required"
      });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber, countryCode);
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        error: "INVALID_PHONE",
        message: "Invalid phone number format"
      });
    }

    // Create OTP
    const otpResult = createOTP(normalizedPhone);
    if (!otpResult.success) {
      return res.status(429).json(otpResult);
    }

    // Send OTP via SMS (mock in development)
    await sendOTPSMS(normalizedPhone, otpResult.otp);

    // In production, remove otp from response
    res.json({
      success: true,
      message: "OTP sent successfully",
      sessionToken: otpResult.sessionToken,
      expiresIn: otpResult.expiresIn,
      // DEV ONLY: Include OTP for testing
      _devOTP: process.env.NODE_ENV === "development" ? otpResult.otp : undefined,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Failed to send OTP"
    });
  }
});

// =====================
// VERIFY OTP
// =====================
router.post("/verify-otp", async (req, res) => {
  try {
    const { sessionToken, otp } = req.body;

    if (!sessionToken || !otp) {
      return res.status(400).json({
        success: false,
        error: "MISSING_FIELDS",
        message: "Session token and OTP are required"
      });
    }

    // Verify OTP
    const verifyResult = verifyOTP(sessionToken, otp);
    if (!verifyResult.success) {
      return res.status(400).json(verifyResult);
    }

    const phoneNumber = verifyResult.phoneNumber;

    // Check if user exists
    const existingUser = await User.findOne({ phoneNumber });

    if (existingUser) {
      // Existing user - log them in
      if (existingUser.accountStatus === "suspended") {
        return res.status(403).json({
          success: false,
          error: "ACCOUNT_SUSPENDED",
          message: "Your account has been suspended",
        });
      }

      // Update last login
      existingUser.lastLoginAt = new Date();
      await existingUser.save();

      // Generate JWT
      const token = jwt.sign(
        { id: existingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        isNewUser: false,
        token,
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          phoneNumber: existingUser.phoneNumber,
          email: existingUser.email,
          accountStatus: existingUser.accountStatus,
        },
      });
    }

    // New user - return registration token
    const registrationToken = createRegistrationToken(phoneNumber);

    // Check if there's pending member data
    const pendingData = await getPendingMemberData(phoneNumber);

    res.json({
      success: true,
      isNewUser: true,
      registrationToken,
      phoneNumber,
      pendingMemberData: pendingData,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Failed to verify OTP"
    });
  }
});

// =====================
// COMPLETE REGISTRATION
// =====================
router.post("/complete-registration", async (req, res) => {
  try {
    const { registrationToken, name, email, password } = req.body;

    if (!registrationToken || !name || !password) {
      return res.status(400).json({
        success: false,
        error: "MISSING_FIELDS",
        message: "Registration token, name, and password are required"
      });
    }

    // Verify registration token
    const tokenResult = verifyRegistrationToken(registrationToken);
    if (!tokenResult.valid) {
      return res.status(400).json({
        success: false,
        error: "INVALID_TOKEN",
        message: tokenResult.error
      });
    }

    const phoneNumber = tokenResult.phoneNumber;

    // Check if user already exists (race condition prevention)
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      consumeRegistrationToken(registrationToken);
      return res.status(400).json({
        success: false,
        error: "USER_EXISTS",
        message: "User already registered with this phone number"
      });
    }

    // Check email uniqueness if provided
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: "EMAIL_EXISTS",
          message: "Email already registered"
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name: name.trim(),
      phoneNumber,
      phoneVerified: true,
      email: email ? email.toLowerCase().trim() : undefined,
      password: hashedPassword,
      accountStatus: "active",
    });

    await user.save();

    // Consume registration token
    consumeRegistrationToken(registrationToken);

    // Reconcile pending member data
    const reconciliation = await reconcilePendingMember(phoneNumber, user._id);

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        accountStatus: user.accountStatus,
      },
      reconciliation: reconciliation.reconciled ? {
        groupsJoined: reconciliation.groupsJoined,
        expensesUpdated: reconciliation.expensesUpdated,
        netBalance: reconciliation.netBalance,
      } : null,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        error: "DUPLICATE_FIELD",
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Failed to complete registration"
    });
  }
});

// =====================
// LEGACY: REGISTER (email-based)
// Keep for backward compatibility
// =====================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format"
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phoneNumber: normalizedPhone });
    if (existingPhone) {
      return res.status(400).json({ msg: "Phone number already registered" });
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ msg: "Email already registered" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email: email ? email.toLowerCase() : undefined,
      phoneNumber: normalizedPhone,
      password: hashedPassword,
      accountStatus: "active",
    });

    await user.save();

    // Reconcile pending member
    await reconcilePendingMember(normalizedPhone, user._id);

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =====================
// LEGACY: LOGIN (email-based)
// Keep for backward compatibility
// =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check account status
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ msg: "Account suspended" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// GET CURRENT USER
// =====================
router.get("/me", require("../middleware/authMiddleware"), async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
