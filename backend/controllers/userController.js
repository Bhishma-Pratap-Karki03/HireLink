const User = require("../models/userModel");
const { generateToken } = require("../utils/tokenUtils");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../utils/emailUtils");

// Basic email regex for format checking
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    let { fullName, email, password, userType } = req.body;

    // Normalize input
    fullName = (fullName || "").trim();
    email = (email || "").trim().toLowerCase();

    console.log("Register endpoint hit with data:", {
      fullName,
      email,
      userType,
    });

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email format validation
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email",
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Determine role based on userType from frontend
    let role = "candidate";
    if (userType === "recruiter") {
      role = "recruiter";
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already exists and is verified. Please login.",
          emailExists: true,
          isVerified: true,
        });
      } else {
        // User exists but is not verified - update with new data
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        existingUser.fullName = fullName;
        existingUser.password = password; // Will be hashed by pre-save hook
        existingUser.role = role;
        existingUser.verificationCode = verificationCode;
        existingUser.verificationCodeExpires = verificationCodeExpires;
        await existingUser.save();

        // Send verification email
        await sendVerificationEmail(email, verificationCode);

        return res.status(200).json({
          success: true,
          message: "Verification code sent to your email.",
          user: {
            id: existingUser._id,
            email: existingUser.email,
          },
          requiresVerification: true,
        });
      }
    }

    // Generate verification code (15 minutes expiration)
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password,
      role,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    await newUser.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      success: true,
      message: "Registration successful! Verification code sent to your email.",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trim and normalize input
    const normalizedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    // Validate required fields
    if (!normalizedEmail || !trimmedPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Email format validation
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // If code is not expired, inform user to verify
      if (user.verificationCode && user.verificationCodeExpires > new Date()) {
        const timeLeft = Math.ceil(
          (user.verificationCodeExpires - new Date()) / 1000 / 60
        );
        return res.status(403).json({
          success: false,
          message: `Please verify your email first. Verification code sent to ${user.email} is still valid for ${timeLeft} minutes.`,
          requiresVerification: true,
          email: user.email,
          hasActiveCode: true,
        });
      } else {
        // If code expired, send new one
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        await user.save();

        await sendVerificationEmail(user.email, verificationCode);

        return res.status(403).json({
          success: false,
          message: "Verification code expired. New code sent to your email.",
          requiresVerification: true,
          email: user.email,
          codeExpired: true,
        });
      }
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(
      trimmedPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Get user data without sensitive information
    const userData = await User.findById(user._id).select(
      "-password -verificationCode -resetCode"
    );

    // Prepare user response with all needed data
    const userResponse = {
      id: userData._id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
      phone: userData.phone || "",
      address: userData.address || "",
      currentJobTitle: userData.currentJobTitle || "",
      profilePicture: userData.profilePicture || "",
      connectionsCount: userData.connectionsCount || 0,
      isVerified: userData.isVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    // Return success response with token
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};
