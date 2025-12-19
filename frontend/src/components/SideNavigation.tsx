import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/SideNavigation.css";

// Import images
import logoImg from "../images/Register Page Images/Logo.png";
import avatarBg from "../images/Candidate Profile Page Images/261_1901.svg";
import connectionsImg from "../images/Candidate Profile Page Images/261_1956.svg";
import dashboardIcon from "../images/Candidate Profile Page Images/261_1905.svg";
import profileIcon from "../images/Candidate Profile Page Images/My Profile.png";
import resumeIcon from "../images/Candidate Profile Page Images/261_1918.svg";
import messagesIcon from "../images/Candidate Profile Page Images/261_1924.svg";
import jobAlertsIcon from "../images/Candidate Profile Page Images/261_1929.svg";
import savedJobIcon from "../images/Candidate Profile Page Images/261_1935.svg";
import settingsIcon from "../images/Candidate Profile Page Images/261_1942.svg";
import defaultAvatar from "../images/Register Page Images/Default Profile.webp";

interface SideNavigationProps {
  connectionsCount?: number;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profilePicture?: string;
  currentJobTitle?: string;
}

const SideNavigation: React.FC<SideNavigationProps> = ({
  connectionsCount = 144,
}) => {
  const [userName, setUserName] = useState<string>("User");
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
          setUserName("User");
        }

        // Set profile picture from database
        if (data.user.profilePicture && data.user.profilePicture !== "") {
          if (data.user.profilePicture.startsWith("http")) {
            // Add cache-busting timestamp to prevent caching
            const separator = data.user.profilePicture.includes("?")
              ? "&"
              : "?";
            setProfileImage(
              `${data.user.profilePicture}${separator}t=${Date.now()}`
            );
          } else {
            // Add cache-busting timestamp to prevent caching
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

  const navItems = [
    {
      id: "dashboard",
      path: "/candidate-home",
      label: "Dashboard",
      icon: dashboardIcon,
    },
    {
      id: "profile",
      path: "/candidate-profile",
      label: "My Profile",
      icon: profileIcon,
    },
    {
      id: "resume",
      path: "/resume",
      label: "Resume",
      icon: resumeIcon,
    },
    {
      id: "messages",
      path: "/messages",
      label: "Messages",
      icon: messagesIcon,
    },
    {
      id: "job-alerts",
      path: "/job-alerts",
      label: "Job Alerts",
      icon: jobAlertsIcon,
    },
    {
      id: "saved-jobs",
      path: "/saved-jobs",
      label: "Saved Job",
      icon: savedJobIcon,
    },
    {
      id: "settings",
      path: "/settings",
      label: "Settings",
      icon: settingsIcon,
    },
  ];

  if (isLoading) {
    return (
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logoImg} alt="HireLink Logo" className="logo" />
        </div>
        <div className="loading-sidebar">
          <p>Loading...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logoImg} alt="HireLink Logo" className="logo" />
      </div>

      <div className="user-summary">
        <div className="avatar-container">
          <img
            src={profileImage}
            alt={`${userName}'s profile`}
            className="user-avatar"
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
          />
        </div>
        <h3 className="user-name">{userName}</h3>
        {userData?.currentJobTitle && (
          <p className="user-job-title">{userData.currentJobTitle}</p>
        )}
        <div className="connections">
          <div className="connections-avatars">
            <img src={connectionsImg} alt="Connections" />
          </div>
          <span className="connections-text">
            +{connectionsCount} Connections
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <img src={item.icon} alt={item.label} className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SideNavigation;
