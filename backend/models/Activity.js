const mongoose = require("mongoose");

/**
 * Activity Schema - Append-only audit log for group events
 * Records all significant actions with timestamps for accountability
 */
const activitySchema = new mongoose.Schema(
    {
        // === CONTEXT ===
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
            index: true,
        },

        // === ACTOR ===
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // === TARGET ===
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        targetModel: {
            type: String,
            enum: ["User", "PendingMember", "Expense", "Group", "Settlement"],
        },

        // === ACTION ===
        action: {
            type: String,
            required: true,
            enum: [
                "group_created",
                "group_updated",
                "member_added",
                "member_invited",
                "member_joined",
                "member_removed",
                "expense_added",
                "expense_updated",
                "expense_deleted",
                "settlement_initiated",
                "settlement_confirmed",
            ],
        },

        // === DESCRIPTION ===
        description: {
            type: String,
            required: true,
            maxlength: 500,
        },

        // === METADATA ===
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        // Disable updates - activities should be append-only
        strict: true,
    }
);

// Compound index for efficient group activity queries
activitySchema.index({ groupId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

// Static method to log an activity
activitySchema.statics.log = async function (data) {
    try {
        const activity = new this(data);
        await activity.save();
        return activity;
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't throw - activity logging should not break main operations
        return null;
    }
};

module.exports = mongoose.model("Activity", activitySchema);
