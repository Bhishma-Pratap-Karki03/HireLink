const mongoose = require("mongoose");

const assessmentAttemptSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    assessmentSource: {
      type: String,
      enum: ["admin", "recruiter"],
      default: "admin",
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attemptNumber: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["in_progress", "submitted"],
      default: "in_progress",
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    submittedAt: { type: Date },
    score: { type: Number, default: 0 },
    answers: {
      quizAnswers: [{ type: Number }],
      writingResponse: { type: String, default: "" },
      writingLink: { type: String, default: "" },
      codeResponse: { type: String, default: "" },
      codeLink: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AssessmentAttempt", assessmentAttemptSchema);
