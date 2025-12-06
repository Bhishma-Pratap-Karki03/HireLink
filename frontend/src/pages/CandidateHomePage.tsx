import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CandidateHomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Candidate Home Page</h1>
      <p>Welcome to your Home Page</p>
      <button
        onClick={() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default CandidateHomePage;
