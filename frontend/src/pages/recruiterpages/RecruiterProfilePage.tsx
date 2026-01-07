import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import "../../styles/RecruiterProfilePage.css";

// Import images for recruiter profile page
import uploadIcon from "../../images/Recruiter Profile Page Images/6_10.svg";
import cameraIcon from "../../images/Recruiter Profile Page Images/6_21.svg";
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

const RecruiterProfilePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Check if user is actually a recruiter
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

  const handlePostJob = () => {
    navigate("/recruiter/job-postings");
  };

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // Implement search functionality
  };

  return (
    <div className="recruiter-profile-page-container">
      {/* Removed Navbar component */}

      <div className="recruiter-profile-layout">
        {/* Recruiter Sidebar - Fixed position */}
        <RecruiterSidebar />

        {/* Main Content Area */}
        <div className="recruiter-profile-main-area">
          {/* Top Bar - Fixed position */}
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

              {/* Logo Card */}
              <div className="recruiter-profile-card recruiter-profile-logo-card">
                <div className="recruiter-profile-logo-placeholder">
                  <img src={uploadIcon} alt="Upload Icon" />
                </div>
                <div className="recruiter-profile-logo-info">
                  <h3>Company Logo</h3>
                  <p>
                    This logo will be displayed on your company profile, job
                    posts and search results. Use a high-quality square image
                  </p>
                  <div className="recruiter-profile-logo-actions">
                    <button className="recruiter-profile-btn-outline">
                      <img src={cameraIcon} alt="Camera" />
                      <span>Upload New Logo</span>
                    </button>
                    <button className="recruiter-profile-btn-text-danger">
                      Remove
                    </button>
                  </div>
                  <div className="recruiter-profile-logo-hint">
                    <img src={infoIcon} alt="Info" />
                    <span>Recommended: 400*400px (JPG,PNG). Max Size 2MB</span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="recruiter-profile-info-grid">
                {/* Left Column */}
                <div className="recruiter-profile-grid-column">
                  {/* Basic Information */}
                  <div className="recruiter-profile-card">
                    <div className="recruiter-profile-card-header">
                      <h3>Basic Information</h3>
                      <img
                        src={editIcon1}
                        alt="Edit"
                        className="recruiter-profile-edit-icon"
                      />
                    </div>
                    <div className="recruiter-profile-form-group">
                      <div className="recruiter-profile-input-wrapper">
                        <img src={companyIcon} alt="Company" />
                        <label>Company Name</label>
                      </div>
                      <input
                        type="text"
                        value="Excel Development Bank"
                        className="recruiter-profile-form-input"
                      />
                    </div>
                    <div className="recruiter-profile-form-row">
                      <div className="recruiter-profile-form-group half">
                        <div className="recruiter-profile-input-wrapper">
                          <img src={locationIcon} alt="Location" />
                          <label>Location</label>
                        </div>
                        <input
                          type="text"
                          value="Old Baneshwor, Kathmandu"
                          className="recruiter-profile-form-input"
                        />
                      </div>
                      <div className="recruiter-profile-form-group half">
                        <div className="recruiter-profile-input-wrapper">
                          <img src={sizeIcon} alt="Size" />
                          <label>Company Size</label>
                        </div>
                        <input
                          type="text"
                          value="400-500"
                          className="recruiter-profile-form-input"
                        />
                      </div>
                    </div>
                    <div className="recruiter-profile-form-row">
                      <div className="recruiter-profile-form-group half">
                        <div className="recruiter-profile-input-wrapper">
                          <img src={emailIcon} alt="Email" />
                          <label>Company Email</label>
                        </div>
                        <input
                          type="text"
                          value="excel@devbank.com"
                          className="recruiter-profile-form-input"
                        />
                      </div>
                      <div className="recruiter-profile-form-group half">
                        <div className="recruiter-profile-input-wrapper">
                          <img src={foundedIcon} alt="Founded" />
                          <label>Founded Year</label>
                        </div>
                        <input
                          type="text"
                          value="2015"
                          className="recruiter-profile-form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* About Company */}
                  <div className="recruiter-profile-card">
                    <div className="recruiter-profile-card-header">
                      <h3>About Company</h3>
                      <img
                        src={editIcon3}
                        alt="Edit"
                        className="recruiter-profile-edit-icon"
                      />
                    </div>
                    <p className="recruiter-profile-about-text">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                      Debitis illum fuga eveniet. Deleniti asperiores, commodi
                      quae ipsum quas est itaque, ipsa, dolore beatae voluptates
                      nemo blanditiis iste eius officia minus. Lorem ipsum dolor
                      sit amet, consectetur adipisicing elit. Debitis illum fuga
                      eveniet.
                      <br />
                      <br />
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                      Debitis illum fuga eveniet. Deleniti asperiores, commodi
                      quae ipsum quas est itaque, ipsa, dolore beatae voluptates
                      nemo blanditiis iste eius officia
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="recruiter-profile-grid-column">
                  {/* Website and Contacts */}
                  <div className="recruiter-profile-card">
                    <div className="recruiter-profile-card-header">
                      <h3>Website and Contacts</h3>
                      <img
                        src={editIcon2}
                        alt="Edit"
                        className="recruiter-profile-edit-icon"
                      />
                    </div>
                    <div className="recruiter-profile-form-group">
                      <div className="recruiter-profile-input-wrapper">
                        <img src={websiteIcon} alt="Website" />
                        <label>Website URL</label>
                      </div>
                      <input
                        type="text"
                        value="www.exceldevbank.com"
                        className="recruiter-profile-form-input"
                      />
                    </div>
                    <div className="recruiter-profile-form-group">
                      <div className="recruiter-profile-input-wrapper">
                        <img src={linkedinIcon} alt="LinkedIn" />
                        <label>LinkedIn URL</label>
                      </div>
                      <input
                        type="text"
                        value="linkedin.com/company/excel-dev-bank"
                        className="recruiter-profile-form-input"
                      />
                    </div>
                    <div className="recruiter-profile-form-group">
                      <div className="recruiter-profile-input-wrapper">
                        <img src={instagramIcon} alt="Instagram" />
                        <label>Instagram URL</label>
                      </div>
                      <input
                        type="text"
                        value="instagram.com/exceldevbank"
                        className="recruiter-profile-form-input"
                      />
                    </div>
                    <div className="recruiter-profile-form-group">
                      <div className="recruiter-profile-input-wrapper">
                        <img src={facebookIcon} alt="Facebook" />
                        <label>Facebook URL</label>
                      </div>
                      <input
                        type="text"
                        value="facebook.com/exceldevbank"
                        className="recruiter-profile-form-input"
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
                      />
                    </div>
                    <div className="recruiter-profile-gallery-grid">
                      <img
                        src={gallery1}
                        alt="Gallery 1"
                        className="recruiter-profile-gallery-img"
                      />
                      <img
                        src={gallery2}
                        alt="Gallery 2"
                        className="recruiter-profile-gallery-img"
                      />
                      <img
                        src={gallery1}
                        alt="Gallery 3"
                        className="recruiter-profile-gallery-img"
                      />
                      <div className="recruiter-profile-upload-box">
                        <img src={uploadGalleryIcon} alt="Upload" />
                        <span>Upload</span>
                      </div>
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
    </div>
  );
};

export default RecruiterProfilePage;
