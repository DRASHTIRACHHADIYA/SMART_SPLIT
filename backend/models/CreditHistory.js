const mongoose = require("mongoose");

/**
 * CreditHistory Schema — Append-only audit log for credit score changes.
 * Every mutation to a user's creditScore creates one CreditHistory document.
 */
const creditHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        oldScore: {
            type: Number,
            required: true,
        },
        newScore: {
            type: Number,
            required: true,
        },
        changeAmount: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: true,
            enum: [
                "on_time_settlement",      // settled within 24h   → +10
                "settlement_within_3d",    // settled within 3 days → +5
                "consecutive_bonus",       // 5 on-time in a row   → +20
                "delayed_gt3",             // >3 days late          → -15
                "delayed_gt7",             // >7 days late          → -25
                "delayed_gt15",            // >15 days pending      → -40
                "reminder_ignored",        // reminder not acted on → -10
            ],
        },
        relatedSettlementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Settlement",
            default: null,
        },
    },
    { timestamps: true }
);

// Fast lookups: user history sorted by recency
creditHistorySchema.index({ userId: 1, createdAt: -1 });

// Prevent duplicate penalties for the same settlement + reason
creditHistorySchema.index(
    { userId: 1, relatedSettlementId: 1, reason: 1 },
    { unique: true, partialFilterExpression: { relatedSettlementId: { $ne: null } } }
);

module.exports = mongoose.model("CreditHistory", creditHistorySchema);
