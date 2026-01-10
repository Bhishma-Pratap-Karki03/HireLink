// reviewRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");

// Public routes
router.get("/company/:companyId", reviewController.getCompanyReviews);

// Protected routes (require authentication)
router.post("/company/:companyId", protect, reviewController.submitReview);
router.get(
  "/company/:companyId/my-review",
  protect,
  reviewController.getMyReview
);
router.put("/:reviewId", protect, reviewController.updateReview);
router.delete("/:reviewId", protect, reviewController.deleteReview);

module.exports = router;
