const User = require("../models/User");
const CreditHistory = require("../models/CreditHistory");
const Settlement = require("../models/Settlement");

/**
 * Credit Score Service
 *
 * Scoring rules:
 *   on_time_settlement  (≤24h)         → +10
 *   settlement_within_3d (≤3 days)     → +5
 *   consecutive_bonus   (5 in a row)   → +20
 *   delayed_gt3         (>3 days)      → −15
 *   delayed_gt7         (>7 days)      → −25
 *   delayed_gt15        (>15 days)     → −40
 *   reminder_ignored                   → −10
 */

const SCORE_MIN = 300;
const SCORE_MAX = 900;

const SCORE_MAP = {
    on_time_settlement: +10,
    settlement_within_3d: +5,
    consecutive_bonus: +20,
    delayed_gt3: -15,
    delayed_gt7: -25,
    delayed_gt15: -40,
    reminder_ignored: -10,
};

/**
 * Maps delay-days to the penalty tier threshold.
 * Used by checkPendingDelayPenalties to apply incremental penalties.
 */
const DELAY_TIERS = [
    { minDays: 15, tier: 15, reason: "delayed_gt15" },
    { minDays: 7, tier: 7, reason: "delayed_gt7" },
    { minDays: 3, tier: 3, reason: "delayed_gt3" },
];

/**
 * Determine the scoring reason based on days delayed.
 * Returns the single most appropriate reason (no stacking).
 */
function getReasonFromDelay(daysDelayed) {
    if (daysDelayed <= 1) return "on_time_settlement";
    if (daysDelayed <= 3) return "settlement_within_3d";
    if (daysDelayed <= 7) return "delayed_gt3";
    if (daysDelayed <= 15) return "delayed_gt7";
    return "delayed_gt15";
}

/**
 * Update a user's credit score.
 *
 * @param {String} userId          – Mongo ObjectId of the user
 * @param {String} reason          – One of the SCORE_MAP keys
 * @param {Object} options
 * @param {String} options.settlementId – Related settlement (for dedup)
 * @returns {Object} { oldScore, newScore, changeAmount, reason }
 */
async function updateCreditScore(userId, reason, options = {}) {
    const { settlementId = null } = options;

    const delta = SCORE_MAP[reason];
    if (delta === undefined) {
        throw new Error(`Invalid credit score reason: ${reason}`);
    }

    // --- Fetch current user ---
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const oldScore = user.creditScore;

    // --- Clamp new score ---
    let newScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, oldScore + delta));
    const actualDelta = newScore - oldScore;

    // --- Duplicate check: if this settlement+reason was already recorded, skip ---
    if (settlementId) {
        const exists = await CreditHistory.findOne({
            userId,
            relatedSettlementId: settlementId,
            reason,
        });
        if (exists) {
            return { oldScore, newScore: oldScore, changeAmount: 0, reason, duplicate: true };
        }
    }

    // --- Write audit record ---
    await CreditHistory.create({
        userId,
        oldScore,
        newScore,
        changeAmount: actualDelta,
        reason,
        relatedSettlementId: settlementId,
    });

    // --- Update user score ---
    user.creditScore = newScore;

    // --- Consecutive on-time tracking ---
    const isPositive = delta > 0 && reason !== "consecutive_bonus";
    if (isPositive) {
        user.consecutiveOnTime += 1;
    } else if (delta < 0) {
        // Any penalty resets the streak
        user.consecutiveOnTime = 0;
    }

    await user.save();

    // --- Check for consecutive bonus (5 in a row) ---
    if (user.consecutiveOnTime >= 5) {
        // Reset counter and award bonus recursively
        user.consecutiveOnTime = 0;
        await user.save();
        await updateCreditScore(userId, "consecutive_bonus", { settlementId });
        // Re-read the user to return the final score
        const updatedUser = await User.findById(userId);
        return {
            oldScore,
            newScore: updatedUser.creditScore,
            changeAmount: updatedUser.creditScore - oldScore,
            reason,
            bonusAwarded: true,
        };
    }

    return { oldScore, newScore, changeAmount: actualDelta, reason };
}

/**
 * Process a settlement and determine the correct credit score change.
 *
 * @param {String} userId       – The debtor who is settling
 * @param {Number} daysDelayed  – Days since the expense was created
 * @param {String} settlementId – The settlement document ID
 */
async function processSettlementCreditScore(userId, daysDelayed, settlementId) {
    const reason = getReasonFromDelay(daysDelayed);
    return updateCreditScore(userId, reason, { settlementId });
}

/**
 * Scan pending (un-completed) settlements for a specific user and apply
 * incremental delay penalties only for NEW tiers not previously penalized.
 *
 * This should be called periodically (e.g., daily cron or on-demand).
 * It uses `Settlement.lastPenaltyTier` to track which tier was already applied.
 *
 * @param {String} userId – The debtor to check
 * @returns {Array} Array of penalty results applied
 */
async function checkPendingDelayPenalties(userId) {
    const pendingSettlements = await Settlement.find({
        fromUserId: userId,
        status: "pending",
    });

    const results = [];
    const now = new Date();

    for (const settlement of pendingSettlements) {
        const created = new Date(settlement.createdAt);
        const daysDelayed = Math.floor((now - created) / (1000 * 60 * 60 * 24));

        // Find the highest applicable tier
        for (const { minDays, tier, reason } of DELAY_TIERS) {
            if (daysDelayed >= minDays && settlement.lastPenaltyTier < tier) {
                // Apply this penalty tier
                const result = await updateCreditScore(userId, reason, {
                    settlementId: settlement._id.toString(),
                });

                // Update the settlement's lastPenaltyTier
                settlement.lastPenaltyTier = tier;
                await settlement.save();

                results.push({
                    settlementId: settlement._id,
                    daysDelayed,
                    ...result,
                });

                // Only apply the highest applicable tier, not all
                break;
            }
        }
    }

    return results;
}

/**
 * Apply the "reminder ignored" penalty for a settlement.
 * Increments the settlement's reminderCount for audit tracking.
 *
 * @param {String} userId       – The debtor who ignored the reminder
 * @param {String} settlementId – The related settlement
 * @returns {Object} Credit score change result
 */
async function processReminderIgnored(userId, settlementId) {
    const settlement = await Settlement.findById(settlementId);
    if (!settlement) throw new Error("Settlement not found");

    // Increment reminder count for tracking
    settlement.reminderCount = (settlement.reminderCount || 0) + 1;
    await settlement.save();

    return updateCreditScore(userId, "reminder_ignored", { settlementId });
}

/**
 * Get paginated credit history for a user.
 */
async function getCreditHistory(userId, limit = 20, skip = 0) {
    const history = await CreditHistory.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await CreditHistory.countDocuments({ userId });

    return { history, total };
}

/**
 * Get the credit tier label and color.
 */
function getCreditTier(score) {
    if (score >= 800) return { label: "Excellent", color: "#22c55e", tier: "excellent" };
    if (score >= 650) return { label: "Good", color: "#3b82f6", tier: "good" };
    if (score >= 500) return { label: "Risky", color: "#f59e0b", tier: "risky" };
    return { label: "Unreliable", color: "#ef4444", tier: "unreliable" };
}

module.exports = {
    updateCreditScore,
    processSettlementCreditScore,
    checkPendingDelayPenalties,
    processReminderIgnored,
    getCreditHistory,
    getCreditTier,
    SCORE_MIN,
    SCORE_MAX,
    SCORE_MAP,
};
