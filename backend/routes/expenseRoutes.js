const express = require("express");
const Expense = require("../models/Expense");
const Group = require("../models/Group");
const User = require("../models/User");
const PendingMember = require("../models/PendingMember");
const Settlement = require("../models/Settlement");
const auth = require("../middleware/authMiddleware");
const { logExpenseAdded, logExpenseDeleted } = require("../services/activityService");
const { processSettlementCreditScore } = require("../services/creditScoreService");

const router = express.Router();

/* ============================
   ADD EXPENSE WITH POLYMORPHIC SPLIT
============================ */
router.post("/", auth, async (req, res) => {
  try {
    const { groupId, title, amount, splitBetween, category, notes } = req.body;

    // Validate required fields
    if (!groupId || !title || !amount || !splitBetween) {
      return res.status(400).json({
        success: false,
        message: "Group ID, title, amount, and splitBetween are required"
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    if (!group.members.includes(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group"
      });
    }

    // Validate and process splitBetween
    let totalSplit = 0;
    let hasPendingParticipants = false;
    const processedSplits = [];

    for (const split of splitBetween) {
      const { participantId, participantType, amount: splitAmount } = split;

      if (!participantId || !participantType || splitAmount === undefined) {
        return res.status(400).json({
          success: false,
          message: "Each split must have participantId, participantType, and amount"
        });
      }

      if (splitAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Split amounts cannot be negative"
        });
      }

      // Validate participant exists
      if (participantType === "User") {
        const user = await User.findById(participantId);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: `User ${participantId} not found`
          });
        }
        // Check if user is in the group
        if (!group.members.includes(participantId)) {
          return res.status(400).json({
            success: false,
            message: `User ${user.name} is not a member of this group`
          });
        }
      } else if (participantType === "PendingMember") {
        const pendingMember = await PendingMember.findById(participantId);
        if (!pendingMember || pendingMember.status !== "invited") {
          return res.status(400).json({
            success: false,
            message: `Pending member ${participantId} not found`
          });
        }
        // Check if pending member is in the group
        if (!group.pendingMembers.includes(participantId)) {
          return res.status(400).json({
            success: false,
            message: "Pending member is not in this group"
          });
        }
        hasPendingParticipants = true;
      } else {
        return res.status(400).json({
          success: false,
          message: "participantType must be 'User' or 'PendingMember'"
        });
      }

      totalSplit += splitAmount;
      processedSplits.push({
        participant: participantId,
        participantModel: participantType,
        amount: splitAmount,
      });
    }

    // Validate total split equals amount (with small tolerance for floating point)
    if (Math.abs(totalSplit - amount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Split amounts (${totalSplit}) must equal total amount (${amount})`
      });
    }

    // Create expense
    const expense = new Expense({
      groupId,
      title: title.trim(),
      amount,
      paidBy: req.user,
      splitBetween: processedSplits,
      hasPendingParticipants,
      category: category || "other",
      splitType: req.body.splitType || "equal",
      notes: notes?.trim(),
      createdBy: req.user,
    });

    await expense.save();

    // Populate for response
    await expense.populate([
      { path: "paidBy", select: "name phoneNumber" },
      { path: "splitBetween.participant" },
    ]);

    // Log activity (get user name for description)
    const user = await User.findById(req.user).select("name");
    await logExpenseAdded(req.user, groupId, expense, user?.name || "Someone");

    res.status(201).json({
      success: true,
      message: "Expense added",
      expense
    });
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* ============================
   GET EXPENSE HISTORY
============================ */
router.get("/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { category, startDate, endDate, limit = 50 } = req.query;

    // Verify group membership
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Build query
    const query = { groupId };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate("paidBy", "name phoneNumber")
      .populate("splitBetween.participant")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Format response with proper participant names
    const formattedExpenses = expenses.map((exp) => ({
      _id: exp._id,
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      notes: exp.notes,
      paidBy: exp.paidBy,
      splitBetween: exp.splitBetween.map((split) => ({
        _id: split.participant._id,
        name: split.participantModel === "User"
          ? split.participant.name
          : split.participant.displayName,
        amount: split.amount,
        isPending: split.participantModel === "PendingMember",
      })),
      hasPendingParticipants: exp.hasPendingParticipants,
      createdAt: exp.createdAt,
      createdBy: exp.createdBy,
    }));

    res.json({
      success: true,
      expenses: formattedExpenses
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses"
    });
  }
});

/* ============================
   GET BALANCE FOR GROUP
   (Handles both User and PendingMember)
============================ */
router.get("/balance/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify membership
    const group = await Group.findById(groupId)
      .populate("members", "name phoneNumber")
      .populate("pendingMembers", "displayName phoneNumber");

    if (!group || !group.members.some((m) => m._id.toString() === req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const expenses = await Expense.find({ groupId });
    const completedSettlements = await Settlement.find({ groupId, status: "completed" });

    // Calculate balances for all participants
    const balanceMap = new Map();
    const participantInfo = new Map();

    // Initialize with group members
    group.members.forEach((m) => {
      balanceMap.set(m._id.toString(), 0);
      participantInfo.set(m._id.toString(), {
        name: m.name,
        phoneNumber: m.phoneNumber,
        type: "User",
      });
    });

    // Initialize with pending members
    group.pendingMembers.forEach((pm) => {
      balanceMap.set(pm._id.toString(), 0);
      participantInfo.set(pm._id.toString(), {
        name: pm.displayName,
        phoneNumber: pm.phoneNumber,
        type: "PendingMember",
      });
    });

    // Calculate balances from expenses
    expenses.forEach((expense) => {
      const payerId = expense.paidBy.toString();

      // Payer gets credited the full amount
      if (balanceMap.has(payerId)) {
        balanceMap.set(payerId, balanceMap.get(payerId) + expense.amount);
      }

      // Each split participant gets debited their share
      expense.splitBetween.forEach((split) => {
        const participantId = split.participant.toString();
        if (balanceMap.has(participantId)) {
          balanceMap.set(
            participantId,
            balanceMap.get(participantId) - split.amount
          );
        }
      });
    });

    // Apply completed settlements to balances
    completedSettlements.forEach((s) => {
      const fromId = s.fromUserId.toString();
      const toId = s.toUserId.toString();
      // Payer (debtor) gets balance increased (less debt)
      if (balanceMap.has(fromId)) {
        balanceMap.set(fromId, balanceMap.get(fromId) + s.amount);
      }
      // Payee (creditor) gets balance decreased (less owed to them)
      if (balanceMap.has(toId)) {
        balanceMap.set(toId, balanceMap.get(toId) - s.amount);
      }
    });

    // Format response
    const activeBalances = [];
    const pendingBalances = [];

    balanceMap.forEach((balance, participantId) => {
      const info = participantInfo.get(participantId);
      const entry = {
        participantId,
        name: info.name,
        phoneNumber: info.phoneNumber,
        balance: Number(balance.toFixed(2)),
        status: balance > 0 ? "owed" : balance < 0 ? "owes" : "settled",
      };

      if (info.type === "User") {
        activeBalances.push(entry);
      } else {
        pendingBalances.push({
          ...entry,
          note: "Balance will be confirmed when member registers",
        });
      }
    });

    res.json({
      success: true,
      groupId,
      currency: group.currency,
      balances: {
        active: activeBalances,
        pending: pendingBalances,
      },
      summary: {
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        pendingAmount: pendingBalances.reduce(
          (sum, b) => sum + Math.abs(b.balance),
          0
        ),
      },
    });
  } catch (error) {
    console.error("Get balance error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* ============================
   GET SETTLEMENT
   (Only for active users, pending shown separately)
============================ */
router.get("/settlement/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify membership
    const group = await Group.findById(groupId)
      .populate("members", "name phoneNumber")
      .populate("pendingMembers", "displayName phoneNumber");

    if (!group || !group.members.some((m) => m._id.toString() === req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const expenses = await Expense.find({ groupId });
    const completedSettlements = await Settlement.find({ groupId, status: "completed" });

    // Calculate balances (same logic as balance route)
    const balanceMap = new Map();
    const participantInfo = new Map();

    group.members.forEach((m) => {
      balanceMap.set(m._id.toString(), 0);
      participantInfo.set(m._id.toString(), {
        name: m.name,
        type: "User",
      });
    });

    group.pendingMembers.forEach((pm) => {
      balanceMap.set(pm._id.toString(), 0);
      participantInfo.set(pm._id.toString(), {
        name: pm.displayName,
        type: "PendingMember",
      });
    });

    expenses.forEach((expense) => {
      const payerId = expense.paidBy.toString();
      if (balanceMap.has(payerId)) {
        balanceMap.set(payerId, balanceMap.get(payerId) + expense.amount);
      }
      expense.splitBetween.forEach((split) => {
        const participantId = split.participant.toString();
        if (balanceMap.has(participantId)) {
          balanceMap.set(
            participantId,
            balanceMap.get(participantId) - split.amount
          );
        }
      });
    });

    // Apply completed settlements to balances
    completedSettlements.forEach((s) => {
      const fromId = s.fromUserId.toString();
      const toId = s.toUserId.toString();
      if (balanceMap.has(fromId)) {
        balanceMap.set(fromId, balanceMap.get(fromId) + s.amount);
      }
      if (balanceMap.has(toId)) {
        balanceMap.set(toId, balanceMap.get(toId) - s.amount);
      }
    });

    // Separate active and pending users
    const activeCreditors = [];
    const activeDebtors = [];
    const pendingSettlements = [];

    balanceMap.forEach((balance, participantId) => {
      const info = participantInfo.get(participantId);
      const roundedBalance = Number(balance.toFixed(2));

      if (info.type === "PendingMember" && roundedBalance !== 0) {
        pendingSettlements.push({
          participantId,
          name: info.name,
          amount: Math.abs(roundedBalance),
          direction: roundedBalance > 0 ? "to_receive" : "to_pay",
          canSettle: false,
          reason: `Waiting for ${info.name} to register`,
        });
      } else if (info.type === "User") {
        if (roundedBalance > 0.01) {
          activeCreditors.push({
            participantId,
            name: info.name,
            amount: roundedBalance
          });
        } else if (roundedBalance < -0.01) {
          activeDebtors.push({
            participantId,
            name: info.name,
            amount: Math.abs(roundedBalance)
          });
        }
      }
    });

    // Calculate settlements using greedy algorithm
    const readySettlements = [];
    let i = 0, j = 0;

    // Sort for consistent settlement order
    activeDebtors.sort((a, b) => b.amount - a.amount);
    activeCreditors.sort((a, b) => b.amount - a.amount);

    while (i < activeDebtors.length && j < activeCreditors.length) {
      const debtor = activeDebtors[i];
      const creditor = activeCreditors[j];
      const settleAmount = Math.min(debtor.amount, creditor.amount);

      if (settleAmount > 0.01) {
        readySettlements.push({
          from: {
            participantId: debtor.participantId,
            name: debtor.name
          },
          to: {
            participantId: creditor.participantId,
            name: creditor.name
          },
          amount: Number(settleAmount.toFixed(2)),
          canSettle: true,
        });
      }

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    res.json({
      success: true,
      settlements: {
        ready: readySettlements,
        pending: pendingSettlements,
      },
    });
  } catch (error) {
    console.error("Get settlement error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* ============================
   DELETE EXPENSE
============================ */
router.delete("/:expenseId", auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    // Only creator or payer can delete
    if (
      expense.paidBy.toString() !== req.user &&
      expense.createdBy?.toString() !== req.user
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the payer or creator can delete this expense"
      });
    }

    await Expense.findByIdAndDelete(req.params.expenseId);

    res.json({
      success: true,
      message: "Expense deleted"
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expense"
    });
  }
});

/* ============================
   RECORD SETTLEMENT
   Creates a Settlement record and triggers credit score update
============================ */
router.post("/record-settlement", auth, async (req, res) => {
  try {
    const { groupId, toUserId, amount, expenseId } = req.body;

    // Validate required fields
    if (!groupId || !toUserId || !amount) {
      return res.status(400).json({
        success: false,
        message: "groupId, toUserId, and amount are required",
      });
    }

    if (amount <= 0) {
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

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Calculate days delayed (from expense creation if provided, else 0)
    let daysDelayed = 0;
    if (expenseId) {
      const expense = await Expense.findById(expenseId);
      if (expense) {
        const now = new Date();
        const created = new Date(expense.createdAt);
        daysDelayed = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      }
    }

    // Create settlement record
    const settlement = new Settlement({
      groupId,
      fromUserId: req.user,
      toUserId,
      amount,
      expenseId: expenseId || null,
      status: "completed",
      completedAt: new Date(),
    });

    await settlement.save();

    // Trigger credit score update for the payer (debtor)
    const creditResult = await processSettlementCreditScore(
      req.user,
      daysDelayed,
      settlement._id.toString()
    );

    // Mark as processed
    settlement.creditScoreProcessed = true;
    await settlement.save();

    res.status(201).json({
      success: true,
      message: "Settlement recorded",
      settlement: {
        _id: settlement._id,
        amount: settlement.amount,
        completedAt: settlement.completedAt,
      },
      creditScore: {
        oldScore: creditResult.oldScore,
        newScore: creditResult.newScore,
        change: creditResult.changeAmount,
        reason: creditResult.reason,
        bonusAwarded: creditResult.bonusAwarded || false,
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

module.exports = router;
