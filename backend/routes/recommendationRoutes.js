const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const recommendationController = require("../controllers/recommendationController");

const router = express.Router();

// Generate fresh AI job recommendations for the logged-in candidate.
router.get("/me", protect, recommendationController.getMyRecommendations);
// Get recent recommendation run history (summary list).
router.get("/history", protect, recommendationController.getRecommendationHistory);
// Get one recommendation run detail by history id.
router.get(
  "/history/:id",
  protect,
  recommendationController.getRecommendationHistoryById,
);
// Delete one recommendation history record by id.
router.delete(
  "/history/:id",
  protect,
  recommendationController.deleteRecommendationHistory,
);

module.exports = router;
