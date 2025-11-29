const User = require("../models/userModel");
const { generateToken } = require("../utils/tokenUtils");

// Basic email regex for format checking
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// REGISTER USER
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

    // Password strength validation (example rules)
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
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one special character",
      });
    }

    // Determine role based on userType from frontend
    // Only allow 'candidate' or 'recruiter' from this endpoint
    let role = "candidate";
    if (userType === "recruiter") {
      role = "recruiter";
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password,
      role,
    });

    await newUser.save();

    // Generate auth token 
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Registration Error (backend):", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
