const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { sendVerificationEmail } = require("../utils/emailUtils");
const { sendWelcomeEmail } = require("../utils/WelcomeEmailUtils"); // Add this import

// Generate verification code function
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const ADMIN_EMAIL = "hirelinknp@gmail.com";

// POST /api/verify/verify-email
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Email already verified. Please login." });
    }

    // Check if verification code matches
    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Check if code is expired (15 minutes)
    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new code.",
        codeExpired: true,
      });
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    // Check if this is admin email
    const isAdminEmail = user.email == ADMIN_EMAIL;

    // Send welcome email after successful verification not for admin
    if (!isAdminEmail) {
      try {
        await sendWelcomeEmail(user.email, user.fullName, user.role);
        console.log(`Welcome email sent to ${user.email} after verification`);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the verification if welcome email fails
      }
    }

    res.status(200).json({
      message: "Email verified successfully! Welcome to HireLink.",
      verified: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      message: "Server error during verification",
      error: error.message,
    });
  }
});

// POST /api/verify/resend-verification
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Email already verified. Please login." });
    }

    // Generate new verification code (15 minutes expiration)
    const newVerificationCode = generateVerificationCode();
    const newVerificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new code
    user.verificationCode = newVerificationCode;
    user.verificationCodeExpires = newVerificationCodeExpires;
    await user.save();

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, newVerificationCode);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to resend verification email. Please try again.",
      });
    }

    res.status(200).json({
      message: "New verification code sent to your email.",
      expiresAt: newVerificationCodeExpires,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/check-status", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentTime = new Date();
    const isExpired = user.verificationCodeExpires
      ? user.verificationCodeExpires < currentTime
      : true;

    const timeLeft =
      user.verificationCodeExpires && !isExpired
        ? Math.max(
            0,
            Math.ceil((user.verificationCodeExpires - currentTime) / 1000)
          )
        : 0;

    res.status(200).json({
      isVerified: user.isVerified,
      hasPendingVerification: !user.isVerified && user.verificationCode,
      expiresAt: user.verificationCodeExpires,
      timeLeft: timeLeft,
      isExpired: isExpired,
    });
  } catch (error) {
    console.error("Check status error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
