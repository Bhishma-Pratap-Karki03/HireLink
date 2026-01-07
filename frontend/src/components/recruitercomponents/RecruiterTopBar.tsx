import React from "react";
import "../../styles/RecruiterTopBar.css";

// Import images
import searchIcon from "../../images/Recruiter Profile Page Images/6_301.svg";
import plusIcon from "../../images/Recruiter Profile Page Images/6_281.svg";
import notificationsIcon from "../../images/Recruiter Profile Page Images/6_296.svg";

interface RecruiterTopBarProps {
  onPostJob?: () => void;
  onSearch?: (query: string) => void;
}

const RecruiterTopBar: React.FC<RecruiterTopBarProps> = ({
  onPostJob = () => {},
  onSearch = () => {},
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handlePostJobClick = () => {
    onPostJob();
  };

  return (
    <header className="recruiter-top-bar">
      <div className="recruiter-search-container">
        <img src={searchIcon} alt="Search" className="recruiter-search-icon" />
        <input
          type="text"
          placeholder="Search candidates, jobs, or keywords..."
          className="recruiter-search-input"
          onChange={handleSearchChange}
        />
      </div>
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
