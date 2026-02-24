const fs = require("fs"); // Used to check if resume file exists
const path = require("path"); // Used to build correct file paths
const JobPost = require("../models/jobPostModel"); // Job post model
const AppliedJob = require("../models/appliedJobModel"); // Application model
const AtsReport = require("../models/atsReportModel"); // ATS report model
const User = require("../models/userModel"); // User model
const {
  parseResumeText,
  extractEmails,
  extractPhones,
  extractExperienceYears,
  extractSkills,
  extractEducationLevel,
  canonicalizeSkill,
  normalize,
} = require("../utils/atsParser"); // Resume parsing utilities

// Extract minimum required experience (number) from job experience text
const parseMinExperience = (experienceText) => {
  if (!experienceText) return 0; // If empty, no requirement
  const match = experienceText.match(/(\d+)/); // Find first number
  if (!match) return 0;
  return Number(match[1]) || 0; // Return extracted number
};

// Education ranking system (used for comparison)
const educationLevelRankMap = {
  "high school": 1,
  associate: 2,
  bachelor: 3,
  master: 4,
  doctorate: 5,
};

// Extract required education rank from job description text
const parseRequiredEducationRank = (educationText) => {
  const source = normalize(educationText || "");
  if (!source) return 0;

  if (
    source.includes("phd") ||
    source.includes("doctorate") ||
    source.includes("dphil")
  ) {
    return educationLevelRankMap.doctorate;
  }
  if (
    source.includes("master") ||
    source.includes("msc") ||
    source.includes("m.sc") ||
    source.includes("mba")
  ) {
    return educationLevelRankMap.master;
  }
  if (
    source.includes("bachelor") ||
    source.includes("bsc") ||
    source.includes("b.sc") ||
    source.includes("be") ||
    source.includes("b.e") ||
    source.includes("btech")
  ) {
    return educationLevelRankMap.bachelor;
  }
  if (source.includes("associate") || source.includes("diploma")) {
    return educationLevelRankMap.associate;
  }
  if (
    source.includes("high school") ||
    source.includes("secondary") ||
    source.includes("10+2")
  ) {
    return educationLevelRankMap["high school"];
  }

  return 0; // No requirement detected
};

// Compute ATS score based on skills, experience, and education
const computeScore = ({
  requiredSkills,
  extractedSkills,
  experienceYears,
  minExperience,
  educationRank,
  minEducationRank,
}) => {
  // Canonicalize skills for accurate matching
  const required = requiredSkills.map((item) => canonicalizeSkill(item));
  const extracted = extractedSkills.map((item) => canonicalizeSkill(item));

  // Determine matched and missing skills
  const matchedSkills = required.filter((skill) => extracted.includes(skill));
  const missingSkills = required.filter((skill) => !extracted.includes(skill));

  // Skills weight = 70%
  const skillsScore = required.length
    ? (matchedSkills.length / required.length) * 70
    : 70;

  // Experience weight = 20%
  let experienceScore = 20;
  let experienceMatch = true;

  if (minExperience > 0) {
    experienceScore = Math.min(experienceYears / minExperience, 1) * 20;
    experienceMatch = experienceYears >= minExperience;
  }

  // Education weight = 10%
  let educationScore = 10;
  let educationMatch = true;

  if (minEducationRank > 0) {
    educationScore = Math.min(educationRank / minEducationRank, 1) * 10;
    educationMatch = educationRank >= minEducationRank;
  }

  const totalScore = Math.round(skillsScore + experienceScore + educationScore);

  return {
    totalScore,
    matchedSkills,
    missingSkills,
    skillsScore: Math.round(skillsScore),
    experienceScore: Math.round(experienceScore),
    educationScore: Math.round(educationScore),
    experienceMatch,
    educationMatch,
  };
};

// Scan all applications for a specific job
exports.scanJobApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    // Ensure only recruiter can scan
    const recruiter = await User.findById(userId).lean();
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can scan applications",
      });
    }

    // Ensure job exists
    const job = await JobPost.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Ensure recruiter owns this job
    if (job.recruiterId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to scan this job",
      });
    }

    // Fetch all applications for this job
    const applications = await AppliedJob.find({ job: jobId }).lean();
    if (!applications.length) {
      return res.status(200).json({
        success: true,
        message: "No applications to scan",
        reports: [],
      });
    }

    const requiredSkills = job.requiredSkills || [];
    const minExperience = parseMinExperience(job.experience);
    const minEducationRank = parseRequiredEducationRank(job.education);
    const reports = [];

    // Loop through each application
    for (const application of applications) {
      const resumePath = path.join(
        __dirname,
        "..",
        "public",
        application.resumeUrl || "",
      );

      if (!fs.existsSync(resumePath)) {
        continue; // Skip if resume file not found
      }

      let report = await AtsReport.findOne({ application: application._id });

      // Parse resume content
      const resumeText = normalize(await parseResumeText(resumePath));
      const extractedSkills = extractSkills(resumeText).map((skill) =>
        canonicalizeSkill(skill),
      );
      const experienceYears = extractExperienceYears(resumeText);
      const education = extractEducationLevel(resumeText);
      const emails = extractEmails(resumeText);
      const phones = extractPhones(resumeText);

      // Create report if not exists
      if (!report) {
        report = await AtsReport.create({
          job: jobId,
          application: application._id,
          candidate: application.candidate,
          extracted: {
            skills: extractedSkills,
            emails,
            phones,
            experienceYears,
            educationLevel: education.label || "",
            educationRank: education.rank || 0,
          },
          matchedSkills: [],
          missingSkills: [],
          experienceMatch: false,
          educationMatch: false,
          skillsScore: 0,
          experienceScore: 0,
          educationScore: 0,
          score: 0,
        });
      } else {
        // Update extracted data if report already exists
        report.extracted = {
          skills: extractedSkills,
          emails,
          phones,
          experienceYears,
          educationLevel: education.label || "",
          educationRank: education.rank || 0,
        };
      }

      // Compute ATS score
      const {
        totalScore,
        matchedSkills,
        missingSkills,
        skillsScore,
        experienceScore,
        educationScore,
        experienceMatch,
        educationMatch,
      } = computeScore({
        requiredSkills,
        extractedSkills: report.extracted?.skills || [],
        experienceYears: report.extracted?.experienceYears || 0,
        minExperience,
        educationRank: report.extracted?.educationRank || 0,
        minEducationRank,
      });

      // Save scoring results
      report.matchedSkills = matchedSkills;
      report.missingSkills = missingSkills;
      report.skillsScore = skillsScore;
      report.experienceScore = experienceScore;
      report.educationScore = educationScore;
      report.experienceMatch = experienceMatch;
      report.educationMatch = educationMatch;
      report.score = totalScore;

      await report.save();

      // Update application with ATS score reference
      await AppliedJob.findByIdAndUpdate(application._id, {
        atsScore: totalScore,
        atsReport: report._id,
      });

      reports.push(report);
    }

    return res.status(200).json({
      success: true,
      message: "ATS scan completed",
      reports,
    });
  } catch (error) {
    console.error("ATS scan error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error scanning applications",
      error: error.message,
    });
  }
};

// Get ATS results sorted by score for a specific job
exports.getAtsResultsByJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    // Ensure recruiter role
    const recruiter = await User.findById(userId).lean();
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can access ATS results",
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

    // Fetch reports sorted by highest score first
    const reports = await AtsReport.find({ job: jobId })
      .populate({
        path: "candidate",
        select: "fullName email profilePicture currentJobTitle",
      })
      .sort({ score: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      job: {
        id: job._id,
        jobTitle: job.jobTitle,
        location: job.location,
        jobType: job.jobType,
      },
      reports,
    });
  } catch (error) {
    console.error("ATS results error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching ATS results",
      error: error.message,
    });
  }
};
