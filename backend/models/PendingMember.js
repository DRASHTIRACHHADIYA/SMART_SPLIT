const mongoose = require("mongoose");

const pendingMemberSchema = new mongoose.Schema(
    {
        // === IDENTITY ===
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: (v) => /^\+[1-9]\d{10,14}$/.test(v),
                message: "Invalid E.164 phone format",
            },
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },

        // === RELATIONSHIPS ===
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        groupMemberships: [
            {
                groupId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Group",
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
                addedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            },
        ],

        // === INVITATION TRACKING ===
        invitationHistory: [
            {
                sentAt: {
                    type: Date,
                    default: Date.now,
                },
                sentBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                deliveryStatus: {
                    type: String,
                    enum: ["sent", "delivered", "failed"],
                    default: "sent",
                },
            },
        ],
        lastInvitationAt: Date,
        invitationCount: {
            type: Number,
            default: 0,
        },

        // === RESOLUTION ===
        status: {
            type: String,
            enum: ["invited", "resolved", "removed"],
            default: "invited",
        },
        resolvedToUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        resolvedAt: Date,
    },
    { timestamps: true }
);

// Indexes (unique fields already have indexes)
pendingMemberSchema.index({ status: 1 });
pendingMemberSchema.index({ "groupMemberships.groupId": 1 });

module.exports = mongoose.model("PendingMember", pendingMemberSchema);
