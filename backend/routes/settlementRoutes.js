const express = require("express");
const Settlement = require("../models/Settlement");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const auth = require("../middleware/authMiddleware");
const { processSettlementCreditScore } = require("../services/creditScoreService");

const router = express.Router();

/* ============================
   RECORD MANUAL SETTLEMENT
   POST /api/settlements
============================ */
router.post("/", auth, async (req, res) => {
    try {
        const { groupId, toUserId, amount, method, note } = req.body;

        // Validate required fields
        if (!groupId || !toUserId || !amount) {
            return res.status(400).json({
                success: false,
                message: "groupId, toUserId, and amount are required",
            });
        }

        const parsedAmount = parseFloat(amount);

        // Validate amount
        if (!parsedAmount || parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0",
            });
        }

        // Cannot settle with yourself
        if (req.user === toUserId || req.user.toString() === toUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Cannot settle with yourself",
            });
        }

        // Verify group exists and both users are members
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        if (!group.members.some((m) => m.toString() === req.user.toString())) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group",
            });
        }

        if (!group.members.some((m) => m.toString() === toUserId.toString())) {
            return res.status(400).json({
                success: false,
                message: "Payee is not a member of this group",
            });
        }

        // Calculate the actual balance between these two users to prevent overpayment
        const expenses = await Expense.find({ groupId });
        const completedSettlements = await Settlement.find({ groupId, status: "completed" });

        const balanceMap = new Map();
        group.members.forEach((m) => balanceMap.set(m.toString(), 0));

        // Build balances from expenses
        expenses.forEach((expense) => {
            const payerId = expense.paidBy.toString();
            if (balanceMap.has(payerId)) {
                balanceMap.set(payerId, balanceMap.get(payerId) + expense.amount);
            }
            expense.splitBetween.forEach((split) => {
                const pid = split.participant.toString();
                if (balanceMap.has(pid)) {
                    balanceMap.set(pid, balanceMap.get(pid) - split.amount);
                }
            });
        });

        // Apply existing settlements
        completedSettlements.forEach((s) => {
            const fromId = s.fromUserId.toString();
            const toId = s.toUserId.toString();
            if (balanceMap.has(fromId)) balanceMap.set(fromId, balanceMap.get(fromId) + s.amount);
            if (balanceMap.has(toId)) balanceMap.set(toId, balanceMap.get(toId) - s.amount);
        });

        // Calculate net owed: how much req.user owes toUserId
        // If req.user has negative balance and toUserId has positive, the debt flows that way
        const fromBalance = balanceMap.get(req.user.toString()) || 0;
        const toBalance = balanceMap.get(toUserId.toString()) || 0;

        // Verify the payer actually owes something and payee is owed something
        // Use a lenient check — the greedy algorithm determines the optimal flow,
        // but we allow settling as long as the basic direction makes sense
        if (fromBalance > 0.01) {
            // Payer has positive balance (is a creditor), shouldn't be paying
            return res.status(400).json({
                success: false,
                message: "You don't owe anything in this group",
            });
        }

        if (toBalance < -0.01) {
            // Payee has negative balance (is a debtor), shouldn't be receiving
            return res.status(400).json({
                success: false,
                message: "This person is not owed anything in this group",
            });
        }

        // Max settlement = min of how much payer owes and how much payee is owed
        const maxSettlement = Math.min(Math.abs(fromBalance), toBalance);

        if (parsedAmount > maxSettlement + 0.01) {
            return res.status(400).json({
                success: false,
                message: `Amount exceeds the due balance of ₹${maxSettlement.toFixed(2)}`,
            });
        }

        // Create settlement record
        const settlement = new Settlement({
            groupId,
            fromUserId: req.user,
            toUserId,
            amount: parsedAmount,
            method: method || "cash",
            note: note?.trim() || "",
            status: "completed",
            completedAt: new Date(),
        });

        await settlement.save();

        // Trigger credit score update for the payer
        let creditResult = { oldScore: 0, newScore: 0, changeAmount: 0, reason: "on_time_settlement" };
        try {
            creditResult = await processSettlementCreditScore(
                req.user,
                0, // manual settlements are considered on-time
                settlement._id.toString()
            );

            settlement.creditScoreProcessed = true;
            await settlement.save();
        } catch (creditError) {
            console.error("Credit score update failed (non-blocking):", creditError);
        }

        res.status(201).json({
            success: true,
            message: "Settlement recorded successfully!",
            settlement: {
                _id: settlement._id,
                amount: settlement.amount,
                method: settlement.method,
                note: settlement.note,
                completedAt: settlement.completedAt,
            },
            creditScore: {
                oldScore: creditResult.oldScore,
                newScore: creditResult.newScore,
                change: creditResult.changeAmount,
                reason: creditResult.reason,
            },
        });
    } catch (error) {
        console.error("Record settlement error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to record settlement",
        });
    }
});

/* ============================
   GET SETTLEMENT HISTORY FOR GROUP
   GET /api/settlements/:groupId
============================ */
router.get("/:groupId", auth, async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group || !group.members.some((m) => m.toString() === req.user.toString())) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const settlements = await Settlement.find({ groupId, status: "completed" })
            .populate("fromUserId", "name phoneNumber")
            .populate("toUserId", "name phoneNumber")
            .sort({ completedAt: -1 })
            .limit(50);

        res.json({
            success: true,
            settlements: settlements.map((s) => ({
                _id: s._id,
                from: { name: s.fromUserId?.name, id: s.fromUserId?._id },
                to: { name: s.toUserId?.name, id: s.toUserId?._id },
                amount: s.amount,
                method: s.method,
                note: s.note,
                completedAt: s.completedAt,
            })),
        });
    } catch (error) {
        console.error("Get settlement history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch settlement history",
        });
    }
});

module.exports = router;
