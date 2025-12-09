// For fortget passwword related routes
const express = require("express");
const router = express.Router();
const {
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  resendResetCode,
} = require("../controllers/changePasswordController");

// POST /api/password/request-reset
router.post("/request-reset", requestPasswordReset);

// POST /api/password/verify-code
router.post("/verify-code", verifyResetCode);

// POST /api/password/reset
router.post("/reset", resetPassword);

// POST /api/password/resend-code
router.post("/resend-code", resendResetCode);

module.exports = router;
