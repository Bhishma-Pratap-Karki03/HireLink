// User Controller handles user registration and login HTTP requests
// Now uses User Service for business logic, making the controller cleaner

const userService = require("../services/userService");

// Handle user registration request
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, userType } = req.body;

    // Call the user service to handle registration logic
    const result = await userService.registerUser(
      fullName,
      email,
      password,
      userType
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: "Registration successful! Verification code sent to your email.",
      ...result,
    });
  } catch (error) {
    console.error("Registration Error:", error.message);

    // Handle specific error cases with appropriate HTTP status codes

    // Handle email already exists error
    if (error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        emailExists: true,
        isVerified: error.message.includes("verified"),
      });
    }

    // Handle validation errors (missing fields, invalid email, weak password)
    if (error.message.includes("required") || error.message.includes("valid")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Handle any other unexpected errors
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Handle user login request
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Call the user service to handle login logic
    const result = await userService.loginUser(email, password);

    // Return success response with user data and token
    res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    // Handle specific error cases with appropriate HTTP status codes

    // Handle verification required error
    if (error.name === "VerificationRequired") {
      return res.status(403).json({
        success: false,
        message: error.message,
        requiresVerification: error.requiresVerification,
        email: error.email,
        hasActiveCode: error.hasActiveCode,
        codeExpired: error.codeExpired,
      });
    }

    // Handle invalid credentials error
    if (
      error.message.includes("Invalid email") ||
      error.message.includes("password")
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    // Handle validation errors
    if (error.message.includes("required") || error.message.includes("valid")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Handle any other unexpected errors
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};
