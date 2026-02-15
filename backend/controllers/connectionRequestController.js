const mongoose = require("mongoose");
const ConnectionRequest = require("../models/connectionRequestModel");
const User = require("../models/userModel");

const ALLOWED_ROLES = new Set(["candidate", "recruiter"]);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const isConnectableRole = async (userId) => {
  const user = await User.findById(userId).select("role").lean();
  return !!user && ALLOWED_ROLES.has(user.role);
};

exports.sendConnectionRequest = async (req, res, next) => {
  try {
    const requesterId = req.user?.id;
    const { recipientId } = req.body;

    if (!requesterId || !isValidObjectId(requesterId)) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!recipientId || !isValidObjectId(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "Valid recipientId is required",
      });
    }

    if (requesterId === recipientId) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect with yourself",
      });
    }

    const [requesterAllowed, recipientAllowed] = await Promise.all([
      isConnectableRole(requesterId),
      isConnectableRole(recipientId),
    ]);

    if (!requesterAllowed || !recipientAllowed) {
      return res.status(403).json({
        success: false,
        message: "Only candidates and recruiters can connect",
      });
    }

    const existing = await ConnectionRequest.findOne({
      requester: requesterId,
      recipient: recipientId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Connection status already exists",
        status: existing.status,
      });
    }

    const reciprocal = await ConnectionRequest.findOne({
      requester: recipientId,
      recipient: requesterId,
    });

    if (reciprocal && reciprocal.status === "pending") {
      reciprocal.status = "accepted";
      reciprocal.respondedAt = new Date();
      await reciprocal.save();

      return res.status(200).json({
        success: true,
        message: "Connection request accepted",
        status: "accepted",
      });
    }

    const request = await ConnectionRequest.create({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Connection request sent",
      status: request.status,
    });
  } catch (error) {
    next(error);
  }
};

exports.respondConnectionRequest = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { requesterId, action } = req.body;

    if (!requesterId || !isValidObjectId(requesterId)) {
      return res.status(400).json({
        success: false,
        message: "Valid requesterId is required",
      });
    }

    if (!["accept", "reject", "delete"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "action must be accept, reject or delete",
      });
    }

    const request = await ConnectionRequest.findOne({
      requester: requesterId,
      recipient: userId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Pending request not found",
      });
    }

    if (action === "accept") {
      request.status = "accepted";
      request.respondedAt = new Date();
      await request.save();
    } else {
      await request.deleteOne();
    }

    return res.status(200).json({
      success: true,
      message:
        action === "accept"
          ? "Connection request accepted"
          : "Connection request removed",
      status: action === "accept" ? "accepted" : "none",
    });
  } catch (error) {
    next(error);
  }
};

exports.getConnectionStatuses = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const targetIdsRaw = (req.query.targetIds || "").toString();
    const targetIds = targetIdsRaw
      .split(",")
      .map((id) => id.trim())
      .filter((id) => isValidObjectId(id) && id !== userId);

    if (targetIds.length === 0) {
      return res.status(200).json({ success: true, statuses: {} });
    }

    const requests = await ConnectionRequest.find({
      $or: [
        { requester: userId, recipient: { $in: targetIds } },
        { recipient: userId, requester: { $in: targetIds } },
      ],
    })
      .select("requester recipient status")
      .lean();

    const statuses = {};
    targetIds.forEach((id) => {
      statuses[id] = "none";
    });

    requests.forEach((item) => {
      const requesterId = item.requester.toString();
      const recipientId = item.recipient.toString();
      const otherUserId = requesterId === userId ? recipientId : requesterId;

      if (!targetIds.includes(otherUserId)) {
        return;
      }

      if (item.status === "accepted") {
        statuses[otherUserId] = "friend";
      } else if (item.status === "pending") {
        statuses[otherUserId] = "pending";
      } else {
        statuses[otherUserId] = "none";
      }
    });

    return res.status(200).json({
      success: true,
      statuses,
    });
  } catch (error) {
    next(error);
  }
};

exports.getIncomingConnectionRequests = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const requests = await ConnectionRequest.find({
      recipient: userId,
      status: "pending",
    })
      .populate("requester", "fullName email role profilePicture currentJobTitle")
      .sort({ createdAt: -1 })
      .lean();

    const mapped = requests
      .filter((request) => request.requester)
      .map((request) => ({
        id: request._id,
        requester: {
          id: request.requester._id,
          fullName: request.requester.fullName || "User",
          email: request.requester.email || "",
          role: request.requester.role || "",
          profilePicture: request.requester.profilePicture || "",
          currentJobTitle: request.requester.currentJobTitle || "",
        },
        createdAt: request.createdAt,
      }));

    return res.status(200).json({
      success: true,
      requests: mapped,
    });
  } catch (error) {
    next(error);
  }
};

exports.getConnectedUsers = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ requester: userId }, { recipient: userId }],
    })
      .populate("requester", "fullName email role profilePicture currentJobTitle")
      .populate("recipient", "fullName email role profilePicture currentJobTitle")
      .sort({ updatedAt: -1 })
      .lean();

    const friends = connections
      .map((item) => {
        const requesterId = item.requester?._id?.toString();
        const recipientId = item.recipient?._id?.toString();
        const otherUser =
          requesterId === userId ? item.recipient : item.requester;

        if (!otherUser) return null;

        return {
          id: otherUser._id,
          fullName: otherUser.fullName || "User",
          email: otherUser.email || "",
          role: otherUser.role || "",
          profilePicture: otherUser.profilePicture || "",
          currentJobTitle: otherUser.currentJobTitle || "",
          connectedAt: item.respondedAt || item.updatedAt || item.createdAt,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      friends,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeConnection = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { targetUserId } = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!targetUserId || !isValidObjectId(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Valid targetUserId is required",
      });
    }

    const deleted = await ConnectionRequest.findOneAndDelete({
      status: "accepted",
      $or: [
        { requester: userId, recipient: targetUserId },
        { requester: targetUserId, recipient: userId },
      ],
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Connection removed",
    });
  } catch (error) {
    next(error);
  }
};
