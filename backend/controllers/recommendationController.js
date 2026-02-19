const User = require("../models/userModel");
const RecommendationHistory = require("../models/recommendationHistoryModel");
const JobPost = require("../models/jobPostModel");
const {
  getRecommendationsForCandidate,
} = require("../services/recommendationService");

const ensureCandidateUser = async (userId) => {
  const me = await User.findById(userId).lean();

  if (!me) {
    return { error: { status: 404, message: "User not found" } };
  }

  const isAdminEmail = me.email === "hirelinknp@gmail.com";
  const role = isAdminEmail ? "admin" : me.role;

  if (role !== "candidate") {
    return {
      error: {
        status: 403,
        message: "Only candidates can access recommendations",
      },
    };
  }

  return { user: me };
};

exports.getMyRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const check = await ensureCandidateUser(userId);
    if (check.error) {
      return res.status(check.error.status).json({
        success: false,
        message: check.error.message,
      });
    }

    const limit = Number(req.query.limit || 10);
    const recommendations = await getRecommendationsForCandidate(userId, limit);
    await RecommendationHistory.create({
      candidate: userId,
      recommendations,
    });

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: error.message,
    });
  }
};

exports.getRecommendationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const check = await ensureCandidateUser(userId);
    if (check.error) {
      return res.status(check.error.status).json({
        success: false,
        message: check.error.message,
      });
    }

    const history = await RecommendationHistory.find({ candidate: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      history: history.map((item) => ({
        id: String(item._id),
        createdAt: item.createdAt,
        count: item.recommendations?.length || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load recommendation history",
      error: error.message,
    });
  }
};

exports.getRecommendationHistoryById = async (req, res) => {
  try {
    const userId = req.user.id;
    const check = await ensureCandidateUser(userId);
    if (check.error) {
      return res.status(check.error.status).json({
        success: false,
        message: check.error.message,
      });
    }

    const history = await RecommendationHistory.findOne({
      _id: req.params.id,
      candidate: userId,
    }).lean();

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Recommendation history not found",
      });
    }

    const storedRecommendations = history.recommendations || [];
    const jobIds = storedRecommendations
      .map((item) => item?.jobId)
      .filter(Boolean);

    let jobMap = new Map();
    if (jobIds.length > 0) {
      const jobs = await JobPost.find({ _id: { $in: jobIds } })
        .populate("recruiterId", "profilePicture")
        .select("_id companyLogo recruiterId")
        .lean();
      jobMap = new Map(
        jobs.map((job) => [
          String(job._id),
          job.companyLogo || job.recruiterId?.profilePicture || "",
        ]),
      );
    }

    const recommendations = storedRecommendations.map((item) => ({
      ...item,
      companyLogo: item.companyLogo || jobMap.get(String(item.jobId)) || "",
    }));

    return res.status(200).json({
      success: true,
      id: String(history._id),
      createdAt: history.createdAt,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load recommendation history details",
      error: error.message,
    });
  }
};

exports.deleteRecommendationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const check = await ensureCandidateUser(userId);
    if (check.error) {
      return res.status(check.error.status).json({
        success: false,
        message: check.error.message,
      });
    }

    const deleted = await RecommendationHistory.findOneAndDelete({
      _id: req.params.id,
      candidate: userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Recommendation history not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recommendation history deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete recommendation history",
      error: error.message,
    });
  }
};
