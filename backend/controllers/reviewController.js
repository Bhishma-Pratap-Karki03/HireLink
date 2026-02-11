// reviewController.js - Updated with proper exports
const Review = require("../models/reviewModel");
const User = require("../models/userModel");

// Get all reviews for a company (public)
const getCompanyReviews = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    // Check if company exists and is a recruiter
    const company = await User.findById(companyId);
    if (!company || company.role !== "recruiter") {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Get all published and not deleted reviews for this company
    const reviews = await Review.find({
      companyId,
      status: "published",
      isDeleted: false,
    })
      .populate("userId", "fullName profilePicture address currentJobTitle")
      .sort({ createdAt: -1 });

    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      averageRating = totalRating / reviews.length;
    }

    // Format reviews for response with proper profile picture URL
    const formattedReviews = reviews.map((review) => {
      const reviewer = review.userId;
      const reviewerName = reviewer?.fullName || "Deleted User";
      const reviewerLocation = reviewer?.address || "Unknown";
      const reviewerRole =
        review.reviewerRole || reviewer?.currentJobTitle || "";
      const reviewerAvatar = reviewer?.profilePicture
        ? reviewer.profilePicture.startsWith("http")
          ? reviewer.profilePicture
          : `http://localhost:5000${reviewer.profilePicture}`
        : "";

      return {
      id: review._id,
      rating: review.rating,
      text: review.description,
      title: review.title || "",
      reviewerName,
      reviewerLocation,
      reviewerRole,
      date: new Date(review.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      reviewerAvatar,
      status: review.status,
      };
    });

    res.status(200).json({
      success: true,
      reviews: formattedReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching reviews",
      error: error.message,
    });
  }
};

// Get company reviews for recruiter (with status filtering)
const getCompanyReviewsForRecruiter = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { status } = req.query; // "all", "published", "hidden"
    const userId = req.user.id;

    // Check if user is the recruiter of this company
    const company = await User.findOne({
      _id: companyId,
      _id: userId,
      role: "recruiter",
    });

    if (!company) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage reviews for this company",
      });
    }

    // Build query based on status
    const query = {
      companyId,
      isDeleted: false,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    // Get reviews based on query
    const reviews = await Review.find(query)
      .populate("userId", "fullName profilePicture address currentJobTitle")
      .sort({ createdAt: -1 });

    // Format reviews for response
    const formattedReviews = reviews.map((review) => {
      const reviewer = review.userId;
      const reviewerName = reviewer?.fullName || "Deleted User";
      const reviewerLocation = reviewer?.address || "Unknown";
      const reviewerRole =
        review.reviewerRole || reviewer?.currentJobTitle || "";
      const reviewerAvatar = reviewer?.profilePicture
        ? reviewer.profilePicture.startsWith("http")
          ? reviewer.profilePicture
          : `http://localhost:5000${reviewer.profilePicture}`
        : "";

      return {
      id: review._id,
      rating: review.rating,
      text: review.description,
      title: review.title || "",
      reviewerName,
      reviewerLocation,
      reviewerRole,
      date: new Date(review.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      reviewerAvatar,
      status: review.status,
      };
    });

    // Get counts for each status
    const totalReviews = await Review.countDocuments({
      companyId,
      isDeleted: false,
    });
    const publishedReviews = await Review.countDocuments({
      companyId,
      status: "published",
      isDeleted: false,
    });
    const hiddenReviews = await Review.countDocuments({
      companyId,
      status: "hidden",
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      reviews: formattedReviews,
      counts: {
        all: totalReviews,
        published: publishedReviews,
        hidden: hiddenReviews,
      },
    });
  } catch (error) {
    console.error("Get recruiter reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching reviews",
      error: error.message,
    });
  }
};

// Recruiter: Update review status (hide/show)
const updateReviewStatus = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body; // "published" or "hidden"
    const userId = req.user.id;

    // Validate status
    if (!["published", "hidden"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'published' or 'hidden'",
      });
    }

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user is the recruiter of this company
    const company = await User.findOne({
      _id: review.companyId,
      _id: userId,
      role: "recruiter",
    });

    if (!company) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    // Update review status
    review.status = status;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${status === "hidden" ? "hidden" : "published"} successfully`,
      review: {
        id: review._id,
        status: review.status,
      },
    });
  } catch (error) {
    console.error("Update review status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating review status",
      error: error.message,
    });
  }
};

// Recruiter: Delete review (soft delete)
const deleteReviewByRecruiter = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user is the recruiter of this company
    const company = await User.findOne({
      _id: review.companyId,
      _id: userId,
      role: "recruiter",
    });

    if (!company) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    // Soft delete the review
    review.isDeleted = true;
    await review.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting review",
      error: error.message,
    });
  }
};

// Submit a review
const submitReview = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { rating, title, description, reviewerRole } = req.body;
    const userId = req.user.id;

    // Check if company exists and is a recruiter
    const company = await User.findById(companyId);
    if (!company || company.role !== "recruiter") {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has already submitted a review for this company
    const existingReview = await Review.findOne({
      companyId,
      userId,
      isDeleted: false,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "You have already submitted a review for this company. You can update your existing review instead.",
        code: "REVIEW_ALREADY_EXISTS",
        existingReviewId: existingReview._id,
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating (1-5)",
      });
    }

    // Validate description
    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Review description must be at least 10 characters",
      });
    }

    // Create new review
    const newReview = new Review({
      companyId,
      userId,
      rating,
      title: title || "", // Title is optional
      description: description.trim(),
      reviewerName: user.fullName,
      reviewerLocation: user.address || "",
      reviewerRole: reviewerRole || user.currentJobTitle || "",
      status: "published", // Default to published
      isApproved: true,
      isDeleted: false,
    });

    await newReview.save();

    // Get the created review with populated user data
    const savedReview = await Review.findById(newReview._id).populate(
      "userId",
      "fullName profilePicture address currentJobTitle",
    );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: {
        id: savedReview._id,
        rating: savedReview.rating,
        text: savedReview.description,
        title: savedReview.title,
        reviewerName: savedReview.userId.fullName,
        reviewerLocation: savedReview.userId.address || "Unknown",
        reviewerRole: savedReview.reviewerRole,
        date: new Date(savedReview.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        reviewerAvatar: savedReview.userId.profilePicture
          ? savedReview.userId.profilePicture.startsWith("http")
            ? savedReview.userId.profilePicture
            : `http://localhost:5000${savedReview.userId.profilePicture}`
          : "",
        status: savedReview.status,
      },
    });
  } catch (error) {
    console.error("Submit review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error submitting review",
      error: error.message,
    });
  }
};

// Get user's review for a company
const getMyReview = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      companyId,
      userId,
      isDeleted: false,
    }).populate("userId", "fullName profilePicture address currentJobTitle");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "You haven't reviewed this company yet",
      });
    }

    res.status(200).json({
      success: true,
      review: {
        id: review._id,
        rating: review.rating,
        text: review.description,
        title: review.title,
        reviewerName: review.userId.fullName,
        reviewerLocation: review.userId.address || "Unknown",
        reviewerRole: review.reviewerRole,
        date: new Date(review.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        reviewerAvatar: review.userId.profilePicture
          ? review.userId.profilePicture.startsWith("http")
            ? review.userId.profilePicture
            : `http://localhost:5000${review.userId.profilePicture}`
          : "",
        status: review.status,
      },
    });
  } catch (error) {
    console.error("Get my review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching your review",
      error: error.message,
    });
  }
};

// Update a review
const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, description, reviewerRole } = req.body;
    const userId = req.user.id;

    // Find the review
    const review = await Review.findOne({
      _id: reviewId,
      userId,
      isDeleted: false,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to edit it",
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating (1-5)",
      });
    }

    // Validate description if provided
    if (description !== undefined && description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Review description must be at least 10 characters",
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title || "";
    if (description !== undefined) review.description = description.trim();
    if (reviewerRole !== undefined) review.reviewerRole = reviewerRole || "";

    await review.save();

    // Get updated review with populated user data
    const updatedReview = await Review.findById(review._id).populate(
      "userId",
      "fullName profilePicture address currentJobTitle",
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: {
        id: updatedReview._id,
        rating: updatedReview.rating,
        text: updatedReview.description,
        title: updatedReview.title,
        reviewerName: updatedReview.userId.fullName,
        reviewerLocation: updatedReview.userId.address || "Unknown",
        reviewerRole: updatedReview.reviewerRole,
        date: new Date(updatedReview.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        reviewerAvatar: updatedReview.userId.profilePicture
          ? updatedReview.userId.profilePicture.startsWith("http")
            ? updatedReview.userId.profilePicture
            : `http://localhost:5000${updatedReview.userId.profilePicture}`
          : "",
        status: updatedReview.status,
      },
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating review",
      error: error.message,
    });
  }
};

// Delete a review by user
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      userId,
      isDeleted: false,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting review",
      error: error.message,
    });
  }
};

// Export all functions
module.exports = {
  getCompanyReviews,
  getCompanyReviewsForRecruiter,
  updateReviewStatus,
  deleteReviewByRecruiter,
  submitReview,
  getMyReview,
  updateReview,
  deleteReview,
};
