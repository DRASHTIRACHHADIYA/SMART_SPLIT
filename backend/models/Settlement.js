const mongoose = require("mongoose");

/**
 * Settlement Schema — Records a debt payment between two users.
 * Serves as the trigger event for credit score calculations.
 */
const settlementSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },
        expenseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense",
            default: null,
        },
        method: {
            type: String,
            enum: ["cash", "upi", "bank", "other"],
            default: "cash",
        },
        note: {
            type: String,
            maxlength: 300,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "completed",
        },
        creditScoreProcessed: {
            type: Boolean,
            default: false,
        },
        /**
         * Tracks the highest delay-penalty tier already applied.
         * 0 = none, 3 = delayed_gt3, 7 = delayed_gt7, 15 = delayed_gt15
         * Prevents duplicate penalties as a pending settlement ages.
         */
        lastPenaltyTier: {
            type: Number,
            default: 0,
            enum: [0, 3, 7, 15],
        },
        reminderCount: {
            type: Number,
            default: 0,
        },
        completedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Efficient queries
settlementSchema.index({ groupId: 1, createdAt: -1 });
settlementSchema.index({ fromUserId: 1 });
settlementSchema.index({ toUserId: 1 });

module.exports = mongoose.model("Settlement", settlementSchema);
