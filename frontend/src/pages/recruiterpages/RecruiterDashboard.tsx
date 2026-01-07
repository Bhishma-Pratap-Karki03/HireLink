import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import "../../styles/RecruiterDashboard.css";

const RecruiterDashboard = () => {
  const navigate = useNavigate();

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
          if (userData.role === "candidate") {
            navigate("/candidate-dashboard");
          } else if (userData.role === "admin") {
            navigate("/admin-dashboard");
          }
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
  };

  return (
    <div className="recruiter-dashboard-page-container">
      <div className="recruiter-dashboard-layout">
        <RecruiterSidebar />

        <div className="recruiter-dashboard-main-area">
          <div className="recruiter-dashboard-topbar-wrapper">
            <RecruiterTopBar
              onPostJob={handlePostJob}
              onSearch={handleSearch}
            />
          </div>

          <div className="recruiter-dashboard-scrollable-content">
            <div className="recruiter-dashboard-content-wrapper">
              <h1>Recruiter Dashboard</h1>
              <p>Welcome to your Recruitment Dashboard!</p>

              {/* Your dashboard content here */}
              <div style={{ marginTop: "30px" }}>
                <button
                  onClick={() => navigate("/recruiter-profile")}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  Edit Company Profile
                </button>
                <button
                  onClick={() => navigate("/recruiter/job-postings")}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Post New Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
