const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../utils/tokenUtils");
const {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} = require("../utils/passwordResetEmailUtils");

// Basic email regex for format checking
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// Define admin email
const ADMIN_EMAIL = "hirelinknp@gmail.com";

// REQUEST PASSWORD RESET (Allows admin to change password also)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Email format validation
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    // For security reasons, don't reveal if user exists or not
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a password reset code will be sent.",
        success: true,
        email: normalizedEmail,
      });
    }

    const isAdminEmail = normalizedEmail === ADMIN_EMAIL;

    // For non admin users, check if email is verified
    if (!isAdminEmail && !user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first before resetting password.",
        requiresVerification: true,
        email: user.email,
      });
    }

    // Generate reset code (5 minutes expiration)
    const resetCode = generateResetCode();
    const resetCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update user with reset code
    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();

    // Send password reset email using utility
    const emailSent = await sendPasswordResetEmail(normalizedEmail, resetCode);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send reset email. Please try again.",
        success: false,
      });
    }

    res.status(200).json({
      message: "Password reset code sent to your email.",
      success: true,
      email: normalizedEmail,
      expiresAt: resetCodeExpires,
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      message: "Server error during password reset request",
      error: error.message,
    });
  }
};

// VERIFY RESET CODE
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      return res.status(400).json({
        message: "Email and reset code are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if reset code exists and matches
    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({
        message: "Invalid reset code",
      });
    }

    // Check if reset code is expired
    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return res.status(400).json({
        message: "Reset code has expired. Please request a new one.",
        codeExpired: true,
      });
    }

    // Generate a temporary token for password reset (valid for 15 minutes)
    const resetToken = generateToken(user._id, "15m");

    // Clear reset code immediately after verification
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    res.status(200).json({
      message: "Reset code verified successfully",
      success: true,
      resetToken,
      email: user.email,
    });
  } catch (error) {
    console.error("Reset code verification error:", error);
    res.status(500).json({
      message: "Server error during reset code verification",
      error: error.message,
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid or expired reset token",
      });
    }

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Password strength validation (same as registration)
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain upper and lower case letters",
      });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one number",
      });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one special character",
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Send password changed confirmation email using utility
    await sendPasswordChangedEmail(user.email, user.fullName);

    res.status(200).json({
      message:
        "Password reset successful! You can now login with your new password.",
      success: true,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      message: "Server error during password reset",
      error: error.message,
    });
  }
};

// RESEND RESET CODE
exports.resendResetCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // For security, don't reveal if user exists
      return res.status(200).json({
        message:
          "If an account exists with this email, a new reset code will be sent.",
        success: true,
      });
    }

    // Generate new reset code (5 minutes expiration)
    const resetCode = generateResetCode();
    const resetCodeExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Update user with new reset code
    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();

    // Send new reset email using utility
    const emailSent = await sendPasswordResetEmail(normalizedEmail, resetCode);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to resend reset code. Please try again.",
        success: false,
      });
    }

    res.status(200).json({
      message: "New reset code sent to your email.",
      success: true,
      expiresAt: resetCodeExpires,
    });
  } catch (error) {
    console.error("Resend reset code error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
