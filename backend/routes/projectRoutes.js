// projectRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import the project controller
const projectController = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");

// Configure multer for file uploads (project cover images)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create temp folder for uploads
    const uploadDir = path.join(__dirname, "../public/uploads/projects/temp");

    // Create the temp directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with the original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `project-${uniqueSuffix}${ext}`);
  },
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.fileValidationError =
      "Only image files are allowed (JPG, JPEG, PNG, WEBP, GIF)";
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

// Error handling middleware for multer uploads
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  if (error && error.message) {
    // Handle fileFilter errors
    if (error.message.includes("Only image files are allowed")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  next(error);
};

// Project management routes
// POST /api/project - Add new project
router.post(
  "/",
  protect,
  upload.single("coverImage"),
  handleMulterError,
  (req, res, next) => {
    // Handle file validation errors
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        message: req.fileValidationError,
      });
    }
    next();
  },
  projectController.addProject
);

// PUT /api/project/:projectId - Update project
router.put(
  "/:projectId",
  protect,
  upload.single("coverImage"),
  handleMulterError,
  (req, res, next) => {
    // Handle file validation errors
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        message: req.fileValidationError,
      });
    }
    next();
  },
  projectController.updateProject
);

// DELETE /api/project/:projectId - Remove project
router.delete("/:projectId", protect, projectController.removeProject);

module.exports = router;
