const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");
const { optionalProtect } = require("../middleware/authMiddleware");

// Get all recruiters for the public employers listing page.
router.get("/", employerController.getAllRecruiters);
// Get one recruiter profile by id; works for both guest and logged-in user.
router.get("/:id", optionalProtect, employerController.getRecruiterById);

module.exports = router;
