// resumeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const resumeController = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");

// Configure multer for resume uploads - Store directly in role-specific folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create temp folder for uploads (temporary storage before moving to role folder)
    const uploadDir = path.join(__dirname, "../public/uploads/resumes/temp");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    cb(null, `resume-${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter for allowed resume types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedExtensions = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    req.fileValidationError =
      "Only PDF, DOC, and DOCX files are allowed (Max size: 5MB)";
    cb(new Error("Invalid file type"), false);
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
    if (error.message.includes("Invalid file type")) {
      return res.status(400).json({
        success: false,
        message: "Only PDF, DOC, and DOCX files are allowed",
      });
    }
  }
  next(error);
};

// Protected routes
// POST /api/resume/upload - Upload resume
router.post(
  "/upload",
  protect,
  upload.single("resume"),
  handleMulterError,
  (req, res, next) => {
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        message: req.fileValidationError,
      });
    }
    next();
  },
  resumeController.uploadResume
);

// DELETE /api/resume/remove - Remove resume
router.delete("/remove", protect, resumeController.removeResume);

// GET /api/resume/info - Get resume info
router.get("/info", protect, resumeController.getResumeInfo);

module.exports = router;
