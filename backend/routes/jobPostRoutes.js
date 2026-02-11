const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const jobPostController = require("../controllers/jobPostController");

router.post("/", protect, jobPostController.createJobPost);
router.get("/", jobPostController.listJobPosts);
router.get("/recruiter/list", protect, jobPostController.listRecruiterJobPosts);
router.get("/:id", jobPostController.getJobPostById);
router.put("/:id", protect, jobPostController.updateJobPost);

module.exports = router;
