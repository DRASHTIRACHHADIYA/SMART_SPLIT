const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // === IDENTITY ===
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    // === AUTHENTICATION ===
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          // E.164 format: +91XXXXXXXXXX
          return /^\+[1-9]\d{10,14}$/.test(v);
        },
        message: "Invalid phone number format. Use E.164 format (+91XXXXXXXXXX)",
      },
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      sparse: true, // allows null but unique when present
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },

    // === ACCOUNT STATE ===
    accountStatus: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },

    // === METADATA ===
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Indexes for fast lookups (unique fields already have indexes)
userSchema.index({ accountStatus: 1 });

module.exports = mongoose.model("User", userSchema);
