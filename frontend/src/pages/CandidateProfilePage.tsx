import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SideNavigation from "../components/SideNavigation";
import ProfilePictureEditor from "../components/ProfilePictureEditor";
import PersonalInfoEditor from "../components/PersonalInfoEditor";
import "../styles/CandidateProfilePage.css";

// Import images
import notificationIcon from "../images/Candidate Profile Page Images/261_1980.svg";
import defaultAvatar from "../images/Register Page Images/Default Profile.webp";
import editIcon from "../images/Candidate Profile Page Images/261_2045.svg";
import emailIcon from "../images/Candidate Profile Page Images/261_2082.svg";
import phoneIcon from "../images/Candidate Profile Page Images/261_2173.svg";
import locationIcon from "../images/Candidate Profile Page Images/261_2182.svg";
import connectionsIcon from "../images/Candidate Profile Page Images/261_2020.svg";
import addIcon from "../images/Candidate Profile Page Images/264_2241.svg";
import addIcon2 from "../images/Candidate Profile Page Images/264_2253.svg";
import addIcon3 from "../images/Candidate Profile Page Images/264_2262.svg";
import addIcon4 from "../images/Candidate Profile Page Images/264_2271.svg";
import editIcon2 from "../images/Candidate Profile Page Images/264_2282.svg";
import addIcon5 from "../images/Candidate Profile Page Images/264_2364.svg";
import editIcon3 from "../images/Candidate Profile Page Images/264_2369.svg";
import arrowIcon from "../images/Candidate Profile Page Images/267_1325.svg";
import addIcon6 from "../images/Candidate Profile Page Images/267_1296.svg";
import editIcon4 from "../images/Candidate Profile Page Images/267_1301.svg";
import projectImage from "../images/Candidate Profile Page Images/493a4569683a62d53e1463f47634429e10edc7cf.png";

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
  updatedAt: string;
}

const CandidateProfilePage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPersonalInfoEditorOpen, setIsPersonalInfoEditorOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        // Token expired or invalid
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch profile");
      }

      const data = await response.json();
      console.log("Fetched profile data:", data);
      setUserProfile(data.user);

      // Update localStorage with minimal user data
      if (data.user) {
        const minimalUserData = {
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          role: data.user.role,
        };
        localStorage.setItem("userData", JSON.stringify(minimalUserData));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load profile data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile, refreshTrigger]);
  const handleEditProfilePicture = () => {
    setIsEditorOpen(true);
  };

  const handleEditPersonalInfo = () => {
    setIsPersonalInfoEditorOpen(true);
  };

  const handleSaveProfilePicture = async (data: {
    imageFile?: File | null;
    currentJobTitle: string;
  }) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      // First, update the current job title
      if (data.currentJobTitle !== undefined) {
        const updateResponse = await fetch(
          "http://localhost:5000/api/profile/update",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              currentJobTitle: data.currentJobTitle,
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.message || "Failed to update job title");
        }
      }

      // Then handle the profile picture if needed
      if (data.imageFile !== undefined) {
        if (data.imageFile) {
          // Save the filename to localStorage
          const uploadedFileName = data.imageFile.name;
          localStorage.setItem("profilePictureFileName", uploadedFileName);

          // Also save to userData in localStorage
          const userDataStr = localStorage.getItem("userData");
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              userData.profilePictureFileName = uploadedFileName;
              localStorage.setItem("userData", JSON.stringify(userData));
            } catch (e) {
              console.error("Error updating userData:", e);
            }
          }

          // Upload new profile picture to backend
          const formData = new FormData();
          formData.append("profilePicture", data.imageFile);

          const response = await fetch(
            "http://localhost:5000/api/profile/upload-picture",
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to upload profile picture"
            );
          }
        } else {
          // Remove filename from localStorage when removing picture
          localStorage.removeItem("profilePictureFileName");
          const userDataStr = localStorage.getItem("userData");
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              delete userData.profilePictureFileName;
              localStorage.setItem("userData", JSON.stringify(userData));
            } catch (e) {
              console.error("Error updating userData:", e);
            }
          }
          // Remove profile picture via backend
          const response = await fetch(
            "http://localhost:5000/api/profile/remove-picture",
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to remove profile picture"
            );
          }
        }
      }

      // Refresh profile data from database
      await fetchUserProfile();

      // Force refresh by incrementing the trigger
      setRefreshTrigger((prev) => prev + 1);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle personal info save (from PersonalInfoEditor)
  const handleSavePersonalInfo = async (data: {
    phone: string;
    address: string;
  }): Promise<void> => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: data.phone || "",
          address: data.address || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update personal information"
        );
      }

      // Refresh profile data from database
      await fetchUserProfile();
      setRefreshTrigger((prev) => prev + 1);

      // Notify other components
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (error) {
      console.error("Error saving personal information:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get current profile image URL from database
  const getProfileImageUrl = () => {
    if (!userProfile) {
      return defaultAvatar;
    }

    if (userProfile.profilePicture && userProfile.profilePicture !== "") {
      // Check if it's already a full URL
      if (userProfile.profilePicture.startsWith("http")) {
        // Add cache-busting timestamp
        const separator = userProfile.profilePicture.includes("?") ? "&" : "?";
        return `${userProfile.profilePicture}${separator}t=${Date.now()}`;
      }
      // If it's a relative path, prepend the backend URL with cache-busting
      return `http://localhost:5000${
        userProfile.profilePicture
      }?t=${Date.now()}`;
    }
    return defaultAvatar;
  };

  //Format phone number for display
  const formatPhoneNumber = (phone: string): string => {
    if (!phone || phone.trim() === "") {
      return "Not provided";
    }
    return phone;
  };

  // Format address for display
  const formatAddress = (address: string): string => {
    if (!address || address.trim() === "") {
      return "Not provided";
    }
    return address;
  };

  if (isLoading) {
    return (
      <div className="candidate-dashboard-container">
        <SideNavigation />
        <main className="candidate-main-content">
          <div className="loading-container">
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-dashboard-container">
        <SideNavigation />
        <main className="candidate-main-content">
          <div className="error-container">
            <p>Error: {error}</p>
            <button onClick={fetchUserProfile} className="retry-button">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="candidate-dashboard-container">
        <SideNavigation />
        <main className="candidate-main-content">
          <div className="error-container">
            <p>No profile data found</p>
            <button onClick={fetchUserProfile} className="retry-button">
              Refresh
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard-container">
      <SideNavigation />

      <main className="candidate-main-content">
        <header className="candidate-page-header">
          <h1>My Profile</h1>
          <button className="candidate-notification-btn">
            <img src={notificationIcon} alt="Notifications" />
          </button>
        </header>

        <div className="candidate-content-grid">
          {/* Profile Header Card */}
          <article className="candidate-profile-card">
            <div className="candidate-profile-main">
              <div className="candidate-profile-avatar">
                <img
                  src={getProfileImageUrl()}
                  alt={userProfile.fullName || "Profile Avatar"}
                  onError={(e) => {
                    // If image fails to load, show default avatar
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
              </div>
              <div className="candidate-profile-info">
                <div className="candidate-profile-name-row">
                  <h2>{userProfile.fullName || "User"}</h2>
                  <span className="candidate-badge-public">Public</span>
                </div>
                <div className="candidate-profile-connections">
                  <img src={connectionsIcon} alt="Connections Icons" />
                  <span className="candidate-blue-text">+144 Connections</span>
                </div>
                {userProfile.currentJobTitle && (
                  <div className="candidate-job-title">
                    <strong>{userProfile.currentJobTitle}</strong>
                  </div>
                )}
              </div>
            </div>
            <button
              className="candidate-edit-btn"
              onClick={handleEditProfilePicture}
            >
              <img src={editIcon} alt="Edit" />
            </button>
          </article>

          {/* Personal Information */}
          <article className="candidate-card">
            <div className="candidate-card-header">
              <h3>Personal Information</h3>
              <button
                className="candidate-edit-btn"
                onClick={handleEditPersonalInfo}
              >
                <img src={editIcon} alt="Edit" />
              </button>
            </div>
            <div className="candidate-info-grid">
              <div className="candidate-info-item">
                <div className="candidate-icon-box">
                  <img src={emailIcon} alt="Email" />
                </div>
                <div className="candidate-info-text">
                  <span className="candidate-label">Email</span>
                  <span className="candidate-value">
                    {userProfile.email || "No email provided"}
                  </span>
                </div>
              </div>
              <div className="candidate-info-item">
                <div className="candidate-icon-box">
                  <img src={phoneIcon} alt="Phone" />
                </div>
                <div className="candidate-info-text">
                  <span className="candidate-label">Phone Number</span>
                  <span className="candidate-value">
                    {formatPhoneNumber(userProfile.phone || "Not provided")}
                  </span>
                </div>
              </div>
              <div className="candidate-info-item">
                <div className="candidate-icon-box">
                  <img src={locationIcon} alt="Location" />
                </div>
                <div className="candidate-info-text">
                  <span className="candidate-label">Address</span>
                  <span className="candidate-value">
                    {formatAddress(userProfile.address || "Not provided")}
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* About */}
          <article className="candidate-card">
            <div className="candidate-card-header">
              <h3>About</h3>
              <button className="candidate-edit-btn">
                <img src={editIcon} alt="Edit" />
              </button>
            </div>
            <p className="candidate-description-text">
              {userProfile.about || "No about information provided."}
            </p>
          </article>

          {/* Resume */}
          <article className="candidate-card">
            <div className="candidate-card-header">
              <h3>Resume</h3>
              <button className="candidate-add-btn">
                <img src={addIcon} alt="Add" />
                <span>Add</span>
              </button>
            </div>
            <p className="candidate-description-text">
              The resume stands as the most crucial document that recruiters
              prioritize, often disregarding profiles lacking this essential
              component.
            </p>
          </article>

          {/* Experience */}
          <article className="candidate-card">
            <div className="candidate-card-header">
              <h3>Experience</h3>
              <button className="candidate-add-btn">
                <img src={addIcon2} alt="Add" />
                <span>Add</span>
              </button>
            </div>
            <p className="candidate-description-text">
              Outline your employment particulars encompassing both your present
              role and past professional experiences with previous companies.
            </p>
          </article>

          {/* Education */}
          <article className="candidate-card">
            <div className="candidate-card-header">
              <h3>Education</h3>
              <button className="candidate-add-btn">
                <img src={addIcon3} alt="Add" />
                <span>Add</span>
              </button>
            </div>
            <p className="candidate-description-text">
              Kindly provide information about your educational background,
              including details about your schooling, college attendance, and
              degrees earned. This will enhance the robustness of your profile.
            </p>
          </article>

          {/* Skills */}
          <article className="candidate-card">
            <div className="candidate-card-header">
              <h3>Skills</h3>
              <div className="candidate-actions">
                <button className="candidate-add-btn">
                  <img src={addIcon4} alt="Add" />
                  <span>Add</span>
                </button>
                <button className="candidate-edit-btn">
                  <img src={editIcon2} alt="Edit" />
                </button>
              </div>
            </div>
            <div className="candidate-tags">
              <span className="candidate-tag">UI/UX Design</span>
            </div>
          </article>

          {/* Certifications */}
          <article className="candidate-card">
            <div className="candidate-card-header">
              <h3>Certifications</h3>
              <div className="candidate-actions">
                <button className="candidate-add-btn">
                  <img src={addIcon5} alt="Add" />
                  <span>Add</span>
                </button>
                <button className="candidate-edit-btn">
                  <img src={editIcon3} alt="Edit" />
                </button>
              </div>
            </div>
            <div className="candidate-cert-list">
              <div className="candidate-cert-item">
                <h4>Design User Experiences with Figma</h4>
                <p className="candidate-sub-text">Linkedin Learning</p>
                <p className="candidate-meta-text">Issued Sep 2025</p>
                <p className="candidate-meta-text">
                  Credential ID
                  f295dad892424523cc3594795732975b67354as9936583759de25dd20797532
                </p>
                <button className="candidate-show-credential-btn">
                  <span>Show Credential</span>
                  <img src={arrowIcon} alt="Arrow" />
                </button>
              </div>
              <div className="candidate-cert-item">
                <h4>
                  Full Stack Development with JavaScript, React and Node
                  Certificate
                </h4>
                <p className="candidate-sub-text">Islington College</p>
                <p className="candidate-meta-text">Issued Sep 2025</p>
                <p className="candidate-meta-text">
                  Credential ID ICKCP4A23036128UFL
                </p>
                <button className="candidate-show-credential-btn">
                  <span>Show Credential</span>
                  <img src={arrowIcon} alt="Arrow" />
                </button>
              </div>
            </div>
          </article>

          {/* Project */}
          <article className="candidate-card">
            <div className="candidate-card-header">
              <h3>Project</h3>
              <div className="candidate-actions">
                <button className="candidate-add-btn">
                  <img src={addIcon6} alt="Add" />
                  <span>Add</span>
                </button>
                <button className="candidate-edit-btn">
                  <img src={editIcon4} alt="Edit" />
                </button>
              </div>
            </div>
            <div className="candidate-project-item">
              <img
                src={projectImage}
                alt="Project Thumbnail"
                className="candidate-project-img"
              />
              <div className="candidate-project-details">
                <h4>Mobile E-Wallet App Design</h4>
                <p className="candidate-date-range">12/9/2025 - 01/10/2025</p>
                <button className="candidate-show-credential-btn">
                  <span>Show Project</span>
                  <img src={arrowIcon} alt="Arrow" />
                </button>
                <p className="candidate-description-text-project">
                  A modern and intuitive E-wallet mobile app design featuring a
                  clean dashboard, quick money transfer options, secure payment
                  methods, expense tracking, and seamless QR-based transactions.
                  The interface focuses on simplicity, fast navigation, strong
                  security visuals, and a smooth user experience for managing
                  digital payments effortlessly.
                </p>
              </div>
            </div>
          </article>
        </div>
      </main>

      {/* Profile Picture Editor Modal */}
      <ProfilePictureEditor
        currentImage={getProfileImageUrl()}
        userName={userProfile.fullName}
        currentJobTitle={userProfile.currentJobTitle || ""}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveProfilePicture}
      />

      {/* Personal Information Editor Modal */}
      <PersonalInfoEditor
        userData={{
          email: userProfile.email,
          phone: userProfile.phone || "",
          address: userProfile.address || "",
        }}
        isOpen={isPersonalInfoEditorOpen}
        onClose={() => setIsPersonalInfoEditorOpen(false)}
        onSave={handleSavePersonalInfo}
      />
    </div>
  );
};

export default CandidateProfilePage;
