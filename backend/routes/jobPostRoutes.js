const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const jobPostController = require("../controllers/jobPostController");

router.post("/", protect, jobPostController.createJobPost);
router.get("/", jobPostController.listJobPosts);
router.get("/:id", jobPostController.getJobPostById);

module.exports = router;
