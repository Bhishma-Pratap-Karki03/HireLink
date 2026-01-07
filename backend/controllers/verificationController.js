// Verification Controller handles email verification requests
// This is a thin layer that just handles HTTP requests and calls the Auth Service

const authService = require("../services/authService");

// Verify user's email with the code they received
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Call the auth service to handle the verification logic
    const result = await authService.verifyEmail(email, code);

    // Return success response
    res.status(200).json({
      message: "Email verified successfully! Welcome to HireLink.",
      verified: true,
      ...result,
    });
  } catch (error) {
    console.error("Email verification error:", error);

    // Handle specific error cases with appropriate HTTP status codes

    if (error.message.includes("already verified")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.message.includes("Invalid verification code")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.message.includes("expired")) {
      return res.status(400).json({
        message: error.message,
        codeExpired: true,
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        message: error.message,
      });
    }

    // Handle any other unexpected errors
    res.status(500).json({
      message: "Server error during verification",
      error: error.message,
    });
  }
};

// Resend verification code to user's email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Call the auth service to resend verification code
    const result = await authService.resendVerificationCode(email);

    // Return success response
    res.status(200).json({
      message: "New verification code sent to your email.",
      ...result,
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    // Handle specific error cases
    if (error.message.includes("already verified")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
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

// Check verification status of a user
exports.checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.query;

    // Check if email query parameter is provided
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Call the auth service to check verification status
    const result = await authService.checkVerificationStatus(email);

    // Return the verification status
    res.status(200).json(result);
  } catch (error) {
    console.error("Check status error:", error);

    // Handle user not found error
    if (error.message.includes("not found")) {
      return res.status(404).json({
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
