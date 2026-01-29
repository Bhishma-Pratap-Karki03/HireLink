// reviewRoutes.js - Updated with recruiter management routes
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");

// Public routes
router.get("/company/:companyId", reviewController.getCompanyReviews);

// Protected routes for candidates/users
router.post("/company/:companyId", protect, reviewController.submitReview);
router.get(
  "/company/:companyId/my-review",
  protect,
  reviewController.getMyReview,
);
router.put("/:reviewId", protect, reviewController.updateReview);
router.delete("/:reviewId", protect, reviewController.deleteReview);

// Protected routes for recruiters to manage their company reviews
router.get(
  "/company/:companyId/manage",
  protect,
  reviewController.getCompanyReviewsForRecruiter,
);
router.put("/:reviewId/status", protect, reviewController.updateReviewStatus);
router.delete(
  "/:reviewId/manage",
  protect,
  reviewController.deleteReviewByRecruiter,
);

module.exports = router;
