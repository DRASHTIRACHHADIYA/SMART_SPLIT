/**
 * Reconciliation Service
 * Handles merging pending member data with newly registered users
 */

const mongoose = require("mongoose");
const User = require("../models/User");
const PendingMember = require("../models/PendingMember");
const Group = require("../models/Group");
const Expense = require("../models/Expense");

/**
 * Reconcile a pending member with a newly registered user
 * @param {string} phoneNumber - E.164 format phone number
 * @param {string} userId - New user's ObjectId
 * @returns {Object} - { success, groupsJoined, expensesUpdated, netBalance, error }
 */
async function reconcilePendingMember(phoneNumber, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find pending member
        const pendingMember = await PendingMember.findOne({
            phoneNumber,
            status: "invited",
        }).session(session);

        if (!pendingMember) {
            await session.commitTransaction();
            return {
                success: true,
                reconciled: false,
                message: "No pending member found for this phone number",
                groupsJoined: 0,
                expensesUpdated: 0,
                netBalance: 0,
            };
        }

        const pendingMemberId = pendingMember._id;
        let groupsJoined = 0;
        let expensesUpdated = 0;
        let netBalance = 0;

        // 1. Update all groups - move from pendingMembers to members
        const groupIds = pendingMember.groupMemberships.map((gm) => gm.groupId);

        for (const groupId of groupIds) {
            await Group.findByIdAndUpdate(
                groupId,
                {
                    $pull: { pendingMembers: pendingMemberId },
                    $addToSet: { members: userId },
                },
                { session }
            );
            groupsJoined++;
        }

        // 2. Update all expenses - change participant reference
        const expenses = await Expense.find({
            "splitBetween.participant": pendingMemberId,
            "splitBetween.participantModel": "PendingMember",
        }).session(session);

        for (const expense of expenses) {
            let modified = false;
            let hasPending = false;

            for (const split of expense.splitBetween) {
                if (
                    split.participant.toString() === pendingMemberId.toString() &&
                    split.participantModel === "PendingMember"
                ) {
                    // Update this split
                    split.participant = userId;
                    split.participantModel = "User";
                    modified = true;

                    // Calculate balance impact
                    // If this user owes, balance is negative
                    netBalance -= split.amount;
                } else if (split.participantModel === "PendingMember") {
                    hasPending = true;
                }
            }

            // Check if user is the payer
            if (expense.paidBy.toString() === pendingMemberId.toString()) {
                expense.paidBy = userId;
                netBalance += expense.amount;
                modified = true;
            }

            if (modified) {
                expense.hasPendingParticipants = hasPending;
                await expense.save({ session });
                expensesUpdated++;
            }
        }

        // 3. Mark pending member as resolved
        pendingMember.status = "resolved";
        pendingMember.resolvedToUser = userId;
        pendingMember.resolvedAt = new Date();
        await pendingMember.save({ session });

        await session.commitTransaction();

        return {
            success: true,
            reconciled: true,
            groupsJoined,
            expensesUpdated,
            netBalance: Number(netBalance.toFixed(2)),
        };
    } catch (error) {
        await session.abortTransaction();
        console.error("Reconciliation error:", error);
        return {
            success: false,
            error: error.message,
        };
    } finally {
        session.endSession();
    }
}

/**
 * Get pending member data for a phone number
 * @param {string} phoneNumber - E.164 format phone number
 * @returns {Object} - Pending member data or null
 */
async function getPendingMemberData(phoneNumber) {
    const pendingMember = await PendingMember.findOne({
        phoneNumber,
        status: "invited",
    }).populate("groupMemberships.groupId", "name");

    if (!pendingMember) {
        return null;
    }

    // Calculate pending balance
    const expenses = await Expense.find({
        "splitBetween.participant": pendingMember._id,
        "splitBetween.participantModel": "PendingMember",
    });

    let pendingBalance = 0;
    for (const expense of expenses) {
        for (const split of expense.splitBetween) {
            if (
                split.participant.toString() === pendingMember._id.toString() &&
                split.participantModel === "PendingMember"
            ) {
                pendingBalance -= split.amount;
            }
        }
    }

    return {
        displayName: pendingMember.displayName,
        groupCount: pendingMember.groupMemberships.length,
        groups: pendingMember.groupMemberships.map((gm) => ({
            id: gm.groupId._id,
            name: gm.groupId.name,
        })),
        pendingBalance: Number(pendingBalance.toFixed(2)),
    };
}

module.exports = {
    reconcilePendingMember,
    getPendingMemberData,
};
