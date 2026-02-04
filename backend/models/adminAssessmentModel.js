const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: [{ type: String, required: true, trim: true }],
    correctIndex: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const adminAssessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["quiz", "writing", "code"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    timeLimit: { type: String, default: "" },
    maxAttempts: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["active", "inactive"], required: true },
    deadline: { type: Date },
    visibleToRecruiters: { type: Boolean, default: true },
    skillTags: [{ type: String, trim: true }],
    quizQuestions: [quizQuestionSchema],
    writingTask: { type: String, default: "" },
    writingInstructions: { type: String, default: "" },
    writingFormat: {
      type: String,
      enum: ["text", "file", "link"],
      default: "text",
    },
    codeProblem: { type: String, default: "" },
    codeLanguages: [{ type: String, trim: true }],
    codeSubmission: { type: String, enum: ["file", "repo"], default: "file" },
    codeEvaluation: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AdminAssessment", adminAssessmentSchema);
