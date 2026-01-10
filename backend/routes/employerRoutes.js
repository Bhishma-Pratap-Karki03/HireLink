// employerRoutes.js
const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");

// Public routes for employers page
router.get("/", employerController.getAllRecruiters);
router.get("/:id", employerController.getRecruiterById);

module.exports = router;
