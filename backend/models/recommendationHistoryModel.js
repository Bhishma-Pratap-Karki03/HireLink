const mongoose = require("mongoose");

const recommendationItemSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true },
    jobTitle: { type: String, default: "" },
    companyName: { type: String, default: "" },
    location: { type: String, default: "" },
    jobType: { type: String, default: "" },
    workMode: { type: String, default: "" },
    score: { type: Number, default: 0 },
    skillMatchPercent: { type: Number, default: 0 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    reasons: { type: [String], default: [] },
  },
  { _id: false },
);

const recommendationHistorySchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recommendations: {
      type: [recommendationItemSchema],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "RecommendationHistory",
  recommendationHistorySchema,
);

