// Review Routes - defines API endpoints for company and project reviews
const express = require("express");
const router = express.Router();
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");

// GET /api/reviews/company/:companyId - Get public company reviews
router.get("/company/:companyId", reviewController.getCompanyReviews);

// GET /api/reviews/project/:candidateId/:projectId - Get published project reviews (public/optional auth)
router.get(
  "/project/:candidateId/:projectId",
  optionalProtect,
  reviewController.getProjectReviews,
);

// GET /api/reviews/project/:candidateId/:projectId/manage - Get all project reviews for candidate management
router.get(
  "/project/:candidateId/:projectId/manage",
  protect,
  reviewController.getProjectReviewsForCandidate,
);

// POST /api/reviews/company/:companyId - Submit company review
router.post("/company/:companyId", protect, reviewController.submitReview);

// GET /api/reviews/company/:companyId/my-review - Get current user's review for a company
router.get(
  "/company/:companyId/my-review",
  protect,
  reviewController.getMyReview,
);

// POST /api/reviews/project/:candidateId/:projectId - Submit review for candidate project
router.post(
  "/project/:candidateId/:projectId",
  protect,
  reviewController.submitProjectReview,
);

// GET /api/reviews/project/:candidateId/:projectId/my-review - Get current user's review for a project
router.get(
  "/project/:candidateId/:projectId/my-review",
  protect,
  reviewController.getMyProjectReview,
);

// PUT /api/reviews/:reviewId - Update own review
router.put("/:reviewId", protect, reviewController.updateReview);

// DELETE /api/reviews/:reviewId - Delete own review
router.delete("/:reviewId", protect, reviewController.deleteReview);

// GET /api/reviews/company/:companyId/manage - Recruiter management list (all/published/hidden)
router.get(
  "/company/:companyId/manage",
  protect,
  reviewController.getCompanyReviewsForRecruiter,
);

// PUT /api/reviews/:reviewId/status - Recruiter/candidate review visibility toggle
router.put("/:reviewId/status", protect, reviewController.updateReviewStatus);

// DELETE /api/reviews/:reviewId/manage - Recruiter/candidate managed delete
router.delete(
  "/:reviewId/manage",
  protect,
  reviewController.deleteReviewByRecruiter,
);

module.exports = router;
