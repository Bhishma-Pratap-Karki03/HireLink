const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "connection_request_received",
        "connection_request_accepted",
        "application_status_updated",
        "project_review_received",
        "company_review_received",
      ],
      required: true,
      index: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConnectionRequest",
      default: null,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppliedJob",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    targetPath: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
