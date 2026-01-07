// projectController.js
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");

// Add project to user profile
exports.addProject = async (req, res) => {
  try {
    const {
      projectTitle,
      projectDescription,
      startDate,
      endDate,
      isOngoing,
      projectUrl,
      technologies,
    } = req.body;

    // Validate required fields
    if (!projectTitle || !projectTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Start date is required",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    let end = null;
    if (endDate && !isOngoing) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date",
        });
      }
      if (end < start) {
        return res.status(400).json({
          success: false,
          message: "End date cannot be before start date",
        });
      }
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Parse technologies if provided
    let technologiesArray = [];
    if (technologies) {
      if (typeof technologies === "string") {
        technologiesArray = technologies
          .split(",")
          .map((tech) => tech.trim())
          .filter((tech) => tech !== "");
      } else if (Array.isArray(technologies)) {
        technologiesArray = technologies
          .map((tech) => tech.trim())
          .filter((tech) => tech !== "");
      }
    }

    // Create new project object
    const newProject = {
      projectTitle: projectTitle.trim(),
      projectDescription: projectDescription || "",
      startDate: start,
      endDate: isOngoing ? null : end,
      isOngoing: !!isOngoing,
      projectUrl: projectUrl ? projectUrl.trim() : "",
      technologies: technologiesArray,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Handle cover image if uploaded
    if (req.file) {
      // Move file from temp to project images folder
      const roleFolder = "CandidateProjects";
      const targetDir = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "projects",
        roleFolder
      );

      // Create role folder if it doesn't exist
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Move file from temp to role folder
      const tempPath = req.file.path;
      const targetPath = path.join(targetDir, req.file.filename);

      if (fs.existsSync(tempPath)) {
        fs.renameSync(tempPath, targetPath);
        console.log("Project cover image moved to:", targetPath);

        // Create relative URL
        const coverImageUrl = `/uploads/projects/${roleFolder}/${req.file.filename}`;

        newProject.coverImage = coverImageUrl;
        newProject.coverImageFileName = req.file.originalname;
        newProject.coverImageFileSize = req.file.size;
      }
    }

    // Add to user's projects array
    user.projects.push(newProject);
    await user.save();

    // Get the added project with its ID
    const addedProject = user.projects[user.projects.length - 1];

    return res.status(200).json({
      success: true,
      message: "Project added successfully",
      project: addedProject,
    });
  } catch (error) {
    console.error("Add project error:", error);

    // Clean up uploaded file if error occurs
    if (req.file && req.file.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server error adding project",
      error: error.message,
    });
  }
};

// Update project in user profile
exports.updateProject = async (req, res) => {
  try {
    const {
      projectTitle,
      projectDescription,
      startDate,
      endDate,
      isOngoing,
      projectUrl,
      technologies,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the project to update
    const project = user.projects.id(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Validate dates if provided
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date",
        });
      }
      project.startDate = start;
    }

    if (endDate && !isOngoing) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date",
        });
      }
      if (end < project.startDate) {
        return res.status(400).json({
          success: false,
          message: "End date cannot be before start date",
        });
      }
      project.endDate = end;
    } else if (isOngoing) {
      project.endDate = null;
    }

    // Update fields if provided
    if (projectTitle !== undefined) {
      if (!projectTitle.trim()) {
        return res.status(400).json({
          success: false,
          message: "Project title cannot be empty",
        });
      }
      project.projectTitle = projectTitle.trim();
    }

    if (projectDescription !== undefined) {
      project.projectDescription = projectDescription || "";
    }

    if (isOngoing !== undefined) {
      project.isOngoing = isOngoing;
      if (isOngoing) {
        project.endDate = null;
      }
    }

    if (projectUrl !== undefined) {
      project.projectUrl = projectUrl ? projectUrl.trim() : "";
    }

    if (technologies !== undefined) {
      let technologiesArray = [];
      if (typeof technologies === "string") {
        technologiesArray = technologies
          .split(",")
          .map((tech) => tech.trim())
          .filter((tech) => tech !== "");
      } else if (Array.isArray(technologies)) {
        technologiesArray = technologies
          .map((tech) => tech.trim())
          .filter((tech) => tech !== "");
      }
      project.technologies = technologiesArray;
    }

    // Handle cover image update if new file is uploaded
    if (req.file) {
      // Delete old cover image if it exists
      if (project.coverImage && project.coverImage !== "") {
        const oldImagePath = path.join(
          __dirname,
          "..",
          "public",
          project.coverImage
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Deleted old project cover image:", oldImagePath);
        }
      }

      // Move new file from temp to project images folder
      const roleFolder = "CandidateProjects";
      const targetDir = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "projects",
        roleFolder
      );

      // Create role folder if it doesn't exist
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Move file from temp to role folder
      const tempPath = req.file.path;
      const targetPath = path.join(targetDir, req.file.filename);

      if (fs.existsSync(tempPath)) {
        fs.renameSync(tempPath, targetPath);
        console.log("Project cover image updated to:", targetPath);

        // Create relative URL
        const coverImageUrl = `/uploads/projects/${roleFolder}/${req.file.filename}`;

        project.coverImage = coverImageUrl;
        project.coverImageFileName = req.file.originalname;
        project.coverImageFileSize = req.file.size;
      }
    }

    project.updatedAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    // Clean up uploaded file if error occurs
    if (req.file && req.file.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server error updating project",
      error: error.message,
    });
  }
};

// Remove project from user profile
exports.removeProject = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the project to remove
    const project = user.projects.id(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Delete the cover image file if it exists
    if (project.coverImage && project.coverImage !== "") {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        project.coverImage
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Deleted project cover image:", imagePath);
      }
    }

    // Remove the project
    project.remove();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Project removed successfully",
    });
  } catch (error) {
    console.error("Remove project error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error removing project",
      error: error.message,
    });
  }
};
