// EmployerDetailsPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/EmployerDetailsPage.css";

// Import images from Employers Page Images folder
import heroBgLeft from "../images/Employers Page Images/8_189.svg";
import heroBgRight from "../images/Employers Page Images/8_197.svg";
import heroCircle from "../images/Employers Page Images/8_205.svg";
import heroIcon1 from "../images/Employers Page Images/8_208.svg";
import heroIcon2 from "../images/Employers Page Images/8_209.svg";

// Use the same icon names from your HTML code
import locationIcon from "../images/Employers Page Images/5_107.svg";
import sizeIcon from "../images/Employers Page Images/5_115.svg";
import emailIcon from "../images/Employers Page Images/5_124.svg";
import foundedIcon from "../images/Employers Page Images/5_131.svg";

// Job meta icons from HTML
import jobLocationIcon from "../images/Employers Page Images/I5_270_1_3220.svg";
import jobTimeIcon from "../images/Employers Page Images/I5_270_1_3225.svg";
import jobCardLocationIcon from "../images/Job List Page Images/location.svg";
import jobCardTypeIcon from "../images/Job List Page Images/job-type.svg";
import jobCardWorkModeIcon from "../images/Job List Page Images/work-mode.svg";
import jobCardBookmarkIcon from "../images/Recruiter Job Post Page Images/bookmarkIcon.svg";
import jobCardShareIcon from "../images/Recruiter Job Post Page Images/shareFg.svg";

// Share and save icons
import shareIcon from "../images/Employers Page Images/I5_270_1_3212.svg";
import saveIcon from "../images/Employers Page Images/8_426.svg";
import savedIcon from "../images/Employers Page Images/Saved icon.svg";

// Star icons from HTML
import starFilled from "../images/Employers Page Images/5_169.svg";
import starHalf from "../images/Employers Page Images/5_171.svg";
import starEmpty from "../images/Employers Page Images/unfilled stars.svg";

// Social icons
import facebookIcon from "../images/Employers Page Images/Facebook.png";
import linkedinIcon from "../images/Employers Page Images/Linkedin.png";
import instagramIcon from "../images/Employers Page Images/Instagram icon.jpg";

// Review illustration
import reviewIllustration from "../images/Employers Page Images/3af141ed608258860f6993ff7346ee87372d5fb8.png";

// Default logo
import defaultLogo from "../images/Register Page Images/Default Profile.webp";

// Import user service to get user profile picture
import {
  getProfileImageUrl,
  fetchUserProfile,
  UserProfile,
} from "../utils/userService";

// Define interface for Company details
interface CompanyDetails {
  id: string;
  name: string;
  logo: string;
  location: string;
  email: string;
  companySize: string;
  foundedYear: string;
  websiteUrl: string;
  about: string;
  workspaceImages: string[];
  linkedinUrl: string;
  instagramUrl: string;
  facebookUrl: string;
}

// Define interface for Job
interface Job {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  workMode: string;
  logo: string;
}

// Define interface for Review
interface Review {
  id: string;
  rating: number;
  text: string;
  title: string;
  reviewerName: string;
  reviewerLocation: string;
  reviewerRole: string;
  date: string;
  reviewerAvatar: string;
}

const EmployerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for company details
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    description: "",
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(true);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  // Reviews state from API
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isCheckingReview, setIsCheckingReview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("Token from localStorage:", token); // Debug log
    setIsLoggedIn(!!token);

    // Fetch user profile if logged in
    if (token) {
      fetchUserProfileData();
    }
  }, []);

  useEffect(() => {
    console.log("isLoggedIn state changed:", isLoggedIn); // Debug log
  }, [isLoggedIn]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);

  // Fetch user profile data
  const fetchUserProfileData = async () => {
    try {
      const profile = await fetchUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Fetch company details from backend
  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/employers/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.company) {
          setCompany(data.company);
        } else {
          setError("Failed to load company details");
        }
      } else {
        if (response.status === 404) {
          setError("Company not found");
        } else {
          setError("Failed to fetch company details");
        }
      }
    } catch (err: any) {
      console.error("Error fetching company details:", err);
      setError(
        err.message || "Failed to load company details. Please try again.",
      );
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    if (!id) return;
    try {
      setJobsLoading(true);
      setJobsError(null);
      const response = await fetch(
        `http://localhost:5000/api/jobs?recruiterId=${id}&sort=newest&limit=6`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch openings");
      }

      const mappedJobs = (data.jobs || []).map((job: any) => ({
        id: job.id || job._id,
        title: job.jobTitle || "Untitled Role",
        company: job.companyName || company?.name || "Company",
        type: job.jobType || "Full-Time",
        location: job.location || "Location",
        workMode: job.workMode || "remote",
        logo: resolveLogo(job.companyLogo || company?.logo),
      }));

      setJobs(mappedJobs);
    } catch (err: any) {
      setJobsError(err?.message || "Failed to load openings");
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  // Check if user has already reviewed this company
  const checkExistingReview = async () => {
    if (!id || !isLoggedIn) return;

    setIsCheckingReview(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/reviews/company/${id}/my-review`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.review) {
          setExistingReview(data.review);
          // Pre-fill the review form with existing review
          setNewReview({
            rating: data.review.rating,
            title: data.review.title,
            description: data.review.text,
          });
        } else {
          setExistingReview(null);
        }
      } else if (response.status === 404) {
        // No existing review found
        setExistingReview(null);
      } else {
        console.error("Failed to check existing review");
      }
    } catch (err) {
      console.error("Error checking existing review:", err);
    } finally {
      setIsCheckingReview(false);
    }
  };

  // Fetch reviews from API
  const fetchReviews = async () => {
    if (!id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/company/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Only show published reviews
          setReviews(data.reviews || []);
          setAverageRating(data.averageRating || 0);
        }
      } else {
        console.error("Failed to fetch reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  // Fetch company details on component mount
  useEffect(() => {
    if (id) {
      fetchCompanyDetails();
      fetchCompanyJobs();
      fetchReviews();
    } else {
      setError("No company ID provided");
      setLoading(false);
    }
  }, [id, isReviewSubmitted]);

  useEffect(() => {
    if (company?.name) {
      fetchCompanyJobs();
    }
  }, [company?.name]);

  const formatWorkMode = (mode?: string) => {
    if (!mode) return "Remote";
    const normalized = mode.toLowerCase();
    if (normalized === "on-site" || normalized === "onsite") return "On-site";
    if (normalized === "hybrid") return "Hybrid";
    return "Remote";
  };

  // Check for existing review when logged in status changes
  useEffect(() => {
    if (isLoggedIn && id) {
      checkExistingReview();
    }
  }, [isLoggedIn, id]);

  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleViewDetails = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleApplyNow = (jobId: string) => {
    console.log("Apply for job:", jobId);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: company?.name || "Company Details",
        text: `Check out ${company?.name} on HireLink`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleSocialLink = (url: string, platform: string) => {
    if (url && url.trim() !== "") {
      let finalUrl = url.trim();
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = `https://${finalUrl}`;
      }
      window.open(finalUrl, "_blank");
    } else {
      alert(
        `${company?.name || "This company"} doesn't have a ${platform} profile`,
      );
    }
  };

  const handleSendMessage = () => {
    console.log("Send message to company:", company?.id);
  };

  const handleExploreMore = () => {
    navigate("/employers");
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = defaultLogo;
  };

  const resolveLogo = (logo?: string) => {
    if (!logo) return defaultLogo;
    if (logo.startsWith("http")) return logo;
    return `http://localhost:5000${logo.startsWith("/") ? "" : "/"}${logo}`;
  };

  // Review form handlers
  const handleRatingClick = (rating: number) => {
    setNewReview({ ...newReview, rating });
  };

  const handleStarHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      setReviewError("Please select a rating");
      return;
    }
    if (!newReview.description.trim()) {
      setReviewError("Please enter a review description");
      return;
    }
    if (newReview.description.trim().length < 10) {
      setReviewError("Review description must be at least 10 characters");
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setReviewError("Please login to submit a review");
        // Redirect to login page
        setTimeout(() => {
          navigate("/login", {
            state: {
              from: `/employers/${id}`,
              message: "Please login to submit a review",
            },
          });
        }, 1500);
        setSubmittingReview(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/reviews/company/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: newReview.rating,
            title: newReview.title, // Optional title
            description: newReview.description,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Clear form and close it
        setNewReview({ rating: 0, title: "", description: "" });
        setShowReviewForm(false);
        setIsReviewSubmitted(!isReviewSubmitted); // Trigger re-fetch
        setExistingReview(data.review); // Set the existing review
        setReviewError(null);

        // Show success message
        setReviewError("Review submitted successfully!");
        setTimeout(() => setReviewError(null), 3000);
      } else if (
        response.status === 400 &&
        data.code === "REVIEW_ALREADY_EXISTS"
      ) {
        // User already has a review
        setReviewError(
          "You have already submitted a review for this company. You can update your existing review.",
        );
        setExistingReview(null); // Reset existing review to trigger re-check
        checkExistingReview(); // Re-check for existing review
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setReviewError("Your session has expired. Please login again.");
        setTimeout(() => {
          navigate("/login", {
            state: {
              from: `/employers/${id}`,
              message: "Your session has expired",
            },
          });
        }, 1500);
      } else {
        setReviewError(data.message || "Failed to submit review");
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setReviewError("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Update existing review
  const handleUpdateReview = async () => {
    if (!existingReview) return;

    if (newReview.rating === 0) {
      setReviewError("Please select a rating");
      return;
    }
    if (!newReview.description.trim()) {
      setReviewError("Please enter a review description");
      return;
    }
    if (newReview.description.trim().length < 10) {
      setReviewError("Review description must be at least 10 characters");
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/reviews/${existingReview.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: newReview.rating,
            title: newReview.title,
            description: newReview.description,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Clear form and close it
        setNewReview({ rating: 0, title: "", description: "" });
        setShowReviewForm(false);
        setIsReviewSubmitted(!isReviewSubmitted); // Trigger re-fetch
        setExistingReview(data.review); // Update existing review
        setReviewError(null);

        // Show success message
        setReviewError("Review updated successfully!");
        setTimeout(() => setReviewError(null), 3000);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setReviewError("Your session has expired. Please login again.");
        setTimeout(() => {
          navigate("/login", {
            state: {
              from: `/employers/${id}`,
              message: "Your session has expired",
            },
          });
        }, 1500);
      } else {
        setReviewError(data.message || "Failed to update review");
      }
    } catch (err: any) {
      console.error("Error updating review:", err);
      setReviewError("Failed to update review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete existing review
  const handleDeleteReview = async () => {
    if (!existingReview) return;

    setSubmittingReview(true);
    setReviewError(null);
    setShowDeleteConfirm(false);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/reviews/${existingReview.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Clear form and close it
        setNewReview({ rating: 0, title: "", description: "" });
        setShowReviewForm(false);
        setExistingReview(null);
        setIsReviewSubmitted(!isReviewSubmitted); // Trigger re-fetch
        setReviewError(null);

        // Show success message
        setReviewError("Review deleted successfully!");
        setTimeout(() => setReviewError(null), 3000);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setReviewError("Your session has expired. Please login again.");
        setTimeout(() => {
          navigate("/login", {
            state: {
              from: `/employers/${id}`,
              message: "Your session has expired",
            },
          });
        }, 1500);
      } else {
        setReviewError(data.message || "Failed to delete review");
      }
    } catch (err: any) {
      console.error("Error deleting review:", err);
      setReviewError("Failed to delete review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Render stars for reviews
  const renderStars = (
    rating: number,
    size: "small" | "medium" | "large" = "medium",
  ) => {
    const sizeClass = `employer-details-star-${size}`;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <img
            key={i}
            src={starFilled}
            alt="star"
            className={`employer-details-star ${sizeClass}`}
          />,
        );
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(
          <img
            key={i}
            src={starHalf}
            alt="half star"
            className={`employer-details-star ${sizeClass}`}
          />,
        );
      } else {
        stars.push(
          <img
            key={i}
            src={starEmpty}
            alt="empty star"
            className={`employer-details-star ${sizeClass}`}
          />,
        );
      }
    }
    return stars;
  };

  // Render stars for rating input
  const renderRatingStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const isFilled = star <= (newReview.rating || hoveredRating);
      const src = isFilled ? starFilled : starEmpty;

      return (
        <img
          key={star}
          src={src}
          alt={`Rate ${star} stars`}
          className="employer-details-rating-star"
          onClick={() => handleRatingClick(star)}
          onMouseEnter={() => handleStarHover(star)}
          onMouseLeave={() => setHoveredRating(0)}
          style={{
            cursor: "pointer",
            opacity:
              hoveredRating > 0 && star > hoveredRating && !isFilled ? 0.5 : 1,
          }}
        />
      );
    });
  };

  // Function to check if text is placeholder/test data
  const isPlaceholderText = (text: string): boolean => {
    if (!text || !text.trim()) return true;
    const trimmed = text.trim();
    // Check for repeated single characters (like "fffffff" or "aaaaaa")
    if (/^([a-z])\1{10,}$/i.test(trimmed)) return true;
    // Check for common placeholder patterns
    if (
      /^(lorem|test|placeholder|sample|dummy|ffff+|aaaa+|xxxx+)/i.test(trimmed)
    )
      return true;
    return false;
  };

  // Function to get preview text (first 60 characters)
  const getPreviewText = (text: string) => {
    if (!text || text.trim().length === 0) return "";
    if (text.length <= 60) return text;
    return text.substring(0, 60) + "...";
  };

  // Toggle review expansion
  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviewId(expandedReviewId === reviewId ? null : reviewId);
  };

  // Handle opening review form
  const handleOpenReviewForm = () => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: `/employers/${id}`,
          message: "Please login to write a review",
        },
      });
      return;
    }

    if (existingReview) {
      // Pre-fill with existing review
      setNewReview({
        rating: existingReview.rating,
        title: existingReview.title,
        description: existingReview.text,
      });
    } else {
      // Clear form for new review
      setNewReview({ rating: 0, title: "", description: "" });
    }
    setShowReviewForm(true);
  };

  return (
    <div className="employer-details-page">
      <Navbar />

      {/* Hero Section */}
      <section className="employer-details-hero">
        <div className="employer-details-hero-wrapper">
          <div className="employer-details-hero-bg-elements">
            <img
              src={heroBgLeft}
              className="employer-details-bg-left"
              alt="Background decoration left"
            />
            <img
              src={heroBgRight}
              className="employer-details-bg-right"
              alt="Background decoration right"
            />
            <img
              src={heroCircle}
              className="employer-details-bg-circle"
              alt="Background circle"
            />
            <img
              src={heroIcon1}
              className="employer-details-bg-icon-1"
              alt="Background icon 1"
            />
            <img
              src={heroIcon2}
              className="employer-details-bg-icon-2"
              alt="Background icon 2"
            />
          </div>

          <div className="employer-details-hero-content">
            <div className="employer-details-company-header">
              {company ? (
                <>
                  <div className="employer-details-logo-wrapper">
                    <img
                      src={company.logo || defaultLogo}
                      alt={company.name}
                      className="employer-details-logo"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="employer-details-company-text">
                    <h1>{company.name}</h1>
                    <p>Find your dream job at {company.name}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="employer-details-logo-skeleton"></div>
                  <div className="employer-details-company-text">
                    <h1>Company Details</h1>
                    <p>Find your desired company and get your dream job</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="employer-details-main-content">
        <div className="employer-details-container">
          {/* Loading State */}
          {loading && (
            <div className="employer-details-loading">
              <p>Loading company details...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="employer-details-error">
              <p>{error}</p>
              <button
                onClick={() => navigate("/employers")}
                className="employer-details-btn-back"
              >
                Back to Companies
              </button>
            </div>
          )}

          {/* Company Content */}
          {!loading && !error && company && (
            <div className="employer-details-content-grid">
              {/* Left Column */}
              <div className="employer-details-content-left">
                {/* Overview Section */}
                <div className="employer-details-overview-section">
                  <h2>Overview</h2>
                  <div className="employer-details-overview-text">
                    {company.about ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: company.about }}
                      />
                    ) : (
                      <p>No company description available.</p>
                    )}
                  </div>
                </div>

                {/* Gallery Section */}
                <div className="employer-details-gallery-section">
                  <h2>Life at {company.name}</h2>
                  <div className="employer-details-gallery-grid">
                    {company.workspaceImages &&
                    company.workspaceImages.length > 0 ? (
                      company.workspaceImages.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Life at ${company.name} ${index + 1}`}
                          className="employer-details-gallery-img"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/300x200?text=Workspace+Image";
                          }}
                        />
                      ))
                    ) : (
                      <p className="employer-details-no-gallery">
                        No workspace images available.
                      </p>
                    )}
                  </div>
                </div>

                {/* Enhanced Reviews Section */}
                <div className="employer-details-reviews-section">
                  <div className="employer-details-reviews-header">
                    <div>
                      <h2>Company Reviews</h2>
                      <div className="employer-details-overall-rating">
                        <div className="employer-details-rating-big">
                          {averageRating.toFixed(1)}
                        </div>
                        <div className="employer-details-rating-details">
                          <div className="employer-details-stars-large">
                            {renderStars(averageRating, "large")}
                          </div>
                          <span className="employer-details-review-count">
                            {reviews.length} reviews
                          </span>
                        </div>
                      </div>
                    </div>
                    {isLoggedIn ? (
                      <button
                        className="employer-details-write-review-btn"
                        onClick={handleOpenReviewForm}
                        disabled={isCheckingReview}
                      >
                        {isCheckingReview
                          ? "Checking..."
                          : existingReview
                            ? "Edit Your Review"
                            : "Write a Review"}
                      </button>
                    ) : (
                      <button
                        className="employer-details-write-review-btn"
                        onClick={() => {
                          navigate("/login", {
                            state: {
                              from: `/employers/${id}`,
                              message: "Please login to write a review",
                            },
                          });
                        }}
                      >
                        Login to Write Review
                      </button>
                    )}
                  </div>

                  {/* My Review Quick Actions */}
                  {isLoggedIn &&
                    existingReview &&
                    !showReviewForm &&
                    existingReview.text &&
                    !isPlaceholderText(existingReview.text) && (
                      <div className="employer-details-my-review">
                        <div className="employer-details-my-review-body"></div>
                      </div>
                    )}

                  {/* All Reviews Section */}
                  <div className="employer-details-all-reviews">
                    <div className="employer-details-all-reviews-header">
                      <h3>
                        All Reviews (
                        {
                          reviews.filter(
                            (review) =>
                              review.text && !isPlaceholderText(review.text),
                          ).length
                        }
                        )
                      </h3>
                      <button
                        className="employer-details-toggle-reviews-btn"
                        onClick={() => setShowAllReviews(!showAllReviews)}
                      >
                        {showAllReviews ? "Hide Reviews" : "Show Reviews"}
                        <span className="employer-details-toggle-icon">
                          {showAllReviews ? "▲" : "▼"}
                        </span>
                      </button>
                    </div>

                    {showAllReviews && (
                      <div className="employer-details-reviews-grid">
                        {reviews
                          .filter(
                            (review) =>
                              review.text && !isPlaceholderText(review.text),
                          )
                          .map((review) => (
                            <div
                              key={review.id}
                              className={`employer-details-review-card-small ${
                                expandedReviewId === review.id ? "expanded" : ""
                              }`}
                              onClick={() => toggleReviewExpansion(review.id)}
                            >
                              <div className="employer-details-review-header-small">
                                <div className="employer-details-reviewer-avatar-small">
                                  {review.reviewerAvatar ? (
                                    <img
                                      src={review.reviewerAvatar}
                                      alt={review.reviewerName}
                                      className="employer-details-reviewer-avatar-img"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.parentElement!.innerHTML = `<span>${review.reviewerName.charAt(
                                          0,
                                        )}</span>`;
                                      }}
                                    />
                                  ) : (
                                    <span>{review.reviewerName.charAt(0)}</span>
                                  )}
                                </div>
                                <div className="employer-details-reviewer-info-small">
                                  <span className="employer-details-reviewer-name-small">
                                    {review.reviewerName}
                                  </span>
                                  <span className="employer-details-reviewer-location-small">
                                    {review.reviewerLocation}
                                  </span>
                                </div>
                                <div className="employer-details-review-rating-small">
                                  {renderStars(review.rating, "small")}
                                </div>
                              </div>

                              {/* Show preview text when not expanded */}
                              {expandedReviewId !== review.id && (
                                <p className="employer-details-review-preview-small">
                                  {getPreviewText(review.text)}
                                </p>
                              )}

                              {/* Show full text when expanded */}
                              {expandedReviewId === review.id && (
                                <p className="employer-details-review-text-small">
                                  {review.text}
                                </p>
                              )}

                              <div className="employer-details-review-footer-small">
                                <span className="employer-details-review-date-small">
                                  {review.date}
                                </span>
                                <span
                                  className={
                                    expandedReviewId === review.id
                                      ? "employer-details-read-less"
                                      : "employer-details-read-more"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleReviewExpansion(review.id);
                                  }}
                                >
                                  {expandedReviewId === review.id
                                    ? "Show less"
                                    : "Read more"}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Write Review Form - Full Width */}
                  {showReviewForm && (
                    <div className="employer-details-write-review-form-wrapper full-width">
                      <div className="employer-details-write-review-content full-width">
                        <div className="employer-details-write-review-form">
                          {isLoggedIn ? (
                            // User is logged in - show review form
                            <>
                              <h3>
                                {existingReview
                                  ? "Edit Your Review"
                                  : "Share Your Experience"}
                              </h3>
                              <p>
                                {existingReview
                                  ? `Update your review for ${company.name}`
                                  : `Help others make informed decisions about working at ${company.name}`}
                              </p>

                              {reviewError && (
                                <div
                                  className={`employer-details-review-${
                                    reviewError.includes("successfully")
                                      ? "success"
                                      : "error"
                                  }`}
                                >
                                  {reviewError}
                                </div>
                              )}

                              <div className="employer-details-form-group">
                                <label>Overall Rating *</label>
                                <div className="employer-details-star-input">
                                  {renderRatingStars()}
                                  <span className="employer-details-rating-text-input">
                                    {newReview.rating || hoveredRating || 0} out
                                    of 5
                                  </span>
                                </div>
                              </div>

                              <div className="employer-details-form-group">
                                <label>Review Title (Optional)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Great culture but challenging workload"
                                  className="employer-details-review-title-input"
                                  value={newReview.title}
                                  onChange={(e) =>
                                    setNewReview({
                                      ...newReview,
                                      title: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="employer-details-form-group">
                                <label>Your Review *</label>
                                <textarea
                                  placeholder="Tell us more about the pros and cons.. What did you like? What could be improved?"
                                  className="employer-details-review-textarea"
                                  rows={5}
                                  value={newReview.description}
                                  onChange={(e) =>
                                    setNewReview({
                                      ...newReview,
                                      description: e.target.value,
                                    })
                                  }
                                />
                                <div className="employer-details-review-hint">
                                  Be honest and specific about your experience
                                </div>
                              </div>

                              <div className="employer-details-form-actions">
                                <button
                                  className="employer-details-submit-review-btn"
                                  onClick={
                                    existingReview
                                      ? handleUpdateReview
                                      : handleSubmitReview
                                  }
                                  disabled={submittingReview}
                                >
                                  {submittingReview
                                    ? "Submitting..."
                                    : existingReview
                                      ? "Update Review"
                                      : "Submit Review"}
                                </button>
                                {existingReview && (
                                  <>
                                    {!showDeleteConfirm ? (
                                      <button
                                        className="employer-details-delete-review-btn"
                                        onClick={() =>
                                          setShowDeleteConfirm(true)
                                        }
                                        disabled={submittingReview}
                                      >
                                        Delete Review
                                      </button>
                                    ) : (
                                      <div className="employer-details-inline-confirm">
                                        <span>Delete your review?</span>
                                        <button
                                          className="employer-details-confirm-btn"
                                          onClick={handleDeleteReview}
                                          disabled={submittingReview}
                                        >
                                          {submittingReview
                                            ? "Deleting..."
                                            : "Yes"}
                                        </button>
                                        <button
                                          className="employer-details-cancel-confirm-btn"
                                          onClick={() =>
                                            setShowDeleteConfirm(false)
                                          }
                                          disabled={submittingReview}
                                        >
                                          No
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                                <button
                                  className="employer-details-cancel-review-btn"
                                  onClick={() => {
                                    setShowReviewForm(false);
                                    setReviewError(null);
                                  }}
                                  disabled={submittingReview}
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            // User is NOT logged in - show login prompt
                            <div className="employer-details-login-prompt">
                              <h3>Login Required</h3>
                              <p>
                                Please login to submit a review for{" "}
                                {company.name}
                              </p>
                              <button
                                className="employer-details-login-btn"
                                onClick={() => {
                                  navigate("/login", {
                                    state: {
                                      from: `/employers/${id}`,
                                      message: "Please login to write a review",
                                    },
                                  });
                                }}
                              >
                                Login Now
                              </button>
                              <button
                                className="employer-details-cancel-review-btn"
                                onClick={() => setShowReviewForm(false)}
                                style={{
                                  marginTop: "10px",
                                  display: "block",
                                  width: "100%",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="employer-details-review-illustration">
                          <img
                            src={reviewIllustration}
                            alt="Review Illustration"
                            className="employer-details-illustration-img"
                          />
                          <p className="employer-details-illustration-text">
                            Your review helps others find their perfect
                            workplace
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <aside className="employer-details-sidebar">
                <div className="employer-details-sidebar-card">
                  <div className="employer-details-sidebar-header">
                    <img
                      src={company.logo || defaultLogo}
                      alt={company.name}
                      className="employer-details-sidebar-logo"
                      onError={handleImageError}
                    />
                    <h3>{company.name}</h3>
                    {company.websiteUrl && (
                      <a
                        href={
                          company.websiteUrl.startsWith("http")
                            ? company.websiteUrl
                            : `https://${company.websiteUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="employer-details-website-link"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>

                  <div className="employer-details-divider"></div>

                  <div className="employer-details-sidebar-info">
                    <div className="employer-details-info-item">
                      <div className="employer-details-icon-box">
                        <img src={locationIcon} alt="Location" />
                      </div>
                      <div className="employer-details-info-text">
                        <span className="employer-details-info-label">
                          Location
                        </span>
                        <span className="employer-details-info-value">
                          {company.location || "Not specified"}
                        </span>
                      </div>
                    </div>

                    <div className="employer-details-info-item">
                      <div className="employer-details-icon-box">
                        <img src={sizeIcon} alt="Size" />
                      </div>
                      <div className="employer-details-info-text">
                        <span className="employer-details-info-label">
                          Company Size
                        </span>
                        <span className="employer-details-info-value">
                          {company.companySize || "Not specified"}
                        </span>
                      </div>
                    </div>

                    <div className="employer-details-info-item">
                      <div className="employer-details-icon-box">
                        <img src={emailIcon} alt="Email" />
                      </div>
                      <div className="employer-details-info-text">
                        <span className="employer-details-info-label">
                          Email
                        </span>
                        <span className="employer-details-info-value">
                          {company.email || "Not provided"}
                        </span>
                      </div>
                    </div>

                    <div className="employer-details-info-item">
                      <div className="employer-details-icon-box">
                        <img src={foundedIcon} alt="Founded" />
                      </div>
                      <div className="employer-details-info-text">
                        <span className="employer-details-info-label">
                          Founded
                        </span>
                        <span className="employer-details-info-value">
                          {company.foundedYear || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="employer-details-divider"></div>

                  {/* Connect with Us Section */}
                  <div className="employer-details-connect-section">
                    <h4>Connect with Us</h4>
                    <div className="employer-details-connect-buttons">
                      <button
                        className="employer-details-connect-btn facebook"
                        onClick={() =>
                          handleSocialLink(company.facebookUrl, "Facebook")
                        }
                      >
                        <img src={facebookIcon} alt="Facebook" />
                        <span>Facebook</span>
                      </button>
                      <button
                        className="employer-details-connect-btn linkedin"
                        onClick={() =>
                          handleSocialLink(company.linkedinUrl, "LinkedIn")
                        }
                      >
                        <img src={linkedinIcon} alt="LinkedIn" />
                        <span>LinkedIn</span>
                      </button>
                      <button
                        className="employer-details-connect-btn instagram"
                        onClick={() =>
                          handleSocialLink(company.instagramUrl, "Instagram")
                        }
                      >
                        <img src={instagramIcon} alt="Instagram" />
                        <span>Instagram</span>
                      </button>
                    </div>

                    {/* Save Button */}
                    <button
                      className={`employer-details-save-btn ${
                        isSaved ? "saved" : ""
                      }`}
                      onClick={toggleSave}
                    >
                      <img src={isSaved ? savedIcon : saveIcon} alt="Save" />
                      <span>{isSaved ? "Saved Company" : "Save Company"}</span>
                    </button>
                  </div>

                  <button
                    className="employer-details-send-message-btn"
                    onClick={handleSendMessage}
                  >
                    Send Message
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* Jobs Section */}
          {!loading && !error && (
            <div className="employer-details-jobs-section">
              <div className="employer-details-jobs-header">
                <h2>Current Openings at {company?.name || "Company"}</h2>
                <button
                  onClick={handleExploreMore}
                  className="employer-details-explore-more"
                >
                  Explore More Jobs
                </button>
              </div>

              {jobsLoading && (
                <div className="employer-details-jobs-state">
                  Loading openings...
                </div>
              )}
              {jobsError && !jobsLoading && (
                <div className="employer-details-jobs-state">{jobsError}</div>
              )}
              {!jobsLoading && !jobsError && jobs.length === 0 && (
                <div className="employer-details-jobs-state">
                  No current openings for this company.
                </div>
              )}
              {!jobsLoading && !jobsError && jobs.length > 0 && (
                <div className="employer-details-jobs-grid employer-details-jobs-grid-compact">
                  {jobs.map((job) => (
                    <article key={job.id} className="joblist-card-item">
                      <div className="joblist-card-top">
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="joblist-company-logo"
                          onError={handleImageError}
                        />
                        <div className="joblist-card-actions">
                          <button className="joblist-icon-btn">
                            <img src={jobCardBookmarkIcon} alt="Bookmark" />
                          </button>
                          <button className="joblist-icon-btn">
                            <img src={jobCardShareIcon} alt="Share" />
                          </button>
                        </div>
                      </div>
                      <div className="joblist-card-company">{job.company}</div>
                      <div className="joblist-card-meta">
                        <img src={jobCardWorkModeIcon} alt="Work mode" />
                        {formatWorkMode(job.workMode)}
                      </div>
                      <h3 className="joblist-card-title">{job.title}</h3>
                      <div className="joblist-card-info">
                        <span>
                          <img src={jobCardLocationIcon} alt="Location" />
                          {job.location}
                        </span>
                        <span>
                          <img src={jobCardTypeIcon} alt="Job type" />
                          {job.type}
                        </span>
                      </div>
                      <div className="joblist-card-buttons">
                        <button
                          className="joblist-btn-outline"
                          onClick={() => handleViewDetails(job.id)}
                        >
                          View Details
                        </button>
                        <button
                          className="joblist-btn-primary"
                          onClick={() => handleApplyNow(job.id)}
                        >
                          Apply Now
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EmployerDetailsPage;
