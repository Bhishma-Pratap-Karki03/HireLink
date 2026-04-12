const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendConnectionRequest,
  respondConnectionRequest,
  getConnectionStatuses,
  getIncomingConnectionRequests,
  getConnectedUsers,
  removeConnection,
  getMutualConnections,
  getRecentConnectionNotifications,
  markConnectionNotificationRead,
  deleteConnectionNotification,
} = require("../controllers/connectionRequestController");

// Send a new connection request to another user.
router.post("/request", protect, sendConnectionRequest);
// Accept or reject a received connection request.
router.post("/respond", protect, respondConnectionRequest);
// Get connection status for multiple users (used for button states).
router.get("/statuses", protect, getConnectionStatuses);
// Get all pending incoming connection requests.
router.get("/incoming", protect, getIncomingConnectionRequests);
// Get users connected with the logged-in user.
router.get("/friends", protect, getConnectedUsers);
// Get mutual connections between logged-in user and target user.
router.get("/mutual/:targetUserId", protect, getMutualConnections);
// Get recent connection-related notification items.
router.get("/notifications", protect, getRecentConnectionNotifications);
// Mark one or more connection notifications as read.
router.post("/notifications/read", protect, markConnectionNotificationRead);
// Delete one or more connection notifications.
router.post("/notifications/delete", protect, deleteConnectionNotification);
// Remove an existing connection between two users.
router.post("/remove", protect, removeConnection);

module.exports = router;
