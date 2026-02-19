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
} = require("../controllers/connectionRequestController");

router.post("/request", protect, sendConnectionRequest);
router.post("/respond", protect, respondConnectionRequest);
router.get("/statuses", protect, getConnectionStatuses);
router.get("/incoming", protect, getIncomingConnectionRequests);
router.get("/friends", protect, getConnectedUsers);
router.get("/mutual/:targetUserId", protect, getMutualConnections);
router.post("/remove", protect, removeConnection);

module.exports = router;
