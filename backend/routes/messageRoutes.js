const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getConversations,
  getConversationMessages,
  sendMessage,
} = require("../controllers/messageController");

// Get conversation sidebar list (recent chats + accepted friends).
router.get("/conversations", protect, getConversations);
// Get all messages with one user and mark incoming unread messages as read.
router.get("/conversation/:userId", protect, getConversationMessages);
// Send a new message to another user.
router.post("/send", protect, sendMessage);

module.exports = router;
