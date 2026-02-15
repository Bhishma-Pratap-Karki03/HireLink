import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

// Import images
import logoImg from "../images/Register Page Images/Logo.png";
import dropdownArrow from "../images/Register Page Images/1_2307.svg";
import applyDot from "../images/Register Page Images/1_2315.svg";
import menuIcon from "../images/Register Page Images/menu.png";
import bookmarkIcon from "../images/Register Page Images/281_1325.svg";
import notificationIcon from "../images/Register Page Images/281_1327.svg";
import defaultAvatar from "../images/Register Page Images/Default Profile.webp";
import dashboardIcon from "../images/Register Page Images/Dashboard.png";
import profileIcon from "../images/Register Page Images/My Profile.png";
import logoutIcon from "../images/Register Page Images/Log Out.png";

interface NavbarProps {
  isAuthenticated?: boolean;
  userType?: "candidate" | "recruiter" | "admin";
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profilePicture?: string;
  currentJobTitle?: string;
  phone?: string;
  address?: string;
}

const Navbar = ({ userType = "candidate" }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileUserDropdownOpen, setIsMobileUserDropdownOpen] =
    useState(false);
  const [profileImage, setProfileImage] = useState<string>(defaultAvatar);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileUserDropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Fetch user data from backend
  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setIsAuthenticated(false);
      setUserData(null);
      setUserName("");
      setProfileImage(defaultAvatar);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/profile/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setIsAuthenticated(true);

        // IMPORTANT: Check if this is the admin email and update role
        const isAdminEmail = data.user.email === "hirelinknp@gmail.com";
        if (isAdminEmail) {
          // Update userData with admin role
          const updatedUserData = {
            ...data.user,
            role: "admin", // Force admin role for admin email
          };
          setUserData(updatedUserData);

          // Update localStorage with admin role
          const minimalUserData = {
            id: data.user.id,
            fullName: data.user.fullName,
            email: data.user.email,
            role: "admin", // Store as admin
          };
          localStorage.setItem("userData", JSON.stringify(minimalUserData));
        } else {
          // For non-admin users
          const minimalUserData = {
            id: data.user.id,
            fullName: data.user.fullName,
            email: data.user.email,
            role: data.user.role,
          };
          localStorage.setItem("userData", JSON.stringify(minimalUserData));
        }

        // Set user name - prioritize fullName, fallback to email
        if (data.user.fullName) {
          setUserName(data.user.fullName);
        } else if (data.user.email) {
          setUserName(data.user.email.split("@")[0]);
        } else {
          setUserName("User");
        }

        // Set profile picture from database
        if (data.user.profilePicture && data.user.profilePicture !== "") {
          if (data.user.profilePicture.startsWith("http")) {
            setProfileImage(data.user.profilePicture);
          } else {
            setProfileImage(`http://localhost:5000${data.user.profilePicture}`);
          }
        } else {
          // Use default avatar for users without profile picture
          setProfileImage(defaultAvatar);
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setIsAuthenticated(false);
        setUserData(null);
        setUserName("");
        setProfileImage(defaultAvatar);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuthenticated(false);
      setUserData(null);
      setUserName("");
      setProfileImage(defaultAvatar);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Set up interval to refresh user data (increased to 5 minutes to prevent overload)
    const intervalId = setInterval(() => {
      const token = localStorage.getItem("authToken");
      if (token) {
        fetchUserData();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array - FIXED: prevents infinite loop

  // Check authentication on initial load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchUserData();
    } else {
      setIsAuthenticated(false);
      setUserData(null);
      setUserName("");
      setProfileImage(defaultAvatar);
    }
  }, []);

  // Listen for profile update events
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  // Check if user is admin by email
  const isAdminUser = userData?.email === "hirelinknp@gmail.com";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileUserDropdownOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileUserDropdownOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  const toggleMobileUserDropdown = () => {
    setIsMobileUserDropdownOpen((prev) => !prev);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle desktop user dropdown
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }

      // Handle mobile user dropdown
      if (
        mobileUserDropdownRef.current &&
        !mobileUserDropdownRef.current.contains(event.target as Node) &&
        isMobileMenuOpen
      ) {
        setIsMobileUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("profilePictureBase64");
    localStorage.removeItem("profilePictureFileName");

    // Update state
    setIsAuthenticated(false);
    setUserName("");
    setUserData(null);
    setProfileImage(defaultAvatar);
    setIsMobileUserDropdownOpen(false);
    setIsUserMenuOpen(false);

    console.log("Logging out...");
    closeMobileMenu();

    // Redirect to login page
    navigate("/login");

    // Force a small delay and refresh to clear all state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleDashboardClick = () => {
    // Navigate to appropriate dashboard based on user role
    if (userData) {
      // Check if admin by email (primary check)
      if (isAdminUser) {
        navigate("/admin-dashboard");
      } else if (userData.role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else {
        navigate("/candidate-dashboard");
      }
    } else {
      // Fallback to candidate dashboard if no user data
      navigate("/candidate-dashboard");
    }
    closeMobileMenu();
    setIsUserMenuOpen(false);
    setIsMobileUserDropdownOpen(false);
  };

  const handleProfileClick = () => {
    // Navigate to profile page based on role
    if (userData) {
      // Check if admin by email (primary check)
      if (isAdminUser) {
        navigate("/admin-profile");
      } else if (userData.role === "candidate") {
        navigate("/candidate-profile");
      } else if (userData.role === "recruiter") {
        navigate("/recruiter-profile");
      }
    } else {
      // Fallback to candidate profile if no user data
      navigate("/candidate-profile");
    }
    setIsUserMenuOpen(false);
    setIsMobileUserDropdownOpen(false);
    closeMobileMenu();
  };

  const handleSavedJobsClick = () => {
    if (isCandidate && !isAdminUser) {
      navigate("/candidate/saved-jobs");
    }
    closeMobileMenu();
    setIsUserMenuOpen(false);
    setIsMobileUserDropdownOpen(false);
  };

  // Determine if user is recruiter
  const isRecruiter = userData?.role === "recruiter";
  const isCandidate = userData?.role === "candidate";

  // Render authenticated actions - only for candidate role
  const renderAuthenticatedActions = () => {
    // Only show notification/bookmark for candidates (not for admin or recruiters)
    const showCandidateIcons = isCandidate && !isAdminUser;

    return (
      <>
        {showCandidateIcons && (
          <>
            <button
              className="action-icon"
              title="Saved Jobs"
              onClick={handleSavedJobsClick}
            >
              <img src={bookmarkIcon} alt="Bookmark" />
            </button>
            <button className="action-icon" title="Notifications">
              <img src={notificationIcon} alt="Notifications" />
            </button>
          </>
        )}
        <div className="user-profile-wrapper" ref={userMenuRef}>
          <div
            className="user-profile"
            onClick={toggleUserMenu}
            style={{ cursor: "pointer" }}
          >
            <div
              className={`avatar-wrapper ${
                isRecruiter ? "recruiter-avatar" : "candidate-avatar"
              }`}
            >
              <img
                src={profileImage}
                alt={userName}
                className="avatar-image"
                onError={(e) => {
                  // If image fails to load, show default avatar
                  e.currentTarget.src = defaultAvatar;
                }}
              />
            </div>
            <span className="user-name">
              {userName}{" "}
              <img
                src={dropdownArrow}
                alt="Menu"
                className={`user-dropdown-arrow ${
                  isUserMenuOpen ? "open" : ""
                }`}
              />
            </span>
          </div>

          {isUserMenuOpen && (
            <div className="user-dropdown">
              <button
                className="user-dropdown-item"
                onClick={handleDashboardClick}
              >
                <img src={dashboardIcon} alt="Dashboard" />
                <span>Dashboard</span>
              </button>
              <button
                className="user-dropdown-item"
                onClick={handleProfileClick}
              >
                <img src={profileIcon} alt="My Profile" />
                <span>My Profile</span>
              </button>
              <button className="user-dropdown-item" onClick={handleLogout}>
                <img src={logoutIcon} alt="Log Out" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderUnauthenticatedActions = () => (
    <>
      <a href="#" className="apply-now-link">
        <img src={applyDot} alt="" className="apply-dot" />
        Apply Now
      </a>
      <Link to="/register" className="btn btn-primary">
        Register/Login
      </Link>
    </>
  );

  // Render mobile authenticated actions with dropdown
  const renderMobileAuthenticatedActions = () => {
    const showCandidateIcons = isCandidate && !isAdminUser;

    return (
      <>
        {showCandidateIcons && (
          <>
            <li>
              <button
                type="button"
                className="mobile-action-icon"
                onClick={handleSavedJobsClick}
              >
                <img src={bookmarkIcon} alt="Bookmark" />
                Bookmarks
              </button>
            </li>
            <li>
              <a
                href="#"
                className="mobile-action-icon"
                onClick={closeMobileMenu}
              >
                <img src={notificationIcon} alt="Notifications" />
                Notifications
              </a>
            </li>
          </>
        )}
        <li>
          <div
            className="mobile-user-profile-wrapper"
            ref={mobileUserDropdownRef}
          >
            <div
              className="mobile-user-profile"
              onClick={toggleMobileUserDropdown}
            >
              <div
                className={`avatar-wrapper ${
                  isRecruiter ? "recruiter-avatar" : "candidate-avatar"
                }`}
              >
                <img
                  src={profileImage}
                  alt={userName}
                  className="avatar-image"
                  onError={(e) => {
                    // If image fails to load, show default avatar
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
              </div>
              <span className="mobile-user-name">
                {userName}{" "}
                <img
                  src={dropdownArrow}
                  alt="Menu"
                  className={`mobile-dropdown-arrow ${
                    isMobileUserDropdownOpen ? "open" : ""
                  }`}
                />
              </span>
            </div>

            {isMobileUserDropdownOpen && (
              <div className="mobile-user-dropdown">
                <button
                  className="mobile-dropdown-item"
                  onClick={() => {
                    handleDashboardClick();
                  }}
                >
                  <img src={dashboardIcon} alt="Dashboard" />
                  <span>Dashboard</span>
                </button>
                <button
                  className="mobile-dropdown-item"
                  onClick={() => {
                    handleProfileClick();
                  }}
                >
                  <img src={profileIcon} alt="My Profile" />
                  <span>My Profile</span>
                </button>
                <button
                  className="mobile-dropdown-item logout"
                  onClick={handleLogout}
                >
                  <img src={logoutIcon} alt="Log Out" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </li>
      </>
    );
  };

  const renderMobileUnauthenticatedActions = () => (
    <>
      <li>
        <a href="#" className="mobile-apply-now" onClick={closeMobileMenu}>
          <img src={applyDot} alt="" className="apply-dot" />
          Apply Now
        </a>
      </li>
      <li>
        <Link
          to="/register"
          className="btn btn-primary mobile-register-btn"
          onClick={closeMobileMenu}
        >
          Register/Login
        </Link>
      </li>
    </>
  );

  return (
    <header className="site-header">
      <div className="container header-container">
        <Link
          to={isAuthenticated ? "/" : "/login"}
          className="logo-link"
          onClick={(e) => {
            if (isAuthenticated) {
              e.preventDefault();
              // Navigate to appropriate home page
              if (userData) {
                // Check if admin by email (primary check)
                if (isAdminUser) {
                  navigate("/admin-home");
                } else if (userData.role === "recruiter") {
                  navigate("/recruiter-home");
                } else {
                  navigate("/candidate-home");
                }
              }
            }
          }}
        >
          <img src={logoImg} alt="HireLink Logo" className="logo-img" />
        </Link>
        <nav className="main-navigation">
          <ul>
            <li>
              <a href="#">
                Home <img src={dropdownArrow} alt="dropdown arrow" />
              </a>
            </li>
            <li>
              <Link to="/jobs">
                Browse Jobs <img src={dropdownArrow} alt="dropdown arrow" />
              </Link>
            </li>
            <li>
              <a href="/employers">
                Employers <img src={dropdownArrow} alt="dropdown arrow" />
              </a>
            </li>
            <li>
              <Link to="/candidates">
                Candidates <img src={dropdownArrow} alt="dropdown arrow" />
              </Link>
            </li>
            {isCandidate && !isAdminUser && (
              <li>
                <Link to="/assessments">
                  Quiz/Assessment{" "}
                  <img src={dropdownArrow} alt="dropdown arrow" />
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="header-actions">
          {isAuthenticated
            ? renderAuthenticatedActions()
            : renderUnauthenticatedActions()}
        </div>
        <button
          className="mobile-nav-toggle"
          aria-label="Toggle navigation"
          onClick={toggleMobileMenu}
        >
          <img src={menuIcon} alt="Menu" className="menu-icon" />
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
      ></div>
      <nav className={`mobile-navigation ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <h3>Menu</h3>
          <button
            className="mobile-menu-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <ul className="mobile-menu-list">
          <li>
            <a href="#" onClick={closeMobileMenu}>
              Home <img src={dropdownArrow} alt="dropdown arrow" />
            </a>
          </li>
          <li>
            <Link to="/jobs" onClick={closeMobileMenu}>
              Browse Jobs <img src={dropdownArrow} alt="dropdown arrow" />
            </Link>
          </li>
          <li>
            <a href="/employers" onClick={closeMobileMenu}>
              Employers <img src={dropdownArrow} alt="dropdown arrow" />
            </a>
          </li>
          <li>
            <Link to="/candidates" onClick={closeMobileMenu}>
              Candidates <img src={dropdownArrow} alt="dropdown arrow" />
            </Link>
          </li>
          {isCandidate && !isAdminUser && (
            <li>
              <Link to="/assessments" onClick={closeMobileMenu}>
                Quiz/Assessment{" "}
                <img src={dropdownArrow} alt="dropdown arrow" />
              </Link>
            </li>
          )}

          {isAuthenticated
            ? renderMobileAuthenticatedActions()
            : renderMobileUnauthenticatedActions()}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
