// Saved Job Routes - defines API endpoints for candidate saved jobs

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const savedJobController = require("../controllers/savedJobController");

const router = express.Router();

// GET /api/saved-jobs/status/:jobId - Check if current candidate saved a specific job
router.get("/status/:jobId", protect, savedJobController.checkSaved);

// GET /api/saved-jobs/mine - Get all saved jobs of current candidate
router.get("/mine", protect, savedJobController.listSaved);

// POST /api/saved-jobs/toggle - Save or unsave a job for current candidate
router.post("/toggle", protect, savedJobController.toggleSaveJob);

module.exports = router;
