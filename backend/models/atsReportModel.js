const mongoose = require("mongoose");

const atsReportSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost",
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppliedJob",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    extracted: {
      skills: [{ type: String }],
      emails: [{ type: String }],
      phones: [{ type: String }],
      experienceYears: { type: Number, default: 0 },
      educationLevel: { type: String, default: "" },
      educationRank: { type: Number, default: 0 },
    },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    experienceMatch: { type: Boolean, default: false },
    educationMatch: { type: Boolean, default: false },
    skillsScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    educationScore: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AtsReport", atsReportSchema);
