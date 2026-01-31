const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    // === PAYER (always registered user) ===
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // === SPLIT (polymorphic - can include pending members) ===
    splitBetween: [
      {
        participant: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "splitBetween.participantModel",
        },
        participantModel: {
          type: String,
          required: true,
          enum: ["User", "PendingMember"],
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    // === FLAGS ===
    hasPendingParticipants: {
      type: Boolean,
      default: false,
    },

    // === CATEGORY ===
    category: {
      type: String,
      enum: [
        "food",
        "transport",
        "entertainment",
        "utilities",
        "rent",
        "shopping",
        "health",
        "other",
      ],
      default: "other",
    },

    // === SPLIT TYPE ===
    splitType: {
      type: String,
      enum: ["equal", "percentage", "custom"],
      default: "equal",
    },

    notes: {
      type: String,
      maxlength: 500,
    },

    // === AUDIT ===
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Indexes for balance queries
expenseSchema.index({ groupId: 1, createdAt: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ "splitBetween.participant": 1 });
expenseSchema.index({ hasPendingParticipants: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
