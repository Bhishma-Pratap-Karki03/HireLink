import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/RecruiterSidebar.css";

// Import images
import logoImg from "../../images/Register Page Images/Logo.png";
import defaultAvatar from "../../images/Register Page Images/Default Profile.webp";
import connectionsImg from "../../images/Candidate Profile Page Images/261_1956.svg";
import dashboardIcon from "../../images/Candidate Profile Page Images/261_1905.svg";
import profileIcon from "../../images/Candidate Profile Page Images/My Profile.png";
import jobPostingsIcon from "../../images/Recruiter Profile Page Images/6_312.svg";
import messagesIcon from "../../images/Recruiter Profile Page Images/6_317.svg";
import candidatesIcon from "../../images/Recruiter Profile Page Images/6_323.svg";
import scannerIcon from "../../images/Recruiter Profile Page Images/6_329.svg";
import settingsIcon from "../../images/Recruiter Profile Page Images/6_335.svg";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profilePicture?: string;
  // Remove currentJobTitle from interface if not needed elsewhere
}

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: string;
}

interface RecruiterSidebarProps {
  connectionsCount?: number;
}

const RecruiterSidebar: React.FC<RecruiterSidebarProps> = ({
  connectionsCount = 144,
}) => {
  const [userName, setUserName] = useState<string>("Recruiter");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileImage, setProfileImage] = useState<string>(defaultAvatar);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user data from backend
  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
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

        if (data.user.fullName) {
          setUserName(data.user.fullName);
        } else if (data.user.email) {
          setUserName(data.user.email.split("@")[0]);
        } else {
          setUserName("Recruiter");
        }

        // Set profile picture from database
        if (data.user.profilePicture && data.user.profilePicture !== "") {
          if (data.user.profilePicture.startsWith("http")) {
            const separator = data.user.profilePicture.includes("?")
              ? "&"
              : "?";
            setProfileImage(
              `${data.user.profilePicture}${separator}t=${Date.now()}`
            );
          } else {
            setProfileImage(
              `http://localhost:5000${data.user.profilePicture}?t=${Date.now()}`
            );
          }
        } else {
          setProfileImage(defaultAvatar);
        }
      } else if (response.status === 401) {
        // Token expired
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Set up interval to refresh user data periodically
    const intervalId = setInterval(() => {
      const token = localStorage.getItem("authToken");
      if (token) {
        fetchUserData();
      }
    }, 120000); // Refresh every 2 minutes

    return () => clearInterval(intervalId);
  }, [navigate]);

  // Listen for profile update events
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [navigate]);

  // Determine if user is recruiter
  const isRecruiter = userData?.role === "recruiter";

  // Recruiter navigation items
  const navItems: NavItem[] = [
    {
      id: "dashboard",
      path: "/recruiter-dashboard",
      label: "Dashboard",
      icon: dashboardIcon,
    },
    {
      id: "profile",
      path: "/recruiter-profile",
      label: "Company Profile",
      icon: profileIcon,
    },
    {
      id: "job-postings",
      path: "/recruiter/job-postings",
      label: "Job Postings",
      icon: jobPostingsIcon,
    },
    {
      id: "messages",
      path: "/recruiter/messages",
      label: "Messages",
      icon: messagesIcon,
    },
    {
      id: "candidates",
      path: "/recruiter/candidates",
      label: "Candidates",
      icon: candidatesIcon,
    },
    {
      id: "scanner",
      path: "/recruiter/scanner",
      label: "Scanner",
      icon: scannerIcon,
    },
    {
      id: "settings",
      path: "/recruiter/settings",
      label: "Settings",
      icon: settingsIcon,
    },
  ];

  // Handle logo click - redirect to recruiter home
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/recruiter-home");
  };

  if (isLoading) {
    return (
      <aside className="recruiter-sidebar">
        <div className="recruiter-sidebar-header">
          <Link
            to="#"
            onClick={handleLogoClick}
            style={{ display: "inline-block", textDecoration: "none" }}
          >
            <img src={logoImg} alt="HireLink Logo" className="recruiter-logo" />
          </Link>
        </div>
        <div className="loading-sidebar">
          <p>Loading...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="recruiter-sidebar">
      <div className="recruiter-sidebar-header">
        <Link
          to="#"
          onClick={handleLogoClick}
          style={{ display: "inline-block", textDecoration: "none" }}
        >
          <img src={logoImg} alt="HireLink Logo" className="recruiter-logo" />
        </Link>
      </div>

      <div className="recruiter-user-summary">
        <div
          className={`recruiter-avatar-container ${
            isRecruiter
              ? "recruiter-logo-container"
              : "candidate-avatar-container"
          }`}
        >
          <img
            src={profileImage}
            alt={`${userName}'s company logo`}
            className={`recruiter-user-avatar ${
              isRecruiter ? "recruiter-logo" : "candidate-avatar"
            }`}
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
          />
        </div>
        <h3 className="recruiter-user-name">{userName}</h3>

        {/* REMOVED currentJobTitle display */}

        {/* Show connections count for recruiters */}
        {userData?.role === "recruiter" && (
          <div className="recruiter-connections">
            <div className="recruiter-connections-avatars">
              <img src={connectionsImg} alt="Connections" />
            </div>
            <span className="recruiter-connections-text">
              +{connectionsCount} Connections
            </span>
          </div>
        )}
      </div>

      <nav className="recruiter-sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`recruiter-nav-item ${isActive ? "active" : ""}`}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="recruiter-nav-icon"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default RecruiterSidebar;
