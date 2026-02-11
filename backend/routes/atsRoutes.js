const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { scanJobApplications, getAtsResultsByJob } = require("../controllers/atsController");

const router = express.Router();

router.post("/scan/:jobId", protect, scanJobApplications);
router.get("/results/:jobId", protect, getAtsResultsByJob);

module.exports = router;
