const User = require("../models/userModel");
const { generateToken } = require("../utils/tokenUtils");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../utils/emailUtils");

// Basic email regex for format checking
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// REGISTER USER - UPDATED to prevent re-registration during verification
exports.registerUser = async (req, res) => {
  try {
    let { fullName, email, password, userType } = req.body;

    // Normalize input
    fullName = (fullName || "").trim();
    email = (email || "").trim().toLowerCase();

    console.log("Register endpoint hit (backend) with data:", {
      fullName,
      email,
      userType,
    });

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email format validation
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    // Password strength validation
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain upper and lower case letters",
      });
    }
    if (!/[0-9]/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must contain at least one number" });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one special character",
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
          message: "Email already exists and is verified. Please login.",
          emailExists: true,
          isVerified: true,
        });
      } else {
        // User exists but is not verified
        const currentTime = new Date();

        // Check if verification code is still valid (not expired)
        if (
          existingUser.verificationCode &&
          existingUser.verificationCodeExpires > currentTime
        ) {
          // Code is still valid - don't send new one, just inform user
          const timeLeftMinutes = Math.ceil(
            (existingUser.verificationCodeExpires - currentTime) / (1000 * 60)
          );

          return res.status(400).json({
            message: `Email already registered but not verified. Verification code sent to ${existingUser.email} is still valid for ${timeLeftMinutes} minutes. Please check your email or go to verification page.`,
            emailExists: true,
            isVerified: false,
            hasActiveCode: true,
            email: existingUser.email,
            timeLeftMinutes: timeLeftMinutes,
          });
        } else {
          // Code expired - send new verification code
          const verificationCode = generateVerificationCode();
          const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);

          // Update user with new details and code
          existingUser.fullName = fullName;
          existingUser.password = password; // This will be hashed by the pre-save hook
          existingUser.role = role;
          existingUser.verificationCode = verificationCode;
          existingUser.verificationCodeExpires = verificationCodeExpires;
          await existingUser.save();

          // Send verification email
          const emailSent = await sendVerificationEmail(
            email,
            verificationCode
          );

          if (!emailSent) {
            return res.status(500).json({
              message: "Failed to send verification email. Please try again.",
            });
          }

          return res.status(200).json({
            message: "Verification code expired. New code sent to your email.",
            user: {
              id: existingUser._id,
              email: existingUser.email,
            },
            requiresVerification: true,
            codeExpired: true,
          });
        }
      }
    }

    // Generate verification code (5 minutes expiration)
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Create new user with verification data
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
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      // If email fails to send, delete the user and return error
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.status(201).json({
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
    console.error("Registration Error (backend):", error.message);
    res.status(500).json({
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

    console.log("Login attempt for:", normalizedEmail);

    // Validate required fields
    if (!normalizedEmail || !trimmedPassword) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Email format validation
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
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
          message: `Please verify your email first. Verification code sent to ${user.email} is still valid for ${timeLeft} minutes.`,
          requiresVerification: true,
          email: user.email,
          hasActiveCode: true,
        });
      } else {
        // If code expired, send new one
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);

        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        await user.save();

        await sendVerificationEmail(user.email, verificationCode);

        return res.status(403).json({
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
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response with token
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error (backend):", error.message);
    res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};
