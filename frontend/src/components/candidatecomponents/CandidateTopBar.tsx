import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/CandidateTopBar.css";

// Icons (reuse admin-style assets for consistency)
import searchIcon from "../../images/Admin Profile Page Images/4_80.svg";
import jobsIcon from "../../images/Admin Profile Page Images/4_65.svg";
import homeIcon from "../../images/Admin Profile Page Images/4_70.svg";
import notificationsIcon from "../../images/Admin Profile Page Images/4_75.svg";

interface CandidateTopBarProps {
  onSearch?: (query: string) => void;
}

const CandidateTopBar: React.FC<CandidateTopBarProps> = ({ onSearch = () => {} }) => {
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <header className="candidate-top-bar">
      <div className="candidate-search-container">
        <div className="candidate-search-input-wrapper">
          <input
            type="text"
            placeholder="Search candidates, jobs, or keywords.."
            className="candidate-search-input"
            onChange={handleSearchChange}
          />
          <img src={searchIcon} alt="Search" className="candidate-search-icon" />
        </div>
      </div>
      <div className="candidate-header-actions">
        <button
          className="candidate-action-btn"
          type="button"
          onClick={() => navigate("/jobs")}
        >
          <img src={jobsIcon} alt="Jobs" />
        </button>
        <button className="candidate-action-btn">
          <img src={homeIcon} alt="Home" />
        </button>
        <button className="candidate-action-btn">
          <img src={notificationsIcon} alt="Notifications" />
        </button>
      </div>
    </header>
  );
};

export default CandidateTopBar;
