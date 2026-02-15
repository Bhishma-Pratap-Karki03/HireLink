const path = require("path");
const fs = require("fs");
const AppliedJob = require("../models/appliedJobModel");
const JobPost = require("../models/jobPostModel");
const User = require("../models/userModel");
const AtsReport = require("../models/atsReportModel");
const {
  parseResumeText,
  extractEmails,
  extractPhones,
  extractExperienceYears,
  extractSkills,
  canonicalizeSkill,
  normalize,
} = require("../utils/atsParser");

const sanitize = (value) =>
  String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

exports.applyToJob = async (req, res) => {
  let tempFileCleaned = false;
  try {
    const userId = req.user.id;
    const { jobId, resumeUrl, message } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const [job, user] = await Promise.all([
      JobPost.findById(jobId),
      User.findById(userId),
    ]);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const targetDir = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      "appliedresume"
    );

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const candidateName = sanitize(user.fullName || user.email || "candidate");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    let finalResumeUrl = "";
    let finalFileName = "";
    let finalFileSize = 0;

    if (req.file) {
      const ext = path.extname(req.file.originalname) || ".pdf";
      const baseName = sanitize(path.basename(req.file.originalname, ext)) || "resume";
      const finalName = `${candidateName}-${timestamp}-${baseName}${ext}`;
      const targetPath = path.join(targetDir, finalName);

      if (!fs.existsSync(req.file.path)) {
        return res.status(500).json({
          success: false,
          message: "Uploaded file not found",
        });
      }

      fs.renameSync(req.file.path, targetPath);
      tempFileCleaned = true;

      finalResumeUrl = `/uploads/appliedresume/${finalName}`;
      finalFileName = req.file.originalname;
      finalFileSize = req.file.size;
    } else if (resumeUrl) {
      const resumePath = path.join(__dirname, "..", "public", resumeUrl);
      if (!fs.existsSync(resumePath)) {
        return res.status(400).json({
          success: false,
          message: "Profile resume not found. Please upload a resume.",
        });
      }
      const ext = path.extname(resumePath) || ".pdf";
      const baseName = sanitize(path.basename(resumePath, ext)) || "resume";
      const finalName = `${candidateName}-${timestamp}-${baseName}${ext}`;
      const targetPath = path.join(targetDir, finalName);

      fs.copyFileSync(resumePath, targetPath);

      finalResumeUrl = `/uploads/appliedresume/${finalName}`;
      finalFileName = path.basename(resumePath);
      finalFileSize = fs.statSync(resumePath).size;
    } else {
      return res.status(400).json({
        success: false,
        message: "Resume is required",
      });
    }

    const application = await AppliedJob.create({
      candidate: userId,
      job: jobId,
      jobTitle: job.jobTitle || "Untitled Role",
      companyName: job.companyName || job.department || "Company",
      resumeUrl: finalResumeUrl,
      resumeFileName: finalFileName,
      resumeFileSize: finalFileSize,
      message: message || "",
    });

    try {
      const resumePath = path.join(__dirname, "..", "public", finalResumeUrl || "");
      if (fs.existsSync(resumePath)) {
        const resumeText = normalize(await parseResumeText(resumePath));
        const extractedSkills = extractSkills(resumeText).map((skill) =>
          canonicalizeSkill(skill)
        );
        const experienceYears = extractExperienceYears(resumeText);
        const emails = extractEmails(resumeText);
        const phones = extractPhones(resumeText);

        const report = await AtsReport.create({
          job: jobId,
          application: application._id,
          candidate: userId,
          extracted: {
            skills: extractedSkills,
            emails,
            phones,
            experienceYears,
          },
          matchedSkills: [],
          missingSkills: [],
          experienceMatch: false,
          skillsScore: 0,
          experienceScore: 0,
          score: 0,
        });

        await AppliedJob.findByIdAndUpdate(application._id, {
          atsReport: report._id,
        });
      }
    } catch (atsError) {
      console.error("ATS pre-extract error:", atsError);
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted",
      application,
    });
  } catch (error) {
    if (req.file && req.file.path && !tempFileCleaned) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    }

    console.error("Apply job error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error applying to job",
      error: error.message,
    });
  }
};

exports.checkApplied = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const existing = await AppliedJob.findOne({
      candidate: userId,
      job: jobId,
    }).lean();

    return res.status(200).json({
      success: true,
      applied: Boolean(existing),
      application: existing || null,
    });
  } catch (error) {
    console.error("Check applied error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error checking application",
      error: error.message,
    });
  }
};

exports.getApplicationsByJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const recruiter = await User.findById(userId).lean();
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can access applications",
      });
    }

    const job = await JobPost.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.recruiterId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this job",
      });
    }

    const applications = await AppliedJob.find({ job: jobId })
      .populate({
        path: "candidate",
        select: "fullName email profilePicture currentJobTitle",
      })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = applications.map((app) => ({
      id: app._id,
      candidate: app.candidate,
      resumeUrl: app.resumeUrl,
      resumeFileName: app.resumeFileName,
      resumeFileSize: app.resumeFileSize,
      message: app.message || "",
      status: app.status,
      appliedAt: app.createdAt,
    }));

    return res.status(200).json({
      success: true,
      job: {
        id: job._id,
        jobTitle: job.jobTitle,
        location: job.location,
        jobType: job.jobType,
        deadline: job.deadline,
      },
      applications: formatted,
    });
  } catch (error) {
    console.error("Get applications by job error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching applications",
      error: error.message,
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;
    const { status } = req.body;
    const allowedStatuses = [
      "submitted",
      "reviewed",
      "shortlisted",
      "interview",
      "rejected",
      "hired",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const recruiter = await User.findById(userId).lean();
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can update application status",
      });
    }

    const application = await AppliedJob.findById(applicationId).populate("job");
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.job?.recruiterId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this application",
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Status updated",
      application: {
        id: application._id,
        status: application.status,
      },
    });
  } catch (error) {
    console.error("Update application status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating application status",
      error: error.message,
    });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await AppliedJob.find({ candidate: userId })
      .populate({
        path: "job",
        select: "jobTitle location jobType recruiterId",
      })
      .sort({ createdAt: -1 })
      .lean();

    const recruiterIds = [
      ...new Set(
        applications
          .map((item) => item?.job?.recruiterId?.toString())
          .filter(Boolean),
      ),
    ];

    const recruiters = await User.find(
      { _id: { $in: recruiterIds } },
      "fullName profilePicture",
    ).lean();

    const recruiterMap = new Map(
      recruiters.map((item) => [item._id.toString(), item]),
    );

    const mapped = applications.map((item) => {
      const recruiterId = item?.job?.recruiterId?.toString() || "";
      const recruiter = recruiterMap.get(recruiterId);

      return {
        id: item._id,
        jobId: item.job?._id || item.job,
        jobTitle: item.jobTitle || item?.job?.jobTitle || "Untitled Role",
        companyName: item.companyName || recruiter?.fullName || "Company",
        location: item?.job?.location || "Location not specified",
        jobType: item?.job?.jobType || "Job type not specified",
        appliedAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: item.status || "submitted",
        resumeUrl: item.resumeUrl || "",
        resumeFileName: item.resumeFileName || "",
        resumeFileSize: item.resumeFileSize || 0,
        recruiter: recruiterId
          ? {
              id: recruiterId,
              fullName: recruiter?.fullName || "Recruiter",
              profilePicture: recruiter?.profilePicture || "",
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      applications: mapped,
    });
  } catch (error) {
    console.error("Get my applications error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching your applications",
      error: error.message,
    });
  }
};
