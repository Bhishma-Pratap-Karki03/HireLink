const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  submitContactMessage,
  listContactMessagesForAdmin,
  markContactMessageAsRead,
  deleteContactMessageForAdmin,
} = require("../controllers/contactController");

// Public: submit a contact-us message from website visitors/users.
router.post("/", submitContactMessage);
// Admin: list all contact messages with filters and pagination.
router.get("/admin/messages", protect, listContactMessagesForAdmin);
// Admin: mark one contact message as read.
router.patch("/admin/messages/:messageId/read", protect, markContactMessageAsRead);
// Admin: delete one contact message.
router.delete("/admin/messages/:messageId", protect, deleteContactMessageForAdmin);

module.exports = router;
