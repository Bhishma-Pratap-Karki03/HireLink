const mongoose = require("mongoose");

const appliedJobSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost",
      required: true,
    },
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    resumeUrl: { type: String, required: true },
    resumeFileName: { type: String, required: true },
    resumeFileSize: { type: Number, required: true },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["submitted", "reviewed", "shortlisted", "interview", "rejected", "hired"],
      default: "submitted",
    },
    atsScore: { type: Number, default: null },
    atsReport: { type: mongoose.Schema.Types.ObjectId, ref: "AtsReport", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppliedJob", appliedJobSchema);
