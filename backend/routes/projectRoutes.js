// projectRoutes.js
const express = require("express");
const router = express.Router();

// Import the project controller
const projectController = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");

// Import shared upload utilities
const {
  createImageUpload,
  handleMulterError,
  checkFileValidation,
} = require("../utils/uploadConfig");

// Configure multer for file uploads (project cover images)
const upload = createImageUpload("projects", 5);

// Add a new project to logged-in user's profile.
// Supports optional cover image upload with field name `coverImage`.
router.post(
  "/",
  protect,
  upload.single("coverImage"),
  handleMulterError,
  checkFileValidation,
  projectController.addProject,
);

// Update an existing project by projectId for logged-in user.
// Supports optional new cover image upload with field name `coverImage`.
router.put(
  "/:projectId",
  protect,
  upload.single("coverImage"),
  handleMulterError,
  checkFileValidation,
  projectController.updateProject,
);

// Delete a project by projectId from logged-in user's profile.
router.delete("/:projectId", protect, projectController.removeProject);

module.exports = router;
