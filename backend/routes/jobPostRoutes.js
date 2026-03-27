const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const jobPostController = require("../controllers/jobPostController");

// Recruiter creates a new job post.
router.post("/", protect, jobPostController.createJobPost);
// Public job listing with filters, sorting, and pagination.
router.get("/", jobPostController.listJobPosts);
// Public summary of top job categories/titles.
router.get("/categories-summary", jobPostController.getJobCategoriesSummary);
// Public summary of top hiring companies and vacancies.
router.get("/companies-summary", jobPostController.getCompanyVacancySummary);
// Recruiter gets own posted jobs list.
router.get("/recruiter/list", protect, jobPostController.listRecruiterJobPosts);
// Admin gets all jobs list for management page.
router.get("/admin/list", protect, jobPostController.listJobPostsForAdmin);
// Admin activates/deactivates a job post.
router.patch("/admin/:id/status", protect, jobPostController.updateJobStatusByAdmin);
// Public get single job details by job id.
router.get("/:id", jobPostController.getJobPostById);
// Recruiter updates own job post by id.
router.put("/:id", protect, jobPostController.updateJobPost);

module.exports = router;
