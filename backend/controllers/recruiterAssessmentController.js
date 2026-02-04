const RecruiterAssessment = require("../models/recruiterAssessmentModel");
const User = require("../models/userModel");

const createRecruiterAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can create assessments",
      });
    }

    const {
      title,
      description,
      type,
      difficulty,
      timeLimit,
      maxAttempts,
      status,
      deadline,
      skillTags,
      quizQuestions,
      writingTask,
      writingInstructions,
      writingFormat,
      codeProblem,
      codeLanguages,
      codeSubmission,
      codeEvaluation,
    } = req.body;

    const requiredFields = {
      title,
      description,
      type,
      difficulty,
      maxAttempts,
      status,
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

    const assessment = new RecruiterAssessment({
      title: String(title).trim(),
      description,
      type,
      difficulty,
      timeLimit: timeLimit || "",
      maxAttempts: Number(maxAttempts),
      status,
      deadline: deadline || null,
      skillTags: Array.isArray(skillTags)
        ? skillTags.filter((tag) => String(tag).trim())
        : [],
      quizQuestions: type === "quiz" && Array.isArray(quizQuestions) ? quizQuestions : [],
      writingTask: writingTask || "",
      writingInstructions: writingInstructions || "",
      writingFormat: writingFormat || "text",
      codeProblem: codeProblem || "",
      codeLanguages: Array.isArray(codeLanguages) ? codeLanguages : [],
      codeSubmission: codeSubmission || "file",
      codeEvaluation: codeEvaluation || "",
      createdBy: userId,
    });

    const savedAssessment = await assessment.save();

    res.status(201).json({
      success: true,
      message: "Assessment created successfully",
      assessment: savedAssessment,
    });
  } catch (error) {
    console.error("Create recruiter assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating assessment",
      error: error.message,
    });
  }
};

const getRecruiterAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await RecruiterAssessment.findById(id).lean();
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }
    res.status(200).json({ success: true, assessment });
  } catch (error) {
    console.error("Get recruiter assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching assessment",
      error: error.message,
    });
  }
};

module.exports = {
  createRecruiterAssessment,
  getRecruiterAssessmentById,
};
