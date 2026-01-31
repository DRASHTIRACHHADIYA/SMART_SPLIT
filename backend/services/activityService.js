/**
 * Activity Service
 * Helper functions for logging activities throughout the application
 */

const Activity = require("../models/Activity");

/**
 * Log a group creation activity
 */
async function logGroupCreated(userId, group) {
    return Activity.log({
        groupId: group._id,
        userId,
        targetId: group._id,
        targetModel: "Group",
        action: "group_created",
        description: `Created group "${group.name}"`,
        metadata: {
            groupName: group.name,
            currency: group.currency,
        },
    });
}

/**
 * Log when a registered member is added to a group
 */
async function logMemberAdded(userId, groupId, member, groupName) {
    return Activity.log({
        groupId,
        userId,
        targetId: member._id,
        targetModel: "User",
        action: "member_added",
        description: `Added ${member.name} to the group`,
        metadata: {
            memberName: member.name,
            memberPhone: member.phoneNumber,
        },
    });
}

/**
 * Log when a pending member is invited
 */
async function logMemberInvited(userId, groupId, pendingMember, groupName) {
    return Activity.log({
        groupId,
        userId,
        targetId: pendingMember._id,
        targetModel: "PendingMember",
        action: "member_invited",
        description: `Invited ${pendingMember.displayName} (${pendingMember.phoneNumber})`,
        metadata: {
            displayName: pendingMember.displayName,
            phoneNumber: pendingMember.phoneNumber,
        },
    });
}

/**
 * Log when a pending member registers and joins
 */
async function logMemberJoined(userId, groupId, userName) {
    return Activity.log({
        groupId,
        userId,
        targetId: userId,
        targetModel: "User",
        action: "member_joined",
        description: `${userName} joined the group`,
        metadata: {
            userName,
        },
    });
}

/**
 * Log when an expense is added
 */
async function logExpenseAdded(userId, groupId, expense, userName) {
    return Activity.log({
        groupId,
        userId,
        targetId: expense._id,
        targetModel: "Expense",
        action: "expense_added",
        description: `${userName} added "${expense.title}" - ₹${expense.amount}`,
        metadata: {
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            splitType: expense.splitType,
            participantCount: expense.splitBetween.length,
        },
    });
}

/**
 * Log when an expense is deleted
 */
async function logExpenseDeleted(userId, groupId, expense, userName) {
    return Activity.log({
        groupId,
        userId,
        targetId: expense._id,
        targetModel: "Expense",
        action: "expense_deleted",
        description: `${userName} deleted "${expense.title}" - ₹${expense.amount}`,
        metadata: {
            title: expense.title,
            amount: expense.amount,
        },
    });
}

/**
 * Log when a settlement is confirmed
 */
async function logSettlementConfirmed(userId, groupId, fromUser, toUser, amount) {
    return Activity.log({
        groupId,
        userId,
        action: "settlement_confirmed",
        description: `${fromUser.name} settled ₹${amount} with ${toUser.name}`,
        metadata: {
            fromUserId: fromUser._id,
            fromUserName: fromUser.name,
            toUserId: toUser._id,
            toUserName: toUser.name,
            amount,
        },
    });
}

module.exports = {
    logGroupCreated,
    logMemberAdded,
    logMemberInvited,
    logMemberJoined,
    logExpenseAdded,
    logExpenseDeleted,
    logSettlementConfirmed,
};
