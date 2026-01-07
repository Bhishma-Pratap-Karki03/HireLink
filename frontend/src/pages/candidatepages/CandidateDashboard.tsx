import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "../../components/candidatecomponents/CandidateSidebar";

const CandidateDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="candidate-dashboard-container">
      <CandidateSidebar />
      <main className="candidate-main-content">
        <div style={{ padding: "20px" }}>
          <h1>Candidate Dashboard</h1>
          <p>Welcome to your Candidate Dashboard!</p>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => navigate("/candidate-profile")}
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
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/candidate/resume")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Update Resume
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
