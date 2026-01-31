const express = require("express");
const Group = require("../models/Group");
const User = require("../models/User");
const PendingMember = require("../models/PendingMember");
const auth = require("../middleware/authMiddleware");
const { normalizePhoneNumber } = require("../utils/phoneUtils");
const { sendInvitationSMS } = require("../services/smsService");
const { logGroupCreated, logMemberAdded, logMemberInvited } = require("../services/activityService");

const router = express.Router();

/* =========================
   CREATE GROUP
========================= */
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, currency } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Group name must be at least 2 characters"
      });
    }

    const group = new Group({
      name: name.trim(),
      description: description?.trim(),
      currency: currency || "INR",
      members: [req.user],
      admins: [req.user],
      createdBy: req.user,
    });

    await group.save();

    // Log activity
    await logGroupCreated(req.user, group);

    res.status(201).json({
      success: true,
      group
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group"
    });
  }
});

/* =========================
   GET GROUPS OF LOGGED-IN USER
========================= */
router.get("/", auth, async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user,
      isActive: true,
    })
      .populate("members", "name email phoneNumber")
      .populate("pendingMembers", "displayName phoneNumber status")
      .populate("createdBy", "name")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      groups
    });
  } catch (error) {
    console.error("Fetch groups error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups"
    });
  }
});

/* =========================
   GET SINGLE GROUP WITH MEMBERS
========================= */
router.get("/:groupId", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("members", "name email phoneNumber")
      .populate("pendingMembers", "displayName phoneNumber status invitationCount lastInvitationAt")
      .populate("createdBy", "name")
      .populate("admins", "name");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m._id.toString() === req.user.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group"
      });
    }

    res.json({
      success: true,
      group
    });
  } catch (error) {
    console.error("Fetch group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group"
    });
  }
});

/* =========================
   ADD MEMBER BY PHONE NUMBER
   ✅ CORE FEATURE
========================= */
router.post("/:groupId/add-member", auth, async (req, res) => {
  try {
    const { phoneNumber, displayName, countryCode = "IN" } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber, countryCode);
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format"
      });
    }

    // Get group
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Check if requester is a member
    if (!group.members.includes(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group"
      });
    }

    // Get requester info for SMS
    const requester = await User.findById(req.user).select("name phoneNumber");

    // Prevent self-addition
    if (normalizedPhone === requester.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Cannot add yourself to the group"
      });
    }

    // Check if user exists with this phone
    const existingUser = await User.findOne({
      phoneNumber: normalizedPhone,
      accountStatus: "active"
    });

    if (existingUser) {
      // Check if already a member
      if (group.members.includes(existingUser._id)) {
        return res.status(400).json({
          success: false,
          message: "User is already a member of this group"
        });
      }

      // Add existing user to group
      group.members.push(existingUser._id);
      await group.save();

      // Log activity
      await logMemberAdded(req.user, group._id, existingUser, group.name);

      return res.json({
        success: true,
        memberType: "active",
        member: {
          _id: existingUser._id,
          name: existingUser.name,
          phoneNumber: existingUser.phoneNumber,
          email: existingUser.email,
        },
        message: `${existingUser.name} added to the group`,
      });
    }

    // User doesn't exist - check for existing pending member
    let pendingMember = await PendingMember.findOne({
      phoneNumber: normalizedPhone,
      status: "invited",
    });

    if (pendingMember) {
      // Check if already pending in this group
      const alreadyInGroup = pendingMember.groupMemberships.some(
        (gm) => gm.groupId.toString() === group._id.toString()
      );

      if (alreadyInGroup) {
        return res.status(400).json({
          success: false,
          message: "This phone number is already invited to this group"
        });
      }

      // Add this group to existing pending member
      pendingMember.groupMemberships.push({
        groupId: group._id,
        addedAt: new Date(),
        addedBy: req.user,
      });
      await pendingMember.save();
    } else {
      // Create new pending member
      pendingMember = new PendingMember({
        phoneNumber: normalizedPhone,
        displayName: displayName?.trim() || "Unknown",
        addedBy: req.user,
        groupMemberships: [{
          groupId: group._id,
          addedAt: new Date(),
          addedBy: req.user,
        }],
        invitationHistory: [{
          sentAt: new Date(),
          sentBy: req.user,
          deliveryStatus: "sent",
        }],
        lastInvitationAt: new Date(),
        invitationCount: 1,
      });
      await pendingMember.save();
    }

    // Add to group's pending members
    if (!group.pendingMembers.includes(pendingMember._id)) {
      group.pendingMembers.push(pendingMember._id);
      await group.save();
    }

    // Send invitation SMS
    await sendInvitationSMS(normalizedPhone, requester.name, group.name);

    // Log activity
    await logMemberInvited(req.user, group._id, pendingMember, group.name);

    res.json({
      success: true,
      memberType: "pending",
      member: {
        _id: pendingMember._id,
        displayName: pendingMember.displayName,
        phoneNumber: pendingMember.phoneNumber,
        invitationSent: true,
      },
      message: `Invitation sent to ${normalizedPhone}`,
    });
  } catch (error) {
    console.error("Add member error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already in the system"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add member"
    });
  }
});

/* =========================
   GET GROUP MEMBERS (Active + Pending)
========================= */
router.get("/:groupId/members", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("members", "name email phoneNumber accountStatus")
      .populate("pendingMembers", "displayName phoneNumber status invitationCount lastInvitationAt");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Check membership
    const isMember = group.members.some(
      (m) => m._id.toString() === req.user.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Not a member of this group"
      });
    }

    // Filter active pending members only
    const activePending = group.pendingMembers.filter(
      (pm) => pm.status === "invited"
    );

    res.json({
      success: true,
      groupId: group._id,
      members: {
        active: group.members.map((m) => ({
          _id: m._id,
          name: m.name,
          phoneNumber: m.phoneNumber,
          email: m.email,
          status: "active",
        })),
        pending: activePending.map((pm) => ({
          _id: pm._id,
          displayName: pm.displayName,
          phoneNumber: pm.phoneNumber,
          status: "pending",
          invitationCount: pm.invitationCount,
          lastInvitationAt: pm.lastInvitationAt,
        })),
      },
      totalCount: group.members.length + activePending.length,
    });
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch members"
    });
  }
});

/* =========================
   RESEND INVITATION
========================= */
router.post("/:groupId/resend-invitation", auth, async (req, res) => {
  try {
    const { pendingMemberId } = req.body;

    if (!pendingMemberId) {
      return res.status(400).json({
        success: false,
        message: "Pending member ID is required"
      });
    }

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Check if user is a member
    if (!group.members.includes(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not a member of this group"
      });
    }

    // Get pending member
    const pendingMember = await PendingMember.findById(pendingMemberId);
    if (!pendingMember || pendingMember.status !== "invited") {
      return res.status(404).json({
        success: false,
        message: "Pending member not found"
      });
    }

    // Rate limit: max 3 invitations per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentInvitations = pendingMember.invitationHistory.filter(
      (inv) => inv.sentAt > oneDayAgo
    );

    if (recentInvitations.length >= 3) {
      return res.status(429).json({
        success: false,
        message: "Maximum 3 invitations per day. Try again tomorrow."
      });
    }

    // Get requester info
    const requester = await User.findById(req.user).select("name");

    // Update invitation history
    pendingMember.invitationHistory.push({
      sentAt: new Date(),
      sentBy: req.user,
      deliveryStatus: "sent",
    });
    pendingMember.lastInvitationAt = new Date();
    pendingMember.invitationCount += 1;
    await pendingMember.save();

    // Send SMS
    await sendInvitationSMS(pendingMember.phoneNumber, requester.name, group.name);

    res.json({
      success: true,
      message: "Invitation resent",
      invitationCount: pendingMember.invitationCount,
      lastSentAt: pendingMember.lastInvitationAt,
    });
  } catch (error) {
    console.error("Resend invitation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend invitation"
    });
  }
});

/* =========================
   REMOVE PENDING MEMBER
========================= */
router.delete("/:groupId/pending-member/:pendingMemberId", auth, async (req, res) => {
  try {
    const { groupId, pendingMemberId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Check if user is admin or creator
    const isAdmin =
      group.admins.includes(req.user) ||
      group.createdBy.toString() === req.user.toString();

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only group admins can remove pending members"
      });
    }

    // Remove from group
    group.pendingMembers = group.pendingMembers.filter(
      (pm) => pm.toString() !== pendingMemberId
    );
    await group.save();

    // Update pending member
    const pendingMember = await PendingMember.findById(pendingMemberId);
    if (pendingMember) {
      // Remove this group from memberships
      pendingMember.groupMemberships = pendingMember.groupMemberships.filter(
        (gm) => gm.groupId.toString() !== groupId
      );

      // If no more groups, mark as removed
      if (pendingMember.groupMemberships.length === 0) {
        pendingMember.status = "removed";
      }
      await pendingMember.save();
    }

    res.json({
      success: true,
      message: "Pending member removed from group",
    });
  } catch (error) {
    console.error("Remove pending member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove pending member"
    });
  }
});

/* =========================
   LEGACY: ADD MEMBER BY USER ID
========================= */
router.post("/:groupId/add-member-by-id", auth, async (req, res) => {
  const { userId } = req.body;

  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ msg: "User already in group" });
    }

    group.members.push(userId);
    await group.save();

    res.json({ message: "Member added successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to add member" });
  }
});

/* =========================
   LEGACY: ADD MEMBER BY EMAIL
========================= */
router.post("/:groupId/add-member-by-email", auth, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ msg: "User not found with this email" });
    }

    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    if (group.members.includes(user._id)) {
      return res.status(400).json({ msg: "User already in group" });
    }

    group.members.push(user._id);
    await group.save();

    res.json({ message: "Member added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to add member by email" });
  }
});

module.exports = router;
