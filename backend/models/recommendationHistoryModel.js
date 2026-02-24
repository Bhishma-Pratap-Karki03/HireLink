const mongoose = require("mongoose");

/*
   Sub-Schema: Recommendation Item
   Represents a single recommended job inside one recommendation run
*/
const recommendationItemSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true }, // ID of the recommended job
    jobTitle: { type: String, default: "" }, // Job title
    companyName: { type: String, default: "" }, // Company name
    location: { type: String, default: "" }, // Job location
    jobType: { type: String, default: "" }, // Full-time / Part-time / etc
    workMode: { type: String, default: "" }, // Remote / Hybrid / On-site

    score: { type: Number, default: 0 }, // ML prediction score (0–100)
    skillMatchPercent: { type: Number, default: 0 }, // Skill match percentage

    matchedSkills: { type: [String], default: [] }, // Skills candidate has
    missingSkills: { type: [String], default: [] }, // Skills candidate lacks

    reasons: { type: [String], default: [] }, // Explanation text for recommendation
  },
  { _id: false }, // Disable automatic _id for each recommendation item
);

/*
   Main Schema: Recommendation History
   Stores one complete recommendation run for a candidate
*/
const recommendationHistorySchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User collection
      required: true,
      index: true, // Indexed for faster search
    },

    recommendations: {
      type: [recommendationItemSchema], // Array of recommendation items
      default: [],
    },
  },
  { timestamps: true }, // Automatically adds createdAt & updatedAt
);

// Export model
module.exports = mongoose.model(
  "RecommendationHistory",
  recommendationHistorySchema,
);
