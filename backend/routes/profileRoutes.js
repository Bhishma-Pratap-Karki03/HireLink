// profileRoutes.js - Complete file with all routes

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import the profile controller
const profileController = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

// Configure multer for file uploads (profile pictures)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create temp folder for uploads
    const uploadDir = path.join(__dirname, "../public/uploads/profiles/temp");

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
    cb(null, `profile-${uniqueSuffix}${ext}`);
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

// Protected routes (require authentication)
// GET /api/profile/me - Get current user's profile
router.get("/me", protect, profileController.getMyProfile);

// PUT /api/profile/update - Update user's profile information
router.put("/update", protect, profileController.updateProfile);

// PUT /api/profile/upload-picture - Upload profile picture
router.put(
  "/upload-picture",
  protect,
  upload.single("profilePicture"),
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
  profileController.uploadProfilePicture
);

// DELETE /api/profile/remove-picture - Remove profile picture
router.delete(
  "/remove-picture",
  protect,
  profileController.removeProfilePicture
);

// Experience management routes
// POST /api/profile/experience - Add new experience
router.post("/experience", protect, profileController.addExperience);

// PUT /api/profile/experience/:experienceId - Update experience
router.put(
  "/experience/:experienceId",
  protect,
  profileController.updateExperience
);

// DELETE /api/profile/experience/:experienceId - Remove experience
router.delete(
  "/experience/:experienceId",
  protect,
  profileController.removeExperience
);

// Education management routes
// POST /api/profile/education - Add new education
router.post("/education", protect, profileController.addEducation);

// PUT /api/profile/education/:educationId - Update education
router.put(
  "/education/:educationId",
  protect,
  profileController.updateEducation
);

// DELETE /api/profile/education/:educationId - Remove education
router.delete(
  "/education/:educationId",
  protect,
  profileController.removeEducation
);

// Skill management routes - MAKE SURE THESE ARE CORRECT
// POST /api/profile/skill - Add new skill
router.post("/skill", protect, profileController.addSkill); // LINE 157

// PUT /api/profile/skill/:skillId - Update skill
router.put("/skill/:skillId", protect, profileController.updateSkill);

// DELETE /api/profile/skill/:skillId - Remove skill
router.delete("/skill/:skillId", protect, profileController.removeSkill);

// Language management routes
// POST /api/profile/language - Add new language
router.post("/language", protect, profileController.addLanguage);

// PUT /api/profile/language/:languageId - Update language
router.put("/language/:languageId", protect, profileController.updateLanguage);

// DELETE /api/profile/language/:languageId - Remove language
router.delete(
  "/language/:languageId",
  protect,
  profileController.removeLanguage
);

// Certification management routes
// POST /api/profile/certification - Add new certification
router.post("/certification", protect, profileController.addCertification);

// PUT /api/profile/certification/:certificationId - Update certification
router.put(
  "/certification/:certificationId",
  protect,
  profileController.updateCertification
);

// DELETE /api/profile/certification/:certificationId - Remove certification
router.delete(
  "/certification/:certificationId",
  protect,
  profileController.removeCertification
);

// Public route (no authentication required)
// GET /api/profile/:userId - Get public profile of any user
router.get("/:userId", profileController.getUserProfile);

module.exports = router;
