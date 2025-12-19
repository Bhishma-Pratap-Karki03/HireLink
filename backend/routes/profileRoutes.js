const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const profileController = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../public/uploads/profiles");

    // Create the uploads directory if it doesn't exist
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

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.fileValidationError = "Only JPG, JPEG, PNG, and WEBP files are allowed";
    cb(new Error("Only JPG, JPEG, PNG, and WEBP files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Protected routes (require authentication)
router.get("/me", protect, profileController.getMyProfile);
router.put("/update", protect, profileController.updateProfile);
// Error handling middleware for multer (must be before routes)
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
    if (
      error.message.includes("Only JPG") ||
      error.message.includes("files are allowed")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  next(error);
};

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
router.delete(
  "/remove-picture",
  protect,
  profileController.removeProfilePicture
);

// Public route (no authentication required)
router.get("/:userId", profileController.getUserProfile);

module.exports = router;
