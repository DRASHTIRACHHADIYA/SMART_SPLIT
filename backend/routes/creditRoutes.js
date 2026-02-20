const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const {
    getCreditHistory,
    getCreditTier,
    processReminderIgnored,
    checkPendingDelayPenalties,
} = require("../services/creditScoreService");

const router = express.Router();

/* ============================
   GET CURRENT USER'S CREDIT SCORE
============================ */
router.get("/score", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select("creditScore consecutiveOnTime");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const tier = getCreditTier(user.creditScore);

        res.json({
            success: true,
            creditScore: user.creditScore,
            consecutiveOnTime: user.consecutiveOnTime,
            tier,
        });
    } catch (error) {
        console.error("Get credit score error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch credit score" });
    }
});

/* ============================
   GET CREDIT HISTORY (paginated)
============================ */
router.get("/history", auth, async (req, res) => {
    try {
        const { limit = 20, skip = 0 } = req.query;

        const { history, total } = await getCreditHistory(
            req.user,
            parseInt(limit),
            parseInt(skip)
        );

        res.json({
            success: true,
            history,
            total,
            hasMore: parseInt(skip) + history.length < total,
        });
    } catch (error) {
        console.error("Get credit history error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch credit history" });
    }
});

/* ============================
   REMINDER IGNORED — Apply −10 penalty
   Body: { settlementId }
============================ */
router.post("/reminder-ignored", auth, async (req, res) => {
    try {
        const { settlementId } = req.body;

        if (!settlementId) {
            return res.status(400).json({
                success: false,
                message: "settlementId is required",
            });
        }

        const result = await processReminderIgnored(req.user, settlementId);

        res.json({
            success: true,
            message: "Reminder-ignored penalty applied",
            creditScore: {
                oldScore: result.oldScore,
                newScore: result.newScore,
                change: result.changeAmount,
                reason: result.reason,
                duplicate: result.duplicate || false,
            },
        });
    } catch (error) {
        console.error("Reminder ignored error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to process reminder penalty",
        });
    }
});

/* ============================
   CHECK DELAY PENALTIES — Scan pending settlements
   for delay threshold crossings (3d / 7d / 15d)
============================ */
router.post("/check-delays", auth, async (req, res) => {
    try {
        const results = await checkPendingDelayPenalties(req.user);

        res.json({
            success: true,
            message: `Checked pending settlements. ${results.length} penalty/penalties applied.`,
            penalties: results,
        });
    } catch (error) {
        console.error("Check delays error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to check delay penalties",
        });
    }
});

module.exports = router;

