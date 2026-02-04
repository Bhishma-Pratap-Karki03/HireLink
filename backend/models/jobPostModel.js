const mongoose = require("mongoose");

const interviewStageSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    salary: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const jobPostSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactEmail: { type: String, trim: true, default: "" },
    jobTitle: { type: String, trim: true, required: true },
    department: { type: String, trim: true, required: true },
    location: { type: String, trim: true, required: true },
    workMode: {
      type: String,
      enum: ["remote", "on-site", "hybrid"],
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "both"],
      required: true,
    },
    jobLevel: { type: String, trim: true, required: true },
    jobType: { type: String, trim: true, required: true },
    openings: { type: Number, min: 1, required: true },
    deadline: { type: Date, required: true },
    description: { type: String, default: "" },
    responsibilities: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    requiredSkills: [{ type: String, trim: true }],
    experience: { type: String, trim: true, default: "" },
    education: { type: String, trim: true, default: "" },
    salaryFrom: { type: String, trim: true, required: true },
    salaryTo: { type: String, trim: true, required: true },
    currency: { type: String, trim: true, required: true },
    benefits: [{ type: String, trim: true }],
    interviewStages: [interviewStageSchema],
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      default: null,
    },
    assessmentRequired: { type: Boolean, default: false },
    assessmentSource: {
      type: String,
      enum: ["admin", "recruiter"],
      default: "recruiter",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

module.exports = mongoose.model("JobPost", jobPostSchema);
