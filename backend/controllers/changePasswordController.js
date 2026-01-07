// Change Password Controller handles password reset HTTP requests
// Now uses Password Service for business logic

const passwordService = require("../services/passwordService");

// Handle password reset request
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Call the password service to handle reset request
    const result = await passwordService.requestPasswordReset(email);

    // Return the result from service
    res.status(200).json(result);
  } catch (error) {
    console.error("Password reset request error:", error);

    // Handle specific error cases

    // Handle verification required error
    if (error.name === "VerificationRequired") {
      return res.status(403).json({
        message: error.message,
        requiresVerification: error.requiresVerification,
        email: error.email,
      });
    }

    // Handle validation errors
    if (error.message.includes("required") || error.message.includes("valid")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Handle any other unexpected errors
    res.status(500).json({
      message: "Server error during password reset request",
      error: error.message,
    });
  }
};

// Handle reset code verification
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Call the password service to verify the reset code
    const result = await passwordService.verifyResetCode(email, code);

    // Return success response
    res.status(200).json(result);
  } catch (error) {
    console.error("Reset code verification error:", error);

    // Handle specific error cases

    // Handle expired code error
    if (error.name === "CodeExpired") {
      return res.status(400).json({
        message: error.message,
        codeExpired: error.codeExpired,
      });
    }

    // Handle missing fields or user not found
    if (
      error.message.includes("required") ||
      error.message.includes("not found")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Handle invalid reset code
    if (error.message.includes("Invalid reset code")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Handle any other unexpected errors
    res.status(500).json({
      message: "Server error during reset code verification",
      error: error.message,
    });
  }
};

// Handle password reset with new password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Call the password service to reset the password
    const result = await passwordService.resetPassword(token, newPassword);

    // Return success response
    res.status(200).json(result);
  } catch (error) {
    console.error("Password reset error:", error);

    // Handle specific error cases

    // Handle invalid or expired token
    if (error.message.includes("Invalid or expired")) {
      return res.status(401).json({
        message: error.message,
      });
    }

    // Handle validation errors (password requirements, same password)
    if (
      error.message.includes("required") ||
      error.message.includes("must be") ||
      error.message.includes("cannot be the same")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Handle any other unexpected errors
    res.status(500).json({
      message: "Server error during password reset",
      error: error.message,
    });
  }
};

// Handle resend reset code request
exports.resendResetCode = async (req, res) => {
  try {
    const { email } = req.body;

    // Call the password service to resend reset code
    const result = await passwordService.resendResetCode(email);

    // Return success response
    res.status(200).json(result);
  } catch (error) {
    console.error("Resend reset code error:", error);

    // Handle missing email error
    if (error.message.includes("required")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Handle any other unexpected errors
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
