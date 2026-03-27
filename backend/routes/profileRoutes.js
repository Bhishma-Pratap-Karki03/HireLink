// Profile routes for candidate/recruiter profile management.
const express = require("express");
const router = express.Router();
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");
const multer = require("multer");
const path = require("path");

// Multer setup for profile picture upload (image only, max 5MB).
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "profiles",
        "temp"
      );
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, "profile-" + uniqueSuffix + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Public profile route (optional auth allows private-profile checks for friends/admin).
router.get("/user/:userId", optionalProtect, profileController.getUserProfile);

// Get logged-in user profile.
router.get("/me", protect, profileController.getMyProfile);
// Update basic profile fields for logged-in user.
router.put("/me", protect, profileController.updateProfile);
// Upload or replace profile picture. Form-data field: profilePicture
router.post(
  "/me/picture",
  protect,
  upload.single("profilePicture"),
  profileController.uploadProfilePicture
);
// Remove current profile picture.
router.delete("/me/picture", protect, profileController.removeProfilePicture);

// Add new experience entry.
router.post("/me/experience", protect, profileController.addExperience);
// Update experience entry by experienceId.
router.put(
  "/me/experience/:experienceId",
  protect,
  profileController.updateExperience
);
// Delete experience entry by experienceId.
router.delete(
  "/me/experience/:experienceId",
  protect,
  profileController.removeExperience
);

// Add new education entry.
router.post("/me/education", protect, profileController.addEducation);
// Update education entry by educationId.
router.put(
  "/me/education/:educationId",
  protect,
  profileController.updateEducation
);
// Delete education entry by educationId.
router.delete(
  "/me/education/:educationId",
  protect,
  profileController.removeEducation
);

// Add new skill entry.
router.post("/me/skills", protect, profileController.addSkill);
// Update skill entry by skillId.
router.put("/me/skills/:skillId", protect, profileController.updateSkill);
// Delete skill entry by skillId.
router.delete("/me/skills/:skillId", protect, profileController.removeSkill);

// Add new language entry.
router.post("/me/languages", protect, profileController.addLanguage);
// Update language entry by languageId.
router.put(
  "/me/languages/:languageId",
  protect,
  profileController.updateLanguage
);
// Delete language entry by languageId.
router.delete(
  "/me/languages/:languageId",
  protect,
  profileController.removeLanguage
);

// Add new certification entry.
router.post("/me/certifications", protect, profileController.addCertification);
// Update certification entry by certificationId.
router.put(
  "/me/certifications/:certificationId",
  protect,
  profileController.updateCertification
);
// Delete certification entry by certificationId.
router.delete(
  "/me/certifications/:certificationId",
  protect,
  profileController.removeCertification
);

module.exports = router;
