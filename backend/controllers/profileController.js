const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");

// Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -verificationCode -resetCode"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        about: user.about || "",
        currentJobTitle: user.currentJobTitle || "",
        profilePicture: user.profilePicture || "",
        connectionsCount: user.connectionsCount || 0,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { currentJobTitle, phone, address, about } = req.body;

    // Validate phone number format if provided
    if (phone && phone.trim() !== "") {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanedPhone = phone.replace(/[\s\-\(\)]/g, "");

      if (!phoneRegex.test(cleanedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid phone number",
        });
      }
    }

    const updateData = {};
    if (currentJobTitle !== undefined)
      updateData.currentJobTitle = currentJobTitle.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (about !== undefined) updateData.about = about.trim();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, select: "-password -verificationCode -resetCode" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        about: user.about || "",
        currentJobTitle: user.currentJobTitle || "",
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
      error: error.message,
    });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Create relative URL for the uploaded file
    const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;

    // Find user and update profile picture
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old profile picture if it exists and is not default
    if (user.profilePicture && user.profilePicture !== "") {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "public",
        user.profilePicture
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new profile picture
    user.profilePicture = profilePictureUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: profilePictureUrl,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: profilePictureUrl,
      },
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Server error uploading profile picture",
      error: error.message,
    });
  }
};

// Remove profile picture
exports.removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the profile picture file if it exists
    if (user.profilePicture && user.profilePicture !== "") {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        user.profilePicture
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Clear profile picture field
    user.profilePicture = "";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture removed successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: "",
      },
    });
  } catch (error) {
    console.error("Remove profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Server error removing profile picture",
      error: error.message,
    });
  }
};

// Get user profile by ID (public)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "fullName email role currentJobTitle profilePicture"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
