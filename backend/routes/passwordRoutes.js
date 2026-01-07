// Password Routes - defines API endpoints for password reset functionality

const express = require("express");
const router = express.Router();

// Import the change password controller
const changePasswordController = require("../controllers/changePasswordController");

// POST /api/password/request-reset - Request password reset
router.post("/request-reset", changePasswordController.requestPasswordReset);

// POST /api/password/verify-code - Verify reset code
router.post("/verify-code", changePasswordController.verifyResetCode);

// POST /api/password/reset - Reset password with new password
router.post("/reset", changePasswordController.resetPassword);

// POST /api/password/resend-code - Resend reset code
router.post("/resend-code", changePasswordController.resendResetCode);

module.exports = router;
