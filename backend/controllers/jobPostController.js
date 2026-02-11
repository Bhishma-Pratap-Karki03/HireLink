const mongoose = require("mongoose");
const JobPost = require("../models/jobPostModel");
const User = require("../models/userModel");
const AppliedJob = require("../models/appliedJobModel");

const listJobPosts = async (req, res) => {
  try {
    const {
      search,
      location,
      department,
      workMode,
      jobType,
      jobLevel,
      experience,
      education,
      skills,
      currency,
      salaryFrom,
      salaryTo,
      sort = "newest",
      recruiterId,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

    const match = {
      isActive: true,
      status: "published",
    };

    if (recruiterId && mongoose.Types.ObjectId.isValid(recruiterId)) {
      match.recruiterId = new mongoose.Types.ObjectId(recruiterId);
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      match.$or = [
        { jobTitle: searchRegex },
        { department: searchRegex },
        { location: searchRegex },
      ];
    }

    if (location) {
      match.location = new RegExp(location, "i");
    }

    if (department) {
      match.department = new RegExp(department, "i");
    }

    if (workMode) {
      const workModeList = String(workMode)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (workModeList.length > 0) {
        match.workMode = { $in: workModeList };
      }
    }

    if (jobType) {
      const jobTypeList = String(jobType)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (jobTypeList.length > 0) {
        match.jobType = { $in: jobTypeList.map((item) => new RegExp(item, "i")) };
      }
    }

    if (jobLevel) {
      const jobLevelList = String(jobLevel)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (jobLevelList.length > 0) {
        match.jobLevel = { $in: jobLevelList.map((item) => new RegExp(item, "i")) };
      }
    }

    if (experience) {
      match.experience = new RegExp(experience, "i");
    }

    if (education) {
      match.education = new RegExp(education, "i");
    }

    if (skills) {
      const skillsList = String(skills)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (skillsList.length > 0) {
        match.requiredSkills = { $all: skillsList };
      }
    }

    if (currency) {
      match.currency = currency;
    }

    const basePipeline = [{ $match: match }];

    const shouldHandleSalary =
      salaryFrom !== undefined || salaryTo !== undefined || sort === "salary";

    if (shouldHandleSalary) {
      basePipeline.push({
        $addFields: {
          salaryFromNumber: {
            $convert: { input: "$salaryFrom", to: "double", onError: null },
          },
          salaryToNumber: {
            $convert: { input: "$salaryTo", to: "double", onError: null },
          },
        },
      });

      const salaryFilters = [];
      if (salaryFrom !== undefined && salaryFrom !== "") {
        const minSalary = Number(salaryFrom);
        if (!Number.isNaN(minSalary)) {
          salaryFilters.push({ $gte: ["$salaryFromNumber", minSalary] });
        }
      }

      if (salaryTo !== undefined && salaryTo !== "") {
        const maxSalary = Number(salaryTo);
        if (!Number.isNaN(maxSalary)) {
          salaryFilters.push({ $lte: ["$salaryToNumber", maxSalary] });
        }
      }

      if (salaryFilters.length > 0) {
        basePipeline.push({
          $match: {
            $expr: {
              $and: salaryFilters,
            },
          },
        });
      }
    }

    const jobsPipeline = [...basePipeline];

    jobsPipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "recruiterId",
          foreignField: "_id",
          as: "recruiter",
        },
      },
      {
        $unwind: {
          path: "$recruiter",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          companyName: { $ifNull: ["$recruiter.fullName", ""] },
          companyLogo: { $ifNull: ["$recruiter.profilePicture", ""] },
        },
      },
    );

    const sortStage =
      sort === "oldest"
        ? { createdAt: 1 }
        : sort === "salary"
        ? { salaryFromNumber: 1 }
        : { createdAt: -1 };

    jobsPipeline.push({ $sort: sortStage });
    jobsPipeline.push({ $skip: (pageNumber - 1) * limitNumber });
    jobsPipeline.push({ $limit: limitNumber });

    if (shouldHandleSalary) {
      jobsPipeline.push({
        $project: {
          salaryFromNumber: 0,
          salaryToNumber: 0,
          recruiter: 0,
        },
      });
    } else {
      jobsPipeline.push({
        $project: {
          recruiter: 0,
        },
      });
    }

    const [jobs, totalResult] = await Promise.all([
      JobPost.aggregate(jobsPipeline),
      JobPost.aggregate([...basePipeline, { $count: "total" }]),
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    res.status(200).json({
      success: true,
      jobs,
      total,
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (error) {
    console.error("List job posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching job posts",
      error: error.message,
    });
  }
};

const listRecruiterJobPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const recruiter = await User.findById(userId).lean();
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can access this resource",
      });
    }

    const pipeline = [
      { $match: { recruiterId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "appliedjobs",
          localField: "_id",
          foreignField: "job",
          as: "applications",
        },
      },
      {
        $addFields: {
          applicantsCount: { $size: "$applications" },
        },
      },
      {
        $addFields: {
          statusLabel: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "published"] },
                  { $eq: ["$isActive", true] },
                  { $gte: ["$deadline", new Date()] },
                ],
              },
              "Open",
              "Closed",
            ],
          },
        },
      },
      {
        $project: {
          applications: 0,
          __v: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const jobs = await JobPost.aggregate(pipeline);

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Recruiter job posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching recruiter job posts",
      error: error.message,
    });
  }
};

const updateJobPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const recruiter = await User.findById(userId).lean();
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can update jobs",
      });
    }

    const job = await JobPost.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.recruiterId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this job",
      });
    }

    const updates = { ...req.body };
    delete updates.recruiterId;

    const updated = await JobPost.findByIdAndUpdate(id, updates, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      jobPost: updated,
    });
  } catch (error) {
    console.error("Update job post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating job post",
      error: error.message,
    });
  }
};

const getJobPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobPost.findById(id)
      .populate(
        "recruiterId",
        "fullName profilePicture email address companySize foundedYear websiteUrl about",
      )
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const recruiter = job.recruiterId || {};
    const companyLogo = recruiter.profilePicture || "";
    const jobResponse = {
      id: job._id.toString(),
      jobTitle: job.jobTitle,
      companyName: recruiter.fullName || "Company",
      companyLogo,
      companyEmail: job.contactEmail || recruiter.email || "",
      companyLocation: recruiter.address || "",
      companyAbout: recruiter.about || "",
      department: job.department || "",
      location: job.location || "",
      jobLevel: job.jobLevel || "",
      jobType: job.jobType || "",
      workMode: job.workMode || "",
      gender: job.gender || "both",
      openings: job.openings || 0,
      deadline: job.deadline,
      description: job.description || "",
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      requiredSkills: job.requiredSkills || [],
      experience: job.experience || "",
      education: job.education || "",
      salaryFrom: job.salaryFrom || "",
      salaryTo: job.salaryTo || "",
      currency: job.currency || "",
      benefits: job.benefits || [],
      interviewStages: job.interviewStages || [],
      assessmentId: job.assessmentId || null,
      assessmentRequired: job.assessmentRequired || false,
      assessmentSource: job.assessmentSource || "recruiter",
      createdAt: job.createdAt,
    };

    return res.status(200).json({
      success: true,
      job: jobResponse,
    });
  } catch (error) {
    console.error("Get job post error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching job",
      error: error.message,
    });
  }
};

const createJobPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const recruiter = await User.findById(userId);

    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can post jobs",
      });
    }

    const {
      jobTitle,
      department,
      location,
      workMode,
      gender,
      jobLevel,
      jobType,
      openings,
      deadline,
      description,
      contactEmail,
      responsibilities,
      requirements,
      requiredSkills,
      experience,
      education,
      salaryFrom,
      salaryTo,
      currency,
      benefits,
      interviewStages,
      assessmentId,
      assessmentRequired,
      status,
    } = req.body;

    const requiredFields = {
      jobTitle,
      department,
      location,
      workMode,
      gender,
      jobLevel,
      jobType,
      openings,
      deadline,
      description,
      salaryFrom,
      salaryTo,
      currency,
    };

    const missing = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields: missing,
      });
    }

    const openingsNumber = Number(openings);
    if (Number.isNaN(openingsNumber) || openingsNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Openings must be a positive number",
      });
    }

    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid deadline date",
      });
    }

    const jobPost = new JobPost({
      recruiterId: userId,
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      location: location.trim(),
      workMode,
      gender,
      jobLevel: jobLevel.trim(),
      jobType: jobType.trim(),
      contactEmail: contactEmail ? contactEmail.trim() : "",
      openings: openingsNumber,
      deadline: deadlineDate,
      description: description || "",
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      experience: experience || "",
      education: education || "",
      salaryFrom: String(salaryFrom).trim(),
      salaryTo: String(salaryTo).trim(),
      currency: currency.trim(),
      benefits: Array.isArray(benefits) ? benefits : [],
      interviewStages: Array.isArray(interviewStages) ? interviewStages : [],
      assessmentId: assessmentId || null,
      assessmentRequired: Boolean(assessmentRequired),
      assessmentSource: assessmentId ? "recruiter" : undefined,
      status: status || "published",
    });

    const savedJobPost = await jobPost.save();

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      jobPost: savedJobPost,
    });
  } catch (error) {
    console.error("Create job post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating job post",
      error: error.message,
    });
  }
};

module.exports = {
  createJobPost,
  listJobPosts,
  getJobPostById,
  listRecruiterJobPosts,
  updateJobPost,
};
