// reviewModel.js - Updated with proper pagination
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    reviewerName: {
      type: String,
      trim: true,
      required: true,
    },
    reviewerLocation: {
      type: String,
      trim: true,
      default: "",
    },
    reviewerRole: {
      type: String,
      trim: true,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["published", "hidden"],
      default: "published",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
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

// Create a compound index to prevent multiple reviews from same user for same company
reviewSchema.index({ companyId: 1, userId: 1 }, { unique: true });

// Create a compound index for efficient queries
reviewSchema.index({ companyId: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ companyId: 1, status: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
