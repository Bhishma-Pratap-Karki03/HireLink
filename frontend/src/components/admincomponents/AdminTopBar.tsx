import React from "react";
import "../../styles/AdminTopBar.css";

// Import images
import searchIcon from "../../images/Admin Profile Page Images/4_80.svg";
import jobsIcon from "../../images/Admin Profile Page Images/4_65.svg";
import homeIcon from "../../images/Admin Profile Page Images/4_70.svg";
import notificationsIcon from "../../images/Admin Profile Page Images/4_75.svg";

interface AdminTopBarProps {
  onSearch?: (query: string) => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ onSearch = () => {} }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <header className="admin-top-bar">
      <div className="admin-search-container">
        <div className="admin-search-input-wrapper">
          <input
            type="text"
            placeholder="Search candidates, jobs, or keywords.."
            className="admin-search-input"
            onChange={handleSearchChange}
          />
          <img src={searchIcon} alt="Search" className="admin-search-icon" />
        </div>
      </div>
      <div className="admin-header-actions">
        <button className="admin-action-btn">
          <img src={jobsIcon} alt="Jobs" />
        </button>
        <button className="admin-action-btn">
          <img src={homeIcon} alt="Home" />
        </button>
        <button className="admin-action-btn">
          <img src={notificationsIcon} alt="Notifications" />
        </button>
      </div>
    </header>
  );
};

export default AdminTopBar;
