// resumeController.js
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");

// Upload resume
exports.uploadResume = async (req, res) => {
  let tempFileCleaned = false;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log("Uploading resume:", req.file.filename, "from:", req.file.path);

    // Find user to determine role
    const user = await User.findById(req.user.id);
    if (!user) {
      // Delete temporary file
      const tempPath = req.file.path;
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        tempFileCleaned = true;
        console.log("Deleted temp file after user not found");
      }

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create role-based folder path
    const roleFolder = "CandidateResumes"; // Since only candidates upload resumes
    const targetDir = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      "resumes",
      roleFolder
    );

    // Create role folder if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log("Created directory:", targetDir);
    }

    // Move file from temp to role folder
    const tempPath = req.file.path;
    const targetPath = path.join(targetDir, req.file.filename);

    // Check if temp file exists
    if (!fs.existsSync(tempPath)) {
      console.error("Temp file does not exist:", tempPath);
      return res.status(500).json({
        success: false,
        message: "Uploaded file not found",
      });
    }

    // Move the file
    fs.renameSync(tempPath, targetPath);
    tempFileCleaned = true;
    console.log("File moved from temp to:", targetPath);

    // Create relative URL - Update path to include role folder
    const resumeUrl = `/uploads/resumes/${roleFolder}/${req.file.filename}`;

    // Delete old resume if it exists
    if (user.resume && user.resume !== "") {
      const oldResumePath = path.join(__dirname, "..", "public", user.resume);
      if (fs.existsSync(oldResumePath) && oldResumePath !== targetPath) {
        fs.unlinkSync(oldResumePath);
        console.log("Deleted old resume:", oldResumePath);
      }
    }

    // Update user with new resume
    user.resume = resumeUrl;
    user.resumeFileName = req.file.originalname;
    user.resumeFileSize = req.file.size;
    await user.save();

    console.log("Resume uploaded successfully:", resumeUrl);

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: resumeUrl,
      resumeFileName: req.file.originalname,
      resumeFileSize: req.file.size,
    });
  } catch (error) {
    console.error("Upload resume error:", error);

    // Clean up temp file if it exists and wasn't already cleaned
    if (req.file && req.file.path && !tempFileCleaned) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log("Cleaned up temp file after error:", req.file.path);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error uploading resume",
      error: error.message,
    });
  }
};

// Remove resume
exports.removeResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the resume file from server if it exists
    if (user.resume && user.resume !== "") {
      const resumePath = path.join(__dirname, "..", "public", user.resume);
      if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
        console.log("Deleted resume file:", resumePath);
      }
    }

    // Clear resume fields
    user.resume = "";
    user.resumeFileName = "";
    user.resumeFileSize = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Resume removed successfully",
    });
  } catch (error) {
    console.error("Remove resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error removing resume",
      error: error.message,
    });
  }
};

// Get resume info
exports.getResumeInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "resume resumeFileName resumeFileSize"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      resume: user.resume || "",
      resumeFileName: user.resumeFileName || "",
      resumeFileSize: user.resumeFileSize || 0,
    });
  } catch (error) {
    console.error("Get resume info error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting resume info",
      error: error.message,
    });
  }
};