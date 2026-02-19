import React from "react";
import "../../styles/RecruiterTopBar.css";

// Import images
import searchIcon from "../../images/Recruiter Profile Page Images/search icon.svg";
import plusIcon from "../../images/Recruiter Profile Page Images/plus icon.svg";
import notificationsIcon from "../../images/Recruiter Profile Page Images/notification icon.svg";

interface RecruiterTopBarProps {
  onPostJob?: () => void;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

const RecruiterTopBar: React.FC<RecruiterTopBarProps> = ({
  onPostJob = () => {},
  onSearch = () => {},
  showSearch = false,
  searchPlaceholder = "Search candidates, jobs, or keywords...",
}) => {
  const handlePostJobClick = () => {
    onPostJob();
  };

  return (
    <header
      className={`recruiter-top-bar${showSearch ? " has-search" : ""}`}
    >
      {showSearch && (
        <div className="recruiter-search-container">
          <img src={searchIcon} alt="Search" className="recruiter-search-icon" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="recruiter-search-input"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}
      <div className="recruiter-top-actions">
        <button className="recruiter-btn-primary" onClick={handlePostJobClick}>
          <img src={plusIcon} alt="Plus" />
          <span>Post New Job</span>
        </button>
        <div className="recruiter-icon-group">
          <button className="recruiter-icon-btn">
            <img src={notificationsIcon} alt="Notifications" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default RecruiterTopBar;
