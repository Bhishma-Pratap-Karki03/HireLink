const AdminAssessment = require("../models/adminAssessmentModel");
const RecruiterAssessment = require("../models/recruiterAssessmentModel");
const AssessmentAttempt = require("../models/assessmentAttemptModel");
const User = require("../models/userModel");

const parseMinutes = (value) => {
  if (!value) return 60;
  const match = String(value).match(/(\d+)/);
  if (!match) return 60;
  const minutes = Number(match[1]);
  return Number.isNaN(minutes) || minutes <= 0 ? 60 : minutes;
};

const getAssessmentBySource = async (attempt) => {
  if (!attempt) return null;
  if (attempt.assessmentSource === "recruiter") {
    return RecruiterAssessment.findById(attempt.assessment).lean();
  }
  return AdminAssessment.findById(attempt.assessment).lean();
};

const autoSubmitIfExpired = async (attempt, assessment) => {
  if (!attempt || attempt.status !== "in_progress") return attempt;
  const now = new Date();
  if (now <= attempt.endTime) return attempt;

  let score = 0;
  if (assessment?.type === "quiz" && Array.isArray(assessment.quizQuestions)) {
    const answers = attempt.answers?.quizAnswers || [];
    score = assessment.quizQuestions.reduce((total, question, index) => {
      const correct = question.correctIndex;
      if (correct === undefined || correct === null) return total;
      return answers[index] === correct ? total + 1 : total;
    }, 0);
  }

  attempt.status = "submitted";
  attempt.submittedAt = now;
  attempt.score = score;
  await attempt.save();
  return attempt;
};

const listAvailableAssessments = async (req, res) => {
  try {
    const userId = req.user.id;
    const assessmentsRaw = await AdminAssessment.find({ status: "active" })
      .populate("createdBy", "role email")
      .sort({ createdAt: -1 })
      .lean();

    const assessments = assessmentsRaw.filter((item) => {
      const creator = item.createdBy;
      if (!creator) return false;
      return (
        creator.role === "admin" || creator.email === "hirelinknp@gmail.com"
      );
    });

    const attempts = await AssessmentAttempt.find({ candidate: userId })
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();
    const attemptsByAssessment = attempts.reduce((acc, attempt) => {
      const key = attempt.assessment.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(attempt);
      return acc;
    }, {});

    const now = new Date();

    const mapped = await Promise.all(
      assessments.map(async (assessment) => {
        const assessmentAttempts = (
          attemptsByAssessment[assessment._id.toString()] || []
        ).filter((attempt) => attempt.assessmentSource === "admin");
        let inProgress = assessmentAttempts.find(
          (attempt) => attempt.status === "in_progress",
        );
        if (inProgress) {
          const hydrated = await AssessmentAttempt.findById(inProgress._id);
          if (hydrated) {
            await autoSubmitIfExpired(hydrated, assessment);
            inProgress = hydrated.toObject();
          }
        }
        const submittedAttempts = assessmentAttempts.filter(
          (attempt) => attempt.status === "submitted",
        );
        const latestSubmitted = submittedAttempts[0] || null;
        const attemptsUsed = submittedAttempts.length;
        const attemptsLeft = Math.max(assessment.maxAttempts - attemptsUsed, 0);
        let status = "not_started";
        if (inProgress && inProgress.status === "in_progress") {
          status = "in_progress";
        } else if (attemptsUsed > 0) {
          status = "submitted";
        }

        return {
          id: assessment._id,
          title: assessment.title,
          type: assessment.type,
          difficulty: assessment.difficulty,
          timeLimit: assessment.timeLimit || "",
          maxAttempts: assessment.maxAttempts,
          deadline: assessment.deadline || "",
          quizTotal:
            assessment.type === "quiz" && Array.isArray(assessment.quizQuestions)
              ? assessment.quizQuestions.length
              : null,
          attemptsUsed,
          attemptsLeft,
          status,
          activeAttemptId: inProgress?._id || null,
          latestSubmittedAttemptId: latestSubmitted?._id || null,
          latestSubmittedAt: latestSubmitted?.submittedAt || null,
          latestScore:
            typeof latestSubmitted?.score === "number"
              ? latestSubmitted.score
              : null,
          remainingMs:
            inProgress && inProgress.status === "in_progress"
              ? Math.max(new Date(inProgress.endTime).getTime() - now.getTime(), 0)
              : 0,
        };
      }),
    );

    res.status(200).json({ success: true, assessments: mapped });
  } catch (error) {
    console.error("List available assessments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching assessments",
      error: error.message,
    });
  }
};

const startAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const assessment = await AdminAssessment.findById(id);
    if (!assessment || assessment.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Assessment not available",
      });
    }

    let inProgress = await AssessmentAttempt.findOne({
      assessment: id,
      candidate: userId,
      status: "in_progress",
      assessmentSource: "admin",
    });

    if (inProgress) {
      inProgress = await autoSubmitIfExpired(inProgress, assessment);
      if (inProgress.status === "in_progress") {
        return res.status(200).json({
          success: true,
          attempt: inProgress,
          assessment,
        });
      }
    }

    const submittedCount = await AssessmentAttempt.countDocuments({
      assessment: id,
      candidate: userId,
      status: "submitted",
      assessmentSource: "admin",
    });

    if (submittedCount >= assessment.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: "No attempts remaining",
      });
    }

    const minutes = parseMinutes(assessment.timeLimit);
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + minutes * 60000);

    const attempt = await AssessmentAttempt.create({
      assessment: id,
      assessmentSource: "admin",
      candidate: userId,
      attemptNumber: submittedCount + 1,
      startTime,
      endTime,
      status: "in_progress",
      answers: {
        quizAnswers: [],
        writingResponse: "",
        writingLink: "",
        codeResponse: "",
        codeLink: "",
      },
    });

    res.status(201).json({ success: true, attempt, assessment });
  } catch (error) {
    console.error("Start assessment attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Server error starting attempt",
      error: error.message,
    });
  }
};

const getAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { attemptId } = req.params;
    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }
    if (attempt.candidate.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const assessment = await getAssessmentBySource(attempt);
    await autoSubmitIfExpired(attempt, assessment);

    res.status(200).json({
      success: true,
      attempt,
      assessment,
    });
  } catch (error) {
    console.error("Get attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching attempt",
      error: error.message,
    });
  }
};

const saveAnswers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { attemptId } = req.params;
    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }
    if (attempt.candidate.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const assessment = await getAssessmentBySource(attempt);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    await autoSubmitIfExpired(attempt, assessment);
    if (attempt.status !== "in_progress") {
      return res.status(409).json({
        success: false,
        message: "Attempt already submitted",
      });
    }

    attempt.answers = {
      ...attempt.answers,
      ...req.body,
    };
    await attempt.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Save answers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saving answers",
      error: error.message,
    });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { attemptId } = req.params;
    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }
    if (attempt.candidate.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const assessment = await getAssessmentBySource(attempt);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    if (attempt.status === "submitted") {
      return res.status(200).json({ success: true, attempt });
    }

    attempt.answers = {
      ...attempt.answers,
      ...req.body,
    };

    attempt.status = "submitted";
    attempt.submittedAt = new Date();

    if (assessment.type === "quiz" && Array.isArray(assessment.quizQuestions)) {
      const answers = attempt.answers?.quizAnswers || [];
      const score = assessment.quizQuestions.reduce((total, question, index) => {
        const correct = question.correctIndex;
        if (correct === undefined || correct === null) return total;
        return answers[index] === correct ? total + 1 : total;
      }, 0);
      attempt.score = score;
    }

    await attempt.save();

    res.status(200).json({ success: true, attempt });
  } catch (error) {
    console.error("Submit attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Server error submitting attempt",
      error: error.message,
    });
  }
};

module.exports = {
  listAvailableAssessments,
  startAttempt,
  saveAnswers,
  submitAttempt,
  getAttempt,
};
