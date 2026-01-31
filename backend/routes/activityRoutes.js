const express = require("express");
const Activity = require("../models/Activity");
const Group = require("../models/Group");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================
   GET GROUP ACTIVITY TIMELINE
============================ */
router.get("/:groupId", auth, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Verify group membership
        const group = await Group.findById(groupId);
        if (!group || !group.members.includes(req.user)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const activities = await Activity.find({ groupId })
            .populate("userId", "name phoneNumber")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Activity.countDocuments({ groupId });

        // Format activities for frontend
        const formattedActivities = activities.map((activity) => ({
            _id: activity._id,
            action: activity.action,
            description: activity.description,
            user: activity.userId
                ? {
                    _id: activity.userId._id,
                    name: activity.userId.name,
                }
                : null,
            metadata: activity.metadata,
            createdAt: activity.createdAt,
        }));

        res.json({
            success: true,
            activities: formattedActivities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Get activity error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
        });
    }
});

module.exports = router;
