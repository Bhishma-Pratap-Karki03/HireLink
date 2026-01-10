import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import RecruiterProfilePictureEditor from "../../components/recruitercomponents/RecruiterProfilePictureEditor";
import RecruiterPersonalInfoEditor from "../../components/recruitercomponents/RecruiterPersonalInfoEditor";
import RecruiterWebsiteEditor from "../../components/recruitercomponents/RecruiterWebsiteEditor";
import "../../styles/RecruiterProfilePage.css";
import "../../styles/RecruiterPersonalInfoEditor.css";
import RecruiterAboutCompanyEditor from "../../components/recruitercomponents/RecruiterAboutCompanyEditor";
import RecruiterWorkspaceGalleryEditor from "../../components/recruitercomponents/RecruiterWorkspaceGalleryEditor";

// Import images
import uploadIcon from "../../images/Recruiter Profile Page Images/6_10.svg";
import cameraIcon from "../../images/Recruiter Profile Page Images/cameraIcon.svg";
import phoneIcon from "../../images/Recruiter Profile Page Images/phoneIcon.svg";
import infoIcon from "../../images/Recruiter Profile Page Images/6_27.svg";
import companyIcon from "../../images/Recruiter Profile Page Images/6_171.svg";
import locationIcon from "../../images/Recruiter Profile Page Images/6_180.svg";
import sizeIcon from "../../images/Recruiter Profile Page Images/6_189.svg";
import emailIcon from "../../images/Recruiter Profile Page Images/6_200.svg";
import foundedIcon from "../../images/Recruiter Profile Page Images/6_208.svg";
import editIcon1 from "../../images/Recruiter Profile Page Images/6_215.svg";
import editIcon2 from "../../images/Recruiter Profile Page Images/6_223.svg";
import websiteIcon from "../../images/Recruiter Profile Page Images/6_229.svg";
import linkedinIcon from "../../images/Recruiter Profile Page Images/6_237.svg";
import instagramIcon from "../../images/Recruiter Profile Page Images/6_245.svg";
import facebookIcon from "../../images/Recruiter Profile Page Images/6_253.svg";
import editIcon3 from "../../images/Recruiter Profile Page Images/6_344.svg";
import editIcon4 from "../../images/Recruiter Profile Page Images/6_353.svg";
import uploadGalleryIcon from "../../images/Recruiter Profile Page Images/6_274.svg";
import starIcon from "../../images/Recruiter Profile Page Images/6_53.svg";
import starFilledIcon from "../../images/Recruiter Profile Page Images/6_55.svg";
import avatar1 from "../../images/Recruiter Profile Page Images/6_67.svg";
import avatar2 from "../../images/Recruiter Profile Page Images/6_104.svg";
import avatar3 from "../../images/Recruiter Profile Page Images/6_141.svg";
import hideIcon from "../../images/Recruiter Profile Page Images/6_75.svg";
import deleteIcon from "../../images/Recruiter Profile Page Images/6_80.svg";
import showIcon from "../../images/Recruiter Profile Page Images/6_112.svg";
import loadMoreIcon from "../../images/Recruiter Profile Page Images/6_161.svg";
import gallery1 from "../../images/Recruiter Profile Page Images/beb07c254bdd25265ad0c1b1f8d049b71468be1d.png";
import gallery2 from "../../images/Recruiter Profile Page Images/b5b1cb7e9c2196c07a8a59ba8e3c3665a7c99eb2.png";
import defaultAvatar from "../../images/Register Page Images/Default Profile.webp";

interface WorkspaceImage {
  _id: string;
  imageUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  order: number;
}
// Define User Profile Interface
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  about: string;
  currentJobTitle?: string;
  profilePicture: string;
  createdAt: string;
  companySize: string;
  foundedYear: string;
  updatedAt: string;
  websiteUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  workspaceImages: WorkspaceImage[];
}

const RecruiterProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // State for user profile data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfilePictureEditorOpen, setIsProfilePictureEditorOpen] =
    useState(false);
  const [isPersonalInfoEditorOpen, setIsPersonalInfoEditorOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isWebsiteEditorOpen, setIsWebsiteEditorOpen] = useState(false);
  const [isAboutCompanyEditorOpen, setIsAboutCompanyEditorOpen] =
    useState(false);
  const [isWorkspaceGalleryEditorOpen, setIsWorkspaceGalleryEditorOpen] =
    useState(false);

  // Fetch user profile data
  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/profile/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();

      // DEBUG LOG: Check what data is coming from backend
      console.log("Profile data from API:", data);
      console.log("Company Size:", data.user?.companySize);
      console.log("Founded Year:", data.user?.foundedYear);

      // ADD THESE LOGS FOR WORKSPACE IMAGES
      console.log("Workspace Images:", data.user?.workspaceImages);
      console.log(
        "Workspace Images count:",
        data.user?.workspaceImages?.length
      );
      if (data.user?.workspaceImages) {
        data.user.workspaceImages.forEach(
          (img: WorkspaceImage, index: number) => {
            console.log(`Image ${index}:`, {
              id: img._id,
              url: img.imageUrl,
              fileName: img.fileName,
              order: img.order,
            });
          }
        );
      }

      setUserProfile(data.user);

      // Update localStorage with user data
      if (data.user) {
        const minimalUserData = {
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          role: data.user.role,
          companySize: data.user.companySize,
          foundedYear: data.user.foundedYear,
        };
        localStorage.setItem("userData", JSON.stringify(minimalUserData));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Fetch profile on component mount and refresh
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile, refreshTrigger]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData.role !== "recruiter") {
          navigate(`/${userData.role}-profile`);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [navigate]);

  // Handle profile picture save
  const handleSaveProfilePicture = async (data: {
    imageFile?: File | null;
  }) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      // Handle profile picture upload/removal
      if (data.imageFile !== undefined) {
        if (data.imageFile) {
          // Upload new profile picture
          const formData = new FormData();
          formData.append("profilePicture", data.imageFile);

          const response = await fetch(
            "http://localhost:5000/api/profile/me/picture", // CHANGED FROM /upload-picture to /me/picture
            {
              method: "POST", // CHANGED FROM PUT to POST
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(
              responseData.message || "Failed to upload profile picture"
            );
          }
        } else {
          // Remove profile picture
          const response = await fetch(
            "http://localhost:5000/api/profile/me/picture", // CHANGED FROM /remove-picture to /me/picture
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to remove profile picture");
          }
        }
      }

      // Refresh profile data
      await fetchUserProfile();
      setRefreshTrigger((prev) => prev + 1);

      // Notify other components
      window.dispatchEvent(new CustomEvent("profileUpdated"));
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile picture. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePersonalInfo = async (data: {
    fullName: string;
    phone: string;
    address: string;
    companySize: string;
    foundedYear: string;
  }): Promise<void> => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      console.log("Saving company info:", data); // Debug log

      const response = await fetch("http://localhost:5000/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone || "",
          address: data.address || "",
          companySize: data.companySize || "",
          foundedYear: data.foundedYear || "",
        }),
      });

      const responseData = await response.json(); // Parse response JSON

      if (!response.ok) {
        console.error("API Error:", responseData); // Debug log
        throw new Error(
          responseData.message || "Failed to update company information"
        );
      }

      console.log("Update successful:", responseData); // Debug log

      // Refresh profile data from database
      await fetchUserProfile();
      setRefreshTrigger((prev) => prev + 1);

      // Notify other components
      window.dispatchEvent(new CustomEvent("profileUpdated"));
    } catch (error) {
      console.error("Error saving company information:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebsiteInfo = async (data: {
    websiteUrl: string;
    linkedinUrl: string;
    instagramUrl: string;
    facebookUrl: string;
  }): Promise<void> => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      console.log("Saving website info:", data);

      const response = await fetch("http://localhost:5000/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          websiteUrl: data.websiteUrl || "",
          linkedinUrl: data.linkedinUrl || "",
          instagramUrl: data.instagramUrl || "",
          facebookUrl: data.facebookUrl || "",
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("API Error:", responseData);
        throw new Error(
          responseData.message || "Failed to update website information"
        );
      }

      console.log("Update successful:", responseData);

      // Refresh profile data
      await fetchUserProfile();
      setRefreshTrigger((prev) => prev + 1);

      // Notify other components
      window.dispatchEvent(new CustomEvent("profileUpdated"));
    } catch (error) {
      console.error("Error saving website information:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format URLs for display
  const formatUrlForDisplay = (url: string): string => {
    if (!url) return "";
    // Remove protocol and www for cleaner display
    return url.replace(/^(https?:\/\/)?(www\.)?/, "");
  };

  const handleEditPersonalInfo = () => {
    setIsPersonalInfoEditorOpen(true);
  };

  const handleSaveAboutCompany = async (aboutText: string): Promise<void> => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      console.log("Saving company about:", aboutText);

      const response = await fetch("http://localhost:5000/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          about: aboutText || "",
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("API Error:", responseData);
        throw new Error(
          responseData.message || "Failed to update company description"
        );
      }

      console.log("About company update successful:", responseData);

      // Refresh profile data
      await fetchUserProfile();
      setRefreshTrigger((prev) => prev + 1);

      // Notify other components
      window.dispatchEvent(new CustomEvent("profileUpdated"));
    } catch (error) {
      console.error("Error saving company description:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkspaceGallery = async (data: {
    uploadedImages: File[];
    deletedImageIds: string[];
    reorderedImageIds: string[];
  }): Promise<void> => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      // Handle deletions first
      for (const imageId of data.deletedImageIds) {
        const response = await fetch(
          `http://localhost:5000/api/workspace/image/${imageId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete image");
        }
      }

      // Handle uploads
      for (const imageFile of data.uploadedImages) {
        const formData = new FormData();
        formData.append("workspaceImage", imageFile);

        const response = await fetch(
          "http://localhost:5000/api/workspace/upload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to upload image");
        }
      }

      // Handle reordering if there are existing images
      if (data.reorderedImageIds.length > 0) {
        const response = await fetch(
          "http://localhost:5000/api/workspace/reorder",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              imageOrder: data.reorderedImageIds,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to reorder images");
        }
      }

      // Refresh profile data
      await fetchUserProfile();
      setRefreshTrigger((prev) => prev + 1);

      // Notify other components
      window.dispatchEvent(new CustomEvent("profileUpdated"));
    } catch (error) {
      console.error("Error saving workspace gallery:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get workspace image URL
  const getWorkspaceImageUrl = (imageUrl: string) => {
    console.log("Getting workspace image URL:", imageUrl); // Debug log

    if (!imageUrl) {
      console.log("No image URL provided");
      return "";
    }

    // Handle different URL formats
    let finalUrl = imageUrl;

    // If URL doesn't start with /uploads, prepend it
    if (!imageUrl.startsWith("/uploads") && !imageUrl.startsWith("http")) {
      finalUrl = `/uploads/workspaceimages/${imageUrl}`;
    }

    // If URL starts with /uploads but not with full path
    if (
      imageUrl.startsWith("/uploads/") &&
      !imageUrl.includes("workspaceimages")
    ) {
      finalUrl = `/uploads/workspaceimages/${imageUrl.split("/").pop()}`;
    }

    const fullUrl = `http://localhost:5000${finalUrl}?t=${Date.now()}`;
    console.log("Final workspace image URL:", fullUrl);
    return fullUrl;
  };

  // Helper function to safely render HTML content
  const renderAboutContent = (content: string) => {
    if (!content) {
      return (
        <p className="recruiter-profile-about-text">
          No company description provided. Click edit to add information about
          your company.
        </p>
      );
    }

    return (
      <div
        className="recruiter-profile-about-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (!userProfile) {
      return defaultAvatar;
    }

    if (
      !userProfile.profilePicture ||
      userProfile.profilePicture.trim() === ""
    ) {
      return defaultAvatar;
    }

    if (userProfile.profilePicture.startsWith("http")) {
      const separator = userProfile.profilePicture.includes("?") ? "&" : "?";
      return `${userProfile.profilePicture}${separator}t=${Date.now()}`;
    }

    return `http://localhost:5000${userProfile.profilePicture}?t=${Date.now()}`;
  };

  const handlePostJob = () => {
    navigate("/recruiter/job-postings");
  };

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
  };

  // Handle edit profile picture click
  const handleEditProfilePicture = () => {
    setIsProfilePictureEditorOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="recruiter-profile-page-container">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recruiter-profile-page-container">
      <div className="recruiter-profile-layout">
        {/* Recruiter Sidebar */}
        <RecruiterSidebar />

        {/* Main Content Area */}
        <div className="recruiter-profile-main-area">
          {/* Top Bar */}
          <div className="recruiter-profile-topbar-wrapper">
            <RecruiterTopBar
              onPostJob={handlePostJob}
              onSearch={handleSearch}
            />
          </div>

          {/* Scrollable Content */}
          <div className="recruiter-profile-scrollable-content">
            <div className="recruiter-profile-content-wrapper">
              <div className="recruiter-profile-page-header">
                <h1>Company Profile</h1>
                <p>
                  Manage your company branding details visible to candidates
                </p>
              </div>

              {/* Logo Card - UPDATED WITH PROFILE PICTURE FUNCTIONALITY */}
              <div className="recruiter-profile-card recruiter-profile-logo-card">
                <div
                  className="recruiter-profile-logo-placeholder"
                  onClick={handleEditProfilePicture}
                >
                  {userProfile?.profilePicture ? (
                    <img
                      src={getProfileImageUrl()}
                      alt="Company Logo"
                      className="recruiter-profile-logo-img"
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                  ) : (
                    <div className="recruiter-profile-logo-upload-icon">
                      <img src={cameraIcon} alt="Upload Logo" />
                    </div>
                  )}
                </div>
                <div className="recruiter-profile-logo-info">
                  <h3>Company Logo</h3>
                  <p>
                    This logo will be displayed on your company profile, job
                    posts and search results. Use a high-quality square image
                    (400×400px recommended)
                  </p>
                  <div className="recruiter-profile-logo-actions">
                    <button
                      className="recruiter-profile-btn-outline"
                      onClick={handleEditProfilePicture}
                    >
                      <img src={cameraIcon} alt="Upload" />
                      <span>
                        {userProfile?.profilePicture
                          ? "Change Logo"
                          : "Upload Logo"}
                      </span>
                    </button>
                    {userProfile?.profilePicture && (
                      <button
                        className="recruiter-profile-btn-text-danger"
                        onClick={() =>
                          handleSaveProfilePicture({
                            imageFile: null,
                          })
                        }
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                  <div className="recruiter-profile-logo-hint">
                    <img src={infoIcon} alt="Info" />
                    <span>Recommended: 400×400px (JPG, PNG). Max Size 2MB</span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="recruiter-profile-info-grid">
                {/* Left Column */}
                <div className="recruiter-profile-grid-column">
                  {/* Basic Information Card */}
                  <div className="recruiter-profile-card">
                    <div className="recruiter-profile-card-header">
                      <h3>Basic Information</h3>
                      <img
                        src={editIcon1}
                        alt="Edit"
                        className="recruiter-profile-edit-icon"
                        onClick={() => setIsPersonalInfoEditorOpen(true)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>

                    {/* Company Name - Full width */}
                    <div className="recruiter-profile-form-group">
                      <div className="recruiter-profile-input-wrapper">
                        <img src={companyIcon} alt="Company" />
                        <label>Company Name</label>
                      </div>
                      <input
                        type="text"
                        value={
                          userProfile?.fullName || "No company name provided"
                        }
                        className="recruiter-profile-form-input"
                        readOnly
                      />
                    </div>

                    {/* First Row: Location and Company Size */}
                    <div className="recruiter-profile-form-row">
                      {/* Location */}
                      <div className="recruiter-profile-form-group half">
                        <div className="recruiter-profile-input-wrapper">
                          <img src={locationIcon} alt="Location" />
                          <label>Location</label>
                        </div>
                        <input
                          type="text"
                          value={userProfile?.address || "No address provided"}
                          className="recruiter-profile-form-input"
                          readOnly
                        />
                      </div>

                      {/* Company Size */}
                      <div className="recruiter-profile-form-group half">
                        <div className="recruiter-profile-input-wrapper">
                          <img src={sizeIcon} alt="Size" />
                          <label>Company Size</label>
                        </div>
                        <input
                          type="text"
                          value={userProfile?.companySize || "Not specified"}
                          className="recruiter-profile-form-input"
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Second Row: Email and Founded Year */}
                    <div className="recruiter-profile-form-row">
                      {/* Email - Takes more space */}
                      <div className="recruiter-profile-form-group email-field">
                        <div className="recruiter-profile-input-wrapper">
                          <img src={emailIcon} alt="Email" />
                          <label>Company Email</label>
                        </div>
                        <input
                          type="text"
                          value={userProfile?.email || "No email provided"}
                          className="recruiter-profile-form-input"
                          readOnly
                        />
                      </div>

                      {/* Founded Year - Takes less space */}
                      <div className="recruiter-profile-form-group year-field">
                        <div className="recruiter-profile-input-wrapper">
                          <img src={foundedIcon} alt="Founded" />
                          <label>Founded Year</label>
                        </div>
                        <input
                          type="text"
                          value={userProfile?.foundedYear || "Not specified"}
                          className="recruiter-profile-form-input"
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Phone (Full width, conditional) */}
                    {userProfile?.phone && (
                      <div className="recruiter-profile-form-group">
                        <div className="recruiter-profile-input-wrapper">
                          <img src={phoneIcon} alt="Phone" />
                          <label>Phone Number</label>
                        </div>
                        <input
                          type="text"
                          value={userProfile.phone}
                          className="recruiter-profile-form-input"
                          readOnly
                        />
                      </div>
                    )}
                  </div>

                  {/* About Company */}
                  <div className="recruiter-profile-card">
                    <div className="recruiter-profile-card-header">
                      <h3>About Company</h3>
                      <img
                        src={editIcon3}
                        alt="Edit"
                        className="recruiter-profile-edit-icon"
                        onClick={() => setIsAboutCompanyEditorOpen(true)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                    {renderAboutContent(userProfile?.about || "")}
                  </div>
                </div>

                {/* Right Column */}
                <div className="recruiter-profile-grid-column">
                  {/* Website and Contacts Card */}
                  <div className="recruiter-profile-card">
                    <div className="recruiter-profile-card-header">
                      <h3>Website and Contacts</h3>
                      <img
                        src={editIcon2}
                        alt="Edit"
                        className="recruiter-profile-edit-icon"
                        onClick={() => setIsWebsiteEditorOpen(true)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>

                    {/* Website URL */}
                    <div className="recruiter-profile-form-group">
                      <div className="recruiter-profile-input-wrapper">
                        <img src={websiteIcon} alt="Website" />
                        <label>Website URL</label>
                      </div>
                      <input
                        type="text"
                        value={
                          userProfile?.websiteUrl
                            ? formatUrlForDisplay(userProfile.websiteUrl)
                            : "No website provided"
                        }
                        className="recruiter-profile-form-input"
                        readOnly
                      />
                    </div>

                    {/* LinkedIn URL */}
                    <div className="recruiter-profile-form-group">
                      <div className="recruiter-profile-input-wrapper">
                        <img src={linkedinIcon} alt="LinkedIn" />
                        <label>LinkedIn URL</label>
                      </div>
                      <input
                        type="text"
                        value={
                          userProfile?.linkedinUrl
                            ? formatUrlForDisplay(userProfile.linkedinUrl)
                            : "No LinkedIn provided"
                        }
                        className="recruiter-profile-form-input"
                        readOnly
                      />
                    </div>

                    {/* Instagram URL */}
                    <div className="recruiter-profile-form-group">
                      <div className="recruiter-profile-input-wrapper">
                        <img src={instagramIcon} alt="Instagram" />
                        <label>Instagram URL</label>
                      </div>
                      <input
                        type="text"
                        value={
                          userProfile?.instagramUrl
                            ? formatUrlForDisplay(userProfile.instagramUrl)
                            : "No Instagram provided"
                        }
                        className="recruiter-profile-form-input"
                        readOnly
                      />
                    </div>

                    {/* Facebook URL */}
                    <div className="recruiter-profile-form-group">
                      <div className="recruiter-profile-input-wrapper">
                        <img src={facebookIcon} alt="Facebook" />
                        <label>Facebook URL</label>
                      </div>
                      <input
                        type="text"
                        value={
                          userProfile?.facebookUrl
                            ? formatUrlForDisplay(userProfile.facebookUrl)
                            : "No Facebook provided"
                        }
                        className="recruiter-profile-form-input"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Workplace Gallery */}
                  <div className="recruiter-profile-card">
                    <div className="recruiter-profile-card-header">
                      <h3>Workplace Gallery</h3>
                      <img
                        src={editIcon4}
                        alt="Edit"
                        className="recruiter-profile-edit-icon"
                        onClick={() => setIsWorkspaceGalleryEditorOpen(true)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                    <div className="recruiter-profile-gallery-grid">
                      {userProfile?.workspaceImages &&
                      userProfile.workspaceImages.length > 0 ? (
                        // Sort images by order
                        [...userProfile.workspaceImages]
                          .sort((a, b) => a.order - b.order)
                          .slice(0, 4) // Show only first 4 in preview
                          .map((image, index) => {
                            const imageUrl = getWorkspaceImageUrl(
                              image.imageUrl
                            );
                            console.log(`Rendering workspace image ${index}:`, {
                              id: image._id,
                              originalUrl: image.imageUrl,
                              finalUrl: imageUrl,
                              order: image.order,
                            });

                            return (
                              <div
                                key={image._id}
                                className="recruiter-profile-gallery-item"
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Workspace ${index + 1}`}
                                  className="recruiter-profile-gallery-img"
                                  onError={(e) => {
                                    console.error(
                                      "Failed to load workspace image:",
                                      {
                                        imageUrl,
                                        originalUrl: image.imageUrl,
                                        error: e,
                                      }
                                    );
                                    e.currentTarget.src = `https://via.placeholder.com/300x200?text=Workspace+${
                                      index + 1
                                    }`;
                                    e.currentTarget.alt = `Failed to load workspace image ${
                                      index + 1
                                    }`;
                                  }}
                                  onLoad={() =>
                                    console.log(
                                      `Successfully loaded workspace image ${
                                        index + 1
                                      }`
                                    )
                                  }
                                />
                              </div>
                            );
                          })
                      ) : (
                        // Show empty placeholders if no images
                        <>
                          <div
                            className="recruiter-profile-upload-box"
                            onClick={() =>
                              setIsWorkspaceGalleryEditorOpen(true)
                            }
                          >
                            <img src={uploadGalleryIcon} alt="Upload" />
                            <span>Upload</span>
                          </div>
                          <div
                            className="recruiter-profile-upload-box"
                            onClick={() =>
                              setIsWorkspaceGalleryEditorOpen(true)
                            }
                          >
                            <img src={uploadGalleryIcon} alt="Upload" />
                            <span>Upload</span>
                          </div>
                        </>
                      )}

                      {/* Show count if there are more than 4 images */}
                      {userProfile?.workspaceImages &&
                        userProfile.workspaceImages.length > 4 && (
                          <div
                            className="recruiter-profile-more-images"
                            onClick={() =>
                              setIsWorkspaceGalleryEditorOpen(true)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <span>
                              +{userProfile.workspaceImages.length - 4} more
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Management */}
              <div className="recruiter-profile-card recruiter-profile-reviews-card">
                <div className="recruiter-profile-reviews-header">
                  <h3>Company Reviews Management</h3>
                  <div className="recruiter-profile-tabs">
                    <button className="recruiter-profile-tab active">
                      All Reviews
                    </button>
                    <button className="recruiter-profile-tab">Published</button>
                    <button className="recruiter-profile-tab">Hidden</button>
                    <button className="recruiter-profile-tab">Flagged</button>
                  </div>
                </div>

                <div className="recruiter-profile-reviews-list">
                  {/* Review 1 */}
                  <div className="recruiter-profile-review-item">
                    <div className="recruiter-profile-review-content">
                      <div className="recruiter-profile-review-meta">
                        <div className="recruiter-profile-stars">
                          <img src={starFilledIcon} alt="star" />
                          <img src={starFilledIcon} alt="star" />
                          <img src={starFilledIcon} alt="star" />
                          <img src={starFilledIcon} alt="star" />
                          <img src={starIcon} alt="star" />
                          <span className="recruiter-profile-rating-text">
                            4 out of 5
                          </span>
                        </div>
                        <span className="recruiter-profile-review-date">
                          Posted on October 12, 2025
                        </span>
                      </div>
                      <p className="recruiter-profile-review-text">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Debitis illum fuga eveniet. Deleniti asperiores,
                        commodi quae ipsum quas est itaque, ipsa, dolore beatae
                        voluptates nemo blanditiis iste eius officia Lorem ipsum
                        dolor sit..
                      </p>
                      <div className="recruiter-profile-reviewer-info">
                        <img
                          src={avatar1}
                          alt="Avatar"
                          className="recruiter-profile-avatar"
                        />
                        <div className="recruiter-profile-reviewer-details">
                          <span className="recruiter-profile-reviewer-name">
                            Rashaed Kargel
                          </span>
                          <span className="recruiter-profile-reviewer-role">
                            Senior Product Designer
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="recruiter-profile-review-actions">
                      <button className="recruiter-profile-btn-action">
                        <img src={hideIcon} alt="Hide" />
                        <span>Hide Review</span>
                      </button>
                      <button className="recruiter-profile-btn-action danger">
                        <img src={deleteIcon} alt="Delete" />
                        <span>Delete Review</span>
                      </button>
                    </div>
                  </div>

                  {/* Review 2 */}
                  <div className="recruiter-profile-review-item">
                    <div className="recruiter-profile-review-content">
                      <div className="recruiter-profile-review-meta">
                        <div className="recruiter-profile-stars">
                          <img src={starFilledIcon} alt="star" />
                          <img src={starFilledIcon} alt="star" />
                          <img src={starFilledIcon} alt="star" />
                          <img src={starFilledIcon} alt="star" />
                          <img src={starFilledIcon} alt="star" />
                          <span className="recruiter-profile-rating-text">
                            5 out of 5
                          </span>
                        </div>
                        <span className="recruiter-profile-review-date">
                          Posted on October 12, 2025
                        </span>
                      </div>
                      <p className="recruiter-profile-review-text">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Debitis illum fuga eveniet. Deleniti asperiores,
                        commodi quae ipsum quas est itaque, ipsa, dolore beatae
                        voluptates nemo blanditiis iste eius officia Lorem ipsum
                        dolor sit..
                      </p>
                      <div className="recruiter-profile-reviewer-info">
                        <img
                          src={avatar2}
                          alt="Avatar"
                          className="recruiter-profile-avatar"
                        />
                        <div className="recruiter-profile-reviewer-details">
                          <span className="recruiter-profile-reviewer-name">
                            Rashaed Kargel
                          </span>
                          <span className="recruiter-profile-reviewer-role">
                            Photographer
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="recruiter-profile-review-actions">
                      <button className="recruiter-profile-btn-action success">
                        <img src={showIcon} alt="Show" />
                        <span>Show Review</span>
                      </button>
                      <button className="recruiter-profile-btn-action danger">
                        <img src={deleteIcon} alt="Delete" />
                        <span>Delete Review</span>
                      </button>
                    </div>
                  </div>

                  {/* Review 3 */}
                  <div className="recruiter-profile-review-item">
                    <div className="recruiter-profile-review-content">
                      <div className="recruiter-profile-review-meta">
                        <div className="recruiter-profile-stars">
                          <img src={starFilledIcon} alt="star" />
                          <img src={starFilledIcon} alt="star" />
                          <img src={starFilledIcon} alt="star" />
                          <img src={starFilledIcon} alt="star" />
                          <img src={starIcon} alt="star" />
                          <span className="recruiter-profile-rating-text">
                            4 out of 5
                          </span>
                        </div>
                        <span className="recruiter-profile-review-date">
                          Posted on October 12, 2025
                        </span>
                      </div>
                      <p className="recruiter-profile-review-text">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Debitis illum fuga eveniet. Deleniti asperiores,
                        commodi quae ipsum quas est itaque, ipsa, dolore beatae
                        voluptates nemo blanditiis iste eius officia Lorem ipsum
                        dolor sit..
                      </p>
                      <div className="recruiter-profile-reviewer-info">
                        <img
                          src={avatar3}
                          alt="Avatar"
                          className="recruiter-profile-avatar"
                        />
                        <div className="recruiter-profile-reviewer-details">
                          <span className="recruiter-profile-reviewer-name">
                            Rashaed Kargel
                          </span>
                          <span className="recruiter-profile-reviewer-role">
                            HR Manager
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="recruiter-profile-review-actions">
                      <button className="recruiter-profile-btn-action">
                        <img src={hideIcon} alt="Hide" />
                        <span>Hide Review</span>
                      </button>
                      <button className="recruiter-profile-btn-action danger">
                        <img src={deleteIcon} alt="Delete" />
                        <span>Delete Review</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="recruiter-profile-load-more">
                  <button className="recruiter-profile-btn-load-more">
                    <span>Load More Reviews</span>
                    <img src={loadMoreIcon} alt="Arrow" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Profile Picture Editor Modal */}
      {userProfile && (
        <>
          <RecruiterProfilePictureEditor
            currentImage={getProfileImageUrl()}
            isOpen={isProfilePictureEditorOpen}
            onClose={() => setIsProfilePictureEditorOpen(false)}
            onSave={handleSaveProfilePicture}
          />

          {/* Personal Information Editor Modal */}
          <RecruiterPersonalInfoEditor
            userData={{
              email: userProfile.email,
              phone: userProfile.phone || "",
              address: userProfile.address || "",
              fullName: userProfile.fullName || "",
              companySize: userProfile.companySize || "",
              foundedYear: userProfile.foundedYear || "",
            }}
            isOpen={isPersonalInfoEditorOpen}
            onClose={() => setIsPersonalInfoEditorOpen(false)}
            onSave={handleSavePersonalInfo}
          />

          <RecruiterWebsiteEditor
            userData={{
              websiteUrl: userProfile.websiteUrl || "",
              linkedinUrl: userProfile.linkedinUrl || "",
              instagramUrl: userProfile.instagramUrl || "",
              facebookUrl: userProfile.facebookUrl || "",
            }}
            isOpen={isWebsiteEditorOpen}
            onClose={() => setIsWebsiteEditorOpen(false)}
            onSave={handleSaveWebsiteInfo}
          />

          <RecruiterAboutCompanyEditor
            currentAbout={userProfile.about || ""}
            isOpen={isAboutCompanyEditorOpen}
            onClose={() => setIsAboutCompanyEditorOpen(false)}
            onSave={handleSaveAboutCompany}
          />

          <RecruiterWorkspaceGalleryEditor
            currentImages={userProfile.workspaceImages || []}
            isOpen={isWorkspaceGalleryEditorOpen}
            onClose={() => setIsWorkspaceGalleryEditorOpen(false)}
            onSave={handleSaveWorkspaceGallery}
          />
        </>
      )}
    </div>
  );
};

export default RecruiterProfilePage;
